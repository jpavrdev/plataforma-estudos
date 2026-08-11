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
    },
};
