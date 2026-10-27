import {
    GetItemCommand,
    PutItemCommand,
    type AttributeValue,
    type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import type { RepositorioEstado } from "../dominio/portas.ts";
import type { EstadoVerificacao } from "../dominio/tipos.ts";

type Item = Record<string, AttributeValue>;

export class RepositorioDynamo implements RepositorioEstado {
    readonly #cliente: DynamoDBClient;
    readonly #tabela: string;

    constructor(cliente: DynamoDBClient, tabela: string) {
        this.#cliente = cliente;
        this.#tabela = tabela;
    }

    async ler(verificacoes: string[]): Promise<Map<string, EstadoVerificacao>> {
        const estados = await Promise.all(verificacoes.map((nome) => this.#lerUma(nome)));
        return new Map(
            estados
                .filter((estado) => estado !== undefined)
                .map((estado) => [estado.verificacao, estado]),
        );
    }

    async salvar(estado: EstadoVerificacao): Promise<void> {
        await this.#cliente.send(
            new PutItemCommand({ TableName: this.#tabela, Item: paraItem(estado) }),
        );
    }

    async #lerUma(verificacao: string): Promise<EstadoVerificacao | undefined> {
        const { Item } = await this.#cliente.send(
            new GetItemCommand({
                TableName: this.#tabela,
                Key: { verificacao: { S: verificacao } },
                ConsistentRead: true,
            }),
        );
        if (!Item) return undefined;
        const estado = paraEstado(Item);
        if (!estado)
            console.warn(`estado gravado de ${verificacao} tem formato inesperado; ignorado`);
        return estado;
    }
}

function paraItem(estado: EstadoVerificacao): Item {
    const item: Item = {
        verificacao: { S: estado.verificacao },
        situacao: { S: estado.situacao },
        falhasSeguidas: { N: String(estado.falhasSeguidas) },
        desde: { S: estado.desde },
        alertado: { BOOL: estado.alertado },
    };
    if (estado.ultimoAlertaEm !== undefined) item.ultimoAlertaEm = { S: estado.ultimoAlertaEm };
    return item;
}

function paraEstado(item: Item): EstadoVerificacao | undefined {
    const verificacao = item.verificacao?.S;
    const situacao = item.situacao?.S;
    const falhasSeguidas = Number(item.falhasSeguidas?.N);
    const desde = item.desde?.S;
    const alertado = item.alertado?.BOOL;
    if (
        verificacao === undefined ||
        (situacao !== "ok" && situacao !== "falha") ||
        !Number.isInteger(falhasSeguidas) ||
        desde === undefined ||
        alertado === undefined
    ) {
        return undefined;
    }
    const estado: EstadoVerificacao = { verificacao, situacao, falhasSeguidas, desde, alertado };
    const ultimoAlertaEm = item.ultimoAlertaEm?.S;
    return ultimoAlertaEm === undefined ? estado : { ...estado, ultimoAlertaEm };
}
