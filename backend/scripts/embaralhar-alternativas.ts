// Embaralha a ordem gravada das alternativas, nas questões de trilha e nas de
// simulado.
//
// O conteúdo é autorado com a alternativa correta na frente, então a coluna
// position guardava a resposta: nas trilhas, 7 de cada 8 questões tinham a
// correta em position 1. A aula e a prova embaralham na hora de servir, e por
// isso ninguém via o problema, mas o e-book da trilha é gerado do que está
// gravado e saía com o gabarito quase todo em A.
//
// O embaralhamento é determinístico: a semente é o id da questão e a ordem de
// entrada é canônica (id da alternativa), então rodar de novo devolve
// exatamente a mesma ordem, e dev e produção ficam iguais.
//
// Rodar em dev:  node --env-file=.env scripts/embaralhar-alternativas.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node --env-file=.env.prod scripts/embaralhar-alternativas.ts
import { asc, sql } from "drizzle-orm";
import { db } from "../db.ts";
import { questionOptions, simuladoOptions } from "../schema.ts";
import { embaralharComSemente } from "../src/domain/embaralhar.ts";

type Linha = { id: string; questionId: string; position: number; isCorrect: boolean };

function novasPosicoes(linhas: Linha[]): Map<string, number> {
    const porQuestao = new Map<string, Linha[]>();
    for (const l of linhas) {
        const arr = porQuestao.get(l.questionId) ?? [];
        arr.push(l);
        porQuestao.set(l.questionId, arr);
    }

    const destino = new Map<string, number>();
    for (const [questionId, opcoes] of porQuestao) {
        // Ordem de entrada canônica, para o resultado não depender da position
        // que já está gravada e o script poder rodar quantas vezes quiser.
        const canonica = [...opcoes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        embaralharComSemente(canonica, questionId).forEach((o, i) => {
            destino.set(o.id, i + 1);
        });
    }
    return destino;
}

function distribuicao(linhas: Linha[], pos: (id: string) => number): string {
    const conta = new Map<number, number>();
    for (const l of linhas.filter((x) => x.isCorrect)) {
        const p = pos(l.id);
        conta.set(p, (conta.get(p) ?? 0) + 1);
    }
    return [...conta.entries()]
        .sort(([a], [b]) => a - b)
        .map(([p, n]) => `${p}: ${n}`)
        .join(" | ");
}

async function embaralharTabela(
    nome: string,
    tabela: typeof questionOptions | typeof simuladoOptions,
) {
    const linhas: Linha[] = await db
        .select({
            id: tabela.id,
            questionId: tabela.questionId,
            position: tabela.position,
            isCorrect: tabela.isCorrect,
        })
        .from(tabela)
        .orderBy(asc(tabela.id));

    if (linhas.length === 0) {
        console.log(`${nome}: nenhuma alternativa.`);
        return;
    }

    const destino = novasPosicoes(linhas);
    const antes = new Map(linhas.map((l) => [l.id, l.position]));
    console.log(
        `${nome}: correta por position antes  ${distribuicao(linhas, (id) => antes.get(id)!)}`,
    );

    const mudar = linhas.filter((l) => destino.get(l.id) !== l.position);
    if (mudar.length === 0) {
        console.log(`${nome}: já está embaralhado, nada a fazer (${linhas.length} alternativas).`);
        return;
    }

    // Um UPDATE para a tabela toda, com as novas posições vindo de dois arrays.
    // Não há índice único em (question_id, position), então não existe conflito
    // de posição repetida no meio do caminho.
    //
    // Os arrays vão como literal do Postgres em um parâmetro cada, e não como
    // array de JavaScript, porque o drizzle expande array em lista de
    // parâmetros e estouraria o limite com milhares de alternativas.
    const literal = (valores: (string | number)[]) => `{${valores.join(",")}}`;
    await db.execute(sql`
        update ${tabela} as o
        set position = v.pos
        from unnest(
            ${literal(mudar.map((l) => l.id))}::uuid[],
            ${literal(mudar.map((l) => destino.get(l.id)!))}::int[]
        ) as v(id, pos)
        where o.id = v.id
    `);

    console.log(
        `${nome}: correta por position depois ${distribuicao(linhas, (id) => destino.get(id)!)}`,
    );
    console.log(`${nome}: ${mudar.length} de ${linhas.length} alternativas mudaram de lugar.`);
}

async function embaralhar() {
    await embaralharTabela("trilhas", questionOptions);
    await embaralharTabela("simulados", simuladoOptions);
}

embaralhar()
    .then(() => process.exit(0))
    .catch((erro) => {
        console.error("Falha ao embaralhar as alternativas:", erro);
        process.exit(1);
    });
