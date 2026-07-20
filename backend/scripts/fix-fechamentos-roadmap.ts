// Neutraliza o fechamento de trilhas fundamentais reaproveitadas em mais de um roadmap.
// Elas cravavam um roadmap/próxima trilha específicos (ex.: "roadmap de Back-end",
// "próximo passo: Autenticação"), o que engana quem chega por outro roadmap. O texto passa
// a apontar "a próxima trilha do seu roadmap" e as questões de quiz deixam de depender do roadmap.
// Casa o texto atual por âncora (não por string exata) e sincroniza banco + arquivo de seed.
// Idempotente: só altera o que ainda tem o texto antigo.
//
// Rodar: docker compose exec -T backend node scripts/fix-fechamentos-roadmap.ts
import { readFileSync, writeFileSync } from "node:fs";
import { db } from "../db.ts";
import { trails, lessons, questions, questionOptions } from "../schema.ts";
import { eq, asc } from "drizzle-orm";

const ARQUIVO: Record<string, string> = {
    "Python": "scripts/seed-trilha-python.ts",
    "Análise de Dados": "scripts/seed-trilha-analise-dados.ts",
    "Banco de Dados": "scripts/seed-trilha-banco-de-dados.ts",
    "CI/CD e Cloud": "scripts/seed-trilha-cicd-cloud.ts",
};

// Substituição de bloco inteiro (achado pela âncora dentro do value).
const BLOCOS: { trilha: string; ancora: string; novo: string }[] = [
    {
        trilha: "Python",
        ancora: "No roadmap de Ciência de Dados, os próximos passos são",
        novo: '## O que vem depois desta trilha\n\nFechando este módulo, vale olhar para trás: você saiu de "o que é um algoritmo" (lá na trilha de Lógica de Programação) para escrever Python de verdade, com tipos, controle de fluxo, listas, dicionários, funções, arquivos, tratamento de erros e um gostinho de classes. E nesta última aula, viu na prática por que uma lista de dicionários processada na mão é o tipo de tarefa que motivou a existência do pandas.\n\nDaqui pra frente, cada roadmap usa esse Python de um jeito: em ciência de dados ele vira a ferramenta da estatística e da análise com pandas; em engenharia de dados, a base para mexer com bancos, pipelines e processamento em escala. Abra o seu roadmap e siga para a próxima trilha, é ela que aponta o próximo passo.\n\nVocê já programa em Python. Agora é aplicar isso ao seu caminho.',
    },
    {
        trilha: "Análise de Dados",
        ancora: "Próximo passo: SQL e Banco de Dados",
        novo: '## Uma direção: SQL e bancos de dados\n\nNesta trilha, os dados sempre chegaram prontos, um CSV ou um dict pronto pra virar DataFrame. Uma direção natural a partir daqui é aprender SQL e bancos de dados: de onde esses dados realmente vêm, como ficam guardados em tabelas relacionais, como se escreve uma consulta com SELECT, WHERE, GROUP BY, e principalmente como se escreve o JOIN que você acabou de aprender aqui como merge. INNER JOIN, LEFT JOIN, RIGHT JOIN: os mesmos quatro tipos, a mesma lógica de linhas sem correspondência, só que direto no banco, antes mesmo do dado chegar num DataFrame.',
    },
    {
        trilha: "Análise de Dados",
        ancora: "Próximo passo: Visualização de Dados",
        novo: '## Uma direção: visualização de dados\n\nCada groupby, cada merge, cada limpeza desta trilha produziu uma tabela de resultado, e você leu essa tabela com print ou olhando os números. Isso funciona, mas um gráfico comunica um padrão muito mais rápido do que uma tabela cheia de números. A visualização de dados transforma esses mesmos DataFrames em gráficos com matplotlib e seaborn: o resumo da aula anterior, por exemplo, vira um gráfico de barras em uma linha de código.',
    },
    {
        trilha: "Análise de Dados",
        ancora: "O destino: Machine Learning",
        novo: '## Uma direção: machine learning\n\nNumPy, pandas, limpeza e junção de dados não são o fim da linha: são o que prepara o terreno para machine learning. Todo modelo de aprendizado de máquina recebe como entrada uma tabela numérica e limpa, sem valores faltando: exatamente o que você aprendeu a produzir aqui. Quanto melhor o dado que chega no modelo, melhor o modelo, e é por isso que essa trilha inteira valeu a pena antes mesmo de você treinar o primeiro modelo.\n\nQual dessas direções é a sua próxima trilha depende do seu roadmap. Abra o seu roadmap e siga por ele.',
    },
    {
        trilha: "Banco de Dados",
        ancora: "Chegamos à última aula da trilha de Banco de Dados",
        novo: '# Recapitulando e o próximo passo\n\nChegamos à última aula da trilha de Banco de Dados. Ao longo de sete módulos você saiu de "por que guardar dados em tabelas" até escrever uma migration e reconhecer um problema de performance escondido dentro de um ORM. Vale parar um instante e olhar o caminho inteiro antes de seguir para a próxima trilha do seu roadmap.',
    },
    {
        trilha: "Banco de Dados",
        ancora: "O roadmap de back-end segue agora para",
        novo: '## O próximo passo\n\nSeja qual for o seu roadmap, a próxima trilha vem logo depois desta e se apoia no que você construiu aqui. No caminho de back-end, por exemplo, a próxima é Autenticação: como uma aplicação identifica quem faz cada requisição, com login, senha e um token (como JWT) ou sessão. Ela não começa do zero, usa exatamente a tabela `usuarios` que você modelou aqui, com `email` único e senha guardada como hash. Em outros roadmaps, é a mesma base de modelagem e SQL que sustenta a etapa seguinte. Abra o seu roadmap e siga para a próxima trilha.',
    },
    {
        trilha: "Banco de Dados",
        ancora: "a começar pela próxima trilha, autenticação",
        novo: "Você chegou ao fim da trilha de Banco de Dados sabendo modelar dados em tabelas, consultá-los e modificá-los com SQL, criar relacionamentos e índices num PostgreSQL de verdade, conectar tudo isso a uma API com segurança, e usar um ORM sem perder de vista o que ele faz por baixo. Essa é a base que sustenta a próxima trilha do seu roadmap, seja ela qual for, aplicada exatamente sobre a modelagem que agora é sua.",
    },
    {
        trilha: "CI/CD e Cloud",
        ancora: "O próximo passo: Arquitetura & escala",
        novo: "## O próximo passo: operar em escala\n\nAté aqui, o desenho assumido foi relativamente simples: uma aplicação, talvez com mais de uma réplica, e um banco de dados, rodando atrás de um load balancer. Isso resolve a imensa maioria dos casos, e é o ponto de partida certo.\n\nMas em algum momento, se o produto crescer, esse desenho esbarra num limite: um serviço monolítico só, não importa quantas réplicas, começa a ficar difícil de escalar e manter conforme times e funcionalidades crescem junto. É aí que a arquitetura evolui: filas pra processar coisa pesada de forma assíncrona, cache pra tirar carga do banco, réplicas de banco pra leitura, e responsabilidades separadas em serviços menores conversando entre si. Esse é o tipo de tema que aparece mais adiante no seu roadmap.\n\nE o CI/CD que você aprendeu aqui não fica pra trás nessa evolução, pelo contrário: quanto mais peças o sistema tiver, mais importa ter uma esteira automática e confiável, pra colocar mudança no ar em qualquer uma delas sem medo.",
    },
];

// Renomeia título de aula.
const TITULOS: { trilha: string; antigo: string; novo: string }[] = [
    { trilha: "Banco de Dados", antigo: "Recapitulando e o próximo passo: autenticação", novo: "Recapitulando e o próximo passo" },
    { trilha: "CI/CD e Cloud", antigo: "Segurança, recap e o próximo passo (Arquitetura & escala)", novo: "Segurança, recap e o próximo passo" },
];

// Só o enunciado muda (opções seguem válidas).
const ENUNCIADOS: { trilha: string; ancora: string; novo: string }[] = [
    {
        trilha: "Banco de Dados",
        ancora: "A trilha de Autenticação, próximo estágio do roadmap",
        novo: "Uma trilha seguinte, como Autenticação no roadmap de back-end, pode construir um login sobre a tabela usuarios que você modelou aqui. Qual conhecimento desta trilha de Banco de Dados é reaproveitado nesse tipo de continuação?",
    },
    {
        trilha: "CI/CD e Cloud",
        ancora: "a ponte entre esta trilha e o próximo estágio do roadmap",
        novo: "Qual opção resume melhor a diferença entre o que o CI/CD resolve e o que a escalabilidade da arquitetura resolve?",
    },
];

// Enunciado + as 4 opções mudam (mesma posição da correta que a original).
const QUESTOES: { trilha: string; ancora: string; novo: string; opcoes: { text: string; correct: boolean }[] }[] = [
    {
        trilha: "Python",
        ancora: "qual trilha do roadmap de Ciência de Dados",
        novo: "Segundo o fechamento deste módulo, qual biblioteca de Python é feita para manipular tabelas com DataFrames, o trabalho que aqui você fez na mão com listas de dicionários?",
        opcoes: [
            { text: "pandas", correct: true },
            { text: "NumPy", correct: false },
            { text: "Matplotlib", correct: false },
            { text: "o módulo os", correct: false },
        ],
    },
    {
        trilha: "Banco de Dados",
        ancora: "qual é o próximo estágio do roadmap de back-end depois",
        novo: "Segundo o fechamento, o que esta trilha de Banco de Dados deixa como base para as etapas seguintes do seu roadmap?",
        opcoes: [
            { text: "A capacidade de trocar de linguagem de programação sem reescrever nada", correct: false },
            { text: "O domínio de CSS e do design das telas do sistema", correct: false },
            { text: "A dispensa de qualquer modelagem, já que daqui pra frente o dado passa a se organizar sozinho", correct: false },
            { text: "Saber modelar tabelas e consultá-las com SQL ou ORM", correct: true },
        ],
    },
];

// Substituição de trecho (frase) dentro de um bloco, sem trocar o bloco inteiro.
const FRASES: { trilha: string; antigo: string; novo: string }[] = [
    {
        trilha: "Python",
        antigo: "A próxima trilha do roadmap faz isso com calma.",
        novo: "Uma trilha dedicada faz isso com calma mais adiante.",
    },
    {
        trilha: "Análise de Dados",
        antigo: "em SQL, a próxima trilha do roadmap: `INNER JOIN`",
        novo: "em SQL: `INNER JOIN`",
    },
];

function jsonEsc(s: string): string {
    return JSON.stringify(s).slice(1, -1);
}

async function trilhaId(nome: string): Promise<string> {
    const [t] = await db.select().from(trails).where(eq(trails.name, nome));
    if (!t) throw new Error(`Trilha não encontrada: ${nome}`);
    return t.id;
}

async function main() {
    // pares (antigo -> novo) por arquivo de seed, para sincronizar o fonte
    const paresPorArquivo: Record<string, [string, string][]> = {};
    const registrar = (trilha: string, antigo: string, novo: string) => {
        const arq = ARQUIVO[trilha];
        (paresPorArquivo[arq] ??= []).push([antigo, novo]);
    };

    let mudBloco = 0, mudTitulo = 0, mudEnun = 0, mudQ = 0;

    // BLOCOS
    for (const b of BLOCOS) {
        const tid = await trilhaId(b.trilha);
        const aulas = await db.select().from(lessons).where(eq(lessons.trailId, tid));
        for (const a of aulas) {
            const blocks = a.contentBlocks as { type: string; value: string }[] | null;
            if (!Array.isArray(blocks)) continue;
            const idx = blocks.findIndex((bl) => typeof bl.value === "string" && bl.value.includes(b.ancora));
            if (idx === -1) continue;
            const antigo = blocks[idx].value;
            if (antigo === b.novo) break; // idempotente
            const novos = blocks.map((bl, i) => (i === idx ? { ...bl, value: b.novo } : bl));
            await db.update(lessons).set({ contentBlocks: novos }).where(eq(lessons.id, a.id));
            registrar(b.trilha, antigo, b.novo);
            mudBloco++;
            break;
        }
    }

    // TÍTULOS
    for (const t of TITULOS) {
        const tid = await trilhaId(t.trilha);
        const aulas = await db.select().from(lessons).where(eq(lessons.trailId, tid));
        for (const a of aulas) {
            if (a.title === t.antigo) {
                await db.update(lessons).set({ title: t.novo }).where(eq(lessons.id, a.id));
                registrar(t.trilha, t.antigo, t.novo);
                mudTitulo++;
            }
        }
    }

    // ENUNCIADOS (só statement)
    for (const e of ENUNCIADOS) {
        const tid = await trilhaId(e.trilha);
        const qs = await db.select({ id: questions.id, statement: questions.statement, lessonId: questions.lessonId })
            .from(questions).innerJoin(lessons, eq(lessons.id, questions.lessonId)).where(eq(lessons.trailId, tid));
        for (const q of qs) {
            if (q.statement.includes(e.ancora)) {
                await db.update(questions).set({ statement: e.novo }).where(eq(questions.id, q.id));
                registrar(e.trilha, q.statement, e.novo);
                mudEnun++;
            }
        }
    }

    // QUESTÕES (statement + opções)
    for (const qq of QUESTOES) {
        const tid = await trilhaId(qq.trilha);
        const qs = await db.select({ id: questions.id, statement: questions.statement })
            .from(questions).innerJoin(lessons, eq(lessons.id, questions.lessonId)).where(eq(lessons.trailId, tid));
        for (const q of qs) {
            if (!q.statement.includes(qq.ancora)) continue;
            const opts = await db.select().from(questionOptions)
                .where(eq(questionOptions.questionId, q.id)).orderBy(asc(questionOptions.position));
            if (opts.length !== qq.opcoes.length) { console.warn(`  ${qq.trilha}: contagem de opções diferente, pulando`); continue; }
            registrar(qq.trilha, q.statement, qq.novo);
            await db.update(questions).set({ statement: qq.novo }).where(eq(questions.id, q.id));
            for (let i = 0; i < opts.length; i++) {
                registrar(qq.trilha, opts[i].text, qq.opcoes[i].text);
                await db.update(questionOptions).set({ text: qq.opcoes[i].text, isCorrect: qq.opcoes[i].correct })
                    .where(eq(questionOptions.id, opts[i].id));
            }
            mudQ++;
        }
    }

    // FRASES (troca um trecho dentro do bloco)
    let mudFrase = 0;
    for (const fr of FRASES) {
        const tid = await trilhaId(fr.trilha);
        const aulas = await db.select().from(lessons).where(eq(lessons.trailId, tid));
        for (const a of aulas) {
            const blocks = a.contentBlocks as { type: string; value: string }[] | null;
            if (!Array.isArray(blocks)) continue;
            const idx = blocks.findIndex((bl) => typeof bl.value === "string" && bl.value.includes(fr.antigo));
            if (idx === -1) continue;
            const novos = blocks.map((bl, i) =>
                i === idx ? { ...bl, value: bl.value.split(fr.antigo).join(fr.novo) } : bl,
            );
            await db.update(lessons).set({ contentBlocks: novos }).where(eq(lessons.id, a.id));
            registrar(fr.trilha, fr.antigo, fr.novo);
            mudFrase++;
            break;
        }
    }

    // Sincroniza os arquivos de seed (fonte) via substituição escapada.
    let srcOk = 0, srcMiss = 0;
    for (const [arq, pares] of Object.entries(paresPorArquivo)) {
        let txt = readFileSync(arq, "utf8");
        for (const [antigo, novo] of pares) {
            const alvo = jsonEsc(antigo);
            if (txt.includes(alvo)) { txt = txt.replace(alvo, jsonEsc(novo)); srcOk++; }
            else { console.warn(`  [fonte ${arq}] não encontrado: ${antigo.slice(0, 50)}...`); srcMiss++; }
        }
        writeFileSync(arq, txt);
    }

    console.log(`Banco: blocos=${mudBloco}, títulos=${mudTitulo}, enunciados=${mudEnun}, questões=${mudQ}, frases=${mudFrase}`);
    console.log(`Fonte: ${srcOk} substituições ok, ${srcMiss} não encontradas`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("Falha:", e); process.exit(1); });
