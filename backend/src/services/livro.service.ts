// Livro da trilha em EPUB: o aluno baixa a trilha inteira como e-book, um
// capítulo por aula na ordem dos módulos, com o quiz e o gabarito comentado no
// fim de cada capítulo. É EPUB 3 com NCX, formato que o Kindle também abre.
//
// O arquivo pronto fica em cache no volume de uploads e o nome carrega um hash
// do conteúdo: aula editada muda o hash e o livro é gerado de novo no próximo
// download.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db.ts";
import { lessons, modules, questionOptions, questions, trails } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { LIVROS_DIR, UPLOADS_DIR } from "../config/paths.ts";
import {
    CONTAINER,
    CSS,
    capituloParaXhtml,
    escapar,
    lista,
    pagina,
    renderizarMarkdown,
    slug,
    type Questao,
} from "../domain/livro.ts";

// Sobe quando o gerador muda, para os livros em cache serem refeitos.
const VERSAO_GERADOR = 5;
const EDITORA = "Ensina Dev";
const NIVEIS: Record<string, string> = {
    iniciante: "Nível iniciante",
    intermediario: "Nível intermediário",
    avancado: "Nível avançado",
};

type Figura = { caminho: string; conteudo: Buffer; tipo: string };

const TIPOS_IMAGEM: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
};

// Imagem do bloco: arquivo local do uploads ou URL externa. O que não baixar
// entra como link, para o capítulo não perder a referência.
async function buscarImagem(url: string): Promise<Figura | null> {
    const ext = (url.split("?")[0].split(".").pop() ?? "").toLowerCase();
    const tipo = TIPOS_IMAGEM[ext];
    if (!tipo) return null;
    const nome = `img/${createHash("sha1").update(url).digest("hex").slice(0, 12)}.${ext}`;
    try {
        if (url.startsWith("/uploads/")) {
            const conteudo = await readFile(path.join(UPLOADS_DIR, url.slice("/uploads/".length)));
            return { caminho: nome, conteudo, tipo };
        }
        if (/^https?:\/\//.test(url)) {
            const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return { caminho: nome, conteudo: Buffer.from(await resp.arrayBuffer()), tipo };
        }
    } catch (err) {
        console.warn("Imagem que não entrou no livro, virou link:", url, err);
    }
    return null;
}

export async function livroDaTrilha(trailId: string, lang?: string) {
    if (!/^[0-9a-f-]{36}$/i.test(trailId)) throw new AppError(404, "Trilha não encontrada");
    const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trilha) throw new AppError(404, "Trilha não encontrada");

    const mods = await db
        .select({ id: modules.id, title: modules.title, position: modules.position })
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));
    const publicadas = await db
        .select({
            id: lessons.id,
            title: lessons.title,
            contentBlocks: lessons.contentBlocks,
            content: lessons.content,
            moduleId: lessons.moduleId,
            position: lessons.position,
            language: lessons.language,
        })
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)))
        .orderBy(asc(lessons.position));

    // Mesma regra da tela da trilha: aula com language null é neutra e entra
    // sempre; as demais só na linguagem escolhida (padrão: a primeira).
    const idiomas = [
        ...new Set(publicadas.map((a) => a.language).filter((l): l is string => !!l)),
    ].sort();
    const idioma = idiomas.length > 0 ? (lang && idiomas.includes(lang) ? lang : idiomas[0]) : null;
    const aulas = idioma
        ? publicadas.filter((a) => a.language === null || a.language === idioma)
        : publicadas;
    if (aulas.length === 0) throw new AppError(404, "Esta trilha ainda não tem aulas publicadas");

    const ordemDoModulo = new Map(mods.map((m, i) => [m.id, i]));
    aulas.sort(
        (a, b) =>
            (ordemDoModulo.get(a.moduleId) ?? 0) - (ordemDoModulo.get(b.moduleId) ?? 0) ||
            a.position - b.position,
    );

    const ids = aulas.map((a) => a.id);
    const qs = await db
        .select({
            id: questions.id,
            lessonId: questions.lessonId,
            statement: questions.statement,
            explanation: questions.explanation,
            position: questions.position,
        })
        .from(questions)
        .where(inArray(questions.lessonId, ids))
        .orderBy(asc(questions.position));
    const ops = qs.length
        ? await db
              .select({
                  questionId: questionOptions.questionId,
                  text: questionOptions.text,
                  isCorrect: questionOptions.isCorrect,
                  position: questionOptions.position,
              })
              .from(questionOptions)
              .where(
                  inArray(
                      questionOptions.questionId,
                      qs.map((q) => q.id),
                  ),
              )
              .orderBy(asc(questionOptions.position))
        : [];

    const opcoesPorQuestao = new Map<string, { text: string; isCorrect: boolean }[]>();
    for (const o of ops) {
        const arr = opcoesPorQuestao.get(o.questionId) ?? [];
        arr.push({ text: o.text, isCorrect: o.isCorrect });
        opcoesPorQuestao.set(o.questionId, arr);
    }
    const quizPorAula = new Map<string, Questao[]>();
    for (const q of qs) {
        const arr = quizPorAula.get(q.lessonId) ?? [];
        arr.push({
            statement: q.statement,
            explanation: q.explanation,
            opcoes: opcoesPorQuestao.get(q.id) ?? [],
        });
        quizPorAula.set(q.lessonId, arr);
    }

    const assinatura = JSON.stringify({
        VERSAO_GERADOR,
        trilha: {
            name: trilha.name,
            description: trilha.description,
            level: trilha.trailLevel,
            whatYouLearn: trilha.whatYouLearn,
            prerequisites: trilha.prerequisites,
            workloadHours: trilha.workloadHours,
        },
        mods,
        aulas,
        quiz: [...quizPorAula.entries()],
    });
    const hash = createHash("sha1").update(assinatura).digest("hex").slice(0, 12);
    const nome = `${slug(trilha.name)}${idioma ? `-${slug(idioma)}` : ""}.epub`;
    const emCache = path.join(LIVROS_DIR, `${trailId}-${idioma ?? "unico"}-${hash}.epub`);
    try {
        return { buffer: await readFile(emCache), nome };
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
            console.warn("Livro em cache ilegível, gerando de novo:", emCache, err);
        }
    }

    // As imagens dos blocos são baixadas uma vez só, antes dos capítulos, porque
    // a montagem do XHTML é pura e recebe só o caminho de cada arquivo no livro.
    const figuras = new Map<string, Figura>();
    const caminhoDaImagem = new Map<string, string>();
    for (const aula of aulas) {
        for (const b of aula.contentBlocks ?? []) {
            if (b.type !== "image" || !b.value || caminhoDaImagem.has(b.value)) continue;
            const figura = await buscarImagem(b.value);
            if (!figura) continue;
            figuras.set(b.value, figura);
            caminhoDaImagem.set(b.value, figura.caminho);
        }
    }

    const usados = new Set<string>();
    const capitulos: {
        id: string;
        arquivo: string;
        titulo: string;
        moduloId: string;
        xhtml: string;
    }[] = [];
    for (const aula of aulas) {
        const mod = mods.find((m) => m.id === aula.moduleId);
        const indice = mod ? (ordemDoModulo.get(mod.id) ?? 0) + 1 : 0;
        // Título que já começa com número ou com "Módulo" não leva numeração de novo.
        const tarja = mod
            ? /^(\d|m[oó]dulo)/i.test(mod.title.trim())
                ? mod.title
                : `${String(indice).padStart(2, "0")}. ${mod.title}`
            : trilha.name;
        let arquivo = `ch-${slug(mod?.title ?? "modulo")}-${slug(aula.title)}.xhtml`;
        while (usados.has(arquivo))
            arquivo = arquivo.replace(/(-\d+)?\.xhtml$/, `-${usados.size}.xhtml`);
        usados.add(arquivo);
        capitulos.push({
            id: `ch-${slug(aula.title)}-${aula.id.slice(0, 8)}`,
            arquivo,
            titulo: aula.title,
            moduloId: aula.moduleId,
            xhtml: capituloParaXhtml(aula, tarja, quizPorAula.get(aula.id) ?? [], caminhoDaImagem),
        });
    }

    const agora = new Date();
    const dia = agora.toISOString().slice(0, 10);
    const nivel = NIVEIS[trilha.trailLevel] ?? "";
    const comQuiz = capitulos.filter((c) => c.xhtml.includes("quiz-gabarito")).length;
    const capa = pagina(
        trilha.name,
        `<section class="capa" epub:type="titlepage">
<h1>${escapar(trilha.name)}</h1>
<p class="subtitulo">${escapar([nivel, `${aulas.length} aulas`, idioma ? `em ${idioma}` : ""].filter(Boolean).join(", "))}</p>
<p class="editora">${escapar(EDITORA)}</p>
</section>`,
    );
    const sobre = pagina(
        "Sobre este livro",
        `<section class="chapter" epub:type="preamble">
<h1>Sobre este livro</h1>
${renderizarMarkdown(trilha.description)}
<h2>Como o livro está organizado</h2>
<p>Cada capítulo é uma aula da trilha <strong>${escapar(trilha.name)}</strong>, na mesma ordem dos módulos da plataforma. ${comQuiz > 0 ? "No fim do capítulo vem o quiz da aula, com o gabarito comentado logo depois, para você responder antes de conferir." : ""}</p>
${lista(trilha.whatYouLearn) ? `<h2>O que você aprende</h2>\n${lista(trilha.whatYouLearn)}` : ""}
${lista(trilha.prerequisites) ? `<h2>Pré-requisitos</h2>\n${lista(trilha.prerequisites)}` : ""}
<h2>Ficha</h2>
<ul>
<li>${escapar(String(aulas.length))} aulas em ${escapar(String(mods.length))} módulos</li>
${trilha.workloadHours ? `<li>Carga horária de ${escapar(String(trilha.workloadHours))} horas</li>` : ""}
${nivel ? `<li>${escapar(nivel)}</li>` : ""}
<li>Versão gerada em ${escapar(dia)}</li>
</ul>
<aside class="nota"><p>Os laboratórios, os desafios de código e o registro de progresso continuam na plataforma: este livro é a parte de leitura da trilha, para estudar offline.</p></aside>
</section>`,
    );

    const itensNav = mods
        .map((m) => {
            const doModulo = capitulos.filter((c) => c.moduloId === m.id);
            if (doModulo.length === 0) return "";
            const filhos = doModulo
                .map((c) => `      <li><a href="text/${c.arquivo}">${escapar(c.titulo)}</a></li>`)
                .join("\n");
            return `  <li><span class="sumario-modulo">${escapar(m.title)}</span>\n    <ol>\n${filhos}\n    </ol>\n  </li>`;
        })
        .filter(Boolean)
        .join("\n");
    const nav = pagina(
        "Sumário",
        `<nav epub:type="toc" id="toc">
<h1>Sumário</h1>
<ol>
  <li><a href="text/sobre.xhtml">Sobre este livro</a></li>
${itensNav}
</ol>
</nav>
<nav epub:type="landmarks" id="landmarks" hidden="hidden">
<ol>
  <li><a epub:type="titlepage" href="text/capa.xhtml">Capa</a></li>
  <li><a epub:type="bodymatter" href="text/${capitulos[0].arquivo}">Começo do conteúdo</a></li>
</ol>
</nav>`,
        "css/livro.css",
    );

    let ordem = 1;
    const pontos = [
        `    <navPoint id="nav-sobre" playOrder="${ordem++}"><navLabel><text>Sobre este livro</text></navLabel><content src="text/sobre.xhtml"/></navPoint>`,
    ];
    for (const m of mods) {
        const doModulo = capitulos.filter((c) => c.moduloId === m.id);
        if (doModulo.length === 0) continue;
        // O playOrder do módulo vem antes dos capítulos dele, senão o leitor
        // recebe a mesma ordem duas vezes e navega fora de sequência.
        const ordemDoModulo = ordem++;
        const filhos = doModulo
            .map(
                (c) =>
                    `      <navPoint id="nav-${c.id}" playOrder="${ordem++}"><navLabel><text>${escapar(c.titulo)}</text></navLabel><content src="text/${c.arquivo}"/></navPoint>`,
            )
            .join("\n");
        pontos.push(
            `    <navPoint id="nav-mod-${slug(m.title)}" playOrder="${ordemDoModulo}"><navLabel><text>${escapar(m.title)}</text></navLabel><content src="text/${doModulo[0].arquivo}"/>\n${filhos}\n    </navPoint>`,
        );
    }
    const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="pt-BR">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${trailId}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapar(trilha.name)}</text></docTitle>
  <docAuthor><text>${escapar(EDITORA)}</text></docAuthor>
  <navMap>
${pontos.join("\n")}
  </navMap>
</ncx>
`;

    const manifesto = [
        `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
        `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
        `    <item id="css" href="css/livro.css" media-type="text/css"/>`,
        `    <item id="capa" href="text/capa.xhtml" media-type="application/xhtml+xml"/>`,
        `    <item id="sobre" href="text/sobre.xhtml" media-type="application/xhtml+xml"/>`,
        ...capitulos.map(
            (c) =>
                `    <item id="${c.id}" href="text/${c.arquivo}" media-type="application/xhtml+xml"${c.xhtml.includes("<math") ? ' properties="mathml"' : ""}/>`,
        ),
        ...[...figuras.values()].map(
            (f, i) => `    <item id="img-${i}" href="${f.caminho}" media-type="${f.tipo}"/>`,
        ),
    ].join("\n");
    const espinha = [
        `    <itemref idref="capa"/>`,
        `    <itemref idref="sobre"/>`,
        ...capitulos.map((c) => `    <itemref idref="${c.id}"/>`),
    ].join("\n");
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="pt-BR">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${trailId}</dc:identifier>
    <dc:title>${escapar(trilha.name)}</dc:title>
    <dc:creator id="creator">${escapar(EDITORA)}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <dc:language>pt-BR</dc:language>
    <dc:date>${dia}</dc:date>
    <dc:publisher>${escapar(EDITORA)}</dc:publisher>
    <dc:description>${escapar(trilha.description)}</dc:description>
    <meta property="dcterms:modified">${agora.toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
${manifesto}
  </manifest>
  <spine toc="ncx">
${espinha}
  </spine>
</package>
`;

    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", CONTAINER);
    zip.file("OEBPS/css/livro.css", CSS);
    zip.file("OEBPS/text/capa.xhtml", capa);
    zip.file("OEBPS/text/sobre.xhtml", sobre);
    for (const c of capitulos) zip.file(`OEBPS/text/${c.arquivo}`, c.xhtml);
    for (const f of figuras.values()) zip.file(`OEBPS/${f.caminho}`, f.conteudo);
    zip.file("OEBPS/nav.xhtml", nav);
    zip.file("OEBPS/toc.ncx", ncx);
    zip.file("OEBPS/content.opf", opf);
    const buffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
    });

    try {
        await mkdir(LIVROS_DIR, { recursive: true });
        await writeFile(emCache, buffer);
        // Versões antigas desta mesma trilha não servem mais: sem isso cada
        // edição de aula deixaria um arquivo órfão no volume.
        const prefixo = `${trailId}-${idioma ?? "unico"}-`;
        const atual = path.basename(emCache);
        for (const nomeArquivo of await readdir(LIVROS_DIR)) {
            if (nomeArquivo.startsWith(prefixo) && nomeArquivo !== atual) {
                await unlink(path.join(LIVROS_DIR, nomeArquivo));
            }
        }
    } catch (err) {
        console.warn("Não deu para guardar o livro em cache, seguindo com o download:", err);
    }
    return { buffer, nome };
}
