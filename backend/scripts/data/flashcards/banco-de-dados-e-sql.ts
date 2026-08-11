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
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que uma coluna com DEFAULT dispensa no INSERT?",
                        verso: "Informar aquele valor: o banco preenche sozinho.",
                    },
                    {
                        frente: "O que acontece ao omitir no INSERT uma coluna NOT NULL sem padrão?",
                        verso: "O banco rejeita a inserção.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a cláusula WHERE faz dentro de um UPDATE?",
                        verso: "Define quais linhas o SET vai alterar.",
                    },
                    {
                        frente: "Como alterar duas colunas no mesmo UPDATE?",
                        verso: "Separando as atribuições do SET por vírgula.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre UPDATE e DELETE?",
                        verso: "UPDATE altera colunas da linha; DELETE remove a linha inteira.",
                    },
                    {
                        frente: "O que acontece num DELETE sem WHERE?",
                        verso: "Todas as linhas somem, mas a estrutura da tabela permanece.",
                    },
                    {
                        frente: "O que é soft delete?",
                        verso: "Marcar a linha como removida em vez de apagá-la de fato.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o BEGIN faz?",
                        verso: "Inicia a transação: os comandos seguintes ficam provisórios.",
                    },
                    {
                        frente: "O que o ROLLBACK desfaz?",
                        verso: "Todas as alterações feitas desde o BEGIN.",
                    },
                    {
                        frente: "Por que dois UPDATE soltos numa transferência são arriscados?",
                        verso: "Falhando no meio, o dinheiro sai de um lado e não entra no outro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a atomicidade do ACID garante?",
                        verso: "A transação roda por inteiro, ou não roda nada.",
                    },
                    {
                        frente: "O que a durabilidade do ACID garante?",
                        verso: "Depois do COMMIT, a mudança sobrevive a uma falha do banco.",
                    },
                    {
                        frente: "O que a consistência do ACID garante?",
                        verso: "Que os dados nunca violam as regras declaradas no banco.",
                    },
                    {
                        frente: "O que o isolamento do ACID garante?",
                        verso: "Que uma transação não enxerga o meio do caminho de outra.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a ideia central da normalização no dia a dia?",
                        verso: "Cada fato mora em um lugar só, separado por entidade.",
                    },
                    {
                        frente: "O que acontece quando o email do cliente se repete em toda linha?",
                        verso: "Mudou o email, é preciso atualizar linha por linha, e alguma escapa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma chave estrangeira impede?",
                        verso: "Inserir uma linha apontando para um registro que não existe.",
                    },
                    {
                        frente: "Como se chama a garantia de que a chave estrangeira aponta para algo real?",
                        verso: "Integridade referencial.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Num relacionamento de um para muitos, onde fica a chave estrangeira?",
                        verso: "No lado muitos da relação.",
                    },
                    {
                        frente: "O que transforma um relacionamento de um para muitos em um para um?",
                        verso: "Uma restrição de unicidade na coluna da chave estrangeira.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que uma chave estrangeira só não representa muitos para muitos?",
                        verso: "Uma coluna guarda um valor só, e os dois lados têm vários.",
                    },
                    {
                        frente: "O que é uma tabela de junção?",
                        verso: "A tabela criada para representar a relação de muitos para muitos.",
                    },
                    {
                        frente: "O que a tabela de junção costuma guardar além das duas chaves?",
                        verso: "Dados da própria relação, como quantidade e preço no momento.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a cláusula ON define num JOIN?",
                        verso: "A condição que casa as linhas das duas tabelas.",
                    },
                    {
                        frente: "Que JOIN traz todos os registros da tabela da esquerda?",
                        verso: "O LEFT JOIN, com nulo onde não há correspondência.",
                    },
                    {
                        frente: "O que o INNER JOIN faz com quem não tem correspondência?",
                        verso: "Deixa de fora do resultado.",
                    },
                ],
            },
        },
    },
};
