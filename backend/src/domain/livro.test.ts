import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    capituloParaXhtml,
    escapar,
    quizParaXhtml,
    renderizarMarkdown,
    slug,
    tabelaParaXhtml,
} from "./livro.ts";

describe("renderizarMarkdown", () => {
    test("não trata $ de shell como fórmula", () => {
        const html = renderizarMarkdown('Leia com "$nome" entre aspas e use $1 e $@ no script.');
        assert.ok(!html.includes("<math"));
        assert.ok(html.includes("$nome"));
        assert.ok(html.includes("$1"));
    });

    test("não trata template literal do JavaScript como fórmula", () => {
        const html = renderizarMarkdown("Veja `Cidade: ${cidade}, país: ${pais}` na saída.");
        assert.ok(!html.includes("<math"));
        assert.ok(html.includes("${cidade}"));
    });

    test("não trata preço como fórmula", () => {
        assert.ok(!renderizarMarkdown("Caiu de $5 para $3 reais.").includes("<math"));
    });

    test("ignora o dólar escapado", () => {
        assert.ok(!renderizarMarkdown("Use \\$HOME de forma literal.").includes("<math"));
    });

    test("não mexe no que está dentro de cerca de código", () => {
        const html = renderizarMarkdown('```sh\necho "$HOME e $PATH"\n```');
        assert.ok(!html.includes("<math"));
        assert.ok(html.includes("<pre>"));
    });

    test("converte fórmula inline em MathML, guardando o LaTeX", () => {
        const html = renderizarMarkdown("A média $\\mu$ da população.");
        assert.ok(html.includes("<math"));
        assert.ok(html.includes("\\mu"));
    });

    test("converte fórmula em bloco com display block", () => {
        const html = renderizarMarkdown("Logo:\n\n$$S^2 = \\frac{1}{n-1}$$\n");
        assert.match(html, /<math[^>]*display="block"/);
    });

    test("no modo inline não embrulha em parágrafo", () => {
        assert.equal(renderizarMarkdown("**ok**", true), "<strong>ok</strong>");
    });

    test("fecha as tags no formato XHTML", () => {
        assert.ok(renderizarMarkdown("linha  \nquebrada").includes("<br />"));
    });
});

describe("tabelaParaXhtml", () => {
    test("usa a primeira linha da matriz como cabeçalho", () => {
        const html = tabelaParaXhtml(
            JSON.stringify([
                ["Letra", "Nome"],
                ["A", "Atomicidade"],
            ]),
        );
        assert.ok(html.includes("<thead>"));
        assert.ok(html.includes("<th>Letra</th>"));
        assert.ok(html.includes("<td>Atomicidade</td>"));
    });

    test("aceita markdown nas células", () => {
        const html = tabelaParaXhtml(JSON.stringify([["Campo"], ["**forte**"]]));
        assert.ok(html.includes("<td><strong>forte</strong></td>"));
    });

    test("conteúdo antigo sem JSON cai para markdown", () => {
        const html = tabelaParaXhtml("| a | b |\n| --- | --- |\n| 1 | 2 |");
        assert.ok(html.includes("<table>"));
    });
});

describe("quizParaXhtml", () => {
    const questoes = [
        {
            statement: "Qual opção está certa?",
            explanation: "Porque sim.",
            opcoes: [
                { text: "errada", isCorrect: false },
                { text: "certa", isCorrect: true },
            ],
        },
    ];

    test("numera as questões e as opções", () => {
        const html = quizParaXhtml(questoes);
        assert.ok(html.includes("Questão 1"));
        assert.ok(html.includes("A.</span> errada"));
        assert.ok(html.includes("B.</span> certa"));
    });

    test("traz o gabarito com a letra correta e a resolução", () => {
        const html = quizParaXhtml(questoes);
        assert.ok(html.includes("quiz-gabarito"));
        assert.match(html, /Resposta: <span class="resp">B<\/span>/);
        assert.ok(html.includes("Porque sim."));
    });
});

describe("capituloParaXhtml", () => {
    const aula = (
        contentBlocks: { type: string; value: string }[] | null,
        content: string | null = null,
    ) => ({
        title: "Aula de teste",
        contentBlocks,
        content,
    });

    test("monta cabeçalho, tarja e título", () => {
        const html = capituloParaXhtml(
            aula([{ type: "text", value: "Oi" }]),
            "Módulo 1",
            [],
            new Map(),
        );
        assert.ok(html.includes('<p class="chapter-kicker">Módulo 1</p>'));
        assert.ok(html.includes("<h1>Aula de teste</h1>"));
        assert.ok(html.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    });

    test("escapa o bloco de código", () => {
        const html = capituloParaXhtml(
            aula([{ type: "code", value: "<script>a && b</script>" }]),
            "M",
            [],
            new Map(),
        );
        assert.ok(html.includes("&lt;script&gt;a &amp;&amp; b&lt;/script&gt;"));
        assert.ok(!html.includes("<script>"));
    });

    test("terminal vira nota e vídeo vira link", () => {
        const html = capituloParaXhtml(
            aula([
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

    test("imagem resolvida entra como figura e a que falhou vira link", () => {
        const comArquivo = capituloParaXhtml(
            aula([{ type: "image", value: "/uploads/a.png" }]),
            "M",
            [],
            new Map([["/uploads/a.png", "img/abc.png"]]),
        );
        assert.ok(comArquivo.includes('<img src="../img/abc.png"'));
        const semArquivo = capituloParaXhtml(
            aula([{ type: "image", value: "https://exemplo.com/a.png" }]),
            "M",
            [],
            new Map(),
        );
        assert.ok(semArquivo.includes('href="https://exemplo.com/a.png"'));
    });

    test("usa o campo content quando a aula não tem blocos", () => {
        const html = capituloParaXhtml(aula([], "## Conteúdo antigo"), "M", [], new Map());
        assert.ok(html.includes("<h2>Conteúdo antigo</h2>"));
    });
});

describe("escapar e slug", () => {
    test("escapa o que quebraria o XHTML", () => {
        assert.equal(escapar('a < b & c "d"'), "a &lt; b &amp; c &quot;d&quot;");
    });

    test("slug tira acento e espaço", () => {
        assert.equal(slug("Estatística Matemática"), "estatistica-matematica");
        assert.equal(slug("???"), "livro");
    });
});
