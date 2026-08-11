import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de React, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * componente; as cartas guardam as regras dos hooks, o comportamento do
 * estado e as armadilhas que a aula enuncia de passagem.
 */
export const react: CartasDaTrilha = {
    trilha: "React",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que você descreve no React?",
                        verso: "O resultado para cada estado.",
                    },
                    {
                        frente: "Quem decide o que mudar no navegador?",
                        verso: "O React, e não o seu código.",
                    },
                    {
                        frente: "Que problema o React resolve?",
                        verso: "Manter a tela em sincronia com o estado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Vite entrega ao criar o projeto?",
                        verso: "Servidor de desenvolvimento rápido e build pronto.",
                    },
                    {
                        frente: "O que ele dispensa configurar?",
                        verso: "O empacotador, na maioria dos casos.",
                    },
                    {
                        frente: "Que comando sobe o ambiente de desenvolvimento?",
                        verso: "O comando de dev do próprio projeto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o JSX é, no fim?",
                        verso: "Uma sintaxe que vira chamada de função.",
                    },
                    {
                        frente: "Como uma expressão entra no JSX?",
                        verso: "Entre chaves.",
                    },
                    {
                        frente: "Que atributo troca de nome no JSX?",
                        verso: "O de classe, que vira className.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que direção as props andam?",
                        verso: "De cima para baixo, do pai para o filho.",
                    },
                    {
                        frente: "Em que direção os eventos andam?",
                        verso: "De baixo para cima.",
                    },
                    {
                        frente: "Quem decide o que fazer com o evento?",
                        verso: "Quem tem o estado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Para que serve a chave numa lista?",
                        verso: "Para o React identificar cada item entre renderizações.",
                    },
                    {
                        frente: "Que chave é uma má ideia?",
                        verso: "O índice, quando a lista muda de ordem.",
                    },
                    {
                        frente: "O que uma chave errada provoca?",
                        verso: "Estado que gruda no item errado.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o useState devolve?",
                        verso: "O valor atual e a função que o atualiza.",
                    },
                    {
                        frente: "O que chamar o setter provoca?",
                        verso: "Uma nova renderização do componente.",
                    },
                    {
                        frente: "O que acontece se o valor novo for igual ao antigo?",
                        verso: "O React pode pular a renderização.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que caracteriza um campo controlado?",
                        verso: "O valor vem do estado e a mudança volta pelo evento.",
                    },
                    {
                        frente: "Que par sustenta o campo controlado?",
                        verso: "O valor e o manipulador de mudança.",
                    },
                    {
                        frente: "O que o formulário controlado facilita?",
                        verso: "Validar e transformar o valor enquanto se digita.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o estado é, na imagem da aula?",
                        verso: "Uma foto do momento da renderização.",
                    },
                    {
                        frente: "O que usar quando se precisa do valor mais recente?",
                        verso: "A forma de função do setter.",
                    },
                    {
                        frente: "Por que o valor parece velho dentro de um callback?",
                        verso: "Ele foi capturado na renderização daquele momento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que levantar o estado significa?",
                        verso: "Mover o estado para o ancestral comum.",
                    },
                    {
                        frente: "Quando isso é necessário?",
                        verso: "Quando dois componentes precisam do mesmo dado.",
                    },
                    {
                        frente: "O que os filhos passam a receber?",
                        verso: "O valor e a função que o altera, por props.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quando o useReducer compensa?",
                        verso: "Quando as transições de estado ficam complexas.",
                    },
                    {
                        frente: "O que o reducer recebe?",
                        verso: "O estado atual e a ação.",
                    },
                    {
                        frente: "O que ele devolve?",
                        verso: "O próximo estado.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que sinal indica que o efeito não deveria existir?",
                        verso: "Ele não sincronizar com nada fora do React.",
                    },
                    {
                        frente: "Para que o efeito serve, então?",
                        verso: "Para sincronizar com um sistema externo.",
                    },
                    {
                        frente: "Quando o efeito roda?",
                        verso: "Depois da renderização, e não durante.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que entra na lista de dependências?",
                        verso: "Todo valor reativo que o efeito usa.",
                    },
                    {
                        frente: "O que a função de limpeza desfaz?",
                        verso: "O que o efeito montou, antes de rodar de novo.",
                    },
                    {
                        frente: "Quando a limpeza roda?",
                        verso: "Antes do próximo efeito e ao desmontar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que entra nas dependências, pela regra?",
                        verso: "O que o efeito sincroniza.",
                    },
                    {
                        frente: "Para onde vai o que o efeito apenas dispara?",
                        verso: "Para um evento de efeito.",
                    },
                    {
                        frente: "Que problema isso resolve?",
                        verso: "O efeito refazer tudo por um valor que ele só lê.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que fazer com valor derivado do estado?",
                        verso: "Calcular durante a renderização, sem efeito.",
                    },
                    {
                        frente: "O que fazer com resposta a uma interação?",
                        verso: "Tratar no manipulador do evento.",
                    },
                    {
                        frente: "Que sintoma indica efeito desnecessário?",
                        verso: "Renderizações em cadeia só para acertar o estado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que escrever a busca à mão uma vez ensina?",
                        verso: "Os problemas que a busca de dados carrega.",
                    },
                    {
                        frente: "O que escrevê-la em todo componente repete?",
                        verso: "Os mesmos bugs em cada tela.",
                    },
                    {
                        frente: "Que problemas a busca manual precisa tratar?",
                        verso: "Corrida, cancelamento, erro e carregamento.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a prop de filhos permite?",
                        verso: "Encaixar conteúdo dentro de um componente.",
                    },
                    {
                        frente: "Que problema a composição evita?",
                        verso: "Uma prop nova para cada variação de conteúdo.",
                    },
                    {
                        frente: "O que o componente de moldura não precisa saber?",
                        verso: "O que exatamente vai dentro dele.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um hook próprio extrai?",
                        verso: "A lógica com estado, para ser reusada.",
                    },
                    {
                        frente: "Com que palavra o nome de um hook começa?",
                        verso: "Com use.",
                    },
                    {
                        frente: "O que dois componentes com o mesmo hook compartilham?",
                        verso: "A lógica, e não o estado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que tipo de dado o context serve?",
                        verso: "O que muda pouco e é lido por muitos.",
                    },
                    {
                        frente: "Que exemplos a aula cita?",
                        verso: "Tema, idioma e usuário logado.",
                    },
                    {
                        frente: "Por que ele custa caro com estado que muda sempre?",
                        verso: "Toda mudança renderiza quem consome.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que uma ref serve?",
                        verso: "Guardar um valor sem provocar renderização.",
                    },
                    {
                        frente: "Que uso clássico ela tem no DOM?",
                        verso: "Alcançar o elemento para focar ou medir.",
                    },
                    {
                        frente: "O que muda na tela quando uma ref é alterada?",
                        verso: "Nada: ela não dispara renderização.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que mudou na passagem de ref na versão 19?",
                        verso: "A ref passou a ser uma prop comum.",
                    },
                    {
                        frente: "O que isso dispensa?",
                        verso: "O encaminhamento explícito da ref.",
                    },
                    {
                        frente: "Que ganho essa mudança traz?",
                        verso: "Menos cerimônia para expor o elemento interno.",
                    },
                ],
            },
        },
    },
};
