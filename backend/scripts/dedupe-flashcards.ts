// Remove do baralho dos alunos a carta gêmea: a mesma pergunta aberta duas vezes na
// mesma trilha.
//
// Como aconteceu: trilha com dois trilhos de linguagem tem a mesma aula duas vezes,
// uma por linguagem. O cartão conceitual vale para os dois e foi semeado nas duas
// aulas, virando duas linhas de flashcards com a MESMA pergunta. Quem estudou os
// dois trilhos concluiu as duas aulas e abriu as duas cartas, e via a pergunta
// repetida na revisão.
//
// O código já não cria mais essas gêmeas (ver abrirCartoesDaAula). Este script é só
// a limpeza do que ficou para trás.
//
// Qual das duas fica: a mais estudada, contando repetições e lapsos. Entre duas com
// a mesma bagagem fica a de menor estabilidade, que volta mais cedo para a fila:
// entre esconder uma carta que o aluno talvez não saiba e mostrá-la de novo, mostrar
// é o erro barato.
//
// O histórico em card_reviews NÃO é tocado. O aluno respondeu aquelas cartas de
// verdade, e apagar as respostas reescreveria as estatísticas e o histórico de
// sessões dele.
//
// Idempotente: rodar de novo não acha mais nada.
//
// Conferir sem gravar:  node scripts/dedupe-flashcards.ts
// Aplicar de verdade:   node scripts/dedupe-flashcards.ts --aplicar
import { db } from "../db.ts";
import { sql } from "drizzle-orm";

// A gêmea é a segunda em diante dentro do grupo (aluno, trilha, pergunta).
const GEMEAS = sql`
    select uc.id
    from (
        select uc.id,
               row_number() over (
                   partition by uc.user_id, l.trail_id, f.frente
                   order by (uc.repeticoes + uc.lapsos) desc, uc.estabilidade asc, uc.id asc
               ) as posicao
        from user_cards uc
        join flashcards f on f.id = uc.origem_id and uc.origem = 'flashcard'
        join lessons l on l.id = f.lesson_id
    ) uc
    where uc.posicao > 1
`;

async function conferir() {
    const { rows } = await db.execute<{
        trilha: string;
        alunos: string;
        gemeas: string;
    }>(sql`
        select t.name as trilha,
               count(distinct uc.user_id)::text as alunos,
               count(*)::text as gemeas
        from user_cards uc
        join flashcards f on f.id = uc.origem_id and uc.origem = 'flashcard'
        join lessons l on l.id = f.lesson_id
        join trails t on t.id = l.trail_id
        where uc.id in (${GEMEAS})
        group by t.name
        order by count(*) desc
    `);
    return rows;
}

async function limpar() {
    const linhas = await conferir();
    if (!linhas.length) {
        console.log("Nenhuma carta gêmea no baralho de ninguém. Nada a fazer.");
        return;
    }

    let total = 0;
    for (const l of linhas) {
        console.log(`${l.trilha}: ${l.gemeas} gêmea(s) em ${l.alunos} aluno(s).`);
        total += Number(l.gemeas);
    }
    console.log(`Total: ${total} carta(s) a remover do baralho.`);

    if (!process.argv.includes("--aplicar")) {
        console.log("\nSimulação. Rode com --aplicar para gravar.");
        return;
    }

    const apagadas = await db.execute(sql`delete from user_cards where id in (${GEMEAS})`);
    console.log(`\nRemovidas ${apagadas.rowCount ?? total} carta(s) do baralho.`);
}

limpar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao remover as cartas gemeas:", e);
        process.exit(1);
    });
