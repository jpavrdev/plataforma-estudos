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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Quem criou o modelo de OKR e quem o popularizou?",
                        verso: "Andy Grove, na Intel, e John Doerr depois dele.",
                    },
                    {
                        frente: "Que natureza tem o Objetivo, ao contrário do Key Result?",
                        verso: "Qualitativo, inspirador e com prazo, sem número na frase.",
                    },
                    {
                        frente: "O que é uma iniciativa, na anatomia do OKR?",
                        verso: "O trabalho em si: uma hipótese de alavanca, trocável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a régua rápida pra saber se um número serve como KR?",
                        verso: "Se entregarmos tudo e ele não se mover, fracassamos?",
                    },
                    {
                        frente: "Quantos Key Results por objetivo a aula recomenda?",
                        verso: "De dois a quatro; acima disso vira lista de desejos.",
                    },
                    {
                        frente: "Que regra final de qualidade fecha a escrita de KRs?",
                        verso: "Alguém de fora, lendo só os KRs, diz o que melhorou pro usuário.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quanto tempo dura um check-in de OKR, e com que frequência?",
                        verso: "De quinze a trinta minutos, toda semana ou a cada duas.",
                    },
                    {
                        frente: "O que a nota de confiança acrescenta ao valor do KR?",
                        verso: "O termômetro de vamos chegar lá, que vira decisão em vez de leitura.",
                    },
                    {
                        frente: "Pode mudar OKR no meio do trimestre?",
                        verso: "Raramente, e sempre com data e motivo registrados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome a aula dá à meta batida com o outcome piorado?",
                        verso: "Efeito cobra em versão corporativa.",
                    },
                    {
                        frente: "Qual é o par de guarda do KR de cadastros?",
                        verso: "A ativação em sete dias, que não pode piorar junto.",
                    },
                    {
                        frente: "Como corrigir um KR binário de entrega que não dá leitura?",
                        verso: "Quebrar em marcos verificáveis ou declarar como compromisso.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta decide se vale a pena adotar OKR?",
                        verso: "Se o custo do ritual é menor que o foco e o alinhamento que compra.",
                    },
                    {
                        frente: "Que desenho serve melhor a uma crise aguda no trimestre?",
                        verso: "Plano de guerra com check-in diário, sem a cerimônia de OKR.",
                    },
                    {
                        frente: "O que descartar quando a ferramenta não serve à estratégia?",
                        verso: "A ferramenta, nunca a estratégia.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Por que a comparação com obra civil não vale pra produto?",
                        verso: "A estimativa do nunca construído tem variância que o formato não registra.",
                    },
                    {
                        frente: "O que o executivo ganha e o que perde com o roadmap de datas?",
                        verso: "Ganha previsibilidade de entrega e perde a de resultado.",
                    },
                    {
                        frente: "Qual escolha perversa o time enfrenta quando a evidência muda?",
                        verso: "Entregar o inútil combinado ou pagar o custo de furar o roadmap.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que horizonte típico cobre a coluna Later?",
                        verso: "Além de dois trimestres, com compromisso baixo de propósito.",
                    },
                    {
                        frente: "Que nível de detalhe cabe na coluna Next?",
                        verso: "Médio: o problema definido, com a solução ainda em descoberta.",
                    },
                    {
                        frente: "Com que dois campos cada item do roadmap nasce?",
                        verso: "A justificativa do problema e a medida de como saberemos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o time passa a fazer assim que uma data vira promessa?",
                        verso: "Gerencia pra data: corta escopo, adia refatoração e esconde risco.",
                    },
                    {
                        frente: "O que de fato destrói a confiança do stakeholder?",
                        verso: "A incerteza descoberta depois, não a incerteza avisada.",
                    },
                    {
                        frente: "Que quarto nível a tabela acrescenta aos três de compromisso?",
                        verso: "Fora do plano: não está na direção atual, e o porquê é dito.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o recorte do time precisa carregar, além dos problemas?",
                        verso: "As medidas de sucesso, o que está fora do escopo e a razão.",
                    },
                    {
                        frente: "O que cortar do recorte que vai pro cliente e pra vendas?",
                        verso: "A aposta interna e qualquer data decorativa sem compromisso.",
                    },
                    {
                        frente: "Quando um tema muda de horizonte, o que precisa acontecer?",
                        verso: "Os três recortes mudam na mesma semana, com o mesmo porquê.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três perguntas cada item da pauta de revisão responde?",
                        verso: "O que aprendemos, o que muda no plano e o que fica registrado.",
                    },
                    {
                        frente: "Que três coisas caras o registro de decisão compra?",
                        verso: "Memória do time, proteção contra revisionismo e leitura do processo.",
                    },
                    {
                        frente: "O que a revisão faz com a demo impressionante do concorrente?",
                        verso: "Nada no plano: investiga o problema por trás dela.",
                    },
                ],
            },
        },
    },
};
