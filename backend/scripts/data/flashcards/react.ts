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
    },
};
