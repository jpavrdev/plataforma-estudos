// Content of a track's book: lesson markdown, tables, quiz and each chapter's
// XHTML. It lives in the domain because it is a pure function of the content, with
// no database, disk or zip, and it is what the tests cover.
import MarkdownIt from "markdown-it";
import katex from "katex";
import { seededShuffle } from "./shuffle.ts";

export const LETTERS = "ABCDEFGHIJ";

export type Block = { type: string; value: string };
export type Question = {
    statement: string;
    explanation: string | null;
    opcoes: { text: string; isCorrect: boolean }[];
};

const md = new MarkdownIt({ html: false, xhtmlOut: true, linkify: false, typographer: false });

export const escapeXml = (t: string) =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const slug = (t: string) =>
    t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "livro";

// Protects code fences and inline code, swaps the math for placeholders and only
// then runs the markdown. That way the $ of a shell command does not become a formula
// and KaTeX gets the LaTeX intact, turning it into MathML (the EPUB 3 standard).
export function renderMarkdown(text: string, inline = false): string {
    const formulas: { tex: string; display: boolean }[] = [];
    const stash = (tex: string, display: boolean) => {
        formulas.push({ tex: tex.trim(), display });
        return `zzformulazz${formulas.length - 1}zz`;
    };
    const prepared = text
        .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
        .map((part, i) => {
            if (i % 2 === 1) return part;
            const codeSpans: string[] = [];
            let p = part.replace(/`[^`\n]*`/g, (c) => {
                codeSpans.push(c);
                return `zzcodezz${codeSpans.length - 1}zz`;
            });
            p = p.replace(/(?<!\\)\$\$([\s\S]+?)\$\$/g, (_m, tex: string) => stash(tex, true));
            // Same rule as the remark-math the site uses: the opening $ cannot be
            // followed by a space and the closing one cannot be preceded by a space.
            // Without it, bash's "$name" and JavaScript's ${var} would become formulas.
            p = p.replace(/(?<!\\)\$(?!\s)([^$\n]*[^\s$])\$/g, (_m, tex: string) =>
                stash(tex, false),
            );
            return p.replace(/zzcodezz(\d+)zz/g, (_m, n: string) => codeSpans[Number(n)] ?? "");
        })
        .join("");
    const html = inline ? md.renderInline(prepared) : md.render(prepared);
    return html.replace(/zzformulazz(\d+)zz/g, (_m, n: string) => {
        const f = formulas[Number(n)];
        if (!f) return "";
        try {
            return katex.renderToString(f.tex, {
                output: "mathml",
                displayMode: f.display,
                throwOnError: false,
                strict: false,
            });
        } catch (err) {
            console.warn("KaTeX rejected a formula, it went into the book as text:", f.tex, err);
            return `<code>${escapeXml(f.tex)}</code>`;
        }
    });
}

// Estúdio table: the value is a JSON matrix and the first row is the header.
// Older content may have a markdown table, hence the fallback.
export function tableToXhtml(value: string): string {
    let grid: string[][] | null = null;
    try {
        const raw: unknown = JSON.parse(value);
        if (Array.isArray(raw) && raw.length > 0 && raw.every((l) => Array.isArray(l))) {
            grid = (raw as unknown[][]).map((l) => l.map((c) => String(c ?? "")));
        }
    } catch (err) {
        console.warn("Table block without valid JSON, it went in as markdown:", err);
    }
    if (!grid) return renderMarkdown(value);
    const [header, ...rows] = grid;
    const th = header.map((c) => `<th>${renderMarkdown(c, true)}</th>`).join("");
    const body = rows
        .map((l) => `<tr>${l.map((c) => `<td>${renderMarkdown(c, true)}</td>`).join("")}</tr>`)
        .join("\n");
    return `<table>\n<thead>\n<tr>${th}</tr>\n</thead>\n<tbody>\n${body}\n</tbody>\n</table>`;
}

// The e-book has no backend to shuffle on every read, and the content is authored
// with the correct option first, so without this the answer key comes out all A.
// The seed is the statement: the same question always lands in the same order, and
// the answer key, built from the same list, keeps matching the letters.
const shuffledOptions = (q: Question) => seededShuffle(q.opcoes, q.statement);

export function quizToXhtml(questions: Question[]): string {
    const questionsHtml = questions
        .map((q, i) => {
            const options = shuffledOptions(q)
                .map((o, k) => {
                    const letter = `${LETTERS[k] ?? "?"}.`;
                    return /```|\n/.test(o.text)
                        ? `<li><p class="opt-letter">${letter}</p>${renderMarkdown(o.text)}</li>`
                        : `<li><p><span class="opt-letter">${letter}</span> ${renderMarkdown(o.text, true)}</p></li>`;
                })
                .join("\n");
            return `<div class="quiz-q">
<p class="quiz-num">Questão ${i + 1}</p>
${renderMarkdown(q.statement)}
<ul class="quiz-opts">
${options}
</ul>
</div>`;
        })
        .join("\n");
    const answerKey = questions
        .map((q, i) => {
            const letters = shuffledOptions(q)
                .map((o, k) => (o.isCorrect ? (LETTERS[k] ?? "?") : null))
                .filter((l): l is string => !!l)
                .join(", ");
            const explanation = q.explanation ? ` ${renderMarkdown(q.explanation, true)}` : "";
            return `<p class="quiz-ans"><span class="quiz-num">Questão ${i + 1}.</span> Resposta: <span class="resp">${letters || "?"}</span>.${explanation}</p>`;
        })
        .join("\n");
    // Most tracks have no explanations in the quiz, and promising comments that
    // never come is worse than just calling it an answer key.
    const hasExplanation = questions.some((q) => !!q.explanation);
    return `<section class="quiz">
<h2>Quiz da aula</h2>
${questionsHtml}
<div class="quiz-gabarito">
<h2>${hasExplanation ? "Gabarito comentado" : "Gabarito"}</h2>
${answerKey}
</div>
</section>`;
}

export const page = (
    title: string,
    body: string,
    cssPath = "../css/livro.css",
) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeXml(title)}</title>
<link rel="stylesheet" type="text/css" href="${cssPath}" />
</head>
<body>
${body}
</body>
</html>
`;

// A chapter's XHTML. The images arrive already resolved by the service: the map
// goes from the block URL to the file path inside the book.
export function chapterToXhtml(
    lesson: { title: string; contentBlocks: Block[] | null; content: string | null },
    kicker: string,
    questions: Question[],
    figures: Map<string, string>,
): string {
    const blocks: Block[] =
        lesson.contentBlocks && lesson.contentBlocks.length > 0
            ? lesson.contentBlocks
            : lesson.content
              ? [{ type: "text", value: lesson.content }]
              : [];
    const body: string[] = [];
    for (const b of blocks) {
        const value = b.value ?? "";
        if (b.type === "code") {
            body.push(`<pre class="codigo"><code>${escapeXml(value)}</code></pre>`);
        } else if (b.type === "quote") {
            body.push(`<blockquote>${renderMarkdown(value)}</blockquote>`);
        } else if (b.type === "table") {
            body.push(tableToXhtml(value));
        } else if (b.type === "terminal") {
            body.push(
                `<aside class="nota"><p>Esta aula tem um terminal interativo para praticar, que funciona na plataforma.</p></aside>`,
            );
        } else if (b.type === "video") {
            if (value) {
                body.push(
                    `<p class="link"><a href="${escapeXml(value)}">Assistir ao vídeo desta aula</a></p>`,
                );
            }
        } else if (b.type === "image") {
            if (!value) continue;
            const filePath = figures.get(value);
            body.push(
                filePath
                    ? `<figure><img src="../${filePath}" alt="Imagem da aula" /></figure>`
                    : `<p class="link"><a href="${escapeXml(value)}">Ver imagem desta aula</a></p>`,
            );
        } else {
            body.push(renderMarkdown(value));
        }
    }
    if (questions.length > 0) body.push(quizToXhtml(questions));
    return page(
        lesson.title,
        `<section class="chapter" epub:type="chapter">
<header class="chapter-header"><p class="chapter-kicker">${escapeXml(kicker)}</p></header>
<h1>${escapeXml(lesson.title)}</h1>
${body.filter(Boolean).join("\n")}
</section>`,
    );
}

// Style meant for e-book readers and Kindle: reading typography, code in a
// wrapping monospace and the quiz set apart from the lesson text.
export const CSS = `@charset "utf-8";

body {
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.5;
    margin: 0 5%;
    text-align: left;
    widows: 2;
    orphans: 2;
}
h1, h2, h3 {
    font-family: Helvetica, Arial, sans-serif;
    line-height: 1.25;
    page-break-after: avoid;
}
h1 { font-size: 1.6em; margin: 0.6em 0 0.8em; }
h2 { font-size: 1.25em; margin: 1.6em 0 0.6em; }
h3 { font-size: 1.1em; margin: 1.4em 0 0.5em; }
p { margin: 0 0 0.9em; }
a { color: #0b5fa5; }
.chapter-header { margin: 0; }
.chapter-kicker {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.78em;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #666;
    margin: 0;
}
code { font-family: "Courier New", monospace; font-size: 0.9em; }
pre.codigo {
    font-family: "Courier New", monospace;
    font-size: 0.8em;
    line-height: 1.35;
    background: #f4f4f4;
    border: 1px solid #ddd;
    padding: 0.7em 0.8em;
    margin: 0 0 1em;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
}
blockquote {
    margin: 0 0 1em;
    padding: 0.1em 0 0.1em 0.9em;
    border-left: 3px solid #bbb;
    font-style: italic;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 1em;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.82em;
}
th, td { border: 1px solid #ccc; padding: 0.4em 0.5em; text-align: left; vertical-align: top; }
th { background: #f0f0f0; }
figure { margin: 1em 0; text-align: center; page-break-inside: avoid; }
figure img { max-width: 100%; }
ul, ol { margin: 0 0 1em 1.2em; padding: 0; }
li { margin: 0 0 0.35em; }
aside.nota {
    border: 1px solid #ddd;
    border-left: 4px solid #999;
    background: #fafafa;
    padding: 0.6em 0.8em;
    margin: 0 0 1em;
    font-size: 0.9em;
}
aside.nota p { margin: 0; }
section.quiz {
    page-break-before: always;
    border-top: 1px solid #ddd;
    padding-top: 0.8em;
}
.quiz-q { margin: 0 0 1.1em; page-break-inside: avoid; }
.quiz-num {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.85em;
    font-weight: bold;
    color: #444;
    margin: 0 0 0.2em;
}
.quiz-opts { list-style: none; margin: 0.3em 0 0 0.2em; }
.quiz-opts li { margin: 0 0 0.3em; }
.quiz-opts p { margin: 0 0 0.3em; }
.opt-letter { font-weight: bold; font-family: Helvetica, Arial, sans-serif; }
.quiz-gabarito { page-break-before: always; border-top: 1px solid #ddd; padding-top: 0.6em; }
.quiz-ans { margin: 0 0 0.7em; font-size: 0.95em; }
.resp { font-weight: bold; }
.capa { text-align: center; margin-top: 20%; }
.capa h1 { font-size: 2em; margin: 0 0 0.3em; }
.capa .subtitulo { font-size: 1.05em; color: #555; margin: 0 0 2.5em; }
.capa .editora {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.9em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #777;
}
.sumario-modulo { font-weight: bold; }
`;

export const CONTAINER = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

export const list = (items: string[] | null | undefined) =>
    items && items.length > 0
        ? `<ul>\n${items.map((i) => `<li>${renderMarkdown(i, true)}</li>`).join("\n")}\n</ul>`
        : "";
