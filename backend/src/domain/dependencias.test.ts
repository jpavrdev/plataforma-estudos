import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    comTimeout,
    criarVerificadorDeDependencias,
    TempoEsgotado,
    tokenConfere,
    tokenDoCabecalho,
    usoPercentual,
} from "./dependencias.ts";
import type { EspacoEmDisco, PortasDependencias } from "./dependencias.ts";

const DISCO_34_POR_CENTO: EspacoEmDisco = { blocks: 1000, bfree: 660, bavail: 660 };

const nunca = () => new Promise<never>(() => {});

function portas(sobrescritas: Partial<PortasDependencias> = {}): PortasDependencias {
    return {
        consultarBanco: async () => undefined,
        estadoDoWhatsapp: async () => "open",
        espacoEmDisco: async () => DISCO_34_POR_CENTO,
        ...sobrescritas,
    };
}

function verificar(sobrescritas: Partial<PortasDependencias> = {}, timeoutMs = 1000) {
    return criarVerificadorDeDependencias(portas(sobrescritas), timeoutMs)();
}

describe("tokenDoCabecalho", () => {
    test("extrai o token do Bearer", () => {
        assert.equal(tokenDoCabecalho("Bearer abc123"), "abc123");
    });

    test("aceita o esquema em qualquer caixa", () => {
        assert.equal(tokenDoCabecalho("bearer abc123"), "abc123");
    });

    test("sem cabeçalho devolve null", () => {
        assert.equal(tokenDoCabecalho(undefined), null);
    });

    test("outro esquema devolve null", () => {
        assert.equal(tokenDoCabecalho("Basic abc123"), null);
    });

    test("Bearer sem token devolve null", () => {
        assert.equal(tokenDoCabecalho("Bearer"), null);
        assert.equal(tokenDoCabecalho("Bearer   "), null);
    });
});

describe("tokenConfere", () => {
    const ESPERADO = "f3a9c1d27b4e8a6f0c5d9e2b7a1f4c8d";

    test("aceita o token certo", () => {
        assert.equal(tokenConfere(ESPERADO, ESPERADO), true);
    });

    test("recusa token errado do mesmo tamanho", () => {
        assert.equal(tokenConfere("0".repeat(ESPERADO.length), ESPERADO), false);
    });

    test("recusa token de outro tamanho sem lançar", () => {
        assert.equal(tokenConfere(ESPERADO.slice(0, -1), ESPERADO), false);
        assert.equal(tokenConfere(ESPERADO + "0", ESPERADO), false);
    });

    test("recusa token ausente ou vazio", () => {
        assert.equal(tokenConfere(null, ESPERADO), false);
        assert.equal(tokenConfere("", ESPERADO), false);
    });

    test("sem token esperado nada confere", () => {
        assert.equal(tokenConfere("", ""), false);
        assert.equal(tokenConfere(ESPERADO, ""), false);
    });
});

describe("comTimeout", () => {
    test("devolve o resultado de quem responde a tempo", async () => {
        assert.equal(await comTimeout(async () => 42, 1000), 42);
    });

    test("rejeita com TempoEsgotado quando estoura", async () => {
        await assert.rejects(comTimeout(nunca, 10), TempoEsgotado);
    });

    test("aborta o sinal entregue à tarefa no estouro", async () => {
        let sinal: AbortSignal | undefined;
        const tarefa = (s: AbortSignal) => {
            sinal = s;
            return nunca();
        };
        await assert.rejects(comTimeout(tarefa, 10), TempoEsgotado);
        assert.equal(sinal?.aborted, true);
    });

    test("repassa o erro da própria tarefa", async () => {
        const erro = new Error("conexão recusada");
        await assert.rejects(
            comTimeout(() => Promise.reject(erro), 1000),
            (e) => e === erro,
        );
    });
});

describe("usoPercentual", () => {
    test("faz a conta do df, sem a reserva do root no total", () => {
        // 400 blocos usados de 950 ao alcance de quem não é root: 42,1% sobe para 43.
        assert.equal(usoPercentual({ blocks: 1000, bfree: 600, bavail: 550 }), 43);
    });

    test("valor exato não é arredondado", () => {
        assert.equal(usoPercentual(DISCO_34_POR_CENTO), 34);
    });

    test("disco vazio é 0", () => {
        assert.equal(usoPercentual({ blocks: 1000, bfree: 1000, bavail: 950 }), 0);
    });

    test("sem espaço para quem não é root é 100", () => {
        assert.equal(usoPercentual({ blocks: 1000, bfree: 50, bavail: 0 }), 100);
    });

    test("statfs sem blocos lança", () => {
        assert.throws(() => usoPercentual({ blocks: 0, bfree: 0, bavail: 0 }));
    });
});

describe("criarVerificadorDeDependencias", () => {
    test("tudo de pé devolve o formato do contrato", async () => {
        const relatorio = await verificar();
        assert.deepEqual(relatorio, {
            banco: { situacao: "ok", latenciaMs: relatorio.banco.latenciaMs },
            whatsapp: { situacao: "ok", estado: "open" },
            disco: { situacao: "ok", usoPercentual: 34 },
        });
        const latencia = relatorio.banco.latenciaMs;
        assert.ok(typeof latencia === "number" && Number.isInteger(latencia) && latencia >= 0);
    });

    test("banco fora vira falha sem derrubar as outras e sem vazar o erro", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const erro = new Error("connect ECONNREFUSED 172.18.0.3:5432");
        const relatorio = await verificar({ consultarBanco: () => Promise.reject(erro) });

        assert.deepEqual(relatorio.banco, { situacao: "falha" });
        assert.deepEqual(relatorio.whatsapp, { situacao: "ok", estado: "open" });
        assert.deepEqual(relatorio.disco, { situacao: "ok", usoPercentual: 34 });
        assert.equal(JSON.stringify(relatorio).includes("172.18.0.3"), false);
        assert.equal(log.mock.callCount(), 1);
        assert.match(String(log.mock.calls[0].arguments[0]), /banco/);
        assert.equal(log.mock.calls[0].arguments[1], erro);
    });

    test("banco pendurado estoura o timeout e vira falha", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const relatorio = await verificar({ consultarBanco: nunca }, 20);

        assert.deepEqual(relatorio.banco, { situacao: "falha" });
        assert.equal(relatorio.disco.situacao, "ok");
        assert.ok(log.mock.calls[0].arguments[1] instanceof TempoEsgotado);
    });

    test("whatsapp sem Evolution configurada vem nao-configurado", async () => {
        const relatorio = await verificar({ estadoDoWhatsapp: async () => null });
        assert.deepEqual(relatorio.whatsapp, { situacao: "nao-configurado" });
    });

    test("whatsapp fora do estado open é falha e informa o estado", async () => {
        for (const estado of ["close", "connecting"]) {
            const relatorio = await verificar({ estadoDoWhatsapp: async () => estado });
            assert.deepEqual(relatorio.whatsapp, { situacao: "falha", estado });
        }
    });

    test("whatsapp com erro na Evolution vira falha", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const relatorio = await verificar({
            estadoDoWhatsapp: () => Promise.reject(new Error("Evolution respondeu HTTP 401")),
        });

        assert.deepEqual(relatorio.whatsapp, { situacao: "falha" });
        assert.equal(log.mock.callCount(), 1);
    });

    test("whatsapp pendurado vira falha e tem a requisição abortada", async (t) => {
        t.mock.method(console, "error", () => {});
        let sinal: AbortSignal | undefined;
        const relatorio = await verificar(
            {
                estadoDoWhatsapp: (s) => {
                    sinal = s;
                    return nunca();
                },
            },
            20,
        );

        assert.deepEqual(relatorio.whatsapp, { situacao: "falha" });
        assert.equal(sinal?.aborted, true);
    });

    test("disco ilegível vira falha", async (t) => {
        t.mock.method(console, "error", () => {});
        const enoent = Object.assign(new Error("ENOENT: no such file or directory"), {
            code: "ENOENT",
        });
        const relatorio = await verificar({ espacoEmDisco: () => Promise.reject(enoent) });
        assert.deepEqual(relatorio.disco, { situacao: "falha" });
    });

    test("statfs sem blocos vira falha", async (t) => {
        t.mock.method(console, "error", () => {});
        const relatorio = await verificar({
            espacoEmDisco: async () => ({ blocks: 0, bfree: 0, bavail: 0 }),
        });
        assert.deepEqual(relatorio.disco, { situacao: "falha" });
    });

    test("tudo fora ao mesmo tempo ainda devolve o relatório", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const relatorio = await verificar(
            {
                consultarBanco: () => Promise.reject(new Error("banco")),
                estadoDoWhatsapp: nunca,
                espacoEmDisco: () => Promise.reject(new Error("disco")),
            },
            20,
        );

        assert.deepEqual(relatorio, {
            banco: { situacao: "falha" },
            whatsapp: { situacao: "falha" },
            disco: { situacao: "falha" },
        });
        assert.equal(log.mock.callCount(), 3);
    });

    test("as três checagens rodam em paralelo", async () => {
        // Cada porta só termina depois que as três começaram: em série, a
        // primeira esperaria as outras para sempre e estouraria o timeout.
        let iniciadas = 0;
        let liberar = () => {};
        const todasIniciadas = new Promise<void>((resolve) => {
            liberar = () => resolve();
        });
        const esperarAsOutras = async () => {
            iniciadas += 1;
            if (iniciadas === 3) liberar();
            await todasIniciadas;
        };

        const relatorio = await verificar(
            {
                consultarBanco: esperarAsOutras,
                estadoDoWhatsapp: async () => {
                    await esperarAsOutras();
                    return "open";
                },
                espacoEmDisco: async () => {
                    await esperarAsOutras();
                    return DISCO_34_POR_CENTO;
                },
            },
            500,
        );

        assert.equal(relatorio.banco.situacao, "ok");
        assert.equal(relatorio.whatsapp.situacao, "ok");
        assert.equal(relatorio.disco.situacao, "ok");
    });
});
