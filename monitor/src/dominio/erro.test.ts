import assert from "node:assert/strict";
import { test } from "node:test";
import { descreverErro } from "./erro.ts";

test("Error comum vira só a mensagem", () => {
    assert.equal(
        descreverErro(new Error("tempo esgotado após 10000 ms")),
        "tempo esgotado após 10000 ms",
    );
});

test("erro de outro tipo leva o nome do tipo", () => {
    const negado = new Error("not authorized to perform ssm:GetParameter");
    negado.name = "AccessDeniedException";
    assert.equal(
        descreverErro(negado),
        "AccessDeniedException: not authorized to perform ssm:GetParameter",
    );
});

test("erro sem mensagem usa o código", () => {
    const recusado = Object.assign(new AggregateError([], ""), { code: "ECONNREFUSED" });
    assert.equal(descreverErro(recusado), "AggregateError: ECONNREFUSED");
});

test("valor que não é Error vira texto, e texto longo é cortado", () => {
    assert.equal(descreverErro("falhou"), "falhou");
    assert.equal(descreverErro(new Error("x".repeat(500))).length, 200);
});
