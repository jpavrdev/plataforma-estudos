// Seed das conquistas de streak e de desafios por dificuldade. Idempotente por nome:
// insere só as que ainda não existem, então pode rodar de novo sem duplicar.
// As de trilha e de simulado não vivem aqui: são selos derivados, calculados na tela.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-conquistas.ts
import { db } from "../db.ts";
import { achievements } from "../schema.ts";
import { eq } from "drizzle-orm";

type Criterio = "streak_days" | "challenges_facil" | "challenges_medio" | "challenges_dificil";

interface Conquista {
    name: string;
    description: string;
    icon: "flame" | "check" | "bug" | "medal";
    criteriaType: Criterio;
    threshold: number;
}

const CONQUISTAS: Conquista[] = [
    // Streak: dias corridos de estudo (vale o recorde, não some se o streak cair).
    {
        name: "Pegando o ritmo",
        description: "Estude em 3 dias seguidos.",
        icon: "flame",
        criteriaType: "streak_days",
        threshold: 3,
    },
    {
        name: "Uma semana firme",
        description: "Estude em 7 dias seguidos.",
        icon: "flame",
        criteriaType: "streak_days",
        threshold: 7,
    },
    {
        name: "Duas semanas na linha",
        description: "Estude em 14 dias seguidos.",
        icon: "flame",
        criteriaType: "streak_days",
        threshold: 14,
    },
    {
        name: "Um mês sem falhar",
        description: "Estude em 30 dias seguidos.",
        icon: "flame",
        criteriaType: "streak_days",
        threshold: 30,
    },
    {
        name: "Cem dias de fogo",
        description: "Estude em 100 dias seguidos.",
        icon: "flame",
        criteriaType: "streak_days",
        threshold: 100,
    },
    // Desafios fáceis.
    {
        name: "Quebrou o gelo",
        description: "Resolva seu primeiro desafio fácil.",
        icon: "check",
        criteriaType: "challenges_facil",
        threshold: 1,
    },
    {
        name: "Dez fáceis no bolso",
        description: "Resolva 10 desafios fáceis.",
        icon: "check",
        criteriaType: "challenges_facil",
        threshold: 10,
    },
    {
        name: "Fácil no automático",
        description: "Resolva 25 desafios fáceis.",
        icon: "check",
        criteriaType: "challenges_facil",
        threshold: 25,
    },
    // Desafios médios.
    {
        name: "Subiu de nível",
        description: "Resolva seu primeiro desafio médio.",
        icon: "bug",
        criteriaType: "challenges_medio",
        threshold: 1,
    },
    {
        name: "Dez médios resolvidos",
        description: "Resolva 10 desafios médios.",
        icon: "bug",
        criteriaType: "challenges_medio",
        threshold: 10,
    },
    {
        name: "Médio sem susto",
        description: "Resolva 25 desafios médios.",
        icon: "bug",
        criteriaType: "challenges_medio",
        threshold: 25,
    },
    // Desafios difíceis (marcas menores, são os mais raros de resolver).
    {
        name: "Encarou o difícil",
        description: "Resolva seu primeiro desafio difícil.",
        icon: "medal",
        criteriaType: "challenges_dificil",
        threshold: 1,
    },
    {
        name: "Cinco difíceis",
        description: "Resolva 5 desafios difíceis.",
        icon: "medal",
        criteriaType: "challenges_dificil",
        threshold: 5,
    },
    {
        name: "Difícil é comigo",
        description: "Resolva 15 desafios difíceis.",
        icon: "medal",
        criteriaType: "challenges_dificil",
        threshold: 15,
    },
];

async function seed() {
    let criadas = 0;
    let existentes = 0;
    for (const c of CONQUISTAS) {
        const [existe] = await db
            .select({ id: achievements.id })
            .from(achievements)
            .where(eq(achievements.name, c.name));
        if (existe) {
            existentes++;
            continue;
        }
        await db.insert(achievements).values(c);
        criadas++;
    }
    console.log(`Conquistas: ${criadas} criadas, ${existentes} ja existiam.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
