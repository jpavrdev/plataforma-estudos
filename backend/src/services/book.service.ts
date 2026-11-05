// The track as an EPUB book: the student downloads the whole track as an e-book,
// one chapter per lesson in module order, with the quiz and the commented answer
// key at the end of each chapter. It is EPUB 3 with NCX, a format Kindle also opens.
//
// The finished file is cached in the uploads volume and its name carries a hash of
// the content: an edited lesson changes the hash and the book is built again on the
// next download.
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
    chapterToXhtml,
    escapeXml,
    list,
    page,
    renderMarkdown,
    slug,
    type Question,
} from "../domain/book.ts";

// Goes up when the generator changes, so the cached books are rebuilt.
const GENERATOR_VERSION = 6;
const PUBLISHER = "Ensina Dev";
const LEVEL_LABELS: Record<string, string> = {
    iniciante: "Nível iniciante",
    intermediario: "Nível intermediário",
    avancado: "Nível avançado",
};

type Figure = { caminho: string; conteudo: Buffer; tipo: string };

const IMAGE_TYPES: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
};

// The block's image: a local file from uploads or an external URL. What does not
// download goes in as a link, so the chapter keeps the reference.
async function fetchImage(url: string): Promise<Figure | null> {
    const ext = (url.split("?")[0].split(".").pop() ?? "").toLowerCase();
    const mimeType = IMAGE_TYPES[ext];
    if (!mimeType) return null;
    const fileName = `img/${createHash("sha1").update(url).digest("hex").slice(0, 12)}.${ext}`;
    try {
        if (url.startsWith("/uploads/")) {
            const content = await readFile(path.join(UPLOADS_DIR, url.slice("/uploads/".length)));
            return { caminho: fileName, conteudo: content, tipo: mimeType };
        }
        if (/^https?:\/\//.test(url)) {
            const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return {
                caminho: fileName,
                conteudo: Buffer.from(await response.arrayBuffer()),
                tipo: mimeType,
            };
        }
    } catch (err) {
        console.warn("Image left out of the book, kept as a link:", url, err);
    }
    return null;
}

export async function buildTrailBook(trailId: string, lang?: string) {
    if (!/^[0-9a-f-]{36}$/i.test(trailId)) throw new AppError(404, "trail.notFound");
    const [trail] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trail) throw new AppError(404, "trail.notFound");

    const mods = await db
        .select({ id: modules.id, title: modules.title, position: modules.position })
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));
    const publishedLessons = await db
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

    // Same rule as the track screen: a lesson with language null is neutral and always
    // goes in; the others only in the chosen language (default: the first one).
    const languages = [
        ...new Set(publishedLessons.map((a) => a.language).filter((l): l is string => !!l)),
    ].sort();
    const language =
        languages.length > 0 ? (lang && languages.includes(lang) ? lang : languages[0]) : null;
    const bookLessons = language
        ? publishedLessons.filter((a) => a.language === null || a.language === language)
        : publishedLessons;
    if (bookLessons.length === 0) throw new AppError(404, "book.noPublishedLessons");

    const moduleOrder = new Map(mods.map((m, i) => [m.id, i]));
    bookLessons.sort(
        (a, b) =>
            (moduleOrder.get(a.moduleId) ?? 0) - (moduleOrder.get(b.moduleId) ?? 0) ||
            a.position - b.position,
    );

    const ids = bookLessons.map((a) => a.id);
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

    const optionsByQuestion = new Map<string, { text: string; isCorrect: boolean }[]>();
    for (const o of ops) {
        const arr = optionsByQuestion.get(o.questionId) ?? [];
        arr.push({ text: o.text, isCorrect: o.isCorrect });
        optionsByQuestion.set(o.questionId, arr);
    }
    const quizByLesson = new Map<string, Question[]>();
    for (const q of qs) {
        const arr = quizByLesson.get(q.lessonId) ?? [];
        arr.push({
            statement: q.statement,
            explanation: q.explanation,
            opcoes: optionsByQuestion.get(q.id) ?? [],
        });
        quizByLesson.set(q.lessonId, arr);
    }

    const signature = JSON.stringify({
        VERSAO_GERADOR: GENERATOR_VERSION,
        trilha: {
            name: trail.name,
            description: trail.description,
            level: trail.trailLevel,
            whatYouLearn: trail.whatYouLearn,
            prerequisites: trail.prerequisites,
            workloadHours: trail.workloadHours,
        },
        mods,
        aulas: bookLessons,
        quiz: [...quizByLesson.entries()],
    });
    const hash = createHash("sha1").update(signature).digest("hex").slice(0, 12);
    const fileName = `${slug(trail.name)}${language ? `-${slug(language)}` : ""}.epub`;
    const cachedPath = path.join(LIVROS_DIR, `${trailId}-${language ?? "unico"}-${hash}.epub`);
    try {
        return { buffer: await readFile(cachedPath), nome: fileName };
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
            console.warn("Cached book unreadable, building it again:", cachedPath, err);
        }
    }

    // The block images are downloaded only once, before the chapters, because
    // building the XHTML is pure and only receives each file's path in the book.
    const figures = new Map<string, Figure>();
    const imagePathByUrl = new Map<string, string>();
    for (const lesson of bookLessons) {
        for (const b of lesson.contentBlocks ?? []) {
            if (b.type !== "image" || !b.value || imagePathByUrl.has(b.value)) continue;
            const figure = await fetchImage(b.value);
            if (!figure) continue;
            figures.set(b.value, figure);
            imagePathByUrl.set(b.value, figure.caminho);
        }
    }

    const usedFiles = new Set<string>();
    const chapters: {
        id: string;
        arquivo: string;
        titulo: string;
        moduloId: string;
        xhtml: string;
    }[] = [];
    for (const lesson of bookLessons) {
        const mod = mods.find((m) => m.id === lesson.moduleId);
        const moduleNumber = mod ? (moduleOrder.get(mod.id) ?? 0) + 1 : 0;
        // A title that already starts with a number or with "Módulo" is not numbered again.
        const moduleLabel = mod
            ? /^(\d|m[oó]dulo)/i.test(mod.title.trim())
                ? mod.title
                : `${String(moduleNumber).padStart(2, "0")}. ${mod.title}`
            : trail.name;
        let chapterFile = `ch-${slug(mod?.title ?? "modulo")}-${slug(lesson.title)}.xhtml`;
        while (usedFiles.has(chapterFile))
            chapterFile = chapterFile.replace(/(-\d+)?\.xhtml$/, `-${usedFiles.size}.xhtml`);
        usedFiles.add(chapterFile);
        chapters.push({
            id: `ch-${slug(lesson.title)}-${lesson.id.slice(0, 8)}`,
            arquivo: chapterFile,
            titulo: lesson.title,
            moduloId: lesson.moduleId,
            xhtml: chapterToXhtml(
                lesson,
                moduleLabel,
                quizByLesson.get(lesson.id) ?? [],
                imagePathByUrl,
            ),
        });
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const levelLabel = LEVEL_LABELS[trail.trailLevel] ?? "";
    const chaptersWithQuiz = chapters.filter((c) => c.xhtml.includes("quiz-gabarito")).length;
    const cover = page(
        trail.name,
        `<section class="capa" epub:type="titlepage">
<h1>${escapeXml(trail.name)}</h1>
<p class="subtitulo">${escapeXml([levelLabel, `${bookLessons.length} aulas`, language ? `em ${language}` : ""].filter(Boolean).join(", "))}</p>
<p class="editora">${escapeXml(PUBLISHER)}</p>
</section>`,
    );
    const about = page(
        "Sobre este livro",
        `<section class="chapter" epub:type="preamble">
<h1>Sobre este livro</h1>
${renderMarkdown(trail.description)}
<h2>Como o livro está organizado</h2>
<p>Cada capítulo é uma aula da trilha <strong>${escapeXml(trail.name)}</strong>, na mesma ordem dos módulos da plataforma. ${chaptersWithQuiz > 0 ? "No fim do capítulo vem o quiz da aula, com o gabarito comentado logo depois, para você responder antes de conferir." : ""}</p>
${list(trail.whatYouLearn) ? `<h2>O que você aprende</h2>\n${list(trail.whatYouLearn)}` : ""}
${list(trail.prerequisites) ? `<h2>Pré-requisitos</h2>\n${list(trail.prerequisites)}` : ""}
<h2>Ficha</h2>
<ul>
<li>${escapeXml(String(bookLessons.length))} aulas em ${escapeXml(String(mods.length))} módulos</li>
${trail.workloadHours ? `<li>Carga horária de ${escapeXml(String(trail.workloadHours))} horas</li>` : ""}
${levelLabel ? `<li>${escapeXml(levelLabel)}</li>` : ""}
<li>Versão gerada em ${escapeXml(today)}</li>
</ul>
<aside class="nota"><p>Os laboratórios, os desafios de código e o registro de progresso continuam na plataforma: este livro é a parte de leitura da trilha, para estudar offline.</p></aside>
</section>`,
    );

    const navItems = mods
        .map((m) => {
            const moduleChapters = chapters.filter((c) => c.moduloId === m.id);
            if (moduleChapters.length === 0) return "";
            const children = moduleChapters
                .map((c) => `      <li><a href="text/${c.arquivo}">${escapeXml(c.titulo)}</a></li>`)
                .join("\n");
            return `  <li><span class="sumario-modulo">${escapeXml(m.title)}</span>\n    <ol>\n${children}\n    </ol>\n  </li>`;
        })
        .filter(Boolean)
        .join("\n");
    const nav = page(
        "Sumário",
        `<nav epub:type="toc" id="toc">
<h1>Sumário</h1>
<ol>
  <li><a href="text/sobre.xhtml">Sobre este livro</a></li>
${navItems}
</ol>
</nav>
<nav epub:type="landmarks" id="landmarks" hidden="hidden">
<ol>
  <li><a epub:type="titlepage" href="text/capa.xhtml">Capa</a></li>
  <li><a epub:type="bodymatter" href="text/${chapters[0].arquivo}">Começo do conteúdo</a></li>
</ol>
</nav>`,
        "css/livro.css",
    );

    let playOrder = 1;
    const navPoints = [
        `    <navPoint id="nav-sobre" playOrder="${playOrder++}"><navLabel><text>Sobre este livro</text></navLabel><content src="text/sobre.xhtml"/></navPoint>`,
    ];
    for (const m of mods) {
        const moduleChapters = chapters.filter((c) => c.moduloId === m.id);
        if (moduleChapters.length === 0) continue;
        // The module's playOrder comes before its chapters, otherwise the reader
        // gets the same order twice and navigates out of sequence.
        const modulePlayOrder = playOrder++;
        const children = moduleChapters
            .map(
                (c) =>
                    `      <navPoint id="nav-${c.id}" playOrder="${playOrder++}"><navLabel><text>${escapeXml(c.titulo)}</text></navLabel><content src="text/${c.arquivo}"/></navPoint>`,
            )
            .join("\n");
        navPoints.push(
            `    <navPoint id="nav-mod-${slug(m.title)}" playOrder="${modulePlayOrder}"><navLabel><text>${escapeXml(m.title)}</text></navLabel><content src="text/${moduleChapters[0].arquivo}"/>\n${children}\n    </navPoint>`,
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
  <docTitle><text>${escapeXml(trail.name)}</text></docTitle>
  <docAuthor><text>${escapeXml(PUBLISHER)}</text></docAuthor>
  <navMap>
${navPoints.join("\n")}
  </navMap>
</ncx>
`;

    const manifest = [
        `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
        `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
        `    <item id="css" href="css/livro.css" media-type="text/css"/>`,
        `    <item id="capa" href="text/capa.xhtml" media-type="application/xhtml+xml"/>`,
        `    <item id="sobre" href="text/sobre.xhtml" media-type="application/xhtml+xml"/>`,
        ...chapters.map(
            (c) =>
                `    <item id="${c.id}" href="text/${c.arquivo}" media-type="application/xhtml+xml"${c.xhtml.includes("<math") ? ' properties="mathml"' : ""}/>`,
        ),
        ...[...figures.values()].map(
            (f, i) => `    <item id="img-${i}" href="${f.caminho}" media-type="${f.tipo}"/>`,
        ),
    ].join("\n");
    const spine = [
        `    <itemref idref="capa"/>`,
        `    <itemref idref="sobre"/>`,
        ...chapters.map((c) => `    <itemref idref="${c.id}"/>`),
    ].join("\n");
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="pt-BR">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${trailId}</dc:identifier>
    <dc:title>${escapeXml(trail.name)}</dc:title>
    <dc:creator id="creator">${escapeXml(PUBLISHER)}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <dc:language>pt-BR</dc:language>
    <dc:date>${today}</dc:date>
    <dc:publisher>${escapeXml(PUBLISHER)}</dc:publisher>
    <dc:description>${escapeXml(trail.description)}</dc:description>
    <meta property="dcterms:modified">${now.toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
${manifest}
  </manifest>
  <spine toc="ncx">
${spine}
  </spine>
</package>
`;

    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", CONTAINER);
    zip.file("OEBPS/css/livro.css", CSS);
    zip.file("OEBPS/text/capa.xhtml", cover);
    zip.file("OEBPS/text/sobre.xhtml", about);
    for (const c of chapters) zip.file(`OEBPS/text/${c.arquivo}`, c.xhtml);
    for (const f of figures.values()) zip.file(`OEBPS/${f.caminho}`, f.conteudo);
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
        await writeFile(cachedPath, buffer);
        // Old versions of this same track are no longer useful: without this, every
        // lesson edit would leave an orphan file in the volume.
        const prefix = `${trailId}-${language ?? "unico"}-`;
        const current = path.basename(cachedPath);
        for (const existingFile of await readdir(LIVROS_DIR)) {
            if (existingFile.startsWith(prefix) && existingFile !== current) {
                await unlink(path.join(LIVROS_DIR, existingFile));
            }
        }
    } catch (err) {
        console.warn("Could not cache the book, going on with the download:", err);
    }
    return { buffer, nome: fileName };
}
