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
            4: {
                neutra: [
                    {
                        frente: "Qual é a mensagem comum por trás de qualquer status 4xx?",
                        verso: "Ajuste alguma coisa na requisição; repetir igual não vai resolver.",
                    },
                    {
                        frente: "Quando 400 Bad Request é o status certo?",
                        verso: "Quando a requisição está malformada, como um JSON inválido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um 5xx diz ao cliente sobre de quem é a culpa?",
                        verso: "Não é dele: tente mais tarde ou avise quem cuida do servidor.",
                    },
                    {
                        frente: "Quando aparece um 500 Internal Server Error?",
                        verso: "Em erro genérico e inesperado, como exceção não tratada ou bug.",
                    },
                ],
            },
        },

        5: {
            1: {
                neutra: [
                    {
                        frente: "O que o header Accept comunica ao servidor?",
                        verso: "Os formatos de resposta que o cliente consegue entender.",
                    },
                    {
                        frente: "Para que serve o header Accept-Language?",
                        verso: "Diz os idiomas que o cliente prefere receber na resposta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual Content-Type um formulário HTML simples usa?",
                        verso: "application/x-www-form-urlencoded, no formato campo=valor&campo2=valor2.",
                    },
                    {
                        frente: "Qual Content-Type um formulário com upload de arquivo usa?",
                        verso: "multipart/form-data.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o ETag identifica?",
                        verso: "A versão atual do recurso, usada depois para revalidar o cache.",
                    },
                    {
                        frente: "Qual header o cliente manda com o ETag que ele já tem?",
                        verso: "O If-None-Match, perguntando se aquela versão ainda vale.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O token do esquema Bearer costuma ter validade?",
                        verso: "Costuma, com renovação; o Basic não tem validade embutida por padrão.",
                    },
                    {
                        frente: "Por que o Authorization vai em toda requisição, e não só no login?",
                        verso: "Porque cada requisição chega ao servidor isolada das demais.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o atributo Secure faz num cookie?",
                        verso: "Só deixa o cookie ser enviado em conexões HTTPS.",
                    },
                    {
                        frente: "Contra o que o atributo SameSite protege?",
                        verso: "Contra CSRF, controlando o envio do cookie a partir de outros sites.",
                    },
                ],
            },
        },

        6: {
            1: {
                neutra: [
                    {
                        frente: "Quantos tipos de valor o JSON define?",
                        verso: "Seis: string, number, boolean, null, object e array.",
                    },
                    {
                        frente: "JSON aceita aspas simples numa string?",
                        verso: "Não. Sempre aspas duplas, tanto no valor quanto na chave.",
                    },
                    {
                        frente: "JSON separa número inteiro de número decimal?",
                        verso: "Não. Existe um tipo number só para os dois.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que forma de aninhamento representa uma relação um para um?",
                        verso: "Um object dentro de outro object.",
                    },
                    {
                        frente: "Que forma de aninhamento representa uma relação um para muitos?",
                        verso: "Um array de objects, com um object para cada item.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que acontece com um campo undefined ao serializar em JavaScript?",
                        verso: "É removido do JSON; dentro de um array, vira null em vez de sumir.",
                    },
                    {
                        frente: "Como um objeto de data costuma sair na serialização?",
                        verso: "Convertido em texto, porque o JSON não tem tipo de data.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde o JSON nasceu?",
                        verso: "Dentro do JavaScript: é quase um subconjunto da sintaxe de objetos dele.",
                    },
                    {
                        frente: "Qual formato dominava a troca de dados na web antes do JSON?",
                        verso: "O XML, sobretudo nos serviços baseados em SOAP.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em quais dois papéis o Content-Type aparece?",
                        verso: "Na requisição, dizendo como ler o corpo que chega; na resposta, o que vai.",
                    },
                ],
            },
        },

        7: {
            1: {
                neutra: [
                    {
                        frente: "Se a URL é sempre o recurso, onde fica a ação?",
                        verso: "No método HTTP. A URL não muda entre ler e remover o mesmo recurso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Coleção em URL vai no singular ou no plural?",
                        verso: "No plural, e o mesmo substantivo serve para acessar um item dela.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que status devolver ao listar uma coleção que está vazia?",
                        verso: "200 OK. Um array vazio é resposta legítima, não erro.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que versionar a API em vez de simplesmente mudar o endpoint?",
                        verso: "Cliente antigo continua funcionando: app não atualizado, parceiro integrado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que o status sozinho não basta na resposta de erro?",
                        verso: "Ele dá a categoria, mas não diz qual campo falhou nem o que corrigir.",
                    },
                ],
            },
        },
    },
};
