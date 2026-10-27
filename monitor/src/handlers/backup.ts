import { S3Client } from "@aws-sdk/client-s3";
import { ArmazenamentoS3 } from "../adaptadores/armazenamentoS3.ts";
import type { ArmazenamentoBackup } from "../dominio/portas.ts";
import { verificarBackup } from "../verificacoes/backup.ts";
import { exigir, type Ambiente } from "./ambiente.ts";
import { criarHandler } from "./criarHandler.ts";
import { montarProcessamento } from "./montagem.ts";
import {
    processarResultados,
    type DependenciasDoProcessamento,
    type ResumoDaExecucao,
} from "./processarResultados.ts";

export interface DependenciasBackup extends DependenciasDoProcessamento {
    armazenamento: ArmazenamentoBackup;
    prefixo: string;
}

export async function executarBackup(deps: DependenciasBackup): Promise<ResumoDaExecucao> {
    const resultado = await verificarBackup(deps, deps.prefixo);
    return processarResultados("backup", [resultado], deps);
}

export function montarBackup(ambiente: Ambiente): DependenciasBackup {
    const s3 = new S3Client({ region: exigir(ambiente, "REGIAO_BACKUP") });
    return {
        ...montarProcessamento(ambiente),
        armazenamento: new ArmazenamentoS3(s3, exigir(ambiente, "BUCKET_BACKUP")),
        prefixo: exigir(ambiente, "PREFIXO_BACKUP"),
    };
}

export const handler = criarHandler(() => montarBackup(process.env), executarBackup);
