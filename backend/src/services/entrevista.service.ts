import { db } from "../../db.ts";
import { interviewCards, interviewTopics, userCards } from "../../schema.ts";
import { and, asc, count, eq, inArray, notInArray, sql } from "drizzle-orm";

/**
 * Modo entrevista: as mesmas cartas do motor de revisão, escolhidas por nível e por
 * assunto em vez de por trilha.
 *
 * O agendamento, o baralho, a ofensiva e as estatísticas são os mesmos da revisão de
 * trilha, porque user_cards guarda estado por (origem, origemId) e não olha o tipo
 * da carta. O que existe aqui é só a forma de escolher o que entra na sessão.
 *
 * Assim como na revisão livre de área, a carta é servida do catálogo e só vira linha
 * de user_cards quando o aluno responde pela primeira vez. Passear pelos assuntos
 * não incha o baralho de ninguém.
 */

export type Nivel = "estagio" | "junior" | "pleno" | "senior";

/**
 * Do mais raso ao mais fundo. A ordem importa: o nível é cumulativo, então escolher
 * pleno traz também estágio e júnior. Entrevista de pleno cobra o básico do mesmo
 * jeito, e obrigar o aluno a marcar três caixas para ter uma sessão honesta seria
 * ruído.
 */
export const NIVEIS: Nivel[] = ["estagio", "junior", "pleno", "senior"];

export const ROTULO_NIVEL: Record<Nivel, string> = {
    estagio: "Estágio",
    junior: "Júnior",
    pleno: "Pleno",
    senior: "Sênior",
};

/** Os níveis que entram quando o aluno escolhe um: ele e todos os anteriores. */
export function ateONivel(nivel: Nivel): Nivel[] {
    return NIVEIS.slice(0, NIVEIS.indexOf(nivel) + 1);
}

function ehNivel(v: string): v is Nivel {
    return (NIVEIS as string[]).includes(v);
}

export function nivelValido(v: string | undefined): Nivel | null {
    return v && ehNivel(v) ? v : null;
}

/**
 * Os assuntos disponíveis, com quantas perguntas cada um tem até o nível escolhido e
 * quantas dessas o aluno já respondeu alguma vez.
 *
 * O número de respondidas é o que dá a sensação de progresso; sem ele a lista seria
 * só um menu, e o aluno não saberia por onde continuar.
 */
export async function topicos(userId: string, nivel: Nivel) {
    const niveis = ateONivel(nivel);

    const [linhas, feitas] = await Promise.all([
        db
            .select({
                id: interviewTopics.id,
                slug: interviewTopics.slug,
                nome: interviewTopics.nome,
                position: interviewTopics.position,
                total: count(interviewCards.id),
            })
            .from(interviewTopics)
            .leftJoin(
                interviewCards,
                and(
                    eq(interviewCards.topicoId, interviewTopics.id),
                    inArray(interviewCards.nivel, niveis),
                ),
            )
            .groupBy(interviewTopics.id)
            .orderBy(asc(interviewTopics.position), asc(interviewTopics.nome)),
        db
            .select({ topicoId: interviewCards.topicoId, n: count(userCards.id) })
            .from(userCards)
            .innerJoin(
                interviewCards,
                and(eq(userCards.origem, "entrevista"), eq(interviewCards.id, userCards.origemId)),
            )
            .where(and(eq(userCards.userId, userId), inArray(interviewCards.nivel, niveis)))
            .groupBy(interviewCards.topicoId),
    ]);

    const porTopico = new Map(feitas.map((f) => [f.topicoId, f.n]));
    return linhas.map((t) => ({
        id: t.id,
        slug: t.slug,
        nome: t.nome,
        total: t.total,
        vistas: porTopico.get(t.id) ?? 0,
    }));
}

/**
 * A fila de uma sessão de entrevista.
 *
 * A ordem é embaralhada de propósito, e não pela agenda: numa entrevista as
 * perguntas não vêm na ordem em que você as estudou. O que a agenda continua
 * governando é o que já está no baralho, pela fila do dia.
 */
export async function fila(
    userId: string,
    opcoes: { nivel: Nivel; topicos?: string[]; limite?: number | null },
) {
    const niveis = ateONivel(opcoes.nivel);
    const filtros = [inArray(interviewCards.nivel, niveis)];
    if (opcoes.topicos?.length) filtros.push(inArray(interviewCards.topicoId, opcoes.topicos));

    const linhas = await db
        .select({
            id: interviewCards.id,
            frente: interviewCards.frente,
            verso: interviewCards.verso,
            nivel: interviewCards.nivel,
            topico: interviewTopics.nome,
        })
        .from(interviewCards)
        .innerJoin(interviewTopics, eq(interviewTopics.id, interviewCards.topicoId))
        .where(and(...filtros))
        .orderBy(sql`random()`)
        .limit(opcoes.limite && opcoes.limite > 0 ? opcoes.limite : 200);

    return linhas.map((l) => ({
        id: l.id,
        frente: l.frente,
        verso: l.verso,
        origem: "entrevista" as const,
        trilha: null,
        aula: null,
        trilhaId: null,
        aulaId: null,
        topico: l.topico,
        nivel: l.nivel,
    }));
}

/**
 * Números do topo do modo: quantas perguntas existem até aquele nível, quantas o
 * aluno já respondeu alguma vez e quantas ainda não viu.
 */
export async function resumo(userId: string, nivel: Nivel) {
    const niveis = ateONivel(nivel);

    const jaNoBaralho = db
        .select({ id: userCards.origemId })
        .from(userCards)
        .where(and(eq(userCards.userId, userId), eq(userCards.origem, "entrevista")));

    const [[total], [novas]] = await Promise.all([
        db.select({ n: count() }).from(interviewCards).where(inArray(interviewCards.nivel, niveis)),
        db
            .select({ n: count() })
            .from(interviewCards)
            .where(
                and(
                    inArray(interviewCards.nivel, niveis),
                    notInArray(interviewCards.id, jaNoBaralho),
                ),
            ),
    ]);

    return {
        nivel,
        total: total?.n ?? 0,
        novas: novas?.n ?? 0,
        vistas: (total?.n ?? 0) - (novas?.n ?? 0),
    };
}
