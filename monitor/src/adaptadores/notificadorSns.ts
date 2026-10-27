import { PublishCommand, type SNSClient } from "@aws-sdk/client-sns";
import type { Notificador } from "../dominio/portas.ts";
import type { Alerta } from "../dominio/tipos.ts";

const LIMITE_DO_ASSUNTO = 99;

export class NotificadorSns implements Notificador {
    readonly #cliente: SNSClient;
    readonly #topico: string;

    constructor(cliente: SNSClient, topicoArn: string) {
        this.#cliente = cliente;
        this.#topico = topicoArn;
    }

    async enviar(alerta: Alerta): Promise<void> {
        await this.#cliente.send(
            new PublishCommand({
                TopicArn: this.#topico,
                Subject: assuntoAceitoPeloSns(alerta.assunto),
                Message: alerta.mensagem,
            }),
        );
    }
}

function assuntoAceitoPeloSns(assunto: string): string {
    return assunto
        .replace(/\p{Cc}+/gu, " ")
        .trim()
        .slice(0, LIMITE_DO_ASSUNTO);
}
