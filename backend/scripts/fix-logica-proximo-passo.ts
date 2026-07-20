// Corrige o fechamento da trilha Lógica de Programação, que cravava "roadmap de Back-end"
// e a trilha "Protocolos da Web" como próximo passo. Como a trilha é estágio 1 de três
// roadmaps (Back-end, Ciência de Dados, Engenharia de Dados), o texto passa a ser neutro.
// Idempotente: só altera aulas que ainda tenham o texto antigo. Vale para as versões JS e Python.
//
// Rodar: docker compose exec -T backend node scripts/fix-logica-proximo-passo.ts
import { db } from "../db.ts";
import { trails, lessons } from "../schema.ts";
import { eq } from "drizzle-orm";

const PARES: [string, string][] = [
    [
        "O próximo passo do roadmap de Back-end é a trilha **Protocolos da Web**: como o navegador conversa com um servidor, o que é uma requisição HTTP, o que são métodos como GET e POST, e como essas trocas de mensagens formam a base de toda aplicação que roda na internet. É a mesma lógica que você aprendeu aqui, agora aplicada à comunicação entre máquinas.",
        "Daqui pra frente é seguir o seu roadmap: a próxima trilha vem logo depois desta. Essa base de lógica sustenta qualquer caminho, seja back-end, ciência de dados ou engenharia de dados, cada um aplicando o mesmo raciocínio a um problema diferente. Abra o seu roadmap e siga para a próxima parada, a base você já construiu.",
    ],
    [
        "Isso é lógica de programação, a base de tudo que vem a seguir. A próxima parada é entender como a web conversa: Protocolos da Web.",
        "Isso é lógica de programação, a base de tudo que vem a seguir. A próxima parada é a próxima trilha do seu roadmap.",
    ],
];

async function main() {
    const [t] = await db.select().from(trails).where(eq(trails.name, "Lógica de Programação"));
    if (!t) {
        console.error("Trilha 'Lógica de Programação' não encontrada.");
        process.exit(1);
    }
    const aulas = await db.select().from(lessons).where(eq(lessons.trailId, t.id));
    let alteradas = 0;
    for (const a of aulas) {
        const blocks = a.contentBlocks as { type: string; value: string }[] | null;
        if (!Array.isArray(blocks)) continue;
        let mudou = false;
        const novos = blocks.map((b) => {
            let v = b.value;
            for (const [antigo, novo] of PARES) {
                if (typeof v === "string" && v.includes(antigo)) {
                    v = v.split(antigo).join(novo);
                    mudou = true;
                }
            }
            return { ...b, value: v };
        });
        if (mudou) {
            await db.update(lessons).set({ contentBlocks: novos }).where(eq(lessons.id, a.id));
            alteradas++;
            console.log(`atualizada: "${a.title}" [${a.language ?? "-"}]`);
        }
    }
    console.log(`${alteradas} aulas atualizadas.`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha:", e);
        process.exit(1);
    });
