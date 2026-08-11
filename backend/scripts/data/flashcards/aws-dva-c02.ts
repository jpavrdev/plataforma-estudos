import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AWS DVA-C02, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário e a
 * escolha do serviço; as cartas guardam os números que a prova exige de
 * cor, os nomes dos serviços e as separações entre conceitos parecidos.
 */
export const awsDvaC02: CartasDaTrilha = {
    trilha: "AWS DVA-C02",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que toda ação na AWS é, por baixo?",
                        verso: "Uma chamada de API por HTTPS.",
                    },
                    {
                        frente: "O que SDK e CLI fazem com o request?",
                        verso: "Montam e assinam a chamada para a API da AWS.",
                    },
                    {
                        frente: "Que par de credenciais o acesso programático usa?",
                        verso: "Access Key ID, público, e Secret Access Key, secreta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que processo assina cada request para a AWS?",
                        verso: "O Signature Version 4.",
                    },
                    {
                        frente: "Quando se implementa essa assinatura à mão?",
                        verso: "Só ao chamar a API por HTTP puro, sem SDK.",
                    },
                    {
                        frente: "Que serviços têm endpoint global, e não regional?",
                        verso: "IAM e CloudFront.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que erros o SDK re-tenta sozinho?",
                        verso: "Os 429, de throttling, e os 5xx.",
                    },
                    {
                        frente: "Que estratégia responde a muitos clientes re-tentando juntos?",
                        verso: "Backoff exponencial com jitter.",
                    },
                    {
                        frente: "O que o jitter evita no backoff?",
                        verso: "Que todos os clientes tentem de novo no mesmo instante.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Do que a AWS cuida no modelo compartilhado?",
                        verso: "Da segurança da nuvem: hardware, rede física e virtualização.",
                    },
                    {
                        frente: "Do que o cliente cuida?",
                        verso: "Da segurança na nuvem: código, acesso, dados e configuração.",
                    },
                    {
                        frente: "Que serviço entrega rotação automática de senha?",
                        verso: "O Secrets Manager.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que você entrega ao Lambda?",
                        verso: "Só o código da função.",
                    },
                    {
                        frente: "Que faixa de memória uma função Lambda aceita?",
                        verso: "De 128 MB a 10 GB.",
                    },
                    {
                        frente: "Qual é o tempo máximo de execução de uma função?",
                        verso: "Quinze minutos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como o modelo push funciona?",
                        verso: "O serviço de origem chama o Lambda quando algo acontece.",
                    },
                    {
                        frente: "Como o modelo poll funciona?",
                        verso: "O Lambda lê a origem pelo event source mapping.",
                    },
                    {
                        frente: "Que permissão o modelo push exige?",
                        verso: "Uma resource-based policy na função.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o pool padrão de concorrência por região?",
                        verso: "Mil execuções simultâneas, compartilhadas pela conta.",
                    },
                    {
                        frente: "Que tipo de concorrência elimina o cold start?",
                        verso: "A provisionada, pré-aquecida e com custo.",
                    },
                    {
                        frente: "O que a concorrência reservada faz?",
                        verso: "Garante um piso e impõe um teto à função.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é uma versão de função Lambda?",
                        verso: "Um snapshot imutável do código e da configuração.",
                    },
                    {
                        frente: "O que é um alias?",
                        verso: "Um ponteiro móvel para uma versão.",
                    },
                    {
                        frente: "O que um layer guarda?",
                        verso: "Dependências reaproveitáveis, fora do pacote da função.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Lambda cria ao ser conectado a uma VPC?",
                        verso: "Uma interface de rede elástica.",
                    },
                    {
                        frente: "O que a função perde ao entrar na VPC?",
                        verso: "A saída para a internet, se não houver NAT.",
                    },
                    {
                        frente: "Quantas novas tentativas a invocação assíncrona faz?",
                        verso: "Duas, além da original.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o tamanho máximo de um item no DynamoDB?",
                        verso: "400 KB.",
                    },
                    {
                        frente: "Que dois tipos de chave primária existem?",
                        verso: "Simples, só partition, ou composta, com sort key.",
                    },
                    {
                        frente: "O que causa throttling numa tabela com capacidade sobrando?",
                        verso: "A partição quente, com acesso concentrado numa chave.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto uma RCU entrega?",
                        verso: "Uma leitura forte, ou duas eventuais, de item até 4 KB.",
                    },
                    {
                        frente: "Quanto uma WCU entrega?",
                        verso: "Uma escrita de item até 1 KB.",
                    },
                    {
                        frente: "Que ordem seguir no cálculo de capacidade?",
                        verso: "Arredondar o tamanho primeiro, aplicar a regra depois.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o LSI mantém igual ao da tabela?",
                        verso: "A partition key.",
                    },
                    {
                        frente: "Quando um LSI pode ser criado?",
                        verso: "Só junto com a tabela.",
                    },
                    {
                        frente: "Que tipo de leitura o GSI oferece?",
                        verso: "Só a eventual, com capacidade própria.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que recurso reage a alterações na tabela?",
                        verso: "O DynamoDB Streams, acionando Lambda.",
                    },
                    {
                        frente: "Por quanto tempo o Streams guarda os registros?",
                        verso: "Vinte e quatro horas.",
                    },
                    {
                        frente: "O que o TTL faz, e a que custo?",
                        verso: "Apaga o item expirado sem consumir WCU.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que serviço resolve conexões esgotadas de Lambda para RDS?",
                        verso: "O RDS Proxy.",
                    },
                    {
                        frente: "Quando escolher Redis no ElastiCache?",
                        verso: "Quando precisa de persistência, réplica, pub/sub ou estrutura rica.",
                    },
                    {
                        frente: "Onde criar o pool de conexões numa função Lambda?",
                        verso: "Fora do handler, para ser reaproveitado.",
                    },
                ],
            },
        },
    },
};
