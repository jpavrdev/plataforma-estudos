// Aplica correções pontuais em trilhas já semeadas: enunciado, alternativa,
// trecho de bloco de aula, título de aula e título de módulo.
//
// O seed de trilha não mexe em conteúdo que já existe, e recriar a trilha
// apagaria as respostas dos alunos. Aqui o texto é trocado no lugar: questão e
// aula casam pela posição ("modulo.aula.questao"), alternativa e trecho de bloco
// casam pelo texto antigo, então ids e respostas ficam.
//
// As correções de um mesmo alvo (a mesma aula, as alternativas da mesma questão)
// são aplicadas em sequência, na ordem do arquivo, e o resultado é conferido com o
// estado final esperado: `finais` guarda o hash dos blocos de cada aula e das
// alternativas de cada questão depois das correções. Alvo que já está no estado
// final é pulado; alvo em qualquer outro estado interrompe tudo antes de gravar,
// para não sobrescrever uma edição que ninguém previu.
//
// As correções ficam em scripts/correcoes/<trilha>.json; o seed da trilha já traz
// as mesmas mudanças, para uma base nova nascer certa.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/aplicar-correcoes-conteudo.ts
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { and, eq } from "drizzle-orm";

type Correcao =
    | { tipo: "enunciado" | "alternativa"; chave: string; de: string; para: string }
    | { tipo: "bloco" | "titulo-aula"; aula: string; de: string; para: string }
    | { tipo: "titulo-modulo"; modulo: number; de: string; para: string };
type Arquivo = {
    trilha: string;
    correcoes: Correcao[];
    finais?: { aulas: Record<string, string>; alternativas: Record<string, string> };
};
type Bloco = { type: string; value: string };

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Mudanca = (tx: Tx) => Promise<unknown>;

const PASTA = path.join(import.meta.dirname, "correcoes");

const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
// jsonb não guarda a ordem das chaves, então o hash usa [type, value].
const hashBlocos = (blocos: Bloco[]) => hash(blocos.map((b) => [b.type, b.value]));
// A posição das alternativas é embaralhada por base, então o hash usa o conjunto.
const hashAlternativas = (ops: { text: string; isCorrect: boolean }[]) =>
    hash(ops.map((o) => [o.text, o.isCorrect]).sort());

function ocorrencias(texto: string, trecho: string) {
    return texto.split(trecho).length - 1;
}

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

// Aplica em sequência uma cadeia de trocas de texto inteiro (enunciado, títulos).
// Devolve null se o texto atual já é o final.
function cadeiaDeTexto(atual: string, cadeia: Correcao[], rotulo: string) {
    const final = cadeia[cadeia.length - 1].para;
    if (atual === final) return null;
    let texto = atual;
    for (const c of cadeia) {
        if (texto !== c.de) throw new Error(`${rotulo} não bate com o texto antigo`);
        texto = c.para;
    }
    return texto;
}

function agrupar(correcoes: Correcao[]) {
    const grupos = new Map<string, Correcao[]>();
    for (const c of correcoes) {
        const alvo =
            c.tipo === "titulo-modulo"
                ? `titulo-modulo|${c.modulo}`
                : `${c.tipo}|${"chave" in c ? c.chave : c.aula}`;
        grupos.set(alvo, [...(grupos.get(alvo) ?? []), c]);
    }
    return grupos;
}

// Devolve as gravações do grupo, ou null se ele já está no estado final.
async function planejar(
    trailId: string,
    alvo: string,
    cadeia: Correcao[],
    finais: NonNullable<Arquivo["finais"]>,
): Promise<Mudanca[] | null> {
    const [tipo, ref] = alvo.split("|");
    if (tipo === "enunciado") {
        const q = await questaoDe(trailId, ref);
        const novo = cadeiaDeTexto(q.statement, cadeia, `enunciado ${ref}`);
        if (novo === null) return null;
        return [
            (tx) => tx.update(questions).set({ statement: novo }).where(eq(questions.id, q.id)),
        ];
    }
    if (tipo === "titulo-aula") {
        const a = await aulaDe(trailId, ref);
        const novo = cadeiaDeTexto(a.title, cadeia, `título da aula ${ref}`);
        if (novo === null) return null;
        return [(tx) => tx.update(lessons).set({ title: novo }).where(eq(lessons.id, a.id))];
    }
    if (tipo === "titulo-modulo") {
        const m = await moduloDe(trailId, Number(ref));
        const novo = cadeiaDeTexto(m.title, cadeia, `título do módulo ${ref}`);
        if (novo === null) return null;
        return [(tx) => tx.update(modules).set({ title: novo }).where(eq(modules.id, m.id))];
    }
    if (tipo === "bloco") {
        const esperado = finais.aulas[ref];
        if (!esperado) throw new Error(`falta o estado final da aula ${ref}`);
        const a = await aulaDe(trailId, ref);
        const blocos: Bloco[] = (a.contentBlocks ?? []).map((b) => ({ ...b }));
        if (hashBlocos(blocos) === esperado) return null;
        for (const c of cadeia) {
            const total = blocos.reduce((s, b) => s + ocorrencias(b.value, c.de), 0);
            if (total !== 1)
                throw new Error(`trecho da aula ${ref} aparece ${total} vezes, esperado 1`);
            const b = blocos.find((x) => x.value.includes(c.de))!;
            // Função no replace: o texto novo pode ter "$", que no replace com string vira padrão especial.
            b.value = b.value.replace(c.de, () => c.para);
        }
        if (hashBlocos(blocos) !== esperado)
            throw new Error(`aula ${ref} não chegou ao estado final esperado`);
        return [
            (tx) => tx.update(lessons).set({ contentBlocks: blocos }).where(eq(lessons.id, a.id)),
        ];
    }
    // alternativa
    const esperado = finais.alternativas[ref];
    if (!esperado) throw new Error(`falta o estado final das alternativas de ${ref}`);
    const q = await questaoDe(trailId, ref);
    const ops = await db.select().from(questionOptions).where(eq(questionOptions.questionId, q.id));
    if (hashAlternativas(ops) === esperado) return null;
    const textos = new Map(ops.map((o) => [o.id, o.text]));
    for (const c of cadeia) {
        const alvos = [...textos].filter(([, t]) => t === c.de);
        if (alvos.length !== 1)
            throw new Error(`alternativa de ${ref} não bate com o texto antigo`);
        textos.set(alvos[0][0], c.para);
    }
    const final = ops.map((o) => ({ text: textos.get(o.id)!, isCorrect: o.isCorrect }));
    if (hashAlternativas(final) !== esperado)
        throw new Error(`alternativas de ${ref} não chegaram ao estado final`);
    return ops
        .filter((o) => textos.get(o.id) !== o.text)
        .map(
            (o) => (tx: Tx) =>
                tx
                    .update(questionOptions)
                    .set({ text: textos.get(o.id)! })
                    .where(eq(questionOptions.id, o.id)),
        );
}

async function aplicar() {
    const arquivos = readdirSync(PASTA)
        .filter((f) => f.endsWith(".json"))
        .sort();
    for (const nome of arquivos) {
        const arquivo: Arquivo = JSON.parse(readFileSync(path.join(PASTA, nome), "utf8"));
        const { trilha, correcoes } = arquivo;
        const finais = arquivo.finais ?? { aulas: {}, alternativas: {} };
        const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.name, trilha));
        if (!t) {
            console.log(`${trilha}: trilha ainda não existe, nada a corrigir.`);
            continue;
        }
        // Planeja tudo antes de gravar: uma divergência não deixa a trilha pela metade.
        const mudancas: Mudanca[] = [];
        let aplicadas = 0;
        for (const [alvo, cadeia] of agrupar(correcoes)) {
            try {
                const m = await planejar(t.id, alvo, cadeia, finais);
                if (m) {
                    mudancas.push(...m);
                    aplicadas += cadeia.length;
                }
            } catch (e) {
                throw new Error(`${trilha}, ${alvo.replace(/\|/g, " ")}: ${(e as Error).message}`);
            }
        }
        await db.transaction(async (tx) => {
            for (const m of mudancas) await m(tx);
        });
        console.log(
            `${trilha}: ${aplicadas} correções aplicadas, ${correcoes.length - aplicadas} já estavam.`,
        );
    }
}

aplicar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha nas correções:", e);
        process.exit(1);
    });
