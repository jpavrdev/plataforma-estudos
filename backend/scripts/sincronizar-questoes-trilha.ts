// Insere no banco as questões novas de uma trilha já semeada, sem tocar nas existentes
// (as respostas dos alunos referenciam as questões antigas por FK). O seed é idempotente
// "pula se já tem aulas", então re-semear não adiciona nada; este script casa aula por
// posição (módulo -> aula) e insere só as questões cujo enunciado ainda não está no banco.
// Antes de inserir, roda um QC (5 questões por aula, 4 opções, 1 correta, sem enunciado
// duplicado, correta não é a mais longa nas novas). Idempotente e com --dry.
//
// Rodar: docker compose exec -T backend node scripts/sincronizar-questoes-trilha.ts <java|cpp|go> [--dry]
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq, asc } from "drizzle-orm";

type Opcao = { text: string; isCorrect: boolean };
type Questao = { statement: string; difficulty: "facil" | "medio" | "dificil"; options: Opcao[] };
type Aula = { titulo: string; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

// QC do conteúdo do seed. `estruturais` (contagem/opções/duplicado) abortam; a regra de
// "correta não é a mais longa" só vale para as questões novas (índice >= 3) e só avisa.
function qc(MODULOS: Modulo[]): { estruturais: string[]; avisos: string[] } {
    const estruturais: string[] = [];
    const avisos: string[] = [];
    MODULOS.forEach((m, mi) =>
        m.aulas.forEach((a, li) => {
            const loc = `M${mi + 1}.A${li + 1} "${a.titulo}"`;
            if (a.questions.length !== 5) estruturais.push(`${loc}: ${a.questions.length} questões (esperado 5)`);
            const vistos = new Set<string>();
            a.questions.forEach((q, qi) => {
                if (q.options.length !== 4) estruturais.push(`${loc} Q${qi + 1}: ${q.options.length} opções`);
                const corretas = q.options.filter((o) => o.isCorrect);
                if (corretas.length !== 1) estruturais.push(`${loc} Q${qi + 1}: ${corretas.length} corretas`);
                if (vistos.has(q.statement)) estruturais.push(`${loc} Q${qi + 1}: enunciado duplicado`);
                vistos.add(q.statement);
                if (qi >= 3 && corretas.length === 1) {
                    const lenC = corretas[0].text.length;
                    const maxD = Math.max(...q.options.filter((o) => !o.isCorrect).map((o) => o.text.length));
                    if (lenC > maxD) avisos.push(`${loc} Q${qi + 1}: correta é a mais longa (${lenC} vs ${maxD})`);
                }
            });
        }),
    );
    return { estruturais, avisos };
}

async function main() {
    const nome = process.argv.slice(2).find((a) => !a.startsWith("--"));
    const dry = process.argv.includes("--dry");
    if (!nome) {
        console.error("uso: node scripts/sincronizar-questoes-trilha.ts <java|cpp|go> [--dry]");
        process.exit(1);
    }

    const mod = await import(`./seed-trilha-${nome}.ts`);
    const MODULOS: Modulo[] = mod.MODULOS;
    const NOME: string = mod.NOME;
    if (!MODULOS || !NOME) {
        console.error(`seed-trilha-${nome}.ts não exporta MODULOS/NOME.`);
        process.exit(1);
    }

    const { estruturais, avisos } = qc(MODULOS);
    avisos.forEach((p) => console.warn("  aviso:", p));
    if (estruturais.length) {
        estruturais.forEach((p) => console.error("  QC:", p));
        console.error(`Abortado: ${estruturais.length} problema(s) estrutural(is).`);
        process.exit(1);
    }

    const [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        console.error(`Trilha "${NOME}" não existe no banco (rode o seed antes).`);
        process.exit(1);
    }
    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trilha.id))
        .orderBy(asc(modules.position));

    let inseridas = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const dbmod = mods.find((m) => m.position === mi + 1);
        if (!dbmod) {
            console.warn(`módulo ${mi + 1} não encontrado no banco`);
            continue;
        }
        const ls = await db
            .select()
            .from(lessons)
            .where(eq(lessons.moduleId, dbmod.id))
            .orderBy(asc(lessons.position));
        for (let li = 0; li < MODULOS[mi].aulas.length; li++) {
            const dblesson = ls.find((l) => l.position === li + 1);
            if (!dblesson) {
                console.warn(`aula ${mi + 1}.${li + 1} não encontrada no banco`);
                continue;
            }
            const qs = await db
                .select()
                .from(questions)
                .where(eq(questions.lessonId, dblesson.id))
                .orderBy(asc(questions.position));
            const existentes = new Set(qs.map((q) => q.statement));
            let pos = qs.reduce((mx, q) => Math.max(mx, q.position), 0);
            for (const q of MODULOS[mi].aulas[li].questions) {
                if (existentes.has(q.statement)) continue;
                pos++;
                inseridas++;
                if (dry) continue;
                const [nova] = await db
                    .insert(questions)
                    .values({ lessonId: dblesson.id, statement: q.statement, difficulty: q.difficulty, position: pos })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: nova.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
        }
    }
    console.log(`\n${dry ? "[DRY] " : ""}Trilha "${NOME}": questões inseridas: ${inseridas}`);
    process.exit(0);
}

main().catch((e) => {
    console.error("Falha ao sincronizar questões:", e);
    process.exit(1);
});
