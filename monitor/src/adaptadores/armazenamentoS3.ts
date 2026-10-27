import { ListObjectsV2Command, type S3Client } from "@aws-sdk/client-s3";
import type { ArmazenamentoBackup } from "../dominio/portas.ts";

// Só lista, nunca baixa: os dumps têm dado pessoal e o monitor não pode ter s3:GetObject.
export class ArmazenamentoS3 implements ArmazenamentoBackup {
    readonly #cliente: S3Client;
    readonly #bucket: string;

    constructor(cliente: S3Client, bucket: string) {
        this.#cliente = cliente;
        this.#bucket = bucket;
    }

    async tamanhoDe(chave: string): Promise<number | null> {
        const resposta = await this.#cliente.send(
            new ListObjectsV2Command({ Bucket: this.#bucket, Prefix: chave }),
        );
        const objeto = resposta.Contents?.find((item) => item.Key === chave);
        return objeto ? (objeto.Size ?? 0) : null;
    }
}
