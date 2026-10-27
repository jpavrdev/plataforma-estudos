import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";
import { NotificadorSns } from "../adaptadores/notificadorSns.ts";
import { RepositorioDynamo } from "../adaptadores/repositorioDynamo.ts";
import { exigir, type Ambiente } from "./ambiente.ts";
import type { DependenciasDoProcessamento } from "./processarResultados.ts";

export function montarProcessamento(ambiente: Ambiente): DependenciasDoProcessamento {
    return {
        repositorio: new RepositorioDynamo(
            new DynamoDBClient({}),
            exigir(ambiente, "TABELA_ESTADO"),
        ),
        notificador: new NotificadorSns(new SNSClient({}), exigir(ambiente, "TOPICO_ALERTAS")),
        agora: () => new Date(),
    };
}
