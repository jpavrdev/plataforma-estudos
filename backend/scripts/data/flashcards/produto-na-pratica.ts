import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Produto na Prática, quinta trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas ficam com as listas fechadas, os nomes de cada peça e as
 * regras práticas que a aula enuncia de passagem.
 */
export const produtoNaPratica: CartasDaTrilha = {
    trilha: "Produto na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a proposta do Financem no plano de lançamento?",
                        verso: "Saber quanto dá pra gastar sem comprometer o imposto do mês.",
                    },
                    {
                        frente: "Que três respostas de cabeça indicam um GTM saudável?",
                        verso: "Quem usa primeiro, onde ela está e que frase faz ela clicar.",
                    },
                    {
                        frente: "O que acontece quando a campanha promete mais que o produto?",
                        verso: "Cadastro e cancelamento na mesma semana, e confiança queimada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome tem a fase interna de lançamento?",
                        verso: "Dogfooding: o próprio time usa e acha o absurdo óbvio.",
                    },
                    {
                        frente: "Que três coisas cada fase precisa ter, na regra do Financem?",
                        verso: "Dono, data máxima e critério numérico escrito antes de abrir.",
                    },
                    {
                        frente: "Que pergunta honesta se faz antes de pular uma fase?",
                        verso: "O que faríamos se o pior acontecesse com a base inteira dentro?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são os quatro tipos de feature flag?",
                        verso: "De release, de experimento, operacional e de permissão.",
                    },
                    {
                        frente: "Que tipos de flag são permanentes por natureza?",
                        verso: "As de permissão e as operacionais, com nome claro e documentação.",
                    },
                    {
                        frente: "Que pergunta substitui a de quando o código sobe?",
                        verso: "Para quem isso já está ligado?",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que um checklist copiado da internet vale pouco?",
                        verso: "Ele é a memória escrita dos erros do seu time, não de outro.",
                    },
                    {
                        frente: "Como é o ritual de go de um lançamento?",
                        verso: "Quinze minutos na véspera, item por item, podendo dizer que não.",
                    },
                    {
                        frente: "Por que sexta à tarde continua sendo má janela de lançamento?",
                        verso: "Não é superstição: quem sabe consertar já viajou.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que ordem ler os sinais da primeira semana?",
                        verso: "Saúde, adoção, qualidade do uso e só então a opinião.",
                    },
                    {
                        frente: "Que tipo de problema pede iteração em vez de reversão?",
                        verso: "O de ajuste: texto confuso, passo a mais, limite mal escolhido.",
                    },
                    {
                        frente: "O que registrar no fim da primeira semana?",
                        verso: "O que esperávamos, o que aconteceu e o que faremos, com os números.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Como funciona o loop pago de crescimento?",
                        verso: "A receita do usuário adquirido financia a aquisição do próximo.",
                    },
                    {
                        frente: "Que dois loops compensam a viralidade fraca do Financem?",
                        verso: "O de conteúdo sobre imposto e o de parceria com contadores.",
                    },
                    {
                        frente: "O que medir antes de comemorar o desenho de um loop?",
                        verso: "Quanto tempo cada volta do ciclo realmente leva.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três partes uma boa definição de ativação tem?",
                        verso: "Ação, quantidade e prazo, tudo escrito numa frase só.",
                    },
                    {
                        frente: "Que passos do onboarding podem esperar?",
                        verso: "Os que trabalham pra nós: origem, telefone e aceite de comunicação.",
                    },
                    {
                        frente: "O que costuma aparecer no percentil 90 do time to value?",
                        verso: "Um número absurdo, enquanto a mediana parece aceitável.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que gatilhos externos respeitam o usuário no Financem?",
                        verso: "Aviso no dia da nota, resumo na sexta e alerta perto do limite.",
                    },
                    {
                        frente: "Como um padrão escuro cobra a conta depois?",
                        verso: "Em desinstalação, avaliação ruim na loja e desconfiança.",
                    },
                    {
                        frente: "De onde vem retenção alta, quase sempre?",
                        verso: "De hábito: o produto se encaixa numa rotina que já existe.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o risco principal do canal orgânico?",
                        verso: "Depender do algoritmo de alguém que pode mudar a regra.",
                    },
                    {
                        frente: "Que duas defesas protegem contra a saturação de canal?",
                        verso: "Manter um canal fora do leilão e medir o payback do cliente.",
                    },
                    {
                        frente: "Por que a alta do custo de aquisição não é culpa do time?",
                        verso: "É física do canal: o público mais óbvio se esgota com o tempo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais cinco elementos todo experimento de growth carrega?",
                        verso: "Hipótese, métrica de decisão, critério de parada, guarda e registro.",
                    },
                    {
                        frente: "Que pergunta a revisão trimestral de experimentos faz?",
                        verso: "O que aprendemos que mudou o rumo do produto?",
                    },
                    {
                        frente: "Que exemplo mostra o ganho que rouba de outro lugar?",
                        verso: "Cadastro encurtado sobe contas criadas e desaba a ativação.",
                    },
                ],
            },
        },
    },
};
