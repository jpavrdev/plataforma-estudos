// Motor determinístico do analisador: mesma entrada, mesma saída, sem rede.
// É ele quem produz a nota; a IA, quando ligada, só reescreve as sugestões e
// revisa a classificação das palavras-chave.

import { TERMOS } from "./dicionario.ts";
import {
    PALAVRAS_VAZIAS,
    contemPalavra,
    contemSolto,
    normalizar,
    tokenizar,
    tokenizarOriginal,
} from "./normalizar.ts";

export type Tom = "bom" | "atencao" | "ruim";
export type Prioridade = "alta" | "media" | "baixa";
export type StatusPalavra = "encontrada" | "parcial" | "ausente";
export type Motor = "heuristica" | "ia";

export interface ItemResumo {
    rotulo: string;
    valor: string;
    tom: Tom;
    icone: string;
}

export interface ItemDetalhe {
    rotulo: string;
    icone: string;
    pct: number;
}

export interface Sugestao {
    prioridade: Prioridade;
    titulo: string;
    texto: string;
}

export interface ResultadoAnalise {
    score: number;
    veredito: string;
    descricao: string;
    motor: Motor;
    resumo: ItemResumo[];
    detalhe: ItemDetalhe[];
    encontradas: string[];
    parciais: string[];
    ausentes: string[];
    sugestoes: Sugestao[];
}

// Somam 1.
const PESO_PALAVRAS = 0.35;
const PESO_TECNICO = 0.2;
const PESO_EXPERIENCIA = 0.2;
const PESO_FORMACAO = 0.1;
const PESO_FORMATACAO = 0.15;

const MAX_PALAVRAS = 21;

const ORDEM_PRIORIDADE: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2 };

interface Candidata {
    exibicao: string;
    apelidos: string[];
    tecnica: boolean;
}

interface Classificada extends Candidata {
    status: StatusPalavra;
}

export function analisar(vaga: string, curriculo: string): ResultadoAnalise {
    const vagaNorm = normalizar(vaga ?? "");
    const curriculoNorm = normalizar(curriculo ?? "");

    const classificadas = extrairPalavras(vaga ?? "", vagaNorm).map((c) => ({
        ...c,
        status: classificar(c, curriculoNorm),
    }));

    const encontradas = classificadas
        .filter((k) => k.status === "encontrada")
        .map((k) => k.exibicao);
    const parciais = classificadas.filter((k) => k.status === "parcial").map((k) => k.exibicao);
    const ausentes = classificadas.filter((k) => k.status === "ausente").map((k) => k.exibicao);

    const pctPalavras = coberturaPct(classificadas);
    const pctTecnico = coberturaPct(classificadas.filter((k) => k.tecnica));
    const experiencia = notaExperiencia(curriculo ?? "", curriculoNorm);
    const pctFormacao = notaFormacao(curriculoNorm);
    const formatacao = notaFormatacao(curriculo ?? "", curriculoNorm);

    const score = Math.min(
        100,
        Math.max(
            0,
            Math.round(
                pctPalavras * PESO_PALAVRAS +
                    pctTecnico * PESO_TECNICO +
                    experiencia.pct * PESO_EXPERIENCIA +
                    pctFormacao * PESO_FORMACAO +
                    formatacao.pct * PESO_FORMATACAO,
            ),
        ),
    );

    const { veredito, descricao } = vereditoPara(score);
    const razaoPalavras =
        classificadas.length === 0 ? 0 : encontradas.length / classificadas.length;

    return {
        score,
        veredito,
        descricao,
        motor: "heuristica",
        resumo: [
            {
                rotulo: "Palavras-chave",
                valor: `${encontradas.length}/${classificadas.length}`,
                tom: tomPorRazao(razaoPalavras),
                icone: "key",
            },
            {
                rotulo: "Formatação ATS",
                valor: formatacao.rotulo,
                tom: tomPorPct(formatacao.pct),
                icone: "layout",
            },
            {
                rotulo: "Verbos de ação",
                valor: experiencia.rotuloVerbos,
                tom: experiencia.tomVerbos,
                icone: "bolt",
            },
        ],
        detalhe: [
            { rotulo: "Palavras-chave da vaga", icone: "key", pct: pctPalavras },
            { rotulo: "Experiência profissional", icone: "briefcase", pct: experiencia.pct },
            { rotulo: "Habilidades técnicas", icone: "code", pct: pctTecnico },
            { rotulo: "Formação acadêmica", icone: "cap", pct: pctFormacao },
            { rotulo: "Formatação e legibilidade ATS", icone: "layout", pct: formatacao.pct },
        ],
        encontradas,
        parciais,
        ausentes,
        sugestoes: montarSugestoes(classificadas, curriculoNorm, experiencia, formatacao.pct),
    };
}

function extrairPalavras(vagaBruta: string, vagaNorm: string): Candidata[] {
    const candidatas: Candidata[] = [];
    const vistas = new Set<string>();

    for (const termo of TERMOS) {
        if (!termo.apelidos.some((a) => contemPalavra(vagaNorm, a))) continue;
        const chave = normalizar(termo.exibicao);
        if (vistas.has(chave)) continue;
        vistas.add(chave);
        candidatas.push({
            exibicao: termo.exibicao,
            apelidos: termo.apelidos,
            tecnica: termo.tecnica,
        });
    }

    // Fallback para o que o dicionário não cobre. Só passa ALL-CAPS (OWASP) ou
    // camelCase (MongoDB): palavra comum, mesmo Capitalizada por começar frase, fica fora.
    for (const linha of vagaBruta.split(/[\r\n]+/)) {
        if (candidatas.length >= MAX_PALAVRAS) break;
        const semMarcador = linha.replace(/^[\s\-*•·–]+/, "");
        if (semMarcador === linha.trimStart()) continue; // não é linha de bullet

        for (const original of tokenizarOriginal(semMarcador)) {
            if (candidatas.length >= MAX_PALAVRAS) break;

            const token = original.replace(/^[.,;:()"'!?]+|[.,;:()"'!?]+$/g, "");
            const norm = normalizar(token);
            if (norm.length < 3 || PALAVRAS_VAZIAS.has(norm)) continue;
            if (/^[\d.+/]+$/.test(norm) || !pareceSiglaOuTecnologia(token)) continue;
            // "APIs" ao lado de "APIs REST" é a mesma palavra-chave contada duas vezes.
            if (
                candidatas.some((c) =>
                    c.apelidos.some((a) => a === norm || a.split(" ").includes(norm)),
                )
            )
                continue;
            if (vistas.has(norm)) continue;

            vistas.add(norm);
            candidatas.push({ exibicao: token, apelidos: [norm], tecnica: false });
        }
    }

    return candidatas.slice(0, MAX_PALAVRAS);
}

function classificar(c: Candidata, curriculoNorm: string): StatusPalavra {
    if (c.apelidos.some((a) => contemPalavra(curriculoNorm, a))) return "encontrada";
    if (c.apelidos.some((a) => a.length >= 3 && contemSolto(curriculoNorm, a))) return "parcial";
    return "ausente";
}

function pareceSiglaOuTecnologia(token: string): boolean {
    const letras = [...token].filter((c) => /\p{L}/u.test(c));
    if (letras.length < 2) return false;
    const todasMaiusculas = letras.every((c) => c === c.toUpperCase() && c !== c.toLowerCase());
    const maiusculaInterna = [...token.slice(1)].some(
        (c) => c === c.toUpperCase() && c !== c.toLowerCase(),
    );
    return todasMaiusculas || maiusculaInterna;
}

function coberturaPct(palavras: Classificada[]): number {
    if (palavras.length === 0) return 0;
    const soma = palavras.reduce(
        (t, k) => t + (k.status === "encontrada" ? 1 : k.status === "parcial" ? 0.5 : 0),
        0,
    );
    return Math.round((soma / palavras.length) * 100);
}

interface NotaExperiencia {
    pct: number;
    rotuloVerbos: string;
    tomVerbos: Tom;
    verbos: number;
    razaoMetricas: number;
    anos: number;
}

function notaExperiencia(bruto: string, norm: string): NotaExperiencia {
    let anos = 0;
    for (const m of norm.matchAll(/(\d+)\s*\+?\s*(anos|ano|years|year)/g)) {
        anos = Math.max(anos, Number(m[1]));
    }
    const notaAnos =
        anos >= 5
            ? 100
            : anos === 4
              ? 90
              : anos === 3
                ? 80
                : anos === 2
                  ? 65
                  : anos === 1
                    ? 50
                    : 30;

    const tokens = tokenizar(bruto);
    const verbos = tokens.filter((t) => VERBOS_ACAO.has(t)).length;
    const notaVerbos =
        verbos >= 8 ? 100 : verbos >= 5 ? 85 : verbos >= 3 ? 70 : verbos >= 1 ? 55 : 35;

    const linhas = bruto
        .split(/[\r\n]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const bullets = linhas.filter((l) => /^[-•*·–]/.test(l));
    const consideradas = bullets.length > 0 ? bullets : linhas;
    const comNumero = consideradas.filter((l) => /\d/.test(l)).length;

    return {
        pct: Math.min(100, Math.max(0, Math.round(notaAnos * 0.55 + notaVerbos * 0.45))),
        rotuloVerbos: verbos >= 5 ? "Forte" : verbos >= 2 ? "Médio" : "Fraco",
        tomVerbos: verbos >= 5 ? "bom" : verbos >= 2 ? "atencao" : "ruim",
        verbos,
        razaoMetricas: consideradas.length === 0 ? 0 : comNumero / consideradas.length,
        anos,
    };
}

function notaFormacao(norm: string): number {
    const acertos = PALAVRAS_FORMACAO.filter((k) => contemPalavra(norm, k)).length;
    return acertos >= 3 ? 95 : acertos === 2 ? 85 : acertos === 1 ? 70 : 35;
}

function notaFormatacao(bruto: string, norm: string): { pct: number; rotulo: string } {
    let nota = 0;

    const titulos = TITULOS_PADRAO.filter((h) => contemPalavra(norm, h)).length;
    nota += Math.min(30, titulos * 10);

    if (/[-•*]/.test(bruto)) nota += 25;

    const palavras = tokenizar(bruto).length;
    if (palavras >= 200 && palavras <= 1200) nota += 25;
    else if ((palavras >= 120 && palavras < 200) || (palavras > 1200 && palavras <= 1800))
        nota += 15;
    else nota += 5;

    // Caractere estranho em excesso é resquício de layout que o ATS não lê.
    const estranhos = [...bruto].filter(caractereEstranho).length;
    const razao = bruto.length === 0 ? 1 : estranhos / bruto.length;
    nota += razao < 0.02 ? 20 : razao < 0.06 ? 12 : 4;

    nota = Math.min(100, Math.max(0, nota));
    return { pct: nota, rotulo: nota >= 75 ? "Boa" : nota >= 50 ? "Regular" : "Fraca" };
}

function caractereEstranho(c: string): boolean {
    if (/[\p{L}\p{N}\s]/u.test(c)) return false;
    return !".,;:-–()/@+%#&'\"!?•*_".includes(c);
}

function montarSugestoes(
    palavras: Classificada[],
    curriculoNorm: string,
    experiencia: NotaExperiencia,
    pctFormatacao: number,
): Sugestao[] {
    const sugestoes: Sugestao[] = [];

    const tecnicasAusentes = palavras
        .filter((k) => k.tecnica && k.status === "ausente")
        .map((k) => k.exibicao);
    if (tecnicasAusentes.length > 0) {
        sugestoes.push({
            prioridade: "alta",
            titulo: "Inclua as tecnologias que a vaga pede",
            texto: `A vaga cita ${tecnicasAusentes.slice(0, 3).join(", ")} e nada disso aparece no seu currículo. Se você já trabalhou com essas tecnologias, cite-as nas habilidades e, principalmente, na experiência em que você as usou.`,
        });
    }

    const parcialCentral = palavras.find((k) => k.tecnica && k.status === "parcial")?.exibicao;
    if (parcialCentral) {
        sugestoes.push({
            prioridade: "alta",
            titulo: `Deixe ${parcialCentral} explícito`,
            texto: `${parcialCentral} aparece de forma vaga no seu currículo, mas é um requisito central da vaga. Cite o nome por extenso em uma experiência recente e descreva o que você construiu com ele.`,
        });
    }

    if (experiencia.verbos < 3) {
        sugestoes.push({
            prioridade: "media",
            titulo: "Comece cada entrega com um verbo de ação",
            texto: 'Suas descrições contam pouco sobre o que você fez. Troque frases como "responsável pelo módulo de pagamentos" por "desenvolvi o módulo de pagamentos", "reduzi", "automatizei", "liderei".',
        });
    }

    if (experiencia.razaoMetricas < 0.5) {
        sugestoes.push({
            prioridade: "media",
            titulo: "Quantifique os resultados",
            texto: `Só ${Math.round(experiencia.razaoMetricas * 100)}% das suas entregas têm número. Métrica é o que separa "melhorei a performance" de "reduzi o tempo de carregamento em 35%" na leitura do recrutador.`,
        });
    }

    if (experiencia.anos === 0) {
        sugestoes.push({
            prioridade: "baixa",
            titulo: "Deixe o tempo de experiência visível",
            texto: "Não encontramos um tempo de atuação declarado. Coloque o período de cada cargo (mês/ano de início e fim) e, no resumo, quantos anos você tem na área.",
        });
    }

    const titulos = TITULOS_PADRAO.filter((h) => contemPalavra(curriculoNorm, h)).length;
    if (titulos < 3 || pctFormatacao < 75) {
        sugestoes.push({
            prioridade: "baixa",
            titulo: "Padronize os títulos das seções",
            texto: 'Use nomes convencionais como "Experiência", "Formação" e "Habilidades". O ATS separa o currículo por esses títulos e ignora seções que não reconhece.',
        });
    }

    return sugestoes
        .sort((a, b) => ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade])
        .slice(0, 5);
}

function tomPorRazao(razao: number): Tom {
    return razao >= 0.75 ? "bom" : razao >= 0.5 ? "atencao" : "ruim";
}

function tomPorPct(pct: number): Tom {
    return pct >= 75 ? "bom" : pct >= 50 ? "atencao" : "ruim";
}

function vereditoPara(score: number): { veredito: string; descricao: string } {
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
const VERBOS_ACAO = new Set([
    "desenvolvi", "implementei", "criei", "construi", "liderei", "gerenciei", "otimizei",
    "reduzi", "aumentei", "melhorei", "automatizei", "projetei", "entreguei", "mantive",
    "colaborei", "coordenei", "integrei", "refatorei", "modernizei", "migrei", "publiquei",
    "atuei", "participei", "conduzi", "estruturei", "padronizei", "monitorei", "escalei",
    "developed", "implemented", "created", "built", "led", "managed", "optimized", "reduced",
    "increased", "improved", "automated", "designed", "delivered", "maintained", "collaborated",
    "coordinated", "integrated", "refactored", "launched", "shipped",
]);

// prettier-ignore
const PALAVRAS_FORMACAO = [
    "formacao", "graduacao", "bacharelado", "tecnologo", "licenciatura", "pos", "mestrado",
    "doutorado", "faculdade", "universidade", "curso", "tecnico", "ciencia da computacao",
    "engenharia", "sistemas de informacao", "analise e desenvolvimento", "education",
    "bachelor", "degree", "university",
];

// prettier-ignore
const TITULOS_PADRAO = [
    "experiencia", "formacao", "educacao", "habilidades", "competencias", "resumo", "objetivo",
    "projetos", "certificacoes", "idiomas", "contato", "experience", "education", "skills",
    "summary", "projects",
];
