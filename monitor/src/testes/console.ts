import type { TestContext } from "node:test";
import { format } from "node:util";

export function capturarConsole(t: TestContext): string[] {
    const linhas: string[] = [];
    for (const metodo of ["log", "info", "warn", "error", "debug"] as const) {
        t.mock.method(console, metodo, (...argumentos: unknown[]) => {
            linhas.push(format(...argumentos));
        });
    }
    return linhas;
}
