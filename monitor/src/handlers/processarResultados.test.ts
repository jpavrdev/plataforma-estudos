import assert from "node:assert/strict";
import { test } from "node:test";
import type { Notificador } from "../dominio/portas.ts";
import type { EstadoVerificacao, Resultado, Situacao } from "../dominio/tipos.ts";
import { capturarConsole } from "../testes/console.ts";
import { NotificadorFalso, RelogioFalso, RepositorioEmMemoria } from "../testes/falsos.ts";
import { processarResultados } from "./processarResultados.ts";

const AGORA = "2026-10-23T12:00:00.000Z";
const UM_MINUTO_ANTES = "2026-10-23T11:59:00.000Z";

function medicao(verificacao: string, situacao: Situacao): Resultado {
    const detalhe = situacao === "ok" ? "respondeu 200 em 80 ms" : "respondeu 502 em 15 ms";
    return { verificacao, situacao, detalhe, medidoEm: AGORA };
}

function emFalha(verificacao: string, campos: Partial<EstadoVerificacao> = {}): EstadoVerificacao {
    return {
        verificacao,
        situacao: "falha",
        falhasSeguidas: 1,
        desde: UM_MINUTO_ANTES,
        alertado: false,
        ...campos,
    };
}

function cenario(iniciais: EstadoVerificacao[] = []) {
    const relogio = new RelogioFalso(AGORA);
    const repositorio = new RepositorioEmMemoria(iniciais);
    const notificador = new NotificadorFalso();
    return {
        relogio,
        repositorio,
        notificador,
        deps: { repositorio, notificador, agora: relogio.agora },
    };
}

test("lê o estado anterior, grava o novo e loga um resumo da execução", async (t) => {
    const linhas = capturarConsole(t);
    const { repositorio, notificador, deps } = cenario();
    const resumo = await processarResultados(
        "frequente",
        [medicao("site", "ok"), medicao("api", "falha")],
        deps,
    );
    assert.deepEqual(repositorio.lidas, [["site", "api"]]);
    assert.deepEqual(
        repositorio.gravacoes.map((e) => `${e.verificacao} ${e.situacao} ${e.falhasSeguidas}`),
        ["site ok 0", "api falha 1"],
    );
    assert.equal(notificador.enviados.length, 0);
    assert.deepEqual(resumo, {
        funcao: "frequente",
        verificacoes: [
            {
                verificacao: "site",
                situacao: "ok",
                detalhe: "respondeu 200 em 80 ms",
                falhasSeguidas: 0,
            },
            {
                verificacao: "api",
                situacao: "falha",
                detalhe: "respondeu 502 em 15 ms",
                falhasSeguidas: 1,
            },
        ],
        problemas: [],
    });
    assert.ok(linhas.includes(JSON.stringify({ evento: "resumo", ...resumo })));
});

test("envia o alerta e só então grava o estado como alertado", async (t) => {
    capturarConsole(t);
    const repositorio = new RepositorioEmMemoria([emFalha("site")]);
    const alertadoNoEnvio: (boolean | undefined)[] = [];
    const notificador: Notificador = {
        enviar: async () => {
            alertadoNoEnvio.push(repositorio.estados.get("site")?.alertado);
        },
    };
    const relogio = new RelogioFalso(AGORA);
    const resumo = await processarResultados("frequente", [medicao("site", "falha")], {
        repositorio,
        notificador,
        agora: relogio.agora,
    });
    assert.deepEqual(alertadoNoEnvio, [false]);
    assert.equal(repositorio.estados.get("site")?.alertado, true);
    assert.equal(resumo.verificacoes[0]?.alerta, "falha");
});

test("se o envio falhar, o estado não é gravado e a execução seguinte tenta de novo", async (t) => {
    const linhas = capturarConsole(t);
    const { relogio, repositorio, notificador, deps } = cenario([emFalha("site")]);
    notificador.falhasAntesDeEnviar = 1;

    const primeira = await processarResultados("frequente", [medicao("site", "falha")], deps);
    assert.equal(notificador.enviados.length, 0);
    assert.deepEqual(repositorio.gravacoes, []);
    assert.deepEqual(repositorio.estados.get("site"), emFalha("site"));
    assert.deepEqual(primeira.problemas, [
        "site: envio do alerta de falha falhou: SNS indisponível",
    ]);
    assert.ok(linhas.some((linha) => linha.includes("SNS indisponível")));

    relogio.avancar(60_000);
    const segunda = await processarResultados("frequente", [medicao("site", "falha")], deps);
    assert.deepEqual(
        notificador.enviados.map((alerta) => alerta.tipo),
        ["falha"],
    );
    assert.equal(repositorio.estados.get("site")?.alertado, true);
    assert.deepEqual(segunda.problemas, []);
});

test("um aviso de recuperação que não saiu também é refeito na execução seguinte", async (t) => {
    capturarConsole(t);
    const alertado = emFalha("api", {
        falhasSeguidas: 3,
        alertado: true,
        ultimoAlertaEm: UM_MINUTO_ANTES,
    });
    const { relogio, repositorio, notificador, deps } = cenario([alertado]);
    notificador.falhasAntesDeEnviar = 1;

    await processarResultados("frequente", [medicao("api", "ok")], deps);
    assert.deepEqual(repositorio.estados.get("api"), alertado);

    relogio.avancar(60_000);
    await processarResultados("frequente", [medicao("api", "ok")], deps);
    assert.deepEqual(
        notificador.enviados.map((alerta) => alerta.tipo),
        ["recuperacao"],
    );
    assert.equal(repositorio.estados.get("api")?.situacao, "ok");
});

test("erro ao gravar uma verificação não impede as outras", async (t) => {
    capturarConsole(t);
    const { repositorio, deps } = cenario();
    repositorio.falharAoSalvar.add("site");
    const resumo = await processarResultados(
        "frequente",
        [medicao("site", "ok"), medicao("api", "ok")],
        deps,
    );
    assert.deepEqual(
        repositorio.gravacoes.map((estado) => estado.verificacao),
        ["api"],
    );
    assert.deepEqual(resumo.problemas, ["site: gravação do estado falhou: DynamoDB indisponível"]);
});

test("verificação sem política vira problema e as outras seguem", async (t) => {
    capturarConsole(t);
    const { repositorio, deps } = cenario();
    const resumo = await processarResultados(
        "frequente",
        [medicao("inventada", "ok"), medicao("site", "ok")],
        deps,
    );
    assert.deepEqual(resumo.problemas, [
        "inventada: avaliação falhou: não há política para inventada",
    ]);
    assert.deepEqual(
        repositorio.gravacoes.map((estado) => estado.verificacao),
        ["site"],
    );
});

test("verificações sem leitura aparecem no resumo e não são lidas nem gravadas", async (t) => {
    const linhas = capturarConsole(t);
    const { repositorio, deps } = cenario();
    const semLeitura = {
        verificacoes: ["banco", "whatsapp", "disco"],
        motivo: "o endpoint respondeu 502",
    };
    const resumo = await processarResultados(
        "frequente",
        [medicao("site", "falha")],
        deps,
        semLeitura,
    );
    assert.deepEqual(resumo.semLeitura, semLeitura);
    assert.deepEqual(repositorio.lidas, [["site"]]);
    assert.deepEqual([...repositorio.estados.keys()], ["site"]);
    assert.ok(linhas.some((linha) => linha.includes('"motivo":"o endpoint respondeu 502"')));
});

test("sem conseguir ler o estado a execução falha inteira, sem avisar nada", async (t) => {
    capturarConsole(t);
    const { repositorio, notificador, deps } = cenario();
    repositorio.falharAoLer = true;
    await assert.rejects(
        processarResultados("frequente", [medicao("site", "falha")], deps),
        /DynamoDB indisponível/,
    );
    assert.equal(notificador.enviados.length, 0);
});
