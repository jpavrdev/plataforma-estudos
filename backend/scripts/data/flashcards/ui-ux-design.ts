import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de UI/UX Design, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto; as cartas guardam as definições fechadas, os números das
 * normas e as listas de princípios que a aula enuncia de passagem.
 */
export const uiUxDesign: CartasDaTrilha = {
    trilha: "UI/UX Design",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a experiência do usuário abrange?",
                        verso: "Tudo o que a pessoa sente e vivencia ao usar o produto.",
                    },
                    {
                        frente: "A experiência começa e termina na tela?",
                        verso: "Não: ela cobre a jornada inteira.",
                    },
                    {
                        frente: "O que a experiência inclui além do produto?",
                        verso: "O suporte, a espera e o que vem depois do uso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a interface do usuário é?",
                        verso: "A camada visível e interativa do produto.",
                    },
                    {
                        frente: "Que elementos formam essa camada?",
                        verso: "Botões, cores, tipografia, ícones e campos.",
                    },
                    {
                        frente: "O que a interface dá à pessoa?",
                        verso: "O meio concreto de agir no produto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que relação existe entre interface e experiência?",
                        verso: "A interface faz parte da experiência, sem ser sinônimo.",
                    },
                    {
                        frente: "Do que a experiência cuida?",
                        verso: "Da jornada inteira e de como a pessoa se sente.",
                    },
                    {
                        frente: "Do que a interface cuida?",
                        verso: "Da camada visível por onde a pessoa age.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que valor o design gera para a pessoa?",
                        verso: "Menos esforço, mais confiança, autonomia e inclusão.",
                    },
                    {
                        frente: "Que valor ele gera para o negócio?",
                        verso: "Menos suporte, mais conversão e menos retrabalho.",
                    },
                    {
                        frente: "De quantos lados esse valor aparece?",
                        verso: "Dos dois: da pessoa e do negócio.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o design é, segundo a aula?",
                        verso: "Processo, e não lampejo.",
                    },
                    {
                        frente: "Quantas etapas o design thinking tem?",
                        verso: "Cinco.",
                    },
                    {
                        frente: "Que etapas são essas?",
                        verso: "Empatizar, definir, idear, prototipar e testar.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que frase abre a pesquisa com usuários?",
                        verso: "Você não é o seu usuário.",
                    },
                    {
                        frente: "O que a pessoa que usa tem de diferente?",
                        verso: "Outra bagagem, outros hábitos e outros objetivos.",
                    },
                    {
                        frente: "O que a pesquisa evita?",
                        verso: "Projetar para si mesmo sem perceber.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é uma persona?",
                        verso: "Um personagem fictício, baseado em pesquisa.",
                    },
                    {
                        frente: "O que ela representa?",
                        verso: "Um grupo de usuários com necessidades parecidas.",
                    },
                    {
                        frente: "O que ela dá ao time?",
                        verso: "Foco nas decisões de projeto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um mapa de jornada mostra?",
                        verso: "A experiência da persona do começo ao fim, num cenário.",
                    },
                    {
                        frente: "Que três dimensões ele registra?",
                        verso: "O que a pessoa faz, pensa e sente.",
                    },
                    {
                        frente: "O que o mapa ajuda a encontrar?",
                        verso: "Os pontos de dor ao longo do caminho.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a arquitetura da informação faz com o conteúdo?",
                        verso: "Organiza, estrutura e nomeia.",
                    },
                    {
                        frente: "Que qualidade ela busca garantir?",
                        verso: "A facilidade de encontrar o que se procura.",
                    },
                    {
                        frente: "Que erro de nomeação atrapalha mais?",
                        verso: "Rótulo que só faz sentido para quem está dentro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um fluxo de usuário mapeia?",
                        verso: "As telas, as ações e as decisões até um objetivo.",
                    },
                    {
                        frente: "Quando ele é desenhado?",
                        verso: "Antes das telas.",
                    },
                    {
                        frente: "O que ele revela cedo?",
                        verso: "Passos desnecessários e becos sem saída.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que é uma affordance?",
                        verso: "O que o objeto permite fazer.",
                    },
                    {
                        frente: "O que é um signifier?",
                        verso: "O sinal visível que anuncia isso e diz onde agir.",
                    },
                    {
                        frente: "O que acontece quando falta esse sinal?",
                        verso: "A ação existe, mas ninguém descobre.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que toda ação merece?",
                        verso: "Uma reação da interface.",
                    },
                    {
                        frente: "O que a pessoa conclui quando a interface fica muda?",
                        verso: "Que não funcionou, ou que está quebrado.",
                    },
                    {
                        frente: "Que tipo de espera exige aviso?",
                        verso: "A que passa de alguns instantes.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o caminho feliz esconde?",
                        verso: "Os outros estados que a tela pode ter.",
                    },
                    {
                        frente: "Que estados precisam ser desenhados?",
                        verso: "Vazio, carregando, erro e sucesso.",
                    },
                    {
                        frente: "Que estado costuma ser esquecido?",
                        verso: "O vazio, da primeira vez que a pessoa chega.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o mapeamento significa?",
                        verso: "O controle apontar para o próprio efeito.",
                    },
                    {
                        frente: "O que a consistência garante?",
                        verso: "A interface se comportar sempre do mesmo jeito.",
                    },
                    {
                        frente: "O que os dois fazem juntos?",
                        verso: "Deixam a interface previsível.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a lei de Fitts relaciona?",
                        verso: "O tempo de alcance com o tamanho e a distância do alvo.",
                    },
                    {
                        frente: "O que a lei de Hick diz?",
                        verso: "Mais opções, mais tempo para decidir.",
                    },
                    {
                        frente: "O que a lei de Jakob lembra?",
                        verso: "As pessoas passam a maior parte do tempo em outros sites.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a hierarquia visual faz?",
                        verso: "Guia o olho, mostrando primeiro o mais importante.",
                    },
                    {
                        frente: "Que recursos a constroem?",
                        verso: "Tamanho, peso, cor, contraste e posição.",
                    },
                    {
                        frente: "O que aparece por último nessa ordem?",
                        verso: "O detalhe.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que famílias tipográficas a aula compara?",
                        verso: "As serifadas e as sem serifa.",
                    },
                    {
                        frente: "Qual delas é a mais comum na tela?",
                        verso: "A sem serifa.",
                    },
                    {
                        frente: "O que a escala tipográfica organiza?",
                        verso: "Os tamanhos de texto, em degraus definidos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três atributos descrevem uma cor?",
                        verso: "Matiz, saturação e brilho.",
                    },
                    {
                        frente: "O que a harmonia complementar produz?",
                        verso: "Contraste, com matizes opostos na roda.",
                    },
                    {
                        frente: "O que a cor nunca deve ser sozinha?",
                        verso: "O único jeito de transmitir uma informação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o espaço em branco não é?",
                        verso: "Desperdício.",
                    },
                    {
                        frente: "O que ele dá à tela?",
                        verso: "Respiro e destaque.",
                    },
                    {
                        frente: "O que a proximidade comunica?",
                        verso: "Que os elementos próximos pertencem ao mesmo grupo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que os princípios de Gestalt descrevem?",
                        verso: "Como a mente agrupa o que vê.",
                    },
                    {
                        frente: "Que frase resume a ideia?",
                        verso: "O todo é diferente da soma das partes.",
                    },
                    {
                        frente: "Que princípio agrupa pelo que é parecido?",
                        verso: "O da similaridade.",
                    },
                ],
            },
        },
    },
};
