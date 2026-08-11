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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os três parâmetros de um middleware, em ordem?",
                        verso: "req, res e next, sempre nessa ordem.",
                    },
                    {
                        frente: "O que um handler de rota é, no fundo?",
                        verso: "Um caso particular de middleware que encerra em vez de chamar next.",
                    },
                    {
                        frente: "Como um middleware pode encerrar o ciclo da requisição?",
                        verso: "Respondendo com res, no lugar de chamar next e seguir o pipeline.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três formas existem de limitar o alcance de um middleware?",
                        verso: "app.use global, app.use com prefixo ou passar antes do handler da rota.",
                    },
                    {
                        frente: "O Express reordena middlewares para otimizar?",
                        verso: "Não: executa na ordem exata do registro, de cima para baixo.",
                    },
                    {
                        frente: "O que o app.use com prefixo faz com o caminho da requisição?",
                        verso: "Só roda quando o caminho começa com aquele prefixo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o Node não preenche o corpo da requisição sozinho?",
                        verso: "Os dados chegam como fluxo de bytes brutos; alguém precisa fazer o parse.",
                    },
                    {
                        frente: "Que middleware embutido serve arquivos de uma pasta por URL?",
                        verso: "O express.static(pasta), sem precisar de rota por arquivo.",
                    },
                    {
                        frente: "Que formato o express.urlencoded lê?",
                        verso: "O application/x-www-form-urlencoded, de formulário HTML tradicional.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que evento do res avisa que a resposta terminou de ser enviada?",
                        verso: "O finish, que permite logar status e tempo sem atrasar nada.",
                    },
                    {
                        frente: "Por que todo res dentro de um middleware pede return na frente?",
                        verso: "Sem ele o código segue e chama next mesmo depois de responder.",
                    },
                    {
                        frente: "Que dois tipos de middleware próprio aparecem em quase toda API?",
                        verso: "Os de log, para observar, e os de verificação, para barrar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que cors e helmet são chamados com parênteses no app.use?",
                        verso: "Cada um devolve a função middleware que o app.use registra.",
                    },
                    {
                        frente: "Por que a requisição pendurada não mostra erro no servidor?",
                        verso: "Do ponto de vista do Express nada deu errado: ele só está esperando.",
                    },
                    {
                        frente: "De que dois jeitos todo middleware precisa terminar?",
                        verso: "Chamando next para seguir, ou enviando uma resposta e encerrando.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as três portas de entrada de dados numa rota?",
                        verso: "req.params, req.query e req.body, cada uma vindo de um lugar.",
                    },
                    {
                        frente: "Qual das três portas não entrega tudo como string?",
                        verso: "O req.body, cujo tipo depende do JSON que o cliente enviou.",
                    },
                    {
                        frente: "De onde o req.params tira os valores?",
                        verso: "Dos trechos nomeados no caminho da própria rota.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problema o dado com tipo errado causa, se não quebra nada?",
                        verso: "Corrompe em silêncio e o bug só aparece num relatório depois.",
                    },
                    {
                        frente: "Por que espalhar req.body direto num objeto é arriscado?",
                        verso: "Um campo que o cliente mandou sobrescreve o padrão que veio antes.",
                    },
                    {
                        frente: "Que consequência um texto absurdamente longo traz sem validação?",
                        verso: "Consumo desnecessário de memória e de banco de dados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Com o que um schema do Zod costuma começar?",
                        verso: "Com z.object, descrevendo cada campo esperado.",
                    },
                    {
                        frente: "Que duas coisas o .parse() faz quando o dado bate?",
                        verso: "Devolve o próprio dado já validado e segue a execução.",
                    },
                    {
                        frente: "Que erro o Zod lança quando o dado não bate com o schema?",
                        verso: "Um ZodError, que interrompe a execução da função na hora.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o safeParse devolve quando a validação passa?",
                        verso: "Um objeto com success verdadeiro e o dado limpo em data.",
                    },
                    {
                        frente: "Que ganho o middleware de validação reaproveitável traz?",
                        verso: "Evita copiar o mesmo bloco de safeParse e 400 em cada rota.",
                    },
                    {
                        frente: "Quando o .parse() ainda é a escolha melhor que o safeParse?",
                        verso: "Com tratamento de erro centralizado, fora da rota.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre validar e sanitizar?",
                        verso: "Validar pergunta se o dado serve; sanitizar melhora o formato dele.",
                    },
                    {
                        frente: "Por que sanitizar dentro do schema é melhor que depois?",
                        verso: "A limpeza acontece sempre, sem depender de alguém lembrar.",
                    },
                    {
                        frente: "Que método do Zod aplica uma regra de limpeza mais específica?",
                        verso: "O .transform(), que recebe o valor validado e devolve outro.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Por que dá pra encadear .json() depois de .status()?",
                        verso: "O res.status devolve o próprio res, então a cadeia continua.",
                    },
                    {
                        frente: "O que muda entre res.send e res.json com um valor simples?",
                        verso: "O send manda texto puro; o json manda entre aspas, como JSON válido.",
                    },
                    {
                        frente: "Por que escrever .status() mesmo quando o status é 200?",
                        verso: "Deixa explícito o que cada caminho da rota promete a quem chama.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que seis status cobrem a maioria das respostas de uma API REST?",
                        verso: "200, 201, 204, 400, 404 e 500.",
                    },
                    {
                        frente: "Por que o 204 usa .end() e não um JSON vazio?",
                        verso: "O 204 promete sem conteúdo: corpo nenhum, nem chaves vazias.",
                    },
                    {
                        frente: "Quais são as duas origens diferentes de um 404?",
                        verso: "Rota que não existe, o Express resolve; recurso que não existe, seu código.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual envelope de erro a aula propõe para toda a API?",
                        verso: "Sempre dentro de error, com message e details opcional.",
                    },
                    {
                        frente: "O que o campo details do envelope de erro carrega?",
                        verso: "Informação extra estruturada, como os campos que falharam.",
                    },
                    {
                        frente: "O que um formato de erro consistente permite no cliente?",
                        verso: "Uma função só tratando qualquer erro, de qualquer rota.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que os quatro parâmetros do tratador são obrigatórios?",
                        verso: "É a contagem que faz o Express reconhecer a função como de erro.",
                    },
                    {
                        frente: "Qual é a diferença entre chamar next() e next(erro)?",
                        verso: "O vazio segue o pipeline normal; com erro pula pro tratador.",
                    },
                    {
                        frente: "O que o cliente recebe num erro inesperado, e o que fica no log?",
                        verso: "Mensagem genérica pro cliente; o detalhe completo só no console.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que tipo de erro o Express intercepta sozinho, sem ajuda?",
                        verso: "O síncrono, lançado direto no corpo da rota quando ela é chamada.",
                    },
                    {
                        frente: "O que acontece com a resposta se a rejeição não for tratada?",
                        verso: "Pode nunca ser enviada: o cliente espera e o tratador não roda.",
                    },
                    {
                        frente: "Que pacote resolve o try e catch repetido em rota assíncrona?",
                        verso: "O express-async-handler, ou um wrapper próprio com .catch(next).",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que regra de direção as camadas seguem entre si?",
                        verso: "Cada camada só conhece a de baixo, nunca a de cima.",
                    },
                    {
                        frente: "Que analogia a aula usa para as três camadas?",
                        verso: "Restaurante: a placa, o garçom que traduz e a cozinha que prepara.",
                    },
                    {
                        frente: "Que cinco sintomas denunciam o arquivo que cresceu demais?",
                        verso: "Difícil achar, camadas misturadas, testar, reaproveitar e conflito.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que roteiro de quatro passos um bom controller segue?",
                        verso: "Extrai da requisição, chama o service, monta a resposta e repassa o erro.",
                    },
                    {
                        frente: "Que teste diz se o controller está bem desenhado?",
                        verso: "Trocar a forma de guardar os dados não deveria mexer nele.",
                    },
                    {
                        frente: "Que sinal denuncia regra de negócio escondida no controller?",
                        verso: "Um if decidindo se algo pode ou não ser criado ali dentro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas coisas um service concentra?",
                        verso: "A regra de negócio do domínio e o acesso aos dados.",
                    },
                    {
                        frente: "O que a função listar do service devolve quando não há nada?",
                        verso: "Um array vazio, nunca null.",
                    },
                    {
                        frente: "Por que o service nunca devolve um 404?",
                        verso: "404 é conceito de HTTP, e o service não conhece protocolo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que valores a convenção usa para NODE_ENV?",
                        verso: "development, test ou production, conforme o ambiente.",
                    },
                    {
                        frente: "Onde o Node expõe as variáveis de ambiente?",
                        verso: "No objeto global process.env.",
                    },
                    {
                        frente: "Que quatro boas práticas o uso de .env pede?",
                        verso: "Não commitar, versionar o exemplo, ter padrão e centralizar a leitura.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que seis pastas a estrutura do projeto integrador tem?",
                        verso: "config, routes, controllers, services, schemas e middlewares.",
                    },
                    {
                        frente: "Em que ordem o app.js liga as peças?",
                        verso: "express.json, depois as rotas e o tratador de erro por último.",
                    },
                    {
                        frente: "O que a pasta schemas guarda no projeto integrador?",
                        verso: "Os schemas do Zod que validam o corpo das requisições.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro informações um log de requisição precisa ter?",
                        verso: "Método e rota, status code, tempo de resposta e o timestamp.",
                    },
                    {
                        frente: "Que diferença tem o formato common para o combined no morgan?",
                        verso: "O common é igual, só que sem o user-agent.",
                    },
                    {
                        frente: "Que formato do morgan serve a ambiente com pouco espaço em log?",
                        verso: "O tiny: só método, rota, status e tamanho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três defesas simples cobrem o básico de segurança?",
                        verso: "Helmet nos cabeçalhos, rate limit e erro genérico pro cliente.",
                    },
                    {
                        frente: "Que cabeçalho o helmet remove, e por quê?",
                        verso: "O X-Powered-By, que entrega de graça qual framework está no ar.",
                    },
                    {
                        frente: "Pelo que o rate limit costuma identificar a origem?",
                        verso: "Pelo IP, contando as requisições dentro de uma janela de tempo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que exatamente o navegador bloqueia num erro de CORS?",
                        verso: "A leitura da resposta; a requisição costuma chegar no servidor.",
                    },
                    {
                        frente: "Que cabeçalho diz quais métodos valem numa chamada cross-origin?",
                        verso: "O Access-Control-Allow-Methods, na resposta do servidor.",
                    },
                    {
                        frente: "Com que método o navegador dispara o preflight?",
                        verso: "Com OPTIONS, antes das requisições mais sensíveis.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que app.get de env devolve numa aplicação Express?",
                        verso: "O valor de NODE_ENV, ou development quando ele não existe.",
                    },
                    {
                        frente: "De onde vêm as variáveis de ambiente em produção?",
                        verso: "Do ambiente do servidor ou do CI, nunca de um .env commitado.",
                    },
                    {
                        frente: "Que diferença o reinício do servidor tem entre os dois ambientes?",
                        verso: "Em dev recarrega sozinho com nodemon; em produção fica estável.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que combinação testa uma API Express de forma automatizada?",
                        verso: "Um runner como Vitest ou Jest somado à biblioteca supertest.",
                    },
                    {
                        frente: "Por que o supertest dispensa um servidor escutando de verdade?",
                        verso: "Ele faz as requisições direto contra a aplicação Express.",
                    },
                    {
                        frente: "Para que o teste manual continua valendo, mesmo com automação?",
                        verso: "Pra explorar rota nova e reproduzir um bug relatado.",
                    },
                ],
            },
        },
    },
};
