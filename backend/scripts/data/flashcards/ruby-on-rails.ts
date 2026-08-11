import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Ruby on Rails, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto; as cartas guardam as convenções do framework, as proteções que
 * ele já traz e as armadilhas que a aula enuncia de passagem.
 */
export const rubyOnRails: CartasDaTrilha = {
    trilha: "Ruby on Rails",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que duas doutrinas o Rails segue?",
                        verso: "Convenção sobre configuração e não se repita.",
                    },
                    {
                        frente: "O que a convenção poupa?",
                        verso: "Escrever configuração para o caso comum.",
                    },
                    {
                        frente: "O que o Rails oferece a quem segue a convenção?",
                        verso: "Muita coisa pronta, sem nenhuma linha extra.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o comando de criação entrega?",
                        verso: "Um projeto completo, com estrutura e dependências.",
                    },
                    {
                        frente: "Onde models, views e controllers ficam?",
                        verso: "Na pasta da aplicação, separados por papel.",
                    },
                    {
                        frente: "Onde as rotas são declaradas?",
                        verso: "No arquivo de rotas, dentro da configuração.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que peça recebe a requisição primeiro?",
                        verso: "O roteador.",
                    },
                    {
                        frente: "Para onde ele encaminha?",
                        verso: "Para a ação do controller.",
                    },
                    {
                        frente: "O que o controller devolve no fim?",
                        verso: "A resposta, quase sempre renderizando uma view.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o console permite?",
                        verso: "Interagir com a aplicação já carregada.",
                    },
                    {
                        frente: "O que um gerador cria?",
                        verso: "Os arquivos daquele recurso, já no lugar certo.",
                    },
                    {
                        frente: "Que trabalho isso evita?",
                        verso: "Criar e conectar cada arquivo à mão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o arquivo de credenciais guarda?",
                        verso: "Segredos cifrados, versionados junto do projeto.",
                    },
                    {
                        frente: "O que é preciso para lê-lo?",
                        verso: "A chave mestra, que fica fora do controle de versão.",
                    },
                    {
                        frente: "O que os ambientes separam?",
                        verso: "As configurações de desenvolvimento, teste e produção.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que a declaração de recurso cria?",
                        verso: "As sete rotas do padrão REST de uma vez.",
                    },
                    {
                        frente: "Que ações essas rotas cobrem?",
                        verso: "Listar, mostrar, criar, editar, atualizar e remover.",
                    },
                    {
                        frente: "O que a rota nomeada gera?",
                        verso: "Um helper para montar o caminho no código.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que os parâmetros fortes exigem?",
                        verso: "Declarar quais campos podem ser atribuídos.",
                    },
                    {
                        frente: "Que ataque isso previne?",
                        verso: "A atribuição em massa de campos não previstos.",
                    },
                    {
                        frente: "O que acontece com um campo não permitido?",
                        verso: "É descartado antes de chegar ao model.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o ERB permite dentro do HTML?",
                        verso: "Interpolar e executar código Ruby.",
                    },
                    {
                        frente: "O que um helper concentra?",
                        verso: "Lógica de apresentação, fora da view.",
                    },
                    {
                        frente: "O que a saída do ERB faz por padrão?",
                        verso: "Escapa o conteúdo antes de imprimir.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um layout envolve?",
                        verso: "O conteúdo de todas as páginas que o usam.",
                    },
                    {
                        frente: "O que uma partial evita?",
                        verso: "Repetir o mesmo trecho de marcação.",
                    },
                    {
                        frente: "O que o construtor de formulário liga?",
                        verso: "Os campos ao objeto que está sendo editado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que diferença separa renderizar de redirecionar?",
                        verso: "Renderizar responde agora; redirecionar pede outra requisição.",
                    },
                    {
                        frente: "Para que o flash serve?",
                        verso: "Levar uma mensagem para a próxima requisição.",
                    },
                    {
                        frente: "Quando redirecionar é a escolha certa?",
                        verso: "Depois de uma ação que alterou dados.",
                    },
                ],
            },
        },
    },
};
