import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ClienteHttpFetch } from "../adaptadores/clienteHttp.ts";
import { SegredoSsm } from "../adaptadores/segredoSsm.ts";
import type { EstadoVerificacao } from "../dominio/tipos.ts";
import { AMBIENTE_DE_EXEMPLO, semAVariavel } from "../testes/ambiente.ts";
import { capturarConsole } from "../testes/console.ts";
import {
    ClienteHttpFalso,
    NotificadorFalso,
    RelogioFalso,
    RepositorioEmMemoria,
    SegredoFalso,
} from "../testes/falsos.ts";
import { executarFrequente, montarFrequente } from "./frequente.ts";

const URLS = {
    site: "https://ensinadev.com.br/",
    api: "https://ensinadev.com.br/api/health",
    dependencias: "https://ensinadev.com.br/api/health/dependencias",
};
const TOKEN = "token-do-monitor-que-nao-pode-vazar";
const SAUDAVEL = {
    banco: { situacao: "ok", latenciaMs: 4 },
    whatsapp: { situacao: "ok", estado: "open" },
    disco: { situacao: "ok", usoPercentual: 34 },
    labs: { situacao: "ok", sessoes: 0, max: 6 },
};
const DEPENDENCIAS_OK: EstadoVerificacao[] = ["banco", "whatsapp", "disco", "labs"].map((verificacao) => ({
    verificacao,
    situacao: "ok",
    falhasSeguidas: 0,
    desde: "2026-10-20T00:00:00.000Z",
    alertado: false,
}));

function httpNoAr(
    dependencias: { status: number; corpo: unknown } = { status: 200, corpo: SAUDAVEL },
) {
    return new ClienteHttpFalso()
        .responder(URLS.site, 200, '<!doctype html><div id="root"></div>')
        .responder(URLS.api, 200, '{"status":"ok"}')
        .responder(URLS.dependencias, dependencias.status, JSON.stringify(dependencias.corpo));
}

function cenario(
    http: ClienteHttpFalso,
    opcoes: { iniciais?: EstadoVerificacao[]; segredo?: SegredoFalso } = {},
) {
    const relogio = new RelogioFalso("2026-10-23T12:00:00.000Z");
    const repositorio = new RepositorioEmMemoria(opcoes.iniciais);
    const notificador = new NotificadorFalso();
    const segredo = opcoes.segredo ?? new SegredoFalso(TOKEN);
    return {
        relogio,
        repositorio,
        notificador,
        deps: { http, segredo, repositorio, notificador, agora: relogio.agora, urls: URLS },
    };
}

const situacoes = (repositorio: RepositorioEmMemoria) =>
    Object.fromEntries(
        [...repositorio.estados].map(([nome, e]) => [nome, `${e.situacao} ${e.falhasSeguidas}`]),
    );

describe("executarFrequente", () => {
    test("tudo no ar: as seis verificações gravadas como ok, sem alerta", async (t) => {
        capturarConsole(t);
        const { repositorio, notificador, deps } = cenario(httpNoAr());
        const resumo = await executarFrequente(deps);
        assert.deepEqual(situacoes(repositorio), {
            site: "ok 0",
            api: "ok 0",
            banco: "ok 0",
            whatsapp: "ok 0",
            disco: "ok 0",
            labs: "ok 0",
        });
        assert.equal(notificador.enviados.length, 0);
        assert.deepEqual(resumo.problemas, []);
    });

    test("site fora: avisa só na segunda execução seguida", async (t) => {
        capturarConsole(t);
        const { relogio, notificador, deps } = cenario(
            httpNoAr().responder(URLS.site, 502, "Bad Gateway"),
        );
        await executarFrequente(deps);
        assert.equal(notificador.enviados.length, 0);
        relogio.avancar(60_000);
        await executarFrequente(deps);
        assert.deepEqual(
            notificador.enviados.map((alerta) => alerta.assunto),
            ["[ensina.dev] Falha no site"],
        );
    });

    const apiFora = [
        [
            "sem resposta",
            (http: ClienteHttpFalso) =>
                http.falhar(URLS.dependencias, new Error("tempo esgotado após 10000 ms")),
        ],
        [
            "502 no endpoint",
            (http: ClienteHttpFalso) => http.responder(URLS.dependencias, 502, "Bad Gateway"),
        ],
    ] as const;
    for (const [caso, derrubarDependencias] of apiFora) {
        test(`API fora (${caso}): as dependências mantêm o estado e quem avisa é a api`, async (t) => {
            capturarConsole(t);
            const http = derrubarDependencias(httpNoAr().responder(URLS.api, 502, "Bad Gateway"));
            const { relogio, repositorio, notificador, deps } = cenario(http, {
                iniciais: DEPENDENCIAS_OK,
            });
            await executarFrequente(deps);
            relogio.avancar(60_000);
            const resumo = await executarFrequente(deps);
            assert.deepEqual(
                notificador.enviados.map((alerta) => alerta.verificacao),
                ["api"],
            );
            for (const estado of DEPENDENCIAS_OK) {
                assert.deepEqual(repositorio.estados.get(estado.verificacao), estado);
            }
            assert.deepEqual(repositorio.lidas.at(-1), ["site", "api"]);
            assert.deepEqual(resumo.semLeitura?.verificacoes, ["banco", "whatsapp", "disco", "labs"]);
        });
    }

    for (const status of [401, 404]) {
        test(`monitor sem acesso ao endpoint (HTTP ${status}): todas falham apontando o conserto`, async (t) => {
            capturarConsole(t);
            const { repositorio, notificador, deps } = cenario(
                httpNoAr({ status, corpo: { erro: "Não autorizado" } }),
                { iniciais: DEPENDENCIAS_OK },
            );
            await executarFrequente(deps);
            assert.deepEqual(situacoes(repositorio), {
                banco: "falha 1",
                whatsapp: "falha 1",
                disco: "falha 1",
                labs: "falha 1",
                site: "ok 0",
                api: "ok 0",
            });
            assert.equal(notificador.enviados.length, 1);
            const [alerta] = notificador.enviados;
            assert.equal(alerta?.verificacao, "disco");
            assert.ok(
                alerta?.mensagem.includes(
                    `o monitor não tem acesso ao endpoint de dependências (HTTP ${status}): confira o token no SSM e o MONITOR_TOKEN do .env.prod`,
                ),
            );
        });
    }

    test("disco acima de 85% avisa já na primeira vez", async (t) => {
        capturarConsole(t);
        const corpo = { ...SAUDAVEL, disco: { situacao: "ok", usoPercentual: 91 } };
        const { notificador, deps } = cenario(httpNoAr({ status: 200, corpo }));
        await executarFrequente(deps);
        assert.deepEqual(
            notificador.enviados.map((alerta) => alerta.assunto),
            ["[ensina.dev] Falha no disco de uploads"],
        );
        assert.match(
            notificador.enviados[0]?.mensagem ?? "",
            /Detalhe: 91% de uso, o limite é 85%/,
        );
    });

    test("WhatsApp sem Evolution configurada conta como falha", async (t) => {
        capturarConsole(t);
        const corpo = { ...SAUDAVEL, whatsapp: { situacao: "nao-configurado" } };
        const { repositorio, deps } = cenario(httpNoAr({ status: 200, corpo }));
        await executarFrequente(deps);
        assert.equal(repositorio.estados.get("whatsapp")?.situacao, "falha");
    });

    test("token indisponível no SSM não derruba site e api", async (t) => {
        capturarConsole(t);
        const { repositorio, deps } = cenario(httpNoAr(), {
            segredo: new SegredoFalso(new Error("ParameterNotFound")),
        });
        const resumo = await executarFrequente(deps);
        assert.deepEqual(situacoes(repositorio), {
            site: "ok 0",
            api: "ok 0",
            banco: "falha 1",
            whatsapp: "falha 1",
            disco: "falha 1",
            labs: "falha 1",
        });
        assert.deepEqual(resumo.problemas, []);
    });

    test("o resumo logado não leva o token", async (t) => {
        const linhas = capturarConsole(t);
        await executarFrequente(
            cenario(httpNoAr({ status: 401, corpo: { erro: "Não autorizado" } })).deps,
        );
        assert.ok(linhas.some((linha) => linha.includes('"evento":"resumo"')));
        assert.ok(linhas.every((linha) => !linha.includes(TOKEN)));
    });
});

test("montarFrequente lê as variáveis do contrato", () => {
    const deps = montarFrequente(AMBIENTE_DE_EXEMPLO);
    assert.ok(deps.http instanceof ClienteHttpFetch);
    assert.ok(deps.segredo instanceof SegredoSsm);
    assert.deepEqual(deps.urls, URLS);
    const usadas = [
        "URL_SITE",
        "URL_API",
        "URL_DEPENDENCIAS",
        "PARAMETRO_TOKEN",
        "TABELA_ESTADO",
        "TOPICO_ALERTAS",
    ];
    for (const nome of usadas) {
        assert.throws(() => montarFrequente(semAVariavel(nome)), {
            message: `a variável de ambiente ${nome} não está definida`,
        });
    }
});
