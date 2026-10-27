import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import type { EstadoVerificacao } from "../dominio/tipos.ts";
import { capturarConsole } from "../testes/console.ts";
import { RepositorioDynamo } from "./repositorioDynamo.ts";

type Item = Record<string, AttributeValue>;

function dynamoEmMemoria(t: TestContext, iniciais: Item[] = []) {
    const itens = new Map<string, Item>();
    for (const item of iniciais) itens.set(item.verificacao?.S ?? "", item);
    const comandos: unknown[] = [];
    const cliente = new DynamoDBClient({ region: "sa-east-1" });
    t.mock.method(cliente, "send", async (comando: unknown) => {
        comandos.push(comando);
        if (comando instanceof PutItemCommand && comando.input.Item) {
            itens.set(comando.input.Item.verificacao?.S ?? "", comando.input.Item);
            return { $metadata: {} };
        }
        if (comando instanceof GetItemCommand) {
            return { $metadata: {}, Item: itens.get(comando.input.Key?.verificacao?.S ?? "") };
        }
        throw new Error("comando inesperado");
    });
    return { cliente, comandos };
}

const ALERTADO: EstadoVerificacao = {
    verificacao: "site",
    situacao: "falha",
    falhasSeguidas: 2,
    desde: "2026-10-23T12:00:00.000Z",
    alertado: true,
    ultimoAlertaEm: "2026-10-23T12:01:00.000Z",
};
const NORMAL: EstadoVerificacao = {
    verificacao: "api",
    situacao: "ok",
    falhasSeguidas: 0,
    desde: "2026-10-20T08:00:00.000Z",
    alertado: false,
};

test("grava um item por verificação e lê de volta o mesmo estado", async (t) => {
    const { cliente, comandos } = dynamoEmMemoria(t);
    const repositorio = new RepositorioDynamo(cliente, "monitor-estado");
    await repositorio.salvar(ALERTADO);
    await repositorio.salvar(NORMAL);

    const [gravacao] = comandos;
    assert.ok(gravacao instanceof PutItemCommand);
    assert.deepEqual(gravacao.input, {
        TableName: "monitor-estado",
        Item: {
            verificacao: { S: "site" },
            situacao: { S: "falha" },
            falhasSeguidas: { N: "2" },
            desde: { S: "2026-10-23T12:00:00.000Z" },
            alertado: { BOOL: true },
            ultimoAlertaEm: { S: "2026-10-23T12:01:00.000Z" },
        },
    });

    const lidos = await repositorio.ler(["site", "api", "banco"]);
    assert.deepEqual(
        lidos,
        new Map([
            ["site", ALERTADO],
            ["api", NORMAL],
        ]),
    );
    const leitura = comandos.at(-1);
    assert.ok(leitura instanceof GetItemCommand);
    assert.deepEqual(leitura.input, {
        TableName: "monitor-estado",
        Key: { verificacao: { S: "banco" } },
        ConsistentRead: true,
    });
});

test("item com formato inesperado é ignorado com aviso no log", async (t) => {
    const linhas = capturarConsole(t);
    const { cliente } = dynamoEmMemoria(t, [
        { verificacao: { S: "disco" }, situacao: { S: "talvez" }, falhasSeguidas: { N: "1" } },
    ]);
    const lidos = await new RepositorioDynamo(cliente, "monitor-estado").ler(["disco"]);
    assert.equal(lidos.size, 0);
    assert.ok(linhas.some((linha) => linha.includes("disco")));
});
