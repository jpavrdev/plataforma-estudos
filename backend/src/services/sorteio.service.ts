import { randomInt } from "node:crypto";
import { and, asc, count, desc, eq, isNull, lte, ne, sql } from "drizzle-orm";
import type { z } from "zod";
import { db } from "../../db.ts";
import { sorteioParticipacoes, sorteios, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import type { Contatos } from "../domain/contatos.ts";
import { periodosSobrepoem, periodoValido, situacaoDoSorteio } from "../domain/sorteio.ts";
import type { Periodo } from "../domain/sorteio.ts";
import { sortear } from "../domain/sortear.ts";
import type { atualizarSorteioSchema, criarSorteioSchema } from "../schemas/sorteio.schema.ts";

type DadosCriar = z.infer<typeof criarSorteioSchema>;
type DadosAtualizar = z.infer<typeof atualizarSorteioSchema>;
type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];

const GANHADORES = 3;

const participacaoDoAluno = {
    contatos: sorteioParticipacoes.contatos,
    inscritoEm: sorteioParticipacoes.createdAt,
    atualizadoEm: sorteioParticipacoes.updatedAt,
};

export async function sorteioAtivo(userId: string) {
    const agora = new Date();
    // Como os períodos não se sobrepõem, só o último sorteio a começar pode estar aberto.
    const [sorteio] = await db
        .select({
            id: sorteios.id,
            titulo: sorteios.titulo,
            descricao: sorteios.descricao,
            inicio: sorteios.inicio,
            fim: sorteios.fim,
            sorteadoEm: sorteios.sorteadoEm,
        })
        .from(sorteios)
        .where(lte(sorteios.inicio, agora))
        .orderBy(desc(sorteios.inicio))
        .limit(1);
    if (!sorteio || situacaoDoSorteio(sorteio, agora) !== "aberto") return null;

    const [participacao] = await db
        .select(participacaoDoAluno)
        .from(sorteioParticipacoes)
        .where(
            and(
                eq(sorteioParticipacoes.sorteioId, sorteio.id),
                eq(sorteioParticipacoes.userId, userId),
            ),
        );
    return {
        id: sorteio.id,
        titulo: sorteio.titulo,
        descricao: sorteio.descricao,
        inicio: sorteio.inicio,
        fim: sorteio.fim,
        participacao: participacao ?? null,
    };
}

// O FOR SHARE segura a linha até o fim da transação: o UPDATE que abre o sorteio
// espera a inscrição em curso terminar, e a que chega depois dele já encontra
// sorteado_em preenchido.
async function exigirInscricoesAbertas(tx: Transacao, sorteioId: string) {
    const [sorteio] = await tx
        .select({ inicio: sorteios.inicio, fim: sorteios.fim, sorteadoEm: sorteios.sorteadoEm })
        .from(sorteios)
        .where(eq(sorteios.id, sorteioId))
        .for("share");
    if (!sorteio) throw new AppError(404, "Sorteio não encontrado");
    if (situacaoDoSorteio(sorteio, new Date()) !== "aberto") {
        throw new AppError(409, "As inscrições deste sorteio estão fechadas");
    }
}

export async function salvarParticipacao(sorteioId: string, userId: string, contatos: Contatos) {
    return db.transaction(async (tx) => {
        await exigirInscricoesAbertas(tx, sorteioId);
        // A tela manda completar o perfil antes; sem @ o ganhador não teria como ser anunciado.
        const [aluno] = await tx
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, userId));
        if (!aluno?.username) throw new AppError(403, "Complete o perfil com um @ para participar");

        const [participacao] = await tx
            .insert(sorteioParticipacoes)
            .values({ sorteioId, userId, contatos })
            .onConflictDoUpdate({
                target: [sorteioParticipacoes.sorteioId, sorteioParticipacoes.userId],
                set: { contatos, updatedAt: new Date() },
            })
            .returning(participacaoDoAluno);
        return participacao;
    });
}

export async function sairDoSorteio(sorteioId: string, userId: string) {
    await db.transaction(async (tx) => {
        await exigirInscricoesAbertas(tx, sorteioId);
        await tx
            .delete(sorteioParticipacoes)
            .where(
                and(
                    eq(sorteioParticipacoes.sorteioId, sorteioId),
                    eq(sorteioParticipacoes.userId, userId),
                ),
            );
    });
    return { ok: true };
}

export async function listarSorteios() {
    const agora = new Date();
    const linhas = await db
        .select({
            id: sorteios.id,
            titulo: sorteios.titulo,
            inicio: sorteios.inicio,
            fim: sorteios.fim,
            sorteadoEm: sorteios.sorteadoEm,
            participantes: count(sorteioParticipacoes.id),
        })
        .from(sorteios)
        .leftJoin(sorteioParticipacoes, eq(sorteioParticipacoes.sorteioId, sorteios.id))
        .groupBy(sorteios.id)
        .orderBy(desc(sorteios.inicio));
    return linhas.map(({ participantes, ...sorteio }) => ({
        ...sorteio,
        situacao: situacaoDoSorteio(sorteio, agora),
        participantes,
    }));
}

export async function detalharSorteio(id: string) {
    const [sorteio] = await db
        .select({
            id: sorteios.id,
            titulo: sorteios.titulo,
            descricao: sorteios.descricao,
            inicio: sorteios.inicio,
            fim: sorteios.fim,
            sorteadoEm: sorteios.sorteadoEm,
        })
        .from(sorteios)
        .where(eq(sorteios.id, id));
    if (!sorteio) throw new AppError(404, "Sorteio não encontrado");

    const inscritos = await db
        .select({
            posicao: sorteioParticipacoes.posicao,
            username: users.username,
            nome: users.name,
            inscritoEm: sorteioParticipacoes.createdAt,
            contatos: sorteioParticipacoes.contatos,
        })
        .from(sorteioParticipacoes)
        .innerJoin(users, eq(users.id, sorteioParticipacoes.userId))
        .where(eq(sorteioParticipacoes.sorteioId, id))
        .orderBy(asc(sorteioParticipacoes.createdAt), asc(sorteioParticipacoes.id));

    const ganhadores = inscritos
        .flatMap(({ posicao, username, nome, contatos }) =>
            posicao === null ? [] : [{ posicao, username, nome, contatos }],
        )
        .sort((a, b) => a.posicao - b.posicao);

    return {
        ...sorteio,
        situacao: situacaoDoSorteio(sorteio, new Date()),
        ganhadores,
        participantes: inscritos.map(({ username, nome, inscritoEm, contatos }) => ({
            username,
            nome,
            inscritoEm,
            contatos,
        })),
    };
}

// Um sorteio por período. O lock da transação põe criações e edições em fila:
// sem ele, duas podiam conferir a agenda ao mesmo tempo e gravar períodos sobrepostos.
async function garantirPeriodoLivre(tx: Transacao, periodo: Periodo, ignorarId?: string) {
    if (!periodoValido(periodo)) throw new AppError(400, "O fim deve ser depois do início");
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('sorteios_periodo'))`);
    const outros = await tx
        .select({ inicio: sorteios.inicio, fim: sorteios.fim })
        .from(sorteios)
        .where(ignorarId ? ne(sorteios.id, ignorarId) : undefined);
    if (outros.some((outro) => periodosSobrepoem(outro, periodo))) {
        throw new AppError(409, "Já existe um sorteio nesse período");
    }
}

export async function criarSorteio(dados: DadosCriar) {
    const id = await db.transaction(async (tx) => {
        await garantirPeriodoLivre(tx, dados);
        const [criado] = await tx.insert(sorteios).values(dados).returning({ id: sorteios.id });
        return criado.id;
    });
    return detalharSorteio(id);
}

export async function atualizarSorteio(id: string, dados: DadosAtualizar) {
    if (Object.keys(dados).length === 0) throw new AppError(400, "Nada para atualizar");
    await db.transaction(async (tx) => {
        // O FOR UPDATE impede que um sorteio feito durante a edição seja alterado depois.
        const [atual] = await tx
            .select({ inicio: sorteios.inicio, fim: sorteios.fim, sorteadoEm: sorteios.sorteadoEm })
            .from(sorteios)
            .where(eq(sorteios.id, id))
            .for("update");
        if (!atual) throw new AppError(404, "Sorteio não encontrado");
        if (atual.sorteadoEm) throw new AppError(409, "Um sorteio já feito não pode ser editado");
        if (dados.inicio || dados.fim) {
            const periodo = { inicio: dados.inicio ?? atual.inicio, fim: dados.fim ?? atual.fim };
            await garantirPeriodoLivre(tx, periodo, id);
        }
        await tx
            .update(sorteios)
            .set({ ...dados, updatedAt: new Date() })
            .where(eq(sorteios.id, id));
    });
    return detalharSorteio(id);
}

export async function excluirSorteio(id: string) {
    await db.delete(sorteios).where(eq(sorteios.id, id));
    return { ok: true };
}

async function motivoDaRecusa(tx: Transacao, id: string) {
    const [sorteio] = await tx
        .select({ sorteadoEm: sorteios.sorteadoEm })
        .from(sorteios)
        .where(eq(sorteios.id, id));
    if (!sorteio) return new AppError(404, "Sorteio não encontrado");
    if (sorteio.sorteadoEm) return new AppError(409, "Este sorteio já foi feito");
    return new AppError(409, "O sorteio só pode ser feito depois do fim das inscrições");
}

export async function realizarSorteio(id: string) {
    await db.transaction(async (tx) => {
        // Marcar e travar no mesmo UPDATE: o segundo clique espera este terminar e
        // não encontra mais a linha, e a inscrição atrasada já lê sorteado_em.
        const [marcado] = await tx
            .update(sorteios)
            .set({ sorteadoEm: sql`now()`, updatedAt: sql`now()` })
            .where(
                and(
                    eq(sorteios.id, id),
                    isNull(sorteios.sorteadoEm),
                    lte(sorteios.fim, sql`now()`),
                ),
            )
            .returning({ id: sorteios.id });
        if (!marcado) throw await motivoDaRecusa(tx, id);

        const inscritos = await tx
            .select({ id: sorteioParticipacoes.id })
            .from(sorteioParticipacoes)
            .where(eq(sorteioParticipacoes.sorteioId, id))
            .orderBy(asc(sorteioParticipacoes.createdAt), asc(sorteioParticipacoes.id));
        if (inscritos.length === 0) throw new AppError(409, "Ninguém se inscreveu neste sorteio");

        const ganhadores = sortear(
            inscritos.map((inscrito) => inscrito.id),
            GANHADORES,
            (limite) => randomInt(limite),
        );
        for (const [indice, participacaoId] of ganhadores.entries()) {
            await tx
                .update(sorteioParticipacoes)
                .set({ posicao: indice + 1, updatedAt: sql`now()` })
                .where(eq(sorteioParticipacoes.id, participacaoId));
        }
        // Minimização (LGPD): quem não ganhou segue como inscrito, mas sem contato.
        await tx
            .update(sorteioParticipacoes)
            .set({ contatos: null, updatedAt: sql`now()` })
            .where(
                and(eq(sorteioParticipacoes.sorteioId, id), isNull(sorteioParticipacoes.posicao)),
            );
    });
    return detalharSorteio(id);
}
