// Converte a trilha "Lógica de Programação" para multi-linguagem, de forma ADITIVA:
//  1. marca as aulas existentes (conteúdo em JavaScript) com language = "javascript";
//  2. insere as aulas irmãs em Python na mesma posição de cada aula JS.
// Idempotente: só marca aulas ainda sem language e só insere uma aula Python se ela
// ainda não existir naquele módulo/posição. O conteúdo Python vem de scripts/data/logica-py/moduloN.json,
// permitindo rodar incrementalmente conforme cada módulo é autorado.
//
// Rodar: docker compose exec -T backend node scripts/seed-logica-multilinguagem.ts
import { readFileSync, existsSync } from "node:fs";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { and, eq, isNull } from "drizzle-orm";

const NOME = "Lógica de Programação";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };

// Embaralha a ordem das opções gravadas para a correta não ficar sempre na 1ª posição
// (o backend também embaralha por requisição, isto é só higiene do dado semeado).
function embaralhar<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function carregarModuloPy(n: number): Aula[] | null {
    const url = new URL(`./data/logica-py/modulo${n}.json`, import.meta.url);
    if (!existsSync(url)) return null;
    const parsed = JSON.parse(readFileSync(url, "utf8"));
    return Array.isArray(parsed) ? parsed : parsed.aulas;
}

async function inserirAula(
    trailId: string,
    moduleId: string,
    position: number,
    a: Aula,
) {
    const [lesson] = await db
        .insert(lessons)
        .values({
            trailId,
            moduleId,
            title: a.titulo,
            content: null,
            contentBlocks: a.blocks,
            position,
            language: "python",
            published: true,
        })
        .returning();
    for (let qi = 0; qi < a.questions.length; qi++) {
        const q = a.questions[qi];
        const [questao] = await db
            .insert(questions)
            .values({
                lessonId: lesson.id,
                statement: q.statement,
                difficulty: q.difficulty,
                position: qi + 1,
            })
            .returning();
        await db.insert(questionOptions).values(
            embaralhar(q.options).map((o, k) => ({
                questionId: questao.id,
                text: o.text,
                isCorrect: o.isCorrect,
                position: k + 1,
            })),
        );
    }
    return a.questions.length;
}

async function seed() {
    const [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        console.error(`Trilha "${NOME}" não encontrada. Rode primeiro o seed da trilha.`);
        process.exit(1);
    }

    // 1. Marca as aulas atuais (JavaScript) que ainda não têm linguagem.
    const marcadas = await db
        .update(lessons)
        .set({ language: "javascript" })
        .where(and(eq(lessons.trailId, trilha.id), isNull(lessons.language)))
        .returning({ id: lessons.id });
    console.log(`Aulas marcadas como javascript: ${marcadas.length}`);

    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trilha.id))
        .orderBy(modules.position);

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < mods.length; mi++) {
        const mod = mods[mi];
        const pyAulas = carregarModuloPy(mi + 1);
        if (!pyAulas) {
            console.log(`Módulo ${mi + 1} (${mod.title}): sem arquivo Python ainda, pulando.`);
            continue;
        }

        const aulasDoMod = await db
            .select()
            .from(lessons)
            .where(eq(lessons.moduleId, mod.id))
            .orderBy(lessons.position);
        const js = aulasDoMod.filter((l) => l.language !== "python");
        const jaPy = new Set(
            aulasDoMod.filter((l) => l.language === "python").map((l) => l.position),
        );

        for (let li = 0; li < pyAulas.length; li++) {
            const irmaJs = js[li];
            if (!irmaJs) {
                console.warn(
                    `  Módulo ${mi + 1}: aula Python ${li + 1} sem irmã JS correspondente, pulando.`,
                );
                continue;
            }
            if (jaPy.has(irmaJs.position)) continue; // idempotente
            const nq = await inserirAula(trilha.id, mod.id, irmaJs.position, pyAulas[li]);
            totalAulas++;
            totalQuestoes += nq;
        }
        console.log(`Módulo ${mi + 1} (${mod.title}): Python processado.`);
    }

    console.log(`\nConcluído: ${totalAulas} aulas Python inseridas, ${totalQuestoes} questões.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
