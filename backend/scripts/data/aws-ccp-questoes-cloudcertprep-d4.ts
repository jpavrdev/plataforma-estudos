// Questões do simulado AWS Certified Cloud Practitioner (CLF-C02), domínio 4 da prova
// (Billing, Pricing, and Support), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aws-ccp-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D4: Questao[] = [
    {
        statement:
            "Uma empresa configurou o faturamento consolidado para várias contas da AWS, e uma dessas contas comprou Instâncias Reservadas por 3 anos. Qual afirmação sobre esse cenário está correta?",
        explanation:
            "No faturamento consolidado do AWS Organizations, o desconto das Instâncias Reservadas é compartilhado por padrão entre as contas da organização, e a conta de gerenciamento pode desativar esse compartilhamento. A reserva é um compromisso de cobrança, não muda o desempenho, e o recurso gera economia real.",
        topic: "Preços e faturamento",
        options: [
            [
                "O desconto das Instâncias Reservadas só pode ser compartilhado com a conta de gerenciamento",
                false,
            ],
            [
                "Qualquer conta da organização pode receber o desconto por hora das Instâncias Reservadas",
                true,
            ],
            [
                "As Instâncias Reservadas compradas terão desempenho melhor que o das instâncias On-Demand",
                false,
            ],
            [
                "O faturamento consolidado não gera economia, pois serve apenas para fins informativos",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual recurso da AWS permite a um cliente consultar em detalhes o que foi cobrado pelo uso do Amazon EC2 no mês passado?",
        explanation:
            "O AWS Cost and Usage Report traz o detalhamento das cobranças reais por serviço, recurso e período, incluindo o Amazon EC2; hoje ele é gerado como CUR 2.0 pelo AWS Data Exports. O Cost Anomaly Detection alerta sobre gastos fora do padrão, o Pricing Calculator estima custos futuros e o Systems Manager cuida da operação.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost Anomaly Detection", false],
            ["AWS Pricing Calculator", false],
            ["AWS Systems Manager", false],
            ["AWS Cost and Usage Report", true],
        ],
    },
    {
        statement:
            "Uma startup com orçamento apertado quer ser avisada sempre que a fatura mensal da AWS passar de US$ 2.000. Quais opções atendem a esse requisito? (Selecione DUAS opções.)",
        explanation:
            "O alarme de faturamento do Amazon CloudWatch dispara uma notificação do Amazon SNS quando o valor definido é ultrapassado, e o AWS Budgets envia alertas quando o custo real ou previsto passa do orçamento. O SES só envia e-mails, o CloudTrail registra chamadas de API e o Amazon Connect é uma central de atendimento.",
        topic: "Preços e faturamento",
        options: [
            [
                "Criar um alarme de faturamento no Amazon CloudWatch que envie uma notificação pelo Amazon SNS",
                true,
            ],
            [
                "Configurar o Amazon SES para enviar diariamente os dados de faturamento para o e-mail da empresa",
                false,
            ],
            [
                "Configurar um orçamento no AWS Budgets que alerte a empresa quando o limite for ultrapassado",
                true,
            ],
            [
                "Configurar o AWS CloudTrail para registrar os gastos e avisar quando o limite for ultrapassado",
                false,
            ],
            [
                "Configurar o Amazon Connect para alertar a empresa quando o limite for ultrapassado",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa executar uma aplicação de questionário durante apenas um dia, sem nenhuma interrupção. Qual opção de compra do Amazon EC2 ela deve usar?",
        explanation:
            "As Instâncias On-Demand são cobradas só pelo tempo de uso, sem compromisso, e não são interrompidas pela AWS, o que atende a uma tarefa de um dia. As Reservadas exigem compromisso de 1 ou 3 anos, as Spot podem ser interrompidas e as Dedicadas custam mais sem trazer vantagem nesse caso.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas", false],
            ["Instâncias Spot", false],
            ["Instâncias Dedicadas", false],
            ["Instâncias On-Demand", true],
        ],
    },
    {
        statement:
            "Um projeto vai gerar miniaturas de milhões de imagens. O processamento pode ser interrompido e retomado depois, e não precisa rodar de forma contínua. Qual opção de compra do Amazon EC2 é a MAIS econômica?",
        explanation:
            "As Instâncias Spot usam capacidade ociosa da AWS com descontos de até 90% sobre o On-Demand e podem ser interrompidas, o que combina com um processamento em lote que pode ser retomado. As Reservadas exigem compromisso de longo prazo, o On-Demand cobra o preço cheio e os Hosts Dedicados são a opção mais cara.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas", false],
            ["Instâncias On-Demand", false],
            ["Hosts Dedicados", false],
            ["Instâncias Spot", true],
        ],
    },
    {
        statement:
            "Uma empresa decidiu comprar Instâncias Reservadas do Amazon EC2 por 3 anos para reduzir custos, mas as cargas de trabalho podem mudar nesse período. Qual opção permite trocar a reserva por outra com mais capacidade de computação, se for preciso?",
        explanation:
            "As Instâncias Reservadas Conversíveis podem ser trocadas durante o prazo por outras Conversíveis de valor igual ou maior, com outra família, sistema operacional ou locação. As Standard dão desconto maior, mas só permitem ajustar alguns atributos, e On-Demand e Spot não envolvem reserva.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas Standard", false],
            ["Instâncias Reservadas Conversíveis", true],
            ["Instâncias On-Demand sem compromisso", false],
            ["Instâncias Spot", false],
        ],
    },
    {
        statement:
            "Qual combinação de Instância Reservada oferece a MAIOR economia média em relação ao preço On-Demand?",
        explanation:
            "O maior desconto vem da soma do prazo mais longo (3 anos), do pagamento adiantado integral e da classe Standard, menos flexível que a Conversível. Prazo de 1 ano, ausência de pagamento adiantado e classe Conversível reduzem o desconto em troca de flexibilidade ou de menor desembolso inicial.",
        topic: "Preços e faturamento",
        options: [
            ["Standard de 1 ano, sem pagamento adiantado", false],
            ["Conversível de 1 ano, com pagamento adiantado integral", false],
            ["Standard de 3 anos, com pagamento adiantado integral", true],
            ["Conversível de 3 anos, sem pagamento adiantado", false],
        ],
    },
    {
        statement:
            "Quais opções descrevem MELHOR o modelo de preços da AWS? (Selecione DUAS opções.)",
        explanation:
            "A AWS cobra pelo que é consumido, sem contrato obrigatório nem investimento inicial, o que torna o custo variável e proporcional ao uso. Prazo fixo e custo planejado com antecedência descrevem contratos tradicionais, e colocation é alugar espaço em data center de terceiros para servidores próprios.",
        topic: "Preços e faturamento",
        options: [
            ["Contrato de prazo fixo", false],
            ["Pagamento conforme o uso", true],
            ["Hospedagem em colocation", false],
            ["Custo fixo planejado com antecedência", false],
            ["Modelo de custo variável", true],
        ],
    },
    {
        statement:
            "Um cliente usa várias contas da AWS, cada uma com faturamento separado. Como ele pode aproveitar descontos por volume com o menor impacto possível sobre os recursos da AWS?",
        explanation:
            "O faturamento consolidado do AWS Organizations soma o uso de todas as contas para alcançar faixas de preço por volume, sem mover recursos. Juntar tudo em uma conta dá muito trabalho e tira o isolamento, Instâncias Reservadas reduzem o custo de cargas previsíveis sem somar o uso entre contas e plano de suporte não dá desconto por volume.",
        topic: "Preços e faturamento",
        options: [
            ["Criar uma única conta global e mover todos os recursos para ela", false],
            ["Contratar Instâncias Reservadas de 3 anos com pagamento adiantado", false],
            ["Ativar o faturamento consolidado do AWS Organizations nas contas", true],
            ["Assinar o plano Enterprise Support para obter descontos por volume", false],
        ],
    },
    {
        statement:
            "Quais benefícios estão incluídos no plano AWS Business Support+? (Selecione DUAS opções.)",
        explanation:
            "O AWS Business Support+ dá acesso 24/7 a engenheiros de suporte por telefone, web e chat e aceita casos ilimitados. TAM designado, resposta em até 15 minutos para casos críticos e revisões estratégicas de negócio são do Enterprise Support; no Business Support+, a meta para casos críticos é de 30 minutos.",
        topic: "Ferramentas e suporte",
        options: [
            ["Acesso 24/7 a engenheiros de suporte por telefone e chat", true],
            ["Apoio de um Technical Account Manager (TAM) designado", false],
            ["Quantidade ilimitada de casos de suporte e de contatos", true],
            ["Resposta em até 15 minutos para casos críticos de negócio", false],
            ["Revisões estratégicas de negócio com especialistas da AWS", false],
        ],
    },
    {
        statement:
            "Em quais situações uma empresa deve considerar o uso de Instâncias Spot do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "As Instâncias Spot saem com grande desconto, mas a AWS pode recuperá-las com aviso de dois minutos, então servem para cargas flexíveis e tolerantes a falhas e para ambientes fora da produção. Cargas que mantêm estado, aplicações que não toleram interrupção e bancos de dados sensíveis precisam de capacidade estável.",
        topic: "Preços e faturamento",
        options: [
            ["Aplicações fora do ambiente de produção", true],
            ["Cargas de trabalho que mantêm estado", false],
            ["Aplicações que não podem sofrer interrupções", false],
            ["Aplicações flexíveis e tolerantes a falhas", true],
            ["Aplicações de banco de dados sensíveis", false],
        ],
    },
    {
        statement:
            "Qual serviço inspeciona o ambiente da AWS para encontrar oportunidades de economizar dinheiro e também de melhorar o desempenho dos sistemas?",
        explanation:
            "O AWS Trusted Advisor verifica o ambiente e recomenda melhorias em otimização de custos, desempenho, segurança, tolerância a falhas, cotas de serviço e excelência operacional. O Cost Explorer analisa gastos, o faturamento consolidado une a cobrança de várias contas e o Cost and Usage Report detalha cobranças sem avaliar o ambiente.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Cost Explorer", false],
            ["AWS Trusted Advisor", true],
            ["Faturamento consolidado", false],
            ["AWS Cost and Usage Report", false],
        ],
    },
    {
        statement:
            "Um cliente quer projetar e construir uma nova carga de trabalho na Nuvem AWS, mas não tem na equipe conhecimento técnico sobre a AWS. Qual opção do AWS Partner Network (APN) atende a esse objetivo?",
        explanation:
            "Os parceiros do caminho de serviços (Services Path) da APN são empresas de consultoria e de serviços profissionais e gerenciados que projetam, constroem e migram cargas na AWS. O caminho de software reúne quem desenvolve software, o de hardware quem cria dispositivos e o de distribuição quem ajuda outros parceiros a revender.",
        topic: "Ferramentas e suporte",
        options: [
            ["Parceiros do caminho de software da APN", false],
            ["Parceiros do caminho de serviços da APN", true],
            ["Parceiros do caminho de hardware da APN", false],
            ["Parceiros do caminho de distribuição da APN", false],
        ],
    },
    {
        statement:
            "Como uma empresa pode reduzir seu custo total de propriedade (TCO) usando a AWS?",
        explanation:
            "Na AWS, o investimento inicial em data center e servidores dá lugar a pagamentos pelo uso, o que reduz as despesas de capital e o TCO. As despesas operacionais continuam existindo, as licenças de terceiros seguem por conta do cliente na maioria dos casos e a gestão das aplicações continua sendo do cliente.",
        topic: "Preços e faturamento",
        options: [
            ["Minimizando grandes despesas de capital (CapEx)", true],
            ["Deixando de pagar os custos de licenças de terceiros", false],
            ["Eliminando todas as despesas operacionais (OpEx)", false],
            ["Transferindo à AWS a gestão das próprias aplicações", false],
        ],
    },
    {
        statement:
            "Quais opções a AWS oferece a clientes que querem aprender sobre segurança na nuvem em sessões conduzidas ao vivo por especialistas ou instrutores? (Selecione DUAS opções.)",
        explanation:
            "As AWS Online Tech Talks são webinars ao vivo com especialistas da AWS e sessões de perguntas e respostas, e o AWS Classroom Training oferece aulas com instrutores, presenciais ou virtuais. Blog, Knowledge Center e whitepapers são conteúdos para ler por conta própria, sem condução ao vivo.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Security Blog", false],
            ["AWS Online Tech Talks", true],
            ["AWS Knowledge Center", false],
            ["Whitepapers de segurança da AWS", false],
            ["AWS Classroom Training", true],
        ],
    },
    {
        statement:
            "Quais são vantagens do faturamento consolidado da AWS? (Selecione DUAS opções.)",
        explanation:
            "O faturamento consolidado gera uma fatura para as contas da organização e soma o uso delas para alcançar faixas de preço por volume, sem custo extra. As cotas de serviço continuam valendo por conta e Região, não existe desconto fixo e o plano de suporte é contratado por conta, sem se estender às demais.",
        topic: "Preços e faturamento",
        options: [
            ["Uma única fatura para todas as contas da organização", true],
            ["Aumento automático das cotas de serviço em todas as contas", false],
            ["Um desconto fixo sobre o valor da fatura mensal", false],
            ["Possíveis descontos por volume, já que o uso das contas é somado", true],
            [
                "Extensão automática do plano de suporte da conta de gerenciamento a todas as contas",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual equipe da AWS ajuda os clientes a acelerar a adoção da nuvem por meio de contratos pagos em diversas áreas de especialidade?",
        explanation:
            "O AWS Professional Services é a equipe global de especialistas que atua em projetos pagos em áreas como migração, segurança e dados para acelerar a adoção da nuvem. O Enterprise Support é um plano de suporte, os arquitetos de soluções orientam sem contrato de consultoria e os gerentes de conta cuidam da relação comercial.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Enterprise Support", false],
            ["Arquitetos de soluções da AWS", false],
            ["AWS Professional Services", true],
            ["Gerentes de conta da AWS", false],
        ],
    },
    {
        statement:
            "Como o AWS Trusted Advisor oferece orientação aos usuários da Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "O AWS Trusted Advisor compara o ambiente com boas práticas, recomenda economias com base no uso atual e aponta riscos de segurança, como buckets do S3 ou grupos de segurança com permissões abertas. Ele não corrige nada sozinho; vulnerabilidades de software ficam com o Amazon Inspector e instâncias comprometidas, com o Amazon GuardDuty.",
        topic: "Ferramentas e suporte",
        options: [
            ["Identifica vulnerabilidades de software em aplicações executadas na AWS", false],
            ["Lista recomendações de otimização de custos com base no uso atual da conta", true],
            ["Detecta possíveis falhas de segurança causadas por configurações de permissão", true],
            [
                "Corrige automaticamente falhas de segurança causadas por configurações de permissão",
                false,
            ],
            ["Envia alertas proativos sempre que uma instância do EC2 for comprometida", false],
        ],
    },
    {
        statement: "Qual é o plano MÍNIMO do AWS Support que oferece suporte técnico por telefone?",
        explanation:
            "O AWS Business Support+ é o plano pago de entrada e já inclui atendimento técnico 24/7 por telefone, web e chat com engenheiros de suporte. O Basic cobre só questões de conta e faturamento, sem casos técnicos, e o Enterprise Support e o Unified Operations também têm telefone, mas custam mais.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Basic Support", false],
            ["AWS Business Support+", true],
            ["AWS Enterprise Support", false],
            ["AWS Unified Operations", false],
        ],
    },
    {
        statement:
            "Qual modelo de preço do Amazon EC2 pode oferecer descontos de até 90% em relação ao On-Demand?",
        explanation:
            "As Instâncias Spot usam capacidade ociosa do EC2 e podem sair até 90% mais baratas que o On-Demand, em troca da possibilidade de interrupção. As Instâncias Reservadas e os Savings Plans chegam a até 72% de desconto, o On-Demand é o preço de referência e os Hosts Dedicados custam mais.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas", false],
            ["Instâncias On-Demand", false],
            ["Hosts Dedicados", false],
            ["Instâncias Spot", true],
        ],
    },
    {
        statement:
            "Como um cliente com o plano AWS Basic Support pode obter ajuda da AWS para dúvidas técnicas?",
        explanation:
            "O Basic Support não inclui casos técnicos, mas dá acesso à comunidade AWS re:Post, onde usuários e especialistas da AWS respondem dúvidas, além de documentação e atendimento de conta e faturamento. Casos com engenheiros de suporte e a AWS Support API começam no Business Support+, e o TAM vem com o Enterprise Support.",
        topic: "Ferramentas e suporte",
        options: [
            ["Abrindo casos com engenheiros de suporte da nuvem", false],
            ["Acionando um Technical Account Manager (TAM)", false],
            ["Usando a AWS Support API para abrir casos técnicos", false],
            ["Publicando a dúvida na comunidade AWS re:Post", true],
        ],
    },
    {
        statement: "Em qual cenário o uso de Instâncias Spot do Amazon EC2 é mais indicado?",
        explanation:
            "Instâncias Spot servem para cargas flexíveis que toleram interrupção, já que a AWS pode recuperar a capacidade com aviso de dois minutos; tarefas eventuais que hoje rodam em On-Demand ficam bem mais baratas. Site principal, serviços com SLA de 99,999% e banco de dados muito usado exigem capacidade estável.",
        topic: "Preços e faturamento",
        options: [
            [
                "Uma empresa quer migrar seu site principal, hoje em um servidor web on-premises, para a AWS",
                false,
            ],
            [
                "Uma empresa tem serviços de aplicação cujo SLA exige 99,999% de disponibilidade",
                false,
            ],
            ["O banco de dados legado e muito usado de uma empresa roda hoje on-premises", false],
            [
                "Uma empresa roda em instâncias On-Demand tarefas eventuais que aceitam interrupção",
                true,
            ],
        ],
    },
    {
        statement: "Qual é um benefício do modelo de preço On-Demand do Amazon EC2?",
        explanation:
            "No On-Demand, a cobrança é por segundo ou por hora apenas enquanto a instância está em execução, sem pagamento adiantado nem compromisso. Usar capacidade ociosa com desconto é a ideia das Instâncias Spot, pagar adiantado por uma tarifa menor descreve as Instâncias Reservadas e não existe diária fixa.",
        topic: "Preços e faturamento",
        options: [
            ["Pagar menos usando a capacidade ociosa da AWS", false],
            ["Pagar uma diária fixa, independentemente do tempo de uso", false],
            ["Pagar só pelo tempo em que as instâncias estão em execução", true],
            ["Pagar adiantado pelas instâncias e ter um custo por hora menor", false],
        ],
    },
    {
        statement:
            "Uma empresa vai migrar para o Amazon EC2 uma aplicação com cargas de trabalho que não podem ser interrompidas e que vão rodar por três anos. Qual modelo de preço é a solução MAIS econômica?",
        explanation:
            "Para uma carga estável e sem interrupção por três anos, as Instâncias Reservadas dão grande desconto sobre o On-Demand em troca do compromisso. As Spot são mais baratas, mas podem ser interrompidas, as Dedicadas custam mais por isolarem o hardware e o On-Demand cobra o preço cheio.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Spot, com até 90% de desconto", false],
            ["Instâncias Dedicadas", false],
            ["Instâncias On-Demand", false],
            ["Instâncias Reservadas", true],
        ],
    },
    {
        statement:
            "Como uma conta da AWS pode aproveitar as Instâncias Reservadas compradas por outra conta?",
        explanation:
            "No faturamento consolidado do AWS Organizations, o desconto de Instâncias Reservadas que sobra na conta compradora é aplicado ao uso compatível de outras contas da organização, e a conta de gerenciamento controla esse compartilhamento. Instâncias Dedicadas tratam de isolamento, e Cost Explorer e Budgets só analisam ou monitoram reservas.",
        topic: "Preços e faturamento",
        options: [
            ["Executando as cargas em Instâncias Dedicadas do Amazon EC2", false],
            ["Usando o faturamento consolidado do AWS Organizations", true],
            ["Ativando as recomendações de reserva do AWS Cost Explorer", false],
            ["Criando um orçamento de reservas no AWS Budgets", false],
        ],
    },
    {
        statement:
            "Em comparação com data centers tradicionais e virtualizados, como são os custos na AWS?",
        explanation:
            "Pela economia de escala, a AWS oferece custo variável por unidade menor que o de data centers próprios, e o pagamento conforme o uso elimina grandes investimentos iniciais em hardware. Custos iniciais altos são típicos do modelo tradicional, e na AWS o custo acompanha o consumo em vez de ser fixo.",
        topic: "Preços e faturamento",
        options: [
            ["Custos variáveis maiores e custos iniciais maiores", false],
            ["Custos de uso fixos e custos iniciais menores", false],
            ["Custos variáveis menores e custos iniciais maiores", false],
            ["Custos variáveis menores e custos iniciais menores", true],
        ],
    },
    {
        statement: "Qual afirmação sobre as Instâncias On-Demand do Amazon EC2 está INCORRETA?",
        explanation:
            "Não existe taxa de ativação no On-Demand: paga-se só pelo tempo de execução, sem compromisso nem pagamento adiantado, dentro do modelo de pagamento conforme o uso. A tarifa é definida por hora, e instâncias Linux são cobradas por segundo, com mínimo de 60 segundos, então as demais afirmações estão corretas.",
        topic: "Preços e faturamento",
        options: [
            [
                "É preciso pagar uma taxa de ativação ao iniciar uma instância pela primeira vez",
                true,
            ],
            ["As instâncias On-Demand seguem o modelo de pagamento conforme o uso da AWS", false],
            [
                "Não é preciso assumir compromisso de longo prazo nem fazer pagamento adiantado",
                false,
            ],
            [
                "Em instâncias Linux, a cobrança é por segundo, calculada a partir de uma tarifa por hora",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa vai lançar um novo produto e espera um pico de tráfego na aplicação web. Como parte do plano AWS Enterprise Support, qual recurso oferece orientação de arquitetura e de escalabilidade para esse evento?",
        explanation:
            "O AWS Countdown, que substituiu o Infrastructure Event Management e faz parte do Enterprise Support, apoia eventos críticos como lançamentos com orientação de arquitetura, planejamento de capacidade e acompanhamento durante o evento. O Health Dashboard avisa sobre eventos da AWS, e Knowledge Center e re:Post são conteúdo e comunidade.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Knowledge Center", false],
            ["AWS Health Dashboard", false],
            ["AWS Countdown", true],
            ["AWS re:Post", false],
        ],
    },
    {
        statement:
            "Uma empresa quer usar licenças de software que já possui e que são vinculadas a soquetes ou núcleos físicos (BYOL). Qual opção de compra do Amazon EC2 atende a quase todos os cenários desse tipo de licenciamento?",
        explanation:
            "Os Hosts Dedicados são servidores físicos reservados ao cliente, com visibilidade de soquetes, núcleos e ID do host, o que permite usar licenças vinculadas ao servidor (BYOL) e cumprir exigências de conformidade. As Instâncias Dedicadas isolam o hardware sem dar essa visibilidade, e On-Demand e Spot, na locação padrão, usam hardware compartilhado.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Dedicadas", false],
            ["Hosts Dedicados", true],
            ["Instâncias On-Demand", false],
            ["Instâncias Spot", false],
        ],
    },
    {
        statement: "Qual atividade pode ajudar a reduzir os custos mensais da AWS?",
        explanation:
            "O Amazon EC2 Auto Scaling adiciona instâncias nos picos e remove nos períodos de baixa demanda, evitando pagar por capacidade ociosa. O Network Load Balancer só distribui o tráfego, remover tags de alocação de custos tira visibilidade sem baixar a conta e usar várias Zonas de Disponibilidade aumenta a resiliência e, em geral, o custo.",
        topic: "Preços e faturamento",
        options: [
            ["Usar o Amazon EC2 Auto Scaling para ajustar a capacidade à demanda", true],
            ["Usar um Network Load Balancer para distribuir as requisições HTTP recebidas", false],
            ["Remover todas as tags de alocação de custos dos recursos", false],
            ["Implantar os recursos da AWS em várias Zonas de Disponibilidade", false],
        ],
    },
    {
        statement:
            "Uma empresa de consultoria presta serviços que ajudam clientes da AWS a melhorar suas arquiteturas na nuvem. Qual programa da AWS pode apoiar essa empresa?",
        explanation:
            "O AWS Partner Network (APN) apoia empresas que trabalham com a AWS; consultorias e prestadoras de serviços profissionais e gerenciados entram pelo caminho de serviços (Services Path). O caminho de software é para quem desenvolve produtos, o AWS Professional Services é a equipe da própria AWS e o TAM atende clientes do Enterprise Support.",
        topic: "Ferramentas e suporte",
        options: [
            ["Caminho de serviços do AWS Partner Network", true],
            ["Caminho de software do AWS Partner Network", false],
            ["AWS Professional Services", false],
            ["Technical Account Manager (TAM) da AWS", false],
        ],
    },
    {
        statement:
            "Qual princípio de preços da AWS descreve a opção de assumir um compromisso de uso do Amazon EC2 por 1 ou 3 anos para reduzir o custo total de computação?",
        explanation:
            "O princípio Save when you commit (antes chamado Save when you reserve) reúne as opções em que um compromisso de 1 ou 3 anos, como Savings Plans e Instâncias Reservadas, reduz o preço. Pay as you go é pagar pelo uso sem compromisso, Pay less by using more são descontos por volume e Pay less as AWS grows são reduções trazidas pela escala.",
        topic: "Preços e faturamento",
        options: [
            ["Pague menos à medida que a AWS cresce (Pay less as AWS grows)", false],
            ["Pagamento conforme o uso (Pay as you go)", false],
            ["Pague menos usando mais (Pay less by using more)", false],
            ["Economize ao se comprometer (Save when you commit)", true],
        ],
    },
    {
        statement:
            "Uma empresa está migrando seu banco de dados on-premises para o Amazon RDS. O que ela deve fazer para manter os custos do Amazon RDS no mínimo?",
        explanation:
            "Dimensionar corretamente é escolher classe e tamanho de instância conforme o uso real, antes da migração e de novo depois, com base nas métricas, para não pagar por capacidade ociosa. Arquiteturas em várias Regiões, ativas ou passivas, duplicam recursos, e provisionar com folga para picos futuros encarece o banco.",
        topic: "Preços e faturamento",
        options: [
            ["Dimensionar corretamente as instâncias antes e depois da migração", true],
            ["Usar uma arquitetura ativa-passiva em várias Regiões", false],
            ["Provisionar instâncias com folga para o pico previsto dos próximos anos", false],
            ["Usar uma arquitetura ativa-ativa em várias Regiões", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa manter um banco de dados no Amazon RDS por pelo menos três anos. Qual opção é a MAIS econômica?",
        explanation:
            "Para pelo menos três anos, Instâncias Reservadas de 3 anos com pagamento adiantado parcial dão desconto bem maior que o On-Demand. No RDS, a opção sem pagamento adiantado só existe com prazo de 1 ano e desconta menos, o On-Demand cobra o preço cheio e o RDS não oferece Instâncias Spot.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas sem nenhum pagamento adiantado", false],
            ["Instâncias Reservadas com pagamento adiantado parcial", true],
            ["Instâncias On-Demand com cobrança por hora de uso", false],
            ["Instâncias Spot com grande desconto sobre o preço On-Demand", false],
        ],
    },
    {
        statement:
            "Os Savings Plans podem ser aplicados ao uso de quais destes serviços da AWS? (Selecione DUAS opções.)",
        explanation:
            "Os Compute Savings Plans dão desconto no uso do Amazon EC2, do AWS Lambda e do AWS Fargate em troca de um compromisso de 1 ou 3 anos. O Lightsail tem preço mensal em pacote, a capacidade do Outposts é contratada por um prazo próprio de 3 anos e o Amazon S3 não tem Savings Plans.",
        topic: "Preços e faturamento",
        options: [
            ["Amazon EC2", true],
            ["AWS Outposts", false],
            ["Amazon Lightsail", false],
            ["AWS Lambda", true],
            ["Amazon S3", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre as cotas de serviço (limites de serviço) da AWS estão corretas? (Selecione DUAS opções.)",
        explanation:
            "As cotas valem para a conta, em geral por Região, e muitas podem ser aumentadas pelo Service Quotas ou por um caso no AWS Support; o Trusted Advisor tem verificações de limites de serviço em todos os planos. Não há cotas por usuário do IAM, toda conta tem cotas e o Amazon SES é um serviço de envio de e-mails.",
        topic: "Ferramentas e suporte",
        options: [
            ["É possível pedir ao AWS Support o aumento de uma cota da conta", true],
            ["Cada usuário do IAM tem cotas próprias, separadas das da conta", false],
            ["A AWS não impõe nenhuma cota de serviço às contas dos clientes", false],
            ["O AWS Trusted Advisor ajuda a acompanhar o uso das cotas de serviço", true],
            ["O Amazon SES monitora as cotas e avisa quando o uso chega perto do limite", false],
        ],
    },
    {
        statement: "Como a AWS cobra o uso de instâncias do Amazon EC2 com Amazon Linux?",
        explanation:
            "Instâncias do EC2 com Amazon Linux (e também Windows, RHEL e Ubuntu Pro) são cobradas por segundo, com mínimo de 60 segundos, então cargas curtas não pagam a hora cheia. A cobrança por hora foi o modelo antigo e ainda vale para exceções como o SUSE Linux Enterprise Server; cobrança por dia ou por mês não existe no EC2.",
        topic: "Preços e faturamento",
        options: [
            ["Por segundo, com cobrança mínima de 60 segundos", true],
            ["Por hora, com cobrança mínima de 24 horas", false],
            ["Por minuto, com cobrança mínima de uma hora cheia", false],
            ["Por dia, com cobrança mínima de um mês", false],
        ],
    },
    {
        statement:
            "Quais fatores influenciam o preço pago por uma instância do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "O preço do EC2 depende do tipo de instância (família e tamanho) e da Região, já que cada Região tem sua própria tabela de preços. O balanceador de carga é cobrado à parte sem alterar o preço da instância, buckets do S3 não entram na conta do EC2 e endereços IP privados não têm custo.",
        topic: "Preços e faturamento",
        options: [
            ["O tipo de instância, como m5.large ou t3.micro", true],
            ["A Região da AWS onde a instância é provisionada", true],
            ["O uso de um balanceador de carga na frente da instância", false],
            ["A quantidade de buckets do Amazon S3 na conta", false],
            ["O número de endereços IP privados da instância", false],
        ],
    },
    {
        statement:
            "Uma empresa usa o AWS Organizations para gerenciar todas as suas contas AWS. Qual recurso permite definir, de forma centralizada, quais serviços e ações ficam disponíveis em cada conta-membro?",
        explanation:
            "As políticas de controle de serviço (SCPs) do AWS Organizations definem o máximo de permissões disponíveis nas contas-membro, inclusive para o usuário raiz delas. Entidades principais e políticas do IAM atuam dentro de uma única conta e não impõem limites centralizados, e as políticas de tags só padronizam o uso de tags.",
        topic: "Segurança e identidade",
        options: [
            ["Entidades principais do IAM em cada conta", false],
            ["Políticas de controle de serviço (SCPs)", true],
            ["Políticas do IAM anexadas aos usuários", false],
            ["Políticas de tags do AWS Organizations", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS fornece recomendações de otimização de custos para os recursos da conta?",
        explanation:
            "O AWS Trusted Advisor analisa o ambiente e aponta economias, como instâncias do EC2 subutilizadas e volumes do EBS sem uso (o conjunto completo de verificações exige Business Support+ ou superior). O Pricing Calculator estima custos antes de provisionar, o CloudTrail registra chamadas de API e o X-Ray rastreia requisições de aplicações.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Trusted Advisor", true],
            ["AWS Pricing Calculator", false],
            ["AWS CloudTrail", false],
            ["AWS X-Ray", false],
        ],
    },
    {
        statement:
            "Quais opções indicam uma vantagem e uma desvantagem de comprar Instâncias Reservadas do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "A vantagem das Instâncias Reservadas é o desconto significativo sobre o On-Demand, e a desvantagem é o compromisso de 1 ou 3 anos. Interrupção pela AWS é característica das Instâncias Spot, a reserva não pode ser cancelada sem custo e o desconto compensa em cargas estáveis, não em uso esporádico.",
        topic: "Preços e faturamento",
        options: [
            ["A AWS pode encerrar as instâncias a qualquer momento, sem aviso", false],
            ["Exigem compromisso de uso por um prazo de 1 ou 3 anos", true],
            ["Podem ser canceladas a qualquer momento, sem nenhum custo", false],
            ["Oferecem desconto significativo em relação ao On-Demand", true],
            ["São mais indicadas para cargas de trabalho esporádicas", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa executar um conjunto de instâncias do Amazon EC2 que devem ficar disponíveis o tempo todo durante dois meses. Qual opção de compra tem o melhor custo-benefício?",
        explanation:
            "Para um uso de apenas dois meses sem interrupção, o On-Demand é o mais econômico: paga-se só pelo período usado, sem compromisso. As Spot podem ser interrompidas quando a AWS precisa da capacidade, e as Reservadas, com ou sem pagamento adiantado, exigem prazo mínimo de 1 ano, o que custaria mais que os dois meses.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", true],
            ["Instâncias Spot", false],
            ["Instâncias Reservadas com pagamento adiantado integral", false],
            ["Instâncias Reservadas sem pagamento adiantado", false],
        ],
    },
    {
        statement:
            "Qual é o plano do AWS Support de MENOR custo que inclui o concierge de faturamento, um atendimento personalizado para questões de conta e faturamento?",
        explanation:
            "O concierge de faturamento (white-glove) aparece a partir do Enterprise Support. O Unified Operations também tem atendimento dedicado de faturamento, com especialista designado, mas custa mais; o Business Support+ oferece suporte de faturamento 24/7 sem concierge, e o Basic Support dá acesso ao atendimento ao cliente.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Basic Support", false],
            ["AWS Business Support+", false],
            ["AWS Enterprise Support", true],
            ["AWS Unified Operations", false],
        ],
    },
    {
        statement:
            "Como um cliente da AWS pode acompanhar a utilização das suas Instâncias Reservadas e evitar gastos com reservas subutilizadas?",
        explanation:
            "O AWS Budgets permite criar orçamentos de reserva que acompanham a utilização das Instâncias Reservadas e enviam alertas quando ela fica abaixo do limite definido. Desligar o compartilhamento de reservas só reduz o aproveitamento delas, o CloudWatch não mede a utilização de reservas e o CloudTrail registra chamadas de API.",
        topic: "Preços e faturamento",
        options: [
            [
                "Reunir as contas no AWS Organizations, ativar o faturamento consolidado e desligar o compartilhamento de reservas",
                false,
            ],
            [
                "Usar métricas do Amazon CloudWatch para achar reservas subutilizadas e vendê-las no Reserved Instance Marketplace",
                false,
            ],
            [
                "Criar no AWS Budgets um orçamento de utilização das reservas, com alerta quando ela cair abaixo do limite definido",
                true,
            ],
            [
                "Usar o AWS CloudTrail para verificar automaticamente reservas sem uso e receber recomendações para reduzir a fatura",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais são benefícios de adotar uma estratégia de tags para os recursos da AWS? (Selecione DUAS opções.)",
        explanation:
            "Tags são pares de chave e valor que permitem agrupar recursos, por exemplo por projeto, e, ativadas como tags de alocação de custos, acompanhar os gastos de cada grupo. Encontrar soluções de software é papel do AWS Marketplace, registrar chamadas de API é função do AWS CloudTrail e as tags somem junto com o recurso excluído.",
        topic: "Preços e faturamento",
        options: [
            ["Identificar rapidamente os recursos de um projeto específico", true],
            ["Encontrar rapidamente soluções de software prontas para a AWS", false],
            ["Registrar as chamadas de API feitas na conta AWS", false],
            ["Recuperar os metadados de recursos que já foram excluídos", false],
            ["Acompanhar os gastos da AWS distribuídos por vários recursos", true],
        ],
    },
    {
        statement:
            "Uma empresa que ainda não usa a AWS planeja migrar todo o seu data center on-premises. Qual serviço ela pode usar para montar uma análise de custo-benefício, comparando o custo atual on-premises com o custo projetado na AWS?",
        explanation:
            "O Migration Evaluator coleta dados do ambiente on-premises e gera um business case que compara o custo atual com o custo projetado na AWS. O Pricing Calculator estima só o custo na AWS, sem comparar com o on-premises, e o Cost Explorer e o Cost and Usage Report analisam gastos de quem já usa a AWS.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost Explorer", false],
            ["AWS Migration Evaluator", true],
            ["AWS Cost and Usage Report", false],
            ["AWS Pricing Calculator", false],
        ],
    },
    {
        statement:
            "A AWS recomenda algumas práticas para evitar cobranças inesperadas na fatura. Qual destas ações NÃO está entre essas práticas?",
        explanation:
            "Modelos de execução não têm custo, então excluí-los não reduz a fatura. Volumes do EBS são cobrados pelo espaço provisionado mesmo sem instância, balanceadores de carga cobram por hora mesmo sem tráfego e endereços IPv4 públicos, incluindo os IPs elásticos, são cobrados por hora, estejam em uso ou não.",
        topic: "Preços e faturamento",
        options: [
            ["Excluir volumes do EBS sem uso depois de encerrar uma instância do EC2", false],
            ["Excluir modelos de execução (launch templates) do EC2 que não são usados", true],
            ["Excluir balanceadores de carga do Elastic Load Balancing que estão sem uso", false],
            ["Liberar endereços IP elásticos sem uso depois de encerrar uma instância", false],
        ],
    },
    {
        statement:
            "Qual característica de cobrança oferecida pela AWS reduz o custo de executar instâncias do Amazon EC2?",
        explanation:
            "O EC2 cobra por segundo, com mínimo de 60 segundos, nas instâncias com Amazon Linux, Windows, RHEL e Ubuntu Pro, então o cliente paga só pelo tempo usado. A manutenção da infraestrutura física já está incluída no preço, as tags não têm custo e o EC2 não cobra taxa de inicialização.",
        topic: "Preços e faturamento",
        options: [
            ["Taxa mensal reduzida de manutenção das instâncias", false],
            ["Tags de instância com custo reduzido", false],
            ["Cobrança das instâncias por segundo de uso", true],
            ["Taxa de inicialização reduzida para novas instâncias", false],
        ],
    },
    {
        statement:
            "Qual equipe da AWS trabalha com os clientes para ajudá-los a alcançar os resultados de negócio desejados com a nuvem?",
        explanation:
            "O AWS Professional Services é uma equipe de especialistas que atua junto ao cliente, muitas vezes ao lado de parceiros, para alcançar resultados de negócio na nuvem, como migrações e modernização. A equipe de segurança cuida da segurança da própria AWS, a Trust & Safety trata denúncias de abuso e o concierge atende questões de conta e faturamento.",
        topic: "Ferramentas e suporte",
        options: [
            ["Equipe de segurança da AWS", false],
            ["AWS Professional Services", true],
            ["Equipe de Trust & Safety da AWS", false],
            ["Equipe de concierge do AWS Support", false],
        ],
    },
    {
        statement:
            "Uma empresa vai comprar uma Instância Reservada com prazo de um ano. Qual opção de pagamento oferece o MAIOR desconto total?",
        explanation:
            "Nas Instâncias Reservadas, quanto mais se paga adiantado, maior o desconto: o pagamento adiantado integral dá a maior economia, o parcial fica no meio e a opção sem pagamento adiantado tem o menor desconto das três. Por isso as opções não oferecem o mesmo nível de desconto.",
        topic: "Preços e faturamento",
        options: [
            ["Pagamento adiantado integral", true],
            ["Todas as opções têm o mesmo nível de desconto", false],
            ["Pagamento adiantado parcial", false],
            ["Nenhum pagamento adiantado", false],
        ],
    },
    {
        statement:
            "Um cliente usou uma instância do Amazon EC2 com Amazon Linux por 2 horas, 5 minutos e 9 segundos e outra com SUSE Linux Enterprise Server por 4 horas, 23 minutos e 7 segundos. Por quanto tempo ele será cobrado?",
        explanation:
            "Instâncias com Amazon Linux são cobradas por segundo, com mínimo de 60 segundos, então o tempo cobrado é exatamente 2 h 5 min 9 s. Já as instâncias com SUSE Linux Enterprise Server são cobradas por hora cheia, e 4 h 23 min 7 s viram 5 horas. As demais opções arredondam o Amazon Linux ou cobram o SUSE por segundo.",
        topic: "Preços e faturamento",
        options: [
            ["3 horas pela instância Amazon Linux e 5 horas pela SUSE", false],
            ["2 h 5 min 9 s pela instância Amazon Linux e 4 h 23 min 7 s pela SUSE", false],
            ["2 h 5 min 9 s pela instância Amazon Linux e 5 horas pela SUSE", true],
            ["3 horas pela instância Amazon Linux e 4 h 23 min 7 s pela SUSE", false],
        ],
    },
    {
        statement:
            "Qual recurso do AWS Support permite que os clientes gerenciem casos de suporte de forma programática?",
        explanation:
            "A AWS Support API permite criar, atualizar e resolver casos de suporte por código, integrando o suporte a sistemas internos de chamados; ela está nos planos Business Support+, Enterprise e Unified Operations. O Trusted Advisor dá recomendações, e o Health Dashboard e a Health API informam eventos que afetam serviços e recursos.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Trusted Advisor", false],
            ["AWS Health API", false],
            ["AWS Support API", true],
            ["AWS Health Dashboard", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece descontos por volume, com preço por GB menor à medida que o uso aumenta?",
        explanation:
            "O Amazon S3 usa preços em faixas: no S3 Standard, o preço por GB armazenado cai quando o volume mensal passa de 50 TB e de 500 TB. O Lightsail cobra planos mensais fixos, a VPC em si não tem custo e recursos como o NAT Gateway têm preço fixo por hora e por GB, e o Cost Explorer é uma ferramenta de análise de custos.",
        topic: "Preços e faturamento",
        options: [
            ["Amazon VPC", false],
            ["Amazon S3", true],
            ["Amazon Lightsail", false],
            ["AWS Cost Explorer", false],
        ],
    },
    {
        statement:
            "A diferença de custo total de propriedade (TCO) entre a infraestrutura da AWS e a infraestrutura tradicional aumentou nos últimos anos. Qual pode ser o motivo?",
        explanation:
            "A AWS reduz preços com frequência graças à economia de escala e repassa essa economia aos clientes, o que amplia a vantagem de TCO sobre o on-premises. A nuvem troca CapEx por OpEx, os clientes ainda precisam de equipe para operar suas cargas e a segurança dos dados continua sendo responsabilidade do cliente.",
        topic: "Preços e faturamento",
        options: [
            ["A AWS ajuda os clientes a investir mais em despesas de capital (CapEx)", false],
            [
                "A AWS automatiza toda a operação da infraestrutura e elimina custos com equipe",
                false,
            ],
            ["A AWS continua reduzindo o custo da computação em nuvem para os clientes", true],
            ["A AWS assume toda a segurança dos dados dos clientes sem cobrança adicional", false],
        ],
    },
    {
        statement:
            "Quais itens NÃO são fatores a considerar ao estimar os custos do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "Grupos de segurança não têm custo e zonas hospedadas são cobradas pelo Amazon Route 53, fora da estimativa do EC2. Já o tempo de execução e a quantidade de instâncias definem o custo de computação, e os IPs elásticos, como todo endereço IPv4 público, são cobrados por hora, então entram na estimativa.",
        topic: "Preços e faturamento",
        options: [
            ["O tempo em que as instâncias ficarão em execução", false],
            ["A quantidade de grupos de segurança", true],
            ["Os endereços IP elásticos alocados", false],
            ["A quantidade de zonas hospedadas do Route 53", true],
            ["A quantidade de instâncias", false],
        ],
    },
    {
        statement:
            "Um usuário abriu um caso no AWS Support com a severidade sistema de produção fora do ar (production system down). Qual é o tempo de resposta esperado para esse tipo de caso?",
        explanation:
            "Nos planos Business Support+, Enterprise e Unified Operations, a meta de resposta para sistema de produção fora do ar é de menos de 1 hora. Menos de 12 horas vale para sistema prejudicado, menos de 24 horas para orientação geral, e 15 minutos é a meta do Enterprise para sistema crítico para o negócio fora do ar.",
        topic: "Ferramentas e suporte",
        options: [
            ["Menos de 12 horas", false],
            ["Menos de 15 minutos", false],
            ["Menos de 24 horas", false],
            ["Menos de uma hora", true],
        ],
    },
    {
        statement:
            "Uma empresa está migrando uma aplicação web para a AWS. A capacidade de computação da aplicação é usada continuamente ao longo de todo o ano. Qual opção oferece o melhor custo-benefício?",
        explanation:
            "Para uso contínuo e previsível ao longo do ano, as Instâncias Reservadas dão desconto significativo sobre o On-Demand em troca de compromisso de 1 ou 3 anos. O On-Demand cobra o preço cheio, os Hosts Dedicados custam mais por reservar um servidor físico inteiro e as Spot podem ser interrompidas, o que não serve a uma aplicação que precisa ficar no ar.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", false],
            ["Instâncias em Hosts Dedicados", false],
            ["Instâncias Spot", false],
            ["Instâncias Reservadas", true],
        ],
    },
    {
        statement:
            "Qual destas ações ajuda os clientes a economizar ao migrar suas cargas de trabalho para a AWS?",
        explanation:
            "No modelo traga sua própria licença (BYOL), o cliente reaproveita na AWS licenças que já pagou, sem comprar novas. Gerenciar servidores por conta própria aumenta o custo operacional, locais de borda servem para cache e entrega de conteúdo e não para hospedar cargas de produção, e o Outposts é para cargas que precisam ficar on-premises.",
        topic: "Preços e faturamento",
        options: [
            ["Gerenciar servidores em vez de usar serviços gerenciados", false],
            ["Reaproveitar na AWS as licenças de software de terceiros que já possuem", true],
            ["Levar as cargas de produção para locais de borda em vez de Regiões", false],
            ["Usar o AWS Outposts para executar todas as cargas em um ambiente otimizado", false],
        ],
    },
    {
        statement:
            "Quais recursos estão disponíveis para os clientes do plano AWS Business Support+? (Selecione DUAS opções.)",
        explanation:
            "O Business Support+ inclui suporte de conta e faturamento 24/7 e permite contratar o AWS Countdown Premium, sucessor do Infrastructure Event Management, por uma taxa adicional. O suporte técnico nele é 24/7 por telefone, chat e e-mail, o TAM designado começa no Enterprise e o plano tem o conjunto completo de verificações do Trusted Advisor.",
        topic: "Ferramentas e suporte",
        options: [
            ["Atendimento de conta e faturamento 24 horas por dia, 7 dias por semana", true],
            ["Acesso a engenheiros de suporte apenas por e-mail e só em horário comercial", false],
            ["AWS Countdown Premium para eventos planejados, mediante taxa adicional", true],
            ["Technical Account Manager designado, disponível 24 horas por dia", false],
            ["Acesso apenas às verificações principais (core) do AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Uma empresa executa periodicamente grandes trabalhos de processamento de imagens e vídeos na AWS. O tempo de processamento não é crítico, e o fator mais importante é minimizar o custo. Qual opção de instâncias do Amazon EC2 é a mais adequada?",
        explanation:
            "As Instâncias Spot usam a capacidade ociosa da AWS com desconto de até 90% sobre o On-Demand e servem para trabalhos flexíveis que toleram interrupções, como processamento de mídia em lote. O On-Demand cobra o preço cheio, os Hosts Dedicados custam mais por reservar um servidor inteiro e a reserva exige compromisso de 1 ou 3 anos, inadequado para uso periódico.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", false],
            ["Hosts Dedicados", false],
            ["Instâncias Spot", true],
            ["Instâncias Reservadas com pagamento adiantado integral", false],
        ],
    },
    {
        statement: "O que o AWS Cost Explorer oferece para ajudar a gerenciar os gastos na AWS?",
        explanation:
            "O Cost Explorer mostra gastos e uso passados e gera previsões de até 18 meses com base no histórico. Comparar a AWS com o on-premises é papel do Migration Evaluator, estimar serviços novos a partir do uso esperado cabe ao Pricing Calculator e o faturamento consolidado é um recurso do AWS Organizations.",
        topic: "Preços e faturamento",
        options: [
            ["Comparações de custo entre a Nuvem AWS e o ambiente on-premises atual", false],
            ["Estimativas de custo de serviços novos com base no uso esperado", false],
            ["Faturamento consolidado das várias contas de uma organização", false],
            ["Previsões de custo de até 18 meses com base no histórico de uso", true],
        ],
    },
    {
        statement:
            "Uma equipe usa várias instâncias On-Demand do Amazon EC2 como ambiente de desenvolvimento. Qual é a melhor forma de reduzir as cobranças quando essas instâncias não estão em uso?",
        explanation:
            "Interromper as instâncias suspende a cobrança de computação e preserva a configuração e os volumes do EBS, que seguem cobrados pelo armazenamento, para retomar o ambiente depois. Excluir os volumes destrói os dados, encerrar remove as instâncias de vez e obriga a recriar o ambiente, e é possível sim reduzir a cobrança do On-Demand.",
        topic: "Preços e faturamento",
        options: [
            ["Excluir todos os volumes do EBS anexados às instâncias", false],
            ["Não há como reduzir cobranças de instâncias On-Demand", false],
            ["Encerrar as instâncias (terminate)", false],
            ["Interromper as instâncias (stop)", true],
        ],
    },
    {
        statement:
            "Quais fatores devem ser considerados no preço do Amazon EBS? (Selecione DUAS opções.)",
        explanation:
            "O Amazon EBS cobra pelo espaço provisionado em GB por mês, mesmo com a instância parada, e pelos dados guardados em snapshots, além de IOPS e throughput extras em alguns tipos de volume. Capacidade e tempo de computação entram no preço do EC2, e grupos de segurança não têm custo.",
        topic: "Preços e faturamento",
        options: [
            ["O tamanho dos volumes provisionados, em GB por mês", true],
            ["A capacidade de computação consumida pelas instâncias do EC2", false],
            ["A quantidade de dados armazenados nos snapshots", true],
            ["O tempo de computação consumido pelas instâncias", false],
            ["O número de grupos de segurança das instâncias", false],
        ],
    },
    {
        statement:
            "Quais itens costumam ter o MAIOR impacto no custo da AWS? (Selecione DUAS opções.)",
        explanation:
            "Computação, armazenamento e transferência de dados de saída são os principais fatores de custo na AWS. A transferência de dados de entrada vinda da internet não é cobrada, funções do IAM não têm custo e o número de serviços não define o custo, que depende de quanto cada um é usado.",
        topic: "Preços e faturamento",
        options: [
            ["Cobranças pelo uso de computação", true],
            ["A quantidade de serviços usados", false],
            ["Cobranças de transferência de dados de entrada", false],
            ["Cobranças de transferência de dados de saída", true],
            ["A quantidade de funções do IAM criadas", false],
        ],
    },
    {
        statement:
            "Considerando o mesmo prazo de reserva, qual destes clientes obtém o MAIOR desconto?",
        explanation:
            "Com o mesmo prazo, as Instâncias Reservadas Standard dão desconto maior que as Conversíveis, que trocam parte do desconto pela flexibilidade de mudar atributos, e o pagamento adiantado integral rende mais desconto que o parcial ou que nenhum pagamento adiantado. Por isso Standard com pagamento adiantado integral é a combinação de maior desconto.",
        topic: "Preços e faturamento",
        options: [
            [
                "Quem compra Instâncias Reservadas Conversíveis com pagamento adiantado parcial",
                false,
            ],
            [
                "Quem compra Instâncias Reservadas Conversíveis com pagamento adiantado integral",
                false,
            ],
            ["Quem compra Instâncias Reservadas Standard sem pagamento adiantado", false],
            ["Quem compra Instâncias Reservadas Standard com pagamento adiantado integral", true],
        ],
    },
    {
        statement: "Qual destas opções está disponível na compra de instâncias do Amazon EC2?",
        explanation:
            "Nas Instâncias Reservadas e nos Savings Plans, pagar adiantado reduz o custo por hora. Lances eram o antigo modelo das Spot, que desde 2017 cobram o preço Spot vigente sem leilão; não existe registro de instâncias para desconto por volume; e Instâncias Dedicadas custam mais, sendo o desconto de até 90% o das Spot.",
        topic: "Preços e faturamento",
        options: [
            ["Dar lances para conseguir o menor preço possível", false],
            ["Registrar instâncias para ganhar desconto por volume em cada hora de uso", false],
            ["Comprar Instâncias Dedicadas com até 90% de desconto", false],
            ["Pagar adiantado para ter um custo por hora menor", true],
        ],
    },
    {
        statement:
            "O CTO pediu que você use o chat do AWS Support para tirar uma dúvida técnica sobre o Amazon EBS. A conta está no plano Basic Support, e o AWS Support Center não mostra a opção de chat. O que você deve fazer?",
        explanation:
            "Suporte técnico por chat, telefone e e-mail 24/7 fica nos planos pagos, a partir do Business Support+; o Basic Support dá acesso ao atendimento de conta e faturamento, à documentação e ao AWS re:Post. O chat existe, não é vendido como complemento avulso, e casos de conta e faturamento não cobrem dúvidas técnicas.",
        topic: "Ferramentas e suporte",
        options: [
            ["Nada, porque o AWS Support não oferece atendimento por chat", false],
            [
                "Pedir o chat como complemento pago, que pode ser contratado em qualquer plano",
                false,
            ],
            ["Mudar o plano de suporte da conta para, no mínimo, o AWS Business Support+", true],
            ["Abrir um caso de conta e faturamento, que também atende dúvidas técnicas", false],
        ],
    },
    {
        statement:
            "Quais fatores afetam quanto você paga para armazenar objetos no Amazon S3? (Selecione DUAS opções.)",
        explanation:
            "O armazenamento no S3 é cobrado pelo volume de dados em GB por mês, com preço diferente para cada classe de armazenamento. A criptografia padrão com SSE-S3 não tem custo, criar e excluir buckets é gratuito (paga-se pelos dados e pelas requisições) e volumes do EBS são cobrados à parte, sem relação com o S3.",
        topic: "Preços e faturamento",
        options: [
            ["Manter a criptografia padrão SSE-S3 ativa nos buckets", false],
            ["A quantidade de volumes do EBS anexados às instâncias", false],
            ["A classe de armazenamento usada para os objetos", true],
            ["Criar e excluir buckets do S3", false],
            ["O tamanho total, em GB, dos objetos armazenados", true],
        ],
    },
    {
        statement:
            "Quais são tipos válidos de Instâncias Reservadas do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "As Instâncias Reservadas podem ser Standard, com o maior desconto e menos flexibilidade, ou Conversíveis, que permitem trocar atributos como família e sistema operacional em troca de um desconto menor. Expressa é uma opção de recuperação do S3 Glacier, e Spot e sob demanda (On-Demand) são outras opções de compra do EC2, não tipos de reserva.",
        topic: "Preços e faturamento",
        options: [
            ["Conversível", true],
            ["Expressa", false],
            ["Sob demanda", false],
            ["Spot", false],
            ["Standard", true],
        ],
    },
    {
        statement:
            "No modelo de pagamento conforme o uso, quais fatores afetam o custo do Amazon CloudFront? (Selecione DUAS opções.)",
        explanation:
            "No pagamento conforme o uso, o CloudFront cobra pela transferência de dados para a internet, com preço que varia por região geográfica, e pelas requisições HTTP e HTTPS. Volumes do EBS, tipo de instância do EC2 e classe de armazenamento do S3 são custos da origem, cobrados por esses serviços, e não entram no preço do CloudFront.",
        topic: "Preços e faturamento",
        options: [
            ["O número de requisições HTTP e HTTPS atendidas", true],
            ["A distribuição geográfica do tráfego entregue", true],
            ["O número de volumes do EBS na origem", false],
            ["O tipo de instância do EC2 usado na origem", false],
            ["A classe de armazenamento do S3 usada na origem", false],
        ],
    },
    {
        statement:
            "Qual afirmação sobre o acesso às verificações do AWS Trusted Advisor nos planos atuais do AWS Support está correta?",
        explanation:
            "O Basic Support dá acesso a todas as verificações de limites de serviço e a algumas de segurança e tolerância a falhas. O conjunto completo, com otimização de custos, desempenho e excelência operacional, está nos planos Business Support+, Enterprise e Unified Operations, e não só no Unified Operations.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "No Basic Support, só parte delas, como as de limites de serviço e algumas de segurança",
                true,
            ],
            [
                "No Basic Support, o conjunto completo de verificações fica disponível sem nenhum custo extra",
                false,
            ],
            ["Somente o Unified Operations dá acesso ao conjunto completo de verificações", false],
            [
                "No Business Support+, só as verificações de segurança e de limites de serviço",
                false,
            ],
        ],
    },
    {
        statement: "Quais são benefícios do AWS Organizations? (Selecione DUAS opções.)",
        explanation:
            "O AWS Organizations gerencia várias contas de forma central, limitando os serviços e ações disponíveis com políticas de controle de serviço (SCPs) e juntando a cobrança no faturamento consolidado. Traçar o caminho de adoção é papel do AWS CAF, estimar custos cabe ao Pricing Calculator e resultados de negócio são o foco do AWS Professional Services.",
        topic: "Preços e faturamento",
        options: [
            ["Controlar centralmente o acesso aos serviços da AWS nas contas", true],
            ["Traçar um caminho acelerado para uma adoção de nuvem bem-sucedida", false],
            ["Estimar o custo de novas cargas de trabalho antes de implantá-las", false],
            ["Contar com especialistas da AWS para atingir metas de negócio", false],
            ["Consolidar o faturamento de várias contas em uma só fatura", true],
        ],
    },
    {
        statement:
            "Uma empresa tem várias contas AWS independentes e quer reduzir a cobrança mensal total. O que ela deve fazer?",
        explanation:
            "No faturamento consolidado do AWS Organizations, o uso de todas as contas é somado, o que ajuda a atingir faixas de desconto por volume e permite compartilhar descontos de reservas e Savings Plans. Remover contas não gera desconto por volume, acompanhar cobranças não reduz o valor sozinho e os preços em faixas são aplicados automaticamente.",
        topic: "Preços e faturamento",
        options: [
            ["Tentar remover as contas AWS que não são mais necessárias", false],
            ["Reunir as contas no AWS Organizations com faturamento consolidado", true],
            ["Acompanhar de perto as cobranças geradas por cada conta", false],
            ["Ativar os preços em faixas da AWS antes de provisionar os recursos", false],
        ],
    },
    {
        statement: "O que o plano AWS Business Support+ oferece? (Selecione DUAS opções.)",
        explanation:
            "O Business Support+ inclui o conjunto completo de verificações do Trusted Advisor e a AWS Support API, que permite criar e gerenciar casos por código. Concierge de faturamento, TAM designado e resposta em menos de 15 minutos para sistema crítico fora do ar começam no Enterprise; no Business Support+ essa meta é de menos de 30 minutos.",
        topic: "Ferramentas e suporte",
        options: [
            ["Conjunto completo de verificações do AWS Trusted Advisor", true],
            ["Concierge de faturamento com atendimento personalizado", false],
            ["Resposta em menos de 15 minutos quando um sistema crítico cai", false],
            ["Acesso à AWS Support API para gerenciar casos por código", true],
            ["Technical Account Manager designado com orientação proativa", false],
        ],
    },
    {
        statement: "Quais ações podem reduzir os custos do Amazon EBS? (Selecione DUAS opções.)",
        explanation:
            "Snapshots desnecessários geram cobrança de armazenamento, e trocar o tipo de volume, como de gp2 para gp3, reduz o preço por GB. Buckets são do Amazon S3, o EBS não tem reservas de capacidade com desconto e espalhar os dados por mais volumes aumenta o espaço provisionado e, com ele, o custo.",
        topic: "Preços e faturamento",
        options: [
            ["Excluir buckets do S3 que não são usados", false],
            ["Comprar reservas de capacidade para os volumes", false],
            ["Excluir snapshots que não são mais necessários", true],
            ["Mudar o tipo de volume, como de gp2 para gp3", true],
            ["Distribuir as requisições de leitura entre mais volumes", false],
        ],
    },
    {
        statement:
            "O que torna mais fácil categorizar, gerenciar e filtrar os recursos de uma conta da AWS?",
        explanation:
            "Tags são pares de chave e valor anexados aos recursos, usados para agrupar, buscar e filtrar por projeto, ambiente ou responsável. O CloudWatch monitora métricas e logs, o Service Catalog publica catálogos de produtos aprovados e o Directory Service oferece Active Directory gerenciado.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon CloudWatch", false],
            ["AWS Service Catalog", false],
            ["AWS Directory Service", false],
            ["Tags de recursos", true],
        ],
    },
    {
        statement: "Quais são benefícios do AWS Marketplace? (Selecione DUAS opções.)",
        explanation:
            "O AWS Marketplace é um catálogo com curadoria de software de fornecedores independentes, pronto para implantar na AWS, com preços flexíveis (avaliação gratuita, por hora, anual, BYOL). Cobrança por segundo é recurso do EC2, o Marketplace não dá desconto em On-Demand e os patches do software cabem ao cliente ou ao vendedor.",
        topic: "Ferramentas e suporte",
        options: [
            ["Opções de preço flexíveis, como cobrança por hora, contrato anual e BYOL", true],
            ["Cobrança por segundo em todos os produtos de software do catálogo", false],
            ["Descontos exclusivos sobre o preço das Instâncias On-Demand do Amazon EC2", false],
            ["Catálogo com curadoria de software de terceiros pronto para usar na AWS", true],
            ["Aplicação de patches no software de terceiros feita pela própria AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa vai lançar uma campanha publicitária no próximo fim de semana para promover um novo produto digital. A expectativa é de grandes picos de carga durante a campanha, e não pode haver indisponibilidade. Será preciso capacidade de computação extra só nesse período. Qual opção de compra do Amazon EC2 tem o MELHOR custo-benefício para esse caso?",
        explanation:
            "Para uma carga curta e imprevisível que não pode ser interrompida, as Instâncias On-Demand atendem sem compromisso de prazo. Savings Plans e Instâncias Reservadas exigem compromisso de 1 ou 3 anos, e as Instâncias Spot podem ser interrompidas pela AWS a qualquer momento.",
        topic: "Preços e faturamento",
        options: [
            ["Savings Plans", false],
            ["Instâncias Spot", false],
            ["Instâncias Reservadas", false],
            ["Instâncias On-Demand", true],
        ],
    },
    {
        statement:
            "Quais são benefícios das Instâncias On-Demand do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "Com On-Demand você paga pela capacidade usada, sem compromisso, e pode escalar para cima ou para baixo a qualquer momento, sem manter capacidade ociosa para picos. Capacidade gratuita não faz parte do modelo On-Demand, Spot e Reservadas costumam sair mais baratas e as instâncias ficam prontas em minutos.",
        topic: "Preços e faturamento",
        options: [
            ["Dispensam comprar capacidade de reserva para picos periódicos de tráfego", true],
            ["Oferecem capacidade gratuita para testar novas aplicações antes da produção", false],
            ["Custam menos que qualquer outra opção de compra de instâncias do Amazon EC2", false],
            ["Exigem de um a dois dias de preparação e configuração antes do primeiro uso", false],
            ["Permitem aumentar ou reduzir a capacidade de computação conforme a demanda", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS é usado para pagar as faturas da AWS, acompanhar o uso e controlar os custos em relação ao orçamento?",
        explanation:
            "O AWS Billing and Cost Management concentra o pagamento das faturas, o acompanhamento do uso e o controle de orçamentos, com ferramentas como Cost Explorer e Budgets. O faturamento consolidado só junta contas numa fatura, o CloudWatch monitora métricas e o Trusted Advisor recomenda boas práticas.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Billing and Cost Management", true],
            ["Faturamento consolidado do AWS Organizations", false],
            ["Amazon CloudWatch", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Qual recurso da AWS permite que uma empresa aproveite as faixas de preço por volume dos serviços somando o uso de várias contas-membro?",
        explanation:
            "O faturamento consolidado do AWS Organizations trata as contas como uma só no cálculo de preços, então o uso somado atinge antes as faixas de desconto por volume. SCPs limitam permissões, Reservadas com pagamento adiantado dão desconto por compromisso e o Cost Explorer só analisa gastos.",
        topic: "Preços e faturamento",
        options: [
            ["Políticas de controle de serviço (SCPs)", false],
            ["Faturamento consolidado", true],
            ["Instâncias Reservadas com pagamento adiantado integral", false],
            ["AWS Cost Explorer", false],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são categorias de verificações do AWS Trusted Advisor? (Selecione DUAS opções.)",
        explanation:
            "O Trusted Advisor agrupa as verificações em seis categorias: otimização de custos, desempenho, segurança, tolerância a falhas, limites de serviço e excelência operacional. Uso de instâncias, conformidade e capacidade de armazenamento não são categorias do serviço.",
        topic: "Ferramentas e suporte",
        options: [
            ["Tolerância a falhas", true],
            ["Uso de instâncias", false],
            ["Conformidade", false],
            ["Desempenho", true],
            ["Capacidade de armazenamento", false],
        ],
    },
    {
        statement: "Em qual situação é vantajoso para uma empresa usar Instâncias Spot?",
        explanation:
            "As Instâncias Spot usam capacidade ociosa do EC2 com grande desconto, mas a AWS pode recuperá-las com aviso de dois minutos, então servem para cargas flexíveis quanto ao horário. Missão crítica e instâncias que não podem parar pedem On-Demand ou Reservadas, e capacidade dedicada pede Hosts ou Instâncias Dedicadas.",
        topic: "Preços e faturamento",
        options: [
            ["Quando há flexibilidade no horário em que a aplicação precisa rodar", true],
            ["Quando as cargas de trabalho são de missão crítica para o negócio", false],
            ["Quando a empresa precisa de capacidade física dedicada só para ela", false],
            ["Quando a instância não pode ser parada nem interrompida em nenhum momento", false],
        ],
    },
    {
        statement:
            "Qual opção permite compartilhar entre várias contas da AWS o benefício de custo das Instâncias Reservadas?",
        explanation:
            "Com o faturamento consolidado do AWS Organizations, o desconto de uma Instância Reservada que sobra numa conta é aplicado ao uso compatível de outra conta-membro. Relatórios de utilização, recomendações de compra e orçamentos de Reservadas só mostram dados ou alertam, sem compartilhar o benefício.",
        topic: "Preços e faturamento",
        options: [
            ["Relatório de utilização de Instâncias Reservadas no AWS Cost Explorer", false],
            ["Contas-membro no faturamento consolidado do AWS Organizations", true],
            ["Orçamento de utilização de Instâncias Reservadas no AWS Budgets", false],
            ["Recomendações de compra de Reservadas no AWS Cost Explorer", false],
        ],
    },
    {
        statement:
            "Uma empresa tem várias contas da AWS e quer simplificar e consolidar o processo de faturamento. Qual serviço da AWS atende a esse objetivo?",
        explanation:
            "O AWS Organizations oferece faturamento consolidado: as contas-membro ficam sob a conta de gerenciamento, que recebe uma única fatura com o uso de todas. O Cost and Usage Report detalha os gastos, o Cost Explorer analisa e prevê custos e o AWS Budgets dispara alertas de limite.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost and Usage Report", false],
            ["AWS Organizations", true],
            ["AWS Cost Explorer", false],
            ["AWS Budgets", false],
        ],
    },
    {
        statement:
            "Quais métodos podem ser usados para identificar os custos da AWS de cada departamento de uma empresa? (Selecione DUAS opções.)",
        explanation:
            "Contas separadas isolam naturalmente os gastos de cada departamento, e tags de alocação de custos permitem filtrar os custos por departamento no Cost Explorer e nos relatórios de faturamento. MFA protege o acesso, Reservadas reduzem o custo total e ordens de compra são só uma forma de pagamento.",
        topic: "Preços e faturamento",
        options: [
            ["Ativar a autenticação multifator (MFA) no usuário raiz da conta", false],
            ["Criar uma conta da AWS separada para cada departamento", true],
            ["Comprar Instâncias Reservadas sempre que for possível", false],
            ["Aplicar tags que associem cada recurso a um departamento", true],
            ["Pagar as faturas da AWS por meio de ordens de compra", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS é usado para gerenciar de forma centralizada várias contas da AWS e o acesso aos serviços em cada uma delas?",
        explanation:
            "O AWS Organizations gerencia várias contas de forma centralizada e, com as políticas de controle de serviço (SCPs), limita os serviços e as ações disponíveis em cada conta. O Service Catalog publica produtos aprovados, o AWS Config registra configurações e o Trusted Advisor recomenda boas práticas.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Service Catalog", false],
            ["AWS Config", false],
            ["AWS Trusted Advisor", false],
            ["AWS Organizations", true],
        ],
    },
    {
        statement:
            "Uma empresa avalia migrar suas aplicações para a AWS. Ela já conhece o custo de manter a carga de trabalho on-premises e quer estimar quanto a carga equivalente custaria na AWS, para comparar os dois valores. Qual ferramenta faz essa estimativa?",
        explanation:
            "O AWS Pricing Calculator estima quanto a carga equivalente custaria na AWS antes de qualquer recurso existir, e essa estimativa é comparada ao custo on-premises. Cost and Usage Report e Cost Explorer trabalham com gastos que já ocorreram, e o AWS Budgets define limites e alertas sobre o gasto.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost and Usage Report", false],
            ["AWS Pricing Calculator", true],
            ["AWS Budgets", false],
            ["AWS Cost Explorer", false],
        ],
    },
    {
        statement:
            "Qual recurso está incluído no plano AWS Enterprise Support, mas NÃO está disponível no plano AWS Business Support+?",
        explanation:
            "O Enterprise Support inclui um TAM designado, que dá orientação proativa e coordena recursos da AWS para o cliente. O Business Support+ já oferece acesso 24/7 a engenheiros por telefone, chat, e-mail e web, todas as verificações do Trusted Advisor e a AWS Support API, mas não tem TAM designado.",
        topic: "Ferramentas e suporte",
        options: [
            ["Acesso 24/7 a engenheiros de suporte por telefone e chat", false],
            ["Technical Account Manager (TAM) designado para a empresa", true],
            ["Conjunto completo de verificações do Trusted Advisor", false],
            ["Acesso à AWS Support API para gerenciar casos", false],
        ],
    },
    {
        statement:
            "Quais são vantagens das Instâncias Reservadas do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "As Instâncias Reservadas dão até 72% de desconto sobre o On-Demand em troca de compromisso de 1 ou 3 anos, e as zonais reservam capacidade numa Zona de Disponibilidade. Os tipos de instância e a rede são os mesmos do On-Demand, e o desconto só existe porque há compromisso de prazo.",
        topic: "Preços e faturamento",
        options: [
            ["Oferecem desconto em relação ao preço das Instâncias On-Demand", true],
            ["Dão acesso a tipos de instância que não existem no modelo On-Demand", false],
            ["Oferecem capacidade de rede adicional em relação ao On-Demand", false],
            ["Dispensam qualquer compromisso de prazo com a AWS", false],
            ["Permitem reservar capacidade numa Zona de Disponibilidade", true],
        ],
    },
    {
        statement:
            "Um cliente executa uma instância On-Demand do Amazon EC2 com Amazon Linux por 3 horas, 5 minutos e 6 segundos. Por quanto tempo esse cliente será cobrado?",
        explanation:
            "Instâncias On-Demand com Amazon Linux são cobradas por segundo, com mínimo de 60 segundos, então o cliente paga exatamente 3 horas, 5 minutos e 6 segundos. Descartar os segundos ou arredondar o minuto não segue essa regra, e a cobrança por hora cheia é o modelo antigo.",
        topic: "Preços e faturamento",
        options: [
            ["3 horas e 5 minutos (ignora os segundos)", false],
            ["3 horas, 5 minutos e 6 segundos (exato)", true],
            ["3 horas e 6 minutos (arredonda o minuto)", false],
            ["4 horas (arredonda para a hora cheia)", false],
        ],
    },
    {
        statement:
            "Quais vantagens uma empresa tem ao usar software de terceiros do AWS Marketplace, em vez de instalar esse software por conta própria no Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "No AWS Marketplace o software é cobrado conforme a licença (por hora, mês ou ano, na própria fatura da AWS) e já vem configurado para implantar em poucos cliques. A criptografia dos dados continua sendo do cliente, as atualizações de versão continuam necessárias e testar antes de usar segue sendo boa prática.",
        topic: "Ferramentas e suporte",
        options: [
            ["Pagar pelo software por hora ou por mês, conforme a licença", true],
            ["Implantar a aplicação já configurada no EC2 com poucos cliques", true],
            ["Ter a criptografia dos dados gerenciada pelo fornecedor do software", false],
            ["Deixar de precisar atualizar o software para versões mais novas", false],
            ["Implantar o software de terceiros sem precisar testá-lo antes", false],
        ],
    },
    {
        statement: "O que é o AWS Trusted Advisor?",
        explanation:
            "O Trusted Advisor é uma ferramenta automatizada que inspeciona o ambiente e recomenda melhorias em otimização de custos, desempenho, segurança, tolerância a falhas, limites de serviço e excelência operacional. Não é uma pessoa, não é a AWS Partner Network e não se confunde com os TAMs, profissionais do plano Enterprise.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "Um especialista da AWS que analisa a conta e recomenda boas práticas de custo e segurança",
                false,
            ],
            ["Uma rede de parceiros da AWS que recomenda boas práticas de uso", false],
            ["Uma ferramenta on-line que faz verificações automáticas e recomenda melhorias", true],
            [
                "Outro nome dado aos Technical Account Managers que recomendam melhorias de custo e segurança",
                false,
            ],
        ],
    },
    {
        statement: "Qual é um efeito do modelo de pagamento conforme o uso dos serviços da AWS?",
        explanation:
            "No pagamento conforme o uso, a empresa não precisa investir antes em servidores e data centers, o que reduz as despesas de capital e transforma o gasto em despesa variável. Não há pagamento adiantado obrigatório, o modelo vale para quase todos os serviços e a troca é de CapEx por OpEx, não o contrário.",
        topic: "Preços e faturamento",
        options: [
            ["Reduz as despesas de capital (CapEx), pois dispensa comprar hardware", true],
            ["Exige pagamento adiantado pelos serviços antes de começar a usá-los", false],
            ["Vale apenas para os serviços Amazon EC2, Amazon S3 e Amazon RDS", false],
            ["Converte despesas operacionais (OpEx) em despesas de capital (CapEx)", false],
        ],
    },
    {
        statement:
            "Depois de escolher uma reserva de Host Dedicado do Amazon EC2, qual forma de pagamento oferece o MAIOR desconto?",
        explanation:
            "Na reserva de Host Dedicado, o pagamento adiantado integral quita toda a reserva de uma vez e dá o maior desconto. O adiantado parcial combina uma entrada com taxa horária reduzida, o sem adiantamento tem o menor desconto entre as reservas e o On-Demand por hora não tem desconto nenhum.",
        topic: "Preços e faturamento",
        options: [
            ["Sem pagamento adiantado (No Upfront)", false],
            ["Pagamento por hora no modelo On-Demand", false],
            ["Pagamento adiantado parcial (Partial Upfront)", false],
            ["Pagamento adiantado integral (All Upfront)", true],
        ],
    },
    {
        statement:
            "Como uma empresa pode isolar os custos das cargas de trabalho de produção e de não produção na AWS?",
        explanation:
            "Contas separadas criam uma fronteira de faturamento: cada ambiente tem seus próprios custos, fáceis de acompanhar e revisar. Funções do IAM controlam permissões, dividir por serviço não separa ambientes e o CloudWatch monitora o uso, mas nenhum deles isola os custos.",
        topic: "Preços e faturamento",
        options: [
            ["Criar funções do IAM separadas para as cargas de produção e de não produção", false],
            ["Usar contas da AWS diferentes para os ambientes de produção e de não produção", true],
            [
                "Usar Amazon EC2 para não produção e outros serviços para as cargas de produção",
                false,
            ],
            ["Usar o Amazon CloudWatch para monitorar o uso dos serviços em cada ambiente", false],
        ],
    },
    {
        statement:
            "O que o AWS Marketplace permite que os usuários façam? (Selecione DUAS opções.)",
        explanation:
            "No AWS Marketplace, fornecedores vendem suas soluções para clientes da AWS e compradores contratam software de terceiros que roda na AWS, pago na própria fatura. Instâncias Spot não podem ser revendidas, relatórios de conformidade ficam no AWS Artifact e aumento de cotas é pedido no Service Quotas.",
        topic: "Ferramentas e suporte",
        options: [
            ["Vender Instâncias Spot do Amazon EC2 que não estão sendo usadas", false],
            ["Vender suas próprias soluções para outros clientes da AWS", true],
            ["Comprar software de terceiros que roda na AWS", true],
            ["Adquirir documentos de segurança e conformidade da AWS", false],
            ["Solicitar aumento das cotas de serviço da conta", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece uma forma rápida e automatizada de criar e gerenciar contas da AWS?",
        explanation:
            "O AWS Organizations permite criar contas-membro pelo console ou por API e gerenciá-las de forma centralizada, com unidades organizacionais, SCPs e faturamento consolidado. O Cognito e o Directory Service cuidam de usuários de aplicações e de diretórios, e o Lightsail oferece servidores virtuais simplificados.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Cognito", false],
            ["Amazon Lightsail", false],
            ["AWS Organizations", true],
            ["AWS Directory Service", false],
        ],
    },
    {
        statement:
            "Uma empresa está migrando seus data centers on-premises para a Nuvem AWS e quer ajuda prática de especialistas na execução do projeto. Como a empresa pode obter esse apoio? (Selecione DUAS opções.)",
        explanation:
            "O AWS Professional Services e os parceiros da AWS Partner Network oferecem ajuda prática em migrações, com especialistas que planejam e executam o trabalho junto com a empresa. O time do Marketplace não executa migrações, o AWS Support resolve problemas técnicos por casos e o Amazon Connect é uma central de contato.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "Pedir ao time do AWS Marketplace um orçamento para executar a migração na conta da empresa",
                false,
            ],
            [
                "Abrir um caso no AWS Support pedindo que a equipe de suporte execute a migração",
                false,
            ],
            [
                "Contratar o AWS Professional Services para orientar a migração e montar a landing zone",
                true,
            ],
            ["Contratar um parceiro da AWS Partner Network (APN) especializado em migração", true],
            [
                "Usar o Amazon Connect para criar uma solicitação de proposta (RFP) de ajuda especializada",
                false,
            ],
        ],
    },
    {
        statement:
            "Como o serviço de concierge incluído no AWS Enterprise Support ajuda os clientes?",
        explanation:
            "O Enterprise Support inclui um serviço de concierge com especialistas em faturamento e conta, que atendem dúvidas de cobrança e ajudam a aplicar boas práticas de faturamento. Arquitetura fica com o TAM e os Solutions Architects, casos técnicos com os engenheiros de suporte e desenvolvimento com Professional Services ou parceiros.",
        topic: "Ferramentas e suporte",
        options: [
            ["Apoiando o desenvolvimento das aplicações do cliente", false],
            ["Oferecendo orientação sobre arquitetura na AWS", false],
            ["Respondendo a dúvidas de faturamento e de conta", true],
            ["Respondendo a perguntas sobre casos de suporte técnico", false],
        ],
    },
    {
        statement:
            "Uma empresa tem várias contas no AWS Organizations e quer que o desconto das Instâncias Reservadas do Amazon EC2 compradas para uma conta-membro específica valha somente para essa conta. O que deve ser feito?",
        explanation:
            "O desconto de uma Reservada vale primeiro para a conta que a comprou e só é compartilhado com contas que tenham o compartilhamento ativo. Comprar na conta-membro e desativar o compartilhamento dela, pela conta de gerenciamento, restringe o benefício a essa conta. Comprar na conta de gerenciamento beneficiaria outra conta, e ativar o compartilhamento faria o oposto.",
        topic: "Preços e faturamento",
        options: [
            [
                "Comprar as Reservadas na conta de gerenciamento e desativar o compartilhamento dela",
                false,
            ],
            [
                "Ativar os alertas de faturamento no console do AWS Billing and Cost Management",
                false,
            ],
            [
                "Comprar as Reservadas na conta-membro e desativar o compartilhamento dela na conta de gerenciamento",
                true,
            ],
            [
                "Ativar o compartilhamento de Reservadas para todas as contas no console do AWS Billing and Cost Management",
                false,
            ],
        ],
    },
    {
        statement: "Para que o AWS Budgets pode ser usado?",
        explanation:
            "O AWS Budgets cria orçamentos de custo, uso, utilização e cobertura de Reservadas e Savings Plans, com alertas quando o valor passa do limite ou fica abaixo da meta. Recomendar tipos de instância é papel do Compute Optimizer, registrar chamadas de API é do CloudTrail e formas de pagamento ficam nas preferências de faturamento.",
        topic: "Preços e faturamento",
        options: [
            ["Alertar quando a utilização das Reservadas cair abaixo da meta definida", true],
            [
                "Recomendar tipos de instância mais baratos com base no histórico de uso de CPU",
                false,
            ],
            ["Registrar as chamadas de API que criaram cada recurso cobrado na fatura", false],
            ["Dividir o valor de uma fatura da AWS entre várias formas de pagamento", false],
        ],
    },
    {
        statement:
            "Quais recursos ou serviços podem ser usados para monitorar os custos e as despesas de uma conta da AWS? (Selecione DUAS opções.)",
        explanation:
            "O Cost and Usage Report (hoje entregue pelo AWS Data Exports como CUR 2.0) traz os custos detalhados da conta, e os alarmes de faturamento do CloudWatch avisam quando o gasto estimado passa de um limite. Páginas de produto e a Price List API mostram preços de tabela, e o Trusted Advisor recomenda economias sem acompanhar os gastos.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost and Usage Report", true],
            ["Páginas de produto com os preços dos serviços da AWS", false],
            ["AWS Trusted Advisor", false],
            ["Alarmes de faturamento no Amazon CloudWatch", true],
            ["AWS Price List API", false],
        ],
    },
    {
        statement:
            "Uma empresa quer testar uma solução de e-commerce de terceiros antes de decidir usá-la a longo prazo. Qual serviço ou ferramenta da AWS apoia esse objetivo?",
        explanation:
            "O AWS Marketplace tem produtos de terceiros com avaliação gratuita e cobrança conforme o uso, então a empresa pode testar a solução antes de assumir um contrato. A APN é o programa de parceiros, o Service Catalog organiza produtos aprovados para uso interno e o Amplify serve para criar aplicações web e móveis.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Marketplace", true],
            ["AWS Partner Network (APN)", false],
            ["AWS Amplify", false],
            ["AWS Service Catalog", false],
        ],
    },
    {
        statement:
            "Cada departamento de uma empresa tem sua própria conta da AWS, independente e com forma de pagamento própria. A nova liderança quer centralizar a governança dos departamentos e consolidar os pagamentos. Como fazer isso com serviços ou recursos da AWS?",
        explanation:
            "Com uma nova conta como conta de gerenciamento do AWS Organizations, basta convidar as contas dos departamentos: a empresa ganha governança central com SCPs e faturamento consolidado numa única forma de pagamento. Não dá para criar uma organização em cada conta e depois juntá-las, e faturas encaminhadas, funções do IAM ou o Cost Explorer não consolidam pagamentos.",
        topic: "Preços e faturamento",
        options: [
            [
                "Encaminhar as faturas mensais de cada conta e depois criar funções do IAM para acesso entre contas",
                false,
            ],
            [
                "Criar uma nova conta da AWS, configurar o AWS Organizations e convidar todas as contas existentes",
                true,
            ],
            [
                "Configurar o AWS Organizations em cada uma das contas existentes e depois vincular todas elas",
                false,
            ],
            [
                "Usar o Cost Explorer para somar os custos das contas e depois replicar as políticas do IAM",
                false,
            ],
        ],
    },
    {
        statement: "O que o AWS Pricing Calculator faz?",
        explanation:
            "O AWS Pricing Calculator é uma ferramenta gratuita que estima custos mensais, anuais e iniciais a partir da configuração e do uso previsto dos serviços da AWS. Ele não compara colocation, não mede consumo de energia de data centers e não acompanha CPU de instâncias em execução, papel do Amazon CloudWatch.",
        topic: "Preços e faturamento",
        options: [
            ["Compara custos on-premises com os de ambientes de colocation", false],
            ["Estima a fatura mensal com base no uso projetado dos serviços da AWS", true],
            ["Estima o consumo de energia elétrica dos data centers existentes da empresa", false],
            ["Estima a utilização de CPU das instâncias que estão em execução", false],
        ],
    },
    {
        statement:
            "Um usuário precisa de ajuda com o faturamento e quer reativar uma conta suspensa. Para onde ele deve enviar uma solicitação de conta e faturamento?",
        explanation:
            "Casos de conta e faturamento podem ser abertos no AWS Support Center por qualquer cliente, inclusive no plano Basic, e é por eles que se trata cobrança e reativação de conta. O re:Post é uma comunidade de perguntas, a equipe Trust & Safety recebe denúncias de abuso e um Solutions Architect orienta arquitetura.",
        topic: "Ferramentas e suporte",
        options: [
            ["Comunidade do AWS re:Post", false],
            ["Equipe AWS Trust & Safety", false],
            ["Um Solutions Architect da AWS", false],
            ["Atendimento do AWS Support", true],
        ],
    },
    {
        statement:
            "Quais funcionalidades as ferramentas do AWS Billing and Cost Management oferecem aos usuários? (Selecione DUAS opções.)",
        explanation:
            "O AWS Cost Explorer detalha os custos por dia, por serviço e por conta vinculada, e o AWS Budgets cria orçamentos com alertas para uso real ou previsto. Essas ferramentas não encerram todos os recursos nem trocam o modelo de compra sozinhas, e mover dados para classes mais baratas é função do ciclo de vida do Amazon S3.",
        topic: "Preços e faturamento",
        options: [
            [
                "Encerrar automaticamente todos os recursos da AWS quando um orçamento é ultrapassado",
                false,
            ],
            [
                "Detalhar os custos da AWS por dia, por serviço e por conta vinculada da organização",
                true,
            ],
            [
                "Criar orçamentos e receber notificações quando o uso real ou previsto os ultrapassar",
                true,
            ],
            [
                "Trocar sozinhas para Instâncias Reservadas ou Spot, conforme o que sair mais barato",
                false,
            ],
            ["Mover os dados do Amazon S3 para uma classe de armazenamento mais barata", false],
        ],
    },
    {
        statement:
            "Uma empresa quer reaproveitar licenças de software que são cobradas por núcleo físico de processador. Qual opção de compra do Amazon EC2 permite cumprir essa exigência de licenciamento?",
        explanation:
            "Os Hosts Dedicados reservam um servidor físico inteiro e mostram seus soquetes e núcleos, o que permite usar licenças cobradas por núcleo ou por soquete (BYOL). On-Demand, Spot e Reservadas são formas de pagamento que, por padrão, rodam em hardware compartilhado e não expõem essa topologia física.",
        topic: "Preços e faturamento",
        options: [
            ["Hosts Dedicados", true],
            ["Instâncias On-Demand", false],
            ["Instâncias Spot", false],
            ["Instâncias Reservadas", false],
        ],
    },
    {
        statement:
            "Uma empresa tem várias contas da AWS que até agora eram cobradas de forma independente. Qual recurso é o mais adequado para reunir a cobrança dessas contas?",
        explanation:
            "O faturamento consolidado do AWS Organizations reúne contas antes independentes sob a conta de gerenciamento, que recebe uma única fatura e soma o uso para descontos por volume. O Cost Explorer analisa gastos, o Data Exports exporta dados de custo e as tags de alocação classificam custos, sem unificar a cobrança.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost Explorer", false],
            ["Faturamento consolidado", true],
            ["AWS Data Exports", false],
            ["Tags de alocação de custos", false],
        ],
    },
    {
        statement: "Para que serve o AWS Pricing Calculator?",
        explanation:
            "O AWS Pricing Calculator é uma ferramenta web gratuita para modelar uma solução e estimar seus custos antes de criá-la. Relatórios de custos já cobrados vêm do AWS Data Exports, a comparação com o orçado e os alertas são do AWS Budgets, e gastos fora do padrão são detectados pelo AWS Cost Anomaly Detection.",
        topic: "Preços e faturamento",
        options: [
            [
                "Receber relatórios que detalham os custos já cobrados por duração, recurso ou tag",
                false,
            ],
            ["Montar estimativas do custo de uma solução na AWS antes de construí-la", true],
            ["Comparar os custos reais com os valores orçados e enviar alertas por e-mail", false],
            ["Detectar gastos fora do padrão com machine learning e avisar a equipe", false],
        ],
    },
    {
        statement: "Qual é o plano MÍNIMO do AWS Support que dá acesso à AWS Support API?",
        explanation:
            "A AWS Support API, que permite abrir e gerenciar casos e consultar o AWS Trusted Advisor por código, exige o AWS Business Support+, o AWS Enterprise Support ou o AWS Unified Operations. O Basic não dá acesso à API, e Enterprise e Unified Operations também dão, mas não são o plano mínimo.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Basic Support", false],
            ["AWS Business Support+", true],
            ["AWS Enterprise Support", false],
            ["AWS Unified Operations", false],
        ],
    },
    {
        statement:
            "Qual é o plano do AWS Support de MENOR custo que inclui, sem custo adicional, o AWS Security Incident Response, para receber orientação na resposta a incidentes como sequestro de conta e ransomware?",
        explanation:
            "Pela documentação atual, o Enterprise Support inclui o AWS Security Incident Response sem custo adicional, além de TAM designado e resposta em até 15 minutos para casos críticos. No Business Support+ o serviço é cobrado à parte, o Basic só abre casos de conta e faturamento, e o Unified Operations também o inclui, mas custa bem mais.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Basic Support", false],
            ["AWS Business Support+", false],
            ["AWS Enterprise Support", true],
            ["AWS Unified Operations", false],
        ],
    },
    {
        statement:
            "Qual ferramenta pode ser usada para monitorar o uso das cotas de serviço (limites de serviço) da AWS?",
        explanation:
            "O AWS Trusted Advisor tem a categoria de verificações de limites de serviço, que avisa quando o uso se aproxima da cota e está disponível em todos os planos. O Pricing Calculator estima custos, o Health Dashboard informa eventos da AWS que afetam suas contas e o Data Exports exporta dados de custo e uso.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Pricing Calculator", false],
            ["AWS Trusted Advisor", true],
            ["AWS Health Dashboard", false],
            ["AWS Data Exports", false],
        ],
    },
    {
        statement:
            "A aplicação de uma empresa tem horários de início e de término flexíveis. Qual modelo de preço do Amazon EC2 é o MAIS econômico para essa aplicação?",
        explanation:
            "As Instâncias Spot usam capacidade ociosa do EC2 com descontos de até 90% e combinam com aplicações de início e término flexíveis, que aceitam ser interrompidas e retomadas. On-Demand cobra o preço cheio, Reservadas exigem compromisso de 1 ou 3 anos e Hosts Dedicados custam mais pelo servidor exclusivo.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", false],
            ["Instâncias Spot", true],
            ["Instâncias Reservadas", false],
            ["Hosts Dedicados", false],
        ],
    },
    {
        statement:
            "Um profissional de nuvem tem uma carga de análise de dados que roda poucas vezes e pode ser interrompida sem prejuízo. Para otimizar o custo, qual opção de compra do Amazon EC2 ele deve usar?",
        explanation:
            "Cargas esporádicas que toleram interrupção são o caso típico das Instâncias Spot, que oferecem os maiores descontos em troca de a AWS poder recuperar a capacidade. On-Demand não tem desconto, Reservadas pagariam por capacidade ociosa num compromisso de 1 ou 3 anos e Hosts Dedicados custam mais.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", false],
            ["Instâncias Reservadas", false],
            ["Instâncias Spot", true],
            ["Hosts Dedicados", false],
        ],
    },
    {
        statement:
            "Uma empresa com o plano AWS Business Support+ criou um banco de dados no Amazon RDS, e o desenvolvedor responsável não consegue se conectar a ele. Quem ele deve procurar para resolver o problema?",
        explanation:
            "O Business Support+ inclui casos de suporte técnico ilimitados, com atendimento 24 horas, então o caminho é abrir um caso no AWS Support. Um TAM designado só existe a partir do Enterprise, e o AWS Professional Services e os parceiros da AWS Partner Network atuam em projetos contratados, não no suporte do plano.",
        topic: "Ferramentas e suporte",
        options: [
            ["O AWS Support, abrindo um caso técnico pelo console", true],
            ["O AWS Professional Services, com um projeto de consultoria", false],
            ["O Technical Account Manager (TAM) designado da conta", false],
            ["Um parceiro de consultoria da AWS Partner Network", false],
        ],
    },
    {
        statement:
            "Em quais categorias o AWS Trusted Advisor oferece recomendações? (Selecione DUAS opções.)",
        explanation:
            "O Trusted Advisor organiza suas verificações em seis categorias: otimização de custos, desempenho, segurança, tolerância a falhas, limites de serviço e excelência operacional. Auditoria de atividades é papel do AWS CloudTrail e do AWS Config, e arquitetura sem servidor e escalabilidade não são categorias do serviço.",
        topic: "Ferramentas e suporte",
        options: [
            ["Otimização de custos", true],
            ["Auditoria", false],
            ["Arquitetura sem servidor", false],
            ["Desempenho", true],
            ["Escalabilidade", false],
        ],
    },
    {
        statement:
            "Uma empresa que opera na Nuvem AWS precisa de faturas separadas para cada ambiente, como desenvolvimento, testes e produção. Como ela pode conseguir isso?",
        explanation:
            "A cobrança da AWS é organizada por conta. Com uma conta para cada ambiente, os custos de desenvolvimento, testes e produção ficam separados e podem gerar faturas próprias. Tags e o Cost Explorer só classificam e filtram custos dentro da mesma cobrança, e VPCs isolam a rede sem separar a fatura.",
        topic: "Preços e faturamento",
        options: [
            ["Usar uma conta da AWS para cada ambiente", true],
            ["Aplicar tags de ambiente aos recursos", false],
            ["Criar uma VPC separada para cada ambiente", false],
            ["Filtrar os custos por ambiente no AWS Cost Explorer", false],
        ],
    },
    {
        statement:
            "O que pode ser usado para reduzir o custo de execução de instâncias do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "Instâncias Spot dão grandes descontos para cargas sem estado e flexíveis, que toleram interrupção, e Instâncias Reservadas reduzem o custo de cargas contínuas com compromisso de 1 ou 3 anos. On-Demand é o preço cheio, a família de instância deve seguir o perfil da carga e o AWS Budgets alerta sobre gastos, mas não reduz o preço.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Spot para cargas sem estado e com horário flexível", true],
            ["Instâncias otimizadas para memória em cargas que exigem muita CPU", false],
            ["Instâncias On-Demand para cargas de alto custo e uso contínuo", false],
            ["Instâncias Reservadas para cargas de trabalho de uso contínuo", true],
            ["Limites de gasto definidos no AWS Budgets para barrar cobranças", false],
        ],
    },
    {
        statement:
            "Qual requisito precisa ser atendido para que uma conta-membro seja removida de uma organização no AWS Organizations?",
        explanation:
            "Ao sair da organização, a conta passa a pagar a própria fatura, por isso precisa ter as informações de uma conta independente: plano de suporte, contato verificado e forma de pagamento. A remoção pode partir da conta de gerenciamento ou da própria conta-membro, sem caso no AWS Support, e certificação SOC não é requisito.",
        topic: "Preços e faturamento",
        options: [
            [
                "A conta-membro precisa ter certificação SOC (System and Organization Controls) ativa",
                false,
            ],
            [
                "A conta de gerenciamento e a conta-membro precisam abrir casos no AWS Support",
                false,
            ],
            ["A conta-membro precisa ter as informações exigidas de uma conta independente", true],
            [
                "A remoção só pode ser feita a partir da conta de gerenciamento da organização",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais práticas ajudam a identificar os custos da AWS de cada departamento de uma empresa? (Selecione DUAS opções.)",
        explanation:
            "Tags de alocação de custos permitem filtrar os gastos por departamento nos relatórios, e contas separadas por departamento criam divisões claras na cobrança. Um gerente de contas não atribui custos, o Trusted Advisor recomenda boas práticas e o faturamento consolidado junta as contas em uma fatura, sem identificar departamentos.",
        topic: "Preços e faturamento",
        options: [
            ["Aplicar tags com o nome do departamento a cada recurso", true],
            ["Usar uma conta da AWS separada por departamento", true],
            ["Contratar um gerente de contas da AWS para a empresa", false],
            ["Executar as verificações do AWS Trusted Advisor", false],
            ["Receber uma única fatura com o faturamento consolidado", false],
        ],
    },
    {
        statement:
            "Uma empresa vai testar por um mês, em projeto piloto, uma nova aplicação voltada aos clientes no Amazon Elastic Compute Cloud (Amazon EC2). Qual modelo de preço é o mais adequado?",
        explanation:
            "Um piloto de um mês pede On-Demand: não há compromisso de longo prazo e a capacidade não é interrompida, algo essencial para uma aplicação usada por clientes. Reservadas exigem pelo menos 1 ano, Spot pode ser recuperada pela AWS a qualquer momento e Hosts Dedicados custam mais sem necessidade.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas", false],
            ["Instâncias Spot", false],
            ["Instâncias On-Demand", true],
            ["Hosts Dedicados", false],
        ],
    },
    {
        statement:
            "Por meio de qual serviço é possível configurar uma conta de gerenciamento que paga e visualiza a cobrança consolidada de várias contas da AWS?",
        explanation:
            "No AWS Organizations, a conta de gerenciamento paga as cobranças de todas as contas-membro e vê o faturamento consolidado. O AWS Budgets cria orçamentos e alertas, o AWS Cost Explorer analisa gastos já existentes e o Amazon Quick Sight monta painéis de BI, mas nenhum deles cria a estrutura de conta pagadora.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Budgets", false],
            ["AWS Cost Explorer", false],
            ["Amazon Quick Sight", false],
            ["AWS Organizations", true],
        ],
    },
    {
        statement:
            "Qual é uma característica das Instâncias Reservadas Conversíveis do Amazon EC2?",
        explanation:
            "Conversíveis podem ser trocadas por outras Conversíveis com família, sistema operacional ou locação diferentes, desde que o novo valor seja igual ou maior. A Região fica fixa durante todo o prazo, só Reservadas Standard podem ser vendidas no Reserved Instance Marketplace e combinar reservas não encurta o prazo.",
        topic: "Preços e faturamento",
        options: [
            [
                "Podem ser trocadas por outras Conversíveis de outra família de instância, com valor igual ou maior",
                true,
            ],
            [
                "Podem ser trocadas por outras Conversíveis em uma Região diferente da AWS, com valor igual ou maior",
                false,
            ],
            [
                "Podem ser vendidas a outros clientes no Reserved Instance Marketplace a qualquer momento",
                false,
            ],
            [
                "Podem ter o prazo encurtado quando combinadas com outras Conversíveis da mesma conta",
                false,
            ],
        ],
    },
    {
        statement:
            "Um profissional de nuvem precisa de uma instância do Amazon EC2 que seja iniciada e rode por 7 horas, sem interrupções. Qual é a opção mais adequada e econômica para essa tarefa?",
        explanation:
            "Para uma tarefa única de 7 horas que não pode parar, On-Demand é o ideal: paga-se só pelo tempo de uso, sem compromisso e sem risco de interrupção. Reservadas exigem compromisso de 1 ou 3 anos, Hosts Dedicados custam mais pelo servidor exclusivo e Spot pode ser interrompida pela AWS.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", true],
            ["Instâncias Reservadas", false],
            ["Hosts Dedicados", false],
            ["Instâncias Spot", false],
        ],
    },
    {
        statement:
            "Que vantagens o AWS Trusted Advisor traz para uma conta da AWS? (Selecione DUAS opções.)",
        explanation:
            "O Trusted Advisor verifica a conta e aponta recursos subutilizados, como instâncias ociosas, e riscos de segurança, como portas abertas ou falta de MFA no usuário raiz. Orquestrar contêineres é papel do Amazon ECS e do Amazon EKS, chaves de criptografia ficam no AWS KMS e impor tags é feito com políticas do AWS Organizations.",
        topic: "Ferramentas e suporte",
        options: [
            ["Orquestrar contêineres com alto desempenho em clusters gerenciados", false],
            ["Criar e rotacionar chaves de criptografia para proteger dados", false],
            ["Detectar recursos subutilizados ou ociosos para reduzir custos", true],
            ["Melhorar a segurança com monitoramento proativo do ambiente", true],
            ["Impor o uso obrigatório de tags em todos os recursos da conta", false],
        ],
    },
    {
        statement:
            "Qual ferramenta permite que pessoas sem conta na AWS estimem o custo de praticamente todos os serviços da AWS?",
        explanation:
            "O AWS Pricing Calculator é uma ferramenta web gratuita e pública, usada sem conta na AWS, para montar estimativas de quase todos os serviços. Cost Explorer, Budgets e o console do Billing and Cost Management trabalham com dados de uma conta existente, então não servem para quem ainda não tem conta.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost Explorer", false],
            ["AWS Billing and Cost Management", false],
            ["AWS Budgets", false],
            ["AWS Pricing Calculator", true],
        ],
    },
    {
        statement:
            "Um servidor de banco de dados no Amazon EC2 precisa ficar ligado sem interrupção durante um ano. Entre as opções abaixo, qual modelo de preço gera a MAIOR economia?",
        explanation:
            "Para um banco que precisa ficar ligado o ano todo, a Reservada de 1 ano é a escolha, e com pagamento adiantado parcial o desconto é maior que sem adiantamento. Spot pode ser interrompida, o que não serve para um banco de dados, e On-Demand cobra o preço cheio, sem desconto por compromisso.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Spot, com preço variável conforme a capacidade", false],
            ["Instâncias On-Demand, com cobrança por segundo sem compromisso", false],
            ["Instâncias Reservadas com pagamento adiantado parcial", true],
            ["Instâncias Reservadas sem nenhum pagamento adiantado", false],
        ],
    },
    {
        statement:
            "A AnyCompany comprou a Example Corp. As duas empresas usam a AWS, e a AnyCompany quer receber uma única fatura com a cobrança das duas. O que permite isso?",
        explanation:
            "A conta de gerenciamento da organização da AnyCompany envia um convite à conta da Example Corp.; ao aceitar, ela vira conta-membro e entra no faturamento consolidado, com uma única fatura. Não é preciso acionar TAM, arquiteto ou caso de suporte, e migrar todos os recursos seria trabalhoso e desnecessário.",
        topic: "Preços e faturamento",
        options: [
            [
                "A Example Corp. pedir a um arquiteto de soluções ou TAM da AWS que una as contas",
                false,
            ],
            ["A AnyCompany abrir um caso no AWS Support pedindo a junção das duas faturas", false],
            [
                "Convidar a conta da Example Corp. para a organização da AnyCompany no AWS Organizations",
                true,
            ],
            [
                "Migrar as VPCs, instâncias EC2 e demais recursos da Example Corp. para a conta da AnyCompany",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual conjunto de verificações do AWS Trusted Advisor está disponível para todos os clientes da AWS, inclusive no plano Basic Support?",
        explanation:
            "Todo cliente, inclusive no Basic, tem as verificações principais do Trusted Advisor: toda a categoria de limites de serviço e algumas de segurança, como MFA no usuário raiz e permissões de buckets do S3. O conjunto completo, com otimização de custos e desempenho, exige Business Support+, Enterprise ou Unified Operations.",
        topic: "Ferramentas e suporte",
        options: [
            ["Verificações principais (core checks)", true],
            ["Todas as verificações de todas as categorias", false],
            ["Verificações de otimização de custos", false],
            ["Verificações de desempenho", false],
        ],
    },
    {
        statement:
            "Uma carga de trabalho vai rodar por tempo indeterminado na AWS, sempre com a mesma quantidade de instâncias do Amazon EC2. Qual modelo de preço minimiza o custo sem que as instâncias corram risco de interrupção?",
        explanation:
            "Uso estável e contínuo é o caso das Instâncias Reservadas, que dão até 72% de desconto sobre o On-Demand em troca de compromisso de 1 ou 3 anos. On-Demand cobra o preço cheio, Spot é mais barata mas pode ser interrompida pela AWS e Hosts Dedicados custam mais pelo servidor físico exclusivo.",
        topic: "Preços e faturamento",
        options: [
            ["Hosts Dedicados do Amazon EC2", false],
            ["Instâncias On-Demand", false],
            ["Instâncias Spot", false],
            ["Instâncias Reservadas", true],
        ],
    },
    {
        statement:
            "Qual opção do Amazon EC2 permite comprar capacidade computacional ociosa da AWS, geralmente com grande desconto?",
        explanation:
            "As Instâncias Spot vendem a capacidade ociosa do EC2 com descontos de até 90% sobre o On-Demand, e a AWS pode recuperá-la com aviso de dois minutos. Reservadas dão desconto por compromisso de 1 ou 3 anos, On-Demand é o preço padrão sem desconto e Hosts Dedicados custam mais pelo servidor exclusivo.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Reservadas", false],
            ["Instâncias On-Demand", false],
            ["Hosts Dedicados", false],
            ["Instâncias Spot", true],
        ],
    },
    {
        statement:
            "Uma empresa roda, diretamente no Amazon EC2, um banco de dados Oracle autogerenciado que tem uso estável e não pode sofrer interrupções. Ela quer reduzir o custo de computação. Qual opção gera a MAIOR economia em um prazo de 3 anos?",
        explanation:
            "Um banco com uso estável por 3 anos é o caso clássico das Instâncias Reservadas, com até 72% de desconto sobre o On-Demand. Instâncias Dedicadas custam mais pelo hardware exclusivo, Spot pode ser interrompida mesmo com hibernação, o que não serve para um banco de produção, e On-Demand cobra o preço cheio.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias Dedicadas", false],
            ["Instâncias Spot com hibernação", false],
            ["Instâncias Reservadas", true],
            ["Instâncias On-Demand", false],
        ],
    },
    {
        statement:
            "Quais são benefícios do faturamento consolidado para os serviços da Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "O faturamento consolidado do AWS Organizations soma o uso de todas as contas para alcançar faixas de desconto por volume e entrega uma única fatura. O recurso não tem custo extra nem opção de parcelamento, e orçamentos personalizados de custo e uso são criados no AWS Budgets.",
        topic: "Preços e faturamento",
        options: [
            ["Descontos por volume com a soma do uso das contas", true],
            ["Uma pequena taxa adicional cobrada pelo uso do recurso", false],
            ["Uma única fatura para todas as contas da organização", true],
            ["Opção de parcelar o pagamento das faturas mensais", false],
            ["Criação de orçamentos personalizados de custo e uso", false],
        ],
    },
    {
        statement:
            "Uma empresa espera um pico de tráfego de curta duração em sua aplicação, que não pode ser interrompida durante esse período. A empresa também quer minimizar o custo e ter o máximo de flexibilidade. Qual opção de compra do Amazon EC2 ela deve usar?",
        explanation:
            "Para um pico curto que não pode sofrer interrupção, On-Demand oferece flexibilidade total, sem compromisso, pagando só pelo período de uso. Spot é mais barata mas pode ser interrompida, Reservadas exigem compromisso de 1 ou 3 anos, desproporcional para um pico passageiro, e Hosts Dedicados custam mais.",
        topic: "Preços e faturamento",
        options: [
            ["Instâncias On-Demand", true],
            ["Instâncias Spot", false],
            ["Instâncias Reservadas", false],
            ["Hosts Dedicados", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS usa machine learning para analisar a configuração e as métricas de utilização de instâncias do Amazon EC2 e recomendar os tipos de instância ideais?",
        explanation:
            "O AWS Compute Optimizer aplica machine learning ao histórico de métricas de utilização, como CPU e rede, para recomendar o tipo e o tamanho ideais das instâncias. O Amazon Inspector procura vulnerabilidades, o AWS Config registra a configuração dos recursos para conformidade e o Systems Manager Inventory coleta metadados das instâncias.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Inspector", false],
            ["AWS Compute Optimizer", true],
            ["AWS Config", false],
            ["AWS Systems Manager Inventory", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS usa modelos de machine learning para identificar mudanças inesperadas nos gastos da AWS, sem que o usuário precise definir limites de gasto?",
        explanation:
            "O AWS Cost Anomaly Detection aprende o padrão de gastos com machine learning e avisa quando surge um custo fora do esperado, sem exigir um limite fixo. O AWS Budgets só alerta ao passar de um valor definido, mesmo nos alertas de previsão, o Trusted Advisor recomenda boas práticas e o GuardDuty detecta ameaças de segurança.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Budgets com alertas de previsão", false],
            ["AWS Cost Anomaly Detection", true],
            ["AWS Trusted Advisor", false],
            ["Amazon GuardDuty", false],
        ],
    },
    {
        statement:
            "Uma empresa com várias unidades de negócio quer repassar os custos da AWS a cada departamento (chargeback), criando regras que agrupam os gastos por conta, tag ou serviço em grupos com nomes próprios. Qual recurso da AWS permite isso?",
        explanation:
            "O AWS Cost Categories cria regras que mapeiam custos por conta, tag, serviço e outras dimensões para grupos com nomes próprios, como departamentos, usados em relatórios de chargeback. O Cost Explorer só analisa e filtra gastos, as tags de alocação rotulam recursos um a um e o Budgets cria orçamentos com alertas.",
        topic: "Preços e faturamento",
        options: [
            ["AWS Cost Explorer", false],
            ["AWS Cost Categories", true],
            ["Tags de alocação de custos", false],
            ["AWS Budgets", false],
        ],
    },
    {
        statement:
            "Uma empresa com o plano AWS Business Support+ abre um caso de suporte porque sua carga de trabalho de produção está com o desempenho degradado, mas não parou totalmente. Qual é o tempo de resposta inicial previsto para esse caso?",
        explanation:
            "Sistema de produção prejudicado, com funções importantes degradadas, tem primeira resposta em até 4 horas no Business Support+. 24 horas vale para orientação geral, 12 horas para sistema prejudicado sem impacto crítico e 1 hora para sistema de produção fora do ar; sistema crítico para o negócio fora do ar tem menos de 30 minutos.",
        topic: "Ferramentas e suporte",
        options: [
            ["Menos de 24 horas", false],
            ["Menos de 12 horas", false],
            ["Menos de 4 horas", true],
            ["Menos de 1 hora", false],
        ],
    },
    {
        statement:
            "Qual é uma diferença importante entre o plano AWS Basic Support e o plano AWS Business Support+?",
        explanation:
            "O Business Support+ inclui suporte técnico 24 horas por telefone, chat e e-mail, enquanto o Basic não abre casos técnicos e fica com atendimento ao cliente, documentação e AWS re:Post. Nenhum dos dois tem TAM, que começa no Enterprise, o conjunto completo do Trusted Advisor é do Business Support+ e o plano não exige ser parceiro da AWS.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "O Basic inclui um Technical Account Manager (TAM); o Business Support+ não inclui",
                false,
            ],
            [
                "O Business Support+ dá acesso 24 horas a engenheiros por telefone, chat e e-mail; o Basic não",
                true,
            ],
            [
                "O Basic dá acesso a todas as verificações do Trusted Advisor; o Business Support+ só às principais",
                false,
            ],
            [
                "O Business Support+ só pode ser contratado por membros da AWS Partner Network",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece um local central para consultar e gerenciar as cotas padrão dos recursos de uma conta e solicitar aumentos quando necessário?",
        explanation:
            "O Service Quotas centraliza os valores das cotas de cada serviço, mostra o uso em relação a elas e permite pedir aumento direto no console. O Trusted Advisor só alerta sobre parte dos limites e não envia pedidos de aumento, o AWS Organizations governa várias contas e o AWS Config avalia a configuração dos recursos.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Trusted Advisor", false],
            ["AWS Organizations", false],
            ["Service Quotas", true],
            ["AWS Config", false],
        ],
    },
];
