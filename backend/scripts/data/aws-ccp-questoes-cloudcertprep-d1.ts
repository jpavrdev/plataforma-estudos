// Questões do simulado AWS Certified Cloud Practitioner (CLF-C02), domínio 1 da prova
// (Cloud Concepts), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aws-ccp-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D1: Questao[] = [
    {
        statement:
            "Quais das opções a seguir estão relacionadas à confiabilidade na Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "Confiabilidade é a capacidade de a carga de trabalho funcionar corretamente, obter recursos conforme a demanda e se recuperar rapidamente de falhas. Menor privilégio é prática de Segurança, a maioria dos serviços da AWS é regional e não global, e compensar clientes é crédito de SLA, não princípio de design.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Aplicar o princípio do menor privilégio a todos os recursos da AWS", false],
            ["Provisionar automaticamente novos recursos para atender à demanda", true],
            [
                "Todos os serviços da AWS são globais, o que ajuda a atender usuários internacionais",
                false,
            ],
            ["Compensar financeiramente os clientes quando ocorrerem problemas", false],
            ["Recuperar-se rapidamente de falhas na infraestrutura ou nos serviços", true],
        ],
    },
    {
        statement:
            "Uma empresa japonesa hospeda suas aplicações em instâncias do Amazon EC2 na Região de Tóquio. Depois de abrir filiais nos Estados Unidos, os usuários americanos passaram a reclamar de alta latência. O que a empresa pode fazer para reduzir a latência desses usuários com o menor custo?",
        explanation:
            "Implantar instâncias em uma Região nos EUA aproxima a aplicação dos usuários e reduz a latência sem grande custo. O roteamento por latência do Route 53 não resolve se tudo continua em Tóquio, um domínio novo não muda a distância física e construir um data center exige alto investimento de capital.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Aplicar a política de roteamento baseada em latência do Amazon Route 53", false],
            ["Registrar um novo nome de domínio americano para atender os usuários dos EUA", false],
            ["Construir um data center nos EUA e adotar um modelo de nuvem híbrida", false],
            ["Implantar novas instâncias do Amazon EC2 em uma Região localizada nos EUA", true],
        ],
    },
    {
        statement:
            "Quais são benefícios de hospedar a infraestrutura na AWS? (Selecione DUAS opções.)",
        explanation:
            "Na AWS, recursos são provisionados em minutos, o que aumenta a agilidade, e a AWS cuida da segurança da nuvem: instalações, hardware e rede subjacente. O armazenamento é cobrado pelo uso, o cliente não controla o hardware físico e operar as aplicações continua sendo responsabilidade do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Mais velocidade e agilidade para provisionar recursos e lançar produtos", true],
            ["Armazenamento gratuito e ilimitado para todos os dados da empresa", false],
            [
                "Controle total sobre o hardware físico e as instalações dos data centers da AWS",
                false,
            ],
            ["A AWS assume a operação das aplicações desenvolvidas pelos clientes", false],
            ["A AWS cuida da segurança física e da infraestrutura de rede subjacente", true],
        ],
    },
    {
        statement: "Qual é a vantagem da prática recomendada pela AWS de desacoplar as aplicações?",
        explanation:
            "Desacoplar é fazer os componentes funcionarem de forma independente, para que a falha de um não se propague aos demais. Tratar a aplicação como unidade única descreve o monólito, atualizar um monólito exige implantar tudo junto e rastrear chamadas de API é função do AWS CloudTrail.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Permite tratar a aplicação como uma unidade única e coesa", false],
            ["Reduz interdependências para que falhas não afetem outros componentes", true],
            ["Permite atualizar qualquer aplicação monolítica de forma rápida e fácil", false],
            ["Permite rastrear qualquer chamada de API feita a qualquer serviço da AWS", false],
        ],
    },
    {
        statement:
            "A elasticidade é um dos princípios de arquitetura na nuvem mais importantes recomendados pela AWS. Como esse princípio melhora o design da sua arquitetura?",
        explanation:
            "Elasticidade é provisionar e liberar recursos automaticamente conforme a demanda muda, pagando só pelo necessário. O Elastic Load Balancer distribui tráfego, mas quem adiciona ou remove instâncias é o Auto Scaling; reduzir interdependências é acoplamento fraco; e o conceito vale para recursos na nuvem, não on-premises.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Escalando automaticamente os recursos on-premises conforme a variação da demanda",
                false,
            ],
            ["Escalando automaticamente os recursos da AWS com um Elastic Load Balancer", false],
            ["Reduzindo ao máximo as interdependências entre os componentes da aplicação", false],
            [
                "Provisionando automaticamente os recursos da AWS necessários conforme a demanda",
                true,
            ],
        ],
    },
    {
        statement:
            "Qual das opções a seguir NÃO faz parte dos modelos de computação em nuvem descritos pela AWS?",
        explanation:
            "Os modelos de serviço de computação em nuvem descritos pela AWS são IaaS, PaaS e SaaS; redes como serviço (NaaS) não é um deles. IaaS entrega infraestrutura virtualizada, PaaS entrega uma plataforma gerenciada para implantar aplicações e SaaS entrega o software pronto ao usuário final.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Plataforma como serviço (PaaS)", false],
            ["Infraestrutura como serviço (IaaS)", false],
            ["Software como serviço (SaaS)", false],
            ["Redes como serviço (NaaS)", true],
        ],
    },
    {
        statement:
            "De acordo com as boas práticas, como uma aplicação deve ser projetada para ser executada na Nuvem AWS?",
        explanation:
            "Componentes fracamente acoplados podem escalar, falhar e ser atualizados de forma independente, sem efeito em cascata. Componentes fortemente acoplados propagam falhas, o design monolítico dificulta escalar partes isoladas e componentes que guardam estado localmente atrapalham a escalabilidade horizontal.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Com componentes fortemente acoplados", false],
            ["Com componentes fracamente acoplados", true],
            ["Com componentes monolíticos", false],
            ["Com componentes com estado (stateful)", false],
        ],
    },
    {
        statement: "Como a AWS reduz o tempo necessário para provisionar recursos de TI?",
        explanation:
            "Na AWS, recursos são criados sob demanda por APIs, SDKs, CLI ou templates, em minutos e sem compra de hardware. A AWS não usa sistema de chamados nem fluxo com fornecedores para liberar recursos, e validação de código é qualidade de software, sem relação com o tempo de provisionamento.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Oferece uma plataforma on-line de chamados para solicitar recursos de TI", false],
            ["Oferece serviços de validação automática do código das aplicações", false],
            ["Permite provisionar recursos de forma programática, por meio de APIs", true],
            [
                "Automatiza o processo de solicitação de recursos aos fornecedores de TI da empresa",
                false,
            ],
        ],
    },
    {
        statement:
            "Servidores web executados no Amazon EC2 acessam uma aplicação legada que roda no data center da empresa. Qual termo descreve esse modelo?",
        explanation:
            "Quando recursos na AWS se comunicam com sistemas que continuam no data center da empresa, a arquitetura é híbrida. Nativo da nuvem descreve aplicações feitas só para a nuvem, rede de parceiros é o programa AWS Partner Network e IaaS é um modelo de serviço, não a combinação de nuvem com on-premises.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Nativo da nuvem (cloud-native)", false],
            ["Rede de parceiros", false],
            ["Arquitetura de nuvem híbrida", true],
            ["Infraestrutura como serviço", false],
        ],
    },
    {
        statement:
            "Qual é uma vantagem de transferir a infraestrutura de um data center on-premises para a Nuvem AWS?",
        explanation:
            "Ao delegar à AWS a gestão da infraestrutura física, a empresa direciona equipe e orçamento para o que diferencia o negócio. Os gastos com TI continuam, pois paga-se pelo uso; instalar servidores nos clientes é o oposto de migrar para a nuvem; e aplicar patches no sistema operacional das instâncias segue sendo tarefa do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Permite que a empresa elimine totalmente os gastos com TI", false],
            ["Permite que a empresa instale um servidor no data center de cada cliente", false],
            ["Permite que a empresa se concentre nas atividades do negócio", true],
            ["Permite que a empresa deixe os servidores sem aplicar patches", false],
        ],
    },
    {
        statement:
            "Como um usuário pode se proteger de interrupções nos serviços da AWS caso um desastre natural atinja toda uma área geográfica?",
        explanation:
            "Um desastre que atinge toda uma área geográfica pode derrubar uma Região inteira, então implantar em várias Regiões mantém a aplicação no ar. Zonas de Disponibilidade ficam na mesma Região, a nuvem híbrida na mesma área sofre o mesmo impacto e o AWS Artifact é um portal de relatórios de conformidade, não de armazenamento.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantando as aplicações em várias Zonas de Disponibilidade de uma Região", false],
            ["Usando nuvem híbrida dentro da mesma área geográfica", false],
            ["Implantando as aplicações em várias Regiões da AWS", true],
            ["Guardando artefatos no AWS Artifact e replicando-os entre Regiões", false],
        ],
    },
    {
        statement:
            "Qual estratégia de recuperação de desastres oferece a menor probabilidade de tempo de inatividade?",
        explanation:
            "No multissite ativo-ativo, cópias completas da carga de trabalho rodam ao mesmo tempo em mais de um local, e se um falhar o outro já atende todo o tráfego. Backup e restauração tem a recuperação mais lenta, a luz piloto mantém só o núcleo ativo e o warm standby roda uma versão reduzida que precisa escalar antes de assumir a carga.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Backup e restauração", false],
            ["Luz piloto (pilot light)", false],
            ["Warm standby", false],
            ["Multissite ativo-ativo", true],
        ],
    },
    {
        statement:
            "Quais opções podem ajudar a avaliar uma aplicação antes de migrá-la para a nuvem? (Selecione DUAS opções.)",
        explanation:
            "O AWS Professional Services oferece consultores da própria AWS para avaliar e planejar migrações, e a AWS Partner Network reúne parceiros com experiência comprovada em migração. O Trusted Advisor verifica ambientes que já estão na AWS, o Systems Manager gerencia a operação dos recursos e o Secrets Manager guarda credenciais.",
        topic: "Migração",
        options: [
            ["Verificações do AWS Trusted Advisor", false],
            ["AWS Professional Services", true],
            ["AWS Systems Manager", false],
            ["AWS Partner Network (APN)", true],
            ["AWS Secrets Manager", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é uma proposta de valor da Nuvem AWS?",
        explanation:
            "No modelo de pagamento conforme o uso não há contrato de longo prazo: o cliente usa os serviços sob demanda e pode parar quando quiser. A segurança na nuvem é do cliente (a AWS cuida da segurança da nuvem), servidores são provisionados em minutos, e não em dias, e as aplicações continuam sob gestão do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["A AWS é responsável pela segurança na Nuvem AWS", false],
            ["Não é necessário firmar um contrato de longo prazo", true],
            ["É possível provisionar novos servidores em alguns dias", false],
            ["A AWS gerencia as aplicações dos usuários na Nuvem AWS", false],
        ],
    },
    {
        statement:
            "Quais são os benefícios de desenvolver e executar uma nova aplicação na Nuvem AWS em comparação com um ambiente on-premises? (Selecione DUAS opções.)",
        explanation:
            "Na AWS é simples usar várias Zonas de Disponibilidade, balanceadores de carga e serviços gerenciados para ter alta disponibilidade, e a elasticidade ajusta a capacidade à demanda. A replicação global dos dados depende da configuração do cliente, e operar a aplicação e aplicar seus patches continua sendo responsabilidade do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "A AWS distribui os dados automaticamente pelo mundo para aumentar a durabilidade",
                false,
            ],
            ["A AWS se encarrega de operar a aplicação no dia a dia", false],
            ["A AWS facilita projetar a arquitetura para alta disponibilidade", true],
            ["A AWS acomoda com facilidade as variações de demanda da aplicação", true],
            ["A AWS se encarrega de aplicar os patches de segurança da aplicação", false],
        ],
    },
    {
        statement:
            "Uma solução capaz de suportar o crescimento de usuários, de tráfego ou do volume de dados sem perda de desempenho está alinhada a qual princípio de arquitetura na nuvem?",
        explanation:
            "Suportar crescimento sem perda de desempenho é escalabilidade, obtida na nuvem com elasticidade: recursos entram e saem automaticamente conforme a carga. Pensar em paralelo busca executar tarefas simultâneas para ganhar velocidade, desacoplar evita falhas em cascata e projetar para falhas trata de resiliência.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Pensar em paralelo", false],
            ["Implementar elasticidade", true],
            ["Desacoplar os componentes", false],
            ["Projetar para falhas", false],
        ],
    },
    {
        statement:
            "Qual benefício da Nuvem AWS elimina a necessidade de os usuários tentarem estimar o uso futuro da infraestrutura?",
        explanation:
            "Com a elasticidade, os recursos aumentam ou diminuem conforme a demanda real, então não é preciso prever e comprar capacidade para o pico futuro. Implantar em várias Regiões dá alcance global, a segurança da nuvem não trata de capacidade e as economias de escala reduzem preços, mas não dispensam a estimativa de uso.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantação rápida e fácil de aplicações em várias Regiões do mundo", false],
            ["Segurança da Nuvem AWS", false],
            ["Elasticidade da Nuvem AWS", true],
            ["Custos variáveis menores graças às enormes economias de escala", false],
        ],
    },
    {
        statement:
            "Como a Nuvem AWS pode aumentar a produtividade das equipes depois da migração de um data center on-premises?",
        explanation:
            "Na AWS, as equipes provisionam a infraestrutura por conta própria em minutos, sem esperar a compra e a instalação de hardware. O ganho não vem de a infraestrutura ser mais rápida, a configuração das aplicações continua com o cliente e a segurança e a conformidade na nuvem seguem sendo responsabilidade do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "As equipes não precisam esperar semanas pelo provisionamento da infraestrutura",
                true,
            ],
            [
                "A infraestrutura da Nuvem AWS é muito mais rápida que a de um data center on-premises",
                false,
            ],
            [
                "A AWS assume o gerenciamento da configuração das aplicações em nome das equipes",
                false,
            ],
            ["As equipes deixam de precisar tratar de questões de segurança e conformidade", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é um exemplo de agilidade na Nuvem AWS?",
        explanation:
            "Agilidade na nuvem é obter recursos em minutos, e não em semanas, o que permite experimentar e entregar mais rápido. Vários tipos de instância dão flexibilidade para escolher a capacidade, serviços gerenciados reduzem o trabalho operacional e o faturamento consolidado apenas une as cobranças de várias contas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Acesso a vários tipos e tamanhos de instância", false],
            ["Acesso a serviços gerenciados pela própria AWS", false],
            ["Uso do faturamento consolidado para gerar uma única fatura", false],
            ["Redução do tempo para obter novos recursos de computação", true],
        ],
    },
    {
        statement: "Qual das opções a seguir é uma boa prática ao projetar soluções na AWS?",
        explanation:
            "Automatizar a criação da infraestrutura permite testar arquiteturas diferentes com rapidez e menos erro humano. Na nuvem o design pode mudar com facilidade, reservas servem para cargas estáveis e previsíveis, não para testes, e superdimensionar a capacidade para picos é prática on-premises que a elasticidade substitui.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Investir pesado no projeto inicial do ambiente, pois é difícil mudar o design depois",
                false,
            ],
            ["Usar reservas da AWS para reduzir custos ao testar o ambiente de produção", false],
            [
                "Automatizar sempre que possível para facilitar a experimentação de arquiteturas",
                true,
            ],
            [
                "Provisionar uma grande capacidade de computação para absorver qualquer pico de carga",
                false,
            ],
        ],
    },
    {
        statement:
            'O princípio "projete para falhas e nada falhará" é muito importante ao desenhar uma arquitetura na Nuvem AWS. Quais opções ajudam a seguir esse princípio? (Selecione DUAS opções.)',
        explanation:
            "Várias Zonas de Disponibilidade dão redundância física, e o Elastic Load Balancing detecta alvos com falha e envia tráfego só aos saudáveis, então a falha de um componente não derruba a aplicação. MFA e testes de penetração são controles de segurança, e a escalabilidade vertical concentra a carga em um único recurso.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Autenticação multifator (MFA)", false],
            ["Zonas de Disponibilidade", true],
            ["Elastic Load Balancing", true],
            ["Testes de penetração", false],
            ["Escalabilidade vertical", false],
        ],
    },
    {
        statement:
            "Quais são princípios de design importantes a adotar ao projetar sistemas na AWS? (Selecione DUAS opções.)",
        explanation:
            "Automatizar reduz erros manuais e acelera a recuperação, e eliminar pontos únicos de falha com redundância mantém o sistema operando quando um componente falha. Usar serviços globais ou regionais depende da carga, pagamento conforme o uso é modelo de cobrança e tratar servidores como fixos contraria a ideia de recursos descartáveis.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Usar sempre serviços globais em vez de serviços regionais", false],
            ["Escolher sempre o pagamento conforme o uso", false],
            ["Tratar os servidores como recursos fixos e permanentes", false],
            ["Automatizar tudo o que for possível na infraestrutura", true],
            ["Eliminar pontos únicos de falha na arquitetura", true],
        ],
    },
    {
        statement:
            "Quais são vantagens da computação em nuvem em relação aos data centers tradicionais? (Selecione DUAS opções.)",
        explanation:
            "A nuvem oferece infraestrutura distribuída em várias Regiões e Zonas de Disponibilidade e capacidade provisionada sob demanda, sem compra antecipada de hardware, algo caro em um data center próprio. Virtualização, capacidade reservada e servidores dedicados também existem em data centers tradicionais, então não diferenciam a nuvem.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Infraestrutura distribuída em várias Regiões", true],
            ["Capacidade sob demanda, sem compra de hardware", true],
            ["Recursos de computação virtualizados em hipervisor", false],
            ["Capacidade de computação reservada com antecedência", false],
            ["Hospedagem em servidores dedicados a um só cliente", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve melhor o pilar Excelência operacional do AWS Well-Architected Framework?",
        explanation:
            "Excelência operacional trata de executar e monitorar cargas de trabalho e melhorar continuamente processos e procedimentos. Recuperar-se de falhas descreve Confiabilidade, usar recursos com eficiência descreve Eficiência de desempenho e gerenciar data centers não é pilar, pois essa operação física fica com a AWS.",
        topic: "Conceitos e arquitetura",
        options: [
            ["A capacidade de um sistema se recuperar de falhas de forma controlada", false],
            [
                "O uso eficiente de recursos de computação para atender aos requisitos da carga",
                false,
            ],
            ["A capacidade de monitorar sistemas e aprimorar processos e procedimentos", true],
            ["A capacidade de gerenciar as operações do data center com mais eficiência", false],
        ],
    },
    {
        statement:
            "Uma engenheira de nuvem gerencia uma aplicação web de e-commerce na AWS, hospedada em seis instâncias do Amazon EC2. Certo dia, três das instâncias falharam, mas nenhum cliente foi afetado. O que ela fez corretamente nesse cenário?",
        explanation:
            "Um sistema tolerante a falhas continua funcionando mesmo quando parte dos componentes falha, como na perda de três das seis instâncias sem impacto aos clientes. Elasticidade e escalabilidade tratam de ajustar ou ampliar a capacidade conforme a demanda, e a criptografia protege dados, sem garantir continuidade diante de falhas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Construiu um sistema elástico", false],
            ["Construiu um sistema tolerante a falhas", true],
            ["Construiu um sistema com dados criptografados", false],
            ["Construiu um sistema escalável", false],
        ],
    },
    {
        statement: "O uso do Amazon EC2 se enquadra em qual modelo de computação em nuvem?",
        explanation:
            "O Amazon EC2 é IaaS: a AWS fornece a infraestrutura virtualizada e o cliente gerencia sistema operacional, middleware e aplicações. No PaaS o cliente só implanta o código em uma plataforma gerenciada, no SaaS recebe o software pronto, e um mesmo serviço não é classificado como IaaS e SaaS ao mesmo tempo.",
        topic: "Conceitos e arquitetura",
        options: [
            ["IaaS e SaaS", false],
            ["IaaS", true],
            ["SaaS", false],
            ["PaaS", false],
        ],
    },
    {
        statement: "Ao construir aplicações na AWS, qual prática é recomendada?",
        explanation:
            "Desacoplar os componentes, com comunicação por APIs ou filas, permite que cada parte escale, falhe e seja atualizada sem derrubar o restante. Menor privilégio é controle de acesso, não de segurança física; o hardware é escolhido e gerenciado pela AWS; e políticas do IAM definem permissões, sem efeito no desempenho.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Reforçar a segurança física aplicando o princípio do menor privilégio", false],
            ["Garantir que a aplicação rode em hardware de fornecedores confiáveis", false],
            ["Usar políticas do IAM para manter o desempenho da aplicação", false],
            ["Desacoplar os componentes para que funcionem de forma independente", true],
        ],
    },
    {
        statement:
            "Uma empresa executa cargas de trabalho críticas para o negócio na AWS e não aceita nenhum tempo de inatividade, mesmo que um desastre natural atinja uma Região inteira. Qual é a prática recomendada para proteger essas cargas?",
        explanation:
            "Com os recursos em outra Região e estratégia ativo-ativo, as duas Regiões atendem tráfego ao mesmo tempo e uma assume se a outra cair. O CloudFront entrega conteúdo em cache e não faz failover da aplicação, várias Zonas de Disponibilidade não bastam se o desastre atingir a Região inteira e restaurar backups gera inatividade.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Replicar dados em locais de borda e usar o Amazon CloudFront para failover automático",
                false,
            ],
            ["Implantar os recursos em várias Zonas de Disponibilidade da mesma Região", false],
            ["Criar backups pontuais em outra sub-rede e restaurá-los após o desastre", false],
            ["Implantar os recursos em outra Região e adotar uma estratégia ativo-ativo", true],
        ],
    },
    {
        statement:
            "Qual item deve ser considerado em uma análise de custo total de propriedade (TCO) que compara o custo de executar uma aplicação na AWS com o de executá-la on-premises?",
        explanation:
            "Na comparação de TCO entram os custos que mudam entre on-premises e nuvem, como a compra e a manutenção de hardware físico, que na AWS ficam com o provedor. Desenvolvimento da aplicação, pesquisa de mercado e análise de negócio custam praticamente o mesmo em qualquer forma de hospedagem.",
        topic: "Preços e faturamento",
        options: [
            ["Desenvolvimento da aplicação", false],
            ["Pesquisa de mercado", false],
            ["Análise de negócio", false],
            ["Hardware físico", true],
        ],
    },
    {
        statement: "Qual afirmação descreve a agilidade da Nuvem AWS?",
        explanation:
            "Agilidade é a rapidez para disponibilizar recursos: na AWS eles são provisionados em minutos pelo console, CLI ou API, e não em semanas. Hospedar em várias Regiões descreve alcance global, o cliente não personaliza o hardware da AWS e pagar adiantado para ter desconto é característica de Instâncias Reservadas e Savings Plans.",
        topic: "Conceitos e arquitetura",
        options: [
            ["A AWS permite hospedar aplicações em várias Regiões ao redor do mundo", false],
            ["A AWS oferece hardware personalizável pelo menor custo possível", false],
            ["A AWS permite provisionar recursos em questão de minutos", true],
            ["A AWS permite pagar antecipadamente para reduzir custos", false],
        ],
    },
    {
        statement:
            "Quais são os benefícios de usar um serviço gerenciado da AWS? (Selecione DUAS opções.)",
        explanation:
            "Em serviços gerenciados a AWS cuida de provisionamento, patches e manutenção da infraestrutura, o que reduz a complexidade operacional e deixa a equipe livre para entregar soluções mais rápido. Controle total da infraestrutura é característica de IaaS, criptografar os dados continua sendo do cliente e os patches passam a ser feitos pela AWS.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Oferece controle total sobre a infraestrutura virtual", false],
            ["Permite que os clientes entreguem novas soluções mais rápido", true],
            ["Reduz a complexidade operacional para a equipe do cliente", true],
            ["Elimina a necessidade de criptografar os dados", false],
            ["Permite que os desenvolvedores controlem toda a aplicação de patches", false],
        ],
    },
    {
        statement: "Qual é o benefício de usar uma API para acessar os serviços da AWS?",
        explanation:
            "Com APIs, é possível criar, configurar e monitorar recursos da AWS por código, automatizando o que seria feito manualmente no console. A API é só uma interface de gerenciamento: não melhora o desempenho dos recursos, não altera as cotas da conta e não reduz por si só o número de desenvolvedores.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Melhora o desempenho dos recursos da AWS em execução", false],
            ["Aumenta os limites de serviço (cotas) da conta AWS", false],
            ["Reduz a quantidade de desenvolvedores necessária na equipe", false],
            ["Permite gerenciar recursos da AWS de forma programática", true],
        ],
    },
    {
        statement:
            "Quais princípios de design estão relacionados à eficiência de desempenho na AWS? (Selecione DUAS opções.)",
        explanation:
            "Os princípios de Eficiência de desempenho incluem tornar-se global em minutos, implantando em várias Regiões para reduzir a latência, e usar arquiteturas serverless, que escalam sem gerenciar servidores. Segurança em todas as camadas, identidade forte e rastreabilidade com logs de auditoria são princípios do pilar Segurança.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantar em várias Regiões para atender clientes globais", true],
            ["Aplicar segurança em todas as camadas da arquitetura", false],
            ["Implementar controles fortes de identidade e acesso aos recursos", false],
            ["Adotar arquiteturas sem servidor (serverless)", true],
            ["Habilitar logs de auditoria em todas as contas", false],
        ],
    },
    {
        statement:
            "Por que uma organização decidiria usar a AWS em vez de um data center on-premises? (Selecione DUAS opções.)",
        explanation:
            "Na AWS os recursos são elásticos, acompanhando a demanda sem superdimensionar, e o pagamento pelo uso evita grandes investimentos iniciais. Licenças de software comercial são cobradas à parte, suporte técnico exige plano pago (o Basic cobre só conta e faturamento) e a conformidade é comprovada por relatórios no AWS Artifact, não por visitas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Licenças gratuitas de softwares comerciais", false],
            ["Suporte técnico gratuito em todos os planos", false],
            ["Recursos elásticos que acompanham a demanda", true],
            ["Visitas presenciais aos data centers para auditoria", false],
            ["Economia de custos com pagamento pelo uso", true],
        ],
    },
    {
        statement:
            "Qual framework, criado pelo AWS Professional Services, ajuda as organizações a traçar um roteiro para uma adoção bem-sucedida da nuvem?",
        explanation:
            "O AWS Cloud Adoption Framework (AWS CAF), criado pelo AWS Professional Services, orienta a jornada de adoção da nuvem em seis perspectivas: Negócios, Pessoas, Governança, Plataforma, Segurança e Operações. O Secrets Manager guarda segredos, o AWS WAF é um firewall de aplicações web e o Amazon EFS é um sistema de arquivos.",
        topic: "Conceitos e arquitetura",
        options: [
            ["AWS Secrets Manager", false],
            ["AWS CAF", true],
            ["AWS WAF", false],
            ["Amazon EFS", false],
        ],
    },
    {
        statement:
            "Por que muitas startups preferem a AWS a soluções on-premises tradicionais? (Selecione DUAS opções.)",
        explanation:
            "Startups trocam o investimento inicial em hardware por custos variáveis e lançam produtos mais rápido porque não precisam construir nem operar data centers. A AWS cobra pelo uso desde o início, construir data centers mais rápido não é proposta de valor da AWS e as despesas operacionais continuam existindo, agora variáveis.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Podem pagar pelos serviços só depois que o negócio der certo", false],
            [
                "Contam com data centers construídos mais rápido que em qualquer outro provedor",
                false,
            ],
            ["Reduzem o tempo de lançamento ao focar no negócio, e não em data centers", true],
            ["Deixam de ter qualquer despesa operacional com a infraestrutura", false],
            ["Trocam grandes despesas de capital por custos variáveis baixos", true],
        ],
    },
    {
        statement:
            "Como parte do AWS Migration Acceleration Program (MAP), o que a AWS oferece para acelerar a adoção da nuvem por grandes empresas? (Selecione DUAS opções.)",
        explanation:
            "No MAP, a AWS oferece o AWS Professional Services e parceiros da AWS com experiência em migração, além de metodologia, ferramentas e incentivos. O AWS Artifact dá acesso a relatórios de conformidade, o Amazon Athena consulta dados no Amazon S3 com SQL e o Amazon Pinpoint envia mensagens de marketing aos clientes.",
        topic: "Migração",
        options: [
            ["Parceiros da AWS", true],
            ["Relatórios do AWS Artifact", false],
            ["AWS Professional Services", true],
            ["Amazon Athena", false],
            ["Amazon Pinpoint", false],
        ],
    },
    {
        statement:
            "Uma empresa usa instâncias do Amazon EC2 para executar sua loja virtual na AWS. Se o site ficar indisponível, a empresa perderá muito dinheiro a cada minuto fora do ar. Qual princípio de design a empresa deve usar para minimizar o risco de interrupção?",
        explanation:
            "Tolerância a falhas mantém o sistema funcionando mesmo quando componentes falham, com redundância entre Zonas de Disponibilidade e failover automático, o que reduz o risco de a loja sair do ar. Menor privilégio é princípio de segurança, luz piloto é estratégia de recuperação após o desastre e multithreading é técnica de programação.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Menor privilégio", false],
            ["Luz piloto (pilot light)", false],
            ["Tolerância a falhas", true],
            ["Multithreading", false],
        ],
    },
    {
        statement:
            "Qual das opções a seguir é uma boa prática básica para tornar uma aplicação altamente disponível na AWS?",
        explanation:
            "Implantar em pelo menos duas Zonas de Disponibilidade mantém a aplicação no ar se uma AZ falhar, e é a prática básica de alta disponibilidade. Várias Regiões atendem requisitos de recuperação de desastres com mais custo e complexidade, dois servidores na mesma AZ não resistem à falha dela e reescrever o código não resolve falhas de infraestrutura.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantar a aplicação em pelo menos duas Zonas de Disponibilidade", true],
            ["Implantar a aplicação em várias Regiões da AWS", false],
            ["Implantar a aplicação em dois servidores na mesma Zona de Disponibilidade", false],
            ["Reescrever o código da aplicação para tratar todas as requisições recebidas", false],
        ],
    },
    {
        statement:
            "Quais itens devem ser levados em conta em uma análise de TCO que compara os custos de executar uma aplicação na AWS e on-premises? (Selecione DUAS opções.)",
        explanation:
            "O TCO compara o que a empresa gasta on-premises, como equipe de TI, mão de obra, energia e refrigeração do data center, com o custo na AWS, onde esses gastos físicos ficam com o provedor. O Amazon EBS é armazenamento em bloco, sem poder de computação, e arquitetura e compatibilidade do software são temas técnicos, não custos.",
        topic: "Preços e faturamento",
        options: [
            ["Custos de mão de obra e de TI", true],
            ["Refrigeração e consumo de energia", true],
            ["Poder de computação dos volumes do Amazon EBS", false],
            ["Arquitetura do software", false],
            ["Compatibilidade do software", false],
        ],
    },
    {
        statement:
            "Uma empresa avalia a AWS como provedora de computação em nuvem. Quais vantagens ela terá? (Selecione DUAS opções.)",
        explanation:
            "Com a AWS, a capacidade acompanha a demanda, sem precisar adivinhar quanto provisionar, e investimentos iniciais em hardware viram despesas operacionais conforme o uso. O cliente continua monitorando seus servidores e aplicações, a conformidade é compartilhada e as instâncias seguem tipos padronizados, sem hardware sob medida.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Elimina a necessidade de monitorar servidores e aplicações", false],
            ["Gerencia todas as tarefas de conformidade e auditoria", false],
            ["Fornece hardware personalizado para atender a qualquer especificação", false],
            ["Elimina a necessidade de adivinhar a capacidade de infraestrutura", true],
            ["Permite trocar despesas de capital por despesas operacionais", true],
        ],
    },
    {
        statement:
            "Qual modelo de implantação de computação em nuvem conecta a infraestrutura e as aplicações entre recursos na nuvem e recursos existentes que não estão na nuvem?",
        explanation:
            "O modelo híbrido conecta recursos na nuvem à infraestrutura que continua fora dela, como um data center on-premises. No modelo on-premises tudo fica nas instalações da empresa, no modelo em nuvem tudo roda no provedor e implantação mista não é um dos modelos de implantação descritos pela AWS.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantação on-premises", false],
            ["Implantação mista", false],
            ["Implantação híbrida", true],
            ["Implantação na nuvem", false],
        ],
    },
    {
        statement: "O que significa o termo economia de escala no contexto da AWS?",
        explanation:
            "Economia de escala significa que, com o uso agregado de milhares de clientes, a AWS obtém custos unitários menores e repassa isso em reduções de preço ao longo do tempo. Economizar ao consumir mais descreve descontos por volume, pagar conforme o uso é o modelo de cobrança e os preços da AWS tendem a cair, não a subir.",
        topic: "Preços e faturamento",
        options: [
            ["Quanto mais você consome, mais você economiza", false],
            ["Quanto mais tempo você usa a AWS, mais você paga pelos serviços", false],
            ["A AWS reduz os preços continuamente à medida que cresce", true],
            ["Você tem a possibilidade de pagar conforme o uso", false],
        ],
    },
    {
        statement:
            "Por que arquiteturas sem servidor (serverless) são mais econômicas que arquiteturas baseadas em servidores?",
        explanation:
            "Em arquiteturas baseadas em servidores as instâncias ficam ligadas e geram custo mesmo ociosas; no serverless paga-se por requisição e tempo de execução. Custos de transferência de dados continuam existindo, a cobrança serverless não depende de reservar capacidade e escalar automaticamente também é possível com servidores e Auto Scaling.",
        topic: "Preços e faturamento",
        options: [
            ["Arquiteturas serverless eliminam todos os custos de rede das aplicações", false],
            ["No serverless, a computação só é usada enquanto o código está em execução", true],
            [
                "Reservar capacidade serverless gera descontos maiores que reservar servidores",
                false,
            ],
            ["No serverless, é possível escalar automaticamente conforme a demanda muda", false],
        ],
    },
    {
        statement:
            "O responsável por uma aplicação de e-commerce percebe que a necessidade de capacidade de computação varia muito ao longo do tempo. O que torna a AWS mais econômica que um data center tradicional para esse tipo de aplicação?",
        explanation:
            "Iniciar e encerrar instâncias conforme a demanda faz a empresa pagar só pela capacidade usada, sem hardware ocioso nos períodos calmos. Instâncias maiores para picos continuam ociosas no resto do tempo, pagar adiantado reduz o preço unitário mas mantém capacidade paga sem uso, e instâncias mais baratas não eliminam a ociosidade.",
        topic: "Preços e faturamento",
        options: [
            ["A AWS permite lançar instâncias EC2 potentes para absorver picos de carga", false],
            ["A AWS permite pagar antecipadamente para obter descontos maiores", false],
            ["A AWS permite iniciar e encerrar instâncias EC2 conforme a demanda", true],
            [
                "A AWS permite escolher tipos de instância EC2 mais baratos que atendam à necessidade",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais das opções a seguir representam princípios de design para arquiteturas na Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "Acoplamento fraco evita que falhas se propaguem entre componentes, e recursos descartáveis são substituídos em vez de consertados, o que acelera a recuperação. Preferir capacidade reservada ou servidores a serviços gerenciados contraria a nuvem, e escolher entre várias AZs e várias Regiões depende do caso, não é princípio.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Capacidade reservada em vez de sob demanda", false],
            ["Acoplamento fraco em vez de acoplamento forte", true],
            ["Servidores em vez de serviços gerenciados", false],
            ["Recursos descartáveis em vez de servidores fixos", true],
            ["Várias Zonas de Disponibilidade em vez de várias Regiões", false],
        ],
    },
    {
        statement:
            "Você desenvolveu uma aplicação web voltada a um público global. Qual opção oferece o maior nível de redundância e tolerância a falhas do ponto de vista da infraestrutura?",
        explanation:
            "Várias Zonas de Disponibilidade em várias Regiões protegem tanto contra a falha de uma AZ quanto contra a indisponibilidade de uma Região inteira. A redundância das cargas precisa ser projetada pelo cliente, uma única AZ não tem redundância e várias AZs em uma só Região não resistem a um problema regional.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Não é preciso projetar esses recursos, pois a AWS já é redundante por padrão", false],
            ["Implantar a aplicação em uma única Zona de Disponibilidade", false],
            ["Implantar a aplicação em várias Zonas de Disponibilidade de uma única Região", false],
            ["Implantar a aplicação em várias Zonas de Disponibilidade de várias Regiões", true],
        ],
    },
    {
        statement:
            "Como você pode aumentar a tolerância a falhas de uma aplicação hospedada na AWS?",
        explanation:
            "Com a aplicação em várias Zonas de Disponibilidade, a falha de uma AZ não a derruba, pois as demais continuam atendendo. Várias instâncias na mesma AZ caem juntas se ela falhar, uma única instância potente é ponto único de falha e sub-redes só ajudam se estiverem em AZs diferentes, já que cada sub-rede fica em uma AZ.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Implantando a aplicação em várias instâncias EC2 na mesma Zona de Disponibilidade",
                false,
            ],
            ["Implantando a aplicação em várias Zonas de Disponibilidade", true],
            [
                "Hospedando a aplicação em uma única instância EC2 potente em vez de várias menores",
                false,
            ],
            ["Distribuindo os recursos da aplicação em várias sub-redes", false],
        ],
    },
    {
        statement: "Qual é um benefício do princípio de arquitetura de acoplamento fraco?",
        explanation:
            "Com acoplamento fraco, cada componente se comunica por interfaces bem definidas e pode ser alterado ou substituído sem afetar os outros. O gerenciamento de mudanças continua necessário, a replicação entre Regiões é recurso de redundância de dados e reduzir acesso privilegiado é aplicação do menor privilégio.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Elimina a necessidade de gerenciamento de mudanças", false],
            ["Permite a replicação de dados entre Regiões da AWS", false],
            ["Ajuda os clientes a reduzir o acesso privilegiado aos recursos da AWS", false],
            ["Permite alterar componentes individuais sem afetar os demais", true],
        ],
    },
    {
        statement:
            "Qual modelo de implantação de computação em nuvem elimina a necessidade de operar e manter data centers físicos?",
        explanation:
            "No modelo de implantação em nuvem toda a infraestrutura fica nas instalações do provedor, que opera e mantém os data centers. On-premises é o oposto, com tudo nas instalações da empresa, e IaaS e PaaS são modelos de serviço, que definem o que o cliente gerencia, e não modelos de implantação.",
        topic: "Conceitos e arquitetura",
        options: [
            ["On-premises", false],
            ["IaaS", false],
            ["PaaS", false],
            ["Nuvem", true],
        ],
    },
    {
        statement:
            "A AWS oferece capacidade de recuperação de desastres ao permitir que os clientes distribuam sua infraestrutura entre diferentes [...]. Qual opção completa a frase?",
        explanation:
            "Regiões são áreas geográficas separadas, então distribuir a infraestrutura entre elas mantém a aplicação operando mesmo se uma Região inteira ficar indisponível. Locais de borda servem para cache e entrega de conteúdo, planos de suporte dão acesso a atendimento técnico e dispositivos Snowball transferem dados fisicamente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Regiões geográficas da AWS", true],
            ["Locais de borda da AWS", false],
            ["Planos do AWS Support", false],
            ["Dispositivos AWS Snowball Edge", false],
        ],
    },
    {
        statement:
            "Quais características da AWS tornam a nuvem econômica para uma carga de trabalho com demanda de usuários variável? (Selecione DUAS opções.)",
        explanation:
            "A elasticidade ajusta a capacidade à demanda e o pagamento conforme o uso cobra só pelo que foi consumido, então os vales de acesso não geram custo ocioso. Alta disponibilidade e confiabilidade tratam de resistir a falhas, e o modelo de responsabilidade compartilhada divide deveres de segurança; nenhum deles reduz custo.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Alta disponibilidade", false],
            ["Modelo de responsabilidade compartilhada", false],
            ["Elasticidade", true],
            ["Pagamento conforme o uso", true],
            ["Confiabilidade", false],
        ],
    },
    {
        statement:
            "Ao arquitetar aplicações para a nuvem, qual das opções a seguir é um princípio de design fundamental?",
        explanation:
            "Elasticidade é um princípio central do design na nuvem: a capacidade cresce e diminui conforme a demanda, sem pagar por recursos ociosos. Usar a maior instância e provisionar para o pico são hábitos on-premises que geram desperdício, e o Scrum é um processo de desenvolvimento, não um princípio de arquitetura.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Usar sempre o maior tamanho de instância disponível", false],
            ["Provisionar capacidade fixa para o pico de carga", false],
            ["Adotar o Scrum como processo de desenvolvimento", false],
            ["Implementar elasticidade para acompanhar a demanda", true],
        ],
    },
    {
        statement: "Qual das opções a seguir é um benefício de usar a Nuvem AWS?",
        explanation:
            "A AWS assume a operação da infraestrutura física, o que libera a empresa para investir tempo e dinheiro no que gera receita. A AWS não adota segurança permissiva (o padrão é o menor privilégio), e o cliente não controla o hardware de rede nem escolhe os fornecedores de hardware da nuvem.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Segurança permissiva que reduz o trabalho administrativo", false],
            ["Poder se concentrar em atividades que geram receita", true],
            ["Controle sobre o hardware de rede da nuvem", false],
            ["Escolha de fornecedores específicos de hardware da nuvem", false],
        ],
    },
    {
        statement:
            "Qual recurso da AWS um cliente deve aproveitar para obter alta disponibilidade em uma aplicação?",
        explanation:
            "Distribuir a aplicação em várias Zonas de Disponibilidade, que têm energia e rede independentes, mantém o serviço no ar se uma delas falhar. O Direct Connect é um link dedicado com o ambiente on-premises, a VPC é uma rede isolada e os data centers não são escolhidos diretamente pelo cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["AWS Direct Connect", false],
            ["Zonas de Disponibilidade", true],
            ["Data centers da AWS", false],
            ["Amazon Virtual Private Cloud (Amazon VPC)", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é um princípio de design de arquitetura na nuvem?",
        explanation:
            "Acoplamento fraco faz os componentes conversarem por interfaces bem definidas, como filas e APIs, para que a falha ou a mudança de um não derrube os outros. Escalar só verticalmente e montar sistemas monolíticos vão contra as boas práticas, e escolher software comercial é decisão de compra, não princípio de arquitetura.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Escalar verticalmente em vez de horizontalmente", false],
            ["Manter os componentes com acoplamento fraco", true],
            ["Construir aplicações como sistemas monolíticos", false],
            ["Usar software de banco de dados comercial", false],
        ],
    },
    {
        statement: "Quais são benefícios financeiros de usar a AWS? (Selecione DUAS opções.)",
        explanation:
            "Sem data center próprio, some o investimento em hardware e caem os gastos com energia, manutenção e operação da infraestrutura, o que reduz o TCO e as despesas operacionais. A nuvem diminui o CapEx em vez de aumentá-lo, e a AWS não oferece pagamento adiado nem linha de crédito (o AWS Activate dá créditos promocionais).",
        topic: "Preços e faturamento",
        options: [
            ["Redução do custo total de propriedade (TCO)", true],
            ["Aumento das despesas de capital (CapEx)", false],
            ["Redução das despesas operacionais (OpEx)", true],
            ["Planos de pagamento adiado para startups", false],
            ["Linhas de crédito empresarial para startups", false],
        ],
    },
    {
        statement:
            "Ao comparar o custo total de propriedade (TCO) da AWS com o de um ambiente on-premises, qual custo deve ser incluído?",
        explanation:
            "No on-premises, a empresa paga pela segurança física do data center (vigilância, controle de acesso, câmeras); na AWS esse custo fica com a AWS, por isso ele diferencia os dois cenários. Gestão de projetos, antivírus e desenvolvimento de software existem nos dois ambientes e não mudam a comparação.",
        topic: "Preços e faturamento",
        options: [
            ["Gestão dos projetos de TI", false],
            ["Licenciamento de software antivírus", false],
            ["Segurança física do data center", true],
            ["Desenvolvimento de software", false],
        ],
    },
    {
        statement:
            "Ao projetar aplicações na nuvem, qual prática é um princípio importante de arquitetura?",
        explanation:
            "Usar várias Zonas de Disponibilidade distribui a aplicação por locais isolados, e a falha de uma zona não derruba o sistema. Componentes fortemente acoplados propagam falhas, usar código aberto é escolha de licenciamento e provisionar capacidade extra contraria a elasticidade, que ajusta recursos conforme a demanda.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Usar várias Zonas de Disponibilidade", true],
            ["Usar componentes fortemente acoplados", false],
            ["Usar software de código aberto", false],
            ["Provisionar capacidade extra", false],
        ],
    },
    {
        statement:
            "Qual característica da AWS reduz o custo total de propriedade (TCO) do cliente?",
        explanation:
            "Com computação elástica, a capacidade acompanha a demanda e o cliente deixa de pagar por infraestrutura ociosa, o que reduz o TCO. Suportar vários sistemas operacionais não muda o custo, hardware dedicado costuma custar mais que o compartilhado e a criptografia protege dados sem reduzir custos.",
        topic: "Preços e faturamento",
        options: [
            ["Suporte a vários sistemas operacionais", false],
            ["Hardware dedicado a um único cliente", false],
            ["Computação elástica", true],
            ["Criptografia dos dados", false],
        ],
    },
    {
        statement:
            "Uma empresa vai rearquitetar uma grande aplicação monolítica para a nuvem. Quais princípios de design são recomendados? (Selecione DUAS opções.)",
        explanation:
            "Ao quebrar um monólito, o acoplamento fraco evita que a falha de uma parte se propague e o design para escalabilidade deixa cada componente crescer de forma independente. Monitoramento manual e servidores fixos são antipadrões na nuvem, e depender de um componente central é justamente o problema do monólito.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Usar monitoramento manual", false],
            ["Manter servidores fixos e permanentes", false],
            ["Implementar acoplamento fraco", true],
            ["Depender de um único componente central", false],
            ["Projetar para escalabilidade", true],
        ],
    },
    {
        statement: "Como os clientes se beneficiam da enorme economia de escala da AWS?",
        explanation:
            "Com milhões de clientes, a AWS compra e opera em escala muito maior, reduz o custo por unidade e repassa parte da economia em reduções periódicas de preço. Aumentar e reduzir recursos é elasticidade, e novos tipos de instância ou hardware mais confiável são evolução do produto, não efeito direto da economia de escala.",
        topic: "Preços e faturamento",
        options: [
            ["Reduções periódicas de preço graças à eficiência operacional da AWS", true],
            ["Novos tipos de instância do Amazon EC2 com o hardware mais recente", false],
            ["A capacidade de aumentar e reduzir recursos quando necessário", false],
            ["Maior confiabilidade no hardware subjacente das instâncias do Amazon EC2", false],
        ],
    },
    {
        statement:
            "Quais opções são benefícios da Nuvem AWS em comparação com a infraestrutura tradicional? (Selecione DUAS opções.)",
        explanation:
            "Elasticidade ajusta recursos à demanda e agilidade permite provisionar e experimentar em minutos, sem longos ciclos de compra. A AWS oferece SLAs, não tempo de atividade ilimitado; colocation é hospedar servidores próprios em data center de terceiros; e despesas de capital são o que a nuvem substitui por custos variáveis.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Tempo de atividade ilimitado", false],
            ["Elasticidade", true],
            ["Agilidade", true],
            ["Colocation", false],
            ["Despesas de capital (CapEx)", false],
        ],
    },
    {
        statement:
            "Ao comparar o custo total de propriedade (TCO) da Nuvem AWS com o de um ambiente on-premises, quais despesas devem ser consideradas? (Selecione DUAS opções.)",
        explanation:
            "Servidores físicos e hardware de armazenamento precisam ser comprados, mantidos e trocados no on-premises e deixam de existir na AWS, por isso pesam no TCO. Desenvolvimento de software, gestão de projetos e licenças de antivírus continuam iguais nos dois ambientes e não diferenciam a comparação.",
        topic: "Preços e faturamento",
        options: [
            ["Desenvolvimento de software", false],
            ["Gestão de projetos", false],
            ["Hardware de armazenamento", true],
            ["Servidores físicos", true],
            ["Licença de software antivírus", false],
        ],
    },
    {
        statement:
            "Quais cenários representam o conceito de elasticidade na AWS? (Selecione DUAS opções.)",
        explanation:
            "Ajustar a quantidade de instâncias EC2 conforme o tráfego (escala horizontal) e redimensionar instâncias RDS conforme a necessidade (escala vertical) adaptam a capacidade à demanda. Direcionar tráfego para instâncias ociosas é balanceamento de carga, documentos de conformidade vêm do AWS Artifact e ambientes via código são infraestrutura como código.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Ajustar o número de instâncias do Amazon EC2 conforme o tráfego", true],
            ["Redimensionar instâncias do Amazon RDS quando a demanda do negócio muda", true],
            [
                "Direcionar automaticamente o tráfego para as instâncias do Amazon EC2 menos utilizadas",
                false,
            ],
            ["Usar documentos de conformidade da AWS para acelerar auditorias", false],
            ["Criar e governar ambientes inteiros por meio de código", false],
        ],
    },
    {
        statement:
            "Uma empresa avalia migrar seu data center on-premises para a AWS. Quais fatores devem entrar na análise de custo total de propriedade (TCO)? (Selecione DUAS opções.)",
        explanation:
            "Energia elétrica e mão de obra para trocar servidores são custos do data center próprio que desaparecem na AWS, então entram no TCO. Disponibilidade de instâncias EC2 é um dado do lado da AWS, horas dos desenvolvedores não mudam com a hospedagem e capacidade do banco é questão de dimensionamento, não custo on-premises.",
        topic: "Preços e faturamento",
        options: [
            ["Disponibilidade de tipos de instância do Amazon EC2", false],
            ["Consumo de energia elétrica do data center", true],
            ["Mão de obra para substituir servidores antigos", true],
            ["Horas de trabalho dos desenvolvedores de aplicações", false],
            ["Capacidade do mecanismo de banco de dados", false],
        ],
    },
    {
        statement:
            "Qual modelo de implantação permite ao cliente trocar totalmente as despesas de capital (CapEx) de TI por despesas operacionais (OpEx)?",
        explanation:
            "Na implantação em nuvem, toda a infraestrutura roda no provedor e o investimento inicial em hardware vira custo variável pelo uso. No on-premises o CapEx continua integral, no modelo híbrido parte dele permanece, e PaaS é um modelo de serviço (como IaaS e SaaS), não um modelo de implantação.",
        topic: "Preços e faturamento",
        options: [
            ["Implantação on-premises", false],
            ["Implantação híbrida", false],
            ["Implantação em nuvem", true],
            ["Plataforma como serviço (PaaS)", false],
        ],
    },
    {
        statement:
            "A aplicação web de uma empresa tem dependências rígidas entre seus componentes, e a falha de um deles derruba a aplicação inteira. Qual princípio de design da Nuvem AWS resolve esse problema?",
        explanation:
            "Desacoplar isola os componentes, que passam a se comunicar por interfaces como filas, e a falha de um não derruba os demais. Elasticidade ajusta capacidade à demanda, instâncias em paralelo melhoram desempenho e dobrar recursos só aumenta capacidade; nenhuma dessas opções remove a dependência rígida entre os componentes.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implementar elasticidade, para a aplicação escalar conforme a demanda muda", false],
            ["Executar várias instâncias EC2 em paralelo para obter melhor desempenho", false],
            ["Desacoplar os componentes, para que cada um funcione mesmo se outro falhar", true],
            ["Dobrar os recursos de computação do EC2 para aumentar a tolerância a falhas", false],
        ],
    },
    {
        statement:
            "Qual das opções a seguir é um princípio de design do AWS Well-Architected Framework relacionado ao pilar Confiabilidade?",
        explanation:
            "Recuperar-se automaticamente de falhas é um dos princípios do pilar Confiabilidade, ao lado de testar procedimentos de recuperação e escalar horizontalmente. Adotar um modelo de consumo é princípio de Otimização de custos, base sólida de identidade é de Segurança, e implantar em uma única zona cria ponto único de falha.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantar em uma única Zona de Disponibilidade", false],
            ["Recuperar-se automaticamente de falhas", true],
            ["Adotar um modelo de consumo", false],
            ["Implementar uma base sólida de identidade", false],
        ],
    },
    {
        statement:
            "Qual é uma vantagem de usar a Nuvem AWS em vez de uma solução on-premises tradicional?",
        explanation:
            "Na AWS a capacidade é provisionada sob demanda e ajustada em minutos, então não é preciso comprar hardware com base em previsões. Contratos de hardware são coisa do modelo on-premises, os custos da nuvem variam com o uso e os relatórios do AWS Artifact apoiam auditorias, mas não livram o cliente delas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Os usuários não precisam adivinhar a capacidade futura", true],
            ["Os usuários aproveitam contratos de hardware já existentes", false],
            ["Os usuários mantêm custos fixos, seja qual for o tráfego", false],
            ["Os usuários evitam auditorias usando relatórios da AWS", false],
        ],
    },
    {
        statement:
            "Por que uma empresa deveria escolher a AWS em vez de um data center tradicional?",
        explanation:
            "A AWS cobra pelo uso, sem contratos de longo prazo na maioria dos serviços, o que evita grandes investimentos iniciais. O cliente não controla o hardware subjacente, os locais de borda não existem em todos os países e há cotas de serviço por conta e Região, que podem ser aumentadas sob pedido.",
        topic: "Preços e faturamento",
        options: [
            ["A AWS dá aos usuários controle total sobre os recursos subjacentes", false],
            ["A AWS dispensa contratos de longo prazo e cobra pelo uso", true],
            ["A AWS tem locais de borda em todos os países do mundo", false],
            ["A AWS não impõe limite à quantidade de recursos criados", false],
        ],
    },
    {
        statement:
            "Qual é a forma MAIS eficaz de a AWS reduzir os custos de computação de uma startup em crescimento?",
        explanation:
            "Com recursos sob demanda, a startup provisiona capacidade só nos picos e a libera depois, pagando apenas pelo que usa em vez de comprar hardware para a carga máxima. Automatizar ambientes de desenvolvimento ajuda na produtividade, CRM não tem relação com infraestrutura e um orçamento fixo limita gastos sem reduzir o custo.",
        topic: "Preços e faturamento",
        options: [
            ["Oferecer recursos sob demanda para os picos de uso", true],
            ["Automatizar o provisionamento de ambientes de cada desenvolvedor", false],
            ["Automatizar a gestão do relacionamento com clientes", false],
            ["Aplicar um orçamento mensal fixo de computação", false],
        ],
    },
    {
        statement:
            "Quais princípios são usados para arquitetar aplicações confiáveis na Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "Recuperação automática de falhas é princípio do pilar Confiabilidade, e distribuir a carga em várias Zonas de Disponibilidade elimina pontos únicos de falha. O pilar pede mudanças por automação, e não manuais, e testes de recuperação e de pico em vez de carga moderada; restaurar backups on-premises cria dependência de infraestrutura local.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Projetar a recuperação automática em caso de falhas", true],
            ["Distribuir a carga em várias Zonas de Disponibilidade", true],
            ["Gerenciar mudanças manualmente, seguindo processos documentados", false],
            ["Testar com demanda moderada para garantir a confiabilidade", false],
            ["Restaurar os backups em um ambiente on-premises", false],
        ],
    },
    {
        statement: "Qual opção é um exemplo de alta disponibilidade na Nuvem AWS?",
        explanation:
            "Alta disponibilidade é manter a aplicação acessível mesmo quando um recurso falha, com redundância entre Zonas de Disponibilidade e failover automático. Suporte 24 horas é uma oferta dos planos de suporte, pagar sob demanda é modelo de preço e implantar em várias Regiões é alcance global, que sozinho não garante disponibilidade.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Consultar o suporte técnico da AWS a qualquer hora do dia ou da noite", false],
            ["Manter a aplicação acessível mesmo se um recurso falhar", true],
            ["Usar qualquer serviço da AWS pagando sob demanda", false],
            ["Implantar em qualquer parte do mundo usando Regiões da AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa está avaliando levar seus servidores para a Nuvem AWS. Quais vantagens ela terá ao hospedar a infraestrutura na AWS? (Selecione DUAS opções.)",
        explanation:
            "Na AWS não há compromisso nem investimento inicial, e os recursos são provisionados sob demanda em minutos. Pelo modelo de responsabilidade compartilhada, a segurança na nuvem é do cliente; o armazenamento é cobrado pelo uso, com cota gratuita só no nível gratuito; e o cliente não controla a infraestrutura física.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Não há compromissos nem investimentos iniciais", true],
            ["A AWS gerencia toda a segurança na nuvem", false],
            ["É possível provisionar recursos sob demanda", true],
            ["Há armazenamento gratuito e ilimitado", false],
            ["Os usuários têm controle sobre a infraestrutura física", false],
        ],
    },
    {
        statement:
            "Quais benefícios a Nuvem AWS oferece a empresas com clientes em muitos países do mundo? (Selecione DUAS opções.)",
        explanation:
            "Implantar em várias Regiões aproxima a aplicação dos usuários, e os locais de borda do CloudFront entregam conteúdo perto deles; os dois reduzem a latência. O Translate traduz textos, mas não interfaces de terceiros por conta própria; o Comprehend analisa texto; e o Elastic Load Balancing distribui tráfego dentro de uma Região.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantar as aplicações em várias Regiões da AWS para reduzir a latência", true],
            ["O Amazon Translate traduz automaticamente a interface de sites de terceiros", false],
            ["O Amazon CloudFront tem locais de borda pelo mundo que reduzem a latência", true],
            [
                "O Amazon Comprehend cria aplicações que respondem a usuários em vários idiomas",
                false,
            ],
            [
                "O Elastic Load Balancing distribui o tráfego entre Regiões e reduz a latência",
                false,
            ],
        ],
    },
    {
        statement:
            "Quando uma empresa provisiona servidores web em várias Regiões da AWS, o que está sendo aumentado?",
        explanation:
            "Com servidores web em mais de uma Região, a aplicação continua atendendo mesmo se uma Região inteira ficar indisponível, o que aumenta a disponibilidade. O acoplamento trata da dependência entre componentes, a segurança depende de configuração e controles, e a durabilidade se refere à preservação de dados armazenados.",
        topic: "Conceitos e arquitetura",
        options: [
            ["O acoplamento entre os componentes", false],
            ["A disponibilidade da aplicação", true],
            ["A segurança da aplicação", false],
            ["A durabilidade dos dados", false],
        ],
    },
    {
        statement:
            "Durante uma revisão de arquitetura, um arquiteto avalia uma carga de trabalho com base no AWS Well-Architected Framework. Quais opções correspondem a pilares desse framework? (Selecione DUAS opções.)",
        explanation:
            "O Well-Architected tem seis pilares: Excelência operacional, Segurança, Confiabilidade, Eficiência de desempenho, Otimização de custos e Sustentabilidade. Várias Zonas de Disponibilidade são estratégia de implantação, criptografia é prática dentro do pilar Segurança e alta disponibilidade é objetivo ligado ao pilar Confiabilidade.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Várias Zonas de Disponibilidade", false],
            ["Eficiência de desempenho", true],
            ["Segurança", true],
            ["Criptografia", false],
            ["Alta disponibilidade", false],
        ],
    },
    {
        statement: "O que a prática de infraestrutura como código permite fazer na Nuvem AWS?",
        explanation:
            "Com infraestrutura como código, os recursos são descritos em templates (como no AWS CloudFormation) e provisionados de forma automática, repetível e versionada. Hardware físico não migra por código, auditoria feita por terceiros é outra atividade e o código da aplicação continua sob responsabilidade do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Automatizar a migração de hardware on-premises para data centers da AWS", false],
            ["Permitir que terceiros automatizem a auditoria da infraestrutura da AWS", false],
            ["Entregar o código da aplicação para a AWS executar por conta própria", false],
            ["Automatizar o provisionamento da infraestrutura a partir de templates", true],
        ],
    },
    {
        statement:
            "Um sistema na Nuvem AWS foi projetado para suportar a falha de um ou mais componentes e continuar atendendo os usuários. Isso é um exemplo de quê?",
        explanation:
            "Seguir atendendo quando componentes falham, com redundância e failover automático, é alta disponibilidade (a ideia se aproxima de tolerância a falhas, que não está entre as opções). Elasticidade e escalabilidade ajustam ou ampliam a capacidade conforme a carga, e agilidade nos negócios é a rapidez para provisionar e lançar novidades.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Elasticidade", false],
            ["Alta disponibilidade", true],
            ["Escalabilidade", false],
            ["Agilidade nos negócios", false],
        ],
    },
    {
        statement:
            "Uma empresa quer construir as cargas de trabalho de suas novas aplicações na Nuvem AWS em vez de usar recursos on-premises. Qual despesa pode ser reduzida com a Nuvem AWS?",
        explanation:
            "Na AWS a empresa não precisa comprar, instalar e cabear servidores e equipamentos de rede para as novas aplicações; paga só pelo consumo. Escrever código em Java ou Node.js, fazer testes de penetração e criar casos de teste para software de terceiros são custos de pessoas e processos que continuam iguais na nuvem.",
        topic: "Preços e faturamento",
        options: [
            ["O custo de escrever código próprio em Java ou Node.js", false],
            ["Testes de penetração (pentest) de segurança", false],
            ["O hardware necessário para rodar as novas aplicações", true],
            ["A escrita de casos de teste para aplicações de terceiros", false],
        ],
    },
    {
        statement: "O que significa um usuário implantar uma arquitetura de nuvem híbrida na AWS?",
        explanation:
            "Na nuvem híbrida, parte dos recursos continua no data center on-premises e parte roda na Nuvem AWS, conectadas por serviços como AWS Site-to-Site VPN ou AWS Direct Connect. Tudo on-premises ou tudo na AWS não é híbrido, e dividir entre on-premises e colocation não envolve nenhum provedor de nuvem.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Todos os recursos rodam em infraestrutura on-premises", false],
            ["Parte dos recursos roda on-premises e parte em um centro de colocation", false],
            ["Todos os recursos rodam na Nuvem AWS", false],
            ["Parte dos recursos roda on-premises e parte na Nuvem AWS", true],
        ],
    },
    {
        statement:
            "Uma startup compara a Nuvem AWS com a compra de servidores próprios. Quais vantagens a nuvem oferece nesse caso? (Selecione DUAS opções.)",
        explanation:
            "Com capacidade sob demanda, não é preciso prever a infraestrutura necessária, e provisionar em minutos acelera a chegada ao mercado. A cobrança da AWS varia com o uso, a nuvem reduz o investimento de capital antecipado em vez de aumentá-lo, e clientes não têm acesso físico aos data centers.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Custo mensal fixo, independente do uso", false],
            ["Não precisar adivinhar a capacidade necessária", true],
            ["Maior velocidade para chegar ao mercado", true],
            ["Aumento da despesa de capital antecipada", false],
            ["Acesso físico aos data centers onde a nuvem roda", false],
        ],
    },
    {
        statement:
            "Uma empresa vai comparar o custo de manter sua infraestrutura on-premises com o de uma arquitetura na nuvem. Quais custos devem entrar nesse cálculo de TCO? (Selecione DUAS opções.)",
        explanation:
            "No TCO entram os custos de infraestrutura que mudam entre os modelos: comprar e instalar servidores e administrar o ambiente (patches, backups, recuperação de falhas). Taxas de cartão, testes de penetração e campanhas de publicidade existem em qualquer hospedagem e não diferenciam on-premises de nuvem.",
        topic: "Preços e faturamento",
        options: [
            ["Taxas de processamento de cartão de crédito nas transações da aplicação", false],
            ["Compra e instalação de servidores no data center on-premises", true],
            ["Administração da infraestrutura, como patches, backups e recuperação", true],
            ["Testes de penetração contratados de terceiros", false],
            ["Custos de publicidade de uma campanha contínua em toda a empresa", false],
        ],
    },
    {
        statement: "Qual das opções é uma boa prática de design na Nuvem AWS?",
        explanation:
            "Projetar para alta disponibilidade, com redundância entre Zonas de Disponibilidade e failover automático, é boa prática na Nuvem AWS. Acoplamento forte faz falhas se propagarem, ponto único de falha é justamente o que o design deve eliminar e superprovisionar é hábito on-premises que a elasticidade substitui.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Acoplamento forte entre componentes", false],
            ["Ponto único de falha", false],
            ["Alta disponibilidade", true],
            ["Superprovisionamento de recursos", false],
        ],
    },
    {
        statement:
            "Por que a AWS é mais econômica que um data center tradicional para aplicações com carga de computação variável?",
        explanation:
            "Instâncias EC2 são iniciadas quando a carga sobe e encerradas quando cai, então paga-se só pelo tempo de uso em vez de manter hardware dimensionado para o pico. O EC2 não cobra valor mensal fixo, ter acesso administrativo não reduz custo e manter capacidade de pico o tempo todo é justamente o modelo caro do data center.",
        topic: "Preços e faturamento",
        options: [
            ["O Amazon EC2 cobra um valor mensal fixo por instância", false],
            ["Os clientes mantêm acesso administrativo total às instâncias EC2", false],
            ["As instâncias do Amazon EC2 podem ser iniciadas sob demanda", true],
            ["Os clientes podem manter sempre instâncias suficientes para o pico", false],
        ],
    },
    {
        statement: "Qual princípio de design está alinhado às boas práticas da Nuvem AWS?",
        explanation:
            "Distribuir a carga de computação entre vários recursos (escala horizontal) melhora desempenho e tolerância a falhas, sem ponto único de falha. Dependências fixas contrariam o acoplamento fraco, e concentrar tudo em uma instância ou em uma única Zona de Disponibilidade deixa a aplicação exposta a uma falha localizada.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Criar dependências fixas entre os componentes da aplicação", false],
            ["Concentrar os serviços em uma única instância", false],
            ["Implantar as aplicações em uma única Zona de Disponibilidade", false],
            ["Distribuir a carga de computação entre vários recursos", true],
        ],
    },
    {
        statement:
            "Um novo serviço na AWS precisa ter alta disponibilidade, mas uma exigência regulatória obriga todas as instâncias do Amazon EC2 a ficarem em uma única área geográfica. Segundo as boas práticas, qual distribuição mínima das instâncias atende aos dois requisitos?",
        explanation:
            "Zonas de Disponibilidade são locais isolados dentro de uma mesma Região, então usar duas delas protege contra a falha de uma zona sem sair da área geográfica. Duas Regiões violam a exigência regulatória, e sub-redes ou grupos de posicionamento dentro de uma única zona não resistem à falha dessa zona.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Duas Regiões da AWS, em áreas geográficas diferentes", false],
            ["Duas Zonas de Disponibilidade dentro da mesma Região", true],
            ["Duas sub-redes dentro da mesma Zona de Disponibilidade", false],
            ["Dois grupos de posicionamento na mesma Zona de Disponibilidade", false],
        ],
    },
    {
        statement:
            "Um usuário implanta uma instância de banco de dados do Amazon RDS em várias Zonas de Disponibilidade. Essa estratégia está ligada a qual pilar do AWS Well-Architected Framework?",
        explanation:
            "Com o RDS em várias Zonas de Disponibilidade, uma réplica em espera assume automaticamente se a zona principal falhar, o que atende ao foco do pilar Confiabilidade em recuperação e disponibilidade. Eficiência de desempenho trata do uso eficiente de recursos, Otimização de custos evita gastos desnecessários e Segurança protege dados e sistemas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Eficiência de desempenho", false],
            ["Confiabilidade", true],
            ["Otimização de custos", false],
            ["Segurança", false],
        ],
    },
    {
        statement:
            "Uma empresa que vende pela internet precisa entregar novas funcionalidades rapidamente e de forma iterativa, reduzindo o tempo até chegar ao mercado. Qual característica da Nuvem AWS oferece isso?",
        explanation:
            "Agilidade é poder provisionar recursos em minutos, experimentar e publicar mudanças com frequência, o que encurta o tempo até o mercado. Elasticidade ajusta capacidade à demanda, e alta disponibilidade e confiabilidade tratam de manter a aplicação funcionando diante de falhas; nenhuma delas acelera a entrega de funcionalidades.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Elasticidade", false],
            ["Alta disponibilidade", false],
            ["Agilidade", true],
            ["Confiabilidade", false],
        ],
    },
    {
        statement:
            "Quais medidas ajudam a rastrear mudanças nos recursos da AWS e a investigar a causa de falhas? (Selecione DUAS opções.)",
        explanation:
            "O AWS Config mantém o inventário e o histórico de configuração dos recursos, e o AWS CloudTrail registra as chamadas de API; juntos permitem rastrear mudanças e investigar a causa de falhas. Cotas não servem para bloquear mudanças, o Certificate Manager emite certificados SSL/TLS e o GuardDuty detecta ameaças, sem validar configurações.",
        topic: "Ferramentas e suporte",
        options: [
            ["Usar o AWS Config para manter um inventário atualizado dos recursos da AWS", true],
            ["Usar cotas de serviço para impedir que usuários criem ou alterem recursos", false],
            ["Usar o AWS CloudTrail para registrar chamadas de API em logs auditáveis", true],
            [
                "Usar o AWS Certificate Manager para criar uma lista de permissões de serviços",
                false,
            ],
            ["Usar o Amazon GuardDuty para validar mudanças de configuração nos recursos", false],
        ],
    },
    {
        statement:
            "Uma carga de trabalho em lote leva 5 horas para terminar em uma instância do Amazon EC2. O volume de dados dobra todo mês, e o tempo de processamento cresce na mesma proporção. Qual é a melhor arquitetura na nuvem para atender a essa demanda sempre crescente?",
        explanation:
            "Com o volume dobrando todo mês, só a escala horizontal acompanha o crescimento: dividir o trabalho entre várias instâncias em paralelo mantém o tempo sob controle. Instância maior, outra família ou bare metal são escala vertical ou ajuste de perfil, que esbarram no limite de uma única máquina.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Executar a aplicação em uma instância EC2 de tamanho maior", false],
            ["Trocar para uma família de instância EC2 própria para lotes", false],
            ["Dividir o trabalho entre várias instâncias EC2 em paralelo", true],
            ["Executar a aplicação em uma instância EC2 bare metal", false],
        ],
    },
    {
        statement: "Qual é o benefício da elasticidade na Nuvem AWS?",
        explanation:
            "A elasticidade adiciona capacidade nos picos e a remove nos períodos calmos, mantendo o desempenho estável sem intervenção manual. Distribuir tráfego entre Regiões é roteamento global, arquivar logs é gestão do ciclo de vida dos dados e a escolha dos serviços mais baratos continua sendo decisão do cliente.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Garantir que o tráfego web seja distribuído automaticamente entre várias Regiões",
                false,
            ],
            ["Reduzir custos de armazenamento arquivando logs automaticamente", false],
            ["Permitir que a AWS escolha automaticamente os serviços mais baratos", false],
            ["Ajustar automaticamente a capacidade de computação para manter o desempenho", true],
        ],
    },
    {
        statement:
            "Qual boa prática da Nuvem AWS aproveita diretamente a elasticidade e a agilidade da computação em nuvem?",
        explanation:
            "Escalar de forma dinâmica e preditiva usa a elasticidade (ajustar recursos à demanda) e a agilidade (reagir rápido a mudanças). Provisionar por picos teóricos gera ociosidade, data center com acesso físico é modelo on-premises, e acoplamento fraco é boa prática de resiliência, não de uso da elasticidade.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Provisionar capacidade com base no uso passado e em picos teóricos", false],
            ["Escalar de forma dinâmica e preditiva para atender à demanda de uso", true],
            ["Construir a aplicação e a infraestrutura em um data center com acesso físico", false],
            ["Dividir a aplicação em componentes com acoplamento fraco", false],
        ],
    },
    {
        statement: "Qual método ajuda a otimizar os custos de quem está migrando para a Nuvem AWS?",
        explanation:
            "No modelo de pagamento conforme o uso, o cliente paga só pelos recursos consumidos, sem desperdício com capacidade ociosa. Comprar hardware antecipadamente e dimensionar para a carga máxima geram recursos parados, e o provisionamento manual reage devagar à demanda, ao contrário da escala automática.",
        topic: "Preços e faturamento",
        options: [
            ["Pagar apenas pelos recursos usados", true],
            ["Comprar hardware antes de precisar dele", false],
            ["Provisionar recursos na nuvem manualmente", false],
            ["Comprar para a carga máxima possível", false],
        ],
    },
    {
        statement:
            "Qual é um dos princípios centrais ao projetar uma aplicação altamente disponível na Nuvem AWS?",
        explanation:
            "Presumir que qualquer componente pode falhar leva a projetar redundância, verificações de integridade e failover em todas as camadas. Serverless é uma opção válida, mas não obrigatória para alta disponibilidade, o Auto Scaling ajuda na escala sem ser exigido em toda aplicação, e código aberto é escolha de licenciamento.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Projetar com arquitetura sem servidor (serverless)", false],
            ["Presumir que todos os componentes podem falhar", true],
            ["Incluir o AWS Auto Scaling em todas as aplicações", false],
            ["Desenvolver todos os componentes com código aberto", false],
        ],
    },
    {
        statement:
            "Um profissional de nuvem está elaborando um plano de recuperação de desastres e pretende replicar dados entre diferentes áreas geográficas. Qual opção atende a esse requisito?",
        explanation:
            "Regiões são áreas geográficas separadas no mundo, então replicar dados entre elas protege contra desastres que atinjam uma localidade inteira. Contas são limites lógicos de gestão e faturamento, Zonas de Disponibilidade ficam dentro de uma mesma Região e locais de borda servem para entrega de conteúdo e cache.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Contas da AWS", false],
            ["Regiões da AWS", true],
            ["Zonas de Disponibilidade", false],
            ["Locais de borda", false],
        ],
    },
    {
        statement:
            "Uma empresa vai usar o Amazon EC2 para implantar uma aplicação comercial global, com o maior nível possível de redundância e tolerância a falhas. Como as instâncias do EC2 devem ser implantadas?",
        explanation:
            "Várias Zonas de Disponibilidade em duas Regiões protegem tanto contra a falha de uma zona quanto contra a indisponibilidade de uma Região inteira, o maior nível de redundância entre as opções. Uma única zona é ponto único de falha, várias interfaces de rede não trazem redundância de computação e uma só Região fica exposta a falhas regionais.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Em uma única Zona de Disponibilidade de uma Região da AWS", false],
            ["Com várias interfaces de rede elásticas em sub-redes diferentes", false],
            ["Em várias Zonas de Disponibilidade de uma Região da AWS", false],
            ["Em várias Zonas de Disponibilidade de duas Regiões da AWS", true],
        ],
    },
    {
        statement:
            "Um arquiteto precisa explicar à equipe o que é uma Zona de Disponibilidade da AWS. Qual descrição está correta?",
        explanation:
            "Uma Zona de Disponibilidade é formada por um ou mais data centers com energia, refrigeração e rede redundantes. Localização geográfica isolada descreve uma Região, locais de borda servem ao cache de conteúdo e fonte única de energia é o oposto do que uma Zona de Disponibilidade oferece.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Um ou mais data centers físicos dentro de uma Região", true],
            ["Uma localização geográfica totalmente isolada das demais", false],
            ["Um conjunto de locais de borda distribuídos pelo mundo", false],
            ["Um data center com uma única fonte de energia e de rede", false],
        ],
    },
    {
        statement:
            "Uma empresa distribui sua carga de trabalho entre a Nuvem AWS e alguns servidores on-premises. Que tipo de arquitetura é essa?",
        explanation:
            "Nuvem híbrida combina infraestrutura on-premises com recursos na nuvem, normalmente conectados por VPN ou AWS Direct Connect. VPN é uma tecnologia de conexão, VPC é uma rede isolada dentro da AWS e nuvem privada não tem componente de nuvem pública.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Rede privada virtual (VPN)", false],
            ["Nuvem privada virtual (VPC)", false],
            ["Nuvem híbrida", true],
            ["Nuvem privada", false],
        ],
    },
    {
        statement: "O que significa tolerância a falhas em uma aplicação?",
        explanation:
            "Tolerância a falhas é a redundância embutida nos componentes, que mantém a aplicação operando mesmo quando um deles falha. Crescer sem mudar o design é escalabilidade, restaurar dados perdidos é recuperação e proteção contra acessos indevidos é segurança.",
        topic: "Conceitos e arquitetura",
        options: [
            ["A capacidade de crescer sem mudar o design da aplicação", false],
            ["A rapidez para restaurar dados perdidos no ambiente", false],
            ["O nível de proteção contra acessos não autorizados", false],
            ["A redundância embutida nos componentes da aplicação", true],
        ],
    },
    {
        statement:
            "Uma empresa quer uma carga de trabalho altamente disponível na AWS, com um plano de recuperação de desastres que permita se recuperar de uma interrupção de serviço em toda uma Região. Qual configuração atende a esses requisitos sem custo ou complexidade desnecessários?",
        explanation:
            "Duas Zonas de Disponibilidade dão alta disponibilidade dentro da Região, e outra Região como site de recuperação protege contra uma falha regional. Zonas da mesma Região e Local Zones dependem da mesma Região, e operar em duas Regiões mais uma terceira soma custo sem necessidade.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Duas Zonas de Disponibilidade em uma Região, com outras Zonas de Disponibilidade da mesma Região como site de recuperação",
                false,
            ],
            [
                "Duas Zonas de Disponibilidade em uma Região, com outra Região da AWS como site de recuperação",
                true,
            ],
            [
                "Duas Zonas de Disponibilidade em uma Região, com uma AWS Local Zone como site de recuperação",
                false,
            ],
            [
                "Duas Regiões da AWS em operação, com uma terceira Região como site de recuperação",
                false,
            ],
        ],
    },
    {
        statement:
            "Fazer mudanças frequentes, pequenas e reversíveis é um princípio de design de qual pilar do AWS Well-Architected Framework?",
        explanation:
            "Fazer mudanças frequentes, pequenas e reversíveis é princípio do pilar Excelência operacional: mudanças menores reduzem o impacto de erros e são mais fáceis de desfazer. Eficiência de desempenho trata do uso eficiente de recursos, Confiabilidade da recuperação de falhas e Segurança da proteção de dados e sistemas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Eficiência de desempenho", false],
            ["Excelência operacional", true],
            ["Confiabilidade", false],
            ["Segurança", false],
        ],
    },
    {
        statement:
            "Uma empresa tem recursos on-premises subutilizados. Qual conceito da Nuvem AWS resolve MELHOR esse problema?",
        explanation:
            "Elasticidade ajusta a capacidade para cima ou para baixo conforme a demanda real, eliminando recursos ociosos e o pagamento por eles. Alta disponibilidade trata de redundância, agilidade da velocidade de provisionamento e acoplamento fraco da dependência entre componentes.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Alta disponibilidade", false],
            ["Elasticidade", true],
            ["Agilidade", false],
            ["Acoplamento fraco", false],
        ],
    },
    {
        statement:
            "Quais princípios de design da Nuvem AWS ajudam a aumentar a confiabilidade de uma carga de trabalho? (Selecione DUAS opções.)",
        explanation:
            "Testar os procedimentos de recuperação e recuperar-se automaticamente de falhas são princípios do pilar Confiabilidade. Medir a eficiência geral e adotar um modelo de consumo pertencem a Otimização de custos, e a arquitetura monolítica acopla componentes e amplia o impacto das falhas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Usar uma arquitetura monolítica", false],
            ["Medir a eficiência geral da carga de trabalho", false],
            ["Testar os procedimentos de recuperação", true],
            ["Adotar um modelo de consumo sob demanda", false],
            ["Recuperar-se automaticamente das falhas", true],
        ],
    },
    {
        statement:
            "Qual benefício da computação em nuvem a AWS demonstra ao oferecer custos variáveis mais baixos graças ao seu alto volume de compras?",
        explanation:
            "Economia de escala: por agregar o uso de milhões de clientes, a AWS compra em volume e repassa custos variáveis menores. Pagamento conforme o uso é o modelo de cobrança, alta disponibilidade é característica de arquitetura e alcance global trata de implantar em várias localidades.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Pagamento conforme o uso", false],
            ["Alta disponibilidade", false],
            ["Alcance global", false],
            ["Economia de escala", true],
        ],
    },
    {
        statement:
            "Qual pilar do AWS Well-Architected Framework se concentra na capacidade de uma carga de trabalho executar a função pretendida de forma correta e consistente?",
        explanation:
            "Confiabilidade trata da carga de trabalho executar sua função de forma correta e consistente, incluindo se recuperar de falhas. Segurança protege dados e sistemas, Eficiência de desempenho usa recursos de forma eficiente e Excelência operacional cuida da operação e da melhoria contínua.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Segurança", false],
            ["Confiabilidade", true],
            ["Eficiência de desempenho", false],
            ["Excelência operacional", false],
        ],
    },
    {
        statement:
            "Uma equipe revisa uma carga de trabalho para escolher tipos e tamanhos de recursos adequados aos requisitos e manter essa eficiência conforme a demanda muda. Qual pilar do AWS Well-Architected Framework orienta esse trabalho?",
        explanation:
            "Selecionar tipos e tamanhos de recursos otimizados para os requisitos e manter a eficiência conforme a demanda muda é foco de Eficiência de desempenho. Otimização de custos mira evitar gastos desnecessários, Confiabilidade trata da recuperação de falhas e escalabilidade automática não é um pilar.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Confiabilidade", false],
            ["Otimização de custos", false],
            ["Eficiência de desempenho", true],
            ["Escalabilidade automática", false],
        ],
    },
    {
        statement:
            "Uma consultoria vai conduzir workshops organizados pelas perspectivas do AWS Cloud Adoption Framework (AWS CAF). Quais das opções a seguir são perspectivas desse framework? (Selecione DUAS opções.)",
        explanation:
            "O AWS CAF tem seis perspectivas: Negócios, Pessoas, Governança, Plataforma, Segurança e Operações. Não existe perspectiva Financeira (a gestão financeira da nuvem é capacidade de Governança), infraestrutura é tratada em Plataforma e agilidade é um benefício da nuvem.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Governança", true],
            ["Financeira", false],
            ["Pessoas", true],
            ["Infraestrutura", false],
            ["Agilidade", false],
        ],
    },
    {
        statement:
            "Segundo o AWS Cloud Adoption Framework (AWS CAF), quais são benefícios que uma organização pode obter com uma adoção de nuvem bem-sucedida? (Selecione DUAS opções.)",
        explanation:
            "O AWS CAF aponta quatro benefícios: redução do risco de negócio, melhor desempenho ESG, aumento de receita e maior eficiência operacional. A nuvem transforma as despesas, mas não as elimina, e conformidade e segurança das aplicações seguem com o cliente pelo modelo de responsabilidade compartilhada.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Redução do risco de negócio da organização", true],
            ["Eliminação das despesas operacionais com TI", false],
            ["Melhor desempenho em ESG (ambiental, social e governança)", true],
            ["Conformidade regulatória automática das cargas de trabalho", false],
            ["Transferência da segurança das aplicações para a AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de uma estratégia de recuperação de desastres em que uma versão reduzida, porém totalmente funcional, do ambiente fique sempre em execução em uma Região secundária, permitindo failover rápido ao escalar para a capacidade total. Qual estratégia é essa?",
        explanation:
            "No warm standby, uma cópia reduzida e funcional roda sempre na Região secundária e é escalada no failover. Backup e restauração recria tudo a partir de backups, pilot light mantém só o núcleo (como o banco replicado) e multi-site ativo-ativo roda capacidade total em todos os locais.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Backup e restauração", false],
            ["Pilot light", false],
            ["Warm standby", true],
            ["Multi-site ativo-ativo", false],
        ],
    },
    {
        statement:
            "Qual estratégia de recuperação de desastres tem o maior tempo de recuperação e o menor custo, por não manter nenhuma infraestrutura em espera no local secundário?",
        explanation:
            "Backup e restauração não mantém recursos rodando no local secundário: após a falha, a infraestrutura é provisionada e os dados são restaurados, o que custa menos e demora mais. Pilot light e warm standby mantêm parte do ambiente ativa, e multi-site ativo-ativo roda capacidade total.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Multi-site ativo-ativo", false],
            ["Warm standby", false],
            ["Pilot light", false],
            ["Backup e restauração", true],
        ],
    },
    {
        statement:
            "Uma empresa quer levar uma aplicação on-premises para a AWS o mais rápido possível, sem alterar o código nem a arquitetura. Qual estratégia de migração ela deve usar?",
        explanation:
            "Rehost (lift and shift) move a aplicação sem mudar código nem arquitetura, por isso é o caminho mais rápido. Replatform faz otimizações pontuais, como trocar para um banco gerenciado, Refactor redesenha a aplicação para recursos nativos da nuvem e Repurchase troca por outro produto, geralmente SaaS.",
        topic: "Migração",
        options: [
            ["Replatform", false],
            ["Refactor", false],
            ["Rehost", true],
            ["Repurchase", false],
        ],
    },
    {
        statement:
            "Durante a migração para a AWS, uma empresa decide mover o banco MySQL autogerenciado, que roda em uma máquina virtual, para o Amazon RDS, sem mudar a lógica central da aplicação nem reescrever código. Qual estratégia de migração isso representa?",
        explanation:
            "Replatform (lift, tinker and shift) faz otimizações pontuais na migração, como trocar um banco autogerenciado pelo Amazon RDS para ganhar backups e patches gerenciados. Rehost moveria o banco como está, Repurchase trocaria por outro produto e Refactor redesenharia a aplicação.",
        topic: "Migração",
        options: [
            ["Rehost", false],
            ["Repurchase", false],
            ["Replatform", true],
            ["Refactor", false],
        ],
    },
    {
        statement:
            "No planejamento da migração, uma empresa descobre que 30% das aplicações on-premises não são usadas há mais de dois anos e não geram valor para o negócio. Qual estratégia de migração deve ser aplicada a essas aplicações?",
        explanation:
            "Retire desativa aplicações sem uso nem valor para o negócio, o que reduz o escopo e o custo da migração. Retain as manteria on-premises com custo de manutenção, e Rehost ou Replatform gastariam esforço e recursos de nuvem com aplicações que ninguém usa.",
        topic: "Migração",
        options: [
            ["Retain", false],
            ["Rehost", false],
            ["Retire", true],
            ["Replatform", false],
        ],
    },
    {
        statement:
            "Qual framework da AWS organiza suas orientações em perspectivas para ajudar as organizações a identificar e priorizar oportunidades de transformação na nuvem?",
        explanation:
            "O AWS CAF organiza suas orientações em seis perspectivas (Negócios, Pessoas, Governança, Plataforma, Segurança e Operações). O Well-Architected usa pilares para avaliar cargas de trabalho, o MAP é um programa de apoio à migração e a responsabilidade compartilhada divide a segurança.",
        topic: "Conceitos e arquitetura",
        options: [
            ["AWS Well-Architected Framework", false],
            ["AWS Cloud Adoption Framework (AWS CAF)", true],
            ["AWS Migration Acceleration Program", false],
            ["Modelo de responsabilidade compartilhada da AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa está planejando a migração para a nuvem e precisa avaliar a prontidão da equipe e identificar lacunas de habilidades. Qual perspectiva do AWS Cloud Adoption Framework (AWS CAF) trata dessa necessidade?",
        explanation:
            "A perspectiva de Pessoas cuida de cultura, estrutura organizacional, liderança e fluência em nuvem, incluindo avaliar habilidades e treinar a equipe. Negócios alinha a nuvem aos resultados de negócio, Operações cuida da operação diária e Plataforma da arquitetura do ambiente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Negócios", false],
            ["Pessoas", true],
            ["Operações", false],
            ["Plataforma", false],
        ],
    },
    {
        statement:
            "Quais perspectivas do AWS Cloud Adoption Framework (AWS CAF) pertencem ao grupo de capacidades técnicas? (Selecione DUAS opções.)",
        explanation:
            "O AWS CAF divide as seis perspectivas em dois grupos: capacidades de negócio (Negócios, Pessoas e Governança) e capacidades técnicas (Plataforma, Segurança e Operações). Por isso Plataforma e Operações são as técnicas entre as opções.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Negócios", false],
            ["Plataforma", true],
            ["Pessoas", false],
            ["Operações", true],
            ["Governança", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que a adoção da nuvem maximize os benefícios e minimize os riscos da transformação. Qual perspectiva do AWS Cloud Adoption Framework (AWS CAF) é a MAIS relevante?",
        explanation:
            "A perspectiva de Governança orquestra as iniciativas de nuvem para maximizar os benefícios e minimizar os riscos da transformação. Segurança trata de confidencialidade, integridade e disponibilidade de dados e cargas, Negócios do valor gerado e Plataforma da arquitetura da nuvem.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Segurança", false],
            ["Negócios", false],
            ["Governança", true],
            ["Plataforma", false],
        ],
    },
    {
        statement:
            "Qual perspectiva do AWS Cloud Adoption Framework (AWS CAF) ajuda a garantir a confidencialidade, a integridade e a disponibilidade dos dados e das cargas de trabalho na nuvem?",
        explanation:
            "A perspectiva de Segurança busca confidencialidade, integridade e disponibilidade de dados e cargas de trabalho, com gestão de identidades, detecção de ameaças e resposta a incidentes. Governança gerencia riscos e benefícios, Operações a entrega diária dos serviços e Plataforma o ambiente.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Governança", false],
            ["Operações", false],
            ["Plataforma", false],
            ["Segurança", true],
        ],
    },
    {
        statement:
            "Uma empresa quer usar o AWS Cloud Adoption Framework (AWS CAF) para montar o caso de negócio da migração para a nuvem. Em qual perspectiva ela deve se concentrar?",
        explanation:
            "A perspectiva de Negócios garante que os investimentos em nuvem acelerem resultados de negócio e ajuda a construir o caso de negócio. Pessoas cuida de habilidades e mudança organizacional, Plataforma da arquitetura técnica e Governança de riscos e benefícios, sem ser a dona do caso de negócio.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Pessoas", false],
            ["Negócios", true],
            ["Plataforma", false],
            ["Governança", false],
        ],
    },
    {
        statement:
            "Qual perspectiva do AWS Cloud Adoption Framework (AWS CAF) se concentra em projetar e implementar ambientes de nuvem novos com escalabilidade de nível corporativo?",
        explanation:
            "A perspectiva de Plataforma trata de construir um ambiente de nuvem corporativo e escalável, com arquitetura de rede, computação, armazenamento e provisionamento. Operações cuida da entrega diária dos serviços, Segurança da proteção de dados e cargas e Governança de riscos e benefícios.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Operações", false],
            ["Segurança", false],
            ["Plataforma", true],
            ["Governança", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa definir como vai gerenciar e monitorar as cargas de trabalho na nuvem no dia a dia, depois da migração. Qual perspectiva do AWS Cloud Adoption Framework (AWS CAF) trata disso?",
        explanation:
            "A perspectiva de Operações garante que os serviços de nuvem sejam entregues no nível que o negócio precisa, com monitoramento, gestão de incidentes e melhoria contínua. Plataforma projeta o ambiente, Governança cuida de riscos e conformidade e Negócios do retorno do investimento.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Plataforma", false],
            ["Governança", false],
            ["Operações", true],
            ["Negócios", false],
        ],
    },
    {
        statement: "Quantas perspectivas o AWS Cloud Adoption Framework (AWS CAF) define?",
        explanation:
            "O AWS CAF define seis perspectivas: Negócios, Pessoas e Governança (capacidades de negócio) e Plataforma, Segurança e Operações (capacidades técnicas). Não confunda com os quatro domínios de transformação: Tecnologia, Processo, Organização e Produto.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Quatro", false],
            ["Cinco", false],
            ["Seis", true],
            ["Sete", false],
        ],
    },
    {
        statement:
            "Na divisão do AWS Cloud Adoption Framework (AWS CAF), quais perspectivas são classificadas como capacidades de negócio? (Selecione DUAS opções.)",
        explanation:
            "No AWS CAF, Negócios, Pessoas e Governança formam as capacidades de negócio, voltadas a estratégia, prontidão organizacional e gestão de riscos. Plataforma, Operações e Segurança são as capacidades técnicas, que cuidam do ambiente, da operação e da proteção.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Negócios", true],
            ["Plataforma", false],
            ["Operações", false],
            ["Segurança", false],
            ["Governança", true],
        ],
    },
    {
        statement:
            "Ao avaliar a prontidão para a nuvem, uma empresa descobre que a equipe de TI não tem experiência com os serviços da AWS. De acordo com o AWS Cloud Adoption Framework (AWS CAF), qual ação a empresa deve tomar?",
        explanation:
            "A perspectiva de Pessoas do AWS CAF recomenda desenvolver a fluência em nuvem com capacitação e gestão da mudança, criando capacidade interna. Adiar a migração até todos se certificarem atrasa sem necessidade, e terceirizar tudo ou trocar a equipe não constrói essa capacidade.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Adiar a migração até que toda a equipe conclua certificações da AWS", false],
            ["Investir em programas de capacitação e requalificação da equipe atual", true],
            ["Terceirizar em definitivo a operação da nuvem para um parceiro externo", false],
            ["Contratar uma nova equipe de nuvem e substituir os profissionais atuais", false],
        ],
    },
    {
        statement:
            "Qual das opções a seguir é um foco central da perspectiva de Governança do AWS Cloud Adoption Framework (AWS CAF)?",
        explanation:
            "Governança orquestra as iniciativas de nuvem para maximizar benefícios e minimizar riscos, com gestão de portfólio, de programas e financeira da nuvem. Projetar a arquitetura é foco de Plataforma, monitorar aplicações é de Operações e controles de identidade e acesso são de Segurança.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Projetar a arquitetura de destino do ambiente de nuvem", false],
            ["Gerenciar os benefícios e os riscos da transformação", true],
            ["Monitorar o desempenho das aplicações após a implantação", false],
            ["Configurar controles de gerenciamento de identidade e acesso", false],
        ],
    },
    {
        statement:
            "O AWS Cloud Adoption Framework (AWS CAF) descreve quatro domínios de transformação. Qual das opções a seguir é um desses domínios?",
        explanation:
            "Os quatro domínios de transformação do AWS CAF são Tecnologia, Processo, Organização e Produto. Redes, bancos de dados e computação são componentes técnicos que entram no domínio Tecnologia, mas não são domínios por si só.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Tecnologia", true],
            ["Redes", false],
            ["Banco de dados", false],
            ["Computação", false],
        ],
    },
    {
        statement:
            "Um executivo quer entender como o AWS Cloud Adoption Framework (AWS CAF) agrupa a transformação na nuvem. Quais das opções a seguir são domínios de transformação desse framework? (Selecione DUAS opções.)",
        explanation:
            "Os domínios de transformação do AWS CAF são Tecnologia, Processo, Organização e Produto. Segurança é uma das seis perspectivas, infraestrutura faz parte do domínio Tecnologia e conformidade é tratada na perspectiva de Governança.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Produto", true],
            ["Segurança", false],
            ["Processo", true],
            ["Infraestrutura", false],
            ["Conformidade", false],
        ],
    },
    {
        statement:
            "Uma empresa que usa o AWS Cloud Adoption Framework (AWS CAF) está identificando lacunas de capacidade e dependências entre áreas para melhorar a prontidão da organização para a nuvem. Em qual fase da jornada ela está?",
        explanation:
            "Na fase Align, a organização identifica lacunas de capacidade nas seis perspectivas, dependências entre áreas e preocupações dos envolvidos para melhorar a prontidão. Envision define a visão e as oportunidades, Launch entrega pilotos em produção e Scale expande a adoção.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Envision", false],
            ["Align", true],
            ["Launch", false],
            ["Scale", false],
        ],
    },
    {
        statement:
            "Qual é a ordem correta das fases de transformação na nuvem do AWS Cloud Adoption Framework (AWS CAF)?",
        explanation:
            "A jornada do AWS CAF segue Envision (visão e oportunidades), Align (lacunas e plano de ação), Launch (pilotos em produção) e Scale (expansão). As outras ordens executam antes de planejar ou avaliam a prontidão depois de já ter implantado.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Align, Envision, Launch, Scale", false],
            ["Envision, Align, Launch, Scale", true],
            ["Launch, Envision, Scale, Align", false],
            ["Envision, Launch, Align, Scale", false],
        ],
    },
    {
        statement:
            "Uma empresa que segue o AWS Cloud Adoption Framework (AWS CAF) vai colocar em produção seus primeiros projetos-piloto para demonstrar valor ao negócio. Em qual fase da jornada ela está?",
        explanation:
            "Na fase Launch, a organização entrega iniciativas piloto em produção e demonstra valor incremental ao negócio. Envision define a visão e as oportunidades, Align avalia lacunas de capacidade e monta o plano, e Scale expande os pilotos para toda a organização.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Envision", false],
            ["Align", false],
            ["Launch", true],
            ["Scale", false],
        ],
    },
    {
        statement:
            "Durante a migração, uma empresa decide substituir seu sistema de e-mail on-premises por um serviço de e-mail em nuvem no modelo SaaS. Qual estratégia de migração isso representa?",
        explanation:
            "Repurchase troca a aplicação existente por outro produto, normalmente SaaS, como sair de um e-mail on-premises para um serviço de e-mail em nuvem. Replatform otimiza a aplicação atual, Refactor a redesenha e Rehost a levaria como está para servidores na nuvem.",
        topic: "Migração",
        options: [
            ["Replatform", false],
            ["Repurchase", true],
            ["Refactor", false],
            ["Rehost", false],
        ],
    },
    {
        statement:
            "Uma empresa tem aplicações que ainda não podem ir para a nuvem por causa de dependências de conformidade não resolvidas. Qual estratégia de migração deve ser aplicada a essas aplicações?",
        explanation:
            "Retain mantém as aplicações no ambiente atual enquanto restrições de conformidade ou dependências técnicas impedem a migração. Retire desativaria aplicações ainda em uso, e Relocate ou Repurchase não resolvem a restrição de conformidade que bloqueia a mudança.",
        topic: "Migração",
        options: [
            ["Retire", false],
            ["Retain", true],
            ["Relocate", false],
            ["Repurchase", false],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são estratégias de migração reconhecidas pela AWS? (Selecione DUAS opções.)",
        explanation:
            "Rehost e Repurchase estão entre as sete estratégias de migração da AWS: Rehost, Replatform, Refactor, Repurchase, Relocate, Retain e Retire. Revalidate, Reuse e Reconfigure não fazem parte dessa lista; a mais próxima de uma reconfiguração seria Replatform.",
        topic: "Migração",
        options: [
            ["Rehost", true],
            ["Revalidate", false],
            ["Repurchase", true],
            ["Reuse", false],
            ["Reconfigure", false],
        ],
    },
    {
        statement:
            "Uma empresa roda máquinas virtuais VMware on-premises e quer levá-las para a AWS com o mínimo de mudanças no ambiente VMware existente. Qual estratégia de migração isso descreve?",
        explanation:
            "Relocate move a infraestrutura para uma versão em nuvem da mesma plataforma, sem comprar hardware, reescrever aplicações ou mudar a operação, como levar o ambiente VMware inteiro para a AWS. Rehost converte servidores em instâncias EC2, Replatform faz otimizações e Refactor redesenha.",
        topic: "Migração",
        options: [
            ["Rehost", false],
            ["Replatform", false],
            ["Relocate", true],
            ["Refactor", false],
        ],
    },
    {
        statement:
            "Quantas estratégias de migração (os chamados Rs da migração) a AWS define atualmente?",
        explanation:
            "A AWS define sete estratégias, os 7 Rs: Rehost, Replatform, Refactor, Repurchase, Relocate, Retain e Retire. O modelo anterior da AWS tinha seis e ganhou Relocate; os cinco Rs são a lista antiga do Gartner, com outros nomes.",
        topic: "Migração",
        options: [
            ["Cinco", false],
            ["Seis", false],
            ["Sete", true],
            ["Oito", false],
        ],
    },
    {
        statement:
            "Uma empresa quer migrar um grande banco de dados Oracle on-premises para o Amazon DynamoDB, a fim de melhorar a escalabilidade e reduzir custos de licença. Qual estratégia de migração isso descreve?",
        explanation:
            "Sair de um banco relacional Oracle para um NoSQL como o DynamoDB exige redesenhar o modelo de dados e a aplicação, o que é Refactor. Replatform levaria o Oracle para o Amazon RDS for Oracle, Rehost o rodaria em EC2 como está e Repurchase trocaria por um produto comercial.",
        topic: "Migração",
        options: [
            ["Replatform", false],
            ["Rehost", false],
            ["Refactor", true],
            ["Repurchase", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS automatiza a migração lift and shift de servidores on-premises ou de outras nuvens para a AWS?",
        explanation:
            "O AWS Application Migration Service replica continuamente os servidores de origem e os converte e inicia como instâncias na AWS, automatizando o rehost. O AWS DMS migra bancos de dados, o Migration Hub acompanha o andamento das migrações e o AWS SCT converte esquemas de banco.",
        topic: "Migração",
        options: [
            ["AWS Database Migration Service (AWS DMS)", false],
            ["AWS Application Migration Service", true],
            ["AWS Migration Hub", false],
            ["AWS Schema Conversion Tool (AWS SCT)", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece um local central para acompanhar o andamento de migrações de aplicações feitas com várias ferramentas de migração da AWS?",
        explanation:
            "O AWS Migration Hub reúne em um painel o status das migrações feitas com ferramentas como o Application Migration Service e o AWS DMS. O Application Migration Service executa a migração dos servidores, o CloudTrail registra chamadas de API e o AWS Config avalia configurações de recursos.",
        topic: "Migração",
        options: [
            ["AWS Application Migration Service", false],
            ["AWS CloudTrail", false],
            ["AWS Migration Hub", true],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "Qual estratégia de migração traz o MAIOR benefício de longo prazo com recursos nativos da nuvem, mas exige o MAIOR esforço de desenvolvimento?",
        explanation:
            "Refactor rearquiteta a aplicação com serviços nativos da nuvem, como serverless e arquiteturas orientadas a eventos, trazendo mais escalabilidade e eficiência de custo, mas com o maior investimento. Rehost e Relocate quase não mudam a aplicação, e Replatform faz só otimizações pontuais.",
        topic: "Migração",
        options: [
            ["Rehost", false],
            ["Replatform", false],
            ["Refactor", true],
            ["Relocate", false],
        ],
    },
    {
        statement:
            "Uma empresa está migrando para a AWS e quer avaliar sua infraestrutura on-premises para entender as dependências e a utilização dos servidores. Qual serviço da AWS ela deve usar?",
        explanation:
            "O AWS Application Discovery Service coleta configuração, utilização e dependências de rede dos servidores on-premises para planejar a migração. O Migration Hub acompanha o andamento, o Application Migration Service executa a migração e o Trusted Advisor avalia ambientes que já estão na AWS.",
        topic: "Migração",
        options: [
            ["AWS Migration Hub", false],
            ["AWS Application Discovery Service", true],
            ["AWS Application Migration Service", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS foi criado especificamente para migrar bancos de dados on-premises para a AWS, tanto entre mecanismos iguais quanto entre mecanismos diferentes?",
        explanation:
            "O AWS DMS replica dados de bancos on-premises para a AWS com pouca indisponibilidade, em migrações homogêneas e heterogêneas. O Application Migration Service migra servidores inteiros, o AWS SCT só converte esquemas e código de banco e o DataSync transfere arquivos entre sistemas de armazenamento.",
        topic: "Migração",
        options: [
            ["AWS Application Migration Service (AWS MGN)", false],
            ["AWS Schema Conversion Tool (AWS SCT)", false],
            ["AWS Database Migration Service (AWS DMS)", true],
            ["AWS DataSync", false],
        ],
    },
    {
        statement:
            "Uma empresa está migrando uma aplicação monolítica para a AWS e decide dividi-la em microsserviços com AWS Lambda e Amazon API Gateway. Qual estratégia de migração isso representa?",
        explanation:
            "Quebrar um monólito em microsserviços com AWS Lambda e Amazon API Gateway muda o desenho da aplicação para usar recursos nativos da nuvem, o que é Refactor. Rehost manteria o monólito em EC2, Replatform faria só ajustes pontuais e Repurchase trocaria a aplicação por um produto SaaS.",
        topic: "Migração",
        options: [
            ["Rehost", false],
            ["Replatform", false],
            ["Repurchase", false],
            ["Refactor", true],
        ],
    },
    {
        statement:
            "Uma empresa tem 500 servidores on-premises para migrar. Após a avaliação, 200 serão movidos como estão (lift and shift), 100 terão a aplicação redesenhada e o mecanismo de banco de dados trocado, 50 serão substituídos por soluções SaaS e 150 não são mais necessários. Quais combinações de estratégia estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Os 200 servidores movidos sem mudanças são Rehost e os 150 sem uso são Retire. Redesenhar a aplicação trocando o mecanismo de banco é Refactor, não Replatform; trocar por SaaS é Repurchase, não Retain; e Relocate leva uma plataforma inteira, como VMware, para a nuvem.",
        topic: "Migração",
        options: [
            ["Rehost para os 200 servidores", true],
            ["Replatform para os 100 servidores de banco de dados", false],
            ["Retire para os 150 servidores sem uso", true],
            ["Retain para as 50 aplicações substituídas por SaaS", false],
            ["Relocate para os 200 servidores", false],
        ],
    },
    {
        statement:
            "Qual opção descreve MELHOR a diferença entre Rehost e Replatform como estratégias de migração?",
        explanation:
            "Rehost (lift and shift) leva a aplicação sem mudar código nem arquitetura; Replatform (lift, tinker and shift) faz ajustes pontuais, como usar um banco gerenciado. Trocar por SaaS é Repurchase, e o Rehost costuma ser mais rápido, não mais lento, por exigir menos mudanças.",
        topic: "Migração",
        options: [
            [
                "Rehost altera o código da aplicação, enquanto Replatform mantém o código intacto",
                false,
            ],
            [
                "Rehost move a aplicação como está, enquanto Replatform faz otimizações pontuais",
                true,
            ],
            [
                "Rehost troca a aplicação por SaaS, enquanto Replatform mantém a aplicação original",
                false,
            ],
            ["Rehost é mais lento que Replatform, porque exige mais testes antes da virada", false],
        ],
    },
];
