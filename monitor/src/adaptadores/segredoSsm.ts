import { GetParameterCommand, type SSMClient } from "@aws-sdk/client-ssm";
import type { FonteDeSegredo } from "../dominio/portas.ts";

// Relido de tempos em tempos: uma troca do token no SSM chega sem esperar a Lambda reciclar.
const VALIDADE_MS = 15 * 60_000;

export class SegredoSsm implements FonteDeSegredo {
    readonly #cliente: SSMClient;
    readonly #parametro: string;
    readonly #relogio: () => number;
    #guardado: { valor: string; lidoEm: number } | undefined;

    constructor(cliente: SSMClient, parametro: string, relogio: () => number = Date.now) {
        this.#cliente = cliente;
        this.#parametro = parametro;
        this.#relogio = relogio;
    }

    async token(): Promise<string> {
        const agora = this.#relogio();
        if (this.#guardado && agora - this.#guardado.lidoEm < VALIDADE_MS) {
            return this.#guardado.valor;
        }
        const resposta = await this.#cliente.send(
            new GetParameterCommand({ Name: this.#parametro, WithDecryption: true }),
        );
        const valor = resposta.Parameter?.Value;
        if (!valor) throw new Error(`o parâmetro ${this.#parametro} do SSM está vazio`);
        this.#guardado = { valor, lidoEm: agora };
        return valor;
    }
}
