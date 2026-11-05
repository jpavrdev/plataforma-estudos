// Uniform integer in [0, limit). In production it is crypto.randomInt; in tests,
// a scripted sequence.
export type RandomInt = (limit: number) => number;

// Partial Fisher-Yates: only shuffles the first positions, the ones being drawn.
// Every item has the same chance at every position, and the draw order is the placing.
export function pickRandom<T>(items: readonly T[], count: number, random: RandomInt): T[] {
    if (!Number.isInteger(count) || count < 0) {
        throw new RangeError(`Invalid count to draw: ${count}`);
    }
    const urn = [...items];
    const total = Math.min(count, urn.length);
    for (let i = 0; i < total; i++) {
        const remaining = urn.length - i;
        const jump = random(remaining);
        // Out of range, it would draw an item that does not exist or a biased draw, with no error.
        if (!Number.isInteger(jump) || jump < 0 || jump >= remaining) {
            throw new RangeError(`random(${remaining}) returned ${jump}`);
        }
        const j = i + jump;
        [urn[i], urn[j]] = [urn[j], urn[i]];
    }
    return urn.slice(0, total);
}
