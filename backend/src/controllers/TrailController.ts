import type { Request, Response, NextFunction } from "express";
import { db } from "../../db.ts";
import {
    users,
    trails,
    modules,
    lessons,
    lessonProgress,
    questions,
    questionOptions,
    questionAnswers,
    achievements,
    userAchievements,
} from "../../schema.ts";
import { eq, and, count, asc, desc, gte, inArray } from "drizzle-orm";
import {
    createTrailSchema,
    createModuleSchema,
    createLessonSchema,
    createQuestionSchema,
    submitQuizSchema,
    checkAnswerSchema,
    saveLessonStudioSchema,
    updateTrailSchema,
    createTagSchema,
    updateTagSchema,
    createLanguageSchema,
    updateLanguageSchema,
    createAchievementSchema,
    updateAchievementSchema,
} from "../schemas/trail.schemas.ts";
import {
    calcularStreak,
    diasAtivosDoUsuario,
    semanaAtividade,
    streaksTodos,
    hojeSaoPaulo,
} from "../services/streak.ts";
import { movimentacaoRanking } from "../services/ranking.ts";
import { listarTags, criarTag, atualizarTag, excluirTag } from "../services/tag.service.ts";
import {
    listarLinguagens,
    criarLinguagem,
    atualizarLinguagem,
    excluirLinguagem,
} from "../services/language.service.ts";
import { calcularEstatisticas } from "../services/stats.service.ts";
import {
    listarConquistas,
    criarConquista,
    atualizarConquista,
    excluirConquista,
    conquistasDoUsuario,
    feedComunidade,
} from "../services/achievement.service.ts";
import {
    criarTrilha,
    atualizarTrilha,
    excluirTrilha,
    listarTrilhas,
    trilhasDoUsuario,
    detalheDaTrilha,
} from "../services/trail.service.ts";
import { detalheDaAula } from "../services/lesson.service.ts";
import { QUIZ_MIN_ACERTOS, corrigirQuiz, conferirResposta } from "../services/quiz.service.ts";

export const createTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTrailSchema.parse(req.body);
        res.status(201).json(await criarTrilha(dados));
    } catch (err) {
        next(err);
    }
};

// ===================== TAGS (categorias de trilha) =====================
export const listTags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarTags());
    } catch (err) {
        next(err);
    }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTagSchema.parse(req.body);
        res.status(201).json(await criarTag(dados.name));
    } catch (err) {
        next(err);
    }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateTagSchema.parse(req.body);
        res.json(await atualizarTag(id, dados.name));
    } catch (err) {
        next(err);
    }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirTag(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== LINGUAGENS (canônicas do perfil) =====================
export const listLanguages = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarLinguagens());
    } catch (err) {
        next(err);
    }
};

export const createLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createLanguageSchema.parse(req.body);
        res.status(201).json(await criarLinguagem(dados.name));
    } catch (err) {
        next(err);
    }
};

export const updateLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateLanguageSchema.parse(req.body);
        res.json(await atualizarLinguagem(id, dados.name));
    } catch (err) {
        next(err);
    }
};

export const deleteLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirLinguagem(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== CONQUISTAS (catálogo, admin) =====================
export const listAchievements = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarConquistas());
    } catch (err) {
        next(err);
    }
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createAchievementSchema.parse(req.body);
        res.status(201).json(await criarConquista(dados));
    } catch (err) {
        next(err);
    }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateAchievementSchema.parse(req.body);
        res.json(await atualizarConquista(id, dados));
    } catch (err) {
        next(err);
    }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirConquista(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Edita os dados da trilha (admin).
export const updateTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = updateTrailSchema.parse(req.body);
        res.json(await atualizarTrilha(trailId, dados));
    } catch (err) {
        next(err);
    }
};

// Exclui a trilha inteira (módulos, aulas, questões e progresso).
export const deleteTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirTrilha(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = createModuleSchema.parse(req.body);

        const [trilha] = await db
            .select({ id: trails.id })
            .from(trails)
            .where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const [modulo] = await db
            .insert(modules)
            .values({
                trailId,
                title: dados.title,
                position: dados.position,
            })
            .returning();
        res.status(201).json(modulo);
    } catch (err) {
        next(err);
    }
};

// Exclui um módulo e todas as suas aulas (questões, opções e progresso).
export const deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moduleId = String(req.params.id);
        const [modulo] = await db
            .select({ id: modules.id })
            .from(modules)
            .where(eq(modules.id, moduleId));
        if (!modulo) {
            return res.status(404).json({ erro: "Módulo não encontrado" });
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
                    await tx
                        .delete(questionAnswers)
                        .where(inArray(questionAnswers.questionId, qIds));
                    await tx
                        .delete(questionOptions)
                        .where(inArray(questionOptions.questionId, qIds));
                    await tx.delete(questions).where(inArray(questions.id, qIds));
                }
                await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds));
                await tx.delete(lessons).where(inArray(lessons.id, lessonIds));
            }
            await tx.delete(modules).where(eq(modules.id, moduleId));
        });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moduleId = String(req.params.id);
        const dados = createLessonSchema.parse(req.body);

        const [modulo] = await db
            .select({ id: modules.id, trailId: modules.trailId })
            .from(modules)
            .where(eq(modules.id, moduleId));
        if (!modulo) {
            return res.status(404).json({ erro: "Módulo não encontrado" });
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
        res.status(201).json(aula);
    } catch (err) {
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = createQuestionSchema.parse(req.body);

        const [aula] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const criada = await db.transaction(async (tx) => {
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

        res.status(201).json(criada);
    } catch (err) {
        next(err);
    }
};

export const listTrails = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarTrilhas());
    } catch (err) {
        next(err);
    }
};

export const getMyTrails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "Não autenticado" });
        }
        res.json(await trilhasDoUsuario(userId));
    } catch (err) {
        next(err);
    }
};

// Retorna a trilha com módulos e aulas, cada aula com estado para o usuário.
// Estado sequencial na trilha toda: done | current | locked.
export const getTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheDaTrilha(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

// Retorna a aula com conteúdo e questões SEM revelar a alternativa correta.
export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheDaAula(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

// Recebe as respostas, corrige no servidor e conclui a aula se acertar o mínimo.
export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = submitQuizSchema.parse(req.body);
        res.json(await corrigirQuiz(req.userId!, lessonId, dados));
    } catch (err) {
        next(err);
    }
};

// XP total do usuário: 50 por aula concluída + 10 por questão acertada (primeira vez).
export const getMyXp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await calcularEstatisticas(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Catálogo de conquistas com a marcação do que o usuário já desbloqueou.
export const getMyAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await conquistasDoUsuario(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Atividades recentes derivadas: aulas concluídas + conquistas desbloqueadas.
export const getMyActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const aulas = await db
            .select({ at: lessonProgress.completedAt, title: lessons.title })
            .from(lessonProgress)
            .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
            .where(eq(lessonProgress.userId, userId))
            .orderBy(desc(lessonProgress.completedAt))
            .limit(15);
        const conquistas = await db
            .select({
                at: userAchievements.earnedAt,
                name: achievements.name,
                icon: achievements.icon,
            })
            .from(userAchievements)
            .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
            .where(eq(userAchievements.userId, userId))
            .orderBy(desc(userAchievements.earnedAt))
            .limit(15);
        const itens = [
            ...aulas.map((a) => ({
                type: "lesson",
                icon: "check",
                text: `Concluiu a aula "${a.title}"`,
                at: a.at,
            })),
            ...conquistas.map((c) => ({
                type: "achievement",
                icon: c.icon,
                text: `Desbloqueou "${c.name}"`,
                at: c.at,
            })),
        ]
            .sort((x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : 0))
            .slice(0, 15);
        res.json(itens);
    } catch (err) {
        next(err);
    }
};

// Feed da comunidade: quem desbloqueou cada conquista, mais recentes primeiro.
export const getCommunityAchievements = async (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        res.json(await feedComunidade());
    } catch (err) {
        next(err);
    }
};

// Ranking global por XP. Liga e nível usam o XP total; o leaderboard usa o
// período (week/month/all). XP = 50 por aula concluída + 10 por questão certa.
export const getRanking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periodo = String(req.query.period ?? "all");
        const dia = 24 * 60 * 60 * 1000;
        const desde =
            periodo === "week"
                ? new Date(Date.now() - 7 * dia)
                : periodo === "month"
                  ? new Date(Date.now() - 30 * dia)
                  : null;

        const [usuarios, aulasTot, acertosTot, aulasPer, acertosPer, streaks] = await Promise.all([
            db.select({ id: users.id, name: users.name, username: users.username }).from(users),
            db
                .select({ userId: lessonProgress.userId, n: count() })
                .from(lessonProgress)
                .groupBy(lessonProgress.userId),
            db
                .select({ userId: questionAnswers.userId, n: count() })
                .from(questionAnswers)
                .where(eq(questionAnswers.isCorrect, true))
                .groupBy(questionAnswers.userId),
            desde
                ? db
                      .select({ userId: lessonProgress.userId, n: count() })
                      .from(lessonProgress)
                      .where(gte(lessonProgress.completedAt, desde))
                      .groupBy(lessonProgress.userId)
                : Promise.resolve(null),
            desde
                ? db
                      .select({ userId: questionAnswers.userId, n: count() })
                      .from(questionAnswers)
                      .where(
                          and(
                              eq(questionAnswers.isCorrect, true),
                              gte(questionAnswers.answeredAt, desde),
                          ),
                      )
                      .groupBy(questionAnswers.userId)
                : Promise.resolve(null),
            streaksTodos(),
        ]);

        const paraMapa = (arr: { userId: string; n: number }[] | null) =>
            new Map((arr ?? []).map((a) => [a.userId, Number(a.n)]));
        const at = paraMapa(aulasTot),
            acT = paraMapa(acertosTot);
        const aP = desde ? paraMapa(aulasPer) : at;
        const acP = desde ? paraMapa(acertosPer) : acT;

        const base = usuarios.map((u) => {
            const totalXp = (at.get(u.id) ?? 0) * 50 + (acT.get(u.id) ?? 0) * 10;
            const periodXp = (aP.get(u.id) ?? 0) * 50 + (acP.get(u.id) ?? 0) * 10;
            return {
                id: u.id,
                name: u.name,
                username: u.username,
                totalXp,
                periodXp,
                level: Math.floor(totalXp / 500) + 1,
                streak: streaks.get(u.id) ?? 0,
                you: u.id === req.userId,
            };
        });
        const ordenados = [...base]
            .sort((a, b) => b.periodXp - a.periodXp)
            .map((u, i) => ({ ...u, position: i + 1 }));
        // Movimentação é calculada sobre o ranking geral (XP total).
        const ordemGeral = [...base]
            .sort((a, b) => b.totalXp - a.totalXp)
            .map((u, i) => ({ id: u.id, position: i + 1 }));
        const deltas = await movimentacaoRanking(hojeSaoPaulo(), ordemGeral);

        const meu = ordenados.find((u) => u.you);
        const me = meu
            ? {
                  position: meu.position,
                  username: meu.username,
                  xp: meu.periodXp,
                  totalXp: meu.totalXp,
                  level: meu.level,
                  streak: meu.streak,
                  delta: deltas.get(meu.id) ?? 0,
              }
            : null;
        const rows = ordenados.slice(0, 20).map((u) => ({
            position: u.position,
            name: u.name,
            username: u.username,
            xp: u.periodXp,
            level: u.level,
            streak: u.streak,
            delta: deltas.get(u.id) ?? 0,
            you: u.you,
        }));
        res.json({ me, rows });
    } catch (err) {
        next(err);
    }
};

// Streak do usuário + os últimos 7 dias (para o card da home).
export const getMyStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dias = await diasAtivosDoUsuario(req.userId!);
        res.json({ streak: calcularStreak(dias), week: semanaAtividade(dias) });
    } catch (err) {
        next(err);
    }
};

// Verifica uma única resposta para o quiz em carrossel (feedback imediato), sem
// expor o gabarito das outras questões. Não grava nada: a conclusão da aula
// continua sendo decidida no submitQuiz.
export const checkAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { questionId, optionId } = checkAnswerSchema.parse(req.body);
        res.json(await conferirResposta(req.userId!, lessonId, questionId, optionId));
    } catch (err) {
        next(err);
    }
};

// Publica ou despublica uma aula (admin). Body: { published: boolean }
export const setLessonPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { published } = req.body;
        if (typeof published !== "boolean") {
            return res.status(400).json({ erro: "Campo 'published' deve ser booleano" });
        }

        const [aula] = await db
            .update(lessons)
            .set({ published })
            .where(eq(lessons.id, lessonId))
            .returning({ id: lessons.id, title: lessons.title, published: lessons.published });

        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        res.json(aula);
    } catch (err) {
        next(err);
    }
};

// ===================== ESTÚDIO (admin) =====================

// Estrutura do curso para o editor: módulos ordenados com suas aulas (inclui rascunhos).
export const getTrailStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const [trilha] = await db
            .select({ id: trails.id, name: trails.name })
            .from(trails)
            .where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
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

        res.json({
            id: trilha.id,
            name: trilha.name,
            modules: mods.map((m) => ({
                id: m.id,
                title: m.title,
                position: m.position,
                lessons: aulas.filter((a) => a.moduleId === m.id),
            })),
        });
    } catch (err) {
        next(err);
    }
};

// Aula completa para edição: inclui o gabarito e a dificuldade (só admin).
export const getLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
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

        res.json({
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
        });
    } catch (err) {
        next(err);
    }
};

// Exclui uma aula e tudo que depende dela.
export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const [aula] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
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

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

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
export const saveLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = saveLessonStudioSchema.parse(req.body);

        const [aula] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        if (dados.published) {
            if (dados.questions.length < QUIZ_MIN_ACERTOS) {
                return res.status(400).json({
                    erro: `Para publicar, a aula precisa de ao menos ${QUIZ_MIN_ACERTOS} questões.`,
                });
            }
            for (const [i, q] of dados.questions.entries()) {
                if (q.statement.trim().length < 3) {
                    return res
                        .status(400)
                        .json({ erro: `Questão ${i + 1}: enunciado muito curto.` });
                }
                if (q.options.filter((o) => o.text.trim().length > 0).length < 2) {
                    return res
                        .status(400)
                        .json({ erro: `Questão ${i + 1}: precisa de ao menos 2 alternativas.` });
                }
                if (q.options.filter((o) => o.isCorrect).length !== 1) {
                    return res.status(400).json({
                        erro: `Questão ${i + 1}: marque exatamente uma alternativa correta.`,
                    });
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

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};
