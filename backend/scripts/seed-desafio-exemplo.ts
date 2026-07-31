// Seed de um desafio de exemplo no formato entrada/saída (stdin). Idempotente: se o
// desafio já existir, só completa as linguagens que faltam no starter. O desafio do
// dia é escolhido automaticamente pelo sistema, então este não fixa data.
//
// Rodar em dev:  node --env-file=.env scripts/seed-desafio-exemplo.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-desafio-exemplo.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq, sql } from "drizzle-orm";

const TITULO = "Soma de dois números";

const BLOCOS = [
    {
        type: "text",
        value: "Leia dois números inteiros `a` e `b` na mesma linha, separados por um espaço, e imprima a soma deles.",
    },
    {
        type: "text",
        value: "A entrada tem uma única linha com os dois inteiros. A saída deve conter apenas o valor de `a + b`.",
    },
    {
        type: "text",
        value: "**Restrições**\n\n- `-10⁹ ≤ a, b ≤ 10⁹`\n- Os dois números vêm na mesma linha, separados por um espaço.",
    },
];

// Andaime que lê a entrada; a solução fica por conta do aluno.
const STARTER = {
    javascript: `const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(' ').map(Number);

// Imprima a soma com console.log(...)
`,
    python: `a, b = map(int, input().split())

# Imprima a soma com print(...)
`,
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();

        // Imprima a soma com System.out.println(...)
    }
}
`,
};

const TESTES = [
    { input: "2 3\n", expectedOutput: "5", isPublic: true },
    { input: "10 20\n", expectedOutput: "30", isPublic: true },
    { input: "-5 5\n", expectedOutput: "0", isPublic: false },
    { input: "1000 2000\n", expectedOutput: "3000", isPublic: false },
];

async function main() {
    const [existe] = await db.select().from(challenges).where(eq(challenges.title, TITULO));
    if (existe) {
        const atual = existe.starterCode ?? {};
        const faltando = Object.keys(STARTER).filter((lang) => !atual[lang]);
        if (faltando.length === 0) {
            console.log(`Desafio de exemplo já existe (${existe.id}). Nada a fazer.`);
            return;
        }
        const completo = { ...atual };
        for (const lang of faltando) completo[lang] = STARTER[lang as keyof typeof STARTER];
        await db
            .update(challenges)
            .set({ starterCode: completo })
            .where(eq(challenges.id, existe.id));
        console.log(`Desafio de exemplo já existia; starter de ${faltando.join(", ")} adicionado.`);
        return;
    }
    const [{ max }] = await db
        .select({ max: sql<number>`coalesce(max(${challenges.number}), 0)` })
        .from(challenges);
    const [d] = await db
        .insert(challenges)
        .values({
            number: Number(max) + 1,
            title: TITULO,
            topic: "Array · Matemática",
            statementBlocks: BLOCOS,
            difficulty: "facil",
            starterCode: STARTER,
            activeDate: null,
            published: true,
        })
        .returning();
    await db
        .insert(challengeTests)
        .values(TESTES.map((t, i) => ({ challengeId: d.id, ...t, position: i + 1 })));
    console.log(`Desafio de exemplo criado (${d.id}).`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
