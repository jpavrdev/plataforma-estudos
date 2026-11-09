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
import { QUIZ_MIN_CORRECT } from "./quiz.service.ts";

type ModuleData = z.infer<typeof createModuleSchema>;
type LessonData = z.infer<typeof createLessonSchema>;
type QuestionData = z.infer<typeof createQuestionSchema>;
type SaveLessonData = z.infer<typeof saveLessonStudioSchema>;

export async function insertModule(trailId: string, data: ModuleData) {
    const [trail] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "trail.notFound");
    }
    const [mod] = await db
        .insert(modules)
        .values({
            trailId,
            title: data.title,
            position: data.position,
        })
        .returning();
    return mod;
}

// Deletes a module and all of its lessons (questions, options and progress).
export async function removeModule(moduleId: string) {
    const [mod] = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, moduleId));
    if (!mod) {
        throw new AppError(404, "module.notFound");
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

export async function insertLesson(moduleId: string, data: LessonData) {
    const [mod] = await db
        .select({ id: modules.id, trailId: modules.trailId })
        .from(modules)
        .where(eq(modules.id, moduleId));
    if (!mod) {
        throw new AppError(404, "module.notFound");
    }
    const [lesson] = await db
        .insert(lessons)
        .values({
            trailId: mod.trailId,
            moduleId,
            title: data.title,
            content: data.content,
            position: data.position,
        })
        .returning();
    return lesson;
}

export async function insertQuestion(lessonId: string, data: QuestionData) {
    const [lesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
    }
    return db.transaction(async (tx) => {
        const [question] = await tx
            .insert(questions)
            .values({
                lessonId,
                statement: data.statement,
                position: data.position,
            })
            .returning();

        await tx.insert(questionOptions).values(
            data.options.map((o, i) => ({
                questionId: question.id,
                text: o.text,
                isCorrect: o.isCorrect,
                position: i + 1,
            })),
        );
        return question;
    });
}

// Publishes or unpublishes a lesson (admin).
export async function setPublished(lessonId: string, published: boolean) {
    const [lesson] = await db
        .update(lessons)
        .set({ published })
        .where(eq(lessons.id, lessonId))
        .returning({ id: lessons.id, title: lessons.title, published: lessons.published });
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
    }
    return lesson;
}

// Course structure for the editor: ordered modules with their lessons (drafts included).
export async function studioStructure(trailId: string) {
    const [trail] = await db
        .select({ id: trails.id, name: trails.name })
        .from(trails)
        .where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "trail.notFound");
    }

    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));
    const lessonRows = await db
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
        id: trail.id,
        name: trail.name,
        modules: mods.map((m) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            lessons: lessonRows.filter((a) => a.moduleId === m.id),
        })),
    };
}

// Full lesson for editing: includes the answer key and difficulty (admin only).
export async function lessonForEditing(lessonId: string) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
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
        id: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        content: lesson.content,
        contentBlocks:
            lesson.contentBlocks ??
            (lesson.content ? [{ type: "text", value: lesson.content }] : []),
        published: lesson.published,
        position: lesson.position,
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

// Deletes a lesson and everything that depends on it.
export async function removeLesson(lessonId: string) {
    const [lesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
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

// Converts the grid (JSON saved by the editor) into a markdown table. 1st row = header.
function tableToMarkdown(value: string): string {
    try {
        const grid = JSON.parse(value);
        if (!Array.isArray(grid) || grid.length === 0) return "";
        const cell = (c: unknown) =>
            String(c ?? "")
                .replace(/\\/g, "\\\\")
                .replace(/\|/g, "\\|")
                .replace(/\n/g, " ");
        const row = (r: unknown[]) => "| " + r.map(cell).join(" | ") + " |";
        const [header, ...body] = grid as unknown[][];
        const separator = "| " + header.map(() => "---").join(" | ") + " |";
        return [row(header), separator, ...body.map(row)].join("\n");
    } catch (e) {
        console.error("tableToMarkdown: invalid value", e);
        return "";
    }
}

// Serializes blocks into markdown (fallback for the student and legacy content).
function blocksToMarkdown(blocks: { type: string; value: string }[]): string {
    return blocks
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
                case "table":
                    return tableToMarkdown(b.value);
                default:
                    return b.value;
            }
        })
        .join("\n\n");
}

// Saves the whole lesson (title, content blocks and questions at once). Replaces
// the questions entirely. Validates the content only when publishing.
export async function saveStudioLesson(lessonId: string, data: SaveLessonData) {
    const [lesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
    }

    if (data.published) {
        if (data.questions.length < QUIZ_MIN_CORRECT) {
            throw new AppError(
                400,
                `Para publicar, a aula precisa de ao menos ${QUIZ_MIN_CORRECT} questões.`,
            );
        }
        for (const [i, q] of data.questions.entries()) {
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
        const blocks = data.contentBlocks ?? [];
        await tx
            .update(lessons)
            .set({
                title: data.title,
                contentBlocks: blocks,
                content: blocks.length ? blocksToMarkdown(blocks) : null,
                ...(data.published === undefined ? {} : { published: data.published }),
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

        for (const [i, q] of data.questions.entries()) {
            const [created] = await tx
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
                        questionId: created.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: oi + 1,
                    })),
                );
            }
        }
    });
}
