// Resume analyzer against a job description, a supporter benefit. Nothing of
// the resume is stored: the database keeps only the analysis result.

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { resumeAnalyses } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { env } from "../config/env.ts";
import { supportActive } from "./supporter.service.ts";
import { analyze, type SummaryItem, type AnalysisResult } from "./ats/heuristic.ts";
import { aiEnabled, refine, type Refinement } from "./ats/ia.ts";
import { extractPdfText } from "./ats/pdf.ts";

const MIN_JOB = 120;
const MAX_JOB = 20000;
const MAX_PDF_BYTES = 5 * 1024 * 1024;
// A resume larger than this is almost always text duplicated by the PDF layout.
const MAX_RESUME = 20000;

export interface AnalysisInput {
    vaga: string;
    tituloVaga?: string | null;
    pdfBase64: string;
}

export async function atsStatus(userId: string) {
    const [supporter, used] = await Promise.all([supportActive(userId), analysesInWindow(userId)]);
    return {
        liberado: supporter,
        usadas: used,
        limite: env.ATS_LIMITE_MENSAL,
        restantes: Math.max(0, env.ATS_LIMITE_MENSAL - used),
        ia: aiEnabled(),
    };
}

export async function analyzeResume(userId: string, input: AnalysisInput) {
    if (!(await supportActive(userId))) {
        throw new AppError(403, "resume.forSupporters");
    }

    const used = await analysesInWindow(userId);
    if (used >= env.ATS_LIMITE_MENSAL) {
        throw new AppError(
            429,
            `Você já fez ${env.ATS_LIMITE_MENSAL} análises nos últimos 30 dias. O limite volta conforme as análises antigas saem da janela.`,
        );
    }

    const job = input.vaga.trim();
    if (job.length < MIN_JOB) {
        throw new AppError(400, "resume.jobDescriptionTooShort");
    }
    if (job.length > MAX_JOB) {
        throw new AppError(400, "resume.jobDescriptionTooLong");
    }

    const resume = (await extractPdfText(decodePdf(input.pdfBase64))).slice(0, MAX_RESUME);

    const base = analyze(job, resume);
    const resultado = merge(base, await refine(job, resume, base));

    const [row] = await db
        .insert(resumeAnalyses)
        .values({
            userId,
            jobTitle: input.tituloVaga?.trim().slice(0, 160) || null,
            score: resultado.score,
            verdict: resultado.veredito,
            description: resultado.descricao,
            engine: resultado.motor,
            summary: resultado.resumo,
            breakdown: resultado.detalhe,
            keywordsFound: resultado.encontradas,
            keywordsPartial: resultado.parciais,
            keywordsMissing: resultado.ausentes,
            suggestions: resultado.sugestoes,
        })
        .returning({ id: resumeAnalyses.id, createdAt: resumeAnalyses.createdAt });

    return {
        id: row.id,
        criadaEm: row.createdAt,
        restantes: Math.max(0, env.ATS_LIMITE_MENSAL - used - 1),
        ...resultado,
    };
}

export async function atsHistory(userId: string) {
    const rows = await db
        .select({
            id: resumeAnalyses.id,
            tituloVaga: resumeAnalyses.jobTitle,
            score: resumeAnalyses.score,
            veredito: resumeAnalyses.verdict,
            motor: resumeAnalyses.engine,
            criadaEm: resumeAnalyses.createdAt,
        })
        .from(resumeAnalyses)
        .where(eq(resumeAnalyses.userId, userId))
        .orderBy(desc(resumeAnalyses.createdAt))
        .limit(50);
    return rows;
}

export async function atsAnalysis(userId: string, id: string) {
    const [row] = await db
        .select()
        .from(resumeAnalyses)
        .where(and(eq(resumeAnalyses.id, id), eq(resumeAnalyses.userId, userId)))
        .limit(1);
    if (!row) throw new AppError(404, "resume.analysisNotFound");

    return {
        id: row.id,
        tituloVaga: row.jobTitle,
        criadaEm: row.createdAt,
        score: row.score,
        veredito: row.verdict,
        descricao: row.description,
        motor: row.engine,
        resumo: row.summary,
        detalhe: row.breakdown,
        encontradas: row.keywordsFound,
        parciais: row.keywordsPartial,
        ausentes: row.keywordsMissing,
        sugestoes: row.suggestions,
    };
}

// 30 day sliding window, not the calendar month: someone who subscribes on the
// 28th does not lose the limit two days later.
function analysesInWindow(userId: string): Promise<number> {
    return db
        .select({ n: sql<number>`count(*)::int` })
        .from(resumeAnalyses)
        .where(
            and(
                eq(resumeAnalyses.userId, userId),
                gt(resumeAnalyses.createdAt, new Date(Date.now() - 30 * 86400000)),
            ),
        )
        .then(([row]) => Number(row?.n ?? 0));
}

function decodePdf(input: string): Buffer {
    const base64 = input.includes(",") ? input.slice(input.indexOf(",") + 1) : input;
    const pdf = Buffer.from(base64, "base64");
    if (pdf.length === 0) {
        throw new AppError(400, "resume.pdfRequired");
    }
    if (pdf.length > MAX_PDF_BYTES) {
        throw new AppError(413, "resume.pdfTooLarge");
    }
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
        throw new AppError(400, "resume.notPdf");
    }
    return pdf;
}

// The score and the breakdown still come from the heuristic; from the AI come
// only the suggestion texts and which list each keyword falls into.
function merge(base: AnalysisResult, refinement: Refinement | null): AnalysisResult {
    if (!refinement) return base;

    const universe = [...base.encontradas, ...base.parciais, ...base.ausentes];
    const asSet = (list: string[]) => new Set(list.map((t) => t.toLowerCase()));
    const aiFound = asSet(refinement.encontradas);
    const aiPartial = asSet(refinement.parciais);
    const aiMissing = asSet(refinement.ausentes);
    const wereFound = asSet(base.encontradas);
    const wereMissing = asSet(base.ausentes);

    const encontradas: string[] = [];
    const parciais: string[] = [];
    const ausentes: string[] = [];
    for (const term of universe) {
        const key = term.toLowerCase();
        if (aiFound.has(key)) encontradas.push(term);
        else if (aiMissing.has(key)) ausentes.push(term);
        else if (aiPartial.has(key)) parciais.push(term);
        // A term the AI did not mention stays where the heuristic had put it.
        else if (wereFound.has(key)) encontradas.push(term);
        else if (wereMissing.has(key)) ausentes.push(term);
        else parciais.push(term);
    }

    return {
        ...base,
        motor: "ia",
        sugestoes: refinement.sugestoes.length > 0 ? refinement.sugestoes : base.sugestoes,
        encontradas,
        parciais,
        ausentes,
        resumo: updateKeywordSummary(base.resumo, encontradas.length, universe.length),
    };
}

function updateKeywordSummary(
    resumo: SummaryItem[],
    encontradas: number,
    total: number,
): SummaryItem[] {
    if (resumo.length === 0) return resumo;
    const ratio = total === 0 ? 0 : encontradas / total;
    const [first, ...rest] = resumo;
    return [
        {
            ...first,
            valor: `${encontradas}/${total}`,
            tom: ratio >= 0.75 ? "bom" : ratio >= 0.5 ? "atencao" : "ruim",
        },
        ...rest,
    ];
}
