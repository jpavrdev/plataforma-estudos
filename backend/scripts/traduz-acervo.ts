// Pipeline de tradução do acervo em três etapas:
//
//   1. extrair:  node scripts/traduz-acervo.ts --trail Go --extrai
//      Gera /tmp/traduzir-<slug>.json com o conteúdo pt-BR pendente.
//
//   2. traduzir: o Claude lê o JSON, traduz para inglês e salva
//      /tmp/traduzir-<slug>-en.json no mesmo formato.
//
//   3. gravar:   node scripts/traduz-acervo.ts --trail Go --grava
//      Lê o JSON traduzido, valida e grava nas tabelas de tradução.
//
// Também: --lista (status), --dry (inventário), --modulo N (só um módulo).

import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db.ts";
import {
    trails,
    modules,
    lessons,
    questions,
    questionOptions,
    trailTranslations,
    moduleTranslations,
    lessonTranslations,
    questionTranslations,
    optionTranslations,
} from "../schema.ts";
import { eq, asc, inArray, and } from "drizzle-orm";
import { env } from "../src/config/env.ts";

// ===================== configuração =====================

const MODELO = env.ATS_MODELO;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 3000;

const args = process.argv.slice(2);
const flag = (nome: string) => args.includes(`--${nome}`);
const valor = (nome: string) => {
    const i = args.indexOf(`--${nome}`);
    return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
};

// ===================== extração =====================

type Bloco = { type: string; value: string };

type AulaExtraida = {
    id: string;
    titulo: string;
    blocos: Bloco[] | null;
    content: string | null;
    questoes: {
        id: string;
        enunciado: string;
        explicacao: string | null;
        alternativas: { id: string; texto: string }[];
    }[];
    jaTraduzida: boolean;
};

type TrilhaExtraida = {
    id: string;
    nome: string;
    descricao: string;
    whatYouLearn: string[] | null;
    prerequisites: string[] | null;
    jaTraduzida: boolean;
    modulos: {
        id: string;
        titulo: string;
        jaTraduzido: boolean;
        aulas: AulaExtraida[];
    }[];
};

async function acharTrilha(identificador: string): Promise<string> {
    // por UUID (apenas se parece um UUID)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identificador)) {
        const [porId] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, identificador));
        if (porId) return porId.id;
    }
    // por nome exato ou slug
    const todas = await db.select({ id: trails.id, name: trails.name }).from(trails);
    const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
    const achada = todas.find(
        (t) => slug(t.name) === slug(identificador) || t.name.toLowerCase() === identificador.toLowerCase(),
    );
    if (!achada) {
        console.error(`Trilha não encontrada: "${identificador}". Use --lista para ver as opções.`);
        process.exit(1);
    }
    return achada.id;
}

async function extrairTrilha(trailId: string, soModulo?: number): Promise<TrilhaExtraida> {
    const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));

    const modulosRows = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));

    const aulasRows = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)))
        .orderBy(asc(lessons.position));

    const questoesRows = await db
        .select()
        .from(questions)
        .where(
            inArray(
                questions.lessonId,
                aulasRows.map((a) => a.id),
            ),
        )
        .orderBy(asc(questions.position));

    const alternativasRows = questoesRows.length
        ? await db
              .select()
              .from(questionOptions)
              .where(
                  inArray(
                      questionOptions.questionId,
                      questoesRows.map((q) => q.id),
                  ),
              )
              .orderBy(asc(questionOptions.position))
        : [];

    // traduções existentes
    const [trTrad] = await db
        .select()
        .from(trailTranslations)
        .where(and(eq(trailTranslations.trailId, trailId), eq(trailTranslations.locale, "en")));

    const modTradRows = await db
        .select()
        .from(moduleTranslations)
        .where(
            inArray(
                moduleTranslations.moduleId,
                modulosRows.map((m) => m.id),
            ),
        );

    const licaoTradRows = await db
        .select()
        .from(lessonTranslations)
        .where(
            inArray(
                lessonTranslations.lessonId,
                aulasRows.map((a) => a.id),
            ),
        );

    const questaoTradRows = await db
        .select()
        .from(questionTranslations)
        .where(
            inArray(
                questionTranslations.questionId,
                questoesRows.map((q) => q.id),
            ),
        );

    const optTradRows = alternativasRows.length
        ? await db
              .select()
              .from(optionTranslations)
              .where(
                  inArray(
                      optionTranslations.optionId,
                      alternativasRows.map((o) => o.id),
                  ),
              )
        : [];

    const alternativasPorQuestao = new Map<string, { id: string; texto: string }[]>();
    for (const o of alternativasRows) {
        const arr = alternativasPorQuestao.get(o.questionId) ?? [];
        arr.push({ id: o.id, texto: o.text });
        alternativasPorQuestao.set(o.questionId, arr);
    }

    const questoesPorAula = new Map<string, AulaExtraida["questoes"]>();
    for (const q of questoesRows) {
        const arr = questoesPorAula.get(q.lessonId) ?? [];
        const temTraducao = questaoTradRows.some((t) => t.questionId === q.id && t.statement);
        const alternativas = (alternativasPorQuestao.get(q.id) ?? []).map((a) => ({
            id: a.id,
            texto: optTradRows.find((t) => t.optionId === a.id)?.text ?? a.texto,
        }));
        if (!temTraducao) {
            // sem tradução: usa o texto original
            arr.push({
                id: q.id,
                enunciado: q.statement,
                explicacao: q.explanation,
                alternativas: alternativasRows
                    .filter((o) => o.questionId === q.id)
                    .map((o) => ({ id: o.id, texto: o.text })),
            });
        }
        questoesPorAula.set(q.lessonId, arr);
    }

    const modulosFiltrados = soModulo ? modulosRows.filter((_, i) => i + 1 === soModulo) : modulosRows;

    return {
        id: trilha.id,
        nome: trTrad?.name ?? trilha.name,
        descricao: trTrad?.description ?? trilha.description,
        whatYouLearn: trTrad?.whatYouLearn ?? trilha.whatYouLearn,
        prerequisites: trTrad?.prerequisites ?? trilha.prerequisites,
        jaTraduzida: !!trTrad,
        modulos: modulosFiltrados.map((m) => ({
            id: m.id,
            titulo: modTradRows.find((t) => t.moduleId === m.id)?.title ?? m.title,
            jaTraduzido: modTradRows.some((t) => t.moduleId === m.id),
            aulas: aulasRows
                .filter((a) => a.moduleId === m.id)
                .map((a) => {
                    const trad = licaoTradRows.find((t) => t.lessonId === a.id);
                    return {
                        id: a.id,
                        titulo: trad?.title ?? a.title,
                        blocos: (a.contentBlocks as Bloco[] | null) ?? null,
                        content: a.content,
                        questoes: questoesPorAula.get(a.id) ?? [],
                        jaTraduzida: !!trad,
                    };
                }),
        })),
    };
}

// ===================== parse e validação =====================

function extrairJSON(texto: string): unknown {
    // remove markdown fences se vierembrulhado
    let t = texto.trim();
    if (t.startsWith("```")) {
        t = t.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(t);
}

function validarAula(
    entrada: { titulo: string; blocos: Bloco[]; totalQuestoes: number; alternativasPorQuestao: number[] },
    saida: { title?: string; blocks?: Bloco[]; questions?: { statement?: string; options?: string[] }[] },
): string[] {
    const erros: string[] = [];
    if (!saida.title?.trim()) erros.push("título vazio");
    if (!Array.isArray(saida.blocks) || saida.blocks.length !== entrada.blocos.length) {
        erros.push(`blocos: esperado ${entrada.blocos.length}, recebido ${saida.blocks?.length ?? 0}`);
    } else {
        for (let i = 0; i < saida.blocks.length; i++) {
            if (!saida.blocks[i]?.type) erros.push(`bloco ${i} sem type`);
            if (!saida.blocks[i]?.value?.trim()) erros.push(`bloco ${i} com value vazio`);
        }
    }
    const qs = saida.questions ?? [];
    if (qs.length !== entrada.totalQuestoes) {
        erros.push(`questões: esperado ${entrada.totalQuestoes}, recebido ${qs.length}`);
    } else {
        for (let i = 0; i < qs.length; i++) {
            if (!qs[i]?.statement?.trim()) erros.push(`questão ${i + 1} com enunciado vazio`);
            const opts = qs[i]?.options;
            if (!Array.isArray(opts) || opts.length !== entrada.alternativasPorQuestao[i]) {
                erros.push(`questão ${i + 1}: alternativas esperado ${entrada.alternativasPorQuestao[i]}, recebido ${opts?.length ?? 0}`);
            } else {
                for (const o of opts) {
                    if (!o?.trim()) erros.push(`questão ${i + 1} com alternativa vazia`);
                }
            }
        }
    }
    return erros;
}

// heurística: sobrou português num bloco que não é código?
function sobrouPortugues(blocos: Bloco[]): boolean {
    const sinais = /\b(que|para com|não é|você|está|será|porque|então|assim|também|já que|sendo|onde|quando|dele|dela|isso|aqui|muito|pouco|sempre|nunca|ainda|depois|antes)\b/i;
    return blocos.some((b) => {
        if (b.type === "code" || b.type === "terminal") return false;
        // pula linhas de código inline (com crases)
        const texto = b.value.replace(/`[^`]*`/g, "").replace(/\$\{[^}]*\}/g, "");
        return sinais.test(texto);
    });
}

// ===================== gravação =====================

async function gravarAula(
    lessonId: string,
    tituloEn: string,
    blocosEn: Bloco[],
    questoes: { id: string; statement: string; explanation: string | null; options: string[] }[],
) {
    await db
        .insert(lessonTranslations)
        .values({
            lessonId,
            locale: "en",
            title: tituloEn,
            contentBlocks: blocosEn,
        })
        .onConflictDoUpdate({
            target: [lessonTranslations.lessonId, lessonTranslations.locale],
            set: { title: tituloEn, contentBlocks: blocosEn, updatedAt: new Date() },
        });

    for (const q of questoes) {
        await db
            .insert(questionTranslations)
            .values({
                questionId: q.id,
                locale: "en",
                statement: q.statement,
                explanation: q.explanation,
            })
            .onConflictDoUpdate({
                target: [questionTranslations.questionId, questionTranslations.locale],
                set: { statement: q.statement, explanation: q.explanation, updatedAt: new Date() },
            });
        const alternativasReais = await db
            .select({ id: questionOptions.id })
            .from(questionOptions)
            .where(eq(questionOptions.questionId, q.id))
            .orderBy(asc(questionOptions.position));
        for (let j = 0; j < alternativasReais.length; j++) {
            const texto = q.options[j];
            if (!texto) continue;
            await db
                .insert(optionTranslations)
                .values({ optionId: alternativasReais[j]!.id, locale: "en", text: texto })
                .onConflictDoUpdate({
                    target: [optionTranslations.optionId, optionTranslations.locale],
                    set: { text: texto, updatedAt: new Date() },
                });
        }
    }
}

// ===================== orquestração =====================

async function listarTrilhas() {
    const todas = await db
        .select({ id: trails.id, name: trails.name })
        .from(trails)
        .orderBy(asc(trails.name));
    const tradRows = await db
        .select({ trailId: trailTranslations.trailId })
        .from(trailTranslations)
        .where(eq(trailTranslations.locale, "en"));
    const tradSet = new Set(tradRows.map((t) => t.trailId));
    console.log("\nTrilhas (✓ = já traduzida):");
    for (const t of todas) {
        console.log(`  ${tradSet.has(t.id) ? "✓" : " "} ${t.name}`);
    }
    console.log(`\nTotal: ${todas.length}, traduzidas: ${tradSet.size}, restantes: ${todas.length - tradSet.size}`);
}

function slugify(nome: string): string {
    return nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ETAPA 1: extrai o pt-BR pendente para /tmp/traduzir-<slug>.json
async function extrairParaTraduzir(trailId: string, soModulo?: number) {
    const trilha = await extrairTrilha(trailId, soModulo);

    const pendente = {
        trail: {
            id: trilha.id,
            name: trilha.jaTraduzida ? null : trilha.nome,
            description: trilha.jaTraduzida ? null : trilha.descricao,
            whatYouLearn: trilha.jaTraduzida ? null : trilha.whatYouLearn,
            prerequisites: trilha.jaTraduzida ? null : trilha.prerequisites,
        },
        modules: [] as {
            id: string;
            title: string | null;
            lessons: {
                id: string;
                title: string;
                blocks: { type: string; value: string }[];
                questions: {
                    id: string;
                    statement: string;
                    explanation: string | null;
                    options: string[];
                }[];
            }[];
        }[],
    };

    for (const mod of trilha.modulos) {
        const aulasPendentes = mod.aulas.filter((a) => !a.jaTraduzida);
        if (!mod.jaTraduzido || aulasPendentes.length > 0) {
            pendente.modules.push({
                id: mod.id,
                title: mod.jaTraduzido ? null : mod.titulo,
                lessons: aulasPendentes
                    .filter((a) => a.blocos || a.content)
                    .map((a) => ({
                        id: a.id,
                        title: a.titulo,
                        blocks: a.blocos ?? (a.content ? [{ type: "text", value: a.content }] : []),
                        questions: a.questoes.map((q) => ({
                            id: q.id,
                            statement: q.enunciado,
                            explanation: q.explicacao,
                            options: q.alternativas.map((alt) => alt.texto),
                        })),
                    })),
            });
        }
    }

    const totalAulas = pendente.modules.reduce((s, m) => s + m.lessons.length, 0);
    const totalQuestoes = pendente.modules.reduce(
        (s, m) => s + m.lessons.reduce((s2, a) => s2 + a.questions.length, 0),
        0,
    );
    const arquivo = `/tmp/traduzir-${slugify(trilha.nome)}.json`;
    const { writeFileSync } = await import("node:fs");
    writeFileSync(arquivo, JSON.stringify(pendente, null, 1));
    console.log(`Extraído: ${arquivo}`);
    console.log(`  Módulos pendentes: ${pendente.modules.length}`);
    console.log(`  Aulas pendentes: ${totalAulas}`);
    console.log(`  Questões pendentes: ${totalQuestoes}`);
    if (totalAulas === 0) console.log("  (nada pendente — trilha já traduzida)");
    return arquivo;
}

// ETAPA 3: lê o JSON traduzido e grava
async function gravarTraduzido(trailId: string, arquivo: string) {
    const { readFileSync } = await import("node:fs");
    type TrilhaTraduzida = {
        trail: {
            id: string;
            name: string | null;
            description: string | null;
            whatYouLearn: string[] | null;
            prerequisites: string[] | null;
        };
        modules: {
            id: string;
            title: string | null;
            lessons: {
                id: string;
                title: string;
                blocks: { type: string; value: string }[];
                questions: {
                    id: string;
                    statement: string;
                    explanation: string | null;
                    options: string[];
                }[];
            }[];
        }[];
    };
    const dados: TrilhaTraduzida = JSON.parse(readFileSync(arquivo, "utf-8"));

    let aulasGravadas = 0;
    let erros: string[] = [];

    // trilha
    if (dados.trail.name && dados.trail.description) {
        await db
            .insert(trailTranslations)
            .values({
                trailId,
                locale: "en",
                name: dados.trail.name,
                description: dados.trail.description,
                whatYouLearn: dados.trail.whatYouLearn ?? null,
                prerequisites: dados.trail.prerequisites ?? null,
            })
            .onConflictDoUpdate({
                target: [trailTranslations.trailId, trailTranslations.locale],
                set: {
                    name: dados.trail.name,
                    description: dados.trail.description,
                    whatYouLearn: dados.trail.whatYouLearn ?? null,
                    prerequisites: dados.trail.prerequisites ?? null,
                    updatedAt: new Date(),
                },
            });
        console.log(`[trilha] "${dados.trail.name}"`);
    }

    for (const mod of dados.modules) {
        if (mod.title) {
            await db
                .insert(moduleTranslations)
                .values({ moduleId: mod.id, locale: "en", title: mod.title })
                .onConflictDoUpdate({
                    target: [moduleTranslations.moduleId, moduleTranslations.locale],
                    set: { title: mod.title, updatedAt: new Date() },
                });
        }
        for (const aula of mod.lessons) {
            const problemas: string[] = [];
            if (!aula.title?.trim()) problemas.push("título vazio");
            if (!Array.isArray(aula.blocks) || aula.blocks.length === 0) problemas.push("sem blocos");
            if (problemas.length > 0) {
                erros.push(`aula ${aula.id}: ${problemas.join("; ")}`);
                continue;
            }
            if (sobrouPortugues(aula.blocks)) {
                console.warn(`  ⚠ possível português restante: ${aula.title}`);
            }
            await gravarAula(aula.id, aula.title, aula.blocks, aula.questions);
            aulasGravadas++;
            console.log(`  ✓ ${aula.title}`);
        }
    }

    console.log(`\n=== RESULTADO ===`);
    console.log(`Aulas gravadas: ${aulasGravadas}, erros: ${erros.length}`);
    if (erros.length > 0) {
        for (const e of erros) console.error(`  ✗ ${e}`);
        process.exitCode = 1;
    }
}

// inventário (dry)
async function inventario(trailId: string, soModulo?: number) {
    const trilha = await extrairTrilha(trailId, soModulo);
    const totalAulas = trilha.modulos.reduce((s, m) => s + m.aulas.length, 0);
    const pendentes = trilha.modulos.reduce((s, m) => s + m.aulas.filter((a) => !a.jaTraduzida).length, 0);
    const totalQuestoes = trilha.modulos.reduce((s, m) => s + m.aulas.reduce((s2, a) => s2 + a.questoes.length, 0), 0);
    console.log(`\n=== ${trilha.nome} ===`);
    console.log(`Módulos: ${trilha.modulos.length}, aulas: ${totalAulas}, questões: ${totalQuestoes}`);
    console.log(`Já traduzida: ${trilha.jaTraduzida ? "sim" : "não"}, aulas pendentes: ${pendentes}`);
    for (const m of trilha.modulos) {
        console.log(`\n  ${m.jaTraduzido ? "✓" : " "} ${m.titulo}`);
        for (const a of m.aulas) {
            const blocos = a.blocos?.length ?? 0;
            const chars = a.blocos?.reduce((s, b) => s + b.value.length, 0) ?? a.content?.length ?? 0;
            console.log(`    ${a.jaTraduzida ? "✓" : " "} ${a.titulo} (${blocos} blocos, ${chars} chars, ${a.questoes.length} questões)`);
        }
    }
}

// ===================== main =====================

const destino = valor("trail");
if (flag("lista")) {
    await listarTrilhas();
} else if (destino) {
    const trailId = await acharTrilha(destino);
    if (flag("extrai")) {
        await extrairParaTraduzir(trailId, valor("modulo") ? Number(valor("modulo")) : undefined);
    } else if (flag("grava")) {
        const arquivo = valor("arquivo");
        if (!arquivo) {
            console.error("Use --grava --arquivo /tmp/traduzir-<slug>-en.json");
            process.exit(1);
        }
        await gravarTraduzido(trailId, arquivo);
    } else if (flag("dry")) {
        await inventario(trailId, valor("modulo") ? Number(valor("modulo")) : undefined);
    } else {
        console.log("Use --extrai, --grava --arquivo <caminho>, ou --dry");
        process.exit(1);
    }
} else {
    console.log("Uso:");
    console.log("  node scripts/traduz-acervo.ts --lista");
    console.log("  node scripts/traduz-acervo.ts --trail Go --dry");
    console.log("  node scripts/traduz-acervo.ts --trail Go --extrai [--modulo N]");
    console.log("  node scripts/traduz-acervo.ts --trail Go --grava --arquivo /tmp/traduzir-go-en.json");
    process.exit(1);
}

process.exit(0);