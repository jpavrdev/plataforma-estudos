import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Resultado } from "../dominio/tipos.ts";
import { capturarConsole } from "../testes/console.ts";
import { ClienteHttpFalso, RelogioFalso, SegredoFalso } from "../testes/falsos.ts";
import { verificarDependencias, type LeituraDependencias } from "./dependencias.ts";

const URL = "https://ensinadev.com.br/api/health/dependencias";
const TOKEN = "token-do-monitor-que-nao-pode-vazar";
const AGORA = "2026-10-23T12:00:00.000Z";
const SAUDAVEL = {
    banco: { situacao: "ok", latenciaMs: 4 },
    whatsapp: { situacao: "ok", estado: "open" },
    disco: { situacao: "ok", usoPercentual: 34 },
    labs: { situacao: "ok", sessoes: 1, max: 6 },
};
const SEM_ACESSO = "confira o token no SSM e o MONITOR_TOKEN do .env.prod";

function portas(http: ClienteHttpFalso, segredo = new SegredoFalso(TOKEN)) {
    return { http, segredo, agora: new RelogioFalso(AGORA).agora };
}

function respondendo(status: number, corpo: unknown): ClienteHttpFalso {
    return new ClienteHttpFalso().responder(
        URL,
        status,
        typeof corpo === "string" ? corpo : JSON.stringify(corpo),
    );
}

function resultadosDe(leitura: LeituraDependencias): Resultado[] {
    if (leitura.tipo !== "resultados")
        assert.fail(`esperava resultados, veio sem resposta: ${leitura.motivo}`);
    return leitura.resultados;
}

const resumo = (resultados: Resultado[]) =>
    resultados.map(
        ({ verificacao, situacao, detalhe }) => `${verificacao} ${situacao}: ${detalhe}`,
    );

async function lerCorpo(corpo: unknown): Promise<string[]> {
    return resumo(resultadosDe(await verificarDependencias(portas(respondendo(200, corpo)), URL)));
}

describe("verificarDependencias", () => {
    test("tudo saudável: todas ok, com o token no cabeçalho e timeout de 10 s", async () => {
        const http = respondendo(200, SAUDAVEL);
        const resultados = resultadosDe(await verificarDependencias(portas(http), URL));
        assert.deepEqual(resumo(resultados), [
            "banco ok: a API alcançou o banco em 4 ms",
            "whatsapp ok: conexão open",
            "disco ok: 34% de uso",
            "labs ok: 1 de 6 sessões em uso",
        ]);
        assert.equal(resultados[0]?.latenciaMs, 4);
        assert.ok(resultados.every((resultado) => resultado.medidoEm === AGORA));
        assert.deepEqual(http.chamadas, [
            {
                url: URL,
                opcoes: { cabecalhos: { authorization: `Bearer ${TOKEN}` }, timeoutMs: 10_000 },
            },
        ]);
    });

    test("banco em falha", async () => {
        const linhas = await lerCorpo({ ...SAUDAVEL, banco: { situacao: "falha" } });
        assert.equal(linhas[0], "banco falha: a API não alcançou o banco");
    });

    test("whatsapp só é ok com a conexão open", async () => {
        const whatsapp = async (campo: unknown) =>
            (await lerCorpo({ ...SAUDAVEL, whatsapp: campo }))[1];
        assert.equal(
            await whatsapp({ situacao: "falha", estado: "close" }),
            "whatsapp falha: conexão close na Evolution",
        );
        assert.equal(
            await whatsapp({ situacao: "falha", estado: "connecting" }),
            "whatsapp falha: conexão connecting na Evolution",
        );
        assert.equal(
            await whatsapp({ situacao: "falha" }),
            "whatsapp falha: a API não conseguiu consultar a Evolution",
        );
        assert.equal(
            await whatsapp({ situacao: "nao-configurado" }),
            "whatsapp falha: a API está sem a Evolution configurada: confira EVOLUTION_URL e EVOLUTION_API_KEY no .env.prod",
        );
    });

    test("disco: o limite de 85% é do monitor", async () => {
        const disco = async (campo: unknown) => (await lerCorpo({ ...SAUDAVEL, disco: campo }))[2];
        assert.equal(await disco({ situacao: "ok", usoPercentual: 84 }), "disco ok: 84% de uso");
        assert.equal(
            await disco({ situacao: "ok", usoPercentual: 85 }),
            "disco falha: 85% de uso, o limite é 85%",
        );
        assert.equal(
            await disco({ situacao: "ok", usoPercentual: 97 }),
            "disco falha: 97% de uso, o limite é 85%",
        );
        assert.equal(
            await disco({ situacao: "falha" }),
            "disco falha: a API não conseguiu medir o disco",
        );
        assert.equal(
            await disco({ situacao: "ok" }),
            "disco falha: campo disco sem usoPercentual na resposta",
        );
    });

    test("labs: falha aponta o container e o daemon", async () => {
        const labs = async (campo: unknown) => (await lerCorpo({ ...SAUDAVEL, labs: campo }))[3];
        assert.equal(
            await labs({ situacao: "falha" }),
            "labs falha: a API não confirmou que um lab abre: confira o container labs e o serviço docker-labs",
        );
        assert.equal(await labs({ situacao: "ok" }), "labs ok: um lab consegue abrir");
        assert.equal(await labs(undefined), "labs falha: campo labs ausente ou inválido na resposta");
    });

    test("campo ausente derruba só a dependência dele", async () => {
        const { banco, disco, labs } = SAUDAVEL;
        const linhas = await lerCorpo({ banco, disco, labs });
        assert.deepEqual(linhas, [
            "banco ok: a API alcançou o banco em 4 ms",
            "whatsapp falha: campo whatsapp ausente ou inválido na resposta",
            "disco ok: 34% de uso",
            "labs ok: 1 de 6 sessões em uso",
        ]);
    });

    test("corpo que não é JSON deixa todas em falha", async (t) => {
        capturarConsole(t);
        const linhas = await lerCorpo("<html>erro</html>");
        assert.deepEqual(linhas, [
            "banco falha: o endpoint de dependências respondeu um corpo inesperado",
            "whatsapp falha: o endpoint de dependências respondeu um corpo inesperado",
            "disco falha: o endpoint de dependências respondeu um corpo inesperado",
            "labs falha: o endpoint de dependências respondeu um corpo inesperado",
        ]);
    });

    describe("API fora: todas ficam sem leitura e mantêm o estado", () => {
        test("tempo esgotado ou erro de rede", async (t) => {
            capturarConsole(t);
            const http = new ClienteHttpFalso().falhar(
                URL,
                new Error("tempo esgotado após 10000 ms"),
            );
            assert.deepEqual(await verificarDependencias(portas(http), URL), {
                tipo: "sem-resposta",
                motivo: "tempo esgotado após 10000 ms",
            });
        });

        test("qualquer 5xx ou o 429 do limitador", async () => {
            for (const status of [429, 500, 502, 503, 504]) {
                assert.deepEqual(
                    await verificarDependencias(portas(respondendo(status, "")), URL),
                    {
                        tipo: "sem-resposta",
                        motivo: `o endpoint respondeu ${status}`,
                    },
                );
            }
        });
    });

    describe("monitor sem acesso: todas em falha apontando o conserto", () => {
        test("401 de token errado", async (t) => {
            const linhas = capturarConsole(t);
            const http = respondendo(401, { erro: "Não autorizado" });
            const resultados = resultadosDe(await verificarDependencias(portas(http), URL));
            const esperado = `o monitor não tem acesso ao endpoint de dependências (HTTP 401): ${SEM_ACESSO}`;
            assert.deepEqual(resumo(resultados), [
                `banco falha: ${esperado}`,
                `whatsapp falha: ${esperado}`,
                `disco falha: ${esperado}`,
                `labs falha: ${esperado}`,
            ]);
            assert.ok(linhas.some((linha) => linha.includes("HTTP 401")));
        });

        test("404 de API sem token configurado", async (t) => {
            capturarConsole(t);
            const resultados = resultadosDe(
                await verificarDependencias(portas(respondendo(404, "")), URL),
            );
            assert.equal(resultados.length, 4);
            for (const resultado of resultados) {
                assert.equal(resultado.situacao, "falha");
                assert.match(resultado.detalhe, /\(HTTP 404\): confira o token no SSM/);
            }
        });
    });

    test("outro status inesperado deixa todas em falha", async () => {
        const resultados = resultadosDe(
            await verificarDependencias(portas(respondendo(403, "")), URL),
        );
        assert.ok(
            resultados.every((r) => r.detalhe === "o endpoint de dependências respondeu 403"),
        );
    });

    test("token indisponível no SSM: todas em falha e o endpoint nem é chamado", async (t) => {
        capturarConsole(t);
        const http = respondendo(200, SAUDAVEL);
        const semToken = new SegredoFalso(new Error("parâmetro não encontrado"));
        const resultados = resultadosDe(await verificarDependencias(portas(http, semToken), URL));
        assert.ok(
            resultados.every(
                (r) =>
                    r.situacao === "falha" &&
                    r.detalhe ===
                        "não consegui consultar as dependências: parâmetro não encontrado",
            ),
        );
        assert.equal(http.chamadas.length, 0);
    });

    test("o token não aparece em nenhum detalhe nem log", async (t) => {
        const linhas = capturarConsole(t);
        const leituras = [
            await verificarDependencias(portas(respondendo(401, { erro: "Não autorizado" })), URL),
            await verificarDependencias(portas(respondendo(200, "<html>")), URL),
            await verificarDependencias(portas(respondendo(200, SAUDAVEL)), URL),
        ];
        const texto = JSON.stringify(leituras) + linhas.join("\n");
        assert.ok(!texto.includes(TOKEN));
    });
});
