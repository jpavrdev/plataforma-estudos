import type { Request, Response, NextFunction } from "express";
import {
    runChallengeSchema,
    createChallengeSchema,
    challengeCommentSchema,
} from "../schemas/challenge.schema.ts";
import {
    findDailyChallenge,
    findChallenges,
    findChallengeDetail,
    runChallengeExamples,
    gradeChallengeSubmission,
    findChallengeSolutions,
    findChallengeComments,
    insertChallengeComment,
    removeChallengeComment,
    findChallengesForStudio,
    findStudioChallenge,
    insertChallenge,
    editChallenge,
    removeChallenge,
} from "../services/challenge.service.ts";

export const getDailyChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findDailyChallenge(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findChallenges(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findChallengeDetail(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const runExamples = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = runChallengeSchema.parse(req.body);
        res.json(await runChallengeExamples(req.userId!, String(req.params.id), input));
    } catch (err) {
        next(err);
    }
};

export const submitChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = runChallengeSchema.parse(req.body);
        res.json(await gradeChallengeSubmission(req.userId!, String(req.params.id), input));
    } catch (err) {
        next(err);
    }
};

export const getSolutions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findChallengeSolutions(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findChallengeComments(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const postComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = challengeCommentSchema.parse(req.body);
        res.status(201).json(
            await insertChallengeComment(req.userId!, String(req.params.id), input),
        );
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await removeChallengeComment(req.userId!, String(req.params.commentId)));
    } catch (err) {
        next(err);
    }
};

// ---- admin ----

export const adminListChallenges = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findChallengesForStudio());
    } catch (err) {
        next(err);
    }
};

export const adminGetChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findStudioChallenge(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(await insertChallenge(createChallengeSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await editChallenge(String(req.params.id), createChallengeSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await removeChallenge(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};
