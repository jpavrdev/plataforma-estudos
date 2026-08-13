// Semeia os tópicos e as perguntas de entrevista que têm arquivo em
// scripts/data/entrevista.
//
// A régua, conferida aqui antes de gravar qualquer coisa, e ela é DIFERENTE da
// régua dos cartões de trilha:
//
// 1. A frente é a pergunta como ela cai na entrevista, na fala de quem entrevista.
//    "Como você explicaria X para alguém que só conhece Y?" e não "o que é X?".
// 2. O verso é esqueleto de resposta, de três a quatro pontos, no máximo 400
//    caracteres. Não é resposta pronta para decorar: é o que a pessoa precisa
//    lembrar de dizer.
// 3. O nível é definido pelo que a pergunta COBRA, não pelo assunto. "O que é um
//    container?" é estágio; "como você depuraria um container que morre no boot em
//    produção?" é pleno.
// 4. Sem travessão e sem emoji, como no resto da casa.
//
// Quantas perguntas por nível é decisão de cada tópico, não cota.
//
// Idempotente: tópico já criado é reaproveitado, e pergunta já gravada para o
// tópico é pulada pela frente.
//
// Rodar tudo:          node scripts/seed-entrevista.ts
// Rodar um tópico só:  node scripts/seed-entrevista.ts go
import { db } from "../db.ts";
import { interviewCards, interviewTopics } from "../schema.ts";
import { eq } from "drizzle-orm";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TOPICOS } from "./data/entrevista/index.ts";

export type Nivel = "estagio" | "junior" | "pleno" | "senior";

export interface PerguntaDeEntrevista {
    frente: string;
    verso: string;
}

export interface TopicoDeEntrevista {
    slug: string;
    nome: string;
    position: number;
    perguntas: Partial<Record<Nivel, PerguntaDeEntrevista[]>>;
}

const NIVEIS: Nivel[] = ["estagio", "junior", "pleno", "senior"];
const VERSO_MAX = 400;

const PROIBIDOS = [
    /—/,
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
    // Vício de prova, que não existe em conversa de entrevista.
    /assinale/i,
    /alternativa/i,
];

function conferir(topico: TopicoDeEntrevista): string[] {
    const erros: string[] = [];
    const vistos = new Set<string>();

    for (const nivel of NIVEIS) {
        for (const p of topico.perguntas[nivel] ?? []) {
            const onde = `${topico.nome} [${nivel}]`;
            if (!p.frente.trim().endsWith("?"))
                erros.push(`${onde}: frente não é pergunta: "${p.frente.slice(0, 60)}"`);
            if (p.verso.length > VERSO_MAX)
                erros.push(
                    `${onde}: verso com ${p.verso.length} caracteres (máx ${VERSO_MAX}): "${p.frente.slice(0, 50)}"`,
                );
            // A frente repetida é conferida no tópico inteiro, e não só no nível:
            // a mesma pergunta em dois níveis cairia duas vezes na sessão de quem
            // escolhe o nível maior, porque o corte é cumulativo.
            const chave = p.frente.toLowerCase().trim();
            if (vistos.has(chave)) erros.push(`${onde}: frente repetida: "${p.frente}"`);
            vistos.add(chave);
            for (const proibido of PROIBIDOS)
                if (proibido.test(p.frente) || proibido.test(p.verso))
                    erros.push(`${onde}: casa com ${proibido}: "${p.frente.slice(0, 50)}"`);
        }
    }
    return erros;
}

/**
 * Arquivo de dados que existe mas não entrou no índice não é semeado, e o seeder
 * termina dizendo que deu tudo certo. Mesma armadilha que já custou uma rodada nos
 * cartões de trilha, então a trava nasce junto aqui.
 */
function conferirRegistro() {
    const pasta = join(dirname(fileURLToPath(import.meta.url)), "data", "entrevista");
    const arquivos = readdirSync(pasta).filter((f) => f.endsWith(".ts") && f !== "index.ts");
    if (arquivos.length !== TOPICOS.length) {
        console.error(
            `Há ${arquivos.length} arquivos em data/entrevista, mas ${TOPICOS.length} no índice. Algum tópico não foi registrado em index.ts.`,
        );
        process.exit(1);
    }
}

async function semearTopico(dados: TopicoDeEntrevista) {
    let [topico] = await db
        .select()
        .from(interviewTopics)
        .where(eq(interviewTopics.slug, dados.slug));
    if (!topico) {
        [topico] = await db
            .insert(interviewTopics)
            .values({ slug: dados.slug, nome: dados.nome, position: dados.position })
            .returning();
    }

    const existentes = new Set(
        (
            await db
                .select({ frente: interviewCards.frente })
                .from(interviewCards)
                .where(eq(interviewCards.topicoId, topico.id))
        ).map((c) => c.frente),
    );

    let criados = 0;
    let pulados = 0;
    for (const nivel of NIVEIS) {
        const perguntas = dados.perguntas[nivel] ?? [];
        for (const [i, p] of perguntas.entries()) {
            if (existentes.has(p.frente)) {
                pulados++;
                continue;
            }
            await db.insert(interviewCards).values({
                topicoId: topico.id,
                nivel,
                frente: p.frente,
                verso: p.verso,
                position: i + 1,
            });
            existentes.add(p.frente);
            criados++;
        }
    }
    return { criados, pulados };
}

async function semear() {
    conferirRegistro();
    const alvo = process.argv[2];
    const escolhidos = alvo ? TOPICOS.filter((t) => t.slug === alvo) : TOPICOS;
    if (!escolhidos.length) {
        console.error(`Nenhum tópico de entrevista com slug "${alvo}".`);
        console.error(`Disponíveis: ${TOPICOS.map((t) => t.slug).join(", ")}`);
        process.exit(1);
    }

    // O QC roda sobre todos os escolhidos antes de gravar qualquer um: reprovar no
    // meio deixaria metade semeada.
    const erros = escolhidos.flatMap(conferir);
    if (erros.length) {
        console.error(`QC reprovou ${erros.length} pergunta(s). Nada foi gravado:`);
        for (const e of erros) console.error(`  ${e}`);
        process.exit(1);
    }

    let totalCriados = 0;
    let totalPulados = 0;
    for (const dados of escolhidos) {
        const { criados, pulados } = await semearTopico(dados);
        console.log(`${dados.nome}: ${criados} criada(s), ${pulados} ja existia(m).`);
        totalCriados += criados;
        totalPulados += pulados;
    }
    console.log(`Total: ${totalCriados} criada(s), ${totalPulados} ja existia(m).`);
}

semear()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao semear as perguntas de entrevista:", e);
        process.exit(1);
    });
