import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { seededShuffle } from "./shuffle.ts";

describe("seededShuffle", () => {
    test("the same seed always returns the same order", () => {
        const items = ["a", "b", "c", "d", "e", "f"];
        assert.deepEqual(seededShuffle(items, "att-q"), seededShuffle(items, "att-q"));
    });

    test("is a permutation of the same items", () => {
        const items = ["a", "b", "c", "d", "e", "f"];
        assert.deepEqual([...seededShuffle(items, "s")].sort(), [...items].sort());
    });

    test("different seeds produce different orders", () => {
        const items = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        assert.notDeepEqual(seededShuffle(items, "att1-q"), seededShuffle(items, "att2-q"));
    });

    test("does not mutate the original array", () => {
        const items = ["a", "b", "c"];
        seededShuffle(items, "s");
        assert.deepEqual(items, ["a", "b", "c"]);
    });
});
