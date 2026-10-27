import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";
import { App } from "aws-cdk-lib";
import { lerContexto, PARAMETRO_TOKEN_PADRAO } from "./contexto.ts";

function ler(contexto: Record<string, string>) {
    return lerContexto(new App({ context: contexto }).node);
}

describe("lerContexto", () => {
    test("exige o email dos alertas e não tem valor padrão", () => {
        assert.throws(() => ler({}), /-c emailAlertas=/);
        assert.throws(() => ler({ emailAlertas: "" }), /-c emailAlertas=/);
    });

    test("recusa um email malformado", () => {
        assert.throws(() => ler({ emailAlertas: "alertas" }), /não é um email válido/);
    });

    test("usa /ensinadev/monitor/token quando o parâmetro não vem no contexto", () => {
        assert.equal(PARAMETRO_TOKEN_PADRAO, "/ensinadev/monitor/token");
        assert.deepEqual(ler({ emailAlertas: "alertas@example.com" }), {
            emailAlertas: "alertas@example.com",
            parametroToken: "/ensinadev/monitor/token",
        });
    });

    test("aceita outro nome de parâmetro", () => {
        const contexto = ler({ emailAlertas: "alertas@example.com", parametroToken: "/outro/token" });
        assert.equal(contexto.parametroToken, "/outro/token");
    });

    test("recusa um nome de parâmetro que o SSM não aceitaria", () => {
        assert.throws(
            () => ler({ emailAlertas: "alertas@example.com", parametroToken: "token com espaço" }),
            /não é um nome de parâmetro do SSM/,
        );
    });
});

test("o app não sintetiza sem o email dos alertas e diz o que falta", () => {
    const app = fileURLToPath(new URL("../bin/monitor.ts", import.meta.url));
    const ambiente = { ...process.env };
    delete ambiente.CDK_CONTEXT_JSON;
    const execucao = spawnSync(process.execPath, [app], { env: ambiente, encoding: "utf8" });
    assert.notEqual(execucao.status, 0);
    assert.match(execucao.stderr, /Falta o email que recebe os alertas/);
    assert.match(execucao.stderr, /-c emailAlertas=/);
});
