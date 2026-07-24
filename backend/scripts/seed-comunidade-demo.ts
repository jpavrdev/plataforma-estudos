// Seed de DEMONSTRAÇÃO da comunidade (apenas para desenvolvimento local).
// Cria alguns usuários fictícios, publicações, curtidas, comentários e follows
// para visualizar o feed. Idempotente: se os usuários demo já existem, não repete.
// NÃO deve ser rodado em produção; lá a comunidade começa vazia e é preenchida
// pelos usuários reais.
//
// Rodar local: docker compose exec -T backend node scripts/seed-comunidade-demo.ts
import { db } from "../db.ts";
import {
    users,
    lessons,
    lessonProgress,
    communityPosts,
    communityPostTags,
    communityLikes,
    communityComments,
    userFollows,
} from "../schema.ts";
import { eq, inArray } from "drizzle-orm";

type DemoUser = {
    chave: string;
    name: string;
    username: string;
    email: string;
    nivelAulas: number; // quantas aulas concluídas (define o nível exibido)
};

const DEMO: DemoUser[] = [
    { chave: "camila", name: "Camila Rocha", username: "mila_dev", email: "camila.demo@ensinadev.local", nivelAulas: 28 },
    { chave: "lucas", name: "Lucas Pereira", username: "lucaspereira", email: "lucas.demo@ensinadev.local", nivelAulas: 40 },
    { chave: "aisha", name: "Aisha Santos", username: "aisha", email: "aisha.demo@ensinadev.local", nivelAulas: 33 },
    { chave: "diego", name: "Diego Ramos", username: "diegoramos", email: "diego.demo@ensinadev.local", nivelAulas: 46 },
    { chave: "marina", name: "Marina Alves", username: "marinaalves", email: "marina.demo@ensinadev.local", nivelAulas: 52 },
    { chave: "elena", name: "Elena Souza", username: "elenasouza", email: "elena.demo@ensinadev.local", nivelAulas: 36 },
    { chave: "bruno", name: "Bruno Costa", username: "brunocosta", email: "bruno.demo@ensinadev.local", nivelAulas: 18 },
];

const CODE_WHILE = `let i = 0;
while (i < 5) {
  console.log(i);
  // i++  <- esqueci disto
}`;

const CODE_HASH = `function soma(nums, alvo) {
  const mapa = {};
  for (let i = 0; i < nums.length; i++) {
    const falta = alvo - nums[i];
    if (falta in mapa) return [mapa[falta], i];
    mapa[nums[i]] = i;
  }
}`;

const CODE_RECURSAO = `// iterativo: sem risco de estourar a pilha
function fatorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}`;

type DemoPost = {
    autor: string;
    kind: "duvida" | "solucao" | "conquista" | "post";
    content: string;
    code?: string;
    codeLanguage?: string;
    tags: string[];
    horasAtras: number;
    curtidasDe: string[];
    comentarios: { autor: string; texto: string; horasAtras: number }[];
};

const POSTS: DemoPost[] = [
    {
        autor: "camila",
        kind: "duvida",
        content:
            "Alguém consegue explicar por que meu while não para de rodar? Acho que esqueci de incrementar o contador, mas não tô achando o erro.",
        code: CODE_WHILE,
        codeLanguage: "javascript",
        tags: ["logica", "while"],
        horasAtras: 2,
        curtidasDe: ["lucas", "aisha", "diego", "marina"],
        comentarios: [
            { autor: "diego", texto: "Faltou o i++ dentro do while. Do jeito que está, i nunca muda e a condição i < 5 é sempre verdadeira.", horasAtras: 1 },
            { autor: "aisha", texto: "Isso, descomenta o i++ que resolve. Loop infinito clássico. :)", horasAtras: 1 },
        ],
    },
    {
        autor: "lucas",
        kind: "conquista",
        content:
            "Finalmente concluí a trilha de JavaScript Essencial, foram 30 aulas! Três semanas de prática diária. Agora bora pros algoritmos.",
        tags: ["javascript", "conquista"],
        horasAtras: 4,
        curtidasDe: ["camila", "aisha", "marina", "elena", "bruno"],
        comentarios: [{ autor: "marina", texto: "Parabéns! A parte de algoritmos é onde tudo faz sentido, vai gostar.", horasAtras: 3 }],
    },
    {
        autor: "aisha",
        kind: "solucao",
        content:
            "Resolvi o desafio de hoje (Soma de Dois Números) com hash table, O(n) em vez de O(n²). Compartilhando a ideia:",
        code: CODE_HASH,
        codeLanguage: "javascript",
        tags: ["array", "hashtable"],
        horasAtras: 6,
        curtidasDe: ["camila", "lucas", "diego"],
        comentarios: [{ autor: "elena", texto: "Boa! Sempre esqueço de usar mapa pra evitar o loop dobrado. Obrigada por compartilhar.", horasAtras: 5 }],
    },
    {
        autor: "marina",
        kind: "duvida",
        content: "Qual a diferença real entre let, const e var? Sei que const não deixa reatribuir, mas e o escopo?",
        tags: ["javascript"],
        horasAtras: 9,
        curtidasDe: ["camila", "bruno"],
        comentarios: [],
    },
    {
        autor: "bruno",
        kind: "duvida",
        content: "Alguém tem um bom material sobre Big O? Entendo a ideia, mas travo na hora de calcular a complexidade.",
        tags: ["algoritmos"],
        horasAtras: 11,
        curtidasDe: ["aisha"],
        comentarios: [],
    },
    {
        autor: "elena",
        kind: "solucao",
        content: "Recursão vs iteração: quando usar cada um? Fiz um resumo do que aprendi na trilha de algoritmos.",
        code: CODE_RECURSAO,
        codeLanguage: "javascript",
        tags: ["algoritmos", "recursao"],
        horasAtras: 14,
        curtidasDe: ["aisha", "marina"],
        comentarios: [],
    },
    {
        autor: "diego",
        kind: "post",
        content:
            "Dica rápida: leiam a mensagem de erro inteira antes de sair mudando o código. Na maioria das vezes ela já diz a linha e o motivo.",
        tags: ["carreira", "dicas"],
        horasAtras: 20,
        curtidasDe: ["camila", "lucas", "aisha", "marina", "elena", "bruno"],
        comentarios: [{ autor: "bruno", texto: "Demorei pra aprender isso. Stack trace é amigo, não inimigo.", horasAtras: 19 }],
    },
    {
        autor: "bruno",
        kind: "post",
        content:
            "Dicas para destravar em lógica de programação: resolvam 1 exercício fácil por dia sem pular. A consistência vence o talento.",
        tags: ["logica", "carreira"],
        horasAtras: 28,
        curtidasDe: ["camila", "marina"],
        comentarios: [],
    },
];

// followerChave -> [seguidos]
const FOLLOWS: Record<string, string[]> = {
    camila: ["aisha", "diego", "marina"],
    lucas: ["marina", "diego"],
    aisha: ["camila", "elena"],
    bruno: ["diego", "bruno"],
};

function horas(n: number): Date {
    return new Date(Date.now() - n * 3600_000);
}

async function main() {
    const emails = DEMO.map((d) => d.email);
    const existentes = await db.select({ email: users.email }).from(users).where(inArray(users.email, emails));
    if (existentes.length > 0) {
        console.log("Usuários demo já existem. Nada a fazer (idempotente).");
        return;
    }

    // Pool de lições reais para atribuir progresso (e, com ele, nível).
    const poolLicoes = await db.select({ id: lessons.id }).from(lessons).limit(60);
    if (poolLicoes.length === 0) {
        console.log("Sem lições no banco; rode os seeds de trilha antes. Abortando.");
        return;
    }

    const idPorChave = new Map<string, string>();
    for (const d of DEMO) {
        const [u] = await db
            .insert(users)
            .values({
                name: d.name,
                username: d.username,
                email: d.email,
                emailVerifiedAt: new Date(),
            })
            .returning({ id: users.id });
        idPorChave.set(d.chave, u.id);

        const qtd = Math.min(d.nivelAulas, poolLicoes.length);
        if (qtd > 0) {
            await db
                .insert(lessonProgress)
                .values(poolLicoes.slice(0, qtd).map((l) => ({ userId: u.id, lessonId: l.id, manual: false })))
                .onConflictDoNothing();
        }
    }

    let nPosts = 0;
    let nComent = 0;
    let nLikes = 0;
    for (const p of POSTS) {
        const autorId = idPorChave.get(p.autor)!;
        const [post] = await db
            .insert(communityPosts)
            .values({
                userId: autorId,
                kind: p.kind,
                content: p.content,
                code: p.code ?? null,
                codeLanguage: p.code ? (p.codeLanguage ?? null) : null,
                createdAt: horas(p.horasAtras),
            })
            .returning({ id: communityPosts.id });
        nPosts++;

        if (p.tags.length) {
            await db
                .insert(communityPostTags)
                .values(p.tags.map((tag) => ({ postId: post.id, tag })))
                .onConflictDoNothing();
        }
        for (const chave of p.curtidasDe) {
            await db
                .insert(communityLikes)
                .values({ postId: post.id, userId: idPorChave.get(chave)!, createdAt: horas(p.horasAtras - 0.2) })
                .onConflictDoNothing();
            nLikes++;
        }
        for (const c of p.comentarios) {
            await db.insert(communityComments).values({
                postId: post.id,
                userId: idPorChave.get(c.autor)!,
                content: c.texto,
                createdAt: horas(c.horasAtras),
            });
            nComent++;
        }
    }

    let nFollows = 0;
    for (const [seguidor, seguidos] of Object.entries(FOLLOWS)) {
        for (const alvo of seguidos) {
            if (seguidor === alvo) continue;
            await db
                .insert(userFollows)
                .values({ followerId: idPorChave.get(seguidor)!, followingId: idPorChave.get(alvo)! })
                .onConflictDoNothing();
            nFollows++;
        }
    }

    console.log(
        `Comunidade demo criada: ${DEMO.length} usuários, ${nPosts} posts, ${nComent} comentários, ${nLikes} curtidas, ${nFollows} follows.`,
    );
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
