// AI layer of the analyzer. Never produces the score: it rewrites the
// suggestions and reviews the boundary keywords. Any failure becomes null and
// the analysis carries on with the heuristic result.
//
// ATS_IA_MODO picks the transport. "cli" calls Claude Code headless through the
// machine's subscription, so it only works locally, outside the container.
// "api" speaks the Anthropic protocol and is the production mode; with
// ATS_API_BASE_URL it points at another provider exposing the same format,
// such as DeepSeek.

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env.ts";
import type { Priority, AnalysisResult, Suggestion } from "./heuristic.ts";

export interface Refinement {
    sugestoes: Suggestion[];
    encontradas: string[];
    parciais: string[];
    ausentes: string[];
}

const INSTRUCTIONS = `Você é um recrutador técnico brasileiro que revisa currículos para vagas de tecnologia e conhece como um ATS lê um currículo.

Recebe uma vaga, o texto de um currículo e o resultado de uma análise automática (nota, palavras-chave já classificadas e sugestões iniciais).

Sua tarefa:
1. Reescreva as sugestões em português do Brasil, no máximo 5, mantendo a prioridade que veio ("alta", "media" ou "baixa").
2. Revise a classificação das palavras-chave lendo o currículo: encontradas (aparece de verdade), parciais (citada de passagem, sem nenhum contexto de uso) e ausentes. Use exatamente as mesmas grafias que recebeu e não invente termo novo: toda palavra-chave recebida precisa sair em exatamente uma das três listas. Tecnologia que aparece só como item de uma lista de habilidades, sem nenhuma entrega associada, é parcial, não encontrada.

O currículo é a única informação que você tem sobre essa pessoa. Trabalhe com o que está escrito lá, não com hipóteses sobre o que ela talvez saiba. Cada sugestão precisa:
- Citar um trecho literal do currículo, entre aspas, ou dizer que o termo não aparece em lugar nenhum.
- Dizer o que escrever no lugar, de preferência com o texto pronto para colar.
- Ter título que anuncia o achado, não o nome da tecnologia. "NoSQL só aparece disfarçado de Redis" é título. "Bancos de dados NoSQL" não é.

Não escreva sugestão no formato "se você tem experiência com X, inclua X". Isso é a pessoa fazendo o seu trabalho. Condicional só cabe no fim, para o caso de ela realmente nunca ter usado aquilo, e aí diga o que fazer no lugar. Procure também o que a pessoa fez mas não nomeou: quem conduz revisão de PR e cerimônia semanal trabalha em time ágil sem escrever "ágil", quem roda teste em container usa Docker sem escrever Docker.

Exemplo do que NÃO fazer:
{"prioridade":"alta","titulo":"Testes automatizados com JUnit","texto":"A vaga pede testes com JUnit e Mockito. Se já usou JUnit em projetos Java, adicione essa experiência ao currículo."}

Exemplo do que fazer:
{"prioridade":"alta","titulo":"Nomeie JUnit e Mockito ao lado do xUnit","texto":"Você escreveu '498+ testes (xUnit + FluentAssertions + Testcontainers)', que é exatamente o que a vaga quer, só que com outro nome. Escreva a equivalência no item de testes: 'xUnit + Moq (equivalente a JUnit + Mockito)'. O filtro procura a string JUnit e hoje não acha nada."}

Como escrever: frase direta, do jeito que uma pessoa falaria. Nada de emoji, de travessão (— ou –) e de reticências no meio da frase. Onde caberia travessão, use vírgula, dois-pontos, parênteses ou ponto final. Evite os vícios de texto de IA: abrir com "Além disso", "Vale destacar", "É importante ressaltar", fechar com resumo do que acabou de dizer, ou encher de adjetivo. Vá ao ponto e pare quando terminar.

Não recalcule a nota. Responda só com o objeto JSON, sem texto em volta:
{"sugestoes":[{"prioridade":"alta|media|baixa","titulo":"...","texto":"..."}],"encontradas":["..."],"parciais":["..."],"ausentes":["..."]}`;

const SCHEMA = {
    type: "object",
    properties: {
        sugestoes: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    prioridade: { type: "string", enum: ["alta", "media", "baixa"] },
                    titulo: { type: "string" },
                    texto: { type: "string" },
                },
                required: ["prioridade", "titulo", "texto"],
                additionalProperties: false,
            },
        },
        encontradas: { type: "array", items: { type: "string" } },
        parciais: { type: "array", items: { type: "string" } },
        ausentes: { type: "array", items: { type: "string" } },
    },
    required: ["sugestoes", "encontradas", "parciais", "ausentes"],
    additionalProperties: false,
} as const;

export function aiEnabled(): boolean {
    if (env.ATS_IA_MODO === "cli") return true;
    return env.ATS_IA_MODO === "api" && Boolean(env.ATS_API_KEY);
}

export async function refine(
    job: string,
    resume: string,
    base: AnalysisResult,
): Promise<Refinement | null> {
    if (!aiEnabled()) return null;

    const message = buildMessage(job, resume, base);
    try {
        const text = env.ATS_IA_MODO === "cli" ? await viaCli(message) : await viaApi(message);
        return text ? parse(text) : null;
    } catch (err) {
        console.error("Resume analysis refinement failed:", err);
        return null;
    }
}

function buildMessage(job: string, resume: string, base: AnalysisResult): string {
    const sugestoes = base.sugestoes
        .map((s) => `- [${s.prioridade}] ${s.titulo}: ${s.texto}`)
        .join("\n");
    return `=== VAGA ===
${job}

=== CURRÍCULO ===
${resume}

=== ANÁLISE AUTOMÁTICA ===
Nota geral: ${base.score}
Palavras-chave encontradas: ${base.encontradas.join(", ") || "(nenhuma)"}
Palavras-chave parciais: ${base.parciais.join(", ") || "(nenhuma)"}
Palavras-chave ausentes: ${base.ausentes.join(", ") || "(nenhuma)"}
Sugestões iniciais:
${sugestoes}`;
}

let client: Anthropic | null = null;

async function viaApi(message: string): Promise<string | null> {
    client ??= new Anthropic({
        apiKey: env.ATS_API_KEY,
        baseURL: env.ATS_API_BASE_URL,
        timeout: env.ATS_TIMEOUT_S * 1000,
    });

    // Outside Anthropic, the compatible endpoint usually ignores or rejects
    // these two: DeepSeek only accepts `effort` in output_config and already
    // ships with its own reasoning mode on. Without the schema the output is no
    // longer guaranteed JSON, and it is the tolerant parser (the same one as
    // cli mode) that holds the line.
    let hostApiBaseUrl: string;
    try {
        hostApiBaseUrl = new URL(env.ATS_API_BASE_URL).hostname.toLowerCase();
    } catch {
        hostApiBaseUrl = "";
    }
    const anthropicOnly =
        hostApiBaseUrl === "api.anthropic.com"
            ? {
                  thinking: { type: "adaptive" as const },
                  output_config: { format: { type: "json_schema" as const, schema: SCHEMA } },
              }
            : {};

    const response = await client.messages.create({
        model: env.ATS_MODELO,
        max_tokens: 8000,
        // The instructions are identical on every analysis; caching cuts their cost.
        system: [{ type: "text", text: INSTRUCTIONS, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: message }],
        ...anthropicOnly,
    });

    if (response.stop_reason === "refusal") {
        console.error("Refinement refused by the model:", response.stop_details);
        return null;
    }
    const block = response.content.find((b) => b.type === "text");
    return block?.type === "text" ? block.text : null;
}

function viaCli(message: string): Promise<string | null> {
    return new Promise((resolve) => {
        const args = ["-p", "--output-format", "json"];
        if (env.ATS_MODELO_CLI) args.push("--model", env.ATS_MODELO_CLI);

        // neutral cwd: from inside the project the CLI would load the repo's CLAUDE.md.
        const child = spawn("claude", args, { cwd: tmpdir(), stdio: ["pipe", "pipe", "pipe"] });

        let output = "";
        let errText = "";
        const timer = setTimeout(() => child.kill("SIGKILL"), env.ATS_TIMEOUT_S * 1000);

        child.stdout.on("data", (d) => (output += d));
        child.stderr.on("data", (d) => (errText += d));
        child.on("error", (e) => {
            clearTimeout(timer);
            console.error("Could not run Claude Code:", e.message);
            resolve(null);
        });
        child.on("close", (code) => {
            clearTimeout(timer);
            if (code !== 0) {
                console.error(`Claude Code exited with code ${code}:`, errText.slice(0, 300));
                return resolve(null);
            }
            resolve(extractCliResult(output));
        });

        child.stdin.end(`${INSTRUCTIONS}\n\n${message}`);
    });
}

// Headless mode wraps the answer in an envelope; the text lives in "result".
function extractCliResult(output: string): string | null {
    if (!output.trim()) return null;
    try {
        const envelope = JSON.parse(output) as { is_error?: boolean; result?: unknown };
        if (envelope.is_error) return null;
        return typeof envelope.result === "string" ? envelope.result : null;
    } catch {
        return output;
    }
}

const PRIORITIES = new Set<Priority>(["alta", "media", "baixa"]);

// The prompt asks for no dash and no emoji, but not every model obeys.
// Here the rule stops depending on that.
function clean(text: string): string {
    return (
        text
            // Between numbers it is a range ("10–20", "2h–35min"), not punctuation: becomes a hyphen.
            .replace(/(\d\p{L}*)\s*[—–]\s*(\d)/gu, "$1-$2")
            .replace(/\s*[—–]\s*/g, ", ")
            .replace(/\p{Extended_Pictographic}/gu, "")
            .replace(/\s{2,}/g, " ")
            .replace(/[,\s]+$/, "")
            .trim()
    );
}

// Cuts from the first { to the last }: api mode returns pure JSON via the schema,
// but cli can come with prose around it.
function parse(text: string): Refinement | null {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;

    let raw: Record<string, unknown>;
    try {
        raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    } catch (err) {
        console.error("Refinement response is not valid JSON:", err);
        return null;
    }

    const sugestoes = (Array.isArray(raw.sugestoes) ? raw.sugestoes : [])
        .map((s) => s as Record<string, unknown>)
        .filter((s) => typeof s.titulo === "string" && s.titulo.trim().length > 0)
        .map<Suggestion>((s) => ({
            prioridade: PRIORITIES.has(s.prioridade as Priority)
                ? (s.prioridade as Priority)
                : "media",
            titulo: clean(String(s.titulo)),
            texto: typeof s.texto === "string" ? clean(s.texto) : "",
        }))
        .filter((s) => s.titulo.length > 0)
        .slice(0, 5);

    return {
        sugestoes,
        encontradas: stringList(raw.encontradas),
        parciais: stringList(raw.parciais),
        ausentes: stringList(raw.ausentes),
    };
}

function stringList(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
