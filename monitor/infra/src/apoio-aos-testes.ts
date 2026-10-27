import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import type { CfnRole } from "aws-cdk-lib/aws-iam";
import type { CfnFunction } from "aws-cdk-lib/aws-lambda";
import type { FuncaoDeVerificacao } from "./funcao-de-verificacao.ts";
import { MonitorStack } from "./monitor-stack.ts";

export const EMAIL_DE_TESTE = "alertas@example.com";

export interface Sintese {
    readonly stack: MonitorStack;
    readonly template: Template;
}

export interface Declaracao {
    readonly Effect: string;
    readonly Action: string | string[];
    readonly Principal?: unknown;
    readonly Resource?: unknown;
    readonly Condition?: Record<string, Record<string, unknown>>;
}

export interface Politica {
    readonly Properties: {
        readonly Roles: { readonly Ref?: string }[];
        readonly PolicyDocument: { readonly Statement: Declaracao[] };
    };
}

export interface Papel {
    readonly Properties: {
        readonly AssumeRolePolicyDocument: { readonly Statement: Declaracao[] };
        readonly Policies?: unknown[];
        readonly ManagedPolicyArns?: unknown[];
    };
}

export interface Funcao {
    readonly Properties: {
        readonly Timeout: number;
        readonly MemorySize: number;
        readonly Architectures: string[];
        readonly Role: { readonly "Fn::GetAtt": [string, string] };
        readonly LoggingConfig: { readonly LogGroup: { readonly Ref: string } };
        readonly Environment: { readonly Variables: Record<string, unknown> };
    };
}

export interface Agenda {
    readonly Properties: {
        readonly ScheduleExpression: string;
        readonly Target: {
            readonly Arn: { readonly "Fn::GetAtt": [string, string] };
            readonly RoleArn: { readonly "Fn::GetAtt": [string, string] };
        };
    };
}

export function sintetizar(parametroToken = "/ensinadev/monitor/token"): Sintese {
    const raiz = criarRaizProvisoria();
    try {
        const app = new App({
            context: { ...contextoDoCdkJson(), "aws:cdk:bundling-stacks": [] },
        });
        const stack = new MonitorStack(app, "MonitorStack", {
            emailAlertas: EMAIL_DE_TESTE,
            parametroToken,
            raizDoMonitor: raiz,
        });
        return { stack, template: Template.fromStack(stack) };
    } finally {
        rmSync(raiz, { recursive: true, force: true });
    }
}

export function idDaFuncao(stack: MonitorStack, verificacao: FuncaoDeVerificacao): string {
    return stack.getLogicalId(verificacao.funcao.node.defaultChild as CfnFunction);
}

export function idDoPapel(stack: MonitorStack, verificacao: FuncaoDeVerificacao): string {
    return stack.getLogicalId(verificacao.papel.node.defaultChild as CfnRole);
}

export function recursos<T>(template: Template, tipo: string): Record<string, T> {
    return template.findResources(tipo) as Record<string, T>;
}

export function recurso<T>(template: Template, tipo: string, id: string): T {
    const encontrado = recursos<T>(template, tipo)[id];
    if (encontrado === undefined) throw new Error(`${tipo} ${id} não está no template`);
    return encontrado;
}

export function idUnico(template: Template, tipo: string): string {
    const ids = Object.keys(recursos(template, tipo));
    if (ids.length !== 1 || ids[0] === undefined) {
        throw new Error(`esperava um único ${tipo}, achei ${ids.length}`);
    }
    return ids[0];
}

export function declaracoesDoPapel(template: Template, idDoPapel: string): Declaracao[] {
    return Object.values(recursos<Politica>(template, "AWS::IAM::Policy"))
        .filter((politica) => politica.Properties.Roles.some((ref) => ref.Ref === idDoPapel))
        .flatMap((politica) => politica.Properties.PolicyDocument.Statement);
}

export function todasAsDeclaracoes(template: Template): Declaracao[] {
    return Object.values(recursos<Politica>(template, "AWS::IAM::Policy")).flatMap(
        (politica) => politica.Properties.PolicyDocument.Statement,
    );
}

export function acoes(declaracoes: readonly Declaracao[]): string[] {
    const todas = declaracoes.flatMap((declaracao) => listar(declaracao.Action));
    return [...new Set(todas)].sort();
}

export function declaracaoCom(declaracoes: readonly Declaracao[], acao: string): Declaracao {
    const encontradas = declaracoes.filter((declaracao) => listar(declaracao.Action).includes(acao));
    const [unica] = encontradas;
    if (encontradas.length !== 1 || unica === undefined) {
        throw new Error(`esperava uma declaração com ${acao}, achei ${encontradas.length}`);
    }
    return unica;
}

export function listar<T>(valor: T | T[] | undefined): T[] {
    if (valor === undefined) return [];
    return Array.isArray(valor) ? valor : [valor];
}

function contextoDoCdkJson(): Record<string, unknown> {
    const cdkJson = JSON.parse(readFileSync(new URL("../cdk.json", import.meta.url), "utf8")) as {
        context: Record<string, unknown>;
    };
    return cdkJson.context;
}

function criarRaizProvisoria(): string {
    const raiz = mkdtempSync(path.join(tmpdir(), "monitor-infra-"));
    mkdirSync(path.join(raiz, "src", "handlers"), { recursive: true });
    writeFileSync(
        path.join(raiz, "package.json"),
        JSON.stringify({
            name: "monitor",
            type: "module",
            dependencies: { "@sparticuz/chromium": "*", "puppeteer-core": "*" },
        }),
    );
    writeFileSync(path.join(raiz, "package-lock.json"), '{ "lockfileVersion": 3 }\n');
    for (const handler of ["frequente", "renderizacao", "backup"]) {
        writeFileSync(
            path.join(raiz, "src", "handlers", `${handler}.ts`),
            "export async function handler(): Promise<void> {}\n",
        );
    }
    return raiz;
}
