// Seed da trilha Rust (do ownership ao async). Conteúdo autoral.
// Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-rust.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Rust";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A linguagem Rust do zero: variáveis e tipos, funções e controle de fluxo, o modelo de ownership e borrowing que elimina erros de memória em tempo de compilação, structs, enums e pattern matching, traits, tratamento de erros com Option e Result, coleções, genéricos e lifetimes, closures e iterators, concorrência segura com threads e channels, async/await e a construção de projetos reais com Cargo. A linguagem adotada no kernel do Linux e eleita a mais admirada pelos desenvolvedores ano após ano.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    explanation: string;
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Primeiros passos com Rust",
    aulas: [
        {
            titulo: "O que é Rust e por que ele existe",
            blocks: [
                {
                    type: "text",
                    value: "# O que é Rust\n\nRust é uma linguagem de programação de sistemas criada na Mozilla por Graydon Hoare, com a versão 1.0 lançada em 2015. Seu objetivo é ocupar o espaço do C e do C++, linguagens rápidas que trabalham direto com a memória, mas sem os erros que custam caro: estouro de buffer, usar memória liberada, ponteiro nulo, vazamento.\n\nA aposta do Rust é que esses erros podem ser **pegos pelo compilador**, em vez de aparecerem em produção. Ele consegue isso com um modelo de **ownership** (dono de cada valor) e **borrowing** (empréstimo controlado), que você vai estudar a fundo no próximo módulo. Não há coletor de lixo: a memória é liberada no fim do escopo do dono, de forma determinística, sem pausas.",
                },
                {
                    type: "text",
                    value: "## Onde o Rust vive hoje\n\nA adoção saiu do mundo acadêmico: o kernel do **Linux** aceita código Rust desde a versão 6.1 (2022), a Microsoft e a AWS reescrevem componentes críticos nele, e ferramentas de linha de comando modernas (como o buscador `ripgrep`) mostram a velocidade que ele entrega. A linguagem é mantida hoje pela **Rust Foundation**, com contribuições de empresas como Google, Microsoft e AWS.\n\nQuem vem do C e do C++ encontra no Rust as mesmas garantias de desempenho, com segurança extra. Quem vem de Python e JavaScript ganha uma linguagem para os pontos onde velocidade e controle importam.",
                },
                {
                    type: "table",
                    value: "[[\"Característica\", \"Rust\", \"C/C++\", \"Java/Go\"], [\"Compilação\", \"Para código de máquina\", \"Para código de máquina\", \"Para bytecode/VM ou nativo\"], [\"Gerência de memória\", \"Ownership, sem garbage collector\", \"Manual (new/delete)\", \"Garbage collector\"], [\"Erros de memória\", \"Impedidos em compilação\", \"Aparecem em execução\", \"Impedidos pela VM\"], [\"Velocidade\", \"Comparável a C/C++\", \"Referência do mercado\", \"Abaixo de C/C++\"]]",
                },
                {
                    type: "quote",
                    value: "Rust é uma linguagem de sistemas compilada e estaticamente tipada, que elimina em tempo de compilação as classes de erro de memória que afligem C e C++, sem coletor de lixo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a principal proposta do Rust em relação ao C e ao C++?",
                    difficulty: "facil",
                    explanation: "O objetivo do Rust é o desempenho de uma linguagem de sistemas com segurança de memória garantida pelo compilador, através do modelo de ownership.",
                    options: [
                        { text: "Ser mais rápida que C e C++ em qualquer caso", isCorrect: false },
                        { text: "Pegar os erros de memória já na compilação", isCorrect: true },
                        { text: "Rodar em qualquer navegador sem instalar", isCorrect: false },
                        { text: "Substituir o assembly em drivers de sistema", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o Rust libera a memória de um valor?",
                    difficulty: "medio",
                    explanation: "Cada valor tem um dono. Quando o dono sai de escopo, o Rust insere a liberação da memória automaticamente nesse ponto, de forma determinística, sem garbage collector.",
                    options: [
                        { text: "Um coletor de lixo roda em segundo plano periodicamente", isCorrect: false },
                        { text: "O programador chama delete em cada alocação", isCorrect: false },
                        { text: "Quando o dono do valor sai de escopo, automaticamente", isCorrect: true },
                        { text: "A memória só é liberada ao encerrar o programa", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que ano o kernel do Linux passou a aceitar código Rust?",
                    difficulty: "medio",
                    explanation: "A versão 6.1 do kernel, de 2022, foi a primeira a incluir suporte inicial a código Rust, um marco da adoção da linguagem em sistemas.",
                    options: [
                        { text: "2015", isCorrect: false },
                        { text: "2018", isCorrect: false },
                        { text: "2022", isCorrect: true },
                        { text: "2025", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Rust NÃO oferece, por escolha de projeto?",
                    difficulty: "medio",
                    explanation: "A ausência de garbage collector é deliberada: a memória é gerenciada pelo modelo de ownership, o que dá previsibilidade sem pausas de coleta.",
                    options: [
                        { text: "Compilação para código de máquina", isCorrect: false },
                        { text: "Verificação estática de tipos", isCorrect: false },
                        { text: "Coletor de lixo automático de memória", isCorrect: true },
                        { text: "Ferramenta oficial de build e gestão de pacotes", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem mantém o Rust hoje?",
                    difficulty: "dificil",
                    explanation: "A Rust Foundation, criada em 2021, é a guardiã do projeto, com contribuições financeiras e de engenharia de várias empresas.",
                    options: [
                        { text: "Exclusivamente a Mozilla, como fundadora", isCorrect: false },
                        { text: "A Rust Foundation, com apoio de empresas", isCorrect: true },
                        { text: "A Linux Foundation, como parte do kernel", isCorrect: false },
                        { text: "Um comitê de empresas liderado pela Microsoft", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Cargo e o primeiro programa",
            blocks: [
                {
                    type: "text",
                    value: "# Cargo, o companheiro de todo projeto\n\nO Rust se instala com o **rustup**, que gerencia a toolchain (compilador `rustc` e companhia), e vem de brinde com o **Cargo**, a ferramenta oficial de build e gerenciador de pacotes. Com o Cargo você cria projetos, compila, roda testes e baixa dependências do repositório público **crates.io**.\n\nCada dependência é uma **crate** (o nome vem de caixa, em inglês). Uma crate pode ser uma biblioteca ou um executável, e o Cargo resolve downloads, versões e compilação sozinho.",
                },
                {
                    type: "code",
                    value: "cargo new ola            # cria o projeto (pasta src/main.rs e Cargo.toml)\ncargo run                 # compila e executa\ncargo build               # só compila (resultado em target/debug)\ncargo build --release     # compila com otimizações (target/release)\ncargo check               # verifica erros sem gerar binário, bem mais rápido",
                },
                {
                    type: "text",
                    value: "## O Cargo.toml\n\nO arquivo `Cargo.toml` descreve o projeto e as dependências:\n\n```\n[package]\nname = \"ola\"\nversion = \"0.1.0\"\nedition = \"2024\"\n\n[dependencies]\nrand = \"0.8\"\n```\n\nO campo `edition` diz qual edição da linguagem usar. A edição **2024** é a atual. Edições são formas de evoluir a linguagem sem quebrar código antigo: um projeto escrito na edição 2015 continua compilando nela.\n\nE o primeiro programa, no `src/main.rs`:\n\n```rust\nfn main() {\n    println!(\"Olá, Rust!\");\n}\n```\n\nO `!` indica que `println!` é uma **macro**, não uma função: ela é expandida em tempo de compilação para código que verifica os formatos e argumentos. Erro de formato é erro de compilação, não de execução.",
                },
                {
                    type: "quote",
                    value: "O compilador do Rust é famoso pelos erros didáticos: além de apontar a linha, ele explica o problema, mostra o trecho e sugere a correção. Ler a mensagem de erro é parte do método de estudo.",
                },
            ],
            questions: [
                {
                    statement: "Qual o papel do Cargo em um projeto Rust?",
                    difficulty: "facil",
                    explanation: "O Cargo é a ferramenta de build e o gerenciador de pacotes: cria projetos, compila, roda, testa e baixa dependências do crates.io.",
                    options: [
                        { text: "É o debugger oficial para inspecionar memória", isCorrect: false },
                        { text: "Compilar projetos e gerenciar dependências", isCorrect: true },
                        { text: "É o interpretador que executa os fontes", isCorrect: false },
                        { text: "Formatar código segundo o estilo padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa o `!` em `println!(\"Olá\")`?",
                    difficulty: "medio",
                    explanation: "O ponto de exclamação marca uma macro. Ela é expandida em compilação, o que permite checar formatos e argumentos já nessa fase.",
                    options: [
                        { text: "Que println pode falhar em tempo de execução", isCorrect: false },
                        { text: "Que é uma macro, expandida em compilação", isCorrect: true },
                        { text: "Negar o resultado da impressão", isCorrect: false },
                        { text: "Que a função está depreciada na edição atual", isCorrect: false },
                    ],
                },
                {
                    statement: "Para quê serve o `cargo check`?",
                    difficulty: "facil",
                    explanation: "Ele roda as verificações do compilador sem gerar o binário, o que é muito mais rápido para conferir se o código compila.",
                    options: [
                        { text: "Verificar erros sem gerar o binário", isCorrect: true },
                        { text: "Publicar a crate no repositório crates.io", isCorrect: false },
                        { text: "Rodar os testes compilando em release", isCorrect: false },
                        { text: "Atualizar as dependências do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a `edition = \"2024\"` no Cargo.toml determina?",
                    difficulty: "dificil",
                    explanation: "A edição escolhe o conjunto de regras da linguagem usado ao compilar. Edições permitem evoluir o Rust sem quebrar códigos antigos, que seguem na edição deles.",
                    options: [
                        { text: "O ano mínimo do compilador instalado", isCorrect: false },
                        { text: "A versão mínima exigida das dependências", isCorrect: false },
                        { text: "As regras da linguagem que o código segue", isCorrect: true },
                        { text: "O nível de otimização usado no build release", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `cargo build` e `cargo build --release`?",
                    difficulty: "medio",
                    explanation: "O build comum gera o binário em target/debug, rápido de compilar e bom para desenvolver. O --release aplica otimizações e gera em target/release, o binário de produção.",
                    options: [
                        { text: "Nenhuma, são apelidos para o mesmo comando", isCorrect: false },
                        { text: "O --release aplica otimizações ao compilar", isCorrect: true },
                        { text: "O comum já roda os testes automaticamente", isCorrect: false },
                        { text: "O --release baixa as dependências mais novas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Variáveis, mutabilidade e tipos",
            blocks: [
                {
                    type: "text",
                    value: "# Variáveis imutáveis por padrão\n\nEm Rust, `let` cria uma variável **imutável** por padrão:\n\n```rust\nlet x = 5;\nx = 6; // erro de compilação: cannot assign twice to immutable variable\n```\n\nPara poder alterar, é preciso ser explícito com `mut`:\n\n```rust\nlet mut x = 5;\nx = 6; // agora sim\n```\n\nEssa escolha segue o princípio de que mudança de estado deve ser visível na assinatura. Ao ler uma função, cada `mut` avisa: aqui o valor muda. Em código concorrente, isso vale ouro: dado que não muda não causa corrida.\n\nOutra prática do dia a dia é o **shadowing**: redeclarar o nome com `let` cria uma nova variável que substitui a anterior, até mudando de tipo:\n\n```rust\nlet espacos = \"   \";\nlet espacos = espacos.len(); // agora é um número\n```",
                },
                {
                    type: "text",
                    value: "## Tipos primitivos\n\nRust é estaticamente tipado, mas infere o tipo pelo uso na maioria dos casos. Quando a inferência não tem como decidir, você anota: `let nota: f64 = 9.5;`\n\nOs inteiros vêm em variantes com e sem sinal, de 8 a 128 bits: `i8`, `i16`, `i32` (o padrão), `i64`, `i128`, e `u8`, `u16`, `u32`, `u64`, `u128`. Há ainda `isize` e `usize`, da largura da arquitetura. Flutuantes: `f32` e `f64` (o padrão). Booleano `bool` (true/false) e caractere `char`, que é sempre 4 bytes em Unicode, então `'á'`, `'漢'` e até um emoji são um único char.\n\nO que acontece se um inteiro estourar? Em builds de depuração, o programa **entra em pânico** (aborta com erro). Em release, ele faz wraparound silencioso como em C. Os métodos checados evitam a surpresa: `checked_add`, `wrapping_add`, `saturating_add`.",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Guarda\", \"Exemplo\"], [\"i32 / u32\", \"Inteiro com/sem sinal de 32 bits\", \"let n: i32 = -7;\"], [\"f64\", \"Número com decimais (padrão)\", \"let pi = 3.14;\"], [\"bool\", \"Verdadeiro ou falso\", \"let ativo = true;\"], [\"char\", \"Um caractere Unicode\", \"let c = '中';\"], [\"&str / String\", \"Texto fixo / texto que cresce\", \"\\\"olá\\\" / String::from(\\\"olá\\\")\"]]",
                },
                {
                    type: "quote",
                    value: "Imutável por padrão e explícito na mudança: em Rust, ver um mut já diz que aquele valor participa de lógica com estado.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece ao compilar `let x = 5; x = 6;`?",
                    difficulty: "facil",
                    explanation: "let cria variável imutável por padrão. Atribuir de novo é erro de compilação; para permitir, declara let mut x = 5.",
                    options: [
                        { text: "Compila normalmente e o x passa a valer 6", isCorrect: false },
                        { text: "Erro de compilação: variável imutável", isCorrect: true },
                        { text: "Compila com um aviso de estilo no código", isCorrect: false },
                        { text: "O erro só aparece em tempo de execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o Rust trata `let texto = \"abc\"; let texto = texto.len();`?",
                    difficulty: "medio",
                    explanation: "É shadowing: o segundo let cria uma nova variável com o mesmo nome (e aqui, outro tipo), que passa a sombrear a primeira.",
                    options: [
                        { text: "Erro: dois tipos no mesmo nome de variável", isCorrect: false },
                        { text: "Shadowing: o segundo let substitui o nome", isCorrect: true },
                        { text: "Converte o texto para número automaticamente", isCorrect: false },
                        { text: "Cria um alias mutável para a mesma memória", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o tipo inteiro padrão do Rust quando não há anotação?",
                    difficulty: "medio",
                    explanation: "Na ausência de informação que determine outro tipo, o Rust assume i32, um inteiro com sinal de 32 bits, bom equilíbrio para a maioria dos casos.",
                    options: [
                        { text: "i64", isCorrect: false },
                        { text: "u32", isCorrect: false },
                        { text: "i32", isCorrect: true },
                        { text: "isize", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um build de depuração, o que acontece se um i32 estourar o valor máximo?",
                    difficulty: "dificil",
                    explanation: "Em debug, aritmética que estoura entra em pânico e aborta o programa, tornando o bug visível. Em release, acontece wraparound; os métodos checked_/wrapping_/saturating_ dão controle explícito.",
                    options: [
                        { text: "O programa entra em pânico no overflow", isCorrect: true },
                        { text: "Vira silencemente o número negativo", isCorrect: false },
                        { text: "Promove o valor automaticamente para i64", isCorrect: false },
                        { text: "Arredonda para o maior valor representável", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre o tipo char do Rust, o que é verdade?",
                    difficulty: "dificil",
                    explanation: "char é sempre escalar Unicode de 4 bytes, então um caractere acentuado, um kanji ou um emoji cabem em um único char, diferente do byte de C.",
                    options: [
                        { text: "Ocupa 1 byte, como o char da linguagem C", isCorrect: false },
                        { text: "Guarda um escalar Unicode em 4 bytes", isCorrect: true },
                        { text: "Só pode ser usado em coleções de texto", isCorrect: false },
                        { text: "É apenas um apelido para o tipo String", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Funções, expressões e controle de fluxo",
            blocks: [
                {
                    type: "text",
                    value: "# Funções e o retorno como expressão\n\nFunções se declaram com `fn`. O tipo dos parâmetros e do retorno é sempre explícito, e o retorno acontece pela **última expressão** da função, sem ponto e vírgula:\n\n```rust\nfn soma(a: i32, b: i32) -> i32 {\n    a + b           // expressão: é o retorno\n}\n\nfn dobro(n: i32) -> i32 {\n    n * 2\n}\n```\n\nSe você escrever `a + b;` (com ponto e vírgula), vira uma declaração que retorna `()`, o tipo unit (vazio), e o compilador reclama. Essa diferença entre **expressão** (produz valor) e **declaração** (executa ação) percorre toda a linguagem: blocos `{}` também são expressões:\n\n```rust\nlet y = {\n    let base = 3;\n    base * base   // y recebe 9\n};\n```",
                },
                {
                    type: "text",
                    value: "## Fluxo de controle\n\nO `if` não precisa de parênteses e, como tudo em Rust, é uma expressão que produz valor, o substituto natural do operador ternário:\n\n```rust\nlet nota = 7;\nlet situacao = if nota >= 6 { \"aprovado\" } else { \"reprovado\" };\n```\n\nOs três laços: `loop` (infinito, sai com `break`, que pode devolver valor), `while` condicionado e `for` para iterar:\n\n```rust\nloop {\n    // ... até um break\n    break 42;              // o loop \"vale\" 42\n}\n\nwhile restante > 0 { restante -= 1; }\n\nfor i in 0..5 { print!(\"{i} \"); }        // 0 1 2 3 4\nfor i in (0..5).rev() { print!(\"{i} \"); } // 4 3 2 1 0\n```\n\nO range `0..5` exclui o fim; `0..=5` inclui. E o `for` do Rust é sempre sobre um iterador, nunca um contador solto sujeito a erro de limite: o clássico `for (int i = 0; i <= n; i++)` com um `=` a mais não existe aqui.",
                },
                {
                    type: "quote",
                    value: "Em Rust, if, blocos e laços são expressões: produzem valores. O código aprende a descrever o resultado em vez de mutar variável por variável.",
                },
            ],
            questions: [
                {
                    statement: "Como uma função Rust retorna valor sem a palavra return?",
                    difficulty: "facil",
                    explanation: "A última expressão da função, sem ponto e vírgula, é o valor de retorno, no estilo a + b como última linha.",
                    options: [
                        { text: "Pela última expressão, sem ponto e vírgula", isCorrect: true },
                        { text: "Pela primeira expressão executada da função", isCorrect: false },
                        { text: "Atribuindo o resultado ao nome da função", isCorrect: false },
                        { text: "Não é possível, return é sempre obrigatório", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `a + b` e `a + b;` na última linha da função?",
                    difficulty: "medio",
                    explanation: "Sem ponto e vírgula é expressão e vira o retorno; com ponto e vírgula vira declaração que devolve o tipo unit (), não o valor esperado.",
                    options: [
                        { text: "Nenhuma, o compilador ignora o ponto e vírgula", isCorrect: false },
                        { text: "Com `;` a linha vira declaração e retorna unit", isCorrect: true },
                        { text: "Sem `;` a soma acontece em tempo de compilação", isCorrect: false },
                        { text: "Com `;` o resultado é arredondado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o range `0..5` produz em um for?",
                    difficulty: "facil",
                    explanation: "Ranges meia-aberta: 0..5 itera 0, 1, 2, 3 e 4. Para incluir o fim, usa-se 0..=5.",
                    options: [
                        { text: "0 até 5, incluindo o 5", isCorrect: false },
                        { text: "0 até 4, excluindo o 5", isCorrect: true },
                        { text: "1 até 5, excluindo o 0", isCorrect: false },
                        { text: "5 repetições começando em 1", isCorrect: false },
                    ],
                },
                {
                    statement: "Como obter um valor de dentro de um `loop`?",
                    difficulty: "medio",
                    explanation: "O break pode levar um valor: break 42 faz o loop inteiro avaliar para 42, capturável numa variável.",
                    options: [
                        { text: "O loop só termina, não devolve valor", isCorrect: false },
                        { text: "Com `break valor`, que o loop avalia", isCorrect: true },
                        { text: "Retornando o valor com yield", isCorrect: false },
                        { text: "Escrevendo em uma variável global mut", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o `for` do Rust é mais seguro que o laço com contador típico do C?",
                    difficulty: "dificil",
                    explanation: "O for itera diretamente sobre o iterador/range: o limite é parte do objeto percorrido, eliminando erros clássicos de off-by-one na condição do contador.",
                    options: [
                        { text: "Ele roda sempre em paralelo, sem estado compartilhado", isCorrect: false },
                        { text: "O limite mora no iterador, sem contador manual", isCorrect: true },
                        { text: "O compilador proíbe laços maiores que mil repetições", isCorrect: false },
                        { text: "Ele verifica null em cada iteração", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "A ideia central: cada valor tem um dono",
            blocks: [
                {
                    type: "text",
                    value: "# O problema que o ownership resolve\n\nOs bugs de memória do C nascem de perguntas sem resposta: esse ponteiro ainda é válido? Quem libera essa memória? Alguém mais está lendo esse buffer enquanto eu escrevo? Linguagens com garbage collector respondem mantendo um runtime vigilante; o Rust responde com **regras verificadas em compilação**.\n\nAs três regras do jogo:\n\n1. Cada valor tem exatamente **um dono**.\n2. Quando o dono sai de escopo, o valor é liberado.\n3. Para usar um valor em outro lugar, você **transfere** a posse (move) ou **empresta** (borrow) com regras claras.\n\n```rust\nfn main() {\n    let s = String::from(\"olá\");   // s é a dona\n    toma_posse(s);                 // a posse passa para a função\n    println!(\"{s}\");               // erro: s não é mais a dona\n}\n\nfn toma_posse(texto: String) {\n    println!(\"{texto}\");           // texto é liberado ao fim da função\n}\n```\n\nEsse programa não compila, e é ouro: o uso de memória movida, que em C viraria comportamento indefinido, virou mensagem de compilador com linha, causa e sugestão.",
                },
                {
                    type: "text",
                    value: "## O resto da trilha destrincha isso\n\nO próximo módulo mergulha em moves, copies e empréstimos: quando o valor é copiado, quando é movido, o que um `&` significa e por que só um empréstimo mutável por vez. Depois as regras se espalham pela linguagem inteira: structs que guardam donos, funções que devolvem empréstimos, iterators que não deixam você mudar a coleção enquanto percorre, threads que só compartilham dados com provas de segurança.\n\nA curva de aprendizado do Rust é real: nas primeiras semanas o borrow checker rejeita código que parecia razoável. A recompensa também: as categorias de bug que ele pega são as que derrubam produção em C e C++.",
                },
                {
                    type: "quote",
                    value: "Um dono por valor, liberação no fim do escopo, acesso por transferência ou empréstimo. Toda a segurança de memória do Rust deriva dessas três regras.",
                },
            ],
            questions: [
                {
                    statement: "Quantos donos um valor tem em Rust?",
                    difficulty: "facil",
                    explanation: "Exatamente um. Quando ele sai de escopo, o valor é liberado; para usar em outro lugar, move-se a posse ou empresta-se o acesso.",
                    options: [
                        { text: "Exatamente um dono por vez", isCorrect: true },
                        { text: "Ilimitados, com contagem de referências", isCorrect: false },
                        { text: "Nenhum, a memória é global", isCorrect: false },
                        { text: "Dois: um temporário e um definitivo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o exemplo com `toma_posse(s)` não compila ao usar `s` depois?",
                    difficulty: "medio",
                    explanation: "String não implementa Copy, então passá-la à função move a posse. Depois do move, s deixou de ser válida e o compilador impede o uso.",
                    options: [
                        { text: "A função apagou a variável do escopo", isCorrect: false },
                        { text: "A posse foi movida e s não é mais válida", isCorrect: true },
                        { text: "Strings não podem ser impressas duas vezes", isCorrect: false },
                        { text: "Falta marcar a variável como mut", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando a memória de um valor é liberada em Rust?",
                    difficulty: "facil",
                    explanation: "No momento em que o dono sai de escopo, o compilador insere a liberação determinística, sem coletor de lixo.",
                    options: [
                        { text: "Quando o dono sai de escopo", isCorrect: true },
                        { text: "Quando a memória total atinge um limite", isCorrect: false },
                        { text: "Somente com uma chamada explícita de free", isCorrect: false },
                        { text: "Ao final do programa, em bloco único", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual estratégia o Rust escolheu para evitar erros de memória?",
                    difficulty: "medio",
                    explanation: "Regras de ownership verificadas em compilação: os erros nem chegam a existir como binário, diferente do GC em execução ou do manual do C.",
                    options: [
                        { text: "Coletor de lixo generacional em tempo de execução", isCorrect: false },
                        { text: "Liberação manual com RAII opcional", isCorrect: false },
                        { text: "Regras de posse verificadas em compilação", isCorrect: true },
                        { text: "Máquina virtual com checagens em cada acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com a curva de aprendizado típica de quem chega ao Rust?",
                    difficulty: "dificil",
                    explanation: "O borrow checker rejeita padrões que outras linguagens aceitam, exigindo um período de adaptação de mentalidade, pago de volta em segurança de memória em produção.",
                    options: [
                        { text: "É suave: o código costuma compilar como em Python", isCorrect: false },
                        { text: "O borrow checker barra código que parecia válido", isCorrect: true },
                        { text: "Depende de habilitar o modo unsafe no compilador", isCorrect: false },
                        { text: "Só afeta quem vem de linguagens funcionais puras", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Ownership, moves e empréstimos",
    aulas: [
        {
            titulo: "Moves e cópias: para onde foi o valor",
            blocks: [
                {
                    type: "text",
                    value: "# Move: atribuir transfere a posse\n\nAtribuir a outra variável um valor que usa o heap não copia nada: a posse é **movida**.\n\n```rust\nlet s1 = String::from(\"rust\");\nlet s2 = s1;            // a posse do buffer vai para s2\nprintln!(\"{s1}\");       // erro: borrow of moved value `s1`\n```\n\nDepois do move, `s1` deixa de ser utilizável e o compilador recusa qualquer uso dela, apontando a linha exata onde a posse mudou. A razão é simples: uma `String` é um trio na stack (ponteiro, tamanho, capacidade) apontando para bytes no heap. Copiar só esse trio deixaria dois donos do mesmo buffer, e os dois tentariam liberá-lo no fim do escopo. O move corta o problema na raiz: a variável de origem é desativada e só a nova é dona.",
                },
                {
                    type: "text",
                    value: "## Tipos com Copy copiam e seguem vivos\n\nTipos que vivem inteiros na stack implementam o traço **Copy**: a atribuição copia os bits e as duas variáveis seguem válidas.\n\n```rust\nlet x = 5;\nlet y = x;               // cópia trivial de um i32\nprintln!(\"{x} {y}\");     // imprime 5 5\n```\n\nSão Copy os inteiros, os flutuantes, `bool`, `char` e tuplas feitas só de tipos Copy. A regra de bolso: se todo o conteúdo cabe na stack e não há ponteiro para fora, o tipo pode ser Copy.",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Na atribuição let b = a;\", \"Depois da linha\"], [\"i32, f64, bool, char\", \"copia os bits (Copy)\", \"a e b válidos\"], [\"String\", \"move a posse\", \"só b é válido\"], [\"Vec<i32>\", \"move a posse\", \"só b é válido\"], [\"(i32, bool)\", \"copia os bits\", \"a e b válidos\"]]",
                },
                {
                    type: "text",
                    value: "## Clone: a cópia de verdade, escrita no código\n\nQuando você precisa de duas `String` iguais, pede a cópia explicitamente com `clone()`, que aloca um buffer novo e copia os bytes:\n\n```rust\nlet s1 = String::from(\"rust\");\nlet s2 = s1.clone();     // cópia profunda, os dois válidos\nprintln!(\"{s1} {s2}\");\n```\n\nO move também aparece ao chamar funções: passar uma `String` por valor entrega a posse para dentro dela. Se o chamador precisa do valor de volta, o padrão é a função receber por valor e devolver:\n\n```rust\nfn main() {\n    let s = String::from(\"rust\");\n    let s = emoldura(s);   // a posse entra e sai de volta\n    println!(\"{s}\");      // rust!\n}\n\nfn emoldura(texto: String) -> String {\n    format!(\"{texto}!\")\n}\n```\n\nClonar na chamada é a outra saída, para quando a função consome o valor e o chamador quer manter o seu.",
                },
                {
                    type: "quote",
                    value: "Atribuir move o que vive no heap e copia o que cabe na stack. Para ter dois do primeiro, clone, com o custo escrito na linha.",
                },
            ],
            questions: [
                {
                    statement: "Em `let s1 = String::from(\"rust\"); let s2 = s1;`, qual o estado de s1 depois da segunda linha?",
                    difficulty: "facil",
                    explanation: "String não implementa Copy, então a atribuição move a posse. O compilador recusa qualquer uso de s1 depois do move, o que impede a dupla liberação do buffer.",
                    options: [
                        { text: "Válida, apontando para o mesmo buffer que s2", isCorrect: false },
                        { text: "Inválida: a posse do valor foi para s2", isCorrect: true },
                        { text: "Válida, com uma cópia completa do conteúdo", isCorrect: false },
                        { text: "Válida, mas restrita a leitura até o fim do escopo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `bool`, `i32` e `char` podem ser Copy, mas `String` não pode?",
                    difficulty: "medio",
                    explanation: "Copy exige que todo o conteúdo more na stack, sem ponteiro para fora. Com buffer no heap, copiar por atribuição deixaria dois donos do mesmo espaço.",
                    options: [
                        { text: "São comparáveis; String não implementa comparação", isCorrect: false },
                        { text: "Têm tamanho fixo em bytes; String é grande demais", isCorrect: false },
                        { text: "Vivem inteiros na stack; String usa o heap", isCorrect: true },
                        { text: "São imutáveis por natureza; String cresce com push", isCorrect: false },
                    ],
                },
                {
                    statement: "O que faz `let s2 = s1.clone();` quando s1 é uma String?",
                    difficulty: "facil",
                    explanation: "clone faz a cópia profunda: nova alocação no heap com o mesmo conteúdo. Depois dele, s1 e s2 são independentes.",
                    options: [
                        { text: "Cria um buffer novo com cópia dos bytes", isCorrect: true },
                        { text: "Move a posse e desativa s1", isCorrect: false },
                        { text: "Cria um segundo nome para o mesmo buffer", isCorrect: false },
                        { text: "Empresta s1 para s2 por um tempo", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma função tem assinatura `fn arquivar(texto: String)`. O que fazer para continuar usando a mesma String depois de `arquivar(s);`?",
                    difficulty: "medio",
                    explanation: "Parâmetro por valor move a posse de vez. Clonar na chamada entrega a cópia e deixa a original com o chamador; `&s` nem compila aqui, pois a assinatura pede String.",
                    options: [
                        { text: "Chamar com `&s` para adiar o move", isCorrect: false },
                        { text: "Passar `s.clone()` na chamada", isCorrect: true },
                        { text: "Declarar s com `let mut` antes", isCorrect: false },
                        { text: "Marcar o parâmetro como `mut texto`", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o Rust não copia automaticamente uma String na atribuição, mantendo as duas variáveis válidas?",
                    difficulty: "dificil",
                    explanation: "Cópia de dados no heap custa proporcionalmente ao tamanho. O Rust prefere o move, que é grátis, e deixa a cópia explícita no clone para o custo aparecer no código.",
                    options: [
                        { text: "Isso exigiria coletor de lixo no binário", isCorrect: false },
                        { text: "A cópia de heap tem custo e fica oculta", isCorrect: true },
                        { text: "O compilador não sabe o tamanho do buffer", isCorrect: false },
                        { text: "Duas donas liberariam o buffer duas vezes", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Empréstimos: use a String sem ficar com ela",
            blocks: [
                {
                    type: "text",
                    value: "# Emprestar em vez de entregar\n\nMover a posse a cada chamada cansa rápido: para toda função que só precisa ler o valor, você teria que clonar ou receber o valor de volta. A saída é **emprestar** com uma referência. `&valor` cria um empréstimo e a posse continua com o dono:\n\n```rust\nfn main() {\n    let s = String::from(\"olá, rust\");\n    let n = tamanho(&s);      // empresta; s continua dona\n    println!(\"'{s}' tem {n} bytes\");\n}\n\nfn tamanho(texto: &String) -> usize {\n    texto.len()               // só lê; nada é liberado aqui\n}\n```\n\nA assinatura `&String` conta a história: a função recebe um empréstimo de leitura e devolve o controle ao sair. Criar e destruir a `String` continua sendo responsabilidade só do dono.",
                },
                {
                    type: "text",
                    value: "## &mut: empréstimo com direito de escrita\n\n`&T` é empréstimo de leitura. Quando a função precisa modificar o valor, o empréstimo precisa ser mutável, e isso aparece nos dois lados da chamada: a variável nasce `mut` e o argumento vai com `&mut`.\n\n```rust\nfn main() {\n    let mut s = String::from(\"olá\");\n    grita(&mut s);           // empresta com escrita\n    println!(\"{s}\");        // olá!!!\n}\n\nfn grita(texto: &mut String) {\n    texto.push_str(\"!!!\");\n}\n```\n\nRepare no que não acontece: a função não fica com a `String`. Ela altera o buffer do dono e o controle volta por completo quando o empréstimo acaba.",
                },
                {
                    type: "text",
                    value: "## Empréstimo não exclui o move\n\nSe a função consome o valor de verdade (grava num arquivo, guarda num mapa e não devolve), receber `String` por valor é o correto: a posse muda de vez e a memória é liberada no fim da função. Se ela transforma e devolve, o padrão é o `emoldura` da aula passada: entrar por valor, sair por valor.\n\nO critério é o uso que a função faz do dado: ler, emprestar com `&`; escrever no lugar, emprestar com `&mut`; consumir, mover. A assinatura honesta evita surpresa na chamada.",
                },
                {
                    type: "quote",
                    value: "Uma referência é um contrato de uso: & para ler, &mut para escrever. O dono não muda, só divide o acesso por um tempo.",
                },
            ],
            questions: [
                {
                    statement: "Em `let n = tamanho(&s);`, o que o `&` faz com a String s?",
                    difficulty: "facil",
                    explanation: "O & cria um empréstimo: a função lê o valor e a posse nunca sai do chamador. Nada é duplicado nem liberado na chamada.",
                    options: [
                        { text: "Duplica o buffer antes de enviar para a função", isCorrect: false },
                        { text: "Converte a String em texto de literal", isCorrect: false },
                        { text: "Empresta o valor; a posse segue com o chamador", isCorrect: true },
                        { text: "Marca o parâmetro como mutável na função", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma função recebe `texto: &String` e retorna `usize`. Depois da chamada, quem precisa liberar a String?",
                    difficulty: "medio",
                    explanation: "A função só leu um empréstimo; a posse nunca saiu do chamador. A liberação acontece quando o dono sai de escopo, como sempre.",
                    options: [
                        { text: "Ninguém: o dono a libera no fim do escopo", isCorrect: true },
                        { text: "A função, ao encerrar o cálculo do tamanho", isCorrect: false },
                        { text: "O chamador, com uma chamada explícita a drop", isCorrect: false },
                        { text: "O coletor de lixo, quando rodar a limpeza", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é preciso para que `grita(&mut s)` compile, sendo `fn grita(t: &mut String)`?",
                    difficulty: "facil",
                    explanation: "O mut precisa existir no dono: só se empresta escrita sobre um valor que pode mudar. O parâmetro `&mut String` completa o contrato.",
                    options: [
                        { text: "s declarada com `let` simples", isCorrect: false },
                        { text: "s declarada com `let mut`", isCorrect: true },
                        { text: "A função marcada como `mut fn`", isCorrect: false },
                        { text: "O parâmetro declarado como `mut t: String`", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `fn alimenta(s: &String) { s.push_str(\"!\"); }` não compila?",
                    difficulty: "medio",
                    explanation: "&String promete não alterar o valor. Para mutar, o parâmetro precisa ser `&mut String` e a chamada passar `&mut` sobre um dono mutável.",
                    options: [
                        { text: "Clonar s antes seria obrigatório por segurança", isCorrect: false },
                        { text: "A função precisaria devolver a String alterada", isCorrect: false },
                        { text: "Empréstimo de leitura não permite escrever", isCorrect: true },
                        { text: "push_str só aceita texto criado de literal", isCorrect: false },
                    ],
                },
                {
                    statement: "A função `fn emoldura(texto: String) -> String` devolve o próprio valor recebido. O que o chamador ganha de volta?",
                    difficulty: "dificil",
                    explanation: "O valor recebido por parâmetro pertence à função; ao devolvê-lo, a posse transfere de volta ao chamador, que vira o novo dono.",
                    options: [
                        { text: "Um empréstimo válido enquanto a função existir", isCorrect: false },
                        { text: "Uma cópia nova feita na saída da função", isCorrect: false },
                        { text: "Acesso compartilhado entre chamador e função", isCorrect: false },
                        { text: "A posse do valor, que entrou e saiu da função", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "As regras do borrow checker",
            blocks: [
                {
                    type: "text",
                    value: "# A regra cabe em uma linha\n\nO borrow checker é a parte do compilador que fiscaliza empréstimos. A regra central: **um empréstimo mutável OU vários imutáveis ao mesmo tempo, nunca os dois juntos**.\n\n```rust\nlet mut s = String::from(\"rust\");\nlet r1 = &s;             // empréstimo de leitura\nlet r2 = &s;             // ok: vários leitores\nlet r3 = &mut s;         // erro: escrita com r1 e r2 vivos\nprintln!(\"{r1} {r2} {r3}\");\n```\n\nVários leitores ao mesmo tempo não incomodam ninguém: ninguém muda o dado debaixo deles. Um escritor junto de qualquer outro acesso, esse sim é problema.",
                },
                {
                    type: "text",
                    value: "## Empréstimo acaba no último uso\n\nO empréstimo não dura até a chave fechar: dura até a última vez que a referência é usada. Muitas vezes reordenar o código resolve:\n\n```rust\nlet mut s = String::from(\"rust\");\nlet r = &s;\nprintln!(\"{r}\");        // último uso de r: empréstimo termina aqui\ns.push_str(\"!\");        // compila: nenhum leitor pendente\n```\n\nNa prática, é assim que o código do dia a dia convive com a regra sem virar ginástica: os empréstimos são curtos e morrem logo depois de servir.",
                },
                {
                    type: "text",
                    value: "## Por que tanta rigidez\n\nA regra parece chata até você lembrar do que ela impede. Uma **corrida de dados** acontece quando alguém escreve num dado enquanto outro lê: o leitor pode ver um estado pela metade. Em código com threads isso vira bug intermitente, dos piores de caçar. O Rust proíbe a combinação já na compilação, mesmo em programa de uma thread só, porque o mesmo perigo aparece ao mutar uma coleção enquanto ela é percorrida: o iterador segura um ponteiro para uma estrutura que acaba de ser realocada.\n\nA proibição parece custosa no começo e vira reflexo: em vez de descobrir a corrida em produção com clientes dentro, você a resolve em segundos na sua máquina.",
                },
                {
                    type: "text",
                    value: "## Referência pendurada: impedida em compilação\n\nUma função que tenta devolver uma referência para sua variável local não compila:\n\n```rust\nfn pendurada() -> &String {\n    let s = String::from(\"rust\");\n    &s          // erro: a referência sobreviveria à variável\n}\n```\n\nEm C, isso devolveria um ponteiro para memória já liberada, o clássico use-after-free. Em Rust, o compilador acompanha a vida de cada referência (o assunto lifetimes, mais adiante na trilha) e barra o retorno antes de o binário existir.",
                },
                {
                    type: "quote",
                    value: "Um escritor ou vários leitores, nunca os dois ao mesmo tempo. A regra que evita corrida de dados em produção custa alguns ajustes em compilação.",
                },
            ],
            questions: [
                {
                    statement: "Qual combinação de empréstimos simultâneos sobre o mesmo valor o Rust aceita?",
                    difficulty: "facil",
                    explanation: "Leituras simultâneas são seguras porque ninguém muda o dado. Um empréstimo mutável exige exclusividade total, e é por isso que só um existe por vez.",
                    options: [
                        { text: "Vários mutáveis ou um único imutável", isCorrect: false },
                        { text: "Vários imutáveis ou um único mutável", isCorrect: true },
                        { text: "Ilimitados dos dois, em escopos distintos", isCorrect: false },
                        { text: "No máximo dois imutáveis e nenhum mutável", isCorrect: false },
                    ],
                },
                {
                    statement: "Com `let r1 = &mut s;` seguido de `let r2 = &mut s;` e depois `r1.push('!');`, por que o código não compila?",
                    difficulty: "medio",
                    explanation: "r1 ainda é usado depois de r2 existir, então há dois empréstimos mutáveis simultâneos. A regra permite apenas um por vez.",
                    options: [
                        { text: "push só pode agir no dono, não na referência", isCorrect: false },
                        { text: "Há dois empréstimos mutáveis simultâneos", isCorrect: true },
                        { text: "r2 assumiu a posse de s, desativando r1", isCorrect: false },
                        { text: "s precisaria ser declarada como mut", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma função tenta devolver `&s`, onde s é uma String local do corpo dela. O que o compilador faz?",
                    difficulty: "facil",
                    explanation: "A local morre no fim da função; devolver uma referência para ela criaria um ponteiro para memória liberada, e o compilador barra na análise.",
                    options: [
                        { text: "Aceita e move a String junto com o retorno", isCorrect: false },
                        { text: "Aceita, materializando uma String própria", isCorrect: false },
                        { text: "Só rejeita quando a String é muito grande", isCorrect: false },
                        { text: "Rejeita: apontaria para memória liberada", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual problema real a proibição de escrever durante leituras simultâneas evita?",
                    difficulty: "medio",
                    explanation: "Escritor junto de leitor no mesmo dado é a receita da corrida de dados: quem lê pode ver o valor pela metade. A regra transforma esse bug em erro de compilação.",
                    options: [
                        { text: "O estouro de pilha por recursão sem caso base", isCorrect: false },
                        { text: "O vazamento de memória por buffers órfãos", isCorrect: false },
                        { text: "A corrida de dados entre leitor e escritor", isCorrect: true },
                        { text: "O deadlock entre threads que se esperam", isCorrect: false },
                    ],
                },
                {
                    statement: "Dado `let mut s = String::from(\"rust\"); let r = &s; println!(\"{r}\"); s.push_str(\"!\");`, por que o trecho compila?",
                    difficulty: "dificil",
                    explanation: "O compilador considera o empréstimo encerrado no último uso da referência. Como r não é mais usado depois do println, a mutação seguinte não conflita.",
                    options: [
                        { text: "println desliga o borrow checker nessa linha", isCorrect: false },
                        { text: "O empréstimo encerra no último uso de r", isCorrect: true },
                        { text: "push_str não conta como mutação da String", isCorrect: false },
                        { text: "r é copiado para dentro da macro println", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Slices: uma janela sobre os dados",
            blocks: [
                {
                    type: "text",
                    value: "# Uma janela, não uma cópia\n\nSlice é uma referência para uma sequência contígua de elementos: `&[T]` para vetores e arrays, `&str` para texto. Ela guarda ponteiro e comprimento, e não é dona de nada: aponta para a memória de outro valor.\n\nCriar uma slice não aloca cópia nenhuma, só registra onde o pedaço começa e onde termina. É barata de criar e, por ser um empréstimo, o compilador fiscaliza o dono por baixo, como você viu na aula passada.",
                },
                {
                    type: "code",
                    value: "let v = vec![1, 2, 3, 4, 5];\nlet janela = &v[1..3];        // &[i32] enxerga 2 e 3\nlet tudo = &v[..];            // &[i32] com o vetor inteiro\nprintln!(\"{:?} {:?}\", janela, tudo);",
                },
                {
                    type: "text",
                    value: "## O exemplo clássico: primeira palavra\n\nO range funciona como no `for`: `1..3` exclui o fim, `1..=3` inclui. A função que devolve a primeira palavra de uma frase mostra a força da slice: ela não aloca nada, só devolve uma janela para dentro do texto original.\n\n```rust\nfn primeira_palavra(s: &str) -> &str {\n    let bytes = s.as_bytes();\n    for (i, &item) in bytes.iter().enumerate() {\n        if item == b' ' {\n            return &s[..i];    // janela até o espaço\n        }\n    }\n    s                          // sem espaço: o texto todo\n}\n\nfn main() {\n    let frase = String::from(\"rust é rápido\");\n    let p = primeira_palavra(&frase);\n    println!(\"{p}\");           // rust\n}\n```\n\nNote a assinatura: entra `&str`, sai `&str`. A janela devolvida aponta para a mesma memória do texto emprestado, e o compilador garante que o texto viva pelo menos enquanto `p` existir.",
                },
                {
                    type: "text",
                    value: "## Slice prende o dono\n\nComo slice é empréstimo, vale a regra do borrow checker: enquanto a janela existir, o dono não pode ser mutado.\n\n```rust\nlet mut frase = String::from(\"rust é rápido\");\nlet p = primeira_palavra(&frase);\nfrase.clear();                // erro: escrita com p pendente\nprintln!(\"{p}\");\n```\n\nÉ o mesmo mecanismo que impede invalidar um iterador ao remover itens durante o laço: a travessia segura uma janela da coleção, e a mutação precisa esperar a janela fechar.",
                },
                {
                    type: "quote",
                    value: "Slice é uma vista emprestada: ponteiro e comprimento, sem posse. Você lê um pedaço dos dados sem pagar o preço de copiar.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma slice como `&[i32]` ou `&str`?",
                    difficulty: "facil",
                    explanation: "A slice é um empréstimo: um ponteiro e um comprimento para uma faixa contígua de dados que pertencem a outro valor.",
                    options: [
                        { text: "Uma cópia completa dos dados em buffer novo", isCorrect: false },
                        { text: "Um vetor de tamanho fixo alocado na stack", isCorrect: false },
                        { text: "Um iterador que consome a coleção de origem", isCorrect: false },
                        { text: "Uma janela de leitura sem posse dos dados", isCorrect: true },
                    ],
                },
                {
                    statement: "Com `let v = vec![1, 2, 3, 4, 5];` e `let j = &v[1..3];`, o que j contém?",
                    difficulty: "facil",
                    explanation: "O range 1..3 cobre os índices 1 e 2, excluindo o fim, ou seja, os elementos 2 e 3.",
                    options: [
                        { text: "Os elementos 2 e 3", isCorrect: true },
                        { text: "Os elementos 1 e 2", isCorrect: false },
                        { text: "Os elementos 2, 3 e 4", isCorrect: false },
                        { text: "Os elementos 1, 2 e 3", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `fn primeira_palavra(s: &str) -> &str` não aloca memória ao devolver a palavra?",
                    difficulty: "medio",
                    explanation: "O retorno é uma slice que aponta para bytes do próprio texto de entrada. Não há buffer novo, só um recorte do que já existe.",
                    options: [
                        { text: "A palavra vai para um buffer global estático", isCorrect: false },
                        { text: "Devolve o índice onde a palavra termina", isCorrect: false },
                        { text: "O retorno é uma janela do próprio texto", isCorrect: true },
                        { text: "O texto inteiro é movido para o chamador", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `let p = primeira_palavra(&frase);`, o que impede `frase.clear()` logo em seguida?",
                    difficulty: "medio",
                    explanation: "p ainda é usado depois do clear, então o empréstimo continua vivo. Mutar o dono durante um empréstimo de leitura viola a regra do borrow checker.",
                    options: [
                        { text: "clear apaga o dono e o &str deixa de existir", isCorrect: false },
                        { text: "p ainda é usado, mantendo o empréstimo vivo", isCorrect: true },
                        { text: "frase teve a posse movida para a função", isCorrect: false },
                        { text: "clear exige clonar a slice antes de rodar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de `primeira_palavra` devolver `&str` em vez de uma nova String com a palavra?",
                    difficulty: "dificil",
                    explanation: "A slice aponta para o texto original, com custo zero de alocação. Criar uma String alocaria um buffer novo para copiar bytes que já existem.",
                    options: [
                        { text: "Nada é alocado: a janela reutiliza o texto", isCorrect: true },
                        { text: "A String devolvida não poderia ser impressa", isCorrect: false },
                        { text: "O borrow checker ignora quem devolve &str", isCorrect: false },
                        { text: "&str permite editar a palavra no lugar", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "String e &str: dono e vista do texto",
            blocks: [
                {
                    type: "text",
                    value: "# Dois tipos para o texto\n\n`String` é o dono: buffer no heap, cresce com `push_str`, é liberada quando sai de escopo. `&str` é o empréstimo: uma slice que aponta para bytes que pertencem a alguém, seja o buffer de uma `String`, seja o texto de um literal embutido no binário.\n\n```rust\nlet dono = String::from(\"texto que cresce\");\nlet vista: &str = &dono[..];      // janela para o buffer\nlet literal = \"moro no binário\";  // &str para o executável\n```\n\nA dupla divide o trabalho: `String` para texto que você constrói e transforma, `&str` para ler texto que já existe em qualquer forma.",
                },
                {
                    type: "table",
                    value: "[[\"Aspecto\", \"String\", \"&str\"], [\"Memória\", \"buffer próprio no heap\", \"empréstimo de bytes existentes\"], [\"Posse\", \"dona do conteúdo\", \"não é dona de nada\"], [\"Crescer\", \"sim, com push_str\", \"não, tamanho fixo\"], [\"Origem típica\", \"String::from, format!\", \"literal, &dono[..], slice de range\"]]",
                },
                {
                    type: "text",
                    value: "## Assinaturas: pegue a vista, devolva o dono\n\nO padrão das funções do dia a dia: parâmetro `&str`, que aceita literal e `String`, e retorno `String` quando o texto produzido é novo.\n\n```rust\nfn grita(texto: &str) -> String {\n    format!(\"{texto}!!!\")\n}\n\nfn main() {\n    let s = String::from(\"rust\");\n    let a = grita(&s);         // &String vira &str na entrada\n    let b = grita(\"direto\");   // literal já é &str\n    println!(\"{a} {b}\");\n}\n```\n\nPedir `&String` no parâmetro é mais restritivo sem ganho nenhum: `&str` aceita tudo que `&String` aceita e ainda as slices de qualquer texto.",
                },
                {
                    type: "text",
                    value: "## A coerção do literal\n\nUm literal como `\"olá\"` tem tipo `&str` com tempo de vida estático: os bytes estão no binário do programa e duram a execução toda. Por isso ele serve direto onde se espera `&str`.\n\nJá para uma função que exige `String`, o literal não converte sozinho. Você materializa o dono com `String::from(\"olá\")` ou `\"olá\".to_string()`. A regra geral: verbo de ler pede vista, verbo de guardar pede dono.",
                },
                {
                    type: "quote",
                    value: "String é o dono do texto, &str é a vista. Assinatura esperta pega a vista emprestada e devolve dono novo.",
                },
            ],
            questions: [
                {
                    statement: "Qual tipo de parâmetro aceita tanto uma String quanto um literal na mesma função?",
                    difficulty: "facil",
                    explanation: "&String vira &str por coerção na chamada e literais já são &str, então um parâmetro &str cobre as duas origens sem copiar nada.",
                    options: [
                        { text: "&str, que recebe os dois sem cópia", isCorrect: true },
                        { text: "String, que converte os dois na entrada", isCorrect: false },
                        { text: "&String, mais genérico que &str", isCorrect: false },
                        { text: "str, a forma sem referência", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença de memória entre String e &str?",
                    difficulty: "medio",
                    explanation: "String aloca e possui um buffer no heap. &str é só um par ponteiro e comprimento para bytes que pertencem a outro valor.",
                    options: [
                        { text: "String vive na stack; &str vive sempre no heap", isCorrect: false },
                        { text: "As duas alocam no heap; &str é somente leitura", isCorrect: false },
                        { text: "&str copia o texto para a stack a cada acesso", isCorrect: false },
                        { text: "String tem buffer no heap; &str apenas aponta", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual a escolha padrão para uma função que monta um texto novo e o devolve?",
                    difficulty: "medio",
                    explanation: "Texto novo precisa de um dono. Devolver String move a posse para o chamador; retornar referência para local da função nem compila.",
                    options: [
                        { text: "Devolver &str de uma área interna da função", isCorrect: false },
                        { text: "Devolver String e mover a posse ao chamador", isCorrect: true },
                        { text: "Devolver &String por empréstimo ao chamador", isCorrect: false },
                        { text: "Devolver str, deixando o chamador alocar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece na chamada `grita(&minha_string)` se a função é `fn grita(texto: &str)`?",
                    difficulty: "medio",
                    explanation: "A referência &String é convertida em &str por coerção de deref, sem cópia e sem mover a posse da String.",
                    options: [
                        { text: "&String vira &str por coerção na chamada", isCorrect: true },
                        { text: "minha_string é movida para dentro da função", isCorrect: false },
                        { text: "A chamada falha sem cast explícito de tipo", isCorrect: false },
                        { text: "Um clone implícito roda para casar os tipos", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `mostra(\"olá\")` não compila se a função é `fn mostra(texto: String)`?",
                    difficulty: "dificil",
                    explanation: "O literal tem tipo &str e não se converte em String automaticamente. É preciso criar a dona com String::from ou .to_string().",
                    options: [
                        { text: "Literais só entram em funções declaradas const", isCorrect: false },
                        { text: "A função exige texto criado com String::new", isCorrect: false },
                        { text: "O literal é &str e não vira String sozinho", isCorrect: true },
                        { text: "Falta mut no parâmetro para aceitar literal", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Structs, enums e casamento de padrões",
    aulas: [
        {
            titulo: "Structs: dados com nome",
            blocks: [
                {
                    type: "text",
                    value: "# Structs: seus dados ganham nome\n\nRust não tem classes. Para agrupar valores relacionados existe a **struct**, que declara campos com nome e tipo. Depois de definir, você instancia preenchendo todos os campos:\n\n```rust\nstruct Usuario {\n    nome: String,\n    email: String,\n    ativo: bool,\n    tentativas: u32,\n}\n\nlet u = Usuario {\n    nome: String::from(\"Ana\"),\n    email: String::from(\"ana@exemplo.com\"),\n    ativo: true,\n    tentativas: 1,\n};\n\nprintln!(\"{} <{}>\", u.nome, u.email);  // acesso com ponto\n```\n\nA instância inteira é imutável ou mutável: `let mut` libera a alteração de qualquer campo, e sem `mut` nenhum muda. Não existe mutabilidade campo a campo.\n\nQuando o nome da variável coincide com o do campo, a instanciação encurta:\n\n```rust\nfn novo_usuario(nome: String, email: String) -> Usuario {\n    Usuario { nome, email, ativo: false, tentativas: 0 }\n}\n```",
                },
                {
                    type: "text",
                    value: "## Atualização com ..\n\nPara criar uma instância parecida com outra, a sintaxe de atualização `..` traz os campos que você não listou:\n\n```rust\nlet bloqueado = Usuario { ativo: false, ..u };\n```\n\nAqui entra o ownership do módulo anterior: campos de tipos donos, como `String`, são **movidos** para a nova instância; campos `Copy`, como `bool` e `u32`, são copiados. O resultado:\n\n```rust\nprintln!(\"{}\", u.tentativas);  // ok: u32 implementa Copy\nprintln!(\"{}\", u.email);        // erro: email foi movido para bloqueado\n```",
                },
                {
                    type: "code",
                    value: "struct Cor(u8, u8, u8);\nstruct Quilometros(f64);\nstruct Milhas(f64);\n\nfn viajar(distancia: Quilometros) {\n    let Quilometros(km) = distancia;\n    println!(\"viagem de {km} km\");\n}\n\nfn main() {\n    let laranja = Cor(255, 140, 0);\n    println!(\"{} {} {}\", laranja.0, laranja.1, laranja.2);  // índices com ponto\n\n    let Cor(r, _, _) = laranja;  // desconstrução por padrão\n    println!(\"{r}\");\n\n    viajar(Quilometros(42.0));\n    viajar(Milhas(3.0));  // erro: Milhas não é Quilometros\n}",
                },
                {
                    type: "text",
                    value: "## Tuple structs\n\nA **tuple struct** nomeia uma tupla: campos sem nome, acessados por índice como `laranja.0`. O uso clássico é criar um tipo novo em cima de um dado simples, o padrão *newtype*: `Quilometros` e `Milhas` guardam o mesmo `f64`, mas são tipos diferentes. Misturar um com o outro vira erro de compilação, e não um bug de unidade descoberto no cliente em produção.\n\nFeche o cinto: em codebases reais, newtypes como essa separam id de nome, centavos de reais, chave de valor. Custa uma linha e elimina uma família inteira de troca acidental de argumentos.",
                },
                {
                    type: "table",
                    value: "[[\"Forma\", \"Como declara\", \"Serve para\"], [\"Struct nomeada\", \"struct P { campo: tipo }\", \"Dados com campos identificados\"], [\"Tuple struct\", \"struct P(u8, u8)\", \"Novo tipo sobre dados simples\"], [\"Struct unitária\", \"struct P;\", \"Marcar um tipo sem dados\"]]",
                },
                {
                    type: "quote",
                    value: "A struct agrupa dados com nome, e a mutabilidade pertence à instância inteira: let mut abre todos os campos de uma vez, nada além disso.",
                },
            ],
            questions: [
                {
                    statement: "Como acessar o campo `email` de uma instância `u` do tipo Usuario?",
                    difficulty: "facil",
                    explanation: "O acesso a campos é sempre com ponto: u.email devolve o valor daquele campo na instância.",
                    options: [
                        { text: "Com `u->email`, como no C", isCorrect: false },
                        { text: "Com `u.email`, usando ponto", isCorrect: true },
                        { text: "Com `u[email]`, por índice", isCorrect: false },
                        { text: "Com `Usuario.email`, pelo tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `let v2 = Usuario { email: novo, ..u };`, de onde vêm os campos não listados?",
                    difficulty: "facil",
                    explanation: "A sintaxe de atualização .. preenche os campos que faltam com os valores de u, a instância de origem.",
                    options: [
                        { text: "De valores padrão declarados na struct", isCorrect: false },
                        { text: "De zero, vazio ou false, conforme o tipo", isCorrect: false },
                        { text: "Da instância u, um a um", isCorrect: true },
                        { text: "De lugar nenhum: não compila assim", isCorrect: false },
                    ],
                },
                {
                    statement: "Depois de `let v2 = Usuario { email: novo, ..u };`, o que faz `println!(\"{}\", u.nome);`?",
                    difficulty: "medio",
                    explanation: "nome é String, tipo dono, e a sintaxe .. move os campos não copiáveis para a nova instância. Campos Copy como tentativas seguem acessíveis, mas nome não.",
                    options: [
                        { text: "Imprime o nome de u normalmente", isCorrect: false },
                        { text: "Não compila: o campo foi movido", isCorrect: true },
                        { text: "Imprime uma String vazia no lugar", isCorrect: false },
                        { text: "Compila, só com um aviso de move", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que envolver quilometragem em `struct Quilometros(f64)` em vez de usar f64 direto?",
                    difficulty: "medio",
                    explanation: "A tuple struct cria um tipo distinto: passar Milhas onde se espera Quilometros vira erro de compilação, não um bug de unidade silencioso.",
                    options: [
                        { text: "Para acelerar a aritmética com f64", isCorrect: false },
                        { text: "Para separar Milhas de Quilometros", isCorrect: true },
                        { text: "Para aceitar casas decimais no valor", isCorrect: false },
                        { text: "Para gastar menos memória que f64", isCorrect: false },
                    ],
                },
                {
                    statement: "É possível deixar apenas um campo da struct mutável?",
                    difficulty: "dificil",
                    explanation: "A mutabilidade pertence à variável inteira: let mut libera todos os campos de uma vez. A linguagem não tem anotação de mut por campo.",
                    options: [
                        { text: "Sim, anotando mut só nesse campo", isCorrect: false },
                        { text: "Sim, se o campo for de tipo Copy", isCorrect: false },
                        { text: "Não: o mut cobre a instância toda", isCorrect: true },
                        { text: "Sim, via método que altera só ele", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Métodos e funções associadas com impl",
            blocks: [
                {
                    type: "text",
                    value: "# Comportamento mora no impl\n\nOs dados ficam na struct; o comportamento fica em um bloco `impl` separado. Dentro dele, funções que recebem `self` em alguma forma são **métodos**, chamados com ponto na instância. Funções sem `self` são **funções associadas**, chamadas com `::` no nome do tipo.\n\nÉ essa separação que substitui as classes: nada de método dentro da declaração da struct, o dado e o comportamento vivem em lugares visíveis e distintos.",
                },
                {
                    type: "code",
                    value: "struct Retangulo {\n    largura: f64,\n    altura: f64,\n}\n\nimpl Retangulo {\n    // método: lê a instância por empréstimo\n    fn area(&self) -> f64 {\n        self.largura * self.altura\n    }\n\n    // método: altera a instância\n    fn dobrar(&mut self) {\n        self.largura *= 2.0;\n        self.altura *= 2.0;\n    }\n\n    // método com parâmetro do próprio tipo\n    fn cabe_em(&self, outro: &Retangulo) -> bool {\n        self.largura <= outro.largura && self.altura <= outro.altura\n    }\n\n    // função associada: construtora, sem self\n    fn quadrado(lado: f64) -> Self {\n        Self { largura: lado, altura: lado }\n    }\n}\n\nfn main() {\n    let mut r = Retangulo::quadrado(2.0);  // Tipo::funcao\n    r.dobrar();                             // instancia.metodo\n    let sala = Retangulo { largura: 10.0, altura: 5.0 };\n    println!(\"área {} cabe {}\", r.area(), r.cabe_em(&sala));\n}",
                },
                {
                    type: "table",
                    value: "[[\"Assinatura\", \"O método recebe\", \"Uso típico\"], [\"&self\", \"Empréstimo somente leitura\", \"Ler campos sem consumir\"], [\"&mut self\", \"Empréstimo mutável\", \"Alterar campos da instância\"], [\"self\", \"A posse, de vez\", \"Transformar ou consumir o valor\"]]",
                },
                {
                    type: "text",
                    value: "## Self, :: e o ponto\n\nDentro do `impl`, `Self` é apelido para o tipo (poderia escrever `Retangulo`). Funções associadas costumam ser construtoras: `String::from`, `Vec::new` e a nossa `quadrado` seguem o mesmo formato.\n\nNa chamada de método, o ponto faz o trabalho sujo: se `area` recebe `&self`, a expressão `r.area()` já empresta `r` automaticamente, sem escrever `(&r).area()`. Rust não tem o operador `->` do C justamente por isso.\n\nUm tipo pode ter vários blocos `impl`, embora um só já cubra o dia a dia. Blocos múltiplos aparecem junto de genéricos e traits, mais adiante na trilha.",
                },
                {
                    type: "code",
                    value: "impl Retangulo {\n    // recebe self por valor: consome a instância\n    fn para_tupla(self) -> (f64, f64) {\n        (self.largura, self.altura)\n    }\n}\n\nfn main() {\n    let r = Retangulo::quadrado(3.0);\n    let (l, a) = r.para_tupla();\n    println!(\"{} x {}\", l, a);\n    println!(\"{}\", r.area());  // erro: r foi consumida por para_tupla\n}",
                },
                {
                    type: "quote",
                    value: "Método é a função que recebe self e se chama com ponto; função associada é a que não recebe e se chama com ::. String::from é o exemplo que você já usava sem saber o nome.",
                },
            ],
            questions: [
                {
                    statement: "Qual palavra-chave define o bloco de métodos de um tipo?",
                    difficulty: "facil",
                    explanation: "impl Retangulo { ... } agrupa os métodos e as funções associadas daquele tipo.",
                    options: [
                        { text: "class, como nas linguagens orientadas a objeto", isCorrect: false },
                        { text: "impl, seguido do nome do tipo", isCorrect: true },
                        { text: "trait, que depois é ligada à struct", isCorrect: false },
                        { text: "self, escrito dentro da struct", isCorrect: false },
                    ],
                },
                {
                    statement: "Como chamar a função associada `quadrado(lado: f64)`, que não recebe self?",
                    difficulty: "facil",
                    explanation: "Funções associadas são chamadas no tipo com ::, como Retangulo::quadrado(2.0), pois não há instância ainda.",
                    options: [
                        { text: "`quadrado(2.0)`, direto no escopo", isCorrect: false },
                        { text: "`Retangulo.quadrado(2.0)`, com ponto", isCorrect: false },
                        { text: "`Retangulo::quadrado(2.0)`, com ::", isCorrect: true },
                        { text: "`self::quadrado(2.0)`, via self", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa `&self` na assinatura de um método?",
                    difficulty: "medio",
                    explanation: "&self é um empréstimo somente leitura da instância: o método lê os campos sem tomar a posse nem alterar nada.",
                    options: [
                        { text: "Um empréstimo somente leitura da instância", isCorrect: true },
                        { text: "A posse da instância, consumida ao fim", isCorrect: false },
                        { text: "Uma referência mutável para alterar campos", isCorrect: false },
                        { text: "Um apelido para o tipo, como Self", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `String::from(\"olá\")` usa `::` e não ponto?",
                    difficulty: "medio",
                    explanation: "from é uma função associada de String: ela constrói a instância, e ainda não existe valor para receber um método com ponto.",
                    options: [
                        { text: "Porque from recebe &self implicitamente", isCorrect: false },
                        { text: "Porque from é associada, sem instância", isCorrect: true },
                        { text: "Porque from é macro expandida em compilação", isCorrect: false },
                        { text: "Porque o ponto exige um valor mutável", isCorrect: false },
                    ],
                },
                {
                    statement: "Um método `fn para_tupla(self)` é chamado como `r.para_tupla()`. Usar `r` de novo depois, o que dá?",
                    difficulty: "dificil",
                    explanation: "self sem & move a posse da instância para dentro do método. Depois da chamada, r deixou de ser válida e o compilador recusa o uso.",
                    options: [
                        { text: "Funciona: o valor foi copiado para o método", isCorrect: false },
                        { text: "Não compila: método não pode receber self", isCorrect: false },
                        { text: "Não compila: a posse saiu de r na chamada", isCorrect: true },
                        { text: "Compila e r volta ao valor padrão", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Enums: variantes que carregam dados",
            blocks: [
                {
                    type: "text",
                    value: "# Enums além de nomes para inteiros\n\nEm C, um enum é uma lista de nomes para números. Em Rust, cada **variante** pode carregar dados próprios, de tipos diferentes entre si:\n\n```rust\nenum EnderecoIp {\n    V4(u8, u8, u8, u8),\n    V6(String),\n}\n\nlet casa = EnderecoIp::V4(192, 168, 0, 10);\nlet servidor = EnderecoIp::V6(String::from(\"::1\"));\n```\n\nIsso faz do enum um tipo de soma: um `EnderecoIp` é um V4 com quatro bytes **ou** um V6 com texto, nunca os dois. O compilador grava uma etiqueta interna dizendo qual variante está lá, e o acesso aos dados passa pelo casamento de padrões da próxima aula. Tentar ler o `String` de um valor que é `V4` é erro de compilação, não um bug em execução.",
                },
                {
                    type: "code",
                    value: "enum Forma {\n    Circulo { raio: f64 },\n    Retangulo { largura: f64, altura: f64 },\n}\n\nimpl Forma {\n    fn area(&self) -> f64 {\n        match self {\n            Forma::Circulo { raio } => std::f64::consts::PI * raio * raio,\n            Forma::Retangulo { largura, altura } => largura * altura,\n        }\n    }\n}\n\nfn main() {\n    let forma = Forma::Circulo { raio: 2.0 };\n    println!(\"{}\", forma.area());  // 12.566370614359172\n}",
                },
                {
                    type: "text",
                    value: "## Variantes em três formatos\n\nUma variante pode vir sem dados (como `Sair`), com tupla (como `V4`) ou com campos nomeados no estilo struct (como `Circulo { raio }`). E enums têm `impl` como qualquer struct: `area` é um método normal, chamado com ponto.\n\nNa memória, o enum cabe no espaço da maior variante mais a etiqueta. `enum Ponto { A(i64), B(u8) }` ocupa um `i64` e o identificador, não a soma dos dois: as variantes dividem o mesmo espaço.",
                },
                {
                    type: "text",
                    value: "## Option: a ausência virou tipo\n\nA biblioteca padrão usa esse poder para o problema do null. Rust não tem referência nula: quando um valor pode não existir, o tipo é `Option<T>`:\n\n```rust\nenum Option<T> {\n    Some(T),\n    None,\n}\n```\n\nO erro bilionário do null, usar um valor ausente sem perceber, vira erro de compilação. Para usar o valor interno é obrigatório tratar o caso `None`, com `match`, `if let` ou métodos da própria `Option`. Ela é tão comum que `Some` e `None` já vêm no prelude, sem importar nada:\n\n```rust\nfn dividir(a: f64, b: f64) -> Option<f64> {\n    if b == 0.0 { None } else { Some(a / b) }\n}\n\nfn main() {\n    match dividir(10.0, 2.0) {\n        Some(valor) => println!(\"resultado {valor}\"),\n        None => println!(\"divisão por zero\"),\n    }\n}\n```",
                },
                {
                    type: "table",
                    value: "[[\"Conceito\", \"Em C\", \"Em Rust\"], [\"Enum\", \"Nomes para inteiros\", \"Tipo de soma com dados por variante\"], [\"Variante\", \"Um número\", \"Sem dados, tupla ou campos nomeados\"], [\"Ausência de valor\", \"Ponteiro null em execução\", \"Option<T> verificado em compilação\"]]",
                },
                {
                    type: "quote",
                    value: "No Rust a ausência tem tipo. Option<T> troca o null surpresa do runtime por um None que o compilador não deixa esquecer de tratar.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as duas variantes de `Option<T>`?",
                    difficulty: "facil",
                    explanation: "Option tem Some(T), que carrega um valor, e None, que representa a ausência dele.",
                    options: [
                        { text: "Ok(T) e Erro, como no tratamento de erros", isCorrect: false },
                        { text: "Some(T) e None", isCorrect: true },
                        { text: "Valor(T) e Nulo, tradução do null", isCorrect: false },
                        { text: "Just(T) e Nothing, de linguagens funcionais", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um enum de Rust tem que um enum de C não tem?",
                    difficulty: "medio",
                    explanation: "Cada variante Rust pode carregar dados de um tipo próprio, o que faz do enum um tipo de soma verificado em compilação.",
                    options: [
                        { text: "Nomes de variante escritos em PascalCase", isCorrect: false },
                        { text: "Conversão automática para inteiro na comparação", isCorrect: false },
                        { text: "Dados dentro de cada variante, com tipo", isCorrect: true },
                        { text: "Implementação automática de métodos comuns", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual expressão cria um valor IPv4 do enum `EnderecoIp`?",
                    difficulty: "medio",
                    explanation: "As variantes vivem no namespace do enum e se constroem com ::, como EnderecoIp::V4(192, 168, 0, 10).",
                    options: [
                        { text: "`EnderecoIp::V4(192, 168, 0, 10)`", isCorrect: true },
                        { text: "`EnderecoIp.V4(192, 168, 0, 10)`", isCorrect: false },
                        { text: "`V4(EnderecoIp, 192, 168, 0, 10)`", isCorrect: false },
                        { text: "`EnderecoIp::new(4, 192, 168, 0, 10)`", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que Rust escolheu não ter null na linguagem?",
                    difficulty: "medio",
                    explanation: "A ausência vira o tipo Option<T>: esquecer de tratar o caso vazio é erro de compilação, e não um crash em execução.",
                    options: [
                        { text: "Porque null deixa o binário mais lento", isCorrect: false },
                        { text: "Porque null é trocado por ponteiros crus", isCorrect: false },
                        { text: "Porque a ausência vira um tipo verificado", isCorrect: true },
                        { text: "Porque Option dispensa tratamento de erros", isCorrect: false },
                    ],
                },
                {
                    statement: "Quanto ocupa na memória um `enum Ponto { A(i64), B(u8) }`?",
                    difficulty: "dificil",
                    explanation: "O enum é uma união etiquetada: as variantes dividem o mesmo espaço, do tamanho da maior, mais a etiqueta que diz qual está ativa.",
                    options: [
                        { text: "A soma dos tamanhos de todas as variantes", isCorrect: false },
                        { text: "O espaço da maior variante e a etiqueta", isCorrect: true },
                        { text: "Um byte, apenas o índice da variante", isCorrect: false },
                        { text: "O tamanho da menor variante, comprimido", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Casamento de padrões com match",
            blocks: [
                {
                    type: "text",
                    value: "# match: decidir pela forma do valor\n\nO `match` compara um valor com uma série de padrões e executa o braço do primeiro que casar. A força está em o padrão enxergar **dentro** da variante e capturar os dados que ela carrega. É aqui que o enum do início da aula anterior se paga.",
                },
                {
                    type: "code",
                    value: "enum Mensagem {\n    Sair,\n    Mover { x: i32, y: i32 },\n    Escrever(String),\n}\n\nfn processar(msg: Mensagem) {\n    match msg {\n        Mensagem::Sair => println!(\"encerrando\"),\n        Mensagem::Mover { x, y } => println!(\"movendo para ({x}, {y})\"),\n        Mensagem::Escrever(texto) => println!(\"escrevendo: {texto}\"),\n    }\n}\n\nfn main() {\n    processar(Mensagem::Sair);\n    processar(Mensagem::Mover { x: 3, y: -4 });\n    processar(Mensagem::Escrever(String::from(\"olá\")));\n}",
                },
                {
                    type: "text",
                    value: "## Exaustivo por lei\n\nO `match` tem que cobrir todas as possibilidades. Esqueceu um braço, o programa não compila:\n\n```rust\nmatch msg {\n    Mensagem::Sair => println!(\"encerrando\"),\n    // erro: match não exaustivo, faltam Mover e Escrever\n}\n```\n\nIsso paga dividendos quando o enum muda: adicionar uma variante faz o compilador apontar cada `match` do projeto que precisa ser revisto. O mesmo vale para `Option`: os braços `Some` e `None` são obrigatórios.\n\nQuando os casos restantes são equivalentes, o curinga `_` casa com qualquer coisa que chegou até ele:\n\n```rust\nlet nota = 7;\nlet rotulo = match nota {\n    10 => String::from(\"nota máxima\"),\n    _ => String::from(\"demais notas\"),\n};\n```\n\nRepare que o `match` é uma expressão: produz o valor do braço executado, como o `if` do módulo 1.",
                },
                {
                    type: "code",
                    value: "fn so_texto(msg: Mensagem) {\n    // atalho para um match de um único caso\n    if let Mensagem::Escrever(texto) = msg {\n        println!(\"apenas texto: {texto}\");\n    }\n}\n\nfn extrair_texto(msg: Mensagem) {\n    // declara a ligação e manda o fluxo embora se não casar\n    let Mensagem::Escrever(texto) = msg else {\n        println!(\"não é texto\");\n        return;\n    };\n    println!(\"recebi {texto}\");\n}",
                },
                {
                    type: "text",
                    value: "## if let e let else\n\nO `if let` é açúcar para um `match` de um braço com `_ => ()`: executa o bloco só quando o padrão casa e ignora todo o resto. É a escolha certa quando um único caso interessa.\n\nO `let else` inverte a lógica: declara a ligação e desvia o fluxo quando o padrão **não** casa. O bloco `else` precisa divergir, com `return`, `panic!` ou `break`; cair para fora dele deixaria a variável sem valor, e o compilador não permite. Depois do `let else`, o binding está garantido e o código segue reto, sem aninhamento.",
                },
                {
                    type: "quote",
                    value: "O match é exaustivo por exigência do compilador. Mudou o enum, todo ponto que decidia sobre ele é reapontado em compilação, não descoberto em produção.",
                },
            ],
            questions: [
                {
                    statement: "Um `match` sobre enum cobre apenas 2 das 3 variantes. O que acontece?",
                    difficulty: "facil",
                    explanation: "O match precisa ser exaustivo: falta de braço é erro de compilação, não um caso silenciosamente ignorado.",
                    options: [
                        { text: "Compila e a variante ausente é ignorada", isCorrect: false },
                        { text: "Compila e o caso ausente entra em pânico", isCorrect: false },
                        { text: "Não compila: o match não é exaustivo", isCorrect: true },
                        { text: "Compila com um aviso de lint apenas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que faz `if let Mensagem::Escrever(t) = msg { println!(\"{t}\"); }`?",
                    difficulty: "facil",
                    explanation: "O bloco roda somente quando msg é Escrever, com t ligado ao String interno. As outras variantes caem fora, sem else.",
                    options: [
                        { text: "Executa o bloco para qualquer variante, ligando t", isCorrect: false },
                        { text: "Executa o bloco só quando msg é Escrever", isCorrect: true },
                        { text: "Converte msg em String e sempre imprime", isCorrect: false },
                        { text: "Testa as variantes em ordem até uma casar", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o `_` em um braço de `match`?",
                    difficulty: "medio",
                    explanation: "O curinga casa com qualquer valor que chegou até ele, cobrindo o resto sem listar caso a caso.",
                    options: [
                        { text: "Repete o braço imediatamente anterior", isCorrect: false },
                        { text: "Descarta o valor produzido pelo match", isCorrect: false },
                        { text: "Casa com qualquer valor restante", isCorrect: true },
                        { text: "Marca um braço que será implementado depois", isCorrect: false },
                    ],
                },
                {
                    statement: "No braço `Mensagem::Mover { x, y } => ...`, o que são `x` e `y`?",
                    difficulty: "medio",
                    explanation: "O padrão desconstrói a variante e cria as variáveis x e y ligadas aos campos, prontas para usar no braço.",
                    options: [
                        { text: "Campos mutáveis da própria variante", isCorrect: false },
                        { text: "Variáveis que capturam os campos", isCorrect: true },
                        { text: "Referências para o enum inteiro", isCorrect: false },
                        { text: "Constantes de coordenadas da std", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual regra vale para o bloco `else` de um `let ... else`?",
                    difficulty: "dificil",
                    explanation: "O else precisa divergir, com return, panic! ou break. Seguir adiante deixaria o binding sem valor, o que o compilador proíbe.",
                    options: [
                        { text: "Pode ficar vazio, sem nenhum comando", isCorrect: false },
                        { text: "Deve devolver um valor padrão do tipo", isCorrect: false },
                        { text: "Deve converter o resultado em Option", isCorrect: false },
                        { text: "Deve divergir, como return ou panic!", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Traits: contratos de comportamento",
            blocks: [
                {
                    type: "text",
                    value: "# Traits\n\nA trait define um contrato de métodos, e cada tipo decide assiná-lo com `impl Trait for Tipo`. É o mecanismo de Rust para comportamento compartilhado, o papel que interfaces e classes abstratas têm em outras linguagens, com uma diferença prática: você pode implementar a trait dos seus tipos para tipos que não escreveu, como `impl MinhaTrait for Vec<T>`.\n\nMétodos da trait podem ter **corpo padrão**: quem implementa ganha o método pronto e pode sobrescrever quando quiser.",
                },
                {
                    type: "code",
                    value: "trait Resumo {\n    fn resumir(&self) -> String;\n\n    // corpo padrão: pode até chamar os métodos obrigatórios\n    fn avisar(&self) {\n        println!(\"novo texto: {}\", self.resumir());\n    }\n}\n\nstruct Artigo {\n    titulo: String,\n    autor: String,\n}\n\nimpl Resumo for Artigo {\n    fn resumir(&self) -> String {\n        format!(\"{} (por {})\", self.titulo, self.autor)\n    }\n}\n\nfn main() {\n    let a = Artigo { titulo: String::from(\"Rust 1.0\"), autor: String::from(\"Ana\") };\n    println!(\"{}\", a.resumir());\n    a.avisar();  // implementação padrão, herdada da trait\n}",
                },
                {
                    type: "text",
                    value: "## Genéricos com trait bounds\n\nUma função genérica pode exigir que o tipo cumpra uma trait. Duas escritas para o mesmo bound:\n\n```rust\nfn notificar(item: &impl Resumo) {\n    println!(\"novo: {}\", item.resumir());\n}\n\nfn newsletter<T: Resumo>(primeiro: &T, segundo: &T) {\n    notificar(primeiro);\n    notificar(segundo);\n}\n```\n\n`&impl Resumo` é a forma curta: cada parâmetro aceita qualquer tipo que assine a trait. Com `<T: Resumo>`, os dois parâmetros dividem o mesmo `T`: `primeiro` e `segundo` precisam ser do mesmo tipo concreto. A forma longa também combina vários bounds, como `<T: Resumo + Clone>`, e aparece bastante no módulo de genéricos.",
                },
                {
                    type: "text",
                    value: "## Traits que você já cruzou\n\nTrês traits da std aparecem todo dia:\n\n- **Debug** habilita a impressão de depuração com `{:?}`. Basta anotar `#[derive(Debug)]` acima da struct e o compilador escreve a implementação por você.\n- **Display** é a impressão bonita, a das chaves `{}`. Essa não pode ser derivada: o formato para quem lê é decisão sua, e vai num `impl fmt::Display` manual.\n- **From** declara conversão de um tipo para outro. Implementar `From<f64> for Celsius` dá de brinde o método `.into()`, por causa de uma implementação genérica da std que conecta os dois traits:\n\n```rust\n#[derive(Debug)]\nstruct Celsius(f64);\n\nimpl From<f64> for Celsius {\n    fn from(valor: f64) -> Self {\n        Celsius(valor)\n    }\n}\n\nlet c: Celsius = 36.6.into();  // f64 vira Celsius\nprintln!(\"{c:?}\");             // Celsius(36.6)\n```",
                },
                {
                    type: "table",
                    value: "[[\"Trait\", \"O que oferece\", \"Como obter\"], [\"Debug\", \"Impressão {:?} para depuração\", \"#[derive(Debug)]\"], [\"Display\", \"Impressão {} para quem lê\", \"impl fmt::Display manual\"], [\"From\", \"Conversão de tipos, ganha .into()\", \"impl From<De> for Para\"]]",
                },
                {
                    type: "quote",
                    value: "Trait é contrato, impl Trait for Tipo é a assinatura. Funções genéricas com bound aceitam qualquer assinante, resolvido em compilação.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma trait em Rust?",
                    difficulty: "facil",
                    explanation: "Trait define um contrato de métodos que qualquer tipo pode assinar com impl Trait for Tipo, o papel de interface compartilhada.",
                    options: [
                        { text: "Um contrato de métodos que tipos assinam", isCorrect: true },
                        { text: "Uma struct sem campos, só comportamento", isCorrect: false },
                        { text: "Um módulo de funções da biblioteca padrão", isCorrect: false },
                        { text: "Um enum cujas variantes têm métodos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa um método com corpo escrito direto na trait?",
                    difficulty: "medio",
                    explanation: "É um método padrão: todo tipo que implementa a trait já o recebe pronto, e pode sobrescrever se quiser.",
                    options: [
                        { text: "Que o método é obrigatório em cada impl", isCorrect: false },
                        { text: "Que o método vale só para tipos da std", isCorrect: false },
                        { text: "Que todos herdam esse corpo, com opção de trocar", isCorrect: true },
                        { text: "Que o método só roda via chamada explícita da trait", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `#[derive(Debug)]` faz por uma struct?",
                    difficulty: "facil",
                    explanation: "O derive gera a implementação de Debug em compilação, o que habilita imprimir a struct com {:?} na depuração.",
                    options: [
                        { text: "Gera o impl de Debug para imprimir com {:?}", isCorrect: true },
                        { text: "Gera o impl de Display para imprimir com {}", isCorrect: false },
                        { text: "Remove avisos de campos não usados", isCorrect: false },
                        { text: "Prepara a struct para virar JSON", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `fn f(a: &impl R, b: &impl R)` e `fn f<T: R>(a: &T, b: &T)`?",
                    difficulty: "medio",
                    explanation: "Cada &impl é um genérico anônimo independente, então a e b podem ter tipos diferentes. Com T único, os dois precisam ser do mesmo tipo.",
                    options: [
                        { text: "Nenhuma: as duas formas geram código idêntico", isCorrect: false },
                        { text: "Na segunda, a e b são sempre do mesmo tipo", isCorrect: true },
                        { text: "Na primeira, só tipos da std são aceitos", isCorrect: false },
                        { text: "Na segunda, a trait R passa a ser opcional", isCorrect: false },
                    ],
                },
                {
                    statement: "Implementar `From<f64> for Celsius` garante qual capacidade extra?",
                    difficulty: "dificil",
                    explanation: "A std conecta os dois traits: quem tem From ganha Into de graça, e .into() converte f64 em Celsius quando o destino está anotado.",
                    options: [
                        { text: "Comparar valores com == entre os dois tipos", isCorrect: false },
                        { text: "Usar .into() para converter em Celsius", isCorrect: true },
                        { text: "Imprimir Celsius com formatação Display", isCorrect: false },
                        { text: "Criar o construtor Celsius::new(f64)", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Erros e coleções",
    aulas: [
        {
            titulo: "Option: a ausência de valor sem null",
            blocks: [
                {
                    type: "text",
                    value: "# A ausência de valor como tipo\n\nO null é chamado de \"o erro de um bilhão de dólares\" pelo próprio inventor, Tony Hoare. O problema: em linguagens com null, qualquer referência pode estar vazia, e o compilador não tem como distinguir a que com certeza tem valor da que talvez não tenha. Um if esquecido vira crash em produção.\n\nO Rust simplesmente não tem null. Ausência é um tipo:\n\n```rust\nenum Option<T> {\n    Some(T),\n    None,\n}\n```\n\n`Option<T>` avisa na assinatura: esta função pode não devolver valor. E o compilador cobra do chamador os dois casos antes de soltar o dado:\n\n```rust\nlet talvez: Option<i32> = Some(5);\n\nmatch talvez {\n    Some(n) => println!(\"valor {n}\"),\n    None => println!(\"nada aqui\"),\n}\n```",
                },
                {
                    type: "code",
                    value: "fn divisao(a: f64, b: f64) -> Option<f64> {\n    if b == 0.0 {\n        None\n    } else {\n        Some(a / b)\n    }\n}\n\nfn main() {\n    match divisao(10.0, 0.0) {\n        Some(r) => println!(\"resultado: {r}\"),\n        None => println!(\"não existe divisão por zero\"),\n    }\n}",
                },
                {
                    type: "text",
                    value: "## unwrap e expect: o atalho com risco\n\n`unwrap()` devolve o valor interno de um `Some` e **entra em pânico** se a Option for `None`. `expect(\"mensagem\")` faz o mesmo, mas o pânico carrega a sua mensagem:\n\n```rust\nlet porta: Option<u16> = Some(8080);\nlet p = porta.unwrap();                     // 8080\n\nlet host: Option<&str> = None;\n// host.unwrap();                           // erro: pânico em tempo de execução\nlet h = host.expect(\"HOST é obrigatório\");  // pânico com essa mensagem, se rodar\n```\n\nQuando usar? Em protótipos, exemplos e testes, ou quando uma invariante garante o valor (você verificou duas linhas acima). Em código de produção que lê entrada externa, não: arquivo ausente, campo vazio e resposta fora do formato são `None` reais, e pânico derruba o processo inteiro por uma falha tratável.",
                },
                {
                    type: "text",
                    value: "## map e and_then: transformar sem casar\n\nToda vez que um `match` serve só para aplicar uma operação ao valor interno, há combinador que faz menos barulho. `map` aplica a função dentro de `Some` e devolve `None` intacto (a função nem roda). `and_then` encadeia funções que já devolvem Option:\n\n```rust\nlet talvez = Some(5);\nlet dobro = talvez.map(|n| n * 2);          // Some(10)\n\nlet ausente: Option<i32> = None;\nlet ignora = ausente.map(|n| n * 2);        // None\n\nfn para_inteiro(s: &str) -> Option<i32> {\n    s.parse().ok()                          // Result -> Option\n}\n\nlet entrada = Some(\"7\");\nlet n = entrada.and_then(para_inteiro)      // Some(7)\n               .map(|x| x * 3);             // Some(21)\n```\n\nPor que `and_then` e não `map` aqui? `para_inteiro` devolve `Option<i32>`; com `map` o resultado seria `Option<Option<i32>>`, uma caixa dentro da outra. `and_then` achata: passa o valor adiante e devolve a Option já plana.",
                },
                {
                    type: "table",
                    value: "[[\"Método\", \"O que faz\", \"Diante de None\"], [\"unwrap\", \"Devolve o valor interno\", \"Entra em pânico\"], [\"expect\", \"Devolve o valor com mensagem própria\", \"Entra em pânico com a mensagem\"], [\"map\", \"Aplica função ao valor interno\", \"Devolve None, sem executar a função\"], [\"and_then\", \"Encadeia função que retorna Option\", \"Devolve None, sem executar a função\"]]",
                },
                {
                    type: "quote",
                    value: "Ausência em Rust é um tipo como outro qualquer: aparece na assinatura, o compilador cobra o tratamento, e o pânico de unwrap vira decisão sua, não surpresa.",
                },
            ],
            questions: [
                {
                    statement: "Qual problema o Rust evita ao não ter null na linguagem?",
                    difficulty: "facil",
                    explanation: "Com null, toda referência pode estar vazia e o compilador não distingue a garantida da talvez vazia; com Option, a ausência vira tipo e o tratamento é cobrado em compilação.",
                    options: [
                        { text: "A lentidão das pausas do coletor de lixo", isCorrect: false },
                        { text: "Erros de sintaxe em expressões muito longas", isCorrect: false },
                        { text: "O uso de uma referência vazia em execução", isCorrect: true },
                        { text: "A impossibilidade de representar listas vazias", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `let n: i32 = Some(5).unwrap();`, o que acontece?",
                    difficulty: "facil",
                    explanation: "unwrap devolve o valor interno do Some, então n recebe 5. Se a Option fosse None, haveria pânico em execução.",
                    options: [
                        { text: "n recebe 5, o valor dentro do Some", isCorrect: true },
                        { text: "n recebe Some(5) encapsulado", isCorrect: false },
                        { text: "Erro de compilação: tipos não batem", isCorrect: false },
                        { text: "Pânico, pois unwrap exige None", isCorrect: false },
                    ],
                },
                {
                    statement: "Dado `let x: Option<i32> = None;`, o que devolve `x.map(|n| n * 2)`?",
                    difficulty: "medio",
                    explanation: "map só aplica a função quando há Some; com None ele propaga None e a closure nem chega a executar.",
                    options: [
                        { text: "Some(0), com None tratado como zero", isCorrect: false },
                        { text: "None, e a closure não executa", isCorrect: true },
                        { text: "Um pânico por operar sem valor", isCorrect: false },
                        { text: "Erro de compilação: map exige Some", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando trocar `map` por `and_then` numa Option?",
                    difficulty: "medio",
                    explanation: "Se a função de transformação já devolve Option, map aninha uma Option na outra; and_then achata e devolve Option<T> direto, como um flat_map.",
                    options: [
                        { text: "Quando a função de transformação devolve Option", isCorrect: true },
                        { text: "Quando o valor vem dentro de um Result, não Option", isCorrect: false },
                        { text: "Quando a closure deve rodar também em None", isCorrect: false },
                        { text: "Quando o valor interno precisa ser mutado no lugar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o valor de `n` após `let n = Some(\"7\").and_then(|s| s.parse().ok()).map(|x| x * 3);`?",
                    difficulty: "dificil",
                    explanation: "parse transforma \"7\" em Ok(7) e .ok() vira Some(7); and_then achata o encadeamento e map multiplica por 3, resultando em Some(21).",
                    options: [
                        { text: "Some(21)", isCorrect: true },
                        { text: "Some(7)", isCorrect: false },
                        { text: "None", isCorrect: false },
                        { text: "Erro de compilação: and_then exige Result", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Result e o operador ?",
            blocks: [
                {
                    type: "text",
                    value: "# Erros como valores: Result\n\nMuitas falhas não são bugs: arquivo que não existe, texto que não é número, rede que caiu. O Rust trata essas falhas como **valores normais**, devolvidos pela função:\n\n```rust\nenum Result<T, E> {\n    Ok(T),\n    Err(E),\n}\n```\n\n`Ok` carrega o sucesso, `Err` carrega a falha, e o tipo do erro `E` faz parte do contrato da função:\n\n```rust\nuse std::num::ParseIntError;\n\nfn para_idade(s: &str) -> Result<u8, ParseIntError> {\n    s.parse::<u8>()\n}\n```\n\nDá para tratar com `match`, como em Option. O problema é o efeito escada: cada chamada que pode falhar adiciona um match inteiro, e a lógica de verdade afunda na indentação.",
                },
                {
                    type: "code",
                    value: "use std::num::ParseIntError;\n\nfn soma_parse(a: &str, b: &str) -> Result<i32, ParseIntError> {\n    let x = match a.parse::<i32>() {\n        Ok(n) => n,\n        Err(e) => return Err(e),\n    };\n    let y = match b.parse::<i32>() {\n        Ok(n) => n,\n        Err(e) => return Err(e),\n    };\n    Ok(x + y)\n}",
                },
                {
                    type: "text",
                    value: "## O operador ? propaga o erro\n\nO `?` troca a escada por uma linha. Ele extrai o valor de `Ok`; se a expressão for `Err`, a função retorna esse erro na hora:\n\n```rust\nuse std::num::ParseIntError;\n\nfn soma_parse(a: &str, b: &str) -> Result<i32, ParseIntError> {\n    let x = a.parse::<i32>()?;    // Err aqui interrompe e retorna\n    let y = b.parse::<i32>()?;\n    Ok(x + y)\n}\n```\n\nPor baixo, `a.parse::<i32>()?` é o match que você escreveria à mão:\n\n```rust\nlet x = match a.parse::<i32>() {\n    Ok(v) => v,\n    Err(e) => return Err(e),\n};\n```\n\nA exigência: o `?` só existe em função que devolve `Result` ou `Option` compatível com a expressão. Ele devolve cedo, nunca engole.",
                },
                {
                    type: "text",
                    value: "## ? também funciona com Option\n\nO operador não é exclusivo de Result. Numa função que devolve `Option`, o `?` extrai o valor de `Some` e retorna `None` quando falta:\n\n```rust\nfn dobro_do_ultimo(v: &[i32]) -> Option<i32> {\n    let ultimo = v.last()?;       // None aqui interrompe e retorna\n    Some(*ultimo * 2)\n}\n```\n\nMisturar os dois mundos não compila: `?` sobre Option em função que devolve Result é rejeitado, e vice-versa. Para atravessar a fronteira, converta antes: `result.ok()` vira Option, `option.ok_or(erro)` vira Result.",
                },
                {
                    type: "text",
                    value: "## main devolvendo Result\n\nEm programas pequenos e scripts, tratar cada erro à mão é burocracia. O truque oficial: declarar o `main` retornando `Result`, e usar `?` à vontade:\n\n```rust\nuse std::fs;\n\nfn main() -> Result<(), std::io::Error> {\n    let conteudo = fs::read_to_string(\"config.txt\")?;\n    println!(\"{} bytes lidos\", conteudo.len());\n    Ok(())\n}\n```\n\nSe algum `?` propagar um `Err`, o runtime imprime a mensagem de erro (com o Display do tipo) e o processo termina com código de saída de falha. Nada de unwrap espalhado para o mesmo efeito.",
                },
                {
                    type: "quote",
                    value: "O ? não engole erro: ele devolve a falha para quem pode decidir. A assinatura da função continua dizendo a verdade.",
                },
            ],
            questions: [
                {
                    statement: "O que o operador `?` faz quando a expressão resulta em `Err`?",
                    difficulty: "facil",
                    explanation: "O ? faz a função retornar o Err imediatamente, propagando o erro para o chamador sem continuar a execução.",
                    options: [
                        { text: "Descarta o Err e devolve um Ok vazio", isCorrect: false },
                        { text: "Retorna o Err na hora para o chamador", isCorrect: true },
                        { text: "Segue a execução com um valor padrão", isCorrect: false },
                        { text: "Faz o programa entrar em pânico no ponto", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais são as duas variantes de `Result<T, E>`?",
                    difficulty: "facil",
                    explanation: "Result tem Ok(T) para o sucesso e Err(E) para a falha, com o tipo do erro fazendo parte do contrato.",
                    options: [
                        { text: "Some(T) e None", isCorrect: false },
                        { text: "Just(T) e Nothing", isCorrect: false },
                        { text: "Success(T) e Failure(E)", isCorrect: false },
                        { text: "Ok(T) e Err(E)", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual é a exigência para usar `?` em uma expressão dentro de uma função?",
                    difficulty: "medio",
                    explanation: "O ? devolve cedo com o erro, então a função precisa ter retorno compatível: Result ou Option do mesmo tipo da expressão.",
                    options: [
                        { text: "A função precisa devolver Result ou Option", isCorrect: true },
                        { text: "A expressão precisa estar dentro de um loop", isCorrect: false },
                        { text: "A função precisa ser marcada como async", isCorrect: false },
                        { text: "O tipo do erro precisa implementar a trait Copy", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `fn main() -> Result<(), std::io::Error>`, o que acontece se o `?` propagar um Err?",
                    difficulty: "medio",
                    explanation: "O runtime do main trata o Err devolvido: imprime a mensagem do erro e encerra o processo com código de saída diferente de zero.",
                    options: [
                        { text: "A compilação falha: main não aceita Err", isCorrect: false },
                        { text: "O erro é descartado e o programa sai com zero", isCorrect: false },
                        { text: "Imprime o erro e encerra com código de falha", isCorrect: true },
                        { text: "O Rust troca o retorno por um pânico com backtrace", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao propagar um erro com `?`, o que acontece com o tipo dele?",
                    difficulty: "dificil",
                    explanation: "O desugar do ? chama From::from no erro, convertendo-o para o tipo de erro do retorno da função quando existe uma conversão.",
                    options: [
                        { text: "Nada: precisa ser idêntico ao tipo do retorno", isCorrect: false },
                        { text: "Passa por From::from até o tipo do retorno", isCorrect: true },
                        { text: "É descartado e um erro genérico é criado no lugar", isCorrect: false },
                        { text: "É sempre convertido em Box<dyn Error>", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Pânico ou erro recuperável?",
            blocks: [
                {
                    type: "text",
                    value: "# Dois mundos de falha\n\nO Rust separa as falhas em duas famílias. O **pânico** é para bug e situação irrecuperável: invariante interno quebrado, estado impossível. Não há o que tratar; o processo aborta e a mensagem aponta a linha. O **erro recuperável**, via `Result`, é para falha esperada do domínio: arquivo ausente, entrada inválida, timeout. O chamador decide o que fazer.\n\n```rust\nfn conferir_versao(v: u32) {\n    if v < 4 {\n        panic!(\"versão {v} não suportada, use 4 ou maior\");\n    }\n}\n```\n\nA pergunta que decide: **o chamador pode fazer algo útil com essa falha?** Se sim, Result. Se a única saída é consertar o código, pânico.",
                },
                {
                    type: "text",
                    value: "## expect e unreachable\n\n`expect` é o unwrap com mensagem: o pânico mostra o que você escreveu, e achar a origem deixa de ser caça a número de linha. `unreachable!` marca trecho que a lógica garante inalcançável; se um dia rodar, o pânico acusa a invariante quebrada:\n\n```rust\nlet valor: Option<i32> = Some(3);\nlet v = valor.expect(\"valor validado duas linhas acima\");\n\nfn cor_rgb(nome: &str) -> [u8; 3] {\n    match nome {\n        \"vermelho\" => [255, 0, 0],\n        \"verde\" => [0, 255, 0],\n        _ => unreachable!(\"nome filtrado antes da chamada\"),\n    }\n}\n```\n\nOs três compartilham a ideia: quando o código entra em pânico, o recado é \"tem bug aqui\", não \"o usuário errou\".",
                },
                {
                    type: "text",
                    value: "## Erros como valores: a trait Error\n\nErro em Rust é um valor comum que implementa a trait `std::error::Error`. Um tipo de erro seu descreve as falhas do domínio e carrega os dados do problema:\n\n```rust\nuse std::fmt;\n\n#[derive(Debug)]\nenum ErroNota {\n    Vazio,\n    ForaDaFaixa(i32),\n}\n\nimpl fmt::Display for ErroNota {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        match self {\n            ErroNota::Vazio => write!(f, \"nota não preenchida\"),\n            ErroNota::ForaDaFaixa(n) => write!(f, \"nota {n} fora da faixa 0 a 10\"),\n        }\n    }\n}\n\nimpl std::error::Error for ErroNota {}\n```\n\nCom `Debug` e `Display` implementados, a trait Error vem de graça, e o seu erro conversa com o resto do ecossistema.",
                },
                {
                    type: "text",
                    value: "## Box<dyn Error> e map_err\n\nQuando o objetivo é só propagar (um script, um binário pequeno), `Box<dyn Error>` aceita qualquer erro concreto:\n\n```rust\nuse std::error::Error;\n\nfn main() -> Result<(), Box<dyn Error>> {\n    let n: i32 = \"42\".parse()?;                    // ParseIntError entra na caixa\n    let texto = std::fs::read_to_string(\"dados.txt\")?;\n    println!(\"{n} e {} bytes\", texto.len());\n    Ok(())\n}\n```\n\nEntre erros de tipos diferentes, `map_err` adapta o erro antes de devolvê-lo, sem tocar no valor de sucesso:\n\n```rust\nuse std::num::ParseIntError;\n\n#[derive(Debug)]\nenum ErroApp {\n    IdadeInvalida(String),\n}\n\nfn idade_de(s: &str) -> Result<u8, ErroApp> {\n    s.parse::<u8>()\n        .map_err(|e| ErroApp::IdadeInvalida(format!(\"{s}: {e}\")))\n}\n```",
                },
                {
                    type: "table",
                    value: "[[\"Situação\", \"Ferramenta\"], [\"Arquivo de configuração ausente\", \"Result\"], [\"Entrada do usuário inválida\", \"Result\"], [\"Índice errado por bug de lógica\", \"panic\"], [\"Braço de match que nunca deveria rodar\", \"unreachable!\"], [\"Propagar qualquer erro em um binário\", \"Box<dyn Error>\"]]",
                },
                {
                    type: "quote",
                    value: "Pânico sinaliza bug seu; Result sinaliza falha do mundo. Escolher entre os dois é decisão de design, não detalhe de sintaxe.",
                },
            ],
            questions: [
                {
                    statement: "Qual pergunta decide entre pânico e erro recuperável?",
                    difficulty: "facil",
                    explanation: "Se o chamador pode reagir à falha (tentar de novo, avisar o usuário), ela é recuperável e vira Result; se a única saída é consertar o código, pânico.",
                    options: [
                        { text: "O chamador pode fazer algo útil com a falha?", isCorrect: true },
                        { text: "A falha acontece com frequência ou raramente?", isCorrect: false },
                        { text: "O erro vem de código próprio ou de biblioteca?", isCorrect: false },
                        { text: "A função roda em threads ou em async?", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `expect(\"cache inicializado\")` faz de diferente de `unwrap()`?",
                    difficulty: "facil",
                    explanation: "Ambos entram em pânico com o valor ausente, mas o expect inclui a mensagem recebida, o que facilita localizar a origem.",
                    options: [
                        { text: "Devolve None em vez de entrar em pânico", isCorrect: false },
                        { text: "Tenta reconstruir ou recalcular o valor ausente", isCorrect: false },
                        { text: "Só funciona com Result, não com Option", isCorrect: false },
                        { text: "Inclui a mensagem no pânico, se faltar valor", isCorrect: true },
                    ],
                },
                {
                    statement: "Para que serve `Box<dyn Error>` em uma assinatura?",
                    difficulty: "medio",
                    explanation: "É um trait object que aceita qualquer tipo que implemente Error, permitindo propagar erros de origens diferentes sem listar cada tipo.",
                    options: [
                        { text: "Evitar que o erro seja alocado no heap", isCorrect: false },
                        { text: "Aceitar erros de vários tipos no retorno", isCorrect: true },
                        { text: "Transformar pânicos em valores de retorno", isCorrect: false },
                        { text: "Obrigar o chamador a tratar o erro na hora", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `map_err` faz com um Result?",
                    difficulty: "medio",
                    explanation: "map_err aplica uma função ao valor de Err e devolve o Result com o erro transformado; o Ok atravessa intacto.",
                    options: [
                        { text: "Transforma o valor de Ok, mantendo o Err", isCorrect: false },
                        { text: "Converte o Result em Option descartando o erro", isCorrect: false },
                        { text: "Transforma o valor de Err, mantendo o Ok", isCorrect: true },
                        { text: "Executa um efeito colateral e devolve igual", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `unreachable!()` sinaliza no braço final de um match?",
                    difficulty: "dificil",
                    explanation: "É uma afirmação de invariante: esse caminho nunca deveria executar. Se executar, o pânico acusa que a premissa quebrou.",
                    options: [
                        { text: "Que a lógica garante que o braço nunca roda", isCorrect: true },
                        { text: "Que o compilador remove o braço no build release", isCorrect: false },
                        { text: "Que o valor de retorno do braço é o tipo unit", isCorrect: false },
                        { text: "Que o compilador emite um aviso em tempo de build", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Vec: a lista que cresce",
            blocks: [
                {
                    type: "text",
                    value: "# A coleção do dia a dia\n\n`Vec<T>` é a lista que cresce: guarda os elementos lado a lado no heap e realoca quando a capacidade acaba. Três jeitos de criar:\n\n```rust\nlet mut v: Vec<i32> = Vec::new();                // vazia\nv.push(10);\nv.push(20);\n\nlet notas = vec![8, 9, 10];                       // já com valores\nlet mut buf: Vec<u8> = Vec::with_capacity(1024);  // reserva antes\n```\n\n`vec![]` para começar com itens, `Vec::new()` para preencher aos poucos, `with_capacity(n)` quando o tamanho final é conhecido e você quer poupar realocações. `v.len()` devolve quantos elementos há, `v.is_empty()` se não há nenhum.",
                },
                {
                    type: "text",
                    value: "## Acesso: colchetes x get\n\nO indexador é direto e **entra em pânico** com índice inválido:\n\n```rust\nlet v = vec![10, 20, 30];\nlet segundo = v[1];       // 20\n\n// let quarto = v[3];     // erro: pânico em tempo de execução, index out of bounds\n```\n\nQuando o índice vem de fora (usuário, arquivo), prefira `get`, que devolve `Option` e liga com tudo o que você viu nas aulas de erro:\n\n```rust\nmatch v.get(3) {\n    Some(n) => println!(\"quarto: {n}\"),\n    None => println!(\"não existe quarto elemento\"),\n}\n```",
                },
                {
                    type: "text",
                    value: "## Percorrer: for, referência e enumerate\n\n`for item in &v` **empresta** a coleção: cada item é uma referência e `v` continua vivo depois do laço. `for item in v` **move**: os elementos são consumidos, e o Vec deixa de existir ao final:\n\n```rust\nlet nomes = vec![\"ana\".to_string(), \"bia\".to_string()];\n\nfor n in &nomes {\n    println!(\"{n}\");            // n é &String\n}\n// nomes ainda serve aqui\n\nfor n in nomes {\n    println!(\"{n}\");            // cada String é consumida\n}\n// println!(\"{}\", nomes.len());   // erro: nomes foi movida para o for\n```",
                },
                {
                    type: "code",
                    value: "fn main() {\n    let linguas = vec![\"Rust\", \"Python\", \"Go\"];\n\n    for (i, nome) in linguas.iter().enumerate() {\n        println!(\"{i}: {nome}\");\n    }\n    // 0: Rust\n    // 1: Python\n    // 2: Go\n}",
                },
                {
                    type: "text",
                    value: "## Remover elementos\n\n`remove(i)` tira o elemento da posição e **desloca os seguintes para a esquerda**, operação O(n). `retain` mantém só o que passa no teste e remove o resto numa passada só, sem bagunçar índice:\n\n```rust\nlet mut v = vec![10, 20, 30, 40, 55];\n\nv.remove(0);                  // [20, 30, 40, 55], os outros andaram\nv.retain(|&n| n % 2 == 0);    // [20, 30, 40], só os pares sobrevivem\n```\n\nRemover de dentro de um `for` sobre o próprio Vec é armadilha: o iterador perde a noção do tamanho. `retain` existe exatamente para esse caso.",
                },
                {
                    type: "quote",
                    value: "Vec combina com o resto da linguagem: index entra em pânico quando o índice é um bug, get devolve Option quando ele é entrada.",
                },
            ],
            questions: [
                {
                    statement: "Um Vec com 5 elementos recebe `v[10]`. O que acontece?",
                    difficulty: "facil",
                    explanation: "A indexação com colchetes não devolve Option: índice fora dos limites é pânico imediato em tempo de execução.",
                    options: [
                        { text: "Devolução de None para o chamador", isCorrect: false },
                        { text: "Erro de compilação de tipo inválido", isCorrect: false },
                        { text: "Pânico: índice fora dos limites", isCorrect: true },
                        { text: "Retorno do último elemento da lista", isCorrect: false },
                    ],
                },
                {
                    statement: "Como acessar uma posição do Vec sem risco de pânico?",
                    difficulty: "facil",
                    explanation: "get devolve Option<&T>: Some quando o índice é válido, None quando não é, deixando a ausência tratável.",
                    options: [
                        { text: "v.get(i), que devolve Option", isCorrect: true },
                        { text: "v.at(i), que devolve Option", isCorrect: false },
                        { text: "v.safe(i), que devolve o valor ou zero", isCorrect: false },
                        { text: "v[i] com o índice convertido para usize", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `for x in &v` e `for x in v`?",
                    difficulty: "medio",
                    explanation: "O primeiro percorre por referência e a coleção sobrevive ao laço; o segundo move a coleção para o iterador, consumindo os elementos.",
                    options: [
                        { text: "O primeiro copia os itens; o segundo clona o Vec", isCorrect: false },
                        { text: "O primeiro empresta a coleção; o segundo move", isCorrect: true },
                        { text: "Nenhuma: geram exatamente o mesmo código", isCorrect: false },
                        { text: "O segundo exige que o Vec seja mut", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `v.retain(|&n| n % 2 == 0)` faz com o Vec?",
                    difficulty: "medio",
                    explanation: "retain remove, na própria coleção, todo elemento que falha no teste; aqui só os pares permanecem.",
                    options: [
                        { text: "Remove o primeiro elemento par encontrado", isCorrect: false },
                        { text: "Devolve um novo Vec sem alterar o original", isCorrect: false },
                        { text: "Ordena o Vec deixando os pares nas primeiras posições", isCorrect: false },
                        { text: "Mantém só os elementos que passam no teste", isCorrect: true },
                    ],
                },
                {
                    statement: "Por que `v.remove(0)` em um Vec grande custa caro?",
                    difficulty: "dificil",
                    explanation: "Vec guarda elementos lado a lado; tirar o primeiro exige deslocar todos os seguintes uma posição, operação O(n).",
                    options: [
                        { text: "Os elementos seguintes são deslocados uma casa", isCorrect: true },
                        { text: "O Vec realoca o buffer pela metade da capacidade", isCorrect: false },
                        { text: "O hash do índice precisa ser recalculado", isCorrect: false },
                        { text: "A memória do item removido fica vazando", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "HashMap: valor por chave",
            blocks: [
                {
                    type: "text",
                    value: "# Chaves em vez de índices\n\n`HashMap<K, V>` guarda pares chave-valor com busca por hash, sem ordem garantida entre as chaves. Vem de `std::collections`:\n\n```rust\nuse std::collections::HashMap;\n\nlet mut notas = HashMap::new();\nnotas.insert(\"Ana\", 9);\nnotas.insert(\"Bia\", 8);\n```\n\nA leitura é por `get`, que devolve `Option<&V>` porque a chave pode não existir:\n\n```rust\nmatch notas.get(\"Caio\") {\n    Some(n) => println!(\"nota {n}\"),\n    None => println!(\"Caio sem nota\"),\n}\n```",
                },
                {
                    type: "text",
                    value: "## entry e or_insert\n\nO ingrediente dos mapas que contam coisas é a entrada: `entry(chave)` devolve a posição ocupada ou vazia daquela chave, e `or_insert(valor)` preenche a vazia e devolve uma referência mutável `&mut V` ao valor, novo ou existente. Uma ida só resolve os dois casos.",
                },
                {
                    type: "code",
                    value: "use std::collections::HashMap;\n\nfn main() {\n    let texto = \"o rust é rápido o rust é seguro\";\n    let mut contagem: HashMap<&str, i32> = HashMap::new();\n\n    for palavra in texto.split_whitespace() {\n        let contador = contagem.entry(palavra).or_insert(0);\n        *contador += 1;\n    }\n\n    println!(\"{contagem:?}\");\n    // {\"o\": 2, \"rust\": 2, \"é\": 2, \"rápido\": 1, \"seguro\": 1}\n}",
                },
                {
                    type: "text",
                    value: "## Por que não get seguido de insert\n\nA tentativa ingênua seria `if let Some(n) = contagem.get(palavra)` e, no else, um `insert`. O problema é o empréstimo: `get` segura um borrow imutável do mapa enquanto o `insert` pede um mutável, e o borrow checker barra a dança. `entry` devolve a referência mutável direto, criando a chave se preciso, sem conflito.",
                },
                {
                    type: "text",
                    value: "## Chaves têm dono\n\nChave e valor entram no mapa por valor: uma `String` movida para dentro deixa de existir fora. E os tipos de chave precisam implementar `Hash + Eq`, o que cobre `String`, `&str`, inteiros e os seus tipos com `#[derive(PartialEq, Eq, Hash)]`:\n\n```rust\nlet mut mapa = HashMap::new();\nlet nome = String::from(\"Ana\");\nmapa.insert(nome, 9);\n// println!(\"{nome}\");   // erro: a String agora pertence ao mapa\n```\n\nPara atualizar, `get_mut` devolve referência mutável ao valor, e `insert` com chave existente **substitui** o valor e devolve o antigo:\n\n```rust\nlet mut estoque = HashMap::new();\nestoque.insert(\"caneta\", 10);\nlet anterior = estoque.insert(\"caneta\", 25);   // Some(10)\n\nif let Some(qtd) = estoque.get_mut(\"caneta\") {\n    *qtd += 5;                                 // 30, sem recriar a chave\n}\n```",
                },
                {
                    type: "quote",
                    value: "HashMap e Option nasceram um para o outro: chave ausente não é exceção, é None, e a linguagem inteira já sabe lidar.",
                },
            ],
            questions: [
                {
                    statement: "O que `map.get(&chave)` devolve quando a chave existe?",
                    difficulty: "facil",
                    explanation: "get devolve Option<&V>: Some com uma referência ao valor quando a chave existe, None quando não existe.",
                    options: [
                        { text: "O valor V diretamente", isCorrect: false },
                        { text: "Um bool dizendo se existe", isCorrect: false },
                        { text: "Option<&V> contendo o valor", isCorrect: true },
                        { text: "Result<&V, E> para tratar a ausência", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao chamar `insert` com uma chave que já existe no HashMap, o que acontece?",
                    difficulty: "facil",
                    explanation: "O insert substitui o valor da chave e devolve o antigo dentro de um Some; a chave não é duplicada.",
                    options: [
                        { text: "Os valores são somados em um novo", isCorrect: false },
                        { text: "O valor é substituído e o antigo é devolvido", isCorrect: true },
                        { text: "A inserção é ignorada para proteger o dado", isCorrect: false },
                        { text: "Erro em tempo de execução de chave duplicada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `entry(chave).or_insert(0)` garante?",
                    difficulty: "medio",
                    explanation: "A entrada é localizada uma única vez: se a chave não existe, o valor 0 é criado; em ambos os casos devolve &mut V para atualizar.",
                    options: [
                        { text: "Uma &mut ao valor, com 0 inserido se faltar", isCorrect: true },
                        { text: "Inserção de 0 mesmo quando a chave já está lá", isCorrect: false },
                        { text: "Uma Option<&V> devolvida sem alterar o mapa", isCorrect: false },
                        { text: "Remoção automática da chave com valor zero", isCorrect: false },
                    ],
                },
                {
                    statement: "Após `mapa.insert(nome, 9)` com `nome` do tipo String, o que acontece com a variável?",
                    difficulty: "medio",
                    explanation: "A String é movida para dentro do mapa, que passa a ser o dono dela; usar nome depois é erro de compilação.",
                    options: [
                        { text: "Ela passa a apontar para o valor dentro do mapa", isCorrect: false },
                        { text: "O mapa guarda uma cópia e nome segue usável", isCorrect: false },
                        { text: "Erro de compilação: String não pode ser chave", isCorrect: false },
                        { text: "Ela foi movida para o mapa e não serve mais", isCorrect: true },
                    ],
                },
                {
                    statement: "Por que a contagem de palavras usa `entry().or_insert()` em vez de `get` seguido de `insert`?",
                    difficulty: "dificil",
                    explanation: "O get segura um empréstimo imutável do mapa e o insert pede um mutável, o que o borrow checker barra; entry entrega o &mut V sem conflito.",
                    options: [
                        { text: "Porque insert não aceita i32 como valor", isCorrect: false },
                        { text: "Porque get não funciona com chaves do tipo &str", isCorrect: false },
                        { text: "Porque entry ordena o mapa pela frequência", isCorrect: false },
                        { text: "Porque o borrow do get conflita com o insert", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Genéricos, lifetimes, closures e iterators",
    aulas: [
        {
            titulo: "Genéricos: uma função, muitos tipos",
            blocks: [
                {
                    type: "text",
                    value: "# Funções genéricas\n\nImagine escrever `maior_i32` para achar o maior número de uma lista e, logo depois, `maior_str` com o mesmo laço para textos. Genéricos eliminam a duplicação: você escreve a lógica uma vez e deixa o tipo como parâmetro da função:\n\n```rust\nfn maior<T: PartialOrd>(lista: &[T]) -> &T\n```\n\nO `<T>` declara o **parâmetro de tipo**. Na chamada, o compilador olha os argumentos e decide quem é T: `i32` para um vetor de números, `&str` para um vetor de palavras. O bound `T: PartialOrd` avisa que T precisa saber se comparar, porque o corpo usa `>`. Sem esse contrato, o compilador rejeita a operação.",
                },
                {
                    type: "code",
                    value: "fn maior<T: PartialOrd>(lista: &[T]) -> &T {\n    let mut maior_ate_agora = &lista[0];\n    for item in lista {\n        if item > maior_ate_agora {\n            maior_ate_agora = item;\n        }\n    }\n    maior_ate_agora\n}\n\nfn main() {\n    let numeros = vec![4, 17, 3, 9];\n    let nomes = vec![\"ana\", \"bruno\", \"carla\"];\n\n    println!(\"{}\", maior(&numeros)); // 17\n    println!(\"{}\", maior(&nomes));   // carla\n}",
                },
                {
                    type: "text",
                    value: "## Monomorfização: custo zero em runtime\n\nOnde está a mágica? Não há mágica: ao compilar, o Rust **monomorfiza** o código, gerando uma cópia concreta da função para cada tipo usado. `maior(&numeros)` vira uma função de `i32`, `maior(&nomes)` vira uma de `&str`, e cada versão é otimizada como se tivesse sido escrita à mão. Nada de indireção ou boxing quando o código roda.\n\nO preço aparece no tamanho do binário, que cresce um pouquinho a cada instanciação. Em troca, genérico em Rust é tão rápido quanto código específico de cada tipo.\n\nO bound não é enfeite. Retire-o e a função quebra:\n\n```rust\nfn maior<T>(lista: &[T]) -> &T {\n    let mut m = &lista[0];\n    for item in lista {\n        if item > m { // erro: > não existe para um T qualquer\n            m = item;\n        }\n    }\n    m\n}\n```\n\nA mensagem do compilador aponta a linha do `>` e sugere adicionar `PartialOrd`. O contrato na assinatura é o que libera o operador dentro do corpo.",
                },
                {
                    type: "text",
                    value: "## Genéricos em structs e enums\n\nTipos compostos também aceitam parâmetros:\n\n```rust\nstruct Ponto<T> {\n    x: T,\n    y: T,\n}\n```\n\nNo `impl`, o parâmetro precisa ser declarado de novo para poder aparecer em `Self` e nos métodos. E dá para escrever um bloco só para um tipo concreto, como `Ponto<f64>`: os métodos dele nem existem para outros T.\n\nVocê convive com isso desde o começo da trilha: `Option<T>` é um enum genérico com as variantes `Some(T)` e `None`, `Result<T, E>` guarda `Ok(T)` ou `Err(E)`, e `Vec<T>` é uma struct genérica que cresce. A biblioteca padrão é construída nesse mecanismo.",
                },
                {
                    type: "code",
                    value: "struct Ponto<T> {\n    x: T,\n    y: T,\n}\n\nimpl<T> Ponto<T> {\n    fn novo(x: T, y: T) -> Self {\n        Ponto { x, y }\n    }\n}\n\nimpl Ponto<f64> {\n    fn distancia_da_origem(&self) -> f64 {\n        (self.x * self.x + self.y * self.y).sqrt()\n    }\n}\n\nfn main() {\n    let inteiro = Ponto::novo(3, 4);\n    let real = Ponto::novo(3.0, 4.0);\n\n    println!(\"({}, {})\", inteiro.x, inteiro.y); // (3, 4)\n    println!(\"{}\", real.distancia_da_origem());  // 5\n}",
                },
                {
                    type: "quote",
                    value: "Genérico em Rust é promessa de código específico: a monomorfização gera uma função concreta e otimizada para cada tipo usado, sem custo em runtime.",
                },
            ],
            questions: [
                {
                    statement: "O que o `<T>` na assinatura `fn maior<T: PartialOrd>(lista: &[T]) -> &T` representa?",
                    difficulty: "facil",
                    explanation: "T é um parâmetro de tipo: a função é escrita uma vez e o compilador instancia a versão concreta de acordo com o tipo passado em cada chamada.",
                    options: [
                        { text: "Um tipo concreto da biblioteca padrão, como Vec", isCorrect: false },
                        { text: "Um parâmetro de tipo, escolhido conforme o uso", isCorrect: true },
                        { text: "Uma marcação de que a função é insegura", isCorrect: false },
                        { text: "O nome do trait que a função implementa", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `maior` só compila com o bound `T: PartialOrd`?",
                    difficulty: "medio",
                    explanation: "O operador > só existe para tipos que implementam PartialOrd. O bound faz essa promessa ao compilador, que então libera a comparação no corpo.",
                    options: [
                        { text: "Porque referências só existem para tipos comparáveis", isCorrect: false },
                        { text: "Porque o vetor precisa estar ordenado antes da busca", isCorrect: false },
                        { text: "Porque o corpo usa >, operação definida no trait", isCorrect: true },
                        { text: "Porque todo parâmetro genérico exige PartialOrd", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a monomorfização faz com uma função genérica?",
                    difficulty: "medio",
                    explanation: "O compilador gera uma cópia concreta e otimizada da função para cada tipo com que ela é usada, o que elimina qualquer indireção em runtime.",
                    options: [
                        { text: "Gera uma cópia concreta para cada tipo com que ela é usada", isCorrect: true },
                        { text: "Substitui o tipo genérico por um trait object com vtable", isCorrect: false },
                        { text: "Deixa a decisão do tipo para a primeira chamada em runtime", isCorrect: false },
                        { text: "Compila a função uma única vez usando reflection", isCorrect: false },
                    ],
                },
                {
                    statement: "`Option<T>`, da biblioteca padrão, é um exemplo de quê?",
                    difficulty: "facil",
                    explanation: "Option é um enum genérico: a variante Some carrega um valor de qualquer tipo T e None representa a ausência.",
                    options: [
                        { text: "Struct genérica com capacidade de crescimento", isCorrect: false },
                        { text: "Enum genérico, com as variantes Some(T) e None", isCorrect: true },
                        { text: "Macro que verifica nulidade em tempo de execução", isCorrect: false },
                        { text: "Trait implementado por todos os tipos primitivos", isCorrect: false },
                    ],
                },
                {
                    statement: "Com `struct Par<T> { a: T, b: T }`, o que acontece ao criar `Par { a: 7, b: \"sete\" }`?",
                    difficulty: "dificil",
                    explanation: "Na mesma instância, os dois campos usam o mesmo T, então a e b precisam ser do mesmo tipo. Para tipos diferentes, a struct precisaria de dois parâmetros, como Par<T, U>.",
                    options: [
                        { text: "Compila: T aceita inteiro e texto ao mesmo tempo", isCorrect: false },
                        { text: "Compila: b é convertido para i32 automaticamente", isCorrect: false },
                        { text: "Não compila: a e b precisam ser do mesmo tipo T", isCorrect: true },
                        { text: "Não compila: Par exige que T implemente Display", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Trait bounds: contratos para tipos genéricos",
            blocks: [
                {
                    type: "text",
                    value: "# Genéricos com contrato\n\nUm tipo genérico sozinho não consegue fazer nada: sem saber quem é T, o compilador não sabe se T sabe se imprimir ou se comparar. Trait bounds fecham esse contrato. `T: Display` promete que qualquer T aceito implementa `Display`:\n\n```rust\nfn aviso<T: Display>(item: T) {\n    println!(\"ATENÇÃO: {item}\");\n}\n```\n\nA forma curta para o mesmo contrato é `impl Trait` na posição do parâmetro:\n\n```rust\nfn aviso(item: impl Display) {\n    println!(\"ATENÇÃO: {item}\");\n}\n```\n\nAs duas assinaturas são equivalentes. A segunda lê melhor quando há um parâmetro só; a primeira continua necessária quando o mesmo T aparece em vários parâmetros e os tipos precisam bater entre si.",
                },
                {
                    type: "code",
                    value: "use std::fmt::Display;\n\nfn aviso(item: impl Display) {\n    println!(\"ATENÇÃO: {item}\");\n}\n\nfn compara<T: Display + PartialEq>(a: T, b: T) {\n    if a == b {\n        println!(\"{a} e {b} são iguais\");\n    } else {\n        println!(\"{a} e {b} são diferentes\");\n    }\n}\n\nfn main() {\n    aviso(42);         // ATENÇÃO: 42\n    compara(7, 7);     // 7 e 7 são iguais\n    compara(\"a\", \"b\"); // a e b são diferentes\n}",
                },
                {
                    type: "text",
                    value: "## Bounds múltiplos e a cláusula where\n\nO `+` empilha requisitos: `T: Display + PartialEq` exige os dois traits. Com vários genéricos, a assinatura vira sopa de letrinhas. A cláusula `where` move os bounds para baixo e mantém a leitura limpa:\n\n```rust\nfn resumo<T, U>(nome: T, versao: U) -> String\nwhere\n    T: Display,\n    U: Display,\n{\n    format!(\"{nome} v{versao}\")\n}\n```\n\nSemântica idêntica, ergonomia muito melhor. O `impl` de uma struct também aceita bound, e aí os métodos daquele bloco só existem para tipos que cumprem o contrato:\n\n```rust\nstruct Par<T> {\n    a: T,\n    b: T,\n}\n\nimpl<T: PartialEq> Par<T> {\n    fn iguais(&self) -> bool {\n        self.a == self.b\n    }\n}\n```\n\nAqui `iguais` existe para `Par<i32>`; um T sem `PartialEq` simplesmente não ganha esse método.",
                },
                {
                    type: "code",
                    value: "use std::fmt::Display;\n\nfn resumo<T, U>(nome: T, versao: U) -> String\nwhere\n    T: Display,\n    U: Display,\n{\n    format!(\"{nome} v{versao}\")\n}\n\nstruct Par<T> {\n    a: T,\n    b: T,\n}\n\nimpl<T: PartialEq> Par<T> {\n    fn iguais(&self) -> bool {\n        self.a == self.b\n    }\n}\n\nfn main() {\n    println!(\"{}\", resumo(\"gerador\", 3)); // gerador v3\n\n    let par = Par { a: 4, b: 4 };\n    println!(\"{}\", par.iguais()); // true\n}",
                },
                {
                    type: "text",
                    value: "## impl Trait no retorno\n\nTambém dá para devolver `impl Trait`, padrão comum em funções que criam iterators:\n\n```rust\nfn contagem_regressiva(de: i32) -> impl Iterator<Item = i32> {\n    (0..de).rev()\n}\n```\n\nO chamador sabe o que recebe (um iterator de i32) sem precisar escrever o tipo concreto, que seria `Rev<Range<i32>>`.\n\nA limitação é importante: `impl Trait` se compromete com **um único tipo concreto**. Não vale alternar tipos no retorno:\n\n```rust\nfn transforma(x: i32) -> impl Display {\n    if x > 0 { x } else { \"não positivo\" } // erro: i32 e &str no mesmo retorno\n}\n```\n\nPara devolver tipos diferentes conforme o caminho, o caminho é `Box<dyn Display>`, pagando uma alocação e uma indireção.",
                },
                {
                    type: "quote",
                    value: "Trait bound é contrato declarado na assinatura: quem lê a função vê de imediato o que o tipo precisa saber fazer.",
                },
            ],
            questions: [
                {
                    statement: "O que significa o parâmetro `item: impl Display` numa função?",
                    difficulty: "facil",
                    explanation: "impl Display na posição do parâmetro aceita qualquer tipo que implemente o trait, o mesmo efeito de escrever <T: Display>.",
                    options: [
                        { text: "Aceita qualquer tipo que implemente Display", isCorrect: true },
                        { text: "Aceita apenas tipos primitivos que viram texto", isCorrect: false },
                        { text: "Converte o item para String antes de executar", isCorrect: false },
                        { text: "Exige que o chamador passe um trait object", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a relação entre `fn f(x: impl Display)` e `fn f<T: Display>(x: T)`?",
                    difficulty: "medio",
                    explanation: "impl Trait em parâmetro é açúcar sintático: o compilador gera exatamente o genérico com bound equivalente.",
                    options: [
                        { text: "A forma genérica aceita qualquer tipo; impl Trait restringe a um só", isCorrect: false },
                        { text: "São equivalentes: impl Trait é a forma curta do genérico com bound", isCorrect: true },
                        { text: "impl Trait permite devolver tipos diferentes por chamada", isCorrect: false },
                        { text: "A forma genérica é obrigatória em funções com dois parâmetros", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que situação a cláusula `where` é a escolha natural?",
                    difficulty: "medio",
                    explanation: "where move os bounds para baixo da assinatura, o que clareia funções com vários genéricos e bounds empilhados com +.",
                    options: [
                        { text: "Quando a função não recebe parâmetros genéricos", isCorrect: false },
                        { text: "Quando se quer remover um bound herdado da struct", isCorrect: false },
                        { text: "Somente em impls de traits para tipos locais", isCorrect: false },
                        { text: "Quando há vários genéricos e bounds empilhados", isCorrect: true },
                    ],
                },
                {
                    statement: "A função `fn transforma(x: i32) -> impl Display { if x > 0 { x } else { \"não positivo\" } }` não compila. Por quê?",
                    difficulty: "dificil",
                    explanation: "impl Trait no retorno compromete a função com um único tipo concreto, e os ramos produzem i32 e &str. Para alternar tipos, seria preciso Box<dyn Display>.",
                    options: [
                        { text: "impl Trait aceita um tipo só, e os ramos devolvem dois", isCorrect: true },
                        { text: "impl Display nunca é aceito como tipo de retorno de função", isCorrect: false },
                        { text: "if sem else não pode produzir valor em Rust", isCorrect: false },
                        { text: "Literais de string como esse não implementam Display", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `fn conta<T: PartialEq>(agulha: &T, palheiro: &[T]) -> usize` exige o bound PartialEq?",
                    difficulty: "facil",
                    explanation: "O corpo compara elementos com ==, e a igualdade é definida no trait PartialEq; sem o bound o compilador não garante a operação.",
                    options: [
                        { text: "Para permitir ordenar o palheiro antes de contar", isCorrect: false },
                        { text: "Porque fatias só aceitam tipos comparáveis", isCorrect: false },
                        { text: "Porque o corpo compara itens com o operador ==", isCorrect: true },
                        { text: "Para garantir que T também implemente Display", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Lifetimes: o prazo de validade das referências",
            blocks: [
                {
                    type: "text",
                    value: "# Referências com prazo de validade\n\nO borrow checker já impediu você de usar dados movidos e de mutar durante um empréstimo. Falta a terceira pergunta: **por quanto tempo essa referência é válida?** Toda referência tem um lifetime, o trecho do programa em que o dado por trás dela está garantidamente vivo.\n\nO alvo do compilador é a referência pendurada: apontar para memória já liberada. A maior parte da verificação acontece sem você anotar nada; quando o compilador não consegue provar sozinho, ele pede a anotação.",
                },
                {
                    type: "code",
                    value: "fn main() {\n    let r;\n    {\n        let s = String::from(\"rust\");\n        r = &s;\n    } // s sai de escopo e sua memória é liberada\n    println!(\"{r}\"); // erro: r apontaria para memória já liberada\n}",
                },
                {
                    type: "text",
                    value: "## Anotando a relação entre lifetimes\n\nLifetime não muda quanto tempo um valor vive; descreve a **relação entre referências** para o compilador conferir. O caso clássico é uma função que devolve um dos dois parâmetros:\n\n```rust\nfn maior<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() >= y.len() { x } else { y }\n}\n```\n\nO `'a` liga o retorno aos dois parâmetros: o resultado vale apenas **enquanto x e y viverem**, ou seja, pelo menor dos dois prazos. Com esse contrato na assinatura, o compilador rejeita na hora qualquer uso do resultado depois que um dos textos sai de cena.\n\nUm lifetime famoso é o `'static`, que dura o programa inteiro: literais de string como \"rust\" moram no binário e podem ser emprestados para sempre.",
                },
                {
                    type: "text",
                    value: "## Elisão: o caso comum nem anota\n\nSe toda função com referências exigisse `'a`, o Rust seria ilegível. As **regras de elisão** cobrem os casos comuns sem anotação:\n\n1. Cada parâmetro de referência ganha um lifetime próprio.\n2. Se existe um único parâmetro de referência, o retorno recebe o lifetime dele.\n3. Em métodos, o lifetime de `&self` vai para o retorno.\n\nPor isso isto compila sem nenhuma anotação:\n\n```rust\nfn primeira_palavra(s: &str) -> &str {\n    s.split_whitespace().next().unwrap_or(\"\")\n}\n```\n\nUm parâmetro por referência e um retorno emprestado dele: a regra 2 resolve sozinha. A anotação só entra quando o compilador não consegue deduzir, tipicamente com dois parâmetros dos quais o retorno pode vir.",
                },
                {
                    type: "text",
                    value: "## Structs que guardam referências\n\nUma struct pode emprestar em vez de possuir, e aí o lifetime entra na declaração:\n\n```rust\nstruct Excerto<'a> {\n    texto: &'a str,\n}\n\nimpl<'a> Excerto<'a> {\n    fn anuncia(&self) {\n        println!(\"destaque: {}\", self.texto);\n    }\n}\n\nfn main() {\n    let romance = String::from(\"Era uma vez uma linguagem sem medo\");\n    let e = Excerto { texto: &romance };\n    e.anuncia();\n}\n```\n\nO contrato vale para a struct inteira: a instância de `Excerto` não pode viver mais que o `romance` que ela empresta. Tentar devolver um `Excerto` montado sobre uma String local da função é rejeitado na compilação. Quando o empréstimo incomodar mais que a posse, trocar `&'a str` por `String` resolve pagando uma alocação.",
                },
                {
                    type: "quote",
                    value: "Lifetime é anotação de verificação, não código gerado: escrever 'a não estende nada, só declara de onde o empréstimo vem para o compilador aprovar ou barrar.",
                },
            ],
            questions: [
                {
                    statement: "O que uma anotação de lifetime como `'a` realmente faz?",
                    difficulty: "facil",
                    explanation: "A anotação descreve a relação entre referências para a verificação do compilador; ela não altera o tempo de vida de nenhum valor.",
                    options: [
                        { text: "Informa ao compilador a relação entre as referências", isCorrect: true },
                        { text: "Estende o tempo de vida do valor apontado pela referência", isCorrect: false },
                        { text: "Move o valor para a heap em vez da stack", isCorrect: false },
                        { text: "Torna a referência imutável de forma permanente", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `fn maior<'a>(x: &'a str, y: &'a str) -> &'a str`, o que o `'a` do retorno determina?",
                    difficulty: "medio",
                    explanation: "O retorno fica ligado aos dois parâmetros e só pode ser usado dentro da interseção dos lifetimes, na prática o menor dos dois.",
                    options: [
                        { text: "O resultado é copiado para o chamador com prazo próprio", isCorrect: false },
                        { text: "O resultado só pode ser usado enquanto x e y forem válidos", isCorrect: true },
                        { text: "O resultado vive enquanto a função maior existir no binário", isCorrect: false },
                        { text: "O resultado recebe o lifetime do parâmetro mais longo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `fn primeira_palavra(s: &str) -> &str` compila sem anotação de lifetime?",
                    difficulty: "medio",
                    explanation: "Pela segunda regra de elisão: com um único parâmetro de referência, o compilador aplica o lifetime dele ao retorno.",
                    options: [
                        { text: "Porque &str não passa pelas regras de borrow", isCorrect: false },
                        { text: "Porque o compilador insere um 'static implícito no retorno", isCorrect: false },
                        { text: "Porque a função não devolve a referência recebida", isCorrect: false },
                        { text: "A elisão aplica ao retorno o lifetime do único parâmetro", isCorrect: true },
                    ],
                },
                {
                    statement: "Em `struct Excerto<'a> { texto: &'a str }`, o que o `'a` garante para quem usa a struct?",
                    difficulty: "dificil",
                    explanation: "O borrow checker passa a exigir que o texto emprestado sobre viva a instância de Excerto, impedindo que a struct fique pendurada.",
                    options: [
                        { text: "A instância não pode viver mais que o texto emprestado", isCorrect: true },
                        { text: "A struct copia o texto para dentro de si ao ser criada", isCorrect: false },
                        { text: "texto precisa ser um literal embutido no binário", isCorrect: false },
                        { text: "Excerto só pode existir dentro de funções genéricas", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `let s: &'static str = \"rust\";` pode ser lido em qualquer ponto do programa?",
                    difficulty: "facil",
                    explanation: "Literais de string são dados gravados no binário, com lifetime 'static, válidos do início ao fim da execução.",
                    options: [
                        { text: "O compilador duplica o literal em cada escopo de uso", isCorrect: false },
                        { text: "O literal mora no binário e vive o programa inteiro", isCorrect: true },
                        { text: "Toda string criada com String::from também é 'static", isCorrect: false },
                        { text: "'static renova a validade da referência a cada acesso", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Closures: funções que carregam o ambiente",
            blocks: [
                {
                    type: "text",
                    value: "# Funções que lembram o entorno\n\nClosures são funções anônimas que capturam variáveis do ambiente onde foram criadas. A sintaxe usa barras verticais no lugar dos parênteses:\n\n```rust\nlet soma_um = |x: i32| -> i32 { x + 1 };\nlet dobro = |x| x * 2; // tipos inferidos pelo uso\n```\n\nA diferença para uma função `fn` é justamente a captura: uma closure pode usar as variáveis que estavam por perto quando ela nasceu. Tipos de parâmetro e retorno geralmente são inferidos; anote quando a inferência não tiver informação para decidir.",
                },
                {
                    type: "code",
                    value: "fn main() {\n    let limite = 50;\n\n    let acima = |x: i32| x > limite; // captura limite por referência\n    println!(\"{}\", acima(60)); // true\n    println!(\"{}\", acima(41)); // false\n\n    let saudacao = || println!(\"olá de novo\"); // sem parâmetros\n    saudacao();\n}",
                },
                {
                    type: "text",
                    value: "## Como a closure captura\n\nO compilador escolhe sempre a forma mais restritiva que funciona: primeiro tenta emprestar imutável, depois mutável, e só captura por valor quando não há outro jeito.\n\n```rust\nlet mut contador = 0;\nlet mut incrementa = || contador += 1; // captura por referência mutável\nincrementa();\nincrementa();\nprintln!(\"{contador}\"); // 2\n```\n\nQuando a closure precisa sobreviver ao escopo atual, o caso típico é uma thread, `move` transfere a posse do que for capturado:\n\n```rust\nuse std::thread;\n\nlet dados = vec![1, 2, 3];\nlet alca = thread::spawn(move || println!(\"{dados:?}\"));\nalca.join().unwrap();\n```\n\nSem o `move`, o compilador reclama que `dados` pode morrer antes da thread rodar. E depois de um move, a variável original pertence à closure:\n\n```rust\nlet lista = vec![1, 2, 3];\nlet mostra = move || println!(\"{lista:?}\");\nmostra();\nprintln!(\"{:?}\", lista); // erro: lista foi movida para dentro da closure\n```\n\nCada forma de capturar corresponde a um trait, e é com eles que closures viram parâmetros de função.",
                },
                {
                    type: "table",
                    value: "[[\"Trait\", \"Captura o ambiente\", \"Restrição de chamada\"], [\"Fn\", \"Por referência imutável\", \"Quantas vezes quiser\"], [\"FnMut\", \"Por referência mutável\", \"Várias vezes, exigindo &mut na closure\"], [\"FnOnce\", \"Por valor, consumindo\", \"No máximo uma vez\"]]",
                },
                {
                    type: "text",
                    value: "## Closures como parâmetros\n\nCada closure que você escreve recebe do compilador um tipo anônimo único. Por isso funções que recebem closures usam `impl Trait` com um dos três traits acima:\n\n```rust\nfn aplica_duas_vezes(f: impl Fn(i32) -> i32, valor: i32) -> i32 {\n    f(f(valor))\n}\n\nfn main() {\n    println!(\"{}\", aplica_duas_vezes(|x| x + 10, 5)); // 25\n}\n```\n\n`impl Fn` aceita qualquer closure que apenas leia o ambiente, as mais comuns. Para guardar closures em structs ou devolver tipos diferentes de closure, o caminho é `Box<dyn Fn(i32) -> i32>`.\n\nOs traits formam uma escadinha: toda `Fn` é também `FnMut` e `FnOnce`. Onde pedem `FnMut`, uma `Fn` serve; onde pedem `FnOnce`, qualquer uma serve.",
                },
                {
                    type: "quote",
                    value: "Closure é função com memória do lugar onde nasceu: o compilador empresta o ambiente por padrão, e o move entrega a posse quando a viagem é mais longa.",
                },
            ],
            questions: [
                {
                    statement: "O que uma closure pode fazer que uma função `fn` comum não pode?",
                    difficulty: "facil",
                    explanation: "A closure captura variáveis do ambiente onde foi definida, algo que funções fn não fazem.",
                    options: [
                        { text: "Capturar variáveis do ambiente onde nasceu", isCorrect: true },
                        { text: "Ser passada como argumento para outra função", isCorrect: false },
                        { text: "Retornar uma referência com lifetime anotado", isCorrect: false },
                        { text: "Ser chamada sem parênteses na invocação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual linha declara uma closure que devolve o dobro do parâmetro?",
                    difficulty: "facil",
                    explanation: "A sintaxe de closure usa barras verticais para listar parâmetros, como em |x| x * 2.",
                    options: [
                        { text: "let dobro = fn(x) x * 2;", isCorrect: false },
                        { text: "let dobro = (x) => x * 2;", isCorrect: false },
                        { text: "let dobro = |x| x * 2;", isCorrect: true },
                        { text: "dobro(x) = x * 2;", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a palavra `move` muda numa closure?",
                    difficulty: "medio",
                    explanation: "move força a captura por valor, transferindo a posse das variáveis, o necessário ao enviar dados para outra thread.",
                    options: [
                        { text: "Captura as variáveis por valor, tomando a posse delas", isCorrect: true },
                        { text: "Empresta as variáveis de forma imutável, como o padrão", isCorrect: false },
                        { text: "Adia a captura até a primeira chamada da closure", isCorrect: false },
                        { text: "Clona as variáveis a cada invocação da closure", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que funções que recebem closures costumam declarar `f: impl Fn(i32) -> i32`?",
                    difficulty: "medio",
                    explanation: "Cada closure tem um tipo anônimo único gerado pelo compilador; impl Fn aceita qualquer uma com a assinatura pedida.",
                    options: [
                        { text: "Porque uma closure nunca pode ser passada por valor", isCorrect: false },
                        { text: "Cada closure tem um tipo anônimo, aceito via impl Trait", isCorrect: true },
                        { text: "Porque Fn é o único trait que closures implementam", isCorrect: false },
                        { text: "Para impedir que a closure capture variáveis do ambiente", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma closure que apenas lê as variáveis capturadas pode ser usada onde o parâmetro exige `F: FnMut`?",
                    difficulty: "dificil",
                    explanation: "Os traits têm hierarquia: Fn exige FnMut, que exige FnOnce. Toda Fn serve onde pedem FnMut.",
                    options: [
                        { text: "Sim: Fn é subtrait de FnMut, então toda Fn é FnMut", isCorrect: true },
                        { text: "Não: uma closure implementa Fn ou FnMut, nunca os dois", isCorrect: false },
                        { text: "Somente quando a closure é declarada com move", isCorrect: false },
                        { text: "Somente embrulhando a closure em um Box<dyn FnMut>", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Iterators: a pipeline preguiçosa",
            blocks: [
                {
                    type: "text",
                    value: "# O trait Iterator\n\nPercorrer coleções em Rust passa por um trait só:\n\n```rust\ntrait Iterator {\n    type Item;\n    fn next(&mut self) -> Option<Self::Item>;\n}\n```\n\nCada chamada de `next` devolve `Some(item)` ou `None` quando acaba, nunca pânico nem valor inválido. Como `next` pede `&mut self`, o iterador é dono do próprio progresso e a variável precisa ser `mut`. Implemente `next` e você ganha de graça dezenas de métodos: `map`, `filter`, `sum`, `count`, `collect`.\n\nO `type Item` é um tipo associado: declara qual o tipo dos itens sem tornar o trait genérico.",
                },
                {
                    type: "code",
                    value: "fn main() {\n    let v = vec![1, 2, 3];\n    let mut it = v.iter();\n\n    println!(\"{:?}\", it.next()); // Some(1)\n    println!(\"{:?}\", it.next()); // Some(2)\n    println!(\"{:?}\", it.next()); // Some(3)\n    println!(\"{:?}\", it.next()); // None\n    println!(\"{:?}\", v);         // vetor intacto: iter() só emprestou\n}",
                },
                {
                    type: "text",
                    value: "## Preguiçosos por natureza\n\nIterators são **lazy**: criar um iterador ou empilhar adaptadores não percorre nada. `map` e `filter` devolvem novos iteradores que só envelopam o anterior; o trabalho acontece no consumidor, o método que realmente exige os valores:\n\n```rust\nlet v = vec![1, 2, 3, 4, 5];\n\nlet dobrados = v.iter().map(|x| x * 2); // nada foi calculado ainda\nlet resultado: Vec<i32> = dobrados.collect(); // agora sim\n```\n\n`collect` junta os itens na coleção do destino. Como ele sabe construir `Vec`, `String`, `HashMap` e outros, o tipo de destino precisa estar claro: na variável (`let x: Vec<i32>`) ou no turbofish `collect::<Vec<i32>>()`. Sem isso, o compilador não sabe qual coleção você quer:\n\n```rust\nlet pares: Vec<&i32> = v.iter().filter(|x| *x % 2 == 0).collect();\n```",
                },
                {
                    type: "code",
                    value: "fn main() {\n    let v = vec![1, 2, 3, 4, 5];\n\n    let soma: i32 = v.iter().sum(); // 15, anotação necessária\n    let total = v.iter().count(); // 5\n    let pares = v.iter().filter(|x| *x % 2 == 0).count(); // 2\n    let gauss: i32 = (1..=100).sum(); // 5050\n\n    println!(\"{soma} {total} {pares} {gauss}\");\n}",
                },
                {
                    type: "text",
                    value: "## Empréstimo ou posse no loop\n\nTrês formas de pegar um iterador de um `Vec<T>`, uma para cada modo de acesso que você já conhece:\n\n- `v.iter()`: itens `&T`, o vetor continua utilizável\n- `v.iter_mut()`: itens `&mut T`, permite alterar no caminho\n- `v.into_iter()`: itens `T`, o vetor é consumido\n\nO `for` conversa com isso por meio do trait `IntoIterator`:\n\n```rust\nlet v = vec![1, 2, 3];\n\nfor x in &v {\n    println!(\"{x}\"); // x é &i32; v segue viva\n}\n\nprintln!(\"{:?}\", v); // ok: o laço só emprestou\n\nfor x in v {\n    println!(\"{x}\"); // x é i32; a posse foi transferida\n}\n\nprintln!(\"{:?}\", v); // erro: v foi consumida pelo laço anterior\n```\n\nRanges são iterators natos: `0..5` e `0..=5` entregam os números sob demanda, sem alocar coleção nenhuma.",
                },
                {
                    type: "quote",
                    value: "Um iterador é uma pergunta adiada: adaptadores como map e filter descrevem o cálculo, e só o consumidor, collect, sum ou for, faz o trabalho acontecer.",
                },
            ],
            questions: [
                {
                    statement: "O que o método `next` de um iterador devolve?",
                    difficulty: "facil",
                    explanation: "next devolve um Option: Some(item) enquanto há elementos e None ao esgotar, sem pânico.",
                    options: [
                        { text: "O próximo item, causando pânico ao esgotar", isCorrect: false },
                        { text: "Um Option: Some(item) ou None quando esgota", isCorrect: true },
                        { text: "Um bool que diz se ainda restam elementos", isCorrect: false },
                        { text: "Um Result com erro quando a iteração termina", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `v.iter()` e `v.into_iter()`?",
                    difficulty: "facil",
                    explanation: "iter empresta os itens e devolve &T, mantendo o vetor utilizável; into_iter consome o vetor e devolve T por valor.",
                    options: [
                        { text: "iter empresta os itens; into_iter consome o vetor", isCorrect: true },
                        { text: "iter percorre de trás para frente; into_iter na ordem", isCorrect: false },
                        { text: "into_iter pula os elementos nulos antes de percorrer", isCorrect: false },
                        { text: "iter cria uma cópia do vetor antes de percorrer", isCorrect: false },
                    ],
                },
                {
                    statement: "Sozinha, sem collect nem for, a expressão `v.iter().map(|x| x * 2)` faz o quê?",
                    difficulty: "medio",
                    explanation: "map é um adaptador lazy: só monta a pipeline de transformação, e nada roda até um consumidor pedir os valores.",
                    options: [
                        { text: "Percorre o vetor e guarda os resultados num novo Vec", isCorrect: false },
                        { text: "Soma todos os valores transformados e devolve um i32", isCorrect: false },
                        { text: "Nada: adaptadores são lazy e só montam a pipeline", isCorrect: true },
                        { text: "Compila mas entra em pânico por falta de consumidor", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `collect` costuma vir com anotação de tipo, como em `let v: Vec<i32> = it.collect();`?",
                    difficulty: "medio",
                    explanation: "collect implementa FromIterator para várias coleções possíveis; a anotação (ou o turbofish) diz qual destino construir.",
                    options: [
                        { text: "Porque sem anotação o collect sempre devolve um Vec", isCorrect: false },
                        { text: "A anotação é exigida apenas quando há map na pipeline", isCorrect: false },
                        { text: "Porque o iterador perde a informação dos tipos dos itens", isCorrect: false },
                        { text: "Porque a anotação escolhe qual das coleções construir", isCorrect: true },
                    ],
                },
                {
                    statement: "Dado `let v = vec![1, 2, 3];`, seguido de `for x in v { println!(\"{x}\"); }` e depois `println!(\"{:?}\", v);`, o que acontece?",
                    difficulty: "dificil",
                    explanation: "O for x in v aciona into_iter e move o vetor; usá-lo depois é rejeitado como qualquer outro move.",
                    options: [
                        { text: "Compila, e o segundo println imprime o vetor de novo", isCorrect: false },
                        { text: "Não compila: o for consumiu v, que fica inválida", isCorrect: true },
                        { text: "Compila, mas o último println imprime um vetor vazio", isCorrect: false },
                        { text: "Não compila: um for sempre exige uma referência com &", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Concorrência sem medo",
    aulas: [
        {
            titulo: "Threads: spawn, join e a closure com move",
            blocks: [
                {
                    type: "text",
                    value: "# Threads em Rust\n\nO Rust entrega threads do sistema operacional, no modelo 1:1: cada `thread::spawn` cria uma thread nativa, escalonada pelo SO. Não há runtime escondido nem green threads (o Rust teve antes da 1.0 e cortou).\n\nA função `spawn` recebe uma closure e devolve um `JoinHandle`:\n\n```rust\nuse std::thread;\n\nfn main() {\n    let handle = thread::spawn(|| {\n        for i in 0..3 {\n            println!(\"thread: {i}\");\n        }\n    });\n\n    for i in 0..3 {\n        println!(\"main: {i}\");\n    }\n\n    handle.join().unwrap();\n}\n```\n\nA ordem dos prints muda entre execuções: são duas linhas de execução de verdade, disputando a CPU. E o `join` importa: quando a `main` retorna, o processo termina e leva todas as threads junto. Sem esperar, a thread pode morrer no meio do trabalho.",
                },
                {
                    type: "text",
                    value: "## Por que o move é necessário\n\nA closure passada ao spawn vai rodar em outra thread, que pode existir depois que a função atual retornar. Um borrow de variável local não serve: a variável seria liberada com o escopo, e a thread ficaria apontando para o nada. O borrow checker atravessa a fronteira da thread e exige que a closure seja **dona** dos dados que usa, daí o `move`:\n\n```rust\nuse std::thread;\n\nfn main() {\n    let dados = vec![1, 2, 3];\n\n    let handle = thread::spawn(move || {\n        // a closure agora é dona do vetor\n        println!(\"tamanho: {}\", dados.len());\n    });\n\n    handle.join().unwrap();\n    // println!(\"{:?}\", dados); // erro: dados foi movida para a thread\n}\n```\n\nSem o `move`, o compilador reclama: `closure may outlive the current function, but it borrows dados`, e a própria mensagem sugere o `move`. É o mesmo ownership do módulo 2, agora com fronteiras de thread: não existe acesso compartilhado implícito, existe posse transferida.\n\nO requisito técnico é o lifetime `'static`: como a thread pode viver indefinidamente, tudo que a closure usa precisa sobreviver a qualquer escopo, e só um valor possuído garante isso.",
                },
                {
                    type: "text",
                    value: "## O join devolve um Result\n\n`join()` bloqueia quem chama até a thread terminar e devolve um `Result`: `Ok` carrega o valor que a closure produziu, `Err` aparece se a thread entrou em pânico. Transformar o pânico em valor, em vez de derrubar o processo, é decisão de projeto: pânico numa thread não mata as outras.\n\n```rust\nuse std::thread;\n\nfn main() {\n    let handle = thread::spawn(|| 40 + 2);\n    let resposta: i32 = handle.join().unwrap();\n    println!(\"{resposta}\"); // 42\n}\n```",
                },
                {
                    type: "table",
                    value: "[[\"Peça\", \"Papel\"], [\"thread::spawn\", \"Cria a thread e recebe a closure com o trabalho\"], [\"move\", \"Transfere a posse dos dados usados pela closure\"], [\"JoinHandle\", \"Alça para a thread nova; permite esperar\"], [\"handle.join()\", \"Bloqueia até o fim e devolve Result com o retorno\"]]",
                },
                {
                    type: "quote",
                    value: "Em Rust, uma thread pega os dados de que precisa pela posse, não por acesso compartilhado: quem não tem dono do outro lado da fronteira não compila.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve o método `join()` de um `JoinHandle`?",
                    difficulty: "facil",
                    explanation: "join bloqueia quem chama até a thread terminar e devolve um Result com o valor da closure. Sem ele, a main pode retornar antes e encerrar o processo.",
                    options: [
                        { text: "Criar uma nova thread a partir da atual", isCorrect: false },
                        { text: "Esperar a thread terminar e pegar o resultado", isCorrect: true },
                        { text: "Interromper a thread na hora, descartando o trabalho", isCorrect: false },
                        { text: "Definir em qual núcleo a thread vai rodar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `thread::spawn` recebe como argumento?",
                    difficulty: "facil",
                    explanation: "spawn recebe uma closure com o código que a thread nova executa e devolve um JoinHandle para acompanhar o resultado.",
                    options: [
                        { text: "Uma closure com o trabalho da thread nova", isCorrect: true },
                        { text: "O nome do executável a iniciar", isCorrect: false },
                        { text: "Uma lista de prioridades de escalonamento", isCorrect: false },
                        { text: "A quantidade de núcleos reservados à thread", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a closure passada a `thread::spawn` precisa de `move` para usar um vetor declarado na main?",
                    difficulty: "medio",
                    explanation: "spawn exige lifetime 'static: a thread pode viver além do escopo onde o vetor nasceu. Borrow não serve, então a closure precisa tomar posse dos dados.",
                    options: [
                        { text: "move evita que o vetor seja copiado para a heap", isCorrect: false },
                        { text: "Sem move a closure não pode retornar valor", isCorrect: false },
                        { text: "A thread pode viver além do escopo do vetor", isCorrect: true },
                        { text: "move permite reusar a closure em várias threads", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com as threads abertas quando a função `main` retorna?",
                    difficulty: "medio",
                    explanation: "main retornar finaliza o processo inteiro, e todas as threads spawnadas são encerradas junto. O join existe para esperar o trabalho antes desse ponto.",
                    options: [
                        { text: "Seguem rodando em segundo plano até terminarem", isCorrect: false },
                        { text: "Ficam suspensas até alguém chamar join", isCorrect: false },
                        { text: "Viram processos independentes do sistema", isCorrect: false },
                        { text: "O processo termina e todas são encerradas", isCorrect: true },
                    ],
                },
                {
                    statement: "O que `join()` devolve se a thread executou um `panic!`?",
                    difficulty: "dificil",
                    explanation: "join devolve thread::Result: Ok com o retorno da closure, Err se ela entrou em pânico. O pânico fica contido na thread, sem derrubar o processo.",
                    options: [
                        { text: "Um Err carregando informação do pânico", isCorrect: true },
                        { text: "Um Ok com o valor padrão do tipo de retorno", isCorrect: false },
                        { text: "Nada: o join repete o pânico na thread chamadora", isCorrect: false },
                        { text: "Um Option que volta como None", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Channels: a mensagem muda de dono",
            blocks: [
                {
                    type: "text",
                    value: "# Mensagens em vez de memória compartilhada\n\nO lema que guia a concorrência idiomática em Rust: não se comunique compartilhando memória, compartilhe memória comunicando-se. O **channel** (canal) é a encarnação disso: uma fila onde uma thread entrega valores e outra recebe, com o compilador garantindo que cada mensagem tem um dono do início ao fim.\n\nO módulo `std::sync::mpsc` traz o canal mais usado. A sigla: **m**ultiple **p**roducer, **s**ingle **c**onsumer, vários transmissores para um receptor. `channel()` devolve uma tupla: o transmissor `tx` e o receptor `rx`.",
                },
                {
                    type: "code",
                    value: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    thread::spawn(move || {\n        let msg = String::from(\"olá da thread\");\n        tx.send(msg).unwrap();\n    });\n\n    println!(\"{}\", rx.recv().unwrap()); // olá da thread\n}",
                },
                {
                    type: "text",
                    value: "## A posse viaja junto\n\n`send` recebe o valor por valor: a posse muda de lado no envio. Depois disso, a variável de origem não serve mais, e o compilador impõe essa regra:\n\n```rust\nlet msg = String::from(\"ping\");\ntx.send(msg).unwrap();\nprintln!(\"{msg}\"); // erro: msg foi movida para dentro do canal\n```\n\nO erro é o mesmo do ownership: valor usado após um move. O canal vira a fronteira: enquanto a mensagem não é lida, ela pertence ao canal; ao sair do `recv`, pertence a quem recebeu. Nunca existem dois lados usando a mesma mensagem ao mesmo tempo.\n\nOs dois lados devolvem `Result`. `send` dá `Err` se o receptor já caiu (entrega impossível). `recv` dá `Err` quando não resta mais nenhum transmissor vivo, o sinal natural de fim do canal.",
                },
                {
                    type: "text",
                    value: "## Vários produtores\n\nO `Sender` implementa `Clone`: cada clone entrega na mesma fila do receptor. É assim que várias threads alimentam um consumidor só, sem mutex nenhum. O `Receiver`, por desenho, é único.\n\nE o `rx` aceita iteração direta: o laço termina sozinho quando o canal fecha, ou seja, quando o último transmissor cai.",
                },
                {
                    type: "code",
                    value: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    for id in 0..3 {\n        let tx = tx.clone(); // uma cópia do transmissor por thread\n        thread::spawn(move || {\n            tx.send(format!(\"produtor {id}\")).unwrap();\n        });\n    }\n\n    drop(tx); // fecha o transmissor original\n\n    for msg in rx { // itera até o canal fechar\n        println!(\"{msg}\");\n    }\n}",
                },
                {
                    type: "quote",
                    value: "O canal transfere a posse junto com a mensagem: quem recebe é o novo dono, e o compilador garante que o remetente não toque no que já entregou.",
                },
            ],
            questions: [
                {
                    statement: "O que a sigla mpsc em `std::sync::mpsc` nomeia?",
                    difficulty: "facil",
                    explanation: "mpsc é multiple producer, single consumer: vários Sender podem enviar para o mesmo Receiver, que é único.",
                    options: [
                        { text: "Um produtor e vários consumidores", isCorrect: false },
                        { text: "Vários produtores, um consumidor", isCorrect: true },
                        { text: "Mensagens pendentes serializadas em cascata", isCorrect: false },
                        { text: "Memória protegida por semáforo de canal", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `rx.recv()` faz quando a mensagem ainda não chegou?",
                    difficulty: "facil",
                    explanation: "recv bloqueia a thread até chegar uma mensagem, ou devolve Err quando todos os transmissores caem. Quem não quer bloquear usa try_recv.",
                    options: [
                        { text: "Devolve imediatamente uma string vazia", isCorrect: false },
                        { text: "Bloqueia até chegar mensagem no canal", isCorrect: true },
                        { text: "Reenvia a última mensagem recebida", isCorrect: false },
                        { text: "Encerra a thread com panic imediatamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que este trecho não compila: `tx.send(msg)?;` seguido de `println!(\"{msg}\");`?",
                    difficulty: "medio",
                    explanation: "send move o valor para dentro do canal; usar a variável depois do move é erro de compilação. O canal transfere ownership junto com a mensagem.",
                    options: [
                        { text: "A mensagem é criptografada durante o envio", isCorrect: false },
                        { text: "A mensagem só é válida na thread que a criou", isCorrect: false },
                        { text: "send move a msg, e o print usa valor movido", isCorrect: true },
                        { text: "Falta converter msg para &str na impressão", isCorrect: false },
                    ],
                },
                {
                    statement: "Como permitir que três threads enviem mensagens pelo mesmo canal?",
                    difficulty: "medio",
                    explanation: "Sender implementa Clone: cada clone entrega na mesma fila, e o Receiver único consome tudo na ordem de chegada.",
                    options: [
                        { text: "Clonando o transmissor para cada uma", isCorrect: true },
                        { text: "Clonando o receptor para cada uma", isCorrect: false },
                        { text: "Criando um canal dentro de cada thread", isCorrect: false },
                        { text: "Encadeando três canais com join", isCorrect: false },
                    ],
                },
                {
                    statement: "Depois que todos os transmissores de um canal foram descartados, o que `rx.recv()` devolve?",
                    difficulty: "dificil",
                    explanation: "sem transmissores vivos, recv devolve Err(RecvError), o sinal de fim do canal. É o que faz um for em rx encerrar o laço.",
                    options: [
                        { text: "Ok com o valor da última mensagem", isCorrect: false },
                        { text: "Um Err, sinal de canal fechado", isCorrect: true },
                        { text: "Um Ok vazio, repetindo para sempre", isCorrect: false },
                        { text: "A thread entra em deadlock no recv", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Mutex e Arc: estado compartilhado com regras",
            blocks: [
                {
                    type: "text",
                    value: "# Estado compartilhado\n\nÀs vezes o canal não encaixa: um contador, um cache, uma configuração que todas as threads leem e escrevem. Aí entra o `Mutex` (mutual exclusion): um cadeado que deixa **uma thread por vez** acessar os dados de dentro.\n\nO detalhe que muda tudo: o dado mora **dentro** do mutex (`Mutex::new(valor)`), não do lado dele. Quem quer tocar pega o lock com `lock()` e recebe um `MutexGuard`, um guardião que dá acesso ao valor e libera o cadeado ao sair de escopo, pelo bom e velho RAII.\n\nPara várias threads segurarem a mesma alça do mutex, falta um pedaço: o `Arc`, de **A**tomic **R**eference **C**ounted. Cada thread ganha sua cópia do ponteiro contado, e o padrão `Arc<Mutex<T>>` vira o jeito canônico de compartilhar estado mutável.",
                },
                {
                    type: "code",
                    value: "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn main() {\n    let contador = Arc::new(Mutex::new(0));\n    let mut handles = vec![];\n\n    for _ in 0..10 {\n        let contador = Arc::clone(&contador); // mais um dono, sem copiar dados\n        handles.push(thread::spawn(move || {\n            let mut valor = contador.lock().unwrap();\n            *valor += 1;\n        }); // o guard sai de escopo aqui e libera o lock\n    }\n\n    for h in handles {\n        h.join().unwrap();\n    }\n\n    println!(\"contagem: {}\", *contador.lock().unwrap()); // 10\n}",
                },
                {
                    type: "text",
                    value: "## Por que lock() devolve Result\n\nO `lock()` retorna `Result<MutexGuard, PoisonError>`. O cenário do `Err`: uma thread entrou em pânico enquanto segurava o lock. O guard até é liberado (o Drop roda mesmo em pânico), mas o mutex fica marcado como **envenenado**, e todo `lock` seguinte devolve `Err`.\n\nA lógica é honesta: quem entra em pânico no meio de uma operação pode ter deixado os dados protegidos inconsistentes, e silenciar isso seria pior. Daí o `lock().unwrap()` onipresente: pânico segurando lock é caso raro, e propagar é a atitude padrão. Se você souber o que faz, o `PoisonError` dá acesso ao guard de qualquer forma.",
                },
                {
                    type: "text",
                    value: "## Rc x Arc\n\nO `Rc` do módulo de smart pointers conta donos com um contador comum, rápido e sem sincronização. Duas threads incrementando esse contador ao mesmo tempo seria corrida de dados, a mais clássica das condições disputadas. O `Arc` resolve o mesmo problema com operações **atômicas**, que o processador garante indivisíveis, ao custo de um pouco de desempenho.\n\nA escolha nem chega a ser sua: como `Rc` não implementa `Send`, o compilador simplesmente nega o código que tenta levá-lo a outra thread. E note que `Arc::clone(&a)` não copia os dados: incrementa o contador de donos. Os dados continuam únicos; quando a última cópia cai, tudo é liberado.",
                },
                {
                    type: "table",
                    value: "[[\"\", \"Rc<T>\", \"Arc<T>\"], [\"Contagem de referências\", \"Comum (não atômica)\", \"Atômica\"], [\"Pode ir para outra thread\", \"Não\", \"Sim\"], [\"Custo do clone\", \"Mais barato\", \"Um pouco maior\"], [\"Uso típico\", \"Dentro de uma thread\", \"Compartilhado entre threads\"]]",
                },
                {
                    type: "quote",
                    value: "Mutex protege o dado, Arc distribui a alça: o par Arc<Mutex<T>> é o estado compartilhado mutável com o compilador vigiando a porta.",
                },
            ],
            questions: [
                {
                    statement: "O que um `Mutex<T>` garante sobre os dados de dentro?",
                    difficulty: "facil",
                    explanation: "O mutex é um cadeado de exclusão mútua: apenas uma thread por vez consegue o lock e o acesso ao valor interno.",
                    options: [
                        { text: "Só uma thread por vez acessa os dados", isCorrect: true },
                        { text: "Os dados são copiados para cada thread", isCorrect: false },
                        { text: "O acesso aos dados é somente leitura", isCorrect: false },
                        { text: "As threads esperam um tempo fixo entre acessos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Arc::clone(&contador)` faz?",
                    difficulty: "facil",
                    explanation: "Arc::clone incrementa o contador atômico de donos; os dados continuam únicos, e a última cópia a cair libera tudo.",
                    options: [
                        { text: "Copia os dados para uma nova região de memória", isCorrect: false },
                        { text: "Incrementa a contagem atômica de donos", isCorrect: true },
                        { text: "Zera o contador de referências atual", isCorrect: false },
                        { text: "Cria um mutex novo com os mesmos dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `lock()` devolve um `Result`?",
                    difficulty: "medio",
                    explanation: "Se uma thread entra em pânico segurando o lock, o mutex fica envenenado e os lock seguintes recebem Err, avisando que o estado protegido pode estar inconsistente.",
                    options: [
                        { text: "Para sinalizar falta de memória ao travar", isCorrect: false },
                        { text: "Para avisar de envenenamento por pânico", isCorrect: true },
                        { text: "Para devolver o valor interno dentro do Ok", isCorrect: false },
                        { text: "Para respeitar um tempo limite de espera", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `Rc` não serve para compartilhar estado entre threads?",
                    difficulty: "medio",
                    explanation: "O contador do Rc usa incremento comum: clones concorrentes em duas threads gerariam corrida de dados. Como Rc não implementa Send, o compilador nega o código.",
                    options: [
                        { text: "Rc não aceita tipos genéricos mutáveis", isCorrect: false },
                        { text: "Rc exige que o valor implemente Copy", isCorrect: false },
                        { text: "Rc só funciona dentro de uma única closure", isCorrect: false },
                        { text: "Sua contagem de referências não é atômica", isCorrect: true },
                    ],
                },
                {
                    statement: "Na thread que o pegou, quando o lock de um `Mutex` é liberado?",
                    difficulty: "dificil",
                    explanation: "lock devolve um MutexGuard que libera o cadeado no seu Drop, ao sair de escopo. Não existe unlock manual; segurar o guard demais é o bug clássico a evitar.",
                    options: [
                        { text: "Quando o MutexGuard sai de escopo", isCorrect: true },
                        { text: "Ao chamar unlock explicitamente no final", isCorrect: false },
                        { text: "Quando a thread chama join no handle", isCorrect: false },
                        { text: "Ao chamar lock uma segunda vez no dado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Send e Sync: o carimbo do compilador",
            blocks: [
                {
                    type: "text",
                    value: "# O que autoriza um valor a cruzar threads\n\nNos bastidores de tudo que este módulo mostrou existem duas **marker traits**: `Send` e `Sync`. São traits vazias, sem método algum: valem como carimbo que o compilador confere.\n\n- **Send**: o valor pode ser **transferido** para outra thread com segurança.\n- **Sync**: o valor pode ser **compartilhado** entre threads por referência. Formalmente, `T: Sync` equivale a `&T: Send`.\n\nQuando você tenta mover um `Rc` para um `thread::spawn` e o compilador nega, é exatamente o carimbo `Send` faltando. A mensagem de erro cita a trait e o tipo, sempre.",
                },
                {
                    type: "text",
                    value: "## Auto traits: o carimbo se propaga\n\nVocê não implementa `Send` e `Sync` no dia a dia. O compilador os implementa automaticamente para todo tipo composto cujas partes são todas `Send`/`Sync`, e os primitivos já nascem com os dois. Uma `struct` com `String` e `Vec<u8>` é carimbada sem você tocar em nada.\n\nOs desvios contam a história: `String` é `Send` e `Sync` (um dono, bytes na heap, aliasing resolvido em compilação). `Rc<T>` não é nem `Send` nem `Sync` (contador não atômico). `RefCell<i32>` é `Send`, mas não `Sync`: suas checagens de borrow acontecem em runtime e não são sincronizadas, então compartilhar `&RefCell` entre threads seria corrida. Já `Mutex<T>` arruma a casa e é `Sync` quando `T: Send`.",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Send\", \"Sync\"], [\"i32, String, Vec<T>\", \"Sim\", \"Sim\"], [\"Rc<T>\", \"Não\", \"Não\"], [\"RefCell<T>\", \"Sim\", \"Não\"], [\"Mutex<T>\", \"Sim\", \"Sim\"]]",
                },
                {
                    type: "text",
                    value: "## Scoped threads: borrow entre threads\n\nO `spawn` comum exige `'static` porque a thread pode viver para sempre. Desde o Rust 1.63, `thread::scope` oferece o contrato inverso: threads que **terminam garantidamente antes do fim do bloco**. Com essa garantia, borrow de dados locais volta a servir, sem `move` e sem `Arc`:\n\n```rust\nuse std::thread;\n\nfn main() {\n    let dados = vec![1, 2, 3];\n\n    thread::scope(|s| {\n        s.spawn(|| {\n            println!(\"tamanho: {}\", dados.len());\n        });\n        s.spawn(|| {\n            println!(\"soma: {}\", dados.iter().sum::<i32>());\n        });\n    }); // o escopo espera as threads antes de devolver\n}\n```\n\nO compilador aceita porque consegue provar que `dados` ainda vive enquanto as threads existem. É o borrow checker fazendo concorrência parecer fácil.",
                },
                {
                    type: "quote",
                    value: "Send e Sync não adicionam comportamento: são provas. Todo erro de concorrência que o Rust impede em compilação passa por esses dois carimbos.",
                },
            ],
            questions: [
                {
                    statement: "O que a marker trait `Send` significa?",
                    difficulty: "facil",
                    explanation: "Send marca os tipos seguros de mover para outra thread. É uma trait sem métodos, que funciona como prova apresentada ao compilador.",
                    options: [
                        { text: "Que o valor pode ser transferido para outra thread", isCorrect: true },
                        { text: "Que o valor pode ser lido por várias threads ao mesmo tempo", isCorrect: false },
                        { text: "Que o tipo envia dados pela rede", isCorrect: false },
                        { text: "Que o tipo é serializável em JSON", isCorrect: false },
                    ],
                },
                {
                    statement: "Um tipo `T` é considerado `Sync` quando:",
                    difficulty: "medio",
                    explanation: "Sync significa que compartilhar referências entre threads é seguro. A definição formal: T é Sync quando &T é Send.",
                    options: [
                        { text: "T implementa todos os métodos de Iterator", isCorrect: false },
                        { text: "T usa apenas operações atômicas", isCorrect: false },
                        { text: "&T pode ser enviado para outra thread", isCorrect: true },
                        { text: "T pode ser clonado entre processos", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `Rc<String>` não implementa `Send`?",
                    difficulty: "medio",
                    explanation: "O contador do Rc não é atômico: clones simultâneos em duas threads divergiriam a contagem. O carimbo Send é negado, e o spawn rejeita o valor.",
                    options: [
                        { text: "String não pode cruzar para outra thread", isCorrect: false },
                        { text: "Send só vale para tipos numéricos primitivos", isCorrect: false },
                        { text: "Rc guarda um ponteiro que é sempre nulo", isCorrect: false },
                        { text: "Clones simultâneos corromperiam a contagem", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual par descreve corretamente `RefCell<i32>`?",
                    difficulty: "dificil",
                    explanation: "RefCell pode ser movido entre threads (Send), mas suas checagens de borrow em runtime não são sincronizadas: compartilhar &RefCell seria corrida, logo não é Sync.",
                    options: [
                        { text: "É Sync, mas não é Send", isCorrect: false },
                        { text: "É Send e Sync", isCorrect: false },
                        { text: "É Send, mas não é Sync", isCorrect: true },
                        { text: "Não é nem Send nem Sync", isCorrect: false },
                    ],
                },
                {
                    statement: "O que as scoped threads de `thread::scope` permitem?",
                    difficulty: "medio",
                    explanation: "O escopo joina todas as threads antes de devolver, então dados locais ainda vivem: borrow serve, e a exigência de 'static do spawn solto cai.",
                    options: [
                        { text: "Criar threads com pilha menor que o normal", isCorrect: false },
                        { text: "Usar borrow de dados locais em vez de Arc", isCorrect: true },
                        { text: "Executar closures que não implementam Send", isCorrect: false },
                        { text: "Cancelar threads que excedam um tempo limite", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Async/await: muitas tarefas, poucas threads",
            blocks: [
                {
                    type: "text",
                    value: "# A pergunta que o async responde\n\nE dez mil conexões de rede ao mesmo tempo? Uma thread do sistema operacional por conexão custa caro: cada uma tem pilha própria e troca de contexto. O modelo async inverte a conta: **milhares de tarefas sobre um punhado de threads**.\n\nUma tarefa não é uma thread. Quando você escreve uma `async fn`, o compilador a transforma numa **máquina de estados** compacta, que pausa e retoma nos pontos de espera. E a regra de ouro do Rust: futuros são **lazy**. Chamar a função não executa nada, apenas cria o futuro; ele só roda quando alguém o aguarda.",
                },
                {
                    type: "text",
                    value: "## async fn e .await\n\n```rust\nasync fn busca_usuario(id: u32) -> String {\n    // simula uma chamada de rede\n    format!(\"usuario {id}\")\n}\n```\n\n`async fn` devolve um `Future`. O `.await` é o ponto onde a tarefa **cede** o controle: enquanto o valor não chega, o runtime roda outra tarefa na mesma thread. Nada de thread parada esperando rede.\n\nE `.await` só existe dentro de contexto async (função ou bloco). Em `fn` comum, nem compila:\n\n```rust\nfn main() {\n    let futuro = busca_usuario(7); // ok: só cria o futuro, nada roda\n    futuro.await; // erro: .await só existe dentro de async\n}\n```",
                },
                {
                    type: "text",
                    value: "## O runtime: Tokio\n\nA biblioteca padrão define o Future, mas não o executa: Rust não impõe um runtime de async. Quem roda as tarefas é uma crate, e **Tokio** é o padrão de mercado: a base de Axum, hyper e do ecossistema de servidores Rust.\n\n```\n[dependencies]\ntokio = { version = \"1\", features = [\"full\"] }\n```\n\nO `#[tokio::main]` é uma macro que monta o runtime e entrega uma `main` async pronta para aguardar.",
                },
                {
                    type: "code",
                    value: "use tokio::time::{sleep, Duration};\n\nasync fn busca_usuario(id: u32) -> String {\n    sleep(Duration::from_millis(100)).await; // espera de I/O simulada\n    format!(\"usuario {id}\")\n}\n\n#[tokio::main]\nasync fn main() {\n    let usuario = busca_usuario(7).await;\n    println!(\"{usuario}\"); // usuario 7\n}",
                },
                {
                    type: "text",
                    value: "## Quando threads bastam, quando async brilha\n\nThreads comuns resolvem bem: trabalho de **CPU** (comprimir, processar imagens) com poucas unidades paralelas, na casa dos núcleos da máquina; scripts e batch sem I/O concorrente. Para isso, async não acrescenta nada.\n\nAsync brilha quando o gargalo é **espera em grande quantidade**: servidor com milhares de conexões, proxy, chat com muitos clientes, fan-out de chamadas de API. Cada tarefa custa bytes, não megabytes de pilha.\n\nUm aviso de uso: tarefa async que ocupa a CPU por muito tempo segura a thread do runtime e atrasa as outras. O Tokio oferece `spawn_blocking` para empurrar esse trabalho a threads de verdade.",
                },
                {
                    type: "quote",
                    value: "Async não é uma thread melhor: é uma forma de sobrepor esperas. Onde domina cálculo, threads; onde domina espera, milhares de tarefas em poucas threads.",
                },
            ],
            questions: [
                {
                    statement: "Onde o operador `.await` pode aparecer?",
                    difficulty: "facil",
                    explanation: "await só existe dentro de funções ou blocos async; usado em fn comum, o compilador nega com erro de contexto não async.",
                    options: [
                        { text: "Dentro de funções ou blocos async", isCorrect: true },
                        { text: "Em qualquer função do programa", isCorrect: false },
                        { text: "Somente dentro da função main", isCorrect: false },
                        { text: "Apenas em closures marcadas com move", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o papel do Tokio num programa async em Rust?",
                    difficulty: "facil",
                    explanation: "A linguagem define o Future, mas não o executa. O runtime faz o escalonamento e o I/O, e Tokio é o padrão de mercado dessa função.",
                    options: [
                        { text: "Ser o runtime que executa as tarefas", isCorrect: true },
                        { text: "Compilar as futures para código de máquina", isCorrect: false },
                        { text: "Substituir o Cargo no gerenciamento", isCorrect: false },
                        { text: "Converter threads em processos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao chamar uma `async fn` sem `.await` e sem entregá-la a um spawn?",
                    difficulty: "medio",
                    explanation: "Futuros em Rust são lazy: a chamada só cria o valor do futuro; a execução acontece quando ele é aguardado ou assume ao runtime.",
                    options: [
                        { text: "Nada executa: ela só cria um futuro", isCorrect: true },
                        { text: "Ela roda numa thread separada até o fim", isCorrect: false },
                        { text: "Ela roda imediatamente, de forma síncrona", isCorrect: false },
                        { text: "Compila, mas gera panic em runtime", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual cenário se resolve bem com threads comuns, sem async?",
                    difficulty: "medio",
                    explanation: "Trabalho de CPU com poucas unidades paralelas combina com threads diretas. Async paga o custo quando o gargalo é espera de I/O em grande quantidade.",
                    options: [
                        { text: "Manter dez mil conexões WebSocket abertas", isCorrect: false },
                        { text: "Consultar mil APIs em paralelo", isCorrect: false },
                        { text: "Processar imagens usando todos os núcleos", isCorrect: true },
                        { text: "Um chat com muitos clientes conectados", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que async não acelera um cálculo pesado que ocupa a CPU?",
                    difficulty: "dificil",
                    explanation: "O ganho de async vem de sobrepor esperas de I/O. Cálculo de CPU continua do mesmo tamanho; para isso servem threads, ou spawn_blocking no Tokio.",
                    options: [
                        { text: "Futuros são compilados sem otimizações", isCorrect: false },
                        { text: "O runtime proíbe cálculos dentro de tarefas", isCorrect: false },
                        { text: "Async paraleliza laços automaticamente", isCorrect: false },
                        { text: "Async apenas sobrepõe as esperas de I/O", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// Módulo 7 da trilha Rust: crates e módulos, testes, smart pointers, unsafe e o caminho adiante.
const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Rust na prática",
    aulas: [
        {
            titulo: "Crates e módulos: organizando o projeto",
            blocks: [
                {
                    type: "text",
                    value: "# Crates: biblioteca e binária\n\nUma **crate** é a unidade de compilação do Rust: o que o compilador constrói de uma vez. Ela vem em dois sabores. A crate **binária** tem função `main` e vira um executável. A crate de **biblioteca** não roda sozinha: expõe código para outras crates reutilizarem.\n\nUm **pacote** do Cargo pode conter as duas. As regras de ouro: `src/main.rs` é a raiz da crate binária, `src/lib.rs` é a raiz da crate de biblioteca, e um pacote tem no máximo uma de cada. O `cargo new app` cria uma binária; `cargo new util --lib` cria uma biblioteca.\n\nA partir da raiz, o Rust monta a árvore de módulos do projeto. Toda a organização de código nasce aí.",
                },
                {
                    type: "text",
                    value: "## Módulos: mod e arquivos\n\nO `mod` declara um módulo. Inline, dentro do próprio arquivo:\n\n```rust\nmod rede {\n    pub fn conectar(host: &str) {\n        println!(\"conectando em {host}\");\n    }\n}\n```\n\nQuando o módulo cresce, ele vira uma declaração de uma linha e o código vai para um arquivo próprio. `mod rede;` dentro de `src/lib.rs` faz o Rust procurar `src/rede.rs` (ou `src/rede/mod.rs`, estilo antigo que segue funcionando). Um submódulo declarado em `rede.rs` mora em `src/rede/servidor.rs`: a árvore de diretórios espelha a árvore de módulos.",
                },
                {
                    type: "code",
                    value: "// src/lib.rs\nmod rede;                          // o código mora em src/rede.rs\n\npub fn inicio() {\n    rede::conectar(\"localhost:8080\");\n}\n\n// src/rede.rs\npub fn conectar(host: &str) {\n    log(format!(\"conectando em {host}\"));\n}\n\nfn log(mensagem: String) {          // sem pub: invisível fora do módulo\n    println!(\"[rede] {mensagem}\");\n}",
                },
                {
                    type: "text",
                    value: "## pub, use e caminhos\n\nPor padrão, todo item é **privado**: só o módulo onde nasceu (e seus filhos) enxerga. A palavra `pub` abre a porta, e há gradações úteis como `pub(crate)`, visível dentro da crate inteira mas não fora dela.\n\nPara alcançar um item, você escreve um caminho. Absoluto, partindo da raiz: `crate::rede::conectar`. Relativo ao módulo atual: `self::rede::conectar`. Subindo um nível, útil para falar com um módulo tio: `super::`.\n\nO `use` cria um atalho para não repetir o caminho inteiro:\n\n```rust\nmod app {\n    pub mod ui {\n        pub fn renderizar() {\n            super::notificar();       // super:: sobe para o módulo pai\n        }\n    }\n\n    fn notificar() {\n        println!(\"renderizado\");\n    }\n}\n\nuse crate::app::ui::renderizar;     // caminho absoluto, a partir da raiz\n\nfn main() {\n    renderizar();\n}\n```\n\nE o `pub use` reexporta um caminho, montando a API pública que o resto do mundo enxerga.",
                },
                {
                    type: "text",
                    value: "## lib.rs x main.rs no mesmo pacote\n\nO arranjo clássico dos projetos médios: a lógica inteira vive na crate de biblioteca em `src/lib.rs`, e `src/main.rs` fica magro, só com o parse de argumentos e a chamada inicial. A binária consome a biblioteca pelo nome do pacote, como se fosse uma dependência interna:\n\n```rust\n// src/main.rs\nuse meu_app::inicio;      // pacote meu-app vira crate meu_app\n\nfn main() {\n    inicio();\n}\n```\n\nA separação paga em teste e reuso: os testes de integração da pasta `tests/` só alcançam a crate de biblioteca, e nada impede outro projeto de declarar `meu_app` como dependência dele.",
                },
                {
                    type: "quote",
                    value: "Crates são unidades de compilação, módulos são árvores dentro delas, e o pub decide o que atravessa a borda. Organização em Rust é desenhar essas fronteiras com intenção.",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre uma crate binária e uma crate de biblioteca?",
                    difficulty: "facil",
                    explanation: "A crate binária tem função main e compila para um executável; a de biblioteca expõe código para outras crates consumirem, como uma dependência.",
                    options: [
                        { text: "A binária compila sem as checagens de segurança do Rust", isCorrect: false },
                        { text: "A biblioteca só pode ser usada dentro de testes automáticos", isCorrect: false },
                        { text: "A binária vira executável; a biblioteca é reutilizada", isCorrect: true },
                        { text: "A binária não aceita dependências externas no Cargo.toml", isCorrect: false },
                    ],
                },
                {
                    statement: "Por padrão, funções e tipos declarados em um módulo são...",
                    difficulty: "facil",
                    explanation: "Itens nascem privados: só o módulo que os declara e seus submódulos enxergam. A palavra pub é o que abre o acesso de fora.",
                    options: [
                        { text: "públicos para todo o pacote, como acontece em Java", isCorrect: false },
                        { text: "públicos apenas dentro do mesmo arquivo fonte", isCorrect: false },
                        { text: "privados: só o módulo e seus submódulos enxergam", isCorrect: true },
                        { text: "privados, visíveis apenas para o módulo pai deles", isCorrect: false },
                    ],
                },
                {
                    statement: "Declarado `mod rede;` em src/lib.rs, onde o Rust procura o código do módulo?",
                    difficulty: "medio",
                    explanation: "A declaração de uma linha manda o Rust carregar src/rede.rs, ou src/rede/mod.rs no estilo mais antigo, que continua válido.",
                    options: [
                        { text: "Em rede/lib.rs na raiz do projeto", isCorrect: false },
                        { text: "Em qualquer arquivo que comece com a palavra mod", isCorrect: false },
                        { text: "Em src/rede.rs ou src/rede/mod.rs", isCorrect: true },
                        { text: "No crates.io, como uma dependência implícita", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um caminho de módulo, a que `super::` se refere?",
                    difficulty: "medio",
                    explanation: "super:: sobe um nível na árvore: aponta para o módulo pai daquele em que o caminho aparece, útil para alcançar itens irmãos.",
                    options: [
                        { text: "À raiz da crate onde o código está escrita", isCorrect: false },
                        { text: "Ao próprio módulo, sem subir nenhum nível", isCorrect: false },
                        { text: "Ao módulo pai, um nível acima na árvore", isCorrect: true },
                        { text: "Ao primeiro submódulo declarado sob o atual", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que projetos maiores mantêm src/lib.rs e src/main.rs no mesmo pacote?",
                    difficulty: "dificil",
                    explanation: "A binária vira um cliente magro da biblioteca: a lógica mora na crate de biblioteca, que os testes de integração alcançam e que outros projetos podem reutilizar como dependência.",
                    options: [
                        { text: "O compilador exige os dois arquivos quando há dependências", isCorrect: false },
                        { text: "A biblioteca roda em um processo separado da binária", isCorrect: false },
                        { text: "A binária vira cliente magro da biblioteca do pacote", isCorrect: true },
                        { text: "O main.rs tem limite de linhas por convenção da comunidade", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Testes: assert, pânico e integração",
            blocks: [
                {
                    type: "text",
                    value: "# Testes de unidade com cargo test\n\nTodo teste é uma função anotada com `#[test]`, e o `cargo test` roda todas de uma vez, mostrando o nome de cada uma e o resumo final. O hábito da comunidade é juntar os testes no mesmo arquivo do código, dentro de um módulo anotado com `#[cfg(test)]`:\n\n```rust\n#[cfg(test)]\nmod testes {\n    use super::*;             // traz o código testado para o escopo\n\n    #[test]\n    fn soma_dois_numeros() {\n        assert_eq!(2 + 2, 4);\n    }\n}\n```\n\nO `cfg(test)` garante que esse módulo só compila quando você está testando. Ele some do binário de produção, sem custo algum.",
                },
                {
                    type: "text",
                    value: "## assert!, assert_eq! e assert_ne!\n\nO `assert!` recebe uma expressão booleana e falha o teste se ela for falsa. O `assert_eq!` compara dois valores e, quando difere, imprime os dois lados na mensagem de falha, economizando o print de depuração. O `assert_ne!` é o inverso: passa quando os valores são diferentes. Todos aceitam uma mensagem extra com formato:\n\n```rust\nassert!(nota >= 6, \"nota {nota} abaixo do mínimo\");\n```\n\nAo falhar, o teste aborta naquela linha, mas os outros testes do projeto seguem rodando.",
                },
                {
                    type: "code",
                    value: "pub fn dividir(a: f64, b: f64) -> f64 {\n    if b == 0.0 {\n        panic!(\"divisão por zero\");\n    }\n    a / b\n}\n\n#[cfg(test)]\nmod testes {\n    use super::*;\n\n    #[test]\n    fn divide_valores() {\n        assert_eq!(dividir(10.0, 2.0), 5.0);\n    }\n\n    #[test]\n    fn dez_tercos_nao_e_inteiro() {\n        assert_ne!(dividir(10.0, 3.0), 3.0);\n    }\n\n    #[test]\n    #[should_panic(expected = \"divisão por zero\")]\n    fn divisor_zero_entrara_em_panico() {\n        dividir(10.0, 0.0);\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Esperando pânicos e devolvendo Result\n\nTem código cujo contrato é justamente entrar em pânico quando recebe bobagem. O `#[should_panic]` vira isso em critério de sucesso: o teste só passa se a função soar o `panic!`. Com `expected = \"...\"` a mensagem também é conferida, evitando que um pânico qualquer conte como acerto.\n\nTestes ainda podem devolver `Result<()>`: aí você usa o `?`, e o erro da função testada falha o teste com a mensagem original:\n\n```rust\n#[test]\nfn parse_de_numero() -> Result<(), std::num::ParseIntError> {\n    let n: i32 = \"42\".parse()?;\n    assert_eq!(n, 42);\n    Ok(())\n}\n```",
                },
                {
                    type: "text",
                    value: "## Testes de integração em tests/\n\nA pasta `tests/`, na raiz do projeto, guarda os testes de integração. Cada arquivo dela vira um binário de teste próprio, que enxerga sua crate de biblioteca como um consumidor externo, com `use meu_app::...`. Isso muda o ângulo: nada de acessar funções privadas, só a API pública, como quem baixou sua crate do crates.io.\n\n```rust\n// tests/api.rs\nuse meu_app::dividir;\n\n#[test]\nfn divisao_pela_api_publica() {\n    assert_eq!(dividir(9.0, 3.0), 3.0);\n}\n```\n\nDetalhe que costuma surpreender: testes de integração não existem para crates só binárias, porque um executável não dá para importar. Mais um motivo para a lógica morar na biblioteca.",
                },
                {
                    type: "quote",
                    value: "Teste de unidade olha o funcionamento interno com acesso total; teste de integração olha a borda pública como um usuário de verdade. Projeto maduro usa os dois.",
                },
            ],
            questions: [
                {
                    statement: "Qual comando executa os testes de um projeto Cargo?",
                    difficulty: "facil",
                    explanation: "O cargo test compila o projeto em modo de teste e roda todas as funções marcadas com #[test], de unidade e de integração.",
                    options: [
                        { text: "cargo run --tests", isCorrect: false },
                        { text: "cargo check --all", isCorrect: false },
                        { text: "cargo test", isCorrect: true },
                        { text: "rustc --test src/", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `assert_eq!(dividir(10.0, 2.0), 5.0);` faz dentro de um teste?",
                    difficulty: "facil",
                    explanation: "assert_eq! compara os dois argumentos e falha o teste quando são diferentes, imprimindo os dois valores na mensagem de falha.",
                    options: [
                        { text: "Faz a divisão e imprime o resultado no console", isCorrect: false },
                        { text: "Garante que a função testada retorna sempre f64", isCorrect: false },
                        { text: "Compara os valores e falha se forem diferentes", isCorrect: true },
                        { text: "Executa a comparação apenas em builds de release", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o `#[should_panic]` acima de um `#[test]`?",
                    difficulty: "medio",
                    explanation: "Ele inverte o critério: o teste só passa se o código chamado entrar em panic!. Com expected, a mensagem do pânico também é conferida.",
                    options: [
                        { text: "Ignorar o teste quando ele falhar por instabilidade", isCorrect: false },
                        { text: "Rodar o teste apenas na compilação em modo release", isCorrect: false },
                        { text: "Converter erros de compilação em avisos do teste", isCorrect: false },
                        { text: "Aprovar o teste somente se ele entrar em panic!", isCorrect: true },
                    ],
                },
                {
                    statement: "O que distingue os testes da pasta tests/ dos que vivem no módulo `#[cfg(test)]`?",
                    difficulty: "medio",
                    explanation: "Cada arquivo de tests/ é um binário que consome a crate de biblioteca de fora, então só alcança itens públicos, enquanto os testes internos acessam até o privado via use super::*.",
                    options: [
                        { text: "Só alcançam a API pública da crate de biblioteca", isCorrect: true },
                        { text: "Rodam antes da compilação do restante da crate", isCorrect: false },
                        { text: "Só funcionam em projetos que também têm crates binárias", isCorrect: false },
                        { text: "Não podem usar assert_eq! nem macros de teste", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o módulo de testes é anotado com `#[cfg(test)]`?",
                    difficulty: "dificil",
                    explanation: "A anotação faz o módulo existir apenas na compilação de testes. No build normal ele é eliminado na configuração, sem entrar no binário de produção.",
                    options: [
                        { text: "Para dar aos testes prioridade maior no escalonamento", isCorrect: false },
                        { text: "Compilar só no cargo test, fora do build final", isCorrect: true },
                        { text: "Porque assert! só existe dentro de cfg(test)", isCorrect: false },
                        { text: "Para liberar o acesso a ponteiros crus dentro dos testes", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Smart pointers: Box, Rc e RefCell",
            blocks: [
                {
                    type: "text",
                    value: "# Box<T>: o dado vai para o heap\n\nUma referência comum empresta um valor que mora em outro lugar. Um **smart pointer** é dono do dado e carrega metadados junto. O mais simples é o `Box<T>`: aloca o valor no heap e deixa na pilha só um ponteiro do tamanho de um `usize`. O acesso é transparente, com deref automático nas chamadas de método.\n\nDois casos clássicos de uso. O primeiro é a recursão: um tipo que contém a si mesmo não tem tamanho conhecido em compilação, e o Box quebra o loop porque tem tamanho fixo:\n\n```rust\nenum Lista {\n    Cons(i32, Box<Lista>),      // sem o Box aqui o tamanho seria infinito\n    Nil,\n}\n\nfn main() {\n    let _l = Lista::Cons(1, Box::new(Lista::Cons(2, Box::new(Lista::Nil))));\n}\n```\n\nO segundo é o trait object: `Vec<Box<dyn Desenho>>` guarda tipos diferentes por trás de uma mesma trait, cada um alocado no heap.",
                },
                {
                    type: "text",
                    value: "## Rc<T>: contagem de referências\n\nAs regras de ownership dizem um dono por valor. Quando vários pontos do programa precisam ser donos do mesmo dado em leitura, entra o `Rc<T>`, reference counted. O `Rc::clone` não copia o dado: incrementa um contador. Quando a última cópia sai de escopo, o valor é liberado.\n\n```rust\nuse std::rc::Rc;\n\nlet a = Rc::new(String::from(\"relatorio\"));\nlet b = Rc::clone(&a);                    // contador: 1 para 2\n\nprintln!(\"{} donos\", Rc::strong_count(&a));\n```\n\nA conta tem um preço: o `Rc` compartilha em **leitura**, e só serve em programa de thread única. Ele não implementa `Send` nem `Sync`, e o compilador impede o envio para threads. Para concorrência, a std tem o `Arc`, a versão de contador atômico.",
                },
                {
                    type: "text",
                    value: "## RefCell<T> e mutabilidade interior\n\nEm Rust seguro, um valor atrás de referência imutável não muda. O `RefCell<T>` flexiona isso com a **mutabilidade interior**: por fora parece imutável, por dentro entrega empréstimos mutáveis, e as regras de empréstimo (um mutável OU vários imutáveis) passam a valer em **tempo de execução**:\n\n```rust\nuse std::cell::RefCell;\n\nlet dado = RefCell::new(5);\n*dado.borrow_mut() += 1;              // pega um empréstimo mutável\nprintln!(\"{}\", dado.borrow());       // 6, empréstimo imutável\n\nlet um = dado.borrow_mut();\nlet dois = dado.borrow_mut();         // panic em runtime: already mutably borrowed\n```\n\nA consequência é séria: violar as regras deixa de ser erro de compilação e vira `panic!` no meio da execução. A combinação `Rc<RefCell<T>>` junta os dois mundos: vários donos que podem modificar, o desenho natural de grafos, árvores com ponteiro para o pai e caches, sempre em thread única, com os empréstimos conferidos em runtime.",
                },
                {
                    type: "code",
                    value: "use std::cell::RefCell;\nuse std::rc::Rc;\n\nfn main() {\n    let mensagens = Rc::new(RefCell::new(vec![\"ola\".to_string()]));\n\n    let escritor = Rc::clone(&mensagens);               // segundo dono, contador = 2\n    escritor.borrow_mut().push(\"mundo\".to_string());    // mutação por trás do Rc\n\n    println!(\"{:?}\", mensagens.borrow());               // [\"ola\", \"mundo\"]\n    println!(\"{} donos\", Rc::strong_count(&mensagens)); // 2\n}",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Papel\", \"Regra de posse\"], [\"Box<T>\", \"Dado no heap, dono único\", \"Move e drop como qualquer dono\"], [\"Rc<T>\", \"Contagem de referências\", \"Vários donos em leitura, thread única\"], [\"RefCell<T>\", \"Mutabilidade interior\", \"Dono único, empréstimos checados em runtime\"], [\"Rc<RefCell<T>>\", \"Donos compartilhados que mutam\", \"Combina as duas regras anteriores\"]]",
                },
                {
                    type: "quote",
                    value: "Box muda o lugar da memória, Rc divide a posse, RefCell adia a checagem. Cada smart pointer compra uma flexibilidade e cobra um preço conhecido.",
                },
            ],
            questions: [
                {
                    statement: "Qual o efeito de `Box::new(valor)`?",
                    difficulty: "facil",
                    explanation: "O valor é alocado no heap e o Box fica na pilha como ponteiro de tamanho fixo, com acesso transparente por deref automático.",
                    options: [
                        { text: "Cria uma cópia do valor para cada escopo que o usa", isCorrect: false },
                        { text: "Converte o valor em uma referência imutável", isCorrect: false },
                        { text: "Aloca o valor no heap, com ponteiro na pilha", isCorrect: true },
                        { text: "Adia a liberação do valor até o fim do programa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Rc::clone(&a)` faz de fato?",
                    difficulty: "medio",
                    explanation: "Rc::clone só incrementa o contador de referências do mesmo dado, sem copiar nada. É por isso que é barato comparado a um clone profundo.",
                    options: [
                        { text: "Incrementa o contador, sem copiar o dado", isCorrect: true },
                        { text: "Copia o dado para uma nova área do heap", isCorrect: false },
                        { text: "Concede um empréstimo mutável sobre o dado", isCorrect: false },
                        { text: "Move o dado para dentro de um novo Box", isCorrect: false },
                    ],
                },
                {
                    statement: "Dois `borrow_mut()` vivos ao mesmo tempo em um RefCell provocam...",
                    difficulty: "medio",
                    explanation: "O RefCell move as regras de empréstimo para o runtime: a segunda chamada encontra um empréstimo mutável ativo e dispara um panic, não um erro de compilação.",
                    options: [
                        { text: "um erro de compilação na segunda chamada", isCorrect: false },
                        { text: "um panic! em tempo de execução", isCorrect: true },
                        { text: "bloqueio da segunda chamada até a primeira sair", isCorrect: false },
                        { text: "descarte silencioso do primeiro empréstimo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `Rc<T>` não serve para compartilhar dado entre threads?",
                    difficulty: "dificil",
                    explanation: "O contador do Rc é um inteiro comum: incrementar de duas threads seria uma corrida. Por isso Rc não implementa Send nem Sync, e o compilador barra o envio; para concorrência existe o Arc, de contador atômico.",
                    options: [
                        { text: "Porque o tipo interno precisa implementar a trait Copy", isCorrect: false },
                        { text: "Porque threads não podem capturar smart pointers", isCorrect: false },
                        { text: "Porque o dado do Rc fica fora do heap do processo", isCorrect: false },
                        { text: "O contador não é atômico; Rc não é Send nem Sync", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual problema a combinação `Rc<RefCell<T>>` resolve?",
                    difficulty: "medio",
                    explanation: "O Rc dá vários donos ao mesmo dado e o RefCell permite mutação por trás dessa posse compartilhada, com as regras de empréstimo conferidas em runtime, em thread única.",
                    options: [
                        { text: "Compartilhar a leitura do mesmo dado entre várias threads", isCorrect: false },
                        { text: "Evitar o custo da alocação no heap feita pelo Box", isCorrect: false },
                        { text: "Vários donos com mutação do mesmo dado em thread única", isCorrect: true },
                        { text: "Checar os empréstimos em compilação e não em runtime", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "unsafe: a fronteira da responsabilidade",
            blocks: [
                {
                    type: "text",
                    value: "# O que o unsafe libera\n\nO Rust seguro garante memória e concorrência intactas em troca de regras. O `unsafe` é a válvula de escape declarada: dentro de um bloco ou função marcados assim, você ganha cinco poderes extras:\n\n1. Dereferenciar **ponteiros crus** (`*const T` e `*mut T`).\n2. Chamar funções e métodos `unsafe`, incluindo os de outras crates.\n3. Acessar e modificar **statics mutáveis**.\n4. Acessar campos de **unions**.\n5. Chamar funções declaradas via `extern`, a FFI.\n\nO que o unsafe **não** faz: desligar o compilador. Checagens de tipo, de limites em indexação e o borrow checker no código seguro daquele bloco seguem valendo. O unsafe abre portas específicas, não derruba o muro.",
                },
                {
                    type: "code",
                    value: "fn main() {\n    let x = 42;\n    let cru: *const i32 = &x;     // criar o ponteiro cru é seguro\n\n    unsafe {\n        println!(\"{}\", *cru);     // deref de ponteiro cru: só dentro de unsafe\n    }\n}",
                },
                {
                    type: "text",
                    value: "## As invariantes passam a ser suas\n\nDo lado seguro, o compilador sustenta as garantias. Em unsafe, quem sustenta é você: cabe garantir que o ponteiro aponta para memória válida, que nenhuma referência pendurada sobrevive, que o índice está dentro do vetor. Errar aí devolve os bugs clássicos do C: comportamento indefinido, estouro de buffer, leitura de memória liberada.\n\nA prática recomendada é enxugar a fronteira: conferir as pré-condições em código seguro, manter o bloco `unsafe` de uma linha só e encapsular tudo numa função cujo contrato continua seguro para quem chama:\n\n```rust\nfn byte_em(dados: &[u8], i: usize) -> Option<u8> {\n    if i < dados.len() {\n        Some(unsafe { *dados.get_unchecked(i) })   // invariante checada acima\n    } else {\n        None\n    }\n}\n```\n\nQuem chama `byte_em` nunca precisa saber que há unsafe ali dentro. É assim que `Vec`, `HashMap` e a std inteira são construídos: camadas seguras por cima de operações não seguras.",
                },
                {
                    type: "code",
                    value: "// Declarando uma função da libc (escrita em C) para chamar do Rust.\n// Na edition 2024, blocos extern exigem o unsafe explícito.\nunsafe extern \"C\" {\n    fn abs(input: i32) -> i32;\n}\n\nfn main() {\n    unsafe {\n        println!(\"abs(-3) = {}\", abs(-3));   // chamar código externo pede unsafe\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Quando usar\n\nO unsafe é ferramenta de infraestrutura, não de rotina. Os casos de uso reais:\n\n- **Bindings**: expor bibliotecas em C ao Rust, como as crates terminadas em `-sys` do crates.io fazem.\n- **Kernel e sistemas**: o Linux aceita Rust justamente para drivers, e esse chão é feito de ponteiros e regiões de memória.\n- **Performance pontual**: pular checagens em laços quentes com `get_unchecked`, ou usar SIMD manual.\n- **Primitivas**: implementar as fundações que o código seguro reutiliza, como um `Vec` próprio.\n\nSe o unsafe está ali só para silenciar o borrow checker, o desenho do código é que pede revisão.",
                },
                {
                    type: "quote",
                    value: "unsafe não é um modo sem leis: é um contrato em que as garantias do compilador são substituídas pela sua palavra. Fronteira pequena, invariante explícita e API segura por cima.",
                },
            ],
            questions: [
                {
                    statement: "O que um bloco `unsafe` permite que o Rust seguro não permite?",
                    difficulty: "facil",
                    explanation: "O bloco habilita os poderes extras, como dereferenciar ponteiros crus e chamar funções unsafe ou vindas de FFI. As checagens do compilador no restante seguem valendo.",
                    options: [
                        { text: "Ignorar erros de tipos nas chamadas de função", isCorrect: false },
                        { text: "Dereferenciar ponteiros crus e chamar funções unsafe", isCorrect: true },
                        { text: "Criar threads sem posse verificada pelo compilador", isCorrect: false },
                        { text: "Compilar o projeto inteiro sem passar pelo borrow checker", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual destes é um uso típico e legítimo de unsafe?",
                    difficulty: "facil",
                    explanation: "Bindings para bibliotecas em C são o caso clássico: a fronteira da FFI é inerentemente unsafe, e crates -sys encapsulam isso em APIs seguras.",
                    options: [
                        { text: "Silenciar erros do borrow checker no código do app", isCorrect: false },
                        { text: "Trocar String por char* para economizar memória", isCorrect: false },
                        { text: "Chamar funções async fora de um runtime ativo", isCorrect: false },
                        { text: "Criar bindings para uma biblioteca escrita em C", isCorrect: true },
                    ],
                },
                {
                    statement: "Como declarar uma função da libc para chamá-la do Rust?",
                    difficulty: "medio",
                    explanation: "Declara-se a assinatura em um bloco extern \"C\", que na edition 2024 exige unsafe explícito, e a chamada acontece dentro de um bloco unsafe.",
                    options: [
                        { text: "Com #[no_mangle] escrito na função do código C", isCorrect: false },
                        { text: "Serializando os argumentos para um canal da libc", isCorrect: false },
                        { text: "Num bloco `unsafe extern \"C\"` com a assinatura", isCorrect: true },
                        { text: "Reescrevendo a função como uma trait impl local", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao atravessar a fronteira unsafe, o que muda em relação aos bugs de memória?",
                    difficulty: "medio",
                    explanation: "As garantias deixam de ser verificadas pelo compilador e passam a depender de invariantes mantidas por quem escreve o código, como no C.",
                    options: [
                        { text: "Passam a ser detectados em runtime pelo próprio Rust", isCorrect: false },
                        { text: "As garantias passam a ser sustentadas por você", isCorrect: true },
                        { text: "Nada muda, unsafe é apenas um marcador documental", isCorrect: false },
                        { text: "O garbage collector assume a memória do bloco unsafe", isCorrect: false },
                    ],
                },
                {
                    statement: "Dentro de um bloco unsafe, a indexação `vetor[i]`...",
                    difficulty: "dificil",
                    explanation: "unsafe libera poderes específicos, mas não desliga checagens automáticas: a indexação continua com bounds check. Pular a checagem é um ato explícito, com get_unchecked.",
                    options: [
                        { text: "Mantém a checagem; pular exige get_unchecked", isCorrect: true },
                        { text: "Perde a checagem de limites automaticamente", isCorrect: false },
                        { text: "Passa a emitir apenas um aviso em caso de estouro", isCorrect: false },
                        { text: "Só é checada quando o vetor usado é mutável", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O caminho a partir daqui",
            blocks: [
                {
                    type: "text",
                    value: "# O ecossistema por área\n\nA linguagem é a fundação; o ecossistema é a casa. Para cada tipo de projeto há combinações consolidadas, quase sempre a um `cargo add nome` de distância.\n\nNa web, o par é **tokio + axum**: o Tokio é o runtime assíncrono que executa futures, e o axum é o framework web construído sobre ele. Para serialização, **serde** domina: com `#[derive(Serialize, Deserialize)]` seus structs viram JSON, YAML, binário e volta. Em linha de comando, **clap** monta parse de argumentos, subcomandos e help com pouco código.\n\nCompilando para o alvo `wasm32-unknown-unknown`, o mesmo Rust roda no navegador ao lado do JavaScript, com **wasm-bindgen** fazendo a ponte entre os dois mundos. No extremo oposto, **embarcados**: microcontroladores sem sistema operacional, onde `no_std` corta a biblioteca padrão e crates como `embedded-hal` abstraem o hardware.",
                },
                {
                    type: "table",
                    value: "[[\"Área\", \"Ferramentas\", \"Papel\"], [\"Web e async\", \"tokio, axum\", \"Runtime de futures e framework web\"], [\"Serialização\", \"serde, serde_json\", \"Tipos convertidos de e para JSON\"], [\"Linha de comando\", \"clap\", \"Argumentos, subcomandos e help\"], [\"WebAssembly\", \"wasm-bindgen\", \"Ponte entre Rust e JavaScript\"], [\"Embarcados\", \"embedded-hal, cortex-m\", \"Abstração de hardware em no_std\"]]",
                },
                {
                    type: "text",
                    value: "## Como escolher a próxima porta\n\nMais conteúdo não é a única saída, nem sempre a melhor. Três caminhos consolidam de verdade:\n\n**Ler código real.** Abra o fonte de uma crate que você usa. Comece pelas pequenas e bem escritas, siga os testes, veja como nomeiam, como separam módulos, onde usam unsafe. Código alheio bom é aula com gabarito.\n\n**Contribuir.** Toda crate aceita melhoria de documentação e tem issues marcadas como boas para começar. Corrigir um doc no qual você mesmo tropeçou é o caminho mais curto para aprender o interior de um projeto e ganhar revisão de quem mantém.\n\n**Terminar projetos pequenos.** Um CLI que resolve um problema seu, uma API com dois endpoints e persistência, um parser de um formato simples. Inteiro significa com erro tratado, testes, README e publicado. Um projeto findado ensina mais que três abandonados no meio.",
                },
                {
                    type: "text",
                    value: "## O borrow checker vira aliado\n\nNo começo, o compilador de Rust parece um crítico impiedoso: nada compila, toda mensagem é uma aula não pedida. Com prática, a relação inverte. Você começa a desenhar o código já em termos de posse e empréstimo, e o que era barreira passa a revisão antecipada: o erro que ele aponta hoje é o incidente que não vai acordar você de madrugada.\n\nÉ por isso que, ano após ano, os desenvolvedores elegem o Rust a linguagem mais admirada. A confiança no código que sai da sua mão se constrói na prática, uma compilação de cada vez. Siga escrevendo, leia os erros com calma, e o guardião da porta vira o revisor ao seu lado.",
                },
                {
                    type: "quote",
                    value: "Ao fim desta trilha você tem a linguagem inteira à disposição: ownership, traits, erros, coleções, concorrência, async e a fronteira unsafe. Daqui para frente é volume, leitura de código real e projetos findados. O compilador segue do seu lado.",
                },
            ],
            questions: [
                {
                    statement: "Qual o papel da crate serde nos projetos Rust?",
                    difficulty: "facil",
                    explanation: "serde é o framework de serialização: com derives, os tipos do projeto são convertidos de e para formatos como JSON, YAML e binário.",
                    options: [
                        { text: "Converter tipos de e para formatos como JSON", isCorrect: true },
                        { text: "Fornecer o runtime assíncrono do programa", isCorrect: false },
                        { text: "Interpretar argumentos de linha de comando", isCorrect: false },
                        { text: "Gerar bindings para bibliotecas escritas em C", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a crate clap entrega numa ferramenta de linha de comando?",
                    difficulty: "facil",
                    explanation: "clap faz o parse dos argumentos: flags, opções, subcomandos e mensagens de help geradas a partir das definições.",
                    options: [
                        { text: "Pool de conexões para bancos de dados", isCorrect: false },
                        { text: "Compilação cruzada para alvo WebAssembly", isCorrect: false },
                        { text: "Regras extras de lint que vão além do clippy", isCorrect: false },
                        { text: "Parse de argumentos com subcomandos e help", isCorrect: true },
                    ],
                },
                {
                    statement: "Num servidor web com axum, qual é o papel do Tokio?",
                    difficulty: "medio",
                    explanation: "O Tokio é o runtime assíncrono: ele executa as futures das quais o axum depende, cuidando do escalonador, timers e I/O não bloqueante.",
                    options: [
                        { text: "Renderizar os templates HTML das respostas", isCorrect: false },
                        { text: "Mapear tabelas do banco em structs do projeto", isCorrect: false },
                        { text: "Executar as futures em que o axum se apoia", isCorrect: true },
                        { text: "Substituir o axum como servidor embutido", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa compilar Rust para o alvo wasm32?",
                    difficulty: "medio",
                    explanation: "O compilador gera WebAssembly, um módulo que roda no navegador ao lado do JavaScript, com crates como wasm-bindgen fazendo a ponte entre as linguagens.",
                    options: [
                        { text: "Empacotar o binário num contêiner WebAssembly", isCorrect: false },
                        { text: "Gerar WebAssembly para rodar no navegador", isCorrect: true },
                        { text: "Transpilar todo o Rust para JavaScript legível", isCorrect: false },
                        { text: "Rodar o compilador inteiro dentro do navegador", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual caminho tende a consolidar mais o aprendizado de Rust?",
                    difficulty: "dificil",
                    explanation: "Projetos pequenos levados até o fim exercitam a linguagem inteira em contexto real: posse, erros, testes e empacotamento. Leitura sem prática, ou prática sem compilar, deixa lacunas.",
                    options: [
                        { text: "Ler somente livros avançados sobre lifetimes", isCorrect: false },
                        { text: "Reescrever scripts prontos de Python sem compilar", isCorrect: false },
                        { text: "Terminar projetos pequenos e inteiros, com testes", isCorrect: true },
                        { text: "Estudar primeiro todo o código do compilador", isCorrect: false },
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
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
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
                        explanation: q.explanation,
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
        "Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.",
    );
}

// Só semeia quando executado direto. Se for importado (QC e validações),
// expõe MODULOS/NOME sem rodar o seed nem chamar process.exit.
const executadoDireto =
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href;
if (executadoDireto) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
