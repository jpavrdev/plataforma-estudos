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

// challengesXp is already summed in XP (not a count), since each challenge is worth a different amount.
export function computeXp({
    lessons,
    questions,
    challengesXp = 0,
}: {
    lessons: number;
    questions: number;
    challengesXp?: number;
}): number {
    return lessons * XP_PER_LESSON + questions * XP_PER_QUESTION + challengesXp;
}

export function levelFromXp(xp: number): number {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}
