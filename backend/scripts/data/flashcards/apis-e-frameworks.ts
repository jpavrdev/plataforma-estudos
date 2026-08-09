import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de APIs e Frameworks, terceira trilha do roadmap de Back-end.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a leitura de
 * código e o julgamento de cenário; as cartas ficam com a superfície da API
 * do Express, os comandos e os números de referência.
 */
export const apisEFrameworks: CartasDaTrilha = {
    trilha: "APIs e Frameworks",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro problemas um framework web resolve?",
                        verso: "Receber a requisição, rotear, montar a resposta e encadear middlewares.",
                    },
                    {
                        frente: "O que o Express muda no protocolo HTTP?",
                        verso: "Nada: ele só dá uma interface mais confortável pro mesmo protocolo.",
                    },
                    {
                        frente: "Como se define o status de recurso criado no Express?",
                        verso: "Com res.status(201), no lugar de montar o header na mão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas o npm install faz de uma vez?",
                        verso: "Baixa o pacote, registra no package.json e grava o lock com as versões.",
                    },
                    {
                        frente: "Por que node_modules nunca entra no controle de versão?",
                        verso: "Fica enorme e se recria com um npm install; vai no .gitignore.",
                    },
                    {
                        frente: "Que versão mínima de Node.js a trilha assume?",
                        verso: "A 18 ou superior, que já traz o npm junto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que nomes de arquivo principal a convenção usa?",
                        verso: "index.js ou server.js, na raiz e ao lado do package.json.",
                    },
                    {
                        frente: "O que o sistema operacional faz ao rodar app.listen(3000)?",
                        verso: "Reserva a porta 3000 para o processo Node.js que subiu.",
                    },
                    {
                        frente: "Qual é a diferença entre require de express e chamar express()?",
                        verso: "O require importa a função; chamá-la devolve a aplicação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "De que três partes uma rota do Express é feita?",
                        verso: "Método HTTP, caminho e a função handler que trata a requisição.",
                    },
                    {
                        frente: "Que método do app corresponde ao verbo PATCH?",
                        verso: "O app.patch, porque existe um método por verbo HTTP.",
                    },
                    {
                        frente: "O que o Express faz com duas rotas iguais declaradas?",
                        verso: "Executa só a primeira: ele para na primeira que casa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que campo do req traz o caminho sem a query string?",
                        verso: "O req.path; o req.url traz caminho e query juntos.",
                    },
                    {
                        frente: "O que muda no tipo de conteúdo do res.send conforme o valor?",
                        verso: "String vira text/html; objeto ou array vira JSON automático.",
                    },
                    {
                        frente: "Que status o Express usa quando ninguém chama res.status?",
                        verso: "O 200, padrão para resposta bem-sucedida.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Por que app.use(express.json()) é obrigatório para ler req.body?",
                        verso: "Sem ele, o req.body chega undefined mesmo com o corpo certo.",
                    },
                    {
                        frente: "O que app.all faz numa rota?",
                        verso: "Responde a qualquer método HTTP naquele mesmo caminho.",
                    },
                    {
                        frente: "Por que GET e POST em /tarefas não pedem id na rota?",
                        verso: "Um lista a coleção inteira e o outro cria um item novo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a regra de ordem entre rota fixa e rota com parâmetro?",
                        verso: "A fixa e mais específica vem antes da que tem parâmetro.",
                    },
                    {
                        frente: "Como comparar req.params.id com um número?",
                        verso: "Convertendo antes com Number, porque ele chega como string.",
                    },
                    {
                        frente: "Como se declara um trecho variável no caminho da rota?",
                        verso: "Com dois pontos na frente do nome, como em /tarefas/:id.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três cuidados um valor de req.query pede antes de usar?",
                        verso: "Checar se veio, converter o tipo e definir um padrão razoável.",
                    },
                    {
                        frente: "Qual é a diferença de obrigatoriedade entre params e query?",
                        verso: "O param é obrigatório se a rota o declara; a query é sempre opcional.",
                    },
                    {
                        frente: "O que vale uma chave de query que o cliente não enviou?",
                        verso: "O valor undefined, e não uma string vazia.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que status uma remoção bem-sucedida sem corpo devolve?",
                        verso: "O 204, escrito como res.status(204).end() na rota.",
                    },
                    {
                        frente: "O que acontece no PUT quando o cliente esquece um campo?",
                        verso: "Ele vira undefined: o PUT reescreve o recurso inteiro.",
                    },
                    {
                        frente: "Que quatro erros comuns aparecem ao desenhar rotas REST?",
                        verso: "Verbo na URL, singular com plural, status fixo e GET com efeito.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um Router tem e o que ele não tem, comparado ao app?",
                        verso: "Tem os mesmos métodos de rota; não escuta porta nenhuma sozinho.",
                    },
                    {
                        frente: "Por que as rotas dentro do router não repetem o prefixo?",
                        verso: "O prefixo é definido uma vez só, no app.use que monta o router.",
                    },
                    {
                        frente: "Que estrutura de pastas o uso de Router sugere?",
                        verso: "Um app.js com as montagens e um arquivo por recurso em routes.",
                    },
                ],
            },
        },
    },
};
