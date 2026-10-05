// Conteúdo do livro da trilha: markdown das aulas, tabelas, quiz e o XHTML de
// cada capítulo. Fica no domínio porque é função pura do conteúdo, sem banco,
// disco nem zip, e é o que os testes cobrem.
import MarkdownIt from "markdown-it";
import katex from "katex";

export const LETRAS = "ABCDEFGHIJ";

export type Bloco = { type: string; value: string };
export type Questao = {
    statement: string;
    explanation: string | null;
    opcoes: { text: string; isCorrect: boolean }[];
};

const md = new MarkdownIt({ html: false, xhtmlOut: true, linkify: false, typographer: false });

export const escapar = (t: string) =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const slug = (t: string) =>
    t
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "livro";

// Protege cercas de código e código inline, troca a matemática por marcadores e
// só então roda o markdown. Assim o $ de um comando de shell não vira fórmula e
// o KaTeX recebe o LaTeX intacto, virando MathML (o padrão do EPUB 3).
export function renderizarMarkdown(texto: string, inline = false): string {
    const formulas: { tex: string; display: boolean }[] = [];
    const guardar = (tex: string, display: boolean) => {
        formulas.push({ tex: tex.trim(), display });
        return `zzformulazz${formulas.length - 1}zz`;
    };
    const preparado = texto
        .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
        .map((parte, i) => {
            if (i % 2 === 1) return parte;
            const codigos: string[] = [];
            let p = parte.replace(/`[^`\n]*`/g, (c) => {
                codigos.push(c);
                return `zzcodigozz${codigos.length - 1}zz`;
            });
            p = p.replace(/(?<!\\)\$\$([\s\S]+?)\$\$/g, (_m, tex: string) => guardar(tex, true));
            // Mesma regra do remark-math que o site usa: o $ de abertura não pode
            // ser seguido de espaço e o de fechamento não pode ser precedido de
            // espaço. Sem isso, "$nome" do bash e ${var} do JavaScript viram fórmula.
            p = p.replace(/(?<!\\)\$(?!\s)([^$\n]*[^\s$])\$/g, (_m, tex: string) =>
                guardar(tex, false),
            );
            return p.replace(/zzcodigozz(\d+)zz/g, (_m, n: string) => codigos[Number(n)] ?? "");
        })
        .join("");
    const html = inline ? md.renderInline(preparado) : md.render(preparado);
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
            console.warn("Fórmula recusada pelo KaTeX, entrou como texto no livro:", f.tex, err);
            return `<code>${escapar(f.tex)}</code>`;
        }
    });
}

// Tabela do Estúdio: o value é uma matriz JSON e a primeira linha é o cabeçalho.
// Conteúdo antigo pode ter tabela em markdown, daí o fallback.
export function tabelaParaXhtml(value: string): string {
    let grid: string[][] | null = null;
    try {
        const bruto: unknown = JSON.parse(value);
        if (Array.isArray(bruto) && bruto.length > 0 && bruto.every((l) => Array.isArray(l))) {
            grid = (bruto as unknown[][]).map((l) => l.map((c) => String(c ?? "")));
        }
    } catch (err) {
        console.warn("Bloco de tabela sem JSON válido, entrou como markdown:", err);
    }
    if (!grid) return renderizarMarkdown(value);
    const [cabecalho, ...linhas] = grid;
    const th = cabecalho.map((c) => `<th>${renderizarMarkdown(c, true)}</th>`).join("");
    const corpo = linhas
        .map((l) => `<tr>${l.map((c) => `<td>${renderizarMarkdown(c, true)}</td>`).join("")}</tr>`)
        .join("\n");
    return `<table>\n<thead>\n<tr>${th}</tr>\n</thead>\n<tbody>\n${corpo}\n</tbody>\n</table>`;
}

export function quizParaXhtml(questoes: Questao[]): string {
    const perguntas = questoes
        .map((q, i) => {
            const opcoes = q.opcoes
                .map((o, k) => {
                    const letra = `${LETRAS[k] ?? "?"}.`;
                    return /```|\n/.test(o.text)
                        ? `<li><p class="opt-letter">${letra}</p>${renderizarMarkdown(o.text)}</li>`
                        : `<li><p><span class="opt-letter">${letra}</span> ${renderizarMarkdown(o.text, true)}</p></li>`;
                })
                .join("\n");
            return `<div class="quiz-q">
<p class="quiz-num">Questão ${i + 1}</p>
${renderizarMarkdown(q.statement)}
<ul class="quiz-opts">
${opcoes}
</ul>
</div>`;
        })
        .join("\n");
    const gabarito = questoes
        .map((q, i) => {
            const letras = q.opcoes
                .map((o, k) => (o.isCorrect ? (LETRAS[k] ?? "?") : null))
                .filter((l): l is string => !!l)
                .join(", ");
            const resolucao = q.explanation ? ` ${renderizarMarkdown(q.explanation, true)}` : "";
            return `<p class="quiz-ans"><span class="quiz-num">Questão ${i + 1}.</span> Resposta: <span class="resp">${letras || "?"}</span>.${resolucao}</p>`;
        })
        .join("\n");
    // A maioria das trilhas não tem resolução no quiz, e prometer comentário
    // que não vem é pior que só chamar de gabarito.
    const temResolucao = questoes.some((q) => !!q.explanation);
    return `<section class="quiz">
<h2>Quiz da aula</h2>
${perguntas}
<div class="quiz-gabarito">
<h2>${temResolucao ? "Gabarito comentado" : "Gabarito"}</h2>
${gabarito}
</div>
</section>`;
}

export const pagina = (
    titulo: string,
    corpo: string,
    cssRelativo = "../css/livro.css",
) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapar(titulo)}</title>
<link rel="stylesheet" type="text/css" href="${cssRelativo}" />
</head>
<body>
${corpo}
</body>
</html>
`;

// XHTML de um capítulo. As imagens já vêm resolvidas pelo service: o mapa leva
// da URL do bloco para o caminho do arquivo dentro do livro.
export function capituloParaXhtml(
    aula: { title: string; contentBlocks: Bloco[] | null; content: string | null },
    tarja: string,
    questoes: Questao[],
    figuras: Map<string, string>,
): string {
    const blocos: Bloco[] =
        aula.contentBlocks && aula.contentBlocks.length > 0
            ? aula.contentBlocks
            : aula.content
              ? [{ type: "text", value: aula.content }]
              : [];
    const corpo: string[] = [];
    for (const b of blocos) {
        const valor = b.value ?? "";
        if (b.type === "code") {
            corpo.push(`<pre class="codigo"><code>${escapar(valor)}</code></pre>`);
        } else if (b.type === "quote") {
            corpo.push(`<blockquote>${renderizarMarkdown(valor)}</blockquote>`);
        } else if (b.type === "table") {
            corpo.push(tabelaParaXhtml(valor));
        } else if (b.type === "terminal") {
            corpo.push(
                `<aside class="nota"><p>Esta aula tem um terminal interativo para praticar, que funciona na plataforma.</p></aside>`,
            );
        } else if (b.type === "video") {
            if (valor) {
                corpo.push(
                    `<p class="link"><a href="${escapar(valor)}">Assistir ao vídeo desta aula</a></p>`,
                );
            }
        } else if (b.type === "image") {
            if (!valor) continue;
            const caminho = figuras.get(valor);
            corpo.push(
                caminho
                    ? `<figure><img src="../${caminho}" alt="Imagem da aula" /></figure>`
                    : `<p class="link"><a href="${escapar(valor)}">Ver imagem desta aula</a></p>`,
            );
        } else {
            corpo.push(renderizarMarkdown(valor));
        }
    }
    if (questoes.length > 0) corpo.push(quizParaXhtml(questoes));
    return pagina(
        aula.title,
        `<section class="chapter" epub:type="chapter">
<header class="chapter-header"><p class="chapter-kicker">${escapar(tarja)}</p></header>
<h1>${escapar(aula.title)}</h1>
${corpo.filter(Boolean).join("\n")}
</section>`,
    );
}

// Estilo pensado para leitor de e-book e Kindle: tipografia de leitura, código
// em monoespaçada com quebra de linha e quiz separado do texto da aula.
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

export const lista = (itens: string[] | null | undefined) =>
    itens && itens.length > 0
        ? `<ul>\n${itens.map((i) => `<li>${renderizarMarkdown(i, true)}</li>`).join("\n")}\n</ul>`
        : "";
