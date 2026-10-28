import { statfs } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { env } from "../config/env.ts";
import { UPLOADS_DIR } from "../config/paths.ts";
import { criarVerificadorDeDependencias } from "../domain/dependencias.ts";
import { whatsappService } from "./whatsapp.service.ts";

const TIMEOUT_POR_DEPENDENCIA_MS = 3_000;
// O LABS_URL é o do WebSocket; o health é HTTP no mesmo host e porta.
const URL_DO_HEALTH_DOS_LABS = `${env.LABS_URL.replace(/^ws/, "http")}/health`;

export const verificarDependencias = criarVerificadorDeDependencias(
    {
        consultarBanco: () => db.execute(sql`select 1`),
        estadoDoWhatsapp: whatsappService.estadoDaConexao,
        // O volume de uploads fica no disco da VPS: medir por ele é medir o disco.
        espacoEmDisco: () => statfs(UPLOADS_DIR),
        saudeDosLabs: async (sinal) => {
            const resposta = await fetch(URL_DO_HEALTH_DOS_LABS, { signal: sinal });
            if (!resposta.ok) throw new Error(`o serviço de labs respondeu ${resposta.status}`);
            return resposta.json();
        },
    },
    TIMEOUT_POR_DEPENDENCIA_MS,
);
