import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeXp, levelFromXp } from "./xp.ts";

describe("computeXp", () => {
    test("no progress is worth 0", () => {
        assert.equal(computeXp({ lessons: 0, questions: 0 }), 0);
    });

    test("each completed lesson is worth 50", () => {
        assert.equal(computeXp({ lessons: 1, questions: 0 }), 50);
        assert.equal(computeXp({ lessons: 3, questions: 0 }), 150);
    });

    test("each right answer is worth 10", () => {
        assert.equal(computeXp({ lessons: 0, questions: 1 }), 10);
        assert.equal(computeXp({ lessons: 0, questions: 5 }), 50);
    });

    test("adds lessons and questions", () => {
        assert.equal(computeXp({ lessons: 2, questions: 4 }), 140);
    });

    test("a lesson weighs more than a question", () => {
        assert.ok(
            computeXp({ lessons: 1, questions: 0 }) > computeXp({ lessons: 0, questions: 1 }),
        );
    });
});

describe("levelFromXp", () => {
    test("level 1 with 0 XP", () => {
        assert.equal(levelFromXp(0), 1);
    });

    test("just below the threshold stays at the same level", () => {
        assert.equal(levelFromXp(499), 1);
    });

    test("the exact threshold levels up", () => {
        assert.equal(levelFromXp(500), 2);
        assert.equal(levelFromXp(1000), 3);
    });

    test("the level never goes down as XP grows", () => {
        let previous = 1;
        for (let xp = 0; xp <= 3000; xp += 37) {
            const current = levelFromXp(xp);
            assert.ok(current >= previous);
            previous = current;
        }
    });
});
