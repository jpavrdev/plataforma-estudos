import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Banco de Dados e SQL, quarta trilha do roadmap de QA e Testes.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz da trilha cobra muito
 * consulta inteira escrita; as cartas ficam com o que cada palavra-chave faz e
 * com as diferenças que se confundem, como WHERE contra HAVING.
 */
export const bancoDeDadosESql: CartasDaTrilha = {
    trilha: "Banco de Dados e SQL",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três garantias um banco dá que um arquivo de texto não dá?",
                        verso: "Persistência, busca eficiente e acesso concorrente seguro.",
                    },
                    {
                        frente: "O que uma planilha oferece de acesso concorrente?",
                        verso: "Apenas limitado, diferente do banco.",
                    },
                    {
                        frente: "Por que a lista some depois de um deploy que reinicia o servidor?",
                        verso: "Estava em memória do processo, que zera ao reiniciar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o nome técnico de cada linha de uma tabela?",
                        verso: "Registro.",
                    },
                    {
                        frente: "O que cada coluna de uma tabela representa?",
                        verso: "Uma característica presente em todo registro daquela tabela.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tipo guarda número com casas decimais exatas?",
                        verso: "NUMERIC.",
                    },
                    {
                        frente: "Que tipo guarda data e hora juntas?",
                        verso: "TIMESTAMP. Só a data é DATE.",
                    },
                    {
                        frente: "Que problema surge ao guardar preço como texto?",
                        verso: "A soma não funciona: o banco concatena em vez de somar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a função da chave primária?",
                        verso: "Identificar cada linha de forma única.",
                    },
                    {
                        frente: "O que o banco faz se uma linha nova repetir a chave primária?",
                        verso: "Impede a operação e rejeita o valor duplicado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como um banco de documentos organiza os dados?",
                        verso: "Em documentos flexíveis, no formato JSON, sem esquema fixo.",
                    },
                    {
                        frente: "Qual é o principal caso de uso de um banco chave-valor?",
                        verso: "Leitura e escrita muito rápidas, como cache e sessão.",
                    },
                    {
                        frente: "O que o modelo relacional oferece de mais forte?",
                        verso: "Integridade sobre dados estruturados e relacionados.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que a consulta com asterisco retorna?",
                        verso: "Todas as colunas e todas as linhas da tabela.",
                    },
                    {
                        frente: "Que palavra dá um apelido a uma coluna no resultado?",
                        verso: "AS, que renomeia só na saída, não na tabela.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que palavra exige que duas condições sejam verdadeiras juntas?",
                        verso: "AND.",
                    },
                    {
                        frente: "Que operador encontra texto em qualquer posição da coluna?",
                        verso: "LIKE, com o curinga de porcentagem dos dois lados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que ordem o ORDER BY organiza sem ASC nem DESC?",
                        verso: "Crescente, o ASC.",
                    },
                    {
                        frente: "Que cláusula corta o resultado nas primeiras linhas?",
                        verso: "LIMIT.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que função conta todas as linhas, inclusive com coluna nula?",
                        verso: "COUNT com asterisco.",
                    },
                    {
                        frente: "O que COUNT de uma coluna específica ignora?",
                        verso: "As linhas em que aquela coluna é nula.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o GROUP BY faz numa consulta?",
                        verso: "Agrupa linhas por coluna, para depois agregar.",
                    },
                    {
                        frente: "Qual é a diferença entre WHERE e HAVING?",
                        verso: "WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois.",
                    },
                ],
            },
        },
    },
};
