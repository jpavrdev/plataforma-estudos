import puppeteer, { type Browser, type LaunchOptions, type Page } from "puppeteer-core";
import { descreverErro } from "../dominio/erro.ts";
import type { Navegador } from "../dominio/portas.ts";

export interface OpcoesDoNavegador {
    emLambda: boolean;
    caminhoChrome?: string;
}

export class NavegadorChromium implements Navegador {
    readonly #opcoes: OpcoesDoNavegador;

    constructor(opcoes: OpcoesDoNavegador) {
        this.#opcoes = opcoes;
    }

    async renderizar(
        url: string,
        timeoutMs: number,
    ): Promise<{ elementosNoRoot: number; errosDaPagina: string[] }> {
        const navegador = await puppeteer.launch(await this.#opcoesDeLancamento());
        try {
            const prazo = Date.now() + timeoutMs;
            const pagina = await navegador.newPage();
            const errosDaPagina: string[] = [];
            pagina.on("pageerror", (erro) => {
                errosDaPagina.push(`erro não tratado: ${descreverErro(erro)}`);
            });
            pagina.on("console", (mensagem) => {
                if (mensagem.type() === "error") errosDaPagina.push(`console: ${mensagem.text()}`);
            });
            await pagina.goto(url, { waitUntil: "networkidle2", timeout: timeoutMs });
            const elementosNoRoot = await contarElementosNoRoot(pagina, prazo - Date.now());
            return { elementosNoRoot, errosDaPagina: [...errosDaPagina] };
        } finally {
            await fechar(navegador);
        }
    }

    async #opcoesDeLancamento(): Promise<LaunchOptions> {
        if (this.#opcoes.emLambda) {
            const { default: chromium } = await import("@sparticuz/chromium");
            chromium.setGraphicsMode = false;
            return {
                executablePath: await chromium.executablePath(),
                args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
                headless: "shell",
            };
        }
        if (!this.#opcoes.caminhoChrome) {
            throw new Error(
                "defina CHROME_PATH com o caminho do Chrome para renderizar fora da Lambda",
            );
        }
        return { executablePath: this.#opcoes.caminhoChrome, headless: true };
    }
}

async function contarElementosNoRoot(pagina: Page, esperaMs: number): Promise<number> {
    if (esperaMs > 0) {
        try {
            await pagina.waitForFunction(
                () => (document.querySelector("#root")?.childElementCount ?? 0) > 0,
                { timeout: esperaMs },
            );
        } catch (erro) {
            console.warn("o #root não ganhou conteúdo no prazo:", descreverErro(erro));
        }
    }
    return pagina.evaluate(() => document.querySelector("#root")?.childElementCount ?? 0);
}

async function fechar(navegador: Browser): Promise<void> {
    try {
        await navegador.close();
    } catch (erro) {
        console.error("não consegui fechar o Chromium:", descreverErro(erro));
    }
}
