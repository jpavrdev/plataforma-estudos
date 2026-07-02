// Reconstrói a trilha AWS (AWS CLF-C02) com o conteúdo em blocos e um quiz de 5
// questões por aula. Idempotente pelo marcador "Módulo 4 - Armazenamento", que só
// existe nesta estrutura nova. É destrutivo: apaga módulos/aulas/questões antigos
// da trilha antes de recriar (o progresso da trilha AWS é reiniciado).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-aws.ts
import { db } from "../db.ts";
import {
    trails,
    modules,
    lessons,
    questions,
    questionOptions,
    questionAnswers,
    lessonProgress,
} from "../schema.ts";
import { eq, and, inArray } from "drizzle-orm";

const NOME = "AWS CLF-C02";
const MARCADOR = "Módulo 4 - Armazenamento";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const DADOS: Modulo[] = [
    {
        titulo: "Módulo 1 - Introdução à AWS",
        aulas: [
            {
                titulo: "Fundamentos - Modelo Cliente-Servidor",
                blocks: [
                    { type: "text", value: "# Fundamentos - Modelo Cliente-Servidor" },
                    {
                        type: "quote",
                        value: "O **modelo cliente-servidor** é o paradigma de comunicação por trás de **quase toda a computação em nuvem**, incluindo a AWS. Entender esse modelo é pré-requisito para tudo o que vem depois: EC2 (Elastic Compute Cloud), S3 (Simple Storage Service), API Gateway, Lambda, RDS (Relational Database Service) e muitos outros serviços.",
                    },
                    {
                        type: "text",
                        value: "## 1. O conceito\n\nNo modelo cliente-servidor existem dois papéis:\n\n- **Cliente** é quem **faz a solicitação**. No vocabulário técnico, essa solicitação se chama **request**.\n- **Servidor** é quem **recebe a solicitação, processa e devolve uma resposta**. Essa resposta se chama **response**.\n\nQuem começa a conversa é sempre o cliente. O servidor fica parado, esperando, e só age quando recebe um pedido. Ele nunca manda nada por conta própria.",
                    },
                    {
                        type: "code",
                        value: "   ┌─────────┐   1. request    ┌──────────┐\n   │ Cliente │ ──────────────▶ │ Servidor │\n   │         │ ◀────────────── │          │\n   └─────────┘   2. response   └──────────┘",
                    },
                    {
                        type: "text",
                        value: "## 2. Analogia oficial da AWS - a cafeteria\n\nA AWS usa o exemplo de uma cafeteria no curso **Cloud Practitioner Essentials** para fixar esse conceito. A ideia é associar cada papel do modelo a algo comum do dia a dia:",
                    },
                    {
                        type: "table",
                        value: '[["Papel real","Papel no modelo"],["**Cliente** da cafeteria","**Cliente** (faz o pedido)"],["**Barista**","**Servidor** (prepara e entrega)"],["**Pedido** (\\"um café, por favor\\")","**Request**"],["**Café entregue**","**Response**"]]',
                    },
                    {
                        type: "text",
                        value: "O **cenário correto**, que descreve o modelo do jeito certo, é este:",
                    },
                    {
                        type: "quote",
                        value: '_"O cliente vai até o barista e faz o pedido de um café. O barista prepara o café para entregá-lo ao cliente."_',
                    },
                    {
                        type: "text",
                        value: "Agora veja os **cenários errados**. Em cada um, alguma regra do modelo cliente-servidor foi quebrada:",
                    },
                    {
                        type: "table",
                        value: '[["Cenário","O que está errado"],["Cliente toma um café em estação de **autoatendimento**, sem falar com o barista.","Não há interação cliente-servidor."],["Barista **proativamente** prepara e leva o café sem pedido.","Servidor não age sem request do cliente."],["Cliente faz o **próprio café** usando o equipamento da loja.","Cliente não usa o servidor; ele \\"é tudo\\"."]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Como isso se aplica na AWS\n\nQuase tudo na AWS é uma versão desse mesmo modelo. Em cada linha da tabela abaixo, alguém faz o papel de cliente e alguém faz o papel de servidor:",
                    },
                    {
                        type: "table",
                        value: '[["Cliente (faz request)","Servidor (responde)","Tipo de request"],["Navegador do usuário final","App rodando em **EC2**","HTTP/HTTPS"],["App móvel","**API Gateway** + Lambda","REST / WebSocket"],["`aws` CLI no seu terminal","Serviço AWS (S3, EC2, etc.)","HTTPS + assinatura AWS Sig v4"],["SDK (boto3, AWS SDK for JS)","Qualquer serviço AWS","HTTPS + Sig v4"],["AWS Console (browser)","APIs internas da AWS","HTTPS"],["Outra instância EC2","RDS / DynamoDB","TCP / HTTP"]]',
                    },
                    {
                        type: "text",
                        value: 'Repare no **princípio comum** a todos esses casos: o cliente sempre **inicia** a conversa. Tanto faz se o cliente é um navegador, um aplicativo de celular, a CLI (Command Line Interface, a ferramenta que você usa pela linha de comando) ou um SDK (Software Development Kit, o conjunto de bibliotecas que você chama dentro do seu código). Quem dá o primeiro passo é sempre ele.\n\n## 4. Por que isso importa no Cloud Practitioner\n\nA prova cobra esse conceito por dois motivos.\n\nPrimeiro, **entender a dupla request e response** é a base para entender vários serviços que aparecem mais para a frente:\n\n- **EC2**: os servidores que você liga e que atendem os clientes.\n- **Elastic Load Balancer**: distribui os requests entre vários servidores ao mesmo tempo.\n- **Auto Scaling**: adiciona mais servidores quando chega muita request de uma vez.\n- **API Gateway**: a porta de entrada por onde passam os requests dos clientes. (API significa Application Programming Interface.)\n- **CloudFront**: guarda cópias das responses (faz cache) perto do cliente para responder mais rápido.\n\nSegundo, **saber diferenciar cliente, servidor e infraestrutura** é necessário para entender o **modelo de responsabilidade compartilhada**, um assunto que vem mais à frente:\n\n- Você, o cliente da AWS, é responsável por **partes** da segurança.\n- A AWS é responsável por **outras partes**.\n\n## 5. Conceitos adjacentes que caem na prova\n\n### Stateless vs Stateful\n\n- **Stateless** (sem estado): cada request é **independente** das demais. O servidor não "lembra" do cliente de uma request para a outra. O HTTP (HyperText Transfer Protocol, o protocolo da web) puro é assim. Isso permite o **horizontal scaling** com facilidade, ou seja, crescer adicionando mais servidores, já que qualquer servidor atende qualquer request.\n- **Stateful** (com estado): o servidor mantém o **estado da sessão** entre uma request e outra. Isso dificulta o scaling, porque exige sticky sessions (prender o cliente sempre ao mesmo servidor) ou guardar esse estado em algum lugar fora do servidor.',
                    },
                    {
                        type: "quote",
                        value: "Na AWS, prefira o modelo **stateless** e mantenha o estado em serviços como S3, DynamoDB, ElastiCache ou RDS. É isso que permite o EC2 Auto Scaling funcionar.",
                    },
                    {
                        type: "text",
                        value: "### Sincrono vs Assíncrono\n\n- **Síncrono**: o cliente envia a request e **espera** a response chegar antes de seguir em frente. É o caso do HTTP.\n- **Assíncrono**: o cliente coloca uma mensagem em uma fila e já segue trabalhando em outra coisa. O servidor processa essa mensagem depois. É o caso de serviços como **SQS** (Simple Queue Service), **SNS** (Simple Notification Service) e **EventBridge**.\n\n### Pull vs Push\n\n- **Pull** (puxar): o cliente **busca** os dados quando quer, por iniciativa própria. Por exemplo, uma chamada `GET /orders`.\n- **Push** (empurrar): o servidor **avisa** o cliente assim que há novidade, sem o cliente precisar perguntar. Por exemplo, uma conexão WebSocket ou o **SNS**.\n\n## 6. Cheat sheet\n\nGuarde este resumo rápido para revisar antes da prova:",
                    },
                    {
                        type: "code",
                        value: "Cliente   →  faz request, espera response\nServidor  →  recebe request, processa, retorna response\n\nCliente SEMPRE inicia a conversa.\nServidor SÓ responde quando solicitado.\n\nCafeteria AWS:\n  Cliente da cafeteria = Cliente (request)\n  Barista              = Servidor (response)\n  Pedido do café       = Request\n  Café entregue        = Response",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No modelo cliente-servidor, base de quase toda a computação em nuvem da AWS, qual afirmação descreve corretamente o papel de cada parte?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O servidor envia a request e o cliente recebe, processa e devolve a response.",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente envia a request e o servidor recebe, processa e devolve a response.",
                                isCorrect: true,
                            },
                            {
                                text: "O servidor inicia a conversa e envia dados ao cliente sempre que quiser, sem receber nenhum pedido.",
                                isCorrect: false,
                            },
                            {
                                text: "Cliente e servidor trocam mensagens ao mesmo tempo, sem que nenhum dos dois precise iniciar a conversa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na analogia da cafeteria usada no curso AWS Cloud Practitioner Essentials, o barista, que prepara e entrega o café, corresponde a qual papel do modelo cliente-servidor?",
                        difficulty: "facil",
                        options: [
                            { text: "Cliente", isCorrect: false },
                            { text: "Request", isCorrect: false },
                            { text: "Servidor", isCorrect: true },
                            { text: "Response", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual serviço da AWS é responsável por distribuir os requests recebidos entre vários servidores?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon API Gateway", isCorrect: false },
                            { text: "Amazon CloudFront", isCorrect: false },
                            { text: "Amazon EC2 Auto Scaling", isCorrect: false },
                            { text: "Elastic Load Balancing (ELB)", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação stateless (sem estado) facilita o horizontal scaling e o funcionamento do EC2 Auto Scaling. Qual é o motivo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cada request é independente das demais, então qualquer servidor pode atendê-la sem precisar lembrar das requests anteriores.",
                                isCorrect: true,
                            },
                            {
                                text: "O servidor guarda na própria memória local o estado da sessão de cada cliente entre uma request e outra.",
                                isCorrect: false,
                            },
                            {
                                text: "Cada cliente fica preso ao mesmo servidor por sticky session durante toda a sessão.",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente envia todas as suas requests de uma só vez para um único servidor fixo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais serviços da AWS são usados para comunicação assíncrona, em que o cliente coloca uma mensagem e segue trabalhando sem esperar a response imediata?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon EC2, Amazon EBS e Amazon VPC", isCorrect: false },
                            {
                                text: "Amazon RDS, Amazon Aurora e Amazon Redshift",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon SQS, Amazon SNS e Amazon EventBridge",
                                isCorrect: true,
                            },
                            { text: "AWS IAM, AWS KMS e AWS CloudTrail", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Infraestrutura Global",
        aulas: [
            {
                titulo: "Infraestrutura Global da AWS - Regiões, AZs e Edge Locations",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA AWS (Amazon Web Services) opera **uma rede mundial** de datacenters, e essa rede é organizada em **3 camadas hierárquicas**. As **Regiões** são geografias inteiras. As **Availability Zones** são clusters de datacenters dentro de uma região, isolados entre si. E as **Edge Locations** são pontos de presença espalhados pelo mundo, usados por serviços de borda como o CloudFront. Entender essa hierarquia é **a base** pra projetar aplicações resilientes e de baixa latência.",
                    },
                    { type: "text", value: "## 1. As 3 camadas" },
                    {
                        type: "code",
                        value: "   ┌─────────────────────────────────────────────────────┐\n   │ REGIÕES (~35 globais)                                │\n   │  Ex: us-east-1 (Virgínia), sa-east-1 (São Paulo)     │\n   │                                                       │\n   │  ┌──────────────────────────────────────────┐         │\n   │  │ AVAILABILITY ZONES (3+ por região)        │         │\n   │  │  Ex: us-east-1a, us-east-1b, us-east-1c   │         │\n   │  │                                            │         │\n   │  │  ┌──────────────────────────┐              │         │\n   │  │  │ Datacenters físicos        │             │         │\n   │  │  │ (vários por AZ)            │             │         │\n   │  │  └──────────────────────────┘              │         │\n   │  └──────────────────────────────────────────┘         │\n   └─────────────────────────────────────────────────────┘\n\n   ┌─────────────────────────────────────────────────────┐\n   │ EDGE LOCATIONS (~600 globais)                        │\n   │  Pontos de presença pra CloudFront, Route 53, WAF    │\n   │  Próximos do usuário final                            │\n   └─────────────────────────────────────────────────────┘",
                    },
                    { type: "text", value: "## 2. Região (Region)" },
                    {
                        type: "quote",
                        value: "Uma região é uma **área geográfica isolada** no mundo (Virgínia, Tóquio, São Paulo, etc.). Cada uma contém **múltiplos datacenters**, que ficam organizados em AZs.",
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- Cada região é **completamente independente** das outras. Isso vale pra compliance, pra billing (cobrança) e pros recursos que você cria.\n- Recursos criados em uma região **NÃO aparecem automaticamente em outras**. Se você quiser o mesmo recurso em outro lugar, precisa criar de novo lá.\n- Cada região tem **um nome curto** que você usa nas ferramentas, como `us-east-1`, `eu-west-2`, `sa-east-1` e `ap-southeast-1`.\n- Algumas regiões são **especiais**:\n  - **GovCloud (US)** existe só pra agências do governo americano.\n  - **China (Beijing, Ningxia)** é operada por parceiros locais (Sinnet e NWCD) e usa uma conta separada.\n\n### Como escolher uma região (4 fatores AWS oficiais)",
                    },
                    {
                        type: "table",
                        value: '[["Fator","Pergunta"],["**Compliance e regulação**","Os dados precisam ficar em um país/jurisdição específica?"],["**Proximidade do usuário**","Onde estão seus clientes? Menor latência = mais perto deles"],["**Serviços disponíveis**","Nem toda região tem todos os serviços (regiões novas ficam pra trás)"],["**Preço**","Preços variam por região (US East é geralmente o mais barato)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Exemplo prático:** um banco brasileiro com clientes no Brasil deve escolher **sa-east-1 (São Paulo)**, tanto por proximidade quanto porque os dados precisam ficar no Brasil (LGPD, a Lei Geral de Proteção de Dados). Mas se ele for fazer treinamento pesado de ML (machine learning), a região **us-east-1 (Virgínia)** pode sair mais barata e tem todos os serviços.",
                    },
                    { type: "text", value: "## 3. Availability Zone (AZ)" },
                    {
                        type: "quote",
                        value: "Uma AZ (Availability Zone, ou zona de disponibilidade) é um **cluster de 1 ou mais datacenters** dentro de uma região. Ela fica **isolada fisicamente** das outras AZs da mesma região.",
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- As AZs são **isoladas** umas das outras: energia, refrigeração e rede são separadas.\n- Elas são conectadas por uma **rede de alta velocidade e baixa latência** (poucos milissegundos, single-digit ms).\n- Cada região tem **no mínimo 3 AZs**, e a maioria tem de 3 a 6.\n- O nome de uma AZ segue o padrão `us-east-1a`, `us-east-1b`, `us-east-1c`.\n- **A mesma letra (1a, 1b) em contas diferentes pode apontar pra uma AZ física diferente.** A AWS embaralha esse mapeamento pra balancear o uso entre os clientes.\n\n### Por que existem\n\n- **Isolamento de falhas.** Se um datacenter sofre incêndio, enchente ou queda de energia, isso **não derruba as outras AZs**.\n- **Alta disponibilidade.** Se você roda seu app em 2 ou mais AZs, uma AZ inteira pode cair sem causar downtime (tempo fora do ar).\n- **Latência baixa entre AZs.** A rede da AWS interconecta as AZs com fibra dedicada, tipicamente abaixo de 2ms (< 2ms typical).\n\n### Como usar AZs corretamente",
                    },
                    {
                        type: "code",
                        value: "   App ──▶ Load Balancer\n              │\n              ├──▶ EC2 (us-east-1a) ──┐\n              ├──▶ EC2 (us-east-1b) ──┼─▶ RDS Multi-AZ\n              └──▶ EC2 (us-east-1c) ──┘\n\n   ↑ Se us-east-1a cair, ELB roteia pras outras AZs.\n   ↑ RDS standby em outra AZ assume.\n   ↑ Aplicação continua funcionando.",
                    },
                    {
                        type: "quote",
                        value: "**Regra de ouro:** pra alta disponibilidade, **sempre rode em ≥2 AZs**. O custo pra rodar EC2 em N AZs é zero adicional, porque você paga só pelas instâncias.",
                    },
                    { type: "text", value: "## 4. Edge Locations e Regional Edge Caches" },
                    {
                        type: "quote",
                        value: "São datacenters **menores e mais espalhados** do que as regiões. Eles são usados por serviços de **borda** (edge), como CDN, DNS e WAF.",
                    },
                    {
                        type: "text",
                        value: "### Para que servem\n\n- **CloudFront** é a CDN (Content Delivery Network, rede de entrega de conteúdo). Ele guarda cópias em cache do conteúdo perto do usuário.\n- **Route 53** é o DNS (Domain Name System, sistema de nomes de domínio). Ele resolve nomes globais com baixa latência.\n- **AWS WAF e Shield** filtram ataques na borda, antes de eles chegarem no seu app.\n- **AWS Global Accelerator** roteia o tráfego pela rede interna da AWS.\n\n### Hierarquia\n\n- A **Edge Location** (~600 no mundo) é o ponto de cache local, mais perto do usuário.\n- O **Regional Edge Cache** é uma camada intermediária maior, que fica entre a Edge e a Region.\n- A **Region** é a origem do conteúdo.",
                    },
                    {
                        type: "code",
                        value: "   Usuário ──▶ Edge Location (perto) ──▶ Regional Edge Cache ──▶ Region (origem)\n                  cache hit aqui = ms\n                  cache miss = sobe pra próxima camada",
                    },
                    {
                        type: "quote",
                        value: "**Vantagem:** quanto mais perto do usuário está o conteúdo, **menor a latência** e **menor a carga no servidor de origem**.",
                    },
                    {
                        type: "text",
                        value: "## 5. AWS Outposts, Local Zones, Wavelength (mention)\n\nA AWS expandiu a infraestrutura pra **levar a nuvem mais perto do cliente**:",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","O que é"],["**AWS Outposts**","Rack AWS **dentro do seu datacenter** (on-prem)"],["**Local Zones**","\\"Mini-região\\" perto de cidades grandes (LA, Miami, Boston)"],["**Wavelength Zones**","Compute dentro de **redes 5G de telcos** (latência ultra-baixa pra apps móveis)"],["**AWS Snow Family**","Hardware portátil pra migração / edge computing offline"]]',
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** se a questão fala em "**latência ultra-baixa pra apps 5G**", a resposta é **Wavelength**. Se fala em "**AWS no meu datacenter**", é **Outposts**. Se fala em "**migrar PB de dados sem internet**", é **Snowball/Snowmobile**.',
                    },
                    {
                        type: "text",
                        value: "## 6. Conceitos de confiabilidade ligados à infra global\n\n### High Availability (HA)\n- O sistema continua funcionando mesmo quando alguns componentes falham.\n- Na AWS, você consegue isso com **multi-AZ** ou **multi-region** (mais de uma AZ ou mais de uma região).\n- O SLA (Service Level Agreement, acordo de nível de serviço) típico fica entre 99,9% e 99,99%.\n\n### Fault Tolerance\n- O sistema continua **sem nenhuma perda de capacidade**, mesmo com falhas.\n- É mais caro, porque exige redundância completa.\n- É usado em sistemas críticos, como os de finance (finanças) e healthcare (saúde).\n\n### Disaster Recovery (DR)\n- É a estratégia pra se recuperar depois de uma **catástrofe**, como uma região inteira destruída.\n- O **RTO** (Recovery Time Objective, objetivo de tempo de recuperação) mede quanto tempo você leva até voltar ao ar.\n- O **RPO** (Recovery Point Objective, objetivo de ponto de recuperação) mede quanto de dado você pode perder.\n- Existem 4 estratégias clássicas, do mais barato e lento ao mais caro e rápido:",
                    },
                    {
                        type: "code",
                        value: "   Backup & Restore  → restaura do zero em DR (horas-dias)\n   Pilot Light       → mínimo rodando, escala em DR (minutos-horas)\n   Warm Standby      → réplica em escala reduzida (minutos)\n   Multi-Site Active/Active → tudo rodando simultaneamente (~zero)",
                    },
                    {
                        type: "quote",
                        value: "**Tradeoff:** quanto **menor o RTO/RPO**, **maior o custo**. Você escolhe a estratégia com base em quanto o downtime custa pro negócio.",
                    },
                    { type: "text", value: "## 7. Como escolher quantas AZs / regiões usar" },
                    {
                        type: "table",
                        value: '[["Cenário","Solução"],["App de dev/test","**1 AZ** (sem HA, custo mínimo)"],["App produção pequena","**2-3 AZs** (HA básico, Multi-AZ RDS)"],["App produção crítica regional","**3 AZs** + Auto Scaling + Multi-AZ DB"],["App global com latência baixa pra todos","**CloudFront** + multi-region read replicas"],["App produção com DR cross-region","**2 regiões** ativas + replicação"],["App financeira que não pode parar nunca","**Multi-region active-active** + tudo replicado"]]',
                    },
                    {
                        type: "text",
                        value: '## 8. Pegadinhas comuns da prova\n\n1. **"Recursos em uma região aparecem em outras?"** → **Não**. Cada região é independente.\n2. **"Quantas AZs cada região tem?"** → **Mínimo 3**.\n3. **"AZ tem 1 datacenter?"** → **Não** - pode ter **vários** datacenters.\n4. **"AZs da mesma região estão a quantos km de distância?"** → Tipicamente **dezenas de km** (próximas o bastante pra latência baixa, longe o bastante pra isolamento).\n5. **"Edge Location é o mesmo que AZ?"** → **Não**. Edge é menor, focado em cacheamento.\n6. **"CloudFront roda em região ou em edge?"** → **Edge Locations** (originando da região).\n7. **"AWS Outposts é o quê?"** → AWS rodando **no seu datacenter** (on-prem).\n8. **"Como ter latência 5G ultra-baixa?"** → **Wavelength Zones**.\n9. **"4 fatores pra escolher uma região"** → Compliance, proximidade do usuário, serviços disponíveis, preço.\n10. **"RTO baixo + RPO baixo = mais caro"** - verdade.\n11. **"Multi-AZ é DR?"** → **Não exatamente** - Multi-AZ é HA dentro de uma região. DR é cross-region.\n12. **"AWS GovCloud usa a mesma console que a normal?"** → **Não** - tem console separada, conta separada.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '3 camadas:\n  REGIÃO         → área geográfica isolada (~35 globais)\n  AVAILABILITY   → 3+ clusters de datacenters por região\n   ZONE (AZ)      isolados entre si, conectados por fibra\n                  fault domain (uma AZ pode cair sem afetar outra)\n  EDGE LOCATION  → ~600 pontos globais\n                  CloudFront, Route 53, WAF, Global Accelerator\n\n4 fatores pra escolher região:\n  1. Compliance (LGPD, GDPR, sovereign data)\n  2. Proximidade do usuário (latência)\n  3. Serviços disponíveis (nem toda região tem tudo)\n  4. Preço (varia por região)\n\nConfiabilidade:\n  HA (High Availability)      → continua com falhas (Multi-AZ)\n  Fault Tolerance              → sem perda de capacidade (caro)\n  DR (Disaster Recovery)       → recuperar após catástrofe (cross-region)\n\n4 estratégias de DR (barato→caro, lento→rápido):\n  1. Backup & Restore       → horas-dias\n  2. Pilot Light            → minutos-horas\n  3. Warm Standby           → minutos\n  4. Multi-Site Active/Active → ~zero downtime\n\nVariantes da infra global:\n  AWS Outposts     → AWS no seu datacenter\n  Local Zones      → "mini-região" perto de cidades grandes\n  Wavelength       → compute em rede 5G (ultra-low latency mobile)\n  Snow Family      → migração / edge offline (Snowball, Snowmobile)\n\nAtalhos pra prova:\n  "isolar falha física"               → AZs\n  "menor latência global"             → CloudFront (Edge Locations)\n  "alta disponibilidade dentro da região" → Multi-AZ\n  "DR contra região destruída"        → multi-region replicação\n  "compliance LGPD / GDPR"            → escolher região local\n  "5G ultra-baixa latência"           → Wavelength\n  "AWS no meu datacenter"             → Outposts',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual serviço da AWS usa as edge locations para armazenar cópias em cache do conteúdo perto do usuário final e reduzir a latência de entrega?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon CloudFront", isCorrect: true },
                            { text: "Amazon EC2", isCorrect: false },
                            { text: "Amazon RDS", isCorrect: false },
                            { text: "Amazon EBS", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe criou uma instância Amazon EC2 na Região us-east-1 (Norte da Virgínia). O que ocorre com esse recurso nas demais Regiões da AWS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele não aparece automaticamente em outras Regiões, porque cada Região é independente; para tê-lo em outro lugar, é preciso criá-lo novamente lá.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele é replicado automaticamente para todas as Regiões da AWS.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele é replicado automaticamente para a Região sa-east-1 (São Paulo) por padrão.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele passa a ser distribuído automaticamente pelas edge locations mais próximas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação descreve corretamente uma Zona de Disponibilidade (AZ)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É um conjunto de um ou mais data centers isolados fisicamente dentro de uma Região, com energia, refrigeração e rede independentes.",
                                isCorrect: true,
                            },
                            {
                                text: "É uma área geográfica inteira do mundo que agrupa várias Regiões da AWS.",
                                isCorrect: false,
                            },
                            {
                                text: "É um ponto de presença global que o Amazon CloudFront usa para cache de conteúdo.",
                                isCorrect: false,
                            },
                            {
                                text: "É um único data center compartilhado por todas as Regiões de um mesmo continente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação de produção precisa continuar disponível mesmo que um data center inteiro falhe dentro da Região. Qual abordagem a AWS recomenda para alcançar essa alta disponibilidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Distribuir a aplicação em duas ou mais Zonas de Disponibilidade da Região.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar várias instâncias EC2 dentro de uma única Zona de Disponibilidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir a instância por um tipo maior, com mais CPU e memória.",
                                isCorrect: false,
                            },
                            {
                                text: "Hospedar a aplicação em uma edge location próxima dos usuários.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa vai implantar uma nova aplicação e precisa decidir em qual Região da AWS hospedá-la. Qual fator é legitimamente relevante para essa escolha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A conformidade com leis de residência de dados, a latência até os usuários e o preço dos serviços, que variam conforme a Região.",
                                isCorrect: true,
                            },
                            {
                                text: "O número de edge locations dentro da Região, que define quantas Zonas de Disponibilidade ela terá.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada precisa ser avaliado, porque todas as Regiões oferecem os mesmos serviços pelo mesmo preço.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas a Região us-east-1 (Norte da Virgínia) pode hospedar cargas de produção.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon CloudFront - CDN da AWS",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nCloudFront é a **Content Delivery Network (CDN)** da AWS, ou seja, a rede de entrega de conteúdo. Ele **guarda cópias em cache do conteúdo do seu site ou app em centenas de Edge Locations** ao redor do mundo. Assim, ele serve direto do edge mais próximo do usuário, com latência de **milissegundos (ms)** em vez de **centenas de ms**. Isso também **alivia a origem** (S3, EC2, ELB), que pode receber até 90% menos requisições.",
                    },
                    { type: "text", value: "## 1. Por que CDN existe\n\n### Sem CDN" },
                    {
                        type: "code",
                        value: "   Usuário em Tóquio ──HTTPS──▶ S3 bucket em Virgínia (us-east-1)\n                                  │ travessia transatlântica\n                                  │ latência 150-300ms cada request\n                                  │ overhead acumulado em 50 assets\n   Resultado: site demora 5-10s pra carregar",
                    },
                    { type: "text", value: "### Com CloudFront" },
                    {
                        type: "code",
                        value: "   Usuário em Tóquio ──HTTPS──▶ Edge Location Tóquio\n                                  │ cache hit = 5ms\n                                  │ cache miss = busca em Virgínia, cacheia, serve\n\n   Próximos usuários em Tóquio: tudo já está em cache local = 5ms\n   Resultado: site carrega em 1-2s",
                    },
                    {
                        type: "text",
                        value: "**Benefícios principais:**\n- **Latência baixa**, na casa dos ms em vez de centenas de ms.\n- **Alivia a origem.** O S3 é cobrado por GB transferido e o ELB é cobrado por request, então servir do cache reduz esses custos.\n- **Proteção contra picos**, porque a CDN absorve o pico de acessos.\n- **Segurança extra**, com HTTPS, WAF integrado e proteção contra DDoS via Shield.\n\n## 2. Como funciona",
                    },
                    {
                        type: "code",
                        value: '                         ┌────────────────┐\n                         │ ORIGEM         │\n                         │ (S3, ALB, EC2, │\n                         │ MediaStore,    │\n                         │ on-prem URL)   │\n                         └───────┬────────┘\n                                 │ origem é a "fonte da verdade"\n                                 ▼\n                       ┌─────────────────┐\n                       │ Regional Edge   │ ← camada intermediária maior\n                       │     Cache       │   (~13 globais)\n                       └────────┬────────┘\n                                │ cache miss sobe pra cá\n              ┌─────────────────┼─────────────────┐\n              ▼                 ▼                 ▼\n        ┌──────────┐      ┌──────────┐      ┌──────────┐\n        │   Edge   │      │   Edge   │      │   Edge   │ ← ~600 globais\n        │ São Paulo│      │  Tóquio  │      │ Londres  │   próximos de\n        └──────────┘      └──────────┘      └──────────┘   usuário final\n              ▲\n              │ usuário pede /index.html\n   ┌──────────────────────┐\n   │ Usuário final (BR)   │\n   └──────────────────────┘',
                    },
                    {
                        type: "text",
                        value: "**Fluxo de uma request:**\n1. O usuário pede `https://exemplo.com/foto.jpg`.\n2. O DNS aponta pro **Edge mais próximo** dele.\n3. O Edge tem o objeto em cache? Se **sim**, ele serve em ms (isso é um HIT).\n4. Se **não** (isso é um cache MISS), acontece o seguinte:\n   - A request sobe pro Regional Edge Cache. Tem cache lá?\n   - Se não, ela vai até a **origem** (S3 ou ALB), pega o objeto, **guarda em cache em toda a hierarquia** e serve.\n5. As próximas requests do mesmo objeto viram **HIT** no edge local.\n\n## 3. Origens suportadas",
                    },
                    {
                        type: "table",
                        value: '[["Origem","Caso de uso"],["**Amazon S3**","Site estático, mídia, assets - combinação mais comum"],["**Application Load Balancer**","Apps dinâmicos (EC2, Fargate por trás do ALB)"],["**EC2 (direto, por IP)**","Caso simples sem ALB"],["**MediaPackage / MediaStore**","Streaming de vídeo ao vivo"],["**HTTP server custom**","Qualquer URL HTTPS (on-prem, outro cloud)"],["**Lambda@Edge / CloudFront Functions**","Computação direto na edge (próxima seção)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Você pode ter múltiplas origens** num único distribution, com regras de roteamento por path. Por exemplo, `/api/*` vai pro ALB e `/static/*` vai pro S3.",
                    },
                    {
                        type: "text",
                        value: "## 4. Recursos importantes\n\n### TTL (Time To Live)\nO TTL (Time To Live, tempo de vida) define **por quanto tempo** o edge mantém um objeto em cache antes de revalidar com a origem.\n\nVocê pode configurar o TTL de duas formas: por **cache behavior** (por path) ou pelo header HTTP `Cache-Control` que vem da origem.\n\nTTLs típicos:\n- **Imagens, CSS e JS estáticos**: de 1 dia a 1 ano.\n- **HTML dinâmico**: de segundos a minutos.\n- **APIs**: zero (sem cache) ou poucos segundos.\n\n### Invalidations\nUma invalidation força o cache a expirar **antes do TTL**. Você usa isso, por exemplo, quando fez deploy de uma versão nova do site.\n\nEla é **cobrada** depois das primeiras 1000 paths por mês.\n\nUma alternativa mais barata é usar **versioning** nos paths, como `/v2/style.css`.\n\n### Cache Behaviors\nUm cache behavior é uma regra por **path pattern** (padrão de path), como `/api/*`, `/static/*` ou o `default`.\n\nCada behavior pode ter a sua própria configuração:\n- Uma origem diferente.\n- Um TTL próprio.\n- Os métodos HTTP permitidos.\n- Quais headers e cookies entram no cache key (a chave que identifica o objeto no cache).\n- Se aceita só HTTPS.\n\n### Geo Restriction\nServe pra bloquear o acesso a partir de países específicos, por questões de compliance ou de licença de conteúdo.\n\nVocê monta uma lista de **allow** (permitir) ou **deny** (negar) com os country codes (códigos de país).\n\n### Security (HTTPS, WAF, Shield)\n- **HTTPS** vem de um certificado do ACM (AWS Certificate Manager). É grátis e a renovação é automática.\n- **WAF** (Web Application Firewall, firewall de aplicação web) aplica regras contra SQL injection, XSS (Cross-Site Scripting) e bots.\n- **Shield Standard** protege contra DDoS (Distributed Denial of Service). É automático e gratuito.\n- **Shield Advanced** ($3000/mês) traz proteção avançada com SLA.\n\n### Origin Failover\nVocê define uma origem **primária** e uma **secundária**.\n\nSe a primária falhar (retornar um erro HTTP 5xx), o CloudFront tenta a secundária.\n\nIsso ajuda na alta disponibilidade da origem.\n\n### Signed URLs e Signed Cookies\nAs **URLs assinadas** têm data de expiração e servem pra controlar o acesso a conteúdo pago ou privado.\n\nUm caso de uso comum é vídeo só pra assinantes, ou um download temporário.\n\n## 5. Lambda@Edge e CloudFront Functions\n\nServem pra executar código **na borda** (no Edge Location), antes ou depois das requests:",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Onde roda","Uso típico"],["**CloudFront Functions**","Edge Locations","Manipulação **simples** de header/URL (rewrite, redirect)"],["","< 1 ms, alta escala","Validação de token JWT no header"],["**Lambda@Edge**","Regional Edge Caches","Lógica **complexa** (consulta DDB, integração com APIs)"],["","< 5s timeout","A/B testing, geo personalization"]]',
                    },
                    {
                        type: "quote",
                        value: "**CloudFront Functions é 100× mais barato** que Lambda@Edge pra coisas simples. Use ele primeiro.",
                    },
                    { type: "text", value: "## 6. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Data out (pra usuário)**","Por GB transferido pro internet (varia por região do edge)"],["**HTTP/HTTPS requests**","Por 10.000 requests"],["**Invalidations**","Grátis até 1000 paths/mês, depois $0.005/path"],["**Lambda@Edge / Functions**","Por invocação + duration"],["**Origin Shield (opcional)**","$0.01/10.000 requests (camada extra de cache)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Geralmente sai mais barato que servir tudo do S3 direto.** O motivo é que o tráfego CloudFront → user é mais barato que o tráfego S3 → user, e ainda por cima o cache alivia a contagem de requests na origem.",
                    },
                    {
                        type: "text",
                        value: "## 7. Casos de uso clássicos\n\n- **Site estático global** (S3 + CloudFront), que é o padrão moderno.\n- **App web dinâmico** (ALB + CloudFront pra cache parcial + WAF).\n- **Mídia e streaming de vídeo**, ao vivo (live) e sob demanda (VOD, ou Video on Demand).\n- **Download de software**, que alivia a origem e distribui globalmente.\n- **API caching**, com cache de response pra endpoints idempotentes.\n- **Frontend SPA** (Single Page Application, ou aplicação de página única), com React, Vue ou Angular hospedado em S3 + CloudFront.\n\n**NÃO é ideal pra:**\n- **Conteúdo altamente dinâmico** sem padrão de cache, quando cada request é única por usuário e não há reuso.\n- **Tráfego de saída pra apps fora da AWS** quando não há ganho de cache.\n\n## 8. CloudFront vs Global Accelerator (pegadinha clássica)",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**CloudFront**","**Global Accelerator**"],["Tipo","**CDN** (caching de conteúdo)","**Network optimizer** (rota TCP/UDP otimizada)"],["Protocolos","HTTP/HTTPS","**TCP/UDP** (qualquer protocolo)"],["Caching","**Sim** (essência do produto)","**Não** (só roteamento)"],["Camada OSI","L7 (HTTP)","L4 (TCP/UDP)"],["IP do usuário","DNS resolve pro Edge mais próximo","**IPs Anycast** globais (2 IPs fixos)"],["Caso de uso","Sites, mídia, web apps","Jogos, IoT, apps non-HTTP, failover global"]]',
                    },
                    {
                        type: "quote",
                        value: "**Regra simples:** se é **HTTP + cache**, use CloudFront. Se é **TCP/UDP sem cache, com rede otimizada**, use Global Accelerator.",
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"CDN da AWS"** → **CloudFront**.\n2. **"Reduzir latência pra usuários globais"** → **CloudFront**.\n3. **"Site estático em S3 com performance global"** → **S3 + CloudFront**.\n4. **"WAF integrado pra proteger site"** → **CloudFront + AWS WAF**.\n5. **"Bloquear acesso de certos países"** → **Geo Restriction** do CloudFront.\n6. **"Cache miss vai pra origem"** → verdade - sobe via Regional Edge Cache.\n7. **"Atualizar conteúdo cached imediatamente"** → **Invalidation** (cobra após 1000 paths).\n8. **"Computação na borda"** → **Lambda@Edge** ou **CloudFront Functions**.\n9. **"CloudFront vs Global Accelerator"** → CDN com cache vs rota otimizada sem cache.\n10. **"Conteúdo privado / signed URL"** → CloudFront suporta.\n11. **"DDoS protection grátis"** → **Shield Standard** (automático com CloudFront).\n12. **"HTTPS via certificado AWS gratuito"** → **ACM** (AWS Certificate Manager).\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'CloudFront = CDN da AWS\n              cacheia conteúdo em Edge Locations (~600 globais)\n              reduz latência + alivia origem\n\nOrigens suportadas:\n  S3, ALB, EC2, MediaPackage/MediaStore, HTTP custom\n\nRecursos chave:\n  TTL                 → quanto tempo objeto fica em cache\n  Invalidations       → forçar refresh antes do TTL (1000/mês grátis)\n  Cache Behaviors     → regras por path pattern\n  Geo Restriction     → bloquear países\n  HTTPS via ACM       → cert grátis com renovação automática\n  Origin Failover     → 2ª origem se 1ª falhar\n  Signed URLs/Cookies → conteúdo privado com expiração\n\nBorda computacional:\n  CloudFront Functions → simples, rápido, ms (<1ms), barato\n  Lambda@Edge         → complexo, Node/Python, até 5s\n\nPricing:\n  Data out + requests\n  Invalidations > 1000/mês cobradas\n\nCasos de uso:\n  Site estático global (S3 + CF)\n  Web app dinâmico (ALB + CF + WAF)\n  Streaming de vídeo\n  Download de software\n  API caching\n\nCloudFront vs Global Accelerator:\n  CloudFront        → HTTP, CACHE de conteúdo, latência via edge\n  Global Accelerator → TCP/UDP, rota otimizada, SEM cache\n\nAtalhos pra prova:\n  "CDN"                            → CloudFront\n  "site global com baixa latência" → CloudFront\n  "WAF/Shield protegendo site"     → CloudFront + WAF\n  "computar na borda"              → CloudFront Functions ou Lambda@Edge\n  "bloquear países"                → Geo Restriction\n  "TCP/UDP otimizado"              → Global Accelerator (NÃO CloudFront)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual serviço da AWS é a rede de entrega de conteúdo (CDN), que armazena cópias do conteúdo em cache em edge locations próximas dos usuários para reduzir a latência?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon CloudFront", isCorrect: true },
                            { text: "Amazon Route 53", isCorrect: false },
                            { text: "AWS Global Accelerator", isCorrect: false },
                            { text: "Elastic Load Balancing", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa vai lançar um jogo online multiplayer que usa TCP e UDP, precisa de roteamento de rede otimizado e não se beneficia de cache de conteúdo. Qual serviço atende melhor a esse cenário?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Global Accelerator", isCorrect: true },
                            { text: "Amazon CloudFront", isCorrect: false },
                            { text: "Amazon S3 Transfer Acceleration", isCorrect: false },
                            { text: "Amazon Route 53", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Além de reduzir a latência, qual é outro benefício de colocar o Amazon CloudFront na frente de uma origem como um bucket S3 ou um Load Balancer?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Serve o conteúdo a partir do cache nas edge locations, reduzindo o número de requisições que chegam à origem",
                                isCorrect: true,
                            },
                            {
                                text: "Aumenta as requisições na origem para manter todas as edge locations sempre atualizadas",
                                isCorrect: false,
                            },
                            {
                                text: "Elimina a necessidade de um banco de dados na aplicação",
                                isCorrect: false,
                            },
                            {
                                text: "Replica automaticamente o bucket S3 para todas as Regiões da AWS",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual serviço se integra ao Amazon CloudFront para proteger a aplicação contra ataques web comuns, como SQL injection e cross-site scripting (XSS)?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS WAF", isCorrect: true },
                            { text: "AWS Shield Standard", isCorrect: false },
                            { text: "Amazon GuardDuty", isCorrect: false },
                            { text: "AWS Certificate Manager (ACM)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa de streaming precisa impedir o acesso ao conteúdo a partir de determinados países por causa de licenciamento. Qual recurso do CloudFront atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Geo Restriction (restrição geográfica), com lista de países permitidos ou bloqueados",
                                isCorrect: true,
                            },
                            {
                                text: "Signed URLs (URLs assinadas) com data de expiração",
                                isCorrect: false,
                            },
                            {
                                text: "Origin Failover entre origem primária e secundária",
                                isCorrect: false,
                            },
                            {
                                text: "Invalidation para expirar o cache antes do TTL",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS Global Accelerator - Rede otimizada global",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO Global Accelerator usa a **rede backbone interna da AWS** pra rotear tráfego TCP/UDP de qualquer parte do mundo até o seu app, saindo da internet pública o mais cedo possível. O resultado é uma **latência menor e mais consistente**, **2 IPs Anycast estáticos** pros usuários se conectarem e **failover automático** entre regiões e endpoints. Ele funciona pra **qualquer protocolo**, não só HTTP.",
                    },
                    { type: "text", value: "## 1. O problema da internet pública" },
                    {
                        type: "code",
                        value: "   Usuário em São Paulo\n        │\n        │ pacotes saem pela internet pública\n        │ saltando entre ISPs aleatórios\n        │ latência variável (50-300ms para us-east-1)\n        │ rotas mudam conforme congestionamento\n        ▼\n   App em us-east-1",
                    },
                    {
                        type: "text",
                        value: "A internet pública funciona no modelo **best-effort** (melhor esforço): ninguém garante latência, jitter ou disponibilidade. Apps sensíveis a latência, como jogos, finance (finanças) e IoT (Internet of Things, internet das coisas), sofrem com isso.\n\n### Solução do Global Accelerator",
                    },
                    {
                        type: "code",
                        value: "   Usuário em São Paulo\n        │\n        │ DNS resolve pro IP Anycast da AWS\n        │ pacote entra na rede AWS no Edge mais próximo\n        ▼\n   Edge Location São Paulo\n        │\n        │ rede backbone AWS (fibra dedicada)\n        │ latência baixa e consistente\n        ▼\n   App em us-east-1",
                    },
                    {
                        type: "text",
                        value: "Ao sair da internet pública e entrar na **rede da AWS o mais cedo possível**, você ganha:\n- **Latência menor**, porque a rede da AWS é otimizada.\n- **Latência consistente**, sem a variação de rota da internet pública.\n- **Melhor throughput** (vazão de dados).\n\n## 2. Como funciona - 3 conceitos principais\n\n### 2.1 IPs Anycast estáticos\n- A AWS te dá **2 IPs Anycast** estáticos, que não mudam. Um é fornecido pela AWS e o outro pode ser seu.\n- No **Anycast**, o mesmo IP existe em **vários edges** ao mesmo tempo. O roteamento BGP (Border Gateway Protocol, o protocolo que define as rotas na internet) entrega o pacote ao edge mais próximo.\n- Um usuário em São Paulo tem o IP entregue no Edge de São Paulo. Um usuário em Tóquio tem o mesmo IP entregue no Edge de Tóquio.\n- Você não precisa configurar DNS por região: **um único IP serve o mundo inteiro**.\n\n### 2.2 Rede backbone AWS\n- Os pacotes trafegam pela **rede privada da AWS**, que usa fibra própria entre os Edges e as Regiões.\n- A latência e o jitter ficam muito menores do que na internet pública.\n\n### 2.3 Endpoints e Listeners\n- O **Listener** é a combinação de IP Anycast, porta e protocolo (TCP ou UDP).\n- O **Endpoint Group** é o grupo de targets dentro de uma região da AWS.\n- O **Endpoint** é o recurso final que recebe o tráfego: um ALB, NLB, EC2 ou Elastic IP.",
                    },
                    {
                        type: "code",
                        value: "   IP Anycast (1.2.3.4)\n        │\n        ├──▶ Endpoint Group us-east-1\n        │       ├──▶ ALB\n        │       └──▶ ALB (replicado)\n        │\n        └──▶ Endpoint Group eu-west-1\n                ├──▶ NLB\n                └──▶ EC2 (via Elastic IP)\n\n   Roteamento: por proximidade do usuário + health",
                    },
                    {
                        type: "text",
                        value: "## 3. Failover automático\n\nSe um endpoint ou uma região inteira ficar **unhealthy** (com problema):",
                    },
                    {
                        type: "code",
                        value: "   Cliente ──▶ IP Anycast ──▶ [us-east-1 com problema] ──FAIL\n                              │\n                              └──▶ [eu-west-1 saudável] ──OK",
                    },
                    {
                        type: "text",
                        value: "- A AWS detecta o estado unhealthy em **segundos**, através de um health check (checagem de saúde).\n- Ela reroteia automaticamente pro próximo endpoint healthy (saudável).\n- Isso acontece **sem mexer no DNS**, então o TTL do DNS não atrapalha.\n- O **RTO fica praticamente zero** no failover.",
                    },
                    {
                        type: "quote",
                        value: "**Comparação com o failover do Route 53:** o Route 53 usa DNS, então o TTL do DNS atrasa o failover (pode levar minutos). O Global Accelerator faz o failover no nível de IP, em segundos.",
                    },
                    {
                        type: "text",
                        value: "## 4. Casos de uso\n\n- **Jogos multiplayer online**, onde latência baixa e consistente é crucial.\n- **VoIP e videoconferência** (VoIP, ou Voice over IP, é voz sobre a internet), que são sensíveis a jitter.\n- **IoT** com milhões de devices conectados via TCP/UDP.\n- **APIs financeiras** com requisitos rígidos de latência.\n- **Apps que precisam de IP fixo**, por exemplo quando um firewall on-prem só permite um IP fixo.\n- **Failover multi-region rápido**, como alternativa ao DNS do Route 53.\n- **Migração on-prem para AWS** sem mexer no DNS dos clientes existentes.\n\n**NÃO é ideal pra:**\n- Conteúdo que dá pra **cachear** (nesse caso o CloudFront é mais barato e rápido).\n- Site web puramente HTTP onde o CloudFront já resolve tudo.\n\n## 5. Pricing",
                    },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Accelerator fixo**","**$0.025/hora** (~$18/mês) - taxa fixa, mesmo se 0 tráfego"],["**Data transfer**","Por GB transferido (varia por região)"]]',
                    },
                    {
                        type: "quote",
                        value: "É mais caro que o tráfego direto pela internet pública, mas você paga **pela qualidade**. O custo se justifica em apps onde a latência impacta a experiência do usuário ou a conversão.",
                    },
                    {
                        type: "text",
                        value: "## 6. Global Accelerator vs CloudFront (a comparação fundamental)",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**Global Accelerator**","**CloudFront**"],["Foco","**Roteamento otimizado** TCP/UDP","**Caching de conteúdo** HTTP"],["Protocolos","**TCP, UDP** (qualquer)","HTTP/HTTPS"],["Caching","**Não**","**Sim** - a essência do produto"],["Camada OSI","L4 (transporte)","L7 (application)"],["IPs entregues","**2 IPs Anycast estáticos**","DNS resolve pra edge regional"],["Caso de uso ideal","Jogos, IoT, VoIP, financial, IP fixo","Sites, mídia, web apps, downloads"],["Failover entre regiões","**Sim, em segundos** (sem DNS)","Sim, via origin failover (mas é por origem, não cross-region geral)"]]',
                    },
                    {
                        type: "quote",
                        value: '**Memorize:** se a questão fala em "**TCP/UDP, IP fixo, latência ultra-baixa**", a resposta é **Global Accelerator**. Se fala em "**HTTP, cache, CDN**", é **CloudFront**.',
                    },
                    { type: "text", value: "### Podem ser combinados!" },
                    {
                        type: "code",
                        value: "   Usuário ──▶ CloudFront (cache HTTP) ──▶ Global Accelerator ──▶ ALB ──▶ EC2",
                    },
                    {
                        type: "text",
                        value: '- O CloudFront cacheia as respostas HTTP.\n- O Global Accelerator otimiza o caminho até a origem quando a request precisa ir até lá.\n- Os dois funcionam muito bem juntos pra sites dinâmicos globais.\n\n## 7. Pegadinhas comuns da prova\n\n1. **"Latência baixa pra TCP/UDP globalmente"** → **Global Accelerator**.\n2. **"Jogo multiplayer com baixa latência mundial"** → **Global Accelerator** (CloudFront não dá conta - não é HTTP).\n3. **"2 IPs estáticos pra clientes se conectarem ao app"** → **Global Accelerator**.\n4. **"Cliente exige IP fixo (firewall on-prem só permite IP X)"** → **Global Accelerator**.\n5. **"Failover entre regiões em segundos sem mexer no DNS"** → **Global Accelerator**.\n6. **"Site estático com cache global"** → **CloudFront** (não Global Accelerator).\n7. **"CDN da AWS"** → **CloudFront** (Global Accelerator NÃO é CDN).\n8. **"Cobra mesmo sem tráfego?"** → **Sim** - taxa fixa de ~$18/mês por accelerator.\n9. **"Pode ter targets em várias regiões?"** → **Sim**, com endpoint groups por região.\n10. **"Pode rotear pra ALB, NLB, EC2?"** → **Sim** - qualquer um.\n\n## 8. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Global Accelerator = rede backbone AWS otimizada\n                     TCP/UDP, qualquer protocolo\n                     2 IPs Anycast estáticos\n                     SEM caching (não é CDN)\n\nComo funciona:\n  1. AWS te dá 2 IPs Anycast estáticos\n  2. Usuário envia request → entra na rede AWS no Edge mais próximo\n  3. Pacote viaja pela backbone AWS até região do app\n  4. Latência baixa, consistente, menor jitter\n\nComponentes:\n  Listener        → IP Anycast + porta + protocolo\n  Endpoint Group  → grupo de targets numa região\n  Endpoint        → ALB, NLB, EC2, Elastic IP\n\nFailover:\n  Health check detecta problema em segundos\n  Reroteia pro próximo endpoint healthy\n  Sem dependência de DNS TTL (vs Route 53)\n\nCasos de uso:\n  Jogos multiplayer\n  VoIP / videoconferência\n  IoT TCP/UDP em massa\n  APIs financeiras\n  Apps que exigem IP fixo (firewall on-prem)\n  Failover multi-region rápido\n  Migração on-prem → AWS sem mexer no DNS\n\nPricing:\n  $0.025/hora ($18/mês fixo) por accelerator\n  + data transfer por GB\n\nGlobal Accelerator vs CloudFront:\n  Global Accelerator → TCP/UDP, SEM cache, IPs Anycast, rota otimizada\n  CloudFront         → HTTP, COM cache, edge regional, CDN\n\nCombinados:\n  Cliente → CloudFront (cache) → GA (otimiza caminho até origem) → ALB → EC2\n\nAtalhos pra prova:\n  "TCP/UDP global low latency"       → Global Accelerator\n  "jogo multiplayer / VoIP / IoT"    → Global Accelerator\n  "2 IPs estáticos pro mundo"        → Global Accelerator\n  "failover multi-region em segundos"→ Global Accelerator\n  "site estático global / cache"     → CloudFront (NÃO Global Accelerator)\n  "IP fixo pro firewall on-prem"     → Global Accelerator',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O AWS Global Accelerator melhora a latência de aplicações globais principalmente por qual motivo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele coloca o tráfego na rede backbone privada da AWS já no edge mais próximo do usuário, saindo da internet pública o mais cedo possível.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele armazena em cache as respostas da aplicação nas edge locations mais próximas do usuário.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele comprime os pacotes para reduzir o volume de dados trafegado pela internet pública.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele aumenta o TTL do DNS para diminuir o número de resoluções de nome.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao criar um accelerator no AWS Global Accelerator, o que a AWS fornece para os clientes se conectarem à aplicação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Dois endereços IP Anycast estáticos que atendem usuários do mundo inteiro, sem precisar configurar DNS por região.",
                                isCorrect: true,
                            },
                            {
                                text: "Um endereço IP público dinâmico diferente para cada região onde existem endpoints.",
                                isCorrect: false,
                            },
                            {
                                text: "Um nome DNS que precisa ser recriado toda vez que um endpoint muda de região.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma faixa de IPs privados alocada dentro da VPC da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação hospedada em várias regiões precisa que, quando a região principal ficar indisponível, o tráfego seja redirecionado para outra região em segundos. Qual vantagem o Global Accelerator tem sobre o failover baseado em DNS do Route 53?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O failover acontece no nível do IP Anycast em segundos, sem depender da expiração do TTL do DNS.",
                                isCorrect: true,
                            },
                            {
                                text: "O failover só ocorre depois que todos os resolvers DNS atualizarem o registro, o que garante mais consistência.",
                                isCorrect: false,
                            },
                            {
                                text: "O Global Accelerator replica automaticamente os dados da aplicação para a região de destino antes do failover.",
                                isCorrect: false,
                            },
                            {
                                text: "O Global Accelerator troca o IP Anycast por um novo IP durante o failover, forçando os clientes a reconectarem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa vai lançar um jogo multiplayer online que troca dados via UDP e exige latência baixa e consistente para jogadores no mundo todo. Qual serviço é o mais adequado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS Global Accelerator, porque otimiza o roteamento de tráfego TCP/UDP pela rede da AWS.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon CloudFront, porque faz cache do tráfego do jogo nas edge locations.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Route 53 com roteamento baseado em latência, porque encaminha cada jogador para a região de menor latência apenas via DNS.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Direct Connect, porque cria um link dedicado entre os jogadores e a AWS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a cobrança do AWS Global Accelerator, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Há uma taxa fixa por hora para cada accelerator, cobrada mesmo sem tráfego, somada ao custo de transferência de dados por GB.",
                                isCorrect: true,
                            },
                            {
                                text: "A cobrança é feita apenas por requisição HTTP processada pelo accelerator.",
                                isCorrect: false,
                            },
                            {
                                text: "O accelerator é gratuito enquanto não houver tráfego passando por ele.",
                                isCorrect: false,
                            },
                            {
                                text: "A cobrança depende somente da quantidade de IPs Anycast alocados.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Como Interagir com a AWS - Console, CLI, SDK, IaC",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA AWS oferece **4 formas principais** de gerenciar recursos. O **Console Web** roda no browser e serve pra exploração. A **AWS CLI** (Command Line Interface, interface de linha de comando) roda no terminal e serve pra scripts. Os **SDKs** (Software Development Kits) chamam a AWS de dentro de linguagens de programação. E o **Infrastructure as Code** (IaC), com CloudFormation, CDK e Terraform, faz automação reprodutível. Cada forma tem o seu lugar, e profissionais **combinam todas**.",
                    },
                    { type: "text", value: "## 1. As 4 formas de interagir" },
                    {
                        type: "code",
                        value: "                       ┌──────────────────────┐\n                       │  APIs da AWS         │\n                       │  (HTTP/HTTPS, JSON)  │  ← Tudo conversa com isso\n                       └──────────┬───────────┘\n                                  │\n       ┌──────────────────────────┼──────────────────────────┐\n       │                          │                          │\n       ▼                          ▼                          ▼\n   AWS Console              AWS CLI              AWS SDKs            CloudFormation\n   (Web browser)            (Terminal)           (Python, Node,      (Infrastructure\n                                                  Java, Go, .NET,     as Code)\n                                                  Ruby, PHP, etc.)\n       │                          │                          │\n       ▼                          ▼                          ▼\n   GUI: clica, vê,          CLI: scripts,        Aplicação chama        IaC: declara\n   explora, faz pra         automação shell,     APIs AWS de dentro     infra em YAML/\n   poucos cliques           CI/CD, ad-hoc        do código              JSON/HCL",
                    },
                    {
                        type: "quote",
                        value: "**Todas conversam com a mesma API HTTP por baixo.** O Console é só uma UI bonita por cima dessas APIs.",
                    },
                    { type: "text", value: "## 2. AWS Management Console (Web)" },
                    {
                        type: "quote",
                        value: "É a interface gráfica (GUI, Graphical User Interface) acessada pelo browser em `https://console.aws.amazon.com`.",
                    },
                    {
                        type: "text",
                        value: '### Quando usar\n- **Exploração**: descobrir serviços e ver dashboards.\n- **Setup inicial**: primeira conta, IAM (Identity and Access Management, gestão de identidade e acesso) e billing.\n- **Tarefas pontuais**: criar 1 EC2 só pra testar algo.\n- **Investigar** problemas, como olhar logs no CloudWatch e ver métricas.\n\n### Limitações\n- **Não é reprodutível**: clicar é uma ação manual e não fica documentada.\n- **Não escala**: criar 100 EC2 na mão é inviável.\n- **Erros humanos**: é fácil esquecer um checkbox crítico.\n- **Não versionável**: não dá pra ter um "histórico de mudanças" no Git.',
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** o Console é pra **aprender e investigar**. Pra **provisionar**, use IaC.",
                    },
                    {
                        type: "text",
                        value: "### Recursos extras\n- **AWS Console Mobile App**: apps pra Android e iOS, com uso limitado, tipo ver dashboards e parar instâncias.\n- **Switch Role**: alternar entre contas e roles dentro do Console.\n- **AWS Organizations**: gerenciar múltiplas contas.\n\n## 3. AWS CLI (Command Line Interface)",
                    },
                    {
                        type: "quote",
                        value: "É a ferramenta de **linha de comando** que chama as APIs da AWS direto do terminal.",
                    },
                    { type: "text", value: "### Instalação típica" },
                    {
                        type: "code",
                        value: '# Linux/macOS\ncurl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"\nunzip awscliv2.zip && sudo ./aws/install\n\n# Verificar\naws --version\n# aws-cli/2.x.x Python/3.x.x Linux/x.x.x',
                    },
                    { type: "text", value: "### Configuração" },
                    {
                        type: "code",
                        value: "aws configure\n# AWS Access Key ID: AKIA...\n# AWS Secret Access Key: ...\n# Default region: us-east-1\n# Default output format: json",
                    },
                    {
                        type: "text",
                        value: "(As credenciais ficam em `~/.aws/credentials` e `~/.aws/config`.)\n\n### Exemplos típicos",
                    },
                    {
                        type: "code",
                        value: '# Listar buckets S3\naws s3 ls\n\n# Subir arquivo pro S3\naws s3 cp ./report.pdf s3://meu-bucket/\n\n# Listar instâncias EC2\naws ec2 describe-instances --query "Reservations[].Instances[].InstanceId"\n\n# Criar bucket S3\naws s3api create-bucket --bucket meu-novo-bucket --region us-east-1\n\n# Disparar Lambda\naws lambda invoke --function-name minha-funcao response.json',
                    },
                    {
                        type: "text",
                        value: '### Quando usar CLI\n- **Scripts shell** de automação.\n- **CI/CD pipelines** (Continuous Integration / Continuous Delivery, ou seja, build e deploy automatizados).\n- **Operações em lote**, tipo "apaga todos os buckets que casam com X".\n- **Investigação rápida** sem precisar abrir o browser.\n- Quando você está **por SSH** (Secure Shell) **em um servidor remoto** sem GUI disponível.\n\n### CloudShell\n- É um **terminal da AWS dentro do browser**, sem precisar instalar nada.\n- Já vem com a CLI, Python, Node.js, jq e outras ferramentas.\n- É útil em ambientes restritos onde você não pode instalar a CLI local.\n\n## 4. AWS SDKs (Software Development Kits)',
                    },
                    {
                        type: "quote",
                        value: "São bibliotecas em **linguagens de programação** pra chamar as APIs da AWS de dentro do seu código.",
                    },
                    {
                        type: "text",
                        value: "### Linguagens suportadas\n- **JavaScript / Node.js** (`aws-sdk`)\n- **Python** (`boto3`)\n- **Java** (`aws-sdk-java`)\n- **Go** (`aws-sdk-go`)\n- **C# / .NET** (`AWSSDK.*`)\n- **Ruby** (`aws-sdk-ruby`)\n- **PHP**, **Rust**, **C++** e mais\n\n### Exemplo (Python / boto3)",
                    },
                    {
                        type: "code",
                        value: "import boto3\n\ns3 = boto3.client('s3')\n\n# Listar buckets\nresponse = s3.list_buckets()\nfor bucket in response['Buckets']:\n    print(bucket['Name'])\n\n# Upload de arquivo\ns3.upload_file('local.pdf', 'meu-bucket', 'remote.pdf')\n\n# Invoke Lambda\nlambda_client = boto3.client('lambda')\nresult = lambda_client.invoke(\n    FunctionName='processa-pedido',\n    Payload=b'{\"pedido_id\": \"123\"}'\n)",
                    },
                    {
                        type: "text",
                        value: "### Quando usar SDK\n- No **backend da sua aplicação** chamando a AWS, por exemplo um Lambda processando um upload no S3.\n- Em um **app mobile** falando com a AWS (Cognito, AppSync).\n- Em **automação avançada** que precisa de lógica condicional complexa.\n- Em **integração custom** entre serviços da AWS.",
                    },
                    {
                        type: "quote",
                        value: '**A CLI e o SDK são iguais por baixo:** usam as mesmas APIs HTTP. O SDK é a "CLI na linguagem que você prefere".',
                    },
                    { type: "text", value: "## 5. Infrastructure as Code (IaC)" },
                    {
                        type: "quote",
                        value: "É declarar a infraestrutura em **arquivos versionáveis**, em vez de clicar no console.",
                    },
                    {
                        type: "text",
                        value: "### AWS CloudFormation\n\nÉ o serviço **nativo da AWS** pra IaC. Você escreve um template **YAML ou JSON** descrevendo os recursos, e a AWS provisiona tudo.",
                    },
                    {
                        type: "code",
                        value: "AWSTemplateFormatVersion: '2010-09-09'\nDescription: VPC + EC2\n\nResources:\n  MyVPC:\n    Type: AWS::EC2::VPC\n    Properties:\n      CidrBlock: 10.0.0.0/16\n\n  MyInstance:\n    Type: AWS::EC2::Instance\n    Properties:\n      InstanceType: t3.micro\n      ImageId: ami-0abcdef1234567890\n      SubnetId: !Ref MySubnet",
                    },
                    {
                        type: "code",
                        value: "# Deploy\naws cloudformation deploy \\\n    --template-file infra.yaml \\\n    --stack-name minha-infra",
                    },
                    {
                        type: "text",
                        value: "**Benefícios:**\n- **Versionado em Git**, então você tem histórico de mudanças.\n- **Reprodutível**: o mesmo template gera a mesma infra em outra conta ou região.\n- **Rollback automático**: se falhar no meio, o CloudFormation desfaz o que criou.\n- **Drift detection**: detecta se alguém mexeu na infra manualmente.\n- **Sem custo extra**: você paga só os recursos criados.\n\n### AWS CDK (Cloud Development Kit)\n\nVocê escreve a infra em **linguagens de programação** (TypeScript, Python, Java, .NET, Go), e o CDK **gera CloudFormation por baixo**.",
                    },
                    {
                        type: "code",
                        value: "import * as ec2 from 'aws-cdk-lib/aws-ec2';\n\nconst vpc = new ec2.Vpc(this, 'MyVPC', { maxAzs: 2 });\nconst instance = new ec2.Instance(this, 'WebServer', {\n  vpc,\n  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),\n  machineImage: ec2.MachineImage.latestAmazonLinux2()\n});",
                    },
                    {
                        type: "text",
                        value: "**Vantagens sobre o CloudFormation puro:**\n- **Linguagem real**, com loops, if e funções.\n- **Type-safety**: a IDE detecta erros.\n- **Higher-level constructs**: `Vpc()` cria a VPC (Virtual Private Cloud, nuvem privada virtual) junto com subnets, route tables e NAT em 1 linha, em vez de 20.\n\n### Terraform (HashiCorp)\n\nÉ **open source e multi-cloud**: funciona com AWS, Azure, GCP e outros.",
                    },
                    {
                        type: "code",
                        value: 'provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0abcdef1234567890"\n  instance_type = "t3.micro"\n}',
                    },
                    {
                        type: "text",
                        value: "**Vantagens:**\n- **Multi-cloud**: a mesma ferramenta serve pra AWS, GCP e Azure.\n- **HCL** (HashiCorp Configuration Language), que é mais simples que YAML/JSON.\n- **Comunidade grande** e ecossistema vasto.\n\n### IaC vs Console - comparação",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**Console (clicar)**","**IaC (CloudFormation/CDK/Terraform)**"],["Reprodutível","Não","**Sim**"],["Versionável em Git","Não","**Sim**"],["Tempo pra criar 1 recurso","Rápido (poucos cliques)","Mais lento (precisa template)"],["Tempo pra criar 100 recursos","Insano","**Mesma coisa** (template loop)"],["Rollback","Manual","**Automático**"],["Aprendizado","Baixo","Médio-alto"],["Boa pra","Exploração","**Produção**"]]',
                    },
                    { type: "text", value: "## 6. Resumo - qual usar quando" },
                    {
                        type: "table",
                        value: '[["Cenário","Ferramenta"],["Aprender / explorar AWS","**Console**"],["Criar **1 recurso temporário** pra testar","Console ou CLI"],["Script shell de automação","**CLI**"],["Backend de app falando com AWS","**SDK**"],["Provisionar infra reprodutível e versionada","**IaC** (CloudFormation/CDK/Terraform)"],["Multi-cloud (AWS + GCP + Azure)","**Terraform**"],["Quer linguagem real pra escrever IaC AWS","**AWS CDK**"],["Terminal AWS direto do browser, sem instalar nada","**CloudShell**"]]',
                    },
                    {
                        type: "text",
                        value: '## 7. Pegadinhas comuns da prova\n\n1. **"Qual é a ferramenta IaC nativa da AWS?"** → **CloudFormation**.\n2. **"IaC com linguagem de programação?"** → **AWS CDK**.\n3. **"IaC multi-cloud?"** → **Terraform**.\n4. **"Console é boa pra produção em escala?"** → **Não** - usa IaC.\n5. **"AWS CLI é grátis?"** → **Sim** (a ferramenta é grátis; você paga só pelos recursos AWS).\n6. **"Como rodar AWS CLI sem instalar localmente?"** → **CloudShell** (browser).\n7. **"Linguagem da SDK Python da AWS"** → **boto3**.\n8. **"Onde ficam as credenciais da CLI no Linux?"** → `~/.aws/credentials` e `~/.aws/config`.\n9. **"CloudFormation cobra extra?"** → **Não** - só os recursos provisionados.\n10. **"CDK gera o que por baixo?"** → **CloudFormation**.\n11. **"Drift detection"** → CloudFormation detecta quando alguém mexe na infra fora do template.\n12. **"Console suporta tarefas em lote massivas?"** → **Mal**. Use CLI ou IaC.\n\n## 8. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '4 formas de interagir com a AWS:\n\n1. CONSOLE (Web)\n   - GUI, exploração, setup inicial, investigação\n   - NÃO é reprodutível, não versionável\n\n2. CLI (Terminal)\n   - Scripts shell, automação, CI/CD\n   - aws s3 ls, aws ec2 describe-instances, etc.\n   - CloudShell = CLI no browser, zero instalação\n\n3. SDK (Linguagens)\n   - Backend da app chamando AWS\n   - boto3 (Python), aws-sdk (Node), AWSSDK.* (.NET), etc.\n\n4. INFRASTRUCTURE AS CODE\n   - CloudFormation → nativo AWS, YAML/JSON\n   - CDK            → CloudFormation com linguagem real\n   - Terraform      → multi-cloud, HCL\n\nIaC vs Console:\n   Console → clica, exploração, NÃO reprodutível\n   IaC     → declarativo, versionável em Git, rollback automático\n             SEM CUSTO EXTRA (só paga recursos provisionados)\n\nPra prova:\n   "IaC nativo AWS"                  → CloudFormation\n   "IaC com linguagem real"          → CDK\n   "IaC multi-cloud"                 → Terraform\n   "terminal AWS no browser"         → CloudShell\n   "API HTTP/JSON por baixo"         → todas as ferramentas usam\n   "Console é pra produção?"         → NÃO (use IaC)\n   "drift detection"                 → CloudFormation\n   "boto3 é o quê?"                  → SDK Python da AWS',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual das alternativas descreve corretamente a AWS CLI (Command Line Interface)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma ferramenta de linha de comando que chama as APIs da AWS pelo terminal, indicada para scripts de automação e pipelines de CI/CD.",
                                isCorrect: true,
                            },
                            {
                                text: "A interface gráfica acessada pelo navegador, usada para explorar serviços e visualizar dashboards.",
                                isCorrect: false,
                            },
                            {
                                text: "O serviço nativo de Infrastructure as Code que provisiona recursos a partir de templates YAML ou JSON.",
                                isCorrect: false,
                            },
                            {
                                text: "Um aplicativo para Android e iOS, com funcionalidades limitadas como ver dashboards e parar instâncias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual serviço é a opção nativa da AWS para Infrastructure as Code, na qual você descreve os recursos em um template YAML ou JSON e a AWS provisiona tudo?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS CloudFormation", isCorrect: true },
                            { text: "Terraform", isCorrect: false },
                            { text: "AWS CDK (Cloud Development Kit)", isCorrect: false },
                            { text: "AWS CLI", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma pessoa que está começando na AWS quer criar e gerenciar recursos de forma visual, apontando e clicando na tela, sem instalar nada no computador nem escrever código. Qual forma de interação atende melhor essa necessidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS Management Console, a interface gráfica acessada pelo navegador.",
                                isCorrect: true,
                            },
                            {
                                text: "AWS CLI, executando comandos em um terminal.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS SDK, adicionando a biblioteca ao código da aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS CloudFormation, escrevendo templates em YAML ou JSON.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você está em uma máquina restrita e não consegue instalar a AWS CLI localmente. Qual recurso oferece um terminal da AWS dentro do próprio browser, já com a CLI, Python e jq pré-instalados?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS CloudShell", isCorrect: true },
                            { text: "AWS Management Console", isCorrect: false },
                            { text: "AWS Console Mobile App", isCorrect: false },
                            { text: "AWS CDK (Cloud Development Kit)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O backend de uma aplicação escrita em Python precisa chamar as APIs da AWS de dentro do próprio código, por exemplo para enviar arquivos ao Amazon S3. Qual é a abordagem e a biblioteca corretas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar o AWS SDK para Python, a biblioteca boto3.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar o AWS SDK para Python, a biblioteca aws-sdk.",
                                isCorrect: false,
                            },
                            {
                                text: "Abrir o AWS Management Console e enviar os arquivos manualmente a cada requisição.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrever um template do AWS CloudFormation para cada arquivo a ser enviado.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Computação",
        aulas: [
            {
                titulo: "Amazon EC2 - Visão Geral",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\n**EC2 (Elastic Compute Cloud)** é o serviço que entrega **servidores virtuais**, chamados de **instâncias**, sob demanda. Você escolhe o sistema operacional, o tipo da máquina, a rede e o disco. A AWS provisiona tudo em **minutos** e cobra **pelo tempo de uso**. É a base de toda a computação tradicional na AWS: quase todo serviço gerenciado (como RDS, ElastiCache e EKS) roda em cima de EC2 por baixo dos panos.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é EC2\n\nUm servidor virtual é uma **VM (máquina virtual) rodando dentro de um host físico** da AWS. Como cliente, você não toca no hardware. Você só enxerga quatro coisas:\n\n- Um **endereço IP** (público e/ou privado) para se conectar à máquina.\n- Um **disco** anexado, chamado de EBS (Elastic Block Store).\n- Uma **interface de rede**, chamada de ENI (Elastic Network Interface), que já vem com um firewall (o security group).\n- O **sistema operacional (SO)** que você escolheu, seja Linux, Windows ou macOS.\n\nTudo o que fica abaixo disso é responsabilidade da AWS. Ela cuida do hardware físico, do hipervisor (o software que cria e isola as máquinas virtuais), do datacenter com energia e refrigeração, e dos patches do próprio hipervisor.",
                    },
                    {
                        type: "quote",
                        value: "**Modelo de cobrança**: você **paga só pelo tempo em que a instância está rodando** (mínimo de 1 segundo no Linux, 1 hora no Windows). Se der Stop, você não paga o compute e paga apenas o disco EBS. Se der Terminate, você não paga nada.",
                    },
                    {
                        type: "text",
                        value: "## 2. Fluxo de criação de uma instância\n\nCriar uma instância segue sempre a mesma sequência. Do começo ao fim, é assim:",
                    },
                    {
                        type: "code",
                        value: "1. Escolher AMI (Amazon Machine Image)\n   ▼\n2. Escolher tipo de instância (t3.medium, m5.xlarge, ...)\n   ▼\n3. Definir networking (VPC, subnet, IP público?)\n   ▼\n4. Configurar security group (firewall - portas abertas)\n   ▼\n5. Criar/escolher key pair (SSH para acessar)\n   ▼\n6. Anexar storage (volumes EBS)\n   ▼\n7. (opcional) User Data - script que roda no boot\n   ▼\n8. Launch → AWS provisiona em ~1 min",
                    },
                    {
                        type: "text",
                        value: "## 3. Estados do ciclo de vida (cai na prova!)\n\nToda instância passa por uma sequência bem definida de estados, desde a criação até o desligamento definitivo. O diagrama abaixo mostra esse caminho:",
                    },
                    {
                        type: "code",
                        value: "              ┌───────┐\n              │PENDING│ (criando, primeiro boot)\n              └───┬───┘\n                  ▼\n              ┌────────┐\n   ┌─────────▶│RUNNING │ ◀──────────┐\n   │          └────┬───┘            │\n   │               │                 │\n   │       stop    │     start       │\n   │               ▼                 │\n   │          ┌────────┐             │\n   │          │STOPPING│             │\n   │          └────┬───┘             │\n   │               ▼                 │\n   │          ┌────────┐             │\n   │          │STOPPED │ ────────────┘\n   │          └────┬───┘\n   │               │ terminate\n   │               ▼\n   │          ┌─────────────┐\n   │          │SHUTTING-DOWN│\n   │          └─────┬───────┘\n   │                ▼\n   │          ┌────────────┐\n   └──────────│ TERMINATED │  (não pode mais ligar)\n              └────────────┘",
                    },
                    { type: "text", value: "### Stop vs Terminate (a pegadinha clássica!)" },
                    {
                        type: "table",
                        value: '[["Ação","Compute","Disco EBS (root)","IP público","Reversível?"],["**Stop**","desliga, **não paga**","**mantém** (paga GB-mês)","perde (a menos que seja Elastic IP)","**Sim** - start novamente"],["**Terminate**","desliga, **não paga**","**apaga** (default)","perde","**Não** - instância sumiu"],["**Hibernate**","desliga, **não paga**, salva RAM no EBS","mantém","perde","Sim - reinicia mais rápido (RAM restaurada)"],["**Reboot**","reinicia, **paga normal**","mantém","mantém","n/a"]]',
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "Como dar uma pausa na instância **sem perder o disco**?" → **Stop**. "Como **apagar definitivamente**?" → **Terminate**.',
                    },
                    {
                        type: "quote",
                        value: "**Reboot ≠ Stop+Start.** O Reboot mantém **tudo**, até o IP público. Já o Stop+Start pode mover a instância para outro host físico e, com isso, perder o IP público.",
                    },
                    {
                        type: "text",
                        value: "## 4. AMI - Amazon Machine Image\n\nPense na **AMI (Amazon Machine Image) como a receita usada para criar uma instância**. É a partir dela que a AWS monta a máquina. Uma AMI contém:\n\n- O **sistema operacional** (Ubuntu, Amazon Linux, Windows Server, RHEL, macOS, etc.).\n- As **aplicações pré-instaladas**, quando houver.\n- As **configurações de boot**.\n- Os **snapshots de EBS** que serão usados como volume raiz (root volume).\n\n### Tipos de AMI",
                    },
                    {
                        type: "table",
                        value: '[["Origem","Descrição"],["**AWS-provided**","Amazon Linux, Ubuntu, Windows oficiais"],["**AWS Marketplace**","Vendors (paid AMIs com produtos pré-configurados)"],["**Community AMI**","Públicas, mantidas por terceiros"],["**Custom AMI**","Você cria a partir de uma instância sua (pra clonar configs)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Caso de uso de AMI custom:** você configura uma EC2 com tudo pronto (dependências, código e configurações), gera uma AMI a partir dela e depois lança 100 EC2 idênticas usando essa imagem. Essa é a base do padrão **Golden Image**.",
                    },
                    {
                        type: "text",
                        value: '## 5. Security Groups (o firewall da EC2)\n\nO **security group (SG)** é o firewall que fica na frente da sua instância. Vale entender quatro pontos sobre ele:\n\n- Ele é **stateful**: se você permite uma conexão de entrada, a resposta de saída é liberada automaticamente.\n- Ele **só aceita regras de "allow"** (liberar). Não existe regra de "deny" (bloquear) aqui. Quando você precisa de "deny", usa a Network ACL, que fica na subnet.\n- Por padrão, ele **bloqueia tudo que entra e permite tudo que sai**.\n- Ele é aplicado **por instância**, e uma EC2 pode ter até 5 SGs ao mesmo tempo.\n\nExemplo típico de configuração:',
                    },
                    {
                        type: "code",
                        value: "Inbound:\n  - SSH (22)    de 0.0.0.0/0       inseguro - use IP específico\n  - HTTP (80)   de 0.0.0.0/0\n  - HTTPS (443) de 0.0.0.0/0\n\nOutbound:\n  - Tudo permitido (default)",
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** nunca abra o SSH (porta 22) para o mundo inteiro. Restrinja por IP específico, ou use o **AWS Systems Manager Session Manager**, que dá acesso sem precisar de porta SSH aberta.",
                    },
                    {
                        type: "text",
                        value: "## 6. Key Pairs (chaves SSH)\n\nO key pair é o par de chaves que autentica seu acesso via SSH. Funciona assim:\n\n- Você gera o par no console (ou importa um seu). A AWS guarda a **chave pública**.\n- Você faz o download da **chave privada (arquivo .pem)**. Essa é a **única chance** de baixá-la.\n- Para conectar, você usa: `ssh -i minha-chave.pem ec2-user@<ip-publico>`.\n- Sem a chave privada, **não há como entrar** na máquina, a não ser que você use o Session Manager via IAM.",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "Perdi minha chave privada, e agora?" A chave não pode ser recuperada. As saídas são **criar uma nova AMI** da instância (com nova senha ou chave) ou usar o **Session Manager**, que não depende de SSH.',
                    },
                    {
                        type: "text",
                        value: "## 7. User Data - script que roda no primeiro boot\n\nO User Data é um script que **executa automaticamente** quando a instância liga pela primeira vez. Ele roda como root, sem nenhuma interação sua.\n\nExemplo em Bash, no Amazon Linux:",
                    },
                    {
                        type: "code",
                        value: '#!/bin/bash\nyum update -y\nyum install -y httpd\nsystemctl start httpd\necho "<h1>Hello from $(hostname)</h1>" > /var/www/html/index.html',
                    },
                    {
                        type: "quote",
                        value: "**Casos de uso:** instalar pacotes, baixar código, configurar serviços ou registrar a instância em um cluster. A ideia central é **automação na primeira inicialização**.",
                    },
                    {
                        type: "text",
                        value: "## 8. Instance Metadata Service (IMDS)\n\nCada EC2 consegue consultar **os próprios metadados** através de um endpoint local, no endereço `http://169.254.169.254/latest/meta-data/`. IMDS é a sigla de Instance Metadata Service.",
                    },
                    {
                        type: "code",
                        value: "# de dentro da instância:\ncurl http://169.254.169.254/latest/meta-data/instance-id\n# → i-1234567890abcdef0\n\ncurl http://169.254.169.254/latest/meta-data/public-ipv4\n# → 54.123.45.67",
                    },
                    {
                        type: "text",
                        value: "SDKs e scripts usam esse endpoint para descobrir o contexto da instância (em qual região ela está, qual AZ, qual IAM role tem, e assim por diante) sem precisar deixar nada fixo no código (hardcoded).",
                    },
                    {
                        type: "quote",
                        value: "**IMDSv2** é a versão atual e mais segura, porque exige um token para responder. Prefira sempre a v2.",
                    },
                    { type: "text", value: "## 9. Formas de acessar uma instância" },
                    {
                        type: "table",
                        value: '[["Método","Quando usar"],["**SSH** com chave .pem (Linux)","Tradicional, requer porta 22 aberta"],["**RDP** (Windows)","Tradicional, requer porta 3389 aberta"],["**EC2 Instance Connect**","SSH no browser, usa IAM em vez de gerenciar chaves"],["**Session Manager** (Systems Mgr)","**Sem porta aberta**, sem chave, audit via CloudTrail. Recomendado para produção."],["**Serial Console**","Pra debugar boot quebrado (sem rede)"]]',
                    },
                    {
                        type: "quote",
                        value: "**O Session Manager é o caminho moderno.** Ele entrega segurança máxima (sem SSH exposto), registra tudo em log de auditoria e faz a autenticação via IAM.",
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"Pago pela EC2 quando ela está stopped?"** → **Não pelo compute**. Você continua pagando o **disco EBS** que segue anexado.\n2. **"Stop vs Terminate"** → Stop mantém o disco e é reversível. Terminate apaga o disco e é irreversível.\n3. **"Reboot perde dados/IP?"** → **Não**. É só um "desliga e liga", mantém tudo.\n4. **"Como dar boot e já rodar comandos automaticamente?"** → **User Data**, que executa no primeiro boot.\n5. **"Como acessar EC2 sem abrir porta SSH?"** → **Session Manager** (do Systems Manager).\n6. **"O que é uma AMI?"** → A receita/imagem usada para criar instâncias, que inclui SO, apps e o snapshot do disco root.\n7. **"Como saber metadados da instância de dentro dela?"** → O IMDS, no endereço `169.254.169.254`.\n8. **"Security Group é stateful ou stateless?"** → **Stateful**, porque permite a resposta automaticamente.\n9. **"Posso ter Deny em Security Group?"** → **Não**. Só Allow. Para Deny, use a **Network ACL** (fica na subnet e é stateless).\n10. **"Perdi a key pair, o que faço?"** → Não há como recuperar. Crie uma nova AMI da instância ou use o Session Manager.\n11. **"Modelo de cobrança"** → por hora ou por segundo (no Linux). Stop paga só o disco. Terminate não paga nada.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: "EC2 = servidor virtual sob demanda\n       paga pelo tempo de uso (segundo no Linux)\n\nFluxo de launch:\n  AMI → tipo → networking → SG → key pair → storage → user data → LAUNCH\n\nEstados:\n  pending → running → stopping → stopped → shutting-down → terminated\n  (reboot = running → running, sem perder nada)\n\nStop vs Terminate:\n  Stop      → desliga compute, mantém disco, REVERSÍVEL\n  Terminate → apaga TUDO (default), IRREVERSÍVEL\n  Hibernate → como stop mas salva RAM (boot mais rápido)\n\nAcesso:\n  SSH/.pem → tradicional, porta 22 aberta\n  Session Manager → moderno, sem porta aberta, IAM-based\n\nConceitos:\n  AMI            → receita pra criar instância (Golden Image)\n  Security Group → firewall stateful, só ALLOW\n  Key Pair       → chave SSH (download .pem só 1 vez!)\n  User Data      → script que roda no 1º boot\n  IMDS           → 169.254.169.254 (metadados da instância)",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No fluxo de criação de uma instância EC2, o que é uma AMI (Amazon Machine Image)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um modelo que contém o sistema operacional, aplicações pré-instaladas, configurações de boot e snapshots de EBS, usado como base para lançar a instância.",
                                isCorrect: true,
                            },
                            {
                                text: "O tipo de instância, que define a quantidade de vCPUs e de memória RAM da máquina.",
                                isCorrect: false,
                            },
                            {
                                text: "O par de chaves (arquivo .pem) usado para autenticar o acesso SSH à instância.",
                                isCorrect: false,
                            },
                            {
                                text: "O volume de armazenamento em bloco anexado à instância enquanto ela está em execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação compara corretamente as ações Stop e Terminate de uma instância EC2?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Stop mantém o volume EBS raiz e é reversível; Terminate apaga o volume raiz por padrão e é irreversível.",
                                isCorrect: true,
                            },
                            {
                                text: "Stop apaga o volume EBS raiz; Terminate mantém o volume para reutilização posterior.",
                                isCorrect: false,
                            },
                            {
                                text: "Tanto Stop quanto Terminate apagam automaticamente o volume EBS raiz da instância.",
                                isCorrect: false,
                            },
                            {
                                text: "As duas ações são reversíveis: basta dar start para a instância voltar a funcionar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica descreve corretamente um security group de uma instância EC2?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É stateful e aceita apenas regras de allow; por padrão bloqueia todo o tráfego de entrada e libera todo o de saída.",
                                isCorrect: true,
                            },
                            {
                                text: "É stateless e exige que você crie regras separadas de entrada e de saída para cada conexão.",
                                isCorrect: false,
                            },
                            {
                                text: "Aceita regras de deny, usadas para bloquear endereços IP específicos que tentam se conectar.",
                                isCorrect: false,
                            },
                            {
                                text: "É aplicado no nível da subnet e protege de uma só vez todas as instâncias que estão nela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer que a instância EC2 instale pacotes e configure serviços automaticamente na primeira inicialização, sem nenhuma interação manual. O que usar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "User Data: um script fornecido na criação da instância que roda como root no primeiro boot.",
                                isCorrect: true,
                            },
                            {
                                text: "IMDS (Instance Metadata Service): você grava o script nos metadados e ele é executado a cada boot.",
                                isCorrect: false,
                            },
                            {
                                text: "O key pair da instância, que executa o script assim que você conecta por SSH.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma regra de inbound no security group, que dispara o script quando a porta é liberada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual opção permite acessar uma instância EC2 sem abrir a porta 22, sem gerenciar chaves .pem e com autenticação via IAM e auditoria dos acessos?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Systems Manager Session Manager.", isCorrect: true },
                            {
                                text: "SSH tradicional usando a chave .pem, com a porta 22 liberada no security group.",
                                isCorrect: false,
                            },
                            {
                                text: "EC2 Instance Connect, que depende da porta 22 aberta para o serviço.",
                                isCorrect: false,
                            },
                            {
                                text: "RDP, com a porta 3389 aberta para conexão remota.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "EC2 - Scaling (Escalabilidade)",
                blocks: [
                    {
                        type: "quote",
                        value: "**Scaling** é a capacidade de **ajustar automaticamente** a quantidade de recursos computacionais conforme a demanda muda. Na AWS, isso é feito principalmente pelo **Amazon EC2 Auto Scaling**, que é um dos pilares da nuvem, ao lado de pagar pelo uso e da alta disponibilidade.",
                    },
                    {
                        type: "text",
                        value: "## 1. Por que escalar?\n\nA nuvem inverte a lógica do data center tradicional:",
                    },
                    {
                        type: "table",
                        value: '[["On-Premises","Cloud (AWS)"],["Compra capacidade para o **pico previsto**","Provisiona o que precisa **agora**"],["Capacidade ociosa custa dinheiro 24/7","Sobe e desce conforme a demanda real"],["Falta de capacidade = downtime","Auto Scaling reage em **minutos**"]]',
                    },
                    {
                        type: "text",
                        value: "Existem **dois objetivos principais** por trás disso:\n\n1. **Disponibilidade**: manter a aplicação funcionando mesmo diante de picos de tráfego ou de falhas de instância.\n2. **Otimização de custo**: pagar só pela capacidade que você de fato usa.\n\n## 2. Tipos de escalonamento\n\n### Vertical Scaling (Scaling Up / Down)\nAqui você **aumenta o tamanho da instância** (por exemplo, de `t3.medium` para `t3.xlarge`). Alguns pontos a saber:\n\n- Para mudar o tipo, é preciso **parar a instância**.\n- Existe um limite, que é o tamanho máximo daquela família.\n- É **pouco usado na nuvem moderna** e não é o foco do EC2 Auto Scaling.\n\n### Horizontal Scaling (Scaling Out / In)\nAqui você **adiciona ou remove instâncias** do mesmo tipo (por exemplo, de 2 para 10 instâncias). As características principais:\n\n- Acontece **sem downtime**, porque as instâncias entram e saem do pool dinamicamente.\n- É o **modelo padrão da AWS** e é exatamente o que o EC2 Auto Scaling faz.\n- Exige uma aplicação **stateless** (ou com o estado guardado fora dela, em S3, RDS ou ElastiCache).",
                    },
                    {
                        type: "quote",
                        value: '**Na prova:** se a pergunta menciona "**add/remove instances**" ou "**scale out/in**", pense em **horizontal**. Se menciona "**bigger/smaller instance**" ou "**scale up/down**", pense em **vertical**.',
                    },
                    {
                        type: "text",
                        value: '## 3. Amazon EC2 Auto Scaling\n\nÉ o serviço gerenciado que **adiciona e remove instâncias EC2 automaticamente** com base em regras que você define.\n\n### Benefícios\n- **Better fault tolerance**: substitui sozinho as instâncias unhealthy (com problema).\n- **Better availability**: distribui as instâncias entre múltiplas AZs.\n- **Better cost management**: escala para baixo quando a demanda cai.\n\n## 4. Componentes do Auto Scaling\n\n### 4.1. Launch Template (recomendado) / Launch Configuration (legado)\nÉ a "receita" para criar novas instâncias. Ela guarda:\n- AMI (imagem)\n- Tipo de instância\n- Key pair, security groups, user data\n- Volumes EBS, IAM role\n\n### 4.2. Auto Scaling Group (ASG)\nO ASG (Auto Scaling Group) define **onde** e **quantas** instâncias vão rodar:\n- A **VPC (Virtual Private Cloud, a rede isolada) e as subnets**, idealmente em **múltiplas AZs (Availability Zones)**.\n- **Minimum capacity**: o número **mínimo** de instâncias, que nunca cai abaixo disso.\n- **Desired capacity**: o número **alvo** naquele momento.\n- **Maximum capacity**: o número **máximo**, que funciona como teto para o custo não estourar.',
                    },
                    {
                        type: "code",
                        value: "   Max:      ┌──────────────┐  ← nunca passa daqui\n             │              │\n   Desired:  │  6 (atual)   │  ← onde o ASG está agora\n             │              │\n   Min:      └──────────────┘  ← nunca cai abaixo daqui",
                    },
                    {
                        type: "text",
                        value: "### 4.3. Scaling Policies\nSão as **regras** que mudam o `desired capacity` automaticamente.\n\n## 5. Tipos de Scaling Policies",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Quando dispara","Caso de uso"],["**Manual**","Você muda o desired capacity manualmente","Ajustes pontuais"],["**Scheduled**","Em horário/dia específico","Carga **previsível por horário** (ex.: +instâncias 8h-18h em dias úteis)"],["**Dynamic - Target Tracking**","Mantém uma **métrica em um valor alvo** (ex.: CPU média = 50 %)","**Caso mais comum**, fácil de configurar"],["**Dynamic - Step Scaling**","Adiciona N instâncias por **faixa** de severidade do alarme","Controle granular"],["**Dynamic - Simple Scaling**","Adiciona/remove N instâncias quando um alarme dispara","Versão antiga (use Step ou Target Tracking)"],["**Predictive**","Usa **machine learning** sobre histórico para escalar **antes** do pico","Carga com padrão recorrente"]]',
                    },
                    {
                        type: "quote",
                        value: '**Default da prova:** quando perguntam "qual é a forma mais fácil de manter a CPU em torno de X%", a resposta é **Target Tracking**.',
                    },
                    {
                        type: "text",
                        value: "## 6. Integração com Elastic Load Balancer (ELB)\n\nO ASG e o ELB (Elastic Load Balancer) normalmente andam **juntos**:",
                    },
                    {
                        type: "code",
                        value: "      ┌────────────┐\n      │   ELB      │  (Application / Network / Gateway LB)\n      └─────┬──────┘\n            │\n   ┌────────┴────────┐\n   │   Auto Scaling  │\n   │      Group      │\n   │  ┌──┐ ┌──┐ ┌──┐ │\n   │  │EC│ │EC│ │EC│ │\n   │  │2 │ │2 │ │2 │ │\n   │  └──┘ └──┘ └──┘ │\n   └─────────────────┘",
                    },
                    {
                        type: "text",
                        value: "- O ELB **distribui o tráfego** entre as instâncias do ASG.\n- O ASG usa os **health checks do ELB**, e não apenas os do EC2. Assim, se a instância passa no boot mas a aplicação não responde, o ELB a marca como unhealthy e o ASG a substitui.\n\n## 7. AWS Auto Scaling vs EC2 Auto Scaling",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Escopo"],["**EC2 Auto Scaling**","Só **EC2** (e ASGs)"],["**AWS Auto Scaling**","**Multi-serviço**: EC2, ECS, DynamoDB, Aurora, Spot Fleets, etc."]]',
                    },
                    {
                        type: "text",
                        value: 'Na prova, os dois podem aparecer. Leia com atenção qual dos dois está sendo perguntado.\n\n## 8. Health Checks\n\nO ASG monitora cada instância e substitui as que estão **unhealthy**. Ele pode olhar para dois tipos de sinal:\n\n- **EC2 status checks** (padrão): a VM está rodando? O hardware está ok?\n- **ELB health checks** (opcional, recomendado): a aplicação está respondendo na porta certa?\n\nQuando uma instância falha, a sequência é:\n1. O ASG **termina** a instância unhealthy.\n2. O ASG **cria uma nova** com base no launch template.\n3. O ELB volta a rotear tráfego para ela assim que os health checks passam.\n\n## 9. Boas práticas (e pegadinhas da prova)\n\n1. **Use múltiplas AZs** no ASG, o que garante alta disponibilidade contra a falha de uma AZ inteira.\n2. **Min ≠ Desired ≠ Max**, ou seja, defina os três com consciência.\n   - Min: garante que **sempre** haja instâncias ativas (HA).\n   - Max: funciona como **teto de custo**.\n   - Desired: é o ponto de partida.\n3. **Aplicação stateless**, com o estado guardado em S3, RDS, DynamoDB ou ElastiCache, nunca no disco local da EC2.\n4. **Combine On-Demand + Spot** nos ASGs (mixed instances policy) para economizar.\n5. Use **Cooldown** entre os eventos de scaling para evitar o "flapping" (aquele sobe-desce-sobe-desce sem parar).\n6. Use **Predictive scaling** quando existe um padrão **recorrente** (carga diária, semanal).\n7. Use **Scheduled scaling** quando o horário do pico é **conhecido e fixo**.\n\n## 10. Pegadinhas comuns da prova\n\n1. **"Como reagir automaticamente a picos imprevistos de tráfego?"** → **Dynamic scaling** (target tracking).\n2. **"Como economizar à noite quando ninguém usa o sistema?"** → **Scheduled scaling**.\n3. **"Aplicação deve sobreviver à queda de uma AZ"** → ASG em **múltiplas AZs**.\n4. **"Maximizar disponibilidade e elasticidade ao mesmo tempo"** → **ASG + ELB** (sempre juntos na resposta).\n5. **"Substitui automaticamente instâncias com falha"** → **EC2 Auto Scaling**.\n6. **"Vertical scaling tem downtime"** → **verdade** (precisa parar e mudar o tipo).\n7. **"Horizontal scaling exige aplicação stateless"** → **verdade**.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: "Vertical (Up/Down)    →  instância maior, precisa parar\nHorizontal (Out/In)   →  + ou - instâncias, sem downtime ← AWS default\n\nEC2 Auto Scaling:\n  Launch Template    →  receita da instância\n  Auto Scaling Group →  min / desired / max + AZs\n  Scaling Policy:\n    Manual           →  você ajusta\n    Scheduled        →  horário fixo\n    Dynamic (Target) →  mantém métrica em alvo  ← mais comum\n    Predictive       →  ML, padrão recorrente\n\nASG + ELB            →  alta disponibilidade + balanceamento\nHealth Checks        →  EC2 + ELB → substitui unhealthy",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma aplicação web precisa lidar com o aumento de tráfego adicionando mais instâncias EC2 do mesmo tipo ao pool, sem interromper o serviço. Que tipo de escalonamento descreve essa abordagem?",
                        difficulty: "facil",
                        options: [
                            { text: "Escalonamento horizontal (scaling out/in)", isCorrect: true },
                            { text: "Escalonamento vertical (scaling up/down)", isCorrect: false },
                            {
                                text: "Balanceamento de carga com Elastic Load Balancing",
                                isCorrect: false,
                            },
                            {
                                text: "Escalonamento preditivo (predictive scaling)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao configurar um Auto Scaling Group, qual parâmetro funciona como teto e impede que o grupo crie instâncias acima de um limite definido, ajudando a controlar custos?",
                        difficulty: "medio",
                        options: [
                            { text: "Desired capacity (capacidade desejada)", isCorrect: false },
                            { text: "Maximum capacity (capacidade máxima)", isCorrect: true },
                            { text: "Minimum capacity (capacidade mínima)", isCorrect: false },
                            { text: "Cooldown", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A equipe quer que o Auto Scaling mantenha automaticamente a utilização média de CPU do grupo em torno de 50%, com a configuração mais simples possível. Qual política de scaling atende a esse objetivo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Scheduled scaling (escalonamento agendado)",
                                isCorrect: false,
                            },
                            {
                                text: "Manual scaling (ajuste manual da capacidade desejada)",
                                isCorrect: false,
                            },
                            {
                                text: "Dynamic scaling com target tracking (rastreamento de destino)",
                                isCorrect: true,
                            },
                            {
                                text: "Predictive scaling (escalonamento preditivo)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um Auto Scaling Group está integrado a um balanceador de carga do Elastic Load Balancing (ELB). Por que é recomendado habilitar os health checks do ELB, além dos EC2 status checks, para decidir quando substituir uma instância?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os EC2 status checks sozinhos já confirmam que a aplicação web está respondendo, tornando os health checks do ELB desnecessários",
                                isCorrect: false,
                            },
                            {
                                text: "Os health checks do ELB verificam se a aplicação responde na porta e no caminho configurados, o que permite substituir instâncias que iniciaram mas cuja aplicação parou de responder",
                                isCorrect: true,
                            },
                            {
                                text: "Os health checks do ELB criptografam o tráfego entre as instâncias do grupo",
                                isCorrect: false,
                            },
                            {
                                text: "Os health checks do ELB reduzem o preço por hora das instâncias sob demanda",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que a aplicação continue disponível mesmo se uma Zona de Disponibilidade inteira ficar fora do ar, como o Auto Scaling Group deve ser configurado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Concentrando todas as instâncias em uma única Zona de Disponibilidade para reduzir a latência",
                                isCorrect: false,
                            },
                            {
                                text: "Usando escalonamento vertical para aumentar o tamanho de uma única instância",
                                isCorrect: false,
                            },
                            { text: "Definindo a capacidade mínima como zero", isCorrect: false },
                            {
                                text: "Distribuindo as instâncias em subnets de múltiplas Zonas de Disponibilidade",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Elastic Load Balancer (ELB) - Distribuindo tráfego",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO **ELB (Elastic Load Balancer) distribui as requisições que chegam entre várias instâncias**, entregando **alta disponibilidade**, **escalabilidade horizontal** e **isolamento de falhas**. Ele anda **junto com o Auto Scaling**: o ASG sobe e desce máquinas, e o ELB sabe como rotear o tráfego para elas. Na prova, o que mais cai é saber **qual dos 3 tipos** (ALB, NLB ou GLB) usar em cada caso.",
                    },
                    {
                        type: "text",
                        value: "## 1. Por que load balancing existe\n\nSem um load balancer, todo o tráfego cai em uma única máquina:",
                    },
                    {
                        type: "code",
                        value: "   Cliente ──► uma EC2 (gargalo + ponto único de falha)",
                    },
                    {
                        type: "text",
                        value: "Com o ELB, o tráfego se espalha entre várias instâncias, inclusive em AZs diferentes:",
                    },
                    {
                        type: "code",
                        value: "   Cliente ──► ELB ──┬──► EC2 (AZ-a)\n                    ├──► EC2 (AZ-b)\n                    └──► EC2 (AZ-c)",
                    },
                    {
                        type: "text",
                        value: "**Benefícios:**\n- **Alta disponibilidade**: uma EC2, ou até uma AZ inteira, pode cair, e o ELB redireciona o tráfego.\n- **Escalabilidade horizontal**: adicionar mais EC2 significa mais throughput.\n- **Health checks**: uma instância unhealthy sai do pool automaticamente.\n- **SSL termination**: o ELB descriptografa o HTTPS, e as instâncias só tratam HTTP.\n- **Endpoint único e estável**: os clientes não precisam conhecer os IPs reais.",
                    },
                    {
                        type: "quote",
                        value: "**Combo clássico:** **ELB + Auto Scaling Group** atrás dele. O ASG escala N instâncias, e o ELB distribui o tráfego entre elas.",
                    },
                    {
                        type: "text",
                        value: "## 2. Os 4 tipos de ELB\n\nA AWS tem **3 ELBs modernos** e mais 1 legado:",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Camada OSI","Protocolos","Caso de uso principal"],["**ALB** (Application LB)","**L7**","**HTTP / HTTPS / WebSocket**","Web apps, microsserviços, roteamento por path/host"],["**NLB** (Network LB)","**L4**","**TCP / UDP / TLS**","Latência extrema, milhões de RPS, jogos, IoT"],["**GLB** (Gateway LB)","**L3**","IP (qualquer)","Distribuir tráfego para **appliances de segurança** (firewall, IDS)"],["**CLB** (Classic LB) - legado","L4/L7","HTTP/HTTPS, TCP","Não usar pra projeto novo"]]',
                    },
                    {
                        type: "quote",
                        value: "**Mnemônico de camada:** **A**LB = **A**pplication = camada HTTP. **N**LB = **N**etwork = camada TCP. **G**LB = **G**ateway = camada IP.",
                    },
                    {
                        type: "text",
                        value: "## 3. ALB - Application Load Balancer (o mais comum)\n\n### O que faz\n- Roteia **HTTP/HTTPS** com base no **conteúdo da requisição**:\n  - Path (`/api/*` vai para o backend A, `/static/*` vai para o backend B).\n  - Host header (`app.exemplo.com` vs `api.exemplo.com`).\n  - Query string, headers, cookies.\n- Suporta **HTTP/2, WebSockets e gRPC**.\n- Faz **SSL/TLS termination** com certificados do AWS Certificate Manager.\n- Tem **authentication** integrada com Cognito e OIDC.\n\n### Targets que pode rotear\n- EC2 instances\n- ECS containers (um target group por container)\n- IP addresses\n- **Lambda functions** (sim, ALB roteia direto para Lambda!)\n\n### Caso de uso clássico\n- Microsserviços com **roteamento por path** (`/users/*`, `/orders/*`, `/payments/*`).\n- Web app com **múltiplos hosts** (SaaS multi-tenant).\n- Aplicações em container (ECS/EKS).\n\n## 4. NLB - Network Load Balancer\n\n### O que faz\n- Roteia **TCP/UDP** na **camada 4**. Ele não enxerga o conteúdo HTTP, só portas e IPs.\n- Entrega **latência ultra-baixa** (na casa dos milissegundos).\n- Aguenta **milhões de requests por segundo** com latência consistente.\n- Tem **IP estático por AZ**, ao contrário do ALB, que usa DNS variável.\n- Preserva o **IP do cliente** (TCP passthrough).\n\n### Caso de uso clássico\n- **Jogos** multiplayer (UDP).\n- **IoT** (TCP de alto throughput).\n- **Sistemas financeiros** que exigem latência mínima.\n- **gRPC** ou protocolos custom (que não são HTTP).\n- Quando você precisa de **IP fixo** para um firewall on-prem liberar.",
                    },
                    {
                        type: "quote",
                        value: "**Quando o ALB não dá conta, o NLB entra.** É velocidade pura, sem inspecionar o conteúdo.",
                    },
                    {
                        type: "text",
                        value: '## 5. GLB - Gateway Load Balancer\n\n### O que faz\n- Distribui o tráfego para **virtual appliances de terceiros** (firewalls, IDS/IPS, packet inspection).\n- Atua na camada 3 (pacotes IP).\n- Usa **GENEVE encapsulation** para levar todo o tráfego até o appliance e devolvê-lo.\n- Funciona como um "**bump in the wire**", ou seja, é inserido de forma transparente no caminho do tráfego.\n\n### Caso de uso clássico\n- O cliente quer rodar um **firewall de terceiros (Palo Alto, Check Point, Fortinet)** na nuvem.\n- **Detecção de intrusão** centralizada.\n- **Inspeção profunda de pacotes (DPI, Deep Packet Inspection)**.',
                    },
                    {
                        type: "quote",
                        value: "**O GLB é o especialista em segurança de rede.** Se a pergunta envolve firewall de terceiros, IDS ou inspeção de tráfego, a resposta é GLB.",
                    },
                    { type: "text", value: "## 6. Comparação direta" },
                    {
                        type: "table",
                        value: '[["Critério","**ALB**","**NLB**","**GLB**"],["Camada OSI","L7","L4","L3"],["Protocolos","HTTP/HTTPS/WebSocket/gRPC","TCP/UDP/TLS","IP packets (qualquer protocolo)"],["Latência","ms","**sub-ms**","ms"],["Roteamento por conteúdo","**Sim** (path, host, etc.)","Não","Não"],["IP estático","Não (DNS muda)","**Sim** (1 por AZ)","Sim"],["SSL termination","Sim","Sim (limited)","n/a"],["Roteia pra Lambda","**Sim**","Não","Não"],["Roteia pra IP / on-prem","Sim (via IP target)","Sim","Sim"],["Custo","$$","$","$$"]]',
                    },
                    {
                        type: "text",
                        value: "## 7. Health Checks\n\nO ELB testa cada target de tempos em tempos:\n- **HTTP** (no ALB): faz um `GET /health` e espera receber HTTP 200.\n- **TCP** (no NLB): tenta abrir uma conexão na porta.\n\nSe o teste falhar **N vezes seguidas** (você configura esse número), o target é marcado como **unhealthy** e **removido do pool**. Quando ele volta a passar, é reincluído.",
                    },
                    {
                        type: "quote",
                        value: "**Conexão com o Auto Scaling:** o ASG usa o health check do ELB como sinal. A instância unhealthy é **substituída automaticamente** por uma nova.",
                    },
                    {
                        type: "text",
                        value: "## 8. Sticky Sessions (afinidade de sessão)\n\nPor padrão, o ELB distribui as requests em **round-robin**, então uma mesma sessão pode cair em servidores diferentes a cada request.\n\nA **sticky session** força que **todas as requests do mesmo cliente** vão para a **mesma instância** (isso é controlado por um cookie).\n\n- É útil para apps **stateful**, que guardam a sessão localmente.\n- É um **anti-pattern moderno**: o ideal é ser **stateless**, com a sessão guardada fora (em Redis ou DynamoDB). A sticky session é um remendo.\n\n## 9. Cross-Zone Load Balancing",
                    },
                    {
                        type: "code",
                        value: "Sem Cross-Zone:                Com Cross-Zone:\n  AZ-a (50% do tráfego)          AZ-a + AZ-b somam tudo\n    ├ EC2-1 (25%)                  ELB distribui igualmente\n    └ EC2-2 (25%)                  entre TODAS as instâncias\n  AZ-b (50% do tráfego)            (10 EC2 = 10% cada)\n    ├ EC2-3 (16,6%)\n    ├ EC2-4 (16,6%)\n    └ EC2-5 (16,6%)",
                    },
                    {
                        type: "text",
                        value: "- **ALB**: cross-zone vem **ligado por padrão e é grátis**.\n- **NLB**: cross-zone vem **desligado por padrão**, e ligar cobra data transfer entre AZs.\n- O **cross-zone evita o desbalanceamento** quando as AZs têm um número diferente de instâncias.\n\n## 10. SSL/TLS termination",
                    },
                    {
                        type: "code",
                        value: "Cliente ──HTTPS:443──► ELB ──HTTP:80──► EC2\n              ▲             ▲\n   ELB tem o certificado    EC2 recebe tráfego\n   (AWS Certificate Mgr)     já descriptografado",
                    },
                    {
                        type: "text",
                        value: '- O ELB descriptografa o tráfego, então a EC2 recebe HTTP simples e fica com menos carga.\n- O certificado fica no **AWS Certificate Manager (ACM)**, que é gratuito e renova sozinho.\n- Também dá para fazer **end-to-end encryption** (HTTPS até a EC2, HTTPS o tempo todo) quando o compliance exige.\n\n## 11. Pegadinhas comuns da prova\n\n1. **"App web com roteamento por path (/api, /static)"** → **ALB**.\n2. **"Latência ultra-baixa, milhões de RPS"** → **NLB**.\n3. **"Roteamento via UDP (jogo, IoT)"** → **NLB** (o ALB só faz HTTP).\n4. **"Firewall de terceiros (Palo Alto, Check Point) na frente"** → **GLB**.\n5. **"Preciso de IP estático no load balancer"** → **NLB** (o ALB com Elastic IP é um caso especial; o NLB é a resposta direta).\n6. **"Load balancer pra Lambda"** → **ALB** (pode rotear para Lambda como target).\n7. **"Health check pra remover instância ruim do pool"** → ELB (qualquer tipo).\n8. **"Distribuir tráfego entre EC2 em múltiplas AZs com alta disponibilidade"** → ELB + ASG multi-AZ.\n9. **"SSL/TLS termination com certificado gerenciado pela AWS"** → ELB + **ACM**.\n10. **"Roteamento por host (multi-tenant SaaS, vários domínios)"** → **ALB**.\n11. **"Aplicação WebSocket / gRPC"** → **ALB**.\n12. **"Sticky session"** → opção do ELB para forçar a mesma instância (anti-pattern em apps modernas).\n\n## 12. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'ELB = distribui tráfego, garante HA, integra com Auto Scaling\n\n3 tipos modernos:\n  ALB  → HTTP/HTTPS, L7, roteia por path/host, pra apps web\n  NLB  → TCP/UDP, L4, latência sub-ms, IP estático\n  GLB  → L3, packets pra appliances de segurança (firewall 3rd party)\n\n(CLB é legado - não usar)\n\nTargets que ALB pode rotear:\n  EC2, ECS, IP, Lambda\n\nConceitos:\n  Health Check        → tira target unhealthy do pool\n  Sticky Session      → mesmo cliente sempre na mesma EC2 (cookie)\n  Cross-Zone LB       → distribui igualmente entre AZs (ALB on, NLB off por default)\n  SSL Termination     → ELB descriptografa, EC2 recebe HTTP (cert via ACM)\n\nAtalhos pra prova:\n  "HTTP, /api, /static"          → ALB\n  "UDP, jogo, IoT"               → NLB\n  "Firewall 3rd party / IDS"     → GLB\n  "Latência ultra-baixa, IP fixo"→ NLB\n  "Multi-tenant SaaS / WebSocket"→ ALB\n  "Roteia pra Lambda"            → ALB (único que faz)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma aplicação web de microsserviços precisa rotear o tráfego HTTP e HTTPS pelo caminho da URL: as requisições para /api/* vão para um grupo de instâncias e as de /static/* para outro. Qual tipo de Elastic Load Balancer faz esse roteamento por conteúdo na camada 7?",
                        difficulty: "facil",
                        options: [
                            { text: "Application Load Balancer (ALB)", isCorrect: true },
                            { text: "Network Load Balancer (NLB)", isCorrect: false },
                            { text: "Gateway Load Balancer (GWLB)", isCorrect: false },
                            { text: "Classic Load Balancer (CLB)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um jogo multiplayer online usa tráfego UDP e precisa de um balanceador de camada 4 com latência de milissegundos, capaz de sustentar milhões de requisições por segundo. Qual opção atende esse cenário?",
                        difficulty: "facil",
                        options: [
                            { text: "Application Load Balancer (ALB)", isCorrect: false },
                            { text: "Network Load Balancer (NLB)", isCorrect: true },
                            { text: "Gateway Load Balancer (GWLB)", isCorrect: false },
                            { text: "Amazon CloudFront", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa quer inserir um firewall de terceiros (como Palo Alto ou Fortinet) de forma transparente no caminho do tráfego, usando encapsulamento GENEVE para enviar os pacotes ao appliance e recebê-los de volta. Qual Elastic Load Balancer foi projetado para distribuir tráfego a esses appliances de segurança?",
                        difficulty: "medio",
                        options: [
                            { text: "Network Load Balancer (NLB)", isCorrect: false },
                            { text: "Classic Load Balancer (CLB)", isCorrect: false },
                            { text: "Gateway Load Balancer (GWLB)", isCorrect: true },
                            { text: "Application Load Balancer (ALB)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em um ambiente com um ELB na frente de um Auto Scaling Group, uma instância EC2 passa a falhar no health check do balanceador. O que acontece com essa instância?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O tráfego é redirecionado automaticamente para outra região da AWS.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela é marcada como unhealthy (não íntegra) e retirada do pool de destinos, e o Auto Scaling pode substituí-la por uma instância nova.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela continua recebendo tráfego normalmente até alguém reiniciá-la manualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "O load balancer inteiro é desativado até a instância voltar a passar no teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe vai configurar SSL/TLS termination no load balancer e quer um certificado gerenciado pela AWS, sem custo e com renovação automática. De qual serviço vem esse certificado?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Secrets Manager", isCorrect: false },
                            { text: "AWS Key Management Service (KMS)", isCorrect: false },
                            { text: "AWS Certificate Manager (ACM)", isCorrect: true },
                            { text: "AWS Identity and Access Management (IAM)", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS Fargate - Compute serverless para containers",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO **Fargate** é o modo **serverless** de rodar containers na AWS. Você fornece **só a imagem do container**, e a AWS cuida de todo o resto: provisionar as VMs, escalar, aplicar patches e manter o cluster de pé.",
                    },
                    {
                        type: "text",
                        value: "## 1. Containers em 30 segundos (pré-requisito)\n\nAntes de entender o Fargate, vale separar o que é **container**, que é um conceito à parte:",
                    },
                    {
                        type: "table",
                        value: '[["Conceito","O que é"],["**Imagem (image)**","Pacote imutável com **app + dependências + runtime + configs** (ex.: `node:22-alpine` + seu código)."],["**Container**","Uma **instância em execução** dessa imagem (uma \\"VM leve\\" que compartilha o kernel do host)."],["**Container Engine**","Software que roda containers (Docker, containerd, etc.)."],["**Orquestrador**","Software que **gerencia muitos containers** em vários hosts (Kubernetes, ECS)."]]',
                    },
                    {
                        type: "text",
                        value: '### Por que containers (vs VM tradicional)\n- **Startup em segundos**, e não em minutos.\n- **O mesmo artefato roda igual em dev, staging e prod**, então o clássico "na minha máquina funciona" some.\n- **Mais densidade**: você coloca 50 containers em um host onde caberiam só 5 VMs.\n- **Imagem versionada**, o que torna o deploy e o rollback triviais.',
                    },
                    {
                        type: "quote",
                        value: 'Conexão com o projeto Plataforma de Estudos\nO backend Node + Postgres do projeto pessoal roda exatamente nesse modelo: cada serviço é um container Docker, orquestrado por Docker Compose localmente. Fargate é "o mesmo Docker Compose, mas com AWS gerenciando os hosts".',
                    },
                    {
                        type: "text",
                        value: '## 2. O que é Fargate\n\nO **AWS Fargate** é um motor **serverless** de execução de containers. Ele funciona com dois orquestradores da AWS:\n\n- **ECS (Elastic Container Service)**: o orquestrador proprietário da AWS, mais simples.\n- **EKS (Elastic Kubernetes Service)**: o Kubernetes gerenciado pela AWS.\n\nOu seja, você não escolhe "Fargate ou ECS?". Você escolhe **ECS com Fargate** ou **EKS com Fargate**.',
                    },
                    {
                        type: "quote",
                        value: '"Serverless" aqui significa\n**Você não enxerga, não cria, não administra as VMs** que rodam os containers. AWS provisiona e gerencia tudo nos bastidores. Você só especifica:\n- Qual imagem rodar\n- Quanta vCPU e RAM cada container precisa\n- Como ele se conecta à rede',
                    },
                    { type: "text", value: "## 3. Os 3 modos de rodar containers na AWS" },
                    {
                        type: "table",
                        value: '[["Serviço","Orquestrador","Onde os containers rodam","Quem gerencia o host?"],["**ECS on EC2**","ECS (AWS)","Em instâncias EC2 **que você provisiona**","**Você** (patches, scaling do cluster, AMI)"],["**ECS on Fargate**","ECS (AWS)","Compute **gerenciada pela AWS**","**AWS**"],["**EKS on EC2**","Kubernetes","Em instâncias EC2 **que você provisiona**","**Você**"],["**EKS on Fargate**","Kubernetes","Compute **gerenciada pela AWS**","**AWS**"]]',
                    },
                    {
                        type: "quote",
                        value: '**Na prova:** quando aparece "**não quer gerenciar servidores**" junto com "**rodar containers**", a resposta é **Fargate**.',
                    },
                    { type: "text", value: "## 4. Fargate vs EC2 launch type (cai muito)" },
                    {
                        type: "table",
                        value: '[["Critério","**EC2 launch type**","**Fargate launch type**"],["Quem gerencia as VMs","**Você**","**AWS**"],["Você escolhe tipo/tamanho de instância?","**Sim** (m5.xlarge, etc.)","**Não** - escolhe só vCPU e RAM do **task**"],["Patches do SO","Sua responsabilidade","AWS"],["Scaling do cluster (subir/baixar VMs)","Você configura ASG","Automático - AWS provisiona on-demand"],["Modelo de cobrança","**Por instância EC2** (mesmo se containers estão parados)","**Por segundo de vCPU + RAM** consumidos pelo container"],["Densidade","Você decide quantos containers por VM","Cada task pega só o que precisa"],["Custo bruto","**Mais barato** em uso constante alto","**Mais caro** por vCPU, mas paga só o uso real"],["Ideal pra","Workloads **estáveis** com alta utilização, controle fino do host","Workloads **variáveis**, microsserviços, batch jobs, prototipagem rápida"]]',
                    },
                    {
                        type: "quote",
                        value: '**Mnemônico:** "**vou cuidar das máquinas**" leva a EC2. "**só me importo com o container**" leva a Fargate.',
                    },
                    { type: "text", value: "## 5. Como funciona Fargate (fluxo)" },
                    {
                        type: "code",
                        value: '1. Você empacota a app numa IMAGEM Docker\n        ↓\n2. Sobe a imagem pro Amazon ECR (registry da AWS)\n        ↓\n3. Cria uma "Task Definition" no ECS dizendo:\n   - imagem: 123456789.dkr.ecr.us-east-1.amazonaws.com/minha-api:v3\n   - cpu: 512 (0.5 vCPU)\n   - memory: 1024 (1 GiB)\n   - porta: 3000\n   - launch type: FARGATE\n        ↓\n4. Cria um SERVIÇO ECS que rode N tasks dessa definição\n        ↓\n5. AWS Fargate provisiona automagicamente compute,\n   puxa a imagem, sobe os containers, conecta no Load Balancer.\n        ↓\n6. Você paga só pelos vCPU-segundos + GB-segundos efetivamente usados.',
                    },
                    {
                        type: "text",
                        value: "Você **nunca** vê um EC2, nunca faz SSH em nada e nunca configura ASG.\n\n## 6. Modelo de cobrança\n\nA cobrança é por **vCPU-segundo** somado a **GB-segundo** consumidos, com um mínimo de **1 minuto**.",
                    },
                    {
                        type: "table",
                        value: '[["Componente","Cobrado por"],["**vCPU**","$/hora por vCPU alocada, granularidade de segundo"],["**Memória**","$/hora por GB alocada, granularidade de segundo"],["**Arquitetura**","x86 padrão; **ARM (Graviton)** é ~20% mais barato"],["**Storage efêmero**","Primeiros 20 GB grátis por task; acima disso, $/GB-mês"]]',
                    },
                    {
                        type: "text",
                        value: "### Implicação financeira\n- Container parado significa **pagar zero**. Ele só custa enquanto está de fato rodando.\n- Container rodando 24/7 fica **mais caro que um EC2 reservado** equivalente.\n- Carga em picos curtos é onde o **Fargate vence**, porque não sobra instância ociosa.\n\n## 7. Casos de uso típicos\n\n- **Microsserviços** com tráfego variável (cada serviço escala independente).\n- **APIs REST** que precisam escalar rápido em picos imprevisíveis.\n- **Batch jobs / ETL** intermitentes (roda 10 min, paga 10 min).\n- **CI/CD runners** (sobe para o build e morre depois).\n- **Machine Learning inference** sob demanda.\n- **Times pequenos** que não têm gente dedicada a operar cluster.\n\n**NÃO é ideal para:**\n- Workload muito constante e alto (o EC2 reservado fica mais barato).\n- Aplicações que precisam de **GPU** (o Fargate não tem suporte a GPU, então use EC2).\n- Coisas que precisam de **acesso ao host** (modo privileged, GPU, host networking).\n- Containers gigantes (o limite atual é de cerca de 16 vCPU e 120 GB de RAM por task).\n\n## 8. Responsabilidade compartilhada aplicada ao Fargate",
                    },
                    {
                        type: "table",
                        value: '[["O que é **da AWS**","O que continua **sua**"],["Hardware físico","Imagem do container (código, libs, deps)"],["Hipervisor","Vulnerabilidades **no seu app**"],["SO do host","Configuração do task (cpu/mem/rede)"],["Patches do SO host","IAM permissions do task role"],["Network do cluster","Secrets / variáveis de ambiente"],["Scaling do compute","Lógica de scaling do **serviço** (quantos tasks rodando)"],["Disponibilidade do orquestrador","Health checks da app"]]',
                    },
                    {
                        type: "quote",
                        value: "**Comparação:** com o EC2 launch type, **patchear o SO da VM** é seu. Com o Fargate, **não é**, porque isso sobe para a responsabilidade da AWS.",
                    },
                    { type: "text", value: "## 9. Mapa mental dos serviços de container AWS" },
                    {
                        type: "code",
                        value: '┌──────────────────────────────────────────────────────┐\n│              ECR (Elastic Container Registry)         │\n│         "Docker Hub privado dentro da sua AWS"        │\n└──────────────────────────────────────────────────────┘\n                         ↓\n        ┌────────────────┴────────────────┐\n        │                                  │\n   ┌────▼─────┐                      ┌────▼─────┐\n   │   ECS    │ (orquestrador AWS)   │   EKS    │ (Kubernetes)\n   └────┬─────┘                      └────┬─────┘\n        │                                  │\n   ┌────┴─────────┐                  ┌────┴─────────┐\n   │ Launch type: │                  │ Launch type: │\n   │              │                  │              │\n   │  EC2  Fargate│                  │  EC2  Fargate│\n   └──────────────┘                  └──────────────┘\n\nAlternativa mais "alto nível":\n   AWS App Runner  → simplesmente "me dá uma imagem,\n                     eu sirvo HTTP", abstrai tudo (até ECS).',
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"Time pequeno, sem expertise em servidores"** → **Fargate** (não precisa gerenciar VMs).\n2. **"Workload imprevisível e variável"** → **Fargate** (paga só o uso).\n3. **"Carga 24/7 estável, querem máximo desconto"** → **EC2 launch type** com **Reserved Instances**.\n4. **"Precisa de GPU"** → **NÃO é Fargate**. Use ECS/EKS on EC2 com instâncias da família P/G.\n5. **"Querem rodar Kubernetes sem gerenciar control plane nem nodes"** → **EKS + Fargate**.\n6. **"Querem migrar de Docker on-premises sem aprender Kubernetes"** → **ECS + Fargate** (mais simples que EKS).\n7. **"Quem patcheia o SO?"** → no Fargate é a **AWS**; no EC2 launch type é **você**.\n8. **"Cobrança"** → o Fargate cobra por **segundo** (granular). O EC2 launch type cobra por **instância** (paga mesmo ocioso).\n9. **"Fargate é serverless?"** → **Sim**. Junto com o Lambda, é um dos compute serverless da AWS.\n10. **"Diferença Fargate vs Lambda?"** → **Lambda** são funções curtas (até 15 min), event-driven. **Fargate** são containers de **longa duração** (servidor web, worker, processo contínuo).\n\n## 11. Fargate vs Lambda (outra pegadinha frequente)',
                    },
                    {
                        type: "table",
                        value: '[["Critério","**Lambda**","**Fargate**"],["Unidade","Função","Container"],["Tempo máximo de execução","**15 min**","**Sem limite** (roda enquanto quiser)"],["Startup","**Cold start** (~100ms-2s)","Demora ~30s na primeira task, depois rápido"],["Estado","**Stateless** obrigatório","Pode manter conexões, sockets, etc."],["Caso de uso","Event-driven, APIs leves, processamento por evento","Serviços de longa duração, microsserviços HTTP, workers"],["Linguagem","Suportadas pela AWS (runtimes)","**Qualquer** (sua escolha de imagem)"],["Pacote","ZIP até 250 MB ou imagem até 10 GB","Imagem Docker (até dezenas de GB)"]]',
                    },
                    {
                        type: "quote",
                        value: '**Regra prática:** "**rodar menos de 15 min, event-driven**" leva a **Lambda**. "**servidor que fica de pé**" leva a **Fargate**.',
                    },
                    { type: "text", value: "## 12. Cheat sheet final" },
                    {
                        type: "code",
                        value: 'Fargate = serverless compute para containers (ECS ou EKS)\n       = você só dá a imagem; AWS faz o resto\n       = cobrança por vCPU-segundo + GB-segundo\n\nQuando usar Fargate em vez de EC2:\n  Time pequeno / não quer gerenciar VMs\n  Carga imprevisível ou variável\n  Microsserviços / batch / CI runner\n  Carga 24/7 constante e alta (EC2 reserved é mais barato)\n  Precisa de GPU (não suportado)\n\nECR  → registry de imagens\nECS  → orquestrador AWS (simples)\nEKS  → orquestrador Kubernetes (padrão da indústria)\n       ambos rodam com launch type EC2 ou Fargate\n\nComparação rápida:\n  EC2 launch type → você gerencia VMs (controle, mais barato em escala)\n  Fargate         → AWS gerencia tudo (simples, paga só o uso)\n  Lambda          → função curta, event-driven, ≤15 min\n  App Runner      → ainda mais alto nível: "dá imagem, vira URL"',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que caracteriza o AWS Fargate como um mecanismo de computação serverless para containers?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A AWS provisiona e gerencia a infraestrutura de computação; o cliente não cria nem administra as instâncias que executam os containers.",
                                isCorrect: true,
                            },
                            {
                                text: "O cliente escolhe o tipo e o tamanho das instâncias EC2 e mantém o cluster sempre atualizado.",
                                isCorrect: false,
                            },
                            {
                                text: "Os containers só podem ser executados na máquina local do desenvolvedor, sem infraestrutura na nuvem.",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente precisa configurar manualmente um Auto Scaling Group para subir e desligar as máquinas virtuais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com quais orquestradores de containers da AWS o Fargate pode ser usado como modo de execução (launch type)?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon ECS e Amazon EKS.", isCorrect: true },
                            { text: "Apenas o Amazon ECS.", isCorrect: false },
                            { text: "AWS Lambda e Amazon EC2.", isCorrect: false },
                            { text: "Amazon ECR e Docker Swarm.", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Como o AWS Fargate cobra pelos containers em execução?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pela vCPU e pela memória alocadas ao container, com granularidade de segundos e cobrança mínima de 1 minuto.",
                                isCorrect: true,
                            },
                            {
                                text: "Por instância EC2 provisionada, cobrando mesmo quando o container está parado.",
                                isCorrect: false,
                            },
                            {
                                text: "Um valor fixo mensal por task, sem relação com o consumo de recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "Pela quantidade de requisições HTTP que a aplicação recebe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma carga de trabalho de inferência de machine learning exige aceleração por GPU. Qual é a orientação correta em relação ao Fargate?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O Fargate não oferece suporte a GPU; para isso, use o Amazon ECS ou o Amazon EKS com instâncias EC2 das famílias P ou G.",
                                isCorrect: true,
                            },
                            {
                                text: "O Fargate fornece GPU por padrão em todas as tasks, sem configuração adicional.",
                                isCorrect: false,
                            },
                            {
                                text: "Basta ativar o modo privileged na task definition para habilitar a GPU no Fargate.",
                                isCorrect: false,
                            },
                            {
                                text: "O Fargate só disponibiliza GPU quando a task usa processadores ARM Graviton.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação diferencia corretamente o AWS Fargate do AWS Lambda?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O Fargate executa containers de longa duração, sem limite de tempo de execução, enquanto o Lambda executa funções com limite de 15 minutos por invocação.",
                                isCorrect: true,
                            },
                            {
                                text: "O Fargate exige o gerenciamento das VMs subjacentes, enquanto o Lambda é totalmente serverless.",
                                isCorrect: false,
                            },
                            {
                                text: "O Lambda executa containers de longa duração e o Fargate executa apenas funções event-driven.",
                                isCorrect: false,
                            },
                            {
                                text: "O Fargate tem limite de 15 minutos por execução, enquanto o Lambda roda sem limite de tempo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS Lambda - Compute Serverless",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nO **Lambda** roda o seu código **sem que você gerencie servidor nenhum**. Você sobe uma **função**, ela é acionada por um **evento** (uma chamada HTTP, um upload no S3, uma fila, um agendamento, etc.), executa e você **paga só pelo tempo de execução**. O limite por execução é de **15 minutos**. É a forma mais "alto nível" de compute na AWS. Junto com o **Fargate** e o **EC2**, forma a trindade do "como rodar código".',
                    },
                    {
                        type: "text",
                        value: '## 1. O que é serverless (de verdade)\n\n**"Serverless"** **não** quer dizer "sem servidor". Quer dizer **"você não vê, não cria e não gerencia servidor"**. A AWS faz tudo por baixo:\n\n- Aloca compute para rodar a sua função.\n- Escala de 0 a milhares de execuções simultâneas em segundos.\n- Desliga os "servidores" depois, então você não paga por capacidade ociosa.\n- Aplica patches, monitora e replica em múltiplas AZs.',
                    },
                    {
                        type: "quote",
                        value: "**Modelo de cobrança que define serverless:** você paga por **invocação + GB-segundo de execução**. Função parada (idle) significa **pagar zero**.",
                    },
                    { type: "text", value: "## 2. Como funciona" },
                    {
                        type: "code",
                        value: '1. Você escreve uma função (Python, Node, Java, .NET, Go, Ruby, custom runtime)\n   ▼\n2. Faz upload (ZIP ou imagem container até 10 GB)\n   ▼\n3. Configura um TRIGGER (o que dispara a função)\n   ▼\n4. Quando o trigger dispara:\n   - AWS aloca um "container" (ms a segundos)\n   - Roda seu código (até 15 min de timeout)\n   - Retorna resultado\n   - Mata o container (ou mantém quente pra próximo invoke)\n   ▼\n5. Você paga: invocações × GB-segundos consumidos',
                    },
                    { type: "text", value: "### Anatomia de uma função Lambda" },
                    {
                        type: "code",
                        value: 'def lambda_handler(event, context):\n    # event = dado do trigger (S3 object, HTTP request, etc.)\n    # context = info de runtime (request id, tempo restante, etc.)\n\n    # sua lógica aqui...\n\n    return {"statusCode": 200, "body": "Hello!"}',
                    },
                    {
                        type: "text",
                        value: "## 3. Triggers (origens do evento)\n\nO Lambda pode ser disparado por **centenas** de fontes:",
                    },
                    {
                        type: "table",
                        value: '[["Categoria","Triggers comuns"],["**HTTP**","API Gateway, ALB, Lambda Function URL"],["**Storage**","S3 (object created/deleted), DynamoDB Streams"],["**Mensageria**","SQS, SNS, Kinesis, Amazon MQ"],["**Eventos**","EventBridge, CloudWatch Events"],["**Agendado**","EventBridge Scheduler (cron na nuvem)"],["**Auth**","Cognito triggers (pre-signup, post-confirmation)"],["**AWS services**","CloudFormation, CodeDeploy, IoT, Step Functions, e mais"]]',
                    },
                    {
                        type: "quote",
                        value: "**Modelos de invocação:**\n- **Síncrono** - o chamador espera a resposta (API Gateway → Lambda → resposta)\n- **Assíncrono** - o chamador dispara e segue em frente (S3 upload → Lambda processa em paralelo)\n- **Streaming/Poll-based** - o Lambda lê do SQS/Kinesis/DynamoDB Streams continuamente",
                    },
                    { type: "text", value: "## 4. Limites importantes (cai na prova!)" },
                    {
                        type: "table",
                        value: '[["Limite","Valor"],["**Timeout máximo**","**15 minutos**"],["**Memória**","128 MB a **10 GB** (vCPU escala com memória)"],["**Tamanho do package ZIP**","50 MB (zipado) / 250 MB (descompactado)"],["**Tamanho do container image**","**10 GB**"],["**Variáveis de ambiente**","4 KB total"],["**Storage temporário (/tmp)**","512 MB padrão, até 10 GB com config"],["**Concorrência por região**","1000 (default, pode aumentar via support)"],["**Payload (sync invocation)**","6 MB request/response"]]',
                    },
                    {
                        type: "quote",
                        value: "**Pegadinha mais importante:** **15 minutos é o teto absoluto**. Se a tarefa demorar mais que isso, **não é Lambda**. Use ECS/Fargate ou EC2.",
                    },
                    { type: "text", value: "## 5. Cold start vs Warm start" },
                    {
                        type: "code",
                        value: 'Primeira invocação após período idle:\n  1. AWS provisiona "execution environment" (1-3s)\n  2. Carrega seu código\n  3. Inicializa runtime (Python/Node/etc.)\n  4. Chama seu handler  ◄── total ~1-10s\n\nInvocação seguinte (poucos minutos depois):\n  Container já tá quente → chama handler direto ◄── ~ms',
                    },
                    {
                        type: "text",
                        value: "O **cold start** incomoda em apps voltados ao usuário que são sensíveis a latência. Formas de reduzir esse efeito:\n\n- **Provisioned Concurrency**: você paga para manter N containers sempre quentes.\n- **SnapStart** (só para Java): tira um snapshot do estado já inicializado e o restaura quase na hora.\n- Usar **linguagens mais leves** (Node e Python iniciam mais rápido que Java e .NET).\n- Reduzir as **dependências** que são carregadas.\n\n## 6. Pricing\n\nVocê paga **dois componentes**:",
                    },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Requests**","$0.20 por **1 milhão** de invocações (regiões US)"],["**Duration**","$/GB-segundo conforme memória alocada × tempo executado"]]',
                    },
                    {
                        type: "text",
                        value: "**Free tier permanente:** 1 milhão de requests por mês, mais 400.000 GB-segundos. Isso é suficiente para muitos projetos pequenos.",
                    },
                    {
                        type: "quote",
                        value: '**Cobrança de duration:** 1 GB de memória rodando por 1 segundo é igual a "1 GB-segundo". A vCPU **escala proporcionalmente** com a memória, então mais memória significa mais CPU e execução mais rápida. Às vezes vale a pena **aumentar a memória para reduzir a duration**, com custo igual ou até menor.',
                    },
                    { type: "text", value: "## 7. Lambda vs Fargate vs EC2 - a decisão clássica" },
                    {
                        type: "table",
                        value: '[["Critério","**Lambda**","**Fargate**","**EC2**"],["Unidade","**Função** (código)","**Container**","**VM completa**"],["Tempo máximo","**15 min**","**Sem limite**","Sem limite"],["Startup","ms a 10s (cold start)","~30s primeira task","~1 min"],["Quem gerencia compute","AWS, **invisível**","AWS","**Você**"],["Cobrança","Por invocação + GB-segundo","Por vCPU-segundo + GB-segundo","Por instância (segundo/hora)"],["Idle = paga zero?","**Sim**","Sim (quando task para)","Não (paga pela instância)"],["Estado/conexões","**Stateless** (efêmero, /tmp some)","Pode manter conexão","Total controle"],["Linguagens","Runtimes AWS ou custom","**Qualquer** (sua imagem Docker)","Qualquer"],["Quando usar","Event-driven, jobs curtos, glue de serviços","Workloads de longa duração, microsserviços","Controle total, GPU, legacy"]]',
                    },
                    { type: "text", value: "### Regra prática" },
                    {
                        type: "code",
                        value: "Sua workload roda < 15 min, é event-driven, idle a maior parte do tempo?\n       └── SIM → Lambda\n       └── NÃO ↓\n\nPrecisa controlar SO, GPU, ou tem app legacy que exige VM?\n       └── SIM → EC2\n       └── NÃO → Fargate",
                    },
                    {
                        type: "text",
                        value: '## 8. Casos de uso clássicos\n\n- **API REST leve** (API Gateway → Lambda → DynamoDB).\n- **Processamento de upload** (S3 trigger → Lambda redimensiona a imagem).\n- **ETL de pequeno porte** (S3 / DynamoDB Streams → Lambda).\n- **Cron na nuvem** (EventBridge Scheduler → Lambda às 3h da manhã).\n- **Webhooks** (recebe um POST, processa e responde).\n- **Chatbots** (Slack/Discord → Lambda).\n- **Backend serverless completo** (combinado com DynamoDB, S3 e Cognito).\n- **Glue entre serviços** (SNS → Lambda → API externa).\n- **CI/CD steps** customizados.\n\n**NÃO é ideal para:**\n- Processos com mais de 15 min (use Fargate ou EC2).\n- Workloads CPU-bound de alto volume contínuo (o Fargate fica mais barato).\n- Apps stateful que mantêm conexões longas (WebSocket persistente, por exemplo; use ALB → Fargate).\n- Quando precisa de **GPU** (o Lambda não tem).\n- Quando o overhead do cold start é inaceitável e a provisioned concurrency fica cara.\n\n## 9. Pegadinhas comuns da prova\n\n1. **"Processo longo (> 15 min) que precisa rodar na AWS"** → **NÃO é Lambda**. Use Fargate ou EC2.\n2. **"API leve, paga só quando alguém usa"** → **Lambda** (com API Gateway).\n3. **"Toda vez que sobe arquivo no S3, processar"** → **Lambda** com trigger S3.\n4. **"Cron na nuvem (rodar todo dia às 3h)"** → **EventBridge Scheduler → Lambda**.\n5. **"Compute serverless de containers"** → **Fargate** (não Lambda; o Lambda também é serverless, mas é função).\n6. **"Lambda vs Fargate?"** → Lambda é função de menos de 15 min, event-driven. Fargate é container de longa duração.\n7. **"Cobrança de Lambda"** → por invocação + GB-segundo. **Idle = grátis**.\n8. **"Limite máximo de memória?"** → **10 GB**.\n9. **"Cold start, como mitigar?"** → **Provisioned Concurrency** (paga para manter quente).\n10. **"Lambda precisa de VPC?"** → **Não necessariamente**. Só quando precisa acessar um recurso **dentro de uma VPC** (RDS privado, ElastiCache).\n11. **"Lambda Function URL"** → um endpoint HTTPS público nativo, sem API Gateway (alternativa simples).\n12. **"Linguagens suportadas"** → **Python, Node.js, Java, .NET, Go, Ruby** mais custom runtime (qualquer linguagem via container).\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Lambda = serverless functions\n       Você sobe código, AWS executa quando trigger dispara\n       Paga por invocação + GB-segundo\n       Idle = grátis\n\nLimites-chave:\n  Timeout    → 15 min (regra de ouro: se passar disso, NÃO é Lambda)\n  Memória    → 128 MB a 10 GB (CPU escala junto)\n  Package    → 250 MB ZIP ou 10 GB imagem container\n  Concorrência → 1000 (default), pode aumentar\n\nTriggers comuns:\n  HTTP        → API Gateway, ALB, Function URL\n  Storage     → S3, DynamoDB Streams\n  Mensageria  → SQS, SNS, Kinesis\n  Agendado    → EventBridge Scheduler (cron)\n  Eventos     → EventBridge, CloudWatch Events\n\nLambda vs Fargate vs EC2:\n  Lambda  → função, < 15 min, event-driven, escala instantânea\n  Fargate → container, sem limite de tempo, ECS/EKS managed\n  EC2     → VM completa, controle total\n\nCold Start:\n  Primeira invocação após idle → 1-10s overhead\n  Mitigar: Provisioned Concurrency, SnapStart (Java), código mais leve\n\nAtalhos pra prova:\n  "API leve serverless"             → Lambda + API Gateway\n  "Trigger no upload S3"            → Lambda\n  "Cron na nuvem"                   → EventBridge Scheduler → Lambda\n  "Processo > 15 min"               → Fargate ou EC2 (Lambda NÃO)\n  "Container serverless"            → Fargate (Lambda também é serverless, mas é função)\n  "Paga só pelo uso real"           → Lambda (idle = $0)\n  "GPU"                             → NÃO Lambda. Use EC2 G/P',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa precisa rodar um job de processamento que leva cerca de 30 minutos para concluir e avalia usar o AWS Lambda. Qual limitação torna o Lambda inadequado para essa tarefa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O tempo máximo de execução de uma função Lambda é de 15 minutos.",
                                isCorrect: true,
                            },
                            {
                                text: "O Lambda executa apenas funções escritas em Python.",
                                isCorrect: false,
                            },
                            {
                                text: "O Lambda não tem permissão para acessar dados armazenados no S3.",
                                isCorrect: false,
                            },
                            {
                                text: "O Lambda exige que você provisione e ligue uma instância antes de cada execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação descreve corretamente o modelo de cobrança do AWS Lambda?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Você paga pelo número de invocações mais o tempo de execução em GB-segundo, e não paga nada enquanto a função fica ociosa.",
                                isCorrect: true,
                            },
                            {
                                text: "Você paga uma taxa fixa mensal por função, independente de quantas vezes ela é chamada.",
                                isCorrect: false,
                            },
                            {
                                text: "Você paga por uma instância reservada que fica disponível para a função 24 horas por dia.",
                                isCorrect: false,
                            },
                            {
                                text: "Você paga somente pelo espaço usado para armazenar o código da função.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um sistema precisa gerar uma miniatura sempre que um usuário envia uma imagem para um bucket S3, sem manter nenhum servidor ligado o tempo todo aguardando arquivos. Qual solução atende melhor esse cenário?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Configurar um trigger no S3 que invoca uma função Lambda a cada novo objeto criado no bucket.",
                                isCorrect: true,
                            },
                            {
                                text: "Manter uma instância EC2 ligada 24 horas por dia rodando um script que fica verificando o bucket.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar o S3 Glacier para redimensionar a imagem no momento do upload.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar uma tabela no DynamoDB que redimensiona as imagens automaticamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma API voltada ao usuário, feita com API Gateway e Lambda, sofre com latência alta nas primeiras chamadas depois de períodos de ociosidade (cold start). Qual recurso reduz esse efeito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Provisioned Concurrency, que mantém um número definido de ambientes de execução sempre prontos e aquecidos.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o timeout da função de 15 para 30 minutos.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o armazenamento temporário (/tmp) alocado para a função.",
                                isCorrect: false,
                            },
                            {
                                text: "Alterar a classe de armazenamento da função para S3 Standard-IA.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No AWS Lambda, qual é o valor máximo de memória que pode ser configurado para uma única função?",
                        difficulty: "facil",
                        options: [
                            { text: "10 GB.", isCorrect: true },
                            { text: "512 MB.", isCorrect: false },
                            { text: "3 GB.", isCorrect: false },
                            { text: "128 GB.", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Mensageria - Amazon SQS e Amazon SNS",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA **mensageria** existe para **desacoplar** componentes. Em vez de o serviço A chamar direto o serviço B (o que é acoplado, síncrono e frágil), o A **deposita uma mensagem** que o B consome quando puder. **SQS = fila** (modelo pull, uma mensagem por consumidor). **SNS = tópico** (modelo push, N inscritos recebem a mesma mensagem). Combinados no padrão **fan-out**, resolvem 90% dos cenários assíncronos.",
                    },
                    {
                        type: "text",
                        value: "## 1. O problema do acoplamento (e por que mensageria resolve)\n\n### Acoplado (síncrono)",
                    },
                    {
                        type: "code",
                        value: "Frontend ──▶ API ──▶ Processa pagamento ──▶ Manda email ──▶ Atualiza estoque\n                          ▲ se este falha, TODO o request falha\n                          ▲ resposta demora a soma de tudo",
                    },
                    { type: "text", value: "### Desacoplado (mensageria)" },
                    {
                        type: "code",
                        value: "Frontend ──▶ API ──▶ Salva pedido + publica mensagem ──▶ retorna 200 OK\n                                  │\n                                  ├──▶ Worker de pagamento (assíncrono)\n                                  ├──▶ Worker de email (assíncrono)\n                                  └──▶ Worker de estoque (assíncrono)",
                    },
                    {
                        type: "text",
                        value: '**Benefícios:**\n- **A falha em um worker não derruba o pedido**, porque a mensagem fica na fila para ser reprocessada.\n- **A latência da resposta é só a do "salva + publica"**.\n- **Cada worker escala de forma independente**.\n- **Dá para adicionar ou remover consumidores sem mexer no produtor**.\n\n## 2. Amazon SQS - Simple Queue Service (FILA)',
                    },
                    {
                        type: "quote",
                        value: "Fila distribuída e totalmente gerenciada. Os produtores **enviam mensagens** e os consumidores **puxam (pull)** e processam.",
                    },
                    { type: "text", value: "### Como funciona" },
                    {
                        type: "code",
                        value: "Produtor ──┐\nProdutor ──┼──▶ ┌──────────────────────────┐ ──▶ Consumidor (uma só\nProdutor ──┘    │   Fila SQS                │      pega a mensagem)\n                │   [msg1][msg2][msg3][...]  │\n                └──────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: '**Características-chave:**\n- **Cada mensagem é entregue a UM consumidor** (não é fan-out).\n- A mensagem fica na fila até **alguém ler E confirmar o processamento (delete)**.\n- Retenção: de **1 minuto a 14 dias** (o padrão é 4 dias).\n- Tamanho máximo da mensagem: **256 KB** (dá para estender até 2 GB usando o S3).\n- **Sem limite de mensagens** na fila (escala infinita).\n\n### Visibility Timeout\n\nQuando um consumidor "pega" uma mensagem, ela fica **invisível** para os outros consumidores por X segundos (o padrão é 30s). A partir daí, se o consumidor:\n- **Processa e deleta** → a mensagem some.\n- **Não faz nada (falha)** → quando o timeout expira, a mensagem volta a ficar visível e outro consumidor a pega.\n\n### Dois tipos de fila SQS',
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Ordenação garantida","Entrega exata","Throughput","Caso de uso"],["**Standard**","**Best-effort** (pode chegar fora de ordem)","At-least-once (pode duplicar)","**Quase ilimitado**","A maioria dos casos"],["**FIFO**","**Garantida**","**Exactly-once**","300 msg/seg (3000 com batching)","Quando ordem importa (financeiro, comandos)"]]',
                    },
                    {
                        type: "text",
                        value: "FIFO é a sigla de First In, First Out, ou seja, a primeira mensagem a entrar é a primeira a sair.\n\n### Dead Letter Queue (DLQ)\n\nUma mensagem que falhou X vezes (o maxReceiveCount) vai para **outra fila**, a DLQ (Dead Letter Queue). Você a investiga depois, com calma, sem travar o processamento normal.\n\n### Casos de uso clássicos\n\n- **Decoupling** entre microsserviços.\n- **Buffer** entre o frontend e os workers de processamento.\n- **Tarefas batch** (rendering, ETL, envio de email).\n- **Picos de tráfego** que passam da capacidade do consumidor.\n\n## 3. Amazon SNS - Simple Notification Service (TÓPICO)",
                    },
                    {
                        type: "quote",
                        value: "Serviço de **pub/sub** (publish/subscribe). Os publishers mandam a mensagem para um **tópico**, e **todos os subscribers recebem a mesma mensagem**.",
                    },
                    { type: "text", value: "### Como funciona" },
                    {
                        type: "code",
                        value: "                        ┌──────────────┐\n                        │   Tópico SNS │\n                        └──────┬───────┘\n                               │  publica\n   Publisher ────────────────▶ │\n                               │ broadcast\n                ┌──────────────┼───────────────┐\n                ▼              ▼               ▼\n            Subscriber 1   Subscriber 2   Subscriber 3\n            (Lambda)       (SQS queue)    (Email)",
                    },
                    {
                        type: "text",
                        value: "**Características-chave:**\n- É **push**, então você não precisa puxar nada.\n- Faz **fan-out**, ou seja, uma mensagem vai para **N subscribers**.\n- Os subscribers podem ser: **Lambda, SQS, endpoint HTTP/HTTPS, email, SMS, mobile push (APNs/FCM) e Firehose**.\n- **Não tem armazenamento**: se ninguém estava inscrito quando a mensagem foi publicada, ela some.\n\n### Mensagem filtering\n\nOs subscribers podem definir **filter policies** para receber só as mensagens que batem com certos critérios (atributos da mensagem). Isso é útil para rotear dentro do tópico, em vez de criar um tópico por tipo de evento.\n\n### Casos de uso clássicos\n\n- **Notificações** (push mobile, email, SMS).\n- **Fan-out de eventos** (1 evento faz vários sistemas reagirem).\n- **Alertas** (CloudWatch → SNS → email/SMS para a equipe).\n- **Broadcast para vários microsserviços**.\n\n## 4. SQS vs SNS - comparação direta",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**SQS**","**SNS**"],["Padrão","**Fila** (1-pra-1)","**Tópico pub/sub** (1-pra-N)"],["Modelo de entrega","**Pull** (consumidor puxa)","**Push** (subscribers recebem na hora)"],["Armazena mensagem?","**Sim** (até 14 dias)","**Não** - se ninguém ouvir, some"],["Consumidores por msg","**1** (próximo a pegar leva)","**N** (todos os inscritos recebem)"],["Use case típico","Workers processando tarefas em background","Notificações, fan-out, alertas"],["Garantia de processamento","Sim (mensagem fica até ser deletada)","Não (se subscriber falha, perde-se a entrega pra ele)"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Padrão **Fan-Out** (SNS + SQS combinados)\n\nEsse é o caso mais poderoso: um evento precisa ir para **vários workers, cada um com a sua própria fila**, para que cada um processe no seu ritmo.",
                    },
                    {
                        type: "code",
                        value: '                              ┌────────────────┐\n                              │   Tópico SNS   │\n                              │  "novo-pedido" │\n                              └───────┬────────┘\n                                      │ publica 1 mensagem\n                  ┌───────────────────┼─────────────────────┐\n                  ▼                   ▼                     ▼\n            SQS pagamento       SQS email             SQS estoque\n                  │                   │                     │\n                  ▼                   ▼                     ▼\n           Worker pagamento     Worker email          Worker estoque\n           (processa)           (processa)            (processa)',
                    },
                    {
                        type: "text",
                        value: "**Benefícios:**\n- Cada worker tem a **sua própria fila**, com o **seu próprio backlog** e o retry independente.\n- Adicionar um novo consumidor é só criar uma nova SQS e inscrevê-la no SNS, sem mexer nas outras.\n- A falha em um worker **não afeta os demais**.",
                    },
                    {
                        type: "quote",
                        value: "**Esse é o padrão de microsserviços orientado a eventos da AWS.** Cai em quase toda prova.",
                    },
                    { type: "text", value: "## 6. EventBridge (mencionar - não é SQS/SNS)" },
                    {
                        type: "quote",
                        value: "É a versão evoluída do SNS para **eventos entre serviços AWS**.",
                    },
                    {
                        type: "text",
                        value: "- Tem **schema de evento estruturado** (JSON com source, detail-type e detail).\n- Faz **roteamento avançado** por meio de regras e filtros.\n- Tem **integração nativa** com mais de 100 serviços AWS e SaaS de terceiros.\n- **Não substitui o SNS para notificações voltadas ao usuário final** (SMS, push, email); para isso continua o SNS.",
                    },
                    {
                        type: "quote",
                        value: '**Quando usar:** "**eventos entre serviços / SaaS**" leva a EventBridge. "**notificação para humano final**" leva a SNS. "**fila de tarefas**" leva a SQS.',
                    },
                    {
                        type: "text",
                        value: '## 7. Pegadinhas comuns da prova\n\n1. **"Desacoplar serviço A do serviço B (síncrono → assíncrono)"** → **SQS** (uma fila entre eles).\n2. **"Enviar a mesma mensagem para vários sistemas distintos"** → **SNS** (fan-out).\n3. **"Email/SMS/push para o usuário final"** → **SNS** (não SQS).\n4. **"Garantir a ordem das mensagens"** → **SQS FIFO**.\n5. **"Processar exatamente uma vez (sem duplicação)"** → **SQS FIFO**.\n6. **"Mensagem que falhou muito vai para outra fila para investigar"** → **Dead Letter Queue (DLQ)**.\n7. **"Salvar a mensagem por até 14 dias"** → **SQS** (o SNS não armazena).\n8. **"Pico de tráfego passa da capacidade do worker"** → SQS como buffer (o worker consome no seu ritmo).\n9. **"Quero que cada um dos 5 microsserviços receba o evento na sua própria fila"** → **SNS + SQS fan-out**.\n10. **"Eventos entre serviços AWS com filtros complexos"** → **EventBridge**.\n11. **"Mensagem maior que 256 KB"** → o SQS suporta com o Extended Client + S3.\n12. **"SNS sem subscribers ativos recebe uma mensagem, o que acontece?"** → ela **some** (o SNS não armazena).\n\n## 8. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'SQS = FILA\n       Pull, 1 consumidor por mensagem\n       Armazena até 14 dias\n       Standard (best-effort ordem, infinito) ou FIFO (ordem + exactly-once, 300/seg)\n       Visibility Timeout, Dead Letter Queue (DLQ)\n       Caso clássico: workers processando tarefas em background\n\nSNS = TÓPICO PUB/SUB\n       Push, fan-out (1 → N subscribers)\n       NÃO armazena (se ninguém ouve, perde)\n       Subscribers: Lambda, SQS, HTTP, email, SMS, push mobile\n       Caso clássico: notificações, alertas, broadcast\n\nFan-Out (SNS + SQS):\n       1 evento publicado no SNS\n       → várias SQS inscritas (uma por consumidor)\n       → cada worker processa no seu ritmo\n       Padrão de microsserviços event-driven AWS\n\nEventBridge:\n       Versão "avançada" do SNS para eventos entre serviços AWS\n       Roteamento por regra/filtro, integração nativa SaaS\n\nAtalhos pra prova:\n  "desacoplar / buffer"                   → SQS\n  "fan-out / pub-sub"                     → SNS\n  "ordem garantida"                       → SQS FIFO\n  "email/SMS pra usuário"                 → SNS\n  "broadcast pra vários workers + filas"  → SNS + SQS fan-out\n  "eventos entre serviços AWS / SaaS"     → EventBridge\n  "DLQ"                                   → recurso do SQS pra falhas',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma equipe quer desacoplar dois microsservicos colocando uma fila entre eles. Cada mensagem deve ser entregue a um unico consumidor, que a puxa da fila e a remove apos processa-la. Qual servico da AWS atende esse cenario?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon SQS", isCorrect: true },
                            { text: "Amazon SNS", isCorrect: false },
                            { text: "Amazon EventBridge", isCorrect: false },
                            { text: "AWS Lambda", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Ao confirmar um pedido, a aplicacao precisa enviar a mesma notificacao por email e por SMS diretamente para o usuario final. Qual servico da AWS e o indicado para essa tarefa?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon SQS", isCorrect: false },
                            { text: "Amazon SNS", isCorrect: true },
                            { text: "Amazon EventBridge", isCorrect: false },
                            { text: "Amazon CloudWatch", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um sistema financeiro exige que as mensagens sejam processadas exatamente na ordem em que foram enviadas e uma unica vez, sem duplicacao. Qual opcao atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            { text: "Fila SQS Standard", isCorrect: false },
                            { text: "Topico Amazon SNS", isCorrect: false },
                            { text: "Fila SQS FIFO", isCorrect: true },
                            { text: "Amazon EventBridge", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Quando um novo pedido e criado, cinco microsservicos distintos precisam reagir ao evento, e cada um deve consumir no seu proprio ritmo, com a sua propria fila e backlog independente. Qual arquitetura da AWS resolve isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma unica fila SQS compartilhada pelos cinco microsservicos",
                                isCorrect: false,
                            },
                            {
                                text: "Fazer o produtor chamar os cinco microsservicos diretamente por HTTP",
                                isCorrect: false,
                            },
                            {
                                text: "Um topico SNS com uma fila SQS separada inscrita para cada microsservico",
                                isCorrect: true,
                            },
                            {
                                text: "Publicar o evento em cinco topicos SNS distintos, um por microsservico",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Algumas mensagens de uma fila SQS falham repetidamente ao serem processadas. A equipe quer que, depois de um numero maximo de tentativas, essas mensagens sejam movidas automaticamente para outra fila e investigadas mais tarde, sem travar o fluxo normal. Qual recurso do SQS faz isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Visibility Timeout", isCorrect: false },
                            { text: "Periodo de retencao de 14 dias", isCorrect: false },
                            { text: "Fila SQS FIFO", isCorrect: false },
                            { text: "Dead Letter Queue (DLQ)", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "EC2 - Tipos de Instância",
                blocks: [
                    { type: "text", value: "# EC2 - Tipos de Instância" },
                    {
                        type: "quote",
                        value: "**EC2 (Elastic Compute Cloud)** é o serviço da AWS de servidores virtuais sob demanda, e cada servidor virtual desses é chamado de **instância**. Você escolhe o **tipo de instância** de acordo com o perfil da sua carga de trabalho, ou seja, o quanto ela consome de CPU (o processador), memória, rede, disco e GPU (a placa de vídeo).",
                    },
                    {
                        type: "text",
                        value: '## 1. Famílias de instância\n\nA AWS organiza os tipos de instância em **5 categorias** principais. Cada categoria é representada por uma ou mais letras de família.\n\n### General Purpose (Uso geral) - `T`, `M`, `A`, `Mac`\n\nEssas instâncias equilibram **CPU, memória e rede**, sem dar preferência a um recurso só.\n\nElas atendem bem servidores web, ambientes de desenvolvimento e teste, microsserviços e pequenas bases de dados.\n\nDuas famílias se destacam:\n\n- **`T` (burstable, isto é, com capacidade de picos)**: a opção mais barata. Enquanto está ociosa, a instância acumula "créditos de CPU". Quando chega um pico de uso, ela gasta esses créditos para entregar mais desempenho por um tempo. É ideal para cargas variáveis, que ficam calmas na maior parte do tempo e só de vez em quando exigem força.\n- **`M`**: pensada para workload (carga de trabalho) constante, que precisa de desempenho estável o tempo todo, sem depender de burst.\n\n### Compute Optimized (Otimizado para CPU) - `C`\n\nA família `C` entrega a maior proporção de **CPU por dólar**, ou seja, mais capacidade de processamento para cada valor gasto.\n\nServe para processamento em lote (batch processing), servidores de mídia, modelagem científica, jogos multiplayer, **machine learning inference** (inferência de ML, aprendizado de máquina, que é rodar um modelo já treinado) e HPC (High Performance Computing, ou computação de alto desempenho).\n\n### Memory Optimized (Otimizado para memória) - `R`, `X`, `z1d`, `High Memory`\n\nEssas instâncias oferecem muita **RAM (a memória) por vCPU (CPU virtual)**. Cada núcleo de processamento vem com bastante memória à disposição.\n\nCasos de uso: bancos de dados em memória (Redis, Memcached), **SAP HANA**, análises in-memory (feitas diretamente na memória) e processamento de big data em tempo real.\n\n### Storage Optimized (Otimizado para armazenamento) - `I`, `D`, `H`\n\nTrazem discos locais do tipo NVMe (SSDs de alta velocidade) ou HDD (discos rígidos tradicionais), com **alto IOPS (operações de leitura e escrita por segundo) e alto throughput (volume de dados movido por segundo)**.\n\nCasos de uso: bancos NoSQL (Cassandra, MongoDB), data warehouses (grandes repositórios de dados voltados para análise), sistemas de arquivos distribuídos e Hadoop.\n\n### Accelerated Computing (Computação acelerada) - `P`, `G`, `Inf`, `Trn`, `F`\n\nUsam **GPUs (placas de vídeo) ou FPGAs (chips que podem ser reprogramados para tarefas específicas)** para dar conta de tarefas paralelas pesadas.\n\nCasos de uso: **deep learning** (aprendizado profundo), tanto no treinamento quanto na inferência do modelo, renderização gráfica, simulações e transcodificação de vídeo (conversão de vídeo de um formato para outro).\n\n## 2. Convenção de nomes\n\nO nome de cada instância segue um padrão que já diz bastante sobre ela. Veja o exemplo **`m5.xlarge`**, que se lê em três partes:',
                    },
                    {
                        type: "table",
                        value: '[["Parte","Significado"],["`m`","Família (general purpose)"],["`5`","Geração (quanto maior, mais novo e geralmente melhor)"],["`xlarge`","Tamanho (nano, micro, small, medium, large, xlarge, ...)"]]',
                    },
                    {
                        type: "text",
                        value: "Fora essas três partes, letras extras podem aparecer para indicar atributos especiais:\n\n- `m5n.large`: rede acelerada.\n- `c6g.large`: processador Graviton, baseado na arquitetura ARM.\n- `r5d.large`: vem com disco NVMe local.\n- `m6i.large`: processador Intel.\n\n## 3. Opções de compra (cai muito na prova)\n\nA AWS oferece várias formas de pagar por uma instância EC2. Qual delas compensa depende de dois fatores: o quanto a sua carga de trabalho é previsível e o quanto você aceita se comprometer com prazos.",
                    },
                    {
                        type: "table",
                        value: '[["Opção","Quando usar","Economia vs On-Demand"],["**On-Demand**","Cargas curtas, imprevisíveis, sem compromisso","Baseline"],["**Reserved Instances**","Cargas estáveis por **1 ou 3 anos** (compromisso)","Até ~72%"],["**Savings Plans**","Compromisso de **gasto por hora** (mais flexível que RI; vale para EC2, Fargate, Lambda)","Até ~72%"],["**Spot Instances**","Cargas **tolerantes a interrupção** (batch, CI, big data). AWS pode encerrar a qualquer momento.","Até ~90%"],["**Dedicated Hosts**","Hardware físico **exclusivo** (questões de licenciamento BYOL ou compliance)","Mais caro"],["**Dedicated Instance**","VM isolada em hardware dedicado, **sem controle do host** físico","Intermediário"],["**Capacity Reservation**","Reserva de capacidade em uma AZ específica (sem desconto, garante disponibilidade)","Sem desconto"]]',
                    },
                    {
                        type: "text",
                        value: 'Traduzindo os termos menos óbvios da tabela:\n\n- **RI**: forma curta de Reserved Instances.\n- **BYOL** (Bring Your Own License): "traga sua própria licença", reaproveitar na AWS uma licença de software que você já possui.\n- **Compliance**: conformidade com normas legais, de segurança ou de auditoria.\n- **CI** (Continuous Integration): integração contínua, a automação que compila e testa o código a cada mudança.\n- **VM** (Virtual Machine): máquina virtual.\n- **AZ** (Availability Zone): Zona de Disponibilidade, um dos data centers isolados de uma região da AWS.\n\n## 4. Pontos que costumam cair na prova\n\nEstes são os pares família e caso de uso que mais aparecem nas questões:\n\n- **T (burstable)** → cargas variáveis, com momentos ociosos entre os picos.\n- **C** → cargas que exigem muita CPU (CPU-intensivo).\n- **R / X** → cargas que exigem muita memória (memória-intensivo). Lembre: **SAP HANA = `X`**.\n- **I / D** → I/O (leitura e escrita) pesado de disco local.\n- **P / G** → machine learning (ML) e GPU.\n- **Spot** → workload **interruptível**, que aguenta ser encerrado no meio (ex.: render farm, jobs batch).\n- **Reserved** → workload **previsível** de longo prazo.\n- **Savings Plans** → mais flexível que RI, e também vale para Lambda e Fargate.\n- **Dedicated Host** ≠ **Dedicated Instance**: o Host expõe o servidor físico (licenças BYOL); a Instance só garante o isolamento.\n\n## 5. Resumo rápido (cheat sheet)\n\nGuarde este quadro para revisar rápido antes da prova:',
                    },
                    {
                        type: "code",
                        value: "General Purpose  →  T, M       →  web, app, dev\nCompute Optim.   →  C          →  CPU heavy, HPC, ML inference\nMemory Optim.    →  R, X       →  banco de dados, in-memory, SAP HANA\nStorage Optim.   →  I, D, H    →  NoSQL, big data, data warehouse\nAccelerated      →  P, G, Inf  →  GPU, ML training, render",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma aplicação web de baixo tráfego fica ociosa na maior parte do tempo e sofre picos de uso apenas em alguns momentos do dia. Qual tipo de instância EC2 acumula créditos de CPU durante a ociosidade para entregar desempenho extra nos picos, com o menor custo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Instâncias otimizadas para computação (família C)",
                                isCorrect: false,
                            },
                            {
                                text: "Instâncias burstable de uso geral (família T)",
                                isCorrect: true,
                            },
                            {
                                text: "Instâncias otimizadas para memória (família R)",
                                isCorrect: false,
                            },
                            {
                                text: "Instâncias otimizadas para armazenamento (família I)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa vai migrar o SAP HANA e um banco de dados em memória que exigem grande quantidade de RAM por vCPU. Qual categoria de instâncias EC2 é a mais indicada?",
                        difficulty: "medio",
                        options: [
                            { text: "Otimizadas para memória (famílias R e X)", isCorrect: true },
                            { text: "Otimizadas para computação (família C)", isCorrect: false },
                            { text: "Uso geral (família M)", isCorrect: false },
                            { text: "Otimizadas para armazenamento (família D)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe de pesquisa precisa treinar modelos de deep learning e fazer renderização gráfica aproveitando o processamento paralelo de GPUs. Qual categoria de instâncias EC2 atende a essa carga?",
                        difficulty: "medio",
                        options: [
                            { text: "Otimizadas para computação (família C)", isCorrect: false },
                            { text: "Otimizadas para memória (família X)", isCorrect: false },
                            { text: "Computação acelerada (famílias P e G)", isCorrect: true },
                            { text: "Uso geral (família T)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma carga de trabalho com uso intensivo de CPU, como transcodificação de mídia, modelagem científica de alto desempenho (HPC) e servidores de jogos dedicados, exige alta capacidade de processamento por vCPU. Qual família de instâncias EC2 é a mais indicada?",
                        difficulty: "facil",
                        options: [
                            { text: "Otimizadas para computação (família C)", isCorrect: true },
                            { text: "Uso geral (família M)", isCorrect: false },
                            { text: "Otimizadas para memória (família R)", isCorrect: false },
                            { text: "Otimizadas para armazenamento (família I)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um cluster de big data (Hadoop e Spark) e um data warehouse precisam de altíssimo IOPS e throughput a partir do armazenamento local anexado à instância. Qual família de instâncias EC2 atende melhor a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Otimizadas para armazenamento (famílias I e D)",
                                isCorrect: true,
                            },
                            { text: "Otimizadas para computação (família C)", isCorrect: false },
                            { text: "Otimizadas para memória (família R)", isCorrect: false },
                            { text: "Uso geral (família M)", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "EC2 - Purchase Options (Opções de compra)",
                blocks: [
                    {
                        type: "text",
                        value: "## EC2 - Purchase Options\n\n# EC2 - Purchase Options (Opções de compra)",
                    },
                    {
                        type: "quote",
                        value: "A AWS oferece **7 modelos de cobrança** para instâncias EC2 (Elastic Compute Cloud, o serviço de servidores virtuais da AWS). Escolher o modelo certo é uma das principais formas de **otimizar custo** na nuvem, e é um dos temas que **mais cai** na prova do Cloud Practitioner.",
                    },
                    {
                        type: "text",
                        value: "## 1. Panorama rápido\n\nA tabela abaixo resume os sete modelos. Pense nela como um mapa: cada linha mostra se existe algum compromisso de tempo, quanto de desconto o modelo dá em relação ao On-Demand e se a AWS pode desligar a instância no meio do uso.",
                    },
                    {
                        type: "table",
                        value: '[["Modelo","Compromisso","Desconto vs On-Demand","Pode ser interrompido?"],["**On-Demand**","Nenhum","0 % (baseline)","Não"],["**Reserved Instances**","1 ou 3 anos","Até ~72 %","Não"],["**Savings Plans**","1 ou 3 anos ($/h)","Até ~72 %","Não"],["**Spot Instances**","Nenhum","Até ~90 %","**Sim** (com 2 min de aviso)"],["**Dedicated Hosts**","On-Demand ou Reserved","Mais caro","Não"],["**Dedicated Instances**","Nenhum","Premium pequeno","Não"],["**Capacity Reservations**","Nenhum","0 % (sem desconto)","Não"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. On-Demand\n\nCom o On-Demand você paga apenas pelo que usar, sem contrato e sem prazo.\n\n- Você **paga por hora ou por segundo** de uso. Nas instâncias Linux, existe uma cobrança mínima de 60 segundos.\n- Não há **compromisso de longo prazo** nem pagamento antecipado.\n- É o preço por hora mais alto, mas em troca você ganha **flexibilidade máxima** para ligar e desligar quando quiser.\n\n### Casos de uso\n- Cargas de trabalho **curtas, imprevisíveis ou com picos** repentinos.\n- Ambientes de desenvolvimento, testes e POCs (Proof of Concept, ou provas de conceito).\n- Workloads (cargas de trabalho) **novos**, quando você ainda não conhece o consumo médio.",
                    },
                    {
                        type: "quote",
                        value: "É o modelo padrão. Se você não escolher nada, paga On-Demand.",
                    },
                    {
                        type: "text",
                        value: "## 3. Reserved Instances (RI)\n\nAs Reserved Instances, ou RI, são instâncias reservadas: você se compromete a usar por um bom tempo e ganha desconto em troca.\n\n- O compromisso é de **1 ou 3 anos** e fica preso a uma combinação de **família de instância + região** (e, se você quiser, também a uma AZ, sigla de Availability Zone, ou Zona de Disponibilidade).\n- O desconto chega a **até ~72 %** em relação ao On-Demand.\n- Há três formas de pagamento: **No Upfront** (nada adiantado), **Partial Upfront** (parte adiantada) e **All Upfront** (tudo adiantado). Quanto mais você paga na frente, maior o desconto.\n\n### Tipos de RI\nExistem dois tipos de RI. A coluna do meio mostra se dá para trocar a família ou o SO (sistema operacional) da instância depois de contratar.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Pode trocar família/SO?","Desconto"],["**Standard**","Não (só pode mudar tamanho dentro da família)","Maior"],["**Convertible**","Sim - pode trocar família, SO, tenancy","Menor"]]',
                    },
                    {
                        type: "text",
                        value: "### Atributos importantes\n- **Regional RI**: dá flexibilidade para aplicar o desconto em qualquer AZ da mesma região.\n- **Zonal RI**: além do desconto, também **reserva capacidade** em uma AZ específica. Em troca, você perde a flexibilidade entre AZs.\n- Se não precisar mais da reserva, você pode **vendê-la** no Reserved Instance Marketplace.\n\n### Casos de uso\n- Workloads **estáveis e previsíveis**, como produção rodando 24 horas por dia, 7 dias por semana.\n- Bancos de dados e servidores de aplicação principais (core).\n\n## 4. Savings Plans\n\nOs Savings Plans são um modelo mais flexível que a RI. Em vez de se comprometer com um tipo de instância, você se compromete com um valor de gasto por hora.\n\n- É o modelo **mais flexível** que a RI: o compromisso é por **gasto em dólar por hora ($/hora)**, e não por um tipo específico de instância.\n- O desconto é **igual ao da RI** (até ~72 %), também com contratos de **1 ou 3 anos**.\n- As opções de pagamento são as mesmas: No Upfront, Partial Upfront e All Upfront.\n\n### Tipos de Savings Plan",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Cobre","Flexibilidade","Desconto"],["**Compute Savings Plan**","EC2 + **Fargate** + **Lambda**, qualquer região","Máxima","Até ~66 %"],["**EC2 Instance Savings Plan**","Família específica em **uma região**","Restrita","Até ~72 %"],["**SageMaker Savings Plan**","SageMaker","Específica","Até ~64 %"]]',
                    },
                    {
                        type: "text",
                        value: "### RI vs Savings Plan (na prova)\n- **RI**: o compromisso é com a **instância**.\n- **Savings Plan**: o compromisso é com o **gasto em $/hora**. No caso do Compute Savings Plan, vale também para Lambda e Fargate.\n- Desde 2019, a AWS recomenda **Savings Plans para a maioria dos casos novos**.\n\n## 5. Spot Instances\n\nAs Spot Instances aproveitam a capacidade que está sobrando na AWS naquele momento, e por isso saem muito baratas.\n\n- Usam a **capacidade ociosa** da AWS, com **desconto de até ~90 %**.\n- Em compensação, **a AWS pode encerrar a instância a qualquer momento**. Você recebe um aviso de **2 minutos** antes (o Spot Interruption Notice, ou aviso de interrupção do Spot).\n- O preço varia conforme a oferta e a demanda.\n\n### Casos de uso (workloads que toleram interrupção)\n- Processamento em **batch** (em lote), como ETL (Extract, Transform, Load), render farms e transcoding.\n- Runners de **CI/CD** (integração e entrega contínuas).\n- Big data (EMR, Spark, Hadoop).\n- Treinamento de ML (Machine Learning, ou aprendizado de máquina) **com checkpoints**, ou seja, salvando o progresso de tempos em tempos.\n- **Sites stateless** (que não guardam estado) atrás de um Auto Scaling Group misto, combinando On-Demand + Spot.\n\n### NÃO usar Spot para:\n- Bancos de dados de produção.\n- Workloads **stateful** (que guardam estado) sem checkpointing.\n- Aplicações que **não toleram interrupção**.\n\n## 6. Dedicated Hosts\n\nUm Dedicated Host é um servidor físico inteiro reservado só para você.\n\n- É um **servidor físico inteiro dedicado a você**. Não é apenas uma VM (máquina virtual) isolada: é a máquina toda.\n- Você **enxerga o host** por dentro (os sockets e os cores físicos) e pode controlar onde cada instância roda.\n- É o **mais caro** de todos os modelos.\n\n### Casos de uso (são bem específicos!)\n- **Licenciamento BYOL** (Bring Your Own License, ou traga sua própria licença) cobrado por **socket ou por core**, como Windows Server, SQL Server e Oracle.\n- **Compliance** rigorosa (por exemplo PCI ou HIPAA, quando há exigência de isolamento físico).\n- Auditorias que exigem **hardware dedicado**.\n\n### Pagamento\n- Pode ser **On-Demand** (pago por hora do host) ou **Reserved** (contrato de 1 ou 3 anos).\n\n## 7. Dedicated Instances\n\nA Dedicated Instance também roda em hardware só seu, mas com menos controle do que o Dedicated Host.\n\n- É uma VM rodando em **hardware dedicado** a você, **mas você NÃO enxerga o host**.\n- A diferença para o Dedicated Host é o nível de controle: aqui você só tem a garantia de **isolamento físico** entre as suas VMs e as VMs de outros clientes.\n- Não dá para usar licenças BYOL por socket. Para isso você precisa de um **Dedicated Host**.\n\n### Casos de uso\n- Situações de compliance que exigem **isolamento de hardware**, mas em que você não precisa controlar o host físico.\n\n## 8. Capacity Reservations (On-Demand Capacity Reservations)\n\nAs Capacity Reservations garantem que a instância vai existir quando você precisar, mas não dão desconto.\n\n- **Reservam capacidade** em uma AZ específica, **sem nenhum desconto**.\n- Garantem que você **terá a instância disponível** mesmo em momentos de alta demanda.\n- Podem ser **combinadas** com Savings Plans ou RI, e aí você soma a garantia de capacidade com o desconto.\n\n### Casos de uso\n- **Eventos com pico planejado**, como Black Friday e lançamentos.\n- **DR (Disaster Recovery, ou recuperação de desastres)**, quando você quer ter certeza de que a capacidade vai existir na hora.\n- Workloads regulatórios que precisam rodar em uma AZ específica.",
                    },
                    {
                        type: "quote",
                        value: "**Não confunda** com Reserved Instances. A RI é um desconto financeiro. A Capacity Reservation é uma **garantia de capacidade física**, sem desconto.",
                    },
                    { type: "text", value: "## 9. Comparação rápida - RI vs Savings Plan vs Spot" },
                    {
                        type: "table",
                        value: '[["Critério","Reserved Instance","Savings Plan","Spot"],["Compromisso","1 / 3 anos","1 / 3 anos ($/h)","Nenhum"],["Desconto","Até ~72 %","Até ~72 %","Até ~90 %"],["Flexibilidade de família","Baixa (Standard) / Média (Convertible)","**Alta** (Compute SP)","Máxima"],["Cobre Fargate/Lambda?","Não","**Sim** (Compute SP)","Não"],["Pode ser interrompido?","Não","Não","**Sim** (2 min de aviso)"],["Garantia de capacidade?","Sim (Zonal)","Não","Não"]]',
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"Maior economia possível, workload tolerante a interrupção"** → **Spot** (até 90 %).\n2. **"Workload estável de longo prazo, máximo desconto, sem flexibilidade"** → **Standard Reserved Instance**.\n3. **"Workload estável mas posso precisar mudar tipo de instância"** → **Convertible RI** ou **Compute Savings Plan**.\n4. **"Licença Windows/Oracle baseada em core físico"** → **Dedicated Host** (não Dedicated Instance!).\n5. **"Compliance exige isolamento de hardware mas não preciso ver o host"** → **Dedicated Instance**.\n6. **"Quero garantir capacidade para Black Friday"** → **On-Demand Capacity Reservation** (sem desconto) ou **Zonal RI** (com desconto).\n7. **"Quero economizar em Lambda e Fargate também"** → **Compute Savings Plan**.\n8. **"Spot pode rodar produção web?"** → Só se for **stateless** e atrás de **Auto Scaling Group misto** com fallback para On-Demand.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: "On-Demand          → flexibilidade total, sem desconto\nReserved (1/3 yr)  → compromisso de instância → -72%\nSavings Plan       → compromisso de gasto → -72% (cobre Lambda/Fargate)\nSpot               → capacidade ociosa → -90%, pode ser encerrado\nDedicated Host     → servidor físico dedicado → BYOL, compliance\nDedicated Instance → VM isolada em HW dedicado → compliance sem BYOL\nCapacity Reserv.   → garantia de capacidade, SEM desconto",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa executa jobs de processamento em lote (ETL) que salvam checkpoints e toleram interrupcoes. O objetivo e reduzir ao maximo o custo por instancia EC2. Qual opcao de compra e a mais indicada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Reserved Instances Standard, pelo compromisso de 1 ou 3 anos",
                                isCorrect: false,
                            },
                            {
                                text: "Spot Instances, que usam capacidade ociosa da AWS com desconto de ate cerca de 90%",
                                isCorrect: true,
                            },
                            {
                                text: "On-Demand, por nao exigir compromisso de longo prazo",
                                isCorrect: false,
                            },
                            {
                                text: "Dedicated Hosts, por reservarem um servidor fisico inteiro",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual opcao de compra do EC2 e o modelo padrao, cobra por hora ou por segundo, nao exige compromisso de longo prazo e e indicada para cargas curtas ou imprevisiveis?",
                        difficulty: "facil",
                        options: [
                            { text: "On-Demand", isCorrect: true },
                            {
                                text: "Reserved Instances, com compromisso de 1 ou 3 anos",
                                isCorrect: false,
                            },
                            {
                                text: "Savings Plans, com compromisso de gasto por hora",
                                isCorrect: false,
                            },
                            {
                                text: "Spot Instances, que podem ser encerradas com 2 minutos de aviso",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As Reserved Instances tem dois tipos. Uma equipe quer manter o compromisso de 1 ou 3 anos, mas poder trocar a familia da instancia, o sistema operacional e a tenancy durante o contrato. Qual tipo atende esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Standard Reserved Instance, que so permite mudar o tamanho dentro da mesma familia",
                                isCorrect: false,
                            },
                            {
                                text: "Regional Reserved Instance, que aplica o desconto em qualquer AZ da regiao",
                                isCorrect: false,
                            },
                            { text: "Convertible Reserved Instance", isCorrect: true },
                            {
                                text: "Zonal Reserved Instance, que reserva capacidade em uma AZ especifica",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual opcao de compra oferece desconto de longo prazo com compromisso de gasto por hora (em dolares) e, no seu tipo Compute, tambem cobre o uso de AWS Lambda e AWS Fargate, alem do EC2?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Reserved Instances, cujo compromisso e com um tipo de instancia",
                                isCorrect: false,
                            },
                            {
                                text: "On-Demand Capacity Reservations, que garantem capacidade sem desconto",
                                isCorrect: false,
                            },
                            {
                                text: "Spot Instances, que aproveitam capacidade ociosa da AWS",
                                isCorrect: false,
                            },
                            { text: "Compute Savings Plan", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa usar suas proprias licencas (BYOL) de Windows Server e SQL Server cobradas por core fisico e exige enxergar os sockets e os cores do servidor. Qual opcao de compra atende esse cenario?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Dedicated Instances, que rodam em hardware dedicado mas sem visibilidade do host",
                                isCorrect: false,
                            },
                            { text: "Dedicated Hosts", isCorrect: true },
                            {
                                text: "On-Demand, pela flexibilidade de ligar e desligar quando quiser",
                                isCorrect: false,
                            },
                            {
                                text: "Spot Instances, pelo menor custo por instancia",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Armazenamento",
        aulas: [
            {
                titulo: "Armazenamento na AWS - Os 3 tipos fundamentais",
                blocks: [
                    {
                        type: "quote",
                        value: "A pergunta que abre o tema\nAntes de decorar os nomes **EBS**, **EFS** e **S3**, entenda a ideia por trás deles. Toda a indústria de armazenamento gira em torno de **3 paradigmas**: **Block** (blocos), **File** (arquivos) e **Object** (objetos). Cada paradigma resolve um problema diferente. A **AWS oferece serviços para os 3**, e a prova testa se você sabe qual deles encaixa em cada cenário.",
                    },
                    { type: "text", value: "## 1. Visão de 30 segundos" },
                    {
                        type: "table",
                        value: '[["Tipo","Granularidade do dado","Como você acessa","Serviço AWS principal"],["**Block storage**","Blocos de tamanho fixo (ex.: 4 KB)","Como se fosse um **HD**","**Amazon EBS** (e Instance Store)"],["**File storage**","Arquivos em pastas hierárquicas","Sistema de arquivos via **NFS/SMB**","**Amazon EFS**, **Amazon FSx**"],["**Object storage**","Objetos num **namespace plano**","API HTTP(S) - **GET/PUT/DELETE**","**Amazon S3**"]]',
                    },
                    {
                        type: "quote",
                        value: '**Regra mais útil da prova:** se a pergunta menciona **"banco de dados"** → block. Se menciona **"compartilhado entre várias instâncias"** → file. Se menciona **"web / backup / data lake / mídia"** → object.',
                    },
                    {
                        type: "text",
                        value: "## 2. Block Storage (armazenamento em blocos)\n\n### O que é\n\nO dado é cortado em **blocos** de tamanho fixo. Cada bloco recebe um endereço numérico próprio. O **sistema operacional** enxerga esse conjunto de blocos como um **HD bruto**, ou seja, um disco cru. É o próprio sistema operacional que decide como montar um sistema de arquivos (como ext4, NTFS ou XFS) por cima desses blocos.",
                    },
                    {
                        type: "code",
                        value: "[Block 0] [Block 1] [Block 2] [Block 3] [Block 4] ...\n   ↑\n   OS lê/escreve blocos individuais\n   por endereço (offset)",
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- A **latência é baixíssima**, na casa dos microssegundos. O desempenho é comparável ao de um SSD físico.\n- Você pode **modificar 1 byte no meio** de um arquivo enorme **sem reescrever o arquivo inteiro**.\n- Em geral, o volume fica **anexado a UMA máquina** por vez (uma instância EC2, a máquina virtual da AWS, para um volume EBS).\n  - Existe o **Multi-Attach** para casos específicos, como clusters, mas isso é a exceção, não a regra.\n- Se o volume for **EBS**, o dado é **persistente**: ele sobrevive quando você desliga a instância EC2.\n\n### Caso de uso clássico\n- **Bancos de dados** (PostgreSQL, MySQL, SQL Server, MongoDB). Eles precisam de leitura e escrita rápidas (I/O rápido) e de modificar dados em posições aleatórias.\n- O **disco do sistema operacional** da instância EC2, também chamado de volume root.\n- Qualquer aplicação que precise de um **sistema de arquivos tradicional** com alta performance.\n\n### Serviços AWS",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Característica"],["**Amazon EBS**","Block storage **persistente em rede**, sobrevive ao stop da EC2. Cobra por GB-mês."],["**Instance Store**","SSD **local físico no host** da EC2. **Efêmero** - dados somem ao stop/terminate. Grátis com EC2."]]',
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha da prova:** "**dados sobrevivem ao stop da instância**" → EBS. "**Efêmero / temporary**" → Instance Store.',
                    },
                    {
                        type: "text",
                        value: "## 3. File Storage (armazenamento de arquivos)\n\n### O que é\n\nO dado é organizado em **arquivos** guardados dentro de uma **estrutura hierárquica de pastas**, exatamente como no Explorador de Arquivos do seu computador. O acesso acontece por um protocolo de **rede**: o **NFS** (Network File System) no Linux ou o **SMB** (Server Message Block) no Windows.",
                    },
                    {
                        type: "code",
                        value: "/shared/\n├── projeto-x/\n│   ├── docs/\n│   │   └── manual.pdf\n│   └── imagens/\n│       └── logo.png\n└── projeto-y/...\n        ↑\n        Hierarquia familiar de filesystem\n        acessada simultaneamente por N clientes",
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- **Vários clientes acessam ao mesmo tempo**, sejam dezenas, centenas ou milhares de instâncias EC2.\n- Cada cliente enxerga o sistema de arquivos como se fosse uma pasta local, só que ela está **montada pela rede**.\n- A **latência é média**, ficando entre a do block e a do object.\n- Ele **permite modificação parcial** do arquivo, igual a um sistema de arquivos normal.\n- A **escala é automática** dependendo do serviço (o EFS é elástico de forma nativa).\n\n### Caso de uso clássico\n- **Pastas compartilhadas** entre servidores web. Quando várias instâncias EC2 servem o mesmo site, todas precisam ler a mesma pasta `/var/www`.\n- **Sistemas legados** que dependem de um sistema de arquivos, típico de um lift-and-shift (mover a aplicação do data center para a nuvem sem reescrever).\n- **Pipelines de mídia ou de análise**, em que várias instâncias EC2 leem e escrevem nos mesmos arquivos.\n- **Home directories** (diretórios pessoais) corporativos.\n\n### Serviços AWS",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Para que serve"],["**Amazon EFS**","NFS para **Linux**. Escala automática, paga só pelo que armazena. **A escolha default** para file storage."],["**Amazon FSx for Windows File Server**","SMB para **Windows**. Integração com Active Directory."],["**Amazon FSx for Lustre**","File system para **HPC** (High Performance Computing) - ML training, simulações científicas."],["**Amazon FSx for NetApp ONTAP**","Recursos avançados (snapshots, deduplicação) - lift-and-shift de NetApp on-prem."],["**Amazon FSx for OpenZFS**","File system ZFS gerenciado."]]',
                    },
                    {
                        type: "quote",
                        value: "**Mnemônico FSx:** se a pergunta mencionar **Windows + Active Directory** → **FSx for Windows**. **HPC / ML training** → **FSx for Lustre**.",
                    },
                    {
                        type: "text",
                        value: "## 4. Object Storage (armazenamento de objetos)\n\n### O que é\n\nAqui não existe pasta e não existe hierarquia. O dado é guardado como um **objeto** dentro de um **namespace plano** (um espaço de nomes sem níveis), e esse namespace fica dentro de um **bucket** (o balde onde os objetos moram). Cada objeto é formado por três partes:\n\n- O **conteúdo binário**, que é a carga útil, ou seja, o dado em si.\n- Os **metadados**, guardados como pares de chave e valor (por exemplo content-type, tamanho e tags).\n- Um **identificador único**, chamado de **key**. Ela parece um caminho de pastas, mas na verdade é só uma string.\n\nO acesso é feito por **HTTP(S)**, usando operações como `GET`, `PUT`, `DELETE` e `LIST`. Não existe `seek` para pular até o meio do arquivo: você pega ou substitui o objeto **inteiro**.",
                    },
                    {
                        type: "code",
                        value: 'Bucket: meu-bucket\n   ├── usuarios/1234/foto.jpg            ← isso é UMA KEY,\n   ├── relatorios/2026/06/relatorio.csv  ← não é "pasta + arquivo"\n   └── backup-2026-06-26.tar.gz\n\n           ↑\n           Acessado via HTTPS:\n           https://meu-bucket.s3.amazonaws.com/usuarios/1234/foto.jpg',
                    },
                    {
                        type: "text",
                        value: '### Características\n\n- A **escalabilidade é praticamente infinita**, chegando à casa dos exabytes.\n- A **durabilidade é extrema**. O S3 promete **11 noves**, ou seja, 99,999999999%.\n- A **latência é maior** que a do block e a do file, ficando na casa das centenas de milissegundos.\n- Na prática, o objeto é **imutável**: para "modificar" um objeto, você **substitui ele inteiro**.\n- O acesso é feito por uma **API HTTP**, e não por um sistema de arquivos montado.\n- O **custo por GB é muito menor** que o de block e file. Ainda existem camadas (chamadas de tiers) mais baratas para dados pouco acessados.\n\n### Caso de uso clássico\n- **Backups e archives** (arquivos de longo prazo), usando o S3 Glacier.\n- **Hospedagem de sites estáticos**, feitos de HTML, CSS, JS e imagens.\n- **Big data e data lakes**, com análise sobre petabytes de dados.\n- **Armazenamento de fotos, vídeos e áudio**, ou seja, qualquer mídia servida pela web.\n- **Logs de aplicação e de auditoria**.\n- **Distribuição de conteúdo**, servindo de origem (origin) para o CloudFront CDN (rede de distribuição de conteúdo).\n\n### Serviços AWS',
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Característica"],["**Amazon S3**","O object storage padrão. Vários **tiers** (Standard, IA, Glacier, Deep Archive)."],["**S3 Glacier**","Tier de S3 para **archive** (acesso raro, minutos a horas para recuperar, baratíssimo)."]]',
                    },
                    {
                        type: "quote",
                        value: '**Na prova:** "**hospedar site estático**", "**backup**", "**arquivos pra um site**", "**data lake**", "**11 noves de durabilidade**" → **S3**.',
                    },
                    { type: "text", value: "## 5. Comparação direta dos 3" },
                    {
                        type: "table",
                        value: '[["Critério","**Block (EBS)**","**File (EFS / FSx)**","**Object (S3)**"],["Estrutura","Blocos numerados","Hierarquia de pastas/arquivos","Namespace plano de objetos"],["Acesso","Como HD local","NFS / SMB","HTTP(S) API"],["Quantos clientes simultâneos","Geralmente **1**","**Muitos**","**Milhões**"],["Latência","Muito baixa (µs)","Baixa-média (ms)","Alta (centenas de ms)"],["Modifica byte no meio?","Sim","Sim","**Não** - substitui o objeto"],["Escala máxima","Limite do volume","Petabytes","**Exabytes (virtualmente ∞)**"],["Durabilidade típica","Alta (replicado em AZ)","Alta (multi-AZ)","**11 noves** (multi-AZ)"],["Custo por GB","Mais caro","Médio","**Mais barato** (e tem tiers)"],["Caso de uso típico","Banco de dados, OS","Pasta compartilhada","Backup, mídia, data lake, site estático"]]',
                    },
                    {
                        type: "text",
                        value: '## 6. Analogia que cola\n\n- **Block** é como um **pendrive ou SSD**. Você pluga em **um** computador e usa como disco. É rápido, mas individual.\n- **File** é como a **pasta de rede da empresa** (`\\\\servidor\\compartilhado`). Vários computadores enxergam essa pasta ao mesmo tempo e podem editar os arquivos.\n- **Object** é como o **Google Drive ou o Dropbox**. Você faz upload, recebe um link e baixa pelo navegador. Não dá para editar só a "página 5" sem subir o documento inteiro de novo.\n\n## 7. Pegadinhas comuns da prova\n\n1. **"Hospedar um site estático com baixo custo"** → **S3**.\n2. **"Banco de dados PostgreSQL rodando em EC2"** → **EBS** (block, baixa latência).\n3. **"50 instâncias EC2 servindo o mesmo site precisam acessar a pasta `/var/www` em comum"** → **EFS** (file, multi-client).\n4. **"Backup de longo prazo, raramente acessado, mais barato possível"** → **S3 Glacier Deep Archive**.\n5. **"Sistema legado Windows que usa SMB e Active Directory"** → **FSx for Windows File Server**.\n6. **"Treinamento de ML em larga escala que precisa ler TB de dados rapidamente"** → **FSx for Lustre**.\n7. **"Modificar 1 byte no meio de um arquivo de 10 GB sem reupar tudo"** → block ou file, **não** object (S3 substitui o objeto inteiro).\n8. **"Volume sobrevive ao stop da EC2?"** → **EBS sim, Instance Store não**.\n9. **"Durabilidade de 11 noves (99.999999999%)"** → **S3** - esse número é icônico do S3.\n10. **"Dado efêmero ultra-rápido grátis com a EC2"** → **Instance Store**.\n\n## 8. Mapa mental dos serviços de storage AWS',
                    },
                    {
                        type: "code",
                        value: "┌─────────────────────────────────────────────────────────────────┐\n│                         BLOCK STORAGE                            │\n│   ┌──────────────┐                  ┌──────────────────────┐    │\n│   │  Amazon EBS  │                  │  EC2 Instance Store  │    │\n│   │ (persistente)│                  │     (efêmero)        │    │\n│   └──────────────┘                  └──────────────────────┘    │\n└─────────────────────────────────────────────────────────────────┘\n\n┌─────────────────────────────────────────────────────────────────┐\n│                          FILE STORAGE                            │\n│   ┌────────────┐  ┌─────────────────┐  ┌────────────────────┐   │\n│   │ Amazon EFS │  │ FSx for Windows │  │  FSx for Lustre    │   │\n│   │ (Linux/NFS)│  │  (SMB + AD)     │  │     (HPC/ML)       │   │\n│   └────────────┘  └─────────────────┘  └────────────────────┘   │\n│   ┌─────────────────────┐  ┌──────────────────┐                 │\n│   │ FSx for NetApp ONTAP│  │ FSx for OpenZFS  │                 │\n│   └─────────────────────┘  └──────────────────┘                 │\n└─────────────────────────────────────────────────────────────────┘\n\n┌─────────────────────────────────────────────────────────────────┐\n│                         OBJECT STORAGE                           │\n│   ┌────────────┐                ┌────────────────────────────┐  │\n│   │ Amazon S3  │ ──── tiers ──→ │ S3 Standard / IA /         │  │\n│   │            │                │ Glacier / Deep Archive     │  │\n│   └────────────┘                └────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────────┘",
                    },
                    { type: "text", value: "## 9. Cheat sheet final" },
                    {
                        type: "code",
                        value: '3 tipos de storage:\n  BLOCK  → HD virtual (EBS, Instance Store)\n            * baixa latência, 1 EC2 por volume (regra)\n            * banco de dados, OS, filesystem tradicional\n\n  FILE   → pasta compartilhada (EFS, FSx)\n            * NFS (Linux) ou SMB (Windows)\n            * vários clientes simultâneos\n            * legado, mídia, home dirs corporativos\n\n  OBJECT → bucket de chaves (S3)\n            * HTTPS API, escala ∞, 11 noves\n            * substitui inteiro (não edita "no meio")\n            * backup, mídia web, site estático, data lake\n\nAtalhos pra prova:\n  "banco de dados"                  → BLOCK (EBS)\n  "compartilhado entre instâncias"  → FILE (EFS)\n  "Windows + AD"                    → FILE (FSx for Windows)\n  "HPC / ML training"               → FILE (FSx for Lustre)\n  "site estático / backup / mídia"  → OBJECT (S3)\n  "archive barato"                  → OBJECT (S3 Glacier Deep Archive)\n  "efêmero ultra-rápido"            → BLOCK (Instance Store)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um banco de dados PostgreSQL roda em uma única instância EC2 e precisa de um volume persistente de baixa latência, com acesso em blocos que permita alterar dados em posições específicas sem reescrever o arquivo inteiro. Qual serviço de armazenamento atende melhor a esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon EBS", isCorrect: true },
                            { text: "Amazon EFS", isCorrect: false },
                            { text: "Amazon S3", isCorrect: false },
                            { text: "Amazon S3 Glacier", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma frota de instâncias EC2 com Linux serve o mesmo site, e todas precisam ler e gravar ao mesmo tempo os arquivos da pasta /var/www, montada pela rede via NFS. Qual serviço de armazenamento é o mais indicado?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon EBS", isCorrect: false },
                            { text: "Amazon EFS", isCorrect: true },
                            { text: "Amazon S3", isCorrect: false },
                            { text: "Amazon FSx for Windows File Server", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe vai hospedar um site estático (HTML, CSS, JavaScript e imagens) e guardar backups, com escala praticamente ilimitada, durabilidade de 11 noves (99,999999999%) e o menor custo por GB. Qual serviço atende a esse cenário?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon EBS", isCorrect: false },
                            { text: "Amazon EFS", isCorrect: false },
                            { text: "Amazon S3", isCorrect: true },
                            { text: "Instance Store", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação Windows precisa de um compartilhamento de arquivos acessado pelo protocolo SMB e integrado ao Active Directory da empresa. Qual serviço de armazenamento de arquivos da AWS atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon EFS", isCorrect: false },
                            { text: "Amazon FSx for Windows File Server", isCorrect: true },
                            { text: "Amazon S3", isCorrect: false },
                            { text: "Amazon EBS", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação grava dados temporários de processamento (scratch) que podem ser descartados a qualquer momento. O time quer o disco de menor latência, físico e local no host da EC2, sem custo adicional de armazenamento, e aceita perder esses dados quando a instância for parada ou encerrada. Qual opção atende melhor?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon EBS", isCorrect: false },
                            { text: "Amazon EFS", isCorrect: false },
                            { text: "Amazon S3", isCorrect: false },
                            { text: "Instance Store", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon S3 - Storage Classes",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO S3 (Simple Storage Service) não é um único tipo de armazenamento. Ele oferece **7 classes de armazenamento**, cada uma com um **trade-off diferente** entre **custo, latência, durabilidade e disponibilidade**. A prova testa a sua capacidade de **escolher a classe certa para cada cenário**. A boa notícia é que **todas têm 11 noves de durabilidade** (99,999999999%). A diferença real entre elas está em **disponibilidade, latência, custo e tempo mínimo de retenção**.",
                    },
                    { type: "text", value: "## 1. As 7 classes em uma tabela" },
                    {
                        type: "table",
                        value: '[["Classe","Caso de uso","Latência","Disponibilidade","AZs","Custo de armazenamento"],["**S3 Standard**","Dados acessados **frequentemente**","ms","99,99%","≥3","$$$"],["**S3 Intelligent-Tiering**","Padrão de acesso **desconhecido / variável**","ms","99,9%","≥3","$$ (+ taxa monit.)"],["**S3 Standard-IA** (Infrequent Access)","Acesso **infrequente**, mas recuperação rápida","ms","99,9%","≥3","$$"],["**S3 One Zone-IA**","Infrequente + **dado recriável** (não precisa multi-AZ)","ms","99,5%","**1**","$"],["**S3 Glacier Instant Retrieval**","Archive com **acesso em milissegundos** quando precisa","ms","99,9%","≥3","$"],["**S3 Glacier Flexible Retrieval**","Archive - recuperação em **minutos a horas**","min-h","99,99%¹","≥3","¢"],["**S3 Glacier Deep Archive**","Archive frio - recuperação em **12h+**, mais barato","12h+","99,99%¹","≥3","¢¢ (menor)"]]',
                    },
                    {
                        type: "text",
                        value: '¹ disponibilidade após restore. Antes do restore, o objeto não está "online".',
                    },
                    {
                        type: "quote",
                        value: "**Repete pra fixar:** durabilidade é **11 noves em TODAS** (exceto One Zone-IA, que tem 11 noves mas **só dentro de 1 AZ** - se a AZ pifa, o dado pode sumir).",
                    },
                    {
                        type: "text",
                        value: '## 2. Detalhamento de cada classe\n\n### 2.1 S3 Standard (o "default")\n- A latência é de **milissegundos**.\n- A disponibilidade é de **99,99%**.\n- Não tem tempo mínimo de retenção.\n- Não cobra custo de recuperação.\n- É a classe mais cara **por GB armazenado**.\n- **Quando usar:** dados ativos, sites em produção, cache de mídia e qualquer dado quente do dia a dia.\n\n### 2.2 S3 Intelligent-Tiering\n- A AWS **move o objeto automaticamente** entre os tiers conforme o padrão de acesso, seguindo a ordem:\n  - Frequent Access → Infrequent Access → Archive Instant → Archive → Deep Archive\n- Cobra uma **pequena taxa mensal de monitoramento por objeto**, mas a economia costuma compensar.\n- **Não cobra custo de recuperação.**\n- **Quando usar:** quando você **não sabe** se o dado vai ser acessado muito ou pouco. É melhor do que ficar adivinhando.\n\n### 2.3 S3 Standard-IA (Infrequent Access)\n- O custo por GB é **menor que o do Standard**.\n- **Cobra pela recuperação** de cada GB lido.\n- Tem **retenção mínima de 30 dias**. Se você apagar antes, paga como se tivesse guardado por 30 dias.\n- Cobra um **mínimo de 128 KB por objeto**. Um objeto menor que isso é cobrado como se tivesse 128 KB.\n- **Quando usar:** backup secundário e dados que você acessa de vez em quando, mas que precisam vir rápido quando você precisa.\n\n### 2.4 S3 One Zone-IA\n- É **igual ao Standard-IA, mas fica em 1 só AZ** (Availability Zone, a zona de disponibilidade), em vez de 3.\n- É cerca de **20% mais barato** que o Standard-IA.\n- O **risco** é claro: se aquela AZ for destruída, o **dado se perde**.\n- **Quando usar:** para dado **recriável**, ou seja, uma cópia de algo, um cache ou o resultado derivado de outro processamento. Não use para dado único e insubstituível.',
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha clássica:** "**dado infrequente E pode ser recriado**" → **One Zone-IA**. "**dado infrequente, NÃO pode perder**" → **Standard-IA**.',
                    },
                    {
                        type: "text",
                        value: '### 2.5 S3 Glacier Instant Retrieval\n- É um archive **com latência de milissegundos**, apesar do nome "Glacier" sugerir algo lento.\n- Tem **retenção mínima de 90 dias**.\n- Recuperar sai mais caro do que no Glacier Flexible, mas o acesso é instantâneo.\n- **Quando usar:** archive raramente acessado (algo como uma vez por trimestre), mas que precisa estar **disponível na hora** quando for chamado. Exemplos: imagens médicas e mídia de catálogo.\n\n### 2.6 S3 Glacier Flexible Retrieval (antigo "Glacier")\n- A recuperação leva de **minutos a horas** e tem 3 modos:\n  - **Expedited:** de 1 a 5 minutos (o mais caro).\n  - **Standard:** de 3 a 5 horas (o modo padrão).\n  - **Bulk:** de 5 a 12 horas (o mais barato, pensado para lotes grandes).\n- Tem **retenção mínima de 90 dias**.\n- **Quando usar:** backup de longo prazo, archive de logs e compliance, ou seja, casos em que esperar horas para recuperar está de bom tamanho.\n\n### 2.7 S3 Glacier Deep Archive\n- É o **mais barato** de todos os tiers.\n- A recuperação leva **12 horas no modo Standard** ou **48 horas no modo Bulk**.\n- Tem **retenção mínima de 180 dias**.\n- **Quando usar:** retenção obrigatória por lei que dure **anos** (o típico é de 7 a 10 anos), em áreas como financeiro, saúde, jurídico e dados históricos.\n\n## 3. Tabela de comparação completa (cai na prova)',
                    },
                    {
                        type: "table",
                        value: '[["Atributo","Standard","Intelligent","Std-IA","One Zone-IA","Glacier Instant","Glacier Flex","Deep Archive"],["Durabilidade","11 noves","11 noves","11 noves","11 noves (1 AZ)","11 noves","11 noves","11 noves"],["Disponibilidade","99,99%","99,9%","99,9%","99,5%","99,9%","99,99%¹","99,99%¹"],["Mín. AZs","3","3","3","**1**","3","3","3"],["Latência","ms","ms","ms","ms","ms","min-horas","horas"],["Mín. retenção","-","-","30d","30d","90d","90d","**180d**"],["Mín. tamanho cobrado","-","-","128 KB","128 KB","128 KB","40 KB","40 KB"],["Custo armazenamento","$$$","$$ (variável)","$$","$","$","¢","**¢¢ (menor)**"],["Custo de recuperação","-","-","$","$","$$","$ (varia)","$ (varia)"],["Caso clássico","Site ativo","Padrão desconhecido","Backup quente","Cache recriável","Archive disponível","Archive frio","Compliance longo prazo"]]',
                    },
                    {
                        type: "text",
                        value: "¹ disponibilidade após restore.\n\n## 4. Lifecycle Policies - automação entre classes\n\nVocê define **regras** no bucket para mover ou apagar objetos automaticamente conforme o tempo passa. Veja um exemplo prático:",
                    },
                    {
                        type: "code",
                        value: "Objeto criado em: S3 Standard\n       │\n       │ após 30 dias →\n       ▼\n   S3 Standard-IA\n       │\n       │ após 90 dias →\n       ▼\n   S3 Glacier Flexible Retrieval\n       │\n       │ após 365 dias →\n       ▼\n   S3 Glacier Deep Archive\n       │\n       │ após 7 anos →\n       ▼\n       APAGAR",
                    },
                    {
                        type: "quote",
                        value: "**Casos clássicos de lifecycle:**\n- Logs: Standard → IA (30d) → Glacier (90d) → Deep Archive (365d) → delete (7 anos)\n- Backup de banco: Standard-IA → Glacier (30d) → Deep Archive (90d)\n- Fotos de usuário: Standard → Intelligent-Tiering (deixa AWS decidir)",
                    },
                    {
                        type: "quote",
                        value: '**Regra:** transições **só podem ir pra classes mais "frias"** (de quente pra frio). Não dá pra "promover" objeto frio pra quente via lifecycle - você precisa **copiar/restaurar manualmente** se quiser voltar pra Standard.',
                    },
                    {
                        type: "text",
                        value: '## 5. Intelligent-Tiering - quando em dúvida, escolhe ele\n\nSe a pergunta da prova for **"não conhecemos o padrão de acesso"** ou **"padrão de acesso varia ao longo do tempo"** → resposta é **Intelligent-Tiering**.\n\n**Como funciona internamente** (interessante saber):',
                    },
                    {
                        type: "table",
                        value: '[["Tier interno","Quando o objeto cai aqui"],["Frequent Access","Default (objeto novo / acessado)"],["Infrequent Access","Não acessado por **30 dias**"],["Archive Instant Access","Não acessado por **90 dias**"],["Archive Access (opt-in)","Não acessado por **90-730 dias** (config)"],["Deep Archive (opt-in)","Não acessado por **180-730 dias** (config)"]]',
                    },
                    {
                        type: "text",
                        value: '- Cobra uma **pequena taxa mensal por objeto** monitorado.\n- **Não tem retenção mínima**, diferente das classes IA e Glacier usadas diretamente.\n- **Não cobra custo de recuperação.**\n- Se o objeto for acessado, ele **volta para o tier "quente" automaticamente**.\n\n## 6. Pegadinhas comuns da prova\n\n1. **"Dado infrequente que pode ser recriado se perder"** → **One Zone-IA**.\n2. **"Dado infrequente que NÃO pode perder"** → **Standard-IA** (multi-AZ).\n3. **"Archive de compliance por 7-10 anos, custo mínimo"** → **Glacier Deep Archive**.\n4. **"Archive acessado raramente, mas em milissegundos quando preciso"** → **Glacier Instant Retrieval**.\n5. **"Recuperação em minutos/horas, archive normal"** → **Glacier Flexible Retrieval**.\n6. **"Não sei o padrão de acesso, quero economizar sem decidir"** → **Intelligent-Tiering**.\n7. **"Mover objetos pra archive depois de 90 dias automaticamente"** → **Lifecycle Policy**.\n8. **"Durabilidade da classe X"** → **11 noves SEMPRE** (a única diferença é One Zone que é 11 noves dentro de 1 AZ).\n9. **"O que muda entre Standard e Standard-IA?"** → Standard-IA é **mais barato pra armazenar**, mas **cobra recuperação** e tem **mín. 30 dias retenção**.\n10. **"Como migrar dados entre classes automaticamente?"** → **S3 Lifecycle**.\n11. **"Posso voltar do Glacier pra Standard via lifecycle?"** → **Não** - só vai do quente pro frio. Pra voltar, restaurar manualmente.\n12. **"Latência do Glacier Deep Archive?"** → **12h Standard / 48h Bulk** (Deep Archive **não** suporta Expedited).\n13. **"Por quanto tempo um objeto fica em uma classe antes de poder ser deletado sem multa?"** → IA: **30d**, Glacier Instant/Flexible: **90d**, Deep Archive: **180d**.\n\n## 7. Mapa visual: latência × custo',
                    },
                    {
                        type: "code",
                        value: "  ALTO CUSTO\n       ▲\n       │  Standard          ← acesso constante\n       │     │\n       │  Standard-IA       ← acesso eventual\n       │     │\n       │  One Zone-IA       ← infrequente + recriável\n       │     │\n       │  Glacier Instant   ← raríssimo + acesso instantâneo\n       │     │\n       │  Glacier Flexible  ← archive, recupera em min-horas\n       │     │\n       │  Deep Archive      ← compliance longo prazo (horas)\n       ▼\n  BAIXO CUSTO\n\n  ◄─── LATÊNCIA crescente ───►",
                    },
                    {
                        type: "text",
                        value: "Quanto mais para **baixo** você desce (mais barato), mais **lenta** fica a recuperação. Esse é o trade-off central.\n\n## 8. Cheat sheet final",
                    },
                    {
                        type: "code",
                        value: 'Durabilidade:  TODAS têm 11 noves (Standard, IA, Glacier - tudo)\n               Única diferença: One Zone-IA é 11 noves DENTRO DE 1 AZ\n\n7 classes ordenadas por "quente → frio":\n  1. Standard                  → dado ativo, qualquer hora\n  2. Intelligent-Tiering       → "AWS, decide você"\n  3. Standard-IA               → infrequente, mas precisa multi-AZ\n  4. One Zone-IA               → infrequente + dado recriável\n  5. Glacier Instant Retrieval → archive com latência ms\n  6. Glacier Flexible Retr.    → archive, min-horas pra restaurar\n  7. Glacier Deep Archive      → o mais barato, 12-48h restore\n\nMínimo de retenção (apagar antes paga a diferença):\n  IA / One Zone-IA           → 30 dias\n  Glacier Instant/Flexible   → 90 dias\n  Glacier Deep Archive       → 180 dias\n\nLifecycle Policies = automatizar transições (sempre QUENTE → FRIO)\n\nAtalhos pra prova:\n  "recriável"            → One Zone-IA\n  "padrão desconhecido"  → Intelligent-Tiering\n  "compliance 7+ anos"   → Deep Archive\n  "archive em ms"        → Glacier Instant Retrieval\n  "archive normal"       → Glacier Flexible Retrieval\n  "automatizar transição"→ Lifecycle Policy\n  "11 noves"             → S3 em qualquer classe',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sobre a durabilidade das classes de armazenamento do Amazon S3, qual afirmacao esta correta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A durabilidade cai conforme a classe fica mais barata, entao o S3 Glacier Deep Archive e o menos duravel de todos.",
                                isCorrect: false,
                            },
                            {
                                text: "Todas as classes oferecem 11 noves (99,999999999%) de durabilidade; a One Zone-IA entrega esse valor, mas dentro de uma unica Availability Zone.",
                                isCorrect: true,
                            },
                            {
                                text: "Somente o S3 Standard alcanca 11 noves; as classes de arquivamento Glacier ficam limitadas a 8 noves.",
                                isCorrect: false,
                            },
                            {
                                text: "A durabilidade acompanha a disponibilidade, entao uma classe com 99,5% de disponibilidade tem 99,5% de durabilidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicacao gera miniaturas de imagens a partir dos arquivos originais. Essas miniaturas sao acessadas poucas vezes por mes e, se forem perdidas, podem ser recriadas a partir dos originais. Buscando o menor custo com recuperacao em milissegundos, qual classe e a mais indicada?",
                        difficulty: "medio",
                        options: [
                            { text: "S3 One Zone-IA", isCorrect: true },
                            { text: "S3 Standard-IA", isCorrect: false },
                            { text: "S3 Glacier Flexible Retrieval", isCorrect: false },
                            { text: "S3 Standard", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma instituicao financeira precisa guardar documentos por exigencia legal durante 10 anos. O acesso e rarissimo e uma recuperacao que leve cerca de 12 horas e totalmente aceitavel. O objetivo e o menor custo de armazenamento possivel. Qual classe atende melhor esse cenario?",
                        difficulty: "medio",
                        options: [
                            { text: "S3 Glacier Instant Retrieval", isCorrect: false },
                            { text: "S3 Standard-IA", isCorrect: false },
                            { text: "S3 Glacier Deep Archive", isCorrect: true },
                            { text: "S3 Glacier Flexible Retrieval", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe vai armazenar arquivos cujo padrao de acesso e desconhecido e deve variar bastante ao longo do tempo. Eles querem reduzir custos sem precisar decidir manualmente quando mover cada objeto entre classes. Qual classe resolve isso?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "S3 Standard, por ser a classe padrao e mais segura para qualquer situacao.",
                                isCorrect: false,
                            },
                            {
                                text: "S3 Intelligent-Tiering, que move os objetos entre os tiers automaticamente conforme o padrao de acesso.",
                                isCorrect: true,
                            },
                            {
                                text: "S3 Standard-IA, porque ja assume que o acesso sera infrequente.",
                                isCorrect: false,
                            },
                            {
                                text: "S3 One Zone-IA, porque guarda os dados em uma unica zona de disponibilidade e sai mais barato.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time criou uma S3 Lifecycle Policy que move logs do S3 Standard para o S3 Glacier Flexible Retrieval apos 90 dias. Meses depois, precisam trazer alguns desses objetos de volta para o S3 Standard. O que e verdade sobre esse cenario?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "As transicoes de lifecycle so vao de classes mais quentes para mais frias; para voltar ao Standard e preciso restaurar ou copiar o objeto manualmente.",
                                isCorrect: true,
                            },
                            {
                                text: "Basta adicionar uma regra de lifecycle que promova os objetos do Glacier de volta ao Standard automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "A regra que moveu para o Glacier reverte sozinha assim que o objeto for acessado.",
                                isCorrect: false,
                            },
                            {
                                text: "Objetos no S3 Glacier Flexible Retrieval nao podem mais ser lidos nem restaurados.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon EBS - Snapshots",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nUm **snapshot** é uma **cópia do volume EBS (Elastic Block Store) em um ponto exato no tempo**. Ele é guardado de forma **incremental** dentro do **S3**, mas quem gerencia esse S3 é a própria AWS, então você não enxerga o bucket. Serve para **backup, DR (Disaster Recovery, recuperação de desastres), migração entre regiões ou contas, clonagem e criação de AMIs** (Amazon Machine Images).",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é um snapshot\n\nImagine tirar uma **foto instantânea** do estado atual de um disco. É exatamente isso. Com um snapshot você pode:\n\n- Tirar a foto **com a instância EC2 rodando**, sem precisar desligar nada.\n- **Restaurar** essa foto criando um novo volume EBS idêntico, com o mesmo nome, o mesmo dado e a mesma hora congelada no tempo.\n- Tirar **dezenas de fotos ao longo do tempo** e pagar apenas pelo que mudou entre uma e outra.",
                    },
                    {
                        type: "code",
                        value: "        ┌─────────────────┐\n        │  EBS Volume     │  (anexado a 1 EC2 numa AZ)\n        │  /dev/xvda      │\n        │  estado às      │\n        │  10h, 11h, 12h  │\n        └────────┬────────┘\n                 │ snapshot\n                 ▼\n        ┌──────────────────────────────┐\n        │  S3 (gerenciado pela AWS)    │\n        │                              │\n        │  Snap 10h  Snap 11h  Snap 12h│ ← cada um é um ponto-no-tempo\n        │   (full)    (delta)   (delta)│   o 1º é completo, os outros\n        │                              │   guardam só o que mudou\n        └──────────────────────────────┘",
                    },
                    { type: "text", value: "## 2. Incremental - a parte que muita gente erra" },
                    {
                        type: "table",
                        value: '[["Snapshot","O que armazena","Custo"],["**1º**","Todos os **blocos usados** do volume","$$$"],["**2º**","Apenas blocos **modificados desde o 1º**","$"],["**3º**","Apenas blocos **modificados desde o 2º**","$"],["...","...","..."]]',
                    },
                    {
                        type: "quote",
                        value: "Você pode apagar um snapshot intermediário **sem perder dados**\nA AWS **religa as dependências internas automaticamente**. Se você apagar o snapshot das 11h, os blocos de que o snapshot das 12h dependia continuam acessíveis, porque são realocados internamente. Você não enxerga esse processo, ele é transparente.",
                    },
                    {
                        type: "quote",
                        value: "**Economia real:** se seu volume tem 100 GB com 30 GB usados, e a cada hora muda 1 GB, depois de 24 snapshots você paga só por ≈ 30 + 24 = **54 GB** armazenados, não 24 × 100 = 2400 GB.",
                    },
                    { type: "text", value: "## 3. Snapshot vs AMI (cai muito!)" },
                    {
                        type: "table",
                        value: '[["Atributo","**Snapshot EBS**","**AMI (Amazon Machine Image)**"],["O que é","Cópia de **um volume**","**Imagem completa** para iniciar EC2"],["Pra que serve","Restaurar/criar volume EBS","**Lançar uma nova instância EC2**"],["Contém SO?","Só se o volume era do SO","**Sempre** (SO + apps + config)"],["Pode ter mais de 1 snapshot?","Não - é um snapshot só","**Sim** - uma AMI agrupa múltiplos snapshots (1 por volume)"],["Inicia EC2?","Não diretamente","**Sim**"],["Permissões / metadados","Mínimo","Tem launch permissions, kernel, ramdisk, virtualization type"]]',
                    },
                    {
                        type: "quote",
                        value: "**Mnemônico:** **Snapshot = disco**. **AMI = receita pra fazer a EC2 inteira** (usa snapshot por dentro pra montar o disco).",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "lançar uma EC2 idêntica em outra região" → **AMI** (não snapshot). "fazer backup do disco de dados" → **Snapshot**.',
                    },
                    { type: "text", value: "## 4. Casos de uso" },
                    {
                        type: "table",
                        value: '[["Cenário","Como o snapshot resolve"],["**Backup diário** do banco de dados","DLM agenda snapshots automáticos"],["**Disaster Recovery** entre regiões","Copy snapshot para outra região, restaura lá"],["**Migração** entre regiões ou contas","Copy / share o snapshot"],["**Clonar EC2** pra ambiente de teste","Snapshot → cria novo volume → anexa em nova EC2"],["**Resize de volume** (sem downtime no histórico)","Snapshot → cria volume maior a partir dele"],["**Forense / debug** de instância comprometida","Snapshot enquanto online, análise offline em outro volume"],["**Compliance / retenção** (ex.: \\"guardar 7 anos\\")","DLM ou AWS Backup com retention policy"]]',
                    },
                    {
                        type: "text",
                        value: '## 5. Cross-region e cross-account\n\n### Cross-region (entre regiões)\n- O snapshot **vive dentro de uma região**, já que o "S3 por trás" também é regional.\n- Para DR, você **COPIA** o snapshot para outra região.\n- A cópia inicial cobra **data transfer** (transferência de dados) entre as regiões. Depois disso, você paga apenas o GB-mês na nova região.\n- Se o snapshot é **criptografado**, a cópia pode ser **recriptografada com outra chave KMS** (Key Management Service). Isso é útil para isolar as chaves por região.\n\n### Cross-account (entre contas AWS)\n- Você pode **compartilhar** um snapshot com outra conta AWS em modo somente leitura (read-only).\n- Para snapshots **criptografados**, você precisa **compartilhar também a chave KMS**, ou usar uma chave já compartilhada.\n- Dá até para **tornar o snapshot público**, o que é útil para distribuir dados de pesquisa. Cuidado redobrado com dados sensíveis nesse caso.',
                    },
                    {
                        type: "code",
                        value: "Conta A (origem)                  Conta B (destino)\n    │                                  │\n    │  Snapshot encrypted              │\n    │  + KMS key shared ───────────────┤\n    │                                  │\n    │                                  ▼\n    │                          Pode criar volume\n    │                          a partir do snapshot",
                    },
                    { type: "text", value: "## 6. Pricing" },
                    {
                        type: "table",
                        value: '[["Item","Como cobra"],["**Armazenamento**","$/GB-mês dos **blocos únicos** efetivamente armazenados"],["**Tier padrão**","Acesso imediato, preço normal"],["**Snapshot Archive Tier** (novo)","Até 75% mais barato, restore demora **24-72h**, mínimo 90 dias retenção"],["**Cross-region copy**","Cobra **data transfer** + GB-mês na região destino"],["**Cross-account share**","**Grátis** - só GB-mês na conta dona"],["**Fast Snapshot Restore (FSR)**","$/hora por snapshot habilitado por AZ (caro - usar com critério)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Insight:** o GB-mês cobrado é **dos dados realmente armazenados**, não do tamanho lógico do volume. Volume de 1 TB com 50 GB ocupados = pagamento sobre ≈ 50 GB (+ deltas).",
                    },
                    { type: "text", value: "## 7. Automação - DLM vs AWS Backup" },
                    {
                        type: "table",
                        value: '[["Ferramenta","Foco","Quando usar"],["**Data Lifecycle Manager (DLM)**","Cria/apaga snapshots EBS por **tags** + cron","Você só quer backup de EBS, simples"],["**AWS Backup**","Backup centralizado para **vários serviços** (EBS, RDS, EFS, DynamoDB, FSx, etc.)","Você quer **um único painel** para backup multi-serviço, com compliance"]]',
                    },
                    {
                        type: "quote",
                        value: '**Na prova:** "**solução centralizada de backup para vários serviços AWS**" → **AWS Backup**. "**só snapshots de EBS, regra simples por tag**" → **DLM**.',
                    },
                    {
                        type: "text",
                        value: "## 8. Criptografia\n\n- Volume **criptografado** gera um snapshot **criptografado automaticamente**.\n- Volume **não criptografado** gera um snapshot **não criptografado**. Mesmo assim, você pode **criptografar durante a cópia**.\n- Por baixo, tudo usa o **AWS KMS**, com uma CMK (Customer Master Key, a chave mestra) gerenciada pela AWS ou criada por você.\n- Restaurar um snapshot criptografado **sempre gera um volume criptografado**.",
                    },
                    {
                        type: "quote",
                        value: "**Truque pra criptografar volume já existente:** snapshot → copy com encryption ligada → restaurar como novo volume → swap.",
                    },
                    {
                        type: "text",
                        value: '## 9. Restore (criar volume a partir do snapshot)\n\n- Você pode criar o volume em **qualquer AZ da mesma região**, porque o snapshot é regional e o volume é zonal (fica preso a uma zona).\n- O novo volume começa em modo "lazy loaded" (carregamento preguiçoso): os **blocos são puxados do S3 sob demanda** na primeira leitura, então o primeiro acesso pode ser lento.\n- Para evitar esse aquecimento (warm-up), você ativa o **Fast Snapshot Restore (FSR)**. Ele cobra por hora em cada AZ, mas deixa a inicialização instantânea.',
                    },
                    {
                        type: "code",
                        value: "Snapshot (regional)\n        │\n        ├──── restore em us-east-1a → Volume 1\n        ├──── restore em us-east-1b → Volume 2\n        └──── restore em us-east-1c → Volume 3",
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"Backup de EBS armazenado em S3"** → **Snapshot**. (A relação é interna da AWS - você não enxerga o bucket.)\n2. **"Migrar dado entre regiões"** → snapshot + **copy cross-region**.\n3. **"Lançar EC2 idêntica em outra região"** → **AMI** (não snapshot puro). A AMI usa snapshots por baixo.\n4. **"Backup automático periódico de EBS"** → **DLM** (simples) ou **AWS Backup** (multi-serviço).\n5. **"Sobrevive ao terminate da EC2?"** → **Sim** - snapshots existem independente de volume e instância.\n6. **"Snapshot é incremental?"** → **Sim**. Só o primeiro é "completo", o resto guarda delta.\n7. **"Apagar snapshot intermediário perde dados?"** → **Não** - AWS realoca dependências automaticamente.\n8. **"Como pré-aquecer o volume restaurado?"** → **Fast Snapshot Restore (FSR)**.\n9. **"Backup de longuíssimo prazo, raramente acessado"** → **Snapshot Archive Tier** (lembrando: restore 24-72h, mínimo 90 dias).\n10. **"Snapshot é regional ou zonal?"** → **Regional** (e ele restaura em qualquer AZ da região).\n11. **"Volume criptografado → snapshot é..."** → **Criptografado automaticamente**.\n12. **"Compartilhar snapshot privado com outra conta"** → **Sim** - e se for criptografado, **compartilha a KMS key junto**.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'EBS Snapshot:\n  • Foto ponto-no-tempo de um volume EBS\n  • Armazenado em S3 (gerenciado AWS, transparente)\n  • Regional (volume é zonal, snapshot é regional)\n  • Incremental (só o 1º é "full", resto guarda delta)\n  • Pode apagar intermediário sem perder dados\n  • Cobra GB-mês dos blocos únicos armazenados\n\nSnapshot ≠ AMI:\n  Snapshot → cópia de UM volume\n  AMI       → imagem pra LANÇAR EC2 (usa snapshots por dentro)\n\nCross-stuff:\n  Cross-region → COPY (paga data transfer)\n  Cross-account → SHARE (precisa compartilhar KMS se cripto)\n  Cross-AZ      → snapshot é regional, restaura em qualquer AZ\n\nAutomação:\n  DLM         → só EBS, regra por tag\n  AWS Backup  → multi-serviço (EBS, RDS, EFS, DynamoDB, FSx...)\n\nAtalhos pra prova:\n  "backup EBS" / "ponto no tempo"     → Snapshot\n  "lançar EC2 idêntica"               → AMI\n  "DR entre regiões"                  → Snapshot + Copy\n  "centralizar backup multi-serviço"  → AWS Backup\n  "agendar snapshot por tag"          → DLM\n  "restore lento na primeira leitura" → Fast Snapshot Restore (FSR)\n  "archive ultra-barato, restore 24h+" → Snapshot Archive Tier',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que descreve corretamente um snapshot de um volume do Amazon EBS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma cópia do volume em um ponto exato no tempo, armazenada no Amazon S3 gerenciado pela AWS.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma réplica síncrona do volume mantida em tempo real em outra Zona de Disponibilidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Um arquivo salvo em um bucket S3 que você cria e administra dentro da sua própria conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma imagem completa com sistema operacional, pronta para lançar uma nova instância EC2.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você mantém uma cadeia de snapshots incrementais de um volume EBS (10h, 11h e 12h) e decide apagar o snapshot das 11h. O que acontece com o snapshot das 12h?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Continua íntegro e restaurável, pois a AWS preserva os blocos de que ele ainda depende.",
                                isCorrect: true,
                            },
                            {
                                text: "Fica corrompido, porque perde os blocos incrementais que ficavam no snapshot das 11h.",
                                isCorrect: false,
                            },
                            {
                                text: "Passa a restaurar apenas os dados até as 10h, descartando as mudanças posteriores.",
                                isCorrect: false,
                            },
                            {
                                text: "É removido automaticamente junto, já que um snapshot incremental não pode existir sem o anterior.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa lançar várias instâncias EC2 idênticas, com o mesmo sistema operacional, aplicações e configurações já instaladas. Qual recurso é o indicado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma AMI (Amazon Machine Image), que empacota o sistema e é usada para lançar as instâncias.",
                                isCorrect: true,
                            },
                            {
                                text: "Um snapshot de EBS, que inicia a instância diretamente quando restaurado.",
                                isCorrect: false,
                            },
                            {
                                text: "Um volume EBS com Multi-Attach, para que todas as instâncias usem o mesmo disco.",
                                isCorrect: false,
                            },
                            {
                                text: "Um bucket S3 com os arquivos do disco, montado como raiz de cada nova instância.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um snapshot de EBS foi criado na região us-east-1. Para usá-lo em um plano de disaster recovery na região us-west-2, o que precisa ser feito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Copiar o snapshot para us-west-2, pois cada snapshot existe dentro de uma única região.",
                                isCorrect: true,
                            },
                            {
                                text: "Nada, porque o snapshot é um recurso global e já fica disponível em todas as regiões.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover o volume EBS original para us-west-2 e gerar um novo snapshot lá.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar a replicação automática entre regiões nas propriedades do volume.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao criar um snapshot a partir de um volume EBS criptografado, o que acontece com a criptografia do snapshot?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O snapshot é criptografado automaticamente, usando a mesma chave do AWS KMS.",
                                isCorrect: true,
                            },
                            {
                                text: "O snapshot é criado sem criptografia e precisa ser criptografado manualmente depois.",
                                isCorrect: false,
                            },
                            {
                                text: "O snapshot só fica criptografado se a instância EC2 estiver desligada no momento.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível criar snapshots de volumes criptografados.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Armazenamento de Arquivos - Amazon EFS e Amazon FSx",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nSempre que **vários servidores precisam ler e escrever nos mesmos arquivos**, você precisa de **file storage** (armazenamento de arquivos). Na AWS, isso significa usar o **EFS** (Elastic File System, para Linux via NFS) ou alguma variante do **FSx** (para Windows, Lustre, NetApp ou OpenZFS). A prova testa principalmente **qual deles escolher em cada cenário**.",
                    },
                    { type: "text", value: "## 1. Recap rápido - por que file storage existe" },
                    {
                        type: "table",
                        value: '[["Necessidade","Solução"],["1 EC2 + 1 disco rápido (banco de dados, OS)","**Block** - EBS"],["**N EC2 lendo/escrevendo nos mesmos arquivos**","**File** - EFS / FSx"],["Mídia para web, backup, archive, data lake","**Object** - S3"]]',
                    },
                    {
                        type: "quote",
                        value: '**Pergunta-chave que define file storage:** "**várias instâncias precisam acessar o mesmo arquivo ao mesmo tempo?**" → resposta é file (NFS/SMB), não block (EBS).',
                    },
                    { type: "text", value: "## 2. Amazon EFS (Elastic File System)" },
                    {
                        type: "quote",
                        value: "Um sistema de arquivos **gerenciado** que fala o protocolo **NFS v4**, o padrão dos sistemas **Linux**.",
                    },
                    {
                        type: "text",
                        value: "### Características principais\n\n- É **Multi-AZ** por padrão, ou seja, replica os dados em pelo menos 3 zonas de disponibilidade dentro da região.\n- Faz **auto-scaling**: cresce de KB a PB **sem você precisar provisionar** capacidade antes.\n- Cobra apenas pelo **GB-mês armazenado**, já que não existe capacidade pré-provisionada.\n- Pode ser montado em **N instâncias EC2** ao mesmo tempo, inclusive em **AZs diferentes**.\n- Também é acessível por **Lambda, ECS, EKS e ambientes on-premises** (locais), via Direct Connect ou VPN.\n- Suporta **criptografia em repouso e em trânsito**, usando TLS (Transport Layer Security).\n\n### Como funciona (visão alto nível)",
                    },
                    {
                        type: "code",
                        value: "   EC2 (us-east-1a) ─┐\n   EC2 (us-east-1b) ─┼──► EFS mount target (NFS) ──► Filesystem único\n   EC2 (us-east-1c) ─┘                                (compartilhado pelas 3)\n\n   Lambda ──┘\n   ECS Task ─┘\n   On-prem (VPN/Direct Connect) ─┘",
                    },
                    { type: "text", value: "### Classes de armazenamento (sim, EFS também tem!)" },
                    {
                        type: "table",
                        value: '[["Classe","Onde fica","Caso de uso"],["**EFS Standard**","**Multi-AZ**","Acesso frequente, multi-AZ HA"],["**EFS Standard-IA**","**Multi-AZ**","Acesso infrequente (~30 dias sem ler), mais barato"],["**EFS One Zone**","**1 AZ**","Acesso frequente, dado pode ser recriado"],["**EFS One Zone-IA**","**1 AZ**","Mais barato dos quatro, infrequente, recriável"]]',
                    },
                    {
                        type: "quote",
                        value: "**Lifecycle management do EFS** move automaticamente arquivos não acessados (ex.: ≥30 dias) pra classe IA → economiza até 92%.",
                    },
                    {
                        type: "text",
                        value: '### Modos de performance / throughput\n\n- **Modos de performance:** General Purpose (o padrão) ou Max I/O (hoje considerado deprecated, ou seja, desencorajado para casos novos).\n- **Modos de throughput:** Bursting (o padrão, que escala junto com o tamanho), Provisioned (você fixa quantos MB/s quer) e **Elastic** (escala de forma automática e é o recomendado).\n\n### Casos de uso típicos\n\n- **Servidores web em cluster** que compartilham a pasta `/var/www`.\n- **CMS** (Content Management System, sistema de gerenciamento de conteúdo) como Drupal e WordPress rodando em várias instâncias EC2.\n- **Pipelines de processamento de mídia.**\n- **Home directories** (diretórios pessoais) corporativos e ambientes de desenvolvimento.\n- **Containers Linux** (ECS ou EKS) que precisam de um sistema de arquivos persistente e compartilhado.\n\n## 3. Amazon FSx - a família "filesystems especializados"\n\nO FSx é um **guarda-chuva** que reúne 4 variantes, cada uma para um sabor diferente de sistema de arquivos.',
                    },
                    {
                        type: "table",
                        value: '[["Variante","Protocolo","Para quê"],["**FSx for Windows File Server**","SMB (Windows)","Filesystem **Windows** corporativo + AD"],["**FSx for Lustre**","Lustre / POSIX","**HPC, ML training** (extrema performance)"],["**FSx for NetApp ONTAP**","NFS, SMB, iSCSI","Lift-and-shift de **NetApp on-prem**, recursos enterprise"],["**FSx for OpenZFS**","NFS","ZFS gerenciado (snapshots, clones, compression)"]]',
                    },
                    {
                        type: "quote",
                        value: '**Mnemônico de FSx:** "**F** is for **File system**, **x** is for **eXpert** - cada um é especialista numa coisa".',
                    },
                    { type: "text", value: "## 4. FSx for Windows File Server" },
                    {
                        type: "quote",
                        value: 'Pense nele como o "**EFS para Windows**", só que com integração total ao ecossistema Microsoft.',
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- Usa o **protocolo SMB** (Server Message Block, também conhecido como CIFS), o padrão do Windows.\n- Integra com o **Active Directory**, entrando no domínio automaticamente (auto-join).\n- Suporta **ACLs do Windows** (Access Control Lists, as listas de controle de acesso), permissões NTFS e group policies.\n- Oferece **Microsoft DFS Namespaces** (DFS é o Distributed File System, um sistema de arquivos distribuído entre vários servidores).\n- Tem **Shadow Copies**, que são as versões anteriores dos arquivos, igual ao que existe no Windows.\n- Faz **deduplicação** de dados.\n- Pode ser Multi-AZ ou Single-AZ.\n\n### Casos de uso\n\n- File servers (servidores de arquivos) Windows corporativos, substituindo servidores Windows on-premises.\n- Aplicações Windows que dependem de SMB, como SharePoint e sistemas .NET legados.\n- Home directories corporativos com **integração ao AD** (Active Directory).\n- **Migrar** servidores de arquivo Windows do data center para a nuvem.",
                    },
                    {
                        type: "quote",
                        value: "**Atalho da prova:** mencionou **Windows + Active Directory** → **FSx for Windows File Server**, sem hesitar.",
                    },
                    { type: "text", value: "## 5. FSx for Lustre" },
                    {
                        type: "quote",
                        value: "Um sistema de arquivos **paralelo e de alta performance**, projetado para cargas de trabalho (workloads) que precisam ler e escrever **TBs por segundo**.",
                    },
                    {
                        type: "text",
                        value: '### Características\n\n- A performance é brutal: **latência abaixo de 1 milissegundo**, **centenas de GB/s** de throughput e **milhões de IOPS** (operações de entrada e saída por segundo).\n- É compatível com **POSIX** (o padrão de interface dos sistemas Unix).\n- Tem **integração direta com o S3**: você pode "linkar" um bucket S3 como entrada e saída (input/output), então trabalha com os dados do S3 sem precisar copiar nada manualmente.\n- Tem dois modos:\n  - **Scratch:** performance máxima, mas com **dado temporário** (não persistente).\n  - **Persistent:** pensado para cargas de produção.\n\n### Casos de uso\n\n- **Treinamento de ML** (Machine Learning, aprendizado de máquina) em larga escala, com TensorFlow ou PyTorch lendo datasets de TB.\n- **Renderização de vídeo e VFX** (Visual Effects, efeitos visuais), usado por Hollywood e por estúdios de animação.\n- **Análise financeira**, como simulações de Monte Carlo.\n- **Simulações científicas**, como CFD (dinâmica de fluidos computacional), genômica e modelagem climática.\n- **HPC** (High Performance Computing, computação de alto desempenho) em geral.',
                    },
                    {
                        type: "quote",
                        value: "**Atalho da prova:** **HPC, ML training, simulação científica, rendering** → **FSx for Lustre**.",
                    },
                    { type: "text", value: "## 6. FSx for NetApp ONTAP" },
                    {
                        type: "quote",
                        value: "A versão gerenciada do **NetApp ONTAP**, um sistema de arquivos enterprise muito popular no on-premises.",
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- É **multi-protocolo**: fala NFS, SMB **e iSCSI** ao mesmo tempo.\n- Traz recursos enterprise como **snapshots, FlexClone (clones instantâneos), deduplicação, compressão e replicação multi-region**.\n- Tem **SnapMirror** para DR.\n- Usa **tiered storage** (armazenamento em camadas): o dado quente fica em SSD e o dado frio fica em uma camada de capacidade.\n- É compatível com as ferramentas e os workflows NetApp que a empresa já usa.\n\n### Casos de uso\n\n- **Lift-and-shift** de ambientes NetApp on-premises para a AWS sem refazer nada (mover como está).\n- Ambientes Oracle, SAP ou VMware que dependem de NetApp.\n- **Compatibilidade com workflows enterprise** já estabelecidos.",
                    },
                    {
                        type: "quote",
                        value: '**Atalho da prova:** "**estou migrando do NetApp**" ou "**preciso de recursos enterprise tipo SnapMirror**" → **FSx for NetApp ONTAP**.',
                    },
                    { type: "text", value: "## 7. FSx for OpenZFS" },
                    {
                        type: "quote",
                        value: "O sistema de arquivos **ZFS** (que nasceu no Solaris) gerenciado pela AWS.",
                    },
                    {
                        type: "text",
                        value: "### Características\n\n- Fala **NFS** (Linux).\n- Traz os recursos do ZFS: **snapshots instantâneos, clones e compressão LZ4/ZSTD**.\n- Tem boa performance e baixa latência.\n- É mais simples e mais barato que o NetApp ONTAP.\n\n### Casos de uso\n\n- Lift-and-shift de sistemas de arquivos ZFS que rodavam on-premises.\n- Cargas de trabalho Linux que querem features avançadas, como snapshots eficientes e deduplicação (dedup).\n- Uma alternativa mais barata ao ONTAP para quando você não precisa do ecossistema NetApp.\n\n## 8. Tabela mestre - escolher rápido",
                    },
                    {
                        type: "table",
                        value: '[["Cenário","Resposta"],["Várias EC2 **Linux** compartilhando código/dados","**EFS**"],["Filesystem Windows + Active Directory","**FSx for Windows File Server**"],["**HPC / ML training** com performance extrema","**FSx for Lustre**"],["Lift-and-shift de **NetApp on-prem**","**FSx for NetApp ONTAP**"],["ZFS gerenciado pra workload Linux","**FSx for OpenZFS**"],["**Multi-protocolo** (NFS + SMB + iSCSI)","**FSx for NetApp ONTAP**"],["Integração nativa com **S3** para processamento de big data","**FSx for Lustre**"],["Pagar por GB armazenado, sem provisionar capacidade","**EFS** (único elástico de verdade)"],["**Multi-AZ por padrão**, simples","**EFS**"]]',
                    },
                    { type: "text", value: "## 9. EFS vs FSx vs EBS vs S3 (mapa do tesouro)" },
                    {
                        type: "code",
                        value: "              ┌───────────────────────────────────────────┐\n              │           Acesso compartilhado?            │\n              └───────────────┬─────────────────┬─────────┘\n                              │ NÃO             │ SIM\n                              ▼                 ▼\n                    ┌─────────────────┐  ┌─────────────────────┐\n                    │ Block (EBS)     │  │ Sistema operacional?│\n                    └─────────────────┘  └──┬──────────┬───────┘\n                                            │ Linux    │ Windows\n                                            ▼          ▼\n                                   ┌──────────────┐ ┌──────────────────┐\n                                   │ Performance? │ │ FSx for Windows  │\n                                   └─┬──────┬─────┘ └──────────────────┘\n                                Normal│   Extrema (HPC)\n                                     ▼     ▼\n                                ┌────────┐ ┌────────────────┐\n                                │  EFS   │ │ FSx for Lustre │\n                                └────────┘ └────────────────┘\n\n                              ↓ Não preciso de filesystem ↓\n                              ↓ Quero objeto via HTTPS    ↓\n                                        S3",
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"50 EC2 Linux servindo o mesmo conteúdo web"** → **EFS** (NFS multi-AZ).\n2. **"Filesystem Windows com login via Active Directory"** → **FSx for Windows File Server**.\n3. **"ML training lendo terabytes rapidamente"** → **FSx for Lustre**.\n4. **"Migração de servidor NetApp on-prem para AWS sem refazer"** → **FSx for NetApp ONTAP**.\n5. **"Sistema legado que precisa de SMB e NFS ao mesmo tempo"** → **FSx for NetApp ONTAP** (multi-protocolo).\n6. **"Quero compartilhamento NFS multi-AZ que cresce sozinho sem provisionar"** → **EFS**.\n7. **"Pra que serve EFS Standard-IA?"** → arquivos do EFS **acessados raramente**, fica mais barato.\n8. **"EFS One Zone vs Standard"** → One Zone = **1 AZ** (mais barato, dado pode sumir se AZ pifa). Standard = **multi-AZ** (HA).\n9. **"Lustre é persistente?"** → **Tem dois modos**: Scratch (temporário) e Persistent (produção).\n10. **"FSx for Lustre integra com S3?"** → **Sim** - bucket S3 vira input/output do filesystem.\n11. **"Posso usar EFS de fora da VPC (on-prem)?"** → **Sim**, via Direct Connect ou VPN.\n12. **"EBS pode ser compartilhado entre N EC2?"** → **Não** (regra geral - exceção: Multi-Attach em casos específicos). Pra compartilhar, é **EFS**.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Quando a pergunta menciona:\n\n  • "várias EC2 lendo o mesmo arquivo"     → FILE storage (EFS/FSx)\n  • "Linux + NFS"                          → EFS\n  • "Linux + multi-AZ + elástico"          → EFS\n  • "Windows + SMB / Active Directory"     → FSx for Windows File Server\n  • "HPC / ML / TB de throughput"          → FSx for Lustre\n  • "lift-and-shift de NetApp"             → FSx for NetApp ONTAP\n  • "multi-protocolo NFS+SMB+iSCSI"        → FSx for NetApp ONTAP\n  • "ZFS gerenciado"                       → FSx for OpenZFS\n  • "integrar com S3 pra big data"         → FSx for Lustre (link nativo)\n\nEFS - classes:\n  Standard       → multi-AZ, acesso frequente\n  Standard-IA    → multi-AZ, infrequente, mais barato\n  One Zone       → 1 AZ, frequente, recriável\n  One Zone-IA    → 1 AZ, infrequente, mais barato dos 4\n\nEFS é o ÚNICO file storage da AWS que:\n  Escala automaticamente (KB a PB)\n  Cobra só pelo armazenado (sem provisionar capacidade)\n  Multi-AZ por padrão sem configuração extra',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um cluster de servidores web em EC2 com Linux, distribuído em várias Zonas de Disponibilidade, precisa ler e gravar ao mesmo tempo nos mesmos arquivos (por exemplo, a pasta /var/www), com capacidade que cresce e diminui automaticamente conforme o volume de dados. Qual serviço de armazenamento atende a esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon Elastic Block Store (Amazon EBS)", isCorrect: false },
                            { text: "Amazon S3", isCorrect: false },
                            { text: "Amazon Elastic File System (Amazon EFS)", isCorrect: true },
                            {
                                text: "Armazenamento de instância (instance store)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa vai migrar um servidor de arquivos corporativo Windows para a AWS. A solução precisa usar o protocolo SMB, ingressar no domínio do Active Directory e respeitar as permissões NTFS e as ACLs do Windows. Qual serviço é o indicado?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon FSx for Windows File Server", isCorrect: true },
                            { text: "Amazon Elastic File System (Amazon EFS)", isCorrect: false },
                            { text: "Amazon FSx for Lustre", isCorrect: false },
                            { text: "Amazon S3", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe de machine learning precisa de um sistema de arquivos de altíssimo desempenho, com latência abaixo de 1 milissegundo e throughput na casa de centenas de GB/s, capaz de se integrar diretamente a um bucket do Amazon S3 para processar os datasets de treinamento. Qual serviço atende a essa necessidade?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon Elastic File System (Amazon EFS)", isCorrect: false },
                            { text: "Amazon FSx for Lustre", isCorrect: true },
                            { text: "Amazon FSx for Windows File Server", isCorrect: false },
                            { text: "Amazon FSx for OpenZFS", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma organização está fazendo lift-and-shift de um ambiente NetApp ONTAP local para a AWS. Ela precisa de acesso multiprotocolo (NFS, SMB e iSCSI) no mesmo sistema de arquivos e de recursos corporativos como o SnapMirror para recuperação de desastres. Qual serviço deve ser escolhido?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon FSx for Windows File Server", isCorrect: false },
                            { text: "Amazon Elastic File System (Amazon EFS)", isCorrect: false },
                            { text: "Amazon FSx for OpenZFS", isCorrect: false },
                            { text: "Amazon FSx for NetApp ONTAP", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe roda cargas de trabalho Linux e quer um sistema de arquivos gerenciado acessível por NFS, com os recursos do ZFS (snapshots instantâneos, clones e compressão), como uma alternativa mais simples e mais barata ao NetApp ONTAP e sem depender do ecossistema NetApp. Qual serviço atende a esse caso?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon FSx for NetApp ONTAP", isCorrect: false },
                            { text: "Amazon FSx for OpenZFS", isCorrect: true },
                            { text: "Amazon Elastic File System (Amazon EFS)", isCorrect: false },
                            { text: "Amazon FSx for Windows File Server", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Bancos de Dados",
        aulas: [
            {
                titulo: "Bancos de Dados",
                blocks: [
                    {
                        type: "quote",
                        value: "Índice do Módulo 4\nA ideia central deste módulo é simples: na AWS existe um banco de dados pensado para cada tipo de problema, em vez de tentar forçar tudo dentro de um banco só. Você vai encontrar SQL gerenciado (RDS e Aurora), NoSQL serverless (DynamoDB), cache em memória (ElastiCache), data warehouse para análise (Redshift), bancos especializados (grafos, séries temporais, auditoria, documentos e wide-column) e ferramentas de migração (DMS junto com o SCT). Esta nota funciona como o mapa do módulo. Cada serviço tem a sua própria nota dedicada, com os detalhes.",
                    },
                    {
                        type: "text",
                        value: '## 1. Conceitos fundamentais (revisitar antes dos serviços)\n\nAntes de olhar serviço por serviço, vale firmar três divisões que aparecem o tempo todo na prova.\n\n### SQL vs NoSQL\n\nA primeira grande divisão entre bancos. SQL (Structured Query Language, ou linguagem de consulta estruturada) é o mundo dos bancos relacionais, com tabelas bem definidas. NoSQL (de "Not Only SQL") é o mundo dos bancos com estrutura mais solta.',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","**SQL (relacional)**","**NoSQL**"],["Estrutura","Tabelas com **schema rígido**","Schema **flexível** (key-value, doc, grafo)"],["Joins","**Sim** - relacionamentos via FK","**Não** (ou limitado) - dados desnormalizados"],["ACID","Sim, total","Eventualmente, varia"],["Escala","**Vertical** ou **read replicas**","**Horizontal** nativa (sharding)"],["Casos","ERP, CRM, finance","Mobile, IoT, gaming, perfis"],["AWS","**RDS, Aurora**","**DynamoDB, DocumentDB**"]]',
                    },
                    {
                        type: "text",
                        value: "Alguns termos da tabela, explicados: FK é Foreign Key (chave estrangeira), o campo que liga uma tabela a outra. ACID reúne quatro garantias de uma transação: Atomicidade, Consistência, Isolamento e Durabilidade. IoT é Internet of Things (internet das coisas), ou seja, sensores e dispositivos conectados. Escalar na vertical significa colocar uma máquina maior; escalar na horizontal significa espalhar os dados por várias máquinas (sharding).\n\n### OLTP vs OLAP\n\nA segunda divisão separa dois jeitos de usar um banco. OLTP (Online Transaction Processing) é o banco do dia a dia da aplicação, com muitas operações pequenas. OLAP (Online Analytical Processing) é o banco de análise, que cruza montanhas de dados para gerar relatórios.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","**OLTP** (transacional)","**OLAP** (analítico)"],["O que faz","Operações pequenas e frequentes (CRUD)","Agregações complexas sobre dados massivos"],["Latência alvo","Milissegundos","Segundos a minutos é ok"],["Volume","GB a TB","TB a PB"],["AWS","RDS, Aurora, DynamoDB","**Redshift**, Athena"]]',
                    },
                    {
                        type: "text",
                        value: 'CRUD é o conjunto de operações básicas: criar, ler, atualizar e apagar (Create, Read, Update, Delete). PB é petabyte, mil vezes um terabyte.\n\n### Managed vs Unmanaged\n\nA terceira divisão é sobre quem cuida do banco. "Managed" (gerenciado) quer dizer que a AWS assume a parte chata de operar o banco.',
                    },
                    {
                        type: "quote",
                        value: 'O que o "managed" da AWS resolve\nA AWS provisiona a instância e o storage, aplica os **patches** (correções de software), faz **backups automáticos**, mantém um **standby pra failover** (uma cópia pronta para assumir se a principal cair), monitora tudo com o CloudWatch e atualiza a versão do engine. **A sua responsabilidade** continua sendo: schema, queries, índices e a segurança no nível da aplicação.',
                    },
                    {
                        type: "text",
                        value: "## 2. Mapa do módulo\n\nEsta tabela mostra, de relance, qual serviço resolve cada categoria e onde ler mais.",
                    },
                    {
                        type: "table",
                        value: '[["Categoria","Serviço","Nota dedicada"],["**SQL gerenciado**","Amazon RDS","RDS"],["**SQL premium**","Amazon Aurora","Aurora"],["**NoSQL serverless**","Amazon DynamoDB","DynamoDB"],["**Cache em memória**","Amazon ElastiCache (+ MemoryDB)","ElastiCache"],["**Data warehouse**","Amazon Redshift","Redshift"],["**Especializados**","Neptune, DocumentDB, Timestream, QLDB, Keyspaces","Bancos Especializados"],["**Migração**","AWS DMS + SCT","DMS - Database Migration"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Decision tree - qual banco escolher\n\nUse este fluxograma como guia rápido de escolha. Comece pela pergunta do topo (que tipo de dado?) e vá descendo.",
                    },
                    {
                        type: "code",
                        value: "                  Que tipo de dado?\n                         │\n        ┌────────────────┼─────────────────┐\n        ▼                ▼                 ▼\n     SQL/relacional   NoSQL              Analytics/BI\n        │                │                 │\n        │                │                 ▼\n        │                │           Redshift (PB)\n        │                │           Athena (SQL em S3)\n        │                │\n        │      ┌─────────┼─────────┬─────────┬──────────┐\n        │      ▼         ▼         ▼         ▼          ▼\n        │  Key-value  Document  Graph   Time series   Audit\n        │  /Doc       Mongo                immutable\n        │      │     compat                   │\n        │      ▼      │                       ▼\n        │  DynamoDB Bancos Especializados\n        │\n        ▼\n   Engine?\n        ├── MySQL/PostgreSQL alta performance → Aurora\n        ├── MySQL/PostgreSQL simples         → RDS\n        ├── Oracle / SQL Server / MariaDB    → RDS (Aurora não tem)\n        ├── Tráfego imprevisível             → Aurora Serverless v2\n        └── Audit trail imutável             → QLDB\n\n   Sempre considerar adicionar:\n        ▶ ElastiCache (cache de queries → alivia o banco)\n        ▶ RDS Proxy (pool de conexões pra Lambda)",
                    },
                    {
                        type: "text",
                        value: '## 4. Atalhos pra prova (consolidado)\n\nEste bloco junta os "de cara, responda isto" de todo o módulo. Vale reler antes da prova.',
                    },
                    {
                        type: "code",
                        value: 'SQL gerenciado:\n  RDS         → MySQL / PostgreSQL / MariaDB / Oracle / SQL Server\n  Aurora      → MySQL / PostgreSQL turbinados (AWS-native, 5× / 3×)\n\nNoSQL:\n  DynamoDB    → key-value/document, serverless, ms\n  DocumentDB  → MongoDB compatible\n  Keyspaces   → Cassandra compatible\n  Neptune     → grafo\n  Timestream  → time series (IoT)\n  QLDB        → ledger imutável\n\nIn-memory:\n  ElastiCache → cache (Redis ou Memcached, pode perder no failover)\n  MemoryDB    → Redis durável (banco primário em memória)\n\nAnalytics:\n  Redshift    → data warehouse, PB, colunar\n  Athena      → SQL direto em S3, serverless\n\nHA / escala (SQL):\n  Multi-AZ        → HA com standby (NÃO atende leituras)\n  Read Replicas   → escala leitura (até 15, assíncrono)\n  Aurora Global   → replicação cross-region < 1s\n\nMigração:\n  DMS         → mover dados (homogênea ou heterogênea)\n  DMS + SCT   → converter schema entre engines diferentes (SCT é grátis)\n\nPor cenário:\n  "MySQL/Postgres performance turbinada"   → Aurora\n  "MongoDB compatible"                     → DocumentDB\n  "Graph / fraude / rede social"           → Neptune\n  "Data warehouse PB"                      → Redshift\n  "SQL no S3 sem provisionar"              → Athena\n  "Audit trail imutável"                   → QLDB\n  "Time series IoT"                        → Timestream\n  "Cache de queries"                       → ElastiCache\n  "Multi-region NoSQL ativo-ativo"         → DynamoDB Global Tables\n  "Migrar Oracle → Postgres"               → DMS + SCT',
                    },
                    {
                        type: "text",
                        value: "## 5. Notas relacionadas (cross-module)\n\nBancos não vivem sozinhos. Estes são os pontos de contato com o resto da AWS:\n\n- Armazenamento - 3 Tipos: os bancos usam storage por baixo (EBS para o RDS, S3 para Athena e Spectrum).\n- EBS - Snapshots: o RDS usa snapshots do EBS por baixo dos panos.\n- S3 - Storage Classes: o Redshift Spectrum e o Athena leem direto do S3.\n- Lambda - Compute Serverless: o RDS Proxy é quem resolve o problema de conexões do Lambda para o RDS.\n- ELB - Elastic Load Balancer: o load balancing fica entre a aplicação e o banco.\n- Containers - Fargate: apps em containers que conversam com RDS e DynamoDB.\n- EC2 - Visão Geral: você sempre PODE rodar um banco dentro de uma EC2 por conta própria (não gerenciado), mas isso raramente é o melhor caminho.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa precisa executar consultas analíticas complexas (OLAP) sobre petabytes de dados históricos para gerar relatórios de negócio. Qual serviço da AWS é o data warehouse indicado para essa carga?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon Redshift", isCorrect: true },
                            { text: "Amazon DynamoDB", isCorrect: false },
                            { text: "Amazon ElastiCache", isCorrect: false },
                            { text: "Amazon RDS for MySQL", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo mobile precisa de um banco NoSQL totalmente gerenciado e serverless, com latência de milissegundos de um dígito em qualquer escala. Qual serviço atende esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon DynamoDB", isCorrect: true },
                            { text: "Amazon Aurora", isCorrect: false },
                            { text: "Amazon Redshift", isCorrect: false },
                            { text: "Amazon Neptune", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe habilitou o Multi-AZ em uma instância do Amazon RDS esperando distribuir as consultas de leitura para a cópia em standby. Qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O standby do Multi-AZ serve para alta disponibilidade e failover automático, não atende leituras; para escalar leituras use Read Replicas",
                                isCorrect: true,
                            },
                            {
                                text: "O standby do Multi-AZ passa a atender leituras automaticamente, dobrando a capacidade de leitura",
                                isCorrect: false,
                            },
                            {
                                text: "O Multi-AZ elimina a necessidade de backups porque mantém duas cópias ativas do banco",
                                isCorrect: false,
                            },
                            {
                                text: "O Multi-AZ replica os dados entre regiões diferentes para reduzir a latência global de leitura",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação descreve corretamente o Amazon Aurora?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É compatível com MySQL e PostgreSQL e entrega desempenho superior ao RDS dessas engines",
                                isCorrect: true,
                            },
                            {
                                text: "É compatível com Oracle e SQL Server, dispensando o licenciamento desses bancos",
                                isCorrect: false,
                            },
                            {
                                text: "É um banco NoSQL de documentos compatível com MongoDB",
                                isCorrect: false,
                            },
                            {
                                text: "É um data warehouse colunar voltado para análise de petabytes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa vai migrar um banco Oracle on-premises para o Amazon RDS for PostgreSQL. Como as engines de origem e destino são diferentes, qual combinação de ferramentas converte o schema e move os dados?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS DMS junto com o AWS SCT, que converte o schema entre engines diferentes",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas o AWS DMS, pois ele nunca precisa de conversão de schema",
                                isCorrect: false,
                            },
                            { text: "Amazon Athena com o Redshift Spectrum", isCorrect: false },
                            {
                                text: "Apenas o AWS Snowball para copiar os arquivos do banco",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon RDS - Relational Database Service",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nRDS (Relational Database Service) é a forma **gerenciada** de rodar bancos **SQL** na AWS. Você escolhe o **engine** (o motor do banco, tipo MySQL) e o **tipo de instância** (o tamanho da máquina); a AWS cuida do resto: **provisionamento, patches, backups, replicação, monitoramento e failover**. Assim você foca no que é seu: **schema, queries e a segurança no nível da aplicação**, sem virar administrador de sistema de banco.",
                    },
                    {
                        type: "text",
                        value: "## 1. Engines suportados\n\nO engine é o software de banco que roda por dentro. O RDS oferece seis opções:",
                    },
                    {
                        type: "table",
                        value: '[["Engine","Categoria"],["**MySQL**","Open source, mais popular"],["**PostgreSQL**","Open source, recursos avançados"],["**MariaDB**","Fork do MySQL"],["**Oracle**","Comercial (BYOL ou License Included)"],["**Microsoft SQL Server**","Comercial (License Included disponível)"],["**Amazon Aurora**","Engine premium da AWS (MySQL/PostgreSQL compatible) - ver Aurora"]]',
                    },
                    {
                        type: "text",
                        value: "Oracle e SQL Server são comerciais, então têm dois modelos de licença:",
                    },
                    {
                        type: "quote",
                        value: '**Modelos de licenciamento Oracle/SQL Server:**\n- **BYOL** (Bring Your Own License, ou "traga sua própria licença") - você usa uma licença que já comprou e pode até rodar em Dedicated Host.\n- **License Included** - você paga por hora e a AWS já embute a licença da Microsoft ou da Oracle no preço.',
                    },
                    {
                        type: "text",
                        value: "## 2. Como funciona (arquitetura básica)\n\nO caminho é direto: a sua aplicação abre uma conexão, chega num endpoint (um endereço DNS estável) e esse endpoint aponta para a instância do banco.",
                    },
                    {
                        type: "code",
                        value: "   Sua aplicação\n        │\n        │ JDBC/ODBC connection string\n        ▼\n   ┌─────────────────────────────┐\n   │ RDS Endpoint                 │\n   │ (DNS estável)                │\n   └──────────┬───────────────────┘\n              │\n              ▼\n   ┌─────────────────────────────┐\n   │ Instância RDS (EC2 + EBS)    │\n   │  - Engine MySQL/Postgres/etc │\n   │  - Sua database              │\n   │  - Backups automáticos       │\n   │  - Patching gerenciado       │\n   └─────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: "Por baixo existe uma EC2 com disco EBS, mas você nunca entra por SSH nessa máquina. Toda essa camada é abstraída pela AWS.\n\n## 3. Multi-AZ - alta disponibilidade\n\nMulti-AZ significa manter uma cópia do banco em outra AZ (Availability Zone, ou zona de disponibilidade, que é um data center separado). Essa cópia, o standby, fica pronta para assumir se a principal cair.",
                    },
                    {
                        type: "code",
                        value: "   App (write/read)\n       │\n       ▼\n   ┌──────────────┐   replicação síncrona   ┌──────────────┐\n   │ RDS PRIMARY  │ ──────────────────────▶│ RDS STANDBY  │\n   │ (us-east-1a) │                         │ (us-east-1b) │\n   └──────────────┘                         └──────────────┘\n       ▲\n       │ se primary cair, DNS aponta automaticamente\n       │ pro standby (failover ~60-120s)",
                    },
                    {
                        type: "text",
                        value: "**Características:**\n- A replicação é **síncrona**, ou seja, cada escrita só é confirmada depois de chegar no standby. Isso garante zero perda de dados.\n- O **failover é automático** quando a AZ ou a instância primária cai.\n- O standby **NÃO atende leituras**. Ele existe só para alta disponibilidade, fica de reserva.\n- Custo: você paga **2× compute + storage**, porque roda as duas instâncias.\n- A latência de escrita fica um pouco maior, já que cada write espera a replicação terminar.",
                    },
                    {
                        type: "quote",
                        value: "**Pegadinha clássica:** Multi-AZ é sobre **disponibilidade**, NÃO sobre escalar leitura. Para escalar leitura, o serviço certo é o **Read Replicas**.",
                    },
                    {
                        type: "text",
                        value: "## 4. Read Replicas - escalando leituras\n\nRead Replica é uma cópia extra do banco feita só para atender leituras. Você tira a carga de relatórios e consultas da instância principal e joga nas réplicas.",
                    },
                    {
                        type: "code",
                        value: "   App (writes) ──────▶ RDS PRIMARY (Multi-AZ ou não)\n                              │ replicação ASSÍNCRONA\n                  ┌───────────┼───────────────┐\n                  ▼           ▼               ▼\n              RR-1 (us-1a) RR-2 (us-1b)   RR-3 (eu-1)\n              (só leitura)                 (cross-region)\n   App (reads) ──▶ qualquer RR",
                    },
                    {
                        type: "text",
                        value: "**Características:**\n- Até **15 read replicas** (no RDS tradicional) ou **15 Aurora replicas**.\n- A replicação é **assíncrona**, então pode existir **lag** (atraso) de milissegundos a segundos entre a principal e a réplica.\n- A réplica pode ficar em **outra AZ ou até em outra região** (é a cross-region read replica).\n- Uma réplica pode ser **promovida a primary**, seja para recuperação de desastre, seja num split-brain feito manualmente.\n- Cada réplica **cobra como instância separada**, pagando o próprio compute e storage.\n\n### Casos de uso\n\n- **Distribuir leituras** de relatórios e dashboards sem sobrecarregar a principal.\n- **Latência baixa global**, colocando uma réplica na região perto do cliente.\n- **DR** (Disaster Recovery, recuperação de desastre), promovendo uma réplica em outra região se a principal explodir.\n- **Análise offline**, rodando queries pesadas na réplica sem atrapalhar o OLTP.",
                    },
                    {
                        type: "quote",
                        value: "**Combina:** Multi-AZ (alta disponibilidade) e Read Replicas (escala) não são alternativas, são complementares. Você pode usar os dois ao mesmo tempo.",
                    },
                    {
                        type: "text",
                        value: "## 5. Backups\n\nO RDS tem dois tipos de backup, e a diferença cai bastante na prova.\n\n### Automated backups\n- Vêm **ativados por padrão**, com retenção de **1 a 35 dias** (o padrão é 7).\n- Combinam um backup diário com os **transaction logs contínuos**. Juntos, eles dão o **Point-in-Time Recovery (PITR)**, ou recuperação para um ponto no tempo.\n- Com PITR você restaura para **qualquer segundo** dentro da janela de retenção.\n- Ficam guardados num **S3 gerenciado pela AWS** e não são cobrados por GB-mês até passarem do tamanho do volume.\n- São **apagados quando a instância é deletada**, a não ser que você marque a opção de final snapshot.\n\n### Manual snapshots\n- São criados por você e **ficam guardados até você apagar**, não expiram sozinhos.\n- **Sobrevivem** ao terminate da instância.\n- Podem ser **copiados para outra região** (útil para DR).\n- Podem ser **compartilhados com outra conta** (em modo somente leitura).",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "Quero deletar a instância, mas guardar o backup para restaurar no futuro." A resposta é criar um **manual snapshot** ou marcar o **final snapshot** na hora do delete.',
                    },
                    {
                        type: "text",
                        value: "## 6. Storage (volumes EBS por baixo)\n\nO disco do RDS é um volume EBS. Você escolhe o tipo conforme a necessidade de performance:",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Performance","Custo","Caso de uso"],["**gp3** (default)","Bom equilíbrio","$$","Maioria dos workloads OLTP"],["**gp2** (legado)","Antigo IOPS por tamanho","$$","Migrar pra gp3"],["**io1 / io2**","IOPS provisionado, latência baixíssima","$$$$","Workloads críticos, alto IOPS sustentado"],["**Magnetic (legado)**","Baixo throughput","$","Não use mais"]]',
                    },
                    {
                        type: "text",
                        value: "IOPS é a quantidade de operações de entrada e saída por segundo, uma medida de quão rápido o disco responde.\n\n**Storage auto-scaling:** o RDS consegue **aumentar o disco sozinho** quando ele chega a uma certa porcentagem de uso. Só cresce, nunca diminui.\n\n## 7. RDS Proxy - pool de conexões gerenciado\n\nO RDS Proxy resolve um problema clássico da combinação **Lambda + RDS**. O Lambda escala para milhares de invocações ao mesmo tempo, e cada uma tenta abrir a própria conexão. Esse monte de conexões abre e fecha o tempo todo e acaba matando o banco.",
                    },
                    {
                        type: "code",
                        value: "   Lambda (10000 invocations) ──▶ RDS Proxy (pool de conexões) ──▶ RDS\n                                         │\n                                         └ reusa conexões existentes\n                                           sem estourar limite do banco",
                    },
                    {
                        type: "text",
                        value: "**Benefícios:**\n- **Multiplica as conexões** efetivas sem sobrecarregar o banco, porque reaproveita um pool.\n- **Failover transparente**: o proxy detecta o failover e redireciona sem a app perceber.\n- **Auth via IAM** (Identity and Access Management), o que evita deixar credenciais escritas dentro do Lambda.\n\n## 8. Outros recursos importantes",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Para que serve"],["**IAM Authentication**","Login no banco usando credenciais AWS (sem senha)"],["**Encryption at rest**","Via KMS (transparente, gratis)"],["**Encryption in transit**","TLS/SSL nas conexões"],["**Performance Insights**","Dashboard de análise de queries lentas e bottlenecks"],["**Enhanced Monitoring**","Métricas de SO da instância (CPU, memória, processos)"],["**Parameter Groups**","Configurações do engine (innodb_buffer_pool_size etc.)"],["**Option Groups**","Add-ons do engine (Oracle TDE, SQL Server SSAS, etc.)"],["**Maintenance Window**","Janela semanal pra patches automáticos"]]',
                    },
                    {
                        type: "text",
                        value: 'Dois termos da tabela: KMS é o Key Management Service, o serviço de chaves da AWS que faz a criptografia em repouso de forma transparente. "At rest" é o dado gravado no disco; "in transit" é o dado viajando pela rede.\n\n## 9. Pricing\n\nO preço do RDS se divide em partes:\n\n1. **Compute**, cobrado por hora da instância (On-Demand ou Reserved).\n2. **Storage**, cobrado por GB-mês do volume EBS.\n3. **Backup storage**, cobrado só se você exceder o tamanho do volume original.\n4. **Data transfer**, para dados que saem da região.\n\nLembre que o Multi-AZ **dobra** o custo de compute mais storage, porque você paga também a instância standby.\n\n## 10. Pegadinhas comuns da prova\n\n1. **"HA com failover automático"** → **Multi-AZ**.\n2. **"Escala de leitura"** → **Read Replicas**.\n3. **"Restaurar pra um momento específico no passado"** → **Point-in-Time Recovery (automated backup)**.\n4. **"Guardar backup independente da instância"** → **Manual snapshot**.\n5. **"DR cross-region SQL"** → **Cross-region Read Replica** (depois promover) ou copy snapshot.\n6. **"Lambda + RDS = problema de conexão"** → **RDS Proxy**.\n7. **"Multi-AZ standby atende leitura?"** → **Não**. Só Read Replicas atendem.\n8. **"Multi-AZ vs Read Replica"** - Multi-AZ é HA (síncrono); Read Replica é escala (assíncrono).\n9. **"License Included vs BYOL"** - License Included paga AWS, BYOL é sua licença.\n10. **"Storage cresce sozinho?"** → **Sim**, com Storage Auto Scaling habilitado (só pra cima).\n11. **"Aurora é RDS?"** → **Sim, tecnicamente** - Aurora é um engine RDS, mas tem arquitetura própria.\n12. **"O que o RDS NÃO faz por mim?"** → **schema, queries, índices, performance tuning de queries** - isso é seu.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'RDS = SQL gerenciado pela AWS\n       Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora\n\nAlta disponibilidade:\n  Multi-AZ      → standby síncrono em outra AZ (HA, failover ~2 min)\n                  STANDBY NÃO ATENDE LEITURA\n\nEscala de leitura:\n  Read Replicas → até 15 replicas assíncronas\n                  podem estar em outra região (cross-region)\n                  podem ser promovidas a primary (DR)\n\nBackup:\n  Automated     → diário + log contínuo = PITR (1-35 dias retenção)\n                  Apagados ao deletar instância\n  Manual        → retidos até você apagar, cross-region, cross-account\n\nStorage: gp3 (default), io1/io2 (high IOPS)\n         Storage auto-scaling: cresce sozinho, não diminui\n\nRecursos:\n  RDS Proxy       → pool conexões pra Lambda\n  IAM Auth        → login sem senha (via IAM)\n  Encryption KMS  → at rest + in transit (TLS)\n  Performance Insights → dashboard de queries\n  Maintenance Window   → janela semanal pra patches\n\nAtalhos pra prova:\n  "HA com failover"               → Multi-AZ\n  "escala read"                   → Read Replicas\n  "restaurar momento exato"       → PITR (automated backup)\n  "DR cross-region"               → cross-region RR ou copy snapshot\n  "Lambda escalando matando o DB" → RDS Proxy\n  "snapshot independente"         → manual snapshot',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa executa um banco de dados relacional no Amazon RDS e quer alta disponibilidade com failover automático para uma instância em espera (standby) em outra Zona de Disponibilidade, sem perda de dados. Qual recurso do RDS atende a esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "Implantação Multi-AZ", isCorrect: true },
                            { text: "Read Replica", isCorrect: false },
                            { text: "Amazon RDS Proxy", isCorrect: false },
                            { text: "Storage auto-scaling", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A instância principal de um banco no Amazon RDS está sobrecarregada por relatórios e consultas de leitura pesadas. Qual recurso permite escalar a capacidade de leitura distribuindo essas consultas em cópias adicionais do banco?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Read Replicas, que atendem consultas de leitura por replicação assíncrona",
                                isCorrect: true,
                            },
                            {
                                text: "Multi-AZ, cuja instância standby responde às consultas de leitura",
                                isCorrect: false,
                            },
                            {
                                text: "RDS Proxy, que distribui as leituras criando novas cópias do banco",
                                isCorrect: false,
                            },
                            {
                                text: "Snapshots manuais restaurados periodicamente para as consultas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao usar o Amazon RDS em vez de instalar e administrar o banco de dados em uma instância EC2 gerenciada pela própria empresa, qual tarefa passa a ser responsabilidade da AWS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Aplicar patches no mecanismo do banco e executar os backups automatizados",
                                isCorrect: true,
                            },
                            {
                                text: "Modelar o schema e otimizar as consultas SQL da aplicação",
                                isCorrect: false,
                            },
                            {
                                text: "Definir as permissões de acesso dos usuários dentro do banco",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher o engine e o tipo de instância da implantação",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das opções a seguir NÃO é um mecanismo (engine) de banco de dados disponível no Amazon RDS?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon DynamoDB", isCorrect: true },
                            { text: "MySQL", isCorrect: false },
                            { text: "PostgreSQL", isCorrect: false },
                            { text: "Microsoft SQL Server", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe vai excluir uma instância do Amazon RDS, mas precisa guardar uma cópia dos dados para restaurar meses depois. Qual a forma correta de garantir que o backup sobreviva à exclusão da instância?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Criar um snapshot manual ou solicitar o snapshot final ao excluir a instância",
                                isCorrect: true,
                            },
                            {
                                text: "Manter os backups automatizados, que sobrevivem à exclusão da instância",
                                isCorrect: false,
                            },
                            {
                                text: "Promover uma Read Replica para preservar os dados após a exclusão",
                                isCorrect: false,
                            },
                            {
                                text: "Ampliar a retenção de backup para 35 dias antes de excluir a instância",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon Aurora - RDS premium da AWS",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nAurora é o engine **proprietário da AWS** que entrega bancos **compatíveis com MySQL e com PostgreSQL**, mas com performance bem maior (a AWS anuncia **5× o MySQL** e **3× o PostgreSQL**). Por baixo, o storage é distribuído, cresce sozinho até 128 TB e fica replicado em **6 cópias espalhadas por 3 AZs**, com suporte a até **15 read replicas**. Custa por volta de 20% mais que o RDS tradicional, mas a relação custo por performance sai melhor em workloads sérios.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que torna Aurora diferente do RDS tradicional\n\nO truque do Aurora está no storage. A AWS reescreveu do zero a **camada de armazenamento** do MySQL e do PostgreSQL. O engine de query continua o mesmo (100% compatível, o app não percebe diferença), mas o disco por baixo é totalmente proprietário da AWS.",
                    },
                    {
                        type: "code",
                        value: "   ┌──────────────────────────────────────┐\n   │ Engine MySQL/PostgreSQL (compatível) │ ← seu app não percebe diferença\n   └──────────────┬───────────────────────┘\n                  │\n                  ▼\n   ┌──────────────────────────────────────────┐\n   │ Storage layer Aurora (proprietário AWS)   │\n   │                                            │\n   │  6 cópias × 3 AZs = sempre 6 redundâncias  │\n   │  Auto-scale 10 GB → 128 TB                 │\n   │  Self-healing (detecta e repara blocos)    │\n   │  Throughput 5×/3× do RDS tradicional        │\n   └──────────────────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: "## 2. Storage replicado - 6 cópias × 3 AZs\n\nAurora sempre mantém seis cópias dos dados, duas em cada uma das três AZs. Isso deixa o banco muito resistente a falhas.",
                    },
                    {
                        type: "code",
                        value: "         AZ-a              AZ-b              AZ-c\n       ┌──────┐          ┌──────┐          ┌──────┐\n       │ cópia│          │ cópia│          │ cópia│\n       │ cópia│          │ cópia│          │ cópia│\n       └──────┘          └──────┘          └──────┘\n\nAurora aceita write se 4 das 6 cópias confirmarem.\nAurora aceita read se 3 das 6 cópias confirmarem.\n\n→ tolera perda de TODA UMA AZ + 1 cópia em outra AZ\n→ continua funcionando, com self-healing automático",
                    },
                    {
                        type: "text",
                        value: "**Implicações:**\n- **Durabilidade alta**: na prática, é irreal perder um dado.\n- **Disponibilidade alta**, mesmo quando uma AZ inteira falha.\n- **Failover em cerca de 30 segundos**, bem mais rápido que o Multi-AZ do RDS tradicional.\n- **Storage auto-scaling** sem downtime, crescendo em incrementos de 10 GB até chegar a 128 TB.\n\n## 3. Endpoints - onde sua aplicação se conecta\n\nUm cluster Aurora expõe **vários endpoints DNS**, cada um com um papel. Isso deixa a aplicação organizada: você manda escrita para um lugar e leitura para outro.",
                    },
                    {
                        type: "table",
                        value: '[["Endpoint","O que faz"],["**Cluster endpoint** (writer)","Aponta sempre pra instância **primary** (escreve aqui)"],["**Reader endpoint**","Load-balanceia entre as **replicas de leitura**"],["**Custom endpoint**","Você define qual subset de instâncias atende (ex: instâncias maiores pra relatório)"],["**Instance endpoint**","Aponta pra uma instância específica (raramente usado direto)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** aponte as escritas para o cluster endpoint e as leituras para o reader endpoint. Assim a aplicação já fica balanceada de forma automática.",
                    },
                    {
                        type: "text",
                        value: "## 4. Read Replicas Aurora - superpoder\n\nAqui está uma das maiores vantagens do Aurora. Compare com o RDS tradicional:",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**RDS tradicional**","**Aurora**"],["Quantidade máxima","5 (15 no Aurora MySQL)","**15**"],["Lag de replicação","ms a segundos","**< 100ms** (storage compartilhado)"],["Failover pra replica","Manual ou config","**Automático** em ~30s"],["Custo por replica","Compute + storage separado","**Só compute** (storage é compartilhado!)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Bombástico:** as 15 réplicas do Aurora compartilham o mesmo storage. Como você não paga storage duplicado, apenas o compute extra de cada réplica, escalar leitura sai bem mais barato.",
                    },
                    {
                        type: "text",
                        value: "## 5. Aurora Serverless\n\nAurora Serverless é a versão **sem provisionamento de capacidade**. Em vez de você escolher o tamanho da instância, o Aurora liga e desliga o compute conforme a demanda.\n\n### Como funciona",
                    },
                    {
                        type: "code",
                        value: "   Tráfego baixo:    Aurora roda em 2 ACU\n   Tráfego sobe:     Aurora escala pra 32 ACU em segundos\n   Tráfego zera:     Aurora pausa (paga $0)",
                    },
                    {
                        type: "text",
                        value: "ACU é a Aurora Capacity Unit, a unidade de capacidade que serve de base para a cobrança.\n\n### Quando usar\n\n- **Apps com tráfego imprevisível** ou que vai e volta.\n- **Ambientes de dev e test**: acabou o expediente, o banco pausa e você não paga.\n- **Novos apps**, quando você ainda não sabe o tamanho certo da instância.\n- **Workloads esporádicos**, como relatórios mensais e jobs que rodam de madrugada.\n\n**NÃO é a melhor escolha para:**\n- Workload alto e constante 24 horas por dia (aí o Aurora provisionado sai mais barato).\n- Casos que exigem latência ultra baixa o tempo todo, porque sair da pausa (o warming) leva alguns segundos.\n\n### Versões\n\n- **Aurora Serverless v1** - versão legada, que escala em degraus discretos.\n- **Aurora Serverless v2** - versão atual, com escala granular (frações de ACU). É a recomendada.\n\n## 6. Aurora Global Database\n\nO Aurora Global Database faz **replicação entre regiões** com latência muito baixa.",
                    },
                    {
                        type: "code",
                        value: "        Região PRIMARY                   Região SECUNDÁRIA\n        (us-east-1, write)               (eu-west-1, só read)\n          │                                       ▲\n          │ replicação assíncrona < 1s             │\n          └───────────────────────────────────────▶\n\nEm DR (primary cai):\n  - Promove secundária a primary em < 1 minuto (RTO)\n  - Perda potencial: < 1 segundo de dados (RPO)",
                    },
                    {
                        type: "text",
                        value: "RTO (Recovery Time Objective) é quanto tempo você leva para voltar a funcionar. RPO (Recovery Point Objective) é quanto de dado você aceita perder, medido em tempo.\n\n**Características:**\n- Até **5 regiões secundárias**.\n- **Lag menor que 1 segundo**, mesmo cruzando regiões.\n- **Tempo de recuperação menor que 1 minuto** para promover a secundária.\n- Cada região secundária pode ter **até 16 read replicas locais**.\n\n### Casos de uso\n\n- **Apps globais** que precisam de leituras locais em várias regiões.\n- **DR entre regiões** com RTO e RPO baixos.\n- **Analytics global**, rodando queries locais dentro de cada região.\n\n## 7. Aurora vs RDS tradicional - quando escolher cada um",
                    },
                    {
                        type: "table",
                        value: '[["Cenário","Resposta"],["Workload MySQL/PostgreSQL com tráfego alto e exigente","**Aurora**"],["Precisa de até 15 read replicas com lag < 100ms","**Aurora**"],["Replicação cross-region rápida (DR sério)","**Aurora Global Database**"],["Tráfego imprevisível, intermitente, dev/test","**Aurora Serverless v2**"],["Precisa rodar **Oracle / SQL Server / MariaDB**","**RDS tradicional** (Aurora não suporta)"],["Workload simples, custo é prioridade máxima","**RDS tradicional**"],["Auto-scale storage automático até 128 TB","**Aurora**"]]',
                    },
                    { type: "text", value: "## 8. Recursos exclusivos do Aurora" },
                    {
                        type: "table",
                        value: '[["Recurso","Para que serve"],["**Backtrack** (Aurora MySQL)","\\"Voltar no tempo\\" o cluster inteiro sem restore - segundos"],["**Database Cloning**","Clonar o banco **sem copiar dados** (copy-on-write) - segundos"],["**Parallel Query**","Distribui agregação entre nós do storage layer"],["**Aurora Machine Learning**","SQL functions que chamam SageMaker/Comprehend nativamente"],["**Performance Insights**","Análise profunda de queries lentas"]]',
                    },
                    {
                        type: "quote",
                        value: "**Database Cloning** é o recurso que mais surpreende: ele cria uma cópia do banco em segundos para o time de dev ou test usar. Como funciona por copy-on-write (só copia o que muda), não consome storage adicional de cara.",
                    },
                    { type: "text", value: "## 9. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Compute (instances)**","Por hora da instância (On-Demand ou Reserved)"],["**Storage**","$/GB-mês **do que está realmente armazenado**"],["**I/O**","$/milhão de I/O requests (varia por modo)"],["**Backup**","Igual RDS - grátis até o tamanho do volume"],["**Aurora Serverless**","$/ACU-hora (escala a cada segundo)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Custo extra, mas economia em escala:** o Aurora cobra por volta de 20% a mais por instância que o RDS MySQL. Só que o storage compartilhado entre as réplicas, mais o auto-scaling e a performance por dólar melhor, costumam vencer em workloads grandes.",
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"MySQL/PostgreSQL turbinado, replicação 6× em 3 AZs"** → **Aurora**.\n2. **"15 read replicas com baixíssimo lag"** → **Aurora** (RDS tradicional faz 5-15 mas com mais lag).\n3. **"Tráfego imprevisível, não quero provisionar capacidade"** → **Aurora Serverless v2**.\n4. **"Replicação cross-region em < 1s"** → **Aurora Global Database**.\n5. **"Recuperar cluster pra X segundos atrás sem restore"** → **Aurora Backtrack**.\n6. **"Clonar banco pra dev em segundos sem custo de storage"** → **Aurora Database Cloning**.\n7. **"Aurora suporta Oracle?"** → **Não**. Só MySQL e PostgreSQL compatible.\n8. **"Quem cuida do failover no Aurora?"** → **Automático** em ~30s (vs 60-120s do RDS Multi-AZ).\n9. **"Storage máximo Aurora?"** → **128 TB**, escala em incrementos de 10 GB.\n10. **"Aurora é compatível com qual driver?"** → drivers **MySQL** ou **PostgreSQL** padrão (zero mudança no app).\n11. **"Tolera perda de quantas cópias antes de perder dados?"** → tolera perda **de até 2 cópias** (escreve em 4/6) ou **uma AZ inteira + 1 cópia**.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Aurora = engine premium AWS, MySQL/PostgreSQL compatibles\n         5× MySQL, 3× PostgreSQL em throughput\n         Storage 6 cópias × 3 AZs, auto-scale até 128 TB\n         Até 15 read replicas (lag < 100ms)\n         Failover ~30s (vs 60-120s do RDS Multi-AZ)\n\nEndpoints:\n  Cluster (writer)  → primary\n  Reader            → load balance entre replicas\n  Custom            → subset que você define\n  Instance          → instância específica\n\nVariantes:\n  Aurora Provisioned → instância fixa, mais barato em escala\n  Aurora Serverless v2 → auto-scale por ACU, ideal pra tráfego variável\n  Aurora Global DB    → replicação cross-region, lag < 1s, DR top\n\nRecursos exclusivos:\n  Backtrack          → voltar no tempo o cluster (segundos)\n  Database Cloning   → clonar sem copiar dados (copy-on-write)\n  Parallel Query     → agregação distribuída no storage layer\n\nAtalhos pra prova:\n  "MySQL/Postgres performance"        → Aurora\n  "tráfego imprevisível, sem provisionar" → Aurora Serverless v2\n  "DR cross-region rápido"            → Aurora Global Database\n  "clone instantâneo"                 → Database Cloning\n  "voltar no tempo"                   → Backtrack\n  "Oracle ou SQL Server"              → NÃO Aurora (use RDS)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O Amazon Aurora é o mecanismo de banco de dados relacional proprietário da AWS, construído para a nuvem. Com quais motores de banco de dados o Aurora é compatível?",
                        difficulty: "facil",
                        options: [
                            { text: "Oracle e Microsoft SQL Server", isCorrect: false },
                            { text: "MySQL e PostgreSQL", isCorrect: true },
                            { text: "MariaDB e MongoDB", isCorrect: false },
                            { text: "Microsoft SQL Server e PostgreSQL", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Para garantir alta durabilidade e disponibilidade, de que forma o Amazon Aurora replica os dados na sua camada de armazenamento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Mantém 3 cópias dos dados dentro de uma única Zona de Disponibilidade",
                                isCorrect: false,
                            },
                            {
                                text: "Mantém 2 cópias dos dados replicadas entre 2 Regiões",
                                isCorrect: false,
                            },
                            {
                                text: "Mantém 6 cópias dos dados distribuídas em 3 Zonas de Disponibilidade",
                                isCorrect: true,
                            },
                            {
                                text: "Mantém 6 cópias dos dados espalhadas em 6 Regiões diferentes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa escalar a capacidade de leitura de um banco Aurora adicionando réplicas que compartilham o mesmo armazenamento. Qual é o número máximo de réplicas de leitura (Aurora Replicas) suportado por um cluster Aurora?",
                        difficulty: "medio",
                        options: [
                            { text: "Até 5 réplicas de leitura", isCorrect: false },
                            { text: "Até 15 réplicas de leitura", isCorrect: true },
                            { text: "Até 3 réplicas de leitura", isCorrect: false },
                            { text: "Até 30 réplicas de leitura", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe vai lançar uma aplicação nova com tráfego imprevisível e intermitente e não quer provisionar a capacidade do banco manualmente. Qual opção do Aurora atende melhor esse cenário?",
                        difficulty: "medio",
                        options: [
                            { text: "Aurora Global Database", isCorrect: false },
                            {
                                text: "Aurora provisionado com Instância Reservada",
                                isCorrect: false,
                            },
                            { text: "Aurora Serverless v2", isCorrect: true },
                            { text: "Aurora Backtrack", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa de replicação entre Regiões da AWS com latência inferior a 1 segundo para suportar recuperação de desastres com RTO e RPO baixos. Qual recurso do Aurora atende esse requisito?",
                        difficulty: "medio",
                        options: [
                            { text: "Aurora Global Database", isCorrect: true },
                            { text: "Aurora Serverless v1", isCorrect: false },
                            { text: "Aurora Database Cloning", isCorrect: false },
                            { text: "Multi-AZ do RDS tradicional", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon DynamoDB - NoSQL Serverless",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nDynamoDB é um banco **NoSQL do tipo key-value/document** e **totalmente gerenciado**. O grande diferencial é entregar **latência de milissegundos de forma consistente em qualquer escala**, com replicação **multi-AZ automática** e cobrança **pay-per-use** (você paga pelo que usa). Você **não enxerga instância nenhuma**, é serverless de verdade, e a escala é praticamente infinita.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é DynamoDB\n\nA sua aplicação nunca fala com um servidor. Ela chama a API do DynamoDB (comandos como PutItem, GetItem, Query e Scan) e a AWS cuida de tudo por baixo.",
                    },
                    {
                        type: "code",
                        value: "   Sua app\n       │ AWS SDK (PutItem, GetItem, Query, Scan)\n       ▼\n   ┌─────────────────────────────────────────────┐\n   │ DynamoDB (serverless, fully managed)         │\n   │                                              │\n   │ - Storage distribuído em ≥3 AZs              │\n   │ - Auto-particionamento conforme cresce       │\n   │ - Latência ms consistente em qualquer escala │\n   │ - Cobra por requests + storage               │\n   └─────────────────────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: '- **Sem servidor visível**: toda interação é via API.\n- A **tabela** é a unidade básica. Não existe o conceito de "database" que agrupa tabelas, como no SQL.\n- Os **itens** (o equivalente às linhas) não precisam ter as mesmas colunas. O schema é flexível.\n\n## 2. Modelo de dados\n\n### Primary Key (obrigatório)\n\nTodo item de uma tabela é identificado por uma **primary key** (chave primária). Existem duas formas de montá-la:',
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Componentes","Exemplo"],["**Partition Key**","1 campo (hash)","`userId = \\"u123\\"`"],["**Composite Key**","Partition Key + Sort Key","`userId = \\"u123\\"` + `orderDate = \\"2026-06-26\\"`"]]',
                    },
                    {
                        type: "text",
                        value: "A **partition key** (chave de partição) decide, através de um hash, **em qual partição física** o item vai ficar guardado. A **sort key** (chave de ordenação) organiza os itens **dentro daquela mesma partição**.\n\n### Atributos (colunas) flexíveis\n\nRepare que dois itens da mesma tabela podem ter campos diferentes, sem precisar declarar schema antes:",
                    },
                    {
                        type: "code",
                        value: '// Item 1 da tabela "users"\n{\n  "userId": "u123",        // partition key\n  "name": "João",\n  "email": "joao@x.com"\n}\n\n// Item 2 da MESMA tabela\n{\n  "userId": "u456",        // partition key\n  "name": "Maria",\n  "email": "maria@y.com",\n  "phone": "+5511...",     // ← campo extra, sem precisar de schema\n  "isPremium": true\n}',
                    },
                    {
                        type: "text",
                        value: "### Índices secundários (pra queries alternativas)\n\nPor padrão você consulta pela primary key. Para buscar por outros campos, use índices secundários:",
                    },
                    {
                        type: "table",
                        value: '[["Índice","O que permite"],["**GSI** (Global Secondary Index)","Query por **outra partition key** (qualquer atributo)"],["**LSI** (Local Secondary Index)","Query por **outra sort key** (mesma partition key)"]]',
                    },
                    {
                        type: "text",
                        value: "GSI é o Global Secondary Index (índice secundário global) e LSI é o Local Secondary Index (índice secundário local).\n\n## 3. Modos de capacidade\n\nO DynamoDB tem duas formas de reservar (ou não) capacidade.\n\n### On-Demand\n- **Sem provisionar nada** de antemão.\n- Você paga **por requisição**, com base nos RCU e WCU realmente consumidos.\n- **Escala instantânea** para qualquer volume.\n- **Caso de uso:** tráfego imprevisível, dev/test e picos sazonais como a Black Friday.\n\n### Provisioned\n- Você **reserva** de antemão uma quantidade de Read Capacity Units (RCU, unidades de capacidade de leitura) e Write Capacity Units (WCU, unidades de capacidade de escrita).\n- Sai mais barato em escala **se a carga for previsível**.\n- Dá para ativar o **Auto Scaling**, que varia o provisionamento dentro de uma faixa.\n- **Caso de uso:** workload constante e conhecido.",
                    },
                    {
                        type: "quote",
                        value: "**Regra prática:** comece em **On-Demand**, porque você paga só o uso real e não tem dor de cabeça. Migre para o Provisioned quando a carga ficar previsível e o volume justificar.",
                    },
                    {
                        type: "text",
                        value: "## 4. Latência e durabilidade\n\n- **Single-digit millisecond latency** (de 1 a 9 ms), e o mais importante, **constante mesmo em escala massiva**.\n- Replicação **multi-AZ** (3 AZs) de forma automática.\n- Durabilidade alta, usando o mesmo modelo do S3.\n- Leituras **fortemente consistentes** (strongly consistent reads) são opcionais. O padrão é eventualmente consistente, que sai mais barato.\n\n## 5. Recursos importantes\n\n### DynamoDB Streams\n- É um **Change Data Capture (CDC)**, ou captura de mudanças: gera um evento a cada insert, update ou delete.\n- O stream pode disparar um **Lambda**, o que abre caminho para fan-out, ETL e replicação customizada.\n- Retenção de 24 horas.\n\n### TTL (Time-to-Live)\n- Você marca um campo de timestamp e o DynamoDB **apaga os itens automaticamente** quando eles expiram.\n- **Sem custo** para apagar.\n- **Caso de uso:** sessões, tokens, cache e dados temporários em geral.\n\n### Global Tables\n- Fazem **replicação entre regiões no modo ativo-ativo** (multi-master).\n- Você pode ler e escrever em **qualquer região**, e a replicação acontece sozinha.\n- Resultado: **latência baixa global** mais DR automático.\n- Cobra por região, já que cada réplica conta.\n\n### PITR (Point-in-Time Recovery)\n- Restaura a tabela para **qualquer segundo dos últimos 35 dias**.\n- **Sem afetar** a tabela atual, porque cria uma tabela nova.\n\n### Backups on-demand\n- Snapshots manuais que sobrevivem mesmo depois de você apagar a tabela.\n- Suportam compartilhamento entre regiões e entre contas.\n\n### DAX (DynamoDB Accelerator)\n- É um **cache em memória** integrado, com latência de **microssegundos** (até 100× mais rápido).\n- A API é compatível com a do DynamoDB, então você não muda o código.\n- Vale para workloads **read-heavy** (com muita leitura).\n\n### Transactions\n- Suportam **ACID** em até **25 itens** por transação.\n- Custam 2× RCU/WCU, porque a leitura acontece com isolamento.\n\n## 6. Casos de uso clássicos\n\nOnde o DynamoDB brilha:\n\n- **Mobile e gaming**: perfis, leaderboards, inventário e save states.\n- **IoT**: telemetria de milhões de dispositivos.\n- **E-commerce**: carrinho de compras, catálogo e sessão de usuário.\n- **Session store** de apps web (no estilo do Redis).\n- **Real-time bidding** e ad tech.\n- **Backend serverless** (a dupla Lambda mais DynamoDB).\n- **Filas leves**, com FIFO baseado em sort key mais timestamp.\n- **Cache de queries pesadas** vindas de um banco SQL.\n\n**NÃO é a melhor escolha para:**\n- **Joins complexos**: o DynamoDB não tem joins, então você desnormaliza ou junta os dados no lado do cliente.\n- **Queries ad-hoc** com filtros variados, porque cada padrão de busca precisa do próprio índice.\n- **Agregações pesadas** (count, sum sobre milhões de registros). Para isso, use Redshift ou Athena.\n- **Schema fortemente relacional** com integridade referencial.\n\n## 7. Pricing",
                    },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Requests**","$/RCU + $/WCU (On-Demand) ou $/hora reservado (Provisioned)"],["**Storage**","$/GB-mês"],["**Streams**","$/milhão de read requests"],["**Global Tables**","Cobra cada região + replicação"],["**Backup**","$/GB-mês de backup armazenado"],["**PITR**","$/GB-mês adicional sobre o storage normal"],["**DAX**","Por instância DAX (separado)"]]',
                    },
                    { type: "text", value: "## 8. DynamoDB vs RDS - quando escolher" },
                    {
                        type: "table",
                        value: '[["Cenário","Resposta"],["Schema **relacional** com **joins**","**RDS / Aurora**"],["**Escala massiva** (milhões de requests/seg)","**DynamoDB**"],["**Latência ms consistente** em qualquer escala","**DynamoDB**"],["**Pay-per-use** sem provisionar nada","**DynamoDB On-Demand** (ou Aurora Serverless)"],["**Multi-region ativo-ativo**","**DynamoDB Global Tables**"],["**Queries ad-hoc** com filtros variados","**RDS / Aurora**"],["**Mobile / IoT / gaming**","**DynamoDB**"],["**ERP / sistema financeiro com transações complexas**","**RDS / Aurora**"]]',
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"NoSQL serverless escalável"** → **DynamoDB**.\n2. **"Latência consistente em qualquer escala"** → **DynamoDB**.\n3. **"Multi-region ativo-ativo, multi-master"** → **DynamoDB Global Tables**.\n4. **"Cache de DynamoDB para microssegundos"** → **DAX**.\n5. **"Apagar registro automaticamente após expirar"** → **TTL**.\n6. **"Trigger no insert/update do DynamoDB"** → **DynamoDB Streams** → Lambda.\n7. **"DynamoDB vs DocumentDB"** - DynamoDB é AWS-native key-value; DocumentDB é MongoDB-compatible.\n8. **"DynamoDB suporta transações?"** → **Sim** - até 25 itens, ACID.\n9. **"Restaurar pra um segundo específico"** → **PITR** (35 dias).\n10. **"Tráfego imprevisível, qual modo de capacidade?"** → **On-Demand**.\n11. **"Tráfego estável e alto, mais barato"** → **Provisioned** com Auto Scaling.\n12. **"DynamoDB faz joins?"** → **Não**. Desnormaliza ou faz client-side.\n13. **"Cobra por hora de instância?"** → **NÃO** - DynamoDB cobra por request + storage.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'DynamoDB = NoSQL serverless key-value/document\n            Latência ms constante em qualquer escala\n            Replicação multi-AZ automática\n\nModelo:\n  Primary Key (obrigatória):\n    Partition Key (sozinha) - hash determina partição física\n    OU Partition + Sort Key (composto)\n  Atributos flexíveis (schema livre)\n  Índices:\n    GSI = outra partition key (qualquer atributo)\n    LSI = outra sort key (mesma partition)\n\nCapacidade:\n  On-Demand  → pay-per-request, sem provisionar (default recomendado)\n  Provisioned → RCU/WCU reservados, mais barato em escala previsível\n\nRecursos:\n  Streams       → CDC, dispara Lambda\n  TTL           → expira itens automaticamente (sessions, cache)\n  Global Tables → multi-region ativo-ativo (multi-master)\n  PITR          → restaurar qualquer segundo (35 dias)\n  DAX           → cache em memória, microssegundos\n  Transactions  → ACID até 25 itens\n\nAtalhos pra prova:\n  "NoSQL serverless"             → DynamoDB\n  "latência ms em qualquer escala"→ DynamoDB\n  "multi-region ativo-ativo"     → DynamoDB Global Tables\n  "cache pra microssegundos"     → DAX\n  "auto-expira itens"            → TTL\n  "trigger no change"            → DynamoDB Streams\n  "MongoDB compatible"           → DocumentDB (NÃO DynamoDB)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma equipe precisa de um banco de dados NoSQL totalmente gerenciado e serverless, sem nenhuma instância para provisionar ou administrar, capaz de entregar latência consistente de milissegundos de um dígito mesmo sob escala massiva de requisições. Qual serviço da AWS atende a esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon DynamoDB", isCorrect: true },
                            { text: "Amazon RDS", isCorrect: false },
                            { text: "Amazon Redshift", isCorrect: false },
                            { text: "Amazon ElastiCache", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma loja virtual terá picos de tráfego imprevisíveis na Black Friday e prefere não reservar capacidade de antemão, pagando somente pelas leituras e escritas realmente consumidas. Qual modo de capacidade do Amazon DynamoDB é o mais indicado?",
                        difficulty: "facil",
                        options: [
                            { text: "Provisioned", isCorrect: false },
                            { text: "On-Demand", isCorrect: true },
                            { text: "Provisioned com Auto Scaling", isCorrect: false },
                            { text: "Reserved Capacity", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação com uso intenso de leitura sobre o DynamoDB precisa reduzir o tempo de resposta de milissegundos para microssegundos, sem alterar o código, aproveitando uma API compatível. Qual recurso deve ser adotado?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon ElastiCache for Redis", isCorrect: false },
                            { text: "DynamoDB Streams", isCorrect: false },
                            { text: "Amazon DynamoDB Accelerator (DAX)", isCorrect: true },
                            { text: "Amazon CloudFront", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa global quer que usuários na América do Sul, na Europa e na Ásia leiam e escrevam na tabela do DynamoDB da região mais próxima, com replicação automática ativo-ativo (multi-master) entre as regiões. Qual recurso oferece isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Réplicas de leitura entre regiões", isCorrect: false },
                            { text: "Global Tables", isCorrect: true },
                            { text: "DynamoDB Streams", isCorrect: false },
                            { text: "Point-in-Time Recovery (PITR)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma arquitetura serverless precisa disparar uma função do AWS Lambda a cada inserção, atualização ou exclusão de item em uma tabela do DynamoDB, capturando essas mudanças em tempo real. Qual recurso do DynamoDB fornece esse fluxo de eventos?",
                        difficulty: "medio",
                        options: [
                            { text: "Point-in-Time Recovery (PITR)", isCorrect: false },
                            { text: "DynamoDB Time-to-Live (TTL)", isCorrect: false },
                            { text: "Global Tables", isCorrect: false },
                            { text: "DynamoDB Streams", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon ElastiCache - Cache em memória gerenciado",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nElastiCache é a **camada de cache** gerenciada da AWS. Ela roda **Redis** ou **Memcached** para você, sem precisar cuidar de instalação, replicação ou failover. O ganho é duplo: reduz a latência das queries de **milissegundos para sub-milissegundo** e **alivia o banco principal** (RDS ou DynamoDB). É o "remédio" mais comum quando o RDS começa a sofrer com carga de leitura.',
                    },
                    {
                        type: "text",
                        value: "## 1. Para que serve cache em memória\n\nCache em memória é guardar respostas prontas numa camada rápida, para não bater no banco toda hora. Compare os dois cenários.\n\nSem cache, toda query vai direto no banco:",
                    },
                    { type: "code", value: "   App ──▶ RDS (cada query dura 50-500ms, custa RCU)" },
                    {
                        type: "text",
                        value: "Com cache, a maioria das leituras é atendida na hora, e só o que falta (o miss) vai ao banco:",
                    },
                    {
                        type: "code",
                        value: "   App ──▶ ElastiCache (cache hit: <1ms, custa quase nada)\n            └─miss─▶ RDS ──▶ guarda no cache ──▶ próxima vez já está pronto",
                    },
                    {
                        type: "text",
                        value: "**Resultados típicos:**\n- A latência média cai de 10 a 100 vezes.\n- A carga no banco principal cai de 70% a 95%.\n- O app aguenta mais usuários sem você mudar nada nele.\n\n## 2. Os dois engines\n\nO ElastiCache oferece dois motores de cache. Redis é o completo; Memcached é o simples.",
                    },
                    {
                        type: "table",
                        value: '[["Característica","**Redis**","**Memcached**"],["Estruturas de dado","**Strings, hashes, lists, sets, sorted sets, streams**","**Só strings**"],["Persistência","Opcional (snapshots, AOF)","**Nenhuma** (volátil)"],["Replicação","**Sim** (multi-AZ, read replicas)","**Não** (sharding sim, replicação não)"],["Multi-threaded","Não (single-thread)","**Sim** (escala vertical melhor)"],["Failover automático","**Sim** (com Multi-AZ)","Não"],["Pub/Sub","**Sim**","Não"],["Transações","Sim (MULTI/EXEC)","Não"],["Sharding","**Cluster mode** (até 500 nodes)","Sim"],["Caso de uso","**Default moderno** - recursos ricos","Cache simples, max throughput"]]',
                    },
                    {
                        type: "text",
                        value: "AOF é o Append Only File, um jeito do Redis persistir os dados gravando cada operação num arquivo de log.",
                    },
                    {
                        type: "quote",
                        value: "**Regra prática:** **escolha Redis** a não ser que você tenha um motivo específico para o Memcached. O Redis tem todos os recursos e ainda assim é simples.",
                    },
                    {
                        type: "text",
                        value: "## 3. Casos de uso clássicos do Redis\n\nO Redis é versátil porque tem várias estruturas de dado. Cada linha abaixo mostra um padrão comum e o comando que o resolve:",
                    },
                    {
                        type: "table",
                        value: '[["Padrão","Como Redis resolve"],["**Cache de queries**","`GET user:123` ← string com JSON serializado"],["**Session store**","`GET session:abc123` ← hash com dados da sessão"],["**Leaderboard / ranking**","**Sorted set** com score = pontuação"],["**Rate limiting**","`INCR` contador por IP/usuário, com `EXPIRE`"],["**Fila leve (queue)**","**Lists** (`LPUSH` / `RPOP`)"],["**Pub/Sub** real-time","`PUBLISH channel msg` + subscribers escutam"],["**Cache de objetos calculados**","Resultado de query pesada cached com TTL"],["**Distributed lock**","`SET key NX PX 5000` ← exclusivo com expiração"],["**Token store** (JWT denylist)","`SET jti-xxx 1 EX 86400`"]]',
                    },
                    {
                        type: "text",
                        value: '## 4. Modos do Redis no ElastiCache\n\nO Redis no ElastiCache pode rodar em três configurações, da mais simples à mais robusta.\n\n### Single Node\n- Um único nó primário, sem réplica.\n- **Sem alta disponibilidade**: se o nó cai, o cache some e precisa ser reaquecido.\n- É o mais barato, bom para dev/test.\n\n### Cluster Mode Disabled (com replicação)\n- Um primário mais até 5 read replicas, em AZs diferentes.\n- **Failover automático multi-AZ**.\n- As read replicas atendem leituras, o que dá escala de leitura.\n- Boa opção para workloads que cabem em um único shard (até 650 GB).\n\n### Cluster Mode Enabled (sharded)\n- Os dados ficam distribuídos em **vários shards** (até 500 nodes).\n- Cada shard tem o próprio primário mais réplicas.\n- É **escala horizontal de verdade**, permitindo terabytes de cache.\n- É mais complexo, porque o cliente precisa entender a topologia do cluster.\n\n## 5. ElastiCache vs MemoryDB for Redis (importante!)\n\nEm 2021 a AWS lançou o **MemoryDB for Redis** como uma alternativa: um "banco primário em memória", e não apenas um cache. A diferença é a durabilidade do dado.',
                    },
                    {
                        type: "table",
                        value: '[["Critério","**ElastiCache for Redis**","**MemoryDB for Redis**"],["Propósito","**Cache** (dado pode sumir)","**Banco primário** (dado durável)"],["Persistência","Opcional (snapshots, AOF)","**Multi-AZ transactional log** (durável)"],["Failover","Pode perder dado recente","**Zero data loss**"],["Latência leitura","Sub-ms","Sub-ms"],["Latência escrita","Sub-ms","**Single-digit ms** (replica antes do ACK)"],["Casos de uso","Cache, sessions, rate limit","Cart, gaming state, leaderboards persistentes"],["Custo","Menor","Maior"]]',
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "Redis como **banco primário durável**" leva ao **MemoryDB**. "Redis como **camada de cache**" leva ao **ElastiCache**.',
                    },
                    {
                        type: "text",
                        value: "## 6. Estratégias de cache (padrões clássicos)\n\nExistem duas formas principais de decidir quando o cache é preenchido, mais o TTL como tempero.\n\n### Lazy Loading (cache-aside)\n\nO cache só é preenchido quando alguém pede o dado e ele não está lá (o miss).",
                    },
                    {
                        type: "code",
                        value: "   App ──▶ Cache (miss?) ──▶ RDS ──▶ guarda no cache ──▶ retorna",
                    },
                    {
                        type: "text",
                        value: "Pontos a considerar:\n- O cache só guarda dado que foi realmente pedido, então é eficiente em memória.\n- A primeira request de cada dado é sempre miss, com latência mais alta.\n- O dado pode ficar desatualizado se você não invalidar.\n\n### Write-Through\n\nToda escrita atualiza o cache junto com o banco, na mesma operação.",
                    },
                    {
                        type: "code",
                        value: "   App ──▶ escreve no RDS ──▶ atualiza cache na mesma operação",
                    },
                    {
                        type: "text",
                        value: 'Pontos a considerar:\n- O cache fica sempre consistente com o banco.\n- A latência de escrita aumenta.\n- O cache enche com dados que talvez nunca sejam lidos.\n\n### TTL (Time-to-Live)\n- Cada entrada expira depois de um tempo X.\n- Combina bem com o lazy loading.\n- Garante o "frescor" do dado sem você invalidar na mão.\n\n## 7. Pricing',
                    },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Compute**","Por hora por nó (instance type)"],["**Data transfer**","Saída pra outra AZ ou região"],["**Backup**","Snapshots (GB-mês após 1 free)"],["**Reserved nodes**","Até 55% off com compromisso 1-3 anos"]]',
                    },
                    {
                        type: "text",
                        value: '## 8. Pegadinhas comuns da prova\n\n1. **"Reduzir latência de leitura do RDS"** → **ElastiCache**.\n2. **"Session store distribuído"** → **ElastiCache (Redis)**.\n3. **"Leaderboard em tempo real"** → **Redis Sorted Sets** (ElastiCache).\n4. **"Pub/Sub real-time"** → **Redis Pub/Sub** (ElastiCache).\n5. **"Memcached é multi-threaded; Redis é single-threaded"** → verdade.\n6. **"Memcached suporta failover?"** → **Não**.\n7. **"Redis como banco primário durável"** → **MemoryDB** (não ElastiCache).\n8. **"Multi-AZ failover Redis"** → ElastiCache **Cluster Mode Disabled** com replicação multi-AZ, ou **Cluster Mode Enabled**.\n9. **"Cache miss = lazy loading"** - padrão default.\n10. **"Estratégia que mantém cache sempre atualizado"** → **Write-Through**.\n11. **"Rate limiting distribuído"** → Redis `INCR` + `EXPIRE`.\n12. **"Cache em memória vs DAX"** - DAX é específico pra DynamoDB; ElastiCache é genérico.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'ElastiCache = cache em memória gerenciado (Redis ou Memcached)\n\nEngines:\n  Redis      → recursos ricos (lists, sets, sorted sets, pub/sub, persistência)\n                Default moderno. Multi-AZ failover.\n  Memcached  → só strings, multi-threaded, sem persistência, sem failover\n                Casos específicos.\n\nModos do Redis:\n  Single node              → sem HA\n  Cluster Mode Disabled    → 1 primary + até 5 replicas (multi-AZ)\n  Cluster Mode Enabled     → sharding até 500 nodes\n\nElastiCache vs MemoryDB:\n  ElastiCache → CACHE (dado pode sumir)\n  MemoryDB    → BANCO PRIMÁRIO Redis durável (zero data loss)\n\nEstratégias:\n  Lazy Loading (cache-aside) → padrão simples, cache sob demanda\n  Write-Through              → cache sempre atualizado, escrita mais lenta\n  TTL                         → expira automaticamente, combina com lazy\n\nCasos de uso clássicos (Redis):\n  - Cache de queries SQL pesadas\n  - Session store\n  - Leaderboard (sorted set)\n  - Rate limiting (INCR + EXPIRE)\n  - Pub/Sub real-time\n  - Distributed lock\n\nAtalhos pra prova:\n  "cache pra aliviar RDS"          → ElastiCache\n  "session distribuído"            → ElastiCache (Redis)\n  "leaderboard real-time"          → Redis Sorted Sets\n  "Redis com durabilidade total"   → MemoryDB\n  "DynamoDB cache"                 → DAX (não ElastiCache!)\n  "pub/sub"                        → Redis',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O banco de dados Amazon RDS de uma aplicação está sobrecarregado por um grande volume de leituras repetidas. A equipe quer aliviar essa carga e reduzir a latência das consultas de milissegundos para sub-milissegundo usando uma camada de cache em memória gerenciada. Qual serviço atende a esse cenário?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon ElastiCache", isCorrect: true },
                            { text: "Amazon Redshift", isCorrect: false },
                            { text: "Amazon Athena", isCorrect: false },
                            { text: "AWS Storage Gateway", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe compara os engines Redis e Memcached do Amazon ElastiCache antes de escolher um. Qual afirmação sobre eles está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O Memcached não oferece failover automático nem replicação, enquanto o Redis oferece os dois",
                                isCorrect: true,
                            },
                            {
                                text: "O Memcached permite persistência em disco, enquanto o Redis é sempre volátil",
                                isCorrect: false,
                            },
                            {
                                text: "O Redis é multi-threaded e o Memcached é single-threaded",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o Memcached oferece estruturas como sorted sets e listas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa usar o Redis como banco de dados primário e durável, com log transacional multi-AZ e zero perda de dados em caso de failover. Qual serviço da AWS atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon MemoryDB", isCorrect: true },
                            { text: "Amazon ElastiCache for Redis", isCorrect: false },
                            { text: "Amazon ElastiCache for Memcached", isCorrect: false },
                            { text: "Amazon DynamoDB Accelerator (DAX)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um jogo online precisa manter um placar (leaderboard) em tempo real, ordenado pela pontuação dos jogadores e atualizado conforme os pontos mudam. Qual recurso do Redis no ElastiCache é o mais indicado para isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Sorted sets", isCorrect: true },
                            { text: "Pub/Sub", isCorrect: false },
                            { text: "Strings com JSON serializado", isCorrect: false },
                            { text: "Snapshots e AOF", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer que cada gravação no banco de dados atualize a entrada correspondente no cache na mesma operação, mantendo o cache sempre consistente com o banco. Qual estratégia de cache descreve esse comportamento?",
                        difficulty: "medio",
                        options: [
                            { text: "Write-Through", isCorrect: true },
                            { text: "Lazy Loading (cache-aside)", isCorrect: false },
                            { text: "TTL (Time-to-Live)", isCorrect: false },
                            { text: "Sharding com Cluster Mode Enabled", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon Redshift - Data Warehouse",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nRedshift é o **data warehouse** da AWS, ou seja, o banco feito para análise. Ele é **colunar** e usa **MPP** (Massively Parallel Processing, processamento massivamente paralelo), o que o deixa ótimo para **agregações complexas sobre petabytes** de dados. Ele não substitui o RDS (que é OLTP); ele **complementa** o RDS cuidando da parte analítica (OLAP). Integra de forma nativa com o **S3** (via Spectrum) e tem uma versão **Serverless** desde 2022.",
                    },
                    {
                        type: "text",
                        value: "## 1. OLAP vs OLTP - por que existe um banco separado\n\nA pergunta natural é: por que não usar o mesmo banco para tudo? Porque análise e transação têm perfis opostos.",
                    },
                    {
                        type: "table",
                        value: '[["OLTP (RDS / Aurora)","OLAP (Redshift)"],["Lê/escreve **uma linha por vez**","Lê **bilhões de linhas**, agrega"],["Milhões de queries pequenas","Milhares de queries grandes"],["Latência ms","Latência segundos-minutos"],["**Row-store** (linha contígua em disco)","**Column-store** (coluna contígua em disco)"],["Pra **aplicação**","Pra **BI, dashboards, ML training**"]]',
                    },
                    {
                        type: "quote",
                        value: "**Por que colunar é melhor pra OLAP:** quando você faz `SELECT AVG(price) FROM orders WHERE year = 2026`, só precisa ler as colunas `price` e `year`, **não a tabela inteira**. Um banco row-store leria tudo. Em escala de TB, essa diferença deixa o Redshift 100× mais rápido.",
                    },
                    {
                        type: "text",
                        value: "## 2. Arquitetura\n\nO Redshift trabalha com um nó que coordena (o Leader) e vários nós que executam em paralelo (os Compute).",
                    },
                    {
                        type: "code",
                        value: "                ┌─────────────────────┐\n                │   Leader Node       │ ← recebe SQL, planeja query\n                │   (1 por cluster)   │\n                └──────────┬──────────┘\n                           │\n              ┌────────────┼────────────┐\n              ▼            ▼            ▼\n        ┌─────────┐  ┌─────────┐  ┌─────────┐\n        │Compute 1│  │Compute 2│  │Compute 3│ ← executam em paralelo\n        │ slice 1 │  │ slice 1 │  │ slice 1 │\n        │ slice 2 │  │ slice 2 │  │ slice 2 │\n        └─────────┘  └─────────┘  └─────────┘\n                ↑\n                MPP (Massively Parallel Processing)\n                - cada nó processa um pedaço",
                    },
                    {
                        type: "text",
                        value: "- O **Leader** coordena e planeja; os **compute nodes** executam.\n- Cada compute node tem **slices**, que são núcleos de CPU.\n- Os dados são **distribuídos** entre os nós (pela DISTKEY) e **ordenados** dentro de cada nó (pela SORTKEY) para ganhar performance.\n\n## 3. Recursos importantes\n\n### Redshift Serverless\n- **Sem provisionar cluster**. Você paga por **RPU-hora** (Redshift Processing Units, unidades de processamento) consumidas.\n- A AWS escala o compute automaticamente.\n- **Caso de uso:** workload variável, queries ad-hoc, dev/test, ou simplesmente para simplificar a operação.\n\n### Redshift Spectrum\n- Faz **query SQL direto em arquivos no S3** (Parquet, ORC, CSV, JSON).\n- **Sem precisar copiar** os dados para o warehouse: o Redshift lê do S3 e processa na hora.\n- **Caso de uso:** um data lake gigante no S3 com queries esporádicas, pagando só pelo TB escaneado.",
                    },
                    {
                        type: "code",
                        value: '   Sua query SQL\n        │\n        ▼\n   ┌──────────────────────┐\n   │ Redshift Cluster      │\n   └────┬────────────┬────┘\n        │            │\n   tabela local   tabela "external"\n   (no warehouse) (mapeada pra S3)\n                          │\n                          ▼\n                      Arquivos S3 (Parquet)\n                      Spectrum lê direto',
                    },
                    {
                        type: "text",
                        value: "### Concurrency Scaling\n- Adiciona capacidade temporária quando o cluster fica saturado de queries simultâneas.\n- Cobra por uso, mas com 1 hora grátis por dia por cluster.\n\n### Materialized Views\n- Pré-calculam o resultado de queries pesadas e atualizam de forma incremental.\n- Aceleram dashboards e relatórios que rodam sempre.\n\n### Workload Management (WLM)\n- Define **filas de queries** com prioridades (por exemplo, separar ETL, Dashboard e Ad-hoc).\n- Evita que uma query lenta trave todas as outras.\n\n### AQUA (Advanced Query Accelerator)\n- Junta cache e processamento acelerado em hardware.\n- Liga automaticamente nos nós compatíveis.\n\n## 4. Distribuição e ordenação (DISTKEY e SORTKEY)\n\nSão os 2 conceitos de tuning mais importantes no Redshift.",
                    },
                    {
                        type: "table",
                        value: '[["Conceito","O que faz"],["**DISTKEY** (distribution)","Coluna usada pra **distribuir linhas entre nós** - boa escolha = joins eficientes"],["**SORTKEY** (sort)","Coluna usada pra **ordenar linhas no disco** - boa escolha = scans rápidos pra filtros range"]]',
                    },
                    {
                        type: "text",
                        value: "Tipos de distribuição:\n- **KEY** - distribui pelo hash de uma coluna. Deixa os joins eficientes se as duas tabelas usam a mesma DISTKEY.\n- **EVEN** - round-robin, espalhando de forma igual. É o padrão quando não há DISTKEY.\n- **ALL** - copia a tabela inteira em todos os nós. Boa para tabelas pequenas usadas em joins.\n- **AUTO** - o Redshift decide sozinho. É o padrão moderno.",
                    },
                    {
                        type: "quote",
                        value: 'Não precisa decorar isso para o Cloud Practitioner, mas saber que existem ajuda em pegadinhas do tipo "como tornar os joins de dimensões mais rápidos".',
                    },
                    { type: "text", value: "## 5. Tipos de nós" },
                    {
                        type: "table",
                        value: '[["Família","Para que serve"],["**RA3**","Padrão moderno - separa **compute** de **storage** (Managed Storage no S3), escala independente"],["**DC2**","Storage local SSD, bom pra workloads pequenos"],["**DS2**","Legado, storage magnético"]]',
                    },
                    {
                        type: "quote",
                        value: "**RA3 é o recomendado.** Com ele, o storage cresce até 8 PB sem você mexer no compute.",
                    },
                    { type: "text", value: "## 6. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Compute (provisioned)**","Por hora por nó (On-Demand ou Reserved Instance, até 75% off)"],["**Managed Storage (RA3)**","$/GB-mês de dado armazenado"],["**Redshift Serverless**","$/RPU-hora consumido"],["**Spectrum**","$/TB scanned em S3 (similar Athena)"],["**Concurrency Scaling**","Grátis 1h/dia, depois por segundo"]]',
                    },
                    { type: "text", value: "## 7. Redshift vs Athena vs RDS" },
                    {
                        type: "table",
                        value: '[["Critério","**Redshift**","**Athena**","**RDS / Aurora**"],["Tipo","Data warehouse (OLAP)","SQL serverless **direto em S3**","OLTP relacional"],["Provisionamento","Cluster (ou Serverless)","**Zero** - serverless de verdade","Instância"],["Cobrança","Por hora cluster ou RPU","**$/TB scanned**","Por hora instância"],["Volume típico","TB a PB","TB (no S3)","GB a TB"],["Latência","Segundos","Segundos-minutos","Milissegundos"],["Quando usar","BI recorrente, dashboards","Queries **ad-hoc** em S3, exploração","Aplicação transacional"]]',
                    },
                    {
                        type: "quote",
                        value: "**Regra:** queries pesadas que se repetem vão para o **Redshift**. Queries ad-hoc e esporádicas em cima do S3 vão para o **Athena**. Aplicação CRUD vai para **RDS/Aurora**.",
                    },
                    {
                        type: "text",
                        value: "## 8. Integrações comuns\n\nEste diagrama mostra o caminho típico do dado: várias fontes entram, passam por um ETL, ficam no Redshift (que conversa com o S3 via Spectrum) e alimentam as ferramentas de BI.",
                    },
                    {
                        type: "code",
                        value: "  ┌─────────────────┐\n  │ Fontes de dado  │\n  │ - RDS / DynamoDB│\n  │ - S3 (raw)      │\n  │ - Kinesis       │\n  │ - On-prem (DMS) │\n  └────────┬────────┘\n           │ ETL (Glue, EMR, DMS, COPY command)\n           ▼\n  ┌─────────────────┐                ┌─────────────────┐\n  │ Redshift        │ ◀─ Spectrum ─▶ │ S3 (data lake)  │\n  └────────┬────────┘                └─────────────────┘\n           │\n           ▼\n  ┌─────────────────┐\n  │ BI / Analytics  │\n  │ - QuickSight    │\n  │ - Tableau       │\n  │ - Looker        │\n  └─────────────────┘",
                    },
                    {
                        type: "text",
                        value: '## 9. Casos de uso clássicos\n\nOnde o Redshift é a escolha natural:\n\n- **Business Intelligence** corporativo (dashboards executivos).\n- **Data Warehouse** central juntando dados de várias fontes.\n- **Análise de logs** em larga escala (clickstream, application logs).\n- **Preparação de dados de treino de ML**, juntando terabytes para alimentar o SageMaker.\n- **Compliance reporting**, aquela rodada mensal pesada.\n\n**NÃO é a melhor escolha para:**\n- Aplicação CRUD em produção (use RDS).\n- Queries ad-hoc esporádicas em arquivos S3 (use Athena, que sai mais barato).\n- Latência de milissegundos para dashboards em tempo real (use DynamoDB ou ElastiCache).\n- Dados estruturados pequenos, abaixo de 100 GB (o RDS dá conta).\n\n## 10. Pegadinhas comuns da prova\n\n1. **"Data warehouse pra petabytes"** → **Redshift**.\n2. **"Query SQL ad-hoc em arquivos S3, sem provisionar"** → **Athena** (NÃO Redshift!).\n3. **"Query SQL em S3 a partir de um cluster Redshift existente"** → **Redshift Spectrum**.\n4. **"Sem provisionar capacidade Redshift"** → **Redshift Serverless**.\n5. **"OLAP vs OLTP"** - OLAP = agregação massiva (Redshift). OLTP = transações (RDS/Aurora).\n6. **"Por que Redshift é rápido em agregações?"** → **Colunar + MPP**.\n7. **"Quem coordena queries em Redshift?"** → **Leader Node**.\n8. **"Compute e storage separados, escalam independente"** → **RA3 nodes** ou **Serverless**.\n9. **"Acelerar dashboards recorrentes"** → **Materialized Views**.\n10. **"Quero pagar só pelo TB scanned, sem cluster"** → **Athena**.\n11. **"Redshift suporta JOIN com S3?"** → **Sim, via Spectrum** (tabela externa).\n12. **"Concurrency Scaling cobra?"** → **1 hora grátis/dia/cluster**, depois por segundo.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Redshift = data warehouse (OLAP), colunar + MPP\n            até petabytes, queries SQL, milhares de usuários\n\nComponentes:\n  Leader Node     → planeja queries\n  Compute Nodes   → executam em paralelo (MPP)\n  Slices          → CPUs dentro do compute node\n\nVariantes:\n  Provisioned cluster → instâncias (RA3 recomendado, compute/storage separados)\n  Serverless          → sem provisionar, paga RPU-hora\n\nRecursos-chave:\n  Spectrum             → SQL direto em S3 (tabela externa)\n  Concurrency Scaling  → escala temporária em picos (1h grátis/dia)\n  Materialized Views   → pré-calcula queries pesadas\n  AQUA                 → cache + acelerador hardware\n  Workload Management  → filas de prioridade\n\nTuning:\n  DISTKEY  → como distribuir entre nós\n  SORTKEY  → como ordenar dentro do nó\n  AUTO     → Redshift decide (default moderno)\n\nRedshift vs Athena:\n  Redshift → queries pesadas recorrentes, dashboards (cluster paga sempre)\n  Athena   → queries ad-hoc esporádicas em S3 (paga só TB scanned)\n\nAtalhos pra prova:\n  "data warehouse PB"              → Redshift\n  "SQL ad-hoc em S3 sem provisionar"→ Athena\n  "SQL em S3 de dentro do Redshift"→ Spectrum\n  "OLAP / BI / dashboard"          → Redshift\n  "OLTP / CRUD"                    → RDS / Aurora\n  "Serverless data warehouse"      → Redshift Serverless',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O Amazon Redshift é o data warehouse da AWS, voltado a cargas analíticas (OLAP) que agregam grandes volumes de dados. Qual par de características da arquitetura do Redshift explica seu alto desempenho nesse tipo de consulta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Armazenamento colunar combinado com MPP (processamento massivamente paralelo).",
                                isCorrect: true,
                            },
                            {
                                text: "Armazenamento em linhas (row-store) com um índice B-tree em cada coluna.",
                                isCorrect: false,
                            },
                            {
                                text: "Cache total das tabelas em memória, nos moldes do Amazon ElastiCache.",
                                isCorrect: false,
                            },
                            {
                                text: "Replicação síncrona dos dados entre várias Zonas de Disponibilidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação de e-commerce processa milhões de transações pequenas por dia, como criar e ler pedidos individuais, e também precisa gerar relatórios que agregam bilhões de linhas históricas. Qual arquitetura coloca cada carga no banco mais adequado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Amazon RDS/Aurora para as transações (OLTP) e Amazon Redshift para os relatórios analíticos (OLAP).",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon Redshift para as transações e Amazon RDS para os relatórios analíticos.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Redshift para as duas cargas, já que ele substitui o RDS nas transações.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Athena para as transações e Amazon Redshift para os relatórios.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe já opera um cluster Amazon Redshift e precisa executar consultas SQL que fazem JOIN entre tabelas do próprio warehouse e arquivos Parquet mantidos em um data lake no Amazon S3, sem antes carregar esses arquivos para dentro do cluster. Qual recurso atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            { text: "Redshift Spectrum.", isCorrect: true },
                            { text: "Amazon Athena.", isCorrect: false },
                            { text: "AWS Glue.", isCorrect: false },
                            { text: "Concurrency Scaling.", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um analista precisa rodar consultas SQL esporádicas e exploratórias diretamente sobre arquivos que já estão no Amazon S3, pagando apenas pelo volume de dados escaneado e sem provisionar nem administrar nenhum cluster. Qual serviço é o mais indicado e econômico?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon Athena.", isCorrect: true },
                            { text: "Amazon Redshift em cluster provisionado.", isCorrect: false },
                            { text: "Amazon RDS.", isCorrect: false },
                            {
                                text: "Amazon EMR com um cluster Hadoop de longa duração.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa quer usar um data warehouse Amazon Redshift para análises recorrentes, mas tem workload imprevisível e prefere não provisionar, dimensionar nem administrar clusters, pagando somente pela capacidade de processamento (RPU) consumida. Qual opção atende a esse cenário?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon Redshift Serverless.", isCorrect: true },
                            {
                                text: "Cluster Redshift com nós RA3 adquiridos como Reserved Instances.",
                                isCorrect: false,
                            },
                            { text: "Redshift Spectrum.", isCorrect: false },
                            { text: "Concurrency Scaling.", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Bancos Especializados - Neptune, DocumentDB, Timestream, QLDB, Keyspaces",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nAlém de RDS, Aurora, DynamoDB e Redshift, a AWS tem **bancos especializados** para problemas específicos: **Neptune** (grafos), **DocumentDB** (compatível com MongoDB), **Timestream** (séries temporais), **QLDB** (ledger imutável) e **Keyspaces** (compatível com Cassandra). Cada um resolve **um padrão de dado** que os bancos "gerais" tratam mal.',
                    },
                    {
                        type: "text",
                        value: "## 1. Por que existem bancos especializados\n\nA tabela mostra o padrão de dado, se um banco geral dá conta e qual especializado é feito para ele.",
                    },
                    {
                        type: "table",
                        value: '[["Padrão de dado","Banco geral resolve?","Banco especializado"],["Relacionamentos profundos (grafo)","Mal - joins recursivos são lentos","**Neptune**"],["Documentos MongoDB-style","Não nativo (DynamoDB é diferente)","**DocumentDB**"],["Time series (IoT, métricas)","Mal - escrita massiva sequencial","**Timestream**"],["Audit trail imutável","Não - qualquer banco pode ser alterado","**QLDB**"],["Cassandra wide-column","Não - modelo diferente","**Keyspaces**"]]',
                    },
                    {
                        type: "text",
                        value: '## 2. Amazon Neptune - Grafos\n\nNeptune é um banco de **grafos** gerenciado. A ideia é pensar em **nós** (as entidades) ligados por **arestas** (os relacionamentos entre elas).\n\n### Casos de uso clássicos\n\n- **Redes sociais**: "amigos de amigos", "pessoas que você talvez conheça".\n- **Recomendação**: "quem comprou X também comprou Y".\n- **Detecção de fraude**: ligações suspeitas entre contas, IPs e dispositivos.\n- **Knowledge graphs**: bases no estilo Wikipedia e ontologias.\n- **Mapeamento de TI**: dependências entre serviços e infraestrutura.\n\n### Linguagens de query\n\nNeptune fala três linguagens de grafo:\n- **Gremlin** (Apache TinkerPop), de estilo imperativo.\n- **SPARQL** (W3C), de estilo semântico (RDF).\n- **openCypher** (estilo Neo4j), declarativo e popular.\n\n### Exemplo de query (Cypher)',
                    },
                    {
                        type: "code",
                        value: "// \"Amigos de amigos do João que ainda não são amigos diretos\"\nMATCH (joao:Pessoa {nome: 'João'})-[:AMIGO]-(:Pessoa)-[:AMIGO]-(amigos)\nWHERE NOT (joao)-[:AMIGO]-(amigos)\nRETURN amigos",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "**recomendação / fraude / rede social / relacionamentos complexos**" → **Neptune**, **não DynamoDB**.',
                    },
                    {
                        type: "text",
                        value: "## 3. Amazon DocumentDB - MongoDB compatible\n\nDocumentDB é compatível com a **API do MongoDB 4.0/5.0**, então apps que já usam Mongo funcionam sem mudança.\n\n### Por que existe (em vez de usar DynamoDB)\n\n- O DynamoDB é key-value nativo da AWS, com um **modelo de dados próprio**.\n- O DocumentDB **fala MongoDB**, então apps Mongo migram no drag-and-drop.\n- Ele traz os recursos avançados de query do Mongo (aggregation pipeline, índices complexos, `$lookup`).\n\n### Características\n\n- Tem uma **camada de storage separada** (parecida com a do Aurora), replicada em **3 AZs com 2 cópias cada, totalizando 6**.\n- Suporta até **15 read replicas**.\n- Tem **backups automáticos** mais PITR.\n- Faz **auto-scale** de storage até 64 TB.\n\n### Casos de uso\n\n- **Migrar um app MongoDB on-prem** para a AWS sem refatorar.\n- Apps **orientados a documentos** com queries complexas.\n- **Content management** (CMS e catálogos).",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "MongoDB compatible" → **DocumentDB**, NÃO DynamoDB.',
                    },
                    {
                        type: "text",
                        value: "## 4. Amazon Timestream - Time Series\n\nTimestream é otimizado para **séries temporais**, aqueles dados formados por timestamp, valor e tags.\n\n### Por que séries temporais precisam de banco próprio\n\n- O **volume de escrita é massivo**: milhões de pontos por segundo em IoT e métricas.\n- O **padrão de leitura** é agregar por janelas de tempo (últimos 5 minutos, última hora, último dia).\n- **Dado velho perde valor**, então precisa de expiração automática.\n\n### Características\n\n- **Storage em dois tiers automáticos:**\n  - **Memory store**, para os dados recentes, com queries rápidas e mais caro.\n  - **Magnetic store**, para os dados históricos, mais barato e com ciclo de vida automático.\n- **SQL** para queries, já com funções de tempo nativas.\n- **Escala automática**, sem provisionar.\n\n### Casos de uso\n\n- **IoT**: telemetria de milhões de dispositivos.\n- **Application monitoring**: métricas de apps e dashboards.\n- **DevOps**: métricas de infraestrutura, como alternativa ao Prometheus.\n- **Industrial**: sensores no chão de fábrica.",
                    },
                    {
                        type: "code",
                        value: "-- Exemplo de query Timestream\nSELECT bin(time, 1m) AS minute,\n       AVG(measure_value::double) AS avg_temp\nFROM iot_db.sensores\nWHERE device_id = 'sensor-123'\n  AND time > ago(1h)\nGROUP BY bin(time, 1m)\nORDER BY minute",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "IoT / métricas / sensor data" → **Timestream**.',
                    },
                    {
                        type: "text",
                        value: "## 5. Amazon QLDB - Quantum Ledger Database\n\nQLDB é um banco de **ledger imutável e criptograficamente verificável**. Cada mudança é assinada e encadeada com a anterior.\n\n### Características-chave\n\n- É **append-only**: nada é apagado ou alterado, só entram novas versões.\n- Guarda o **histórico completo**, sempre disponível, então você consegue ver qualquer estado passado.\n- Usa **hash criptográfico** para encadear as versões, o que torna impossível adulterar sem que a fraude seja detectada.\n- Consulta via **SQL-like** (a linguagem PartiQL).\n\n### Casos de uso\n\n- **Audit trail** corporativo.\n- **Histórico de transações financeiras**.\n- **Registros de saúde**, com alterações controladas e auditáveis.\n- **Supply chain**, para rastreabilidade de produto.\n- **Compliance** (HIPAA, SOX, PCI-DSS).\n\n### QLDB vs blockchain\n\n- **QLDB** é um ledger **centralizado** (um dono, a AWS), eficiente e sem consenso.\n- **Blockchain** é um ledger **descentralizado** (várias partes, com consenso).\n- Para auditoria interna de uma empresa, o **QLDB é mais simples e barato**.\n- Para uma rede de partes que não confiam entre si, aí sim usa-se **blockchain** (a AWS tem o **Managed Blockchain**).",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "**audit trail imutável**" combinado com "**criptograficamente verificável**" → **QLDB**.',
                    },
                    {
                        type: "text",
                        value: "## 6. Amazon Keyspaces - Cassandra compatible\n\nKeyspaces é a versão **serverless** do **Apache Cassandra** (um NoSQL do tipo wide-column).\n\n### Por que existe\n\n- O Cassandra é popular para **wide-column** (perfis de usuário com milhares de atributos, séries temporais).\n- Manter Cassandra on-prem é trabalhoso, e o Keyspaces oferece uma versão gerenciada.\n- É compatível com **CQL** (Cassandra Query Language), então apps que já usam Cassandra funcionam.\n\n### Características\n\n- Roda em modo **serverless** ou com capacidade provisionada.\n- **Sem servidores** para você gerenciar (parecido com o DynamoDB).\n- **Escala automática**.\n- **Replicação multi-AZ** automática.\n\n### Casos de uso\n\n- **Migrar Cassandra on-prem** para a AWS.\n- **Wide-column** com milhões de linhas (catálogos, perfis de IoT).\n- **Séries temporais**, como alternativa ao Timestream para times que já usam Cassandra.",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "Apache Cassandra na AWS serverless" → **Keyspaces**.',
                    },
                    { type: "text", value: "## 7. Resumo - qual usar quando" },
                    {
                        type: "code",
                        value: "                  Que padrão de dado?\n                          │\n         ┌────────────────┼──────────────────────┐\n         ▼                ▼                      ▼\n   Relacionamentos    Documento          Time series (IoT)\n   (grafo)            (Mongo style)              │\n         │                  │                    ▼\n         ▼                  ▼              Timestream\n     Neptune          DocumentDB\n\n                          │\n         ┌────────────────┼─────────────────────┐\n         ▼                ▼                     ▼\n   Audit trail      Cassandra        Wide-column comum\n   (imutável)       (existe app)              │\n         │                  │                 ▼\n         ▼                  ▼          DynamoDB ou Keyspaces\n       QLDB           Keyspaces",
                    },
                    { type: "text", value: "## 8. Tabela mestre" },
                    {
                        type: "table",
                        value: '[["Banco","Modelo","Caso clássico","Quem migra pra cá"],["**Neptune**","Grafo","Redes sociais, fraude, recomendação","Empresas com Neo4j / Gremlin"],["**DocumentDB**","Documento (Mongo)","Apps Mongo, CMS, catálogos","Apps MongoDB on-prem"],["**Timestream**","Time series","IoT, métricas, monitoring","Quem usaria InfluxDB ou Prometheus"],["**QLDB**","Ledger imutável","Audit trail, compliance, finance","Quem precisa de imutabilidade"],["**Keyspaces**","Wide-column","Catálogos massivos, time series, perfis","Apps Cassandra on-prem"]]',
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"Redes sociais / detecção de fraude / recomendação"** → **Neptune**.\n2. **"Compatível com MongoDB"** → **DocumentDB** (NÃO DynamoDB).\n3. **"Telemetria de sensores IoT"** → **Timestream**.\n4. **"Audit trail imutável e criptograficamente verificável"** → **QLDB**.\n5. **"Apache Cassandra na AWS"** → **Keyspaces**.\n6. **"Neptune suporta quais linguagens?"** → **Gremlin, SPARQL, openCypher**.\n7. **"QLDB vs blockchain"** - QLDB é centralizado (1 dono); blockchain é descentralizado.\n8. **"DocumentDB suporta replicação?"** → **Sim** (até 15 read replicas, similar Aurora).\n9. **"DynamoDB vs DocumentDB"** - DynamoDB = AWS-native key-value/doc; DocumentDB = MongoDB API compatible.\n10. **"Timestream tem dois tiers de storage?"** → **Sim**: memory (recente, rápido) e magnetic (antigo, barato).\n11. **"DynamoDB vs Keyspaces"** - DynamoDB é AWS-proprietary; Keyspaces fala Cassandra.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Neptune     → grafo (relacionamentos profundos)\n              casos: redes sociais, fraude, recomendação\n              linguagens: Gremlin, SPARQL, openCypher\n\nDocumentDB  → MongoDB compatible (drag-and-drop)\n              casos: migrar app Mongo, CMS, catálogo\n              storage Aurora-style (6 cópias × 3 AZs)\n\nTimestream  → time series (IoT, métricas)\n              storage tier auto: memory + magnetic\n              SQL com funções de tempo nativas\n\nQLDB        → ledger imutável criptograficamente verificável\n              casos: audit, compliance, finance\n              ≠ blockchain (QLDB = 1 dono; blockchain = N partes)\n\nKeyspaces   → Apache Cassandra serverless\n              casos: migrar Cassandra, wide-column, time series\n\nAtalhos pra prova (essas eu garanto):\n  "relacionamentos / grafo / fraude / rede social" → Neptune\n  "MongoDB compatible"                              → DocumentDB\n  "time series / IoT / métricas / sensores"        → Timestream\n  "audit trail imutável / compliance"              → QLDB\n  "Cassandra compatible"                            → Keyspaces',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma instituição financeira quer identificar fraudes analisando as conexões entre contas, endereços IP e dispositivos, percorrendo relacionamentos profundos entre essas entidades. Qual banco de dados gerenciado da AWS é o mais indicado?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon Neptune (banco de grafos)", isCorrect: true },
                            {
                                text: "Amazon DynamoDB (banco NoSQL de chave-valor)",
                                isCorrect: false,
                            },
                            { text: "Amazon Redshift (data warehouse)", isCorrect: false },
                            {
                                text: "Amazon Timestream (banco de séries temporais)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe mantém uma aplicação que usa MongoDB no próprio data center e quer migrar para a AWS sem reescrever o código, preservando a compatibilidade com a API do MongoDB. Qual serviço atende esse requisito?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Amazon DynamoDB (banco NoSQL de chave-valor)",
                                isCorrect: false,
                            },
                            { text: "Amazon ElastiCache (cache em memória)", isCorrect: false },
                            { text: "Amazon DocumentDB (compatível com MongoDB)", isCorrect: true },
                            {
                                text: "Amazon RDS for PostgreSQL (banco relacional gerenciado)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma fábrica coleta telemetria de milhões de sensores IoT, com escrita massiva de pontos formados por timestamp e valor, e consulta esses dados agregando por janelas de tempo. Qual banco de dados da AWS é otimizado para essas séries temporais?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon Neptune", isCorrect: false },
                            { text: "Amazon Timestream", isCorrect: true },
                            { text: "Amazon QLDB", isCorrect: false },
                            { text: "Amazon DocumentDB", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa de um registro de auditoria interno que seja imutável, mantenha o histórico completo de todas as alterações e seja criptograficamente verificável, controlado por uma única organização. Qual serviço da AWS foi projetado para isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon QLDB (banco de dados ledger)", isCorrect: true },
                            {
                                text: "Amazon Managed Blockchain (rede blockchain gerenciada)",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Aurora (banco relacional gerenciado)",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon DynamoDB (banco NoSQL de chave-valor)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa executa o Apache Cassandra no próprio data center e quer uma versão gerenciada e sem servidor na AWS, compatível com CQL, sem administrar a infraestrutura. Qual serviço deve escolher?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon DynamoDB (banco NoSQL de chave-valor)",
                                isCorrect: false,
                            },
                            { text: "Amazon Neptune (banco de grafos)", isCorrect: false },
                            { text: "Amazon MemoryDB (compatível com Redis)", isCorrect: false },
                            { text: "Amazon Keyspaces (para Apache Cassandra)", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS DMS - Database Migration Service",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nDMS (Database Migration Service) é o serviço da AWS para **migrar bancos de dados para a AWS** (ou entre regiões e contas) **com a aplicação continuando no ar**. Ele mantém uma replicação contínua até você fazer o cutover (a virada final). Funciona tanto em **migrações homogêneas** (Oracle para Oracle) quanto **heterogêneas** (Oracle para Aurora PostgreSQL). Neste segundo caso, ele se junta ao **Schema Conversion Tool (SCT)** para converter o schema.",
                    },
                    {
                        type: "text",
                        value: '## 1. O problema da migração\n\nMigrar banco "na mão" costuma exigir:\n\n- **Downtime**: parar o app, exportar, importar e religar.\n- **Risco**: errar algo no cutover e perder dados.\n- **Tempo**: terabytes de dados levam horas ou dias para copiar.\n- **Validação manual**: conferir se tudo chegou certo.\n\nO DMS resolve isso em três passos:\n\n1. Faz a **cópia inicial** dos dados (o full load).\n2. Mantém uma **replicação contínua** (CDC, Change Data Capture) de tudo que muda durante a migração.\n3. Você faz o **cutover** quando estiver pronto, com **downtime de minutos, não de horas**.\n\n## 2. Arquitetura\n\nNo centro fica a replication instance, uma EC2 gerenciada que lê do banco de origem e aplica no de destino.',
                    },
                    {
                        type: "code",
                        value: "   Source DB                                          Target DB\n   (Oracle on-prem,                                   (Aurora,\n    MySQL, SQL Server,                                 RDS, S3,\n    PostgreSQL, etc.)                                  DynamoDB, etc.)\n        │                                                 ▲\n        │                                                 │\n        │             ┌──────────────────────┐            │\n        │             │ DMS Replication      │            │\n        └─source ────▶│ Instance (EC2 gerenciada) ─target─┘\n                      │  - Lê do source                   │\n                      │  - Aplica no target               │\n                      │  - Mantém sync contínuo           │\n                      └──────────────────────┘",
                    },
                    {
                        type: "text",
                        value: "**Componentes:**\n- **Source endpoint**: onde está o banco de origem (URL e credenciais).\n- **Target endpoint**: para onde você quer levar os dados.\n- **Replication instance**: a EC2 que o DMS provisiona para fazer o trabalho.\n- **Replication task**: define o que migrar (full load, CDC, ou os dois) e o mapeamento.\n\n## 3. Tipos de migração\n\nO tipo de migração depende de origem e destino usarem o mesmo engine ou não.\n\n### Homogênea (mesmo engine)",
                    },
                    {
                        type: "code",
                        value: "   Oracle on-prem ───DMS───▶ Oracle no RDS\n   MySQL on-prem  ───DMS───▶ Aurora MySQL\n   PostgreSQL     ───DMS───▶ RDS PostgreSQL",
                    },
                    {
                        type: "text",
                        value: "- O **DMS sozinho resolve**, porque o schema é o mesmo e o dado é compatível.\n- É mais simples e rápido.\n\n### Heterogênea (engines diferentes)",
                    },
                    {
                        type: "code",
                        value: "   Oracle ───SCT──▶ schema PostgreSQL ───DMS──▶ Aurora PostgreSQL\n   SQL Server ───SCT──▶ schema MySQL ───DMS──▶ RDS MySQL",
                    },
                    {
                        type: "text",
                        value: "- Precisa de **DMS mais SCT** (Schema Conversion Tool) juntos.\n- O **SCT** converte o schema, as stored procedures, os triggers e as functions.\n- O **DMS** move os dados depois que o schema já foi convertido.\n\n## 4. Schema Conversion Tool (SCT)\n\nO SCT é uma ferramenta desktop (um cliente que roda na sua máquina) que **converte o schema** entre engines diferentes.",
                    },
                    {
                        type: "code",
                        value: "   Schema Oracle               Schema PostgreSQL\n   ────────────                 ─────────────────\n   PROCEDURE sync_users IS      CREATE FUNCTION sync_users()\n   BEGIN                        RETURNS void AS $$\n       INSERT INTO ...          BEGIN\n   END;                             INSERT INTO ...\n                                END;\n                                $$ LANGUAGE plpgsql;",
                    },
                    {
                        type: "text",
                        value: "O que ele faz:\n- Analisa o schema de origem.\n- Gera um **report** mostrando quanto ele converte de forma automática e quanto vai precisar de ajuste manual.\n- Converte e aplica no destino, ou exporta um script SQL para você revisar antes.",
                    },
                    {
                        type: "quote",
                        value: "**O SCT NÃO move dados**, só o schema e o código. Para os dados, o serviço é o **DMS**.",
                    },
                    {
                        type: "text",
                        value: "## 5. Sources e Targets suportados\n\n### Sources (de onde sai)",
                    },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplos"],["**SQL on-prem**","Oracle, SQL Server, MySQL, PostgreSQL, MariaDB, SAP ASE, IBM Db2"],["**SQL na AWS**","RDS (todos engines), Aurora"],["**NoSQL**","MongoDB"],["**Data warehouses**","Oracle Exadata, Teradata, Vertica, Netezza, Greenplum, IBM Db2 Warehouse"],["**Outros**","Azure SQL DB, Google Cloud SQL"]]',
                    },
                    { type: "text", value: "### Targets (pra onde vai)" },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplos"],["**SQL gerenciado AWS**","RDS (todos engines), Aurora"],["**NoSQL AWS**","DynamoDB, DocumentDB"],["**Analytics AWS**","Redshift, OpenSearch, Kinesis Data Streams"],["**Storage**","**S3** (formato Parquet/CSV - útil pra data lake)"],["**Stream**","Kinesis, Kafka (MSK)"]]',
                    },
                    { type: "text", value: "## 6. Modos de operação" },
                    {
                        type: "table",
                        value: '[["Modo","O que faz"],["**Full Load only**","Cópia inicial completa, depois para"],["**Full Load + CDC**","Cópia inicial + replicação contínua até você apertar stop"],["**CDC only**","Só replicação contínua (assume target já tem dados iniciais)"]]',
                    },
                    {
                        type: "quote",
                        value: '**Migração tipo "zero-downtime":** use full load mais CDC. O app continua escrevendo no source durante a migração, e o DMS replica tudo para o target em tempo real. O cutover é só mudar a string de conexão do app para apontar para o target.',
                    },
                    {
                        type: "text",
                        value: "## 7. Casos de uso\n\n- **Migração on-prem para AWS** (lift-and-shift de Oracle e SQL Server).\n- **Re-platforming** (Oracle para Aurora PostgreSQL, para cortar custo de licença).\n- **Migração entre regiões AWS** (replicar um RDS de us-east-1 para eu-west-1).\n- **Migração cross-account** (um workload indo da conta A para a conta B).\n- **Replicação contínua para analytics** (RDS para S3 em formato Parquet, para Athena ou Redshift).\n- **CDC para data warehouse** (RDS para Redshift em tempo real).\n- **Consolidação** (vários bancos indo para um único data lake no S3).\n\n## 8. Pricing",
                    },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Replication instance**","Por hora da EC2 (T3, C5, R5) - você escolhe o tamanho"],["**Storage da instance**","$/GB-mês de log/cache"],["**Data transfer**","Saída pra outra região"],["**SCT**","**Grátis** (download e use)"]]',
                    },
                    {
                        type: "quote",
                        value: "**DMS é barato:** você paga só pela replication instance enquanto ela roda. Uma migração de 100 GB pode custar menos de $50.",
                    },
                    {
                        type: "text",
                        value: '## 9. AWS Application Discovery Service (mention)\n\nAntes de migrar, você precisa **descobrir** o que está rodando on-prem.\n\n- O **AWS Application Discovery Service** coleta o inventário de servidores, dependências e métricas.\n- Ele ajuda a decidir **o que migrar primeiro** e **como** (rehost, replatform ou refactor).\n\nIsso não cai diretamente em DMS, mas faz parte do processo de migração.\n\n## 10. Pegadinhas comuns da prova\n\n1. **"Migrar banco com app rodando, sem downtime"** → **DMS**.\n2. **"Migrar Oracle → Aurora PostgreSQL"** → **DMS + SCT** (heterogênea).\n3. **"Migrar Oracle → Oracle no RDS"** → **DMS** sozinho (homogênea).\n4. **"Replicar continuamente RDS pra S3 em Parquet"** → **DMS** (target = S3).\n5. **"Converter stored procedures Oracle pra PostgreSQL"** → **SCT** (não DMS).\n6. **"DMS move o schema?"** → **Não diretamente em heterogênea** - usa SCT. Em homogênea, sim.\n7. **"DMS suporta CDC?"** → **Sim** - replica mudanças contínuas.\n8. **"DMS pode replicar pra Redshift?"** → **Sim** (target suportado).\n9. **"DMS funciona pra migrar para DynamoDB?"** → **Sim** (target NoSQL).\n10. **"Quanto cobra o SCT?"** → **Grátis** (download).\n11. **"DMS roda na minha conta?"** → **Sim**, replication instance é EC2 sua (gerenciada por DMS).\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'DMS = Database Migration Service\n       Migra banco pra AWS com app rodando (zero/baixo downtime)\n       Full Load, CDC contínuo, ou ambos\n\nModos:\n  Full Load only    → cópia inicial, para\n  Full Load + CDC   → cópia + replicação contínua (cutover quando quiser)\n  CDC only          → só mudanças (target já populado)\n\nTipos:\n  Homogênea (mesmo engine)        → DMS sozinho\n                                     ex: Oracle → Oracle, MySQL → Aurora MySQL\n  Heterogênea (engine diferente)  → DMS + SCT\n                                     ex: Oracle → Aurora PostgreSQL\n\nSCT = Schema Conversion Tool (cliente desktop, GRÁTIS)\n       Converte schema, stored procedures, triggers\n       NÃO move dados (isso é DMS)\n\nSources típicos:\n  Oracle, SQL Server, MySQL, PostgreSQL, MongoDB, Teradata,\n  Vertica, RDS, Aurora, Azure SQL, GCP Cloud SQL\n\nTargets típicos:\n  RDS, Aurora, Redshift, DynamoDB, DocumentDB, S3 (Parquet),\n  Kinesis, OpenSearch, MSK\n\nAtalhos pra prova:\n  "migrar banco zero-downtime"            → DMS\n  "Oracle → PostgreSQL"                   → DMS + SCT\n  "Oracle → Oracle (mesmo engine)"        → DMS\n  "converter schema/procedures"           → SCT (grátis)\n  "replicar contínuo pra data lake"       → DMS target = S3\n  "consolidar vários bancos em 1 lugar"   → DMS multi-source → S3/Redshift',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa quer migrar o banco de dados on-premises para a AWS mantendo a aplicação no ar, com o menor tempo de indisponibilidade possível. Qual serviço foi feito para isso?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Database Migration Service (AWS DMS)", isCorrect: true },
                            { text: "AWS DataSync", isCorrect: false },
                            { text: "AWS Snowball", isCorrect: false },
                            { text: "Amazon RDS", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um time precisa migrar um banco Oracle para o Amazon Aurora PostgreSQL. Como a origem e o destino usam engines diferentes, o que deve ser usado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O DMS para mover os dados, junto com o Schema Conversion Tool (SCT) para converter o schema",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas o DMS, que converte o schema entre qualquer engine automaticamente",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o SCT, que converte o schema e também move os dados",
                                isCorrect: false,
                            },
                            {
                                text: "A cópia de um snapshot do RDS Oracle diretamente para o Aurora PostgreSQL",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação sobre o AWS Schema Conversion Tool (SCT) está correta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Converte o schema, as stored procedures e os triggers entre engines diferentes, mas não move os dados",
                                isCorrect: true,
                            },
                            {
                                text: "Move tanto os dados quanto o schema, o que dispensa o DMS na migração",
                                isCorrect: false,
                            },
                            {
                                text: "É cobrado por hora, da mesma forma que a replication instance do DMS",
                                isCorrect: false,
                            },
                            {
                                text: "Só pode ser usado em migrações homogêneas, entre o mesmo engine",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Numa migração com o DMS, a aplicação vai continuar gravando no banco de origem e todas as alterações precisam chegar ao destino em tempo real até o cutover. Qual modo do DMS atende a isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Full Load mais CDC (Change Data Capture)", isCorrect: true },
                            { text: "Full Load only (apenas a carga inicial)", isCorrect: false },
                            {
                                text: "Exportar um dump do banco e importar no destino manualmente",
                                isCorrect: false,
                            },
                            {
                                text: "Somente o SCT, que replica as mudanças continuamente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa quer replicar continuamente os dados de um banco RDS para um data lake no Amazon S3, em formato Parquet, para análises. O DMS consegue fazer isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sim, o Amazon S3 é um destino suportado pelo DMS, inclusive gravando em Parquet ou CSV",
                                isCorrect: true,
                            },
                            {
                                text: "Não, o DMS só migra dados para bancos relacionais como RDS e Aurora",
                                isCorrect: false,
                            },
                            {
                                text: "Não, para gravar no S3 é obrigatório substituir o DMS pelo AWS Glue",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, mas o DMS grava no S3 apenas em texto puro, nunca em Parquet",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Redes",
        aulas: [
            {
                titulo: 'Amazon VPC - Visão Geral (a "rede privada" da sua conta AWS)',
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA **VPC (Virtual Private Cloud, a nuvem privada virtual)** é a **sua rede privada dentro da AWS**. Você define o espaço de endereçamento IP, divide essa rede em **subnets públicas e privadas**, controla as rotas e decide o que pode falar com a internet. **Quase todo recurso da AWS roda dentro de uma VPC**: EC2, RDS, ElastiCache, Fargate e a Lambda (quando ela precisa). Entender VPC é a base para entender redes na AWS.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é VPC (modelo mental)\n\nPense numa VPC como **o prédio inteiro** que você alugou na AWS:",
                    },
                    {
                        type: "code",
                        value: "   ┌────────────────────────────────────────────────────────┐\n   │ VPC = um prédio (10.0.0.0/16)                           │\n   │  Você decide o CIDR (faixa de IPs)                       │\n   │                                                          │\n   │  ┌────────────────────┐    ┌────────────────────┐        │\n   │  │ Subnet pública     │    │ Subnet privada     │        │\n   │  │ (andar com janela  │    │ (andar interno     │        │\n   │  │  pra rua)          │    │  sem janela)       │        │\n   │  │  10.0.1.0/24       │    │  10.0.2.0/24       │        │\n   │  │                    │    │                    │        │\n   │  │  EC2 web server    │    │  RDS, ElastiCache  │        │\n   │  │  ALB               │    │  EC2 backend       │        │\n   │  │                    │    │                    │        │\n   │  └────────────────────┘    └────────────────────┘        │\n   │           │                          │                   │\n   │           │ rota pra IGW            │ rota pra NAT      │\n   │           │                          │                   │\n   └───────────┼──────────────────────────┼───────────────────┘\n               │                          │\n               ▼                          ▼\n        Internet Gateway              NAT Gateway\n        (IGW)                         (sai pra internet,\n        entrada+saída internet         não recebe entrada)",
                    },
                    {
                        type: "text",
                        value: '**Conceitos-chave:**\n- Uma **VPC** vive em **uma única região**. Ela não é global.\n- Cada **subnet** vive em **uma AZ (Availability Zone, a zona de disponibilidade) específica**. Se você quer presença em várias AZs, cria uma subnet em cada uma delas.\n- O **CIDR** é a faixa de IPs da rede. Um `/16` oferece cerca de 65 mil IPs e um `/24` oferece 256 IPs.\n- O que torna uma subnet **pública ou privada** são as **route tables (tabelas de rotas)**, e não alguma propriedade da subnet em si.\n\n## 2. Componentes principais\n\n### 2.1 Subnet\nA subnet é uma subdivisão da VPC e **fica dentro de uma AZ**. Uma subnet pública tem uma rota para o **Internet Gateway**. Uma subnet privada tem uma rota para o **NAT Gateway** (para conseguir saída para a internet) ou não tem nenhuma rota externa, ficando totalmente isolada.\n\n### 2.2 Internet Gateway (IGW)\nO Internet Gateway (IGW) é a **porta de entrada e de saída** da VPC para a internet. Existe uma IGW por VPC, e ela fica anexada à VPC inteira. Recursos que estão numa subnet pública e têm um **IP público** podem ser acessados a partir da internet.\n\n### 2.3 NAT Gateway\nO NAT Gateway (NAT vem de Network Address Translation, ou tradução de endereços de rede) permite que recursos em **subnets privadas iniciem** conexões com a internet, por exemplo para baixar patches ou chamar APIs externas. Ele **não permite** que a internet inicie uma conexão para dentro, então a subnet privada continua "invisível" de fora. Ele é **cobrado por hora mais a quantidade de GB processados**, então tome cuidado porque pode ficar caro. A recomendação é ter **1 NAT por AZ** para garantir alta disponibilidade (HA).\n\n### 2.4 Route Table\nA route table é a "tabela de roteamento": ela define **para onde vai cada destino de tráfego**. Cada subnet tem **uma** route table associada. Um exemplo de regras:',
                    },
                    {
                        type: "code",
                        value: "  10.0.0.0/16  → local  (tráfego dentro da VPC sempre fica dentro)\n  0.0.0.0/0    → IGW    (resto vai pra internet - public subnet)\n  0.0.0.0/0    → NAT    (resto vai pra internet via NAT - private subnet)",
                    },
                    {
                        type: "text",
                        value: "### 2.5 CIDR (Classless Inter-Domain Routing)\nO CIDR é a notação que descreve a faixa de IPs, como em `10.0.0.0/16`. Um `/16` são 65.536 endereços, um `/24` são 256 endereços e um `/28` são 16 endereços. A **AWS reserva 5 IPs por subnet** (para rede, gateway, DNS, uso futuro e broadcast). Uma VPC também pode ter **múltiplos blocos CIDR** (os secundários).\n\n## 3. Fluxo típico de uma aplicação 3-tier",
                    },
                    {
                        type: "code",
                        value: "   Internet ──▶ IGW\n                 │\n                 ▼\n            ┌────────────────────────────────────┐\n            │ Public Subnets (us-east-1a, 1b)    │\n            │  ALB                                │\n            └──────────┬─────────────────────────┘\n                       │ tráfego HTTP\n                       ▼\n            ┌────────────────────────────────────┐\n            │ Private Subnets (us-east-1a, 1b)   │\n            │  EC2 / Fargate (app)                │\n            └──────────┬─────────────────────────┘\n                       │ queries SQL\n                       ▼\n            ┌────────────────────────────────────┐\n            │ Private Subnets (us-east-1a, 1b)   │\n            │  RDS Multi-AZ                       │\n            └─────────────────────────────────────┘\n\n   Saída da app pra internet (ex.: atualizar pacotes):\n   App (private) ──▶ NAT Gateway (public) ──▶ IGW ──▶ Internet",
                    },
                    {
                        type: "quote",
                        value: "**Por que essa arquitetura?** O ALB (público) só expõe a porta HTTP. As instâncias EC2 e o RDS **nunca** recebem IP público, então ninguém consegue atacá-los diretamente. O tráfego só entra **passando pelo ALB**.",
                    },
                    { type: "text", value: "## 4. VPC Peering - conectar 2 VPCs" },
                    {
                        type: "code",
                        value: "   VPC A ◀──── peering ────▶ VPC B\n   10.0.0.0/16              10.1.0.0/16\n\n   Tráfego viaja na rede AWS (não internet),\n   baixa latência, sem custo de data transfer entre AZs.",
                    },
                    {
                        type: "text",
                        value: "- É uma **conexão 1 para 1** entre 2 VPCs. Elas podem estar na mesma conta ou em contas diferentes, na mesma região ou em regiões diferentes (cross-region).\n- Os **CIDRs não podem se sobrepor** entre as duas VPCs.\n- O peering **não é transitivo**: se A fala com B, e B fala com C, isso **não** faz A falar com C.\n- Serve, por exemplo, para uma empresa com várias contas ou para integração com um parceiro.",
                    },
                    {
                        type: "quote",
                        value: "**Pegadinha:** peering NÃO é transitivo. Para montar um hub-and-spoke entre N VPCs, use o **Transit Gateway**.",
                    },
                    { type: "text", value: "## 5. AWS Transit Gateway (visão rápida)" },
                    {
                        type: "quote",
                        value: "É um hub central para conectar **muitas VPCs mais o on-premises** em um único ponto.",
                    },
                    {
                        type: "code",
                        value: "                  ┌─────────────────┐\n                  │ Transit Gateway │\n                  │  (hub central)   │\n                  └────────┬────────┘\n                           │\n        ┌──────────────────┼──────────────────┬─────────────┐\n        ▼                  ▼                  ▼             ▼\n       VPC A              VPC B              VPC C        On-prem\n                                                          (via VPN ou DX)",
                    },
                    {
                        type: "text",
                        value: "- Substitui a malha N por N de peerings (que cresce para N² conexões).\n- É **transitivo**: qualquer VPC fala com qualquer outra passando pelo hub.\n- Cobra por **anexamento mais os GB processados**.\n- Caso de uso: **empresa com muitas contas, VPCs e data centers**.\n\n## 6. VPC Endpoints - acessar serviços AWS sem internet\n\nImagine uma EC2 numa subnet privada que precisa falar com o **S3 ou o DynamoDB**. Sem um VPC Endpoint, esse tráfego sai pela NAT Gateway, passa pela IGW, vai para a internet pública e só então chega na AWS. Isso gera custo, latência e um risco de segurança extra.\n\nCom o **VPC Endpoint**, o tráfego fica **dentro da rede AWS** o tempo todo:",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Como funciona","Serviços suportados"],["**Gateway Endpoint**","Adiciona rota na route table (grátis)","**S3 e DynamoDB only**"],["**Interface Endpoint** (PrivateLink)","Cria ENI privada na subnet (cobra por hora)","**Quase todos os outros** (KMS, SQS, SNS, Secrets Manager, etc.)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Casos de uso:** uma EC2 em subnet privada que faz upload para o S3, ou uma Lambda dentro da VPC que escreve no DynamoDB. Tudo isso **sem precisar de NAT**, o que significa mais barato e mais seguro.",
                    },
                    {
                        type: "text",
                        value: "## 7. Default VPC (cuidado!)\n\nToda conta nova já vem com uma **Default VPC** em cada região. Ela tem estas características:\n- CIDR `172.31.0.0/16`.\n- 1 subnet pública por AZ.\n- IGW já anexado e route table já configurada.\n- Uma **EC2 lançada na default VPC ganha IP público automaticamente**.\n\n**É boa para** aprender, fazer testes rápidos e montar demos.\n\n**Não use em produção**, porque não há segregação entre público e privado, não existe subnet privada e a configuração default não segue o princípio de menor privilégio (least privilege).",
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** apague a default VPC na conta de produção e crie a sua própria com a arquitetura correta.",
                    },
                    {
                        type: "text",
                        value: '## 8. AWS Lambda dentro de VPC\n\nPor padrão, a Lambda roda **fora da sua VPC**, dentro da "VPC da AWS". Você liga a Lambda na sua VPC quando ela precisa:\n- Acessar um **RDS privado**.\n- Acessar o **ElastiCache** (que sempre fica dentro de uma VPC).\n- Acessar um recurso **on-premises via VPN ou Direct Connect**.\n\nCuidado: uma Lambda dentro da VPC sem **NAT Gateway** ou **VPC Endpoint** **não consegue acessar a internet**, nem mesmo a "internet da AWS".\n\n## 9. Limites importantes',
                    },
                    {
                        type: "table",
                        value: '[["Item","Limite padrão (mudável)"],["VPCs por região","5"],["Subnets por VPC","200"],["Internet Gateways por VPC","1"],["Route Tables por VPC","200"],["Security Groups por VPC","2500"],["Regras por Security Group","60 (in) + 60 (out)"],["SGs por ENI","5"],["VPC Peering por VPC","50"]]',
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"VPC é regional ou global?"** → **Regional** (mas spans todas AZs da região).\n2. **"Subnet é regional ou zonal?"** → **Zonal** (uma subnet = uma AZ).\n3. **"Subnet pública = subnet com IGW?"** → Não exatamente. **Public = subnet COM ROTA pra IGW**.\n4. **"NAT Gateway vs Internet Gateway"** → NAT permite só **saída** das privadas; IGW permite **entrada e saída** públicas.\n5. **"VPC Peering é transitivo?"** → **Não**. Pra hub-and-spoke, use **Transit Gateway**.\n6. **"Lambda fora de VPC acessa RDS privado?"** → **Não** - precisa colocar Lambda na VPC.\n7. **"Como acessar S3 da subnet privada sem internet?"** → **VPC Endpoint Gateway** (grátis pra S3 e DynamoDB).\n8. **"Default VPC pode ser usada em produção?"** → **Tecnicamente sim**, mas **não recomendado**.\n9. **"Quantos IPs perdidos por subnet?"** → **5** (reservados pela AWS).\n10. **"Posso ter VPC sem internet?"** → **Sim** (isolada completamente - só comunicação interna ou via VPN/DX).\n11. **"Posso ter subnet em mais de 1 AZ?"** → **Não** - subnet = 1 AZ.\n12. **"CIDRs de 2 VPCs em peering podem sobrepor?"** → **Não**.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'VPC = sua rede privada virtual numa região\n       Você define o CIDR (range de IPs)\n       Divide em subnets, cada uma em uma AZ\n\nComponentes core:\n  Subnet                → divisão da VPC, zonal (1 AZ)\n                          Pública = tem rota pra IGW\n                          Privada = sem rota pra IGW\n  Internet Gateway (IGW) → entrada/saída internet (uma por VPC)\n  NAT Gateway           → saída das privadas pra internet\n                          (cobra hora + GB, 1 por AZ pra HA)\n  Route Table           → tabela de rotas, 1 por subnet\n  ENI                   → interface de rede virtual\n\nTráfego típico:\n  Internet → IGW → ALB (public subnet) → App (private) → RDS (private)\n  App (private) → NAT GW (public subnet) → IGW → Internet (saída)\n\nConectar VPCs:\n  VPC Peering      → 1-pra-1, NÃO transitivo, CIDRs distintos\n  Transit Gateway  → hub central, transitivo, escala N VPCs\n\nAcessar serviços AWS sem internet:\n  Gateway Endpoint   → S3 e DynamoDB (grátis)\n  Interface Endpoint → quase todos os outros (cobra hora, PrivateLink)\n\nDefault VPC: existe em toda conta nova\n  CIDR 172.31.0.0/16, IGW já configurado\n  Bom pra aprender, RUIM pra produção\n\nLimites:\n  5 VPCs / região (mudável)\n  200 subnets / VPC\n  5 IPs reservados por subnet\n\nAtalhos pra prova:\n  "rede privada na AWS"           → VPC\n  "subnet ≠ AZ?"                  → NÃO, subnet É zonal\n  "saída internet das privadas"   → NAT Gateway\n  "entrada internet das públicas" → Internet Gateway\n  "conectar 2 VPCs"               → VPC Peering\n  "conectar N VPCs + on-prem"     → Transit Gateway\n  "S3 sem passar por internet"    → Gateway Endpoint (grátis)\n  "outros serviços sem internet"  → Interface Endpoint (PrivateLink)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual afirmação descreve corretamente o escopo de uma VPC e de suas subnets na AWS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma VPC pertence a uma única região, e cada subnet fica dentro de uma única Availability Zone",
                                isCorrect: true,
                            },
                            {
                                text: "Uma VPC é um recurso global, e cada subnet abrange todas as regiões automaticamente",
                                isCorrect: false,
                            },
                            {
                                text: "Uma VPC pertence a uma única Availability Zone, e cada subnet abrange a região inteira",
                                isCorrect: false,
                            },
                            {
                                text: "Uma VPC abrange várias regiões, e cada subnet pertence a uma região específica",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que efetivamente determina se uma subnet de uma VPC é pública ou privada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A route table associada à subnet: se houver uma rota para o Internet Gateway, a subnet é pública",
                                isCorrect: true,
                            },
                            {
                                text: "Uma opção de tipo 'público' ou 'privado' definida no momento de criar a subnet",
                                isCorrect: false,
                            },
                            {
                                text: "O tamanho do bloco CIDR atribuído à subnet",
                                isCorrect: false,
                            },
                            {
                                text: "A Availability Zone em que a subnet foi criada",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Instâncias EC2 em uma subnet privada precisam baixar atualizações de software da internet, mas não podem receber conexões iniciadas de fora. Qual componente atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "NAT Gateway, que permite conexões de saída iniciadas pela subnet privada e bloqueia conexões iniciadas pela internet",
                                isCorrect: true,
                            },
                            {
                                text: "Internet Gateway anexado diretamente à subnet privada, liberando entrada e saída para a internet",
                                isCorrect: false,
                            },
                            {
                                text: "VPC Peering com outra VPC que tenha saída para a internet",
                                isCorrect: false,
                            },
                            {
                                text: "Uma route table adicional com rota 0.0.0.0/0 apontando para 'local'",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A VPC A tem uma conexão de peering com a VPC B, e a VPC B tem uma conexão de peering com a VPC C. Por que a VPC A não consegue se comunicar com a VPC C?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o VPC Peering não é transitivo: a conexão de A com B e a de B com C não fazem A alcançar C",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o VPC Peering exige que as VPCs envolvidas tenham blocos CIDR sobrepostos",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o VPC Peering só funciona entre VPCs que estão na mesma Availability Zone",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o VPC Peering só conecta VPCs que pertencem a contas AWS diferentes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação em uma subnet privada precisa acessar o Amazon S3 sem que o tráfego passe pela internet pública e sem gerar cobrança por hora de endpoint. Qual solução atende a esse caso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Gateway Endpoint, que adiciona uma rota para o S3 na route table e não tem cobrança por hora nem por dados processados",
                                isCorrect: true,
                            },
                            {
                                text: "Interface Endpoint, que cria uma ENI privada na subnet e é o único tipo de endpoint compatível com o S3",
                                isCorrect: false,
                            },
                            {
                                text: "NAT Gateway configurado exclusivamente para o tráfego destinado ao S3",
                                isCorrect: false,
                            },
                            {
                                text: "Internet Gateway com um IP público atribuído à instância da aplicação",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Security Groups vs Network ACLs - Os 2 Firewalls da VPC",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nA AWS tem **2 camadas de firewall** na VPC. O **Security Group** age no nível da **instância ou da ENI (Elastic Network Interface, a interface de rede virtual)**, é **stateful** e só aceita regras de "allow". Já o **NACL (Network ACL, a lista de controle de acesso à rede)** age no nível da **subnet**, é **stateless** e aceita tanto "allow" quanto "deny". Entender essa diferença é uma das **pegadinhas mais clássicas** da prova, e também aparece bastante no dia a dia operacional.',
                    },
                    { type: "text", value: "## 1. As duas camadas de defesa" },
                    {
                        type: "code",
                        value: "   Internet\n      │\n      ▼\n   ┌────────────────────────────────────────────────┐\n   │ VPC                                             │\n   │  ┌──────────────────────────────────────────┐  │\n   │  │ Subnet                                    │  │\n   │  │  ◀── NACL filtra entrada da subnet ──     │  │\n   │  │                                            │  │\n   │  │   ┌───────────────────────────────┐        │  │\n   │  │   │ EC2 instance                   │        │  │\n   │  │   │   ◀── Security Group filtra ── │        │  │\n   │  │   │       entrada da instância      │        │  │\n   │  │   └───────────────────────────────┘        │  │\n   │  └──────────────────────────────────────────┘  │\n   └────────────────────────────────────────────────┘\n\n   Pacote pra chegar na EC2 passa por: NACL → SG → EC2",
                    },
                    {
                        type: "quote",
                        value: "**Defesa em camadas:** mesmo que um pacote passe pelo NACL, o SG ainda pode bloquear. E mesmo que o SG permita, o NACL ainda pode bloquear.",
                    },
                    { type: "text", value: "## 2. Tabela comparativa (a mais importante da nota)" },
                    {
                        type: "table",
                        value: '[["Critério","**Security Group**","**Network ACL (NACL)**"],["**Nível**","Instância / ENI","**Subnet**"],["**Stateful?**","**Sim** - resposta automática é permitida","**Stateless** - resposta precisa de regra explícita"],["**Tipo de regras**","**Só ALLOW**","**ALLOW e DENY**"],["**Avaliação de regras**","**Todas as regras** são avaliadas","**Em ORDEM numérica** (primeiro match vence)"],["**Default (recém-criado)**","**Bloqueia tudo inbound**, permite outbound","**Permite tudo inbound + outbound** (NACL \\"default\\") ou bloqueia tudo (NACL custom)"],["**Quantos podem aplicar?**","Até **5 SGs** por ENI","**1 NACL** por subnet (mas 1 NACL pode cobrir várias subnets)"],["**Aplicação**","Você anexa explicitamente à instância","Aplicada automaticamente a toda subnet"],["**Use case principal**","**Controle por instância** (web vs db vs cache)","**Bloquear IP malicioso** na entrada da subnet"]]',
                    },
                    {
                        type: "quote",
                        value: "**Mnemônico:** **S**ecurity Group é **S**imples e **S**tateful. **N**ACL é **N**umérico e stateless.",
                    },
                    {
                        type: "text",
                        value: "## 3. Stateful vs Stateless (a parte que confunde mais)\n\n### Security Group (Stateful)",
                    },
                    {
                        type: "code",
                        value: '   1. Cliente envia request (entrada na porta 443)\n      → SG inbound rule permite porta 443 → OK\n\n   2. EC2 responde (saída)\n      → SG sabe "essa é a resposta da request anterior"\n      → PERMITE automaticamente, sem precisar regra outbound',
                    },
                    {
                        type: "text",
                        value: "**Resultado:** você só precisa configurar as **regras de inbound** para controlar a entrada. O **outbound** já libera as respostas automaticamente.\n\n### NACL (Stateless)",
                    },
                    {
                        type: "code",
                        value: "   1. Cliente envia request (entrada na porta 443)\n      → NACL inbound rule permite porta 443 → OK\n\n   2. EC2 responde (saída na porta efêmera, ex.: 49000)\n      → NACL NÃO lembra da request original\n      → Precisa de regra outbound explícita permitindo\n         a porta efêmera (1024-65535 ou similar)",
                    },
                    {
                        type: "text",
                        value: "**Resultado:** **toda comunicação exige 2 regras** (uma de inbound e uma de outbound). Esquecer a de outbound é o bug mais comum.",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha clássica:** "Configurei o NACL para permitir HTTPS (443), mas o site não carrega." → faltou a regra de outbound para as **portas efêmeras** (1024-65535), que são as portas que o cliente usa para receber a resposta.',
                    },
                    {
                        type: "text",
                        value: "## 4. Avaliação de regras - primeiro match vence (NACL)\n\nNuma NACL, as regras são avaliadas em **ordem numérica** (a regra #100 vem antes da #200), e o **primeiro match decide**:",
                    },
                    {
                        type: "code",
                        value: "NACL Inbound:\n   #100  ALLOW  HTTPS  0.0.0.0/0\n   #110  DENY   ALL    1.2.3.4/32   ← bloqueia IP malicioso\n   #200  ALLOW  ALL    0.0.0.0/0",
                    },
                    {
                        type: "text",
                        value: 'Veja o que acontece com uma request do IP `1.2.3.4` na porta 443:\n- A regra #100 (ALLOW HTTPS) já dá **match**, então o tráfego é **permitido**.\n\nQueria bloquear esse IP? Então tem que **reordenar**: a regra #100 vira o DENY para o IP malicioso e, só depois, a #110 vira o ALLOW HTTPS.\n\nNo **Security Group** isso não acontece, porque todas as regras são avaliadas e não existe "ordem". Se qualquer regra permite, o tráfego passa.\n\n## 5. Referenciar outro Security Group',
                    },
                    {
                        type: "quote",
                        value: "Um recurso poderoso: uma regra de SG pode referenciar **outro SG** em vez de um IP.",
                    },
                    {
                        type: "code",
                        value: "SG-WEB inbound:\n   HTTPS (443) ← 0.0.0.0/0  (mundo todo)\n\nSG-APP inbound:\n   8080 ← SG-WEB             (só instâncias com SG-WEB podem falar)\n\nSG-DB inbound:\n   5432 ← SG-APP             (só instâncias com SG-APP podem falar com banco)",
                    },
                    {
                        type: "text",
                        value: "**Vantagens:**\n- Você não precisa saber os IPs das EC2, que ficam mudando o tempo todo.\n- Funciona bem quando o ASG (Auto Scaling Group, o recurso de escalonamento automático) sobe e desce instâncias automaticamente.\n- Define o **trust por papel** (web → app → db), e não por IP.\n\nEsse padrão de **micro-segmentação** é a melhor prática moderna.\n\n## 6. Caso prático - arquitetura 3-tier",
                    },
                    {
                        type: "code",
                        value: "   Internet\n      │\n      ▼\n   ┌───────────────────────────────────────────────────────┐\n   │ NACL Subnet Pública: ALLOW HTTPS/HTTP entrada          │\n   │  ┌────────────────────────────────────────────┐        │\n   │  │ ALB                                         │        │\n   │  │  SG-ALB:                                    │        │\n   │  │    inbound: 443 ← 0.0.0.0/0                 │        │\n   │  └─────┬──────────────────────────────────────┘        │\n   └────────┼──────────────────────────────────────────────┘\n            │\n            ▼\n   ┌───────────────────────────────────────────────────────┐\n   │ NACL Subnet Privada (App): regras mais restritivas    │\n   │  ┌────────────────────────────────────────────┐        │\n   │  │ App (EC2 / Fargate)                          │        │\n   │  │  SG-APP:                                     │        │\n   │  │    inbound: 8080 ← SG-ALB                   │        │\n   │  │    outbound: 5432 → SG-DB                    │        │\n   │  └─────┬──────────────────────────────────────┘        │\n   └────────┼──────────────────────────────────────────────┘\n            │\n            ▼\n   ┌───────────────────────────────────────────────────────┐\n   │ NACL Subnet Privada (DB): mais restritiva ainda       │\n   │  ┌────────────────────────────────────────────┐        │\n   │  │ RDS                                          │        │\n   │  │  SG-DB:                                      │        │\n   │  │    inbound: 5432 ← SG-APP (e mais ninguém)  │        │\n   │  └────────────────────────────────────────────┘        │\n   └───────────────────────────────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: "**Princípios aplicados:**\n- Cada tier tem **o seu próprio SG**.\n- Cada tier só aceita tráfego do tier **imediatamente anterior**.\n- O DB nunca expõe porta para a internet.\n- A NACL acrescenta uma camada extra, por exemplo para bloquear IPs maliciosos conhecidos.\n\n## 7. Quando usar NACL vs Security Group",
                    },
                    {
                        type: "table",
                        value: '[["Cenário","Ferramenta"],["Controle \\"padrão\\" entre tiers da app","**SG** (suficiente)"],["**Bloquear IP malicioso específico** na entrada","**NACL** (DENY explícito)"],["Permissão por papel/role (web → app → db)","**SG** (referencia outro SG)"],["Regras complexas com **ordem de prioridade**","**NACL**"],["Defesa em profundidade (combinar 2 camadas)","**SG + NACL** juntos"]]',
                    },
                    {
                        type: "quote",
                        value: "**Regra prática:** comece **só com Security Groups**. Adicione NACL quando precisar de um DENY explícito (raro em produção) ou quando houver uma exigência de compliance por 2 camadas.",
                    },
                    {
                        type: "text",
                        value: '## 8. Pegadinhas comuns da prova\n\n1. **"Security Group é stateful?"** → **Sim**. Resposta da saída é automática.\n2. **"NACL é stateful?"** → **Não, é stateless**. Precisa de regra inbound + outbound.\n3. **"SG suporta DENY?"** → **Não, só ALLOW**.\n4. **"NACL suporta DENY?"** → **Sim** (a vantagem dele sobre SG).\n5. **"NACL avalia regras em qual ordem?"** → **Ordem numérica**, primeiro match vence.\n6. **"SG vai por instância ou subnet?"** → **Instância/ENI** (até 5 SGs por ENI).\n7. **"NACL vai por instância ou subnet?"** → **Subnet** (1 NACL por subnet).\n8. **"SG default permite tudo entrada?"** → **Não**. Bloqueia entrada, permite saída.\n9. **"NACL default permite tudo?"** → A **NACL "default"** sim. A **NACL custom** começa bloqueando tudo.\n10. **"Quero bloquear IP 1.2.3.4 atacando minha app"** → **NACL DENY** (SG não consegue).\n11. **"Quero garantir que só app server fala com banco"** → **SG do banco referencia SG do app**.\n12. **"Por que minha regra HTTPS no NACL não funciona?"** → Provavelmente esqueceu **outbound de portas efêmeras** (1024-65535).\n13. **"Tráfego pra chegar na EC2 passa por quem primeiro?"** → **NACL → SG → EC2** (NACL é "mais externo").\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Security Group (SG):\n  Nível         → instância / ENI\n  Stateful      → SIM (resposta automática)\n  Regras        → SÓ ALLOW\n  Avaliação     → todas regras (qualquer permite, permite)\n  Default       → bloqueia inbound, permite outbound\n  Limites       → até 5 SGs por ENI, 60 regras in + 60 out\n  Pode referenciar → IP/CIDR ou OUTRO SG (micro-segmentação)\n\nNetwork ACL (NACL):\n  Nível         → subnet\n  Stateless     → SIM (precisa allow inbound E outbound)\n  Regras        → ALLOW e DENY\n  Avaliação     → ordem numérica, primeiro match vence\n  Default       → "default NACL" permite tudo; custom NACL bloqueia tudo\n  Limites       → 1 NACL por subnet (mas 1 NACL pode cobrir N subnets)\n\nQuando usar:\n  SG       → defesa por instância, ALLOW puro\n              "só app server fala com DB" → SG-DB ← SG-APP\n  NACL     → bloquear IP malicioso (DENY)\n              defesa em profundidade\n              compliance que exige 2 camadas\n\nOrdem do tráfego: NACL → SG → instância\n(NACL é mais "externo", SG é mais "interno")\n\nPegadinhas:\n  - Bloquear IP único → só NACL faz (SG não suporta DENY)\n  - SG é stateful (sem regra outbound pra resposta)\n  - NACL é stateless (precisa regra outbound pra resposta)\n  - NACL ordem importa, primeiro match decide\n  - Referenciar outro SG = micro-segmentação por papel',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um administrador criou um Security Group com uma regra de entrada permitindo a porta 443, mas não criou nenhuma regra de saída específica para o tráfego de resposta. Mesmo assim, as respostas às requisições HTTPS saem normalmente. Por que isso acontece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o Security Group é stateless e avalia cada pacote de entrada e de saída de forma independente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o Security Group é stateful: o tráfego de retorno de uma conexão permitida na entrada é liberado automaticamente na saída.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a Network ACL da sub-rede libera automaticamente o tráfego de saída do Security Group.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o Security Group aplica uma regra implícita de negação apenas na entrada, deixando toda a saída aberta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação está sendo atacada a partir do endereço IP 1.2.3.4 e a equipe precisa bloquear explicitamente esse IP logo na entrada da sub-rede. Qual recurso da VPC oferece suporte a esse bloqueio?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Security Group, criando uma regra de negação (deny) para o IP no nível da instância.",
                                isCorrect: false,
                            },
                            {
                                text: "Tabela de rotas, adicionando uma rota que descarta o tráfego do IP de origem.",
                                isCorrect: false,
                            },
                            {
                                text: "Internet Gateway, aplicando um filtro de bloqueio para o IP de origem.",
                                isCorrect: false,
                            },
                            {
                                text: "Network ACL, que oferece suporte a regras de negação (deny) no nível da sub-rede.",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação descreve corretamente o nível em que cada firewall da VPC atua?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O Security Group atua no nível da sub-rede e a Network ACL atua no nível da instância/ENI.",
                                isCorrect: false,
                            },
                            {
                                text: "O Security Group atua no nível da instância/ENI e a Network ACL atua no nível da sub-rede.",
                                isCorrect: true,
                            },
                            {
                                text: "Ambos atuam no nível da sub-rede, diferindo apenas no suporte a regras de negação.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos atuam no nível da instância/ENI, e a Network ACL adiciona criptografia ao tráfego.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma Network ACL de entrada tem, nesta ordem, a regra #100 ALLOW HTTPS para 0.0.0.0/0 e a regra #110 DENY ALL para 1.2.3.4/32. Uma requisição HTTPS chega do IP 1.2.3.4. Qual é o resultado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A requisição é bloqueada, porque toda regra DENY tem prioridade sobre as regras ALLOW.",
                                isCorrect: false,
                            },
                            {
                                text: "A requisição é permitida somente depois que a Network ACL avalia todas as regras da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "A requisição é permitida, porque a Network ACL avalia as regras em ordem numérica e a regra #100 corresponde primeiro.",
                                isCorrect: true,
                            },
                            {
                                text: "A requisição é bloqueada, porque a Network ACL avalia todas as regras e qualquer DENY vence.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um ambiente com Auto Scaling, os IPs das instâncias da camada de aplicação mudam com frequência. A equipe quer garantir que apenas essas instâncias acessem o banco de dados na porta 5432. Qual é a abordagem recomendada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Configurar o Security Group do banco para referenciar o Security Group da aplicação como origem na porta 5432.",
                                isCorrect: true,
                            },
                            {
                                text: "Cadastrar manualmente na Network ACL do banco os IPs atuais das instâncias de aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Liberar, no Security Group do banco, todo o bloco CIDR da VPC na porta 5432.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar no Security Group do banco uma regra de negação (deny) para todos os IPs, exceto os da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon Route 53 - DNS gerenciado da AWS",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO Route 53 é o **serviço de DNS (Domain Name System, o sistema de nomes de domínio)** da AWS. Ele resolve nomes de domínio em IPs (e faz mais do que isso), com **health checks integrados**, **roteamento inteligente** (por latência, por geografia, ponderado, com failover) e a opção de **registrar domínios**. O **DNS é o primeiro ponto de contato** de qualquer aplicação web, então fazer essa parte bem feita é a base para alta disponibilidade e baixa latência em escala global.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é DNS (recap rápido)\n\nQuando você digita `exemplo.com` no navegador, acontece o seguinte:",
                    },
                    {
                        type: "code",
                        value: '   1. Browser pergunta ao DNS: "qual o IP de exemplo.com?"\n   2. DNS responde: "54.123.45.67"\n   3. Browser conecta no 54.123.45.67 via HTTP/HTTPS',
                    },
                    {
                        type: "text",
                        value: "O **DNS é como a agenda de telefones da internet.** Sem ele, ninguém conseguiria lembrar o IP de cada site.\n\n### Conceitos\n- **Domínio**: `exemplo.com`.\n- **Subdomínio**: `api.exemplo.com`, `app.exemplo.com`.\n- **Record** (registro DNS): mapeia um nome para um valor (um IP, outro nome, etc.).\n- **Hosted Zone**: o container que guarda os records de um domínio dentro do Route 53.\n\n## 2. Tipos de records principais",
                    },
                    {
                        type: "table",
                        value: '[["Record","O que mapeia","Exemplo"],["**A**","Nome → **IPv4**","`exemplo.com → 54.123.45.67`"],["**AAAA**","Nome → **IPv6**","`exemplo.com → 2001:db8::1`"],["**CNAME**","Nome → **outro nome**","`www.exemplo.com → exemplo.com`"],["**Alias**","Nome → recurso AWS (ALB, CloudFront, S3, etc.)","`exemplo.com → meu-alb.elb.amazonaws.com`"],["**MX**","Nome → servidor de **email**","`exemplo.com → mail.google.com prio=10`"],["**TXT**","Texto livre (SPF, DKIM, verificação)","`exemplo.com → \\"v=spf1 include:_spf.google.com ~all\\"`"],["**NS**","Nome → **name servers** autoritativos","`exemplo.com → ns-123.awsdns-45.com`"],["**SOA**","\\"Autoridade\\" do domínio (meta)","(gerenciado pelo Route 53)"]]',
                    },
                    { type: "text", value: "### Alias vs CNAME (cai na prova!)" },
                    {
                        type: "table",
                        value: '[["Critério","**CNAME**","**Alias (Route 53)**"],["Aponta pra","Outro **nome DNS**","**Recurso AWS** (ALB, CF, S3, etc.)"],["Funciona no domínio raiz (apex)","**NÃO** (`exemplo.com` não pode ter CNAME)","**SIM** (`exemplo.com` pode ter alias)"],["Cobrado por query?","Sim","**Não** (queries pra alias são grátis)"],["Apenas Route 53","Não - DNS padrão","**Sim** - feature do Route 53"]]',
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** use **Alias** sempre que estiver apontando para um recurso da AWS. É grátis e funciona no apex.",
                    },
                    {
                        type: "text",
                        value: '## 3. Hosted Zones - Pública vs Privada\n\n### Public Hosted Zone\nOs records de uma Public Hosted Zone são **resolvidos publicamente**, pela internet. Ela serve para sites públicos, como `exemplo.com` e `api.exemplo.com`. A cobrança é por hosted zone mais o volume de queries (por milhão).\n\n### Private Hosted Zone\nOs records de uma Private Hosted Zone são **resolvidos só dentro de VPCs específicas**. Ela serve para DNS interno, como `db.interno` e `cache.interno`. Você associa a hosted zone a uma ou mais VPCs. É útil para microsserviços internos ou ambientes corporativos.\n\n## 4. Routing Policies - a parte mais importante\n\nO Route 53 tem **7 políticas de roteamento**, e escolher a certa para cada caso é o que mais cai na prova.\n\n### 4.1 Simple\nÉ 1 record com 1 ou mais IPs. O DNS retorna **todos os IPs em ordem aleatória**, sem health check e sem inteligência. **Caso de uso:** o mais básico de todos, com 1 servidor e 1 IP.\n\n### 4.2 Weighted\nDistribui o tráfego entre os records com base em um **peso (em %)** que você define. Por exemplo, `record A com peso 70 e record B com peso 30` faz 70% das resoluções irem para A e 30% para B. **Caso de uso:** **deployments canary**, testes A/B e migração gradual.\n\n### 4.3 Latency-based\nRoteia para o endpoint com a **menor latência de rede** até aquele cliente. Um cliente em SP recebe o IP do ALB em sa-east-1, enquanto um cliente em Londres recebe o IP do ALB em eu-west-2. **Caso de uso:** apps **globais** com infraestrutura em várias regiões, oferecendo a menor latência por usuário.\n\n### 4.4 Geolocation\nRoteia com base na **localização geográfica** do cliente (país, continente ou estado). Um cliente no Brasil vai para o IP X (que mostra português) e um cliente nos EUA vai para o IP Y (que mostra inglês). **Caso de uso:** localização de conteúdo, compliance (LGPD/GDPR) e licenciamento.\n\n### 4.5 Geoproximity (Traffic Flow)\nRoteia por **proximidade geográfica** com um **bias**, ou seja, você pode "puxar" mais ou menos tráfego para um endpoint. É mais avançado e exige o **Traffic Flow** (a interface gráfica). **Caso de uso:** balancear a carga geograficamente com um ajuste fino.\n\n### 4.6 Failover\nTem um **endpoint primário e um secundário**. Um health check monitora o primário e, se ele cair, o tráfego é enviado para o secundário. **Caso de uso:** Disaster Recovery, apontando para a região de DR quando o primário falha.\n\n### 4.7 Multivalue Answer\nFunciona como o **Simple**, mas com **health check por record**. O DNS retorna até 8 IPs, considerando só os que estão saudáveis. **Caso de uso:** um "load balancing pelo lado do DNS" simples (que não substitui um ELB).\n\n## 5. Health Checks\n\nO Route 53 consegue **monitorar a saúde** dos endpoints:\n- Faz ping por **HTTP, HTTPS ou TCP** em intervalos (de 30s ou 10s).\n- Você define um **healthy threshold**, por exemplo 3 sucessos seguidos.\n- Ele pode olhar para um **endpoint**, para uma **métrica do CloudWatch** ou para um **conjunto de health checks**.\n\n### Como ligar com routing policy',
                    },
                    {
                        type: "code",
                        value: "Routing Policy        + Health Check     = Comportamento\n─────────────────────────────────────────────────────────\nFailover              + HC no primário   → failover pro secundário se primário cair\nMultivalue Answer     + HC em cada IP    → DNS só retorna IPs saudáveis\nWeighted              + HC em cada       → registro unhealthy é excluído\nLatency-based         + HC em cada       → registro unhealthy é excluído",
                    },
                    {
                        type: "text",
                        value: "## 6. Domain Registration\n\nO Route 53 também é um **registrar de domínios**, ou seja, você pode comprar o `seudominio.com` direto na AWS.\n\n### Vantagens\n- **Integração direta** com a hosted zone (já sai configurado).\n- **Privacy guard** automático, que não expõe seus dados no WHOIS.\n- **Auto-renewal** opcional.\n- Suporte a centenas de TLDs (.com, .com.br, .io, .ai, etc.).\n\n### Não obrigatório\nVocê pode **registrar o domínio em outro lugar** (GoDaddy, Registro.br, Namecheap) e **usar o Route 53 só para o DNS**. Basta apontar os name servers do registrar para os do Route 53.\n\n## 7. Route 53 + outros serviços AWS (combos típicos)",
                    },
                    {
                        type: "code",
                        value: "Route 53 (DNS) ──▶ CloudFront ──▶ S3 / ALB\n   apex Alias       cache global    origem\n\nRoute 53 (DNS) ──▶ Global Accelerator ──▶ ALB\n   Alias            rede otimizada       app\n\nRoute 53 (DNS Failover) ──▶ ALB us-east-1 (primary)\n                       └─▶ ALB eu-west-2 (secondary, em DR)\n\nRoute 53 Latency Routing ──▶ ALB us-east-1 (clientes USA)\n                         └─▶ ALB sa-east-1 (clientes BR)\n                         └─▶ ALB ap-southeast-1 (clientes Ásia)",
                    },
                    { type: "text", value: "## 8. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Hosted Zone**","$0.50/mês por hosted zone"],["**Queries DNS standard**","$0.40 / milhão (primeiro bilhão)"],["**Latency / Geo / Geoproximity queries**","$0.60 / milhão"],["**Alias queries**","**Grátis** (quando aponta pra recurso AWS)"],["**Health checks**","$0.50/mês por HC (AWS endpoint), $0.75 não-AWS"],["**Domain registration**","$9-$200/ano dependendo do TLD"]]',
                    },
                    {
                        type: "quote",
                        value: "**Insight:** como o Alias é grátis nas queries, cada milhão de queries de produção economiza de $0.40 a $0.60.",
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"DNS gerenciado da AWS"** → **Route 53**.\n2. **"Apontar `exemplo.com` (apex) pra um ALB"** → **Alias** (CNAME não funciona no apex).\n3. **"Roteamento por menor latência global"** → **Latency-based**.\n4. **"Roteamento por país de origem"** → **Geolocation**.\n5. **"Deployment canary (90% prod, 10% novo)"** → **Weighted**.\n6. **"DR - apontar pra região B se A cair"** → **Failover** + health check.\n7. **"Compliance: usuário BR vai pra app BR, usuário EU pra app EU"** → **Geolocation**.\n8. **"Posso registrar domínio direto na AWS?"** → **Sim** (Route 53 Registrar).\n9. **"Posso ter DNS interno só pra minhas VPCs?"** → **Sim** - Private Hosted Zone.\n10. **"Quero retornar só IPs saudáveis no DNS"** → **Multivalue Answer** + health check.\n11. **"Apex/raiz suporta CNAME?"** → **NÃO** (limite DNS padrão). Use **Alias** do Route 53.\n12. **"Alias cobra query?"** → **Não** (grátis quando aponta pra AWS).\n13. **"DNS resolve a partir de quando?"** → Quando os **name servers (NS)** do domínio apontam pros Route 53 NS.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Route 53 = DNS gerenciado AWS\n\nRecords core:\n  A       → IPv4\n  AAAA    → IPv6\n  CNAME   → outro nome (NÃO funciona no apex)\n  Alias → recurso AWS (ALB, CF, S3) - funciona no apex, grátis\n\nHosted Zones:\n  Public  → DNS internet\n  Private → DNS interno só em VPCs associadas\n\nRouting Policies (7):\n  Simple          → 1 IP ou lista round-robin\n  Weighted        → pesos % (canary, A/B test)\n  Latency         → menor latência de rede\n  Geolocation     → por país/continente/estado (compliance, localização)\n  Geoproximity    → proximidade + bias (Traffic Flow)\n  Failover        → primary + secondary (DR)\n  Multivalue      → até 8 IPs com health check (LB simples DNS-side)\n\nHealth Checks:\n  HTTP/HTTPS/TCP em intervalos\n  Threshold de N sucessos seguidos\n  Integra com Failover, Multivalue, Weighted, Latency\n\nPricing:\n  Hosted Zone $0.50/mês\n  Query $0.40-$0.60 / milhão\n  Alias grátis\n  Health Check $0.50-$0.75/mês\n\nAtalhos pra prova:\n  "DNS AWS"                                 → Route 53\n  "apontar exemplo.com (apex) pra ALB"      → Alias\n  "menor latência global"                   → Latency-based\n  "país de origem"                          → Geolocation\n  "canary 90/10"                            → Weighted\n  "failover DR"                             → Failover + Health Check\n  "DNS interno"                             → Private Hosted Zone\n  "registrar domínio na AWS"                → Route 53 (é Registrar também)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma equipe precisa de um serviço gerenciado da AWS que traduza nomes de domínio, como exemplo.com, em endereços IP e que ainda ofereça health checks e políticas de roteamento integradas. Qual serviço atende a esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon Route 53", isCorrect: true },
                            { text: "Amazon CloudFront", isCorrect: false },
                            { text: "AWS Global Accelerator", isCorrect: false },
                            { text: "Amazon VPC", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "É necessário apontar o domínio raiz (apex), exemplo.com, diretamente para um Application Load Balancer identificado por um nome DNS fornecido pela AWS. Qual tipo de registro do Route 53 deve ser usado?",
                        difficulty: "medio",
                        options: [
                            { text: "Registro Alias", isCorrect: true },
                            { text: "Registro CNAME", isCorrect: false },
                            {
                                text: "Registro A com um endereço IP fixo do balanceador",
                                isCorrect: false,
                            },
                            { text: "Registro MX", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação global roda em Application Load Balancers em várias regiões da AWS. A empresa quer que cada usuário seja direcionado para a região que responde com a menor latência de rede para ele. Qual política de roteamento do Route 53 atende a esse objetivo?",
                        difficulty: "medio",
                        options: [
                            { text: "Weighted (ponderada)", isCorrect: false },
                            { text: "Latency-based (baseada em latência)", isCorrect: true },
                            { text: "Geolocation (geolocalização)", isCorrect: false },
                            { text: "Simple (simples)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O ambiente primário de uma empresa fica na região us-east-1 e o ambiente de disaster recovery fica na eu-west-2. A empresa quer que o Route 53 envie o tráfego para a região de DR automaticamente apenas quando o ambiente primário ficar indisponível. Qual solução atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Política Simple listando os dois endpoints",
                                isCorrect: false,
                            },
                            {
                                text: "Política Weighted com pesos iguais nos dois endpoints",
                                isCorrect: false,
                            },
                            {
                                text: "Política Failover com um health check monitorando o endpoint primário",
                                isCorrect: true,
                            },
                            {
                                text: "Política Geolocation direcionando o tráfego por continente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma organização quer resolver nomes internos, como db.interno e cache.interno, apenas dentro de VPCs específicas, sem expor esses registros na internet. Qual recurso do Route 53 atende a esse cenário?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Public Hosted Zone (zona hospedada pública)",
                                isCorrect: false,
                            },
                            {
                                text: "Private Hosted Zone (zona hospedada privada) associada às VPCs",
                                isCorrect: true,
                            },
                            {
                                text: "Um registro CNAME em uma zona pública apontando para os IPs internos",
                                isCorrect: false,
                            },
                            {
                                text: "Um health check TCP configurado nos serviços internos",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Conectando à AWS - VPN, Direct Connect e Transit Gateway",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nQuando a sua empresa tem **infraestrutura on-premises** e quer conectar com a AWS (o cenário **híbrido**), existem 3 opções principais. O **Site-to-Site VPN** (VPN vem de Virtual Private Network, ou rede privada virtual) é rápido de montar, roda sobre a internet e é mais barato. O **Direct Connect** é uma linha dedicada, com baixa latência e alta performance, mas demora para instalar. E o **Transit Gateway** é um hub central para conectar muitas VPCs mais o on-premises. Cada uma serve um cenário diferente.",
                    },
                    {
                        type: "text",
                        value: "## 1. Por que conectividade híbrida importa\n\nEmpresas reais raramente migram tudo de uma vez:",
                    },
                    {
                        type: "code",
                        value: "   On-Premises (data center)              AWS (cloud)\n   ──────────────────────                 ───────────\n   Sistema legado SAP                     Apps novos (EC2, Fargate)\n   ERP                                    Data lake (S3)\n   Active Directory                       Analytics (Redshift)\n   Mainframe                              ML/IA (SageMaker)\n\n        ▲                                       ▲\n        └─────── precisa se comunicar ──────────┘\n\n   Latência baixa, seguro, sem expor pra internet pública",
                    },
                    {
                        type: "text",
                        value: "**Cenários típicos:**\n- Uma app na AWS precisa consultar um **banco Oracle on-prem**.\n- Uma app on-prem precisa **ler e escrever no S3**.\n- Uma migração **gradual**, com o DMS replicando enquanto os dois ambientes coexistem.\n- **DR (Disaster Recovery, ou recuperação de desastres)**, usando um workload na AWS como backup do on-prem.\n- Um **Active Directory (AD)** centralizado no on-prem, usado por instâncias EC2 na AWS.\n\n## 2. AWS Site-to-Site VPN",
                    },
                    {
                        type: "quote",
                        value: "É um túnel **IPsec** criptografado que roda **sobre a internet pública**.",
                    },
                    { type: "text", value: "### Como funciona" },
                    {
                        type: "code",
                        value: "   On-Premises                                          AWS\n   ───────────                                          ───\n   ┌─────────────┐                                ┌─────────────┐\n   │ Customer    │   IPsec tunnel (criptografado) │ Virtual     │\n   │ Gateway     │ ◀──── sobre internet ─────────▶│ Private     │\n   │ (seu        │                                │ Gateway     │\n   │  firewall)  │                                │ (VPG)       │\n   └─────────────┘                                └──────┬──────┘\n                                                          │\n                                                          ▼\n                                                       VPC",
                    },
                    {
                        type: "text",
                        value: "### Componentes\n- **Customer Gateway (CGW)**: o seu dispositivo on-prem (um firewall ou router) com IP público.\n- **Virtual Private Gateway (VPG)**: o endpoint do lado da AWS, anexado à VPC.\n- **VPN Connection**: são 2 túneis IPsec, o que garante HA, porque se 1 falha o outro assume.\n\n### Características\n- É **rápido de configurar** (de minutos a horas).\n- **Cobra por hora de conexão mais os GB transferidos**.\n- É **criptografado** (IPsec).\n- A **performance varia**, porque depende da internet pública, então latência e banda não são garantidos.\n- O **throughput é de cerca de 1.25 Gbps** por túnel (e com o **Accelerated VPN** pode dobrar).\n\n### Casos de uso\n- **Migração inicial** (conectar rápido agora e finalizar com DX depois).\n- **DR ou backup** de uso esporádico.\n- **Filiais** que se conectam à AWS.\n- **Pequenas empresas** com tráfego moderado.\n\n## 3. AWS Direct Connect (DX)",
                    },
                    {
                        type: "quote",
                        value: "É uma **linha dedicada física** entre o seu data center e a AWS. Ela **não passa pela internet**.",
                    },
                    { type: "text", value: "### Como funciona" },
                    {
                        type: "code",
                        value: "   On-Premises                                          AWS\n   ───────────                                          ───\n   ┌─────────────┐    cabo de fibra dedicado     ┌─────────────┐\n   │ Seu router  │ ◀── via DX Location ────────▶│ Direct      │\n   │             │    (data center neutro)       │ Connect     │\n   │             │    1 / 10 / 100 Gbps          │ endpoint    │\n   └─────────────┘                                └──────┬──────┘\n                                                          │\n                                                          ▼\n                                                  VPC ou serviços\n                                                  AWS (S3, etc.)",
                    },
                    {
                        type: "text",
                        value: "### Características\n- Tem **latência baixa e consistente**, porque usa a rede privada da AWS.\n- Tem **bandwidth dedicado** de 1, 10 ou 100 Gbps.\n- **Não é criptografado por padrão**, então você deve usar TLS na aplicação ou MACsec.\n- **Demora para provisionar** (de semanas a meses, porque precisa instalar fibra).\n- É **mais caro** (uma taxa fixa mais a porta mais o data transfer).\n- Existem 2 modelos:\n  - **Dedicated**: a porta inteira é sua (1, 10 ou 100 Gbps).\n  - **Hosted**: um parceiro divide uma porta entre vários clientes (de 50 Mbps a 10 Gbps).\n\n### Casos de uso\n- **Workloads críticos** que precisam de latência consistente.\n- **Transferência massiva de dados** (na casa de TB por dia).\n- **Compliance** que proíbe tráfego pela internet pública.\n- **Conexão híbrida 24/7** com SLA.",
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** combinar o DX com uma **VPN de backup**, para que a VPN suba caso o DX caia.",
                    },
                    { type: "text", value: "## 4. VPN vs Direct Connect (comparação)" },
                    {
                        type: "table",
                        value: '[["Critério","**Site-to-Site VPN**","**Direct Connect**"],["**Meio físico**","Internet pública","**Linha dedicada** (fibra)"],["**Tempo pra subir**","Minutos a horas","**Semanas a meses**"],["**Latência**","Variável (depende da net)","**Baixa e consistente**"],["**Bandwidth**","Até ~1.25 Gbps por túnel","**1, 10 ou 100 Gbps** dedicado"],["**Criptografia**","**Sim** (IPsec nativo)","**Não nativo** (use TLS na app ou MACsec)"],["**Custo**","$$ (hora + GB)","**$$$$** (porta + GB)"],["**Quando usar**","Início, DR, baixo volume","Produção crítica, alto volume"]]',
                    },
                    { type: "text", value: "### Combo poderoso: **DX + VPN backup**" },
                    {
                        type: "code",
                        value: "   Primário:  DX (rápido, baixo custo de GB, latência baixa)\n   Backup:    VPN (sobe automaticamente se DX cair)",
                    },
                    {
                        type: "text",
                        value: "## 5. Transit Gateway - hub central pra conectar tudo",
                    },
                    {
                        type: "quote",
                        value: "Para empresas com **muitas VPCs e muitos data centers**, manter peerings e VPNs ponto a ponto vira um **caos exponencial**.",
                    },
                    { type: "text", value: "### Sem Transit Gateway (malha N×N)" },
                    {
                        type: "code",
                        value: "   VPC A ←→ VPC B\n     ↕  X    ↕\n   VPC C ←→ VPC D\n     ↕  X    ↕\n   On-prem 1 ←→ On-prem 2\n\n   N VPCs = N² conexões pra gerenciar",
                    },
                    { type: "text", value: "### Com Transit Gateway (hub-and-spoke)" },
                    {
                        type: "code",
                        value: "                  ┌─────────────────┐\n                  │ Transit Gateway │ ← hub central\n                  │     (TGW)        │\n                  └────────┬────────┘\n                           │\n        ┌──────────────────┼──────────────────┐\n        ▼          ▼       ▼        ▼         ▼\n       VPC A     VPC B   VPC C    VPN       Direct\n                                 (on-prem)  Connect (on-prem)",
                    },
                    {
                        type: "text",
                        value: "### Características\n- Faz um **hub-and-spoke** entre VPCs mais VPN mais DX.\n- É **transitivo**: qualquer VPC fala com qualquer outra passando pelo TGW.\n- Suporta **roteamento por route tables**, o que permite segregar o tráfego.\n- Funciona **cross-region** através do TGW Peering.\n- **Cobra por anexamento (por hora) mais os GB processados**.\n\n### Caso de uso\n- Empresa com **dezenas de VPCs e contas AWS** (Organizations).\n- Conectividade híbrida com **vários data centers**.\n- Necessidade de **roteamento centralizado**.",
                    },
                    {
                        type: "quote",
                        value: "**Quando NÃO usar:** se você tem só 2 ou 3 VPCs, o VPC Peering simples é mais barato e já resolve.",
                    },
                    {
                        type: "text",
                        value: "## 6. Outras opções de conectividade\n\n### AWS Client VPN\nÉ uma VPN para **usuários finais individuais**, e não site-to-site. Um cliente OpenVPN no laptop se conecta à VPC. **Caso de uso:** acesso remoto seguro para desenvolvedores e BYOD.\n\n### AWS PrivateLink\nDá acesso a serviços da AWS (S3, DynamoDB, etc.) **sem passar pela internet**. Ele cria um **Interface Endpoint** dentro da sua VPC. Veja a seção VPC Endpoints em VPC - Visão Geral.\n\n### AWS App Mesh, AWS Cloud Map\nSão um **service mesh** para a comunicação entre microsserviços. São mais avançados e ficam fora do escopo do Cloud Practitioner.\n\n## 7. Decision tree - qual opção escolher",
                    },
                    {
                        type: "code",
                        value: "                 Precisa conectar on-prem ↔ AWS?\n                          │\n                ┌─────────┴─────────┐\n                │                   │\n              SIM                  NÃO\n                │                   │\n                ▼                   ▼\n   Quanto vai usar?           Acesso de usuário\n        │                     individual remoto?\n        │                       │\n        ├── Baixo / esporádico  │\n        │   (POC, DR backup)   SIM → Client VPN\n        │       ↓\n        │   Site-to-Site VPN\n        │\n        ├── Alto / crítico\n        │   (24/7, baixa latência)\n        │       ↓\n        │   Direct Connect (+ VPN backup)\n        │\n        └── Muitos VPCs / data centers\n            (10+ recursos pra conectar)\n                ↓\n            Transit Gateway + (DX/VPN)",
                    },
                    {
                        type: "text",
                        value: '## 8. Pegadinhas comuns da prova\n\n1. **"VPN sobe rápido mas tráfego pela internet"** → **Site-to-Site VPN**.\n2. **"Linha dedicada baixa latência, demora semanas"** → **Direct Connect**.\n3. **"Conectar 20 VPCs entre si"** → **Transit Gateway** (não peering).\n4. **"DX é criptografado por padrão?"** → **Não**. Use TLS na aplicação ou MACsec.\n5. **"VPN é criptografada?"** → **Sim** (IPsec).\n6. **"Combinar DX com algo pra backup?"** → **VPN como backup do DX**.\n7. **"Acesso remoto pra desenvolvedor de casa"** → **AWS Client VPN**.\n8. **"Tempo pra subir DX?"** → **Semanas a meses** (instalar fibra física).\n9. **"Tempo pra subir VPN?"** → **Minutos a horas**.\n10. **"Bandwidth DX típico"** → **1, 10 ou 100 Gbps** dedicado.\n11. **"Bandwidth VPN típico"** → **~1.25 Gbps** por túnel (varia).\n12. **"DX passa pela internet?"** → **Não** - via DX Location (data center neutro).\n13. **"VPC peering vs Transit Gateway"** → Peering 1-pra-1 não transitivo; TGW hub transitivo.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '3 formas principais de conectar on-prem ↔ AWS:\n\nSite-to-Site VPN:\n  - Túnel IPsec sobre internet pública\n  - Rápido de subir (minutos-horas)\n  - Custo baixo ($$)\n  - Bandwidth ~1.25 Gbps/túnel, variável\n  - Casos: POC, migração, DR, filiais pequenas\n\nDirect Connect (DX):\n  - Linha dedicada (fibra) sem internet\n  - Demora pra instalar (semanas-meses)\n  - Latência baixa e CONSISTENTE\n  - Bandwidth dedicado 1/10/100 Gbps\n  - NÃO criptografado por default (use TLS app ou MACsec)\n  - Caro ($$$$)\n  - Casos: produção 24/7, alto volume, compliance\n\nTransit Gateway (TGW):\n  - Hub central pra N VPCs + on-prem\n  - Transitivo (qualquer-pra-qualquer)\n  - Substitui malha de peerings/VPNs\n  - Casos: empresa com 10+ VPCs/data centers\n\nAWS Client VPN:\n  - VPN pra USUÁRIOS FINAIS individuais\n  - Cliente OpenVPN no laptop\n  - Casos: dev remoto, BYOD\n\nCombos comuns:\n  DX + VPN backup → DX cai, VPN assume\n  TGW + DX + VPN → empresa multi-VPC com híbrido robusto\n\nDecision tree:\n  Esporádico/POC     → VPN\n  24/7 crítico       → DX (+ VPN backup)\n  Muitas VPCs        → TGW + (DX ou VPN)\n  Acesso usuário     → Client VPN\n\nAtalhos pra prova:\n  "linha dedicada baixa latência"     → Direct Connect\n  "rápido de subir, criptografado"    → Site-to-Site VPN\n  "hub central pra N VPCs"            → Transit Gateway\n  "DX criptografa?"                   → NÃO (use TLS/MACsec)\n  "VPN criptografa?"                  → SIM (IPsec)\n  "dev acessa AWS de casa"            → Client VPN',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa vai iniciar a migração para a AWS e precisa conectar o data center on-premises à nuvem ainda hoje. O volume de tráfego é moderado e não há problema em usar a internet pública, desde que a conexão seja criptografada. Qual opção de conectividade atende melhor esse cenário?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Direct Connect", isCorrect: false },
                            { text: "AWS Site-to-Site VPN", isCorrect: true },
                            { text: "AWS Transit Gateway", isCorrect: false },
                            { text: "VPC Peering", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe provisionou o AWS Direct Connect entre o data center e a AWS. Sobre a criptografia do tráfego nessa conexão, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O Direct Connect criptografa todo o tráfego automaticamente usando IPsec.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é preciso criptografar, pois o Direct Connect trafega pela internet pública com proteção nativa.",
                                isCorrect: false,
                            },
                            {
                                text: "O Direct Connect não é criptografado por padrão; para proteger o tráfego use TLS na aplicação ou MACsec.",
                                isCorrect: true,
                            },
                            {
                                text: "O Direct Connect só aceita tráfego criptografado, recusando qualquer pacote sem TLS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa possui mais de 20 VPCs distribuídas em várias contas AWS, além de conexões com data centers on-premises, e quer roteamento centralizado sem gerenciar dezenas de conexões ponto a ponto. Qual serviço resolve esse cenário?",
                        difficulty: "facil",
                        options: [
                            { text: "Um VPC Peering entre cada par de VPCs", isCorrect: false },
                            { text: "AWS PrivateLink", isCorrect: false },
                            { text: "AWS Transit Gateway", isCorrect: true },
                            { text: "AWS Client VPN", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Comparando o AWS Site-to-Site VPN com o AWS Direct Connect, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O Direct Connect usa uma conexão física dedicada e privada, com desempenho e latência mais consistentes; o Site-to-Site VPN trafega pela internet pública, cuja qualidade pode variar.",
                                isCorrect: true,
                            },
                            {
                                text: "O Direct Connect é a opção mais barata e imediata para começar, com custo por hora menor que o da VPN.",
                                isCorrect: false,
                            },
                            {
                                text: "O Site-to-Site VPN usa uma conexão física dedicada, enquanto o Direct Connect depende da internet pública.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois trafegam pela internet pública e usam os mesmos dois túneis IPsec.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Desenvolvedores precisam de acesso remoto e seguro à VPC a partir dos próprios laptops, usando um cliente OpenVPN, sem conectar um data center inteiro. Qual serviço da AWS atende esse caso?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Site-to-Site VPN", isCorrect: false },
                            { text: "AWS Direct Connect", isCorrect: false },
                            { text: "AWS Transit Gateway", isCorrect: false },
                            { text: "AWS Client VPN", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon API Gateway - Porta de entrada de APIs",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nO API Gateway é o **gateway gerenciado de APIs** da AWS. Ele recebe requisições HTTP/HTTPS de clientes externos e as roteia para os backends (Lambda, ECS, EC2 ou qualquer URL HTTP). Ele cuida de **autenticação, throttling, caching, transformação, logs, monetização** e mais. É o "**front door**" do mundo serverless e de muitas APIs modernas.',
                    },
                    {
                        type: "text",
                        value: "## 1. O que faz o API Gateway\n\nSem o API Gateway, expor uma API serverless seria um caos:",
                    },
                    {
                        type: "code",
                        value: "   Cliente ──▶ Lambda (precisa virar HTTPS)\n                 │ não tem HTTPS nativo\n                 │ não tem rate limiting\n                 │ não tem auth padronizada\n                 │ não tem cache\n                 │ ... etc.",
                    },
                    { type: "text", value: "Com o API Gateway:" },
                    {
                        type: "code",
                        value: "   Cliente ──HTTPS──▶ API Gateway ──▶ Lambda\n                          │\n                          ├── HTTPS termination (com ACM)\n                          ├── Auth (API key, IAM, Cognito, JWT)\n                          ├── Rate limiting / throttling\n                          ├── Cache de responses\n                          ├── Logs no CloudWatch\n                          ├── Transformação de request/response\n                          └── Monetização (usage plans)",
                    },
                    { type: "text", value: "## 2. Os 3 tipos de API" },
                    {
                        type: "table",
                        value: '[["Tipo","Protocolo","Caso de uso principal"],["**REST API**","HTTP/HTTPS","APIs RESTful clássicas, recursos avançados"],["**HTTP API**","HTTP/HTTPS","APIs simples, **mais barato e rápido** que REST"],["**WebSocket API**","WebSocket","Apps real-time (chat, notificações, dashboards)"]]',
                    },
                    { type: "text", value: "### REST API vs HTTP API (a comparação que cai)" },
                    {
                        type: "table",
                        value: '[["Critério","**REST API**","**HTTP API**"],["Lançamento","2015 (legado)","2019 (moderno)"],["Custo","Mais caro","**~70% mais barato**"],["Performance","Boa","**~60% menor latência**"],["Recursos avançados","**Cache, request validation, transformations**","**Mais simples** - sem cache nativo, etc."],["Auth","API Key, IAM, Cognito, Lambda Authorizer","IAM, OIDC, JWT"],["Quando usar","Precisa de cache, validation, transformations","API simples Lambda-backed, microsserviços"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recomendação atual da AWS:** comece com a **HTTP API** (o default moderno). Migre para a REST API só se precisar de um recurso específico.",
                    },
                    {
                        type: "text",
                        value: "### WebSocket API\nA WebSocket API mantém uma conexão **persistente e bidirecional**. O servidor consegue **enviar mensagens para o cliente** sem que ele tenha pedido. Serve para chat, notificações push, jogos multiplayer e cotações ao vivo.\n\n## 3. Backends suportados (integrations)",
                    },
                    {
                        type: "table",
                        value: '[["Tipo de integração","Backend"],["**Lambda**","Função AWS Lambda (o mais comum)"],["**HTTP**","Qualquer URL HTTP (EC2, ALB, on-prem, outra cloud)"],["**AWS Service**","Invoca serviço AWS direto (S3, DynamoDB, SNS, SQS, Step Functions) **sem código**"],["**Mock**","Retorna resposta fixa (útil pra prototipagem/testes)"],["**VPC Link**","Backend em **VPC privada** (sem expor pra internet)"]]',
                    },
                    {
                        type: "quote",
                        value: '**Caso poderoso:** "Quando o usuário faz um POST em `/upload`, gravar direto no DynamoDB." Sem uma Lambda no meio. Fica mais barato, com menos latência e menos código.',
                    },
                    {
                        type: "text",
                        value: "## 4. Recursos importantes\n\n### Auth (autenticação/autorização)",
                    },
                    {
                        type: "table",
                        value: '[["Mecanismo","Quem é usuário"],["**IAM**","Outros recursos AWS, usuários IAM"],["**Cognito User Pools**","Usuários finais (login com email/senha, social)"],["**Lambda Authorizer**","Lógica custom (validar JWT custom, OAuth, etc.)"],["**API Key + Usage Plan**","Parceiros que pagam pelo uso (monetização)"],["**JWT (HTTP API)**","OIDC token validation nativa"]]',
                    },
                    {
                        type: "text",
                        value: "### Throttling\nO throttling limita os **requests por segundo**, seja por API ou por usage plan. Ele protege o backend contra sobrecarga e ataques. O excesso recebe um **HTTP 429 Too Many Requests**.\n\n### Caching (só REST API)\nO cache guarda as responses de GET por X segundos. Isso reduz a latência e alivia o backend. A cobrança é por GB-hora de cache.\n\n### Stages\nOs stages são as versões da API, como **dev**, **staging** e **prod**. Cada stage tem a sua própria URL e a sua própria configuração (throttling, caching, logs).\n\n### CORS\nHá suporte nativo a **CORS (Cross-Origin Resource Sharing)**, configurável por método ou por path.\n\n### Custom Domain\nVocê pode mapear `api.exemplo.com` para a sua API, em vez de usar a URL `https://abc.execute-api...`. Isso se integra com o **ACM** (que fornece o certificado HTTPS grátis).\n\n## 5. Caso de uso clássico - API serverless completa",
                    },
                    {
                        type: "code",
                        value: "   Cliente Mobile / Web\n        │\n        ▼\n   ┌────────────────────────────────┐\n   │ API Gateway (HTTPS)            │\n   │  - Custom Domain api.x.com     │\n   │  - Cognito Authorizer          │\n   │  - Throttling 1000 req/s       │\n   └────────┬───────────────────────┘\n            │\n   ┌────────┼─────────────┬──────────┬──────────┐\n   ▼        ▼             ▼          ▼          ▼\n Lambda   Lambda      DynamoDB    SQS        S3\n GET /    POST /      direto      direto     direto\n users    orders      (sem Lambda)",
                    },
                    {
                        type: "text",
                        value: "**O que esse setup tem:**\n- HTTPS gerenciado (via ACM).\n- Auth com Cognito (login social, MFA, recuperação de conta).\n- Lambda processando a lógica mais complexa.\n- DynamoDB, SQS e S3 chamados direto, o que é mais rápido e mais barato.\n- Logs no CloudWatch.\n- Throttling automático.\n\n## 6. API Gateway vs ALB (pegadinha)",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**API Gateway**","**ALB**"],["Foco","**APIs HTTP/REST/WebSocket**","**Load balancing HTTP**"],["Targets","Lambda, HTTP backends, AWS Services, VPC Link","EC2, ECS, IP, Lambda"],["Auth nativa","**Cognito, IAM, JWT, Lambda Authorizer**","OIDC (limitado)"],["Throttling/rate limit","**Nativo**","Não nativo (precisa WAF)"],["Cache","**Sim** (REST API)","Não"],["Transformação de request/response","**Sim**","Não"],["Custo","Por request + data","Por hora + LCU"],["Quando usar","API serverless, microsserviços","Aplicação web tradicional, ECS/EC2"]]',
                    },
                    {
                        type: "quote",
                        value: "**Regra prática:** para uma **API**, use o **API Gateway**. Para uma **app web tradicional**, use o **ALB**. E dá para combinar os dois: o API Gateway responde por `/api/*` e o ALB responde por `/app/*`.",
                    },
                    {
                        type: "text",
                        value: "## 7. API Gateway vs Lambda Function URL\n\nA AWS adicionou a **Lambda Function URL** em 2022. É um endpoint HTTPS nativo da Lambda, que dispensa o API Gateway.",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**Lambda Function URL**","**API Gateway**"],["Setup","**1 clique** na Lambda","Mais complexo (recursos, métodos, integrations)"],["Custo","**Grátis** (paga só Lambda)","Por request"],["Auth","**Limitada** (none ou IAM)","Rica (Cognito, JWT, custom)"],["Throttling","Não (usa limit da Lambda)","**Sim** (configurável)"],["Custom domain","Não","**Sim**"],["Caching","Não","**Sim**"],["Quando usar","**Webhook simples, single function**","**API real** com múltiplas rotas"]]',
                    },
                    { type: "text", value: "## 8. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança (REST API US)"],["**REST API requests**","$3.50 / milhão (primeiros 333M)"],["**HTTP API requests**","**$1.00 / milhão** (~70% mais barato)"],["**WebSocket messages**","$1.00 / milhão"],["**Cache (REST API)**","$0.02/hora por 0.5 GB cache"],["**Data out**","$0.09/GB (saída pra internet)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Free Tier permanente:** 1 milhão de HTTP API requests por mês, mais 1 milhão de REST API requests por mês durante 12 meses.",
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"Gateway gerenciado de APIs serverless"** → **API Gateway**.\n2. **"API REST vs HTTP API"** → REST é mais cara, com mais recursos. HTTP é simples, mais barata, mais rápida.\n3. **"Real-time bidirecional"** → **WebSocket API**.\n4. **"Cache de response da API"** → **REST API** (HTTP API não tem).\n5. **"Login social pra API"** → **Cognito User Pools** + API Gateway.\n6. **"Validar JWT custom"** → **Lambda Authorizer** ou **JWT authorizer** (HTTP API).\n7. **"Limitar 1000 req/s pra parceiro"** → **Usage Plan + API Key + Throttling**.\n8. **"API Gateway vs ALB"** → API Gateway pra **API serverless** + auth nativa. ALB pra **app tradicional** atrás de EC2/ECS.\n9. **"Quero invocar DynamoDB direto sem Lambda"** → **AWS Service Integration** no API Gateway.\n10. **"Custom domain api.exemplo.com"** → suportado nativamente + ACM.\n11. **"Stages dev/staging/prod"** → API Gateway tem por padrão (URLs distintas, configs distintas).\n12. **"Lambda Function URL vs API Gateway"** → Function URL pra **webhook simples**. API Gateway pra **API completa**.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'API Gateway = gateway gerenciado de APIs HTTP/HTTPS\n\n3 tipos:\n  REST API      → recursos avançados (cache, validation, transformations) - caro\n  HTTP API      → simples, ~70% mais barato, default moderno\n  WebSocket API → bidirecional persistente (chat, push)\n\nIntegrações (backends):\n  Lambda        → mais comum\n  HTTP          → URL qualquer (EC2, ALB, on-prem)\n  AWS Service   → invoca DynamoDB/SQS/S3 direto SEM código\n  VPC Link      → backend em VPC privada\n  Mock          → resposta fixa pra prototipagem\n\nAuth:\n  IAM                  → recursos AWS, devs\n  Cognito User Pools   → usuários finais (login, social, MFA)\n  Lambda Authorizer    → lógica custom\n  API Key + Usage Plan → parceiros, monetização\n  JWT (HTTP API)       → OIDC nativo\n\nRecursos:\n  Throttling        → req/s, retorna 429\n  Caching           → REST API only, GB-hora\n  Stages            → dev / staging / prod\n  Custom domain     → api.exemplo.com + ACM grátis\n  CORS              → nativo\n\nAPI Gateway vs ALB:\n  API Gateway → API serverless, auth rica, throttling/cache nativos\n  ALB         → app web tradicional, EC2/ECS, sem auth rica\n\nAPI Gateway vs Lambda Function URL:\n  Function URL → 1 Lambda, webhook simples, GRÁTIS\n  API Gateway  → API completa, auth, throttling, custom domain\n\nPricing:\n  HTTP API  → $1/milhão requests\n  REST API  → $3.50/milhão\n  WebSocket → $1/milhão mensagens\n  Free tier: 1M/mês permanente em HTTP\n\nAtalhos pra prova:\n  "API serverless"                  → API Gateway\n  "WebSocket"                       → WebSocket API\n  "API mais barata e simples"       → HTTP API\n  "cache de response"               → REST API\n  "login com email/senha pra API"   → Cognito + API Gateway\n  "monetizar API"                   → API Key + Usage Plan\n  "1 Lambda, webhook simples"       → Lambda Function URL (não API GW)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma equipe tem várias funções AWS Lambda e quer expô-las como uma API HTTPS pública, com um ponto de entrada único que faça terminação HTTPS, autenticação e roteamento até os backends. Qual serviço gerenciado da AWS cumpre esse papel?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon API Gateway", isCorrect: true },
                            { text: "Amazon CloudFront", isCorrect: false },
                            { text: "Application Load Balancer", isCorrect: false },
                            { text: "Amazon Route 53", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um time vai publicar uma API simples com backend em AWS Lambda e quer o menor custo por requisição e a menor latência, sem precisar de cache nativo nem de validação de request. Qual tipo de API do Amazon API Gateway a AWS recomenda nesse caso?",
                        difficulty: "medio",
                        options: [
                            { text: "HTTP API", isCorrect: true },
                            { text: "REST API", isCorrect: false },
                            { text: "WebSocket API", isCorrect: false },
                            { text: "GraphQL API", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo de chat precisa de uma conexão persistente e bidirecional, na qual o servidor consegue enviar mensagens ao cliente sem que ele tenha feito uma requisição. Qual tipo de API do Amazon API Gateway atende a esse cenário?",
                        difficulty: "facil",
                        options: [
                            { text: "WebSocket API", isCorrect: true },
                            { text: "REST API", isCorrect: false },
                            { text: "HTTP API", isCorrect: false },
                            { text: "Lambda Function URL", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma API exposta pelo API Gateway precisa autenticar usuários finais que fazem login com email e senha ou com contas sociais, incluindo MFA. Qual mecanismo de autenticação é o indicado para esse caso?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon Cognito User Pools", isCorrect: true },
                            { text: "Usuários e roles do IAM", isCorrect: false },
                            { text: "API Key com Usage Plan", isCorrect: false },
                            { text: "AWS Lambda Authorizer", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Para proteger o backend contra sobrecarga, um time configura no API Gateway o throttling, que limita as requisições por segundo. Quando um cliente ultrapassa esse limite, qual código de status HTTP o API Gateway retorna?",
                        difficulty: "medio",
                        options: [
                            { text: "429 Too Many Requests", isCorrect: true },
                            { text: "403 Forbidden", isCorrect: false },
                            { text: "503 Service Unavailable", isCorrect: false },
                            { text: "502 Bad Gateway", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Segurança",
        aulas: [
            {
                titulo: "Modelo de Responsabilidade Compartilhada AWS",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA AWS divide a segurança em **duas partes**. A AWS cuida da segurança **DA nuvem**, ou seja, o hardware, os datacenters, o hipervisor e a rede física. **Você** cuida da segurança **NA nuvem**, ou seja, o seu sistema operacional, as suas aplicações, os seus dados, o seu IAM (Identity and Access Management, o controle de quem acessa o quê) e o seu firewall. **Confundir os dois lados é um dos erros mais perigosos**, e isso cai praticamente em toda prova.",
                    },
                    {
                        type: "text",
                        value: "## 1. O conceito em uma frase\n\nPense em duas caixas empilhadas. Em cima fica você, o cliente. Embaixo fica a AWS. Você é responsável por tudo que coloca dentro da nuvem; a AWS é responsável pela nuvem em si.",
                    },
                    {
                        type: "code",
                        value: "   ┌────────────────────────────────────────────┐\n   │           CLIENTE (você)                    │\n   │       Segurança NA nuvem                     │ ← sua app, dados, configs\n   │  (in the cloud)                             │\n   ├────────────────────────────────────────────┤\n   │              AWS                              │\n   │      Segurança DA nuvem                       │ ← infraestrutura\n   │  (of the cloud)                              │\n   └────────────────────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: "**Frase oficial:**\n- **AWS** = **security OF the cloud** → segurança da infraestrutura física e dos serviços\n- **Cliente** = **security IN the cloud** → segurança do que VOCÊ coloca dentro\n\n## 2. O que é responsabilidade da AWS\n\nA AWS fica com tudo o que forma a base física e a camada de virtualização que roda por baixo dos seus recursos:",
                    },
                    {
                        type: "code",
                        value: "   Datacenters físicos (acesso, segurança, energia, refrigeração)\n   Hardware (servidores, storage, rede)\n   Hipervisor (camada de virtualização)\n   Rede física (cabos, switches, firewalls físicos)\n   Patching da infra (hipervisor, firmware)\n   Sistema operacional dos SERVIÇOS GERENCIADOS (RDS, DynamoDB, Lambda)\n   Disponibilidade das regiões e AZs\n   Compliance da infra (certificações SOC, PCI, ISO, etc.)",
                    },
                    {
                        type: "text",
                        value: "A AWS publica em **AWS Artifact** todos os relatórios de compliance da infra que ela cobre.\n\n## 3. O que é responsabilidade do cliente\n\nDo seu lado fica tudo o que você configura, coloca ou roda dentro da nuvem:",
                    },
                    {
                        type: "code",
                        value: "   Seus dados (criptografia, classificação, backup lógico)\n   Identidade e acesso (IAM users, roles, policies, MFA)\n   Sistema operacional da EC2 (patches, hardening, antivirus)\n   Aplicações e código (vulnerabilidades, dependências)\n   Configuração de rede dentro da VPC (SG, NACL, route tables)\n   Encryption at rest e in transit (você escolhe ligar)\n   Firewall lógico (Security Groups, NACLs, WAF)\n   Compliance da SUA aplicação (LGPD, HIPAA, PCI no nível app)",
                    },
                    {
                        type: "text",
                        value: "## 4. A linha muda conforme o serviço\n\nA divisão de responsabilidades **não é fixa**. Ela **se desloca conforme o serviço** que você usa. Quanto mais bruto (perto do servidor) for o serviço, mais coisa fica com você. Quanto mais gerenciado, mais coisa fica com a AWS.\n\n### EC2 (mais responsabilidade do cliente)",
                    },
                    {
                        type: "code",
                        value: "   CLIENTE: SO, patches, app, dados, IAM, SG, encryption, backup\n   AWS:     hipervisor, hardware, datacenter",
                    },
                    {
                        type: "text",
                        value: "Aqui você age quase como um sysadmin tradicional: gerencia muita coisa.\n\n### RDS (responsabilidade média)",
                    },
                    {
                        type: "code",
                        value: "   CLIENTE: schema, queries, índices, encryption opcional, IAM, SG, dados\n   AWS:     patches do engine, SO do host, backups automáticos, replicação",
                    },
                    {
                        type: "text",
                        value: "A AWS cuida da infraestrutura do banco de dados. Você cuida do conteúdo e do acesso a ele.\n\n### Lambda / DynamoDB / S3 (mínima responsabilidade do cliente)",
                    },
                    {
                        type: "code",
                        value: "   CLIENTE: código (Lambda), IAM, dados, encryption opcional\n   AWS:     tudo o resto - runtime, escala, patching, infra",
                    },
                    {
                        type: "text",
                        value: '**Quanto mais "serverless / managed" o serviço, menos sua responsabilidade.**\n\n## 5. Diagrama clássico (oficial AWS, traduzido)',
                    },
                    {
                        type: "code",
                        value: '                CUSTOMER RESPONSIBILITY\n                "Security IN the Cloud"\n   ┌─────────────────────────────────────────────────┐\n   │  Customer Data                                   │\n   │  Platform, Applications, Identity & Access (IAM) │\n   │  Operating System, Network & Firewall Config     │\n   │  Client-side Data Encryption & Data Integrity    │\n   │  Server-side Encryption (file system / data)      │\n   │  Network Traffic Protection (encryption, integrity, identity) │\n   └─────────────────────────────────────────────────┘\n\n                  AWS RESPONSIBILITY\n                "Security OF the Cloud"\n   ┌─────────────────────────────────────────────────┐\n   │  Software                                         │\n   │   (Compute, Storage, Database, Networking)        │\n   │  Hardware / AWS Global Infrastructure             │\n   │   (Regions, Availability Zones, Edge Locations)   │\n   └─────────────────────────────────────────────────┘',
                    },
                    {
                        type: "text",
                        value: "## 6. Compliance compartilhado\n\nCompliance quer dizer estar em conformidade com uma norma (por exemplo PCI-DSS para cartões, HIPAA para saúde, SOC e ISO para controles internos, LGPD para dados no Brasil). Esse compliance **também é compartilhado** entre você e a AWS:",
                    },
                    {
                        type: "table",
                        value: '[["Camada","Quem é responsável"],["**Infra física (DC)**","AWS (com certificações de inúmeras frameworks)"],["**Hipervisor e rede AWS**","AWS"],["**Sistema operacional EC2**","**Cliente**"],["**Aplicação e dados**","**Cliente**"],["**Configuração de IAM**","**Cliente**"]]',
                    },
                    {
                        type: "quote",
                        value: "**Insight:** estar na AWS **não te dá compliance automático**. Você herda parte (a infra), mas precisa fazer SUA parte. Use **AWS Artifact** pra baixar os relatórios da AWS - eles te ajudam na sua certificação.",
                    },
                    {
                        type: "text",
                        value: '## 7. Pegadinhas comuns da prova\n\n1. **"Quem patcheia o SO da EC2?"** → **Cliente**.\n2. **"Quem patcheia o SO do host do RDS?"** → **AWS**.\n3. **"Quem patcheia o engine MySQL do RDS?"** → **AWS** (na maintenance window).\n4. **"Quem cuida do código da minha app rodando em EC2?"** → **Cliente** (sempre).\n5. **"Quem cuida da segurança física do datacenter?"** → **AWS**.\n6. **"Quem configura IAM users?"** → **Cliente**.\n7. **"Quem garante disponibilidade da AZ?"** → **AWS**.\n8. **"Quem garante alta disponibilidade da MINHA aplicação?"** → **Cliente** (você decide multi-AZ, ASG, etc.).\n9. **"Quem cuida da segurança do hipervisor?"** → **AWS**.\n10. **"Eu uso S3, quem cuida da segurança dos meus dados nele?"** → **Cliente** decide encryption, bucket policy, etc. AWS protege a infra do S3.\n11. **"Lambda - quem cuida do runtime Python?"** → **AWS**. Você cuida do **código**.\n12. **"Compliance LGPD na minha app fica com quem?"** → **Cliente** (AWS dá a infra compliance-ready, mas a app é sua).\n13. **"Onde baixo relatórios SOC, ISO, PCI da AWS?"** → **AWS Artifact**.\n\n## 8. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: "Modelo de Responsabilidade Compartilhada:\n\n  AWS  → segurança DA nuvem (Security OF the Cloud)\n         datacenter físico\n         hardware\n         hipervisor\n         rede física\n         patches da infra\n         SO de SERVIÇOS GERENCIADOS (RDS host, Lambda runtime)\n         disponibilidade da infra (regiões, AZs)\n\n  CLIENTE → segurança NA nuvem (Security IN the Cloud)\n         seus dados (encryption opcional)\n         IAM (users, roles, policies, MFA)\n         SO da SUA EC2 (patches, hardening)\n         código da sua app\n         configuração de rede da SUA VPC (SG, NACL)\n         compliance da sua aplicação\n\nA linha MUDA conforme o serviço:\n  EC2     → cliente cuida de muita coisa (SO, patches, etc.)\n  RDS     → cliente cuida menos (SO é AWS)\n  Lambda  → cliente cuida só do código + IAM\n  S3      → cliente cuida de bucket policy, encryption, dados\n\nCompliance:\n  Infra → AWS (baixe certificados em AWS Artifact)\n  App   → você (mas herda parte da AWS)\n\nPegadinhas-chave:\n  SO da EC2          → CLIENTE\n  SO do host RDS     → AWS\n  Engine MySQL no RDS → AWS patcheia, cliente configura\n  IAM, SG, NACL      → CLIENTE configura\n  HA da aplicação    → CLIENTE (escolhe multi-AZ, ASG)\n  HA da infra        → AWS (regiões, AZs)\n  Código da app      → CLIENTE (sempre)",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No Modelo de Responsabilidade Compartilhada da AWS, a seguranca e dividida entre a AWS e o cliente. Qual alternativa descreve corretamente essa divisao?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A AWS e responsavel pela seguranca DA nuvem (infraestrutura fisica, hardware, hipervisor e rede fisica) e o cliente pela seguranca NA nuvem (seus dados, aplicacoes, sistema operacional e IAM).",
                                isCorrect: true,
                            },
                            {
                                text: "A AWS e responsavel por toda a seguranca, do datacenter fisico ate os dados e as aplicacoes do cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente e responsavel pela seguranca DA nuvem, incluindo os datacenters fisicos, e a AWS cuida apenas dos dados do cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "A divisao e sempre meio a meio entre AWS e cliente, sem depender do servico utilizado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sua empresa executa uma aplicacao em uma instancia Amazon EC2. Segundo o Modelo de Responsabilidade Compartilhada, quem deve aplicar os patches de seguranca do sistema operacional convidado dessa instancia?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A AWS, de forma automatica e transparente para o cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "A AWS, durante a janela de manutencao (maintenance window).",
                                isCorrect: false,
                            },
                            { text: "O cliente.", isCorrect: true },
                            {
                                text: "Ninguem, pois o sistema operacional das instancias EC2 nao recebe atualizacoes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Voce usa o Amazon RDS como banco de dados gerenciado. De quem e a responsabilidade de manter o sistema operacional do host e aplicar os patches do engine do banco (por exemplo, MySQL)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Do cliente, que precisa acessar o host via SSH para instalar as atualizacoes manualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Da AWS, que gerencia o sistema operacional do host e aplica os patches do engine na janela de manutencao.",
                                isCorrect: true,
                            },
                            {
                                text: "Do cliente, com as mesmas responsabilidades que teria em uma instancia EC2.",
                                isCorrect: false,
                            },
                            {
                                text: "Do cliente para o engine do banco e da AWS apenas para o hardware fisico.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um auditor solicita os relatorios de conformidade da infraestrutura da AWS, como SOC, ISO e PCI DSS. Qual servico permite baixar esses relatorios sob demanda?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS CloudTrail.", isCorrect: false },
                            { text: "AWS Artifact.", isCorrect: true },
                            { text: "AWS Trusted Advisor.", isCorrect: false },
                            { text: "AWS Config.", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Voce armazena arquivos confidenciais no Amazon S3. No Modelo de Responsabilidade Compartilhada, quem e responsavel por definir a criptografia dos dados e as bucket policies que controlam o acesso a eles?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A AWS, que e responsavel por proteger os dados de cada bucket e por definir quem pode acessa-los.",
                                isCorrect: false,
                            },
                            {
                                text: "A AWS, pois o S3 e totalmente gerenciado e cuida da seguranca dos dados do cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "E compartilhada: a AWS define as bucket policies e o cliente cuida apenas da criptografia.",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente. A AWS protege a infraestrutura do S3, mas a criptografia e o controle de acesso aos dados sao configurados pelo cliente.",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS IAM - Identity and Access Management",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nIAM (Identity and Access Management, gestão de identidade e acesso) define **quem pode fazer o quê na sua conta AWS**. Você cria **usuários** para pessoas, agrupa esses usuários em **grupos**, dá permissões através de **políticas** (arquivos JSON com Allow e Deny) e, quando uma aplicação ou serviço precisa acessar a AWS, usa **roles** (papéis com credenciais temporárias). O IAM é **GLOBAL**, ou seja, não é preso a uma região, é **gratuito** e é **a base de toda a segurança** na AWS. Errar a configuração aqui abre uma brecha crítica.",
                    },
                    {
                        type: "text",
                        value: "## 1. Os 4 pilares do IAM\n\nO IAM se apoia em quatro peças. As três primeiras representam identidades (quem age) e a quarta define as permissões (o que é permitido).",
                    },
                    {
                        type: "code",
                        value: "   ┌─────────────────────────────────────────────────────┐\n   │  USERS              GROUPS         ROLES            │\n   │  (humanos)          (organização)  (apps/serviços)  │\n   │                                                      │\n   │  └─────┬─────────────┬───────────────┬──────────┘  │\n   │        │             │               │              │\n   │        └─────────────┴───────────────┘              │\n   │                      │                                │\n   │                      ▼                                │\n   │              POLICIES (JSON)                         │\n   │              Allow / Deny actions                     │\n   └─────────────────────────────────────────────────────┘",
                    },
                    {
                        type: "table",
                        value: '[["Componente","O que é","Caso típico"],["**User**","Identidade pra **uma pessoa** ou app específica (credencial fixa)","João da equipe de DevOps"],["**Group**","Container de users com permissões compartilhadas","\\"Devs\\", \\"Admins\\", \\"Auditores\\""],["**Role**","Identidade **temporária** assumida por serviços/apps/usuários","EC2 lê do S3, Lambda escreve no DynamoDB"],["**Policy**","Documento JSON que define **o que é permitido**","\\"Pode ler bucket X, escrever na tabela Y\\""]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Root User - cuidado redobrado\n\nToda conta AWS tem **um único root user**, que é o email usado para criar a conta. Esse usuário tem **acesso ilimitado** a tudo. Você não consegue restringir o root nem com uma policy.\n\n### Boas práticas obrigatórias\n\n- Ative **MFA** (Multi-Factor Authentication, a autenticação em duas etapas) no root. Isso é obrigatório.\n- Use uma **senha forte** e um email seguro.\n- **Não use o root nas tarefas diárias.** Reserve ele só para as coisas que apenas o root pode fazer.\n- **Apague as access keys** do root. Elas não deveriam existir.\n- Crie um **IAM user com perfil de administrador** para as atividades do dia a dia.\n\n### O que SÓ o root pode fazer\n- Mudar a configuração de billing\n- Fechar a conta\n- Trocar o plano de suporte\n- Mudar o nome da conta\n- Restaurar a conta\n- Algumas operações específicas em S3 buckets",
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** "Como gerenciar permissões de billing?" → Pode delegar com `aws:ViewBilling` (uma policy) **mas root precisa habilitar IAM access ao billing primeiro**.',
                    },
                    {
                        type: "text",
                        value: "## 3. Users - humanos identificados\n\nCada **IAM user** representa **uma pessoa** ou um sistema que precisa de uma credencial fixa para acessar a conta.\n\n### Credenciais de um user",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Pra que serve"],["**Console password**","Login no Console Web (browser)"],["**Access Key ID + Secret Access Key**","CLI, SDK, programmatic access"],["**SSH keys**","Acessar repos CodeCommit"],["**Server certificates**","(raramente usado)"]]',
                    },
                    {
                        type: "text",
                        value: "### Boas práticas\n- Exija **MFA** em todos os usuários humanos.\n- Defina uma **password policy** centralizada, com no mínimo 8 caracteres, números, símbolos, expiração e histórico de senhas.\n- **Rotacione as access keys** com regularidade, por exemplo a cada 90 dias.\n- **Nunca compartilhe** credenciais entre pessoas.\n- **Atribua permissões pelo grupo**, e não direto no usuário.\n\n## 4. Groups - organização e escala\n\nEm vez de dar permissão para cada pessoa uma por uma, **junte os usuários em grupos** e dê a permissão ao grupo:",
                    },
                    {
                        type: "code",
                        value: '   Group "Devs"  ←─ Policy "ReadS3DevBucket"\n                ←─ Policy "FullAccessLambda"\n                │\n                ├── User Maria\n                ├── User João\n                └── User Pedro',
                    },
                    {
                        type: "text",
                        value: "Mudou uma permissão? Você atualiza a **policy do grupo** uma única vez e todos os usuários daquele grupo herdam a mudança.\n\n### Regras\n- Um grupo **só contém usuários**, nunca outros grupos. Não existe aninhamento.\n- Um usuário pode estar em **vários grupos** ao mesmo tempo (até 10).\n- As policies anexadas ao grupo **valem para todos** os usuários que estão nele.\n\n## 5. Roles - identidades temporárias",
                    },
                    {
                        type: "quote",
                        value: 'Roles servem para quando **algo que NÃO é um usuário humano** precisa acessar a AWS. Em vez de guardar uma credencial fixa, esse algo recebe uma **credencial temporária** (gerada pelo STS, o Security Token Service) no momento em que "assume" a role.',
                    },
                    { type: "text", value: "### Casos de uso" },
                    {
                        type: "table",
                        value: '[["Cenário","Solução"],["EC2 precisa ler do S3","**Instance Profile** (role anexada à EC2)"],["Lambda precisa escrever no DynamoDB","**Execution Role** da Lambda"],["App on-prem precisa acessar S3","**IAM Role** assumida via AWS STS"],["Conta B precisa acessar bucket da conta A","**Cross-Account Role** assumida via STS"],["Usuário SSO de Active Directory faz login","**Federated Role** via Cognito/IAM Identity Center"],["Container ECS precisa de credenciais","**Task Role**"]]',
                    },
                    {
                        type: "text",
                        value: "### Vantagens de roles vs access keys\n- Não fica **nenhuma credencial fixa (hardcoded)** no código ou na EC2.\n- A **rotação é automática**, porque o STS gera credenciais temporárias que expiram sozinhas.\n- Você tem **auditoria completa**, já que o CloudTrail registra quem assumiu a role.\n- O acesso **entre contas** (cross-account) funciona de forma limpa.",
                    },
                    {
                        type: "quote",
                        value: "**Regra de ouro:** **uma app NUNCA deve ter access key fixa no código**. Sempre use role.",
                    },
                    {
                        type: "text",
                        value: "## 6. Policies - o coração do controle\n\nUma policy é um documento JSON com **declarações de Allow (permitir) e Deny (negar)**:",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetObject",\n        "s3:ListBucket"\n      ],\n      "Resource": [\n        "arn:aws:s3:::meu-bucket",\n        "arn:aws:s3:::meu-bucket/*"\n      ]\n    },\n    {\n      "Effect": "Deny",\n      "Action": "s3:DeleteObject",\n      "Resource": "*"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "### Elementos\n- **Effect** define se a regra é `Allow` (permite) ou `Deny` (nega).\n- **Action** diz quais operações estão em jogo (por exemplo `s3:GetObject`, `ec2:RunInstances`).\n- **Resource** aponta em quais recursos a regra vale, usando o ARN (Amazon Resource Name, o identificador único do recurso).\n- **Condition** é opcional e aplica filtros extras, como IP de origem, presença de MFA ou tags.\n\n### Tipos de policy",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Onde mora","Quando usar"],["**AWS Managed Policy**","AWS predefine","Permissões comuns (ex: `ReadOnlyAccess`)"],["**Customer Managed Policy**","Você cria","Reutilizar entre vários users/groups/roles"],["**Inline Policy**","Embutida no user/group/role","Permissão específica que não vai reutilizar"],["**Resource-based Policy**","Anexada ao recurso (bucket S3, fila SQS)","\\"Quem pode acessar este bucket\\""]]',
                    },
                    {
                        type: "text",
                        value: "### Avaliação de policies (regras)\n\n1. **Por padrão, tudo é negado** (implicit deny).\n2. Um **Allow explícito** libera a ação.\n3. Um **Deny explícito SEMPRE GANHA** sobre qualquer Allow.",
                    },
                    {
                        type: "quote",
                        value: "**Princípio do menor privilégio:** dê **só** o que a pessoa ou app precisa. Comece do zero e vá adicionando conforme a necessidade aparece, nunca o contrário.",
                    },
                    { type: "text", value: "## 7. IAM Identity Center (antigo AWS SSO)" },
                    {
                        type: "quote",
                        value: "É a forma moderna de **gerenciar o acesso de vários usuários a várias contas AWS** de um lugar só (SSO quer dizer Single Sign-On, login único).",
                    },
                    {
                        type: "text",
                        value: '### Características\n- **Login único** que se conecta ao Microsoft AD, Google Workspace, Okta ou Azure AD.\n- **Multi-conta**, ou seja, gerencia o acesso a várias contas de uma AWS Organizations.\n- **Sessões temporárias**, o que é mais seguro do que IAM users tradicionais com credencial fixa.\n- **Gratuito**.\n\n### Quando usar\n- Empresa com **vários usuários** e **várias contas AWS** (organizations).\n- Quando você quer SSO integrado ao seu **provedor de identidade (IdP) corporativo**.\n- Para substituir os IAM users no acesso de humanos em escala.\n\n## 8. Recursos importantes\n\n### Multi-Factor Authentication (MFA)\n- É um **segundo fator** depois da senha (app autenticador, chave física Yubikey ou SMS).\n- É **obrigatório no root** como boa prática.\n- **Pode ser exigido** por uma condition dentro de uma policy, no estilo "só permita esta ação se houver MFA".\n\n### Password Policy\n- No mínimo 8 caracteres.\n- Forçar números, símbolos e maiúsculas.\n- Expiração, por exemplo a cada 90 dias.\n- Histórico, para não reaproveitar as últimas senhas.\n\n### Access Analyzer\n- Detecta recursos compartilhados para fora da conta, como buckets S3 públicos.\n- Roda em segundo plano e gera alertas automáticos.\n\n### Credential Reports\n- Um relatório em CSV com o **status de todas as credenciais** dos usuários da conta.\n- Serve para auditoria periódica, por exemplo uma revisão trimestral.\n\n### IAM Roles Anywhere\n- Permite que **recursos on-prem** (fora da AWS) assumam IAM roles usando um certificado X.509.\n- Assim você não precisa deixar uma access key fixa num servidor local.\n\n## 9. Pegadinhas comuns da prova\n\n1. **"IAM é regional?"** → **NÃO. IAM é GLOBAL** (users, roles, policies valem em todas regiões).\n2. **"IAM custa quanto?"** → **Grátis**.\n3. **"O que SÓ o root pode fazer?"** → Fechar conta, mudar plano de suporte, mudar email/nome.\n4. **"Devo usar root pra tarefas diárias?"** → **NUNCA**. Crie IAM user admin.\n5. **"Como app numa EC2 acessa S3 sem hardcoded keys?"** → **IAM Role** anexada via **Instance Profile**.\n6. **"Posso ter MFA no IAM user?"** → **Sim, e deve ter** (boa prática).\n7. **"O que ganha: Allow explícito ou Deny explícito?"** → **Deny SEMPRE ganha**.\n8. **"Quem pode ler o bucket por padrão?"** → **Ninguém** (default deny).\n9. **"Posso aninhar grupos?"** → **Não** (group de groups não existe no IAM).\n10. **"Quero SSO de AD/Okta na AWS"** → **IAM Identity Center**.\n11. **"Cross-account access sem compartilhar credencial"** → **Cross-Account Role** (STS AssumeRole).\n12. **"Detectar bucket S3 público acidentalmente"** → **IAM Access Analyzer**.\n13. **"Princípio do menor privilégio"** → conceito clássico: só permita o necessário, nada mais.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'IAM = Identity and Access Management\n  - GLOBAL (não regional)\n  - GRÁTIS\n  - 4 pilares: User / Group / Role / Policy\n\nUser      → identidade pra UMA pessoa/app (credencial fixa)\nGroup     → container de users com policies compartilhadas\n            NÃO pode ter grupos dentro\nRole      → identidade TEMPORÁRIA (STS), pra serviços/apps/cross-account\nPolicy    → JSON com Allow/Deny actions em resources\n\nRoot user:\n  - Acesso total irrestrito\n  - MFA OBRIGATÓRIA\n  - APAGAR access keys\n  - NÃO usar pra tarefas diárias\n  - Só ele fecha conta, muda plano, etc.\n\nRoles (caso a caso):\n  EC2  → Instance Profile (anexa role)\n  Lambda → Execution Role\n  ECS task → Task Role\n  Cross-account → AssumeRole via STS\n  On-prem → IAM Roles Anywhere (cert X.509)\n\nPolicy elements:\n  Effect: Allow / Deny\n  Action: s3:GetObject, ec2:RunInstances, ...\n  Resource: ARN (arn:aws:s3:::bucket/*)\n  Condition (opcional): filtros (IP, MFA, tag)\n\nAvaliação:\n  Default = DENY\n  Allow explícito permite\n  DENY EXPLÍCITO SEMPRE GANHA\n\nIAM Identity Center (antigo AWS SSO):\n  - SSO com AD, Okta, Google\n  - Multi-conta (Organizations)\n  - Substitui IAM users humanos em escala\n\nRecursos:\n  MFA               → 2º fator obrigatório\n  Password policy   → regras de senha\n  Access Analyzer   → detecta recursos públicos\n  Credential Report → CSV de status de creds\n  IAM Roles Anywhere → on-prem assume role via cert\n\nAtalhos pra prova:\n  "IAM é regional?"               → NÃO, global\n  "EC2 acessa S3 sem creds"        → IAM Role + Instance Profile\n  "Deny vs Allow"                  → Deny ganha\n  "SSO com AD/Okta"                → IAM Identity Center\n  "cross-account"                  → AssumeRole / STS\n  "detectar bucket público"        → Access Analyzer\n  "root pra tarefa diária?"        → NUNCA\n  "MFA"                             → Obrigatório no root + boa prática pra todos',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sobre as características do serviço AWS IAM, qual afirmação está correta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O IAM é um serviço global e gratuito, não estando associado a uma região específica.",
                                isCorrect: true,
                            },
                            {
                                text: "O IAM tem custo por usuário criado e precisa ser habilitado separadamente em cada região.",
                                isCorrect: false,
                            },
                            {
                                text: "O IAM funciona apenas na região us-east-1 e cobra uma taxa por política anexada.",
                                isCorrect: false,
                            },
                            {
                                text: "O IAM é um serviço regional e gratuito, precisando ser replicado manualmente entre regiões.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação rodando em uma instância EC2 precisa ler objetos de um bucket S3. Qual é a forma recomendada de conceder esse acesso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Anexar uma IAM Role à instância EC2, que fornece credenciais temporárias geradas pelo STS.",
                                isCorrect: true,
                            },
                            {
                                text: "Gravar o Access Key ID e o Secret Access Key de um IAM user diretamente no código da aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Configurar as access keys do root user na instância para garantir acesso total ao S3.",
                                isCorrect: false,
                            },
                            {
                                text: "Compartilhar a senha de console de um IAM user administrador com a aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um IAM user tem uma policy com Allow explícito para a ação s3:DeleteObject e, ao mesmo tempo, outra policy com Deny explícito para essa mesma ação. Qual é o resultado da avaliação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A ação é negada, porque um Deny explícito sempre prevalece sobre qualquer Allow.",
                                isCorrect: true,
                            },
                            {
                                text: "A ação é permitida, porque um Allow explícito tem prioridade sobre o Deny.",
                                isCorrect: false,
                            },
                            {
                                text: "A ação é permitida, porque a policy anexada mais recentemente substitui a anterior.",
                                isCorrect: false,
                            },
                            {
                                text: "O resultado fica indefinido e depende da ordem em que as policies foram anexadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é uma boa prática de segurança recomendada para o root user de uma conta AWS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ativar o MFA no root e evitar usá-lo nas tarefas do dia a dia, criando um IAM user administrador para o uso rotineiro.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar o root user em todas as atividades diárias, já que ele possui acesso ilimitado.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar access keys para o root e distribuí-las entre os membros da equipe de operações.",
                                isCorrect: false,
                            },
                            {
                                text: "Anexar uma policy de restrição ao root para limitar suas permissões de acesso.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre os grupos (groups) do IAM, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um grupo contém apenas usuários, e um mesmo usuário pode pertencer a vários grupos ao mesmo tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Um grupo pode conter outros grupos, permitindo aninhamento para herdar permissões em cascata.",
                                isCorrect: false,
                            },
                            {
                                text: "Cada usuário pode pertencer a apenas um grupo por vez dentro da conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Grupos possuem suas próprias credenciais de login e podem assumir roles diretamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Criptografia na AWS - KMS e Secrets Manager",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nA AWS resolve criptografia em duas camadas. O **AWS KMS** (Key Management Service, serviço de gestão de chaves) cuida das **chaves** de criptografia (as CMKs) usadas para criptografar dados em repouso, como em EBS, S3, RDS e EFS. O **AWS Secrets Manager** e o **Parameter Store** guardam os **secrets da aplicação**, como senhas, API keys e connection strings, com rotação automática. Já a criptografia "em trânsito" usa **TLS/SSL**, sempre com certificados do ACM.',
                    },
                    {
                        type: "text",
                        value: "## 1. Os 2 tipos de criptografia\n\nExistem dois momentos em que o dado precisa ser protegido: quando está parado no disco e quando está viajando pela rede.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","O que protege","Como AWS faz"],["**Encryption at Rest**","Dados **gravados** em disco (EBS, S3, RDS, EFS, etc.)","**KMS** + AES-256"],["**Encryption in Transit**","Dados **em trânsito** entre cliente e servidor","**TLS/SSL** (certificados via **ACM**)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** use sempre as duas ao mesmo tempo, criptografando em repouso E em trânsito. Normas de compliance como PCI, HIPAA e LGPD costumam exigir ambas.",
                    },
                    { type: "text", value: "## 2. AWS KMS - Key Management Service" },
                    {
                        type: "quote",
                        value: "É o serviço gerenciado para **criar, guardar, rotacionar e usar chaves de criptografia** sem você precisar manter um HSM (Hardware Security Module, um equipamento físico dedicado a proteger chaves) ou um sistema de chaves próprio.",
                    },
                    { type: "text", value: "### Conceitos chave" },
                    {
                        type: "table",
                        value: '[["Conceito","O que é"],["**CMK** (Customer Master Key)","A chave \\"mestre\\" - fica DENTRO do KMS, nunca sai em texto claro"],["**Envelope encryption**","Dado é criptografado com **data key**; data key é criptografada com **CMK**. KMS protege a CMK; data key fica com você."],["**Key rotation**","KMS pode rotacionar a CMK automaticamente (anual)"],["**Key policy**","Quem pode usar a chave (separada de IAM, mas integra)"]]',
                    },
                    { type: "text", value: "### Tipos de CMK" },
                    {
                        type: "table",
                        value: '[["Tipo","Descrição","Custo"],["**AWS Managed Keys** (`aws/<service>`)","AWS cria e gerencia, por serviço (`aws/s3`, `aws/ebs`)","**Grátis**"],["**Customer Managed Keys (CMK)**","**Você cria e controla** (key policy, rotation, audit)","$1/mês por chave + uso"],["**AWS Owned Keys**","AWS usa internamente pra alguns serviços (invisível pra você)","Grátis"]]',
                    },
                    {
                        type: "text",
                        value: '### Envelope encryption (como funciona)\n\nA ideia do "envelope" é usar duas chaves: uma pequena para criptografar o dado e outra (a CMK) só para proteger essa primeira chave. O passo a passo:',
                    },
                    {
                        type: "code",
                        value: '   1. Você quer criptografar um arquivo de 1 GB\n   2. KMS gera uma "data key" (256 bits)\n   3. KMS te devolve:\n      - data key em texto claro (pra criptografar)\n      - data key criptografada com a CMK (pra guardar)\n   4. Você criptografa o arquivo com a data key\n   5. Você joga fora a data key em texto claro\n   6. Você guarda: arquivo criptografado + data key criptografada\n   7. Pra descriptografar: pede pro KMS descriptografar a data key,\n      depois usa ela pra descriptografar o arquivo',
                    },
                    {
                        type: "text",
                        value: "**Por que envelope?** Porque mandar 1 GB inteiro para o KMS criptografar seria caro e lento. Assim o KMS só lida com a data key, que é pequena.\n\n## 3. Onde KMS é usado (basicamente em tudo)\n\nO KMS se integra com quase todos os serviços de armazenamento e dados da AWS:",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Como integra"],["**EBS**","Encryption automático com KMS (toggle no volume)"],["**S3**","SSE-S3 (chave gerenciada), **SSE-KMS** (sua CMK), SSE-C (chave sua local)"],["**RDS / Aurora**","Encryption at rest com KMS (irrevogável depois de ativar)"],["**DynamoDB**","Default encryption + opção de usar CMK custom"],["**Lambda**","Variáveis de ambiente criptografadas com KMS"],["**EFS / FSx**","Encryption with KMS"],["**Glue, Redshift, EMR**","Todos suportam KMS"],["**Secrets Manager**","Secrets criptografados com CMK"]]',
                    },
                    {
                        type: "text",
                        value: '### S3 - as 4 formas de criptografar\n\nNo S3, "SSE" quer dizer Server-Side Encryption, ou seja, a criptografia que acontece do lado do servidor. As quatro opções mudam de acordo com quem detém a chave:',
                    },
                    {
                        type: "table",
                        value: '[["Opção","Quem detém a chave"],["**SSE-S3**","AWS gerencia a chave (default, free)"],["**SSE-KMS**","**Você controla via KMS** (audit + key policy)"],["**SSE-C**","Cliente envia a chave junto com a request"],["**Client-side**","Cliente criptografa **antes** de enviar"]]',
                    },
                    {
                        type: "quote",
                        value: "**SSE-KMS é o caminho moderno** por dar controle, auditoria, rotação e key policy.",
                    },
                    { type: "text", value: "## 4. AWS Secrets Manager" },
                    {
                        type: "quote",
                        value: "É o serviço para guardar **secrets da aplicação** (senhas de banco, API keys, certificados) com **rotação automática** das credenciais.",
                    },
                    {
                        type: "text",
                        value: "### Características\n- Criptografa cada secret usando o **KMS**.\n- Faz **rotação automática**: cria uma senha nova, atualiza o banco e atualiza o secret.\n- Tem integração nativa com **RDS, DocumentDB e Redshift**, além de rotação custom via Lambda.\n- Oferece API e SDK para a app buscar o secret sob demanda.\n- **Cobra cerca de $0.40 por mês por secret, mais $0.05 a cada 10 mil chamadas de API.**\n\n### Como aplicação consome",
                    },
                    {
                        type: "code",
                        value: "import boto3\nclient = boto3.client('secretsmanager')\nsecret = client.get_secret_value(SecretId='prod/rds/postgres')\n# secret['SecretString'] = '{\"username\":\"admin\",\"password\":\"...\"}'",
                    },
                    {
                        type: "text",
                        value: "**Vantagens vs hardcode:**\n- Nenhuma credencial fica escrita no código ou no Git.\n- A rotação periódica acontece sem você tocar na aplicação.\n- Há auditoria de quem leu o secret e quando.\n- Suporta replicação entre regiões (cross-region).\n\n## 5. Systems Manager Parameter Store",
                    },
                    {
                        type: "quote",
                        value: "É a alternativa **gratuita** ao Secrets Manager para **configurações e secrets simples**.",
                    },
                    {
                        type: "text",
                        value: '### Quando usar Parameter Store\n- Para **configurações não críticas**, como feature flags, URLs e IDs.\n- Para **secrets simples** que não precisam de rotação automática.\n- Quando você quer **custo zero** (até 10 mil parâmetros no "standard tier").\n\n### Quando usar Secrets Manager\n- Quando você precisa de **rotação automática**.\n- Quando quer a integração nativa com RDS ou Redshift.\n- Quando precisa de replicação **cross-region**.\n- Quando o compliance exige rotação de credenciais.',
                    },
                    {
                        type: "table",
                        value: '[["Critério","**Parameter Store**","**Secrets Manager**"],["Custo","**Grátis** (Standard)","$0.40/secret/mês"],["Rotação automática","Não nativo","**Sim**, integração RDS"],["Cross-region","Manual","**Nativo**"],["Tamanho máximo","4 KB (Standard) / 8 KB (Advanced)","64 KB"],["API rate limit","Lower","Higher"],["Audit (CloudTrail)","Sim","Sim"]]',
                    },
                    {
                        type: "quote",
                        value: "**Regra prática:** comece com o Parameter Store. Migre para o Secrets Manager **só quando precisar de rotação automática** ou de uma integração específica.",
                    },
                    { type: "text", value: "## 6. AWS Certificate Manager (ACM)" },
                    {
                        type: "quote",
                        value: "Gerencia **certificados SSL/TLS** para a criptografia em trânsito. É grátis quando usado com serviços da AWS.",
                    },
                    {
                        type: "text",
                        value: "### Características\n- **Grátis** para certificados públicos usados em ALB, CloudFront e API Gateway.\n- **Renovação automática**, então o certificado não expira e não derruba a produção.\n- Suporta wildcard, como `*.exemplo.com`.\n- Tem integração de 1 clique.\n\n### Quando NÃO usar\n- Para um certificado **privado** (interno) de apps custom rodando em EC2. Nesse caso use o **AWS Private CA** (pago).\n- Para certificado de dispositivo IoT, que também usa o Private CA.\n\n## 7. CloudHSM - quando KMS não basta",
                    },
                    {
                        type: "quote",
                        value: "É um **Hardware Security Module dedicado** (físico e isolado) para casos de compliance que exigem a chave **fora de qualquer infraestrutura compartilhada**.",
                    },
                    {
                        type: "text",
                        value: "### Quando usar\n- Compliance **FIPS 140-2 Level 3**, que é mais restritiva do que o Level 2 do KMS.\n- Quando você quer **controle físico** total da chave, a ponto de nem a AWS conseguir tocar nela.\n- Casos extremos em bancos, defesa e healthcare.\n\n### Caro\n- Custa cerca de $1.45 por hora por HSM, algo perto de $1.000 por mês.\n- **A maioria dos casos NÃO precisa disso**, porque o KMS já resolve.\n\n## 8. Quando criptografar (cheat sheet de uso)",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Encryption?","Como"],["**EBS**","Sempre que possível","Toggle na criação, KMS"],["**S3**","Sempre","SSE-S3 ou SSE-KMS (default em buckets novos)"],["**RDS / Aurora**","Sempre na criação","Não pode adicionar depois - só por restore de snapshot encrypted"],["**DynamoDB**","Sim (default automático)","KMS managed ou CMK custom"],["**EFS / FSx**","Sim","KMS"],["**Lambda env vars**","Sim quando tem secret","KMS"],["**Secrets do app**","**Sempre**","Secrets Manager ou Parameter Store SecureString"],["**Tráfego HTTPS**","Sempre","ACM + ALB/CloudFront/API GW"]]',
                    },
                    {
                        type: "quote",
                        value: "**Pegadinha crítica:** a criptografia do RDS **não pode ser adicionada depois**. Ou você cria o banco já criptografado, ou faz um snapshot e restaura ele com encryption ligada.",
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"Onde ficam as chaves do KMS?"** → **Dentro do HSM gerenciado AWS** (FIPS 140-2 Level 2). Chave **nunca sai em texto claro**.\n2. **"AWS Managed Key vs Customer Managed Key (CMK)"** → Managed é AWS (grátis, sem audit/control fino); Customer é sua ($1/mês, audit completo, key policy).\n3. **"Rotação automática de chave KMS"** → Sim, anual, opcional, sem custo extra.\n4. **"Como criptografar S3 com chave que eu controle"** → **SSE-KMS** com Customer Managed Key.\n5. **"RDS já existente sem encryption, posso ligar?"** → **NÃO**. Snapshot → restore com encryption ON.\n6. **"Aplicação precisa de senha do RDS - como guardar?"** → **Secrets Manager** (rotação automática) ou Parameter Store SecureString.\n7. **"Secrets Manager vs Parameter Store"** → SM tem rotação automática + integração RDS; PS é grátis e simples.\n8. **"Certificado SSL/TLS pra meu ALB"** → **ACM** (grátis, auto-renew).\n9. **"Compliance exige chave que nem AWS toca"** → **CloudHSM** (raro).\n10. **"Envelope encryption - pra que serve?"** → Criptografar grandes volumes sem mandar tudo pro KMS (KMS só lida com a data key pequena).\n11. **"EBS encrypted gera snapshot encrypted?"** → **Sim, automático**.\n12. **"Posso restaurar snapshot encrypted como volume não-encrypted?"** → **Não** (uma vez encrypted, sempre encrypted).\n13. **"Default encryption no S3"** → Buckets novos já têm SSE-S3 ligado por padrão.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '2 tipos de criptografia:\n  At Rest      → dados gravados (EBS, S3, RDS, EFS) → KMS\n  In Transit   → dados em trânsito → TLS/SSL via ACM\n\nAWS KMS = Key Management Service\n  - Gerencia chaves criptográficas (CMKs)\n  - Chave NUNCA sai em texto claro\n  - Envelope encryption (data key + CMK)\n  - Integração com TUDO na AWS\n\nTipos de CMK:\n  AWS Managed (aws/s3, aws/ebs)  → grátis, AWS gerencia\n  Customer Managed (CMK)          → $1/mês, você controla audit/rotation/key policy\n  AWS Owned                       → grátis, invisível pra você\n\nS3 - 4 opções de encryption:\n  SSE-S3       → AWS gerencia chave (free, default)\n  SSE-KMS      → sua CMK no KMS (audit + control)\n  SSE-C        → cliente envia chave por request\n  Client-side  → cliente criptografa antes do upload\n\nSecrets Manager:\n  - Senhas, API keys, connection strings\n  - Rotação AUTOMÁTICA (RDS integração nativa)\n  - $0.40/mês por secret\n  - Cross-region nativo\n\nParameter Store (Systems Manager):\n  - Configs simples + secrets sem rotação\n  - GRÁTIS (Standard tier)\n  - SecureString criptografa com KMS\n\nACM (Certificate Manager):\n  - Cert SSL/TLS GRÁTIS pra ALB/CF/API GW\n  - Renovação automática\n  - Private CA (pago) pra cert interno\n\nCloudHSM:\n  - HSM dedicado (FIPS 140-2 Level 3)\n  - Caro (~$1000/mês)\n  - Só pra compliance EXTREMA\n\nQuando criptografar:\n  EBS / S3 / RDS / DynamoDB / EFS  → SEMPRE\n  RDS encryption depois da criação → NÃO PODE (snapshot/restore)\n  Lambda env vars com secret        → KMS encrypted\n  Tráfego HTTPS                     → ACM + ALB/CF\n\nAtalhos pra prova:\n  "gerenciar chaves criptográficas"   → KMS\n  "guardar senha do banco c/ rotação" → Secrets Manager\n  "config + secret grátis simples"    → Parameter Store\n  "certificado SSL pra ALB"           → ACM\n  "encryption RDS depois?"            → NÃO. Restaurar snapshot encrypted\n  "HSM físico isolado"                → CloudHSM (raro)\n  "chave que nem AWS toca"            → CloudHSM',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma equipe precisa criptografar dados em repouso (encryption at rest) em volumes EBS, bancos de dados RDS e sistemas de arquivos EFS. Qual serviço da AWS é responsável por criar, armazenar e rotacionar as chaves usadas nessa criptografia?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS KMS (Key Management Service)", isCorrect: true },
                            { text: "AWS Certificate Manager (ACM)", isCorrect: false },
                            { text: "Amazon CloudFront", isCorrect: false },
                            { text: "AWS IAM (Identity and Access Management)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um time quer criptografar objetos no Amazon S3 usando uma chave que ele mesmo controla, com key policy própria e trilha de auditoria (CloudTrail) de cada uso da chave. Qual opção de criptografia do S3 atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "SSE-KMS, com uma chave do KMS gerenciada pelo cliente",
                                isCorrect: true,
                            },
                            {
                                text: "SSE-S3, em que a AWS gerencia totalmente a chave",
                                isCorrect: false,
                            },
                            {
                                text: "SSE-C, em que o cliente envia a própria chave em cada requisição",
                                isCorrect: false,
                            },
                            {
                                text: "Client-side encryption, criptografando os objetos na aplicação antes do upload",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um banco de dados Amazon RDS já está em produção e foi criado sem criptografia em repouso. O time agora precisa que os dados fiquem criptografados. Qual é o procedimento correto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Criar um snapshot do banco, copiar o snapshot com a criptografia ativada e restaurar um novo banco a partir dele",
                                isCorrect: true,
                            },
                            {
                                text: "Ativar a criptografia na instância em execução por meio de um toggle no console do RDS",
                                isCorrect: false,
                            },
                            {
                                text: "Associar uma chave do KMS à instância existente usando uma policy do IAM",
                                isCorrect: false,
                            },
                            {
                                text: "Editar o parameter group do banco para habilitar AES-256",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação usa a senha de um banco de dados e precisa que essa credencial seja trocada automaticamente em intervalos regulares, com integração nativa ao RDS e sem alterar o código da aplicação. Qual serviço atende melhor a esse requisito?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Secrets Manager", isCorrect: true },
                            {
                                text: "Systems Manager Parameter Store no tier Standard",
                                isCorrect: false,
                            },
                            { text: "AWS KMS", isCorrect: false },
                            { text: "Amazon S3 com criptografia SSE-KMS", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Para habilitar criptografia em trânsito (TLS/SSL), uma empresa quer certificados públicos gratuitos, com renovação automática, para usar em um Application Load Balancer e no CloudFront. Qual serviço fornece esses certificados?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Certificate Manager (ACM)", isCorrect: true },
                            { text: "AWS KMS", isCorrect: false },
                            { text: "AWS CloudHSM", isCorrect: false },
                            { text: "AWS Secrets Manager", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Proteção contra Ataques - AWS Shield e WAF",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO **AWS Shield** protege contra **ataques DDoS** (nas camadas 3 e 4, quando o atacante inunda a rede com pacotes). O **AWS WAF** (Web Application Firewall, firewall de aplicação web) protege contra **ataques de aplicação** (na camada 7, como SQL injection, XSS e bots). Os dois trabalham juntos como **camadas de defesa** na borda da AWS, antes do tráfego chegar na sua VPC. O Shield Standard é **automático e grátis**; o WAF é pago, mas você configura com regras finas.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que são esses ataques\n\n### DDoS (Distributed Denial of Service)\nUm ataque DDoS é um ataque distribuído de negação de serviço.\n- Ele usa **várias máquinas** atacando ao mesmo tempo, formando uma botnet.\n- O objetivo é **derrubar** o serviço por sobrecarga.\n- Ele pode acontecer em camadas diferentes:\n  - Nas camadas **L3/L4** (rede e transporte): SYN flood, UDP flood, IP spoofing.\n  - Na camada **L7** (aplicação): HTTP flood, slowloris, request flood.\n\n### Ataques de aplicação (L7)\nEsses ataques miram falhas na própria aplicação:\n- **SQL Injection**: uma query maliciosa enviada por um campo de input.\n- **XSS** (Cross-Site Scripting): injeta um script que roda no navegador de outros usuários.\n- **Bots**: scraping, ataques de credenciais e fraude.\n- **Path traversal**: tentar acessar caminhos como `../../etc/passwd`.\n- **CSRF** (Cross-Site Request Forgery): uma requisição forjada feita em nome do usuário.\n\n## 2. AWS Shield - anti-DDoS",
                    },
                    {
                        type: "quote",
                        value: "Protege contra ataques **DDoS de rede e transporte** (L3/L4). Tem dois níveis (tiers).",
                    },
                    { type: "text", value: "### Shield Standard (grátis, automático)" },
                    {
                        type: "code",
                        value: "   Ativado AUTOMATICAMENTE em toda conta AWS\n   Sem custo adicional\n   Protege contra ataques DDoS COMUNS (L3/L4):\n       - SYN flood\n       - UDP reflection\n       - Outros volumetric attacks\n   Aplica em CloudFront, Route 53, ELB e tudo que rodar atrás deles",
                    },
                    { type: "text", value: "### Shield Advanced ($3000/mês)" },
                    {
                        type: "code",
                        value: "   Tudo do Standard +\n   Proteção contra ataques sofisticados (L7 incluso)\n   24/7 DDoS Response Team (DRT) da AWS\n   SLA financeiro - AWS REEMBOLSA custos de scaling causados por DDoS\n   Métricas avançadas + relatórios\n   WAF incluído (sem cobrança adicional dele)\n   Proteção em recursos elásticos (EC2, Global Accelerator, etc.)\n\n   Caso de uso: empresas com perfil ALTO de risco\n   (sites grandes, bancos, governo, eventos críticos)",
                    },
                    { type: "text", value: "## 3. AWS WAF - Web Application Firewall" },
                    {
                        type: "quote",
                        value: "É um **firewall na camada 7 (HTTP/HTTPS)** que filtra as requisições **antes** de elas chegarem na sua aplicação.",
                    },
                    {
                        type: "text",
                        value: "### Onde se aplica\n\nVocê anexa o WAF no ponto de entrada do tráfego. Ele filtra ali e só deixa passar o que for legítimo:",
                    },
                    {
                        type: "code",
                        value: "   Internet\n      │\n      ▼\n   ┌────────────────────────┐\n   │ CloudFront / ALB / API │  ← WAF se anexa aqui\n   │ Gateway                 │\n   └──────┬─────────────────┘\n          │ (já filtrado pelo WAF)\n          ▼\n   App / EC2 / Lambda",
                    },
                    {
                        type: "text",
                        value: "O WAF se integra com:\n- **CloudFront**\n- **ALB** (Application Load Balancer)\n- **API Gateway**\n- **App Runner**\n- **AppSync** (GraphQL)\n\n### Como funciona\n\nVocê define **regras** que decidem se a requisição é **ALLOW** (permite), **BLOCK** (bloqueia) ou **COUNT** (só registra no log):",
                    },
                    {
                        type: "code",
                        value: "Regra 1: BLOCK se URL contém /../  (path traversal)\nRegra 2: BLOCK se body contém 'UNION SELECT'  (SQL injection)\nRegra 3: BLOCK se IP em lista de proxies maliciosos\nRegra 4: COUNT requests de bots reconhecidos\nRegra 5: RATE-LIMIT > 1000 req/5 min de mesmo IP\nRegra 6: ALLOW resto",
                    },
                    { type: "text", value: "### Tipos de regras" },
                    {
                        type: "table",
                        value: '[["Tipo","O que faz","Exemplo"],["**Managed rules**","AWS ou parceiros (Imperva, F5, etc.) gerenciam","OWASP Top 10, bot control, IP reputation"],["**Custom rules**","Você cria","Bloquear país X, header Y"],["**Rate-based rules**","Limite por IP","\\"Mais de 1000 req/5 min do mesmo IP = block\\""],["**Geo Match**","Por país","Bloquear/permitir por geolocation"],["**IP Set**","Lista de IPs","Allow-list/Deny-list"],["**String/Regex Match**","Padrões em request","Detectar payloads suspeitos"]]',
                    },
                    {
                        type: "text",
                        value: "### Managed Rules importantes\n\nO OWASP (Open Web Application Security Project) mantém a lista dos ataques web mais comuns, e várias regras gerenciadas se baseiam nela:",
                    },
                    {
                        type: "table",
                        value: '[["Managed Rule Set","Protege contra"],["**AWS Managed - Core Rule Set (CRS)**","OWASP Top 10 (SQL inj, XSS, etc.)"],["**AWS Managed - Known Bad Inputs**","Vulnerabilidades conhecidas"],["**AWS Managed - SQL Database**","SQL injection específico"],["**AWS Managed - Linux/Windows/PHP/WordPress**","OS-específicas"],["**AWS Managed - Bot Control**","Bots maliciosos (scraping, scalping)"],["**AWS Managed - IP Reputation**","IPs maliciosos conhecidos"]]',
                    },
                    {
                        type: "text",
                        value: "### Pricing\n- $5 por mês por **Web ACL** (o conjunto de regras).\n- $1 por mês por **rule** dentro da ACL.\n- $0.60 por **milhão de requisições** processadas.\n- As managed rules têm um custo adicional.\n\n## 4. Shield vs WAF - diferença chave",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**Shield**","**WAF**"],["Camada OSI","**L3/L4** (rede/transporte)","**L7** (aplicação)"],["Ataques alvo","DDoS volumétrico","SQL injection, XSS, bots"],["Configuração","Automático (Standard)","Você define regras"],["Granularidade","Pacotes/conexões","Requests HTTP"],["Custo Standard","**Grátis**","Pago"],["Custo Advanced","$3000/mês","$5/mês + uso"],["Cobre","CloudFront, Route 53, ELB, etc.","CloudFront, ALB, API GW, AppSync, App Runner"]]',
                    },
                    {
                        type: "quote",
                        value: "**Eles se complementam:** o Shield para o tsunami de pacotes; o WAF para o ladrão tentando entrar pela porta da frente.",
                    },
                    { type: "text", value: "## 5. AWS Firewall Manager" },
                    {
                        type: "quote",
                        value: "Gerencia **WAF, Shield Advanced, Security Groups, Network Firewall e DNS Firewall** em **várias contas** (de uma AWS Organizations) de forma centralizada.",
                    },
                    {
                        type: "text",
                        value: "### Caso de uso\n- Uma empresa com **20 contas AWS** que quer aplicar **as mesmas regras de WAF** em todas.\n- Centralizar as políticas de segurança em um lugar só.\n- Compliance que exige uniformidade entre as contas.\n\n### Pré-requisito\n- Ter o **AWS Organizations** habilitado.\n\n## 6. Network Firewall e DNS Firewall (mention)",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Pra que serve"],["**AWS Network Firewall**","Firewall stateful na VPC, inspeção de pacotes profunda (similar Palo Alto), em larga escala"],["**Route 53 Resolver DNS Firewall**","Bloqueia queries DNS pra domínios maliciosos (impede malware \\"telefonar pra casa\\")"]]',
                    },
                    {
                        type: "text",
                        value: "Esses dois são mais do nível SAA (arquiteto), mas podem aparecer em pegadinhas do Cloud Practitioner.\n\n## 7. Defesa em profundidade (combinando tudo)\n\nA ideia é empilhar várias camadas de filtro. Se uma camada deixa algo passar, a próxima pega:",
                    },
                    {
                        type: "code",
                        value: "   Internet\n       │\n       ▼\n   ┌────────────────────────────────────┐\n   │ Shield (DDoS protection)            │ ← L3/L4\n   └────────┬───────────────────────────┘\n            ▼\n   ┌────────────────────────────────────┐\n   │ CloudFront / Route 53               │ ← edge, distribuído\n   └────────┬───────────────────────────┘\n            ▼\n   ┌────────────────────────────────────┐\n   │ WAF (SQL inj, XSS, bots)            │ ← L7\n   └────────┬───────────────────────────┘\n            ▼\n   ┌────────────────────────────────────┐\n   │ ALB (load balance + SSL term)       │\n   └────────┬───────────────────────────┘\n            ▼\n   ┌────────────────────────────────────┐\n   │ Security Group (porta + IP)         │ ← stateful, instance level\n   └────────┬───────────────────────────┘\n            ▼\n   ┌────────────────────────────────────┐\n   │ NACL (deny IP malicioso)            │ ← stateless, subnet level\n   └────────┬───────────────────────────┘\n            ▼\n   ┌────────────────────────────────────┐\n   │ Aplicação (input validation, etc.)  │ ← último nível\n   └────────────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: 'Cada camada filtra. Se uma falha, a próxima pega.\n\n## 8. Pegadinhas comuns da prova\n\n1. **"Anti-DDoS automático grátis"** → **Shield Standard** (já vem ativo).\n2. **"SQL injection / XSS / bots"** → **WAF** (não Shield).\n3. **"24/7 DDoS Response Team + SLA financeiro"** → **Shield Advanced**.\n4. **"Shield Advanced inclui WAF?"** → **Sim** (sem cobrança adicional).\n5. **"WAF protege em qual camada OSI?"** → **L7** (aplicação).\n6. **"Shield protege em qual camada?"** → **L3/L4** (rede/transporte).\n7. **"Bloquear IPs específicos por reputação"** → **WAF** (IP reputation managed rule).\n8. **"Bloquear país de origem específico"** → **WAF** (Geo Match) ou **CloudFront Geo Restriction**.\n9. **"Limitar 1000 req/min por IP"** → **WAF Rate-based rule**.\n10. **"OWASP Top 10 (SQL inj, XSS, etc.)"** → **WAF Managed Core Rule Set**.\n11. **"Aplicar políticas WAF em 30 contas"** → **AWS Firewall Manager**.\n12. **"WAF se anexa em quem?"** → CloudFront, ALB, API Gateway, App Runner, AppSync.\n13. **"Custo Shield Standard"** → **Grátis e automático**.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '2 camadas de defesa contra ataques:\n\nSHIELD = anti-DDoS (L3/L4)\n  Standard → AUTOMÁTICO + GRÁTIS em toda conta\n              SYN flood, UDP flood, volumetric\n              CloudFront, Route 53, ELB (cobertura automática)\n  Advanced → $3000/mês\n              DRT 24/7, SLA financeiro, métricas avançadas\n              Inclui WAF de graça\n\nWAF = anti-aplicação (L7)\n  Filtra HTTP/HTTPS requests com REGRAS\n  Anexa em: CloudFront, ALB, API GW, App Runner, AppSync\n\n  Tipos de regra:\n    Managed (AWS ou parceiros)  → OWASP, Bot Control, IP Reputation\n    Custom                       → suas regras\n    Rate-based                   → limit por IP\n    Geo Match                    → por país\n    IP Set                       → allow/deny list\n    String/Regex                  → padrões maliciosos\n\n  Ações: ALLOW, BLOCK, COUNT (só log)\n\nPricing WAF:\n  $5/Web ACL/mês + $1/regra/mês + $0.60/milhão requests\n  Managed rules têm custo adicional\n\nFirewall Manager:\n  Aplica WAF/Shield/SG em N contas (AWS Organizations)\n  Centraliza políticas de segurança\n\nDefesa em profundidade:\n  Shield → CloudFront → WAF → ALB → SG → NACL → App\n\nAtalhos pra prova:\n  "DDoS automático grátis"            → Shield Standard\n  "DDoS 24/7 com DRT e SLA"           → Shield Advanced\n  "SQL injection / XSS / bots"        → WAF\n  "limitar rate por IP"               → WAF Rate-based\n  "bloquear país"                     → WAF Geo Match (ou CF Geo Restriction)\n  "OWASP Top 10"                      → WAF Managed Core Rule Set\n  "aplicar políticas em N contas"     → Firewall Manager\n  "Shield Advanced inclui WAF?"       → SIM',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa quer proteção contra os ataques DDoS mais comuns nas camadas de rede e transporte (camadas 3 e 4), sem custo adicional e sem precisar configurar nada. Qual serviço já atende a esse requisito?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Shield Standard", isCorrect: true },
                            { text: "AWS Shield Advanced", isCorrect: false },
                            { text: "AWS WAF", isCorrect: false },
                            { text: "Amazon GuardDuty", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual serviço filtra requisições HTTP e HTTPS na camada 7 (aplicação) para bloquear ataques como SQL injection e cross-site scripting (XSS)?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS WAF", isCorrect: true },
                            { text: "AWS Shield", isCorrect: false },
                            { text: "Security Group", isCorrect: false },
                            { text: "Network ACL", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual recurso é oferecido pelo AWS Shield Advanced, mas não pelo Shield Standard?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Acesso 24/7 a uma equipe de resposta a DDoS e reembolso dos custos de escalonamento causados por um ataque",
                                isCorrect: true,
                            },
                            {
                                text: "Ativação automática e gratuita em todas as contas AWS",
                                isCorrect: false,
                            },
                            {
                                text: "Bloqueio de consultas DNS para domínios maliciosos",
                                isCorrect: false,
                            },
                            {
                                text: "Emissão e renovação automática de certificados TLS",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um site sofre com um mesmo endereço IP enviando milhares de requisições em poucos minutos. Qual tipo de regra do AWS WAF bloqueia esse excesso limitando a quantidade de requisições por IP em uma janela de tempo?",
                        difficulty: "medio",
                        options: [
                            { text: "Rate-based rule (regra baseada em taxa)", isCorrect: true },
                            { text: "Geo match rule (regra por geolocalização)", isCorrect: false },
                            { text: "Managed Core Rule Set (OWASP Top 10)", isCorrect: false },
                            { text: "IP set (lista fixa de IPs)", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma organização com 20 contas AWS no AWS Organizations precisa aplicar e manter centralizadamente as mesmas regras de WAF e proteções do Shield Advanced em todas as contas. Qual serviço deve ser usado?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Firewall Manager", isCorrect: true },
                            { text: "AWS WAF", isCorrect: false },
                            { text: "AWS Config", isCorrect: false },
                            { text: "AWS Security Hub", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Detecção de Ameaças - GuardDuty, Macie e Inspector",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA AWS tem **três serviços de detecção** que usam machine learning e inteligência artificial para encontrar problemas. O **GuardDuty** detecta **comportamento malicioso** (logins suspeitos, mineração de cripto, roubo de dados). O **Macie** descobre e protege **dados sensíveis** (informações pessoais, financeiras, de saúde) no S3. O **Inspector** escaneia **vulnerabilidades** em EC2, ECR e Lambda. Os três são **gerenciados, sob demanda e sem agente**: você liga e eles começam a detectar.",
                    },
                    {
                        type: "text",
                        value: "## 1. Mapa mental dos 3 serviços\n\nA escolha depende do tipo de ameaça que você quer pegar:",
                    },
                    {
                        type: "code",
                        value: '                  Que tipo de ameaça?\n                          │\n        ┌─────────────────┼────────────────────┐\n        ▼                 ▼                    ▼\n   Comportamento     Dados sensíveis      Vulnerabilidades\n   malicioso         expostos             em recursos\n        │                 │                    │\n        ▼                 ▼                    ▼\n   GuardDuty           Macie               Inspector\n   "alguém ESTÁ        "tem dado            "TEM\n   atacando agora"     sensível?"           vulnerabilidade?"',
                    },
                    { type: "text", value: "## 2. Amazon GuardDuty - detecta atividade maliciosa" },
                    {
                        type: "quote",
                        value: "Monitora **CloudTrail, VPC Flow Logs, DNS logs, EKS audit logs, S3 logs e RDS logs** usando machine learning para procurar padrões maliciosos. Ele acha o que **um firewall não enxerga**.",
                    },
                    {
                        type: "text",
                        value: "### Como funciona\n\nEle lê os logs que a própria AWS já gera, cruza com inteligência de ameaças e transforma o que for suspeito em findings (alertas):",
                    },
                    {
                        type: "code",
                        value: '   CloudTrail\n   VPC Flow Logs       ───▶ GuardDuty (ML + threat intel) ───▶ Findings\n   DNS Logs                                                       │\n   EKS Audit Logs                                                ▼\n   S3 access                                              "Suspeita detectada!"\n   RDS                                                    severidade alta/média/baixa',
                    },
                    { type: "text", value: "### Exemplos de findings" },
                    {
                        type: "table",
                        value: '[["Detecção","O que acontece"],["**CryptoCurrency:EC2/BitcoinTool.B**","EC2 está conectando a IPs de mineração de cripto"],["**UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**","Login bem-sucedido de IP suspeito"],["**Recon:EC2/PortProbeUnprotectedPort**","Alguém está escaneando portas da sua EC2"],["**Exfiltration:S3/AnomalousBehavior**","Volume anormal de download do S3"],["**Trojan:EC2/DnsDataExfiltration**","EC2 tunelando dado via DNS (técnica de exfil)"],["**Backdoor:EC2/C&CActivity.B**","EC2 falando com servidor de C&C de botnet"]]',
                    },
                    {
                        type: "text",
                        value: '### Características\n- Funciona **sem agentes**, porque lê os logs nativos da AWS.\n- Liga com **1 clique** e tem free trial de 30 dias.\n- Entrega os **findings no console e no EventBridge**, o que permite disparar uma Lambda para remediar.\n- Usa a **inteligência de ameaças da AWS** e de parceiros (Proofpoint, CrowdStrike).\n- Funciona em várias contas com o **Organizations**.\n\n### Pricing\n- Cobra por **GB de logs analisados** (eventos do CloudTrail, VPC Flow Logs, queries de DNS).\n- Tem **30 dias grátis** para avaliar.\n\n### Casos de uso\n- "Alguém comprometeu credenciais IAM e está usando?"\n- "Minha EC2 foi invadida e está minerando cripto?"\n- "Meus dados estão sendo roubados por meio de DNS?"\n\n## 3. Amazon Macie - descoberta de dados sensíveis no S3',
                    },
                    {
                        type: "quote",
                        value: "Usa machine learning e comparação de padrões para escanear buckets S3 procurando **PII, dados financeiros e de saúde** e coisas parecidas. Ele te avisa se um bucket ficou **exposto publicamente** ou se há **dado sensível** onde não deveria. PII quer dizer Personally Identifiable Information, ou seja, informação que identifica uma pessoa.",
                    },
                    { type: "text", value: "### O que ele identifica" },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplos"],["**PII** (Personally Identifiable Info)","Nome, CPF, endereço, telefone, email"],["**Financial**","Números de cartão de crédito (PCI), conta bancária"],["**Healthcare**","Identificadores médicos (HIPAA)"],["**Credentials**","API keys, AWS access keys, senhas"],["**Custom**","Você define padrões custom (regex)"]]',
                    },
                    {
                        type: "text",
                        value: '### Output\n\nO Macie gera dois tipos de resultado:\n- **Sensitive Data Findings**: mostram quais buckets ou objetos têm dado sensível.\n- **Policy Findings**: mostram buckets configurados de forma insegura, como públicos ou sem encryption.\n\n### Características\n- Funciona **só no S3** (escopo limitado).\n- Não usa **agentes**.\n- Funciona em várias contas com o **Organizations**.\n- **Cobra por GB escaneado**, mais o GB monitorado.\n\n### Casos de uso\n- "Tenho dado de cliente vazado em algum bucket?"\n- "Compliance de LGPD ou GDPR: preciso saber onde estão os dados pessoais."\n- "Detecção automática de dado sensível no data lake."\n\n## 4. Amazon Inspector - escaneamento de vulnerabilidades',
                    },
                    {
                        type: "quote",
                        value: "Escaneia **EC2, imagens de container (ECR) e funções Lambda** procurando **vulnerabilidades conhecidas** e configurações inseguras. ECR é o Elastic Container Registry, o repositório de imagens de container da AWS. CVE (Common Vulnerabilities and Exposures) é o catálogo público de vulnerabilidades conhecidas.",
                    },
                    { type: "text", value: "### O que escaneia" },
                    {
                        type: "table",
                        value: '[["Recurso","Como"],["**EC2 instances**","Vulnerabilidades do SO e pacotes instalados, sem agente (via SSM)"],["**Container images** (ECR)","Vulnerabilidades em layers da imagem"],["**Lambda functions**","Vulnerabilidades nas dependências do código"]]',
                    },
                    {
                        type: "text",
                        value: '### Findings comuns\n\n- "Sua EC2 tem versão vulnerável do OpenSSL (CVE-2024-XXXX)"\n- "Imagem Docker tem libgcrypt com vulnerabilidade crítica"\n- "Lambda usa dependência npm com CVE conhecida"\n- "Network reachability: porta 22 exposta ao mundo"\n\n### Características\n- Funciona **sem agente**, usando o SSM (Systems Manager) nas instâncias EC2.\n- É **contínuo**: escaneia automaticamente quando um recurso novo aparece.\n- Integra com o **EventBridge** para automação.\n- Funciona em várias contas com o **Organizations**.\n- Classifica por **severidade CVSS** (Common Vulnerability Scoring System, a nota padrão de gravidade de uma vulnerabilidade).\n\n### Casos de uso\n- Compliance que exige scan contínuo, como PCI-DSS e HIPAA.\n- "Quais EC2 têm vulnerabilidade crítica ainda não corrigida?"\n- "As imagens Docker do nosso ECR estão limpas?"\n\n## 5. Comparação direta - qual usar pra cada problema',
                    },
                    {
                        type: "table",
                        value: '[["Cenário","Resposta"],["**\\"Detectar EC2 minerando cripto\\"**","**GuardDuty**"],["**\\"Detectar PII em buckets S3\\"**","**Macie**"],["**\\"Detectar vulnerabilidade no SO da EC2\\"**","**Inspector**"],["**\\"Detectar login suspeito\\"**","**GuardDuty**"],["**\\"Detectar bucket S3 público com dado sensível\\"**","**Macie**"],["**\\"Detectar dependência npm com CVE\\"**","**Inspector** (Lambda)"],["**\\"Detectar exfiltração de dados via DNS\\"**","**GuardDuty**"],["**\\"Detectar IPs maliciosos batendo na conta\\"**","**GuardDuty**"],["**\\"Detectar imagem Docker com vulnerabilidade\\"**","**Inspector** (ECR)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Mnemônico:** **G**uardDuty pega **G**ente fazendo coisa errada (comportamento). **M**acie pega **M**aterial sensível em S3. **I**nspector pega **I**mperfeição (vulnerabilidade) em código/SO.",
                    },
                    {
                        type: "text",
                        value: "## 6. Como os 3 trabalham juntos\n\nNum incidente real, os três se somam e cada um cobre um ângulo:",
                    },
                    {
                        type: "code",
                        value: '   Cenário: alguém invadiu sua conta e está exfiltrando dados de S3\n\n   1. GuardDuty   → detecta login anômalo do IAM user comprometido\n                    ALERTA: "UnauthorizedAccess:IAMUser/ConsoleLoginSuccess"\n\n   2. GuardDuty   → detecta exfiltração no S3\n                    ALERTA: "Exfiltration:S3/AnomalousBehavior"\n\n   3. Macie       → confirma que o bucket exfiltrado TINHA PII\n                    ALERTA: "PII presente em bucket exfiltrado"\n\n   4. Inspector   → detecta que a EC2 do atacante tinha vulnerabilidade\n                    que foi usada como entry point\n                    ALERTA: "CVE crítica em pacote X"\n\n   → AWS Security Hub agrega tudo num único dashboard\n   → EventBridge dispara Lambda pra remediar (revogar creds, isolar bucket)',
                    },
                    { type: "text", value: "## 7. AWS Security Hub - agregador central" },
                    {
                        type: "quote",
                        value: "É um **dashboard único** que recebe os findings de **GuardDuty, Macie, Inspector, Firewall Manager, IAM Access Analyzer e parceiros de terceiros**.",
                    },
                    {
                        type: "text",
                        value: "### Características\n- Reúne tudo num **dashboard centralizado**.\n- Verifica compliance contra **AWS Foundational Security Best Practices**, **CIS Benchmarks** e **PCI-DSS**.\n- Integra com o **Organizations** para cobrir várias contas.\n- Padroniza os findings no formato ASFF (AWS Security Finding Format).\n\n### Quando usar\n- Empresa com **vários serviços de segurança** que precisa ver tudo em um lugar.\n- Quando você quer um **dashboard executivo** da postura de segurança.\n- Para centralizar a auditoria de compliance.\n\n## 8. AWS Detective (mention)",
                    },
                    {
                        type: "quote",
                        value: "Quando o GuardDuty acha alguma coisa, o **Detective ajuda a investigar**. Ele mostra graficamente o que aconteceu: qual usuário, qual EC2, qual rede e a linha do tempo.",
                    },
                    {
                        type: "text",
                        value: '- Coleta dados do **CloudTrail, VPC Flow Logs e findings do GuardDuty**.\n- Usa machine learning para inferir as relações entre os eventos.\n- Serve para **forense e investigação depois do incidente**.\n\n## 9. Pegadinhas comuns da prova\n\n1. **"Detectar atividade maliciosa (mineração, exfiltração, port scan)"** → **GuardDuty**.\n2. **"Detectar PII / dados sensíveis em S3"** → **Macie**.\n3. **"Escanear vulnerabilidades CVE em EC2"** → **Inspector**.\n4. **"Escanear vulnerabilidades em imagens Docker"** → **Inspector** (não Macie!).\n5. **"Macie escaneia DynamoDB?"** → **Não, só S3**.\n6. **"GuardDuty usa agente?"** → **Não** (lê logs nativos).\n7. **"Inspector usa agente?"** → **Não** (usa SSM em EC2).\n8. **"Macie identifica AWS credentials num código?"** → **Sim** (categoria credentials).\n9. **"Onde vejo TUDO de segurança consolidado?"** → **AWS Security Hub**.\n10. **"Investigar incident após GuardDuty alertar"** → **Amazon Detective**.\n11. **"Detecção de bot scrapeando meu site"** → **WAF** (não GuardDuty - WAF é em L7 da app).\n12. **"Detectar dependência npm vulnerável em Lambda"** → **Inspector**.\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '3 serviços de detecção:\n\nGuardDuty = detecta COMPORTAMENTO malicioso\n  Fontes: CloudTrail, VPC Flow Logs, DNS, EKS, S3, RDS\n  ML + threat intel\n  Findings: login suspeito, mineração cripto, exfiltração, port scan\n  Sem agente, multi-conta, $/GB de logs\n  Free trial 30 dias\n\nMacie = detecta DADOS SENSÍVEIS no S3\n  Escopo: SÓ S3\n  Categorias: PII, financial, healthcare, credentials\n  Sensitive Data Findings + Policy Findings (buckets inseguros)\n  $/GB escaneado\n\nInspector = detecta VULNERABILIDADES\n  Escopo: EC2 + ECR (containers) + Lambda\n  CVEs + configs inseguras\n  Sem agente (SSM em EC2)\n  Severidade CVSS\n\nQuando usar qual:\n  Comportamento malicioso  → GuardDuty\n  PII em S3               → Macie\n  CVE em SO/Docker/npm    → Inspector\n\nSecurity Hub = dashboard agregador\n  Coleta findings de GuardDuty + Macie + Inspector + Firewall Mgr +\n  Access Analyzer + parceiros\n  Compliance contra AWS Best Practices, CIS, PCI-DSS\n\nDetective = investigação pós-incidente\n  Visualiza graficamente o que GuardDuty achou\n  CloudTrail + VPC Flow Logs + GuardDuty → timeline forense\n\nMnemônico:\n  Guardduty → Gente fazendo coisa errada\n  Macie     → Material sensível em S3\n  Inspector → Imperfeição (vulnerabilidade)\n\nAtalhos pra prova:\n  "mineração cripto / port scan / exfiltração"  → GuardDuty\n  "PII em buckets S3"                            → Macie\n  "vulnerabilidade SO da EC2"                    → Inspector\n  "vulnerabilidade em Docker image"              → Inspector\n  "dependência npm com CVE em Lambda"            → Inspector\n  "Macie em DynamoDB?"                            → NÃO, só S3\n  "ver tudo num dashboard"                       → Security Hub\n  "investigar após findings"                      → Detective\n  "bot scrapeando site"                          → WAF (L7), não GuardDuty',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma equipe suspeita que uma instância EC2 foi comprometida e está sendo usada para mineração de criptomoedas, conectando-se a IPs maliciosos. Qual serviço da AWS detecta esse tipo de comportamento malicioso analisando logs como CloudTrail, VPC Flow Logs e DNS logs?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon GuardDuty", isCorrect: true },
                            { text: "Amazon Macie", isCorrect: false },
                            { text: "Amazon Inspector", isCorrect: false },
                            { text: "AWS Shield", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa descobrir automaticamente se há dados sensíveis, como PII e números de cartão de crédito, armazenados em seus buckets do Amazon S3. Qual serviço é indicado para essa tarefa?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon GuardDuty", isCorrect: false },
                            { text: "Amazon Macie", isCorrect: true },
                            { text: "AWS Config", isCorrect: false },
                            { text: "Amazon Inspector", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma organização quer escanear continuamente instâncias EC2, imagens de contêiner no Amazon ECR e funções Lambda em busca de vulnerabilidades conhecidas (CVEs). Qual serviço atende a esse objetivo?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon GuardDuty", isCorrect: false },
                            { text: "Amazon Macie", isCorrect: false },
                            { text: "Amazon Inspector", isCorrect: true },
                            { text: "Amazon Detective", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa usa GuardDuty, Macie e Inspector ao mesmo tempo e quer ver todas as descobertas de segurança consolidadas em um único painel, além de verificar a conformidade com padrões como CIS Benchmarks e PCI DSS. Qual serviço oferece essa visão centralizada?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon CloudWatch", isCorrect: false },
                            { text: "AWS Trusted Advisor", isCorrect: false },
                            { text: "Amazon Detective", isCorrect: false },
                            { text: "AWS Security Hub", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Depois que o GuardDuty gera um alerta, uma equipe de segurança precisa investigar o incidente a fundo, visualizando graficamente as relações entre usuários, instâncias e eventos ao longo do tempo para análise forense. Qual serviço é feito para essa investigação?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Security Hub", isCorrect: false },
                            { text: "Amazon Detective", isCorrect: true },
                            { text: "Amazon GuardDuty", isCorrect: false },
                            { text: "Amazon Inspector", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Auditoria e Compliance - CloudTrail, Trusted Advisor e Artifact",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA AWS oferece **três serviços-chave para auditoria e compliance**. O **CloudTrail** registra **toda chamada de API** (quem fez o quê e quando). O **Trusted Advisor** te dá **recomendações de boas práticas** automaticamente, olhando custo, segurança, performance, tolerância a falhas e limites. O **AWS Artifact** é o **repositório de certificações e relatórios de compliance** da AWS (SOC, ISO, PCI, HIPAA), que você baixa para usar nas suas próprias auditorias.",
                    },
                    { type: "text", value: '## 1. AWS CloudTrail - "caixa-preta" da conta' },
                    {
                        type: "quote",
                        value: "Registra **TODA chamada de API** feita na conta: quem chamou, quando, de onde, e se deu sucesso ou erro. Ele já vem **ligado por padrão em toda conta**.",
                    },
                    {
                        type: "text",
                        value: "### Como funciona\n\nQualquer ação na conta vira um evento registrado, seja pelo Console, pela CLI, pelo SDK ou por um serviço chamando outro:",
                    },
                    {
                        type: "code",
                        value: '   Qualquer ação na conta AWS\n       │\n       │ (Console, CLI, SDK, qualquer serviço chamando outro)\n       ▼\n   CloudTrail captura como "Event"\n       │\n       ▼\n   ┌─────────────────────────────────────┐\n   │ Event:                                │\n   │   timestamp                           │\n   │   user (qual IAM user ou role)        │\n   │   action (ec2:RunInstances, etc.)     │\n   │   source IP                           │\n   │   resources affected                  │\n   │   sucesso / erro                       │\n   └─────────────────────────────────────┘\n       │\n       ▼\n   Console (90 dias últimos) + Trail → S3 + opcional CloudWatch',
                    },
                    { type: "text", value: "### 3 tipos de eventos" },
                    {
                        type: "table",
                        value: '[["Tipo","O que captura","Default"],["**Management events**","Operações administrativas (criar EC2, modificar SG, etc.)","**Logado por padrão**, grátis (read+write separados)"],["**Data events**","Operações em recursos (S3 `GetObject`, Lambda `Invoke`)","**Não logado por padrão** - paga por evento"],["**Insights events**","Anomalias detectadas pelo ML do CloudTrail","Opcional, pago"]]',
                    },
                    {
                        type: "quote",
                        value: '**Pegadinha:** um "S3 PutObject" é um **data event** e não é logado por padrão. Para auditar um bucket sensível por completo, você precisa **ligar os data events**.',
                    },
                    {
                        type: "text",
                        value: '### Trail (configuração persistente)\n\n- Por padrão, os eventos ficam apenas **90 dias no console**.\n- Para **retenção longa**, auditoria e compliance, você cria um **Trail**, que entrega os eventos em um bucket **S3** (e, se quiser, no CloudWatch Logs).\n- Um **multi-region trail** captura todas as regiões num único bucket.\n- Um **organization trail** captura todas as contas da AWS Organizations.\n\n### Caso de uso clássico\n- **Forense**: "Quem apagou o bucket de produção ontem às 14h32?"\n- **Compliance**: o SOC2 exige o log de quem mexeu em recursos sensíveis.\n- **Detecção**: ele alimenta o GuardDuty e o Security Hub.\n- **Debug**: "Por que essa role conseguiu fazer X?"\n\n## 2. AWS Trusted Advisor - coach de boas práticas',
                    },
                    {
                        type: "quote",
                        value: "Analisa a sua conta e te dá **recomendações automáticas** em **5 categorias**.",
                    },
                    { type: "text", value: "### As 5 categorias" },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplos de checks"],["**Cost Optimization**","EC2 idle (parar?), EBS volumes não usados, RIs subutilizadas, S3 lifecycle não configurado"],["**Performance**","Throttling alta no DynamoDB, instâncias com alto utilization, CloudFront não usado"],["**Security**","Security Groups com porta 22 ou 3389 abertas pra mundo, MFA no root, IAM Access Keys antigas (>90 dias), buckets S3 públicos"],["**Fault Tolerance**","EC2 em apenas 1 AZ, RDS sem Multi-AZ, ELB sem HA, snapshots desatualizados"],["**Service Limits**","Está próximo de atingir limites (ex: 80% das EC2 permitidas na região)"]]',
                    },
                    { type: "text", value: "### Tiers" },
                    {
                        type: "table",
                        value: '[["Tier","Checks disponíveis"],["**Basic / Developer support**","**7 checks** core (Security e Service Limits) - grátis"],["**Business / Enterprise support**","**Todos os checks** (~115 atualmente) - sem custo extra além do plano"]]',
                    },
                    {
                        type: "quote",
                        value: "**Para valer o investimento no Trusted Advisor completo:** você precisa ter **Business Support** ou superior (a partir de $100 por mês).",
                    },
                    {
                        type: "text",
                        value: "### O que NÃO faz\n- Ele **não executa** as mudanças, só recomenda.\n- Ele **não substitui** uma auditoria profissional.\n- Ele pode passar despercebido, então você precisa **olhar com regularidade**.\n\n## 3. AWS Artifact - central de compliance da AWS",
                    },
                    {
                        type: "quote",
                        value: "É o portal onde a AWS publica os **relatórios de compliance** e os **acordos** que **você pode baixar** para usar nas suas próprias auditorias.",
                    },
                    {
                        type: "text",
                        value: "### Categorias\n\n#### Artifact Reports\nSão os relatórios da AWS sobre a **conformidade da infraestrutura**:\n- **SOC 1, 2, 3** (controles internos)\n- **ISO 27001, 27017, 27018, 9001**\n- **PCI-DSS** (cartão de crédito)\n- **HIPAA** (saúde nos EUA)\n- **FedRAMP** (governo EUA)\n- **GDPR** (Europa)\n- **LGPD** (Brasil)\n- Muitos outros (cerca de 80 frameworks)\n\n#### Artifact Agreements\nSão documentos jurídicos que você pode **assinar com a AWS**:\n- **BAA** (Business Associate Addendum), usado para HIPAA\n- **GDPR Data Processing Addendum**\n- Outros para compliance específica\n\n### Como usar",
                    },
                    {
                        type: "code",
                        value: "   Cenário: você precisa provar pro auditor PCI-DSS que sua infra é compliant.\n\n   1. Acessa AWS Artifact\n   2. Baixa o relatório PCI-DSS AOC da AWS\n   3. Entrega pro auditor - ele vê que infra AWS é certificada\n   4. Foca a auditoria no SEU lado (apps, dados, IAM, configs)",
                    },
                    {
                        type: "quote",
                        value: "**Conexão com a Responsabilidade Compartilhada:** o Artifact te dá a **prova de compliance DA infraestrutura**. Você ainda precisa provar a SUA parte (a segurança NA nuvem).",
                    },
                    {
                        type: "text",
                        value: "## 4. AWS Config - estado de configuração ao longo do tempo",
                    },
                    {
                        type: "quote",
                        value: "Acompanha **como cada recurso está configurado**, guarda o **histórico de mudanças** e checa **regras de compliance** automaticamente.",
                    },
                    {
                        type: "text",
                        value: '### Diferença de CloudTrail\n- O **CloudTrail** responde "**quem fez o quê e quando**" (os eventos).\n- O **Config** responde "**como o recurso está agora comparado a antes**" (as fotos da configuração).\n\n### Características\n- **Config Rules**: regras que avaliam compliance, por exemplo "todo bucket precisa ter encryption habilitada".\n- **AWS Managed Rules** (cerca de 200 já prontas), além de regras custom via Lambda.\n- **Auto-remediation** opcional, em que uma Lambda corrige o problema sozinha.\n- **Snapshot histórico**: "como esse Security Group estava em 15/06?"\n\n### Caso de uso\n- Compliance: "Todo bucket S3 deve ser privado" e o Config alerta se isso mudar.\n- Auditoria: "Esse Security Group foi modificado quando e por quem?"\n- Detecção de drift (quando a configuração sai do padrão definido).\n\n## 5. AWS Audit Manager - automatizar audit',
                    },
                    {
                        type: "quote",
                        value: "Coleta **evidências automaticamente** para você reportar aos auditores (HIPAA, PCI, SOC2, ISO).",
                    },
                    {
                        type: "text",
                        value: '### Características\n- Mapeia os recursos AWS contra os **frameworks de compliance**.\n- Coleta os logs e as configurações de forma automática.\n- Gera **relatórios prontos para o auditor**.\n- Reduz muito o trabalho manual de juntar evidências.\n\n### Caso de uso\n- "Auditoria anual de SOC2: preciso provar X, Y e Z de 30 controles." O Audit Manager pré-coleta tudo isso.\n\n## 6. AWS Abuse / Compliance reporting',
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Para que serve"],["**AWS Abuse Team**","Reportar abuse ORIGINANDO da AWS contra você ou outros (`abuse@amazonaws.com`)"],["**AWS Compliance Programs**","Lista pública de programas que a AWS atende (consulta antes de migrar workload sensível)"]]',
                    },
                    {
                        type: "text",
                        value: '## 7. Cenário completo de "tenho uma auditoria amanhã"\n\nNuma auditoria de verdade, você combina vários desses serviços. Um roteiro possível:',
                    },
                    {
                        type: "code",
                        value: "   1. Baixa relatórios da AWS no AWS Artifact\n      → SOC 2 / PCI / ISO da infra\n\n   2. Exporta logs do CloudTrail\n      → mostra quem fez o quê nos últimos N meses\n\n   3. Roda Trusted Advisor\n      → corrige issues de Security flagados (SG aberto, IAM creds antigas)\n\n   4. Config Reports\n      → mostra snapshot de configs e histórico de mudanças\n\n   5. Audit Manager\n      → reúne tudo num pacote pra apresentar\n\n   6. GuardDuty / Macie / Inspector findings\n      → prova que tem detecção ativa e nada crítico aberto\n\n   7. Security Hub\n      → dashboard executivo da postura de segurança",
                    },
                    {
                        type: "text",
                        value: '## 8. Pegadinhas comuns da prova\n\n1. **"Quem fez o quê quando na conta?"** → **CloudTrail**.\n2. **"Como recurso está configurado / histórico"** → **AWS Config**.\n3. **"Recomendações de boas práticas"** → **Trusted Advisor**.\n4. **"Baixar SOC 2 / PCI da AWS pra auditor"** → **AWS Artifact**.\n5. **"Automatizar coleta de evidências pra auditoria"** → **Audit Manager**.\n6. **"CloudTrail é regional ou global?"** → Eventos são por região; tem que criar Trail multi-region pra cobrir tudo.\n7. **"S3 PutObject aparece no CloudTrail por padrão?"** → **NÃO** - é data event, precisa habilitar.\n8. **"Retenção default do CloudTrail no console"** → **90 dias**. Pra mais, salvar em S3 via Trail.\n9. **"Trusted Advisor com todos os checks precisa de qual plano de suporte?"** → **Business** ou **Enterprise**.\n10. **"Trusted Advisor executa mudanças?"** → **Não**, só recomenda.\n11. **"Documento legal HIPAA com AWS"** → **BAA via AWS Artifact**.\n12. **"Quem detecta drift de configuração?"** → **AWS Config**.\n13. **"Diferença CloudTrail vs Config"** → CloudTrail = eventos de API; Config = snapshot/histórico de configs.\n14. **"Compliance Brasil - LGPD"** → AWS é compliant; relatórios em **AWS Artifact**.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '3 serviços-chave deste módulo:\n\nCloudTrail = "quem fez o quê quando" (eventos de API)\n  Default: 90 dias no console\n  Trail   → S3 + opcional CloudWatch (retenção longa)\n  3 tipos: Management (free), Data (pago), Insights (anomalias)\n  Multi-region / Organization trail = audit completo\n\nTrusted Advisor = recomendações automáticas\n  5 categorias:\n    Cost Optimization\n    Performance\n    Security\n    Fault Tolerance\n    Service Limits\n  Basic plan → 7 checks core\n  Business/Enterprise → ~115 checks completos\n\nAWS Artifact = relatórios de compliance da AWS\n  Reports: SOC, ISO, PCI, HIPAA, FedRAMP, GDPR, LGPD, etc.\n  Agreements: BAA (HIPAA), GDPR DPA, etc.\n\nComplementos importantes:\n\nAWS Config = "como está configurado / histórico"\n  Snapshots de configuração ao longo do tempo\n  Config Rules (compliance check + auto-remediate)\n  Diferente de CloudTrail (eventos vs estado)\n\nAudit Manager = automatizar coleta de evidências\n  Mapeia recursos contra frameworks (PCI, HIPAA, SOC2)\n  Gera pacote de auditoria\n\nCenário "auditoria amanhã":\n  Artifact → relatório da AWS\n  CloudTrail → log de quem fez o quê\n  Trusted Advisor → corrige Security flags\n  Config → snapshot de configs\n  Audit Manager → empacota tudo\n  GuardDuty/Macie/Inspector → detecção ativa\n  Security Hub → dashboard executivo\n\nAtalhos pra prova:\n  "quem fez o quê quando"          → CloudTrail\n  "como recurso está/estava"        → AWS Config\n  "recomendações de best practices" → Trusted Advisor\n  "baixar SOC2/PCI/HIPAA"           → AWS Artifact\n  "BAA HIPAA com AWS"               → Artifact Agreements\n  "automatizar evidências auditor"  → Audit Manager\n  "CloudTrail data events S3"       → NÃO logado por padrão\n  "Trusted Advisor completo"        → Business plan ou superior',
                    },
                ],
                questions: [
                    {
                        statement:
                            "A equipe de segurança precisa descobrir qual usuário IAM excluiu um bucket do Amazon S3 de produção, em que horário e a partir de qual endereço IP a ação partiu. Qual serviço da AWS registra essas chamadas de API e permite responder a essa investigação?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS CloudTrail", isCorrect: true },
                            { text: "Amazon CloudWatch", isCorrect: false },
                            { text: "AWS Trusted Advisor", isCorrect: false },
                            { text: "AWS Config", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa habilitou o AWS CloudTrail e vê as operações administrativas nos logs, mas as leituras e gravações de objetos em um bucket S3 sensível, como GetObject e PutObject, não estão sendo registradas. O que explica esse comportamento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "São data events (eventos de dados), que não são registrados por padrão e precisam ser habilitados no trail.",
                                isCorrect: true,
                            },
                            {
                                text: "O CloudTrail registra apenas ações feitas pelo Console de Gerenciamento e ignora chamadas de API de leitura e gravação de objetos.",
                                isCorrect: false,
                            },
                            {
                                text: "O trail precisa ser multi-região para que qualquer operação em objetos do S3 seja capturada.",
                                isCorrect: false,
                            },
                            {
                                text: "O CloudTrail não é capaz de registrar nenhuma ação relacionada ao Amazon S3.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa quer acessar o conjunto completo de verificações do AWS Trusted Advisor, cobrindo todas as cinco categorias (otimização de custos, desempenho, segurança, tolerância a falhas e limites de serviço). Qual requisito precisa ser atendido?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ter um plano de suporte Business ou Enterprise.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar o plano de suporte Basic, que já libera todas as verificações gratuitamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar o AWS Config em todas as regiões da conta.",
                                isCorrect: false,
                            },
                            { text: "Assinar um contrato BAA no AWS Artifact.", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um auditor externo solicita os relatórios SOC 2 e PCI DSS que comprovam a conformidade da infraestrutura da AWS. De onde o cliente baixa esses relatórios oficiais por conta própria, sem abrir chamado?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Artifact", isCorrect: true },
                            { text: "AWS Audit Manager", isCorrect: false },
                            { text: "AWS Trusted Advisor", isCorrect: false },
                            { text: "Amazon Inspector", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe de compliance precisa saber como um determinado grupo de segurança estava configurado há duas semanas e receber alertas sempre que um recurso sair da configuração aprovada (drift). Qual serviço mantém o histórico de configuração dos recursos e avalia a conformidade de forma contínua?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Config", isCorrect: true },
                            { text: "AWS CloudTrail", isCorrect: false },
                            { text: "AWS Trusted Advisor", isCorrect: false },
                            { text: "AWS Artifact", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 8 - Monitoramento",
        aulas: [
            {
                titulo: "Amazon CloudWatch - Métricas, Logs, Alarmes, Dashboards",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO CloudWatch é a plataforma de **observabilidade** da AWS, ou seja, a ferramenta que deixa você enxergar o que está acontecendo dentro dos seus sistemas. Ele coleta **métricas** (uso de CPU, isto é, o processador, além de memória, latência e taxa de erro) de **todos os serviços AWS** automaticamente, guarda **logs** de aplicações, dispara **alarmes** quando algum valor passa de um limite (**threshold**) e ainda te dá **dashboards** customizáveis para visualizar tudo. **Se algo na AWS está rodando, o CloudWatch sabe**.",
                    },
                    {
                        type: "text",
                        value: "## 1. Os 4 pilares do CloudWatch\n\nO CloudWatch se apoia em quatro pilares. O diagrama abaixo mostra como eles se conectam e para onde os dados fluem:",
                    },
                    {
                        type: "code",
                        value: "   ┌─────────────────────────────────────────────────────────┐\n   │                    Amazon CloudWatch                      │\n   │                                                            │\n   │  ┌──────────┐  ┌──────┐  ┌────────┐  ┌─────────────┐    │\n   │  │ Metrics  │  │ Logs │  │Alarmes │  │ Dashboards  │    │\n   │  └──────────┘  └──────┘  └────────┘  └─────────────┘    │\n   │       │            │          │            │              │\n   │       └────────────┴──────────┴────────────┘              │\n   │                       │                                    │\n   │              ┌────────┴────────┐                          │\n   │              ▼                 ▼                          │\n   │         Events/EventBridge   ServiceLens / X-Ray          │\n   └─────────────────────────────────────────────────────────┘",
                    },
                    { type: "text", value: "O que cada pilar faz:" },
                    {
                        type: "table",
                        value: '[["Pilar","O que faz"],["**Metrics**","Dados numéricos ao longo do tempo (CPU, RAM, latência, etc.)"],["**Logs**","Strings de texto - logs de apps, sistemas, serviços"],["**Alarms**","Disparam quando métrica passa de threshold"],["**Dashboards**","Visualização customizada de métricas e logs"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. CloudWatch Metrics\n\n### Métricas automáticas (predefinidas)\n\nA AWS publica **métricas automaticamente** para **todos os serviços**. Você não precisa configurar nada para começar a ver esses números:",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Métricas típicas"],["**EC2**","CPUUtilization, NetworkIn, NetworkOut, DiskReadOps, StatusCheck"],["**RDS**","CPUUtilization, DatabaseConnections, FreeStorageSpace, ReadLatency"],["**Lambda**","Invocations, Errors, Duration, Throttles, ConcurrentExecutions"],["**ELB**","RequestCount, TargetResponseTime, HTTPCode_Target_5XX_Count"],["**S3**","BucketSizeBytes, NumberOfObjects, AllRequests"],["**DynamoDB**","ConsumedReadCapacityUnits, ConsumedWriteCapacityUnits, ThrottledRequests"]]',
                    },
                    {
                        type: "quote",
                        value: "**De quanto em quanto tempo os dados chegam (granularidade):** as métricas básicas são publicadas a cada **5 minutos**. Se você quiser granularidade de **1 minuto** (o chamado **detailed monitoring**, ou monitoramento detalhado), paga a mais por isso.",
                    },
                    {
                        type: "text",
                        value: "### Métricas customizadas\n\nVocê também pode publicar **suas próprias métricas** usando a API (Application Programming Interface, a interface de programação) do CloudWatch:",
                    },
                    {
                        type: "code",
                        value: "import boto3\ncw = boto3.client('cloudwatch')\ncw.put_metric_data(\n    Namespace='MinhaApp',\n    MetricData=[{\n        'MetricName': 'PedidosCriados',\n        'Value': 1,\n        'Unit': 'Count'\n    }]\n)",
                    },
                    {
                        type: "text",
                        value: "Onde isso é útil: acompanhar **KPIs de negócio** (Key Performance Indicators, os indicadores de desempenho do negócio, como pedidos por minuto, usuários ativos e taxa de conversão) e qualquer métrica específica da sua aplicação.\n\n### Métricas que NÃO vêm automaticamente\n\nTem um ponto que cai bastante na prova. A **EC2** (as instâncias, ou seja, as máquinas virtuais da AWS) **não publica memória nem o disco usado por dentro** do sistema operacional, porque de fora a AWS não consegue enxergar isso. Para coletar esses dados, você precisa instalar o **CloudWatch Agent**, um agente que roda dentro da própria instância:",
                    },
                    {
                        type: "code",
                        value: "sudo yum install amazon-cloudwatch-agent\nsudo amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:config.json",
                    },
                    {
                        type: "text",
                        value: "Com o agente rodando, passam a chegar RAM (memória), espaço em disco, processos em execução e por aí vai.\n\n## 3. CloudWatch Logs\n\n### Estrutura hierárquica\n\nOs logs no CloudWatch ficam organizados em três níveis, um dentro do outro:",
                    },
                    {
                        type: "code",
                        value: "   Log Group               (ex: /aws/lambda/minha-funcao)\n       │\n       ├── Log Stream  ← cada instância/container/Lambda execution\n       │     │\n       │     ├── Log Event 1  (timestamp + mensagem)\n       │     ├── Log Event 2\n       │     └── ...\n       │\n       └── Log Stream\n             └── ...",
                    },
                    {
                        type: "text",
                        value: "Lendo de cima para baixo: o **Log Group** é o agrupador (por exemplo, todos os logs de uma mesma função Lambda ficam juntos ali). Dentro dele, cada **Log Stream** é a sequência de logs de uma origem específica, como uma instância, um container ou uma execução de Lambda. E cada **Log Event** é uma linha de log individual, com o seu horário (timestamp) e a mensagem.\n\n### Como logs chegam",
                    },
                    {
                        type: "table",
                        value: '[["Origem","Como"],["**Lambda**","Automático (cada invocation)"],["**API Gateway**","Configura no stage"],["**CloudTrail**","Configura Trail → CloudWatch Logs"],["**VPC Flow Logs**","Configura na VPC/subnet"],["**EC2**","**CloudWatch Agent** (instalar)"],["**ECS / Fargate**","Configura `awslogs` driver no task definition"],["**App custom**","SDK `put_log_events` ou stdout via agent"]]',
                    },
                    {
                        type: "text",
                        value: "### Retenção e custo\n\n- Por padrão, a retenção é **indefinida**: o log fica guardado até você apagar, então cuidado com o custo.\n- Dá para configurar o prazo: 1 dia, 1 semana, 1 mês e assim por diante, até **10 anos**.\n- A cobrança tem duas partes: por **GB ingerido** (o quanto de log entrou) mais **GB armazenado** (o quanto fica guardado).",
                    },
                    {
                        type: "quote",
                        value: "**Boa prática:** sempre defina pelo menos um prazo de retenção. Log grande sem retenção configurada vira conta cara rapidinho.",
                    },
                    {
                        type: "text",
                        value: "### CloudWatch Logs Insights\n\nPermite fazer consultas parecidas com SQL (a linguagem usada para consultar bancos de dados) diretamente nos logs. É bem poderoso:",
                    },
                    {
                        type: "code",
                        value: "fields @timestamp, @message\n| filter @message like /ERROR/\n| stats count() as errors by bin(5m)\n| sort errors desc\n| limit 20",
                    },
                    {
                        type: "text",
                        value: "Onde usar: investigar incidentes, contar erros, agregar latência e montar dashboards a partir dos logs.\n\n## 4. CloudWatch Alarms",
                    },
                    {
                        type: "quote",
                        value: "Dispara **ações automáticas** quando uma métrica passa de um limite (**threshold**) que você definiu.",
                    },
                    { type: "text", value: "### Estados de um alarme" },
                    {
                        type: "code",
                        value: "   OK                → métrica está dentro do threshold\n   ALARM             → métrica passou do threshold\n   INSUFFICIENT_DATA → ainda não tem dados pra avaliar",
                    },
                    { type: "text", value: "### Exemplo de alarme" },
                    {
                        type: "code",
                        value: "Métrica: CPUUtilization da instância EC2 i-abc123\nThreshold: > 80%\nPeríodo: 5 minutos\nAvaliação: 3 períodos consecutivos\nAção se ALARM: enviar SNS pra time DevOps\nAção se OK: nenhuma",
                    },
                    { type: "text", value: "### Tipos de ação que alarme pode disparar" },
                    {
                        type: "table",
                        value: '[["Ação","Caso de uso"],["**SNS**","Notificar (email, SMS, Lambda)"],["**Auto Scaling**","Scale out/in baseado em métrica"],["**EC2**","Stop/terminate/reboot/recover instância"],["**Systems Manager**","Criar OpsItem pra investigação"],["**EventBridge**","Triggerar workflow custom"]]',
                    },
                    {
                        type: "quote",
                        value: "**Combo clássico:** Alarme CPU > 70% → SNS (Simple Notification Service, o serviço de notificações da AWS) → Lambda → escala a aplicação horizontalmente.",
                    },
                    {
                        type: "text",
                        value: "### Alarmes compostos\n\nOs alarmes compostos combinam **vários alarmes** usando lógica E/OU (AND/OR). Servem para reduzir falsos positivos, ou seja, evitar que você receba alerta à toa.\n\n## 5. CloudWatch Dashboards",
                    },
                    {
                        type: "quote",
                        value: "Página web customizável com **gráficos de métricas, logs e alarmes**.",
                    },
                    {
                        type: "text",
                        value: "### Características\n- Você monta a tela com **widgets** (blocos visuais): gráfico de linha, número, medidor (gauge), texto, consulta de log e status de alarme.\n- Dá para compartilhar entre equipes, de forma pública ou controlando o acesso via **IAM** (Identity and Access Management, o serviço de permissões da AWS).\n- Um único dashboard consegue juntar métricas de **várias regiões**.\n- A API permite criar dashboards por código, seguindo a ideia de **IaC** (Infrastructure as Code, ou infraestrutura como código).\n\n### Caso de uso clássico",
                    },
                    {
                        type: "code",
                        value: '   Dashboard "Produção":\n   ┌─────────────────────────────────────────────┐\n   │  Total de requests/min (line)                │\n   │  Latência média (number)                     │\n   │  Taxa de erro 5xx (line)                     │\n   │  CPU média do ASG (gauge)                    │\n   │  Logs últimas 1h com "ERROR" (log query)     │\n   │  Status de alarmes (alarm widget)             │\n   └─────────────────────────────────────────────┘',
                    },
                    { type: "text", value: "## 6. CloudWatch Events / Amazon EventBridge" },
                    {
                        type: "quote",
                        value: "É o sistema de **eventos da AWS**. Acontecimentos dentro dos serviços (um evento de auto scaling, uma mudança de estado de uma EC2, um upload em um bucket S3) podem **disparar** (triggerar) ações como executar uma Lambda, publicar em SNS, enfileirar em SQS (Simple Queue Service, o serviço de filas) ou iniciar um fluxo no Step Functions.",
                    },
                    {
                        type: "text",
                        value: "**CloudWatch Events** é o nome antigo. O serviço foi rebatizado como **Amazon EventBridge** e ganhou mais recursos.\n\n### Padrões clássicos",
                    },
                    {
                        type: "table",
                        value: '[["Evento","Ação"],["EC2 chega em `running`","Lambda registra IP em registry"],["Falha de Lambda (Errors > 0)","SNS notifica + cria OpsItem"],["Upload em S3 bucket","Lambda processa imagem"],["**Agendamento (cron)**","Lambda roda toda noite às 3h"],["RDS Multi-AZ failover","Lambda atualiza app config"]]',
                    },
                    {
                        type: "quote",
                        value: '**EventBridge Scheduler** é o "cron na nuvem". Ele substitui o `cron` (o agendador de tarefas que roda em um servidor) para rodar tarefas em horários marcados.',
                    },
                    {
                        type: "text",
                        value: "## 7. ServiceLens, Contributor Insights, Synthetics, RUM\n\nO CloudWatch ainda traz recursos mais avançados de observabilidade:",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","O que faz"],["**ServiceLens**","Combina métricas + logs + X-Ray traces num único view por serviço"],["**Contributor Insights**","Analisa logs pra achar \\"top talkers\\" (IPs que mais batem, usuários que mais usam)"],["**Synthetics**","\\"Canaries\\" - scripts que **simulam usuário** (HTTP, navegação) e alertam se app cair"],["**RUM** (Real User Monitoring)","Coleta métricas de **performance real de usuários** no browser/mobile"]]',
                    },
                    { type: "text", value: "## 8. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança aproximada"],["**Métricas customizadas**","$0.30 por métrica/mês (primeiras 10k)"],["**Metric APIs**","$0.01 / 1.000 requests"],["**Logs ingest**","$0.50 / GB"],["**Logs storage**","$0.03 / GB-mês"],["**Logs Insights queries**","$0.005 / GB scanned"],["**Alarmes**","$0.10/mês cada (Standard); $0.30/mês (High Resolution)"],["**Dashboard**","3 grátis; $3/mês adicionais"],["**Synthetics canary**","$0.0012 por run"],["**RUM**","$1.00 / 100k events"]]',
                    },
                    {
                        type: "quote",
                        value: "O **free tier** (a camada gratuita) permanente é generoso para começar. Mas atenção: logs sem retenção configurada viram conta cara.",
                    },
                    { type: "text", value: "## 9. CloudWatch vs CloudTrail (cai na prova)" },
                    {
                        type: "table",
                        value: '[["Critério","**CloudWatch**","**CloudTrail**"],["Foco","**Performance / saúde** dos serviços","**Atividade administrativa / API**"],["Pergunta que responde","\\"Quanto CPU?\\" \\"Quantos erros?\\"","\\"Quem fez o quê quando?\\""],["Tipo de dado","**Métricas + logs**","**Eventos de API**"],["Default","Métricas core ligadas","Trail de Management Events grátis"],["Caso de uso","Operações, troubleshooting, scaling","Audit, compliance, forensics"]]',
                    },
                    {
                        type: "quote",
                        value: "**Use os dois juntos.** O CloudWatch detecta o problema; o CloudTrail mostra quem causou.",
                    },
                    {
                        type: "text",
                        value: '## 10. Pegadinhas comuns da prova\n\n1. **"Como monitoro CPU e disco da EC2?"** → CloudWatch já tem **CPU**, **disco precisa de CloudWatch Agent**.\n2. **"Como monitoro memória da EC2?"** → **CloudWatch Agent** (não vem por default).\n3. **"Como alertar quando CPU passa de 80%?"** → **CloudWatch Alarm** → SNS.\n4. **"Onde ficam logs do Lambda?"** → **CloudWatch Logs** automaticamente.\n5. **"Logs do Apache custom da minha EC2"** → **CloudWatch Agent** lendo arquivo.\n6. **"Query SQL-like em logs"** → **CloudWatch Logs Insights**.\n7. **"Cron de Lambda toda noite às 3h"** → **EventBridge Scheduler** (substitui CloudWatch Events).\n8. **"Métrica customizada (KPI de negócio)"** → `cloudwatch.put_metric_data`.\n9. **"Granularidade default das métricas EC2"** → **5 min** (Basic). 1 min com Detailed Monitoring (pago).\n10. **"Como simular usuário visitando o site"** → **CloudWatch Synthetics canary**.\n11. **"Performance real de usuário no browser"** → **CloudWatch RUM**.\n12. **"CloudWatch vs CloudTrail"** → CloudWatch = saúde/performance; CloudTrail = auditoria/API calls.\n13. **"Retenção default dos logs"** → **Indefinida** - configure pra evitar custo!\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'CloudWatch = observabilidade AWS\n  4 pilares: Metrics / Logs / Alarms / Dashboards\n\nMetrics:\n  Predefinidas: automáticas por serviço (5 min basic)\n  Customizadas: put_metric_data ($0.30/métrica/mês)\n  Detailed Monitoring: 1 min (pago)\n  EC2 NÃO publica memória/disco por default → CloudWatch Agent\n\nLogs:\n  Log Group → Log Stream → Log Event\n  Origens: Lambda (auto), API GW, CloudTrail, VPC Flow, EC2 (Agent), ECS\n  Retenção default: INDEFINIDA (cuidado!) - configure 1d-10y\n  Logs Insights: query SQL-like\n\nAlarms:\n  Estados: OK / ALARM / INSUFFICIENT_DATA\n  Ações: SNS, Auto Scaling, EC2 actions, EventBridge\n  Compostos com AND/OR\n\nDashboards:\n  Customizáveis, widgets variados\n  3 grátis, $3/mês adicionais\n\nEventBridge (antigo CloudWatch Events):\n  Eventos AWS → triggerar Lambda/SNS/SQS/Step Functions\n  EventBridge Scheduler = cron na nuvem\n\nRecursos avançados:\n  ServiceLens             → métricas + logs + X-Ray por serviço\n  Contributor Insights    → top talkers em logs\n  Synthetics              → canaries (simulam usuário)\n  RUM                     → performance real do usuário\n\nCloudWatch vs CloudTrail:\n  CloudWatch  → saúde, performance, "quanto", "quantos erros"\n  CloudTrail  → auditoria, API calls, "quem fez o quê quando"\n\nAtalhos pra prova:\n  "métricas e alarmes"                   → CloudWatch\n  "CPU/disco EC2 sem instalar nada"      → CPU sim, disco/memória precisam Agent\n  "logs do Lambda"                       → CloudWatch Logs (auto)\n  "alertar quando CPU > X"               → CloudWatch Alarm → SNS\n  "cron na nuvem"                        → EventBridge Scheduler\n  "simular usuário (canary)"             → Synthetics\n  "performance real do usuário"          → RUM\n  "query SQL em logs"                    → Logs Insights\n  "quem apagou o bucket"                 → CloudTrail (NÃO CloudWatch!)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Por padrão, as métricas básicas de uma instância EC2 no CloudWatch são publicadas a cada 5 minutos. Para receber essas métricas com granularidade de 1 minuto, o que deve ser feito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ativar o detailed monitoring (monitoramento detalhado), que gera custo adicional.",
                                isCorrect: true,
                            },
                            {
                                text: "Instalar o CloudWatch Agent, que passa a publicar as métricas a cada 1 minuto sem custo.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar um alarme com período de 1 minuto para forçar a coleta mais frequente.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar o CloudWatch Logs Insights na instância.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa monitorar o uso de memória RAM e o espaço em disco por dentro do sistema operacional de instâncias EC2. Por que esses dados não aparecem automaticamente nas métricas do CloudWatch?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A AWS não enxerga memória e disco por dentro da instância, então é preciso instalar o CloudWatch Agent para coletar essas métricas.",
                                isCorrect: true,
                            },
                            {
                                text: "Basta ativar o detailed monitoring, que inclui memória e disco na coleta padrão.",
                                isCorrect: false,
                            },
                            {
                                text: "Essas métricas só são publicadas para instâncias que rodam Amazon Linux 2.",
                                isCorrect: false,
                            },
                            {
                                text: "É preciso habilitar o VPC Flow Logs na subnet da instância.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um alarme do CloudWatch entrou no estado ALARM porque o CPUUtilization passou do threshold definido. Qual serviço costuma ser usado como ação do alarme para notificar a equipe por email ou SMS?",
                        difficulty: "facil",
                        options: [
                            { text: "Amazon SNS (Simple Notification Service).", isCorrect: true },
                            { text: "Amazon S3 (Simple Storage Service).", isCorrect: false },
                            { text: "Amazon RDS (Relational Database Service).", isCorrect: false },
                            { text: "AWS CloudTrail.", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação está correta sobre a retenção de logs no CloudWatch Logs?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Por padrão os logs nunca expiram (retenção indefinida), e dá para configurar um prazo de retenção de até 10 anos.",
                                isCorrect: true,
                            },
                            {
                                text: "Por padrão os logs são apagados após 30 dias, e esse prazo é fixo.",
                                isCorrect: false,
                            },
                            {
                                text: "A retenção máxima permitida pelo serviço é de 90 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "Os logs ficam guardados por 1 ano e o armazenamento não é cobrado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica é verdadeira sobre os dashboards do CloudWatch?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um único dashboard consegue reunir métricas de várias regiões da AWS.",
                                isCorrect: true,
                            },
                            {
                                text: "Um dashboard exibe métricas de apenas uma região e não permite combinar regiões.",
                                isCorrect: false,
                            },
                            {
                                text: "Dashboards mostram somente métricas, sem suporte a widgets de logs ou de status de alarmes.",
                                isCorrect: false,
                            },
                            {
                                text: "Dashboards só podem ser montados manualmente no console, sem criação via API.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS X-Ray - Distributed Tracing",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nO X-Ray faz **distributed tracing** (rastreamento distribuído): ele acompanha uma **única requisição** enquanto ela atravessa **vários serviços** (Lambda → API GW → DynamoDB → SNS → SQS → Lambda → RDS) e mostra **onde está o gargalo** ou o erro. Em arquitetura de **microsserviços**, onde uma chamada do usuário passa por 10 serviços, o X-Ray é **essencial** para entender o que está lento ou falhando.",
                    },
                    {
                        type: "text",
                        value: "## 1. O problema que X-Ray resolve\n\n### Microsserviços = pesadelo de debugging",
                    },
                    {
                        type: "code",
                        value: '   Usuário ──▶ API Gateway ──▶ Lambda A (auth)\n                   │              │\n                   │              ▼\n                   │           DynamoDB (sessão)\n                   │\n                   └──▶ Lambda B (validate)\n                          │\n                          ├──▶ SNS ──▶ SQS ──▶ Lambda C\n                          │\n                          └──▶ RDS (insert)\n\n   "A request demorou 5 segundos. Onde foi o gargalo?"',
                    },
                    {
                        type: "text",
                        value: "**Sem X-Ray**, você precisa abrir os logs de cada serviço separadamente, tentar casar os horários (timestamps) na mão e acaba se perdendo.\n\n**Com X-Ray**, você vê tudo em um **único trace** (o rastro da requisição inteira):\n- API Gateway: 50 ms\n- Lambda A: 200 ms (DynamoDB: 50ms, processing: 150 ms)\n- Lambda B: 4.5s ← gargalo! (RDS query: 4.3s)\n- SNS publish: 30 ms\n\nAssim você identifica o problema em **2 segundos**.\n\n## 2. Como funciona\n\nPor baixo, o fluxo é este. A sua aplicação usa o X-Ray SDK (Software Development Kit, o kit de bibliotecas do X-Ray) e ele cuida da maior parte do trabalho:",
                    },
                    {
                        type: "code",
                        value: '   1. Sua app/Lambda usa X-Ray SDK (Java, Node, Python, .NET, Go, Ruby)\n\n   2. SDK gera "segments" automaticamente:\n      - Tempo de início e fim\n      - Sucesso/erro\n      - Metadados (URL, query, etc.)\n\n   3. SDK manda segments pro X-Ray Daemon (em EC2/ECS) ou direto (Lambda)\n\n   4. X-Ray reúne segments do mesmo trace_id (transação completa)\n\n   5. Visualiza no console:\n      - Service Map (gráfico de serviços conectados)\n      - Trace timeline (gantt chart por segment)\n      - Annotations (metadados pra filtrar)',
                    },
                    {
                        type: "text",
                        value: "### Tracing context\n\nO **trace_id** (o identificador do rastro) é propagado de um serviço para o outro através de um **header HTTP** (`X-Amzn-Trace-Id`). Cada serviço **adiciona o seu segment** ao mesmo trace, então tudo fica costurado na mesma transação.",
                    },
                    {
                        type: "code",
                        value: "Cliente ──▶ API GW\n              │ X-Amzn-Trace-Id: 1-abc...\n              ▼\n            Lambda A\n              │ X-Amzn-Trace-Id: 1-abc... (mesmo!)\n              ▼\n            DynamoDB (subsegment automático via SDK)",
                    },
                    {
                        type: "text",
                        value: "## 3. Service Map\n\nO Service Map é a visualização gráfica de **quem chama quem**:",
                    },
                    {
                        type: "code",
                        value: "   ┌──────────┐     ┌──────────┐     ┌──────────┐\n   │ API GW   │────▶│ Lambda A │────▶│ DynamoDB │\n   │ (200ms)  │     │ (300ms)  │     │ (50ms)   │\n   └──────────┘     └──────────┘     └──────────┘\n                          │\n                          ▼\n                    ┌──────────┐     ┌──────────┐\n                    │ Lambda B │────▶│   RDS    │\n                    │ (4500ms!)│     │ (4300ms!)│\n                    └──────────┘     └──────────┘\n                          │\n                          ▼\n                    ┌──────────┐\n                    │   SNS    │\n                    └──────────┘\n\n   vermelho = erros\n   amarelo = throttling\n   verde = saudável",
                    },
                    {
                        type: "text",
                        value: "Ele mostra o **desempenho e a saúde agregados** por serviço. Você clica em um nó para ver os traces individuais daquele ponto.\n\n## 4. Integrações nativas",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Integração X-Ray"],["**Lambda**","Toggle \\"Active tracing\\" - sem código adicional"],["**API Gateway**","Toggle no stage"],["**ECS / Fargate**","X-Ray daemon como sidecar container"],["**EC2**","Instalar X-Ray daemon como serviço"],["**Elastic Beanstalk**","Toggle"],["**SDK calls**","Instrumentação automática de boto3, axios, requests, etc."]]',
                    },
                    {
                        type: "quote",
                        value: "**Lambda + X-Ray** é o combo mais simples: você só liga o toggle e já começa a ver os traces.",
                    },
                    {
                        type: "text",
                        value: "## 5. Sampling\n\nRastrear **toda** requisição sairia caro e geraria muito ruído. Por isso o X-Ray usa **sampling** (amostragem, ou seja, ele guarda só uma parte das requisições):",
                    },
                    {
                        type: "code",
                        value: "   Padrão: 1 request/segundo + 5% das demais\n\n   Pode customizar por:\n     - URL path\n     - HTTP method\n     - Service name\n     - Random rate",
                    },
                    {
                        type: "text",
                        value: "Para uma investigação focada (depurar um problema em produção), você aumenta o sampling temporariamente. Para uma aplicação estável, um sampling baixo economiza.\n\n## 6. Insights\n\nO X-Ray **detecta anomalias automaticamente**:\n\n- Aumento súbito de latência em um serviço\n- Aumento de taxa de erro\n- Mudança de padrão de tráfego\n\nEle gera esses **insights** sozinho, sem você precisar configurar threshold na mão.\n\n## 7. Casos de uso clássicos\n\n- **Depurar latência alta** em uma arquitetura serverless complexa.\n- **Detectar erro intermitente** em microsserviços.\n- Fazer **performance profiling** (análise de desempenho) do fluxo completo.\n- **Validar a arquitetura**, vendo na prática quem fala com quem.\n- Acompanhar **SLO/SLI** (Service Level Objective e Service Level Indicator, as metas e os indicadores de nível de serviço, como a latência p99, o percentil 99, e a taxa de erro).\n- Fazer **auditoria das chamadas** entre serviços.\n\n## 8. CloudWatch ServiceLens (combinação)",
                    },
                    {
                        type: "quote",
                        value: "O ServiceLens **combina CloudWatch + X-Ray + Synthetics** em um único dashboard por serviço.",
                    },
                    {
                        type: "text",
                        value: "Em uma tela só, você vê:\n- Métricas do serviço (CPU, latência, erro)\n- Traces relacionados (X-Ray)\n- Logs filtrados (CloudWatch Logs)\n- Health check (Synthetics)",
                    },
                    {
                        type: "quote",
                        value: 'É o "**single pane of glass**" (o painel único) da observabilidade na AWS, com tudo em um lugar só.',
                    },
                    { type: "text", value: "## 9. Pricing" },
                    {
                        type: "table",
                        value: '[["Componente","Cobrança"],["**Traces recorded**","$5 / milhão (primeiros 100k grátis/mês)"],["**Traces retrieved/scanned**","$0.50 / milhão"]]',
                    },
                    {
                        type: "text",
                        value: "Para a maioria das aplicações, o custo é **baixo** (com um sampling bem ajustado).\n\n## 10. X-Ray vs CloudWatch Logs",
                    },
                    {
                        type: "table",
                        value: '[["Critério","**X-Ray**","**CloudWatch Logs**"],["Foco","**Distributed tracing** (uma request)","**Logs textuais** (eventos)"],["Pergunta que responde","\\"Onde a request demorou?\\"","\\"Que erro app gerou?\\""],["Visualização","Service map + timeline","Texto + Insights queries"],["Granularidade","Por **request**","Por **evento de log**"],["Caso de uso","Performance, latência cross-service","Debug, audit, troubleshooting de mensagem específica"]]',
                    },
                    {
                        type: "quote",
                        value: '**Use os dois juntos.** O trace mostra "o gargalo foi no serviço X". Os logs mostram "exatamente qual erro aconteceu lá".',
                    },
                    {
                        type: "text",
                        value: '## 11. Pegadinhas comuns da prova\n\n1. **"Rastrear request atravessando vários serviços"** → **X-Ray**.\n2. **"Service Map"** → recurso do **X-Ray**.\n3. **"Métricas e alarmes de saúde"** → **CloudWatch** (não X-Ray).\n4. **"Logs textuais de aplicação"** → **CloudWatch Logs**.\n5. **"Onde a requisição demora?"** → **X-Ray**.\n6. **"X-Ray funciona com Lambda sem código adicional?"** → **Sim** (toggle Active tracing).\n7. **"Quem chama quem na arquitetura?"** → **X-Ray Service Map**.\n8. **"Reduzir custo de tracing em produção"** → **Sampling**.\n9. **"X-Ray identifica anomalias?"** → **Sim** (Insights).\n10. **"Dashboard unificado de tracing + métricas + logs"** → **CloudWatch ServiceLens**.\n\n## 12. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'X-Ray = distributed tracing\n        rastreia 1 request atravessando N serviços\n        mostra gargalo, erro, dependências\n\nComo funciona:\n  SDK gera "segments" (start, end, status, metadata)\n  Trace_id propaga via X-Amzn-Trace-Id header\n  X-Ray reúne segments do mesmo trace\n  Visualiza: Service Map + Trace Timeline\n\nIntegrações nativas (1 toggle):\n  Lambda\n  API Gateway\n  ECS / Fargate\n  Elastic Beanstalk\n  SDK calls (auto-instrumentado)\n\nRecursos:\n  Service Map     → grafo visual de quem chama quem\n  Trace Timeline  → gantt chart por segment\n  Sampling        → reduz custo, controla volume\n  Insights        → detecção automática de anomalias\n\nX-Ray vs CloudWatch:\n  X-Ray         → tracing por request, "onde demorou"\n  CloudWatch    → métricas e logs, "quanto está usando"\n  Logs (CW)     → texto, "qual erro"\n\nServiceLens = CloudWatch + X-Ray + Synthetics combinados\n\nPricing: $5/milhão de traces (100k grátis/mês)\n\nAtalhos pra prova:\n  "rastrear request entre serviços"     → X-Ray\n  "Service Map"                          → X-Ray\n  "onde está o gargalo"                  → X-Ray\n  "microsserviços lentos"                → X-Ray\n  "quem chama quem"                      → X-Ray Service Map\n  "Lambda tracing sem código"            → X-Ray Active tracing toggle\n  "métricas e alarmes"                   → CloudWatch (não X-Ray)\n  "logs textuais"                        → CloudWatch Logs (não X-Ray)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa executa microsserviços na AWS. Uma única requisição do usuário passa por API Gateway, várias funções Lambda, DynamoDB e RDS, e às vezes leva 5 segundos para responder. A equipe precisa seguir essa requisição de ponta a ponta e descobrir em qual serviço está o gargalo. Qual serviço da AWS atende a essa necessidade?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS X-Ray", isCorrect: true },
                            { text: "Amazon CloudWatch Logs", isCorrect: false },
                            { text: "AWS CloudTrail", isCorrect: false },
                            { text: "AWS Config", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual recurso do AWS X-Ray exibe um diagrama visual de quais serviços chamam quais outros, com o desempenho e a saúde agregados de cada nó indicados por cores como verde, amarelo e vermelho?",
                        difficulty: "facil",
                        options: [
                            { text: "Service Map", isCorrect: true },
                            { text: "Trace Timeline", isCorrect: false },
                            { text: "Amazon CloudWatch Dashboard", isCorrect: false },
                            { text: "VPC Flow Logs", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação de alto tráfego usa o X-Ray, mas registrar todas as requisições geraria custo alto e muito ruído. Qual recurso do X-Ray registra apenas uma parcela das requisições para controlar volume e custo?",
                        difficulty: "medio",
                        options: [
                            { text: "Sampling", isCorrect: true },
                            { text: "Insights", isCorrect: false },
                            { text: "Annotations", isCorrect: false },
                            { text: "Service Map", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer habilitar o rastreamento do X-Ray em uma função AWS Lambda com o menor esforço possível. Qual é a forma correta de fazer isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ativar a opção Active tracing na função, sem necessidade de código adicional",
                                isCorrect: true,
                            },
                            {
                                text: "Instalar e executar o X-Ray daemon manualmente dentro do pacote de implantação da função",
                                isCorrect: false,
                            },
                            {
                                text: "Criar um alarme no Amazon CloudWatch apontando para a função",
                                isCorrect: false,
                            },
                            {
                                text: "Ativar o AWS CloudTrail para registrar as invocações da função",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa coletar métricas de saúde, como uso de CPU e latência, e disparar alarmes quando um limite for ultrapassado. Esse tipo de métrica e alarme é responsabilidade de qual serviço?",
                        difficulty: "medio",
                        options: [
                            { text: "Amazon CloudWatch", isCorrect: true },
                            { text: "AWS X-Ray", isCorrect: false },
                            { text: "AWS X-Ray Service Map", isCorrect: false },
                            { text: "AWS X-Ray Insights", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS Health Dashboard - Saúde dos serviços AWS",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nO Health Dashboard te mostra **a saúde dos serviços AWS**, tanto de forma **global** ("o S3 está com problema em us-east-1?") quanto **específica da SUA conta** ("uma EC2 sua precisa de reboot", "uma manutenção programada vai te afetar"). São 2 views: **Service Health** (público, mundial) e **Account Health / Personal** (eventos da sua conta). Saber distinguir as duas é a pegadinha clássica.',
                    },
                    { type: "text", value: "## 1. As 2 views (importante distinguir!)" },
                    {
                        type: "code",
                        value: '                  AWS Health Dashboard\n                          │\n        ┌─────────────────┼──────────────────┐\n        ▼                                    ▼\n   ┌──────────────────────┐         ┌────────────────────────┐\n   │ Service Health        │         │ Account Health         │\n   │ (público)             │         │ (Personal)             │\n   │                       │         │                         │\n   │ "S3 está em down?"    │         │ "MINHA conta tem        │\n   │ "todas as regiões"    │         │  problema/manutenção?" │\n   │                       │         │                         │\n   │ Público, sem login    │         │ Privado, sua conta      │\n   └──────────────────────┘         └────────────────────────┘',
                    },
                    { type: "text", value: "## 2. Service Health Dashboard (público)" },
                    {
                        type: "quote",
                        value: "Mostra o status **geral dos serviços AWS**. Qualquer pessoa pode acessar, **sem login**.",
                    },
                    {
                        type: "text",
                        value: '### O que mostra\n- A lista de **todos os serviços AWS** com o status atual (verde, amarelo ou vermelho).\n- O **histórico** de incidentes.\n- **Atualizações em tempo real** durante um incidente (uma linha do tempo).\n- Um **RSS feed** por serviço e região (um formato de assinatura que outras ferramentas leem automaticamente).\n\n### URL\n`https://health.aws.amazon.com/health/status`\n\n### Casos de uso\n- Responder "o problema é MEU ou da AWS?".\n- Verificar antes de abrir um ticket no support.\n- Avisar a equipe sobre um incidente que vem de cima (upstream).',
                    },
                    {
                        type: "quote",
                        value: "**Crítica comum:** a AWS demora para atualizar o status público durante incidentes grandes, porque não quer causar pânico. Para detectar antes, use **monitoring próprio** (CloudWatch + Synthetics).",
                    },
                    {
                        type: "text",
                        value: "## 3. AWS Health Dashboard - Your account (Personal Health)",
                    },
                    {
                        type: "quote",
                        value: "Mostra os eventos **específicos da SUA conta**. **Exige login**.",
                    },
                    { type: "text", value: "### O que mostra" },
                    {
                        type: "table",
                        value: '[["Tipo de evento","Exemplo"],["**Issues**","\\"Sua EC2 i-abc123 está unhealthy, precisa reboot\\""],["**Scheduled changes**","\\"Manutenção EBS vai afetar volume vol-xyz em 15/06\\""],["**Account notifications**","\\"Service quota atingida na sua região\\""],["**Operational notifications**","\\"Novo recurso disponível na sua região\\""]]',
                    },
                    {
                        type: "text",
                        value: "### URL\n`https://health.aws.amazon.com/health/home` (precisa login)\n\n### Características\n- É **personalizado** para cada conta.\n- Mostra **só os eventos que afetam VOCÊ**.\n- Integra com **EventBridge**, então dá para automatizar a reação a esses eventos de health.\n- Tem visão multi-conta com o **Organization view**.\n\n## 4. AWS Health API + EventBridge\n\nVocê pode **automatizar reações** aos eventos de health:",
                    },
                    {
                        type: "code",
                        value: '   Event: "EC2 vai ser deprecated"\n        │\n        ▼\n   EventBridge regra\n        │\n        ▼\n   Lambda → cria ticket no Jira\n            envia email pro time\n            atualiza CMDB',
                    },
                    {
                        type: "text",
                        value: "No exemplo acima, o CMDB (Configuration Management Database) é o banco onde a empresa cataloga os seus recursos de TI. Como alternativa, você pode **monitorar de forma contínua** via API.\n\n### Caso de uso\n- Empresa com 50 contas AWS que quer **centralizar** os alertas de manutenção.\n- **Abrir tickets internos automaticamente** quando algo precisa de atenção.\n- Compliance (provar que você foi notificado sobre uma vulnerabilidade).\n\n## 5. Integração com CloudWatch (mention)\n\nEventos do **AWS Health** também podem servir de **fonte para o CloudWatch Events / EventBridge**, combinando saúde com automação.",
                    },
                    {
                        type: "code",
                        value: "   AWS Health Event ──▶ EventBridge ──▶ Lambda ──▶ ação\n   (instância precisa reboot)            ▲\n                                          │ (cron de monitoring)\n   CloudWatch Alarm ──▶ EventBridge ──┘\n   (CPU > 80%)",
                    },
                    {
                        type: "text",
                        value: "Tudo passa pelo mesmo barramento (bus) de eventos, o que padroniza a arquitetura.\n\n## 6. Plano de Suporte e Health Dashboard",
                    },
                    {
                        type: "table",
                        value: '[["Plano de Suporte","Acesso ao Health Dashboard"],["**Basic / Developer**","Acesso completo ao Health Dashboard"],["**Business / Enterprise**","+ **AWS Health API** + **Organizational view** (multi-conta)"]]',
                    },
                    {
                        type: "quote",
                        value: "A **API e a visão multi-conta** exigem o plano Business ou superior.",
                    },
                    {
                        type: "text",
                        value: '## 7. Pegadinhas comuns da prova\n\n1. **"Status público dos serviços AWS"** → **Service Health Dashboard** (sem login).\n2. **"Eventos específicos da minha conta"** → **Personal Health / Account Health** (requer login).\n3. **"Notificação de manutenção em recurso meu"** → **Personal Health Dashboard**.\n4. **"Saber se incidente é meu ou da AWS"** → começa pelo **Service Health Dashboard**.\n5. **"Automatizar reação a evento de health"** → **AWS Health API + EventBridge**.\n6. **"View consolidado de várias contas"** → **Organizational view** (Business+ plan).\n7. **"Health Dashboard substitui CloudWatch?"** → **Não** - Health é sobre saúde **da AWS**; CloudWatch é sobre saúde **da sua app**.\n8. **"Health Dashboard vs Trusted Advisor"** → Health = eventos/incidentes; Trusted Advisor = recomendações.\n\n## 8. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'AWS Health Dashboard:\n  2 views diferentes\n\nService Health (público):\n  https://health.aws.amazon.com/health/status\n  Status MUNDIAL dos serviços (sem login)\n  Histórico de incidentes\n  RSS feed por serviço/região\n  "S3 está em down agora?"\n\nAccount Health / Personal (sua conta, login):\n  Eventos que afetam SUA conta\n  Tipos: Issues, Scheduled Changes, Account Notifications\n  Exemplos:\n    "Sua EC2 i-abc precisa reboot"\n    "Manutenção EBS vai afetar volume X"\n    "Service quota atingida"\n\nIntegração:\n  AWS Health API + EventBridge → automatizar reação\n  Lambda processa eventos → ticket, email, ação\n\nPlano de Suporte:\n  Basic/Developer → Health Dashboard básico\n  Business+        → API + Organizational view (multi-conta)\n\nComparação com outros serviços:\n  CloudWatch         → saúde DA SUA APP (métricas, logs)\n  CloudTrail         → quem fez o quê (audit)\n  Trusted Advisor    → recomendações de best practice\n  Health Dashboard   → saúde DOS SERVIÇOS AWS (e eventos da sua conta)\n\nAtalhos pra prova:\n  "S3 está em down?"                     → Service Health Dashboard (público)\n  "manutenção que afeta meu RDS"          → Personal Health Dashboard\n  "minha EC2 precisa reboot urgente"     → Personal Health Dashboard\n  "automatizar resposta a evento"         → Health API + EventBridge\n  "multi-conta view"                      → Business plan + Org view',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um cliente desconfia que o Amazon S3 está com problema na região us-east-1 e quer confirmar o status geral do serviço na AWS antes de abrir um chamado no suporte. Qual recurso mostra essa informação publicamente, sem precisar de login?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "AWS Health Dashboard - Service health (Service Health Dashboard)",
                                isCorrect: true,
                            },
                            {
                                text: "AWS Health Dashboard - Your account (Personal Health Dashboard)",
                                isCorrect: false,
                            },
                            { text: "Amazon CloudWatch", isCorrect: false },
                            { text: "AWS Trusted Advisor", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A AWS agendou uma manutenção que vai reiniciar uma instância EC2 específica da sua conta. Onde você acompanha os eventos e as mudanças programadas que afetam apenas os seus recursos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "No AWS Health Dashboard - Service health, que é aberto ao público",
                                isCorrect: false,
                            },
                            {
                                text: "No AWS Health Dashboard - Your account (Personal Health Dashboard), acessando com login",
                                isCorrect: true,
                            },
                            {
                                text: "No AWS CloudTrail, consultando a trilha de eventos de API da conta",
                                isCorrect: false,
                            },
                            {
                                text: "No feed RSS público de status dos serviços da AWS",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa quer abrir um ticket interno automaticamente toda vez que a AWS publicar um evento do AWS Health que afete a conta, como o aviso de que um tipo de instância será descontinuado. Qual combinação atende a esse caso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Eventos do AWS Health Dashboard entregues ao Amazon EventBridge, disparando uma função Lambda",
                                isCorrect: true,
                            },
                            {
                                text: "AWS Trusted Advisor integrado ao Amazon SNS",
                                isCorrect: false,
                            },
                            {
                                text: "Service Health Dashboard com assinatura de e-mail",
                                isCorrect: false,
                            },
                            { text: "AWS CloudTrail integrado ao AWS Config", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma organização com 50 contas AWS quer usar a AWS Health API e ver os eventos de todas as contas em um painel consolidado (Organizational view). Qual é o plano de suporte mínimo exigido para isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Basic", isCorrect: false },
                            { text: "Developer", isCorrect: false },
                            { text: "Business", isCorrect: true },
                            {
                                text: "Nenhum plano é necessário, pois a API e a visão multiconta são liberadas para todas as contas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação distingue corretamente o AWS Health Dashboard de outras ferramentas da AWS?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele informa a saúde dos serviços da AWS e os eventos da sua conta, enquanto o Amazon CloudWatch monitora métricas e logs da sua aplicação",
                                isCorrect: true,
                            },
                            {
                                text: "Ele substitui o Amazon CloudWatch para acompanhar CPU e latência da sua aplicação",
                                isCorrect: false,
                            },
                            {
                                text: "Ele gera recomendações de otimização de custo e segurança, funcionando como o AWS Trusted Advisor",
                                isCorrect: false,
                            },
                            {
                                text: "Ele registra qual usuário executou cada ação na conta, funcionando como o AWS CloudTrail",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 9 - Migração e Inovação",
        aulas: [
            {
                titulo: "Estratégias de Migração - Os 6 Rs",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nQuando uma empresa decide migrar para a AWS (Amazon Web Services), ela **não migra tudo do mesmo jeito**. Os **6 Rs** são as seis estratégias possíveis para cada aplicação. **Rehost** é o lift-and-shift (mover como está), o mais rápido. **Replatform** é o lift-tinker-and-shift, com ajustes pequenos. **Refactor** é reescrever a aplicação, mais caro, mas com o máximo de benefício. **Repurchase** é trocar a aplicação por um SaaS (software pronto que se contrata pela internet). **Retain** é não migrar e deixar no on-prem (a infraestrutura local da própria empresa). **Retire** é desligar de vez. Escolher o R certo para cada workload é **a decisão estratégica central** de uma migração.",
                    },
                    {
                        type: "text",
                        value: "## 1. Por que existem 6 estratégias\n\nImagine uma empresa com 200 aplicações para migrar. Não dá para tratar todas do mesmo jeito, porque cada aplicação é diferente em vários pontos.",
                    },
                    {
                        type: "code",
                        value: '   Não dá pra migrar 200 apps "do mesmo jeito".\n   Cada aplicação tem:\n     - Valor de negócio diferente (crítica? legada?)\n     - Stack diferente (Java legacy? Node modern? Mainframe?)\n     - Time disponível diferente (urgente? sem time?)\n     - Investimento permitido diferente (mínimo? máximo?)\n     - Vida útil esperada (3 anos? 30 anos?)\n\n   → Estratégia diferente pra cada caso',
                    },
                    {
                        type: "text",
                        value: "O framework nasceu na Gartner (uma empresa de pesquisa e consultoria em tecnologia), que definiu as **5 Rs** originais. A AWS acrescentou a sexta estratégia, o **Refactor**, e popularizou o modelo que usamos hoje.\n\n## 2. Os 6 Rs (ordem crescente de complexidade)\n\n### 1. Retire - descomissionar",
                    },
                    { type: "quote", value: '"Esse app **não serve mais**, vamos desligar."' },
                    {
                        type: "text",
                        value: "Aqui a aplicação simplesmente sai do ar. Os pontos principais são estes:\n\n- **Custo**: zero, porque você libera os recursos que a aplicação usava.\n- **Esforço**: baixo. Basta comunicar as pessoas envolvidas e desligar.\n- **Quando usar**: quando o audit (o levantamento das aplicações feito antes de migrar) mostra que aquele app não é mais usado, está obsoleto ou já foi substituído por outro.",
                    },
                    {
                        type: "quote",
                        value: "**Surpresa comum:** auditorias de migração revelam que **10-20%** dos apps podem ser simplesmente **retired**. É economia imediata.",
                    },
                    { type: "text", value: "### 2. Retain - manter on-prem" },
                    { type: "quote", value: '"Esse app **fica onde está**. Por enquanto."' },
                    {
                        type: "text",
                        value: "On-prem é a abreviação de on-premises. Significa que a aplicação continua rodando na infraestrutura local da própria empresa, no data center dela.\n\n- **Custo AWS**: zero, já que nada é migrado.\n- **Quando usar**:\n  - Um app **legacy** (um sistema antigo) que ninguém quer arriscar mexer.\n  - Uma aplicação com **dependência on-prem**, como um hardware especial ou uma integração com um sistema físico que só existe ali.\n  - Regras de **compliance** (as normas que a empresa precisa seguir) que proíbem usar nuvem.\n  - Casos em que a empresa está esperando trocar o hardware local antes de mover a aplicação.",
                    },
                    {
                        type: "quote",
                        value: "**Não é fracasso.** É uma decisão consciente de **não migrar** naquele momento.",
                    },
                    { type: "text", value: "### 3. Rehost - lift-and-shift" },
                    { type: "quote", value: '"**Move como está**, sem mudar nada na app."' },
                    {
                        type: "text",
                        value: 'Lift-and-shift significa "levantar e mover": você pega a aplicação do jeito que ela é e coloca na nuvem sem alterar o código.\n\n- **Custo**: baixo.\n- **Esforço**: baixo, na ordem de semanas.\n- **Benefício**: você **escapa do data center on-prem** rapidamente, mas não ganha os recursos (features) da nuvem, porque a aplicação continua igual.\n- **Ferramentas AWS**:\n  - **AWS Application Migration Service (MGN)**: faz a replicação contínua dos dados e depois o cutover, que é o momento em que você vira a chave e passa a rodar na AWS.\n  - **AWS Server Migration Service**, uma ferramenta mais antiga (legado).',
                    },
                    {
                        type: "code",
                        value: "   On-prem VM (Linux, app Java legacy)\n        │\n        │ MGN replica continuamente\n        ▼\n   EC2 na AWS (mesma VM, mesmo SO, mesmo app)\n   Cutover quando estiver pronto → quase zero downtime",
                    },
                    {
                        type: "quote",
                        value: "**Caso típico:** a empresa precisa **sair do data center com urgência**, por exemplo por causa de um contrato vencendo ou do fechamento do DC (data center). A saída é fazer o lift-and-shift agora e otimizar depois.",
                    },
                    { type: "text", value: "### 4. Replatform - lift, tinker, and shift" },
                    {
                        type: "quote",
                        value: '"Move e faz **pequenos ajustes** pra usar serviços gerenciados."',
                    },
                    {
                        type: "text",
                        value: 'Lift-tinker-and-shift quer dizer "levantar, mexer um pouco e mover". Você move a aplicação e faz alguns ajustes para aproveitar **serviços gerenciados**, que são serviços em que a própria AWS cuida da operação (backup, atualização, escala) no seu lugar.\n\n- **Custo**: médio.\n- **Esforço**: médio, de semanas a meses.\n- **Benefício**: você ganha **algumas features da nuvem** sem precisar reescrever a aplicação.\n- **Exemplos**:\n  - MySQL rodando on-prem vira **RDS MySQL**, ou seja, continua o mesmo engine (o mesmo tipo de banco, MySQL), só que agora a AWS é quem gerencia.\n  - Um app Java numa VM (máquina virtual) vira um app Java no **Elastic Beanstalk**, que faz o provisionamento automático.\n  - Um site estático on-prem vira **S3 + CloudFront**.\n  - Os logs do Apache passam a ir para o **CloudWatch Logs**.',
                    },
                    {
                        type: "quote",
                        value: "**Sweet spot (o ponto ideal):** ganhos significativos, como serviços gerenciados e escalabilidade, sem ter que reescrever a lógica da app.",
                    },
                    { type: "text", value: "### 5. Repurchase - drop and shop (SaaS)" },
                    {
                        type: "quote",
                        value: '"Esse app **vamos comprar SaaS**, parar de manter o nosso."',
                    },
                    {
                        type: "text",
                        value: 'Drop and shop é "largar e comprar". Em vez de manter a aplicação própria, a empresa passa a usar um **SaaS** (Software as a Service, ou software como serviço), que é um produto pronto que você contrata e acessa pela internet.\n\n- **Custo**: alto, por causa da assinatura (subscription) do SaaS, mais o custo de migrar os dados e os usuários.\n- **Esforço**: médio.\n- **Benefício**: **zero manutenção** depois que a migração termina, porque o fornecedor cuida de tudo.\n- **Exemplos**:\n  - Um CRM (sistema de relacionamento com o cliente) feito em casa vira **Salesforce**.\n  - Um servidor de email on-prem vira **Microsoft 365** ou **Google Workspace**.\n  - Um sistema de RH (recursos humanos) próprio vira **Workday**.\n  - Um help desk (central de atendimento) vira **Zendesk** ou **Freshdesk**.',
                    },
                    {
                        type: "quote",
                        value: '**Mudança organizacional:** sair de "nosso software" para "configurar um SaaS" muda a forma como o time trabalha.',
                    },
                    { type: "text", value: "### 6. Refactor / Re-architect" },
                    {
                        type: "quote",
                        value: '"Esse app **reescreve do zero** pra ser cloud-native."',
                    },
                    {
                        type: "text",
                        value: 'Cloud-native quer dizer "feito para a nuvem desde o começo". Aqui você repensa a aplicação e a reconstrói usando os serviços da AWS da forma como eles foram pensados.\n\n- **Custo**: **alto**, com meses a anos de desenvolvimento.\n- **Esforço**: alto.\n- **Benefício**: **máximo**. Você ganha escalabilidade, redução de custo, agilidade e features novas.\n- **Exemplos**:\n  - Um monólito Java (uma aplicação única e grande) vira microsserviços rodando em **Lambda + DynamoDB**.\n  - Um app on-prem vira **Serverless** (API Gateway + Lambda + DynamoDB), sem servidores para você administrar.\n  - Um banco SQL vira **Aurora Serverless** ou **DynamoDB**.\n  - Filas feitas na mão viram **SQS + EventBridge**.',
                    },
                    {
                        type: "quote",
                        value: "**Quando vale a pena:**\n- Quando o app é **central** para o negócio e vai ser usado nos próximos 10 anos ou mais.\n- Quando uma funcionalidade nova exige, por exemplo a necessidade de escalar globalmente.\n- Quando o custo de manter o sistema legado ficou insustentável.",
                    },
                    { type: "text", value: "## 3. Tabela comparativa" },
                    {
                        type: "table",
                        value: '[["R","Custo","Esforço","Benefício cloud","Tempo"],["**Retire**","$0","Baixo","n/a (sai)","Dias"],["**Retain**","$0","Zero","Nenhum (fica)","n/a"],["**Rehost**","$","Baixo","**Mínimo** (só sair do DC)","Semanas"],["**Replatform**","$$","Médio","**Médio** (managed services)","Semanas-meses"],["**Repurchase**","$$$","Médio","**Alto** (zero manutenção)","Meses"],["**Refactor**","$$$$","**Alto**","**Máximo** (cloud-native)","Meses-anos"]]',
                    },
                    {
                        type: "text",
                        value: "## 4. Como escolher (decision tree)\n\nEsta é a árvore de decisão (decision tree). Ela ajuda a chegar no R certo respondendo a perguntas simples sobre cada aplicação.",
                    },
                    {
                        type: "code",
                        value: "                  App tem valor de negócio?\n                          │\n              ┌───────────┴───────────┐\n            NÃO                      SIM\n              │                       │\n              ▼                       ▼\n        Tá em uso?            Cabe na arquitetura\n              │              tradicional ou precisa cloud-native?\n      ┌───────┴──────┐                │\n    SIM            NÃO       ┌────────┴─────────┐\n      │             │      TRAD            CLOUD-NATIVE\n      ▼             ▼        │                  │\n   Retain        Retire      ▼                  ▼\n   (mantém)    (descomissiona)\n                      Time/budget?            Refactor\n                            │\n            ┌───────────────┼───────────────┐\n       Mínimo            Médio            Alto + SaaS substitui?\n            │                │                  │\n            ▼                ▼                  ▼\n        Rehost          Replatform          Repurchase\n        (lift-and-       (managed services    (compra SaaS)\n         shift)           pra alguns recursos)",
                    },
                    { type: "text", value: "## 5. AWS Migration Hub" },
                    {
                        type: "quote",
                        value: "O **AWS Migration Hub** é um console central, ou seja, um painel único na AWS para **acompanhar a migração de várias aplicações** em um só lugar.",
                    },
                    {
                        type: "text",
                        value: "### O que faz\n- Mostra o inventário das aplicações que foram **descobertas** (pelo Application Discovery Service).\n- Mostra o status de migração de cada aplicação: em qual R ela está e em qual fase.\n- Acompanha (tracks) migrações feitas com MGN, DMS ou outras ferramentas.\n- Reúne métricas agregadas, como a porcentagem já migrada e a quantidade de apps por R.",
                    },
                    {
                        type: "quote",
                        value: 'É o **único lugar para enxergar o "big picture"** (a visão geral) de uma migração com centenas de aplicações.',
                    },
                    { type: "text", value: "## 6. AWS Migration Acceleration Program (MAP)" },
                    {
                        type: "quote",
                        value: "O **Migration Acceleration Program (MAP)** é um programa **estruturado da AWS** para empresas grandes migrarem em escala.",
                    },
                    {
                        type: "text",
                        value: "### Fases (clássicas em CSP):\n1. **Assess (avaliar)**: avaliar o quanto a empresa está pronta e calcular o **TCO** (Total Cost of Ownership, o custo total de propriedade, que soma tudo o que a solução custa ao longo do tempo).\n2. **Mobilize (mobilizar)**: montar o time, criar a landing zone (o ambiente-base já configurado e seguro na AWS) e fazer **POCs** (Proof of Concept, provas de conceito, testes pequenos para validar a ideia).\n3. **Migrate & Modernize (migrar e modernizar)**: executar a migração e otimizar.\n\nO programa inclui **créditos AWS, consultoria de parceiros e ferramentas** para acelerar. Costuma estar disponível para empresas grandes por meio do account team da AWS (o time de conta que atende o cliente).\n\n## 7. AWS Application Discovery Service",
                    },
                    {
                        type: "quote",
                        value: "O **AWS Application Discovery Service** descobre o **inventário e as dependências** das aplicações on-prem antes de você migrar.",
                    },
                    {
                        type: "text",
                        value: '### Modes\n- **Agent-based (com agente)**: você instala um agente em cada servidor on-prem, e ele coleta detalhes como CPU, memória (RAM) e dependências de rede.\n- **Agentless (sem agente)**: escaneia ambientes VMware sem instalar nada nos servidores.\n\n### Output\n- A lista de servidores.\n- O padrão de uso de recursos.\n- As **dependências entre as aplicações**, ou seja, quem conversa com quem.\n\n**Por que importa:** evita que você migre a aplicação A e esqueça da B quando as duas dependem uma da outra.\n\n## 8. Pegadinhas comuns da prova\n\n1. **"Lift-and-shift = qual R?"** → **Rehost**.\n2. **"Trocar app custom por SaaS"** → **Repurchase**.\n3. **"Reescrever monólito como microsserviços"** → **Refactor**.\n4. **"Migrar VM com mínimo de mudança"** → **Rehost** (não Replatform).\n5. **"Migrar DB Oracle pra RDS Oracle (mesmo engine)"** → **Replatform** (ganha managed sem reescrever app).\n6. **"App não é usado, vamos desligar"** → **Retire**.\n7. **"Compliance impede mover esse app pra cloud"** → **Retain**.\n8. **"Maior benefício de cloud, maior esforço"** → **Refactor**.\n9. **"Menor esforço, menor benefício"** → **Rehost**.\n10. **"Quero acompanhar migração de várias apps centralmente"** → **AWS Migration Hub**.\n11. **"Inventário de servidores on-prem e dependências"** → **AWS Application Discovery Service**.\n12. **"Programa AWS estruturado pra migrações grandes"** → **Migration Acceleration Program (MAP)**.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '6 Rs de migração:\n\n  Retire     → descomissiona app não usado\n                Custo $0, esforço baixo\n\n  Retain     → mantém on-prem (compliance, legacy, dependência)\n                Custo $0\n\n  Rehost     → lift-and-shift (mover sem mudar)\n                Custo $, esforço baixo\n                BENEFÍCIO cloud: MÍNIMO\n                Ferramenta: AWS MGN (Application Migration Service)\n\n  Replatform → lift-tinker-shift (pequenos ajustes)\n                Custo $$, esforço médio\n                Ex: MySQL on-prem → RDS MySQL\n\n  Repurchase → drop-and-shop (trocar por SaaS)\n                Custo $$$ (subscription)\n                Ex: CRM custom → Salesforce\n\n  Refactor   → reescrever cloud-native\n                Custo $$$$, esforço alto\n                BENEFÍCIO cloud: MÁXIMO\n                Ex: monólito → Lambda + DynamoDB\n\nFerramentas AWS de migração:\n  Migration Hub               → console central de migração\n  Application Discovery       → inventário + dependências on-prem\n  Application Migration (MGN) → replica VM pra EC2 (Rehost)\n  Database Migration (DMS)    → migrar bancos (Replatform/Refactor)\n  Schema Conversion (SCT)     → converter schema entre engines\n  Snow Family                 → mover PB de dados (off-line ou edge)\n  DataSync                    → sync de arquivos cross-region/on-prem\n  Transfer Family             → SFTP/FTPS/FTP gerenciado pra S3\n  Migration Acceleration Program (MAP) → programa estruturado AWS\n\nDecisão por R:\n  "lift-and-shift"             → Rehost\n  "trocar por SaaS"            → Repurchase\n  "reescrever cloud-native"    → Refactor\n  "engine igual, ganhar managed" → Replatform\n  "não migrar"                 → Retain\n  "desligar"                   → Retire\n\nAtalhos pra prova:\n  "lift-and-shift"                   → Rehost\n  "drop and shop (SaaS)"             → Repurchase\n  "lift-tinker-and-shift"            → Replatform\n  "cloud-native, máximo benefício"   → Refactor\n  "manter on-prem por enquanto"      → Retain\n  "descomissionar"                   → Retire\n  "console central da migração"      → Migration Hub\n  "inventário on-prem + dependências" → Application Discovery\n  "replica VM pra EC2"               → AWS MGN',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa precisa sair do data center on-premises com urgência porque o contrato de locação vai vencer. A decisão é mover a aplicação para a AWS exatamente como ela está, sem alterar o código, deixando a otimização para depois. Qual das 6 estratégias de migração corresponde a essa abordagem, conhecida como lift-and-shift?",
                        difficulty: "facil",
                        options: [
                            { text: "Rehost", isCorrect: true },
                            { text: "Replatform", isCorrect: false },
                            { text: "Refactor", isCorrect: false },
                            { text: "Repurchase", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um banco de dados MySQL que roda on-premises será movido para o Amazon RDS mantendo o mesmo engine MySQL, mas agora com a AWS cuidando de backups, atualizações e escala. A lógica da aplicação praticamente não muda. Qual estratégia de migração descreve esse ajuste pequeno para aproveitar serviços gerenciados?",
                        difficulty: "medio",
                        options: [
                            { text: "Rehost", isCorrect: false },
                            { text: "Refactor", isCorrect: false },
                            { text: "Replatform", isCorrect: true },
                            { text: "Retain", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um monólito Java central para o negócio, que a empresa pretende usar pelos próximos dez anos, será totalmente reescrito como microsserviços em AWS Lambda e Amazon DynamoDB para se tornar cloud-native. Entre as 6 estratégias, qual tem o maior custo e esforço, porém entrega o máximo de benefício da nuvem?",
                        difficulty: "medio",
                        options: [
                            { text: "Replatform", isCorrect: false },
                            { text: "Refactor", isCorrect: true },
                            { text: "Rehost", isCorrect: false },
                            { text: "Repurchase", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em vez de continuar mantendo um CRM desenvolvido internamente, a empresa decide abandoná-lo e passar a usar o Salesforce, um SaaS contratado por assinatura. Qual estratégia de migração representa essa troca da aplicação própria por um software de terceiros já pronto?",
                        difficulty: "facil",
                        options: [
                            { text: "Replatform", isCorrect: false },
                            { text: "Refactor", isCorrect: false },
                            { text: "Rehost", isCorrect: false },
                            { text: "Repurchase", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação legada precisa continuar rodando no data center local porque regras de compliance proíbem que esses dados fiquem na nuvem. A empresa decide de forma consciente não migrá-la por enquanto e mantê-la em operação on-premises. Qual das 6 estratégias corresponde a essa decisão?",
                        difficulty: "medio",
                        options: [
                            { text: "Retire", isCorrect: false },
                            { text: "Retain", isCorrect: true },
                            { text: "Rehost", isCorrect: false },
                            { text: "Replatform", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS Snow Family - Migração física + Edge computing",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nQuando você precisa **transferir terabytes ou petabytes de dados para a AWS** e a internet seria lenta demais (ou cara demais, ou inviável), a AWS te envia **dispositivos físicos**. Você copia os dados neles localmente, devolve, e a AWS faz o upload dentro dos data centers dela. Também existem versões para **edge computing** (rodar a AWS num local remoto, sem conexão). São 3 produtos principais: **Snowcone** (8 TB, portátil), **Snowball Edge** (até 80 TB, o padrão) e **Snowmobile** (até 100 PB, um caminhão).",
                    },
                    {
                        type: "text",
                        value: '## 1. O problema que Snow Family resolve\n\n### Cenário "internet não dá conta"\n\nAntes de ler o cálculo abaixo, guarde duas medidas. Um petabyte (PB) equivale a mil terabytes (TB). E Gbps quer dizer gigabits por segundo, uma medida de velocidade de rede.',
                    },
                    {
                        type: "code",
                        value: "   Você precisa subir 1 PB (1.000 TB) pra AWS\n   Sua internet tem 1 Gbps de upload (otimista)\n\n   1 PB / 1 Gbps = ~93 dias (24/7, sem interrupção)\n\n   Realista: 6-12 meses pra fazer upload.\n   Custo de banda? Astronômico.",
                    },
                    {
                        type: "text",
                        value: "### Solução\n\nA ideia é levar os dados fisicamente, num dispositivo criptografado, em vez de mandá-los pela rede.",
                    },
                    {
                        type: "code",
                        value: "   AWS te envia um Snowball (dispositivo físico encriptado)\n       │\n       ▼\n   Você copia 80 TB de dado nele (alguns dias)\n       │\n       ▼\n   Devolve via UPS/FedEx\n       │\n       ▼\n   AWS sobe pro S3 (algumas horas no data center)\n       │\n       ▼\n   Total: ~1 semana (vs 6+ meses pela internet)",
                    },
                    {
                        type: "quote",
                        value: '**"Sneakernet ainda ganha de fibra"** - para volumes grandes, mover um dispositivo fisicamente é mais rápido que a rede. (Sneakernet é o apelido bem-humorado para levar dados a pé, num aparelho, em vez de mandá-los pela internet.)',
                    },
                    {
                        type: "text",
                        value: "## 2. Os 3 produtos principais\n\n### Snowcone (menor, portátil)",
                    },
                    {
                        type: "table",
                        value: '[["Característica","Valor"],["**Storage**","8 TB HDD ou 14 TB SSD"],["**Compute**","2 vCPUs, 4 GB RAM"],["**Peso**","**2.1 kg** (cabe na mochila)"],["**Caso de uso**","Edge computing remoto, IoT, mochila de field worker"],["**Battery**","Pode rodar com bateria externa"]]',
                    },
                    {
                        type: "quote",
                        value: "É o **único da família que cabe na mão.** Usado em locais remotos (mineração, ONG na África, embarcação, drone) e por field workers, que são os trabalhadores em campo.",
                    },
                    { type: "text", value: "### Snowball Edge (padrão, 2 variantes)" },
                    {
                        type: "table",
                        value: '[["Variante","Foco","Storage","Compute"],["**Snowball Edge Storage Optimized**","Migrar dados","**80 TB** HDD","40 vCPUs, 80 GB RAM"],["**Snowball Edge Compute Optimized**","Rodar compute no edge","28 TB SSD","**104 vCPUs, 416 GB RAM** + GPU opcional"]]',
                    },
                    {
                        type: "text",
                        value: "**Tamanho físico:** do tamanho de uma maleta de viagem (cerca de 22 kg).\n\n**Caso de uso:**\n- Storage Optimized: para a **migração offline** de vários TBs para a AWS.\n- Compute Optimized: para rodar **EC2 + Lambda no edge**, ou seja, na borda, em lugares como um navio, uma plataforma de petróleo ou uma área sem internet.\n\n### Snowmobile (caminhão!)",
                    },
                    {
                        type: "table",
                        value: '[["Característica","Valor"],["**Storage**","**Até 100 PB** (sim, petabytes)"],["**Forma**","**Container de 14 metros** puxado por caminhão semi"],["**Segurança**","Criptografia + escolta armada opcional"],["**Caso de uso**","Migração de **exabytes** de data center inteiro"]]',
                    },
                    {
                        type: "quote",
                        value: "**Sério:** a AWS envia um **caminhão** até o seu data center. Você conecta o container no rack, transfere 100 PB, e o caminhão volta para o data center da AWS.",
                    },
                    {
                        type: "text",
                        value: "Casos reais: empresas de mídia (streaming, broadcasting), governos com archive massivo e ciência (dados de telescópio, genoma).\n\n## 3. Tabela comparativa",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","**Snowcone**","**Snowball Edge**","**Snowmobile**"],["Tamanho físico","**Mochila** (2 kg)","**Maleta** (22 kg)","**Caminhão** (14m)"],["Storage máximo","14 TB","**80 TB**","**100 PB**"],["Compute","2 vCPUs","até 104 vCPUs + GPU","n/a"],["Battery option","**Sim**","Não","Não"],["Uso primário","Edge remoto, IoT","Migração + edge","Migração massiva"],["Pricing","$$","$$$","$$$$$$"]]',
                    },
                    {
                        type: "text",
                        value: '## 4. Recursos comuns a toda Snow Family\n\n- **Criptografia AES-256** automática: os dados são embaralhados com um algoritmo forte, e a chave fica no **KMS** (Key Management Service, o serviço que gerencia chaves) da sua conta.\n- **Tamper-evident**: o dispositivo dá sinais claros se alguém tentar abri-lo de forma indevida.\n- **Tracking GPS** durante o transporte, para saber onde o aparelho está.\n- **S3 endpoint local**: você copia os dados como se estivesse falando com o S3, só que esse "S3" está ali dentro do próprio dispositivo.\n- **Suporte a NFS** (Network File System) para mover dados de um sistema de arquivos com facilidade.\n- O **AWS Snowball Edge pode rodar Lambda localmente**, ou seja, executar código mesmo sem internet (compute offline).\n\n## 5. Fluxo típico de uso',
                    },
                    {
                        type: "code",
                        value: "   1. Acessa AWS Console → Snow Family → Create job\n   2. Escolhe: tipo de dispositivo + tamanho + destino S3 + região\n   3. AWS envia dispositivo (recebe em 4-7 dias)\n   4. Conecta no seu data center (rack ou desktop)\n   5. Configura via AWS OpsHub (app desktop) ou CLI\n   6. Copia dados (NFS, S3 endpoint local, AWS DataSync)\n   7. Devolve dispositivo (etiqueta E-Ink já vem com endereço AWS)\n   8. AWS recebe → audita criptografia → faz upload S3\n   9. Você apaga dados do dispositivo (DoD 5220.22-M compliance)\n   10. Confirma conclusão no console",
                    },
                    {
                        type: "text",
                        value: "Dois termos desse fluxo merecem explicação. O **AWS OpsHub** é o aplicativo de desktop que você usa para configurar e gerenciar o dispositivo. E o **DoD 5220.22-M** é um padrão reconhecido de apagamento seguro de dados, que garante que nada sobre no aparelho depois do uso.\n\n## 6. Snow Family pra edge computing (Compute Optimized)\n\nA Snow Family não serve só para migração. O **Snowball Edge Compute Optimized** consegue rodar **EC2 + S3 endpoint + Lambda + EKS Anywhere** de forma **offline** (EKS Anywhere é a versão do Kubernetes da AWS que roda fora da nuvem, no seu ambiente).",
                    },
                    {
                        type: "code",
                        value: "   Navio em alto-mar (sem internet)\n        │\n        ▼\n   Snowball Edge a bordo\n        │\n        ├── Rodando EC2 com ML model\n        ├── Rodando Lambda processando dados\n        ├── S3 storage local\n        └── Sync com cloud quando volta ao porto",
                    },
                    {
                        type: "text",
                        value: "**Casos de uso edge:**\n- **Petróleo e gás** (plataformas offshore, no mar).\n- **Militar** (operações remotas).\n- **Cruzeiros e aviação** (entretenimento offline a bordo).\n- **Mineração** (locais remotos).\n- **Field research**, ou seja, pesquisa de campo (Antártida, Amazônia).\n- **Disaster response**, a resposta a desastres, em áreas sem internet depois de um furacão.\n\n## 7. Snow Family vs alternativas",
                    },
                    {
                        type: "table",
                        value: '[["Cenário","Solução","Por quê"],["< 1 TB pra mover, internet OK","**Direct upload S3** ou **DataSync**","Snow é overkill"],["10-100 TB, internet razoável","**AWS DataSync**","Mais barato + automático"],["**TB a PB**, internet limitada","**Snowball Edge**","Sweet spot Snow"],["**PB+** dados, migração inteira","**Snowmobile**","Único caminho realista"],["Edge computing offline","**Snowball Edge Compute** ou **Snowcone**","Compute + storage local"],["Streaming contínuo on-prem ↔ AWS","**AWS Storage Gateway**","Pra fluxo contínuo (não one-shot)"]]',
                    },
                    {
                        type: "quote",
                        value: "**DataSync vs Snow:** o DataSync é online e dá conta de TBs. O Snow é offline e serve para o volume (TB a PB) que justifica enviar um dispositivo físico.",
                    },
                    { type: "text", value: "## 8. Pricing" },
                    {
                        type: "table",
                        value: '[["Item","Cobrança"],["**Snowcone**","~$60 por uso (5 dias inclusos) + S3 storage destino"],["**Snowball Edge Storage**","~$300 por uso (10 dias inclusos) + S3 storage"],["**Snowball Edge Compute**","Mais caro (~$500+)"],["**Snowmobile**","Quote-based (centenas de milhares de USD)"],["**Dias extras**","Cobra por dia se segurar dispositivo além do incluso"],["**Data transfer IN**","Grátis (AWS adora dado entrando)"]]',
                    },
                    {
                        type: "text",
                        value: '## 9. Pegadinhas comuns da prova\n\n1. **"Migrar 50 TB com internet lenta"** → **Snowball Edge Storage Optimized**.\n2. **"Migrar 5 PB de data center inteiro"** → **Snowmobile**.\n3. **"Rodar AWS num local sem internet (navio, plataforma)"** → **Snowball Edge Compute Optimized**.\n4. **"Dispositivo portátil que cabe na mochila pra field worker"** → **Snowcone**.\n5. **"100 GB pra mover"** → **NÃO usa Snow** - sobe via internet ou DataSync.\n6. **"Snow é encriptado?"** → **Sim**, AES-256 automático com KMS.\n7. **"Snow tem GPS tracking?"** → **Sim**.\n8. **"Pode rodar Lambda no Snow?"** → **Sim** (Snowball Edge Compute).\n9. **"Snowmobile é o quê fisicamente?"** → **Container de 14 metros num caminhão**.\n10. **"Custo de data transfer pra AWS via Snow?"** → **Grátis (data IN)**.\n11. **"Tempo total típico migração Snowball"** → **~1 semana** (envio + cópia + devolução + upload).\n12. **"DataSync vs Snow"** → DataSync online (TBs OK); Snow offline (TB-PB com internet ruim).\n\n## 10. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Snow Family = migração física + edge computing\n\n3 produtos:\n\nSnowcone (mochila, 2kg)\n  - 8 TB HDD ou 14 TB SSD\n  - 2 vCPUs, 4 GB RAM\n  - Bateria externa opcional\n  - Edge remoto: IoT, field worker, drone\n\nSnowball Edge (maleta, 22kg)\n  - Storage Optimized: 80 TB HDD + 40 vCPUs\n  - Compute Optimized: 28 TB SSD + 104 vCPUs + GPU opcional\n  - Pode rodar EC2 + Lambda offline\n  - Migração TB-PB + edge\n\nSnowmobile (CAMINHÃO, 14m container)\n  - Até 100 PB\n  - Migração massiva de exabytes\n  - Quote-based pricing (caro)\n\nRecursos comuns:\n  Criptografia AES-256 automática (KMS)\n  Tamper-evident + GPS tracking\n  S3 endpoint local + NFS\n  AWS OpsHub (app desktop pra gerenciar)\n\nQuando usar Snow:\n  TB a PB de dados pra mover\n  Internet limitada / cara\n  Compliance que prefere offline\n  Edge computing offline\n\n  < 1 TB → use upload direto ou DataSync\n  Streaming contínuo → use Storage Gateway\n\nSnow vs DataSync:\n  DataSync → online, TBs feasible, melhor custo se internet OK\n  Snow     → offline, TB-PB, internet ruim ou inexistente\n\nEdge computing (Snowball Edge Compute):\n  Navio, plataforma offshore, mineração, militar, disaster response\n  Roda EC2 + Lambda + S3 local\n  Sync com cloud quando reconecta\n\nPricing:\n  Snowcone   → ~$60 + S3 destino\n  Snowball   → ~$300-$500 + S3 destino\n  Snowmobile → quote-based ($$$)\n  Dias extras cobrados se segurar device\n\nAtalhos pra prova:\n  "10-80 TB, internet limitada"      → Snowball Edge Storage\n  "PB+ data center inteiro"          → Snowmobile (caminhão)\n  "compute offline em navio/remote"   → Snowball Edge Compute\n  "portátil pra field worker"         → Snowcone\n  "100 GB pra mover"                  → NÃO Snow, use internet/DataSync\n  "data transfer IN cobra?"           → Grátis\n  "GPS + tamper-evident"              → Snow (todos)',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa precisa migrar cerca de 50 TB de dados para o Amazon S3, mas o link de internet é lento e o upload levaria vários meses. Qual dispositivo da família Snow é o mais indicado para essa migração física offline?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Snowball Edge Storage Optimized", isCorrect: true },
                            {
                                text: "AWS Snowcone, por ser o menor e mais barato da família",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Snowmobile, por ser o dispositivo mais rápido",
                                isCorrect: false,
                            },
                            {
                                text: "Fazer o upload direto pela internet para o Amazon S3",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O AWS Snowmobile foi projetado para a maior escala de migração da família Snow. Qual descrição corresponde a ele?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um contêiner de cerca de 14 metros transportado por um caminhão, com capacidade de até 100 PB",
                                isCorrect: true,
                            },
                            {
                                text: "Um dispositivo portátil de cerca de 2 kg que cabe em uma mochila",
                                isCorrect: false,
                            },
                            {
                                text: "Um equipamento do tamanho de uma mala de viagem, com dezenas de TB",
                                isCorrect: false,
                            },
                            {
                                text: "Um software instalado no data center do cliente para replicar dados pela rede",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um trabalhador de campo atua em um local remoto sem internet e precisa de um dispositivo pequeno e leve, que caiba na mochila, para coletar dados e rodar tarefas simples de IoT. Qual produto da família Snow atende a esse caso?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Snowcone", isCorrect: true },
                            { text: "AWS Snowball Edge Storage Optimized", isCorrect: false },
                            { text: "AWS Snowmobile", isCorrect: false },
                            { text: "AWS Snowball Edge Compute Optimized", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma plataforma de petróleo no mar não tem conexão com a internet, mas precisa executar localmente várias instâncias EC2 e funções Lambda para processar dados com um modelo de machine learning, sincronizando com a nuvem apenas quando possível. Qual opção da família Snow é a mais adequada?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Snowball Edge Compute Optimized", isCorrect: true },
                            { text: "AWS Snowball Edge Storage Optimized", isCorrect: false },
                            { text: "AWS Snowcone", isCorrect: false },
                            { text: "AWS Snowmobile", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um gestor pergunta como a AWS protege os dados gravados nos dispositivos da família Snow durante o transporte. Qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os dados são criptografados automaticamente com 256 bits, com chaves gerenciadas pelo AWS KMS e nunca armazenadas no dispositivo, que ainda é fisicamente resistente a violação",
                                isCorrect: true,
                            },
                            {
                                text: "Os dados trafegam sem criptografia, pois o transporte físico já é considerado seguro",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente precisa criptografar manualmente cada arquivo antes de copiá-lo para o dispositivo",
                                isCorrect: false,
                            },
                            {
                                text: "A criptografia só é aplicada depois que a AWS recebe o dispositivo em seu data center",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Inovação na AWS - AI/ML, IoT e DevOps",
                blocks: [
                    {
                        type: "quote",
                        value: "Em uma frase\nA AWS oferece um portfólio enorme de **serviços de inovação** para as empresas avançarem sem ter que reinventar tudo. Tem os **AI services prontos** (Rekognition, Polly, Translate, Comprehend, Transcribe, Lex) para usar inteligência artificial sem ser cientista de dados. Tem o **SageMaker** para treinar modelos custom. Tem o **IoT Core** para conectar milhões de devices. E tem as **DevOps tools** (CodeCommit, CodeBuild, CodeDeploy, CodePipeline) para o CI/CD (a esteira de integração e entrega contínuas). Para a certificação Cloud Practitioner, o que vale é **reconhecer cada serviço pelo caso de uso**.",
                    },
                    {
                        type: "text",
                        value: "## 1. AI Services - IA pronta pra usar (sem treinar modelo)\n\nA AWS já treinou os modelos de IA (inteligência artificial) para você. Você não precisa entender de ciência de dados nem treinar nada: é só consumir o serviço através de uma **API** (a interface pela qual um programa conversa com outro).",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","O que faz","Caso de uso clássico"],["**Amazon Rekognition**","Visão computacional - detecta objetos, faces, texto em imagens/vídeos","Moderação de conteúdo, detecção de pessoas em CFTV, OCR"],["**Amazon Polly**","**Text-to-Speech** (texto → áudio) com vozes naturais (60+ idiomas)","Audiolivros, IVR, assistente acessibilidade"],["**Amazon Transcribe**","**Speech-to-Text** (áudio → texto)","Legendas automáticas, transcrição de calls, podcasts"],["**Amazon Translate**","Tradução **automática** entre 75+ idiomas","I18n de app, suporte multilíngue"],["**Amazon Comprehend**","NLP - sentimento, entidades, idioma, tópicos","Análise de reviews, classificação de tickets"],["**Amazon Lex**","**Chatbots** (mesma engine da Alexa)","Bot de atendimento, voice assistant"],["**Amazon Textract**","OCR avançado - extrai texto + tabelas + forms de documentos","Processar PDFs de fatura, contratos"],["**Amazon Kendra**","Busca empresarial alimentada por ML","\\"Search\\" interno corporativo"],["**Amazon Personalize**","Recomendação personalizada (mesma engine da Amazon.com)","\\"Quem comprou X também comprou Y\\""],["**Amazon Forecast**","Previsão de séries temporais (vendas, demanda, capacidade)","Previsão de vendas, demanda de produto"],["**Amazon Fraud Detector**","Detecção de fraude online","Pagamento suspeito, conta falsa"]]',
                    },
                    {
                        type: "text",
                        value: "Só para deixar as siglas da tabela claras: NLP é Natural Language Processing (processamento de linguagem natural), OCR é Optical Character Recognition (leitura de texto em imagens), IVR é o atendimento telefônico por voz, I18n é internacionalização (deixar o app pronto para vários idiomas) e ML é machine learning, o aprendizado de máquina, em que o computador aprende padrões a partir de dados.",
                    },
                    {
                        type: "quote",
                        value: "**Pattern (o padrão):** quando a prova menciona um caso específico, você identifica o serviço direto. Não é Lambda com ML custom, existe um serviço pronto para aquilo.",
                    },
                    { type: "text", value: "## 2. SageMaker - treinar modelos custom" },
                    {
                        type: "quote",
                        value: "O **SageMaker** é a plataforma completa para **construir, treinar e implantar modelos de ML custom** (modelos de machine learning feitos sob medida). Você usa quando os AI services prontos não atendem.",
                    },
                    {
                        type: "text",
                        value: "### Componentes\n- **SageMaker Studio**: o ambiente de desenvolvimento (IDE) que roda no navegador, feito para cientistas de dados.\n- **SageMaker Training**: treina os modelos usando um conjunto de máquinas que escala conforme a necessidade.\n- **SageMaker Endpoint**: hospeda o modelo pronto para fazer inferência (gerar as respostas), em tempo real ou em lote (batch).\n- **SageMaker Ground Truth**: cuida da rotulagem dos dados (labeling), combinando pessoas e ML.\n- **SageMaker JumpStart**: traz modelos já treinados, incluindo foundation models (modelos base, grandes e genéricos) e LLMs (Large Language Models, os grandes modelos de linguagem que geram texto).\n- **SageMaker Pipelines**: faz o CI/CD do ML, ou seja, automatiza o ciclo de treinar e implantar.\n\n### Quando usar\n- Você tem **dado próprio** e um **problema único** que não cabe nos AI services prontos.\n- Você quer fazer o **fine-tune** (ajuste fino) de um LLM para o seu domínio específico.\n- Você precisa de um **modelo proprietário**, que é um segredo competitivo seu.\n- Você tem um time de **cientistas de dados** internos.\n\n### Pricing\n- Cobra por **instance-hora** durante o treino (cada hora de máquina usada).\n- Cobra por **instance-hora** ou por **request** durante a inferência.\n- Existe o **SageMaker Serverless Inference** para cargas de trabalho que variam bastante.\n\n## 3. Amazon Bedrock - Foundation Models gerenciados",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon Bedrock** dá acesso a **LLMs e foundation models de vários fornecedores** (Anthropic Claude, Meta Llama, Mistral, Stable Diffusion, Amazon Titan) por meio de **uma única API**. LLM é Large Language Model, um modelo de linguagem grande, do tipo que gera texto. Foundation models são modelos grandes e genéricos que servem de base para muitas tarefas diferentes.",
                    },
                    {
                        type: "text",
                        value: "### Características\n- **Serverless**: você não precisa provisionar GPU nem administrar servidor.\n- **Fine-tuning** opcional: dá para ajustar o modelo com o seu próprio dado.\n- **RAG** (Retrieval-Augmented Generation): o modelo busca informação nas suas bases de conhecimento antes de responder.\n- **Agents**: orquestração de tools, ou seja, o modelo aciona ferramentas e executa passos.\n- **Guardrails**: controles sobre o que o modelo pode ou não gerar (o controle do output).\n\n### Casos de uso\n- Chatbots com uma experiência **parecida com o GPT**.\n- Resumo de documentos.\n- Geração de código.\n- Geração de imagem (Stable Diffusion).\n\n## 4. IoT - Internet of Things\n\nIoT é a sigla de Internet of Things (Internet das Coisas): conectar milhões de dispositivos físicos à AWS.",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","O que faz"],["**AWS IoT Core**","Núcleo - broker MQTT, device registry, autenticação"],["**AWS IoT Greengrass**","Runtime no edge - Lambda + ML local no device"],["**AWS IoT Analytics**","Pipeline de análise de dados IoT"],["**AWS IoT Device Defender**","Audit de segurança de devices"],["**AWS IoT Events**","Detectar eventos complexos em streams"],["**AWS IoT SiteWise**","Industrial IoT (chão de fábrica)"],["**AWS IoT TwinMaker**","Digital twins (gêmeos digitais de fábrica/edifício)"],["**FreeRTOS**","SO real-time pra microcontroladores"]]',
                    },
                    {
                        type: "text",
                        value: "Duas expressões da tabela: MQTT é um protocolo de mensagens leve, muito usado por dispositivos IoT, e um broker é o intermediário que recebe e distribui essas mensagens. Digital twins são réplicas digitais de algo físico, como uma fábrica ou um prédio, usadas para simular e monitorar.\n\n### Caso de uso clássico",
                    },
                    {
                        type: "code",
                        value: "   Milhões de sensores IoT (smart home, industrial, automotivo)\n        │\n        │ MQTT\n        ▼\n   AWS IoT Core (broker + auth)\n        │\n        ├──▶ Lambda processa telemetria\n        ├──▶ Timestream armazena time series\n        ├──▶ SNS notifica anomalias\n        └──▶ S3 + Glue + Athena pra analytics",
                    },
                    {
                        type: "text",
                        value: "## 5. DevOps Tools - CI/CD na AWS\n\nAqui está o pipeline completo de entrega contínua na AWS. CI/CD significa Continuous Integration / Continuous Delivery (integração contínua e entrega contínua): a prática de integrar e publicar mudanças de código de forma automática e frequente.",
                    },
                    {
                        type: "table",
                        value: '[["Serviço","Função"],["**AWS CodeCommit**","Git hosting (alternativa AWS ao GitHub privado)"],["**AWS CodeBuild**","Build (compila, testa)"],["**AWS CodeDeploy**","Deploy automatizado pra EC2, Lambda, ECS, on-prem"],["**AWS CodePipeline**","Orquestrador do pipeline (CI/CD)"],["**AWS CodeArtifact**","Repositório de packages (npm, Maven, pip)"],["**AWS CodeGuru**","Code review automático com ML (bugs, performance)"],["**AWS Cloud9**","IDE no browser"]]',
                    },
                    { type: "text", value: "### Pipeline típico" },
                    {
                        type: "code",
                        value: "   Dev commit no CodeCommit (ou GitHub)\n        │\n        ▼\n   CodePipeline detecta change\n        │\n        ▼\n   CodeBuild (compila + testa)\n        │\n        ▼\n   CodeDeploy (deploy automático)\n        │\n        ├──▶ Staging (auto)\n        └──▶ Produção (após approval)",
                    },
                    {
                        type: "text",
                        value: "### Alternativas open-source equivalentes\n- CodeCommit ↔ GitHub, GitLab\n- CodeBuild ↔ Jenkins, CircleCI\n- CodeDeploy ↔ Spinnaker\n- CodePipeline ↔ GitHub Actions, GitLab CI",
                    },
                    {
                        type: "quote",
                        value: 'O **CodeStar** (legado, em sunset, ou seja, sendo descontinuado) era o "starter kit" que provisionava tudo junto. Hoje a AWS recomenda usar **CDK pipelines** ou GitHub Actions.',
                    },
                    { type: "text", value: "## 6. AWS Outras Áreas de Inovação" },
                    {
                        type: "table",
                        value: '[["Serviço","Domínio"],["**Amazon Braket**","**Quantum computing** (acesso a quantum hardware)"],["**AWS RoboMaker**","Robótica (simulação + deploy)"],["**AWS Ground Station**","Satellite-as-a-Service (antenas de baixar dado de satélite)"],["**AWS Wickr**","Mensagem segura E2E (governos, militar)"],["**AWS GameLift**","Hospedar servidores de jogo multiplayer"],["**Amazon Sumerian** (legacy)","VR/AR (descontinuado)"],["**Amazon Honeycode** (legacy)","No-code app builder (descontinuado)"]]',
                    },
                    {
                        type: "text",
                        value: "Nas siglas da tabela: E2E é end-to-end (a criptografia de ponta a ponta, em que só quem envia e quem recebe leem a mensagem) e VR/AR são realidade virtual e realidade aumentada.\n\n## 7. Decision tree - qual serviço de IA usar?\n\nEsta árvore ajuda a escolher o serviço de IA certo para cada situação.",
                    },
                    {
                        type: "code",
                        value: "                 Tem dado suficiente?\n                         │\n              ┌──────────┴──────────┐\n            SIM                    NÃO\n              │                     │\n              ▼                     ▼\n        Caso comum?            AI Services prontos\n        (visão, voz, texto)    (Rekognition, Polly, etc.)\n              │\n        ┌─────┴─────┐\n      SIM         NÃO\n        │           │\n        ▼           ▼\n   AI Services   SageMaker\n   prontos       (modelo custom)\n\n   Casos:\n   • LLM / generativo / RAG  → Bedrock\n   • Visão                    → Rekognition\n   • Texto → fala             → Polly\n   • Fala → texto             → Transcribe\n   • Tradução                 → Translate\n   • Sentimento, NER          → Comprehend\n   • Chatbot                  → Lex\n   • OCR PDF/form            → Textract\n   • Busca corporativa        → Kendra\n   • Recomendação             → Personalize\n   • Previsão série temporal  → Forecast\n   • Fraude                   → Fraud Detector\n   • Tudo custom              → SageMaker",
                    },
                    {
                        type: "text",
                        value: '## 8. Pegadinhas comuns da prova\n\n1. **"Reconhecer faces em imagens"** → **Rekognition**.\n2. **"Texto-pra-fala com voz natural"** → **Polly**.\n3. **"Fala-pra-texto (legendas)"** → **Transcribe**.\n4. **"Tradução automática multi-idioma"** → **Translate**.\n5. **"Análise de sentimento de reviews"** → **Comprehend**.\n6. **"Chatbot conversacional"** → **Lex**.\n7. **"OCR de PDFs de fatura"** → **Textract** (não Rekognition!).\n8. **"LLM tipo GPT na AWS"** → **Bedrock** (Claude, Llama, Titan, etc.).\n9. **"Treinar modelo ML custom"** → **SageMaker**.\n10. **"Recomendação personalizada de produto"** → **Personalize**.\n11. **"Previsão de demanda de vendas"** → **Forecast**.\n12. **"Conectar milhões de IoT"** → **IoT Core**.\n13. **"Lambda no edge do IoT"** → **IoT Greengrass**.\n14. **"Git privado AWS"** → **CodeCommit**.\n15. **"CI/CD pipeline orquestrado"** → **CodePipeline**.\n16. **"Quantum computing"** → **Braket**.\n17. **"Servidor de jogo multiplayer"** → **GameLift**.\n\n## 9. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'AI Services prontos (consumo via API, sem treinar):\n\n  Rekognition       → visão (imagens/vídeos)\n  Polly             → text → speech\n  Transcribe        → speech → text\n  Translate         → tradução\n  Comprehend        → NLP (sentimento, entidades)\n  Lex               → chatbots (mesma engine Alexa)\n  Textract          → OCR avançado (texto + tabelas + forms)\n  Kendra            → busca empresarial\n  Personalize       → recomendação (Amazon.com engine)\n  Forecast          → previsão time series\n  Fraud Detector    → detecção fraude online\n\nML custom:\n  SageMaker         → treinar e implantar modelos próprios\n                      Studio, Training, Endpoint, JumpStart, Pipelines\n\nFoundation Models / LLMs:\n  Bedrock           → API única pra Claude, Llama, Mistral, Titan, Stable Diffusion\n                      RAG, fine-tuning, agents, guardrails\n\nIoT:\n  IoT Core          → broker MQTT, device registry\n  IoT Greengrass    → edge runtime (Lambda + ML local)\n  IoT Analytics     → pipeline de dados\n  IoT Device Defender → audit segurança\n  FreeRTOS          → SO real-time pra micro\n\nDevOps:\n  CodeCommit        → Git hosting\n  CodeBuild         → build & test\n  CodeDeploy        → deploy automatizado\n  CodePipeline      → orquestrador CI/CD\n  CodeArtifact      → repositório packages\n  CodeGuru          → code review ML\n  Cloud9            → IDE no browser\n\nOutras inovações:\n  Braket            → quantum computing\n  RoboMaker         → robótica\n  Ground Station    → satellite-as-a-service\n  GameLift          → servidores de jogo\n\nAtalhos pra prova:\n  "reconhecer faces em imagem"        → Rekognition\n  "voz natural pra audiolivro"        → Polly\n  "transcrição de podcast"            → Transcribe\n  "chatbot conversacional"            → Lex\n  "PDF extrair tabela"                → Textract\n  "LLM tipo GPT"                      → Bedrock\n  "treinar modelo próprio"            → SageMaker\n  "recomendação tipo Amazon"          → Personalize\n  "previsão demanda"                  → Forecast\n  "IoT broker"                        → IoT Core\n  "Lambda no edge IoT"                → IoT Greengrass\n  "CI/CD AWS"                         → CodePipeline (+ Build/Deploy/Commit)\n  "quantum"                           → Braket\n  "jogo multiplayer servidor"         → GameLift',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um estúdio de mídia quer gerar legendas automaticamente a partir do áudio de podcasts e de chamadas gravadas, sem manter uma equipe de ciência de dados. Qual serviço de IA pronto da AWS atende diretamente esse caso?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Amazon Transcribe, que converte áudio em texto (speech-to-text).",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon Polly, que converte texto em áudio (text-to-speech).",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Translate, que faz tradução automática entre idiomas.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Comprehend, que analisa sentimento e entidades em textos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe interna de cientistas de dados tem um conjunto de dados proprietário e um problema de negócio específico que nenhum serviço de IA pronto resolve. Ela precisa construir, treinar e implantar um modelo de machine learning sob medida. Qual serviço da AWS é o indicado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon SageMaker, plataforma para construir, treinar e implantar modelos de ML customizados.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon Rekognition, serviço pronto de visão computacional.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Lex, serviço pronto para criação de chatbots.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Kendra, serviço pronto de busca empresarial com ML.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma fábrica precisa conectar milhões de sensores à AWS usando o protocolo MQTT, com registro e autenticação dos dispositivos. Qual serviço funciona como núcleo dessa conectividade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS IoT Core, que provê o broker MQTT, o device registry e a autenticação.",
                                isCorrect: true,
                            },
                            {
                                text: "AWS IoT Greengrass, runtime que roda no edge, dentro do próprio dispositivo.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS IoT Device Management, para organizar, monitorar e gerenciar frotas de dispositivos em escala.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS IoT Device Defender, auditoria de segurança dos dispositivos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No conjunto de ferramentas de CI/CD da AWS, qual serviço atua como orquestrador do pipeline, coordenando as etapas de origem, build e deploy de ponta a ponta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS CodePipeline, orquestrador que encadeia as etapas do pipeline.",
                                isCorrect: true,
                            },
                            {
                                text: "AWS CodeCommit, hospedagem de repositórios Git.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS CodeBuild, responsável por compilar e testar o código.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS CodeDeploy, responsável por automatizar o deploy nos ambientes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa quer criar aplicações de IA generativa acessando foundation models de vários fornecedores, como Anthropic Claude e Meta Llama, por meio de uma única API gerenciada e serverless, sem provisionar GPU. Qual serviço da AWS atende esse cenário?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon Bedrock, que dá acesso a foundation models de vários fornecedores por uma única API serverless.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon SageMaker, plataforma para construir e treinar modelos próprios provisionando instâncias.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Lex, serviço de chatbots baseado em intenções, com a mesma tecnologia da Alexa.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Comprehend, serviço de NLP para sentimento e entidades.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 10 - Well-Architected Framework",
        aulas: [
            {
                titulo: "AWS Well-Architected Framework - Os 6 Pilares",
                blocks: [
                    {
                        type: "text",
                        value: "## Well-Architected Framework - 6 Pilares\n\n# AWS Well-Architected Framework - Os 6 Pilares",
                    },
                    {
                        type: "quote",
                        value: "Em uma frase\nO **Well-Architected Framework** é o **conjunto de princípios** que a AWS publica desde 2015 sobre **como construir sistemas bem-arquitetados na nuvem**. Ele se divide em **6 pilares** que funcionam como um **checklist** para qualquer arquitetura: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization e Sustainability (o mais recente). Cada pilar traz **boas práticas** e um **questionário oficial**. Você responde esse questionário na **AWS Well-Architected Tool** (grátis) para **avaliar sua arquitetura** e descobrir riscos.",
                    },
                    { type: "text", value: "## 1. O que é o framework" },
                    {
                        type: "code",
                        value: "   ┌──────────────────────────────────────────────────────────┐\n   │            AWS Well-Architected Framework                 │\n   │                                                            │\n   │  Operational  Security   Reliability  Performance         │\n   │  Excellence                            Efficiency          │\n   │      │           │           │            │                │\n   │      └───────────┴───────────┴────────────┘                │\n   │                            │                                │\n   │                  Cost          Sustainability               │\n   │                  Optimization                                │\n   └──────────────────────────────────────────────────────────┘",
                    },
                    {
                        type: "text",
                        value: "**Origem:** ao longo dos anos, a AWS observou quais arquiteturas falhavam, quais ficavam caras demais e quais eram seguras. Depois, ela resumiu tudo isso em pilares e perguntas.\n\n**Não é certificação.** É uma referência de boas práticas. Na prática, você a usa para quatro coisas:\n- **Auditar** sua própria arquitetura, revisando o que já está no ar.\n- **Comparar** diferentes opções de design antes de escolher uma.\n- **Educar** times mais novos, mostrando as boas práticas de forma organizada.\n- **Engajar a AWS**, já que o account team (o time responsável pela sua conta na AWS) faz reviews gratuitos.\n\n## 2. Os 6 Pilares (visão geral)",
                    },
                    {
                        type: "table",
                        value: '[["#","Pilar","Foco","Pergunta-mestra"],["1","**Operational Excellence**","Operar e monitorar sistemas pra entregar valor de negócio","Estamos rodando isso eficientemente?"],["2","**Security**","Proteger informação e sistemas","Estamos seguros?"],["3","**Reliability**","Workloads executam função esperada, consistentemente","Continua funcionando quando algo dá errado?"],["4","**Performance Efficiency**","Usar recursos eficientemente, em mudança constante","Estamos usando os recursos certos pra carga atual?"],["5","**Cost Optimization**","Maximizar valor por dólar gasto","Tô pagando demais por isso?"],["6","**Sustainability**","Reduzir impacto ambiental","Tô minimizando carbon footprint?"]]',
                    },
                    {
                        type: "quote",
                        value: "**O 6º pilar (Sustainability)** foi adicionado em 2021. Antes dele, o framework tinha apenas 5 pilares. O foco dele é **eficiência energética e ambiental**.",
                    },
                    { type: "text", value: "## 3. Pilar 1 - Operational Excellence" },
                    {
                        type: "quote",
                        value: "Capacidade de **dar suporte ao desenvolvimento** e rodar workloads (as suas cargas de trabalho, ou seja, as aplicações e sistemas) de forma eficaz.",
                    },
                    {
                        type: "text",
                        value: "### Princípios de design\n- **Operações como código.** Trate a operação como software. Isso inclui Infrastructure as Code (IaC, ou infraestrutura como código) e runbooks (roteiros de operação) escritos como scripts.\n- **Mudanças pequenas e reversíveis.** Prefira alterações pequenas e fáceis de desfazer, usando CI/CD (integração e entrega contínuas), blue-green e canary.\n- **Refinar procedimentos com frequência.** Faça post-mortems (as análises depois de um incidente) e exercícios de DR (Disaster Recovery, ou recuperação de desastres).\n- **Antecipar falhas.** Simule problemas antes que aconteçam, com game days e chaos engineering.\n- **Aprender com todas as falhas** operacionais.\n\n### Serviços AWS chave\n- **CloudFormation** e **CDK** (Cloud Development Kit): para IaC.\n- **Systems Manager**: para automação das tarefas operacionais.\n- **CloudWatch** e **X-Ray**: para observabilidade, ou seja, enxergar o que acontece dentro do sistema.\n- **CodePipeline** e **CodeDeploy**: para entrega contínua.\n\n### Exemplo prático\n- Tudo é definido em IaC, e os deploys passam por um pipeline com etapa de aprovação.\n- Cada incidente conhecido tem um runbook documentado.\n- Game days mensais simulam falhas para testar a reação do time.\n\n## 4. Pilar 2 - Security",
                    },
                    {
                        type: "quote",
                        value: "Proteger **dados, sistemas e ativos** usando recursos AWS de segurança.",
                    },
                    {
                        type: "text",
                        value: "### Princípios de design\n- **Base forte de identidade** (identity strong foundation). Use IAM (Identity and Access Management, o gerenciamento de identidade e acesso) de forma rigorosa, com least privilege (o menor privilégio possível) e MFA (Multi-Factor Authentication, a autenticação de múltiplos fatores).\n- **Habilitar rastreabilidade** (traceability). Registre tudo com o CloudTrail.\n- **Aplicar segurança em todas as camadas.** É a chamada defesa em profundidade.\n- **Automatizar** as boas práticas de segurança, com Config rules e GuardDuty.\n- **Proteger os dados em trânsito e em repouso** (in transit and at rest), ou seja, quando eles trafegam e quando estão parados.\n- **Preparar-se para eventos de segurança**, com playbooks (os roteiros de resposta) e simulações.\n\n### Serviços AWS chave\n- **IAM** e **IAM Identity Center**: para identidade.\n- **KMS** (Key Management Service), **Secrets Manager** e **ACM** (AWS Certificate Manager): para criptografia.\n- **WAF** (Web Application Firewall) e **Shield**: para proteger a aplicação e defender contra DDoS (Distributed Denial of Service, o ataque de negação de serviço distribuído).\n- **GuardDuty**, **Macie** e **Inspector**: para detecção de ameaças.\n- **CloudTrail** e **Config**: para auditoria.\n\n### Exemplo prático\n- A conta root fica sem access keys e com MFA habilitado.\n- Toda instância EC2 acessa o S3 por meio de uma IAM Role, sem credenciais escritas no código (hardcoded).\n- Buckets sensíveis usam criptografia (encryption) e uma bucket policy bem estrita.\n- O GuardDuty fica ligado, com os alertas integrados ao Slack.\n\n## 5. Pilar 3 - Reliability",
                    },
                    {
                        type: "quote",
                        value: "**Workload executa funções corretamente** e se **recupera de falhas** automaticamente.",
                    },
                    {
                        type: "text",
                        value: "### Princípios de design\n- **Recuperar-se de falhas automaticamente** (automatically recover from failure). É o chamado auto-healing, quando o sistema se conserta sozinho.\n- **Testar os procedimentos de recuperação** (test recovery procedures). Não basta ter backup: você precisa testar o restore para ter certeza de que ele funciona.\n- **Escalar horizontalmente** (scale horizontally) para aumentar a disponibilidade.\n- **Parar de adivinhar capacidade** (stop guessing capacity), escalando de forma dinâmica.\n- **Gerenciar mudanças por automação** (manage change in automation). As mudanças passam por pipeline, e não na mão.\n\n### Serviços AWS chave\n- **Multi-AZ deployment** (implantação em várias AZs, as Availability Zones, ou zonas de disponibilidade), disponível em RDS (Relational Database Service), ElastiCache e outros.\n- **Auto Scaling** (para EC2 e DynamoDB).\n- **Route 53** com roteamento de failover (a troca automática para um recurso saudável).\n- **Multi-region** (várias regiões) para DR.\n- **CloudFormation** para recriar toda a infraestrutura do zero.\n\n### Exemplo prático\n- A aplicação roda em um ASG (Auto Scaling Group, o grupo de auto scaling) espalhado por várias AZs, atrás de um ALB (Application Load Balancer, o balanceador de carga da aplicação).\n- O banco usa RDS Multi-AZ com read replicas (réplicas de leitura).\n- O DR entre regiões (cross-region) é testado a cada trimestre.\n- As quotas ficam monitoradas no Trusted Advisor.\n\n## 6. Pilar 4 - Performance Efficiency",
                    },
                    {
                        type: "quote",
                        value: "Usar os **recursos certos** para atender aos requisitos, acompanhando a **evolução da tecnologia**.",
                    },
                    {
                        type: "text",
                        value: "### Princípios de design\n- **Democratizar tecnologias avançadas** (democratize advanced technologies). Use serviços de AI (inteligência artificial), ML (Machine Learning, o aprendizado de máquina) e até quantum assim que eles virarem ferramentas de uso comum.\n- **Ficar global em minutos** (go global in minutes), com CloudFront e várias regiões.\n- **Usar serverless** (sem servidor para gerenciar). Você ganha escala automática sem administrar instâncias.\n- **Experimentar com mais frequência** (experiment more often). A nuvem deixa você testar de forma rápida e barata.\n- **Mechanical sympathy** (afinidade mecânica): entender as tecnologias que estão por baixo para tirar o melhor delas.\n\n### Serviços AWS chave\n- **EC2 instance types** (os tipos de instância do EC2): escolher o tipo certo para a carga.\n- **Auto Scaling**: escalar conforme a demanda.\n- **ElastiCache**: reduzir a latência.\n- **CloudFront**: cache distribuído pelo mundo (global).\n- **Lambda** e **Fargate**: opções serverless.\n\n### Exemplo prático\n- Uma workload que consome muita memória (memory-heavy) roda em instâncias R5, e não M5.\n- As queries ficam em cache no ElastiCache, o que reduz a latência em 10×.\n- A mídia é servida pelo CloudFront, distribuído globalmente.\n- Funções orientadas a evento (event-driven) rodam em Lambda, em vez de uma EC2 ociosa.\n\n## 7. Pilar 5 - Cost Optimization",
                    },
                    {
                        type: "quote",
                        value: "Evitar **custos desnecessários** e **maximizar valor entregue**.",
                    },
                    {
                        type: "text",
                        value: "### Princípios de design\n- **Gestão financeira da nuvem** (cloud financial management), criando uma cultura de FinOps (Financial Operations, a união de finanças com operações).\n- **Adotar o modelo de consumo** (consumption model): pague pelo que usa, e não pelo que poderia vir a usar.\n- **Medir a eficiência geral** (measure overall efficiency), olhando o custo por transação e por usuário.\n- **Parar de gastar com trabalho braçal que não diferencia o negócio** (undifferentiated heavy lifting): prefira serviços gerenciados (managed services).\n- **Analisar e atribuir o gasto** (analyze and attribute expenditure), com tags e cost categories (categorias de custo).\n\n### Serviços AWS chave\n- **Cost Explorer**: análise de custo.\n- **AWS Budgets**: orçamentos e alertas de gasto.\n- **Trusted Advisor**: recomendações de economia.\n- **Savings Plans** e **Reserved Instances**: descontos em troca de um compromisso de uso.\n- **S3 Intelligent-Tiering**: otimização automática do armazenamento.\n\n### Exemplo prático\n- Reserved Instances cobrem 80% da carga base (a parte que roda o tempo todo).\n- Instâncias Spot cuidam do batch processing (o processamento em lote).\n- Lifecycle policies movem os dados antigos do S3 para o Glacier.\n- O Budgets dispara um alerta quando o gasto previsto passa da meta.\n\n## 8. Pilar 6 - Sustainability (o mais novo)",
                    },
                    {
                        type: "quote",
                        value: "Minimizar **impacto ambiental** dos workloads na nuvem.",
                    },
                    {
                        type: "text",
                        value: "### Princípios de design\n- **Entender o seu impacto** (understand your impact), medindo o consumo de recursos.\n- **Estabelecer metas de sustentabilidade** (sustainability goals), ou seja, metas de redução.\n- **Maximizar a utilização** (maximize utilization): não deixar recurso parado, ocioso.\n- **Antecipar novas tecnologias eficientes** (anticipate efficient new technologies). Chips ARM, como o Graviton, consomem menos energia.\n- **Usar serviços gerenciados** (managed services), já que a AWS otimiza o datacenter inteiro.\n- **Reduzir o impacto lá na ponta** (reduce downstream impact), com otimização em escala.\n\n### Práticas concretas\n- **Graviton (ARM)**: instâncias mais eficientes em energia.\n- **Auto Scaling agressivo**: evitar rodar a máquina a apenas 20% de uso.\n- **Serverless** (Lambda e Fargate): consome só o necessário.\n- **Escolha da região** (region): algumas regiões usam mais energia renovável.\n- **S3 Lifecycle**: mover o dado antigo para um storage frio, que é mais eficiente.\n\n### Por que importa\n- **ESG** (Environmental, Social, Governance, ou seja, ambiental, social e governança): há pressão dos investidores por isso.\n- **Compliance** (conformidade) com as metas climáticas da empresa.\n- **Custo**: no geral, dá no mesmo que a otimização de custo, porque eficiência costuma sair mais barato.\n\n## 9. AWS Well-Architected Tool",
                    },
                    {
                        type: "quote",
                        value: "**Ferramenta grátis** no console pra **avaliar uma workload contra o framework**.",
                    },
                    {
                        type: "text",
                        value: '### Como funciona\n1. Crie uma "**workload**", descrevendo o seu sistema.\n2. Responda às perguntas de cada um dos 6 pilares (algo entre 40 e 60 perguntas por pilar).\n3. A ferramenta gera um **relatório com os riscos identificados**:\n   - **High Risk Issues (HRIs)**, os problemas de risco alto, para corrigir com urgência.\n   - **Medium Risk Issues**, os de risco médio, para planejar.\n   - **Improvement actions**, que são recomendações de melhoria.\n4. Você **planeja as correções** e reavalia depois.\n\n### Lenses (extensões)\nAs lenses são extensões do framework para cenários específicos:\n- **Serverless Lens**: focada em apps serverless.\n- **SaaS Lens**: para produtos SaaS (Software as a Service, o software entregue como serviço).\n- **Streaming Media Lens**: para streaming de mídia.\n- **IoT Lens, ML Lens, HPC Lens e FSI Lens**: para verticais específicas como IoT (Internet of Things, a internet das coisas), ML (Machine Learning), HPC (High Performance Computing, a computação de alto desempenho) e FSI (Financial Services Industry, o setor de serviços financeiros).\n\n### Custo\n- A **ferramenta é grátis**.\n- Os **Well-Architected Reviews** feitos com o account team da AWS também são grátis. Eles ainda podem qualificar você a receber **créditos** se você implementar as correções dos HRIs.\n\n## 10. Pegadinhas comuns da prova\n\n1. **"Quantos pilares?"** → **6** (era 5 antes de 2021).\n2. **"Pilar mais novo?"** → **Sustainability** (2021).\n3. **"Pilar sobre custo"** → **Cost Optimization**.\n4. **"Pilar sobre confiabilidade / failover"** → **Reliability**.\n5. **"Pilar sobre IAM, KMS, criptografia"** → **Security**.\n6. **"Pilar sobre escolher tipo de instância certo"** → **Performance Efficiency**.\n7. **"Pilar sobre IaC, CI/CD, runbooks"** → **Operational Excellence**.\n8. **"Pilar sobre Graviton ARM eficiente"** → **Sustainability** (e Cost Optimization).\n9. **"Como avaliar minha arquitetura contra o framework?"** → **AWS Well-Architected Tool** (grátis).\n10. **"Well-Architected Tool cobra?"** → **NÃO, é grátis**.\n11. **"Lens específica pra serverless"** → **Serverless Lens**.\n12. **"Stop guessing capacity"** → princípio de **Reliability** (e Cost Optimization).\n13. **"6 R\'s"** ≠ "6 pilares" - Rs são estratégias de migração (Módulo 8), pilares são WA Framework.\n\n## 11. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'AWS Well-Architected Framework = 6 pilares de best practices\n\n1. OPERATIONAL EXCELLENCE\n   - IaC, CI/CD, runbooks, game days\n   - CloudFormation, Systems Manager, CodePipeline\n   - "Operar e melhorar com frequência"\n\n2. SECURITY\n   - IAM least privilege, MFA, encryption tudo\n   - Defesa em camadas, detecção, audit\n   - KMS, IAM, WAF, GuardDuty, CloudTrail\n\n3. RELIABILITY\n   - Auto-healing, multi-AZ, testar recovery\n   - Auto Scaling, scale horizontal, manage change\n   - "Stop guessing capacity"\n\n4. PERFORMANCE EFFICIENCY\n   - Tipo de instância certo, serverless, cache\n   - Use tech moderna (AI, ML, quantum)\n   - EC2 right-sizing, ElastiCache, CloudFront\n\n5. COST OPTIMIZATION\n   - Consumption model, FinOps, managed services\n   - Spot + Reserved, lifecycle policies, Trusted Advisor\n   - Cost Explorer, AWS Budgets\n\n6. SUSTAINABILITY (novo, 2021)\n   - Eficiência energética, Graviton, serverless\n   - Region com renovável, lifecycle pra storage frio\n   - Reduzir downstream impact\n\nAWS Well-Architected Tool:\n   - GRÁTIS no console\n   - Responda perguntas → identifica HRI (High Risk Issues)\n   - Lenses: Serverless, SaaS, Streaming Media, IoT, ML, HPC, FSI\n\nNÃO confundir com 6 Rs:\n   - 6 Rs       → estratégias de migração (Rehost, Replatform, etc.)\n   - 6 Pilares  → best practices de arquitetura (este)\n\nAtalhos pra prova:\n  "custo, FinOps, Spot"           → Cost Optimization\n  "failover, multi-AZ, DR"        → Reliability\n  "IAM, MFA, encryption"          → Security\n  "tipo de instância, CloudFront" → Performance Efficiency\n  "IaC, CI/CD, runbook"           → Operational Excellence\n  "Graviton, energy efficient"    → Sustainability\n  "avaliar arquitetura"           → Well-Architected Tool (grátis)\n  "lens serverless"               → Serverless Lens\n  "quantos pilares?"              → 6\n  "mais novo"                     → Sustainability',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O AWS Well-Architected Framework tinha 5 pilares até 2021, quando um sexto foi incluído com foco em eficiência energética e na redução do impacto ambiental (pegada de carbono). Qual é esse sexto pilar?",
                        difficulty: "facil",
                        options: [
                            { text: "Sustainability", isCorrect: true },
                            { text: "Cost Optimization", isCorrect: false },
                            { text: "Operational Excellence", isCorrect: false },
                            { text: "Reliability", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação descreve corretamente o AWS Well-Architected Framework?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "É um conjunto de princípios e boas práticas para avaliar e melhorar arquiteturas na nuvem.",
                                isCorrect: true,
                            },
                            {
                                text: "É uma certificação oficial que o arquiteto obtém após um exame pago.",
                                isCorrect: false,
                            },
                            {
                                text: "É um serviço gerenciado que bloqueia ataques de rede automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "É um contrato de suporte que garante 99,99% de disponibilidade das cargas de trabalho.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer responder ao questionário oficial dos seis pilares para avaliar uma carga de trabalho em produção e identificar riscos, sem custo adicional. Qual recurso da AWS atende a essa necessidade?",
                        difficulty: "medio",
                        options: [
                            { text: "AWS Well-Architected Tool", isCorrect: true },
                            { text: "AWS Trusted Advisor", isCorrect: false },
                            { text: "AWS Config", isCorrect: false },
                            { text: "AWS CloudFormation", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual pilar do AWS Well-Architected Framework foca em garantir que a carga de trabalho execute sua função corretamente e se recupere de falhas de forma automática (auto-healing)?",
                        difficulty: "medio",
                        options: [
                            { text: "Reliability", isCorrect: true },
                            { text: "Performance Efficiency", isCorrect: false },
                            { text: "Operational Excellence", isCorrect: false },
                            { text: "Security", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Mitigar ataques com o AWS Shield e o AWS WAF, aplicar least privilege no IAM e habilitar MFA na conta são práticas associadas principalmente a qual pilar?",
                        difficulty: "medio",
                        options: [
                            { text: "Security", isCorrect: true },
                            { text: "Reliability", isCorrect: false },
                            { text: "Cost Optimization", isCorrect: false },
                            { text: "Performance Efficiency", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 11 - Faturamento, Preço e Suporte",
        aulas: [
            {
                titulo: "AWS Support Plans - Os 4 planos",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nA AWS oferece **4 planos de suporte**, que crescem juntos em **recursos e custo**. São eles: **Basic** (grátis, sem suporte técnico humano), **Developer** (a partir de ~$29/mês, com acesso por email em business hours, o horário comercial), **Business** (a partir de ~$100/mês, com atendimento 24/7 por telefone e chat e o **Trusted Advisor completo**), **Enterprise On-Ramp** (~$5.5k/mês) e **Enterprise** (~$15k/mês, com **TAM dedicado**, o Technical Account Manager, que é o gerente técnico de conta exclusivo, e o melhor SLA). A pergunta clássica da prova é: "**qual o plano MAIS BARATO que oferece X?**".',
                    },
                    {
                        type: "text",
                        value: "## 1. Os 4 planos - visão geral\n\nEsta é a visão geral dos planos, do mais barato ao mais caro. A coluna SLA produção mostra o tempo de resposta que a AWS promete quando um sistema em produção fica fora do ar. SLA quer dizer Service Level Agreement, o acordo de nível de serviço.",
                    },
                    {
                        type: "table",
                        value: '[["Plano","Custo aproximado","SLA produção","Audiência"],["**Basic**","**Grátis**","n/a","Todos (default)"],["**Developer**","A partir de **$29/mês**","n/a","Devs em early dev/test"],["**Business**","A partir de **$100/mês**","< 1h pra produção inoperante","Pequenas/médias empresas em produção"],["**Enterprise On-Ramp**","A partir de **$5.500/mês**","< 30 min business-critical","Médias/grandes empresas"],["**Enterprise**","A partir de **$15.000/mês**","**< 15 min** business-critical","Grandes empresas, missão-crítica"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. O que cada plano inclui\n\nCada plano inclui tudo o que o plano anterior oferece e acrescenta novos recursos.\n\n### Basic (grátis)\n- Documentação, whitepapers e fóruns.\n- Acesso ao **AWS Personal Health Dashboard**.\n- **7 checks core** do Trusted Advisor, ou seja, 7 verificações principais que cobrem apenas Security e Service Limits (segurança e limites de serviço).\n- **Sem suporte técnico humano**.\n\n### Developer (~$29/mês)\n- Tudo do Basic, mais os itens abaixo.\n- **Acesso por email**, com apenas 1 contato primário (uma única pessoa autorizada a abrir chamados), em **business hours** (horário comercial).\n- Resposta em **menos de 24h** no caso geral e **menos de 12h** quando o problema está impactando produção.\n- Orientações de best practices (boas práticas).\n\n### Business (~$100/mês ou 3% do uso)\n- Tudo do Developer, mais os itens abaixo.\n- **Acesso 24/7 por telefone, chat e email** (24 horas por dia, 7 dias por semana).\n- **Múltiplos contatos** podem abrir chamados, não apenas uma pessoa.\n- Resposta em **menos de 1 hora** quando a **produção está inoperante** (fora do ar).\n- **Trusted Advisor COMPLETO**, com cerca de **115 checks**.\n- Acesso à **AWS Support API** (Application Programming Interface, a interface para acessar o suporte de forma programática).\n- AWS Trusted Advisor Recommendations (recomendações do Trusted Advisor).\n- Controle de acesso ao suporte via **IAM** (Identity and Access Management, o serviço de identidades e permissões da AWS).\n- Acesso a um IPM (Infrastructure Project Manager), não dedicado.\n\n### Enterprise On-Ramp (~$5.500/mês ou 10% do uso)\n- Tudo do Business, mais os itens abaixo.\n- **Resposta em menos de 30 min** para casos business-critical (críticos para o negócio).\n- **Pool de TAMs** (Technical Account Managers), ou seja, um time compartilhado de gerentes técnicos de conta, e não um dedicado só para você.\n- **Consultative review** de arquitetura (revisão consultiva da sua arquitetura).\n- Concierge support (atendimento concierge).\n\n### Enterprise (~$15.000/mês ou 10% do uso)\n- Tudo do Enterprise On-Ramp, mais os itens abaixo.\n- **Resposta em menos de 15 min** para casos business-critical.\n- **TAM DEDICADO**, um Technical Account Manager exclusivo para a sua conta.\n- **Concierge support** para problemas de faturamento e de conta.\n- **Well-Architected Reviews** prioritários.\n- **Operations Reviews** (revisões de operações).\n- Acesso ao **Infrastructure Event Management (IEM)** sem custo extra.\n- Training credits (créditos de treinamento).\n\n## 3. Tabela comparativa (cai na prova!)\n\nCompare os principais recursos entre os planos:",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Basic","Developer","Business","Enterprise On-Ramp","Enterprise"],["Custo mínimo","$0","$29/mês","$100/mês","$5.5k/mês","$15k/mês"],["**24/7 phone + chat**","","","","",""],["**Trusted Advisor completo**","(só 7 checks)","","","",""],["**SLA produção inoperante**","n/a","< 12h","**< 1h**","**< 30min**","**< 15 min (business-critical)**"],["**TAM dedicado**","","","","Pool",""],["**AWS Support API**","","","","",""],["**Well-Architected Reviews**","","","","",""],["**Concierge**","","","","",""],["**Infrastructure Event Mgmt**","","","Add-on","",""]]',
                    },
                    { type: "text", value: "## 4. Cenários típicos da prova" },
                    {
                        type: "table",
                        value: '[["Cenário","Plano mínimo"],["\\"Acesso 24/7 por telefone com resposta < 1h pra produção\\"","**Business**"],["\\"Trusted Advisor completo (todos os checks)\\"","**Business**"],["\\"TAM dedicado pra apoio estratégico\\"","**Enterprise**"],["\\"Resposta < 15 min pra business-critical\\"","**Enterprise**"],["\\"Apenas docs e fóruns, sem custo\\"","**Basic**"],["\\"Email durante business hours, custo baixo\\"","**Developer**"],["\\"Well-Architected Reviews oficiais\\"","**Enterprise On-Ramp** (ou Enterprise)"],["\\"Concierge support pra faturamento\\"","**Enterprise On-Ramp** (ou Enterprise)"]]',
                    },
                    {
                        type: "quote",
                        value: '**Regra clássica:** quando a pergunta menciona **"menor custo possível"** + algum recurso, escolha o **PLANO MAIS BARATO** que ainda inclui o recurso. Ex: "24/7 chat + resposta < 1h + menor custo" → **Business** (não Enterprise).',
                    },
                    {
                        type: "text",
                        value: "## 5. AWS Trusted Advisor por plano\n\nO Trusted Advisor muda bastante de um plano para outro:",
                    },
                    {
                        type: "table",
                        value: '[["Plano","Trusted Advisor"],["Basic / Developer","**7 checks core** (apenas Security + Service Limits)"],["Business / Enterprise On-Ramp / Enterprise","**~115 checks completos** (5 categorias)"]]',
                    },
                    {
                        type: "text",
                        value: '## 6. Pegadinhas comuns da prova\n\n1. **"24/7 phone + < 1h SLA pra produção, MENOR custo"** → **Business**.\n2. **"TAM dedicado"** → **Enterprise** (Enterprise On-Ramp tem pool, não dedicado).\n3. **"Trusted Advisor completo"** → **Business** (mínimo).\n4. **"Apenas documentação e fóruns"** → **Basic**.\n5. **"Resposta < 15 min pra business-critical"** → **Enterprise**.\n6. **"Well-Architected Reviews"** → **Enterprise On-Ramp** ou Enterprise.\n7. **"Personal Health Dashboard requer qual plano?"** → **Basic** (já tem).\n8. **"Custo do Basic?"** → **Grátis**.\n9. **"Concierge"** → **Enterprise On-Ramp** ou Enterprise.\n\n## 7. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: '4 (na verdade 5) planos de suporte AWS:\n\nBasic                ($0)            → docs, fóruns, Personal Health, 7 TA checks\nDeveloper            ($29/mês)       → email business hours\nBusiness             ($100/mês)      → 24/7 phone+chat, TA completo, <1h prod\nEnterprise On-Ramp   ($5.500/mês)    → pool TAM, <30min, Well-Architected reviews\nEnterprise           ($15.000/mês)   → TAM DEDICADO, <15min business-critical\n\nAtalhos pra prova:\n  "menor custo + 24/7 phone + <1h"     → Business\n  "TAM dedicado"                       → Enterprise (NÃO On-Ramp)\n  "Trusted Advisor completo"           → Business (mínimo)\n  "Concierge support"                  → Enterprise On-Ramp ou Enterprise\n  "Well-Architected Reviews"           → Enterprise On-Ramp ou Enterprise\n  "<15 min response"                   → Enterprise\n  "só docs/fóruns"                     → Basic\n  "Personal Health Dashboard"          → Basic já tem',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma aplicacao em producao precisa de suporte 24/7 por telefone e chat, com resposta em menos de 1 hora quando o sistema de producao fica inoperante. A empresa quer o menor custo possivel. Qual plano de suporte atende a esse cenario?",
                        difficulty: "medio",
                        options: [
                            { text: "Business", isCorrect: true },
                            { text: "Developer", isCorrect: false },
                            { text: "Enterprise", isCorrect: false },
                            { text: "Enterprise On-Ramp", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual plano de suporte da AWS oferece um Technical Account Manager (TAM) dedicado e exclusivo para a conta?",
                        difficulty: "medio",
                        options: [
                            { text: "Enterprise", isCorrect: true },
                            { text: "Enterprise On-Ramp", isCorrect: false },
                            { text: "Business", isCorrect: false },
                            { text: "Developer", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor em fase de testes quer suporte tecnico por email durante o horario comercial (business hours) pagando o menor valor possivel. Qual plano ele deve escolher?",
                        difficulty: "facil",
                        options: [
                            { text: "Developer", isCorrect: true },
                            { text: "Basic", isCorrect: false },
                            { text: "Business", isCorrect: false },
                            { text: "Enterprise On-Ramp", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma conta usa o plano de suporte Basic. A quais verificacoes do AWS Trusted Advisor essa conta tem acesso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Apenas ao conjunto core de verificacoes, voltado a seguranca e a limites de servico",
                                isCorrect: true,
                            },
                            {
                                text: "Ao conjunto completo de verificacoes, em todas as categorias, incluindo otimizacao de custos e tolerancia a falhas",
                                isCorrect: false,
                            },
                            {
                                text: "A nenhuma verificacao, porque o Trusted Advisor so vem em planos pagos",
                                isCorrect: false,
                            },
                            {
                                text: "Somente as verificacoes de otimizacao de custos",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual e o plano de suporte MAIS BARATO que inclui atendimento concierge e revisoes Well-Architected conduzidas pela AWS?",
                        difficulty: "medio",
                        options: [
                            { text: "Enterprise On-Ramp", isCorrect: true },
                            { text: "Enterprise", isCorrect: false },
                            { text: "Business", isCorrect: false },
                            { text: "Developer", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Faturamento Consolidado - AWS Organizations",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nQuando uma empresa tem **várias contas AWS** (uma por filial, por time ou por ambiente), o **AWS Organizations** permite juntar tudo em um **único faturamento**. Somando o uso de todas as contas, você ganha **descontos por volume** mais cedo, simplifica a contabilidade e tem **visibilidade central** dos custos. Pra prova: "**qualificação de preços por volume**" e "**várias contas, uma fatura**" → Faturamento Consolidado via Organizations.',
                    },
                    { type: "text", value: "## 1. O problema sem faturamento consolidado" },
                    {
                        type: "code",
                        value: '   Empresa tem 5 contas AWS:\n     Conta 1: 100 GB S3 → tier baixo\n     Conta 2: 200 GB S3 → tier baixo\n     Conta 3: 300 GB S3 → tier baixo\n     Conta 4: 200 GB S3 → tier baixo\n     Conta 5: 200 GB S3 → tier baixo\n\n   Cada uma paga preço "alto" (não chega no tier de desconto sozinha).\n\n   Total: 1000 GB, mas cobrado como se fossem 5 contas separadas.',
                    },
                    { type: "text", value: "## 2. Com faturamento consolidado" },
                    {
                        type: "code",
                        value: "   AWS Organizations agrupa as 5 contas\n     ↓\n   Uso AGREGADO: 1000 GB total\n     ↓\n   Chega no tier de desconto por VOLUME mais cedo\n     ↓\n   Todas as contas se beneficiam do preço menor",
                    },
                    { type: "text", value: "## 3. AWS Organizations - visão rápida" },
                    {
                        type: "quote",
                        value: "Serviço **gratuito** pra gerenciar **várias contas AWS** centralizadamente.",
                    },
                    { type: "text", value: "### Recursos principais" },
                    {
                        type: "table",
                        value: '[["Recurso","O que faz"],["**Faturamento Consolidado**","Uma fatura única pra todas as contas"],["**Descontos por Volume**","Uso agregado qualifica pra descontos mais cedo"],["**SCPs** (Service Control Policies)","Restringir o que cada conta pode fazer"],["**Account Management**","Criar/fechar contas programaticamente"],["**Cross-Account IAM Roles**","Acessar várias contas com uma identidade"]]',
                    },
                    { type: "text", value: "### Estrutura hierárquica" },
                    {
                        type: "code",
                        value: '   Root (raiz)\n     │\n     ├── OU "Production"\n     │     ├── Conta Prod-App\n     │     └── Conta Prod-Database\n     │\n     ├── OU "Development"\n     │     ├── Conta Dev-A\n     │     └── Conta Dev-B\n     │\n     └── Conta Master (paga as faturas)',
                    },
                    {
                        type: "text",
                        value: 'As OUs (Organizational Units, unidades organizacionais) permitem agrupar contas e aplicar SCPs em grupo.\n\n## 4. Benefícios do faturamento consolidado\n\n### 1. Qualificação de preços por volume\nO uso de **todas as contas se soma**. Com isso, você atinge os tiers (faixas) de desconto por volume mais cedo, em serviços como S3, transferência de dados do EC2 e outros.\n\n### 2. Compartilhamento de Reserved Instances e Savings Plans\nUma Reserved Instance (RI, instância reservada) ou um Savings Plan (SP, plano de economia) comprado em uma conta **beneficia todas as contas**, desde que sejam da mesma família e região. Assim você maximiza a utilização das reservas.\n\n### 3. Visibilidade centralizada\nVocê enxerga tudo de forma agregada: o Cost Explorer soma os custos, as tags ficam consistentes entre as contas e os Budgets (orçamentos) ficam centralizados.\n\n### 4. Simplicidade administrativa\nVocê recebe **uma só fatura** por mês e usa **um só método de pagamento**. Isso reduz o overhead (o trabalho extra) financeiro.\n\n### 5. Controle (SCPs)\nVocê pode restringir serviços e ações por conta ou por OU. Por exemplo: "a conta Dev não pode usar a família de instâncias EC2 P", que é cara.\n\n## 5. SCPs (Service Control Policies)',
                    },
                    {
                        type: "quote",
                        value: "**Guardrails** (grades de proteção) que restringem o que os IAM users e roles podem fazer em uma conta.",
                    },
                    {
                        type: "code",
                        value: '   IAM da conta            : "esse user PODE criar EC2 P5"\n   SCP da OU dele          : "essa OU NÃO PODE criar EC2 P-family"\n\n   Resultado: BLOQUEADO (SCP ganha)',
                    },
                    {
                        type: "text",
                        value: '- As SCPs **não dão permissão**, elas apenas restringem.\n- Elas se aplicam a **toda a conta**, inclusive ao root user (usuário raiz) da conta-filha.\n- Boa prática: aplicar as **SCPs no nível de OU**, e não em cada conta individual.\n\n## 6. Pegadinhas comuns da prova\n\n1. **"Várias contas, uma fatura única"** → **AWS Organizations / Faturamento Consolidado**.\n2. **"Qualificação de preços por VOLUME mais cedo"** → Faturamento Consolidado.\n3. **"Compartilhar Reserved Instances entre contas"** → Faturamento Consolidado via Organizations.\n4. **"Restringir o que uma conta pode fazer"** → **SCPs** (Service Control Policies).\n5. **"Organizations cobra?"** → **Não, é grátis**.\n6. **"Organizations vs IAM"** → IAM gerencia identidades **dentro de uma conta**. Organizations gerencia **várias contas**.\n7. **"Vantagem de várias contas separadas?"** → Isolamento (blast radius), compliance, billing per workload.\n8. **"Várias faturas (uma por conta)?"** → Isso é o **OPOSTO** do consolidado - não é uma vantagem.\n\n## 7. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'Faturamento Consolidado (via AWS Organizations):\n\nBenefícios:\n  Uma fatura pra várias contas\n  Qualificação de DESCONTOS POR VOLUME mais cedo\n  Compartilhamento de Reserved Instances / Savings Plans\n  Visibilidade centralizada (Cost Explorer, Budgets)\n  Controle via SCPs (Service Control Policies)\n\nAWS Organizations:\n  - GRÁTIS\n  - Estrutura: Root → OUs → Contas\n  - SCPs: restringem (não dão) permissões\n  - Master/Management account paga as faturas\n\nAtalhos pra prova:\n  "qualificação de preços por volume"      → Faturamento Consolidado\n  "várias contas, uma fatura"              → Organizations\n  "restringir o que conta pode fazer"      → SCPs\n  "Organizations cobra?"                    → Não, grátis\n  "RI compartilhada entre contas"          → Sim, via Org\n  "IAM gerencia contas?"                    → Não. IAM = dentro da conta. Org = várias contas',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa mantém cinco contas AWS separadas, uma para cada filial, e quer receber uma fatura única por mês em vez de cinco cobranças independentes. Qual recurso atende a essa necessidade?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O Faturamento Consolidado do AWS Organizations",
                                isCorrect: true,
                            },
                            {
                                text: "O AWS IAM, criando um usuário único compartilhado entre as contas",
                                isCorrect: false,
                            },
                            {
                                text: "O AWS Cost Explorer, que mescla as contas em uma só",
                                isCorrect: false,
                            },
                            {
                                text: "O AWS Budgets, que unifica as cobranças em um único pagamento",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com o faturamento consolidado ativado no AWS Organizations, como o consumo de serviços como o Amazon S3 é tratado para fins de desconto por volume?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O uso de todas as contas é somado, ajudando o grupo a atingir as faixas de desconto por volume mais cedo",
                                isCorrect: true,
                            },
                            {
                                text: "Cada conta é avaliada isoladamente, mantendo o mesmo preço de quando estavam separadas",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o consumo da conta de gerenciamento é contabilizado para os descontos por volume",
                                isCorrect: false,
                            },
                            {
                                text: "Os descontos por volume ficam desativados enquanto o faturamento consolidado estiver em uso",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A área de segurança precisa impedir que a conta de desenvolvimento use a família de instâncias EC2 P, mais cara, mesmo que um administrador dessa conta tente criá-la. Qual recurso do AWS Organizations aplica esse tipo de restrição?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "As SCPs (Service Control Policies), que definem o teto de permissões da conta",
                                isCorrect: true,
                            },
                            {
                                text: "As políticas de IAM da conta de pagamento, que se propagam automaticamente para as demais contas",
                                isCorrect: false,
                            },
                            {
                                text: "Os grupos de segurança (security groups), que bloqueiam tipos de instância",
                                isCorrect: false,
                            },
                            {
                                text: "Os Savings Plans, que limitam quais famílias de instância podem ser criadas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa avalia adotar o AWS Organizations para gerenciar suas contas de forma centralizada e habilitar o faturamento consolidado. Quanto a AWS cobra pelo uso do próprio serviço AWS Organizations?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Nada, o AWS Organizations é um serviço gratuito",
                                isCorrect: true,
                            },
                            {
                                text: "Uma taxa mensal fixa para cada conta membro da organização",
                                isCorrect: false,
                            },
                            {
                                text: "Um percentual aplicado sobre o total da fatura consolidada",
                                isCorrect: false,
                            },
                            {
                                text: "Uma cobrança única de configuração no momento de criar a organização",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma conta membro de uma organização comprou uma Instância Reservada (Reserved Instance) do Amazon EC2 que não está sendo totalmente utilizada. Com o faturamento consolidado, qual é o comportamento esperado dessa reserva?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O desconto da reserva pode beneficiar outras contas da organização que usem a mesma família e região",
                                isCorrect: true,
                            },
                            {
                                text: "A reserva fica restrita à conta que a comprou e não beneficia nenhuma outra conta",
                                isCorrect: false,
                            },
                            {
                                text: "A reserva é cancelada automaticamente e o valor é estornado para a conta de gerenciamento",
                                isCorrect: false,
                            },
                            {
                                text: "A reserva passa a valer para qualquer família de instância em qualquer região",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS Marketplace - Catálogo de software de terceiros",
                blocks: [
                    {
                        type: "quote",
                        value: 'Em uma frase\nO AWS Marketplace é o **catálogo digital de software de fornecedores terceiros**, os ISVs (Independent Software Vendors, fabricantes independentes de software). Você pode **comprar ou assinar** esses produtos e **rodá-los na AWS**: AMIs (Amazon Machine Images, imagens de máquina) com software pré-instalado, SaaS, ML models, datasets e containers. O pagamento fica **consolidado na fatura AWS**, o que simplifica a aquisição. Pra prova: "**catálogo digital de software de terceiros**" → Marketplace.',
                    },
                    { type: "text", value: "## 1. O que é Marketplace" },
                    {
                        type: "code",
                        value: '   AWS Marketplace = "App Store da AWS"\n\n   Milhares de produtos de terceiros (ISVs):\n     - AMIs com software pré-instalado (firewalls, databases, ML)\n     - Containers Docker\n     - SaaS (rodando em AWS, fatura via Marketplace)\n     - ML models e datasets\n     - Professional services\n     - Lambda functions',
                    },
                    {
                        type: "text",
                        value: "**URL:** `https://aws.amazon.com/marketplace`\n\n## 2. Categorias de produtos",
                    },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplos"],["**Infrastructure software**","Palo Alto Firewall, F5 LB, Check Point"],["**Bancos de dados**","MongoDB Atlas, MariaDB, InfluxDB"],["**Segurança**","CrowdStrike, Trend Micro, Splunk"],["**ML / AI**","Pre-trained models, datasets"],["**DevOps**","Datadog, New Relic, GitLab"],["**Business apps**","SAP, Oracle, Microsoft"],["**Industries**","Healthcare, Financial Services, Public Sector"]]',
                    },
                    { type: "text", value: "## 3. Modelos de pricing" },
                    {
                        type: "table",
                        value: '[["Modelo","Como funciona"],["**Hourly / Monthly**","Cobrança por hora/mês (típico AMI)"],["**Annual**","Pagamento anual com desconto"],["**BYOL** (Bring Your Own License)","Você traz licença Oracle/Microsoft, paga só infra AWS"],["**Free Trial**","Período gratuito antes de cobrar"],["**Free**","Open-source, sem custo de software (paga só recursos AWS)"],["**Contract**","Negocia direto com o vendor"]]',
                    },
                    {
                        type: "quote",
                        value: "**Faturamento consolidado:** Tudo aparece na **mesma fatura AWS**, simplificando o procurement (a aquisição), já que você não precisa cadastrar fornecedor novo.",
                    },
                    {
                        type: "text",
                        value: '## 4. Benefícios pra empresa\n\nPara uma empresa, o Marketplace traz várias vantagens:\n\n- **Procurement simplificado**: você não precisa de um processo de aquisição separado.\n- **Pagamento consolidado**: uma única fatura AWS cobre o software e a infraestrutura juntos.\n- **Provisionamento rápido**: o software já vem configurado para rodar na AWS.\n- **Negociação flexível**: dá para fechar Private Offers (ofertas privadas) direto com os vendors (fornecedores).\n- **Verified by AWS**: os produtos passam por uma security review (revisão de segurança) da AWS.\n- **Trial**: você testa antes de comprar.\n- **BYOL**: você reutiliza licenças que já possui.\n\n## 5. Pegadinhas comuns da prova\n\n1. **"Catálogo digital de software de fornecedores independentes (ISVs)"** → **AWS Marketplace**.\n2. **"Comprar firewall de terceiros (Palo Alto, Check Point) já configurado pra AWS"** → **Marketplace**.\n3. **"BYOL pra Oracle / Windows Server"** → também suportado no **Marketplace**.\n4. **"AWS Marketplace cobra como?"** → Vem na **mesma fatura AWS**.\n5. **"Marketplace é a mesma coisa que AWS Support?"** → **Não**. Support = suporte humano; Marketplace = catálogo de software.\n\n## 6. Cheat sheet final',
                    },
                    {
                        type: "code",
                        value: 'AWS Marketplace = catálogo digital de software de terceiros (ISVs)\n\nTipos: AMIs, Containers, SaaS, ML models, datasets, services\n\nPricing:\n  Hourly/Monthly  → cobrança por uso\n  Annual          → desconto anual\n  BYOL            → traga sua licença\n  Free Trial      → período grátis\n  Free            → open-source\n  Contract        → negociação custom\n\nBenefícios:\n  Procurement simplificado\n  Faturamento consolidado (uma fatura AWS)\n  Provisionamento rápido\n  Security review da AWS\n\nAtalhos pra prova:\n  "catálogo de software de terceiros"  → Marketplace\n  "firewall 3rd party pra AWS"         → Marketplace\n  "BYOL Oracle / Microsoft"            → Marketplace\n  "pagamento na fatura AWS"            → Marketplace',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa quer encontrar, comprar e assinar produtos de fornecedores independentes de software (ISVs) em um catálogo digital, com a opção de executá-los direto na AWS. Qual serviço atende a essa necessidade?",
                        difficulty: "facil",
                        options: [
                            { text: "AWS Marketplace", isCorrect: true },
                            { text: "AWS Support", isCorrect: false },
                            { text: "AWS Config", isCorrect: false },
                            { text: "AWS Organizations", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um cliente assina um produto de terceiros pelo AWS Marketplace. Como o custo desse software é cobrado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Consolidado na mesma fatura da AWS, junto com os demais recursos",
                                isCorrect: true,
                            },
                            {
                                text: "Em uma cobrança separada, feita diretamente pelo fornecedor fora da AWS",
                                isCorrect: false,
                            },
                            {
                                text: "Somente por boleto pago antecipadamente ao ISV antes de usar o produto",
                                isCorrect: false,
                            },
                            {
                                text: "Descontado de forma automática dos créditos do plano de suporte da AWS",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa colocar em produção um firewall de terceiros da Palo Alto, já empacotado e pronto para rodar na AWS, no menor tempo possível. Qual é a forma mais direta de obtê-lo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Assinar a AMI (Amazon Machine Image) do produto no AWS Marketplace",
                                isCorrect: true,
                            },
                            {
                                text: "Substituir o requisito pelo AWS Network Firewall, o firewall nativo da AWS",
                                isCorrect: false,
                            },
                            {
                                text: "Abrir um chamado no AWS Support pedindo a instalação do Palo Alto",
                                isCorrect: false,
                            },
                            {
                                text: "Comprar o appliance físico e enviá-lo a um data center da AWS para instalação",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No AWS Marketplace, o que caracteriza o modelo de precificação BYOL (Bring Your Own License, traga sua própria licença)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O cliente reaproveita uma licença que já possui, como Oracle ou Microsoft, e paga apenas pela infraestrutura AWS",
                                isCorrect: true,
                            },
                            {
                                text: "O software é totalmente gratuito, sem custo de licença nem de infraestrutura AWS",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente pode revender a própria licença para outros usuários do Marketplace",
                                isCorrect: false,
                            },
                            {
                                text: "A licença passa a incluir suporte técnico ilimitado da AWS sem custo adicional",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Além de AMIs com software pré-instalado, quais outros tipos de produto costumam ser oferecidos no AWS Marketplace?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Containers, SaaS, modelos de machine learning e datasets",
                                isCorrect: true,
                            },
                            {
                                text: "Servidores físicos entregues no endereço do cliente para montagem local",
                                isCorrect: false,
                            },
                            {
                                text: "Vagas de treinamento presencial para as certificações da AWS",
                                isCorrect: false,
                            },
                            {
                                text: "Créditos promocionais para abater o valor total da fatura da AWS",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "iniciante",
                description:
                    "Trilha de fundamentos da AWS para a certificação Cloud Practitioner (CLF-C02): conceitos, infraestrutura global, computação, armazenamento, bancos de dados, redes, segurança, monitoramento, migração, Well-Architected e faturamento.",
            })
            .returning();
    }

    const jaTem = await db
        .select({ id: modules.id })
        .from(modules)
        .where(and(eq(modules.trailId, trilha.id), eq(modules.title, MARCADOR)));
    if (jaTem.length) {
        console.log("Trilha AWS já está na estrutura nova, nada a fazer.");
        return;
    }

    await db.transaction(async (tx) => {
        const lids = (
            await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.trailId, trilha.id))
        ).map((l) => l.id);
        if (lids.length) {
            const qids = (
                await tx
                    .select({ id: questions.id })
                    .from(questions)
                    .where(inArray(questions.lessonId, lids))
            ).map((q) => q.id);
            if (qids.length) {
                await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qids));
                await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qids));
                await tx.delete(questions).where(inArray(questions.id, qids));
            }
            await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lids));
            await tx.delete(lessons).where(inArray(lessons.id, lids));
        }
        await tx.delete(modules).where(eq(modules.trailId, trilha.id));

        for (let mi = 0; mi < DADOS.length; mi++) {
            const m = DADOS[mi];
            const [mod] = await tx
                .insert(modules)
                .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
                .returning();
            for (let li = 0; li < m.aulas.length; li++) {
                const a = m.aulas[li];
                const [lesson] = await tx
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
                    const [questao] = await tx
                        .insert(questions)
                        .values({
                            lessonId: lesson.id,
                            statement: q.statement,
                            difficulty: q.difficulty,
                            position: qi + 1,
                        })
                        .returning();
                    await tx.insert(questionOptions).values(
                        q.options.map((o, k) => ({
                            questionId: questao.id,
                            text: o.text,
                            isCorrect: o.isCorrect,
                            position: k + 1,
                        })),
                    );
                }
            }
        }
    });
    console.log("Trilha AWS reconstruída: " + DADOS.length + " módulos.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
