// Seed da trilha AZ-900 (Microsoft Azure Fundamentals). Cria a trilha se não existir
// e garante 5 questões por aula (completa as que faltarem). Idempotente e não
// destrutivo: nunca apaga conteúdo nem progresso, só insere o que falta.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-az900.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AZ-900";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { modulo: string; titulo: string; blocks: Bloco[]; questions: Questao[] };

const AULAS: Aula[] = [
    {
        modulo: "Módulo 1 - Conceitos de nuvem",
        titulo: "Conceitos de nuvem",
        blocks: [
            {
                type: "text",
                value: "## O que é computação em nuvem\nComputação em nuvem é alugar recursos de TI pela internet e pagar só pelo que usar. Servidor, armazenamento, banco de dados e rede ficam no data center de um provedor como a Microsoft. Você pede a capacidade, usa pelo tempo que precisar e para de pagar quando desliga.\n\nEsse é o modelo de consumo: nada de comprar hardware para deixar parado. Ligou uma máquina virtual por duas horas, paga duas horas.\n\nAí entra a diferença entre CapEx e OpEx. CapEx é gasto de capital: você investe pesado e adiantado em servidor, refrigeração e licença antes de rodar qualquer coisa, como num data center próprio. OpEx é despesa operacional: você paga o consumo mês a mês, igual conta de luz. A nuvem troca o CapEx pelo OpEx e tira o risco de comprar capacidade que talvez nunca use.",
            },
            {
                type: "table",
                value: '[["Modelo de serviço","Você gerencia","A Microsoft gerencia","Exemplo no Azure"],["IaaS","SO, atualizações, aplicação e dados","Hardware, rede física e virtualização","Máquinas Virtuais do Azure"],["PaaS","Aplicação e dados","SO, runtime e infraestrutura","Azure App Service"],["SaaS","Uso e configurações","A pilha inteira","Microsoft 365"]]',
            },
            {
                type: "text",
                value: "## Modelos de implantação\nOnde a nuvem roda define o modelo de implantação. São três.\n\n- Nuvem pública: tudo fica no provedor e é compartilhado entre vários clientes, cada um isolado do outro. Você não tem hardware próprio. É o Azure no dia a dia, com menor custo e escala imediata.\n- Nuvem privada: infraestrutura dedicada a uma única organização, no data center dela ou hospedada por um terceiro. Mais controle e isolamento, com o custo e a manutenção por conta da empresa.\n- Nuvem híbrida: junta as duas. A empresa mantém parte no ambiente próprio (um sistema legado ou um dado sensível) e usa o Azure para o resto, com os dois lados conectados.\n\nNa prática, muita empresa começa híbrida: mantém o que já tem e move o resto no próprio ritmo.",
            },
            {
                type: "text",
                value: "## Benefícios da nuvem\n- Alta disponibilidade: o serviço continua no ar mesmo com a falha de um componente. O SLA do Azure diz quanto tempo de atividade é garantido.\n- Escalabilidade: aumentar recursos quando a demanda cresce, seja uma VM maior (vertical) ou mais VMs (horizontal).\n- Elasticidade: esse ajuste acontece sozinho. A carga sobe, entram instâncias; a carga cai, elas saem. Você não paga pelo pico o dia inteiro.\n- Confiabilidade: capacidade de se recuperar de falhas, apoiada em regiões espalhadas pelo mundo, como a brazilsouth.\n- Previsibilidade: dá para prever custo e desempenho antes. A Calculadora de Preços do Azure estima a conta e a autoescala segura o desempenho.\n- Segurança: proteção, criptografia e detecção de ameaças já prontas na plataforma.\n- Governança: manter tudo dentro das regras da empresa, com o Azure Policy checando a conformidade e aplicando as políticas automaticamente.",
            },
            {
                type: "quote",
                value: "Responsabilidade compartilhada: a Microsoft cuida da segurança DA nuvem (data center, hardware, rede física); você cuida da segurança NA nuvem (seus dados, identidades no Microsoft Entra ID e configurações de acesso). Quanto mais perto de SaaS, menos sobra para você; em IaaS, a conta é mais sua.",
            },
            {
                type: "code",
                value: "# Criar um grupo de recursos e uma VM na região do Brasil (paga só enquanto roda)\naz group create --name rg-estudos --location brazilsouth\naz vm create --resource-group rg-estudos --name vm-lab --image Ubuntu2204 --size Standard_B1s",
            },
        ],
        questions: [
            {
                statement:
                    "Ao migrar para o Azure, uma empresa deixa de comprar servidores e passa a pagar pelo que consome todo mês. Como se descreve essa mudança no modelo de custo?",
                difficulty: "facil",
                options: [
                    { text: "Sai do CapEx e entra no OpEx", isCorrect: true },
                    { text: "Sai do OpEx e entra no CapEx", isCorrect: false },
                    { text: "Troca IaaS por PaaS", isCorrect: false },
                    { text: "Troca nuvem privada por nuvem pública", isCorrect: false },
                ],
            },
            {
                statement:
                    "Sua equipe hospeda uma API no Azure App Service (PaaS). Qual tarefa ainda é responsabilidade da equipe?",
                difficulty: "facil",
                options: [
                    { text: "Publicar e manter o código da aplicação", isCorrect: true },
                    {
                        text: "Aplicar patches no sistema operacional do servidor",
                        isCorrect: false,
                    },
                    { text: "Trocar o hardware com defeito no data center", isCorrect: false },
                    { text: "Configurar a virtualização dos servidores", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma loja online recebe muito tráfego na Black Friday e quase nada de madrugada. Os recursos aumentam e diminuem sozinhos conforme a demanda. Esse benefício é a:",
                difficulty: "medio",
                options: [
                    { text: "Elasticidade", isCorrect: true },
                    { text: "Escalabilidade", isCorrect: false },
                    { text: "Alta disponibilidade", isCorrect: false },
                    { text: "Confiabilidade", isCorrect: false },
                ],
            },
            {
                statement:
                    "No modelo de responsabilidade compartilhada, qual item continua sendo responsabilidade do cliente em qualquer modelo de serviço (IaaS, PaaS ou SaaS)?",
                difficulty: "medio",
                options: [
                    { text: "Os dados e as identidades de acesso", isCorrect: true },
                    { text: "A segurança física do data center", isCorrect: false },
                    { text: "A manutenção dos equipamentos de rede", isCorrect: false },
                    { text: "A energia e a refrigeração dos servidores", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa mantém parte dos sistemas no data center próprio por conformidade e usa o Azure para o resto, com os dois ambientes conectados. Que modelo de implantação de nuvem isso descreve?",
                difficulty: "facil",
                options: [
                    { text: "Nuvem híbrida", isCorrect: true },
                    { text: "Nuvem pública", isCorrect: false },
                    { text: "Nuvem privada", isCorrect: false },
                    { text: "Multinuvem com dois provedores públicos", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 2 - Componentes de arquitetura do Azure",
        titulo: "Componentes de arquitetura do Azure",
        blocks: [
            {
                type: "text",
                value: "## A infraestrutura física do Azure\nTodo recurso que você cria roda em algum lugar físico. O Azure organiza essa infraestrutura em três níveis: datacenter, região e zona de disponibilidade.\n\nO datacenter é o prédio com servidores, energia, refrigeração e rede. Você nunca aponta um recurso para um datacenter específico; ele é a peça básica que a Microsoft opera.\n\nA região é um conjunto de datacenters próximos, ligados por uma rede regional de baixa latência. É a região que você escolhe ao criar um recurso. brazilsouth fica em São Paulo, eastus na Virgínia. A escolha afeta a latência para seus usuários, o preço e quais serviços estão disponíveis, porque nem todo serviço existe em toda região.\n\nA zona de disponibilidade é um ou mais datacenters isolados dentro da mesma região, cada um com energia, refrigeração e rede próprias. Uma região preparada para zonas tem pelo menos três. Se uma zona cai, as outras continuam de pé. É assim que você protege uma aplicação contra a falha de um datacenter inteiro sem sair da região.",
            },
            {
                type: "text",
                value: "## Pares de região e regiões soberanas\nQuase toda região tem uma parceira dentro da mesma geografia, formando um par. Sempre que possível, as duas ficam a pelo menos 300 milhas (cerca de 480 km) de distância, para que um desastre em uma não derrube a outra. Brazil South é a exceção: seu par fica na South Central US, em outra geografia. O par ajuda na recuperação de desastre. Alguns serviços replicam dados entre as duas regiões, e as atualizações de plataforma da Microsoft chegam a uma região do par por vez, nunca nas duas ao mesmo tempo.\n\nRegiões soberanas são instâncias do Azure separadas da nuvem pública, criadas para atender exigências legais de certos países. Têm operação, portal e cobrança próprios. Os exemplos são o Azure Government, para órgãos do governo dos Estados Unidos, e o Azure operado pela 21Vianet, na China.",
            },
            {
                type: "table",
                value: '[["Nível","O que é","Exemplo","Regra que cai na prova"],["Grupo de gerenciamento","Agrupa várias assinaturas para governança central","mg-empresa","Política e RBAC aqui são herdados por tudo abaixo"],["Assinatura","Limite de cobrança e de acesso, ligado a um locatário do Microsoft Entra ID","sub-producao","Fatura, cotas e limites vivem neste nível"],["Grupo de recursos","Contêiner lógico que agrupa recursos","rg-estudos","Cada recurso fica em um único grupo; apagar o grupo apaga tudo dentro"],["Recurso","A instância que você usa de fato","vm-web01, stestudos01","Sempre criado dentro de um grupo de recursos"]]',
            },
            {
                type: "text",
                value: "## Azure Resource Manager, modelos ARM e Bicep\nO Azure Resource Manager (ARM) é a camada de implantação e gerenciamento do Azure. Clicou no portal ou rodou um comando az? A requisição chega ao ARM, que valida sua identidade, checa as permissões e só então executa. Por isso o resultado é o mesmo em qualquer ferramenta.\n\nEm vez de criar recurso por recurso na mão, você descreve tudo em um arquivo e pede para o ARM montar. Isso é infraestrutura como código, e existem dois formatos principais:\n\n- Modelos ARM são arquivos JSON declarativos. Você escreve o estado desejado e o ARM resolve a ordem e as dependências. São idempotentes: aplicar o mesmo modelo de novo não cria recursos duplicados.\n- Bicep é uma linguagem própria da Microsoft, bem mais enxuta que o JSON, que faz o mesmo trabalho. Ela é convertida (transpilada) para JSON do ARM antes de ser implantada. Na prática, você escreve Bicep e o ARM cuida do resto.",
            },
            {
                type: "quote",
                value: "Portal, Azure CLI, PowerShell, SDK ou chamada REST: toda operação passa pelo Azure Resource Manager. Ele autentica você no Microsoft Entra ID e confere suas permissões (RBAC) antes de criar ou alterar qualquer recurso.",
            },
            {
                type: "code",
                value: "// main.bicep: conta de armazenamento em brazilsouth\nparam location string = 'brazilsouth'\n\nresource sa 'Microsoft.Storage/storageAccounts@2023-01-01' = {\n  name: 'stestudos01'\n  location: location\n  sku: { name: 'Standard_LRS' }\n  kind: 'StorageV2'\n}\n\n# cria o grupo de recursos e implanta o modelo dentro dele\naz group create --name rg-estudos --location brazilsouth\naz deployment group create --resource-group rg-estudos --template-file main.bicep",
            },
        ],
        questions: [
            {
                statement: "O que é uma zona de disponibilidade no Azure?",
                difficulty: "facil",
                options: [
                    {
                        text: "Um ou mais datacenters isolados dentro de uma mesma região, cada um com energia e rede independentes.",
                        isCorrect: true,
                    },
                    {
                        text: "Uma segunda região, em outra geografia, usada só para recuperação de desastre.",
                        isCorrect: false,
                    },
                    {
                        text: "Um contêiner lógico que agrupa recursos de várias assinaturas.",
                        isCorrect: false,
                    },
                    {
                        text: "Uma instância do Azure separada da nuvem pública para atender governos.",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement: "Qual afirmação sobre grupos de recursos está correta?",
                difficulty: "facil",
                options: [
                    {
                        text: "Cada recurso pertence a um único grupo de recursos por vez.",
                        isCorrect: true,
                    },
                    {
                        text: "Um recurso pode pertencer a dois grupos de recursos ao mesmo tempo.",
                        isCorrect: false,
                    },
                    {
                        text: "Todos os recursos de um grupo precisam estar na mesma região do grupo.",
                        isCorrect: false,
                    },
                    {
                        text: "Grupos de recursos podem ser aninhados um dentro do outro.",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement: "Para que serve o par de região (region pair) no Azure?",
                difficulty: "medio",
                options: [
                    {
                        text: "Oferecer recuperação de desastre usando uma segunda região distante da primeira.",
                        isCorrect: true,
                    },
                    {
                        text: "Distribuir a carga de uma aplicação entre as zonas de disponibilidade de uma região.",
                        isCorrect: false,
                    },
                    {
                        text: "Isolar o ambiente da nuvem pública para atender exigências legais de um governo.",
                        isCorrect: false,
                    },
                    {
                        text: "Reduzir a latência aproximando o recurso do usuário final.",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement: "Qual é a relação entre o Bicep e os modelos ARM?",
                difficulty: "medio",
                options: [
                    {
                        text: "O Bicep é convertido (transpilado) para JSON do ARM antes de ser implantado.",
                        isCorrect: true,
                    },
                    { text: "O Bicep substituiu o ARM e não depende mais dele.", isCorrect: false },
                    {
                        text: "Os modelos ARM são escritos em Bicep e depois convertidos para YAML.",
                        isCorrect: false,
                    },
                    {
                        text: "O Bicep serve só para recursos de rede; o ARM, para o resto.",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement:
                    "Uma empresa tem dezenas de assinaturas e quer aplicar uma mesma política de governança a todas de uma vez, de forma centralizada. Qual nível da hierarquia do Azure ela deve usar?",
                difficulty: "medio",
                options: [
                    { text: "Grupo de gerenciamento (management group)", isCorrect: true },
                    { text: "Grupo de recursos", isCorrect: false },
                    { text: "Uma única assinatura", isCorrect: false },
                    { text: "Zona de disponibilidade", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 3 - Computacao",
        titulo: "Computação",
        blocks: [
            {
                type: "text",
                value: "## Como escolher o serviço de computação\nComputação é onde o seu código de fato roda. O Azure oferece várias opções e a diferença entre elas está em quanto você gerencia.\n\nDe um lado ficam as Máquinas Virtuais: você controla o sistema operacional inteiro, mas também cuida de patches, atualizações e configuração. Do outro lado ficam os serviços serverless, como o Azure Functions, em que você entrega só o código e o Azure cuida do resto.\n\nA regra é simples: quanto mais controle você tem, mais responsabilidade carrega. Escolha o serviço pelo problema, não pelo hábito.",
            },
            {
                type: "text",
                value: "## Máquinas Virtuais, escala e disponibilidade\nUma Máquina Virtual (VM) é um servidor completo na nuvem. Você escolhe o sistema operacional, o tamanho (CPU e memória) e instala o que quiser. É o modelo IaaS clássico.\n\nUse VM quando precisar de controle total: migrar um sistema legado no formato lift-and-shift, rodar um software que exige uma versão específica do SO ou ter acesso administrativo à máquina. O custo desse controle é a manutenção, já que os patches e as atualizações do sistema operacional ficam com você.\n\nUma VM sozinha é um ponto único de falha. Dois recursos resolvem isso:\n\n- **Conjuntos de dimensionamento (VM Scale Sets):** um grupo de VMs idênticas que aumenta ou diminui a quantidade de instâncias automaticamente conforme a carga. É assim que você escala na horizontal sem criar cada VM na mão.\n- **Conjuntos de disponibilidade (Availability Sets):** distribuem as VMs em domínios de falha e de atualização diferentes. Se um rack cai ou o Azure faz manutenção, você não perde todas as VMs ao mesmo tempo.",
            },
            {
                type: "code",
                value: "# Cria uma VM Linux no grupo rg-estudos, na regiao brazilsouth\naz vm create \\\n  --resource-group rg-estudos \\\n  --name vm-web-01 \\\n  --image Ubuntu2204 \\\n  --size Standard_B2s \\\n  --admin-username azureuser \\\n  --generate-ssh-keys \\\n  --location brazilsouth",
            },
            {
                type: "text",
                value: "## App Service, contêineres, Functions e Virtual Desktop\nNem todo projeto precisa de uma VM. Quando o foco é o aplicativo, os serviços gerenciados entregam mais com menos trabalho de infraestrutura.\n\n**Azure App Service (PaaS):** hospeda sites, APIs e aplicativos web. Você faz o deploy do código e o Azure cuida do SO, dos patches e da escala. Bom para uma API .NET ou um site Node sem ninguém para administrar servidor.\n\n**Contêineres:** empacotam o app com tudo que ele precisa para rodar igual em qualquer lugar. Há duas opções principais:\n- **Azure Container Instances (ACI):** roda um contêiner avulso, rápido, sem orquestrador. Boa escolha para uma tarefa pontual ou um job isolado.\n- **Azure Kubernetes Service (AKS):** orquestra muitos contêineres em produção, com balanceamento de carga, autorrecuperação e escala automática entre vários nós.\n\n**Azure Functions (serverless):** executa um trecho de código em resposta a um evento, como um arquivo novo no armazenamento ou uma chamada HTTP. Você paga por execução e o serviço escala sozinho, chegando a zero quando não há uso.\n\n**Azure Virtual Desktop:** entrega desktops e aplicativos Windows na nuvem. O usuário acessa a área de trabalho de qualquer lugar e dispositivo, e os dados ficam no Azure, não na máquina local. Útil para trabalho remoto e times terceirizados.",
            },
            {
                type: "table",
                value: '[["Serviço","Modelo","O que você gerencia","Quando usar"],["Máquina Virtual","IaaS","SO, runtime e aplicativo","Controle total, migração lift-and-shift, software legado"],["VM Scale Sets","IaaS","SO e app em VMs idênticas","Escalar VMs automaticamente sob carga variável"],["App Service","PaaS","Só o aplicativo e os dados","Sites e APIs sem cuidar de servidor"],["Container Instances","PaaS","O contêiner","Rodar um contêiner avulso, sem orquestrador"],["AKS","PaaS","Apps e configuração do cluster","Orquestrar muitos contêineres em produção"],["Azure Functions","Serverless","Só o código","Reagir a eventos pagando por execução"]]',
            },
            {
                type: "quote",
                value: "Regra prática na hora de escolher: comece pelo serviço mais gerenciado que resolve o problema. Se App Service ou Functions dão conta, use. Só desça para Máquina Virtual quando precisar mesmo de controle sobre o sistema operacional.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma equipe precisa migrar para o Azure um software antigo que exige uma versão específica do sistema operacional e acesso administrativo completo ao servidor. Qual serviço de computação atende melhor a esse requisito?",
                difficulty: "facil",
                options: [
                    { text: "Máquina Virtual", isCorrect: true },
                    { text: "Azure Functions", isCorrect: false },
                    { text: "Azure App Service", isCorrect: false },
                    { text: "Azure Container Instances", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um site tem picos de acesso imprevisíveis e precisa adicionar ou remover máquinas virtuais idênticas de forma automática conforme a demanda sobe e desce. Qual recurso do Azure atende a isso?",
                difficulty: "medio",
                options: [
                    { text: "Conjunto de dimensionamento (VM Scale Sets)", isCorrect: true },
                    { text: "Conjunto de disponibilidade (Availability Set)", isCorrect: false },
                    { text: "Azure Virtual Desktop", isCorrect: false },
                    { text: "Grupo de recursos", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa quer executar um pequeno trecho de código sempre que um arquivo novo chega ao armazenamento, pagando apenas pelo tempo de execução e sem gerenciar nenhum servidor. Qual serviço é o mais indicado?",
                difficulty: "medio",
                options: [
                    { text: "Azure Functions", isCorrect: true },
                    { text: "Máquina Virtual", isCorrect: false },
                    { text: "Azure Kubernetes Service (AKS)", isCorrect: false },
                    { text: "Conjunto de disponibilidade (Availability Set)", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma organização precisa orquestrar dezenas de contêineres em produção, com balanceamento de carga, autorrecuperação e escalonamento automático entre vários nós. Qual serviço do Azure é o mais adequado?",
                difficulty: "medio",
                options: [
                    { text: "Azure Kubernetes Service (AKS)", isCorrect: true },
                    { text: "Azure Container Instances (ACI)", isCorrect: false },
                    { text: "Azure App Service", isCorrect: false },
                    { text: "Azure Functions", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma equipe quer publicar uma aplicação web e uma API sem gerenciar o sistema operacional nem o servidor, focando apenas no código. Qual serviço de computação é o mais indicado?",
                difficulty: "medio",
                options: [
                    { text: "Azure App Service", isCorrect: true },
                    { text: "Máquina Virtual do Azure", isCorrect: false },
                    { text: "Azure Virtual Desktop", isCorrect: false },
                    { text: "Azure Batch", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 4 - Rede",
        titulo: "Rede",
        blocks: [
            {
                type: "text",
                value: "## Rede virtual e sub-redes\nA VNet é a sua rede privada dentro do Azure. Ela vive em uma região e em uma assinatura, e você define o espaço de endereços dela em CIDR, por exemplo 10.0.0.0/16. Dentro desse espaço você cria sub-redes menores para organizar os recursos: uma snet-web 10.0.1.0/24 para as máquinas virtuais do site e uma snet-db 10.0.2.0/24 para o banco.\n\nRecursos na mesma VNet se falam pelo IP privado, sem passar pela internet. Esse IP privado sai do intervalo da sub-rede e não custa nada. Para expor um recurso para fora, você anexa um IP público a ele, por exemplo a uma VM ou a um balanceador de carga. Sem IP público, a VM não é alcançável direto da internet. Esse IP público é um recurso à parte, com a sua própria configuração e ciclo de vida.\n\nUma VNet não cruza regiões. Se você precisa de rede na brazilsouth e também na eastus, são duas VNets, e aí entra o peering.",
            },
            {
                type: "text",
                value: "## Peering: ligando VNets\nO peering conecta duas VNets para que os recursos conversem por IP privado, como se fossem uma rede só. O tráfego anda pela rede da Microsoft, não pela internet pública, com baixa latência.\n\nDois pontos que caem na prova: o peering não é transitivo, ou seja, se a VNet A fala com a B e a B fala com a C, a A não fala com a C sozinha. E o peering funciona entre regiões diferentes (global peering) e até entre assinaturas ou tenants diferentes.",
            },
            {
                type: "text",
                value: "## Conectar o seu datacenter ao Azure\nO peering conecta VNets entre si. Para ligar a sua rede local ao Azure, há dois caminhos.\n\nO VPN Gateway faz uma conexão Site-to-Site: um túnel IPsec criptografado que sobe pela internet pública entre o seu equipamento local e um gateway na VNet. É barato e rápido de montar, mas a banda e a latência dependem da internet.\n\nO ExpressRoute não passa pela internet. É um circuito privado dedicado, contratado por meio de um provedor de conectividade, que liga o seu ambiente direto ao Azure. Entrega banda alta, latência consistente e SLA melhor. Em troca, custa mais e leva mais tempo para provisionar. Prefira o ExpressRoute quando precisa de desempenho previsível ou quando o tráfego não pode passar pela internet pública, como em cargas com exigência regulatória.",
            },
            {
                type: "table",
                value: '[["Critério","VPN Gateway (Site-to-Site)","ExpressRoute"],["Meio","Internet pública","Circuito privado dedicado"],["Passa pela internet?","Sim, em túnel IPsec criptografado","Não"],["Banda","Menor, limitada pela internet","Alta, até dezenas de Gbps"],["Latência e SLA","Variável","Baixa e consistente, com SLA melhor"],["Custo e implantação","Menor, configura rápido","Maior, exige provedor e mais tempo"],["Quando usar","Conexão econômica ou de backup","Desempenho previsível, grande volume, conformidade"]]',
            },
            {
                type: "text",
                value: "## NSG e Azure DNS\nO NSG (grupo de segurança de rede) é um filtro de tráfego. Ele tem regras de permitir ou negar baseadas em IP de origem e destino, porta, protocolo e direção, seja de entrada ou de saída. Cada regra tem uma prioridade, e a de número menor vence. Você associa o NSG a uma sub-rede ou à interface de rede (NIC) de uma VM. Ele é stateful: se você libera a entrada de uma conexão, a resposta de saída já vai junto. Por padrão, o NSG bloqueia a entrada vinda da internet e libera a saída.\n\nO Azure DNS hospeda os seus domínios públicos na infraestrutura da Microsoft. Você cria uma zona, por exemplo meudominio.com.br, e gerencia os registros (A, CNAME, MX) por ali. Para resolver nomes dentro da VNet, use o DNS fornecido pelo Azure; para os seus nomes privados, as zonas de DNS privado do Azure.",
            },
            {
                type: "quote",
                value: "ExpressRoute não usa a internet pública: é um circuito privado dedicado. O VPN Gateway Site-to-Site faz o oposto, sobe um túnel IPsec criptografado por cima da internet. Essa é a diferença que mais cai na prova.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma empresa criou uma VNet na região brazilsouth e agora precisa de recursos de rede também na região eastus. O que ela deve fazer?",
                difficulty: "facil",
                options: [
                    {
                        text: "Criar uma segunda VNet na eastus, pois uma VNet pertence a uma única região",
                        isCorrect: true,
                    },
                    {
                        text: "Estender a mesma VNet até a eastus alterando o espaço de endereços",
                        isCorrect: false,
                    },
                    {
                        text: "Nada, porque uma VNet já abrange todas as regiões automaticamente",
                        isCorrect: false,
                    },
                    {
                        text: "Converter a VNet em global antes de adicionar a eastus",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement:
                    "Uma instituição financeira precisa conectar o datacenter local ao Azure com banda alta, latência previsível e sem que o tráfego passe pela internet pública. Qual serviço atende a esse requisito?",
                difficulty: "medio",
                options: [
                    { text: "ExpressRoute", isCorrect: true },
                    { text: "VPN Gateway Site-to-Site", isCorrect: false },
                    { text: "Peering de VNet", isCorrect: false },
                    { text: "Azure DNS", isCorrect: false },
                ],
            },
            {
                statement:
                    "Qual serviço do Azure filtra o tráfego de rede permitindo ou negando conexões com base em IP de origem, porta, protocolo e direção?",
                difficulty: "facil",
                options: [
                    { text: "Grupo de segurança de rede (NSG)", isCorrect: true },
                    { text: "Azure DNS", isCorrect: false },
                    { text: "VPN Gateway", isCorrect: false },
                    { text: "Peering de VNet", isCorrect: false },
                ],
            },
            {
                statement:
                    "As VNets A e B estão emparelhadas por peering, e as VNets B e C também. Sobre a comunicação entre A e C, o que está correto?",
                difficulty: "medio",
                options: [
                    {
                        text: "A e C não se comunicam automaticamente, porque o peering não é transitivo",
                        isCorrect: true,
                    },
                    { text: "A e C se comunicam automaticamente passando por B", isCorrect: false },
                    { text: "O peering entre A e B já inclui C por padrão", isCorrect: false },
                    {
                        text: "A e C só se comunicam se estiverem na mesma região",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement:
                    "Uma empresa aceita que o tráfego entre o data center local e o Azure passe pela internet, desde que criptografado, e quer o menor custo. Qual conexão usar?",
                difficulty: "medio",
                options: [
                    { text: "VPN Gateway com conexão site a site", isCorrect: true },
                    { text: "ExpressRoute", isCorrect: false },
                    { text: "Peering de VNet", isCorrect: false },
                    { text: "Azure DNS", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 5 - Armazenamento",
        titulo: "Armazenamento",
        blocks: [
            {
                type: "text",
                value: "## Conta de armazenamento\nA conta de armazenamento é o recurso que guarda tudo: blobs, arquivos, filas e tabelas ficam dentro dela. O nome precisa ser único em todo o Azure, só com letras minúsculas e números, porque vira o endereço do serviço. Uma conta chamada stestudos responde em stestudos.blob.core.windows.net.\n\nDuas escolhas importam na criação: o desempenho (Standard serve para a maioria dos casos, Premium para baixa latência) e a redundância, que decide quantas cópias dos dados existem e onde. Exemplo: criar a conta na região brazilsouth, dentro do grupo de recursos rg-estudos.\n\nO serviço mais usado é o Blob, para dados não estruturados como imagens, vídeos, backups e logs. Os blobs vivem em containers, e cada um tem uma camada de acesso que equilibra o custo de guardar com o custo de ler:",
            },
            {
                type: "table",
                value: '[["Camada","Melhor para","Custo de armazenamento","Custo de acesso","Permanência mínima"],["Hot","Dados acessados com frequência","Alto","Baixo","Nenhuma"],["Cool","Backups recentes e dados pouco acessados","Menor que Hot","Maior que Hot","30 dias"],["Cold","Dados raramente acessados","Menor que Cool","Maior que Cool","90 dias"],["Archive","Retenção longa, quase nunca lido","O mais baixo","O mais alto, com reidratação de horas","180 dias"]]',
            },
            {
                type: "text",
                value: "## Arquivos, filas, tabelas e discos gerenciados\nNem tudo é blob. A mesma conta oferece outros três serviços, e os discos das máquinas virtuais são um recurso à parte:\n\n- Azure Files: compartilhamentos de arquivos gerenciados por SMB e NFS. Você monta o share em VMs na nuvem e em máquinas locais ao mesmo tempo, ótimo para tirar um file server do datacenter sem reescrever a aplicação.\n- Filas (Queue): guarda muitas mensagens pequenas para comunicação assíncrona. Um componente enfileira o trabalho e outro consome no seu ritmo, o que desacopla as partes do sistema.\n- Tabelas (Table): banco NoSQL de chave e valor, sem esquema fixo, barato para dados semiestruturados como catálogos e telemetria.\n- Discos gerenciados: volumes de bloco para as VMs, tanto o disco do sistema quanto os de dados. O Azure cuida da conta por trás e da replicação; você só escolhe o tipo (Ultra Disk, Premium SSD, Standard SSD ou Standard HDD) conforme desempenho e custo.\n\nA redundância definida na conta vale para blobs, arquivos, filas e tabelas. Ela decide o que sobrevive a cada tipo de falha:",
            },
            {
                type: "table",
                value: '[["Opção","Cópias e onde ficam","Protege contra","Quando usar"],["LRS","3 cópias em um único datacenter da região primária","Falhas de hardware: disco, servidor, rack","Menor custo, para dados fáceis de recriar"],["ZRS","3 cópias em 3 zonas de disponibilidade da região","Falha de um datacenter (zona) inteiro","Alta disponibilidade dentro da região"],["GRS","LRS na região primária mais uma cópia LRS em uma região secundária","Desastre que derrube a região primária inteira","Durabilidade contra desastre regional"],["GZRS","ZRS na região primária mais uma cópia LRS na secundária","Falha de zona e desastre regional ao mesmo tempo","Máxima resiliência para dados críticos"]]',
            },
            {
                type: "quote",
                value: "Redundância protege a durabilidade e a disponibilidade dos dados contra falhas de infraestrutura, não contra exclusão acidental ou ransomware. Para esses casos existem versionamento, exclusão temporária (soft delete) e backup. E lembre: LRS não sobrevive à perda do datacenter, então dado crítico pede ZRS, GRS ou GZRS.",
            },
            {
                type: "code",
                value: '# AzCopy: copia dados locais para um container de blobs pela rede (bom para scripts e transferências online)\nazcopy copy "/home/dados/backups" "https://stestudos.blob.core.windows.net/backups" --recursive\n\n# Azure Migrate: central para avaliar e migrar servidores, VMs, bancos e aplicações web para o Azure\n# Azure Data Box: appliance físico enviado pela Microsoft para mover dezenas de TB offline quando a rede não dá conta',
            },
        ],
        questions: [
            {
                statement:
                    "Uma empresa precisa guardar registros fiscais por sete anos. Os arquivos quase nunca serão acessados, o custo de armazenamento deve ser o menor possível e um atraso de horas para recuperar os dados é aceitável. Qual camada de acesso do Blob é a mais indicada?",
                difficulty: "facil",
                options: [
                    { text: "Archive", isCorrect: true },
                    { text: "Hot", isCorrect: false },
                    { text: "Cool", isCorrect: false },
                    { text: "Cold", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um sistema crítico precisa que os dados sobrevivam a um desastre que destrua uma região inteira do Azure e, ao mesmo tempo, tolere a falha de uma zona de disponibilidade na região primária. Qual opção de redundância atende aos dois requisitos?",
                difficulty: "medio",
                options: [
                    { text: "GZRS", isCorrect: true },
                    { text: "LRS", isCorrect: false },
                    { text: "ZRS", isCorrect: false },
                    { text: "GRS", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma equipe quer mover um compartilhamento de arquivos da rede local para o Azure e montá-lo por SMB em várias máquinas virtuais Windows, sem reescrever a aplicação. Qual serviço da conta de armazenamento atende a isso?",
                difficulty: "facil",
                options: [
                    { text: "Azure Files", isCorrect: true },
                    { text: "Armazenamento de Blobs (Blob)", isCorrect: false },
                    { text: "Armazenamento de Tabelas (Table)", isCorrect: false },
                    { text: "Discos gerenciados", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma aplicação de e-commerce precisa separar o recebimento de pedidos do processamento, guardando temporariamente mensagens que serão consumidas de forma assíncrona por outro componente. Qual serviço da conta de armazenamento é o mais indicado?",
                difficulty: "medio",
                options: [
                    { text: "Armazenamento de Filas (Queue)", isCorrect: true },
                    { text: "Armazenamento de Tabelas (Table)", isCorrect: false },
                    { text: "Azure Files", isCorrect: false },
                    { text: "Discos gerenciados", isCorrect: false },
                ],
            },
            {
                statement: "Qual tipo de dado o Azure Blob Storage foi feito para guardar?",
                difficulty: "facil",
                options: [
                    {
                        text: "Dados não estruturados, como imagens, vídeos, backups e logs",
                        isCorrect: true,
                    },
                    {
                        text: "Tabelas relacionais com esquema fixo e chaves estrangeiras",
                        isCorrect: false,
                    },
                    { text: "Compartilhamentos de arquivos montados via SMB", isCorrect: false },
                    { text: "Mensagens em fila trocadas entre componentes", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 6 - Bancos de dados",
        titulo: "Bancos de dados",
        blocks: [
            {
                type: "text",
                value: "## Bancos gerenciados no Azure\nNum banco gerenciado (PaaS) no Azure, a Microsoft cuida de patch, backup, alta disponibilidade e escala. Sobra para você o que interessa: modelar os dados e escrever as consultas. Prefere rodar o banco por conta própria numa máquina virtual (IaaS)? Ganha controle total e herda todo o trabalho de manutenção.\n\nO que muda de um serviço para outro é o tipo de dado e o uso. Estruturado e transacional puxa para o relacional. Flexível, global e com baixa latência puxa para o NoSQL. Histórico e voltado a relatório puxa para o analítico.",
            },
            {
                type: "text",
                value: "## SQL relacional: Database e Managed Instance\nO Azure SQL Database é o relacional PaaS puro. Roda sobre o motor do SQL Server, sempre na versão mais recente, e é a escolha padrão para aplicações novas na nuvem. Você não enxerga o sistema operacional nem a instância, só o banco. A cobrança é por vCore ou DTU, e a camada serverless pausa o banco quando ninguém usa e cobra só pelo tempo ativo. Cai bem num ambiente de dev/teste, digamos um banco no grupo rg-estudos que fica parado à noite e nos fins de semana.\n\nO Azure SQL Managed Instance também é PaaS, mas entrega quase 100% de compatibilidade com o SQL Server local: SQL Server Agent, consultas entre bancos e outros recursos de instância. É a rota natural para levar um sistema antigo para a nuvem (lift and shift) mexendo o mínimo no código.\n\nPrecisa de controle total, de uma versão específica ou de algo que o gerenciado não cobre? Instale o SQL Server numa VM (IaaS) e assuma o sistema operacional. E quando o app já é open source, o Azure tem o Azure Database for PostgreSQL e o Azure Database for MySQL: os mesmos motores de sempre, agora gerenciados pela plataforma.",
            },
            {
                type: "table",
                value: '[["Serviço","Modelo","Base","Melhor para"],["Azure SQL Database","PaaS","Motor do SQL Server, sempre atualizado","Apps novos na nuvem"],["Azure SQL Managed Instance","PaaS","Quase 100% do SQL Server local","Migrar sistemas antigos com poucas mudanças"],["SQL Server na VM","IaaS","SQL Server completo, você gerencia o SO","Controle total e versões específicas"],["Azure Database for PostgreSQL / MySQL","PaaS","PostgreSQL e MySQL open source","Apps open source e times que já usam esses bancos"]]',
            },
            {
                type: "text",
                value: "## NoSQL com o Azure Cosmos DB\nO Azure Cosmos DB é o banco NoSQL totalmente gerenciado do Azure. Dois pontos definem o serviço: distribuição global, com replicação dos dados em várias regiões em poucos cliques (por exemplo, brazilsouth mais uma região na Europa para clientes de lá), e latência de poucos milissegundos, com escala horizontal automática conforme o tráfego cresce.\n\nEle fala várias APIs, então você usa a que já conhece: NoSQL (a nativa), MongoDB, Cassandra, Gremlin para grafos e Table. Um app que já roda em MongoDB migra sem reescrever a camada de acesso.\n\nOnde ele se encaixa bem: telemetria de dispositivos IoT, catálogo e carrinho de e-commerce, perfis e placares de jogos, personalização e qualquer aplicação em tempo real com usuários espalhados pelo mundo. O ponto em comum é o dado semiestruturado (JSON), que muda de formato com frequência e chega em grande volume.",
            },
            {
                type: "text",
                value: "## Synapse Analytics e como escolher\nO Azure Synapse Analytics é a plataforma de análise e data warehouse do Azure. Reúne consultas SQL e Apache Spark no mesmo lugar, conversa com o Data Lake e entrega o resultado para ferramentas como o Power BI. O foco é analisar grandes volumes de dados históricos (OLAP), não responder ao clique do usuário em tempo real (OLTP). Esse trabalho do dia a dia fica com o Azure SQL Database ou o Azure Cosmos DB.\n\nRelacional ou NoSQL? Olhe para o formato dos dados. Schema estável, transações que não podem falhar, joins e integridade referencial (pense em pedidos, financeiro, cadastro) pedem relacional. Dado que muda de formato o tempo todo, em alto volume e com baixa latência no mundo inteiro, pede NoSQL. Quando o objetivo deixa de ser operar e passa a ser cruzar tudo para relatório, entra o Synapse, alimentado pelos dois.",
            },
            {
                type: "quote",
                value: "Regra rápida: schema fixo com transações e joins vai de relacional (Azure SQL). Dado flexível com escala global e baixa latência vai de NoSQL (Azure Cosmos DB). Análise sobre montanhas de dados históricos vai de Azure Synapse Analytics.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma empresa quer migrar um sistema que roda em SQL Server local para o Azure mantendo quase toda a compatibilidade, incluindo o SQL Server Agent, e mexendo o mínimo possível no código. Qual serviço é o mais indicado?",
                difficulty: "facil",
                options: [
                    { text: "Azure SQL Managed Instance", isCorrect: true },
                    { text: "Azure SQL Database", isCorrect: false },
                    { text: "Azure Cosmos DB", isCorrect: false },
                    { text: "Azure Database for PostgreSQL", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um e-commerce precisa de um banco NoSQL com distribuição global, latência de poucos milissegundos e suporte a documentos JSON no catálogo, atendendo usuários em vários países. Qual serviço atende melhor?",
                difficulty: "facil",
                options: [
                    { text: "Azure Cosmos DB", isCorrect: true },
                    { text: "Azure SQL Database", isCorrect: false },
                    { text: "Azure Synapse Analytics", isCorrect: false },
                    { text: "SQL Server em uma máquina virtual", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma equipe precisa rodar consultas analíticas sobre anos de dados de vendas para gerar relatórios no Power BI, sem impactar o banco que atende as transações do dia a dia. Qual serviço do Azure é o indicado?",
                difficulty: "medio",
                options: [
                    { text: "Azure Synapse Analytics", isCorrect: true },
                    { text: "Azure Cosmos DB", isCorrect: false },
                    { text: "Azure SQL Managed Instance", isCorrect: false },
                    { text: "Azure Database for MySQL", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma startup vai criar uma aplicação nova na nuvem e quer um banco relacional totalmente gerenciado, sem administrar sistema operacional nem instância, com a opção de reduzir custos pausando o banco quando ele fica ocioso. Qual serviço atende melhor?",
                difficulty: "medio",
                options: [
                    { text: "Azure SQL Database", isCorrect: true },
                    { text: "Azure SQL Managed Instance", isCorrect: false },
                    { text: "SQL Server em uma máquina virtual", isCorrect: false },
                    { text: "Azure Cosmos DB", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa quer rodar no Azure um banco de dados PostgreSQL totalmente gerenciado, sem administrar o servidor nem aplicar patches. Qual serviço usar?",
                difficulty: "medio",
                options: [
                    { text: "Azure Database for PostgreSQL", isCorrect: true },
                    { text: "Azure SQL Database", isCorrect: false },
                    { text: "Azure Cosmos DB", isCorrect: false },
                    { text: "Azure Synapse Analytics", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 7 - Identidade e seguranca",
        titulo: "Identidade e segurança",
        blocks: [
            {
                type: "text",
                value: "## Identidade e o Microsoft Entra ID\nNa nuvem, a identidade é o novo perímetro. Não adianta blindar só a rede: quem tem a credencial certa entra de qualquer lugar. Por isso o controle de acesso começa em quem está pedindo para entrar.\n\nO Microsoft Entra ID (o antigo Azure Active Directory) é o serviço de identidade da Microsoft na nuvem. É nele que ficam os usuários, os grupos, os aplicativos e as regras de acesso da organização. Todo login no portal.azure.com, no Microsoft 365 ou num app integrado passa por ele.\n\nDois conceitos andam juntos e vivem sendo confundidos:\n\n- **Autenticação (AuthN)** prova que você é quem diz ser. É o login: usuário, senha e, de preferência, um segundo fator.\n- **Autorização (AuthZ)** define o que você pode fazer depois de autenticado: ler um recurso, criar uma VM, apagar um grupo de recursos.\n\nVocê faz login no portal e isso é autenticação. Ao tentar excluir a máquina virtual vm-web01, o Azure verifica se você tem permissão para aquela ação, e isso é autorização. Passar no login não significa que você pode mexer em tudo.",
            },
            {
                type: "table",
                value: '[["Aspecto","Autenticação (AuthN)","Autorização (AuthZ)"],["Pergunta que responde","Você é quem diz ser?","O que você pode fazer?"],["Quando acontece","No login, antes de tudo","Depois do login, a cada ação"],["Quem cuida no Azure","Microsoft Entra ID (senha, MFA, SSO)","Azure RBAC (funções e escopo)"],["Quando dá errado","Você nem entra","Você entra, mas leva acesso negado"]]',
            },
            {
                type: "text",
                value: "## MFA, SSO e Acesso Condicional\nSenha sozinha é frágil. A autenticação multifator (MFA) exige pelo menos dois fatores de tipos diferentes:\n\n- algo que você sabe (senha ou PIN);\n- algo que você tem (o app Microsoft Authenticator, um token físico, o celular);\n- algo que você é (biometria, como digital ou reconhecimento facial).\n\nMesmo que a senha vaze, sem o segundo fator o atacante não entra.\n\nO logon único (SSO) resolve o outro lado. Você se autentica uma vez no Entra ID e acessa vários aplicativos sem digitar senha de novo em cada um. Menos senhas para lembrar e menos senha fraca reaproveitada.\n\nO Acesso Condicional é onde você escreve as regras. Ele avalia sinais no momento do login (usuário, grupo, dispositivo, localização, risco da sessão) e decide entre liberar, bloquear ou pedir algo a mais. É a lógica se... então:\n\n- Se o usuário tem função de administrador, então exija MFA.\n- Se o login vem de fora do Brasil, então bloqueie.\n- Se o dispositivo não está em conformidade, então negue o acesso ao Microsoft 365.\n\nDetalhe que cai em prova: o MFA básico vem nos padrões de segurança (Security Defaults) e funciona até no plano gratuito do Entra ID. As políticas de Acesso Condicional é que precisam de uma licença Microsoft Entra ID P1 ou P2.",
            },
            {
                type: "quote",
                value: "Regra de ouro da autorização: menor privilégio. Comece atribuindo a função Leitor e só aumente a permissão quando a pessoa realmente precisar. É bem mais fácil liberar depois do que descobrir tarde que alguém tinha acesso demais.",
            },
            {
                type: "text",
                value: "## Azure RBAC: funções e escopo\nO controle de acesso baseado em função (Azure RBAC) é como o Azure faz autorização nos recursos. Toda atribuição de função responde a três perguntas:\n\n- **Quem?** O usuário, grupo, entidade de serviço ou identidade gerenciada que vai receber o acesso.\n- **Qual função?** O conjunto de permissões. As mais comuns são:\n  - **Leitor**: apenas visualiza os recursos.\n  - **Colaborador**: cria e gerencia recursos, mas não concede acesso a outras pessoas.\n  - **Proprietário**: faz tudo, inclusive dar permissão para os outros.\n  - **Administrador de Acesso de Usuário**: mexe só nas atribuições de acesso.\n- **Onde?** O escopo em que essa função vale.\n\nO escopo segue uma hierarquia, e a permissão é herdada de cima para baixo:\n\ngrupo de gerenciamento > assinatura > grupo de recursos > recurso\n\nSe você der Colaborador para alguém no grupo de recursos rg-estudos, essa pessoa gerencia tudo que estiver dentro dele (a VM, o banco de dados, a rede), e nada fora dele. Atribuir Colaborador na assinatura inteira seria exagero se a pessoa cuida de um único projeto. Sempre o menor escopo que resolve.",
            },
            {
                type: "text",
                value: "## Zero Trust, defesa em profundidade e Microsoft Defender for Cloud\nO modelo Zero Trust parte de uma ideia direta: nunca confie, sempre verifique. Ninguém ganha acesso só por estar dentro da rede da empresa. Ele se apoia em três princípios:\n\n- **Verificar explicitamente**: autentique e autorize usando todos os sinais disponíveis (identidade, dispositivo, localização, risco). É o papel do Acesso Condicional.\n- **Usar o menor privilégio**: dê apenas o acesso necessário, pelo tempo necessário. É o papel do RBAC.\n- **Presumir a violação**: trabalhe como se o atacante já estivesse dentro. Segmente a rede, monitore tudo e limite o alcance de cada conta.\n\nA defesa em profundidade reforça essa ideia com camadas de proteção empilhadas. Se uma camada falha, a próxima segura o golpe. As camadas vão da segurança física do data center, passando por identidade, perímetro, rede, computação e aplicação, até os dados no centro. Você nunca depende de uma barreira só.\n\nO Microsoft Defender for Cloud cuida da postura de segurança do seu ambiente Azure. Ele entrega:\n\n- a Pontuação de Segurança (Secure Score), que mede o quanto o ambiente está protegido e aponta o que melhorar;\n- recomendações de configuração, como avisar que uma porta de gerenciamento está aberta para a internet ou que falta criptografia num disco;\n- proteção contra ameaças nas cargas de trabalho (máquinas virtuais, bancos de dados, containers, armazenamento), com alertas quando algo suspeito acontece.\n\nNa prática esses serviços trabalham juntos: o Entra ID controla quem entra, o Acesso Condicional decide sob quais condições, o RBAC define o que cada um faz e o Defender for Cloud vigia o ambiente inteiro.",
            },
        ],
        questions: [
            {
                statement:
                    "Um usuário faz login no portal do Azure com a senha e aprova a notificação no Microsoft Authenticator. Esse ato de comprovar que ele é quem diz ser corresponde a qual conceito?",
                difficulty: "facil",
                options: [
                    { text: "Autenticação", isCorrect: true },
                    { text: "Autorização", isCorrect: false },
                    { text: "Criptografia", isCorrect: false },
                    { text: "Auditoria", isCorrect: false },
                ],
            },
            {
                statement:
                    "Qual serviço da Microsoft armazena as identidades (usuários, grupos e aplicativos) e realiza a autenticação na nuvem, tendo substituído o nome Azure Active Directory?",
                difficulty: "facil",
                options: [
                    { text: "Microsoft Entra ID", isCorrect: true },
                    { text: "Azure RBAC", isCorrect: false },
                    { text: "Microsoft Defender for Cloud", isCorrect: false },
                    { text: "Azure Key Vault", isCorrect: false },
                ],
            },
            {
                statement:
                    "A equipe de segurança quer exigir MFA quando um administrador fizer login e bloquear acessos vindos de fora do Brasil. Qual recurso do Microsoft Entra ID cria essas regras do tipo se... então com base em sinais do login?",
                difficulty: "medio",
                options: [
                    { text: "Acesso Condicional", isCorrect: true },
                    { text: "Logon único (SSO)", isCorrect: false },
                    { text: "Azure Policy", isCorrect: false },
                    { text: "Grupo de segurança de rede (NSG)", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma analista vai apenas visualizar os recursos do grupo de recursos rg-estudos, sem alterar nada. Seguindo o princípio do menor privilégio, qual atribuição RBAC é a mais adequada?",
                difficulty: "medio",
                options: [
                    {
                        text: "Função Leitor no escopo do grupo de recursos rg-estudos",
                        isCorrect: true,
                    },
                    { text: "Função Colaborador no escopo da assinatura", isCorrect: false },
                    {
                        text: "Função Proprietário no escopo do grupo de recursos rg-estudos",
                        isCorrect: false,
                    },
                    { text: "Função Leitor no escopo da assinatura inteira", isCorrect: false },
                ],
            },
            {
                statement:
                    "Qual serviço avalia continuamente a postura de segurança do ambiente Azure, dá uma pontuação de segurança (Secure Score) e recomenda melhorias de configuração?",
                difficulty: "medio",
                options: [
                    { text: "Microsoft Defender for Cloud", isCorrect: true },
                    { text: "Microsoft Entra ID", isCorrect: false },
                    { text: "Azure Policy", isCorrect: false },
                    { text: "Azure Monitor", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 8 - Governanca e conformidade",
        titulo: "Governança e conformidade",
        blocks: [
            {
                type: "text",
                value: "## Governança e conformidade\nGovernança é manter o controle do ambiente à medida que ele cresce. Conformidade é conseguir provar que você segue normas e leis, como ISO 27001, LGPD ou PCI DSS. No Azure, a principal ferramenta de governança é o Azure Policy.\n\nO Azure Policy compara cada recurso com as regras que você define e reage quando algo sai do padrão. Toda regra tem um efeito. Os que mais caem na prova:\n- **Deny**: barra a criação do recurso que viola a regra, como uma VM fora de brazilsouth.\n- **Audit**: deixa criar, mas marca o recurso como não conforme no relatório.\n- **DeployIfNotExists**: implanta o que faltava, por exemplo as configurações de diagnóstico de uma conta de armazenamento.\n\nNão confunda com o RBAC: o Policy define como o recurso pode ser configurado; o RBAC define quem pode mexer nele. Uma iniciativa (initiative) é um grupo de políticas com um objetivo em comum. Em vez de atribuir 30 políticas soltas, você junta todas numa iniciativa de conformidade ISO 27001 e atribui de uma vez só.",
            },
            {
                type: "code",
                value: '# Impedir a criacao de recursos fora de brazilsouth no rg-estudos\naz policy assignment create \\\n  --name apenas-brazilsouth \\\n  --scope /subscriptions/SEU_ID/resourceGroups/rg-estudos \\\n  --policy e56962a6-4747-49cd-b67b-bf8b01975c4c \\\n  --params \'{"listOfAllowedLocations": {"value": ["brazilsouth"]}}\'\n\n# e56962a6... e a definicao interna \'Locais permitidos\', efeito Deny',
            },
            {
                type: "text",
                value: "## Bloqueios, Blueprints e tags\nBloqueios (locks) protegem recursos contra mudanças por engano. São dois tipos: **CanNotDelete**, que deixa editar mas não deixa excluir, e **ReadOnly**, que só deixa ler, ou seja, não dá para alterar nem excluir. Você aplica no recurso, no grupo de recursos ou na assinatura, e o bloqueio desce para tudo que está abaixo. E tem um detalhe que pega muita gente: o bloqueio vale para todo mundo, até para quem é Owner. Um CanNotDelete no rg-estudos evita que alguém apague o grupo inteiro sem querer.\n\nAzure Blueprints é um modelo repetível de um ambiente inteiro. Ele empacota grupos de recursos, políticas, atribuições de RBAC e modelos ARM num pacote só, para que toda nova assinatura de projeto já nasça dentro dos padrões da empresa. A Microsoft está aposentando o Blueprints e recomenda Template Specs e deployment stacks no lugar. Ele já saiu das provas mais novas, mas ainda aparece em material antigo, então reconheça o nome.\n\nTags são pares de chave e valor colados nos recursos, como ambiente=producao ou centrodecusto=marketing. Servem para organizar e, principalmente, para filtrar e ratear custos no Cost Management. Aqui mora uma pegadinha: tags não são herdadas sozinhas. Um recurso não pega a tag do grupo de recursos automaticamente, mas você pode forçar isso com uma política.",
            },
            {
                type: "text",
                value: "## Purview e Service Trust Portal\nMicrosoft Purview cuida da governança dos dados. Ele varre e cataloga onde seus dados estão (no Azure, no Microsoft 365, em outras nuvens e até no ambiente local), classifica o que é sensível, como CPF e número de cartão, e mostra a linhagem, ou seja, por onde o dado passou. O foco dele são os dados, não a infraestrutura.\n\nService Trust Portal é um site da própria Microsoft (servicetrust.microsoft.com) com os relatórios de auditoria e as certificações dela: ISO, SOC 1, SOC 2, laudos e documentos de conformidade. Você entra ali quando precisa provar que os data centers da Microsoft seguem determinada norma. Não se configura nada nele; é de onde você baixa a papelada de conformidade da Microsoft.\n\nA diferença que cai na prova: o Purview olha os seus dados; o Service Trust Portal guarda os laudos da Microsoft.",
            },
            {
                type: "table",
                value: '[["Ferramenta","Para que serve","Exemplo"],["Azure Policy","Impõe e audita regras de configuração nos recursos","Negar recurso fora de brazilsouth"],["Iniciativa","Agrupa várias políticas sob um objetivo","Pacote de conformidade ISO 27001"],["Bloqueio (lock)","Impede exclusão ou alteração acidental","CanNotDelete no rg-estudos"],["Azure Blueprints","Modelo repetível de um ambiente inteiro (em aposentadoria)","Nova assinatura já com RGs e políticas"],["Tags","Rotulam recursos para organizar e ratear custo","centrodecusto=marketing"],["Microsoft Purview","Governa e classifica os dados da empresa","Achar onde há CPF armazenado"],["Service Trust Portal","Relatórios de auditoria e certificações da Microsoft","Baixar o laudo SOC 2"]]',
            },
            {
                type: "quote",
                value: "Não confunda os três: o RBAC diz quem pode agir, o Azure Policy diz como o recurso pode ser configurado e o bloqueio impede exclusão ou alteração acidental. Um lock CanNotDelete barra até o dono da assinatura.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma empresa quer impedir que qualquer recurso seja criado fora da região brazilsouth. Qual serviço impõe essa regra?",
                difficulty: "facil",
                options: [
                    { text: "Azure Policy", isCorrect: true },
                    { text: "Azure Blueprints", isCorrect: false },
                    { text: "Um bloqueio CanNotDelete", isCorrect: false },
                    { text: "RBAC (controle de acesso baseado em função)", isCorrect: false },
                ],
            },
            {
                statement:
                    "Você precisa garantir que ninguém, nem mesmo um usuário com papel de Owner, exclua o grupo de recursos rg-estudos por engano. O que você aplica?",
                difficulty: "medio",
                options: [
                    { text: "Um bloqueio CanNotDelete", isCorrect: true },
                    { text: "Uma tag protegido=sim", isCorrect: false },
                    { text: "Uma política com efeito Audit", isCorrect: false },
                    { text: "Uma atribuição de RBAC de Leitor", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa quer separar os custos do Azure por departamento no Cost Management, sem criar novas assinaturas. O que você usa para rotular os recursos e permitir esse rateio?",
                difficulty: "facil",
                options: [
                    { text: "Tags", isCorrect: true },
                    { text: "Bloqueios de recurso", isCorrect: false },
                    { text: "Grupos de gerenciamento", isCorrect: false },
                    { text: "Iniciativas do Azure Policy", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um auditor externo pede os relatórios de certificação ISO e SOC dos data centers da Microsoft. Onde você obtém esses documentos?",
                difficulty: "medio",
                options: [
                    { text: "No Service Trust Portal", isCorrect: true },
                    { text: "No Microsoft Purview", isCorrect: false },
                    { text: "No Azure Policy", isCorrect: false },
                    { text: "No Azure Monitor", isCorrect: false },
                ],
            },
            {
                statement:
                    "Como se chama o agrupamento de várias definições de Azure Policy atribuídas em conjunto para atingir um objetivo maior de conformidade?",
                difficulty: "medio",
                options: [
                    { text: "Iniciativa (conjunto de políticas)", isCorrect: true },
                    { text: "Grupo de recursos", isCorrect: false },
                    { text: "Bloqueio de recurso", isCorrect: false },
                    { text: "Grupo de gerenciamento", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 9 - Custos e SLA",
        titulo: "Custos e SLA",
        blocks: [
            {
                type: "text",
                value: "## O que afeta o custo\nO custo no Azure vem do consumo, mas alguns fatores pesam mais que outros. Conhecer esses fatores evita susto na fatura.\n\n- Tipo de recurso: uma VM da série D custa diferente de uma série B, e um disco SSD Premium sai mais caro que um HDD Standard.\n- Região: o mesmo recurso tem preço diferente em brazilsouth e em eastus. A região mais perto nem sempre é a mais barata.\n- Tráfego de saída (egress): dados que entram no Azure quase sempre são grátis; dados que saem para a internet ou passam de uma região para outra são cobrados.\n- Tipo de assinatura e Marketplace: ofertas gratuitas, licenças e produtos de terceiros mudam a conta.\n\nDá para gastar menos sem trocar de serviço. Reservas de 1 ou 3 anos (Azure Reservations) e o plano de economia para computação (Azure savings plan) trocam compromisso por desconto. VMs Spot atendem carga que aceita interrupção. O Benefício Híbrido do Azure reaproveita licenças de Windows Server e SQL Server que você já paga. E o básico continua valendo: desligue o que não usa e ajuste o tamanho do recurso (right-sizing).",
            },
            {
                type: "table",
                value: '[["Ferramenta","Para que serve","Quando usar"],["Calculadora de Preços","Estima o custo de recursos Azure que você ainda vai criar","Orçar uma solução nova antes de provisionar"],["Calculadora de TCO","Compara o custo do ambiente local com o equivalente no Azure","Justificar a migração e mostrar a economia de sair do data center"],["Microsoft Cost Management","Acompanha e controla o gasto real do que já está rodando","Depois da implantação: analisar custo, criar orçamentos e alertas"]]',
            },
            {
                type: "text",
                value: "## Cost Management e tags\nA Calculadora de Preços projeta o gasto futuro. O Microsoft Cost Management mostra o gasto real: você analisa o custo por serviço, cria orçamentos (budgets) e recebe alertas por e-mail quando o valor passa de um limite. As recomendações de economia aparecem ao lado, geradas pelo Azure Advisor.\n\nPara saber quanto cada projeto ou time consome, use tags. Tag é um par nome-valor colado em recursos e grupos de recursos, como `ambiente=producao`, `centrocusto=marketing` ou `projeto=estudos`. No Cost Management você filtra e agrupa a fatura por essas tags e vê o gasto de cada departamento.\n\nUm detalhe que cai em prova: recurso não herda a tag do grupo de recursos automaticamente. Se você precisa da mesma tag em tudo, exija com o Azure Policy.",
            },
            {
                type: "text",
                value: "## SLA e ciclo de vida\nO SLA (Acordo de Nível de Serviço) é o compromisso formal da Microsoft com a disponibilidade de um serviço, escrito como porcentagem de tempo no ar. 99,9% parece bastante, mas dá cerca de 8h45 fora do ar por ano. Subir para 99,99% derruba isso para cerca de 52 minutos por ano. Se a Microsoft não cumpre o SLA, você pode ter direito a créditos de serviço na fatura.\n\nNem todo serviço tem SLA. Camadas gratuitas e serviços em preview não têm SLA com respaldo financeiro.\n\nIsso se liga ao ciclo de vida do serviço: primeiro preview privado, depois preview público e só então disponibilidade geral (GA). Recurso em preview pode mudar, falhar ou sair do ar sem aviso e não tem suporte completo. Serve para testar, não para produção.",
            },
            {
                type: "code",
                value: "# SLA composto: servicos em serie multiplicam os SLAs\n# App web no Azure App Service que depende do Azure SQL Database\n\nApp Service   = 99,95%  ->  0,9995\nAzure SQL     = 99,99%  ->  0,9999\n\nSLA composto  = 0,9995 x 0,9999 = 0,9994 = 99,94%\n\n# Cada dependencia em serie so puxa o total para baixo.\n# Para subir, adicione redundancia em paralelo, nao mais servicos em serie.",
            },
            {
                type: "quote",
                value: "Serviços em série multiplicam os SLAs, então o total fica sempre abaixo do serviço mais fraco da cadeia. Quanto menos peças uma requisição precisa atravessar, maior a disponibilidade.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma equipe já decidiu usar o Azure e quer estimar o custo mensal de uma solução nova, com máquinas virtuais e um banco de dados, antes de criar qualquer recurso. Qual ferramenta é a indicada?",
                difficulty: "facil",
                options: [
                    { text: "Calculadora de Preços", isCorrect: true },
                    { text: "Calculadora de TCO", isCorrect: false },
                    { text: "Microsoft Cost Management", isCorrect: false },
                    { text: "Azure Advisor", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um gestor precisa justificar a saída do data center local comparando o custo da infraestrutura on-premises atual com o custo equivalente no Azure. Qual ferramenta atende diretamente a esse objetivo?",
                difficulty: "medio",
                options: [
                    { text: "Calculadora de TCO", isCorrect: true },
                    { text: "Calculadora de Preços", isCorrect: false },
                    { text: "Microsoft Cost Management", isCorrect: false },
                    { text: "Azure Monitor", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um aplicativo no Azure App Service (SLA de 99,95%) depende do Azure SQL Database (SLA de 99,99%), com os dois serviços em série. Qual é o SLA composto aproximado da solução?",
                difficulty: "medio",
                options: [
                    { text: "99,94%", isCorrect: true },
                    { text: "99,95%", isCorrect: false },
                    { text: "99,99%", isCorrect: false },
                    { text: "99,97%", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa quer acompanhar no Microsoft Cost Management quanto cada departamento gasta e agrupar a fatura por área. O que deve ser aplicado aos recursos para permitir esse agrupamento?",
                difficulty: "facil",
                options: [
                    { text: "Tags (pares nome-valor)", isCorrect: true },
                    { text: "Zonas de disponibilidade", isCorrect: false },
                    { text: "Bloqueios de recurso (resource locks)", isCorrect: false },
                    { text: "Grupos de gerenciamento", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma carga de trabalho roda de forma estável o ano inteiro. A empresa quer reduzir o custo assumindo um compromisso de 1 ou 3 anos. Qual opção usar?",
                difficulty: "medio",
                options: [
                    { text: "Reservas do Azure (Azure Reservations)", isCorrect: true },
                    { text: "Máquinas virtuais Spot", isCorrect: false },
                    { text: "Pagamento conforme o uso (pay-as-you-go)", isCorrect: false },
                    { text: "Camada gratuita", isCorrect: false },
                ],
            },
        ],
    },
    {
        modulo: "Módulo 10 - Ferramentas e monitoramento",
        titulo: "Ferramentas e monitoramento",
        blocks: [
            {
                type: "text",
                value: "## Como você fala com o Azure\nToda ação no Azure passa pelo Azure Resource Manager (ARM). O que muda é só a porta de entrada. Você clica no Portal do Azure, digita comandos no Azure CLI ou no Azure PowerShell, ou abre um terminal já pronto no navegador com o Azure Cloud Shell. No fim, o resultado é o mesmo: criar, alterar e apagar recursos.\n\nO Portal é bom para investigar, ver gráficos e ajustar uma coisa ou outra. Quando a mesma tarefa se repete dez vezes, ou você quer versionar a criação da infraestrutura, a linha de comando ganha: você salva num script e roda de novo quando precisar.\n\nO Azure Arc é um caso à parte. Ele estende o painel do Azure para o que fica fora dele: servidores no seu data center, VMs em outra nuvem, clusters Kubernetes. Você comanda tudo do mesmo lugar e aplica as mesmas políticas.",
            },
            {
                type: "table",
                value: '[["Ferramenta","O que é","Quando usar"],["Portal do Azure","Interface gráfica no navegador","Investigar, ver painéis e fazer tarefas pontuais"],["Azure Cloud Shell","Terminal Bash ou PowerShell no navegador, já autenticado","Rodar comandos sem instalar nada na máquina"],["Azure CLI","Comandos az no seu terminal","Automação e scripts, com sintaxe enxuta"],["Azure PowerShell","Cmdlets Az no PowerShell","Automação em ambientes que já usam PowerShell"],["Azure Arc","Estende o controle do Azure para fora dele","Gerenciar servidores locais e outras nuvens no mesmo painel"]]',
            },
            {
                type: "code",
                value: "# Cria um grupo de recursos e uma VM Linux na região de São Paulo (brazilsouth)\naz group create --name rg-estudos --location brazilsouth\n\naz vm create \\\n  --resource-group rg-estudos \\\n  --name vm-web \\\n  --image Ubuntu2204 \\\n  --admin-username azureuser \\\n  --generate-ssh-keys",
            },
            {
                type: "text",
                value: "## Recomendações e saúde dos serviços\nO Azure Advisor analisa os seus recursos e sugere melhorias em cinco frentes: custo, segurança, confiabilidade, desempenho e excelência operacional. Ele aponta, por exemplo, uma VM superdimensionada que dá para reduzir e pagar menos, ou um recurso sem backup configurado.\n\nPara saber se algo caiu, dois lugares vivem sendo confundidos:\n\n- Azure Status (status.azure.com): página pública e global. Mostra incidentes que afetam regiões ou serviços inteiros, para qualquer cliente.\n- Azure Service Health: visão personalizada, dentro do Portal. Só fala do que atinge as suas assinaturas e recursos, incluindo manutenções programadas e a saúde de recursos específicos (Resource Health).",
            },
            {
                type: "quote",
                value: "Na prova: Azure Status é o painel público de tudo; Azure Service Health mostra o que impacta as suas assinaturas. Se a questão citar 'meus recursos' ou 'manutenção programada', a resposta é Service Health.",
            },
            {
                type: "text",
                value: "## Azure Monitor, Log Analytics e Application Insights\nO Azure Monitor é o guarda-chuva de observabilidade do Azure. Ele coleta dois tipos de dado: métricas (números ao longo do tempo, como uso de CPU) e logs (eventos e registros detalhados). Com isso você monta painéis, cria alertas e dispara ações automáticas.\n\nAbaixo dele ficam duas peças que caem na prova:\n\n- Log Analytics: onde os logs ficam guardados e onde você roda consultas em KQL (Kusto Query Language).\n- Application Insights: monitoramento voltado para aplicações. Mede tempo de resposta, taxa de erro e o caminho de cada requisição dentro do código.",
            },
        ],
        questions: [
            {
                statement:
                    "Qual ferramenta mostra apenas os incidentes e as manutenções programadas que afetam as suas próprias assinaturas e recursos?",
                difficulty: "facil",
                options: [
                    { text: "Azure Service Health", isCorrect: true },
                    { text: "Azure Status", isCorrect: false },
                    { text: "Azure Advisor", isCorrect: false },
                    { text: "Azure Monitor", isCorrect: false },
                ],
            },
            {
                statement:
                    "Você quer rodar comandos az direto do navegador, sem instalar nada na sua máquina e já autenticado na conta. Qual opção usar?",
                difficulty: "facil",
                options: [
                    { text: "Azure Cloud Shell", isCorrect: true },
                    { text: "Azure CLI instalado no seu computador", isCorrect: false },
                    { text: "Azure PowerShell instalado no seu computador", isCorrect: false },
                    { text: "Portal do Azure", isCorrect: false },
                ],
            },
            {
                statement:
                    "Em qual serviço os logs ficam armazenados e são consultados usando a linguagem KQL (Kusto Query Language)?",
                difficulty: "medio",
                options: [
                    { text: "Log Analytics", isCorrect: true },
                    { text: "Application Insights", isCorrect: false },
                    { text: "Azure Advisor", isCorrect: false },
                    { text: "Azure Arc", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa tem servidores no data center próprio e VMs em outra nuvem, e quer gerenciar tudo pelo painel do Azure aplicando as mesmas políticas. Qual serviço atende a esse cenário?",
                difficulty: "medio",
                options: [
                    { text: "Azure Arc", isCorrect: true },
                    { text: "Azure Advisor", isCorrect: false },
                    { text: "Azure Cloud Shell", isCorrect: false },
                    { text: "Azure Monitor", isCorrect: false },
                ],
            },
            {
                statement:
                    "Qual serviço analisa seus recursos e recomenda melhorias de custo, segurança, confiabilidade e desempenho, com base nas boas práticas da Microsoft?",
                difficulty: "medio",
                options: [
                    { text: "Azure Advisor", isCorrect: true },
                    { text: "Azure Monitor", isCorrect: false },
                    { text: "Azure Service Health", isCorrect: false },
                    { text: "Log Analytics", isCorrect: false },
                ],
            },
        ],
    },
];

async function inserirQuestoes(lessonId: string, qs: Questao[], apartirDe: number) {
    for (let j = apartirDe; j < qs.length; j++) {
        const q = qs[j];
        const [questao] = await db
            .insert(questions)
            .values({ lessonId, statement: q.statement, difficulty: q.difficulty, position: j + 1 })
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
}

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "iniciante",
                description:
                    "Trilha de fundamentos do Microsoft Azure para a certificação AZ-900: conceitos de nuvem, arquitetura, computação, rede, armazenamento, bancos de dados, identidade, governança, custos e ferramentas.",
            })
            .returning();
        console.log(`Trilha criada: ${trilha.name}`);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));

    if (existentes.length === 0) {
        // Trilha nova: insere tudo.
        for (let i = 0; i < AULAS.length; i++) {
            const a = AULAS[i];
            const [mod] = await db
                .insert(modules)
                .values({ trailId: trilha.id, title: a.modulo, position: i + 1 })
                .returning();
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: 1,
                    published: true,
                })
                .returning();
            await inserirQuestoes(lesson.id, a.questions, 0);
        }
        console.log(`Seed concluído: trilha ${NOME} com ${AULAS.length} aulas.`);
        return;
    }

    // Trilha já existe: garante 5 questões por aula, adicionando só o que falta.
    let adicionadas = 0;
    for (const a of AULAS) {
        const lesson = existentes.find((l) => l.title === a.titulo);
        if (!lesson) continue;
        const qs = await db.select().from(questions).where(eq(questions.lessonId, lesson.id));
        if (qs.length >= a.questions.length) continue;
        await inserirQuestoes(lesson.id, a.questions, qs.length);
        adicionadas += a.questions.length - qs.length;
    }
    console.log(`Questões completadas: ${adicionadas}.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
