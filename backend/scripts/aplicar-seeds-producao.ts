// Roda, em ordem, os seeds de conteúdo que o deploy aplica em produção.
//
// O pipeline chama este script depois das migrations e antes de subir o backend
// novo, num container da imagem nova, então os seeds da release já estão aqui. A
// lista inteira roda em todo deploy, por isso só entra seed idempotente. Os
// atualizadores de banco de simulado (atualizar-*.ts) ficam de fora: apagam
// respostas de tentativas e pedem backup antes, então continuam manuais.
//
// Release de conteúdo acrescenta os seeds dela antes de seed-detalhes-trilhas e
// seed-conquistas-trilhas, que dependem das trilhas já criadas.
//
// Rodar à mão: docker compose -f docker-compose.prod.yml exec -T backend node scripts/aplicar-seeds-producao.ts
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const SEEDS = [
    "seed-trilha-csharp-dotnet.ts",
    "seed-trilha-mensageria-rabbitmq.ts",
    "seed-trilha-observabilidade.ts",
    "seed-trilha-aws-na-pratica.ts",
    "seed-detalhes-trilhas.ts",
    "seed-conquistas-trilhas.ts",
];

// Confere a lista inteira antes de rodar o primeiro, para um nome errado não
// deixar a release aplicada pela metade.
const faltando = SEEDS.filter((s) => !existsSync(path.join(import.meta.dirname, s)));
if (faltando.length > 0) {
    console.error(`Seeds não encontrados: ${faltando.join(", ")}`);
    process.exit(1);
}

for (const seed of SEEDS) {
    console.log(`==> ${seed}`);
    const r = spawnSync(process.execPath, [path.join(import.meta.dirname, seed)], {
        stdio: "inherit",
    });
    if (r.status !== 0) {
        console.error(
            `Seed falhou: ${seed} (${r.error?.message ?? `saída ${r.status ?? r.signal}`})`,
        );
        process.exit(1);
    }
}
console.log(`Seeds aplicados: ${SEEDS.length}.`);
