import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { capturarConsole } from "../testes/console.ts";
import { NavegadorFalso, RelogioFalso } from "../testes/falsos.ts";
import { verificarRenderizacao } from "./renderizacao.ts";

const URL = "https://ensinadev.com.br/";
const AGORA = "2026-10-23T12:00:00.000Z";

const portas = (navegador: NavegadorFalso) => ({ navegador, agora: new RelogioFalso(AGORA).agora });

describe("verificarRenderizacao", () => {
    test("#root com conteúdo e página sem erro é ok", async () => {
        const navegador = new NavegadorFalso({ elementosNoRoot: 3, errosDaPagina: [] });
        const resultado = await verificarRenderizacao(portas(navegador), URL);
        assert.deepEqual(resultado, {
            verificacao: "renderizacao",
            situacao: "ok",
            detalhe: "o #root ganhou 3 elementos, sem erros na página",
            medidoEm: AGORA,
            latenciaMs: 0,
        });
        assert.deepEqual(navegador.chamadas, [{ url: URL, timeoutMs: 30_000 }]);
    });

    test("#root vazio é falha", async () => {
        const navegador = new NavegadorFalso({ elementosNoRoot: 0, errosDaPagina: [] });
        const resultado = await verificarRenderizacao(portas(navegador), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "o #root ficou vazio");
    });

    test("erro na página é falha mesmo com o #root preenchido, e o detalhe mostra os primeiros", async () => {
        const erros = ["e1", "e2", "e3", "e4", "e5"].map((erro) => `console: ${erro}`);
        const navegador = new NavegadorFalso({ elementosNoRoot: 2, errosDaPagina: erros });
        const resultado = await verificarRenderizacao(portas(navegador), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(
            resultado.detalhe,
            'a página registrou 5 erros: "console: e1", "console: e2", "console: e3" e mais 2',
        );
    });

    test("página em branco por erro no carregamento junta as duas causas", async () => {
        const navegador = new NavegadorFalso({
            elementosNoRoot: 0,
            errosDaPagina: ["erro não tratado: falha proposital"],
        });
        const resultado = await verificarRenderizacao(portas(navegador), URL);
        assert.equal(
            resultado.detalhe,
            'o #root ficou vazio; a página registrou 1 erro: "erro não tratado: falha proposital"',
        );
    });

    test("exceção do navegador (tempo esgotado) vira falha e não sobe", async (t) => {
        capturarConsole(t);
        const tempoEsgotado = new Error("Navigation timeout of 30000 ms exceeded");
        tempoEsgotado.name = "TimeoutError";
        const resultado = await verificarRenderizacao(
            portas(new NavegadorFalso(tempoEsgotado)),
            URL,
        );
        assert.equal(resultado.situacao, "falha");
        assert.equal(
            resultado.detalhe,
            "não foi possível renderizar a página: TimeoutError: Navigation timeout of 30000 ms exceeded",
        );
    });
});
