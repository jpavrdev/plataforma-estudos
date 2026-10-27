import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { ArmazenamentoS3 } from "./armazenamentoS3.ts";

const BUCKET = "ensinadev-backup-prod";
const CHAVE = "postgres/estudos-2026-10-23.dump";

function s3Listando(t: TestContext, objetos: Record<string, number> | undefined) {
    const cliente = new S3Client({ region: "us-east-2" });
    const comandos: unknown[] = [];
    t.mock.method(cliente, "send", async (comando: unknown) => {
        comandos.push(comando);
        const Contents = objetos && Object.entries(objetos).map(([Key, Size]) => ({ Key, Size }));
        return { $metadata: {}, Contents };
    });
    return { cliente, comandos };
}

test("lista com o nome exato do arquivo como prefixo e lê o tamanho da listagem", async (t) => {
    const { cliente, comandos } = s3Listando(t, { [CHAVE]: 1234 });
    assert.equal(await new ArmazenamentoS3(cliente, BUCKET).tamanhoDe(CHAVE), 1234);
    assert.equal(comandos.length, 1);
    const [comando] = comandos;
    assert.ok(
        comando instanceof ListObjectsV2Command,
        "só ListObjectsV2, nunca HeadObject ou GetObject",
    );
    assert.deepEqual(comando.input, { Bucket: BUCKET, Prefix: CHAVE });
});

test("ignora arquivo de nome mais longo que começa igual", async (t) => {
    const { cliente } = s3Listando(t, { [`${CHAVE}.parcial`]: 999 });
    assert.equal(await new ArmazenamentoS3(cliente, BUCKET).tamanhoDe(CHAVE), null);
});

test("devolve null quando o prefixo está vazio", async (t) => {
    const { cliente } = s3Listando(t, undefined);
    assert.equal(await new ArmazenamentoS3(cliente, BUCKET).tamanhoDe(CHAVE), null);
});
