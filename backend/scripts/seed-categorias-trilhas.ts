// Cria as tags de categoria e as associa às trilhas (idempotente). Reaproveita o
// sistema de tags que já existe (tabela tags + trail_tags), sem migração.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-categorias-trilhas.ts
import { db } from "../db.ts";
import { trails, tags, trailTags } from "../schema.ts";
import { eq } from "drizzle-orm";

const MAPA: Record<string, string[]> = {
    "AWS CLF-C02": ["Nuvem"],
    "AWS DVA-C02": ["Nuvem"],
    "AZURE AZ-900": ["Nuvem"],
    "AZURE DP-900": ["Nuvem", "Dados"],
    "AZURE AI-900": ["Nuvem", "IA"],
    "AZURE AI-901": ["Nuvem", "IA"],
    "AZURE SC-900": ["Nuvem", "Cibersegurança"],
    HTML: ["Front-end"],
    CSS: ["Front-end"],
    JavaScript: ["Front-end"],
    "UI/UX Design": ["Front-end"],
    "Fundamentos de Cibersegurança": ["Cibersegurança"],
    "Segurança de Aplicações Web": ["Cibersegurança", "Front-end"],
    "ISC2 Certified in Cybersecurity (CC)": ["Cibersegurança"],
    "Fundamentos de QA": ["QA"],
    "Testes e Qualidade": ["QA"],
    "Testes E2E com Cypress e Playwright": ["QA", "Front-end"],
};

async function seed() {
    const nomes = [...new Set(Object.values(MAPA).flat())];
    const idPorTag = new Map<string, string>();
    for (const nome of nomes) {
        let [tag] = await db.select().from(tags).where(eq(tags.name, nome));
        if (!tag) {
            [tag] = await db.insert(tags).values({ name: nome }).returning();
            console.log("Tag criada: " + nome);
        }
        idPorTag.set(nome, tag.id);
    }

    let assoc = 0;
    for (const [nomeTrilha, cats] of Object.entries(MAPA)) {
        const [trilha] = await db.select().from(trails).where(eq(trails.name, nomeTrilha));
        if (!trilha) {
            console.log("Trilha não encontrada, pulando: " + nomeTrilha);
            continue;
        }
        for (const cat of cats) {
            const inserida = await db
                .insert(trailTags)
                .values({ trailId: trilha.id, tagId: idPorTag.get(cat)! })
                .onConflictDoNothing()
                .returning();
            if (inserida.length) assoc++;
        }
    }
    console.log(`Concluído: ${nomes.length} tags garantidas, ${assoc} novas associações.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao categorizar trilhas:", e);
        process.exit(1);
    });
