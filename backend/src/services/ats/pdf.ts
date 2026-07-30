import { extractText, getDocumentProxy } from "unpdf";
import { AppError } from "../../errors/AppError.ts";

// Abaixo disso o PDF é escaneado ou só imagem: a nota sairia inventada.
const MINIMO_CARACTERES = 200;

export async function extrairTextoPdf(pdf: Buffer): Promise<string> {
    let texto: string;
    try {
        const documento = await getDocumentProxy(new Uint8Array(pdf));
        const extraido = await extractText(documento, { mergePages: true });
        texto = extraido.text;
    } catch (err) {
        console.error("Falha ao ler o PDF do currículo:", err);
        throw new AppError(
            422,
            "Não conseguimos ler esse PDF. Confira se o arquivo não está corrompido.",
        );
    }

    if (texto.replace(/\s/g, "").length < MINIMO_CARACTERES) {
        throw new AppError(
            422,
            "Esse PDF não tem texto selecionável (parece uma imagem ou um currículo escaneado). Exporte o currículo como PDF de texto e envie de novo.",
        );
    }

    return texto
        .split(/\r?\n/)
        .map((l) => l.replace(/[ \t]+/g, " ").trim())
        .filter((l) => l.length > 0)
        .join("\n");
}
