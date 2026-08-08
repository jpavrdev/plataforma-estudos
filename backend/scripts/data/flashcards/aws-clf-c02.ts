import type { CartasDaTrilha } from "../../seed-flashcards.ts";

export const awsClfC02: CartasDaTrilha = {
    trilha: "AWS CLF-C02",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Na analogia da cafeteria, quem faz o papel de servidor?",
                        verso: "O barista, que prepara e entrega o pedido.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os três fatores para escolher uma região da AWS?",
                        verso: "Conformidade legal, proximidade do usuário e serviços disponíveis ali.",
                    },
                    {
                        frente: "Por que região nova costuma ter menos serviços?",
                        verso: "Os serviços chegam nelas por último, depois das regiões antigas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a origem mais comum de uma distribuição CloudFront?",
                        verso: "O Amazon S3, para site estático, mídia e assets.",
                    },
                    {
                        frente: "Que origem usar no CloudFront quando o app é dinâmico?",
                        verso: "O Application Load Balancer, com EC2 ou Fargate atrás dele.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença de foco entre Global Accelerator e CloudFront?",
                        verso: "Um otimiza roteamento TCP e UDP; o outro faz cache de conteúdo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que vantagem a IaC tem sobre o console para criar cem recursos?",
                        verso: "O tempo é o mesmo de criar um: o template se repete sozinho.",
                    },
                    {
                        frente: "O que o console não oferece e a IaC oferece?",
                        verso: "Ser reprodutível e versionável no Git.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com o IP público ao dar stop numa instância EC2?",
                        verso: "É perdido, a menos que seja um Elastic IP.",
                    },
                    {
                        frente: "O terminate de uma instância EC2 é reversível?",
                        verso: "Não. A instância some e o volume raiz é apagado por padrão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença de capacidade entre on-premises e nuvem?",
                        verso: "Lá se compra para o pico previsto; aqui se provisiona o que precisa agora.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em qual camada OSI o Application Load Balancer trabalha?",
                        verso: "Na 7, de aplicação, com HTTP, HTTPS e WebSocket.",
                    },
                    {
                        frente: "Quando escolher o Network Load Balancer?",
                        verso: "Latência extrema, milhões de requisições por segundo, jogos e IoT.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre imagem e container?",
                        verso: "A imagem é o pacote imutável; o container é a instância dela rodando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que serviço dispara uma Lambda em horário agendado?",
                        verso: "O EventBridge Scheduler, que é o cron da nuvem.",
                    },
                ],
            },
            6: {
                neutra: [
                    {
                        frente: "Para que serve a mensageria entre dois serviços?",
                        verso: "Desacoplar: A não espera B nem precisa saber se ele está no ar.",
                    },
                    {
                        frente: "Qual é o limite de vazão de uma fila SQS FIFO?",
                        verso: "300 mensagens por segundo, ou 3.000 com batching.",
                    },
                ],
            },
            7: {
                neutra: [
                    {
                        frente: "O que cada parte do nome m5.xlarge significa?",
                        verso: "m é a família, 5 é a geração e xlarge é o tamanho.",
                    },
                ],
            },
            8: {
                neutra: [
                    {
                        frente: "Qual modelo de compra do EC2 pode ser interrompido pela AWS?",
                        verso: "O Spot, e é justamente por isso que ele desconta até 90%.",
                    },
                    {
                        frente: "Que compromisso Reserved Instances e Savings Plans exigem?",
                        verso: "Um ou três anos de contrato.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Como se acessa um block storage?",
                        verso: "Como se fosse um HD ligado à máquina.",
                    },
                    {
                        frente: "Como se acessa um file storage?",
                        verso: "Por sistema de arquivos em rede, via NFS ou SMB.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas classes de armazenamento o S3 oferece?",
                        verso: "Sete, para padrões de acesso diferentes.",
                    },
                    {
                        frente: "Qual classe do S3 usar quando o padrão de acesso é desconhecido?",
                        verso: "A Intelligent-Tiering, que move o objeto de classe sozinha.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o segundo snapshot de um volume EBS armazena?",
                        verso: "Só os blocos modificados desde o primeiro, e por isso custa menos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando file storage é a escolha certa?",
                        verso: "Quando várias máquinas precisam ler e escrever nos mesmos arquivos.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Como SQL e NoSQL escalam, cada um?",
                        verso: "O relacional na vertical; o NoSQL na horizontal.",
                    },
                    {
                        frente: "O que o schema rígido do SQL permite que o NoSQL não?",
                        verso: "Joins entre tabelas por chave estrangeira.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais engines o Amazon RDS oferece?",
                        verso: "MySQL, PostgreSQL, MariaDB, Oracle, SQL Server e Aurora.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que serve o reader endpoint do Aurora?",
                        verso: "Distribuir a carga de leitura entre as réplicas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que compõe uma composite key no DynamoDB?",
                        verso: "A partition key mais a sort key.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual dos engines do ElastiCache tem replicação?",
                        verso: "O Redis. O Memcached faz sharding, mas não replica.",
                    },
                ],
            },
            6: {
                neutra: [
                    {
                        frente: "Qual é a diferença de leitura entre OLTP e OLAP?",
                        verso: "OLTP lê uma linha por vez; OLAP lê bilhões de linhas e agrega.",
                    },
                ],
            },
            7: {
                neutra: [
                    {
                        frente: "Por que um banco relacional é ruim para relacionamentos profundos?",
                        verso: "Os joins recursivos ficam lentos; esse é o caso do Neptune.",
                    },
                ],
            },
            8: {
                neutra: [
                    {
                        frente: "O banco de origem fica fora do ar durante uma migração com DMS?",
                        verso: "Não. Ele continua operando enquanto os dados são copiados.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quais serviços o Gateway Endpoint atende?",
                        verso: "Só S3 e DynamoDB. Os demais usam Interface Endpoint.",
                    },
                    {
                        frente: "Qual dos dois tipos de VPC endpoint cobra por hora?",
                        verso: "O Interface Endpoint, que cria uma ENI dentro da subnet.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que nível a Network ACL age?",
                        verso: "Na subnet, enquanto o Security Group age na instância.",
                    },
                    {
                        frente: "Que tipo de regra o Security Group aceita?",
                        verso: "Só de allow. Negar explicitamente é papel da Network ACL.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um registro DNS do tipo A mapeia?",
                        verso: "Um nome para um endereço IPv4.",
                    },
                    {
                        frente: "O que um registro CNAME mapeia?",
                        verso: "Um nome para outro nome.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quanto tempo leva para subir uma VPN e um Direct Connect?",
                        verso: "A VPN em minutos ou horas; o Direct Connect em semanas ou meses.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual tipo de API do API Gateway é mais barato e mais rápido?",
                        verso: "O HTTP API, feito para APIs simples.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Quem cuida do sistema operacional de uma instância EC2?",
                        verso: "O cliente. A AWS cuida do hipervisor e da infraestrutura física.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre User e Role no IAM?",
                        verso: "User é identidade fixa de uma pessoa; Role é assumida temporariamente.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que protege dado em trânsito e o que protege dado em repouso?",
                        verso: "Em trânsito é o TLS; em repouso é o KMS com AES-256.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em quais camadas o AWS Shield atua?",
                        verso: "Nas camadas 3 e 4, contra ataque que inunda a rede.",
                    },
                    {
                        frente: "Que tipo de regra do WAF limita requisições por IP?",
                        verso: "A rate-based rule.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o GuardDuty detecta, na prática?",
                        verso: "Comportamento suspeito, como EC2 conectando a IP de mineração de cripto.",
                    },
                ],
            },
            6: {
                neutra: [
                    {
                        frente: "Quais eventos o CloudTrail registra por padrão?",
                        verso: "Os management events, as operações administrativas, e de graça.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os quatro pilares do CloudWatch?",
                        verso: "Métricas, logs, alarmes e dashboards.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o AWS X-Ray acompanha?",
                        verso: "Uma única requisição atravessando vários serviços.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tipos de evento o Health Dashboard da conta mostra?",
                        verso: "Problemas, mudanças agendadas e notificações da conta.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "O que o R de Retire significa numa estratégia de migração?",
                        verso: "Desligar o que não é mais usado, em vez de migrar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto pesa um AWS Snowcone?",
                        verso: "Cerca de 2,1 kg, o que cabe numa mochila.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Amazon Polly faz?",
                        verso: "Converte texto em áudio, o caminho inverso do Transcribe.",
                    },
                    {
                        frente: "O que o Amazon Rekognition faz?",
                        verso: "Visão computacional: detecta objetos, faces e texto em imagem e vídeo.",
                    },
                ],
            },
        },
        10: {
            1: {
                neutra: [
                    {
                        frente: "Quantos pilares o Well-Architected Framework tem hoje?",
                        verso: "Seis, sendo o de sustentabilidade o mais novo deles.",
                    },
                ],
            },
        },
        11: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o SLA do plano Business para produção inoperante?",
                        verso: "Menos de uma hora para a primeira resposta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma SCP faz numa organização da AWS?",
                        verso: "Restringe o que cada conta pode fazer, mesmo com permissão no IAM.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como a compra no AWS Marketplace chega ao cliente?",
                        verso: "Consolidada na mesma fatura da AWS.",
                    },
                ],
            },
        },
    },
};
