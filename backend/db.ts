import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./src/config/env.ts";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);