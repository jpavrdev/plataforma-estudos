import { Duration } from "aws-cdk-lib";
import {
    Alarm,
    ComparisonOperator,
    MathExpression,
    Stats,
    TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import type { IFunction } from "aws-cdk-lib/aws-lambda";
import type { ITopic } from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";

export interface AlarmesDaFuncaoProps {
    readonly funcao: IFunction;
    readonly nomeDaFuncao: string;
    readonly alertas: ITopic;
    readonly semExecucaoApos?: Duration;
}

export class AlarmesDaFuncao extends Construct {
    constructor(scope: Construct, id: string, props: AlarmesDaFuncaoProps) {
        super(scope, id);
        const { funcao, nomeDaFuncao, semExecucaoApos } = props;

        const alarmes = [
            new Alarm(this, "ComErro", {
                alarmName: `${nomeDaFuncao}-com-erro`,
                alarmDescription: `A função ${nomeDaFuncao} terminou com erro ou estourou o tempo limite. Os logs ficam em /aws/lambda/${nomeDaFuncao}.`,
                metric: funcao.metricErrors({ period: Duration.minutes(5), statistic: Stats.SUM }),
                threshold: 1,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 1,
                treatMissingData: TreatMissingData.NOT_BREACHING,
            }),
        ];

        if (semExecucaoApos !== undefined) {
            alarmes.push(
                new Alarm(this, "SemExecucao", {
                    alarmName: `${nomeDaFuncao}-sem-execucao`,
                    alarmDescription: `A função ${nomeDaFuncao} não rodou nos últimos ${semExecucaoApos.toMinutes()} minutos. Confira a agenda dela no EventBridge Scheduler.`,
                    // Sem execução a Lambda não publica Invocations, e o alarme seguiria avaliando o último ponto real.
                    metric: new MathExpression({
                        expression: "FILL(invocacoes, 0)",
                        usingMetrics: {
                            invocacoes: funcao.metricInvocations({ statistic: Stats.SUM }),
                        },
                        period: semExecucaoApos,
                        label: "Execuções",
                    }),
                    threshold: 1,
                    comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
                    evaluationPeriods: 1,
                    treatMissingData: TreatMissingData.BREACHING,
                }),
            );
        }

        const avisar = new SnsAction(props.alertas);
        for (const alarme of alarmes) {
            alarme.addAlarmAction(avisar);
            alarme.addOkAction(avisar);
        }
    }
}
