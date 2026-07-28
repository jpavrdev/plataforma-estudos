// Coloca o bloco de laboratório nas aulas de Linux onde ele funciona de verdade.
// Idempotente: aula que já tem lab é ignorada.
//
// A lista não é todo o conteúdo da trilha de propósito. Foi conferida rodando os
// comandos dentro do ambiente real do lab:
//   módulos 2, 3, 4 e 5 passam, inclusive strace e useradd, porque o user
//   namespace concede essas capacidades dentro dele;
//   módulo 6 (systemd, journalctl, apt, cron) e módulo 7 (ssh, mount, fdisk)
//   falham, porque o lab roda sem rede e sem systemd como PID 1. Pôr um terminal
//   nessas aulas só frustraria o aluno.
// As aulas puramente conceituais também ficam de fora: sem comando para rodar,
// o terminal seria enfeite.
//
// Rodar:   docker compose exec -T backend node scripts/adicionar-labs-linux.ts [--dry]
// Em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/adicionar-labs-linux.ts [--dry]
import { db } from "../db.ts";
import { trails, modules, lessons } from "../schema.ts";
import { eq, asc } from "drizzle-orm";

const NOME_TRILHA = "Linux e Linha de Comando";

// Chave: posição do módulo. Valor: títulos das aulas que recebem laboratório.
const AULAS_COM_LAB: Record<number, string[]> = {
    1: ["O filesystem hierarchy (FHS)", "Usuários e o modelo de acesso"],
    2: ["Shell e terminal", "Navegação e arquivos", "Ver e editar arquivos", "Pipes e redirecionamento", "Busca"],
    3: [
        "Permissões de arquivo",
        "Usuários e grupos",
        "sudo e privilégio",
        "Processos",
        "Sinais e controle de processos",
    ],
    4: ["Chamadas de sistema (syscalls)", "Observar syscalls com strace", "/proc e /sys"],
    5: ["Um script Bash", "Variáveis e argumentos", "Condicionais", "Loops e funções", "Robustez e um script real"],
};

type Bloco = { type: string; value: string };

async function main() {
    const dry = process.argv.includes("--dry");
    const [trilha] = await db.select().from(trails).where(eq(trails.name, NOME_TRILHA));
    if (!trilha) {
        console.error(`Trilha "${NOME_TRILHA}" não encontrada.`);
        process.exit(1);
    }

    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trilha.id))
        .orderBy(asc(modules.position));

    let adicionados = 0;
    let jaTinham = 0;
    const naoEncontradas: string[] = [];

    for (const [posStr, titulos] of Object.entries(AULAS_COM_LAB)) {
        const mod = mods.find((m) => m.position === Number(posStr));
        if (!mod) {
            naoEncontradas.push(`módulo ${posStr}`);
            continue;
        }
        const aulas = await db.select().from(lessons).where(eq(lessons.moduleId, mod.id));
        for (const titulo of titulos) {
            const aula = aulas.find((a) => a.title === titulo);
            if (!aula) {
                naoEncontradas.push(`${posStr}: ${titulo}`);
                continue;
            }
            const blocos = (aula.contentBlocks ?? []) as Bloco[];
            if (blocos.some((b) => b.type === "terminal")) {
                jaTinham++;
                continue;
            }
            adicionados++;
            if (dry) continue;
            await db
                .update(lessons)
                .set({ contentBlocks: [...blocos, { type: "terminal", value: "" }] })
                .where(eq(lessons.id, aula.id));
        }
    }

    naoEncontradas.forEach((n) => console.warn("aula não encontrada:", n));
    console.log(
        `\n${dry ? "[DRY] " : ""}Laboratórios adicionados: ${adicionados}. Já tinham: ${jaTinham}.`,
    );
    process.exit(0);
}

main().catch((e) => {
    console.error("Falha ao adicionar os laboratórios:", e);
    process.exit(1);
});
