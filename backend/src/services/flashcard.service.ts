import { db } from "../../db.ts";
import {
    flashcards,
    userCards,
    cardReviews,
    cardReports,
    lessons,
    lessonProgress,
    modules,
    trails,
    glossary,
} from "../../schema.ts";
import { and, asc, count, desc, eq, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

/**
 * Agendador baseado na curva do esquecimento de Ebbinghaus.
 *
 * A curva diz que a lembrança cai de forma exponencial com o tempo, e que a queda é
 * mais lenta quanto mais estável está a memória:
 *
 *     R(t) = e^(-t/S)
 *
 * onde R é a chance de lembrar, t é o tempo desde o último contato e S é a
 * estabilidade da memória. Aqui S está reparametrizado em dias até a retenção cair
 * ao alvo, o que deixa a conta direta de ler:
 *
 *     R(t) = ALVO^(t/S)
 *
 * Em t = S a retenção é exatamente o alvo, e é aí que o cartão volta. Com alvo de
 * 90%, o intervalo fica em torno de 10% do tempo que a memória duraria até se
 * apagar, que é a janela de revisão única que a literatura da curva aponta como a
 * mais eficiente.
 *
 * Três coisas mexem em S, e as três saem da teoria:
 *
 * 1. Repetir espaça. Cada acerto multiplica S, então o cartão volta cada vez mais
 *    tarde.
 * 2. Material fácil é esquecido mais devagar. "Fácil" multiplica S bem mais que
 *    "intermediária", e por isso o cartão que o aluno domina some quase de vez da fila.
 * 3. Acertar já esquecendo vale mais. Se o cartão foi respondido atrasado, a
 *    retenção no momento da revisão estava abaixo do alvo, e recuperar a memória
 *    nesse ponto consolida mais do que revisar recém-estudado. Responder cedo
 *    demais vale menos, pela mesma razão.
 */
export type Resposta = "errei" | "dificil" | "intermediaria" | "facil";

// Revisar quando a chance de lembrar cair para 90%. Alvo mais alto significa
// revisar mais vezes e esquecer menos; mais baixo, o contrário.
const RETENCAO_ALVO = 0.9;
// Teto de um ano: cartão dominado sai de circulação, mas não some para sempre.
const ESTABILIDADE_MAXIMA = 365;
const ESTABILIDADE_MINIMA = 0.5;
const FACILIDADE_MINIMA = 1.3;
const FACILIDADE_PADRAO = 2.5;
const FACILIDADE_MAXIMA = 3.2;

// Quanto a facilidade do cartão muda por resposta. Errar pesa mais que acertar bem,
// porque um cartão que falhou já provou que o intervalo estava longo demais.
const AJUSTE_FACILIDADE: Record<Resposta, number> = {
    errei: -0.2,
    dificil: -0.15,
    intermediaria: 0,
    facil: 0.15,
};

// Estabilidade inicial, em dias, no primeiro acerto do cartão.
const PRIMEIRA_ESTABILIDADE: Record<Exclude<Resposta, "errei">, number> = {
    dificil: 1,
    intermediaria: 2,
    facil: 4,
};

// Quanto a estabilidade cresce a cada acerto, para um cartão de facilidade média.
// A distância entre "intermediária" e "fácil" é o que faz o conteúdo dominado rarear.
const GANHO: Record<Exclude<Resposta, "errei">, number> = {
    dificil: 1.3,
    intermediaria: 2.4,
    facil: 3.6,
};

// Errar não zera a memória, encurta: parte do que foi aprendido continua lá.
const APOS_ERRO = 0.4;

const entre = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Fisher-Yates na ordem de APRESENTAÇÃO. Roda sempre depois de o limite já ter
 * cortado a fila: quem entra na sessão continua sendo decidido pela data de
 * vencimento, que é trabalho do agendador. Sortear antes do corte faria a carta
 * atrasada há duas semanas perder a vaga para uma que venceu hoje.
 *
 * Por que embaralhar: em ordem fixa a carta anterior vira pista da seguinte, e o
 * aluno passa a responder a sequência em vez da pergunta. Isso infla a nota que
 * ele dá, e a nota é justamente o que define a estabilidade e a próxima data. A
 * ordem fixa não deixa a revisão só monótona, ela distorce o agendador. De
 * quebra, misturar as aulas é prática intercalada em vez de em bloco, que rende
 * mais retenção mesmo parecendo mais difícil na hora.
 */
function embaralhar<T>(itens: T[]): T[] {
    for (let i = itens.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itens[i], itens[j]] = [itens[j], itens[i]];
    }
    return itens;
}

/** A curva: chance de lembrar depois de tantos dias sem rever o cartão. */
export function retencao(estabilidade: number, dias: number): number {
    if (estabilidade <= 0) return 0;
    return Math.pow(RETENCAO_ALVO, dias / estabilidade);
}

interface Estado {
    estabilidade: number;
    facilidade: number;
    repeticoes: number;
    lapsos: number;
}

export function proximoEstado(atual: Estado, resposta: Resposta, diasDesdeRevisao: number) {
    const facilidade = entre(
        atual.facilidade + AJUSTE_FACILIDADE[resposta],
        FACILIDADE_MINIMA,
        FACILIDADE_MAXIMA,
    );

    if (resposta === "errei") {
        return {
            estabilidade: Math.max(ESTABILIDADE_MINIMA, atual.estabilidade * APOS_ERRO),
            facilidade,
            repeticoes: 0,
            lapsos: atual.lapsos + 1,
            intervaloDias: 0,
        };
    }

    let estabilidade: number;
    if (atual.estabilidade <= 0) {
        estabilidade = PRIMEIRA_ESTABILIDADE[resposta];
    } else {
        // A facilidade do cartão modula o ganho: um cartão difícil para esta pessoa
        // cresce mais devagar que a média, e um fácil cresce mais rápido.
        const ganho = 1 + (GANHO[resposta] - 1) * (facilidade / FACILIDADE_PADRAO);
        // Bônus pela retenção no momento da revisão. Em dia dá 1, atrasado passa de
        // 1, adiantado fica abaixo. Os limites evitam que maratonar cartões no mesmo
        // dia, ou sumir por meses, distorça a estabilidade.
        const r = retencao(atual.estabilidade, diasDesdeRevisao);
        const bonus = entre(1 + (RETENCAO_ALVO - r) * 2, 0.6, 1.6);
        estabilidade = Math.min(ESTABILIDADE_MAXIMA, atual.estabilidade * ganho * bonus);
    }

    return {
        estabilidade,
        facilidade,
        repeticoes: atual.repeticoes + 1,
        lapsos: atual.lapsos,
        intervaloDias: Math.max(1, Math.round(estabilidade)),
    };
}

function diasDesde(quando: Date | null): number {
    if (!quando) return 0;
    return Math.max(0, (Date.now() - quando.getTime()) / 86400000);
}

function emDias(dias: number): Date {
    // Intervalo zero significa "de novo hoje", com um respiro de 10 minutos para o
    // cartão não reaparecer na cara do aluno no mesmo instante.
    const ms = dias === 0 ? 10 * 60 * 1000 : dias * 86400000;
    return new Date(Date.now() + ms);
}

/** Linha de user_cards no formato que o agendador entende. */
function paraEstado(linha: {
    estabilidade: string;
    facilidade: string;
    repeticoes: number;
    lapsos: number;
}): Estado {
    return {
        estabilidade: Number(linha.estabilidade),
        facilidade: Number(linha.facilidade),
        repeticoes: linha.repeticoes,
        lapsos: linha.lapsos,
    };
}

/**
 * Termos do glossário que aparecem no texto da aula.
 *
 * A fronteira usa lookaround com classe unicode em vez de \b pelo mesmo motivo do
 * destaque no front: o \b do JavaScript só conhece [A-Za-z0-9_], então termo com
 * acento nunca casaria.
 */
async function termosDaAula(lessonId: string): Promise<string[]> {
    const [aula] = await db
        .select({ blocos: lessons.contentBlocks, titulo: lessons.title })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!aula) return [];

    const texto = [aula.titulo, ...(aula.blocos ?? []).map((b) => b.value ?? "")].join("\n");
    const termos = await db.select({ id: glossary.id, term: glossary.term }).from(glossary);
    const LETRA = "[\\p{L}\\p{N}_]";
    return termos
        .filter((t) => {
            const escapado = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return new RegExp(`(?<!${LETRA})${escapado}(?!${LETRA})`, "iu").test(texto);
        })
        .map((t) => t.id);
}

/**
 * As perguntas que o aluno já tem abertas nesta trilha.
 *
 * A identidade de um cartão dentro da trilha é a pergunta, não a linha: o QC do
 * seeder proíbe frente repetida na mesma trilha, então frente igual é sempre o
 * mesmo cartão. É o que permite reconhecer a gêmea de outro trilho de linguagem.
 */
async function frentesAbertas(userId: string, trailId: string): Promise<Set<string>> {
    const linhas = await db
        .select({ frente: flashcards.frente })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(and(eq(userCards.userId, userId), eq(lessons.trailId, trailId)));
    return new Set(linhas.map((l) => l.frente));
}

/**
 * Cria o estado dos cartões de uma aula que o aluno acabou de concluir. Cartão de
 * aula não estudada nunca entra: entregaria a resposta antes da hora.
 *
 * Junto entram os termos do glossário citados na aula, que viram cartão de termo e
 * definição. É a mesma regra: o aluno só recebe o que já leu.
 */
export async function abrirCartoesDaAula(userId: string, lessonId: string) {
    const [[aula], cartoes, idsGlossario] = await Promise.all([
        db.select({ trailId: lessons.trailId }).from(lessons).where(eq(lessons.id, lessonId)),
        db
            .select({ id: flashcards.id, frente: flashcards.frente })
            .from(flashcards)
            .where(eq(flashcards.lessonId, lessonId)),
        termosDaAula(lessonId),
    ]);

    // Trilha com trilhos de linguagem tem a mesma aula duas vezes, uma por
    // linguagem, e o cartão conceitual foi semeado nas duas: são linhas
    // diferentes com a MESMA pergunta. Quem estudou os dois trilhos abriria as
    // duas e veria a pergunta repetida na revisão. A pergunta que o aluno já tem
    // na trilha barra a gêmea.
    const jaPerguntadas = aula ? await frentesAbertas(userId, aula.trailId) : new Set<string>();

    const candidatos = [
        ...cartoes
            .filter((c) => !jaPerguntadas.has(c.frente))
            .map((c) => ({ origem: "flashcard" as const, origemId: c.id })),
        ...idsGlossario.map((id) => ({ origem: "glossario" as const, origemId: id })),
    ];
    if (!candidatos.length) return 0;

    const jaTem = new Set(
        (
            await db
                .select({ origem: userCards.origem, origemId: userCards.origemId })
                .from(userCards)
                .where(
                    and(
                        eq(userCards.userId, userId),
                        inArray(
                            userCards.origemId,
                            candidatos.map((c) => c.origemId),
                        ),
                    ),
                )
        ).map((r) => `${r.origem}:${r.origemId}`),
    );

    const novos = candidatos.filter((c) => !jaTem.has(`${c.origem}:${c.origemId}`));
    if (!novos.length) return 0;
    await db
        .insert(userCards)
        .values(novos.map((c) => ({ userId, ...c, proximaRevisao: new Date() })));
    return novos.length;
}

interface CartaoNaFila {
    id: string;
    frente: string;
    verso: string;
    origem: "flashcard" | "glossario";
    trilha: string | null;
    aula: string | null;
    // De onde a carta saiu. Vai junto para o verso virar link e o aluno poder reler
    // a aula na hora em que descobriu que não lembra. Nulo em termo de glossário.
    trilhaId: string | null;
    aulaId: string | null;
}

/**
 * A fila do dia: cartões vencidos, do mais atrasado para o mais recente.
 *
 * Sem teto de sessão de propósito: quem quiser vara o baralho de uma vez, e quem não
 * quiser para na hora que cansar, que dá no mesmo. O limite alto que sobra é só uma
 * trava de payload, para um baralho gigante não virar uma resposta de megabytes.
 */
/**
 * A fila de revisão do conteúdo escolhido.
 *
 * Serve TUDO que o aluno já estudou naquele conteúdo, e não só o que venceu hoje.
 * A tela da trilha sempre funcionou assim, e ver "4 cartas" na sala de revisão e
 * "116" no botão da trilha, para o mesmo conteúdo, é diferença que ninguém
 * consegue explicar para quem está estudando. As duas fazem a mesma coisa, então
 * entregam o mesmo número.
 *
 * O agendador não sai de cena, muda de papel: ele deixa de trancar o que aparece e
 * passa a mandar na PRIORIDADE. A ordem é do mais atrasado para o mais adiantado,
 * então quando o aluno pede um número de cartas, quem entra no corte é o que está
 * mais perto de ser esquecido. Responder continua reagendando cada carta pela
 * curva, e responder adiantado continua rendendo menos estabilidade, pelo bônus
 * abaixo de 1.
 */
export async function filaDoDia(
    userId: string,
    limite = 500,
    filtro?: { trilhas?: string[]; glossario?: boolean },
): Promise<CartaoNaFila[]> {
    const meus = eq(userCards.userId, userId);

    // Sem filtro a fila é o baralho inteiro. Com filtro, a seleção de trilhas e o
    // glossário são somados: dá para revisar duas trilhas juntas, ou só o glossário.
    const escolheu = filtro && (filtro.trilhas?.length || filtro.glossario);
    let linhas;
    if (!escolheu) {
        linhas = await db
            .select()
            .from(userCards)
            .where(meus)
            .orderBy(asc(userCards.proximaRevisao))
            .limit(limite);
    } else {
        const partes = [];
        if (filtro.trilhas?.length) {
            partes.push(
                db
                    .select({ uc: userCards })
                    .from(userCards)
                    .innerJoin(
                        flashcards,
                        and(
                            eq(userCards.origem, "flashcard"),
                            eq(flashcards.id, userCards.origemId),
                        ),
                    )
                    .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
                    .where(and(meus, inArray(lessons.trailId, filtro.trilhas)))
                    .orderBy(asc(userCards.proximaRevisao))
                    .limit(limite)
                    .then((r) => r.map((x) => x.uc)),
            );
        }
        if (filtro.glossario) {
            partes.push(
                db
                    .select()
                    .from(userCards)
                    .where(and(meus, eq(userCards.origem, "glossario")))
                    .orderBy(asc(userCards.proximaRevisao))
                    .limit(limite),
            );
        }
        linhas = (await Promise.all(partes))
            .flat()
            .sort((a, b) => a.proximaRevisao.getTime() - b.proximaRevisao.getTime())
            .slice(0, limite);
    }
    if (!linhas.length) return [];

    // A ordem por vencimento acima escolheu QUAIS cartas entram. Daqui para frente
    // a ordem é sorteada, senão a fila sai em blocos por aula, sempre na mesma
    // sequência em que as cartas foram autoradas.
    return montarCartoes(embaralhar(await semGemeas(linhas)));
}

/**
 * Tira da fila a carta gêmea: a mesma pergunta duas vezes na mesma trilha, uma por
 * trilho de linguagem.
 *
 * O código já não abre mais gêmea (ver abrirCartoesDaAula) e existe script para
 * limpar as antigas, mas enquanto sobrar uma no baralho de alguém ela apareceria
 * repetida na sessão, e o total da sala não bateria com o da trilha. Como as linhas
 * chegam ordenadas por vencimento, a que fica é a mais atrasada.
 *
 * Cartão de glossário passa direto: o id dele já é único por termo.
 */
async function semGemeas<T extends { origem: "flashcard" | "glossario"; origemId: string }>(
    linhas: T[],
): Promise<T[]> {
    const ids = linhas.filter((l) => l.origem === "flashcard").map((l) => l.origemId);
    if (!ids.length) return linhas;

    const dados = await db
        .select({ id: flashcards.id, frente: flashcards.frente, trailId: lessons.trailId })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(inArray(flashcards.id, ids));
    const porId = new Map(dados.map((d) => [d.id, `${d.trailId}:${d.frente}`]));

    const vistas = new Set<string>();
    return linhas.filter((l) => {
        if (l.origem !== "flashcard") return true;
        const chave = porId.get(l.origemId);
        if (!chave) return true;
        if (vistas.has(chave)) return false;
        vistas.add(chave);
        return true;
    });
}

async function montarCartoes(
    linhas: { origem: "flashcard" | "glossario"; origemId: string }[],
): Promise<CartaoNaFila[]> {
    const idsCard = linhas.filter((l) => l.origem === "flashcard").map((l) => l.origemId);
    const idsGloss = linhas.filter((l) => l.origem === "glossario").map((l) => l.origemId);

    const cards = idsCard.length
        ? await db
              .select({
                  id: flashcards.id,
                  frente: flashcards.frente,
                  verso: flashcards.verso,
                  aula: lessons.title,
                  aulaId: lessons.id,
                  trilha: trails.name,
                  trilhaId: trails.id,
              })
              .from(flashcards)
              .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
              .innerJoin(trails, eq(trails.id, lessons.trailId))
              .where(inArray(flashcards.id, idsCard))
        : [];
    const termos = idsGloss.length
        ? await db
              .select({ id: glossary.id, frente: glossary.term, verso: glossary.definition })
              .from(glossary)
              .where(inArray(glossary.id, idsGloss))
        : [];

    const porId = new Map<string, CartaoNaFila>();
    for (const c of cards)
        porId.set(c.id, {
            id: c.id,
            frente: c.frente,
            verso: c.verso,
            origem: "flashcard",
            trilha: c.trilha,
            aula: c.aula,
            trilhaId: c.trilhaId,
            aulaId: c.aulaId,
        });
    for (const t of termos)
        porId.set(t.id, {
            id: t.id,
            frente: t.frente,
            verso: t.verso,
            origem: "glossario",
            trilha: null,
            aula: null,
            trilhaId: null,
            aulaId: null,
        });

    // Mantém a ordem da fila, e descarta o que sumiu do catálogo.
    return linhas.map((l) => porId.get(l.origemId)).filter((c): c is CartaoNaFila => !!c);
}

/** Registra a resposta e reagenda o cartão. */
export async function responder(
    userId: string,
    origem: "flashcard" | "glossario",
    origemId: string,
    resposta: Resposta,
    tempoMs?: number,
) {
    const [atual] = await db
        .select()
        .from(userCards)
        .where(
            and(
                eq(userCards.userId, userId),
                eq(userCards.origem, origem),
                eq(userCards.origemId, origemId),
            ),
        );

    // Sem estado o cartão pode ser novo de verdade (autorado depois de o aluno
    // concluir a aula) ou de aula que ele nunca fez. O primeiro caso entra agora; o
    // segundo é recusado, senão daria para pescar resposta de aula não estudada.
    const estado = atual ?? (await abrirCartaoAvulso(userId, origem, origemId));

    const dias = diasDesde(estado.ultimaRevisao);
    const antes = paraEstado(estado);
    const novo = proximoEstado(antes, resposta, dias);

    await db.insert(cardReviews).values({
        userId,
        origem,
        origemId,
        resposta,
        retencaoPrevista:
            antes.estabilidade > 0 ? retencao(antes.estabilidade, dias).toFixed(3) : null,
        estabilidadeAntes: antes.estabilidade.toFixed(2),
        estabilidadeDepois: novo.estabilidade.toFixed(2),
        intervaloDias: novo.intervaloDias,
        tempoMs: tempoMs ?? null,
    });

    await db
        .update(userCards)
        .set({
            estabilidade: novo.estabilidade.toFixed(2),
            intervaloDias: novo.intervaloDias,
            facilidade: novo.facilidade.toFixed(2),
            repeticoes: novo.repeticoes,
            lapsos: novo.lapsos,
            proximaRevisao: emDias(novo.intervaloDias),
            ultimaRevisao: new Date(),
        })
        .where(eq(userCards.id, estado.id));

    return { intervaloDias: novo.intervaloDias, proximaRevisao: emDias(novo.intervaloDias) };
}

/**
 * Abre um cartão solto no baralho, para o caso de ele ter sido autorado depois de o
 * aluno concluir a aula. Só vale para aula concluída, e termo de glossário nunca
 * passa por aqui porque não tem aula a conferir.
 */
async function abrirCartaoAvulso(
    userId: string,
    origem: "flashcard" | "glossario",
    origemId: string,
) {
    if (origem !== "flashcard") throw new AppError(404, "Cartão não encontrado no seu baralho.");

    const [permitido] = await db
        .select({ frente: flashcards.frente, trailId: lessons.trailId })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(
            lessonProgress,
            and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)),
        )
        .where(eq(flashcards.id, origemId));
    if (!permitido) throw new AppError(404, "Cartão não encontrado no seu baralho.");

    // Se a mesma pergunta já está aberta pelo outro trilho de linguagem, responder
    // aqui mexe naquele cartão em vez de abrir um segundo. Sem isso a gêmea
    // renasceria no baralho pela porta de trás, que é o caminho da revisão de
    // trilha (ela lê o catálogo, não o baralho).
    const [gemea] = await db
        .select({ uc: userCards })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(
            and(
                eq(userCards.userId, userId),
                eq(lessons.trailId, permitido.trailId),
                eq(flashcards.frente, permitido.frente),
            ),
        )
        .limit(1);
    if (gemea) return gemea.uc;

    const [criado] = await db
        .insert(userCards)
        .values({ userId, origem, origemId, proximaRevisao: new Date() })
        .returning();
    return criado;
}

/**
 * Revisão de uma trilha inteira, oferecida ao concluí-la. Diferente da fila do dia,
 * aqui não importa a data: o objetivo é passar pelo conteúdo todo de uma vez, e por
 * isso a ordem é a das aulas, não a do agendador.
 */
export async function revisaoDaTrilha(userId: string, trailId: string) {
    const cartoes = await db
        .select({
            id: flashcards.id,
            frente: flashcards.frente,
            verso: flashcards.verso,
            aula: lessons.title,
            aulaId: lessons.id,
            trilha: trails.name,
            trilhaId: trails.id,
        })
        .from(flashcards)
        // O join com o progresso é o que garante a regra: só entra cartão de aula
        // concluída, senão a revisão entregaria a resposta de aula não estudada.
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(modules, eq(modules.id, lessons.moduleId))
        .innerJoin(trails, eq(trails.id, lessons.trailId))
        .innerJoin(
            lessonProgress,
            and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)),
        )
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)))
        .orderBy(asc(modules.position), asc(lessons.position), asc(flashcards.position));

    // Aqui a leitura é do catálogo, e não do baralho, então a gêmea do outro
    // trilho de linguagem chega mesmo depois do baralho limpo. Fica a primeira na
    // ordem da trilha, que é estável.
    const vistas = new Set<string>();
    const unicos = cartoes.filter((c) => {
        if (vistas.has(c.frente)) return false;
        vistas.add(c.frente);
        return true;
    });

    // A ordem da trilha acima serve ao dedup, que precisa ser estável. A revisão em
    // si sai sorteada: aqui o objetivo é retenção, não refazer o caminho da trilha.
    return embaralhar(unicos).map((c) => ({ ...c, origem: "flashcard" as const }));
}

/** Quantos cartões a trilha já liberou para este aluno. Alimenta a chamada de revisão. */
export async function contarRevisaoDaTrilha(userId: string, trailId: string) {
    const [linha] = await db
        // Conta pergunta distinta, e não linha, pelo mesmo motivo do dedup em
        // revisaoDaTrilha: senão o botão promete mais cartas do que vai mostrar.
        .select({ n: sql<number>`count(distinct ${flashcards.frente})` })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(
            lessonProgress,
            and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)),
        )
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)));
    return { total: Number(linha?.n ?? 0) };
}

/**
 * Os baralhos do aluno: uma linha por trilha que tem cartão dele, mais o glossário.
 * É a lista que a aba mostra para ele escolher o que revisar, sozinho ou misturado.
 */
export async function baralhos(userId: string) {
    const agora = new Date();
    const vencido = sql<number>`count(*) filter (where ${userCards.proximaRevisao} <= ${agora})`;

    const porTrilha = await db
        .select({
            trilhaId: trails.id,
            nome: trails.name,
            vencidos: vencido,
            total: count(),
        })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(trails, eq(trails.id, lessons.trailId))
        .where(eq(userCards.userId, userId))
        .groupBy(trails.id, trails.name)
        .orderBy(trails.name);

    const [gloss] = await db
        .select({ vencidos: vencido, total: count() })
        .from(userCards)
        .where(and(eq(userCards.userId, userId), eq(userCards.origem, "glossario")));

    return {
        trilhas: porTrilha.map((t) => ({
            id: t.trilhaId,
            nome: t.nome,
            vencidos: Number(t.vencidos),
            total: Number(t.total),
        })),
        glossario: { vencidos: Number(gloss?.vencidos ?? 0), total: Number(gloss?.total ?? 0) },
    };
}

/**
 * Estatísticas das respostas. Sai do histórico em card_reviews, não do estado atual
 * dos cartões: o estado é sobrescrito a cada revisão e não conta o que houve antes.
 */
export async function estatisticas(userId: string) {
    const [porResposta, ultimos30, [maturidade], [tempos]] = await Promise.all([
        db
            .select({ resposta: cardReviews.resposta, n: count() })
            .from(cardReviews)
            .where(eq(cardReviews.userId, userId))
            .groupBy(cardReviews.resposta),
        db
            .select({
                dia: sql<string>`to_char(${cardReviews.criadoEm} at time zone 'UTC', 'YYYY-MM-DD')`,
                n: count(),
            })
            .from(cardReviews)
            .where(
                and(
                    eq(cardReviews.userId, userId),
                    sql`${cardReviews.criadoEm} >= now() - interval '30 days'`,
                ),
            )
            .groupBy(sql`1`)
            .orderBy(sql`1`),
        db
            .select({
                emAprendizado: sql<number>`count(*) filter (where ${userCards.intervaloDias} < 21)`,
                dominados: sql<number>`count(*) filter (where ${userCards.intervaloDias} >= 21)`,
                mediaEstabilidade: sql<number>`coalesce(avg(${userCards.estabilidade}), 0)`,
            })
            .from(userCards)
            .where(eq(userCards.userId, userId)),
        // A mediana conta melhor que a média aqui: uma carta que ficou aberta
        // enquanto a pessoa foi fazer café puxaria a média sozinha.
        db
            .select({
                mediana: sql<number>`coalesce(percentile_cont(0.5) within group (order by ${cardReviews.tempoMs}), 0)`,
                total: sql<number>`coalesce(sum(${cardReviews.tempoMs}), 0)`,
            })
            .from(cardReviews)
            .where(and(eq(cardReviews.userId, userId), isNotNull(cardReviews.tempoMs))),
    ]);

    const contagem = { errei: 0, dificil: 0, intermediaria: 0, facil: 0 } as Record<
        Resposta,
        number
    >;
    for (const r of porResposta) contagem[r.resposta] = Number(r.n);
    const respostas = Object.values(contagem).reduce((s, n) => s + n, 0);
    const acertos = respostas - contagem.errei;

    return {
        respostas,
        acertos,
        // Taxa de acerto: proporção de cartões que o aluno lembrou na hora. É a
        // medida direta de se o agendador está acertando o momento da revisão; muito
        // acima do alvo significa revisar cedo demais.
        taxaAcerto: respostas ? Math.round((acertos / respostas) * 100) : 0,
        porResposta: contagem,
        diasAtivos: ultimos30.length,
        porDia: ultimos30.map((d) => ({ dia: d.dia, n: Number(d.n) })),
        emAprendizado: Number(maturidade?.emAprendizado ?? 0),
        dominados: Number(maturidade?.dominados ?? 0),
        // Quanto tempo, em média, a memória do baralho dura até a retenção cair ao alvo.
        estabilidadeMedia: Math.round(Number(maturidade?.mediaEstabilidade ?? 0)),
        tempoTipicoMs: Math.round(Number(tempos?.mediana ?? 0)),
        tempoTotalMs: Number(tempos?.total ?? 0),
    };
}

/**
 * As cartas em que o aluno mais tropeça.
 *
 * Ordena por lapsos e desempata pela facilidade porque as duas contam coisas
 * diferentes: lapso é quantas vezes a memória já falhou, facilidade é o quanto o
 * agendador aprendeu que aquela carta é dura para esta pessoa. Uma carta com dois
 * lapsos e facilidade no piso incomoda mais que outra com dois lapsos e facilidade
 * média.
 *
 * Vem com a aula de origem junto: insistir na carta resolve menos que reler o
 * trecho que não ficou.
 */
export async function pontosFracos(userId: string, limite = 5) {
    const cartoes = await db
        .select({
            id: userCards.origemId,
            origem: userCards.origem,
            lapsos: userCards.lapsos,
            facilidade: userCards.facilidade,
            frente: flashcards.frente,
            aula: lessons.title,
            aulaId: lessons.id,
            trilha: trails.name,
            trilhaId: trails.id,
        })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(trails, eq(trails.id, lessons.trailId))
        .where(and(eq(userCards.userId, userId), sql`${userCards.lapsos} > 0`))
        .orderBy(desc(userCards.lapsos), asc(userCards.facilidade))
        .limit(limite);

    // Termo de glossário também erra, e não tem aula para linkar.
    const termos = await db
        .select({
            id: userCards.origemId,
            origem: userCards.origem,
            lapsos: userCards.lapsos,
            facilidade: userCards.facilidade,
            frente: glossary.term,
        })
        .from(userCards)
        .innerJoin(
            glossary,
            and(eq(userCards.origem, "glossario"), eq(glossary.id, userCards.origemId)),
        )
        .where(and(eq(userCards.userId, userId), sql`${userCards.lapsos} > 0`))
        .orderBy(desc(userCards.lapsos), asc(userCards.facilidade))
        .limit(limite);

    return [
        ...cartoes.map((c) => ({ ...c, facilidade: Number(c.facilidade) })),
        ...termos.map((t) => ({
            ...t,
            facilidade: Number(t.facilidade),
            aula: null as string | null,
            aulaId: null as string | null,
            trilha: null as string | null,
            trilhaId: null as string | null,
        })),
    ]
        .sort((a, b) => b.lapsos - a.lapsos || a.facilidade - b.facilidade)
        .slice(0, limite);
}

// Silêncio que separa uma sessão da seguinte. Não existe registro de "começou" e
// "terminou": a sessão é reconstruída do histórico, e este é o corte que decide se
// duas revisões seguidas foram a mesma sentada ou duas visitas diferentes.
const INTERVALO_ENTRE_SESSOES = "30 minutes";

/**
 * Histórico de sessões, reconstruído a partir das respostas.
 *
 * Agrupar em vez de registrar tem uma vantagem que decidiu a escolha: funciona para
 * trás, sobre tudo o que já foi respondido, e não depende de o aluno "fechar" a
 * sessão, coisa que ninguém faz (fecha a aba, o telefone dorme, a bateria acaba).
 */
export async function historicoSessoes(userId: string, limite = 20) {
    const { rows } = await db.execute<{
        inicio: string;
        fim: string;
        cartas: number;
        errei: number;
        dificil: number;
        intermediaria: number;
        facil: number;
        tempo_respondendo: number;
        conteudos: string[];
    }>(sql`
        with marcadas as (
            select
                cr.criado_em,
                cr.resposta,
                cr.tempo_ms,
                cr.origem,
                cr.origem_id,
                case
                    when lag(cr.criado_em) over (order by cr.criado_em) is null
                      or cr.criado_em - lag(cr.criado_em) over (order by cr.criado_em)
                         > ${sql.raw(`interval '${INTERVALO_ENTRE_SESSOES}'`)}
                    then 1 else 0
                end as nova
            from card_reviews cr
            where cr.user_id = ${userId}
        ),
        numeradas as (
            select *, sum(nova) over (order by criado_em) as sessao from marcadas
        ),
        com_conteudo as (
            select
                n.*,
                case when n.origem = 'glossario' then 'Glossário' else t.name end as conteudo
            from numeradas n
            left join flashcards f on n.origem = 'flashcard' and f.id = n.origem_id
            left join lessons l on l.id = f.lesson_id
            left join trails t on t.id = l.trail_id
        )
        select
            min(criado_em) as inicio,
            max(criado_em) as fim,
            count(*)::int as cartas,
            count(*) filter (where resposta = 'errei')::int as errei,
            count(*) filter (where resposta = 'dificil')::int as dificil,
            count(*) filter (where resposta = 'intermediaria')::int as intermediaria,
            count(*) filter (where resposta = 'facil')::int as facil,
            coalesce(sum(tempo_ms), 0)::int as tempo_respondendo,
            array_remove(array_agg(distinct conteudo), null) as conteudos
        from com_conteudo
        group by sessao
        order by inicio desc
        limit ${limite}
    `);

    return rows.map((s) => {
        const inicio = new Date(s.inicio);
        const fim = new Date(s.fim);
        const respondendo = Number(s.tempo_respondendo);
        return {
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
            cartas: Number(s.cartas),
            porResposta: {
                errei: Number(s.errei),
                dificil: Number(s.dificil),
                intermediaria: Number(s.intermediaria),
                facil: Number(s.facil),
            },
            // O conteúdo sai do que de fato caiu, e não da escolha guardada: a escolha
            // pode ter sido "tudo", e saber que caiu Lógica e glossário diz mais.
            conteudos: s.conteudos ?? [],
            // Duração do relógio, do primeiro ao último cartão. Numa sessão de uma
            // carta só ela daria zero, então o tempo somado de resposta serve de piso.
            duracaoMs: Math.max(fim.getTime() - inicio.getTime(), respondendo),
            tempoRespondendoMs: respondendo,
        };
    });
}

/**
 * Sinaliza uma carta com problema. Só vale para carta que está no baralho do aluno,
 * senão viraria porta para reportar conteúdo que ele nunca viu.
 */
export async function reportarCartao(
    userId: string,
    origem: "flashcard" | "glossario",
    origemId: string,
    comentario?: string,
) {
    const [tem] = await db
        .select({ id: userCards.id })
        .from(userCards)
        .where(
            and(
                eq(userCards.userId, userId),
                eq(userCards.origem, origem),
                eq(userCards.origemId, origemId),
            ),
        );
    if (!tem) throw new AppError(404, "Cartão não encontrado no seu baralho.");

    await db
        .insert(cardReports)
        .values({ userId, origem, origemId, comentario: comentario ?? null })
        .onConflictDoUpdate({
            target: [cardReports.userId, cardReports.origem, cardReports.origemId],
            set: { comentario: comentario ?? null, criadoEm: new Date(), resolvidoEm: null },
        });
    return { reportado: true };
}

/** Números da aba: quantos vencidos hoje, quantos no baralho, quantos dominados. */
export async function resumo(userId: string) {
    const [[venc], [total], [dominados]] = await Promise.all([
        db
            .select({ n: count() })
            .from(userCards)
            .where(and(eq(userCards.userId, userId), lte(userCards.proximaRevisao, new Date()))),
        db.select({ n: count() }).from(userCards).where(eq(userCards.userId, userId)),
        db
            .select({ n: count() })
            .from(userCards)
            .where(
                and(
                    eq(userCards.userId, userId),
                    // 21 dias é o ponto em que o intervalo já é longo o bastante para
                    // a memória ser considerada firme; é o mesmo corte que o Anki usa
                    // para chamar um cartão de maduro.
                    sql`${userCards.intervaloDias} >= 21`,
                ),
            ),
    ]);
    return {
        vencidos: Number(venc?.n ?? 0),
        total: Number(total?.n ?? 0),
        dominados: Number(dominados?.n ?? 0),
    };
}
