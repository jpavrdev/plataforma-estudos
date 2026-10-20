// Aplica correções pontuais em trilhas já semeadas: enunciado, alternativa,
// trecho de bloco de aula, título de aula e título de módulo.
//
// O seed de trilha não mexe em conteúdo que já existe, e recriar a trilha
// apagaria as respostas dos alunos. Aqui o texto é trocado no lugar: questão e
// aula casam pela posição ("modulo.aula.questao"), alternativa e trecho de bloco
// casam pelo texto antigo, então ids e respostas ficam. O que já está com o texto
// novo é pulado. Texto que não bate nem com o antigo nem com o novo interrompe
// tudo antes de gravar, para não sobrescrever uma edição que ninguém previu.
//
// As correções ficam em scripts/correcoes/<trilha>.json; o seed da trilha já traz
// as mesmas mudanças, para uma base nova nascer certa.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/aplicar-correcoes-conteudo.ts
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { and, eq } from "drizzle-orm";

type Correcao =
    | { tipo: "enunciado" | "alternativa"; chave: string; de: string; para: string }
    | { tipo: "bloco" | "titulo-aula"; aula: string; de: string; para: string }
    | { tipo: "titulo-modulo"; modulo: number; de: string; para: string };
type Arquivo = { trilha: string; correcoes: Correcao[] };

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Mudanca = (tx: Tx) => Promise<unknown>;

const PASTA = path.join(import.meta.dirname, "correcoes");

async function moduloDe(trailId: string, posicao: number) {
    const [m] = await db
        .select()
        .from(modules)
        .where(and(eq(modules.trailId, trailId), eq(modules.position, posicao)));
    if (!m) throw new Error(`módulo ${posicao} não existe`);
    return m;
}

async function aulaDe(trailId: string, ref: string) {
    const [mp, ap] = ref.split(".").map(Number);
    const mod = await moduloDe(trailId, mp);
    const [a] = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.moduleId, mod.id), eq(lessons.position, ap)));
    if (!a) throw new Error(`aula ${ref} não existe`);
    return a;
}

async function questaoDe(trailId: string, chave: string) {
    const [mp, ap, qp] = chave.split(".").map(Number);
    const aula = await aulaDe(trailId, `${mp}.${ap}`);
    const [q] = await db
        .select()
        .from(questions)
        .where(and(eq(questions.lessonId, aula.id), eq(questions.position, qp)));
    if (!q) throw new Error(`questão ${chave} não existe`);
    return q;
}

function ocorrencias(texto: string, trecho: string) {
    return texto.split(trecho).length - 1;
}

// Devolve a mudança a gravar, null se já está aplicada, ou lança se o texto atual
// não é nem o antigo nem o novo.
async function planejar(trailId: string, c: Correcao): Promise<Mudanca | null> {
    switch (c.tipo) {
        case "enunciado": {
            const q = await questaoDe(trailId, c.chave);
            if (q.statement === c.para) return null;
            if (q.statement !== c.de)
                throw new Error(`enunciado ${c.chave} não bate com o texto antigo`);
            return (tx) =>
                tx.update(questions).set({ statement: c.para }).where(eq(questions.id, q.id));
        }
        case "alternativa": {
            const q = await questaoDe(trailId, c.chave);
            const ops = await db
                .select()
                .from(questionOptions)
                .where(eq(questionOptions.questionId, q.id));
            if (ops.some((o) => o.text === c.para)) return null;
            const alvo = ops.filter((o) => o.text === c.de);
            if (alvo.length !== 1)
                throw new Error(`alternativa de ${c.chave} não bate com o texto antigo`);
            return (tx) =>
                tx
                    .update(questionOptions)
                    .set({ text: c.para })
                    .where(eq(questionOptions.id, alvo[0].id));
        }
        case "bloco": {
            const a = await aulaDe(trailId, c.aula);
            const blocos = a.contentBlocks ?? [];
            if (blocos.some((b) => b.value.includes(c.para))) return null;
            const total = blocos.reduce((s, b) => s + ocorrencias(b.value, c.de), 0);
            if (total !== 1)
                throw new Error(`trecho da aula ${c.aula} aparece ${total} vezes, esperado 1`);
            // Função no replace: o texto novo pode ter "$", que no replace com string vira padrão especial.
            const novos = blocos.map((b) =>
                b.value.includes(c.de) ? { ...b, value: b.value.replace(c.de, () => c.para) } : b,
            );
            return (tx) =>
                tx.update(lessons).set({ contentBlocks: novos }).where(eq(lessons.id, a.id));
        }
        case "titulo-aula": {
            const a = await aulaDe(trailId, c.aula);
            if (a.title === c.para) return null;
            if (a.title !== c.de)
                throw new Error(`título da aula ${c.aula} não bate com o texto antigo`);
            return (tx) => tx.update(lessons).set({ title: c.para }).where(eq(lessons.id, a.id));
        }
        case "titulo-modulo": {
            const m = await moduloDe(trailId, c.modulo);
            if (m.title === c.para) return null;
            if (m.title !== c.de)
                throw new Error(`título do módulo ${c.modulo} não bate com o texto antigo`);
            return (tx) => tx.update(modules).set({ title: c.para }).where(eq(modules.id, m.id));
        }
    }
}

async function aplicar() {
    const arquivos = readdirSync(PASTA)
        .filter((f) => f.endsWith(".json"))
        .sort();
    for (const nome of arquivos) {
        const { trilha, correcoes }: Arquivo = JSON.parse(
            readFileSync(path.join(PASTA, nome), "utf8"),
        );
        const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.name, trilha));
        if (!t) {
            console.log(`${trilha}: trilha ainda não existe, nada a corrigir.`);
            continue;
        }
        // Planeja tudo antes de gravar: uma divergência não deixa a trilha pela metade.
        const mudancas: Mudanca[] = [];
        for (const c of correcoes) {
            const ref = "chave" in c ? c.chave : "aula" in c ? c.aula : `módulo ${c.modulo}`;
            try {
                const m = await planejar(t.id, c);
                if (m) mudancas.push(m);
            } catch (e) {
                throw new Error(`${trilha}, ${c.tipo} ${ref}: ${(e as Error).message}`);
            }
        }
        await db.transaction(async (tx) => {
            for (const m of mudancas) await m(tx);
        });
        console.log(
            `${trilha}: ${mudancas.length} correções aplicadas, ${correcoes.length - mudancas.length} já estavam.`,
        );
    }
}

aplicar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha nas correções:", e);
        process.exit(1);
    });
