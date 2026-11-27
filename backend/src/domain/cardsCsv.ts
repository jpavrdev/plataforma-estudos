const BYTE_ORDER_MARK = "﻿";
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

const neutralizeFormula = (field: string) => (FORMULA_TRIGGER.test(field) ? `'${field}` : field);

const quoteWhenNeeded = (field: string) =>
    NEEDS_QUOTES.test(field) ? `"${field.replace(/"/g, '""')}"` : field;

const csvField = (field: string) => quoteWhenNeeded(neutralizeFormula(field));

export function renderCardsCsv(header: string[], rows: string[][]): string {
    const lines = [header, ...rows].map((row) => row.map(csvField).join(","));
    return `${BYTE_ORDER_MARK}${lines.join("\r\n")}\r\n`;
}
