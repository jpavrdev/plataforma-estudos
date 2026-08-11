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
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que integração exige que o Lambda devolva status e corpo?",
                        verso: "A de proxy, chamada AWS_PROXY.",
                    },
                    {
                        frente: "O que o API Gateway faz antes de encaminhar a requisição?",
                        verso: "Aplica autorização e throttling.",
                    },
                    {
                        frente: "O que a integração sem proxy exige a mais?",
                        verso: "Mapeamento de request e de response.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três formas de autorização o API Gateway oferece?",
                        verso: "IAM, Lambda authorizer e Cognito.",
                    },
                    {
                        frente: "Qual é o limite de regime por região?",
                        verso: "Dez mil requisições por segundo.",
                    },
                    {
                        frente: "Que código HTTP o excedente recebe?",
                        verso: "O código 429.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o visibility timeout padrão de uma fila SQS?",
                        verso: "Trinta segundos.",
                    },
                    {
                        frente: "Qual é o máximo do visibility timeout?",
                        verso: "Doze horas.",
                    },
                    {
                        frente: "O que um visibility timeout curto demais provoca?",
                        verso: "A mensagem reaparece antes do fim e é processada duas vezes.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que padrão o SNS implementa?",
                        verso: "Publicação e assinatura, com fan-out de um para muitos.",
                    },
                    {
                        frente: "O que a filter policy faz?",
                        verso: "Entrega a cada assinante só o que casa com o filtro.",
                    },
                    {
                        frente: "Que arranjo notifica vários sistemas do mesmo evento?",
                        verso: "O fan-out do SNS para várias filas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o EventBridge faz com os eventos?",
                        verso: "Roteia por regras para muitos destinos.",
                    },
                    {
                        frente: "O que o Step Functions coordena?",
                        verso: "Fluxos de trabalho, como uma máquina de estados.",
                    },
                    {
                        frente: "Quando escolher Kinesis?",
                        verso: "Quando vários consumidores leem o mesmo fluxo, com ordem e replay.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que durabilidade todas as classes do S3 têm?",
                        verso: "Onze noves.",
                    },
                    {
                        frente: "O que muda entre as classes, então?",
                        verso: "Disponibilidade, custo e tempo de recuperação.",
                    },
                    {
                        frente: "Que consistência o S3 oferece desde 2020?",
                        verso: "Forte, de leitura após escrita.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a duração mínima de Standard-IA e One Zone-IA?",
                        verso: "Trinta dias.",
                    },
                    {
                        frente: "Qual é a mínima do Glacier Instant e do Flexible?",
                        verso: "Noventa dias.",
                    },
                    {
                        frente: "Qual é a mínima do Deep Archive?",
                        verso: "Cento e oitenta dias.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De quem a presigned URL herda as permissões?",
                        verso: "De quem a assinou.",
                    },
                    {
                        frente: "Qual é a validade máxima de uma presigned URL?",
                        verso: "Sete dias.",
                    },
                    {
                        frente: "A partir de que tamanho o multipart upload é obrigatório?",
                        verso: "Acima de 5 GB.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que cabeçalho identifica a criptografia gerida pelo S3?",
                        verso: "O de server-side encryption com valor AES256.",
                    },
                    {
                        frente: "Que valor de cabeçalho aponta para a criptografia com KMS?",
                        verso: "O valor aws:kms.",
                    },
                    {
                        frente: "Qual é a criptografia padrão do S3?",
                        verso: "A do próprio serviço, com chaves dele.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que sempre vence na avaliação de políticas do IAM?",
                        verso: "O deny explícito.",
                    },
                    {
                        frente: "O que é um group no IAM?",
                        verso: "Uma coleção de users, que não serve de principal.",
                    },
                    {
                        frente: "O que uma role entrega?",
                        verso: "Credenciais temporárias a quem a assume.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que operação está no coração do STS?",
                        verso: "O AssumeRole.",
                    },
                    {
                        frente: "Que política diz quem pode assumir a role?",
                        verso: "A trust policy.",
                    },
                    {
                        frente: "Que sinais na questão apontam para AssumeRole?",
                        verso: "Credencial temporária, acesso entre contas ou permissão a serviço.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o User Pool do Cognito faz?",
                        verso: "Autentica: é o diretório que emite os tokens.",
                    },
                    {
                        frente: "O que o Identity Pool faz?",
                        verso: "Entrega credenciais temporárias da AWS.",
                    },
                    {
                        frente: "Que sinal aponta para o Identity Pool?",
                        verso: "Acessar S3 ou DynamoDB direto pelo cliente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o KMS gerencia?",
                        verso: "As chaves, e não os dados.",
                    },
                    {
                        frente: "O que a chave-mestra nunca faz?",
                        verso: "Sair do KMS em texto claro.",
                    },
                    {
                        frente: "Como funciona a envelope encryption?",
                        verso: "A data key cifra o dado e é cifrada por uma chave do KMS.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que serviço tem rotação automática integrada com o RDS?",
                        verso: "O Secrets Manager.",
                    },
                    {
                        frente: "Que serviço guarda configuração hierárquica sem custo?",
                        verso: "O Parameter Store.",
                    },
                    {
                        frente: "Que prática os dois substituem?",
                        verso: "Deixar o segredo escrito no código.",
                    },
                ],
            },
        },
    },
};
