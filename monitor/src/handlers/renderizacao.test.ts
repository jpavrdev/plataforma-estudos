import assert from "node:assert/strict";
import { test } from "node:test";
import { NavegadorChromium } from "../adaptadores/navegadorChromium.ts";
import { AMBIENTE_DE_EXEMPLO, semAVariavel } from "../testes/ambiente.ts";
import { capturarConsole } from "../testes/console.ts";
import {
    NavegadorFalso,
    NotificadorFalso,
    RelogioFalso,
    RepositorioEmMemoria,
} from "../testes/falsos.ts";
import { executarRenderizacao, montarRenderizacao } from "./renderizacao.ts";

const URL_SITE = "https://ensinadev.com.br/";
const DEZ_MINUTOS = 10 * 60_000;

function cenario(navegador: NavegadorFalso) {
    const relogio = new RelogioFalso("2026-10-23T12:00:00.000Z");
    const repositorio = new RepositorioEmMemoria();
    const notificador = new NotificadorFalso();
    return {
        relogio,
        repositorio,
        notificador,
        deps: { navegador, repositorio, notificador, agora: relogio.agora, urlSite: URL_SITE },
    };
}

test("página em branco duas vezes seguidas avisa, e avisa de novo quando volta", async (t) => {
    capturarConsole(t);
    const navegador = new NavegadorFalso({
        elementosNoRoot: 0,
        errosDaPagina: ["erro não tratado: x is not defined"],
    });
    const { relogio, notificador, deps } = cenario(navegador);
    await executarRenderizacao(deps);
    relogio.avancar(DEZ_MINUTOS);
    await executarRenderizacao(deps);
    navegador.resposta = { elementosNoRoot: 4, errosDaPagina: [] };
    relogio.avancar(DEZ_MINUTOS);
    await executarRenderizacao(deps);
    assert.deepEqual(
        notificador.enviados.map((alerta) => alerta.assunto),
        [
            "[ensina.dev] Falha na renderização do site",
            "[ensina.dev] A renderização do site voltou ao normal",
        ],
    );
    assert.deepEqual(
        navegador.chamadas.map((chamada) => chamada.url),
        [URL_SITE, URL_SITE, URL_SITE],
    );
});

test("Chromium que não abre vira falha da verificação, sem derrubar a execução", async (t) => {
    capturarConsole(t);
    const { repositorio, deps } = cenario(
        new NavegadorFalso(new Error("Failed to launch the browser process")),
    );
    const resumo = await executarRenderizacao(deps);
    assert.deepEqual(resumo.problemas, []);
    assert.equal(repositorio.estados.get("renderizacao")?.falhasSeguidas, 1);
    assert.equal(
        resumo.verificacoes[0]?.detalhe,
        "não foi possível renderizar a página: Failed to launch the browser process",
    );
});

test("montarRenderizacao lê as variáveis do contrato", () => {
    const deps = montarRenderizacao(AMBIENTE_DE_EXEMPLO);
    assert.equal(deps.urlSite, URL_SITE);
    assert.ok(deps.navegador instanceof NavegadorChromium);
    for (const nome of ["URL_SITE", "TABELA_ESTADO", "TOPICO_ALERTAS"]) {
        assert.throws(() => montarRenderizacao(semAVariavel(nome)), {
            message: `a variável de ambiente ${nome} não está definida`,
        });
    }
});
