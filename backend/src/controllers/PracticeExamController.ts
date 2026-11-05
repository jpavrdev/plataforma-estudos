import type { Request, Response, NextFunction } from "express";
import {
    saveAnswerSchema,
    startAttemptSchema,
    createPracticeExamSchema,
    updatePracticeExamSchema,
    examQuestionSchema,
    syncExamQuestionsSchema,
} from "../schemas/practiceExam.schema.ts";
import {
    findPracticeExams,
    toggleExamFavorite,
    insertAttempt,
    findAttemptOptions,
    findAttemptState,
    saveAttemptAnswer,
    revealAttemptQuestion,
    gradeAttempt,
    findUserAttempts,
    findPracticeExamsForStudio,
    findStudioPracticeExam,
    insertPracticeExam,
    editPracticeExam,
    removePracticeExam,
    insertExamQuestion,
    editExamQuestion,
    removeExamQuestion,
    replaceExamQuestions,
} from "../services/practiceExam.service.ts";

export const listPracticeExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findPracticeExams(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await toggleExamFavorite(req.userId!, String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const startAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = startAttemptSchema.parse(req.body ?? {});
        res.status(201).json(await insertAttempt(req.userId!, String(req.params.slug), settings));
    } catch (err) {
        next(err);
    }
};

export const getAttemptOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findAttemptOptions(String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const getAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findAttemptState(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const saveAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { optionIds } = saveAnswerSchema.parse(req.body);
        res.json(
            await saveAttemptAnswer(
                req.userId!,
                String(req.params.id),
                String(req.params.questionId),
                optionIds,
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const checkAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(
            await revealAttemptQuestion(
                req.userId!,
                String(req.params.id),
                String(req.params.questionId),
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await gradeAttempt(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getMyAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findUserAttempts(req.userId!));
    } catch (err) {
        next(err);
    }
};

// ===================== ADMIN =====================
export const adminListPracticeExams = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findPracticeExamsForStudio());
    } catch (err) {
        next(err);
    }
};

export const adminGetPracticeExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findStudioPracticeExam(String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const createPracticeExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(await insertPracticeExam(createPracticeExamSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const updatePracticeExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(
            await editPracticeExam(
                String(req.params.slug),
                updatePracticeExamSchema.parse(req.body),
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const deletePracticeExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await removePracticeExam(String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const createExamQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(
            await insertExamQuestion(String(req.params.slug), examQuestionSchema.parse(req.body)),
        );
    } catch (err) {
        next(err);
    }
};

export const updateExamQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await editExamQuestion(String(req.params.id), examQuestionSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const deleteExamQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await removeExamQuestion(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const syncExamQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { questions } = syncExamQuestionsSchema.parse(req.body);
        res.json(await replaceExamQuestions(String(req.params.slug), questions));
    } catch (err) {
        next(err);
    }
};
