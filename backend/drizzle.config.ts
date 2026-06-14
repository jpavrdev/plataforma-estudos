import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema.ts", // aponta pro arquivo que criamos
  out: "./drizzle", // pasta onde os arquivos de migração serão gerados
  dialect: "postgresql", // tipo do banco de dados
  dbCredentials: { // configuração de conexão com o banco de dados
    url: process.env.DATABASE_URL!, // a URL de conexão deve estar definida na variável de ambiente DATABASE_URL
  },
});

// "docker compose exec backend npx drizzle-kit generate" para gerar os arquivos de migração a partir do schema
// "docker compose exec backend npx drizzle-kit migrate" para aplicar as migrações no banco de dados, criando as tabelas conforme definido no schema 