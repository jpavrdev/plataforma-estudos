// Semeia os cartões de revisão de todas as trilhas que têm arquivo em
// scripts/data/flashcards.
//
// A régua, conferida aqui antes de gravar qualquer coisa:
//
// 1. Um fato por cartão. Verso com "e" ligando duas ideias vira dois cartões.
// 2. A frente se sustenta sozinha, é sempre uma pergunta e não depende de alternativas.
// 3. Verso de no máximo 90 caracteres. Cartão que exige ler parágrafo não é cartão.
// 4. O cartão NÃO repete as questões do quiz da aula. Isto é o ponto da feature: a
//    aula ensina bem mais que os cinco fatos que o quiz cobra, e o cartão pega o que
//    sobrou. Não dá para verificar por máquina, então é responsabilidade da autoria.
// 5. Sem travessão e sem emoji, como no resto da casa.
//
// Quantos cartões por aula é decisão de cada aula, não cota: aula que só sustenta
// três cartões distintos recebe três, e forçar o quarto produziria repetição.
//
// Idempotente: cartão já gravado para a aula é pulado pela frente.
//
// Rodar tudo:            node scripts/seed-flashcards.ts
// Rodar uma trilha só:   node scripts/seed-flashcards.ts "Lógica de Programação"
import { db } from "../db.ts";
import { flashcards, lessons, modules, trails } from "../schema.ts";
import { and, eq } from "drizzle-orm";
import { TRILHAS } from "./data/flashcards/index.ts";

export interface Cartao {
    frente: string;
    verso: string;
}

/**
 * Cartões de uma aula. "neutra" vale para todas as variantes de linguagem da aula, e
 * a chave da linguagem soma a essas. Trilha de programação tem muito conceito que
 * independe da sintaxe, e repetir o mesmo cartão nas duas variantes seria trabalho
 * dobrado para manter.
 */
export interface CartoesDaAula {
    neutra?: Cartao[];
    javascript?: Cartao[];
    python?: Cartao[];
}

export interface CartasDaTrilha {
    trilha: string;
    modulos: Record<number, Record<number, CartoesDaAula>>;
}

const VERSO_MAX = 90;

const PROIBIDOS = [
    /—/,
    /qual das (op[çc][õo]es|alternativas)/i,
    /assinale/i,
    /alternativa correta/i,
    /\b[IVX]{2,}\b/,
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
];

function conferir(dados: CartasDaTrilha): string[] {
    const erros: string[] = [];
    const vistos = new Set<string>();
    for (const [mod, aulas] of Object.entries(dados.modulos)) {
        for (const [aula, grupos] of Object.entries(aulas)) {
            for (const [variante, cartoes] of Object.entries(grupos)) {
                for (const c of cartoes as Cartao[]) {
                    const onde = `${dados.trilha} ${mod}.${aula} [${variante}]`;
                    if (!c.frente.trim().endsWith("?"))
                        erros.push(`${onde}: frente não é pergunta: "${c.frente.slice(0, 50)}"`);
                    if (c.verso.length > VERSO_MAX)
                        erros.push(
                            `${onde}: verso com ${c.verso.length} caracteres (máx ${VERSO_MAX}): "${c.verso.slice(0, 50)}"`,
                        );
                    // A frente repetida é conferida na trilha inteira, e não só na
                    // aula: cartão duplicado entre aulas cobraria a mesma coisa duas
                    // vezes na mesma sessão.
                    const chave = c.frente.toLowerCase().trim();
                    if (vistos.has(chave)) erros.push(`${onde}: frente repetida: "${c.frente}"`);
                    vistos.add(chave);
                    for (const p of PROIBIDOS)
                        if (p.test(c.frente) || p.test(c.verso))
                            erros.push(`${onde}: casa com ${p}: "${c.frente.slice(0, 40)}"`);
                }
            }
        }
    }
    return erros;
}

/** Os cartões que valem para uma aula: os neutros mais os da linguagem dela. */
function cartoesDaAula(grupos: CartoesDaAula | undefined, linguagem: string | null): Cartao[] {
    if (!grupos) return [];
    const daLinguagem =
        linguagem === "python" ? grupos.python : linguagem === "javascript" ? grupos.javascript : [];
    return [...(grupos.neutra ?? []), ...(daLinguagem ?? [])];
}

async function semearTrilha(dados: CartasDaTrilha) {
    const [trilha] = await db.select().from(trails).where(eq(trails.name, dados.trilha));
    if (!trilha) {
        console.log(`  "${dados.trilha}" não encontrada no catálogo, pulando.`);
        return { criados: 0, pulados: 0 };
    }

    let criados = 0;
    let pulados = 0;
    for (const [modPos, aulas] of Object.entries(dados.modulos)) {
        const [modulo] = await db
            .select()
            .from(modules)
            .where(and(eq(modules.trailId, trilha.id), eq(modules.position, Number(modPos))));
        if (!modulo) {
            console.log(`  módulo ${modPos} de "${dados.trilha}" não encontrado, pulando.`);
            continue;
        }

        const doModulo = await db.select().from(lessons).where(eq(lessons.moduleId, modulo.id));
        for (const aula of doModulo) {
            const previstos = cartoesDaAula(aulas[aula.position], aula.language);
            if (!previstos.length) continue;

            const existentes = new Set(
                (
                    await db
                        .select({ frente: flashcards.frente })
                        .from(flashcards)
                        .where(eq(flashcards.lessonId, aula.id))
                ).map((f) => f.frente),
            );

            const novos = previstos
                .map((c, i) => ({
                    lessonId: aula.id,
                    frente: c.frente,
                    verso: c.verso,
                    position: i,
                }))
                .filter((c) => !existentes.has(c.frente));
            pulados += previstos.length - novos.length;
            if (!novos.length) continue;
            await db.insert(flashcards).values(novos);
            criados += novos.length;
        }
    }
    return { criados, pulados };
}

async function semear() {
    const alvo = process.argv[2];
    const escolhidas = alvo ? TRILHAS.filter((t) => t.trilha === alvo) : TRILHAS;
    if (!escolhidas.length) {
        console.error(`Nenhuma trilha com cartões chamada "${alvo}".`);
        console.error(`Disponíveis: ${TRILHAS.map((t) => t.trilha).join(", ")}`);
        process.exit(1);
    }

    // O QC roda sobre todas as escolhidas antes de gravar qualquer uma: reprovar no
    // meio deixaria metade semeada.
    const erros = escolhidas.flatMap(conferir);
    if (erros.length) {
        console.error(`QC reprovou ${erros.length} cartão(ões). Nada foi gravado:`);
        for (const e of erros) console.error(`  ${e}`);
        process.exit(1);
    }

    let totalCriados = 0;
    let totalPulados = 0;
    for (const dados of escolhidas) {
        const { criados, pulados } = await semearTrilha(dados);
        console.log(`${dados.trilha}: ${criados} criado(s), ${pulados} ja existia(m).`);
        totalCriados += criados;
        totalPulados += pulados;
    }
    console.log(`Total: ${totalCriados} criado(s), ${totalPulados} ja existia(m).`);
}

semear()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao semear os cartoes:", e);
        process.exit(1);
    });
