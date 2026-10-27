import path from "node:path";
import { RemovalPolicy, type Duration } from "aws-cdk-lib";
import type { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Role, ServicePrincipal, type PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime, type Architecture } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Schedule, type ScheduleExpression } from "aws-cdk-lib/aws-scheduler";
import { LambdaInvoke } from "aws-cdk-lib/aws-scheduler-targets";
import type { ITopic } from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { AlarmesDaFuncao } from "./alarmes-da-funcao.ts";
import { lerEGravarEstado, publicarAlertas } from "./permissoes.ts";

export interface FuncaoDeVerificacaoProps {
    readonly handler: string;
    readonly descricao: string;
    readonly raizDoMonitor: string;
    readonly verificacoes: readonly string[];
    readonly estado: ITable;
    readonly alertas: ITopic;
    readonly agenda: ScheduleExpression;
    readonly semExecucaoApos?: Duration;
    readonly arquitetura: Architecture;
    readonly memoriaMb: number;
    readonly tempoLimite: Duration;
    readonly ambiente?: Readonly<Record<string, string>>;
    readonly permissoes?: readonly PolicyStatement[];
    readonly modulosInstalados?: string[];
}

export class FuncaoDeVerificacao extends Construct {
    readonly nome: string;
    readonly funcao: NodejsFunction;
    readonly papel: Role;

    constructor(scope: Construct, id: string, props: FuncaoDeVerificacaoProps) {
        super(scope, id);
        this.nome = `ensinadev-monitor-${props.handler}`;

        const logs = new LogGroup(this, "Logs", {
            logGroupName: `/aws/lambda/${this.nome}`,
            retention: RetentionDays.TWO_WEEKS,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        this.papel = new Role(this, "Papel", {
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            description: `Execução da função ${this.nome}`,
        });
        logs.grantWrite(this.papel);
        this.papel.addToPolicy(lerEGravarEstado(props.estado, props.verificacoes));
        this.papel.addToPolicy(publicarAlertas(props.alertas));
        for (const permissao of props.permissoes ?? []) this.papel.addToPolicy(permissao);

        this.funcao = new NodejsFunction(this, "Funcao", {
            functionName: this.nome,
            description: props.descricao,
            entry: path.join(props.raizDoMonitor, "src", "handlers", `${props.handler}.ts`),
            projectRoot: props.raizDoMonitor,
            depsLockFilePath: path.join(props.raizDoMonitor, "package-lock.json"),
            runtime: Runtime.NODEJS_24_X,
            architecture: props.arquitetura,
            memorySize: props.memoriaMb,
            timeout: props.tempoLimite,
            role: this.papel,
            logGroup: logs,
            // Repetir uma rodada que falhou contaria a mesma rodada duas vezes nas falhas seguidas.
            retryAttempts: 0,
            environment: {
                TABELA_ESTADO: props.estado.tableName,
                TOPICO_ALERTAS: props.alertas.topicArn,
                ...props.ambiente,
            },
            bundling: {
                format: OutputFormat.ESM,
                externalModules: ["@aws-sdk/*", "@smithy/*"],
                nodeModules: props.modulosInstalados,
            },
        });

        new Schedule(this, "Agenda", {
            schedule: props.agenda,
            target: new LambdaInvoke(this.funcao),
            description: `Dispara a função ${this.nome}`,
        });

        new AlarmesDaFuncao(this, "Alarmes", {
            funcao: this.funcao,
            nomeDaFuncao: this.nome,
            alertas: props.alertas,
            semExecucaoApos: props.semExecucaoApos,
        });
    }
}
