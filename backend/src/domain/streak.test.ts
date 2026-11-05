import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeStreak, weekActivity, previousDay } from "./streak.ts";

const TODAY = "2026-07-01";

describe("computeStreak", () => {
    test("no active days is 0", () => {
        assert.equal(computeStreak(new Set(), TODAY), 0);
    });

    test("only today counts 1", () => {
        assert.equal(computeStreak(new Set([TODAY]), TODAY), 1);
    });

    test("only yesterday (without today) still counts 1", () => {
        assert.equal(computeStreak(new Set(["2026-06-30"]), TODAY), 1);
    });

    test("today and yesterday count 2", () => {
        assert.equal(computeStreak(new Set(["2026-07-01", "2026-06-30"]), TODAY), 2);
    });

    test("neither today nor yesterday is 0", () => {
        assert.equal(computeStreak(new Set(["2026-06-28"]), TODAY), 0);
    });

    test("a gap breaks the count", () => {
        // today active, yesterday not, the day before active: only today counts
        assert.equal(computeStreak(new Set(["2026-07-01", "2026-06-29"]), TODAY), 1);
    });

    test("crosses a month boundary", () => {
        assert.equal(computeStreak(new Set(["2026-07-01", "2026-06-30", "2026-06-29"]), TODAY), 3);
    });

    test("crosses a year boundary", () => {
        assert.equal(
            computeStreak(new Set(["2026-01-01", "2025-12-31", "2025-12-30"]), "2026-01-01"),
            3,
        );
    });

    test("a day in the future is ignored", () => {
        assert.equal(computeStreak(new Set(["2026-07-02", "2026-07-01"]), TODAY), 1);
    });
});

describe("previousDay", () => {
    test("regular day", () => {
        assert.equal(previousDay("2026-07-01"), "2026-06-30");
    });

    test("year boundary", () => {
        assert.equal(previousDay("2026-01-01"), "2025-12-31");
    });

    test("February in a non-leap year", () => {
        assert.equal(previousDay("2026-03-01"), "2026-02-28");
    });

    test("February in a leap year", () => {
        assert.equal(previousDay("2024-03-01"), "2024-02-29");
    });
});

describe("weekActivity", () => {
    test("returns 7 days ending today", () => {
        const week = weekActivity(new Set([TODAY]), TODAY);
        assert.equal(week.length, 7);
        assert.equal(week[6].active, true); // the last one is today
    });

    test("marks as active only the days inside the window", () => {
        const week = weekActivity(new Set(["2026-07-01", "2026-06-29", "2026-05-01"]), TODAY);
        // 07-01 and 06-29 fall in the last 7 days; 05-01 does not
        assert.equal(week.filter((d) => d.active).length, 2);
    });

    test("labels are weekday initials", () => {
        const week = weekActivity(new Set(), TODAY);
        assert.ok(week.every((d) => "DSTQ".includes(d.label)));
    });
});
