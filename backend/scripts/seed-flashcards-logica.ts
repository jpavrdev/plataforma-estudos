// Cartões de revisão do módulo 1 da trilha Lógica de Programação.
//
// A régua, que o próprio script confere antes de gravar qualquer coisa:
//
// 1. Um fato por cartão. Verso com "e" ligando duas ideias vira dois cartões.
// 2. A frente se sustenta sozinha, é sempre uma pergunta e não depende de alternativas.
// 3. Verso de no máximo 90 caracteres. Cartão que exige ler parágrafo não é cartão.
// 4. O cartão NÃO repete as questões do quiz da aula. Isto é o ponto da feature: a
//    aula ensina bem mais que cinco fatos, e o quiz já cobrou os cinco. Os cartões
//    cobrem o que sobrou.
// 5. Sem travessão e sem emoji, como no resto da casa.
//
// A trilha tem duas variantes de cada aula (JavaScript e Python). As aulas 1 a 4 são
// iguais nas duas, então os mesmos cartões valem para as duas; a aula 5 muda de
// verdade (console.log x print) e tem cartão próprio.
//
// Idempotente: cartão já gravado para a aula é pulado pela frente.
//
// Rodar: node scripts/seed-flashcards-logica.ts
import { db } from "../db.ts";
import { flashcards, lessons, modules, trails } from "../schema.ts";
import { and, eq } from "drizzle-orm";

const TRILHA = "Lógica de Programação";
const MODULO = 1;
const VERSO_MAX = 90;

interface Cartao {
    frente: string;
    verso: string;
}

// Aulas 1 a 4: mesmo conteúdo nas duas linguagens.
const NEUTROS: Record<number, Cartao[]> = {
    1: [
        {
            frente: "Um algoritmo precisa de um computador para existir?",
            verso: "Não. Receita de bolo e troca de pneu são algoritmos sem computador nenhum.",
        },
        {
            frente: "Por que 'misture os ingredientes' é um passo ruim de algoritmo?",
            verso: "É vago: não diz o que misturar nem em que ordem, então depende de adivinhação.",
        },
        {
            frente: "O que falta no computador e obriga o programador a escrever todo passo?",
            verso: "Senso comum. Ele não completa a etapa que você esqueceu de escrever.",
        },
        {
            frente: "O que o computador faz com as linhas de comentário quando roda o programa?",
            verso: "Nada. Comentário não é executado, serve para organizar o raciocínio.",
        },
    ],
    2: [
        {
            frente: "Reconhecer um padrão que se repete costuma levar a criar o quê, no código?",
            verso: "Uma função, reaproveitada em vez de reescrever a mesma lógica toda vez.",
        },
        {
            frente: "Deixar detalhes de fora da solução, na abstração, é preguiça?",
            verso: "Não, é foco: fica só o que importa para resolver aquele problema.",
        },
        {
            frente: "O que costuma acontecer com quem encara um problema grande sem decompor?",
            verso: "Trava, porque tenta resolver tudo de uma vez só.",
        },
        {
            frente: "Um padrão deixa de valer quando os detalhes da situação mudam?",
            verso: "Não. Trocar a lâmpada da cozinha ou do quarto segue os mesmos passos.",
        },
    ],
    3: [
        {
            frente: "No exemplo do liquidificador, o que faz o papel de saída?",
            verso: "O suco pronto, depois de bater as frutas com a água.",
        },
        {
            frente: "Toda saída de um programa aparece na tela?",
            verso: "Não. Pode ser um som, um arquivo salvo ou uma mensagem a outro programa.",
        },
        {
            frente: "Por que o processamento é chamado de parte pensante do programa?",
            verso: "É onde a entrada vira alguma coisa nova ou mais útil.",
        },
        {
            frente: "O que um programa sem nenhuma entrada tem para trabalhar?",
            verso: "Quase nada: sem informação recebida, não há o que somar ou comparar.",
        },
    ],
    4: [
        {
            frente: "Em um fluxograma, o que significa a caixa em formato de losango?",
            verso: "Uma decisão: a pergunta que leva o algoritmo a caminhos diferentes.",
        },
        {
            frente: "Dá para executar um pseudocódigo no computador?",
            verso: "Não. Ele é rascunho em português, não é linguagem de programação.",
        },
        {
            frente: "Ao rascunhar um algoritmo, o que vem primeiro: o 'o quê' ou o 'como'?",
            verso: "O 'o quê', os passos que resolvem o problema. A sintaxe fica para depois.",
        },
        {
            frente: "Em um fluxograma, qual formato representa um passo que faz algo, como calcular?",
            verso: "O retângulo, reservado às ações do algoritmo.",
        },
    ],
};

const AULA5_JS: Cartao[] = [
    {
        frente: "O que acontece em JavaScript ao escrever Console.log com C maiúsculo?",
        verso: "Dá erro. O comando diferencia maiúsculas e se escreve console.log.",
    },
    {
        frente: "Esquecer o ponto e vírgula no fim da instrução quebra o código JavaScript?",
        verso: "Quase sempre não, mas fechar cada instrução com ; é a boa prática.",
    },
    {
        frente: "Onde entra, no comando console.log, aquilo que você quer mostrar?",
        verso: "Dentro dos parênteses de .log( ), que significa escrever no console.",
    },
    {
        frente: "Além de mostrar mensagem, para que o console serve no dia a dia?",
        verso: "Para entender por que um programa não se comporta como o esperado.",
    },
];

const AULA5_PY: Cartao[] = [
    {
        frente: "O que acontece em Python ao escrever Print com P maiúsculo?",
        verso: "Dá erro. O Python diferencia maiúsculas e o comando é print.",
    },
    {
        frente: "Python exige ponto e vírgula no fim da instrução?",
        verso: "Não. O próprio fim da linha já marca que o comando terminou ali.",
    },
    {
        frente: "O que acontece ao abrir um texto com aspas duplas e fechar com aspas simples?",
        verso: "O Python não acha o fim do texto e aponta erro de sintaxe.",
    },
    {
        frente: "Além de mostrar mensagem, para que o terminal serve no dia a dia?",
        verso: "Para entender por que um programa não se comporta como o esperado.",
    },
];

const PROIBIDOS = [
    /—/,
    /qual das (op[çc][õo]es|alternativas)/i,
    /assinale/i,
    /alternativa correta/i,
    /\b[IVX]{2,}\b/,
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
];

function conferir(cartoes: Cartao[], onde: string): string[] {
    const erros: string[] = [];
    const vistos = new Set<string>();
    for (const c of cartoes) {
        const rotulo = `${onde}: "${c.frente.slice(0, 45)}..."`;
        if (!c.frente.trim().endsWith("?")) erros.push(`${rotulo} frente não é pergunta`);
        if (c.verso.length > VERSO_MAX)
            erros.push(`${rotulo} verso com ${c.verso.length} caracteres (máx ${VERSO_MAX})`);
        if (vistos.has(c.frente)) erros.push(`${rotulo} frente repetida`);
        vistos.add(c.frente);
        for (const p of PROIBIDOS)
            if (p.test(c.frente) || p.test(c.verso)) erros.push(`${rotulo} casa com ${p}`);
    }
    return erros;
}

async function semear() {
    const erros = [
        ...Object.entries(NEUTROS).flatMap(([pos, cs]) => conferir(cs, `aula ${pos}`)),
        ...conferir(AULA5_JS, "aula 5 js"),
        ...conferir(AULA5_PY, "aula 5 python"),
    ];
    if (erros.length) {
        console.error(`QC reprovou ${erros.length} cartão(ões). Nada foi gravado:`);
        for (const e of erros) console.error(`  ${e}`);
        process.exit(1);
    }

    const [trilha] = await db.select().from(trails).where(eq(trails.name, TRILHA));
    if (!trilha) {
        console.log(`Trilha "${TRILHA}" não encontrada. Nada feito.`);
        return;
    }
    const [modulo] = await db
        .select()
        .from(modules)
        .where(and(eq(modules.trailId, trilha.id), eq(modules.position, MODULO)));
    if (!modulo) {
        console.log(`Módulo ${MODULO} de "${TRILHA}" não encontrado. Nada feito.`);
        return;
    }

    const aulas = await db.select().from(lessons).where(eq(lessons.moduleId, modulo.id));

    let criados = 0;
    let pulados = 0;
    for (const aula of aulas) {
        const doIdioma =
            aula.position === 5
                ? aula.language === "python"
                    ? AULA5_PY
                    : AULA5_JS
                : (NEUTROS[aula.position] ?? []);
        if (!doIdioma.length) continue;

        const existentes = new Set(
            (
                await db
                    .select({ frente: flashcards.frente })
                    .from(flashcards)
                    .where(eq(flashcards.lessonId, aula.id))
            ).map((f) => f.frente),
        );

        const novos = doIdioma
            .map((c, i) => ({ lessonId: aula.id, frente: c.frente, verso: c.verso, position: i }))
            .filter((c) => !existentes.has(c.frente));
        pulados += doIdioma.length - novos.length;
        if (!novos.length) continue;
        await db.insert(flashcards).values(novos);
        criados += novos.length;
    }

    console.log(
        `Cartoes de "${TRILHA}" modulo ${MODULO}: ${criados} criado(s), ${pulados} ja existia(m).`,
    );
}

semear()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao semear os cartoes:", e);
        process.exit(1);
    });
