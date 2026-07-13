// Resync do TEXTO das alternativas de uma trilha, a partir de um seed ja atualizado.
// Uso: docker compose exec -T backend node scripts/resync-opcoes.ts scripts/seed-trilha-X.ts
//
// Casa cada questao do seed com a do banco pelo ENUNCIADO e atualiza o texto das 4
// opcoes por POSICAO. Atualiza SOMENTE o texto: nunca mexe em id nem em isCorrect,
// entao ids, respostas dos alunos e progresso ficam intactos. Trava de seguranca:
// so atualiza quando a marcacao de correta bate posicao a posicao entre seed e banco
// (se o de-tell tiver reordenado as opcoes, a questao e PULADA em vez de corrompida).
// Idempotente: rodar de novo nao muda nada.
import { db } from "../db.ts";
import { trails, lessons, questions, questionOptions } from "../schema.ts";
import { eq, inArray } from "drizzle-orm";
import { readFileSync } from "node:fs";

const seedPath = process.argv[2];
if (!seedPath) {
    console.error("uso: node scripts/resync-opcoes.ts <caminho do seed .ts>");
    process.exit(1);
}

type OpcaoSeed = { text: string; isCorrect: boolean };
type QuestaoSeed = { statement: string; options: OpcaoSeed[] };

function lerSeed(path: string): { nome: string; questoes: QuestaoSeed[] } {
    const raw = readFileSync(path, "utf8");
    const nome = raw.match(/const NOME\s*=\s*"([^"]+)"/)?.[1];
    const m = raw.match(/const MODULOS[^=]*=\s*(\[[\s\S]*\]);\n\nasync function seed/);
    if (!nome || !m) throw new Error("NOME/MODULOS nao encontrados no seed");
    const modulos = JSON.parse(m[1]) as { aulas: { questions: QuestaoSeed[] }[] }[];
    const questoes: QuestaoSeed[] = [];
    for (const mod of modulos) for (const a of mod.aulas) for (const q of a.questions) questoes.push(q);
    return { nome, questoes };
}

async function main() {
    const { nome, questoes: seedQs } = lerSeed(seedPath);

    const [trilha] = await db.select({ id: trails.id }).from(trails).where(eq(trails.name, nome));
    if (!trilha) {
        console.error("Trilha nao encontrada no banco: " + nome);
        process.exit(1);
    }

    const ls = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.trailId, trilha.id));
    const lessonIds = ls.map((l) => l.id);
    const qs = lessonIds.length
        ? await db.select().from(questions).where(inArray(questions.lessonId, lessonIds))
        : [];
    const qIds = qs.map((q) => q.id);
    const opts = qIds.length
        ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, qIds))
        : [];

    const optsPorQ = new Map<string, typeof opts>();
    for (const o of opts) {
        const arr = optsPorQ.get(o.questionId) ?? [];
        arr.push(o);
        optsPorQ.set(o.questionId, arr);
    }
    for (const arr of optsPorQ.values()) arr.sort((a, b) => a.position - b.position);

    const porStatement = new Map<string, { id: string; opts: typeof opts } | "DUP">();
    for (const q of qs) {
        if (porStatement.has(q.statement)) porStatement.set(q.statement, "DUP");
        else porStatement.set(q.statement, { id: q.id, opts: optsPorQ.get(q.id) ?? [] });
    }

    let questoesMexidas = 0;
    let opcoesAtualizadas = 0;
    let semMatch = 0;
    let dup = 0;
    let desalinhadas = 0;
    for (const sq of seedQs) {
        const alvo = porStatement.get(sq.statement);
        if (!alvo) {
            semMatch++;
            continue;
        }
        if (alvo === "DUP") {
            dup++;
            continue;
        }
        if (alvo.opts.length !== 4 || sq.options.length !== 4) {
            desalinhadas++;
            continue;
        }
        const alinhado = sq.options.every((o, k) => o.isCorrect === alvo.opts[k].isCorrect);
        if (!alinhado) {
            desalinhadas++;
            console.log("  desalinhada (correcao nao bate por posicao), pulando: " + sq.statement.slice(0, 60));
            continue;
        }
        let mexeu = false;
        for (let k = 0; k < 4; k++) {
            if (alvo.opts[k].text !== sq.options[k].text) {
                await db.update(questionOptions).set({ text: sq.options[k].text }).where(eq(questionOptions.id, alvo.opts[k].id));
                opcoesAtualizadas++;
                mexeu = true;
            }
        }
        if (mexeu) questoesMexidas++;
    }

    console.log(
        "Resync " + nome + ": " + questoesMexidas + " questoes com texto atualizado (" + opcoesAtualizadas +
        " opcoes). semMatch=" + semMatch + ", dup=" + dup + ", desalinhadas=" + desalinhadas + ", total seed=" + seedQs.length,
    );
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no resync:", e);
        process.exit(1);
    });
