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
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que um guard define?",
                        verso: "Como o usuário é autenticado em cada contexto.",
                    },
                    {
                        frente: "O que um provider define?",
                        verso: "De onde os usuários são carregados.",
                    },
                    {
                        frente: "Que guard a aplicação web usa por padrão?",
                        verso: "O de sessão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que manter ao adotar passkey?",
                        verso: "Um segundo caminho de entrada.",
                    },
                    {
                        frente: "O que acontece com quem perde o dispositivo sem alternativa?",
                        verso: "Perde a conta.",
                    },
                    {
                        frente: "O que a passkey substitui?",
                        verso: "A senha, por uma chave presa ao dispositivo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um middleware próprio permite?",
                        verso: "Interceptar a requisição antes da ação.",
                    },
                    {
                        frente: "O que ele pode fazer com a requisição?",
                        verso: "Deixar seguir, alterar ou interromper.",
                    },
                    {
                        frente: "Onde ele é registrado?",
                        verso: "Na configuração da aplicação, ou direto na rota.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que esconder o botão na view é?",
                        verso: "Experiência de uso, e não segurança.",
                    },
                    {
                        frente: "O que realmente protege a ação?",
                        verso: "A verificação no controller.",
                    },
                    {
                        frente: "O que uma policy agrupa?",
                        verso: "As regras de autorização de um model.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que defesa o framework já dá contra injeção?",
                        verso: "As consultas preparadas do construtor de queries.",
                    },
                    {
                        frente: "Que defesa ele dá no template?",
                        verso: "O escape automático da saída.",
                    },
                    {
                        frente: "O que ainda fica por conta de quem escreve?",
                        verso: "A autorização e as regras de negócio.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que um resource de API define?",
                        verso: "Como o model vira JSON.",
                    },
                    {
                        frente: "O que os campos esparsos permitem ao cliente?",
                        verso: "Pedir só as colunas que ele quer.",
                    },
                    {
                        frente: "Que ganho isso traz?",
                        verso: "Menos tráfego, sem precisar de um endpoint novo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois cenários o Sanctum cobre?",
                        verso: "Token de API e sessão para front-end do mesmo domínio.",
                    },
                    {
                        frente: "O que um token de API carrega?",
                        verso: "As habilidades que ele pode exercer.",
                    },
                    {
                        frente: "O que revogar um token faz?",
                        verso: "Encerra o acesso daquele cliente na hora.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o worker carrega ao subir?",
                        verso: "O código na memória.",
                    },
                    {
                        frente: "O que acontece sem reiniciar o worker no deploy?",
                        verso: "Ele segue rodando a versão antiga.",
                    },
                    {
                        frente: "O que mandar para a fila?",
                        verso: "O trabalho lento, que não precisa de resposta imediata.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o cache troca?",
                        verso: "Trabalho repetido por memória.",
                    },
                    {
                        frente: "O que a invalidação precisa garantir?",
                        verso: "Que o dado velho saia quando a fonte muda.",
                    },
                    {
                        frente: "O que estender a validade de uma chave evita?",
                        verso: "Recalcular só porque o tempo acabou.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um evento representa?",
                        verso: "Algo que aconteceu na aplicação.",
                    },
                    {
                        frente: "O que um listener faz?",
                        verso: "Reage ao evento, sem o emissor saber quem escuta.",
                    },
                    {
                        frente: "O que uma notificação escolhe?",
                        verso: "O canal de entrega, como email ou banco.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que um teste de feature exercita?",
                        verso: "O caminho da requisição até a resposta.",
                    },
                    {
                        frente: "O que um teste de unidade isola?",
                        verso: "Uma peça pequena, sem o resto da aplicação.",
                    },
                    {
                        frente: "O que o banco de teste precisa garantir?",
                        verso: "Que cada teste começa do mesmo estado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que características toda chamada a modelo tem?",
                        verso: "É lenta e pode falhar.",
                    },
                    {
                        frente: "Para onde mandar essa chamada?",
                        verso: "Para a fila.",
                    },
                    {
                        frente: "O que tratar como em qualquer API externa?",
                        verso: "O tempo esgotado e o erro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que acontece com o embedding quando o texto muda?",
                        verso: "Precisa ser gerado de novo.",
                    },
                    {
                        frente: "O que a busca aponta se isso não for feito?",
                        verso: "Para o conteúdo antigo.",
                    },
                    {
                        frente: "O que a busca semântica compara?",
                        verso: "A proximidade entre vetores, não as palavras exatas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que precisa estar desligado em produção?",
                        verso: "O modo de depuração.",
                    },
                    {
                        frente: "O que os comandos de cache de configuração fazem?",
                        verso: "Deixam configuração e rotas pré-compiladas.",
                    },
                    {
                        frente: "O que conferir nas permissões de arquivo?",
                        verso: "Que só as pastas de escrita sejam graváveis.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o deploy precisa rodar depois de subir o código?",
                        verso: "As migrations e a limpeza dos caches.",
                    },
                    {
                        frente: "O que reiniciar junto do deploy?",
                        verso: "Os workers de fila.",
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
