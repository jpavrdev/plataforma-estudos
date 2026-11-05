import { env } from "../config/env.ts";
import { AppError } from "../errors/AppError.ts";

export interface CaseResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
}

export interface RunnerResponse {
    // Compile/setup error (visible to the student); null when it compiled.
    compileOutput: string | null;
    results: CaseResult[];
}

// Calls the runner service, which executes the code in isolated containers. The runner
// is internal (compose network), so the backend never talks to Docker directly.
// mode "function" attaches a driver that calls entryPoint with each case's args.
export async function runOnRunner(
    language: string,
    code: string,
    inputs: string[],
    mode: "stdin" | "function" = "stdin",
    entryPoint: string | null = null,
): Promise<RunnerResponse> {
    let response: Response;
    try {
        response = await fetch(`${env.RUNNER_URL}/run`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ language, code, stdins: inputs, mode, entryPoint }),
            signal: AbortSignal.timeout(60_000),
        });
    } catch (e) {
        console.error("runner unavailable:", e);
        throw new AppError(503, "runner.unavailable");
    }
    if (!response.ok) {
        throw new AppError(503, "runner.failed");
    }
    return (await response.json()) as RunnerResponse;
}
