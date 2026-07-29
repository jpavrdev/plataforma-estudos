// Seed da trilha AZURE AZ-104 (intermediario). Idempotente e não
// destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-az104.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AZURE AZ-104";
const DESCRICAO =
    "Preparação para a prova AZ-104: Microsoft Azure Administrator, pelo skills measured de 17/04/2026 e com o peso de cada domínio na prova: a hierarquia e as ferramentas do administrador, identidades e acesso no Microsoft Entra ID, governança com Azure Policy, bloqueios e custos, armazenamento, computação com VMs, contêineres e App Service, rede virtual com NSG, peering e balanceamento, e monitoramento com Azure Monitor, Backup e Site Recovery. Trilha voltada ao certificado oficial.";
const CARGA_HORARIA = 20;

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
        titulo: "Módulo 1 - O ambiente e as ferramentas do administrador",
        aulas: [
            {
                titulo: "A hierarquia do Azure",
                blocks: [
                    {
                        type: "text",
                        value: "# A hierarquia do Azure\n\nBem-vindo à trilha de preparação para o **AZ-104: Microsoft Azure Administrator**. O objetivo é te levar aprovado na prova oficial, cobrindo os cinco domínios do skills measured na proporção em que a Microsoft os avalia.\n\nA prova tem entre **40 e 60 questões**, **100 minutos** e nota de corte **700 de 1000**. Atenção a esse último ponto: 700 não é 70% de acerto. A Microsoft usa pontuação escalada, então questões têm pesos diferentes e o corte reflete um limiar de desempenho, não uma porcentagem simples de acertos.\n\nOs formatos vão além da múltipla escolha: aparecem estudos de caso, arrastar e soltar, listas ordenadas e cenários com várias respostas. Nesta trilha o quiz usa múltipla escolha, mas o conteúdo cobre o que os outros formatos exigem.",
                    },
                    {
                        type: "text",
                        value: "## Os quatro níveis de escopo\n\nTudo no Azure vive em uma hierarquia de quatro níveis, e entender essa hierarquia é pré-requisito para praticamente todos os outros assuntos da prova, porque governança, permissão e cobrança seguem ela.\n\n**Management group.** O nível mais amplo. Agrupa assinaturas para aplicar governança de forma herdada. Todo tenant tem um management group raiz, e a hierarquia aceita até **seis níveis** de aninhamento sem contar a raiz.\n\n**Assinatura (subscription).** A unidade de cobrança e o limite lógico de recursos. Uma assinatura pertence a exatamente um management group e tem seus próprios limites de cota.\n\n**Resource group.** Um contêiner lógico para recursos que compartilham ciclo de vida. Todo recurso pertence a exatamente um resource group, e o grupo tem uma região, que guarda apenas os metadados.\n\n**Recurso.** A instância propriamente dita: uma máquina virtual, uma conta de armazenamento, uma rede virtual.",
                    },
                    {
                        type: "table",
                        value: '[["Escopo", "Para que serve", "Herda para baixo?"], ["Management group", "Governança acima das assinaturas", "Sim"], ["Assinatura", "Cobrança e limite lógico de recursos", "Sim"], ["Resource group", "Agrupar recursos por ciclo de vida", "Sim"], ["Recurso", "A instância do serviço", "Não tem nível abaixo"]]',
                    },
                    {
                        type: "quote",
                        value: "Atribuições de **RBAC** e de **Azure Policy** são herdadas de cima para baixo. **Tags não são herdadas.** Essa assimetria aparece em prova com frequência: aplicar uma tag no resource group não propaga a tag para os recursos dentro dele.",
                    },
                    {
                        type: "text",
                        value: "## Detalhes que a prova cobra\n\n**Um recurso pertence a um único resource group**, e pode ser movido para outro, inclusive em outra assinatura, desde que o tipo suporte a operação e os recursos dependentes vão juntos.\n\n**Mover não muda a região.** A localização de um recurso é definida na criação. Mover entre resource groups apenas troca o contêiner lógico; para mudar de região é preciso replicar ou recriar.\n\n**A região do resource group** define onde os metadados dele ficam armazenados, e não onde os recursos rodam. Um resource group em Brazil South pode conter uma VM em East US.\n\n**Um tenant do Microsoft Entra ID** pode ter várias assinaturas, e uma assinatura confia em exatamente um tenant para identidade. É possível mover uma assinatura para outro tenant, o que remove todas as atribuições de RBAC existentes.",
                    },
                    {
                        type: "text",
                        value: '## Como isso aparece na prática\n\nUm desenho comum em empresas: um management group raiz, abaixo dele management groups por ambiente (produção, homologação, desenvolvimento), e dentro de cada um as assinaturas. As políticas de conformidade obrigatórias entram no raiz, as específicas de produção entram no management group de produção, e cada assinatura recebe seus resource groups por aplicação.\n\nEsse desenho é o que permite dizer "nenhum recurso da empresa pode ser criado fora do Brasil" em um lugar só, e valer para tudo.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Quantos níveis de aninhamento a hierarquia de management groups suporta, sem contar o nível raiz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Seis.",
                                isCorrect: true,
                            },
                            {
                                text: "Três, o que limita a hierarquia a raiz, um intermediário e o nível das assinaturas.",
                                isCorrect: false,
                            },
                            {
                                text: "Dez, permitindo modelar organizações grandes com muitas divisões e subdivisões.",
                                isCorrect: false,
                            },
                            {
                                text: "Ilimitado, desde que cada management group tenha um único pai na estrutura criada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma tag foi aplicada em um resource group. Os recursos dentro dele recebem a tag?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, porque tags não são herdadas pelos recursos do grupo.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, a herança acontece automaticamente em poucos minutos após a aplicação da tag.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que os recursos estejam na mesma região declarada no resource group.",
                                isCorrect: false,
                            },
                            {
                                text: "Somente os recursos criados depois da aplicação da tag recebem a herança do grupo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o efeito de mover uma máquina virtual de um resource group para outro?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela troca de contêiner lógico, e a região continua a mesma.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela passa a rodar na região declarada no resource group de destino da operação.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela é recriada com a mesma configuração, recebendo novos endereços de rede.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela perde as atribuições de RBAC feitas diretamente no escopo do próprio recurso.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a região de um resource group define?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Onde os metadados do grupo ficam armazenados.",
                                isCorrect: true,
                            },
                            {
                                text: "Onde todos os recursos criados dentro daquele grupo passam a ser executados.",
                                isCorrect: false,
                            },
                            {
                                text: "Qual região o Azure usa como destino padrão para os backups dos recursos do grupo.",
                                isCorrect: false,
                            },
                            {
                                text: "Quais tipos de recurso podem ser criados dentro daquele resource group específico.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o efeito de mover uma assinatura para outro tenant do Microsoft Entra ID?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Todas as atribuições de RBAC existentes são removidas.",
                                isCorrect: true,
                            },
                            {
                                text: "As atribuições de RBAC são convertidas para os usuários equivalentes do novo tenant.",
                                isCorrect: false,
                            },
                            {
                                text: "Os recursos são recriados no novo tenant, mantendo as configurações originais deles.",
                                isCorrect: false,
                            },
                            {
                                text: "A assinatura passa a confiar nos dois tenants, o de origem e o de destino da operação.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Resource Manager, regiões e zonas",
                blocks: [
                    {
                        type: "text",
                        value: "## O Azure Resource Manager\n\nO **Azure Resource Manager** (ARM) é a camada de gerenciamento por onde passa toda operação de criação, alteração e exclusão de recursos, independentemente da ferramenta usada. Portal, CLI, PowerShell, SDK e templates todos falam com o ARM.\n\nIsso tem duas consequências importantes para a prova:\n\n**A autorização é sempre a mesma.** As permissões de RBAC valem igual, não importa a ferramenta. Não existe permissão que funcione no portal e não na CLI.\n\n**As operações são declarativas quando você usa templates.** Você descreve o estado desejado e o ARM decide o que criar, atualizar ou remover.",
                    },
                    {
                        type: "text",
                        value: "## Provedores de recursos\n\nCada família de serviços é exposta por um **provedor de recursos**, no formato `Microsoft.Compute`, `Microsoft.Storage`, `Microsoft.Network`. O tipo completo de um recurso combina provedor e tipo, como `Microsoft.Compute/virtualMachines`.\n\nOs provedores precisam estar **registrados** na assinatura para que os recursos daquele tipo possam ser criados. A maioria é registrada automaticamente na primeira utilização, mas em assinaturas novas ou restritas pode ser necessário registrar manualmente, e um erro de provedor não registrado é uma causa comum de falha de implantação.",
                    },
                    {
                        type: "code",
                        value: '# Listar provedores e o estado de registro\naz provider list --query "[?registrationState==\'Registered\'].namespace" -o tsv\n\n# Registrar um provedor\naz provider register --namespace Microsoft.ContainerService\n\n# Ver os tipos e as versões de API de um provedor\naz provider show --namespace Microsoft.Storage --query "resourceTypes[].resourceType" -o tsv',
                    },
                    {
                        type: "text",
                        value: "## Regiões, pares de região e zonas\n\nUma **região** é um conjunto de datacenters em uma área geográfica, conectados por rede de baixa latência.\n\nCada região tem uma **região emparelhada** dentro da mesma geografia, usada para replicação de serviços como o GRS de armazenamento e para a ordem de atualização da plataforma, que nunca atualiza as duas ao mesmo tempo. O par de Brazil South é South Central US, o que é uma exceção geográfica conhecida.\n\nUma **zona de disponibilidade** é um ou mais datacenters dentro da mesma região, com energia, refrigeração e rede independentes. Regiões que suportam zonas oferecem pelo menos três, e distribuir instâncias entre zonas protege contra a perda de um datacenter inteiro.",
                    },
                    {
                        type: "table",
                        value: '[["Nível de proteção", "Contra o que protege", "Exemplo de recurso"], ["Availability set", "Falha de rack e manutenção do host", "VMs em domínios de falha e atualização"], ["Zona de disponibilidade", "Perda de um datacenter da região", "VMs distribuídas em três zonas"], ["Região emparelhada", "Perda da região inteira", "GRS de armazenamento, Site Recovery"]]',
                    },
                    {
                        type: "quote",
                        value: "Um detalhe que a prova cobra: **a zona de uma VM é definida na criação e não pode ser alterada depois**. Para mudar, é preciso recriar a máquina ou replicá-la. O mesmo vale para os Scale Sets.",
                    },
                    {
                        type: "text",
                        value: "## Serviços zonais e com redundância de zona\n\nA prova distingue dois comportamentos:\n\n**Serviço zonal**: você escolhe a zona e o recurso vive nela. Máquinas virtuais, discos gerenciados e IPs públicos standard funcionam assim, e a proteção vem de você distribuir instâncias entre zonas.\n\n**Serviço com redundância de zona**: a plataforma distribui automaticamente entre zonas, sem escolha nem gestão sua. O ZRS de armazenamento e o load balancer standard com frontend com redundância de zona funcionam assim.\n\nA pergunta típica de prova apresenta um requisito de disponibilidade e pede a configuração correta. A chave é reconhecer se o serviço em questão exige distribuição manual ou já é redundante por natureza.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Por que uma implantação pode falhar com erro de provedor de recursos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o provedor daquele tipo de recurso não está registrado na assinatura.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a versão de API declarada no template é mais recente que a do provedor local.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o provedor só aceita implantações feitas pelo portal, e não pela linha de comando.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a região escolhida não possui zonas de disponibilidade para aquele provedor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que serve a região emparelhada de uma região do Azure?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Replicação de serviços como o GRS e ordenação das atualizações da plataforma.",
                                isCorrect: true,
                            },
                            {
                                text: "Distribuição automática das máquinas virtuais entre datacenters independentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Redução de latência entre recursos criados nas duas regiões do mesmo par.",
                                isCorrect: false,
                            },
                            {
                                text: "Consolidação da cobrança dos recursos criados nas duas regiões emparelhadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quantas zonas de disponibilidade uma região que suporta zonas oferece, no mínimo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Três.",
                                isCorrect: true,
                            },
                            {
                                text: "Duas, uma primária e uma secundária, dentro da mesma área geográfica da região.",
                                isCorrect: false,
                            },
                            {
                                text: "Cinco, distribuídas entre os datacenters que compõem aquela região do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma, correspondente ao datacenter principal em que a região foi implantada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma máquina virtual foi criada sem zona e a equipe agora quer colocá-la na zona 2. É possível?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, a zona é definida na criação e exige recriar ou replicar a máquina.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, editando a propriedade de zona na configuração da máquina virtual existente.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que a máquina esteja desalocada no momento em que a mudança for aplicada.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, mas somente quando a máquina pertencer a um Virtual Machine Scale Set.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre um serviço zonal e um serviço com redundância de zona?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "No zonal você escolhe a zona; no redundante a plataforma distribui sozinha.",
                                isCorrect: true,
                            },
                            {
                                text: "No zonal a plataforma distribui automaticamente e no redundante você escolhe a zona.",
                                isCorrect: false,
                            },
                            {
                                text: "O zonal protege contra falha de região e o redundante apenas contra falha de rack.",
                                isCorrect: false,
                            },
                            {
                                text: "O zonal existe apenas para computação e o redundante apenas para armazenamento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Portal, Azure CLI e Azure PowerShell",
                blocks: [
                    {
                        type: "text",
                        value: "## As três ferramentas que a prova assume\n\nO perfil de público do AZ-104 diz explicitamente que você deve ter experiência com **PowerShell**, **Azure CLI**, **o portal do Azure** e **templates ARM ou arquivos Bicep**. Isso significa que a prova apresenta comandos e espera que você reconheça o que eles fazem.\n\nNão é necessário decorar todos os parâmetros, mas é necessário reconhecer o padrão de nomenclatura de cada ferramenta e saber qual comando faz o quê.",
                    },
                    {
                        type: "text",
                        value: "## O padrão de nomes\n\nA **Azure CLI** usa uma estrutura de grupos e subcomandos em minúsculas, separados por espaço: `az <grupo> <subgrupo> <ação>`. As ações mais comuns são `create`, `list`, `show`, `update`, `delete`, `start` e `stop`.\n\nO **Azure PowerShell** usa o padrão verbo e substantivo com prefixo `Az`: `New-AzResourceGroup`, `Get-AzVM`, `Set-AzStorageAccount`, `Remove-AzVM`. Os verbos seguem a convenção do PowerShell: `New`, `Get`, `Set`, `Remove`, `Start`, `Stop`.\n\nReconhecer esse padrão resolve várias questões: se a alternativa diz `Create-AzVM`, ela está errada, porque o verbo correto no PowerShell é `New`.",
                    },
                    {
                        type: "code",
                        value: "# Azure CLI\naz group create --name rg-app --location brazilsouth\naz vm create --resource-group rg-app --name vm-web --image Ubuntu2204 --size Standard_B2s\naz vm list --resource-group rg-app --output table\naz vm stop --resource-group rg-app --name vm-web          # para, mas continua cobrando\naz vm deallocate --resource-group rg-app --name vm-web     # desaloca e para a cobranca\naz group delete --name rg-app --yes --no-wait",
                    },
                    {
                        type: "code",
                        value: "# Azure PowerShell\nNew-AzResourceGroup -Name rg-app -Location brazilsouth\nNew-AzVM -ResourceGroupName rg-app -Name vm-web -Image Ubuntu2204 -Size Standard_B2s\nGet-AzVM -ResourceGroupName rg-app | Format-Table Name, Location, ProvisioningState\nStop-AzVM -ResourceGroupName rg-app -Name vm-web            # desaloca por padrao\nStop-AzVM -ResourceGroupName rg-app -Name vm-web -StayProvisioned   # mantem alocada\nRemove-AzResourceGroup -Name rg-app -Force",
                    },
                    {
                        type: "quote",
                        value: "Uma pegadinha importante: na **CLI**, `az vm stop` para o sistema operacional e **continua cobrando** a computação; quem libera a cobrança é `az vm deallocate`. No **PowerShell**, `Stop-AzVM` **desaloca por padrão**, e para apenas parar sem desalocar é preciso `-StayProvisioned`. Os dois comandos têm nomes parecidos e comportamentos diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Quando usar cada uma\n\n**Portal.** Melhor para explorar, entender relações entre recursos, ver métricas e fazer operações pontuais. Ruim para repetição e para auditoria do que foi feito.\n\n**CLI.** Boa para scripts em ambientes Linux e para pipelines, com sintaxe concisa. A opção `--query` usa JMESPath para filtrar a saída, e `--output table` deixa legível.\n\n**PowerShell.** Boa para quem já trabalha com Windows e para scripts que manipulam objetos, porque os cmdlets devolvem objetos e não texto.\n\n**Templates ARM e Bicep.** A escolha para infraestrutura repetível e versionada, que é o assunto do módulo 5.\n\nA prova não pergunta qual é melhor, e sim qual comando realiza uma tarefa. Vale praticar lendo comandos e dizendo o que fazem.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o padrão de nomenclatura dos cmdlets do Azure PowerShell?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Verbo e substantivo com prefixo Az, como New-AzResourceGroup.",
                                isCorrect: true,
                            },
                            {
                                text: "Grupo e ação em minúsculas separados por espaço, como az group create.",
                                isCorrect: false,
                            },
                            {
                                text: "Substantivo e verbo, como AzResourceGroup-New, seguindo a ordem do recurso.",
                                isCorrect: false,
                            },
                            {
                                text: "Prefixo Azure seguido do tipo de recurso, como AzureResourceGroupCreate.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual comando da Azure CLI libera a cobrança de computação de uma máquina virtual?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "az vm deallocate.",
                                isCorrect: true,
                            },
                            {
                                text: "az vm stop, que encerra o sistema operacional e libera os recursos reservados.",
                                isCorrect: false,
                            },
                            {
                                text: "az vm delete, que é a única forma de encerrar a cobrança daquela máquina virtual.",
                                isCorrect: false,
                            },
                            {
                                text: "az vm restart, que reinicia a máquina e libera os recursos de computação alocados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o comportamento padrão do cmdlet Stop-AzVM?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Desaloca a máquina, encerrando a cobrança de computação.",
                                isCorrect: true,
                            },
                            {
                                text: "Para o sistema operacional mantendo os recursos de computação alocados e cobrados.",
                                isCorrect: false,
                            },
                            {
                                text: "Reinicia a máquina virtual após encerrar os processos em execução no sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Exclui a máquina virtual preservando os discos gerenciados associados a ela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual alternativa contém um cmdlet do Azure PowerShell com nome inválido?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Create-AzVM.",
                                isCorrect: true,
                            },
                            {
                                text: "New-AzResourceGroup, usado para criar um grupo de recursos em uma região do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Get-AzVM, usado para listar as máquinas virtuais existentes na assinatura atual.",
                                isCorrect: false,
                            },
                            {
                                text: "Remove-AzResourceGroup, usado para excluir um grupo de recursos e o conteúdo dele.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma permissão de RBAC concede acesso pelo portal. Ela também vale pela CLI?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Sim, porque toda operação passa pelo Resource Manager, com a mesma autorização.",
                                isCorrect: true,
                            },
                            {
                                text: "Não, a CLI exige uma atribuição de função específica para acesso por linha de comando.",
                                isCorrect: false,
                            },
                            {
                                text: "Não, o portal usa autorização do Entra ID e a CLI usa as chaves da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende da função: algumas valem apenas no portal e outras apenas na linha de comando.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Cloud Shell, tags e organização",
                blocks: [
                    {
                        type: "text",
                        value: "## Azure Cloud Shell\n\nO **Cloud Shell** é um shell no navegador, autenticado com a sua identidade, disponível em Bash e PowerShell. Ele já vem com a CLI, o Azure PowerShell, o Git, o Terraform e outras ferramentas instaladas, e não exige nada na máquina local.\n\nDois detalhes que a prova cobra:\n\n**Ele exige uma conta de armazenamento** para persistir o diretório home entre sessões, montada como um compartilhamento de arquivos do Azure Files. Sem ela, o Cloud Shell funciona apenas em modo efêmero, e os arquivos são perdidos.\n\n**A sessão expira por inatividade**, tipicamente após 20 minutos, e o contêiner é descartado. O que estava fora do diretório persistido é perdido.",
                    },
                    {
                        type: "text",
                        value: "## Tags: para que servem de verdade\n\nTags são pares de nome e valor aplicados a recursos, resource groups e assinaturas, e servem para organizar, relatar custo e automatizar.\n\nOs limites que a prova cobra:\n\n- até **50 pares** por recurso, resource group ou assinatura;\n- nome com até **512 caracteres** e valor com até **256**;\n- em contas de armazenamento, o nome tem limite de **128 caracteres**;\n- **tags não são herdadas** de escopos superiores.",
                    },
                    {
                        type: "table",
                        value: '[["Uso da tag", "Exemplo", "Onde aparece o benefício"], ["Alocação de custo", "centroCusto=TI-042", "Cost Management, análise por tag"], ["Ambiente", "ambiente=producao", "Políticas e automação por ambiente"], ["Responsável", "dono=equipe-pagamentos", "Quem procurar quando algo quebra"], ["Ciclo de vida", "expiraEm=2026-12-31", "Automação de desligamento e limpeza"]]',
                    },
                    {
                        type: "quote",
                        value: 'Como tags não são herdadas, a forma de garantir que todo recurso receba uma tag é o **Azure Policy com efeito Modify**, mais uma **tarefa de remediação** para os recursos que já existem. Essa combinação é a resposta correta para a pergunta "como garantir a tag em toda a assinatura".',
                    },
                    {
                        type: "text",
                        value: "## Convenções de nome\n\nA prova não cobra uma convenção específica, mas cobra as **restrições técnicas**, que variam por tipo de recurso e causam erro de criação:\n\n- **conta de armazenamento**: 3 a 24 caracteres, apenas letras minúsculas e números, e o nome precisa ser **globalmente único**, porque compõe o endereço público;\n- **resource group**: até 90 caracteres, aceita letras, números, ponto, sublinhado, hífen e parênteses, e não pode terminar com ponto;\n- **máquina virtual**: até 15 caracteres no Windows e 64 no Linux, por causa do nome de host do sistema operacional;\n- **rede virtual**: até 64 caracteres, único dentro do resource group.\n\nO padrão que a Microsoft recomenda combina tipo, carga, ambiente, região e instância, como `vm-web-prod-brs-01` ou `st-logs-dev-brs-001`.",
                    },
                    {
                        type: "text",
                        value: "## Resource groups: como organizar\n\nTrês critérios que aparecem em cenários de prova:\n\n**Por ciclo de vida.** Recursos que nascem e morrem juntos ficam no mesmo grupo, porque excluir o grupo exclui tudo de uma vez. É o critério mais usado.\n\n**Por controle de acesso.** Como RBAC é herdado do grupo, agrupar recursos que precisam das mesmas permissões simplifica as atribuições.\n\n**Por cobrança e governança.** Como políticas e bloqueios são herdados, agrupar por ambiente facilita aplicar regras diferentes para produção e desenvolvimento.\n\nO que **não** é critério: a região. Um resource group pode conter recursos de várias regiões, e frequentemente contém.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que o Azure Cloud Shell exige para persistir arquivos entre sessões?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma conta de armazenamento com um compartilhamento do Azure Files montado.",
                                isCorrect: true,
                            },
                            {
                                text: "Um disco gerenciado anexado ao contêiner que executa a sessão do shell.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma máquina virtual dedicada na assinatura, com o agente do Cloud Shell instalado.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada: o Cloud Shell persiste os arquivos automaticamente no perfil do usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o limite de tags por recurso no Azure?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "50 pares de nome e valor.",
                                isCorrect: true,
                            },
                            {
                                text: "15 pares, com nome limitado a 128 caracteres e valor limitado a 256 caracteres.",
                                isCorrect: false,
                            },
                            {
                                text: "100 pares por recurso, desde que a assinatura não exceda o limite total dela.",
                                isCorrect: false,
                            },
                            {
                                text: "Ilimitado, respeitando apenas o tamanho máximo de metadados do recurso criado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a forma correta de garantir que todo recurso de uma assinatura receba a tag de ambiente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Azure Policy com efeito Modify, mais tarefa de remediação para o que já existe.",
                                isCorrect: true,
                            },
                            {
                                text: "Aplicar a tag em cada resource group, porque os recursos herdam as tags do grupo.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplicar a tag na assinatura, o que propaga para todos os escopos abaixo dela.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure Policy com efeito Deny, que impede a criação de recursos sem a tag exigida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais são as restrições de nome de uma conta de armazenamento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "De 3 a 24 caracteres, minúsculas e números, com unicidade global.",
                                isCorrect: true,
                            },
                            {
                                text: "Até 90 caracteres, aceitando letras, números, hífen, sublinhado e parênteses.",
                                isCorrect: false,
                            },
                            {
                                text: "Até 15 caracteres, por causa do limite de nome de host do sistema operacional.",
                                isCorrect: false,
                            },
                            {
                                text: "Até 64 caracteres, com unicidade apenas dentro do resource group em que foi criada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual critério NÃO faz sentido para agrupar recursos em um resource group?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A região dos recursos, porque um grupo pode conter recursos de várias regiões.",
                                isCorrect: true,
                            },
                            {
                                text: "O ciclo de vida, porque excluir o grupo exclui todos os recursos contidos nele.",
                                isCorrect: false,
                            },
                            {
                                text: "O controle de acesso, porque as atribuições de RBAC são herdadas pelo conteúdo.",
                                isCorrect: false,
                            },
                            {
                                text: "A governança, porque as políticas atribuídas ao grupo valem para os recursos dele.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O exame AZ-104: domínios, pesos e formato",
                blocks: [
                    {
                        type: "text",
                        value: "## Os cinco domínios e o peso de cada um\n\nO skills measured do AZ-104, atualizado em **17 de abril de 2026**, define cinco domínios com pesos em faixas. Conhecer esses pesos orienta onde investir o tempo de estudo.",
                    },
                    {
                        type: "table",
                        value: '[["Domínio", "Peso oficial", "Módulos desta trilha"], ["Manage Azure identities and governance", "20 a 25%", "Módulos 2 e 3"], ["Implement and manage storage", "15 a 20%", "Módulo 4"], ["Deploy and manage Azure compute resources", "20 a 25%", "Módulo 5"], ["Implement and manage virtual networking", "15 a 20%", "Módulo 6"], ["Monitor and maintain Azure resources", "10 a 15%", "Módulo 7"]]',
                    },
                    {
                        type: "text",
                        value: "Repare que identidades e governança, junto com computação, respondem por até metade da prova. Rede vem em seguida, e monitoramento é o menor peso, embora não seja desprezível.\n\nA atualização de abril de 2026 trouxe uma mudança relevante: **identidades e governança subiu** de 15 a 20% para 20 a 25%, e **rede caiu** de 20 a 25% para 15 a 20%. Material de estudo mais antigo ainda reflete a distribuição anterior.",
                    },
                    {
                        type: "text",
                        value: "## O formato da prova\n\n**Quantidade e tempo.** Entre 40 e 60 questões em 100 minutos.\n\n**Nota de corte.** 700 de 1000, em escala. Isso **não** equivale a 70% de acerto: a Microsoft usa pontuação escalada, e questões têm pesos diferentes. Não existe uma contagem simples de acertos que garanta a aprovação.\n\n**Formatos de questão.** Múltipla escolha com uma resposta, múltipla escolha com várias respostas, arrastar e soltar, listas ordenadas, área ativa (clicar na imagem), preenchimento de lacuna e **estudos de caso**, que apresentam um cenário longo com várias questões.\n\n**Detalhes operacionais.** Algumas questões vêm em seções que **não permitem voltar**, e a prova avisa antes de entrar nelas. Se o exame não estiver no seu idioma nativo, você pode solicitar 30 minutos adicionais.",
                    },
                    {
                        type: "quote",
                        value: "Uma consequência prática do formato: nos **estudos de caso**, leia o cenário inteiro antes de responder, porque as questões seguintes costumam depender de detalhes espalhados nos anexos. E cuidado com as seções sem retorno: confirme cada resposta antes de avançar.",
                    },
                    {
                        type: "text",
                        value: "## Estratégia de estudo com esta trilha\n\nO caminho recomendado:\n\n1. **Percorra os sete módulos na ordem.** Cada um corresponde a um domínio ou parte dele, e o quiz de cinco questões por aula fixa o conteúdo.\n2. **Faça o simulado da plataforma.** Ele tem 125 questões no banco e sorteia 50 por tentativa, com a distribuição por domínio igual à da prova. Cada tentativa é diferente.\n3. **Use o filtro de assuntos.** Depois de ver o resultado, treine só os domínios em que errou mais.\n4. **Pratique no portal.** Este é o ponto que nenhum material substitui: o AZ-104 é uma prova de administrador, e muitas questões descrevem telas e comandos. Uma assinatura gratuita ou de estudante cobre a maior parte dos exercícios.\n\nA meta é passar do corte com folga em tentativas seguidas do simulado, e não acertar uma vez por sorte.",
                    },
                    {
                        type: "text",
                        value: "## O que esta trilha assume\n\nO AZ-104 é uma certificação de nível **associate**, e pressupõe familiaridade com conceitos que o **AZ-900** cobre: o que é nuvem, modelos de serviço, o que são regiões e assinaturas, e o vocabulário básico dos serviços.\n\nEsta trilha revisa o essencial no módulo 1, mas não substitui a base. Se algo aqui parecer novo demais, a trilha AZURE AZ-900 da plataforma é o lugar de começar.\n\nO perfil também espera experiência prática com PowerShell, Azure CLI, portal, templates ARM ou Bicep, e Microsoft Entra ID. Os módulos seguintes cobrem cada um desses no nível que a prova exige.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a nota de corte do AZ-104 e o que ela significa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "700 de 1000 em escala, que não corresponde a 70% de acerto.",
                                isCorrect: true,
                            },
                            {
                                text: "700 de 1000, o que equivale exatamente a 70% das questões respondidas corretamente.",
                                isCorrect: false,
                            },
                            {
                                text: "650 de 1000, com pontuação proporcional à quantidade de acertos obtida na prova.",
                                isCorrect: false,
                            },
                            {
                                text: "800 de 1000, exigido pelas certificações de nível associate da Microsoft atualmente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais dois domínios têm o maior peso na prova?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Identidades e governança, e computação, com 20 a 25% cada.",
                                isCorrect: true,
                            },
                            {
                                text: "Rede virtual e armazenamento, com 20 a 25% cada um dos dois domínios citados.",
                                isCorrect: false,
                            },
                            {
                                text: "Monitoramento e computação, que somados respondem por metade da prova aplicada.",
                                isCorrect: false,
                            },
                            {
                                text: "Armazenamento e identidades, com 20 a 25% cada um conforme o skills measured atual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que mudou na atualização do skills measured de abril de 2026?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Identidades e governança subiu de peso e rede virtual caiu.",
                                isCorrect: true,
                            },
                            {
                                text: "Rede virtual subiu de peso e monitoramento foi removido da lista de domínios.",
                                isCorrect: false,
                            },
                            {
                                text: "Armazenamento subiu para 20 a 25% e computação caiu para 15 a 20% do total.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de domínios passou de cinco para seis, com governança separada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cuidado a aula recomenda nos estudos de caso da prova?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ler o cenário inteiro antes de responder, porque as questões dependem dos anexos.",
                                isCorrect: true,
                            },
                            {
                                text: "Responder rapidamente e voltar depois, aproveitando que a seção permite revisão.",
                                isCorrect: false,
                            },
                            {
                                text: "Pular o cenário e responder pelas alternativas, que costumam indicar a resposta certa.",
                                isCorrect: false,
                            },
                            {
                                text: "Responder apenas as questões cujo tema aparece no primeiro parágrafo do cenário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual certificação a trilha recomenda como base antes do AZ-104?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "AZ-900, que cobre os fundamentos de nuvem e o vocabulário dos serviços.",
                                isCorrect: true,
                            },
                            {
                                text: "AZ-305, que trata do desenho de soluções de infraestrutura na nuvem da Microsoft.",
                                isCorrect: false,
                            },
                            {
                                text: "SC-900, que cobre segurança, conformidade e identidade nos produtos da Microsoft.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma: o AZ-104 é a porta de entrada da trilha de certificações do Azure.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Identidades e acesso no Microsoft Entra ID",
        aulas: [
            {
                titulo: "Usuários e grupos no Microsoft Entra ID",
                blocks: [
                    {
                        type: "text",
                        value: "## O que o Entra ID é para o administrador\n\nO **Microsoft Entra ID** é o serviço de identidade da nuvem da Microsoft, e é onde vivem os usuários, os grupos e as entidades de serviço que acessam recursos do Azure. Ele é diferente do Active Directory local: não usa domínios no sentido tradicional, não tem unidades organizacionais nem política de grupo, e fala protocolos de internet como SAML, OAuth e OpenID Connect.\n\nUma assinatura do Azure confia em exatamente **um** tenant do Entra ID para autenticação, e um tenant pode servir várias assinaturas.",
                    },
                    {
                        type: "text",
                        value: "## Tipos de usuário\n\n**Membro (member).** Usuário criado no próprio tenant ou sincronizado do Active Directory local. É o tipo padrão e tem o conjunto completo de permissões de diretório concedido ao perfil dele.\n\n**Convidado (guest).** Usuário externo convidado pela colaboração B2B. Ele autentica no tenant de origem, com as próprias credenciais, e por padrão tem permissões de diretório mais restritas do que um membro.\n\nO tipo de usuário pode ser alterado depois da criação, o que às vezes é necessário quando alguém de uma empresa parceira passa a ser funcionário.",
                    },
                    {
                        type: "table",
                        value: '[["", "Membro", "Convidado"], ["Origem", "Criado no tenant ou sincronizado", "Convidado por B2B"], ["Onde autentica", "No próprio tenant", "No tenant de origem"], ["Permissões de diretório", "Padrão de membro", "Mais restritas por padrão"], ["Caso típico", "Funcionário da empresa", "Parceiro, fornecedor, consultor"]]',
                    },
                    {
                        type: "text",
                        value: "## Tipos de grupo\n\n**Grupo de segurança.** Serve para conceder acesso a recursos. Aceita como membros usuários, dispositivos, entidades de serviço e outros grupos. É o tipo usado em atribuições de RBAC.\n\n**Grupo do Microsoft 365.** Serve para colaboração, e cria recursos compartilhados como caixa de correio, calendário e site do SharePoint. Aceita **apenas usuários** como membros.",
                    },
                    {
                        type: "text",
                        value: "## Tipos de associação\n\n**Atribuída.** Os membros são adicionados e removidos manualmente.\n\n**Dinâmica de usuário.** Uma regra baseada em atributos define quem entra e sai automaticamente. Quando o atributo do usuário muda, a associação é recalculada.\n\n**Dinâmica de dispositivo.** Mesma ideia, avaliando atributos de dispositivo. Um grupo do Microsoft 365 não suporta esse tipo.\n\nA associação dinâmica exige licença **Entra ID P1 ou superior**, o que é um detalhe que a prova cobra em cenários de custo.",
                    },
                    {
                        type: "code",
                        value: '# Regra dinamica: usuarios do departamento de vendas em Sao Paulo\n(user.department -eq "Vendas") and (user.city -eq "Sao Paulo")\n\n# Regra dinamica: excluir contas de convidado\n(user.userType -eq "Member") and (user.accountEnabled -eq true)\n\n# Regra dinamica de dispositivo: apenas Windows corporativos\n(device.deviceOSType -eq "Windows") and (device.deviceOwnership -eq "Company")',
                    },
                    {
                        type: "quote",
                        value: "Duas âncoras para a prova: **grupo de segurança concede acesso, grupo do Microsoft 365 é colaboração**; e **associação dinâmica exige licença P1**. As duas aparecem em cenários que pedem a escolha correta considerando custo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual tipo de grupo do Entra ID aceita dispositivos como membros?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Grupo de segurança.",
                                isCorrect: true,
                            },
                            {
                                text: "Grupo do Microsoft 365, que também cria caixa de correio e site compartilhados.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois tipos aceitam dispositivos, mudando apenas a forma de associação usada.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: dispositivos são gerenciados apenas por unidades administrativas no tenant.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que caracteriza um usuário convidado no Entra ID?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele autentica no tenant de origem e tem permissões de diretório mais restritas.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele é criado no tenant local com senha gerenciada pela equipe de suporte da empresa.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele é sincronizado do Active Directory local por meio do Entra Connect configurado.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele tem as mesmas permissões de diretório de um membro, mudando apenas o rótulo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual licença a associação dinâmica de grupo exige?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Entra ID P1 ou superior.",
                                isCorrect: true,
                            },
                            {
                                text: "Entra ID Free, que já inclui os recursos de associação dinâmica para grupos criados.",
                                isCorrect: false,
                            },
                            {
                                text: "Microsoft 365 E3, que é a única licença com suporte a regras baseadas em atributos.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma licença adicional, porque a associação dinâmica faz parte do plano básico.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa que usuários entrem automaticamente em um grupo quando o cargo mudar para Gerente. Qual configuração atende?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Associação dinâmica de usuário, com regra sobre o atributo de cargo.",
                                isCorrect: true,
                            },
                            {
                                text: "Associação atribuída, com uma automação que roda diariamente e ajusta os membros.",
                                isCorrect: false,
                            },
                            {
                                text: "Associação dinâmica de dispositivo, avaliando o perfil configurado em cada equipamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Grupo do Microsoft 365, que recalcula a associação conforme os atributos do usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quantos tenants do Entra ID uma assinatura do Azure pode usar para autenticação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Exatamente um.",
                                isCorrect: true,
                            },
                            {
                                text: "Até três, o que permite separar identidades de produção, homologação e desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Quantos forem necessários, desde que os tenants estejam na mesma geografia do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: a autenticação da assinatura é feita pelo próprio Azure Resource Manager.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Licenças, usuários externos e SSPR",
                blocks: [
                    {
                        type: "text",
                        value: "## Licenças no Entra ID\n\nLicenças podem ser atribuídas de duas formas:\n\n**Diretamente ao usuário.** Simples, mas trabalhoso em escala e sujeito a esquecimento quando alguém muda de função.\n\n**Por meio de grupos** (licenciamento baseado em grupo). A licença é atribuída ao grupo, e o Entra ID aplica e remove automaticamente conforme a associação muda. Combinado com associação dinâmica, isso automatiza o licenciamento por departamento ou cargo.\n\nUm erro comum de atribuição: alguns serviços exigem que o **local de uso** (usage location) do usuário esteja definido, porque a disponibilidade do serviço varia por país. Sem esse atributo, a atribuição falha.",
                    },
                    {
                        type: "text",
                        value: '## Usuários externos: B2B e B2C\n\n**Colaboração B2B.** Convida pessoas de outras organizações como convidados do seu tenant. Elas usam as próprias credenciais e você não gerencia senha nem ciclo de vida da identidade delas. É a resposta para "parceiro precisa acessar nosso aplicativo interno".\n\n**Entra External ID para consumidores (antes chamado B2C).** Um diretório separado para autenticação de clientes de aplicações voltadas ao consumidor, com suporte a identidades sociais e fluxos personalizados de cadastro. É a resposta para "milhões de clientes se autenticando no nosso app público".\n\nA distinção aparece em prova: B2B é para **parceiros de negócio**, o de consumidores é para **clientes finais em escala**.',
                    },
                    {
                        type: "text",
                        value: "## Self-service password reset\n\nO **SSPR** permite que o próprio usuário redefina a senha ou desbloqueie a conta, sem acionar o suporte. É o recurso que mais reduz chamado de helpdesk em qualquer organização, e a prova cobra a configuração dele.\n\nAs decisões de configuração são:\n\n**Escopo.** Nenhum, um grupo selecionado, ou todos os usuários.\n\n**Métodos de autenticação disponíveis.** Aplicativo autenticador, código por aplicativo, email, SMS, chamada telefônica, e perguntas de segurança.\n\n**Número de métodos exigidos para redefinir.** Um ou dois.\n\n**Número de métodos que o usuário deve registrar.** Um ou dois.\n\n**Se o registro é obrigatório no login.** Quando ativado, o usuário é levado ao registro na próxima autenticação.",
                    },
                    {
                        type: "table",
                        value: '[["Configuração", "Opções", "Efeito"], ["Escopo", "Nenhum, grupo, todos", "Quem pode usar o SSPR"], ["Métodos exigidos", "1 ou 2", "Quantos comprovar para redefinir"], ["Métodos a registrar", "1 ou 2", "Quantos configurar no registro"], ["Registro obrigatório", "Sim ou não", "Se o usuário é levado ao registro no login"], ["Escrita de volta de senha", "Habilitada ou não", "Se a senha volta para o AD local"]]',
                    },
                    {
                        type: "quote",
                        value: "Em ambiente híbrido, o SSPR só altera a senha no Active Directory local se a **escrita de volta de senha** (password writeback) estiver habilitada no Entra Connect. Sem isso, o usuário redefine na nuvem e continua com a senha antiga no domínio local, o que gera um problema difícil de diagnosticar.",
                    },
                    {
                        type: "text",
                        value: "## Um detalhe sobre administradores\n\nContas com funções administrativas do Entra ID têm regras próprias e mais rígidas: elas **sempre** podem usar o SSPR, o número de métodos exigidos é **dois** e as **perguntas de segurança não são permitidas** para elas.\n\nIsso significa que uma configuração relaxada para o resto da organização não se aplica a quem tem privilégio administrativo, o que é uma pergunta de prova recorrente.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a vantagem do licenciamento baseado em grupo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "As licenças são aplicadas e removidas automaticamente conforme a associação muda.",
                                isCorrect: true,
                            },
                            {
                                text: "As licenças passam a custar menos por usuário quando atribuídas de forma coletiva.",
                                isCorrect: false,
                            },
                            {
                                text: "O grupo pode receber mais licenças do que a quantidade adquirida pela organização.",
                                isCorrect: false,
                            },
                            {
                                text: "As licenças deixam de exigir que o atributo de local de uso esteja preenchido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma atribuição de licença falhou. Qual atributo do usuário costuma estar faltando?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O local de uso, porque a disponibilidade do serviço varia por país.",
                                isCorrect: true,
                            },
                            {
                                text: "O departamento, exigido para vincular a licença ao centro de custo correspondente.",
                                isCorrect: false,
                            },
                            {
                                text: "O número de telefone, necessário para os métodos de autenticação do serviço.",
                                isCorrect: false,
                            },
                            {
                                text: "O gerente, usado para aprovar a atribuição de licenças pagas na organização.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo público vai autenticar milhões de clientes finais, com login social. Qual solução é indicada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Entra External ID para consumidores, em um diretório separado.",
                                isCorrect: true,
                            },
                            {
                                text: "Colaboração B2B, convidando cada cliente como usuário convidado do tenant.",
                                isCorrect: false,
                            },
                            {
                                text: "Criação de contas de membro no tenant corporativo, com senha gerenciada pela empresa.",
                                isCorrect: false,
                            },
                            {
                                text: "Sincronização com o Active Directory local por meio do Entra Connect configurado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em ambiente híbrido, o que é necessário para o SSPR alterar também a senha no Active Directory local?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A escrita de volta de senha habilitada no Entra Connect.",
                                isCorrect: true,
                            },
                            {
                                text: "A sincronização de hash de senha configurada em modo bidirecional no conector.",
                                isCorrect: false,
                            },
                            {
                                text: "Um controlador de domínio publicado na internet para receber a alteração da nuvem.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma política de acesso condicional permitindo a redefinição a partir do diretório local.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual regra de SSPR se aplica obrigatoriamente às contas com funções administrativas?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Dois métodos exigidos e perguntas de segurança não permitidas.",
                                isCorrect: true,
                            },
                            {
                                text: "Um método exigido, para agilizar a recuperação de acesso administrativo urgente.",
                                isCorrect: false,
                            },
                            {
                                text: "O SSPR desabilitado, porque administradores dependem do suporte para redefinir senha.",
                                isCorrect: false,
                            },
                            {
                                text: "As mesmas regras definidas para os demais usuários do tenant, sem exceção alguma.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Azure RBAC: as funções internas",
                blocks: [
                    {
                        type: "text",
                        value: "## O que o RBAC controla\n\nO **Azure RBAC** controla o acesso a **recursos do Azure**: quem pode criar uma máquina virtual, ler uma conta de armazenamento, alterar uma rede virtual. Ele é diferente das funções do Entra ID, que controlam o acesso ao **diretório**: criar usuários, gerenciar domínios, configurar aplicativos.\n\nEssa distinção é uma das perguntas mais frequentes da prova. Por padrão, um **Global Administrator** do Entra ID **não tem acesso** aos recursos do Azure, e precisa usar a opção de elevar o acesso para gerenciá-los.",
                    },
                    {
                        type: "table",
                        value: '[["", "Funções do Entra ID", "Funções do Azure RBAC"], ["Controlam", "Recursos do diretório", "Recursos do Azure"], ["Exemplos", "Global Administrator, User Administrator", "Owner, Contributor, Reader"], ["Escopo", "Tenant e unidades administrativas", "Management group, assinatura, RG, recurso"], ["Exemplo de ação", "Criar usuário, gerenciar licença", "Criar VM, ler blob, alterar VNet"]]',
                    },
                    {
                        type: "text",
                        value: "## As quatro funções fundamentais\n\n**Owner.** Acesso total a todos os recursos, **incluindo o direito de delegar acesso** a outras pessoas.\n\n**Contributor.** Cria e gerencia todos os tipos de recurso, mas **não pode conceder acesso** a outras pessoas.\n\n**Reader.** Visualiza os recursos, sem alterar nada.\n\n**User Access Administrator.** Gerencia **apenas o acesso** de usuários aos recursos, sem gerenciar os recursos em si.",
                    },
                    {
                        type: "quote",
                        value: "A diferença entre **Owner** e **Contributor** é exatamente uma coisa: **delegar acesso**. E a diferença entre Owner e **User Access Administrator** é o inverso: o segundo só faz a delegação, sem tocar nos recursos. Essa tríade resolve muitas questões.",
                    },
                    {
                        type: "text",
                        value: "## Funções específicas de serviço\n\nA prova cobra o reconhecimento de funções específicas, porque o princípio do menor privilégio pede a função mais estreita que resolve o problema.",
                    },
                    {
                        type: "table",
                        value: '[["Função", "Permite", "Não permite"], ["Virtual Machine Contributor", "Gerenciar VMs, incluindo reiniciar", "Gerenciar a VNet ou conceder acesso"], ["Storage Account Contributor", "Gerenciar contas de armazenamento", "Ler os dados dentro dos blobs"], ["Storage Blob Data Reader", "Ler os dados dos blobs", "Alterar a configuração da conta"], ["Network Contributor", "Gerenciar recursos de rede", "Gerenciar VMs"], ["Backup Operator", "Executar backup e restauração", "Alterar as políticas de backup"]]',
                    },
                    {
                        type: "text",
                        value: "## A distinção entre plano de controle e plano de dados\n\nRepare nas duas funções de armazenamento da tabela. Elas mostram uma separação que a prova cobra:\n\n**Plano de controle.** Gerenciar o recurso: criar a conta, alterar a redundância, ver as chaves. O `Storage Account Contributor` atua aqui.\n\n**Plano de dados.** Acessar o conteúdo: ler e gravar blobs, arquivos, mensagens de fila. O `Storage Blob Data Reader` e o `Storage Blob Data Contributor` atuam aqui.\n\nUma pessoa com `Contributor` na conta de armazenamento consegue **ler as chaves** e, com elas, acessar os dados, mas não tem permissão de plano de dados via identidade do Entra ID. Cenários que exigem acesso aos dados sem passar por chave precisam das funções de dados.",
                    },
                    {
                        type: "code",
                        value: '# Listar funcoes internas disponiveis\naz role definition list --query "[?roleType==\'BuiltInRole\'].roleName" -o tsv | sort\n\n# Atribuir funcao no escopo de um resource group\naz role assignment create \\\n  --assignee usuario@contoso.com \\\n  --role "Virtual Machine Contributor" \\\n  --resource-group rg-app\n\n# Listar as atribuicoes efetivas de um usuario, incluindo as herdadas\naz role assignment list --assignee usuario@contoso.com --all --include-inherited -o table',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a única diferença entre as funções Owner e Contributor?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O Owner pode conceder acesso a outras pessoas, e o Contributor não.",
                                isCorrect: true,
                            },
                            {
                                text: "O Owner atua no escopo da assinatura e o Contributor apenas no resource group.",
                                isCorrect: false,
                            },
                            {
                                text: "O Owner gerencia recursos e o Contributor apenas visualiza a configuração deles.",
                                isCorrect: false,
                            },
                            {
                                text: "O Owner inclui as permissões de diretório do Entra ID, que o Contributor não tem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por padrão, um Global Administrator do Entra ID tem acesso aos recursos do Azure?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, ele precisa elevar o acesso para gerenciar os recursos da assinatura.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, a função de Global Administrator inclui Owner em todas as assinaturas do tenant.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, mas apenas com permissão de leitura em todos os recursos existentes na conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende da licença do Entra ID contratada pela organização naquele tenant.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa apenas reiniciar máquinas virtuais de um resource group. Qual função aplica o menor privilégio?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Virtual Machine Contributor no escopo do resource group.",
                                isCorrect: true,
                            },
                            {
                                text: "Contributor no escopo da assinatura, o que garante todas as operações necessárias.",
                                isCorrect: false,
                            },
                            {
                                text: "Reader no resource group, suficiente porque reiniciar não altera a configuração.",
                                isCorrect: false,
                            },
                            {
                                text: "Owner no resource group, para que a equipe possa se autoatribuir o que precisar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual função permite ler o conteúdo dos blobs usando identidade do Entra ID?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Storage Blob Data Reader.",
                                isCorrect: true,
                            },
                            {
                                text: "Storage Account Contributor, que gerencia a conta e por isso alcança os dados dela.",
                                isCorrect: false,
                            },
                            {
                                text: "Reader no escopo da conta de armazenamento, que concede leitura de tudo no recurso.",
                                isCorrect: false,
                            },
                            {
                                text: "Contributor no resource group, porque a permissão é herdada pelos dados dos blobs.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre plano de controle e plano de dados no contexto de RBAC?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O de controle gerencia o recurso; o de dados acessa o conteúdo dele.",
                                isCorrect: true,
                            },
                            {
                                text: "O de controle acessa o conteúdo do recurso e o de dados gerencia a configuração.",
                                isCorrect: false,
                            },
                            {
                                text: "O de controle vale para o portal e o de dados vale para as chamadas de API REST.",
                                isCorrect: false,
                            },
                            {
                                text: "O de controle usa funções do Entra ID e o de dados usa funções do Azure RBAC.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Escopos, herança e funções personalizadas",
                blocks: [
                    {
                        type: "text",
                        value: "## Como o escopo funciona\n\nUma atribuição de função sempre tem três elementos: **quem** (segurança principal), **o que** (definição de função) e **onde** (escopo).\n\nO escopo segue a hierarquia do módulo 1, e a atribuição é **herdada para baixo**. Atribuir Reader na assinatura concede leitura em todos os resource groups e recursos dela.\n\nAs atribuições são **acumulativas**: se alguém recebe Reader na assinatura e Contributor em um resource group, o efeito naquele grupo é a soma, ou seja, Contributor.",
                    },
                    {
                        type: "table",
                        value: '[["Escopo da atribuição", "Alcance efetivo"], ["Management group", "Todas as assinaturas, RGs e recursos abaixo"], ["Assinatura", "Todos os RGs e recursos da assinatura"], ["Resource group", "Todos os recursos do grupo"], ["Recurso", "Apenas aquele recurso"]]',
                    },
                    {
                        type: "text",
                        value: "## Negações têm precedência\n\nAlém das atribuições de concessão, existem **atribuições de negação** (deny assignments), que bloqueiam ações específicas.\n\nA regra que a prova cobra: **negação sempre vence**. Se uma pessoa tem Owner na assinatura e existe uma negação em um resource group, a ação negada é bloqueada naquele grupo, apesar do Owner herdado.\n\nAtribuições de negação não são criadas diretamente por administradores no caso geral: elas vêm de recursos gerenciados pelo Azure, como Azure Blueprints e alguns serviços gerenciados, que protegem os próprios recursos de alteração.",
                    },
                    {
                        type: "quote",
                        value: "A ordem de avaliação: o Azure soma todas as atribuições aplicáveis ao escopo, considerando a herança, e depois aplica as negações. **Concessões somam, negações prevalecem.**",
                    },
                    {
                        type: "text",
                        value: "## Funções personalizadas\n\nQuando nenhuma função interna atende com o menor privilégio, cria-se uma **função personalizada**. A definição é um JSON com quatro partes que a prova cobra:\n\n**Actions.** As operações de plano de controle permitidas.\n\n**NotActions.** Operações excluídas do conjunto concedido em Actions. Não é uma negação: é uma subtração do que foi concedido.\n\n**DataActions e NotDataActions.** O equivalente para o plano de dados.\n\n**AssignableScopes.** Os escopos em que a função pode ser atribuída. Não concede nada, apenas delimita onde a função fica disponível.",
                    },
                    {
                        type: "code",
                        value: '{\n  "Name": "Operador de VM",\n  "Description": "Pode iniciar e parar maquinas virtuais, sem outras alteracoes.",\n  "Actions": [\n    "Microsoft.Compute/virtualMachines/read",\n    "Microsoft.Compute/virtualMachines/start/action",\n    "Microsoft.Compute/virtualMachines/restart/action",\n    "Microsoft.Compute/virtualMachines/deallocate/action",\n    "Microsoft.Resources/subscriptions/resourceGroups/read"\n  ],\n  "NotActions": [],\n  "AssignableScopes": [\n    "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-app"\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: '## Limites e detalhes que caem em prova\n\n- Um tenant suporta até **5000 funções personalizadas**.\n- Uma assinatura suporta até **4000 atribuições** de função.\n- **Curingas** são aceitos em Actions, como `Microsoft.Compute/*/read`, mas não em DataActions.\n- Uma função personalizada pode ser atribuída em qualquer escopo **igual ou abaixo** dos declarados em AssignableScopes.\n- Funções personalizadas são armazenadas no **tenant**, e por isso podem ser reutilizadas entre assinaturas, desde que o escopo esteja declarado.\n\nE uma dica prática para diagnosticar acesso: a aba **Access control (IAM)** de qualquer recurso tem a opção de **verificar acesso efetivo** de um usuário, que mostra todas as atribuições aplicáveis, inclusive as herdadas, e é a resposta para "por que essa pessoa consegue fazer isso?".',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma pessoa tem Reader na assinatura e Contributor em um resource group. Qual é o efeito naquele grupo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Contributor, porque as atribuições são acumulativas.",
                                isCorrect: true,
                            },
                            {
                                text: "Reader, porque a atribuição no escopo mais amplo tem precedência sobre a específica.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum acesso, porque atribuições em escopos diferentes entram em conflito no Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Owner, resultado da soma das permissões das duas funções atribuídas à mesma pessoa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Existe uma atribuição de negação em um resource group e a pessoa tem Owner na assinatura. O que acontece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A ação negada é bloqueada naquele grupo, apesar do Owner herdado.",
                                isCorrect: true,
                            },
                            {
                                text: "A ação é permitida, porque a função Owner tem precedência sobre qualquer negação.",
                                isCorrect: false,
                            },
                            {
                                text: "O acesso fica indefinido e depende da ordem de criação das duas atribuições feitas.",
                                isCorrect: false,
                            },
                            {
                                text: "A negação é ignorada, porque negações valem apenas para funções personalizadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que serve a propriedade NotActions em uma função personalizada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Subtrair operações do conjunto concedido em Actions.",
                                isCorrect: true,
                            },
                            {
                                text: "Negar explicitamente operações, prevalecendo sobre as concessões de outras funções.",
                                isCorrect: false,
                            },
                            {
                                text: "Declarar os escopos em que a função personalizada não pode ser atribuída no tenant.",
                                isCorrect: false,
                            },
                            {
                                text: "Listar as operações de plano de dados que a função não concede a quem a recebe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a propriedade AssignableScopes define?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os escopos em que a função pode ser atribuída, sem conceder permissão.",
                                isCorrect: true,
                            },
                            {
                                text: "As operações que a função concede a quem a recebe no escopo escolhido pelo admin.",
                                isCorrect: false,
                            },
                            {
                                text: "Os usuários e grupos que recebem a função automaticamente após a criação dela.",
                                isCorrect: false,
                            },
                            {
                                text: "Os recursos que a função pode gerenciar dentro de cada assinatura da organização.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma administradora quer entender por que um usuário consegue excluir um recurso. Qual recurso do portal ajuda?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A verificação de acesso efetivo na aba Access control (IAM) do recurso.",
                                isCorrect: true,
                            },
                            {
                                text: "O log de atividade da assinatura, que registra as exclusões já realizadas nos recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "A lista de definições de função personalizadas criadas no tenant da organização.",
                                isCorrect: false,
                            },
                            {
                                text: "O painel de conformidade do Azure Policy, que mostra os recursos fora do padrão.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Fixando identidades e acesso",
                blocks: [
                    {
                        type: "text",
                        value: "## O que este módulo cobriu\n\nEste módulo cobre a primeira metade do domínio de maior peso da prova. Vale consolidar antes de ir para governança.",
                    },
                    {
                        type: "table",
                        value: '[["Conceito", "O que gravar"], ["Membro x convidado", "Convidado autentica no tenant de origem, com permissões restritas"], ["Grupo de segurança", "Concede acesso; aceita usuários, dispositivos, serviços e grupos"], ["Grupo do Microsoft 365", "Colaboração; aceita apenas usuários"], ["Associação dinâmica", "Regra por atributo; exige licença P1"], ["Licenciamento por grupo", "Aplica e remove automaticamente conforme a associação"], ["SSPR", "Escopo, métodos, quantidade exigida e registro; writeback no híbrido"], ["Funções do Entra ID", "Controlam o diretório"], ["Funções do Azure RBAC", "Controlam os recursos do Azure"], ["Owner x Contributor", "A diferença é delegar acesso"], ["Herança e negação", "Concessões somam; negações prevalecem"]]',
                    },
                    {
                        type: "text",
                        value: "## As cinco confusões mais comuns\n\n**Trocar funções do Entra ID por funções do Azure RBAC.** Global Administrator não gerencia VMs por padrão. Owner não cria usuários.\n\n**Achar que tags são herdadas.** RBAC e Policy são; tags não.\n\n**Confundir plano de controle com plano de dados.** Contributor na conta de armazenamento não é a mesma coisa que Storage Blob Data Contributor.\n\n**Esquecer que negação vence.** Um Owner herdado não supera uma atribuição de negação no escopo específico.\n\n**Achar que NotActions é negação.** NotActions subtrai do que a própria função concede, e não afeta outras atribuições da mesma pessoa.",
                    },
                    {
                        type: "quote",
                        value: "Uma frase que resolve várias questões de uma vez: **Entra ID cuida de quem você é, RBAC cuida do que você pode fazer nos recursos; concessões somam, negações prevalecem, e o escopo herda para baixo.**",
                    },
                    {
                        type: "text",
                        value: "## Um exercício de raciocínio\n\nConsidere o cenário: Ana tem Reader no management group raiz, Contributor na assinatura de produção, e existe uma negação de exclusão de recursos no resource group de bancos de dados. Alberto tem Global Administrator no Entra ID e nenhuma atribuição de RBAC.\n\nResponda mentalmente:\n\n1. Ana consegue criar uma VM na assinatura de produção?\n2. Ana consegue excluir um banco de dados no resource group protegido?\n3. Ana consegue conceder Contributor a outra pessoa?\n4. Alberto consegue reiniciar uma VM?\n5. Alberto consegue criar um usuário no diretório?\n\nAs respostas: sim, porque Contributor na assinatura permite criar recursos. Não, porque a negação prevalece. Não, porque Contributor não delega acesso. Não, porque Global Administrator não dá acesso a recursos sem elevação. Sim, porque isso é uma operação de diretório.",
                    },
                    {
                        type: "text",
                        value: "## Praticando no portal\n\nTrês exercícios que valem mais que releitura, e que reproduzem tarefas que a prova descreve:\n\n1. **Crie um grupo dinâmico** com uma regra por departamento, altere o atributo de um usuário de teste e observe a associação mudar. O recálculo pode levar alguns minutos.\n2. **Atribua Virtual Machine Contributor** a um usuário em um resource group, entre com essa conta e tente criar uma rede virtual. Observe a mensagem de autorização negada.\n3. **Use a verificação de acesso efetivo** em um recurso e confira todas as atribuições que chegam até ele, incluindo as herdadas de escopos superiores.\n\nEssas três tarefas cobrem boa parte do que o domínio de identidades avalia.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Ana tem Contributor na assinatura. Ela pode conceder Contributor a outra pessoa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Não, porque Contributor não permite delegar acesso.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, porque Contributor inclui as permissões de gerenciamento de acesso da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que a outra pessoa já tenha ao menos a função Reader naquele escopo.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende do escopo: no resource group ela pode, mas na assinatura não pode delegar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um Global Administrator do Entra ID precisa reiniciar uma máquina virtual. O que é necessário?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Elevar o acesso ou receber uma atribuição de RBAC no escopo do recurso.",
                                isCorrect: true,
                            },
                            {
                                text: "Nada, porque a função de Global Administrator já concede acesso total aos recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "Solicitar uma licença Entra ID P2, que habilita o gerenciamento de recursos do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar uma função personalizada no Entra ID com as ações de computação necessárias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre NotActions está correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Subtrai do que a própria função concede, sem afetar outras atribuições da pessoa.",
                                isCorrect: true,
                            },
                            {
                                text: "Nega a operação para a pessoa, prevalecendo sobre qualquer outra função atribuída.",
                                isCorrect: false,
                            },
                            {
                                text: "Define as operações de plano de dados que a função personalizada não concede.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que a função seja atribuída nos escopos listados na propriedade da definição.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual par de conceitos é frequentemente confundido, segundo a aula?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Contributor na conta de armazenamento e Storage Blob Data Contributor.",
                                isCorrect: true,
                            },
                            {
                                text: "Grupo de segurança e unidade administrativa criada dentro do tenant do Entra ID.",
                                isCorrect: false,
                            },
                            {
                                text: "Associação atribuída e associação dinâmica de dispositivo em grupos de segurança.",
                                isCorrect: false,
                            },
                            {
                                text: "Management group e resource group, que ocupam níveis distintos da hierarquia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a ordem de avaliação de permissões no Azure RBAC?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Somam-se as concessões aplicáveis, e depois as negações prevalecem.",
                                isCorrect: true,
                            },
                            {
                                text: "Aplica-se apenas a atribuição do escopo mais específico, ignorando as herdadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplica-se apenas a atribuição do escopo mais amplo, que sobrepõe as demais.",
                                isCorrect: false,
                            },
                            {
                                text: "Somam-se todas as atribuições, e as negações são somadas junto com as concessões.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Governança: assinaturas, políticas e custos",
        aulas: [
            {
                titulo: "Management groups e assinaturas",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que management groups existem\n\nSem management groups, cada política e cada atribuição de função teria que ser repetida em toda assinatura. Com eles, a organização define a regra uma vez no nível certo e ela vale para tudo abaixo.\n\nRegras estruturais que a prova cobra:\n\n- todo diretório tem um **management group raiz** criado automaticamente, chamado Tenant Root Group;\n- o raiz **não pode ser movido nem excluído**;\n- cada management group tem **um único pai** e pode ter vários filhos;\n- a hierarquia aceita até **seis níveis** de profundidade, sem contar o raiz nem o nível de assinatura;\n- um diretório suporta até **dez mil** management groups;\n- toda assinatura pertence a **exatamente um** management group.",
                    },
                    {
                        type: "text",
                        value: "## O que herda pela hierarquia\n\nDuas coisas herdam de management group para assinatura: **atribuições de RBAC** e **atribuições de Azure Policy**, incluindo iniciativas.\n\nIsso permite dois padrões comuns:\n\n**Governança obrigatória no raiz.** As políticas que valem para a empresa inteira, como restrição de região e exigência de tag, entram no Tenant Root Group.\n\n**Segregação por ambiente.** Management groups por ambiente recebem políticas específicas: produção exige backup, desenvolvimento restringe tamanho de VM para conter custo.",
                    },
                    {
                        type: "code",
                        value: '# Criar management group e mover assinatura\naz account management-group create --name mg-producao --display-name "Producao"\n\naz account management-group subscription add \\\n  --name mg-producao \\\n  --subscription 00000000-0000-0000-0000-000000000000\n\n# Ver a hierarquia completa\naz account management-group show --name mg-producao --expand --recurse',
                    },
                    {
                        type: "quote",
                        value: "Para criar o primeiro management group ou gerenciar a hierarquia raiz, é preciso a permissão de **Management Group Contributor** ou elevar o acesso a partir de Global Administrator do Entra ID. Um Owner de assinatura não consegue, por si só, mexer na hierarquia acima dela.",
                    },
                    {
                        type: "text",
                        value: "## Assinaturas: limites e cotas\n\nUma assinatura é um limite de cobrança e também um limite de **cota**. As cotas são por assinatura e por região, e a prova cobra o conceito, não os números exatos.\n\nExemplos de cota que aparecem em cenários: número de vCPUs por família de VM por região, número de contas de armazenamento por região, número de redes virtuais e de IPs públicos.\n\nQuando uma implantação falha por cota, a solução é solicitar aumento pelo portal, no menu de uso e cotas da assinatura, e não criar recursos em outro resource group, porque a cota não é por grupo.",
                    },
                    {
                        type: "text",
                        value: "## Quando criar mais de uma assinatura\n\nTrês motivos que a prova reconhece:\n\n**Separar cobrança.** Áreas ou clientes diferentes com fatura própria.\n\n**Contornar limites.** Quando uma carga se aproxima das cotas da assinatura.\n\n**Isolar administração.** Ambientes com donos e políticas radicalmente diferentes.\n\nO que **não** é motivo: separar por região. Uma assinatura atende todas as regiões, e a região é escolhida por recurso.",
                    },
                ],
                questions: [
                    {
                        statement: "Quantos management groups um diretório do Azure suporta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Até dez mil.",
                                isCorrect: true,
                            },
                            {
                                text: "Até cem, o que costuma ser suficiente para a maioria das organizações do mercado.",
                                isCorrect: false,
                            },
                            {
                                text: "Até seis, correspondendo ao número máximo de níveis de aninhamento permitidos.",
                                isCorrect: false,
                            },
                            {
                                text: "Ilimitado, desde que cada assinatura pertença a apenas um grupo da hierarquia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que herda de um management group para as assinaturas contidas nele?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Atribuições de RBAC e atribuições de Azure Policy.",
                                isCorrect: true,
                            },
                            {
                                text: "Tags, bloqueios de recurso e as cotas configuradas para cada família de recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas as atribuições de Azure Policy, porque o RBAC atua a partir da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas as atribuições de RBAC, porque as políticas precisam ser atribuídas por escopo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma implantação falhou por cota de vCPU na região. Qual é a solução correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Solicitar aumento de cota no menu de uso e cotas da assinatura.",
                                isCorrect: true,
                            },
                            {
                                text: "Criar a máquina virtual em outro resource group da mesma assinatura e região.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover a assinatura para outro management group com cota disponível na região.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplicar uma política do Azure Policy permitindo o tamanho de máquina desejado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual NÃO é um motivo válido para criar mais de uma assinatura?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Separar recursos por região, já que uma assinatura atende todas as regiões.",
                                isCorrect: true,
                            },
                            {
                                text: "Separar a cobrança entre áreas ou clientes que precisam de fatura própria.",
                                isCorrect: false,
                            },
                            {
                                text: "Contornar limites de cota quando uma carga se aproxima dos valores máximos.",
                                isCorrect: false,
                            },
                            {
                                text: "Isolar a administração de ambientes com donos e políticas muito diferentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um Owner de assinatura consegue criar management groups na hierarquia acima dela?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não, é necessária permissão no nível da hierarquia ou elevação de acesso.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, porque a função Owner concede acesso total a toda a hierarquia do tenant.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que a assinatura já pertença a algum management group existente.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende da licença do Entra ID contratada pela organização para aquele tenant.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Azure Policy",
                blocks: [
                    {
                        type: "text",
                        value: '## O que o Azure Policy faz\n\nO **Azure Policy** avalia recursos contra regras e age conforme o efeito configurado. Ele responde à pergunta "como garantir que todo mundo siga o padrão", que o RBAC não resolve: RBAC controla **quem pode agir**, Policy controla **o que pode existir**.\n\nTrês peças compõem o mecanismo:\n\n**Definição de política.** A regra em JSON, com a condição e o efeito.\n\n**Iniciativa** (policy set). Um agrupamento de definições atribuídas e avaliadas em conjunto.\n\n**Atribuição.** A aplicação da definição ou da iniciativa a um escopo, com parâmetros e exclusões opcionais.',
                    },
                    {
                        type: "text",
                        value: "## Os efeitos e o que cada um faz\n\nA prova cobra os efeitos e, principalmente, **qual escolher** em cada cenário.",
                    },
                    {
                        type: "table",
                        value: '[["Efeito", "O que faz", "Age em recursos existentes?"], ["Deny", "Bloqueia a criação e a atualização que violam a regra", "Não altera, mas marca como não conforme"], ["Audit", "Registra a não conformidade, sem bloquear", "Sim, na avaliação"], ["Append", "Adiciona campos ao recurso durante a criação", "Não"], ["Modify", "Adiciona, altera ou remove propriedades e tags", "Sim, com tarefa de remediação"], ["DeployIfNotExists", "Implanta um recurso relacionado que falta", "Sim, com tarefa de remediação"], ["AuditIfNotExists", "Audita quando um recurso relacionado falta", "Sim, na avaliação"], ["Disabled", "Desliga a avaliação daquela atribuição", "Não"]]',
                    },
                    {
                        type: "quote",
                        value: "Os efeitos **Modify** e **DeployIfNotExists** exigem uma **identidade gerenciada** na atribuição, com permissão suficiente para fazer a alteração ou a implantação. Sem isso a atribuição é criada e a remediação falha, o que é uma causa comum de confusão.",
                    },
                    {
                        type: "text",
                        value: '## Cenários e o efeito correto\n\nVale treinar o mapeamento, porque é assim que a prova pergunta:\n\n- "impedir a criação de recursos fora de Brazil South" → **Deny** com a política de localizações permitidas;\n- "garantir que todo recurso tenha a tag de centro de custo, inclusive os existentes" → **Modify** mais tarefa de remediação;\n- "acompanhar quantas VMs estão sem backup, sem bloquear ninguém" → **AuditIfNotExists**;\n- "criar automaticamente a configuração de diagnóstico ausente" → **DeployIfNotExists**;\n- "impedir tamanhos de VM caros em desenvolvimento" → **Deny** com a política de SKUs permitidos.',
                    },
                    {
                        type: "text",
                        value: "## Avaliação e conformidade\n\nA avaliação acontece em quatro momentos: quando um recurso é criado ou atualizado, quando a atribuição é criada ou alterada, em uma varredura periódica de cerca de **24 horas**, e quando uma varredura é disparada manualmente.\n\nIsso significa que o painel de conformidade pode levar até um dia para refletir uma mudança, e que existe o comando de disparar a varredura quando a espera não é aceitável.",
                    },
                    {
                        type: "code",
                        value: '# Atribuir a politica interna de localizacoes permitidas\naz policy assignment create \\\n  --name "regioes-permitidas" \\\n  --scope "/subscriptions/00000000-0000-0000-0000-000000000000" \\\n  --policy "e56962a6-4747-49cd-b67b-bf8b01975c4c" \\\n  --params \'{ "listOfAllowedLocations": { "value": ["brazilsouth", "eastus"] } }\'\n\n# Disparar varredura de conformidade sem esperar o ciclo de 24h\naz policy state trigger-scan --resource-group rg-app\n\n# Ver os recursos nao conformes\naz policy state list --filter "complianceState eq \'NonCompliant\'" -o table',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a diferença de propósito entre Azure RBAC e Azure Policy?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "RBAC controla quem pode agir; Policy controla o que pode existir.",
                                isCorrect: true,
                            },
                            {
                                text: "RBAC controla o que pode existir e Policy controla quem tem permissão de agir.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois controlam permissões, mudando apenas o escopo em que são aplicados.",
                                isCorrect: false,
                            },
                            {
                                text: "RBAC atua no diretório do Entra ID e Policy atua nos recursos criados no Azure.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual efeito é necessário para adicionar uma tag também nos recursos que já existem?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Modify, com uma tarefa de remediação.",
                                isCorrect: true,
                            },
                            {
                                text: "Append, que adiciona o campo no recurso durante a criação ou a atualização dele.",
                                isCorrect: false,
                            },
                            {
                                text: "Deny, que impede a existência de recursos sem a tag exigida pela organização.",
                                isCorrect: false,
                            },
                            {
                                text: "Audit, que registra a ausência da tag e permite acompanhar a adoção no painel.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que os efeitos Modify e DeployIfNotExists exigem na atribuição?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma identidade gerenciada com permissão para fazer a alteração ou a implantação.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma exclusão de escopo para os recursos que já estão em conformidade com a regra.",
                                isCorrect: false,
                            },
                            {
                                text: "Um bloqueio de recurso do tipo CanNotDelete aplicado ao escopo da atribuição.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma iniciativa agrupando a definição com outras políticas relacionadas ao tema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer acompanhar quantas VMs estão sem backup, sem bloquear ninguém. Qual efeito usar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AuditIfNotExists.",
                                isCorrect: true,
                            },
                            {
                                text: "Deny, que impede a criação de máquinas virtuais sem a proteção de backup configurada.",
                                isCorrect: false,
                            },
                            {
                                text: "DeployIfNotExists, que configura o backup automaticamente nas máquinas sem proteção.",
                                isCorrect: false,
                            },
                            {
                                text: "Disabled, que desliga a avaliação daquela atribuição enquanto o levantamento acontece.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com que frequência acontece a varredura periódica de conformidade do Azure Policy?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Cerca de 24 horas, com possibilidade de disparo manual.",
                                isCorrect: true,
                            },
                            {
                                text: "A cada 15 minutos, o que mantém o painel de conformidade quase em tempo real.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas quando um recurso é criado ou atualizado no escopo da atribuição feita.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma vez por semana, coincidindo com a janela de manutenção da plataforma.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Bloqueios, tags e organização de recursos",
                blocks: [
                    {
                        type: "text",
                        value: "## Bloqueios de recurso\n\nBloqueios protegem recursos contra alteração e exclusão acidental, e atuam **independentemente do RBAC**: até um Owner é impedido enquanto o bloqueio existir.\n\nDois tipos:\n\n**CanNotDelete.** Permite ler e alterar, impede excluir.\n\n**ReadOnly.** Permite apenas ler; impede alterar e excluir.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto", "CanNotDelete", "ReadOnly"], ["Ler", "Permitido", "Permitido"], ["Alterar", "Permitido", "Bloqueado"], ["Excluir", "Bloqueado", "Bloqueado"]]',
                    },
                    {
                        type: "text",
                        value: "## Regras de bloqueio que a prova cobra\n\n**São herdados.** Um bloqueio na assinatura vale para todos os resource groups e recursos dela.\n\n**O mais restritivo prevalece.** Se um recurso está sob CanNotDelete herdado e ReadOnly direto, vale ReadOnly.\n\n**Podem ser aplicados em assinatura, resource group ou recurso.**\n\n**Exigem permissão específica.** Só quem tem `Microsoft.Authorization/locks/*` pode criar e remover bloqueios, o que na prática significa **Owner** ou **User Access Administrator**. Um Contributor não consegue remover um bloqueio, e essa é uma pergunta frequente.\n\n**Efeitos colaterais inesperados.** ReadOnly em uma conta de armazenamento impede listar as chaves, porque essa operação é um POST e conta como escrita. Isso quebra aplicações que buscam a chave dinamicamente.",
                    },
                    {
                        type: "quote",
                        value: 'Antes de excluir um resource group protegido, é preciso **remover o bloqueio**. E como um Contributor não pode remover bloqueios, o cenário típico de prova é: "a exclusão falha, o usuário tem Contributor, o que fazer?" A resposta é conceder Owner ou pedir a alguém com permissão de autorização.',
                    },
                    {
                        type: "text",
                        value: "## Tags na prática\n\nJá vimos os limites no módulo 1. Aqui vale o uso operacional:\n\n**Alocação de custo.** No Cost Management, a análise por tag permite responder quanto cada centro de custo, projeto ou ambiente consumiu. Isso só funciona se a tag existir nos recursos que geram custo, e a tag do resource group **não** conta para isso, porque não é herdada.\n\n**Automação.** Scripts e runbooks filtram recursos por tag para desligar ambientes fora do horário, aplicar backup ou limpar recursos expirados.\n\n**Governança.** Azure Policy pode exigir a tag na criação (Deny), adicioná-la automaticamente (Modify) ou herdá-la do resource group com uma política interna feita para isso.",
                    },
                    {
                        type: "code",
                        value: "# Aplicar tags sem remover as existentes\naz tag update --resource-id <id> --operation merge --tags ambiente=producao dono=pagamentos\n\n# Substituir todas as tags\naz tag update --resource-id <id> --operation replace --tags ambiente=producao\n\n# Encontrar recursos por tag\naz resource list --tag ambiente=producao -o table",
                    },
                    {
                        type: "text",
                        value: "## Um detalhe da CLI que a prova cobra\n\nA operação `replace` do comando de tag **remove todas as tags existentes** e aplica apenas as informadas. A operação `merge` acrescenta e atualiza sem remover as demais.\n\nTrocar uma pela outra é um erro que apaga a tag de centro de custo de dezenas de recursos, e é exatamente o tipo de detalhe que aparece como distrator.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um recurso está sob um bloqueio CanNotDelete herdado da assinatura e um ReadOnly aplicado diretamente. Qual prevalece?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "ReadOnly, porque o mais restritivo prevalece.",
                                isCorrect: true,
                            },
                            {
                                text: "CanNotDelete, porque o bloqueio do escopo mais amplo tem precedência sobre o específico.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois se anulam e o recurso passa a aceitar alteração e exclusão normalmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende da ordem em que os dois bloqueios foram criados na assinatura da empresa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um usuário com Contributor tenta excluir um resource group com bloqueio e falha. O que resolve?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Conceder Owner ou pedir a quem tem permissão de autorização remover o bloqueio.",
                                isCorrect: true,
                            },
                            {
                                text: "Excluir os recursos um a um, porque o bloqueio se aplica apenas ao grupo em si.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover os recursos para outro resource group e excluir o grupo original vazio.",
                                isCorrect: false,
                            },
                            {
                                text: "Alterar o bloqueio de ReadOnly para CanNotDelete, o que libera a exclusão do grupo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é um efeito colateral inesperado de um bloqueio ReadOnly em conta de armazenamento?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Impede listar as chaves de acesso, porque essa operação conta como escrita.",
                                isCorrect: true,
                            },
                            {
                                text: "Impede a leitura dos blobs armazenados nos contêineres daquela conta de armazenamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que a conta seja usada como destino de logs de diagnóstico de outros recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que novas regras de firewall sejam avaliadas nas requisições recebidas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual operação do comando az tag update remove todas as tags existentes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "replace.",
                                isCorrect: true,
                            },
                            {
                                text: "merge, que acrescenta as tags informadas e mantém as demais que já existiam.",
                                isCorrect: false,
                            },
                            {
                                text: "delete, que remove apenas as tags cujos nomes forem explicitamente informados.",
                                isCorrect: false,
                            },
                            {
                                text: "update, que é o padrão quando nenhuma operação é informada no comando executado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que uma tag aplicada no resource group não ajuda na análise de custo por centro de custo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque ela não é herdada pelos recursos que geram o custo.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o Cost Management não considera tags de resource group nas análises feitas.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a análise por tag exige que a tag seja criada primeiro no nível da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque tags de resource group expiram após 30 dias se não forem reaplicadas no grupo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Custos: orçamentos, alertas e Advisor",
                blocks: [
                    {
                        type: "text",
                        value: '## Cost Management e as três ferramentas\n\nO **Microsoft Cost Management** oferece três instrumentos que a prova cobra, e é importante não confundi-los.\n\n**Análise de custo (cost analysis).** Explora o gasto histórico e projetado, com filtros e agrupamentos por assinatura, resource group, serviço, região e **tag**. É onde se responde "quanto gastamos e com o quê".\n\n**Orçamento (budget).** Define um valor para um escopo e um período, com limites de alerta em percentuais. Ao atingir um limite, notifica.\n\n**Alertas.** Além dos alertas de orçamento, existem alertas de anomalia de custo, que avisam quando o padrão de gasto muda de forma inesperada, e alertas de crédito para assinaturas com compromisso.',
                    },
                    {
                        type: "quote",
                        value: "O ponto mais cobrado sobre orçamentos: eles **notificam, não bloqueiam**. Atingir o valor de um orçamento não impede a criação de recursos nem desliga nada. Para agir automaticamente, o orçamento precisa acionar um **grupo de ação** que dispare uma automação, como um runbook que desaloca máquinas.",
                    },
                    {
                        type: "text",
                        value: "## Configurando um orçamento\n\nOs elementos de um orçamento:\n\n**Escopo.** Assinatura, resource group ou escopo de faturamento.\n\n**Valor e período.** O valor e a recorrência: mensal, trimestral ou anual, com data de expiração.\n\n**Condições de alerta.** Percentuais do valor, por exemplo 50%, 80% e 100%, avaliados sobre o custo **real** ou sobre o custo **previsto**.\n\n**Destinatários.** Emails diretos, grupos de ação ou funções de RBAC do escopo.\n\nA distinção entre custo real e previsto rende questão: um alerta em 100% do previsto avisa **antes** de o gasto acontecer, enquanto o de custo real avisa quando já aconteceu.",
                    },
                    {
                        type: "table",
                        value: '[["Ferramenta", "Responde", "Age?"], ["Análise de custo", "Quanto gastamos e com o quê", "Não"], ["Orçamento", "Estamos no rumo do valor planejado?", "Notifica"], ["Alerta de anomalia", "O padrão de gasto mudou?", "Notifica"], ["Azure Advisor", "O que dá para otimizar?", "Recomenda"]]',
                    },
                    {
                        type: "text",
                        value: "## Azure Advisor\n\nO Advisor analisa a configuração e a telemetria de uso e apresenta recomendações em **cinco categorias**: confiabilidade, segurança, excelência operacional, desempenho e otimização de custo.\n\nNa categoria de custo, as recomendações típicas são: redimensionar ou desligar máquinas subutilizadas, comprar instâncias reservadas para cargas constantes, excluir IPs públicos e discos não associados, e ajustar circuitos de conectividade ociosos.\n\nUm ponto que a prova cobra: o Advisor **recomenda, não aplica**. E as recomendações de segurança dele vêm do Microsoft Defender for Cloud.",
                    },
                    {
                        type: "text",
                        value: "## Reduzindo custo na prática\n\nAs alavancas que aparecem em cenários de prova, da mais simples para a mais estrutural:\n\n**Desalocar o que não é usado.** Máquina desalocada não cobra computação. Máquina apenas parada pelo sistema operacional continua cobrando.\n\n**Excluir recursos órfãos.** Discos gerenciados sem VM, IPs públicos sem associação, snapshots antigos e discos de máquinas já excluídas continuam sendo cobrados.\n\n**Ajustar o tamanho.** O Advisor identifica máquinas com CPU e rede consistentemente baixas.\n\n**Instâncias reservadas e planos de economia.** Compromisso de um ou três anos em troca de desconto, para cargas previsíveis.\n\n**Azure Hybrid Benefit.** Reaproveita licenças Windows Server e SQL Server com Software Assurance, reduzindo o custo da licença na nuvem.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que acontece quando um orçamento do Azure atinge o valor definido?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele dispara alertas, sem bloquear a criação de recursos.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele bloqueia novas implantações até o início do próximo período do orçamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele desaloca automaticamente as máquinas virtuais de maior custo na assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele cancela a assinatura e move os recursos para o estado suspenso até revisão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre um alerta de orçamento sobre custo real e sobre custo previsto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O previsto avisa antes do gasto acontecer; o real avisa quando já aconteceu.",
                                isCorrect: true,
                            },
                            {
                                text: "O real considera impostos e o previsto considera apenas o valor bruto dos recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "O previsto avalia apenas assinaturas com compromisso de consumo contratado.",
                                isCorrect: false,
                            },
                            {
                                text: "O real dispara uma vez por período e o previsto dispara a cada avaliação diária.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quantas categorias de recomendação o Azure Advisor oferece?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cinco: confiabilidade, segurança, excelência operacional, desempenho e custo.",
                                isCorrect: true,
                            },
                            {
                                text: "Três: custo, segurança e desempenho, agrupadas conforme o impacto no ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Quatro: rede, computação, armazenamento e identidade, por tipo de recurso do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Duas: otimização de custo e conformidade com as políticas definidas pela organização.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual recurso continua sendo cobrado mesmo depois que a máquina virtual foi excluída?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os discos gerenciados que não foram removidos junto com a máquina.",
                                isCorrect: true,
                            },
                            {
                                text: "A computação da máquina, cobrada até o fim do período de faturamento corrente.",
                                isCorrect: false,
                            },
                            {
                                text: "A interface de rede, que é excluída automaticamente junto com a máquina virtual.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: excluir a máquina virtual remove todos os recursos associados a ela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que é necessário para um orçamento desligar recursos automaticamente ao atingir o limite?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Acionar um grupo de ação que dispare uma automação, como um runbook.",
                                isCorrect: true,
                            },
                            {
                                text: "Marcar a opção de bloqueio automático nas configurações do orçamento criado.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplicar uma política do Azure Policy com efeito Deny vinculada ao orçamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada: o orçamento já desliga os recursos de maior custo por padrão ao estourar.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Fixando governança",
                blocks: [
                    {
                        type: "text",
                        value: "## O quadro completo do domínio\n\nEste módulo fecha o domínio de identidades e governança, que vale 20 a 25% da prova. Vale um quadro que separe as ferramentas por finalidade, porque a confusão entre elas é a maior fonte de erro.",
                    },
                    {
                        type: "table",
                        value: '[["Ferramenta", "Responde", "Atua sobre"], ["Azure RBAC", "Quem pode fazer o quê", "Ações de quem acessa"], ["Azure Policy", "O que pode existir e como", "Propriedades dos recursos"], ["Bloqueio de recurso", "O que não pode ser alterado ou excluído", "Operações no recurso, acima do RBAC"], ["Tag", "Como classificar e relatar", "Metadados do recurso"], ["Orçamento", "Estamos no rumo do gasto planejado", "Notificação de custo"], ["Azure Advisor", "O que otimizar", "Recomendação, sem aplicar"]]',
                    },
                    {
                        type: "text",
                        value: '## Os cenários clássicos e a resposta certa\n\nVale treinar o mapeamento direto, porque a prova apresenta o requisito e pede a ferramenta:\n\n- "ninguém pode criar recursos fora do Brasil" → **Azure Policy** com Deny;\n- "esta VM de produção não pode ser excluída por engano" → **bloqueio** CanNotDelete;\n- "a equipe de suporte só pode reiniciar máquinas" → **RBAC** com Virtual Machine Contributor;\n- "quero saber quanto o projeto X consumiu" → **tag** mais análise de custo;\n- "avise quando passarmos de 80% do orçado" → **orçamento** com alerta;\n- "quais máquinas estão subutilizadas" → **Azure Advisor**;\n- "toda VM nova precisa de configuração de diagnóstico" → **Policy** com DeployIfNotExists;\n- "um Owner conseguiu excluir um recurso protegido" → o **bloqueio** foi removido antes, porque bloqueio impede até Owner.',
                    },
                    {
                        type: "quote",
                        value: 'A distinção mais importante do módulo: **RBAC é sobre pessoas, Policy é sobre recursos, bloqueio é sobre operações e está acima do RBAC.** Se a questão fala de "quem", pense RBAC. Se fala de "como o recurso deve ser", pense Policy. Se fala de "impedir exclusão acidental", pense bloqueio.',
                    },
                    {
                        type: "text",
                        value: '## Erros que derrubam candidato\n\n**Escolher RBAC para um requisito de conformidade.** "Todos os recursos devem ter a tag de ambiente" não se resolve com permissão; se resolve com Policy.\n\n**Escolher Policy para proteger contra exclusão.** Policy com Deny impede criar recursos fora do padrão, mas o instrumento para proteger um recurso existente é o bloqueio.\n\n**Achar que Contributor remove bloqueio.** Remover bloqueio exige permissão de autorização, ou seja, Owner ou User Access Administrator.\n\n**Achar que orçamento bloqueia.** Ele notifica.\n\n**Confundir Advisor com Policy.** Advisor recomenda e não impõe; Policy impõe e não recomenda.',
                    },
                    {
                        type: "text",
                        value: "## Praticando\n\nQuatro exercícios no portal que cobrem o domínio inteiro:\n\n1. **Atribua a política de localizações permitidas** em um resource group de teste com apenas uma região, e tente criar um recurso em outra. Observe a mensagem de bloqueio e depois confira o painel de conformidade.\n2. **Aplique um bloqueio ReadOnly** em uma conta de armazenamento e tente listar as chaves de acesso. Observe o erro e entenda por que uma operação de leitura aparente é tratada como escrita.\n3. **Crie um orçamento** de valor baixo em um resource group com recursos ativos, com alerta em 50%, e confirme o email quando o limite for atingido.\n4. **Aplique uma tag por Policy com efeito Modify** e execute a tarefa de remediação em recursos que já existiam. Observe a diferença em relação ao efeito Append.\n\nCom isso o domínio de maior peso da prova fica coberto na prática, não apenas na leitura.",
                    },
                ],
                questions: [
                    {
                        statement:
                            '"Todo recurso da empresa deve ter a tag de ambiente" se resolve com qual ferramenta?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "Azure Policy.",
                                isCorrect: true,
                            },
                            {
                                text: "Azure RBAC, restringindo quem pode criar recursos sem a tag exigida pela empresa.",
                                isCorrect: false,
                            },
                            {
                                text: "Bloqueio de recurso, impedindo alterações que removam a tag depois de aplicada.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure Advisor, que recomenda a aplicação da tag nos recursos que estão sem ela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            '"Esta máquina de produção não pode ser excluída por engano" se resolve com qual ferramenta?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "Bloqueio de recurso do tipo CanNotDelete.",
                                isCorrect: true,
                            },
                            {
                                text: "Azure Policy com efeito Deny sobre a operação de exclusão daquele tipo de recurso.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure RBAC, removendo a permissão de exclusão de todas as pessoas da equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Tag de proteção no recurso, reconhecida pelo Azure como marcador de bloqueio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um Owner conseguiu excluir um recurso que tinha bloqueio. O que aconteceu?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O bloqueio foi removido antes, porque ele impede a exclusão até por Owner.",
                                isCorrect: true,
                            },
                            {
                                text: "A função Owner tem precedência sobre bloqueios de recurso em qualquer escopo.",
                                isCorrect: false,
                            },
                            {
                                text: "O bloqueio era do tipo ReadOnly, que permite a exclusão mas impede a alteração.",
                                isCorrect: false,
                            },
                            {
                                text: "O bloqueio expirou, porque bloqueios têm validade máxima de noventa dias no Azure.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a distinção central entre RBAC, Policy e bloqueio?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "RBAC é sobre pessoas, Policy sobre recursos, e bloqueio sobre operações.",
                                isCorrect: true,
                            },
                            {
                                text: "RBAC é sobre recursos, Policy sobre operações, e bloqueio sobre as pessoas envolvidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Os três controlam permissões, mudando apenas o escopo de aplicação de cada um.",
                                isCorrect: false,
                            },
                            {
                                text: "RBAC e Policy atuam na criação, e bloqueio atua apenas na fase de exclusão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre o Azure Advisor é correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ele recomenda melhorias, sem aplicá-las automaticamente no ambiente.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele aplica as recomendações de custo automaticamente após sete dias de inatividade.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele impõe as recomendações de segurança por meio de políticas atribuídas ao escopo.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele substitui o Azure Policy em cenários de conformidade com padrões corporativos.",
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
                titulo: "Contas de armazenamento",
                blocks: [
                    {
                        type: "text",
                        value: "## A conta de armazenamento e os quatro serviços\n\nUma **conta de armazenamento** é o contêiner de nível superior que expõe quatro serviços de dados:\n\n**Blob.** Objetos não estruturados, organizados em contêineres. É o mais usado.\n\n**File.** Compartilhamentos SMB e NFS, montáveis como unidade de rede.\n\n**Queue.** Filas de mensagens para desacoplamento entre componentes.\n\n**Table.** Armazenamento NoSQL de chave e atributo.\n\nO nome da conta compõe o endereço público de cada serviço, no formato `<conta>.blob.core.windows.net`, e por isso precisa ser **globalmente único**, com 3 a 24 caracteres, apenas letras minúsculas e números.",
                    },
                    {
                        type: "text",
                        value: "## Tipos de conta\n\nA prova cobra a escolha do tipo conforme o requisito.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo", "Serviços suportados", "Quando usar"], ["Standard general-purpose v2", "Blob, File, Queue, Table", "Padrão para a maioria dos cenários"], ["Premium block blobs", "Blob de blocos", "Alta taxa de transações, latência baixa"], ["Premium file shares", "File", "Compartilhamentos exigentes, SMB e NFS"], ["Premium page blobs", "Page blobs", "Discos não gerenciados e cargas específicas"]]',
                    },
                    {
                        type: "text",
                        value: "Um detalhe importante: as contas **premium** não suportam todas as opções de redundância. Elas aceitam LRS e ZRS, mas **não** GRS nem GZRS, porque a replicação entre regiões não atende ao perfil de latência delas. Isso aparece em cenários que pedem premium com proteção regional, e a resposta é que a combinação não existe.",
                    },
                    {
                        type: "text",
                        value: "## O que é definido na criação e não muda\n\nAlguns atributos são imutáveis depois da criação, e trocá-los exige criar outra conta e migrar os dados:\n\n- o **nome** da conta;\n- a **região**;\n- o **tipo de conta** em alguns casos, embora a atualização de v1 para v2 seja possível;\n- o **namespace hierárquico** (Data Lake Storage Gen2), que só pode ser habilitado na criação.\n\nO que **pode** mudar depois: a redundância em várias combinações, a camada de acesso padrão, as configurações de firewall e as de criptografia.",
                    },
                    {
                        type: "quote",
                        value: "O **namespace hierárquico** é a chave que transforma a conta em Data Lake Storage Gen2, com diretórios reais e permissões POSIX. Ele **só pode ser habilitado na criação**, e a prova cobra isso em cenários de análise de dados.",
                    },
                    {
                        type: "code",
                        value: "# Criar conta standard v2 com redundancia entre zonas\naz storage account create \\\n  --name stapplogsbrs001 \\\n  --resource-group rg-dados \\\n  --location brazilsouth \\\n  --sku Standard_ZRS \\\n  --kind StorageV2 \\\n  --access-tier Hot \\\n  --min-tls-version TLS1_2 \\\n  --allow-blob-public-access false\n\n# Alterar a redundancia depois da criacao\naz storage account update --name stapplogsbrs001 --resource-group rg-dados --sku Standard_GRS",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são as restrições de nome de uma conta de armazenamento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "De 3 a 24 caracteres, minúsculas e números, com unicidade global.",
                                isCorrect: true,
                            },
                            {
                                text: "Até 63 caracteres, aceitando letras, números e hífen, único no resource group.",
                                isCorrect: false,
                            },
                            {
                                text: "Até 24 caracteres, aceitando maiúsculas e minúsculas, único na assinatura atual.",
                                isCorrect: false,
                            },
                            {
                                text: "Até 90 caracteres, aceitando ponto e sublinhado, único dentro da região escolhida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa de conta premium com proteção contra falha de região. O que a prova espera como resposta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Contas premium não suportam GRS nem GZRS, então a combinação não existe.",
                                isCorrect: true,
                            },
                            {
                                text: "Basta configurar GZRS na criação, porque premium aceita todas as redundâncias.",
                                isCorrect: false,
                            },
                            {
                                text: "É preciso criar duas contas premium e configurar replicação de objetos entre elas.",
                                isCorrect: false,
                            },
                            {
                                text: "A proteção regional é automática em contas premium, sem configuração adicional.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual configuração só pode ser habilitada na criação da conta de armazenamento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O namespace hierárquico, que transforma a conta em Data Lake Storage Gen2.",
                                isCorrect: true,
                            },
                            {
                                text: "A camada de acesso padrão, que define se os blobs nascem em Hot ou em Cool.",
                                isCorrect: false,
                            },
                            {
                                text: "A versão mínima de TLS aceita pelas requisições feitas contra a conta criada.",
                                isCorrect: false,
                            },
                            {
                                text: "As regras de firewall que restringem o acesso a redes e faixas de IP escolhidas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais quatro serviços de dados uma conta general-purpose v2 expõe?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Blob, File, Queue e Table.",
                                isCorrect: true,
                            },
                            {
                                text: "Blob, Disk, File e Table, cobrindo objetos, discos, arquivos e dados estruturados.",
                                isCorrect: false,
                            },
                            {
                                text: "Blob, File, Queue e Disk, incluindo os discos gerenciados das máquinas virtuais.",
                                isCorrect: false,
                            },
                            {
                                text: "Blob, Table, Cosmos e Queue, integrando o armazenamento NoSQL da plataforma.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual atributo de uma conta de armazenamento pode ser alterado após a criação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A redundância, em várias combinações possíveis.",
                                isCorrect: true,
                            },
                            {
                                text: "A região, desde que a conta esteja vazia no momento em que a mudança é aplicada.",
                                isCorrect: false,
                            },
                            {
                                text: "O nome, por meio da operação de renomear disponível no portal do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "O namespace hierárquico, que pode ser habilitado quando o Data Lake for necessário.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Redundância, replicação e criptografia",
                blocks: [
                    {
                        type: "text",
                        value: "## As cinco opções de redundância\n\nEsta é uma das tabelas mais rentáveis da prova. Cada opção protege contra um nível diferente de falha.",
                    },
                    {
                        type: "table",
                        value: '[["Opção", "Cópias e onde", "Protege contra", "Leitura na secundária"], ["LRS", "3 em um local físico", "Falha de servidor e rack", "Não se aplica"], ["ZRS", "3 em zonas diferentes da região", "Perda de um datacenter", "Não se aplica"], ["GRS", "3 na primária (LRS) + 3 na secundária", "Perda da região", "Não"], ["GZRS", "3 em zonas na primária + 3 na secundária", "Zona e região", "Não"], ["RA-GRS e RA-GZRS", "Igual às acima", "Zona e região", "Sim"]]',
                    },
                    {
                        type: "text",
                        value: '## O detalhe do RA\n\nO prefixo **RA** significa read-access: a réplica secundária fica disponível para **leitura**, por um endpoint próprio no formato `<conta>-secondary.blob.core.windows.net`.\n\nSem o RA, a réplica secundária existe mas não é acessível: ela só entra em cena em um failover, seja o automático da plataforma em desastre declarado, seja o failover iniciado pelo cliente.\n\nIsso resolve o cenário de prova "a aplicação precisa continuar lendo mesmo com a região primária fora": a resposta é RA-GRS ou RA-GZRS, e não GRS puro.',
                    },
                    {
                        type: "quote",
                        value: "A replicação para a secundária no GRS é **assíncrona**, o que significa que existe uma janela de possível perda de dados em caso de failover, medida pelo **last sync time**. A replicação dentro da região, no LRS e no ZRS, é **síncrona**.",
                    },
                    {
                        type: "text",
                        value: "## Replicação de objetos\n\nDiferente da redundância, a **replicação de objetos** é uma cópia **assíncrona e configurável** de blobs de um contêiner de origem para um de destino, possivelmente em outra conta, outra assinatura e outra região.\n\nEla serve quando a redundância não resolve, porque permite escolher o destino e filtrar por prefixo.\n\nOs pré-requisitos que a prova cobra: **versionamento de blob** habilitado na origem e no destino, e **feed de alterações** habilitado na origem.",
                    },
                    {
                        type: "table",
                        value: '[["", "Redundância (GRS)", "Replicação de objetos"], ["Destino", "Região emparelhada, fixa", "Conta e região escolhidas"], ["Granularidade", "Conta inteira", "Contêiner, com filtro por prefixo"], ["Pré-requisito", "Nenhum além do tipo de conta", "Versionamento e feed de alterações"], ["Serve para", "Recuperação de desastre", "Distribuir dados e reduzir latência de leitura"]]',
                    },
                    {
                        type: "text",
                        value: "## Criptografia em repouso\n\nTodos os dados são criptografados em repouso por padrão, com AES de 256 bits, **sem custo e sem possibilidade de desativar**. O que muda é quem controla a chave:\n\n**Chaves gerenciadas pela Microsoft.** O padrão. A plataforma cria, armazena e rotaciona.\n\n**Chaves gerenciadas pelo cliente (CMK).** A chave fica em um Azure Key Vault ou Managed HSM da organização, que controla rotação e revogação. A conta acessa o cofre por uma **identidade gerenciada**, e revogar a chave torna os dados inacessíveis.\n\n**Chaves fornecidas pelo cliente.** A chave vai em cada requisição de blob, e não é armazenada pelo Azure.\n\nE há a **criptografia dupla** (infrastructure encryption), que aplica uma segunda camada com chave separada, habilitável apenas na criação da conta.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual opção de redundância protege contra a perda de um datacenter dentro da região, sem sair dela?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "ZRS.",
                                isCorrect: true,
                            },
                            {
                                text: "LRS, que mantém três cópias sincronizadas dentro de um único local físico da região.",
                                isCorrect: false,
                            },
                            {
                                text: "GRS, que replica os dados para a região secundária emparelhada de forma assíncrona.",
                                isCorrect: false,
                            },
                            {
                                text: "RA-GRS, que replica para a secundária e permite leitura a partir dela pelo endpoint.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa continuar lendo os dados mesmo com a região primária indisponível. Qual redundância atende?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "RA-GRS ou RA-GZRS.",
                                isCorrect: true,
                            },
                            {
                                text: "GRS, que mantém a réplica secundária disponível para leitura durante a indisponibilidade.",
                                isCorrect: false,
                            },
                            {
                                text: "GZRS, porque a distribuição por zonas garante leitura contínua durante a interrupção.",
                                isCorrect: false,
                            },
                            {
                                text: "ZRS, que replica entre três zonas e mantém a leitura funcionando na região primária.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A replicação para a região secundária no GRS é síncrona ou assíncrona?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Assíncrona, o que cria uma janela de possível perda medida pelo last sync time.",
                                isCorrect: true,
                            },
                            {
                                text: "Síncrona, o que garante que nenhum dado seja perdido em caso de failover regional.",
                                isCorrect: false,
                            },
                            {
                                text: "Síncrona para blobs e assíncrona para arquivos, conforme o serviço de dados usado.",
                                isCorrect: false,
                            },
                            {
                                text: "Assíncrona apenas nas contas premium, sendo síncrona nas contas standard v2.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais pré-requisitos a replicação de objetos exige?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Versionamento de blob na origem e no destino, e feed de alterações na origem.",
                                isCorrect: true,
                            },
                            {
                                text: "Redundância GRS ou GZRS configurada na conta de origem da replicação de blobs.",
                                isCorrect: false,
                            },
                            {
                                text: "Soft delete habilitado nos dois contêineres, com período mínimo de sete dias.",
                                isCorrect: false,
                            },
                            {
                                text: "Namespace hierárquico habilitado nas duas contas envolvidas na configuração.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando a chave gerenciada pelo cliente é revogada?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Os dados se tornam inacessíveis até que o acesso à chave seja restabelecido.",
                                isCorrect: true,
                            },
                            {
                                text: "O Azure passa a usar a chave gerenciada pela Microsoft como alternativa automática.",
                                isCorrect: false,
                            },
                            {
                                text: "A conta de armazenamento é bloqueada para escrita, mantendo a leitura funcionando.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada acontece, porque a criptografia em repouso independe da chave configurada.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Controle de acesso ao armazenamento",
                blocks: [
                    {
                        type: "text",
                        value: "## As quatro formas de autorizar acesso\n\nA prova cobra a escolha da forma correta conforme o requisito, e a ordem abaixo vai da menos para a mais recomendada.\n\n**Chaves de acesso.** Duas chaves por conta, cada uma com **acesso total** a tudo. Não permitem limitar escopo, permissão nem prazo. Existem duas para permitir rotação sem indisponibilidade.\n\n**Shared access signature (SAS).** Token que concede acesso delegado, limitado por recurso, permissão, prazo, faixa de IP e protocolo.\n\n**Microsoft Entra ID com RBAC.** Autorização por identidade, usando as funções de dados como Storage Blob Data Reader e Contributor. É a forma recomendada, porque não há segredo para vazar e a revogação é imediata.\n\n**Acesso anônimo.** Leitura pública de blobs, quando o conteúdo é realmente público.",
                    },
                    {
                        type: "text",
                        value: "## Os três tipos de SAS\n\nDistinção que aparece com frequência na prova.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo de SAS", "Assinado por", "Escopo", "Revogação"], ["SAS de serviço", "Chave da conta", "Um serviço, com política armazenada opcional", "Regerar chave ou alterar a política"], ["SAS de conta", "Chave da conta", "Vários serviços e operações de nível de conta", "Regerar a chave"], ["SAS de delegação de usuário", "Credencial do Entra ID", "Blob apenas", "Revogar a chave de delegação"]]',
                    },
                    {
                        type: "text",
                        value: "O **SAS de delegação de usuário** é o mais seguro dos três, porque é assinado com uma credencial do Entra ID em vez da chave da conta. Ele existe apenas para o serviço de Blob, e é a resposta para cenários que pedem SAS sem depender das chaves.",
                    },
                    {
                        type: "quote",
                        value: "Um SAS avulso só pode ser invalidado antes do vencimento **regerando a chave** que o assinou, o que invalida todos os outros tokens assinados por ela. Com uma **política de acesso armazenada**, dá para alterar ou revogar apenas os tokens ligados à política. Essa é a razão de existir da política armazenada.",
                    },
                    {
                        type: "text",
                        value: "## Firewall e redes\n\nPor padrão a conta aceita tráfego de qualquer rede. As opções de restrição:\n\n**Redes selecionadas.** Libera faixas de IP público e sub-redes específicas. Para liberar uma sub-rede, ela precisa ter o **service endpoint** de `Microsoft.Storage` habilitado.\n\n**Private endpoint.** Cria uma interface de rede com IP privado na VNet, e o acesso passa a ocorrer por esse IP, com resolução por zona DNS privada. Permite desabilitar todo o acesso público.\n\n**Exceções.** Permitir serviços confiáveis da Microsoft, o que é necessário para cenários como backup, logs de diagnóstico e algumas integrações.",
                    },
                    {
                        type: "table",
                        value: '[["Requisito", "Solução"], ["Só a sub-rede X acessa a conta", "Firewall com redes selecionadas e service endpoint"], ["A conta não pode ter endpoint público", "Private endpoint e desabilitar acesso público"], ["Backup precisa acessar mesmo com firewall", "Exceção de serviços confiáveis da Microsoft"], ["Aplicação externa lê um blob por 2 horas", "SAS com validade e permissão de leitura"], ["Aplicação no Azure lê blobs sem segredo", "Identidade gerenciada com função de dados"]]',
                    },
                    {
                        type: "text",
                        value: "## Desabilitar chaves compartilhadas\n\nUma configuração que a prova cobra: é possível **desabilitar a autorização por chave compartilhada** na conta, forçando todo o acesso a usar Entra ID. Isso invalida chaves e SAS de serviço e de conta, mas mantém o SAS de delegação de usuário, que é assinado por credencial do Entra.\n\nÉ a configuração recomendada em ambientes que precisam eliminar segredos de longa duração, e o efeito colateral é que aplicações legadas que dependem de chave param de funcionar.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual forma de autorização é recomendada por não ter segredo para vazar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Microsoft Entra ID com as funções de dados do RBAC.",
                                isCorrect: true,
                            },
                            {
                                text: "Chaves de acesso da conta, rotacionadas periodicamente por uma automação própria.",
                                isCorrect: false,
                            },
                            {
                                text: "SAS de conta com validade curta, renovado automaticamente por uma função do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Acesso anônimo de leitura, que dispensa qualquer credencial na requisição feita.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual tipo de SAS é assinado com credencial do Entra ID em vez da chave da conta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "SAS de delegação de usuário.",
                                isCorrect: true,
                            },
                            {
                                text: "SAS de serviço, que limita o acesso a um único serviço de dados da conta criada.",
                                isCorrect: false,
                            },
                            {
                                text: "SAS de conta, que abrange vários serviços e operações no nível da própria conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos os três tipos podem ser assinados com credencial do Microsoft Entra ID.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que existe a política de acesso armazenada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para permitir revogar tokens específicos sem regerar a chave da conta.",
                                isCorrect: true,
                            },
                            {
                                text: "Para permitir que o SAS tenha validade ilimitada, dispensando a data de expiração.",
                                isCorrect: false,
                            },
                            {
                                text: "Para permitir que o SAS abranja mais de uma conta de armazenamento ao mesmo tempo.",
                                isCorrect: false,
                            },
                            {
                                text: "Para permitir que o SAS seja assinado com credencial do Microsoft Entra ID.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O firewall da conta precisa liberar uma sub-rede específica. O que é necessário na sub-rede?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O service endpoint de Microsoft.Storage habilitado.",
                                isCorrect: true,
                            },
                            {
                                text: "Um network security group com regra de permissão para o endereço público da conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma rota definida pelo usuário com próximo salto do tipo internet para o serviço.",
                                isCorrect: false,
                            },
                            {
                                text: "Um private endpoint criado na sub-rede, com registro em zona DNS privada vinculada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece com o SAS de delegação de usuário quando a chave compartilhada é desabilitada na conta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ele continua funcionando, porque é assinado por credencial do Entra ID.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele para de funcionar junto com os demais tipos de SAS existentes na conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele passa a exigir a exceção de serviços confiáveis da Microsoft para funcionar.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele é convertido automaticamente em SAS de serviço pela plataforma do Azure.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Blob Storage: camadas, versões e ciclo de vida",
                blocks: [
                    {
                        type: "text",
                        value: "## As camadas de acesso\n\nA escolha da camada equilibra custo de armazenamento contra custo e latência de acesso.",
                    },
                    {
                        type: "table",
                        value: '[["Camada", "Custo de armazenar", "Custo de acessar", "Retenção mínima", "Leitura"], ["Hot", "Maior", "Menor", "Nenhuma", "Imediata"], ["Cool", "Menor que Hot", "Maior que Hot", "30 dias", "Imediata"], ["Cold", "Menor que Cool", "Maior que Cool", "90 dias", "Imediata"], ["Archive", "O menor", "O maior", "180 dias", "Exige reidratação"]]',
                    },
                    {
                        type: "text",
                        value: "Dois detalhes que a prova cobra:\n\n**Archive é offline.** O blob não pode ser lido nem modificado. É preciso **reidratar** para uma camada online, alterando a camada ou copiando para outro blob, e isso leva horas na prioridade padrão ou menos de uma hora na prioridade alta.\n\n**Retenção mínima gera cobrança de saída antecipada.** Mover ou excluir um blob antes do prazo mínimo da camada cobra a diferença proporcional. Isso torna a movimentação apressada entre camadas mais caro do que deixar parado.\n\nA camada pode ser definida na conta (padrão para blobs novos) ou por blob individual. Archive só existe no nível do blob.",
                    },
                    {
                        type: "text",
                        value: "## Proteção de dados: quatro recursos que se confundem\n\nEsta é uma das confusões mais frequentes do domínio de armazenamento.",
                    },
                    {
                        type: "table",
                        value: '[["Recurso", "O que faz", "Automático?"], ["Soft delete de blob", "Retém blobs excluídos por N dias", "Sim, ao excluir"], ["Soft delete de contêiner", "Retém contêineres excluídos por N dias", "Sim, ao excluir"], ["Versionamento", "Cria uma versão a cada modificação", "Sim, ao alterar"], ["Snapshot", "Cria cópia somente leitura sob demanda", "Não, é manual"]]',
                    },
                    {
                        type: "quote",
                        value: "A âncora: **soft delete protege contra exclusão**, **versionamento protege contra sobrescrita**, e **snapshot é uma foto que você tira de propósito**. Os três podem coexistir, e todos consomem armazenamento cobrado.",
                    },
                    {
                        type: "text",
                        value: "## Gerenciamento do ciclo de vida\n\nAs regras de ciclo de vida automatizam a transição entre camadas e a exclusão, com base em idade. Elas são avaliadas **uma vez por dia** e podem filtrar por prefixo de blob e por tags de índice de blob.\n\nAs condições disponíveis: dias desde a criação, dias desde a última modificação, dias desde o último acesso (exige acompanhamento de acesso habilitado) e dias desde a criação da versão ou do snapshot.",
                    },
                    {
                        type: "code",
                        value: '{\n  "rules": [\n    {\n      "name": "arquivar-e-expirar-logs",\n      "enabled": true,\n      "type": "Lifecycle",\n      "definition": {\n        "filters": {\n          "blobTypes": [ "blockBlob" ],\n          "prefixMatch": [ "logs/" ]\n        },\n        "actions": {\n          "baseBlob": {\n            "tierToCool":    { "daysAfterModificationGreaterThan": 30 },\n            "tierToArchive": { "daysAfterModificationGreaterThan": 90 },\n            "delete":        { "daysAfterModificationGreaterThan": 365 }\n          },\n          "snapshot": {\n            "delete": { "daysAfterCreationGreaterThan": 90 }\n          }\n        }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## Imutabilidade\n\nPara requisitos regulatórios, o Blob Storage oferece políticas de imutabilidade em dois modos:\n\n**Retenção baseada em tempo.** O blob não pode ser modificado nem excluído por um período definido.\n\n**Retenção legal (legal hold).** O blob fica protegido até que a retenção seja explicitamente removida, sem prazo definido.\n\nAs políticas podem ser aplicadas no nível do contêiner ou da versão do blob, e no modo bloqueado a política não pode ser reduzida nem removida, apenas estendida. É a resposta para cenários de conformidade que exigem WORM, ou seja, escrever uma vez e ler muitas.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual camada de acesso exige reidratação antes da leitura?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Archive.",
                                isCorrect: true,
                            },
                            {
                                text: "Cool, indicada para dados acessados com pouca frequência e retidos por 30 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "Cold, indicada para dados raramente acessados e retidos por pelo menos 90 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "Hot, indicada para dados acessados com frequência e que exigem leitura imediata.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a retenção mínima da camada Cool?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "30 dias.",
                                isCorrect: true,
                            },
                            {
                                text: "90 dias, o mesmo prazo exigido pela camada Cold para evitar cobrança antecipada.",
                                isCorrect: false,
                            },
                            {
                                text: "180 dias, o mesmo prazo mínimo exigido pela camada Archive de armazenamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma retenção mínima, porque apenas Archive tem prazo mínimo de permanência.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual recurso protege contra sobrescrita acidental de um blob?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Versionamento, que cria uma versão a cada modificação feita no blob.",
                                isCorrect: true,
                            },
                            {
                                text: "Soft delete de blob, que retém o blob excluído pelo período configurado na conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Snapshot, que precisa ser criado manualmente antes de cada alteração no conteúdo.",
                                isCorrect: false,
                            },
                            {
                                text: "Política de imutabilidade com retenção legal aplicada ao contêiner de destino.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Com que frequência as regras de ciclo de vida são avaliadas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma vez por dia.",
                                isCorrect: true,
                            },
                            {
                                text: "A cada hora, o que permite transições quase imediatas entre as camadas de acesso.",
                                isCorrect: false,
                            },
                            {
                                text: "A cada operação de leitura ou escrita realizada no blob que a regra alcança.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma vez por semana, coincidindo com a janela de manutenção da plataforma.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual modo de imutabilidade protege o blob até que a retenção seja explicitamente removida?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Retenção legal (legal hold).",
                                isCorrect: true,
                            },
                            {
                                text: "Retenção baseada em tempo, com o período definido na política aplicada ao contêiner.",
                                isCorrect: false,
                            },
                            {
                                text: "Soft delete de contêiner, que retém o conteúdo pelo período configurado na conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Versionamento com bloqueio, que impede a exclusão das versões anteriores criadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Azure Files, Storage Explorer e AzCopy",
                blocks: [
                    {
                        type: "text",
                        value: "## Azure Files\n\nO **Azure Files** oferece compartilhamentos de arquivos totalmente gerenciados, acessíveis por **SMB**, **NFS** e pela API REST. Ele substitui servidores de arquivo e permite montar o compartilhamento em Windows, Linux e macOS, inclusive de máquinas locais.\n\nDois níveis de desempenho:\n\n**Standard**, em contas general-purpose v2, com armazenamento em HDD e opções de redundância LRS, ZRS, GRS e GZRS.\n\n**Premium**, em contas premium file shares, com armazenamento em SSD, provisionamento de capacidade e apenas LRS e ZRS.",
                    },
                    {
                        type: "text",
                        value: '## As duas formas de autenticar no Azure Files\n\nDistinção que a prova cobra:\n\n**Chave da conta de armazenamento.** O compartilhamento é montado com a chave, e todo mundo que a tem acessa tudo. Não há permissão por pasta.\n\n**Identidade (Kerberos).** Com autenticação baseada em identidade, usando Active Directory Domain Services local, Microsoft Entra Domain Services ou Microsoft Entra Kerberos, o acesso passa a respeitar permissões de compartilhamento por **RBAC** e permissões de arquivo e pasta por **NTFS**.\n\nA resposta para "precisamos de permissão granular por pasta, como no servidor de arquivos atual" é sempre a autenticação baseada em identidade.',
                    },
                    {
                        type: "table",
                        value: '[["Requisito", "Configuração"], ["Montar rapidamente para testes", "Chave da conta"], ["Permissão por pasta como no AD", "Identidade com Kerberos, RBAC e NTFS"], ["Acesso de máquina Linux", "NFS em conta premium, ou SMB com montagem"], ["Cache local em servidor de arquivos", "Azure File Sync"], ["Versões anteriores para o usuário restaurar", "Snapshots de compartilhamento"]]',
                    },
                    {
                        type: "quote",
                        value: "A porta **445** (SMB) é bloqueada por muitos provedores de internet residenciais e corporativos, o que faz a montagem falhar de fora do Azure. As alternativas são VPN, ExpressRoute ou private endpoint, e esse é um problema de diagnóstico que aparece em cenários.",
                    },
                    {
                        type: "text",
                        value: '## Azure File Sync\n\nO **File Sync** transforma um servidor Windows local em um cache do compartilhamento na nuvem, com **cloud tiering**: os arquivos frios ficam apenas no Azure e o servidor mantém localmente só os quentes, liberando espaço em disco.\n\nOs componentes: o **Storage Sync Service** no Azure, o **grupo de sincronização** que define o compartilhamento e os endpoints, o **endpoint de nuvem** que é o compartilhamento, e os **endpoints de servidor** que são as pastas nos servidores registrados.\n\nÉ a resposta para "queremos manter o servidor de arquivos local, mas com backup e capacidade na nuvem".',
                    },
                    {
                        type: "text",
                        value: "## Storage Explorer e AzCopy\n\n**Azure Storage Explorer.** Aplicação gráfica de desktop para navegar e gerenciar blobs, arquivos, filas e tabelas, em várias contas e assinaturas. Boa para operações interativas, inspeção e transferências pontuais. Internamente usa o AzCopy para as transferências grandes.\n\n**AzCopy.** Ferramenta de linha de comando para cópia e sincronização em alto desempenho, com **retomada** de transferências interrompidas, paralelismo, e autenticação por SAS ou por Entra ID. É a escolha para volumes grandes, scripts e migrações.",
                    },
                    {
                        type: "code",
                        value: '# Login por identidade (evita manipular chave)\nazcopy login\n\n# Copiar uma pasta local para um container, recursivamente\nazcopy copy "C:\\dados\\relatorios" "https://stconta.blob.core.windows.net/backup" --recursive\n\n# Sincronizar, transferindo apenas as diferencas\nazcopy sync "C:\\dados\\relatorios" "https://stconta.blob.core.windows.net/backup" --recursive\n\n# Copiar entre duas contas, sem passar pela maquina local\nazcopy copy "https://origem.blob.core.windows.net/c1?<sas>" \\\n            "https://destino.blob.core.windows.net/c2?<sas>" --recursive',
                    },
                    {
                        type: "text",
                        value: "## Escolhendo a ferramenta de transferência\n\nO critério que a prova usa é o **volume** e o **modo**:\n\n- **poucos arquivos, interativo**: portal ou Storage Explorer;\n- **volume grande, script, retomada**: AzCopy;\n- **sincronização contínua de servidor local**: Azure File Sync;\n- **volume muito grande com rede insuficiente**: Azure Data Box, que é o dispositivo físico enviado pela Microsoft;\n- **migração de dados de outra nuvem ou serviço**: Azure Data Factory ou o Storage Mover, conforme o caso.\n\nO Data Box aparece em cenários com dezenas ou centenas de terabytes, em que a transferência pela rede levaria semanas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que a autenticação baseada em identidade no Azure Files permite que a chave da conta não permite?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Permissões de arquivo e pasta por NTFS, além de RBAC no compartilhamento.",
                                isCorrect: true,
                            },
                            {
                                text: "Montar o compartilhamento em máquinas Linux usando o protocolo SMB da plataforma.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar snapshots do compartilhamento para restauração pelo próprio usuário final.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar o cloud tiering para manter apenas os arquivos quentes no servidor local.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A montagem de um compartilhamento do Azure Files falha de fora do Azure. Qual é a causa mais provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A porta 445 está bloqueada pelo provedor de rede.",
                                isCorrect: true,
                            },
                            {
                                text: "A conta de armazenamento não tem o namespace hierárquico habilitado na criação.",
                                isCorrect: false,
                            },
                            {
                                text: "O compartilhamento está em uma conta premium, que aceita apenas acesso interno.",
                                isCorrect: false,
                            },
                            {
                                text: "A camada de acesso do compartilhamento está definida como Archive na conta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o cloud tiering do Azure File Sync faz?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Mantém localmente apenas os arquivos quentes, deixando os frios só no Azure.",
                                isCorrect: true,
                            },
                            {
                                text: "Replica o compartilhamento para uma segunda região, mantendo as duas cópias ativas.",
                                isCorrect: false,
                            },
                            {
                                text: "Move os arquivos entre as camadas Hot, Cool e Archive conforme a idade deles.",
                                isCorrect: false,
                            },
                            {
                                text: "Sincroniza as permissões NTFS entre o servidor local e o compartilhamento na nuvem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa transferir 200 TB para o Azure e a rede levaria semanas. Qual solução é indicada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Azure Data Box, o dispositivo físico enviado pela Microsoft.",
                                isCorrect: true,
                            },
                            {
                                text: "AzCopy com paralelismo máximo e retomada automática das transferências interrompidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure File Sync com cloud tiering habilitado nos servidores de arquivo existentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Storage Explorer, dividindo a transferência em lotes executados em paralelo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual comando do AzCopy transfere apenas as diferenças entre origem e destino?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "azcopy sync.",
                                isCorrect: true,
                            },
                            {
                                text: "azcopy copy, que compara os arquivos e envia somente os que foram alterados.",
                                isCorrect: false,
                            },
                            {
                                text: "azcopy login, que autentica e habilita a transferência incremental por padrão.",
                                isCorrect: false,
                            },
                            {
                                text: "azcopy jobs resume, que retoma a transferência a partir do ponto de interrupção.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Computação",
        aulas: [
            {
                titulo: "Templates ARM e Bicep",
                blocks: [
                    {
                        type: "text",
                        value: "## Infraestrutura como código no Azure\n\nUm **template ARM** é um arquivo JSON declarativo que descreve os recursos a criar. O **Bicep** é uma linguagem de domínio específico que compila para esse mesmo JSON, com sintaxe muito mais enxuta.\n\nOs benefícios que a prova cobra: repetibilidade, versionamento em Git, validação antes de aplicar, implantação de recursos interdependentes na ordem correta e possibilidade de revisão por outra pessoa antes de mudar o ambiente.",
                    },
                    {
                        type: "text",
                        value: "## A estrutura de um template ARM\n\nSeis seções, e a prova pergunta a função de cada uma.",
                    },
                    {
                        type: "table",
                        value: '[["Seção", "Função", "Obrigatória?"], ["$schema", "Versão do esquema do template", "Sim"], ["contentVersion", "Versão do próprio template, definida por você", "Sim"], ["parameters", "Valores informados na implantação", "Não"], ["variables", "Valores calculados internamente para reuso", "Não"], ["resources", "Os recursos a criar ou atualizar", "Sim"], ["outputs", "Valores devolvidos após a implantação", "Não"]]',
                    },
                    {
                        type: "code",
                        value: '{\n  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",\n  "contentVersion": "1.0.0.0",\n  "parameters": {\n    "nomeConta": { "type": "string", "minLength": 3, "maxLength": 24 },\n    "criarBackup": { "type": "bool", "defaultValue": false }\n  },\n  "variables": {\n    "regiao": "[resourceGroup().location]"\n  },\n  "resources": [\n    {\n      "type": "Microsoft.Storage/storageAccounts",\n      "apiVersion": "2023-01-01",\n      "name": "[parameters(\'nomeConta\')]",\n      "location": "[variables(\'regiao\')]",\n      "sku": { "name": "Standard_LRS" },\n      "kind": "StorageV2",\n      "condition": "[parameters(\'criarBackup\')]"\n    }\n  ],\n  "outputs": {\n    "idDaConta": {\n      "type": "string",\n      "value": "[resourceId(\'Microsoft.Storage/storageAccounts\', parameters(\'nomeConta\'))]"\n    }\n  }\n}',
                    },
                    {
                        type: "text",
                        value: "## O mesmo em Bicep\n\nCompare o volume de código. O Bicep dispensa as expressões entre colchetes, infere tipos e resolve dependências automaticamente quando um recurso referencia outro.",
                    },
                    {
                        type: "code",
                        value: "param nomeConta string\nparam criarBackup bool = false\n\nvar regiao = resourceGroup().location\n\nresource conta 'Microsoft.Storage/storageAccounts@2023-01-01' = if (criarBackup) {\n  name: nomeConta\n  location: regiao\n  sku: { name: 'Standard_LRS' }\n  kind: 'StorageV2'\n}\n\noutput idDaConta string = conta.id",
                    },
                    {
                        type: "quote",
                        value: "Dois comandos que a prova cobra: `az bicep build` compila Bicep para JSON, e `az bicep decompile` faz o caminho inverso, convertendo um template JSON existente em Bicep. O segundo é útil para migrar templates antigos.",
                    },
                    {
                        type: "text",
                        value: "## Os dois modos de implantação\n\n**Incremental**, o padrão. Os recursos declarados são criados ou atualizados, e os recursos existentes no resource group que **não** estão no template permanecem inalterados.\n\n**Complete.** Os recursos existentes que não estão declarados no template são **excluídos**.\n\nO modo Complete é útil para garantir que o ambiente reflita exatamente o template, e perigoso em resource groups compartilhados, porque apaga o que outra equipe criou fora do template.",
                    },
                    {
                        type: "text",
                        value: "## Validação e simulação\n\nTrês recursos que evitam surpresa:\n\n**Validate.** Verifica a sintaxe e as referências do template, sem implantar.\n\n**What-if.** Mostra as mudanças que a implantação faria, incluindo criações, modificações e exclusões. É a proteção contra o modo Complete apagar algo por engano.\n\n**Histórico de implantações.** O resource group guarda as últimas implantações, com os parâmetros e o resultado de cada uma, e permite exportar o template correspondente.",
                    },
                    {
                        type: "code",
                        value: "# Validar sem aplicar\naz deployment group validate --resource-group rg-app --template-file main.bicep\n\n# Simular e ver o que mudaria\naz deployment group what-if --resource-group rg-app --template-file main.bicep\n\n# Implantar em modo incremental (padrao)\naz deployment group create --resource-group rg-app --template-file main.bicep \\\n  --parameters nomeConta=stappbrs001\n\n# Exportar o template do que ja existe\naz group export --name rg-app > exportado.json",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual seção de um template ARM declara os valores informados no momento da implantação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "parameters.",
                                isCorrect: true,
                            },
                            {
                                text: "variables, que define valores calculados internamente para reuso dentro do template.",
                                isCorrect: false,
                            },
                            {
                                text: "outputs, que devolve valores após a conclusão da implantação que foi executada.",
                                isCorrect: false,
                            },
                            {
                                text: "resources, que declara os recursos a serem criados ou atualizados pelo template.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o comportamento do modo de implantação Complete?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Exclui do resource group os recursos que não estão declarados no template.",
                                isCorrect: true,
                            },
                            {
                                text: "Mantém os recursos existentes não declarados, atualizando apenas os do template.",
                                isCorrect: false,
                            },
                            {
                                text: "Falha a implantação quando encontra um recurso não declarado no resource group.",
                                isCorrect: false,
                            },
                            {
                                text: "Recria todos os recursos do grupo na ordem em que aparecem no template usado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual comando mostra as mudanças que uma implantação faria, sem aplicá-las?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "what-if.",
                                isCorrect: true,
                            },
                            {
                                text: "validate, que confere a sintaxe e as referências declaradas no template informado.",
                                isCorrect: false,
                            },
                            {
                                text: "export, que gera o template correspondente aos recursos existentes no grupo.",
                                isCorrect: false,
                            },
                            {
                                text: "decompile, que converte o template JSON para o formato Bicep equivalente a ele.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual comando converte um template ARM em JSON para Bicep?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "az bicep decompile.",
                                isCorrect: true,
                            },
                            {
                                text: "az bicep build, que gera o arquivo Bicep a partir do template JSON existente.",
                                isCorrect: false,
                            },
                            {
                                text: "az deployment group export, que exporta o template no formato Bicep atualizado.",
                                isCorrect: false,
                            },
                            {
                                text: "az group export, que gera o arquivo Bicep dos recursos existentes no grupo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual vantagem o Bicep tem sobre o JSON quanto a dependências entre recursos?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ele resolve dependências automaticamente quando um recurso referencia outro.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele exige a propriedade dependsOn em todos os recursos, o que evita ambiguidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele implanta todos os recursos em paralelo, sem considerar ordem de dependência.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele não suporta dependências, e por isso cada recurso precisa de um arquivo próprio.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Máquinas virtuais: criação, tamanhos e discos",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é criado junto com uma VM\n\nCriar uma máquina virtual cria vários recursos relacionados, e a prova cobra essa lista porque ela explica custos residuais e falhas de exclusão:\n\n- a própria **máquina virtual**;\n- o **disco de sistema operacional**, um disco gerenciado;\n- os **discos de dados**, se solicitados;\n- uma **interface de rede** (NIC);\n- opcionalmente um **IP público** e um **network security group**;\n- a associação a uma **rede virtual** e **sub-rede** existentes ou novas.\n\nExcluir a VM pelo portal permite escolher quais desses recursos vão junto. Excluir sem marcar as opções deixa discos e IPs órfãos, que continuam sendo cobrados.",
                    },
                    {
                        type: "text",
                        value: "## Famílias de tamanho\n\nA prova não pede decorar tamanhos, mas pede reconhecer a **família adequada ao perfil de carga**.",
                    },
                    {
                        type: "table",
                        value: '[["Família", "Perfil", "Exemplo de uso"], ["B (burstable)", "Créditos de CPU acumulados", "Ambientes de teste, cargas intermitentes"], ["D (uso geral)", "Equilíbrio entre CPU e memória", "Servidores de aplicação, web"], ["E (memória)", "Alta relação memória por vCPU", "Bancos de dados, cache"], ["F (computação)", "Alta relação CPU por memória", "Processamento em lote, servidores de jogo"], ["L (armazenamento)", "Disco local NVMe de alta taxa", "Bancos NoSQL, data warehouse"], ["N (GPU)", "Aceleração por GPU", "Treino de modelo, renderização"], ["H (HPC)", "Computação de alto desempenho", "Simulação, engenharia"]]',
                    },
                    {
                        type: "quote",
                        value: "As famílias **B** acumulam crédito de CPU quando usam menos que a linha de base e gastam o crédito em picos. Quando o crédito acaba, o desempenho é limitado. Isso as torna ótimas para teste e ruins para carga constante, o que aparece em cenários de prova sobre desempenho inconsistente.",
                    },
                    {
                        type: "text",
                        value: "## Discos gerenciados\n\nQuatro tipos, e a escolha aparece em cenários de desempenho e custo.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo", "Mídia", "Desempenho", "Uso típico"], ["Standard HDD", "HDD", "Variável, o mais baixo", "Backup, acesso pouco frequente"], ["Standard SSD", "SSD", "Melhor que HDD, sem garantia forte", "Web leve, dev e teste"], ["Premium SSD", "SSD", "IOPS e throughput garantidos por tamanho", "Produção exigente"], ["Ultra Disk", "SSD", "O mais alto, IOPS configurável", "Bancos críticos, SAP HANA"]]',
                    },
                    {
                        type: "text",
                        value: "Detalhes que a prova cobra sobre discos:\n\n**O desempenho do Premium SSD depende do tamanho do disco.** Um P10 entrega menos IOPS que um P30. Aumentar o desempenho exige aumentar o disco.\n\n**Discos podem ser expandidos, nunca reduzidos.** A expansão pode exigir desalocar a VM conforme o caso, e depois é preciso estender a partição no sistema operacional.\n\n**O Ultra Disk tem restrições.** Exige regiões e tamanhos de VM específicos, e exige zona de disponibilidade.\n\n**O disco temporário não é gerenciado.** É armazenamento local do host e perde o conteúdo em desalocação, redimensionamento e manutenção.",
                    },
                    {
                        type: "code",
                        value: '# Criar VM com disco de dados premium\naz vm create \\\n  --resource-group rg-app --name vm-sql01 \\\n  --image Win2022Datacenter --size Standard_E4ds_v5 \\\n  --admin-username azadmin \\\n  --data-disk-sizes-gb 256 --storage-sku Premium_LRS \\\n  --zone 1 --public-ip-address ""\n\n# Expandir um disco de dados (requer atencao ao estado da VM)\naz vm disk resize --resource-group rg-app --name disco-dados-01 --size-gb 512\n\n# Listar tamanhos disponiveis na regiao\naz vm list-sizes --location brazilsouth -o table',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Quais recursos continuam sendo cobrados se a VM for excluída sem marcar as opções de exclusão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Os discos gerenciados e o IP público, que ficam órfãos.",
                                isCorrect: true,
                            },
                            {
                                text: "A computação da máquina, cobrada até o fim do ciclo de faturamento corrente.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum, porque excluir a máquina remove todos os recursos criados junto com ela.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas a interface de rede, que precisa ser removida em uma operação separada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma carga tem desempenho inconsistente em uma VM da família B. Qual é a causa provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O crédito de CPU acabou, e o desempenho passou a ser limitado à linha de base.",
                                isCorrect: true,
                            },
                            {
                                text: "O disco de sistema operacional está na camada Standard HDD, limitando a operação.",
                                isCorrect: false,
                            },
                            {
                                text: "A máquina não está em uma zona de disponibilidade, o que reduz a prioridade dela.",
                                isCorrect: false,
                            },
                            {
                                text: "A rede acelerada não está habilitada na interface de rede daquela máquina virtual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como aumentar o IOPS garantido de um disco Premium SSD?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Aumentando o tamanho do disco, porque o desempenho é atrelado a ele.",
                                isCorrect: true,
                            },
                            {
                                text: "Alterando a camada de acesso do disco de Standard para Premium na configuração.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitando o cache de leitura e escrita na configuração do disco anexado à VM.",
                                isCorrect: false,
                            },
                            {
                                text: "Movendo o disco para uma conta de armazenamento premium na mesma região da VM.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "É possível reduzir o tamanho de um disco gerenciado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, discos podem ser expandidos, mas nunca reduzidos.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, desde que a máquina virtual esteja desalocada no momento da alteração.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, mas apenas em discos de dados, e nunca no disco de sistema operacional.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, por meio de um snapshot criado com o novo tamanho desejado para o disco.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual requisito o Ultra Disk impõe, além de região e tamanho de VM compatíveis?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Zona de disponibilidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Conta de armazenamento premium criada previamente no mesmo resource group.",
                                isCorrect: false,
                            },
                            {
                                text: "Availability set configurado com pelo menos três domínios de falha distintos.",
                                isCorrect: false,
                            },
                            {
                                text: "Rede acelerada habilitada na interface de rede da máquina que usa o disco.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Disponibilidade: zonas, conjuntos e Scale Sets",
                blocks: [
                    {
                        type: "text",
                        value: "## Os três níveis de proteção\n\nA prova apresenta um requisito de disponibilidade e pede a configuração. A chave é reconhecer **contra o que** o requisito quer proteger.",
                    },
                    {
                        type: "table",
                        value: '[["Opção", "Protege contra", "SLA típico de VM"], ["VM única com discos premium", "Nada além de falha de disco", "99,9%"], ["Availability set", "Falha de rack e manutenção do host", "99,95%"], ["Duas ou mais VMs em zonas diferentes", "Perda de um datacenter da região", "99,99%"]]',
                    },
                    {
                        type: "text",
                        value: "## Availability set em detalhe\n\nUm availability set distribui as máquinas em dois eixos:\n\n**Fault domains.** Grupos que compartilham fonte de energia e switch de rede. Até três por conjunto na maioria das regiões. Protegem contra falha de hardware compartilhado.\n\n**Update domains.** Grupos reiniciados juntos durante manutenção planejada da plataforma. Até vinte por conjunto. O Azure reinicia um por vez.\n\nDuas restrições que a prova cobra: o availability set precisa ser escolhido na **criação** da VM, e **não é possível combinar** availability set com availability zone para a mesma máquina.",
                    },
                    {
                        type: "quote",
                        value: "Um availability set com apenas **uma** máquina não oferece nenhuma proteção adicional, e não atinge o SLA de 99,95%, que exige **duas ou mais** instâncias no conjunto. O mesmo raciocínio vale para zonas: uma VM em uma zona não tem SLA de 99,99%.",
                    },
                    {
                        type: "text",
                        value: "## Virtual Machine Scale Sets\n\nUm Scale Set gerencia um conjunto de VMs idênticas, com escala automática e balanceamento. Ele resolve escala **horizontal**, ou seja, variar a quantidade de instâncias.\n\nOs elementos que a prova cobra:\n\n**Modo de orquestração.** Uniform, com instâncias idênticas a partir de um perfil, e Flexible, que permite instâncias heterogêneas e maior controle individual.\n\n**Regras de escala.** Baseadas em métrica, como CPU média, ou em agenda, para picos previsíveis. Cada regra tem uma condição, uma ação e um período de espera (cooldown) para evitar oscilação.\n\n**Limites.** Contagem mínima, máxima e padrão de instâncias.\n\n**Distribuição.** Zonas de disponibilidade escolhidas na criação, e não alteráveis depois.\n\n**Política de atualização.** Manual, automática ou rolling, esta última exigindo extensão de saúde configurada.",
                    },
                    {
                        type: "code",
                        value: '# Criar Scale Set em tres zonas\naz vmss create \\\n  --resource-group rg-app --name vmss-web \\\n  --image Ubuntu2204 --instance-count 3 \\\n  --zones 1 2 3 --upgrade-policy-mode automatic \\\n  --load-balancer lb-web\n\n# Regra de escala por CPU media\naz monitor autoscale create --resource-group rg-app \\\n  --resource vmss-web --resource-type Microsoft.Compute/virtualMachineScaleSets \\\n  --name autoscale-web --min-count 2 --max-count 10 --count 3\n\naz monitor autoscale rule create --resource-group rg-app --autoscale-name autoscale-web \\\n  --condition "Percentage CPU > 70 avg 10m" --scale out 2\n\naz monitor autoscale rule create --resource-group rg-app --autoscale-name autoscale-web \\\n  --condition "Percentage CPU < 30 avg 10m" --scale in 1',
                    },
                    {
                        type: "text",
                        value: "## Escala vertical contra horizontal\n\n**Vertical.** Muda o tamanho da máquina, com mais CPU e memória. Exige reinício, e pode exigir desalocação quando o tamanho alvo pertence a outra família de hardware. Tem um teto: o maior tamanho disponível.\n\n**Horizontal.** Muda a quantidade de instâncias. Não exige reiniciar as existentes, escala muito além do teto de uma máquina e permite tolerância a falha, porque a carga não depende de uma instância só.\n\nAplicações que mantêm estado na memória local dificultam a escala horizontal, e a solução é externalizar o estado, em cache distribuído ou banco.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual configuração atinge o SLA de 99,99% para máquinas virtuais?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Duas ou mais VMs distribuídas em zonas de disponibilidade diferentes.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma VM em uma zona de disponibilidade com discos Premium SSD anexados a ela.",
                                isCorrect: false,
                            },
                            {
                                text: "Duas ou mais VMs em um availability set com três domínios de falha ativos.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma VM única com discos Ultra Disk e rede acelerada habilitada na interface.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é um fault domain em um availability set?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um grupo que compartilha fonte de energia e switch de rede.",
                                isCorrect: true,
                            },
                            {
                                text: "Um grupo de máquinas reiniciado junto durante a manutenção planejada da plataforma.",
                                isCorrect: false,
                            },
                            {
                                text: "Um conjunto de máquinas distribuídas entre zonas de disponibilidade da região.",
                                isCorrect: false,
                            },
                            {
                                text: "Um agrupamento lógico usado para aplicar a mesma política de atualização às VMs.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "É possível colocar uma VM em um availability set e em uma availability zone ao mesmo tempo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, as duas opções são mutuamente exclusivas para a mesma máquina.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, e a combinação eleva o SLA para além dos 99,99% oferecidos pelas zonas.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que o availability set tenha sido criado na mesma zona da máquina.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, mas apenas em Scale Sets no modo de orquestração Flexible da plataforma.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que serve o período de espera (cooldown) em uma regra de escala automática?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Evitar oscilação, impedindo ações de escala em sequência muito próxima.",
                                isCorrect: true,
                            },
                            {
                                text: "Definir por quanto tempo a métrica precisa ficar acima do limite antes de escalar.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir o intervalo em que a métrica é coletada pelo serviço de monitoramento.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir quanto tempo as novas instâncias levam para entrar no balanceador de carga.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica de aplicação dificulta a escala horizontal?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Manter estado na memória local de cada instância.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar um banco de dados relacional externo para persistir as informações da sessão.",
                                isCorrect: false,
                            },
                            {
                                text: "Expor as funcionalidades por meio de uma API sem estado sobre o protocolo HTTP.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar em contêineres gerenciados por um orquestrador dentro da mesma região.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Contêineres: ACR, Container Instances e Container Apps",
                blocks: [
                    {
                        type: "text",
                        value: "## Azure Container Registry\n\nO **ACR** é o registro privado gerenciado para imagens de contêiner e artefatos OCI, com autenticação integrada ao Entra ID e autorização por RBAC.\n\nTrês camadas, e a diferença aparece em prova:",
                    },
                    {
                        type: "table",
                        value: '[["Camada", "Armazenamento incluído", "Recursos adicionais"], ["Basic", "Menor", "Para desenvolvimento e avaliação"], ["Standard", "Maior", "Mais throughput, produção comum"], ["Premium", "O maior", "Geo-replicação, links privados, escopos de token, confiança de conteúdo"]]',
                    },
                    {
                        type: "quote",
                        value: 'A **geo-replicação** existe apenas na camada **Premium**. Ela mantém réplicas do registro em várias regiões sob um único nome de host, o que reduz latência de pull e custo de saída de dados. É a resposta para "clusters em três regiões puxando a mesma imagem".',
                    },
                    {
                        type: "text",
                        value: "## As formas de autenticar no ACR\n\n- **identidade do Entra ID**, individual ou de serviço, com funções como AcrPull e AcrPush;\n- **identidade gerenciada** de um recurso do Azure, o que dispensa segredo;\n- **usuário administrador**, uma conta única por registro, desabilitada por padrão e não recomendada para produção;\n- **tokens com escopo**, disponíveis na Premium, que limitam o acesso a repositórios específicos.\n\nAs funções que a prova cobra: **AcrPull** para baixar imagem, **AcrPush** para enviar, e **Contributor** ou **Owner** para gerenciar o registro em si.",
                    },
                    {
                        type: "text",
                        value: "## Container Instances e Container Apps\n\nA escolha entre os dois é uma pergunta clássica.",
                    },
                    {
                        type: "table",
                        value: '[["", "Container Instances (ACI)", "Container Apps (ACA)"], ["Orquestração", "Nenhuma", "Gerenciada, sobre Kubernetes"], ["Escala automática", "Não", "Sim, por evento e HTTP, inclusive a zero"], ["Ingresso HTTP", "IP e FQDN simples", "Gerenciado, com TLS e domínio próprio"], ["Revisões e tráfego dividido", "Não", "Sim"], ["Microserviços", "Não", "Sim, com Dapr e service discovery"], ["Cobrança", "Por segundo de execução", "Por consumo, com escala a zero"], ["Caso típico", "Tarefa isolada, job em lote, burst", "Aplicação web e API, microserviços"]]',
                    },
                    {
                        type: "text",
                        value: "## Conceitos de ACI\n\n**Container group.** A unidade de implantação, análoga a um pod: um ou mais contêineres que compartilham ciclo de vida, rede e volumes.\n\n**Política de reinício.** Always, OnFailure ou Never, o que torna o ACI adequado para jobs que rodam até concluir.\n\n**Volumes.** Montagem de compartilhamento do Azure Files, segredo ou repositório Git.\n\n**Rede.** IP público com FQDN, ou implantação em uma sub-rede da VNet para acesso privado.",
                    },
                    {
                        type: "code",
                        value: "# Criar registro premium com geo-replicacao\naz acr create --resource-group rg-app --name acrempresa --sku Premium\naz acr replication create --registry acrempresa --location eastus\n\n# Executar um contêiner sob demanda no ACI\naz container create \\\n  --resource-group rg-app --name job-relatorio \\\n  --image acrempresa.azurecr.io/relatorio:v2 \\\n  --registry-login-server acrempresa.azurecr.io \\\n  --assign-identity --restart-policy OnFailure \\\n  --cpu 2 --memory 4\n\n# Container App com escala por HTTP\naz containerapp create \\\n  --resource-group rg-app --name api-pedidos --environment env-prod \\\n  --image acrempresa.azurecr.io/api:v5 \\\n  --ingress external --target-port 8080 \\\n  --min-replicas 0 --max-replicas 10",
                    },
                    {
                        type: "text",
                        value: "## Dimensionamento e escala\n\nNo **ACI**, você define CPU e memória por contêiner, e a escala é manual: para mais capacidade, cria-se outro container group. Não existe escala automática.\n\nNo **ACA**, você define réplicas mínima e máxima e regras de escala baseadas em HTTP, em eventos KEDA ou em CPU e memória. A escala a zero é o diferencial de custo: sem tráfego, não há réplica e não há cobrança de computação.\n\nO detalhe que aparece em prova: **ACI não escala automaticamente**. Cenários que pedem escala automática de contêiner sem gerenciar cluster apontam para ACA.",
                    },
                ],
                questions: [
                    {
                        statement: "Em qual camada do ACR a geo-replicação está disponível?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Premium.",
                                isCorrect: true,
                            },
                            {
                                text: "Standard, que já oferece throughput maior para ambientes de produção comuns.",
                                isCorrect: false,
                            },
                            {
                                text: "Basic, indicada para desenvolvimento e avaliação do serviço de registro privado.",
                                isCorrect: false,
                            },
                            {
                                text: "Em todas as camadas, mudando apenas o número máximo de réplicas permitidas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual função de RBAC permite apenas baixar imagens do ACR?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AcrPull.",
                                isCorrect: true,
                            },
                            {
                                text: "AcrPush, que permite enviar imagens e por consequência também baixá-las do registro.",
                                isCorrect: false,
                            },
                            {
                                text: "Reader no escopo do registro, que concede leitura de todos os dados armazenados.",
                                isCorrect: false,
                            },
                            {
                                text: "Contributor no resource group, porque a permissão é herdada pelos repositórios.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa de contêineres com escala automática, incluindo escala a zero, sem gerenciar cluster. Qual serviço atende?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Azure Container Apps.",
                                isCorrect: true,
                            },
                            {
                                text: "Azure Container Instances, que ajusta as instâncias conforme a demanda observada.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure Kubernetes Service, com o autoscaler de pods habilitado no cluster criado.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure App Service, que hospeda contêineres com escala manual por plano de serviço.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é um container group no Azure Container Instances?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A unidade de implantação, com contêineres que compartilham ciclo de vida e rede.",
                                isCorrect: true,
                            },
                            {
                                text: "Um agrupamento lógico de instâncias usado para aplicar a mesma política de escala.",
                                isCorrect: false,
                            },
                            {
                                text: "Um conjunto de registros de contêiner replicados entre regiões diferentes do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Um ambiente gerenciado que hospeda várias aplicações de contêiner independentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual forma de autenticação no ACR é desabilitada por padrão e não recomendada em produção?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O usuário administrador do registro.",
                                isCorrect: true,
                            },
                            {
                                text: "A identidade gerenciada de um recurso do Azure que precisa baixar as imagens.",
                                isCorrect: false,
                            },
                            {
                                text: "Os tokens com escopo, disponíveis na camada Premium para limitar repositórios.",
                                isCorrect: false,
                            },
                            {
                                text: "A identidade do Entra ID de uma entidade de serviço com a função AcrPull atribuída.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Azure App Service",
                blocks: [
                    {
                        type: "text",
                        value: "## Plano e aplicação\n\nO **App Service plan** define os recursos de computação: camada de preço, tamanho da instância, quantidade de instâncias, sistema operacional e região. A **aplicação** (web app) roda sobre o plano, e várias aplicações podem compartilhar o mesmo plano, dividindo os recursos.\n\nIsso tem uma consequência que a prova cobra: se uma aplicação consome toda a CPU do plano, as outras do mesmo plano sofrem. Isolar aplicações críticas exige plano próprio.",
                    },
                    {
                        type: "text",
                        value: "## As camadas e o que cada uma libera\n\nA tabela abaixo é uma das mais rentáveis do domínio de computação, porque cenários pedem a camada mínima que atende ao requisito.",
                    },
                    {
                        type: "table",
                        value: '[["Camada", "Domínio próprio", "TLS próprio", "Escala automática", "Slots", "Backup"], ["Free e Shared", "Não", "Não", "Não", "Não", "Não"], ["Basic", "Sim", "Sim", "Não (só manual)", "Não", "Não"], ["Standard", "Sim", "Sim", "Sim", "Sim (5)", "Sim"], ["Premium", "Sim", "Sim", "Sim", "Sim (mais)", "Sim"], ["Isolated", "Sim", "Sim", "Sim", "Sim", "Sim, com isolamento em VNet"]]',
                    },
                    {
                        type: "quote",
                        value: "Três âncoras: **slots de implantação e backup começam no Standard**; **escala automática começa no Standard**; **domínio personalizado com TLS começa no Basic**. Cenários que pedem slot em camada Basic estão pedindo o impossível.",
                    },
                    {
                        type: "text",
                        value: "## Slots de implantação\n\nUm slot é uma instância paralela da aplicação, com seu próprio endereço, usada para validar antes de publicar.\n\nO **swap** troca os slots depois de **aquecer** as instâncias do slot de origem, o que evita reinício frio e entrega uma troca sem indisponibilidade percebida.\n\nO detalhe que a prova cobra: algumas configurações são **específicas do slot** e não acompanham a troca, como cadeias de conexão marcadas como de slot, configurações de publicação e certificados TLS. As demais configurações de aplicação **acompanham** a aplicação no swap.\n\nSlots também permitem **divisão de tráfego** em percentual, o que habilita teste canário.",
                    },
                    {
                        type: "text",
                        value: "## Rede no App Service\n\nTrês recursos que se confundem, e a distinção é frequente em prova.",
                    },
                    {
                        type: "table",
                        value: '[["Recurso", "Direção", "Resolve"], ["Integração com VNet", "Saída", "A aplicação alcança recursos privados da VNet"], ["Private endpoint", "Entrada", "A aplicação recebe tráfego por IP privado"], ["Restrições de acesso", "Entrada", "Filtra por IP e por rede quem pode chamar a aplicação"]]',
                    },
                    {
                        type: "text",
                        value: "## Escala e backup\n\n**Escala manual.** Define a quantidade fixa de instâncias.\n\n**Escala automática.** Regras por métrica ou por agenda, com mínimo e máximo. Começa no Standard.\n\n**Escala vertical.** Mudar a camada ou o tamanho da instância do plano, o que afeta todas as aplicações dele.\n\n**Backup.** Copia conteúdo, configuração e bancos vinculados para uma conta de armazenamento, com agenda e retenção. A restauração pode ir para a mesma aplicação ou para outra, o que é útil para clonar ambiente.",
                    },
                    {
                        type: "code",
                        value: '# Criar plano Standard e aplicacao\naz appservice plan create --resource-group rg-app --name plan-web --sku S1 --is-linux\naz webapp create --resource-group rg-app --plan plan-web --name app-pedidos-brs --runtime "NODE:20-lts"\n\n# Criar slot e trocar\naz webapp deployment slot create --resource-group rg-app --name app-pedidos-brs --slot staging\naz webapp deployment slot swap --resource-group rg-app --name app-pedidos-brs --slot staging\n\n# Integracao com VNet para trafego de saida\naz webapp vnet-integration add --resource-group rg-app --name app-pedidos-brs \\\n  --vnet vnet-prod --subnet snet-appservice\n\n# Escala automatica\naz monitor autoscale create --resource-group rg-app --resource plan-web \\\n  --resource-type Microsoft.Web/serverfarms --name as-plan-web \\\n  --min-count 2 --max-count 8 --count 2',
                    },
                ],
                questions: [
                    {
                        statement:
                            "A partir de qual camada os slots de implantação estão disponíveis?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Standard.",
                                isCorrect: true,
                            },
                            {
                                text: "Basic, que já permite domínio personalizado e certificado TLS para a aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Free, com um slot adicional disponível para validação antes da publicação final.",
                                isCorrect: false,
                            },
                            {
                                text: "Premium, sendo a única camada com suporte a validação antes da troca de tráfego.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece durante um swap entre o slot de staging e o de produção?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "As instâncias de origem são aquecidas antes da troca, evitando reinício frio.",
                                isCorrect: true,
                            },
                            {
                                text: "A aplicação fica indisponível pelo tempo necessário para reiniciar as instâncias.",
                                isCorrect: false,
                            },
                            {
                                text: "O tráfego é dividido igualmente entre os dois slots até a conclusão da operação.",
                                isCorrect: false,
                            },
                            {
                                text: "Todas as configurações de aplicação são apagadas e precisam ser reconfiguradas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual recurso permite que a aplicação alcance um banco de dados que só aceita tráfego da VNet?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Integração com VNet, que atua no tráfego de saída da aplicação.",
                                isCorrect: true,
                            },
                            {
                                text: "Private endpoint, que traz o tráfego de entrada para dentro da rede virtual criada.",
                                isCorrect: false,
                            },
                            {
                                text: "Restrições de acesso, liberando apenas a faixa de IP do banco de dados na aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Service endpoint configurado na sub-rede em que o banco de dados está publicado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Duas aplicações compartilham um App Service plan e uma delas consome toda a CPU. O que acontece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A outra aplicação sofre, porque as duas dividem os mesmos recursos do plano.",
                                isCorrect: true,
                            },
                            {
                                text: "O Azure escala o plano automaticamente para atender as duas sem degradação.",
                                isCorrect: false,
                            },
                            {
                                text: "A aplicação que consome mais é limitada, preservando os recursos da outra aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada acontece, porque cada aplicação recebe uma cota isolada dentro do plano.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual configuração NÃO acompanha a aplicação durante um swap de slots?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "As cadeias de conexão marcadas como específicas do slot.",
                                isCorrect: true,
                            },
                            {
                                text: "As variáveis de ambiente comuns definidas nas configurações da aplicação web.",
                                isCorrect: false,
                            },
                            {
                                text: "O runtime configurado para executar o código publicado naquele slot de implantação.",
                                isCorrect: false,
                            },
                            {
                                text: "As configurações de escala automática definidas no plano que hospeda a aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Rede virtual",
        aulas: [
            {
                titulo: "VNets, sub-redes e endereçamento",
                blocks: [
                    {
                        type: "text",
                        value: "## A rede virtual\n\nUma **VNet** é a rede privada da organização no Azure, isolada por padrão. Ela tem um ou mais **espaços de endereço** em notação CIDR, e é dividida em **sub-redes**.\n\nRegras que a prova cobra:\n\n- uma VNet pertence a **uma região** e a **uma assinatura**;\n- recursos em VNets diferentes não se falam por IP privado sem peering, VPN ou ExpressRoute;\n- os espaços de endereço podem ser alterados depois da criação, com restrições;\n- é possível ter vários espaços de endereço na mesma VNet.",
                    },
                    {
                        type: "text",
                        value: "## Os cinco endereços reservados\n\nEm **toda** sub-rede, o Azure reserva **cinco** endereços:\n\n- o **primeiro**, endereço de rede;\n- o **segundo**, gateway padrão do Azure;\n- o **terceiro e o quarto**, mapeamento do DNS do Azure;\n- o **último**, broadcast.\n\nIsso significa que a quantidade utilizável é sempre o total do prefixo **menos cinco**.",
                    },
                    {
                        type: "table",
                        value: '[["Prefixo", "Total de endereços", "Utilizáveis"], ["/29", "8", "3"], ["/28", "16", "11"], ["/27", "32", "27"], ["/26", "64", "59"], ["/24", "256", "251"], ["/16", "65536", "65531"]]',
                    },
                    {
                        type: "quote",
                        value: "O menor prefixo aceito em uma sub-rede do Azure é **/29**, com três endereços utilizáveis. O maior é **/2**. Prefixos como /30 e /31 não são aceitos, porque não sobrariam endereços após as cinco reservas.",
                    },
                    {
                        type: "text",
                        value: "## Sub-redes com nome obrigatório\n\nAlguns serviços exigem uma sub-rede dedicada com **nome exato**, e errar o nome faz a implantação falhar. A prova cobra estes:",
                    },
                    {
                        type: "table",
                        value: '[["Serviço", "Nome exigido", "Prefixo mínimo"], ["Azure Bastion", "AzureBastionSubnet", "/26"], ["VPN Gateway e ExpressRoute", "GatewaySubnet", "/27 recomendado"], ["Azure Firewall", "AzureFirewallSubnet", "/26"], ["Azure Route Server", "RouteServerSubnet", "/27"]]',
                    },
                    {
                        type: "text",
                        value: "## Delegação de sub-rede\n\nAlguns serviços de plataforma precisam **injetar** recursos na sua VNet, e para isso a sub-rede é **delegada** ao serviço. Exemplos: integração de VNet do App Service, Azure Container Apps, Azure Database for PostgreSQL flexível e Azure NetApp Files.\n\nUma sub-rede delegada fica reservada àquele serviço e não aceita outros recursos, o que é uma causa comum de erro em ambientes com pouco espaço de endereço planejado.",
                    },
                    {
                        type: "code",
                        value: "# Criar VNet com duas sub-redes\naz network vnet create \\\n  --resource-group rg-rede --name vnet-prod \\\n  --address-prefixes 10.10.0.0/16 --location brazilsouth \\\n  --subnet-name snet-app --subnet-prefixes 10.10.1.0/24\n\naz network vnet subnet create \\\n  --resource-group rg-rede --vnet-name vnet-prod \\\n  --name AzureBastionSubnet --address-prefixes 10.10.250.0/26\n\n# Delegar sub-rede ao App Service\naz network vnet subnet update --resource-group rg-rede --vnet-name vnet-prod \\\n  --name snet-appservice --delegations Microsoft.Web/serverFarms",
                    },
                ],
                questions: [
                    {
                        statement: "Quantos endereços o Azure reserva em cada sub-rede?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cinco.",
                                isCorrect: true,
                            },
                            {
                                text: "Dois, correspondentes ao endereço de rede e ao endereço de broadcast do intervalo.",
                                isCorrect: false,
                            },
                            {
                                text: "Três, incluindo rede, gateway e broadcast conforme a convenção de redes IP.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: todos os endereços do prefixo ficam disponíveis para os recursos criados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quantos endereços utilizáveis uma sub-rede /27 oferece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "27.",
                                isCorrect: true,
                            },
                            {
                                text: "32, correspondentes ao total de endereços do prefixo sem descontar as reservas.",
                                isCorrect: false,
                            },
                            {
                                text: "30, descontando apenas o endereço de rede e o endereço de broadcast do intervalo.",
                                isCorrect: false,
                            },
                            {
                                text: "26, porque o Azure reserva seis endereços em sub-redes com esse tamanho de prefixo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o nome exato exigido para a sub-rede do Azure Bastion?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "AzureBastionSubnet.",
                                isCorrect: true,
                            },
                            {
                                text: "BastionSubnet, com prefixo mínimo /27 conforme a documentação do serviço.",
                                isCorrect: false,
                            },
                            {
                                text: "GatewaySubnet, compartilhada com o gateway de rede virtual da mesma VNet.",
                                isCorrect: false,
                            },
                            {
                                text: "Qualquer nome, desde que a sub-rede tenha prefixo /26 ou maior na rede virtual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece com uma sub-rede delegada a um serviço de plataforma?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela fica reservada àquele serviço e não aceita outros recursos.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela passa a aceitar apenas recursos daquele serviço e também máquinas virtuais.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela recebe automaticamente um network security group gerenciado pela plataforma.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela deixa de contar no espaço de endereço total da rede virtual em que foi criada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o menor prefixo aceito em uma sub-rede do Azure?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "/29.",
                                isCorrect: true,
                            },
                            {
                                text: "/30, que oferece quatro endereços e é comum em enlaces ponto a ponto tradicionais.",
                                isCorrect: false,
                            },
                            {
                                text: "/28, para garantir onze endereços utilizáveis depois das reservas da plataforma.",
                                isCorrect: false,
                            },
                            {
                                text: "/24, o menor prefixo aceito para qualquer sub-rede criada em uma rede virtual.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Peering e rotas definidas pelo usuário",
                blocks: [
                    {
                        type: "text",
                        value: "## Peering de rede virtual\n\nO **peering** conecta duas VNets, e o tráfego passa pela rede troncal da Microsoft, com IP privado, sem internet, sem gateway e sem criptografia obrigatória.\n\nDuas variantes:\n\n**Peering local (regional).** Entre VNets na mesma região.\n\n**Peering global.** Entre VNets em regiões diferentes, inclusive em assinaturas e tenants diferentes.",
                    },
                    {
                        type: "text",
                        value: "## As três regras do peering\n\n**Não é transitivo.** Se A tem peering com B, e B com C, então A **não** alcança C. Para isso é preciso peering direto ou um dispositivo de roteamento com rotas definidas pelo usuário.\n\n**Os espaços de endereço não podem se sobrepor.** Prefixos idênticos ou sobrepostos fazem a criação do peering falhar.\n\n**A conexão precisa ser criada nos dois lados.** No portal isso é feito automaticamente quando você tem permissão nas duas VNets; por CLI são dois comandos, e um peering configurado só de um lado fica no estado desconectado.",
                    },
                    {
                        type: "quote",
                        value: 'A topologia **hub and spoke** é a resposta padrão de prova para "vários ambientes precisam compartilhar serviços centrais". Os spokes fazem peering com o hub, e como o peering não é transitivo, a comunicação entre spokes exige **Azure Firewall** ou uma NVA no hub, com rotas definidas pelo usuário apontando para lá, ou então **Azure Virtual WAN**.',
                    },
                    {
                        type: "text",
                        value: "## As opções do peering\n\nQuatro configurações que a prova cobra:\n\n**Permitir acesso à rede virtual.** Habilita a comunicação entre as duas redes. Desligar mantém o peering mas bloqueia o tráfego.\n\n**Permitir tráfego encaminhado.** Aceita tráfego que não se originou na VNet emparelhada, o que é necessário quando existe uma NVA no caminho.\n\n**Permitir trânsito de gateway.** Permite que a VNet emparelhada use o gateway desta VNet, por exemplo para alcançar a rede local por VPN. É a base do hub and spoke com conectividade híbrida.\n\n**Usar gateway remoto.** O lado oposto da opção anterior, marcado no spoke.",
                    },
                    {
                        type: "text",
                        value: "## Rotas: sistema e definidas pelo usuário\n\nO Azure cria **rotas de sistema** automaticamente: para a própria VNet, para as VNets emparelhadas, para a internet, e rotas que descartam faixas privadas não usadas.\n\nAs **rotas definidas pelo usuário** (UDR) ficam em uma **tabela de rotas** associada a uma sub-rede e sobrepõem as de sistema. Os tipos de próximo salto são:",
                    },
                    {
                        type: "table",
                        value: '[["Próximo salto", "Para que serve"], ["Virtual appliance", "Enviar o tráfego para um firewall ou NVA, por IP privado"], ["Virtual network gateway", "Enviar para o gateway de VPN ou ExpressRoute"], ["Virtual network", "Manter o tráfego dentro da VNet"], ["Internet", "Enviar para a internet pela saída padrão"], ["None", "Descartar o tráfego"]]',
                    },
                    {
                        type: "text",
                        value: "## O detalhe do encaminhamento de IP\n\nQuando o próximo salto é uma máquina virtual que atua como firewall ou roteador, é obrigatório habilitar o **encaminhamento de IP** (IP forwarding) na interface de rede dela. Sem isso o Azure descarta pacotes cujo destino não é o endereço da própria máquina, e a rota parece configurada mas o tráfego não passa.\n\nEsse é um dos problemas de diagnóstico mais cobrados do domínio de rede, e a ferramenta para investigar é o **próximo salto** do Network Watcher.",
                    },
                    {
                        type: "code",
                        value: "# Peering nos dois sentidos\naz network vnet peering create --resource-group rg-rede \\\n  --name hub-para-spoke1 --vnet-name vnet-hub \\\n  --remote-vnet vnet-spoke1 --allow-vnet-access --allow-gateway-transit\n\naz network vnet peering create --resource-group rg-rede \\\n  --name spoke1-para-hub --vnet-name vnet-spoke1 \\\n  --remote-vnet vnet-hub --allow-vnet-access --use-remote-gateways\n\n# Tabela de rotas enviando tudo para o firewall\naz network route-table create --resource-group rg-rede --name rt-spoke1\naz network route-table route create --resource-group rg-rede --route-table-name rt-spoke1 \\\n  --name para-firewall --address-prefix 0.0.0.0/0 \\\n  --next-hop-type VirtualAppliance --next-hop-ip-address 10.10.0.4\naz network vnet subnet update --resource-group rg-rede --vnet-name vnet-spoke1 \\\n  --name snet-app --route-table rt-spoke1",
                    },
                ],
                questions: [
                    {
                        statement: "A VNet A tem peering com B, e B com C. A alcança C?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Não, porque o peering não é transitivo.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, porque as rotas de sistema propagam automaticamente entre redes emparelhadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que as três redes estejam na mesma região e na mesma assinatura do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Não, a menos que o peering entre A e B seja configurado como global em vez de local.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Duas VNets têm espaços de endereço sobrepostos. O que acontece ao criar o peering?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A criação falha, porque os espaços não podem se sobrepor.",
                                isCorrect: true,
                            },
                            {
                                text: "O peering é criado e o Azure aplica tradução de endereços entre as duas redes.",
                                isCorrect: false,
                            },
                            {
                                text: "O peering é criado, mas apenas o tráfego de saída funciona em um dos sentidos.",
                                isCorrect: false,
                            },
                            {
                                text: "O peering é criado e a segunda rede recebe um novo espaço atribuído pelo Azure.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual opção do peering permite que a VNet emparelhada use o gateway de VPN desta VNet?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Permitir trânsito de gateway.",
                                isCorrect: true,
                            },
                            {
                                text: "Permitir tráfego encaminhado, que aceita pacotes de origens fora da rede emparelhada.",
                                isCorrect: false,
                            },
                            {
                                text: "Permitir acesso à rede virtual, que habilita a comunicação entre as duas redes.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar gateway remoto, marcado no lado que possui o gateway de conectividade híbrida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma topologia hub and spoke, o que permite que dois spokes se comuniquem?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um firewall ou NVA no hub, com rotas definidas pelo usuário apontando para ele.",
                                isCorrect: true,
                            },
                            {
                                text: "O peering entre cada spoke e o hub, que já propaga as rotas entre todos os spokes.",
                                isCorrect: false,
                            },
                            {
                                text: "A opção de permitir tráfego encaminhado marcada nos peerings de cada spoke criado.",
                                isCorrect: false,
                            },
                            {
                                text: "Um service endpoint habilitado nas sub-redes dos dois spokes que precisam se falar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma UDR aponta para uma VM como appliance, mas o tráfego não passa. Qual é a causa mais provável?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O encaminhamento de IP não está habilitado na interface de rede da máquina.",
                                isCorrect: true,
                            },
                            {
                                text: "A rota precisa ser criada com próximo salto do tipo virtual network em vez de appliance.",
                                isCorrect: false,
                            },
                            {
                                text: "A tabela de rotas não foi associada à rede virtual inteira, apenas a uma sub-rede.",
                                isCorrect: false,
                            },
                            {
                                text: "A máquina precisa de um IP público estático para ser referenciada como próximo salto.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Network security groups e application security groups",
                blocks: [
                    {
                        type: "text",
                        value: "## O que um NSG faz\n\nUm **network security group** filtra tráfego de entrada e saída por regras, e pode ser associado a **sub-redes** e a **interfaces de rede**. Cada regra tem prioridade, origem, porta de origem, destino, porta de destino, protocolo, direção e ação.\n\nAs prioridades vão de **100 a 4096**, e a avaliação vai do **número menor para o maior**. A primeira regra que corresponde ao tráfego é aplicada, e a avaliação para ali.",
                    },
                    {
                        type: "text",
                        value: "## As regras padrão\n\nTodo NSG nasce com regras padrão de prioridade alta (números grandes), que não podem ser removidas, apenas sobrepostas por regras de prioridade menor:\n\n**Entrada:** permitir tráfego da própria VNet, permitir tráfego do balanceador de carga do Azure, e **negar todo o resto**.\n\n**Saída:** permitir tráfego para a VNet, permitir tráfego para a internet, e **negar todo o resto**.\n\nA consequência prática: por padrão, uma VM **não** aceita conexão da internet, e **sim** faz conexão para a internet.",
                    },
                    {
                        type: "table",
                        value: '[["Direção", "Regra padrão", "Prioridade"], ["Entrada", "AllowVnetInBound", "65000"], ["Entrada", "AllowAzureLoadBalancerInBound", "65001"], ["Entrada", "DenyAllInBound", "65500"], ["Saída", "AllowVnetOutBound", "65000"], ["Saída", "AllowInternetOutBound", "65001"], ["Saída", "DenyAllOutBound", "65500"]]',
                    },
                    {
                        type: "text",
                        value: "## A ordem de avaliação com dois NSGs\n\nQuando existe um NSG na sub-rede e outro na interface de rede, a ordem depende da direção:\n\n**Entrada:** primeiro o NSG da **sub-rede**, depois o da **interface**. O tráfego precisa ser permitido pelos dois.\n\n**Saída:** primeiro o da **interface**, depois o da **sub-rede**. Também precisa passar pelos dois.\n\nEssa inversão é uma pergunta clássica, e o jeito de gravar é pensar no caminho físico do pacote: entrando, ele cruza a fronteira da sub-rede antes de chegar à placa de rede; saindo, sai da placa antes de cruzar a sub-rede.",
                    },
                    {
                        type: "quote",
                        value: "NSG **não filtra** tráfego entre recursos na mesma sub-rede quando a regra padrão AllowVnetInBound está valendo, porque esse tráfego é considerado interno à VNet. Para isolar recursos na mesma sub-rede, é preciso criar regras explícitas de negação com prioridade menor que 65000.",
                    },
                    {
                        type: "text",
                        value: '## Service tags e application security groups\n\n**Service tags.** Representam grupos de prefixos de IP de serviços do Azure, mantidos pela Microsoft e atualizados automaticamente. Exemplos: `Internet`, `VirtualNetwork`, `AzureLoadBalancer`, `Storage`, `Sql`, `AzureCloud`. Usar a tag em vez de faixas de IP evita manutenção quando os endereços mudam.\n\n**Application security groups (ASG).** Agrupam interfaces de rede por função da aplicação, e podem ser usados como origem ou destino nas regras de NSG. Assim a regra fala em "web" e "banco" em vez de faixas de IP, e continua correta quando máquinas entram e saem do grupo.\n\nO ASG não filtra por si só: ele é um rótulo usado pelas regras do NSG.',
                    },
                    {
                        type: "code",
                        value: "# Permitir HTTPS da internet apenas para o ASG de web\naz network nsg rule create --resource-group rg-rede --nsg-name nsg-app \\\n  --name permitir-https --priority 200 --direction Inbound --access Allow \\\n  --protocol Tcp --source-address-prefixes Internet \\\n  --destination-asgs asg-web --destination-port-ranges 443\n\n# Permitir SQL apenas do ASG de web para o ASG de banco\naz network nsg rule create --resource-group rg-rede --nsg-name nsg-app \\\n  --name web-para-banco --priority 210 --direction Inbound --access Allow \\\n  --protocol Tcp --source-asgs asg-web --destination-asgs asg-banco \\\n  --destination-port-ranges 1433\n\n# Ver as regras efetivas de uma interface de rede\naz network nic list-effective-nsg --resource-group rg-app --name nic-vm-web01",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Duas regras de NSG se aplicam ao mesmo tráfego: negação com prioridade 200 e permissão com 300. Qual prevalece?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A negação, porque tem o número de prioridade menor.",
                                isCorrect: true,
                            },
                            {
                                text: "A permissão, porque regras de permissão têm precedência sobre as de negação.",
                                isCorrect: false,
                            },
                            {
                                text: "A de prioridade maior, porque o Azure avalia do número maior para o menor.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma, e o Azure aplica a regra padrão do NSG para aquele tipo de tráfego.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o comportamento padrão de um NSG para tráfego de entrada da internet?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Negar, pela regra padrão DenyAllInBound.",
                                isCorrect: true,
                            },
                            {
                                text: "Permitir, pela regra padrão que libera o tráfego de entrada vindo da internet.",
                                isCorrect: false,
                            },
                            {
                                text: "Permitir apenas nas portas 80 e 443, que são liberadas por padrão pela plataforma.",
                                isCorrect: false,
                            },
                            {
                                text: "Depender da configuração do IP público associado à interface de rede da máquina.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a ordem de avaliação para tráfego de saída com NSG na sub-rede e na interface?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Primeiro o da interface, depois o da sub-rede.",
                                isCorrect: true,
                            },
                            {
                                text: "Primeiro o da sub-rede, depois o da interface de rede da máquina virtual.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o mais restritivo entre os dois é avaliado na saída do tráfego.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois são avaliados em paralelo e basta um permitir para o tráfego sair.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como isolar duas máquinas que estão na mesma sub-rede?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Criar regras de negação com prioridade menor que a regra padrão da VNet.",
                                isCorrect: true,
                            },
                            {
                                text: "Associar um NSG à sub-rede, o que já bloqueia o tráfego interno entre as máquinas.",
                                isCorrect: false,
                            },
                            {
                                text: "Colocar as máquinas em application security groups diferentes, o que as isola.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar um service endpoint na sub-rede, que separa o tráfego entre os recursos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a vantagem de usar service tags nas regras de NSG?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os prefixos são mantidos pela Microsoft e atualizados automaticamente.",
                                isCorrect: true,
                            },
                            {
                                text: "As regras passam a ser avaliadas antes das demais, independentemente da prioridade.",
                                isCorrect: false,
                            },
                            {
                                text: "O NSG deixa de precisar de regras de saída, porque as tags cobrem os dois sentidos.",
                                isCorrect: false,
                            },
                            {
                                text: "O tráfego passa a usar a rede troncal da Microsoft em vez da internet pública.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Bastion, service endpoints e private endpoints",
                blocks: [
                    {
                        type: "text",
                        value: "## Azure Bastion\n\nO **Bastion** dá acesso RDP e SSH às máquinas virtuais **pelo navegador**, por TLS na porta 443, sem que as VMs precisem de IP público e sem abrir portas de gerenciamento.\n\nRequisitos que a prova cobra:\n\n- sub-rede chamada exatamente **AzureBastionSubnet**, com prefixo **/26 ou maior**;\n- a sub-rede não deve conter outros recursos;\n- o Bastion é implantado **por VNet**, e alcança VNets emparelhadas quando configurado;\n- as camadas Basic e Standard diferem em recursos como escala manual, conexão nativa por cliente e compartilhamento de sessão.\n\nO ganho de segurança é eliminar a superfície de ataque das portas 3389 e 22 expostas na internet, que é o vetor mais explorado contra máquinas na nuvem.",
                    },
                    {
                        type: "text",
                        value: '## Service endpoint contra private endpoint\n\nEsta é uma das distinções mais cobradas do domínio de rede. Os dois resolvem "acessar um serviço PaaS de forma segura", com mecanismos diferentes.',
                    },
                    {
                        type: "table",
                        value: '[["", "Service endpoint", "Private endpoint"], ["O que faz", "Estende a identidade da sub-rede ao serviço", "Cria uma NIC com IP privado na sua VNet"], ["Endereço usado", "O endpoint público do serviço", "Um IP privado da sua sub-rede"], ["O serviço fica acessível pela internet?", "Sim, filtrado pelo firewall dele", "Pode ser totalmente fechado"], ["Escopo", "Sub-rede, por serviço", "Recurso específico"], ["Funciona de rede local por VPN?", "Não", "Sim"], ["Precisa de DNS especial?", "Não", "Sim, zona DNS privada"], ["Custo", "Sem custo adicional", "Cobrado por hora e por dados"]]',
                    },
                    {
                        type: "quote",
                        value: 'Dois discriminadores rápidos: se o requisito diz **"o serviço não pode ter endereço público"**, é **private endpoint**. Se diz **"máquinas da rede local, via VPN, precisam acessar"**, também é **private endpoint**, porque service endpoint não funciona de fora da VNet.',
                    },
                    {
                        type: "text",
                        value: "## O DNS do private endpoint\n\nUm private endpoint só funciona bem com resolução de nome correta. O padrão é:\n\n1. cria-se uma **zona DNS privada** com o nome canônico do serviço, por exemplo `privatelink.blob.core.windows.net`;\n2. vincula-se a zona às VNets que precisam resolver;\n3. o registro A do recurso aponta para o IP privado do endpoint.\n\nAssim o nome público continua sendo usado pelas aplicações, mas resolve para o IP privado dentro da VNet. Sem essa configuração, o nome resolve para o endereço público e o tráfego não usa o endpoint privado, o que é a falha mais comum na implantação.",
                    },
                    {
                        type: "text",
                        value: "## Private Link e o serviço do outro lado\n\nO **Azure Private Link** é a tecnologia por trás do private endpoint. Ela permite dois cenários:\n\n**Consumir um serviço PaaS da Microsoft** por IP privado, que é o caso mais comum.\n\n**Publicar o próprio serviço** para outros consumirem por private endpoint, usando um **Private Link Service** na frente de um load balancer standard. É como uma empresa oferece um serviço a clientes sem exposição pública.",
                    },
                    {
                        type: "code",
                        value: "# Bastion\naz network vnet subnet create --resource-group rg-rede --vnet-name vnet-prod \\\n  --name AzureBastionSubnet --address-prefixes 10.10.250.0/26\naz network public-ip create --resource-group rg-rede --name pip-bastion --sku Standard\naz network bastion create --resource-group rg-rede --name bastion-prod \\\n  --vnet-name vnet-prod --public-ip-address pip-bastion --location brazilsouth\n\n# Private endpoint para conta de armazenamento, com DNS privado\naz network private-endpoint create --resource-group rg-rede --name pe-storage \\\n  --vnet-name vnet-prod --subnet snet-app \\\n  --private-connection-resource-id <id-da-conta> --group-id blob \\\n  --connection-name conn-blob\n\naz network private-dns zone create --resource-group rg-rede \\\n  --name privatelink.blob.core.windows.net\naz network private-dns link vnet create --resource-group rg-rede \\\n  --zone-name privatelink.blob.core.windows.net --name link-vnet-prod \\\n  --virtual-network vnet-prod --registration-enabled false",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o prefixo mínimo exigido para a sub-rede do Azure Bastion?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "/26.",
                                isCorrect: true,
                            },
                            {
                                text: "/27, o mesmo prefixo recomendado para a sub-rede do gateway de rede virtual.",
                                isCorrect: false,
                            },
                            {
                                text: "/29, que é o menor prefixo aceito para qualquer sub-rede criada em uma VNet.",
                                isCorrect: false,
                            },
                            {
                                text: "/24, para acomodar a escala de sessões simultâneas suportada pelo serviço.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um requisito diz que a conta de armazenamento não pode ter endereço público. Qual solução atende?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Private endpoint, com o acesso público desabilitado na conta.",
                                isCorrect: true,
                            },
                            {
                                text: "Service endpoint na sub-rede, com o firewall da conta restrito a redes selecionadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Regra de NSG negando todo o tráfego de entrada vindo da internet para a conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Política de acesso armazenada limitando as origens permitidas nos tokens gerados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Máquinas na rede local, conectadas por VPN, precisam acessar um serviço PaaS de forma privada. Qual solução funciona?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Private endpoint, porque service endpoint não funciona de fora da VNet.",
                                isCorrect: true,
                            },
                            {
                                text: "Service endpoint na sub-rede do gateway de VPN da rede virtual conectada.",
                                isCorrect: false,
                            },
                            {
                                text: "Peering global entre a rede local e a rede virtual em que o serviço está publicado.",
                                isCorrect: false,
                            },
                            {
                                text: "Regra de firewall na conta liberando a faixa de IP público da rede local da empresa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a falha mais comum na implantação de um private endpoint?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não configurar a zona DNS privada, o que faz o nome resolver para o IP público.",
                                isCorrect: true,
                            },
                            {
                                text: "Não habilitar o service endpoint na sub-rede em que o endpoint privado foi criado.",
                                isCorrect: false,
                            },
                            {
                                text: "Não associar um network security group à sub-rede que hospeda o endpoint privado.",
                                isCorrect: false,
                            },
                            {
                                text: "Não criar o endpoint na mesma região da rede virtual em que ele será consumido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que um Private Link Service permite fazer?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Publicar o próprio serviço para consumo por private endpoint de outras VNets.",
                                isCorrect: true,
                            },
                            {
                                text: "Consumir serviços PaaS da Microsoft por endereço privado dentro da rede virtual.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir o gateway de VPN na conexão entre a rede local e a rede virtual do Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar uma zona DNS privada automaticamente para todos os endpoints da assinatura.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Azure DNS e balanceamento de carga",
                blocks: [
                    {
                        type: "text",
                        value: "## Zonas DNS pública e privada\n\n**Zona DNS pública.** Hospeda os registros de um domínio para resolução pela internet. Criar a zona não é suficiente: é preciso **delegar** o domínio, apontando os servidores de nome no registrador para os quatro servidores atribuídos à zona. O Azure DNS não registra domínios; para isso existe o App Service Domains.\n\n**Zona DNS privada.** Resolve nomes para IPs privados dentro de VNets vinculadas. O **registro automático** pode ser habilitado no vínculo, e então o Azure cria e remove registros A conforme as VMs aparecem e desaparecem. Apenas um vínculo por zona pode ter registro automático para a mesma VNet.",
                    },
                    {
                        type: "text",
                        value: "## As quatro opções de balanceamento\n\nA prova apresenta um requisito e pede o serviço. A chave é a combinação de **camada** e **escopo**.",
                    },
                    {
                        type: "table",
                        value: '[["Serviço", "Camada", "Escopo", "Quando usar"], ["Load Balancer", "4 (TCP e UDP)", "Regional", "Distribuir TCP entre VMs, interno ou público"], ["Application Gateway", "7 (HTTP)", "Regional", "Roteamento por URL e host, TLS, WAF"], ["Traffic Manager", "DNS", "Global", "Distribuir entre regiões por resposta de DNS"], ["Front Door", "7 (HTTP)", "Global", "CDN, WAF e roteamento global de HTTP"]]',
                    },
                    {
                        type: "quote",
                        value: "Dois discriminadores: se o requisito menciona **decisão por caminho de URL, cabeçalho de host, terminação TLS ou firewall de aplicação**, é camada 7, ou seja, Application Gateway ou Front Door. Se menciona **várias regiões**, é global, ou seja, Traffic Manager ou Front Door.",
                    },
                    {
                        type: "text",
                        value: "## Componentes do Load Balancer\n\nCinco peças que a prova cobra:\n\n**Frontend IP.** O endereço que recebe o tráfego, público ou privado.\n\n**Backend pool.** As instâncias que recebem o tráfego, tipicamente VMs ou um Scale Set.\n\n**Health probe.** Verificação periódica que retira instâncias doentes da distribuição. Pode ser TCP, HTTP ou HTTPS, com intervalo e limite de falhas.\n\n**Regra de balanceamento.** Liga frontend, porta, backend pool e probe.\n\n**Regra NAT de entrada.** Encaminha uma porta específica do frontend para uma instância específica, útil para acesso administrativo pontual.",
                    },
                    {
                        type: "text",
                        value: '## Basic contra Standard\n\nO SKU do Load Balancer importa, e a prova cobra a diferença:\n\n**Standard.** Suporta zonas de disponibilidade, é **fechado por padrão** (exige NSG permitindo), oferece métricas detalhadas, suporta até 1000 instâncias no pool, e exige IP público standard.\n\n**Basic.** Aberto por padrão, sem suporte a zonas, limitado a 300 instâncias, e em caminho de aposentadoria.\n\nO detalhe do "fechado por padrão" causa confusão: com Load Balancer Standard, o tráfego não passa se não houver regra de NSG explícita permitindo, mesmo com a regra de balanceamento configurada corretamente.',
                    },
                    {
                        type: "code",
                        value: "# Load balancer interno com probe HTTP\naz network lb create --resource-group rg-rede --name lb-interno --sku Standard \\\n  --vnet-name vnet-prod --subnet snet-app \\\n  --frontend-ip-name fe-privado --backend-pool-name bp-web\n\naz network lb probe create --resource-group rg-rede --lb-name lb-interno \\\n  --name probe-http --protocol Http --port 80 --path /health \\\n  --interval 15 --threshold 2\n\naz network lb rule create --resource-group rg-rede --lb-name lb-interno \\\n  --name regra-http --protocol Tcp --frontend-port 80 --backend-port 80 \\\n  --frontend-ip-name fe-privado --backend-pool-name bp-web --probe-name probe-http\n\n# Zona DNS privada com registro automatico\naz network private-dns link vnet create --resource-group rg-rede \\\n  --zone-name interno.contoso.com --name link-prod \\\n  --virtual-network vnet-prod --registration-enabled true",
                    },
                    {
                        type: "text",
                        value: '## Fixando o domínio de rede\n\nOs cenários e a resposta certa, que é como a prova pergunta:\n\n- "duas VNets em regiões diferentes, tráfego privado" → **peering global**;\n- "acesso RDP sem IP público" → **Bastion**;\n- "o serviço PaaS não pode ter endpoint público" → **private endpoint** com zona DNS privada;\n- "só a sub-rede X acessa a conta de armazenamento" → **service endpoint** e firewall;\n- "todo o tráfego de saída passa pelo firewall" → **UDR** com próximo salto de appliance e IP forwarding;\n- "distribuir HTTP por caminho de URL" → **Application Gateway**;\n- "distribuir entre três regiões" → **Traffic Manager** ou **Front Door**;\n- "resolver nomes internos sem servidor DNS próprio" → **zona DNS privada** com registro automático;\n- "por que esse tráfego não passa" → **regras efetivas** e **próximo salto** do Network Watcher.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que é necessário para uma zona DNS pública do Azure responder pelas consultas da internet?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Delegar o domínio, apontando os servidores de nome do registrador para a zona.",
                                isCorrect: true,
                            },
                            {
                                text: "Importar o arquivo de zona, o que redireciona automaticamente as consultas ao Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Vincular a zona à rede virtual em que os recursos publicados estão executando.",
                                isCorrect: false,
                            },
                            {
                                text: "Registrar o domínio pelo próprio Azure DNS, que é o único caminho suportado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa rotear requisições HTTP conforme o caminho da URL. Qual serviço atende?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Application Gateway.",
                                isCorrect: true,
                            },
                            {
                                text: "Load Balancer, que distribui o tráfego TCP entre as instâncias do pool configurado.",
                                isCorrect: false,
                            },
                            {
                                text: "Traffic Manager, que distribui as requisições por meio de respostas de DNS.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure Firewall, que inspeciona o tráfego e aplica regras de aplicação e de rede.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa distribuir tráfego entre três regiões diferentes. Quais serviços atendem?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Traffic Manager ou Front Door.",
                                isCorrect: true,
                            },
                            {
                                text: "Load Balancer standard com frontend com redundância de zona nas três regiões.",
                                isCorrect: false,
                            },
                            {
                                text: "Application Gateway com pool de back-end contendo instâncias das três regiões.",
                                isCorrect: false,
                            },
                            {
                                text: "Peering global entre as três redes virtuais, com rotas definidas pelo usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que serve uma regra NAT de entrada em um Load Balancer?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Encaminhar uma porta do frontend para uma instância específica do pool.",
                                isCorrect: true,
                            },
                            {
                                text: "Distribuir o tráfego de uma porta entre todas as instâncias do pool de back-end.",
                                isCorrect: false,
                            },
                            {
                                text: "Traduzir os endereços privados das instâncias em endereços públicos na saída.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar periodicamente a saúde das instâncias e retirar as que não responderem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O Load Balancer Standard está configurado corretamente mas o tráfego não passa. Qual é a causa provável?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Falta uma regra de NSG permitindo, porque o Standard é fechado por padrão.",
                                isCorrect: true,
                            },
                            {
                                text: "O SKU do IP público está definido como Basic, o que é incompatível com o Standard.",
                                isCorrect: false,
                            },
                            {
                                text: "A health probe está configurada com intervalo maior do que o limite de falhas.",
                                isCorrect: false,
                            },
                            {
                                text: "O pool de back-end contém instâncias em zonas de disponibilidade diferentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Monitoramento, backup e recuperação",
        aulas: [
            {
                titulo: "Azure Monitor: métricas e logs",
                blocks: [
                    {
                        type: "text",
                        value: "## Os dois tipos de dado\n\nO **Azure Monitor** trabalha com duas naturezas de telemetria, e confundi-las é a maior fonte de erro do domínio.\n\n**Métricas.** Valores numéricos coletados em intervalos regulares, com dimensões. São leves, têm baixa latência e ficam em um banco de séries temporais, com retenção padrão de **93 dias**. São ideais para alerta rápido e para painéis.\n\n**Logs.** Registros com estrutura variável, gravados em um **workspace do Log Analytics** e consultados com **KQL**. Aceitam análise detalhada, correlação entre fontes e retenção configurável, mas têm latência maior de ingestão.",
                    },
                    {
                        type: "table",
                        value: '[["", "Métricas", "Logs"], ["Formato", "Numérico, com dimensões", "Registros estruturados variados"], ["Onde ficam", "Banco de séries temporais", "Workspace do Log Analytics"], ["Como consultar", "Metrics Explorer", "KQL"], ["Latência", "Baixa, quase em tempo real", "Maior, minutos"], ["Retenção padrão", "93 dias", "Configurável"], ["Uso típico", "Alerta rápido, painel", "Investigação, correlação, auditoria"]]',
                    },
                    {
                        type: "text",
                        value: '## Métricas de plataforma e do convidado\n\nUm ponto que a prova cobra: as métricas de plataforma são coletadas **automaticamente**, sem agente, e cobrem o que o host enxerga: CPU da VM, IOPS do disco, bytes de rede.\n\nO que o host **não** enxerga exige agente instalado no sistema operacional convidado: **memória disponível**, **espaço livre em disco**, logs de evento e logs de aplicação. O agente atual é o **Azure Monitor Agent**, configurado por **regras de coleta de dados** (DCR).\n\nA pergunta clássica: "como monitorar o uso de memória de uma VM?" A resposta é instalar o agente e configurar a coleta, porque a métrica de plataforma não traz memória.',
                    },
                    {
                        type: "quote",
                        value: "Grave a assimetria: **CPU e disco vêm de graça, memória não.** Uso de memória e espaço livre em disco exigem o Azure Monitor Agent e uma regra de coleta de dados.",
                    },
                    {
                        type: "text",
                        value: "## Configurações de diagnóstico\n\nPara que os **logs de recurso** saiam do serviço e possam ser consultados, é preciso criar uma **configuração de diagnóstico** apontando o destino. Existem três destinos, e cada um serve a um propósito:",
                    },
                    {
                        type: "table",
                        value: '[["Destino", "Para que serve", "Permite KQL?"], ["Log Analytics workspace", "Consulta, correlação e alerta de log", "Sim"], ["Conta de armazenamento", "Arquivamento de baixo custo e retenção longa", "Não"], ["Event Hubs", "Enviar a sistemas externos, como SIEM de terceiro", "Não"]]',
                    },
                    {
                        type: "text",
                        value: 'E existe o **log de atividade** da assinatura, que registra as operações de plano de controle: quem criou, alterou e excluiu o quê, e quando. Ele é retido por 90 dias por padrão, e enviá-lo a um workspace permite retenção maior e consulta com KQL.\n\nA distinção: **log de atividade** responde "quem mexeu na configuração"; **logs de recurso** respondem "o que o recurso fez".',
                    },
                    {
                        type: "code",
                        value: '# Configuracao de diagnostico enviando logs e metricas ao workspace\naz monitor diagnostic-settings create \\\n  --name diag-storage --resource <id-da-conta> \\\n  --workspace <id-do-workspace> \\\n  --logs \'[{"categoryGroup":"allLogs","enabled":true}]\' \\\n  --metrics \'[{"category":"AllMetrics","enabled":true}]\'\n\n# Enviar o log de atividade ao workspace\naz monitor diagnostic-settings subscription create \\\n  --name diag-atividade --location brazilsouth \\\n  --workspace <id-do-workspace> \\\n  --logs \'[{"category":"Administrative","enabled":true},{"category":"Policy","enabled":true}]\'',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a retenção padrão das métricas de plataforma no Azure Monitor?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "93 dias.",
                                isCorrect: true,
                            },
                            {
                                text: "30 dias, o mesmo prazo padrão dos logs enviados ao workspace do Log Analytics.",
                                isCorrect: false,
                            },
                            {
                                text: "90 dias, coincidindo com a retenção padrão do log de atividade da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Ilimitada, porque as métricas são armazenadas no banco de séries temporais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como monitorar o uso de memória de uma máquina virtual?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Instalando o Azure Monitor Agent e configurando uma regra de coleta de dados.",
                                isCorrect: true,
                            },
                            {
                                text: "Habilitando a métrica de memória disponível no painel de métricas da máquina.",
                                isCorrect: false,
                            },
                            {
                                text: "Criando uma configuração de diagnóstico que envia as métricas ao workspace.",
                                isCorrect: false,
                            },
                            {
                                text: "Ativando o VM Insights, que coleta memória sem necessidade de agente instalado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual destino os logs de diagnóstico devem ir para serem consultados com KQL?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Workspace do Log Analytics.",
                                isCorrect: true,
                            },
                            {
                                text: "Conta de armazenamento, que é o destino padrão para retenção longa dos registros.",
                                isCorrect: false,
                            },
                            {
                                text: "Event Hubs, que encaminha os registros ao mecanismo de consulta do Azure Monitor.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure Monitor Metrics, que armazena tanto as métricas como os registros de log.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre log de atividade e logs de recurso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O de atividade registra quem mexeu na configuração; os de recurso, o que ele fez.",
                                isCorrect: true,
                            },
                            {
                                text: "O de atividade registra o que o recurso fez e os de recurso as alterações de configuração.",
                                isCorrect: false,
                            },
                            {
                                text: "O de atividade vale para assinaturas e os de recurso apenas para máquinas virtuais.",
                                isCorrect: false,
                            },
                            {
                                text: "O de atividade usa métricas numéricas e os de recurso usam registros estruturados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual destino de configuração de diagnóstico é indicado para enviar dados a um SIEM de terceiro?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Event Hubs.",
                                isCorrect: true,
                            },
                            {
                                text: "Conta de armazenamento, com o SIEM lendo os blobs gravados periodicamente pelo serviço.",
                                isCorrect: false,
                            },
                            {
                                text: "Workspace do Log Analytics, exportando os resultados das consultas para o sistema externo.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure Monitor Metrics, que expõe uma API pública consumida por ferramentas externas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Alertas, grupos de ação e KQL",
                blocks: [
                    {
                        type: "text",
                        value: "## A anatomia de um alerta\n\nUm alerta no Azure Monitor tem três peças, e a prova cobra a separação entre elas:\n\n**Regra de alerta.** Define o escopo (qual recurso), a condição (a métrica ou a consulta e o limite) e a lógica de avaliação (frequência e janela).\n\n**Grupo de ação.** Define **o que fazer** quando o alerta dispara: email, SMS, notificação push, webhook, chamada a uma função, runbook de automação, ITSM, voz. Um grupo de ação é reutilizável por muitas regras.\n\n**Regra de processamento de alerta.** Modifica o comportamento **depois** do disparo: suprimir notificações em uma janela de manutenção, ou aplicar um grupo de ação a um conjunto de alertas de uma vez.",
                    },
                    {
                        type: "quote",
                        value: 'A separação existe para reuso: você define o grupo de ação da equipe de plantão **uma vez** e o referencia em dezenas de regras. Cenários de prova que pedem "notificar a mesma equipe em vários alertas" apontam para um grupo de ação compartilhado.',
                    },
                    {
                        type: "text",
                        value: "## Os tipos de regra de alerta\n\nA escolha do tipo depende da fonte do sinal.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo", "Fonte", "Exemplo"], ["Alerta de métrica", "Séries numéricas", "CPU acima de 90% por 5 minutos"], ["Alerta de log", "Consulta KQL", "Mais de 10 erros 500 em 15 minutos"], ["Alerta de log de atividade", "Operações de plano de controle", "Alguém excluiu um recurso"], ["Alerta de integridade do serviço", "Avisos da plataforma", "Manutenção planejada na região"], ["Alerta de integridade de recurso", "Estado do recurso", "A VM ficou indisponível"]]',
                    },
                    {
                        type: "text",
                        value: "## Severidade e estado\n\nOs alertas têm severidade de **Sev 0** (crítico) a **Sev 4** (verbose), e um ciclo de estado: **New**, **Acknowledged** e **Closed**. O estado é gerenciado por quem responde, e serve para não duplicar esforço quando várias pessoas veem o mesmo alerta.\n\nAlertas de métrica podem ser **stateful**, resolvendo automaticamente quando a condição deixa de ser verdadeira, o que evita a enxurrada de notificações repetidas do mesmo problema.",
                    },
                    {
                        type: "text",
                        value: "## KQL para o AZ-104\n\nA prova não exige escrever consultas complexas, mas exige **ler** e reconhecer os operadores. Os essenciais:",
                    },
                    {
                        type: "code",
                        value: '// Erros de aplicacao nas ultimas 24 horas, agrupados por hora\nAppRequests\n| where TimeGenerated > ago(24h)\n| where ResultCode >= 500\n| summarize Falhas = count() by bin(TimeGenerated, 1h)\n| order by TimeGenerated desc\n\n// Heartbeat: maquinas que nao reportam ha mais de 15 minutos\nHeartbeat\n| summarize UltimoContato = max(TimeGenerated) by Computer\n| where UltimoContato < ago(15m)\n\n// Operacoes de exclusao no log de atividade, por quem executou\nAzureActivity\n| where OperationNameValue endswith "/delete"\n| where ActivityStatusValue == "Success"\n| project TimeGenerated, Caller, ResourceGroup, OperationNameValue\n| order by TimeGenerated desc',
                    },
                    {
                        type: "table",
                        value: '[["Operador", "O que faz"], ["where", "Filtra as linhas por condição"], ["summarize", "Agrega, com count, avg, max, sum, por chaves"], ["project", "Seleciona e renomeia colunas"], ["order by (ou sort by)", "Ordena o resultado"], ["bin", "Agrupa valores em intervalos, útil com tempo"], ["ago", "Referência de tempo relativa ao agora"], ["join", "Combina duas tabelas por uma chave comum"], ["take (ou limit)", "Devolve N linhas, sem garantia de ordem"]]',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual componente define o que acontece quando um alerta dispara?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O grupo de ação.",
                                isCorrect: true,
                            },
                            {
                                text: "A regra de alerta, que já contém os destinatários da notificação configurados.",
                                isCorrect: false,
                            },
                            {
                                text: "A regra de processamento de alerta, que dispara as notificações da condição.",
                                isCorrect: false,
                            },
                            {
                                text: "A configuração de diagnóstico do recurso monitorado pela regra que foi criada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que grupo de ação e regra de alerta são componentes separados?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para reuso: o mesmo grupo pode ser referenciado por muitas regras.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a regra é criada no recurso e o grupo é criado no nível da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as notificações exigem uma licença separada da usada pelas regras de alerta.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o grupo de ação avalia a condição e a regra apenas define o escopo do alerta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer suprimir notificações durante uma janela de manutenção. Qual recurso usar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Regra de processamento de alerta.",
                                isCorrect: true,
                            },
                            {
                                text: "Desabilitar cada regra de alerta manualmente antes do início da manutenção.",
                                isCorrect: false,
                            },
                            {
                                text: "Alterar a severidade dos alertas para Sev 4 durante o período da manutenção.",
                                isCorrect: false,
                            },
                            {
                                text: "Remover o grupo de ação das regras e reconfigurá-lo depois da janela encerrada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual tipo de alerta avisa quando alguém exclui um recurso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Alerta de log de atividade.",
                                isCorrect: true,
                            },
                            {
                                text: "Alerta de métrica, monitorando a contagem de recursos existentes na assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Alerta de integridade de recurso, que informa mudanças no estado do recurso.",
                                isCorrect: false,
                            },
                            {
                                text: "Alerta de integridade do serviço, que avisa sobre incidentes e manutenções.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em KQL, qual operador agrega valores usando funções como count e avg?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "summarize.",
                                isCorrect: true,
                            },
                            {
                                text: "project, que seleciona e renomeia as colunas devolvidas pela consulta executada.",
                                isCorrect: false,
                            },
                            {
                                text: "where, que filtra as linhas conforme a condição informada na expressão da consulta.",
                                isCorrect: false,
                            },
                            {
                                text: "bin, que agrupa os valores em intervalos, sendo comum no eixo de tempo da consulta.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Insights e Network Watcher",
                blocks: [
                    {
                        type: "text",
                        value: "## Os Insights\n\nOs **Insights** do Azure Monitor são experiências prontas por tipo de carga, que combinam coleta padronizada, painéis e consultas já escritas. Eles reduzem o esforço de montar monitoramento do zero.\n\n**VM Insights.** Painéis de desempenho e o **mapa de dependências**, que descobre processos e conexões entre máquinas, revelando quem fala com quem. Exige o Azure Monitor Agent e a dependência habilitada.\n\n**Container Insights.** Métricas e logs de clusters AKS e de Container Instances.\n\n**Storage Insights.** Capacidade, transações, latência e disponibilidade das contas de armazenamento.\n\n**Network Insights.** Topologia e saúde dos recursos de rede.\n\n**Application Insights.** Telemetria de aplicação: requisições, dependências, exceções, desempenho e uso.",
                    },
                    {
                        type: "quote",
                        value: 'O **mapa de dependências** do VM Insights é a resposta para "precisamos descobrir quais servidores conversam entre si antes de migrar". Ele descobre as conexões sem exigir que alguém documente a arquitetura previamente.',
                    },
                    {
                        type: "text",
                        value: "## As ferramentas do Network Watcher\n\nO Network Watcher reúne os diagnósticos de rede, e a prova cobra qual usar em cada sintoma. Esta tabela é uma das mais rentáveis do domínio de monitoramento.",
                    },
                    {
                        type: "table",
                        value: '[["Ferramenta", "Responde", "Quando usar"], ["Verificação de fluxo de IP", "Este tráfego é permitido ou negado?", "Suspeita de regra de NSG bloqueando"], ["Próximo salto", "Por onde este tráfego sai?", "Suspeita de rota errada ou UDR"], ["Regras de segurança efetivas", "Quais regras valem nesta NIC?", "Ver a soma dos NSGs aplicados"], ["Monitor de conexão", "A conectividade está boa ao longo do tempo?", "Acompanhar latência e perda continuamente"], ["Solução de problemas de conexão", "Por que esta conexão específica falha?", "Teste pontual entre origem e destino"], ["Captura de pacotes", "O que exatamente passa no fio?", "Análise profunda de protocolo"], ["Log de fluxo de NSG", "Qual tráfego foi permitido e negado?", "Auditoria e análise de tráfego histórico"], ["Topologia", "Como os recursos de rede se conectam?", "Entender o ambiente"]]',
                    },
                    {
                        type: "text",
                        value: "## Os discriminadores que a prova usa\n\n**Regra ou rota?** Se a pergunta é sobre **permissão**, use fluxo de IP ou regras efetivas. Se é sobre **caminho**, use próximo salto.\n\n**Pontual ou contínuo?** Solução de problemas de conexão é um teste pontual. Monitor de conexão acompanha ao longo do tempo, com histórico e alerta.\n\n**Agora ou histórico?** Fluxo de IP avalia a configuração atual. Log de fluxo de NSG grava o que aconteceu, para análise posterior, e precisa de uma conta de armazenamento como destino.",
                    },
                    {
                        type: "code",
                        value: "# Verificar se o trafego seria permitido\naz network watcher test-ip-flow \\\n  --resource-group rg-app --vm vm-web01 \\\n  --direction Inbound --protocol TCP \\\n  --local 10.10.1.4:443 --remote 200.1.2.3:60000\n\n# Descobrir o proximo salto para um destino\naz network watcher show-next-hop \\\n  --resource-group rg-app --vm vm-web01 \\\n  --source-ip 10.10.1.4 --dest-ip 8.8.8.8\n\n# Ver as regras de seguranca efetivas\naz network nic list-effective-nsg --resource-group rg-app --name nic-vm-web01",
                    },
                    {
                        type: "text",
                        value: "## Habilitação e escopo\n\nDois detalhes operacionais que aparecem em prova:\n\nO Network Watcher é habilitado **por região**, e o Azure normalmente cria uma instância automaticamente quando uma VNet é criada na região. Se a instância não existir, as ferramentas ficam indisponíveis ali.\n\nA **captura de pacotes** exige a extensão de agente do Network Watcher instalada na máquina virtual, e grava o resultado em uma conta de armazenamento ou em disco local da VM, com limites de tamanho e duração configuráveis.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual recurso descobre quais servidores conversam entre si antes de uma migração?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O mapa de dependências do VM Insights.",
                                isCorrect: true,
                            },
                            {
                                text: "A topologia do Network Watcher, que desenha os recursos de rede e as conexões.",
                                isCorrect: false,
                            },
                            {
                                text: "O log de fluxo de NSG, que registra o tráfego permitido e negado pelas regras.",
                                isCorrect: false,
                            },
                            {
                                text: "O Application Insights, que mapeia as dependências das aplicações instrumentadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe suspeita que uma regra de NSG bloqueia o tráfego. Qual ferramenta usar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Verificação de fluxo de IP.",
                                isCorrect: true,
                            },
                            {
                                text: "Próximo salto, que indica o caminho escolhido para o destino informado no teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Monitor de conexão, que acompanha latência e perda de pacotes ao longo do tempo.",
                                isCorrect: false,
                            },
                            {
                                text: "Captura de pacotes, que grava o tráfego que passa pela interface da máquina.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual ferramenta acompanha latência e perda de pacotes continuamente, com histórico?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Monitor de conexão.",
                                isCorrect: true,
                            },
                            {
                                text: "Solução de problemas de conexão, que executa um teste pontual entre origem e destino.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificação de fluxo de IP, que avalia a configuração de segurança aplicada ao tráfego.",
                                isCorrect: false,
                            },
                            {
                                text: "Regras de segurança efetivas, que mostram a soma dos NSGs aplicados à interface.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o log de fluxo de NSG exige como destino?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma conta de armazenamento.",
                                isCorrect: true,
                            },
                            {
                                text: "Um workspace do Log Analytics, que é o único destino aceito por esse tipo de log.",
                                isCorrect: false,
                            },
                            {
                                text: "Um Event Hub, que encaminha os registros de fluxo para análise em tempo real.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum destino: os registros ficam no próprio grupo de segurança por 30 dias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O Network Watcher é habilitado em qual escopo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Por região.",
                                isCorrect: true,
                            },
                            {
                                text: "Por rede virtual, exigindo uma instância dedicada em cada VNet criada na conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Por assinatura, com uma única instância atendendo todas as regiões utilizadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Por resource group, junto com os recursos de rede que serão diagnosticados nele.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Azure Backup",
                blocks: [
                    {
                        type: "text",
                        value: "## Os dois tipos de cofre\n\nUma distinção que a prova cobra e que confunde, porque os nomes são parecidos.\n\n**Recovery Services vault.** Atende VMs do Azure, SQL Server em VM, SAP HANA em VM, Azure Files, e cargas locais pelo agente MARS ou pelo Azure Backup Server. Também é o cofre do **Site Recovery**.\n\n**Backup vault.** Atende cargas mais novas: blobs, discos gerenciados, Azure Database for PostgreSQL, e Kubernetes.\n\nA pergunta típica dá a carga e pede o cofre. A âncora: **VM e Files vão no Recovery Services; blob e disco vão no Backup vault.**",
                    },
                    {
                        type: "text",
                        value: "## A política de backup\n\nA política define **quando** copiar e **por quanto tempo** guardar:\n\n**Frequência.** Diária ou semanal para VMs pela extensão, e a opção **enhanced policy** permite backup várias vezes ao dia.\n\n**Retenção em camadas.** Diária, semanal, mensal e anual, cada uma com prazo próprio. Isso implementa a política de avô, pai e filho sem esforço manual.\n\n**Janela de backup.** Horário em que o job é disparado.\n\nUma política pode ser compartilhada por muitos itens protegidos, o que padroniza a proteção e evita configuração divergente.",
                    },
                    {
                        type: "table",
                        value: '[["Conceito", "O que é"], ["Item protegido", "O recurso que está sendo copiado, como uma VM"], ["Ponto de recuperação", "Uma cópia consistente em um momento no tempo"], ["Política", "Frequência e retenção aplicadas ao item"], ["Job", "A execução de um backup ou de uma restauração"], ["Instant restore", "Snapshots retidos localmente por 1 a 5 dias, para restauração rápida"]]',
                    },
                    {
                        type: "quote",
                        value: "O **instant restore** mantém snapshots no próprio disco por 1 a 5 dias, antes de o dado ser transferido para o cofre. Isso torna a restauração recente muito mais rápida, e explica por que existe custo de armazenamento de snapshot além do custo do cofre.",
                    },
                    {
                        type: "text",
                        value: "## As opções de restauração de VM\n\nQuatro caminhos, e a prova pede o adequado ao requisito:\n\n**Criar nova VM.** Restaura para uma máquina nova, preservando a original.\n\n**Substituir a existente.** Sobrescreve os discos da máquina atual.\n\n**Restaurar discos.** Devolve os discos para um resource group, e você monta a máquina como quiser. É a opção mais flexível.\n\n**Restaurar arquivos individuais.** Monta o ponto de recuperação como uma unidade e permite copiar arquivos específicos, sem restaurar a máquina inteira.",
                    },
                    {
                        type: "text",
                        value: "## Proteção do próprio backup\n\nTrês recursos que a prova cobra, porque atacam o cenário de ransomware:\n\n**Soft delete.** Retém os dados de backup por 14 dias após a exclusão do item protegido, permitindo desfazer. Pode ser sempre ativado ou configurável conforme a versão.\n\n**Autorização multiusuário (MUA).** Exige aprovação de um segundo responsável, por meio de um Resource Guard, para operações críticas como desabilitar soft delete ou reduzir retenção.\n\n**Imutabilidade do cofre.** Impede operações que resultariam em perda de dados, como reduzir retenção ou excluir pontos de recuperação, e no modo bloqueado é irreversível.",
                    },
                    {
                        type: "code",
                        value: "# Habilitar backup de uma VM com politica existente\naz backup protection enable-for-vm \\\n  --resource-group rg-backup --vault-name rsv-prod \\\n  --vm vm-sql01 --policy-name DiarioProducao\n\n# Disparar um backup sob demanda com retencao especifica\naz backup protection backup-now \\\n  --resource-group rg-backup --vault-name rsv-prod \\\n  --container-name vm-sql01 --item-name vm-sql01 \\\n  --retain-until 31-12-2026\n\n# Listar pontos de recuperacao\naz backup recoverypoint list --resource-group rg-backup --vault-name rsv-prod \\\n  --container-name vm-sql01 --item-name vm-sql01 -o table",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual cofre atende backup de máquinas virtuais do Azure e do Azure Files?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Recovery Services vault.",
                                isCorrect: true,
                            },
                            {
                                text: "Backup vault, que atende as cargas mais novas suportadas pelo serviço de backup.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos atendem essas cargas, mudando apenas o custo do armazenamento contratado.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: VMs usam snapshots de disco e Files usa snapshots de compartilhamento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cofre atende backup de blobs e de discos gerenciados?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Backup vault.",
                                isCorrect: true,
                            },
                            {
                                text: "Recovery Services vault, que atende todas as cargas nativas da plataforma Azure.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois, desde que a conta de armazenamento tenha versionamento habilitado.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: blobs são protegidos apenas por soft delete e versionamento na conta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o instant restore faz no Azure Backup?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Mantém snapshots locais por 1 a 5 dias, acelerando a restauração recente.",
                                isCorrect: true,
                            },
                            {
                                text: "Restaura a máquina virtual em menos de cinco minutos usando o ponto mais recente.",
                                isCorrect: false,
                            },
                            {
                                text: "Replica os pontos de recuperação para a região secundária emparelhada do cofre.",
                                isCorrect: false,
                            },
                            {
                                text: "Permite restaurar arquivos individuais sem montar o ponto de recuperação inteiro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual opção de restauração é a mais flexível para uma VM?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Restaurar os discos e montar a máquina manualmente depois.",
                                isCorrect: true,
                            },
                            {
                                text: "Criar uma nova máquina virtual a partir do ponto de recuperação selecionado.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir a máquina existente, sobrescrevendo os discos atuais dela.",
                                isCorrect: false,
                            },
                            {
                                text: "Restaurar arquivos individuais montando o ponto de recuperação como unidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual recurso exige aprovação de um segundo responsável para operações críticas de backup?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Autorização multiusuário com Resource Guard.",
                                isCorrect: true,
                            },
                            {
                                text: "Soft delete, que retém os dados por 14 dias após a exclusão do item protegido.",
                                isCorrect: false,
                            },
                            {
                                text: "Imutabilidade do cofre, que impede operações resultando em perda de dados.",
                                isCorrect: false,
                            },
                            {
                                text: "Bloqueio de recurso do tipo ReadOnly aplicado ao cofre de serviços de recuperação.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Site Recovery e o dia da prova",
                blocks: [
                    {
                        type: "text",
                        value: '## Backup contra Site Recovery\n\nA distinção mais cobrada deste módulo:\n\n**Azure Backup** protege **dados**. O objetivo é restaurar informação, com pontos de recuperação retidos por muito tempo. O RPO é medido em horas e o RTO em horas.\n\n**Azure Site Recovery** protege **continuidade**. O objetivo é manter o serviço no ar, replicando cargas para outra região e permitindo failover. O RPO é medido em minutos ou segundos, e o RTO em minutos.\n\nUm cenário que exige "voltar o arquivo apagado de três meses atrás" é backup. Um cenário que exige "a aplicação continua funcionando se a região cair" é Site Recovery.',
                    },
                    {
                        type: "text",
                        value: "## O ciclo de vida do Site Recovery\n\nCinco etapas, na ordem que a prova cobra:\n\n**1. Habilitar a replicação.** Define a região de destino, a rede de destino e os mapeamentos de rede e de recursos. A replicação é contínua e assíncrona.\n\n**2. Failover de teste.** Cria as máquinas em uma **rede isolada**, sem afetar produção e **sem interromper a replicação**. É o ensaio, e deve ser feito periodicamente.\n\n**3. Failover.** Direciona a carga para a região secundária. Pode ser planejado ou não planejado.\n\n**4. Commit.** Consolida o failover, descartando os outros pontos de recuperação.\n\n**5. Reproteção e failback.** A reproteção passa a replicar no sentido inverso, e o failback devolve a carga para a região original.",
                    },
                    {
                        type: "table",
                        value: '[["", "Failover de teste", "Failover"], ["Rede usada", "Isolada", "A de produção do destino"], ["Afeta produção?", "Não", "Sim"], ["Interrompe a replicação?", "Não", "Sim"], ["Exige commit?", "Não, faz limpeza", "Sim"], ["Para que serve", "Ensaio e validação do plano", "Continuidade em incidente real"]]',
                    },
                    {
                        type: "quote",
                        value: 'O **plano de recuperação** agrupa máquinas que devem sofrer failover juntas, em grupos ordenados, com scripts e pausas manuais entre eles. É como se garante que o banco suba antes da aplicação, e é a resposta para "o failover precisa respeitar a ordem de inicialização".',
                    },
                    {
                        type: "text",
                        value: "## O que este módulo cobriu",
                    },
                    {
                        type: "table",
                        value: '[["Assunto", "O que gravar"], ["Métricas x logs", "Numérico e rápido x KQL e detalhado; memória exige agente"], ["Diagnóstico", "Três destinos; só o workspace permite KQL"], ["Alertas", "Regra define a condição, grupo de ação define o que fazer"], ["Insights", "Experiências prontas; VM Insights tem mapa de dependências"], ["Network Watcher", "Fluxo de IP para regra, próximo salto para rota"], ["Cofres", "Recovery Services para VM e Files; Backup vault para blob e disco"], ["Backup x Site Recovery", "Dados x continuidade"], ["Site Recovery", "Teste não interrompe; failover exige commit e reproteção"]]',
                    },
                    {
                        type: "text",
                        value: '## O plano para o dia da prova\n\n**Antes.** Faça o simulado da plataforma até passar do corte com folga em tentativas seguidas. Ele tem 125 questões no banco e sorteia 50 por tentativa, com a distribuição por domínio igual à da prova, então cada tentativa é diferente. Use o filtro de assuntos para treinar só os domínios em que errou mais.\n\n**Pratique no portal.** Este é o ponto que nenhum material substitui. O AZ-104 descreve telas, comandos e sequências de configuração. Uma assinatura gratuita cobre a maior parte dos exercícios sugeridos ao longo da trilha.\n\n**Estratégia de tempo.** Entre 40 e 60 questões em 100 minutos. Os **estudos de caso** consomem tempo desproporcional, então avalie deixá-los para depois se aparecerem no começo, quando a seção permitir voltar. Fique atento aos avisos de seções sem retorno.\n\n**Leitura da questão.** Procure as palavras que restringem: "menor privilégio", "menor custo", "sem tempo de indisponibilidade", "sem endereço público", "a partir da rede local". Cada uma dessas elimina alternativas que funcionariam tecnicamente, mas não atendem à restrição.\n\n**Nos cálculos.** Endereços utilizáveis de sub-rede, prioridade de regra de NSG e escolha de camada de App Service são os cálculos e tabelas mais cobrados. Vale revisar as tabelas dos módulos 6 e 5 na véspera.',
                    },
                    {
                        type: "quote",
                        value: "Uma última observação: o AZ-104 é uma prova de **administrador**, e as questões descrevem situações reais de operação. Se você praticou no portal, criou uma VNet com sub-redes, tentou um peering com espaços sobrepostos e viu o erro, e configurou um NSG que bloqueou o próprio acesso, boa parte das questões vai parecer familiar. Boa prova.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a diferença de propósito entre Azure Backup e Azure Site Recovery?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Backup protege dados para restauração; Site Recovery mantém o serviço no ar.",
                                isCorrect: true,
                            },
                            {
                                text: "Backup replica para outra região e o Site Recovery guarda pontos históricos.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois têm o mesmo propósito, mudando apenas o tipo de cofre utilizado.",
                                isCorrect: false,
                            },
                            {
                                text: "Backup atende cargas locais e o Site Recovery apenas cargas nativas do Azure.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que caracteriza um failover de teste no Site Recovery?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usa rede isolada e não interrompe a replicação em andamento.",
                                isCorrect: true,
                            },
                            {
                                text: "Interrompe a replicação e exige commit ao final da validação do plano.",
                                isCorrect: false,
                            },
                            {
                                text: "Direciona o tráfego de produção para a região secundária por tempo limitado.",
                                isCorrect: false,
                            },
                            {
                                text: "Exige que as máquinas de origem estejam desligadas durante toda a execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual operação consolida o failover e descarta os outros pontos de recuperação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O commit.",
                                isCorrect: true,
                            },
                            {
                                text: "A reproteção, que passa a replicar da região secundária para a região original.",
                                isCorrect: false,
                            },
                            {
                                text: "O failback, que devolve a carga para a região primária após a interrupção.",
                                isCorrect: false,
                            },
                            {
                                text: "A limpeza do failover de teste, executada ao final do ensaio do plano criado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que serve um plano de recuperação no Site Recovery?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Agrupar máquinas em grupos ordenados, com scripts e pausas entre eles.",
                                isCorrect: true,
                            },
                            {
                                text: "Definir a política de retenção dos pontos de recuperação criados pela replicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher a região de destino e os mapeamentos de rede usados na replicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Registrar os testes de failover executados e o resultado obtido em cada um deles.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, quais palavras em um enunciado eliminam alternativas tecnicamente válidas?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Menor privilégio, menor custo, sem indisponibilidade, sem endereço público.",
                                isCorrect: true,
                            },
                            {
                                text: "Configurar, implantar, gerenciar e monitorar, que indicam o domínio avaliado.",
                                isCorrect: false,
                            },
                            {
                                text: "Azure, portal, CLI e PowerShell, que indicam a ferramenta esperada na resposta.",
                                isCorrect: false,
                            },
                            {
                                text: "Sempre, nunca e sob nenhuma circunstância, que indicam alternativas incorretas.",
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
                trailLevel: "intermediario",
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
