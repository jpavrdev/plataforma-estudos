import { statfs } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { env } from "../config/env.ts";
import { UPLOADS_DIR } from "../config/paths.ts";
import { createDependencyChecker } from "../domain/dependencies.ts";
import { whatsappService } from "./whatsapp.service.ts";

const PER_DEPENDENCY_TIMEOUT_MS = 3_000;
// LABS_URL is the WebSocket one; the health endpoint is HTTP on the same host and port.
const LABS_HEALTH_URL = `${env.LABS_URL.replace(/^ws/, "http")}/health`;

export const checkDependencies = createDependencyChecker(
    {
        queryDatabase: () => db.execute(sql`select 1`),
        whatsappState: whatsappService.connectionState,
        // The uploads volume lives on the VPS disk: measuring it measures the disk.
        diskSpace: () => statfs(UPLOADS_DIR),
        labsHealth: async (signal) => {
            const response = await fetch(LABS_HEALTH_URL, { signal });
            if (!response.ok) throw new Error(`the labs service answered ${response.status}`);
            return response.json();
        },
    },
    PER_DEPENDENCY_TIMEOUT_MS,
);
