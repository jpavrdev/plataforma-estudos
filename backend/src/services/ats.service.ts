// Analisador de currículo contra uma vaga, benefício de apoiador. Nada do
// currículo é guardado: o banco fica só com o resultado da análise.

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { resumeAnalyses } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { env } from "../config/env.ts";
import { apoiadorAtivo } from "./apoiador.service.ts";
import { analisar, type ItemResumo, type ResultadoAnalise } from "./ats/heuristica.ts";
import { iaAtiva, refinar, type Refinamento } from "./ats/ia.ts";
import { extrairTextoPdf } from "./ats/pdf.ts";

const MIN_VAGA = 120;
const MAX_VAGA = 20000;
const MAX_PDF_BYTES = 5 * 1024 * 1024;
// Currículo maior que isso é quase sempre texto duplicado pelo layout do PDF.
const MAX_CURRICULO = 20000;

export interface EntradaAnalise {
    vaga: string;
    tituloVaga?: string | null;
    pdfBase64: string;
}

export async function statusAts(userId: string) {
    const [apoiador, usadas] = await Promise.all([
        apoiadorAtivo(userId),
        analisesNoPeriodo(userId),
    ]);
    return {
        liberado: apoiador,
        usadas,
        limite: env.ATS_LIMITE_MENSAL,
        restantes: Math.max(0, env.ATS_LIMITE_MENSAL - usadas),
        ia: iaAtiva(),
    };
}

export async function analisarCurriculo(userId: string, entrada: EntradaAnalise) {
    if (!(await apoiadorAtivo(userId))) {
        throw new AppError(403, "A análise de currículo é um benefício de apoiador.");
    }

    const usadas = await analisesNoPeriodo(userId);
    if (usadas >= env.ATS_LIMITE_MENSAL) {
        throw new AppError(
            429,
            `Você já fez ${env.ATS_LIMITE_MENSAL} análises nos últimos 30 dias. O limite volta conforme as análises antigas saem da janela.`,
        );
    }

    const vaga = entrada.vaga.trim();
    if (vaga.length < MIN_VAGA) {
        throw new AppError(
            400,
            "Cole a descrição da vaga inteira: com poucas linhas a análise não diz nada.",
        );
    }
    if (vaga.length > MAX_VAGA) {
        throw new AppError(400, "Essa descrição de vaga é longa demais. Cole só o texto da vaga.");
    }

    const curriculo = (await extrairTextoPdf(decodificarPdf(entrada.pdfBase64))).slice(
        0,
        MAX_CURRICULO,
    );

    const base = analisar(vaga, curriculo);
    const resultado = mesclar(base, await refinar(vaga, curriculo, base));

    const [linha] = await db
        .insert(resumeAnalyses)
        .values({
            userId,
            jobTitle: entrada.tituloVaga?.trim().slice(0, 160) || null,
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
        id: linha.id,
        criadaEm: linha.createdAt,
        restantes: Math.max(0, env.ATS_LIMITE_MENSAL - usadas - 1),
        ...resultado,
    };
}

export async function historicoAts(userId: string) {
    const linhas = await db
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
    return linhas;
}

export async function analiseAts(userId: string, id: string) {
    const [linha] = await db
        .select()
        .from(resumeAnalyses)
        .where(and(eq(resumeAnalyses.id, id), eq(resumeAnalyses.userId, userId)))
        .limit(1);
    if (!linha) throw new AppError(404, "Análise não encontrada.");

    return {
        id: linha.id,
        tituloVaga: linha.jobTitle,
        criadaEm: linha.createdAt,
        score: linha.score,
        veredito: linha.verdict,
        descricao: linha.description,
        motor: linha.engine,
        resumo: linha.summary,
        detalhe: linha.breakdown,
        encontradas: linha.keywordsFound,
        parciais: linha.keywordsPartial,
        ausentes: linha.keywordsMissing,
        sugestoes: linha.suggestions,
    };
}

// Janela móvel de 30 dias, e não mês do calendário: quem assina dia 28 não perde
// o limite dois dias depois.
function analisesNoPeriodo(userId: string): Promise<number> {
    return db
        .select({ n: sql<number>`count(*)::int` })
        .from(resumeAnalyses)
        .where(
            and(
                eq(resumeAnalyses.userId, userId),
                gt(resumeAnalyses.createdAt, new Date(Date.now() - 30 * 86400000)),
            ),
        )
        .then(([linha]) => Number(linha?.n ?? 0));
}

function decodificarPdf(entrada: string): Buffer {
    const base64 = entrada.includes(",") ? entrada.slice(entrada.indexOf(",") + 1) : entrada;
    const pdf = Buffer.from(base64, "base64");
    if (pdf.length === 0) {
        throw new AppError(400, "Envie o currículo em PDF.");
    }
    if (pdf.length > MAX_PDF_BYTES) {
        throw new AppError(413, "O PDF passa de 5 MB. Exporte o currículo com menos imagens.");
    }
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
        throw new AppError(400, "O arquivo enviado não é um PDF.");
    }
    return pdf;
}

// A nota e o detalhe continuam vindo da heurística; da IA entram só o texto das
// sugestões e em qual lista cada palavra-chave cai.
function mesclar(base: ResultadoAnalise, refinamento: Refinamento | null): ResultadoAnalise {
    if (!refinamento) return base;

    const universo = [...base.encontradas, ...base.parciais, ...base.ausentes];
    const conjunto = (lista: string[]) => new Set(lista.map((t) => t.toLowerCase()));
    const iaEncontradas = conjunto(refinamento.encontradas);
    const iaParciais = conjunto(refinamento.parciais);
    const iaAusentes = conjunto(refinamento.ausentes);
    const eramEncontradas = conjunto(base.encontradas);
    const eramAusentes = conjunto(base.ausentes);

    const encontradas: string[] = [];
    const parciais: string[] = [];
    const ausentes: string[] = [];
    for (const termo of universo) {
        const chave = termo.toLowerCase();
        if (iaEncontradas.has(chave)) encontradas.push(termo);
        else if (iaAusentes.has(chave)) ausentes.push(termo);
        else if (iaParciais.has(chave)) parciais.push(termo);
        // Termo que a IA não citou fica onde a heurística tinha posto.
        else if (eramEncontradas.has(chave)) encontradas.push(termo);
        else if (eramAusentes.has(chave)) ausentes.push(termo);
        else parciais.push(termo);
    }

    return {
        ...base,
        motor: "ia",
        sugestoes: refinamento.sugestoes.length > 0 ? refinamento.sugestoes : base.sugestoes,
        encontradas,
        parciais,
        ausentes,
        resumo: atualizarResumoPalavras(base.resumo, encontradas.length, universo.length),
    };
}

function atualizarResumoPalavras(
    resumo: ItemResumo[],
    encontradas: number,
    total: number,
): ItemResumo[] {
    if (resumo.length === 0) return resumo;
    const razao = total === 0 ? 0 : encontradas / total;
    const [primeiro, ...resto] = resumo;
    return [
        {
            ...primeiro,
            valor: `${encontradas}/${total}`,
            tom: razao >= 0.75 ? "bom" : razao >= 0.5 ? "atencao" : "ruim",
        },
        ...resto,
    ];
}
