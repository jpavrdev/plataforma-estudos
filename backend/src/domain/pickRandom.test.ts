import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { pickRandom } from "./pickRandom.ts";

// Returns the scripted values, in order, and keeps the limits it was asked for.
function script(values: number[]) {
    const limits: number[] = [];
    const random = (limit: number) => {
        limits.push(limit);
        const value = values.shift();
        if (value === undefined) throw new Error("script ran out");
        return value;
    };
    return { random, limits };
}

const ITEMS = ["ana", "bia", "caio", "davi", "eva"];

describe("pickRandom", () => {
    test("the draw order follows the generator and is the placing", () => {
        const { random, limits } = script([2, 0, 1]);
        assert.deepEqual(pickRandom(ITEMS, 3, random), ["caio", "bia", "davi"]);
        assert.deepEqual(limits, [5, 4, 3]);
    });

    test("a generator always at zero draws the first ones, in order", () => {
        assert.deepEqual(
            pickRandom(ITEMS, 3, () => 0),
            ["ana", "bia", "caio"],
        );
    });

    test("a generator always at the maximum draws from the end of the urn", () => {
        assert.deepEqual(
            pickRandom(ITEMS, 3, (limit) => limit - 1),
            ["eva", "ana", "bia"],
        );
    });

    test("never repeats an item", () => {
        for (let seed = 0; seed < 200; seed++) {
            let state = seed;
            const random = (limit: number) => {
                state = (state * 75 + 74) % 65537;
                return state % limit;
            };
            const winners = pickRandom(ITEMS, 3, random);
            assert.equal(new Set(winners).size, 3);
        }
    });

    test("each result comes from exactly one generator combination", () => {
        const items = ["a", "b", "c", "d"];
        const results = new Set<string>();
        for (let first = 0; first < 4; first++) {
            for (let second = 0; second < 3; second++) {
                const { random } = script([first, second]);
                results.add(pickRandom(items, 2, random).join(""));
            }
        }
        // 12 generator combinations and 12 possible ordered pairs: no bias.
        assert.equal(results.size, 12);
    });

    test("a count larger than the list draws all of them", () => {
        const { random, limits } = script([1, 0]);
        assert.deepEqual(pickRandom(["x", "y"], 3, random), ["y", "x"]);
        assert.deepEqual(limits, [2, 1]);
    });

    test("an empty list and a zero count do not call the generator", () => {
        const { random, limits } = script([]);
        assert.deepEqual(pickRandom([], 3, random), []);
        assert.deepEqual(pickRandom(ITEMS, 0, random), []);
        assert.deepEqual(limits, []);
    });

    test("does not mutate the given list", () => {
        const items = [...ITEMS];
        pickRandom(items, 3, (limit) => limit - 1);
        assert.deepEqual(items, ITEMS);
    });

    test("rejects a generator out of range", () => {
        assert.throws(() => pickRandom(ITEMS, 1, (limit) => limit), RangeError);
        assert.throws(() => pickRandom(ITEMS, 1, () => -1), RangeError);
        assert.throws(() => pickRandom(ITEMS, 1, () => 0.5), RangeError);
    });

    test("rejects a negative or fractional count", () => {
        assert.throws(() => pickRandom(ITEMS, -1, () => 0), RangeError);
        assert.throws(() => pickRandom(ITEMS, 1.5, () => 0), RangeError);
    });
});
