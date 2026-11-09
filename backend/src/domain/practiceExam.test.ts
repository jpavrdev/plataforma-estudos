import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { gradePracticeExam, isQuestionCorrect, summaryByTopic } from "./practiceExam.ts";

describe("isQuestionCorrect", () => {
    test("single answer, right", () => {
        assert.equal(isQuestionCorrect(new Set(["a"]), new Set(["a"])), true);
    });

    test("single answer, wrong", () => {
        assert.equal(isQuestionCorrect(new Set(["b"]), new Set(["a"])), false);
    });

    test("multiple answer, complete, is right", () => {
        assert.equal(isQuestionCorrect(new Set(["a", "b"]), new Set(["a", "b"])), true);
    });

    test("multiple answer, partial, does not count", () => {
        assert.equal(isQuestionCorrect(new Set(["a"]), new Set(["a", "b"])), false);
    });

    test("multiple answer with an extra option does not count", () => {
        assert.equal(isQuestionCorrect(new Set(["a", "b", "c"]), new Set(["a", "b"])), false);
    });

    test("blank does not count", () => {
        assert.equal(isQuestionCorrect(new Set(), new Set(["a"])), false);
    });

    test("a question without an answer key is never correct", () => {
        assert.equal(isQuestionCorrect(new Set(["a"]), new Set()), false);
    });
});

describe("gradePracticeExam", () => {
    const questions = [
        { id: "q1", corretas: new Set(["a"]) },
        { id: "q2", corretas: new Set(["a", "b"]) },
        { id: "q3", corretas: new Set(["c"]) },
    ];

    test("all right is 100 and passes", () => {
        const r = gradePracticeExam(
            questions,
            new Map([
                ["q1", new Set(["a"])],
                ["q2", new Set(["a", "b"])],
                ["q3", new Set(["c"])],
            ]),
            70,
        );
        assert.deepEqual(r, { acertos: 3, total: 3, score: 100, passed: true });
    });

    test("a partial multiple answer fails the question", () => {
        const r = gradePracticeExam(
            questions,
            new Map([
                ["q1", new Set(["a"])],
                ["q2", new Set(["a"])], // b is missing
                ["q3", new Set(["c"])],
            ]),
            70,
        );
        assert.equal(r.acertos, 2);
        assert.equal(r.score, 67);
        assert.equal(r.passed, false);
    });

    test("unanswered questions count as wrong", () => {
        const r = gradePracticeExam(questions, new Map(), 70);
        assert.deepEqual(r, { acertos: 0, total: 3, score: 0, passed: false });
    });

    test("an exact cut of 70 passes", () => {
        const ten = Array.from({ length: 10 }, (_, i) => ({
            id: `q${i}`,
            corretas: new Set([`o${i}`]),
        }));
        const answers = new Map(ten.slice(0, 7).map((q) => [q.id, new Set([`o${q.id.slice(1)}`])]));
        const r = gradePracticeExam(ten, answers, 70);
        assert.equal(r.score, 70);
        assert.equal(r.passed, true);
    });

    test("an empty exam does not pass", () => {
        assert.deepEqual(gradePracticeExam([], new Map(), 70), {
            acertos: 0,
            total: 0,
            score: 0,
            passed: false,
        });
    });
});

describe("summaryByTopic", () => {
    test("groups only topics with mistakes, most missed first", () => {
        const r = summaryByTopic([
            { topic: "A", correta: false },
            { topic: "A", correta: false },
            { topic: "A", correta: true },
            { topic: "B", correta: false },
            { topic: "C", correta: true },
        ]);
        assert.deepEqual(r, [
            { topic: "A", erradas: 2, total: 3 },
            { topic: "B", erradas: 1, total: 1 },
        ]);
    });

    test("all right returns an empty list", () => {
        assert.deepEqual(summaryByTopic([{ topic: "A", correta: true }]), []);
    });

    test("a null topic becomes Outros", () => {
        assert.deepEqual(summaryByTopic([{ topic: null, correta: false }]), [
            { topic: "Outros", erradas: 1, total: 1 },
        ]);
    });
});
