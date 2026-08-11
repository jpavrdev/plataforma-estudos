import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Discovery e Pesquisa, segunda trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz da trilha usa muito caso
 * aplicado; as cartas ficam com os números de referência (quantas entrevistas,
 * quanto tempo) e com as distinções das tabelas, que é o que se esquece.
 */
export const discoveryEPesquisa: CartasDaTrilha = {
    trilha: "Discovery e Pesquisa",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem puxa a resposta de cada um dos quatro riscos?",
                        verso: "Produto o de valor, design o de usabilidade, engenharia o técnico.",
                    },
                    {
                        frente: "Que pergunta o risco de viabilidade técnica faz?",
                        verso: "Dá para construir isso e sustentar depois?",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que custo o produto que ninguém usa continua cobrando?",
                        verso: "A manutenção do código morto, por anos seguidos.",
                    },
                    {
                        frente: "O que é custo de oportunidade num ciclo perdido?",
                        verso: "O problema real ficou sem ninguém atacando.",
                    },
                    {
                        frente: "Quanto custa corrigir uma suposição errada na entrevista?",
                        verso: "Uma frase e uma pergunta nova, depois de meia hora de conversa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quem faz o discovery contínuo, diferente do projeto de pesquisa?",
                        verso: "O próprio trio que vai construir, e não uma agência.",
                    },
                    {
                        frente: "Qual é a entrega do discovery contínuo?",
                        verso: "A decisão e o teste da semana, não um relatório.",
                    },
                    {
                        frente: "Por que o estudo de três meses acaba na gaveta?",
                        verso: "Chega fora do ritmo em que o time decide.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que os dois diamantes do double diamond representam?",
                        verso: "O espaço do problema e o espaço da solução.",
                    },
                    {
                        frente: "Qual é a saída esperada da fase de descobrir?",
                        verso: "Oportunidades cruas, ainda sem escolha.",
                    },
                    {
                        frente: "Que movimento cada fase do double diamond faz?",
                        verso: "Descobrir e desenvolver abrem; definir e entregar fecham.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que fica no degrau mais fraco da escada de evidência?",
                        verso: "A opinião sobre a ideia e o elogio gratuito.",
                    },
                    {
                        frente: "Sobre o que o dado de uso silencia?",
                        verso: "Sobre o porquê: ele mostra onde e quanto, não o motivo.",
                    },
                    {
                        frente: "Onde a declaração do entrevistado engana?",
                        verso: "Na memória seletiva sobre o próprio passado.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quantas entrevistas por segmento costumam bastar numa rodada?",
                        verso: "De cinco a oito, quando os padrões começam a se repetir.",
                    },
                    {
                        frente: "O que ouvir só usuário atual limita?",
                        verso: "Só melhora o que já existe.",
                    },
                    {
                        frente: "O que quem abandonou revela, e por que é difícil?",
                        verso: "O motivo real da desistência, mas é difícil de achar e agendar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que perguntar se a pessoa usaria não serve?",
                        verso: "Pede opinião sobre o futuro, e isso vira cortesia.",
                    },
                    {
                        frente: "O que o teste da mãe pede na prática?",
                        verso: "Perguntar o que a pessoa fez, não o que ela acha.",
                    },
                    {
                        frente: "Que pergunta mede prioridade em dinheiro?",
                        verso: "Quanto você já gastou nisso este ano?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que significa o roteiro ser bússola, e não trilho?",
                        verso: "Garante a cobertura, mas a ordem pode mudar.",
                    },
                    {
                        frente: "Quanto dura uma entrevista de discovery bem conduzida?",
                        verso: "De trinta a quarenta e cinco minutos.",
                    },
                    {
                        frente: "O que a etapa de história específica precisa entregar?",
                        verso: "Um episódio com data e ferramenta, não uma generalidade.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que contar até três em silêncio depois da resposta?",
                        verso: "A pessoa costuma completar com a parte boa.",
                    },
                    {
                        frente: "O que fazer quando o entrevistado pede a solução no meio?",
                        verso: "Devolver para o problema, em vez de virar demonstração.",
                    },
                    {
                        frente: "Qual é o problema de perguntar se algo não é frustrante?",
                        verso: "Planta a emoção na pessoa em vez de descobri-la.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em quanto tempo a síntese depois da entrevista deve acontecer?",
                        verso: "Em vinte e quatro a quarenta e oito horas, com memória fresca.",
                    },
                    {
                        frente: "O que o time faz num mapa de afinidade?",
                        verso: "Agrupa cartões parecidos até um padrão aparecer.",
                    },
                    {
                        frente: "Como classificar quando o entrevistado pede um botão?",
                        verso: "Como solução pedida: pergunte o problema por trás.",
                    },
                    {
                        frente: "O que separa uma dor de um desejo declarado?",
                        verso: "A dor vem com comportamento; o desejo, só com vontade.",
                    },
                ],
            },
        },
    },
};
