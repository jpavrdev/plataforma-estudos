import { env } from "../config/env.ts";
import { AppError } from "../errors/AppError.ts";

export interface CasoResultado {
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
}

export interface RunnerResposta {
    // Erro de compilação/setup (visível ao aluno); null quando compilou.
    compileOutput: string | null;
    results: CasoResultado[];
}

// Chama o serviço runner, que executa o código em containers isolados. O runner
// é interno (rede do compose), então o backend nunca fala com o Docker direto.
// mode "function" anexa um driver que chama entryPoint com os args de cada caso.
export async function executarNoRunner(
    language: string,
    code: string,
    entradas: string[],
    mode: "stdin" | "function" = "stdin",
    entryPoint: string | null = null,
): Promise<RunnerResposta> {
    let resp: Response;
    try {
        resp = await fetch(`${env.RUNNER_URL}/run`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ language, code, stdins: entradas, mode, entryPoint }),
            signal: AbortSignal.timeout(60_000),
        });
    } catch (e) {
        console.error("runner indisponível:", e);
        throw new AppError(
            503,
            "O executor de código está indisponível. Tente de novo em instantes.",
        );
    }
    if (!resp.ok) {
        throw new AppError(503, "O executor de código falhou. Tente de novo.");
    }
    return (await resp.json()) as RunnerResposta;
}
