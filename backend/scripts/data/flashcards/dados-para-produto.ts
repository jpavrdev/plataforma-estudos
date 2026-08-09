import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Dados para Produto, quarta trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz da trilha cobra as contas
 * do Financem; as cartas ficam com as definições, as listas fechadas e os
 * números de referência que sustentam essas contas.
 */
export const dadosParaProduto: CartasDaTrilha = {
    trilha: "Dados para Produto",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três perguntas fazem a triagem de uma métrica candidata?",
                        verso: "Tem responsável? Tem alavanca em semanas? Ela pode piorar?",
                    },
                    {
                        frente: "Que decisão o time tirou da razão de 20% entre diários e mensais?",
                        verso: "Investir no resumo semanal e medir de novo em quatro semanas.",
                    },
                    {
                        frente: "O que perguntar quando o tempo médio na tela sobe?",
                        verso: "Se o tempo maior veio de valor entregue ou de confusão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas uma boa north star combina?",
                        verso: "Largura, profundidade e frequência do valor entregue.",
                    },
                    {
                        frente: "Qual é o teste de uma candidata a north star?",
                        verso: "Se subir 30%, o usuário fica claramente melhor e o negócio de pé?",
                    },
                    {
                        frente: "Quantas north stars um produto deve ter, e com que companhia?",
                        verso: "Uma só, acompanhada de duas ou três métricas de contexto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o erro de um time que só acompanha métricas de entrada?",
                        verso: "Comemora a alavanca enquanto o resultado despenca sem ser checado.",
                    },
                    {
                        frente: "Quantos assinantes novos igualariam o efeito de um ponto de churn?",
                        verso: "Mil e vinte por mês, contra novecentos hoje, e isso custa mídia.",
                    },
                    {
                        frente: "O que faz a discussão sobre a árvore de métricas ser produtiva?",
                        verso: "As suposições ficarem visíveis, pra discordância cair sobre elas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que distingue uma taxa de uma razão?",
                        verso: "Na taxa o numerador é subconjunto do denominador; na razão, não.",
                    },
                    {
                        frente: "Qual é o antídoto contra taxa com denominador ambíguo?",
                        verso: "Escrever o denominador dentro do próprio nome da métrica.",
                    },
                    {
                        frente: "Quando a média de ticket deixa de informar?",
                        verso: "Quando mistura populações; aí valem mediana e faixas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as cinco camadas de um painel de produto?",
                        verso: "North star, entradas, funil, saúde técnica e exploração.",
                    },
                    {
                        frente: "Onde mora a consulta de exploração?",
                        verso: "Fora do painel: vira gráfico fixo só se a pergunta for recorrente.",
                    },
                    {
                        frente: "Por que quebrar o painel por plataforma e coorte de entrada?",
                        verso: "O agregado esconde um lado caindo enquanto o outro sobe.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que remédio cada uma das três primeiras etapas do AARRR pede?",
                        verso: "Canal na aquisição, primeiro uso na ativação e produto na retenção.",
                    },
                    {
                        frente: "Em que ordem se lê e em que ordem se trabalha o AARRR?",
                        verso: "Lê de cima pra baixo; trabalha de baixo pra cima em produto jovem.",
                    },
                    {
                        frente: "Por que aquisição paga é comparada a aluguel?",
                        verso: "Parou de pagar, parou de chegar: não fica nada acumulado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Pra que serve o custo por instalação, já que ele engana?",
                        verso: "Pra comparar criativos dentro de um mesmo canal.",
                    },
                    {
                        frente: "O que quebrou a atribuição determinística até 2026?",
                        verso: "Restrição de identificador no celular e fim do cookie de terceiro.",
                    },
                    {
                        frente: "Quais três caminhos honestos sobraram para atribuição?",
                        verso: "Modelagem estatística, pesquisa no cadastro e experimento por região.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais quatro filtros um bom critério de ativação precisa passar?",
                        verso: "Correlaciona, acontece cedo, alcança muita gente e o produto influencia.",
                    },
                    {
                        frente: "Qual é a diferença entre setup moment e habit moment?",
                        verso: "Setup é a configuração; hábito é o retorno espontâneo depois.",
                    },
                    {
                        frente: "Quanto reteve quem não conectou nenhuma conta no Financem?",
                        verso: "Três por cento em trinta dias, contra 50% de quem conectou duas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como se calcula a vida média de um assinante?",
                        verso: "Um dividido pelo churn mensal: 5% ao mês dá vinte meses.",
                    },
                    {
                        frente: "Com fator K de 0,36, quantos usuários 100 acabam virando?",
                        verso: "Cerca de 156, porque um dividido por 0,64 dá 1,56.",
                    },
                    {
                        frente: "Para que o NPS de fato serve?",
                        verso: "Série temporal do mesmo público e, principalmente, o campo aberto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Financem faz, como produto?",
                        verso: "Conecta contas, categoriza gastos e manda um resumo semanal.",
                    },
                    {
                        frente: "Que três perguntas o funil completo permite fazer?",
                        verso: "Onde se perde mais em absoluto, em relativo e o que dá pra mexer já.",
                    },
                    {
                        frente: "Quanto custaria comprar os mesmos 160 assinantes extras?",
                        verso: "Mais de 13 mil instalações, algo como R$ 156.000 por mês.",
                    },
                ],
            },
        },
    },
};
