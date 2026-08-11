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
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que nunca fazer com uma migration já aplicada?",
                        verso: "Editar, se ela já rodou em outro ambiente.",
                    },
                    {
                        frente: "Por que a edição não chega lá?",
                        verso: "Ela consta como executada, e não roda de novo.",
                    },
                    {
                        frente: "O que fazer em vez disso?",
                        verso: "Criar uma migration nova com a correção.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a interface de consulta monta antes de executar?",
                        verso: "A consulta, encadeando condições.",
                    },
                    {
                        frente: "Quando a consulta é realmente executada?",
                        verso: "Quando o resultado é usado.",
                    },
                    {
                        frente: "O que um model representa?",
                        verso: "Uma tabela, com cada instância sendo uma linha.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde a validação roda?",
                        verso: "Antes de gravar, no próprio model.",
                    },
                    {
                        frente: "O que um callback permite?",
                        verso: "Rodar código em pontos do ciclo de vida do registro.",
                    },
                    {
                        frente: "Que risco o callback traz?",
                        verso: "Efeito escondido, disparado longe de quem salvou.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a associação de pertencimento guarda?",
                        verso: "A chave estrangeira, do lado que pertence.",
                    },
                    {
                        frente: "O que a associação de posse declara?",
                        verso: "Que o registro tem um ou vários do outro lado.",
                    },
                    {
                        frente: "O que a associação através de outra permite?",
                        verso: "Alcançar registros distantes por um caminho declarado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um escopo nomeia?",
                        verso: "Uma condição de consulta reutilizável.",
                    },
                    {
                        frente: "O que provoca a consulta em cascata?",
                        verso: "Carregar a associação item a item, dentro da lista.",
                    },
                    {
                        frente: "O que resolve esse problema?",
                        verso: "Carregar as associações junto, de uma vez.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que ataque a autenticação de tempo constante evita?",
                        verso: "Descobrir emails cadastrados pelo tempo de resposta.",
                    },
                    {
                        frente: "O que ela mantém igual nos dois casos?",
                        verso: "O tempo, com email inexistente ou com senha errada.",
                    },
                    {
                        frente: "O que o gerador de autenticação entrega?",
                        verso: "As telas, o model e as rotas de login prontos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Rails inclui em todo formulário por padrão?",
                        verso: "O token contra requisição forjada.",
                    },
                    {
                        frente: "O que o cookie de sessão guarda?",
                        verso: "O identificador da sessão, assinado.",
                    },
                    {
                        frente: "Que proteção o framework aplica na saída da view?",
                        verso: "O escape automático do conteúdo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que pergunta a autorização responde?",
                        verso: "O que aquele usuário pode fazer.",
                    },
                    {
                        frente: "Onde a verificação precisa ficar?",
                        verso: "No servidor, antes de executar a ação.",
                    },
                    {
                        frente: "O que esconder o link na tela é?",
                        verso: "Experiência de uso, e não controle de acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um mailer é, na estrutura?",
                        verso: "Uma classe parecida com um controller, para emails.",
                    },
                    {
                        frente: "O que a view do mailer monta?",
                        verso: "O corpo da mensagem.",
                    },
                    {
                        frente: "Como o envio deve acontecer em produção?",
                        verso: "Em segundo plano, para não travar a requisição.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que validar sempre no arquivo enviado?",
                        verso: "O tipo e o tamanho.",
                    },
                    {
                        frente: "Que risco aceitar qualquer arquivo traz?",
                        verso: "Encher o disco e servir conteúdo perigoso.",
                    },
                    {
                        frente: "O que o Active Storage abstrai?",
                        verso: "Onde o arquivo fica guardado, local ou na nuvem.",
                    },
                ],
            },
        },
    },
};
