// Seed da trilha AWS SAA-C03 (Solutions Architect Associate).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-saa.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AWS SAA-C03";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Trilha aprofundada para a certificacao AWS Certified Solutions Architect Associate (SAA-C03): projetar arquiteturas seguras, resilientes, de alto desempenho e otimizadas em custo. Cobre IAM e seguranca, VPC e rede, computacao e Auto Scaling, serverless e containers, armazenamento, bancos de dados, mensageria e desacoplamento, alta disponibilidade e disaster recovery, monitoramento e custo. Alinhada aos 4 dominios da prova, com foco em trade-offs e cenarios de arquitetura.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        "titulo": "Módulo 1 - Fundamentos de arquitetura e Well-Architected",
        "aulas": [
            {
                "titulo": "Os 6 pilares do Well-Architected Framework",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Os 6 pilares do Well-Architected Framework\n\nO AWS Well-Architected Framework organiza boas práticas de arquitetura em seis pilares, cada um com um conjunto de perguntas e recomendações associadas. Ele não é uma norma obrigatória nem uma certificação: é uma lente para comparar decisões de design e identificar riscos antes que virem incidente, retrabalho ou custo fora de controle.\n\nNa prova SAA-C03 os pilares raramente aparecem como pergunta direta (“quais são os seis pilares?”). Eles aparecem como critério de desempate: várias opções de uma questão podem estar tecnicamente corretas, e a diferença entre elas é qual pilar o enunciado está priorizando naquele cenário."
                    },
                    {
                        "type": "text",
                        "value": "## Os seis pilares\n\n- **Excelência operacional**: rodar e monitorar sistemas para entregar valor de negócio, com processos que melhoram continuamente. Inclui automação de mudanças e resposta padronizada a eventos.\n- **Segurança**: proteger informação, sistemas e ativos por meio de gestão de identidade, controles de detecção, proteção em camadas e um plano de resposta a incidentes.\n- **Confiabilidade**: garantir que o sistema funcione corretamente e de forma consistente, se recupere de falhas de infraestrutura ou serviço, e escale para atender à demanda.\n- **Eficiência de performance**: usar os recursos computacionais de forma eficiente para atender aos requisitos, mantendo essa eficiência à medida que a demanda e a tecnologia mudam.\n- **Otimização de custo**: evitar gasto desnecessário e entender onde o dinheiro é gasto, entregando o máximo de valor pelo menor custo possível.\n- **Sustentabilidade**: minimizar o impacto ambiental das cargas de trabalho na nuvem, incluindo consumo de energia e uso eficiente de recursos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pilar\", \"Pergunta central\", \"Prática associada\"], [\"Excelência operacional\", \"Como automatizar e melhorar operações continuamente?\", \"Infraestrutura como código, runbooks, playbooks\"], [\"Segurança\", \"Como proteger dados e cargas de trabalho em todas as camadas?\", \"Privilégio mínimo, criptografia, detecção\"], [\"Confiabilidade\", \"O sistema se recupera de falhas e atende à demanda?\", \"Multi-AZ, backups, testes de recuperação\"], [\"Eficiência de performance\", \"Os recursos usados são os mais adequados à carga?\", \"Escolha do tipo de instância, cache, serverless\"], [\"Otimização de custo\", \"O gasto está alinhado ao valor entregue?\", \"Right sizing, modelos de compra, monitoramento\"], [\"Sustentabilidade\", \"Como reduzir o impacto ambiental da carga de trabalho?\", \"Regiões com energia limpa, maior utilização dos recursos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Trade-offs entre pilares\n\nNenhuma arquitetura maximiza os seis pilares ao mesmo tempo, eles competem entre si, e boa parte das questões de prova testa justamente esse equilíbrio:\n\n- **Confiabilidade x custo**: replicar em múltiplas AZs e regiões aumenta a resiliência, mas também a fatura. Uma carga de teste não precisa do mesmo nível de redundância de um sistema de pagamentos em produção.\n- **Performance x custo**: instâncias maiores e discos mais rápidos melhoram o tempo de resposta, mas nem toda carga de trabalho justifica esse gasto extra.\n- **Segurança x excelência operacional**: controles rígidos demais podem travar a velocidade de entrega do time; o objetivo é um controle proporcional ao risco real, não o controle máximo possível.\n- **Sustentabilidade x performance**: superprovisionar recursos para garantir performance de pico deixa capacidade ociosa na maior parte do tempo.\n\nUma questão de prova bem escrita raramente pede isoladamente “a opção mais segura” ou “a mais barata”: ela descreve um requisito de negócio, e espera que você identifique qual pilar pesa mais naquele cenário específico."
                    },
                    {
                        "type": "text",
                        "value": "## O AWS Well-Architected Tool\n\nO AWS Well-Architected Tool é um serviço gratuito, disponível no console, que conduz uma revisão de arquitetura por meio de perguntas organizadas pelos seis pilares. Ao responder, o time recebe uma lista de riscos identificados (baixo, médio ou alto) e recomendações associadas a cada um.\n\nPontos que costumam cair em prova:\n\n- É uma autoavaliação: o time responde às perguntas, a AWS não varre a conta automaticamente em busca de problemas.\n- Gera relatórios (milestones) que podem ser comparados ao longo do tempo, mostrando a evolução da arquitetura entre uma revisão e outra.\n- Complementa, mas não substitui, o AWS Trusted Advisor, que analisa a conta de forma automatizada e contínua, sem depender de um questionário respondido manualmente."
                    },
                    {
                        "type": "code",
                        "value": "Exemplo ilustrativo de saída de uma revisão no AWS Well-Architected Tool\n\nPilar: Confiabilidade\nPergunta: Como você projeta a carga de trabalho para atender à demanda atual e futura?\nRisco identificado: ALTO\n  - A carga de trabalho roda em uma única Zona de Disponibilidade\n  - Não há Auto Scaling configurado para picos de acesso\nRecomendação: distribuir os recursos em ao menos duas AZs e configurar\num Auto Scaling Group com política baseada em métricas de utilização"
                    },
                    {
                        "type": "quote",
                        "value": "Um pilar não é escolhido no abstrato: cada arquitetura decide qual pilar pesa mais para aquela carga de trabalho específica, e essa decisão é o que a prova testa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe quer que sua aplicação continue respondendo mesmo durante a falha de uma instância, e que a capacidade cresça automaticamente nos picos de acesso. Esse objetivo está ligado principalmente a qual pilar do Well-Architected Framework?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Eficiência de performance",
                                "isCorrect": false
                            },
                            {
                                "text": "Excelência operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiabilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Otimização de custo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup implanta sua aplicação de teste interno em uma única Zona de Disponibilidade, sem réplicas, para reduzir custo, mesmo sabendo que isso reduz a disponibilidade. Essa decisão prioriza qual pilar em detrimento de qual outro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Segurança, em detrimento da otimização de custo",
                                "isCorrect": false
                            },
                            {
                                "text": "Otimização de custo, em detrimento da confiabilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Excelência operacional, em detrimento da sustentabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Eficiência de performance, em detrimento da segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto de soluções quer conduzir uma revisão estruturada da arquitetura atual de uma carga de trabalho, respondendo a um questionário organizado pelos seis pilares, sem que a AWS varra a conta automaticamente. Qual recurso atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Trusted Advisor, com verificações automáticas na conta",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Config, registrando o histórico de configuração dos recursos",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Inspector, buscando vulnerabilidades automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Well-Architected Tool, a partir de um questionário guiado",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Ao adicionar réplicas em múltiplas regiões para reduzir o tempo de recuperação após um desastre, uma equipe aumenta a complexidade operacional e o custo mensal da conta. Esse cenário ilustra principalmente a relação entre quais dois pilares?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Confiabilidade e otimização de custo",
                                "isCorrect": true
                            },
                            {
                                "text": "Segurança e sustentabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Eficiência de performance e excelência operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Excelência operacional e segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto avalia duas propostas para o mesmo sistema: a primeira reduz o tempo de resposta usando cache e instâncias otimizadas para computação; a segunda reduz o consumo de energia migrando para instâncias mais eficientes e desligando recursos ociosos fora do horário comercial. Essas duas propostas atendem, respectivamente, a quais pilares?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Otimização de custo e eficiência de performance",
                                "isCorrect": false
                            },
                            {
                                "text": "Eficiência de performance e sustentabilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiabilidade e otimização de custo",
                                "isCorrect": false
                            },
                            {
                                "text": "Segurança e excelência operacional",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Regiões, Zonas de Disponibilidade e Local Zones",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Regiões, Zonas de Disponibilidade e Local Zones\n\nEscolher onde uma carga de trabalho roda é uma das primeiras decisões de arquitetura, e ela raramente se resume a “a região mais próxima”. O foco aqui não é redefinir o que é uma região ou uma AZ, e sim os critérios que orientam a escolha entre elas, e quando vale a pena olhar para opções como Local Zones, Outposts e Wavelength."
                    },
                    {
                        "type": "text",
                        "value": "## Como escolher uma região\n\nAo decidir em qual região colocar uma carga de trabalho, quatro critérios costumam pesar mais:\n\n- **Latência**: a distância até os usuários finais afeta diretamente o tempo de resposta. Escolher a região mais próxima do público-alvo reduz a latência de rede.\n- **Custo**: o preço dos mesmos serviços varia entre regiões, às vezes de forma significativa. Cargas sensíveis a custo podem comparar regiões candidatas antes de decidir.\n- **Conformidade e soberania de dados**: leis e regulações podem exigir que certos dados fiquem armazenados dentro de um país ou bloco específico, restringindo as regiões elegíveis.\n- **Disponibilidade do serviço**: nem todo serviço, nem toda feature de um serviço, está disponível em todas as regiões. Uma arquitetura que depende de um recurso recente pode precisar migrar de região ou esperar o lançamento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\", \"Pergunta a fazer\", \"Exemplo de decisão\"], [\"Latência\", \"Onde estão os usuários finais?\", \"Escolher a região mais próxima do público-alvo\"], [\"Custo\", \"O preço do serviço varia entre as regiões candidatas?\", \"Comparar o custo do mesmo serviço nas regiões possíveis\"], [\"Conformidade\", \"Existe exigência legal de residência de dados?\", \"Manter dados regulados dentro do país exigido\"], [\"Disponibilidade do serviço\", \"O serviço ou a feature necessária já existe nessa região?\", \"Confirmar o lançamento antes de desenhar a arquitetura\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Zonas de disponibilidade: por que distribuir\n\nUma Zona de Disponibilidade (AZ) é composta por um ou mais data centers com energia, refrigeração e rede independentes dentro da mesma região, interligados às outras AZs por links de baixa latência. Rodar uma carga de trabalho em uma única AZ significa que a falha desse data center, seja de energia, de rede ou do próprio hardware, tira a aplicação do ar.\n\nPor isso o padrão de arquitetura recomendado é distribuir recursos em pelo menos duas AZs: instâncias atrás de um Elastic Load Balancing, Auto Scaling Group configurado para lançar instâncias em múltiplas AZs, e bancos de dados com Multi-AZ habilitado. A perda de uma AZ inteira passa a afetar só uma fração da capacidade, não o sistema inteiro."
                    },
                    {
                        "type": "code",
                        "value": "Região (ex.: sa-east-1)\n  |\n  |-- AZ sa-east-1a  -> instâncias da aplicação, subnet pública e privada\n  |-- AZ sa-east-1b  -> instâncias da aplicação, réplica do banco (Multi-AZ)\n  |-- AZ sa-east-1c  -> capacidade extra para o Auto Scaling Group\n\nElastic Load Balancing distribui tráfego entre as três AZs.\nSe sa-east-1a falhar, o tráfego continua sendo atendido por 1b e 1c."
                    },
                    {
                        "type": "text",
                        "value": "## Local Zones, Outposts, Wavelength e edge locations\n\nQuando uma região inteira, mesmo a mais próxima, ainda não é suficiente, a AWS oferece extensões de infraestrutura com propósitos diferentes:\n\n- **AWS Local Zones**: uma extensão de uma região, posicionada perto de grandes centros populacionais e industriais, oferecendo baixa latência para cargas como renderização, jogos e streaming ao vivo, sem exigir hardware do cliente.\n- **AWS Outposts**: hardware da AWS instalado fisicamente no data center do cliente, operado com as mesmas APIs e ferramentas da nuvem. Serve para cargas que precisam ficar on-premises por latência ou por exigência de residência de dados.\n- **AWS Wavelength**: infraestrutura AWS embutida dentro da rede 5G de operadoras de telecomunicação, reduzindo a latência para aplicações móveis que precisam processar dados muito perto do dispositivo.\n- **Edge locations**: pontos de presença usados por serviços como Amazon CloudFront, Amazon Route 53 e AWS Global Accelerator para cache de conteúdo e roteamento, otimizados para entrega de conteúdo, não para rodar cargas de computação de propósito geral."
                    },
                    {
                        "type": "quote",
                        "value": "Regiões e AZs resolvem disponibilidade e conformidade; Local Zones, Outposts e Wavelength resolvem os casos em que mesmo a região mais próxima ainda está longe demais."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa brasileira precisa manter os dados de clientes armazenados dentro do território nacional, por exigência regulatória do setor em que atua. Esse requisito influencia principalmente qual critério de escolha de região?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Conformidade e soberania de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Latência de rede até o usuário final",
                                "isCorrect": false
                            },
                            {
                                "text": "Disponibilidade de serviços na região",
                                "isCorrect": false
                            },
                            {
                                "text": "Custo do armazenamento por gigabyte",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação crítica precisa continuar disponível mesmo que um data center inteiro da AWS pare de funcionar por completo. Qual prática de arquitetura atende diretamente esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Distribuir as instâncias em várias sub-redes dentro de uma única Zona de Disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Concentrar todos os recursos na Zona de Disponibilidade com o menor custo de operação",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuir as instâncias e as réplicas do banco em pelo menos duas Zonas de Disponibilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Replicar os dados apenas nas edge locations do Amazon CloudFront mais próximas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estúdio de renderização 3D em Manaus depende de latência muito baixa até a infraestrutura AWS, mas a região mais próxima ainda introduz um atraso perceptível para essa carga de trabalho. Qual opção reduz essa latência sem exigir hardware físico instalado pelo próprio cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um AWS Outposts instalado no data center do próprio cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma AWS Local Zone posicionada próxima a Manaus",
                                "isCorrect": true
                            },
                            {
                                "text": "Um edge location do Amazon CloudFront configurado em Manaus",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma segunda conta AWS criada na região mais próxima de Manaus",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa de jogos em nuvem quer processar a lógica do jogo o mais perto possível dos smartphones dos jogadores, aproveitando a infraestrutura das operadoras de telecomunicação que oferecem rede 5G. Qual opção atende melhor esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Local Zones, posicionado perto de centros urbanos",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Outposts, instalado na infraestrutura do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudFront com Lambda@Edge, nos pontos de presença",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Wavelength, embutido na rede da operadora de telecom",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma instituição financeira quer usar APIs e ferramentas nativas da AWS, mas por exigência regulatória alguns dados de transações precisam permanecer fisicamente dentro do próprio data center corporativo, sem trafegar até uma região da AWS. Qual opção resolve esse requisito mantendo consistência com o restante da conta AWS?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "AWS Outposts instalado dentro do data center da instituição",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma AWS Local Zone contratada na cidade da instituição",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nova conta AWS criada na região mais próxima do data center",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudFront com uma origem apontando para o data center",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Modelo de responsabilidade compartilhada na arquitetura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Modelo de responsabilidade compartilhada na arquitetura\n\nO modelo de responsabilidade compartilhada já é conhecido desde o Cloud Practitioner: a AWS responde pela segurança **da** nuvem (infraestrutura física, virtualização, rede global), e o cliente responde pela segurança **na** nuvem (configuração, dados, controle de acesso). Esta aula não repete essa definição, e sim como a linha de divisão se desloca conforme o serviço escolhido, e o que isso significa na hora de desenhar uma arquitetura."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\", \"Responsabilidade da AWS\", \"Responsabilidade do cliente\"], [\"Amazon EC2\", \"Hardware, virtualização e rede física\", \"Patch do SO convidado, firewall (security group), dados\"], [\"Amazon S3\", \"Durabilidade, disponibilidade e infraestrutura do serviço\", \"Política de bucket, classificação dos dados, criptografia\"], [\"Amazon RDS\", \"Patch do motor de banco e do SO subjacente, backups automáticos\", \"Security group, usuários do banco, criptografia opcional\"], [\"AWS Lambda\", \"Runtime, sistema operacional e escalonamento da plataforma\", \"Código da função, permissões IAM, variáveis sensíveis\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O espectro de abstração\n\nQuanto mais gerenciado o serviço, mais responsabilidade migra para a AWS, mas ela nunca desaparece por completo do lado do cliente. Em uma instância Amazon EC2 rodando um banco instalado manualmente, o cliente responde pelo patch do sistema operacional, do próprio motor de banco, pela configuração do security group e pelos dados. No Amazon RDS, a AWS assume o patch do sistema operacional e do motor de banco dentro de janelas de manutenção, mas o cliente ainda configura o security group, os usuários do banco e decide sobre criptografia. No AWS Lambda, a AWS cuida do sistema operacional, do runtime e do escalonamento, e o cliente responde pelo código da função, pelas bibliotecas usadas e pelas permissões IAM atribuídas a ela.\n\nEm nenhum desses três nem a AWS, nem o cliente, ficam com responsabilidade zero. O que muda é onde a linha é traçada."
                    },
                    {
                        "type": "text",
                        "value": "## Erros comuns de arquitetura ligados ao modelo compartilhado\n\nBoa parte dos incidentes de segurança na nuvem não vem de falha da AWS, e sim de decisões erradas do lado do cliente:\n\n- Deixar um bucket do Amazon S3 com política de acesso público sem necessidade.\n- Assumir que o RDS ou o Lambda cuidam da criptografia de dados automaticamente, quando em vários casos ela precisa ser habilitada explicitamente.\n- Não aplicar patches de sistema operacional em instâncias EC2, achando que isso é papel da AWS.\n- Usar credenciais de longo prazo, sem rotação, em vez de roles temporárias.\n\nNenhum desses problemas é causado por falha na infraestrutura da AWS: são decisões de configuração, e por isso caem do lado do cliente no modelo compartilhado."
                    },
                    {
                        "type": "code",
                        "value": "Política de bucket que expõe dados publicamente (erro de configuração do cliente)\n\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Principal\": \"*\",\n    \"Action\": \"s3:GetObject\",\n    \"Resource\": \"arn:aws:s3:::bucket-relatorios-internos/*\"\n  }]\n}\n\nO Amazon S3 já oferece o recurso para bloquear isso (Block Public Access, criptografia, logging).\nA escolha de usar \"Principal\": \"*\" é do cliente, não da AWS."
                    },
                    {
                        "type": "quote",
                        "value": "A AWS protege a nuvem onde os dados vivem; a forma como você configura o acesso a esses dados continua sendo escolha sua."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma arquitetura com instâncias Amazon EC2 rodando uma aplicação própria, quem é responsável por aplicar os patches de segurança no sistema operacional convidado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A AWS, porque o patch do sistema operacional faz parte da infraestrutura gerenciada por ela",
                                "isCorrect": false
                            },
                            {
                                "text": "A AWS, mas apenas quando a instância usa a distribuição Amazon Linux",
                                "isCorrect": false
                            },
                            {
                                "text": "O cliente, porque o sistema operacional convidado é responsabilidade dele no EC2",
                                "isCorrect": true
                            },
                            {
                                "text": "O cliente, mas apenas quando a instância está fora de um Auto Scaling Group",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bucket do Amazon S3 com relatórios internos foi configurado, por engano, com leitura pública, e os arquivos ficaram acessíveis por meses até serem descobertos. No modelo de responsabilidade compartilhada, essa exposição é atribuída a quem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "À AWS, que deveria bloquear qualquer acesso público em todo bucket, sem exceção",
                                "isCorrect": false
                            },
                            {
                                "text": "Ao cliente, que configurou a política de acesso que tornou o bucket público",
                                "isCorrect": true
                            },
                            {
                                "text": "Ao cliente, mas só porque o Amazon S3 não oferece recurso de bloqueio de acesso público",
                                "isCorrect": false
                            },
                            {
                                "text": "À AWS, porque a durabilidade dos dados armazenados também cobre o controle de acesso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe escolhe o Amazon RDS em vez de manter o MySQL instalado em uma instância EC2 justamente para reduzir esforço de manutenção. Nesse modelo, quem assume a responsabilidade por aplicar patches no motor do banco de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A AWS, dentro das janelas de manutenção configuradas na instância",
                                "isCorrect": true
                            },
                            {
                                "text": "O cliente, executando comandos manuais diretamente no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "A AWS, mas somente para o mecanismo Aurora, não para o RDS padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O cliente, usando o AWS Systems Manager Patch Manager",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função AWS Lambda apresenta uma falha de segurança porque o código da aplicação usa uma biblioteca desatualizada com uma vulnerabilidade conhecida. De quem é a responsabilidade de corrigir essa vulnerabilidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Da AWS, porque o Lambda gerencia todo o ciclo de vida do código em execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Da AWS, porque o runtime do Lambda valida as bibliotecas usadas pela função",
                                "isCorrect": false
                            },
                            {
                                "text": "Do cliente, mas apenas quando a função é invocada por um API Gateway público",
                                "isCorrect": false
                            },
                            {
                                "text": "Do cliente, dono do código e das dependências usadas na função",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquiteta compara três formas de hospedar o mesmo banco relacional: MySQL instalado manualmente em uma instância EC2, Amazon RDS para MySQL, e Amazon Aurora Serverless. Em relação à responsabilidade pelo patch do sistema operacional subjacente, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nas três opções, o cliente é sempre responsável pelo patch do sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Nas três opções, a AWS assume automaticamente o patch do sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "No RDS e no Aurora Serverless a AWS assume o patch do SO; no EC2 o cliente assume",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas no Aurora Serverless a AWS assume o patch do SO; no EC2 e no RDS o cliente assume",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Princípios de design na nuvem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Princípios de design na nuvem\n\nArquiteturas que só “funcionam na nuvem”, mas continuam pensadas como um data center tradicional, deixam a maior parte do valor da nuvem na mesa. Esta aula reúne os princípios de design que diferenciam uma arquitetura verdadeiramente cloud native: como escalar, como lidar com falha, e como automatizar."
                    },
                    {
                        "type": "text",
                        "value": "## Escalar horizontal vs vertical\n\n**Escala vertical** (scale up) aumenta a capacidade trocando o recurso por um maior: uma instância com mais vCPU e memória, um volume com mais IOPS. É simples de implementar, mas esbarra em um limite físico (o maior tipo de instância disponível) e normalmente exige parar e reiniciar o recurso.\n\n**Escala horizontal** (scale out) aumenta a capacidade adicionando mais recursos em paralelo: mais instâncias atrás de um load balancer, mais nós em um cluster. Não tem um teto tão próximo, e a falha de um recurso individual afeta só uma fração da capacidade total, não o sistema inteiro. Em troca, exige que a aplicação seja desenhada para rodar em múltiplas instâncias ao mesmo tempo, o que normalmente significa ser stateless."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Escala vertical\", \"Escala horizontal\"], [\"Como escala\", \"Aumenta o tamanho de uma única instância\", \"Adiciona mais instâncias em paralelo\"], [\"Limite prático\", \"Limitado ao maior tipo de instância disponível\", \"Soma da capacidade de várias instâncias\"], [\"Impacto de uma falha\", \"Derruba o único recurso existente\", \"Afeta apenas uma fração da capacidade total\"], [\"Costuma exigir\", \"Reinicialização ou troca do tipo de instância\", \"Aplicação stateless e balanceamento de carga\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Elasticidade e desacoplamento\n\n**Elasticidade** vai além de escalar: é a capacidade de adicionar e remover capacidade automaticamente, acompanhando a demanda em tempo real, para cima e para baixo. Um sistema pode ser escalável (crescer de 2 para 20 instâncias ao longo de meses) sem ser elástico (reduzir sozinho para 3 instâncias de madrugada e crescer de novo no pico do dia seguinte).\n\n**Desacoplamento** é separar componentes de forma que a lentidão ou a falha de um não derrube ou trave os outros. Em vez de um serviço chamar o outro diretamente e esperar a resposta, os dois se comunicam por uma fila (Amazon SQS) ou por eventos (Amazon SNS, Amazon EventBridge). Se o componente que recebe a mensagem ficar lento, a fila absorve o atraso em vez de propagar a lentidão para quem enviou."
                    },
                    {
                        "type": "text",
                        "value": "## Projetar para falha e infraestrutura descartável\n\nNa nuvem, o princípio de design é assumir que tudo falha em algum momento: uma instância, um disco, uma AZ inteira. A arquitetura precisa de redundância (mais de uma instância, mais de uma AZ) e de recuperação automatizada (um Auto Scaling Group substitui uma instância que falha no health check, sem intervenção manual).\n\nEssa automação só funciona bem se a infraestrutura for tratada como descartável: instâncias são substituíveis a qualquer momento, criadas a partir de uma AMI e de um script de inicialização (user data), em vez de configuradas manualmente e mantidas vivas por anos. Atualizar um pacote de segurança deixa de ser “entrar na instância e rodar um comando” e passa a ser “publicar uma AMI nova e deixar o Auto Scaling Group trocar as instâncias antigas”."
                    },
                    {
                        "type": "text",
                        "value": "## Stateless e automação\n\nPara que instâncias possam ser criadas e destruídas livremente, a aplicação não pode guardar informação que só existe naquela instância específica, como o carrinho de compras de um usuário salvo em memória local ou em disco. Esse estado precisa morar fora da instância, em um serviço como Amazon ElastiCache ou Amazon DynamoDB, para que qualquer instância consiga atender qualquer requisição. Esse é o princípio **stateless**.\n\nA automação amarra tudo isso: infraestrutura como código (como o AWS CloudFormation) descreve o ambiente em arquivos versionados, elimina configuração manual repetida e torna crível recriar um ambiente inteiro do zero, em vez de depender de um servidor específico que “não pode cair”."
                    },
                    {
                        "type": "quote",
                        "value": "Se um servidor precisa ser tratado com cuidado especial para não cair, ele não foi desenhado para a nuvem, foi só hospedado nela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação hoje roda em uma única instância Amazon EC2. Para suportar mais usuários, o time troca o tipo da instância por um com mais vCPU e memória, mantendo uma única instância. Essa mudança é um exemplo de qual estratégia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escala horizontal",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala vertical",
                                "isCorrect": true
                            },
                            {
                                "text": "Elasticidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Desacoplamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que um Auto Scaling Group possa adicionar e remover instâncias automaticamente sem que usuários percam informações da própria sessão, qual prática de design é necessária?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Armazenar o estado da sessão em disco local da instância, com backup diário",
                                "isCorrect": false
                            },
                            {
                                "text": "Fixar cada usuário sempre na mesma instância, usando sticky sessions no ALB",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o Auto Scaling Group para operar com uma única instância fixa",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar o estado da sessão fora da instância, em um serviço externo",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço de pedidos fica sobrecarregado sempre que o serviço de pagamento apresenta lentidão, porque a chamada entre os dois é síncrona e direta. Qual mudança de arquitetura reduz esse acoplamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Inserir uma fila entre os dois serviços, deixando o processamento assíncrono",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o tamanho da instância do serviço de pagamento para reduzir a lentidão",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um segundo Application Load Balancer só para o serviço de pagamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os dois serviços para a mesma instância, eliminando a chamada de rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe para de atualizar manualmente pacotes de segurança em instâncias antigas. Em vez disso, publica uma nova AMI já atualizada e deixa o Auto Scaling Group substituir gradualmente as instâncias antigas por instâncias novas. Esse comportamento reflete qual princípio de design?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escala vertical, aumentando a capacidade das instâncias existentes aos poucos",
                                "isCorrect": false
                            },
                            {
                                "text": "Infraestrutura descartável: instâncias são substituíveis, não permanentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Alta disponibilidade, distribuindo as instâncias antigas entre várias AZs",
                                "isCorrect": false
                            },
                            {
                                "text": "Otimização de custo, evitando o gasto com licenças de software de patch",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois sistemas crescem de 2 para 20 instâncias ao longo de meses, acompanhando o aumento gradual de usuários. Apenas um deles também reduz sozinho para 3 instâncias de madrugada, quando o tráfego cai, e volta a crescer no pico do dia seguinte, sem intervenção manual. Essa capacidade extra do segundo sistema é chamada de:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Escalabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Tolerância a falhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Elasticidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Desacoplamento",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Serviços gerenciados vs autogerenciados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Serviços gerenciados vs autogerenciados\n\nPraticamente todo serviço da AWS pode ser pensado em um espectro: de um extremo totalmente autogerenciado (você instala e opera tudo sobre um EC2) até um extremo totalmente gerenciado ou serverless (você só usa a capacidade, sem tocar em servidor nenhum). Esta aula usa um banco de dados relacional como fio condutor para mostrar o que se ganha, e o que se abre mão, em cada ponto desse espectro."
                    },
                    {
                        "type": "code",
                        "value": "Autogerenciado                  Gerenciado                    Gerenciado + serverless\nMySQL em uma instância EC2  ->  Amazon RDS para MySQL     ->  Amazon Aurora Serverless\n\nCliente cuida de:               Cliente cuida de:             Cliente cuida de:\n  SO, patch do motor,             schema, dados,                schema, dados\n  backup, alta disponibilidade    parâmetros do banco\n\nAWS cuida de:                   AWS cuida de:                 AWS cuida de:\n  hardware físico                 SO, patch do motor,           tudo isso, mais\n                                   backup, Multi-AZ               capacidade e failover\n                                                                  automáticos"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\", \"EC2 + MySQL autogerenciado\", \"Amazon RDS para MySQL\", \"Amazon Aurora Serverless\"], [\"Controle sobre o SO\", \"Total\", \"Nenhum acesso ao SO\", \"Nenhum acesso ao SO\"], [\"Patch do motor de banco\", \"Feito manualmente pelo cliente\", \"Automático, em janela configurável\", \"Automático\"], [\"Escalonamento de capacidade\", \"Manual, geralmente com downtime\", \"Manual, trocando a classe da instância\", \"Automático, conforme a demanda\"], [\"Esforço operacional típico\", \"Alto\", \"Médio\", \"Baixo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o autogerenciado ainda faz sentido\n\nAbrir mão de um serviço gerenciado costuma custar esforço operacional, então essa escolha precisa se justificar. Alguns motivos legítimos:\n\n- A aplicação depende de uma versão específica do motor de banco que o RDS ainda não suporta.\n- É preciso instalar um agente ou uma ferramenta de monitoramento diretamente no sistema operacional do servidor de banco.\n- Existe uma exigência de licenciamento ou de customização no nível do SO que o serviço gerenciado não permite.\n- Uma aplicação legada foi desenhada com premissas que não se encaixam no modelo do serviço gerenciado.\n\nFora desses casos, abrir mão do gerenciado tende a trocar previsibilidade e velocidade por um controle que, na prática, o time não vai usar."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o gerenciado compensa\n\nNa maior parte dos cenários novos, o serviço gerenciado compensa: o Amazon RDS assume patch de sistema operacional e do motor, backups automáticos e failover com Multi-AZ, sem que o time precise construir e testar esse processo manualmente. O Amazon Aurora Serverless vai além, ajustando a capacidade automaticamente conforme o uso, o que é especialmente útil para cargas de trabalho intermitentes ou imprevisíveis, como um ambiente de desenvolvimento ou uma aplicação usada só em horário comercial.\n\nO ganho não é só menos trabalho: é menos superfície para erro humano em tarefas repetitivas como aplicar um patch ou configurar um backup."
                    },
                    {
                        "type": "text",
                        "value": "## Custo de operação, não só de infraestrutura\n\nComparar apenas o preço por hora de uma instância RDS com o de uma instância EC2 equivalente é uma armadilha comum. O preço por hora não inclui o tempo da equipe para aplicar patches, testar backups, configurar failover e responder a incidentes de infraestrutura, tudo isso que o serviço gerenciado já entrega embutido. Quando esse custo de operação entra na conta, o gerenciado costuma sair mais barato no total, mesmo com um preço por hora nominal mais alto."
                    },
                    {
                        "type": "quote",
                        "value": "O preço por hora é só uma parte da conta; a outra parte é quantas horas de trabalho humano a arquitetura ainda vai exigir depois de no ar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa migra seu MySQL, hoje instalado manualmente em uma instância EC2, para o Amazon RDS. O principal ganho direto dessa migração é:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Acesso completo ao sistema operacional para instalar agentes próprios",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminação total da cobrança por armazenamento de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Controle manual sobre a versão exata do kernel do sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Redução do esforço operacional com patch, backup e alta disponibilidade",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação legada exige uma versão específica e não suportada do motor de banco de dados, além de um agente de monitoramento próprio instalado diretamente no sistema operacional do servidor. Qual abordagem atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "MySQL autogerenciado em uma instância Amazon EC2",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon RDS para MySQL com Multi-AZ habilitado",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Aurora Serverless com escalonamento automático",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS para MySQL com uma read replica dedicada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco de dados é usado por uma aplicação interna acessada de forma esporádica, com longos períodos sem consultas e picos ocasionais e imprevisíveis de uso. Qual opção reduz melhor o custo nesse padrão de acesso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon RDS para MySQL, com uma instância de tamanho fixo sempre ativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Aurora Serverless, com escalonamento automático de capacidade",
                                "isCorrect": true
                            },
                            {
                                "text": "MySQL autogerenciado em uma instância EC2 reservada por um ano",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS para MySQL, com uma read replica sempre ativa em outra AZ",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gestor observa que o preço por hora do Amazon RDS é maior que o de uma instância EC2 equivalente rodando o mesmo banco manualmente, e conclui que o EC2 autogerenciado é sempre a opção mais barata. Qual fator essa conclusão deixa de considerar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O custo de transferência de dados entre Zonas de Disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo de armazenamento adicional exigido pelos snapshots automáticos",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo da equipe para aplicar patches, backups e failover manualmente",
                                "isCorrect": true
                            },
                            {
                                "text": "O custo de licenciamento do sistema operacional usado pela instância",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem DBA dedicado, precisa de um banco relacional com failover automático e sem se preocupar com patch do motor. O volume de acesso é estável e previsível ao longo do dia, sem grandes picos de tráfego. Qual opção equilibra melhor esforço operacional reduzido com custo previsível?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Amazon RDS para MySQL, com Multi-AZ habilitado para failover automático",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Aurora Serverless, pelo escalonamento automático de capacidade",
                                "isCorrect": false
                            },
                            {
                                "text": "MySQL autogerenciado em uma instância EC2, com scripts próprios de failover",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS para MySQL sem Multi-AZ, usando snapshots diários como recuperação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - IAM e identidade",
        "aulas": [
            {
                "titulo": "Usuários, grupos e políticas do IAM",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Usuários, grupos e políticas do IAM\n\nNa SAA-C03, IAM aparece menos como \"o que é um usuário\" e mais como \"qual mecanismo de acesso é o mais seguro e mais adequado para este cenário\". Esta aula revisa os fundamentos com foco em decisões de arquitetura: quando usar usuário, quando usar grupo, e por que credenciais de longa duração são um risco que o exame espera que você saiba mitigar."
                    },
                    {
                        "type": "text",
                        "value": "## Conta root: o superusuário que você deve evitar\n\nA conta root tem acesso irrestrito à conta AWS, incluindo fechar a conta e alterar métodos de pagamento. Boas práticas de arquitetura:\n\n- Proteger a conta root com MFA (preferencialmente um dispositivo de hardware ou virtual dedicado)\n- Não gerar access keys para a conta root\n- Usar a conta root apenas para as poucas tarefas que exigem esse nível (alterar plano de suporte, fechar a conta, algumas configurações iniciais de billing)\n- Criar um usuário IAM administrativo, ou usar o IAM Identity Center, para o dia a dia"
                    },
                    {
                        "type": "text",
                        "value": "## Menor privilégio: usuários, grupos e políticas gerenciadas\n\nO padrão recomendado é anexar políticas a **grupos**, não a usuários individuais. Isso simplifica auditoria e onboarding/offboarding: adicionar ou remover um usuário de um grupo é mais seguro do que replicar políticas usuário a usuário.\n\nPolíticas gerenciadas pela AWS cobrem casos comuns (como `ReadOnlyAccess`); políticas gerenciadas pelo cliente e políticas inline permitem refinar para o menor privilégio necessário. O exame cobra a diferença entre conceder acesso amplo porque funciona e conceder exatamente o necessário."
                    },
                    {
                        "type": "quote",
                        "value": "Menor privilégio não é um checklist único: é revisado continuamente com IAM Access Analyzer e com os relatórios de uso de credenciais (credential report, last accessed)."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:GetObject\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": \"arn:aws:s3:::equipe-relatorios/publico/*\"\n    }\n  ]\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Usuário com access key\", \"IAM Role\"], [\"Duração da credencial\", \"Longa duração, até rotação manual\", \"Temporária (minutos a horas, via STS)\"], [\"Risco em caso de vazamento\", \"Alto, válida até ser revogada\", \"Baixo, expira sozinha\"], [\"Uso recomendado\", \"Casos residuais, sem suporte a role\", \"Aplicações, serviços AWS, acesso federado\"], [\"Rotação\", \"Manual, exige processo\", \"Automática, feita pelo STS\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## MFA e chaves de acesso: quando cada um se aplica\n\nConsole (login humano) deve sempre ter MFA habilitado, especialmente para contas com privilégios administrativos. Acesso programático (CLI, SDK) idealmente não usa access key fixa de usuário: prefira roles assumidas via STS, que já retornam credenciais temporárias sem exigir MFA a cada chamada. Quando access keys forem realmente necessárias, políticas podem exigir MFA para ações sensíveis usando a condição `aws:MultiFactorAuthPresent`."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa acabou de criar sua conta AWS e quer aplicar as boas práticas de segurança recomendadas para a conta root. Qual ação é a mais adequada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gerar uma access key para a conta root e usá-la nas chamadas de API do time de operações, o que evita criar usuários adicionais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compartilhar as credenciais da conta root entre os administradores, já que todos precisam do mesmo nível de acesso à conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar MFA na conta root, reservando seu uso a tarefas que exigem privilégio de root, e criar um usuário IAM para o dia a dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover a conta root após criar o primeiro usuário IAM administrativo, pois ela deixa de ser necessária para a operação da conta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor precisa executar scripts localmente que chamam a API da AWS algumas vezes por semana. Qual abordagem melhor segue o princípio de menor exposição de credenciais de longa duração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar o AWS CLI para assumir uma IAM Role com as permissões necessárias, obtendo credenciais temporárias via STS a cada sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um usuário IAM com uma access key fixa e configurá-la no perfil padrão do AWS CLI da máquina do desenvolvedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anexar a política `AdministratorAccess` a um usuário IAM dedicado e usar suas credenciais nos scripts para evitar erros de permissão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compartilhar a access key de um usuário de serviço existente entre os desenvolvedores que precisam rodar scripts semelhantes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe de segurança quer garantir que ações destrutivas, como terminar instâncias EC2, só sejam permitidas quando o usuário tiver autenticado com MFA. Qual mecanismo implementa esse controle?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar o AWS Config para reverter automaticamente qualquer instância terminada por um usuário sem MFA habilitado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar o AWS Shield Advanced, que bloqueia chamadas de API destrutivas originadas de sessões sem MFA ativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir uma tag obrigatória `mfa-required` nas instâncias EC2 para que o Auto Scaling recuse a terminação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar à política do IAM uma condição que exige `aws:MultiFactorAuthPresent` como `true` para as ações destrutivas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação legada, que não pode ser modificada no curto prazo, roda em instâncias EC2 e usa uma access key de um usuário IAM gravada em um arquivo de configuração. Qual mudança reduz o risco dessa credencial com o menor esforço de reescrita da aplicação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir o intervalo de rotação manual da access key de 90 para 30 dias e monitorar o uso pelo credential report.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a aplicação para uma IAM Role associada a um instance profile, removendo a access key do arquivo de configuração.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mover o arquivo de configuração com a access key para um volume EBS criptografado, mantendo o restante da aplicação inalterado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Restringir a política do usuário IAM para permitir chamadas apenas a partir do range de IP da VPC da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa tem 40 usuários IAM organizados por função (financeiro, desenvolvimento, suporte) e precisa atualizar as permissões sempre que uma função muda. Qual prática reduz o esforço operacional dessas atualizações?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma política inline idêntica em cada usuário da mesma função, ajustando manualmente as políticas quando a função muda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consolidar todos os usuários em uma única política gerenciada pela AWS com permissões amplas o suficiente para todas as funções.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anexar as políticas aos grupos de cada função e incluir os usuários nesses grupos, em vez de anexar política usuário a usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar tags de função em cada usuário e revisar manualmente as políticas anexadas sempre que uma tag for alterada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IAM Roles: EC2, serviços e cross-account",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# IAM Roles: EC2, serviços e cross-account\n\nRoles são o mecanismo padrão para conceder permissões a cargas de trabalho e para acesso entre contas. Diferente de um usuário, uma role não tem credenciais fixas: qualquer principal autorizado pode assumi-la e recebe credenciais temporárias emitidas pelo STS. Esta aula cobre os três padrões mais cobrados na prova: instance profile em EC2, roles de serviço (Lambda, ECS) e AssumeRole entre contas."
                    },
                    {
                        "type": "text",
                        "value": "## Instance profile: como o EC2 recebe credenciais\n\nUma IAM Role anexada a uma instância EC2 é entregue via **instance profile**, um contêiner que associa a role à instância. A aplicação obtém credenciais temporárias consultando o Instance Metadata Service (IMDS) em `169.254.169.254`, sem nenhuma credencial gravada em disco. O AWS SDK busca essas credenciais automaticamente quando nenhuma outra fonte é configurada.\n\nCom o **IMDSv2**, as requisições exigem um token de sessão obtido via PUT, o que mitiga ataques de SSRF que tentassem ler credenciais do metadata service a partir de uma vulnerabilidade na aplicação."
                    },
                    {
                        "type": "text",
                        "value": "## Roles de serviço: Lambda e ECS\n\n- **Lambda execution role**: concede à função permissão para chamar outros serviços (DynamoDB, S3, CloudWatch Logs). O serviço Lambda assume essa role em nome da função a cada invocação.\n- **ECS task role**: permissões usadas pelo código da aplicação dentro do container (por exemplo, ler uma fila SQS).\n- **ECS task execution role**: permissões usadas pelo agente do ECS/Fargate para operações de infraestrutura da task, como puxar a imagem do Amazon ECR e enviar logs ao CloudWatch.\n\nConfundir as duas roles do ECS é um erro comum: task role é da aplicação, task execution role é da infraestrutura da task."
                    },
                    {
                        "type": "text",
                        "value": "## Acesso cross-account com AssumeRole\n\nPara permitir que principals de outra conta acessem recursos, cria-se uma role com uma **trust policy** que lista a conta (ou role/usuário específico) autorizada a assumi-la. O principal da conta confiável chama `sts:AssumeRole` e recebe credenciais temporárias válidas apenas para as permissões da role assumida.\n\nQuando um terceiro, como um SaaS de monitoramento, assume a mesma role em nome de múltiplos clientes, a trust policy deve exigir um `ExternalId` para mitigar o confused deputy problem: sem ele, um cliente malicioso poderia manipular o SaaS para acessar dados de outro cliente."
                    },
                    {
                        "type": "quote",
                        "value": "Uma role nunca deve ser vista como um usuário sem senha: é um mecanismo de credenciais temporárias, assumido sob demanda, sem segredo de longa duração para vazar."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Principal\": {\n        \"AWS\": \"arn:aws:iam::111122223333:root\"\n      },\n      \"Action\": \"sts:AssumeRole\",\n      \"Condition\": {\n        \"StringEquals\": {\n          \"sts:ExternalId\": \"cliente-a1b2c3\"\n        }\n      }\n    }\n  ]\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Quem assume a role\", \"Credencial resultante\"], [\"Aplicação em EC2\", \"A própria instância, via instance profile\", \"Temporária, obtida pelo IMDS\"], [\"Função Lambda\", \"O serviço Lambda, em nome da função\", \"Temporária, injetada no ambiente de execução\"], [\"Acesso cross-account\", \"Usuário ou role de outra conta\", \"Temporária, via sts:AssumeRole\"], [\"Federação (SAML/OIDC)\", \"Usuário externo autenticado no IdP\", \"Temporária, via AssumeRoleWithSAML ou WebIdentity\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação em uma instância EC2 precisa gravar objetos em um bucket S3. Qual é a forma recomendada de conceder essa permissão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Associar à instância um instance profile com uma IAM Role que conceda permissão de escrita no bucket.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gravar no user data da instância uma access key de um usuário IAM com permissão de escrita no bucket.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um usuário IAM para a aplicação e configurar suas credenciais como variáveis de ambiente na instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tornar o bucket público para leitura e escrita, evitando a necessidade de gerenciar credenciais na instância.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A conta A precisa permitir que engenheiros da conta B, de outra unidade de negócio, acessem recursos específicos na conta A sem criar um usuário IAM para cada engenheiro. Qual solução atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um usuário IAM na conta A para cada engenheiro da conta B e compartilhar as access keys pelo time de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar VPC Peering entre as contas A e B para que os engenheiros acessem os recursos diretamente pela rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar o AWS Organizations entre as duas contas, o que concede automaticamente acesso cruzado aos recursos de ambas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma IAM Role na conta A com trust policy que permite a conta B assumi-la, usada via `AssumeRole` no STS.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma função AWS Lambda precisa ler itens de uma tabela DynamoDB e gravar logs no CloudWatch. Qual mecanismo concede essas permissões à função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As credenciais do usuário IAM que fez o deploy da função, propagadas automaticamente para cada invocação da Lambda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma execution role associada à função, com uma política que permite as ações necessárias no DynamoDB e no CloudWatch Logs.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma resource-based policy na própria função Lambda, permitindo chamadas de leitura ao DynamoDB e escrita no CloudWatch Logs.",
                                "isCorrect": false
                            },
                            {
                                "text": "Variáveis de ambiente na configuração da função contendo a access key de um usuário IAM com as permissões necessárias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa de monitoramento terceirizada (SaaS) precisa assumir uma IAM Role na conta do cliente para coletar métricas, e múltiplos clientes usam essa mesma role na conta da SaaS para simplificar sua operação interna. Qual medida a trust policy deve incluir para mitigar o confused deputy problem nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Restringir a trust policy para aceitar apenas chamadas originadas do range de IP público da empresa de monitoramento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir que cada chamada de `AssumeRole` inclua um token MFA gerado no console da conta do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir um `ExternalId` exclusivo por cliente na condição da trust policy, validado pela SaaS antes de assumir a role.",
                                "isCorrect": true
                            },
                            {
                                "text": "Limitar a duração da sessão assumida para 15 minutos, forçando a SaaS a autenticar novamente com frequência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task do Amazon ECS rodando no Fargate precisa que (1) o agente puxe a imagem do Amazon ECR e grave logs no CloudWatch, e que (2) o código da aplicação leia mensagens de uma fila SQS. Como essas permissões devem ser organizadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A task role cobre ambos os itens, já que uma única role concentra as permissões do agente e da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A task execution role cobre o item 1 e a task role cobre o item 2, cada uma com sua própria política.",
                                "isCorrect": true
                            },
                            {
                                "text": "A task execution role cobre ambos os itens, incluindo o acesso da aplicação à fila SQS em tempo de execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O item 1 é automático pelo Fargate sem necessidade de role, e o item 2 exige apenas a task role.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de política: identity-based, resource-based e boundaries",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tipos de política: identity-based, resource-based e boundaries\n\nA SAA cobra com frequência a diferença entre onde uma política é anexada e como múltiplas políticas se combinam em uma decisão final de acesso. Esta aula fecha esse modelo: tipos de política, permission boundaries e a lógica de avaliação que decide se uma requisição é permitida ou negada."
                    },
                    {
                        "type": "text",
                        "value": "## Identity-based vs resource-based\n\n- **Identity-based policy**: anexada a um usuário, grupo ou role. Define o que aquela identidade pode fazer.\n- **Resource-based policy**: anexada diretamente a um recurso, como uma bucket policy do S3, uma key policy do KMS, ou uma policy de fila do SQS ou de tópico do SNS. Define quem pode acessar aquele recurso, inclusive principals de outras contas.\n\nA diferença central: uma resource-based policy pode conceder acesso a um principal de outra conta sem que esse principal precise assumir uma role."
                    },
                    {
                        "type": "text",
                        "value": "## Permission boundaries\n\nUma permission boundary é uma política gerenciada que define o **teto** de permissões que uma identity-based policy pode conceder a um usuário ou role. Ela não concede nada por si só: a permissão efetiva é a interseção entre a política anexada e a boundary.\n\nUso clássico: delegar a um time a criação de roles, para pipelines por exemplo, sem risco de esse time criar uma role com permissões administrativas, porque a boundary limita o teto independentemente do que for anexado depois."
                    },
                    {
                        "type": "text",
                        "value": "## Lógica de avaliação\n\n1. Por padrão, tudo é negado (deny implícito).\n2. Um **deny explícito** em qualquer política aplicável (identity-based, resource-based, SCP, boundary) sempre vence.\n3. Sem deny explícito, é necessário pelo menos um **allow** aplicável.\n4. Para acesso **cross-account**, tanto a identity-based policy do solicitante quanto a resource-based policy do recurso precisam permitir a ação.\n\nEssa ordem (deny explícito, depois allow, depois deny implícito) resolve quase todo cenário de \"por que esse acesso foi negado\" na prova."
                    },
                    {
                        "type": "quote",
                        "value": "Se existe um deny explícito em qualquer política aplicável, nenhuma quantidade de allow em outro lugar muda o resultado."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"NegarForaDaRedeCorporativa\",\n      \"Effect\": \"Deny\",\n      \"Principal\": \"*\",\n      \"Action\": \"s3:*\",\n      \"Resource\": [\n        \"arn:aws:s3:::relatorios-internos\",\n        \"arn:aws:s3:::relatorios-internos/*\"\n      ],\n      \"Condition\": {\n        \"NotIpAddress\": {\n          \"aws:SourceIp\": \"203.0.113.0/24\"\n        }\n      }\n    }\n  ]\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Há deny explícito?\", \"Resultado\"], [\"Allow no identity-based, sem outras políticas\", \"Não\", \"Permitido\"], [\"Allow no identity-based, deny na SCP\", \"Sim, na SCP\", \"Negado\"], [\"Sem nenhuma política aplicável\", \"Não (deny implícito)\", \"Negado\"], [\"Allow só na resource-based, cross-account\", \"Não\", \"Negado, falta allow do solicitante\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma política anexada diretamente a um bucket S3, definindo quais principals podem acessá-lo, é um exemplo de qual tipo de política?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Resource-based policy, associada ao recurso e não a uma identidade do IAM.",
                                "isCorrect": true
                            },
                            {
                                "text": "Identity-based policy, associada ao usuário ou role que faz a requisição ao bucket.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permission boundary, que define o limite máximo de permissões do bucket.",
                                "isCorrect": false
                            },
                            {
                                "text": "Service control policy, aplicada pela AWS Organizations à conta do bucket.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário tem uma política que permite `s3:*` em todos os buckets e outra política que nega explicitamente `s3:DeleteObject` no bucket `financeiro-2026`. Ao tentar excluir um objeto nesse bucket, qual é o resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A exclusão é permitida, pois a política mais recente anexada ao usuário tem prioridade sobre as políticas anteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "A exclusão é negada, pois um deny explícito sempre prevalece sobre qualquer allow na avaliação do IAM.",
                                "isCorrect": true
                            },
                            {
                                "text": "A exclusão é permitida, pois a permissão `s3:*` é mais abrangente e sobrepõe a negação específica de `DeleteObject`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado depende da ordem em que as políticas aparecem na lista de políticas anexadas ao usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de plataforma quer permitir que desenvolvedores criem suas próprias IAM Roles para uso em pipelines de CI/CD, mas sem que essas roles possam obter permissões administrativas na conta. Qual controle atende esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Definir uma permission boundary nas roles que os desenvolvedores criam, limitando o teto de permissões possível na conta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Anexar a política `AdministratorAccess` aos desenvolvedores, confiando que vão restringir manualmente as permissões das roles criadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma SCP na Organizations negando ações administrativas apenas para as roles com nome iniciado por `ci-cd-`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um permission set no IAM Identity Center que restringe as ações administrativas disponíveis para os desenvolvedores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma política deve permitir chamadas à API da AWS apenas quando originadas da rede corporativa, um bloco de IP fixo, mesmo que o usuário tenha credenciais válidas de qualquer outro lugar. Qual elemento da política implementa essa restrição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um Security Group anexado ao usuário IAM restringindo o tráfego de API ao bloco de IP corporativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma Network ACL na VPC bloqueando chamadas de API originadas fora do bloco de IP corporativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma condição usando a chave `aws:SourceIp` comparada ao bloco de IP da rede corporativa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tag `network=corporate` no usuário IAM, validada automaticamente pelo STS antes de emitir credenciais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A conta X quer acessar um bucket S3 que pertence à conta Y. O bucket policy da conta Y já permite `s3:GetObject` para o principal da conta X. Um usuário da conta X tenta ler um objeto, mas recebe acesso negado. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O bucket policy da conta Y não pode conceder acesso cross-account sem que as duas contas estejam dentro da mesma AWS Organization.",
                                "isCorrect": false
                            },
                            {
                                "text": "Buckets S3 exigem que o usuário da conta X assuma uma role na conta Y antes de qualquer leitura cross-account.",
                                "isCorrect": false
                            },
                            {
                                "text": "O objeto foi criado por outro usuário da conta Y, o que bloqueia leitura por qualquer principal externo à conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta ao usuário da conta X uma identity-based policy permitindo `s3:GetObject`: cross-account exige permissão dos dois lados.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "AWS Organizations e SCPs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# AWS Organizations e SCPs\n\nOrganizations resolve governança em ambientes com múltiplas contas: agrupamento, faturamento consolidado e guardrails aplicados de cima para baixo. O ponto central para a prova é entender o que uma SCP faz, e o que ela nunca faz, dentro desse modelo."
                    },
                    {
                        "type": "text",
                        "value": "## Conta de gestão, contas membro e OUs\n\n- **Management account** (antiga master account): cria a Organization, consolida o faturamento, e é a única conta com permissão para gerenciar a estrutura da Organization.\n- **Contas membro**: contas convidadas ou criadas dentro da Organization.\n- **Organizational Units (OUs)**: agrupam contas para aplicar políticas, como SCPs e tag policies, de forma hierárquica, evitando configurar conta por conta.\n\nUma estrutura comum separa OUs por ambiente (produção, desenvolvimento, sandbox) ou por unidade de negócio, cada uma com um conjunto de SCPs adequado ao nível de risco."
                    },
                    {
                        "type": "text",
                        "value": "## SCP: guardrail, não concessão\n\nUma **Service Control Policy** define o teto de permissões disponíveis para as contas de uma OU, ou de uma conta específica. Pontos que a prova cobra bastante:\n\n- SCP **nunca concede** permissão por si só: ela só restringe o que a política IAM da conta pode efetivamente permitir.\n- Um deny em SCP bloqueia até o usuário root da conta membro.\n- A **management account nunca é restringida** por SCPs, mesmo quando anexadas à Root da Organization.\n- Sem nenhuma SCP anexada, o comportamento padrão equivale a permitir tudo, já que a política `FullAWSAccess` é anexada por padrão."
                    },
                    {
                        "type": "text",
                        "value": "## Faturamento consolidado\n\nO **consolidated billing** agrega o uso de todas as contas da Organization em uma fatura única, com dois benefícios diretos de custo: descontos por volume aplicados sobre o uso agregado, e compartilhamento de Reserved Instances e Savings Plans entre contas elegíveis, mesmo que a reserva tenha sido comprada em outra conta da Organization."
                    },
                    {
                        "type": "quote",
                        "value": "SCP é sobre o que uma conta não pode fazer, mesmo que a política IAM dentro dela permita. Ela nunca é a fonte de um allow."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"NegarForaDeRegioesAprovadas\",\n      \"Effect\": \"Deny\",\n      \"NotAction\": [\n        \"iam:*\",\n        \"organizations:*\",\n        \"sts:*\",\n        \"support:*\"\n      ],\n      \"Resource\": \"*\",\n      \"Condition\": {\n        \"StringNotEquals\": {\n          \"aws:RequestedRegion\": [\"us-east-1\", \"sa-east-1\"]\n        }\n      }\n    }\n  ]\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"SCP\", \"Política IAM (identity-based)\"], [\"Concede permissão por si só\", \"Nunca\", \"Sim\"], [\"Onde é anexada\", \"Conta, OU ou Root da Organization\", \"Usuário, grupo ou role\"], [\"Afeta a management account\", \"Não\", \"Sim, dentro da própria conta\"], [\"Efeito de um deny\", \"Bloqueia até o root da conta membro\", \"Bloqueia o principal ao qual está anexada\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma AWS Organization, o que uma Service Control Policy (SCP) faz quando aplicada a uma Organizational Unit (OU)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Define o limite máximo de ações permitidas para as contas da OU, sem conceder nenhuma permissão por si só.",
                                "isCorrect": true
                            },
                            {
                                "text": "Concede automaticamente as permissões definidas na política para todos os usuários IAM das contas da OU.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui as políticas IAM existentes nas contas da OU pelas regras definidas na SCP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define o orçamento máximo de gastos permitido para as contas dentro da OU.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma SCP anexada à OU de produção permite todas as ações em Amazon EC2, mas o usuário que tenta lançar uma instância não tem nenhuma política IAM anexada em sua conta. O que acontece quando ele tenta lançar a instância?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A ação é permitida, pois a SCP já concede diretamente a permissão de lançar instâncias EC2 para a conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ação é permitida, pois toda conta membro herda automaticamente permissões administrativas quando falta política IAM.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ação é negada, pois a SCP só define o teto de permissões e falta uma política IAM que permita a ação ao usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado depende de qual serviço processa a chamada primeiro, o EC2 ou o Organizations, na requisição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer aplicar restrições diferentes para contas de desenvolvimento, mais permissivas, e contas de produção, mais restritivas, dentro da mesma Organization. Qual abordagem estrutura isso de forma mais simples de manter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma única OU para todas as contas e anexar as duas SCPs simultaneamente, deixando a mais restritiva prevalecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anexar diretamente em cada conta a SCP correspondente, sem usar OUs, para ter controle individual por conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar tags `environment=dev` e `environment=prod` nas contas e uma SCP única que lê a tag para decidir a restrição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar OUs separadas para desenvolvimento e produção, e anexar SCPs diferentes a cada OU conforme o nível de restrição.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um administrador anexa à Organizational Root uma SCP que nega a ação `iam:CreateUser` em toda a organização, esperando bloquear a criação de usuários em qualquer conta. Em qual conta essa SCP não terá efeito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Na management account, que nunca é restringida por SCPs, mesmo quando elas estão anexadas à Root da Organization.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em nenhuma conta, já que uma SCP anexada à Root sempre se aplica a todas as contas da Organization, sem exceção alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nas contas que têm o serviço AWS Config desabilitado, pois toda SCP depende do Config para ser avaliada corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nas contas que não estão dentro de nenhuma OU específica, apenas soltas diretamente sob a Root da Organization inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa com 12 contas AWS dentro de uma Organization quer que os descontos por volume e o compartilhamento de Reserved Instances entre as contas aconteçam automaticamente, sem que cada conta negocie separadamente. Qual recurso do Organizations viabiliza isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As SCPs, que redirecionam automaticamente o uso de Reserved Instances entre as contas membro da Organization.",
                                "isCorrect": false
                            },
                            {
                                "text": "O faturamento consolidado, que agrega o uso das contas para aplicar descontos e compartilhar RIs entre elas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O IAM Identity Center, que centraliza o gerenciamento financeiro das contas junto com o acesso dos usuários.",
                                "isCorrect": false
                            },
                            {
                                "text": "As Organizational Units, que definem entre quais contas o desconto por volume pode ser compartilhado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IAM Identity Center, federação e STS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# IAM Identity Center, federação e STS\n\nO padrão de maturidade em identidade na AWS caminha para eliminar usuários IAM permanentes sempre que possível: a força de trabalho autentica via IAM Identity Center ou federação corporativa, aplicações externas usam identidade federada, e tudo se resolve em credenciais temporárias emitidas pelo STS."
                    },
                    {
                        "type": "text",
                        "value": "## IAM Identity Center\n\nSucessor do AWS SSO, o **IAM Identity Center** centraliza o acesso de usuários a múltiplas contas da Organization, e a aplicações de negócio compatíveis, a partir de um único login. Administra **permission sets**, que funcionam como um molde de role aplicado por conta, e pode usar um diretório próprio ou se integrar a um IdP externo (Azure AD, Okta, Active Directory on-premises via AD Connector).\n\nEsse é o serviço indicado quando o requisito é a força de trabalho interna precisar de acesso organizado a várias contas AWS."
                    },
                    {
                        "type": "text",
                        "value": "## Federação SAML e OIDC\n\nQuando a identidade já vive em um diretório corporativo, como Active Directory via ADFS, ou qualquer IdP compatível com SAML 2.0, a federação permite autenticar fora da AWS e trocar essa autenticação por credenciais temporárias com `sts:AssumeRoleWithSAML`, sem duplicar a identidade como usuário IAM. Provedores compatíveis com OIDC seguem o mesmo princípio com `AssumeRoleWithWebIdentity`."
                    },
                    {
                        "type": "text",
                        "value": "## Web identity federation\n\nPara aplicações com usuários finais externos, como um app móvel, a prática recomendada é federação via provedor de identidade web (Google, Apple, Facebook ou qualquer OIDC), tipicamente através do **Amazon Cognito**. Cada usuário final troca seu token de login por credenciais temporárias escopadas, sem que exista um usuário IAM correspondente a cada cliente do aplicativo. Isso é o que permite escalar para milhões de usuários sem explodir o número de identidades IAM."
                    },
                    {
                        "type": "quote",
                        "value": "O objetivo final da federação é sempre o mesmo: a identidade vive fora do IAM, e o STS traduz essa identidade em credenciais temporárias e escopadas."
                    },
                    {
                        "type": "code",
                        "value": "aws sts assume-role-with-web-identity \\\n  --role-arn arn:aws:iam::111122223333:role/AppMovelUploadFotos \\\n  --role-session-name usuario-42981 \\\n  --web-identity-token eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9... \\\n  --provider-id www.amazon.com"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\", \"Público\", \"Como chega a credencial temporária\"], [\"IAM Identity Center\", \"Força de trabalho interna, múltiplas contas\", \"Permission set aplicado no login único\"], [\"Federação SAML/OIDC\", \"Usuários de um diretório corporativo\", \"AssumeRoleWithSAML ou equivalente OIDC\"], [\"Web identity federation\", \"Usuários finais de app móvel ou web\", \"AssumeRoleWithWebIdentity, geralmente via Cognito\"], [\"STS GetSessionToken\", \"Usuário IAM existente que quer MFA temporário\", \"Credencial temporária de curta duração\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa com 300 funcionários precisa dar acesso a múltiplas contas AWS sem criar e gerenciar um usuário IAM permanente para cada funcionário em cada conta. Qual serviço resolve esse problema diretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AWS IAM Identity Center, que centraliza o acesso a múltiplas contas via permission sets e um diretório único.",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS IAM, criando um usuário programático por funcionário em cada conta e sincronizando as senhas automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Cognito, que gerencia usuários corporativos e concede acesso direto ao console de cada conta AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Organizations, que cria automaticamente um usuário IAM em cada conta membro para os funcionários da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo móvel com milhares de usuários finais precisa que cada usuário acesse diretamente um bucket S3 específico para fazer upload de fotos, autenticando-se com sua conta Google. Qual abordagem evita criar um usuário IAM por cliente do aplicativo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um usuário IAM com acesso ao bucket e embutir suas credenciais no código-fonte do aplicativo móvel distribuído.",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar o bucket com acesso público de escrita, já que o volume de usuários inviabiliza qualquer controle individual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma IAM Role por usuário do aplicativo no momento do primeiro login, usando o e-mail do Google como identificador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar web identity federation via Amazon Cognito, trocando o token do Google por credenciais temporárias escopadas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém seus usuários corporativos no Microsoft Active Directory local e quer que eles acessem o console AWS com as mesmas credenciais, sem duplicar contas no IAM. Qual solução usa federação baseada em SAML 2.0?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um usuário IAM para cada conta do Active Directory, sincronizando as senhas por um script agendado diariamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar o Active Directory para se conectar diretamente à API do IAM e criar sessões sem passar pelo STS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um provedor de identidade SAML no IAM, integrado ao AD, usando `AssumeRoleWithSAML` para emitir credenciais temporárias.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar o AWS Directory Service apenas para replicar as senhas do Active Directory dentro de cada usuário IAM criado manualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa em crescimento tem 25 contas AWS organizadas em uma Organization e quer que cada funcionário faça login uma única vez e veja, em um portal, apenas as contas e permissões atribuídas a ele. Qual solução atende esse requisito com menor esforço operacional?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um usuário IAM idêntico replicado manualmente em cada uma das 25 contas, com login único mantido por planilha de controle.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS IAM Identity Center integrado à Organization, atribuindo permission sets por conta a partir de um único ponto de login.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma IAM Role por conta, com trust policy aberta para qualquer usuário autenticado na Organization assumir livremente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um bucket S3 central listando as contas disponíveis, com links que redirecionam o funcionário ao login individual de cada conta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação server-side já autenticada por SAML precisa de credenciais válidas por poucas horas para chamar a API da AWS, sem que um usuário IAM permanente seja criado para essa integração. Qual serviço emite essas credenciais?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS STS (Security Token Service), que emite access key, secret key e session token temporários para a sessão federada.",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS KMS, que gera chaves temporárias de API vinculadas à assinatura SAML recebida pela aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Cognito User Pools, que emite diretamente credenciais de API da AWS para qualquer sessão autenticada.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Certificate Manager, que emite certificados temporários usados pela aplicação para autenticar chamadas de API.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Proteção de dados e serviços de segurança",
        "aulas": [
            {
                "titulo": "AWS KMS e envelope encryption",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# AWS KMS e envelope encryption\n\nO AWS Key Management Service (KMS) centraliza a criação e o controle de acesso às chaves criptográficas usadas para proteger dados em praticamente todos os serviços da AWS. Ele roda sobre HSMs validados pelo FIPS 140-2 e é a base da criptografia em repouso integrada em serviços como Amazon S3, Amazon EBS e Amazon RDS.\n\nNesta aula: os três tipos de chave do KMS, o mecanismo de envelope encryption, como a criptografia em repouso se integra aos serviços de armazenamento e banco de dados, rotação de chaves e a diferença entre key policy e política IAM."
                    },
                    {
                        "type": "text",
                        "value": "## Tipos de chave no KMS\n\n- **AWS owned keys**: não aparecem na sua conta, são compartilhadas internamente pela AWS e você não tem visibilidade nem controle sobre elas. Usadas, por exemplo, como padrão em alguns serviços quando nenhuma outra chave é especificada.\n- **AWS managed keys**: aparecem na sua conta com um alias como `aws/s3` ou `aws/rds`, criadas automaticamente na primeira vez que o serviço precisa criptografar algo. A AWS controla a rotação (anual, obrigatória) e você não edita a key policy.\n- **Customer managed keys (CMK)**: criadas explicitamente por você, com controle total sobre key policy, rotação e grants. São a única opção que permite auditoria granular de uso, compartilhamento entre contas e revogação imediata."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"AWS owned key\", \"AWS managed key\", \"Customer managed key (CMK)\"], [\"Aparece na sua conta\", \"Não\", \"Sim, com alias aws/*\", \"Sim\"], [\"Custo mensal pela chave\", \"Nenhum\", \"Nenhum\", \"Cobrada por chave\"], [\"Rotação\", \"Controlada pela AWS\", \"Automática anual, obrigatória\", \"Automática anual, habilitada por você\"], [\"Key policy editável\", \"Não\", \"Não\", \"Sim, controle total\"], [\"Uso típico\", \"Criptografia padrão interna de serviços\", \"Criptografia em repouso sem exigência de auditoria fina\", \"Dados regulados, compartilhamento entre contas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Envelope encryption\n\nO KMS não criptografa arquivos grandes diretamente: a chamada `Encrypt` da API aceita no máximo 4 KB de dados. Para volumes maiores, o KMS usa **envelope encryption**:\n\n1. A aplicação chama `GenerateDataKey` passando o ID da CMK.\n2. O KMS retorna duas versões de uma data key simétrica: uma em texto claro e outra já criptografada pela CMK.\n3. A aplicação usa a data key em texto claro para criptografar os dados localmente (AES-256, rápido) e depois descarta essa cópia da memória.\n4. Apenas a data key criptografada fica armazenada junto com os dados.\n5. Para decifrar, a aplicação envia a data key criptografada ao KMS (chamada `Decrypt`), recebe a versão em texto claro de volta e decifra os dados localmente.\n\nEsse desenho evita transferir o conteúdo inteiro para o KMS a cada operação e reduz a latência e o número de chamadas de API, mantendo a CMK como a raiz de confiança."
                    },
                    {
                        "type": "code",
                        "value": "Fluxo de envelope encryption\n\nAplicacao                          AWS KMS\n    |--- GenerateDataKey(CMK) -------->|\n    |<-- data key (texto claro) -------|\n    |<-- data key (criptografada) -----|\n    |\n    |  cripto local dos dados com a data key em texto claro (AES-256)\n    |  descarta a data key em texto claro da memoria\n    |  guarda: dados cifrados + data key cifrada\n    |\n    |--- Decrypt(data key cifrada) --->|\n    |<-- data key (texto claro) -------|\n    |\n    |  decifra os dados localmente com a data key"
                    },
                    {
                        "type": "text",
                        "value": "## Criptografia em repouso integrada\n\n- **Amazon S3**: SSE-S3 (chave gerenciada pelo próprio S3, AES-256, sem custo de KMS), SSE-KMS (usa uma CMK, adiciona auditoria via CloudTrail e controle de acesso granular, mas cada GET/PUT gera uma chamada ao KMS) ou SSE-C (você fornece a chave a cada requisição, e a AWS nunca a armazena).\n- **Amazon EBS**: volumes e snapshots criptografados usam uma CMK do KMS. Um volume criado a partir de um snapshot criptografado permanece criptografado. Não é possível criptografar um volume existente sem criar um novo, via snapshot mais cópia com criptografia habilitada.\n- **Amazon RDS**: a criptografia é definida na criação da instância e cobre o armazenamento, os snapshots, as read replicas e os backups automatizados. Não existe opção de habilitar criptografia em uma instância já existente sem criar um snapshot, copiá-lo com criptografia ativada e restaurar uma nova instância a partir dele."
                    },
                    {
                        "type": "quote",
                        "value": "A CMK raramente criptografa os dados em si: ela protege a data key que, por sua vez, protege os dados. Perder o acesso à CMK significa perder o acesso a tudo que ela protege, direta ou indiretamente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe de segurança quer que uma chave do AWS KMS tenha rotação automática anual ativada e permita auditoria detalhada de cada uso via CloudTrail, com key policy totalmente customizável. Qual tipo de chave atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma customer managed key (CMK), com rotação automática habilitada e key policy definida pela própria equipe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma AWS managed key com alias aws/s3, que já vem configurada e pronta para o caso de uso descrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma AWS owned key, compartilhada internamente pelo serviço e sem necessidade de configuração adicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma chave fornecida via SSE-C a cada requisição, que dispensa qualquer cadastro prévio no KMS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa o KMS para proteger arquivos de vários gigabytes armazenados no Amazon S3. A chamada direta Encrypt da API do KMS aceita no máximo 4 KB por requisição. Qual mecanismo o KMS usa para viabilizar a criptografia desses arquivos grandes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Compressão do arquivo para menos de 4 KB antes de cada chamada Encrypt, com descompressão automática na leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Divisão do arquivo em blocos de 4 KB, cada bloco criptografado com uma chamada separada à API Encrypt do KMS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Envelope encryption: uma data key gerada pelo KMS cifra o arquivo localmente, só a data key cifrada vai ao KMS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Upload do arquivo inteiro ao KMS via multipart, que aplica a chamada Encrypt internamente em paralelo aos blocos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de banco de dados quer habilitar criptografia em uma instância Amazon RDS que já está em produção há meses, sem criptografia habilitada desde a criação. Qual caminho é necessário para atingir esse objetivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ativar a opção de criptografia diretamente nas configurações da instância existente, sem período de indisponibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um snapshot da instância, copiá-lo habilitando criptografia, e restaurar uma nova instância a partir da cópia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Anexar uma CMK à instância existente via IAM role, o que criptografa o armazenamento de forma retroativa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar SSE-KMS na instância pelo console do RDS, aplicando a criptografia sem precisar recriar o banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização decide usar AWS managed keys para simplificar a operação de criptografia em vários serviços. Qual comportamento é característico desse tipo de chave e deve ser considerado na decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A organização define livremente a key policy da chave, incluindo quais contas externas podem usá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rotação da chave é opcional e precisa ser habilitada manualmente pela equipe de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave fica visível apenas para o suporte da AWS, sem aparecer no console da própria conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave é criada automaticamente pelo serviço, com rotação anual obrigatória controlada pela AWS.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação com alta taxa de leitura e escrita de objetos criptografados no Amazon S3 usando SSE-KMS começa a sofrer throttling em chamadas ao KMS durante picos de tráfego, já que a arquitetura atual chama o KMS a cada GET e PUT. Qual mudança reduz diretamente a dependência de chamadas ao KMS por operação sem abrir mão de uma CMK?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar SSE-KMS por SSE-C, o que elimina toda chamada ao KMS mantendo a mesma CMK como raiz de confiança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o cache de data keys do lado do cliente, via AWS Encryption SDK, reaproveitando data keys já geradas pela CMK.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o número de objetos no bucket, já que o throttling do KMS está ligado à quantidade de objetos armazenados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os objetos para SSE-S3, que aplica a mesma CMK internamente sem contar como chamada faturável ao KMS.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Secrets Manager vs Parameter Store",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Secrets Manager vs Parameter Store\n\nDois serviços da AWS guardam configuração e segredos fora do código da aplicação: o AWS Systems Manager Parameter Store e o AWS Secrets Manager. Eles se sobrepõem no caso de uso mais simples, uma string criptografada, mas divergem bastante em rotação automática, integração com bancos de dados e custo. Escolher errado custa tanto em dinheiro, já que o Secrets Manager cobra por segredo, quanto em risco operacional, já que o Parameter Store não rotaciona sozinho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"AWS Secrets Manager\", \"SSM Parameter Store\"], [\"Rotação automática\", \"Nativa, via função Lambda gerenciada\", \"Não possui rotação nativa\"], [\"Integração pronta com RDS/Aurora\", \"Sim, um clique na criação do banco\", \"Não\"], [\"Criptografia\", \"KMS obrigatório em todo segredo\", \"KMS opcional, só no tipo SecureString\"], [\"Custo\", \"Cobra por segredo por mês e por chamada\", \"Camada standard é gratuita\"], [\"Tamanho máximo do valor\", \"64 KB\", \"4 KB no standard, 8 KB no advanced\"], [\"Replicação entre regiões\", \"Suportada nativamente\", \"Feita manualmente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Parameter Store em detalhe\n\nO Parameter Store organiza valores em uma hierarquia, como `/app/prod/db-host`, e suporta três tipos: `String`, `StringList` e `SecureString`. Somente `SecureString` é criptografado, usando o KMS (a chave gerenciada `aws/ssm` por padrão, ou uma CMK à sua escolha).\n\nExistem dois níveis de parâmetro:\n- **Standard**: gratuito, até 10.000 parâmetros por conta, valor de até 4 KB.\n- **Advanced**: cobrado por parâmetro, valor de até 8 KB, maior throughput de leitura e suporte a *parameter policies*, por exemplo expiração com notificação via EventBridge.\n\nNão há um mecanismo nativo de rotação: se o segredo precisa trocar periodicamente, essa rotação tem que ser orquestrada por fora, com um Lambda agendado, por exemplo."
                    },
                    {
                        "type": "text",
                        "value": "## Secrets Manager em detalhe\n\nO Secrets Manager foi desenhado especificamente para credenciais. Cada segredo é sempre criptografado por uma chave do KMS, sem opção de texto plano, e o serviço oferece **rotação automática nativa**: você associa uma função Lambda de rotação, a AWS fornece templates prontos, define um intervalo, e o próprio Secrets Manager troca a credencial e atualiza o segredo sem intervenção manual.\n\nPara Amazon RDS, Aurora, DocumentDB e Redshift, a integração é ainda mais direta: é possível marcar a opção de gerenciar a credencial mestre pelo Secrets Manager na criação do banco, e a rotação da senha passa a ser automática de ponta a ponta, sem escrever a função Lambda do zero."
                    },
                    {
                        "type": "code",
                        "value": "Rotacao automatica no Secrets Manager (RDS)\n\n  EventBridge (agenda)\n        |\n        v\n  AWS Secrets Manager --- invoca ---> Lambda de rotacao\n        |                                   |\n        |                                   v\n        |                          Amazon RDS (troca a senha)\n        |                                   |\n        v                                   v\n  Nova versao do segredo  <----- confirma a nova credencial\n        |\n        v\n  Aplicacao busca o segredo atualizado via GetSecretValue"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada um\n\n- Use o **Parameter Store** para configuração de aplicação, como URLs, flags e nomes de bucket, e até para segredos simples quando o orçamento importa e a equipe pode orquestrar a rotação por conta própria.\n- Use o **Secrets Manager** quando o segredo precisa de rotação automática de verdade, principalmente credenciais de banco de dados, ou quando precisa ser compartilhado entre contas ou replicado entre regiões.\n- Em arquiteturas maiores é comum ver os dois convivendo: Parameter Store para configuração, Secrets Manager para credenciais."
                    },
                    {
                        "type": "quote",
                        "value": "O critério prático de decisão raramente é o preço isolado: é a rotação automática. Se a credencial precisa trocar sozinha em um cron, o Secrets Manager se paga evitando um Lambda de rotação escrito do zero."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação precisa armazenar a senha de um banco de dados com rotação automática nativa, sem que o time precise escrever a lógica de rotação do zero. Qual serviço atende melhor a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AWS Secrets Manager, com rotação automática nativa via templates prontos de função Lambda para bancos de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "SSM Parameter Store no nível standard, armazenando a senha como SecureString criptografada pelo KMS gerenciado.",
                                "isCorrect": false
                            },
                            {
                                "text": "SSM Parameter Store no nível advanced, com parameter policies definindo a expiração programada da senha salva.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon S3 com um bucket privado e criptografia SSE-KMS, guardando a senha dentro de um objeto de configuração.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe usa o SSM Parameter Store para guardar uma chave de API de terceiros como SecureString. Depois de um incidente, decidem que essa chave precisa trocar automaticamente a cada 30 dias sem interferência manual. O que a equipe deve fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ativar uma parameter policy de rotação automática direto no parâmetro SecureString, recurso disponível em qualquer nível do Parameter Store.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o parâmetro para o tipo StringList, que adiciona suporte nativo à rotação periódica de valores armazenados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o parâmetro para o nível advanced, que passa a rotacionar o valor automaticamente a cada intervalo configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a chave para o AWS Secrets Manager, que oferece rotação automática nativa via função Lambda de rotação.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de FinOps percebeu uma cobrança mensal recorrente ligada a segredos armazenados na AWS e quer reduzir custo migrando parâmetros de configuração, não sigilosos, que hoje estão no Secrets Manager. Qual mudança reduz esse custo diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter os parâmetros no Secrets Manager e reduzir a frequência de rotação automática para diminuir a cobrança por chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os parâmetros para o Amazon S3 com versionamento ativado, o que elimina qualquer custo de armazenamento de configuração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os parâmetros de configuração para o SSM Parameter Store no nível standard, gratuito para esse volume de uso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar os parâmetros para o DynamoDB com criptografia em repouso, cobrando apenas pela leitura sob demanda dos itens.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização precisa que a senha mestre de uma instância Amazon RDS seja trocada periodicamente sem guardar a senha em variável de ambiente fixa, e sem desenvolver uma função de rotação customizada. Qual abordagem exige menos esforço de implementação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Habilitar o gerenciamento da credencial mestre pelo AWS Secrets Manager diretamente na instância RDS, via integração nativa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma função Lambda própria, acionada pelo EventBridge, que atualiza a senha no RDS e em um parâmetro SecureString.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar a senha em um parâmetro standard do SSM e configurar uma parameter policy de rotação a cada 30 dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o AWS Systems Manager Automation para rodar um runbook mensal que troca a senha e atualiza o Parameter Store.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação multi-região precisa que o mesmo segredo de banco de dados esteja disponível em duas regiões AWS, com a rotação automática mantendo as cópias sincronizadas após cada troca de senha. Qual capacidade viabiliza esse cenário sem replicação manual?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "SSM Parameter Store advanced com replicação entre regiões habilitada automaticamente para parâmetros SecureString.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Secrets Manager com réplica multi-região nativa, mantendo uma cópia somente leitura sincronizada após cada rotação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon S3 Cross-Region Replication apontando para os objetos JSON que representam os segredos da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "SSM Parameter Store standard combinado com AWS Backup para copiar os parâmetros entre regiões após cada alteração.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criptografia em trânsito e ACM",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Criptografia em trânsito e ACM\n\nCriptografar dados em repouso, tema da aula anterior, protege contra acesso ao armazenamento físico, mas o tráfego entre cliente e aplicação, e entre componentes internos, precisa de TLS para não viajar em texto claro pela rede. O AWS Certificate Manager (ACM) é o serviço central para emitir e gerenciar certificados TLS usados por Elastic Load Balancing, Amazon CloudFront e Amazon API Gateway."
                    },
                    {
                        "type": "text",
                        "value": "## Certificados públicos vs privados no ACM\n\nO ACM emite dois tipos de certificado:\n\n- **Certificado público**: emitido e renovado sem custo, confiável por qualquer navegador porque a cadeia de confiança é pública. Validado por DNS, recomendado porque permite renovação automática enquanto o registro CNAME existir, ou por e-mail. Só pode ser usado com serviços integrados da AWS, como ELB, CloudFront e API Gateway; a chave privada nunca pode ser exportada.\n- **Certificado privado (ACM Private CA)**: emitido por uma autoridade certificadora privada que você opera dentro da AWS, para uso interno, como comunicação entre microsserviços, mTLS ou dispositivos IoT. Tem custo mensal pela CA privada, além do custo por certificado emitido, e não é confiável publicamente, só dentro da própria infraestrutura."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Certificado público ACM\", \"Certificado privado (ACM Private CA)\"], [\"Custo\", \"Gratuito\", \"Cobra a CA privada por mês, mais por certificado\"], [\"Confiança\", \"Pública, reconhecida por qualquer navegador\", \"Somente dentro da infraestrutura que confia na CA\"], [\"Uso típico\", \"Sites e APIs públicas\", \"mTLS interno, IoT, comunicação serviço a serviço\"], [\"Exportar a chave privada\", \"Nunca permitido\", \"Possível conforme o desenho da CA\"], [\"Onde aplicar\", \"ALB, CloudFront, API Gateway\", \"Cargas internas, EC2, containers, dispositivos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde o TLS termina\n\n- **Application Load Balancer**: termina o TLS no listener HTTPS (443) usando um certificado do ACM; pode reencriptar a conexão até o alvo, com HTTPS no backend, ou seguir em HTTP simples dentro da VPC, dependendo da exigência de segurança.\n- **Network Load Balancer**: por padrão faz *passthrough* de TCP sem tocar no TLS, mas também suporta um listener TLS que termina a conexão no próprio NLB usando um certificado do ACM, útil quando se quer offload de TLS preservando a performance de camada 4.\n- **Amazon CloudFront**: termina o TLS do visitante nas edge locations, mais próximas do usuário final, e pode abrir uma segunda conexão, TLS ou HTTP, até a origem, controlada pela *origin protocol policy*."
                    },
                    {
                        "type": "code",
                        "value": "Pontos de terminacao de TLS\n\nUsuario --TLS--> CloudFront (edge)  --TLS ou HTTP--> Origem (ALB / S3 / custom)\nUsuario --TLS--> ALB (listener 443, cert ACM) --HTTP ou HTTPS--> EC2/ECS targets\nUsuario --TCP--> NLB (passthrough)  --TLS--> instancia (decifra so no destino)\nUsuario --TLS--> NLB (listener TLS, cert ACM) --HTTP--> instancia (offload no NLB)"
                    },
                    {
                        "type": "text",
                        "value": "## Forçando HTTPS\n\n- No **ALB**, cria-se um listener HTTP (80) cuja única regra é uma ação de *redirect* para HTTPS (443) com código 301, enquanto o listener HTTPS aplica o certificado do ACM.\n- No **CloudFront**, a *viewer protocol policy* da distribuição pode ser definida como redirecionar HTTP para HTTPS ou aceitar somente HTTPS, forçando o navegador a sempre negociar TLS com a edge location.\n- A hospedagem de site estático do **Amazon S3** não oferece HTTPS nativamente em domínio próprio; para servir com HTTPS e domínio customizado, o padrão é colocar o CloudFront na frente do bucket."
                    },
                    {
                        "type": "quote",
                        "value": "O TLS só protege o trecho da rede em que está efetivamente ativo. Decidir onde ele termina, na edge, no load balancer ou na instância, é uma decisão de arquitetura tanto quanto de segurança."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe precisa de um certificado TLS para um domínio público usado em uma distribuição do Amazon CloudFront, sem custo adicional pelo certificado em si. Qual opção atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Emitir um certificado autoassinado e enviar manualmente para o ACM na mesma região da distribuição CloudFront.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma CA privada no ACM Private CA e emitir dali um certificado privado para o domínio da distribuição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprar o certificado com um provedor externo e importar a chave privada correspondente direto no CloudFront.",
                                "isCorrect": false
                            },
                            {
                                "text": "Solicitar um certificado público gratuito no ACM, validado por DNS, na região us-east-1 exigida pelo CloudFront.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um Network Load Balancer distribui tráfego para instâncias que processam conexões TCP de alta performance, e o time de segurança exige que o TLS seja decifrado somente na instância final, sem qualquer interferência do balanceador. Qual configuração do NLB atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Listener TLS no NLB com certificado do ACM, reencriptando a conexão antes de repassar ao alvo definido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Listener TCP com passthrough, deixando a negociação TLS acontecer diretamente entre o cliente e a instância.",
                                "isCorrect": true
                            },
                            {
                                "text": "Listener HTTPS no NLB com certificado do ACM, decifrando o tráfego e repassando em HTTP puro ao alvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Listener TLS no NLB configurado sem certificado, registrando apenas metadados da sessão estabelecida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação interna usa comunicação mTLS entre microsserviços que rodam apenas dentro da VPC da empresa, sem qualquer exposição pública, e o time quer emitir certificados a partir de uma autoridade certificadora controlada pela própria empresa dentro da AWS. Qual recurso do ACM atende a esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Certificado público do ACM validado por DNS, reaproveitado entre todos os microsserviços internos da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Certificado público do ACM validado por e-mail, com a chave privada exportada manualmente para cada serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "ACM Private CA, emitindo certificados privados confiáveis apenas dentro da infraestrutura da própria empresa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Certificado público do ACM importado de um provedor externo, sem custo adicional algum de emissão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação web publicada atrás de um Application Load Balancer precisa que todo acesso via HTTP na porta 80 seja automaticamente redirecionado para HTTPS na porta 443, sem alterar o código da aplicação. Qual configuração resolve isso diretamente no ALB?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um listener HTTP na porta 80 com uma regra de ação redirect para HTTPS na porta 443, código 301.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um listener HTTPS na porta 443 com uma regra de ação redirect para HTTP na porta 80, código 301.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um target group configurado para aceitar apenas conexões HTTPS, rejeitando qualquer tráfego HTTP recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um security group que bloqueia por completo a porta 80, forçando o navegador a tentar HTTPS sozinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa migrou um site estático hospedado em um bucket do Amazon S3, com website hosting, e quer servir o conteúdo em um domínio próprio com HTTPS, mantendo baixa latência para usuários em vários continentes. O bucket sozinho não emite HTTPS em domínio customizado. Qual arquitetura resolve isso corretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ativar HTTPS diretamente nas propriedades de website hosting do bucket, com um certificado do ACM regional associado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar um Network Load Balancer com listener TLS na frente do bucket, usando um certificado do ACM Private CA interno.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o conteúdo para um Application Load Balancer com target group apontando o bucket S3 como origem em HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar o Amazon CloudFront na frente do bucket, com um certificado público do ACM em us-east-1 na distribuição.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Proteção de borda: WAF, Shield e Firewall Manager",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Proteção de borda: WAF, Shield e Firewall Manager\n\nDepois de proteger dados em repouso e em trânsito, falta lidar com tráfego malicioso antes que ele chegue à aplicação: tentativas de SQL injection, bots e ataques volumétricos de negação de serviço. Três serviços cobrem essa camada de borda: AWS WAF, na camada de aplicação, AWS Shield, contra DDoS em rede e aplicação, e AWS Firewall Manager, para governança centralizada dessas proteções em múltiplas contas."
                    },
                    {
                        "type": "text",
                        "value": "## AWS WAF em detalhe\n\nO WAF opera na camada 7 e é associado diretamente a uma distribuição do Amazon CloudFront, um Application Load Balancer, uma API REST do Amazon API Gateway, o AWS AppSync ou um pool do Amazon Cognito. A unidade central é o **Web ACL**, uma lista ordenada de regras com uma ação (`Allow`, `Block`, `Count`, `CAPTCHA` ou `Challenge`) aplicada quando a regra é atendida.\n\nTipos de regra mais usados:\n- **Managed rule groups**: conjuntos de regras mantidos pela AWS ou por parceiros, por exemplo proteção contra SQL injection e XSS conhecidos.\n- **Regras customizadas**: baseadas em IP, geografia, string ou regex no corpo ou no header da requisição.\n- **Rate-based rules**: bloqueiam automaticamente um IP que ultrapasse um limite de requisições dentro de uma janela deslizante de 5 minutos, úteis contra brute force e scraping agressivo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Shield Standard\", \"Shield Advanced\"], [\"Custo\", \"Incluído automaticamente para todo cliente AWS\", \"Assinatura paga, com compromisso anual\"], [\"Camadas cobertas\", \"Principalmente camada 3 e 4\", \"Camada 3, 4 e mitigação assistida na camada 7\"], [\"Escopo de recursos\", \"CloudFront, Route 53 e outros serviços de borda\", \"Também EC2, ELB e Global Accelerator\"], [\"Suporte especializado\", \"Não incluído\", \"Acesso 24x7 ao DDoS Response Team\"], [\"Proteção de custo\", \"Não existe\", \"Crédito para custo de escala durante um ataque\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Shield em detalhe\n\nO **Shield Standard** é ativado automaticamente, sem custo, para todos os clientes AWS, e mitiga a grande maioria dos ataques comuns de negação de serviço em camada 3 e 4, como SYN flood e reflection attacks, contra recursos como CloudFront e Route 53.\n\nO **Shield Advanced** é uma assinatura paga que adiciona detecção mais sofisticada, inclusive para tentativas na camada 7, visibilidade detalhada por ataque, suporte direto do DDoS Response Team e proteção de custo, com reembolso de gastos gerados por escala do Auto Scaling ou CloudFront durante um ataque real. Contas com Shield Advanced também recebem o uso do AWS WAF sem custo adicional nos recursos protegidos."
                    },
                    {
                        "type": "code",
                        "value": "Camadas de protecao de borda tipicas\n\nInternet\n   |\n   v\nAmazon CloudFront  <-- Shield (Standard sempre, Advanced se assinado)\n   |\n   v\nAWS WAF (Web ACL: managed rules + rate-based rule)\n   |\n   v\nApplication Load Balancer  <-- tambem protegido por Shield\n   |\n   v\nAplicacao (EC2 / ECS / Lambda)"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Firewall Manager: governança em múltiplas contas\n\nEm uma organização com dezenas de contas, garantir manualmente que toda nova conta ou recurso nasça protegido por WAF e Shield Advanced não escala. O **AWS Firewall Manager** centraliza essa política: a partir de uma conta administradora do AWS Organizations, você define policies de WAF, Shield Advanced, security groups e AWS Network Firewall que são aplicadas automaticamente a todas as contas e recursos, existentes e futuros, dentro do escopo definido.\n\nÉ a ferramenta certa quando o problema não é qual regra criar, mas sim como garantir que a regra exista em toda conta, sempre, algo tipicamente puxado pelo time de segurança central de uma organização grande."
                    },
                    {
                        "type": "quote",
                        "value": "WAF filtra o que a requisição contém, Shield filtra o volume e a origem do tráfego, e Firewall Manager garante que essas duas proteções existam de forma consistente em cada conta da organização."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação pública está recebendo tentativas repetidas de SQL injection no corpo das requisições HTTP. Qual serviço deve ficar na frente da aplicação para inspecionar e bloquear esse tipo de payload malicioso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AWS Shield Standard, que já inspeciona o conteúdo das requisições HTTP em busca de padrões de injeção.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Firewall Manager, aplicando diretamente uma política de bloqueio de payloads maliciosos na conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS WAF, com um Web ACL usando um managed rule group de proteção contra SQL injection.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon GuardDuty, configurado para bloquear automaticamente requisições HTTP com conteúdo suspeito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site público começa a sofrer um volume anormal de requisições vindas de um número limitado de endereços IP, consumindo capacidade do Application Load Balancer sem que nenhum payload malicioso apareça no corpo das requisições. Qual configuração do AWS WAF mitiga diretamente esse padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma rate-based rule no Web ACL, bloqueando IPs que ultrapassem um limite de requisições em 5 minutos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um managed rule group de proteção contra SQL injection, associado ao Web ACL do Application Load Balancer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma regra customizada baseada em geografia, bloqueando países inteiros independente do volume de requisições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma regra baseada em regex no header User-Agent, bloqueando apenas assinaturas conhecidas de bots antigos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um pico de tráfego identificado como ataque volumétrico de negação de serviço contra uma distribuição CloudFront, a empresa quer suporte direto de especialistas AWS durante o incidente e reembolso dos custos extras de escala gerados pelo ataque. Qual serviço oferece especificamente esses dois benefícios?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Shield Standard, incluído automaticamente em toda conta AWS sem qualquer custo adicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Shield Advanced, com acesso ao DDoS Response Team e proteção de custo incluídos na assinatura.",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS WAF com managed rule groups configurados para mitigar picos de tráfego automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Firewall Manager, coordenando a resposta ao incidente entre as contas da organização.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização com mais de 40 contas na AWS quer garantir que toda conta, existente ou criada no futuro, tenha automaticamente um Web ACL padrão do WAF associado aos seus Application Load Balancers, sem depender de cada time configurar isso manualmente. Qual serviço centraliza esse tipo de política?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Shield Advanced, propagando automaticamente regras de WAF para todas as contas da organização.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Organizations sozinho, usando SCPs para exigir a criação manual de Web ACLs em cada conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS WAF implantado individualmente em cada conta, replicado manualmente pelo time de segurança central.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Firewall Manager, aplicando uma policy de WAF a todas as contas dentro do escopo da organização.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de segurança avalia contratar Shield Advanced apenas para reduzir custo de WAF, já que hoje pagam por Web ACLs e regras em vários recursos protegidos. Antes de decidir, querem confirmar exatamente o que a assinatura do Shield Advanced inclui em relação ao WAF. Qual afirmação descreve corretamente esse benefício?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Shield Advanced substitui o WAF, e os Web ACLs deixam de ser necessários nos recursos protegidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Shield Advanced reduz pela metade o custo por milhão de requisições cobrado pelo WAF em qualquer recurso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Shield Advanced inclui o uso do AWS WAF sem custo adicional nos recursos sob a proteção Advanced.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Shield Advanced concede um desconto automático no WAF apenas para recursos associados ao CloudFront.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Detecção: GuardDuty, Inspector, Macie e Detective",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Detecção: GuardDuty, Inspector, Macie e Detective\n\nAs camadas anteriores, KMS, Secrets Manager, ACM, WAF e Shield, previnem e protegem. Esta aula cobre detecção e investigação: quatro serviços que respondem a perguntas diferentes sobre a postura de segurança de uma conta. Eles não competem entre si, cada um cobre uma pergunta específica, e é comum uma arquitetura de segurança madura usar os quatro juntos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\", \"Pergunta que responde\", \"Fonte de dados\"], [\"Amazon GuardDuty\", \"Há atividade maliciosa ou anômala acontecendo agora?\", \"CloudTrail, VPC Flow Logs, logs de DNS, auditoria do EKS\"], [\"Amazon Inspector\", \"Meus workloads têm vulnerabilidades conhecidas?\", \"Pacotes de EC2, imagens no ECR, código de funções Lambda\"], [\"Amazon Macie\", \"Existe dado sensível exposto ou mal protegido no S3?\", \"Conteúdo e metadados de objetos no Amazon S3\"], [\"Amazon Detective\", \"Qual a causa raiz e o alcance de um incidente?\", \"Findings do GuardDuty, CloudTrail, VPC Flow Logs\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Amazon GuardDuty em detalhe\n\nO GuardDuty é um serviço de detecção contínua de ameaças que analisa fontes de log já existentes, como CloudTrail, VPC Flow Logs, logs de DNS, auditoria do EKS e atividade de login do RDS, usando machine learning e feeds de inteligência de ameaças mantidos pela AWS. Não exige agente instalado em nenhuma instância: ele lê logs que a AWS já coleta.\n\nExemplos de findings típicos: uma instância EC2 se comunicando com um IP conhecido de mineração de criptomoeda, chamadas de API incomuns vindas de uma região nunca usada pela conta, ou credenciais IAM com padrão de uso compatível com vazamento."
                    },
                    {
                        "type": "text",
                        "value": "## Amazon Inspector em detalhe\n\nO Inspector automatiza a varredura de vulnerabilidades em três tipos de workload: instâncias **EC2**, via agente do Systems Manager, sem precisar instalar um agente separado do Inspector, imagens de container no **Amazon ECR**, no push da imagem e em rescans contínuos enquanto ela existir no repositório, e o código de funções **AWS Lambda**.\n\nEle cruza pacotes de software instalados com bancos de CVEs conhecidas e também avalia alcance de rede, verificando se uma instância vulnerável está de fato exposta à internet, gerando um score de risco que ajuda a priorizar a correção."
                    },
                    {
                        "type": "text",
                        "value": "## Amazon Macie e Amazon Detective\n\nO **Macie** usa machine learning e reconhecimento de padrões para descobrir e classificar dados sensíveis, como PII, dados financeiros e credenciais, armazenados em buckets do Amazon S3, e alerta tanto sobre a presença desse dado quanto sobre configurações de bucket que o deixam exposto publicamente.\n\nO **Detective** entra depois que um problema já foi sinalizado, por exemplo por um finding do GuardDuty: ele constrói automaticamente um modelo visual de grafo relacionando usuários, instâncias, endereços IP e chamadas de API ao longo do tempo, facilitando responder qual a causa raiz e até onde o incidente se espalhou, sem cruzar logs brutos manualmente."
                    },
                    {
                        "type": "code",
                        "value": "Fluxo tipico: deteccao ate investigacao\n\nAmazon GuardDuty detecta chamada de API anomala\n        |\n        v\nFinding publicado (severidade alta)\n        |\n        v\nAmazon EventBridge captura o finding\n        |\n        v\nAmazon Detective abre o grafo de comportamento do usuario/instancia envolvidos\n        |\n        v\nTime de seguranca confirma o escopo e aciona remediacao (ex.: Lambda revoga credenciais)"
                    },
                    {
                        "type": "quote",
                        "value": "GuardDuty diz que algo está errado, Inspector diz onde há uma fraqueza antes que ela seja explorada, Macie diz onde o dado sensível está mal guardado, e Detective explica a história completa depois que o alarme toca."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma instância Amazon EC2 comprometida começa a se comunicar periodicamente com um endereço IP conhecido de um pool de mineração de criptomoedas. Qual serviço é desenhado especificamente para detectar esse tipo de comportamento anômalo de forma contínua?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon Inspector, escaneando os pacotes de software instalados na instância em busca de malware de mineração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon GuardDuty, analisando VPC Flow Logs e DNS em busca de comunicação com endereços maliciosos conhecidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Macie, classificando o tráfego de rede da instância em busca de padrões de dados sensíveis expostos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Detective, monitorando continuamente as chamadas de API de rede originadas pela própria instância.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de plataforma quer saber, de forma contínua, se as imagens de container publicadas no Amazon ECR contêm pacotes com vulnerabilidades conhecidas antes de serem implantadas em produção. Qual serviço atende diretamente a essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon Inspector, com varredura automática de imagens no push para o ECR e rescans contínuos depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon GuardDuty, analisando os logs de pull e push do ECR em busca de atividade suspeita nas imagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Macie, classificando o conteúdo das camadas da imagem em busca de dados sensíveis embutidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Detective, correlacionando os findings de vulnerabilidade das imagens ao longo do tempo todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma auditoria de conformidade exige comprovar que nenhum bucket do Amazon S3 usado pela aplicação contém números de cartão de crédito ou outros dados pessoais armazenados sem a devida proteção. Qual serviço foi desenhado para descobrir e classificar esse tipo de dado automaticamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon GuardDuty, sinalizando qualquer objeto do S3 acessado fora do padrão normal de uso da conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Inspector, avaliando a configuração de acesso público de cada bucket existente na conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Macie, usando machine learning para identificar e classificar dados sensíveis nos objetos do S3.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Detective, cruzando o histórico de acesso aos buckets para apontar exposições de dados antigas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um finding de severidade alta do GuardDuty indicando uso incomum de credenciais IAM, o time de segurança precisa entender rapidamente todas as chamadas de API, instâncias e usuários envolvidos ao longo do tempo, sem cruzar manualmente logs de CloudTrail e VPC Flow Logs. Qual serviço foi desenhado para essa etapa de investigação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon GuardDuty, que já apresenta esse histórico completo dentro do próprio finding original gerado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Inspector, correlacionando o uso das credenciais com vulnerabilidades conhecidas nos hosts afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Macie, expandindo o finding original para mostrar todos os dados sensíveis já acessados antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Detective, com um grafo de comportamento que relaciona usuários, instâncias e chamadas de API.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa com dezenas de contas na AWS quer montar uma postura de segurança em camadas: identificar vulnerabilidades de software antes da implantação, detectar ameaças ativas em tempo real, descobrir dados sensíveis mal protegidos no S3 e investigar a causa raiz de qualquer incidente confirmado. Qual combinação de serviços cobre essas quatro necessidades, respectivamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "GuardDuty para vulnerabilidades, Inspector para ameaças ativas, Detective para dados sensíveis, Macie para investigação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inspector para vulnerabilidades, GuardDuty para ameaças ativas, Macie para dados sensíveis, Detective para investigação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Macie para vulnerabilidades, Detective para ameaças ativas, Inspector para dados sensíveis, GuardDuty para investigação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inspector para vulnerabilidades, Macie para ameaças ativas, GuardDuty para dados sensíveis, Detective para investigação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Rede e VPC",
        "aulas": [
            {
                "titulo": "VPC, subnets, route tables e endereçamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# VPC, subnets, route tables e endereçamento\n\nUma Amazon VPC é a fronteira de rede que você desenha antes de colocar qualquer recurso na nuvem. Nesta aula o foco não é o conceito básico (isso é conteúdo de Cloud Practitioner), e sim as decisões de arquitetura: como dimensionar o CIDR, o que realmente define se uma subnet é pública ou privada, e como o tráfego é decidido pela route table.\n\nUma VPC recebe um bloco CIDR (por exemplo `10.0.0.0/16`) e cada subnet vive dentro de uma única Availability Zone, com um subconjunto desse CIDR (por exemplo `10.0.1.0/24`)."
                    },
                    {
                        "type": "text",
                        "value": "## Endereços reservados em cada subnet\n\nA AWS reserva 5 endereços IP em toda subnet, o que reduz a capacidade útil:\n\n- **.0**: endereço da rede\n- **.1**: reservado para o router da VPC\n- **.2**: reservado para o DNS da AWS\n- **.3**: reservado para uso futuro da AWS\n- **.255** (último): endereço de broadcast (a VPC não suporta broadcast, mas o endereço fica reservado)\n\nPor isso uma subnet `/24` (256 endereços) tem só 251 IPs utilizáveis. Isso importa na hora de dimensionar: uma subnet pequena demais pode ficar sem IP disponível para escalar um Auto Scaling Group ou rodar tasks do ECS."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de endereço\",\"Característica\"],[\"IP privado\",\"Fixo enquanto a instância existe, dentro do range da subnet, usado para comunicação interna na VPC\"],[\"IP público\",\"Atribuído automaticamente (se habilitado na subnet), muda se a instância for parada e iniciada novamente\"],[\"Elastic IP\",\"IP público fixo, alocado na conta e associado manualmente, permanece o mesmo após parar e iniciar a instância\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que define subnet pública ou privada\n\nUma subnet não tem um atributo \"sou pública\". O que a torna pública é a **route table associada a ela**: se essa tabela tem uma rota para um Internet Gateway (normalmente `0.0.0.0/0 -> igw-xxxx`), a subnet é pública. Sem essa rota, é privada.\n\nIsso significa que uma instância com IP público atribuído ainda assim não terá acesso direto à internet se a subnet dela não tiver a rota para o IGW. E o inverso também vale: colocar uma instância numa subnet pública sem IP público faz com que ela não seja alcançável pela internet, mesmo a subnet tendo a rota."
                    },
                    {
                        "type": "code",
                        "value": "VPC 10.0.0.0/16\n|\n+-- AZ us-east-1a\n|     +-- Subnet publica   10.0.0.0/24  (route table -> 0.0.0.0/0 via IGW)\n|     +-- Subnet privada   10.0.10.0/24 (route table -> 0.0.0.0/0 via NAT)\n|\n+-- AZ us-east-1b\n      +-- Subnet publica   10.0.1.0/24  (route table -> 0.0.0.0/0 via IGW)\n      +-- Subnet privada   10.0.11.0/24 (route table -> 0.0.0.0/0 via NAT)\n\nRoute table (publica):\nDestino          Alvo\n10.0.0.0/16      local\n0.0.0.0/0        igw-0123456789\n\nRoute table (privada):\nDestino          Alvo\n10.0.0.0/16      local\n0.0.0.0/0        nat-0987654321"
                    },
                    {
                        "type": "quote",
                        "value": "Uma subnet é pública ou privada por causa da rota que a route table dela aponta para um Internet Gateway, não por uma marcação própria da subnet ou pelo fato de a instância ter IP público."
                    },
                    {
                        "type": "text",
                        "value": "## Dimensionando o CIDR\n\nAlgumas decisões que aparecem na prova:\n\n- Escolha o CIDR da VPC pensando no crescimento e em **futuras conexões** (peering, VPN, Direct Connect). Ranges sobrepostos entre VPCs impedem peering direto.\n- É comum reservar um `/16` para a VPC e usar `/24` para cada subnet, deixando blocos inteiros de endereço livres para novas subnets (banco de dados, cache, uma nova AZ).\n- Cada AZ normalmente recebe um par de subnets (pública e privada), o que multiplica a quantidade de subnets necessárias conforme a arquitetura cresce em disponibilidade.\n- O CIDR da VPC pode ser ampliado depois (associando blocos secundários), mas planejar um range maior desde o início evita esse retrabalho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um arquiteto está dimensionando uma subnet /24 (256 endereços) para hospedar um Auto Scaling Group dentro de uma VPC. Quantos endereços IP a AWS reserva nessa subnet e não disponibiliza para uso pelas instâncias?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "5 endereços, reservados para rede, router, DNS, uso futuro e broadcast",
                                "isCorrect": true
                            },
                            {
                                "text": "3 endereços, reservados para o router, o DNS e o endereço de broadcast",
                                "isCorrect": false
                            },
                            {
                                "text": "4 endereços, reservados para rede, router, DNS e uso futuro",
                                "isCorrect": false
                            },
                            {
                                "text": "2 endereços, reservados apenas para rede e broadcast da subnet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instância EC2 recebeu um endereço IP público automaticamente, mas está em uma subnet cuja route table não tem rota para nenhum Internet Gateway. O que acontece com o acesso dessa instância à internet?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A instância acessa a internet normalmente, porque o IP público já garante a conectividade externa",
                                "isCorrect": false
                            },
                            {
                                "text": "A instância não acessa a internet, pois a subnet só é pública com rota para o Internet Gateway",
                                "isCorrect": true
                            },
                            {
                                "text": "A instância acessa a internet apenas para tráfego de saída, mas nunca recebe conexões de entrada",
                                "isCorrect": false
                            },
                            {
                                "text": "A instância acessa a internet somente se um Elastic IP for associado no lugar do IP público",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação depende de um endereço IP público fixo, que não pode mudar quando a instância EC2 é parada e iniciada novamente para uma manutenção. Qual recurso atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "IP público padrão da instância, que a AWS sempre reatribui automaticamente após o restart",
                                "isCorrect": false
                            },
                            {
                                "text": "IP privado da instância, que pode ser exposto diretamente para acesso pela internet",
                                "isCorrect": false
                            },
                            {
                                "text": "Elastic IP associado à instância, que permanece o mesmo após parar e iniciar",
                                "isCorrect": true
                            },
                            {
                                "text": "Endereço do Internet Gateway, que pode ser associado diretamente à instância EC2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas VPCs de equipes diferentes precisam se comunicar via VPC peering, mas a criação da conexão está travada. A VPC A usa o CIDR 10.0.0.0/16 e a VPC B também usa 10.0.0.0/16. Qual é a causa do bloqueio e a solução correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O peering exige que ambas as VPCs estejam na mesma conta AWS, e a solução é migrar os recursos para uma conta única",
                                "isCorrect": false
                            },
                            {
                                "text": "O peering exige um Transit Gateway intermediário sempre que o CIDR das VPCs é idêntico entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "As VPCs precisam estar na mesma região para o peering funcionar, independente do CIDR configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "Os CIDRs estão sobrepostos, o que impede o peering, e a solução é recriar uma das VPCs com um CIDR diferente",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa vai criar uma nova VPC que hospedará subnets públicas e privadas em três Availability Zones, com previsão de expansão para novos ambientes nos próximos anos. Qual prática de dimensionamento de CIDR melhor atende esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar um CIDR amplo na VPC, como /16, reservando blocos livres para subnets e Availability Zones futuras",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar um CIDR pequeno na VPC, como /28, e ampliar o range sempre que uma nova subnet for necessária",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o mesmo CIDR de outra VPC já existente na conta, o que simplifica o roteamento entre elas",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um CIDR baseado em IP público, já que subnets privadas não consomem endereços do bloco da VPC",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Internet Gateway, NAT e rotas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Internet Gateway, NAT e rotas\n\nDepois de desenhar subnets públicas e privadas, o próximo passo é decidir como o tráfego realmente sai (e entra) da VPC. Dois componentes resolvem problemas diferentes: o Internet Gateway permite tráfego de entrada e saída para recursos com IP público, e o NAT permite que recursos em subnets privadas iniciem conexões de saída sem exposição direta à internet."
                    },
                    {
                        "type": "text",
                        "value": "## Internet Gateway (IGW)\n\n- É um componente da VPC horizontalmente escalado, redundante e altamente disponível, gerenciado pela AWS (não há o que dimensionar ou corrigir).\n- Cada VPC pode ter no máximo um IGW anexado.\n- Para uma subnet ser pública, a route table dela precisa de uma rota `0.0.0.0/0` apontando para o IGW.\n- O IGW faz a tradução 1:1 entre o IP privado da instância e o IP público ou Elastic IP associado a ela (NAT estático de mão dupla)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"NAT Gateway\",\"NAT Instance\"],[\"Disponibilidade\",\"Gerenciado pela AWS, redundante dentro da AZ\",\"Ponto único de falha, exige configuração manual de HA\"],[\"Manutenção\",\"Sem patch ou gerenciamento do sistema operacional\",\"Requer patch, monitoramento e dimensionamento pelo cliente\"],[\"Largura de banda\",\"Escala automaticamente conforme a demanda, sem gerenciamento\",\"Limitada pelo tipo e tamanho da instância EC2 escolhida\"],[\"Security Group\",\"Não é possível associar Security Group diretamente\",\"Pode ter Security Group, permitindo mais controle\"],[\"Uso como bastion\",\"Não pode ser usado para outra finalidade\",\"Pode acumular outras funções, como port forwarding\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Subnet privada (10.0.10.0/24)          Subnet publica (10.0.0.0/24)\n       |                                          |\n   Instancia EC2                            NAT Gateway (IP elastico)\n       |                                          |\n       v                                          v\nRoute table privada:                     Route table publica:\n0.0.0.0/0 -> nat-0987654321              0.0.0.0/0 -> igw-0123456789\n10.0.0.0/16 -> local                     10.0.0.0/16 -> local\n\nFluxo de saida: EC2 privada -> NAT Gateway -> IGW -> Internet\nA internet nunca inicia conexao direta com a EC2 privada."
                    },
                    {
                        "type": "quote",
                        "value": "Recursos em uma subnet privada saem para a internet através de um NAT Gateway hospedado em uma subnet pública. O NAT nunca fica na própria subnet privada, e a internet nunca inicia conexão diretamente com esses recursos."
                    },
                    {
                        "type": "text",
                        "value": "## Egress-only Internet Gateway (IPv6)\n\nEndereços IPv6 já nascem roteáveis publicamente, então o conceito de NAT (traduzir IP privado em público) não se aplica. Para replicar o comportamento de \"só saída\" em redes IPv6, a AWS oferece o **egress-only Internet Gateway**: permite que uma instância inicie tráfego de saída para a internet via IPv6, mas bloqueia conexões de entrada iniciadas de fora. É stateful, assim como um NAT Gateway, e existe justamente porque um NAT Gateway convencional não suporta IPv6."
                    },
                    {
                        "type": "text",
                        "value": "## Decisões de arquitetura\n\n- Crie um NAT Gateway por Availability Zone quando alta disponibilidade importa: se a AZ do NAT cair, subnets privadas em outras AZs não podem depender dele, e ainda há custo de transferência de dados entre AZs ao cruzar essa dependência.\n- NAT Instance é considerada hoje principalmente em cenários legados ou de custo muito sensível, aceitando o trabalho operacional de gerenciar a instância e a ausência de alta disponibilidade nativa.\n- Uma subnet pública não precisa de NAT: o próprio IGW já atende o tráfego dela. NAT Gateway é sempre implantado em subnet pública para servir subnets privadas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação em uma subnet privada precisa baixar atualizações de segurança pela internet, mas não pode receber nenhuma conexão iniciada de fora. Qual componente de rede atende esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Internet Gateway associado diretamente à subnet privada da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "NAT Gateway implantado em uma subnet pública da mesma VPC",
                                "isCorrect": true
                            },
                            {
                                "text": "Elastic IP associado diretamente à instância na subnet privada",
                                "isCorrect": false
                            },
                            {
                                "text": "Security Group liberando todo o tráfego de saída da instância",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer minimizar o esforço operacional de manter a saída de internet das subnets privadas, sem se preocupar com patch de sistema operacional ou failover manual em caso de falha. Qual opção é mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "NAT Instance em uma instância EC2 de grande porte, dimensionada para nunca precisar de failover",
                                "isCorrect": false
                            },
                            {
                                "text": "Internet Gateway configurado com uma rota adicional apontando para a subnet privada",
                                "isCorrect": false
                            },
                            {
                                "text": "NAT Gateway, gerenciado pela AWS e redundante dentro da Availability Zone onde está implantado",
                                "isCorrect": true
                            },
                            {
                                "text": "NAT Instance com Auto Scaling Group configurado para substituir a instância automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma VPC com endereçamento IPv6 precisa permitir que instâncias em subnet privada iniciem conexões de saída para a internet, sem aceitar conexões iniciadas de fora, sem usar NAT Gateway. Qual recurso resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "NAT Gateway configurado especificamente para operar apenas com endereços IPv6",
                                "isCorrect": false
                            },
                            {
                                "text": "Internet Gateway padrão, já que endereços IPv6 não exigem nenhum tipo de tradução",
                                "isCorrect": false
                            },
                            {
                                "text": "Elastic IP com suporte a IPv6 associado diretamente à instância na subnet privada",
                                "isCorrect": false
                            },
                            {
                                "text": "Egress-only Internet Gateway, que permite saída IPv6 e bloqueia conexões de entrada",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquitetura multi-AZ tem subnets privadas em duas Availability Zones, mas todo o tráfego de saída passa por um único NAT Gateway implantado em apenas uma delas. Qual é o principal risco de arquitetura dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Se a AZ do NAT Gateway falhar, as subnets privadas da outra AZ perdem a saída para a internet",
                                "isCorrect": true
                            },
                            {
                                "text": "O NAT Gateway passa a exigir um Security Group liberando explicitamente as duas Availability Zones",
                                "isCorrect": false
                            },
                            {
                                "text": "O tráfego entre as duas Availability Zones deixa de ser criptografado automaticamente pela AWS",
                                "isCorrect": false
                            },
                            {
                                "text": "As subnets privadas da outra Availability Zone deixam de conseguir se comunicar entre si internamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instância em subnet pública, com Elastic IP associado, precisa acessar a internet. É necessário implantar um NAT Gateway para essa subnet também ter saída?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, todo tráfego de saída da VPC precisa passar por um NAT Gateway, mesmo em subnet pública",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, a rota da subnet pública para o Internet Gateway já é suficiente para o tráfego de saída",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, mas apenas quando a instância usa um Elastic IP em vez do IP público dinâmico padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas somente se a instância também tiver uma Egress-only Internet Gateway associada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Security Groups vs Network ACLs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Security Groups vs Network ACLs\n\nA VPC tem duas camadas de controle de tráfego que trabalham juntas: Security Groups, aplicados na interface de rede (ENI) de cada instância, e Network ACLs, aplicadas na fronteira de cada subnet. Entender a diferença de comportamento entre elas, principalmente stateful versus stateless, é um dos pontos mais cobrados da prova."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Security Group\",\"Network ACL\"],[\"Nível de atuação\",\"Interface de rede (ENI) da instância\",\"Borda da subnet\"],[\"Estado da conexão\",\"Stateful: tráfego de retorno é liberado automaticamente\",\"Stateless: tráfego de retorno precisa de regra explícita\"],[\"Tipos de regra\",\"Somente allow\",\"Allow e deny\"],[\"Avaliação das regras\",\"Todas as regras são avaliadas antes de decidir\",\"Regras avaliadas em ordem numérica, a primeira que casar decide\"],[\"Escopo\",\"Associado explicitamente a cada instância\",\"Aplicada a todas as instâncias da subnet automaticamente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Stateful vs stateless na prática\n\nUm Security Group é **stateful**: se o tráfego de entrada é permitido, a resposta de saída é liberada automaticamente, mesmo sem uma regra de saída correspondente. Isso vale mesmo com a configuração padrão do Security Group, que libera todo o tráfego de saída.\n\nUma Network ACL é **stateless**: entrada e saída são avaliadas de forma independente. Uma requisição HTTPS que entra pela porta 443 recebe resposta em uma porta efêmera (normalmente entre 1024 e 65535), e essa resposta de saída só passa se houver uma regra de saída permitindo essa faixa. Esquecer as portas efêmeras é a causa mais comum de \"funciona no Security Group mas trava na NACL\"."
                    },
                    {
                        "type": "code",
                        "value": "Network ACL da subnet publica\n\nRegras de entrada (Inbound):\nRegra   Tipo     Porta        Origem            Acao\n100     HTTPS    443          0.0.0.0/0         ALLOW\n110     SSH      22           10.0.0.0/16       ALLOW\n*       Todo trafego          0.0.0.0/0         DENY\n\nRegras de saida (Outbound):\nRegra   Tipo     Porta        Destino           Acao\n100     HTTPS    443          0.0.0.0/0         ALLOW\n110     TCP      1024-65535   0.0.0.0/0         ALLOW (portas efemeras, resposta ao trafego de entrada)\n*       Todo trafego          0.0.0.0/0         DENY"
                    },
                    {
                        "type": "quote",
                        "value": "Como a Network ACL é stateless, uma regra de entrada liberando a porta 443 não basta: é preciso liberar também a saída na faixa de portas efêmeras, ou a resposta da conexão nunca sai da subnet."
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada uma\n\n- **Security Group** é a ferramenta principal do dia a dia: controle fino por instância, seguindo o princípio do menor privilégio, inclusive referenciando outro Security Group como origem (em vez de um CIDR) para liberar tráfego só entre camadas da aplicação.\n- **Network ACL** funciona como uma camada adicional na borda da subnet, útil quando é preciso **negar explicitamente** um range de IP conhecido como malicioso, algo que um Security Group não consegue fazer, já que só permite regras de allow."
                    },
                    {
                        "type": "text",
                        "value": "## Cenário de defesa em camadas\n\nUma arquitetura comum combina as duas: a Network ACL da subnet bloqueia um bloco de IPs identificado em um incidente de segurança, enquanto os Security Groups de cada instância continuam controlando, camada por camada, quem pode falar com quem (por exemplo, só o Security Group do ALB pode acessar a porta da aplicação nas instâncias EC2, e só o Security Group da aplicação pode acessar a porta do banco de dados)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual afirmação descreve corretamente a diferença de comportamento entre Security Groups e Network ACLs em uma VPC?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Security Group é stateless e Network ACL é stateful",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos são stateful, mas apenas a Network ACL permite regras de negação",
                                "isCorrect": false
                            },
                            {
                                "text": "Security Group é stateful e Network ACL é stateless",
                                "isCorrect": true
                            },
                            {
                                "text": "Ambos são stateless, mas apenas o Security Group permite regras de negação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma Network ACL libera a entrada na porta 443 para clientes na internet, mas as respostas das requisições não estão chegando aos clientes. A regra de saída da NACL só permite a porta 443. Qual é a causa mais provável e a correção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Security Group da instância está bloqueando o tráfego de saída na porta efêmera correspondente",
                                "isCorrect": false
                            },
                            {
                                "text": "A NACL avalia as regras de saída antes das de entrada, então a ordem das regras 443 precisa ser invertida",
                                "isCorrect": false
                            },
                            {
                                "text": "A subnet está associada a mais de uma Network ACL, e é preciso remover a associação duplicada",
                                "isCorrect": false
                            },
                            {
                                "text": "A NACL é stateless e precisa de uma regra de saída liberando a faixa de portas efêmeras usada na resposta",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de segurança identificou um bloco de endereços IP mal-intencionados e precisa bloquear explicitamente qualquer tráfego desse range para uma subnet inteira. Qual recurso deve ser usado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Network ACL da subnet, adicionando uma regra de negação para o range identificado",
                                "isCorrect": true
                            },
                            {
                                "text": "Security Group da subnet, adicionando uma regra de negação para o range identificado",
                                "isCorrect": false
                            },
                            {
                                "text": "Security Group de cada instância, removendo a regra de allow equivalente ao range",
                                "isCorrect": false
                            },
                            {
                                "text": "Route table da subnet, removendo a rota local associada ao range identificado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação em EC2 só pode se conectar ao banco de dados RDS se a origem for exatamente as instâncias da camada de aplicação, mesmo que o Auto Scaling Group altere os IPs das instâncias com frequência. Qual configuração de Security Group atende esse requisito da forma mais robusta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Liberar a porta do banco no Security Group do RDS usando o CIDR atual da subnet da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Liberar a porta do banco no Security Group do RDS usando o Security Group da aplicação como origem",
                                "isCorrect": true
                            },
                            {
                                "text": "Liberar a porta do banco no Security Group do RDS para 0.0.0.0/0 e restringir na Network ACL",
                                "isCorrect": false
                            },
                            {
                                "text": "Liberar a porta do banco na Network ACL da subnet do RDS usando o CIDR da subnet da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma Network ACL, a regra 100 permite tráfego na porta 22 a partir de 10.0.0.0/16, e a regra 200 nega toda a porta 22 para qualquer origem. Uma requisição SSH chega a partir de 10.0.5.10. Considerando apenas o comportamento da Network ACL, o que acontece com essa requisição?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É negada, porque a Network ACL avalia todas as regras e a de menor prioridade sempre vence",
                                "isCorrect": false
                            },
                            {
                                "text": "É permitida, porque a Network ACL ignora regras de negação quando a origem está na VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "É permitida, porque as regras são avaliadas em ordem numérica e a regra 100 casa primeiro",
                                "isCorrect": true
                            },
                            {
                                "text": "É negada, porque regras de negação têm precedência sobre regras de permissão na avaliação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conectando VPCs: peering, Transit Gateway e PrivateLink",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Conectando VPCs: peering, Transit Gateway e PrivateLink\n\nConforme uma organização cresce, é comum ter múltiplas VPCs, seja por conta (multi-account), por ambiente (produção, homologação) ou por time. A AWS oferece três formas principais de conectar essas VPCs entre si ou consumir serviços através delas, cada uma com um trade-off diferente de escala, custo e topologia."
                    },
                    {
                        "type": "text",
                        "value": "## VPC Peering\n\nUma conexão de peering liga duas VPCs diretamente, usando a rede de backbone da AWS (sem passar pela internet pública). Pontos importantes para a prova:\n\n- É uma relação **1 para 1**: para conectar 3 VPCs entre si totalmente, são necessárias 3 conexões de peering (um mesh cresce rápido).\n- **Não é transitivo**: se a VPC A tem peering com a VPC B, e a VPC B tem peering com a VPC C, a VPC A não alcança a VPC C através de B. É preciso criar peering direto entre A e C.\n- Os CIDRs das VPCs envolvidas **não podem se sobrepor**.\n- Funciona entre contas diferentes e entre regiões diferentes."
                    },
                    {
                        "type": "code",
                        "value": "VPC A  <---- peering ---->  VPC B  <---- peering ---->  VPC C\n\nTrafego permitido:      A <-> B        e        B <-> C\nTrafego NAO permitido:  A <-> C   (peering nao e transitivo)\n\nPara A falar com C, e necessario criar uma terceira conexao:\nVPC A  <---- peering direto ---->  VPC C"
                    },
                    {
                        "type": "text",
                        "value": "## Transit Gateway\n\nO Transit Gateway funciona como um hub central de roteamento: cada VPC (ou conexão VPN, ou Direct Connect) se conecta uma vez ao Transit Gateway, e ele decide o roteamento entre todas as pontas usando tabelas de rota próprias. Diferente do peering, o roteamento através do Transit Gateway **é transitivo**: uma VPC anexada alcança qualquer outra VPC também anexada, sem conexão direta entre elas. Isso substitui uma malha grande de conexões de peering por uma topologia hub-and-spoke, muito mais simples de manter conforme o número de VPCs cresce."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"VPC Peering\",\"Transit Gateway\"],[\"Topologia\",\"Ponto a ponto (mesh)\",\"Hub central (hub-and-spoke)\"],[\"Transitividade\",\"Não transitivo\",\"Transitivo entre anexos\"],[\"Escala recomendada\",\"Poucas VPCs\",\"Dezenas a milhares de VPCs e VPNs\"],[\"Modelo de custo\",\"Sem custo fixo, só transferência de dados\",\"Cobrança por anexo e por dado processado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## PrivateLink e VPC Endpoints\n\nVPC Endpoints permitem acessar serviços sem sair da rede da AWS (sem internet, sem IGW, sem NAT). Existem dois tipos:\n\n- **Interface Endpoint**: cria uma ENI com IP privado dentro da subnet, aproveitando a tecnologia AWS PrivateLink. Funciona para a maioria dos serviços da AWS e também para serviços customizados de outras contas (expostos como um Endpoint Service atrás de um Network Load Balancer).\n- **Gateway Endpoint**: não usa ENI, funciona como um alvo adicional na route table da subnet. Disponível somente para **Amazon S3** e **Amazon DynamoDB**, sem custo adicional pelo endpoint.\n\nDiferente do peering e do Transit Gateway, o PrivateLink não conecta VPCs inteiras: ele expõe um serviço específico, o que reduz a superfície de rede exposta entre as partes."
                    },
                    {
                        "type": "quote",
                        "value": "PrivateLink permite consumir um serviço específico através de fronteiras de VPC ou de conta sem expor esse serviço à internet pública e sem precisar de peering entre as VPCs envolvidas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação em subnet privada precisa acessar o Amazon S3 sem passar pela internet e sem custo adicional pelo endpoint. Qual recurso atende esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Interface Endpoint, que cria uma ENI com IP privado na subnet da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "VPC Peering entre a VPC da aplicação e a VPC gerenciada pelo Amazon S3",
                                "isCorrect": false
                            },
                            {
                                "text": "NAT Gateway configurado com uma rota direta para o endpoint público do Amazon S3",
                                "isCorrect": false
                            },
                            {
                                "text": "Gateway Endpoint, disponível para Amazon S3 e adicionado como alvo na route table",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A VPC de Produção tem peering ativo com a VPC de Ferramentas, e a VPC de Ferramentas tem peering ativo com a VPC de Monitoramento. Um servidor na VPC de Produção tenta acessar um recurso na VPC de Monitoramento. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A conexão falha, porque VPC Peering não é transitivo e não existe peering direto entre as duas",
                                "isCorrect": true
                            },
                            {
                                "text": "A conexão funciona, mas apenas para tráfego iniciado pela VPC de Monitoramento",
                                "isCorrect": false
                            },
                            {
                                "text": "A conexão falha, porque as VPCs de Produção e Monitoramento têm CIDRs sobrepostos",
                                "isCorrect": false
                            },
                            {
                                "text": "A conexão funciona, porque o tráfego é roteado automaticamente através da VPC de Ferramentas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa tem 20 VPCs que precisam se comunicar entre si, com previsão de crescer para mais de 50 nos próximos meses. Manter uma conexão de peering entre cada par de VPCs está se tornando difícil de administrar. Qual solução simplifica essa topologia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar todas as VPCs para uma única VPC compartilhada, eliminando a necessidade de conexões",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir as conexões de peering por um Transit Gateway atuando como hub central de roteamento",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um Gateway Endpoint em cada VPC para permitir o roteamento entre todas elas",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de conexões de peering, garantindo uma conexão direta entre cada par de VPCs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de plataforma quer disponibilizar uma API interna para outras contas AWS consumirem, sem expor a API à internet e sem criar peering nem compartilhar a topologia de rede completa da VPC. Qual abordagem atende melhor esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Criar VPC Peering com cada conta consumidora e restringir o acesso apenas via Security Group",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar a API em uma subnet pública e restringir o acesso pelo CIDR de cada conta consumidora",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar a API atrás de um Network Load Balancer e expô-la como um serviço via AWS PrivateLink",
                                "isCorrect": true
                            },
                            {
                                "text": "Anexar todas as contas consumidoras a um Transit Gateway compartilhado com a VPC da API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tentativa de criar VPC Peering entre duas VPCs de contas diferentes falha logo na criação da conexão. Ambas as VPCs usam o CIDR 172.31.0.0/16. Qual é a causa mais provável da falha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Peering entre contas diferentes não é suportado pela AWS, apenas peering na mesma conta",
                                "isCorrect": false
                            },
                            {
                                "text": "É necessário um Transit Gateway para peering entre VPCs de contas diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "A conexão de peering exige que as duas VPCs estejam na mesma Availability Zone",
                                "isCorrect": false
                            },
                            {
                                "text": "Os CIDRs das duas VPCs estão sobrepostos, o que impede a criação da conexão de peering",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Proteção e visibilidade da rede",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Proteção e visibilidade da rede\n\nAs últimas duas preocupações de uma arquitetura de rede madura são reduzir a superfície exposta à internet e enxergar o que está passando pela VPC. Esta aula fecha o módulo combinando VPC endpoints como controle de segurança, VPC Flow Logs para visibilidade, e o AWS Systems Manager Session Manager como alternativa ao bastion host tradicional."
                    },
                    {
                        "type": "text",
                        "value": "## VPC Endpoints como controle de segurança\n\nAlém de evitar custo de NAT Gateway, um Gateway Endpoint para Amazon S3 ou Amazon DynamoDB permite que uma subnet **totalmente privada**, sem rota para Internet Gateway e sem NAT, ainda acesse esses serviços. O tráfego nunca sai da rede da AWS.\n\nIsso também reduz risco: uma instância comprometida em uma subnet sem qualquer saída para a internet não consegue exfiltrar dados para fora da AWS, mesmo que consiga acessar o S3 através do endpoint. Uma **endpoint policy** pode restringir ainda mais, liberando o endpoint só para buckets ou tabelas específicas."
                    },
                    {
                        "type": "code",
                        "value": "Endpoint policy de um Gateway Endpoint para S3,\nrestringindo o acesso a um unico bucket:\n\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Principal\": \"*\",\n      \"Action\": [\"s3:GetObject\", \"s3:PutObject\"],\n      \"Resource\": [\n        \"arn:aws:s3:::bucket-dados-financeiros\",\n        \"arn:aws:s3:::bucket-dados-financeiros/*\"\n      ]\n    }\n  ]\n}"
                    },
                    {
                        "type": "text",
                        "value": "## VPC Flow Logs\n\nFlow Logs capturam metadados do tráfego IP que passa pelas interfaces de rede, sem incluir o conteúdo (payload) dos pacotes: origem, destino, porta, protocolo, quantidade de bytes e se o tráfego foi aceito ou rejeitado. Podem ser habilitados no nível da VPC, da subnet ou de uma ENI específica, e publicados no Amazon CloudWatch Logs ou no Amazon S3.\n\nO uso mais comum na prática é diagnóstico: quando uma conexão está falhando e não fica claro se é um Security Group ou uma Network ACL rejeitando, o registro REJECT no Flow Log aponta exatamente onde o tráfego foi barrado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Campo do registro\",\"Significado\"],[\"srcaddr / dstaddr\",\"IP de origem e de destino do tráfego\"],[\"srcport / dstport\",\"Porta de origem e de destino\"],[\"action\",\"ACCEPT ou REJECT, conforme Security Group e Network ACL\"],[\"log-status\",\"Indica se o log foi capturado com sucesso (OK, NODATA, SKIPDATA)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## SSM Session Manager em vez de bastion host\n\nO padrão tradicional de bastion host expõe uma instância com a porta 22 (ou 3389) aberta para a internet, exigindo gestão de chaves SSH e ampliando a superfície de ataque. O **AWS Systems Manager Session Manager** substitui esse padrão:\n\n- Não exige nenhuma porta de entrada aberta: nem no Security Group, nem na Network ACL.\n- A instância não precisa de IP público nem de subnet pública, só precisa alcançar o endpoint do Systems Manager (via internet, NAT Gateway ou VPC Interface Endpoint).\n- O acesso é controlado por política IAM, e cada sessão pode ser registrada em log no CloudWatch Logs ou no S3, para auditoria completa de quem executou o quê.\n- Elimina a necessidade de gerenciar, rotacionar e distribuir pares de chaves SSH entre a equipe."
                    },
                    {
                        "type": "quote",
                        "value": "Trocar o bastion host pelo SSM Session Manager não apenas restringe a porta de entrada, remove a porta de entrada por completo: a conexão é sempre iniciada de dentro para fora, em direção ao serviço do Systems Manager."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um engenheiro quer investigar se o tráfego de uma aplicação está sendo aceito ou rejeitado pelos controles de rede da VPC, sem precisar inspecionar o conteúdo dos pacotes. Qual recurso fornece essa visibilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "VPC Flow Logs, que registram origem, destino e se o tráfego foi aceito ou rejeitado",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS CloudTrail, registrando o conteúdo completo dos pacotes trafegados na VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudWatch Metrics, calculando a média de pacotes aceitos por Security Group",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Config, avaliando continuamente a conformidade das regras de Security Group",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma subnet não tem rota para Internet Gateway nem para NAT Gateway. Ainda assim, uma instância nessa subnet precisa gravar arquivos em um bucket do Amazon S3, sem que a subnet ganhe qualquer saída para a internet. Qual solução atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adicionar uma rota para um NAT Gateway apenas para o tráfego destinado ao Amazon S3",
                                "isCorrect": false
                            },
                            {
                                "text": "Associar um Gateway Endpoint do Amazon S3 à route table dessa subnet",
                                "isCorrect": true
                            },
                            {
                                "text": "Associar um Elastic IP à instância, liberando apenas a porta 443 no Security Group",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um Egress-only Internet Gateway restrito ao tráfego do Amazon S3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma auditoria de segurança recomendou eliminar o acesso administrativo via bastion host, que hoje expõe a porta 22 para uma faixa de IPs corporativos. Qual alternativa remove essa porta de entrada por completo, mantendo o acesso administrativo às instâncias?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Restringir ainda mais o Security Group do bastion host, liberando a porta 22 só para um único IP",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o bastion host por uma NAT Instance, que já concentra o acesso administrativo",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Systems Manager Session Manager, que dispensa qualquer porta de entrada aberta na instância",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar o bastion host para uma subnet privada, mantendo a porta 22 liberada apenas na VPC",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instância tem permissão IAM para acessar qualquer bucket do Amazon S3, mas a VPC onde ela está usa um Gateway Endpoint com uma endpoint policy que libera acesso somente a um bucket específico. O que acontece quando a instância tenta acessar um bucket diferente desse?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O acesso é permitido, porque a permissão IAM da instância prevalece sobre a endpoint policy",
                                "isCorrect": false
                            },
                            {
                                "text": "O acesso é permitido, porque a endpoint policy só se aplica a buckets sem política de bucket própria",
                                "isCorrect": false
                            },
                            {
                                "text": "O acesso é negado, porque Gateway Endpoints só permitem acesso a exatamente um bucket por VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "O acesso é negado, porque a endpoint policy também precisa permitir o acesso, além da permissão IAM",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time habilitou VPC Flow Logs no nível da VPC e espera ver registros de absolutamente todo o tráfego de rede, incluindo as consultas ao DNS interno da AWS e ao endereço de metadados da instância. O que deve ser esperado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os Flow Logs não capturam tráfego para o DNS interno da AWS nem para o endereço de metadados",
                                "isCorrect": true
                            },
                            {
                                "text": "Os Flow Logs vão capturar todo o tráfego sem exceção, incluindo DNS interno e metadados",
                                "isCorrect": false
                            },
                            {
                                "text": "Os Flow Logs capturam apenas o tráfego rejeitado, nunca o tráfego aceito pela instância",
                                "isCorrect": false
                            },
                            {
                                "text": "Os Flow Logs exigem um agente instalado na instância para capturar tráfego de DNS e metadados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Conectividade híbrida, DNS e entrega global",
        "aulas": [
            {
                "titulo": "Site-to-Site VPN e Client VPN",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Site-to-Site VPN e Client VPN\n\nDepois de projetar uma VPC isolada, o próximo passo do arquiteto é conectá-la a algo fora da AWS: um datacenter local, uma filial ou um usuário remoto trabalhando de casa. A AWS oferece duas famílias de conectividade híbrida: sobre a internet pública, com criptografia (VPN), ou por circuito dedicado (AWS Direct Connect, aula seguinte). Esta aula cobre as duas variantes de VPN gerenciadas pela AWS: **Site-to-Site VPN**, que liga redes inteiras, e **Client VPN**, que liga usuários individuais."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Site-to-Site VPN\n\nO Site-to-Site VPN cria uma conexão criptografada (IPsec) entre a sua VPC e uma rede on-premises, trafegando pela **internet pública**. As características mais cobradas em cenário de prova:\n\n- **Rápida de montar**: leva minutos a horas para provisionar, sem circuito físico envolvido.\n- **Criptografada**: os túneis IPsec protegem os dados em trânsito por padrão.\n- **Banda e latência variáveis**: como o tráfego passa pela internet pública, throughput e latência não são garantidos e dependem do caminho de rede no momento.\n- **Redundância nativa**: cada conexão Site-to-Site VPN cria **dois túneis**, em endpoints distintos da AWS, para tolerância a falhas. O dispositivo on-premises deve estar configurado para usar os dois.\n\nÉ a escolha natural quando a conexão precisa existir rápido, o volume de dados é moderado, ou quando serve de caminho de backup para uma conexão dedicada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\",\"Onde vive\",\"Papel\"],[\"Virtual Private Gateway (VGW)\",\"Lado AWS, anexado à VPC\",\"Concentrador VPN que recebe os túneis IPsec\"],[\"Customer Gateway (CGW)\",\"Representa o lado on-premises\",\"Recurso que descreve o roteador ou appliance do cliente (IP público, ASN de BGP)\"],[\"Site-to-Site VPN Connection\",\"Liga os dois lados\",\"Par de túneis IPsec entre o VGW (ou Transit Gateway) e o CGW\"]]"
                    },
                    {
                        "type": "code",
                        "value": "On-premises                                              AWS\n\nCustomer Gateway (roteador / appliance VPN)\n    |---- Tunel IPsec 1 (ativo)   ---->   Virtual Private Gateway (VGW)\n    |---- Tunel IPsec 2 (standby) ---->   endpoint distinto, para redundancia\n                                                       |\n                                                 Subnets da VPC"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Client VPN\n\nO Client VPN resolve um problema diferente: não é rede-a-rede, é **usuário-a-rede**. É um serviço gerenciado baseado em OpenVPN que permite que um notebook ou celular individual se conecte com segurança a recursos na AWS, ou, através dela, a recursos on-premises.\n\n- O usuário se conecta com um cliente OpenVPN, incluindo o cliente disponibilizado pela própria AWS.\n- Autenticação por certificado mútuo, Active Directory ou federação SAML com um provedor de identidade externo.\n- O Client VPN Endpoint é associado a uma ou mais subnets da VPC, com regras de autorização controlando quais redes cada usuário pode alcançar.\n- Escala automaticamente conforme o número de conexões simultâneas.\n\nUse Site-to-Site VPN para ligar uma filial inteira; use Client VPN quando quem precisa de acesso é uma pessoa, não uma rede."
                    },
                    {
                        "type": "quote",
                        "value": "Site-to-Site VPN conecta redes; Client VPN conecta pessoas. A pergunta que separa os dois casos de uso é: do outro lado da conexão, existe uma rede inteira ou um único usuário remoto?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um funcionário passou a trabalhar remotamente e precisa acessar com segurança recursos dentro de uma VPC a partir do notebook pessoal, sem conectar a rede inteira da casa dele à AWS. Qual solução atende a esse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um Transit Gateway, que interliga várias VPCs e redes on-premises entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Direct Connect, que exige um circuito físico dedicado até a AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Site-to-Site VPN, que conecta a rede inteira do escritório à VPC.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Client VPN, que autentica e conecta usuários individuais à rede da AWS.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Em uma conexão AWS Site-to-Site VPN, qual recurso representa o roteador ou appliance VPN localizado na rede on-premises do cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Virtual Private Gateway, que concentra os túneis IPsec do lado da AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Transit Gateway, que interliga múltiplas VPCs a uma única rede local.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Customer Gateway, que descreve o dispositivo VPN do lado on-premises.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Internet Gateway, que permite tráfego direto entre a VPC e a internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma conexão AWS Site-to-Site VPN provisiona dois túneis IPsec entre o Customer Gateway e o lado da AWS?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para dar tolerância a falhas, já que os túneis terminam em endpoints distintos da AWS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para dobrar a largura de banda disponível somando a capacidade dos dois túneis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para permitir que cada túnel sirva uma sub-rede diferente dentro da VPC.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para reduzir a latência, já que os túneis operam sempre em balanceamento ativo-ativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente o AWS Client VPN?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É um serviço que cria um circuito físico dedicado entre o usuário e a AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um serviço de VPN baseado em OpenVPN, conectando usuários individuais à AWS.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um recurso que substitui o Customer Gateway em conexões Site-to-Site VPN.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um serviço que interliga duas VPCs distintas dentro da mesma região da AWS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa vai abrir uma filial pequena e precisa conectar a rede local inteira dessa filial à VPC na AWS o mais rápido possível, tolerando variação de latência até contratar um link mais robusto. Qual é a solução mais adequada para esse cenário imediato?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um VPC Peering, que liga redes on-premises inteiras a uma VPC pela internet pública.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Direct Connect, que oferece provisionamento imediato de um circuito dedicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Site-to-Site VPN, que é rápida de provisionar e criptografa o tráfego pela internet.",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Client VPN, que conecta rapidamente cada funcionário individualmente à VPC.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "AWS Direct Connect e cenários híbridos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# AWS Direct Connect e cenários híbridos\n\nQuando a Site-to-Site VPN não é suficiente, seja porque a empresa move um volume grande de dados, seja porque precisa de latência e banda previsíveis, a AWS oferece o **AWS Direct Connect**: uma conexão de rede dedicada entre o datacenter do cliente e a AWS, que não trafega pela internet pública. Esta aula compara os dois caminhos e mostra como combiná-los num desenho resiliente."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda com uma conexão dedicada\n\n- **Desempenho consistente**: como o tráfego não compete com o resto da internet, latência e throughput ficam previsíveis, importante para cargas sensíveis a variação.\n- **Banda alta**: conexões dedicadas de 1, 10 ou 100 Gbps, ou conexões hospedadas por um AWS Direct Connect Partner a partir de 50 Mbps.\n- **Custo de transferência menor**: o custo por GB transferido para fora da AWS cai bastante em relação à internet pública, o que compensa em cargas de dados grandes e constantes.\n- **Provisionamento lento**: pedir o circuito físico, cruzar com um parceiro e ativar a conexão costuma levar semanas ou meses, bem diferente das horas de uma VPN.\n- **Sem criptografia por padrão**: o link é privado, mas não é criptografado automaticamente. Quando isso é exigido, uma VPN roda por cima do Direct Connect, ou usa-se MACsec, disponível em algumas portas dedicadas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Site-to-Site VPN\",\"Direct Connect\"],[\"Meio\",\"Internet pública\",\"Circuito privado dedicado\"],[\"Criptografia\",\"Sim, IPsec por padrão\",\"Não por padrão, exige VPN ou MACsec\"],[\"Provisionamento\",\"Minutos a horas\",\"Semanas a meses\"],[\"Custo por GB transferido\",\"Tarifa padrão de internet\",\"Reduzido, vantajoso em volume alto\"],[\"Desempenho\",\"Variável, depende da internet\",\"Consistente e previsível\"],[\"Melhor para\",\"Início rápido, backup, volumes menores\",\"Cargas grandes, latência crítica, longo prazo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Datacenter on-premises                                        AWS\n\nRoteador corporativo\n    |==== Direct Connect (circuito privado) ====>   Direct Connect Gateway / VGW\n    |==== Site-to-Site VPN (backup) =============>   mesmo VGW, ativado so se o DX cair"
                    },
                    {
                        "type": "text",
                        "value": "## Resiliência: combinando Direct Connect com VPN\n\nDirect Connect é um circuito físico: se o cabo for cortado ou o equipamento falhar, a conexão cai. Por isso, arquiteturas de produção normalmente combinam:\n\n- **Direct Connect com Site-to-Site VPN de backup**: o tráfego usa o circuito dedicado normalmente, e o roteamento via BGP falha automaticamente para o túnel VPN se o Direct Connect cair.\n- **Duas conexões Direct Connect**: para resiliência maior, a AWS recomenda dois circuitos em locais diferentes, usando dispositivos separados, seguindo o AWS Direct Connect Resiliency Toolkit.\n- **Direct Connect Gateway**: quando o cenário híbrido envolve várias VPCs em regiões diferentes, o Direct Connect Gateway permite associar uma única conexão privada a várias VPCs."
                    },
                    {
                        "type": "quote",
                        "value": "Direct Connect troca velocidade de entrega por consistência: demora mais para ficar pronto, mas depois entrega banda e latência em que o arquiteto pode confiar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre AWS Direct Connect e AWS Site-to-Site VPN quanto ao caminho de rede utilizado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dois serviços utilizam exclusivamente túneis criptografados pela internet pública.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois serviços utilizam exclusivamente circuitos privados dedicados à AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Direct Connect usa a internet pública; Site-to-Site VPN usa um circuito privado dedicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Direct Connect usa um circuito privado dedicado; Site-to-Site VPN usa a internet pública.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa de mídia transfere, todos os dias, um volume grande e constante de arquivos entre o datacenter local e a AWS, e precisa de latência previsível para esse fluxo. Há tempo disponível para planejar a contratação com antecedência. Qual solução melhor atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Site-to-Site VPN, pela banda alta e o desempenho consistente de um túnel IPsec.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudFront, pela banda alta e o desempenho consistente na entrega de arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Client VPN, pela banda alta e o desempenho consistente por usuário conectado.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Direct Connect, pela banda alta e o desempenho consistente de um circuito dedicado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, o tráfego que passa por uma conexão AWS Direct Connect é criptografado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, e a AWS não oferece nenhuma forma de adicionar criptografia ao circuito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, todo o tráfego é automaticamente criptografado com IPsec pela AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas apenas o tráfego destinado a buckets do Amazon S3 é criptografado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o link é privado mas não criptografado; é preciso adicionar VPN ou MACsec.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa tem uma única conexão Direct Connect e precisa que ela sirva VPCs localizadas em regiões diferentes da AWS. Qual recurso viabiliza esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Virtual Private Gateway, que associa uma conexão privada a uma única VPC por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Direct Connect Gateway, que associa uma conexão privada a VPCs de várias regiões.",
                                "isCorrect": true
                            },
                            {
                                "text": "VPC Peering, que associa uma conexão privada a VPCs de várias regiões diretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transit Gateway Peering, que elimina a necessidade de qualquer conexão Direct Connect.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de arquitetura quer eliminar o circuito Direct Connect como ponto único de falha, mantendo a rota principal privada e um caminho de contingência que assuma o tráfego automaticamente se o circuito cair. Qual desenho atende a esse requisito com o menor custo adicional?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Substituir o Direct Connect por duas conexões Client VPN operando em ativo-ativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter o Direct Connect como principal e adicionar uma Site-to-Site VPN de backup via BGP.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter só o Direct Connect e configurar novas tentativas automáticas na aplicação cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contratar dois circuitos Direct Connect no mesmo local, usando o mesmo roteador físico.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Route 53: registros e health checks",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Route 53: registros e health checks\n\nO Amazon Route 53 é o serviço de DNS autoritativo da AWS, e também registrador de domínios. Antes de chegar às políticas de roteamento avançadas, na próxima aula, é preciso dominar o vocabulário básico: os tipos de registro que o Route 53 resolve, a diferença entre um CNAME comum e um registro Alias, e como health checks decidem se um recurso está saudável o suficiente para receber tráfego."
                    },
                    {
                        "type": "text",
                        "value": "## Tipos de registro mais cobrados\n\n- **A**: aponta um nome de domínio para um endereço **IPv4**.\n- **AAAA**: aponta um nome de domínio para um endereço **IPv6**.\n- **CNAME**: aponta um nome de domínio para **outro nome de domínio**, não um IP. Duas regras importantes: não pode ser criado no **apex da zona** (o domínio raiz, como `exemplo.com`) e não pode coexistir com outro registro do mesmo nome.\n- **MX, TXT, NS**: registros de e-mail, texto arbitrário (validações, SPF) e servidores de nome, presentes na maioria das zonas, mas fora do foco de arquitetura desta aula.\n\nA restrição do CNAME no apex é o motivo de existir o registro Alias, a seguir."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"CNAME\",\"Alias (Route 53)\"],[\"Funciona no apex da zona\",\"Não\",\"Sim\"],[\"Aponta para\",\"Outro nome de domínio\",\"Recursos da AWS (ALB, CloudFront, S3) ou outro registro\"],[\"Custo da consulta\",\"Cobrado normalmente\",\"Gratuito quando aponta para um recurso da AWS\"],[\"Atualização de IP\",\"Resolve o nome configurado a cada consulta\",\"Acompanha o recurso automaticamente, sem TTL manual\"],[\"Origem do padrão\",\"Padrão DNS comum\",\"Extensão exclusiva do Route 53\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Health checks do Route 53\n\nO Route 53 pode monitorar a saúde de um recurso e parar de direcionar tráfego para ele quando ele falha. Existem três formas principais:\n\n- **Health check de endpoint**: o Route 53 envia requisições periódicas (HTTP, HTTPS ou TCP) para um IP ou domínio e avalia a resposta.\n- **Health check calculado**: combina o resultado de outros health checks com lógica AND/OR/NOT, útil para exigir que vários componentes estejam saudáveis ao mesmo tempo.\n- **Health check por alarme do CloudWatch**: a saúde é decidida pelo estado de um alarme, útil para monitorar recursos que não são acessíveis diretamente por HTTP, como uma métrica interna de banco de dados.\n\nHealth checks por si só não roteiam nada: eles alimentam políticas de roteamento como failover e multivalue answer, vistas na próxima aula."
                    },
                    {
                        "type": "text",
                        "value": "## TTL e propagação\n\nO **TTL** (Time To Live) de um registro define por quanto tempo os resolvedores de DNS podem guardar a resposta em cache antes de consultar o Route 53 de novo.\n\n- **TTL baixo**: mudanças se propagam mais rápido, mas gera mais consultas, com mais custo e mais carga.\n- **TTL alto**: menos consultas e menos custo, mas uma mudança de registro demora mais para valer para todo mundo, já que clientes ainda usam a resposta antiga guardada em cache.\n- Em registros **Alias** que apontam para recursos da AWS, o TTL é gerenciado automaticamente pelo Route 53, acompanhando o recurso de destino.\n\nAntes de uma migração ou um failover planejado, é comum reduzir o TTL com antecedência, exatamente para que a mudança propague mais rápido quando for a hora."
                    },
                    {
                        "type": "code",
                        "value": "exemplo.com.            A      Alias -> meu-alb-1234567.us-east-1.elb.amazonaws.com   (apex, sem custo)\nwww.exemplo.com.        CNAME  destino.outrodominio.com                             (nao pode ser apex)\napi.exemplo.com.        A      Alias -> d111111abcdef8.cloudfront.net                (alias tambem em subdominio)"
                    },
                    {
                        "type": "quote",
                        "value": "Alias resolve, no Route 53, o mesmo problema que o CNAME resolve no DNS comum, só que funciona no apex do domínio e sem custo de consulta quando o destino é um recurso da AWS."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tipo de registro DNS deve ser usado para apontar um nome de domínio diretamente para um endereço IPv4?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Registro CNAME, que mapeia o nome de domínio para um endereço IPv4.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro MX, que mapeia o nome de domínio para um endereço IPv4.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro A, que mapeia o nome de domínio para um endereço IPv4.",
                                "isCorrect": true
                            },
                            {
                                "text": "Registro AAAA, que mapeia o nome de domínio para um endereço IPv4.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe tenta criar um registro CNAME no apex da zona, o domínio raiz sem subdomínio, e a operação é rejeitada. Qual é a alternativa recomendada pelo Route 53 para esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um registro Alias, que funciona no apex e pode apontar para recursos da AWS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar o CNAME normalmente, já que a restrição do apex é apenas um aviso, não um bloqueio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um registro A estático apontando para o IP público atual do recurso de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um registro NS apontando para o recurso, já que NS não tem essa restrição de apex.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual vantagem um registro Alias tem sobre um CNAME ao apontar para um Application Load Balancer, além de funcionar no apex da zona?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Alias funciona apenas com endereços IPv6, diferente do CNAME tradicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Alias permite apontar para um endereço IP fixo definido manualmente pelo cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta ao Alias não é cobrada quando o destino é um recurso da AWS.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Alias substitui a necessidade de qualquer health check no Route 53.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação depende de uma tabela do Amazon DynamoDB, e o time quer que o Route 53 pare de rotear tráfego para uma região se essa tabela apresentar throttling excessivo, mesmo sem um endpoint HTTP para checar. Qual tipo de health check atende a esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Health check de endpoint HTTP, apontando diretamente para a tabela do DynamoDB.",
                                "isCorrect": false
                            },
                            {
                                "text": "Health check baseado em alarme do CloudWatch, associado à métrica de throttling.",
                                "isCorrect": true
                            },
                            {
                                "text": "Health check calculado, combinando apenas health checks de outras regiões da AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Health check de endpoint TCP, testando a porta de conexão do DynamoDB.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe vai trocar o IP de um registro A dois dias antes de um evento importante e quer que a mudança propague o mais rápido possível assim que for aplicada. O que deve ser feito com antecedência, em relação ao TTL desse registro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o TTL antes da mudança, para que os resolvedores atualizem o cache com mais frequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter o TTL padrão, já que ele não influencia a velocidade de propagação de um registro A.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o TTL do registro, já que registros A não utilizam esse atributo no Route 53.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o TTL antes da mudança, para que o cache antigo expire rapidamente nos resolvedores.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Route 53: políticas de roteamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Route 53: políticas de roteamento\n\nUm registro DNS pode responder sempre com o mesmo valor, ou pode decidir a resposta de acordo com saúde, localização, latência ou um peso definido pelo arquiteto. Essa decisão é a **política de roteamento** do registro. Dominar quando usar cada uma é um dos temas mais cobrados da prova SAA-C03, porque aparece disfarçado de cenário de negócio: canary release, disaster recovery, conformidade regional, aplicação global."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Política\",\"O que decide a resposta\",\"Cenário típico\"],[\"Simple\",\"Um único recurso, sem health check\",\"Aplicação com um único endpoint\"],[\"Weighted\",\"Peso relativo definido pelo arquiteto\",\"Canary release, teste A/B, migração gradual\"],[\"Latency-based\",\"Menor latência entre o usuário e a região\",\"Aplicação multi-região otimizando performance\"],[\"Failover\",\"Health check do recurso primário\",\"Disaster recovery ativo-passivo\"],[\"Geolocation\",\"Localização geográfica do usuário\",\"Conformidade regional, conteúdo localizado\"],[\"Geoproximity\",\"Localização do recurso, com bias ajustável\",\"Deslocar tráfego gradualmente entre regiões\"],[\"Multivalue answer\",\"Vários registros saudáveis sorteados\",\"Balanceamento simples no nível de DNS\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Weighted e Simple\n\n**Simple** é a política padrão: um nome resolve para um recurso, ou para um conjunto de valores retornados juntos, sem saúde individual associada a cada um. Não há suporte a health check por registro nessa política.\n\n**Weighted** distribui as respostas entre vários registros do mesmo nome, de acordo com um peso numérico atribuído a cada um. É a política por trás de:\n\n- **Canary release**: enviar uma fração pequena do tráfego, por exemplo 5%, para uma versão nova antes de liberar para todos.\n- **Blue-green por DNS**: migrar tráfego gradualmente de um ambiente para outro, ajustando os pesos ao longo do tempo até chegar a 100%.\n\nCada registro Weighted pode ter seu próprio health check, e o Route 53 redistribui o peso dos registros saudáveis se algum ficar indisponível."
                    },
                    {
                        "type": "text",
                        "value": "## Latency-based e Failover\n\n**Latency-based routing** responde com o recurso na região que historicamente oferece a menor latência para o resolvedor que fez a consulta. É a escolha certa para uma aplicação com implantações em várias regiões cujo objetivo principal é performance para o usuário final, não disponibilidade.\n\n**Failover routing** implementa um desenho ativo-passivo: existe um registro primário e um secundário, e o Route 53 só responde com o secundário quando o health check do primário indica falha. É a política associada a estratégias de disaster recovery, como pilot light ou warm standby."
                    },
                    {
                        "type": "text",
                        "value": "## Geolocation, Geoproximity e Multivalue Answer\n\n**Geolocation** decide a resposta pela localização geográfica de quem pergunta (país, continente ou estado dos EUA), útil para restringir conteúdo por licenciamento, atender exigência de residência de dados ou servir um idioma padrão por região. É possível definir um registro \"default\" para cobrir localizações não mapeadas.\n\n**Geoproximity** também considera localização, mas a do **recurso**, e permite aplicar um **bias** para deslocar mais ou menos tráfego para uma região específica, útil ao migrar carga gradualmente entre regiões. Exige o Route 53 Traffic Flow para ser configurada.\n\n**Multivalue answer** retorna até oito registros saudáveis por consulta, escolhidos entre os associados a health checks. Não substitui um load balancer, mas adiciona redundância simples no nível de DNS quando não existe um."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Comment\": \"Canary: 90% versao atual, 10% versao nova\",\n  \"Changes\": [\n    {\n      \"Action\": \"UPSERT\",\n      \"ResourceRecordSet\": {\n        \"Name\": \"app.exemplo.com\",\n        \"Type\": \"A\",\n        \"SetIdentifier\": \"versao-atual\",\n        \"Weight\": 90,\n        \"TTL\": 60,\n        \"ResourceRecords\": [{ \"Value\": \"203.0.113.10\" }]\n      }\n    },\n    {\n      \"Action\": \"UPSERT\",\n      \"ResourceRecordSet\": {\n        \"Name\": \"app.exemplo.com\",\n        \"Type\": \"A\",\n        \"SetIdentifier\": \"versao-nova\",\n        \"Weight\": 10,\n        \"TTL\": 60,\n        \"ResourceRecords\": [{ \"Value\": \"203.0.113.20\" }]\n      }\n    }\n  ]\n}"
                    },
                    {
                        "type": "quote",
                        "value": "A política de roteamento certa nasce da pergunta que o requisito faz: é sobre desempenho, sobre sobrevivência, sobre onde o usuário está, ou sobre controlar a proporção do tráfego?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual política de roteamento do Route 53 direciona tráfego para a região da AWS que historicamente oferece a menor latência para quem fez a consulta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Geolocation routing, que escolhe a região pela localização geográfica do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Weighted routing, que escolhe a região por um peso definido pelo arquiteto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Latency-based routing, que escolhe a região com a menor latência medida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Failover routing, que escolhe a região pela saúde do recurso primário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer liberar uma versão nova de uma API enviando inicialmente apenas 5% do tráfego para ela, aumentando aos poucos se tudo estiver saudável. Qual política de roteamento do Route 53 viabiliza esse desenho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Geoproximity routing, atribuindo um bias pequeno à região da versão nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "Multivalue answer, retornando a versão nova em uma fração das respostas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Weighted routing, atribuindo um peso pequeno ao registro da versão nova.",
                                "isCorrect": true
                            },
                            {
                                "text": "Failover routing, atribuindo a versão nova como registro secundário passivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação crítica mantém um ambiente principal em uma região e um ambiente de recuperação em outra, que só deve receber tráfego se o ambiente principal parar de responder aos health checks. Qual política de roteamento do Route 53 implementa esse comportamento diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Failover routing, com um registro primário e um secundário associado a health check.",
                                "isCorrect": true
                            },
                            {
                                "text": "Simple routing, com um único registro apontando para as duas regiões ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Weighted routing, com peso igual definido para as duas regiões o tempo todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Latency-based routing, com registros nas duas regiões e sem health check associado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre as políticas Geolocation e Geoproximity no Route 53?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Geolocation exige o Route 53 Traffic Flow; Geoproximity não exige configuração extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Geolocation só funciona com IPv4; Geoproximity só funciona com IPv6 no registro AAAA.",
                                "isCorrect": false
                            },
                            {
                                "text": "Geolocation usa a localização do recurso; Geoproximity usa a do usuário, com peso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Geolocation usa a localização do usuário; Geoproximity usa a do recurso, com bias.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem orçamento para um load balancer, quer que o Route 53 retorne mais de um IP saudável por consulta, deixando de fora automaticamente qualquer registro cujo health check falhe. Qual política atende a esse requisito, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Multivalue answer, porque retorna vários registros e considera o health check de cada um.",
                                "isCorrect": true
                            },
                            {
                                "text": "Weighted routing, porque retorna vários registros, mas ignora o health check de cada um.",
                                "isCorrect": false
                            },
                            {
                                "text": "Simple routing, porque também retorna vários registros e considera o health check de cada um.",
                                "isCorrect": false
                            },
                            {
                                "text": "Latency-based routing, porque retorna vários registros ordenados pela saúde de cada um.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CloudFront e AWS Global Accelerator",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon CloudFront e AWS Global Accelerator\n\nRoute 53 decide para qual recurso apontar. Depois que a requisição sai do resolvedor de DNS, dois serviços da AWS entram em cena para acelerar o caminho até o usuário: o **Amazon CloudFront**, uma CDN que cacheia conteúdo perto de quem pede, e o **AWS Global Accelerator**, que usa a rede global da AWS para rotear tráfego TCP/UDP até o endpoint mais saudável. São ferramentas complementares, não concorrentes, e a prova gosta de testar quando cada uma se aplica."
                    },
                    {
                        "type": "text",
                        "value": "## Amazon CloudFront\n\nCloudFront é uma **CDN**, rede de entrega de conteúdo: distribui cópias do conteúdo em **edge locations** espalhadas pelo mundo, para que a requisição do usuário seja respondida pelo ponto mais próximo, não pela origem.\n\n- **Cacheia conteúdo estático** (imagens, vídeo, JS, CSS) com base em regras de cache behavior e TTL por padrão de caminho.\n- **Também acelera conteúdo dinâmico**, mesmo sem cache completo, porque a requisição viaja pelo backbone da AWS entre o edge e a origem, em vez da internet pública inteira.\n- **Origens comuns**: um bucket do Amazon S3, protegido por Origin Access Control para que só o CloudFront consiga ler os objetos, ou um Application Load Balancer / servidor HTTP customizado.\n- Suporta URLs e cookies assinados para restringir conteúdo privado, restrição geográfica e integração nativa com o AWS WAF."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"PermitirApenasCloudFront\",\n      \"Effect\": \"Allow\",\n      \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },\n      \"Action\": \"s3:GetObject\",\n      \"Resource\": \"arn:aws:s3:::meu-bucket-privado/*\",\n      \"Condition\": {\n        \"StringEquals\": {\n          \"AWS:SourceArn\": \"arn:aws:cloudfront::123456789012:distribution/EDFDVBD6EXAMPLE\"\n        }\n      }\n    }\n  ]\n}"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Global Accelerator\n\nGlobal Accelerator não cacheia nada: ele melhora o **caminho de rede** até endpoints como Application Load Balancer, Network Load Balancer, instâncias EC2 ou Elastic IPs.\n\n- Publica **dois endereços IP anycast estáticos**, que funcionam como porta de entrada fixa da aplicação, úteis quando um firewall de cliente precisa de IPs fixos na allowlist.\n- O tráfego entra na rede global da AWS já no ponto de presença mais próximo do usuário, em vez de percorrer a internet pública até a região de destino.\n- Funciona em **TCP e UDP**, não só HTTP/HTTPS, o que o torna adequado para jogos, VoIP e outros protocolos fora do universo web.\n- Faz failover entre endpoints saudáveis em segundos, sem depender de propagação de TTL de DNS, porque o roteamento acontece na camada de rede, não em uma resposta de DNS que precisa expirar do cache."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Amazon CloudFront\",\"AWS Global Accelerator\"],[\"Função principal\",\"Cache e entrega de conteúdo\",\"Roteamento otimizado de rede\"],[\"Protocolos\",\"HTTP e HTTPS\",\"TCP e UDP, qualquer aplicação\"],[\"Cacheia conteúdo\",\"Sim\",\"Não\"],[\"Endereço de entrada\",\"Nomes de domínio de edge, muitos IPs\",\"Dois IPs anycast estáticos\"],[\"Failover\",\"Depende de cache e origem\",\"Em segundos, na camada de rede\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada um\n\nUse **CloudFront** quando o objetivo é entregar conteúdo web, estático ou dinâmico, e o cache reduz custo de origem e latência. Use **Global Accelerator** quando o protocolo não é HTTP, quando a aplicação precisa de IPs estáticos para allowlist, ou quando o requisito é failover rápido entre regiões para uma carga que não se beneficia de cache. Nada impede combinar os dois em desenhos maiores, mas a prova costuma isolar o critério: conteúdo cacheável pede CloudFront, desempenho de rede para TCP/UDP não cacheável pede Global Accelerator."
                    },
                    {
                        "type": "quote",
                        "value": "CloudFront aproxima o conteúdo do usuário; Global Accelerator aproxima o usuário da aplicação. A pergunta que decide entre os dois é se existe algo para cachear."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual serviço da AWS funciona como uma CDN, armazenando cópias de conteúdo em edge locations próximas dos usuários?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon Route 53, que cacheia conteúdo em edge locations globais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudFront, que cacheia conteúdo em edge locations globais.",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Global Accelerator, que cacheia conteúdo em edge locations globais.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Direct Connect, que cacheia conteúdo em edge locations globais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bucket do Amazon S3 serve como origem de uma distribuição CloudFront, e o requisito é que ninguém consiga acessar os objetos diretamente pela URL do S3, apenas através do CloudFront. Qual recurso implementa esse controle?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Origin Access Control, restringindo o bucket para aceitar apenas a distribuição CloudFront.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um Network ACL, restringindo o bucket para aceitar apenas a distribuição CloudFront.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Customer Gateway, restringindo o bucket para aceitar apenas a distribuição CloudFront.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma Security Group, restringindo o bucket para aceitar apenas a distribuição CloudFront.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação de jogos multiplayer se comunica por UDP e precisa de um endereço IP fixo para os jogadores configurarem no firewall doméstico, além de trocar de região automaticamente em caso de falha. Qual serviço atende a esses requisitos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Site-to-Site VPN, que oferece IPs anycast estáticos e opera sobre TCP e UDP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudFront, que oferece IPs anycast estáticos e opera sobre TCP e UDP.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Global Accelerator, que oferece IPs anycast estáticos e opera sobre TCP e UDP.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Route 53, que oferece IPs anycast estáticos e opera sobre TCP e UDP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação compara corretamente Amazon CloudFront e AWS Global Accelerator?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum dos dois serviços cacheia conteúdo, ambos apenas otimizam o roteamento de rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "CloudFront cacheia conteúdo em edge locations; Global Accelerator só otimiza o roteamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois serviços cacheiam conteúdo do mesmo modo, diferindo apenas no protocolo suportado.",
                                "isCorrect": false
                            },
                            {
                                "text": "CloudFront só otimiza o roteamento de rede; Global Accelerator cacheia conteúdo em edge locations.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação TCP não HTTP, hospedada em duas regiões em desenho ativo-passivo, precisa trocar de região em poucos segundos após uma falha, sem depender da expiração de cache de DNS nos clientes. Qual solução atende melhor a esse requisito de failover?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Route 53 latency-based routing, porque escolhe sempre a região mais próxima do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Global Accelerator, porque redireciona na camada de rede sem depender de TTL de DNS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Route 53 failover routing com TTL alto, porque garante a menor latência possível na troca.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudFront apontando para as duas regiões, porque cacheia e troca a origem sozinho.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Computação e Auto Scaling",
        "aulas": [
            {
                "titulo": "EC2: famílias de instância e escolha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# EC2: famílias de instância e escolha\n\nNo exame SAA-C03 a pergunta raramente é 'o que é uma instância EC2'. O que é cobrado é: dado um cenário com um gargalo específico (CPU, memória, IO local ou rede), qual família de instância é a mais adequada, considerando desempenho e custo.\n\nAs famílias de instância são agrupadas por letra (M, C, R, I, P, entre outras) e cada letra indica a otimização principal do hardware subjacente. Trocar a família errada por uma instância genérica maior custa mais e não resolve o gargalo real da carga de trabalho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Família\", \"Otimizada para\", \"Exemplos de uso\"], [\"General Purpose (M, T, A)\", \"Equilíbrio entre CPU, memória e rede\", \"Servidores web, microsserviços, ambientes de desenvolvimento\"], [\"Compute Optimized (C)\", \"Alto desempenho de processador por vCPU\", \"Processamento em lote, servidores de jogos, transcodificação de vídeo\"], [\"Memory Optimized (R, X, z1d)\", \"Grande proporção de RAM por vCPU\", \"Bancos de alta performance, cache in-memory, cargas SAP HANA\"], [\"Storage Optimized (I, D, H1)\", \"Alto IOPS e throughput em disco local\", \"Data warehousing, bancos NoSQL distribuídos\"], [\"Accelerated Computing (P, G, Inf, Trn)\", \"Hardware dedicado (GPU, aceleradores)\", \"Treinamento de machine learning, renderização gráfica\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## General Purpose e Compute Optimized\n\nAs instâncias **General Purpose** (famílias M e T) oferecem uma proporção equilibrada de vCPU, memória e rede, adequada para cargas sem um gargalo dominante claro. A família T usa desempenho em rajada (burstable), acumulando créditos de CPU, o que a torna ideal para picos esporádicos, não para uso constante de CPU alta.\n\nAs instâncias **Compute Optimized** (família C) entregam a melhor relação de desempenho de processador por vCPU. São a escolha certa quando o gargalo é claramente CPU: HPC (high performance computing), servidores de jogos multiplayer, transcodificação de vídeo em lote."
                    },
                    {
                        "type": "text",
                        "value": "## Memory Optimized, Storage Optimized e Accelerated Computing\n\nAs instâncias **Memory Optimized** (famílias R, X, z1d) priorizam uma grande quantidade de RAM por vCPU. São indicadas para bancos de dados que mantêm grandes datasets em memória, cache distribuído e cargas corporativas como SAP HANA.\n\nAs instâncias **Storage Optimized** (famílias I, D, H1) usam armazenamento local em NVMe SSD com altíssimo IOPS e baixa latência, voltadas para I/O sequencial intenso, como data warehousing e bancos NoSQL distribuídos.\n\nAs instâncias **Accelerated Computing** (famílias P, G, Inf, Trn) incluem hardware especializado, como GPUs ou chips próprios da AWS, para treinamento e inferência de machine learning e renderização gráfica pesada."
                    },
                    {
                        "type": "text",
                        "value": "## Tenancy: shared, dedicated instance e dedicated host\n\nA opção de tenancy define como a instância EC2 é posicionada no hardware físico subjacente:\n\n- **Shared (default)**: instâncias de clientes diferentes podem compartilhar o mesmo hardware físico. É o modelo padrão e mais barato.\n- **Dedicated Instances**: a instância roda em hardware dedicado a uma única conta AWS, mas ainda pode compartilhar o servidor físico com outras instâncias dessa mesma conta, sem visibilidade sobre sockets e núcleos.\n- **Dedicated Hosts**: aloca um servidor físico inteiro, com visibilidade sobre sockets e núcleos. É a opção indicada quando o licenciamento de software é vinculado a core ou socket físico (BYOL de Windows Server, SQL Server ou Oracle, por exemplo)."
                    },
                    {
                        "type": "quote",
                        "value": "A escolha da família de instância nasce do gargalo real da carga de trabalho, CPU, memória, IO ou rede, e não do tipo de instância mais familiar ou do menor preço listado."
                    },
                    {
                        "type": "code",
                        "value": "# Consultando specs de uma familia de instancia via CLI\naws ec2 describe-instance-types \\\n  --filters \"Name=instance-type,Values=r6i.*\" \\\n  --query \"InstanceTypes[].{Tipo:InstanceType,vCPU:VCpuInfo.DefaultVCpus,MemoriaMiB:MemoryInfo.SizeInMiB}\"\n\n# Resultado esperado (resumido)\n# r6i.large    2 vCPU   16384 MiB\n# r6i.xlarge   4 vCPU   32768 MiB\n# r6i.2xlarge  8 vCPU   65536 MiB"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa migra um banco de dados SAP HANA que precisa manter grandes volumes de dados diretamente em memória para reduzir a latência das consultas analíticas. Qual família de instância EC2 melhor atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escolher a família Compute Optimized, que prioriza a maior capacidade de processamento por vCPU disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher a família Storage Optimized, que prioriza o maior IOPS local em disco NVMe entre as famílias padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher a família Memory Optimized, que oferece a maior proporção de RAM por vCPU entre as famílias padrão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher a família General Purpose, que equilibra CPU, memória e rede para a maioria das cargas comuns.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma de streaming transcodifica em lote milhares de vídeos por hora, com o gargalo concentrado na capacidade de processamento da CPU. Qual família de instância entrega a melhor relação de desempenho de processador por vCPU?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A família Memory Optimized, porque prioriza uma grande quantidade de RAM disponível por vCPU.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família Compute Optimized, porque prioriza a maior capacidade de processamento por vCPU.",
                                "isCorrect": true
                            },
                            {
                                "text": "A família General Purpose, porque equilibra CPU e memória para cargas sem gargalo definido.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família Accelerated Computing, porque adiciona GPUs dedicadas ao processamento paralelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco de dados NoSQL distribuído grava dados localmente na instância e exige altíssimo IOPS com baixa latência de leitura e escrita. Qual família de instância atende melhor a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A família Memory Optimized, pela grande quantidade de RAM disponível por vCPU na instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família Storage Optimized, pelo alto IOPS em armazenamento NVMe local da instância.",
                                "isCorrect": true
                            },
                            {
                                "text": "A família General Purpose, pelo equilíbrio entre CPU, memória e rede da instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família Compute Optimized, pela alta capacidade de processamento por vCPU da instância.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa trazer licenças próprias de um software corporativo cujo modelo de licenciamento é vinculado ao número de sockets e núcleos físicos do servidor. Qual opção de tenancy do EC2 atende a essa exigência de conformidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dedicated Instances, que rodam em hardware exclusivo da conta, mas sem visibilidade de sockets físicos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Shared tenancy, o modelo padrão em que o hardware físico pode ser compartilhado entre contas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Placement group do tipo cluster, que agrupa instâncias fisicamente próximas na mesma AZ.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dedicated Hosts, que alocam um servidor físico inteiro com visibilidade sobre sockets e núcleos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de dados precisa treinar modelos de machine learning que exigem processamento paralelo massivo em GPU. Qual família de instância EC2 é a mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A família Compute Optimized, pela maior capacidade de processamento de CPU por vCPU.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família Memory Optimized, pela maior proporção de RAM disponível por vCPU.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família Accelerated Computing, por incluir GPUs dedicadas ao processamento paralelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A família Storage Optimized, pelo maior throughput de armazenamento local em NVMe.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Modelos de compra do EC2",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Modelos de compra do EC2\n\nOtimização de custo é um dos pilares mais cobrados do exame. A AWS oferece diferentes modelos de compra para a mesma capacidade de computação, cada um com um trade-off diferente entre desconto, flexibilidade e risco de interrupção. A habilidade central é casar o padrão de uso da carga de trabalho (constante, previsível, tolerante a falha, imprevisível) com o modelo de compra certo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelo\", \"Desconto típico\", \"Compromisso\", \"Melhor para\"], [\"On-Demand\", \"Nenhum (preço de referência)\", \"Nenhum\", \"Cargas novas, imprevisíveis ou de curta duração\"], [\"Reserved Instances\", \"Até ~72%\", \"1 ou 3 anos\", \"Cargas estáveis e previsíveis de longo prazo\"], [\"Savings Plans\", \"Até ~72%\", \"1 ou 3 anos, em US$/hora\", \"Uso constante que varia de família, região ou serviço\"], [\"Spot Instances\", \"Até ~90%\", \"Nenhum (pode ser interrompida)\", \"Cargas tolerantes a falha e flexíveis no tempo\"], [\"Dedicated Hosts\", \"Desconto com reserva opcional\", \"Opcional (On-Demand ou reservado)\", \"Conformidade e licenciamento por socket ou core\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## On-Demand e Reserved Instances\n\n**On-Demand** cobra por segundo (Linux) sem nenhum compromisso, servindo de referência de preço para os demais modelos. É ideal para testar uma carga nova ou para picos que não valem um compromisso de longo prazo.\n\n**Reserved Instances (RI)** trocam compromisso de tempo (1 ou 3 anos) por desconto sobre o On-Demand, em duas variantes:\n- **Standard**: maior desconto, mas não permite trocar família, sistema operacional ou tenancy durante o contrato.\n- **Convertible**: desconto um pouco menor, mas permite alterar os atributos da reserva (família, tamanho, SO) ao longo do contrato, desde que o valor da nova reserva seja igual ou maior."
                    },
                    {
                        "type": "text",
                        "value": "## Savings Plans\n\n**Savings Plans** também exigem compromisso de 1 ou 3 anos, mas em valor de gasto por hora (US$/hora), não em uma instância específica. Existem duas variantes:\n- **Compute Savings Plans**: maior flexibilidade; o compromisso se aplica a qualquer família de instância, região, sistema operacional, e cobre até Fargate e Lambda.\n- **EC2 Instance Savings Plans**: desconto maior que o Compute, porém restrito a uma família de instância dentro de uma região específica (o tamanho e o SO podem variar livremente)."
                    },
                    {
                        "type": "text",
                        "value": "## Spot Instances\n\n**Spot Instances** usam capacidade ociosa da AWS com desconto de até 90% sobre o On-Demand, mas podem ser interrompidas pela AWS com aviso de 2 minutos quando a capacidade é necessária novamente. São adequadas para cargas tolerantes a interrupção: processamento em lote, renderização, análise de big data, ambientes de teste.\n\nUm **Spot Fleet**, ou um Auto Scaling Group configurado com instâncias Spot, permite solicitar um conjunto de instâncias Spot de tipos diferentes, aumentando a chance de manter a capacidade desejada mesmo quando um tipo específico é interrompido."
                    },
                    {
                        "type": "quote",
                        "value": "O modelo de compra certo depende do padrão de uso da carga, não do desconto isolado: compromisso de longo prazo exige previsibilidade, e o menor preço só compensa se a carga tolerar interrupção."
                    },
                    {
                        "type": "code",
                        "value": "# Solicitando instancias Spot via CLI\naws ec2 request-spot-instances \\\n  --instance-count 4 \\\n  --type \"one-time\" \\\n  --launch-specification file://spot-spec.json\n\n# spot-spec.json (resumo)\n{\n  \"ImageId\": \"ami-0abcdef1234567890\",\n  \"InstanceType\": \"c6i.xlarge\",\n  \"SubnetId\": \"subnet-0123456789abcdef0\"\n}\n# A instancia pode ser interrompida com aviso de 2 minutos"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação legada roda continuamente no mesmo tipo de instância EC2 há anos, e a previsão é de que continue exatamente assim pelos próximos 3 anos, sem qualquer mudança de família ou tamanho. Qual modelo de compra reduz o custo com o maior desconto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reserved Instance Standard, que troca o compromisso fixo de 3 anos pelo maior desconto disponível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compute Savings Plan, que troca compromisso de gasto por flexibilidade entre famílias de instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "EC2 Instance Savings Plan, que mantém desconto ao trocar o tamanho dentro da mesma família.",
                                "isCorrect": false
                            },
                            {
                                "text": "Spot Instance, que reduz o custo aceitando o risco de interrupção pela AWS a qualquer momento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém um gasto computacional constante, mas migra cargas com frequência entre famílias de instância, regiões, e também usa AWS Fargate para parte dos serviços. Qual modelo de compra garante desconto sem perder essa flexibilidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Compute Savings Plan, que aplica o desconto a qualquer família, região e também ao uso de Fargate.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reserved Instance Convertible, que permite trocar atributos da reserva ao longo do contrato.",
                                "isCorrect": false
                            },
                            {
                                "text": "EC2 Instance Savings Plan, que aplica o desconto apenas dentro de uma família na região escolhida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reserved Instance Standard, que oferece o maior desconto em troca do menor grau de flexibilidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de processamento em lote pode ser interrompido e reiniciado a qualquer momento sem perda de dados, sem prazo rígido de conclusão. O objetivo principal é reduzir ao máximo o custo de computação. Qual abordagem é a mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "On-Demand Instances, que evitam qualquer compromisso de longo prazo, mas cobram o preço cheio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Spot Fleet com múltiplos tipos de instância, que aproveita capacidade ociosa com maior desconto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reserved Instance Convertible, que reduz o custo em troca de um compromisso de 1 ou 3 anos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dedicated Instances, que isolam o hardware físico da conta, mas sem desconto adicional relevante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa reserva capacidade por 3 anos para obter desconto, mas espera trocar a família de instância no meio do contrato conforme a aplicação migra para um hardware mais novo. Qual variante de Reserved Instance permite essa troca durante o contrato?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reserved Instance Standard, que garante o maior desconto, mas fixa a família por todo o contrato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reserved Instance de escopo Regional, que libera a reserva de qualquer AZ específica da região.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reserved Instance Convertible, que permite trocar a família reservada ao longo do contrato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reserved Instance de escopo Zonal, que garante capacidade reservada em uma AZ específica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa já usa Dedicated Hosts para atender a um requisito de licenciamento por socket físico, e quer reduzir o custo dessa capacidade, que permanecerá alocada continuamente pelos próximos anos. Qual ação reduz o custo sem abrir mão do isolamento físico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar para Dedicated Instances, que aplicam desconto automático mantendo isolamento por conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar para Spot Instances, que oferecem o maior desconto entre todos os modelos de compra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adotar um Compute Savings Plan, que cobre qualquer tenancy, incluindo hosts dedicados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reservar o Dedicated Host por 1 ou 3 anos, reduzindo o custo do uso contínuo do mesmo servidor.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "AMIs, user data e ciclo de vida",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# AMIs, user data e ciclo de vida\n\nUma **AMI** (Amazon Machine Image) é o modelo a partir do qual uma instância EC2 é criada: sistema operacional, configurações e, opcionalmente, aplicações e dados já instalados. Uma AMI personalizada, chamada de **golden image**, padroniza o provisionamento e acelera o boot de novas instâncias, que nascem com o software necessário já instalado.\n\nAMIs são específicas de uma região, ainda que possam ser copiadas entre regiões, e podem ser públicas, privadas ou compartilhadas com contas específicas. AMIs baseadas em EBS podem ser criptografadas e lançam instâncias mais rápido do que instalar tudo via user data a cada boot."
                    },
                    {
                        "type": "text",
                        "value": "## User data: bootstrap na primeira inicialização\n\nO **user data** é um script (shell, cloud-init) fornecido no lançamento da instância e executado automaticamente na primeira inicialização, com privilégios de root. É o mecanismo padrão de bootstrap: instalar pacotes, baixar código da aplicação, registrar a instância em um serviço externo ou configurar agentes de monitoramento.\n\nDiferente da AMI, que já traz o software pronto, o user data configura a instância em tempo de execução, o que dá flexibilidade mas adiciona tempo ao boot. Uma estratégia comum combina os dois: uma AMI com as dependências pesadas instaladas, e um user data curto só para configurações específicas do ambiente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado\", \"Descrição\", \"Cobrança de computação\"], [\"pending\", \"Instância sendo provisionada\", \"Não\"], [\"running\", \"Instância em execução normal\", \"Sim\"], [\"stopping\", \"Transição para parada (apenas EBS-backed)\", \"Não\"], [\"stopped\", \"Parada, mantém os volumes EBS\", \"Não (o EBS continua sendo cobrado)\"], [\"shutting-down / terminated\", \"Sendo ou já encerrada permanentemente\", \"Não\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Instance store vs volume EBS de raiz\n\nInstâncias com **instance store** (armazenamento efêmero ligado fisicamente ao host) perdem os dados do volume raiz ao parar ou em caso de falha de hardware, e sequer suportam a ação de parar: só podem ser reiniciadas ou terminadas. Já instâncias com volume **EBS** como raiz mantêm os dados entre paradas e reinícios, podem ter o volume redimensionado, e são a opção usada por padrão pela maioria das AMIs.\n\nA escolha afeta o ciclo de vida inteiro: uma instância com root em instance store, quando precisa parar, na prática só pode ser terminada, enquanto uma com root em EBS pode ser parada e retomada preservando o disco."
                    },
                    {
                        "type": "text",
                        "value": "## Launch templates\n\nUm **launch template** define, de forma versionada, os parâmetros para lançar uma instância: AMI, tipo de instância, user data, security groups, par de chaves, IAM instance profile, entre outros. É a forma recomendada de padronizar lançamentos manuais, e é exigido por recursos mais novos, como Auto Scaling Groups com múltiplos tipos de instância ou frotas Spot. Templates suportam múltiplas versões, permitindo manter uma versão padrão enquanto uma nova versão é testada antes de ser promovida."
                    },
                    {
                        "type": "quote",
                        "value": "Uma AMI define o que a instância já traz pronta, o user data define o que ela faz ao nascer, e o launch template amarra os dois de forma reprodutível e versionada."
                    },
                    {
                        "type": "code",
                        "value": "#!/bin/bash\n# User data para bootstrap de um servidor web\nyum update -y\nyum install -y httpd\nsystemctl enable httpd\nsystemctl start httpd\nTOKEN=$(curl -sX PUT \"http://169.254.169.254/latest/api/token\" -H \"X-aws-ec2-metadata-token-ttl-seconds: 60\")\nID=$(curl -s -H \"X-aws-ec2-metadata-token: $TOKEN\" http://169.254.169.254/latest/meta-data/instance-id)\necho \"<h1>Instancia $ID</h1>\" > /var/www/html/index.html"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe quer que novas instâncias EC2 já iniciem com o runtime da aplicação e as dependências instaladas, reduzindo o tempo de boot em comparação a instalar tudo a cada inicialização. Qual abordagem atende a esse objetivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escrever um script de user data mais longo, executado a cada primeira inicialização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma AMI personalizada (golden image) já com as dependências da aplicação instaladas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar um launch template com tags adicionais para identificar a versão da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anexar um volume EBS adicional já formatado, montado manualmente após o lançamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As instâncias lançadas por um Auto Scaling Group a partir de uma AMI genérica do Amazon Linux precisam instalar o agente de monitoramento e baixar a versão mais recente da aplicação assim que iniciam. Qual mecanismo executa essas ações na primeira inicialização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um lifecycle hook do Auto Scaling Group, que pausa a instância antes de entrar em serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "O health check do target group, que verifica se a aplicação responde na porta configurada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um script de user data definido no launch template, executado no primeiro boot da instância.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um snapshot do volume EBS anexado no lançamento, contendo dados da execução anterior.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instância EC2 usa um volume de instance store como raiz. A equipe de operações tenta usar a ação 'Parar' (Stop) nessa instância pelo console. Qual é o resultado esperado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A ação não fica disponível, pois instance store só permite terminar a instância.",
                                "isCorrect": true
                            },
                            {
                                "text": "A instância para normalmente e os dados do volume raiz permanecem preservados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A instância entra em hibernação e retoma exatamente do mesmo ponto depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "A instância para, e os dados são migrados automaticamente para um EBS temporário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer configurar um Auto Scaling Group que combine diferentes tipos de instância, misturando On-Demand e Spot, mantendo um histórico versionado da configuração de lançamento. Qual recurso viabiliza essa configuração?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Launch configuration, o formato mais simples, ainda compatível com múltiplos tipos de instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma AMI compartilhada entre contas, que padroniza o sistema operacional usado pelo grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Launch template, que versiona a configuração e suporta múltiplos tipos de instância no mesmo grupo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um placement group do tipo spread, que distribui as instâncias entre hosts físicos distintos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instância EC2 com volume raiz em EBS foi colocada no estado 'stopped' por vários dias para economizar custo. Qual afirmação descreve corretamente a cobrança durante esse período?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum recurso associado à instância é cobrado enquanto ela estiver parada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cobrança de computação continua normalmente, apenas o IP público é liberado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cobrança passa a usar automaticamente a tarifa reduzida de Spot Instance.",
                                "isCorrect": false
                            },
                            {
                                "text": "A computação não é cobrada, mas o armazenamento do volume EBS continua sendo.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Elastic Load Balancing: ALB, NLB e GWLB",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Elastic Load Balancing: ALB, NLB e GWLB\n\nO Elastic Load Balancing distribui tráfego entre múltiplos destinos (instâncias EC2, containers, IPs, funções Lambda) em uma ou mais zonas de disponibilidade, sendo peça central de qualquer arquitetura de alta disponibilidade. A AWS oferece três tipos de balanceador com propósitos distintos: **Application Load Balancer (ALB)**, **Network Load Balancer (NLB)** e **Gateway Load Balancer (GWLB)**. A escolha certa depende da camada do tráfego, do tipo de roteamento necessário e do requisito de desempenho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Balanceador\", \"Camada OSI\", \"Roteamento\", \"Caso de uso típico\"], [\"Application Load Balancer (ALB)\", \"7 (HTTP/HTTPS)\", \"Por path, host, header ou método\", \"Aplicações web, microsserviços, containers\"], [\"Network Load Balancer (NLB)\", \"4 (TCP/UDP/TLS)\", \"Por IP e porta, latência mínima\", \"Tráfego de altíssima performance, IP estático\"], [\"Gateway Load Balancer (GWLB)\", \"3 (IP, protocolo GENEVE)\", \"Transparente para appliances de rede\", \"Firewalls, IDS/IPS, inspeção de tráfego\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Application Load Balancer (ALB)\n\nO ALB opera na camada 7 e entende o conteúdo da requisição HTTP/HTTPS, permitindo roteamento avançado por **path** (/api, /imagens), por **host** (múltiplos domínios), por header ou por método HTTP. É a escolha natural para arquiteturas de microsserviços, em que um único balanceador direciona rotas diferentes para target groups diferentes, incluindo containers no ECS, IPs privados e até funções Lambda como alvo."
                    },
                    {
                        "type": "text",
                        "value": "## Network Load Balancer (NLB)\n\nO NLB opera na camada 4, encaminhando conexões TCP/UDP/TLS sem inspecionar o conteúdo da aplicação, o que permite lidar com milhões de requisições por segundo com latência ultra baixa. Diferente do ALB, o NLB pode ter um **endereço IP estático (ou Elastic IP)** por zona de disponibilidade, exigido por sistemas legados que fazem allowlist de IP, e preserva por padrão o IP de origem do cliente."
                    },
                    {
                        "type": "text",
                        "value": "## Gateway Load Balancer (GWLB), target groups e sticky sessions\n\nO GWLB combina um ponto transparente de entrada e saída de tráfego com balanceamento de carga, usado para distribuir tráfego entre appliances de terceiros de inspeção de rede, como firewalls e sistemas de detecção de intrusão, usando o protocolo GENEVE na porta 6081.\n\nTodos os balanceadores direcionam tráfego para **target groups**, que agrupam os destinos e os respectivos health checks. O ALB e o NLB suportam **sticky sessions** (session affinity), fixando um cliente ao mesmo destino por cookie (ALB) ou por IP de origem (NLB), útil quando a aplicação mantém estado local na instância."
                    },
                    {
                        "type": "quote",
                        "value": "A camada do tráfego decide o balanceador: conteúdo HTTP pede ALB, performance bruta em TCP/UDP pede NLB, e inspeção transparente de rede pede GWLB."
                    },
                    {
                        "type": "code",
                        "value": "# Regra de roteamento por path em um ALB\naws elbv2 create-rule \\\n  --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/minha-app/abc123 \\\n  --priority 10 \\\n  --conditions Field=path-pattern,Values='/api/*' \\\n  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/api-tg/def456"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação web precisa rotear requisições HTTP para microsserviços diferentes conforme o path da URL, por exemplo /pedidos para um serviço e /pagamentos para outro. Qual balanceador de carga atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Network Load Balancer, que opera na camada 4 e roteia por endereço IP e porta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gateway Load Balancer, que insere appliances de inspeção de forma transparente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Application Load Balancer, que opera na camada 7 e roteia por path da URL.",
                                "isCorrect": true
                            },
                            {
                                "text": "Classic Load Balancer, que roteia de forma simples entre camada 4 e camada 7.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um parceiro externo exige que o tráfego venha de um endereço IP fixo para liberação em firewall, e a carga esperada é de milhões de conexões TCP por segundo com latência mínima. Qual balanceador atende a esses dois requisitos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Network Load Balancer, que oferece IP estático por AZ e altíssima performance em TCP.",
                                "isCorrect": true
                            },
                            {
                                "text": "Application Load Balancer, que oferece roteamento avançado por conteúdo HTTP e HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gateway Load Balancer, que encaminha pacotes de forma transparente para appliances.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Global Accelerator, que usa IPs anycast fixos roteados pela rede da AWS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa inserir appliances de terceiros para inspeção de tráfego de forma transparente entre a internet e sua VPC, sem alterar o roteamento fim a fim percebido pela aplicação. Qual serviço distribui o tráfego entre essas appliances?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Application Load Balancer, que inspeciona e roteia com base no conteúdo HTTP da requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Network Load Balancer, que preserva o IP de origem ao encaminhar conexões TCP e UDP.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Firewall Manager, que centraliza regras de firewall e WAF entre múltiplas contas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gateway Load Balancer, que combina balanceamento com encaminhamento transparente via GENEVE.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação legada mantém o estado da sessão do usuário localmente em cada instância, sem cache compartilhado, atrás de um Application Load Balancer. Qual configuração garante que as requisições do mesmo usuário cheguem sempre à mesma instância?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Habilitar sticky sessions por cookie gerenciado pelo próprio Application Load Balancer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o intervalo do health check do target group para detectar falhas mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar cross-zone load balancing para distribuir melhor as requisições entre AZs.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o balanceador por um Network Load Balancer com IP estático por zona.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um target group de um Application Load Balancer marca uma instância como 'unhealthy' após falhas consecutivas no health check configurado. Qual é o comportamento do balanceador em relação a essa instância?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O balanceador encerra automaticamente a instância marcada como unhealthy.",
                                "isCorrect": false
                            },
                            {
                                "text": "O balanceador reduz a prioridade da instância, mas ainda envia parte do tráfego.",
                                "isCorrect": false
                            },
                            {
                                "text": "O balanceador substitui a instância por uma nova lançada da mesma AMI.",
                                "isCorrect": false
                            },
                            {
                                "text": "O balanceador para de enviar novo tráfego para essa instância específica.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Auto Scaling Groups",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Auto Scaling Groups\n\nUm **Auto Scaling Group (ASG)** mantém automaticamente a quantidade de instâncias EC2 definida, substituindo instâncias com falha e ajustando a capacidade conforme a demanda. É o componente que une **escalabilidade** (adicionar ou remover capacidade conforme a carga) e **alta disponibilidade** (manter instâncias saudáveis distribuídas entre múltiplas AZs) em uma única configuração."
                    },
                    {
                        "type": "text",
                        "value": "## Componentes principais\n\nUm ASG é definido a partir de um **launch template** (AMI, tipo de instância, user data, security groups) e de três parâmetros de capacidade:\n- **Minimum**: menor quantidade de instâncias mantida mesmo sem carga.\n- **Desired**: quantidade que o ASG tenta manter no momento.\n- **Maximum**: teto de instâncias, mesmo sob uma política de escalabilidade agressiva.\n\nO grupo deve abranger múltiplas subnets em múltiplas AZs, permitindo que o Auto Scaling substitua uma instância com falha em outra AZ, sustentando a disponibilidade mesmo com a perda de uma zona inteira."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Política\", \"Como funciona\", \"Quando usar\"], [\"Target tracking\", \"Mantém uma métrica, como uso médio de CPU, em um valor alvo\", \"Cargas com relação previsível entre métrica e capacidade\"], [\"Step scaling\", \"Adiciona ou remove instâncias em degraus, conforme o alarme\", \"Cargas que exigem resposta granular a diferentes níveis de alarme\"], [\"Scheduled scaling\", \"Ajusta a capacidade em horários definidos\", \"Padrões de tráfego previsíveis, como horário comercial\"], [\"Predictive scaling\", \"Usa machine learning para antecipar picos com base no histórico\", \"Cargas cíclicas com padrão histórico consistente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Health checks: EC2 vs ELB\n\nPor padrão, o Auto Scaling usa o **health check do EC2**, que só considera a instância não saudável se o hardware ou o sistema operacional falhar. Isso não detecta uma aplicação travada que ainda responde no nível de rede.\n\nAo habilitar o **health check do ELB**, o Auto Scaling passa a considerar também o resultado do health check do target group: se a aplicação parar de responder corretamente nas verificações do balanceador, a instância é marcada como não saudável e substituída, mesmo que o sistema operacional continue funcionando normalmente."
                    },
                    {
                        "type": "text",
                        "value": "## Warm pools\n\nUm **warm pool** mantém um conjunto de instâncias pré-inicializadas, paradas ou em execução, fora da capacidade ativa do ASG, prontas para entrar em serviço rapidamente quando uma política de escalabilidade exige mais capacidade. Isso reduz o tempo necessário para colocar novas instâncias em serviço em comparação a iniciar cada uma do zero, especialmente útil quando o boot e a configuração da aplicação são demorados."
                    },
                    {
                        "type": "quote",
                        "value": "Um Auto Scaling Group bem configurado entrega escalabilidade e alta disponibilidade ao mesmo tempo: ajusta capacidade à demanda e substitui instâncias com falha em outra zona de disponibilidade."
                    },
                    {
                        "type": "code",
                        "value": "# Politica de target tracking mantendo CPU media em 50%\naws autoscaling put-scaling-policy \\\n  --auto-scaling-group-name minha-asg \\\n  --policy-name manter-cpu-50 \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-configuration '{\n    \"PredefinedMetricSpecification\": {\n      \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"\n    },\n    \"TargetValue\": 50.0\n  }'"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um Auto Scaling Group está configurado com mínimo de 2, desejado de 4 e máximo de 6 instâncias. Um alarme de CPU alta aciona a política de escalabilidade pedindo mais instâncias, mas a capacidade atual já está em 6. O que acontece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O grupo ignora temporariamente o máximo configurado até a CPU normalizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo não adiciona novas instâncias, pois o máximo já foi atingido.",
                                "isCorrect": true
                            },
                            {
                                "text": "O grupo substitui as instâncias atuais por um tipo de instância maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo distribui a carga excedente para instâncias fora do grupo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As instâncias de um Auto Scaling Group atrás de um Application Load Balancer ocasionalmente travam no nível da aplicação, mas continuam passando no status check padrão do EC2. Qual configuração faz o Auto Scaling detectar e substituir essas instâncias?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o intervalo do health check padrão do EC2 configurado no grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar o health check do ELB no Auto Scaling Group, além do padrão do EC2.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o valor de 'Unhealthy Threshold' configurado no target group.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um segundo launch template como alternativa ao já configurado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O tráfego de uma aplicação corporativa cresce de forma previsível todos os dias úteis às 8h e cai às 19h, seguindo o horário comercial. Qual política de escalabilidade ajusta a capacidade de forma mais direta para esse padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Scheduled scaling, ajustando a capacidade nos horários já conhecidos do padrão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Target tracking, mantendo o uso médio de CPU em um valor alvo constante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Step scaling, ajustando a capacidade em degraus conforme o alarme dispara.",
                                "isCorrect": false
                            },
                            {
                                "text": "Predictive scaling, usando machine learning sobre o histórico de tráfego.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação leva vários minutos para inicializar antes de ficar pronta para tráfego, e o Auto Scaling Group demora demais para responder a picos súbitos de demanda. Qual recurso reduz o tempo entre o disparo da escalabilidade e a instância ficar pronta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Configurar um warm pool com instâncias mantidas pré-inicializadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar permanentemente o valor mínimo configurado no Auto Scaling Group.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o cooldown period configurado na política de escalabilidade atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a política de target tracking pela política de step scaling.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Auto Scaling Group tem subnets em três zonas de disponibilidade. Uma AZ inteira fica indisponível, derrubando as instâncias que estavam nela. Qual é o comportamento esperado do grupo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O grupo reduz o desired count para refletir a capacidade perdida na AZ.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo aguarda a AZ afetada voltar antes de repor qualquer capacidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo mantém o tráfego apenas entre as instâncias restantes, sem repor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo lança instâncias de reposição nas zonas de disponibilidade saudáveis.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Serverless e containers",
        "aulas": [
            {
                "titulo": "AWS Lambda em arquiteturas serverless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# AWS Lambda em arquiteturas serverless\n\nLambda é a peça central das arquiteturas serverless na AWS: código executado sob demanda, cobrado por invocação e duração, sem servidor para provisionar ou corrigir. No nível de arquiteto, o que importa não é o que o Lambda faz, e sim quando ele é a escolha certa e quais parâmetros (concorrência, timeout, memória, rede) afetam o desenho da solução."
                    },
                    {
                        "type": "text",
                        "value": "## Modelo orientado a eventos\n\nAs origens de evento do Lambda se dividem em três modelos de invocação:\n\n- **Síncrona**: o chamador espera a resposta (Amazon API Gateway, Application Load Balancer, chamadas diretas via SDK).\n- **Assíncrona**: o evento é enfileirado internamente e o Lambda processa depois, com nova tentativa automática em caso de falha (Amazon S3, Amazon SNS, Amazon EventBridge).\n- **Baseada em poll**: o próprio serviço Lambda lê a origem em lotes e invoca a função (Amazon SQS, Amazon Kinesis Data Streams, DynamoDB Streams).\n\nPara invocações assíncronas, é possível configurar uma fila de mensagens mortas (DLQ) ou um destino de sucesso ou falha, capturando eventos que esgotaram as tentativas automáticas sem precisar de código extra na função."
                    },
                    {
                        "type": "text",
                        "value": "## Concorrência: reservada vs provisionada\n\nCada conta tem uma cota de concorrência simultânea por região (1000 execuções por padrão, ajustável por meio do suporte). Duas configurações controlam como essa cota é usada:\n\n- **Concorrência reservada**: separa uma fatia da cota exclusivamente para uma função, garantindo capacidade mesmo sob pressão de outras funções da conta. Também funciona como teto: a função nunca ultrapassa esse valor.\n- **Concorrência provisionada**: mantém um número definido de ambientes de execução já inicializados e prontos, eliminando cold start para essas invocações. Tem custo enquanto estiver ativa, mesmo sem tráfego.\n\nA confusão entre as duas é clássica: reservada trata de isolamento e limite de capacidade; provisionada trata de latência de inicialização."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Origem do evento\",\"Modelo de invocação\",\"Uso típico\"],[\"Amazon S3\",\"Assíncrona, com DLQ ou destino opcional\",\"Processar um objeto após o upload\"],[\"Amazon API Gateway\",\"Síncrona (request/response)\",\"Backend de uma API HTTP ou REST\"],[\"Amazon SQS\",\"Baseada em poll pelo serviço Lambda\",\"Processar mensagens de fila em lote\"],[\"Amazon EventBridge\",\"Assíncrona, roteada por regras\",\"Reagir a eventos de outros serviços ou agendamentos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Cliente -> Amazon API Gateway -> AWS Lambda -> Amazon DynamoDB\n                                       |\n                                       v\n                               Amazon CloudWatch Logs\n\nInvocação assíncrona:\nAmazon S3 (upload) -> AWS Lambda -> (falhas esgotadas) -> DLQ (Amazon SQS)"
                    },
                    {
                        "type": "text",
                        "value": "## Limites e Lambda em uma VPC\n\nParâmetros que toda arquitetura precisa considerar:\n\n- **Timeout**: até 15 minutos por invocação.\n- **Memória**: de 128 MB a 10.240 MB; a CPU disponível escala junto com a memória configurada.\n- **Armazenamento efêmero**: o diretório /tmp pode ser configurado de 512 MB até 10 GB.\n\nUma função associada a subnets privadas de uma VPC usa ENIs gerenciadas (Hyperplane) para alcançar recursos privados, como um Amazon RDS. Sem uma rota para um NAT Gateway (ou um VPC endpoint para o serviço de destino), essa função perde acesso a endpoints fora da VPC, incluindo a internet pública."
                    },
                    {
                        "type": "quote",
                        "value": "Serverless com Lambda compensa quando a carga é variável, orientada a eventos e de curta duração. Para processamento constante de alto volume ou execuções longas, contêineres ou instâncias EC2 costumam ter melhor custo-benefício."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe percebe que picos de tráfego em outras funções da mesma conta AWS estão consumindo toda a concorrência disponível e causando throttling em uma função Lambda crítica. Qual ação garante capacidade de execução exclusiva para essa função?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Configurar concorrência provisionada para a função crítica",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar concorrência reservada para a função crítica",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o limite de memória alocada para a função crítica",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tempo de execução médio da função crítica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função Lambda usada por um endpoint de checkout apresenta latência alta somente nas primeiras chamadas após períodos sem tráfego. Qual configuração ataca esse problema de forma mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar concorrência reservada para a função",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar cache de respostas no Amazon API Gateway",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar concorrência provisionada para a função",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a memória máxima alocada para a função",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquitetura precisa que, quando o processamento assíncrono de um evento do Amazon S3 por uma função Lambda falhar mesmo após as tentativas automáticas, o evento seja capturado para análise posterior sem código adicional na função. Qual recurso atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar um destino de falha ou uma DLQ para a invocação",
                                "isCorrect": true
                            },
                            {
                                "text": "Implementar lógica de nova tentativa no código da função",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar o Amazon S3 para reenviar o objeto a cada falha",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um Application Load Balancer entre o S3 e a função",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função Lambda configurada em subnets privadas de uma VPC consegue consultar uma instância do Amazon RDS na mesma VPC, mas recebe timeout ao chamar uma API HTTPS externa na internet. Qual ajuste resolve o problema sem expor a função publicamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Associar a função a um Internet Gateway da VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover a função para subnets públicas da própria VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um VPC endpoint de interface para a API externa",
                                "isCorrect": false
                            },
                            {
                                "text": "Rotear a subnet para um NAT Gateway em subnet pública",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe avalia o AWS Lambda para um processo que roda continuamente em alta taxa de transações, 24 horas por dia, com carga estável e previsível. Sob a ótica de custo, qual é a consideração mais relevante?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lambda sempre custa menos que contêineres, independente do padrão de carga",
                                "isCorrect": false
                            },
                            {
                                "text": "Para carga constante e previsível, contêineres podem custar menos que Lambda",
                                "isCorrect": true
                            },
                            {
                                "text": "Lambda não suporta execuções contínuas por mais de alguns segundos",
                                "isCorrect": false
                            },
                            {
                                "text": "Contêineres não sustentam cargas de trabalho previsíveis em alta taxa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon API Gateway e integração",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon API Gateway e integração\n\nO API Gateway é a porta de entrada gerenciada para APIs: cuida de autenticação, throttling, cache e transformação de payloads, tipicamente na frente de funções Lambda ou de backends HTTP dentro de uma VPC. Na prova, a decisão raramente é usar ou não o API Gateway, e sim qual tipo de API e quais recursos de borda a arquitetura exige."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de API\",\"Características\",\"Quando usar\"],[\"REST API\",\"Recursos completos: cache, validação de request, API keys, planos de uso\",\"Necessidade de recursos avançados ou compatibilidade com APIs existentes\"],[\"HTTP API\",\"Subconjunto de recursos, menor latência e menor custo\",\"APIs simples como proxy para Lambda ou HTTP, otimizando custo\"],[\"WebSocket API\",\"Conexões persistentes e bidirecionais\",\"Aplicações em tempo real, como chat ou painéis ao vivo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Throttling e cache\n\nO API Gateway aplica limites de taxa (throttling) em múltiplos níveis: conta, API e método, usando um modelo de balde de tokens (rate e burst). Ao ultrapassar o limite, o cliente recebe HTTP 429, protegendo o backend de picos inesperados.\n\nO cache de respostas, disponível apenas em REST API, é habilitado por estágio, com TTL configurável e chaves baseadas nos parâmetros da requisição. Ele reduz o número de chamadas ao backend (função Lambda ou integração HTTP) para recursos consultados com frequência."
                    },
                    {
                        "type": "text",
                        "value": "## Autorização\n\nTrês mecanismos cobrem a maioria dos cenários:\n\n- **IAM**: assinatura SigV4, indicada para clientes já autenticados na AWS (outros serviços, aplicações internas).\n- **Autorizador do Cognito User Pools**: validação nativa de tokens JWT emitidos por um user pool específico, sem código customizado.\n- **Lambda authorizer**: função Lambda que aplica lógica própria (token ou atributos da requisição) e retorna uma política IAM; o resultado pode ficar em cache por um TTL configurável."
                    },
                    {
                        "type": "code",
                        "value": "Cliente -> Amazon API Gateway -> Autorizador -> AWS Lambda ou backend HTTP\n                                      |\n                         Cognito User Pools ou Lambda authorizer\n\nSaída de um Lambda authorizer (política IAM simplificada):\n{\n  \"principalId\": \"usuario-123\",\n  \"policyDocument\": {\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n      {\n        \"Action\": \"execute-api:Invoke\",\n        \"Effect\": \"Allow\",\n        \"Resource\": \"arn:aws:execute-api:regiao:conta:api-id/stage/GET/recurso\"\n      }\n    ]\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Integrações com o backend\n\nNa integração proxy com Lambda, o API Gateway repassa a requisição completa e espera que a função monte a resposta HTTP inteira, incluindo status code e headers. Para backends que não são Lambda, um VPC Link conecta a API a recursos privados dentro de uma VPC, como um Application Load Balancer interno na frente de um serviço em contêineres, sem expor esse balanceador publicamente."
                    },
                    {
                        "type": "quote",
                        "value": "O API Gateway desacopla o cliente da implementação do backend: trocar uma função Lambda por um serviço em contêineres atrás de um VPC Link não muda o contrato exposto ao consumidor da API."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe precisa expor uma API simples que apenas encaminha requisições para uma função Lambda, priorizando menor custo e menor latência, sem necessidade de cache na API ou de chaves de API. Qual tipo de API do Amazon API Gateway atende melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Usar HTTP API, com menor custo e menor latência para esse cenário",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar REST API, com menor custo e menor latência para esse cenário",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar WebSocket API, mantendo uma conexão persistente com o cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar REST API com cache habilitado para reduzir chamadas à função",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Clientes de uma API pública hospedada no Amazon API Gateway começam a receber respostas HTTP 429 durante picos de tráfego, enquanto a função Lambda de backend permanece saudável. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tempo limite da função Lambda foi excedido",
                                "isCorrect": false
                            },
                            {
                                "text": "A concorrência reservada da função chegou a zero",
                                "isCorrect": false
                            },
                            {
                                "text": "O certificado TLS do domínio personalizado expirou",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de throttling do estágio foi excedido",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma API no Amazon API Gateway serve dados que mudam poucas vezes por hora, mas recebe um volume alto de requisições repetidas para os mesmos recursos, gerando custo elevado de invocações Lambda. Qual recurso reduz esse custo sem alterar o código da função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Habilitar concorrência provisionada na função Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar cache de respostas no estágio da API",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a memória alocada na função Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a API de REST API para WebSocket API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa validar tokens emitidos por um provedor de identidade corporativo externo, aplicando uma lógica própria de checagem de escopos antes de autorizar cada chamada. Qual mecanismo de autorização do Amazon API Gateway atende esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um autorizador do tipo Cognito User Pools",
                                "isCorrect": false
                            },
                            {
                                "text": "Autorização IAM com políticas baseadas em recurso",
                                "isCorrect": false
                            },
                            {
                                "text": "Um autorizador Lambda, com lógica de validação própria",
                                "isCorrect": true
                            },
                            {
                                "text": "Chaves de API (API keys) com planos de uso associados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer expor, pelo Amazon API Gateway, uma API hoje atendida por um Application Load Balancer interno dentro de uma VPC, sem tornar esse balanceador público. Qual recurso permite essa integração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um VPC Link, conectando a API a recursos privados na VPC",
                                "isCorrect": true
                            },
                            {
                                "text": "Um VPC peering entre a API e a VPC do balanceador",
                                "isCorrect": false
                            },
                            {
                                "text": "Um endpoint público adicionado ao Application Load Balancer",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma função Lambda posicionada entre a API e o balanceador",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Containers: ECS, Fargate e ECR",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Containers: ECS, Fargate e ECR\n\nContêineres ocupam o meio-termo entre o controle total de instâncias EC2 e a abstração completa do Lambda. O Amazon ECS orquestra contêineres, decidindo onde e como executá-los, com dois launch types que mudam quem administra a infraestrutura por trás das tasks."
                    },
                    {
                        "type": "text",
                        "value": "## Conceitos de orquestração no ECS\n\n- **Task definition**: o projeto da execução (imagem, CPU, memória, portas, variáveis de ambiente).\n- **Task**: uma instância em execução dessa definição.\n- **Service**: mantém um número desejado de tasks em execução, reiniciando as que falham, e se integra a um load balancer e ao Auto Scaling.\n- **Cluster**: o agrupamento lógico onde as tasks e services rodam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Launch type EC2\",\"Launch type Fargate\"],[\"Gestão de servidor\",\"A conta provisiona e corrige as instâncias EC2\",\"A AWS gerencia a infraestrutura subjacente\"],[\"Controle\",\"Acesso ao host e escolha do tipo de instância\",\"Sem acesso ao host; define CPU e memória por task\"],[\"Cobrança\",\"Pelas instâncias EC2, mesmo ociosas\",\"Pela CPU e memória reservadas por task em execução\"],[\"Cenário típico\",\"Carga constante, otimização de custo por instância\",\"Carga variável, times pequenos, menos overhead operacional\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Amazon ECR (imagens) -> Amazon ECS (task definition e service)\n                                |\n                +---------------+---------------+\n                |                               |\n        Launch type EC2                Launch type Fargate\n     (instâncias na conta)          (infraestrutura gerenciada)\n                |                               |\n                +---------------+---------------+\n                                |\n                    Elastic Load Balancing -> Clientes"
                    },
                    {
                        "type": "text",
                        "value": "## Amazon ECR\n\nO ECR é o registro gerenciado de imagens de contêiner, com controle de acesso via IAM, verificação de vulnerabilidades (scan ao enviar a imagem) e políticas de ciclo de vida (lifecycle policies) que expiram imagens antigas automaticamente, sem intervenção manual."
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher contêiner em vez de Lambda\n\nContêineres em ECS ou Fargate tendem a fazer mais sentido quando a carga de trabalho tem execuções acima de 15 minutos, depende de um runtime ou de bibliotecas do sistema operacional não suportados nativamente pelo Lambda, já existe empacotada como imagem, ou sustenta um throughput alto e constante em que o custo por task pode ser menor do que o custo agregado de muitas invocações Lambda."
                    },
                    {
                        "type": "quote",
                        "value": "O Fargate remove a gestão de servidores como o Lambda, mas mantém o modelo de contêiner de longa duração: é o ponto de equilíbrio entre a simplicidade operacional do serverless e o controle de um ambiente de execução completo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe pequena quer executar contêineres no Amazon ECS sem provisionar, corrigir ou dimensionar servidores subjacentes. Qual launch type do ECS atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "EC2, com Auto Scaling Group configurado pela equipe",
                                "isCorrect": false
                            },
                            {
                                "text": "EC2, usando instâncias Spot para reduzir custo",
                                "isCorrect": false
                            },
                            {
                                "text": "Fargate, que remove a gestão da infraestrutura subjacente",
                                "isCorrect": true
                            },
                            {
                                "text": "Fargate, exigindo acesso direto ao host para configuração",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo de importação de dados leva, em média, 40 minutos para concluir e precisa continuar assim. A equipe decide entre AWS Lambda e Amazon ECS com Fargate. Qual restrição pesa a favor do Fargate?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tempo máximo de execução de uma função Lambda é 15 minutos",
                                "isCorrect": true
                            },
                            {
                                "text": "O Lambda não oferece suporte a variáveis de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "O Lambda não pode ser acionado por um agendamento",
                                "isCorrect": false
                            },
                            {
                                "text": "O Fargate tem custo fixo menor que o Lambda em qualquer cenário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização acumula centenas de imagens antigas no Amazon ECR e quer que versões não utilizadas sejam removidas automaticamente após um critério definido, sem intervenção manual. Qual recurso do ECR atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Verificação de vulnerabilidades (scan on push) do repositório",
                                "isCorrect": false
                            },
                            {
                                "text": "Replicação entre regiões configurada no repositório",
                                "isCorrect": false
                            },
                            {
                                "text": "Política de acesso baseada em recurso do repositório",
                                "isCorrect": false
                            },
                            {
                                "text": "Política de ciclo de vida (lifecycle policy) do repositório",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa executa dezenas de contêineres com utilização de CPU e memória previsível 24 horas por dia e já usa Reserved Instances para otimizar custo de EC2. A equipe quer maximizar a densidade de contêineres por instância. Qual launch type do Amazon ECS favorece esse objetivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fargate, que otimiza a densidade automaticamente sem configuração",
                                "isCorrect": false
                            },
                            {
                                "text": "EC2, permitindo bin packing manual sobre as Reserved Instances",
                                "isCorrect": true
                            },
                            {
                                "text": "Fargate Spot, reduzindo custo por meio de capacidade excedente",
                                "isCorrect": false
                            },
                            {
                                "text": "EC2 com uma task por instância dedicada a cada contêiner",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação legada depende de bibliotecas específicas do sistema operacional e já está empacotada como imagem de contêiner. Adaptá-la ao modelo de execução do Lambda exigiria reescrever partes da aplicação. Qual abordagem reduz o esforço de migração para a nuvem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reescrever a aplicação em uma linguagem suportada pelo Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "Empacotar as bibliotecas do sistema operacional em uma camada Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "Executar a imagem existente no Amazon ECS ou no Amazon EKS",
                                "isCorrect": true
                            },
                            {
                                "text": "Dividir a aplicação em várias funções Lambda menores e simples",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon EKS e escolha entre opções de container",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon EKS e escolha entre opções de container\n\nO Amazon EKS é o Kubernetes gerenciado da AWS: um control plane altamente disponível, compatível com o ecossistema padrão do Kubernetes (kubectl, Helm, operators). Faz mais sentido para equipes que já padronizaram em Kubernetes ou que precisam de portabilidade entre nuvens e ambientes on-premises."
                    },
                    {
                        "type": "text",
                        "value": "## EKS vs ECS\n\nO ECS é o orquestrador proprietário da AWS: mais simples de operar, com integração nativa profunda a serviços como IAM, Elastic Load Balancing e service discovery. O EKS expõe a API padrão do Kubernetes, com curva de aprendizado maior e cobrança pelo control plane do cluster, mas com portabilidade para outros provedores e para ambientes on-premises (EKS Anywhere)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\",\"Amazon ECS\",\"Amazon EKS\"],[\"Modelo de orquestração\",\"Proprietário da AWS\",\"Kubernetes padrão\"],[\"Curva de aprendizado\",\"Menor, conceitos próprios da AWS\",\"Maior, exige conhecimento de Kubernetes\"],[\"Portabilidade\",\"Específica da AWS\",\"Alta, compatível com outros provedores\"],[\"Integração nativa com a AWS\",\"Muito profunda, sem add-ons\",\"Requer add-ons e controllers do ecossistema\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fargate com EKS\n\nO EKS pode executar pods diretamente no Fargate, sem provisionar ou gerenciar nós (worker nodes) EC2 para eles. A alternativa são nós gerenciados (managed node groups) em EC2, necessários quando a carga exige DaemonSets, contêineres privilegiados ou acesso a GPU, recursos que o Fargate no EKS não suporta."
                    },
                    {
                        "type": "code",
                        "value": "Preciso de um contêiner?\n  Não -> AWS Lambda (evento curto, escala automática, sem gestão de servidor)\n  Sim -> Preciso do ecossistema ou da portabilidade do Kubernetes?\n           Sim -> Amazon EKS (nós gerenciados ou Fargate)\n           Não  -> Amazon ECS\n                     Quero gerenciar as instâncias?   -> launch type EC2\n                     Quero infraestrutura gerenciada? -> launch type Fargate"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Opção\",\"Gestão de servidor\",\"Melhor cenário\"],[\"AWS Lambda\",\"Nenhuma\",\"Eventos curtos, tráfego variável, pouca dependência de runtime\"],[\"Amazon ECS com Fargate\",\"Nenhuma, por task\",\"Contêineres de carga variável, sem padronização em Kubernetes\"],[\"Amazon ECS com EC2\",\"Da instância EC2\",\"Carga constante, otimização de custo por densidade de contêineres\"],[\"Amazon EKS\",\"Do control plane; nós opcionais com Fargate\",\"Ecossistema Kubernetes, portabilidade multi-nuvem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Entre Lambda, Fargate, ECS em EC2 e EKS, a pergunta não é qual serviço é melhor, e sim qual combinação de controle, portabilidade e esforço operacional a carga de trabalho exige."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa já opera clusters Kubernetes on-premises e quer estender parte da carga para a AWS mantendo as mesmas ferramentas (kubectl, Helm) e o máximo de portabilidade entre ambientes. Qual serviço é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon ECS, com integração nativa aos serviços da AWS",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Lambda, eliminando a necessidade de orquestração",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon ECS com launch type EC2 e Auto Scaling Group",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EKS, compatível com o ecossistema do Kubernetes",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe que já usa Amazon EKS quer executar determinados pods sem provisionar ou gerenciar nós (worker nodes) EC2 para eles, mantendo o restante do cluster em nós gerenciados. Qual recurso permite isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um Auto Scaling Group adicional com instâncias menores",
                                "isCorrect": false
                            },
                            {
                                "text": "Um perfil do Fargate (Fargate profile) para esses pods",
                                "isCorrect": true
                            },
                            {
                                "text": "Um novo cluster do Amazon ECS dedicado a esses pods",
                                "isCorrect": false
                            },
                            {
                                "text": "Nós gerenciados (managed node groups) com instâncias Spot",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem experiência prévia em Kubernetes, precisa orquestrar contêineres com forte integração nativa a serviços da AWS como Elastic Load Balancing e IAM, priorizando simplicidade operacional. Qual serviço reduz mais a curva de aprendizado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon ECS, com o modelo de orquestração proprietário da AWS",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon EKS, com nós totalmente gerenciados pela AWS",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EKS, executando todos os pods no Fargate",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon ECS, exigindo a instalação de um control plane próprio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma carga de trabalho no Amazon EKS precisa de acesso direto a GPUs para inferência de machine learning, algo não suportado pelo Fargate no EKS. Qual abordagem viabiliza essa carga sem abandonar o cluster EKS existente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Usar um perfil do Fargate configurado com instâncias com GPU",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a carga de trabalho para o Amazon ECS com Fargate",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar nós gerenciados em instâncias EC2 equipadas com GPU",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar AWS Lambda com camadas (layers) para acesso à GPU",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função precisa gerar miniaturas de imagens sempre que um arquivo é enviado ao Amazon S3. O volume de uploads é imprevisível, varia de poucos por dia a picos ocasionais, e o processamento leva poucos segundos. Qual opção de computação exige menos esforço operacional para esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon EKS com nós gerenciados dimensionados para o pico esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon ECS com launch type EC2 sempre em execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EKS com Fargate e um cluster dedicado a essa função",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Lambda, acionado diretamente pelo evento de upload no S3",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 8 - Armazenamento",
        "aulas": [
            {
                "titulo": "Amazon S3: durabilidade, versionamento e acesso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon S3: durabilidade, versionamento e acesso\n\nO Amazon S3 é o serviço de armazenamento de objetos da AWS: dados são guardados como objetos dentro de buckets, acessíveis via API HTTP/HTTPS, sem limite prático de capacidade. Nesta aula o foco é arquitetural: as garantias de durabilidade e consistência, como o versionamento protege contra exclusão e sobrescrita acidental, e os mecanismos de controle de acesso que aparecem com frequência na prova."
                    },
                    {
                        "type": "text",
                        "value": "## Durabilidade e consistência\n\nO S3 foi projetado para 99,999999999% de durabilidade (os \"11 noves\") ao longo de um ano, replicando cada objeto de forma redundante em pelo menos 3 Zonas de Disponibilidade da região (exceto na classe One Zone-IA, que usa apenas uma AZ). Durabilidade não é o mesmo que disponibilidade: durabilidade é sobre não perder o dado; disponibilidade é sobre conseguir acessá-lo, e varia conforme a classe de armazenamento escolhida.\n\nDesde dezembro de 2020, o S3 oferece **consistência forte de leitura após escrita** para todas as operações, incluindo PUT e DELETE: assim que uma escrita é confirmada, qualquer leitura subsequente (inclusive uma LIST) já reflete essa mudança, sem necessidade de lógica de retry para lidar com consistência eventual."
                    },
                    {
                        "type": "text",
                        "value": "## Versionamento\n\nO versionamento mantém múltiplas variantes de um objeto no mesmo bucket, identificadas por um `VersionId`. Uma vez habilitado, o versionamento não pode ser desabilitado, apenas **suspenso**.\n\n- Sem versionamento, um `PUT` sobre a mesma chave sobrescreve o objeto anterior sem possibilidade de recuperação.\n- Com versionamento, um `DELETE` não remove o objeto: insere um **delete marker**, e as versões anteriores continuam recuperáveis.\n- O **MFA Delete** exige autenticação multifator para excluir uma versão permanentemente ou alterar o estado do versionamento, uma camada extra contra exclusão maliciosa ou acidental.\n- Versionamento é pré-requisito para recursos como replicação entre regiões e para regras de lifecycle que expiram versões antigas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\",\"Escopo\",\"Quando usar\"],[\"Bucket Policy\",\"Bucket inteiro (resource-based)\",\"Liberar ou negar acesso de contas, serviços ou público ao bucket\"],[\"IAM Policy\",\"Usuário, grupo ou role (identity-based)\",\"Definir o que uma identidade pode fazer em um ou vários buckets\"],[\"ACL (legado)\",\"Objeto ou bucket individual\",\"Cenários pontuais de compatibilidade; a AWS recomenda evitar\"],[\"Block Public Access\",\"Configuração da conta ou do bucket\",\"Bloquear exposição pública mesmo que uma policy permita acesso\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## URLs pré-assinadas\n\nUma **pre-signed URL** concede acesso temporário e com escopo limitado a um objeto privado, sem tornar o bucket público. É gerada por uma identidade com permissão sobre o objeto, usando as credenciais dela, e carrega uma expiração definida por quem a gera (no máximo 7 dias, um limite do próprio esquema de assinatura SigV4).\n\nCasos de uso clássicos:\n- Permitir que alguém sem conta AWS faça upload direto de um arquivo para o S3.\n- Disponibilizar download temporário de um relatório ou vídeo privado.\n- Evitar que a aplicação precise atuar como proxy do arquivo, reduzindo carga no backend."
                    },
                    {
                        "type": "code",
                        "value": "aws s3 presign s3://relatorios-financeiros/2026/relatorio-q2.pdf --expires-in 3600\n\n# Política de bucket negando qualquer acesso que não seja via HTTPS\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"NegarTransporteInseguro\",\n      \"Effect\": \"Deny\",\n      \"Principal\": \"*\",\n      \"Action\": \"s3:*\",\n      \"Resource\": [\n        \"arn:aws:s3:::relatorios-financeiros\",\n        \"arn:aws:s3:::relatorios-financeiros/*\"\n      ],\n      \"Condition\": {\n        \"Bool\": { \"aws:SecureTransport\": \"false\" }\n      }\n    }\n  ]\n}"
                    },
                    {
                        "type": "quote",
                        "value": "Por padrão todo bucket S3 é privado: acesso público só existe se alguém criar explicitamente uma bucket policy ou ACL permitindo, e mesmo assim o Block Public Access pode continuar bloqueando o acesso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe de conformidade pediu ao arquiteto uma garantia por escrito sobre a chance de perda de um objeto armazenado no Amazon S3 na classe Standard ao longo de um ano. Qual número descreve a durabilidade projetada pela AWS para essa classe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "99,999999999% de durabilidade projetada, os chamados 11 noves",
                                "isCorrect": true
                            },
                            {
                                "text": "99,99% de durabilidade projetada, o mesmo número usado para disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "99,9% de durabilidade projetada, renovada a cada replicação manual",
                                "isCorrect": false
                            },
                            {
                                "text": "99,995% de durabilidade projetada, válida apenas para objetos versionados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job noturno com bug sobrescreveu e excluiu por engano diversos objetos em um bucket S3 usado por uma aplicação financeira. A equipe quer poder restaurar tanto as versões sobrescritas quanto os objetos excluídos, sem alterar o código da aplicação. Qual configuração resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Habilitar o versionamento do bucket, que preserva versões antigas e marca exclusões como reversíveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Ativar replicação entre regiões, que copia o bucket inteiro a cada gravação feita pela aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma regra de lifecycle movendo os objetos para Glacier antes de qualquer exclusão futura",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o Block Public Access, que impede exclusões originadas de fora da conta da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto criou uma bucket policy liberando leitura pública dos objetos de um bucket S3 usado para hospedar imagens de um site, mas os usuários continuam recebendo Access Denied ao acessar as imagens pela internet. A conta AWS está com as configurações padrão. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Block Public Access da conta ou do bucket está ativo e continua bloqueando o acesso público",
                                "isCorrect": true
                            },
                            {
                                "text": "O bucket precisa estar na mesma região do usuário para permitir leitura pública dos objetos",
                                "isCorrect": false
                            },
                            {
                                "text": "Bucket policy não se aplica a objetos individuais, apenas a operações no nível do bucket",
                                "isCorrect": false
                            },
                            {
                                "text": "É necessário anexar também uma IAM Role ao bucket para validar o acesso público às imagens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa parceira, sem conta na AWS, precisa enviar um único arquivo grande diretamente para um bucket S3 privado, dentro de uma janela de poucas horas, sem que o bucket se torne público. Qual solução atende ao requisito com o menor esforço de arquitetura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gerar uma URL pré-assinada com expiração curta, concedendo acesso temporário de escrita ao objeto",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma bucket policy pública temporária e removê-la manualmente após o recebimento do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um usuário IAM temporário para o parceiro, com uma policy liberando o bucket inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar o Block Public Access apenas durante o horário combinado para o envio do arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação grava um objeto no S3 e, imediatamente em seguida, faz uma leitura (GET) da mesma chave para validar o conteúdo gravado. Qual comportamento a aplicação deve esperar do S3 hoje, sem precisar de lógica adicional de retry?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A leitura já retorna o conteúdo mais recente, pois o S3 oferece consistência forte após a escrita",
                                "isCorrect": true
                            },
                            {
                                "text": "A leitura pode retornar a versão anterior do objeto por alguns segundos, até a replicação terminar",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura falha até que o versionamento seja habilitado explicitamente no bucket de destino",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura só retorna o conteúdo correto se a aplicação usar a mesma região configurada no S3",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Classes de armazenamento do S3 e lifecycle",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Classes de armazenamento do S3 e lifecycle\n\nO S3 oferece várias classes de armazenamento sobre o mesmo modelo de durabilidade (11 noves), variando disponibilidade, redundância entre AZs, tempo de recuperação e custo por GB. Escolher a classe certa, e automatizar a transição entre elas com lifecycle, é uma das decisões de custo mais cobradas na prova."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Classe\",\"Redundância\",\"Recuperação\",\"Melhor cenário\"],[\"S3 Standard\",\"Múltiplas AZs (3 ou mais)\",\"Milissegundos\",\"Dados acessados com frequência\"],[\"S3 Standard-IA\",\"Múltiplas AZs (3 ou mais)\",\"Milissegundos\",\"Dados acessados raramente, mas com necessidade de acesso rápido\"],[\"S3 One Zone-IA\",\"Uma única AZ\",\"Milissegundos\",\"Dados raros e recriáveis, sem exigência de resiliência a AZ\"],[\"S3 Intelligent-Tiering\",\"Múltiplas AZs (3 ou mais)\",\"Milissegundos\",\"Padrão de acesso desconhecido ou imprevisível\"],[\"Glacier Instant Retrieval\",\"Múltiplas AZs (3 ou mais)\",\"Milissegundos\",\"Arquivo acessado poucas vezes ao ano, com leitura instantânea\"],[\"Glacier Flexible Retrieval\",\"Múltiplas AZs (3 ou mais)\",\"Minutos a horas\",\"Backup e arquivo com recuperação ocasional\"],[\"Glacier Deep Archive\",\"Múltiplas AZs (3 ou mais)\",\"Até 12 horas\",\"Retenção de longo prazo, raramente acessada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## S3 Intelligent-Tiering\n\nMove objetos automaticamente entre níveis de acesso (frequente, infrequente e, opcionalmente, níveis de arquivamento) com base no padrão real de uso, sem impacto de performance e **sem cobrança de recuperação** ao mudar de nível. É a escolha recomendada quando o padrão de acesso é desconhecido, imprevisível ou muda ao longo do tempo, eliminando a necessidade de o arquiteto acertar a classe manualmente."
                    },
                    {
                        "type": "text",
                        "value": "## Família Glacier\n\nAs classes Glacier trocam tempo de recuperação por custo de armazenamento mais baixo:\n\n- **Glacier Instant Retrieval**: leitura em milissegundos, como o Standard-IA, ideal para arquivos acessados uma vez por trimestre.\n- **Glacier Flexible Retrieval**: recuperação expedita (1 a 5 minutos), padrão (3 a 5 horas) ou em lote/bulk (5 a 12 horas), a custo menor quanto mais lenta a opção escolhida.\n- **Glacier Deep Archive**: a classe mais barata do S3, com recuperação padrão em até 12 horas ou em lote em até 48 horas, pensada para retenção regulatória de longo prazo."
                    },
                    {
                        "type": "text",
                        "value": "## Regras de lifecycle\n\nUma regra de lifecycle automatiza dois tipos de ação sobre objetos que atingem uma idade definida:\n\n- **Transition**: move o objeto para uma classe mais barata (por exemplo, Standard para Standard-IA aos 30 dias, e para Glacier aos 90 dias).\n- **Expiration**: exclui o objeto (ou uma versão antiga, em bucket versionado) após o período definido.\n\nCada classe tem uma **duração mínima de cobrança** (30 dias no Standard-IA e no One Zone-IA, 90 dias no Glacier Flexible Retrieval, 180 dias no Deep Archive): transicionar ou excluir um objeto antes desse prazo gera cobrança proporcional ao tempo restante, então um lifecycle mal configurado pode custar mais caro do que economizar."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"Rules\": [\n    {\n      \"ID\": \"ArquivarLogsAntigos\",\n      \"Filter\": { \"Prefix\": \"logs/\" },\n      \"Status\": \"Enabled\",\n      \"Transitions\": [\n        { \"Days\": 30, \"StorageClass\": \"STANDARD_IA\" },\n        { \"Days\": 90, \"StorageClass\": \"GLACIER\" }\n      ],\n      \"Expiration\": { \"Days\": 730 }\n    }\n  ]\n}"
                    },
                    {
                        "type": "quote",
                        "value": "Trocar de classe de armazenamento nunca reduz a durabilidade do objeto: o que muda entre as classes é disponibilidade, resiliência à perda de uma AZ, tempo de recuperação e custo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma startup quer armazenar cópias de arquivos que podem ser recriados facilmente a partir de outra fonte, priorizando o menor custo possível e aceitando o risco de perder os dados caso uma única Zona de Disponibilidade falhe. Qual classe de armazenamento do S3 atende a esse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "S3 One Zone-IA, que armazena o objeto em uma única Zona de Disponibilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "S3 Standard-IA, que armazena o objeto em ao menos três Zonas de Disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Intelligent-Tiering, que exige acesso frequente para manter o custo baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Glacier Deep Archive, que mantém o objeto disponível em milissegundos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa recebe arquivos de clientes com padrão de acesso imprevisível: alguns são lidos várias vezes no primeiro dia, outros ficam meses sem nenhum acesso, e isso muda de cliente para cliente. O time não quer criar regras manuais de transição nem pagar taxa de recuperação ao acessar um arquivo esquecido. Qual classe resolve melhor esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "S3 Intelligent-Tiering, que move os objetos entre níveis automaticamente conforme o uso real",
                                "isCorrect": true
                            },
                            {
                                "text": "S3 Standard, combinado com uma regra de lifecycle revisada manualmente todo mês pelo time",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 One Zone-IA, que reduz custo por manter os objetos em uma única Zona de Disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Glacier Flexible Retrieval, que aceita recuperação expedita para arquivos usados no primeiro dia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time configurou uma regra de lifecycle movendo logs para o S3 Standard-IA logo no 5º dia após a criação, e percebeu que o custo mensal subiu em vez de cair. A maioria dos logs é excluída antes dos 30 dias de vida. Qual é a explicação mais provável para o aumento de custo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Standard-IA cobra duração mínima de armazenamento: excluir antes do prazo gera cobrança proporcional",
                                "isCorrect": true
                            },
                            {
                                "text": "O Standard-IA rejeita objetos com menos de 30 dias, e a transição falha duplicando o armazenamento",
                                "isCorrect": false
                            },
                            {
                                "text": "A regra de lifecycle só deveria ser aplicada em buckets sem versionamento habilitado",
                                "isCorrect": false
                            },
                            {
                                "text": "O Standard-IA replica o objeto em mais Zonas de Disponibilidade que o Standard, elevando o custo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de compliance precisa acessar, em situações raras e urgentes, arquivos armazenados no S3 Glacier Flexible Retrieval em até alguns minutos, mesmo pagando mais por essa urgência. Qual opção de recuperação atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Recuperação expedita, que entrega o objeto em cerca de 1 a 5 minutos a um custo mais alto",
                                "isCorrect": true
                            },
                            {
                                "text": "Recuperação em lote, que entrega o objeto em poucas horas ao menor custo entre as opções",
                                "isCorrect": false
                            },
                            {
                                "text": "Recuperação padrão, que entrega o objeto em cerca de 3 a 5 horas por um custo intermediário",
                                "isCorrect": false
                            },
                            {
                                "text": "Migração prévia para S3 Standard, única forma de reduzir o tempo de recuperação do Glacier",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instituição financeira precisa reter registros fiscais por 7 anos, exigidos por regulação, com probabilidade de acesso praticamente nula e tolerância de até 12 horas para recuperar um documento na rara hipótese de auditoria. O objetivo principal é o menor custo de armazenamento possível. Qual classe é a mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "S3 Glacier Deep Archive, a classe de menor custo, com recuperação padrão em até 12 horas",
                                "isCorrect": true
                            },
                            {
                                "text": "S3 Glacier Flexible Retrieval, com recuperação expedita garantida em minutos para auditorias",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Standard-IA, que equilibra custo e acesso em milissegundos para dados pouco acessados",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Intelligent-Tiering, que arquiva automaticamente sem necessidade de definir prazos de retenção",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon EBS: tipos de volume, snapshots e performance",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon EBS: tipos de volume, snapshots e performance\n\nO Amazon EBS fornece armazenamento em bloco persistente, anexado a instâncias EC2 e replicado dentro de uma única Zona de Disponibilidade. Escolher o tipo de volume certo, e projetar a estratégia de snapshot, é uma decisão recorrente de performance e custo na prova."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Volume\",\"Mídia\",\"Melhor para\"],[\"gp3\",\"SSD de propósito geral\",\"Maioria das cargas de trabalho, com IOPS e throughput ajustáveis à parte\"],[\"gp2\",\"SSD de propósito geral (legado)\",\"Cargas antigas em que o IOPS escala junto com o tamanho do volume\"],[\"io1 / io2\",\"SSD de IOPS provisionado\",\"Bancos de dados críticos que exigem IOPS alto e latência consistente\"],[\"st1\",\"HDD otimizado a throughput\",\"Big data e logs com leitura sequencial de grandes volumes\"],[\"sc1\",\"HDD de baixo custo (cold)\",\"Dados acessados raramente, em que o custo por GB é prioridade\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## gp3 e gp2\n\nO **gp3** é o volume SSD de propósito geral recomendado hoje: entrega uma linha de base de 3.000 IOPS e 125 MB/s de throughput independente do tamanho do volume, e permite provisionar IOPS (até 16.000) e throughput (até 1.000 MB/s) adicionais pagando separadamente, sem precisar aumentar o tamanho do disco.\n\nO **gp2**, o modelo anterior, acopla o IOPS ao tamanho do volume (3 IOPS por GB, com burst para volumes pequenos): para ganhar IOPS no gp2 é preciso aumentar o volume, mesmo sem precisar do espaço extra. Migrar de gp2 para gp3 costuma reduzir custo mantendo ou melhorando a performance."
                    },
                    {
                        "type": "text",
                        "value": "## Volumes especializados: io1, io2 e HDD (st1/sc1)\n\nPara cargas que exigem IOPS alto e latência previsível, como bancos de dados transacionais críticos, existem os volumes **io1** e **io2** (IOPS provisionado), que permitem definir até 64.000 IOPS por volume independente do tamanho (até 256.000 na variante io2 Block Express). O **io2** entrega maior durabilidade que o io1 pelo mesmo preço e é a escolha recomendada para cargas novas. Ambos suportam **Multi-Attach**, que anexa o mesmo volume a várias instâncias EC2 na mesma AZ, usado por aplicações com controle próprio de concorrência de escrita.\n\nJá os volumes HDD são cobrados por throughput, não por IOPS, e não podem ser usados como volume de boot: **st1** (throughput-optimized) atende leitura sequencial de grandes blocos, como big data e logs; **sc1** (cold HDD) é a opção de menor custo por GB, para dados acessados raramente."
                    },
                    {
                        "type": "text",
                        "value": "## Snapshots e criptografia\n\nSnapshots do EBS são **incrementais**: depois do primeiro snapshot completo, cada novo snapshot grava apenas os blocos alterados desde o último, embora cada snapshot represente o volume inteiro no momento em que foi tirado. Ficam armazenados no S3 de forma gerenciada (sem bucket visível na conta) e podem ser copiados entre regiões para estratégias de disaster recovery.\n\nUm volume criado a partir de um snapshot criptografado é automaticamente criptografado; um volume não criptografado pode ser criptografado copiando-o para um novo volume com criptografia habilitada. A criptografia do EBS usa o AWS KMS e cobre dados em repouso, tráfego entre a instância e o volume, e os snapshots gerados a partir dele."
                    },
                    {
                        "type": "code",
                        "value": "aws ec2 create-snapshot --volume-id vol-0abcd1234efgh5678 --description \"Snapshot diario producao\"\n\naws ec2 copy-snapshot --source-region us-east-1 --source-snapshot-id snap-0a1b2c3d4e5f6g7h8 --destination-region sa-east-1 --encrypted\n\naws ec2 create-volume --availability-zone us-east-1a --volume-type gp3 --iops 6000 --throughput 250 --size 200 --encrypted"
                    },
                    {
                        "type": "quote",
                        "value": "O tipo de volume EBS define performance e custo, mas não aumenta a resiliência a falha de uma Zona de Disponibilidade: essa resiliência vem da arquitetura Multi-AZ da aplicação ou do banco de dados, não do tipo de disco."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe precisa aumentar o IOPS de um volume gp2 pequeno, mas não quer pagar por espaço em disco adicional que não será usado. Qual mudança de volume resolve isso sem desperdiçar capacidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Migrar para gp3, que permite provisionar IOPS e throughput de forma independente do tamanho do volume",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o tamanho do volume gp2, forma de elevar o IOPS nesse tipo, já que o IOPS escala com o tamanho",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar para io1 e provisionar IOPS altos, ainda que o custo por IOPS seja maior que no gp3",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar para st1, volume HDD otimizado a throughput sequencial, mais barato que o gp2 por GB",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco de dados transacional crítico precisa de IOPS alto e latência consistente e previsível, independente do tamanho do volume contratado. Qual tipo de volume EBS atende melhor a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "io2, que permite provisionar IOPS independente do tamanho do volume, com alta durabilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "st1, que otimiza throughput sequencial e mantém baixa latência em qualquer padrão de acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "gp2, que aumenta o IOPS automaticamente conforme o volume recebe mais dados ao longo do tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "sc1, que reduz o custo por GB mantendo IOPS equivalente aos volumes SSD de propósito geral",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cluster de processamento de big data lê grandes blocos de dados de forma sequencial, precisa de alto throughput e não exige ser usado como volume de boot da instância. O custo por GB deve ser menor que o de um SSD. Qual volume EBS é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "st1, volume HDD otimizado para throughput em leituras sequenciais de grandes blocos",
                                "isCorrect": true
                            },
                            {
                                "text": "gp3, volume SSD que reduz o custo por GB ao priorizar throughput sobre IOPS provisionado",
                                "isCorrect": false
                            },
                            {
                                "text": "io1, volume SSD de IOPS provisionado voltado a cargas de leitura sequencial extensa",
                                "isCorrect": false
                            },
                            {
                                "text": "sc1, volume HDD de menor custo por GB, indicado para dados acessados raramente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer preparar uma estratégia de disaster recovery para volumes EBS críticos, garantindo que cópias dos dados existam em outra região AWS, com o menor consumo de armazenamento possível a cada nova cópia. Qual abordagem atende a esse objetivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tirar snapshots incrementais do volume e copiá-los periodicamente para a região de destino",
                                "isCorrect": true
                            },
                            {
                                "text": "Habilitar Multi-Attach no volume, permitindo acesso simultâneo por instâncias em outra região",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um volume io2 idêntico na região de destino e mantê-lo sincronizado pela aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o volume para gp3 antes do backup, o único tipo com cópia nativa entre regiões",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação de cluster precisa que o mesmo volume EBS seja acessado simultaneamente por múltiplas instâncias EC2 na mesma Zona de Disponibilidade, com a própria aplicação controlando a concorrência de escrita. Qual recurso do EBS viabiliza esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Multi-Attach, disponível nos volumes io1 e io2, para anexar o mesmo volume a várias instâncias",
                                "isCorrect": true
                            },
                            {
                                "text": "Snapshots incrementais, que permitem criar cópias idênticas do volume para cada instância do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "gp3 com throughput provisionado, que permite compartilhar o volume entre instâncias da mesma AZ",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia via AWS KMS, que habilita o compartilhamento seguro do volume entre instâncias",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon EFS e Amazon FSx",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon EFS e Amazon FSx\n\nO S3 é um serviço de objetos, e o EBS é um disco de bloco preso a uma única instância (ou a poucas, com Multi-Attach, dentro da mesma AZ). Quando a necessidade é um sistema de arquivos compartilhado, acessado simultaneamente por várias instâncias ou serviços, entram em cena o Amazon EFS e a família Amazon FSx."
                    },
                    {
                        "type": "text",
                        "value": "## Amazon EFS\n\nO Amazon EFS é um sistema de arquivos **NFS** totalmente gerenciado, elástico (cresce e encolhe automaticamente conforme os arquivos são gravados ou removidos, sem provisionar capacidade previamente) e acessível simultaneamente por milhares de instâncias EC2, contêineres ECS/EKS e funções Lambda, inclusive em **múltiplas Zonas de Disponibilidade ao mesmo tempo**.\n\nOferece classes de armazenamento (Standard e Infrequent Access) com lifecycle automático movendo arquivos pouco acessados para a classe mais barata, e dois modos de performance (General Purpose, para a maioria dos casos, e Max I/O, para cargas com paralelismo muito alto). É a escolha natural quando várias instâncias Linux precisam ler e escrever no mesmo conjunto de arquivos ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Protocolo de acesso\",\"Compartilhado entre instâncias\",\"Escopo de disponibilidade\"],[\"Amazon S3\",\"API HTTP/HTTPS (objetos)\",\"Sim, qualquer número de clientes\",\"Regional, múltiplas AZs\"],[\"Amazon EBS\",\"Bloco (attach direto)\",\"Não, exceto Multi-Attach (io1/io2)\",\"Uma única Zona de Disponibilidade\"],[\"Amazon EFS\",\"NFS\",\"Sim, milhares de clientes simultâneos\",\"Regional, múltiplas AZs\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Amazon FSx for Windows File Server\n\nSistema de arquivos totalmente gerenciado que fala **SMB**, o protocolo nativo do Windows, com suporte a permissões NTFS e integração com o AWS Directory Service ou com Active Directory on-premises. É a opção indicada quando a aplicação ou os usuários precisam de um file share Windows tradicional, algo que o EFS (baseado em NFS) não atende."
                    },
                    {
                        "type": "text",
                        "value": "## Amazon FSx for Lustre\n\nSistema de arquivos de alta performance construído para cargas de **HPC (computação de alto desempenho), machine learning e processamento de mídia**, com latência baixa e throughput muito alto em acesso paralelo massivo. Pode ser vinculado a um bucket S3, apresentando os objetos como arquivos e sincronizando os resultados processados de volta para o S3, o que o torna comum em pipelines de treinamento de modelos que leem grandes datasets repetidamente."
                    },
                    {
                        "type": "code",
                        "value": "# Montar um EFS em uma instância EC2 Linux\nsudo mount -t nfs4 -o nfsvers=4.1 fs-0123456789abcdef0.efs.us-east-1.amazonaws.com:/ /mnt/dados\n\n# Criar um sistema de arquivos FSx for Lustre associado a um bucket S3\naws fsx create-file-system --file-system-type LUSTRE --storage-capacity 1200 --subnet-ids subnet-0abc1234 --lustre-configuration ImportPath=s3://dataset-treinamento-ml"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que separa S3, EBS e sistemas de arquivos é simples: preciso de um objeto acessível via API, de um disco preso a uma instância, ou de uma pasta compartilhada por vários clientes ao mesmo tempo?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação roda em várias instâncias EC2 Linux, distribuídas em diferentes Zonas de Disponibilidade, e todas precisam ler e gravar simultaneamente no mesmo conjunto de arquivos. Qual serviço de armazenamento atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon EFS, sistema de arquivos NFS acessível por instâncias em múltiplas AZs ao mesmo tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon EBS com o tipo gp3, que permite acesso simultâneo de qualquer instância em qualquer AZ",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon S3 Standard, montado como disco local em cada instância para leitura e escrita direta",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EBS com Multi-Attach, que conecta o mesmo volume a instâncias em Zonas diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa está migrando um file server Windows on-premises para a AWS e precisa manter as mesmas permissões NTFS e a integração com o Active Directory existente, usando o protocolo SMB. Qual serviço atende a esse requisito sem reescrever a camada de permissões?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon FSx for Windows File Server, que fala SMB e integra com o Active Directory",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon EFS, que oferece suporte nativo a SMB e a permissões NTFS do Windows",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon FSx for Lustre, otimizado para cargas de alto desempenho em ambiente Windows",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon S3 com Block Public Access desabilitado, permitindo montagem via protocolo SMB",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de machine learning precisa treinar um modelo lendo repetidamente um dataset de vários terabytes armazenado no S3, com throughput muito alto e acesso paralelo massivo durante o treinamento. Qual solução de armazenamento é mais adequada para esse pipeline?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Amazon FSx for Lustre vinculado ao bucket S3, entregando alto throughput em acesso paralelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon EFS no modo Max I/O, apontando diretamente para os objetos do bucket S3 de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon FSx for Windows File Server, com o dataset copiado do S3 por uma tarefa agendada",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EBS io2 com IOPS provisionado, anexado a cada instância do cluster de treinamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe percebe que grande parte dos arquivos armazenados em um sistema de arquivos Amazon EFS não é acessada há várias semanas, mas precisa continuar disponível para leitura ocasional sem mudança na forma como a aplicação acessa os arquivos. Qual recurso reduz o custo de armazenamento nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Habilitar o lifecycle do EFS para mover arquivos pouco acessados para a classe Infrequent Access",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar os arquivos para volumes EBS sc1, reduzindo o custo por GB de dados pouco acessados",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o modo de performance Max I/O do EFS, que reduz automaticamente o custo por GB",
                                "isCorrect": false
                            },
                            {
                                "text": "Copiar os arquivos para o Amazon FSx for Lustre, que cobra apenas pelo throughput consumido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação legada exige um volume de bloco, não um sistema de arquivos de rede, compartilhado simultaneamente por instâncias EC2 espalhadas em três Zonas de Disponibilidade diferentes. Qual afirmação descreve corretamente as opções de armazenamento da AWS para esse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhum volume EBS, nem com Multi-Attach, é compartilhado entre AZs diferentes na AWS",
                                "isCorrect": true
                            },
                            {
                                "text": "O volume io2 com Multi-Attach atende o requisito, pois replica automaticamente entre as três AZs",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume gp3 atende o requisito ao ser configurado com throughput provisionado acima do padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O Amazon EFS resolve o requisito porque oferece um volume de bloco compartilhado entre AZs",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Storage Gateway, AWS Backup e Snow Family",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Storage Gateway, AWS Backup e Snow Family\n\nNem toda arquitetura começa do zero na nuvem: muitas empresas precisam conectar armazenamento on-premises à AWS, centralizar políticas de backup entre vários serviços, ou migrar volumes gigantescos de dados quando a rede simplesmente não é rápida o suficiente. Para esses cenários existem o AWS Storage Gateway, o AWS Backup e a AWS Snow Family."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Storage Gateway\n\nConecta ambientes on-premises ao armazenamento da AWS, apresentando um endpoint local (físico ou virtual) que fala protocolos de armazenamento tradicionais enquanto os dados ficam guardados, de fato, na nuvem. Existem três tipos de gateway, cada um resolvendo uma necessidade diferente de migração ou extensão híbrida."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Gateway\",\"Protocolo local\",\"Onde os dados ficam na AWS\",\"Cenário típico\"],[\"File Gateway\",\"NFS / SMB\",\"Objetos no Amazon S3\",\"Compartilhar arquivos on-premises com backup automático em S3\"],[\"Volume Gateway\",\"iSCSI (blocos)\",\"Snapshots no Amazon EBS\",\"Estender armazenamento em bloco local com backup na nuvem\"],[\"Tape Gateway\",\"iSCSI-VTL (fitas virtuais)\",\"Amazon S3 e S3 Glacier\",\"Substituir biblioteca física de fitas mantendo o software de backup atual\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Backup\n\nServiço gerenciado que centraliza e automatiza backups de múltiplos serviços AWS (EBS, RDS, DynamoDB, EFS, FSx, volumes do Storage Gateway, entre outros) a partir de um único lugar, eliminando a necessidade de scripts separados por serviço. Um **backup plan** define frequência, janela, retenção e regras de cópia entre regiões ou entre contas; os backups ficam organizados em **backup vaults**, que podem ter políticas de acesso próprias. O serviço também suporta o **Backup Vault Lock**, que torna backups imutáveis durante um período de retenção, útil para exigências de conformidade contra exclusão, inclusive por um administrador."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Snow Family\n\nDispositivos físicos para transportar grandes volumes de dados entre o ambiente on-premises e a AWS quando a transferência pela rede levaria tempo demais ou a conectividade é limitada:\n\n- **AWS Snowcone**: o menor dispositivo, portátil, para coleta de dados em locais remotos ou com pouco espaço.\n- **AWS Snowball Edge**: opções otimizadas para armazenamento ou para computação (com CPU/GPU embarcada para processar dados antes do envio), tipicamente dezenas de terabytes por unidade.\n- **AWS Snowmobile**: um contêiner transportado por caminhão, para migrações de **exabytes**, quando nem várias unidades Snowball resolveriam em tempo hábil.\n\nA decisão entre um dispositivo físico e a transferência pela rede (com o AWS DataSync, por exemplo) depende do volume de dados e da banda disponível: se o tempo estimado de transferência pela internet ou por Direct Connect ultrapassa dias ou semanas, o dispositivo físico costuma ser mais rápido e mais barato."
                    },
                    {
                        "type": "code",
                        "value": "# Criar um job de importação de dados via Snowball Edge\naws snowball create-job --job-type IMPORT --resources S3Resources=[{BucketArn=arn:aws:s3:::dataset-migracao}] --snowball-type EDGE_STORAGE_OPTIMIZED --shipping-option SECOND_DAY\n\n# Referenciar um backup vault ao criar um plano no AWS Backup\naws backup create-backup-plan --backup-plan BackupPlanName=PlanoDiarioProducao,Rules=[{RuleName=BackupDiario,TargetBackupVaultName=vault-producao,ScheduleExpression=\"cron(0 5 * * ? *)\"}]"
                    },
                    {
                        "type": "quote",
                        "value": "Storage Gateway resolve uso híbrido contínuo; Snow Family resolve migração de dados em massa, uma única vez; AWS Backup resolve centralizar a política de backup entre serviços diferentes. São problemas parecidos, mas não são o mesmo problema."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer que seus servidores on-premises continuem acessando arquivos via NFS normalmente, enquanto esses arquivos passam a ser armazenados, de fato, como objetos no Amazon S3, com cache local para os arquivos mais usados. Qual componente do AWS Storage Gateway atende a esse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "File Gateway, que expõe um endpoint NFS/SMB local enquanto guarda os dados como objetos no S3",
                                "isCorrect": true
                            },
                            {
                                "text": "Volume Gateway, que expõe um endpoint iSCSI local enquanto guarda snapshots dos volumes no S3",
                                "isCorrect": false
                            },
                            {
                                "text": "Tape Gateway, que expõe uma biblioteca de fitas virtual local enquanto guarda os dados no S3",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Snowball Edge, que expõe um endpoint NFS local enquanto sincroniza os dados pela rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação on-premises grava dados em um volume de bloco local via iSCSI, e a equipe quer que cópias desses dados fiquem disponíveis na AWS na forma de snapshots, sem alterar a forma como a aplicação enxerga o armazenamento. Qual tipo de gateway atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Volume Gateway, que expõe um volume iSCSI local e armazena snapshots incrementais na AWS",
                                "isCorrect": true
                            },
                            {
                                "text": "File Gateway, que expõe um compartilhamento de arquivos e armazena os dados como objetos no S3",
                                "isCorrect": false
                            },
                            {
                                "text": "Tape Gateway, que expõe uma biblioteca de fitas virtual e armazena os dados como snapshots",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Backup, que expõe um volume iSCSI local conectado diretamente aos servidores on-premises",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usa Amazon EBS, Amazon RDS e Amazon DynamoDB, e quer definir uma única política de frequência e retenção de backup para os três serviços, aplicada automaticamente, sem manter scripts separados por serviço. Qual serviço atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Backup, que centraliza backups de múltiplos serviços AWS a partir de planos unificados",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Storage Gateway, que centraliza snapshots de EBS, RDS e DynamoDB em um único volume iSCSI",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon S3 com regras de lifecycle, que aplicam a mesma retenção a qualquer serviço da AWS",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Snowball, que agenda cópias periódicas de EBS, RDS e DynamoDB para um dispositivo físico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa migrar 2 petabytes de dados de um data center para a AWS, e a conexão disponível entregaria, na prática, apenas alguns terabytes por dia, o que levaria meses para concluir a transferência pela rede. Qual abordagem migra os dados no menor tempo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Solicitar múltiplas unidades de AWS Snowball Edge, migrando os dados fisicamente em paralelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Contratar uma conexão AWS Direct Connect adicional, dobrando a banda disponível para a migração",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o S3 Transfer Acceleration, que aumenta a velocidade da transferência pela internet pública",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir a transferência em várias contas AWS diferentes, paralelizando o upload pela mesma conexão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usa um software de backup corporativo já homologado, que grava em fitas físicas por meio de um protocolo de biblioteca de fitas, e quer eliminar o hardware físico sem trocar esse software. Qual solução permite continuar usando o mesmo software, agora gravando na AWS?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tape Gateway, que apresenta uma biblioteca de fitas virtual compatível com o software existente",
                                "isCorrect": true
                            },
                            {
                                "text": "File Gateway, que apresenta um compartilhamento de arquivos compatível com softwares de fita",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Backup, que substitui o software de backup atual por planos de backup nativos da AWS",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Snowball Edge, que emula uma biblioteca de fitas conectada permanentemente ao data center",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 9 - Bancos de dados",
        "aulas": [
            {
                "titulo": "Amazon RDS: Multi-AZ e read replicas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon RDS: Multi-AZ e read replicas\n\nO Amazon RDS oferece dois mecanismos distintos para lidar com disponibilidade e escala, e a prova cobra bastante a diferença entre eles. Multi-AZ resolve **disponibilidade**: mantém uma cópia sincronizada pronta para assumir o tráfego em caso de falha. Read replicas resolvem **escala de leitura**: distribuem consultas entre várias cópias assíncronas do banco.\n\nConfundir os dois é um dos erros mais comuns da SAA-C03."
                    },
                    {
                        "type": "text",
                        "value": "## Multi-AZ: alta disponibilidade\n\n- Cria uma instância standby em **outra Availability Zone**, com replicação **síncrona** dos dados.\n- A standby **não aceita conexões de leitura ou escrita**: existe só para failover.\n- Em caso de falha da primária (falha de hardware, perda da AZ, manutenção com reboot), a AWS promove a standby automaticamente e atualiza o endpoint DNS da instância.\n- O failover costuma levar de dezenas de segundos a poucos minutos.\n- Não reduz latência nem aumenta capacidade de leitura: o único objetivo é resiliência."
                    },
                    {
                        "type": "text",
                        "value": "## Read replicas: escala de leitura\n\n- Cópias **assíncronas** do banco, dentro da mesma região ou em outras regiões.\n- Aceitam **consultas de leitura**, aliviando a carga da instância primária (relatórios, dashboards, analytics).\n- Podem ser **promovidas** a instância independente, o que quebra a replicação e é usado em recuperação de desastre ou em migrações.\n- É possível habilitar Multi-AZ também na read replica, combinando escala com resiliência.\n- Os engines padrão (MySQL, PostgreSQL, MariaDB) suportam até 5 read replicas por instância de origem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Multi-AZ\",\"Read Replica\"],[\"Objetivo\",\"Alta disponibilidade\",\"Escala de leitura\"],[\"Replicação\",\"Síncrona\",\"Assíncrona\"],[\"Aceita leitura direta\",\"Não\",\"Sim\"],[\"Failover\",\"Automático pela AWS\",\"Promoção manual\"],[\"Pode ficar em outra região\",\"Não\",\"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Backups automatizados e point-in-time recovery\n\n- Backups automatizados ficam habilitados por padrão, com retenção configurável de **1 a 35 dias**.\n- Permitem restauração **point-in-time (PITR)**: recriar o banco em qualquer segundo dentro da janela de retenção.\n- A restauração sempre cria uma **nova instância**, com novo endpoint, nunca sobrescreve a original.\n- Snapshots manuais não expiram sozinhos: ficam disponíveis até serem excluídos, mesmo além da janela de retenção automática."
                    },
                    {
                        "type": "code",
                        "value": "Regiao us-east-1\n\n  AZ-A: [ RDS Primaria ] <== replicacao sincrona ==> [ RDS Standby ]  (AZ-B, Multi-AZ)\n         aceita leitura e escrita              nao aceita trafego\n\n  AZ-A: [ RDS Primaria ] -- replicacao assincrona --> [ Read Replica ]  (AZ-C ou outra regiao)\n         aceita leitura e escrita                       aceita somente leitura"
                    },
                    {
                        "type": "quote",
                        "value": "Multi-AZ protege contra falhas, read replicas protegem contra sobrecarga de leitura: são soluções para problemas diferentes e podem ser usadas juntas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação crítica roda sobre uma única instância do Amazon RDS. A equipe precisa que, em caso de falha da instância, o banco volte a ficar disponível em outra zona de disponibilidade sem intervenção manual. Qual configuração atende esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aumentar a classe da instância do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma read replica na mesma região",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar snapshots manuais periódicos",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar Multi-AZ na instância do banco",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de BI executa relatórios pesados que competem por recursos com o tráfego transacional no mesmo banco RDS, deixando a aplicação lenta para os usuários finais. Qual solução reduz esse impacto sem trocar de banco de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar o banco para uma instância com mais vCPUs apenas",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o período de retenção dos backups automatizados",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar Multi-AZ para distribuir a carga entre instâncias",
                                "isCorrect": false
                            },
                            {
                                "text": "Direcionar as consultas de relatório para uma read replica",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto configurou Multi-AZ em uma instância RDS esperando usar a instância standby para atender parte das consultas de leitura da aplicação, mas as conexões direcionadas a ela falham. Qual é o motivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A standby aceita leitura apenas em clusters Aurora, não no RDS",
                                "isCorrect": false
                            },
                            {
                                "text": "A standby só aceita leitura após o fim da janela de retenção",
                                "isCorrect": false
                            },
                            {
                                "text": "A standby exige uma read replica associada para liberar leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "A standby do Multi-AZ não aceita conexões, serve só para failover",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma exclusão indevida corrompeu dados em uma instância RDS por volta das 14h32 de hoje. A retenção de backups automatizados está configurada para 7 dias. Qual ação restaura o banco para o estado exato de 14h30, minutos antes do problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reversão do último snapshot manual da mesma instância",
                                "isCorrect": false
                            },
                            {
                                "text": "Promoção da read replica mais próxima daquele horário",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicialização da instância principal para refazer a transação",
                                "isCorrect": false
                            },
                            {
                                "text": "Restauração point-in-time da instância para as 14h30",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de operações quer transformar uma read replica em outra região em um banco totalmente independente, sem qualquer vínculo com a instância de origem, para isolar um novo ambiente. O que deve ser feito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Promover a read replica a uma instância standalone",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar snapshots manuais periódicos da read replica",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar Multi-AZ na read replica de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Excluir a instância primária para forçar a promoção",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon Aurora e Aurora Serverless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon Aurora e Aurora Serverless\n\nO Aurora é um banco relacional da AWS, compatível com MySQL e PostgreSQL, construído sobre uma arquitetura de armazenamento distribuído bem diferente do RDS tradicional. O resultado é mais throughput, recuperação mais rápida e réplicas com latência bem menor, o que muda a resposta certa em vários cenários da prova."
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento distribuído\n\n- Os dados são replicados automaticamente em **6 cópias, espalhadas por 3 Availability Zones**.\n- Uma escrita é confirmada com quorum de 4 das 6 cópias; uma leitura usa quorum de 3 cópias, o que tolera a perda de uma AZ inteira sem impacto em escrita.\n- O armazenamento cresce automaticamente, em incrementos, até 128 TB, sem provisionamento manual.\n- Em falha de disco, o Aurora corrige (self-healing) as cópias danificadas automaticamente em segundo plano."
                    },
                    {
                        "type": "text",
                        "value": "## Aurora Replicas e endpoints\n\n- Um cluster Aurora suporta até **15 réplicas**, todas lendo do mesmo armazenamento distribuído, com replicação de baixa latência.\n- O **writer endpoint** sempre aponta para a instância primária atual, usado para escrita.\n- O **reader endpoint** balanceia conexões entre as réplicas disponíveis, ideal para escalar leitura sem lógica extra na aplicação.\n- Em um failover, uma réplica existente é promovida a primária normalmente em menos de 30 segundos, bem mais rápido que o Multi-AZ clássico do RDS."
                    },
                    {
                        "type": "text",
                        "value": "## Aurora Serverless v2 e Aurora Global Database\n\n- O **Aurora Serverless v2** ajusta a capacidade de computação automaticamente, em unidades de ACU, conforme a demanda, sem gerenciar instâncias, ideal para cargas variáveis ou imprevisíveis.\n- O **Aurora Global Database** replica um cluster para outras regiões secundárias com atraso tipicamente abaixo de 1 segundo, usando replicação no nível de armazenamento.\n- Global Database permite leitura de baixa latência perto dos usuários em cada região e recuperação de desastre regional rápida, promovendo a região secundária se a primária ficar indisponível."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"RDS (engines padrão)\",\"Aurora\"],[\"Armazenamento\",\"EBS, provisionado manualmente\",\"Distribuído, escala automática até 128 TB\"],[\"Cópias dos dados\",\"1 + standby no Multi-AZ\",\"6 cópias em 3 AZs\"],[\"Réplicas de leitura\",\"Até 5\",\"Até 15\"],[\"Failover típico\",\"Na casa de minutos\",\"Abaixo de 30 segundos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Cluster Aurora (us-east-1)\n  Armazenamento distribuido: 6 copias / 3 AZs (auto-heal, ate 128 TB)\n\n  [ Writer endpoint ] --> instancia primaria (leitura e escrita)\n  [ Reader endpoint ] --> balanceia entre ate 15 Aurora Replicas (somente leitura)\n\nAurora Global Database\n  Regiao primaria --(replicacao de armazenamento, < 1s)--> Regiao secundaria (leitura local / DR)"
                    },
                    {
                        "type": "quote",
                        "value": "Aurora troca o modelo de armazenamento do RDS por uma camada distribuída e autorreparável, e é essa mudança de fundação que explica cada vantagem de disponibilidade e performance sobre os engines padrão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Durante o design de uma arquitetura, um time precisa justificar por que o Amazon Aurora tolera a perda de uma zona de disponibilidade inteira sem interromper a escrita. Qual característica explica isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Aurora replica os dados de forma síncrona para uma standby",
                                "isCorrect": false
                            },
                            {
                                "text": "O armazenamento mantém 6 cópias distribuídas em 3 AZs",
                                "isCorrect": true
                            },
                            {
                                "text": "O Aurora mantém backups contínuos em cache na primária",
                                "isCorrect": false
                            },
                            {
                                "text": "O Aurora usa volumes EBS espelhados entre regiões",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup tem um banco com uso imprevisível: fica ocioso por horas e depois recebe rajadas intensas de tráfego. A equipe quer pagar pela capacidade realmente usada, sem redimensionar instâncias manualmente. Qual opção atende melhor esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon Aurora Serverless v2",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Aurora com réplicas fixas dimensionadas para o pico",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS com read replicas provisionadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS com Multi-AZ clássico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa garantir que toda operação de escrita seja sempre enviada para a instância primária atual de um cluster Aurora, mesmo depois de um failover que promove outra instância. Qual recurso deve ser usado na string de conexão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O reader endpoint do cluster Aurora",
                                "isCorrect": false
                            },
                            {
                                "text": "Um endpoint customizado apontando para todas as instâncias",
                                "isCorrect": false
                            },
                            {
                                "text": "O writer endpoint do cluster Aurora",
                                "isCorrect": true
                            },
                            {
                                "text": "O endpoint fixo da instância primária original",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa tem usuários ativos na América do Norte, na Europa e na Ásia, e precisa de leitura com baixa latência local em cada continente, além de failover regional rápido em caso de desastre. Qual solução atende os dois requisitos com um único cluster lógico?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Multi-AZ do RDS combinado com o Amazon CloudFront",
                                "isCorrect": false
                            },
                            {
                                "text": "Aurora Global Database com regiões secundárias",
                                "isCorrect": true
                            },
                            {
                                "text": "Read replicas cross-region do RDS padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Aurora Serverless v2 replicado via Route 53",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de e-commerce precisa de até 12 réplicas de leitura com latência de replicação muito baixa e failover abaixo de 30 segundos em caso de falha da primária. O time já usa MySQL e não quer trocar de engine. Qual escolha atende esses requisitos de escala e disponibilidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar Amazon RDS para MySQL com 5 read replicas",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar para o Amazon DynamoDB com tabelas globais",
                                "isCorrect": false
                            },
                            {
                                "text": "Permanecer no Amazon RDS para MySQL com Multi-AZ",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar para o Amazon Aurora compatível com MySQL",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon DynamoDB: modelagem, capacidade e DAX",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon DynamoDB: modelagem, capacidade e DAX\n\nO DynamoDB é o banco NoSQL gerenciado da AWS: chave-valor e documento, sem servidores para administrar, com latência de milissegundos de dígito único independente da escala. A prova cobra como modelar as chaves, como escolher o modo de capacidade e quando colocar o DAX na frente do banco."
                    },
                    {
                        "type": "text",
                        "value": "## Chave primária: partition key e sort key\n\n- **Chave simples** (somente partition key): cada valor de chave identifica um item único. O DynamoDB usa um hash da chave para distribuir os itens entre partições.\n- **Chave composta** (partition key + sort key): vários itens podem compartilhar a mesma partition key, ordenados pela sort key. Permite consultas por intervalo, como todos os pedidos de um cliente ordenados por data.\n- Uma partition key com **alta cardinalidade** evita partições quentes (hot partitions) e distribui melhor o tráfego."
                    },
                    {
                        "type": "text",
                        "value": "## Modos de capacidade\n\n- **On-demand**: cobrança por requisição, escala instantaneamente para picos, sem planejamento prévio. Ideal para tráfego imprevisível ou um padrão de uso ainda desconhecido.\n- **Provisionado**: define RCU (read capacity units) e WCU (write capacity units) fixos, com Auto Scaling opcional. Compensa quando o tráfego é previsível, geralmente com custo menor em escala estável.\n- 1 RCU cobre uma leitura fortemente consistente por segundo de um item de até 4 KB. 1 WCU cobre uma escrita por segundo de um item de até 1 KB."
                    },
                    {
                        "type": "text",
                        "value": "## DynamoDB Accelerator (DAX)\n\n- Cache in-memory, totalmente gerenciado, posicionado na frente do DynamoDB, com latência de **microssegundos** em vez de milissegundos.\n- Compatível com a API do DynamoDB, exigindo poucas mudanças no código da aplicação.\n- Reduz a carga de leitura sobre a tabela em cargas **read-heavy**, com itens acessados repetidamente (cache write-through).\n- Não substitui uma boa modelagem de chaves, apenas acelera leituras repetidas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modo\",\"Melhor para\",\"Cobrança\"],[\"On-demand\",\"Tráfego imprevisível ou desconhecido\",\"Por requisição realizada\"],[\"Provisionado\",\"Tráfego estável e previsível\",\"Por RCU/WCU reservados, com Auto Scaling opcional\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Tabela: Pedidos\n  Partition key: clienteId    (ex: \"cli-4821\")\n  Sort key:      dataPedido   (ex: \"2026-07-01#pedido-993\")\n\nConsulta tipica: pedidos do cliente \"cli-4821\" entre duas datas\n  -> Query com condicao de intervalo na sort key, sem Scan na tabela inteira"
                    },
                    {
                        "type": "quote",
                        "value": "Em DynamoDB, o design da chave primária é a decisão de arquitetura mais importante: ela é definida antes de escrever a primeira linha de código de consulta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação precisa de um banco chave-valor totalmente gerenciado, sem servidores para administrar, com latência de milissegundos de dígito único independente do volume de dados armazenado. Qual serviço atende esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon ElastiCache para Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon DynamoDB",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Aurora Serverless v2",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS com Multi-AZ",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela precisa armazenar pedidos de clientes e permitir consultar rapidamente todos os pedidos de um cliente específico ordenados por data, sem varrer a tabela inteira. Como a chave primária deve ser modelada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar a data do pedido como partition key e o id do cliente como sort key",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o id do cliente combinado ao produto como partition key",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas o id do pedido como partition key, sem sort key",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o id do cliente como partition key e a data do pedido como sort key",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma nova aplicação mobile acabou de ser lançada e a equipe ainda não sabe qual será o padrão de tráfego nas próximas semanas, com picos possíveis a qualquer momento. Qual modo de capacidade evita a necessidade de planejar RCU e WCU com antecedência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar o modo de capacidade on-demand da tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar modo provisionado com limite máximo bem baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar modo provisionado com Auto Scaling desligado",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar modo provisionado com capacidade reservada anual",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação de leitura intensa consulta repetidamente os mesmos itens em uma tabela do DynamoDB, o custo está subindo e o time quer respostas na casa de microssegundos, com o mínimo de mudança no código de acesso ao banco. Qual solução resolve isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ativar réplicas de leitura na tabela do DynamoDB",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a tabela para o Amazon ElastiCache para Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar o DynamoDB Accelerator (DAX) na frente da tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a capacidade provisionada de leitura da tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela recebe 8 leituras fortemente consistentes por segundo, cada item com até 4 KB. Quantas RCUs precisam ser provisionadas para atender essa carga sem throttling?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "4 RCU",
                                "isCorrect": false
                            },
                            {
                                "text": "8 RCU",
                                "isCorrect": true
                            },
                            {
                                "text": "16 RCU",
                                "isCorrect": false
                            },
                            {
                                "text": "32 RCU",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DynamoDB avançado: Global Tables, streams e TTL",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# DynamoDB avançado: Global Tables, streams e TTL\n\nDepois de dominar chaves e capacidade, a prova espera que você reconheça os recursos que tornam o DynamoDB uma peça central em arquiteturas orientadas a eventos e distribuídas globalmente: replicação multirregião ativa, captura de mudanças em tempo real, expiração automática de itens e índices secundários."
                    },
                    {
                        "type": "text",
                        "value": "## Global Tables\n\n- Replicação **multirregião e multiativa** (multi-master): cada região participante aceita leitura e escrita.\n- Conflitos de escrita concorrente em regiões diferentes são resolvidos por **last writer wins**.\n- Usada em aplicações globais que precisam de acesso local de baixa latência em várias regiões e resiliência à indisponibilidade de uma região inteira.\n- Não substitui backup: protege contra falha regional, não contra exclusão acidental, que é replicada para todas as regiões."
                    },
                    {
                        "type": "text",
                        "value": "## DynamoDB Streams\n\n- Captura uma sequência ordenada no tempo de **modificações em itens** (inserção, atualização, remoção), retida por 24 horas.\n- Integra nativamente com **AWS Lambda**: cada mudança pode disparar uma função, viabilizando arquiteturas orientadas a eventos.\n- Casos de uso comuns: replicar dados para outro sistema, manter agregações ou views materializadas, auditoria de mudanças, notificações em tempo real."
                    },
                    {
                        "type": "text",
                        "value": "## TTL e opções de backup\n\n- **TTL (Time to Live)**: um atributo com timestamp define quando o item expira; o DynamoDB remove itens expirados automaticamente, tipicamente em até 48 horas, sem consumir WCU.\n- Útil para dados temporários: sessões, tokens, cache de aplicação, logs de validade curta.\n- **On-demand backup**: cópia completa, disparada manualmente ou via API, mantida até ser excluída, sem impacto de performance.\n- **Point-in-time recovery (PITR)**: backup contínuo que permite restaurar a tabela para qualquer segundo nos últimos 35 dias."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"GSI\",\"LSI\"],[\"Partition key\",\"Pode ser diferente da tabela\",\"Igual à da tabela\"],[\"Quando criar\",\"A qualquer momento\",\"Somente na criação da tabela\"],[\"Capacidade\",\"Própria, independente da tabela\",\"Compartilha a capacidade da tabela base\"],[\"Limite padrão por tabela\",\"20\",\"5\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Evento no DynamoDB Stream (simplificado)\n{\n  \"eventName\": \"MODIFY\",\n  \"dynamodb\": {\n    \"Keys\": { \"pedidoId\": { \"S\": \"pedido-993\" } },\n    \"OldImage\": { \"status\": { \"S\": \"PENDENTE\" } },\n    \"NewImage\": { \"status\": { \"S\": \"PAGO\" } }\n  }\n}\n-> aciona uma funcao Lambda que notifica o cliente"
                    },
                    {
                        "type": "quote",
                        "value": "Streams tornam o DynamoDB reativo, Global Tables o tornam global, e TTL mantém a tabela enxuta sem esforço manual: três recursos que resolvem problemas de arquitetura bem distintos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação com usuários em múltiplas regiões precisa que cada região leia e grave localmente no mesmo conjunto lógico de dados, com replicação automática entre as regiões. Qual recurso do DynamoDB atende essa necessidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Global Tables do DynamoDB",
                                "isCorrect": true
                            },
                            {
                                "text": "Point-in-time recovery",
                                "isCorrect": false
                            },
                            {
                                "text": "DynamoDB Streams com Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "Read replicas multirregião",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer que, toda vez que um item de pedido for atualizado em uma tabela do DynamoDB, uma função seja executada automaticamente para notificar o cliente, sem consultas periódicas (polling) na tabela. Qual recurso viabiliza essa arquitetura orientada a eventos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um índice GSI consultado periodicamente",
                                "isCorrect": false
                            },
                            {
                                "text": "DynamoDB Streams integrado a uma função Lambda",
                                "isCorrect": true
                            },
                            {
                                "text": "TTL configurado no atributo de status do pedido",
                                "isCorrect": false
                            },
                            {
                                "text": "Global Tables replicando para outra região",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela armazena tokens de sessão que devem ser removidos automaticamente após expirarem, sem que a aplicação rode um job de limpeza e sem consumir capacidade de escrita nesse processo. Qual recurso do DynamoDB atende esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Backup automático com retenção curta",
                                "isCorrect": false
                            },
                            {
                                "text": "Um GSI ordenado pela data de expiração",
                                "isCorrect": false
                            },
                            {
                                "text": "DynamoDB Streams removendo itens expirados",
                                "isCorrect": false
                            },
                            {
                                "text": "TTL (Time to Live) configurado na tabela",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois que uma tabela do DynamoDB já estava em produção há meses, surgiu a necessidade de consultar os itens por um atributo que não fazia parte da chave primária original. Qual tipo de índice pode ser adicionado nesse momento, sem recriar a tabela?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma nova sort key na chave primária",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Local Secondary Index (LSI)",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Global Secondary Index (GSI)",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma projeção no DynamoDB Streams",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma exclusão acidental removeu itens importantes de uma tabela do DynamoDB há cerca de 3 horas. Não havia nenhum backup manual agendado previamente. Qual recurso permite restaurar a tabela para o estado exato daquele momento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reverter a replicação configurada no Global Tables",
                                "isCorrect": false
                            },
                            {
                                "text": "Restaurar o on-demand backup mais recente disponível",
                                "isCorrect": false
                            },
                            {
                                "text": "Restaurar a tabela via point-in-time recovery (PITR)",
                                "isCorrect": true
                            },
                            {
                                "text": "Reprocessar os eventos retidos no DynamoDB Streams",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ElastiCache, Redshift e escolhendo o banco certo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ElastiCache, Redshift e escolhendo o banco certo\n\nFechando o módulo de bancos de dados, faltam duas peças: cache em memória para latência de microssegundos e um data warehouse para análises complexas sobre grandes volumes. No final, uma visão consolidada para responder rápido à pergunta mais comum da prova: qual banco usar em cada cenário?"
                    },
                    {
                        "type": "text",
                        "value": "## Amazon ElastiCache: Redis vs Memcached\n\n- **Redis**: suporta persistência (snapshots e AOF), replicação com failover automático em Multi-AZ, estruturas de dados ricas (listas, sets, sorted sets, hashes), pub/sub e transações. Escolha padrão quando há necessidade de durabilidade, alta disponibilidade ou estruturas complexas, como leaderboards e filas de prioridade.\n- **Memcached**: cache simples, multithread, sem persistência e sem replicação. Particiona dados entre nós via sharding no lado do cliente. Escolha quando o caso de uso é cache puro e simples, sem necessidade de alta disponibilidade nem estruturas avançadas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Redis\",\"Memcached\"],[\"Persistência em disco\",\"Sim\",\"Não\"],[\"Replicação e failover\",\"Sim, Multi-AZ\",\"Não\"],[\"Estruturas de dados\",\"Múltiplas (listas, sets, hashes)\",\"Somente strings simples\"],[\"Pub/Sub\",\"Sim\",\"Não\"],[\"Multithreaded\",\"Não\",\"Sim\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Padrao lazy loading (cache-aside)\n\n  Aplicacao --1. consulta cache--> [ ElastiCache ]\n     |                                 |\n     |                          2. cache miss (dado nao encontrado)\n     v\n  [ Amazon RDS / Aurora ] --3. busca o dado--> Aplicacao\n     |\n     4. aplicacao grava o resultado no ElastiCache para as proximas leituras"
                    },
                    {
                        "type": "text",
                        "value": "## Amazon Redshift: data warehouse\n\n- Voltado para **OLAP**: consultas analíticas complexas sobre grandes volumes de dados históricos, não para transações do dia a dia (OLTP).\n- Armazenamento **colunar** e processamento **paralelo massivo (MPP)**, otimizado para agregações em bilhões de linhas.\n- **Redshift Spectrum** consulta dados diretamente no Amazon S3 via SQL, sem precisar carregá-los antes no cluster.\n- Uso típico: consolidar dados de várias fontes para dashboards de BI, relatórios gerenciais e análises históricas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de carga de trabalho\",\"Serviço recomendado\"],[\"Transacional relacional (OLTP)\",\"Amazon RDS ou Aurora\"],[\"Chave-valor ou documento em grande escala\",\"Amazon DynamoDB\"],[\"Cache de microssegundos, sessão, leaderboard\",\"Amazon ElastiCache\"],[\"Data warehouse e análises (OLAP)\",\"Amazon Redshift\"],[\"Relacionamentos complexos entre entidades (grafo)\",\"Amazon Neptune\"],[\"Séries temporais (métricas, IoT)\",\"Amazon Timestream\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta certa nunca é qual banco de dados eu conheço melhor, e sim qual é o padrão de acesso aos dados: transacional, chave-valor, cache, analítico, grafo ou série temporal decidem o serviço."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação consulta repetidamente os mesmos dados em um banco relacional, gerando carga desnecessária. A equipe quer um cache em memória gerenciado na frente do banco para reduzir a latência dessas leituras. Qual serviço atende essa necessidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon ElastiCache na frente do banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Redshift na frente do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS Proxy na frente do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "DynamoDB Accelerator (DAX) na frente do banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um jogo online mantém um ranking (leaderboard) que precisa de estruturas ordenadas em memória, sobrevivência a reinicializações do nó principal e failover automático caso o nó falhe. Qual opção do ElastiCache atende esses requisitos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ElastiCache para Redis com Multi-AZ",
                                "isCorrect": true
                            },
                            {
                                "text": "ElastiCache para Memcached com sharding",
                                "isCorrect": false
                            },
                            {
                                "text": "ElastiCache para Memcached com Multi-AZ",
                                "isCorrect": false
                            },
                            {
                                "text": "ElastiCache para Redis sem replicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de dados precisa consolidar informações de várias fontes para rodar consultas analíticas complexas sobre bilhões de linhas históricas, alimentando dashboards de BI. Qual serviço foi desenhado especificamente para essa carga de trabalho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon DynamoDB",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Aurora",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Redshift",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon ElastiCache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa apenas armazenar objetos simples em cache, sem necessidade de persistência ou failover, e quer aproveitar múltiplas threads por nó para maximizar o uso de CPU em cada instância de cache. Qual opção é a mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ElastiCache para Memcached, multithread e simples",
                                "isCorrect": true
                            },
                            {
                                "text": "ElastiCache para Redis com réplicas de leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "DynamoDB Accelerator (DAX) usado como cache",
                                "isCorrect": false
                            },
                            {
                                "text": "ElastiCache para Redis com cluster mode ativado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fábrica coleta bilhões de leituras de sensores IoT ao longo do tempo e precisa de um banco otimizado para armazenar e consultar séries temporais, com funções nativas de agregação por intervalo de tempo. Qual serviço é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon DynamoDB",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Redshift",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Timestream",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon Neptune",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 10 - Mensageria e desacoplamento",
        "aulas": [
            {
                "titulo": "Amazon SQS: standard, FIFO e padrões de fila",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon SQS: standard, FIFO e padrões de fila\n\nO Amazon SQS (Simple Queue Service) é o serviço gerenciado de filas da AWS, usado para desacoplar produtores e consumidores em uma arquitetura distribuída. Em vez de um serviço chamar o outro diretamente (acoplamento síncrono), o produtor publica mensagens na fila e o consumidor as processa no próprio ritmo. Isso absorve picos de carga, evita que uma falha no consumidor derrube o produtor e permite escalar cada lado de forma independente."
                    },
                    {
                        "type": "text",
                        "value": "## Fila standard vs fila FIFO\n\nA fila **standard** oferece taxa de transferência praticamente ilimitada, mas com duas características importantes para a prova:\n- Entrega **at-least-once**: em raras situações uma mensagem pode ser entregue mais de uma vez, então o consumidor deve ser idempotente.\n- **Ordem não garantida**: mensagens podem chegar fora da ordem de envio.\n\nA fila **FIFO** (First-In-First-Out) garante ordem estrita dentro de um mesmo `MessageGroupId` e oferece deduplicação (por `MessageDeduplicationId` ou por hash do conteúdo). O throughput chega a até 3.000 mensagens por segundo por API com lotes (batching), ou 300 por segundo sem lotes. Use FIFO quando a ordem dos eventos importa e standard quando o volume é mais importante que a ordem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Standard\",\"FIFO\"],[\"Ordem\",\"Não garantida\",\"Garantida por grupo (MessageGroupId)\"],[\"Entrega\",\"At-least-once (pode duplicar)\",\"Exactly-once, com deduplicação\"],[\"Throughput\",\"Praticamente ilimitado\",\"Até 3.000 msg/s com lotes\"],[\"Nome da fila\",\"Qualquer nome\",\"Deve terminar em .fifo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Visibility timeout e dead-letter queue\n\nQuando um consumidor recebe (`ReceiveMessage`) uma mensagem, ela não é removida da fila: ela fica **invisível** para outros consumidores durante o **visibility timeout** (padrão 30 segundos). Se o consumidor processar e chamar `DeleteMessage` dentro desse período, a mensagem é removida definitivamente. Se o tempo expirar sem confirmação, a mensagem volta a ficar visível e pode ser entregue novamente. Para processamentos longos, o consumidor pode estender o timeout com `ChangeMessageVisibility`.\n\nA **dead-letter queue (DLQ)** é outra fila SQS configurada em uma política de redirecionamento (redrive policy) para receber mensagens que falharam repetidamente, após `maxReceiveCount` tentativas. Isso evita que uma mensagem problemática fique sendo reprocessada para sempre e permite investigar falhas isoladamente."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"deadLetterTargetArn\": \"arn:aws:sqs:us-east-1:111122223333:pedidos-dlq\",\n  \"maxReceiveCount\": 5\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Long polling e escalabilidade\n\nPor padrão, o SQS usa **short polling**: o `ReceiveMessage` responde imediatamente, mesmo sem mensagens disponíveis. O **long polling** (parâmetro `WaitTimeSeconds`, até 20 segundos) faz a chamada aguardar até uma mensagem chegar ou o tempo expirar, reduzindo chamadas vazias, custo e latência percebida.\n\nComo o consumidor lê no próprio ritmo, é comum escalar o número de consumidores (por exemplo, o tamanho de um Auto Scaling Group) com base na métrica `ApproximateNumberOfMessagesVisible` do CloudWatch: fila crescendo, mais instâncias; fila esvaziando, menos instâncias. Esse padrão de escalar por profundidade de fila é um dos exemplos mais cobrados de desacoplamento na prova."
                    },
                    {
                        "type": "quote",
                        "value": "Desacoplar produtor e consumidor com uma fila SQS significa que cada lado escala, falha e se recupera de forma independente, sem que um pico ou uma queda derrube o outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe está desenhando um sistema de processamento de pedidos e escolheu uma fila Amazon SQS standard para desacoplar o serviço de checkout do serviço de faturamento. Qual comportamento a equipe deve considerar ao implementar o consumidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A fila entrega as mensagens sempre na mesma ordem em que foram enviadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mensagem pode chegar duplicada e o consumidor deve ser idempotente.",
                                "isCorrect": true
                            },
                            {
                                "text": "A mensagem é apagada da fila automaticamente assim que um consumidor a lê.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fila bloqueia o envio de novas mensagens enquanto uma está sendo processada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema bancário precisa processar transações de débito e crédito de uma mesma conta rigorosamente na ordem em que ocorreram, sem duplicar nenhuma transação. Qual configuração de fila SQS atende a esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fila standard, com um consumidor único processando uma mensagem por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fila FIFO, com um MessageGroupId diferente para cada transação enviada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fila standard, configurando um visibility timeout bem mais longo que o normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fila FIFO, usando o mesmo MessageGroupId para as transações da mesma conta.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor do Amazon SQS demora, em média, 5 minutos para processar cada mensagem, mas o visibility timeout da fila está configurado com o valor padrão de 30 segundos. Qual é a consequência mais provável e a ação correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A mensagem volta a ficar visível e pode ser entregue de novo; o ideal é estender o visibility timeout.",
                                "isCorrect": true
                            },
                            {
                                "text": "A fila descarta a mensagem após 30 segundos sem confirmação; o ideal é reduzir o tempo de processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SQS pausa a contagem do timeout enquanto a mensagem está sendo processada, então nada precisa ser feito.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mensagem é enviada direto para a dead-letter queue após 30 segundos; o ideal é desativar a DLQ.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mensagens malformadas estão sendo processadas, falhando e voltando para a fila repetidamente, consumindo capacidade dos workers sem nunca serem concluídas. Qual configuração resolve esse problema de forma nativa no SQS?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o visibility timeout da fila para liberar as mensagens mais rapidamente para reprocessamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a fila standard por uma fila FIFO para eliminar as falhas de processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar uma dead-letter queue com maxReceiveCount, isolando mensagens após várias falhas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de consumidores para processar as mensagens malformadas mais rapidamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquitetura usa uma fila Amazon SQS entre um serviço produtor e um Auto Scaling Group de workers. Durante picos de tráfego, a fila cresce rapidamente e demora para esvaziar. Qual ajuste melhora a escalabilidade dessa arquitetura sem mudar o serviço produtor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o visibility timeout da fila para que as mensagens sejam reprocessadas mais vezes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma política de Auto Scaling com base na métrica de mensagens visíveis na fila.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o long polling por short polling para os workers responderem mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminuir o tamanho máximo das mensagens aceitas pela fila para acelerar o consumo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon SNS e arquiteturas fan-out",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon SNS e arquiteturas fan-out\n\nO Amazon SNS (Simple Notification Service) é o serviço de publicação/assinatura (pub/sub) da AWS. Um produtor publica uma mensagem em um **tópico** e o SNS entrega uma cópia para **todos os assinantes** daquele tópico, de forma quase imediata (push). Isso é diferente do modelo de fila do SQS, onde a mensagem é consumida por um único leitor por vez."
                    },
                    {
                        "type": "text",
                        "value": "## Tópicos, assinantes e tipos de entrega\n\nUm tópico SNS pode ter assinantes de vários tipos: filas Amazon SQS, funções AWS Lambda, endpoints HTTP/HTTPS, e-mail, SMS e push mobile. Cada assinante recebe sua própria cópia da mensagem publicada. Como a entrega é por push, não existe polling: o SNS empurra a mensagem assim que ela é publicada, o que garante baixa latência, mas exige que o assinante esteja pronto para receber (ou, no caso de Lambda e SQS, que a integração absorva picos)."
                    },
                    {
                        "type": "text",
                        "value": "## Padrão fan-out: um evento, vários consumidores\n\nO padrão mais cobrado na prova é o **fan-out SNS para SQS**: o produtor publica uma única vez no tópico SNS, e o SNS replica a mensagem para várias filas SQS inscritas, cada uma alimentando um sistema diferente (por exemplo, faturamento, análise de fraude e notificação ao cliente, todos a partir do mesmo evento de pedido). Colocar uma fila SQS entre o tópico e cada consumidor final adiciona durabilidade e buffering: se um consumidor cair, as mensagens continuam acumuladas na fila em vez de se perderem, como poderia ocorrer com um assinante HTTP direto."
                    },
                    {
                        "type": "code",
                        "value": "Produtor\n  |\n  v\nTopico SNS (pedidos-criados)\n  |------------------|------------------|\n  v                  v                  v\nFila SQS         Fila SQS           Fila SQS\n(faturamento)    (fraude)           (notificacao)\n  |                  |                  |\n  v                  v                  v\nWorker A          Worker B           Worker C"
                    },
                    {
                        "type": "text",
                        "value": "## Filtros de mensagem (subscription filter policy)\n\nSem filtros, todo assinante recebe todas as mensagens do tópico. Uma **filter policy** aplicada na assinatura permite que cada assinante receba só as mensagens cujos atributos (message attributes) casem com o filtro, por exemplo, `\"tipo\": [\"cancelamento\"]`. Isso evita que cada consumidor tenha que filtrar mensagens irrelevantes no próprio código e reduz custo, já que menos mensagens chegam a filas e funções que não precisam delas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Amazon SNS\",\"Amazon SQS\"],[\"Modelo\",\"Pub/sub (push)\",\"Fila (pull)\"],[\"Consumidores por mensagem\",\"Múltiplos (todos os assinantes)\",\"Um único consumidor processa cada mensagem\"],[\"Retenção\",\"Não armazena após a entrega\",\"Retém até a mensagem ser processada ou expirar\"],[\"Uso típico\",\"Notificar vários sistemas de um evento\",\"Desacoplar produtor e consumidor com buffer\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No padrão fan-out, o produtor publica um evento uma única vez, e é o SNS quem se encarrega de multiplicá-lo para todos os sistemas interessados, cada um no seu próprio ritmo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação precisa que um único evento de 'pedido criado' seja processado, ao mesmo tempo, pelos times de faturamento, de fraude e de notificação, cada um com seu próprio sistema. Qual serviço é o mais adequado para publicar esse evento uma vez e distribuí-lo para múltiplos consumidores?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon SQS, criando uma única fila compartilhada entre os três times.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS, gravando o evento em uma tabela consultada pelos três times.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Lambda, invocando diretamente uma função para cada time a partir do produtor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SNS, publicando o evento em um tópico com um assinante para cada time.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquitetura publica eventos em um tópico SNS com três assinantes HTTP diretos. Quando um dos endpoints fica fora do ar por alguns minutos, os eventos publicados nesse intervalo são perdidos para aquele assinante. Qual mudança resolve esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Inserir uma fila SQS entre o tópico e o endpoint, para que as mensagens fiquem em buffer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o número de assinantes do tópico para diminuir a chance de indisponibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o timeout de entrega do SNS para o endpoint ficar mais tolerante a falhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o tópico SNS para uma fila FIFO, garantindo a entrega ordenada dos eventos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico SNS publica todos os eventos de pedidos, mas um dos assinantes só precisa processar pedidos com status de cancelamento, ignorando os demais. Qual recurso evita que esse assinante receba e descarte mensagens irrelevantes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um visibility timeout maior na fila SQS associada a esse assinante específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma fila FIFO no lugar do tópico SNS, agrupando pedidos pelo status de cancelamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma filter policy na assinatura, filtrando pelo atributo de status do pedido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um segundo tópico SNS que replica automaticamente só os eventos de cancelamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de imagens precisa destas etapas ao receber uma nova foto: gerar miniaturas, rodar moderação de conteúdo e atualizar um índice de busca, todas de forma independente e sem que uma etapa lenta atrase as outras. Qual arquitetura de mensageria atende melhor a esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Publicar o evento em uma única fila SQS standard, lida em sequência pelas três etapas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar o evento em um tópico SNS com uma fila SQS dedicada para cada uma das três etapas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Publicar o evento em uma fila SQS FIFO, com um MessageGroupId para cada etapa do processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Invocar diretamente as três funções Lambda de forma síncrona a partir do serviço que recebe a foto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao comparar Amazon SNS e Amazon SQS, qual afirmação descreve corretamente uma diferença fundamental entre os dois serviços?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O SNS garante ordem estrita de entrega, enquanto o SQS nunca preserva a ordem das mensagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SNS armazena mensagens por até 14 dias, enquanto o SQS descarta mensagens não lidas imediatamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SNS só aceita um assinante por tópico, enquanto o SQS permite múltiplos consumidores simultâneos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SNS entrega mensagens por push a cada assinante; o SQS depende de consumidores que buscam na fila.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon EventBridge e arquitetura orientada a eventos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon EventBridge e arquitetura orientada a eventos\n\nO Amazon EventBridge é um barramento de eventos (event bus) serverless que conecta produtores e consumidores de eventos sem que um precise conhecer o outro. Serviços da AWS, aplicações próprias e até SaaS de terceiros publicam eventos no barramento, e regras decidem para onde cada evento deve ir. É a peça central de arquiteturas orientadas a eventos (event-driven) na AWS."
                    },
                    {
                        "type": "text",
                        "value": "## Barramento de eventos, regras e padrões\n\nTodo evento chega a um **event bus** (o `default`, criado automaticamente e usado pelos serviços da AWS, ou um bus customizado criado para eventos da própria aplicação). Uma **rule** (regra) define um **event pattern**: uma estrutura que casa com o formato do evento (origem, tipo de detalhe, campos específicos). Quando um evento bate com o padrão de uma regra, o EventBridge o envia para um ou mais **targets**: uma função Lambda, uma fila SQS, uma máquina de estados do Step Functions, um tópico SNS, entre outros."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"source\": [\"app.pedidos\"],\n  \"detail-type\": [\"PedidoCriado\"],\n  \"detail\": {\n    \"valor\": [{\"numeric\": [\">\", 1000]}]\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Schedules: eventos baseados em tempo\n\nAlém de reagir a eventos, o EventBridge também dispara alvos em horários definidos, usando expressões `rate` (por exemplo, `rate(5 minutes)`) ou `cron`, substituindo o antigo uso do CloudWatch Events para tarefas agendadas. O EventBridge Scheduler estende esse recurso para uma escala muito maior de agendamentos individuais, cada um com seu próprio horário, sem precisar de uma regra por agendamento."
                    },
                    {
                        "type": "text",
                        "value": "## Integração com SaaS e múltiplos targets\n\nO EventBridge tem parceiros SaaS (como Zendesk, Datadog e Shopify) que publicam eventos diretamente em um **partner event bus**, permitindo reagir a mudanças em sistemas de terceiros sem escrever integração customizada. Uma única regra também pode ter vários targets ao mesmo tempo, e cada target pode ter um **input transformer** para reformatar o evento antes de entregá-lo, tudo sem código adicional no produtor do evento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Amazon EventBridge\",\"Amazon SNS\"],[\"Roteamento\",\"Por padrão de conteúdo do evento (event pattern)\",\"Por assinatura no tópico, com filtro opcional\"],[\"Origem dos eventos\",\"Serviços AWS, apps próprias e SaaS parceiro\",\"Publicador da aplicação\"],[\"Agendamento nativo\",\"Sim, com rate e cron\",\"Não\"],[\"Formato do evento\",\"JSON estruturado com schema\",\"Mensagem com atributos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Em vez de o produtor saber quem consome o evento, ele apenas publica no barramento; são as regras do EventBridge que decidem, com base no conteúdo do evento, para onde cada um deve seguir."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe quer que múltiplos serviços reajam automaticamente a eventos gerados tanto por serviços da AWS quanto por uma aplicação de SaaS parceira, sem que a aplicação precise conhecer quem vai consumir cada evento. Qual serviço foi desenhado especificamente para esse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon EventBridge, roteando eventos por meio de regras baseadas em padrões de conteúdo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon SQS, com uma fila dedicada para cada serviço que precisa reagir aos eventos.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Step Functions, orquestrando diretamente a chamada de cada serviço consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS, armazenando os eventos em uma tabela consultada pelos serviços interessados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma regra do EventBridge deve disparar uma função Lambda somente quando o evento tiver origem 'app.pedidos', tipo de detalhe 'PedidoCriado' e o campo valor maior que 1000. Qual recurso do EventBridge implementa exatamente essa condição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma filter policy na assinatura de um tópico SNS associado à regra do EventBridge.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um visibility timeout configurado na fila SQS que recebe o evento antes da Lambda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um event pattern na regra, combinando source, detail-type e filtro no campo valor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma condição SQL definida diretamente na configuração de trigger da função Lambda.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa executar uma função Lambda de limpeza de dados temporários todos os dias às 3h da manhã, sem manter nenhum servidor rodando apenas para disparar essa tarefa. Qual abordagem é a mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma fila SQS FIFO que libera a mensagem de disparo exatamente às 3h da manhã.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma regra do EventBridge com expressão cron, usando a Lambda como target.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar um tópico SNS que publica automaticamente uma mensagem diária às 3h.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar a função Lambda em long polling contínuo, aguardando o horário programado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer que eventos de diferentes contas AWS e de um SaaS de suporte ao cliente sejam roteados para times diferentes com base no conteúdo do evento, sem que cada time precise implementar lógica de filtro no próprio código. Qual serviço atende melhor a esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Amazon SNS, criando um tópico separado manualmente para cada combinação de conta e evento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SQS, com uma fila FIFO por time e um MessageGroupId para identificar a origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Step Functions, com uma máquina de estados avaliando o conteúdo de cada evento recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EventBridge, usando regras com event patterns para rotear conforme o conteúdo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica distingue o Amazon EventBridge do Amazon SNS em uma arquitetura orientada a eventos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O EventBridge roteia por padrões de conteúdo definidos em regras e tem agendamento nativo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O EventBridge só entrega eventos para filas SQS, nunca diretamente para funções Lambda.",
                                "isCorrect": false
                            },
                            {
                                "text": "O EventBridge exige que o produtor conheça previamente todos os consumidores do evento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O EventBridge armazena cada evento indefinidamente até que um consumidor o processe.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amazon Kinesis: Data Streams e Firehose",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon Kinesis: Data Streams e Firehose\n\nA família Kinesis é voltada para ingestão e processamento de dados em fluxo contínuo (streaming), como cliques em um site, logs de aplicação ou leituras de sensores IoT, em volumes muito maiores do que o padrão de mensageria tradicional. Os dois serviços mais cobrados na prova são o Kinesis Data Streams e o Kinesis Data Firehose, que resolvem problemas diferentes dentro desse mesmo domínio."
                    },
                    {
                        "type": "text",
                        "value": "## Kinesis Data Streams: shards, retenção e múltiplos consumidores\n\nUm stream é dividido em **shards**, e cada shard define a capacidade: até 1 MB/s ou 1.000 registros/s de escrita, e até 2 MB/s de leitura no modo clássico. Para aumentar a capacidade, basta adicionar shards (resharding). Os registros ficam retidos no stream por padrão 24 horas, configurável até 365 dias, o que permite reprocessar dados históricos.\n\nA diferença mais cobrada em relação ao SQS: no Kinesis, **vários consumidores independentes podem ler o mesmo stream do início ao fim**, cada um na sua própria posição, sem que a leitura de um remova o dado para os demais. Dentro de um shard, os registros mantêm a ordem de chegada com base na partition key."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Kinesis Data Streams\",\"Kinesis Data Firehose\"],[\"Latência\",\"Tempo real (milissegundos)\",\"Near real-time (buffer de segundos a minutos)\"],[\"Consumidores\",\"Múltiplos, cada um lendo de forma independente\",\"Entrega automática a um destino gerenciado\"],[\"Gerenciamento de capacidade\",\"Você provisiona e ajusta shards\",\"Totalmente gerenciado, sem shards\"],[\"Destino típico\",\"Aplicações customizadas (KCL, Lambda)\",\"Amazon S3, Redshift, OpenSearch\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Kinesis Data Firehose: entrega gerenciada\n\nO Firehose recebe os registros e os entrega automaticamente a um destino como Amazon S3, Amazon Redshift, Amazon OpenSearch Service ou um endpoint HTTP de terceiro, sem que você gerencie shards ou escreva código de consumo. Ele agrupa os registros em buffers, por tamanho ou por tempo (o que ocorrer primeiro), e pode transformar cada registro no meio do caminho com uma função Lambda, por exemplo, para converter formato ou enriquecer dados antes de gravar no destino final."
                    },
                    {
                        "type": "code",
                        "value": "Produtores (apps, sensores, logs)\n        |\n        v\nKinesis Data Streams (shards)\n        |-----------------------|\n        v                       v\nAplicacao de analytics    Kinesis Data Firehose\n(consumo em tempo real)          |\n                                  v\n                             Amazon S3 / Redshift"
                    },
                    {
                        "type": "text",
                        "value": "## Kinesis vs SQS: quando usar cada um\n\nUse **Kinesis** quando o requisito é processar um grande volume de dados em fluxo contínuo, com múltiplos consumidores lendo o mesmo dado de forma independente e, possivelmente, reprocessando o histórico (analytics em tempo real, agregações, dashboards). Use **SQS** quando o requisito é uma fila de trabalho clássica, onde cada mensagem representa uma tarefa que deve ser processada uma única vez por um consumidor entre um grupo (desacoplamento de um processo de negócio)."
                    },
                    {
                        "type": "quote",
                        "value": "Enquanto o SQS distribui cada mensagem para um único consumidor processar uma tarefa, o Kinesis Data Streams permite que vários consumidores leiam o mesmo fluxo de dados de forma independente, cada um no seu próprio ritmo e posição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa precisa que um mesmo fluxo de eventos de cliques em um site seja lido, de forma independente e simultânea, por uma aplicação de analytics em tempo real e por um serviço de detecção de fraude, cada um mantendo sua própria posição de leitura. Qual serviço atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon SQS standard, com os dois serviços lendo mensagens da mesma fila compartilhada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SNS, publicando o evento diretamente para os dois serviços por push, sem fila intermediária.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Kinesis Data Streams, com múltiplos consumidores lendo o stream de forma independente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon SQS FIFO, com um MessageGroupId específico para cada um dos dois serviços consumidores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um stream do Kinesis Data Streams está recebendo mais dados do que a capacidade atual suporta, causando throttling nas escritas dos produtores. Qual ação resolve diretamente esse problema de capacidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o período de retenção do stream de 24 horas para 365 dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de shards do stream, distribuindo a carga de escrita entre eles.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o Kinesis Data Streams por um Kinesis Data Firehose com o mesmo throughput.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de consumidores que estão lendo o stream simultaneamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa gravar continuamente logs de aplicação no Amazon S3, em formato convertido para Parquet, sem escrever ou operar nenhum código de consumo próprio. Qual serviço é o mais adequado para essa entrega?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon Kinesis Data Streams, com uma aplicação KCL própria escrevendo os logs no S3.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SQS, com um worker consumindo a fila e gravando os arquivos convertidos no S3.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SNS, publicando diretamente cada log como um objeto no bucket S3 de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Kinesis Data Firehose, com uma transformação Lambda e entrega gerenciada ao S3.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação envia eventos de atualização de estoque para o Kinesis Data Streams, usando o ID do produto como partition key. Um mesmo produto tem suas atualizações indo sempre para o mesmo shard. Qual é a implicação direta dessa escolha de partition key?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As atualizações do mesmo produto mantêm a ordem de chegada no shard correspondente.",
                                "isCorrect": true
                            },
                            {
                                "text": "As atualizações de um mesmo produto são automaticamente deduplicadas pelo Kinesis.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kinesis distribui as atualizações do mesmo produto entre todos os shards do stream.",
                                "isCorrect": false
                            },
                            {
                                "text": "As atualizações de um mesmo produto expiram do stream antes das de outros produtos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de arquitetura está decidindo entre Amazon Kinesis Data Streams e Amazon SQS para uma nova integração. O requisito central é que cada tarefa gerada seja processada uma única vez por um worker dentro de um grupo, sem necessidade de replay histórico. Qual serviço se encaixa melhor nesse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon Kinesis Data Streams, pois cada shard garante processamento único por consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Kinesis Data Streams, configurando um único consumidor para evitar leituras duplicadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SQS, já que o modelo de fila entrega cada mensagem a um único consumidor por vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon SQS, desde que o período de retenção seja configurado para 365 dias no lugar de 4.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "AWS Step Functions e orquestração",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# AWS Step Functions e orquestração\n\nO AWS Step Functions coordena múltiplas etapas de um processo (funções Lambda, tarefas do ECS, chamadas de API de outros serviços da AWS) como uma **máquina de estados** visual. Em vez de uma função Lambda chamar a próxima diretamente e ter que tratar erro, retry e estado de cada etapa no próprio código, o Step Functions centraliza esse fluxo, o que facilita observar, depurar e evoluir processos de negócio com múltiplas etapas."
                    },
                    {
                        "type": "text",
                        "value": "## Máquina de estados: states, tasks e transições\n\nUma máquina de estados é definida em JSON usando a Amazon States Language (ASL). Cada etapa é um **state**, e os tipos mais comuns são: `Task` (executa um trabalho, como invocar uma Lambda), `Choice` (decide o próximo state com base em uma condição), `Parallel` (executa ramos em paralelo), `Map` (aplica o mesmo processamento a cada item de uma coleção) e `Wait` (pausa por um tempo ou até uma data). O console do Step Functions desenha esse fluxo visualmente, o que ajuda a identificar em qual etapa exata uma execução falhou."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"StartAt\": \"ProcessarPagamento\",\n  \"States\": {\n    \"ProcessarPagamento\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:lambda:us-east-1:111122223333:function:processarPagamento\",\n      \"Retry\": [\n        { \"ErrorEquals\": [\"States.TaskFailed\"], \"MaxAttempts\": 3 }\n      ],\n      \"Catch\": [\n        { \"ErrorEquals\": [\"States.ALL\"], \"Next\": \"TratarFalha\" }\n      ],\n      \"Next\": \"ConfirmarPedido\"\n    },\n    \"ConfirmarPedido\": { \"Type\": \"Task\", \"End\": true },\n    \"TratarFalha\": { \"Type\": \"Task\", \"End\": true }\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Standard vs Express Workflows\n\nO Step Functions oferece dois tipos de fluxo de trabalho. **Standard** é voltado para processos de longa duração (até 1 ano), com execução exactly-once e histórico de execução detalhado, ideal para orquestrar processos de negócio auditáveis, como processamento de pedidos ou aprovações. **Express** é voltado para alto volume de eventos de curta duração (até 5 minutos), com execução at-least-once e cobrança por número de execuções, duração e memória, ideal para processar dados de streaming ou IoT em grande escala."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Standard\",\"Express\"],[\"Duração máxima\",\"Até 1 ano\",\"Até 5 minutos\"],[\"Semântica de execução\",\"Exactly-once\",\"At-least-once\"],[\"Volume de execuções\",\"Até milhares por segundo\",\"Mais de 100.000 por segundo\"],[\"Cobrança\",\"Por transição de estado\",\"Por execução, duração e memória\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tratamento de erros e orquestração vs coreografia\n\nCada `Task` da máquina de estados pode declarar `Retry` (nova tentativa automática, com backoff configurável) e `Catch` (redirecionar para um state de tratamento de erro), sem precisar desse código espalhado em cada função Lambda. Essa é a essência da **orquestração**: um coordenador central (o Step Functions) sabe o estado completo do processo e decide o que acontece a seguir.\n\nIsso contrasta com a **coreografia**, onde cada serviço reage de forma independente a eventos (por exemplo, publicados no EventBridge), sem que exista um coordenador central. Coreografia tende a ser mais desacoplada, mas dificulta enxergar o estado geral de um processo de ponta a ponta; orquestração centraliza a visibilidade e o controle, ao custo de um acoplamento maior ao fluxo definido na máquina de estados."
                    },
                    {
                        "type": "quote",
                        "value": "Orquestração é ter um maestro que sabe a partitura inteira e diz a cada instrumento quando entrar; coreografia é cada músico reagir ao que ouve dos outros, sem ninguém regendo o conjunto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um processo de aprovação de crédito envolve quatro etapas em sequência, cada uma implementada como uma função Lambda diferente, com necessidade de retry automático e visibilidade clara de em qual etapa uma execução parou. Qual serviço é o mais adequado para coordenar esse fluxo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon SQS, encadeando quatro filas onde a saída de uma alimenta a entrada da próxima.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Step Functions, definindo o fluxo como uma máquina de estados com retry e Catch.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon SNS, publicando em um tópico com uma assinatura para cada uma das quatro etapas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EventBridge, com uma regra separada disparando cada uma das quatro funções Lambda.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma seguradora precisa orquestrar um processo de análise de sinistro que pode levar até 20 dias, exige rastreabilidade completa de cada etapa para fins de auditoria e não pode processar a mesma etapa duas vezes. Qual tipo de fluxo de trabalho do Step Functions atende a esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Express Workflow, com duração de até 5 minutos e execução at-least-once.",
                                "isCorrect": false
                            },
                            {
                                "text": "Standard Workflow, configurando a execução para se repetir automaticamente a cada 20 dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Express Workflow, aumentando manualmente o limite de duração para 20 dias corridos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Standard Workflow, já que oferece duração de até 1 ano e execução exactly-once.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma de IoT precisa processar milhões de eventos curtos por dia, cada execução durando poucos segundos, com foco em alto throughput e custo proporcional ao volume processado. Qual tipo de fluxo de trabalho do Step Functions é o mais indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Express Workflow, adequado a alto volume de execuções curtas e cobrança por execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Standard Workflow, adequado a alto volume de execuções curtas com cobrança fixa mensal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Express Workflow, configurado com duração estendida para até 1 ano por execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Standard Workflow, já que garante exactly-once para cada evento processado pela IoT.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquitetura de microsserviços hoje usa EventBridge para que cada serviço reaja de forma independente aos eventos de que precisa, mas o time está tendo dificuldade de visualizar o estado completo de um pedido do início ao fim, e de garantir que erros em uma etapa sejam tratados de forma consistente. Qual mudança de abordagem resolve esse problema, aceitando maior acoplamento ao fluxo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adicionar mais regras do EventBridge, uma para cada novo tipo de erro que pode ocorrer no processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o EventBridge por tópicos SNS com fan-out para SQS em cada etapa do processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o fluxo principal para orquestração com Step Functions, centralizando estado e erro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o visibility timeout das filas SQS usadas pelos serviços que consomem os eventos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma máquina de estados do Step Functions, uma Task que invoca uma Lambda volta e meia falha por throttling temporário do serviço downstream, mas quase sempre funciona numa nova tentativa poucos segundos depois. Qual configuração resolve isso sem código adicional na Lambda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adicionar um campo Catch na Task, redirecionando toda falha direto para um state de erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um campo Retry na Task, com backoff, para tentar novamente antes de falhar de vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a memória alocada da função Lambda para reduzir a chance de throttling ocorrer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o tipo de execução da máquina de estados de Standard para Express Workflow.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 11 - Alta disponibilidade e disaster recovery",
        "aulas": [
            {
                "titulo": "Projetando para alta disponibilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Projetando para alta disponibilidade\n\nAlta disponibilidade (HA) é a capacidade de um sistema continuar operando, com o mínimo de interrupção, mesmo quando componentes individuais falham. Na AWS, a unidade básica de isolamento de falhas é a **Availability Zone (AZ)**: cada AZ tem energia, refrigeração e rede independentes dentro de uma região.\n\nProjetar para HA significa distribuir cada camada da aplicação por múltiplas AZs, de forma que a falha de uma única AZ não derrube o sistema."
                    },
                    {
                        "type": "text",
                        "value": "## Multi-AZ em cada camada\n\nUma arquitetura verdadeiramente HA aplica redundância em **todas** as camadas, não só na computação:\n\n- **Camada de borda**: o Elastic Load Balancing (ALB/NLB) é nativamente regional e distribui tráfego entre AZs.\n- **Camada de computação**: um Auto Scaling Group configurado com subnets em pelo menos duas AZs substitui instâncias que falham e redistribui a capacidade.\n- **Camada de banco de dados**: o Amazon RDS Multi-AZ mantém uma instância standby síncrona em outra AZ, com failover automático.\n- **Camada de armazenamento**: o Amazon S3 replica objetos entre AZs da região automaticamente; volumes EBS podem ser protegidos com snapshots incrementais armazenados no S3."
                    },
                    {
                        "type": "code",
                        "value": "Região us-east-1\n|\n+-- AZ us-east-1a\n|     +-- ALB (target)\n|     +-- EC2 (ASG) ---- RDS Primary\n|\n+-- AZ us-east-1b\n      +-- ALB (target)\n      +-- EC2 (ASG) ---- RDS Standby (replicação síncrona)\n\nCliente -> Route 53 -> ALB (multi-AZ) -> ASG (multi-AZ) -> RDS Multi-AZ (failover automático)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Mecanismo de HA\",\"Protege contra\"],[\"Borda/roteamento\",\"Elastic Load Balancing multi-AZ\",\"Falha de uma AZ inteira\"],[\"Computação\",\"Auto Scaling Group em várias subnets\",\"Falha de instância ou de AZ\"],[\"Banco relacional\",\"RDS Multi-AZ (standby síncrono)\",\"Falha da instância de banco ou da AZ\"],[\"Objetos\",\"Replicação automática do S3 entre AZs\",\"Perda de disco ou de AZ\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Eliminando pontos únicos de falha (SPOF)\n\nUm ponto único de falha (SPOF) é qualquer componente cuja perda derruba o sistema inteiro. Os mais comuns em arquiteturas AWS:\n\n- Uma única instância EC2 fora de um Auto Scaling Group.\n- Um único NAT Gateway compartilhado por subnets de várias AZs (se a AZ do NAT cair, as outras AZs perdem saída para a internet).\n- Um banco de dados sem Multi-AZ nem read replica.\n- Endereços IP fixos ou hostnames com valor fixo apontando para um único recurso.\n\nA correção geral é sempre a mesma: identificar o componente isolado e duplicá-lo em outra AZ, com um mecanismo de failover automático."
                    },
                    {
                        "type": "quote",
                        "value": "Alta disponibilidade não é sobre evitar falhas, é sobre garantir que nenhuma falha individual seja capaz de derrubar o sistema inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## Quando partir para multi-região\n\nMulti-AZ resolve a maioria dos requisitos de HA com baixa complexidade adicional, porque as AZs de uma região têm latência baixa entre si e os serviços gerenciados (RDS, ELB) já automatizam o failover. Considere ir para uma arquitetura **multi-região** quando:\n\n- Existe exigência regulatória de residência de dados ou de recuperação fora da região primária.\n- O RTO/RPO exigido pelo negócio não tolera a perda de uma região inteira (evento raro, mas possível).\n- A base de usuários é global e a latência de acesso a uma única região é inaceitável.\n\nO custo, a complexidade operacional (replicação de dados entre regiões, roteamento com Route 53) e o esforço de teste sobem bastante, então multi-região deve ser uma decisão deliberada, baseada em requisito de negócio, não um padrão default."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe distribui instâncias EC2 em subnets privadas de duas Availability Zones, mas todas as rotas dessas subnets apontam para um único NAT Gateway, criado em apenas uma das AZs. Qual é o risco dessa configuração?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se a AZ do NAT Gateway falhar, as instâncias saudáveis nas demais AZs perdem acesso à internet.",
                                "isCorrect": true
                            },
                            {
                                "text": "O NAT Gateway passa a limitar quantas instâncias EC2 podem ser lançadas na região.",
                                "isCorrect": false
                            },
                            {
                                "text": "As instâncias das subnets privadas passam a aceitar conexões de entrada vindas da internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tráfego entre as duas Availability Zones passa a ser cobrado em dobro pela AWS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa Amazon RDS para PostgreSQL. O time quer que, se a instância de banco primária falhar, o sistema faça failover automático para uma cópia em outra Availability Zone, sem intervenção manual. Qual recurso atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon RDS Read Replica, promovida manualmente pelo time sempre que a instância primária falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS Multi-AZ, com uma instância standby síncrona que assume automaticamente em caso de falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon RDS com backup automatizado, restaurado para uma nova instância a cada falha detectada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon RDS com um único volume EBS compartilhado entre duas instâncias em AZs diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação web roda em uma única instância EC2, sem Auto Scaling, e atende todo o tráfego de produção. Qual mudança reduz melhor o risco de indisponibilidade em caso de falha da instância ou da AZ onde ela está?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o tipo da instância EC2 para uma família com mais vCPU e memória disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o armazenamento da instância de volumes EBS para instance store, buscando mais performance.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar a aplicação em um Auto Scaling Group com subnets em duas AZs, atrás de um load balancer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar um Elastic IP fixo na instância para garantir que o endereço nunca mude.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa já opera com Multi-AZ em todas as camadas (ELB, Auto Scaling, RDS Multi-AZ) dentro de uma única região e atende usuários em um só continente. Não há exigência regulatória de dados fora da região. Qual cenário justificaria migrar para uma arquitetura multi-região mesmo assim?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O time quer reduzir o número de Availability Zones utilizadas para simplificar a operação diária.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo do Multi-AZ atual está mais alto do que o custo de uma segunda região completa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Auto Scaling Group precisa de mais de duas Availability Zones para funcionar corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O negócio decide que a perda de uma região inteira não pode deixar o serviço fora do ar.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto precisa justificar, para o time de compliance, por que os objetos armazenados no Amazon S3 continuam disponíveis mesmo se uma Availability Zone inteira da região ficar indisponível. Qual é a explicação correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O S3 mantém uma única cópia de cada objeto, mas em um datacenter fora de qualquer AZ da região.",
                                "isCorrect": false
                            },
                            {
                                "text": "O S3 replica automaticamente cada objeto entre múltiplas Availability Zones da região escolhida.",
                                "isCorrect": true
                            },
                            {
                                "text": "O S3 depende de o cliente configurar replicação entre AZs manualmente para cada bucket criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O S3 armazena os objetos apenas na AZ onde o bucket foi originalmente criado pelo usuário.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estratégias de disaster recovery",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estratégias de disaster recovery\n\nDisaster recovery (DR) é o conjunto de estratégias para retomar a operação após a perda de uma região inteira, uma falha catastrófica ou corrupção severa de dados. A AWS reconhece quatro estratégias clássicas, organizadas em um espectro: quanto menor o RTO (tempo de recuperação) e o RPO (perda de dados tolerada), maior o custo e a complexidade de manter o ambiente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"RTO típico\",\"Custo relativo\",\"Ideia central\"],[\"Backup and restore\",\"Horas\",\"Baixo\",\"Copiar dados e reconstruir a infraestrutura sob demanda\"],[\"Pilot light\",\"Dezenas de minutos\",\"Baixo a médio\",\"Núcleo mínimo sempre ligado, o resto escala no disparo\"],[\"Warm standby\",\"Minutos\",\"Médio a alto\",\"Cópia reduzida, porém funcional, sempre no ar\"],[\"Multi-site active-active\",\"Segundos\",\"Alto\",\"Capacidade plena em duas ou mais regiões ao mesmo tempo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Backup and restore\n\nÉ a estratégia mais barata e mais simples: dados são copiados regularmente (snapshots do EBS e do RDS, backups do DynamoDB, replicação do S3 entre regiões) para uma região de destino. Em caso de desastre, a infraestrutura de computação é provisionada do zero (via AMIs, templates do CloudFormation ou Auto Scaling) e os dados são restaurados.\n\nO RTO fica na casa das horas, porque envolve provisionar recursos e restaurar volumes grandes. É adequada para cargas de trabalho não críticas, onde uma interrupção de algumas horas é aceitável."
                    },
                    {
                        "type": "text",
                        "value": "## Pilot light\n\nNessa estratégia, o núcleo mais crítico do sistema, geralmente o banco de dados, fica sempre replicado e ativo na região de recuperação (por exemplo, uma read replica do RDS ou tabelas do DynamoDB com Global Tables), enquanto os componentes de computação (EC2, Auto Scaling) ficam definidos, mas desligados ou com capacidade mínima.\n\nQuando o desastre é declarado, a camada de aplicação é ligada e escalada rapidamente sobre os dados que já estão atualizados, reduzindo o RTO para dezenas de minutos."
                    },
                    {
                        "type": "text",
                        "value": "## Warm standby\n\nUma versão reduzida, porém totalmente funcional, do ambiente de produção roda continuamente na região de recuperação, atendendo pouco ou nenhum tráfego real. Em um desastre, o Auto Scaling aumenta a capacidade e o Route 53 redireciona o tráfego para essa região.\n\nComo a aplicação já está no ar e só precisa escalar, o RTO cai para minutos. O custo é maior que o do pilot light, porque há instâncias de aplicação rodando o tempo todo, mesmo que em escala reduzida."
                    },
                    {
                        "type": "text",
                        "value": "## Multi-site active-active\n\nDuas ou mais regiões operam em produção plena e simultaneamente, recebendo tráfego real o tempo todo (tipicamente via Route 53 com roteamento por latência ou peso, ou via AWS Global Accelerator). Se uma região falha, o tráfego é simplesmente redirecionado para as regiões restantes, sem etapa de ativação.\n\nÉ a estratégia com RTO e RPO mais próximos de zero, mas também a mais cara e a mais complexa de operar, porque exige replicação contínua e bidirecional de dados, além de testes constantes de consistência."
                    },
                    {
                        "type": "quote",
                        "value": "Não existe uma estratégia de disaster recovery única e correta: existe a que equilibra o RTO/RPO exigido pelo negócio com o custo que ele está disposto a pagar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual estratégia de disaster recovery tem o menor custo de manutenção contínua, mas também o maior RTO, já que a infraestrutura de computação só é provisionada depois que o desastre é declarado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pilot light, que mantém apenas o núcleo de dados replicado e ativo na região secundária.",
                                "isCorrect": false
                            },
                            {
                                "text": "Warm standby, que mantém uma cópia reduzida da aplicação sempre em execução na região.",
                                "isCorrect": false
                            },
                            {
                                "text": "Backup and restore, que reconstrói a infraestrutura sob demanda após o desastre.",
                                "isCorrect": true
                            },
                            {
                                "text": "Multi-site active-active, que mantém capacidade de produção plena em duas regiões.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que o banco de dados esteja sempre replicado e atualizado em uma região secundária, mas só quer pagar por servidores de aplicação quando um desastre realmente acontecer, aceitando um RTO de algumas dezenas de minutos. Qual estratégia de DR atende melhor esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pilot light, com o banco replicado continuamente e a aplicação ligada só durante o disparo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Backup and restore, com snapshots diários do banco copiados manualmente para a outra região.",
                                "isCorrect": false
                            },
                            {
                                "text": "Warm standby, com a aplicação completa rodando o tempo todo em escala reduzida na outra região.",
                                "isCorrect": false
                            },
                            {
                                "text": "Multi-site active-active, com tráfego real distribuído entre as duas regiões o tempo todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa que, em caso de desastre, o Route 53 redirecione o tráfego para uma região onde a aplicação já esteja no ar e funcional, exigindo apenas um aumento de capacidade via Auto Scaling, com RTO de poucos minutos. Qual estratégia descreve esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pilot light, com a camada de aplicação completamente desligada até o momento do desastre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Backup and restore, com a infraestrutura inteira provisionada do zero após o desastre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Multi-site active-active, com metade do tráfego de produção sempre atendido pela outra região.",
                                "isCorrect": false
                            },
                            {
                                "text": "Warm standby, com uma versão reduzida da aplicação sempre ativa na região secundária.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma financeira global não pode ter nenhum tempo de indisponibilidade perceptível, mesmo durante a perda completa de uma região, e o orçamento permite manter capacidade de produção plena em mais de uma região ao mesmo tempo. Qual estratégia de DR é a mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Warm standby, com a região secundária escalando via Auto Scaling somente após o desastre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Multi-site active-active, com tráfego real atendido simultaneamente por duas ou mais regiões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pilot light, com a camada de aplicação sendo ligada assim que o desastre é declarado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Backup and restore, com restauração dos dados a partir do último snapshot disponível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando pilot light com warm standby para o mesmo sistema, qual é a principal diferença entre as duas estratégias?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "No warm standby a aplicação já roda em escala reduzida o tempo todo; no pilot light ela fica desligada até o desastre.",
                                "isCorrect": true
                            },
                            {
                                "text": "No pilot light os dados não são replicados; no warm standby a replicação só começa após o desastre ser declarado.",
                                "isCorrect": false
                            },
                            {
                                "text": "No warm standby o RTO é maior do que no pilot light, porque exige provisionar toda a infraestrutura do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "No pilot light o custo de operação contínua é maior, porque toda a aplicação roda em produção plena o tempo todo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Desacoplamento e tolerância a falhas na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Desacoplamento e tolerância a falhas na prática\n\nRedundância de infraestrutura (Multi-AZ, Auto Scaling) resolve falhas de hardware e de AZ, mas não resolve falhas transitórias de aplicação: um serviço downstream lento, um pico inesperado de tráfego ou um erro momentâneo de rede. Tolerância a falhas na prática exige decisões de design no código e na integração entre componentes, não só na infraestrutura."
                    },
                    {
                        "type": "text",
                        "value": "## Filas para absorver picos e falhas\n\nInserir uma fila, como o Amazon SQS, entre o produtor e o consumidor de uma tarefa desacopla os dois lados no tempo:\n\n- Se o consumidor fica temporariamente indisponível, as mensagens permanecem na fila em vez de serem perdidas.\n- Se há um pico de produção, a fila absorve o excesso e o consumidor processa no seu próprio ritmo, sem precisar escalar instantaneamente.\n- Uma dead-letter queue (DLQ) captura mensagens que falham repetidamente, isolando o problema sem travar o processamento das demais."
                    },
                    {
                        "type": "code",
                        "value": "Produtor (API) --> Amazon SQS (fila principal) --> Consumidores (ASG)\n                              |\n                              v (após N tentativas com falha)\n                        Dead-letter queue (DLQ)\n                              |\n                              v\n                     Alarme / investigação manual"
                    },
                    {
                        "type": "text",
                        "value": "## Retry com backoff exponencial\n\nErros transitórios (throttling, timeout de rede, indisponibilidade momentânea) geralmente se resolvem sozinhos em segundos. A prática recomendada é o cliente tentar novamente com **backoff exponencial**: o intervalo entre tentativas dobra a cada falha (1s, 2s, 4s, 8s...), evitando sobrecarregar um serviço que já está sob estresse.\n\nAdicionar **jitter** (uma variação aleatória no intervalo) evita que vários clientes tentem novamente exatamente ao mesmo tempo, o que geraria um novo pico sincronizado. Os SDKs da AWS já implementam retry com backoff exponencial por padrão para chamadas de API."
                    },
                    {
                        "type": "text",
                        "value": "## Idempotência\n\nSe um cliente reenvia uma requisição após um timeout (sem saber se a primeira tentativa teve sucesso), a operação pode acabar sendo executada duas vezes. Um sistema idempotente garante que executar a mesma operação múltiplas vezes produza o mesmo resultado que executar uma única vez.\n\nNa prática: usar uma chave de idempotência única por requisição, ou condições de escrita (como o uso de **ConditionExpression** no DynamoDB) que rejeitam uma escrita duplicada. Isso é essencial quando se usa SQS, porque o modelo \"at-least-once\" da fila pode entregar a mesma mensagem mais de uma vez."
                    },
                    {
                        "type": "text",
                        "value": "## Health checks, timeouts e isolamento de falhas\n\n- **Health checks**: o Elastic Load Balancing remove automaticamente do roteamento os targets que falham no health check; o Auto Scaling Group substitui instâncias marcadas como unhealthy.\n- **Timeouts**: definir um tempo máximo de espera por resposta evita que uma chamada lenta prenda threads e recursos indefinidamente, permitindo falhar rápido e liberar capacidade.\n- **Isolamento de falhas**: padrões como circuit breaker (interrompe chamadas a uma dependência que está falhando, evitando esgotar recursos) e bulkhead (isola pools de recursos por dependência) impedem que a falha de um componente se propague para o sistema inteiro."
                    },
                    {
                        "type": "quote",
                        "value": "Um sistema tolerante a falhas não tenta impedir que erros aconteçam, ele garante que um erro isolado não vire uma falha em cascata."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação recebe pedidos de processamento de forma bastante irregular, com picos que sobrecarregam os servidores consumidores. Qual serviço, posicionado entre o produtor e o consumidor, absorve esses picos sem perder pedidos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Amazon SNS, entregando os pedidos diretamente e em paralelo para todos os consumidores inscritos.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Lambda, substituindo os consumidores atuais para processar cada pedido em milissegundos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elastic Load Balancing, distribuindo os pedidos igualmente entre os consumidores disponíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon SQS, guardando os pedidos em uma fila até que os consumidores consigam processá-los.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente recebe erros de throttling ao chamar uma API várias vezes por segundo logo após uma falha momentânea, e cada nova tentativa imediata piora o problema. Qual prática reduz esse efeito em cascata?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retry imediato e contínuo, repetindo a chamada assim que cada tentativa anterior falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar bastante o timeout da chamada, esperando a API se recuperar sozinha sem novas tentativas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retry com backoff exponencial e jitter, aumentando o intervalo entre tentativas com uma variação aleatória.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover o tratamento de erro do cliente, deixando a API responsável por toda a lógica de novas tentativas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fila do Amazon SQS entrega a mesma mensagem mais de uma vez para o consumidor em certas situações, por seguir o modelo de entrega at-least-once. O que o consumidor deve implementar para lidar com essa duplicidade com segurança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Compressão de mensagens, reduzindo o tamanho de cada mensagem antes de enviá-la para a fila.",
                                "isCorrect": false
                            },
                            {
                                "text": "Idempotência, garantindo que processar a mesma mensagem duas vezes produza o mesmo resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografia adicional, protegendo o conteúdo da mensagem contra acesso não autorizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Particionamento de fila, distribuindo as mensagens duplicadas entre filas separadas por tipo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Algumas instâncias atrás de um Application Load Balancer começam a responder com erro, mas continuam recebendo tráfego normalmente. Qual configuração faz o ALB parar de enviar requisições para essas instâncias de forma automática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Health checks no target group, que marcam a instância como unhealthy e a removem do roteamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sticky sessions no target group, que mantêm cada cliente sempre na mesma instância de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Connection draining, que espera as conexões em andamento terminarem antes de remover a instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cross-zone load balancing, que distribui o tráfego igualmente entre todas as Availability Zones.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço depende de uma API externa que passou a responder muito lentamente, e as threads da aplicação ficam presas esperando essa resposta, até esgotar os recursos disponíveis e derrubar todo o serviço. Qual padrão evita que essa falha se propague?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Auto Scaling, adicionando mais instâncias para compensar a lentidão da API externa dependente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache local, armazenando as respostas anteriores da API externa por tempo indeterminado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Load balancing, redistribuindo as chamadas lentas entre um número maior de instâncias disponíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Circuit breaker, interrompendo temporariamente as chamadas para a dependência que está falhando.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Backup, replicação e RPO/RTO",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Backup, replicação e RPO/RTO\n\nToda decisão de disaster recovery começa com dois números definidos pelo negócio, não pela equipe técnica:\n\n- **RPO (Recovery Point Objective)**: quanto de dado a organização aceita perder, medido em tempo desde o último backup ou replicação válida.\n- **RTO (Recovery Time Objective)**: quanto tempo de indisponibilidade a organização aceita até o serviço voltar ao ar.\n\nEsses dois valores, e não a preferência técnica da equipe, é que determinam qual mecanismo de backup e replicação faz sentido usar."
                    },
                    {
                        "type": "code",
                        "value": "Linha do tempo de um incidente\n\n...backup...backup...backup   [FALHA]   ...........restauração concluída\n                           ^                                    ^\n                     último ponto                          serviço volta\n                     de dados válido                         a operar\n\n           <------- RPO ------->        <-------- RTO -------->\n      (dado potencialmente perdido)      (tempo de indisponibilidade)"
                    },
                    {
                        "type": "text",
                        "value": "## Replicação do Amazon S3\n\nO S3 oferece replicação automática em nível de objeto, exigindo versionamento habilitado no bucket:\n\n- **SRR (Same-Region Replication)**: replica objetos para outro bucket na mesma região. Usada para agregar logs entre contas ou manter cópias com políticas de acesso diferentes.\n- **CRR (Cross-Region Replication)**: replica objetos para um bucket em outra região. Reduz o RPO para desastres regionais e também aproxima os dados de usuários em outra parte do mundo.\n\nA replicação é assíncrona: há uma pequena defasagem entre a escrita no bucket de origem e a cópia no destino, o que define o RPO mínimo dessa abordagem."
                    },
                    {
                        "type": "text",
                        "value": "## Snapshots cross-region\n\nSnapshots de volumes EBS e snapshots ou backups automatizados do RDS podem ser copiados para outra região. Essa cópia não é contínua: ela acontece no momento em que o snapshot é criado e depois replicado, então o RPO depende diretamente da frequência com que os snapshots são gerados e copiados.\n\nPara um RTO menor, os snapshots replicados permitem recriar volumes ou instâncias de banco na região de destino sem depender da região de origem estar acessível."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Backup\n\nO AWS Backup centraliza a política de backup de vários serviços (EBS, RDS, DynamoDB, EFS, FSx, entre outros) em um único lugar, com planos de backup que definem frequência, janela, retenção e regras de ciclo de vida (por exemplo, mover backups antigos para um armazenamento mais barato).\n\nUm recurso importante para DR é a cópia entre regiões e entre contas: um plano de backup pode copiar automaticamente cada backup para uma região de destino, reduzindo o esforço operacional de manter a replicação manualmente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\",\"RPO aproximado\",\"Observação\"],[\"RDS automated backups + PITR\",\"Segundos a minutos\",\"Restaura para qualquer ponto dentro do período de retenção\"],[\"RDS Multi-AZ\",\"Próximo de zero, mesma região\",\"Protege contra falha de instância ou de AZ, não substitui backup\"],[\"DynamoDB point-in-time recovery\",\"Segundos\",\"Restauração contínua pelos últimos 35 dias, por tabela\"],[\"DynamoDB on-demand backup\",\"No momento do disparo\",\"Cópia completa da tabela, com retenção indefinida\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Escolhendo a estratégia pelo objetivo de negócio\n\nNa prática, o desenho de backup e replicação segue o RPO/RTO definido:\n\n- RPO em segundos exige replicação contínua (Multi-AZ, point-in-time recovery, streams do DynamoDB), não apenas backups periódicos.\n- RPO em horas comporta backups automatizados com uma frequência adequada (snapshots diários, AWS Backup com plano diário).\n- RTO curto exige que a infraestrutura de destino já exista ou suba rápido (pilot light ou warm standby), enquanto um RTO de horas comporta reconstruir tudo do zero a partir do backup.\n\nNenhum mecanismo isolado resolve todos os casos: a arquitetura de backup real combina várias dessas ferramentas, calibradas pelo RPO/RTO de cada carga de trabalho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma organização define que pode perder, no máximo, 15 minutos de dados em caso de desastre. Esse limite corresponde a qual conceito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "RPO (Recovery Point Objective), o quanto de dado a organização aceita perder.",
                                "isCorrect": true
                            },
                            {
                                "text": "RTO (Recovery Time Objective), o tempo de indisponibilidade que a organização aceita.",
                                "isCorrect": false
                            },
                            {
                                "text": "SLA (Service Level Agreement), o percentual de disponibilidade contratado do serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "TTL (Time To Live), o tempo que um dado permanece válido antes de expirar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que os objetos gravados em um bucket S3 na região principal sejam automaticamente copiados para um bucket em outra região, reduzindo o impacto de um desastre regional. Qual recurso atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Same-Region Replication (SRR), com versionamento habilitado apenas no bucket de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Transfer Acceleration, aumentando a velocidade de upload para o bucket de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Lifecycle configuration, movendo os objetos automaticamente entre classes de armazenamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cross-Region Replication (CRR), com versionamento habilitado nos dois buckets envolvidos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time configurou Amazon RDS Multi-AZ e considera que isso já cobre a necessidade de backup do banco de dados. Por que essa suposição está incorreta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Multi-AZ só funciona corretamente quando combinado com uma segunda região configurada separadamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Multi-AZ armazena os dados apenas na memória da instância standby, sem gravar em disco persistente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Multi-AZ protege contra falha de instância ou de AZ, mas não substitui backups do banco de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Multi-AZ exige que os backups automatizados sejam desabilitados para não gerar conflito de sincronização.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usa EBS, RDS, DynamoDB e EFS, e quer definir uma única política de frequência, retenção e cópia entre regiões para o backup de todos esses serviços, sem gerenciar cada um separadamente. Qual serviço atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Config, com regras de conformidade aplicadas automaticamente a cada recurso monitorado.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Backup, com um plano de backup centralizado aplicado aos recursos de vários serviços.",
                                "isCorrect": true
                            },
                            {
                                "text": "Amazon S3, com um bucket único recebendo os dados exportados manualmente de cada serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS CloudTrail, com o histórico de chamadas de API usado para reconstruir o estado dos recursos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela do DynamoDB armazena dados críticos, e o negócio exige a capacidade de restaurar para qualquer instante dos últimos 35 dias, com perda de dados medida em segundos. Qual recurso atende esse requisito da forma mais direta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "DynamoDB on-demand backup, disparado manualmente todos os dias no mesmo horário pela equipe responsável.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Backup com um plano de backup semanal aplicado diretamente sobre a tabela do DynamoDB.",
                                "isCorrect": false
                            },
                            {
                                "text": "DynamoDB point-in-time recovery, com restauração contínua para qualquer momento no período de retenção.",
                                "isCorrect": true
                            },
                            {
                                "text": "DynamoDB Global Tables, replicando a tabela inteira para uma segunda região em tempo real.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 12 - Monitoramento, automação e otimização de custo",
        "aulas": [
            {
                "titulo": "Amazon CloudWatch",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Amazon CloudWatch\nO CloudWatch é o serviço de observabilidade nativo da AWS: coleta métricas, centraliza logs, dispara alarmes e alimenta dashboards. Na prova SAA a pergunta raramente é sobre o que o CloudWatch faz, e sim qual componente usar e como conectá-lo a uma reação automática, como Auto Scaling, SNS ou uma ação direta na instância."
                    },
                    {
                        "type": "text",
                        "value": "## Métricas padrão vs métricas customizadas\nTodo recurso da AWS publica métricas padrão automaticamente. Uma instância EC2, por exemplo, expõe `CPUUtilization`, tráfego de rede e status checks sem nenhuma configuração adicional. Métricas que dependem do sistema operacional, como uso de memória RAM ou espaço em disco, não existem por padrão: é preciso instalar o CloudWatch Agent, que publica esses dados como métricas customizadas.\n\n- **Monitoramento básico**: intervalo de 5 minutos, incluído sem custo adicional.\n- **Monitoramento detalhado**: intervalo de 1 minuto, precisa ser habilitado e tem custo.\n- **Métricas de alta resolução**: granularidade de até 1 segundo, úteis quando o Auto Scaling precisa reagir rápido a um pico, mas geram mais pontos de dados armazenados e custam mais."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de métrica\",\"Origem\",\"Granularidade mínima\"],[\"Métrica padrão (básica)\",\"Publicada automaticamente pelo serviço\",\"5 minutos\"],[\"Métrica padrão (monitoramento detalhado)\",\"Publicada automaticamente, com custo adicional\",\"1 minuto\"],[\"Métrica customizada (memória, disco)\",\"CloudWatch Agent instalado na instância\",\"1 minuto\"],[\"Métrica de alta resolução\",\"PutMetricData da aplicação ou agente configurado\",\"1 segundo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Alarmes e ações\nUm alarme observa uma métrica ao longo de um período e assume um de três estados: `OK`, `ALARM` ou `INSUFFICIENT_DATA` (quando ainda não há dados suficientes ou a métrica está ausente). Na mudança de estado, o alarme pode disparar:\n\n- Uma **política de Auto Scaling**, adicionando ou removendo instâncias do grupo.\n- Uma **notificação via Amazon SNS**, avisando um time por e-mail, SMS ou acionando uma função Lambda.\n- Uma **ação direta na instância EC2**: reiniciar, parar, terminar ou recuperar (recover, útil quando o problema é do hardware do host físico).\n\nAlarmes compostos combinam vários alarmes com operadores AND/OR, disparando só quando a combinação de condições realmente indica um problema, o que reduz alertas de ruído."
                    },
                    {
                        "type": "code",
                        "value": "Metrica (CPUUtilization > 80% por 3 periodos consecutivos)\n        |\n        v\n  Alarme do CloudWatch muda de OK para ALARM\n        |\n        +--> Politica de Auto Scaling -----> adiciona instancias ao grupo\n        |\n        +--> Topico do Amazon SNS ---------> notifica o time de plantao\n        |\n        +--> Acao na instancia EC2 --------> recover / stop / terminate"
                    },
                    {
                        "type": "text",
                        "value": "## Logs, Logs Insights e dashboards\nO CloudWatch Logs centraliza logs de aplicações, funções Lambda, VPC Flow Logs e outros serviços em log groups, com política de retenção configurável, organizados em log streams. Filtros de assinatura (subscription filters) processam esses logs em tempo real, enviando cada evento para uma função Lambda ou para o Kinesis Data Streams assim que ele chega.\n\nO CloudWatch Logs Insights é uma linguagem de consulta para explorar logs interativamente, sem exportar nada: agrega, filtra e ordena entradas de vários log groups em segundos, o que evita montar um pipeline de análise só para uma investigação pontual.\n\nDashboards reúnem métricas, alarmes e resultados de consultas em painéis visuais, podendo cruzar dados de múltiplas regiões e, com a configuração certa, de múltiplas contas."
                    },
                    {
                        "type": "quote",
                        "value": "Uma métrica só vale alguma coisa se estiver ligada a uma ação: monitoramento sem alarme é apenas um gráfico bonito."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe quer monitorar o percentual de memória RAM utilizada em suas instâncias EC2 no CloudWatch, mas as métricas padrão da EC2 não trazem esse dado. Qual é a forma correta de obter essa métrica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Instalar o CloudWatch Agent nas instâncias, que publica o uso de memória como métrica customizada",
                                "isCorrect": true
                            },
                            {
                                "text": "Ativar o monitoramento detalhado da EC2, que passa a incluir a métrica de memória a cada minuto",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar a métrica MemoryUtilization padrão, disponível automaticamente em toda instância EC2",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um alarme do CloudWatch apontando para a instância, que calcula o uso de memória pelo hypervisor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação recebe picos de tráfego muito rápidos e o Auto Scaling Group demora para reagir porque o alarme usa a métrica padrão de 5 minutos. Qual mudança reduz esse tempo de reação sem alterar a arquitetura da aplicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar a política de Auto Scaling de target tracking para step scaling, que reage a eventos mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o intervalo do health check do Elastic Load Balancing, o que acelera a detecção pelo Auto Scaling",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número mínimo de instâncias do grupo, reduzindo a dependência do tempo de resposta do alarme",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar uma métrica customizada de alta resolução e reduzir o período de avaliação do alarme",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um alarme do CloudWatch precisa avisar o time de operações por e-mail sempre que o uso de disco ultrapassar 90% em qualquer instância do grupo. Qual ação deve ser associada a esse alarme?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar uma política de Auto Scaling que envia e-mail automaticamente ao escalar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o Logs Insights para gerar um relatório diário por e-mail com o uso de disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar uma notificação em um tópico do Amazon SNS com o time inscrito por e-mail",
                                "isCorrect": true
                            },
                            {
                                "text": "Publicar um evento no Amazon EventBridge com uma regra que envia e-mail para o time",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro precisa investigar ainda hoje quais requisições de uma API em Lambda tiveram duração acima de 2 segundos nas últimas 3 horas, usando os logs já gravados no CloudWatch Logs. Qual abordagem exige menos configuração prévia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Habilitar o AWS X-Ray na função Lambda e analisar o mapa de serviço gerado depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar uma consulta no CloudWatch Logs Insights filtrando pela duração da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "Exportar os log groups para o Amazon S3 e consultar os arquivos com o Amazon Athena",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um subscription filter que envie os logs para o Amazon Kinesis Data Firehose",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa opera cargas de trabalho na conta de produção (us-east-1) e na conta de disaster recovery (us-west-2) e quer um único painel mostrando métricas das duas contas e regiões ao mesmo tempo, sem replicar dados manualmente. Qual recurso do CloudWatch atende a esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um dashboard do CloudWatch configurado com visualização entre contas e entre regiões",
                                "isCorrect": true
                            },
                            {
                                "text": "Um alarme composto do CloudWatch que agrega métricas de contas e regiões diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Um log group compartilhado via Resource Access Manager entre as contas e regiões",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma métrica customizada publicada pelo CloudWatch Agent em uma conta centralizadora",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CloudTrail, AWS Config e AWS X-Ray",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# CloudTrail, AWS Config e AWS X-Ray\nOs três serviços se confundem na prova porque todos registram alguma coisa, mas cada um responde uma pergunta diferente. Resumindo: o CloudTrail mostra quem fez, o AWS Config mostra o que mudou e se está em conformidade, e o AWS X-Ray mostra onde a chamada ficou lenta."
                    },
                    {
                        "type": "text",
                        "value": "## AWS CloudTrail\nRegistra toda chamada de API feita na conta, seja pelo console, CLI, SDK ou por outro serviço da AWS, incluindo quem fez a chamada, quando, de qual endereço IP e qual foi o resultado.\n\n- **Management events**: operações de controle (criar, alterar, excluir recursos); ficam habilitados por padrão e o histórico dos últimos 90 dias já fica disponível sem configurar nada.\n- **Data events**: operações em nível de objeto ou dado, como `GetObject` no S3 ou invocações de função Lambda; ficam desativados por padrão e têm custo adicional quando habilitados.\n- Quando integrado ao CloudWatch Logs, o CloudTrail permite alarmes quase em tempo real sobre chamadas específicas, como alguém desabilitando o próprio CloudTrail.\n- A validação de integridade de log garante que os arquivos entregues no S3 não foram alterados depois da entrega.\n- Uma trail de organização aplica a mesma auditoria a todas as contas de uma AWS Organizations de uma vez."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta\",\"Serviço que responde\"],[\"Quem chamou essa API e quando?\",\"AWS CloudTrail\"],[\"O security group deste servidor mudou essa semana? Para o quê?\",\"AWS Config\"],[\"Este recurso está em conformidade com a política interna agora?\",\"AWS Config\"],[\"Qual trecho da chamada entre microsserviços está lento?\",\"AWS X-Ray\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Config\nGrava um histórico contínuo da configuração de cada recurso, um registro de como ele mudou ao longo do tempo, independente de quem fez a mudança (isso é papel do CloudTrail).\n\nRegras do Config, gerenciadas pela AWS ou customizadas com Lambda, avaliam se os recursos estão em conformidade com uma política, como \"todo volume EBS deve estar criptografado\", e reportam quais recursos estão fora do padrão. Conformance packs agrupam várias regras para aplicar um conjunto inteiro de políticas de uma vez, inclusive em todas as contas de uma organização."
                    },
                    {
                        "type": "text",
                        "value": "## AWS X-Ray\nFaz tracing distribuído: acompanha uma requisição conforme ela atravessa múltiplos serviços (API Gateway, Lambda, ECS, EC2, chamadas a bancos de dados) e monta um mapa de serviço visual com a duração de cada trecho.\n\nIdentifica onde está o gargalo de latência e onde ocorrem erros, com granularidade por segmento e subsegmento da chamada. Para isso a aplicação precisa incluir o SDK do X-Ray, que propaga um trace ID entre os serviços envolvidos na mesma requisição."
                    },
                    {
                        "type": "code",
                        "value": "Cliente -> API Gateway -> Lambda (checkout) -> DynamoDB\n                              |\n                              +-> Lambda (pagamento) -> servico de pagamento externo\n\nO X-Ray mede a duracao de cada trecho e mostra, no mapa de servico,\nqual chamada concentra a maior parte da latencia total da requisicao."
                    },
                    {
                        "type": "quote",
                        "value": "O CloudTrail mostra quem apertou o botão, o Config mostra o que o botão mudou, o X-Ray mostra por que a resposta demorou para voltar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um bucket do Amazon S3 foi excluído inesperadamente e a equipe de segurança precisa descobrir qual usuário ou role fez a chamada de API e em que horário. Qual serviço traz essa informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AWS Config, que mantém o histórico de configuração de cada bucket ao longo do tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS X-Ray, que rastreia as chamadas feitas pela aplicação até o serviço de armazenamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudWatch Logs, que centraliza os logs de acesso gerados pelo próprio S3",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS CloudTrail, que registra cada chamada de API com o identificador de quem a fez",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer ser avisada sempre que um volume do Amazon EBS for criado sem criptografia, para investigar o desvio da política interna. Qual serviço deve avaliar essa condição continuamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS X-Ray, com uma anotação customizada que sinaliza volumes sem criptografia",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon GuardDuty, com um detector que analisa a configuração de armazenamento",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Config, com uma regra gerenciada que verifica a criptografia dos volumes EBS",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS CloudTrail, com um filtro de métrica que detecta chamadas de criação de volume",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação dividida em vários microsserviços atrás de um API Gateway apresenta lentidão intermitente, mas a equipe não sabe qual serviço específico causa o atraso. Qual ferramenta identifica o trecho exato da cadeia de chamadas que concentra a latência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon CloudWatch, que exibe a métrica de latência agregada de cada componente",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS X-Ray, que monta um mapa de serviço com a duração de cada trecho da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Config, que compara a configuração atual de cada serviço com a linha de base",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS CloudTrail, que mostra a sequência de chamadas de API feitas entre os serviços",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de segurança quer registrar toda chamada GetObject feita em um bucket S3 confidencial, incluindo por qual principal cada objeto foi lido. As trails do CloudTrail já existentes não mostram esses acessos. O que precisa ser habilitado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O registro de data events do CloudTrail para o bucket, que fica desativado por padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "O registro de management events do CloudTrail, que já cobre operações de leitura em objetos",
                                "isCorrect": false
                            },
                            {
                                "text": "Os access logs do S3, única forma de capturar quem chamou GetObject em cada objeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma trail de organização no CloudTrail, que amplia a cobertura para eventos de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização com dezenas de contas quer aplicar o mesmo conjunto de regras de conformidade, como exigir criptografia em buckets e volumes, em todas elas de uma vez, com avaliação contínua do estado de cada recurso. Qual abordagem atende a esse requisito com menos esforço operacional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma trail do CloudTrail habilitada em cada conta, consolidando os eventos em um bucket central",
                                "isCorrect": false
                            },
                            {
                                "text": "Um grupo de alarmes do CloudWatch replicado manualmente em cada conta da organização",
                                "isCorrect": false
                            },
                            {
                                "text": "Um filtro do AWS X-Ray aplicado no nível da organização para todas as contas membro",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conformance pack do AWS Config implantado via AWS Organizations nas contas membro",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Automação operacional",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Automação operacional\nA prova valoriza arquiteturas que eliminam trabalho manual, bastion hosts abertos e credenciais fixas espalhadas em scripts. Três frentes cobrem a maior parte dos cenários: o Amazon EventBridge para reagir a eventos, o AWS Systems Manager para operar a frota sem acesso direto por SSH, e o Auto Scaling para reagir à carga sem intervenção humana."
                    },
                    {
                        "type": "text",
                        "value": "## Amazon EventBridge\nÉ um barramento de eventos: recursos da AWS, aplicações próprias e até SaaS de terceiros publicam eventos, e regras com um padrão de evento (event pattern) decidem o que fazer com cada um.\n\n- Alvos comuns: função Lambda, Step Functions, fila SQS, tópico SNS, Kinesis, e até outro barramento de eventos, inclusive em outra conta.\n- Regras agendadas, com expressão `rate()` ou `cron()`, substituem um script de cron rodando em um servidor só para disparar uma tarefa periódica.\n- Barramentos customizados isolam os eventos de uma aplicação dos eventos padrão da própria conta AWS."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Systems Manager\n- **Session Manager**: acesso de shell a instâncias EC2 (e servidores on-premises) sem abrir a porta 22 ou 3389, sem bastion host e sem gerenciar chave SSH; o acesso é controlado por políticas IAM e as sessões podem ser gravadas em S3 ou CloudWatch Logs.\n- **Patch Manager**: automatiza a aplicação de patches de sistema operacional com baselines e janelas de manutenção definidas, sem logar manualmente em cada servidor.\n- **Parameter Store**: repositório hierárquico para configuração e segredos simples, com histórico de versão e criptografia opcional via KMS no tipo SecureString; o nível padrão (standard) é gratuito.\n- **Automation**: documentos do SSM (runbooks) que encadeiam passos operacionais, como tirar um snapshot, aplicar um patch e validar o resultado, sem intervenção manual.\n- **Run Command**: executa comandos em várias instâncias ao mesmo tempo, sem abrir uma sessão interativa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Necessidade operacional\",\"Ferramenta do Systems Manager\"],[\"Acessar o shell de uma instância sem abrir porta de SSH\",\"Session Manager\"],[\"Aplicar patches de segurança numa janela fixa, sem logar em cada host\",\"Patch Manager\"],[\"Guardar um valor de configuração versionado, sem rotação automática\",\"Parameter Store\"],[\"Encadear uma sequência de passos operacionais sem intervenção manual\",\"Automation\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Auto Scaling como automação\nAlém de escalar por carga, o Auto Scaling reduz trabalho manual ao substituir automaticamente instâncias que falham no health check, sem que alguém precise detectar e trocar a instância na mão.\n\nLifecycle hooks pausam uma instância no estado de entrada (`launching`) ou saída (`terminating`) do grupo para rodar uma ação customizada, como registrar a instância em um sistema externo, antes que ela entre em serviço ou seja terminada de fato.\n\nEscalonamento agendado (scheduled scaling) e escalonamento preditivo (predictive scaling) antecipam picos conhecidos ou aprendidos a partir do histórico, evitando ajuste manual de capacidade."
                    },
                    {
                        "type": "code",
                        "value": "Regra do EventBridge (padrao de evento simplificado):\n\nsource: aws.ec2\ndetail-type: EC2 Instance State-change Notification\ndetail.state: stopped\n\nAlvo: documento de Automation do Systems Manager que\naplica uma tag de auditoria e notifica o time via SNS."
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que guia a automação operacional na prova não é se dá para automatizar, e sim se alguém ainda precisa logar no servidor para aquilo funcionar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe precisa acessar o terminal de instâncias EC2 em subnets privadas para diagnóstico, sem abrir a porta 22 no security group e sem manter um bastion host. Qual serviço atende a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AWS Direct Connect, com uma conexão privada até a rede onde as instâncias estão",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon EventBridge, com uma regra que abre uma sessão de shell sob demanda",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Systems Manager Session Manager, com acesso controlado por políticas IAM",
                                "isCorrect": true
                            },
                            {
                                "text": "Site-to-Site VPN, com um túnel dedicado até a subnet privada das instâncias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém dezenas de instâncias EC2 e precisa aplicar patches críticos de segurança todo mês, em uma janela de manutenção fixa, sem logar manualmente em cada servidor. Qual ferramenta do Systems Manager resolve isso diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Automation, com um runbook genérico que reinstala o sistema operacional inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Patch Manager, com uma baseline de patches e uma janela de manutenção agendada",
                                "isCorrect": true
                            },
                            {
                                "text": "Parameter Store, com um parâmetro versionado que dispara a atualização dos pacotes",
                                "isCorrect": false
                            },
                            {
                                "text": "Session Manager, com uma sessão agendada que aplica os patches em cada instância",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa disparar uma função Lambda de fechamento de relatório todos os dias às 23h, sem manter um servidor dedicado só para disparar essa tarefa. Qual serviço deve criar essa programação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon EventBridge, com uma regra agendada usando expressão cron apontando para a Lambda",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Systems Manager Automation, com um runbook agendado que invoca a função Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon CloudWatch, com uma métrica customizada que aciona a Lambda no horário definido",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Step Functions, com uma máquina de estados que aguarda até o horário configurado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao remover uma instância de um Auto Scaling Group, a aplicação precisa primeiro concluir as requisições em andamento e copiar logs locais para o Amazon S3 antes que a instância seja efetivamente terminada. Qual recurso permite pausar a terminação até essa rotina terminar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um health check customizado do Elastic Load Balancing associado ao target group",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma política de terminação personalizada baseada na idade da instância mais antiga",
                                "isCorrect": false
                            },
                            {
                                "text": "Um alarme do CloudWatch associado à métrica de conexões ativas da instância",
                                "isCorrect": false
                            },
                            {
                                "text": "Um lifecycle hook de saída (terminating) configurado no Auto Scaling Group",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma pipeline de automação precisa ler um valor de configuração simples, o nome do bucket de destino, que muda raramente e não exige rotação automática nem sistema de auditoria dedicado. Qual opção atende com o menor custo operacional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma variável de ambiente definida na role do IAM usada pela pipeline de automação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um parâmetro avançado (advanced) no SSM Parameter Store, com política de expiração",
                                "isCorrect": false
                            },
                            {
                                "text": "Um parâmetro do tipo String no SSM Parameter Store, no nível padrão (standard)",
                                "isCorrect": true
                            },
                            {
                                "text": "Um segredo no AWS Secrets Manager, com a rotação automática desabilitada manualmente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Otimização de custo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Otimização de custo\nCost-Optimized Architectures é um dos domínios da prova SAA. A pergunta não é apenas qual serviço é mais barato isoladamente, e sim se o formato da carga de trabalho casa com o modelo de preço, a classe de armazenamento e o padrão de rede escolhidos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelo de compra\",\"Melhor cenário\",\"Economia típica vs On-Demand\"],[\"On-Demand\",\"Carga imprevisível, curta ou em teste\",\"Nenhuma (preço de referência)\"],[\"Reserved Instances (1 ou 3 anos)\",\"Carga estável, família de instância conhecida\",\"Até cerca de 72%\"],[\"Savings Plans (Compute)\",\"Carga estável, com flexibilidade de família, região ou serviço\",\"Até cerca de 66%\"],[\"Spot Instances\",\"Carga tolerante a interrupção, paralelizável\",\"Até cerca de 90%\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Casando carga com modelo de preço\nReserved Instances exigem compromisso com uma família e tamanho de instância (ou são conversíveis, com desconto menor em troca de flexibilidade). Savings Plans trocam um pouco de desconto por flexibilidade entre famílias, tamanhos, regiões e até entre EC2, Fargate e Lambda.\n\nSpot Instances são ideais para processamento em lote, renderização, jobs de big data e cargas sem estado que suportam interrupção com aviso de 2 minutos; nunca para o componente que sustenta o estado crítico de uma aplicação.\n\nUma arquitetura de custo otimizado normalmente mistura os três: uma capacidade base coberta por Savings Plans ou RI, um colchão em On-Demand para picos curtos e imprevisíveis, e processamento em lote rodando em Spot."
                    },
                    {
                        "type": "text",
                        "value": "## Right-sizing e recursos ociosos\nRight-sizing significa ajustar o tipo e o tamanho da instância, ou a capacidade provisionada de um banco, ao uso real, nem superdimensionado nem subdimensionado. Ferramentas como o AWS Compute Optimizer e o Trusted Advisor sugerem esse ajuste a partir do histórico de utilização.\n\nRecursos ociosos custam mesmo parados: volumes EBS sem instância anexada, snapshots antigos sem uso, load balancers sem nenhum alvo saudável registrado e endereços IP elásticos não associados a uma instância em execução.\n\nAmbientes de desenvolvimento e teste raramente precisam rodar 24 horas por dia; desligá-los fora do horário comercial, por exemplo com o EventBridge acionando uma Lambda em horário programado, corta custo sem tocar em produção."
                    },
                    {
                        "type": "text",
                        "value": "## Escolhendo a classe de armazenamento certa\nNo Amazon S3, a classe errada é uma das formas mais comuns de desperdício: dados acessados raramente pagando o preço do Standard, ou dados com padrão de acesso imprevisível sem usar o S3 Intelligent-Tiering, que move objetos entre níveis automaticamente sem taxa de recuperação.\n\nPolíticas de lifecycle automatizam a transição para Standard-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval ou Deep Archive conforme os dados envelhecem, sem trabalho manual recorrente.\n\nNo Amazon EBS, o volume gp3 desacopla IOPS e throughput do tamanho do volume e custa menos que o gp2 equivalente na maioria das cargas, sem exigir que o disco seja dimensionado só para ganhar performance."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tráfego\",\"Custo\"],[\"Entre serviços na mesma AZ, via IP privado\",\"Sem custo de transferência\"],[\"Entre AZs diferentes na mesma região\",\"Cobrado nos dois sentidos, por GB\"],[\"Saída para a internet (data transfer out)\",\"Cobrado por GB, com faixas decrescentes por volume\"],[\"Entrada vinda da internet (data transfer in)\",\"Sem custo na maioria dos serviços\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A carga que nunca muda merece compromisso, em Reserved Instance ou Savings Plan; a carga que pode morrer no meio do processamento merece Spot; a carga que ninguém sabe prever fica em On-Demand."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação roda 24 horas por dia, 7 dias por semana, com capacidade estável há mais de um ano e previsão de continuar assim. Qual modelo de compra reduz mais o custo em relação ao On-Demand?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Instâncias dedicadas (Dedicated Hosts), cobradas por hora de uso contínuo",
                                "isCorrect": false
                            },
                            {
                                "text": "Reserved Instances ou Savings Plans, com compromisso de 1 ou 3 anos",
                                "isCorrect": true
                            },
                            {
                                "text": "Spot Instances, aproveitando a maior variação de preço disponível no mercado",
                                "isCorrect": false
                            },
                            {
                                "text": "On-Demand com desconto por volume, aplicado automaticamente pela AWS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de processamento de imagens roda em lote durante a madrugada, é dividido em milhares de tarefas independentes e pode reiniciar uma tarefa do zero se a instância que a executava for interrompida. Qual modelo de compra minimiza o custo dessa carga?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Spot Instances, aproveitando o desconto sobre a capacidade ociosa da AWS",
                                "isCorrect": true
                            },
                            {
                                "text": "Reserved Instances, garantindo capacidade reservada durante toda a madrugada",
                                "isCorrect": false
                            },
                            {
                                "text": "Savings Plans de instância EC2, fixando a família usada no processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "On-Demand com Auto Scaling, ajustando a frota conforme a fila de tarefas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma revisão de custo encontrou volumes do Amazon EBS sem instância anexada e endereços IP elásticos não associados a nenhuma instância em execução, ambos gerando cobrança havia meses. Qual é a causa raiz desse desperdício?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma política de lifecycle do S3 aplicada incorretamente aos volumes e endereços",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma Savings Plan contratada com capacidade maior do que a carga realmente usa",
                                "isCorrect": false
                            },
                            {
                                "text": "Instâncias Reservadas expiradas que continuam sendo cobradas pela AWS",
                                "isCorrect": false
                            },
                            {
                                "text": "Recursos que continuaram provisionados depois que deixaram de ser usados",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa armazena arquivos cujo padrão de acesso é imprevisível: alguns ficam quentes por semanas e depois esfriam sem aviso, e o time não quer criar regras de lifecycle manuais nem pagar taxa de recuperação quando um arquivo frio volta a ser acessado. Qual classe do S3 atende melhor a esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "S3 Glacier Flexible Retrieval, custo mínimo com recuperação liberada em poucas horas",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 One Zone-IA, custo reduzido por manter os dados em uma única zona de disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "S3 Intelligent-Tiering, que muda o nível do objeto sozinho e sem taxa de recuperação",
                                "isCorrect": true
                            },
                            {
                                "text": "S3 Standard-IA, com armazenamento mais barato, mas cobrando taxa a cada recuperação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquitetura tem instâncias EC2 em duas AZs servindo arquivos estáticos direto para usuários na internet, gerando uma fatura alta de transferência de dados. Qual mudança reduz esse custo sem abrir mão da alta disponibilidade multi-AZ?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ativar o Enhanced Networking nas instâncias, que remove o custo entre zonas",
                                "isCorrect": false
                            },
                            {
                                "text": "Servir os arquivos estáticos por uma distribuição do Amazon CloudFront",
                                "isCorrect": true
                            },
                            {
                                "text": "Mover todas as instâncias para uma única AZ, eliminando a cobrança entre zonas",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o Elastic Load Balancing por um NAT Gateway, que não cobra entre AZs",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ferramentas de custo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ferramentas de custo\nDepois de desenhar uma arquitetura otimizada, é preciso visibilidade contínua: qual ferramenta responde \"quanto eu gastei\", \"por que gastei isso\", \"vou estourar o orçamento\" e \"o que exatamente devo mudar\"."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\",\"Pergunta que responde\"],[\"AWS Cost Explorer\",\"Quanto gastei e quanto devo gastar nos próximos meses?\"],[\"AWS Budgets\",\"Estou perto de estourar um limite que eu mesmo defini?\"],[\"AWS Cost and Usage Report\",\"Qual é o detalhe linha a linha de cada cobrança?\"],[\"AWS Trusted Advisor\",\"O que especificamente devo mudar para economizar?\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## AWS Cost Explorer\nVisualiza e analisa custo e uso histórico, com filtros e agrupamento por serviço, conta vinculada, região ou tag de alocação de custo. Gera previsão (forecast) de gastos futuros a partir do histórico e traz recomendações de Reserved Instances e Savings Plans calculadas sobre o padrão real de uso da conta.\n\nÉ o ponto de partida natural para entender a fatura antes de agir; não envia notificações proativas por conta própria."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Budgets e Cost and Usage Report\nO **AWS Budgets** cria limites customizados de custo, uso, RI ou Savings Plans e dispara notificações, via SNS ou e-mail, quando o gasto real ou o gasto PREVISTO ultrapassa o limiar definido; budget actions podem até aplicar automaticamente uma política IAM mais restritiva quando o limite estoura.\n\nO **Cost and Usage Report (CUR)** é o relatório de faturamento mais granular disponível, entregue periodicamente em um bucket do S3, com detalhe por hora e por recurso. É a fonte usada quando o Cost Explorer não tem granularidade suficiente, normalmente consultada com Athena ou QuickSight."
                    },
                    {
                        "type": "text",
                        "value": "## AWS Trusted Advisor\nFaz verificações automatizadas em cinco categorias: otimização de custo, performance, segurança, tolerância a falhas e limites de serviço.\n\nNa categoria de custo, sinaliza instâncias EC2 ociosas, load balancers sem instâncias saudáveis registradas, volumes EBS não anexados e oportunidades de Reserved Instances. As verificações essenciais de segurança e de limite de serviço ficam disponíveis para qualquer conta; o conjunto completo de verificações exige plano de suporte Business ou Enterprise."
                    },
                    {
                        "type": "text",
                        "value": "## Tags de alocação de custo\nTags como `Projeto`, `Ambiente` ou `CentroDeCusto` precisam ser ativadas explicitamente no console de billing para aparecerem como dimensão de filtro no Cost Explorer e como coluna no CUR.\n\nSem tags consistentes aplicadas aos recursos, é impossível atribuir com precisão o custo de um recurso compartilhado a um time ou projeto específico. Tags geradas automaticamente por um serviço gerenciado também podem ser ativadas como tag de alocação de custo."
                    },
                    {
                        "type": "code",
                        "value": "Estrutura simplificada de um orcamento no AWS Budgets:\n\nBudgetName: custo-mensal-producao\nBudgetLimit: 5000 USD\nTimeUnit: MONTHLY\nNotificacao: alertar quando o gasto PREVISTO\n             ultrapassar 80% do limite definido"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe de finanças quer ser avisada por e-mail quando a previsão de gasto do mês indicar que vai ultrapassar um limite definido, antes mesmo de o estouro acontecer de fato. Qual serviço atende diretamente essa necessidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AWS Budgets, com uma notificação baseada em custo previsto (forecasted)",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Cost Explorer, com um relatório de previsão exportado todo mês por e-mail",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Trusted Advisor, com uma verificação de custo que roda automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Cost and Usage Report, com uma linha detalhada por serviço e por dia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time financeiro precisa cruzar, hora a hora, o custo de cada recurso com as tags de centro de custo, usando o Amazon Athena para consultas customizadas. Qual fonte de dados de billing oferece esse nível de detalhe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Cost Explorer, exportado manualmente em planilha com o filtro de tag aplicado",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Budgets, com um relatório detalhado gerado a cada estouro do limite definido",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Trusted Advisor, com a lista de recursos ociosos detalhada por centro de custo",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Cost and Usage Report, entregue em S3 com granularidade horária por recurso",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma revisão de custo quer identificar load balancers sem nenhuma instância saudável registrada há semanas, sem escrever nenhuma consulta customizada. Qual ferramenta já traz essa verificação pronta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AWS Config, com uma regra customizada escrita em Lambda",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Budgets, com um alerta configurado por serviço usado",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Trusted Advisor, na categoria de otimização de custo",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Cost Explorer, filtrando o custo por tipo de recurso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Todos os recursos de uma conta já possuem a tag Projeto preenchida corretamente, mas o Cost Explorer ainda não permite filtrar nem agrupar o custo por essa tag. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Cost and Usage Report precisa ser desativado para o Cost Explorer ler as tags",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag ainda não foi ativada como tag de alocação de custo no console de billing",
                                "isCorrect": true
                            },
                            {
                                "text": "O Cost Explorer só aceita tags criadas automaticamente pela própria AWS, não manuais",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag precisa ser recriada no AWS Config para ser reconhecida pelo billing",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer uma recomendação de quanto comprometer em Savings Plans, calculada a partir do padrão real de uso de computação da conta nos últimos meses, incluindo uma estimativa do retorno esperado. Qual ferramenta gera essa recomendação com base no histórico de uso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "AWS Cost Explorer, na seção de recomendações de Savings Plans",
                                "isCorrect": true
                            },
                            {
                                "text": "AWS Budgets, na seção de metas de economia configuradas pelo usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Trusted Advisor, na verificação essencial disponível em toda conta",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Cost and Usage Report, na coluna de custo amortizado por hora",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
        return;
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
