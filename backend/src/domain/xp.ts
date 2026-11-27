// Scoring rules. Single source of XP and level: /me, ranking and achievements derive from here.
export const XP_PER_LESSON = 50;
export const XP_PER_QUESTION = 10;
export const XP_PER_LEVEL = 500;

// A challenge's XP depends on its difficulty and is granted once, on the first pass.
export const CHALLENGE_XP_BY_DIFFICULTY: Record<string, number> = {
    facil: 50,
    medio: 80,
    dificil: 120,
};

export function challengeXp(difficulty: string): number {
    return CHALLENGE_XP_BY_DIFFICULTY[difficulty] ?? CHALLENGE_XP_BY_DIFFICULTY.facil;
}

// A sprint task pays its points times this, granted once on approval.
export const XP_PER_SPRINT_POINT = 20;

// challengesXp and sprintsXp arrive already summed (each item is worth a
// different amount), unlike the counted lessons and questions.
export function computeXp({
    lessons,
    questions,
    challengesXp = 0,
    sprintsXp = 0,
}: {
    lessons: number;
    questions: number;
    challengesXp?: number;
    sprintsXp?: number;
}): number {
    return lessons * XP_PER_LESSON + questions * XP_PER_QUESTION + challengesXp + sprintsXp;
}

export function levelFromXp(xp: number): number {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}
