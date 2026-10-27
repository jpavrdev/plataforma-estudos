import { statfs } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { UPLOADS_DIR } from "../config/paths.ts";
import { criarVerificadorDeDependencias } from "../domain/dependencias.ts";
import { whatsappService } from "./whatsapp.service.ts";

const TIMEOUT_POR_DEPENDENCIA_MS = 3_000;

export const verificarDependencias = criarVerificadorDeDependencias(
    {
        consultarBanco: () => db.execute(sql`select 1`),
        estadoDoWhatsapp: whatsappService.estadoDaConexao,
        // O volume de uploads fica no disco da VPS: medir por ele é medir o disco.
        espacoEmDisco: () => statfs(UPLOADS_DIR),
    },
    TIMEOUT_POR_DEPENDENCIA_MS,
);
