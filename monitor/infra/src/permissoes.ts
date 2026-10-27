import { Stack } from "aws-cdk-lib";
import type { ITable } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import type { ITopic } from "aws-cdk-lib/aws-sns";
import type { IConstruct } from "constructs";

export function lerEGravarEstado(tabela: ITable, verificacoes: readonly string[]): PolicyStatement {
    return new PolicyStatement({
        actions: ["dynamodb:GetItem", "dynamodb:PutItem"],
        resources: [tabela.tableArn],
        conditions: {
            "ForAllValues:StringEquals": { "dynamodb:LeadingKeys": [...verificacoes] },
        },
    });
}

export function publicarAlertas(topico: ITopic): PolicyStatement {
    return new PolicyStatement({ actions: ["sns:Publish"], resources: [topico.topicArn] });
}

export function lerParametro(escopo: IConstruct, nome: string): PolicyStatement {
    return new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
            Stack.of(escopo).formatArn({
                service: "ssm",
                resource: "parameter",
                resourceName: nome.replace(/^\//, ""),
            }),
        ],
    });
}

export function listarBackups(escopo: IConstruct, bucket: string, prefixo: string): PolicyStatement {
    return new PolicyStatement({
        actions: ["s3:ListBucket"],
        resources: [
            Stack.of(escopo).formatArn({ service: "s3", region: "", account: "", resource: bucket }),
        ],
        conditions: { StringLike: { "s3:prefix": [`${prefixo}*`] } },
    });
}
