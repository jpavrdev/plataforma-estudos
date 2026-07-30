// Camada de IA do analisador. Nunca produz nota: reescreve as sugestões e revisa
// as palavras-chave de fronteira. Qualquer falha vira null e a análise segue com
// o resultado da heurística.
//
// ATS_IA_MODO escolhe o transporte. "cli" chama o Claude Code headless pela
// assinatura da máquina, então só vale local, fora do container. "api" fala o
// protocolo da Anthropic e é o modo de produção; com ATS_API_BASE_URL ele aponta
// para outro provedor que exponha o mesmo formato, como o DeepSeek.

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env.ts";
import type { Prioridade, ResultadoAnalise, Sugestao } from "./heuristica.ts";

export interface Refinamento {
    sugestoes: Sugestao[];
    encontradas: string[];
    parciais: string[];
    ausentes: string[];
}

const INSTRUCOES = `Você é um recrutador técnico brasileiro que revisa currículos para vagas de tecnologia e conhece como um ATS lê um currículo.

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

const ESQUEMA = {
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

export function iaAtiva(): boolean {
    if (env.ATS_IA_MODO === "cli") return true;
    return env.ATS_IA_MODO === "api" && Boolean(env.ATS_API_KEY);
}

export async function refinar(
    vaga: string,
    curriculo: string,
    base: ResultadoAnalise,
): Promise<Refinamento | null> {
    if (!iaAtiva()) return null;

    const mensagem = montarMensagem(vaga, curriculo, base);
    try {
        const texto = env.ATS_IA_MODO === "cli" ? await viaCli(mensagem) : await viaApi(mensagem);
        return texto ? interpretar(texto) : null;
    } catch (err) {
        console.error("Refinamento da análise de currículo falhou:", err);
        return null;
    }
}

function montarMensagem(vaga: string, curriculo: string, base: ResultadoAnalise): string {
    const sugestoes = base.sugestoes
        .map((s) => `- [${s.prioridade}] ${s.titulo}: ${s.texto}`)
        .join("\n");
    return `=== VAGA ===
${vaga}

=== CURRÍCULO ===
${curriculo}

=== ANÁLISE AUTOMÁTICA ===
Nota geral: ${base.score}
Palavras-chave encontradas: ${base.encontradas.join(", ") || "(nenhuma)"}
Palavras-chave parciais: ${base.parciais.join(", ") || "(nenhuma)"}
Palavras-chave ausentes: ${base.ausentes.join(", ") || "(nenhuma)"}
Sugestões iniciais:
${sugestoes}`;
}

let cliente: Anthropic | null = null;

async function viaApi(mensagem: string): Promise<string | null> {
    cliente ??= new Anthropic({
        apiKey: env.ATS_API_KEY,
        baseURL: env.ATS_API_BASE_URL,
        timeout: env.ATS_TIMEOUT_S * 1000,
    });

    // Fora da Anthropic, o endpoint compatível costuma ignorar ou recusar esses
    // dois: o DeepSeek só aceita `effort` em output_config e já vem com o próprio
    // modo de raciocínio ligado. Sem o schema a saída deixa de ser JSON garantido,
    // e é o parser tolerante (o mesmo do modo cli) que segura.
    let hostApiBaseUrl = "";
    try {
        hostApiBaseUrl = new URL(env.ATS_API_BASE_URL).hostname.toLowerCase();
    } catch {
        hostApiBaseUrl = "";
    }
    const soAnthropic = hostApiBaseUrl === "api.anthropic.com"
        ? {
              thinking: { type: "adaptive" as const },
              output_config: { format: { type: "json_schema" as const, schema: ESQUEMA } },
          }
        : {};

    const resposta = await cliente.messages.create({
        model: env.ATS_MODELO,
        max_tokens: 8000,
        // As instruções são idênticas em toda análise; o cache corta o custo delas.
        system: [{ type: "text", text: INSTRUCOES, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: mensagem }],
        ...soAnthropic,
    });

    if (resposta.stop_reason === "refusal") {
        console.error("Refinamento recusado pelo modelo:", resposta.stop_details);
        return null;
    }
    const bloco = resposta.content.find((b) => b.type === "text");
    return bloco?.type === "text" ? bloco.text : null;
}

function viaCli(mensagem: string): Promise<string | null> {
    return new Promise((resolve) => {
        const args = ["-p", "--output-format", "json"];
        if (env.ATS_MODELO_CLI) args.push("--model", env.ATS_MODELO_CLI);

        // cwd neutro: de dentro do projeto o CLI carregaria o CLAUDE.md do repositório.
        const processo = spawn("claude", args, { cwd: tmpdir(), stdio: ["pipe", "pipe", "pipe"] });

        let saida = "";
        let erro = "";
        const prazo = setTimeout(() => processo.kill("SIGKILL"), env.ATS_TIMEOUT_S * 1000);

        processo.stdout.on("data", (d) => (saida += d));
        processo.stderr.on("data", (d) => (erro += d));
        processo.on("error", (e) => {
            clearTimeout(prazo);
            console.error("Não foi possível executar o Claude Code:", e.message);
            resolve(null);
        });
        processo.on("close", (codigo) => {
            clearTimeout(prazo);
            if (codigo !== 0) {
                console.error(`Claude Code saiu com código ${codigo}:`, erro.slice(0, 300));
                return resolve(null);
            }
            resolve(extrairResultadoCli(saida));
        });

        processo.stdin.end(`${INSTRUCOES}\n\n${mensagem}`);
    });
}

// O modo headless embrulha a resposta num envelope; o texto vem em "result".
function extrairResultadoCli(saida: string): string | null {
    if (!saida.trim()) return null;
    try {
        const envelope = JSON.parse(saida) as { is_error?: boolean; result?: unknown };
        if (envelope.is_error) return null;
        return typeof envelope.result === "string" ? envelope.result : null;
    } catch {
        return saida;
    }
}

const PRIORIDADES = new Set<Prioridade>(["alta", "media", "baixa"]);

// O prompt pede para não usar travessão nem emoji, mas nem todo modelo obedece.
// Aqui a regra deixa de depender disso.
function limpar(texto: string): string {
    return (
        texto
            // Entre números é faixa ("10–20", "2h–35min"), não pontuação: vira hífen.
            .replace(/(\d\p{L}*)\s*[—–]\s*(\d)/gu, "$1-$2")
            .replace(/\s*[—–]\s*/g, ", ")
            .replace(/\p{Extended_Pictographic}/gu, "")
            .replace(/\s{2,}/g, " ")
            .replace(/[,\s]+$/, "")
            .trim()
    );
}

// Recorta do primeiro { ao último }: o modo api devolve JSON puro pelo schema,
// mas o cli pode vir com prosa em volta.
function interpretar(texto: string): Refinamento | null {
    const inicio = texto.indexOf("{");
    const fim = texto.lastIndexOf("}");
    if (inicio < 0 || fim <= inicio) return null;

    let bruto: Record<string, unknown>;
    try {
        bruto = JSON.parse(texto.slice(inicio, fim + 1)) as Record<string, unknown>;
    } catch (err) {
        console.error("Resposta do refinamento não é JSON válido:", err);
        return null;
    }

    const sugestoes = (Array.isArray(bruto.sugestoes) ? bruto.sugestoes : [])
        .map((s) => s as Record<string, unknown>)
        .filter((s) => typeof s.titulo === "string" && s.titulo.trim().length > 0)
        .map<Sugestao>((s) => ({
            prioridade: PRIORIDADES.has(s.prioridade as Prioridade)
                ? (s.prioridade as Prioridade)
                : "media",
            titulo: limpar(String(s.titulo)),
            texto: typeof s.texto === "string" ? limpar(s.texto) : "",
        }))
        .filter((s) => s.titulo.length > 0)
        .slice(0, 5);

    return {
        sugestoes,
        encontradas: listaDeTextos(bruto.encontradas),
        parciais: listaDeTextos(bruto.parciais),
        ausentes: listaDeTextos(bruto.ausentes),
    };
}

function listaDeTextos(valor: unknown): string[] {
    return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === "string") : [];
}
