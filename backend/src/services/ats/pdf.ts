import { extractText, getDocumentProxy } from "unpdf";
import { AppError } from "../../errors/AppError.ts";

// Below this the PDF is scanned or image only: the score would come out made up.
const MIN_CHARS = 200;

export async function extractPdfText(pdf: Buffer): Promise<string> {
    let text: string;
    try {
        const document = await getDocumentProxy(new Uint8Array(pdf));
        const extracted = await extractText(document, { mergePages: true });
        text = extracted.text;
    } catch (err) {
        console.error("Failed to read the resume PDF:", err);
        throw new AppError(422, "resume.pdfUnreadable");
    }

    if (text.replace(/\s/g, "").length < MIN_CHARS) {
        throw new AppError(422, "resume.pdfWithoutText");
    }

    return text
        .split(/\r?\n/)
        .map((l) => l.replace(/[ \t]+/g, " ").trim())
        .filter((l) => l.length > 0)
        .join("\n");
}
