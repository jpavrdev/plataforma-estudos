import { CfnOutput, Duration, RemovalPolicy, Stack, TimeZone, type StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import { ScheduleExpression } from "aws-cdk-lib/aws-scheduler";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import type { Construct } from "constructs";
import { FuncaoDeVerificacao } from "./funcao-de-verificacao.ts";
import { lerParametro, listarBackups } from "./permissoes.ts";

const SITE = "https://ensinadev.com.br/";
const BACKUP = { bucket: "ensinadev-backup-prod", prefixo: "postgres/", regiao: "us-east-2" };

export interface MonitorStackProps extends StackProps {
    readonly emailAlertas: string;
    readonly parametroToken: string;
    readonly raizDoMonitor: string;
}

export class MonitorStack extends Stack {
    readonly frequente: FuncaoDeVerificacao;
    readonly renderizacao: FuncaoDeVerificacao;
    readonly backup: FuncaoDeVerificacao;

    constructor(scope: Construct, id: string, props: MonitorStackProps) {
        super(scope, id, {
            ...props,
            env: { ...props.env, region: "sa-east-1" },
            description: "Monitor externo da Ensina Dev",
            tags: { ...props.tags, projeto: "ensinadev" },
        });

        const estado = new Table(this, "Estado", {
            partitionKey: { name: "verificacao", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.RETAIN,
        });

        const alertas = new Topic(this, "Alertas", { displayName: "Monitor Ensina Dev" });
        alertas.addSubscription(new EmailSubscription(props.emailAlertas));

        const comum = { raizDoMonitor: props.raizDoMonitor, estado, alertas };

        this.frequente = new FuncaoDeVerificacao(this, "Frequente", {
            ...comum,
            handler: "frequente",
            descricao: "Site, API, banco, WhatsApp e disco, a cada minuto",
            verificacoes: ["site", "api", "banco", "whatsapp", "disco"],
            agenda: ScheduleExpression.rate(Duration.minutes(1)),
            semExecucaoApos: Duration.minutes(5),
            arquitetura: Architecture.ARM_64,
            memoriaMb: 256,
            // Abaixo do intervalo da agenda, para duas rodadas nunca disputarem o mesmo estado.
            tempoLimite: Duration.seconds(50),
            ambiente: {
                URL_SITE: SITE,
                URL_API: `${SITE}api/health`,
                URL_DEPENDENCIAS: `${SITE}api/health/dependencias`,
                PARAMETRO_TOKEN: props.parametroToken,
            },
            permissoes: [lerParametro(this, props.parametroToken)],
        });

        this.renderizacao = new FuncaoDeVerificacao(this, "Renderizacao", {
            ...comum,
            handler: "renderizacao",
            descricao: "Chromium sem tela abre o site e confere o #root, a cada 10 minutos",
            verificacoes: ["renderizacao"],
            agenda: ScheduleExpression.rate(Duration.minutes(10)),
            semExecucaoApos: Duration.minutes(30),
            // O pacote npm do @sparticuz/chromium só traz binário x64 e recomenda 1600 MB.
            arquitetura: Architecture.X86_64,
            memoriaMb: 1600,
            tempoLimite: Duration.seconds(90),
            ambiente: { URL_SITE: SITE },
            modulosInstalados: ["@sparticuz/chromium", "puppeteer-core"],
        });

        this.backup = new FuncaoDeVerificacao(this, "Backup", {
            ...comum,
            handler: "backup",
            descricao: "Dump do Postgres do dia no S3, às 07:00 UTC",
            verificacoes: ["backup"],
            agenda: ScheduleExpression.cron({ minute: "0", hour: "7", timeZone: TimeZone.ETC_UTC }),
            arquitetura: Architecture.ARM_64,
            memoriaMb: 256,
            tempoLimite: Duration.seconds(30),
            ambiente: {
                BUCKET_BACKUP: BACKUP.bucket,
                PREFIXO_BACKUP: BACKUP.prefixo,
                REGIAO_BACKUP: BACKUP.regiao,
            },
            permissoes: [listarBackups(this, BACKUP.bucket, BACKUP.prefixo)],
        });

        new CfnOutput(this, "TopicoDeAlertas", {
            description: "ARN do tópico SNS que recebe os alertas",
            value: alertas.topicArn,
        });
    }
}
