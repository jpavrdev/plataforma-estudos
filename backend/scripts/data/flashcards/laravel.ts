import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Laravel, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto; as cartas guardam as convenções do framework, os números do
 * ciclo de versões e as armadilhas que a aula enuncia de passagem.
 */
export const laravel: CartasDaTrilha = {
    trilha: "Laravel",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que calendário de versões o Laravel segue?",
                        verso: "Uma versão maior por ano.",
                    },
                    {
                        frente: "Por quanto tempo uma versão recebe correções?",
                        verso: "Cerca de dezoito meses.",
                    },
                    {
                        frente: "Por quanto tempo ela recebe correções de segurança?",
                        verso: "Vinte e quatro meses.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como um projeto Laravel novo costuma ser criado?",
                        verso: "Pelo instalador oficial ou pelo Composer.",
                    },
                    {
                        frente: "O que vem pronto no projeto recém-criado?",
                        verso: "Estrutura, configuração e ferramentas de linha de comando.",
                    },
                    {
                        frente: "Que arquivo guarda as dependências do projeto?",
                        verso: "O de configuração do Composer.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde fica o código da aplicação?",
                        verso: "Na pasta app.",
                    },
                    {
                        frente: "Onde ficam as rotas?",
                        verso: "Na pasta routes.",
                    },
                    {
                        frente: "Onde ficam as views?",
                        verso: "Na pasta de recursos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o Artisan é?",
                        verso: "A ferramenta de linha de comando do framework.",
                    },
                    {
                        frente: "O que o Tinker permite?",
                        verso: "Interagir com a aplicação num console.",
                    },
                    {
                        frente: "Que trabalho os comandos de geração poupam?",
                        verso: "Escrever a estrutura de arquivo à mão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o modo de depuração ligado mostra em produção?",
                        verso: "Stack trace e variáveis de ambiente na tela do erro.",
                    },
                    {
                        frente: "Por que isso é grave?",
                        verso: "É assim que credenciais vazam.",
                    },
                    {
                        frente: "Onde as variáveis de ambiente ficam?",
                        verso: "No arquivo de ambiente, fora do controle de versão.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que uma rota liga?",
                        verso: "Um verbo e um caminho a uma ação.",
                    },
                    {
                        frente: "Que verbo busca dados sem alterar nada?",
                        verso: "O de leitura.",
                    },
                    {
                        frente: "Onde as rotas de web são declaradas?",
                        verso: "No arquivo de rotas web.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como um parâmetro é declarado na rota?",
                        verso: "Entre chaves, no caminho.",
                    },
                    {
                        frente: "O que um grupo de rotas compartilha?",
                        verso: "Prefixo, middleware e nome.",
                    },
                    {
                        frente: "Onde o middleware age?",
                        verso: "Entre a requisição e a ação, nos dois sentidos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o route model binding faz?",
                        verso: "Busca o registro pelo parâmetro e injeta na ação.",
                    },
                    {
                        frente: "O que ele dispensa escrever?",
                        verso: "A busca manual seguida da checagem de existência.",
                    },
                    {
                        frente: "O que acontece se o registro não existir?",
                        verso: "O framework devolve não encontrado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que método usar ao criar um registro?",
                        verso: "O que devolve só os dados validados.",
                    },
                    {
                        frente: "Que método nunca usar nesse caso?",
                        verso: "O que devolve tudo que veio na requisição.",
                    },
                    {
                        frente: "O que um Form Request concentra?",
                        verso: "As regras de validação, fora do controller.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um redirecionamento devolve ao navegador?",
                        verso: "A instrução de ir para outro endereço.",
                    },
                    {
                        frente: "O que a sessão carrega junto do redirecionamento?",
                        verso: "As mensagens e os erros de validação.",
                    },
                    {
                        frente: "O que o tratamento central de erros define?",
                        verso: "Como cada exceção vira resposta.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que a interpolação do Blade faz com a saída?",
                        verso: "Escapa automaticamente antes de imprimir.",
                    },
                    {
                        frente: "Quando usar a forma sem escape?",
                        verso: "Só com conteúdo que você mesmo gerou.",
                    },
                    {
                        frente: "O que as diretivas substituem no template?",
                        verso: "As estruturas de controle escritas em PHP puro.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um layout define?",
                        verso: "A moldura reaproveitada entre as páginas.",
                    },
                    {
                        frente: "O que uma seção preenche?",
                        verso: "O espaço que o layout deixou reservado.",
                    },
                    {
                        frente: "O que um componente Blade encapsula?",
                        verso: "Marcação e comportamento reutilizáveis.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o token de formulário protege contra?",
                        verso: "Requisição forjada vinda de outro site.",
                    },
                    {
                        frente: "O que acontece sem esse token num envio?",
                        verso: "O framework recusa a requisição.",
                    },
                    {
                        frente: "Como os erros de validação voltam para a tela?",
                        verso: "Pela sessão, disponíveis na view.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que nunca fazer com o arquivo compilado?",
                        verso: "Apontar para ele na mão.",
                    },
                    {
                        frente: "O que a diretiva de assets resolve?",
                        verso: "Escolhe o caminho certo em desenvolvimento e em produção.",
                    },
                    {
                        frente: "O que o empacotador faz com os arquivos de front-end?",
                        verso: "Compila, versiona e otimiza.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Livewire mantém no servidor?",
                        verso: "O estado do componente.",
                    },
                    {
                        frente: "O que o Inertia usa no cliente?",
                        verso: "Um framework de front-end, com as rotas do servidor.",
                    },
                    {
                        frente: "Que pergunta escolhe entre os dois?",
                        verso: "Quanto do front-end o time quer escrever em JavaScript.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que uma migration descreve?",
                        verso: "A mudança no schema, em código versionado.",
                    },
                    {
                        frente: "O que o método de reversão precisa fazer?",
                        verso: "Desfazer exatamente o que a migration criou.",
                    },
                    {
                        frente: "Que problema as migrations resolvem no time?",
                        verso: "Todos chegam ao mesmo schema, na mesma ordem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um model representa?",
                        verso: "Uma tabela, e cada instância uma linha.",
                    },
                    {
                        frente: "Que convenção o Eloquent usa para o nome da tabela?",
                        verso: "O plural do nome do model.",
                    },
                    {
                        frente: "O que a atribuição em massa exige declarar?",
                        verso: "Quais campos podem ser preenchidos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que os atributos do PHP trazem ao model?",
                        verso: "Declarar comportamento direto na propriedade.",
                    },
                    {
                        frente: "O que eles substituem?",
                        verso: "Configuração espalhada em arrays e métodos.",
                    },
                    {
                        frente: "Que ganho isso traz na leitura?",
                        verso: "A regra fica ao lado do campo que ela afeta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um relacionamento de um para muitos declara?",
                        verso: "Que o registro tem vários do outro lado.",
                    },
                    {
                        frente: "O que o relacionamento inverso declara?",
                        verso: "Que aquele registro pertence a outro.",
                    },
                    {
                        frente: "O que um relacionamento muitos para muitos exige?",
                        verso: "Uma tabela intermediária.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que uma factory gera?",
                        verso: "Registros de teste com dados plausíveis.",
                    },
                    {
                        frente: "O que o problema de consulta em cascata provoca?",
                        verso: "Uma consulta extra por item da lista.",
                    },
                    {
                        frente: "Que ajuste faz esse problema virar exceção em desenvolvimento?",
                        verso: "Impedir o carregamento tardio no model.",
                    },
                ],
            },
        },
    },
};
