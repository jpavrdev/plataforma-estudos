import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    normalizeOutput,
    outputMatches,
    gradeChallenge,
    returnMatches,
    deepJsonEqual,
    dayIndex,
} from "./challenge.ts";

describe("normalizeOutput", () => {
    test("removes trailing spaces on each line", () => {
        assert.equal(normalizeOutput("a  \nb\t"), "a\nb");
    });

    test("removes trailing blank lines", () => {
        assert.equal(normalizeOutput("42\n\n\n"), "42");
    });

    test("converts Windows line breaks", () => {
        assert.equal(normalizeOutput("a\r\nb\r\n"), "a\nb");
    });

    test("keeps blank lines in the middle", () => {
        assert.equal(normalizeOutput("a\n\nb\n"), "a\n\nb");
    });
});

describe("outputMatches", () => {
    test("equal after normalizing", () => {
        assert.equal(outputMatches("7\n", "7"), true);
    });

    test("actually different", () => {
        assert.equal(outputMatches("7", "8"), false);
    });

    test("inner spaces count", () => {
        assert.equal(outputMatches("a b", "ab"), false);
    });
});

describe("gradeChallenge", () => {
    const ok = { stdout: "7", exitCode: 0, timedOut: false };

    test("all cases right passes", () => {
        const r = gradeChallenge(["7", "7"], [ok, ok]);
        assert.deepEqual(r, { aprovado: true, acertos: 2, total: 2, casos: [true, true] });
    });

    test("a wrong output fails the case", () => {
        const r = gradeChallenge(["7", "9"], [ok, ok]);
        assert.equal(r.aprovado, false);
        assert.equal(r.acertos, 1);
        assert.deepEqual(r.casos, [true, false]);
    });

    test("a timeout fails even with the right output", () => {
        const r = gradeChallenge(["7"], [{ ...ok, timedOut: true }]);
        assert.equal(r.aprovado, false);
    });

    test("a non-zero exit code fails", () => {
        const r = gradeChallenge(["7"], [{ ...ok, exitCode: 1 }]);
        assert.equal(r.aprovado, false);
    });

    test("a missing output fails", () => {
        const r = gradeChallenge(["7", "8"], [ok]);
        assert.equal(r.aprovado, false);
        assert.equal(r.acertos, 1);
    });

    test("no cases does not pass", () => {
        assert.equal(gradeChallenge([], []).aprovado, false);
    });
});

describe("function mode (JSON)", () => {
    test("deep equality of arrays", () => {
        assert.equal(deepJsonEqual([0, 1], [0, 1]), true);
        assert.equal(deepJsonEqual([0, 1], [1, 0]), false);
    });

    test("deep equality of objects does not depend on key order", () => {
        assert.equal(deepJsonEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
    });

    test("returnMatches compares JSON, not text", () => {
        assert.equal(returnMatches("[0, 1]", "[0,1]"), true);
        assert.equal(returnMatches("[0,1]", "[1,0]"), false);
        assert.equal(returnMatches("3", "3"), true);
    });

    test("grading in function mode uses JSON comparison", () => {
        const ok = { stdout: "[0,1]", exitCode: 0, timedOut: false };
        const r = gradeChallenge(["[0, 1]"], [ok], "function");
        assert.equal(r.aprovado, true);
    });

    test("a wrong return value fails in function mode", () => {
        const s = { stdout: "[1,0]", exitCode: 0, timedOut: false };
        const r = gradeChallenge(["[0,1]"], [s], "function");
        assert.equal(r.aprovado, false);
    });
});

describe("dayIndex", () => {
    test("is deterministic for the same date", () => {
        assert.equal(dayIndex("2026-07-02", 30), dayIndex("2026-07-02", 30));
    });

    test("stays within [0, total)", () => {
        for (const d of ["2026-01-01", "2026-07-02", "2025-12-31", "2026-06-15"]) {
            const i = dayIndex(d, 30);
            assert.ok(i >= 0 && i < 30, `${d} -> ${i}`);
        }
    });

    test("different dates tend to give different indexes", () => {
        const days = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
        const indexes = new Set(days.map((d) => dayIndex(d, 30)));
        assert.ok(indexes.size >= 3);
    });

    test("a zero total returns -1", () => {
        assert.equal(dayIndex("2026-07-02", 0), -1);
    });
});
