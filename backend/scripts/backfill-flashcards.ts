// Abre no baralho os cartões das aulas que o aluno já concluiu ANTES de a feature
// existir.
//
// Por que é preciso: o cartão nasce no momento em que a aula é concluída, então quem
// estudou antes do deploy (ou entre o deploy e o seed dos cartões) ficou com a fila
// vazia, mesmo tendo concluído aulas que hoje têm cartão.
//
// Por que escalonado: são milhares de cartões, e abrir todos vencendo hoje colocaria
// mais de cem cartas na cara de dezenas de alunos de uma vez. Isso é abandono
// garantido, e o risco está registrado desde o desenho da feature. Aqui as datas se
// espalham pelos próximos dias, na ordem em que as aulas foram estudadas: o aluno
// recebe um punhado por dia até o baralho dele estar todo aberto.
//
// O primeiro contato com o cartão não é afetado pela data: cartão novo tem
// estabilidade zero e o agendador usa a estabilidade inicial da resposta, sem bônus
// de atraso. Espalhar as datas não distorce o modelo.
//
// Só cartões de aula. Termo de glossário continua abrindo naturalmente quando o
// aluno concluir a próxima aula, e não vale o risco de rodar o casamento de texto
// num backfill.
//
// Idempotente: cartão que já está no baralho do aluno é ignorado.
//
// Conferir sem gravar:  node scripts/backfill-flashcards.ts
// Aplicar de verdade:   node scripts/backfill-flashcards.ts --aplicar
import { db } from "../db.ts";
import { flashcards, lessonProgress, lessons, modules, userCards } from "../schema.ts";
import { and, asc, eq, sql } from "drizzle-orm";

// Teto de dias por onde as cartas de um aluno são espalhadas.
const DIAS_MAXIMOS = 14;
// Alvo de cartas por dia. Baralho pequeno não precisa de duas semanas de espera.
const POR_DIA = 10;

interface Pendente {
    userId: string;
    cardId: string;
}

async function pendentes(): Promise<Pendente[]> {
    // Cartão de aula concluída que ainda não está no baralho do aluno, na ordem em
    // que ele estudou: módulo, aula e posição do cartão.
    const linhas = await db
        .select({ userId: lessonProgress.userId, cardId: flashcards.id })
        .from(lessonProgress)
        .innerJoin(flashcards, eq(flashcards.lessonId, lessonProgress.lessonId))
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(modules, eq(modules.id, lessons.moduleId))
        .where(
            and(
                eq(lessons.published, true),
                sql`not exists (
                    select 1 from ${userCards} uc
                    where uc.user_id = ${lessonProgress.userId}
                      and uc.origem = 'flashcard'
                      and uc.origem_id = ${flashcards.id}
                )`,
            ),
        )
        .orderBy(
            asc(lessonProgress.userId),
            asc(modules.position),
            asc(lessons.position),
            asc(flashcards.position),
        );
    return linhas;
}

/** Espalha as cartas de um aluno pelos próximos dias, mantendo a ordem de estudo. */
function agendar(total: number, indice: number): Date {
    const dias = Math.min(DIAS_MAXIMOS, Math.max(1, Math.ceil(total / POR_DIA)));
    const dia = Math.floor((indice * dias) / total);
    const quando = new Date();
    quando.setDate(quando.getDate() + dia);
    // Dia zero vence agora, para o aluno já encontrar alguma coisa na primeira visita.
    if (dia > 0) quando.setHours(6, 0, 0, 0);
    return quando;
}

async function backfill() {
    const aplicar = process.argv.includes("--aplicar");

    const todos = await pendentes();
    if (!todos.length) {
        console.log("Nada pendente: todo cartão de aula concluída já está em algum baralho.");
        return;
    }

    const porAluno = new Map<string, string[]>();
    for (const p of todos) {
        const lista = porAluno.get(p.userId) ?? [];
        lista.push(p.cardId);
        porAluno.set(p.userId, lista);
    }

    const tamanhos = [...porAluno.values()].map((l) => l.length).sort((a, b) => a - b);
    const maior = tamanhos[tamanhos.length - 1];
    const mediana = tamanhos[Math.floor(tamanhos.length / 2)];
    const noPrimeiroDia = [...porAluno.values()].reduce((soma, lista) => {
        const dias = Math.min(DIAS_MAXIMOS, Math.max(1, Math.ceil(lista.length / POR_DIA)));
        return soma + lista.filter((_, i) => Math.floor((i * dias) / lista.length) === 0).length;
    }, 0);

    console.log(`Alunos alcançados:        ${porAluno.size}`);
    console.log(`Cartões a abrir:          ${todos.length}`);
    console.log(`Baralho mediano:          ${mediana} cartões`);
    console.log(`Maior baralho:            ${maior} cartões`);
    console.log(
        `Vencendo hoje:            ${noPrimeiroDia} (${Math.round((noPrimeiroDia / todos.length) * 100)}% do total)`,
    );
    console.log(
        `Maior fila de hoje:       ${Math.max(
            ...[...porAluno.values()].map((lista) => {
                const dias = Math.min(DIAS_MAXIMOS, Math.max(1, Math.ceil(lista.length / POR_DIA)));
                return lista.filter((_, i) => Math.floor((i * dias) / lista.length) === 0).length;
            }),
        )} cartões para um aluno só`,
    );

    if (!aplicar) {
        console.log("\nNada foi gravado. Rode com --aplicar para valer.");
        return;
    }

    let gravados = 0;
    for (const [userId, cards] of porAluno) {
        const valores = cards.map((cardId, i) => ({
            userId,
            origem: "flashcard" as const,
            origemId: cardId,
            proximaRevisao: agendar(cards.length, i),
        }));
        // Em lotes: um insert único com dezenas de milhares de linhas trava a conexão.
        for (let i = 0; i < valores.length; i += 500) {
            await db
                .insert(userCards)
                .values(valores.slice(i, i + 500))
                .onConflictDoNothing();
        }
        gravados += valores.length;
    }
    console.log(`\n${gravados} cartões abertos para ${porAluno.size} alunos.`);
}

backfill()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no backfill:", e);
        process.exit(1);
    });
