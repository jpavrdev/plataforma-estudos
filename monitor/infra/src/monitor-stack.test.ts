import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Match } from "aws-cdk-lib/assertions";
import {
    EMAIL_DE_TESTE,
    idDaFuncao,
    idUnico,
    recurso,
    recursos,
    sintetizar,
    type Agenda,
    type Funcao,
} from "./apoio-aos-testes.ts";

const { stack, template } = sintetizar();

const funcoes = {
    frequente: {
        id: idDaFuncao(stack, stack.frequente),
        agenda: "rate(1 minute)",
        intervaloS: 60,
    },
    renderizacao: {
        id: idDaFuncao(stack, stack.renderizacao),
        agenda: "rate(10 minutes)",
        intervaloS: 600,
    },
    backup: {
        id: idDaFuncao(stack, stack.backup),
        agenda: "cron(0 7 * * ? *)",
        intervaloS: 86_400,
    },
};
const idTabela = idUnico(template, "AWS::DynamoDB::Table");
const idTopico = idUnico(template, "AWS::SNS::Topic");

function funcao(id: string): Funcao {
    return recurso<Funcao>(template, "AWS::Lambda::Function", id);
}

function agendaDe(id: string): Agenda {
    const agendas = Object.values(recursos<Agenda>(template, "AWS::Scheduler::Schedule")).filter(
        (agenda) => agenda.Properties.Target.Arn["Fn::GetAtt"][0] === id,
    );
    const [unica] = agendas;
    if (agendas.length !== 1 || unica === undefined) {
        throw new Error(`esperava uma agenda para ${id}, achei ${agendas.length}`);
    }
    return unica;
}

describe("MonitorStack", () => {
    test("fica em São Paulo e marca tudo com projeto=ensinadev", () => {
        assert.equal(stack.region, "sa-east-1");
        assert.deepEqual(stack.tags.tagValues(), { projeto: "ensinadev" });
    });

    test("guarda o estado numa tabela sob demanda, chaveada por verificacao, que sobrevive à stack", () => {
        template.resourceCountIs("AWS::DynamoDB::Table", 1);
        template.hasResource("AWS::DynamoDB::Table", {
            DeletionPolicy: "Retain",
            UpdateReplacePolicy: "Retain",
            Properties: {
                BillingMode: "PAY_PER_REQUEST",
                KeySchema: [{ AttributeName: "verificacao", KeyType: "HASH" }],
                AttributeDefinitions: [{ AttributeName: "verificacao", AttributeType: "S" }],
            },
        });
    });

    test("avisa por email através de um tópico SNS", () => {
        template.resourceCountIs("AWS::SNS::Topic", 1);
        template.resourceCountIs("AWS::SNS::Subscription", 1);
        template.hasResourceProperties("AWS::SNS::Subscription", {
            Protocol: "email",
            Endpoint: EMAIL_DE_TESTE,
            TopicArn: { Ref: idTopico },
        });
        template.hasOutput("TopicoDeAlertas", { Value: { Ref: idTopico } });
    });

    test("não cria o parâmetro do token: o segredo fica fora do template", () => {
        template.resourceCountIs("AWS::SSM::Parameter", 0);
        assert.doesNotMatch(JSON.stringify(template.toJSON()), /SecureString/);
    });

    test("cria as três funções no runtime Node 24, cada uma com a sua role", () => {
        template.resourceCountIs("AWS::Lambda::Function", 3);
        template.allResourcesProperties("AWS::Lambda::Function", {
            FunctionName: Match.stringLikeRegexp("^ensinadev-monitor-"),
            Runtime: "nodejs24.x",
            Handler: "index.handler",
        });
        const papeis = Object.values(funcoes).map(
            ({ id }) => funcao(id).Properties.Role["Fn::GetAtt"][0],
        );
        assert.equal(new Set(papeis).size, 3);
    });

    test("roda o Chromium em x86_64 com 1600 MB e as outras funções em arm64", () => {
        const { frequente, renderizacao, backup } = funcoes;
        assert.deepEqual(funcao(renderizacao.id).Properties.Architectures, ["x86_64"]);
        assert.equal(funcao(renderizacao.id).Properties.MemorySize, 1600);
        for (const { id } of [frequente, backup]) {
            assert.deepEqual(funcao(id).Properties.Architectures, ["arm64"]);
            assert.equal(funcao(id).Properties.MemorySize, 256);
        }
    });

    test("nenhuma rodada pode durar mais que o intervalo da própria agenda", () => {
        for (const [nome, { id, intervaloS }] of Object.entries(funcoes)) {
            const { Timeout } = funcao(id).Properties;
            assert.ok(Timeout < intervaloS, `${nome}: ${Timeout} s não cabe em ${intervaloS} s`);
        }
    });

    test("não repete rodadas que falharam", () => {
        template.resourceCountIs("AWS::Lambda::EventInvokeConfig", 3);
        for (const { id } of Object.values(funcoes)) {
            template.hasResourceProperties("AWS::Lambda::EventInvokeConfig", {
                FunctionName: { Ref: id },
                MaximumRetryAttempts: 0,
            });
        }
    });

    test("passa a cada função só as variáveis de ambiente que o handler dela lê", () => {
        const comuns = { TABELA_ESTADO: { Ref: idTabela }, TOPICO_ALERTAS: { Ref: idTopico } };
        assert.deepEqual(funcao(funcoes.frequente.id).Properties.Environment.Variables, {
            ...comuns,
            URL_SITE: "https://ensinadev.com.br/",
            URL_API: "https://ensinadev.com.br/api/health",
            URL_DEPENDENCIAS: "https://ensinadev.com.br/api/health/dependencias",
            PARAMETRO_TOKEN: "/ensinadev/monitor/token",
        });
        assert.deepEqual(funcao(funcoes.renderizacao.id).Properties.Environment.Variables, {
            ...comuns,
            URL_SITE: "https://ensinadev.com.br/",
        });
        assert.deepEqual(funcao(funcoes.backup.id).Properties.Environment.Variables, {
            ...comuns,
            BUCKET_BACKUP: "ensinadev-backup-prod",
            PREFIXO_BACKUP: "postgres/",
            REGIAO_BACKUP: "us-east-2",
        });
    });

    test("agenda frequente a cada minuto, renderizacao a cada 10 minutos e backup às 07:00 UTC", () => {
        template.resourceCountIs("AWS::Scheduler::Schedule", 3);
        for (const [nome, { id, agenda }] of Object.entries(funcoes)) {
            assert.equal(agendaDe(id).Properties.ScheduleExpression, agenda, nome);
        }
        template.allResourcesProperties("AWS::Scheduler::Schedule", {
            ScheduleExpressionTimezone: "Etc/UTC",
            FlexibleTimeWindow: { Mode: "OFF" },
            State: "ENABLED",
        });
    });

    test("guarda os logs de cada função num grupo próprio por 14 dias", () => {
        template.resourceCountIs("AWS::Logs::LogGroup", 3);
        template.allResourcesProperties("AWS::Logs::LogGroup", { RetentionInDays: 14 });
        const grupos = Object.values(funcoes).map(
            ({ id }) => funcao(id).Properties.LoggingConfig.LogGroup.Ref,
        );
        assert.equal(new Set(grupos).size, 3);
        for (const grupo of grupos) {
            assert.ok(recursos(template, "AWS::Logs::LogGroup")[grupo], `${grupo} não existe`);
        }
    });

    test("avisa no tópico quando qualquer função dá erro", () => {
        for (const { id } of Object.values(funcoes)) {
            template.hasResourceProperties("AWS::CloudWatch::Alarm", {
                Namespace: "AWS/Lambda",
                MetricName: "Errors",
                Dimensions: [{ Name: "FunctionName", Value: { Ref: id } }],
                Statistic: "Sum",
                Period: 300,
                Threshold: 1,
                ComparisonOperator: "GreaterThanOrEqualToThreshold",
                EvaluationPeriods: 1,
                TreatMissingData: "notBreaching",
            });
        }
    });

    test("avisa quando frequente passa 5 minutos e renderizacao 30 minutos sem rodar", () => {
        const esperados = [
            { id: funcoes.frequente.id, periodo: 300 },
            { id: funcoes.renderizacao.id, periodo: 1800 },
        ];
        for (const { id, periodo } of esperados) {
            template.hasResourceProperties("AWS::CloudWatch::Alarm", {
                ComparisonOperator: "LessThanThreshold",
                Threshold: 1,
                EvaluationPeriods: 1,
                TreatMissingData: "breaching",
                Metrics: Match.arrayWith([
                    Match.objectLike({ Expression: "FILL(invocacoes, 0)", ReturnData: true }),
                    Match.objectLike({
                        Id: "invocacoes",
                        MetricStat: {
                            Metric: {
                                Namespace: "AWS/Lambda",
                                MetricName: "Invocations",
                                Dimensions: [{ Name: "FunctionName", Value: { Ref: id } }],
                            },
                            Period: periodo,
                            Stat: "Sum",
                        },
                    }),
                ]),
            });
        }
        template.resourceCountIs("AWS::CloudWatch::Alarm", 5);
    });

    test("todo alarme avisa no tópico quando dispara e quando volta ao normal", () => {
        template.allResourcesProperties("AWS::CloudWatch::Alarm", {
            AlarmName: Match.stringLikeRegexp("^ensinadev-monitor-"),
            AlarmActions: [{ Ref: idTopico }],
            OKActions: [{ Ref: idTopico }],
        });
    });
});
