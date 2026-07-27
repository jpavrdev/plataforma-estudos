// Backfill idempotente das explicações (resolução passo a passo) nas questões já
// semeadas de uma trilha. Casa por posição (módulo -> aula -> questão), então é
// robusto a enunciados/títulos repetidos e não recria nada. Serve para preencher a
// explicação em ambientes onde a trilha já foi semeada (dev e produção).
import { readFileSync, existsSync } from "node:fs";
import { db } from "../db.ts";
import { modules, lessons, questions } from "../schema.ts";
import { eq, asc } from "drizzle-orm";

type QuestaoComExpl = { explanation?: string };
type AulaComExpl = { questions: QuestaoComExpl[] };
type ModuloComExpl = { aulas: AulaComExpl[] };

// As resoluções passo a passo ficam em scripts/solucoes/<nome>.json, casadas por
// posição "modulo.aula.questao" (1-based). Isso mantém o seed enxuto e deixa o
// conteúdo (volumoso) em arquivos próprios. Mescla in-place em MODULOS; se o arquivo
// não existir ainda, não faz nada.
export function mesclarSolucoes(modulos: ModuloComExpl[], nome: string) {
    const url = new URL(`./solucoes/${nome}.json`, import.meta.url);
    if (!existsSync(url)) return 0;
    const sol: Record<string, string> = JSON.parse(readFileSync(url, "utf8"));
    let n = 0;
    for (let mi = 0; mi < modulos.length; mi++) {
        const aulas = modulos[mi].aulas;
        for (let li = 0; li < aulas.length; li++) {
            const qs = aulas[li].questions;
            for (let qi = 0; qi < qs.length; qi++) {
                const chave = `${mi + 1}.${li + 1}.${qi + 1}`;
                if (sol[chave]) {
                    qs[qi].explanation = sol[chave];
                    n++;
                }
            }
        }
    }
    return n;
}

export async function backfillExplicacoes(trilhaId: string, modulos: ModuloComExpl[]) {
    const mods = await db
        .select({ id: modules.id, position: modules.position })
        .from(modules)
        .where(eq(modules.trailId, trilhaId))
        .orderBy(asc(modules.position));
    let atualizadas = 0;
    for (let mi = 0; mi < modulos.length; mi++) {
        const mod = mods.find((m) => m.position === mi + 1);
        if (!mod) continue;
        const ls = await db
            .select({ id: lessons.id, position: lessons.position })
            .from(lessons)
            .where(eq(lessons.moduleId, mod.id))
            .orderBy(asc(lessons.position));
        for (let li = 0; li < modulos[mi].aulas.length; li++) {
            const lesson = ls.find((l) => l.position === li + 1);
            if (!lesson) continue;
            const qs = await db
                .select({ id: questions.id, position: questions.position })
                .from(questions)
                .where(eq(questions.lessonId, lesson.id))
                .orderBy(asc(questions.position));
            const aulaQuestions = modulos[mi].aulas[li].questions;
            for (let qi = 0; qi < aulaQuestions.length; qi++) {
                const expl = aulaQuestions[qi].explanation;
                if (!expl) continue;
                const row = qs.find((r) => r.position === qi + 1);
                if (!row) continue;
                await db
                    .update(questions)
                    .set({ explanation: expl })
                    .where(eq(questions.id, row.id));
                atualizadas++;
            }
        }
    }
    return atualizadas;
}
