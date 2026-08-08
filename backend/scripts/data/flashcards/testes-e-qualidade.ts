import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Testes e Qualidade, segunda trilha do roadmap de QA e Testes.
 *
 * Sem trilhos de linguagem: tudo em "neutra". A trilha usa Vitest como
 * ferramenta, então aqui entram comandos e nomes de matcher, que é o que se
 * esquece entre um projeto e outro.
 */
export const testesEQualidade: CartasDaTrilha = {
    trilha: "Testes e Qualidade",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que é uma regressão em teste automatizado?",
                        verso: "Algo que funcionava e passou a falhar depois de uma mudança.",
                    },
                    {
                        frente: "Que garantia o README não dá e o teste dá?",
                        verso: "O teste executa e falha quando o comportamento muda; o texto não.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a repetição manual induz a pular passo?",
                        verso: "Cansa. O automatizado executa o mesmo roteiro sempre.",
                    },
                    {
                        frente: "Quando o teste automatizado pode rodar, diferente do manual?",
                        verso: "A cada commit, no CI, sem depender de alguém lembrar.",
                    },
                    {
                        frente: "O que o teste manual tende a cobrir, e o que costuma escapar?",
                        verso: "Cobre o caminho feliz; os casos raros escapam.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que velocidade cada nível da pirâmide roda?",
                        verso: "Milissegundos no unitário, dezenas no integração, segundos no E2E.",
                    },
                    {
                        frente: "Por que o unitário roda tão mais rápido que o E2E?",
                        verso: "Não toca banco, rede ou disco: só a unidade isolada em memória.",
                    },
                    {
                        frente: "O que o nível de integração junta?",
                        verso: "Peças conversando, como rota, service e banco de teste.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que um getter trivial não precisa de teste?",
                        verso: "Não existe decisão nem cálculo ali que possa estar errado.",
                    },
                    {
                        frente: "Que tipo de caso concentra a maioria dos bugs reais?",
                        verso: "As bordas de uma regra: zero, negativo e o limite.",
                    },
                    {
                        frente: "Por que validação de entrada vale teste de perto?",
                        verso: "Dado inválido que passa vira problema lá na frente.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o describe agrupa num arquivo de teste?",
                        verso: "Testes relacionados, em geral da mesma função ou módulo.",
                    },
                    {
                        frente: "O que um teste em vermelho no terminal indica?",
                        verso: "O valor recebido não bateu com o esperado no expect.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que comando instala o Vitest como dependência de desenvolvimento?",
                        verso: "npm install -D vitest",
                    },
                    {
                        frente: "Por que o Vitest não termina sozinho ao rodar sem argumento?",
                        verso: "Ele entra em watch mode e reroda a cada mudança salva.",
                    },
                    {
                        frente: "O que caracteriza um teste unitário?",
                        verso: "Testa uma função isolada, sem tocar banco de dados ou rede.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que diferença existe entre it e test no Vitest?",
                        verso: "Nenhuma: são sinônimos na mesma API.",
                    },
                    {
                        frente: "O que o expect faz dentro de um it?",
                        verso: "Afirma que um valor bateu com o esperado.",
                    },
                    {
                        frente: "O que agrupar em describe melhora na leitura do resultado?",
                        verso: "A saída sai organizada por grupo, e não como lista solta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que matcher compara dois números primitivos?",
                        verso: "O toBe, que usa igualdade estrita.",
                    },
                    {
                        frente: "Que matcher compara objetos campo a campo?",
                        verso: "O toEqual.",
                    },
                    {
                        frente: "Por que toBe falha ao comparar dois objetos iguais?",
                        verso: "Ele compara referência, e são objetos diferentes na memória.",
                    },
                    {
                        frente: "Que matcher verifica se uma função lança erro?",
                        verso: "O toThrow.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a etapa Arrange representa no padrão AAA?",
                        verso: "A preparação dos dados e do estado antes da ação.",
                    },
                    {
                        frente: "Que etapa do AAA contém a chamada da função testada?",
                        verso: "A etapa Act.",
                    },
                    {
                        frente: "Qual é o problema de misturar o AAA numa linha só?",
                        verso: "Fica difícil separar entrada, ação e verificação depois.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que comando roda os testes uma vez só, sem watch mode?",
                        verso: "npx vitest run",
                    },
                    {
                        frente: "O que as linhas Expected e Received indicam numa falha?",
                        verso: "O valor esperado pelo expect contra o valor que veio.",
                    },
                    {
                        frente: "Que valores de borda costumam revelar defeito?",
                        verso: "Vazio, negativo e o valor exato do limite.",
                    },
                ],
            },
        },
    },
};
