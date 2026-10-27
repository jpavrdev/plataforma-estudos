import { descreverErro } from "../dominio/erro.ts";

export function lerJson(texto: string): unknown {
    try {
        const valor: unknown = JSON.parse(texto);
        return valor;
    } catch (erro) {
        console.warn("corpo da resposta não é JSON:", descreverErro(erro));
        return undefined;
    }
}

export function ehObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
