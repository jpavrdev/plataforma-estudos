import { db } from "../../db.ts";
import {
    trails,
    modules,
    lessons,
    lessonProgress,
    questions,
    questionOptions,
    questionAnswers,
} from "../../schema.ts";
import { eq, asc, inArray } from "drizzle-orm";
import type { z } from "zod";
import type {
    createModuleSchema,
    createLessonSchema,
    createQuestionSchema,
    saveLessonStudioSchema,
} from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { QUIZ_MIN_ACERTOS } from "./quiz.service.ts";

type DadosModulo = z.infer<typeof createModuleSchema>;
type DadosAula = z.infer<typeof createLessonSchema>;
type DadosQuestao = z.infer<typeof createQuestionSchema>;
type DadosSalvarAula = z.infer<typeof saveLessonStudioSchema>;

export async function criarModulo(trailId: string, dados: DadosModulo) {
    const [trilha] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }
    const [modulo] = await db
        .insert(modules)
        .values({
            trailId,
            title: dados.title,
            position: dados.position,
        })
        .returning();
    return modulo;
}

// Exclui um módulo e todas as suas aulas (questões, opções e progresso).
export async function excluirModulo(moduleId: string) {
    const [modulo] = await db
        .select({ id: modules.id })
        .from(modules)
        .where(eq(modules.id, moduleId));
    if (!modulo) {
        throw new AppError(404, "Módulo não encontrado");
    }
    await db.transaction(async (tx) => {
        const ls = await tx
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.moduleId, moduleId));
        const lessonIds = ls.map((l) => l.id);
        if (lessonIds.length) {
            const qs = await tx
                .select({ id: questions.id })
                .from(questions)
                .where(inArray(questions.lessonId, lessonIds));
            const qIds = qs.map((q) => q.id);
            if (qIds.length) {
                await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qIds));
                await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qIds));
                await tx.delete(questions).where(inArray(questions.id, qIds));
            }
            await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds));
            await tx.delete(lessons).where(inArray(lessons.id, lessonIds));
        }
        await tx.delete(modules).where(eq(modules.id, moduleId));
    });
}

export async function criarAula(moduleId: string, dados: DadosAula) {
    const [modulo] = await db
        .select({ id: modules.id, trailId: modules.trailId })
        .from(modules)
        .where(eq(modules.id, moduleId));
    if (!modulo) {
        throw new AppError(404, "Módulo não encontrado");
    }
    const [aula] = await db
        .insert(lessons)
        .values({
            trailId: modulo.trailId,
            moduleId,
            title: dados.title,
            content: dados.content,
            position: dados.position,
        })
        .returning();
    return aula;
}

export async function criarQuestao(lessonId: string, dados: DadosQuestao) {
    const [aula] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }
    return db.transaction(async (tx) => {
        const [questao] = await tx
            .insert(questions)
            .values({
                lessonId,
                statement: dados.statement,
                position: dados.position,
            })
            .returning();

        await tx.insert(questionOptions).values(
            dados.options.map((o, i) => ({
                questionId: questao.id,
                text: o.text,
                isCorrect: o.isCorrect,
                position: i + 1,
            })),
        );
        return questao;
    });
}

// Publica ou despublica uma aula (admin).
export async function definirPublicacao(lessonId: string, published: boolean) {
    const [aula] = await db
        .update(lessons)
        .set({ published })
        .where(eq(lessons.id, lessonId))
        .returning({ id: lessons.id, title: lessons.title, published: lessons.published });
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }
    return aula;
}

// Estrutura do curso para o editor: módulos ordenados com suas aulas (inclui rascunhos).
export async function estruturaDoEstudio(trailId: string) {
    const [trilha] = await db
        .select({ id: trails.id, name: trails.name })
        .from(trails)
        .where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }

    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));
    const aulas = await db
        .select({
            id: lessons.id,
            moduleId: lessons.moduleId,
            title: lessons.title,
            position: lessons.position,
            published: lessons.published,
        })
        .from(lessons)
        .where(eq(lessons.trailId, trailId))
        .orderBy(asc(lessons.position));

    return {
        id: trilha.id,
        name: trilha.name,
        modules: mods.map((m) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            lessons: aulas.filter((a) => a.moduleId === m.id),
        })),
    };
}

// Aula completa para edição: inclui o gabarito e a dificuldade (só admin).
export async function aulaParaEdicao(lessonId: string) {
    const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }

    const qs = await db
        .select()
        .from(questions)
        .where(eq(questions.lessonId, lessonId))
        .orderBy(asc(questions.position));
    const qIds = qs.map((q) => q.id);
    const opts = qIds.length
        ? await db
              .select()
              .from(questionOptions)
              .where(inArray(questionOptions.questionId, qIds))
              .orderBy(asc(questionOptions.position))
        : [];

    return {
        id: aula.id,
        moduleId: aula.moduleId,
        title: aula.title,
        content: aula.content,
        contentBlocks:
            aula.contentBlocks ?? (aula.content ? [{ type: "text", value: aula.content }] : []),
        published: aula.published,
        position: aula.position,
        questions: qs.map((q) => ({
            id: q.id,
            statement: q.statement,
            difficulty: q.difficulty,
            position: q.position,
            options: opts
                .filter((o) => o.questionId === q.id)
                .map((o) => ({
                    id: o.id,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    position: o.position,
                })),
        })),
    };
}

// Exclui uma aula e tudo que depende dela.
export async function excluirAula(lessonId: string) {
    const [aula] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }

    await db.transaction(async (tx) => {
        const qs = await tx
            .select({ id: questions.id })
            .from(questions)
            .where(eq(questions.lessonId, lessonId));
        const qIds = qs.map((q) => q.id);
        if (qIds.length) {
            await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qIds));
            await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qIds));
            await tx.delete(questions).where(inArray(questions.id, qIds));
        }
        await tx.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId));
        await tx.delete(lessons).where(eq(lessons.id, lessonId));
    });
}

// Serializa os blocos em markdown (fallback para o aluno e para conteúdo legado).
function blocosParaMarkdown(blocos: { type: string; value: string }[]): string {
    return blocos
        .map((b) => {
            switch (b.type) {
                case "code":
                    return "```\n" + b.value + "\n```";
                case "quote":
                    return b.value
                        .split("\n")
                        .map((l) => "> " + l)
                        .join("\n");
                case "image":
                    return `![imagem](${b.value})`;
                case "video":
                    return `[Vídeo](${b.value})`;
                default:
                    return b.value;
            }
        })
        .join("\n\n");
}

// Salva a aula inteira (título, blocos de conteúdo e questões de uma vez). Substitui
// as questões por completo. Valida o conteúdo apenas quando vai publicar.
export async function salvarAulaEstudio(lessonId: string, dados: DadosSalvarAula) {
    const [aula] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }

    if (dados.published) {
        if (dados.questions.length < QUIZ_MIN_ACERTOS) {
            throw new AppError(
                400,
                `Para publicar, a aula precisa de ao menos ${QUIZ_MIN_ACERTOS} questões.`,
            );
        }
        for (const [i, q] of dados.questions.entries()) {
            if (q.statement.trim().length < 3) {
                throw new AppError(400, `Questão ${i + 1}: enunciado muito curto.`);
            }
            if (q.options.filter((o) => o.text.trim().length > 0).length < 2) {
                throw new AppError(400, `Questão ${i + 1}: precisa de ao menos 2 alternativas.`);
            }
            if (q.options.filter((o) => o.isCorrect).length !== 1) {
                throw new AppError(
                    400,
                    `Questão ${i + 1}: marque exatamente uma alternativa correta.`,
                );
            }
        }
    }

    await db.transaction(async (tx) => {
        const blocos = dados.contentBlocks ?? [];
        await tx
            .update(lessons)
            .set({
                title: dados.title,
                contentBlocks: blocos,
                content: blocos.length ? blocosParaMarkdown(blocos) : null,
                ...(dados.published === undefined ? {} : { published: dados.published }),
            })
            .where(eq(lessons.id, lessonId));

        const qs = await tx
            .select({ id: questions.id })
            .from(questions)
            .where(eq(questions.lessonId, lessonId));
        const qIds = qs.map((q) => q.id);
        if (qIds.length) {
            await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qIds));
            await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qIds));
            await tx.delete(questions).where(inArray(questions.id, qIds));
        }

        for (const [i, q] of dados.questions.entries()) {
            const [nova] = await tx
                .insert(questions)
                .values({
                    lessonId,
                    statement: q.statement,
                    difficulty: q.difficulty ?? "facil",
                    position: i + 1,
                })
                .returning({ id: questions.id });
            if (q.options.length) {
                await tx.insert(questionOptions).values(
                    q.options.map((o, oi) => ({
                        questionId: nova.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: oi + 1,
                    })),
                );
            }
        }
    });
}
