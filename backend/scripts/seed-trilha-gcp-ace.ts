// Seed da trilha Google Cloud Associate Cloud Engineer (ACE). Conteúdo autoral,
// escrito para ensinar as 5 seções do exame. Idempotente e não destrutivo: se a
// trilha já tiver aulas, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-trilha-gcp-ace.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-gcp-ace.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Google Cloud Associate Cloud Engineer";
const CARGA_HORARIA = 20;
const DESCRICAO =
    "Trilha de preparação para a certificação Google Cloud Associate Cloud Engineer: hierarquia de recursos e projetos, faturamento e controle de custos, IAM e contas de serviço, Compute Engine, contêineres com GKE e Cloud Run, armazenamento e bancos de dados, rede na VPC, observabilidade e infraestrutura como código.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Fundamentos e organização de recursos",
    aulas: [
        {
            titulo: "Google Cloud, regiões e zonas",
            blocks: [
                {
                    type: "text",
                    value: "A primeira decisão de um projeto no Google Cloud não é qual máquina usar, e sim **onde** o recurso vai morar. Essa escolha define três coisas difíceis de desfazer depois: a latência que o usuário sente, o que acontece quando um datacenter cai e em que país os dados ficam guardados.\n\nO Google Cloud organiza a infraestrutura em **zonas** dentro de **regiões**. Alguns serviços vão além e se espalham por várias regiões, e outros não têm localização nenhuma porque vivem no plano de controle global. A prova cobra exatamente isso: dado um requisito de disponibilidade ou de residência de dados, qual escopo atende.",
                },
                {
                    type: "text",
                    value: "## A zona é um domínio de falha\n\nA documentação define zona como uma área de implantação de recursos dentro de uma região, e manda tratar cada zona como **um único domínio de falha**. Uma região é uma área geográfica independente formada por três ou mais zonas, em três ou mais datacenters físicos.\n\nO nome da zona carrega a região: em `us-central1-a`, `us-central1` é a região e `a` é a zona. Zonas da mesma região têm conexão de banda larga e baixa latência entre si, o que torna barato replicar dentro da região e caro replicar entre regiões.\n\nDaí sai a regra prática de disponibilidade: uma VM em uma zona cai junto com a zona. Para tolerar a queda de uma zona, distribua a aplicação por **várias zonas da mesma região**. Para tolerar a queda de uma região inteira, distribua por **várias regiões**.",
                },
                {
                    type: "table",
                    value: '[["Escopo", "O que significa", "Exemplo", "Sobrevive a quê"], ["Zonal", "Vive em uma zona só", "VM, disco zonal, GPU", "Nada além da própria zona"], ["Regional", "Replicado entre zonas da região", "Disco regional, grupo gerenciado regional", "Queda de uma zona"], ["Multirregional", "Replicado entre regiões pelo Google", "Bucket multirregião, BigQuery, Spanner", "Queda de uma região"], ["Global", "Sem localização, serve o projeto todo", "Rede VPC, firewall, imagem, snapshot", "Queda de zona e de região"]]',
                },
                {
                    type: "text",
                    value: "## No Compute Engine, cada recurso já nasce com um escopo\n\nVale decorar os casos que a prova repete:\n\n- **Globais**: imagens, snapshots, redes VPC, regras de firewall, rotas, endereços IP externos globais e templates de instância globais.\n- **Regionais**: sub-redes, endereços IP externos estáticos regionais, discos regionais, grupos gerenciados de instâncias regionais e políticas de posicionamento.\n- **Zonais**: instâncias, discos zonais, tipos de máquina, GPUs, Cloud TPUs e grupos gerenciados de instâncias zonais.\n\nA pegadinha clássica é a rede: a **rede VPC é global**, mas cada **sub-rede é regional**. Uma única VPC atende VMs em qualquer região do projeto, enquanto o intervalo de IP que a VM recebe vem da sub-rede daquela região. A regra de firewall, por ser global, vale para a rede inteira.",
                },
                {
                    type: "code",
                    value: "gcloud compute regions list\ngcloud compute zones list\ngcloud compute zones describe us-central1-a\ngcloud config set compute/region us-central1\ngcloud config set compute/zone us-central1-a",
                },
                {
                    type: "text",
                    value: '## Multirregião e dupla região: o caso do Cloud Storage\n\nO bucket do Cloud Storage é o exemplo mais direto de escolha de local. Os tipos são:\n\n- **Região**, como `southamerica-east1`: dados redundantes entre zonas da região, com failover automático se uma zona cai.\n- **Dupla região**: duas regiões emparelhadas, com replicação assíncrona entre elas.\n- **Multirregião**: uma área geográfica grande que contém duas ou mais regiões. As multirregiões disponíveis são `US`, `EU` e `ASIA`.\n\nRegião e multirregião não são o mesmo nome escrito de dois jeitos. `US` é multirregião, `us-central1` é região. Em prova, "o bucket precisa continuar servindo se uma região inteira ficar indisponível" aponta para dupla região ou multirregião. "Os dados não podem sair do país" aponta para região. E o local do bucket não muda depois de criado.',
                },
                {
                    type: "code",
                    value: "gcloud storage buckets create gs://relatorios-financeiro --location=southamerica-east1\ngcloud storage buckets create gs://catalogo-publico --location=us\ngcloud storage buckets describe gs://relatorios-financeiro",
                },
                {
                    type: "quote",
                    value: "Zona não tolera falha nenhuma, região tolera a queda de uma zona, multirregião tolera a queda de uma região.",
                },
                {
                    type: "text",
                    value: "## Como escolher o local na prática\n\nQuatro critérios, nesta ordem:\n\n1. **Residência de dados**: se a lei ou o contrato exige dados no país, a região é escolhida antes de qualquer outra coisa.\n2. **Latência**: prefira a região mais próxima de quem consome. Para usuário no Brasil, `southamerica-east1`, em São Paulo, costuma ganhar de qualquer região dos Estados Unidos.\n3. **Disponibilidade do serviço**: nem toda região oferece todo produto nem todo tipo de máquina, então confira antes de desenhar a arquitetura.\n4. **Custo**: o preço do mesmo recurso varia de região para região, e trocar de local muda a fatura.\n\nColocar recursos em zonas diferentes da mesma região já reduz o risco de uma falha de infraestrutura atingir tudo ao mesmo tempo. Regiões diferentes dão um grau ainda maior de independência de falha, ao custo de latência e de complexidade.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma aplicação roda em uma única instância de VM na zona `us-central1-a`. O time precisa que ela continue no ar mesmo se essa zona ficar indisponível. Qual mudança atende ao requisito?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Distribuir instâncias por mais de uma zona da região us-central1",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o tipo de máquina da instância e reservar mais memória",
                            isCorrect: false,
                        },
                        {
                            text: "Mover a instância para a zona us-central1-b e manter uma só réplica",
                            isCorrect: false,
                        },
                        {
                            text: "Programar snapshot diário do disco da instância na mesma zona",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual classificação de escopo de rede no Compute Engine está correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A rede VPC é global e a sub-rede é regional",
                            isCorrect: true,
                        },
                        {
                            text: "A rede VPC é regional e a sub-rede é zonal",
                            isCorrect: false,
                        },
                        {
                            text: "A rede VPC é zonal e a sub-rede é regional",
                            isCorrect: false,
                        },
                        {
                            text: "A rede VPC é regional e a sub-rede é global",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sobre os tipos de local de um bucket do Cloud Storage, qual afirmação está correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "US é uma multirregião e us-central1 é uma região",
                            isCorrect: true,
                        },
                        {
                            text: "US e us-central1 são dois nomes da mesma região",
                            isCorrect: false,
                        },
                        {
                            text: "US é uma região e us-central1 é uma multirregião",
                            isCorrect: false,
                        },
                        {
                            text: "US é uma dupla região e us-central1 é uma zona",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa brasileira tem exigência contratual de manter dados de clientes apenas em território nacional e quer tolerar a queda de uma zona. Qual opção de armazenamento atende às duas exigências?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Bucket na região southamerica-east1, com redundância entre zonas",
                            isCorrect: true,
                        },
                        {
                            text: "Bucket na multirregião US, com redundância entre várias regiões",
                            isCorrect: false,
                        },
                        {
                            text: "Bucket na multirregião EU, com chave de criptografia gerada no Brasil",
                            isCorrect: false,
                        },
                        {
                            text: "Disco zonal em southamerica-east1-a, com snapshot semanal automático",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Entre os recursos do Compute Engine a seguir, qual é um recurso global?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Regra de firewall aplicada a uma rede VPC",
                            isCorrect: true,
                        },
                        {
                            text: "Sub-rede que segmenta o espaço de IP",
                            isCorrect: false,
                        },
                        {
                            text: "Grupo gerenciado de instâncias zonal",
                            isCorrect: false,
                        },
                        {
                            text: "Disco regional replicado entre duas zonas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Hierarquia de recursos: organização, pastas e projetos",
            blocks: [
                {
                    type: "text",
                    value: "Uma conta de nuvem que cresce sem organização gera sempre o mesmo problema: ninguém sabe quem paga o quê, quem tem acesso a quê, nem onde está o recurso esquecido que continua custando. A hierarquia de recursos do Google Cloud existe para evitar isso desde o começo.\n\nA hierarquia tem a **organização** na raiz, as **pastas** no meio como agrupamento opcional e os **projetos** embaixo, contendo os recursos de serviço. Ela não serve só para arrumar a casa: é por ela que **políticas de acesso do IAM e políticas da organização descem por herança**.",
                },
                {
                    type: "text",
                    value: "## Os níveis, de cima para baixo\n\n- **Organização**: representa a empresa e é o nó raiz da hierarquia. É pai de todas as pastas e de todos os projetos. Existe para clientes de Google Workspace ou Cloud Identity com um domínio.\n- **Pasta**: agrupamento opcional entre organização e projeto. Funciona como suborganização, cria fronteira de isolamento entre projetos e pode ser aninhada em até dez níveis.\n- **Projeto**: a entidade fundamental de organização. É nele que você cria recursos, habilita APIs, associa conta de faturamento, gerencia cotas e concede permissões.\n- **Recurso**: a VM, o bucket, a instância de banco. Vive sempre dentro de um projeto.\n\nSem nó de organização você ainda cria projetos, mas perde pasta, política da organização em escala e controle central. Por isso o primeiro passo de uma empresa é ter a organização criada.",
                },
                {
                    type: "table",
                    value: '[["Nível", "O que representa", "Para que serve na prática"], ["Organização", "A empresa inteira", "Ponto único de política e de auditoria"], ["Pasta", "Departamento, equipe ou ambiente", "Delegar administração e isolar projetos"], ["Projeto", "Uma carga de trabalho ou ambiente", "Faturamento, APIs, cotas e permissões"], ["Recurso", "A VM, o bucket, o cluster", "Herdar tudo o que vem de cima"]]',
                },
                {
                    type: "text",
                    value: "## O projeto tem três identificadores, e eles não se misturam\n\nEssa é uma das perguntas mais previsíveis da prova.\n\n- **Nome do projeto**: o rótulo legível. Tem de 4 a 30 caracteres e aceita letras, números, aspas simples, hifens, espaços e pontos de exclamação. Pode ser alterado quando quiser e **não precisa ser único**.\n- **ID do projeto**: o identificador que entra em comandos, URLs e cobrança. Tem de 6 a 30 caracteres, aceita apenas letras minúsculas, números e hifens, começa com letra e não termina com hifen. É **globalmente único** e **permanente depois de criado**.\n- **Número do projeto**: identificador numérico único, gerado automaticamente. Você não escolhe e não muda.\n\nO detalhe que derruba candidato: o ID não pode estar em uso **nem ter sido usado antes**. Apagar um projeto não libera o ID dele para alguém reaproveitar. Já o nome pode ser reutilizado sem problema. Quer trocar o ID? Só criando outro projeto e migrando os recursos.",
                },
                {
                    type: "table",
                    value: '[["Identificador", "Quem define", "Pode mudar", "É único"], ["Nome", "Você, quando quiser", "Sim", "Não"], ["ID", "Você, só na criação", "Não, é permanente", "Sim, global e para sempre"], ["Número", "O Google Cloud", "Não", "Sim"]]',
                },
                {
                    type: "code",
                    value: 'gcloud projects create ensinadev-prod-001 --name="EnsinaDev Producao" --folder=456789012345\ngcloud projects describe ensinadev-prod-001 --format="value(projectNumber)"\ngcloud projects list\ngcloud config set project ensinadev-prod-001',
                },
                {
                    type: "text",
                    value: "## A herança desce, e é isso que dá escala\n\nPolíticas de acesso do IAM e políticas da organização aplicadas em um nó são **herdadas por todos os descendentes** daquele nó. Um papel concedido na organização alcança toda pasta e todo projeto abaixo dela. Concedido na pasta, alcança os projetos dentro dela.\n\nDuas consequências que a prova explora:\n\n- A política efetiva de um recurso é a **união** do que foi concedido nele e do que vem de cima. Um projeto não cancela um papel herdado da organização só porque não concedeu aquele papel ali.\n- Logo, conceda sempre no **nível mais baixo que resolve**. Dar papel de administrador na organização inteira porque alguém precisava mexer em um projeto é o erro de arquitetura mais comum em auditoria.",
                },
                {
                    type: "quote",
                    value: "Papel concedido acima desce por herança, e o nível de baixo não revoga o que veio de cima.",
                },
                {
                    type: "text",
                    value: "## O que uma pasta resolve numa empresa de verdade\n\nImagine uma empresa com as áreas de Vendas, Dados e Plataforma, cada uma com ambientes de desenvolvimento, homologação e produção. Sem pastas, são dezenas de projetos soltos sob a organização e toda concessão de acesso é feita projeto por projeto, na mão.\n\nCom pastas, o desenho fica assim: uma pasta por área e, dentro dela, uma pasta por ambiente. O time de Dados recebe o papel na pasta `Dados` e passa a administrar todos os projetos dela, inclusive os que ainda vão nascer, sem nunca tocar em Vendas. O time de segurança aplica uma política só na pasta de produção.\n\nÉ isso que a documentação chama de delegação: a pasta funciona como suborganização e cria fronteira de isolamento entre projetos. Lembre que **pasta exige nó de organização** e aceita até dez níveis de aninhamento.",
                },
                {
                    type: "code",
                    value: 'gcloud resource-manager folders create --display-name="Dados" --organization=123456789012\ngcloud resource-manager folders list --organization=123456789012\ngcloud resource-manager folders create --display-name="Producao" --folder=456789012345\ngcloud resource-manager folders get-iam-policy 456789012345',
                },
            ],
            questions: [
                {
                    statement:
                        "Qual identificador do projeto você define no momento da criação e não pode mais alterar depois?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O ID do projeto",
                            isCorrect: true,
                        },
                        {
                            text: "O nome do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O número do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O rótulo de faturamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O papel de administrador do Compute Engine foi concedido a um grupo no nó da organização. Em um projeto dentro de uma pasta ninguém recebeu esse papel. O que vale nesse projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O grupo tem o papel no projeto, pois a concessão desce por herança",
                            isCorrect: true,
                        },
                        {
                            text: "O grupo não tem o papel, porque cada projeto concede o seu próprio acesso",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo tem o papel apenas depois de a pasta repetir a concessão",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo não tem o papel, porque a pasta interrompeu a herança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer que o time de Dados administre todos os projetos da área, inclusive os futuros, sem receber acesso aos projetos de Vendas. Qual desenho atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conceder o papel ao time na pasta Dados, que agrupa os projetos da área",
                            isCorrect: true,
                        },
                        {
                            text: "Conceder o papel ao time no nó da organização e revisar os acessos depois",
                            isCorrect: false,
                        },
                        {
                            text: "Conceder o papel ao time em cada projeto da área, repetindo na criação",
                            isCorrect: false,
                        },
                        {
                            text: "Conceder o papel ao time na conta de faturamento usada pela área toda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual afirmação sobre pastas no Google Cloud está correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Exigem nó de organização e aceitam até dez níveis de aninhamento",
                            isCorrect: true,
                        },
                        {
                            text: "Funcionam sem organização e aceitam um único nível de aninhamento",
                            isCorrect: false,
                        },
                        {
                            text: "Substituem o projeto como entidade que habilita APIs e tem cotas",
                            isCorrect: false,
                        },
                        {
                            text: "Recebem recursos como VM e bucket diretamente, sem usar projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um projeto foi criado com o ID `app-teste-01` e o time quer passar a usar o ID `app-prod-01` mantendo os recursos no lugar. O que é possível fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nada: o ID é permanente, logo o caminho é criar um outro projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Mudar o ID com o comando gcloud projects update, sem perder recursos",
                            isCorrect: false,
                        },
                        {
                            text: "Mudar o ID pelo console, desde que o projeto esteja sem faturamento",
                            isCorrect: false,
                        },
                        {
                            text: "Mudar o ID e manter o número do projeto apontando para o ID antigo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Políticas da organização e restrições",
            blocks: [
                {
                    type: "text",
                    value: "Um desenvolvedor com papel de administrador do Compute Engine em um projeto de produção cria uma VM com IP externo e a expõe na internet. Ele tinha permissão para isso, então o IAM não vai impedir nada. O que a empresa queria dizer era outra coisa: nesta empresa, VM não recebe IP externo. Esse tipo de regra é trabalho da **política da organização**.\n\nO Organization Policy Service dá controle central e programático sobre a configuração dos recursos do Google Cloud. A frase que resume a diferença está na própria documentação: o IAM cuida de **quem** pode agir, e a política da organização cuida de **o que** pode ser configurado.",
                },
                {
                    type: "text",
                    value: "## Restrição é o molde, política é a aplicação\n\nSão dois conceitos distintos, e a prova troca os nomes de propósito.\n\n- Uma **restrição** (constraint) é um tipo específico de limitação contra um serviço ou um conjunto de serviços do Google Cloud. É o molde, com nome publicado pelo Google, como `constraints/compute.vmExternalIpAccess`.\n- Uma **política da organização** é essa restrição configurada e aplicada em um nó da hierarquia: organização, pasta ou projeto.\n\nA restrição descreve o que é possível limitar; a política diz onde e como aquilo passa a valer. Aplicar a política em um nó faz todos os descendentes herdarem a regra, e quem a aplica de fato é o serviço correspondente do Google Cloud, no momento da chamada.\n\nO papel que administra isso é o **Administrador de políticas da organização**, `roles/orgpolicy.policyAdmin`, e ele só pode ser concedido no nó de organização.",
                },
                {
                    type: "table",
                    value: '[["Pergunta", "IAM", "Política da organização"], ["O que controla", "Quem pode agir", "O que pode ser configurado"], ["Unidade de trabalho", "Papel com permissões", "Restrição com valores"], ["Onde se aplica", "Organização, pasta, projeto e recurso", "Organização, pasta e projeto"], ["Efeito do nível de baixo", "Soma com o que foi herdado", "Herda ou substitui a do pai"], ["Exemplo", "Conceder roles/compute.admin", "Proibir IP externo em qualquer VM"]]',
                },
                {
                    type: "text",
                    value: "## Restrição de lista e restrição booleana\n\nToda restrição é de um destes dois tipos:\n\n- **Booleana**: está aplicada ou não está, sem valores. A documentação cita `constraints/compute.disableSerialPortAccess` e `constraints/iam.disableServiceAccountCreation`.\n- **De lista**: permite ou nega uma lista de valores, com `allowedValues` ou `deniedValues`. A documentação cita `constraints/gcp.resourceLocations` e `constraints/compute.trustedImageProjects`.\n\nA restrição de lista é a que resolve residência de dados. Com `gcp.resourceLocations` você declara em quais regiões ou multirregiões recursos novos podem nascer, usando grupos de valores como `in:southamerica-east1-locations`. A criação em qualquer outro local falha na hora, sem depender de alguém revisar depois.",
                },
                {
                    type: "code",
                    value: "name: folders/456789012345/policies/gcp.resourceLocations\nspec:\n  rules:\n  - values:\n      allowedValues:\n      - in:southamerica-east1-locations\n  inheritFromParent: true",
                },
                {
                    type: "code",
                    value: "gcloud org-policies set-policy politica-local.yaml\ngcloud org-policies describe gcp.resourceLocations --folder=456789012345\ngcloud org-policies describe gcp.resourceLocations --effective --project=ensinadev-prod-001\ngcloud org-policies list --project=ensinadev-prod-001",
                },
                {
                    type: "text",
                    value: "## Herança, substituição e simulação\n\nQuando uma política é aplicada em um nó, todos os descendentes a herdam por padrão. A partir daí o nível de baixo pode interferir de duas formas:\n\n- `inheritFromParent: true` faz a política do nó se juntar à do pai, somando os valores da lista.\n- `inheritFromParent: false` faz a política do nó valer sozinha, ignorando o que vinha de cima.\n\nPara saber o que realmente está valendo em um projeto, não olhe a política aplicada ali: peça a **política efetiva**, com a flag `--effective`. Ela é o resultado do cálculo da herança inteira, de cima para baixo.\n\nE antes de aplicar algo que pode quebrar produção existe o modo de **simulação** (dry run), que registra as violações sem bloquear a criação dos recursos. No console é o botão de definir política de simulação; na API é o bloco `dryRunSpec` em lugar de `spec`.",
                },
                {
                    type: "quote",
                    value: "O IAM responde quem pode agir; a política da organização responde o que pode ser configurado.",
                },
                {
                    type: "text",
                    value: '## As restrições que aparecem na prova\n\nNão dá para decorar o catálogo inteiro, mas estas voltam sempre:\n\n- `constraints/gcp.resourceLocations`: de lista, limita as regiões onde recursos podem ser criados. É a resposta para residência de dados.\n- `constraints/compute.vmExternalIpAccess`: de lista, controla quais VMs podem ter IP externo. Com uma regra de negar tudo, nenhuma pode.\n- `constraints/compute.disableSerialPortAccess`: booleana, bloqueia o acesso à porta serial.\n- `constraints/iam.disableServiceAccountCreation`: booleana, impede criar conta de serviço no escopo.\n- `constraints/compute.trustedImageProjects`: de lista, define de quais projetos é permitido usar imagens.\n\nNote o padrão de leitura do enunciado: quando a questão diz "impedir que qualquer pessoa, inclusive administradores, faça X", a resposta é política da organização. Quando diz "permitir que só o time Y faça X", a resposta é IAM.',
                },
            ],
            questions: [
                {
                    statement:
                        "Um administrador precisa garantir que nenhuma VM do projeto receba IP externo, nem quando criada por quem tem papel de administrador do Compute Engine. O que resolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Política da organização com a restrição de acesso a IP externo",
                            isCorrect: true,
                        },
                        {
                            text: "Papel personalizado do IAM sem a permissão de criar instância de VM",
                            isCorrect: false,
                        },
                        {
                            text: "Regra de firewall negando entrada nas portas de administração",
                            isCorrect: false,
                        },
                        {
                            text: "Cota de endereços IP externos do projeto ajustada para zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual frase descreve corretamente a divisão de responsabilidade entre o IAM e a política da organização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O IAM define quem pode agir e a política define o que pode ser configurado",
                            isCorrect: true,
                        },
                        {
                            text: "O IAM define o que pode ser configurado e a política define quem pode agir",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois definem quem pode agir, mas a política vale só na organização",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois definem o que pode ser configurado, e o IAM vence em conflito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma política da organização foi aplicada na pasta de produção. Qual comando mostra o que está realmente valendo em um projeto dentro dessa pasta, já com a herança calculada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "gcloud org-policies describe gcp.resourceLocations --effective --project=p1",
                            isCorrect: true,
                        },
                        {
                            text: "gcloud org-policies describe gcp.resourceLocations --organization=1234567890",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud projects get-iam-policy p1 --format=yaml --flatten=bindings",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud org-policies list --folder=456789012345 --format=json",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time de segurança precisa impedir a criação de recursos fora das regiões do Brasil em toda a organização. Qual restrição usar, e de que tipo ela é?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A gcp.resourceLocations, que é uma restrição de lista com valores",
                            isCorrect: true,
                        },
                        {
                            text: "A gcp.resourceLocations, que é uma restrição booleana de projeto",
                            isCorrect: false,
                        },
                        {
                            text: "A compute.vmExternalIpAccess, que é uma restrição de lista de rede",
                            isCorrect: false,
                        },
                        {
                            text: "A compute.disableSerialPortAccess, que é uma restrição booleana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o efeito de definir `inheritFromParent: false` em uma política de lista aplicada em uma pasta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A política da pasta vale sozinha e ignora a herdada da organização",
                            isCorrect: true,
                        },
                        {
                            text: "A política da pasta se soma à da organização, unindo os valores",
                            isCorrect: false,
                        },
                        {
                            text: "A política da pasta é descartada e só a da organização continua valendo",
                            isCorrect: false,
                        },
                        {
                            text: "A política da pasta passa a valer em modo de simulação, sem bloquear",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Console, Cloud Shell e gcloud",
            blocks: [
                {
                    type: "text",
                    value: "Existem três maneiras de operar o Google Cloud, e a prova espera que você saiba escolher entre elas: o **console** no navegador, a **CLI gcloud** instalada na sua máquina e o **Cloud Shell**, um terminal pronto dentro do navegador. Há ainda as bibliotecas de cliente e a API REST, para quando a operação vira código de aplicação.\n\nA escolha não é questão de gosto. O console é bom para descobrir e inspecionar; a linha de comando é o que você repete, versiona e automatiza. E o Cloud Shell existe exatamente para os casos em que instalar e autenticar a CLI local é o problema.",
                },
                {
                    type: "table",
                    value: '[["Ferramenta", "Quando ela é a resposta", "Onde ela limita"], ["Console", "Explorar serviço novo, ver gráfico, aprovar", "Não se versiona nem se repete"], ["gcloud local", "Script, automação, trabalho diário do time", "Precisa instalar e autenticar"], ["Cloud Shell", "Máquina alheia, acesso rápido, nada a instalar", "Sessão temporária, com cota semanal"], ["Bibliotecas e API", "Operação feita pela própria aplicação", "Mais código para manter"]]',
                },
                {
                    type: "text",
                    value: "## gcloud init: o comando que prepara tudo\n\nO `gcloud init` é a configuração interativa inicial. Pela documentação, ele faz três coisas: autoriza a CLI a acessar o Google Cloud com as credenciais da sua conta, cria ou seleciona uma configuração e define propriedades nessa configuração, incluindo o projeto atual e, opcionalmente, a região e a zona padrão do Compute Engine.\n\nDois detalhes que aparecem em questão:\n\n- As propriedades definidas pelo `gcloud init` são **locais e persistentes**, e não são afetadas por mudanças remotas no projeto.\n- Em máquina sem navegador, use `gcloud init --no-launch-browser`: ele mostra uma URL para abrir em outro lugar e pede o código de verificação de volta.\n\nSe você só precisa trocar de conta, `gcloud auth login` resolve. O `gcloud init` é para montar ou refazer a configuração inteira.",
                },
                {
                    type: "code",
                    value: "gcloud init\ngcloud init --no-launch-browser\ngcloud auth login\ngcloud auth list",
                },
                {
                    type: "text",
                    value: "## As propriedades moram em uma configuração\n\nUma configuração é um conjunto nomeado de propriedades da CLI, pares de chave e valor organizados em seções. A CLI já começa com uma única configuração chamada `default`.\n\nO `gcloud config set` grava uma propriedade na configuração ativa, com a sintaxe `gcloud config set SECAO/PROPRIEDADE VALOR`. A seção pode ser omitida para propriedades da seção `core`, então `project` e `core/project` são equivalentes. Para as outras seções o nome é obrigatório, como em `compute/region`.\n\nPor padrão a gravação vale só na configuração ativa. Com a flag `--installation`, a propriedade passa a valer para a instalação inteira da CLI.",
                },
                {
                    type: "code",
                    value: "gcloud config set project ensinadev-prod-001\ngcloud config set compute/region southamerica-east1\ngcloud config set compute/zone southamerica-east1-a\ngcloud config list\ngcloud config get compute/zone",
                },
                {
                    type: "text",
                    value: "## Configurações nomeadas: vários ambientes sem confusão\n\nQuem opera mais de um ambiente precisa alternar conta, projeto e região sem ficar redigitando `gcloud config set` a cada troca. É para isso que existem as configurações nomeadas.\n\nApenas uma configuração fica ativa por vez, e há três formas de escolher qual:\n\n- `gcloud config configurations activate NOME` troca a ativa de forma permanente.\n- A variável de ambiente `CLOUDSDK_ACTIVE_CONFIG_NAME` troca a ativa só naquele terminal, o que é perfeito para manter uma aba por ambiente.\n- A flag `--configuration=NOME` troca só para aquele comando.\n\nO erro que isso previne é o mais caro de todos: rodar em produção o comando que você achava que estava rodando em desenvolvimento.",
                },
                {
                    type: "code",
                    value: "gcloud config configurations create producao\ngcloud config configurations list\ngcloud config configurations activate producao\ngcloud config configurations describe producao\nexport CLOUDSDK_ACTIVE_CONFIG_NAME=desenvolvimento\ngcloud projects list --configuration=producao",
                },
                {
                    type: "text",
                    value: "## Cloud Shell: o que é e onde ele acaba\n\nO Cloud Shell provisiona uma máquina virtual do Compute Engine com Linux baseado em Debian para uso temporário, já com a CLI gcloud, Docker, Git, Python, editores e ferramentas de build instaladas. Você abre pelo console e não instala nada.\n\nOs limites importam porque entram em questão:\n\n- **5 GB de disco persistente** montados como `$HOME`. O que fica fora do `$HOME` desaparece quando a VM é descartada.\n- A sessão termina **depois de uma hora de inatividade**, e a VM é descartada.\n- Cada sessão tem o teto de **12 horas**, mesmo em uso contínuo.\n- A cota semanal padrão é de **50 horas**. Ao estourar, você espera a data informada ou migra para o Cloud Workstations.\n- Se você não acessar o Cloud Shell por **120 dias**, o `$HOME` é apagado e os arquivos não podem ser recuperados.\n\nPor isso o Cloud Shell é ótimo para tarefa pontual, estudo e emergência, e ruim como estação de trabalho permanente.",
                },
                {
                    type: "quote",
                    value: "No Cloud Shell, só o diretório inicial de 5 GB persiste; todo o resto da máquina é descartável.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você precisa rodar comandos da CLI gcloud em um computador emprestado, sem permissão para instalar programas. Qual é o caminho mais direto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Abrir o Cloud Shell pelo console, que já vem com a CLI",
                            isCorrect: true,
                        },
                        {
                            text: "Instalar a CLI gcloud dentro da pasta pessoal do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Usar a API REST pelo navegador com um token colado na URL",
                            isCorrect: false,
                        },
                        {
                            text: "Criar uma VM no Compute Engine e acessar a máquina por SSH",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual comando define a região padrão do Compute Engine na configuração ativa da CLI gcloud?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "gcloud config set compute/region southamerica-east1",
                            isCorrect: true,
                        },
                        {
                            text: "gcloud config set region southamerica-east1 --global",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud compute regions set-default southamerica-east1",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud init set compute/region southamerica-east1",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um engenheiro mantém um projeto de desenvolvimento e um de produção e quer alternar conta, projeto e região de uma vez, sem redigitar propriedades. O que a CLI oferece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Configurações nomeadas da CLI, com uma ativa por vez",
                            isCorrect: true,
                        },
                        {
                            text: "Um arquivo de credenciais por projeto na pasta do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Perfis de faturamento associados a cada projeto da conta",
                            isCorrect: false,
                        },
                        {
                            text: "Uma aba separada do Cloud Shell para cada ambiente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como usar uma configuração nomeada diferente apenas no terminal em que você está, sem alterar a configuração ativa das outras abas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Definindo a variável de ambiente CLOUDSDK_ACTIVE_CONFIG_NAME",
                            isCorrect: true,
                        },
                        {
                            text: "Rodando gcloud config configurations activate com o nome dela",
                            isCorrect: false,
                        },
                        {
                            text: "Rodando gcloud init e escolhendo a configuração já existente",
                            isCorrect: false,
                        },
                        {
                            text: "Editando o arquivo de propriedades da configuração default",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um script roda no Cloud Shell e grava arquivos em `/var/tmp`. A sessão termina por inatividade e você volta horas depois. O que aconteceu com os arquivos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Foram perdidos, porque só o diretório inicial tem disco persistente",
                            isCorrect: true,
                        },
                        {
                            text: "Continuam lá, porque a mesma VM do Cloud Shell é reconectada",
                            isCorrect: false,
                        },
                        {
                            text: "Continuam lá, porque /var/tmp é sincronizado com um bucket",
                            isCorrect: false,
                        },
                        {
                            text: "Foram movidos para o diretório inicial quando a sessão terminou sozinha",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "APIs, cotas e limites",
            blocks: [
                {
                    type: "text",
                    value: 'Dois mecanismos param a sua primeira chamada em um projeto novo, e a prova cobra os dois: a **API desabilitada** e a **cota estourada**. Nenhum dos dois tem a ver com permissão, e é aí que o candidato se perde. Você pode ser proprietário do projeto e ainda assim receber erro porque a API nunca foi habilitada ali, ou porque aquela região já atingiu o limite de vCPUs.\n\nEntender a diferença entre esses dois mecanismos, e entre cota e limite do sistema, é o que separa "o IAM está errado" de "falta habilitar a API" em uma questão de resolução de problema.',
                },
                {
                    type: "text",
                    value: "## A API é habilitada por projeto, não por conta\n\nQuase nada vem ligado em um projeto novo. Cada serviço do Google Cloud é uma API que precisa ser habilitada **naquele projeto** antes do primeiro uso. Habilitar o Compute Engine no projeto de desenvolvimento não habilita no projeto de produção.\n\nNo console o caminho é APIs e serviços, biblioteca de APIs: selecione o projeto, encontre a API e clique em habilitar. Na CLI é o `gcloud services enable`, que aceita mais de um serviço na mesma chamada.\n\nA permissão vem do papel **Administrador do Service Usage**, `roles/serviceusage.serviceUsageAdmin`. E há um detalhe recursivo que vale guardar: a própria Service Usage API vem habilitada por padrão nos projetos, mas se alguém a desabilitar no projeto que faz a requisição, as chamadas para habilitar serviços passam a falhar, e aí só o console ou a CLI reabilitam.",
                },
                {
                    type: "code",
                    value: "gcloud services list --enabled\ngcloud services list --available --project=ensinadev-prod-001\ngcloud services enable compute.googleapis.com\ngcloud services enable run.googleapis.com artifactregistry.googleapis.com\ngcloud services disable bigquery.googleapis.com",
                },
                {
                    type: "text",
                    value: '## O erro que todo mundo encontra uma vez\n\nQuando a API não está habilitada, a chamada não volta com erro de cota nem de autenticação: volta com **403 PERMISSION_DENIED** e motivo `SERVICE_DISABLED`, em uma mensagem que diz que a API não foi usada no projeto antes ou está desabilitada, seguida de um link para habilitá-la.\n\nIsso engana porque a palavra que aparece é "permissão". Em questão de resolução de problema, se a mensagem traz `SERVICE_DISABLED` ou o texto sobre a API nunca ter sido usada naquele projeto, a resposta é habilitar a API no projeto, e não mexer em papel do IAM.\n\nMais um detalhe prático: depois de habilitar, a mudança leva alguns minutos para se propagar. Se o erro insistir logo em seguida, espere e tente de novo antes de sair procurando outra causa.',
                },
                {
                    type: "table",
                    value: '[["Tipo de cota", "O que ela limita", "Exemplo", "Como se recupera"], ["De alocação", "Quanto de um recurso é alocado para você", "Número de VMs ou de vCPUs", "Apagando recursos ou pedindo aumento"], ["De taxa", "A velocidade de consumo em uma janela", "Requisições por minuto na API", "Sozinha, quando a janela vira"], ["Concorrente", "Quantas operações rodam ao mesmo tempo", "Jobs longos simultâneos", "Quando as operações terminam"]]',
                },
                {
                    type: "text",
                    value: "## O escopo da cota: projeto, região, zona e organização\n\nCota não é um número só. A mesma cota pode ser contada em escopos diferentes, e isso explica o erro que parece absurdo: tenho cota sobrando e a criação falhou.\n\nO caso canônico é o Compute Engine. A cota de CPU é o total de vCPUs de todas as suas VMs **em uma região**, contada região por região. A cota de instâncias de VM também é regional, e conta a VM mesmo parada. Além disso, algumas contas e projetos novos têm a cota global de **CPUs (todas as regiões)**, que soma os vCPUs de todas as regiões. Já cotas de rede, como o IP global para balanceador de carga, são globais.\n\nCotas também podem ser definidas em escopo de pasta e de organização, valendo para os projetos abaixo. Então a leitura correta de uma falha de cota tem três perguntas: qual cota, em qual projeto e em qual região ou zona.",
                },
                {
                    type: "code",
                    value: "gcloud quotas info list --service=compute.googleapis.com --project=ensinadev-prod-001\ngcloud compute project-info describe --project=ensinadev-prod-001\ngcloud compute regions describe southamerica-east1",
                },
                {
                    type: "text",
                    value: "## Cota e limite do sistema não são a mesma coisa\n\nAntes de pedir aumento, confirme que o número é cota. Muitos serviços também têm **limites do sistema**, que são restrições fixas e **não podem ser aumentadas nem reduzidas**. Pedir aumento de limite do sistema é tempo perdido, e a prova usa isso como distrator.\n\nSendo cota, o caminho no console é IAM e administrador, página de cotas e limites do sistema: marque a cota, clique em editar, informe o novo valor e envie a solicitação. O pedido passa por avaliação, boa parte dela automática, com critérios como disponibilidade de recursos e tempo de uso do Google Cloud. Você recebe um email confirmando o recebimento e, depois da análise, outro dizendo se foi aprovado.\n\nO mesmo pedido pode ser feito pela CLI, criando uma **preferência de cota**. E existe o **ajustador de cota**, que monitora o uso e envia as solicitações de aumento no seu lugar.",
                },
                {
                    type: "code",
                    value: "gcloud quotas preferences create --service=compute.googleapis.com --project=ensinadev-prod-001 --quota-id=CPUS-per-project-region --preferred-value=200 --dimensions=region=southamerica-east1 --preference-id=cpus-sao-paulo\ngcloud quotas preferences list --project=ensinadev-prod-001",
                },
                {
                    type: "quote",
                    value: "Cota sobe com pedido aprovado; limite do sistema é fixo e não se negocia.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um projeto novo devolve `403 PERMISSION_DENIED` com motivo `SERVICE_DISABLED` ao chamar a API do Compute Engine. O que resolve o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Habilitar a API do Compute Engine naquele projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Conceder o papel de proprietário ao autor da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir aumento da cota de vCPUs na região de destino",
                            isCorrect: false,
                        },
                        {
                            text: "Criar uma conta de serviço nova e gerar uma chave",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual comando lista as APIs que já estão habilitadas no projeto ativo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "gcloud services list --enabled",
                            isCorrect: true,
                        },
                        {
                            text: "gcloud services list --available",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud services enable --list",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud projects describe --services",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A criação de VMs em `southamerica-east1` falhou por cota, mas o time garante que o projeto tem vCPUs sobrando. Qual é a explicação mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A cota de CPU do Compute Engine é contada em cada região separadamente",
                            isCorrect: true,
                        },
                        {
                            text: "A cota de CPU do Compute Engine é contada por projeto, somando as regiões",
                            isCorrect: false,
                        },
                        {
                            text: "A cota de CPU do Compute Engine é contada apenas por zona",
                            isCorrect: false,
                        },
                        {
                            text: "A cota de CPU do Compute Engine se renova a cada minuto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual alternativa descreve corretamente a diferença entre cota de alocação e cota de taxa no Google Cloud?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Alocação limita quanto você tem, e taxa limita a velocidade de consumo",
                            isCorrect: true,
                        },
                        {
                            text: "Alocação limita a velocidade de consumo, e taxa limita quanto você tem",
                            isCorrect: false,
                        },
                        {
                            text: "Alocação e taxa limitam a mesma coisa, mudando apenas o nome por serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Alocação vale somente por região, e taxa vale somente por organização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe precisa de mais vCPUs em uma região e já confirmou que esse número é uma cota ajustável. Qual é o caminho correto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pedir aumento na página de cotas e limites do sistema do console",
                            isCorrect: true,
                        },
                        {
                            text: "Criar outro projeto na mesma região para somar as duas cotas",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir um caso de suporte pedindo mudança no limite do sistema fixo",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a região padrão da CLI e repetir a criação das instâncias",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Faturamento e controle de custos",
    aulas: [
        {
            titulo: "Contas de faturamento e vínculo com projetos",
            blocks: [
                {
                    type: "text",
                    value: "A primeira pergunta de um projeto novo no Google Cloud não é técnica: quem paga a conta? A resposta mora em um recurso separado, a **conta de faturamento** (Cloud Billing account). É nela que ficam a forma de pagamento, o perfil de pagamentos e o histórico de faturas, e um projeto só consegue usar serviços cobrados enquanto estiver vinculado a uma conta de faturamento ativa.\n\nO detalhe que a prova explora é a posição dela no desenho. Organização, pasta e projeto formam a hierarquia de recursos, e permissão escorre de cima para baixo nessa árvore. A conta de faturamento fica **fora dessa árvore**, com política de IAM própria. Ser `roles/owner` em um projeto não dá nenhum poder sobre a conta que paga por ele, e administrar a conta de faturamento não dá acesso a nenhum recurso dentro dos projetos.",
                },
                {
                    type: "text",
                    value: "## Uma conta ou várias?\n\nNada obriga a organização a ter uma conta de faturamento só, e o guia do exame fala em criar **uma ou mais**. O desenho comum é uma conta por unidade que precisa de fatura separada: uma para produção, uma para laboratório, uma por cliente de quem revende. Cada conta tem a própria moeda, o próprio ciclo de fatura e o próprio IAM.\n\nExistem dois tipos. A conta de **autoatendimento** (self-serve) você mesmo cria no console e paga com cartão ou débito automático. A conta **faturada** (invoiced) recebe fatura mensal, exige análise de crédito e precisa ser configurada pelo Google, então ela não aparece como opção de autocriação.\n\nHá ainda a **subconta de faturamento**, usada por revendedores: o gasto dos projetos é separado em uma subconta para efeito de relatório, mas a cobrança continua saindo na conta pai.",
                },
                {
                    type: "table",
                    value: '[["Tipo de conta","Quem cria","Como paga","Uso típico"],["Autoatendimento","Você mesmo, no console","Cartão ou débito automático","Equipe pequena, laboratório, prova de conceito"],["Faturada","Google, depois de análise","Fatura mensal","Empresa com processo de contas a pagar"],["Subconta","Revendedor, sob uma conta pai","A conta pai é cobrada","Separar gasto por cliente ou unidade"]]',
                },
                {
                    type: "text",
                    value: "## Os papéis de faturamento\n\nComo a conta de faturamento tem IAM próprio, existem papéis predefinidos só dela. Os que aparecem em prova:\n\n- **Criador de conta de faturamento** (`roles/billing.creator`), concedido na organização, permite criar contas de autoatendimento novas.\n- **Administrador de conta de faturamento** (`roles/billing.admin`) é o dono da conta: troca forma de pagamento, configura exportação, vê custo, vincula e desvincula projetos e concede papéis a outras pessoas.\n- **Usuário de conta de faturamento** (`roles/billing.user`) é um papel de alcance curto, com um objetivo só: deixar a pessoa **associar projetos** àquela conta.\n- **Leitor de conta de faturamento** (`roles/billing.viewer`) apenas lê custo e transações.\n- **Gerente de custos** (`roles/billing.costsManager`) cria, edita e apaga orçamentos e cuida da exportação de dados de custo, sem poder mexer em forma de pagamento.\n\nFalta um nome nessa lista, e ele é concedido do outro lado: o **gerente de faturamento do projeto** (`roles/billing.projectManager`) vai no projeto, na pasta ou na organização, não na conta de faturamento. Ele permite trocar a conta que paga aquele projeto.",
                },
                {
                    type: "table",
                    value: '[["Papel","Onde é concedido","Para que serve"],["roles/billing.creator","Organização","Criar conta de faturamento de autoatendimento"],["roles/billing.admin","Conta de faturamento","Administrar a conta inteira, inclusive papéis"],["roles/billing.user","Conta de faturamento","Vincular projetos àquela conta"],["roles/billing.viewer","Conta de faturamento","Ver custo e transações"],["roles/billing.costsManager","Conta de faturamento","Cuidar de orçamentos e da exportação de custo"],["roles/billing.projectManager","Projeto, pasta ou organização","Trocar a conta que paga o projeto"]]',
                },
                {
                    type: "text",
                    value: "## Quem consegue criar um projeto que já nasce pagando\n\nEsse é o cenário clássico de questão, e ele mistura as duas pontas de propósito. Criar o projeto é permissão da hierarquia (`roles/resourcemanager.projectCreator`); vincular o projeto a uma conta é permissão da conta de faturamento (`roles/billing.user`). Por isso a pessoa precisa dos **dois papéis**, concedidos em recursos diferentes.\n\nQuem recebe só criador de projetos consegue criar o projeto, mas ele nasce sem faturamento e quase nada funciona ali dentro. Quem recebe só usuário de conta de faturamento não consegue nem criar o projeto. E quando o projeto já existe, mudar a conta que paga por ele exige permissão nos dois lados: gerente de faturamento no projeto de origem e usuário da conta de faturamento no destino.",
                },
                {
                    type: "code",
                    value: "gcloud billing accounts list\n\ngcloud billing projects link meu-projeto \\\n  --billing-account=0X0X0X-0X0X0X-0X0X0X\n\ngcloud billing projects describe meu-projeto\n\ngcloud billing projects unlink meu-projeto",
                },
                {
                    type: "text",
                    value: "## Desvincular é mais sério do que parece\n\nTirar o faturamento de um projeto é a forma bruta de parar o gasto, e ela funciona: os serviços do Google Cloud naquele projeto param. O preço é alto. A documentação avisa que recursos podem ser removidos sem possibilidade de recuperação, e que religar o faturamento depois exige configuração manual, sem garantia de que o serviço volte como estava. Faça backup antes.\n\nFechar a conta de faturamento tem o mesmo efeito em todos os projetos vinculados de uma vez. E note a assimetria: conta de faturamento não se apaga manualmente, apenas se fecha, porque o histórico fica guardado para relatório e auditoria.",
                },
                {
                    type: "quote",
                    value: "A conta de faturamento não é pai do projeto no IAM: para unir os dois, a pessoa precisa de papel nas duas pontas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma pessoa recebeu apenas o papel de criador de projetos na organização, sem nenhum papel em conta de faturamento. O que ela consegue fazer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Criar projetos, que nascem sem conta de faturamento vinculada",
                            isCorrect: true,
                        },
                        {
                            text: "Criar projetos já vinculados à conta de faturamento da organização",
                            isCorrect: false,
                        },
                        {
                            text: "Vincular projetos existentes a uma conta, sem criar projetos novos",
                            isCorrect: false,
                        },
                        {
                            text: "Nada, porque criar projeto exige papel em conta de faturamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o papel de menor alcance, do lado da conta de faturamento, que permite a uma pessoa associar um projeto a uma conta que já existe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usuário de conta de faturamento (roles/billing.user)",
                            isCorrect: true,
                        },
                        {
                            text: "Administrador de conta de faturamento (roles/billing.admin)",
                            isCorrect: false,
                        },
                        {
                            text: "Leitor de conta de faturamento (roles/billing.viewer)",
                            isCorrect: false,
                        },
                        {
                            text: "Criador de conta de faturamento (roles/billing.creator)",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na sua organização, o time de finanças precisa poder abrir contas de faturamento de autoatendimento novas. Qual papel conceder, e em qual recurso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Criador de conta de faturamento, concedido na organização",
                            isCorrect: true,
                        },
                        {
                            text: "Administrador de conta de faturamento, concedido na organização",
                            isCorrect: false,
                        },
                        {
                            text: "Administrador de conta de faturamento, concedido em cada projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Gerente de faturamento do projeto, concedido na pasta raiz",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um administrador quer mover o projeto app-prod da conta de faturamento do laboratório para a conta de produção. Do que ele precisa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Gerente de faturamento do projeto em app-prod e usuário da conta de produção",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas administrador da conta de faturamento do laboratório, que é a origem",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o papel de proprietário em app-prod, que já engloba o faturamento todo",
                            isCorrect: false,
                        },
                        {
                            text: "Gerente de faturamento do projeto em app-prod e leitor da conta de produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação sobre a conta de faturamento e a hierarquia de recursos está correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela fica fora da hierarquia e tem política de IAM própria",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é pai dos projetos vinculados e propaga papéis para eles",
                            isCorrect: false,
                        },
                        {
                            text: "Ela aparece como recurso filho dentro de cada projeto pago",
                            isCorrect: false,
                        },
                        {
                            text: "Ela fica dentro da pasta onde o primeiro projeto foi criado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Orçamentos e alertas de faturamento",
            blocks: [
                {
                    type: "text",
                    value: "Gasto em nuvem cresce calado. Uma VM esquecida ligada no fim de semana, uma consulta que varreu a tabela inteira no BigQuery, um bucket que ninguém mandou para a classe fria: no fechamento do mês a fatura conta a história toda de uma vez. O **orçamento** (budget) do Cloud Billing existe para a história chegar antes da fatura.\n\nAntes de qualquer detalhe, grave a limitação que a prova adora: o orçamento é um termômetro, não uma torneira. Ele dispara alerta quando o gasto cruza uma porcentagem que você escolheu, e para aí. Nenhum recurso é desligado, nenhuma API é bloqueada, nenhuma cobrança deixa de acontecer.",
                },
                {
                    type: "text",
                    value: "## As três decisões de um orçamento\n\n**Escopo.** O orçamento pode cobrir a conta de faturamento inteira ou só um pedaço dela: projetos escolhidos, pastas, organizações, serviços específicos (Compute Engine, BigQuery) e até recursos que carreguem um rótulo. Também se escolhe incluir ou excluir crédito e desconto do cálculo, o que muda bastante o número em quem tem compromisso de uso.\n\n**Valor.** Pode ser um valor fixo que você digita ou o **gasto do período anterior**, que se ajusta sozinho a cada período novo. A segunda opção serve a quem quer ser avisado de variação, não de volume absoluto.\n\n**Regras de limite.** Cada regra é uma porcentagem do valor do orçamento. Por padrão nascem três, em 50 por cento, 90 por cento e 100 por cento, e você pode mudar, apagar e acrescentar. Cada regra escolhe a base: **custo real**, o que já foi gasto no período, ou **custo previsto**, a projeção para o fim do período. A previsão é a que avisa com antecedência, e ela não existe em orçamento com intervalo de datas personalizado.",
                },
                {
                    type: "table",
                    value: '[["Decisão","Opções","Efeito prático"],["Escopo","Conta inteira, projetos, pastas, serviços, rótulos","Define o que entra na soma"],["Valor","Valor fixo ou gasto do período anterior","Alvo estável ou alvo que se ajusta"],["Base da regra","Custo real ou custo previsto","Avisa depois do fato ou antes dele"],["Descontos","Incluir ou excluir crédito e desconto","Muda quanto a conta parece gastar"]]',
                },
                {
                    type: "text",
                    value: "## Quem recebe o aviso\n\nPor padrão o email do alerta vai para quem tem **administrador de conta de faturamento** e **usuário de conta de faturamento** naquela conta. Isso costuma ser pouco e demais ao mesmo tempo: pouco porque o time que causou o gasto não está na lista, demais porque alguém de finanças recebe alerta de laboratório.\n\nExistem três saídas. Apontar o alerta para **canais de notificação do Cloud Monitoring**, e aí ele vai para um grupo, um webhook ou o plantão. Marcar a opção de avisar os proprietários do projeto, que só vale em orçamento com escopo de um projeto. E a mais poderosa: publicar o alerta em um tópico do **Pub/Sub** e tratar a mensagem em código.\n\nUma diferença sutil entre os dois canais vale guardar. O email sai quando um limite é cruzado. A mensagem do Pub/Sub é publicada **várias vezes por dia** com o estado atual do orçamento, tenha cruzado limite ou não, e o campo que diz qual limite foi estourado pode vir vazio.",
                },
                {
                    type: "code",
                    value: 'gcloud billing budgets create \\\n  --billing-account=0X0X0X-0X0X0X-0X0X0X \\\n  --display-name="orcamento-laboratorio" \\\n  --budget-amount=500USD \\\n  --filter-projects=projects/lab-dados \\\n  --threshold-rule=percent=0.5 \\\n  --threshold-rule=percent=0.9 \\\n  --threshold-rule=percent=1.0,basis=forecasted-spend \\\n  --notifications-rule-pubsub-topic=projects/lab-dados/topics/alerta-orcamento',
                },
                {
                    type: "quote",
                    value: "Orçamento avisa, não corta. Quem precisa de corte precisa de automação em cima do alerta.",
                },
                {
                    type: "text",
                    value: "## Como interromper o gasto de verdade\n\nQuando o requisito é parar o gasto, e não só saber dele, o orçamento vira o gatilho de uma automação. O desenho que a documentação ensina tem três peças: o orçamento publica a mensagem em um tópico do **Pub/Sub**, uma **função do Cloud Run** inscrita naquele tópico recebe a mensagem, e o código decide o que fazer.\n\nA versão cirúrgica desliga só o que dá para desligar: para instâncias do Compute Engine, reduz réplicas, suspende um job agendado. O projeto continua vivo e o resto do ambiente não sente nada.\n\nA versão radical chama a API Cloud Billing e grava uma conta de faturamento vazia no projeto, ou seja, desvincula o faturamento. É o disjuntor geral. Para isso a conta de serviço da função precisa de **administrador de conta de faturamento** na conta, e vale reler o aviso: todos os recursos do projeto param e podem ser apagados sem volta.",
                },
                {
                    type: "code",
                    value: 'gcloud pubsub topics create alerta-orcamento\n\ngcloud run deploy corta-faturamento \\\n  --source=. \\\n  --function=cortaFaturamento \\\n  --region=southamerica-east1\n\ngcloud eventarc triggers create gatilho-orcamento \\\n  --location=southamerica-east1 \\\n  --destination-run-service=corta-faturamento \\\n  --destination-run-region=southamerica-east1 \\\n  --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \\\n  --transport-topic=alerta-orcamento',
                },
                {
                    type: "text",
                    value: "## O atraso que a automação não resolve\n\nExiste um intervalo entre consumir o serviço e o Cloud Billing processar aquele consumo, então o alerta sempre chega depois do fato. A documentação é explícita: mesmo com a automação cortando o faturamento, ainda pode entrar custo de uso que não havia sido contabilizado quando a função rodou. Automação de orçamento reduz prejuízo, não zera.\n\nHá também o **orçamento com limite de gasto** (spend cap), em pré-lançamento, que pausa o uso de um serviço elegível quando o gasto passa de 100 por cento do valor, sem apagar dado nem recurso. Ele é bem mais restrito do que a automação: um projeto, um serviço elegível por vez, período mensal. Em prova, a resposta esperada para parar gasto continua sendo desvincular o faturamento ou automatizar com Pub/Sub e função.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um orçamento foi criado com regra de alerta em 100 por cento. O gasto do mês passou desse valor. O que acontece com os recursos do projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nada de automático: o alerta é enviado e tudo continua rodando",
                            isCorrect: true,
                        },
                        {
                            text: "Os recursos do projeto são pausados até o mês seguinte começar",
                            isCorrect: false,
                        },
                        {
                            text: "As APIs do projeto passam a recusar chamadas novas de imediato",
                            isCorrect: false,
                        },
                        {
                            text: "O faturamento do projeto é desvinculado de forma automática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer ser avisado quando o gasto só com BigQuery no projeto lab-dados passar de um valor. Como configurar o orçamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com escopo filtrado pelo projeto lab-dados e pelo serviço BigQuery",
                            isCorrect: true,
                        },
                        {
                            text: "Com escopo na conta de faturamento inteira e alerta em 50 por cento",
                            isCorrect: false,
                        },
                        {
                            text: "Com escopo em uma cota de consulta do BigQuery dentro do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Com escopo filtrado por uma tag de rede aplicada em lab-dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre uma regra de limite baseada em custo real e uma baseada em custo previsto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A real dispara com o gasto acumulado, a prevista com a projeção do mês",
                            isCorrect: true,
                        },
                        {
                            text: "A real dispara no fim do mês, a prevista dispara no primeiro dia do mês",
                            isCorrect: false,
                        },
                        {
                            text: "A real usa o valor da fatura fechada, a prevista usa o período anterior",
                            isCorrect: false,
                        },
                        {
                            text: "A real cobre a conta inteira, a prevista cobre apenas um projeto por vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O requisito é que o gasto de um projeto de laboratório pare sozinho ao estourar o orçamento. Qual desenho atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Orçamento publicando em um tópico do Pub/Sub e função que desvincula o faturamento",
                            isCorrect: true,
                        },
                        {
                            text: "Orçamento com alerta em 100 por cento enviado por email aos administradores da conta",
                            isCorrect: false,
                        },
                        {
                            text: "Orçamento com valor igual ao gasto do período anterior e alerta por custo previsto",
                            isCorrect: false,
                        },
                        {
                            text: "Orçamento com escopo no projeto mais exportação do faturamento para o BigQuery",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Mesmo com a automação que desvincula o faturamento ao estourar o orçamento, por que ainda pode aparecer custo depois do corte?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Porque existe atraso entre o uso e o processamento do gasto pelo Cloud Billing",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o orçamento considera o gasto do período anterior, nunca o do atual",
                            isCorrect: false,
                        },
                        {
                            text: "Porque desvincular o faturamento não interrompe os recursos já criados antes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a função do Cloud Run segue cobrando por invocação durante o mês inteiro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Exportação do faturamento e análise no BigQuery",
            blocks: [
                {
                    type: "text",
                    value: 'Os relatórios do console respondem rápido a "quanto gastamos" e "em quê". Eles não respondem a "qual dos nossos duzentos buckets puxou a conta de armazenamento em setembro" nem a "qual time estourou o custo por requisição". Para pergunta assim o dado precisa estar em uma tabela, com SQL em cima, e é isso que a **exportação do faturamento para o BigQuery** entrega.\n\nO guia do exame pede para configurar essa exportação, e o que se cobra é a sequência: escolher o projeto que vai abrigar o dataset, criar o dataset no local certo, ter o papel certo na conta de faturamento e ligar cada tipo de exportação separadamente.',
                },
                {
                    type: "table",
                    value: '[["Pergunta","Relatório no console","Exportação para o BigQuery"],["Quanto gastei por serviço neste mês","Resolve, em dois cliques","Resolve, escrevendo SQL"],["Quanto custou cada recurso individual","Não desce do SKU","Resolve, com a exportação detalhada"],["Cruzar custo com dado meu de negócio","Não faz","Faz, com join em outra tabela"],["Histórico de antes de configurar","Tem, desde 2017","Depende do local do dataset"],["Quanto custa usar","Já incluído","Paga armazenamento e consulta no BigQuery"]]',
                },
                {
                    type: "text",
                    value: "## Os tipos de exportação\n\nCada tipo vira uma tabela própria e é habilitado separadamente.\n\n- **Custo de uso padrão** (`gcp_billing_export_v1_<ID_DA_CONTA>`): conta, data da fatura, serviço, SKU, projeto, rótulo, local, custo, uso, crédito, ajuste e moeda. Dá conta de quase toda análise de tendência.\n- **Custo de uso detalhado** (`gcp_billing_export_resource_v1_<ID_DA_CONTA>`): tudo do padrão mais o **nível de recurso**, isto é, a VM, o disco ou o bucket que gerou aquela linha. É a tabela que acha o culpado, e também a mais larga, então consultar nela custa mais.\n- **Preços** (`cloud_pricing_export`): a tabela de preços da sua conta, com serviço, SKU, unidade, moeda e faixas. Serve para simular cenário sem abrir a página de preços.\n\nHá duas exportações mais novas em pré-lançamento, boas de conhecer sem virar resposta de prova: a de custo no padrão **FOCUS**, que normaliza nomes de coluna entre nuvens diferentes, e a de metadados de compromisso de uso.",
                },
                {
                    type: "text",
                    value: "## Como ligar a exportação\n\n1. Escolha ou crie um projeto para abrigar os dados. Ele precisa estar vinculado à mesma conta de faturamento cujos dados vão sair.\n2. Habilite a **API do BigQuery** nesse projeto. Só para a exportação de preços habilite também a API do **BigQuery Data Transfer Service**.\n3. Crie o dataset. Prefira um local **multirregional** (`US` ou `EU`), e decida com calma, porque o local de um dataset não muda depois de criado.\n4. Em Faturamento, na página de exportação de faturamento, aponte cada tipo de exportação para o projeto e o dataset.\n\nDo lado da permissão, quem configura a exportação de custo de uso precisa de **gerente de custos** ou **administrador** na conta de faturamento, mais **usuário do BigQuery** no projeto que recebe. Para a exportação de preços a exigência sobe: administrador na conta de faturamento e administrador do BigQuery no projeto.",
                },
                {
                    type: "code",
                    value: "gcloud services enable bigquery.googleapis.com --project=lab-faturamento\n\nbq --location=US mk --dataset lab-faturamento:faturamento\n\nbq ls lab-faturamento:faturamento",
                },
                {
                    type: "text",
                    value: "## Retroatividade depende do local do dataset\n\nAqui mora a sutileza que vira questão. Se o dataset está em uma multirregião (`US` ou `EU`), o Google preenche a tabela **retroativamente desde o começo do mês anterior**: ligar a exportação em 23 de setembro traz dado desde 1 de agosto, e essa carga inicial pode levar alguns dias para completar. Se o dataset está em uma região única, não existe retroatividade: o dado começa na data em que você ligou.\n\nOu seja, a exportação não é um arquivo histórico que estava guardado esperando por você. Quem precisa de análise do ano passado e nunca ligou a exportação não recupera aquele detalhe por essa via.",
                },
                {
                    type: "code",
                    value: 'SELECT\n  project.id AS projeto,\n  service.description AS servico,\n  SUM(cost) AS custo_bruto,\n  SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) AS c), 0)) AS creditos\nFROM `lab-faturamento.faturamento.gcp_billing_export_v1_0X0X0X_0X0X0X_0X0X0X`\nWHERE invoice.month = "202609"\nGROUP BY projeto, servico\nORDER BY custo_bruto DESC\nLIMIT 20',
                },
                {
                    type: "text",
                    value: "## O atraso dos dados, e o que a tabela não conta\n\nA exportação roda **ao longo do dia**, em intervalos, e a documentação não promete latência nem entrega. Além disso, cada serviço relata uso e custo ao Cloud Billing no próprio ritmo, então é normal um gasto de hoje aparecer só amanhã, e é normal o número de ontem mudar um pouco depois. Nunca prometa painel de custo em tempo real.\n\nA outra limitação é mais traiçoeira: a linha exportada registra o estado do recurso **no momento do uso**. Se você colocar um rótulo novo em um projeto hoje, ou mover o projeto para outra pasta, as linhas já exportadas continuam como estavam. A correção vale só para frente.",
                },
                {
                    type: "quote",
                    value: "Fora das multirregiões a exportação não é retroativa, e nenhuma linha já exportada é reescrita depois.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual exportação do faturamento permite identificar a VM específica que gerou um custo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A exportação de custo de uso detalhado, que desce ao recurso",
                            isCorrect: true,
                        },
                        {
                            text: "A exportação de custo de uso padrão, que para no nível do SKU",
                            isCorrect: false,
                        },
                        {
                            text: "A exportação de preços, que lista SKU, unidade e faixa",
                            isCorrect: false,
                        },
                        {
                            text: "A exportação de metadados de compromisso de uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você ligou a exportação do faturamento em um dataset criado na região southamerica-east1. Que dado vai aparecer na tabela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Só o uso a partir da data em que a exportação foi ligada",
                            isCorrect: true,
                        },
                        {
                            text: "O uso desde o começo do mês anterior, por retroatividade",
                            isCorrect: false,
                        },
                        {
                            text: "Todo o histórico da conta de faturamento desde a criação",
                            isCorrect: false,
                        },
                        {
                            text: "O uso dos últimos noventa dias, pela política padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quem vai configurar a exportação de custo de uso para o BigQuery precisa de qual combinação de papéis?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gerente de custos na conta de faturamento e usuário do BigQuery no projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Leitor da conta de faturamento e administrador de dados do BigQuery no projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Usuário da conta de faturamento e proprietário do projeto que vai receber",
                            isCorrect: false,
                        },
                        {
                            text: "Criador de conta de faturamento e administrador do BigQuery no projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um rótulo de centro de custo foi aplicado hoje em todos os projetos. O que esperar das linhas que já foram exportadas para o BigQuery?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Elas não mudam: o rótulo aparece apenas nas exportações seguintes",
                            isCorrect: true,
                        },
                        {
                            text: "Elas são reescritas na próxima carga, já com o rótulo preenchido",
                            isCorrect: false,
                        },
                        {
                            text: "Elas ganham o rótulo só na tabela detalhada, não na tabela padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Elas são apagadas e recarregadas com o estado atual dos projetos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O diretor quer um painel de custo em tempo real alimentado pela exportação do faturamento. Qual é a objeção técnica correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A exportação roda em intervalos, sem garantia de latência nem de entrega",
                            isCorrect: true,
                        },
                        {
                            text: "A exportação aceita consulta uma vez por dia, por cota fixa do BigQuery",
                            isCorrect: false,
                        },
                        {
                            text: "A exportação grava somente no fechamento da fatura, uma vez por mês",
                            isCorrect: false,
                        },
                        {
                            text: "A exportação não guarda a hora do uso, apenas o total do dia por serviço",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Rótulos, relatórios e atribuição de custo",
            blocks: [
                {
                    type: "text",
                    value: "A fatura do Google Cloud chega organizada do jeito do Google: por serviço, por SKU, por projeto, por local. O negócio quer ver de outro jeito: por time, por produto, por cliente, por ambiente. **Atribuição de custo** é o trabalho de traduzir um no outro, e ele começa muito antes de a conta chegar.\n\nA primeira dimensão sai de graça: o **projeto**. Todo custo nasce dentro de um projeto, então um desenho de projetos que espelha a organização já resolve boa parte da atribuição sem esforço nenhum. O que sobra depende de marcação, e aí entram rótulos e tags.",
                },
                {
                    type: "text",
                    value: "## Rótulo, a marcação simples\n\nO **rótulo** (label) é um par chave e valor que você pendura direto no recurso: uma VM, um disco, um bucket, um dataset, um projeto. São até 64 rótulos por recurso, chave de 1 a 63 caracteres começando por letra minúscula, valor de 0 a 63 caracteres, e nos dois só letra minúscula, número, sublinhado e hífen.\n\nRótulo é fácil de aplicar e aparece tanto nos relatórios de faturamento quanto na exportação para o BigQuery, o que o torna a ferramenta mais usada para quebrar custo por time ou por ambiente. Duas limitações pesam: **rótulo não é herdado** na hierarquia, então marcar a pasta não marca nada do que está dentro dela, e nada obriga ninguém a aplicar o rótulo.",
                },
                {
                    type: "code",
                    value: "gcloud compute instances add-labels web-1 \\\n  --zone=southamerica-east1-a \\\n  --labels=time=plataforma,ambiente=producao\n\ngcloud storage buckets update gs://relatorios-financeiro \\\n  --update-labels=time=financeiro,ambiente=producao\n\ngcloud projects update app-prod \\\n  --update-labels=centro-de-custo=cc-4120",
                },
                {
                    type: "text",
                    value: "## A pegadinha: rótulo não é retroativo\n\nEsta é a frase que a prova quer ouvir. O custo atribuído a um rótulo conta apenas o uso **a partir do dia em que o rótulo foi aplicado** ao recurso. Se você marcar uma VM com `ambiente=dev` no dia 15, a análise por esse rótulo não vê nada do que aquela VM gastou entre o dia 1 e o dia 14, e as linhas já gravadas na exportação do BigQuery seguem sem o rótulo.\n\nA consequência é de processo, não de ferramenta: rótulo tem que ser aplicado no nascimento do recurso. Na automação de criação, no módulo de Terraform, no modelo de instância. Arrumar rótulo no fim do mês não conserta o mês.",
                },
                {
                    type: "table",
                    value: '[["Característica","Rótulo","Tag","Tag de rede"],["O que é","Metadado no recurso","Recurso próprio, com IAM","Texto na interface de rede da VM"],["Herança na hierarquia","Não herda","Herda, e pode ser sobrescrita","Não se aplica"],["Política de organização e condição de IAM","Não serve","Serve","Não serve"],["Atribuição de custo","Filtra e agrupa relatório e exportação","Aparece na exportação, com chave, valor e herança","Não aparece"],["Uso típico","Marcar time e ambiente recurso a recurso","Governança e custo herdados da pasta","Alvo de regra de firewall"]]',
                },
                {
                    type: "text",
                    value: "## Tag, a marcação que a organização impõe\n\nA **tag** resolve justamente o que o rótulo não resolve. Ela não é metadado: é um recurso de verdade, com chave e valor criados antes do uso, e com IAM próprio, o que permite decidir quem tem direito de aplicar o valor `producao`. Tag é **herdada** na hierarquia, então amarrar `ambiente=producao` em uma pasta alcança os projetos de dentro, e um projeto pode sobrescrever o valor herdado.\n\nPorque tem IAM e herança, a tag entra em **política de organização** e em **condição de IAM**, o que permite exigir que todo projeto novo nasça marcado. Do lado do custo, as exportações padrão e detalhada trazem campos de tag (chave, valor, se foi herdada e namespace), então a tag também atribui custo. O preço disso é a cerimônia: tag dá mais trabalho para criar e tem cota própria.",
                },
                {
                    type: "code",
                    value: "gcloud resource-manager tags keys create ambiente \\\n  --parent=organizations/123456789012\n\ngcloud resource-manager tags values create producao \\\n  --parent=123456789012/ambiente\n\ngcloud resource-manager tags bindings create \\\n  --tag-value=123456789012/ambiente/producao \\\n  --parent=//cloudresourcemanager.googleapis.com/projects/482910374651",
                },
                {
                    type: "text",
                    value: '## Onde olhar o custo no console\n\nTrês páginas, três perguntas diferentes.\n\n**Relatórios** é o gráfico de barras do dia a dia. Agrupa por serviço, projeto, SKU, local, rótulo e hierarquia, filtra pelas mesmas dimensões e mostra em cinza a previsão para o fim do período. Dá para escolher entre ver pelo período de cobrança do uso, que tem dado desde 2017 e aceita previsão, ou pelo período de fatura, que inclui imposto e ajuste mas não projeta.\n\n**Tabela de custos** mostra o custo por fatura individual, e é a página de quem precisa bater número com o financeiro.\n\n**Detalhamento de custos** desenha a cascata do preço de lista até o valor final, passando por desconto negociado, compromisso de uso por gasto, compromisso por recurso, desconto por uso sustentado, promoção e crédito. É a resposta para "de onde veio essa economia". Qualquer uma das três exige pelo menos leitor da conta de faturamento.',
                },
                {
                    type: "quote",
                    value: "Rótulo só atribui custo a partir do dia em que foi aplicado: marcar é decisão de criação, não de fechamento.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a diferença mais importante entre rótulo e tag dentro da hierarquia de recursos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A tag é herdada pelos recursos filhos, o rótulo não é",
                            isCorrect: true,
                        },
                        {
                            text: "O rótulo é herdado pelos recursos filhos, a tag não é",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois são herdados, mas só a tag pode ser sobrescrita",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum dos dois é herdado em qualquer circunstância",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time aplicou o rótulo time=dados nas VMs no dia 15 de maio. O relatório de maio agrupado por esse rótulo mostra o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O custo daquelas VMs a partir de 15 de maio, não o mês todo",
                            isCorrect: true,
                        },
                        {
                            text: "O custo daquelas VMs no mês inteiro de maio, desde o dia 1",
                            isCorrect: false,
                        },
                        {
                            text: "O custo daquelas VMs desde a data de criação de cada uma",
                            isCorrect: false,
                        },
                        {
                            text: "Nada, porque rótulo não aparece em relatório de faturamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual marcação permite exigir, por política de organização, que todo projeto novo carregue a indicação de ambiente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tag, porque é recurso próprio e vale em política de organização",
                            isCorrect: true,
                        },
                        {
                            text: "Rótulo, porque aceita até sessenta e quatro pares por recurso",
                            isCorrect: false,
                        },
                        {
                            text: "Tag de rede, porque é avaliada pelas regras de firewall da VPC",
                            isCorrect: false,
                        },
                        {
                            text: "Rótulo, porque é herdado da pasta para os projetos de dentro dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa mostrar quanto do gasto do mês virou desconto por compromisso de uso e crédito promocional. Qual relatório usar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O detalhamento de custos, que parte do preço de lista até o final",
                            isCorrect: true,
                        },
                        {
                            text: "A página Relatórios, agrupando por serviço e depois por local de uso",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela de custos, que lista o custo por fatura individual emitida",
                            isCorrect: false,
                        },
                        {
                            text: "O orçamento configurado com desconto e crédito incluídos no escopo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A empresa quer atribuir custo por time sem depender de alguém lembrar de marcar cada recurso. Qual desenho é o mais confiável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Separar por projeto e usar tag, que é herdada pela hierarquia de recursos",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir a cada time que aplique o rótulo em cada recurso logo depois de criar",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar rótulo no fim do mês, antes de a fatura do período ser fechada",
                            isCorrect: false,
                        },
                        {
                            text: "Usar tag de rede com o nome do time em todas as VMs de cada ambiente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pagar menos: Spot, compromisso de uso e dimensionamento",
            blocks: [
                {
                    type: "text",
                    value: "Depois de saber para onde o dinheiro foi, vem a parte que o negócio cobra: pagar menos pela mesma carga. No Google Cloud a mesma VM pode custar valores bem diferentes conforme o compromisso que você assume e o risco que você aceita. Em vez de decorar preço, guarde a ordem de grandeza do desconto e, principalmente, **quem paga o quê**.\n\nQuatro alavancas respondem por quase toda a economia: aceitar interrupção (VM Spot), assumir compromisso de prazo (desconto por compromisso de uso), simplesmente deixar a máquina ligada o mês inteiro (desconto por uso sustentado) e usar o tamanho certo (dimensionamento). As três primeiras mexem no preço unitário. A última mexe na quantidade, e quase sempre é a de maior retorno.",
                },
                {
                    type: "text",
                    value: "## Spot: o desconto que cobra paciência\n\n**VM Spot** é capacidade sobrando do Google vendida com desconto que pode passar de 90 por cento sobre o preço sob demanda, variando por tipo de máquina, GPU, TPU e SSD local. O preço vem com uma condição clara: o Google pode retomar aquela capacidade a qualquer momento.\n\nA retomada segue um roteiro. O Compute Engine marca os metadados da instância, respeita um período de aviso configurável e dá cerca de 30 segundos para o desligamento ordenado antes de aplicar a ação de término, que por padrão é parar a VM e pode ser trocada por apagar. Use esses segundos em um script de desligamento que salve o ponto do trabalho.\n\nTrês limites fecham o desenho. Spot **não tem SLA** e fica de fora do SLA do Compute Engine. Spot **não faz migração ao vivo** nem reinício automático em evento de host. E Spot não tem tempo máximo de vida, diferente da antiga VM preemptiva, que morria em 24 horas. Por isso Spot serve a carga tolerante a falha: processamento em lote, renderização, teste, worker sem estado que lê de uma fila. Nunca a um banco de dados nem ao nó que atende o cliente.",
                },
                {
                    type: "code",
                    value: "gcloud compute instances create lote-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-standard-4 \\\n  --provisioning-model=SPOT \\\n  --instance-termination-action=DELETE \\\n  --metadata-from-file=shutdown-script=salva-progresso.sh",
                },
                {
                    type: "text",
                    value: "## Compromisso de uso e desconto por uso sustentado\n\n**Desconto por compromisso de uso** (CUD) é contrato: você se compromete a consumir por 1 ou 3 anos e paga menos pelo caminho. Existem dois sabores.\n\nO **compromisso baseado em recurso** reserva quantidade de vCPU, memória, GPU, SSD local, nó de locatário único e licença de sistema operacional, em uma região e em uma família de máquinas. É o mais barato e o mais rígido: se a carga mudar de região ou de família, o desconto não acompanha. A ordem do desconto chega a cerca de 70 por cento em máquina otimizada para memória e a cerca de 55 por cento nas outras séries, com o prazo de 3 anos descontando mais que o de 1 ano.\n\nO **compromisso flexível de computação**, baseado em gasto, cobre consumo elegível de Compute Engine, GKE e Cloud Run dentro da conta de faturamento, sem amarrar região nem tipo de máquina. Desconta menos que o baseado em recurso e dá muito mais liberdade.\n\nNos dois vale a mesma regra dura: a parcela do compromisso é cobrada **todo mês do prazo, use ou não**, e compromisso comprado não se cancela. Por isso compromisso vem depois do dimensionamento, nunca antes.\n\nO **desconto por uso sustentado** (SUD) é o oposto do contrato: não tem assinatura, não tem botão, não exige nada. O Compute Engine calcula sozinho e devolve como crédito mensal conforme a fração do mês em que o recurso ficou rodando, subindo por faixas até cerca de 30 por cento em N1, M1 e M2 e cerca de 20 por cento em N2, N2D e C2. Ele vale para essas famílias, para nó de locatário único e para GPU ligada a N1, e **não vale** para Spot, E2, T2D nem para a família otimizada para acelerador.",
                },
                {
                    type: "table",
                    value: '[["Modelo de preço","O que você assume","Ordem do desconto","Risco que você aceita"],["Sob demanda","Nada","Preço de lista","Nenhum"],["Desconto por uso sustentado","Só deixar o recurso ligado no mês","Até cerca de 30 por cento","Nenhum, é automático"],["Compromisso baseado em recurso","1 ou 3 anos, por região e família","Até cerca de 70 por cento","Paga use ou não, e não cancela"],["Compromisso flexível de gasto","1 ou 3 anos de gasto elegível","Intermediária","Paga use ou não, e não cancela"],["VM Spot","Perder a VM a qualquer momento","Pode passar de 90 por cento","Sem SLA e sem migração ao vivo"]]',
                },
                {
                    type: "text",
                    value: "## Dimensionamento correto e recomendações\n\nA economia mais limpa não negocia preço: ela desliga o que não serve e encolhe o que está grande demais. O Google entrega isso pronto no **Recommender**, parte do Active Assist, que lê métrica do Cloud Monitoring e sugere a mudança.\n\nA recomendação de tipo de máquina, também chamada de recomendação de dimensionamento, usa os **últimos 8 dias** de uso de CPU e memória da instância. Ela aparece cerca de 24 horas depois de a VM ser criada, ou 24 horas depois de uma troca de tipo de máquina, então não espere conselho sobre uma máquina que subiu agora. Aplicar a recomendação pelo console faz o Compute Engine **parar a instância**, trocar o tipo e ligar de novo, o que exige janela de manutenção combinada com quem usa o sistema.\n\nNa mesma família há outros recomendadores que vale citar: VM ociosa, disco persistente ocioso, endereço IP externo sem uso e imagem sem uso. Juntos eles costumam explicar a maior fatia do desperdício em ambiente que cresceu sem governança.",
                },
                {
                    type: "code",
                    value: 'gcloud recommender recommendations list \\\n  --project=app-prod \\\n  --location=southamerica-east1-a \\\n  --recommender=google.compute.instance.MachineTypeRecommender \\\n  --format="table(description, primaryImpact.costProjection.cost)"',
                },
                {
                    type: "text",
                    value: "## Estimar o custo de armazenamento\n\nO guia do exame pede para estimar custo de recurso de armazenamento, e quem erra essa questão é quem olha só o preço por GB. A conta do Cloud Storage soma quatro parcelas:\n\n- **Armazenamento** por GB por mês, que varia conforme a classe.\n- **Operações**, separadas em classe A (as que escrevem e listam, mais caras) e classe B (as que leem, mais baratas).\n- **Recuperação de dados**, cobrada ao ler objeto em Nearline, Coldline e Archive. Standard não cobra.\n- **Saída de rede**, cobrada quando o dado sai para a internet ou para outra região.\n\nEm cima disso vem a **duração mínima de armazenamento**: 30 dias em Nearline, 90 em Coldline, 365 em Archive. Apagar, sobrescrever ou mudar de classe antes do prazo cobra os dias que faltavam, a chamada exclusão antecipada. Standard não tem mínimo.\n\nDaí a inversão que a prova gosta de testar: a classe mais barata para guardar é a mais cara para ler e a mais rígida para apagar. Arquivo lido toda hora em Archive sai mais caro que o mesmo arquivo em Standard. Quando o padrão de acesso é desconhecido, o **Autoclass** do bucket move cada objeto entre classes conforme o acesso real, sem cobrar recuperação nem exclusão antecipada, em troca de uma taxa de gerenciamento. E para fechar o número antes de criar qualquer coisa, a **calculadora de preços** monta a estimativa mensal por serviço, e quem tem contrato pode ligá-la à conta de faturamento para usar o preço negociado.",
                },
                {
                    type: "table",
                    value: '[["Classe","Duração mínima","Taxa de recuperação","Quando usar"],["Standard","Nenhuma","Não cobra","Dado lido com frequência ou em processamento"],["Nearline","30 dias","Cobra","Acesso da ordem de uma vez por mês"],["Coldline","90 dias","Cobra mais","Acesso da ordem de uma vez por trimestre"],["Archive","365 dias","Cobra o mais alto","Retenção legal e backup que quase nunca é lido"]]',
                },
                {
                    type: "quote",
                    value: "Compromisso de uso você paga use ou não, Spot você pode perder a qualquer hora, e nenhum dos dois conserta uma máquina grande demais.",
                },
            ],
            questions: [
                {
                    statement: "Qual carga de trabalho é a mais adequada para rodar em VM Spot?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Processamento em lote que consegue recomeçar de onde parou",
                            isCorrect: true,
                        },
                        {
                            text: "Banco de dados relacional de produção com demanda constante",
                            isCorrect: false,
                        },
                        {
                            text: "Nó que recebe o tráfego dos clientes de um site de vendas",
                            isCorrect: false,
                        },
                        {
                            text: "Servidor de licenças que precisa de endereço fixo e de SLA",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time comprou um compromisso baseado em recurso de 3 anos em uma região e depois migrou a carga para outra região. O que acontece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A parcela continua sendo cobrada e o desconto não acompanha",
                            isCorrect: true,
                        },
                        {
                            text: "O compromisso é transferido junto com a carga para a região",
                            isCorrect: false,
                        },
                        {
                            text: "O compromisso é cancelado e o valor pago volta como crédito",
                            isCorrect: false,
                        },
                        {
                            text: "A parcela para de ser cobrada enquanto não houver uso na região",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma VM n2-standard-4 ficou ligada o mês inteiro, sem nenhum contrato assinado com o Google. Que desconto ela recebe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Desconto por uso contínuo, aplicado de forma automática",
                            isCorrect: true,
                        },
                        {
                            text: "Desconto por compromisso de uso de um ano, por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Desconto de VM Spot, porque ficou ligada o mês inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum, porque todo desconto exige um compromisso assinado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você criou uma VM há duas horas e quer ver a recomendação de dimensionamento dela no Recommender. O que esperar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nada ainda: a recomendação aparece cerca de 24 horas depois",
                            isCorrect: true,
                        },
                        {
                            text: "A recomendação já está pronta, calculada no momento da criação",
                            isCorrect: false,
                        },
                        {
                            text: "A recomendação sai em 8 dias, quando a janela de métrica fecha",
                            isCorrect: false,
                        },
                        {
                            text: "Nada nunca: dimensionamento só vale para grupo gerenciado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Arquivos de auditoria são gravados uma vez, lidos raramente e precisam ser apagados por completo em 60 dias. Qual classe de armazenamento escolher?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nearline, cuja duração mínima de 30 dias cabe nos 60 dias",
                            isCorrect: true,
                        },
                        {
                            text: "Coldline, cuja duração mínima de 90 dias cobre bem o caso",
                            isCorrect: false,
                        },
                        {
                            text: "Archive, porque é a classe mais barata por GB armazenado",
                            isCorrect: false,
                        },
                        {
                            text: "Standard, porque classe fria cobra recuperação na leitura",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - IAM, identidades e contas de serviço",
    aulas: [
        {
            titulo: "Papéis do IAM: basic, predefinidos e personalizados",
            blocks: [
                {
                    type: "text",
                    value: "O IAM responde a uma pergunta só: **quem** pode fazer **o que** em **qual recurso**. Toda resposta a essa pergunta é uma concessão com três partes.\n\n- **Principal**, que boa parte das APIs ainda chama de *membro*: a identidade autenticada, como um usuário, um grupo ou uma conta de serviço.\n- **Papel**: o conjunto de permissões que você quer entregar.\n- **Recurso**: onde a concessão vale, de uma organização inteira até um único bucket.\n\nNo Google Cloud você nunca concede permissão avulsa. A permissão vem sempre embalada em um papel, e o papel é concedido a um principal sobre um recurso. Guardar essa frase evita boa parte dos erros da prova.",
                },
                {
                    type: "text",
                    value: "## Os três tipos de papel\n\nA documentação separa os papéis em três famílias, e a prova cobra o nome exato de cada uma.\n\n- **Basic**: os papéis antigos Owner, Editor e Viewer, herdados da época anterior ao IAM granular. São amplos demais para produção.\n- **Predefinidos**: criados e mantidos pelo Google, um conjunto por serviço, como `roles/compute.instanceAdmin.v1` ou `roles/storage.objectViewer`. Quando o serviço ganha um recurso novo, o papel predefinido é atualizado junto, sem trabalho seu.\n- **Personalizados**: você monta a lista de permissões. Só vale quando nenhum predefinido chega perto do que o time precisa, porque a manutenção passa a ser sua.",
                },
                {
                    type: "table",
                    value: '[["Tipo","Quem mantém","Quando usar"],["Basic","Google, sem granularidade","Projeto de laboratório ou sandbox descartável"],["Predefinido","Google, atualizado junto com o serviço","Escolha padrão em produção"],["Personalizado","Você, a cada mudança do serviço","Nenhum predefinido serve e o ajuste precisa ser fino"]]',
                },
                {
                    type: "quote",
                    value: "Em ambiente de produção, não conceda papéis basic a menos que não exista alternativa.",
                },
                {
                    type: "text",
                    value: "## Por que fugir de Owner, Editor e Viewer\n\nOs três papéis basic são cumulativos: `roles/viewer` dá as ações de leitura que não mudam estado, `roles/editor` acrescenta as ações que mudam estado e `roles/owner` acrescenta a gestão das tarefas sensíveis, como gerenciar papéis e permissões e configurar o faturamento.\n\nO problema é a escala. Cada um desses papéis carrega milhares de permissões de todos os serviços do projeto, inclusive de serviços que o time nem usa hoje. Quando alguém habilita uma API nova, quem tinha Editor já pode operá-la, sem que ninguém decida isso. É por isso que a recomendação oficial é trocar basic pelo papel predefinido mais restrito que resolve a tarefa.\n\nUm detalhe que a prova explora: quem tem `roles/editor` cria e destrói recursos, mas não altera a política do IAM do projeto. Gerenciar papéis e permissões é privilégio de `roles/owner`, e é por isso que Owner concedido demais é o achado mais comum de auditoria.",
                },
                {
                    type: "code",
                    value: "gcloud iam roles describe roles/storage.objectViewer",
                },
                {
                    type: "text",
                    value: "## Papel personalizado: onde se cria e o que pode entrar\n\nAntes de criar um papel personalizado, teste a combinação de dois ou três predefinidos. Papel personalizado não se atualiza sozinho: se o serviço ganhar uma permissão nova, alguém do seu time precisa editar o papel.\n\nAs regras que a prova cobra:\n\n- O papel personalizado pode ser criado **no projeto ou na organização**. Não existe papel personalizado em pasta. Se o papel precisa valer em várias pastas, crie na organização.\n- Papel de projeto não aceita permissão que só existe acima dele, como `resourcemanager.organizations.get`.\n- Nem toda permissão entra em papel personalizado. A referência de permissões marca cada uma como compatível, `TESTING` ou `NOT_SUPPORTED`. Permissão de serviço em fase inicial de lançamento costuma ficar de fora, e uma permissão marcada como `NOT_SUPPORTED` faz a criação falhar.\n- O papel tem a sua própria fase de lançamento, no campo `stage`, de `ALPHA` e `BETA` até `GA`, além de `DEPRECATED` e `DISABLED`. Papel em `DISABLED` continua existindo, mas não concede nada a ninguém.\n- O limite é de 3.000 permissões por papel personalizado.",
                },
                {
                    type: "code",
                    value: 'title: "Operador de VM sem console serial"\ndescription: "Lista, inicia e para instâncias, sem acesso ao console serial"\nstage: "GA"\nincludedPermissions:\n- compute.instances.list\n- compute.instances.get\n- compute.instances.start\n- compute.instances.stop',
                },
                {
                    type: "code",
                    value: "gcloud iam roles create operadorVmRestrito \\\n  --project=meu-projeto \\\n  --file=papel-operador-vm.yaml",
                },
                {
                    type: "text",
                    value: "## A escada da permissão mínima\n\nNa hora de escolher, siga sempre a mesma ordem: comece pelo papel predefinido mais restrito que resolve a tarefa; se faltar algo, combine dois predefinidos; só então considere um papel personalizado. Papel basic fica para laboratório descartável.\n\nE conceda no nível mais baixo que atende. `roles/storage.objectViewer` em um bucket específico evita muito mais dor de cabeça do que o mesmo papel no projeto inteiro.",
                },
            ],
            questions: [
                {
                    statement:
                        "Segundo a documentação atual do Google Cloud, quais são os três tipos de papel do IAM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Basic, predefinidos e personalizados",
                            isCorrect: true,
                        },
                        {
                            text: "Primitivos, curados e temporários",
                            isCorrect: false,
                        },
                        {
                            text: "De leitura, de escrita e de administração",
                            isCorrect: false,
                        },
                        {
                            text: "De projeto, de pasta e de organização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Uma concessão do IAM é formada por três partes. Quais são elas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Principal, papel e recurso",
                            isCorrect: true,
                        },
                        {
                            text: "Usuário, permissão e projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Conta, escopo e política",
                            isCorrect: false,
                        },
                        {
                            text: "Identidade, grupo e organização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time precisa de um papel personalizado que valha para todos os projetos de três pastas diferentes da organização. Em que nível o papel deve ser criado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na organização, já que papel personalizado não existe em pasta",
                            isCorrect: true,
                        },
                        {
                            text: "Em cada uma das três pastas, repetindo a mesma definição",
                            isCorrect: false,
                        },
                        {
                            text: "Em um projeto qualquer, porque o papel personalizado é herdado para cima na hierarquia",
                            isCorrect: false,
                        },
                        {
                            text: "Na pasta de nível mais alto, que propaga a definição para as pastas irmãs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao criar um papel personalizado, você inclui uma permissão marcada como NOT_SUPPORTED na referência de permissões. O que acontece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A criação falha, porque a permissão não pode entrar em papel personalizado",
                            isCorrect: true,
                        },
                        {
                            text: "A permissão entra, mas só funciona depois que o serviço chegar a GA",
                            isCorrect: false,
                        },
                        {
                            text: "A criação funciona e a permissão é trocada pela equivalente de um papel predefinido",
                            isCorrect: false,
                        },
                        {
                            text: "A permissão entra e passa a valer apenas para quem tem papel basic no projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma auditoria aponta que a equipe de aplicação usa `roles/editor` no projeto de produção e pede para revisar o acesso. Qual observação sobre `roles/editor` está correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cria e remove recursos, mas não altera a política do IAM do projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Altera a política do IAM, mas não consegue remover recursos do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Equivale a Viewer somado à permissão de configurar o faturamento",
                            isCorrect: false,
                        },
                        {
                            text: "É um papel predefinido do Compute Engine, restrito a instâncias de VM",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Política do IAM e herança na hierarquia",
            blocks: [
                {
                    type: "text",
                    value: "A concessão não vive solta: ela fica dentro de uma **política de permissão**, que a documentação chama de *allow policy*, anexada a um recurso. A política é um objeto JSON ou YAML com uma lista de **bindings**, e cada binding amarra um papel a um conjunto de principals.\n\nLer e editar essa política é a tarefa de IAM mais frequente do dia a dia. É também o ponto em que mais gente se perde, porque o acesso que a pessoa tem quase nunca está só na política do recurso que ela acessou.",
                },
                {
                    type: "code",
                    value: "bindings:\n- members:\n  - group:plataforma@exemplo.com\n  role: roles/compute.instanceAdmin.v1\n- members:\n  - serviceAccount:coletor@meu-projeto.iam.gserviceaccount.com\n  role: roles/storage.objectCreator\netag: BwYgGR0xZ1k=\nversion: 1",
                },
                {
                    type: "text",
                    value: "## O que tem dentro de um binding\n\n- **Principals**: um ou mais identificadores, cada um com o seu prefixo, como `user:`, `group:`, `serviceAccount:`, `domain:`, `principal://` e `principalSet://`.\n- **Papel**: um nome completo, como `roles/storage.objectCreator`. Cada binding tem exatamente um papel.\n- **Condição**, opcional: uma expressão que restringe ainda mais aquele binding, por exemplo liberar o acesso só até uma data.\n\nFora dos bindings ficam dois metadados que importam. O `etag` serve para controle de concorrência: você lê a política com o etag, edita e grava; se outra pessoa gravou no meio do caminho, a sua escrita é rejeitada em vez de apagar o trabalho dela. A `version` indica o esquema da política, e a versão 3 é a que aceita condição.",
                },
                {
                    type: "text",
                    value: "## A herança desce, nunca sobe\n\nOs recursos do Google Cloud formam uma hierarquia: organização, pasta, projeto e, abaixo do projeto, os recursos de cada serviço. A política anexada a um contêiner vale também para tudo que está dentro dele.\n\nO acesso efetivo de alguém a um recurso é a soma da política do próprio recurso com a política de todos os ancestrais. Se qualquer um desses bindings concede a permissão, o acesso passa. Daí saem duas consequências práticas:\n\n- Conceder `roles/viewer` na organização dá leitura em todos os projetos, inclusive nos que forem criados amanhã.\n- Remover o binding do projeto não tira o acesso de quem recebeu o papel na pasta acima. O lugar de olhar é a política do ancestral.",
                },
                {
                    type: "quote",
                    value: "A política efetiva de um recurso é a soma da política dele com a de todos os ancestrais, e basta um binding conceder para o acesso passar.",
                },
                {
                    type: "text",
                    value: "## Quando conceder não basta: política de negação\n\nA política de permissão só sabe dizer sim. Para dizer não existe a **política de negação**, a *deny policy*, que você anexa a uma organização, a uma pasta ou a um projeto e que vale para todos os descendentes.\n\nUma regra de negação lista os principals em `deniedPrincipals`, as permissões em `deniedPermissions` e, se você quiser, quem escapa da regra em `exceptionPrincipals`. O detalhe que decide questão de prova: o IAM avalia as políticas de negação **antes** das de permissão. Quem está negado não executa aquela permissão nem com Owner no projeto.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Política de permissão","Política de negação"],["O que faz","Concede papel a principal","Bloqueia permissão específica"],["Onde se anexa","Qualquer recurso que aceite IAM","Organização, pasta ou projeto"],["Unidade de trabalho","Papel","Permissão"],["Ordem de avaliação","Depois da negação","Antes da permissão"]]',
                },
                {
                    type: "code",
                    value: "gcloud projects get-iam-policy meu-projeto --format=yaml",
                },
                {
                    type: "code",
                    value: "gcloud projects add-iam-policy-binding meu-projeto \\\n  --member='group:plataforma@exemplo.com' \\\n  --role='roles/compute.instanceAdmin.v1'",
                },
                {
                    type: "text",
                    value: "## O comando certo para cada caso\n\nPara acrescentar ou tirar um binding, use `add-iam-policy-binding` e `remove-iam-policy-binding`: eles leem a política, aplicam a mudança e gravam, cuidando do etag por você. Guarde `set-iam-policy` para quando você realmente quiser substituir a política inteira por um arquivo, por exemplo ao restaurar um estado conhecido, porque ele apaga todo binding que não esteja no arquivo.\n\nEsse par de comandos existe em quase todo serviço, sempre com o mesmo formato: `gcloud storage buckets add-iam-policy-binding`, `gcloud iam service-accounts add-iam-policy-binding`, `gcloud organizations add-iam-policy-binding`.",
                },
            ],
            questions: [
                {
                    statement: "O que é um binding dentro de uma política de permissão do IAM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A associação entre um papel e os principals que o recebem",
                            isCorrect: true,
                        },
                        {
                            text: "A associação entre uma permissão e o recurso que a expõe ao usuário",
                            isCorrect: false,
                        },
                        {
                            text: "O vínculo entre um projeto e a pasta que o contém na hierarquia",
                            isCorrect: false,
                        },
                        {
                            text: "O registro de cada chamada de API feita com aquele papel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde a política de permissão do IAM fica anexada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ao recurso, da organização até o recurso de serviço",
                            isCorrect: true,
                        },
                        {
                            text: "Ao papel, que passa a carregar a lista de quem pode usá-lo",
                            isCorrect: false,
                        },
                        {
                            text: "Ao usuário, dentro do diretório da conta do Cloud Identity",
                            isCorrect: false,
                        },
                        {
                            text: "À conta de faturamento que está vinculada ao projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pessoa recebeu `roles/storage.admin` na pasta que contém dez projetos. Você remove o binding dela na política de um desses projetos. O que acontece com o acesso dela aos buckets desse projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Continua, porque o binding da pasta é herdado pelo projeto",
                            isCorrect: true,
                        },
                        {
                            text: "É cortado, porque a política do projeto tem precedência sobre a da pasta",
                            isCorrect: false,
                        },
                        {
                            text: "Continua por até 24 horas, até a remoção terminar de propagar",
                            isCorrect: false,
                        },
                        {
                            text: "É cortado só nos buckets criados depois da remoção do binding",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um usuário tem `roles/owner` em um projeto. Uma política de negação anexada à organização lista a permissão `storage.buckets.delete` com esse usuário em `deniedPrincipals`. O que ele consegue fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tudo do papel Owner, menos excluir buckets, porque a negação vem primeiro",
                            isCorrect: true,
                        },
                        {
                            text: "Tudo do papel Owner, inclusive excluir buckets, porque Owner tem precedência",
                            isCorrect: false,
                        },
                        {
                            text: "Nada no projeto, porque a negação invalida o papel Owner por completo",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas leitura no projeto, porque a negação rebaixa Owner para Viewer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer substituir a política de permissão completa de um projeto por uma versão salva em arquivo, apagando todo binding que não esteja nela. Qual comando usar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "`gcloud projects set-iam-policy` com o arquivo da política",
                            isCorrect: true,
                        },
                        {
                            text: "`gcloud projects add-iam-policy-binding` uma vez por binding",
                            isCorrect: false,
                        },
                        {
                            text: "`gcloud projects get-iam-policy` com a flag de sobrescrita",
                            isCorrect: false,
                        },
                        {
                            text: "`gcloud projects update` com a flag de política do IAM",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cloud Identity: usuários, grupos e provisionamento",
            blocks: [
                {
                    type: "text",
                    value: "O Google Cloud não guarda uma base de usuários própria. As identidades humanas vivem em uma conta do **Cloud Identity** ou do **Google Workspace**, dois produtos que compartilham a mesma plataforma técnica, as mesmas APIs e o mesmo console de administração.\n\nEssa conta não é um usuário: é um diretório de usuários e grupos, ligado a um domínio, e funciona como o inquilino que a sua organização do Google Cloud usa. É nela que alguém é criado, suspenso e excluído. O IAM apenas aponta para identidades que já existem ali, e por isso conceder papel a um email que não está no diretório não cria pessoa nenhuma.",
                },
                {
                    type: "text",
                    value: "## Conceda para grupo, não para pessoa\n\nA recomendação oficial é conceder papéis a grupos sempre que possível, porque trocar quem está no grupo é muito mais simples do que caçar bindings espalhados pela hierarquia.\n\nPense na entrada de alguém no time de plataforma. Com concessão por grupo, você adiciona a pessoa a `plataforma@exemplo.com` e ela herda tudo: nenhuma política muda. Na saída, você remove do grupo e o acesso cai junto, em todos os projetos de uma vez. Com concessão pessoa a pessoa, a mesma entrada exige editar a política de cada projeto, e a saída quase sempre deixa resíduo.\n\nUm usuário ou grupo pode pertencer a quantos grupos quiser, ao contrário da unidade organizacional, que aceita uma só por usuário. Por isso grupo é a ferramenta de acesso, e unidade organizacional é a ferramenta de configuração.",
                },
                {
                    type: "quote",
                    value: "Conceda papéis a grupos em vez de usuários individuais: mudar quem está no grupo é mais simples do que editar política.",
                },
                {
                    type: "table",
                    value: '[["Prefixo","O que representa","Exemplo"],["user:","Usuário individual do diretório","user:ana@exemplo.com"],["group:","Grupo do Cloud Identity","group:plataforma@exemplo.com"],["serviceAccount:","Conta de serviço","serviceAccount:app@proj.iam.gserviceaccount.com"],["domain:","Todo mundo do domínio","domain:exemplo.com"],["principal:// e principalSet://","Identidade federada e conjunto de identidades federadas","principalSet://iam.googleapis.com/projects/..."]]',
                },
                {
                    type: "code",
                    value: 'gcloud identity groups create plataforma@exemplo.com \\\n  --organization=exemplo.com \\\n  --display-name="Time de Plataforma"',
                },
                {
                    type: "code",
                    value: "gcloud projects add-iam-policy-binding meu-projeto \\\n  --member='group:plataforma@exemplo.com' \\\n  --role='roles/container.developer'",
                },
                {
                    type: "text",
                    value: "## Provisionamento: trazer as pessoas de onde elas já estão\n\nQuase nenhuma empresa quer manter duas listas de funcionários. O padrão é deixar o diretório que já existe como fonte da verdade e automatizar duas coisas separadas.\n\n- **Autenticação**: com login único por SAML, a conta do Cloud Identity repassa a decisão de autenticação ao provedor de identidade externo. A senha continua lá fora.\n- **Provisionamento**: usuários e grupos são criados, atualizados e excluídos na conta do Cloud Identity de forma automática. Para Active Directory e LDAP, a ferramenta gratuita do Google é o **Google Cloud Directory Sync**, que consulta o diretório e usa a Directory API para aplicar as diferenças. Provedores como o Microsoft Entra ID provisionam direto, sem ferramenta no meio.\n\nO provisionamento é de mão única: o que muda no diretório externo chega ao Google, e não o contrário. E ele compensa justamente porque cria a conta antes do primeiro login, o que permite colocar a pessoa no grupo certo e deixar o acesso pronto, além de propagar a exclusão quando ela sai da empresa.",
                },
                {
                    type: "text",
                    value: "## Super administrador não é papel do IAM\n\nConfusão clássica de prova: super administrador é um privilégio da conta do Cloud Identity ou do Workspace, não um papel do IAM. Ele administra o diretório e, como pode conceder a si mesmo qualquer papel na organização, não existe forma de impedi-lo de alterar ou apagar registros de auditoria.\n\nA orientação é manter o número de super administradores no mínimo, usar contas dedicadas que ninguém use no dia a dia e preferir os papéis administrativos menores do Workspace para as tarefas rotineiras. Para trabalhar no Google Cloud, a pessoa entra com a conta normal e recebe papéis do IAM, como `roles/resourcemanager.organizationAdmin`.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a recomendação oficial sobre a quem conceder papéis do IAM no dia a dia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A grupos do Cloud Identity, sempre que for possível",
                            isCorrect: true,
                        },
                        {
                            text: "A usuários individuais, para rastrear quem tem o quê",
                            isCorrect: false,
                        },
                        {
                            text: "A contas de serviço, que depois repassam para as pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "Ao domínio inteiro, deixando a condição filtrar quem entra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como um grupo do Cloud Identity aparece na flag `--member` de um comando `add-iam-policy-binding`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "`group:plataforma@exemplo.com`",
                            isCorrect: true,
                        },
                        {
                            text: "`team:plataforma@exemplo.com`",
                            isCorrect: false,
                        },
                        {
                            text: "`cloudIdentityGroup:plataforma@exemplo.com`",
                            isCorrect: false,
                        },
                        {
                            text: "`groupSet:plataforma@exemplo.com`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa provisiona o Active Directory para o Cloud Identity com o Google Cloud Directory Sync. Um administrador cria um grupo direto no console do Google. O que esperar desse grupo na próxima sincronização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pode ser removido, porque o fluxo vai do Active Directory para o Google",
                            isCorrect: true,
                        },
                        {
                            text: "É copiado para o Active Directory, porque a sincronização vale nos dois sentidos",
                            isCorrect: false,
                        },
                        {
                            text: "Passa a existir nos dois lados, com o Google como fonte da verdade",
                            isCorrect: false,
                        },
                        {
                            text: "Continua intacto, porque a ferramenta cria objetos e nunca remove nenhum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pessoa entra no time e precisa, no primeiro dia, do mesmo acesso que os colegas têm em doze projetos. Qual desenho entrega isso sem editar nenhuma política do IAM?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Papéis concedidos a grupos e a pessoa provisionada dentro do grupo certo",
                            isCorrect: true,
                        },
                        {
                            text: "Papéis concedidos por usuário, com um script que replica os bindings dos colegas",
                            isCorrect: false,
                        },
                        {
                            text: "Um papel personalizado por pessoa, criado no nível da organização",
                            isCorrect: false,
                        },
                        {
                            text: "Uma chave de conta de serviço compartilhada pelo time, guardada em cofre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é uma conta do Cloud Identity?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um diretório de usuários e grupos ligado a um domínio",
                            isCorrect: true,
                        },
                        {
                            text: "Um papel do IAM que administra a organização inteira",
                            isCorrect: false,
                        },
                        {
                            text: "Um projeto especial que guarda as contas de serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Uma conta de faturamento compartilhada pela organização",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Contas de serviço e permissão mínima",
            blocks: [
                {
                    type: "text",
                    value: "Código não digita senha. Quando uma aplicação precisa chamar uma API do Google Cloud, ela se autentica como uma **conta de serviço**: uma identidade sem pessoa por trás, identificada por um endereço de email no formato `nome@projeto.iam.gserviceaccount.com`.\n\nO que confunde é que a conta de serviço tem duas naturezas ao mesmo tempo. Ela é uma **identidade**, porque aparece como principal em bindings de outros recursos. E ela é um **recurso**, porque tem a sua própria política de permissão, que diz quem pode usá-la. Quase toda questão de prova sobre conta de serviço nasce dessa dualidade.",
                },
                {
                    type: "text",
                    value: "## Permissão DA conta e permissão NA conta\n\n- **Permissão DA conta**: o que a aplicação consegue fazer. Você concede um papel em um projeto, bucket ou conjunto de dados e coloca a conta de serviço como principal, com o prefixo `serviceAccount:`.\n- **Permissão NA conta**: quem pode usar a conta de serviço. Você concede um papel na própria conta de serviço e coloca a pessoa, o grupo ou outra conta de serviço como principal.\n\nSeparar os dois resolve o caso mais comum de suporte: a aplicação devolve erro de permissão porque falta permissão DA conta; a pessoa não consegue subir a aplicação porque falta permissão NA conta. São duas políticas diferentes, em dois recursos diferentes.",
                },
                {
                    type: "table",
                    value: '[["Papel concedido na conta de serviço","O que ele permite"],["roles/iam.serviceAccountUser","Anexar a conta de serviço a um recurso"],["roles/iam.serviceAccountTokenCreator","Criar credenciais de curta duração e personificar a conta"],["roles/iam.workloadIdentityUser","Deixar uma carga de trabalho federada personificar a conta"],["roles/iam.serviceAccountAdmin","Criar, excluir e gerenciar as contas de serviço"]]',
                },
                {
                    type: "code",
                    value: 'gcloud iam service-accounts create coletor-logs \\\n  --display-name="Coletor de logs" \\\n  --description="Lê objetos do bucket de auditoria"',
                },
                {
                    type: "code",
                    value: "gcloud storage buckets add-iam-policy-binding gs://auditoria-exemplo \\\n  --member='serviceAccount:coletor-logs@meu-projeto.iam.gserviceaccount.com' \\\n  --role='roles/storage.objectViewer'",
                },
                {
                    type: "code",
                    value: "gcloud iam service-accounts add-iam-policy-binding \\\n  coletor-logs@meu-projeto.iam.gserviceaccount.com \\\n  --member='group:plataforma@exemplo.com' \\\n  --role='roles/iam.serviceAccountUser'",
                },
                {
                    type: "text",
                    value: "## Anexar a conta de serviço ao recurso\n\nA forma mais segura de autenticar uma carga que roda dentro do Google Cloud é **anexar** uma conta de serviço ao recurso: VM do Compute Engine, serviço do Cloud Run, job, cluster. O código pede as credenciais ao servidor de metadados e não existe arquivo de chave para guardar nem rotacionar.\n\nPara anexar, quem executa precisa de `roles/iam.serviceAccountUser` na conta de serviço, além do papel que cria o recurso. E trocar a conta de serviço de uma VM que já existe exige a VM parada.",
                },
                {
                    type: "code",
                    value: "gcloud compute instances create coletor-01 \\\n  --zone=southamerica-east1-b \\\n  --service-account=coletor-logs@meu-projeto.iam.gserviceaccount.com \\\n  --scopes=https://www.googleapis.com/auth/cloud-platform",
                },
                {
                    type: "text",
                    value: "## Escopos de acesso: a camada legada do Compute Engine\n\nAntes do IAM granular, o Compute Engine limitava o que a VM podia chamar por **escopos de acesso**, que são os escopos OAuth padrão das requisições feitas de dentro da instância. Eles continuam lá e continuam derrubando aplicação.\n\nO comportamento é de interseção: a chamada só passa se o papel do IAM permitir **e** o escopo da VM incluir aquela API. O escopo nunca concede nada por conta própria, só restringe. A VM criada sem `--scopes` recebe um conjunto padrão limitado, com acesso apenas de leitura ao Cloud Storage, e isso quebra qualquer gravação mesmo com `roles/storage.objectAdmin` concedido à conta.\n\nA recomendação atual é definir o escopo amplo `cloud-platform` e controlar tudo pelo papel do IAM da conta de serviço. Vale lembrar também da conta de serviço padrão do Compute Engine, no formato `NUMERO_DO_PROJETO-compute@developer.gserviceaccount.com`, que é anexada por padrão e historicamente nasce com papel amplo: prefira criar uma conta dedicada para cada carga.",
                },
                {
                    type: "quote",
                    value: "O escopo de acesso só restringe, nunca concede: quem concede é o papel do IAM da conta de serviço.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que a documentação diz que uma conta de serviço é ao mesmo tempo identidade e recurso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque aparece como principal em políticas e tem política própria",
                            isCorrect: true,
                        },
                        {
                            text: "Porque tem um endereço de email e também uma chave privada associada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque existe no projeto e também no diretório da conta do Cloud Identity",
                            isCorrect: false,
                        },
                        {
                            text: "Porque pode ser usada por pessoas e por outras contas de serviço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pessoa precisa criar uma VM e anexar a ela uma conta de serviço que já existe. Qual papel ela precisa ter na própria conta de serviço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "`roles/iam.serviceAccountUser`",
                            isCorrect: true,
                        },
                        {
                            text: "`roles/iam.serviceAccountAdmin`",
                            isCorrect: false,
                        },
                        {
                            text: "`roles/iam.serviceAccountTokenCreator`",
                            isCorrect: false,
                        },
                        {
                            text: "`roles/compute.instanceAdmin.v1`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A conta de serviço anexada a uma VM tem `roles/storage.objectAdmin` no bucket, mas a gravação falha com erro de permissão. A VM foi criada sem a flag de escopos. Qual é a causa mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O escopo padrão da VM só permite leitura no Cloud Storage",
                            isCorrect: true,
                        },
                        {
                            text: "O papel do bucket precisa valer no projeto inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "A conta de serviço padrão está substituindo a conta anexada à VM",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor de metadados não entrega credencial sem chave estática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma VM criada sem a flag de escopos precisa gravar em um bucket, e a conta de serviço anexada já tem o papel necessário lá. Como corrigir isso sem recriar a VM?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Parar a VM, ajustar o escopo para cloud-platform e ligar de novo",
                            isCorrect: true,
                        },
                        {
                            text: "Ajustar o escopo com a VM em execução e reiniciar só a aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Conceder roles/owner à conta de serviço e deixar o escopo como está",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a conta anexada pela conta de serviço padrão do Compute Engine",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o formato do email da conta de serviço padrão do Compute Engine?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "NUMERO_DO_PROJETO-compute@developer.gserviceaccount.com",
                            isCorrect: true,
                        },
                        {
                            text: "ID_DO_PROJETO-compute@developer.gserviceaccount.com",
                            isCorrect: false,
                        },
                        {
                            text: "compute-default@NUMERO_DO_PROJETO.iam.gserviceaccount.com",
                            isCorrect: false,
                        },
                        {
                            text: "default-compute@ID_DO_PROJETO.iam.gserviceaccount.com",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Impersonation, credenciais de curta duração e Workload Identity Federation",
            blocks: [
                {
                    type: "text",
                    value: "A chave de conta de serviço é um arquivo JSON com uma chave privada que não expira. Ela vaza em repositório, fica esquecida em imagem de contêiner, viaja por mensagem e, quando é usada, não há jeito confiável de saber quem usou.\n\nPor isso a documentação pede, nesta ordem: anexe uma conta de serviço quando a carga roda dentro do Google Cloud; use **Workload Identity Federation** quando a carga roda fora; use **credenciais de curta duração** com **impersonation** quando é uma pessoa ou uma tarefa pontual. A chave estática é o último recurso, para o caso em que nenhuma das alternativas atende.",
                },
                {
                    type: "text",
                    value: "## Impersonation: pegar emprestada a identidade\n\nPersonificar uma conta de serviço é se autenticar como ela para herdar as permissões dela. Em vez de distribuir chave, você concede na conta de serviço o papel **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`), que inclui a permissão `iam.serviceAccounts.getAccessToken`.\n\nAqui está a pegadinha mais frequente da prova: `roles/iam.serviceAccountUser` serve para anexar a conta a um recurso e não serve para personificar pela linha de comando. Quem cria token de curta duração e habilita a flag `--impersonate-service-account` é o Token Creator.\n\nPara uma sessão inteira, em vez de repetir a flag, dá para fixar a conta na configuração do gcloud, na propriedade `auth/impersonate_service_account`. Enquanto ela estiver definida, toda chamada sai como a conta de serviço.",
                },
                {
                    type: "code",
                    value: "gcloud storage ls gs://auditoria-exemplo \\\n  --impersonate-service-account=coletor-logs@meu-projeto.iam.gserviceaccount.com",
                },
                {
                    type: "text",
                    value: "## Credenciais de curta duração\n\nA credencial de curta duração é criada sob demanda e expira sozinha. São quatro tipos:\n\n- **Token de acesso OAuth 2.0**, aceito pela maioria das APIs do Google.\n- **Token de ID do OpenID Connect**, aceito por um conjunto menor de serviços, útil para chamar um serviço do Cloud Run com autenticação.\n- **JWT autoassinado**, para comunicação entre aplicações suas.\n- **Blob binário assinado**, quando você precisa apenas da assinatura.\n\nO token de acesso criado assim vive no máximo uma hora, ou 3.600 segundos. Para chegar a doze horas, a conta de serviço precisa estar em uma política da organização com a restrição de lista `constraints/iam.allowServiceAccountCredentialLifetimeExtension`.",
                },
                {
                    type: "code",
                    value: "gcloud auth print-access-token \\\n  --impersonate-service-account=coletor-logs@meu-projeto.iam.gserviceaccount.com",
                },
                {
                    type: "text",
                    value: "## Workload Identity Federation: carga de trabalho fora do Google Cloud\n\nQuando o processo roda em outra nuvem, no data center ou em um runner de integração contínua, ele já tem uma identidade: papel do IAM da AWS, identidade gerenciada do Azure, token OIDC do GitHub Actions, asserção SAML, certificado de cliente. O Workload Identity Federation troca esse token externo por credencial do Google Cloud, sem chave nenhuma no caminho.\n\nA montagem tem duas peças:\n\n- **Pool de identidades de carga de trabalho**: o contêiner das identidades externas. O padrão é um pool por ambiente de fora do Google Cloud.\n- **Provedor do pool**: descreve a relação de confiança com o provedor externo, valida o token recebido e mapeia atributos, por exemplo `google.subject=assertion.sub`.\n\nCom as peças prontas, o caminho recomendado é o **acesso direto ao recurso**: você concede o papel ao principal federado, com o prefixo `principalSet://` e o número do projeto na identificação, sem envolver conta de serviço. Personificar uma conta de serviço continua disponível para os casos em que o acesso direto não atende.",
                },
                {
                    type: "code",
                    value: 'gcloud iam workload-identity-pools providers create-oidc github \\\n  --location=global \\\n  --workload-identity-pool=ci-externo \\\n  --issuer-uri="https://token.actions.githubusercontent.com" \\\n  --attribute-mapping="google.subject=assertion.sub"',
                },
                {
                    type: "table",
                    value: '[["Onde a carga roda","Como autenticar","Usa chave estática"],["VM, Cloud Run ou job","Conta de serviço anexada ao recurso","Não"],["Outra nuvem, local ou runner de CI","Workload Identity Federation","Não"],["Pod no GKE","Workload Identity Federation for GKE","Não"],["Pessoa ou tarefa pontual","Impersonation com token de curta duração","Não"],["Nenhuma alternativa atende","Chave de conta de serviço","Sim"]]',
                },
                {
                    type: "text",
                    value: "## No GKE o nome é Workload Identity Federation for GKE\n\nDentro do Kubernetes o mesmo mecanismo ganha um atalho. Você habilita o recurso no cluster com `--workload-pool=ID_DO_PROJETO.svc.id.goog` e garante o servidor de metadados do GKE no pool de nós com `--workload-metadata=GKE_METADATA`. A partir daí, a ServiceAccount do Kubernetes é uma identidade federada e aparece em política do IAM como um principal do pool do projeto.\n\nNo modelo com conta de serviço no meio, você concede `roles/iam.workloadIdentityUser` na conta de serviço ao membro `serviceAccount:ID_DO_PROJETO.svc.id.goog[NAMESPACE/NOME_DA_KSA]` e anota a ServiceAccount do Kubernetes com `iam.gke.io/gcp-service-account`. Nos dois modelos o pod nunca vê uma chave: ele pede credencial ao servidor de metadados e recebe token de curta duração.\n\nPara fechar a porta de vez na organização, aplique a restrição `constraints/iam.disableServiceAccountKeyCreation` e abra exceção apenas nos projetos que comprovadamente não têm alternativa.",
                },
                {
                    type: "quote",
                    value: "A chave estática de conta de serviço é o último recurso, nunca o ponto de partida.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual recurso do gcloud permite executar um comando com a identidade de uma conta de serviço, sem gerar chave?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A flag --impersonate-service-account",
                            isCorrect: true,
                        },
                        {
                            text: "A flag --service-account na chamada",
                            isCorrect: false,
                        },
                        {
                            text: "A variável GOOGLE_APPLICATION_CREDENTIALS",
                            isCorrect: false,
                        },
                        {
                            text: "O comando gcloud auth activate-service-account",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual papel concedido na conta de serviço habilita a flag `--impersonate-service-account` e a criação de token de acesso para ela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "`roles/iam.serviceAccountTokenCreator`",
                            isCorrect: true,
                        },
                        {
                            text: "`roles/iam.serviceAccountOpenIdTokenCreator`",
                            isCorrect: false,
                        },
                        {
                            text: "`roles/iam.serviceAccountUser`",
                            isCorrect: false,
                        },
                        {
                            text: "`roles/iam.serviceAccountKeyAdmin`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline do GitHub Actions precisa publicar imagens no Artifact Registry, e a empresa proíbe chave de conta de serviço. Qual desenho atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Workload Identity Federation, com pool e provedor OIDC para o GitHub",
                            isCorrect: true,
                        },
                        {
                            text: "Workload Identity Federation for GKE, apontando o pool para o runner",
                            isCorrect: false,
                        },
                        {
                            text: "Conta de serviço anexada ao runner, pelo servidor de metadados do Google",
                            isCorrect: false,
                        },
                        {
                            text: "Token de acesso de doze horas gerado na mão e guardado como segredo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por padrão, qual é o tempo máximo de vida de um token de acesso criado para uma conta de serviço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma hora, ou 3.600 segundos",
                            isCorrect: true,
                        },
                        {
                            text: "Doze horas, ou 43.200 segundos",
                            isCorrect: false,
                        },
                        {
                            text: "Vinte e quatro horas",
                            isCorrect: false,
                        },
                        {
                            text: "Dez minutos, ou 600 segundos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pod no GKE precisa ler um bucket. Qual configuração evita montar chave de conta de serviço no pod?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Habilitar o Workload Identity Federation for GKE e vincular a conta do Kubernetes à do IAM",
                            isCorrect: true,
                        },
                        {
                            text: "Montar a chave da conta de serviço em um Secret do Kubernetes e restringir o acesso ao namespace",
                            isCorrect: false,
                        },
                        {
                            text: "Usar a conta de serviço padrão do Compute Engine anexada aos nós",
                            isCorrect: false,
                        },
                        {
                            text: "Criar um papel personalizado e conceder ao namespace do pod no projeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Compute Engine",
    aulas: [
        {
            titulo: "Criar uma instância: tipos de máquina, disco e SSH",
            blocks: [
                {
                    type: "text",
                    value: "Uma instância do Compute Engine é uma máquina virtual que roda em um host do Google. Criar uma delas é responder a cinco perguntas, e é na escolha, não no clique, que a prova pega.\n\n- **Onde**: projeto e zona. A instância é um recurso zonal, e a zona decide a latência para quem usa, o preço e quais séries de máquina estão disponíveis ali.\n- **Quanto de máquina**: o tipo de máquina, que fixa a quantidade de vCPU e de memória.\n- **Qual sistema**: a imagem que vai no disco de inicialização.\n- **Quanto de disco**: tipo e tamanho do disco de inicialização, mais os discos de dados que a carga pedir.\n- **Quem entra e com o que ela conversa**: chaves SSH ou OS Login, a conta de serviço anexada e as regras de firewall.\n\nGuarde uma assimetria que rende questão: o **tipo de máquina** você troca depois, com a instância parada. A **zona**, não. Mudar de zona é recriar a instância a partir de um snapshot ou de uma imagem.",
                },
                {
                    type: "text",
                    value: "## Família, série e tipo\n\nO catálogo de máquinas tem três níveis. A **família** responde ao formato da carga, a **série** responde à geração de processador e à plataforma, e o **tipo** responde ao tamanho.\n\n- **De uso geral**: a melhor relação entre preço e desempenho para a carga do dia a dia. Séries E2, N1, N2, N2D, N4, C3, C3D, C4, T2D e T2A, entre outras.\n- **Otimizada para computação**: desempenho por núcleo mais alto, para HPC e carga presa em CPU. Séries C2, C2D, H3 e H4D.\n- **Otimizada para memória**: muito mais memória por vCPU, para banco em memória e SAP HANA. Séries M2, M3, M4 e X4.\n- **Otimizada para acelerador**: GPU anexada, para treino e inferência de modelo. Séries A2, A3, A4, G2 e G4.\n- **Otimizada para armazenamento**: densidade alta de disco local com pouco núcleo. Séries Z3 e Z4D.\n- **Otimizada para rede**: banda de rede alta para carga presa em entrada e saída. Séries C4N e M4N.\n\nNa prova a pergunta chega como cenário, nunca como lista. Banco em memória de 1 TB puxa família otimizada para memória. Simulação numérica que satura a CPU puxa otimizada para computação. Servidor web comum fica em uso geral, e é o caso da maioria das questões.",
                },
                {
                    type: "table",
                    value: '[["Família", "O que ela resolve", "Séries típicas"], ["Uso geral", "Carga comum, melhor relação entre preço e desempenho", "E2, N2, N4, C4"], ["Otimizada para computação", "Desempenho por núcleo alto, HPC e carga presa em CPU", "C2, C2D, H3"], ["Otimizada para memória", "Muita memória por vCPU, banco em memória e SAP HANA", "M3, M4, X4"], ["Otimizada para acelerador", "Treino e inferência com GPU anexada", "A3, A4, G2"], ["Otimizada para armazenamento", "Densidade alta de disco local com pouco núcleo", "Z3, Z4D"], ["Otimizada para rede", "Banda de rede alta para carga presa em rede", "C4N, M4N"]]',
                },
                {
                    type: "text",
                    value: "## Tipo predefinido e tipo personalizado\n\nO **tipo predefinido** vem com vCPU e memória fixos, e o nome conta a proporção:\n\n- `standard`: proporção equilibrada de memória por vCPU, como `n2-standard-4`.\n- `highcpu`: menos memória por vCPU, para quem só quer processamento.\n- `highmem`: mais memória por vCPU, para quem só quer memória.\n- Núcleo compartilhado: `e2-micro`, `e2-small` e `e2-medium` dividem um núcleo físico e servem a carga pequena e intermitente. Não aceitam SSD local.\n\nQuando nenhum predefinido serve, entra o **tipo de máquina personalizado**, no qual você escolhe vCPU e memória dentro dos limites da série. Isso só existe nas séries de uso geral com N e E no nome, como E2, N1, N2, N2D e N4, mais a série G2 de acelerador. Fora delas, personalizado não é uma opção.\n\nDuas regras fecham a decisão. O personalizado cobra um prêmio da ordem de 5 por cento sobre o predefinido equivalente, então ele só compensa quando o predefinido obrigaria a pagar o dobro de vCPU só para alcançar a memória que falta. E se nem o teto de memória da série bastar, você pede **memória estendida**, acrescentando `-ext` ao nome do tipo, e paga à parte pela memória acima da proporção padrão.",
                },
                {
                    type: "code",
                    value: "gcloud compute machine-types list \\\n  --zones=southamerica-east1-a \\\n  --filter=\"name~'^n2-standard'\"\n\ngcloud compute machine-types describe n2-standard-4 \\\n  --zone=southamerica-east1-a\n\ngcloud compute instances create web-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-standard-4 \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud\n\ngcloud compute instances create analise-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-custom-6-40960\n\ngcloud compute instances create analise-2 \\\n  --zone=southamerica-east1-a \\\n  --custom-vm-type=n2 \\\n  --custom-cpu=6 \\\n  --custom-memory=40GB\n\ngcloud compute instances create cache-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-custom-48-720000-ext",
                },
                {
                    type: "text",
                    value: "## O disco de inicialização\n\nToda instância nasce com um **disco de inicialização** criado a partir de uma imagem, e três decisões aparecem na prova.\n\nA **imagem**: imagem pública do Google (Debian, Ubuntu, RHEL, SLES, Windows Server, Container-Optimized OS) ou imagem personalizada sua. Aponte sempre para a **família de imagens** com `--image-family`, nunca para o nome exato, porque a família resolve para a imagem mais recente que não foi descontinuada. Com `--image` você congela a versão e precisa editar o script a cada lançamento.\n\nO **tipo e o tamanho**: `--boot-disk-type` e `--boot-disk-size`. No disco persistente, tamanho maior também significa mais IOPS, e a próxima aula entra nos tipos.\n\nO **ciclo de vida**: por padrão o disco de inicialização é apagado junto com a instância. A flag `--no-boot-disk-auto-delete` quebra esse laço e deixa o disco sobreviver, o que já salvou muito dado de quem apagou a VM errada. Vale o contrário também: disco que fica para trás continua sendo cobrado.",
                },
                {
                    type: "code",
                    value: "gcloud compute instances create app-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=e2-standard-2 \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud \\\n  --boot-disk-size=50GB \\\n  --boot-disk-type=pd-balanced \\\n  --no-boot-disk-auto-delete \\\n  --service-account=app-runtime@ensinadev-prod.iam.gserviceaccount.com \\\n  --no-address",
                },
                {
                    type: "quote",
                    value: "O tipo de máquina você troca com a instância parada. A zona, não: mudar de zona é recriar a instância.",
                },
                {
                    type: "text",
                    value: "## Como você entra na instância\n\nNo Linux o acesso é por SSH, e existem dois modelos que a prova compara o tempo todo.\n\nNo modelo antigo, a **chave pública mora nos metadados**. Metadado de projeto na chave `ssh-keys` vale para todas as VMs do projeto; metadado de instância vale só para aquela VM. O `gcloud compute ssh` cuida disso sozinho: na primeira vez ele gera o par de chaves na sua máquina e publica a parte pública nos metadados. Quando uma VM de produção precisa aceitar apenas as chaves cadastradas nela, o metadado `block-project-ssh-keys=TRUE` faz a instância recusar as chaves do projeto.\n\nO problema desse modelo é operacional: a chave não expira, revogar acesso significa editar metadados, e auditar quem entra significa ler metadados. O **OS Login** inverte isso e transforma o acesso em concessão do IAM, e é o assunto da última aula do módulo.\n\nDois detalhes de borda que rendem questão. No Windows não há SSH por metadados: a senha de administrador sai do comando `gcloud compute reset-windows-password` e o acesso é por RDP. E o **console serial** é via de diagnóstico, não via de uso: ele vem desabilitado e precisa do metadado `serial-port-enable=TRUE`.",
                },
                {
                    type: "code",
                    value: "gcloud compute ssh web-1 --zone=southamerica-east1-a\n\ngcloud compute project-info add-metadata \\\n  --metadata-from-file=ssh-keys=chaves-do-time.txt\n\ngcloud compute instances add-metadata web-1 \\\n  --zone=southamerica-east1-a \\\n  --metadata=block-project-ssh-keys=TRUE\n\ngcloud compute reset-windows-password win-1 \\\n  --zone=southamerica-east1-a \\\n  --user=operador",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma equipe vai subir um banco de dados em memória que precisa de muita memória por vCPU. Qual família de máquina do Compute Engine atende esse perfil?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Otimizada para memória",
                            isCorrect: true,
                        },
                        {
                            text: "Otimizada para computação",
                            isCorrect: false,
                        },
                        {
                            text: "Otimizada para armazenamento",
                            isCorrect: false,
                        },
                        {
                            text: "Uso geral com núcleo compartilhado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma carga precisa de 6 vCPUs e 40 GB de memória. Na série N2, o tipo standard entrega 4 GB por vCPU, o highmem entrega 8 GB e o highcpu entrega 2 GB, então nenhum predefinido para exatamente em 40 GB com 6 vCPUs. Qual a escolha mais econômica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um tipo personalizado da série N2, com 6 vCPUs e 40 GB",
                            isCorrect: true,
                        },
                        {
                            text: "O predefinido de highmem acima, pois N2 não aceita personalizado",
                            isCorrect: false,
                        },
                        {
                            text: "Um tipo de núcleo compartilhado, que não limita a memória",
                            isCorrect: false,
                        },
                        {
                            text: "Um tipo personalizado de C2, a única série com vCPU avulsa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um script cria VMs novas toda semana e precisa sempre da imagem mais recente do Debian 12, sem edição manual. O que usar no comando de criação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A flag `--image-family`, que aponta para a imagem mais nova",
                            isCorrect: true,
                        },
                        {
                            text: "A flag `--image`, com o nome exato da imagem mais recente",
                            isCorrect: false,
                        },
                        {
                            text: "A flag `--source-snapshot`, que busca o snapshot mais novo",
                            isCorrect: false,
                        },
                        {
                            text: "A flag `--image-project`, que já seleciona a versão mais nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em quais séries de máquina o tipo personalizado está disponível?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nas séries de uso geral com N e E no nome, mais a G2",
                            isCorrect: true,
                        },
                        {
                            text: "Em qualquer série, desde que a zona tenha capacidade",
                            isCorrect: false,
                        },
                        {
                            text: "Só nas séries otimizadas para computação, como C2 e C2D",
                            isCorrect: false,
                        },
                        {
                            text: "Só nas séries otimizadas para memória, como M3 e M4",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O projeto guarda chaves SSH nos metadados para acesso geral, mas uma VM de produção precisa aceitar apenas as chaves cadastradas nela mesma. O que configurar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Metadado `block-project-ssh-keys=TRUE` na instância",
                            isCorrect: true,
                        },
                        {
                            text: "Metadado `enable-oslogin=FALSE` no projeto inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Remover a conta de serviço padrão anexada à instância",
                            isCorrect: false,
                        },
                        {
                            text: "Regra de firewall negando a porta 22 na rede do projeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Discos, snapshots e imagens",
            blocks: [
                {
                    type: "text",
                    value: "No Compute Engine o disco é um recurso separado da instância, com ciclo de vida próprio. Essa separação é o que permite parar a VM, trocar o tipo de máquina e ligar de novo sem perder nada, e é o que divide o armazenamento em bloco em duas categorias que você não pode confundir.\n\n- **Durável**: Disco permanente (Persistent Disk) e Hyperdisk. O volume existe independente da instância, sobrevive à parada e pode ser desanexado e anexado em outra VM sem perder dado.\n- **Efêmero**: SSD local, fisicamente preso ao host. É o mais rápido de todos e o único que perde o conteúdo quando a instância para.\n\nA pergunta que resolve quase toda questão de disco é esta: o dado precisa sobreviver à instância? Se precisa, é durável. Se não, SSD local pode valer pela velocidade.",
                },
                {
                    type: "text",
                    value: "## Os tipos duráveis\n\nO **Disco permanente** tem quatro tipos, e o nome que aparece no `gcloud` é o que a prova cobra:\n\n- `pd-standard`: apoiado em HDD, o mais barato por GB, bom para processamento sequencial de muito dado.\n- `pd-balanced`: apoiado em SSD, o equilíbrio entre custo e desempenho e a recomendação usual para disco de inicialização.\n- `pd-ssd`: apoiado em SSD, latência menor, para aplicação corporativa e banco que sofre com atraso.\n- `pd-extreme`: SSD com IOPS provisionado à parte, para banco muito exigente.\n\nO **Hyperdisk** é a geração seguinte, e a diferença conceitual importa mais que os números: no Disco permanente o desempenho vem amarrado ao tamanho que você provisiona, e no Hyperdisk você provisiona **IOPS e vazão separados da capacidade**. Os tipos são `hyperdisk-balanced`, `hyperdisk-balanced-high-availability` (replicado em duas zonas da mesma região), `hyperdisk-extreme`, `hyperdisk-throughput` e `hyperdisk-ml`. Séries novas nascem com suporte a Hyperdisk, e algumas delas, como a C4D, trabalham só com Hyperdisk.",
                },
                {
                    type: "table",
                    value: '[["Tipo", "Mídia", "Quando usar"], ["pd-standard", "HDD", "Muito dado lido em sequência, com custo por GB baixo"], ["pd-balanced", "SSD", "Recomendação usual, inclusive para disco de inicialização"], ["pd-ssd", "SSD", "Aplicação corporativa e banco sensível a latência"], ["pd-extreme", "SSD", "Banco exigente que precisa de IOPS provisionado"], ["hyperdisk-balanced", "SSD", "Carga geral nas séries novas, desempenho ajustável"], ["hyperdisk-ml", "SSD", "Leitura do mesmo volume por muitas instâncias de treino"], ["SSD local", "NVMe no host", "Cache e dado temporário que pode ser recriado"]]',
                },
                {
                    type: "text",
                    value: "## SSD local: rápido e descartável\n\nO **SSD local** fica no mesmo servidor físico da instância. Cada dispositivo tem 375 GiB de capacidade e você anexa vários para somar espaço. A interface pode ser NVMe, mais rápida, ou SCSI.\n\nAs restrições são o que a prova cobra. O SSD local **não serve como disco de inicialização**. Não existe em tipo de máquina com núcleo compartilhado, e só aparece em algumas séries, como C4, C4A, C4D, Z3 e Z4D. Não é replicado nem copiado por snapshot.\n\nE a regra que decide a questão: o conteúdo **é perdido se a instância parar por qualquer motivo**, seja parada combinada, suspensão, reinício, falha do host ou evento de manutenção. Nada de replicação automática, nada de recuperação. Quem usa SSD local em produção escreve o dado bom em outro lugar e trata o SSD local como rascunho rápido.",
                },
                {
                    type: "quote",
                    value: "Dado no SSD local morre junto com a parada da instância. Se ele precisa sobreviver, não é SSD local.",
                },
                {
                    type: "text",
                    value: "## Snapshot: cópia incremental do disco\n\nO **snapshot** é uma cópia de segurança do conteúdo do disco, e o funcionamento tem três partes que viram questão.\n\nÉ **incremental**. O primeiro snapshot de um disco é completo e carrega todo o dado. Cada snapshot seguinte guarda apenas o que mudou desde o anterior, o que o torna muito mais rápido e barato. Por isso você pode agendar snapshot de hora em hora sem multiplicar o custo pelo número de cópias.\n\nÉ **global** por padrão, então você restaura o disco em qualquer região ou projeto a partir dele, o que faz do snapshot a ferramenta usual para mover disco de zona. Também existe snapshot regional, para quem precisa controlar onde o dado fica.\n\nTem **tipos**. O snapshot padrão guarda a cópia de forma redundante entre regiões; o snapshot de arquivamento custa menos e serve a retenção longa. Nos dois, apagar o disco de origem não apaga os snapshots, e apagar um snapshot do meio da cadeia não corrompe os outros, porque o serviço reorganiza as referências sozinho.",
                },
                {
                    type: "code",
                    value: 'gcloud compute snapshots create dados-2026-10-05 \\\n  --source-disk=dados-app \\\n  --source-disk-zone=southamerica-east1-a \\\n  --storage-location=southamerica-east1\n\ngcloud compute snapshots list --filter="sourceDisk~dados-app"\n\ngcloud compute disks create dados-app-restaurado \\\n  --zone=southamerica-east1-b \\\n  --source-snapshot=dados-2026-10-05 \\\n  --type=pd-balanced',
                },
                {
                    type: "code",
                    value: 'gcloud compute resource-policies create snapshot-schedule diario-14d \\\n  --region=southamerica-east1 \\\n  --description="Snapshot diário com retenção de 14 dias" \\\n  --daily-schedule \\\n  --start-time=04:00 \\\n  --max-retention-days=14 \\\n  --on-source-disk-delete=keep-auto-snapshots\n\ngcloud compute disks add-resource-policies dados-app \\\n  --zone=southamerica-east1-a \\\n  --resource-policies=diario-14d',
                },
                {
                    type: "text",
                    value: "## Imagem personalizada e família de imagens\n\nSnapshot e imagem personalizada guardam o mesmo tipo de conteúdo e resolvem problemas diferentes. O snapshot é **cópia de segurança de um disco**: você restaura aquele disco, naquele estado. A **imagem personalizada** é molde de disco de inicialização: você a usa para criar muitas VMs iguais, com os agentes, as bibliotecas e as configurações já no lugar. É o que o mercado chama de imagem dourada.\n\nVocê cria imagem personalizada a partir de um disco (`--source-disk`), de um snapshot (`--source-snapshot`) ou de outra imagem (`--source-image`). Para reduzir risco, pare a instância antes de capturar o disco, porque isso evita escrita no meio da cópia.\n\nO que amarra tudo é a **família de imagens**. Ao criar a imagem com `--family`, ela entra na família como versão mais nova, e a família passa a resolver sempre para a imagem mais recente que não foi descontinuada. Assim o modelo de instância e o script de criação apontam para a família, e publicar uma imagem nova já muda o que as próximas VMs recebem. Para voltar atrás, você marca a imagem ruim como descontinuada com `gcloud compute images deprecate`, e a família volta a apontar para a anterior.",
                },
                {
                    type: "table",
                    value: '[["Pergunta", "Snapshot", "Imagem personalizada"], ["Para que serve", "Cópia de segurança e restauração de um disco", "Molde de disco de inicialização para novas VMs"], ["Como é cobrado", "Incremental, só o que mudou desde o anterior", "Guarda o conteúdo completo do disco"], ["Uso típico", "Voltar o disco a um ponto no tempo ou mudar de zona", "Padronizar frota e alimentar modelo de instância"], ["Versionamento", "Agendamento com política de retenção", "Família de imagens aponta para a mais recente"]]',
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece com os dados gravados em um SSD local quando a instância é parada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "São perdidos, porque o SSD local é armazenamento efêmero",
                            isCorrect: true,
                        },
                        {
                            text: "Ficam preservados e voltam quando a instância é ligada",
                            isCorrect: false,
                        },
                        {
                            text: "São copiados para um snapshot automático antes da parada",
                            isCorrect: false,
                        },
                        {
                            text: "Migram para um disco permanente balanceado da mesma zona",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O primeiro snapshot de um disco de 500 GB demorou bastante. O segundo, tirado uma hora depois, terminou em poucos minutos. Por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O primeiro é completo e os seguintes guardam só o que mudou",
                            isCorrect: true,
                        },
                        {
                            text: "O segundo foi gravado em arquivamento, classe de escrita rápida",
                            isCorrect: false,
                        },
                        {
                            text: "O segundo reaproveitou o cache do disco, ainda quente na zona",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro replicou o disco em várias regiões, o segundo não",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time precisa padronizar o disco de inicialização de dezenas de VMs novas, com os agentes e as bibliotecas já instalados. O que criar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma imagem personalizada, com família de imagens",
                            isCorrect: true,
                        },
                        {
                            text: "Um agendamento de snapshot do disco de referência",
                            isCorrect: false,
                        },
                        {
                            text: "Um snapshot de arquivamento do disco de referência",
                            isCorrect: false,
                        },
                        {
                            text: "Um disco permanente regional compartilhado pelas VMs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação sobre o agendamento de snapshot, criado como política de recurso, está correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A política de agendamento vive na mesma região do disco",
                            isCorrect: true,
                        },
                        {
                            text: "A política é um recurso global, válido em qualquer região",
                            isCorrect: false,
                        },
                        {
                            text: "A política apaga os snapshots junto com o disco de origem",
                            isCorrect: false,
                        },
                        {
                            text: "A política dispensa definir retenção quando criada na CLI",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um volume `hyperdisk-balanced` de 200 GB está com espaço sobrando, mas a aplicação pede mais IOPS. Qual é o caminho?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Aumentar o IOPS provisionado do volume, sem mexer no tamanho",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o tamanho do volume, já que o IOPS segue a capacidade",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o volume por `pd-standard`, de IOPS mais previsível",
                            isCorrect: false,
                        },
                        {
                            text: "Criar um SSD local e migrar o dado para fora do Hyperdisk",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Grupos gerenciados de instâncias e autoscaling",
            blocks: [
                {
                    type: "text",
                    value: "Uma instância solta resolve o laboratório e falha na produção: ela não cresce quando o tráfego sobe, não volta sozinha quando cai e não recebe versão nova sem alguém logar nela. O **grupo gerenciado de instâncias** (MIG) existe para tirar essas três tarefas das suas mãos.\n\nO grupo gerenciado entrega quatro capacidades, e vale decorar a lista porque ela é a resposta de várias questões:\n\n- **Autoscaling**: cresce e encolhe o número de VMs conforme o sinal que você escolher.\n- **Cura automática**: recria a VM que parou, travou ou falhou na verificação de integridade.\n- **Atualização automática**: aplica um modelo de instância novo de forma controlada, com atualização contínua ou canário.\n- **Suporte a várias zonas**: espalha as VMs por uma região inteira.\n\nO **grupo não gerenciado** é o oposto: um saco de VMs que você mesmo criou e que só serve para apontar o balanceador de carga para um conjunto heterogêneo de instâncias. Não tem autoscaling, nem cura, nem atualização contínua, nem modelo de instância. Se a questão fala de alta disponibilidade, grupo não gerenciado está errado.",
                },
                {
                    type: "text",
                    value: "## O modelo de instância é a base de tudo\n\nNenhum grupo gerenciado existe sem **modelo de instância** (instance template). O modelo guarda o tipo de máquina, a imagem do disco de inicialização, os discos, a rede, as tags, os rótulos, o script de inicialização, a conta de serviço e as opções de agendamento. O grupo lê o modelo e cria cada VM a partir dele.\n\nDuas propriedades do modelo caem na prova.\n\nO modelo é **imutável**: criado, não se edita. Mudar a configuração da frota significa criar um modelo novo e dizer ao grupo para usá-lo. Esse é o motivo de o número de versão entrar no nome, como `modelo-web-v1` e `modelo-web-v2`.\n\nO modelo pode ser **global ou regional**. O regional, criado com `--instance-template-region`, fica restrito a uma região e é o que o Google recomenda, porque reduz a dependência entre regiões. O global serve em qualquer região e é o padrão quando você não passa a flag.",
                },
                {
                    type: "code",
                    value: "gcloud compute instance-templates create modelo-web-v1 \\\n  --instance-template-region=southamerica-east1 \\\n  --machine-type=e2-standard-2 \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud \\\n  --boot-disk-type=pd-balanced \\\n  --tags=servidor-http \\\n  --metadata-from-file=startup-script=instala-web.sh\n\ngcloud compute instance-templates describe modelo-web-v1 \\\n  --instance-template-region=southamerica-east1",
                },
                {
                    type: "text",
                    value: "## Zonal ou regional\n\nCom o modelo na mão, o grupo nasce em um de dois formatos.\n\nO **grupo zonal** cria todas as VMs em uma única zona, e aceita por padrão até 1.000 VMs. É mais simples e serve para carga de lote ou para quem já tem redundância em outra camada. O risco é óbvio: a zona cai, o grupo inteiro cai.\n\nO **grupo regional** espalha as VMs por várias zonas da mesma região, e aceita por padrão até 2.000 VMs. É a escolha para aplicação que atende usuário, porque a perda de uma zona derruba só uma fração das instâncias. Atenção ao detalhe: regional significa **várias zonas de uma região**, nunca várias regiões.\n\nNo grupo regional você controla como as VMs se espalham com `--target-distribution-shape`. O valor `EVEN`, que é o padrão, mantém a mesma quantidade de VMs em cada zona selecionada, com diferença máxima de uma VM entre duas zonas, e é o recomendado para carga que atende tráfego. `BALANCED` prioriza as zonas com capacidade disponível e ainda tenta equilibrar. `ANY` deixa o grupo escolher onde houver recurso, e `ANY_SINGLE_ZONE` concentra tudo em uma zona, útil quando as VMs conversam muito entre si.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Grupo zonal", "Grupo regional"], ["Onde ficam as VMs", "Uma única zona", "Várias zonas da mesma região"], ["Falha de uma zona", "Derruba o grupo inteiro", "Derruba só a fração daquela zona"], ["Tamanho padrão máximo", "Até 1.000 VMs", "Até 2.000 VMs"], ["Distribuição", "Não se aplica", "EVEN por padrão, ou BALANCED, ANY e ANY_SINGLE_ZONE"], ["Caso típico", "Lote e processamento assíncrono", "Aplicação que atende usuário"]]',
                },
                {
                    type: "text",
                    value: "## Autoscaling: quatro sinais\n\nO autoscaling vive em uma configuração anexada ao grupo, com um piso (`--min-num-replicas`) e um teto obrigatório (`--max-num-replicas`). Dentro desses limites, o escalonador decide pelo sinal que você configurar.\n\n- **Utilização média de CPU**: o sinal padrão, aplicado quando você liga o autoscaling sem dizer mais nada. O alvo vai como fração, então `--target-cpu-utilization 0.6` significa 60 por cento.\n- **Capacidade de atendimento do balanceador HTTP**: escala pela fração da capacidade configurada no serviço de back-end, com `--target-load-balancing-utilization`.\n- **Métrica do Cloud Monitoring**: qualquer métrica que represente trabalho, como tamanho de fila, com `--update-stackdriver-metric` e um alvo por utilização ou por instância.\n- **Agenda de escalonamento**: garante um número mínimo de VMs em uma janela de tempo recorrente ou única, e você pode ter até 128 agendas por grupo.\n\nA diferença entre os três primeiros e a agenda é o momento: os sinais de utilização são reativos, reagem depois que a carga sobe, e sempre perdem alguns minutos subindo máquina. A agenda é proativa e é a resposta certa quando o pico tem hora marcada, como uma promoção ou o fechamento do mês. Os dois convivem: a agenda levanta o piso, e o sinal de CPU continua respondendo ao que a agenda não previu.\n\nDois temporizadores importam. O **período de inicialização**, que a CLI chama de `--cool-down-period`, diz quanto tempo a aplicação leva para subir e vale 60 segundos por padrão; se a sua aplicação demora mais, o escalonador lê CPU de máquina ainda inicializando e cria VM demais. O **período de estabilização** vale 600 segundos por padrão e segura a redução, para o grupo não encolher no primeiro vale de carga. Quem precisa de mais cuidado ainda usa controle de redução, limitando quantas VMs saem por janela de tempo, ou troca o modo do escalonador para `only-scale-out`, que só deixa crescer.",
                },
                {
                    type: "code",
                    value: 'gcloud compute instance-groups managed set-autoscaling mig-web \\\n  --region=southamerica-east1 \\\n  --min-num-replicas=3 \\\n  --max-num-replicas=30 \\\n  --target-cpu-utilization=0.6 \\\n  --cool-down-period=90\n\ngcloud compute instance-groups managed update-autoscaling mig-web \\\n  --region=southamerica-east1 \\\n  --set-schedule=pico-da-semana \\\n  --schedule-cron="30 8 * * Mon-Fri" \\\n  --schedule-duration-sec=30600 \\\n  --schedule-min-required-replicas=10 \\\n  --schedule-time-zone="America/Sao_Paulo"',
                },
                {
                    type: "quote",
                    value: "Sinal de utilização reage depois que a carga sobe. Pico com hora marcada pede agenda de escalonamento.",
                },
                {
                    type: "text",
                    value: "## Cura automática e atualização contínua\n\nA **cura automática** tem dois níveis. O grupo sempre recria a VM que parou, travou, foi preemptada ou foi apagada por fora do grupo: isso é reparo automático e não precisa de configuração. O segundo nível é a **verificação de integridade da aplicação**: você anexa uma health check ao grupo e, quando uma VM responde como não íntegra, o grupo **apaga e recria** aquela VM.\n\nAqui mora a confusão que a prova explora. A verificação de integridade do balanceador de carga só desvia tráfego da VM doente, e a instância continua existindo. A verificação de integridade da cura automática destrói a instância. Por isso a documentação recomenda que a health check da cura seja mais conservadora que a do balanceador, com limiar de falha mais alto, e que o `--initial-delay` cubra todo o tempo de inicialização da aplicação. Delay curto demais produz o pior cenário possível: um grupo que recria VMs sem parar porque elas nunca terminam de subir.\n\nA **atualização contínua** entra quando você quer trocar o modelo de instância da frota. O comando `rolling-action start-update` aponta o grupo para o modelo novo, e duas flags controlam o estrago: `--max-surge` diz quantas VMs a mais do que o tamanho alvo o grupo pode criar antes de remover as antigas, e `--max-unavailable` diz quantas VMs podem ficar fora do ar ao mesmo tempo. As duas aceitam número ou porcentagem, e valem 1 por padrão no grupo zonal.\n\nO tipo da atualização também é escolha sua. No tipo **proativo**, o grupo sai aplicando o modelo novo às VMs existentes por conta própria. No tipo **oportunista**, ele só aplica quando você manda, ou quando cria uma VM por outro motivo, como um evento de autoscaling. Oportunista é o jeito de empurrar uma mudança sem janela de manutenção, aceitando que a frota fique com duas versões por um tempo. E se você informar dois modelos com percentual, o grupo faz atualização canário, testando o novo em uma fração das instâncias.",
                },
                {
                    type: "code",
                    value: "gcloud compute health-checks create http hc-web \\\n  --port=80 \\\n  --request-path=/healthz \\\n  --check-interval=30s \\\n  --timeout=10s \\\n  --healthy-threshold=1 \\\n  --unhealthy-threshold=3\n\ngcloud compute instance-groups managed update mig-web \\\n  --region=southamerica-east1 \\\n  --health-check=hc-web \\\n  --initial-delay=300\n\ngcloud compute instance-groups managed rolling-action start-update mig-web \\\n  --region=southamerica-east1 \\\n  --version=template=projects/ensinadev-prod/regions/southamerica-east1/instanceTemplates/modelo-web-v2 \\\n  --max-surge=3 \\\n  --max-unavailable=0",
                },
            ],
            questions: [
                {
                    statement:
                        "O que um grupo gerenciado de instâncias usa como base para criar cada VM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um modelo de instância, criado antes do grupo",
                            isCorrect: true,
                        },
                        {
                            text: "Um snapshot do disco da primeira VM do grupo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma imagem personalizada escolhida no console",
                            isCorrect: false,
                        },
                        {
                            text: "Um disco de inicialização compartilhado na zona",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre um grupo gerenciado regional e um zonal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O regional espalha as VMs por várias zonas da mesma região",
                            isCorrect: true,
                        },
                        {
                            text: "O regional espalha as VMs por várias regiões do continente",
                            isCorrect: false,
                        },
                        {
                            text: "O regional dispensa modelo de instância e verificação de saúde",
                            isCorrect: false,
                        },
                        {
                            text: "O regional só aceita autoscaling por agenda, nunca por CPU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma loja tem pico previsível de segunda a sexta, das 8h30 às 17h, e carga baixa no resto do tempo. Qual configuração de autoscaling atende o pico sem atraso de subida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma agenda de escalonamento, que garante o mínimo na janela",
                            isCorrect: true,
                        },
                        {
                            text: "A utilização média de CPU, que reage depois que o pico começa",
                            isCorrect: false,
                        },
                        {
                            text: "A capacidade de atendimento do balanceador HTTP externo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma métrica do Cloud Monitoring com alvo por instância",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um grupo gerenciado com cura automática configurada, o que acontece quando a verificação de integridade marca uma VM como não íntegra?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O grupo recria a VM, em vez de só desviar o tráfego",
                            isCorrect: true,
                        },
                        {
                            text: "O grupo desvia o tráfego e mantém a instância ligada",
                            isCorrect: false,
                        },
                        {
                            text: "O agente convidado reinicia o serviço dentro da VM",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo reduz o tamanho alvo para descontar a VM doente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um modelo de instância novo precisa ser aplicado a um grupo de 1.000 VMs, com no máximo 3 instâncias fora do ar por vez. Qual comando e flag usar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "`rolling-action start-update` com `--max-unavailable=3`",
                            isCorrect: true,
                        },
                        {
                            text: "`rolling-action start-update` com `--max-surge=3`",
                            isCorrect: false,
                        },
                        {
                            text: "`managed set-autoscaling` com `--min-num-replicas=3`",
                            isCorrect: false,
                        },
                        {
                            text: "`managed recreate-instances` com três instâncias por vez",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Spot VMs, reservas e manutenção",
            blocks: [
                {
                    type: "text",
                    value: "Três assuntos diferentes respondem à mesma pergunta: quanta garantia de que a sua VM continua de pé você está disposto a pagar. Na ponta barata está a **VM Spot**, que você pode perder a qualquer momento. Na ponta caríssima está a **reserva**, que paga capacidade parada só para ter certeza de que ela estará lá. No meio fica a **política de disponibilidade**, que decide o que acontece com uma VM comum quando o Google precisa mexer no host embaixo dela.\n\nNa prova esses três temas chegam como cenário de custo ou de disponibilidade. A decisão sempre sai da mesma pergunta: essa carga tolera ser interrompida?",
                },
                {
                    type: "text",
                    value: "## VM Spot\n\nA **VM Spot** é capacidade sobrando do Google vendida com desconto que chega perto de 91 por cento em muitos tipos de máquina, GPU, TPU e SSD local. O que você entrega em troca está em três limites.\n\nO Compute Engine pode **retomar a capacidade a qualquer momento**, e isso se chama preempção. A VM Spot **não tem SLA** e fica fora do SLA do Compute Engine. E ela não faz migração em tempo real nem reinício automático em evento de host.\n\nA preempção segue um roteiro que vale conhecer. O serviço grava `preempted=TRUE` nos metadados da instância, respeita o período de aviso que você configurou, envia o sinal de desligamento suave e dá até cerca de 30 segundos para o sistema encerrar antes do desligamento forçado. O **período de aviso de preempção** é configurável em 0 segundos, que é o padrão, ou 120 segundos, recomendado para quem precisa de tempo dedicado para salvar o progresso. No fim, a **ação de término** decide o destino: `STOP`, o padrão, para a VM e deixa o disco de pé para você ligar de novo; `DELETE` apaga a instância.\n\nUm detalhe histórico que a prova cobra: a antiga **VM preemptiva**, criada com `--preemptible`, morria em até 24 horas mesmo sem preempção. A VM Spot é a geração seguinte e **não tem tempo máximo de vida**, o que a torna aceitável até para serviço de longa duração que tolere reinício.",
                },
                {
                    type: "code",
                    value: 'gcloud compute instances create lote-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-standard-8 \\\n  --provisioning-model=SPOT \\\n  --instance-termination-action=STOP \\\n  --metadata-from-file=shutdown-script=salva-progresso.sh\n\ngcloud compute instances describe lote-1 \\\n  --zone=southamerica-east1-a \\\n  --format="value(scheduling.provisioningModel, scheduling.instanceTerminationAction)"',
                },
                {
                    type: "table",
                    value: '[["Modelo", "Garantia", "Tempo de vida", "Para que serve"], ["Padrão", "SLA do Compute Engine e migração em tempo real", "Sem limite", "Qualquer carga que precise ficar de pé"], ["Spot", "Nenhuma, preempção a qualquer momento e sem SLA", "Sem limite", "Lote, renderização, worker que lê de fila"], ["Preemptiva (antiga)", "Nenhuma, preempção a qualquer momento", "Até 24 horas", "Nada novo, foi substituída pela Spot"]]',
                },
                {
                    type: "text",
                    value: "## Que carga cabe em Spot\n\nA regra é simples: cabe em Spot a carga que pode ser interrompida e retomada sem ninguém perceber. Processamento em lote que salva ponto de controle, renderização por quadro, transcodificação, treino que grava checkpoint, pipeline de integração contínua, worker sem estado que consome uma fila e devolve a mensagem quando morre.\n\nNão cabe em Spot o que não pode cair: banco de dados, o nó que recebe o tráfego do cliente, servidor de licença, controlador de cluster, qualquer coisa com estado local que ninguém reconstrói.\n\nDuas combinações aparecem muito em questão. A primeira é **Spot dentro de grupo gerenciado**: o grupo recria a VM preemptada assim que houver capacidade, o que dá à frota uma resiliência que a instância solta não tem. A segunda é **frota mista**: o piso de VMs padrão garante o atendimento mínimo, e as VMs Spot absorvem o excedente mais barato.\n\nE o cuidado que todo mundo esquece: escreva um script de desligamento. Com a ação `STOP`, o disco sobrevive, mas o que estava só na memória vai junto com a instância.",
                },
                {
                    type: "quote",
                    value: "Spot troca garantia por desconto. Se perder a VM no meio do trabalho estraga o resultado, não é carga para Spot.",
                },
                {
                    type: "text",
                    value: "## Reservas: pagar para ter certeza da capacidade\n\nZona não é um poço sem fundo. Quando o tipo de máquina que você quer não tem capacidade livre na zona, a criação falha com erro de recurso esgotado. A **reserva** resolve isso na raiz: ela separa capacidade de um tipo de máquina, em uma zona, e mantém essa capacidade disponível para você até você apagar a reserva.\n\nO preço dessa certeza é direto: você **paga a capacidade reservada pela tarifa sob demanda enquanto a reserva existir**, consumida ou não. Reserva ociosa é dinheiro saindo, e é por isso que ela é ferramenta de crescimento planejado, migração e recuperação de desastre, não escolha padrão.\n\nA reserva é sempre **zonal**, e a VM só consome uma reserva cuja zona e cuja configuração batem com a dela. O consumo tem dois modos:\n\n- **Consumida automaticamente**: é o padrão. Qualquer VM compatível que suba naquela zona encaixa na reserva, porque a afinidade dela é `ANY_RESERVATION`.\n- **Especificamente direcionada**: criada com `--require-specific-reservation`, ela só aceita VM que a chama pelo nome, com `--reservation-affinity=specific` e `--reservation`. É o jeito de garantir que a capacidade separada para um time não seja consumida por outro.\n\nReserva e **desconto por compromisso de uso** são coisas diferentes que andam juntas: o compromisso dá desconto pelo prazo, a reserva garante a capacidade, e você pode anexar uma reserva a um compromisso baseado em recurso para pagar menos pela capacidade que ficou separada.",
                },
                {
                    type: "code",
                    value: "gcloud compute reservations create reserva-fechamento \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-standard-8 \\\n  --vm-count=10 \\\n  --require-specific-reservation\n\ngcloud compute reservations describe reserva-fechamento \\\n  --zone=southamerica-east1-a\n\ngcloud compute instances create relatorio-1 \\\n  --zone=southamerica-east1-a \\\n  --machine-type=n2-standard-8 \\\n  --reservation-affinity=specific \\\n  --reservation=reserva-fechamento",
                },
                {
                    type: "text",
                    value: "## Política de disponibilidade e manutenção do host\n\nO Google atualiza e conserta a infraestrutura embaixo das suas VMs sem avisar você caso a caso. Como a sua instância reage a esse evento é a **política de disponibilidade**, e ela tem dois campos.\n\nO **comportamento na manutenção do host**, campo `onHostMaintenance`, tem dois valores. `MIGRATE`, o padrão da maioria dos tipos de máquina, faz **migração em tempo real**: a instância é movida para outro host sem ser desligada, podendo sentir uma queda temporária de desempenho, mas sem reiniciar. `TERMINATE` encerra a instância no evento, com um sinal de desligamento suave e cerca de 60 segundos para o sistema fechar direito.\n\nO **reinício automático**, campo `automaticRestart`, liga ou desliga o religamento da instância depois de uma falha de host ou de um encerramento causado pela manutenção. Ele nunca religa uma instância que você mesmo parou.\n\nE a parte que vira pegadinha: migração em tempo real não existe para todo mundo. Instância com GPU ou TPU, VM Spot ou preemptiva, instância de metal puro e Confidential VM não migram, elas encerram. Em VM da série E2, e em VM Spot, você também não pode trocar o comportamento de manutenção. Quando a carga não aceita nem a queda de desempenho da migração nem o encerramento, a resposta não é a política de disponibilidade: é um grupo gerenciado regional, que troca a instância insubstituível por uma frota descartável.",
                },
                {
                    type: "code",
                    value: 'gcloud compute instances set-scheduling banco-1 \\\n  --zone=southamerica-east1-a \\\n  --maintenance-policy=TERMINATE \\\n  --restart-on-failure\n\ngcloud compute instances set-scheduling banco-1 \\\n  --zone=southamerica-east1-a \\\n  --no-restart-on-failure\n\ngcloud compute instances describe banco-1 \\\n  --zone=southamerica-east1-a \\\n  --format="value(scheduling.onHostMaintenance, scheduling.automaticRestart)"',
                },
            ],
            questions: [
                {
                    statement:
                        "Qual flag do comando `gcloud compute instances create` faz a instância nascer como VM Spot?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "`--provisioning-model=SPOT`",
                            isCorrect: true,
                        },
                        {
                            text: "`--maintenance-policy=SPOT`",
                            isCorrect: false,
                        },
                        {
                            text: "`--instance-termination-action=SPOT`",
                            isCorrect: false,
                        },
                        {
                            text: "`--reservation-affinity=spot`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma VM Spot foi criada com `--instance-termination-action=STOP`. O que acontece com ela na preempção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É parada e pode ser iniciada de novo mais tarde",
                            isCorrect: true,
                        },
                        {
                            text: "É apagada junto com o disco de inicialização",
                            isCorrect: false,
                        },
                        {
                            text: "Migra em tempo real para outro host da zona",
                            isCorrect: false,
                        },
                        {
                            text: "Continua rodando até o fim do trabalho que já começou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time criou uma reserva de dez VMs em uma zona e não subiu nenhuma instância no mês. O que aparece na fatura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A capacidade reservada é cobrada enquanto a reserva existir",
                            isCorrect: true,
                        },
                        {
                            text: "Nada é cobrado, porque nenhuma instância consumiu a reserva",
                            isCorrect: false,
                        },
                        {
                            text: "Só a parcela de disco da reserva entra na fatura do mês",
                            isCorrect: false,
                        },
                        {
                            text: "A cobrança começa na primeira VM que consumir a reserva",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma reserva foi criada com `--require-specific-reservation`. Como uma instância nova consome essa capacidade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com `--reservation-affinity=specific` mais a flag `--reservation`",
                            isCorrect: true,
                        },
                        {
                            text: "Com `--reservation-affinity=any`, que acha qualquer reserva livre",
                            isCorrect: false,
                        },
                        {
                            text: "Sem flag nenhuma, porque reserva direcionada é o padrão da zona",
                            isCorrect: false,
                        },
                        {
                            text: "Com `--reservation-affinity=none`, que ignora o filtro da reserva",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma instância precisa atravessar um evento de manutenção do host sem reiniciar. O que configurar, e qual limite respeitar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comportamento MIGRATE, que não vale para VM Spot nem com GPU",
                            isCorrect: true,
                        },
                        {
                            text: "Comportamento TERMINATE com o reinício automático ligado",
                            isCorrect: false,
                        },
                        {
                            text: "Reinício automático desligado, para evitar a troca de host",
                            isCorrect: false,
                        },
                        {
                            text: "Reserva específica na zona, que bloqueia evento de manutenção",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Conectar, inventariar e gerenciar com OS Login e VM Manager",
            blocks: [
                {
                    type: "text",
                    value: "Criar a instância é a parte fácil. O trabalho de verdade começa depois, e ele se divide em três perguntas que a prova faz de várias formas.\n\n- **Quem entra nessa VM, e como eu tiro o acesso de alguém que saiu do time?**\n- **O que exatamente está instalado nas minhas 300 VMs, e qual delas está com pacote vulnerável?**\n- **Como eu aplico correção de segurança na frota sem abrir sessão em cada máquina?**\n\nA primeira pergunta é resolvida pelo **OS Login**, com apoio do **encaminhamento TCP do IAP** quando a VM não tem endereço externo. As duas últimas são resolvidas pelo **VM Manager**. Nenhuma das três se resolve com chave SSH espalhada em metadados.",
                },
                {
                    type: "text",
                    value: "## Chave em metadados contra OS Login\n\nO modelo de metadados coloca a chave pública na chave `ssh-keys`, no projeto ou na instância, e o agente convidado escreve essa chave no arquivo `authorized_keys` da VM. Funciona, mas o controle é frágil em três pontos: a chave não expira, revogar acesso significa editar metadados em cada lugar onde a chave foi publicada, e descobrir quem tem acesso significa ler metadados em vez de ler uma política.\n\nO **OS Login** inverte a lógica. Ele associa a conta Linux ao identificador do Google da pessoa, cuida do ciclo de vida dessa conta Linux sozinho e passa a decisão de acesso para o IAM. Para ligar, basta o metadado `enable-oslogin=TRUE`, no projeto para valer em todas as VMs ou na instância para valer em uma. E atenção ao efeito colateral que a prova adora: ao receber esse metadado, o Compute Engine **apaga o `authorized_keys` da VM e passa a ignorar as chaves SSH dos metadados**. Os dois modelos não convivem na mesma instância.\n\nOs papéis que entram na conversa:\n\n- `roles/compute.osLogin`: acesso por SSH **sem** `sudo`.\n- `roles/compute.osAdminLogin`: acesso por SSH **com** `sudo`.\n- `roles/compute.osLoginExternalUser`: para quem vem de outra organização, e precisa ser concedido **no nó da organização** por um administrador dela.\n\nTrês detalhes de borda que separam quem estudou de quem decorou. Para entrar pelo console ou pela CLI, o papel precisa estar no projeto, ou a pessoa precisa de outro papel com a permissão `compute.projects.get`. Se a VM tem conta de serviço anexada, quem conecta também precisa de `roles/iam.serviceAccountUser` sobre essa conta. E a verificação em duas etapas vem do metadado `enable-oslogin-2fa=TRUE`, que só vale junto com `enable-oslogin=TRUE` e exige a verificação em duas etapas configurada na conta Google.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Chave SSH em metadados", "OS Login"], ["Onde vive o acesso", "Chave `ssh-keys` no projeto ou na instância", "Política do IAM sobre projeto ou instância"], ["Como se concede", "Publicando a chave pública nos metadados", "Concedendo `roles/compute.osLogin` ao principal"], ["Como se revoga", "Editando os metadados em cada lugar", "Removendo a concessão do IAM"], ["Acesso com sudo", "Depende do que já existe dentro da VM", "Papel `roles/compute.osAdminLogin`"], ["Verificação em duas etapas", "Não existe", "Metadado `enable-oslogin-2fa=TRUE`"], ["Como ligar", "Metadado `ssh-keys`", "Metadado `enable-oslogin=TRUE`"]]',
                },
                {
                    type: "code",
                    value: 'gcloud compute project-info add-metadata \\\n  --metadata=enable-oslogin=TRUE\n\ngcloud projects add-iam-policy-binding ensinadev-prod \\\n  --member="group:plataforma@ensinadev.com.br" \\\n  --role="roles/compute.osLogin"\n\ngcloud projects add-iam-policy-binding ensinadev-prod \\\n  --member="user:ana@ensinadev.com.br" \\\n  --role="roles/compute.osAdminLogin"\n\ngcloud compute os-login ssh-keys list\ngcloud compute os-login describe-profile',
                },
                {
                    type: "text",
                    value: "## Chegar na VM que não tem IP externo\n\nA recomendação de segurança é criar a instância sem endereço IP externo, com `--no-address`. Sem IP externo não existe SSH vindo da internet, e aí entra o **encaminhamento TCP do Identity-Aware Proxy**, o IAP. Ele cria um túnel do seu cliente até a porta da VM passando pela infraestrutura do Google, com autorização do IAM, sem abrir nada para a internet.\n\nTrês peças fazem o IAP funcionar, e a questão de prova quase sempre esconde a falta de uma delas.\n\nA **regra de firewall** precisa permitir entrada da faixa `35.235.240.0/20`, que concentra todos os endereços que o IAP usa para encaminhamento TCP, na porta 22 para SSH ou 3389 para RDP. Para VM com IPv6, a faixa é `2600:2d00:1:7::/64`.\n\nO **papel** `roles/iap.tunnelResourceAccessor` precisa estar concedido a quem conecta, porque é ele que carrega a permissão `iap.tunnelInstances.accessViaIAP`.\n\nE o **comando** entra com `--tunnel-through-iap`. Detalhe que ajuda na prática e confunde na prova: quando a instância não tem IP externo, o `gcloud compute ssh` já usa o túnel do IAP por conta própria; a flag serve para forçar o túnel mesmo quando existe IP externo.\n\nQuando nem o IAP resolve, porque a VM não sobe a rede ou o SSH está quebrado, a saída de diagnóstico é o **console serial**, que vem desabilitado e precisa do metadado `serial-port-enable=TRUE`. Ele serve para ver o que o sistema reclama no arranque, não para operar a máquina no dia a dia.",
                },
                {
                    type: "code",
                    value: 'gcloud compute firewall-rules create permite-ssh-do-iap \\\n  --network=vpc-prod \\\n  --direction=INGRESS \\\n  --action=allow \\\n  --rules=tcp:22 \\\n  --source-ranges=35.235.240.0/20\n\ngcloud projects add-iam-policy-binding ensinadev-prod \\\n  --member="group:plataforma@ensinadev.com.br" \\\n  --role="roles/iap.tunnelResourceAccessor"\n\ngcloud compute ssh app-1 \\\n  --zone=southamerica-east1-a \\\n  --tunnel-through-iap\n\ngcloud compute connect-to-serial-port app-1 \\\n  --zone=southamerica-east1-a',
                },
                {
                    type: "quote",
                    value: "Chave em metadados é acesso sem dono. OS Login é acesso com papel do IAM, que se revoga em um comando.",
                },
                {
                    type: "text",
                    value: "## VM Manager: parar de entrar na VM para administrar a VM\n\nCom acesso resolvido, sobra a administração do sistema operacional em escala. O **VM Manager** é o conjunto de serviços que faz isso sem sessão interativa, e ele tem exatamente três partes. Guarde os três nomes, porque a questão costuma pedir qual deles resolve um cenário.\n\n- **Inventário do SO**: coleta e deixa consultável a informação do sistema de cada VM, com arquitetura, nome e versão do SO, versão do kernel, pacotes instalados e atualizações disponíveis. A varredura roda a cada 10 minutos por padrão.\n- **Configuração do SO**, as políticas de SO: instala, remove e mantém atualizado pacote, repositório, arquivo e recurso definido por script, e reporta o **estado de conformidade** de cada VM.\n- **Gerenciamento de patch**: aplica correção sob demanda ou em agenda, e entrega relatório de conformidade de patch da frota.\n\nOs requisitos são curtos, e são eles que explicam a maioria das falhas. A API `osconfig.googleapis.com` precisa estar habilitada no projeto. O **agente OS Config** precisa estar na VM, e ele já vem instalado nas imagens públicas de Debian, Ubuntu, RHEL, Rocky Linux, SLES, CentOS, Container-Optimized OS e Windows Server. O metadado `enable-osconfig=TRUE` precisa estar no projeto ou na instância. Toda VM precisa ter uma **conta de serviço anexada**, e aqui está a parte que surpreende: você não precisa conceder papel nenhum a essa conta, ela só precisa existir. E se a VM não tem saída para a internet, o **Acesso privado do Google** precisa estar ligado na sub-rede, senão o agente não alcança o serviço.",
                },
                {
                    type: "text",
                    value: "## Conformidade e patch na prática\n\nA **política de SO** é um arquivo declarativo: você descreve o estado que quer, e não os passos para chegar lá. A política vai para uma **atribuição de política de SO**, que escolhe as VMs alvo por zona, por rótulo, por nome do SO no inventário, e define o ritmo de implantação. Cada política roda em um de dois modos: **validação**, que só verifica e reporta, e **aplicação**, que verifica e corrige o que estiver fora do estado desejado. Comece sempre em validação em um ambiente novo, porque política em modo de aplicação mexe em pacote de produção.\n\nO **patch** tem dois formatos. O **trabalho de patch** sob demanda roda agora, sobre um filtro de instâncias, com duração máxima e política de reinício definidas no comando. A **implantação de patch** é a versão agendada, criada a partir de um arquivo YAML com a recorrência, e é a resposta certa quando a questão fala de janela mensal de correção.\n\nFechando o módulo, o roteiro que o guia do exame pede e que agora você tem inteiro: subir a instância com o tipo e o disco certos, guardar a cópia com snapshot e padronizar a frota com imagem personalizada, escalar e curar com grupo gerenciado a partir de um modelo de instância, economizar com Spot onde a interrupção não dói, entrar com OS Login e IAP em vez de chave solta, e administrar o sistema operacional com VM Manager em vez de SSH.",
                },
                {
                    type: "code",
                    value: 'gcloud services enable osconfig.googleapis.com\n\ngcloud compute project-info add-metadata \\\n  --metadata=enable-osconfig=TRUE\n\ngcloud compute os-config inventories list \\\n  --location=southamerica-east1-a \\\n  --view=full\n\ngcloud compute os-config inventories describe app-1 \\\n  --location=southamerica-east1-a \\\n  --view=full\n\ngcloud compute os-config os-policy-assignments create instala-agentes \\\n  --location=southamerica-east1-a \\\n  --file=politica-agentes.yaml\n\ngcloud compute os-config patch-jobs execute \\\n  --instance-filter-name-prefixes="app-" \\\n  --duration="1h30m" \\\n  --reboot-config="DEFAULT"\n\ngcloud compute os-config patch-deployments create patch-mensal \\\n  --file=patch-mensal.yaml',
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece com as chaves SSH guardadas nos metadados quando o OS Login é ativado em uma VM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Passam a ser ignoradas pelo agente convidado da instância",
                            isCorrect: true,
                        },
                        {
                            text: "Continuam valendo em paralelo com as contas criadas pelo OS Login",
                            isCorrect: false,
                        },
                        {
                            text: "São importadas para o perfil do OS Login de cada pessoa",
                            isCorrect: false,
                        },
                        {
                            text: "Passam a exigir verificação em duas etapas a cada acesso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pessoa precisa acessar as VMs por SSH com permissão de `sudo`, usando OS Login. Qual papel conceder?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "`roles/compute.osAdminLogin`",
                            isCorrect: true,
                        },
                        {
                            text: "`roles/compute.osLogin`",
                            isCorrect: false,
                        },
                        {
                            text: "`roles/compute.osLoginExternalUser`",
                            isCorrect: false,
                        },
                        {
                            text: "`roles/iap.tunnelResourceAccessor`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma VM sem endereço IP externo precisa receber SSH pelo encaminhamento TCP do IAP. Qual faixa de origem a regra de firewall deve liberar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "35.235.240.0/20",
                            isCorrect: true,
                        },
                        {
                            text: "130.211.0.0/22",
                            isCorrect: false,
                        },
                        {
                            text: "35.191.0.0/16",
                            isCorrect: false,
                        },
                        {
                            text: "199.36.153.8/30",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são os três serviços que formam o VM Manager?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Inventário do SO, política de SO e gerenciamento de patch",
                            isCorrect: true,
                        },
                        {
                            text: "Inventário do SO, registro de imagens e cópia de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Métrica do SO, registro de auditoria e verificação de saúde",
                            isCorrect: false,
                        },
                        {
                            text: "Inventário de rede, política de firewall e gestão de chave",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O agente OS Config está instalado nas VMs, mas o inventário do sistema operacional não aparece para nenhuma delas. Qual requisito provavelmente falta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A API do OS Config habilitada e o metadado `enable-osconfig`",
                            isCorrect: true,
                        },
                        {
                            text: "O papel `roles/compute.osAdminLogin` na conta de serviço da VM",
                            isCorrect: false,
                        },
                        {
                            text: "Uma regra de firewall liberando a faixa `35.235.240.0/20`",
                            isCorrect: false,
                        },
                        {
                            text: "Uma implantação de patch agendada para as VMs do projeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Contêineres: GKE, Cloud Run e funções",
    aulas: [
        {
            titulo: "Imagens de contêiner e Artifact Registry",
            blocks: [
                {
                    type: "text",
                    value: "Um contêiner não é uma máquina virtual pequena. Ele é um processo isolado que carrega o próprio sistema de arquivos, e esse sistema de arquivos vem de uma **imagem**: um pacote somente leitura com o código, as bibliotecas e o ponto de entrada da aplicação.\n\nPara o Google Cloud rodar a sua aplicação, essa imagem precisa estar em um registro que ele alcance. Esse registro é o **Artifact Registry**. A ordem de trabalho é sempre a mesma: construir a imagem, marcar com o nome completo do repositório, enviar, e só então implantar no GKE ou no Cloud Run. Pular a etapa do registro é a causa mais comum de pod parado esperando uma imagem que nunca chega.",
                },
                {
                    type: "text",
                    value: "## O Container Registry saiu de cena\n\nPor muitos anos o registro padrão foi o **Container Registry**, com endereços no formato `gcr.io/PROJETO/IMAGEM`. Ele **foi desativado**: a documentação registra que, desde 18 de março de 2025, o Container Registry está encerrado e gravar imagens nele não é mais possível. Material antigo de estudo ainda ensina `gcr.io`, e em prova isso é resposta errada.\n\nO Artifact Registry não é só uma troca de nome. Ele guarda **vários formatos** no mesmo serviço: imagens de contêiner, pacotes Maven, npm, Python, Go e repositórios apt e yum. E organiza tudo em **repositórios**, cada um criado em um local (uma região ou uma multirregião) e com um formato declarado na criação.",
                },
                {
                    type: "text",
                    value: "## O repositório tem endereço, e o endereço tem região\n\nRepositório é recurso de local: você escolhe a região (ou a multirregião) na criação e ela não muda depois. Essa escolha aparece no nome do host que o Docker vai usar: `southamerica-east1-docker.pkg.dev`, `us-central1-docker.pkg.dev`, e assim por diante.\n\nNa prática, coloque o repositório **na mesma região** do cluster ou do serviço que vai baixar a imagem. Isso reduz o tempo de download no momento em que a carga está escalando, que é justamente o pior momento para esperar, e evita tráfego saindo de região. Um repositório guarda muitas imagens, e cada imagem guarda muitas versões, então não é preciso um repositório por aplicação.",
                },
                {
                    type: "code",
                    value: 'gcloud artifacts repositories create loja \\\n  --repository-format=docker \\\n  --location=southamerica-east1 \\\n  --description="Imagens das aplicações da loja"',
                },
                {
                    type: "text",
                    value: "## Autenticar o Docker no repositório\n\nO Docker não sabe conversar com o IAM do Google. Quem traduz é um **auxiliar de credencial**, instalado por `gcloud auth configure-docker`. O comando grava a configuração na seção `credHelpers` do arquivo `~/.docker/config.json`, e a partir daí cada `docker push` ou `docker pull` pede um token ao gcloud, usando a identidade de quem está logado.\n\nO detalhe que derruba gente na prática: o comando recebe **uma lista de hosts**, separados por vírgula. Autenticar `southamerica-east1-docker.pkg.dev` não habilita `us-central1-docker.pkg.dev`. Se a equipe publica em duas regiões, os dois hosts entram na lista, senão o push na segunda região volta com erro de não autorizado.\n\nPara pipeline de CI com muitos hosts configurados, a documentação recomenda o auxiliar independente, mais rápido que o do gcloud. E a **chave estática de conta de serviço** aparece na documentação como a opção menos segura de todas: use token de curta duração ou a identidade da própria plataforma de build.",
                },
                {
                    type: "code",
                    value: "gcloud auth configure-docker \\\n  southamerica-east1-docker.pkg.dev,us-central1-docker.pkg.dev",
                },
                {
                    type: "text",
                    value: "## O nome completo da imagem\n\nTodo o resto da trilha depende de você ler esse nome sem hesitar. O formato é `LOCAL-docker.pkg.dev/PROJETO/REPOSITORIO/IMAGEM:TAG`, com quatro partes em ordem: o host com o local, o ID do projeto, o repositório e a imagem.\n\nA `TAG` é um apelido móvel: `1.0` hoje pode apontar para um conteúdo e amanhã para outro, se alguém publicar de novo com a mesma tag. Quando a rastreabilidade importa, referencie a imagem pelo **digest**, no formato `IMAGEM@sha256:...`, que é o resumo do conteúdo e não se move.\n\nSe a máquina de quem publica não tem Docker, ou se você quer que o build rode no Google Cloud, o `gcloud builds submit --tag` envia o diretório com o `Dockerfile` para o Cloud Build, que constrói e já publica a imagem no repositório indicado.",
                },
                {
                    type: "code",
                    value: "docker tag loja-web:1.0 \\\n  southamerica-east1-docker.pkg.dev/meu-projeto/loja/loja-web:1.0\ndocker push \\\n  southamerica-east1-docker.pkg.dev/meu-projeto/loja/loja-web:1.0",
                },
                {
                    type: "table",
                    value: '[["Papel predefinido","O que ele permite"],["roles/artifactregistry.reader","Ver e baixar artefatos, ler metadados do repositório"],["roles/artifactregistry.writer","Ler e gravar artefatos"],["roles/artifactregistry.repoAdmin","Ler, gravar e excluir artefatos"],["roles/artifactregistry.admin","Criar e gerenciar repositórios e artefatos"]]',
                },
                {
                    type: "quote",
                    value: "Quem baixa imagem precisa de leitor, quem publica precisa de gravador, e quem apaga versão precisa de administrador do repositório.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual serviço do Google Cloud guarda imagens de contêiner hoje, depois do encerramento do registro anterior?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Artifact Registry, que guarda imagens e outros formatos de pacote",
                            isCorrect: true,
                        },
                        {
                            text: "Container Registry, que segue como registro padrão de imagem de contêiner",
                            isCorrect: false,
                        },
                        {
                            text: "Cloud Source Repositories, que versiona o código e as imagens",
                            isCorrect: false,
                        },
                        {
                            text: "Cloud Storage, com um bucket por projeto no formato gcr.io",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você criou um repositório Docker em southamerica-east1 e precisa preparar a sua estação para enviar imagens. Qual comando configura o Docker para autenticar nesse host?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "gcloud auth configure-docker southamerica-east1-docker.pkg.dev",
                            isCorrect: true,
                        },
                        {
                            text: "gcloud auth login --enable-docker southamerica-east1-docker.pkg.dev",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud artifacts docker login --location=southamerica-east1",
                            isCorrect: false,
                        },
                        {
                            text: "docker login southamerica-east1-docker.pkg.dev --token-from-gcloud",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O repositório `loja` está em `southamerica-east1`, no projeto `meu-projeto`, e a imagem se chama `loja-web` na versão `1.0`. Qual é o nome completo correto da imagem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "southamerica-east1-docker.pkg.dev/meu-projeto/loja/loja-web:1.0",
                            isCorrect: true,
                        },
                        {
                            text: "southamerica-east1-docker.pkg.dev/loja/meu-projeto/loja-web:1.0",
                            isCorrect: false,
                        },
                        {
                            text: "docker.pkg.dev/southamerica-east1/meu-projeto/loja/loja-web:1.0",
                            isCorrect: false,
                        },
                        {
                            text: "meu-projeto.southamerica-east1.pkg.dev/loja/loja-web:1.0",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A equipe publicava imagens em um repositório de southamerica-east1 e abriu um segundo repositório em us-central1 para atender outra região. O push na região antiga continua funcionando, mas na nova volta erro de não autorizado, com a mesma conta e as mesmas permissões do IAM. Qual é a causa mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O host da nova região não entrou na lista do auxiliar de credencial do Docker",
                            isCorrect: true,
                        },
                        {
                            text: "O repositório novo precisa ser criado com o mesmo formato do repositório antigo",
                            isCorrect: false,
                        },
                        {
                            text: "O token do gcloud só vale para a região configurada na propriedade do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "A imagem precisa ser marcada com o digest, e não com a tag, fora da região de origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O pipeline de integração contínua precisa enviar imagens novas para um repositório do Artifact Registry, sem poder apagar versões já publicadas. Qual papel predefinido atende a esse pedido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "roles/artifactregistry.writer",
                            isCorrect: true,
                        },
                        {
                            text: "roles/artifactregistry.reader",
                            isCorrect: false,
                        },
                        {
                            text: "roles/artifactregistry.repoAdmin",
                            isCorrect: false,
                        },
                        {
                            text: "roles/artifactregistry.admin",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Criar um cluster GKE: Standard, Autopilot, regional e privado",
            blocks: [
                {
                    type: "text",
                    value: "O Kubernetes resolve um problema chato: você declara o estado desejado da aplicação, e um conjunto de controladores trabalha sem parar para que a realidade se pareça com a declaração. Quem executa esses controladores, o servidor da API e o agendador é o **plano de controle**.\n\nNo **Google Kubernetes Engine** o plano de controle é gerenciado pelo Google. Você não entra nessas máquinas nem atualiza o servidor da API na mão. O que você escolhe na criação do cluster são duas coisas que ficam difíceis de desfazer depois: o **modo** (quem cuida dos nós) e a **topologia** (onde o plano de controle e os nós ficam).",
                },
                {
                    type: "text",
                    value: "## Autopilot ou Standard\n\nNo modo **Autopilot**, o GKE gerencia a infraestrutura do cluster, incluindo os nós e a escala. Você entrega um manifesto com o que o pod precisa, e o GKE providencia capacidade. Não há node pool para administrar, o autoescalador vertical já vem ligado e os nós nascem com as práticas recomendadas do Google. A cobrança dos pods de uso geral é **por recurso solicitado**: CPU, memória e disco que os pods em execução pedem.\n\nNo modo **Standard**, você controla a infraestrutura e pode mudar quase tudo. Você cria node pools, escolhe o tipo de máquina, liga autoescalador em cada pool. A cobrança acompanha essa liberdade: você paga as **instâncias do Compute Engine** do node pool, ociosas ou não, porque elas existem independentemente de ter pod rodando nelas. A documentação recomenda o Autopilot para a maioria das cargas, e reserva o Standard para quem precisa de privilégio ou de configuração que o Autopilot não permite.\n\nUm ponto em que o guia do exame ficou atrás: ele cita o **GKE Enterprise** como se fosse uma edição à parte. As edições do GKE foram encerradas em setembro de 2025, e hoje o GKE é uma oferta única, sem edição nem camada. Os recursos que estavam ali continuam existindo por fora: a gestão de **frota**, que é o agrupamento lógico de clusters administrados juntos e aceita cluster em outra nuvem ou no datacenter, o **Config Sync** para configuração e política, e o **Cloud Service Mesh** para a malha de serviços. Quando uma questão falar de GKE Enterprise, é desse conjunto que ela trata.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Autopilot","Standard"],["Quem cuida dos nós","O GKE provisiona, atualiza e repara","Você define e administra os node pools"],["Base da cobrança dos pods","Recursos solicitados pelos pods em execução","Instâncias do node pool, ociosas ou não"],["Topologia possível","Sempre regional","Zonal ou regional, por escolha sua"],["Tipo de máquina","Escolhido pelo GKE a partir do manifesto","Escolhido por você em cada node pool"],["Escala de nós","Provisionamento automático já ligado","Autoescalador ligado pool por pool"]]',
                },
                {
                    type: "code",
                    value: "gcloud container clusters create-auto loja-prod \\\n  --location=southamerica-east1 \\\n  --release-channel=regular",
                },
                {
                    type: "text",
                    value: "## Regional ou zonal: onde mora o plano de controle\n\nEm um cluster **zonal**, o plano de controle vive em uma única zona. Se aquela zona cai, ou durante um upgrade do plano de controle, o servidor da API fica fora do ar: os pods que já estavam rodando continuam atendendo, mas você não consegue implantar, escalar nem contar com os controladores para substituir pod que morreu.\n\nEm um cluster **regional**, o plano de controle é replicado em várias zonas da região, e os nós também são distribuídos entre zonas. A documentação é direta no benefício: com réplicas redundantes, você acessa o plano de controle mesmo durante um upgrade. É a topologia para produção, e é a única existente no Autopilot, que é **sempre regional**.\n\nTem uma pegadinha de contagem aqui. A flag `--num-nodes` vale **por zona**, não por cluster. O node pool padrão de um cluster regional Standard nasce com nove nós, três por zona em três zonas. Se você pedir `--num-nodes=2` em um cluster regional com três zonas, recebe seis nós e a fatura de seis.",
                },
                {
                    type: "code",
                    value: "gcloud container clusters create loja-std \\\n  --location=southamerica-east1 \\\n  --num-nodes=2 \\\n  --machine-type=e2-standard-4",
                },
                {
                    type: "text",
                    value: "## Cluster privado: nó sem IP externo\n\nA flag `--enable-private-nodes` provisiona os nós **somente com endereço IP interno**. Isso reduz a superfície de ataque de forma concreta: não existe IP público para alguém varrer. E traz uma consequência que a prova adora: carga rodando em nó sem IP externo **não alcança a internet** a menos que exista NAT na rede do cluster.\n\nO acesso privado do Google na sub-rede resolve as chamadas para as APIs do Google, como baixar imagem do Artifact Registry. O que falta é a internet aberta: `apt-get update`, `npm install`, webhook para um serviço de terceiro. Para isso você cria um **Cloud NAT** na região, com um Cloud Router. O Cloud NAT só abre saída, nunca entrada, e é por isso que ele combina com cluster privado.\n\nSeparado disso está o endereço do plano de controle. Com `--enable-private-endpoint`, o acesso ao endpoint externo é desativado e você só fala com o servidor da API de dentro da rede, por VPN, Interconnect ou uma máquina de apoio. Com `--enable-master-authorized-networks` você mantém o endpoint externo, mas restringe os blocos CIDR que podem chegar nele.",
                },
                {
                    type: "code",
                    value: "gcloud container clusters create loja-privado \\\n  --location=southamerica-east1 \\\n  --enable-private-nodes \\\n  --enable-ip-alias \\\n  --enable-master-authorized-networks \\\n  --master-authorized-networks=10.10.0.0/24",
                },
                {
                    type: "code",
                    value: "gcloud compute routers create nat-router \\\n  --network=minha-vpc \\\n  --region=southamerica-east1\ngcloud compute routers nats create nat-config \\\n  --router=nat-router \\\n  --router-region=southamerica-east1 \\\n  --nat-all-subnet-ip-ranges \\\n  --auto-allocate-nat-external-ips",
                },
                {
                    type: "quote",
                    value: "Nó privado não tem IP externo, e sem IP externo não existe saída para a internet sem Cloud NAT.",
                },
            ],
            questions: [
                {
                    statement:
                        "Em um cluster do GKE no modo Autopilot, quem provisiona, atualiza e repara os nós?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O GKE, que gerencia a infraestrutura do cluster",
                            isCorrect: true,
                        },
                        {
                            text: "Você, criando um node pool para cada carga",
                            isCorrect: false,
                        },
                        {
                            text: "O autoescalador horizontal de pods do cluster",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo gerenciado de instâncias, configurado à mão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um cluster Autopilot, qual é a base de cobrança dos pods de uso geral?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os recursos de CPU, memória e disco solicitados pelos pods em execução",
                            isCorrect: true,
                        },
                        {
                            text: "As instâncias do Compute Engine que sustentam o cluster, ociosas ou não",
                            isCorrect: false,
                        },
                        {
                            text: "O número de node pools declarados no cluster, por hora de existência",
                            isCorrect: false,
                        },
                        {
                            text: "O total de requisições atendidas pelos serviços expostos do cluster",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você cria um cluster Standard regional com `--num-nodes=2`, e a região usada distribui os nós em três zonas. Quantos nós o node pool padrão terá?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Seis, porque a contagem de nós vale por zona",
                            isCorrect: true,
                        },
                        {
                            text: "Dois, porque a contagem de nós vale para o cluster",
                            isCorrect: false,
                        },
                        {
                            text: "Três, um nó por zona, ignorando o valor pedido",
                            isCorrect: false,
                        },
                        {
                            text: "Nove, porque o padrão regional sempre prevalece",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de migrar para um cluster com nós privados, os pods de build passaram a falhar ao baixar pacotes de um repositório público na internet, embora continuem baixando a imagem do Artifact Registry sem problema. O que resolve a falha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Criar um Cloud NAT na região para dar saída aos nós sem IP externo",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar o endpoint do plano de controle para privado no cluster",
                            isCorrect: false,
                        },
                        {
                            text: "Incluir o bloco CIDR do repositório nas redes autorizadas do cluster",
                            isCorrect: false,
                        },
                        {
                            text: "Dar o papel de leitor do Artifact Registry à conta de serviço dos nós",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para gastar menos em um ambiente de teste, a equipe quer um cluster Autopilot restrito a uma única zona. O que você responde?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não é possível, porque todo cluster Autopilot é regional",
                            isCorrect: true,
                        },
                        {
                            text: "É possível, passando a zona na flag de local do comando",
                            isCorrect: false,
                        },
                        {
                            text: "É possível, desde que o node pool fique com uma zona só",
                            isCorrect: false,
                        },
                        {
                            text: "Não é possível, porque o Autopilot exige o endpoint privado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Implantar e operar workloads com kubectl",
            blocks: [
                {
                    type: "text",
                    value: "Cluster criado não é aplicação no ar. O passo seguinte é declarar o que deve rodar, e quem leva essa declaração até o cluster é o **kubectl**, o cliente de linha de comando do Kubernetes. Ele não conversa com os nós: ele conversa com o **servidor da API** do plano de controle, e absolutamente tudo passa por lá.\n\nDuas peças precisam estar na sua estação. O próprio `kubectl`, instalado com `gcloud components install kubectl`, e o **gke-gcloud-auth-plugin**, que troca a credencial do gcloud por um token que o servidor da API do GKE aceita. A documentação é explícita ao dizer que você precisa instalar esse plugin para usar o kubectl com o GKE. No Cloud Shell as duas já vêm prontas, e é por isso que o laboratório funciona de primeira e a máquina do trabalho não.",
                },
                {
                    type: "text",
                    value: "## O get-credentials e o kubeconfig\n\nO kubectl não sabe nada sobre projeto, região ou IAM. Ele lê um arquivo de configuração chamado **kubeconfig**, que por padrão fica em `~/.kube/config`, ou no caminho apontado pela variável `KUBECONFIG`.\n\nO comando `gcloud container clusters get-credentials` existe exatamente para escrever nesse arquivo. Ele consulta a API do GKE e grava três coisas: uma entrada de **cluster**, com o endereço do endpoint e o certificado da autoridade certificadora; uma entrada de **usuário**, que chama o gke-gcloud-auth-plugin para obter o token; e um **contexto**, que amarra cluster e usuário e passa a ser o contexto atual. A flag de local aceita a região, para cluster regional, ou a zona, para cluster zonal.\n\nCom vários clusters você acumula vários contextos, e aí começa o risco de aplicar manifesto no ambiente errado. Vale a disciplina de conferir antes: `kubectl config get-contexts` lista, `kubectl config current-context` mostra onde você está e `kubectl config use-context` troca.",
                },
                {
                    type: "code",
                    value: "gcloud components install kubectl gke-gcloud-auth-plugin\ngcloud container clusters get-credentials loja-prod \\\n  --location=southamerica-east1",
                },
                {
                    type: "text",
                    value: "## Os objetos que você declara, e como ver o que já existe\n\n- **Pod**: a menor unidade implantável, um ou mais contêineres que compartilham rede e armazenamento. Pod é descartável: se morrer, ninguém o traz de volta sozinho.\n- **Deployment**: controla um conjunto de pods iguais e sem estado, cuida da contagem de réplicas e da atualização gradual. É o objeto da maioria das aplicações web.\n- **StatefulSet**: para pods com identidade persistente e hostname estável que o GKE mantém independentemente de onde o pod é agendado. Cada réplica tem o seu volume persistente, a criação e a exclusão são ordenadas, e ele é usado com um Service headless. É o objeto de banco de dados e fila.\n- **DaemonSet**: uma cópia por nó, típico de agente de log e de métrica.\n- **Job** e **CronJob**: tarefa que roda até terminar, uma vez ou em agenda.\n\nPara ver o inventário do que está rodando, o kubectl basta: `kubectl get nodes` lista os nós, `kubectl get pods -A` mostra os pods de todos os namespaces, `kubectl get all` traz os objetos principais do namespace atual e `kubectl describe pod NOME` abre a ficha completa, com os eventos recentes no fim. No console, a página Cargas de trabalho lista o que está implantado, e o Navegador de objetos lista os objetos de todos os clusters do projeto.",
                },
                {
                    type: "code",
                    value: "kubectl create deployment loja-web \\\n  --image=southamerica-east1-docker.pkg.dev/meu-projeto/loja/loja-web:1.0",
                },
                {
                    type: "text",
                    value: "## Expor a aplicação\n\nPod tem endereço IP, mas endereço de pod nasce e morre junto com ele. Ninguém monta integração em cima disso. Quem dá nome e endereço estáveis a um conjunto de pods, escolhidos por rótulo, é o **Service**.\n\nO tipo `ClusterIP` é o padrão: um endereço estável do cluster que clientes **de dentro** usam para alcançar os pods, e que não existe para o mundo externo. O tipo `LoadBalancer` é o oposto: ao criá-lo, um controlador do Google Cloud configura um balanceador de rede de passagem externo regional e devolve um IP público. O campo `EXTERNAL-IP` em `kubectl get service` aparece como pendente por alguns instantes até o balanceador ficar pronto.\n\nPara HTTP com roteamento por host e caminho, certificado gerenciado e um só IP para vários serviços, o caminho é um Ingress ou a Gateway API, que provisionam balanceador de aplicação. Para a prova, a dupla que resolve quase toda questão é ClusterIP para dentro e LoadBalancer para fora.",
                },
                {
                    type: "table",
                    value: '[["Tipo de Service","O que você ganha","Quando usar"],["ClusterIP","Endereço estável interno do cluster","Conversa entre serviços do mesmo cluster"],["NodePort","Uma porta fixa aberta em todos os nós","Integração de baixo nível e teste pontual"],["LoadBalancer","Balanceador de rede externo e IP público","Expor a aplicação para fora do cluster"],["ExternalName","Apelido de DNS para um nome externo","Apontar para um serviço que vive fora"]]',
                },
                {
                    type: "code",
                    value: "kubectl expose deployment loja-web \\\n  --name=loja-web-lb \\\n  --type=LoadBalancer \\\n  --port=80 \\\n  --target-port=8080",
                },
                {
                    type: "text",
                    value: "## Quando o pod fica preso em ImagePullBackOff\n\nO `kubectl get pods` mostra `ErrImagePull` e depois `ImagePullBackOff` quando o nó não consegue baixar a imagem. O `kubectl describe pod` revela o motivo real nos eventos. Para falta de permissão no Artifact Registry, a documentação lista mensagens como `failed to fetch oauth token: unexpected status: 403 Forbidden`, e a variante com 401.\n\nAqui está a parte que a prova explora: a identidade que baixa a imagem **não é a sua nem a do pod**. Quem baixa é o kubelet, usando a **conta de serviço anexada ao nó**, que por padrão é a conta de serviço padrão do Compute Engine. Esse download não passa pela federação de identidade de carga de trabalho. A correção é conceder `roles/artifactregistry.reader` à conta de serviço dos nós, de preferência no repositório e não no projeto inteiro.\n\nDois detalhes somem da memória na hora da prova. O nó também precisa de escopo de acesso compatível, `cloud-platform` ou ao menos o de leitura de armazenamento, senão o download falha mesmo com o papel correto. E, se a carga usa `imagePullSecret`, é a identidade guardada no segredo que precisa da permissão de leitura.",
                },
                {
                    type: "code",
                    value: "gcloud artifacts repositories add-iam-policy-binding loja \\\n  --location=southamerica-east1 \\\n  --member=serviceAccount:nos-gke@meu-projeto.iam.gserviceaccount.com \\\n  --role=roles/artifactregistry.reader",
                },
            ],
            questions: [
                {
                    statement: "O que o comando `gcloud container clusters get-credentials` faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Grava no kubeconfig a entrada de cluster, de usuário e o contexto atual",
                            isCorrect: true,
                        },
                        {
                            text: "Instala o kubectl e o plugin de autenticação na sua estação de trabalho",
                            isCorrect: false,
                        },
                        {
                            text: "Cria uma conta de serviço com papel de administrador do cluster e baixa a chave",
                            isCorrect: false,
                        },
                        {
                            text: "Abre um túnel de rede entre a sua estação e o plano de controle do cluster",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma aplicação precisa de hostname estável por réplica, volume persistente próprio e criação ordenada dos pods. Qual objeto do Kubernetes atende a esse perfil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "StatefulSet",
                            isCorrect: true,
                        },
                        {
                            text: "Deployment",
                            isCorrect: false,
                        },
                        {
                            text: "DaemonSet",
                            isCorrect: false,
                        },
                        {
                            text: "ReplicationController",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um Deployment já roda no cluster e precisa receber requisições da internet, com um endereço IP público. Qual tipo de Service você cria?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "LoadBalancer",
                            isCorrect: true,
                        },
                        {
                            text: "ClusterIP",
                            isCorrect: false,
                        },
                        {
                            text: "ExternalName",
                            isCorrect: false,
                        },
                        {
                            text: "Headless",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Os pods de um Deployment novo ficam em ImagePullBackOff, e o describe mostra erro de token com status 403 ao buscar a imagem em um repositório do Artifact Registry do mesmo projeto. Qual é a correção correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Conceder o papel de leitor do Artifact Registry à conta de serviço dos nós",
                            isCorrect: true,
                        },
                        {
                            text: "Conceder o papel de leitor do Artifact Registry ao usuário que implantou",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar o gcloud auth configure-docker dentro de cada nó do node pool do cluster",
                            isCorrect: false,
                        },
                        {
                            text: "Conceder o papel de desenvolvedor do GKE à conta de serviço do plano de controle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você tem credenciais de três clusters no mesmo kubeconfig e quer confirmar em qual deles o próximo comando vai agir. Qual comando responde isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "kubectl config current-context",
                            isCorrect: true,
                        },
                        {
                            text: "kubectl cluster-info dump --all",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud container clusters list",
                            isCorrect: false,
                        },
                        {
                            text: "kubectl get nodes --show-labels",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escalar no GKE: HPA, VPA e autoescalador de cluster",
            blocks: [
                {
                    type: "text",
                    value: "Escalar no Kubernetes tem duas dimensões, e quem mistura as duas erra questão de prova e erra na operação. A primeira dimensão é a **carga**: quantos pods existem e quanto cada pod pede de CPU e memória. A segunda é a **infraestrutura**: quantos nós existem para abrigar esses pods.\n\nSão quatro mecanismos distintos, e eles trabalham em sequência. O autoescalador horizontal cria réplicas, o vertical ajusta o tamanho de cada pod, o autoescalador de cluster acrescenta nós quando não cabe mais nada, e o provisionamento automático cria um node pool novo quando nenhum dos existentes serve.",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","O que ele muda","Onde ele é ligado"],["Autoescalador horizontal de pods","A quantidade de réplicas da carga","Objeto HorizontalPodAutoscaler"],["Autoescalador vertical de pods","A requisição de CPU e memória do contêiner","Objeto VerticalPodAutoscaler"],["Autoescalador de cluster","A quantidade de nós de um node pool","Flag de autoescalonamento no node pool"],["Provisionamento automático de nós","Os próprios node pools, criados e removidos","Flag de autoprovisionamento no cluster"]]',
                },
                {
                    type: "text",
                    value: "## Autoescalador horizontal de pods\n\nO **HPA** observa uma métrica e muda a contagem de réplicas do Deployment, entre um mínimo e um máximo que você define. A métrica mais comum é o uso de CPU em percentual, e também dá para usar memória, métrica personalizada ou métrica externa, como o tamanho de uma fila do Pub/Sub. A versão de API recomendada hoje é `autoscaling/v2`.\n\nExiste uma condição que a prova adora, e que explica a maioria dos HPA que simplesmente não escalam: para escalar por **percentual de utilização** de um recurso, o contêiner precisa declarar a **requisição** daquele recurso. Sem `requests` de CPU no manifesto, não há denominador para calcular os 50 por cento, e o HPA fica parado.\n\nOutro detalhe: apagar o objeto HPA não devolve o Deployment ao número de réplicas do manifesto original. Ele permanece na escala em que estava quando o HPA saiu de cena.",
                },
                {
                    type: "code",
                    value: "kubectl autoscale deployment loja-web \\\n  --cpu-percent=50 \\\n  --min=2 \\\n  --max=10",
                },
                {
                    type: "text",
                    value: "## Autoescalador vertical de pods\n\nO **VPA** não mexe no número de réplicas. Ele observa o consumo real ao longo do tempo e ajusta a **requisição e o limite de CPU e memória** dos contêineres, resolvendo os dois exageros clássicos: o pod que pede muito mais do que usa e desperdiça nó, e o pod que pede de menos e é morto por falta de memória.\n\nO comportamento depende do campo `updateMode` do objeto VerticalPodAutoscaler:\n\n- `Off`: gera recomendação e não aplica nada. É o modo para observar antes de confiar.\n- `Initial`: aplica a recomendação só quando o pod inicia, e não enquanto ele roda.\n- `Recreate` e `Auto`: aplicam recriando o pod, com o mesmo comportamento nos dois.\n- `InPlaceOrRecreate`: tenta aplicar sem recriar o pod e recria se não for possível.\n\nEm cluster Autopilot o autoescalador vertical já vem ligado. Em cluster Standard você liga com `--enable-vertical-pod-autoscaling`. E cuidado com a combinação: usar VPA junto com HPA na **mesma métrica de CPU** gera conflito, porque os dois reagem ao mesmo sinal em direções diferentes. Para esse caso existem o autoescalador multidimensional e o dimensionamento do HPA com apoio do VPA.",
                },
                {
                    type: "code",
                    value: "gcloud container clusters update loja-std \\\n  --location=southamerica-east1 \\\n  --enable-vertical-pod-autoscaling",
                },
                {
                    type: "text",
                    value: "## Autoescalador de cluster e provisionamento automático de nós\n\nO **autoescalador de cluster** age no andar de baixo, node pool por node pool. Se um pod não consegue ser agendado em nenhum nó atual, ele acrescenta nós até o máximo do pool. Se os nós estão subutilizados e todos os pods caberiam em menos nós, ele remove nós até o mínimo do pool. Por baixo, isso vira mudança de tamanho no grupo gerenciado de instâncias do pool.\n\nAs flags `--min-nodes` e `--max-nodes` valem **por zona**, e `--total-min-nodes` e `--total-max-nodes` valem para o pool somado. Em cluster regional, confundir as duas formas é o caminho mais curto para uma fatura surpresa.\n\nO **provisionamento automático de nós** resolve um limite do autoescalador: ele só sabe crescer dentro de pools que já existem, com o tipo de máquina já escolhido. Se o pod pede GPU, mais memória por CPU ou uma arquitetura que nenhum pool oferece, o autoescalador não tem o que fazer e o pod continua pendente. Com o autoprovisionamento ligado, o GKE **cria um node pool novo** sob medida para aquele pod, dentro dos limites de CPU e memória que você definiu no cluster, e remove o pool quando ele deixa de ser necessário. Em cluster Autopilot isso já é o funcionamento padrão.",
                },
                {
                    type: "code",
                    value: "gcloud container node-pools create pool-apps \\\n  --cluster=loja-std \\\n  --location=southamerica-east1 \\\n  --machine-type=e2-standard-4 \\\n  --enable-autoscaling \\\n  --min-nodes=1 \\\n  --max-nodes=6",
                },
                {
                    type: "text",
                    value: "## Node pool: criar, editar e remover sem derrubar a aplicação\n\nNode pool é um grupo de nós com as mesmas características, e ele é a unidade de mudança de infraestrutura no modo Standard. Criar é tranquilo: `gcloud container node-pools create` adiciona capacidade nova sem tocar no que roda. Listar e inspecionar saem de `gcloud container node-pools list` e `describe`. Para mudar a quantidade de nós na mão, o comando é `gcloud container clusters resize` com a flag do node pool.\n\nNem toda característica é editável. Tipo de máquina, disco de inicialização e conta de serviço do nó se definem na criação. Trocar isso na prática significa **criar um node pool novo** com a configuração desejada, mover a carga e só então apagar o antigo.\n\nE o efeito na carga em execução muda bastante entre as operações. No upgrade de um node pool, o GKE para de agendar novos pods no nó, tenta reagendar os que estão lá e respeita o PodDisruptionBudget e o prazo de encerramento do pod por até uma hora. Já na exclusão, a documentação é dura: apagar um node pool apaga os nós e **todas as cargas em execução** neles, e por padrão o GKE **não respeita** o PodDisruptionBudget. Migração segura é criar o pool novo, drenar os nós antigos com `kubectl drain` e apagar o pool depois.",
                },
                {
                    type: "quote",
                    value: "O autoescalador horizontal muda réplicas, o vertical muda requisições, o de cluster muda nós e o autoprovisionamento muda node pools.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que o autoescalador horizontal de pods altera quando a métrica observada passa do alvo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A quantidade de réplicas da carga",
                            isCorrect: true,
                        },
                        {
                            text: "A requisição de CPU do contêiner",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de nós do node pool",
                            isCorrect: false,
                        },
                        {
                            text: "O tipo de máquina usado pelos nós",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um HPA foi criado para escalar por 60 por cento de utilização de CPU, mas a contagem de réplicas nunca sai do mínimo, mesmo com o serviço lento. O manifesto do Deployment não declara recursos. O que está faltando?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A requisição de CPU no contêiner, que serve de base para o percentual",
                            isCorrect: true,
                        },
                        {
                            text: "O limite de memória no contêiner, obrigatório para qualquer autoescalador",
                            isCorrect: false,
                        },
                        {
                            text: "O autoescalador de cluster ligado no node pool onde a carga está rodando",
                            isCorrect: false,
                        },
                        {
                            text: "A versão autoscaling/v1 no manifesto, exigida para a métrica de CPU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um objeto VerticalPodAutoscaler, o que o modo de atualização `Off` faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gera a recomendação de recursos sem aplicá-la ao pod",
                            isCorrect: true,
                        },
                        {
                            text: "Aplica a recomendação apenas quando o pod é iniciado",
                            isCorrect: false,
                        },
                        {
                            text: "Aplica a recomendação recriando o pod em seguida",
                            isCorrect: false,
                        },
                        {
                            text: "Desliga o recurso de autoescalonamento vertical no cluster",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pod novo pede um tipo de máquina com GPU que nenhum node pool do cluster oferece, e fica pendente. O autoescalador de cluster está ligado em todos os pools, com margem de crescimento. O que resolve o caso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ligar o provisionamento automático de nós, que cria o node pool certo",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o número máximo de nós dos node pools que já existem no cluster",
                            isCorrect: false,
                        },
                        {
                            text: "Criar um objeto HorizontalPodAutoscaler para a carga que está pendente",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar o autoescalador vertical, que ajusta a requisição do pod pendente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa trocar o tipo de máquina dos nós de um cluster Standard em produção, que tem um só node pool e PodDisruptionBudget declarado. Qual caminho protege a aplicação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Criar um node pool novo, drenar os nós antigos e só depois apagar o pool antigo",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar o node pool antigo e criar o novo em seguida, confiando no PodDisruptionBudget",
                            isCorrect: false,
                        },
                        {
                            text: "Editar o tipo de máquina do node pool existente, que o GKE aplica na próxima janela de manutenção",
                            isCorrect: false,
                        },
                        {
                            text: "Redimensionar o node pool para zero nó e depois voltar com o tipo novo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cloud Run, revisões, tráfego e eventos",
            blocks: [
                {
                    type: "text",
                    value: "O GKE entrega controle, e cobra por esse controle em trabalho de operação: node pool, upgrade, autoescalador, rede. Boa parte das aplicações não precisa disso. Precisa de um contêiner que receba requisição, escale quando o movimento aumenta e desapareça quando ninguém chama.\n\nEsse é o **Cloud Run**. Você entrega a imagem (ou o código fonte, e ele constrói), define quanto de CPU e memória cada instância tem, e não existe nó para gerenciar. Ele atende três formatos que a prova pode citar: **serviço**, que responde a requisições HTTP e a eventos; **job**, que roda uma tarefa até terminar; e **função**, que é o nome atual das antigas Cloud Functions. A documentação hoje chama a segunda geração de **funções do Cloud Run**, e a geração antiga de funções do Cloud Run (1ª geração). Para publicar uma função a partir do código fonte, o comando é `gcloud run deploy` com as flags `--function`, que aponta o ponto de entrada, e `--base-image`, que escolhe a imagem base gerenciada.",
                },
                {
                    type: "code",
                    value: "gcloud run deploy loja-api \\\n  --image=southamerica-east1-docker.pkg.dev/meu-projeto/loja/loja-api:1.0 \\\n  --region=southamerica-east1 \\\n  --allow-unauthenticated",
                },
                {
                    type: "text",
                    value: "## Revisão é imutável\n\nEsse é o conceito central do Cloud Run, e a origem de metade das questões. Quando você implanta em um serviço, ou muda a configuração dele, **uma revisão imutável é criada**. Nada é editado no lugar: trocar a imagem gera revisão nova, mudar uma variável de ambiente gera revisão nova, mexer na concorrência gera revisão nova.\n\nO serviço é o nome estável, com a URL que os clientes conhecem. A revisão é a fotografia de uma configuração, com nome próprio no formato `loja-api-00007-abc`. O `gcloud run revisions list --service loja-api` mostra o histórico, e esse histórico é o que permite voltar atrás em segundos.\n\nPor padrão a revisão recém implantada assume todo o tráfego. Para publicar sem expor ninguém, você implanta com `--no-traffic` e `--tag=canario`: a revisão nasce sem tráfego de produção e ganha uma URL própria com a tag, onde a equipe testa em paz antes de liberar.",
                },
                {
                    type: "text",
                    value: "## Dividir o tráfego entre revisões\n\nCom duas ou mais revisões vivas, você controla a porcentagem de requisições que cada uma recebe pelo `gcloud run services update-traffic`. As porcentagens precisam somar 100. A flag `--to-revisions` aponta revisões pelo nome, `--to-tags` aponta pelas tags que você criou e `--to-latest` manda tudo para a revisão mais recente, desfazendo qualquer divisão anterior.\n\nÉ assim que sai um lançamento gradual honesto: 10 por cento na revisão nova, acompanha métrica e log, 50 por cento, e só então 100. E é assim que sai a **reversão**, que é o que importa quando o lançamento dá errado: você manda 100 por cento de volta para a revisão anterior, que continua lá, intacta e já aquecida. Não há build, não há novo deploy, não há espera.",
                },
                {
                    type: "code",
                    value: "gcloud run services update-traffic loja-api \\\n  --to-revisions=loja-api-00007-abc=10,loja-api-00006-xyz=90",
                },
                {
                    type: "text",
                    value: "## Mínimo, máximo e concorrência\n\nPor padrão o Cloud Run escala até zero: sem requisição, nenhuma instância em pé e nada de capacidade ociosa na fatura. O preço disso é a **partida a frio**, o tempo de subir a instância e inicializar a aplicação na primeira requisição depois do silêncio. Quando essa latência incomoda, você define um **mínimo de instâncias** para manter instâncias quentes, lembrando que instância mantida de pé é instância cobrada.\n\nDo outro lado está o **máximo de instâncias**, que por padrão é 100 por revisão. Ele serve menos para controlar custo e mais para proteger o que está atrás: um banco de dados com limite de conexões não sobrevive a um pico que abre centenas de instâncias de uma vez. Passado o limite, as requisições excedentes falham com a mensagem de que não há instância disponível.\n\nA **concorrência** é a terceira peça, e a menos intuitiva: quantas requisições cada instância atende ao mesmo tempo. O padrão é 80 e o teto é 1000. Reduzir a concorrência para 1 faz cada instância atender uma requisição por vez, o que resolve código que não tolera execução concorrente, e em troca multiplica o número de instâncias necessárias para a mesma carga. As flags `--min` e `--max` valem para o serviço, enquanto `--min-instances` e `--max-instances` valem para a revisão.",
                },
                {
                    type: "table",
                    value: '[["Parâmetro","Flag","Para que serve"],["Mínimo de instâncias","--min no serviço, --min-instances na revisão","Manter instância quente e evitar partida a frio"],["Máximo de instâncias","--max no serviço, --max-instances na revisão","Conter o pico e proteger o que está atrás"],["Concorrência","--concurrency","Definir quantas requisições cada instância atende"],["Escala a zero","Mínimo igual a zero, que já é o padrão","Não pagar instância ociosa fora do movimento"]]',
                },
                {
                    type: "text",
                    value: "## Receber eventos, e não só requisições\n\nUm serviço do Cloud Run também pode ser acionado por acontecimento: mensagem publicada em um tópico, objeto criado em um bucket, job do BigQuery concluído. Quem faz essa ponte é o **Eventarc**, que entrega o evento ao serviço como uma requisição HTTP no formato CloudEvents.\n\nNo caso mais cobrado, o do **Pub/Sub**, você cria um gatilho apontando o serviço de destino e o tipo de evento `google.cloud.pubsub.topic.v1.messagePublished`. Esse tipo é obrigatório e não pode ser alterado depois: outro tipo de evento exige outro gatilho. Com `--transport-topic` você reaproveita um tópico que já existe, e sem essa flag o Eventarc cria um tópico para o gatilho. O gatilho usa uma conta de serviço, e ela precisa de permissão para invocar o serviço de destino.\n\nDois pontos de atenção: gatilho de Pub/Sub existe apenas em local de região única, não em local global; e, se o serviço exige autenticação, é a conta de serviço do gatilho que precisa do papel de invocador, não o publicador da mensagem.",
                },
                {
                    type: "code",
                    value: 'gcloud eventarc triggers create loja-pedidos \\\n  --location=southamerica-east1 \\\n  --destination-run-service=loja-api \\\n  --destination-run-region=southamerica-east1 \\\n  --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \\\n  --transport-topic=projects/meu-projeto/topics/pedidos \\\n  --service-account=eventarc@meu-projeto.iam.gserviceaccount.com',
                },
                {
                    type: "quote",
                    value: "No Cloud Run nada se edita no lugar: cada mudança cria uma revisão, e é por isso que voltar atrás é só redirecionar o tráfego.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você implanta uma imagem nova em um serviço do Cloud Run que já existe. O que acontece com a configuração anterior?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma revisão nova e imutável é criada, e a anterior continua no histórico",
                            isCorrect: true,
                        },
                        {
                            text: "A revisão em uso é atualizada no lugar, e a configuração antiga é descartada",
                            isCorrect: false,
                        },
                        {
                            text: "O serviço é recriado com a imagem nova e passa a ter outra URL de acesso",
                            isCorrect: false,
                        },
                        {
                            text: "As instâncias são reiniciadas com a imagem nova, sem criar outra revisão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma revisão nova já está implantada e a equipe quer enviar 10 por cento das requisições para ela, mantendo 90 por cento na revisão atual. Qual comando faz isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "gcloud run services update-traffic com --to-revisions",
                            isCorrect: true,
                        },
                        {
                            text: "gcloud run services update com a flag --traffic-percent",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud run deploy com a flag --allow-unauthenticated",
                            isCorrect: false,
                        },
                        {
                            text: "gcloud run revisions update com a flag --to-latest",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A equipe quer publicar a versão nova no Cloud Run e testá-la em uma URL separada, sem que nenhum cliente de produção caia nela. Quais flags do deploy atendem a isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "--no-traffic com --tag",
                            isCorrect: true,
                        },
                        {
                            text: "--min-instances com --tag",
                            isCorrect: false,
                        },
                        {
                            text: "--no-traffic com --concurrency",
                            isCorrect: false,
                        },
                        {
                            text: "--no-allow-unauthenticated",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um serviço do Cloud Run usa uma biblioteca que não tolera execução concorrente, e precisa atender uma requisição por instância. O que você configura, e qual é o efeito colateral?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Concorrência igual a 1, que eleva o número de instâncias da mesma carga",
                            isCorrect: true,
                        },
                        {
                            text: "Máximo de instâncias igual a 1, o que serializa as requisições na fila",
                            isCorrect: false,
                        },
                        {
                            text: "Mínimo de instâncias igual a 1, o que mantém uma instância sempre quente",
                            isCorrect: false,
                        },
                        {
                            text: "Concorrência igual a 80, o que é o padrão e já isola cada requisição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um serviço do Cloud Run precisa ser acionado a cada mensagem publicada em um tópico do Pub/Sub que já existe. Qual é a montagem correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um gatilho do Eventarc para o serviço, filtrando o evento de mensagem publicada",
                            isCorrect: true,
                        },
                        {
                            text: "Uma assinatura do tipo pull no tópico, com o serviço fixado como consumidor dela",
                            isCorrect: false,
                        },
                        {
                            text: "Um job do Cloud Scheduler que consulta o tópico e chama o serviço a cada minuto",
                            isCorrect: false,
                        },
                        {
                            text: "Uma regra de encaminhamento do balanceador apontando o tópico para o serviço",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Armazenamento e bancos de dados",
    aulas: [
        {
            titulo: "Cloud Storage: buckets, classes e ciclo de vida",
            blocks: [
                {
                    type: "text",
                    value: "O Cloud Storage é o lugar onde quase todo projeto de nuvem termina guardando o que não cabe em um banco: backup, log, imagem, vídeo, arquivo de entrada de um job. Ele guarda **objetos** dentro de **buckets**, e não arquivos dentro de pastas. O nome do bucket é único no mundo inteiro, o namespace é plano e a barra em `faturas/2026/01.pdf` faz parte do nome do objeto, não de um diretório de verdade.\n\nObjeto também não se edita no lugar. Gravar de novo o mesmo nome substitui o objeto inteiro. Isso muda o jeito de pensar: em vez de abrir e alterar, você escreve uma versão nova. A prova gosta desse detalhe porque ele explica por que existem versionamento, exclusão reversível e regras de ciclo de vida.\n\nAntes de qualquer comando, um aviso sobre ferramenta: o `gsutil` virou CLI legada. A documentação diz que ele é minimamente mantido, que não acompanha recursos novos como exclusão reversível e pastas gerenciadas, e manda usar os comandos `gcloud storage`. Depois de março de 2027 ele deixa de vir junto com a CLI do Google Cloud. Em prova, a resposta de linha de comando para Cloud Storage é sempre `gcloud storage`.",
                },
                {
                    type: "text",
                    value: "## O bucket nasce com três decisões\n\nNa criação você escolhe o **nome**, o **local** e a **classe padrão**. Nome e local não têm campo de edição depois, então vale pensar neles antes de rodar o comando.\n\nOs tipos de local são três:\n\n- **Região**: um lugar geográfico específico, como `southamerica-east1`. Os dados ficam redundantes entre zonas daquela região.\n- **Dupla região**: um par determinado de regiões, como `asia1`, que é Tóquio e Osaka. Você sabe exatamente quais duas regiões guardam os dados.\n- **Multirregião**: uma área geográfica grande que contém duas ou mais regiões. As opções são `US`, `EU` e `ASIA`.\n\nExiste hoje um serviço de realocação de bucket, que move um bucket já criado mantendo o nome, mas ele depende do Storage Intelligence e tem restrições de combinação de local. Para a prova, trate assim: `gcloud storage buckets update` não altera nome nem local, e o caminho normal para mudar de local é criar outro bucket e copiar os objetos.",
                },
                {
                    type: "table",
                    value: '[["Tipo de local","Exemplo","Sobrevive a quê","Quando escolher"],["Região","southamerica-east1","Queda de uma zona","Residência de dados e menor latência local"],["Dupla região","asia1 (Tóquio e Osaka)","Queda de uma região","Par de regiões conhecido, com controle de onde os dados estão"],["Multirregião","US, EU, ASIA","Queda de uma região","Conteúdo servido para um continente inteiro"]]',
                },
                {
                    type: "code",
                    value: "gcloud storage buckets create gs://notas-fiscais-r2a --location=southamerica-east1\ngcloud storage buckets create gs://catalogo-publico --location=us --default-storage-class=standard\ngcloud storage buckets create gs://frios-contabilidade --location=us --default-storage-class=coldline\ngcloud storage buckets describe gs://notas-fiscais-r2a",
                },
                {
                    type: "text",
                    value: "## Classe de armazenamento e tempo mínimo de permanência\n\nA classe não muda a durabilidade nem a API. Ela muda o equilíbrio entre o que você paga para **guardar** e o que paga para **ler**. Quanto mais fria a classe, menor o custo em repouso e maior a taxa de recuperação por GB lido.\n\nCada classe fria tem um **tempo mínimo de permanência**. Se o objeto sai antes do prazo, por exclusão ou por mudança de classe, o Cloud Storage cobra o restante do período como se ele tivesse ficado lá. E o tempo já cumprido na classe antiga conta para o mínimo da classe nova, o que evita dupla cobrança.\n\nDois recursos extras aparecem na documentação atual: o **Autoclass**, em que o próprio Cloud Storage promove e rebaixa a classe conforme o acesso real, e a classe **Rapid Storage**, zonal, voltada para carga intensa de entrada e saída. As classes antigas **Multi-Regional**, **Regional** e **Durable Reduced Availability** continuam na documentação como legado.\n\nDaí sai também a forma de estimar a conta de armazenamento, que é a soma de quatro parcelas: o **armazenamento em repouso** por GB e por mês, que varia com classe e local; as **operações**, divididas em Classe A, que são escritas, listagens e mudança de classe, e Classe B, que são leituras; a **recuperação** por GB lido nas classes Nearline, Coldline e Archive; e a **saída de rede** quando o dado deixa o Google Cloud, mais a eventual exclusão antecipada. O ponto de partida do cálculo é saber quanto já existe no bucket, inclusive em versões antigas, e isso o `gcloud storage du` responde.",
                },
                {
                    type: "table",
                    value: '[["Classe","Permanência mínima","Padrão de acesso que justifica","Exemplo típico"],["Standard","Nenhuma","Dado quente ou guardado por pouco tempo","Imagem de site, arquivo de entrada de pipeline"],["Nearline","30 dias","Leitura ou alteração em média uma vez por mês","Backup mensal, relatório consultado às vezes"],["Coldline","90 dias","Leitura no máximo uma vez por trimestre","Log guardado para auditoria trimestral"],["Archive","365 dias","Acesso menos de uma vez por ano","Retenção legal de sete anos"]]',
                },
                {
                    type: "quote",
                    value: "Classe fria barateia guardar e encarece ler, e sair antes do prazo mínimo gera cobrança por exclusão antecipada.",
                },
                {
                    type: "text",
                    value: "## Versionamento, exclusão reversível e ciclo de vida\n\nCom **versionamento** ligado, cada substituição ou exclusão guarda uma **versão não atual**, identificada pelo número de geração. Ela continua sendo cobrada na mesma taxa que tinha quando era a versão ativa, então versionamento sem limpeza vira fatura crescente.\n\nA **exclusão reversível** é outra coisa, e vem ativada por padrão nos buckets que a suportam, com retenção de 7 dias. Ela protege contra o apagão acidental, inclusive da versão não atual, e não substitui o versionamento.\n\nQuem faz a limpeza é o **gerenciamento de ciclo de vida**, configurado por bucket. As ações possíveis são:\n\n- `Delete`: apaga o objeto.\n- `SetStorageClass`: muda a classe, seguindo a hierarquia de Nearline para Coldline e para Archive, ou de volta para Standard.\n- `AbortIncompleteMultipartUpload`: descarta upload em várias partes que ficou pela metade.\n\nAs condições mais cobradas são `age`, `createdBefore`, `isLive`, `matchesStorageClass`, `matchesPrefix`, `matchesSuffix`, `numNewerVersions` e `daysSinceNoncurrentTime`. Duas delas, `numNewerVersions` e `isLive`, só fazem sentido com versionamento ligado: a primeira apaga quando existem pelo menos N versões mais novas, e a segunda separa a versão ativa das antigas.\n\nUma alteração na configuração pode levar até 24 horas para valer, e nesse intervalo o serviço ainda pode agir pela configuração antiga. Então não espere ver o efeito no minuto seguinte.",
                },
                {
                    type: "code",
                    value: '{\n  "rule": [\n    {\n      "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },\n      "condition": { "age": 30, "matchesStorageClass": ["STANDARD"] }\n    },\n    {\n      "action": { "type": "SetStorageClass", "storageClass": "ARCHIVE" },\n      "condition": { "age": 365 }\n    },\n    {\n      "action": { "type": "Delete" },\n      "condition": { "numNewerVersions": 3, "isLive": false }\n    }\n  ]\n}',
                },
                {
                    type: "code",
                    value: 'gcloud storage buckets update gs://notas-fiscais-r2a --versioning\ngcloud storage buckets update gs://notas-fiscais-r2a --lifecycle-file=ciclo.json\ngcloud storage buckets describe gs://notas-fiscais-r2a --format="default(lifecycle_config)"\ngcloud storage du --summarize --readable-sizes gs://notas-fiscais-r2a\ngcloud storage du --summarize --readable-sizes --all-versions gs://notas-fiscais-r2a',
                },
            ],
            questions: [
                {
                    statement:
                        "Um time guarda arquivos de log que serão consultados no máximo uma vez por trimestre. Qual classe de armazenamento combina com esse padrão de acesso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nearline, com permanência mínima de 30 dias",
                            isCorrect: false,
                        },
                        {
                            text: "Coldline, com permanência mínima de 90 dias",
                            isCorrect: true,
                        },
                        {
                            text: "Archive, com permanência mínima de 365 dias",
                            isCorrect: false,
                        },
                        {
                            text: "Standard, sem permanência mínima exigida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um bucket com versionamento ligado guarda imagens que mudam muito. A equipe quer manter apenas as três versões mais recentes de cada objeto e apagar o resto. Qual condição da regra de ciclo de vida resolve isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A condição age igual a 3, com a ação Delete",
                            isCorrect: false,
                        },
                        {
                            text: "A condição numNewerVersions igual a 3, com a ação Delete",
                            isCorrect: true,
                        },
                        {
                            text: "A condição daysSinceCustomTime igual a 3, com a ação Delete",
                            isCorrect: false,
                        },
                        {
                            text: "A condição matchesStorageClass, com a ação SetStorageClass",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um sistema precisa continuar servindo leituras mesmo se uma região inteira ficar indisponível, e a equipe de risco exige saber exatamente quais duas regiões guardam cada cópia. Qual tipo de local do bucket atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Região, que mantém os dados redundantes entre zonas",
                            isCorrect: false,
                        },
                        {
                            text: "Multirregião, que cobre uma área geográfica ampla",
                            isCorrect: false,
                        },
                        {
                            text: "Dupla região, que usa um par determinado de regiões",
                            isCorrect: true,
                        },
                        {
                            text: "Região com classe Archive, que replica para outro país",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois que um bucket já existe, o que a equipe ainda consegue alterar com `gcloud storage buckets update`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O nome do bucket, o tipo de local e a classe padrão",
                            isCorrect: false,
                        },
                        {
                            text: "O tipo de local do bucket e o projeto que o contém",
                            isCorrect: false,
                        },
                        {
                            text: "A classe padrão, o versionamento e o ciclo de vida",
                            isCorrect: true,
                        },
                        {
                            text: "O nome do bucket e a região informada na criação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma regra de ciclo de vida move objetos para Archive quando eles completam 30 dias. Oito meses depois da criação, um desses objetos é excluído. O que a equipe deve esperar na fatura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cobrança por exclusão antecipada, porque Archive pede 365 dias",
                            isCorrect: true,
                        },
                        {
                            text: "Cobrança por exclusão antecipada, porque Archive pede 90 dias",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma cobrança extra, porque a mudança veio do ciclo de vida",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma cobrança extra, porque o objeto passou dos 30 dias de idade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Acesso e segurança de objetos",
            blocks: [
                {
                    type: "text",
                    value: "Vazamento de bucket é um clássico de notícia de segurança, e quase sempre tem a mesma causa: dois sistemas de permissão funcionando em paralelo no mesmo bucket. O Cloud Storage nasceu com **ACL por objeto** e depois ganhou **IAM** no nível do bucket. Quando os dois valem ao mesmo tempo, ninguém consegue responder com segurança quem acessa o quê.\n\nA prova cobra justamente a escolha consciente: quando usar IAM no bucket, quando um objeto precisa de acesso temporário sem conta no Google, e o que impede alguém de deixar o bucket aberto para a internet.",
                },
                {
                    type: "text",
                    value: "## Acesso uniforme no nível do bucket contra ACL por objeto\n\nCom o **acesso uniforme no nível do bucket** ativado, as ACLs ficam desativadas e só a política do IAM do bucket concede acesso. Requisições que tentam definir, ler ou alterar ACL de bucket ou de objeto falham com `400 Bad Request`, e a propriedade individual de objeto deixa de existir, junto com o acesso que vinha dela.\n\nEsse é o modo recomendado, porque deixa uma única fonte de verdade e permite auditar permissão olhando a política do projeto. O detalhe que a prova gosta: **depois de 90 dias consecutivos ativado, o acesso uniforme não pode mais ser desativado**. Então existe uma janela para voltar atrás, e ela fecha.\n\nO modo detalhado, com ACL por objeto, só se justifica quando objetos do mesmo bucket precisam de donos diferentes, em geral por causa de sistema antigo que já dependia disso.",
                },
                {
                    type: "table",
                    value: '[["Papel predefinido","O que permite","Caso de uso"],["roles/storage.objectViewer","Ver objeto e metadados, e listar o bucket","Serviço que só consome arquivos"],["roles/storage.objectCreator","Criar objeto, sem ler, apagar nem sobrescrever","Agente que só despeja log no bucket"],["roles/storage.objectUser","Criar, ler, atualizar e apagar objeto","Aplicação que gerencia os próprios arquivos"],["roles/storage.objectAdmin","Controle total dos objetos do bucket","Rotina de limpeza e migração de dados"],["roles/storage.admin","Controle total de objetos e de buckets","Time que administra o Cloud Storage"]]',
                },
                {
                    type: "code",
                    value: "gcloud storage buckets update gs://notas-fiscais-r2a --uniform-bucket-level-access\ngcloud storage buckets add-iam-policy-binding gs://notas-fiscais-r2a \\\n  --member=serviceAccount:coletor@meu-projeto.iam.gserviceaccount.com \\\n  --role=roles/storage.objectCreator\ngcloud storage buckets get-iam-policy gs://notas-fiscais-r2a",
                },
                {
                    type: "text",
                    value: "## URL assinada para acesso temporário\n\nÀs vezes o requisito é o oposto de conceder papel: alguém de fora, **sem conta no Google**, precisa baixar um arquivo específico por um tempo curto. A resposta é a **URL assinada**, que dá acesso limitado no tempo a um recurso determinado e carrega na própria URL a assinatura de quem autorizou.\n\nQuem tiver a URL consegue usá-la enquanto ela estiver válida, tenha conta ou não. Por isso ela é tratada como segredo, e a duração curta é a principal defesa.\n\nOs limites que aparecem na documentação:\n\n- a duração padrão do comando é de 1 hora;\n- com chave gerenciada pelo sistema, o teto é de 12 horas;\n- com `--private-key-file` ou conta de serviço ativada, o teto é de 7 dias, que equivale a 604800 segundos.\n\nO caminho recomendado hoje é assinar com **personificação de conta de serviço**, usando a flag global `--impersonate-service-account`, em vez de baixar chave estática para a máquina.",
                },
                {
                    type: "code",
                    value: "gcloud storage sign-url gs://notas-fiscais-r2a/faturas/2026-01.pdf \\\n  --duration=2h \\\n  --impersonate-service-account=assinador@meu-projeto.iam.gserviceaccount.com\n\ngcloud storage sign-url gs://notas-fiscais-r2a/faturas/2026-01.pdf \\\n  --duration=7d --http-verb=GET --private-key-file=chave.json",
                },
                {
                    type: "text",
                    value: "## Bucket público e prevenção de acesso público\n\nTornar objetos públicos é uma decisão deliberada: concede-se `roles/storage.objectViewer` ao principal `allUsers`. A partir daí, dado e metadados ficam visíveis para qualquer pessoa na internet, o que inclui o nome do recurso da chave de criptografia quando o bucket usa chave gerenciada pelo cliente.\n\nPara impedir esse erro, existe a **prevenção de acesso público**. Quando ela está em vigor, requisições autorizadas por `allUsers` ou `allAuthenticatedUsers` falham com `401` ou `403`, políticas existentes que concedem a esses principais continuam gravadas mas ficam sem efeito, e tentativas de adicioná-los falham com `412 Precondition Failed`.\n\nOs dois estados são **enforced**, aplicado naquele bucket, e **inherited**, que herda a decisão de cima. Para cobrir o projeto todo de uma vez, o caminho é a restrição de política da organização `storage.publicAccessPrevention`, aplicável em projeto, pasta ou organização. Bucket com prevenção em vigor simplesmente não aceita ser compartilhado publicamente.",
                },
                {
                    type: "code",
                    value: 'gcloud storage buckets update gs://notas-fiscais-r2a --public-access-prevention\ngcloud storage buckets add-iam-policy-binding gs://catalogo-publico \\\n  --member=allUsers --role=roles/storage.objectViewer\ngcloud storage buckets describe gs://catalogo-publico \\\n  --format="default(public_access_prevention,uniform_bucket_level_access)"',
                },
                {
                    type: "quote",
                    value: "Acesso uniforme desliga ACL, URL assinada serve quem não tem conta no Google e prevenção de acesso público bloqueia allUsers.",
                },
                {
                    type: "text",
                    value: "## Quem guarda a chave da criptografia\n\nTodo objeto no Cloud Storage já é criptografado em repouso, sem configuração. A pergunta de prova é **quem controla a chave**:\n\n- **Chave gerenciada pelo Google**: o padrão, sem nada para configurar.\n- **Chave gerenciada pelo cliente**, ou CMEK: a chave vive no **Cloud KMS**, sob o seu controle de rotação, auditoria e permissão. O conjunto de chaves precisa ficar na **mesma localização dos dados** que vai proteger, e o agente de serviço do Cloud Storage do projeto precisa de acesso à chave para criptografar e descriptografar. Pode ser definida como chave padrão do bucket.\n- **Chave fornecida pelo cliente**, ou CSEK: você envia a chave em cada requisição e o Google não a guarda. Um mesmo objeto só usa um desses métodos de cada vez, e a chave fornecida na requisição tem precedência sobre a chave padrão do bucket.\n\nResumo prático: se a exigência é controlar a rotação e revogar acesso ao dado sem apagá-lo, a resposta é CMEK no Cloud KMS.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um bucket está com o acesso uniforme no nível do bucket ativado. O que acontece com as requisições que tentam definir ou ler ACL de objeto nesse bucket?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Funcionam, mas valem menos que a política do IAM do bucket",
                            isCorrect: false,
                        },
                        {
                            text: "Funcionam apenas para a conta que criou cada objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Falham, porque as ACLs ficam desativadas nesse bucket",
                            isCorrect: true,
                        },
                        {
                            text: "Falham somente quando o bucket também está público",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um parceiro sem conta no Google precisa baixar um único relatório de um bucket privado nas próximas duas horas. Qual solução atende sem abrir o bucket?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conceder roles/storage.objectViewer ao principal allUsers",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar uma URL assinada para o objeto com duração de 2h",
                            isCorrect: true,
                        },
                        {
                            text: "Conceder roles/storage.objectViewer ao email do parceiro",
                            isCorrect: false,
                        },
                        {
                            text: "Desativar a prevenção de acesso público e enviar o link",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual papel predefinido permite que um agente de coleta grave objetos em um bucket, sem conseguir ler, sobrescrever nem excluir o que já está lá?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O papel roles/storage.objectViewer, que lê e lista objetos",
                            isCorrect: false,
                        },
                        {
                            text: "O papel roles/storage.objectAdmin, que controla os objetos",
                            isCorrect: false,
                        },
                        {
                            text: "O papel roles/storage.objectCreator, que apenas cria objetos",
                            isCorrect: true,
                        },
                        {
                            text: "O papel roles/storage.objectUser, que grava e exclui objetos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A área de segurança quer garantir que nenhum bucket de um projeto possa ser tornado público, nem hoje nem em buckets criados depois. Qual é a forma mais abrangente de conseguir isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ativar a prevenção de acesso público em cada bucket do projeto, um bucket por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar a restrição storage.publicAccessPrevention como política da organização",
                            isCorrect: true,
                        },
                        {
                            text: "Remover allUsers da política do IAM de cada bucket em uma rotina semanal",
                            isCorrect: false,
                        },
                        {
                            text: "Ativar o acesso uniforme no nível do bucket em todos os buckets do projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe vai usar chave gerenciada pelo cliente no Cloud KMS como chave padrão de um bucket em southamerica-east1. O que precisa ser verdade para a configuração funcionar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A chave pode ficar em qualquer região, desde que seja do mesmo projeto do bucket",
                            isCorrect: false,
                        },
                        {
                            text: "A chave fica na mesma localização do bucket e o agente de serviço pode usá-la",
                            isCorrect: true,
                        },
                        {
                            text: "A chave fica na mesma zona do bucket e cada requisição informa a chave",
                            isCorrect: false,
                        },
                        {
                            text: "A chave viaja em cada requisição e o Google não guarda nenhuma cópia dela",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escolher o armazenamento e mover dados",
            blocks: [
                {
                    type: "text",
                    value: "Toda questão de armazenamento da prova é a mesma pergunta disfarçada: o dado precisa ser visto como **bloco**, como **arquivo** ou como **objeto**?\n\n- **Bloco** é um volume que a máquina formata e monta, como se fosse um HD. Serve para disco de sistema e para banco instalado dentro da VM, onde o que importa é operação por segundo e latência baixa.\n- **Arquivo** é um sistema de arquivos compartilhado, com diretórios e protocolo de rede como NFS. Serve quando várias máquinas precisam ver o mesmo diretório ao mesmo tempo.\n- **Objeto** é um dado inteiro endereçado por nome e lido por HTTP. Serve para backup, mídia, log e qualquer coisa grande que não é alterada em pedaços.\n\nErrar essa camada é o erro caro: ninguém sobe um Filestore para guardar vídeo, e ninguém roda banco de produção em cima de um bucket.",
                },
                {
                    type: "table",
                    value: '[["Opção","Tipo de armazenamento","Escopo","Quando escolher"],["Disco permanente ou Hyperdisk","Bloco","Zonal ou regional","Disco de inicialização e banco instalado na VM"],["Local SSD","Bloco temporário","Preso à própria instância","Cache e espaço de rascunho que pode ser perdido"],["Filestore","Arquivo, por NFS","Zonal ou regional","Várias VMs no mesmo diretório, aplicação legada"],["Cloud Storage","Objeto, por HTTP","Região, dupla região ou multirregião","Backup, mídia e dado de entrada de pipeline"]]',
                },
                {
                    type: "text",
                    value: "## Bloco: disco permanente, Hyperdisk e Local SSD\n\nO **disco permanente** é um volume de rede, independente da vida da VM: você pode desanexar e anexar em outra instância, tirar snapshot e crescer o tamanho. Ele nasce **zonal** por padrão, e existe a variante **regional**, que replica de forma síncrona entre duas zonas da mesma região e permite subir a VM na outra zona se a primeira cair. O **Hyperdisk** é a geração em que desempenho e capacidade escalam de forma independente.\n\nO **Local SSD** é diferente em espécie, não em grau. Ele é fisicamente preso ao servidor que hospeda a VM, entrega a menor latência da plataforma e é **temporário**. A documentação é direta: o Local SSD não é replicado automaticamente e todos os dados podem ser perdidos se a instância parar ou for encerrada por qualquer motivo. Cada disco tradicional tem 375 GiB, não pode ser disco de inicialização e não aceita snapshot, clone nem imagem.\n\nRegra de prova: se o enunciado disser que o dado precisa sobreviver, Local SSD está fora, mesmo quando o requisito fala de desempenho.",
                },
                {
                    type: "text",
                    value: "## Arquivo e objeto: Filestore e Cloud Storage\n\nO **Filestore** entrega armazenamento de arquivos gerenciado, servido por NFS, montável por várias instâncias e por pods do GKE ao mesmo tempo. Os níveis atuais são **zonal**, **regional**, que sobrevive à queda de uma zona, e **multishares para GKE**, além dos níveis básicos mantidos como legado. É a resposta típica para migrar uma aplicação que espera encontrar um diretório compartilhado e não pode ser reescrita.\n\nO **Cloud Storage** fica com o resto: backup, arquivo de mídia, exportação de dados, log bruto, artefato de build. Ele não tem tamanho máximo a planejar, não precisa ser montado e é o único dos quatro que serve como área de entrada para outros produtos lerem.\n\nEsse último ponto resolve metade das questões de carga de dados: o padrão no Google Cloud é **subir para o bucket e importar de lá**. O BigQuery carrega de `gs://`, o Cloud SQL importa um dump de `gs://`, o Firestore exporta e importa de `gs://`. O bucket é a área de entrada comum.",
                },
                {
                    type: "code",
                    value: "gcloud compute disks create dados-app --size=500GB --type=pd-balanced \\\n  --zone=southamerica-east1-a\n\ngcloud compute disks create dados-app-regional --size=500GB --type=pd-balanced \\\n  --region=southamerica-east1 \\\n  --replica-zones=southamerica-east1-a,southamerica-east1-b\n\ngcloud filestore instances create compartilhado-app --zone=southamerica-east1-b \\\n  --tier=ZONAL --file-share=name=vol1,capacity=1TB --network=name=default",
                },
                {
                    type: "text",
                    value: "## Mover dados pela linha de comando\n\nPara volume pequeno e médio, a ferramenta é o próprio `gcloud storage`. O `cp` sobe, baixa e copia entre buckets, com paralelismo ligado por padrão e `--recursive` para árvore de diretórios. O `rsync` deixa o destino igual à origem, copiando só o que mudou, e com `--delete-unmatched-destination-objects` também apaga no destino o que não existe mais na origem. Essa flag apaga dado rápido quando origem e destino são informados ao contrário, então é a primeira coisa a conferir no comando.\n\nQuando o volume cresce, a conversa muda para serviço gerenciado. O **Storage Transfer Service** é otimizado para transferências acima de 1 TiB e cobre Amazon S3, Azure Blob Storage, HDFS, sistema de arquivos on-premises, URLs públicas e bucket para bucket. Ele tem agenda de repetição, filtro por prefixo e dois modos: **sem agente**, para origem na nuvem, e **com agente**, quando a origem é um sistema de arquivos seu e você quer controlar rota de rede e banda.\n\nE quando nem o serviço gerenciado resolve, o problema é a rede, não o software.",
                },
                {
                    type: "code",
                    value: "gcloud storage cp relatorio.csv gs://notas-fiscais-r2a/entrada/\ngcloud storage cp --recursive ./exportacao gs://notas-fiscais-r2a/dumps/\ngcloud storage rsync --recursive ./site gs://catalogo-publico\n\ngcloud transfer jobs create s3://bucket-origem gs://notas-fiscais-r2a \\\n  --name=migracao-s3 --source-creds-file=creds.json --schedule-repeats-every=1d\n\ngcloud sql import sql banco-prod gs://notas-fiscais-r2a/dumps/dump.sql.gz \\\n  --database=vendas",
                },
                {
                    type: "text",
                    value: "## Quando a rede não dá conta: Transfer Appliance\n\nO **Transfer Appliance** é um dispositivo de alta capacidade que o Google envia, você copia os dados nele e devolve para uma instalação do Google, que sobe o conteúdo para o Cloud Storage. O critério publicado é simples: ele serve quando **levaria mais de uma semana para subir os dados pela rede**.\n\nA documentação ilustra com a aritmética que a prova gosta: 300 terabytes por um link de 100 Mbps dariam cerca de nove meses, enquanto o appliance resolve em menos de 25 dias. Os modelos citados são o TA40 e o TA300, e hoje existe também um modo online, em que o appliance envia pela rede logo após a cópia local, sem esperar o transporte físico.\n\nNa hora de responder, faça a conta de cabeça: volume dividido pela banda. Se o resultado passa de uma semana, a resposta é appliance. Se não passa e o volume é grande ou recorrente, é Storage Transfer Service. Se é um punhado de arquivos, é `gcloud storage cp`.",
                },
                {
                    type: "table",
                    value: '[["Situação","Caminho","Por quê"],["Alguns arquivos ou poucos GB","gcloud storage cp","Comando direto, sem montar infraestrutura"],["Manter origem e destino iguais","gcloud storage rsync","Copia apenas o que mudou desde a última vez"],["Acima de 1 TiB, outra nuvem ou on-premises","Storage Transfer Service","Serviço gerenciado, com agenda e com ou sem agente"],["Rede levaria mais de uma semana","Transfer Appliance","Os dados viajam fisicamente até o Google"],["Dado já no bucket que precisa entrar num produto","Carga a partir do bucket","bq load e gcloud sql import leem o gs:// direto"]]',
                },
                {
                    type: "quote",
                    value: "Faça a conta volume dividido por banda: mais de uma semana pede Transfer Appliance, acima de 1 TiB com agenda pede Storage Transfer Service.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma VM usa Local SSD como espaço de rascunho de processamento. O que acontece com esses dados se a instância for interrompida?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os dados ficam guardados, porque o Local SSD é replicado dentro da zona",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados podem ser perdidos, porque o Local SSD não é persistente",
                            isCorrect: true,
                        },
                        {
                            text: "Os dados vão para um snapshot automático antes da interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados migram para o disco de inicialização da instância",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Três instâncias precisam ler e gravar no mesmo diretório ao mesmo tempo, por NFS, para atender uma aplicação legada que espera um sistema de arquivos. Qual opção atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O Cloud Storage, que entrega armazenamento de objetos por HTTP",
                            isCorrect: false,
                        },
                        {
                            text: "O disco permanente, que anexa um volume de bloco à instância",
                            isCorrect: false,
                        },
                        {
                            text: "O Filestore, que entrega armazenamento de arquivos gerenciado",
                            isCorrect: true,
                        },
                        {
                            text: "O Local SSD, que anexa armazenamento de bloco temporário à VM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "São 400 TB em um datacenter com link de 100 Mbps, e a migração para o Cloud Storage precisa terminar em algumas semanas. Qual caminho a documentação indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O Storage Transfer Service com agentes instalados no datacenter",
                            isCorrect: false,
                        },
                        {
                            text: "O Transfer Appliance, que leva os dados fisicamente ao Google",
                            isCorrect: true,
                        },
                        {
                            text: "O gcloud storage cp disparado em várias sessões paralelas",
                            isCorrect: false,
                        },
                        {
                            text: "O gcloud storage rsync agendado por cron todas as noites",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual CLI a documentação atual do Cloud Storage recomenda para copiar e sincronizar objetos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O gsutil, porque o gcloud storage ainda não lida com multirregião",
                            isCorrect: false,
                        },
                        {
                            text: "O gcloud storage, com o gsutil mantido apenas como CLI legada",
                            isCorrect: true,
                        },
                        {
                            text: "O gcloud alpha storage, porque a versão estável não copia objeto",
                            isCorrect: false,
                        },
                        {
                            text: "O gsutil, porque só ele sincroniza diretório local com bucket",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe precisa sincronizar toda noite um bucket do Amazon S3 com um bucket do Cloud Storage, sem manter servidor próprio para isso. Qual solução atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O Transfer Appliance, com envio físico do dispositivo até o Google",
                            isCorrect: false,
                        },
                        {
                            text: "O Storage Transfer Service, com transferência sem agente e agenda",
                            isCorrect: true,
                        },
                        {
                            text: "O Storage Transfer Service, só com agentes instalados em uma VM",
                            isCorrect: false,
                        },
                        {
                            text: "O gcloud storage rsync, executado por uma VM com cron próprio",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Bancos relacionais: Cloud SQL, AlloyDB e Spanner",
            blocks: [
                {
                    type: "text",
                    value: "Banco relacional gerenciado existe para tirar do seu caminho o trabalho que não diferencia o produto: aplicar correção de segurança, configurar replicação, agendar backup, testar failover. O Google Cloud oferece três respostas relacionais, e a prova pede que você escolha pelo requisito, não pelo gosto.\n\nO caminho de decisão é curto. Se o motor atual é MySQL, PostgreSQL ou SQL Server e o volume cabe em uma máquina, é **Cloud SQL**. Se é PostgreSQL exigente, que mistura transação e relatório analítico, é **AlloyDB**. Se o requisito fala de escala horizontal e de consistência forte entre regiões, é **Spanner**.",
                },
                {
                    type: "text",
                    value: "## Cloud SQL: o relacional de todo dia\n\nO Cloud SQL roda **MySQL, PostgreSQL e SQL Server**, em duas edições, **Enterprise** e **Enterprise Plus**. Você escolhe o motor com `--database-version`, o tamanho da máquina com `--tier` e a região com `--region`. O crescimento automático do disco vem ligado por padrão, com `--storage-auto-increase`, o que evita a instância travar por disco cheio.\n\nPara conectar existem três caminhos: IP público com redes autorizadas, IP privado dentro da VPC e a **proxy de autenticação do Cloud SQL**, que fala com a instância por conexão criptografada sem depender de liberar faixa de IP.\n\nNa linha de comando, o atalho é o `gcloud sql connect`. Ele abre uma sessão de cliente contra a instância usando a proxy em `localhost`, aceita `--user` e `--database`, e com `--auto-iam-authn` usa autenticação do IAM no banco em vez de senha. É o comando que a prova espera quando o enunciado diz que o administrador quer abrir um prompt rápido no banco.",
                },
                {
                    type: "code",
                    value: "gcloud sql instances create banco-prod \\\n  --database-version=POSTGRES_16 --edition=enterprise \\\n  --tier=db-custom-2-7680 --region=southamerica-east1 \\\n  --availability-type=REGIONAL \\\n  --backup-start-time=03:00 --enable-point-in-time-recovery\n\ngcloud sql connect banco-prod --user=postgres --database=vendas\ngcloud sql instances describe banco-prod",
                },
                {
                    type: "text",
                    value: "## Alta disponibilidade e réplica de leitura são coisas diferentes\n\nCom `--availability-type=REGIONAL`, a instância passa a ser chamada de **instância regional** e ganha uma **instância em espera** em outra zona da mesma região. Toda escrita feita na primária é replicada para os discos das duas zonas antes de a transação ser confirmada, ou seja, replicação **síncrona**, sem perda de dados. Um batimento por segundo vigia a saúde da primária, e o failover leva em torno de 60 segundos.\n\nO detalhe que derruba candidato: a instância em espera **não atende leitura**. Ela existe para assumir, não para dividir carga. Quem divide carga é a **réplica de leitura**, que é somente leitura, pode viver em outra região e pode ser **promovida** a instância independente. E a réplica, por sua vez, **não oferece failover automático**.\n\nEntão o enunciado manda: se fala de ficar no ar quando uma zona cai, é alta disponibilidade. Se fala de aliviar consulta pesada ou de atender leitor em outro continente, é réplica de leitura. Se fala dos dois, são os dois recursos juntos.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Instância em espera (alta disponibilidade)","Réplica de leitura"],["Onde fica","Outra zona da mesma região","Mesma região ou outra região"],["Replicação","Síncrona, antes de confirmar a transação","Assíncrona, com atraso possível"],["Atende consulta","Não, fica inativa até o failover","Sim, apenas leitura"],["Em caso de falha","Assume automaticamente em cerca de 60 segundos","Precisa ser promovida manualmente"],["Objetivo","Continuidade quando a zona cai","Escalar leitura e aproximar o leitor"]]',
                },
                {
                    type: "text",
                    value: "## Backup, restauração e recuperação para um ponto no tempo\n\nO Cloud SQL tem **backup automático**, agendado com `--backup-start-time` em uma janela de baixa atividade, e **backup sob demanda**, criado antes de uma operação arriscada. Todos os backups, menos o primeiro, são **incrementais**: guardam só o que mudou desde o anterior. A retenção vai de 1 dia a 10 anos, conforme a opção de backup da instância, e, quando a instância é excluída, os backups retidos passam a viver no nível do projeto, independentes dela.\n\nBackup devolve o estado de um instante que foi salvo. Quando o requisito é voltar para um momento qualquer, como logo antes de um `DELETE` sem `WHERE`, o recurso é a **recuperação para um ponto no tempo**. Ela exige backup automático ligado e a opção `--enable-point-in-time-recovery`, e se apoia nos logs de transação, que no PostgreSQL são os logs de escrita antecipada. A janela é controlada por `--retained-transaction-log-days`, que aceita de 1 a 35 dias, com padrão de 7 dias na edição Enterprise e 14 na Enterprise Plus.\n\nE o ponto que a prova adora: a recuperação para um ponto no tempo **sempre cria uma instância nova**. Não existe recuperar sobre a instância atual.",
                },
                {
                    type: "code",
                    value: 'gcloud sql backups create --instance=banco-prod --description="antes do deploy"\ngcloud sql backups list --instance=banco-prod\n\ngcloud sql instances clone banco-prod banco-prod-recuperado \\\n  --point-in-time="2026-03-10T14:00:00.000Z"\n\ngcloud sql instances patch banco-prod --availability-type=REGIONAL\ngcloud sql instances patch banco-prod --retained-transaction-log-days=14',
                },
                {
                    type: "text",
                    value: "## AlloyDB e Spanner: onde o Cloud SQL para\n\nO **AlloyDB para PostgreSQL** é compatível com PostgreSQL, então `psql` e `pgAdmin` continuam funcionando, mas por baixo é outra arquitetura: computação e armazenamento são separados e escalam de forma independente. O cluster tem uma instância primária com **nó ativo e nó em espera em zonas diferentes**, e os logs de escrita antecipada vão para um persistor regional, o que elimina perda de dados no failover; a troca costuma levar menos de 30 segundos. Além disso ele tem **pools de leitura**, com balanceamento automático entre nós, e um **mecanismo colunar em memória** que acelera consulta analítica no mesmo banco que atende a transação.\n\nO **Spanner** resolve outro problema. Ele é relacional e distribuído: divide a tabela em partições automaticamente e cresce acrescentando capacidade, medida em nós ou em unidades de processamento. Replica entre zonas e entre regiões com **consistência externa**, uma garantia mais forte que consistência forte, em que as transações são serializáveis e aparecem para todos os clientes na mesma ordem. As configurações são regional, dupla região e multirregional, e a multirregional oferece 99,999% de disponibilidade contra 99,99% da regional. Aceita os dialetos GoogleSQL e PostgreSQL.\n\nSe a questão fala de escala global, escrita em mais de uma região e cinco noves, a resposta é Spanner, e o preço disso é um modelo de dados que você precisa desenhar pensando em distribuição.",
                },
                {
                    type: "table",
                    value: '[["Produto","Perfil","Como escala","Quando escolher"],["Cloud SQL","MySQL, PostgreSQL ou SQL Server gerenciado","Vertical, mais réplica de leitura","Migrar banco existente sem trocar de motor"],["AlloyDB","PostgreSQL com mecanismo colunar em memória","Vertical, mais pools de leitura","PostgreSQL exigente, com relatório no mesmo banco"],["Spanner","Relacional distribuído, consistência externa","Horizontal, com partições automáticas","Escala global, escrita multirregional e cinco noves"]]',
                },
                {
                    type: "quote",
                    value: "Instância em espera dá failover e não atende leitura; réplica de leitura atende leitura e não dá failover.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que caracteriza uma instância do Cloud SQL configurada com alta disponibilidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma réplica de leitura em outra região, pronta para ler",
                            isCorrect: false,
                        },
                        {
                            text: "Duas instâncias ativas atendendo escrita ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma instância em espera em outra zona da mesma região",
                            isCorrect: true,
                        },
                        {
                            text: "Um backup automático guardado em outra multirregião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um relatório noturno sobrecarrega a instância principal do Cloud SQL. A equipe quer tirar essa carga de leitura sem mexer na aplicação que escreve. O que criar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma instância em espera, com o failover automático ligado",
                            isCorrect: false,
                        },
                        {
                            text: "Uma réplica de leitura, com o relatório apontado para ela",
                            isCorrect: true,
                        },
                        {
                            text: "Um backup sob demanda restaurado em uma instância nova",
                            isCorrect: false,
                        },
                        {
                            text: "Uma segunda instância principal na mesma região, para leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o comando `gcloud sql connect banco-prod --user=postgres` faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cria o usuário postgres na instância e pede uma senha nova para ele",
                            isCorrect: false,
                        },
                        {
                            text: "Abre uma sessão de cliente pelo proxy de autenticação do Cloud SQL",
                            isCorrect: true,
                        },
                        {
                            text: "Troca a senha do usuário postgres e devolve o valor gerado",
                            isCorrect: false,
                        },
                        {
                            text: "Publica a instância na internet com um IP externo fixo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um comando apagou linhas de uma tabela do Cloud SQL às 14h05, e a equipe quer o banco como estava às 14h00. Qual recurso usar e qual é o resultado dele?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Recuperação para um ponto no tempo, que altera a instância atual",
                            isCorrect: false,
                        },
                        {
                            text: "Recuperação para um ponto no tempo, que cria uma instância nova",
                            isCorrect: true,
                        },
                        {
                            text: "Restauração de backup, que devolve o estado exato de 14h00",
                            isCorrect: false,
                        },
                        {
                            text: "Promoção da réplica de leitura, que volta ao estado de 14h00",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um sistema de pagamentos precisa de banco relacional com escala horizontal, consistência forte e disponibilidade de cinco noves, com escrita em mais de uma região. Qual opção atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cloud SQL com réplica de leitura em outra região, pronta para promover",
                            isCorrect: false,
                        },
                        {
                            text: "Cloud SQL para PostgreSQL com alta disponibilidade em duas zonas",
                            isCorrect: false,
                        },
                        {
                            text: "Spanner em configuração multirregional, com duas regiões de escrita",
                            isCorrect: true,
                        },
                        {
                            text: "AlloyDB com pool de leitura espalhado por duas zonas da região",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "NoSQL e analítico: Firestore, Bigtable e BigQuery",
            blocks: [
                {
                    type: "text",
                    value: "Quando o requisito não pede tabela com junção e transação, a escolha passa a ser por **perfil de acesso**. Três produtos cobrem quase tudo no Google Cloud, e cada um nasceu para um jeito de ler os dados.\n\nO **Firestore** guarda documento de aplicação e avisa o cliente quando algo muda. O **Bigtable** guarda uma montanha de eventos e devolve por chave em poucos milissegundos. O **BigQuery** responde pergunta analítica em SQL sobre todo o histórico. Na prova, o enunciado quase sempre entrega a pista na forma da consulta: por documento, por chave de linha ou por agregação.",
                },
                {
                    type: "table",
                    value: '[["Produto","Modelo de dados","Consulta típica","Quando escolher"],["Firestore","Documentos dentro de coleções","Busca por documento e por campo indexado","Aplicação web e móvel, com tempo real e uso offline"],["Bigtable","Coluna larga, com uma única chave de linha","Leitura por chave ou por faixa de chaves","Série temporal e telemetria com vazão muito alta"],["BigQuery","Tabelas colunares dentro de datasets","SQL analítico varrendo muito volume","Relatório, painel e análise sobre o histórico"]]',
                },
                {
                    type: "text",
                    value: "## Firestore: documento, tempo real e offline\n\nO Firestore no modo nativo é um banco de documentos NoSQL feito para escala automática e desenvolvimento rápido de aplicação. Ele é **serverless**, tem **notificação em tempo real**, em que o cliente recebe a mudança sem perguntar, e bibliotecas que funcionam **offline** no dispositivo, sincronizando quando a conexão volta.\n\nExistem dois modos, escolhidos na criação do banco com `--type`: **modo nativo**, que é o padrão e tem tempo real e offline, e **modo Datastore**, mantido para quem vem do Datastore antigo. A documentação atual também traz compatibilidade com a API do MongoDB. O local do banco, regional ou multirregional, é definido na criação.\n\nBackup no Firestore tem dois caminhos. A **exportação gerenciada** manda os dados para um bucket do Cloud Storage e a importação traz de volta; vale saber que a exportação cobra uma operação de leitura por documento exportado. Além dela existem **agendas de backup** e **recuperação para um ponto no tempo**, ligada com `--enable-pitr`, que permite exportar a partir de um instante dos últimos sete dias.",
                },
                {
                    type: "code",
                    value: 'gcloud firestore databases create --location=southamerica-east1 \\\n  --type=firestore-native --enable-pitr\n\ngcloud firestore export gs://backup-firestore --database="(default)"\ngcloud firestore import gs://backup-firestore/2026-03-10T12:00:00_41234/ \\\n  --database="(default)"',
                },
                {
                    type: "text",
                    value: "## Bigtable: chave de linha e vazão\n\nO Bigtable é uma tabela esparsa que escala para bilhões de linhas e milhares de colunas, organizada como um **mapa ordenado de chave e valor**. Cada linha é indexada por **uma única chave de linha**, e é por ela que a leitura acontece, de forma direta ou por faixa. Não existe junção, e o desenho da chave de linha é a decisão de arquitetura que define se o sistema vai funcionar.\n\nO perfil é vazão alta de leitura e escrita com latência baixa, em terabytes ou petabytes, para série temporal, métrica de IoT, dado de marketing, registro financeiro e grafo, com valor por célula em geral abaixo de 10 MB. O acesso é por bibliotecas de cliente, incluindo uma extensão compatível com a **HBase** para Java, e a documentação atual já mostra consulta em **GoogleSQL**.\n\nA hierarquia é **instância**, que contém **clusters**, que contêm **nós**. Dois detalhes cobrados: o **tipo de armazenamento, SSD ou HDD, é escolhido na instância, é permanente e vale para todos os clusters**; e uma instância pode ter clusters em até 8 regiões, com replicação automática entre eles, sendo apenas um cluster por zona. O backup de tabela é um recurso do próprio serviço, criado por cluster.",
                },
                {
                    type: "code",
                    value: 'gcloud bigtable instances create telemetria --display-name="Telemetria" \\\n  --cluster-config=id=telemetria-c1,zone=southamerica-east1-a,nodes=3 \\\n  --cluster-storage-type=ssd\n\ngcloud bigtable instances list\ngcloud bigtable backups create diario --instance=telemetria \\\n  --cluster=telemetria-c1 --table=eventos --retention-period=2w',
                },
                {
                    type: "text",
                    value: "## BigQuery: carregar dados e acompanhar o job\n\nO BigQuery é um armazém de dados sem servidor para administrar: você cria **dataset** e **tabela**, e o serviço cuida do resto. O local do dataset é definido na criação e **não muda depois**, então dataset e bucket de origem devem nascer no mesmo local, senão a carga ainda funciona mas gera cobrança de transferência de dados.\n\nAs formas de carregar são:\n\n- **carga em lote** a partir do Cloud Storage ou de arquivo local, nos formatos Avro, CSV, JSON delimitado por nova linha, ORC e Parquet;\n- **streaming** pela Storage Write API, quando o dado precisa aparecer quase na hora;\n- **consulta que grava o resultado** em uma tabela de destino;\n- **tabela externa**, que lê o arquivo no bucket sem copiar nada.\n\nA carga em lote aceita três disposições de escrita: `WRITE_APPEND`, que é o padrão e acrescenta, `WRITE_TRUNCATE`, que apaga o conteúdo antes de gravar, e `WRITE_EMPTY`, que só grava se a tabela estiver vazia.\n\nToda vez que você carrega, exporta, consulta ou copia, o BigQuery cria um **job** e o agenda. Os tipos são **query**, **load**, **extract** e **copy**, e os estados são `PENDING`, `RUNNING` e `DONE`. Atenção ao último: `DONE` significa terminado, não bem-sucedido, porque a falha aparece no resultado de erro do próprio job. Para acompanhar, use `bq ls --jobs=true` para listar, `bq show --job=true` para ver o detalhe e `bq cancel` para interromper; no console, o caminho é o histórico de jobs.",
                },
                {
                    type: "code",
                    value: 'bq --location=southamerica-east1 mk --dataset meu-projeto:vendas\n\nbq load --source_format=PARQUET --replace \\\n  vendas.pedidos gs://notas-fiscais-r2a/pedidos/*.parquet\nbq load --source_format=NEWLINE_DELIMITED_JSON --autodetect \\\n  vendas.eventos gs://notas-fiscais-r2a/eventos/*.json\n\nbq query --use_legacy_sql=false "SELECT COUNT(*) AS total FROM vendas.pedidos"\n\nbq ls --jobs=true --max_results=10 meu-projeto\nbq show --format=prettyjson --job=true JOB_ID\nbq cancel JOB_ID',
                },
                {
                    type: "text",
                    value: "## O que entra na conta do BigQuery\n\nA fatura tem duas metades independentes, e a prova cobra exatamente essa separação.\n\n**Armazenamento**: cobrado pelo que está guardado, com taxa de **armazenamento ativo** e taxa menor de **armazenamento de longo prazo**, aplicada automaticamente quando a tabela ou partição fica 90 dias sem ser modificada. Há 10 GiB por mês no nível gratuito, e o faturamento pode ser por bytes lógicos ou por bytes físicos.\n\n**Computação**: no modelo **sob demanda**, você paga por TiB varrido pela consulta, com 1 TiB por mês gratuito. Varrer menos colunas custa menos, e é por isso que `SELECT *` é caro. No modelo de **capacidade**, por edições, você reserva slots e paga pela capacidade, não pelo volume lido.\n\nVárias operações não entram na conta de computação: **carregar, copiar, exportar, excluir** e consultar metadados em `INFORMATION_SCHEMA`. Carga em lote pelo pool de slots compartilhado é gratuita, o que explica por que carga em lote vence streaming quando a pergunta é custo.\n\nPor último, a **viagem no tempo**: por padrão dá acesso aos últimos 7 dias de dados alterados ou excluídos, configurável de 2 a 7 dias, e consultada com `FOR SYSTEM_TIME AS OF`. Depois dela existe um período à prova de falhas de mais 7 dias, que não é consultável e só o suporte do Google recupera.",
                },
                {
                    type: "quote",
                    value: "Firestore guarda documento de aplicação, Bigtable devolve evento por chave de linha e BigQuery responde pergunta analítica sobre o histórico.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual produto é um banco de documentos NoSQL com notificação em tempo real e suporte a uso offline no cliente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O Bigtable, com a API HBase",
                            isCorrect: false,
                        },
                        {
                            text: "O Firestore, no modo nativo",
                            isCorrect: true,
                        },
                        {
                            text: "O BigQuery, com consultas SQL",
                            isCorrect: false,
                        },
                        {
                            text: "O Cloud SQL, com MySQL 8",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um sistema de telemetria grava milhões de eventos por segundo, consulta sempre por uma chave de linha e precisa de latência de poucos milissegundos. Qual produto atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O BigQuery, armazém de dados para consulta analítica",
                            isCorrect: false,
                        },
                        {
                            text: "O Firestore, banco de documentos para aplicação móvel",
                            isCorrect: false,
                        },
                        {
                            text: "O Bigtable, banco de coluna larga para chave e valor",
                            isCorrect: true,
                        },
                        {
                            text: "O Cloud SQL, banco relacional gerenciado com réplicas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a forma mais econômica de colocar 2 TB de arquivos Parquet que já estão em um bucket dentro de uma tabela do BigQuery?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inserção por streaming pela Storage Write API do BigQuery",
                            isCorrect: false,
                        },
                        {
                            text: "Um job de carga em lote que lê os arquivos Parquet do bucket",
                            isCorrect: true,
                        },
                        {
                            text: "Uma consulta federada no bucket que grava o resultado em tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Exportação para CSV e depois carga manual pelo console do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de disparar uma carga no BigQuery pela linha de comando, como a equipe verifica se o job terminou e por que ele falhou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com gcloud storage ls no bucket que serviu de origem da carga",
                            isCorrect: false,
                        },
                        {
                            text: "Com bq ls --jobs=true e bq show --job=true no ID do job",
                            isCorrect: true,
                        },
                        {
                            text: "Com bq query lendo a tabela de destino a cada minuto",
                            isCorrect: false,
                        },
                        {
                            text: "Com gcloud sql operations list no projeto do dataset",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No modelo sob demanda do BigQuery, o que entra na fatura de uma tabela que é consultada todo dia?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Apenas o armazenamento, porque a consulta é sempre gratuita",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas os bytes processados, porque o armazenamento é gratuito",
                            isCorrect: false,
                        },
                        {
                            text: "O armazenamento da tabela e os bytes processados pela consulta",
                            isCorrect: true,
                        },
                        {
                            text: "O número de linhas devolvidas e o tempo de execução",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Rede na VPC",
    aulas: [
        {
            titulo: "VPC, sub-redes e endereços IP",
            blocks: [
                {
                    type: "text",
                    value: "No Google Cloud a rede não é um equipamento que você liga depois de criar as máquinas. A **rede VPC** existe antes delas, é definida por software e é um recurso **global**: uma única VPC atende instâncias em qualquer região do projeto, sem túnel nem roteador seu no meio.\n\nIsso muda a ordem das decisões. Primeiro você desenha o espaço de endereços, depois escolhe em que região cada sub-rede vai viver, e só então sobe a instância apontando para essa sub-rede. Quem inverte a ordem acaba com faixas sobrepostas que mais tarde impedem peering e VPN, e refazer faixa de IP com carga em produção custa parada.",
                },
                {
                    type: "text",
                    value: "## Modo automático contra modo personalizado\n\nToda VPC nasce em um dos dois modos de criação de sub-rede:\n\n- **Modo automático**: o Google cria uma sub-rede por região, com faixas predefinidas dentro de `10.128.0.0/9`, e vai criando sub-rede nova conforme regiões novas aparecem.\n- **Modo personalizado**: nenhuma sub-rede é criada junto com a rede. Você decide quais regiões usar e qual faixa cada uma recebe.\n\nTodo projeto novo já vem com uma rede chamada `default`, que é uma VPC em modo automático com regras de firewall pré-populadas, a menos que uma política da organização impeça a criação. Ela serve para um teste rápido e atrapalha em produção, porque as faixas de `10.128.0.0/9` entram sem você pedir e podem colidir com o endereçamento do datacenter ou de outra nuvem no dia do peering.\n\nA conversão é de mão única: uma VPC de modo automático pode virar personalizada, mas a documentação é explícita em dizer que **não existe caminho de volta**. Produção usa modo personalizado por isso: faixa previsível e nenhuma sub-rede aparecendo sozinha.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Modo automático","Modo personalizado"],["Sub-redes ao criar a rede","Uma por região, faixa predefinida","Nenhuma, você cria uma a uma"],["Faixa de IP usada","Dentro de 10.128.0.0/9","A faixa privada que você escolher"],["Região nova no Google","Ganha sub-rede automaticamente","Nada muda sem você pedir"],["Risco de sobreposição","Alto em peering, VPN e Interconnect","Sob seu controle"],["Conversão de modo","Pode virar personalizado","Não volta para automático"]]',
                },
                {
                    type: "code",
                    value: "gcloud compute networks create vpc-prod --subnet-mode=custom --bgp-routing-mode=regional\n\ngcloud compute networks subnets create sub-sp-app \\\n  --network=vpc-prod --region=southamerica-east1 --range=10.20.0.0/20\n\ngcloud compute networks subnets create sub-sp-gke \\\n  --network=vpc-prod --region=southamerica-east1 --range=10.20.16.0/20 \\\n  --secondary-range=pods=10.60.0.0/14,servicos=10.64.0.0/20",
                },
                {
                    type: "text",
                    value: "## A sub-rede é regional e tem faixa primária e secundária\n\nA sub-rede é um recurso **regional**: nasce dentro de uma região e atende todas as zonas daquela região. Para rodar em três regiões você cria três sub-redes na mesma VPC, não três VPCs.\n\nCada sub-rede tem uma **faixa primária de IPv4**, de onde sai o endereço interno principal de cada interface de rede, e pode ter uma ou mais **faixas secundárias**, que a documentação reserva a um uso só: intervalos de **IP de alias**. É daí que vêm os endereços de pods e de serviços de um cluster do GKE com IP nativo da VPC.\n\nDois detalhes que a prova cobra sem rodeio:\n\n- A faixa primária pode ser **ampliada** depois de criada, mas não pode ser substituída nem **reduzida**. Planeje com folga, porque encolher não é uma operação que exista.\n- O Google usa os **dois primeiros e os dois últimos** endereços de cada faixa primária, ou seja, quatro endereços não ficam para você. A `/29` é a máscara mais longa permitida e sobra com quatro endereços úteis.\n\nA faixa secundária é mais flexível em um ponto e mais rígida em outro: ela pode ser removida e trocada, mas só enquanto nenhuma instância estiver usando aquele intervalo.",
                },
                {
                    type: "code",
                    value: 'gcloud compute networks subnets expand-ip-range sub-sp-app \\\n  --region=southamerica-east1 --prefix-length=19\n\ngcloud compute networks subnets list --filter="network:vpc-prod"\ngcloud compute networks subnets describe sub-sp-app --region=southamerica-east1',
                },
                {
                    type: "text",
                    value: "## Endereço interno, endereço externo e o que estático quer dizer\n\nToda interface de rede de uma VM recebe um **endereço interno** tirado da faixa primária da sub-rede, e é com ele que a instância conversa com o resto da VPC. Para falar com a internet ela precisa de um **endereço externo**, e aí vêm duas escolhas independentes.\n\nA primeira é **efêmero contra estático**. O efêmero é devolvido quando a instância é apagada e, em IPv4 externo, também troca quando a VM é parada e iniciada de novo. O estático é um recurso reservado no projeto: sobrevive à instância e pode ser movido para outra. Um endereço efêmero que já está em uso pode ser **promovido** a estático sem trocar de número, reservando aquele mesmo valor.\n\nA segunda é **regional contra global**. Endereço externo regional serve VM, balanceador de rede de passagem e gateway do Cloud NAT. Endereço externo **global** existe para o balanceador de carga de aplicação externo global e para o balanceador de rede proxy externo global, e a documentação exige nível de rede Premium em todo endereço externo global.\n\nE existe o caso mais comum em produção séria: a VM **sem endereço externo nenhum**. Ela continua falando com a VPC pelo endereço interno, alcança as APIs do Google pelo Acesso privado do Google e sai para a internet por um gateway do Cloud NAT, sem nunca aceitar conexão vinda de fora.",
                },
                {
                    type: "code",
                    value: "gcloud compute addresses create ip-nat-sp --region=southamerica-east1\ngcloud compute addresses create ip-lb-global --global --ip-version=IPV4\n\ngcloud compute addresses create ip-promovido \\\n  --addresses=34.95.0.10 --region=southamerica-east1\n\ngcloud compute instances create app-1 --zone=southamerica-east1-a \\\n  --subnet=sub-sp-app --no-address --tags=app-web",
                },
                {
                    type: "table",
                    value: '[["Recurso de rede","Escopo","Consequência prática"],["Rede VPC","Global","Uma rede atende todas as regiões do projeto"],["Regra de firewall da VPC","Global","Vale na rede inteira, recortada pelo alvo"],["Rota","Global","Entra na tabela de roteamento de toda a rede"],["Sub-rede","Regional","Precisa de uma por região que você usar"],["Endereço externo estático regional","Regional","Só liga em recurso da mesma região"],["Endereço externo estático global","Global","Serve balanceador global e exige Premium"],["Instância e sua interface de rede","Zonal","Cai junto com a zona"]]',
                },
                {
                    type: "quote",
                    value: "A rede VPC é global, a sub-rede é regional e a instância é zonal. A faixa da sub-rede cresce, mas nunca encolhe.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um time criou um projeto e quer subir instâncias em três regiões diferentes. Qual é o número mínimo de redes VPC necessário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma, porque a rede VPC é global e aceita sub-redes em cada região",
                            isCorrect: true,
                        },
                        {
                            text: "Três, uma rede VPC por região, com peering de VPC ligando as três",
                            isCorrect: false,
                        },
                        {
                            text: "Três, porque a rede VPC é um recurso regional como a sub-rede",
                            isCorrect: false,
                        },
                        {
                            text: "Duas, uma rede VPC global e outra regional para o que sobrar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a recomendação para produção é criar a rede VPC em modo personalizado em vez de modo automático?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque nenhuma sub-rede nasce sozinha e você escolhe cada faixa de IP",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o modo personalizado permite voltar para o modo automático depois",
                            isCorrect: false,
                        },
                        {
                            text: "Porque só o modo personalizado aceita regra de firewall e rota estática",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modo automático limita a rede a uma única região por projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma sub-rede foi criada com a faixa primária 10.20.0.0/24 e já está sem endereços livres. O que a documentação permite fazer com essa faixa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ampliar a faixa com um prefixo mais curto, como 10.20.0.0/22",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir a faixa para 10.20.0.0/26 e criar outra sub-rede no resto",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a faixa por 10.30.0.0/22 sem recriar a sub-rede",
                            isCorrect: false,
                        },
                        {
                            text: "Mover a faixa para outra região e herdar os endereços de lá",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A equipe vai reservar um endereço IP externo estático para servir um balanceador de carga de aplicação externo global. Qual reserva atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Endereço externo global, que exige nível de rede Premium",
                            isCorrect: true,
                        },
                        {
                            text: "Endereço externo regional na região dos backends",
                            isCorrect: false,
                        },
                        {
                            text: "Endereço interno estático reservado na sub-rede dos backends",
                            isCorrect: false,
                        },
                        {
                            text: "Endereço externo regional com nível de rede Standard",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma VM foi criada sem endereço IP externo e nenhum outro recurso de rede foi configurado. O que ela consegue fazer nessa situação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falar com outros recursos da VPC usando o endereço interno",
                            isCorrect: true,
                        },
                        {
                            text: "Receber conexão vinda da internet no seu endereço interno",
                            isCorrect: false,
                        },
                        {
                            text: "Baixar pacote de repositório público da internet sem mais nada",
                            isCorrect: false,
                        },
                        {
                            text: "Sair para a internet, porque o NAT já vem ligado na sub-rede",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Regras de firewall e rotas",
            blocks: [
                {
                    type: "text",
                    value: "O firewall da VPC não é uma caixa no meio do caminho. Ele é distribuído e aplicado **em cada instância**, antes do pacote entrar ou depois dele sair da interface de rede. Por isso a regra não protege uma sub-rede inteira por acidente: ela vale para os alvos que você declarar dentro da rede.\n\nDuas consequências importam na prova. A regra de firewall é um recurso **global** da VPC, então uma regra só pode atender instâncias de várias regiões. E as regras são **com estado**: liberada a conexão em um sentido, o tráfego de resposta volta sem precisar de regra espelhada.",
                },
                {
                    type: "text",
                    value: "## O que já existe antes da sua primeira regra\n\nToda VPC traz duas **regras implícitas** que não aparecem na lista e não podem ser apagadas, com prioridade `65535`, a mais baixa possível:\n\n- **Entrada negada**: nenhuma conexão de entrada passa, venha de onde vier.\n- **Saída permitida**: qualquer conexão de saída passa, desde que exista rota para o destino.\n\nA rede `default`, que é criada junto com o projeto, vai além e traz quatro regras pré-populadas com prioridade `65534`: `default-allow-internal` liberando o tráfego entre as faixas da própria rede, `default-allow-ssh` na porta 22 vindo de `0.0.0.0/0`, `default-allow-rdp` na porta 3389 e `default-allow-icmp`. Deixar SSH aberto para a internet inteira é justamente o que uma VPC personalizada evita.",
                },
                {
                    type: "table",
                    value: '[["Regra","Direção","Ação","Prioridade","Onde existe"],["Entrada negada implícita","Entrada","Negar","65535","Toda VPC, não se apaga"],["Saída permitida implícita","Saída","Permitir","65535","Toda VPC, não se apaga"],["default-allow-internal","Entrada","Permitir","65534","Só na rede default"],["default-allow-ssh","Entrada","Permitir","65534","Só na rede default"],["default-allow-rdp","Entrada","Permitir","65534","Só na rede default"],["default-allow-icmp","Entrada","Permitir","65534","Só na rede default"]]',
                },
                {
                    type: "text",
                    value: "## Anatomia da regra: prioridade e alvo\n\nUma regra de firewall da VPC escolhe uma **direção** por vez, entrada ou saída, nunca as duas. A **prioridade** é um inteiro de `0` a `65535`, com `1000` como padrão, e aqui o número engana: **quanto menor, mais forte**. Uma regra de permissão com prioridade 900 vence uma de negação com prioridade 1000 para o mesmo tráfego.\n\nA **ação** só tem dois valores, permitir ou negar. O que realmente define o alcance da regra é o **alvo**:\n\n- **Todas as instâncias da rede**, quando você não restringe nada.\n- **Tag de rede**, um rótulo de texto que você pendura na instância. É o alvo que o objetivo oficial do exame cita, e o mais fácil de errar: quem consegue editar a instância consegue se dar a tag e entrar no escopo da regra.\n- **Conta de serviço**, que amarra a regra à identidade com que a instância roda. Trocar a conta de serviço exige parar a VM e ter permissão sobre a conta, o que torna o alvo mais difícil de forjar.\n\nOs dois alvos não convivem: a documentação diz que não se usa conta de serviço de destino e tag de rede de destino juntas na mesma regra.",
                },
                {
                    type: "code",
                    value: 'gcloud compute firewall-rules create permite-health-check \\\n  --network=vpc-prod --direction=ingress --action=allow \\\n  --rules=tcp:80 --source-ranges=35.191.0.0/16 --target-tags=app-web --priority=900\n\ngcloud compute firewall-rules create permite-api-no-banco \\\n  --network=vpc-prod --direction=ingress --action=allow --rules=tcp:5432 \\\n  --source-ranges=10.20.0.0/20 \\\n  --target-service-accounts=db@projeto-prod.iam.gserviceaccount.com\n\ngcloud compute firewall-rules create nega-saida-geral \\\n  --network=vpc-prod --direction=egress --action=deny --rules=all \\\n  --destination-ranges=0.0.0.0/0 --target-tags=sem-internet --priority=2000\n\ngcloud compute firewall-rules list --filter="network:vpc-prod" --sort-by=priority',
                },
                {
                    type: "text",
                    value: '## Política hierárquica de firewall\n\nRegra de firewall da VPC vive dentro de um projeto, então uma exigência corporativa do tipo "porta 23 bloqueada em tudo" depende de cada equipe lembrar de criar a regra. A **política hierárquica de firewall** resolve isso: ela agrupa regras em um objeto que se associa à **organização** ou a **pastas**, e passa a valer para as VPCs dos projetos abaixo.\n\nDuas diferenças em relação à regra da VPC importam. A prioridade vai de `0` até `2147483547`, bem além do teto da VPC. E além de permitir e negar existe a ação **goto_next**, que para de avaliar aquela política e manda a decisão para o passo seguinte, deixando o projeto decidir o caso.\n\nNa ordem de avaliação padrão, o Cloud NGFW avalia primeiro as políticas hierárquicas, da organização para as pastas, depois as políticas de sistema regionais, depois as regras de firewall da VPC, depois as políticas de firewall de rede global e regional, e por último a ação implícita. Quem nega no topo não é desfeito lá embaixo.',
                },
                {
                    type: "text",
                    value: "## Rotas: como o pacote sabe para onde ir\n\nA tabela de roteamento da VPC se monta com quatro origens:\n\n- **Rotas de sub-rede**, criadas e removidas pelo Google junto com cada sub-rede, para que as faixas internas se alcancem.\n- A **rota padrão** gerada pelo sistema, com destino `0.0.0.0/0` e próximo salto `default-internet-gateway`. É ela que dá saída para a internet, e ela pode ser apagada ou substituída. Apagar a rota padrão derruba a saída de todas as instâncias da rede, inclusive a do Cloud NAT.\n- **Rotas estáticas personalizadas**, que você cria apontando o próximo salto: uma instância, a regra de encaminhamento de um balanceador de rede de passagem interno, um túnel de VPN clássica ou o próprio gateway de internet.\n- **Rotas dinâmicas**, aprendidas por BGP pelo Cloud Router quando existe VPN de alta disponibilidade ou Interconnect.\n\nEntre rotas que servem o mesmo destino, o Google escolhe primeiro a de **destino mais específico**. Empatando o prefixo, entra a prioridade, onde o número menor ganha. E a rota estática aceita **tags de rede**, o que permite mandar só as instâncias marcadas por um appliance de inspeção e deixar as outras saindo pelo caminho normal.",
                },
                {
                    type: "code",
                    value: 'gcloud compute routes create rota-inspecao \\\n  --network=vpc-prod --destination-range=0.0.0.0/0 --priority=800 \\\n  --next-hop-instance=appliance-1 --next-hop-instance-zone=southamerica-east1-a \\\n  --tags=inspecionar\n\ngcloud compute routes create rota-saida-interna \\\n  --network=vpc-prod --destination-range=192.168.50.0/24 --priority=1000 \\\n  --next-hop-gateway=default-internet-gateway\n\ngcloud compute routes list --filter="network:vpc-prod"',
                },
                {
                    type: "table",
                    value: '[["Próximo salto da rota estática","Para que serve"],["default-internet-gateway","Saída para a internet, inclusive em rota mais específica"],["Instância do Compute Engine","Appliance de inspeção, proxy ou gateway próprio"],["Balanceador de rede de passagem interno","Vários appliances atrás de um só endereço"],["Túnel de VPN clássica","Faixa do datacenter com roteamento estático"]]',
                },
                {
                    type: "quote",
                    value: "Prioridade de firewall com número menor ganha, e a regra de negação não tem privilégio nenhum sobre a de permissão.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma VPC em modo personalizado foi criada e nenhuma regra de firewall foi adicionada. O que acontece com o tráfego das instâncias dessa rede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A entrada é negada e a saída é permitida pelas regras implícitas",
                            isCorrect: true,
                        },
                        {
                            text: "A entrada e a saída são negadas até a primeira regra ser criada",
                            isCorrect: false,
                        },
                        {
                            text: "A entrada é permitida e a saída é negada pelas regras implícitas",
                            isCorrect: false,
                        },
                        {
                            text: "A entrada e a saída são permitidas porque não há regra aplicada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas regras de entrada se aplicam à mesma instância e à mesma porta: uma nega com prioridade 1000 e outra permite com prioridade 900. O que acontece com a conexão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É permitida, porque o número menor de prioridade é o que vence",
                            isCorrect: true,
                        },
                        {
                            text: "É negada, porque a regra de negação sempre vence a de permissão",
                            isCorrect: false,
                        },
                        {
                            text: "É negada, porque o número maior de prioridade é o que vence",
                            isCorrect: false,
                        },
                        {
                            text: "É descartada nas duas pontas, porque as regras se anulam",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação sobre o alvo de uma regra de firewall da VPC está correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma mesma regra não aceita tag de rede e conta de serviço como alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Uma mesma regra precisa de tag de rede e conta de serviço como alvo",
                            isCorrect: false,
                        },
                        {
                            text: "Tag de rede só vale em regra de saída e conta de serviço só na entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Conta de serviço como alvo exige que a regra tenha prioridade zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A segurança corporativa precisa negar a porta 23 em todos os projetos da organização, sem depender de cada equipe criar a regra na sua VPC. Qual recurso atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Política hierárquica de firewall associada à organização",
                            isCorrect: true,
                        },
                        {
                            text: "Regra de firewall da VPC no projeto host da rede",
                            isCorrect: false,
                        },
                        {
                            text: "Rota estática personalizada com prioridade zero para a porta 23",
                            isCorrect: false,
                        },
                        {
                            text: "Restrição de política da organização que apaga regra de firewall",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Só as instâncias marcadas com uma tag devem enviar o tráfego de saída para um appliance de inspeção que roda em outra VM da mesma VPC. Qual configuração atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rota estática com próximo salto na instância e filtro por tag",
                            isCorrect: true,
                        },
                        {
                            text: "Regra de firewall de saída com o appliance como alvo da regra",
                            isCorrect: false,
                        },
                        {
                            text: "Peering de VPC entre a sub-rede da VM e a do appliance",
                            isCorrect: false,
                        },
                        {
                            text: "Rota de sub-rede editada para apontar para o endereço do appliance",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Conectar redes: peering, VPC compartilhada e VPN",
            blocks: [
                {
                    type: "text",
                    value: "Uma VPC resolve o tráfego dentro dela. O trabalho começa de verdade quando aparecem três perguntas diferentes, que a prova gosta de misturar:\n\n- duas redes VPC separadas precisam se falar pelo endereço interno;\n- vários projetos precisam compartilhar **a mesma** sub-rede, sem perder a separação de faturamento e de IAM;\n- a nuvem precisa alcançar um datacenter próprio ou outra nuvem.\n\nCada pergunta tem uma resposta certa e nenhuma das três resolve as outras duas. Confundir peering com VPC compartilhada é o erro mais comum nesse objetivo.",
                },
                {
                    type: "text",
                    value: "## Peering de VPC: duas redes, nenhum salto extra\n\nO **peering de rede VPC** liga duas VPCs para que os recursos de cada lado se alcancem pelo endereço interno, com a mesma latência e vazão do tráfego de dentro de uma única rede. As redes podem estar em projetos diferentes e até em organizações diferentes.\n\nQuatro regras definem o comportamento, e cada uma já virou questão:\n\n- **Não é transitivo.** Se `rede-a` tem peering com `rede-b` e também com `rede-c`, isso não cria conectividade entre `rede-b` e `rede-c`. Para ligar as três, são três peerings.\n- **Cada lado configura o seu.** A conexão só fica `ACTIVE` quando as duas redes têm uma configuração de peering apontando para a outra. Uma ponta sozinha fica esperando.\n- **As faixas não podem se sobrepor.** Nenhuma faixa de sub-rede pode ser igual, conter ou caber dentro de uma faixa da rede vizinha.\n- **Firewall não atravessa.** O peering troca rotas, não regras. A documentação deixa claro que regras de firewall e políticas de firewall não são trocadas, então cada lado precisa liberar o tráfego do vizinho na sua própria rede.",
                },
                {
                    type: "code",
                    value: "gcloud compute networks peerings create liga-com-dados \\\n  --network=vpc-prod --peer-project=projeto-dados --peer-network=vpc-dados\n\ngcloud compute networks peerings create liga-com-prod \\\n  --network=vpc-dados --peer-project=projeto-prod --peer-network=vpc-prod\n\ngcloud compute networks peerings list --network=vpc-prod",
                },
                {
                    type: "text",
                    value: "## VPC compartilhada: uma rede, muitos projetos\n\nPeering liga redes diferentes. A **VPC compartilhada** faz o contrário: mantém **uma** rede e deixa vários projetos usarem as sub-redes dela. O **projeto host** é quem guarda a rede, as sub-redes, as regras de firewall e as rotas. Os **projetos de serviço** são anexados ao host e passam a criar instâncias dentro daquelas sub-redes, cada um com o seu próprio faturamento, suas APIs e seu IAM.\n\nDuas restrições estruturais: host e projetos de serviço precisam estar na **mesma organização**, e um projeto não pode ser host e de serviço ao mesmo tempo, o que impede encadear uma VPC compartilhada dentro da outra.\n\nOs papéis dividem o trabalho em duas pontas. O **administrador da VPC compartilhada** precisa de `roles/compute.xpnAdmin` junto com `roles/resourcemanager.projectIamAdmin`, concedidos no nível da **organização** ou de pastas, e é quem habilita o host e anexa os projetos de serviço. Do outro lado, quem vai subir instância no projeto de serviço precisa de `roles/compute.networkUser`, concedido no projeto host inteiro ou, melhor ainda, apenas nas sub-redes que aquele time pode usar.",
                },
                {
                    type: "table",
                    value: '[["Papel","Onde é concedido","Quem usa","Para que serve"],["roles/compute.xpnAdmin","Organização ou pasta","Administrador da VPC compartilhada","Habilitar o host e anexar projetos de serviço"],["roles/resourcemanager.projectIamAdmin","Organização ou pasta","Administrador da VPC compartilhada","Conceder papéis nos projetos envolvidos"],["roles/compute.networkUser","Projeto host ou sub-rede","Time do projeto de serviço","Criar recursos usando a sub-rede compartilhada"],["roles/compute.networkAdmin","Projeto host","Rede delegada pelo administrador","Mexer em sub-rede, rota e endereço reservado"],["roles/compute.securityAdmin","Projeto host","Segurança delegada","Mexer em regra de firewall e certificado SSL"]]',
                },
                {
                    type: "code",
                    value: "gcloud compute shared-vpc enable projeto-host-rede\n\ngcloud compute shared-vpc associated-projects add projeto-app-1 \\\n  --host-project=projeto-host-rede\n\ngcloud compute networks subnets get-iam-policy sub-sp-app \\\n  --region=southamerica-east1 --project=projeto-host-rede --format=json > politica.json\n\ngcloud compute networks subnets set-iam-policy sub-sp-app politica.json \\\n  --region=southamerica-east1 --project=projeto-host-rede",
                },
                {
                    type: "text",
                    value: "## Conectividade híbrida: internet, fibra ou parceiro\n\nPara alcançar um datacenter próprio existem duas famílias. A **Cloud VPN** sobe um túnel IPsec **pela internet pública**, barato e rápido de provisionar. O **Cloud Interconnect** entrega uma conexão **física**, com banda alta e sem passar pela internet.\n\nDentro da VPN, a diferença que a prova cobra é entre as duas gerações:\n\n- A **VPN de alta disponibilidade** tem um gateway com **duas interfaces**, cada uma com seu endereço externo, e a documentação cita SLA de **99,99%** na maioria das topologias. Ela aceita **somente roteamento dinâmico**, o que obriga a configurar BGP em um Cloud Router.\n- A **VPN clássica** tem uma interface só, SLA de **99,9%** e **somente roteamento estático**, baseado em política ou em rota. Sem BGP, cada faixa nova do outro lado é trabalho manual.\n\nNo Interconnect, o **Dedicated** é uma conexão direta com o Google em circuitos de 10, 100 ou 400 Gbps, com anexos de VLAN de 50 Mbps a 50 Gbps, e exige presença em uma instalação de colocation. O **Partner** usa um provedor de serviço no meio, para quem não tem essa presença. O **Cross-Cloud Interconnect** liga outra nuvem ao Google Cloud. Já **Direct Peering** e **Carrier Peering** não são conectividade privada: eles trocam tráfego com a borda do Google, não têm SLA e as rotas do seu datacenter não aparecem em nenhuma VPC.",
                },
                {
                    type: "table",
                    value: '[["Opção","SLA citado na documentação","Roteamento","Quando escolher"],["VPN de alta disponibilidade","99,99% na maioria das topologias","Só dinâmico, com BGP no Cloud Router","Túnel pela internet com SLA alto"],["VPN clássica","99,9%","Só estático, por política ou por rota","Cenário legado, sem BGP do outro lado"],["Dedicated Interconnect","Nas topologias definidas pelo Google","Dinâmico, com BGP","Banda alta com conexão física direta"],["Partner Interconnect","Do Google até o provedor de serviço","Dinâmico, com BGP","Sem presença na colocation do Google"],["Cross-Cloud Interconnect","Com conexões redundantes","Dinâmico, com BGP","Ligar outra nuvem ao Google Cloud"],["Direct Peering e Carrier Peering","Nenhum","Rota não entra na VPC","Troca de tráfego, não conectividade privada"]]',
                },
                {
                    type: "text",
                    value: '## Escolhendo em cima do requisito\n\nO caminho mais rápido para acertar a questão é ler o requisito e não o produto:\n\n1. "Projetos diferentes usando **a mesma sub-rede**, com cobrança separada": VPC compartilhada.\n2. "Duas redes VPC, cada uma com o seu dono, trocando tráfego interno": peering de VPC.\n3. "Três redes se falando entre si": peering não serve em cadeia, então são três peerings ou um hub com Network Connectivity Center.\n4. "Datacenter próprio, SLA de 99,99%, pouco tempo de provisionamento": VPN de alta disponibilidade.\n5. "Vários gigabits por segundo, tráfego fora da internet pública": Dedicated Interconnect, ou Partner quando falta presença física.\n\nVale lembrar que a VPC compartilhada e o peering resolvem endereçamento interno, mas nenhum dos dois duplica a política de segurança: em todos os casos o firewall de cada rede continua sendo a última palavra.',
                },
                {
                    type: "quote",
                    value: "Peering de VPC não é transitivo e não troca regra de firewall. VPC compartilhada não encadeia host dentro de host.",
                },
            ],
            questions: [
                {
                    statement:
                        "As redes vpc-a e vpc-b estão em peering, e vpc-a também está em peering com vpc-c. O que acontece com o tráfego entre vpc-b e vpc-c?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não há conectividade, porque o peering não é transitivo",
                            isCorrect: true,
                        },
                        {
                            text: "Há conectividade, porque o peering propaga rotas em cadeia",
                            isCorrect: false,
                        },
                        {
                            text: "Há conectividade só de saída, nunca de entrada em vpc-c",
                            isCorrect: false,
                        },
                        {
                            text: "Há conectividade desde que as faixas de IP não se sobreponham",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma VPC compartilhada, qual papel o time do projeto de serviço precisa receber para criar instâncias em uma sub-rede do projeto host?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usuário da rede do Compute, roles/compute.networkUser, na sub-rede",
                            isCorrect: true,
                        },
                        {
                            text: "Administrador da VPC compartilhada, roles/compute.xpnAdmin, na pasta",
                            isCorrect: false,
                        },
                        {
                            text: "Administrador de rede do Compute, roles/compute.networkAdmin, no host",
                            isCorrect: false,
                        },
                        {
                            text: "Administrador de segurança, roles/compute.securityAdmin, no host",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação sobre projeto host e projeto de serviço na VPC compartilhada está correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um projeto não pode ser host e de serviço ao mesmo tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Um projeto de serviço pode ser host de outros projetos de serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Host e projetos de serviço podem ficar em organizações diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "O projeto de serviço cria as sub-redes e as rotas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A empresa precisa ligar o datacenter próprio ao Google Cloud com SLA de 99,99% e roteamento dinâmico, sem esperar provisionamento de circuito físico. Qual opção atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "VPN de alta disponibilidade, com BGP em um Cloud Router",
                            isCorrect: true,
                        },
                        {
                            text: "VPN clássica, com rota estática para a faixa do datacenter",
                            isCorrect: false,
                        },
                        {
                            text: "Dedicated Interconnect, com circuito de 10 Gbps em colocation",
                            isCorrect: false,
                        },
                        {
                            text: "Direct Peering com a borda do Google, sem usar Cloud Router",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas equipes precisam de instâncias em projetos separados, para faturamento e IAM independentes, mas na mesma sub-rede e sob um firewall único. Qual recurso atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "VPC compartilhada, com a rede vivendo no projeto host",
                            isCorrect: true,
                        },
                        {
                            text: "Peering de VPC entre as duas redes, com faixas distintas",
                            isCorrect: false,
                        },
                        {
                            text: "VPN de alta disponibilidade entre os dois projetos do time",
                            isCorrect: false,
                        },
                        {
                            text: "Rota estática personalizada apontando de uma rede para a outra",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Balanceamento de carga e Cloud DNS",
            blocks: [
                {
                    type: "text",
                    value: "Balanceador de carga no Google Cloud não é uma máquina virtual que você administra. É um conjunto de recursos ligados em cadeia: uma **regra de encaminhamento** com endereço IP e porta, um **proxy de destino** quando há proxy, um **mapa de URL** quando a decisão é por caminho, um **serviço de back-end** com a política de distribuição e uma **verificação de integridade** que decide quem está apto a receber tráfego.\n\nEntender essa cadeia resolve metade das questões, porque a outra metade é escolher a família certa. E a família se escolhe por três perguntas: qual protocolo, de onde vem o cliente e o back-end precisa ver o endereço de origem.",
                },
                {
                    type: "text",
                    value: "## As três famílias atuais\n\nA documentação organiza os balanceadores em três famílias:\n\n- **Balanceador de carga de aplicação**, na camada 7, só para HTTP e HTTPS. É quem roteia por host e por caminho de URL, encerra TLS, usa Cloud CDN e aplica Cloud Armor.\n- **Balanceador de carga de rede proxy**, na camada 4, para TCP com descarga de SSL opcional nas variantes externas. Ele também é um proxy reverso: encerra a conexão do cliente e abre outra para o back-end.\n- **Balanceador de carga de rede de passagem**, na camada 4, o único que vai além de TCP: aceita **TCP, UDP, ESP, GRE, ICMP e ICMPv6**. Ele não é proxy. Os pacotes chegam ao back-end com endereço de origem, endereço de destino, protocolo e portas **inalterados**, e a resposta volta direto do back-end para o cliente, no padrão de retorno direto do servidor.\n\nDaí sai a regra de ouro: quem precisa de **UDP** ou precisa que a aplicação veja o **IP real do cliente** usa balanceador de rede de passagem. Nas outras famílias o back-end vê o endereço do proxy, e o endereço do cliente chega, no caso do HTTP, dentro de um cabeçalho.",
                },
                {
                    type: "table",
                    value: '[["Família","Camada","Protocolos","Proxy ou passagem","Back-end vê o IP do cliente"],["Aplicação","7","HTTP, HTTPS e HTTP/2","Proxy reverso","Não, só por cabeçalho"],["Rede proxy","4","TCP, com SSL opcional","Proxy reverso","Não por padrão"],["Rede de passagem","4","TCP, UDP, ESP, GRE e ICMP","Passagem, retorno direto","Sim, pacote inalterado"]]',
                },
                {
                    type: "text",
                    value: "## Externo ou interno, global ou regional\n\nCada família tem variantes **externas**, para clientes da internet, e **internas**, para clientes dentro da VPC ou do datacenter conectado. E tem variantes **globais** e **regionais**, que é o eixo que decide carga de várias regiões.\n\nO balanceador de carga de **aplicação externo global** usa um único endereço IP anycast e tem serviços de back-end globais: você anexa grupos de instâncias ou grupos de endpoints de rede de três regiões no mesmo serviço, e o Google entrega cada usuário na região mais próxima que ainda tenha capacidade, com transbordo automático quando uma região satura ou cai. Esse é o desenho padrão para carga de várias regiões. Como todo endereço externo global exige nível de rede **Premium**, essa escolha também trava o nível de rede.\n\nNas variantes regionais o tráfego nasce e morre em uma região, e várias regiões significam vários balanceadores e um nome DNS resolvendo para eles. Funciona, mas o failover passa a depender do TTL do registro, não do balanceador. Do lado interno, o **balanceador de aplicação interno entre regiões** e o **de rede de passagem interno** cobrem o tráfego que nunca sai da VPC, e o de passagem interno ainda serve como próximo salto de rota estática.",
                },
                {
                    type: "code",
                    value: "gcloud compute health-checks create http hc-http --port=80\n\ngcloud compute backend-services create bs-web --global \\\n  --load-balancing-scheme=EXTERNAL_MANAGED --protocol=HTTP \\\n  --port-name=http --health-checks=hc-http\n\ngcloud compute backend-services add-backend bs-web --global \\\n  --instance-group=mig-sp --instance-group-region=southamerica-east1\n\ngcloud compute url-maps create mapa-web --default-service=bs-web\ngcloud compute target-http-proxies create proxy-web --url-map=mapa-web\n\ngcloud compute forwarding-rules create regra-web --global \\\n  --load-balancing-scheme=EXTERNAL_MANAGED --target-http-proxy=proxy-web \\\n  --address=ip-lb-global --ports=80",
                },
                {
                    type: "text",
                    value: "## O de passagem na prática\n\nO balanceador de rede de passagem **externo** é regional e trabalha com serviço de back-end regional. Repare na diferença de esquema: aqui o `--load-balancing-scheme` é `EXTERNAL`, enquanto o balanceador de aplicação externo global usa `EXTERNAL_MANAGED`. O protocolo entra no serviço de back-end, e é nele que `UDP` aparece.\n\nA verificação de integridade também muda de endereço. Para o balanceador de rede de passagem externo regional, as sondas chegam de `35.191.0.0/16`, `209.85.152.0/22` e `209.85.204.0/22`, então a regra de firewall de entrada precisa liberar essas faixas para a tag dos back-ends. Esquecer essa regra é a causa mais comum de back-end eternamente não saudável.",
                },
                {
                    type: "code",
                    value: "gcloud compute health-checks create tcp hc-tcp --port=7000 \\\n  --region=southamerica-east1\n\ngcloud compute backend-services create bs-jogo --protocol=UDP \\\n  --region=southamerica-east1 --health-checks=hc-tcp \\\n  --health-checks-region=southamerica-east1\n\ngcloud compute backend-services add-backend bs-jogo \\\n  --region=southamerica-east1 --instance-group=ig-jogo \\\n  --instance-group-zone=southamerica-east1-a\n\ngcloud compute forwarding-rules create regra-jogo \\\n  --load-balancing-scheme=EXTERNAL --region=southamerica-east1 \\\n  --ports=7000 --address=ip-jogo --backend-service=bs-jogo",
                },
                {
                    type: "text",
                    value: "## Cloud DNS: zona pública e zona privada\n\nO **Cloud DNS** é o serviço de DNS gerenciado, **global**, que publica seus nomes a partir de vários pontos do mundo usando anycast, sem que você mantenha servidor de DNS. O trabalho é feito em **zonas gerenciadas**, e o tipo da zona decide quem consegue resolver os nomes dela:\n\n- **Zona pública**: visível para a internet. É onde vive o nome do site, apontando para o endereço do balanceador externo.\n- **Zona privada**: visível **somente** das redes VPC que você autorizar. É onde vivem nomes internos, que não devem aparecer em consulta pública.\n\nNada impede ter o mesmo domínio nas duas, uma zona pública e uma privada com o mesmo sufixo, e cada lado respondendo endereços diferentes. Esse arranjo de horizonte dividido é comum quando a aplicação precisa do nome bonito tanto por fora quanto por dentro. Para casos de rede híbrida existem ainda a **zona de encaminhamento**, que manda a consulta para servidores do datacenter, e a **zona de peering**, que resolve usando a ordem de resolução de outra VPC.",
                },
                {
                    type: "code",
                    value: 'gcloud dns managed-zones create zona-site --visibility=public \\\n  --dns-name=loja.exemplo.com. --description="nomes publicos da loja"\n\ngcloud dns managed-zones create zona-interna --visibility=private \\\n  --dns-name=interno.exemplo. --networks=vpc-prod \\\n  --description="nomes internos da VPC"\n\ngcloud dns record-sets create app.interno.exemplo. --zone=zona-interna \\\n  --type=A --ttl=300 --rrdatas=10.20.0.15',
                },
                {
                    type: "quote",
                    value: "HTTP pede balanceador de aplicação. UDP ou IP de origem preservado pedem balanceador de rede de passagem.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma aplicação web precisa de balanceamento com roteamento por caminho de URL e terminação HTTPS no balanceador. Qual família atende?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Balanceador de carga de aplicação externo",
                            isCorrect: true,
                        },
                        {
                            text: "Balanceador de carga de rede de passagem externo",
                            isCorrect: false,
                        },
                        {
                            text: "Balanceador de carga de rede proxy externo",
                            isCorrect: false,
                        },
                        {
                            text: "Balanceador de carga de rede de passagem interno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um serviço de jogos usa UDP e o processo no back-end precisa ver o endereço IP de origem do jogador. Qual família de balanceador atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Balanceador de carga de rede de passagem",
                            isCorrect: true,
                        },
                        {
                            text: "Balanceador de carga de rede proxy externo",
                            isCorrect: false,
                        },
                        {
                            text: "Balanceador de carga de aplicação interno",
                            isCorrect: false,
                        },
                        {
                            text: "Balanceador de carga de aplicação externo global",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que diferencia um balanceador de carga de rede proxy de um balanceador de carga de rede de passagem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O proxy encerra a conexão do cliente e abre outra até o back-end",
                            isCorrect: true,
                        },
                        {
                            text: "O proxy atua na camada 7 e o de passagem atua na camada 4",
                            isCorrect: false,
                        },
                        {
                            text: "O de passagem encerra a conexão do cliente e reescreve o IP de origem",
                            isCorrect: false,
                        },
                        {
                            text: "O proxy é sempre regional e o de passagem é sempre global",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma loja tem back-ends em três regiões e quer um único endereço IP para clientes do mundo todo, entregando cada usuário na região mais próxima com capacidade. O que configura isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Balanceador de aplicação externo global, com endereço IP anycast",
                            isCorrect: true,
                        },
                        {
                            text: "Um balanceador regional por região, atrás de uma zona privada",
                            isCorrect: false,
                        },
                        {
                            text: "Peering de VPC entre as três regiões, com rota estática por região",
                            isCorrect: false,
                        },
                        {
                            text: "Três endereços externos estáticos regionais no mesmo registro A",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As VMs precisam resolver o nome app.interno.exemplo apenas de dentro de duas redes VPC, sem que ele apareça em consulta pública. O que atende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Zona privada do Cloud DNS, autorizada nas duas redes VPC",
                            isCorrect: true,
                        },
                        {
                            text: "Zona pública do Cloud DNS, com registro apontando para IP interno",
                            isCorrect: false,
                        },
                        {
                            text: "Zona de encaminhamento do Cloud DNS para o datacenter próprio",
                            isCorrect: false,
                        },
                        {
                            text: "Registro A em zona pública, protegido por regra de firewall",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Saída para a internet: Cloud NAT e níveis de rede",
            blocks: [
                {
                    type: "text",
                    value: "A recomendação de segurança é simples de dizer e incômoda de cumprir: **VM de aplicação não tem endereço IP externo**. Sem endereço externo não existe superfície para varredura da internet, e o acesso administrativo passa a depender de bastion, do IAP ou da rede corporativa.\n\nO incômodo aparece no primeiro `apt update`. A instância precisa buscar pacote, imagem de contêiner e webhook de terceiro, e nada disso vive dentro da VPC. Resolver essa saída sem devolver endereço externo à VM é o assunto desta aula, e ele cai na prova em duas peças: **Cloud NAT** para a internet em geral e **Acesso privado do Google** para as APIs do próprio Google.",
                },
                {
                    type: "text",
                    value: "## Cloud NAT não é uma VM que você mantém\n\nO **Cloud NAT** é um serviço gerenciado, distribuído e definido por software. A documentação é explícita em dizer que ele **não é baseado em VMs de proxy nem em appliances**: a tradução acontece na própria rede, o que elimina gargalo de instância e manutenção de patch.\n\nO comportamento que define o produto: ele faz tradução de endereços para o tráfego de **saída** e para os pacotes de **resposta** daquelas conexões, e **não aceita conexão de entrada não solicitada**. Cloud NAT nunca publica um serviço, só deixa a VM sair.\n\nA montagem tem três peças e dois requisitos. O gateway de NAT é **regional**: ele vive em uma região, está associado a um **Cloud Router** e atende as sub-redes daquela região que você listar na configuração, com a opção de incluir todas. O Cloud Router aqui é plano de controle, não passa pacote. Os dois requisitos que derrubam o funcionamento quando faltam são a instância **sem endereço externo** na interface e a existência de uma **rota padrão cujo próximo salto é o gateway de internet** na VPC. Se alguém apagou a rota `0.0.0.0/0`, o NAT fica de pé e o tráfego não sai.",
                },
                {
                    type: "code",
                    value: "gcloud compute routers create router-sp \\\n  --network=vpc-prod --region=southamerica-east1\n\ngcloud compute routers nats create nat-sp \\\n  --router=router-sp --region=southamerica-east1 \\\n  --nat-all-subnet-ip-ranges --auto-allocate-nat-external-ips\n\ngcloud compute routers nats describe nat-sp \\\n  --router=router-sp --region=southamerica-east1",
                },
                {
                    type: "text",
                    value: "## Endereço do NAT: automático ou manual\n\nO gateway precisa de endereços externos regionais para traduzir, e existem dois modos. Na **alocação automática**, o Google reserva e libera endereços conforme a demanda, o que é confortável e imprevisível. Na **alocação manual**, você fixa um número de endereços externos regionais no gateway, o que é obrigatório quando um parceiro mantém lista de permissão por IP de origem: ele precisa saber de quais endereços o seu tráfego vai sair.\n\nA conta de portas também importa em operação. Cada endereço de NAT tem um número limitado de portas, divididas entre as VMs. Com alocação manual e muitas instâncias saindo, o esgotamento de portas aparece como conexão recusada sem erro no firewall. O registro de log do NAT é a ferramenta para enxergar isso, e pode ser ligado só para tradução, só para erro ou para os dois.",
                },
                {
                    type: "table",
                    value: '[["O que a VM sem IP externo precisa alcançar","Recurso que resolve","Escopo da configuração"],["Outras VMs da mesma rede VPC","Endereço interno da sub-rede","Nada a configurar"],["APIs e serviços do Google, como Cloud Storage","Acesso privado do Google","Por sub-rede"],["Repositório de pacotes ou webhook na internet","Gateway do Cloud NAT","Por região, via Cloud Router"],["Receber conexão vinda da internet","Balanceador de carga externo","Regional ou global"],["Acesso administrativo por SSH","Encaminhamento de TCP do IAP ou bastion","Por projeto ou por instância"]]',
                },
                {
                    type: "text",
                    value: "## Acesso privado do Google resolve outra coisa\n\nConfundir os dois é erro clássico. O **Acesso privado do Google** é uma opção **da sub-rede**, ligada sub-rede por sub-rede, que permite a instâncias com **somente endereço interno** alcançarem os endereços externos de **APIs e serviços do Google**. Nada mais.\n\nOu seja: com Acesso privado do Google ligado e nenhum Cloud NAT, a VM grava no Cloud Storage e lê do BigQuery, mas não baixa pacote de um repositório de terceiro. Com Cloud NAT e sem Acesso privado do Google, a VM alcança tudo pela saída do NAT. Os dois juntos são o arranjo comum: o tráfego para o Google não ocupa o NAT, e o resto sai traduzido.",
                },
                {
                    type: "code",
                    value: 'gcloud compute networks subnets update sub-sp-app \\\n  --region=southamerica-east1 --enable-private-ip-google-access\n\ngcloud compute networks subnets describe sub-sp-app \\\n  --region=southamerica-east1 --format="value(privateIpGoogleAccess)"\n\ngcloud compute instances create app-2 --zone=southamerica-east1-b \\\n  --subnet=sub-sp-app --no-address --tags=app-web',
                },
                {
                    type: "text",
                    value: "## Nível de rede: Premium contra Standard\n\nToda saída para a internet escolhe por qual caminho o pacote anda, e isso é o **nível de serviço de rede**. O padrão é o **Premium**.\n\nNo **Premium**, o tráfego de entrada entra na rede do Google no ponto de presença mais perto do usuário e viaja pelo backbone do Google até a região do recurso. A saída faz o inverso: anda pelo backbone até o ponto de presença mais próximo do destino. A documentação cita mais de 200 pontos de presença e disponibilidade de 99,99%.\n\nNo **Standard**, o tráfego usa a internet pública: a entrada só chega pela troca de tráfego ou pelo trânsito **da região** onde o recurso está, e a saída vai para a internet pelo provedor local daquela região. O custo de saída é menor e a latência fica a cargo da internet, com disponibilidade de 99,9%.\n\nAs consequências práticas que a prova cobra:\n\n- O Standard é **regional por definição**, então não existe endereço IP externo global no Standard. **Todo endereço externo global exige Premium.**\n- Balanceamento de carga global e **Cloud CDN** são sempre Premium.\n- Standard combina com carga de uma região só, com usuário próximo dessa região e com saída de grande volume, como processamento em lote enviando resultado para fora.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Premium","Standard"],["Caminho do tráfego","Backbone global do Google","Internet pública, perto da região"],["Escopo","Global e regional","Só regional"],["Endereço IP externo global","Permitido","Não existe"],["Balanceamento global e Cloud CDN","Sim","Não"],["Disponibilidade citada","99,99%","99,9%"],["Custo de saída","Mais alto","Mais baixo"]]',
                },
                {
                    type: "quote",
                    value: "Cloud NAT só deixa sair. Acesso privado do Google só alcança API do Google. Endereço externo global só existe no Premium.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um grupo de VMs sem endereço IP externo precisa baixar atualizações de pacotes de um repositório na internet. O que resolve sem dar endereço externo a cada VM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um gateway do Cloud NAT na região dessas sub-redes",
                            isCorrect: true,
                        },
                        {
                            text: "Uma regra de firewall de saída liberando a porta 443",
                            isCorrect: false,
                        },
                        {
                            text: "O Acesso privado do Google ligado na sub-rede",
                            isCorrect: false,
                        },
                        {
                            text: "Um balanceador de carga de rede de passagem externo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de configurar o Cloud NAT, o time pediu para publicar na internet um serviço que roda nessas mesmas VMs. O que o Cloud NAT faz nesse caso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nada, porque ele não aceita conexão de entrada não solicitada",
                            isCorrect: true,
                        },
                        {
                            text: "Abre a porta pedida, porque o NAT mapeia entrada e saída",
                            isCorrect: false,
                        },
                        {
                            text: "Publica o serviço desde que a regra de firewall permita a entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Encaminha a entrada para a VM com menos conexões ativas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O gateway do Cloud NAT foi criado na região correta e inclui a sub-rede das VMs, mas nenhuma instância consegue sair para a internet. Qual causa é compatível com o sintoma?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A rota padrão para o gateway de internet foi apagada da VPC",
                            isCorrect: true,
                        },
                        {
                            text: "O gateway foi criado com alocação manual de endereços de NAT",
                            isCorrect: false,
                        },
                        {
                            text: "As VMs estão em zonas diferentes dentro da mesma região",
                            isCorrect: false,
                        },
                        {
                            text: "A sub-rede não tem faixa secundária configurada para alias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As VMs sem endereço externo precisam gravar objetos no Cloud Storage sem que o tráfego saia pela internet pública. O que deve ser ligado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acesso privado do Google na sub-rede dessas VMs",
                            isCorrect: true,
                        },
                        {
                            text: "Cloud NAT com alocação automática de endereços",
                            isCorrect: false,
                        },
                        {
                            text: "Zona privada do Cloud DNS para a API de armazenamento",
                            isCorrect: false,
                        },
                        {
                            text: "Regra de firewall de saída liberando a porta 443",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um serviço em lote atende usuários de uma região só e envia grande volume de dados para fora, aceitando latência maior para reduzir o custo de saída. Qual configuração atende?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nível de rede Standard, que é regional, no endereço externo",
                            isCorrect: true,
                        },
                        {
                            text: "Nível de rede Premium, que entra pelo ponto de presença mais perto",
                            isCorrect: false,
                        },
                        {
                            text: "Reservar um endereço externo estático e manter o nível padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Nível de rede Premium com o Cloud CDN desligado na borda",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_8: Modulo = {
    titulo: "Módulo 8 - Monitoramento, logs e automação",
    aulas: [
        {
            titulo: "Cloud Monitoring: métricas, painéis e o Ops Agent",
            blocks: [
                {
                    type: "text",
                    value: "O Cloud Monitoring começa a trabalhar sozinho. No instante em que você cria uma VM, um bucket ou um cluster, o Google Cloud passa a gravar séries temporais sobre aquele recurso sem ninguém pedir. É por isso que a prova quase nunca pergunta como ligar o monitoramento, e quase sempre pergunta por que determinado gráfico está vazio ou como colocar vários projetos no mesmo painel.\n\nEste módulo fecha a trilha pela parte que a certificação chama de garantir a operação: enxergar o que está acontecendo, ser avisado quando o comportamento sai do normal e automatizar o que você não quer repetir à mão. E tudo começa por uma pergunta de escopo: **de quais projetos este painel consegue ler métrica?**",
                },
                {
                    type: "text",
                    value: "## Escopo de métricas e projeto de escopo\n\nA documentação define **escopo de métricas** como o conjunto de contêineres de recursos cujas séries temporais um projeto consegue traçar e monitorar. O projeto que hospeda esse escopo é o **projeto de escopo**, e é nele que ficam guardados os painéis, as políticas de alerta e as demais configurações de monitoramento.\n\nPor padrão, o escopo de métricas de um projeto inclui **apenas ele mesmo**. Daí vem a dor de empresa com muitos projetos: cada projeto só vê a si próprio e ninguém tem a visão do ambiente inteiro.\n\nA saída é eleger um projeto de escopo e adicionar os outros projetos ao escopo de métricas dele. Feito isso, um painel criado no projeto de escopo traça métrica de qualquer projeto monitorado. Por padrão, um escopo de métricas comporta **375 projetos** do Google Cloud.\n\nTrês detalhes que a prova cobra:\n\n- quem altera o escopo precisa de todas as permissões do papel **Monitoring Admin** (`roles/monitoring.admin`) tanto no projeto de escopo quanto em cada projeto adicionado;\n- a configuração é feita pelo console ou pela API do Cloud Monitoring, e a mudança leva cerca de um minuto para propagar;\n- adicionar um projeto ao escopo **não move nem copia dado**. A série temporal continua no projeto de origem, e o projeto de escopo apenas passa a conseguir lê-la.\n\nUm padrão comum em organização grande é criar um projeto dedicado à observabilidade e usar esse projeto como projeto de escopo, em vez de pendurar os painéis de todo mundo dentro do projeto de produção.",
                },
                {
                    type: "table",
                    value: '[["Papel do projeto","O que ele guarda","Que métrica ele consegue ler"],["Projeto de escopo","Painéis, políticas de alerta e verificações de disponibilidade","A dele e a de todos os projetos monitorados"],["Projeto monitorado","As séries temporais dos recursos dele mesmo","Só a dele, enquanto o escopo dele não for alterado"],["Projeto novo, sem configuração","Painéis e alertas próprios","Só a dele, porque o escopo nasce com um projeto único"]]',
                },
                {
                    type: "text",
                    value: "## O Ops Agent: o que a plataforma não vê por fora\n\nO Google Cloud coleta sem agente nenhum o que é possível medir do lado de fora da VM, na camada de virtualização: **uso de CPU**, **tráfego de rede** e **operações de disco**. O que acontece dentro do sistema operacional convidado é cego para a plataforma.\n\nResultado prático: em uma VM recém-criada, os gráficos de **Memória** e de **Uso do espaço em disco** aparecem sem dado algum. Quem preenche esses gráficos é o **Ops Agent**, instalado dentro da VM, que envia:\n\n- **métricas do convidado** com o prefixo `agent.googleapis.com`, como `agent.googleapis.com/memory/percent_used` e `agent.googleapis.com/disk/percent_used`;\n- **logs do sistema**, lendo `/var/log/syslog` e `/var/log/messages` no Linux e o log de eventos no Windows;\n- métricas e logs de aplicações de terceiros, mais dados em formato Prometheus e OTLP, inclusive rastros gerados com o OpenTelemetry.\n\nO Ops Agent é o agente atual e substituiu os agentes legados, que eram dois binários separados, um de monitoramento e outro de logging. Hoje é um processo só, cuidando de métrica, log e rastro.\n\nOs **papéis mínimos da conta de serviço anexada à VM** são dois, e vale decorar:\n\n- **Monitoring Metric Writer** (`roles/monitoring.metricWriter`), para escrever métrica;\n- **Logs Writer** (`roles/logging.logWriter`), para escrever log.\n\nRepare que são papéis de escrita, não de leitura: o agente publica telemetria, não consulta. VMs novas do Compute Engine já nascem com escopos de acesso suficientes para o agente, e a recomendação é usar a conta de serviço anexada, nunca uma chave estática gravada no disco da máquina.",
                },
                {
                    type: "code",
                    value: 'gcloud projects add-iam-policy-binding meu-projeto --member="serviceAccount:vm-app@meu-projeto.iam.gserviceaccount.com" --role="roles/monitoring.metricWriter"\ngcloud projects add-iam-policy-binding meu-projeto --member="serviceAccount:vm-app@meu-projeto.iam.gserviceaccount.com" --role="roles/logging.logWriter"\ncurl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh\nsudo bash add-google-cloud-ops-agent-repo.sh --also-install\nsudo systemctl status google-cloud-ops-agent"*"',
                },
                {
                    type: "text",
                    value: "## Métrica personalizada e o prefixo que ela usa\n\nMétrica definida pelo usuário é toda métrica que não vem pronta do Google Cloud. Serve para medir aquilo que só a sua aplicação sabe: pedidos parados na fila, carrinhos abandonados, tempo de processamento de um lote noturno.\n\nCada tipo de métrica precisa de um **descritor**, que define o nome, os rótulos e a forma de organizar os dados. O descritor pode ser criado por você antes da primeira escrita ou ser criado automaticamente pelo Cloud Monitoring quando o primeiro ponto chega.\n\nO que a prova cobra é o **prefixo**, porque ele é obrigatório e a lista é curta. Para métrica definida pelo usuário, os prefixos aceitos são:\n\n- `custom.googleapis.com/`, o caminho clássico de quem escreve pela API do Monitoring;\n- `workload.googleapis.com/`, usado por coletores como o Ops Agent e o OpenTelemetry;\n- `external.googleapis.com/user` e `external.googleapis.com/prometheus`.\n\nOu seja, uma métrica sua se chama algo como `custom.googleapis.com/pedidos/na_fila`. Não existe métrica personalizada dentro de `compute.googleapis.com` nem de `agent.googleapis.com`: esses prefixos pertencem ao Google Cloud e ao agente, e você não escreve neles.",
                },
                {
                    type: "text",
                    value: "## Painel: do gráfico improvisado ao arquivo versionado\n\nO **Metrics Explorer** é a bancada de experimento. Você escolhe a métrica, o filtro e a agregação, vê o gráfico na hora e descarta. A consulta pode ser montada pelo menu ou escrita na aba de código, em **PromQL** ou em **MQL**.\n\nQuando o gráfico merece ficar, ele vira **painel**. Além dos painéis predefinidos que o Google entrega por serviço, você monta painéis personalizados com os widgets que quiser.\n\nO detalhe que separa quem clica de quem opera: painel é um recurso com definição em JSON ou YAML, então ele sai do console e entra no repositório. O comando `gcloud monitoring dashboards create` aceita `--config-from-file` e tem `--validate-only` para conferir o arquivo sem criar nada. E vale lembrar o escopo: painel criado no projeto de escopo lê métrica de todos os projetos monitorados.",
                },
                {
                    type: "code",
                    value: 'displayName: Operação da API de pedidos\ngridLayout:\n  columns: 2\n  widgets:\n  - title: Memória usada nas VMs\n    xyChart:\n      dataSets:\n      - timeSeriesQuery:\n          timeSeriesFilter:\n            filter: metric.type="agent.googleapis.com/memory/percent_used" resource.type="gce_instance"\n            aggregation:\n              perSeriesAligner: ALIGN_MEAN\n  - title: Pedidos na fila\n    xyChart:\n      dataSets:\n      - timeSeriesQuery:\n          timeSeriesFilter:\n            filter: metric.type="custom.googleapis.com/pedidos/na_fila"',
                },
                {
                    type: "code",
                    value: 'gcloud monitoring dashboards create --validate-only --config-from-file=painel-pedidos.yaml\ngcloud monitoring dashboards create --config-from-file=painel-pedidos.yaml\ngcloud monitoring dashboards list --format="table(name, displayName)"',
                },
                {
                    type: "quote",
                    value: "Memória e espaço em disco do convidado não aparecem sem o Ops Agent, e painel de vários projetos não existe sem projeto de escopo configurado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma VM nova do Compute Engine aparece no Cloud Monitoring com o gráfico de CPU preenchido, mas os gráficos de memória e de uso do espaço em disco estão vazios. Qual é a causa mais provável?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A API do Cloud Monitoring ainda não foi habilitada nesse projeto",
                            isCorrect: false,
                        },
                        {
                            text: "A VM está sem o Ops Agent, que coleta dados de dentro do convidado",
                            isCorrect: true,
                        },
                        {
                            text: "O tipo de máquina escolhido não expõe contadores de memória",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário que abriu o painel não recebeu o papel de Monitoring Viewer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa tem quatro projetos de produção e quer um único painel com a métrica dos quatro. Qual configuração atende ao requisito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Criar o mesmo painel nos quatro projetos e abrir as quatro abas do console",
                            isCorrect: false,
                        },
                        {
                            text: "Conceder o papel roles/monitoring.viewer na organização inteira para o time",
                            isCorrect: false,
                        },
                        {
                            text: "Adicionar os quatro projetos ao escopo de métricas de um projeto de escopo",
                            isCorrect: true,
                        },
                        {
                            text: "Mover as séries temporais dos quatro projetos para um projeto central",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais são os dois papéis mínimos que a conta de serviço anexada a uma VM precisa para o Ops Agent enviar métrica e log?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "roles/monitoring.viewer e roles/logging.viewer",
                            isCorrect: false,
                        },
                        {
                            text: "roles/monitoring.admin e roles/logging.admin",
                            isCorrect: false,
                        },
                        {
                            text: "roles/monitoring.metricWriter e roles/logging.logWriter",
                            isCorrect: true,
                        },
                        {
                            text: "roles/monitoring.editor e roles/logging.privateLogViewer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma aplicação vai publicar na API do Cloud Monitoring quantos itens estão parados na própria fila de processamento. Qual nome de tipo de métrica é válido para esse dado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "compute.googleapis.com/fila/itens_pendentes",
                            isCorrect: false,
                        },
                        {
                            text: "custom.googleapis.com/fila/itens_pendentes",
                            isCorrect: true,
                        },
                        {
                            text: "agent.googleapis.com/fila/itens_pendentes",
                            isCorrect: false,
                        },
                        {
                            text: "logging.googleapis.com/fila/itens_pendentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quem vai adicionar projetos ao escopo de métricas precisa das permissões de Monitoring Admin em quais recursos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Somente no projeto de escopo que hospeda o escopo de métricas",
                            isCorrect: false,
                        },
                        {
                            text: "No projeto de escopo e em cada projeto adicionado ao escopo",
                            isCorrect: true,
                        },
                        {
                            text: "Somente nos projetos adicionados, nunca no projeto de escopo",
                            isCorrect: false,
                        },
                        {
                            text: "Na organização, e nunca diretamente em projeto algum",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Alertas e verificações de disponibilidade",
            blocks: [
                {
                    type: "text",
                    value: "Painel é ótimo para investigar, mas ninguém fica olhando painel às três da manhã. Quem acorda o time é a **política de alerta**: uma regra que observa telemetria e, quando a regra é violada, abre um incidente e dispara notificação.\n\nA prova cobra a anatomia dessa regra justamente porque é fácil errar os dois extremos. Dá para criar uma política que nunca dispara e também uma que grita a cada oscilação de meio minuto, até o time aprender a ignorar o aviso.",
                },
                {
                    type: "text",
                    value: "## Anatomia de uma política de alerta\n\nUma política de alerta tem três partes que você sempre define e uma quarta que convém não esquecer:\n\n1. **Condição**: descreve o que caracteriza problema. Reúne a origem do dado (a métrica e o filtro), a agregação (como alinhar e agrupar as séries) e o limite, que pode ser estático ou dinâmico.\n2. **Janela de avaliação**, que a documentação chama de janela de nova tentativa: por quanto tempo a condição precisa continuar verdadeira antes de a política disparar. É o botão que separa alerta útil de alarme falso. Pico de CPU de trinta segundos não deveria acordar ninguém; cinco minutos acima do limite, sim.\n3. **Canais de notificação**: a lista de quem avisar quando houver ação a tomar.\n4. **Documentação**: texto livre que viaja dentro da notificação. É onde entra o link do procedimento, para quem foi acordado não precisar adivinhar o que fazer.\n\nQuando a condição é satisfeita, o Monitoring abre um **incidente**, que guarda o tipo de dado e o horário para ajudar na investigação. Em política baseada em métrica, assim que a condição deixa de ser satisfeita o incidente é fechado automaticamente e sai uma notificação de fechamento.",
                },
                {
                    type: "table",
                    value: '[["Tipo de condição","O que ela observa","Caso típico"],["Limite de métrica","A métrica cruza um valor e fica assim por uma janela","CPU acima de 80 por cento por cinco minutos"],["Ausência de métrica","A série simplesmente para de chegar","Agente parou ou VM desapareceu, com janela de até 24 horas"],["Baseada em log","Aparece entrada de log que casa com o filtro","Mensagem de falha de autenticação no log da aplicação"],["PromQL ou MQL","Uma expressão de consulta devolve resultado","Razão entre requisições com erro e total de requisições"]]',
                },
                {
                    type: "code",
                    value: 'gcloud monitoring policies create --policy-from-file=cpu-alta.json\ngcloud monitoring policies list --format="table(displayName, enabled)"\ngcloud monitoring policies update projects/meu-projeto/alertPolicies/1234567890 --add-notification-channels="projects/meu-projeto/notificationChannels/9876543210"\ngcloud monitoring policies update projects/meu-projeto/alertPolicies/1234567890 --no-enabled',
                },
                {
                    type: "text",
                    value: "## O canal de notificação é um recurso separado\n\nErro clássico de quem monta o primeiro alerta: criar a política, ver o incidente abrir no console e concluir que o alerta falhou porque ninguém recebeu nada. A política sem canal fez exatamente o que foi pedido. Ela abre incidente e não avisa pessoa alguma.\n\nO canal vive fora da política e é reaproveitado por várias delas. Entre os tipos disponíveis estão email, SMS, aplicativo móvel do console, Pub/Sub, webhook, Slack e PagerDuty. Você cria o canal, pega o nome dele e anexa à política.\n\nDois cuidados: o canal precisa existir antes de ser referenciado, e tipos como email e SMS exigem verificação do destino. Na CLI, criar canal ainda é comando beta, em `gcloud beta monitoring channels create`, enquanto a política já virou comando estável em `gcloud monitoring policies`.",
                },
                {
                    type: "code",
                    value: 'gcloud beta monitoring channels create --display-name="Plantão de produção" --type=email --channel-labels=email_address=plantao@exemplo.com.br\ngcloud beta monitoring channels list --format="table(name, type, displayName)"',
                },
                {
                    type: "text",
                    value: "## Verificação de disponibilidade: o teste que vem de fora\n\nCPU saudável não prova que o cliente consegue abrir o site. A **verificação de disponibilidade** fecha essa lacuna: ela envia requisição periódica ao alvo a partir de vários pontos do mundo e mede se a resposta chegou e se veio com o conteúdo esperado.\n\nO que você configura:\n\n- **protocolo**: `http`, `https` ou `tcp`. Em HTTP e HTTPS os redirecionamentos são seguidos, e a resposta final é a que conta para o critério de sucesso.\n- **alvo**: uma URL pública ou um recurso do Google Cloud. Os tipos aceitos incluem `uptime-url`, `gce-instance`, `cloud-run-revision`, `gae-app` e `aws-ec2-instance`.\n- **frequência**: a cada 1, 5, 10 ou 15 minutos, com tempo limite de resposta que por padrão é de 60 segundos.\n- **regiões**: selecione pelo menos três pontos de verificação, ou marque a opção global para usar todas. Com três ou mais, um problema de rede em uma região não vira falso alarme.\n- **critério de sucesso**: faixa de código HTTP esperada e, se quiser, casamento de conteúdo no corpo da resposta.\n\nE aqui está o detalhe que a prova adora: a verificação de disponibilidade **mede, mas não avisa**. Para alguém ser notificado é preciso associar uma política de alerta à verificação, o que o console já oferece na mesma tela de criação.",
                },
                {
                    type: "code",
                    value: 'gcloud monitoring uptime create "Site público" --resource-type=uptime-url --resource-labels=host=www.exemplo.com.br,project_id=meu-projeto --protocol=https --path=/health --period=5 --timeout=30 --matcher-type=contains-string --matcher-content=ok\ngcloud monitoring uptime list-configs --format="table(displayName, period)"\ngcloud monitoring uptime list-ips',
                },
                {
                    type: "text",
                    value: "## Quando o problema não é seu: acompanhar o estado dos serviços\n\nParte dos incidentes não nasce no seu código. Para esses casos existem dois lugares, e eles não são a mesma coisa:\n\n- o **painel público de estado dos serviços**, em `status.cloud.google.com`, aberto a qualquer pessoa e voltado a interrupções amplas;\n- o **Personalized Service Health**, que mostra os eventos de saúde relevantes **para os seus projetos**, com visão por projeto ou por organização. A documentação o trata como o canal principal de informação de incidente para o cliente.\n\nA vantagem do Personalized Service Health é não depender de alguém lembrar de abrir uma página. Os eventos chegam ao Cloud Logging, e de lá você monta alerta para ser avisado quando um incidente novo for publicado ou quando um incidente existente for atualizado para um produto ou uma região que você usa.",
                },
                {
                    type: "quote",
                    value: "A verificação de disponibilidade mede, a política de alerta decide avisar e o canal de notificação entrega o aviso. Falta um dos três e ninguém é acordado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma verificação de disponibilidade foi criada para uma URL pública. O site ficou fora do ar por vinte minutos, a verificação registrou as falhas e ninguém do time foi avisado. O que faltou?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Marcar a opção global para usar todas as regiões de verificação",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o tempo limite de resposta e o número de tentativas da verificação",
                            isCorrect: false,
                        },
                        {
                            text: "Associar uma política de alerta com canal de notificação à verificação",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir a frequência da verificação de 15 para 1 minuto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao criar uma verificação de disponibilidade pública, quantos pontos de verificação a documentação orienta selecionar no mínimo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um só, porque a requisição já parte de vários lugares do mundo",
                            isCorrect: false,
                        },
                        {
                            text: "Pelo menos três, para que uma falha regional não vire falso alarme",
                            isCorrect: true,
                        },
                        {
                            text: "Exatamente dois, um em cada continente com presença do Google",
                            isCorrect: false,
                        },
                        {
                            text: "Todas as regiões disponíveis, já que não existe a opção de escolher menos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma política de alerta de CPU dispara várias vezes por dia por causa de picos que duram menos de um minuto, e o time já ignora as notificações. Qual ajuste resolve sem mudar o limite da condição?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Trocar o canal de notificação de email para Pub/Sub",
                            isCorrect: false,
                        },
                        {
                            text: "Desabilitar o fechamento automático do incidente na política",
                            isCorrect: false,
                        },
                        {
                            text: "Agrupar as séries temporais por zona antes de aplicar o limite da condição",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a janela de avaliação, para a condição precisar durar mais",
                            isCorrect: true,
                        },
                    ],
                },
                {
                    statement:
                        "O Ops Agent de uma VM crítica parou de enviar dados e ninguém percebeu, porque a métrica simplesmente deixou de existir. Qual tipo de condição detecta esse cenário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Condição de limite de métrica com limite dinâmico",
                            isCorrect: false,
                        },
                        {
                            text: "Condição de ausência de métrica para a série esperada",
                            isCorrect: true,
                        },
                        {
                            text: "Condição baseada em log filtrando entradas de severidade alta",
                            isCorrect: false,
                        },
                        {
                            text: "Condição de razão entre duas métricas escrita em PromQL",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer ser avisada automaticamente quando o Google publicar um incidente que afete os produtos e as regiões usadas pelos projetos dela. Qual recurso atende a isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Acompanhar manualmente o painel público em status.cloud.google.com",
                            isCorrect: false,
                        },
                        {
                            text: "Criar uma verificação de disponibilidade apontando para a API do serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir um caso de suporte recorrente pedindo aviso de indisponibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Usar o Personalized Service Health, com alerta sobre os eventos no log",
                            isCorrect: true,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cloud Logging: consultas, sinks e retenção",
            blocks: [
                {
                    type: "text",
                    value: "Métrica avisa que algo piorou. Log conta o que exatamente aconteceu, em qual requisição e com qual mensagem. No Google Cloud quase tudo escreve log sem configuração nenhuma: a atividade administrativa, os serviços gerenciados, o Cloud Run, o GKE e os balanceadores.\n\nAntes de consultar, vale conhecer o formato, porque são os campos da entrada que você filtra:\n\n- `logName`, o nome completo do log, como `projects/meu-projeto/logs/syslog`;\n- `resource.type` e `resource.labels`, que dizem de qual recurso veio a entrada, por exemplo `gce_instance` com o identificador da instância;\n- `severity`, que vai de `DEBUG` a `EMERGENCY`, passando por `INFO`, `WARNING`, `ERROR` e `CRITICAL`;\n- `timestamp`, o momento do evento, e `receiveTimestamp`, o momento em que o Logging recebeu;\n- a carga, em `textPayload`, `jsonPayload` ou `protoPayload`. Log de auditoria sempre usa `protoPayload`.\n\nA ferramenta de consulta no console é o **Explorador de registros**, e a CLI faz o mesmo trabalho com `gcloud logging read`.",
                },
                {
                    type: "text",
                    value: '## A linguagem de consulta do Cloud Logging\n\nUma consulta é uma expressão booleana de comparações sobre os campos da entrada. Os operadores são:\n\n- `=` e `!=` para igualdade;\n- `>`, `<`, `>=` e `<=` para ordenação, o que serve muito bem para severidade;\n- `:`, o **operador de busca**, chamado na documentação de operador "has". Ele funciona como a igualdade, com uma diferença decisiva: o lado direito só precisa casar com **alguma parte** do campo da esquerda. É o operador de substring;\n- `=~` e `!~` para expressão regular.\n\nAs condições se combinam com **AND**, **OR** e **NOT**, sempre em maiúsculas. A precedência surpreende quem vem de outras linguagens: o **NOT** tem a precedência mais alta, depois vem o **OR** e por último o **AND**. Por isso, ao misturar OR e AND, use parênteses e não confie na ordem. O hífen `-` funciona como abreviação de NOT.\n\nEscrever apenas um valor entre aspas, sem nome de campo, cria uma **restrição global**: a busca varre todos os campos da entrada. É cômodo para explorar um incidente e caro para rodar todo dia.',
                },
                {
                    type: "code",
                    value: 'gcloud logging read \'resource.type="gce_instance" AND severity>=ERROR\' --limit=20 --freshness=2h\ngcloud logging read \'logName="projects/meu-projeto/logs/syslog" AND textPayload:"timeout"\' --format="table(timestamp, resource.labels.instance_id, textPayload)"\ngcloud logging read \'resource.type="cloud_run_revision" AND (severity=ERROR OR jsonPayload.status=500)\' --limit=10 --order=asc\ngcloud logging read \'resource.type="gce_instance" AND severity>=WARNING AND NOT textPayload:"/health"\' --limit=20',
                },
                {
                    type: "text",
                    value: "## Configurar a coleta de log\n\nLog de serviço gerenciado chega sozinho. Log que nasce dentro de uma VM depende do Ops Agent, e aí a coleta é sua para configurar.\n\nO arquivo de configuração do usuário fica em `/etc/google-cloud-ops-agent/config.yaml`, e a seção `logging` tem três partes:\n\n- `receivers`: de onde ler. Tipos como `files`, para caminhos no disco, `syslog` e `systemd_journald`.\n- `processors`: o que fazer com a linha lida, com tipos como `parse_json`, `parse_regex`, `exclude_logs` e `modify_fields`.\n- `service.pipelines`: a amarração, dizendo quais processadores se aplicam a quais receptores.\n\nDepois de editar o arquivo, reinicie o agente com `sudo systemctl restart google-cloud-ops-agent`. Configuração que não foi recarregada não vale nada, e esse é o erro mais comum em laboratório.\n\nExiste também a coleta que você quer **reduzir**. Log inútil custa armazenamento e polui consulta. Para isso há o **filtro de exclusão**, que entra no sink pela flag `--exclusion` e descarta a entrada antes de ela ser armazenada.",
                },
                {
                    type: "code",
                    value: "logging:\n  receivers:\n    log_da_api:\n      type: files\n      include_paths:\n      - /var/log/api/*.log\n  processors:\n    json_da_api:\n      type: parse_json\n  service:\n    pipelines:\n      pipeline_api:\n        receivers: [log_da_api]\n        processors: [json_da_api]",
                },
                {
                    type: "text",
                    value: "## O roteador de logs e os sinks de exportação\n\nToda entrada que chega passa pelo **roteador de logs**, que a compara com os sinks do recurso. Um **sink** é uma regra de roteamento: um filtro de inclusão mais um destino. A entrada que casa com o filtro é escrita no destino, e a que não casa é ignorada por aquele sink.\n\nOs destinos possíveis são cinco:\n\n- um **bucket do Cloud Logging**, inclusive de outro projeto;\n- um **conjunto de dados do BigQuery**, para cruzar log com dado de negócio em SQL;\n- um **bucket do Cloud Storage**, para arquivo morto em JSON;\n- um **tópico do Pub/Sub**;\n- **outro projeto do Google Cloud**, que então reencaminha pelos sinks dele.\n\nPara mandar log **para fora do Google Cloud**, o caminho é o Pub/Sub. A documentação recomenda o Pub/Sub para integrar o Cloud Logging com software de terceiros: você roteia para um tópico e a ferramenta externa, um SIEM como o Splunk por exemplo, assina esse mesmo tópico. Não existe sink que fale direto com um endpoint HTTPS seu.\n\nCada sink tem uma **identidade de gravação**, uma conta de serviço que precisa de permissão no destino: criador de objeto no Cloud Storage, editor de dados no BigQuery, publicador no Pub/Sub, gravador de bucket no Cloud Logging. Sink criado com destino sem permissão é a causa número um de exportação vazia.\n\nQuando a necessidade é centralizar o log de muitos projetos, ninguém cria um sink por projeto. Cria-se um **sink agregado** na **organização** ou em uma **pasta**, com a flag `--include-children`: ele roteia o log do próprio nó e também o dos recursos filhos.",
                },
                {
                    type: "table",
                    value: '[["Destino do sink","Para que serve","Como consultar depois"],["Bucket do Cloud Logging","Guardar com retenção própria, sem sair do Logging","Explorador de registros e gcloud logging read"],["Conjunto de dados do BigQuery","Cruzar log com dado de negócio e fazer agregação","SQL no BigQuery"],["Bucket do Cloud Storage","Arquivo morto com retenção longa e barata","Baixando e lendo os arquivos JSON"],["Tópico do Pub/Sub","Levar o log para fora do Google Cloud, como um SIEM","Pela assinatura que a ferramenta externa consome"],["Outro projeto do Google Cloud","Centralizar o roteamento em um projeto único","Pelos sinks configurados no projeto de destino"]]',
                },
                {
                    type: "text",
                    value: "## Buckets de log, retenção e a pegadinha da métrica baseada em log\n\nTodo projeto nasce com dois buckets de log gerenciados pelo Google:\n\n- **`_Required`**: recebe um subconjunto dos logs de auditoria, a saber atividade de administrador, evento de sistema e Access Transparency. A retenção é de **400 dias** e **não é configurável**. O sink `_Required` também não pode ser modificado nem excluído.\n- **`_Default`**: recebe todo o resto, com retenção padrão de **30 dias**. Esse sink você pode modificar e até desabilitar.\n\nPara o `_Default` e para bucket definido por você, a retenção é ajustável de **1 a 3650 dias**, ou seja, até dez anos. Então, quando o requisito é guardar dois anos de log de aplicação, aumentar a retenção do bucket é alternativa legítima a exportar para o Cloud Storage: a decisão passa a ser de custo e de forma de consulta, não de possibilidade. Quem precisa de garantia contra apagamento usa `--locked`, que trava o bucket.\n\nE agora a pegadinha favorita da prova: **métrica baseada em log só conta o que chegou depois de ela existir**. A documentação é explícita ao dizer que o dado de uma métrica definida pelo usuário vem apenas das entradas recebidas após a criação da métrica. Nada é preenchido retroativamente. Se o incidente foi ontem e você criou a métrica hoje, o gráfico começa hoje, e a investigação do que passou continua sendo consulta de log.\n\nMétrica baseada em log pode ser de **contador**, de **distribuição** ou **booleana**, e a definida pelo usuário aparece no Cloud Monitoring com o prefixo `logging.googleapis.com/user/`.",
                },
                {
                    type: "code",
                    value: 'gcloud logging sinks create auditoria-bq bigquery.googleapis.com/projects/obs-central/datasets/logs_auditoria --log-filter=\'logName:"cloudaudit.googleapis.com" AND severity>=NOTICE\'\ngcloud logging sinks create siem-externo pubsub.googleapis.com/projects/obs-central/topics/logs-siem --organization=123456789012 --include-children --log-filter=\'severity>=WARNING\'\ngcloud logging buckets update _Default --location=global --retention-days=90\ngcloud logging buckets create logs-auditoria-longa --location=southamerica-east1 --retention-days=730\ngcloud logging metrics create erros_de_login --description="Falhas de autenticação na API" --log-filter=\'resource.type="cloud_run_revision" AND jsonPayload.evento="login_falhou"\'',
                },
                {
                    type: "quote",
                    value: "Sink agregado na organização centraliza o log de todos os projetos filhos, e o Pub/Sub é a única porta de saída do log para fora do Google Cloud.",
                },
            ],
            questions: [
                {
                    statement:
                        "No Explorador de registros, qual operador da linguagem de consulta encontra as entradas em que o campo `textPayload` contém a palavra `timeout` em qualquer posição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O operador de igualdade, escrito como textPayload=timeout",
                            isCorrect: false,
                        },
                        {
                            text: "O operador de busca, escrito na forma textPayload:timeout",
                            isCorrect: true,
                        },
                        {
                            text: "O operador de diferença, escrito como textPayload!=timeout",
                            isCorrect: false,
                        },
                        {
                            text: "O operador de comparação, escrito como textPayload>=timeout",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma organização com oitenta projetos quer todo o log de auditoria em um único conjunto de dados do BigQuery, sem precisar configurar projeto por projeto. Qual é a abordagem correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um sink em cada um dos projetos apontando para o mesmo conjunto de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Um sink no projeto de faturamento, que já recebe dado de todos",
                            isCorrect: false,
                        },
                        {
                            text: "Um sink agregado na organização, criado com a flag include-children",
                            isCorrect: true,
                        },
                        {
                            text: "Uma política da organização obrigando a exportação para o BigQuery",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa precisa que o log de segurança do Google Cloud chegue em tempo real ao SIEM que ela mantém no próprio datacenter. Qual destino de sink viabiliza essa integração?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um bucket do Cloud Storage lido por um agente instalado no SIEM",
                            isCorrect: false,
                        },
                        {
                            text: "Um tópico do Pub/Sub, que o SIEM consome por uma assinatura",
                            isCorrect: true,
                        },
                        {
                            text: "Um conjunto de dados do BigQuery consultado por ODBC pelo SIEM",
                            isCorrect: false,
                        },
                        {
                            text: "Um bucket do Cloud Logging em outro projeto, com acesso externo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação descreve corretamente a retenção dos buckets de log de um projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O _Default guarda 400 dias e o _Required guarda 30 dias, ambos fixos",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois buckets guardam 30 dias e nenhum dos dois aceita alteração",
                            isCorrect: false,
                        },
                        {
                            text: "O _Default guarda 30 dias e aceita de 1 a 3650 dias de retenção",
                            isCorrect: true,
                        },
                        {
                            text: "O _Required guarda 90 dias e aceita até 3650 dias de retenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de um incidente ocorrido na semana passada, o time criou hoje uma métrica baseada em log para contar as mensagens de falha. O gráfico aparece quase vazio. Qual é a explicação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A métrica precisa de uma política de alerta associada para coletar dados",
                            isCorrect: false,
                        },
                        {
                            text: "A métrica só conta entradas armazenadas no bucket _Required do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "A métrica leva até sete dias para terminar o processamento do histórico",
                            isCorrect: false,
                        },
                        {
                            text: "A métrica conta apenas as entradas recebidas depois da criação dela",
                            isCorrect: true,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Diagnosticar e auditar: Error Reporting, Trace e logs de auditoria",
            blocks: [
                {
                    type: "text",
                    value: "O alerta disparou. Começa a parte que separa quem opera de quem só observa: descobrir o que quebrou, onde o tempo foi gasto e quem mexeu na configuração.\n\nSão três perguntas diferentes e cada uma tem a sua ferramenta. Tentar responder todas com consulta de log funciona, mas é lento, e a prova cobra justamente o reconhecimento de qual ferramenta atende a qual pergunta.",
                },
                {
                    type: "text",
                    value: "## Error Reporting: agrupar o que é o mesmo defeito\n\nAplicação com problema não gera um erro, gera dez mil. E quase sempre são dez mil repetições do mesmo defeito. O **Error Reporting** resolve isso agrupando os eventos de erro por causa raiz e mostrando, por grupo, a contagem, a primeira e a última ocorrência e a tendência.\n\nEle recebe erro de dois jeitos: pela API do Error Reporting ou varrendo as entradas de log em busca de rastro de pilha e de padrão de erro. O agrupamento segue regras publicadas: quando existe rastro de pilha, o agrupamento usa o tipo da exceção mais os cinco quadros mais altos; quando só existe mensagem, usa a mensagem e o nome da função.\n\nA frase de uma linha que vale para a prova: **Error Reporting responde o que quebrou e com que frequência**, sem você precisar escrever consulta de log.",
                },
                {
                    type: "text",
                    value: "## Cloud Trace: descobrir onde o tempo foi gasto\n\nO **Cloud Trace** é o sistema de rastreamento distribuído do Google Cloud. Ele acompanha a latência das requisições e ajuda a localizar o gargalo entre serviços. Uma requisição vira um rastro, e cada trecho de trabalho dentro dela vira um span, com início, fim e relação de pai e filho.\n\nÉ a ferramenta que responde o que a métrica não responde. A requisição levou dois segundos, certo, mas dois segundos onde? No banco, na chamada ao serviço vizinho, na serialização da resposta?\n\nPara instrumentar, a documentação atual recomenda um framework aberto e neutro de fornecedor, o **OpenTelemetry**, em vez de biblioteca específica de produto. Os dados trafegam no formato OTLP, e o próprio Ops Agent sabe coletar rastro OTLP de aplicação instrumentada dentro da VM.",
                },
                {
                    type: "table",
                    value: '[["Pergunta que você tem","Ferramenta","O que você olha nela"],["Está fora do normal agora?","Cloud Monitoring","Métrica, painel e incidente de alerta"],["O que aconteceu naquela requisição?","Cloud Logging","A entrada de log, com severidade e carga"],["Qual defeito está quebrando mais?","Error Reporting","Grupos de erro com contagem e tendência"],["Onde a latência foi gasta?","Cloud Trace","O rastro da requisição dividido em spans"],["Quem mudou essa configuração?","Logs de auditoria","Identidade do autor e método de API chamado"]]',
                },
                {
                    type: "text",
                    value: "## Os quatro tipos de log de auditoria\n\nLog de auditoria responde quem fez o que, quando e onde. São quatro tipos, e a diferença entre eles é exatamente o que a prova cobra:\n\n- **Atividade de administrador**: chamadas de API e ações que **modificam** configuração ou metadado de recurso. Sempre gravado, e a documentação é direta ao dizer que não é possível configurar, excluir nem desabilitar. Mesmo com a API do Cloud Logging desabilitada, ele continua sendo gerado.\n- **Evento de sistema**: ações do próprio Google Cloud e dos agentes de serviço que modificam configuração de recurso, como a migração ao vivo de uma VM. Também sempre gravado, sem possibilidade de desligar.\n- **Acesso a dados**: chamadas que **leem** configuração ou metadado e chamadas que leem ou gravam dado fornecido pelo usuário. É o tipo volumoso, e por isso vem **desabilitado por padrão**, com uma exceção que a prova gosta de cobrar: o BigQuery.\n- **Política negada**: gravado quando um serviço nega acesso por violação de política de segurança. É gerado por padrão e **não pode ser desabilitado**, mas dá para usar filtro de exclusão para não armazená-lo no Cloud Logging.",
                },
                {
                    type: "table",
                    value: '[["Tipo de log de auditoria","O que registra","Vem ligado?","Onde fica por padrão"],["Atividade de administrador","Mudança de configuração ou metadado","Sempre, e não desliga","Bucket _Required, 400 dias"],["Evento de sistema","Mudança feita pelo próprio Google Cloud","Sempre, e não desliga","Bucket _Required, 400 dias"],["Acesso a dados","Leitura de configuração e de dado do usuário","Desligado, exceto no BigQuery","Bucket _Default, 30 dias"],["Política negada","Acesso negado por política de segurança","Ligado, e não desliga","Bucket _Default, 30 dias"]]',
                },
                {
                    type: "text",
                    value: "## Ligar o log de acesso a dados\n\nA configuração do log de acesso a dados não mora em uma tela isolada: ela vive dentro da **política do IAM**, na seção `auditConfigs`. Cada entrada aponta um serviço e quais tipos de log habilitar:\n\n- `ADMIN_READ`, para métodos que leem metadado ou informação de configuração;\n- `DATA_READ`, para métodos que leem dado fornecido pelo usuário;\n- `DATA_WRITE`, para métodos que gravam dado fornecido pelo usuário.\n\nO fluxo na CLI é ler a política, editar o YAML e gravar de volta. Preserve o campo `etag` da política lida: é ele que impede você de sobrescrever sem perceber a alteração que um colega fez no meio do caminho.\n\nDois efeitos colaterais antes de ligar tudo de uma vez. O primeiro é volume, que vira custo de armazenamento. O segundo é permissão de leitura: para ler log de acesso a dados não basta o papel de leitor de logs, é preciso o **Private Logs Viewer** (`roles/logging.privateLogViewer`).",
                },
                {
                    type: "code",
                    value: "auditConfigs:\n- auditLogConfigs:\n  - logType: ADMIN_READ\n  - logType: DATA_READ\n  service: storage.googleapis.com\nbindings:\n- members:\n  - user:ana@exemplo.com.br\n  role: roles/editor\netag: BwVM-FDzeYM=\nversion: 1",
                },
                {
                    type: "code",
                    value: 'gcloud projects get-iam-policy meu-projeto --format=yaml > politica.yaml\ngcloud projects set-iam-policy meu-projeto politica.yaml\ngcloud logging read \'logName:"cloudaudit.googleapis.com%2Factivity" AND protoPayload.methodName:"instances.delete"\' --limit=5 --freshness=30d\ngcloud logging read \'protoPayload.authenticationInfo.principalEmail="ana@exemplo.com.br"\' --limit=10 --freshness=7d --format="table(timestamp, protoPayload.methodName)"',
                },
                {
                    type: "quote",
                    value: "Atividade de administrador e evento de sistema são sempre gravados. Acesso a dados você precisa ligar, e política negada você só consegue deixar de armazenar.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma VM de produção desapareceu durante a madrugada e o time precisa saber qual identidade executou a exclusão e a que horas. Onde essa informação está?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No Error Reporting, que agrupa os eventos de erro por causa raiz",
                            isCorrect: false,
                        },
                        {
                            text: "No Cloud Trace, que registra cada chamada de API em spans",
                            isCorrect: false,
                        },
                        {
                            text: "No log de auditoria de atividade de administrador do projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Na métrica de contagem de instâncias do Cloud Monitoring",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação sobre o log de auditoria de acesso a dados está correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele é sempre gravado e não pode ser configurado nem desabilitado",
                            isCorrect: false,
                        },
                        {
                            text: "Ele vem habilitado por padrão em todos os serviços do Google Cloud",
                            isCorrect: false,
                        },
                        {
                            text: "Ele só existe para serviços de armazenamento, como Storage e BigQuery",
                            isCorrect: false,
                        },
                        {
                            text: "Ele vem desabilitado por padrão em todo serviço, menos no BigQuery",
                            isCorrect: true,
                        },
                    ],
                },
                {
                    statement:
                        "Um administrador precisa habilitar o registro de leitura de objetos do Cloud Storage no log de auditoria de um projeto. Onde essa configuração é feita?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Na configuração do sink _Required, incluindo o tipo DATA_READ no filtro",
                            isCorrect: false,
                        },
                        {
                            text: "Na seção auditConfigs da política do IAM do projeto, com DATA_READ",
                            isCorrect: true,
                        },
                        {
                            text: "Na página de cotas do projeto, liberando a cota de log de auditoria",
                            isCorrect: false,
                        },
                        {
                            text: "No arquivo de configuração do Ops Agent, em um pipeline de logging",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma requisição da API leva dois segundos e o time não sabe se o tempo está no banco de dados ou na chamada ao serviço vizinho. Qual ferramenta responde a isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Error Reporting, pelos grupos de erro com maior contagem",
                            isCorrect: false,
                        },
                        {
                            text: "Cloud Trace, pelo rastro da requisição dividido em spans",
                            isCorrect: true,
                        },
                        {
                            text: "Cloud Logging, pelo campo de severidade das entradas",
                            isCorrect: false,
                        },
                        {
                            text: "Personalized Service Health, pelos eventos do projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma auditoria exige dois anos de histórico do log de atividade de administrador. O bucket `_Required` retém 400 dias e essa retenção não é configurável. Qual é a solução?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Alterar a retenção do bucket _Required para 730 dias pela CLI do gcloud",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao suporte do Google Cloud a liberação de retenção estendida",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar filtro de exclusão no sink _Required para preservar o histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Criar um sink que roteia esse log para um destino com retenção maior",
                            isCorrect: true,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Automatizar: gcloud, Cloud Shell e infraestrutura como código",
            blocks: [
                {
                    type: "text",
                    value: "Clicar no console ensina. Repetir clique no console todo dia não escala, e é nesse ponto que a certificação muda de assunto: ela quer saber se você transforma operação em comando e comando em arquivo versionado.\n\n## Configurações nomeadas do gcloud\n\nUma configuração do gcloud é um conjunto nomeado de propriedades da CLI: conta, projeto, região e zona padrão, entre outras. Toda instalação nasce com uma configuração chamada `default`, e **só uma fica ativa por vez**.\n\nQuem cuida de mais de um ambiente cria uma configuração por ambiente. Em vez de rodar `gcloud config set project` seis vezes por dia e perder a conta de onde está, você troca o contexto inteiro em um comando, com conta e região junto.\n\nSão três formas de escolher a configuração, da mais abrangente para a mais localizada:\n\n- `gcloud config configurations activate NOME` troca a configuração ativa para o terminal atual e também para as próximas sessões;\n- a variável de ambiente `CLOUDSDK_ACTIVE_CONFIG_NAME` vale para a sessão de terminal em que foi definida, sem mexer nas outras;\n- a flag `--configuration=NOME` vale **somente para aquele comando**, o que é exatamente o que um script precisa para não depender de como a máquina está configurada.\n\nOs arquivos ficam em `~/.config/gcloud` no Linux e no macOS.",
                },
                {
                    type: "code",
                    value: "gcloud config configurations create producao\ngcloud config set account ana@exemplo.com.br\ngcloud config set project app-prod-01\ngcloud config set compute/region southamerica-east1\ngcloud config configurations list\ngcloud config configurations activate dev\ngcloud compute instances list --configuration=producao\nCLOUDSDK_ACTIVE_CONFIG_NAME=producao gcloud config list",
                },
                {
                    type: "text",
                    value: '## Saída em formato e filtro: a CLI como fonte de dado\n\nPor padrão o gcloud imprime tabela arrumada para olho humano. Automação não quer tabela arrumada, quer campo. Duas flags resolvem isso, e elas aparecem tanto na prova quanto no dia a dia:\n\n- **`--format`** decide a forma da saída. Os valores incluem `json`, `yaml`, `csv`, `table`, `value`, `text`, `flattened`, `get`, `list` e `none`. Dentro de `table`, `csv` e `value` você projeta os campos que quer, como em `--format="value(name)"`.\n- **`--filter`** decide quais recursos entram na saída, e ele é aplicado **antes** do formato.\n\nA sintaxe do filtro usa `=`, `!=`, `<`, `>`, `<=` e `>=`, mais o operador `:` de casamento de palavra, que aceita curinga `*`, e o `~` de expressão regular. Os operadores lógicos **AND**, **OR** e **NOT** vão em maiúsculas, espaço entre dois termos significa AND implícito e o hífen `-` nega um termo. Ao misturar AND com OR, use parênteses.\n\nCombinadas, as duas flags transformam uma listagem na entrada do próximo comando. É assim que se escreve rotina de inventário, de limpeza e de conferência sem precisar de SDK nenhum, só do shell.',
                },
                {
                    type: "code",
                    value: 'gcloud compute instances list --filter="status=RUNNING" --format="table(name, zone.basename(), machineType.basename())"\ngcloud compute instances list --filter="labels.ambiente=dev AND -status:RUNNING" --format="value(name)"\ngcloud compute disks list --filter="-users:*" --format="value(name, zone.basename())"\ngcloud projects list --format=json --limit=5',
                },
                {
                    type: "table",
                    value: '[["Valor de --format","O que ele imprime","Quando usar"],["table(campo, campo)","Colunas alinhadas, com cabeçalho","Leitura humana direto no terminal"],["value(campo)","Só os valores, sem cabeçalho, separados por tabulação","Alimentar um laço ou outro comando"],["json","O recurso inteiro em JSON","Entregar para o jq ou guardar como entrada"],["yaml","O recurso em YAML, que é o formato default","Inspecionar o recurso inteiro"],["csv(campo, campo)","Valores separados por vírgula","Abrir em planilha ou outra ferramenta"]]',
                },
                {
                    type: "text",
                    value: "## Cloud Shell: útil, e com limites que a prova cobra\n\nO **Cloud Shell** é um terminal no navegador, já autenticado com a sua identidade e com gcloud, kubectl, Terraform, Docker, Python e Go instalados. Para laboratório e para operação pontual é imbatível, porque não exige instalar nada na máquina local nem gerar chave de conta de serviço.\n\nOs limites são o que a prova pergunta:\n\n- **5 GB** de disco persistente, montado no diretório `$HOME`;\n- **só o `$HOME` persiste**. A máquina virtual por trás da sessão não é alocada para você de forma permanente: ela é encerrada e recriada, e qualquer alteração feita fora do `$HOME`, como pacote instalado em `/usr`, se perde;\n- cota semanal padrão de **50 horas** de uso;\n- sessão interativa limitada a **12 horas**, encerrada automaticamente ao chegar nesse teto;\n- sessão não interativa encerrada depois de **40 minutos** de inatividade;\n- se o Cloud Shell não for acessado por **120 dias**, o `$HOME` é apagado, com aviso por email antes.\n\nA leitura prática: Cloud Shell é lugar de comando, de script e de arquivo de configuração. Não é ambiente de desenvolvimento permanente nem servidor de tarefa agendada. Para desenvolvimento contínuo sem esses limites, a documentação aponta o Cloud Workstations.",
                },
                {
                    type: "text",
                    value: "## Infraestrutura como código no Google Cloud hoje\n\nScript de gcloud resolve a tarefa, mas não descreve o estado desejado do ambiente. Quem precisa recriar um ambiente inteiro, revisar mudança antes de aplicar e saber exatamente o que existe usa **infraestrutura como código**.\n\nAntes de qualquer coisa, um aviso de atualidade: o **Deployment Manager**, serviço nativo que aparece em material antigo de certificação, **foi encerrado**. Ele não é mais resposta certa em nenhum cenário. A ferramenta de infraestrutura como código no Google Cloud hoje é o **Terraform**, e em volta dele existem:\n\n- o **Infrastructure Manager**, serviço gerenciado do Google que executa configuração Terraform por você. Ele aceita a configuração vinda de um bucket do Cloud Storage, de um repositório Git ou de um diretório local, organiza o ciclo de vida em **deployments** e **revisions**, guarda o arquivo de estado e os logs de cada revisão e permite implantação de prévia para ver o efeito antes de aplicar;\n- o **Config Connector**, que gerencia recurso do Google Cloud como objeto do Kubernetes, de dentro de um cluster;\n- o **Cloud Foundation Toolkit**, com módulos e modelos prontos seguindo as boas práticas do Google.\n\nO que o Infrastructure Manager acrescenta em relação a rodar Terraform na sua máquina é justamente o que mais dá problema em time: o arquivo de estado fica guardado do lado do Google, e a execução acontece com uma **conta de serviço** que você indica, não com a credencial pessoal de quem rodou o comando. A API a habilitar é a `config.googleapis.com`.",
                },
                {
                    type: "code",
                    value: "gcloud services enable config.googleapis.com\ngcloud infra-manager deployments apply projects/app-prod-01/locations/southamerica-east1/deployments/rede-base --local-source=./terraform --service-account=projects/app-prod-01/serviceAccounts/infra-manager@app-prod-01.iam.gserviceaccount.com --input-values=regiao=southamerica-east1\ngcloud infra-manager deployments apply projects/app-prod-01/locations/southamerica-east1/deployments/rede-base --git-source-repo=https://github.com/exemplo/infra.git --git-source-directory=producao/rede --git-source-ref=main --service-account=projects/app-prod-01/serviceAccounts/infra-manager@app-prod-01.iam.gserviceaccount.com\ngcloud infra-manager deployments describe projects/app-prod-01/locations/southamerica-east1/deployments/rede-base\ngcloud infra-manager revisions list --deployment=projects/app-prod-01/locations/southamerica-east1/deployments/rede-base",
                },
                {
                    type: "text",
                    value: "## Fechando o assunto\n\nOlhe este módulo de ponta a ponta e repare que ele é um ciclo, não uma lista de produtos:\n\n1. O **Cloud Monitoring** coleta métrica por conta própria, e o **Ops Agent** completa o que a plataforma não vê de fora da VM. O **escopo de métricas** define quantos projetos aquele painel alcança.\n2. A **política de alerta** transforma métrica em aviso, com condição, janela de avaliação e canal de notificação. A **verificação de disponibilidade** testa o serviço pelo lado de quem usa.\n3. O **Cloud Logging** guarda o detalhe. A linguagem de consulta acha a entrada, o **sink** leva o log para onde ele precisa durar ou ser analisado, e o **bucket** define por quanto tempo ele fica.\n4. O **Error Reporting**, o **Cloud Trace** e os **logs de auditoria** respondem, nessa ordem, o que quebrou, onde demorou e quem mexeu.\n5. E o **gcloud**, com configuração nomeada, formato e filtro, mais o **Terraform** com o Infrastructure Manager, tiram a operação da mão e colocam no arquivo.\n\nNa hora da prova, quando um cenário descrever um sintoma, treine o reflexo de perguntar em qual desses cinco degraus ele cai. Boa parte das questões de operação do Associate Cloud Engineer é um desses degraus vestido de história de empresa, e reconhecer o degrau elimina duas alternativas antes de você ler a terceira.\n\nDaqui para frente o melhor laboratório é o seu próprio projeto. Instale o Ops Agent em uma VM e veja o gráfico de memória sair do zero. Crie um alerta que você consiga disparar de propósito, só para ver o incidente abrir e fechar. Exporte log para um bucket, confira a identidade de gravação e a retenção. Depois descreva esse mesmo ambiente em Terraform e aplique pelo Infrastructure Manager. O que você quebrou e consertou com as próprias mãos é o que vai sobrar na memória no dia do exame.",
                },
                {
                    type: "quote",
                    value: "Operação que não está em arquivo versionado não é operação repetível, é memória de uma pessoa só.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma pessoa ficou quatro meses sem abrir o Cloud Shell. Ao voltar, encontra o diretório home vazio, sem os scripts que havia deixado lá. O que explica isso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A cota semanal de 50 horas foi consumida e o disco ficou bloqueado",
                            isCorrect: false,
                        },
                        {
                            text: "O diretório home só aceita 5 GB e foi limpo por falta de espaço livre",
                            isCorrect: false,
                        },
                        {
                            text: "Sem acesso por 120 dias, o Cloud Shell apaga o diretório home dela",
                            isCorrect: true,
                        },
                        {
                            text: "O projeto padrão mudou e o Cloud Shell abriu outro diretório home",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um script de automação precisa rodar sempre contra o projeto de produção, independentemente de qual configuração esteja ativa na máquina de quem executa. Todas as máquinas já têm uma configuração nomeada de produção. Qual recurso garante isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rodar gcloud config set project antes de cada comando do script",
                            isCorrect: false,
                        },
                        {
                            text: "Passar a flag --configuration em cada comando gcloud do script",
                            isCorrect: true,
                        },
                        {
                            text: "Exportar a variável CLOUDSDK_ACTIVE_CONFIG_NAME no perfil do shell",
                            isCorrect: false,
                        },
                        {
                            text: "Executar gcloud config configurations activate no início do script",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um laço de shell precisa receber apenas os nomes das instâncias em execução, um por linha, sem cabeçalho e sem outras colunas. Qual combinação de flags produz isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: '--filter="status=RUNNING" com --format="table(name)"',
                            isCorrect: false,
                        },
                        {
                            text: '--filter="status=RUNNING" com --format=json',
                            isCorrect: false,
                        },
                        {
                            text: '--filter="status=RUNNING" com --format="value(name)"',
                            isCorrect: true,
                        },
                        {
                            text: '--filter="name=RUNNING" com --format="csv(name)"',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer descrever a infraestrutura em código e que o Google execute essa configuração como serviço gerenciado, guardando o arquivo de estado. Qual serviço atende hoje?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Deployment Manager, com modelos em Jinja e em Python",
                            isCorrect: false,
                        },
                        {
                            text: "Infrastructure Manager, executando configuração Terraform",
                            isCorrect: true,
                        },
                        {
                            text: "Cloud Build, rodando terraform apply em cada envio de código",
                            isCorrect: false,
                        },
                        {
                            text: "Config Connector, declarando os recursos dentro de um cluster",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer rodar no Cloud Shell um processo que precisa ficar ativo 24 horas por dia coletando dados. Por que essa escolha não funciona?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Porque o Cloud Shell não permite executar processo em segundo plano",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o Cloud Shell não tem acesso de rede a recursos do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a conta de serviço do Cloud Shell não recebe papel do IAM",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a sessão interativa termina em 12 horas, com cota semanal",
                            isCorrect: true,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
    MODULO_8,
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
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO })
            .where(eq(trails.id, trilha.id));
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
