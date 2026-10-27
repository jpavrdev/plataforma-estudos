import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import type { Alerta } from "../dominio/tipos.ts";
import { NotificadorSns } from "./notificadorSns.ts";

const TOPICO = "arn:aws:sns:sa-east-1:123456789012:monitor-alertas";

function snsGravando(t: TestContext) {
    const cliente = new SNSClient({ region: "sa-east-1" });
    const comandos: unknown[] = [];
    t.mock.method(cliente, "send", async (comando: unknown) => {
        comandos.push(comando);
        return { $metadata: {}, MessageId: "1" };
    });
    return { cliente, comandos };
}

const alerta = (assunto: string): Alerta => ({
    tipo: "falha",
    verificacao: "site",
    assunto,
    mensagem: "O monitor detectou falha no site.\n\nDetalhe: respondeu 502 em 15 ms",
});

test("publica assunto e mensagem no tópico", async (t) => {
    const { cliente, comandos } = snsGravando(t);
    await new NotificadorSns(cliente, TOPICO).enviar(alerta("[ensina.dev] Falha no site"));
    const [comando] = comandos;
    assert.ok(comando instanceof PublishCommand);
    assert.deepEqual(comando.input, {
        TopicArn: TOPICO,
        Subject: "[ensina.dev] Falha no site",
        Message: "O monitor detectou falha no site.\n\nDetalhe: respondeu 502 em 15 ms",
    });
});

test("ajusta o assunto às regras do SNS: sem quebra de linha e com menos de 100 caracteres", async (t) => {
    const { cliente, comandos } = snsGravando(t);
    await new NotificadorSns(cliente, TOPICO).enviar(
        alerta(`linha um\nlinha dois ${"x".repeat(200)}`),
    );
    const [comando] = comandos;
    assert.ok(comando instanceof PublishCommand);
    const assunto = comando.input.Subject ?? "";
    assert.equal(assunto.length, 99);
    assert.ok(assunto.startsWith("linha um linha dois "));
});
