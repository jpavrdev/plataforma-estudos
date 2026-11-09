// Pure streak logic. It receives the active days (YYYY-MM-DD) and an already
// resolved "today", so it is deterministic and testable, with no clock or time zone.

const LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"]; // Sunday..Saturday, Portuguese initials

// The day before a YYYY-MM-DD date, in UTC arithmetic.
export function previousDay(day: string): string {
    return new Date(Date.parse(day + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
}

// The day after a YYYY-MM-DD date, in UTC arithmetic.
export function nextDay(day: string): string {
    return new Date(Date.parse(day + "T00:00:00Z") + 86400000).toISOString().slice(0, 10);
}

// Longest run of consecutive active days, at any time (the record).
// Unlike computeStreak, which only counts the run that ends today or yesterday.
export function longestStreak(days: Set<string>): number {
    let record = 0;
    for (const d of days) {
        // Only start from the beginning of a run (a day whose previous day is not active).
        if (days.has(previousDay(d))) continue;
        let n = 0;
        let cursor = d;
        while (days.has(cursor)) {
            n++;
            cursor = nextDay(cursor);
        }
        record = Math.max(record, n);
    }
    return record;
}

// Consecutive days ending today (or yesterday, if there was no activity today yet).
export function computeStreak(days: Set<string>, today: string): number {
    if (days.size === 0) return 0;
    let cursor = today;
    if (!days.has(cursor)) {
        cursor = previousDay(cursor);
        if (!days.has(cursor)) return 0;
    }
    let n = 0;
    while (days.has(cursor)) {
        n++;
        cursor = previousDay(cursor);
    }
    return n;
}

// Last 7 days (oldest -> today) with an activity flag, for the home card.
export function weekActivity(
    days: Set<string>,
    today: string,
): { label: string; active: boolean }[] {
    const last7: string[] = [];
    let cursor = today;
    for (let i = 0; i < 7; i++) {
        last7.unshift(cursor);
        cursor = previousDay(cursor);
    }
    return last7.map((d) => ({
        label: LETTERS[new Date(d + "T00:00:00Z").getUTCDay()],
        active: days.has(d),
    }));
}
