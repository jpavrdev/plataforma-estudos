import type { CartasDaTrilha } from "../../seed-flashcards.ts";

// Trilha de aula única por posição, sem variante de linguagem: tudo fica em "neutra".
export const protocolosDaWeb: CartasDaTrilha = {
    trilha: "Protocolos da Web",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Um servidor pode agir como cliente?",
                        verso: "Pode. Quando ele mesmo pede dados a outro servidor, o papel dele é de cliente.",
                    },
                    {
                        frente: "O que o servidor faz enquanto ninguém pede nada a ele?",
                        verso: "Fica rodando e esperando, pronto para atender o cliente que chegar.",
                    },
                    {
                        frente: "curl e Postman entram em qual papel do modelo?",
                        verso: "Cliente: eles montam a requisição à mão para testar uma API.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que partes o navegador quebra a URL antes de qualquer coisa?",
                        verso: "Host, porta, caminho e o restante do endereço.",
                    },
                    {
                        frente: "Quando o esquema é HTTPS, em que momento o TLS entra?",
                        verso: "Depois de abrir a conexão e antes de trocar qualquer dado da aplicação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Além de pedir e mostrar, o que o navegador guarda entre visitas?",
                        verso: "Cookies, histórico e cache, que são o estado local da navegação.",
                    },
                    {
                        frente: "O que o navegador faz com o HTML, o CSS e o JavaScript recebidos?",
                        verso: "Interpreta o HTML, aplica o CSS e executa o JavaScript.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o formato de um endereço IPv4?",
                        verso: "Quatro números de 0 a 255 separados por ponto, como 203.0.113.55.",
                    },
                    {
                        frente: "Por que o IPv6 existe?",
                        verso: "Porque o mundo tem mais dispositivos conectados que endereços IPv4.",
                    },
                    {
                        frente: "Que serviço costuma escutar na porta 22?",
                        verso: "O SSH, que dá acesso remoto seguro a servidores.",
                    },
                    {
                        frente: "Que serviço costuma escutar na porta 5432?",
                        verso: "O PostgreSQL, banco relacional comum em back-ends.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Front-end e back-end costumam ser o mesmo programa?",
                        verso: "Quase nunca. São dois programas que conversam por requisição e resposta.",
                    },
                    {
                        frente: "Onde roda o front-end de uma aplicação?",
                        verso: "No navegador do usuário, ou dentro de um aplicativo.",
                    },
                ],
            },
        },

        2: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as três partes de uma requisição HTTP?",
                        verso: "A linha de requisição, os headers e um corpo opcional.",
                    },
                    {
                        frente: "Qual é o formato de um header HTTP?",
                        verso: "Chave: Valor, uma por linha.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Para que serve o header Content-Type numa resposta?",
                        verso: "Diz o formato do corpo, como application/json ou text/html.",
                    },
                    {
                        frente: "O que o header Date informa?",
                        verso: "A data e a hora em que o servidor gerou aquela resposta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Stateless quer dizer que a aplicação não tem memória?",
                        verso: "Não. Quer dizer que essa memória não vive dentro do protocolo.",
                    },
                    {
                        frente: "O que uma requisição precisa carregar num protocolo sem memória?",
                        verso: "Tudo o que o servidor precisa para entendê-la sozinha.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O programador escolhe a versão do HTTP ao escrever um back-end?",
                        verso: "Não. Navegador e servidor negociam sozinhos qual versão usar.",
                    },
                    {
                        frente: "O que o HTTP/2 fez com a linha de requisição que o 1.1 tinha?",
                        verso: "Sumiu com ela: método, esquema, host e caminho viraram pseudo-headers.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as três garantias que o TLS oferece?",
                        verso: "Confidencialidade, integridade e autenticidade.",
                    },
                    {
                        frente: "O que a garantia de integridade do TLS detecta?",
                        verso: "Alteração dos dados em trânsito, e aí a conexão é invalidada.",
                    },
                ],
            },
        },

        3: {
            1: {
                neutra: [
                    {
                        frente: "Por que um GET pode ser cacheado e pré-carregado sem medo?",
                        verso: "Porque a promessa do método é não ter efeito colateral nenhum.",
                    },
                    {
                        frente: "Que headers uma requisição GET nunca precisa?",
                        verso: "Content-Type e Content-Length, já que ela não tem corpo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um POST bem feito devolve no corpo da resposta?",
                        verso: "O recurso criado, já com o id que o servidor gerou.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que acontece com um campo omitido no corpo de um PATCH?",
                        verso: "Continua com o valor que já tinha.",
                    },
                    {
                        frente: "PATCH costuma criar um recurso que ainda não existe?",
                        verso: "Normalmente não. Quem cria em id definido pelo cliente é o PUT.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em qual header o OPTIONS informa os métodos permitidos?",
                        verso: "No Allow, já que a resposta dele não traz corpo.",
                    },
                    {
                        frente: "Uma requisição DELETE costuma ter corpo?",
                        verso: "Normalmente não, embora a especificação até permita.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que significa um método ser idempotente?",
                        verso: "Repetir não piora nada: o efeito é o mesmo de ter chamado uma vez só.",
                    },
                    {
                        frente: "Quem decide automaticamente com base em seguro e idempotente?",
                        verso: "Caches, proxies, navegadores e bibliotecas HTTP.",
                    },
                ],
            },
        },

        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a classe 3xx pede ao cliente?",
                        verso: "Que ele faça mais alguma coisa, em geral ir buscar em outra URL.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando 200 é o status certo, em vez de 201?",
                        verso: "Quando deu certo e a resposta tem corpo, sem ter criado recurso novo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o status 304 economiza?",
                        verso: "O corpo da resposta: o cliente reaproveita a cópia que já tem.",
                    },
                    {
                        frente: "Quem segue os redirecionamentos sem o usuário perceber?",
                        verso: "O próprio navegador, que refaz a requisição na URL nova.",
                    },
                ],
            },
        },
    },
};
