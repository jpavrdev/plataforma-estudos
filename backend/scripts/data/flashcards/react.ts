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
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que uma action encapsula?",
                        verso: "A função assíncrona disparada por um formulário.",
                    },
                    {
                        frente: "O que o useActionState devolve junto do estado?",
                        verso: "A ação embrulhada e o indicador de pendência.",
                    },
                    {
                        frente: "Que trabalho manual ele dispensa?",
                        verso: "Controlar carregamento e erro na mão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde a atualização otimista vale a pena?",
                        verso: "Onde a falha é rara e o custo dela é baixo.",
                    },
                    {
                        frente: "Onde ela não vale?",
                        verso: "Em transferência de dinheiro, que espera a confirmação.",
                    },
                    {
                        frente: "O que ela mostra antes da resposta?",
                        verso: "O resultado provável, já aplicado na tela.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o useFormStatus expõe?",
                        verso: "O estado do envio do formulário mais próximo.",
                    },
                    {
                        frente: "Onde ele precisa ser chamado?",
                        verso: "Dentro de um componente filho do formulário.",
                    },
                    {
                        frente: "Que uso típico ele tem?",
                        verso: "Desabilitar o botão enquanto o envio acontece.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a função use permite ler?",
                        verso: "Uma promessa ou um contexto, durante a renderização.",
                    },
                    {
                        frente: "O que o Suspense mostra enquanto o dado não chega?",
                        verso: "O conteúdo de espera declarado.",
                    },
                    {
                        frente: "O que o Suspense evita escrever à mão?",
                        verso: "O estado de carregamento espalhado pelos componentes.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que mudou sobre tags de metadado na versão 19?",
                        verso: "Podem ser declaradas no próprio componente.",
                    },
                    {
                        frente: "Para onde o React as move?",
                        verso: "Para o cabeçalho do documento.",
                    },
                    {
                        frente: "Que trabalho isso dispensa?",
                        verso: "Uma biblioteca só para mexer no cabeçalho.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Renderizar é o mesmo que atualizar o DOM?",
                        verso: "Não é.",
                    },
                    {
                        frente: "Onde mora a maior parte dos problemas de desempenho?",
                        verso: "No trabalho pesado dentro da renderização.",
                    },
                    {
                        frente: "O que dispara uma nova renderização?",
                        verso: "Mudança de estado, de props ou de contexto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que custos memorizar traz?",
                        verso: "A comparação, a memória e mais código.",
                    },
                    {
                        frente: "Quando memorizar vale a pena?",
                        verso: "Quando o perfilador aponta aquele ponto como problema.",
                    },
                    {
                        frente: "O que o useCallback preserva entre renderizações?",
                        verso: "A identidade da função.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o React Compiler faz sozinho?",
                        verso: "Aplica a memorização onde ela seria necessária.",
                    },
                    {
                        frente: "Que trabalho ele tende a dispensar?",
                        verso: "Espalhar memorização manual pelo código.",
                    },
                    {
                        frente: "O que ele exige do código para funcionar?",
                        verso: "Que as regras dos hooks sejam respeitadas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma transição marca?",
                        verso: "Que aquela atualização pode esperar.",
                    },
                    {
                        frente: "O que o React faz com atualizações urgentes?",
                        verso: "Coloca na frente das que podem esperar.",
                    },
                    {
                        frente: "O que o Activity permite com uma parte da árvore?",
                        verso: "Manter o estado dela enquanto fica escondida.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o carregamento tardio adia?",
                        verso: "O código de uma parte da tela, até ela ser usada.",
                    },
                    {
                        frente: "O que uma lista grande exige para não travar?",
                        verso: "Renderizar só o que aparece na janela.",
                    },
                    {
                        frente: "O que a divisão de código melhora?",
                        verso: "O tempo até a primeira tela útil.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Como as props de um componente são tipadas?",
                        verso: "Por um tipo do objeto que ele recebe.",
                    },
                    {
                        frente: "O que a tipagem ajuda a evitar no JSX?",
                        verso: "Passar prop errada ou esquecer uma obrigatória.",
                    },
                    {
                        frente: "Que retorno um componente tem?",
                        verso: "Um elemento que o React sabe renderizar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o roteador faz numa aplicação de página única?",
                        verso: "Escolhe o componente conforme a URL.",
                    },
                    {
                        frente: "O que a navegação por rota evita?",
                        verso: "Recarregar a página inteira a cada clique.",
                    },
                    {
                        frente: "O que uma rota aninhada permite?",
                        verso: "Compartilhar um layout entre várias telas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a Testing Library incentiva testar?",
                        verso: "O que o usuário vê e faz, não o detalhe interno.",
                    },
                    {
                        frente: "Por que seletor buscar o elemento?",
                        verso: "Pelo papel e pelo texto acessível.",
                    },
                    {
                        frente: "Que sinal indica teste frágil?",
                        verso: "Depender da estrutura interna do componente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde um componente de servidor executa?",
                        verso: "No servidor, antes de chegar ao navegador.",
                    },
                    {
                        frente: "O que ele não pode usar?",
                        verso: "Estado e efeitos do cliente.",
                    },
                    {
                        frente: "Que ganho ele traz?",
                        verso: "Menos código enviado ao navegador.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o build de produção faz com o código?",
                        verso: "Minifica, divide e otimiza os arquivos.",
                    },
                    {
                        frente: "O que conferir antes de publicar?",
                        verso: "As variáveis de ambiente e o caminho base.",
                    },
                    {
                        frente: "O que o projeto final consolida?",
                        verso: "As decisões da trilha numa aplicação inteira.",
                    },
                ],
            },
        },
    },
};
