import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Estratégia e Priorização, terceira trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobre os julgamentos de
 * cenário; as cartas ficam com os nomes próprios (Rumelt, Cagan), os horizontes
 * e as listas fechadas das tabelas, que é o que escapa depois de uma leitura.
 */
export const estrategiaEPriorizacao: CartasDaTrilha = {
    trilha: "Estratégia e Priorização",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o horizonte de uma visão de produto?",
                        verso: "De três a cinco anos, contra o de um a dois da estratégia.",
                    },
                    {
                        frente: "Quais são as três assinaturas de uma visão ruim?",
                        verso: "Superlativo sem medida, abstração sem cena e ambição sem recorte.",
                    },
                    {
                        frente: "Que teste prático diz se a sua visão vale alguma coisa?",
                        verso: "Ver se ela teria ajudado nas três últimas decisões difíceis.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem catalogou os planos que se dizem estratégia e não são?",
                        verso: "Richard Rumelt, que batizou o padrão de má estratégia.",
                    },
                    {
                        frente: "Qual é o teste rápido pra saber se um plano é estratégia?",
                        verso: "Procurar um 'não faremos' escrito com todas as letras.",
                    },
                    {
                        frente: "Em que ordem a falta de escolha cobra a conta?",
                        verso: "Primeiro do time, depois do usuário e por fim da empresa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais quatro técnicas mantêm a régua do diagnóstico?",
                        verso: "Escrever antes, separar fato de leitura, buscar contraprova e testar proibição.",
                    },
                    {
                        frente: "De que tamanho é um bom diagnóstico?",
                        verso: "Cabe em três frases que qualquer um repete no corredor.",
                    },
                    {
                        frente: "O que mudou no diagnóstico com os painéis de 2026?",
                        verso: "Não falta dado, sobra: o difícil é escolher quais contam a história.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "A que a política orientadora é comparada na aula?",
                        verso: "Às margens da estrada: não dizem onde parar, evitam o pasto.",
                    },
                    {
                        frente: "Quais são as três peças do núcleo de estratégia de Rumelt?",
                        verso: "Diagnóstico, política orientadora e ações coerentes.",
                    },
                    {
                        frente: "O que o teste do reforço pergunta sobre duas iniciativas?",
                        verso: "Se uma deixa a outra mais fácil ou mais valiosa de entregar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta o nível de time responde, abaixo do de produto?",
                        verso: "Qual solução construir e como validar que ela funciona.",
                    },
                    {
                        frente: "Que seções compõem o one-pager de estratégia?",
                        verso: "Diagnóstico, aposta com os nãos, ações, medidas em outcome e riscos.",
                    },
                    {
                        frente: "Quando a estratégia não pode mudar?",
                        verso: "Por cansaço ou reunião ruim, sem nenhuma evidência nova.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o SAM mede, entre o TAM e o SOM?",
                        verso: "A fatia que o produto, como ele existe hoje, consegue servir.",
                    },
                    {
                        frente: "Que quatro critérios pesam na escolha de um segmento?",
                        verso: "Intensidade da dor, acesso, disposição a pagar e efeito de rede.",
                    },
                    {
                        frente: "Que três ativos a dominação de um nicho gera?",
                        verso: "Boca a boca no grupo, profundidade de produto e dado específico.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que campo do posicionamento impede que ele vire ficção?",
                        verso: "A prova: a evidência de que a vantagem é verdade hoje.",
                    },
                    {
                        frente: "Qual é o teste de qualidade do campo 'para quem'?",
                        verso: "A exclusão: ele precisa deixar gente de fora.",
                    },
                    {
                        frente: "O que um bom 'por que ganha' precisa citar?",
                        verso: "Algo que a alternativa não consegue copiar amanhã de manhã.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que rotina de concorrência a aula recomenda?",
                        verso: "Meia hora por mês em reviews, changelog e vagas abertas.",
                    },
                    {
                        frente: "Qual é o objetivo de acompanhar concorrente?",
                        verso: "Detectar tendência, não reagir a cada evento isolado.",
                    },
                    {
                        frente: "Que três tipos de sinal do concorrente merecem atenção?",
                        verso: "Movimento de posicionamento, resultado visível e aposta estrutural.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as quatro famílias de fosso?",
                        verso: "Efeito de rede, dados proprietários, custo de troca e marca.",
                    },
                    {
                        frente: "Qual é a pergunta certa de PM sobre fosso?",
                        verso: "Qual fosso estamos cavando de propósito neste trimestre?",
                    },
                    {
                        frente: "O que o fosso faz e o que ele não faz?",
                        verso: "Protege a casa; não constrói o produto bom no lugar dela.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é ancoragem numa decisão de preço?",
                        verso: "O primeiro número visto vira régua para todos os seguintes.",
                    },
                    {
                        frente: "Qual é o risco embutido no preço por uso?",
                        verso: "Conta imprevisível, que assusta o cliente antes de assinar.",
                    },
                    {
                        frente: "Como testar preço, segundo a aula?",
                        verso: "Como hipótese, com coortes e disposição a pagar, sem achismo.",
                    },
                ],
            },
        },
    },
};
