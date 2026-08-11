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
    },
};
