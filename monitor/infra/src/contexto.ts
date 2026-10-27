import type { Node } from "constructs";

export const PARAMETRO_TOKEN_PADRAO = "/ensinadev/monitor/token";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOME_DE_PARAMETRO = /^[\w./-]+$/;

export interface ContextoDoMonitor {
    readonly emailAlertas: string;
    readonly parametroToken: string;
}

export function lerContexto(no: Node): ContextoDoMonitor {
    const emailAlertas: unknown = no.tryGetContext("emailAlertas");
    if (emailAlertas === undefined || emailAlertas === "") {
        throw new Error(
            "Falta o email que recebe os alertas. Passe no contexto: npx cdk synth -c emailAlertas=voce@exemplo.com",
        );
    }
    if (typeof emailAlertas !== "string" || !EMAIL.test(emailAlertas)) {
        throw new Error(`O contexto emailAlertas não é um email válido: ${String(emailAlertas)}`);
    }

    const parametroToken: unknown = no.tryGetContext("parametroToken") ?? PARAMETRO_TOKEN_PADRAO;
    if (typeof parametroToken !== "string" || !NOME_DE_PARAMETRO.test(parametroToken)) {
        throw new Error(
            `O contexto parametroToken não é um nome de parâmetro do SSM: ${String(parametroToken)}`,
        );
    }

    return { emailAlertas, parametroToken };
}
