import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    chapterToXhtml,
    escapeXml,
    quizToXhtml,
    renderMarkdown,
    slug,
    tableToXhtml,
} from "./book.ts";

describe("renderMarkdown", () => {
    test("does not treat a shell $ as a formula", () => {
        const html = renderMarkdown('Leia com "$nome" entre aspas e use $1 e $@ no script.');
        assert.ok(!html.includes("<math"));
        assert.ok(html.includes("$nome"));
        assert.ok(html.includes("$1"));
    });

    test("does not treat a JavaScript template literal as a formula", () => {
        const html = renderMarkdown("Veja `Cidade: ${cidade}, país: ${pais}` na saída.");
        assert.ok(!html.includes("<math"));
        assert.ok(html.includes("${cidade}"));
    });

    test("does not treat a price as a formula", () => {
        assert.ok(!renderMarkdown("Caiu de $5 para $3 reais.").includes("<math"));
    });

    test("ignores an escaped dollar sign", () => {
        assert.ok(!renderMarkdown("Use \\$HOME de forma literal.").includes("<math"));
    });

    test("leaves what is inside a code fence alone", () => {
        const html = renderMarkdown('```sh\necho "$HOME e $PATH"\n```');
        assert.ok(!html.includes("<math"));
        assert.ok(html.includes("<pre>"));
    });

    test("turns an inline formula into MathML, keeping the LaTeX", () => {
        const html = renderMarkdown("A média $\\mu$ da população.");
        assert.ok(html.includes("<math"));
        assert.ok(html.includes("\\mu"));
    });

    test("turns a block formula into display block", () => {
        const html = renderMarkdown("Logo:\n\n$$S^2 = \\frac{1}{n-1}$$\n");
        assert.match(html, /<math[^>]*display="block"/);
    });

    test("inline mode does not wrap in a paragraph", () => {
        assert.equal(renderMarkdown("**ok**", true), "<strong>ok</strong>");
    });

    test("closes the tags in XHTML format", () => {
        assert.ok(renderMarkdown("linha  \nquebrada").includes("<br />"));
    });
});

describe("tableToXhtml", () => {
    test("uses the first row of the matrix as the header", () => {
        const html = tableToXhtml(
            JSON.stringify([
                ["Letra", "Nome"],
                ["A", "Atomicidade"],
            ]),
        );
        assert.ok(html.includes("<thead>"));
        assert.ok(html.includes("<th>Letra</th>"));
        assert.ok(html.includes("<td>Atomicidade</td>"));
    });

    test("accepts markdown in the cells", () => {
        const html = tableToXhtml(JSON.stringify([["Campo"], ["**forte**"]]));
        assert.ok(html.includes("<td><strong>forte</strong></td>"));
    });

    test("older content without JSON falls back to markdown", () => {
        const html = tableToXhtml("| a | b |\n| --- | --- |\n| 1 | 2 |");
        assert.ok(html.includes("<table>"));
    });
});

describe("quizToXhtml", () => {
    const questions = [
        {
            statement: "Qual opção está certa?",
            explanation: "Porque sim.",
            opcoes: [
                { text: "errada", isCorrect: false },
                { text: "certa", isCorrect: true },
            ],
        },
    ];

    // The printed letter of each option, in the order the quiz came out.
    const letterOf = (html: string, text: string) =>
        html.match(new RegExp(`([A-J])\\.</span> ${text}`))?.[1];
    const answer = (html: string) => html.match(/Resposta: <span class="resp">([A-J, ]+)</)?.[1];

    test("numbers the questions and the options", () => {
        const html = quizToXhtml(questions);
        assert.ok(html.includes("Questão 1"));
        assert.deepEqual([letterOf(html, "errada"), letterOf(html, "certa")].sort(), ["A", "B"]);
    });

    test("brings the answer key with the right letter and the explanation", () => {
        const html = quizToXhtml(questions);
        assert.ok(html.includes("quiz-gabarito"));
        assert.equal(answer(html), letterOf(html, "certa"));
        assert.ok(html.includes("Porque sim."));
        assert.ok(html.includes("Gabarito comentado"));
    });

    test("does not promise comments when the question has no explanation", () => {
        const html = quizToXhtml(questions.map((q) => ({ ...q, explanation: null })));
        assert.ok(html.includes("<h2>Gabarito</h2>"));
        assert.ok(!html.includes("Gabarito comentado"));
        assert.equal(answer(html), letterOf(html, "certa"));
    });

    // The content is authored with the correct option first and the e-book has no
    // backend to shuffle on every read, so the answer key used to come out all A.
    const fourOptions = (n: number) => ({
        statement: `Enunciado da questão ${n}?`,
        explanation: null,
        opcoes: [
            { text: `certa ${n}`, isCorrect: true },
            { text: `errada ${n} um`, isCorrect: false },
            { text: `errada ${n} dois`, isCorrect: false },
            { text: `errada ${n} três`, isCorrect: false },
        ],
    });

    test("does not let the answer always land on A", () => {
        const html = quizToXhtml(Array.from({ length: 12 }, (_, i) => fourOptions(i)));
        const letters = [...html.matchAll(/Resposta: <span class="resp">([A-J])</g)].map(
            (m) => m[1],
        );
        assert.equal(letters.length, 12);
        assert.ok(new Set(letters).size > 1, `answer key stuck on ${letters.join("")}`);
    });

    test("the answer key letter is the printed correct option's letter", () => {
        for (let i = 0; i < 12; i++) {
            const html = quizToXhtml([fourOptions(i)]);
            assert.equal(answer(html), letterOf(html, `certa ${i}`));
        }
    });

    test("the same question always comes out in the same order", () => {
        assert.equal(quizToXhtml([fourOptions(7)]), quizToXhtml([fourOptions(7)]));
    });
});

describe("chapterToXhtml", () => {
    const lesson = (
        contentBlocks: { type: string; value: string }[] | null,
        content: string | null = null,
    ) => ({
        title: "Aula de teste",
        contentBlocks,
        content,
    });

    test("builds the header, kicker and title", () => {
        const html = chapterToXhtml(
            lesson([{ type: "text", value: "Oi" }]),
            "Módulo 1",
            [],
            new Map(),
        );
        assert.ok(html.includes('<p class="chapter-kicker">Módulo 1</p>'));
        assert.ok(html.includes("<h1>Aula de teste</h1>"));
        assert.ok(html.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    });

    test("escapes the code block", () => {
        const html = chapterToXhtml(
            lesson([{ type: "code", value: "<script>a && b</script>" }]),
            "M",
            [],
            new Map(),
        );
        assert.ok(html.includes("&lt;script&gt;a &amp;&amp; b&lt;/script&gt;"));
        assert.ok(!html.includes("<script>"));
    });

    test("a terminal becomes a note and a video becomes a link", () => {
        const html = chapterToXhtml(
            lesson([
                { type: "terminal", value: "" },
                { type: "video", value: "https://youtu.be/abc" },
            ]),
            "M",
            [],
            new Map(),
        );
        assert.ok(html.includes("terminal interativo"));
        assert.ok(html.includes('href="https://youtu.be/abc"'));
    });

    test("a resolved image goes in as a figure and a failed one becomes a link", () => {
        const withFile = chapterToXhtml(
            lesson([{ type: "image", value: "/uploads/a.png" }]),
            "M",
            [],
            new Map([["/uploads/a.png", "img/abc.png"]]),
        );
        assert.ok(withFile.includes('<img src="../img/abc.png"'));
        const withoutFile = chapterToXhtml(
            lesson([{ type: "image", value: "https://exemplo.com/a.png" }]),
            "M",
            [],
            new Map(),
        );
        assert.ok(withoutFile.includes('href="https://exemplo.com/a.png"'));
    });

    test("uses the content field when the lesson has no blocks", () => {
        const html = chapterToXhtml(lesson([], "## Conteúdo antigo"), "M", [], new Map());
        assert.ok(html.includes("<h2>Conteúdo antigo</h2>"));
    });
});

describe("escapeXml and slug", () => {
    test("escapes what would break the XHTML", () => {
        assert.equal(escapeXml('a < b & c "d"'), "a &lt; b &amp; c &quot;d&quot;");
    });

    test("slug strips accents and spaces", () => {
        assert.equal(slug("Estatística Matemática"), "estatistica-matematica");
        assert.equal(slug("???"), "livro");
    });
});
