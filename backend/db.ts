import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./src/config/env.ts";

const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    // SSL controlado por variável própria: o Postgres em container (mesma rede
    // Docker) não fala SSL. Ligar só quando o banco for remoto/gerenciado.
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);
