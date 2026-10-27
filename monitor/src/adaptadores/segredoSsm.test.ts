import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { SegredoSsm } from "./segredoSsm.ts";

const PARAMETRO = "/ensinadev/monitor/token";

function ssmDevolvendo(t: TestContext, valores: (string | undefined)[]) {
    const cliente = new SSMClient({ region: "sa-east-1" });
    const comandos: unknown[] = [];
    t.mock.method(cliente, "send", async (comando: unknown) => {
        comandos.push(comando);
        return { $metadata: {}, Parameter: { Value: valores[comandos.length - 1] } };
    });
    return { cliente, comandos };
}

test("lê o parâmetro descriptografado e guarda em memória entre invocações", async (t) => {
    const { cliente, comandos } = ssmDevolvendo(t, ["token-1"]);
    const segredo = new SegredoSsm(cliente, PARAMETRO, () => 0);
    assert.equal(await segredo.token(), "token-1");
    assert.equal(await segredo.token(), "token-1");
    assert.equal(comandos.length, 1);
    const [comando] = comandos;
    assert.ok(comando instanceof GetParameterCommand);
    assert.deepEqual(comando.input, { Name: PARAMETRO, WithDecryption: true });
});

test("relê depois de 15 minutos para pegar uma troca do token", async (t) => {
    const { cliente, comandos } = ssmDevolvendo(t, ["token-1", "token-2"]);
    let agora = 0;
    const segredo = new SegredoSsm(cliente, PARAMETRO, () => agora);
    assert.equal(await segredo.token(), "token-1");
    agora = 15 * 60_000 - 1;
    assert.equal(await segredo.token(), "token-1");
    agora = 15 * 60_000;
    assert.equal(await segredo.token(), "token-2");
    assert.equal(comandos.length, 2);
});

test("parâmetro vazio é erro e não fica guardado", async (t) => {
    const { cliente, comandos } = ssmDevolvendo(t, [undefined, "token-1"]);
    const segredo = new SegredoSsm(cliente, PARAMETRO, () => 0);
    await assert.rejects(
        segredo.token(),
        /o parâmetro \/ensinadev\/monitor\/token do SSM está vazio/,
    );
    assert.equal(await segredo.token(), "token-1");
    assert.equal(comandos.length, 2);
});
