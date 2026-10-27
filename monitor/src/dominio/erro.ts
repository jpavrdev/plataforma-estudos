import { resumir } from "./formatacao.ts";

const LIMITE = 200;

export function descreverErro(erro: unknown): string {
    if (!(erro instanceof Error)) return resumir(String(erro), LIMITE);
    const codigo = "code" in erro && typeof erro.code === "string" ? erro.code : "";
    const mensagem = erro.message || codigo || erro.name;
    const tipo = erro.name !== "Error" && !mensagem.startsWith(erro.name) ? `${erro.name}: ` : "";
    return resumir(`${tipo}${mensagem}`, LIMITE);
}
