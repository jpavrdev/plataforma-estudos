// Seed do desafio "Two Sum" no formato função (estilo LeetCode). Idempotente por título.
//
// Rodar em dev:  node --env-file=.env scripts/seed-desafio-twosum.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq } from "drizzle-orm";

const TITULO = "Two Sum";

const BLOCOS = [
    {
        type: "text",
        value: "Dado um vetor de inteiros `nums` e um inteiro `alvo`, retorne os **índices** dos dois números cuja soma é igual a `alvo`.",
    },
    {
        type: "text",
        value: "Cada entrada tem **exatamente uma** solução, e você não pode usar o mesmo elemento duas vezes. Retorne os índices em ordem crescente.",
    },
    {
        type: "text",
        value: "**Restrições**\n\n- `2 ≤ nums.length ≤ 10^4`\n- `-10^9 ≤ nums[i], alvo ≤ 10^9`\n- Existe exatamente uma resposta válida.",
    },
];

const STARTER = {
    python: `from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # sua solução aqui
        pass
`,
    javascript: `class Solution {
  /**
   * @param {number[]} nums
   * @param {number} target
   * @return {number[]}
   */
  twoSum(nums, target) {
    // sua solução aqui
  }
}
`,
};

// input = argumentos (JSON de [nums, target]); expectedOutput = retorno (JSON dos índices).
const TESTES = [
    { input: "[[2,7,11,15], 9]", expectedOutput: "[0,1]", isPublic: true },
    { input: "[[3,2,4], 6]", expectedOutput: "[1,2]", isPublic: true },
    { input: "[[3,3], 6]", expectedOutput: "[0,1]", isPublic: false },
    { input: "[[-1,-2,-3,-4,-5], -8]", expectedOutput: "[2,4]", isPublic: false },
    { input: "[[0,4,3,0], 0]", expectedOutput: "[0,3]", isPublic: false },
];

async function main() {
    const [existe] = await db.select().from(challenges).where(eq(challenges.title, TITULO));
    if (existe) {
        console.log(`Desafio "${TITULO}" já existe (${existe.id}). Nada a fazer.`);
        return;
    }
    const [d] = await db
        .insert(challenges)
        .values({
            number: 2,
            title: TITULO,
            topic: "Array · Hash Table",
            kind: "function",
            entryPoint: "twoSum",
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
    console.log(`Desafio "${TITULO}" criado (${d.id}) no formato função.`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
