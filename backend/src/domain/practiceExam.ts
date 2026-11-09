// Each question is all-or-nothing: the marked set must be exactly the correct one.
// Works for single and multiple answers.

function sameSets(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
}

export function isQuestionCorrect(marked: Set<string>, correct: Set<string>): boolean {
    return correct.size > 0 && sameSets(marked, correct);
}

export function gradePracticeExam(
    questions: { id: string; corretas: Set<string> }[],
    answers: Map<string, Set<string>>,
    passPercent: number,
): { acertos: number; total: number; score: number; passed: boolean } {
    let hits = 0;
    for (const q of questions) {
        if (isQuestionCorrect(answers.get(q.id) ?? new Set(), q.corretas)) hits++;
    }
    const total = questions.length;
    const score = total === 0 ? 0 : Math.round((hits / total) * 100);
    return { acertos: hits, total, score, passed: total > 0 && score >= passPercent };
}

// Groups only the topics with mistakes, most missed first, to recommend what to review.
export function summaryByTopic(
    questions: { topic: string | null; correta: boolean }[],
): { topic: string; erradas: number; total: number }[] {
    const byTopic = new Map<string, { erradas: number; total: number }>();
    for (const q of questions) {
        const topic = q.topic ?? "Outros";
        const current = byTopic.get(topic) ?? { erradas: 0, total: 0 };
        current.total++;
        if (!q.correta) current.erradas++;
        byTopic.set(topic, current);
    }
    return [...byTopic.entries()]
        .filter(([, v]) => v.erradas > 0)
        .map(([topic, v]) => ({ topic, erradas: v.erradas, total: v.total }))
        .sort((a, b) => b.erradas - a.erradas);
}
