# Runner de desafios

Serviço interno que executa o código enviado nos desafios de forma isolada. O backend
público nunca fala com o Docker: ele chama `POST http://runner:8080/run` e o runner sobe
um container efêmero por submissão.

## Fluxo

1. Backend envia `{ language, code, stdins: string[] }`.
2. O runner sobe um container da imagem da linguagem (`desafio-js`, `desafio-python`),
   passa `{ code, stdins, caseTimeoutMs }` pelo stdin e lê o resultado do stdout.
3. Cada imagem tem um _harness_ que roda o código uma vez por entrada e devolve
   `{ compileOutput, results: [{ stdout, stderr, exitCode, timedOut }] }`.

## Isolamento

Cada container roda com: `--network none`, memória/CPU/pids limitados, usuário não-root,
`--read-only` + tmpfs, `--cap-drop ALL` e `--security-opt no-new-privileges`. A concorrência
é limitada por `MAX_CONCURRENT`. Em produção, defina `RUNNER_RUNTIME=runsc` para rodar os
containers de execução sob gVisor (isolamento de kernel).

## Setup

```bash
bash runner/build-images.sh   # constrói desafio-js e desafio-python no daemon
docker compose up -d runner
```

## C#

Fora por enquanto. Para adicionar: criar `images/csharp` (harness que compila uma vez e
roda por caso), registrar em `server.mjs` (`LIMITS`), no schema de execução do backend e no
seletor do front. O enum `challenge_language` do banco já reserva o valor `csharp`.
