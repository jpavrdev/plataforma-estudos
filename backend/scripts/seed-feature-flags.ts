// Feature flags e allowlist do beta fechado (idempotente). Este arquivo é a fonte
// da verdade dos flags: mude o status aqui e rode de novo pra fazer o rollout
// (off -> beta -> on). A allowlist é aditiva: remover um email daqui não revoga
// acesso já concedido (revogação é manual, por SQL).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-feature-flags.ts
import { db } from "../db.ts";
import { featureFlags, featureFlagUsers, users } from "../schema.ts";
import { eq } from "drizzle-orm";

type Status = "off" | "beta" | "on";

const FLAGS: { key: string; description: string; status: Status }[] = [
    {
        key: "projetos-guiados",
        description: "Projetos guiados em etapas verificadas pelo runner",
        status: "off",
    },
];

// Emails com acesso enquanto o flag correspondente está em "beta".
const ALLOWLIST: Record<string, string[]> = {
    "projetos-guiados": [],
};

async function seed() {
    for (const f of FLAGS) {
        const [existente] = await db.select().from(featureFlags).where(eq(featureFlags.key, f.key));
        if (!existente) {
            await db.insert(featureFlags).values(f);
            console.log(`Flag criado: ${f.key} (${f.status})`);
        } else if (existente.status !== f.status || existente.description !== f.description) {
            await db
                .update(featureFlags)
                .set({ status: f.status, description: f.description })
                .where(eq(featureFlags.id, existente.id));
            console.log(`Flag ${f.key}: ${existente.status} -> ${f.status}`);
        }
    }

    let liberados = 0;
    for (const [key, emails] of Object.entries(ALLOWLIST)) {
        const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
        if (!flag) {
            console.log(`Allowlist ignorada, flag não existe: ${key}`);
            continue;
        }
        for (const email of emails) {
            const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
            if (!u) {
                console.log(`Usuário não encontrado, pulando: ${email}`);
                continue;
            }
            const inserido = await db
                .insert(featureFlagUsers)
                .values({ flagId: flag.id, userId: u.id })
                .onConflictDoNothing()
                .returning();
            if (inserido.length) liberados++;
        }
    }
    console.log(`Concluído: ${FLAGS.length} flags garantidos, ${liberados} novas liberações.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed de feature flags:", e);
        process.exit(1);
    });
