import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { periodsOverlap, isValidPeriod, raffleStatus } from "./raffle.ts";

const date = (iso: string) => new Date(iso);
const START = date("2026-11-01T12:00:00Z");
const END = date("2026-11-08T12:00:00Z");
const raffle = { inicio: START, fim: END, sorteadoEm: null };

describe("raffleStatus", () => {
    test("before the start it is scheduled", () => {
        assert.equal(raffleStatus(raffle, date("2026-11-01T11:59:59.999Z")), "agendado");
    });

    test("the start instant is already open", () => {
        assert.equal(raffleStatus(raffle, START), "aberto");
    });

    test("it stays open up to the last millisecond before the end", () => {
        assert.equal(raffleStatus(raffle, date("2026-11-08T11:59:59.999Z")), "aberto");
    });

    test("the end instant is already closed", () => {
        assert.equal(raffleStatus(raffle, END), "encerrado");
    });

    test("after the end, without a draw, it stays closed", () => {
        assert.equal(raffleStatus(raffle, date("2027-01-01T00:00:00Z")), "encerrado");
    });

    test("with sorteado_em set it is drawn, whatever the time", () => {
        const drawn = { ...raffle, sorteadoEm: date("2026-11-08T13:00:00Z") };
        assert.equal(raffleStatus(drawn, date("2026-11-08T13:00:00Z")), "sorteado");
        assert.equal(raffleStatus(drawn, START), "sorteado");
    });
});

describe("isValidPeriod", () => {
    test("end after start", () => {
        assert.equal(isValidPeriod({ inicio: START, fim: END }), true);
    });

    test("end equal to or before start", () => {
        assert.equal(isValidPeriod({ inicio: START, fim: START }), false);
        assert.equal(isValidPeriod({ inicio: END, fim: START }), false);
    });
});

describe("periodsOverlap", () => {
    const period = (start: string, end: string) => ({ inicio: date(start), fim: date(end) });
    const base = period("2026-11-01T00:00:00Z", "2026-11-10T00:00:00Z");

    test("partial overlap, on either side", () => {
        const after = period("2026-11-09T00:00:00Z", "2026-11-20T00:00:00Z");
        assert.equal(periodsOverlap(base, after), true);
        assert.equal(periodsOverlap(after, base), true);
    });

    test("one inside the other, and equal periods", () => {
        const inside = period("2026-11-03T00:00:00Z", "2026-11-04T00:00:00Z");
        assert.equal(periodsOverlap(base, inside), true);
        assert.equal(periodsOverlap(inside, base), true);
        assert.equal(periodsOverlap(base, base), true);
    });

    test("one ends at the instant the other starts: no overlap", () => {
        const adjacent = period("2026-11-10T00:00:00Z", "2026-11-20T00:00:00Z");
        assert.equal(periodsOverlap(base, adjacent), false);
        assert.equal(periodsOverlap(adjacent, base), false);
    });

    test("separate periods do not overlap", () => {
        const far = period("2026-12-01T00:00:00Z", "2026-12-02T00:00:00Z");
        assert.equal(periodsOverlap(base, far), false);
    });
});
