import assert from "node:assert/strict";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, test } from "node:test";
import { capturarConsole } from "../testes/console.ts";
import { subirServidorLocal, type ServidorLocal } from "../testes/servidorLocal.ts";
import { NavegadorChromium } from "./navegadorChromium.ts";

const CHROME = process.env.CHROME_PATH;

const PAGINAS: Record<string, string> = {
    "/renderiza": `<!doctype html><html><body><div id="root"></div><script>
        setTimeout(() => {
            document.getElementById("root").innerHTML = "<main><h1>Ensina Dev</h1></main>";
        }, 100);
    </script></body></html>`,
    "/quebra": `<!doctype html><html><body><div id="root"></div><script>
        throw new Error("falha proposital no carregamento");
    </script></body></html>`,
    "/console": `<!doctype html><html><body><div id="root"><main>ok</main></div><script>
        console.error("aviso de erro no console");
    </script></body></html>`,
};

function atender(requisicao: IncomingMessage, resposta: ServerResponse): void {
    const pagina = PAGINAS[requisicao.url ?? ""];
    if (pagina === undefined) {
        resposta.statusCode = 204;
        resposta.end();
        return;
    }
    resposta.setHeader("content-type", "text/html; charset=utf-8");
    resposta.end(pagina);
}

describe(
    "NavegadorChromium com o Chrome da máquina",
    { skip: CHROME ? false : "defina CHROME_PATH para rodar com o Chrome local" },
    () => {
        let servidor: ServidorLocal | undefined;
        const navegador = () => new NavegadorChromium({ emLambda: false, caminhoChrome: CHROME });

        afterEach(async () => {
            await servidor?.fechar();
            servidor = undefined;
        });

        test("página que renderiza no #root, sem erros", async () => {
            servidor = await subirServidorLocal(atender);
            const resultado = await navegador().renderizar(`${servidor.url}/renderiza`, 15_000);
            assert.deepEqual(resultado, { elementosNoRoot: 1, errosDaPagina: [] });
        });

        test("página que lança erro no carregamento fica com o #root vazio e o erro registrado", async (t) => {
            capturarConsole(t);
            servidor = await subirServidorLocal(atender);
            const resultado = await navegador().renderizar(`${servidor.url}/quebra`, 3_000);
            assert.equal(resultado.elementosNoRoot, 0);
            assert.deepEqual(resultado.errosDaPagina, [
                "erro não tratado: falha proposital no carregamento",
            ]);
        });

        test("erro de console conta como erro da página", async () => {
            servidor = await subirServidorLocal(atender);
            const resultado = await navegador().renderizar(`${servidor.url}/console`, 15_000);
            assert.deepEqual(resultado, {
                elementosNoRoot: 1,
                errosDaPagina: ["console: aviso de erro no console"],
            });
        });
    },
);

test("fora da Lambda e sem CHROME_PATH avisa o que falta, sem abrir navegador", async () => {
    await assert.rejects(
        new NavegadorChromium({ emLambda: false }).renderizar("http://127.0.0.1:47100/", 1_000),
        /defina CHROME_PATH/,
    );
});
