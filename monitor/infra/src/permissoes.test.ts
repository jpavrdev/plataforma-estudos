import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    acoes,
    declaracaoCom,
    declaracoesDoPapel,
    idDaFuncao,
    idDoPapel,
    idUnico,
    listar,
    recurso,
    recursos,
    sintetizar,
    todasAsDeclaracoes,
    type Agenda,
    type Declaracao,
    type Funcao,
    type Papel,
} from "./apoio-aos-testes.ts";

const { stack, template } = sintetizar();

const idTabela = idUnico(template, "AWS::DynamoDB::Table");
const idTopico = idUnico(template, "AWS::SNS::Topic");

const ESTADO = ["dynamodb:GetItem", "dynamodb:PutItem"];
const LOGS = ["logs:CreateLogStream", "logs:PutLogEvents"];

const roles = {
    frequente: {
        verificacao: stack.frequente,
        chaves: ["site", "api", "banco", "whatsapp", "disco"],
        acoes: [...ESTADO, ...LOGS, "sns:Publish", "ssm:GetParameter"],
    },
    renderizacao: {
        verificacao: stack.renderizacao,
        chaves: ["renderizacao"],
        acoes: [...ESTADO, ...LOGS, "sns:Publish"],
    },
    backup: {
        verificacao: stack.backup,
        chaves: ["backup"],
        acoes: [...ESTADO, ...LOGS, "s3:ListBucket", "sns:Publish"],
    },
};

function declaracoesDe(nome: keyof typeof roles): Declaracao[] {
    return declaracoesDoPapel(template, idDoPapel(stack, roles[nome].verificacao));
}

describe("role de cada função", () => {
    for (const [nome, role] of Object.entries(roles)) {
        const idPapel = idDoPapel(stack, role.verificacao);
        const declaracoes = declaracoesDoPapel(template, idPapel);

        test(`${nome}: só a Lambda assume, sem política gerenciada nem inline`, () => {
            const { Properties } = recurso<Papel>(template, "AWS::IAM::Role", idPapel);
            assert.deepEqual(Properties.AssumeRolePolicyDocument.Statement, [
                {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: { Service: "lambda.amazonaws.com" },
                },
            ]);
            assert.equal(Properties.ManagedPolicyArns, undefined);
            assert.equal(Properties.Policies, undefined);
        });

        test(`${nome}: pode exatamente ${role.acoes.length} ações e nada além`, () => {
            assert.deepEqual(acoes(declaracoes), [...role.acoes].sort());
            for (const declaracao of declaracoes) assert.equal(declaracao.Effect, "Allow");
        });

        test(`${nome}: lê e grava só os próprios itens da tabela de estado`, () => {
            const estado = declaracaoCom(declaracoes, "dynamodb:PutItem");
            assert.deepEqual([...listar(estado.Action)].sort(), ESTADO);
            assert.deepEqual(estado.Resource, { "Fn::GetAtt": [idTabela, "Arn"] });
            assert.deepEqual(estado.Condition, {
                "ForAllValues:StringEquals": { "dynamodb:LeadingKeys": role.chaves },
            });
        });

        test(`${nome}: publica só no tópico de alertas`, () => {
            assert.deepEqual(declaracaoCom(declaracoes, "sns:Publish").Resource, { Ref: idTopico });
        });

        test(`${nome}: escreve só no próprio grupo de logs`, () => {
            const funcao = recurso<Funcao>(
                template,
                "AWS::Lambda::Function",
                idDaFuncao(stack, role.verificacao),
            );
            const grupo = funcao.Properties.LoggingConfig.LogGroup.Ref;
            const logs = declaracaoCom(declaracoes, "logs:PutLogEvents");
            assert.deepEqual([...listar(logs.Action)].sort(), LOGS);
            assert.deepEqual(logs.Resource, { "Fn::GetAtt": [grupo, "Arn"] });
        });
    }

    test("frequente: lê só o parâmetro do token, sem precisar de kms:Decrypt", () => {
        const parametro = declaracaoCom(declaracoesDe("frequente"), "ssm:GetParameter");
        assert.deepEqual(parametro.Resource, {
            "Fn::Join": [
                "",
                [
                    "arn:aws:ssm:sa-east-1:",
                    { Ref: "AWS::AccountId" },
                    ":parameter/ensinadev/monitor/token",
                ],
            ],
        });
    });

    test("frequente: a permissão acompanha o nome de parâmetro configurado", () => {
        const outra = sintetizar("/outro/caminho/token");
        const idPapel = idDoPapel(outra.stack, outra.stack.frequente);
        const parametro = declaracaoCom(
            declaracoesDoPapel(outra.template, idPapel),
            "ssm:GetParameter",
        );
        assert.match(JSON.stringify(parametro.Resource), /:parameter\/outro\/caminho\/token"/);
    });

    test("backup: lista o bucket só sob postgres/ e nunca baixa um dump", () => {
        const declaracoes = declaracoesDe("backup");
        const listagem = declaracaoCom(declaracoes, "s3:ListBucket");
        assert.deepEqual(listagem.Action, "s3:ListBucket");
        assert.equal(listagem.Resource, "arn:aws:s3:::ensinadev-backup-prod");
        assert.deepEqual(listagem.Condition, { StringLike: { "s3:prefix": ["postgres/*"] } });
        assert.ok(!acoes(declaracoes).includes("s3:GetObject"));
    });
});

describe("roles do EventBridge Scheduler", () => {
    for (const [nome, role] of Object.entries(roles)) {
        test(`${nome}: a agenda só pode invocar a própria função`, () => {
            const idFuncao = idDaFuncao(stack, role.verificacao);
            const agendas = recursos<Agenda>(template, "AWS::Scheduler::Schedule");
            const agenda = Object.values(agendas).find(
                (item) => item.Properties.Target.Arn["Fn::GetAtt"][0] === idFuncao,
            );
            assert.ok(agenda, `sem agenda para ${nome}`);
            const idPapel = agenda.Properties.Target.RoleArn["Fn::GetAtt"][0];
            const papel = recurso<Papel>(template, "AWS::IAM::Role", idPapel);
            const [confianca] = papel.Properties.AssumeRolePolicyDocument.Statement;
            assert.deepEqual(confianca?.Principal, { Service: "scheduler.amazonaws.com" });

            const declaracoes = declaracoesDoPapel(template, idPapel);
            assert.deepEqual(acoes(declaracoes), ["lambda:InvokeFunction"]);
            for (const alvo of declaracoes.flatMap((declaracao) => listar(declaracao.Resource))) {
                assert.match(JSON.stringify(alvo), new RegExp(`"${idFuncao}"`));
            }
        });
    }
});

describe("o que nenhuma role pode", () => {
    const declaracoes = todasAsDeclaracoes(template);
    const todasAsAcoes = acoes(declaracoes);

    test("ninguém baixa objetos do S3, em especial os dumps com dado pessoal", () => {
        assert.doesNotMatch(JSON.stringify(template.toJSON()), /s3:GetObject/i);
        const doS3 = todasAsAcoes.filter((acao) => acao.startsWith("s3:"));
        assert.deepEqual(doS3, ["s3:ListBucket"]);
    });

    test("na tabela de estado, só GetItem e PutItem: nada de BatchGetItem, Query ou Scan", () => {
        assert.doesNotMatch(JSON.stringify(template.toJSON()), /BatchGetItem/);
        const doDynamo = todasAsAcoes.filter((acao) => acao.startsWith("dynamodb:"));
        assert.deepEqual(doDynamo, ["dynamodb:GetItem", "dynamodb:PutItem"]);
    });

    test("nenhuma ação com curinga", () => {
        assert.deepEqual(todasAsAcoes.filter((acao) => acao.includes("*")), []);
    });

    test("nenhuma permissão de KMS: a chave aws/ssm já libera o Decrypt para a conta", () => {
        assert.deepEqual(todasAsAcoes.filter((acao) => acao.startsWith("kms:")), []);
    });

    test("nenhuma declaração vale para qualquer recurso", () => {
        for (const declaracao of declaracoes) {
            assert.ok(declaracao.Resource !== undefined, "declaração sem recurso");
            assert.ok(!listar(declaracao.Resource).includes("*"), JSON.stringify(declaracao));
        }
    });
});
