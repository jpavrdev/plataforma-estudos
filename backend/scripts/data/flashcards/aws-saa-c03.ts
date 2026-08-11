import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AWS SAA-C03, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário e a
 * escolha de arquitetura; as cartas guardam as separações entre serviços
 * parecidos, os limites e as regras que a prova cobra de cor.
 */
export const awsSaaC03: CartasDaTrilha = {
    trilha: "AWS SAA-C03",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quantos pilares o Well-Architected Framework tem?",
                        verso: "Seis pilares.",
                    },
                    {
                        frente: "Como um pilar é escolhido numa arquitetura?",
                        verso: "Pela carga de trabalho: cada uma pesa os pilares de um jeito.",
                    },
                    {
                        frente: "O que a prova cobra sobre os pilares?",
                        verso: "Qual deles pesa mais no cenário descrito.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que regiões e zonas de disponibilidade resolvem?",
                        verso: "Disponibilidade e conformidade.",
                    },
                    {
                        frente: "O que as Local Zones resolvem?",
                        verso: "A distância, quando a região mais próxima ainda está longe.",
                    },
                    {
                        frente: "Que serviço leva a AWS para o data center do cliente?",
                        verso: "O Outposts.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a AWS protege?",
                        verso: "A nuvem onde os dados vivem.",
                    },
                    {
                        frente: "O que continua sendo escolha do cliente?",
                        verso: "Como o acesso a esses dados é configurado.",
                    },
                    {
                        frente: "Que camadas ficam com a AWS nos serviços gerenciados?",
                        verso: "Hardware, rede física e operação do serviço.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que indica um servidor que não foi desenhado para a nuvem?",
                        verso: "Precisar de cuidado especial para não cair.",
                    },
                    {
                        frente: "O que a nuvem espera de um recurso?",
                        verso: "Que ele possa ser descartado e recriado.",
                    },
                    {
                        frente: "Que prática substitui o servidor de estimação?",
                        verso: "Automatizar a criação e tratar tudo como substituível.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o preço por hora não mostra?",
                        verso: "As horas de trabalho humano depois de tudo no ar.",
                    },
                    {
                        frente: "O que um serviço gerenciado transfere para a AWS?",
                        verso: "A operação: correção, escala e alta disponibilidade.",
                    },
                    {
                        frente: "Quando o autogerenciado ainda compensa?",
                        verso: "Quando é preciso um controle que o gerenciado não oferece.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o menor privilégio exige, além de configurar uma vez?",
                        verso: "Revisão contínua do que está concedido.",
                    },
                    {
                        frente: "Que ferramenta ajuda a revisar permissões concedidas?",
                        verso: "O IAM Access Analyzer.",
                    },
                    {
                        frente: "Que relatório mostra o uso das credenciais?",
                        verso: "O credential report.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma role não é?",
                        verso: "Um usuário sem senha.",
                    },
                    {
                        frente: "O que uma role é, então?",
                        verso: "Um mecanismo de credenciais temporárias, assumido sob demanda.",
                    },
                    {
                        frente: "Que problema a role resolve numa instância?",
                        verso: "Dispensa guardar chave de longa duração na máquina.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que acontece havendo um deny explícito?",
                        verso: "Nenhum allow em outro lugar muda o resultado.",
                    },
                    {
                        frente: "Onde uma política baseada em recurso é anexada?",
                        verso: "No próprio recurso, e não na identidade.",
                    },
                    {
                        frente: "O que um permissions boundary faz?",
                        verso: "Limita o teto do que uma identidade pode receber.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Sobre o que uma SCP fala?",
                        verso: "Sobre o que a conta não pode fazer.",
                    },
                    {
                        frente: "A SCP pode conceder permissão?",
                        verso: "Não: ela nunca é a fonte de um allow.",
                    },
                    {
                        frente: "O que acontece se a SCP nega e a política da conta permite?",
                        verso: "A ação é negada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é o objetivo final da federação?",
                        verso: "A identidade viver fora do IAM.",
                    },
                    {
                        frente: "O que o STS faz com essa identidade?",
                        verso: "Traduz em credenciais temporárias e escopadas.",
                    },
                    {
                        frente: "O que o IAM Identity Center centraliza?",
                        verso: "O acesso das pessoas a várias contas da organização.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que a chave-mestra costuma criptografar?",
                        verso: "A data key, e não os dados em si.",
                    },
                    {
                        frente: "O que a data key protege?",
                        verso: "Os dados.",
                    },
                    {
                        frente: "O que significa perder o acesso à chave-mestra?",
                        verso: "Perder o acesso a tudo que ela protegia.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o critério prático entre os dois serviços de segredo?",
                        verso: "A rotação automática.",
                    },
                    {
                        frente: "Quando o Secrets Manager se paga?",
                        verso: "Quando a credencial precisa trocar sozinha.",
                    },
                    {
                        frente: "Que vantagem o Parameter Store tem?",
                        verso: "Guardar parâmetro comum sem custo por segredo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que trecho da rede o TLS protege?",
                        verso: "Só aquele em que ele está efetivamente ativo.",
                    },
                    {
                        frente: "Que decisão de arquitetura o TLS impõe?",
                        verso: "Onde ele termina: na borda, no balanceador ou na instância.",
                    },
                    {
                        frente: "O que o ACM faz pelos certificados?",
                        verso: "Emite e renova sozinho, sem custo no uso interno.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o WAF filtra?",
                        verso: "O que a requisição contém.",
                    },
                    {
                        frente: "O que o Shield filtra?",
                        verso: "O volume e a origem do tráfego.",
                    },
                    {
                        frente: "O que o Firewall Manager garante?",
                        verso: "Que as proteções existam de forma consistente nas contas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o GuardDuty diz?",
                        verso: "Que algo está errado agora.",
                    },
                    {
                        frente: "O que o Inspector diz?",
                        verso: "Onde há fraqueza antes de ela ser explorada.",
                    },
                    {
                        frente: "O que o Macie diz?",
                        verso: "Onde o dado sensível está mal guardado.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que torna uma subnet pública?",
                        verso: "A rota da route table dela para um Internet Gateway.",
                    },
                    {
                        frente: "O que não torna a subnet pública?",
                        verso: "Uma marcação própria nem o fato de ter endereço público.",
                    },
                    {
                        frente: "O que a route table define?",
                        verso: "Para onde vai o tráfego daquela subnet.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde o NAT Gateway fica hospedado?",
                        verso: "Numa subnet pública.",
                    },
                    {
                        frente: "Onde ele nunca fica?",
                        verso: "Na própria subnet privada.",
                    },
                    {
                        frente: "O que o NAT permite à subnet privada?",
                        verso: "Sair para a internet sem receber conexão de fora.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que comportamento o security group tem?",
                        verso: "É stateful: a resposta volta sem regra de saída.",
                    },
                    {
                        frente: "Que comportamento a network ACL tem?",
                        verso: "É stateless: precisa de regra nos dois sentidos.",
                    },
                    {
                        frente: "O que a network ACL exige além de liberar a entrada?",
                        verso: "Liberar a saída na faixa de portas efêmeras.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o PrivateLink permite?",
                        verso: "Consumir um serviço específico sem expor à internet.",
                    },
                    {
                        frente: "O que o peering conecta?",
                        verso: "Duas VPCs, sem trânsito para uma terceira.",
                    },
                    {
                        frente: "O que o Transit Gateway resolve?",
                        verso: "A ligação de muitas VPCs e redes num ponto central.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Session Manager faz com a porta de entrada?",
                        verso: "Remove: a conexão parte de dentro da instância.",
                    },
                    {
                        frente: "O que ele substitui na arquitetura?",
                        verso: "O bastion host.",
                    },
                    {
                        frente: "O que o VPC Flow Logs registra?",
                        verso: "O tráfego que entra e sai das interfaces de rede.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que a Site-to-Site VPN conecta?",
                        verso: "Redes.",
                    },
                    {
                        frente: "O que a Client VPN conecta?",
                        verso: "Pessoas.",
                    },
                    {
                        frente: "Que pergunta separa os dois casos?",
                        verso: "Se do outro lado há uma rede inteira ou um usuário.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Direct Connect troca?",
                        verso: "Velocidade de entrega por consistência.",
                    },
                    {
                        frente: "O que ele entrega depois de pronto?",
                        verso: "Banda e latência previsíveis.",
                    },
                    {
                        frente: "Que desvantagem ele tem no início?",
                        verso: "Demora mais para ficar disponível.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que problema o registro alias resolve?",
                        verso: "O mesmo do CNAME, mas funcionando no apex do domínio.",
                    },
                    {
                        frente: "Que custo o alias evita?",
                        verso: "O da consulta, quando o destino é um recurso da AWS.",
                    },
                    {
                        frente: "O que um health check faz no Route 53?",
                        verso: "Tira do rodízio o destino que parou de responder.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "De onde nasce a política de roteamento certa?",
                        verso: "Da pergunta que o requisito faz.",
                    },
                    {
                        frente: "Que política responde a desempenho?",
                        verso: "A de latência.",
                    },
                    {
                        frente: "Que política responde a sobrevivência?",
                        verso: "A de failover.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o CloudFront aproxima?",
                        verso: "O conteúdo, do usuário.",
                    },
                    {
                        frente: "O que o Global Accelerator aproxima?",
                        verso: "O usuário, da aplicação.",
                    },
                    {
                        frente: "Que pergunta decide entre os dois?",
                        verso: "Se existe conteúdo para colocar em cache.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "De onde nasce a escolha da família de instância?",
                        verso: "Do gargalo real: CPU, memória, disco ou rede.",
                    },
                    {
                        frente: "De onde ela não nasce?",
                        verso: "Do tipo mais familiar nem do menor preço.",
                    },
                    {
                        frente: "O que a família de uso geral equilibra?",
                        verso: "CPU e memória, sem privilegiar nenhum extremo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De que depende o modelo de compra certo?",
                        verso: "Do padrão de uso da carga.",
                    },
                    {
                        frente: "O que o compromisso de longo prazo exige?",
                        verso: "Previsibilidade no uso.",
                    },
                    {
                        frente: "Que carga combina com instância spot?",
                        verso: "A que tolera interrupção a qualquer momento.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a AMI define?",
                        verso: "O que a instância já traz pronta.",
                    },
                    {
                        frente: "O que o user data define?",
                        verso: "O que a instância faz ao nascer.",
                    },
                    {
                        frente: "O que o launch template amarra?",
                        verso: "Os dois, de forma reprodutível e versionada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que balanceador o conteúdo HTTP pede?",
                        verso: "O de aplicação.",
                    },
                    {
                        frente: "Que balanceador a performance bruta em TCP pede?",
                        verso: "O de rede.",
                    },
                    {
                        frente: "Que balanceador a inspeção transparente pede?",
                        verso: "O de gateway.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que duas coisas um Auto Scaling Group entrega junto?",
                        verso: "Escalabilidade e alta disponibilidade.",
                    },
                    {
                        frente: "O que ele faz com a instância que falha no health check?",
                        verso: "Substitui por uma nova.",
                    },
                    {
                        frente: "O que a capacidade desejada define?",
                        verso: "Quantas instâncias o grupo tenta manter.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Quando o Lambda compensa numa arquitetura?",
                        verso: "Carga variável, orientada a eventos e de curta duração.",
                    },
                    {
                        frente: "Quando ele deixa de compensar?",
                        verso: "Em processamento constante de alto volume ou execução longa.",
                    },
                    {
                        frente: "Como o Lambda é cobrado?",
                        verso: "Por invocação e tempo de execução, não por servidor parado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o API Gateway desacopla?",
                        verso: "O cliente da implementação do backend.",
                    },
                    {
                        frente: "O que permite trocar o backend sem mudar o contrato?",
                        verso: "O próprio API Gateway, mantendo a mesma rota.",
                    },
                    {
                        frente: "O que o VPC Link permite alcançar?",
                        verso: "Um serviço privado dentro da VPC.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Fargate remove?",
                        verso: "A gestão dos servidores.",
                    },
                    {
                        frente: "O que o Fargate mantém?",
                        verso: "O modelo de contêiner de longa duração.",
                    },
                    {
                        frente: "O que o ECR guarda no fluxo de contêineres?",
                        verso: "As imagens.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa entre Lambda, Fargate, ECS e EKS?",
                        verso: "Que mistura de controle, portabilidade e esforço a carga pede.",
                    },
                    {
                        frente: "Qual não é a pergunta ao escolher onde rodar a carga?",
                        verso: "Qual serviço é melhor em abstrato.",
                    },
                    {
                        frente: "O que o EKS oferece a mais?",
                        verso: "A portabilidade do Kubernetes, com mais esforço operacional.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "Como todo bucket do S3 nasce?",
                        verso: "Privado.",
                    },
                    {
                        frente: "O que é preciso para haver acesso público?",
                        verso: "Alguém criar política ou lista de controle permitindo.",
                    },
                    {
                        frente: "Que trava ainda pode barrar esse acesso?",
                        verso: "O bloqueio de acesso público.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que trocar de classe de armazenamento nunca reduz?",
                        verso: "A durabilidade do objeto.",
                    },
                    {
                        frente: "O que muda entre as classes?",
                        verso: "Disponibilidade, resiliência, tempo de recuperação e custo.",
                    },
                    {
                        frente: "O que uma regra de ciclo de vida automatiza?",
                        verso: "A troca de classe e a expiração do objeto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o tipo de volume EBS define?",
                        verso: "Performance e custo.",
                    },
                    {
                        frente: "O que ele não aumenta?",
                        verso: "A resiliência à falha de uma zona de disponibilidade.",
                    },
                    {
                        frente: "De onde vem essa resiliência?",
                        verso: "Da arquitetura espalhada por várias zonas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta separa S3, EBS e sistema de arquivos?",
                        verso: "Se preciso de objeto por API, disco preso à instância ou pasta.",
                    },
                    {
                        frente: "O que o EFS entrega?",
                        verso: "Uma pasta compartilhada por várias instâncias ao mesmo tempo.",
                    },
                    {
                        frente: "Para que serve o FSx?",
                        verso: "Sistemas de arquivos especializados, como Windows e Lustre.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que problema o Storage Gateway resolve?",
                        verso: "O uso híbrido contínuo, entre o local e a nuvem.",
                    },
                    {
                        frente: "Que problema a Snow Family resolve?",
                        verso: "A migração de dados em massa, uma única vez.",
                    },
                    {
                        frente: "Que problema o AWS Backup resolve?",
                        verso: "Centralizar a política de backup entre serviços.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "Contra o que o Multi-AZ protege?",
                        verso: "Contra falhas de infraestrutura.",
                    },
                    {
                        frente: "Contra o que a read replica protege?",
                        verso: "Contra sobrecarga de leitura.",
                    },
                    {
                        frente: "Dá para usar os dois juntos?",
                        verso: "Dá: eles resolvem problemas diferentes.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Aurora troca em relação ao RDS?",
                        verso: "O modelo de armazenamento, por uma camada distribuída.",
                    },
                    {
                        frente: "Que qualidade essa camada tem?",
                        verso: "É autorreparável.",
                    },
                    {
                        frente: "O que o Aurora Serverless ajusta sozinho?",
                        verso: "A capacidade, conforme a demanda.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a decisão mais importante no DynamoDB?",
                        verso: "O design da chave primária.",
                    },
                    {
                        frente: "Quando essa decisão é tomada?",
                        verso: "Antes da primeira linha de código de consulta.",
                    },
                    {
                        frente: "O que o DAX acrescenta?",
                        verso: "Um cache em memória, com latência de microssegundos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que os Streams tornam o DynamoDB?",
                        verso: "Reativo.",
                    },
                    {
                        frente: "O que as Global Tables tornam?",
                        verso: "Global, com réplicas em várias regiões.",
                    },
                    {
                        frente: "O que o TTL mantém?",
                        verso: "A tabela enxuta, sem esforço manual.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa ao escolher o banco?",
                        verso: "Qual é o padrão de acesso aos dados.",
                    },
                    {
                        frente: "Qual não é a pergunta certa ao escolher o banco?",
                        verso: "Qual banco eu conheço melhor.",
                    },
                    {
                        frente: "Que serviço atende carga analítica na AWS?",
                        verso: "O Redshift.",
                    },
                ],
            },
        },
        10: {
            1: {
                neutra: [
                    {
                        frente: "O que desacoplar com fila garante aos dois lados?",
                        verso: "Cada um escala, falha e se recupera de forma independente.",
                    },
                    {
                        frente: "O que uma fila absorve entre produtor e consumidor?",
                        verso: "Os picos, sem derrubar quem está do outro lado.",
                    },
                    {
                        frente: "Que garantia a fila FIFO acrescenta?",
                        verso: "Ordem e ausência de duplicata.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas vezes o produtor publica no fan-out?",
                        verso: "Uma única vez.",
                    },
                    {
                        frente: "Quem multiplica o evento para os interessados?",
                        verso: "O SNS.",
                    },
                    {
                        frente: "Em que ritmo cada assinante processa?",
                        verso: "No seu próprio, sem depender dos outros.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o produtor precisa saber no barramento de eventos?",
                        verso: "Nada sobre quem consome: ele apenas publica.",
                    },
                    {
                        frente: "Quem decide o destino do evento?",
                        verso: "As regras do EventBridge.",
                    },
                    {
                        frente: "Com base em que a regra decide?",
                        verso: "No conteúdo do próprio evento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para quantos consumidores o SQS entrega cada mensagem?",
                        verso: "Para um só, que a processa.",
                    },
                    {
                        frente: "O que o Kinesis Data Streams permite?",
                        verso: "Vários consumidores lendo o mesmo fluxo.",
                    },
                    {
                        frente: "O que o Firehose faz com o fluxo?",
                        verso: "Entrega direto num destino, sem código de consumidor.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é orquestração, na imagem da aula?",
                        verso: "Um maestro que conhece a partitura inteira.",
                    },
                    {
                        frente: "O que é coreografia?",
                        verso: "Cada músico reagindo ao que ouve dos outros.",
                    },
                    {
                        frente: "O que o Step Functions implementa?",
                        verso: "A orquestração, como máquina de estados.",
                    },
                ],
            },
        },
        11: {
            1: {
                neutra: [
                    {
                        frente: "Sobre o que a alta disponibilidade não é?",
                        verso: "Sobre evitar falhas.",
                    },
                    {
                        frente: "Sobre o que ela é?",
                        verso: "Garantir que nenhuma falha isolada derrube o sistema.",
                    },
                    {
                        frente: "Que arranjo mínimo sustenta isso na AWS?",
                        verso: "Recursos em mais de uma zona de disponibilidade.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Existe uma estratégia de recuperação única e correta?",
                        verso: "Não existe.",
                    },
                    {
                        frente: "O que a estratégia certa equilibra?",
                        verso: "O tempo e a perda aceitos com o custo que se pode pagar.",
                    },
                    {
                        frente: "Qual é a estratégia mais barata e mais lenta?",
                        verso: "Backup e restauração.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um sistema tolerante a falhas não tenta?",
                        verso: "Impedir que erros aconteçam.",
                    },
                    {
                        frente: "O que ele garante?",
                        verso: "Que um erro isolado não vire falha em cascata.",
                    },
                    {
                        frente: "Que padrão corta a cascata entre serviços?",
                        verso: "O disjuntor, que para de chamar quem está falhando.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o RPO mede?",
                        verso: "Quanto dado se aceita perder.",
                    },
                    {
                        frente: "O que o RTO mede?",
                        verso: "Quanto tempo se aceita ficar fora do ar.",
                    },
                    {
                        frente: "O que reduzir os dois provoca?",
                        verso: "Aumento de custo.",
                    },
                ],
            },
        },
        12: {
            1: {
                neutra: [
                    {
                        frente: "Quando uma métrica vale alguma coisa?",
                        verso: "Quando está ligada a uma ação.",
                    },
                    {
                        frente: "O que é monitoramento sem alarme?",
                        verso: "Um gráfico bonito.",
                    },
                    {
                        frente: "O que o alarme faz ao disparar?",
                        verso: "Aciona uma ação, como notificar ou escalar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o CloudTrail mostra?",
                        verso: "Quem apertou o botão.",
                    },
                    {
                        frente: "O que o Config mostra?",
                        verso: "O que o botão mudou.",
                    },
                    {
                        frente: "O que o X-Ray mostra?",
                        verso: "Por que a resposta demorou a voltar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a pergunta que guia a automação operacional?",
                        verso: "Se alguém ainda precisa entrar no servidor para aquilo funcionar.",
                    },
                    {
                        frente: "Qual não é a pergunta?",
                        verso: "Se dá para automatizar.",
                    },
                    {
                        frente: "Que serviço executa tarefas sem acesso direto à instância?",
                        verso: "O Systems Manager.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que carga merece compromisso de longo prazo?",
                        verso: "A que nunca muda.",
                    },
                    {
                        frente: "Que carga merece instância spot?",
                        verso: "A que tolera morrer no meio do processamento.",
                    },
                    {
                        frente: "Que carga merece sob demanda?",
                        verso: "A imprevisível, que ninguém sabe quando vai rodar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ferramenta mostra para onde o gasto foi?",
                        verso: "O Cost Explorer.",
                    },
                    {
                        frente: "Que ferramenta avisa antes de estourar o orçamento?",
                        verso: "O AWS Budgets.",
                    },
                    {
                        frente: "O que as tags acrescentam ao custo?",
                        verso: "A divisão do gasto por time, projeto ou ambiente.",
                    },
                ],
            },
        },
    },
};
