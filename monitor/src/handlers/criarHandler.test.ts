import assert from "node:assert/strict";
import { test } from "node:test";
import { criarHandler } from "./criarHandler.ts";
import type { ResumoDaExecucao } from "./processarResultados.ts";

const resumo = (problemas: string[] = []): ResumoDaExecucao => ({
    funcao: "frequente",
    verificacoes: [],
    problemas,
});

test("monta as dependências na primeira invocação e reaproveita nas seguintes", async () => {
    let montagens = 0;
    const recebidas: object[] = [];
    const handler = criarHandler(
        () => ({ montagem: ++montagens }),
        async (dependencias) => {
            recebidas.push(dependencias);
            return resumo();
        },
    );
    await handler();
    await handler();
    assert.equal(montagens, 1);
    assert.equal(recebidas.length, 2);
    assert.equal(recebidas[0], recebidas[1]);
});

test("devolve o resumo quando a execução não teve problema", async () => {
    const handler = criarHandler(
        () => ({}),
        async () => resumo(),
    );
    assert.deepEqual(await handler(), resumo());
});

test("lança quando a execução teve problema, para o alarme de erro da função disparar", async () => {
    const handler = criarHandler(
        () => ({}),
        async () => resumo(["site: envio do alerta de falha falhou: SNS indisponível"]),
    );
    await assert.rejects(handler(), {
        message:
            "a execução frequente terminou com problemas: site: envio do alerta de falha falhou: SNS indisponível",
    });
});

test("se a montagem falhar, tenta de novo na invocação seguinte", async () => {
    let tentativas = 0;
    const handler = criarHandler(
        () => {
            tentativas++;
            if (tentativas === 1)
                throw new Error("a variável de ambiente URL_SITE não está definida");
            return {};
        },
        async () => resumo(),
    );
    await assert.rejects(handler(), /URL_SITE/);
    assert.deepEqual(await handler(), resumo());
    assert.equal(tentativas, 2);
});
