import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Data Lake e Lakehouse, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * arquitetura; as cartas guardam as definições fechadas, os nomes dos
 * table formats e as regras de bolso que a aula enuncia de passagem.
 */
export const dataLakeELakehouse: CartasDaTrilha = {
    trilha: "Data Lake e Lakehouse",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o warehouse tradicional é, na definição da aula?",
                        verso: "Especializado: ótimo para SQL sobre dado limpo e modelado.",
                    },
                    {
                        frente: "Para o que o warehouse tradicional fica caro e rígido?",
                        verso: "Para o que é volumoso, variado ou ainda sem forma definida.",
                    },
                    {
                        frente: "Que exigência o warehouse faz antes de guardar o dado?",
                        verso: "Um esquema definido de antemão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que lema resume o data lake?",
                        verso: "Guardar primeiro, dar sentido depois.",
                    },
                    {
                        frente: "O que o lake troca pela flexibilidade?",
                        verso: "A rigidez do esquema antecipado.",
                    },
                    {
                        frente: "Quando o lake decide o que o dado significa?",
                        verso: "Na hora da leitura.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o object storage faz com o dado?",
                        verso: "Só guarda e devolve quando alguém pede.",
                    },
                    {
                        frente: "O que o object storage não faz?",
                        verso: "Processar o dado.",
                    },
                    {
                        frente: "O que essa simplicidade traz?",
                        verso: "Custo baixo e durabilidade, como base de todo o resto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Lake e warehouse competem pelo mesmo trabalho?",
                        verso: "Não: cada um cobre uma etapa diferente.",
                    },
                    {
                        frente: "O que o lake é, nessa divisão?",
                        verso: "Onde o dado bruto tem espaço para existir.",
                    },
                    {
                        frente: "O que o warehouse é, nessa divisão?",
                        verso: "Onde o dado já tratado vira resposta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que falta num lake que virou pântano?",
                        verso: "Catálogo, dono e controle de qualidade.",
                    },
                    {
                        frente: "O que o pântano faz com o custo?",
                        verso: "Transfere do armazenamento para o tempo das pessoas.",
                    },
                    {
                        frente: "O lake sem governança sai mais barato?",
                        verso: "Não: o custo só muda de lugar.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta a zona raw responde?",
                        verso: "O que aconteceu.",
                    },
                    {
                        frente: "Que pergunta a zona de staging responde?",
                        verso: "O que é válido.",
                    },
                    {
                        frente: "Que pergunta a zona curated responde?",
                        verso: "O que importa para o negócio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tipo de decisão o particionamento é?",
                        verso: "Física: define como os arquivos ficam no storage.",
                    },
                    {
                        frente: "Que estrago a coluna errada de partição causa?",
                        verso: "Explode o número de arquivos do lake.",
                    },
                    {
                        frente: "Que coluna costuma organizar bem o layout?",
                        verso: "A de data, no caminho das pastas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Parquet é no lake, segundo a aula?",
                        verso: "A língua franca.",
                    },
                    {
                        frente: "Como o dado sai depois de convertido?",
                        verso: "Em colunas comprimidas, prontas para consulta eficiente.",
                    },
                    {
                        frente: "Que ganho o formato colunar traz na leitura?",
                        verso: "Ler só as colunas que a consulta pede.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que vale mais: poucos arquivos grandes ou muitos pequenos?",
                        verso: "Poucos arquivos grandes.",
                    },
                    {
                        frente: "O que muda entre os dois casos?",
                        verso: "O custo de leitura, e não o volume de dados.",
                    },
                    {
                        frente: "O que a compactação faz com os arquivos pequenos?",
                        verso: "Junta em arquivos maiores, sem mudar o conteúdo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um catálogo transforma?",
                        verso: "Arquivos em tabelas.",
                    },
                    {
                        frente: "O que é o lake sem catálogo?",
                        verso: "Uma pasta cheia de arquivos.",
                    },
                    {
                        frente: "O que é o lake com catálogo?",
                        verso: "Um banco de dados consultável.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que uma tabela no lake cru realmente é?",
                        verso: "Uma pasta com arquivos, e não uma unidade transacional.",
                    },
                    {
                        frente: "O que nada impede no lake cru?",
                        verso: "Dois escritores pisarem no trabalho um do outro.",
                    },
                    {
                        frente: "Que leitura o lake cru permite no meio de uma escrita?",
                        verso: "A inconsistente, com só parte dos arquivos novos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto custa mudar duas linhas numa partição enorme?",
                        verso: "O mesmo que reescrever a partição inteira.",
                    },
                    {
                        frente: "O que não existe num arquivo Parquet?",
                        verso: "Update parcial de uma linha.",
                    },
                    {
                        frente: "Que operação o lake cru exige para corrigir um dado?",
                        verso: "Reescrever por inteiro os arquivos afetados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que schema-on-read não é?",
                        verso: "Ausência de schema.",
                    },
                    {
                        frente: "O que ele é, então?",
                        verso: "Ausência de fiscalização no momento da escrita.",
                    },
                    {
                        frente: "Onde o schema existe quando ninguém verifica?",
                        verso: "Na cabeça de quem projetou.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um backup manual, na comparação da aula?",
                        verso: "Uma cópia que alguém lembrou de fazer a tempo.",
                    },
                    {
                        frente: "O que é versionamento de verdade?",
                        verso: "Uma garantia estrutural, que não depende de lembrança.",
                    },
                    {
                        frente: "O que falta no lake cru para desfazer uma escrita?",
                        verso: "O registro das versões anteriores da tabela.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que não muda quando se adota um table format?",
                        verso: "O lugar e o formato dos dados.",
                    },
                    {
                        frente: "O que passa a existir com ele?",
                        verso: "Controle transacional sobre quais arquivos formam a tabela.",
                    },
                    {
                        frente: "O que define a tabela em cada momento?",
                        verso: "O conjunto de arquivos registrado nos metadados.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O table format substitui o Parquet?",
                        verso: "Não: ele organiza os mesmos arquivos colunares.",
                    },
                    {
                        frente: "O que a camada de metadados transforma?",
                        verso: "Uma pasta em tabela.",
                    },
                    {
                        frente: "O que continua sendo o formato dos dados?",
                        verso: "O Parquet, arquivo por arquivo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que define o estado de uma tabela Delta?",
                        verso: "Os commits registrados no log, aplicados em ordem.",
                    },
                    {
                        frente: "O que não define esse estado?",
                        verso: "O que está na pasta naquele instante.",
                    },
                    {
                        frente: "Onde o Delta guarda esse registro?",
                        verso: "No log de transações, ao lado dos dados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o particionamento é no Iceberg?",
                        verso: "Um detalhe de organização por baixo.",
                    },
                    {
                        frente: "O que ele deixa de ser?",
                        verso: "Um contrato que quem consulta precisa repetir.",
                    },
                    {
                        frente: "O que o Iceberg guarda a cada escrita?",
                        verso: "Um snapshot da tabela naquele momento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando o copy-on-write paga o custo de mesclar?",
                        verso: "No momento da escrita.",
                    },
                    {
                        frente: "Para quando o merge-on-read adia esse custo?",
                        verso: "Para o momento da leitura.",
                    },
                    {
                        frente: "Algum dos dois é superior?",
                        verso: "Não: é uma troca entre escrita e leitura.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que importa saber antes de escolher o table format?",
                        verso: "Que os três resolvem o mesmo problema central.",
                    },
                    {
                        frente: "Qual é a escolha certa entre eles?",
                        verso: "A que se encaixa no ambiente e nas ferramentas do time.",
                    },
                    {
                        frente: "Qual não é o critério principal?",
                        verso: "Qual deles é tecnicamente superior.",
                    },
                ],
            },
        },
    },
};
