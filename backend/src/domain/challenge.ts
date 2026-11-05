// Grading of the coding challenges. Two modes:
// - stdin: compares the output as text (ignores trailing spaces on each line and
//   trailing blank lines), like the classic online judges.
// - function: compares the function's return value by deep JSON equality.
export function normalizeOutput(s: string): string {
    return s
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((line) => line.replace(/[ \t]+$/, ""))
        .join("\n")
        .replace(/\n+$/, "");
}

export function outputMatches(actual: string, expected: string): boolean {
    return normalizeOutput(actual) === normalizeOutput(expected);
}

// Deep equality of JSON values (arrays, objects, primitives).
export function deepJsonEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((x, i) => deepJsonEqual(x, b[i]));
    }
    if (a && b && typeof a === "object" && typeof b === "object") {
        const ka = Object.keys(a as object);
        const kb = Object.keys(b as object);
        if (ka.length !== kb.length) return false;
        return ka.every((k) =>
            deepJsonEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
        );
    }
    return false;
}

// Compares the function's return value (JSON) with the expected one. If either side
// is not valid JSON, falls back to a (tolerant) text comparison.
export function returnMatches(actual: string, expected: string): boolean {
    try {
        return deepJsonEqual(JSON.parse(actual), JSON.parse(expected));
    } catch {
        return outputMatches(actual, expected);
    }
}

// FNV-1a hash: the basis for picking the challenge of the day deterministically.
export function hashDate(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

// Index of the challenge of the day: the same for every user, changing every day.
// Seeded by the date (YYYY-MM-DD), so it is stable within the same day.
export function dayIndex(today: string, total: number): number {
    if (total <= 0) return -1;
    return hashDate(today) % total;
}

export interface CaseOutput {
    stdout: string;
    exitCode: number;
    timedOut: boolean;
}

export type ChallengeMode = "stdin" | "function";

// A case only counts if the program ended well (no timeout, exit 0) and the output matches.
export function gradeChallenge(
    expectedOutputs: string[],
    outputs: CaseOutput[],
    mode: ChallengeMode = "stdin",
) {
    const compare = mode === "function" ? returnMatches : outputMatches;
    let hits = 0;
    const cases = expectedOutputs.map((expected, i) => {
        const s = outputs[i];
        const ok = !!s && !s.timedOut && s.exitCode === 0 && compare(s.stdout, expected);
        if (ok) hits++;
        return ok;
    });
    return {
        aprovado: expectedOutputs.length > 0 && hits === expectedOutputs.length,
        acertos: hits,
        total: expectedOutputs.length,
        casos: cases,
    };
}
