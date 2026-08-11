import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Spring Boot, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto; as cartas guardam o que o framework configura sozinho, as
 * armadilhas de segurança e as regras que a aula enuncia de passagem.
 */
export const springBoot: CartasDaTrilha = {
    trilha: "Spring Boot",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o Boot faz com o Spring?",
                        verso: "Configura o Spring por você.",
                    },
                    {
                        frente: "O que o Boot não faz?",
                        verso: "Substituir o Spring.",
                    },
                    {
                        frente: "O que separa quem copia configuração de quem resolve?",
                        verso: "Entender o que está por baixo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que ferramenta gera o esqueleto do projeto?",
                        verso: "O gerador oficial do Spring.",
                    },
                    {
                        frente: "O que se escolhe nesse gerador?",
                        verso: "Linguagem, versão, empacotador e dependências.",
                    },
                    {
                        frente: "O que uma dependência inicial traz junto?",
                        verso: "As bibliotecas e a configuração daquele tema.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o contêiner faz com os componentes?",
                        verso: "Cria e entrega onde eles são pedidos.",
                    },
                    {
                        frente: "Que forma de injeção é a recomendada?",
                        verso: "A injeção pelo construtor.",
                    },
                    {
                        frente: "Que ganho ela traz?",
                        verso: "Deixa a dependência obrigatória e o objeto testável.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um perfil separa?",
                        verso: "As configurações de cada ambiente.",
                    },
                    {
                        frente: "Onde a configuração fica?",
                        verso: "Em arquivos de propriedades da aplicação.",
                    },
                    {
                        frente: "O que a variável de ambiente faz com a propriedade?",
                        verso: "Sobrescreve o valor que está no arquivo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a auto-configuração observa para agir?",
                        verso: "O que está no classpath e o que já foi definido.",
                    },
                    {
                        frente: "O que acontece se você definir o seu próprio componente?",
                        verso: "A configuração automática recua.",
                    },
                    {
                        frente: "O que um starter agrupa?",
                        verso: "As dependências coerentes de um mesmo tema.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que um controller de API devolve?",
                        verso: "O corpo da resposta, já serializado.",
                    },
                    {
                        frente: "O que o mapeamento liga?",
                        verso: "O verbo e o caminho a um método.",
                    },
                    {
                        frente: "Como um parâmetro de caminho chega ao método?",
                        verso: "Anotado, ligando o nome ao trecho da rota.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde as regras de validação ficam declaradas?",
                        verso: "No próprio objeto que recebe os dados.",
                    },
                    {
                        frente: "O que dispara a validação na entrada?",
                        verso: "A anotação no parâmetro do controller.",
                    },
                    {
                        frente: "No que a falha de validação vira?",
                        verso: "Um erro de requisição inválida.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que nunca devolver ao cliente?",
                        verso: "A mensagem da exceção original.",
                    },
                    {
                        frente: "O que ela costuma trazer junto?",
                        verso: "Nome de tabela, consulta e caminho de arquivo.",
                    },
                    {
                        frente: "O que um tratador global centraliza?",
                        verso: "A conversão de exceção em resposta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que versionar a API?",
                        verso: "Para mudar sem quebrar quem já consome.",
                    },
                    {
                        frente: "Onde a versão costuma aparecer?",
                        verso: "No caminho da URL ou num cabeçalho.",
                    },
                    {
                        frente: "O que um cliente HTTP declarativo dispensa?",
                        verso: "Escrever a chamada e o tratamento na mão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a paginação evita?",
                        verso: "Devolver a tabela inteira numa resposta.",
                    },
                    {
                        frente: "Que dados a resposta paginada carrega junto?",
                        verso: "O total e a posição da página atual.",
                    },
                    {
                        frente: "O que a ordenação precisa ter para paginar bem?",
                        verso: "Um critério estável, senão itens se repetem.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Por que gravar enum pela posição é perigoso?",
                        verso: "Quebra quando alguém acrescenta um valor no meio da lista.",
                    },
                    {
                        frente: "Como gravar o enum com segurança?",
                        verso: "Pelo nome, e não pela posição.",
                    },
                    {
                        frente: "O que uma entidade representa?",
                        verso: "Uma tabela, mapeada para uma classe.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um repository entrega sem código?",
                        verso: "As operações básicas de acesso ao banco.",
                    },
                    {
                        frente: "O que um método de consulta derivado usa?",
                        verso: "O próprio nome do método para montar a consulta.",
                    },
                    {
                        frente: "Quando escrever a consulta à mão?",
                        verso: "Quando o nome derivado ficaria ilegível.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que ajuste torna a consulta em cascata visível?",
                        verso: "Ligar a exibição do SQL em desenvolvimento.",
                    },
                    {
                        frente: "Como o problema aparece no console?",
                        verso: "Cem consultas iguais, em sequência.",
                    },
                    {
                        frente: "O que resolve o problema na consulta?",
                        verso: "Trazer a associação junto, numa consulta só.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma transação garante?",
                        verso: "Tudo ou nada nas operações do bloco.",
                    },
                    {
                        frente: "Onde a fronteira da transação costuma ficar?",
                        verso: "No serviço, e não no repositório.",
                    },
                    {
                        frente: "O que provoca o desfazimento por padrão?",
                        verso: "Uma exceção não verificada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Flyway versiona?",
                        verso: "As mudanças de schema, em arquivos numerados.",
                    },
                    {
                        frente: "O que ele faz ao subir a aplicação?",
                        verso: "Aplica o que ainda falta, na ordem.",
                    },
                    {
                        frente: "O que nunca fazer com uma migration já aplicada?",
                        verso: "Alterar o arquivo, porque o resumo deixa de bater.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a segurança do Spring é, por dentro?",
                        verso: "Uma cadeia de filtros na frente da aplicação.",
                    },
                    {
                        frente: "O que cada filtro decide?",
                        verso: "Se a requisição segue, e com qual identidade.",
                    },
                    {
                        frente: "Onde a configuração dessa cadeia é declarada?",
                        verso: "Numa classe de configuração da aplicação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que mensagem de erro de login usar?",
                        verso: "Apenas que o email ou a senha estão incorretos.",
                    },
                    {
                        frente: "O que dizer qual dos dois falhou entrega?",
                        verso: "A lista de emails cadastrados.",
                    },
                    {
                        frente: "Como a senha precisa ser guardada?",
                        verso: "Com hash de algoritmo próprio para senha.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que torna a autenticação sem estado possível?",
                        verso: "O token carregar a identidade assinada.",
                    },
                    {
                        frente: "O que o servidor deixa de guardar?",
                        verso: "A sessão do usuário.",
                    },
                    {
                        frente: "Que problema o token sem estado cria?",
                        verso: "Revogar antes do vencimento fica difícil.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta a autorização responde?",
                        verso: "O que aquela identidade pode fazer.",
                    },
                    {
                        frente: "Onde a regra pode ser declarada?",
                        verso: "Na cadeia de filtros ou por anotação no método.",
                    },
                    {
                        frente: "O que testar em cada permissão?",
                        verso: "O acesso de quem pode e a negação de quem não pode.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a política de origem cruzada controla?",
                        verso: "Quais sites do navegador podem chamar a sua API.",
                    },
                    {
                        frente: "Onde os segredos nunca devem ficar?",
                        verso: "No código nem no repositório.",
                    },
                    {
                        frente: "Que funcionalidade é candidata a requisição forjada?",
                        verso: "Aquela em que o usuário informa uma URL para o servidor buscar.",
                    },
                ],
            },
        },
    },
};
