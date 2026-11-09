// Deterministic engine of the analyzer: same input, same output, no network.
// It is what produces the score; the AI, when enabled, only rewrites the
// suggestions and reviews the keyword classification.

import { KEYWORDS } from "./dictionary.ts";
import {
    STOPWORDS,
    containsWord,
    containsLoose,
    normalize,
    tokenize,
    tokenizeOriginal,
} from "./normalize.ts";

export type Tone = "bom" | "atencao" | "ruim";
export type Priority = "alta" | "media" | "baixa";
export type KeywordStatus = "encontrada" | "parcial" | "ausente";
export type Engine = "heuristica" | "ia";

export interface SummaryItem {
    rotulo: string;
    valor: string;
    tom: Tone;
    icone: string;
}

export interface DetailItem {
    rotulo: string;
    icone: string;
    pct: number;
}

export interface Suggestion {
    prioridade: Priority;
    titulo: string;
    texto: string;
}

export interface AnalysisResult {
    score: number;
    veredito: string;
    descricao: string;
    motor: Engine;
    resumo: SummaryItem[];
    detalhe: DetailItem[];
    encontradas: string[];
    parciais: string[];
    ausentes: string[];
    sugestoes: Suggestion[];
}

// They add up to 1.
const WEIGHT_KEYWORDS = 0.35;
const WEIGHT_TECHNICAL = 0.2;
const WEIGHT_EXPERIENCE = 0.2;
const WEIGHT_EDUCATION = 0.1;
const WEIGHT_FORMATTING = 0.15;

const MAX_KEYWORDS = 21;

const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };

interface Candidate {
    display: string;
    aliases: string[];
    technical: boolean;
}

interface Classified extends Candidate {
    status: KeywordStatus;
}

export function analyze(job: string, resume: string): AnalysisResult {
    const jobNorm = normalize(job ?? "");
    const resumeNorm = normalize(resume ?? "");

    const classified = extractKeywords(job ?? "", jobNorm).map((c) => ({
        ...c,
        status: classify(c, resumeNorm),
    }));

    const encontradas = classified.filter((k) => k.status === "encontrada").map((k) => k.display);
    const parciais = classified.filter((k) => k.status === "parcial").map((k) => k.display);
    const ausentes = classified.filter((k) => k.status === "ausente").map((k) => k.display);

    const keywordsPct = coveragePct(classified);
    const technicalPct = coveragePct(classified.filter((k) => k.technical));
    const experience = scoreExperience(resume ?? "", resumeNorm);
    const educationPct = scoreEducation(resumeNorm);
    const formatting = scoreFormatting(resume ?? "", resumeNorm);

    const score = Math.min(
        100,
        Math.max(
            0,
            Math.round(
                keywordsPct * WEIGHT_KEYWORDS +
                    technicalPct * WEIGHT_TECHNICAL +
                    experience.pct * WEIGHT_EXPERIENCE +
                    educationPct * WEIGHT_EDUCATION +
                    formatting.pct * WEIGHT_FORMATTING,
            ),
        ),
    );

    const { veredito, descricao } = verdictFor(score);
    const keywordRatio = classified.length === 0 ? 0 : encontradas.length / classified.length;

    return {
        score,
        veredito,
        descricao,
        motor: "heuristica",
        resumo: [
            {
                rotulo: "Palavras-chave",
                valor: `${encontradas.length}/${classified.length}`,
                tom: toneByRatio(keywordRatio),
                icone: "key",
            },
            {
                rotulo: "Formatação ATS",
                valor: formatting.label,
                tom: toneByPct(formatting.pct),
                icone: "layout",
            },
            {
                rotulo: "Verbos de ação",
                valor: experience.verbsLabel,
                tom: experience.verbsTone,
                icone: "bolt",
            },
        ],
        detalhe: [
            { rotulo: "Palavras-chave da vaga", icone: "key", pct: keywordsPct },
            { rotulo: "Experiência profissional", icone: "briefcase", pct: experience.pct },
            { rotulo: "Habilidades técnicas", icone: "code", pct: technicalPct },
            { rotulo: "Formação acadêmica", icone: "cap", pct: educationPct },
            { rotulo: "Formatação e legibilidade ATS", icone: "layout", pct: formatting.pct },
        ],
        encontradas,
        parciais,
        ausentes,
        sugestoes: buildSuggestions(classified, resumeNorm, experience, formatting.pct),
    };
}

function extractKeywords(rawJob: string, jobNorm: string): Candidate[] {
    const candidates: Candidate[] = [];
    const seen = new Set<string>();

    for (const term of KEYWORDS) {
        if (!term.aliases.some((a) => containsWord(jobNorm, a))) continue;
        const key = normalize(term.display);
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({
            display: term.display,
            aliases: term.aliases,
            technical: term.technical,
        });
    }

    // Fallback for what the dictionary does not cover. Only ALL-CAPS (OWASP) or
    // camelCase (MongoDB) pass: a common word, even Capitalized for starting a
    // sentence, stays out.
    for (const line of rawJob.split(/[\r\n]+/)) {
        if (candidates.length >= MAX_KEYWORDS) break;
        const stripped = line.replace(/^[\s\-*•·–]+/, "");
        if (stripped === line.trimStart()) continue; // not a bullet line

        for (const original of tokenizeOriginal(stripped)) {
            if (candidates.length >= MAX_KEYWORDS) break;

            const token = original.replace(/^[.,;:()"'!?]+|[.,;:()"'!?]+$/g, "");
            const norm = normalize(token);
            if (norm.length < 3 || STOPWORDS.has(norm)) continue;
            if (/^[\d.+/]+$/.test(norm) || !looksLikeAcronymOrTech(token)) continue;
            // "APIs" next to "APIs REST" is the same keyword counted twice.
            if (
                candidates.some((c) =>
                    c.aliases.some((a) => a === norm || a.split(" ").includes(norm)),
                )
            )
                continue;
            if (seen.has(norm)) continue;

            seen.add(norm);
            candidates.push({ display: token, aliases: [norm], technical: false });
        }
    }

    return candidates.slice(0, MAX_KEYWORDS);
}

function classify(c: Candidate, resumeNorm: string): KeywordStatus {
    if (c.aliases.some((a) => containsWord(resumeNorm, a))) return "encontrada";
    if (c.aliases.some((a) => a.length >= 3 && containsLoose(resumeNorm, a))) return "parcial";
    return "ausente";
}

function looksLikeAcronymOrTech(token: string): boolean {
    const letters = [...token].filter((c) => /\p{L}/u.test(c));
    if (letters.length < 2) return false;
    const allCaps = letters.every((c) => c === c.toUpperCase() && c !== c.toLowerCase());
    const innerCap = [...token.slice(1)].some(
        (c) => c === c.toUpperCase() && c !== c.toLowerCase(),
    );
    return allCaps || innerCap;
}

function coveragePct(keywords: Classified[]): number {
    if (keywords.length === 0) return 0;
    const sum = keywords.reduce(
        (t, k) => t + (k.status === "encontrada" ? 1 : k.status === "parcial" ? 0.5 : 0),
        0,
    );
    return Math.round((sum / keywords.length) * 100);
}

interface ExperienceScore {
    pct: number;
    verbsLabel: string;
    verbsTone: Tone;
    verbs: number;
    metricsRatio: number;
    years: number;
}

function scoreExperience(raw: string, norm: string): ExperienceScore {
    let years = 0;
    for (const m of norm.matchAll(/(\d+)\s*\+?\s*(anos|ano|years|year)/g)) {
        years = Math.max(years, Number(m[1]));
    }
    const yearsScore =
        years >= 5
            ? 100
            : years === 4
              ? 90
              : years === 3
                ? 80
                : years === 2
                  ? 65
                  : years === 1
                    ? 50
                    : 30;

    const tokens = tokenize(raw);
    const verbs = tokens.filter((t) => ACTION_VERBS.has(t)).length;
    const verbsScore = verbs >= 8 ? 100 : verbs >= 5 ? 85 : verbs >= 3 ? 70 : verbs >= 1 ? 55 : 35;

    const lines = raw
        .split(/[\r\n]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const bullets = lines.filter((l) => /^[-•*·–]/.test(l));
    const considered = bullets.length > 0 ? bullets : lines;
    const withNumber = considered.filter((l) => /\d/.test(l)).length;

    return {
        pct: Math.min(100, Math.max(0, Math.round(yearsScore * 0.55 + verbsScore * 0.45))),
        verbsLabel: verbs >= 5 ? "Forte" : verbs >= 2 ? "Médio" : "Fraco",
        verbsTone: verbs >= 5 ? "bom" : verbs >= 2 ? "atencao" : "ruim",
        verbs,
        metricsRatio: considered.length === 0 ? 0 : withNumber / considered.length,
        years,
    };
}

function scoreEducation(norm: string): number {
    const hits = EDUCATION_KEYWORDS.filter((k) => containsWord(norm, k)).length;
    return hits >= 3 ? 95 : hits === 2 ? 85 : hits === 1 ? 70 : 35;
}

function scoreFormatting(raw: string, norm: string): { pct: number; label: string } {
    let points = 0;

    const headers = STANDARD_SECTIONS.filter((h) => containsWord(norm, h)).length;
    points += Math.min(30, headers * 10);

    if (/[-•*]/.test(raw)) points += 25;

    const words = tokenize(raw).length;
    if (words >= 200 && words <= 1200) points += 25;
    else if ((words >= 120 && words < 200) || (words > 1200 && words <= 1800)) points += 15;
    else points += 5;

    // Too many odd characters is leftover layout the ATS cannot read.
    const oddChars = [...raw].filter(isOddChar).length;
    const ratio = raw.length === 0 ? 1 : oddChars / raw.length;
    points += ratio < 0.02 ? 20 : ratio < 0.06 ? 12 : 4;

    points = Math.min(100, Math.max(0, points));
    return { pct: points, label: points >= 75 ? "Boa" : points >= 50 ? "Regular" : "Fraca" };
}

function isOddChar(c: string): boolean {
    if (/[\p{L}\p{N}\s]/u.test(c)) return false;
    return !".,;:-–()/@+%#&'\"!?•*_".includes(c);
}

function buildSuggestions(
    keywords: Classified[],
    resumeNorm: string,
    experience: ExperienceScore,
    formattingPct: number,
): Suggestion[] {
    const suggestions: Suggestion[] = [];

    const missingTechnical = keywords
        .filter((k) => k.technical && k.status === "ausente")
        .map((k) => k.display);
    if (missingTechnical.length > 0) {
        suggestions.push({
            prioridade: "alta",
            titulo: "Inclua as tecnologias que a vaga pede",
            texto: `A vaga cita ${missingTechnical.slice(0, 3).join(", ")} e nada disso aparece no seu currículo. Se você já trabalhou com essas tecnologias, cite-as nas habilidades e, principalmente, na experiência em que você as usou.`,
        });
    }

    const centralPartial = keywords.find((k) => k.technical && k.status === "parcial")?.display;
    if (centralPartial) {
        suggestions.push({
            prioridade: "alta",
            titulo: `Deixe ${centralPartial} explícito`,
            texto: `${centralPartial} aparece de forma vaga no seu currículo, mas é um requisito central da vaga. Cite o nome por extenso em uma experiência recente e descreva o que você construiu com ele.`,
        });
    }

    if (experience.verbs < 3) {
        suggestions.push({
            prioridade: "media",
            titulo: "Comece cada entrega com um verbo de ação",
            texto: 'Suas descrições contam pouco sobre o que você fez. Troque frases como "responsável pelo módulo de pagamentos" por "desenvolvi o módulo de pagamentos", "reduzi", "automatizei", "liderei".',
        });
    }

    if (experience.metricsRatio < 0.5) {
        suggestions.push({
            prioridade: "media",
            titulo: "Quantifique os resultados",
            texto: `Só ${Math.round(experience.metricsRatio * 100)}% das suas entregas têm número. Métrica é o que separa "melhorei a performance" de "reduzi o tempo de carregamento em 35%" na leitura do recrutador.`,
        });
    }

    if (experience.years === 0) {
        suggestions.push({
            prioridade: "baixa",
            titulo: "Deixe o tempo de experiência visível",
            texto: "Não encontramos um tempo de atuação declarado. Coloque o período de cada cargo (mês/ano de início e fim) e, no resumo, quantos anos você tem na área.",
        });
    }

    const headers = STANDARD_SECTIONS.filter((h) => containsWord(resumeNorm, h)).length;
    if (headers < 3 || formattingPct < 75) {
        suggestions.push({
            prioridade: "baixa",
            titulo: "Padronize os títulos das seções",
            texto: 'Use nomes convencionais como "Experiência", "Formação" e "Habilidades". O ATS separa o currículo por esses títulos e ignora seções que não reconhece.',
        });
    }

    return suggestions
        .sort((a, b) => PRIORITY_ORDER[a.prioridade] - PRIORITY_ORDER[b.prioridade])
        .slice(0, 5);
}

function toneByRatio(ratio: number): Tone {
    return ratio >= 0.75 ? "bom" : ratio >= 0.5 ? "atencao" : "ruim";
}

function toneByPct(pct: number): Tone {
    return pct >= 75 ? "bom" : pct >= 50 ? "atencao" : "ruim";
}

function verdictFor(score: number): { veredito: string; descricao: string } {
    if (score >= 80) {
        return {
            veredito: "Ótima compatibilidade",
            descricao:
                "Seu currículo está muito bem alinhado com a vaga. Pequenos ajustes deixam ele ainda mais forte.",
        };
    }
    if (score >= 60) {
        return {
            veredito: "Boa compatibilidade",
            descricao:
                "Seu currículo conversa bem com a vaga, mas ajustes em palavras-chave e formatação ainda elevam a nota.",
        };
    }
    if (score >= 40) {
        return {
            veredito: "Compatibilidade parcial",
            descricao:
                "Seu currículo atende parte dos requisitos. Reforce as palavras-chave e as experiências mais próximas do que a vaga pede.",
        };
    }
    return {
        veredito: "Baixa compatibilidade",
        descricao:
            "Seu currículo ainda está distante do que a vaga pede. Revise palavras-chave, habilidades técnicas e formatação.",
    };
}

// prettier-ignore
const ACTION_VERBS = new Set([
    "desenvolvi", "implementei", "criei", "construi", "liderei", "gerenciei", "otimizei",
    "reduzi", "aumentei", "melhorei", "automatizei", "projetei", "entreguei", "mantive",
    "colaborei", "coordenei", "integrei", "refatorei", "modernizei", "migrei", "publiquei",
    "atuei", "participei", "conduzi", "estruturei", "padronizei", "monitorei", "escalei",
    "developed", "implemented", "created", "built", "led", "managed", "optimized", "reduced",
    "increased", "improved", "automated", "designed", "delivered", "maintained", "collaborated",
    "coordinated", "integrated", "refactored", "launched", "shipped",
]);

// prettier-ignore
const EDUCATION_KEYWORDS = [
    "formacao", "graduacao", "bacharelado", "tecnologo", "licenciatura", "pos", "mestrado",
    "doutorado", "faculdade", "universidade", "curso", "tecnico", "ciencia da computacao",
    "engenharia", "sistemas de informacao", "analise e desenvolvimento", "education",
    "bachelor", "degree", "university",
];

// prettier-ignore
const STANDARD_SECTIONS = [
    "experiencia", "formacao", "educacao", "habilidades", "competencias", "resumo", "objetivo",
    "projetos", "certificacoes", "idiomas", "contato", "experience", "education", "skills",
    "summary", "projects",
];
