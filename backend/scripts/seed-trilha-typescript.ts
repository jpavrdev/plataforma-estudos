// Seed da trilha TypeScript (TypeScript 7). Conteúdo autoral.
// A versão 7 saiu em 8 de julho de 2026 com o compilador reescrito em Go, e é a
// que a trilha ensina: strict e module esnext por padrão, target es5 e
// moduleResolution node removidos, e o pacote @typescript/typescript6 para conviver.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-typescript.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "TypeScript";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "TypeScript 7 do zero ao uso profissional: por que tipos existem, união e narrowing, interfaces e generics, os tipos que calculam com conditional e mapped types, validação na fronteira do sistema, configuração do compilador e migração de projetos JavaScript. Inclui o que o TypeScript 7 mudou com o compilador nativo em Go.";
const CARGA_HORARIA = 20;

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Por que o TypeScript existe",
    aulas: [
        {
            titulo: "O problema que o TypeScript resolve",
            blocks: [
                {
                    type: "text",
                    value: "# Erros que só aparecem rodando\n\nJavaScript não checa tipo nenhum antes de executar. Um `undefined` onde deveria haver objeto, um número somado com texto, uma propriedade escrita errada: nada disso é apontado até a linha rodar, e às vezes ela só roda na mão do usuário.\n\nO **TypeScript** acrescenta um sistema de tipos que roda **antes**. Ele não muda o que o código faz, ele avisa o que não faz sentido.",
                },
                {
                    type: "code",
                    value: "// JavaScript: passa e quebra em produção\nfunction total(itens) {\n  return itens.reduce((soma, i) => soma + i.preco, 0);\n}\n\ntotal(null);           // TypeError na hora de rodar\ntotal([{ prec: 10 }]); // NaN, silencioso e pior ainda\n\n// TypeScript: os dois são apontados antes de rodar\nfunction total(itens: { preco: number }[]): number {\n  return itens.reduce((soma, i) => soma + i.preco, 0);\n}",
                },
                {
                    type: "text",
                    value: "## O que se ganha além do erro\n\nO benefício mais óbvio é achar bug cedo, mas quem usa no dia a dia costuma citar outros dois:\n\n- **Autocompletar que funciona**: o editor sabe o que existe em cada objeto\n- **Refatorar sem medo**: renomear um campo aponta todos os lugares que precisam mudar\n\nÉ documentação que o compilador verifica, então ela não fica desatualizada como um comentário.",
                },
                {
                    type: "text",
                    value: "Esta trilha usa o **TypeScript 7**, lançado em 8 de julho de 2026, que reescreveu o compilador em Go e mudou vários padrões de configuração.",
                },
            ],
            questions: [
                {
                    statement: "O que o TypeScript acrescenta ao JavaScript?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma checagem de tipos antes de rodar", isCorrect: true },
                        { text: "Um interpretador próprio bem mais rápido", isCorrect: false },
                        { text: "Uma biblioteca de funções já prontas para uso", isCorrect: false },
                        {
                            text: "Um empacotador que junta os arquivos do projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O TypeScript muda o comportamento do código em execução?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele só verifica antes", isCorrect: true },
                        { text: "Sim, ele valida os tipos durante a execução", isCorrect: false },
                        {
                            text: "Sim, ele converte os valores para o tipo certo",
                            isCorrect: false,
                        },
                        { text: "Sim, ele impede que a função rode com erro", isCorrect: false },
                    ],
                },
                {
                    statement: "Além de achar bug, o que mais se ganha?",
                    difficulty: "medio",
                    options: [
                        { text: "Autocompletar e refatoração confiáveis", isCorrect: true },
                        { text: "Um código bem menor depois de compilado", isCorrect: false },
                        { text: "Uma execução mais rápida no navegador", isCorrect: false },
                        { text: "A eliminação da necessidade de testes", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que tipos são melhores que comentários como documentação?",
                    difficulty: "dificil",
                    options: [
                        { text: "O compilador verifica se ainda estão corretos", isCorrect: true },
                        {
                            text: "Eles ocupam bem menos espaço dentro do arquivo",
                            isCorrect: false,
                        },
                        { text: "Eles são escritos em uma linguagem própria", isCorrect: false },
                        { text: "Eles aparecem na documentação gerada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual versão do TypeScript esta trilha usa?",
                    difficulty: "facil",
                    options: [
                        { text: "TypeScript 7", isCorrect: true },
                        { text: "TypeScript 4.9", isCorrect: false },
                        { text: "TypeScript 5.0", isCorrect: false },
                        { text: "TypeScript 3.8", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Instalando o TypeScript 7 e o primeiro arquivo",
            blocks: [
                {
                    type: "text",
                    value: "# Instalando no projeto\n\nO TypeScript é uma dependência de desenvolvimento: ele só existe na sua máquina e na CI, nunca no que vai para produção. O que roda é o JavaScript que ele gera.",
                },
                {
                    type: "code",
                    value: "npm install --save-dev typescript\nnpx tsc --version\n# Version 7.0.2\n\n# Cria o tsconfig.json\nnpx tsc --init",
                },
                {
                    type: "text",
                    value: "## O primeiro arquivo\n\nArquivos `.ts` são JavaScript com anotações de tipo. Todo JavaScript válido é TypeScript válido, o que permite adotar aos poucos.",
                },
                {
                    type: "code",
                    value: 'const nome: string = "Ana";\nconst idade: number = 28;\nconst ativo: boolean = true;\n\nfunction saudacao(quem: string): string {\n  return `Olá, ${quem}!`;\n}\n\nconsole.log(saudacao(nome));\nconsole.log(saudacao(idade));  // Erro: number não é string',
                },
                {
                    type: "code",
                    value: "npx tsc            # compila conforme o tsconfig\nnpx tsc --watch    # recompila a cada alteração\nnpx tsc --noEmit   # só checa, não gera arquivo",
                },
                {
                    type: "text",
                    value: "## Rodando direto\n\nO Node moderno executa TypeScript sem etapa de build, apagando os tipos na hora. É o caminho mais simples para começar, e o `--noEmit` continua sendo como se checa o projeto inteiro.",
                },
            ],
            questions: [
                {
                    statement: "Onde o TypeScript entra nas dependências do projeto?",
                    difficulty: "medio",
                    options: [
                        { text: "Como dependência de desenvolvimento", isCorrect: true },
                        {
                            text: "Como dependência normal, que vai para produção",
                            isCorrect: false,
                        },
                        { text: "Como dependência global, instalada no sistema", isCorrect: false },
                        { text: "Como dependência opcional do empacotador", isCorrect: false },
                    ],
                },
                {
                    statement: "Todo arquivo JavaScript é TypeScript válido?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, e é o que permite adotar aos poucos", isCorrect: true },
                        { text: "Não, é preciso anotar todos os tipos antes", isCorrect: false },
                        { text: "Não, a sintaxe das duas é bem diferente", isCorrect: false },
                        { text: "Só quando o arquivo não usa classes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `tsc --noEmit` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Checa os tipos sem gerar arquivo", isCorrect: true },
                        { text: "Gera o JavaScript sem checar os tipos", isCorrect: false },
                        { text: "Compila apenas os arquivos que mudaram", isCorrect: false },
                        { text: "Remove os arquivos gerados anteriormente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que roda em produção em um projeto TypeScript?",
                    difficulty: "medio",
                    options: [
                        { text: "O JavaScript gerado", isCorrect: true },
                        { text: "O próprio TypeScript, interpretado direto", isCorrect: false },
                        { text: "Os dois, conforme o ambiente configurado", isCorrect: false },
                        { text: "O TypeScript compilado para código nativo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `tsc --watch` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Recompila a cada alteração de arquivo", isCorrect: true },
                        { text: "Observa os erros em tempo de execução", isCorrect: false },
                        { text: "Acompanha o uso de memória do compilador", isCorrect: false },
                        { text: "Monitora as dependências desatualizadas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O tsconfig e os padrões do TypeScript 7",
            blocks: [
                {
                    type: "text",
                    value: "# O arquivo que manda\n\nO `tsconfig.json` diz ao compilador quais arquivos considerar e com qual rigor. Ele é o primeiro lugar a olhar quando o TypeScript aceita algo que deveria recusar.",
                },
                {
                    type: "code",
                    value: '{\n  "compilerOptions": {\n    "target": "es2023",\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "strict": true,\n    "noUncheckedIndexedAccess": true,\n    "outDir": "./dist",\n    "rootDir": "./src"\n  },\n  "include": ["src"],\n  "exclude": ["node_modules", "dist"]\n}',
                },
                {
                    type: "text",
                    value: "## Os padrões mudaram no TypeScript 7\n\nEsta é a parte que mais confunde quem vem de tutorial antigo. Vários padrões foram invertidos, e para melhor.",
                },
                {
                    type: "table",
                    value: '[["Opção", "Antes do TS 7", "No TS 7"], ["strict", "false", "**true**"], ["module", "commonjs", "**esnext**"], ["types", "todos, como [\\"*\\"]", "**vazio, []**"], ["rootDir", "inferido", "**./**"]]',
                },
                {
                    type: "text",
                    value: "A mudança de `types` merece atenção: antes, todo pacote em `node_modules/@types` era incluído automaticamente, o que trazia tipos globais que ninguém pediu e deixava a checagem mais lenta. Agora você declara o que quer.\n\n## O que foi removido\n\nO TypeScript 7 eliminou alvos e resoluções antigas: `target: es5` não existe mais, `moduleResolution: node` e `node10` saíram, e os formatos de módulo `amd`, `umd`, `systemjs` e `none` foram removidos. O `baseUrl` foi descontinuado.",
                },
            ],
            questions: [
                {
                    statement: "Qual o valor padrão de `strict` no TypeScript 7?",
                    difficulty: "medio",
                    options: [
                        { text: "true", isCorrect: true },
                        { text: "false, como era nas versões anteriores", isCorrect: false },
                        { text: "Depende do alvo escolhido no tsconfig", isCorrect: false },
                        { text: "Não existe mais essa opção no arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no padrão da opção `types`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Deixou de incluir tudo e passou a vir vazio", isCorrect: true },
                        { text: "Passou a incluir também os tipos do projeto", isCorrect: false },
                        { text: "Deixou de existir e virou automática", isCorrect: false },
                        { text: "Passou a aceitar apenas um pacote por vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual alvo de compilação foi removido no TypeScript 7?",
                    difficulty: "medio",
                    options: [
                        { text: "O es5", isCorrect: true },
                        { text: "O esnext, substituído pelo es2023", isCorrect: false },
                        { text: "O es2015, o primeiro com módulos", isCorrect: false },
                        { text: "O es2020, por falta de suporte", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o padrão de `module` no TypeScript 7?",
                    difficulty: "medio",
                    options: [
                        { text: "esnext", isCorrect: true },
                        { text: "commonjs, como era antes da versão 7", isCorrect: false },
                        { text: "amd, para compatibilidade com o navegador", isCorrect: false },
                        { text: "umd, que funciona nos dois ambientes", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que incluir todos os `@types` automaticamente era ruim?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Trazia tipos globais indesejados e deixava lento",
                            isCorrect: true,
                        },
                        { text: "Aumentava o tamanho do JavaScript gerado", isCorrect: false },
                        { text: "Impedia o uso de bibliotecas sem tipos", isCorrect: false },
                        {
                            text: "Fazia o compilador ignorar por completo o modo estrito",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tipos primitivos e inferência",
            blocks: [
                {
                    type: "text",
                    value: "# Os tipos básicos\n\nO TypeScript tem os primitivos do JavaScript, escritos em minúsculo. `String` com maiúscula é o objeto envelopado e quase nunca é o que você quer.",
                },
                {
                    type: "table",
                    value: '[["Tipo", "Exemplo"], ["string", "\\"Ana\\""], ["number", "28 e 1.67, sem distinção"], ["boolean", "true"], ["bigint", "9007199254740993n"], ["symbol", "Symbol(\'id\')"], ["null e undefined", "os dois vazios do JavaScript"]]',
                },
                {
                    type: "text",
                    value: "## Inferência\n\nNa maior parte do tempo você **não escreve o tipo**: o TypeScript o descobre pelo valor. Anotar o óbvio só polui o código.\n\nA regra que a comunidade segue: anote o que **entra e sai** de uma função, e deixe o resto inferido.",
                },
                {
                    type: "code",
                    value: 'const nome = "Ana";        // string, inferido\nlet total = 0;             // number, inferido\nconst ativo = true;        // boolean, inferido\n\n// Redundante: o tipo já era óbvio\nconst nome: string = "Ana";\n\n// Útil: a assinatura é o contrato\nfunction calcular(itens: number[], taxa: number): number {\n  return itens.reduce((a, b) => a + b, 0) * (1 + taxa);\n}',
                },
                {
                    type: "text",
                    value: "## const e let mudam a inferência\n\nUma sutileza que aparece o tempo todo: `const` com um literal infere o **tipo literal**, porque o valor nunca muda. Com `let`, o tipo é o amplo.",
                },
                {
                    type: "code",
                    value: 'const metodo = "GET";   // tipo é "GET", literal\nlet verbo = "GET";      // tipo é string, amplo\n\n// É por isso que isto funciona\nfunction buscar(metodo: "GET" | "POST") {}\nbuscar(metodo);   // ok, o tipo é exatamente "GET"\nbuscar(verbo);    // erro: string não cabe na união',
                },
            ],
            questions: [
                {
                    statement: "Como se escreve o tipo de texto em TypeScript?",
                    difficulty: "facil",
                    options: [
                        { text: "string, em minúsculo", isCorrect: true },
                        { text: "String, com a inicial maiúscula", isCorrect: false },
                        { text: "text, como em algumas linguagens", isCorrect: false },
                        { text: "char, para cada caractere do texto", isCorrect: false },
                    ],
                },
                {
                    statement: "O TypeScript distingue inteiro de decimal?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, os dois são number", isCorrect: true },
                        { text: "Sim, existem os tipos int e float", isCorrect: false },
                        { text: "Sim, o decimal usa o tipo double", isCorrect: false },
                        { text: "Só quando o modo estrito está ligado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a regra prática sobre quando anotar o tipo?",
                    difficulty: "medio",
                    options: [
                        { text: "Anotar o que entra e sai de uma função", isCorrect: true },
                        { text: "Anotar todas as variáveis do arquivo", isCorrect: false },
                        { text: "Anotar apenas quando o compilador reclamar", isCorrect: false },
                        { text: "Nunca anotar, a inferência resolve tudo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o tipo inferido de `const metodo = 'GET'`?",
                    difficulty: "dificil",
                    options: [
                        { text: 'O literal "GET"', isCorrect: true },
                        { text: "O tipo string, amplo como em qualquer texto", isCorrect: false },
                        { text: "O tipo any, porque não foi anotado", isCorrect: false },
                        { text: "Um tipo de união com todos os verbos", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `let` infere um tipo mais amplo que `const`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Porque o valor ainda pode mudar depois", isCorrect: true },
                        { text: "Porque let é mais antigo que const", isCorrect: false },
                        { text: "Porque const guarda o valor em memória", isCorrect: false },
                        { text: "Porque let não aceita valores literais", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Como o TypeScript roda: apagar tipos",
            blocks: [
                {
                    type: "text",
                    value: "# Type erasure\n\nO conceito mais importante para não se confundir: **os tipos somem na compilação**. O JavaScript gerado não tem nenhuma informação de tipo, e nada é verificado em execução.\n\nIsso significa que o TypeScript **não protege contra dado errado vindo de fora**. Uma resposta de API que você tipou como `Usuario` pode vir com qualquer coisa, e ninguém vai reclamar.",
                },
                {
                    type: "code",
                    value: "// O que você escreve\ninterface Usuario {\n  id: number;\n  nome: string;\n}\n\nfunction saudar(u: Usuario): string {\n  return `Olá, ${u.nome}`;\n}\n\n// O que é gerado: os tipos sumiram\nfunction saudar(u) {\n  return `Olá, ${u.nome}`;\n}",
                },
                {
                    type: "quote",
                    value: "Tipo é promessa de quem escreve, não garantia de quem executa. Dado que vem de fora precisa ser validado em execução.",
                },
                {
                    type: "text",
                    value: "## A consequência prática\n\nComo o tipo some, você não pode perguntar em execução se algo é `Usuario`. Para checar a forma de um dado externo, o caminho é validar campo a campo, ou usar uma biblioteca de validação que **também gera o tipo**, evitando descrever a mesma forma duas vezes.",
                },
                {
                    type: "code",
                    value: 'const resposta = await fetch("/api/usuario");\nconst dados = await resposta.json();\n// dados é any: o TypeScript não sabe nada sobre ele\n\n// Isto compila e mente\nconst usuario = dados as Usuario;\n\n// O caminho honesto: checar de verdade\nfunction ehUsuario(v: unknown): v is Usuario {\n  return (\n    typeof v === "object" && v !== null &&\n    "id" in v && typeof v.id === "number" &&\n    "nome" in v && typeof v.nome === "string"\n  );\n}',
                },
            ],
            questions: [
                {
                    statement: "O que acontece com os tipos na compilação?",
                    difficulty: "medio",
                    options: [
                        { text: "Eles são apagados do resultado", isCorrect: true },
                        { text: "Eles viram verificações em tempo de execução", isCorrect: false },
                        { text: "Eles são guardados em um arquivo separado", isCorrect: false },
                        { text: "Eles são convertidos em comentários no código", isCorrect: false },
                    ],
                },
                {
                    statement: "O TypeScript protege contra dado errado vindo de uma API?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, nada é verificado em execução", isCorrect: true },
                        { text: "Sim, ele valida a resposta antes de entregar", isCorrect: false },
                        { text: "Sim, quando a interface está bem declarada", isCorrect: false },
                        { text: "Sim, desde que o modo estrito esteja ligado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `dados as Usuario` faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Afirma o tipo sem verificar nada", isCorrect: true },
                        { text: "Converte o objeto para o formato de Usuario", isCorrect: false },
                        { text: "Valida se o objeto tem os campos esperados", isCorrect: false },
                        { text: "Cria uma cópia tipada do objeto original", isCorrect: false },
                    ],
                },
                {
                    statement: "Como checar de verdade a forma de um dado externo?",
                    difficulty: "medio",
                    options: [
                        { text: "Validando campo a campo em execução", isCorrect: true },
                        { text: "Declarando a interface com todos os campos", isCorrect: false },
                        { text: "Usando o modo estrito no tsconfig do projeto", isCorrect: false },
                        { text: "Anotando o retorno da função que busca", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de uma biblioteca de validação que gera o tipo?",
                    difficulty: "medio",
                    options: [
                        { text: "A forma é descrita uma vez só", isCorrect: true },
                        { text: "A validação passa a rodar na compilação", isCorrect: false },
                        { text: "O código gerado fica bem menor no fim", isCorrect: false },
                        { text: "Os tipos deixam de ser apagados no build", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Os tipos do dia a dia",
    aulas: [
        {
            titulo: "Arrays, tuplas e objetos",
            blocks: [
                {
                    type: "text",
                    value: "# Arrays\n\nDuas formas escrevem a mesma coisa, e a comunidade prefere a primeira por ser mais curta.",
                },
                {
                    type: "code",
                    value: 'const nomes: string[] = ["Ana", "Bruno"];\nconst numeros: Array<number> = [1, 2, 3];\n\n// Array de objetos\nconst produtos: { nome: string; preco: number }[] = [\n  { nome: "Caneca", preco: 29.9 },\n];\n\n// Somente leitura: o array não pode ser alterado\nconst fixos: readonly string[] = ["a", "b"];\nfixos.push("c");   // erro',
                },
                {
                    type: "text",
                    value: "## Tuplas\n\nUma tupla é um array de **tamanho e tipos fixos por posição**. É o que descreve o retorno de um `useState` do React ou o par chave e valor de um `Object.entries`.",
                },
                {
                    type: "code",
                    value: 'const par: [string, number] = ["idade", 28];\n\n// Com nomes, que aparecem no autocompletar\nconst coord: [x: number, y: number] = [10, 20];\n\n// Opcional e resto\ntype Args = [nome: string, idade?: number, ...tags: string[]];',
                },
                {
                    type: "text",
                    value: "## Objetos e o excesso de propriedade\n\nO TypeScript recusa propriedade a mais em um **literal** de objeto, mas aceita se ele vier de uma variável. Essa assimetria surpreende, e existe para pegar erro de digitação onde ele é mais provável.",
                },
                {
                    type: "code",
                    value: 'type Produto = { nome: string; preco: number };\n\n// Erro: cor não existe em Produto\nconst a: Produto = { nome: "X", preco: 1, cor: "azul" };\n\n// Aceito: a checagem de excesso só vale para literais\nconst temp = { nome: "X", preco: 1, cor: "azul" };\nconst b: Produto = temp;',
                },
            ],
            questions: [
                {
                    statement: "O que uma tupla define além dos tipos?",
                    difficulty: "medio",
                    options: [
                        { text: "O tamanho e a posição de cada item", isCorrect: true },
                        { text: "A ordem em que os itens são percorridos", isCorrect: false },
                        { text: "Os nomes que cada item terá no objeto", isCorrect: false },
                        { text: "O valor padrão de cada posição do array", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `readonly string[]` impede?",
                    difficulty: "medio",
                    options: [
                        { text: "Alterar o array, como um push", isCorrect: true },
                        { text: "Ler qualquer item do array declarado", isCorrect: false },
                        { text: "Criar o array com mais de um item", isCorrect: false },
                        { text: "Passar o array para outra função", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o TypeScript recusa propriedade a mais em um literal?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Para pegar erro de digitação onde é mais provável",
                            isCorrect: true,
                        },
                        { text: "Porque o objeto ficaria maior na memória", isCorrect: false },
                        {
                            text: "Porque o tipo declarado não aceita nenhuma mudança",
                            isCorrect: false,
                        },
                        { text: "Porque literais não podem ter tipo anotado", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que a mesma propriedade extra passa quando vem de uma variável?",
                    difficulty: "dificil",
                    options: [
                        { text: "A checagem de excesso só vale para literais", isCorrect: true },
                        { text: "A variável perde o tipo ao ser atribuída", isCorrect: false },
                        { text: "O compilador ignora variáveis intermediárias", isCorrect: false },
                        { text: "O tipo da variável é sempre inferido como any", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual forma de declarar array a comunidade prefere?",
                    difficulty: "facil",
                    options: [
                        { text: "string[]", isCorrect: true },
                        { text: "Array<string>, que é mais explícita", isCorrect: false },
                        { text: "[string], como em uma tupla", isCorrect: false },
                        { text: "list<string>, no padrão de outras linguagens", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Union e narrowing",
            blocks: [
                {
                    type: "text",
                    value: "# Um valor, vários tipos possíveis\n\nA **união** diz que o valor é um de alguns tipos. Enquanto o TypeScript não souber qual, ele só permite o que é comum a todos.",
                },
                {
                    type: "code",
                    value: "function formatar(id: number | string): string {\n  return id.toUpperCase();   // erro: number não tem toUpperCase\n}",
                },
                {
                    type: "text",
                    value: "## Narrowing\n\n**Narrowing** é o TypeScript estreitar o tipo conforme o que o seu código verifica. Ele entende as verificações que você já escreveria de qualquer forma.",
                },
                {
                    type: "code",
                    value: 'function formatar(id: number | string): string {\n  if (typeof id === "string") {\n    return id.toUpperCase();   // aqui id é string\n  }\n  return id.toFixed(2);        // aqui só sobrou number\n}',
                },
                {
                    type: "table",
                    value: '[["Verificação", "Serve para"], ["typeof x === \'string\'", "primitivos"], ["x instanceof Date", "classes"], ["\'campo\' in x", "objetos com formas diferentes"], ["Array.isArray(x)", "arrays"], ["x === null", "separar o nulo"]]',
                },
                {
                    type: "text",
                    value: "## União discriminada\n\nO padrão mais útil de todos: um campo literal comum que identifica cada variante. O TypeScript usa esse campo para estreitar, e passa a exigir que você trate todos os casos.",
                },
                {
                    type: "code",
                    value: 'type Resultado =\n  | { status: "carregando" }\n  | { status: "ok"; dados: string[] }\n  | { status: "erro"; mensagem: string };\n\nfunction render(r: Resultado): string {\n  switch (r.status) {\n    case "carregando":\n      return "Aguarde...";\n    case "ok":\n      return r.dados.join(", ");   // dados só existe aqui\n    case "erro":\n      return r.mensagem;\n  }\n}',
                },
            ],
            questions: [
                {
                    statement:
                        "O que se pode fazer com um valor de tipo `number | string` antes de estreitar?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o que serve para os dois", isCorrect: true },
                        { text: "Tudo que serve para qualquer um dos dois", isCorrect: false },
                        { text: "Nada, é preciso estreitar sempre antes", isCorrect: false },
                        { text: "Apenas convertê-lo para outro tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é narrowing?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O compilador estreitar o tipo conforme a verificação",
                            isCorrect: true,
                        },
                        {
                            text: "Converter o valor informado para um tipo bem mais específico",
                            isCorrect: false,
                        },
                        { text: "Reduzir a quantidade de tipos de uma união", isCorrect: false },
                        { text: "Remover os tipos que não são usados no código", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza uma união discriminada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um campo literal comum que identifica a variante",
                            isCorrect: true,
                        },
                        { text: "Um campo opcional presente em algumas delas", isCorrect: false },
                        { text: "O uso de classes em vez de objetos simples", isCorrect: false },
                        {
                            text: "A quantidade igual de campos em cada uma das variantes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual verificação estreita o tipo de uma classe?",
                    difficulty: "medio",
                    options: [
                        { text: "instanceof", isCorrect: true },
                        { text: "typeof, que também funciona com classes", isCorrect: false },
                        { text: "in, verificando um campo da classe", isCorrect: false },
                        { text: "Array.isArray, para qualquer objeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem prática da união discriminada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O compilador cobra o tratamento de todos os casos",
                            isCorrect: true,
                        },
                        { text: "Ela deixa o código gerado bem menor", isCorrect: false },
                        {
                            text: "Ela dispensa qualquer verificação de tipo no código",
                            isCorrect: false,
                        },
                        { text: "Ela permite acessar todos os campos direto", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Literais, enum e const",
            blocks: [
                {
                    type: "text",
                    value: "# Tipos literais\n\nUm tipo pode ser um **valor exato**. Combinados em união, os literais criam conjuntos fechados sem precisar de enum.",
                },
                {
                    type: "code",
                    value: 'type Metodo = "GET" | "POST" | "PUT" | "DELETE";\ntype Tamanho = "p" | "m" | "g";\ntype Resposta = 200 | 404 | 500;\n\nfunction requisitar(url: string, metodo: Metodo) {}\n\nrequisitar("/api", "GET");    // ok\nrequisitar("/api", "GET ");   // erro: o espaço a mais não passa',
                },
                {
                    type: "text",
                    value: "## enum, e por que evitá-lo\n\nO `enum` existe desde o começo do TypeScript e é uma das poucas coisas que **gera código JavaScript**, quebrando a regra de que os tipos somem. Ele também tem comportamentos surpreendentes: o enum numérico aceita qualquer número.\n\nA recomendação atual da comunidade é preferir união de literais, ou um objeto com `as const` quando você precisa dos valores em execução.",
                },
                {
                    type: "code",
                    value: 'enum Status {\n  Ativo,\n  Inativo,\n}\nconst s: Status = 42;   // aceito, e não deveria ser\n\n// A alternativa: objeto com as const\nconst Status = {\n  Ativo: "ativo",\n  Inativo: "inativo",\n} as const;\n\ntype Status = (typeof Status)[keyof typeof Status];\n// tipo é "ativo" | "inativo"',
                },
                {
                    type: "text",
                    value: "## as const\n\nO `as const` congela um valor: objetos ficam `readonly` e os literais mantêm o tipo exato em vez de virarem `string`. É o que faz o padrão acima funcionar.",
                },
                {
                    type: "code",
                    value: 'const cores = ["azul", "verde"];\n// tipo: string[]\n\nconst cores = ["azul", "verde"] as const;\n// tipo: readonly ["azul", "verde"]\n\ntype Cor = (typeof cores)[number];   // "azul" | "verde"',
                },
            ],
            questions: [
                {
                    statement: "O que um tipo literal representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Um valor exato, e não a categoria dele", isCorrect: true },
                        { text: "Um valor que não pode ser alterado depois", isCorrect: false },
                        { text: "Um valor escrito diretamente no código", isCorrect: false },
                        { text: "Um tipo criado a partir de outro tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o enum é a exceção à regra dos tipos apagados?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele gera código JavaScript no resultado", isCorrect: true },
                        { text: "Ele é verificado durante a execução do código", isCorrect: false },
                        { text: "Ele precisa ser importado em cada arquivo", isCorrect: false },
                        { text: "Ele guarda os valores em uma tabela à parte", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comportamento surpreendente o enum numérico tem?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele aceita qualquer número como valor", isCorrect: true },
                        { text: "Ele começa a contagem a partir de um", isCorrect: false },
                        { text: "Ele não pode ser usado dentro de uniões", isCorrect: false },
                        { text: "Ele converte os valores para texto sozinho", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `as const` faz com um array?",
                    difficulty: "medio",
                    options: [
                        { text: "Torna somente leitura e fixa os literais", isCorrect: true },
                        { text: "Impede que ele seja passado a funções", isCorrect: false },
                        { text: "Converte todos os itens para o mesmo tipo", isCorrect: false },
                        { text: "Guarda o array em uma constante global", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a comunidade recomenda no lugar do enum?",
                    difficulty: "medio",
                    options: [
                        { text: "União de literais ou objeto com as const", isCorrect: true },
                        { text: "Classes com propriedades estáticas", isCorrect: false },
                        { text: "Constantes soltas exportadas do módulo", isCorrect: false },
                        { text: "Um tipo com todos os valores como opcionais", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Funções: parâmetros e retorno",
            blocks: [
                {
                    type: "text",
                    value: "# Tipando funções\n\nA assinatura é o contrato. Parâmetros opcionais levam interrogação e vêm depois dos obrigatórios; o resto é recolhido com `...`.",
                },
                {
                    type: "code",
                    value: "function criar(nome: string, idade?: number, ...tags: string[]): void {}\n\n// Tipo de uma função, para passar adiante\ntype Comparador = (a: number, b: number) => number;\n\nconst crescente: Comparador = (a, b) => a - b;\n// a e b não precisam de anotação: vêm do tipo",
                },
                {
                    type: "text",
                    value: "## Inferência contextual\n\nRepare que `crescente` não anota os parâmetros. Quando o TypeScript já sabe o tipo esperado pelo contexto, ele preenche o resto. É o que faz callbacks funcionarem sem anotação nenhuma.",
                },
                {
                    type: "code",
                    value: "const numeros = [3, 1, 2];\n\nnumeros.map((n) => n * 2);       // n é number, inferido\nnumeros.filter((n) => n > 1);    // idem\nnumeros.sort((a, b) => a - b);   // idem",
                },
                {
                    type: "text",
                    value: "## void e o retorno ignorado\n\n`void` significa que o retorno não interessa. Uma sutileza útil: uma função que **devolve algo** pode ser usada onde se espera `void`, porque o retorno simplesmente é ignorado. É o que permite `array.forEach(x => lista.push(x))` sem reclamação.",
                },
                {
                    type: "code",
                    value: "type Callback = () => void;\n\nconst cb: Callback = () => 42;   // ok, o 42 é ignorado\n\n// Diferente de never, que é o que nunca retorna\nfunction falhar(msg: string): never {\n  throw new Error(msg);\n}",
                },
            ],
            questions: [
                {
                    statement: "Onde ficam os parâmetros opcionais na assinatura?",
                    difficulty: "facil",
                    options: [
                        { text: "Depois dos obrigatórios", isCorrect: true },
                        { text: "Antes dos obrigatórios, para ficarem visíveis", isCorrect: false },
                        { text: "Em qualquer posição, desde que anotados", isCorrect: false },
                        { text: "Sempre por último, depois do parâmetro resto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é inferência contextual?",
                    difficulty: "medio",
                    options: [
                        { text: "O tipo vir do contexto em que a função é usada", isCorrect: true },
                        { text: "O tipo ser deduzido do corpo da função", isCorrect: false },
                        { text: "O tipo ser copiado da função anterior", isCorrect: false },
                        {
                            text: "O tipo mudar conforme os argumentos que foram passados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Uma função que devolve valor pode ser usada onde se espera `void`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Sim, o retorno é apenas ignorado", isCorrect: true },
                        { text: "Não, o retorno precisa ser exatamente void", isCorrect: false },
                        { text: "Sim, mas o valor precisa ser undefined", isCorrect: false },
                        { text: "Só quando a função é uma arrow function", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `void` e `never`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O never indica que a função nunca retorna", isCorrect: true },
                        { text: "O void aceita qualquer valor como retorno", isCorrect: false },
                        { text: "O never é usado apenas em classes", isCorrect: false },
                        { text: "O void só funciona com arrow functions", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se declara o tipo de uma função?",
                    difficulty: "medio",
                    options: [
                        { text: "Com uma seta entre parâmetros e retorno", isCorrect: true },
                        { text: "Com a palavra function antes do nome", isCorrect: false },
                        { text: "Com dois-pontos entre os parâmetros", isCorrect: false },
                        { text: "Com a palavra type dentro dos parênteses", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "any, unknown, never e void",
            blocks: [
                {
                    type: "text",
                    value: "# Os quatro tipos especiais\n\nEsses quatro confundem por terem nomes parecidos e propósitos bem diferentes.",
                },
                {
                    type: "table",
                    value: '[["Tipo", "Significa", "Quando aparece"], ["any", "desliga a checagem", "quase nunca deveria"], ["unknown", "não sei ainda", "dado vindo de fora"], ["never", "nunca acontece", "função que lança"], ["void", "retorno sem valor", "função sem return"]]',
                },
                {
                    type: "text",
                    value: "## any é a saída de emergência\n\nCom `any` o TypeScript para de checar aquele valor **e tudo que sai dele**. Um `any` no meio do código apaga a segurança de todo o caminho por onde ele passa, silenciosamente.",
                },
                {
                    type: "code",
                    value: 'const dados: any = JSON.parse(texto);\ndados.qualquer.coisa.que.nao.existe;   // compila, e quebra rodando\n\n// unknown obriga a verificar antes de usar\nconst dados: unknown = JSON.parse(texto);\ndados.nome;   // erro: precisa estreitar primeiro\n\nif (typeof dados === "object" && dados !== null && "nome" in dados) {\n  console.log(dados.nome);   // agora sim\n}',
                },
                {
                    type: "quote",
                    value: "unknown é o any com responsabilidade: aceita qualquer valor na entrada, mas exige verificação antes do uso.",
                },
                {
                    type: "text",
                    value: "## never e a checagem de exaustão\n\n`never` é o tipo do que não pode acontecer. O uso mais valioso dele é garantir que você tratou **todos** os casos de uma união: se um caso novo for acrescentado depois, o compilador aponta o lugar esquecido.",
                },
                {
                    type: "code",
                    value: 'type Forma = { tipo: "circulo"; raio: number } | { tipo: "quadrado"; lado: number };\n\nfunction area(f: Forma): number {\n  switch (f.tipo) {\n    case "circulo":\n      return Math.PI * f.raio ** 2;\n    case "quadrado":\n      return f.lado ** 2;\n    default: {\n      // Se surgir uma forma nova, este atribuição falha\n      const impossivel: never = f;\n      return impossivel;\n    }\n  }\n}',
                },
            ],
            questions: [
                {
                    statement: "O que `any` faz com a checagem de tipos?",
                    difficulty: "medio",
                    options: [
                        { text: "Desliga para aquele valor e o que sai dele", isCorrect: true },
                        {
                            text: "Aceita qualquer valor, mas ainda verifica o uso",
                            isCorrect: false,
                        },
                        { text: "Converte o valor para o tipo mais próximo", isCorrect: false },
                        { text: "Marca o valor para ser verificado depois", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `any` e `unknown`?",
                    difficulty: "medio",
                    options: [
                        { text: "O unknown exige verificação antes do uso", isCorrect: true },
                        { text: "O any aceita bem mais tipos que o unknown", isCorrect: false },
                        { text: "O unknown só funciona com objetos", isCorrect: false },
                        { text: "O any é verificado durante a execução", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o tipo `never` representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Algo que nunca acontece", isCorrect: true },
                        { text: "Um valor que ainda não foi definido", isCorrect: false },
                        { text: "Um retorno vazio de uma função", isCorrect: false },
                        { text: "Um valor que pode ser qualquer coisa", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Para que serve atribuir a uma variável `never` no default de um switch?",
                    difficulty: "dificil",
                    options: [
                        { text: "Garantir que todos os casos foram tratados", isCorrect: true },
                        {
                            text: "Impedir que o switch caia no caso padrão do fim",
                            isCorrect: false,
                        },
                        { text: "Lançar uma exceção quando nada casa", isCorrect: false },
                        { text: "Documentar que o caso é impossível", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o tipo certo para o retorno de um `JSON.parse`?",
                    difficulty: "dificil",
                    options: [
                        { text: "unknown, para forçar a verificação", isCorrect: true },
                        { text: "any, que é o padrão da própria função", isCorrect: false },
                        { text: "object, já que sempre devolve um objeto", isCorrect: false },
                        { text: "string, porque a entrada era texto", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Modelando com tipos",
    aulas: [
        {
            titulo: "Interface e type alias",
            blocks: [
                {
                    type: "text",
                    value: "# Duas formas de nomear uma forma\n\n`interface` e `type` fazem quase a mesma coisa. A escolha entre eles gera discussão maior do que merece, porque na prática as diferenças são poucas.",
                },
                {
                    type: "code",
                    value: "interface Usuario {\n  id: number;\n  nome: string;\n  email: string;\n}\n\ntype Usuario = {\n  id: number;\n  nome: string;\n  email: string;\n};",
                },
                {
                    type: "table",
                    value: '[["", "interface", "type"], ["Descreve objeto", "sim", "sim"], ["União e tupla", "não", "sim"], ["Estender", "com extends", "com interseção"], ["Declarar duas vezes", "junta as duas", "erro"], ["Tipos que calculam", "não", "sim"]]',
                },
                {
                    type: "text",
                    value: "## A diferença que decide\n\nA **fusão de declarações** é o que separa os dois na prática: declarar a mesma `interface` duas vezes junta os campos, e isso é como se estende tipos de bibliotecas de terceiros. Com `type`, redeclarar é erro.\n\nA regra que a maioria dos times adota: **interface para forma de objeto, type para o resto**.",
                },
                {
                    type: "code",
                    value: '// Acrescentando um campo a um tipo de biblioteca\ndeclare module "express" {\n  interface Request {\n    usuario?: Usuario;\n  }\n}\n\n// type é obrigatório aqui\ntype Resultado = Sucesso | Erro;\ntype Par = [string, number];\ntype Chaves = keyof Usuario;',
                },
            ],
            questions: [
                {
                    statement: "O que só o `type` consegue descrever?",
                    difficulty: "medio",
                    options: [
                        { text: "Uniões e tuplas", isCorrect: true },
                        { text: "Objetos com campos opcionais dentro", isCorrect: false },
                        { text: "Formas que serão estendidas depois", isCorrect: false },
                        { text: "Tipos usados em mais de um arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao declarar a mesma `interface` duas vezes?",
                    difficulty: "dificil",
                    options: [
                        { text: "As declarações se juntam", isCorrect: true },
                        { text: "A segunda substitui a primeira por completo", isCorrect: false },
                        { text: "O compilador aponta um erro de duplicidade", isCorrect: false },
                        { text: "A segunda é ignorada em completo silêncio", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a fusão de declarações na prática?",
                    difficulty: "dificil",
                    options: [
                        { text: "Estender tipos de bibliotecas de terceiros", isCorrect: true },
                        { text: "Dividir uma interface grande em arquivos", isCorrect: false },
                        { text: "Permitir dois tipos com o mesmo nome", isCorrect: false },
                        { text: "Sobrescrever campos herdados de outro tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual regra a maioria dos times adota?",
                    difficulty: "medio",
                    options: [
                        { text: "Interface para objeto, type para o resto", isCorrect: true },
                        { text: "Sempre type, por ser mais poderoso", isCorrect: false },
                        { text: "Sempre interface, por ser bem mais rápido", isCorrect: false },
                        { text: "Alternar conforme o tamanho do tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "Como uma `interface` estende outra?",
                    difficulty: "facil",
                    options: [
                        { text: "Com a palavra extends", isCorrect: true },
                        { text: "Com o operador de interseção", isCorrect: false },
                        { text: "Com a palavra implements", isCorrect: false },
                        { text: "Com dois-pontos após o nome", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Opcional, readonly e index signature",
            blocks: [
                {
                    type: "text",
                    value: "# Campos opcionais\n\nA interrogação marca o campo como opcional: ele pode faltar, e ao ler o tipo inclui `undefined`.",
                },
                {
                    type: "code",
                    value: 'interface Config {\n  url: string;\n  tempoLimite?: number;\n  cabecalhos?: Record<string, string>;\n}\n\nconst c: Config = { url: "/api" };   // ok\nc.tempoLimite.toFixed();             // erro: pode ser undefined\nc.tempoLimite?.toFixed();            // ok',
                },
                {
                    type: "text",
                    value: "## Opcional não é o mesmo que aceitar undefined\n\nUma distinção que aparece em revisão de código: `campo?: number` permite **omitir**, enquanto `campo: number | undefined` **exige** o campo, ainda que com valor indefinido. Em objeto de configuração você quer o primeiro; em resposta de API, muitas vezes o segundo.",
                },
                {
                    type: "text",
                    value: "## readonly\n\nMarca o campo como imutável depois de criado. Vale só na checagem: nada impede a alteração em execução, porque o tipo sumiu.",
                },
                {
                    type: "code",
                    value: "interface Ponto {\n  readonly x: number;\n  readonly y: number;\n}\n\nconst p: Ponto = { x: 1, y: 2 };\np.x = 10;   // erro na compilação",
                },
                {
                    type: "text",
                    value: "## Index signature\n\nQuando as chaves não são conhecidas de antemão, você descreve o formato delas. `Record<K, V>` é a forma curta e mais legível.",
                },
                {
                    type: "code",
                    value: "interface Dicionario {\n  [chave: string]: number;\n}\n\n// O mesmo, mais curto\ntype Dicionario = Record<string, number>;\n\n// Combinando chaves conhecidas com o resto\ninterface Resposta {\n  status: number;\n  [extra: string]: unknown;\n}",
                },
            ],
            questions: [
                {
                    statement: "O que a interrogação faz em um campo?",
                    difficulty: "facil",
                    options: [
                        { text: "Permite que ele seja omitido", isCorrect: true },
                        { text: "Permite que ele receba qualquer tipo", isCorrect: false },
                        { text: "Marca o campo como somente leitura", isCorrect: false },
                        { text: "Indica que o campo pode ser nulo", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual a diferença entre `campo?: number` e `campo: number | undefined`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O segundo exige o campo, mesmo indefinido", isCorrect: true },
                        {
                            text: "O primeiro aceita o null e o segundo não aceita",
                            isCorrect: false,
                        },
                        { text: "O segundo só funciona em interfaces", isCorrect: false },
                        { text: "Não há diferença prática entre os dois", isCorrect: false },
                    ],
                },
                {
                    statement: "O `readonly` impede alteração em execução?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, ele só vale na checagem", isCorrect: true },
                        { text: "Sim, o campo fica congelado no objeto", isCorrect: false },
                        { text: "Sim, quando o modo estrito está ligado", isCorrect: false },
                        { text: "Sim, o compilador gera um Object.freeze", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve uma index signature?",
                    difficulty: "medio",
                    options: [
                        { text: "Descrever objetos com chaves desconhecidas", isCorrect: true },
                        { text: "Criar um índice para uma busca mais rápida", isCorrect: false },
                        { text: "Ordenar as chaves de um objeto", isCorrect: false },
                        { text: "Impedir que chaves novas sejam criadas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a forma curta de `{ [k: string]: number }`?",
                    difficulty: "medio",
                    options: [
                        { text: "Record<string, number>", isCorrect: true },
                        { text: "Map<string, number>, da biblioteca padrão", isCorrect: false },
                        { text: "Dictionary<string, number>, tipo interno", isCorrect: false },
                        { text: "Index<string, number>, na sintaxe curta", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Interseção e composição",
            blocks: [
                {
                    type: "text",
                    value: "# Somando formas\n\nO `&` cria um tipo que tem **tudo** dos dois. É a forma de compor tipos pequenos em vez de escrever um grande.",
                },
                {
                    type: "code",
                    value: "type ComId = { id: number };\ntype ComDatas = { criadoEm: Date; atualizadoEm: Date };\ntype DadosUsuario = { nome: string; email: string };\n\ntype Usuario = ComId & ComDatas & DadosUsuario;\n\n// Reaproveitando nos outros\ntype Produto = ComId & ComDatas & { nome: string; preco: number };",
                },
                {
                    type: "text",
                    value: "## Interseção e união se confundem\n\nOs símbolos enganam quem vem de outras linguagens:\n\n- `A & B` é **e**: precisa satisfazer os dois, então tem os campos dos dois\n- `A | B` é **ou**: é um dos dois, então só dá para usar o que é comum\n\nA confusão vem de que a interseção **aumenta** os campos disponíveis, enquanto a união os reduz.",
                },
                {
                    type: "code",
                    value: "type A = { x: number; y: number };\ntype B = { y: number; z: number };\n\ntype E = A & B;   // tem x, y e z\ntype Ou = A | B;  // só y é garantido\n\nfunction f(v: Ou) {\n  v.y;   // ok\n  v.x;   // erro: pode ser um B\n}",
                },
                {
                    type: "text",
                    value: "## Quando a interseção não faz sentido\n\nInterseção de tipos incompatíveis gera `never`, um tipo que nenhum valor satisfaz. O compilador aceita a declaração e o erro só aparece quando alguém tenta usar.",
                },
                {
                    type: "code",
                    value: "type Impossivel = { a: string } & { a: number };\n// o campo a vira never: nada é string e number ao mesmo tempo",
                },
            ],
            questions: [
                {
                    statement: "O que `A & B` produz?",
                    difficulty: "medio",
                    options: [
                        { text: "Um tipo com os campos dos dois", isCorrect: true },
                        { text: "Um tipo com os campos comuns aos dois", isCorrect: false },
                        { text: "Um tipo que é um dos dois, não os dois", isCorrect: false },
                        { text: "Um tipo sem nenhum campo em comum", isCorrect: false },
                    ],
                },
                {
                    statement: "O que se pode acessar em um valor do tipo `A | B`?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o que existe nos dois", isCorrect: true },
                        { text: "Tudo que existe em qualquer um deles", isCorrect: false },
                        { text: "Nada, é preciso converter antes de usar", isCorrect: false },
                        { text: "Apenas os campos que forem opcionais", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que interseção e união confundem?",
                    difficulty: "dificil",
                    options: [
                        { text: "A interseção aumenta os campos e a união reduz", isCorrect: true },
                        { text: "Os dois símbolos são muito parecidos", isCorrect: false },
                        {
                            text: "Os dois acabam produzindo o mesmo resultado final",
                            isCorrect: false,
                        },
                        { text: "A união só funciona com tipos primitivos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao intersectar `{ a: string }` com `{ a: number }`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O campo vira never e nada satisfaz o tipo", isCorrect: true },
                        { text: "O compilador aponta um erro na declaração", isCorrect: false },
                        { text: "O último tipo declarado vence o conflito", isCorrect: false },
                        { text: "O campo passa a aceitar os dois tipos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de compor tipos pequenos?",
                    difficulty: "medio",
                    options: [
                        { text: "Reaproveitar as partes comuns entre eles", isCorrect: true },
                        { text: "Reduzir o tamanho do código compilado", isCorrect: false },
                        { text: "Acelerar a checagem feita pelo compilador", isCorrect: false },
                        { text: "Permitir que os tipos sejam alterados depois", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Generics",
            blocks: [
                {
                    type: "text",
                    value: "# Tipos com parâmetro\n\nSem generics, uma função que funciona com qualquer tipo perde a informação: entra `string`, sai `any`. O **generic** guarda o tipo que entrou e o devolve na saída.",
                },
                {
                    type: "code",
                    value: '// Perde o tipo\nfunction primeiro(lista: any[]): any {\n  return lista[0];\n}\nconst n = primeiro([1, 2, 3]);   // any, e o editor não ajuda\n\n// Preserva\nfunction primeiro<T>(lista: T[]): T | undefined {\n  return lista[0];\n}\nconst n = primeiro([1, 2, 3]);        // number\nconst s = primeiro(["a", "b"]);       // string',
                },
                {
                    type: "text",
                    value: "O `<T>` é um **parâmetro de tipo**: ele é preenchido na chamada, quase sempre por inferência. Você raramente precisa escrever `primeiro<number>([1,2,3])`.\n\n## Em tipos e interfaces\n\nGenerics não são só de função. Eles descrevem estruturas que carregam outro tipo dentro.",
                },
                {
                    type: "code",
                    value: "interface Resposta<T> {\n  dados: T;\n  status: number;\n  erro?: string;\n}\n\ntype RespostaUsuario = Resposta<Usuario>;\ntype RespostaLista = Resposta<Produto[]>;\n\n// Vários parâmetros\nfunction par<A, B>(a: A, b: B): [A, B] {\n  return [a, b];\n}",
                },
                {
                    type: "quote",
                    value: "Se um parâmetro de tipo aparece uma vez só na assinatura, ele provavelmente não deveria existir: generic serve para ligar entrada e saída.",
                },
            ],
            questions: [
                {
                    statement: "Que problema o generic resolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Preservar o tipo que entrou até a saída", isCorrect: true },
                        { text: "Permitir que a função aceite mais tipos", isCorrect: false },
                        { text: "Reduzir a quantidade de código escrito", isCorrect: false },
                        { text: "Validar os argumentos em tempo de execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o valor de `<T>` costuma ser definido?",
                    difficulty: "medio",
                    options: [
                        { text: "Por inferência, a partir dos argumentos", isCorrect: true },
                        {
                            text: "Escrito explicitamente em toda e qualquer chamada",
                            isCorrect: false,
                        },
                        { text: "Declarado uma vez no topo do arquivo", isCorrect: false },
                        { text: "Definido no tsconfig do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Generics servem apenas para funções?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, também para tipos e interfaces", isCorrect: true },
                        { text: "Sim, só funções podem ter parâmetro de tipo", isCorrect: false },
                        { text: "Não, mas em interfaces são apenas decorativos", isCorrect: false },
                        { text: "Sim, e apenas quando elas devolvem valor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que indica que um generic talvez seja desnecessário?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele aparecer uma única vez na assinatura", isCorrect: true },
                        { text: "Ele ser usado em mais de um dos parâmetros", isCorrect: false },
                        { text: "O nome dele não ser a letra T", isCorrect: false },
                        { text: "Ele ser inferido em vez de escrito", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Resposta<Produto[]>` significa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma resposta cujos dados são uma lista de produtos",
                            isCorrect: true,
                        },
                        { text: "Uma lista de respostas contendo produtos", isCorrect: false },
                        {
                            text: "Uma resposta que pode conter um produto ou uma lista",
                            isCorrect: false,
                        },
                        { text: "Um produto que contém uma resposta dentro", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Restrições em generics",
            blocks: [
                {
                    type: "text",
                    value: "# Limitando o que T pode ser\n\nUm generic sem restrição aceita qualquer tipo, e por isso você não pode acessar nada dentro dele. O `extends` impõe um mínimo.",
                },
                {
                    type: "code",
                    value: '// Erro: T pode ser qualquer coisa, e nem tudo tem length\nfunction tamanho<T>(v: T): number {\n  return v.length;\n}\n\n// Com restrição: T precisa ter length\nfunction tamanho<T extends { length: number }>(v: T): number {\n  return v.length;\n}\n\ntamanho("texto");     // ok\ntamanho([1, 2, 3]);   // ok\ntamanho(42);          // erro: number não tem length',
                },
                {
                    type: "text",
                    value: "## keyof\n\n`keyof T` é a união das chaves de `T`. Combinado com generics, ele permite escrever funções que acessam campos com segurança total.",
                },
                {
                    type: "code",
                    value: 'interface Usuario {\n  id: number;\n  nome: string;\n  email: string;\n}\n\ntype ChaveUsuario = keyof Usuario;   // "id" | "nome" | "email"\n\nfunction pegar<T, K extends keyof T>(obj: T, chave: K): T[K] {\n  return obj[chave];\n}\n\nconst u: Usuario = { id: 1, nome: "Ana", email: "a@b.c" };\n\nconst id = pegar(u, "id");       // number\nconst nome = pegar(u, "nome");   // string\npegar(u, "idade");               // erro: chave não existe',
                },
                {
                    type: "text",
                    value: "Repare no retorno `T[K]`: ele é o tipo do campo acessado, que muda conforme a chave passada. O editor sabe que `pegar(u, 'id')` é um número sem que você diga nada.\n\n## Valor padrão\n\nParâmetros de tipo aceitam padrão, útil quando o caso mais comum é sempre o mesmo.",
                },
                {
                    type: "code",
                    value: "interface Resposta<T = unknown> {\n  dados: T;\n  status: number;\n}\n\ntype Simples = Resposta;   // dados é unknown",
                },
            ],
            questions: [
                {
                    statement: "O que `extends` faz em um parâmetro de tipo?",
                    difficulty: "medio",
                    options: [
                        { text: "Impõe um mínimo que o tipo precisa ter", isCorrect: true },
                        { text: "Faz o tipo herdar de outra interface", isCorrect: false },
                        { text: "Permite que o tipo seja estendido depois", isCorrect: false },
                        { text: "Cria uma cópia do tipo com mais campos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `keyof Usuario` produz?",
                    difficulty: "medio",
                    options: [
                        { text: "A união das chaves do tipo", isCorrect: true },
                        { text: "Um array com os nomes das chaves", isCorrect: false },
                        { text: "Um objeto com as chaves e os tipos", isCorrect: false },
                        { text: "A quantidade de campos que o tipo tem", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o retorno `T[K]` representa?",
                    difficulty: "dificil",
                    options: [
                        { text: "O tipo do campo acessado por aquela chave", isCorrect: true },
                        { text: "Um array indexado pelo tipo da chave", isCorrect: false },
                        { text: "O tipo da chave e não do valor", isCorrect: false },
                        { text: "Um tipo genérico que aceita qualquer campo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que não se pode acessar `v.length` em um `T` sem restrição?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque T pode ser um tipo que não tem length", isCorrect: true },
                        {
                            text: "Porque generics não permitem acessar campo algum",
                            isCorrect: false,
                        },
                        { text: "Porque length é uma propriedade privada", isCorrect: false },
                        { text: "Porque o valor ainda não foi inicializado", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve um valor padrão em parâmetro de tipo?",
                    difficulty: "medio",
                    options: [
                        { text: "Dispensar informá-lo no caso mais comum", isCorrect: true },
                        { text: "Permitir que ele seja omitido na declaração", isCorrect: false },
                        { text: "Garantir que o tipo nunca seja undefined", isCorrect: false },
                        { text: "Definir um valor inicial para a variável", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Tipos que calculam",
    aulas: [
        {
            titulo: "Utility types",
            blocks: [
                {
                    type: "text",
                    value: "# Transformações que já vêm prontas\n\nO TypeScript traz um conjunto de tipos que derivam um tipo de outro. Eles evitam a duplicação mais comum de todas: escrever quase a mesma interface de novo com uma diferença pequena.",
                },
                {
                    type: "table",
                    value: '[["Utility", "O que faz"], ["Partial<T>", "todos os campos viram opcionais"], ["Required<T>", "todos viram obrigatórios"], ["Readonly<T>", "todos viram somente leitura"], ["Pick<T, K>", "só as chaves escolhidas"], ["Omit<T, K>", "todas menos as escolhidas"], ["Record<K, V>", "objeto de chaves K e valores V"], ["ReturnType<F>", "o que a função devolve"]]',
                },
                {
                    type: "code",
                    value: 'interface Usuario {\n  id: number;\n  nome: string;\n  email: string;\n  senha: string;\n}\n\n// O que a API devolve: sem a senha\ntype UsuarioPublico = Omit<Usuario, "senha">;\n\n// O que o formulário de edição aceita: tudo opcional, sem o id\ntype AtualizarUsuario = Partial<Omit<Usuario, "id">>;\n\n// O que o cadastro exige\ntype CriarUsuario = Pick<Usuario, "nome" | "email" | "senha">;',
                },
                {
                    type: "text",
                    value: "## Por que isso importa\n\nOs quatro tipos acima derivam de `Usuario`. Quando um campo é acrescentado lá, os quatro acompanham sozinhos. Escritos à mão, um deles seria esquecido na próxima alteração, e esse é exatamente o tipo de bug que o TypeScript deveria evitar.",
                },
                {
                    type: "code",
                    value: "// Extraindo tipos de funções e promessas\ntype Resultado = ReturnType<typeof buscarUsuario>;\ntype Dados = Awaited<ReturnType<typeof buscarUsuario>>;\ntype Params = Parameters<typeof criar>;",
                },
            ],
            questions: [
                {
                    statement: "O que `Partial<T>` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Torna todos os campos opcionais", isCorrect: true },
                        { text: "Remove metade dos campos do tipo", isCorrect: false },
                        { text: "Torna todos os campos somente leitura", isCorrect: false },
                        { text: "Cria um tipo com apenas um campo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `Pick` e `Omit`?",
                    difficulty: "medio",
                    options: [
                        { text: "Um escolhe as chaves e o outro as descarta", isCorrect: true },
                        { text: "Um funciona com interfaces e o outro com type", isCorrect: false },
                        { text: "Um mantém a ordem e o outro reordena", isCorrect: false },
                        { text: "Um aceita uma chave e o outro várias", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de derivar tipos em vez de escrevê-los à mão?",
                    difficulty: "dificil",
                    options: [
                        { text: "Eles acompanham a mudança do tipo de origem", isCorrect: true },
                        { text: "Eles ocupam menos espaço no arquivo final", isCorrect: false },
                        { text: "Eles são checados mais rápido pelo compilador", isCorrect: false },
                        {
                            text: "Eles permitem campos que não existem na origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `ReturnType<typeof f>` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "O tipo que a função f devolve", isCorrect: true },
                        { text: "Os tipos dos parâmetros da função f", isCorrect: false },
                        { text: "O tipo da própria função f", isCorrect: false },
                        { text: "O valor devolvido pela função f", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `Awaited<T>`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Extrair o tipo de dentro de uma promessa", isCorrect: true },
                        { text: "Fazer o tipo esperar a execução terminar", isCorrect: false },
                        { text: "Marcar a função como assíncrona", isCorrect: false },
                        { text: "Converter um tipo comum em promessa", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Conditional types",
            blocks: [
                {
                    type: "text",
                    value: "# Tipos com if\n\nUm **conditional type** escolhe entre dois tipos conforme uma condição. A sintaxe é o ternário, aplicado a tipos.",
                },
                {
                    type: "code",
                    value: 'type EhString<T> = T extends string ? "sim" : "não";\n\ntype A = EhString<"oi">;   // "sim"\ntype B = EhString<42>;     // "não"\n\n// Um caso útil: descartar null e undefined\ntype SemNulo<T> = T extends null | undefined ? never : T;\ntype C = SemNulo<string | null>;   // string',
                },
                {
                    type: "text",
                    value: "## Distributividade\n\nO comportamento que mais surpreende: quando o tipo testado é uma **união** e aparece sozinho antes do `extends`, a condição é aplicada **a cada membro separadamente**, e os resultados voltam como união.\n\nÉ isso que faz `SemNulo<string | null>` devolver `string` em vez de `string | null`.",
                },
                {
                    type: "code",
                    value: "type Caixa<T> = T extends unknown ? T[] : never;\n\ntype D = Caixa<string | number>;\n// distribui: string[] | number[]\n\n// Para NÃO distribuir, envolva em colchetes\ntype Caixa2<T> = [T] extends [unknown] ? T[] : never;\ntype E = Caixa2<string | number>;\n// não distribui: (string | number)[]",
                },
                {
                    type: "text",
                    value: "## infer\n\nDentro de um conditional type, `infer` **captura** um pedaço do tipo em uma variável. É como os utility types de extração são construídos.",
                },
                {
                    type: "code",
                    value: "// Extraindo o tipo de dentro de um array\ntype Item<T> = T extends (infer U)[] ? U : never;\ntype F = Item<string[]>;   // string\n\n// Extraindo o retorno de uma função\ntype Retorno<T> = T extends (...args: any[]) => infer R ? R : never;\n\n// Extraindo de dentro de uma promessa\ntype Resolvido<T> = T extends Promise<infer U> ? U : T;",
                },
            ],
            questions: [
                {
                    statement: "Qual a sintaxe de um conditional type?",
                    difficulty: "medio",
                    options: [
                        { text: "A do ternário, com extends na condição", isCorrect: true },
                        { text: "A do if e else, com chaves em volta", isCorrect: false },
                        { text: "A do switch, com um caso por tipo", isCorrect: false },
                        { text: "A do operador de união escrito entre os dois", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando o tipo testado é uma união?",
                    difficulty: "dificil",
                    options: [
                        { text: "A condição é aplicada a cada membro", isCorrect: true },
                        { text: "A condição é aplicada à união inteira", isCorrect: false },
                        { text: "O compilador aponta erro de ambiguidade", isCorrect: false },
                        { text: "Apenas o primeiro membro é considerado", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se impede a distributividade?",
                    difficulty: "dificil",
                    options: [
                        { text: "Envolvendo os dois lados em colchetes", isCorrect: true },
                        { text: "Usando never no lugar do unknown", isCorrect: false },
                        { text: "Declarando o tipo como não genérico", isCorrect: false },
                        { text: "Trocando o extends por uma interseção", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `infer` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Captura um pedaço do tipo em uma variável", isCorrect: true },
                        { text: "Deduz o tipo a partir de um valor", isCorrect: false },
                        { text: "Força o compilador a inferir de novo", isCorrect: false },
                        { text: "Declara um parâmetro de tipo como opcional", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `T extends (infer U)[] ? U : never` faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Extrai o tipo dos itens de um array", isCorrect: true },
                        { text: "Verifica se o tipo é um array vazio", isCorrect: false },
                        { text: "Converte qualquer tipo em um array", isCorrect: false },
                        { text: "Devolve o tamanho do array informado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Mapped types",
            blocks: [
                {
                    type: "text",
                    value: "# Percorrendo as chaves de um tipo\n\nUm **mapped type** cria um tipo novo aplicando uma transformação a cada chave de outro. É assim que `Partial` e `Readonly` são implementados, e você pode escrever os seus.",
                },
                {
                    type: "code",
                    value: "// É assim que Partial é definido\ntype Partial<T> = {\n  [K in keyof T]?: T[K];\n};\n\n// E Readonly\ntype Readonly<T> = {\n  readonly [K in keyof T]: T[K];\n};\n\n// Um seu: tudo vira string\ntype Stringificado<T> = {\n  [K in keyof T]: string;\n};",
                },
                {
                    type: "text",
                    value: "## Acrescentar e remover modificadores\n\nO `-` na frente de `?` ou `readonly` **remove** o modificador. É como `Required` funciona.",
                },
                {
                    type: "code",
                    value: "type Required<T> = {\n  [K in keyof T]-?: T[K];\n};\n\ntype Mutavel<T> = {\n  -readonly [K in keyof T]: T[K];\n};",
                },
                {
                    type: "text",
                    value: "## Renomeando chaves com `as`\n\nO `as` dentro do mapped type permite mudar o nome de cada chave. Combinado com template literal types, ele gera famílias inteiras de tipos.",
                },
                {
                    type: "code",
                    value: "interface Usuario {\n  nome: string;\n  idade: number;\n}\n\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\n\ntype UsuarioGetters = Getters<Usuario>;\n// { getNome: () => string; getIdade: () => number }",
                },
            ],
            questions: [
                {
                    statement: "O que um mapped type faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Transforma cada chave de outro tipo", isCorrect: true },
                        { text: "Converte um tipo em um objeto Map", isCorrect: false },
                        { text: "Mapeia valores para chaves diferentes", isCorrect: false },
                        { text: "Percorre os valores de um objeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `-?` faz em um mapped type?",
                    difficulty: "dificil",
                    options: [
                        { text: "Remove a opcionalidade das chaves", isCorrect: true },
                        { text: "Torna todas as chaves opcionais", isCorrect: false },
                        { text: "Remove as chaves que são opcionais", isCorrect: false },
                        { text: "Inverte o tipo de cada chave", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o `as` dentro de um mapped type?",
                    difficulty: "dificil",
                    options: [
                        { text: "Renomear as chaves geradas", isCorrect: true },
                        { text: "Afirmar o tipo de cada valor", isCorrect: false },
                        { text: "Converter o tipo para outro formato", isCorrect: false },
                        { text: "Filtrar quais chaves serão incluídas", isCorrect: false },
                    ],
                },
                {
                    statement: "Como `Readonly<T>` é implementado?",
                    difficulty: "medio",
                    options: [
                        { text: "Como um mapped type que acrescenta readonly", isCorrect: true },
                        { text: "Como uma função interna do compilador", isCorrect: false },
                        { text: "Como uma interseção com um tipo vazio", isCorrect: false },
                        {
                            text: "Como um conditional type aplicado sobre as chaves",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `[K in keyof T]` percorre?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada chave do tipo T", isCorrect: true },
                        { text: "Cada valor guardado no objeto T", isCorrect: false },
                        { text: "Cada tipo da união chamada T", isCorrect: false },
                        { text: "Cada item de um array do tipo T", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Template literal types",
            blocks: [
                {
                    type: "text",
                    value: "# Strings que o compilador entende\n\nUm **template literal type** monta tipos de texto a partir de outros tipos. Ele transforma padrões de nome, que antes eram convenção informal, em algo que o compilador verifica.",
                },
                {
                    type: "code",
                    value: 'type Metodo = "get" | "post";\ntype Recurso = "usuario" | "produto";\n\ntype Rota = `/${Recurso}`;\n// "/usuario" | "/produto"\n\ntype Handler = `${Metodo}${Capitalize<Recurso>}`;\n// "getUsuario" | "getProduto" | "postUsuario" | "postProduto"',
                },
                {
                    type: "text",
                    value: "Repare que a combinação é feita pelo compilador: duas uniões de dois membros geram quatro possibilidades. Escrever isso à mão não escala.\n\n## Os utilitários de texto\n\nQuatro tipos internos transformam o texto: `Uppercase`, `Lowercase`, `Capitalize` e `Uncapitalize`.",
                },
                {
                    type: "code",
                    value: 'type A = Uppercase<"abc">;      // "ABC"\ntype B = Capitalize<"nome">;    // "Nome"\ntype C = Lowercase<"ABC">;      // "abc"',
                },
                {
                    type: "text",
                    value: "## Um caso real\n\nO padrão mais comum é tipar um objeto de eventos ou de rotas, garantindo que o nome siga a convenção.",
                },
                {
                    type: "code",
                    value: 'type Evento = "click" | "focus" | "blur";\n\ntype Ouvintes = {\n  [E in Evento as `on${Capitalize<E>}`]?: (e: Event) => void;\n};\n// { onClick?: ...; onFocus?: ...; onBlur?: ... }\n\n// Extraindo com infer\ntype ParamRota<T> = T extends `${string}:${infer P}` ? P : never;\ntype X = ParamRota<"/usuarios/:id">;   // "id"',
                },
            ],
            questions: [
                {
                    statement: "O que um template literal type monta?",
                    difficulty: "medio",
                    options: [
                        { text: "Tipos de texto a partir de outros tipos", isCorrect: true },
                        { text: "Strings formatadas em tempo de execução", isCorrect: false },
                        { text: "Modelos de HTML verificados na compilação", isCorrect: false },
                        { text: "Constantes de texto exportadas do módulo", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Quantos tipos resultam da combinação de duas uniões de dois membros?",
                    difficulty: "medio",
                    options: [
                        { text: "Quatro", isCorrect: true },
                        { text: "Dois, um para cada união informada", isCorrect: false },
                        { text: "Um só, com todos os textos juntos", isCorrect: false },
                        { text: "Três, descartando a combinação repetida", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Capitalize<'nome'>` produz?",
                    difficulty: "facil",
                    options: [
                        { text: '"Nome"', isCorrect: true },
                        { text: '"NOME"', isCorrect: false },
                        { text: '"nome"', isCorrect: false },
                        { text: '"nOME"', isCorrect: false },
                    ],
                },
                {
                    statement: "O que se ganha ao tipar nomes com template literal?",
                    difficulty: "dificil",
                    options: [
                        { text: "A convenção de nome passa a ser verificada", isCorrect: true },
                        { text: "Os nomes ficam mais curtos no código", isCorrect: false },
                        { text: "As strings são criadas em tempo de execução", isCorrect: false },
                        { text: "O compilador gera os nomes automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `T extends `${string}:${infer P}` ? P : never` extrai?",
                    difficulty: "dificil",
                    options: [
                        { text: "O trecho que vem depois dos dois-pontos", isCorrect: true },
                        { text: "O trecho que aparece antes dos dois-pontos", isCorrect: false },
                        { text: "A quantidade de dois-pontos no texto", isCorrect: false },
                        { text: "O texto inteiro, sem os dois-pontos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Quando parar de tipar",
            blocks: [
                {
                    type: "text",
                    value: "# Tipo também tem custo\n\nOs recursos dos módulos anteriores permitem descrever quase qualquer coisa no sistema de tipos. A pergunta que fica é **quanto** vale a pena.\n\nTipo complexo demais cobra em três moedas: leitura, mensagem de erro e tempo de compilação. Um tipo que ninguém do time entende é pior que um `unknown` bem colocado com validação em execução.",
                },
                {
                    type: "code",
                    value: '// Difícil de ler, difícil de manter, erro incompreensível\ntype Caminhos<T, P extends string = ""> = T extends object\n  ? { [K in keyof T & string]: Caminhos<T[K], P extends "" ? K : `${P}.${K}`> }[keyof T & string]\n  : P;\n\n// Muitas vezes basta\ntype Caminho = "usuario.nome" | "usuario.email" | "pedido.total";',
                },
                {
                    type: "text",
                    value: "## Os sinais de que passou do ponto\n\n- A mensagem de erro tem mais de dez linhas e não diz onde está o problema\n- Ninguém do time consegue alterar o tipo sem tentativa e erro\n- O editor fica lento ao abrir o arquivo\n- O tipo precisa de um comentário explicando como funciona",
                },
                {
                    type: "quote",
                    value: "Tipo existe para ajudar quem escreve o código. Quando ele vira o problema em vez da solução, simplificar é a resposta certa.",
                },
                {
                    type: "text",
                    value: "## O meio-termo que funciona\n\nUse tipos avançados onde eles se pagam: em biblioteca usada por muita gente, ou em um ponto do sistema onde o erro é caro. No código do dia a dia, tipos simples e explícitos ganham quase sempre.",
                },
            ],
            questions: [
                {
                    statement: "Em que moedas um tipo complexo cobra?",
                    difficulty: "medio",
                    options: [
                        { text: "Leitura, mensagem de erro e compilação", isCorrect: true },
                        { text: "Memória, disco e tempo de execução", isCorrect: false },
                        { text: "Tamanho do arquivo gerado no build", isCorrect: false },
                        { text: "Compatibilidade com versões anteriores", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é um sinal de que o tipo ficou complexo demais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A mensagem de erro não diz onde está o problema",
                            isCorrect: true,
                        },
                        { text: "O tipo usa mais de um parâmetro genérico", isCorrect: false },
                        { text: "O tipo é usado em mais de um arquivo", isCorrect: false },
                        {
                            text: "O tipo foi derivado de algum outro tipo existente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde tipos avançados costumam se pagar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em biblioteca usada por muita gente", isCorrect: true },
                        { text: "No código das telas de uma aplicação", isCorrect: false },
                        { text: "Em scripts de automação pequenos", isCorrect: false },
                        { text: "Em testes automatizados do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que costuma ser melhor que um tipo indecifrável?",
                    difficulty: "medio",
                    options: [
                        { text: "Um unknown com validação em execução", isCorrect: true },
                        { text: "Um any bem documentado no comentário", isCorrect: false },
                        { text: "Uma interface com todos os campos opcionais", isCorrect: false },
                        { text: "Vários tipos pequenos com o mesmo nome", isCorrect: false },
                    ],
                },
                {
                    statement: "Para quem o tipo existe?",
                    difficulty: "facil",
                    options: [
                        { text: "Para quem escreve e lê o código", isCorrect: true },
                        { text: "Para o compilador otimizar o resultado", isCorrect: false },
                        { text: "Para a documentação gerada do projeto", isCorrect: false },
                        { text: "Para o navegador validar os dados", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - TypeScript no mundo real",
    aulas: [
        {
            titulo: "Módulos e import type",
            blocks: [
                {
                    type: "text",
                    value: "# Cada arquivo é um módulo\n\nUm arquivo com `import` ou `export` é um módulo, com escopo próprio. Sem nenhum dos dois, ele é tratado como script global, e tudo que ele declara colide com o resto do projeto.\n\nQuando um arquivo de tipos parece estar sendo ignorado, a primeira coisa a conferir é se ele exporta alguma coisa.",
                },
                {
                    type: "code",
                    value: 'export interface Usuario {\n  id: number;\n  nome: string;\n}\n\nexport type Papel = "admin" | "editor";\n\nexport function criar(u: Usuario): void {}\nexport default criar;',
                },
                {
                    type: "text",
                    value: "## import type\n\nImportar um tipo com `import type` deixa explícito que aquilo **some na compilação**. O compilador remove a linha inteira, e nenhum efeito colateral do módulo é disparado por engano.",
                },
                {
                    type: "code",
                    value: 'import type { Usuario } from "./tipos";\nimport { criar } from "./servico";\n\n// Misturando os dois na mesma linha\nimport { criar, type Usuario } from "./modulo";',
                },
                {
                    type: "text",
                    value: "Sem `import type`, um import usado apenas em posição de tipo pode acabar mantido no resultado por engano, arrastando o módulo inteiro. Em projeto grande isso vira dependência circular e tempo de carga que ninguém explica.\n\n## Caminhos\n\nCom `moduleResolution: bundler`, imports relativos dispensam a extensão. Em Node com módulos ES, a extensão `.js` é obrigatória mesmo no arquivo `.ts`, o que confunde quase todo mundo na primeira vez.",
                },
                {
                    type: "code",
                    value: '// Com bundler\nimport { criar } from "./servico";\n\n// Em Node com ESM: extensão .js, mesmo o arquivo sendo .ts\nimport { criar } from "./servico.js";',
                },
            ],
            questions: [
                {
                    statement: "O que torna um arquivo um módulo em TypeScript?",
                    difficulty: "medio",
                    options: [
                        { text: "Ter ao menos um import ou export", isCorrect: true },
                        { text: "Ter a extensão .ts em vez de .js", isCorrect: false },
                        { text: "Estar dentro da pasta configurada em rootDir", isCorrect: false },
                        { text: "Declarar ao menos uma interface exportável", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com um arquivo sem import nem export?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele é tratado como script global", isCorrect: true },
                        { text: "Ele é ignorado pelo compilador por completo", isCorrect: false },
                        { text: "Ele gera um erro de módulo inválido", isCorrect: false },
                        { text: "Ele é compilado sem checagem de tipos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `import type` garante?",
                    difficulty: "medio",
                    options: [
                        { text: "Que a linha some na compilação", isCorrect: true },
                        { text: "Que o tipo seja verificado com mais rigor", isCorrect: false },
                        { text: "Que o módulo seja carregado antes dos outros", isCorrect: false },
                        { text: "Que apenas tipos possam ser exportados de lá", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual problema um import de tipo mantido por engano pode causar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Dependência circular e carga desnecessária", isCorrect: true },
                        { text: "Erro de tipo em tempo de execução", isCorrect: false },
                        { text: "Perda da checagem naquele arquivo", isCorrect: false },
                        { text: "Duplicação do tipo dentro do resultado final", isCorrect: false },
                    ],
                },
                {
                    statement: "Em Node com módulos ES, qual extensão o import usa?",
                    difficulty: "dificil",
                    options: [
                        { text: ".js, mesmo o arquivo sendo .ts", isCorrect: true },
                        { text: ".ts, igual ao arquivo de origem", isCorrect: false },
                        { text: "Nenhuma, a extensão é dispensada", isCorrect: false },
                        { text: ".mjs, para indicar o formato do módulo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Bibliotecas, @types e declarações",
            blocks: [
                {
                    type: "text",
                    value: "# Três situações\n\nAo instalar uma biblioteca, você cai em um de três casos:\n\n1. Ela **já vem com tipos**, e não há nada a fazer\n2. Os tipos moram em um pacote `@types`, publicado pela comunidade\n3. Não existe tipo nenhum, e você declara o que precisa",
                },
                {
                    type: "code",
                    value: "# Caso 1: os tipos vêm junto\nnpm install zod\n\n# Caso 2: pacote separado, sempre como dev\nnpm install express\nnpm install --save-dev @types/express",
                },
                {
                    type: "text",
                    value: "## Quando não há tipos\n\nUm arquivo `.d.ts` declara o formato de algo que existe mas o TypeScript não conhece. Ele só contém declarações e nunca gera código.",
                },
                {
                    type: "code",
                    value: '// tipos/biblioteca-antiga.d.ts\ndeclare module "biblioteca-antiga" {\n  export function calcular(a: number, b: number): number;\n  export const versao: string;\n}\n\n// Declarando algo global, como uma variável injetada no HTML\ndeclare global {\n  interface Window {\n    minhaConfig: { apiUrl: string };\n  }\n}\n\nexport {};',
                },
                {
                    type: "text",
                    value: "## A saída rápida, e o preço dela\n\nUma declaração vazia faz o import compilar, ao custo de o módulo inteiro virar `any`. Serve para destravar, mas deixa um buraco que ninguém enxerga depois.",
                },
                {
                    type: "code",
                    value: 'declare module "biblioteca-antiga";   // tudo vira any',
                },
            ],
            questions: [
                {
                    statement: "Onde ficam os tipos de bibliotecas que não os trazem?",
                    difficulty: "medio",
                    options: [
                        { text: "Em pacotes @types da comunidade", isCorrect: true },
                        { text: "No próprio TypeScript, que já os conhece", isCorrect: false },
                        { text: "Em um arquivo gerado pelo compilador", isCorrect: false },
                        { text: "Na pasta node_modules da biblioteca", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um pacote `@types` deve ser instalado?",
                    difficulty: "medio",
                    options: [
                        { text: "Como dependência de desenvolvimento", isCorrect: true },
                        { text: "Como dependência normal do projeto", isCorrect: false },
                        { text: "Globalmente, para valer em todos os projetos", isCorrect: false },
                        { text: "Junto da biblioteca, no mesmo comando", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um arquivo `.d.ts` contém?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas declarações, sem gerar código", isCorrect: true },
                        { text: "O código já compilado de uma biblioteca", isCorrect: false },
                        { text: "Os testes de tipo do projeto", isCorrect: false },
                        { text: "A configuração do compilador", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o preço de `declare module 'x';` sem corpo?",
                    difficulty: "dificil",
                    options: [
                        { text: "O módulo inteiro vira any", isCorrect: true },
                        { text: "O módulo deixa de poder ser importado", isCorrect: false },
                        { text: "O compilador ignora o arquivo que o usa", isCorrect: false },
                        { text: "A biblioteca precisa ser reinstalada", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `declare global`?",
                    difficulty: "medio",
                    options: [
                        { text: "Acrescentar tipos ao escopo global", isCorrect: true },
                        { text: "Tornar um tipo visível em outros projetos", isCorrect: false },
                        { text: "Declarar variáveis usadas em todo o arquivo", isCorrect: false },
                        { text: "Importar tipos sem escrever o import", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Type guards e validação de dados externos",
            blocks: [
                {
                    type: "text",
                    value: "# A fronteira do sistema\n\nTudo que entra de fora, resposta de API, corpo de requisição, arquivo lido, é `unknown` na prática, mesmo que o tipo diga outra coisa. A **fronteira** é onde a validação precisa acontecer.\n\nDepois dela, o resto do código pode confiar nos tipos.",
                },
                {
                    type: "text",
                    value: "## Type predicate\n\nUma função que devolve `v is Tipo` ensina o compilador a estreitar. Ela é a ponte entre a verificação em execução e o tipo em compilação.",
                },
                {
                    type: "code",
                    value: 'interface Usuario {\n  id: number;\n  nome: string;\n}\n\nfunction ehUsuario(v: unknown): v is Usuario {\n  return (\n    typeof v === "object" && v !== null &&\n    "id" in v && typeof (v as Usuario).id === "number" &&\n    "nome" in v && typeof (v as Usuario).nome === "string"\n  );\n}\n\nconst dados: unknown = await resposta.json();\n\nif (ehUsuario(dados)) {\n  console.log(dados.nome);   // aqui é Usuario de verdade\n}',
                },
                {
                    type: "text",
                    value: "## O risco do predicate escrito à mão\n\nO compilador **acredita** no que você declarou: se o corpo da função esquecer de checar um campo, o tipo mente e o erro reaparece longe dali.\n\nPor isso a prática mais comum hoje é usar uma biblioteca de validação que **gera o tipo a partir do esquema**. A forma é descrita uma vez, e a verificação e o tipo nunca divergem.",
                },
                {
                    type: "code",
                    value: 'import { z } from "zod";\n\nconst UsuarioSchema = z.object({\n  id: z.number(),\n  nome: z.string(),\n  email: z.string().email(),\n});\n\n// O tipo sai do esquema, não é escrito de novo\ntype Usuario = z.infer<typeof UsuarioSchema>;\n\nconst dados = UsuarioSchema.parse(await resposta.json());\n// Se não bater, lança. Se passar, dados é Usuario e é verdade.',
                },
                {
                    type: "quote",
                    value: "Valide na borda, confie no miolo. Espalhar verificação por todo o código é sinal de que a fronteira não está clara.",
                },
            ],
            questions: [
                {
                    statement: "O que uma função com retorno `v is Tipo` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Ensina o compilador a estreitar o tipo", isCorrect: true },
                        { text: "Converte o valor para o tipo informado", isCorrect: false },
                        { text: "Valida o valor durante a compilação", isCorrect: false },
                        { text: "Lança exceção quando o tipo não bate", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o risco de um type predicate escrito à mão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O compilador acredita mesmo se a checagem estiver errada",
                            isCorrect: true,
                        },
                        {
                            text: "Ele acaba deixando a execução do código muito mais lenta que o normal",
                            isCorrect: false,
                        },
                        { text: "Ele não funciona com tipos genéricos", isCorrect: false },
                        { text: "Ele precisa ser repetido em cada arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de gerar o tipo a partir de um esquema?",
                    difficulty: "medio",
                    options: [
                        { text: "A verificação e o tipo nunca divergem", isCorrect: true },
                        { text: "O esquema passa a ser validado na compilação", isCorrect: false },
                        { text: "O código gerado fica bem menor", isCorrect: false },
                        { text: "Os tipos deixam de ser apagados", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde a validação deve acontecer?",
                    difficulty: "medio",
                    options: [
                        { text: "Na fronteira, onde o dado entra", isCorrect: true },
                        { text: "Em cada função que usa o dado", isCorrect: false },
                        { text: "No momento em que o dado é exibido", isCorrect: false },
                        { text: "Apenas nos testes automatizados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o tipo real de uma resposta de `json()`?",
                    difficulty: "medio",
                    options: [
                        { text: "Desconhecido, ainda que anotado", isCorrect: true },
                        { text: "O tipo declarado na anotação da função", isCorrect: false },
                        { text: "Sempre um objeto com campos de texto", isCorrect: false },
                        { text: "O tipo inferido do endpoint chamado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Classes e o operador satisfies",
            blocks: [
                {
                    type: "text",
                    value: "# Classes com tipos\n\nClasses em TypeScript ganham modificadores de visibilidade e propriedades declaradas no construtor, o que reduz muito a repetição.",
                },
                {
                    type: "code",
                    value: 'class Conta {\n  // Declarar no construtor cria e atribui de uma vez\n  constructor(\n    public readonly id: number,\n    private saldo: number,\n  ) {}\n\n  depositar(valor: number): void {\n    if (valor <= 0) throw new Error("valor inválido");\n    this.saldo += valor;\n  }\n\n  get extrato(): number {\n    return this.saldo;\n  }\n}',
                },
                {
                    type: "table",
                    value: '[["Modificador", "Quem enxerga", "Existe em execução"], ["public", "todos", "sim"], ["protected", "a classe e as filhas", "não, só na checagem"], ["private", "só a classe", "não, só na checagem"], ["#campo", "só a classe", "sim, é do JavaScript"]]',
                },
                {
                    type: "text",
                    value: "Repare na última linha: `private` do TypeScript **some na compilação**, então nada impede o acesso em execução. O `#campo` é privado de verdade, porque é um recurso do próprio JavaScript.\n\n## O operador satisfies\n\nEle verifica que um valor **satisfaz** um tipo, sem alargar a inferência. É a resposta para o dilema entre anotar e não anotar.",
                },
                {
                    type: "code",
                    value: 'type Config = Record<string, string | number>;\n\n// Anotando: perde o detalhe, tudo vira string | number\nconst a: Config = { porta: 3000, host: "local" };\na.porta.toFixed();   // erro: pode ser string\n\n// Sem anotar: não valida nada\nconst b = { porta: 3000, host: "local" };\n\n// Com satisfies: valida e mantém os tipos exatos\nconst c = { porta: 3000, host: "local" } satisfies Config;\nc.porta.toFixed();   // ok, porta é number\nc.hoost;             // erro de digitação apontado',
                },
            ],
            questions: [
                {
                    statement: "O que declarar a propriedade no construtor evita?",
                    difficulty: "medio",
                    options: [
                        { text: "Declarar e atribuir o campo separadamente", isCorrect: true },
                        { text: "A necessidade de tipar os parâmetros", isCorrect: false },
                        { text: "Que a classe precise declarar um construtor", isCorrect: false },
                        { text: "Que o campo apareça no objeto criado", isCorrect: false },
                    ],
                },
                {
                    statement: "O `private` do TypeScript protege em execução?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, ele some na compilação", isCorrect: true },
                        { text: "Sim, o campo fica inacessível de fora", isCorrect: false },
                        { text: "Sim, ele vira um campo com sustenido", isCorrect: false },
                        { text: "Sim, quando o modo estrito está ligado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual forma dá privacidade de verdade?",
                    difficulty: "medio",
                    options: [
                        { text: "O campo com sustenido do JavaScript", isCorrect: true },
                        { text: "O modificador private do TypeScript", isCorrect: false },
                        { text: "O modificador protected na classe", isCorrect: false },
                        { text: "A palavra readonly antes do campo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `satisfies` faz que a anotação não faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Valida sem alargar os tipos inferidos", isCorrect: true },
                        { text: "Verifica o valor em tempo de execução", isCorrect: false },
                        { text: "Converte o valor para o tipo informado", isCorrect: false },
                        { text: "Permite campos que o tipo não declara", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao anotar um objeto com um tipo amplo?",
                    difficulty: "medio",
                    options: [
                        { text: "Os tipos exatos de cada campo se perdem", isCorrect: true },
                        { text: "Os campos a mais passam a ser sempre aceitos", isCorrect: false },
                        { text: "O objeto vira somente leitura", isCorrect: false },
                        { text: "A inferência é desligada no arquivo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Lendo as mensagens do compilador",
            blocks: [
                {
                    type: "text",
                    value: "# Erros que parecem impenetráveis\n\nAs mensagens do TypeScript ficam longas quando os tipos são grandes, e a informação útil quase sempre está no **fim**, não no começo.\n\nA estratégia que funciona: leia de baixo para cima. A última linha costuma dizer exatamente qual campo, de qual tipo, não é compatível com qual outro.",
                },
                {
                    type: "code",
                    value: "Argument of type '{ nome: string; idade: string; }' is not assignable\nto parameter of type 'Usuario'.\n  Types of property 'idade' are incompatible.\n    Type 'string' is not assignable to type 'number'.\n\n// A última linha é a resposta: idade veio como texto",
                },
                {
                    type: "table",
                    value: '[["Mensagem", "O que costuma ser"], ["Object is possibly \'undefined\'", "falta checar antes de usar"], ["Property does not exist on type", "erro de digitação ou tipo errado"], ["Type \'X\' is not assignable to \'Y\'", "o campo apontado no fim não bate"], ["No overload matches this call", "argumentos na ordem ou tipo errados"], ["Excessive stack depth", "tipo recursivo sem fim"]]',
                },
                {
                    type: "text",
                    value: "## Duas ferramentas de investigação\n\nQuando o tipo não é o que você esperava, pergunte ao compilador em vez de adivinhar. Passar o mouse sobre a variável no editor mostra o tipo resolvido, e um tipo auxiliar força a exibição.",
                },
                {
                    type: "code",
                    value: '// Forçando o editor a mostrar o tipo expandido\ntype Expandir<T> = { [K in keyof T]: T[K] } & {};\n\ntype Opaco = Partial<Omit<Usuario, "senha">>;\ntype Claro = Expandir<Opaco>;   // agora o editor mostra os campos\n\n// Afirmando uma expectativa no próprio código\nconst _checagem: Usuario = objeto;   // falha aqui se não bater',
                },
                {
                    type: "quote",
                    value: "Quando o erro não fizer sentido, simplifique: reduza o caso a três linhas. Quase sempre o problema aparece antes de você terminar de reduzir.",
                },
            ],
            questions: [
                {
                    statement: "Onde está a informação útil em um erro longo do TypeScript?",
                    difficulty: "medio",
                    options: [
                        { text: "Nas últimas linhas da mensagem", isCorrect: true },
                        { text: "Na primeira linha, que resume tudo", isCorrect: false },
                        { text: "No meio, onde os tipos são listados", isCorrect: false },
                        { text: "Distribuída por igual em toda a mensagem", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 'Object is possibly undefined' costuma indicar?",
                    difficulty: "medio",
                    options: [
                        { text: "Falta checar o valor antes de usar", isCorrect: true },
                        { text: "O objeto não foi importado corretamente", isCorrect: false },
                        { text: "O tipo declarado está incompleto", isCorrect: false },
                        { text: "A variável foi declarada duas vezes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 'Property does not exist on type' costuma ser?",
                    difficulty: "medio",
                    options: [
                        { text: "Erro de digitação ou tipo errado", isCorrect: true },
                        { text: "Uma propriedade privada acessada de fora", isCorrect: false },
                        { text: "Um campo opcional que não foi informado", isCorrect: false },
                        { text: "Um módulo que não foi importado ainda", isCorrect: false },
                    ],
                },
                {
                    statement: "Como descobrir o tipo real de uma variável?",
                    difficulty: "medio",
                    options: [
                        { text: "Passando o mouse sobre ela no editor", isCorrect: true },
                        { text: "Imprimindo o valor com um console.log", isCorrect: false },
                        { text: "Lendo o JavaScript que foi gerado", isCorrect: false },
                        { text: "Consultando o arquivo de configuração", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual estratégia ajuda quando o erro não faz sentido?",
                    difficulty: "dificil",
                    options: [
                        { text: "Reduzir o caso a poucas linhas", isCorrect: true },
                        { text: "Anotar o tipo explicitamente em tudo", isCorrect: false },
                        { text: "Desligar o modo estrito temporariamente", isCorrect: false },
                        { text: "Atualizar a versão do TypeScript", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Configuração e ferramentas",
    aulas: [
        {
            titulo: "As flags do modo estrito",
            blocks: [
                {
                    type: "text",
                    value: "# O que strict liga\n\n`strict: true`, que é o padrão desde o TypeScript 7, é um atalho para um conjunto de flags. Vale saber o que cada uma faz, porque elas explicam a maior parte dos erros que aparecem ao ligar o modo estrito em um projeto antigo.",
                },
                {
                    type: "table",
                    value: '[["Flag", "O que passa a exigir"], ["strictNullChecks", "tratar null e undefined"], ["noImplicitAny", "anotar o que não é inferido"], ["strictFunctionTypes", "compatibilidade de parâmetros"], ["strictPropertyInitialization", "inicializar campo de classe"], ["useUnknownInCatchVariables", "erro do catch como unknown"]]',
                },
                {
                    type: "text",
                    value: "## strictNullChecks é a que muda tudo\n\nSem ela, `null` e `undefined` cabem em qualquer tipo, e o compilador não avisa nada. Com ela ligada, você é obrigado a tratar o caso vazio, e é daí que vem a maior parte do valor do TypeScript.",
                },
                {
                    type: "code",
                    value: '// Sem strictNullChecks: compila e quebra rodando\nfunction nome(u: Usuario | null): string {\n  return u.nome;\n}\n\n// Com strictNullChecks: o compilador cobra\nfunction nome(u: Usuario | null): string {\n  if (!u) return "anônimo";\n  return u.nome;\n}',
                },
                {
                    type: "text",
                    value: "## Duas flags fora do strict que valem a pena\n\n`noUncheckedIndexedAccess` faz o acesso por índice devolver `T | undefined`, o que é a verdade: `lista[10]` pode não existir. É rigorosa e pega uma classe inteira de bug.\n\n`exactOptionalPropertyTypes` distingue campo ausente de campo com valor `undefined`.",
                },
                {
                    type: "code",
                    value: "const lista = [1, 2, 3];\n\n// Sem a flag: o tipo é number, e é mentira\nconst x = lista[10];\nx.toFixed();   // compila, e quebra rodando\n\n// Com noUncheckedIndexedAccess: number | undefined\nconst y = lista[10];\ny?.toFixed();  // o compilador cobra o cuidado",
                },
            ],
            questions: [
                {
                    statement: "O que `strict: true` representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Um atalho para um conjunto de flags", isCorrect: true },
                        { text: "Uma checagem extra feita depois das outras", isCorrect: false },
                        { text: "Um modo que impede o uso do tipo any", isCorrect: false },
                        { text: "Uma verificação em tempo de execução", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `strictNullChecks` passa a exigir?",
                    difficulty: "medio",
                    options: [
                        { text: "Tratar os casos de null e undefined", isCorrect: true },
                        { text: "Anotar o tipo de todas as variáveis", isCorrect: false },
                        { text: "Inicializar todos os campos de classe", isCorrect: false },
                        { text: "Declarar o retorno de todas as funções", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `noUncheckedIndexedAccess` muda?",
                    difficulty: "dificil",
                    options: [
                        { text: "O acesso por índice passa a incluir undefined", isCorrect: true },
                        { text: "O índice precisa ser sempre um número", isCorrect: false },
                        { text: "Arrays passam a ser somente leitura", isCorrect: false },
                        {
                            text: "O acesso fora do tamanho passa a lançar exceção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que `lista[10]` ter tipo `number` é uma mentira?",
                    difficulty: "dificil",
                    options: [
                        { text: "A posição pode não existir no array", isCorrect: true },
                        { text: "O array pode ter tipos misturados dentro", isCorrect: false },
                        { text: "O índice pode ser uma string em execução", isCorrect: false },
                        {
                            text: "O valor pode ter sido alterado por outra função",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `useUnknownInCatchVariables` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "O erro capturado chega como unknown", isCorrect: true },
                        { text: "Impede que exceções sejam capturadas", isCorrect: false },
                        { text: "Converte o erro para o tipo Error", isCorrect: false },
                        { text: "Exige um bloco finally em todo try", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "TypeScript com Node e no navegador",
            blocks: [
                {
                    type: "text",
                    value: "# Dois ambientes, duas configurações\n\nO TypeScript precisa saber o que existe no ambiente. `lib` define quais APIs da linguagem ele conhece, e os tipos do ambiente vêm de pacotes.",
                },
                {
                    type: "code",
                    value: '// Para Node\n{\n  "compilerOptions": {\n    "lib": ["es2023"],\n    "module": "nodenext",\n    "moduleResolution": "nodenext",\n    "types": ["node"]\n  }\n}\n\n// Para o navegador\n{\n  "compilerOptions": {\n    "lib": ["es2023", "dom", "dom.iterable"],\n    "module": "esnext",\n    "moduleResolution": "bundler"\n  }\n}',
                },
                {
                    type: "text",
                    value: 'Sem `dom` no `lib`, o compilador não conhece `document` nem `fetch` no navegador. Sem `types: ["node"]`, ele não conhece `process` nem `Buffer`. Esse é o erro mais comum de configuração inicial.\n\n## Rodando sem build\n\nO Node moderno executa arquivos `.ts` apagando os tipos, sem checar nada. Isso é ótimo para desenvolver, e não substitui a checagem: `tsc --noEmit` continua sendo o que roda na CI.',
                },
                {
                    type: "code",
                    value: "node app.ts        # roda, sem checar tipos\nnpx tsc --noEmit   # checa, sem rodar",
                },
                {
                    type: "text",
                    value: "## No navegador\n\nO navegador não entende TypeScript. Um empacotador como Vite ou esbuild apaga os tipos e monta o resultado. Eles também **não checam** os tipos, pela mesma razão de desempenho, então a checagem fica em um passo próprio.",
                },
                {
                    type: "quote",
                    value: "Quase toda ferramenta moderna apaga os tipos sem verificá-los. Se a CI não roda tsc --noEmit, ninguém está checando nada.",
                },
            ],
            questions: [
                {
                    statement: "O que a opção `lib` define?",
                    difficulty: "medio",
                    options: [
                        { text: "Quais APIs o compilador conhece", isCorrect: true },
                        { text: "Quais bibliotecas serão instaladas", isCorrect: false },
                        { text: "Onde os arquivos gerados serão salvos", isCorrect: false },
                        { text: "Quais pastas entram na compilação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que falta quando `document` não é reconhecido?",
                    difficulty: "medio",
                    options: [
                        { text: "A entrada dom no lib", isCorrect: true },
                        { text: "O pacote @types/browser instalado", isCorrect: false },
                        { text: "A opção target apontando para o navegador", isCorrect: false },
                        { text: "O módulo configurado como esnext", isCorrect: false },
                    ],
                },
                {
                    statement: "O Node checa os tipos ao rodar um arquivo `.ts`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, ele apenas apaga os tipos", isCorrect: true },
                        { text: "Sim, e falha quando algum tipo não bate", isCorrect: false },
                        { text: "Sim, mas apenas os tipos exportados", isCorrect: false },
                        { text: "Depende da versão do Node instalada", isCorrect: false },
                    ],
                },
                {
                    statement: "Os empacotadores como Vite checam os tipos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, eles apenas os apagam", isCorrect: true },
                        { text: "Sim, é parte do processo de build", isCorrect: false },
                        { text: "Sim, quando o modo estrito está ligado", isCorrect: false },
                        { text: "Apenas nos arquivos que foram alterados", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde a checagem de tipos deve acontecer no projeto?",
                    difficulty: "medio",
                    options: [
                        { text: "Em um passo próprio, com tsc --noEmit", isCorrect: true },
                        { text: "No momento em que o código é executado", isCorrect: false },
                        { text: "Durante o empacotamento para produção", isCorrect: false },
                        { text: "No editor apenas, enquanto se escreve", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Lint, formatação e CI",
            blocks: [
                {
                    type: "text",
                    value: "# O que o compilador não faz\n\nO TypeScript verifica tipos, não estilo nem prática ruim. Essa parte fica com o linter, e as duas ferramentas se complementam em vez de competir.",
                },
                {
                    type: "table",
                    value: '[["Ferramenta", "Responde"], ["tsc", "os tipos batem?"], ["ESLint", "o código segue as regras?"], ["Prettier", "a formatação está uniforme?"], ["Vitest ou Jest", "o comportamento está certo?"]]',
                },
                {
                    type: "code",
                    value: 'npm install --save-dev eslint typescript-eslint\n\n// eslint.config.js\nimport tseslint from "typescript-eslint";\n\nexport default tseslint.config(\n  ...tseslint.configs.recommendedTypeChecked,\n  {\n    languageOptions: {\n      parserOptions: { projectService: true },\n    },\n  },\n);',
                },
                {
                    type: "text",
                    value: "## Regras que usam tipo\n\nO conjunto `recommendedTypeChecked` liga regras que consultam o **verificador de tipos**, e não só a sintaxe. São elas que pegam coisas como promessa não aguardada ou comparação que nunca é verdadeira, e nenhum linter puramente sintático conseguiria.",
                },
                {
                    type: "text",
                    value: "## Na CI\n\nTrês passos cobrem o essencial, e devem falhar a CI quando algum não passa.",
                },
                {
                    type: "code",
                    value: '{\n  "scripts": {\n    "typecheck": "tsc --noEmit",\n    "lint": "eslint .",\n    "test": "vitest run"\n  }\n}',
                },
            ],
            questions: [
                {
                    statement: "O que o TypeScript não verifica?",
                    difficulty: "medio",
                    options: [
                        { text: "Estilo e práticas ruins de código", isCorrect: true },
                        { text: "A compatibilidade entre tipos declarados", isCorrect: false },
                        { text: "A existência dos campos acessados", isCorrect: false },
                        { text: "O retorno das funções anotadas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que as regras com checagem de tipo conseguem pegar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Promessa não aguardada e comparação impossível", isCorrect: true },
                        {
                            text: "Linhas de código com mais de oitenta caracteres",
                            isCorrect: false,
                        },
                        { text: "Variáveis declaradas e não utilizadas", isCorrect: false },
                        { text: "Aspas simples em vez de aspas duplas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando faz a checagem de tipos na CI?",
                    difficulty: "facil",
                    options: [
                        { text: "tsc --noEmit", isCorrect: true },
                        { text: "eslint . com a configuração recomendada", isCorrect: false },
                        { text: "prettier --check em todos os arquivos", isCorrect: false },
                        { text: "npm run build, que compila o projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a responsabilidade do Prettier?",
                    difficulty: "facil",
                    options: [
                        { text: "A formatação uniforme do código", isCorrect: true },
                        { text: "As regras de qualidade do código", isCorrect: false },
                        { text: "A verificação dos tipos declarados", isCorrect: false },
                        { text: "A execução dos testes automatizados", isCorrect: false },
                    ],
                },
                {
                    statement: "Linter e compilador competem entre si?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, cada um responde uma pergunta", isCorrect: true },
                        { text: "Sim, o linter substitui a checagem de tipos", isCorrect: false },
                        { text: "Sim, é preciso escolher um dos dois", isCorrect: false },
                        { text: "Sim, quando as regras usam o verificador", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Migrando um projeto JavaScript",
            blocks: [
                {
                    type: "text",
                    value: "# Migração acontece aos poucos\n\nTentar converter tudo de uma vez costuma acabar em um ramo abandonado depois de duas semanas. A migração que dá certo é incremental, e o TypeScript foi desenhado para isso.",
                },
                {
                    type: "text",
                    value: "## O caminho que funciona\n\n1. Instalar o TypeScript e criar o `tsconfig.json` com `allowJs: true`\n2. Ligar `checkJs` e ver o que aparece, sem renomear nada ainda\n3. Renomear arquivo por arquivo, começando pelas **folhas**, que são as que ninguém importa\n4. Ligar as flags estritas uma a uma\n5. Só então proibir `any` no linter",
                },
                {
                    type: "code",
                    value: '{\n  "compilerOptions": {\n    "allowJs": true,\n    "checkJs": false,\n    "strict": false,\n    "noEmit": true\n  }\n}',
                },
                {
                    type: "text",
                    value: "## Por que começar pelas folhas\n\nUm arquivo que importa outro herda os tipos dele. Convertendo primeiro o que está no fim da cadeia, cada arquivo seguinte já encontra tipos prontos. No sentido contrário, você tipa contra `any` e refaz depois.\n\n## O escape controlado\n\nDurante a migração, silenciar um erro pontual é legítimo. O importante é que ele seja **visível** e **temporário**.",
                },
                {
                    type: "code",
                    value: "// @ts-expect-error: o tipo desta lib será corrigido na issue 412\nconst x = libAntiga.metodo();\n\n// Prefira @ts-expect-error a @ts-ignore:\n// se o erro sumir, o expect-error passa a falhar e você remove a linha",
                },
                {
                    type: "quote",
                    value: "Migração com prazo e sem plano vira strict desligado para sempre. Ligar uma flag por semana entrega mais do que uma reescrita que nunca termina.",
                },
            ],
            questions: [
                {
                    statement: "Por qual tipo de arquivo começar a migração?",
                    difficulty: "dificil",
                    options: [
                        { text: "Pelas folhas, que ninguém importa", isCorrect: true },
                        { text: "Pelos arquivos de entrada da aplicação", isCorrect: false },
                        { text: "Pelos arquivos com mais linhas de código", isCorrect: false },
                        { text: "Pelos arquivos de teste do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `allowJs: true`?",
                    difficulty: "medio",
                    options: [
                        { text: "Permitir os dois tipos de arquivo juntos", isCorrect: true },
                        { text: "Converter os arquivos JavaScript sozinho", isCorrect: false },
                        { text: "Desligar a checagem de tipos do projeto", isCorrect: false },
                        { text: "Gerar arquivos JavaScript na compilação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de `@ts-expect-error` sobre `@ts-ignore`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele falha quando o erro deixa de existir", isCorrect: true },
                        { text: "Ele silencia mais tipos de erro que o outro", isCorrect: false },
                        { text: "Ele registra o erro no log da compilação", isCorrect: false },
                        { text: "Ele funciona em blocos de várias linhas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `checkJs` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Checa também os arquivos JavaScript", isCorrect: true },
                        { text: "Converte os arquivos JavaScript em TypeScript", isCorrect: false },
                        { text: "Permite importar JavaScript sem tipos", isCorrect: false },
                        { text: "Verifica apenas a sintaxe dos arquivos", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que converter tudo de uma vez costuma falhar?",
                    difficulty: "medio",
                    options: [
                        { text: "O ramo fica grande demais e é abandonado", isCorrect: true },
                        { text: "O compilador não aceita muitos arquivos", isCorrect: false },
                        { text: "Os tipos gerados ficam inconsistentes", isCorrect: false },
                        { text: "A equipe precisa parar de escrever código", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Organizando tipos em projeto grande",
            blocks: [
                {
                    type: "text",
                    value: "# Onde os tipos moram\n\nEm projeto pequeno, tipo junto do código que o usa resolve. Conforme o projeto cresce, três perguntas aparecem: onde declarar, quando compartilhar e quando duplicar.",
                },
                {
                    type: "text",
                    value: "## Perto de quem usa\n\nA regra que envelhece melhor: o tipo mora junto do módulo que o **produz**, e é exportado de lá. Uma pasta `types/` central vira depósito e cria dependência de todo mundo para todo mundo.\n\nA exceção legítima são os tipos de domínio compartilhados de verdade, e os tipos gerados a partir do banco ou de um esquema de API.",
                },
                {
                    type: "code",
                    value: "src/\n  usuarios/\n    usuario.ts          # o tipo Usuario mora aqui, exportado\n    usuario.service.ts\n    usuario.controller.ts\n  pedidos/\n    pedido.ts\n    pedido.service.ts\n  compartilhado/\n    resultado.ts        # tipos usados por todo o sistema",
                },
                {
                    type: "text",
                    value: "## Duplicar às vezes é o certo\n\nDois tipos com os mesmos campos hoje não são o mesmo tipo. O `Usuario` que a API devolve e o `Usuario` do formulário se parecem agora e vão divergir: um ganha `token`, o outro ganha `confirmarSenha`.\n\nUnir os dois cedo demais produz um tipo cheio de campos opcionais que não descreve bem nenhum dos dois.",
                },
                {
                    type: "code",
                    value: "// Melhor separados, ainda que pareçam iguais\ntype UsuarioAPI = { id: number; nome: string; email: string };\ntype FormularioUsuario = { nome: string; email: string; senha: string };\n\n// Do que um tipo que serve mal aos dois\ntype Usuario = {\n  id?: number;\n  nome: string;\n  email: string;\n  senha?: string;\n};",
                },
            ],
            questions: [
                {
                    statement: "Onde um tipo deve morar, como regra?",
                    difficulty: "medio",
                    options: [
                        { text: "Junto do módulo que o produz", isCorrect: true },
                        { text: "Em uma pasta types central do projeto", isCorrect: false },
                        { text: "No arquivo que mais o utiliza", isCorrect: false },
                        { text: "Em um pacote separado do repositório", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o problema de uma pasta `types/` central?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ela cria dependência de todos para todos", isCorrect: true },
                        {
                            text: "Ela acaba deixando a compilação bem mais lenta",
                            isCorrect: false,
                        },
                        { text: "Ela impede o uso de tipos genéricos", isCorrect: false },
                        { text: "Ela obriga a exportar todos os tipos", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando duplicar um tipo é o certo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando os dois vão divergir com o tempo", isCorrect: true },
                        { text: "Quando eles estão em módulos diferentes", isCorrect: false },
                        { text: "Quando um deles tem campos opcionais", isCorrect: false },
                        { text: "Quando o tipo é usado em mais de um lugar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao unir dois tipos cedo demais?",
                    difficulty: "medio",
                    options: [
                        { text: "Surge um tipo cheio de campos opcionais", isCorrect: true },
                        { text: "Os dois módulos passam a se importar", isCorrect: false },
                        { text: "O compilador aponta um conflito de nomes", isCorrect: false },
                        { text: "A checagem fica mais lenta no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual exceção justifica um lugar compartilhado para tipos?",
                    difficulty: "medio",
                    options: [
                        { text: "Tipos de domínio usados por todo o sistema", isCorrect: true },
                        { text: "Tipos que aparecem em mais de dois arquivos", isCorrect: false },
                        { text: "Tipos com mais de cinco campos declarados", isCorrect: false },
                        { text: "Tipos que usam parâmetros genéricos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - O TypeScript 7",
    aulas: [
        {
            titulo: "O compilador reescrito em Go",
            blocks: [
                {
                    type: "text",
                    value: "# Por que reescrever\n\nO compilador do TypeScript sempre foi escrito em TypeScript, rodando sobre Node. Isso tinha uma elegância: a ferramenta era escrita na linguagem que ela compila.\n\nO custo apareceu com a escala. Em bases grandes, uma verificação completa passava de dois minutos, e o editor demorava para responder. O **TypeScript 7**, lançado em 8 de julho de 2026, trocou essa base por uma **implementação nativa em Go**.",
                },
                {
                    type: "table",
                    value: '[["Projeto", "Antes", "Com o TS 7", "Ganho"], ["VS Code", "125,7s", "10,6s", "11,9x"], ["Sentry", "139,8s", "15,7s", "8,9x"], ["Bluesky", "24,3s", "2,8s", "8,7x"]]',
                },
                {
                    type: "text",
                    value: "O ganho fica entre **8x e 12x** em verificação completa, e o consumo de memória caiu entre 6% e 26%.\n\n## Por que Go\n\nA escolha foi discutida na comunidade, já que Rust era a aposta de muita gente. A equipe explicou que Go permitia uma **tradução mais direta** do compilador existente, preservando a estrutura e o comportamento, além de trazer paralelismo com pouco atrito. Reescrever do zero em outra arquitetura teria levado anos e mudado o comportamento de formas difíceis de rastrear.",
                },
                {
                    type: "text",
                    value: "## O que muda para quem usa\n\nQuase nada na linguagem. Os tipos, a sintaxe e as regras de checagem continuam iguais. O que muda é o tempo: o editor responde na hora, e a checagem na CI deixa de ser o passo mais lento.",
                },
            ],
            questions: [
                {
                    statement: "Em que linguagem o compilador do TypeScript 7 foi escrito?",
                    difficulty: "facil",
                    options: [
                        { text: "Go", isCorrect: true },
                        { text: "Rust, a aposta de boa parte da comunidade", isCorrect: false },
                        { text: "C++, pela proximidade com o sistema", isCorrect: false },
                        { text: "TypeScript, como nas versões anteriores", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o ganho de velocidade na verificação completa?",
                    difficulty: "medio",
                    options: [
                        { text: "Entre oito e doze vezes", isCorrect: true },
                        { text: "Cerca de duas vezes, em média", isCorrect: false },
                        { text: "Entre trinta e cinquenta vezes", isCorrect: false },
                        { text: "Depende do tamanho do projeto, sem média", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a equipe escolheu Go em vez de Rust?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Permitia traduzir o compilador de forma mais direta",
                            isCorrect: true,
                        },
                        { text: "Go é mais rápido que Rust em qualquer caso", isCorrect: false },
                        { text: "Rust não tem suporte a paralelismo", isCorrect: false },
                        {
                            text: "Go já era usado em várias outras ferramentas da equipe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que muda na linguagem com o compilador novo?",
                    difficulty: "medio",
                    options: [
                        { text: "Quase nada, as regras seguem as mesmas", isCorrect: true },
                        { text: "A sintaxe foi simplificada em vários pontos", isCorrect: false },
                        { text: "Os tipos passaram a existir em execução", isCorrect: false },
                        { text: "As interfaces foram substituídas por type", isCorrect: false },
                    ],
                },
                {
                    statement: "O que motivou a reescrita?",
                    difficulty: "medio",
                    options: [
                        { text: "O tempo de verificação em bases grandes", isCorrect: true },
                        { text: "A dificuldade de escrever novos recursos", isCorrect: false },
                        { text: "A dependência do Node para rodar", isCorrect: false },
                        { text: "A falta de gente que soubesse TypeScript", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Os padrões novos e o que quebrou",
            blocks: [
                {
                    type: "text",
                    value: "# Uma limpeza que estava atrasada\n\nAlém do compilador, o TypeScript 7 aproveitou a virada de versão maior para inverter padrões antigos e remover suporte a alvos que quase ninguém usa mais.\n\nO efeito prático é que um `tsconfig.json` copiado de tutorial antigo pode simplesmente não funcionar.",
                },
                {
                    type: "table",
                    value: '[["Mudança", "Antes", "Agora"], ["strict", "false", "true"], ["module", "commonjs", "esnext"], ["types", "todos os @types", "vazio"], ["rootDir", "inferido", "./"], ["target es5", "suportado", "removido"], ["moduleResolution node", "suportado", "removido"]]',
                },
                {
                    type: "text",
                    value: "## O que foi removido\n\n- **`target: es5`**: gerar código para navegadores sem suporte a ES2015 deixou de fazer sentido\n- **`moduleResolution: node` e `node10`**: a resolução antiga do Node saiu; ficam `node16`, `nodenext` e `bundler`\n- **Formatos de módulo `amd`, `umd`, `systemjs` e `none`**: anteriores aos módulos ES\n- **`baseUrl`**: descontinuado em favor de `paths` com caminhos relativos",
                },
                {
                    type: "text",
                    value: "## Ao atualizar\n\nO caminho é ligar o novo e rodar a checagem. `strict: true` costuma revelar erros reais que estavam escondidos, e por isso vale tratar a atualização como duas etapas: primeiro fazer compilar com as opções antigas explícitas, depois ligar as novas uma a uma.",
                },
                {
                    type: "code",
                    value: '// Etapa 1: preservar o comportamento antigo, explicitamente\n{\n  "compilerOptions": {\n    "strict": false,\n    "module": "commonjs",\n    "target": "es2020"\n  }\n}\n\n// Etapa 2: ligar uma flag por vez e corrigir o que aparecer',
                },
            ],
            questions: [
                {
                    statement: "Por que um tsconfig antigo pode não funcionar no TypeScript 7?",
                    difficulty: "medio",
                    options: [
                        { text: "Opções foram removidas e padrões invertidos", isCorrect: true },
                        { text: "O formato do arquivo mudou para YAML", isCorrect: false },
                        { text: "O arquivo passou a se chamar de outro jeito", isCorrect: false },
                        { text: "As opções agora ficam no package.json", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais resoluções de módulo restaram?",
                    difficulty: "dificil",
                    options: [
                        { text: "node16, nodenext e bundler", isCorrect: true },
                        { text: "node, node10 e o antigo classic", isCorrect: false },
                        { text: "commonjs, amd e esnext", isCorrect: false },
                        { text: "classic, node e bundler", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `target: es5` foi removido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gerar para navegadores sem ES2015 não faz mais sentido",
                            isCorrect: true,
                        },
                        { text: "O compilador em Go não consegue gerá-lo", isCorrect: false },
                        {
                            text: "Ele acabava deixando o código gerado muito maior do que precisa",
                            isCorrect: false,
                        },
                        { text: "Ele conflitava com o módulo esnext", isCorrect: false },
                    ],
                },
                {
                    statement: "O que substituiu o `baseUrl`?",
                    difficulty: "medio",
                    options: [
                        { text: "A opção paths com caminhos relativos", isCorrect: true },
                        { text: "A opção rootDir, que virou obrigatória", isCorrect: false },
                        { text: "A resolução bundler, que dispensa caminhos", isCorrect: false },
                        { text: "Os imports com caminho absoluto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a estratégia recomendada ao atualizar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Fixar o comportamento antigo e ligar uma flag por vez",
                            isCorrect: true,
                        },
                        { text: "Ligar todas as opções novas de uma só vez", isCorrect: false },
                        { text: "Reescrever o tsconfig do zero com o init", isCorrect: false },
                        {
                            text: "Manter as duas versões instaladas para sempre no projeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Convivendo com o TypeScript 6",
            blocks: [
                {
                    type: "text",
                    value: "# Nem todo projeto atualiza junto\n\nEm um repositório com vários pacotes, ou com uma biblioteca que ainda não suporta a versão nova, é preciso conviver com as duas por um tempo.\n\nA equipe do TypeScript previu isso e publicou o pacote **`@typescript/typescript6`**, que instala a versão 6 com o executável **`tsc6`**. Os dois convivem no mesmo projeto sem conflito de nome.",
                },
                {
                    type: "code",
                    value: 'npm install --save-dev typescript @typescript/typescript6\n\n{\n  "scripts": {\n    "typecheck": "tsc --noEmit",\n    "typecheck:legado": "tsc6 --noEmit -p tsconfig.legado.json"\n  }\n}',
                },
                {
                    type: "text",
                    value: "## A linha do tempo\n\nO **TypeScript 6.0** foi a última versão sobre o compilador antigo, publicada no começo de 2026, e serve de ponte: ela traz avisos sobre o que vai ser removido no 7, permitindo preparar o projeto antes de dar o salto.\n\nA sequência que menos dói é passar pelo 6 antes de ir para o 7, e não pular direto de uma versão 5.",
                },
                {
                    type: "table",
                    value: '[["Versão", "Compilador", "Papel"], ["5.x", "TypeScript", "a linha anterior"], ["6.0", "TypeScript", "última da base antiga, ponte"], ["7.0", "Go", "a linha atual"]]',
                },
                {
                    type: "quote",
                    value: "Atualizar por etapas custa mais tempo de calendário e menos tempo de depuração. Em projeto grande a segunda moeda é a cara.",
                },
            ],
            questions: [
                {
                    statement: "Qual pacote permite usar a versão 6 lado a lado?",
                    difficulty: "medio",
                    options: [
                        { text: "@typescript/typescript6", isCorrect: true },
                        { text: "typescript-legacy, publicado à parte", isCorrect: false },
                        { text: "typescript@6, na mesma linha de instalação", isCorrect: false },
                        { text: "@types/typescript6, com os tipos antigos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o nome do executável da versão 6 nesse pacote?",
                    difficulty: "medio",
                    options: [
                        { text: "tsc6", isCorrect: true },
                        { text: "tsc-legacy, indicando a versão antiga", isCorrect: false },
                        { text: "tsc --v6, com a flag de versão", isCorrect: false },
                        { text: "typescript6, o nome do pacote", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o papel do TypeScript 6.0?",
                    difficulty: "medio",
                    options: [
                        { text: "Ser a última da base antiga e servir de ponte", isCorrect: true },
                        {
                            text: "Ser a primeira versão a usar o compilador em Go",
                            isCorrect: false,
                        },
                        { text: "Ser uma versão apenas de correção de falhas", isCorrect: false },
                        { text: "Ser a versão de suporte estendido do 5.x", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual sequência de atualização dói menos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Passar pelo 6 antes de ir para o 7", isCorrect: true },
                        { text: "Pular direto do 5 para o 7 de uma vez", isCorrect: false },
                        { text: "Manter o 5 e esperar o 8 ser lançado", isCorrect: false },
                        { text: "Instalar as três versões ao mesmo tempo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a versão 6 traz que ajuda a preparar o salto?",
                    difficulty: "medio",
                    options: [
                        { text: "Avisos sobre o que será removido no 7", isCorrect: true },
                        { text: "O compilador em Go em modo experimental", isCorrect: false },
                        { text: "Um conversor automático do tsconfig", isCorrect: false },
                        { text: "A checagem em paralelo dos arquivos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Quando a checagem fica lenta",
            blocks: [
                {
                    type: "text",
                    value: "# Mesmo rápido, dá para atrapalhar\n\nO compilador em Go resolveu a maior parte do problema de desempenho, mas escolhas de tipagem ainda pesam. Em projeto grande vale saber medir antes de adivinhar.",
                },
                {
                    type: "code",
                    value: "npx tsc --noEmit --diagnostics\n# Files, Lines, Nodes, Identifiers, Check time, Total time\n\nnpx tsc --noEmit --generateTrace trace/\n# gera um rastro para abrir no perfilador do navegador",
                },
                {
                    type: "text",
                    value: "## Os três culpados mais comuns\n\n**Tipos recursivos profundos**, que o compilador precisa expandir passo a passo. Uma união gerada por recursão sobre uma string longa é o caso clássico.\n\n**Uniões enormes**, com centenas de membros. Cada comparação percorre a união inteira.\n\n**Inferência em cadeia longa**, quando o tipo de um valor depende de outro, que depende de outro. Anotar explicitamente um ponto do meio corta o trabalho pela metade.",
                },
                {
                    type: "code",
                    value: '// Custa caro: o compilador expande caractere a caractere\ntype Split<S extends string> = S extends `${infer A},${infer B}`\n  ? [A, ...Split<B>]\n  : [S];\n\n// Barato e quase sempre suficiente\ntype Campos = "nome" | "email" | "idade";',
                },
                {
                    type: "text",
                    value: "## Ajudando o compilador\n\nAnotar o retorno de funções exportadas evita que o compilador precise inferir a mesma cadeia toda vez. Em bibliotecas isso também deixa a interface pública estável: uma mudança interna não altera o tipo que os outros enxergam.",
                },
            ],
            questions: [
                {
                    statement: "Qual flag mostra o tempo gasto na checagem?",
                    difficulty: "medio",
                    options: [
                        { text: "--diagnostics", isCorrect: true },
                        { text: "--verbose, com a saída detalhada", isCorrect: false },
                        { text: "--profile, com o perfil de execução", isCorrect: false },
                        { text: "--stats, com as estatísticas do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo costuma pesar mais na checagem?",
                    difficulty: "medio",
                    options: [
                        { text: "Tipos recursivos profundos", isCorrect: true },
                        { text: "Interfaces com muitos campos declarados", isCorrect: false },
                        { text: "Tipos importados de outros arquivos", isCorrect: false },
                        { text: "Uniões de dois ou três literais", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que uma união enorme custa caro?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cada comparação percorre todos os membros", isCorrect: true },
                        { text: "Ela ocupa muita memória no arquivo gerado", isCorrect: false },
                        { text: "Ela impede a inferência nos outros tipos", isCorrect: false },
                        { text: "Ela precisa ser reordenada a cada uso", isCorrect: false },
                    ],
                },
                {
                    statement: "O que anotar o retorno de funções exportadas ajuda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Evita reinferir a cadeia e estabiliza a interface",
                            isCorrect: true,
                        },
                        { text: "Reduz o tamanho do JavaScript gerado", isCorrect: false },
                        {
                            text: "Permite que a função seja usada sem nenhum import",
                            isCorrect: false,
                        },
                        { text: "Faz o compilador pular a checagem do corpo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `--generateTrace` produz?",
                    difficulty: "medio",
                    options: [
                        { text: "Um rastro para abrir em um perfilador", isCorrect: true },
                        { text: "Um log de todos os erros encontrados", isCorrect: false },
                        { text: "Um relatório dos tipos usados no projeto", isCorrect: false },
                        { text: "Uma lista dos arquivos mais lentos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Projeto final e para onde ir",
            blocks: [
                {
                    type: "text",
                    value: "# Juntando tudo\n\nPara fechar a trilha, escreva um **cliente de API tipado de ponta a ponta**. Ele exercita cada módulo:\n\n1. `tsconfig.json` estrito, com `noUncheckedIndexedAccess` ligado\n2. Tipos de domínio derivados uns dos outros com `Pick`, `Omit` e `Partial`\n3. Uma união discriminada para o resultado: carregando, sucesso ou erro\n4. Uma função genérica de requisição que preserva o tipo da resposta\n5. Validação na fronteira, com um esquema que gera o tipo\n6. Template literal types para as rotas, garantindo a convenção\n7. `tsc --noEmit`, ESLint com regras que usam tipo, e testes",
                },
                {
                    type: "code",
                    value: 'type Resultado<T> =\n  | { estado: "carregando" }\n  | { estado: "ok"; dados: T }\n  | { estado: "erro"; mensagem: string };\n\nasync function requisitar<T>(\n  rota: `/api/${string}`,\n  validar: (v: unknown) => T,\n): Promise<Resultado<T>> {\n  try {\n    const r = await fetch(rota);\n    if (!r.ok) return { estado: "erro", mensagem: `HTTP ${r.status}` };\n    return { estado: "ok", dados: validar(await r.json()) };\n  } catch (e) {\n    return { estado: "erro", mensagem: e instanceof Error ? e.message : "falhou" };\n  }\n}',
                },
                {
                    type: "text",
                    value: "Repare que o `catch` trata `e` como `unknown`, que é o padrão do modo estrito, e verifica antes de acessar `message`. Esse é o tipo de cuidado que a trilha inteira construiu.\n\n## Para onde ir depois\n\nO caminho mais comum é aplicar TypeScript em um framework: **React** com tipos é onde a maior parte do TypeScript profissional acontece, e a trilha de React desta plataforma continua daqui.\n\nNo back-end, vale olhar TypeScript com Node e um framework de API. E se o assunto for tipos avançados, o exercício que mais ensina é ler os tipos de uma biblioteca que você já usa.",
                },
            ],
            questions: [
                {
                    statement: "Por que o `catch` trata o erro como `unknown`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É o padrão do modo estrito, e qualquer coisa pode ser lançada",
                            isCorrect: true,
                        },
                        { text: "Porque o erro sempre é um objeto Error", isCorrect: false },
                        {
                            text: "Porque o tipo do erro capturado não pode ser anotado de forma alguma",
                            isCorrect: false,
                        },
                        { text: "Porque o try não permite tipar o bloco", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a união discriminada do resultado garante?",
                    difficulty: "medio",
                    options: [
                        { text: "Que todos os estados sejam tratados", isCorrect: true },
                        { text: "Que a requisição nunca falhe no meio", isCorrect: false },
                        { text: "Que os dados venham sempre preenchidos", isCorrect: false },
                        { text: "Que o estado seja verificado em execução", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o parâmetro genérico `T` preserva na função de requisição?",
                    difficulty: "medio",
                    options: [
                        { text: "O tipo da resposta até quem chamou", isCorrect: true },
                        {
                            text: "O tipo da rota informada no primeiro argumento",
                            isCorrect: false,
                        },
                        { text: "O formato do erro devolvido pela API", isCorrect: false },
                        { text: "A validação aplicada aos dados recebidos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a rota tipada como `/api/${string}` garante?",
                    difficulty: "dificil",
                    options: [
                        { text: "Que o caminho comece pelo prefixo esperado", isCorrect: true },
                        { text: "Que a rota exista no servidor da API", isCorrect: false },
                        {
                            text: "Que o caminho seja escapado antes de ser usado",
                            isCorrect: false,
                        },
                        { text: "Que a resposta venha no formato JSON", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual exercício mais ensina sobre tipos avançados?",
                    difficulty: "medio",
                    options: [
                        { text: "Ler os tipos de uma biblioteca que você usa", isCorrect: true },
                        { text: "Escrever tipos recursivos do zero", isCorrect: false },
                        { text: "Converter um projeto bem grande de uma vez só", isCorrect: false },
                        { text: "Decorar a lista de utility types", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + NOME);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log("Trilha já tem aulas, nada a fazer: " + NOME);
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

// Só semeia quando executado direto. Importado, expõe MODULOS/NOME sem rodar nada.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
