import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./src/config/env.ts";

const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    // SSL controlado por variável própria: o Postgres em container (mesma rede
    // Docker) não fala SSL. Ligar só quando o banco for remoto/gerenciado.
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
});

// Sem este handler o pool relança o erro como 'error' event sem ouvinte, o que
// derruba o processo. Um restart do Postgres (deploy, recriação do container)
// mata todas as conexões de uma vez e cai exatamente aqui. O pool abre conexão
// nova na próxima consulta, então basta registrar e seguir.
pool.on("error", (err) => {
    console.error("Erro em conexão ociosa do pool do Postgres:", err.message);
});

export const db = drizzle(pool);
