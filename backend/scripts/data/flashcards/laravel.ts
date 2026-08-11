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
    },
};
