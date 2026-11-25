import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderCardsCsv } from "./cardsCsv.ts";

const withoutBom = (csv: string) => csv.slice(1);

describe("renderCardsCsv", () => {
    test("starts with the UTF-8 byte order mark so spreadsheets read accents right", () => {
        assert.equal(renderCardsCsv(["a"], [])[0], "﻿");
    });

    test("writes the header and one CRLF-terminated line per row", () => {
        const csv = renderCardsCsv(["frente", "verso"], [["Pergunta", "Resposta"]]);
        assert.equal(withoutBom(csv), "frente,verso\r\nPergunta,Resposta\r\n");
    });

    test("quotes fields with comma, quote or line break and doubles inner quotes", () => {
        const csv = renderCardsCsv(["f"], [["a, b"], ['diz "oi"'], ["linha 1\nlinha 2"]]);
        assert.equal(withoutBom(csv), 'f\r\n"a, b"\r\n"diz ""oi"""\r\n"linha 1\nlinha 2"\r\n');
    });

    test("keeps accents and code untouched", () => {
        const csv = renderCardsCsv(["f"], [["Função <div> em código"]]);
        assert.equal(withoutBom(csv), "f\r\nFunção <div> em código\r\n");
    });

    test("prefixes fields a spreadsheet would run as a formula", () => {
        const csv = renderCardsCsv(["f"], [["=SOMA(A1)"], ["+1"], ["-1"], ["@cmd"]]);
        assert.equal(withoutBom(csv), "f\r\n'=SOMA(A1)\r\n'+1\r\n'-1\r\n'@cmd\r\n");
    });

    test("quotes a neutralized formula that also needs quoting", () => {
        const csv = renderCardsCsv(["f"], [['=HYPERLINK("x")']]);
        assert.equal(withoutBom(csv), 'f\r\n"\'=HYPERLINK(""x"")"\r\n');
    });
});
