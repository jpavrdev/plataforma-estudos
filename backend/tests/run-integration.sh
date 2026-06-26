#!/usr/bin/env bash
# Sobe um Postgres efêmero, aplica as migrations e roda os testes de integração.
# Uso: bash tests/run-integration.sh
set -euo pipefail

CONTAINER="ensinadev_pg_test"
PORT=55433
export DATABASE_URL="postgres://test:test@localhost:${PORT}/testdb"
export JWT_SECRET="test_secret_com_pelo_menos_32_caracteres_aqui_ok"
export NODE_ENV="test"
export FRONTEND_URL="http://localhost:5173"
export DB_SSL="false"

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Subindo Postgres de teste (porta ${PORT})"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --rm --name "$CONTAINER" \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=testdb \
  -p ${PORT}:5432 postgres:16-alpine >/dev/null

echo "==> Aguardando o banco aceitar conexões"
for i in $(seq 1 30); do
  docker exec "$CONTAINER" pg_isready -U test -d testdb >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Aplicando migrations"
npx drizzle-kit migrate >/dev/null

echo "==> Rodando testes de integração"
node --test --test-concurrency=1 'tests/**/*.test.ts'
