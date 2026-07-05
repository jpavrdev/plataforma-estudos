// Trilha AWS Developer Associate (DVA-C02), formato função com quiz de 5 questões por aula.
// questões por aula. Idempotente pelo marcador "Módulo 2 - Serverless com Lambda", que só
// existe nesta estrutura nova. É destrutivo: apaga módulos/aulas/questões antigos
// da trilha antes de recriar (o progresso da trilha AWS é reiniciado).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-dva.ts
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

const NOME = "AWS DVA-C02";
const MARCADOR = "Módulo 2 - Serverless com Lambda";

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
        titulo: "Módulo 1 - Fundamentos de desenvolvimento na AWS",
        aulas: [
            {
                titulo: "SDK e AWS CLI",
                blocks: [
                    {
                        type: "text",
                        value: "# SDK e AWS CLI",
                    },
                    {
                        type: "quote",
                        value: "Toda ação na AWS é uma **chamada de API HTTPS**. Os **SDKs** (um por linguagem) e a **AWS CLI** são apenas clientes convenientes dessa API: eles montam a request, a **assinam** com as suas credenciais e tratam a resposta. O que a DVA-C02 mais cobra nesta aula é **de onde vêm as credenciais** e por que, em **EC2 e Lambda**, você deve usar **IAM roles** em vez de gravar uma access key fixa.",
                    },
                    {
                        type: "text",
                        value: "## 1. Tudo na AWS é uma chamada de API\n\nCada serviço da AWS expõe uma **API HTTPS**. Quando você cria um bucket pelo Console, lista funções pela CLI ou grava um item no DynamoDB pelo SDK, no fim das contas é sempre a mesma coisa: uma **request HTTPS assinada** para o endpoint daquele serviço.\n\nVocê quase nunca monta essa request na mão. Em vez disso usa uma das três portas de entrada:\n\n- **AWS Management Console**: a interface web.\n- **AWS CLI**: a linha de comando, ótima para scripts e automação.\n- **AWS SDK**: bibliotecas para chamar a AWS **de dentro do seu código**.\n\nCLI e SDK são o território do desenvolvedor e o foco desta aula.",
                    },
                    {
                        type: "text",
                        value: "## 2. Os SDKs por linguagem\n\nUm **SDK** (Software Development Kit) é um conjunto de bibliotecas que traz um **cliente por serviço** (um cliente S3, um cliente DynamoDB, e assim por diante), já com os tipos, a serialização e a **assinatura das requests** prontos. A AWS mantém SDKs oficiais para as principais linguagens:",
                    },
                    {
                        type: "table",
                        value: '[["Linguagem","SDK oficial","Observação"],["JavaScript / TypeScript","AWS SDK for JavaScript v3","Modular: um pacote por serviço (`@aws-sdk/client-s3`)"],["Python","Boto3","O SDK mais usado em scripts e no Lambda"],["Java","AWS SDK for Java 2.x","Reescrito, sem bloqueio de I/O"],[".NET","AWS SDK for .NET","C#, F# e PowerShell"],["Go","AWS SDK for Go v2","Idiomático e modular"],["Ruby, PHP, Rust, C++, Kotlin, Swift","SDKs oficiais","Cobrem o restante das linguagens comuns"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Um cliente de SDK na prática\n\nO mesmo trabalho, listar os objetos de um bucket, nas duas linguagens mais cobradas. Repare que **em nenhum lugar aparece uma access key**: o SDK vai buscá-la sozinho (já já vemos onde).",
                    },
                    {
                        type: "code",
                        value: '// Node.js - AWS SDK for JavaScript v3\nimport { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";\n\n// Sem credenciais no código: o SDK as resolve pela credential provider chain.\nconst s3 = new S3Client({ region: "us-east-1" });\n\nconst resposta = await s3.send(\n  new ListObjectsV2Command({ Bucket: "meu-bucket" })\n);\nfor (const obj of resposta.Contents ?? []) {\n  console.log(obj.Key, obj.Size);\n}',
                    },
                    {
                        type: "code",
                        value: '# Python - Boto3\nimport boto3\n\n# region e credenciais resolvidos automaticamente pelo SDK.\ns3 = boto3.client("s3", region_name="us-east-1")\n\nresposta = s3.list_objects_v2(Bucket="meu-bucket")\nfor obj in resposta.get("Contents", []):\n    print(obj["Key"], obj["Size"])',
                    },
                    {
                        type: "text",
                        value: "## 4. A AWS CLI\n\nA **AWS CLI** (Command Line Interface) é a ferramenta de linha de comando para operar a AWS pelo terminal. Use a **versão 2** (a v1 é legada). Todo comando segue o padrão `aws <serviço> <operação> [parâmetros]`:",
                    },
                    {
                        type: "code",
                        value: '# Versão instalada\naws --version\n\n# Configuração interativa (grava chave, região e formato de saída)\naws configure\n\n# Chamadas seguem o padrão: aws <serviço> <operação>\naws s3 ls\naws s3 ls s3://meu-bucket\naws dynamodb list-tables --region us-east-1\naws sts get-caller-identity          # "quem sou eu?": ótimo para depurar credenciais',
                    },
                    {
                        type: "text",
                        value: "## 5. Credenciais: access key ID e secret access key\n\nPara assinar as requests, a AWS usa um par de credenciais de **longa duração** associado a um usuário IAM:\n\n- **Access Key ID**: identifica a chave. Começa com `AKIA...` e **não é secreto** (aparece em logs).\n- **Secret Access Key**: a parte secreta, usada para **assinar** a request. É exibida **uma única vez**, no momento da criação. Se você perder, tem que gerar outra.\n\nQuando a credencial é **temporária** (vinda de uma role), aparece um terceiro valor: o **Session Token** (`AWS_SESSION_TOKEN`), que precisa acompanhar as outras duas.",
                    },
                    {
                        type: "quote",
                        value: "Nunca **versione** uma secret access key no Git nem a deixe no código. Uma chave vazada em um repositório público é varrida por bots em minutos. Em máquinas da AWS (EC2, Lambda, ECS) a resposta certa quase sempre é **não ter chave nenhuma**: use uma **IAM role**.",
                    },
                    {
                        type: "text",
                        value: "## 6. Os arquivos ~/.aws/credentials e ~/.aws/config\n\nO `aws configure` grava suas credenciais em **dois arquivos** dentro do diretório `~/.aws` (no Windows, `%USERPROFILE%\\.aws`):\n\n- **`~/.aws/credentials`**: as chaves (dado sensível).\n- **`~/.aws/config`**: região, formato de saída e outras opções.\n\nVocê pode ter **vários perfis nomeados** (named profiles) nesses arquivos, um para cada conta ou papel. O perfil sem nome é o `[default]`. Repare que, no `config`, os perfis nomeados levam o prefixo `profile`.",
                    },
                    {
                        type: "code",
                        value: "# ~/.aws/credentials\n[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n\n[dev]\naws_access_key_id = AKIAI44QH8DHBEXAMPLE\naws_secret_access_key = je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY",
                    },
                    {
                        type: "code",
                        value: '# ~/.aws/config  (perfis nomeados levam o prefixo "profile")\n[default]\nregion = us-east-1\noutput = json\n\n[profile dev]\nregion = sa-east-1\noutput = table',
                    },
                    {
                        type: "text",
                        value: "Para escolher qual perfil usar, passe `--profile` no comando ou defina a variável de ambiente `AWS_PROFILE` para a sessão inteira:",
                    },
                    {
                        type: "code",
                        value: "# Escolhe o perfil apenas neste comando\naws s3 ls --profile dev\n\n# Ou fixa o perfil na variável de ambiente, valendo para a sessão inteira\nexport AWS_PROFILE=dev\naws sts get-caller-identity",
                    },
                    {
                        type: "text",
                        value: "## 7. A cadeia de resolução de credenciais (credential provider chain)\n\nQuando você não passa credenciais explicitamente, o SDK e a CLI procuram as credenciais em **uma ordem fixa** e param na **primeira fonte que encontrar**. Essa sequência é a **credential provider chain**. A ordem geral, do que vence primeiro para o que vence por último:\n\n1. **Credenciais passadas no código** (ou parâmetros da linha de comando).\n2. **Variáveis de ambiente** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).\n3. **Arquivos de credenciais/perfil** (`~/.aws/credentials` e `~/.aws/config`, do perfil ativo).\n4. Por fim, a **IAM role**: via **IMDS** em uma instância **EC2**, ou a **role de execução** em uma função **Lambda**.",
                    },
                    {
                        type: "table",
                        value: '[["Ordem","Fonte de credenciais","Uso típico"],["1º","Credenciais explícitas no código / CLI","Testes pontuais (evite em produção)"],["2º","Variáveis de ambiente","CI/CD, contêineres, credenciais temporárias"],["3º","Arquivos de perfil (`~/.aws/...`)","Máquina de desenvolvimento local"],["4º","IAM role (IMDS em EC2 / role de execução no Lambda)","**Recomendado** em ambientes da AWS"]]',
                    },
                    {
                        type: "text",
                        value: "## 8. Por que IAM roles em vez de chaves fixas\n\nNuma máquina da AWS, a forma **correta e mais segura** de obter credenciais é anexar uma **IAM role** (à instância EC2, à função Lambda, à tarefa ECS). A role entrega **credenciais temporárias** que o SDK pega sozinho, no fim da cadeia. As vantagens sobre uma access key gravada:\n\n- **Nada de segredo no disco ou no código**: não há chave para vazar.\n- **Rotação automática**: as credenciais temporárias expiram e são renovadas sem você fazer nada.\n- **Menor privilégio**: a role concede exatamente as permissões que aquele componente precisa.\n\nNo código, o padrão é **não passar credencial alguma** e deixar o SDK resolvê-las pela role:",
                    },
                    {
                        type: "code",
                        value: '// Em EC2 ou Lambda, NÃO passe credenciais: o SDK as obtém da role.\nimport { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";\n\n// Sem accessKeyId/secretAccessKey no construtor:\n// a role fornece credenciais temporárias, resolvidas no fim da chain.\nconst s3 = new S3Client({ region: "us-east-1" });\nawait s3.send(new ListObjectsV2Command({ Bucket: "relatorios" }));',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: CLI e SDK **montam e assinam** requests HTTPS para a API da AWS. Credenciais = **Access Key ID** (público) + **Secret Access Key** (secreto, exibido 1 vez). `aws configure` grava em `~/.aws/credentials` e `~/.aws/config` (com **perfis nomeados**). A **credential provider chain** resolve nesta ordem: **código → variáveis de ambiente → arquivos de perfil → IAM role** (IMDS no EC2 / role de execução no Lambda). Em ambientes da AWS, **use roles**, não chaves fixas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Do ponto de vista técnico, o que a AWS CLI e os SDKs fazem por baixo dos panos quando você executa uma operação em um serviço da AWS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Abrem uma conexão SSH direta com o servidor físico do serviço.",
                                isCorrect: false,
                            },
                            {
                                text: "Montam uma request HTTPS, a assinam com as suas credenciais e a enviam para o endpoint da API do serviço.",
                                isCorrect: true,
                            },
                            {
                                text: "Executam o serviço localmente na sua máquina, sem tráfego de rede.",
                                isCorrect: false,
                            },
                            {
                                text: "Copiam os dados por FTP para um bucket intermediário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao rodar `aws configure` em uma máquina de desenvolvimento, onde ficam armazenados o access key ID e a secret access key informados?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Em variáveis de ambiente definidas permanentemente no sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "No arquivo `~/.aws/credentials`, enquanto região e formato de saída vão para `~/.aws/config`.",
                                isCorrect: true,
                            },
                            {
                                text: "Diretamente no IAM, como uma nova role vinculada ao terminal.",
                                isCorrect: false,
                            },
                            {
                                text: "Em um segredo do AWS Secrets Manager criado automaticamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação roda em uma instância EC2 e precisa ler objetos de um bucket S3. Qual é a forma **mais segura** de fornecer credenciais a essa aplicação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Gravar o access key ID e a secret access key em um arquivo `.env` dentro da instância.",
                                isCorrect: false,
                            },
                            {
                                text: "Embutir as chaves diretamente no código-fonte da aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Anexar uma IAM role à instância EC2; o SDK obtém credenciais temporárias automaticamente, sem chave fixa.",
                                isCorrect: true,
                            },
                            {
                                text: "Enviar as chaves por variável de ambiente a cada deploy, versionadas no repositório.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sem credenciais passadas explicitamente, qual é a ordem geral em que a credential provider chain do SDK procura as credenciais?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Variáveis de ambiente, depois os arquivos de credenciais/perfil e, por fim, a IAM role (via IMDS em EC2 ou role de execução no Lambda).",
                                isCorrect: true,
                            },
                            {
                                text: "A IAM role primeiro, depois os arquivos de perfil e só então as variáveis de ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Os arquivos de perfil primeiro, depois a IAM role e, por último, as variáveis de ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o arquivo `~/.aws/credentials`; se não houver credenciais lá, a chamada falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a secret access key de um usuário IAM, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela pode ser recuperada a qualquer momento no console do IAM.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela começa com `AKIA` e pode aparecer em logs sem risco.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela é exibida uma única vez, na criação; se for perdida, é preciso gerar uma nova chave.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela é a parte pública do par de credenciais e serve apenas para identificar a chave.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Autenticação de requests e endpoints",
                blocks: [
                    {
                        type: "text",
                        value: "# Autenticação de requests e endpoints",
                    },
                    {
                        type: "quote",
                        value: "Cada request para a AWS é **assinada** com o processo **Signature Version 4 (SigV4)**, usando as suas credenciais e a **região**. O bom: o **SDK faz isso automaticamente**, você só precisa fornecer credenciais e região. Os endpoints são **regionais** (`<serviço>.<região>.amazonaws.com`), e, dentro de uma EC2, as credenciais da role vêm do **Instance Metadata Service (IMDS)**.",
                    },
                    {
                        type: "text",
                        value: "## 1. Signature Version 4 (SigV4)\n\nA AWS não aceita requests anônimas em operações autenticadas. Cada request precisa ser **assinada** com o **Signature Version 4 (SigV4)**. A assinatura prova duas coisas ao servidor: **quem** está chamando (identidade) e que a request **não foi adulterada** no caminho (integridade).\n\nDe forma resumida, para assinar, o SDK:\n\n1. Monta uma **canonical request** (método, path, query, headers e o hash do corpo).\n2. Deriva uma **signing key** a partir da secret access key, da **data**, da **região** e do **serviço**.\n3. Calcula um **HMAC-SHA256** e coloca o resultado no header **`Authorization`**.",
                    },
                    {
                        type: "code",
                        value: "Authorization: AWS4-HMAC-SHA256\n  Credential=AKIAIOSFODNN7EXAMPLE/20260704/us-east-1/s3/aws4_request,\n  SignedHeaders=host;x-amz-content-sha256;x-amz-date,\n  Signature=fe5f80f77d5fa3beca038a248ff027d0445342fe2855ddc963176630326f1024",
                    },
                    {
                        type: "text",
                        value: "Repare, no header acima, no campo `Credential`: ele amarra a assinatura a uma **data**, uma **região** (`us-east-1`) e um **serviço** (`s3`). Por isso uma assinatura **não pode ser reaproveitada** em outra região ou outro serviço. O header `x-amz-date` marca o instante da request, e a AWS tolera uma diferença de relógio de poucos minutos, então o horário da sua máquina precisa estar razoavelmente correto.",
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: você **quase nunca assina à mão**. O SDK e a CLI assinam automaticamente. Só se implementa SigV4 manualmente ao chamar a API por **HTTP puro, sem SDK** (por exemplo, uma request assinada para o OpenSearch). Se a questão falar em **assinar a request**, pense em **SigV4 + credenciais + região**.",
                    },
                    {
                        type: "text",
                        value: "## 2. Endpoints regionais\n\nA maioria dos serviços tem um **endpoint por região**, no formato `<serviço>.<região>.amazonaws.com`. Ao escolher a região, você escolhe **onde os dados ficam** e **qual endpoint** o SDK vai chamar. Alguns serviços são **globais** (IAM, CloudFront, Route 53) e usam um endpoint único, sem região no nome.",
                    },
                    {
                        type: "table",
                        value: '[["Serviço / região","Endpoint"],["S3 em us-east-1","`s3.us-east-1.amazonaws.com`"],["DynamoDB em sa-east-1","`dynamodb.sa-east-1.amazonaws.com`"],["STS em eu-west-1","`sts.eu-west-1.amazonaws.com`"],["IAM (serviço global)","`iam.amazonaws.com` (sem região)"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. A região padrão e como ela é resolvida\n\nO SDK e a CLI precisam saber **qual região** usar para montar o endpoint e a assinatura. Eles procuram a região em ordem, e a **primeira que encontrarem vence**:\n\n1. Parâmetro explícito no código (`new S3Client({ region })`) ou `--region` na CLI.\n2. Variável de ambiente **`AWS_REGION`** (a CLI também aceita `AWS_DEFAULT_REGION`).\n3. A opção `region` do perfil ativo em `~/.aws/config`.\n4. Em EC2/ECS, a região obtida do **IMDS**.\n\nSe nenhuma for encontrada, a chamada falha com um erro de **região ausente**.",
                    },
                    {
                        type: "code",
                        value: "# 1) Por flag, apenas para este comando\naws s3 ls --region eu-west-1\n\n# 2) Por variável de ambiente, valendo para a sessão inteira\nexport AWS_REGION=us-east-1\n\n# 3) Fixa no perfil, gravada em ~/.aws/config\naws configure set region sa-east-1 --profile dev",
                    },
                    {
                        type: "text",
                        value: "## 4. Variáveis de ambiente\n\nAs variáveis de ambiente são o elo da cadeia de credenciais logo depois das credenciais passadas no código, e são muito usadas em **CI/CD** e **contêineres**. As principais:",
                    },
                    {
                        type: "table",
                        value: '[["Variável","Para que serve"],["`AWS_ACCESS_KEY_ID`","ID da access key"],["`AWS_SECRET_ACCESS_KEY`","Parte secreta, usada na assinatura SigV4"],["`AWS_SESSION_TOKEN`","Token de sessão (obrigatório com credenciais temporárias)"],["`AWS_REGION`","Região padrão do SDK"],["`AWS_DEFAULT_REGION`","Região padrão usada pela CLI"],["`AWS_PROFILE`","Perfil nomeado a ser usado"]]',
                    },
                    {
                        type: "code",
                        value: "export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nexport AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nexport AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEA...   # apenas com credenciais temporárias\nexport AWS_REGION=us-east-1\n\naws sts get-caller-identity   # confirma qual identidade está ativa",
                    },
                    {
                        type: "text",
                        value: "## 5. Instance Metadata Service (IMDS)\n\nUma instância **EC2** descobre informações sobre si mesma (e pega as **credenciais temporárias da role** anexada) consultando o **Instance Metadata Service (IMDS)**, num endereço link-local fixo: **`169.254.169.254`**. É daí que o SDK, rodando dentro de uma EC2, tira as credenciais **sem nenhuma chave gravada em disco**. Essas credenciais têm **validade curta** e são **rotacionadas automaticamente**.",
                    },
                    {
                        type: "text",
                        value: "### IMDSv1 vs IMDSv2\n\nExistem duas versões do serviço:\n\n- **IMDSv1**: baseado só em request (`GET`), sem token. Mais simples, porém vulnerável a ataques de **SSRF**.\n- **IMDSv2**: **orientado a sessão**. Você primeiro obtém um **token** com um `PUT` e depois usa esse token em todo `GET`. É a versão **recomendada** e pode ser **exigida** na instância.\n\nO caminho das credenciais da role é `/latest/meta-data/iam/security-credentials/<nome-da-role>`.",
                    },
                    {
                        type: "code",
                        value: '# IMDSv2: 1) obtém um token de sessão (TTL de até 6 horas)\nTOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \\\n  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")\n\n# 2) usa o token para ler as credenciais temporárias da role\ncurl -s -H "X-aws-ec2-metadata-token: $TOKEN" \\\n  http://169.254.169.254/latest/meta-data/iam/security-credentials/minha-role',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","IMDSv1","IMDSv2"],["Modelo","Request/response simples","Orientado a sessão (token)"],["Como obter credenciais","`GET` direto","`PUT` do token, depois `GET`"],["Proteção contra SSRF","Fraca","Forte (recomendada)"],["Endereço","`169.254.169.254`","`169.254.169.254`"]]',
                    },
                    {
                        type: "text",
                        value: "## 6. E no Lambda?\n\nNo **Lambda**, o equivalente acontece nos bastidores: o runtime recebe as credenciais da **role de execução** por meio de variáveis de ambiente que o próprio serviço injeta (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_SESSION_TOKEN`). Você **não** consulta `169.254.169.254` numa função Lambda. Em ambos os casos, EC2 e Lambda, o resultado é o mesmo: o SDK obtém **credenciais temporárias de uma role**, sem nenhuma chave fixa.",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **SigV4** assina cada request (o SDK faz sozinho). Endpoint regional = `<serviço>.<região>.amazonaws.com`; IAM/CloudFront são **globais**. A região vem de `--region` / `AWS_REGION` / perfil / IMDS. O **IMDS** em `169.254.169.254` entrega as credenciais da role em EC2 (prefira **IMDSv2**, com token). Credenciais temporárias exigem o **`AWS_SESSION_TOKEN`**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o processo que a AWS usa para assinar cada request de API, provando a identidade de quem chama e a integridade da mensagem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "OAuth 2.0 com refresh tokens.",
                                isCorrect: false,
                            },
                            {
                                text: "Signature Version 4 (SigV4).",
                                isCorrect: true,
                            },
                            {
                                text: "TLS mútuo com certificados de cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Basic Auth com usuário e senha em Base64.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor pergunta quem é responsável por assinar as requests SigV4 quando ele usa o AWS SDK for JavaScript. Qual é a resposta correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O desenvolvedor precisa calcular o HMAC-SHA256 manualmente a cada chamada.",
                                isCorrect: false,
                            },
                            {
                                text: "A assinatura é opcional quando se usa HTTPS.",
                                isCorrect: false,
                            },
                            {
                                text: "O próprio SDK assina automaticamente cada request, bastando fornecer credenciais e região.",
                                isCorrect: true,
                            },
                            {
                                text: "O API Gateway assina em nome do cliente antes de encaminhar a request.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação roda em uma instância EC2 com uma IAM role anexada. De onde o SDK obtém as credenciais temporárias para assinar as requests?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Do Instance Metadata Service (IMDS), no endereço link-local `169.254.169.254`.",
                                isCorrect: true,
                            },
                            {
                                text: "Do arquivo `~/.aws/credentials`, que a role grava na instância.",
                                isCorrect: false,
                            },
                            {
                                text: "Do AWS Secrets Manager, consultado a cada request.",
                                isCorrect: false,
                            },
                            {
                                text: "De um endpoint público da internet informado no código.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma instância exige o IMDSv2. Qual é a diferença de fluxo em relação ao IMDSv1 ao buscar as credenciais da role?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O IMDSv2 usa um endereço IP diferente do IMDSv1.",
                                isCorrect: false,
                            },
                            {
                                text: "No IMDSv2 é preciso primeiro obter um token de sessão com um `PUT` e usá-lo nos `GET` seguintes.",
                                isCorrect: true,
                            },
                            {
                                text: "O IMDSv2 exige uma access key fixa gravada na instância.",
                                isCorrect: false,
                            },
                            {
                                text: "O IMDSv2 só funciona para instâncias fora de qualquer VPC.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um pipeline de CI usa credenciais temporárias e configura `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`, mas as chamadas falham com erro de credencial inválida. Qual variável de ambiente provavelmente está faltando?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`AWS_DEFAULT_OUTPUT`",
                                isCorrect: false,
                            },
                            {
                                text: "`AWS_PROFILE`",
                                isCorrect: false,
                            },
                            {
                                text: "`AWS_SESSION_TOKEN`, obrigatória quando as credenciais são temporárias.",
                                isCorrect: true,
                            },
                            {
                                text: "`AWS_MAX_ATTEMPTS`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Chamadas resilientes: retries, backoff e paginação",
                blocks: [
                    {
                        type: "text",
                        value: "# Chamadas resilientes: retries, backoff e paginação",
                    },
                    {
                        type: "quote",
                        value: "A rede falha e a AWS **estrangula** (throttling) quem chama demais. O SDK já **re-tenta** os erros transitórios (**429** e **5xx**) usando **backoff exponencial com jitter**. Respostas grandes vêm **paginadas**. E, para operações que **não** são naturalmente idempotentes, um **token de idempotência** evita efeitos duplicados quando o retry dispara.",
                    },
                    {
                        type: "text",
                        value: "## 1. Erros retryable vs não retryable\n\nNem todo erro merece nova tentativa. Repetir um erro **do cliente** (uma request malformada, uma permissão que falta) só desperdiça tempo: o resultado será o mesmo. Já um erro **transitório** costuma passar se você tentar de novo.\n\n- **Retryable (vale re-tentar)**: **throttling / `429`** (`ThrottlingException`, `TooManyRequestsException`, `ProvisionedThroughputExceededException`) e erros de servidor **`5xx`** (`500`, `503 ServiceUnavailable`), além de erros de rede e timeout.\n- **Não retryable (não adianta)**: a maioria dos **`4xx`** de cliente, como `400` (`ValidationException`), `403` (`AccessDenied`) e `404` (`ResourceNotFound`).",
                    },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplos","Re-tentar?"],["Throttling (`429`)","`ThrottlingException`, `ProvisionedThroughputExceededException`","**Sim**, com backoff"],["Erro de servidor (`5xx`)","`500`, `503 ServiceUnavailable`","**Sim**, com backoff"],["Rede / timeout","conexão caiu, tempo esgotado","**Sim**"],["Erro de cliente (`4xx`)","`400`, `403 AccessDenied`, `404`","**Não** (corrija a request)"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. O SDK já re-tenta por você\n\nUm ponto que a prova adora: **você não precisa escrever o retry na mão** para os casos comuns. Todo SDK e a CLI trazem retry **automático** para os erros retryable. O que você ajusta é **quantas tentativas** (`maxAttempts`) e **qual estratégia** (`retryMode`). O padrão da maioria dos SDKs é de **3 tentativas no total** (a original mais os retries do modo `standard`).",
                    },
                    {
                        type: "code",
                        value: '// Node.js - AWS SDK for JavaScript v3\nimport { DynamoDBClient } from "@aws-sdk/client-dynamodb";\n\nconst client = new DynamoDBClient({\n  maxAttempts: 5,          // total de tentativas (1 original + 4 retries)\n  retryMode: "adaptive",   // "standard" (padrão) ou "adaptive"\n});',
                    },
                    {
                        type: "code",
                        value: "# AWS CLI - por variáveis de ambiente\nexport AWS_MAX_ATTEMPTS=5\nexport AWS_RETRY_MODE=adaptive\n\n# ou fixado no ~/.aws/config:\n#   [default]\n#   max_attempts = 5\n#   retry_mode = adaptive",
                    },
                    {
                        type: "text",
                        value: "## 3. Backoff exponencial com jitter\n\nQuando um serviço está sobrecarregado, re-tentar **imediatamente** (e todos os clientes ao mesmo tempo) só piora o problema: é o famoso **thundering herd**. A solução tem dois ingredientes:\n\n- **Backoff exponencial**: a espera **dobra** a cada tentativa (por exemplo, 100 ms, 200 ms, 400 ms, 800 ms...), dando tempo para o serviço respirar.\n- **Jitter** (aleatoriedade): soma um valor **aleatório** ao tempo de espera, **espalhando** as tentativas dos vários clientes para que não re-tentem todos no mesmo instante.",
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: se a questão descrever muitos clientes re-tentando ao mesmo tempo e sobrecarregando o serviço, a resposta é **backoff exponencial com jitter**. Só *exponencial* não basta: sem **jitter**, os picos continuam sincronizados.",
                    },
                    {
                        type: "code",
                        value: '// Backoff exponencial com "full jitter": espera aleatória entre 0 e o teto.\nasync function comRetry(fn, maxTentativas = 5) {\n  const base = 100;     // ms\n  const teto = 20000;   // ms (limite superior da espera)\n  for (let tentativa = 0; ; tentativa++) {\n    try {\n      return await fn();\n    } catch (erro) {\n      const retryavel = erro.$retryable || erro.name === "ThrottlingException";\n      if (!retryavel || tentativa >= maxTentativas - 1) throw erro;\n      const limite = Math.min(teto, base * 2 ** tentativa);  // backoff exponencial\n      const espera = Math.random() * limite;                 // + jitter\n      await new Promise((r) => setTimeout(r, espera));\n    }\n  }\n}',
                    },
                    {
                        type: "text",
                        value: "## 4. Retry mode: legacy, standard e adaptive\n\nOs SDKs modernos têm três modos de retry. Vale conhecer a diferença, porque o `adaptive` aparece em questões de otimização:",
                    },
                    {
                        type: "table",
                        value: '[["Modo","Comportamento"],["`legacy`","Modo antigo, específico de cada SDK (evite em código novo)"],["`standard`","Backoff exponencial com jitter, conjunto padronizado de erros retryable, ~3 tentativas"],["`adaptive`","Como o `standard`, mais **rate limiting no lado do cliente**, que reduz o ritmo ao detectar throttling"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Paginação\n\nOperações de listagem (`ListObjectsV2`, `Scan`, `Query`, `DescribeInstances`...) **não** devolvem tudo de uma vez. Elas retornam uma **página** e, se houver mais dados, um **token de continuação** (`NextToken`, `NextContinuationToken` ou `LastEvaluatedKey`, conforme o serviço). Você repete a chamada passando esse token até ele **não voltar mais**. Ignorar a paginação é um bug clássico: você processa só a primeira página e acha que viu tudo.",
                    },
                    {
                        type: "code",
                        value: "# A CLI pagina sozinha por padrão; você pode controlar o tamanho da página:\naws s3api list-objects-v2 --bucket meu-bucket --max-items 100\n\n# Chamada manual: siga o token de continuação até ele vir vazio\naws s3api list-objects-v2 --bucket meu-bucket --max-items 100 \\\n  --starting-token eyJNYXJrZXIiOiBudWxsLCAi...",
                    },
                    {
                        type: "code",
                        value: '// AWS SDK for JavaScript v3 - o paginador cuida do NextToken sozinho\nimport { S3Client, paginateListObjectsV2 } from "@aws-sdk/client-s3";\n\nconst client = new S3Client({ region: "us-east-1" });\n\nfor await (const pagina of paginateListObjectsV2(\n  { client },\n  { Bucket: "meu-bucket" }\n)) {\n  for (const obj of pagina.Contents ?? []) {\n    console.log(obj.Key);   // percorre TODAS as páginas, não só a primeira\n  }\n}',
                    },
                    {
                        type: "code",
                        value: '# Boto3 - paginator equivalente\nimport boto3\n\ns3 = boto3.client("s3")\npaginador = s3.get_paginator("list_objects_v2")\nfor pagina in paginador.paginate(Bucket="meu-bucket"):\n    for obj in pagina.get("Contents", []):\n        print(obj["Key"])',
                    },
                    {
                        type: "text",
                        value: "## 6. Idempotência do lado do cliente\n\nJuntar retry com uma operação que **cria** ou **cobra** algo tem um risco: se a primeira chamada **deu certo**, mas a resposta se perdeu no caminho, o retry pode criar (ou cobrar) **de novo**. A defesa é a **idempotência**: repetir a operação tem o **mesmo efeito** que executá-la uma única vez.\n\nMuitas APIs oferecem um **token de idempotência** (client token): você gera um identificador único e o envia na request; se ela chegar duas vezes com o **mesmo token**, o serviço processa **só uma vez**. Exemplos: `ClientToken` no `RunInstances` do EC2 e `ClientRequestToken` no `TransactWriteItems` do DynamoDB.",
                    },
                    {
                        type: "code",
                        value: "# EC2 RunInstances com token de idempotência:\n# repetir o comando com o MESMO token não cria uma segunda instância.\naws ec2 run-instances \\\n  --image-id ami-0abcd1234 \\\n  --instance-type t3.micro \\\n  --client-token pedido-2026-07-04-0001",
                    },
                    {
                        type: "code",
                        value: '// Gere um token único e reutilize-o em TODOS os retries da MESMA operação.\nimport { randomUUID } from "node:crypto";\n\nconst clientToken = randomUUID();   // ex.: "9f1c8b2e-...": o mesmo em cada retry',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: retryable = **429** (throttling) e **5xx** (o SDK já re-tenta; ajuste `maxAttempts` e `retryMode`). Use **backoff exponencial + jitter** contra o thundering herd. Listagens são **paginadas** (`NextToken`): prefira um **paginador**. Operações de criação/cobrança precisam de **token de idempotência** para o retry não duplicar.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Quais tipos de erro de uma chamada à API da AWS são considerados retryable, ou seja, valem uma nova tentativa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Erros `403 AccessDenied`, porque a permissão pode mudar sozinha.",
                                isCorrect: false,
                            },
                            {
                                text: "Erros de throttling (`429`) e erros de servidor (`5xx`).",
                                isCorrect: true,
                            },
                            {
                                text: "Erros `400 ValidationException`, por serem sempre temporários.",
                                isCorrect: false,
                            },
                            {
                                text: "Erros `404 ResourceNotFound`, porque o recurso pode aparecer.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Vários clientes re-tentam ao mesmo tempo uma API que começou a responder com throttling, e as tentativas sincronizadas mantêm o serviço sobrecarregado. Qual estratégia de retry resolve melhor esse cenário?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Re-tentar imediatamente, sem espera, até obter sucesso.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar um intervalo fixo de 1 segundo entre todas as tentativas.",
                                isCorrect: false,
                            },
                            {
                                text: "Backoff exponencial com jitter, para espalhar as tentativas no tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o timeout de cada request, mantendo o retry imediato.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o comportamento padrão de retry dos SDKs da AWS, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os SDKs já re-tentam automaticamente os erros retryable, e você pode ajustar `maxAttempts` e `retryMode`.",
                                isCorrect: true,
                            },
                            {
                                text: "Os SDKs nunca re-tentam; todo retry precisa ser implementado à mão.",
                                isCorrect: false,
                            },
                            {
                                text: "Os SDKs re-tentam qualquer erro, inclusive `403` e `400`.",
                                isCorrect: false,
                            },
                            {
                                text: "O retry só funciona quando se usa a CLI, não os SDKs.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor lista objetos de um bucket com muitos itens, mas o código só processa parte deles e ignora o restante. Qual é a causa mais provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O bucket está corrompido e perdeu os objetos restantes.",
                                isCorrect: false,
                            },
                            {
                                text: "A resposta é paginada e o código não seguiu o token de continuação (NextToken) para buscar as próximas páginas.",
                                isCorrect: true,
                            },
                            {
                                text: "O limite de concorrência da conta bloqueou a leitura dos demais itens.",
                                isCorrect: false,
                            },
                            {
                                text: "A região do cliente estava errada, truncando a lista.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma operação de criação de recurso é re-tentada após um timeout, mas a primeira tentativa havia funcionado, e o recurso acaba sendo criado duas vezes. Qual mecanismo evita essa duplicação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Aumentar o número de tentativas de retry no SDK.",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar o retry mode de `standard` para `adaptive`.",
                                isCorrect: false,
                            },
                            {
                                text: "Enviar um token de idempotência (client token) igual em todas as tentativas, para o serviço processar a operação uma única vez.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir o batch size da operação para 1.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Configuração e o modelo de responsabilidade compartilhada",
                blocks: [
                    {
                        type: "text",
                        value: "# Configuração e o modelo de responsabilidade compartilhada",
                    },
                    {
                        type: "quote",
                        value: "A AWS cuida da **segurança _da_ nuvem** (hardware, rede física, virtualização, operação dos serviços gerenciados). Você cuida da **segurança _na_ nuvem** (seu código, IAM, dados e a **configuração**). A regra de ouro da configuração: ela fica **fora do código** (variáveis de ambiente, Parameter Store, AppConfig, Secrets Manager) e **segredo nenhum** entra no repositório.",
                    },
                    {
                        type: "text",
                        value: "## 1. O modelo de responsabilidade compartilhada\n\nO **Shared Responsibility Model** divide a segurança entre AWS e cliente. A frase que resume tudo:\n\n- A AWS é responsável pela **segurança _da_ nuvem** (*security of the cloud*): infraestrutura física, hardware, rede, virtualização e a operação dos serviços gerenciados.\n- Você é responsável pela **segurança _na_ nuvem** (*security in the cloud*): seus dados, sua configuração de IAM, o patch do que **você** administra, a criptografia que você habilita e o código que você sobe.\n\nA linha exata **se move conforme o serviço**: quanto mais gerenciado o serviço, mais a AWS assume.",
                    },
                    {
                        type: "table",
                        value: '[["Responsabilidade da AWS (segurança _da_ nuvem)","Sua responsabilidade (segurança _na_ nuvem)"],["Data centers, hardware e rede física","Seus **dados** e a classificação deles"],["Hipervisor e isolamento entre clientes","**IAM**: usuários, roles e políticas"],["Patch do SO nos serviços gerenciados (Lambda, RDS)","Patch do SO em EC2 (você administra)"],["Disponibilidade global da infraestrutura","Configuração de rede (Security Groups, NACLs)"],["Oferecer criptografia nos serviços","**Ativar** a criptografia e gerenciar as chaves"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. O recorte do desenvolvedor\n\nNa DVA-C02, o modelo aparece pela ótica de quem **escreve o código**. Sua fatia inclui:\n\n- **Menor privilégio no IAM**: dar à função/role apenas as permissões necessárias.\n- **Proteger credenciais**: nada de chave fixa no código; use **roles** e credenciais temporárias.\n- **Segredos fora do repositório**: senhas e tokens vão para o **Secrets Manager** ou o **SSM Parameter Store**.\n- **Validar a entrada** e tratar erros sem vazar dados sensíveis nos logs.\n- **Criptografia**: ligar a criptografia em repouso e em trânsito (a AWS oferece; você habilita).",
                    },
                    {
                        type: "text",
                        value: "## 3. Onde guardar a configuração\n\nConfiguração é tudo o que **muda entre ambientes** (dev, staging, prod) sem mudar o código: nome de tabela, nível de log, endpoints, feature flags e segredos. A AWS oferece opções com propósitos diferentes:",
                    },
                    {
                        type: "table",
                        value: '[["Opção","Ideal para","Guarda segredo?","Observações"],["Variáveis de ambiente","Config simples da função/contêiner","Não (evite)","Rápido; no Lambda somam até 4 KB"],["SSM Parameter Store","Config hierárquica e barata, com opção criptografada","Sim, via `SecureString` (KMS)","Grátis no tier padrão; versiona valores"],["Secrets Manager","Segredos com **rotação automática**","Sim (foco em segredo)","Pago; integra rotação com RDS e outros"],["AppConfig","Feature flags e config com **deploy validado e gradual**","Referencia segredos de outros cofres","Valida e faz rollback de configuração"]]',
                    },
                    {
                        type: "text",
                        value: "### SSM Parameter Store na prática\n\nO **Parameter Store** guarda parâmetros em uma árvore de caminhos (`/app/prod/db-senha`). Um parâmetro `String` é texto puro; um **`SecureString`** é criptografado com **KMS**. Você grava com `put-parameter` e lê em runtime com `get-parameter`:",
                    },
                    {
                        type: "code",
                        value: '# Grava um segredo criptografado com KMS\naws ssm put-parameter \\\n  --name "/app/prod/db-senha" \\\n  --value "s3nh4-sup3r-secreta" \\\n  --type SecureString\n\n# Lê já decriptado (--with-decryption)\naws ssm get-parameter \\\n  --name "/app/prod/db-senha" \\\n  --with-decryption \\\n  --query Parameter.Value --output text',
                    },
                    {
                        type: "code",
                        value: '// AWS SDK for JavaScript v3 - lê o parâmetro em runtime\nimport { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";\n\nconst ssm = new SSMClient({});\nconst { Parameter } = await ssm.send(\n  new GetParameterCommand({ Name: "/app/prod/db-senha", WithDecryption: true })\n);\nconst senha = Parameter.Value;   // nunca registre este valor em log',
                    },
                    {
                        type: "code",
                        value: '# Boto3 - leitura equivalente\nimport boto3\n\nssm = boto3.client("ssm")\nresp = ssm.get_parameter(Name="/app/prod/db-senha", WithDecryption=True)\nsenha = resp["Parameter"]["Value"]',
                    },
                    {
                        type: "text",
                        value: "### Secrets Manager e rotação\n\nO **Secrets Manager** é especializado em **segredos** e tem um diferencial que o Parameter Store não oferece nativamente: a **rotação automática**. Para um banco RDS, por exemplo, ele troca a senha periodicamente por meio de uma função Lambda gerenciada, sem você mexer no código, que sempre lê a versão atual do segredo:",
                    },
                    {
                        type: "code",
                        value: "aws secretsmanager get-secret-value \\\n  --secret-id prod/app/db \\\n  --query SecretString --output text",
                    },
                    {
                        type: "text",
                        value: "## 4. Nunca hardcode segredos\n\nUm segredo escrito direto no código (ou commitado no Git) é o erro de segurança mais comum, e o mais cobrado. Uma vez no histórico do Git, ele **fica lá** mesmo que você o apague depois. Compare:",
                    },
                    {
                        type: "code",
                        value: '// ERRADO: segredo fixo no código, vai parar no histórico do Git\nconst client = new Client({\n  password: "s3nh4-sup3r-secreta",   // NUNCA faça isso\n});\n\n// CERTO: leia o segredo de um cofre em runtime\nconst password = await lerSegredo("/app/prod/db-senha"); // SSM ou Secrets Manager\nconst client = new Client({ password });',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: precisa de **rotação automática** de senha (RDS, por exemplo)? A resposta é **Secrets Manager**. Precisa de **configuração hierárquica e barata**, com opção de valor criptografado? **SSM Parameter Store** (`SecureString`). Segredo **no código** ou em **variável de ambiente em texto puro** é sempre a alternativa **errada**.",
                    },
                    {
                        type: "text",
                        value: "## 5. AppConfig para configuração dinâmica\n\nO **AWS AppConfig** (parte do Systems Manager) serve para mudar o **comportamento** da aplicação **sem novo deploy**: feature flags, limites, listas de allow/deny. Os diferenciais que caem na prova:\n\n- **Validação**: antes de liberar, valida a configuração contra um schema JSON ou uma função Lambda, evitando subir um valor inválido.\n- **Deploy gradual**: distribui a mudança aos poucos (estilo canário), monitorando alarmes do CloudWatch.\n- **Rollback automático**: se um alarme dispara, volta sozinho para a configuração anterior.\n\nÉ a diferença central para o Parameter Store: o Parameter Store **guarda** o valor; o AppConfig **entrega** a mudança de forma segura e observável.",
                    },
                    {
                        type: "text",
                        value: "## 6. Os 12 fatores no contexto AWS\n\nOs **Twelve-Factor App** são princípios para aplicações SaaS que casam muito bem com a nuvem. Os que mais importam para a DVA-C02:",
                    },
                    {
                        type: "table",
                        value: '[["Fator","O que diz","Na AWS"],["III. Config","Config no **ambiente**, separada do código","Env vars, Parameter Store, AppConfig, Secrets Manager"],["IV. Backing services","Trate recursos externos como **anexáveis**","Troque o endpoint do RDS/S3 por config, sem mudar o código"],["VI. Processes","Processos **stateless**","Guarde o estado em S3/DynamoDB/ElastiCache, não no disco local"],["IX. Disposability","Suba e desligue rápido","Combina com Auto Scaling e Lambda"],["XI. Logs","Logs como **fluxo de eventos**","Envie para o **CloudWatch Logs**, não para arquivo local"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: responsabilidade compartilhada = AWS cuida da segurança **_da_** nuvem; você cuida da segurança **_na_** nuvem (código, IAM, dados, config). Config fica **fora do código**: variáveis de ambiente (simples), **Parameter Store** (hierárquico e barato, `SecureString`), **Secrets Manager** (rotação), **AppConfig** (flags + deploy validado). **Nunca** hardcode segredo. 12-factor: config no ambiente, processos stateless, logs como stream.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No modelo de responsabilidade compartilhada da AWS, qual item é responsabilidade da **AWS**, e não sua?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Definir as políticas de IAM que controlam o acesso aos seus recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "A segurança física dos data centers, do hardware e da rede.",
                                isCorrect: true,
                            },
                            {
                                text: "Classificar e criptografar os dados que você armazena.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplicar o patch do sistema operacional de uma instância EC2 que você gerencia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa da senha de um banco de dados Amazon RDS, e a política de segurança exige que essa senha seja **rotacionada automaticamente** em intervalos regulares. Qual serviço atende melhor a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Variáveis de ambiente do Lambda com a senha em texto puro.",
                                isCorrect: false,
                            },
                            {
                                text: "Um parâmetro `String` do SSM Parameter Store.",
                                isCorrect: false,
                            },
                            {
                                text: "O AWS Secrets Manager, que oferece rotação automática de credenciais.",
                                isCorrect: true,
                            },
                            {
                                text: "Um arquivo `.env` versionado junto com o código da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer guardar configurações em uma estrutura hierárquica (`/app/prod/...`), de baixo custo, com a opção de criptografar valores sensíveis com KMS. Qual serviço é o mais indicado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS AppConfig, usando feature flags.",
                                isCorrect: false,
                            },
                            {
                                text: "SSM Parameter Store, usando parâmetros `SecureString` para os valores sensíveis.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon S3, com um arquivo JSON de configuração.",
                                isCorrect: false,
                            },
                            {
                                text: "Variáveis de ambiente da função, uma para cada parâmetro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer ligar e desligar uma feature flag em produção **sem novo deploy**, validando a configuração antes de aplicar e revertendo automaticamente se um alarme do CloudWatch disparar. Qual serviço oferece isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS Secrets Manager.",
                                isCorrect: false,
                            },
                            {
                                text: "Variáveis de ambiente do Lambda.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS AppConfig, com validação, deploy gradual e rollback automático.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon SQS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Durante uma revisão de código, um desenvolvedor encontra a senha de um serviço externo escrita diretamente no código-fonte, já commitada no repositório. Qual princípio dos Twelve-Factor App foi violado e qual é a correção adequada?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O fator Logs; a correção é enviar a senha para o CloudWatch Logs em vez de deixá-la no código.",
                                isCorrect: false,
                            },
                            {
                                text: "O fator Config, que pede configuração no ambiente; a correção é mover a senha para o Secrets Manager ou o Parameter Store e lê-la em runtime.",
                                isCorrect: true,
                            },
                            {
                                text: "O fator Disposability; a correção é reiniciar a aplicação com mais frequência.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum princípio foi violado, desde que o repositório seja privado.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Serverless com Lambda",
        aulas: [
            {
                titulo: "AWS Lambda - Fundamentos e modelo de execução",
                blocks: [
                    {
                        type: "text",
                        value: "# AWS Lambda - Fundamentos e modelo de execução",
                    },
                    {
                        type: "quote",
                        value: "Com o **AWS Lambda** você entrega uma função (só o código) e a AWS cuida do resto: provisiona o servidor, escala de zero a milhares de execuções em paralelo, aplica patches no sistema operacional e cobra **apenas pelo que você usa**. É o serviço central do universo **serverless** na prova DVA-C02.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é serverless\n\n**Serverless** (sem servidor) **não** significa que não existe servidor. Significa que **você não gerencia** o servidor. A AWS assume a responsabilidade por provisionamento, escalabilidade, disponibilidade e manutenção da infraestrutura, e você foca só na lógica da aplicação.\n\nO Lambda é a implementação de **FaaS** (Function as a Service) da AWS. As características que você precisa fixar:\n\n- **Sem servidor para administrar**: nada de SSH, patch de SO ou capacity planning.\n- **Escala automática**: de **zero** a milhares de execuções concorrentes, sob demanda.\n- **Pago por uso**: você paga por **invocação** e por **tempo de execução**, e **não paga nada** quando a função está ociosa.\n- **Orientado a eventos**: a função é disparada por um evento (uma request HTTP, um arquivo no S3, uma mensagem numa fila).",
                    },
                    {
                        type: "text",
                        value: "## 2. Runtimes suportados\n\nUm **runtime** é o ambiente de linguagem que executa o seu código. O Lambda oferece runtimes gerenciados para as linguagens mais comuns e, para o resto, um caminho aberto:\n\n- **Runtimes gerenciados**: `Node.js`, `Python`, `Java`, `.NET` (C#/PowerShell) e `Ruby`.\n- **OS-only runtime** (`provided.al2023`): para linguagens compiladas como **Go**, **Rust** ou **C++**, você compila um binário e roda sobre um runtime enxuto.\n- **Custom runtime**: qualquer linguagem, implementando a **Lambda Runtime API**.\n- **Imagem de contêiner**: você empacota a função como imagem Docker/OCI (até **10 GB**), útil para dependências pesadas.",
                    },
                    {
                        type: "table",
                        value: '[["Forma de empacotar","Quando usar","Limite de tamanho"],["Runtime gerenciado + .zip","Node.js, Python, Java, .NET, Ruby","50 MB (zip) / 250 MB (descompactado)"],["OS-only `provided.al2023`","Go, Rust, C++ (binário compilado)","50 MB (zip) / 250 MB (descompactado)"],["Custom runtime (Runtime API)","Linguagem sem runtime gerenciado","50 MB (zip) / 250 MB (descompactado)"],["Imagem de contêiner","Dependências grandes, imagem própria","10 GB"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. O handler\n\nO **handler** é o método que o Lambda chama a cada invocação. Você o identifica na configuração da função no formato `arquivo.metodo`. Ele recebe **dois argumentos**:\n\n- **`event`**: os dados do evento que disparou a função (um JSON). O formato depende de quem invocou (S3, API Gateway, SQS, etc.).\n- **`context`**: metadados da invocação, como `awsRequestId`, `functionName`, memória alocada e, muito importante, `getRemainingTimeInMillis()` (quanto tempo falta até o timeout).\n\nVeja o mesmo handler em **Node.js** e em **Python**:",
                    },
                    {
                        type: "code",
                        value: '// index.mjs  (runtime Node.js 20.x, handler configurado como "index.handler")\nexport const handler = async (event, context) => {\n  console.log("Request ID:", context.awsRequestId);\n  console.log("Tempo restante (ms):", context.getRemainingTimeInMillis());\n\n  const nome = event.nome || "mundo";\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ mensagem: "Olá, " + nome }),\n  };\n};',
                    },
                    {
                        type: "code",
                        value: '# lambda_function.py  (runtime Python 3.13, handler = "lambda_function.lambda_handler")\nimport json\n\ndef lambda_handler(event, context):\n    print("Request ID:", context.aws_request_id)\n    nome = event.get("nome", "mundo")\n    return {\n        "statusCode": 200,\n        "body": json.dumps({"mensagem": f"Olá, {nome}"}),\n    }',
                    },
                    {
                        type: "text",
                        value: "## 4. Como você invoca\n\nDurante o desenvolvimento você chama a função direto pela **AWS CLI** ou por um **SDK**. Repare no parâmetro `--payload`: é o JSON que chega no `event`.",
                    },
                    {
                        type: "code",
                        value: '# Cria a função a partir de um pacote .zip\naws lambda create-function \\\n  --function-name minha-funcao \\\n  --runtime nodejs20.x \\\n  --role arn:aws:iam::123456789012:role/lambda-exec \\\n  --handler index.handler \\\n  --zip-file fileb://funcao.zip \\\n  --memory-size 512 \\\n  --timeout 10\n\n# Invoca de forma síncrona e grava a resposta em resposta.json\naws lambda invoke \\\n  --function-name minha-funcao \\\n  --payload \'{ "nome": "Ana" }\' \\\n  --cli-binary-format raw-in-base64-out \\\n  resposta.json',
                    },
                    {
                        type: "text",
                        value: "## 5. Invocação síncrona vs assíncrona\n\nEsse é um dos pontos **mais cobrados** da prova. O Lambda pode ser chamado de dois jeitos, definidos pelo parâmetro `InvocationType`:\n\n- **Síncrona** (`RequestResponse`): o chamador **espera** a função terminar e recebe a resposta de volta. Se der erro, o erro **volta para o chamador**, que decide se tenta de novo. **Não há retry automático** do Lambda.\n- **Assíncrona** (`Event`): o Lambda coloca o evento numa **fila interna**, responde imediatamente com `202 Accepted` e processa depois. O chamador **não recebe** o resultado da função. Em caso de erro, o **Lambda tenta de novo automaticamente** (2 vezes por padrão).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Síncrona (RequestResponse)","Assíncrona (Event)"],["O chamador espera a resposta?","**Sim**, recebe o retorno da função","**Não**, recebe `202` na hora"],["Retry automático do Lambda?","**Não** (o chamador decide)","**Sim**, 2 tentativas por padrão"],["Quem normalmente usa","API Gateway, ALB, `invoke` direto, Cognito, Step Functions","S3, SNS, EventBridge, CloudWatch Logs"],["Tamanho do payload","6 MB (request e response)","Menor (payload de evento reduzido)"]]',
                    },
                    {
                        type: "quote",
                        value: "Regra de ouro: **API Gateway invoca de forma síncrona** (o usuário está esperando a resposta HTTP). **S3, SNS e EventBridge invocam de forma assíncrona** (dispararam o evento e seguiram a vida). Sempre que a questão citar S3 gerando um evento, pense em fila interna e retry automático.",
                    },
                    {
                        type: "text",
                        value: "## 6. Ciclo de vida do ambiente de execução\n\nO Lambda roda seu código dentro de um **execution environment** (ambiente de execução) isolado. Esse ambiente tem três fases:\n\n1. **Init**: o Lambda cria o ambiente, baixa o código, inicia o runtime e roda **tudo o que está fora do handler** (imports, criação de clientes SDK, leitura de configuração).\n2. **Invoke**: roda o **código dentro do handler**, uma vez para cada evento.\n3. **Shutdown**: depois de um tempo de inatividade, o ambiente é congelado e, mais tarde, encerrado.\n\nO ponto-chave: **o Lambda reaproveita o ambiente** entre invocações. A fase **Init roda só na primeira invocação** daquele ambiente. Por isso você deve inicializar conexões e clientes SDK **fora** do handler, para reaproveitá-los:",
                    },
                    {
                        type: "code",
                        value: 'import { DynamoDBClient } from "@aws-sdk/client-dynamodb";\n\n// === Fase Init: roda UMA vez por ambiente e é reaproveitado ===\n// Cliente e conexões pesadas devem ficar aqui fora do handler.\nconst client = new DynamoDBClient({});\nconst TABELA = process.env.TABELA;\n\nexport const handler = async (event) => {\n  // === Fase Invoke: roda a cada invocação ===\n  // NÃO recrie o client aqui: aproveite o que veio do Init.\n  // ... lógica de negócio usando client e TABELA ...\n  return { ok: true };\n};',
                    },
                    {
                        type: "text",
                        value: "## 7. Cold start\n\nQuando **não há** ambiente pronto e o Lambda precisa criar um do zero (fase Init), a invocação sofre uma latência extra chamada **cold start** (partida a frio). Quando reaproveita um ambiente já inicializado, é um **warm start** (partida a quente), bem mais rápido.\n\nO cold start é mais perceptível em runtimes que iniciam devagar (Java, .NET) e quando o código de Init é pesado. Como reduzir:\n\n- Mantenha o **pacote de implantação enxuto** e o código de Init leve.\n- Use **concorrência provisionada** para manter ambientes pré-inicializados (assunto de uma aula à frente).\n- Para **Java**, o **Lambda SnapStart** usa um snapshot do ambiente para acelerar a partida **sem custo adicional**.",
                    },
                    {
                        type: "text",
                        value: "## 8. Cobrança\n\nVocê paga o Lambda por **duas dimensões**, e nada quando a função está parada:\n\n- **Número de requisições**: quantas vezes a função foi invocada.\n- **Duração x memória** (**GB-segundo**): o tempo de execução (arredondado ao **milissegundo**) multiplicado pela memória configurada.\n\nUm detalhe importante para a prova: a **memória é o único botão de performance**. A CPU (e a banda de rede) é alocada **proporcionalmente** à memória. Em **1.769 MB** a função recebe o equivalente a **1 vCPU**. Ou seja, aumentar a memória pode deixar a função **mais rápida** e, às vezes, **mais barata** no total.",
                    },
                    {
                        type: "text",
                        value: "## 9. Limites principais\n\nDecore esta tabela: os números caem direto na prova.",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Limite"],["Memória","128 MB a 10.240 MB, em incrementos de 1 MB (1 vCPU aos 1.769 MB)"],["Timeout (duração máxima)","900 segundos (15 minutos)"],["Pacote de implantação (.zip)","50 MB (upload direto) / 250 MB descompactado (com layers)"],["Imagem de contêiner","10 GB"],["Armazenamento `/tmp`","512 MB a 10.240 MB"],["Variáveis de ambiente","4 KB no total (somadas)"],["Layers por função","5"],["Payload síncrono (request/response)","6 MB cada"],["Concorrência por conta (padrão)","1.000 execuções simultâneas por região (soft limit)"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: memória **128 MB–10 GB**, timeout **máx. 15 min**, pacote **50 MB zip / 250 MB descompactado**, `/tmp` até **10 GB**, **5 layers**, env vars **4 KB**, payload síncrono **6 MB**. Init roda fora do handler e é reaproveitado; handler roda a cada evento.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No modelo serverless do AWS Lambda, qual das responsabilidades abaixo é da AWS, e não sua?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Escrever a lógica de negócio dentro do handler.",
                                isCorrect: false,
                            },
                            {
                                text: "Provisionar servidores, escalar e aplicar patches no sistema operacional.",
                                isCorrect: true,
                            },
                            {
                                text: "Definir qual evento dispara a função.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher a quantidade de memória alocada para a função.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função Lambda em Node.js precisa saber quanto tempo falta até estourar o timeout durante a execução. Onde essa informação está disponível?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "No objeto `event`, em `event.remainingTime`.",
                                isCorrect: false,
                            },
                            {
                                text: "No objeto `context`, chamando `context.getRemainingTimeInMillis()`.",
                                isCorrect: true,
                            },
                            {
                                text: "Na variável de ambiente `AWS_TIMEOUT`.",
                                isCorrect: false,
                            },
                            {
                                text: "No retorno da função anterior, no campo `statusCode`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um bucket S3 dispara uma função Lambda toda vez que um objeto é criado. Se a função falhar ao processar o evento, o que acontece por padrão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O erro volta imediatamente para o S3, que devolve a falha ao usuário que fez o upload.",
                                isCorrect: false,
                            },
                            {
                                text: "Como é uma invocação assíncrona, o Lambda coloca o evento numa fila interna e tenta processá-lo de novo automaticamente.",
                                isCorrect: true,
                            },
                            {
                                text: "A invocação é síncrona, então o S3 fica bloqueado esperando a resposta da função.",
                                isCorrect: false,
                            },
                            {
                                text: "O evento é descartado na hora, sem nenhuma nova tentativa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para reduzir o custo de conexões repetidas a um banco de dados, um desenvolvedor quer que o cliente SDK seja criado apenas uma vez por ambiente de execução e reutilizado entre invocações. Onde ele deve inicializar esse cliente?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Dentro do handler, na primeira linha, para garantir que exista a cada chamada.",
                                isCorrect: false,
                            },
                            {
                                text: "Fora do handler, no escopo do módulo, para que rode na fase Init e seja reaproveitado.",
                                isCorrect: true,
                            },
                            {
                                text: "Em uma variável de ambiente, já que elas persistem entre execuções.",
                                isCorrect: false,
                            },
                            {
                                text: "No diretório `/tmp`, gravando o objeto serializado a cada invocação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a duração máxima (timeout) que uma única invocação do AWS Lambda pode ter?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "5 minutos",
                                isCorrect: false,
                            },
                            {
                                text: "15 minutos",
                                isCorrect: true,
                            },
                            {
                                text: "30 minutos",
                                isCorrect: false,
                            },
                            {
                                text: "60 minutos",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Gatilhos e Event Source Mapping",
                blocks: [
                    {
                        type: "text",
                        value: "# Gatilhos e Event Source Mapping",
                    },
                    {
                        type: "quote",
                        value: "Existem **dois modelos** para disparar uma função Lambda. No modelo **push**, o serviço de origem **chama** o Lambda quando algo acontece (S3, SNS, API Gateway). No modelo **poll**, é o **Lambda quem lê** a origem, através de um recurso chamado **event source mapping** (SQS, Kinesis, DynamoDB Streams). Saber quem inicia a conversa e onde fica a permissão é o que a prova cobra.",
                    },
                    {
                        type: "text",
                        value: "## 1. Push vs Poll\n\nA diferença fundamental está em **quem inicia a invocação**:\n\n- **Push (trigger)**: o serviço de origem **empurra** o evento para o Lambda e o invoca diretamente. A configuração do gatilho fica **armazenada no serviço de origem** (por exemplo, na notificação de eventos do bucket S3). Para autorizar, você adiciona uma **resource-based policy** na função.\n- **Poll (event source mapping)**: o Lambda cria um recurso interno que fica **consultando** (polling) a origem e, quando há registros, invoca a função com um **lote (batch)**. O mapping é um **recurso do próprio Lambda** e usa a **execution role** (papel de execução) da função para ler a origem.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Push (trigger)","Poll (event source mapping)"],["Quem invoca o Lambda","O serviço de origem","O próprio Lambda (fazendo polling)"],["Exemplos de origem","S3, SNS, API Gateway, EventBridge","SQS, Kinesis, DynamoDB Streams, MSK, Kafka, MQ, DocumentDB"],["Onde a configuração vive","No serviço de origem","No Lambda (o event source mapping)"],["Onde fica a permissão","**Resource-based policy** na função","**Execution role** (IAM role) da função"],["Processamento","Geralmente um evento por invocação","Em **lotes (batches)** de registros"]]',
                    },
                    {
                        type: "text",
                        value: '## 2. Triggers push e a resource-based policy\n\nQuando o **S3** notifica um upload, ele precisa de **permissão** para invocar a sua função. Essa permissão é uma **resource-based policy** (política baseada em recurso), anexada **à função**, que diz "o serviço S3, vindo deste bucket, pode me invocar". Você a cria com `aws lambda add-permission`:',
                    },
                    {
                        type: "code",
                        value: "aws lambda add-permission \\\n  --function-name processa-upload \\\n  --statement-id s3-invoca \\\n  --action lambda:InvokeFunction \\\n  --principal s3.amazonaws.com \\\n  --source-arn arn:aws:s3:::meu-bucket-uploads \\\n  --source-account 123456789012",
                    },
                    {
                        type: "text",
                        value: "O comando acima produz, por baixo dos panos, a seguinte **resource-based policy** na função. Repare no `Principal` (quem pode invocar) e na condição `SourceArn` (de qual bucket):",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Id": "default",\n  "Statement": [\n    {\n      "Sid": "s3-invoca",\n      "Effect": "Allow",\n      "Principal": { "Service": "s3.amazonaws.com" },\n      "Action": "lambda:InvokeFunction",\n      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:processa-upload",\n      "Condition": {\n        "ArnLike": { "AWS:SourceArn": "arn:aws:s3:::meu-bucket-uploads" }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. Event source mapping (poll-based)\n\nAlgumas origens **não empurram** eventos: elas guardam registros num stream ou numa fila e esperam alguém ler. Para essas, o Lambda usa um **event source mapping**. Os serviços que funcionam assim são:\n\n- **Amazon SQS** (filas)\n- **Amazon Kinesis Data Streams**\n- **Amazon DynamoDB Streams**\n- **Amazon MSK** e **Apache Kafka** autogerenciado\n- **Amazon MQ**\n- **Amazon DocumentDB**\n\nVocê cria o mapping com `create-event-source-mapping`. A partir daí, o Lambda faz o polling sozinho:",
                    },
                    {
                        type: "code",
                        value: "aws lambda create-event-source-mapping \\\n  --function-name processa-fila \\\n  --event-source-arn arn:aws:sqs:us-east-1:123456789012:pedidos \\\n  --batch-size 10 \\\n  --maximum-batching-window-in-seconds 5",
                    },
                    {
                        type: "text",
                        value: '## 4. Batching: batch size e batching window\n\nEm vez de invocar a função uma vez por registro, o event source mapping agrupa registros em **lotes**, o que é bem mais eficiente. Três parâmetros controlam quando o lote "fecha" e a função é invocada:\n\n- **Batch size**: número máximo de registros no lote. O **default e o máximo variam por origem** (veja a tabela).\n- **Batching window** (`MaximumBatchingWindowInSeconds`): tempo máximo, de **0 a 300 segundos**, que o Lambda espera juntando registros.\n- **Payload de 6 MB**: se o lote atingir **6 MB**, ele fecha na hora (esse limite não é configurável).\n\nUma pegadinha comum: para configurar um **batch size maior que 10** em fontes de stream e SQS, você **precisa** definir uma batching window de **pelo menos 1 segundo**.',
                    },
                    {
                        type: "table",
                        value: '[["Origem","Batch size padrão","Batch size máximo"],["Amazon Kinesis Data Streams","100","10.000"],["Amazon DynamoDB Streams","100","10.000"],["Amazon SQS (fila padrão)","10","10.000"],["Amazon SQS (fila FIFO)","10","10"],["Amazon MSK / Kafka / MQ / DocumentDB","100","10.000"]]',
                    },
                    {
                        type: "text",
                        value: "Do lado do código, o `event` traz o lote em `event.Records`, e você itera sobre ele. Este handler processa mensagens vindas de uma fila SQS:",
                    },
                    {
                        type: "code",
                        value: 'export const handler = async (event) => {\n  // O event source mapping entrega um LOTE de registros de uma vez.\n  for (const record of event.Records) {\n    const corpo = JSON.parse(record.body);\n    console.log("Processando mensagem", record.messageId, corpo);\n    // ... lógica de negócio para cada mensagem ...\n  }\n};',
                    },
                    {
                        type: "text",
                        value: "## 5. Onde vive a permissão em cada modelo\n\nEsse contraste é muito cobrado. No modelo **push**, quem invoca é o serviço de origem, então a permissão é uma **resource-based policy** na função. No modelo **poll**, quem lê a origem é o Lambda, então a permissão vai na **execution role** (o IAM role que a função assume) com as ações de leitura da fila/stream:",
                    },
                    {
                        type: "table",
                        value: '[["Modelo","Quem precisa de permissão","Onde configurar"],["Push (S3, SNS, API Gateway)","O serviço de origem, para invocar a função","Resource-based policy (`add-permission`)"],["Poll (SQS, Kinesis, DynamoDB)","A função, para ler a origem","Execution role (IAM role da função)"]]',
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "sqs:ReceiveMessage",\n        "sqs:DeleteMessage",\n        "sqs:GetQueueAttributes"\n      ],\n      "Resource": "arn:aws:sqs:us-east-1:123456789012:pedidos"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 6. Falha parcial no lote (ReportBatchItemFailures)\n\nSe a função lançar um erro processando um lote de SQS ou de stream, por padrão **o lote inteiro** é reprocessado, o que pode reprocessar mensagens que já deram certo. Para evitar isso, habilite `ReportBatchItemFailures` no mapping e devolva **apenas os identificadores** das mensagens que falharam. O Lambda re-tenta só essas:",
                    },
                    {
                        type: "code",
                        value: 'export const handler = async (event) => {\n  const falhas = [];\n  for (const record of event.Records) {\n    try {\n      await processa(record);\n    } catch (erro) {\n      console.error("Falhou:", record.messageId, erro);\n      falhas.push({ itemIdentifier: record.messageId });\n    }\n  }\n  // Só estas mensagens voltam para a fila; as demais são confirmadas.\n  return { batchItemFailures: falhas };\n};',
                    },
                    {
                        type: "quote",
                        value: "Resumo: **push** = o serviço chama o Lambda, permissão via **resource-based policy**. **Poll** = o Lambda lê a origem via **event source mapping**, permissão via **execution role**, processando em **lotes**. SQS/Kinesis/DynamoDB Streams são poll; S3/SNS/API Gateway são push.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual dos serviços abaixo utiliza um event source mapping (modelo poll-based), em que o próprio Lambda faz o polling da origem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Amazon S3",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon SNS",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon SQS",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon API Gateway",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor configura um bucket S3 para invocar uma função Lambda quando novos objetos são criados. Onde deve ser concedida a permissão para que o S3 possa invocar a função?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Na execution role da função, com a ação `s3:GetObject`.",
                                isCorrect: false,
                            },
                            {
                                text: "Em uma resource-based policy anexada à função, permitindo que o principal `s3.amazonaws.com` a invoque.",
                                isCorrect: true,
                            },
                            {
                                text: "Em uma policy de bucket do S3, permitindo `lambda:InvokeFunction`.",
                                isCorrect: false,
                            },
                            {
                                text: "Em um event source mapping criado com `create-event-source-mapping`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função lê mensagens de uma fila SQS padrão via event source mapping. De onde vem a permissão para o Lambda ler e apagar as mensagens da fila?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Da resource-based policy da função, criada com `add-permission`.",
                                isCorrect: false,
                            },
                            {
                                text: "Da execution role (IAM role) da função, com ações como `sqs:ReceiveMessage` e `sqs:DeleteMessage`.",
                                isCorrect: true,
                            },
                            {
                                text: "De uma policy anexada ao usuário IAM que fez o deploy.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é necessária permissão: o Lambda lê filas SQS por padrão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o batch size máximo de um event source mapping para uma fila SQS padrão (standard)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "10",
                                isCorrect: false,
                            },
                            {
                                text: "100",
                                isCorrect: false,
                            },
                            {
                                text: "1.000",
                                isCorrect: false,
                            },
                            {
                                text: "10.000",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao processar lotes de uma fila SQS, uma função falha em apenas uma mensagem do lote, mas o lote inteiro é reentregue, reprocessando mensagens que já haviam sido concluídas. Qual é a forma recomendada de reportar apenas a mensagem com falha?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Habilitar `ReportBatchItemFailures` e retornar `batchItemFailures` com os `itemIdentifier` das mensagens que falharam.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir o batch size para 1, de modo que cada invocação trate uma única mensagem.",
                                isCorrect: false,
                            },
                            {
                                text: "Lançar uma exceção apenas para a mensagem que falhou e capturar as demais.",
                                isCorrect: false,
                            },
                            {
                                text: "Configurar uma batching window de 0 segundos para desativar o agrupamento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Concorrência: reservada vs provisionada",
                blocks: [
                    {
                        type: "text",
                        value: "# Concorrência: reservada vs provisionada",
                    },
                    {
                        type: "quote",
                        value: "**Concorrência** é o número de execuções que sua função atende **ao mesmo tempo**. Toda a conta compartilha um pool padrão de **1.000**. A **concorrência reservada** isola uma fatia exclusiva para uma função (é teto **e** piso, **sem custo extra**). A **concorrência provisionada** mantém ambientes **pré-aquecidos** para eliminar o cold start (com **custo contínuo**) e **precisa apontar para uma versão ou alias**, nunca o `$LATEST`.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é concorrência\n\n**Concorrência** é a quantidade de invocações **em andamento simultaneamente**. Cada request concorrente ocupa **um** ambiente de execução. A fórmula prática é:\n\n**Concorrência = (requisições por segundo) x (duração média em segundos)**\n\nPor exemplo, 100 req/s com 0,5 s por request = **50** de concorrência.\n\nPor padrão, cada conta tem um limite de **1.000 execuções concorrentes por região** (é um **soft limit**, dá para aumentar via Service Quotas). Todas as funções **sem** configuração especial compartilham esse pool, chamado de **unreserved concurrency**. Se o pool acabar, novas invocações sofrem **throttling** (são estranguladas).",
                    },
                    {
                        type: "code",
                        value: 'aws lambda get-account-settings\n\n# Resposta (trecho):\n# "AccountLimit": {\n#     "ConcurrentExecutions": 1000,           <- limite total da conta\n#     "UnreservedConcurrentExecutions": 900   <- disponível para reservar\n# }',
                    },
                    {
                        type: "text",
                        value: '## 2. Concorrência reservada\n\nA **concorrência reservada** (reserved concurrency) separa uma fatia do pool da conta **exclusivamente** para uma função. Características que a prova adora:\n\n- Age como **limite superior E inferior**: garante aquela capacidade para a função **e** impede que ela passe desse número.\n- **Sem custo adicional**: você não paga nada para reservar.\n- **Conta para o limite da conta**: reservar 100 para uma função tira 100 do pool das outras.\n- A AWS **sempre mantém um piso de 100** unidades de unreserved concurrency para as funções que não reservaram nada. Por isso você pode reservar no máximo **900** por padrão (1.000 − 100).\n- Reservar **0** funciona como um **"kill switch"**: a função para de ser invocada (útil para desligar uma função com problema).',
                    },
                    {
                        type: "code",
                        value: '# Reserva 100 execuções concorrentes exclusivas para a função de pagamentos\naws lambda put-function-concurrency \\\n  --function-name pagamentos \\\n  --reserved-concurrent-executions 100\n\n# "Kill switch": reservar 0 impede qualquer invocação\naws lambda put-function-concurrency \\\n  --function-name funcao-com-bug \\\n  --reserved-concurrent-executions 0',
                    },
                    {
                        type: "text",
                        value: "## 3. Concorrência provisionada\n\nA **concorrência provisionada** (provisioned concurrency) é um **pool de ambientes já inicializados** (fase Init já feita), prontos para responder na hora. É o recurso que **elimina o cold start**: as invocações respondem em **dois dígitos de milissegundos**.\n\nPontos essenciais:\n\n- É **cobrada continuamente** enquanto estiver configurada (você paga por manter os ambientes de prontidão, mesmo ociosos).\n- **Não funciona com o `$LATEST`**. Ela **precisa apontar para uma versão publicada ou um alias**. Faz sentido: um pool pré-aquecido exige um alvo **estável e imutável**, e o `$LATEST` muda a cada deploy.\n- O Lambda leva um tempo para alocar (até **6.000 ambientes por minuto**), então provisione **antes** do pico de tráfego.\n- Você pode combinar com **Application Auto Scaling** para escalar o pool por agenda ou por utilização.",
                    },
                    {
                        type: "code",
                        value: "# 1) Publique uma versão imutável e aponte um alias para ela\naws lambda publish-version --function-name checkout\naws lambda create-alias \\\n  --function-name checkout \\\n  --name prod \\\n  --function-version 7\n\n# 2) Concorrência provisionada aponta para o ALIAS (nunca o $LATEST)\naws lambda put-provisioned-concurrency-config \\\n  --function-name checkout \\\n  --qualifier prod \\\n  --provisioned-concurrent-executions 50",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Concorrência reservada","Concorrência provisionada"],["O que faz","Isola uma fatia (teto e piso) do pool da conta","Mantém ambientes pré-inicializados prontos"],["Cold start","Continua existindo","Eliminado (resposta em ~2 dígitos de ms)"],["Custo","**Sem custo adicional**","**Cobrada continuamente**"],["Aponta para","A função","**Versão publicada ou alias** (nunca `$LATEST`)"],["Quando o limite acaba","Throttling (429)","Transborda para a concorrência sob demanda"]]',
                    },
                    {
                        type: "quote",
                        value: "Se a questão pedir para **eliminar cold start**, a resposta é **concorrência provisionada** (pré-aquecida, com custo, aponta para versão/alias). Se pedir para **garantir capacidade e limitar** uma função **sem custo**, é **concorrência reservada** (teto e piso, de graça).",
                    },
                    {
                        type: "text",
                        value: "## 4. Throttling e o erro 429\n\nQuando não há concorrência disponível (o pool acabou ou a função bateu no seu limite reservado), o Lambda **estrangula** (throttle) a invocação e retorna o erro **`TooManyRequestsException`** com status HTTP **429**. O que acontece depois depende do tipo de invocação:\n\n- **Síncrona**: o erro **429** volta para o chamador, que decide se tenta de novo (o ideal é **retry com backoff exponencial**).\n- **Assíncrona**: o Lambda **re-tenta** a partir da fila interna por um tempo; se não conseguir, o evento vai para a **DLQ** ou destino de falha.\n- **Event source mapping**: o mapping **segura** o lote e tenta de novo, respeitando a ordem.",
                    },
                    {
                        type: "code",
                        value: 'import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";\nconst client = new LambdaClient({});\n\ntry {\n  await client.send(new InvokeCommand({ FunctionName: "relatorios" }));\n} catch (erro) {\n  if (erro.name === "TooManyRequestsException") {\n    // HTTP 429: função estrangulada (throttled).\n    // Estratégia correta: retry com backoff exponencial + jitter.\n    console.error("Throttling, vou tentar de novo mais tarde");\n  }\n  throw erro;\n}',
                    },
                    {
                        type: "text",
                        value: "## 5. Escalabilidade e Auto Scaling\n\nO Lambda escala rápido, mas de forma controlada: cada função pode ganhar até **1.000 ambientes a cada 10 segundos**. Para cargas previsíveis (por exemplo, mais tráfego em horário comercial), você automatiza a **concorrência provisionada** com o **Application Auto Scaling**, agendando ou reagindo à utilização. Em infraestrutura como código (SAM), isso fica declarativo:",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Checkout:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      AutoPublishAlias: prod          # publica versão e move o alias a cada deploy\n      ProvisionedConcurrencyConfig:\n        ProvisionedConcurrentExecutions: 50   # pool pré-aquecido no alias 'prod'",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: conta = **1.000** por região (soft), piso de **100** unreserved sempre livre. **Reservada** = teto+piso, sem custo, na função. **Provisionada** = pré-aquecida, com custo, em **versão/alias**. Throttle = **`TooManyRequestsException` / HTTP 429**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma API crítica em produção sofre com latência de cold start nos horários de pico. Qual recurso do Lambda elimina o cold start ao manter ambientes de execução pré-inicializados?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Concorrência reservada",
                                isCorrect: false,
                            },
                            {
                                text: "Concorrência provisionada",
                                isCorrect: true,
                            },
                            {
                                text: "Aumento do timeout da função",
                                isCorrect: false,
                            },
                            {
                                text: "Redução do batch size",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao configurar concorrência provisionada, um desenvolvedor recebe um erro ao tentar aplicá-la sobre o `$LATEST`. Por quê?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Concorrência provisionada só pode ser aplicada a uma versão publicada ou a um alias, nunca ao `$LATEST`.",
                                isCorrect: true,
                            },
                            {
                                text: "O `$LATEST` não aceita variáveis de ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "É preciso primeiro habilitar a concorrência reservada no `$LATEST`.",
                                isCorrect: false,
                            },
                            {
                                text: "O `$LATEST` tem um limite de concorrência fixo de 100.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre a concorrência reservada, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela tem cobrança contínua, proporcional ao número de execuções reservadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela mantém ambientes pré-inicializados para eliminar o cold start.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela não tem custo adicional e age tanto como limite superior quanto inferior da função.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela só pode ser configurada em um alias, nunca diretamente na função.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função invocada de forma síncrona começa a ser estrangulada (throttled) porque a conta ficou sem concorrência disponível. Qual erro e código HTTP o chamador recebe?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`AccessDeniedException`, HTTP 403",
                                isCorrect: false,
                            },
                            {
                                text: "`TooManyRequestsException`, HTTP 429",
                                isCorrect: true,
                            },
                            {
                                text: "`ResourceNotFoundException`, HTTP 404",
                                isCorrect: false,
                            },
                            {
                                text: "`ServiceException`, HTTP 500",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma conta com o limite padrão de 1.000 execuções concorrentes, qual é a quantidade máxima de concorrência que pode ser reservada no nível de função, e por quê?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "1.000, pois toda a concorrência da conta pode ser reservada.",
                                isCorrect: false,
                            },
                            {
                                text: "900, porque o Lambda sempre mantém um piso de 100 unidades de concorrência não reservada.",
                                isCorrect: true,
                            },
                            {
                                text: "500, que é metade do limite da conta.",
                                isCorrect: false,
                            },
                            {
                                text: "100, que é o teto de reserva por conta.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Versões, aliases, layers e variáveis de ambiente",
                blocks: [
                    {
                        type: "text",
                        value: "# Versões, aliases, layers e variáveis de ambiente",
                    },
                    {
                        type: "quote",
                        value: "Uma **versão** é um **snapshot imutável** do código e da configuração. Um **alias** é um **ponteiro móvel** para uma versão (e permite deploys canário com pesos). Um **layer** é um `.zip` de dependências reaproveitável que mantém o pacote abaixo da cota. E as **variáveis de ambiente** guardam configuração sem mexer no código, com criptografia via **KMS**.",
                    },
                    {
                        type: "text",
                        value: "## 1. $LATEST e versões imutáveis\n\nToda função tem uma versão de trabalho chamada **`$LATEST`**: é a única **editável**, e é ela que muda quando você atualiza o código. Quando você quer **congelar** um estado para produção, você **publica uma versão**. A versão publicada é **imutável**: recebe um número sequencial (1, 2, 3...), e nem o código nem a configuração podem ser alterados depois. Isso te dá rollback confiável.",
                    },
                    {
                        type: "code",
                        value: '# Atualiza o código do $LATEST (a versão de trabalho, editável)\naws lambda update-function-code \\\n  --function-name api-produtos \\\n  --zip-file fileb://api.zip\n\n# Congela um snapshot imutável -> retorna, por exemplo, "Version": "5"\naws lambda publish-version \\\n  --function-name api-produtos \\\n  --description "release 2026-07"',
                    },
                    {
                        type: "text",
                        value: "## 2. Aliases e deploy canário\n\nUm **alias** é um **nome** que aponta para uma versão específica (por exemplo, `prod` -> versão 5). O truque: os clientes chamam sempre o alias `prod`, e você **promove uma nova versão** só movendo o ponteiro, sem os clientes mudarem nada.\n\nMelhor ainda: um **weighted alias** (alias com peso) faz um **deploy canário**, mandando uma fração do tráfego para uma nova versão. No exemplo abaixo, 90% vai para a versão 5 e 10% para a versão 6, para você observar erros antes de promover 100%.",
                    },
                    {
                        type: "code",
                        value: "# Alias 'prod' aponta para a versão 5\naws lambda create-alias \\\n  --function-name api-produtos \\\n  --name prod \\\n  --function-version 5\n\n# Canário: mantém 5 como principal e envia 10% do tráfego para a versão 6\naws lambda update-alias \\\n  --function-name api-produtos \\\n  --name prod \\\n  --function-version 5 \\\n  --routing-config '{\"AdditionalVersionWeights\": {\"6\": 0.1}}'",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Editável?","Para que serve"],["`$LATEST`","Sim","Versão de trabalho; recebe as atualizações de código"],["Versão publicada (1, 2, 3...)","Não (imutável)","Snapshot estável para produção e rollback"],["Alias (ex.: `prod`, `dev`)","Sim (aponta para outra versão)","Ponteiro móvel; deploy canário com pesos"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Layers\n\nUm **layer** é um arquivo `.zip` com **bibliotecas, dependências ou até um runtime** que você anexa à função **separadamente** do código. Para que servem:\n\n- **Manter o pacote de implantação abaixo da cota de tamanho** (as dependências saem do `.zip` da função).\n- **Reaproveitar código** entre várias funções (uma lib compartilhada num único layer).\n- Separar o que muda pouco (dependências) do que muda muito (seu código).\n\nRegras: uma função pode usar até **5 layers**, e a soma de função + layers **descompactados** deve caber em **250 MB**. No runtime, o conteúdo do layer é extraído em **`/opt`**. A estrutura do `.zip` precisa seguir o caminho que o runtime espera (para Node.js, `nodejs/node_modules`).",
                    },
                    {
                        type: "code",
                        value: "# Estrutura esperada do .zip do layer (Node.js):\n#   nodejs/node_modules/<suas dependências>\n# No runtime, esse conteúdo é extraído em /opt/nodejs/node_modules.\n\nzip -r dependencias.zip nodejs\n\naws lambda publish-layer-version \\\n  --layer-name libs-comuns \\\n  --zip-file fileb://dependencias.zip \\\n  --compatible-runtimes nodejs20.x\n\n# Anexa o layer à função (o ARN termina com o número da versão do layer)\naws lambda update-function-configuration \\\n  --function-name api-produtos \\\n  --layers arn:aws:lambda:us-east-1:123456789012:layer:libs-comuns:1",
                    },
                    {
                        type: "code",
                        value: '// No código da função, a lib do layer é importada normalmente:\n// o runtime a resolve em /opt/nodejs/node_modules.\nimport { formataMoeda } from "utilitarios-comuns";\n\nexport const handler = async (event) => {\n  return { preco: formataMoeda(event.valor) };\n};',
                    },
                    {
                        type: "text",
                        value: "## 4. Variáveis de ambiente e KMS\n\n**Variáveis de ambiente** são pares chave-valor que ficam disponíveis para o código em tempo de execução (`process.env` no Node, `os.environ` no Python). Servem para configurar a função **sem mudar o código** (nome de tabela, nível de log, endpoint). O limite é **4 KB no total**, somando todas.\n\nSobre segurança: em repouso, o Lambda **sempre criptografa** as variáveis com o **AWS KMS**. Por padrão usa uma chave gerenciada pela AWS; para dados sensíveis, aponte uma **chave gerenciada pelo cliente (CMK)**. Para segredos de verdade (senhas, tokens), a prática recomendada é guardar no **Secrets Manager** ou **SSM Parameter Store** e ler em runtime, em vez de deixar em texto na env var.",
                    },
                    {
                        type: "code",
                        value: 'aws lambda update-function-configuration \\\n  --function-name api-produtos \\\n  --environment "Variables={LOG_LEVEL=info,TABELA=produtos}" \\\n  --kms-key-arn arn:aws:kms:us-east-1:123456789012:key/abcd-1234',
                    },
                    {
                        type: "code",
                        value: '// A função lê as variáveis de ambiente do process.env\nconst LOG_LEVEL = process.env.LOG_LEVEL || "warn";\nconst TABELA = process.env.TABELA;',
                    },
                    {
                        type: "text",
                        value: "## 5. Aliases + stage variables do API Gateway (dev vs prod)\n\nUm padrão clássico da DVA: servir **dev** e **prod** com **uma única função**, combinando **aliases do Lambda** com **stage variables do API Gateway**. A ideia:\n\n- A função tem os aliases `dev` (aponta para o `$LATEST` ou uma versão de teste) e `prod` (aponta para a versão estável).\n- Cada **stage** do API Gateway (`dev` e `prod`) define uma **stage variable** (por exemplo, `lambdaAlias`) com o nome do alias correspondente.\n- A **URI de integração** usa essa stage variable, então o mesmo API Gateway roteia para o alias certo conforme o stage chamado.",
                    },
                    {
                        type: "code",
                        value: "# URI de integração do API Gateway, parametrizada pela stage variable:\narn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:api-produtos:${stageVariables.lambdaAlias}/invocations\n\n# No stage 'dev'  -> stage variable  lambdaAlias = dev\n# No stage 'prod' -> stage variable  lambdaAlias = prod",
                    },
                    {
                        type: "table",
                        value: '[["Ambiente","Stage do API Gateway","Stage variable `lambdaAlias`","Alias do Lambda"],["Desenvolvimento","`dev`","`dev`","`dev` -> versão de teste"],["Produção","`prod`","`prod`","`prod` -> versão estável"]]',
                    },
                    {
                        type: "quote",
                        value: "Fixe: **versão** = imutável (snapshot), **alias** = ponteiro móvel (canário com pesos), **layer** = `.zip` de dependências reaproveitável para caber na cota (até 5, extraído em `/opt`), **env vars** = config em 4 KB, criptografada por KMS. **Alias + stage variables** = dev e prod com uma função só.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a principal característica de uma versão publicada do Lambda em comparação com o `$LATEST`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A versão publicada é imutável: nem o código nem a configuração podem ser alterados depois de publicada.",
                                isCorrect: true,
                            },
                            {
                                text: "A versão publicada pode ser editada livremente, ao contrário do `$LATEST`.",
                                isCorrect: false,
                            },
                            {
                                text: "A versão publicada não pode receber um alias.",
                                isCorrect: false,
                            },
                            {
                                text: "A versão publicada não conta para o limite de armazenamento da conta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer liberar uma nova versão para apenas 10% do tráfego de produção antes de promovê-la totalmente. Qual recurso do Lambda permite isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Concorrência provisionada apontando para as duas versões.",
                                isCorrect: false,
                            },
                            {
                                text: "Um weighted alias (alias com pesos de roteamento) distribuindo o tráfego entre as versões.",
                                isCorrect: true,
                            },
                            {
                                text: "Duas funções separadas atrás de um balanceador de carga.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma variável de ambiente indicando a porcentagem de rollout.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O pacote de implantação de uma função ultrapassou o limite de tamanho por causa de bibliotecas pesadas que também são usadas por outras funções. Qual recurso resolve isso mantendo o pacote menor e reaproveitando o código?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Aumentar a memória da função para 10 GB.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover as dependências para um Lambda layer e anexá-lo à função.",
                                isCorrect: true,
                            },
                            {
                                text: "Ativar a concorrência reservada na função.",
                                isCorrect: false,
                            },
                            {
                                text: "Publicar uma nova versão da função.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre as variáveis de ambiente do Lambda, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "São sempre criptografadas em repouso pelo AWS KMS, e você pode usar uma chave gerenciada pelo cliente (CMK) para dados sensíveis.",
                                isCorrect: true,
                            },
                            {
                                text: "Não podem ser criptografadas; por isso segredos devem ficar no código.",
                                isCorrect: false,
                            },
                            {
                                text: "Têm limite individual de 4 KB por variável.",
                                isCorrect: false,
                            },
                            {
                                text: "Só ficam disponíveis para runtimes de contêiner.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa servir os ambientes de desenvolvimento e produção usando a mesma função Lambda por trás do API Gateway. Qual combinação permite rotear cada stage para o alias correto do Lambda?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Aliases do Lambda combinados com stage variables do API Gateway na URI de integração.",
                                isCorrect: true,
                            },
                            {
                                text: "Duas versões do `$LATEST`, uma para cada ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Concorrência reservada diferente em cada stage.",
                                isCorrect: false,
                            },
                            {
                                text: "Dois layers distintos, um para dev e outro para prod.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Lambda em VPC e tratamento de erros",
                blocks: [
                    {
                        type: "text",
                        value: "# Lambda em VPC e tratamento de erros",
                    },
                    {
                        type: "quote",
                        value: "Para acessar recursos **privados** (um banco RDS, um ElastiCache), você conecta a função a uma **VPC**, e o Lambda cria uma **ENI** (interface de rede) nas suas subnets. Do lado dos erros: invocação assíncrona tem **retries automáticos** e, quando esgotam, o evento vai para uma **dead-letter queue (DLQ)** ou para um **destination** (onSuccess/onFailure). Como a entrega é **at-least-once**, sua função **precisa ser idempotente**.",
                    },
                    {
                        type: "text",
                        value: "## 1. Lambda dentro de uma VPC\n\nPor padrão, o Lambda roda numa **VPC gerenciada pela AWS**, com acesso à internet, mas **sem** acesso aos seus recursos privados. Para alcançar um **RDS**, um **ElastiCache** ou qualquer recurso em subnet privada, você **conecta a função à sua VPC**, informando **subnets** e **security groups**. O Lambda então cria uma **ENI (Elastic Network Interface)** do tipo Hyperplane para se comunicar dentro da VPC.",
                    },
                    {
                        type: "code",
                        value: "aws lambda update-function-configuration \\\n  --function-name consulta-rds \\\n  --vpc-config SubnetIds=subnet-0a1b2c,subnet-0d3e4f,SecurityGroupIds=sg-0a1b2c",
                    },
                    {
                        type: "text",
                        value: "## 2. Implicações de rodar em VPC\n\nColocar a função na VPC tem consequências que a prova cobra:\n\n- **Perda de acesso à internet**: uma função em subnet **privada** deixa de ter saída para a internet. Se precisar chamar uma API externa ou serviços AWS públicos, use um **NAT Gateway** (para internet) ou **VPC endpoints** (para serviços AWS sem sair para a internet).\n- **Permissão de rede**: a execution role precisa poder criar/gerenciar ENIs. A policy gerenciada **`AWSLambdaVPCAccessExecutionRole`** já traz isso.\n- **Use subnets privadas** e distribua em várias **AZs** para alta disponibilidade.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Fora da VPC (padrão)","Dentro da sua VPC"],["Acesso a RDS/ElastiCache privados","Não","Sim"],["Acesso à internet","Sim, por padrão","Só com NAT Gateway (subnet privada)"],["Acesso a serviços AWS","Direto","Direto ou via VPC endpoints"],["Permissão extra na role","Não","Sim (`AWSLambdaVPCAccessExecutionRole`)"]]',
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "ec2:CreateNetworkInterface",\n        "ec2:DescribeNetworkInterfaces",\n        "ec2:DeleteNetworkInterface"\n      ],\n      "Resource": "*"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. Tratamento de erros: depende do tipo de invocação\n\nComo o Lambda reage a um erro depende de **quem invocou** a função:\n\n- **Síncrona**: o Lambda **não** faz retry. O erro **volta para o chamador**, que decide (API Gateway, por exemplo, repassa o erro para o cliente).\n- **Assíncrona**: o Lambda faz **retry automático** (2 vezes por padrão) a partir da fila interna; se esgotar, envia para **DLQ** ou **destination** de falha.\n- **Event source mapping (stream)**: re-tenta o **lote** inteiro, pode **dividir o lote em dois** (`BisectBatchOnFunctionError`) e enviar registros descartados para um **on-failure destination**.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo de invocação","Retry automático","Para onde vão as falhas"],["Síncrona (API Gateway, invoke)","Não","Erro volta ao chamador"],["Assíncrona (S3, SNS, EventBridge)","Sim, 2 tentativas (padrão)","DLQ ou destination onFailure"],["Event source mapping (Kinesis, DynamoDB)","Sim, lote re-tentado (configurável)","On-failure destination (SQS/SNS/S3)"]]',
                    },
                    {
                        type: "text",
                        value: "## 4. Retries, idade do evento e DLQ (invocação assíncrona)\n\nNa invocação **assíncrona**, o Lambda guarda o evento numa **fila interna**. Se a função falhar, ele **re-tenta 2 vezes por padrão** (configurável de **0 a 2** em `MaximumRetryAttempts`). Você também define a **idade máxima do evento** (`MaximumEventAgeInSeconds`), de **60 segundos a 6 horas**: passou disso sem sucesso, o evento é descartado. Ao descartar, ele pode ir para uma **dead-letter queue (DLQ)**, que é uma fila **SQS** ou um tópico **SNS** onde a mensagem que falhou é preservada para análise.",
                    },
                    {
                        type: "code",
                        value: 'aws lambda put-function-event-invoke-config \\\n  --function-name processa-evento \\\n  --maximum-retry-attempts 1 \\\n  --maximum-event-age-in-seconds 3600 \\\n  --destination-config \'{"OnFailure":{"Destination":"arn:aws:sqs:us-east-1:123456789012:falhas"},"OnSuccess":{"Destination":"arn:aws:sns:us-east-1:123456789012:sucesso"}}\'',
                    },
                    {
                        type: "text",
                        value: "## 5. DLQ vs Lambda Destinations\n\nDLQ e **Destinations** resolvem problemas parecidos, mas Destinations é o recurso **mais novo e completo**:\n\n- **Dead-letter queue (DLQ)**: captura **só o evento que falhou**, entregando o payload a uma fila **SQS** ou tópico **SNS**. Não guarda o contexto da execução.\n- **Lambda Destinations**: roteia o resultado da invocação assíncrona para `onSuccess` **e** `onFailure`, com destino podendo ser **SQS, SNS, outra função Lambda ou EventBridge**. Inclui **contexto rico** (request, response e o motivo da falha), o que facilita muito a depuração e o encadeamento de fluxos.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Dead-letter queue (DLQ)","Lambda Destinations"],["Trata sucesso?","Não, só falha","Sim: `onSuccess` e `onFailure`"],["Destinos possíveis","SQS ou SNS","SQS, SNS, Lambda ou EventBridge"],["Conteúdo enviado","Só o payload do evento","Contexto rico (request, response, erro)"],["Recomendação da AWS","Recurso mais antigo","Preferir Destinations"]]',
                    },
                    {
                        type: "code",
                        value: "Resources:\n  ProcessaEvento:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      DeadLetterQueue:                 # DLQ clássica (SQS/SNS)\n        Type: SQS\n        TargetArn: arn:aws:sqs:us-east-1:123456789012:dlq-processa\n      EventInvokeConfig:               # Destinations + retries\n        MaximumRetryAttempts: 1\n        MaximumEventAgeInSeconds: 3600\n        DestinationConfig:\n          OnFailure:\n            Type: SQS\n            Destination: arn:aws:sqs:us-east-1:123456789012:falhas",
                    },
                    {
                        type: "text",
                        value: "## 6. Idempotência\n\nEvent source mappings e retries de invocação assíncrona entregam eventos **at-least-once** (pelo menos uma vez): o **mesmo evento pode chegar mais de uma vez**. Se a função grava em banco, cobra um cartão ou envia e-mail, o reprocessamento pode causar **duplicatas**. A defesa é tornar a função **idempotente**: processar o mesmo evento duas vezes tem o **mesmo efeito** que processá-lo uma vez.\n\nUma técnica comum é usar uma **chave de idempotência** (por exemplo, o `messageId`) e uma **escrita condicional** no DynamoDB, que falha se o item já existir:",
                    },
                    {
                        type: "code",
                        value: 'import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";\nconst client = new DynamoDBClient({});\n\nexport const handler = async (event) => {\n  for (const record of event.Records) {\n    const id = record.messageId; // chave de idempotência\n    try {\n      await client.send(new PutItemCommand({\n        TableName: process.env.PROCESSADOS,\n        Item: { id: { S: id } },\n        ConditionExpression: "attribute_not_exists(id)", // só grava se for novo\n      }));\n    } catch (erro) {\n      if (erro.name === "ConditionalCheckFailedException") {\n        // Já processado antes: ignore com segurança (idempotente).\n        continue;\n      }\n      throw erro;\n    }\n    await processa(record);\n  }\n};',
                    },
                    {
                        type: "text",
                        value: "## 7. Boas práticas de erro\n\n- **Capture exceções específicas** e registre um **log estruturado** (nunca engula o erro em silêncio).\n- Em invocação assíncrona, **deixe a função falhar** de propósito quando não conseguir processar: assim o retry e a DLQ/destino entram em ação.\n- Configure **sempre** uma **DLQ ou destination onFailure** para não perder eventos.\n- Torne a função **idempotente** para tolerar o reprocessamento.\n- Ajuste **timeouts e retries do SDK** para não estourar o timeout da função esperando um recurso lento.",
                    },
                    {
                        type: "quote",
                        value: "Fixe: VPC = acesso a recursos privados via **ENI** (perde internet sem NAT; precisa da policy `AWSLambdaVPCAccessExecutionRole`). Assíncrono = **2 retries**, idade do evento **60 s–6 h**, depois **DLQ** (SQS/SNS) ou **Destinations** (onSuccess/onFailure, mais rico). Entrega **at-least-once** exige **idempotência**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma função Lambda precisa consultar um banco de dados Amazon RDS que fica em subnets privadas de uma VPC. O que é necessário para que a função alcance esse banco?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Conectar a função à VPC informando subnets e security groups; o Lambda cria uma ENI para se comunicar na rede.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o timeout da função para 15 minutos.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar concorrência provisionada na função.",
                                isCorrect: false,
                            },
                            {
                                text: "Publicar uma versão da função e criar um alias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quantas vezes, por padrão, o Lambda tenta reprocessar automaticamente um evento em uma invocação assíncrona que falha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Nenhuma vez",
                                isCorrect: false,
                            },
                            {
                                text: "1 vez",
                                isCorrect: false,
                            },
                            {
                                text: "2 vezes",
                                isCorrect: true,
                            },
                            {
                                text: "5 vezes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer capturar tanto os resultados de sucesso quanto os de falha das invocações assíncronas, roteando cada um para destinos diferentes (SQS, SNS, EventBridge ou outra função), com contexto rico da execução. Qual recurso atende melhor a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma dead-letter queue (DLQ), que trata sucesso e falha.",
                                isCorrect: false,
                            },
                            {
                                text: "Lambda Destinations, com `onSuccess` e `onFailure`.",
                                isCorrect: true,
                            },
                            {
                                text: "Concorrência reservada com valor 0.",
                                isCorrect: false,
                            },
                            {
                                text: "Um layer contendo a lógica de tratamento de erros.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função é invocada por um event source mapping de SQS, cuja entrega é at-least-once. Por que é importante que a função seja idempotente?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o mesmo evento pode ser entregue mais de uma vez, e o reprocessamento não pode gerar efeitos duplicados (como cobrar duas vezes).",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a idempotência reduz o cold start da função.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque sem idempotência a função não pode acessar uma VPC.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a fila SQS exige que a função retorne sempre o mesmo statusCode.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao configurar o tratamento de erros de uma invocação assíncrona, qual é o intervalo válido para a idade máxima do evento (maximum event age) na fila interna do Lambda?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "De 1 segundo a 15 minutos",
                                isCorrect: false,
                            },
                            {
                                text: "De 60 segundos a 6 horas",
                                isCorrect: true,
                            },
                            {
                                text: "De 5 minutos a 24 horas",
                                isCorrect: false,
                            },
                            {
                                text: "De 1 hora a 14 dias",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Data stores: DynamoDB e cia",
        aulas: [
            {
                titulo: "DynamoDB - fundamentos e modelagem",
                blocks: [
                    {
                        type: "text",
                        value: "# DynamoDB - fundamentos e modelagem",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon DynamoDB** é um banco de dados **NoSQL** totalmente gerenciado e **serverless**, com latência de **milissegundos de um dígito** em qualquer escala. Você não administra servidor nem cluster: cria uma tabela, define a **chave primária** e acessa tudo pela **API/SDK**, não por SQL. Na DVA-C02 o que cai é **modelagem orientada ao padrão de acesso** e como escolher bem a chave.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é o DynamoDB\n\nO DynamoDB é um banco **NoSQL** de **chave-valor e documento**. Fixe as características que a prova cobra:\n\n- **Totalmente gerenciado e serverless**: nada de provisionar servidor, aplicar patch ou planejar disco. A AWS cuida da infraestrutura.\n- **Escala horizontal automática**: distribui os dados em **partições** por baixo dos panos, crescendo sozinho.\n- **Alta disponibilidade**: replica cada item de forma síncrona em **3 zonas de disponibilidade (AZs)** de uma região.\n- **Latência baixa e previsível**: **milissegundos de um dígito**, mesmo com terabytes de dados.\n- **Sem esquema fixo**: fora a chave primária, cada item pode ter atributos diferentes. Não existe `JOIN`; você modela pensando em **como vai ler**.",
                    },
                    {
                        type: "text",
                        value: "## 2. Tabela, item e atributo\n\nTrês palavras formam o vocabulário base:\n\n- **Tabela**: uma coleção de itens (o equivalente à tabela relacional).\n- **Item**: um registro individual, o análogo de uma **linha**. Um item tem no máximo **400 KB** (somando nomes e valores dos atributos).\n- **Atributo**: um par nome-valor dentro do item, o análogo de uma **coluna**.\n\nA diferença central para o mundo relacional: o DynamoDB é **schemaless**. Só os atributos da **chave primária** são obrigatórios em todo item; o resto varia de item para item.",
                    },
                    {
                        type: "table",
                        value: '[["Conceito relacional","Conceito no DynamoDB"],["Tabela","Tabela"],["Linha (row)","**Item** (até 400 KB)"],["Coluna (column)","**Atributo**"],["Esquema fixo para todas as linhas","Sem esquema (só a chave primária é obrigatória)"],["Chave primária + índices","Partition key (+ sort key) + LSI/GSI"],["SQL com JOINs","API/SDK: PutItem, GetItem, Query, Scan"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Anatomia de um item\n\nCada valor de atributo vem com um **descritor de tipo** (`S` de string, `N` de número, e assim por diante). Veja um item de pedido com vários tipos:",
                    },
                    {
                        type: "code",
                        value: '{\n  "Cliente":  { "S": "ana@exemplo.com" },\n  "PedidoId": { "S": "P-1001" },\n  "Valor":    { "N": "249.90" },\n  "Pago":     { "BOOL": true },\n  "Itens":    { "L": [ { "S": "teclado" }, { "S": "mouse" } ] },\n  "Entrega":  { "M": { "Cidade": { "S": "Recife" }, "CEP": { "S": "50000-000" } } },\n  "Cupons":   { "SS": [ "BLACK10", "FRETEGRATIS" ] }\n}',
                    },
                    {
                        type: "text",
                        value: "## 4. Chave primária: simples e composta\n\nToda tabela tem uma **chave primária**, definida na criação, que identifica cada item de forma **única**. Existem dois formatos:\n\n- **Chave primária simples**: só a **partition key** (também chamada de *hash key*). O valor da partition key precisa ser único em toda a tabela.\n- **Chave primária composta**: **partition key + sort key** (a *sort key* também é chamada de *range key*). Aqui a **combinação** (partition key, sort key) é que precisa ser única. **Vários itens podem ter a mesma partition key**, desde que tenham sort keys diferentes.\n\nItens que compartilham a mesma partition key formam uma **coleção de itens** (*item collection*), guardada junta e **ordenada pela sort key**. É isso que torna a `Query` tão eficiente.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Chave simples (só partition key)","Chave composta (partition + sort key)"],["O que é único","O valor da partition key","A combinação (partition key, sort key)"],["Itens por partition key","Um","Vários, ordenados pela sort key"],["Exemplo","`UsuarioId`","`Cliente` (partition) + `PedidoId` (sort)"],["Permite Query por faixa","Não","Sim (condição na sort key)"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Como o hashing distribui os dados\n\nO DynamoDB guarda os dados em **partições físicas**. Para decidir em qual partição um item vai, ele passa o **valor da partition key** por uma **função de hash interna**. O resultado do hash aponta a partição.\n\nA consequência prática: itens com a **mesma** partition key caem na **mesma** partição (juntos e ordenados pela sort key), e valores **diferentes** de partition key tendem a se espalhar por partições diferentes. Uma distribuição uniforme depende de a partition key ter **muitos valores distintos** e um acesso equilibrado entre eles.",
                    },
                    {
                        type: "code",
                        value: '  partition key = "ana@exemplo.com"\n            |\n            v   funcao de hash interna\n     +-----------+   +-----------+   +-----------+\n     | Particao A|   | Particao B|   | Particao C|\n     +-----------+   +-----------+   +-----------+\n\n  Itens com a MESMA partition key caem na MESMA particao,\n  ordenados pela sort key. Partition keys diferentes se\n  espalham entre as particoes.',
                    },
                    {
                        type: "text",
                        value: "## 6. Hot partition: o problema e a defesa\n\nSe o acesso se concentra em **poucos valores** de partition key, uma partição recebe tráfego demais e vira uma **hot partition** (partição quente): ela sofre **throttling** (é estrangulada) enquanto as outras ficam ociosas. O throughput da tabela existe, mas está mal distribuído.\n\nA defesa é de **modelagem**: escolha uma partition key de **alta cardinalidade** (muitos valores distintos) e com acesso **uniforme**, como `UsuarioId` ou `PedidoId`. Evite chaves de baixa cardinalidade como `Status` (poucos valores) ou uma **data fixa** que concentra as escritas do dia. A AWS ainda ajuda com **adaptive capacity** (redistribui capacidade para a partição quente) e você pode aplicar **write sharding** (adicionar um sufixo aleatório à chave), mas o certo é já nascer com uma boa partition key.",
                    },
                    {
                        type: "quote",
                        value: 'Dica de prova: quando a questão descrever **throttling em uma tabela que "sobra" capacidade**, pense em **hot partition**. A resposta quase sempre é **escolher uma partition key de alta cardinalidade e bem distribuída**, e não aumentar o throughput.',
                    },
                    {
                        type: "text",
                        value: "## 7. Tipos de dados\n\nOs tipos de atributo se dividem em três famílias:\n\n- **Escalares**: `S` (string), `N` (número, até 38 dígitos de precisão), `B` (binário, em base64), `BOOL` (booleano) e `NULL`.\n- **Documento**: `L` (lista, ordenada e heterogênea) e `M` (mapa, pares chave-valor aninhados, como um JSON).\n- **Conjunto (set)**: `SS` (conjunto de strings), `NS` (conjunto de números) e `BS` (conjunto de binários). Um set **não pode ser vazio** e não tem ordem.\n\nUm detalhe cobrado: os atributos da **chave primária** só podem ser dos tipos escalares **S, N ou B**.",
                    },
                    {
                        type: "table",
                        value: '[["Família","Tipos","Observação"],["Escalar","`S`, `N`, `B`, `BOOL`, `NULL`","`N` tem até 38 dígitos; chave primária só aceita S, N ou B"],["Documento","`L` (lista), `M` (mapa)","Aninhados, estilo JSON"],["Conjunto","`SS`, `NS`, `BS`","Sem ordem, sem duplicatas, não pode ser vazio"]]',
                    },
                    {
                        type: "text",
                        value: "## 8. Operações de escrita e leitura\n\nVocê manipula os dados por chamadas de API (via CLI ou SDK). As principais:\n\n- **PutItem**: cria um item novo ou **substitui inteiro** um item existente com a mesma chave.\n- **GetItem**: lê **um** item pela **chave primária completa**.\n- **UpdateItem**: altera atributos de um item (sem reescrever o item todo), aceita expressões e escrita condicional.\n- **DeleteItem**: apaga um item pela chave.\n- **BatchGetItem / BatchWriteItem**: lê ou grava vários itens em lote.\n- **Query** e **Scan**: recuperam vários itens (o assunto da próxima seção).",
                    },
                    {
                        type: "code",
                        value: '# Cria a tabela com chave composta: Cliente (partition) + PedidoId (sort)\naws dynamodb create-table \\\n  --table-name Pedidos \\\n  --attribute-definitions \\\n      AttributeName=Cliente,AttributeType=S \\\n      AttributeName=PedidoId,AttributeType=S \\\n  --key-schema \\\n      AttributeName=Cliente,KeyType=HASH \\\n      AttributeName=PedidoId,KeyType=RANGE \\\n  --billing-mode PAY_PER_REQUEST\n\n# Grava (ou substitui) um item\naws dynamodb put-item \\\n  --table-name Pedidos \\\n  --item \'{ "Cliente": {"S":"ana@exemplo.com"}, "PedidoId": {"S":"P-1001"}, "Valor": {"N":"249.90"} }\'\n\n# Le UM item pela chave primaria COMPLETA\naws dynamodb get-item \\\n  --table-name Pedidos \\\n  --key \'{ "Cliente": {"S":"ana@exemplo.com"}, "PedidoId": {"S":"P-1001"} }\'',
                    },
                    {
                        type: "code",
                        value: 'import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";\n\n// Cliente criado no Init da função e reaproveitado entre invocações\nconst client = new DynamoDBClient({});\n\n// Grava um item (cria ou substitui pelo mesmo par de chaves)\nawait client.send(new PutItemCommand({\n  TableName: "Pedidos",\n  Item: {\n    Cliente:  { S: "ana@exemplo.com" },\n    PedidoId: { S: "P-1001" },\n    Valor:    { N: "249.90" },\n  },\n}));\n\n// Le UM item pela chave primaria completa (partition + sort)\nconst { Item } = await client.send(new GetItemCommand({\n  TableName: "Pedidos",\n  Key: { Cliente: { S: "ana@exemplo.com" }, PedidoId: { S: "P-1001" } },\n}));',
                    },
                    {
                        type: "text",
                        value: "## 9. Query vs Scan (e por que Query vence)\n\nEsse contraste é **muito cobrado**. As duas leem vários itens, mas de formas radicalmente diferentes:\n\n- **Query**: exige o **valor exato da partition key** (igualdade) e aceita uma **condição opcional na sort key** (`=`, `<`, `>`, `between`, `begins_with`). Ela vai **direto** à partição daquela chave e lê só aqueles itens, já ordenados. É **eficiente** e consome capacidade proporcional ao que **retorna**.\n- **Scan**: **varre a tabela inteira**, item por item, e **só depois** aplica o `FilterExpression`. Você **paga RCU por tudo que foi lido**, inclusive o que o filtro descarta. É **caro** e lento em tabelas grandes.\n\nO ponto-chave: o **filtro do Scan roda depois da leitura**, então ele **não** economiza capacidade. Use `Query` sempre que possível; reserve `Scan` para casos raros (exportações, tabelas pequenas) e, se precisar, pagine com `Limit` e use **Parallel Scan** com cuidado.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Query","Scan"],["O que lê","Só os itens de UMA partition key","A **tabela inteira**"],["Exige partition key?","Sim (igualdade)","Não"],["Quando o filtro age","Na chave, antes de ler (eficiente)","**Depois** de ler tudo (não economiza RCU)"],["Custo de capacidade","Proporcional ao que retorna","Proporcional a **tudo** que foi varrido"],["Recomendação","**Preferir sempre**","Evitar; usar só em último caso"]]',
                    },
                    {
                        type: "code",
                        value: '# QUERY: le so os itens de UMA partition key (eficiente, usa o indice)\naws dynamodb query \\\n  --table-name Pedidos \\\n  --key-condition-expression "Cliente = :c AND begins_with(PedidoId, :p)" \\\n  --expression-attribute-values \'{ ":c": {"S":"ana@exemplo.com"}, ":p": {"S":"P-"} }\'\n\n# SCAN: varre a TABELA INTEIRA e so depois aplica o filtro (caro)\naws dynamodb scan \\\n  --table-name Pedidos \\\n  --filter-expression "Valor > :v" \\\n  --expression-attribute-values \'{ ":v": {"N":"100"} }\'',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet da aula: **item** até **400 KB**; chave **simples** (partition) ou **composta** (partition + sort); **hashing** da partition key define a partição (cuidado com **hot partition** -> use alta cardinalidade); tipos **S/N/B/BOOL/NULL/L/M/SS/NS/BS** (chave só S/N/B); **Query** > **Scan** porque o filtro do Scan roda **depois** de ler tudo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No vocabulário do DynamoDB, o que corresponde a uma 'linha' de um banco relacional e qual é o seu tamanho máximo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um atributo; máximo de 4 KB.",
                                isCorrect: false,
                            },
                            {
                                text: "Um item; máximo de 400 KB.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma tabela; máximo de 10 GB.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma partição; máximo de 1 KB.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma tabela usa chave composta: partition key `Cliente` e sort key `PedidoId`. Qual afirmação é verdadeira?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Só pode existir um único item para cada valor de `Cliente`.",
                                isCorrect: false,
                            },
                            {
                                text: "Vários itens podem ter o mesmo `Cliente`, desde que o par (`Cliente`, `PedidoId`) seja único.",
                                isCorrect: true,
                            },
                            {
                                text: "A sort key `PedidoId` precisa ser única sozinha em toda a tabela.",
                                isCorrect: false,
                            },
                            {
                                text: "A partition key e a sort key precisam ter sempre o mesmo valor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao escolher a partition key de uma tabela com acesso muito uniforme, qual opção MELHOR evita o problema de hot partition?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Um atributo `Status` com apenas três valores possíveis (PENDENTE, PAGO, CANCELADO).",
                                isCorrect: false,
                            },
                            {
                                text: "Um atributo de alta cardinalidade e bem distribuído, como `UsuarioId`.",
                                isCorrect: true,
                            },
                            {
                                text: "Um valor fixo `TODOS`, para agrupar todos os itens na mesma chave.",
                                isCorrect: false,
                            },
                            {
                                text: "A data do dia, concentrando todas as escritas do dia na mesma chave.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que uma operação Query é mais eficiente que um Scan no DynamoDB?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A Query lê a tabela inteira e depois ordena; o Scan lê apenas uma partição.",
                                isCorrect: false,
                            },
                            {
                                text: "A Query busca os itens de uma partition key indo direto à partição; o Scan varre a tabela toda e só depois aplica o filtro, pagando capacidade por tudo que leu.",
                                isCorrect: true,
                            },
                            {
                                text: "O Scan não consome capacidade de leitura, mas é limitado a 1 item por vez.",
                                isCorrect: false,
                            },
                            {
                                text: "A Query só funciona com leitura eventualmente consistente, o que a torna gratuita.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual operação lê um único item e exige que você informe a chave primária completa (partition key e, quando existir, a sort key)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Scan",
                                isCorrect: false,
                            },
                            {
                                text: "Query",
                                isCorrect: false,
                            },
                            {
                                text: "GetItem",
                                isCorrect: true,
                            },
                            {
                                text: "PutItem",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Capacidade: RCU, WCU e a conta que a prova cobra",
                blocks: [
                    {
                        type: "text",
                        value: "# Capacidade: RCU, WCU e a conta que a prova cobra",
                    },
                    {
                        type: "quote",
                        value: "A capacidade do DynamoDB é medida em **RCU** (leitura) e **WCU** (escrita). Saber a **conta exata** (tamanho do item, tipo de consistência, transação) é uma das cobranças mais certas da DVA-C02. Some a isso a escolha entre **on-demand** (paga por requisição) e **provisioned** (você define RCU/WCU), e você fecha o assunto capacidade.",
                    },
                    {
                        type: "text",
                        value: "## 1. RCU - Read Capacity Unit\n\nUma **RCU** (unidade de capacidade de leitura) representa, **por segundo**, para um item de **até 4 KB**:\n\n- **1 leitura fortemente consistente**, **ou**\n- **2 leituras eventualmente consistentes**.\n\nUma **leitura transacional** custa **2 RCUs** por item de até 4 KB. Se o item passa de 4 KB, o DynamoDB **arredonda para cima** em blocos de 4 KB (um item de 5 KB conta como 8 KB = 2 unidades).",
                    },
                    {
                        type: "table",
                        value: '[["Tipo de leitura (item até 4 KB)","Custo por leitura/segundo"],["Fortemente consistente","**1 RCU**"],["Eventualmente consistente","**0,5 RCU** (2 leituras por RCU)"],["Transacional","**2 RCUs**"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. WCU - Write Capacity Unit\n\nUma **WCU** (unidade de capacidade de escrita) representa **1 escrita por segundo** para um item de **até 1 KB**. Uma **escrita transacional** custa **2 WCUs** por item de até 1 KB. Acima de 1 KB, o arredondamento é **para cima em blocos de 1 KB** (um item de 2,5 KB conta como 3 KB = 3 unidades).",
                    },
                    {
                        type: "table",
                        value: '[["Tipo de escrita (item até 1 KB)","Custo por escrita/segundo"],["Padrão","**1 WCU**"],["Transacional","**2 WCUs**"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. A conta de leitura, passo a passo\n\nSiga sempre a mesma ordem:\n\n1. **Unidades por leitura** = arredonda para cima (**teto**) de `tamanho_do_item / 4 KB`.\n2. **Multiplique** pelas leituras por segundo.\n3. **Ajuste a consistência**: fortemente consistente mantém o valor; **eventualmente consistente divide por 2**; **transacional multiplica por 2**.\n\nSempre arredonde o **tamanho primeiro**, depois aplique a consistência.",
                    },
                    {
                        type: "code",
                        value: "# Leitura: 100 leituras por segundo de itens de 6 KB\n\n# 1) unidades por leitura = teto(tamanho / 4 KB)\n#    teto(6 / 4) = 2 unidades\n\n# 2) multiplique pelas leituras/s e ajuste a consistencia:\n#    Fortemente consistente    : 2 x 100        = 200 RCU\n#    Eventualmente consistente : (2 / 2) x 100   = 100 RCU\n#    Transacional              : (2 x 2) x 100   = 400 RCU",
                    },
                    {
                        type: "text",
                        value: "## 4. A conta de escrita, passo a passo\n\nMesma lógica, mudando o bloco de referência para **1 KB**:\n\n1. **Unidades por escrita** = **teto** de `tamanho_do_item / 1 KB`.\n2. **Multiplique** pelas escritas por segundo.\n3. **Transacional multiplica por 2**.",
                    },
                    {
                        type: "code",
                        value: "# Escrita: 100 escritas por segundo de itens de 2,5 KB\n\n# 1) unidades por escrita = teto(tamanho / 1 KB)\n#    teto(2,5 / 1) = 3 unidades\n\n# 2) multiplique pelas escritas/s e ajuste o tipo:\n#    Escrita padrao       : 3 x 100        = 300 WCU\n#    Escrita transacional : (3 x 2) x 100   = 600 WCU",
                    },
                    {
                        type: "table",
                        value: '[["Cenário","Conta","Resultado"],["25 leituras fortes/s, itens de 4 KB","teto(4/4)=1 -> 1 x 25","**25 RCU**"],["50 leituras eventuais/s, itens de 4 KB","1 x 50 / 2","**25 RCU**"],["12 leituras fortes/s, itens de 16 KB","teto(16/4)=4 -> 4 x 12","**48 RCU**"],["100 escritas/s, itens de 1 KB","teto(1/1)=1 -> 1 x 100","**100 WCU**"],["100 escritas/s, itens de 1,5 KB","teto(1,5/1)=2 -> 2 x 100","**200 WCU**"],["10 escritas transacionais/s, itens de 1 KB","(1 x 2) x 10","**20 WCU**"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: arredonde o **tamanho primeiro** (4 KB para leitura, 1 KB para escrita), **depois** aplique a regra. **Eventual = metade**, **transacional = o dobro**. Confundir a ordem (aplicar a consistência antes de arredondar) é a pegadinha clássica.",
                    },
                    {
                        type: "text",
                        value: "## 5. On-demand vs Provisioned\n\nSão os dois **modos de capacidade** da tabela:\n\n- **On-demand (`PAY_PER_REQUEST`)**: você **não** define capacidade. Paga por **requisição** (medida em RRU/WRU), escala **instantaneamente** e nunca sofre throttle por capacidade. Ideal para tráfego **imprevisível**, cargas novas ou muito variáveis, e para quem não quer planejar.\n- **Provisioned (`PROVISIONED`)**: você **define** RCU e WCU. É **mais barato** para tráfego **previsível e constante**, mas pode **estrangular** (throttle) se a demanda passar do provisionado. Combina com **auto scaling** (ajuste automático) e **reserved capacity** (desconto por compromisso de 1 ou 3 anos).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","On-demand (PAY_PER_REQUEST)","Provisioned"],["Você define RCU/WCU?","Não","Sim"],["Cobrança","Por requisição (RRU/WRU)","Pela capacidade provisionada por hora"],["Escala","Instantânea, sem planejar","Manual ou via auto scaling (com atraso)"],["Melhor para","Tráfego **imprevisível** ou novo","Tráfego **previsível** e constante"],["Risco de throttle por capacidade","Não","Sim, se exceder o provisionado"]]',
                    },
                    {
                        type: "code",
                        value: "# On-demand: paga por requisicao, escala sozinho, sem planejar capacidade\naws dynamodb create-table \\\n  --table-name Eventos \\\n  --attribute-definitions AttributeName=Id,AttributeType=S \\\n  --key-schema AttributeName=Id,KeyType=HASH \\\n  --billing-mode PAY_PER_REQUEST\n\n# Provisioned: voce define RCU e WCU (mais barato se o trafego e previsivel)\naws dynamodb create-table \\\n  --table-name Eventos \\\n  --attribute-definitions AttributeName=Id,AttributeType=S \\\n  --key-schema AttributeName=Id,KeyType=HASH \\\n  --billing-mode PROVISIONED \\\n  --provisioned-throughput ReadCapacityUnits=25,WriteCapacityUnits=25",
                    },
                    {
                        type: "text",
                        value: "## 6. Auto scaling (no modo provisioned)\n\nCom o **Application Auto Scaling**, você define uma **capacidade mínima e máxima** e uma **utilização-alvo** (por exemplo, **70%**). O serviço então ajusta RCU/WCU sozinho para manter a tabela perto do alvo. Cuidado: o auto scaling **reage com atraso** (via alarmes de CloudWatch), então **não** é tão imediato quanto o on-demand para picos súbitos.",
                    },
                    {
                        type: "code",
                        value: '# 1) Registra a capacidade de LEITURA como alvo escalavel (min 5, max 500)\naws application-autoscaling register-scalable-target \\\n  --service-namespace dynamodb \\\n  --resource-id "table/Eventos" \\\n  --scalable-dimension "dynamodb:table:ReadCapacityUnits" \\\n  --min-capacity 5 \\\n  --max-capacity 500\n\n# 2) Mantem a utilizacao em 70% (target tracking)\naws application-autoscaling put-scaling-policy \\\n  --service-namespace dynamodb \\\n  --resource-id "table/Eventos" \\\n  --scalable-dimension "dynamodb:table:ReadCapacityUnits" \\\n  --policy-name leitura-70 \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-scaling-policy-configuration \'{ "TargetValue": 70.0, "PredefinedMetricSpecification": { "PredefinedMetricType": "DynamoDBReadCapacityUtilization" } }\'',
                    },
                    {
                        type: "text",
                        value: "## 7. Burst capacity e adaptive capacity\n\nDuas ajudas automáticas no modo provisioned:\n\n- **Burst capacity**: o DynamoDB guarda a capacidade **não usada dos últimos 5 minutos (300 segundos)** e a libera em **picos curtos**. É um alívio pontual: **não** conte com burst para carga sustentada.\n- **Adaptive capacity**: redistribui o throughput automaticamente para as **partições quentes**, suavizando desequilíbrios de acesso. Ajuda contra hot partitions, mas não substitui uma boa partition key.\n\nQuando você **estoura** a capacidade provisionada mesmo assim, o DynamoDB retorna `ProvisionedThroughputExceededException` e o SDK **re-tenta com backoff exponencial**.",
                    },
                    {
                        type: "code",
                        value: 'import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";\nconst client = new DynamoDBClient({});\n\ntry {\n  await client.send(new PutItemCommand({ TableName: "Eventos", Item: item }));\n} catch (erro) {\n  if (erro.name === "ProvisionedThroughputExceededException") {\n    // Estourou a capacidade provisionada. O SDK ja re-tenta com backoff\n    // exponencial + jitter. Se for constante, aumente WCU ou use on-demand.\n    console.error("Throttle de escrita, tentando de novo mais tarde");\n  }\n  throw erro;\n}',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **1 RCU** = 1 leitura forte (ou 2 eventuais) de item até **4 KB**; transacional = **2 RCUs**. **1 WCU** = 1 escrita de item até **1 KB**; transacional = **2 WCUs**. **On-demand** = paga por requisição, sem planejar. **Provisioned** = define RCU/WCU + auto scaling (70%). **Burst** = capacidade de 5 min de sobra.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma unidade de capacidade de leitura (1 RCU) corresponde a quê?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma leitura fortemente consistente por segundo, para um item de até 4 KB.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma leitura fortemente consistente por segundo, para um item de até 1 KB.",
                                isCorrect: false,
                            },
                            {
                                text: "Duas leituras fortemente consistentes por segundo, para um item de até 4 KB.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma escrita por segundo, para um item de até 4 KB.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sua aplicação faz 50 leituras fortemente consistentes por segundo de itens de 8 KB. Quantas RCUs são necessárias?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "50 RCUs",
                                isCorrect: false,
                            },
                            {
                                text: "100 RCUs",
                                isCorrect: true,
                            },
                            {
                                text: "200 RCUs",
                                isCorrect: false,
                            },
                            {
                                text: "25 RCUs",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As mesmas 50 leituras por segundo de itens de 8 KB, agora EVENTUALMENTE consistentes. Quantas RCUs são necessárias?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "100 RCUs",
                                isCorrect: false,
                            },
                            {
                                text: "50 RCUs",
                                isCorrect: true,
                            },
                            {
                                text: "25 RCUs",
                                isCorrect: false,
                            },
                            {
                                text: "200 RCUs",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você precisa suportar 20 escritas por segundo de itens de 3 KB cada. Quantas WCUs são necessárias?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "20 WCUs",
                                isCorrect: false,
                            },
                            {
                                text: "40 WCUs",
                                isCorrect: false,
                            },
                            {
                                text: "60 WCUs",
                                isCorrect: true,
                            },
                            {
                                text: "80 WCUs",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo novo tem tráfego imprevisível, com picos difíceis de estimar. Qual modo de capacidade evita o planejamento e escala automaticamente, cobrando por requisição?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Provisioned com auto scaling, definindo mínimo e máximo.",
                                isCorrect: false,
                            },
                            {
                                text: "On-demand (PAY_PER_REQUEST).",
                                isCorrect: true,
                            },
                            {
                                text: "Provisioned com reserved capacity de 1 ano.",
                                isCorrect: false,
                            },
                            {
                                text: "Provisioned confiando apenas na burst capacity.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Índices secundários: LSI vs GSI",
                blocks: [
                    {
                        type: "text",
                        value: "# Índices secundários: LSI vs GSI",
                    },
                    {
                        type: "quote",
                        value: "Sem índice, você só consulta pela **chave primária**. Os **índices secundários** dão novas formas de consultar a tabela por outros atributos. O **LSI** compartilha a partition key da tabela e nasce **junto com ela**; o **GSI** usa **chaves próprias**, **throughput próprio** e pode ser criado **a qualquer momento**. Distinguir os dois é cobrança garantida na DVA-C02.",
                    },
                    {
                        type: "text",
                        value: "## 1. Por que índices secundários\n\nA `Query` só funciona pela **chave primária**. Se você precisa consultar por **outro atributo** (por exemplo, listar pedidos por `Status`, ou achar um usuário por `Email` quando a partition key é `UsuarioId`), sem índice sobraria o `Scan` caro.\n\nUm **índice secundário** é uma **visão alternativa** da tabela, com uma chave diferente, mantida **automaticamente** pelo DynamoDB. Com ele, você faz `Query` eficiente pelo novo atributo.",
                    },
                    {
                        type: "text",
                        value: "## 2. Local Secondary Index (LSI)\n\nO **LSI** mantém a **mesma partition key** da tabela base, mas com uma **sort key diferente**. As regras que a prova cobra:\n\n- **Criado obrigatoriamente junto com a tabela**: não dá para adicionar (nem remover) um LSI depois que a tabela existe.\n- **Máximo de 5 LSIs** por tabela.\n- **Compartilha o throughput** (RCU/WCU) da tabela base: não tem capacidade própria.\n- **Suporta leitura fortemente consistente** (por ficar na mesma partição da tabela).\n- Limite de **10 GB** por coleção de itens (todos os itens de uma mesma partition key, somando tabela + LSIs).",
                    },
                    {
                        type: "text",
                        value: '## 3. Global Secondary Index (GSI)\n\nO **GSI** é mais flexível: a **partition key e a sort key** podem ser **totalmente diferentes** das da tabela base. As regras:\n\n- **Criado a qualquer momento**, inclusive depois que a tabela já está em produção (e também removível depois).\n- **Máximo de 20 GSIs** por tabela (limite padrão).\n- **Tem throughput próprio** (RCU/WCU separados) no modo provisionado; é como uma "tabela sombra".\n- **Só leitura eventualmente consistente** (não suporta leitura fortemente consistente).\n- É atualizado de forma **assíncrona** a partir da tabela base.',
                    },
                    {
                        type: "table",
                        value: '[["Característica","LSI (Local)","GSI (Global)"],["Partition key","**A mesma** da tabela base","**Diferente** (própria)"],["Sort key","Diferente (obrigatória)","Diferente e opcional"],["Quando pode ser criado","**Só na criação da tabela**","**A qualquer momento**"],["Throughput (provisioned)","**Compartilhado** com a tabela","**Próprio**, separado"],["Consistência de leitura","Eventual **ou forte**","**Só eventual**"],["Máximo por tabela","5","20 (padrão)"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova (mnemônico): **LSI = Local** = mesma partition key, criado **junto** com a tabela, throughput **compartilhado**, permite leitura **forte**. **GSI = Global** = chaves **novas**, criado **quando quiser**, throughput **próprio**, só leitura **eventual**.",
                    },
                    {
                        type: "text",
                        value: "## 4. Projeções (projected attributes)\n\nAo criar o índice, você escolhe quais atributos são **copiados** (projetados) para ele:\n\n- **KEYS_ONLY**: só as chaves (da tabela e do índice). O índice fica pequeno e barato.\n- **INCLUDE**: as chaves **mais** uma lista de atributos que você escolher.\n- **ALL**: **todos** os atributos do item. O índice é maior, mas a `Query` nunca precisa voltar à tabela base.\n\nSe a `Query` pedir um atributo **não projetado**, o DynamoDB faz uma busca extra na tabela base (**fetch**), o que custa mais leitura. Projete pensando no que você vai consultar.",
                    },
                    {
                        type: "table",
                        value: '[["Projeção","O que é copiado para o índice","Efeito"],["KEYS_ONLY","Só as chaves","Índice mínimo; atributos extras exigem fetch na tabela"],["INCLUDE","Chaves + atributos escolhidos","Equilíbrio entre tamanho e cobertura"],["ALL","Todos os atributos","Índice maior; nunca precisa de fetch"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Criando um LSI (junto com a tabela)\n\nComo o LSI só existe na criação, ele vai no próprio `create-table`, com a **mesma partition key** (`Cliente`) e uma **sort key diferente** (`Valor`):",
                    },
                    {
                        type: "code",
                        value: "# LSI: MESMA partition key (Cliente), sort key DIFERENTE (Valor).\n# Precisa ser criado JUNTO com a tabela.\naws dynamodb create-table \\\n  --table-name Pedidos \\\n  --attribute-definitions \\\n      AttributeName=Cliente,AttributeType=S \\\n      AttributeName=PedidoId,AttributeType=S \\\n      AttributeName=Valor,AttributeType=N \\\n  --key-schema \\\n      AttributeName=Cliente,KeyType=HASH \\\n      AttributeName=PedidoId,KeyType=RANGE \\\n  --local-secondary-indexes \\\n      'IndexName=PorValor,KeySchema=[{AttributeName=Cliente,KeyType=HASH},{AttributeName=Valor,KeyType=RANGE}],Projection={ProjectionType=ALL}' \\\n  --billing-mode PAY_PER_REQUEST",
                    },
                    {
                        type: "text",
                        value: "## 6. Criando um GSI (a qualquer momento)\n\nO GSI pode ser adicionado depois, via `update-table`, com **partition key própria** (`Status`), **sort key própria** (`CriadoEm`) e **throughput próprio** no modo provisionado:",
                    },
                    {
                        type: "code",
                        value: '# GSI: partition key PROPRIA (Status) e sort key propria (CriadoEm),\n# criado DEPOIS da tabela existir, com throughput PROPRIO no provisionado.\naws dynamodb update-table \\\n  --table-name Pedidos \\\n  --attribute-definitions \\\n      AttributeName=Status,AttributeType=S \\\n      AttributeName=CriadoEm,AttributeType=S \\\n  --global-secondary-index-updates \\\n      \'[{"Create":{"IndexName":"PorStatus","KeySchema":[{"AttributeName":"Status","KeyType":"HASH"},{"AttributeName":"CriadoEm","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":10,"WriteCapacityUnits":10}}}]\'',
                    },
                    {
                        type: "text",
                        value: "## 7. Consultando por um índice\n\nBasta apontar a `Query` para o índice com `--index-name` (CLI) ou `IndexName` (SDK). A condição de chave usa a **chave do índice**, não a da tabela:",
                    },
                    {
                        type: "code",
                        value: 'import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";\nconst client = new DynamoDBClient({});\n\n// A Query aponta para o indice via IndexName e usa a chave DO INDICE (Status)\nconst { Items } = await client.send(new QueryCommand({\n  TableName: "Pedidos",\n  IndexName: "PorStatus",\n  KeyConditionExpression: "Status = :s",\n  ExpressionAttributeValues: { ":s": { S: "PAGO" } },\n}));',
                    },
                    {
                        type: "text",
                        value: "## 8. Cuidados de throughput\n\n- **GSI tem capacidade própria**: toda escrita na tabela base que afeta atributos **projetados** também consome **WCU do GSI**. Se o GSI ficar sem capacidade (provisionado), o throttle pode **refletir na tabela base**. Provisione o GSI com folga.\n- **LSI compartilha** a capacidade da tabela: consultas e projeções do LSI **saem do mesmo bolo** de RCU/WCU da tabela.",
                    },
                    {
                        type: "text",
                        value: "## 9. Quando usar cada um\n\n- Use **LSI** quando precisar de **outra ordenação/consulta dentro da mesma partition key** e, em especial, quando precisar de **leitura fortemente consistente**. Lembre: tem que ser decidido **na criação da tabela**.\n- Use **GSI** quando o novo padrão de acesso pede uma **partition key totalmente diferente** (uma nova forma de agrupar os dados), ou quando a tabela **já existe** e você não pode recriá-la.",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **LSI** = mesma partition key, sort key diferente, criado **com a tabela**, máx **5**, throughput **compartilhado**, leitura **forte OK**. **GSI** = partition/sort key **próprias**, criado **a qualquer hora**, máx **20**, throughput **próprio**, só leitura **eventual**. Projeção: **KEYS_ONLY / INCLUDE / ALL**.",
                    },
                ],
                questions: [
                    {
                        statement: "Em que momento um Local Secondary Index (LSI) pode ser criado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A qualquer momento, depois que a tabela já existe.",
                                isCorrect: false,
                            },
                            {
                                text: "Somente no momento da criação da tabela.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas após habilitar o DynamoDB Streams.",
                                isCorrect: false,
                            },
                            {
                                text: "Somente quando a tabela usa o modo on-demand.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No modo provisionado, como funciona o throughput (RCU/WCU) de um Global Secondary Index (GSI)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É compartilhado com o throughput da tabela base.",
                                isCorrect: false,
                            },
                            {
                                text: "É próprio, separado do throughput da tabela base.",
                                isCorrect: true,
                            },
                            {
                                text: "É sempre ilimitado e gratuito.",
                                isCorrect: false,
                            },
                            {
                                text: "É herdado automaticamente do LSI da tabela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença de chaves entre um LSI e um GSI?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ambos precisam usar exatamente a mesma partition key e sort key da tabela base.",
                                isCorrect: false,
                            },
                            {
                                text: "O LSI mantém a MESMA partition key da tabela (só muda a sort key); o GSI pode ter partition key E sort key diferentes.",
                                isCorrect: true,
                            },
                            {
                                text: "O LSI pode ter uma partition key nova; o GSI é obrigado a reusar a chave da tabela.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos são obrigados a manter a mesma sort key da tabela base.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma consulta precisa de leitura FORTEMENTE consistente através de um índice secundário. Qual tipo de índice suporta isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "GSI, pois é o único que permite leitura fortemente consistente.",
                                isCorrect: false,
                            },
                            {
                                text: "LSI, pois o GSI só oferece leitura eventualmente consistente.",
                                isCorrect: true,
                            },
                            {
                                text: "Nenhum índice secundário permite leitura fortemente consistente.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos, sem qualquer diferença de consistência.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma tabela já está em produção e surgiu um novo padrão de acesso: consultar por um atributo que não faz parte da chave primária. O que você cria SEM precisar recriar a tabela?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um LSI sobre o novo atributo.",
                                isCorrect: false,
                            },
                            {
                                text: "Um GSI com esse atributo como partition key.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma nova partition key na tabela existente.",
                                isCorrect: false,
                            },
                            {
                                text: "Um DynamoDB Stream apontando para o atributo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Recursos avançados do DynamoDB",
                blocks: [
                    {
                        type: "text",
                        value: "# Recursos avançados do DynamoDB",
                    },
                    {
                        type: "quote",
                        value: "Além do CRUD, o DynamoDB traz um arsenal que a DVA-C02 adora: **Streams** (captura de mudanças para acionar Lambda), **TTL** (expiração automática), **transações** (tudo-ou-nada), **DAX** (cache em microssegundos), **Global Tables** (multi-região ativo-ativo), **PartiQL** (interface SQL) e o controle de **consistência** (eventual vs forte). Cada um responde a um cenário clássico.",
                    },
                    {
                        type: "text",
                        value: "## 1. DynamoDB Streams\n\nO **DynamoDB Streams** é um **log de alterações em nível de item** (*item-level*), **ordenado no tempo** e **retido por 24 horas**. Toda vez que um item é **criado, alterado ou removido**, um registro entra no stream. O parâmetro **StreamViewType** define **o que** cada registro carrega.",
                    },
                    {
                        type: "table",
                        value: '[["StreamViewType","O que o registro contém"],["KEYS_ONLY","Apenas os atributos de chave do item alterado"],["NEW_IMAGE","O item **inteiro** depois da alteração"],["OLD_IMAGE","O item **inteiro** antes da alteração"],["NEW_AND_OLD_IMAGES","As **duas** imagens: antes e depois"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Streams + trigger de Lambda\n\nO Streams é um **event source** (modelo **poll**, como você viu no módulo de Lambda) para funções Lambda. O Lambda faz o **polling** do stream e é invocado com **lotes** de registros. Casos de uso clássicos:\n\n- **Replicar** dados para outra tabela ou serviço.\n- **Notificar** (SNS/e-mail) quando algo muda.\n- **Atualizar agregados** (contadores, somatórios).\n- **Indexar** em um Amazon OpenSearch para busca.\n\nA permissão de leitura do stream vai na **execution role** da função (é poll-based).",
                    },
                    {
                        type: "code",
                        value: "# Habilita o Stream na tabela com imagens NOVA e ANTIGA do item\naws dynamodb update-table \\\n  --table-name Pedidos \\\n  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES\n\n# Liga o Stream a uma funcao Lambda (event source mapping, modelo poll)\naws lambda create-event-source-mapping \\\n  --function-name reage-a-pedidos \\\n  --event-source-arn arn:aws:dynamodb:us-east-1:123456789012:table/Pedidos/stream/2026-07-04T00:00:00.000 \\\n  --starting-position LATEST \\\n  --batch-size 100",
                    },
                    {
                        type: "code",
                        value: 'export const handler = async (event) => {\n  for (const record of event.Records) {\n    // eventName: INSERT, MODIFY ou REMOVE\n    if (record.eventName === "INSERT") {\n      const novo = record.dynamodb.NewImage;    // imagem nova do item\n      console.log("Novo pedido:", novo.PedidoId.S);\n    } else if (record.eventName === "REMOVE") {\n      const antigo = record.dynamodb.OldImage;  // imagem antiga do item\n      console.log("Pedido removido:", antigo.PedidoId.S);\n    }\n    // casos de uso: replicar, notificar, atualizar agregados, indexar\n  }\n};',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: sempre que a questão pedir para **reagir a alterações na tabela** (replicar, notificar, agregar), a resposta é **DynamoDB Streams + Lambda**. Fixe: retenção **24h**, **item-level**, **ordenado**, **4 view types**, e é **event source (poll)**.",
                    },
                    {
                        type: "text",
                        value: "## 3. TTL (Time to Live)\n\nO **TTL** apaga itens automaticamente. Você marca um **atributo numérico** com um **timestamp epoch** (em **segundos**); passada aquela hora, o DynamoDB remove o item. Pontos cobrados:\n\n- A remoção **não consome WCU** (é de graça).\n- **Não é instantânea**: pode levar algum tempo após a expiração (geralmente até 48h) até o item sumir de fato. Se precisar esconder itens já vencidos, filtre por conta própria na leitura.\n- O item expirado aparece no **Stream** como um evento **REMOVE**.\n- Ótimo para **sessões**, **cache**, **dados temporários** e conformidade (apagar dados antigos).",
                    },
                    {
                        type: "code",
                        value: '# Habilita o TTL usando o atributo numerico "ExpiraEm" (epoch em segundos)\naws dynamodb update-time-to-live \\\n  --table-name Sessoes \\\n  --time-to-live-specification "Enabled=true, AttributeName=ExpiraEm"\n\n# Item que expira em um instante epoch especifico (ex.: 1785000000)\naws dynamodb put-item \\\n  --table-name Sessoes \\\n  --item \'{ "SessaoId": {"S":"s-123"}, "ExpiraEm": {"N":"1785000000"} }\'',
                    },
                    {
                        type: "text",
                        value: "## 4. Transações\n\nAs operações **TransactWriteItems** e **TransactGetItems** dão **ACID** ao DynamoDB: um conjunto de até **100 itens** (ou **4 MB**) é aplicado **tudo-ou-nada** (*all-or-nothing*), podendo atravessar **várias tabelas**. Se qualquer condição falhar, **nada** é gravado.\n\nO custo é o dobro: cada item numa transação consome **2x** (2 RCUs na leitura, **2 WCUs na escrita**). Use quando a atomicidade é obrigatória, como um **débito e crédito** que precisam acontecer juntos.",
                    },
                    {
                        type: "code",
                        value: '# Transacao tudo-ou-nada: debita de uma conta e credita em outra.\n# Se QUALQUER condicao falhar, NADA e aplicado. Cada item custa 2x.\naws dynamodb transact-write-items \\\n  --transact-items \'[\n    { "Update": {\n        "TableName": "Contas",\n        "Key": { "Id": {"S":"conta-A"} },\n        "UpdateExpression": "SET Saldo = Saldo - :v",\n        "ConditionExpression": "Saldo >= :v",\n        "ExpressionAttributeValues": { ":v": {"N":"100"} }\n    }},\n    { "Update": {\n        "TableName": "Contas",\n        "Key": { "Id": {"S":"conta-B"} },\n        "UpdateExpression": "SET Saldo = Saldo + :v",\n        "ExpressionAttributeValues": { ":v": {"N":"100"} }\n    }}\n  ]\'',
                    },
                    {
                        type: "text",
                        value: "## 5. DAX (DynamoDB Accelerator)\n\nO **DAX** é um **cache em memória totalmente gerenciado e específico do DynamoDB**. Ele reduz a latência de leitura de **milissegundos para microssegundos**, sem você mudar a lógica: o cliente DAX fala a **mesma API** do DynamoDB. Características:\n\n- Ideal para cargas de **leitura intensa e repetida** (o mesmo dado pedido muitas vezes).\n- É **write-through**: escreve no DynamoDB e no cache ao mesmo tempo.\n- Roda em **cluster dentro da sua VPC**.\n- **Não** acelera escrita e serve **leitura eventualmente consistente** (não use DAX quando precisar de leitura fortemente consistente).\n\nNão confunda com o **ElastiCache**: o DAX é **embutido** na API do DynamoDB; o ElastiCache é um cache genérico que você gerencia à parte.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","DAX","ElastiCache"],["Especializado em","DynamoDB (mesma API)","Cache genérico (qualquer fonte)"],["Latência de leitura","Microssegundos","Sub-milissegundo"],["Escrita","Write-through no DynamoDB","Você controla a estratégia"],["Consistência","Só eventual","Depende do seu código"]]',
                    },
                    {
                        type: "text",
                        value: "## 6. Global Tables\n\nAs **Global Tables** replicam a tabela em **várias regiões**, no modelo **ativo-ativo (multi-master)**: você **lê e escreve em qualquer região** replicada, com baixa latência global e resiliência a desastre (**DR**). Por baixo, elas usam o **DynamoDB Streams** (é preciso habilitar o stream com **NEW_AND_OLD_IMAGES**). Conflitos entre regiões são resolvidos por **last-writer-wins** (vence a escrita mais recente).",
                    },
                    {
                        type: "code",
                        value: '# Transforma a tabela em global adicionando uma replica em outra regiao.\n# Exige o Stream habilitado (NEW_AND_OLD_IMAGES). Escrita ativo-ativo.\naws dynamodb update-table \\\n  --table-name Pedidos \\\n  --replica-updates \'[{ "Create": { "RegionName": "eu-west-1" } }]\'',
                    },
                    {
                        type: "text",
                        value: "## 7. PartiQL\n\nO **PartiQL** é uma linguagem **compatível com SQL** para o DynamoDB: você roda `SELECT`, `INSERT`, `UPDATE` e `DELETE` via `execute-statement`. É confortável para quem vem do SQL, mas **não muda o modelo**: é só uma interface. Cuidado com a pegadinha: um `SELECT` **sem a chave** na cláusula `WHERE` vira um **Scan** por baixo dos panos (caro).",
                    },
                    {
                        type: "code",
                        value: "# PartiQL: interface compativel com SQL para o DynamoDB.\n# COM a chave no WHERE -> vira Query. SEM a chave -> vira Scan (caro).\naws dynamodb execute-statement \\\n  --statement \"SELECT * FROM Pedidos WHERE Cliente = 'ana@exemplo.com'\"",
                    },
                    {
                        type: "text",
                        value: "## 8. Consistência: eventual vs forte\n\nComo o DynamoDB replica cada item em **3 AZs**, existe a escolha de consistência **na leitura**:\n\n- **Eventualmente consistente** (padrão): pode **não** refletir uma escrita bem recente (a replicação leva em geral menos de 1 segundo). Custa **metade** (0,5 RCU por leitura de item até 4 KB).\n- **Fortemente consistente** (`ConsistentRead=true`): reflete **todas** as escritas confirmadas antes da leitura. Custa **1 RCU cheio**, **não** está disponível em **GSI** e **não** passa pelo **DAX**.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Eventualmente consistente","Fortemente consistente"],["Padrão?","**Sim**","Não (ConsistentRead=true)"],["Reflete escrita recente","Pode não refletir (< 1s)","Sempre reflete"],["Custo","Metade (0,5 RCU)","1 RCU cheio"],["Disponível em GSI?","Sim","**Não**"],["Passa pelo DAX?","Sim","Não"]]',
                    },
                    {
                        type: "code",
                        value: 'import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";\nconst client = new DynamoDBClient({});\n\n// ConsistentRead: true forca leitura fortemente consistente (1 RCU cheio).\n// Reflete todas as escritas confirmadas. Nao vale para GSI nem passa pelo DAX.\nconst { Item } = await client.send(new GetItemCommand({\n  TableName: "Pedidos",\n  Key: { Cliente: { S: "ana@exemplo.com" }, PedidoId: { S: "P-1001" } },\n  ConsistentRead: true,\n}));',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **Streams** (24h, item-level, event source de Lambda), **TTL** (atributo epoch, apaga sem WCU, não instantâneo), **Transações** (all-or-nothing, até 100 itens, custo **2x**), **DAX** (cache em microssegundos, leitura), **Global Tables** (multi-região ativo-ativo, usa Streams), **PartiQL** (SQL-like), consistência **eventual** (padrão, metade) vs **forte** (1 RCU, não vale em GSI/DAX).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Por quanto tempo o DynamoDB Streams retém os registros de alteração dos itens?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "1 hora",
                                isCorrect: false,
                            },
                            {
                                text: "24 horas",
                                isCorrect: true,
                            },
                            {
                                text: "7 dias",
                                isCorrect: false,
                            },
                            {
                                text: "Indefinidamente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer que cada registro do Stream contenha tanto o estado ANTERIOR quanto o NOVO do item alterado. Qual StreamViewType usar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "KEYS_ONLY",
                                isCorrect: false,
                            },
                            {
                                text: "NEW_IMAGE",
                                isCorrect: false,
                            },
                            {
                                text: "OLD_IMAGE",
                                isCorrect: false,
                            },
                            {
                                text: "NEW_AND_OLD_IMAGES",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o TTL (Time to Live) do DynamoDB, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele apaga os itens expirados exatamente no instante definido, de forma instantânea.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele remove itens expirados automaticamente, sem consumir WCU, podendo levar algum tempo após a expiração.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele exige que você rode um Scan diário para localizar e apagar os itens vencidos.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele consome 2 WCUs por item removido, como uma escrita transacional.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma operação TransactWriteItems grava 3 itens de 1 KB cada, de forma atômica. Quantas WCUs a transação consome no total?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "3 WCUs",
                                isCorrect: false,
                            },
                            {
                                text: "6 WCUs",
                                isCorrect: true,
                            },
                            {
                                text: "1 WCU",
                                isCorrect: false,
                            },
                            {
                                text: "12 WCUs",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação de leitura intensa precisa reduzir a latência de leituras repetidas de milissegundos para microssegundos, com um cache totalmente gerenciado e nativo do DynamoDB. Qual recurso usar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon ElastiCache for Memcached",
                                isCorrect: false,
                            },
                            {
                                text: "DynamoDB Accelerator (DAX)",
                                isCorrect: true,
                            },
                            {
                                text: "DynamoDB Streams",
                                isCorrect: false,
                            },
                            {
                                text: "Global Tables",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Outros data stores no recorte de dev",
                blocks: [
                    {
                        type: "text",
                        value: "# Outros data stores no recorte de dev",
                    },
                    {
                        type: "quote",
                        value: "Nem tudo é DynamoDB. A DVA-C02 também cobra **bancos relacionais** (RDS e Aurora) e **cache** (ElastiCache). No recorte de desenvolvedor, o que importa é: como **conectar com eficiência** (pooling, RDS Proxy), **onde guardar credenciais** (Secrets Manager) e **como cachear** (lazy loading vs write-through).",
                    },
                    {
                        type: "text",
                        value: "## 1. RDS e Aurora\n\nO **Amazon RDS** é o banco **relacional gerenciado** da AWS, com os engines **MySQL, PostgreSQL, MariaDB, Oracle e SQL Server**. A AWS cuida de patch, backup e failover; você foca no schema e nas queries.\n\nO **Amazon Aurora** é o engine próprio da AWS, **compatível com MySQL e PostgreSQL**, porém mais rápido e resiliente: o **storage cresce sozinho** (até 128 TB), suporta até **15 read replicas** e faz **failover** rápido. Relacional significa **SQL, JOINs, transações ACID e schema fixo** — o oposto da flexibilidade do DynamoDB.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Amazon RDS","Amazon Aurora"],["Engines","MySQL, PostgreSQL, MariaDB, Oracle, SQL Server","Compatível com MySQL e PostgreSQL"],["Storage","Você define e amplia","Cresce automaticamente (até 128 TB)"],["Read replicas","Até 5 (varia por engine)","Até 15"],["Modo serverless","Não","Sim (Aurora Serverless v2)"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Pooling de conexões\n\nBancos relacionais têm um **limite de conexões**, e **cada conexão é cara** (memória no servidor, handshake de autenticação). Abrir e fechar uma conexão **a cada requisição** — ou, pior, a cada invocação de Lambda — **esgota** o banco rapidinho.\n\nA solução é um **pool de conexões**: um conjunto de conexões **reaproveitadas**. Em Lambda o problema é agudo, porque **milhares de execuções concorrentes** viram **milhares de conexões**. A técnica básica é criar o pool **fora do handler** (na fase Init), para reaproveitá-lo entre invocações do mesmo ambiente.",
                    },
                    {
                        type: "code",
                        value: 'import { Pool } from "pg";\n\n// === Init (fora do handler): pool criado UMA vez e reaproveitado ===\n// Anti-padrao seria abrir uma conexao nova a cada invocacao e esgotar o banco.\nconst pool = new Pool({\n  host: process.env.DB_HOST,\n  max: 5,                 // poucas conexoes por ambiente de execucao\n  idleTimeoutMillis: 30000,\n});\n\nexport const handler = async (event) => {\n  // Reaproveita uma conexao do pool a cada invocacao\n  const { rows } = await pool.query("SELECT id, nome FROM produtos WHERE id = $1", [event.id]);\n  return rows[0];\n};',
                    },
                    {
                        type: "text",
                        value: "## 3. RDS Proxy\n\nO **RDS Proxy** é um **pool de conexões gerenciado** que fica **entre** a aplicação (tipicamente Lambda) e o RDS/Aurora. Ele mantém um conjunto de conexões **compartilhado e reutilizável**, resolvendo o problema de esgotamento de conexões do serverless. De quebra:\n\n- Torna o **failover** mais rápido e transparente (a aplicação segue conectada ao proxy).\n- Integra com **IAM authentication** e com o **Secrets Manager** para as credenciais.\n- Reduz a pressão de conexões abertas/fechadas em picos de tráfego.",
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: quando a questão descrever **muitas funções Lambda esgotando as conexões** de um RDS/Aurora, a resposta é **RDS Proxy** (pool gerenciado). É o padrão para conectar serverless a banco relacional.",
                    },
                    {
                        type: "code",
                        value: '# Cria um RDS Proxy com pool de conexoes compartilhado.\n# A credencial vem do Secrets Manager; a permissao, de uma IAM role.\naws rds create-db-proxy \\\n  --db-proxy-name proxy-produtos \\\n  --engine-family POSTGRESQL \\\n  --auth \'[{ "AuthScheme": "SECRETS", "SecretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db-AbCdEf" }]\' \\\n  --role-arn arn:aws:iam::123456789012:role/rds-proxy-role \\\n  --vpc-subnet-ids subnet-0a1b2c subnet-0d3e4f',
                    },
                    {
                        type: "text",
                        value: "## 4. Credenciais via Secrets Manager\n\n**Nunca** deixe a senha do banco **em texto** no código ou numa variável de ambiente. O **AWS Secrets Manager** guarda a credencial **criptografada** (com KMS), faz **rotação automática** (integrada com o RDS) e entrega o segredo em **runtime** via SDK. A alternativa mais simples é o **SSM Parameter Store** (tipo `SecureString`), mais barato, mas **sem rotação nativa** integrada.",
                    },
                    {
                        type: "code",
                        value: 'import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";\n\n// Cliente criado no Init e reaproveitado entre invocacoes\nconst sm = new SecretsManagerClient({});\n\nasync function credenciaisDoBanco() {\n  const resp = await sm.send(new GetSecretValueCommand({ SecretId: "prod/db" }));\n  return JSON.parse(resp.SecretString); // { username, password, host, ... }\n}',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Secrets Manager","SSM Parameter Store (SecureString)"],["Rotação automática","Sim (integrada com RDS)","Não nativa"],["Criptografia","KMS","KMS"],["Custo","Por segredo + chamadas","Mais barato (padrão gratuito)"],["Uso típico","Senhas de banco, chaves de API","Configuração e parâmetros gerais"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. ElastiCache: o que é\n\nO **Amazon ElastiCache** é um **cache em memória gerenciado**. Ele fica **na frente** do banco (RDS ou DynamoDB), reduzindo latência e aliviando a carga ao servir **leituras repetidas** direto da memória. Oferece **dois engines**: **Redis** e **Memcached**.",
                    },
                    {
                        type: "text",
                        value: "## 6. Redis vs Memcached\n\nA escolha entre os dois cai na prova:\n\n- **Redis**: rico em recursos. Tem **persistência** (snapshots), **replicação e alta disponibilidade** (Multi-AZ com failover), **pub/sub**, **transações**, e **estruturas de dados** avançadas (listas, hashes, **sorted sets** para rankings, geoespacial).\n- **Memcached**: simples e enxuto. É **multi-thread**, puro **cache chave-valor**, com **sharding** horizontal fácil. **Não** tem persistência, replicação nem failover — é um cache **descartável**.",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Redis","Memcached"],["Persistência","Sim (snapshots)","Não"],["Replicação / HA (failover)","Sim (Multi-AZ)","Não"],["Estruturas de dados ricas","Sim (listas, hashes, sorted sets)","Não (só chave-valor)"],["Multi-thread","Não (thread único)","**Sim**"],["Pub/sub e transações","Sim","Não"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: precisa de **persistência, HA/replicação, pub/sub ou estruturas ricas** (ranking, sorted set) -> **Redis**. Precisa só de um **cache simples, multi-thread, horizontalmente escalável e descartável** -> **Memcached**.",
                    },
                    {
                        type: "text",
                        value: "## 7. Estratégia de cache: lazy loading (cache-aside)\n\nNo **lazy loading** (também chamado *cache-aside*), a aplicação consulta o **cache primeiro**:\n\n- **HIT**: o dado está no cache, retorna na hora.\n- **MISS**: não está; busca no **banco**, **grava no cache** e retorna.\n\nVantagem: só entra no cache o que é **realmente pedido** (não desperdiça memória). Desvantagens: o **primeiro acesso** (miss) paga a penalidade de **3 idas** (cache, banco, cache), e o dado pode ficar **desatualizado** (*stale*) se o banco mudar sem passar pelo cache. Um **TTL** ajuda a limitar quão velho o dado pode ficar.",
                    },
                    {
                        type: "code",
                        value: '// LAZY LOADING (cache-aside): so cacheia o que e pedido\nasync function getProduto(id) {\n  const cache = await redis.get("produto:" + id);\n  if (cache) return JSON.parse(cache);          // HIT: devolve do cache\n\n  const produto = await db.buscarProduto(id);   // MISS: vai ao banco\n  await redis.set("produto:" + id, JSON.stringify(produto), "EX", 300); // grava (TTL 300s)\n  return produto;\n}',
                    },
                    {
                        type: "text",
                        value: "## 8. Estratégia de cache: write-through\n\nNo **write-through**, toda **escrita** no banco **também** grava no cache, na mesma operação. Assim o cache fica **sempre atualizado** e as leituras tendem a ser sempre **HIT**. Desvantagens: cada **escrita** ganha um custo extra (*write penalty*); dados que talvez **nunca sejam lidos** acabam ocupando o cache; e um dado só existe no cache **depois** da primeira escrita. Na prática, combina-se **lazy loading + write-through + TTL**.",
                    },
                    {
                        type: "code",
                        value: '// WRITE-THROUGH: toda escrita atualiza banco E cache juntos\nasync function salvarProduto(produto) {\n  await db.salvarProduto(produto);              // escreve no banco\n  await redis.set(                              // e no cache, ja atualizado\n    "produto:" + produto.id,\n    JSON.stringify(produto),\n    "EX", 300,\n  );\n}',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Lazy loading (cache-aside)","Write-through"],["Quando popula o cache","No MISS de leitura","Em toda escrita"],["Frescor do dado","Pode ficar stale","Sempre atualizado"],["Desperdício de memória","Baixo (só o que é lido)","Alto (dados nunca lidos entram)"],["Penalidade","No primeiro acesso (miss)","Em toda escrita (write penalty)"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **RDS/Aurora** = relacional (SQL, ACID); **pooling** reaproveita conexões (pool **fora do handler** no Lambda); **RDS Proxy** = pool gerenciado (salva o serverless de esgotar conexões); **Secrets Manager** = credencial criptografada com **rotação**; ElastiCache **Redis** (HA/persistência/estruturas) vs **Memcached** (simples/multi-thread); **lazy loading** (cacheia no miss, pode ficar stale) vs **write-through** (grava no cache junto, sempre fresco).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Muitas funções Lambda concorrentes estão esgotando as conexões de um banco Amazon RDS. Qual serviço gerenciado mantém um pool de conexões compartilhado para resolver isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon ElastiCache",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon RDS Proxy",
                                isCorrect: true,
                            },
                            {
                                text: "DynamoDB Accelerator (DAX)",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Global Accelerator",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Onde é recomendado guardar a senha do banco de dados, com criptografia e rotação automática, em vez de deixá-la em texto no código ou em variável de ambiente?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Em uma variável de ambiente em texto puro.",
                                isCorrect: false,
                            },
                            {
                                text: "No AWS Secrets Manager.",
                                isCorrect: true,
                            },
                            {
                                text: "Em um comentário no código-fonte da função.",
                                isCorrect: false,
                            },
                            {
                                text: "No próprio nome da tabela do DynamoDB.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sua aplicação precisa de um cache com persistência, alta disponibilidade com replicação (Multi-AZ e failover) e estruturas de dados como sorted sets. Qual engine do ElastiCache atende?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Memcached",
                                isCorrect: false,
                            },
                            {
                                text: "Redis",
                                isCorrect: true,
                            },
                            {
                                text: "Nenhum; o ElastiCache não oferece replicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois são idênticos nesses aspectos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na estratégia de cache lazy loading (cache-aside), qual é uma característica correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Toda escrita no banco atualiza o cache imediatamente.",
                                isCorrect: false,
                            },
                            {
                                text: "O dado só é carregado no cache quando é solicitado e há um miss; por isso o cache pode ficar desatualizado (stale).",
                                isCorrect: true,
                            },
                            {
                                text: "O cache nunca fica desatualizado em relação ao banco.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dados são gravados apenas no cache, nunca no banco.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe adota write-through para manter o cache sempre atualizado. Qual é uma DESVANTAGEM dessa estratégia?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O cache fica frequentemente desatualizado em relação ao banco.",
                                isCorrect: false,
                            },
                            {
                                text: "Cada escrita tem um custo extra e dados que talvez nunca sejam lidos acabam ocupando o cache.",
                                isCorrect: true,
                            },
                            {
                                text: "As leituras sempre resultam em cache miss.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível combiná-la com um TTL de expiração.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - APIs e integração de aplicações",
        aulas: [
            {
                titulo: "API Gateway - tipos de integração",
                blocks: [
                    {
                        type: "text",
                        value: "# API Gateway - tipos de integração",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon API Gateway** é a **porta de entrada** (front door) das suas APIs: recebe a requisição do cliente, aplica autorização e throttling e a encaminha para um **backend**. O **tipo de integração** define *como* a requisição chega no backend e *como* a resposta volta. Integrações **proxy** passam tudo direto; integrações **custom/non-proxy** exigem que você **mapeie** request e response com **templates VTL**; a integração **MOCK** responde sozinha, **sem backend**.",
                    },
                    {
                        type: "text",
                        value: "## 1. O papel do API Gateway\n\nO **API Gateway** é um serviço **totalmente gerenciado** para criar, publicar e operar APIs em qualquer escala. Ele fica **na frente** dos seus backends (Lambda, contêineres, endpoints HTTP, serviços AWS) e cuida de tarefas transversais:\n\n- **Roteamento** de cada requisição para o backend certo.\n- **Autorização** (IAM, Cognito, Lambda authorizer).\n- **Throttling** e **cache** para proteger o backend.\n- **Transformação** de request e response.\n\nUma API REST é organizada em **resources** (recursos, os caminhos como `/produtos`) e **methods** (métodos HTTP como `GET` e `POST`). Cada método é ligado a uma **integração**, que é o backend que vai atender aquela chamada.",
                    },
                    {
                        type: "text",
                        value: "## 2. Os três tipos de API\n\nO API Gateway oferece **três** tipos de API, e a prova cobra quando usar cada um:\n\n- **REST API**: a mais **completa**. Tem API keys, usage plans, validação de request, cache, mapping templates (VTL), resource policies, APIs privadas e integrações custom. É a mais cara.\n- **HTTP API**: mais **nova, barata e rápida** (menor latência). Pensada para **proxy simples** para Lambda ou HTTP, com autorizadores **JWT/OIDC** e IAM. **Não** tem mapping templates VTL, API keys/usage plans nativos nem cache.\n- **WebSocket API**: conexão **bidirecional e persistente**, para chat, notificações e jogos. O servidor consegue **empurrar** mensagens para o cliente.",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","REST API","HTTP API","WebSocket API"],["Caso de uso","APIs completas e legadas","Proxy simples e barato para Lambda/HTTP","Comunicação bidirecional em tempo real"],["Mapping templates (VTL)","Sim","Não","Sim (nas rotas)"],["Autorizadores","IAM, Cognito, Lambda","IAM, JWT/OIDC, Lambda","IAM, Lambda"],["API keys / usage plans","Sim","Não (nativo)","Não"],["Cache por stage","Sim","Não","Não"],["Custo / latência","Maior","Menor (~70% mais barato)","Por mensagem e minuto de conexão"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. A anatomia de uma requisição\n\nToda chamada a um método REST passa por **quatro etapas**. Entender essas etapas é o que explica *onde* entram os mapping templates:\n\n1. **Method request**: a fronteira entre o cliente e o API Gateway (autorização, validação, parâmetros esperados).\n2. **Integration request**: onde o API Gateway **transforma** a requisição e a envia ao backend. É aqui que mora o **mapping template de request**.\n3. **Integration response**: onde o API Gateway recebe a resposta do backend e a **transforma**. É aqui que mora o **mapping template de response**.\n4. **Method response**: a resposta final devolvida ao cliente (status HTTP, headers, modelo).\n\nEm integrações **proxy**, as etapas 2 e 3 são **puladas**: nada é transformado.",
                    },
                    {
                        type: "code",
                        value: "Cliente\n  |  1. Method request       (autorizacao, validacao)\n  v\nAPI Gateway\n  |  2. Integration request  (mapping template VTL)  --> Backend\n  ^                                                       (Lambda, HTTP, AWS)\n  |  3. Integration response (mapping template VTL)  <--\n  |  4. Method response      (status, headers)\n  v\nCliente",
                    },
                    {
                        type: "text",
                        value: "## 4. Integração proxy: AWS_PROXY (Lambda proxy)\n\nNa integração **Lambda proxy** (tipo `AWS_PROXY`), o API Gateway **entrega a requisição inteira** para a função, num formato padronizado, e devolve **exatamente** o que a função retornar. **Não há mapeamento**: request e response passam **direto**.\n\nEm troca dessa simplicidade, sua função assume duas responsabilidades:\n\n- **Ler** tudo do `event` (path, query, headers, body).\n- **Retornar** um objeto no formato exato que o API Gateway espera: `statusCode`, `headers`, `body` (string) e, opcionalmente, `isBase64Encoded`.\n\nÉ o modelo **mais usado** com Lambda, porque o roteamento e o parsing ficam no código.",
                    },
                    {
                        type: "code",
                        value: '{\n  "resource": "/produtos/{id}",\n  "path": "/produtos/42",\n  "httpMethod": "GET",\n  "pathParameters": { "id": "42" },\n  "queryStringParameters": { "moeda": "BRL" },\n  "headers": { "Authorization": "Bearer ...", "Accept": "application/json" },\n  "body": null,\n  "isBase64Encoded": false,\n  "requestContext": { "requestId": "abc-123", "stage": "prod" }\n}',
                    },
                    {
                        type: "code",
                        value: 'export const handler = async (event) => {\n  // Integracao AWS_PROXY: a funcao le tudo do event e monta a resposta.\n  const id = event.pathParameters?.id;\n  const moeda = event.queryStringParameters?.moeda ?? "BRL";\n\n  return {\n    statusCode: 200,\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ id, moeda, nome: "Teclado" }),\n    isBase64Encoded: false,\n  };\n};',
                    },
                    {
                        type: "text",
                        value: "## 5. Integração proxy: HTTP_PROXY\n\nA integração **`HTTP_PROXY`** faz o mesmo para um **endpoint HTTP** qualquer (um ALB, um microserviço, uma API externa): o API Gateway repassa **método, path, query, headers e body** direto para o backend HTTP e devolve a resposta **sem transformar**. Serve para colocar o API Gateway na frente de um serviço existente com o **mínimo de configuração**.",
                    },
                    {
                        type: "code",
                        value: "aws apigateway put-integration \\\n  --rest-api-id abc123 \\\n  --resource-id def456 \\\n  --http-method GET \\\n  --type HTTP_PROXY \\\n  --integration-http-method GET \\\n  --uri https://backend.exemplo.com/produtos",
                    },
                    {
                        type: "text",
                        value: "## 6. Integrações custom / non-proxy\n\nNas integrações **custom** (também chamadas **non-proxy**), o API Gateway **não** passa tudo direto: **você** configura como a requisição é montada para o backend (**integration request**) e como a resposta é remontada para o cliente (**integration response**). É mais trabalho, mas dá **controle total** sobre o formato. Há três sabores:\n\n- **`AWS`** (Lambda custom): chama uma função Lambda, mas com **mapeamento manual** de request/response.\n- **`HTTP`**: chama um endpoint HTTP com mapeamento manual.\n- **`AWS` (AWS service)**: chama **direto** um serviço AWS (por exemplo, `SendMessage` no SQS) **sem Lambda no meio**.\n\nO mapeamento é escrito em **VTL (Velocity Template Language)**, por **content-type** (por exemplo, `application/json`).",
                    },
                    {
                        type: "code",
                        value: '## Mapping template do Integration Request (content-type application/json)\n## Transforma a query string e o corpo do cliente no JSON que o backend espera.\n{\n  "produtoId": "$input.params(\'id\')",\n  "moeda": "$input.params(\'moeda\')",\n  "origem": "$context.identity.sourceIp",\n  "corpo": $input.json(\'$\')\n}',
                    },
                    {
                        type: "text",
                        value: "## 7. VTL: as variáveis que caem na prova\n\nDentro de um mapping template você usa objetos especiais para **extrair** dados da requisição e **montar** o payload:\n\n- **`$input.json('$')`**: retorna **todo o corpo** da requisição como JSON. `$input.json('$.campo')` pega um campo específico.\n- **`$input.params('nome')`**: lê um parâmetro (de **path**, **query** ou **header**).\n- **`$input.path('$.campo')`**: navega no corpo e retorna um objeto (não string).\n- **`$context`**: dados da chamada (`$context.requestId`, `$context.identity.sourceIp`, `$context.stage`).\n- **`$util`**: utilitários: `$util.escapeJavaScript()`, `$util.parseJson()`, `$util.base64Encode()`, `$util.urlEncode()`.\n\nO **passthrough behavior** decide o que fazer quando **nenhum** template casa com o content-type: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES` ou `NEVER`.",
                    },
                    {
                        type: "code",
                        value: '## Mapping template do Integration Response\n## Remonta a resposta do backend e escapa strings para JSON valido.\n#set($corpo = $input.path(\'$\'))\n{\n  "id": "$corpo.id",\n  "nome": "$util.escapeJavaScript($corpo.nome)",\n  "preco": $corpo.preco,\n  "requestId": "$context.requestId"\n}',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Integração proxy (AWS_PROXY / HTTP_PROXY)","Integração custom / non-proxy (AWS / HTTP)"],["Mapeamento de request/response","Nenhum: passa tudo direto","Manual, via mapping templates VTL"],["Formato da resposta","A função/endpoint devolve o formato final","Você remonta no integration response"],["Esforço de configuração","Mínimo","Maior"],["Flexibilidade de transformação","Baixa (feita no código)","Alta (feita na API)"],["Uso típico","Lambda proxy; API na frente de um HTTP","Adaptar formatos; serviço AWS sem Lambda"]]',
                    },
                    {
                        type: "text",
                        value: "## 8. Integração MOCK\n\nA integração **MOCK** responde **sem chamar backend nenhum**: o próprio API Gateway devolve uma resposta a partir de um mapping template. Dois usos clássicos:\n\n- **Testes e stubs**: devolver uma resposta fixa enquanto o backend real não existe.\n- **CORS**: responder ao **preflight** `OPTIONS` que o navegador envia antes de uma requisição cross-origin. Como o `OPTIONS` só precisa devolver **headers** (`Access-Control-Allow-Origin`, `-Headers`, `-Methods`), não faz sentido acionar um backend.",
                    },
                    {
                        type: "code",
                        value: "## Integracao MOCK para o metodo OPTIONS (preflight de CORS)\n## Integration Request: seleciona o status 200 sem chamar backend.\n{ \"statusCode\": 200 }\n\n## Integration Response: devolve apenas os headers de CORS.\n##   Access-Control-Allow-Origin:  '*'\n##   Access-Control-Allow-Headers: 'Content-Type,Authorization'\n##   Access-Control-Allow-Methods: 'GET,POST,OPTIONS'",
                    },
                    {
                        type: "text",
                        value: "## 9. Integração direta com um serviço AWS\n\nCom o tipo **`AWS`** apontando para um serviço, o API Gateway chama a **API do serviço** diretamente, poupando uma função Lambda. Um padrão comum é uma API que **enfileira** a requisição no **SQS**: o mapping template converte o corpo do cliente no formato `SendMessage`. A **role** do API Gateway precisa de permissão (`sqs:SendMessage`).",
                    },
                    {
                        type: "code",
                        value: "## URI de integracao AWS service (SQS SendMessage):\narn:aws:apigateway:us-east-1:sqs:path/123456789012/minha-fila\n\n## Mapping template (application/x-www-form-urlencoded):\nAction=SendMessage&MessageBody=$util.urlEncode($input.body)",
                    },
                    {
                        type: "table",
                        value: '[["Integration type","Backend","Mapeamento","Quando usar"],["`AWS_PROXY`","Lambda","Nenhum (proxy)","Lambda proxy: função lê o event e monta a resposta"],["`AWS`","Lambda ou serviço AWS","Manual (VTL)","Transformar formato ou chamar serviço AWS sem Lambda"],["`HTTP_PROXY`","Endpoint HTTP","Nenhum (proxy)","Colocar a API na frente de um HTTP existente"],["`HTTP`","Endpoint HTTP","Manual (VTL)","Adaptar formato de um backend HTTP"],["`MOCK`","Nenhum","Só template","Testes/stubs e OPTIONS do CORS"]]',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova**: se a questão disser que a função Lambda **precisa retornar `statusCode` e `body`**, é integração **`AWS_PROXY`** (proxy, sem mapeamento). Se falar em **transformar** o payload com **VTL** ou **chamar um serviço AWS sem Lambda**, é integração **custom (`AWS`/`HTTP`)**. Se pedir para responder ao **`OPTIONS` do CORS** ou a um **stub sem backend**, é **`MOCK`**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma função Lambda por trás do API Gateway precisa retornar um objeto com `statusCode`, `headers` e `body`. Qual tipo de integração está em uso?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Integração Lambda proxy (`AWS_PROXY`).",
                                isCorrect: true,
                            },
                            {
                                text: "Integração MOCK.",
                                isCorrect: false,
                            },
                            {
                                text: "Integração `HTTP_PROXY`.",
                                isCorrect: false,
                            },
                            {
                                text: "Integração Lambda custom/non-proxy (`AWS`).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa transformar o corpo JSON enviado pelo cliente em um formato diferente antes de entregá-lo ao backend, usando um mapping template. Qual abordagem permite isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma integração custom/non-proxy com mapping template VTL.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma integração `AWS_PROXY`, que já transforma o payload sozinha.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma integração `HTTP_PROXY`.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar o cache no stage.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para responder ao preflight OPTIONS do CORS sem acionar nenhum backend, qual tipo de integração é o recomendado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "MOCK.",
                                isCorrect: true,
                            },
                            {
                                text: "`AWS_PROXY`.",
                                isCorrect: false,
                            },
                            {
                                text: "`HTTP` custom.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma integração WebSocket.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual tipo de API do API Gateway é o mais indicado para comunicação bidirecional em tempo real, em que o servidor precisa empurrar mensagens para o cliente?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "WebSocket API.",
                                isCorrect: true,
                            },
                            {
                                text: "REST API.",
                                isCorrect: false,
                            },
                            {
                                text: "HTTP API.",
                                isCorrect: false,
                            },
                            {
                                text: "API edge-optimized.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um mapping template VTL, qual expressão retorna todo o corpo da requisição do cliente como JSON?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`$input.json('$')`",
                                isCorrect: true,
                            },
                            {
                                text: "`$context.body`",
                                isCorrect: false,
                            },
                            {
                                text: "`$util.body()`",
                                isCorrect: false,
                            },
                            {
                                text: "`$stageVariables.body`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "API Gateway - autorização, stages e throttling",
                blocks: [
                    {
                        type: "text",
                        value: "# API Gateway - autorização, stages e throttling",
                    },
                    {
                        type: "quote",
                        value: "Depois de rotear a requisição, o API Gateway ainda **controla quem entra** (autorização: IAM, Lambda authorizer, Cognito), **em qual ambiente** ela cai (**stages** com **stage variables**) e **quanto tráfego** aceita (**throttling** e **usage plans**). O limite padrão de conta é **10.000 req/s** com **burst de 5.000** por região; o excedente recebe **HTTP 429 Too Many Requests**.",
                    },
                    {
                        type: "text",
                        value: "## 1. As formas de autorização\n\nO API Gateway oferece três mecanismos principais de autorização, cobrados com frequência na DVA:\n\n- **IAM (SigV4)**: o cliente assina a requisição com credenciais AWS. Ideal para chamadas **entre serviços/contas AWS** ou aplicações com credenciais IAM.\n- **Lambda authorizer** (antes chamado *custom authorizer*): uma função sua valida um **token** (Bearer/OAuth) ou parâmetros da requisição e devolve uma **policy** de `Allow`/`Deny`.\n- **Cognito user pools**: o cliente faz login no **Cognito**, recebe um **token** e o envia no header; o API Gateway valida o token contra o user pool, **sem código seu**.\n\nUm detalhe: **API keys não são autenticação** — servem para **identificar o chamador** num usage plan.",
                    },
                    {
                        type: "table",
                        value: '[["Autorizador","Como funciona","Quando usar"],["IAM (SigV4)","Requisição assinada com credenciais AWS","Chamadas entre serviços/contas AWS"],["Lambda authorizer","Sua função valida token/params e retorna policy Allow/Deny","Lógica de auth própria; OAuth/Bearer de terceiros"],["Cognito user pools","API Gateway valida o token do user pool","Login de usuários com Amazon Cognito"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Autorização IAM\n\nCom autorização **IAM**, o chamador precisa de uma policy com a ação **`execute-api:Invoke`** sobre o ARN do método, e a requisição é **assinada** (Signature V4). É o modelo usado quando outra aplicação AWS, uma conta parceira ou a CLI chamam a sua API.",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": "execute-api:Invoke",\n      "Resource": "arn:aws:execute-api:us-east-1:123456789012:abc123/prod/GET/produtos"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. Lambda authorizer\n\nO **Lambda authorizer** roda **antes** do método e decide se a chamada segue. Ele existe em duas variantes: **`TOKEN`** (lê um token de um header, como `Authorization`) e **`REQUEST`** (usa headers, query, path e stage variables). A função retorna um **principalId**, um **policy document** (`Allow`/`Deny` sobre `execute-api:Invoke`) e um objeto **`context`** opcional, repassado ao backend. O resultado é **cacheado** por um TTL para não chamar o authorizer a cada requisição.",
                    },
                    {
                        type: "code",
                        value: 'export const handler = async (event) => {\n  const token = event.authorizationToken; // authorizer do tipo TOKEN\n  const efeito = token === "Bearer permitido" ? "Allow" : "Deny";\n\n  return {\n    principalId: "user-123",\n    policyDocument: {\n      Version: "2012-10-17",\n      Statement: [{\n        Action: "execute-api:Invoke",\n        Effect: efeito,\n        Resource: event.methodArn,\n      }],\n    },\n    context: { org: "acme", tier: "gold" }, // repassado ao backend\n  };\n};',
                    },
                    {
                        type: "text",
                        value: "## 4. Cognito user pools\n\nCom o autorizador **Cognito**, o fluxo é: o usuário autentica no **user pool**, recebe um **JWT** (ID token ou access token) e o envia no header `Authorization`. O API Gateway **valida** o token (assinatura e expiração) contra o pool configurado e libera a chamada. **Você não escreve código** de autorização — é a diferença central para o Lambda authorizer.",
                    },
                    {
                        type: "text",
                        value: "## 5. Stages e stage variables\n\nPublicar uma API cria um **deployment**, que você associa a um **stage** (`dev`, `test`, `prod`). Cada stage tem sua **URL** e suas configurações (throttling, cache, logs). As **stage variables** são pares chave-valor **por stage**, como variáveis de ambiente da API. O uso mais cobrado: apontar a **URI de integração** para **aliases diferentes de uma mesma função Lambda**, servindo **dev** e **prod** com **uma função só**.",
                    },
                    {
                        type: "code",
                        value: "## URI de integracao parametrizada pela stage variable 'lambdaAlias':\narn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:api-produtos:${stageVariables.lambdaAlias}/invocations\n\n## Stage 'dev'  -> stage variable lambdaAlias = dev   -> alias 'dev' da funcao\n## Stage 'prod' -> stage variable lambdaAlias = prod  -> alias 'prod' da funcao",
                    },
                    {
                        type: "table",
                        value: '[["Ambiente","Stage","Stage variable `lambdaAlias`","Alias do Lambda"],["Desenvolvimento","`dev`","`dev`","`dev` -> versão de teste"],["Produção","`prod`","`prod`","`prod` -> versão estável"]]',
                    },
                    {
                        type: "text",
                        value: "## 6. Canary deployment\n\nUm **canary release** libera uma **nova versão** do deployment para uma **fração do tráfego** do stage, enquanto o resto continua na versão estável. Você define `percentTraffic` (por exemplo, 10%) e pode usar **`stageVariableOverrides`** para o canário apontar para outro backend. Depois de observar as métricas, você **promove** (100%) ou **descarta** o canário.",
                    },
                    {
                        type: "code",
                        value: "## Cria um deployment como canario recebendo 10% do trafego do stage 'prod'\naws apigateway create-deployment \\\n  --rest-api-id abc123 \\\n  --stage-name prod \\\n  --canary-settings '{\"percentTraffic\":10.0,\"useStageCache\":false}'\n\n## Depois de validar, promove o canario para 100%\naws apigateway update-stage \\\n  --rest-api-id abc123 \\\n  --stage-name prod \\\n  --patch-operations op=replace,path=/canarySettings/percentTraffic,value=100",
                    },
                    {
                        type: "text",
                        value: "## 7. Throttling\n\nPara proteger os backends, o API Gateway **limita a taxa** de requisições com o algoritmo **token bucket**. O limite **padrão de conta** é:\n\n- **10.000 requisições por segundo** (steady-state) por região.\n- **5.000 requisições** de **burst** (concorrentes) por região.\n\nQuando o tráfego ultrapassa esses limites, o excedente recebe **HTTP 429 Too Many Requests** (`TooManyRequestsException`). Além do nível de conta, você define limites por **stage**, por **método** e por **cliente** (usage plan). Ambos os limites de conta são **soft** (dá para aumentar via Service Quotas).",
                    },
                    {
                        type: "text",
                        value: "## 8. Ordem de avaliação dos limites\n\nQuando várias camadas de throttling existem, o API Gateway as aplica **em ordem de prioridade**, do mais específico para o mais geral:\n\n1. **Usage plan** — limite **por cliente e por método**.\n2. **Usage plan** — limite **por cliente** (a API key).\n3. **Método/stage** — limite por método definido no stage.\n4. **Conta** — o limite de **10.000 req/s** da região.\n\nA primeira camada que estourar já devolve **429**. Ou seja: o limite do **usage plan** é avaliado **antes** do de **método**, que vem antes do de **conta**.",
                    },
                    {
                        type: "table",
                        value: '[["Ordem","Camada","Escopo"],["1º","Usage plan (por cliente + método)","A API key naquele método"],["2º","Usage plan (por cliente)","A API key na API inteira"],["3º","Método / stage","Todos os chamadores daquele método"],["4º","Conta","10.000 req/s + burst 5.000 na região"]]',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova**: memorize os números — **10.000 req/s** de regime e **5.000** de burst **por região**, com **HTTP 429** no excedente. E a ordem: **usage plan -> método -> conta**. Se a questão citar '429 Too Many Requests', pense em **throttling**; se pedir limite **por cliente** com **quota**, pense em **usage plan + API key**.",
                    },
                    {
                        type: "text",
                        value: "## 9. Usage plans e API keys\n\nUma **API key** identifica **quem** está chamando; um **usage plan** define **quanto** aquele cliente pode chamar: um **throttle** (rate + burst) e uma **quota** (por dia, semana ou mês). Você associa API keys a um usage plan e o usage plan a stages. É assim que se oferece uma API para terceiros com planos 'free' e 'premium'. Lembre: a API key **não autentica** — é só um identificador para medição e limite.",
                    },
                    {
                        type: "code",
                        value: "## Cria a API key e o usage plan (throttle + quota mensal)\naws apigateway create-api-key --name cliente-premium --enabled\n\naws apigateway create-usage-plan \\\n  --name premium \\\n  --throttle burstLimit=200,rateLimit=100 \\\n  --quota limit=1000000,period=MONTH\n\n## Associa a key ao plano\naws apigateway create-usage-plan-key \\\n  --usage-plan-id plan123 \\\n  --key-id key456 \\\n  --key-type API_KEY",
                    },
                    {
                        type: "text",
                        value: "## 10. Caching por stage\n\nO **cache** é habilitado **por stage** e guarda a resposta de um método por um **TTL** (padrão **300s**, de **0 a 3600s**). Requisições repetidas com a mesma **cache key** (derivada de parâmetros do method request) são respondidas **do cache**, sem tocar o backend — menos latência e menos carga. O cliente pode forçar a atualização com o header `Cache-Control: max-age=0` (se tiver a permissão `InvalidateCache`). O cache é **cobrado por hora** conforme o tamanho escolhido.",
                    },
                    {
                        type: "code",
                        value: "## Habilita o cache no stage 'prod' com TTL de 300s e 0.5 GB\naws apigateway update-stage \\\n  --rest-api-id abc123 \\\n  --stage-name prod \\\n  --patch-operations \\\n    op=replace,path=/cacheClusterEnabled,value=true \\\n    op=replace,path=/cacheClusterSize,value=0.5 \\\n    op=replace,path=/*/*/caching/ttlInSeconds,value=300",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet**: auth = **IAM** (SigV4, entre serviços AWS), **Lambda authorizer** (sua policy Allow/Deny, com cache), **Cognito** (valida JWT do user pool, sem código). **Stage variables + aliases** = dev e prod com uma função. **Throttling** = 10.000 rps / burst 5.000 por região, **429**, ordem usage plan -> método -> conta. **Cache** por stage, TTL padrão **300s** (0-3600). **API key + usage plan** = identificar e limitar clientes.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma API usa o Amazon Cognito para autorização. Como o cliente prova sua identidade ao API Gateway?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Enviando um token (JWT) obtido no user pool no header Authorization, que o API Gateway valida contra o pool.",
                                isCorrect: true,
                            },
                            {
                                text: "Assinando a requisição com credenciais IAM (SigV4).",
                                isCorrect: false,
                            },
                            {
                                text: "Enviando uma API key no header `x-api-key`.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrevendo uma função Lambda que retorna uma policy Allow/Deny.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer servir os ambientes dev e prod com a MESMA função Lambda, roteando cada stage para um alias diferente. Qual recurso do API Gateway torna isso possível?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Stage variables usadas na URI de integração para apontar ao alias correto.",
                                isCorrect: true,
                            },
                            {
                                text: "API keys diferentes por ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Cache por stage.",
                                isCorrect: false,
                            },
                            {
                                text: "Concorrência reservada diferente em cada stage.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o limite padrão de throttling por região de uma conta no API Gateway, em regime permanente (steady-state)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "10.000 requisições por segundo.",
                                isCorrect: true,
                            },
                            {
                                text: "1.000 requisições por segundo.",
                                isCorrect: false,
                            },
                            {
                                text: "5.000 requisições por segundo.",
                                isCorrect: false,
                            },
                            {
                                text: "100.000 requisições por segundo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando o tráfego ultrapassa os limites de throttling do API Gateway, qual código HTTP é retornado ao cliente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "429 Too Many Requests.",
                                isCorrect: true,
                            },
                            {
                                text: "403 Forbidden.",
                                isCorrect: false,
                            },
                            {
                                text: "503 Service Unavailable.",
                                isCorrect: false,
                            },
                            {
                                text: "500 Internal Server Error.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma API com usage plan por cliente e limites por método e por conta, em que ordem o API Gateway avalia o throttling?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Usage plan (por cliente) -> método -> conta.",
                                isCorrect: true,
                            },
                            {
                                text: "Conta -> método -> usage plan.",
                                isCorrect: false,
                            },
                            {
                                text: "Método -> conta -> usage plan.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos ao mesmo tempo, aplicando sempre o maior limite.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "SQS - filas",
                blocks: [
                    {
                        type: "text",
                        value: "# Amazon SQS - filas",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon SQS** é uma **fila de mensagens** totalmente gerenciada que **desacopla** produtores de consumidores: o produtor envia a mensagem e segue a vida; o consumidor **puxa** (pull) a mensagem quando pode processá-la. É a peça central para tornar sistemas **resilientes** e **elásticos** — se o consumidor cai, as mensagens **esperam** na fila.",
                    },
                    {
                        type: "text",
                        value: "## 1. Como o SQS funciona\n\nO modelo é simples e **pull-based**: o **produtor** chama `SendMessage`; a mensagem fica **retida** na fila; o **consumidor** chama `ReceiveMessage` para buscar, processa e chama `DeleteMessage` para removê-la. O SQS **não empurra** nada — é o consumidor que faz o **polling**. Isso desacopla os dois lados: eles não precisam estar online ao mesmo tempo, nem escalar juntos.",
                    },
                    {
                        type: "text",
                        value: "## 2. Standard vs FIFO\n\nExistem **dois tipos** de fila, e escolher entre eles é clássico de prova:\n\n- **Standard**: throughput **quase ilimitado**, entrega **at-least-once** (uma mensagem **pode** ser entregue mais de uma vez) e ordenação **best-effort** (pode chegar **fora de ordem**).\n- **FIFO** (First-In-First-Out): **preserva a ordem** e faz **processamento exactly-once** (deduplicação). O throughput é menor: **300 msg/s** (ou **3.000** com batch de 10); o modo *high throughput* chega a dezenas de milhares. O nome da fila **termina em `.fifo`**.\n\nNa FIFO, o **`MessageGroupId`** define o grupo cujas mensagens são ordenadas, e o **`MessageDeduplicationId`** elimina duplicatas numa janela de **5 minutos**.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Standard","FIFO"],["Ordenação","Best-effort (pode desordenar)","Ordem exata dentro do MessageGroupId"],["Entrega","At-least-once (pode duplicar)","Exactly-once (deduplicação)"],["Throughput","Quase ilimitado","300 msg/s (3.000 com batch)"],["Nome da fila","Livre","Termina em `.fifo`"],["Uso típico","Máximo throughput, ordem não importa","Ordem e ausência de duplicatas são críticas"]]',
                    },
                    {
                        type: "code",
                        value: '## Produtor envia uma mensagem\naws sqs send-message \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --message-body \'{"pedidoId":42,"total":199.9}\'\n\n## Consumidor faz long polling e depois apaga a mensagem processada\naws sqs receive-message \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --wait-time-seconds 20 \\\n  --max-number-of-messages 10\n\naws sqs delete-message \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --receipt-handle "AQEB..."',
                    },
                    {
                        type: "text",
                        value: "## 3. Visibility timeout\n\nQuando um consumidor recebe uma mensagem, ela **não é apagada** — fica **invisível** para os demais consumidores durante o **visibility timeout** (padrão **30s**, de **0 a 12h**). A ideia: dar tempo para processar e chamar `DeleteMessage`. Se o consumidor **apagar a tempo**, ótimo; se **falhar ou demorar** além do timeout, a mensagem **volta a ficar visível** e **outro consumidor a reprocessa** (fonte comum de duplicatas). Precisa de mais tempo? Chame **`ChangeMessageVisibility`** para estender.",
                    },
                    {
                        type: "code",
                        value: '## Estende o visibility timeout desta mensagem para 120s (ainda processando)\naws sqs change-message-visibility \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --receipt-handle "AQEB..." \\\n  --visibility-timeout 120',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova**: visibility timeout **curto demais** faz a mensagem reaparecer **antes** de você terminar → **processamento duplicado**. Longo demais **atrasa** o reprocessamento quando o consumidor **realmente** falha. Ajuste-o ao **tempo típico de processamento** e use `ChangeMessageVisibility` para casos que demoram mais.",
                    },
                    {
                        type: "text",
                        value: "## 4. Short polling vs long polling\n\nAo chamar `ReceiveMessage`, o parâmetro **`WaitTimeSeconds`** define o tipo de polling:\n\n- **Short polling** (`WaitTimeSeconds = 0`, o padrão): responde **na hora**, amostrando um subconjunto dos servidores — pode voltar **vazio** mesmo havendo mensagens. Gera **mais chamadas** (e mais custo).\n- **Long polling** (`WaitTimeSeconds` de **1 a 20s**): o SQS **espera** até chegar mensagem (ou o tempo acabar) antes de responder. Reduz chamadas vazias, **custo** e **latência** de descoberta.\n\nA AWS **recomenda long polling** na maioria dos casos. Dá para ativá-lo por chamada (`WaitTimeSeconds`) ou por fila (`ReceiveMessageWaitTimeSeconds`).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Short polling","Long polling"],["`WaitTimeSeconds`","0","1 a 20 segundos"],["Resposta vazia","Pode ocorrer com fila cheia","Só quando o tempo esgota"],["Chamadas e custo","Mais chamadas, mais custo","Menos chamadas, menos custo"],["Recomendação","Casos raros de latência mínima","Padrão recomendado"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Dead-letter queue (DLQ) e redrive\n\nUma mensagem que **falha repetidamente** pode travar a fila. A **dead-letter queue (DLQ)** resolve isso: você configura uma **redrive policy** com um **`maxReceiveCount`**; quando uma mensagem é recebida mais vezes que esse número **sem ser apagada**, o SQS a **move para a DLQ**, uma fila separada só para o que falhou. Lá você **investiga** o problema. Regra: a DLQ de uma fila **standard** deve ser **standard**; a de uma **FIFO** deve ser **FIFO**. Depois de corrigir a causa, o **redrive** move as mensagens **de volta** da DLQ para a fila de origem.",
                    },
                    {
                        type: "code",
                        value: '## Redrive policy da fila de origem: aponta para a DLQ e define o limite\n{\n  "deadLetterTargetArn": "arn:aws:sqs:us-east-1:123456789012:pedidos-dlq",\n  "maxReceiveCount": 5\n}',
                    },
                    {
                        type: "code",
                        value: '## Aplica a redrive policy (arquivo redrive.json com o conteudo acima)\naws sqs set-queue-attributes \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --attributes RedrivePolicy="$(cat redrive.json)"\n\n## Depois de corrigir, faz o redrive de volta da DLQ para a origem\naws sqs start-message-move-task \\\n  --source-arn arn:aws:sqs:us-east-1:123456789012:pedidos-dlq',
                    },
                    {
                        type: "text",
                        value: "## 6. Retenção de mensagem\n\nA **retenção** (`MessageRetentionPeriod`) define **quanto tempo** uma mensagem fica na fila se **ninguém a apagar**: padrão **4 dias**, ajustável de **60 segundos a 14 dias**. Passado esse prazo, o SQS **descarta** a mensagem automaticamente. É a sua rede de segurança: mesmo que o consumidor fique fora do ar por um tempo, as mensagens **aguardam** dentro dessa janela.",
                    },
                    {
                        type: "text",
                        value: "## 7. Delay queues e message timers\n\nÀs vezes você quer que a mensagem **só fique disponível depois** de um tempo:\n\n- **Delay queue**: define `DelaySeconds` **na fila** (de **0 a 900s**, ou seja, até **15 min**). **Toda** mensagem nova fica invisível por esse período ao entrar.\n- **Message timer**: define `DelaySeconds` **por mensagem**, sobrepondo o padrão da fila.\n\nNão confunda com **visibility timeout**: o **delay** atrasa a mensagem **na entrada** (antes da primeira entrega); o **visibility timeout** age **depois** que ela foi recebida.",
                    },
                    {
                        type: "code",
                        value: "## Cria uma fila com atraso padrao de 60s em todas as mensagens\naws sqs create-queue \\\n  --queue-name pedidos-com-atraso \\\n  --attributes DelaySeconds=60\n\n## Ou atrasa apenas UMA mensagem em 30s (message timer)\naws sqs send-message \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --message-body '{\"pedidoId\":99}' \\\n  --delay-seconds 30",
                    },
                    {
                        type: "text",
                        value: "## 8. Batch e limites\n\nPara eficiência e economia, o SQS aceita **operações em lote** de até **10 mensagens**: `SendMessageBatch`, `DeleteMessageBatch`, `ChangeMessageVisibilityBatch`. Cada mensagem tem no máximo **256 KB**; para payloads maiores (até **2 GB**), use a **SQS Extended Client Library**, que guarda o corpo no **S3** e envia só um ponteiro na mensagem.",
                    },
                    {
                        type: "code",
                        value: '## Envia ate 10 mensagens em uma unica chamada (menos requisicoes, menos custo)\naws sqs send-message-batch \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/pedidos \\\n  --entries \'[{"Id":"1","MessageBody":"pedido-1"},{"Id":"2","MessageBody":"pedido-2"}]\'',
                    },
                    {
                        type: "table",
                        value: '[["Parâmetro","Padrão","Faixa / limite"],["Visibility timeout","30 segundos","0 a 12 horas"],["Retenção da mensagem","4 dias","60 segundos a 14 dias"],["Delay (delay queue)","0 segundo","0 a 900 segundos (15 min)"],["Long polling (`WaitTimeSeconds`)","0 (short)","0 a 20 segundos"],["Tamanho da mensagem","—","Até 256 KB (2 GB com Extended Client)"],["Mensagens por batch","—","Até 10"]]',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova**: precisa de **ordem** e **sem duplicatas**? → fila **FIFO** (300/3.000 msg/s, `MessageGroupId`, `MessageDeduplicationId`). Precisa de **throughput máximo** e a ordem não importa? → fila **standard** (at-least-once, então torne o consumidor **idempotente**). Mensagens 'presas' falhando? → **DLQ** com `maxReceiveCount`.",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet SQS**: pull-based (o consumidor faz polling). Visibility **30s** padrão (máx **12h**). Retenção **4 dias** padrão (**60s–14 dias**). Delay máx **15 min**. Long polling **1–20s** (recomendado). Mensagem **256 KB** (2 GB com Extended Client). Batch **10**. DLQ via `maxReceiveCount`.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual tipo de fila SQS garante a ordem das mensagens e o processamento exactly-once (sem duplicatas)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Fila FIFO.",
                                isCorrect: true,
                            },
                            {
                                text: "Fila standard.",
                                isCorrect: false,
                            },
                            {
                                text: "Fila com long polling ativado.",
                                isCorrect: false,
                            },
                            {
                                text: "Delay queue.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um consumidor recebe uma mensagem mas falha antes de apagá-la. O que acontece com a mensagem depois que o visibility timeout expira?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela volta a ficar visível na fila e pode ser recebida novamente.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela é apagada permanentemente da fila.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela vai direto para a DLQ, sem novas tentativas.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela é devolvida ao produtor original.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação faz muitas chamadas ReceiveMessage que voltam vazias, aumentando o custo. Qual configuração reduz as respostas vazias e o número de chamadas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Long polling, definindo `WaitTimeSeconds` entre 1 e 20.",
                                isCorrect: true,
                            },
                            {
                                text: "Short polling, com `WaitTimeSeconds` igual a 0.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o visibility timeout.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduzir a retenção da mensagem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma mensagem que falha repetidamente precisa ser isolada depois de 5 tentativas de recebimento para análise posterior. Qual recurso do SQS faz isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma dead-letter queue com redrive policy e `maxReceiveCount` = 5.",
                                isCorrect: true,
                            },
                            {
                                text: "Um delay queue de 5 segundos.",
                                isCorrect: false,
                            },
                            {
                                text: "Long polling com `WaitTimeSeconds` = 5.",
                                isCorrect: false,
                            },
                            {
                                text: "Um visibility timeout de 5 minutos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o período máximo de retenção que uma mensagem pode permanecer em uma fila SQS sem ser consumida?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "14 dias.",
                                isCorrect: true,
                            },
                            {
                                text: "4 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "12 horas.",
                                isCorrect: false,
                            },
                            {
                                text: "1 dia.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "SNS e padrões de mensageria",
                blocks: [
                    {
                        type: "text",
                        value: "# Amazon SNS e padrões de mensageria",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon SNS** é um serviço de **pub/sub** (publish/subscribe): um **publisher** envia uma mensagem para um **topic**, e o SNS a **empurra** (push) para **todos os subscribers** inscritos — filas SQS, funções Lambda, endpoints HTTP, e-mail, SMS. Enquanto o **SQS** entrega para **um** consumidor que puxa, o **SNS** faz **fan-out**: **um para muitos**, na hora.",
                    },
                    {
                        type: "text",
                        value: "## 1. Pub/Sub com SNS\n\nNo SNS existem três peças:\n\n- **Topic**: o canal de comunicação (o 'assunto').\n- **Publisher**: quem publica no topic (`Publish`).\n- **Subscriber**: quem se inscreve no topic para receber as mensagens.\n\nO SNS é **push-based**: assim que a mensagem é publicada, ele a **entrega** a cada subscription. Os tipos de subscriber incluem **SQS**, **Lambda**, **HTTP/S**, **e-mail**, **SMS**, **mobile push** e **Kinesis Data Firehose**. Um topic suporta um número enorme de subscriptions.",
                    },
                    {
                        type: "code",
                        value: '## Cria o topic e inscreve uma fila SQS\naws sns create-topic --name pedidos-criados\n\naws sns subscribe \\\n  --topic-arn arn:aws:sns:us-east-1:123456789012:pedidos-criados \\\n  --protocol sqs \\\n  --notification-endpoint arn:aws:sqs:us-east-1:123456789012:fila-faturamento\n\n## Publica uma mensagem para TODOS os inscritos de uma vez\naws sns publish \\\n  --topic-arn arn:aws:sns:us-east-1:123456789012:pedidos-criados \\\n  --message \'{"pedidoId":42,"total":199.9}\'',
                    },
                    {
                        type: "text",
                        value: "## 2. Fan-out: SNS para múltiplas SQS\n\nO padrão **fan-out** é o mais cobrado da dupla SNS+SQS: um único evento publicado no topic é entregue **ao mesmo tempo** para **várias filas SQS**, cada uma com seu próprio consumidor. Assim, um evento 'pedido criado' pode disparar **faturamento**, **estoque** e **notificação** em paralelo, cada equipe no seu ritmo. Colocar **SQS entre o SNS e o consumidor** dá **resiliência**: se um consumidor cair, as mensagens **esperam** na fila dele (com retry e DLQ próprios) sem afetar os outros.",
                    },
                    {
                        type: "code",
                        value: "                     +--> SQS: faturamento  --> consumidor A\nPublisher --> SNS ----+--> SQS: estoque      --> consumidor B\n       (1 mensagem)   +--> SQS: notificacao  --> consumidor C",
                    },
                    {
                        type: "code",
                        value: '## Access policy da fila SQS: permite o topic SNS enviar mensagens\n{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": { "Service": "sns.amazonaws.com" },\n    "Action": "sqs:SendMessage",\n    "Resource": "arn:aws:sqs:us-east-1:123456789012:fila-faturamento",\n    "Condition": {\n      "ArnEquals": { "aws:SourceArn": "arn:aws:sns:us-east-1:123456789012:pedidos-criados" }\n    }\n  }]\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. Message filtering\n\nPor padrão, **toda** subscription recebe **todas** as mensagens do topic. Com uma **filter policy**, cada subscription recebe **apenas** as mensagens que **casam** com um filtro — avaliado sobre os **message attributes** (ou, opcionalmente, sobre o **corpo** da mensagem). Assim você tem **um único topic** e cada consumidor pega **só o que lhe interessa**, sem lógica de filtragem no código.",
                    },
                    {
                        type: "code",
                        value: '## Filter policy da subscription: so recebe prioridade "alta" da regiao "BR"\n{\n  "prioridade": ["alta"],\n  "regiao": ["BR"]\n}',
                    },
                    {
                        type: "code",
                        value: '## Publica com message attributes que a filter policy avalia\naws sns publish \\\n  --topic-arn arn:aws:sns:us-east-1:123456789012:pedidos-criados \\\n  --message \'{"pedidoId":42}\' \\\n  --message-attributes \'{"prioridade":{"DataType":"String","StringValue":"alta"},"regiao":{"DataType":"String","StringValue":"BR"}}\'',
                    },
                    {
                        type: "table",
                        value: '[["Subscription","Filter policy","Recebe `prioridade=alta, regiao=BR`?"],["Fila urgentes-BR","`prioridade:[alta]`, `regiao:[BR]`","Sim"],["Fila urgentes-US","`prioridade:[alta]`, `regiao:[US]`","Não (região diferente)"],["Fila todas","sem filter policy","Sim (recebe tudo)"]]',
                    },
                    {
                        type: "text",
                        value: "## 4. FIFO topics\n\nAssim como o SQS, o SNS tem **topics FIFO**: preservam a **ordem** e fazem **deduplicação**, usando `MessageGroupId` e `MessageDeduplicationId`. Um topic FIFO só entrega para **filas SQS FIFO** (e HTTP/S), e o nome também **termina em `.fifo`**. Use-o quando a **ordem** dos eventos importa em todo o fan-out — por exemplo, atualizações de saldo que não podem chegar trocadas.",
                    },
                    {
                        type: "text",
                        value: "## 5. Durabilidade, retries e DLQ no SNS\n\nO SNS **re-tenta** a entrega conforme uma **delivery policy** (para endpoints HTTP, com backoff). Se todas as tentativas falharem, a mensagem pode ir para uma **dead-letter queue (SQS)** configurada **na subscription** (redrive policy). Assim, uma falha prolongada no subscriber **não perde** eventos — eles ficam na DLQ para reprocessamento.",
                    },
                    {
                        type: "code",
                        value: '## Redrive policy definida NA subscription (DLQ do SNS e uma fila SQS)\n{\n  "deadLetterTargetArn": "arn:aws:sqs:us-east-1:123456789012:sns-dlq"\n}',
                    },
                    {
                        type: "text",
                        value: "## 6. SQS vs SNS vs EventBridge\n\nOs três desacoplam sistemas, mas resolvem problemas diferentes:\n\n- **SQS**: **fila** (pull). Uma mensagem é consumida por **um** worker e depois apagada. Ideal para **buffer** e **processamento assíncrono** de tarefas.\n- **SNS**: **pub/sub** (push). Uma mensagem vai para **N** subscribers ao mesmo tempo (**fan-out**).\n- **EventBridge**: **event bus** com **roteamento por conteúdo** (rules com padrões), integração com **dezenas de serviços AWS e SaaS**, **schema registry** e **agendamento** (schedule). É a escolha quando o roteamento depende do **conteúdo** do evento e há **muitas fontes/destinos**.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","SQS","SNS","EventBridge"],["Modelo","Fila (pull)","Pub/sub (push)","Event bus (push, por regras)"],["Consumidores","Um worker por mensagem","Muitos (fan-out)","Muitos targets por regra"],["Roteamento","—","Filter policy (atributos)","Event pattern (conteúdo do evento)"],["Integrações","Consumidor faz polling","SQS, Lambda, HTTP, e-mail, SMS","~200 serviços AWS e SaaS"],["Uso típico","Buffer, fila de trabalho","Notificar vários sistemas de uma vez","Roteamento por conteúdo, eventos"]]',
                    },
                    {
                        type: "code",
                        value: '## Inscreve a fila SQS e ativa Raw Message Delivery\n## (entrega o corpo puro, sem o envelope JSON do SNS)\naws sns subscribe \\\n  --topic-arn arn:aws:sns:us-east-1:123456789012:pedidos-criados \\\n  --protocol sqs \\\n  --notification-endpoint arn:aws:sqs:us-east-1:123456789012:fila-faturamento \\\n  --attributes \'{"RawMessageDelivery":"true"}\'',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova**: 'notificar **vários** sistemas do mesmo evento' → **SNS fan-out**. 'Cada consumidor pega **só um subconjunto**' → **message filtering** (filter policy por atributo). 'Rotear pelo **conteúdo** do evento, com muitas fontes/destinos' → **EventBridge**. 'Enfileirar tarefas para **um** worker processar no seu ritmo' → **SQS**. E o combo **SNS → SQS** dá fan-out **com resiliência**.",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet**: **SNS** = push, pub/sub, fan-out **1→N**; **filter policy** entrega só o que casa; **FIFO topic** para ordem (entrega a SQS FIFO); **DLQ por subscription**. **SQS** = pull, **1** consumidor, buffer. **EventBridge** = roteamento por **event pattern** e integrações. Mensagem SNS/SQS: até **256 KB**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual serviço da AWS implementa o padrão pub/sub, empurrando (push) uma mensagem para vários subscribers ao mesmo tempo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Amazon SNS.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon SQS.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Kinesis Data Streams.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Lambda.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa que um único evento 'pedido criado' seja processado em paralelo por três sistemas independentes (faturamento, estoque, notificação), cada um com resiliência própria. Qual arquitetura atende melhor?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Fan-out: um topic SNS publicando para três filas SQS, uma por sistema.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma única fila SQS lida pelos três sistemas.",
                                isCorrect: false,
                            },
                            {
                                text: "Três funções Lambda invocando umas às outras em cadeia.",
                                isCorrect: false,
                            },
                            {
                                text: "Um topic SNS com um único subscriber Lambda.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um topic SNS, cada subscription deve receber apenas as mensagens que correspondem a certos atributos, sem filtrar no código do consumidor. Qual recurso faz isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Message filtering com uma filter policy na subscription.",
                                isCorrect: true,
                            },
                            {
                                text: "Raw Message Delivery.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma DLQ na subscription.",
                                isCorrect: false,
                            },
                            {
                                text: "Um topic FIFO.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação diferencia corretamente SQS de SNS?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "SQS é uma fila pull consumida por um worker; SNS é pub/sub push que entrega a vários subscribers.",
                                isCorrect: true,
                            },
                            {
                                text: "SQS entrega para vários subscribers ao mesmo tempo; SNS é uma fila pull.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos são pull-based e entregam para um único consumidor.",
                                isCorrect: false,
                            },
                            {
                                text: "SNS armazena mensagens por 14 dias; SQS não armazena mensagens.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa rotear eventos para diferentes destinos com base no CONTEÚDO do evento e integrar dezenas de serviços AWS e parceiros SaaS. Qual serviço é o mais adequado?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Amazon EventBridge.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon SQS.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon SNS com fan-out.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Step Functions.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "EventBridge, Step Functions e Kinesis",
                blocks: [
                    {
                        type: "text",
                        value: "# EventBridge, Step Functions e Kinesis",
                    },
                    {
                        type: "quote",
                        value: "Três serviços fecham a integração de aplicações na DVA: o **EventBridge** **roteia eventos** por regras para muitos destinos; o **Step Functions** **orquestra** vários passos como uma **máquina de estados**; e o **Kinesis Data Streams** **processa fluxos** de dados em **tempo real**. Saber **qual escolher** para cada cenário é o que a prova cobra.",
                    },
                    {
                        type: "text",
                        value: "## 1. Amazon EventBridge\n\nO **EventBridge** é um **event bus** serverless (evolução do CloudWatch Events). Eventos chegam a um **bus** e **rules** (regras) com **event patterns** decidem para quais **targets** encaminhá-los (Lambda, SQS, SNS, Step Functions e muitos outros). Há três tipos de bus:\n\n- **Default bus**: recebe eventos dos **serviços AWS**.\n- **Custom bus**: para os eventos da **sua** aplicação.\n- **Partner bus**: recebe eventos de **SaaS parceiros** (Datadog, Zendesk, etc.).\n\nO EventBridge ainda tem **schema registry** (descobre e versiona o formato dos eventos) e um **scheduler** para disparos por **agenda**.",
                    },
                    {
                        type: "code",
                        value: '## Event pattern: casa "PedidoCriado" com total acima de 1000\n{\n  "source": ["minha.loja"],\n  "detail-type": ["PedidoCriado"],\n  "detail": {\n    "total": [{ "numeric": [">", 1000] }]\n  }\n}',
                    },
                    {
                        type: "code",
                        value: "## Cria a regra com o event pattern e a liga a uma funcao Lambda\naws events put-rule \\\n  --name pedidos-grandes \\\n  --event-pattern file://pattern.json\n\naws events put-targets \\\n  --rule pedidos-grandes \\\n  --targets Id=1,Arn=arn:aws:lambda:us-east-1:123456789012:function:processa-pedido-grande",
                    },
                    {
                        type: "text",
                        value: "## 2. Regras por agenda (schedule)\n\nAlém de reagir a eventos, o EventBridge dispara targets **por tempo**, substituindo o velho 'cron job'. Duas formas de expressão:\n\n- **`rate(...)`**: intervalos fixos, como `rate(5 minutes)` ou `rate(1 hour)`.\n- **`cron(...)`**: agendamento estilo cron, como `cron(0 12 * * ? *)` (todo dia ao meio-dia UTC).\n\nÉ o jeito serverless de rodar uma Lambda periodicamente (limpeza, relatórios, health checks).",
                    },
                    {
                        type: "code",
                        value: "## Dispara uma Lambda a cada 5 minutos\naws events put-rule \\\n  --name coleta-metricas \\\n  --schedule-expression 'rate(5 minutes)'\n\n## Ou todo dia ao meio-dia UTC\naws events put-rule \\\n  --name relatorio-diario \\\n  --schedule-expression 'cron(0 12 * * ? *)'",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","EventBridge","SNS"],["Modelo","Event bus com regras","Pub/sub topic"],["Roteamento","Event pattern (conteúdo do evento)","Filter policy (atributos)"],["Fontes","~200 serviços AWS, SaaS, apps próprios","Publishers do seu sistema"],["Latência","Um pouco maior","Muito baixa"],["Agendamento","Sim (rate/cron)","Não"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. AWS Step Functions\n\nO **Step Functions** **orquestra** vários passos como uma **máquina de estados** (state machine): ele coordena Lambdas e serviços AWS, cuida de **retries**, **tratamento de erro**, **ramificações** e **paralelismo** — sem você escrever essa 'cola' no código. O fluxo é definido em **Amazon States Language (ASL)**, um JSON, e visualizado como um diagrama.",
                    },
                    {
                        type: "text",
                        value: "## 4. Amazon States Language e tipos de estado\n\nCada passo é um **state**. Os tipos que caem na prova:\n\n- **Task**: **faz o trabalho** — invoca uma Lambda ou chama um serviço AWS.\n- **Choice**: **ramifica** o fluxo conforme uma condição (if/else).\n- **Parallel**: executa **vários ramos ao mesmo tempo**.\n- **Map**: **itera** sobre uma lista, processando cada item (paralelismo dinâmico).\n- **Wait**, **Pass**, **Succeed**, **Fail**: espera, repassa dados, encerra com sucesso ou falha.",
                    },
                    {
                        type: "code",
                        value: '{\n  "Comment": "Aprova ou revisa um pedido conforme o valor",\n  "StartAt": "ValidaPedido",\n  "States": {\n    "ValidaPedido": {\n      "Type": "Task",\n      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:valida",\n      "Next": "PedidoGrande"\n    },\n    "PedidoGrande": {\n      "Type": "Choice",\n      "Choices": [\n        { "Variable": "$.total", "NumericGreaterThan": 1000, "Next": "RevisaoManual" }\n      ],\n      "Default": "AprovaAutomatico"\n    },\n    "RevisaoManual": { "Type": "Task", "Resource": "arn:aws:lambda:us-east-1:123456789012:function:revisa", "End": true },\n    "AprovaAutomatico": { "Type": "Task", "Resource": "arn:aws:lambda:us-east-1:123456789012:function:aprova", "End": true }\n  }\n}',
                    },
                    {
                        type: "code",
                        value: '## Um state Task com retry exponencial e captura de erro\n{\n  "Type": "Task",\n  "Resource": "arn:aws:lambda:us-east-1:123456789012:function:cobranca",\n  "Retry": [\n    { "ErrorEquals": ["States.TaskFailed"], "IntervalSeconds": 2, "MaxAttempts": 3, "BackoffRate": 2.0 }\n  ],\n  "Catch": [\n    { "ErrorEquals": ["States.ALL"], "Next": "TrataFalha" }\n  ],\n  "End": true\n}',
                    },
                    {
                        type: "table",
                        value: '[["Tipo de estado","O que faz"],["Task","Executa trabalho (Lambda ou serviço AWS)"],["Choice","Ramifica o fluxo por condição"],["Parallel","Executa vários ramos em paralelo"],["Map","Itera sobre uma lista (paralelismo dinâmico)"],["Wait / Pass","Espera um tempo / repassa dados"],["Succeed / Fail","Encerra o fluxo com sucesso ou falha"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Standard vs Express\n\nHá **dois tipos** de workflow, e a escolha cai na prova:\n\n- **Standard**: dura até **1 ano**, execução **exactly-once**, histórico completo de cada execução. Cobrado **por transição de estado**. Para workflows **longos** e **auditáveis** (aprovações, processos de negócio).\n- **Express**: dura até **5 minutos**, alto **volume**, cobrado por **número de execuções + duração + memória**. Para eventos de **alta frequência** e **curta duração** (processamento de streaming, back-ends de IoT).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Standard","Express"],["Duração máxima","1 ano","5 minutos"],["Modelo de execução","Exactly-once","At-least-once (async) / at-most-once (sync)"],["Cobrança","Por transição de estado","Por execução + duração + memória"],["Volume","Moderado","Muito alto (milhares/s)"],["Uso típico","Workflows longos e auditáveis","Alto throughput e curta duração"]]',
                    },
                    {
                        type: "text",
                        value: "## 6. Amazon Kinesis Data Streams\n\nO **Kinesis Data Streams** ingere e processa **fluxos de dados em tempo real** (cliques, logs, telemetria). A unidade de capacidade é o **shard**: cada shard suporta **1 MB/s** ou **1.000 registros/s** de **entrada**, e **2 MB/s** de **saída** (compartilhados entre os consumidores). A **partition key** de cada registro decide **em qual shard** ele cai — e a **ordem é garantida dentro do shard**. Produtores usam SDK/KPL/Kinesis Agent; consumidores usam a **KCL**, **Lambda** ou **enhanced fan-out** (2 MB/s **dedicados** por consumidor). Os dados ficam **retidos** (padrão **24h**, até **365 dias**), o que permite **reprocessar** (replay).",
                    },
                    {
                        type: "code",
                        value: '## Cria o stream e envia um registro (a partition key define o shard)\naws kinesis create-stream --stream-name cliques --shard-count 2\n\naws kinesis put-record \\\n  --stream-name cliques \\\n  --partition-key usuario-42 \\\n  --data \'{"pagina":"/checkout","ts":1720104000}\'',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Kinesis Data Streams","SQS"],["Modelo","Stream de dados (shards)","Fila de mensagens"],["Consumidores","Vários leem o MESMO dado","Um worker consome e apaga"],["Ordenação","Garantida por shard","FIFO só na fila FIFO"],["Replay (reler)","Sim (retenção 24h–365 dias)","Não (mensagem some ao apagar)"],["Escala","Você gerencia shards","Automática"],["Uso típico","Analytics em tempo real, múltiplos consumidores","Desacoplar, fila de trabalho"]]',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova**: **Kinesis** quando **vários consumidores** precisam ler o **mesmo** fluxo, há **ordenação** por shard e **replay** de dados (analytics, tempo real). **SQS** quando é uma **fila de trabalho**: a mensagem é consumida por **um** worker e **apagada**, sem replay. 'Shards', 'partition key' e 'tempo real' apontam para **Kinesis**.",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet**: **EventBridge** = event bus, **rules** com **event pattern**, **schedule** (rate/cron), ~200 integrações. **Step Functions** = state machine em **ASL**; estados **Task/Choice/Parallel/Map**; **Standard** (1 ano, exactly-once) vs **Express** (5 min, alto volume). **Kinesis** = **shards** (1 MB/s ou 1.000 rec/s in, 2 MB/s out), ordem por shard, retenção **24h–365 dias**, replay.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual serviço orquestra múltiplos passos como uma máquina de estados, cuidando de retries e tratamento de erros sem você escrever essa lógica no código?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "AWS Step Functions.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon EventBridge.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Kinesis Data Streams.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon SQS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma state machine do Step Functions, qual tipo de estado é usado para RAMIFICAR o fluxo com base em uma condição (if/else)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Choice.",
                                isCorrect: true,
                            },
                            {
                                text: "Task.",
                                isCorrect: false,
                            },
                            {
                                text: "Parallel.",
                                isCorrect: false,
                            },
                            {
                                text: "Wait.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa disparar uma função Lambda automaticamente a cada 5 minutos, sem manter um servidor de cron. Qual recurso do EventBridge faz isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma rule com schedule expression `rate(5 minutes)`.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma rule com event pattern casando a origem.",
                                isCorrect: false,
                            },
                            {
                                text: "Um custom event bus.",
                                isCorrect: false,
                            },
                            {
                                text: "Um partner event bus.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um workflow de aprovação de negócio pode levar dias até um humano responder e precisa de execução exactly-once e histórico completo. Qual tipo de workflow do Step Functions é o adequado?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Standard.",
                                isCorrect: true,
                            },
                            {
                                text: "Express síncrono.",
                                isCorrect: false,
                            },
                            {
                                text: "Express assíncrono.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: use apenas encadeamento de Lambdas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um sistema precisa que VÁRIOS consumidores independentes leiam o MESMO fluxo de eventos em tempo real, com ordenação e possibilidade de reprocessar (replay). Qual serviço atende melhor?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Amazon Kinesis Data Streams.",
                                isCorrect: true,
                            },
                            {
                                text: "Amazon SQS standard.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon SQS FIFO.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Step Functions.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Armazenamento com Amazon S3",
        aulas: [
            {
                titulo: "S3 - fundamentos",
                blocks: [
                    {
                        type: "text",
                        value: "# Amazon S3 - fundamentos",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon S3** (Simple Storage Service) é o serviço de **armazenamento de objetos** da AWS: você guarda arquivos (objetos) dentro de **buckets**, com escala praticamente **infinita**, **11 noves** de durabilidade e um nome de bucket que é **único no mundo inteiro**. Desde 2020 ele oferece **consistência forte de leitura-após-escrita**. É a espinha dorsal de quase toda arquitetura cobrada na prova DVA-C02.",
                    },
                    {
                        type: "text",
                        value: "## 1. Armazenamento de objetos\n\nO S3 guarda dados como **objetos**, não como blocos nem como arquivos de um sistema de arquivos. Um objeto é o conteúdo (os bytes) mais os metadados que o descrevem, acessado por uma **API HTTP** (`GET`, `PUT`, `DELETE`). Você não monta o S3 como um disco e não o particiona: ele é um repositório plano e elástico, ideal para arquivos estáticos, backups, data lakes, mídia e artefatos de deploy.\n\nVale contrastar os três grandes modelos de armazenamento da AWS:",
                    },
                    {
                        type: "table",
                        value: '[["Modelo","Serviço AWS","Como se acessa","Bom para"],["**Objeto**","**Amazon S3**","API HTTP, pela chave do objeto","Arquivos estáticos, backups, data lake, mídia"],["**Bloco**","**Amazon EBS**","Volume anexado a uma instância EC2","Disco de sistema, banco de dados"],["**Arquivo**","**Amazon EFS / FSx**","Montado via NFS/SMB","Sistema de arquivos compartilhado entre servidores"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Buckets e objetos\n\nUm **bucket** é o contêiner de nível mais alto: é onde os objetos vivem. Um **objeto** é o arquivo em si mais os metadados. Cada objeto tem alguns componentes que a prova gosta de cobrar:",
                    },
                    {
                        type: "table",
                        value: '[["Componente","O que é"],["**Key** (chave)","O nome único do objeto dentro do bucket (ex.: `fotos/2026/perfil.png`)"],["**Value**","O conteúdo do objeto (os bytes), de 0 byte até **5 TB**"],["**Version ID**","Identificador da versão, presente quando o versionamento está ligado"],["**Metadata**","Pares chave-valor sobre o objeto (`Content-Type`, cache, metadados do usuário)"],["**Tags**","Até 10 tags (chave-valor) usadas em controle de acesso e ciclo de vida"],["**ETag**","Hash do conteúdo, usado para verificar integridade"]]',
                    },
                    {
                        type: "text",
                        value: '## 3. A chave do objeto e as "pastas" que não existem\n\nA **chave (key)** é o **nome completo** do objeto dentro do bucket. Aqui mora uma pegadinha clássica: o S3 tem um **namespace plano**, ou seja, **não existem pastas de verdade**. Quando você vê `relatorios/2026/vendas.csv`, as barras são apenas **parte do nome** do objeto. O console mostra "pastas" simulando hierarquia a partir do **prefixo** comum das chaves, e a listagem usa prefixo e delimitador para agrupar.',
                    },
                    {
                        type: "code",
                        value: '# A "chave" é o caminho completo dentro do bucket. Não existem pastas reais:\n# o S3 é um namespace PLANO e a barra faz parte do nome do objeto.\n\ns3://meu-bucket/relatorios/2026/julho/vendas.csv\n#      ^bucket^  ^-------------- key (object key) --------------^\n\n# O prefixo \'relatorios/2026/\' serve para listar e organizar (simula "pastas").\naws s3 ls s3://meu-bucket/relatorios/2026/ --recursive',
                    },
                    {
                        type: "text",
                        value: "## 4. Namespace global e nome do bucket\n\nO nome do bucket vive em um **namespace global**: ele precisa ser **único entre todas as contas AWS do mundo**, não só na sua conta ou região. Por isso o nome também segue regras compatíveis com DNS. Se alguém, em qualquer conta, já usou o nome que você quer, você recebe `BucketAlreadyExists`.",
                    },
                    {
                        type: "table",
                        value: '[["Regra","Detalhe"],["Tamanho","3 a 63 caracteres"],["Caracteres permitidos","Apenas **letras minúsculas**, números, ponto (`.`) e hífen (`-`)"],["Início e fim","Deve começar e terminar com letra minúscula ou número"],["Proibido","Maiúsculas, sublinhado (`_`), espaços; não pode parecer um IP (ex.: `192.168.0.1`)"],["Unicidade","**Único globalmente**, em todas as contas e regiões da AWS"]]',
                    },
                    {
                        type: "code",
                        value: "# Região São Paulo: é obrigatório informar o LocationConstraint\naws s3api create-bucket \\\n  --bucket ensinadev-uploads-2026 \\\n  --region sa-east-1 \\\n  --create-bucket-configuration LocationConstraint=sa-east-1\n\n# Exceção: em us-east-1 (N. Virgínia) você NÃO passa LocationConstraint\naws s3api create-bucket --bucket ensinadev-logs --region us-east-1\n\n# Se o nome já existe em QUALQUER conta do mundo:\n# An error occurred (BucketAlreadyExists) when calling the CreateBucket operation",
                    },
                    {
                        type: "text",
                        value: "## 5. Regiões: onde os dados moram\n\nEmbora o **nome** do bucket seja global, os **dados** de um bucket ficam em **uma única região** e **não saem dela** a menos que você configure replicação. Você escolhe a região por três motivos: **latência** (perto dos usuários), **custo** (preços variam por região) e **conformidade** (leis de residência de dados). Um bucket em `sa-east-1` guarda os objetos em São Paulo; nada é copiado para outra região automaticamente.",
                    },
                    {
                        type: "text",
                        value: "## 6. Durabilidade de 11 noves e disponibilidade\n\nO S3 é projetado para **99,999999999%** de durabilidade, os famosos **11 noves**. Isso vale para **todas** as classes de armazenamento: o dado é replicado de forma redundante em vários dispositivos e instalações, e o serviço foi desenhado para sobreviver à perda simultânea de duas instalações.\n\nNão confunda **durabilidade** com **disponibilidade**:",
                    },
                    {
                        type: "table",
                        value: '[["Conceito","O que mede","S3 Standard"],["**Durabilidade**","Chance de **não perder** um objeto ao longo do tempo","**99,999999999%** (11 noves)"],["**Disponibilidade**","Chance de o objeto **estar acessível** quando você pede","**99,99%** (projetada)"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: **todas** as classes do S3 são projetadas para **11 noves de durabilidade** (99,999999999%). O que muda entre elas é a **disponibilidade**, o custo e o tempo de recuperação, **não** a durabilidade. Onze noves significa que, guardando 10 milhões de objetos, você esperaria perder **um** a cada **10 mil anos**.",
                    },
                    {
                        type: "text",
                        value: "## 7. Consistência forte de leitura-após-escrita\n\nDesde **dezembro de 2020**, o S3 oferece **consistência forte de leitura-após-escrita** (strong read-after-write consistency) para operações de **PUT** (tanto objetos novos quanto **sobrescritas**) e de **DELETE**. Na prática: assim que um `PUT` retorna sucesso, **qualquer** leitura seguinte já enxerga a versão nova. As operações de **listagem** também são fortemente consistentes.\n\nIsso é automático, **sem custo adicional** e **sem impacto de performance**. Antes de 2020, sobrescritas e exclusões eram apenas **eventualmente** consistentes, então questões antigas podem estar desatualizadas.",
                    },
                    {
                        type: "code",
                        value: '# Você grava um objeto...\naws s3api put-object --bucket meu-bucket --key config.json --body config.json\n\n# ...e QUALQUER leitura imediata já enxerga a versão recém-gravada.\naws s3api get-object --bucket meu-bucket --key config.json saida.json\n# Consistência forte: não há janela de "dado antigo" para PUTs e DELETEs.',
                    },
                    {
                        type: "quote",
                        value: 'Dica de prova: desde **dezembro de 2020** o S3 tem **consistência forte de leitura-após-escrita** para **PUT** (objetos novos e sobrescritas) e **DELETE**, sem custo nem impacto de performance. Se a questão falar em "consistência eventual para sobrescritas", ela está **desatualizada**.',
                    },
                    {
                        type: "text",
                        value: "## 8. Acessando objetos: URLs e operações\n\nPor padrão, **todo objeto é privado**: o acesso se dá por uma requisição autenticada (IAM/SDK), por uma **presigned URL** ou, se você permitir explicitamente, publicamente. O endereço de um objeto pode assumir dois formatos de URL:",
                    },
                    {
                        type: "table",
                        value: '[["Estilo de URL","Formato","Situação"],["**Virtual-hosted**","`https://meu-bucket.s3.sa-east-1.amazonaws.com/foto.png`","**Recomendado**"],["**Path-style**","`https://s3.sa-east-1.amazonaws.com/meu-bucket/foto.png`","Legado (em descontinuação)"]]',
                    },
                    {
                        type: "code",
                        value: "# Alto nível (aws s3): copia, lista e sincroniza pastas locais\naws s3 cp ./foto.png s3://meu-bucket/fotos/foto.png\naws s3 ls s3://meu-bucket/fotos/\naws s3 sync ./site s3://meu-bucket/site\n\n# Baixo nível (aws s3api): mapeia 1:1 as operações da API REST\naws s3api put-object --bucket meu-bucket --key fotos/foto.png --body foto.png",
                    },
                    {
                        type: "code",
                        value: 'import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";\n\nconst s3 = new S3Client({ region: "sa-east-1" });\n\n// Envia um objeto\nawait s3.send(new PutObjectCommand({\n  Bucket: "meu-bucket",\n  Key: "fotos/foto.png",\n  Body: conteudoDoArquivo,\n  ContentType: "image/png",\n}));\n\n// Lê o objeto de volta\nconst resposta = await s3.send(new GetObjectCommand({\n  Bucket: "meu-bucket",\n  Key: "fotos/foto.png",\n}));',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: S3 = **objetos** dentro de **buckets**; a **key** é o nome completo (namespace **plano**, sem pastas reais); o nome do bucket é **único no mundo** (3–63, minúsculas); o dado é **regional**; **11 noves** de durabilidade em todas as classes; **consistência forte** de leitura-após-escrita desde 2020; objeto de até **5 TB**.",
                    },
                ],
                questions: [
                    {
                        statement: "Como o Amazon S3 armazena os dados?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Como blocos anexados a uma instância EC2.",
                                isCorrect: false,
                            },
                            {
                                text: "Como objetos dentro de buckets.",
                                isCorrect: true,
                            },
                            {
                                text: "Como um sistema de arquivos montado via NFS.",
                                isCorrect: false,
                            },
                            {
                                text: "Como linhas e colunas em tabelas relacionais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual nível de durabilidade as classes de armazenamento do Amazon S3 são projetadas?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "99,9% (três noves).",
                                isCorrect: false,
                            },
                            {
                                text: "99,99% (quatro noves).",
                                isCorrect: false,
                            },
                            {
                                text: "99,999999999% (onze noves).",
                                isCorrect: true,
                            },
                            {
                                text: "100%, sem qualquer possibilidade de perda.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor tenta criar um bucket chamado `meu-bucket` e recebe o erro `BucketAlreadyExists`, mesmo nunca tendo criado esse bucket na conta dele. Qual é a explicação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Nomes de bucket são únicos globalmente, em todas as contas e regiões; outra conta já usou esse nome.",
                                isCorrect: true,
                            },
                            {
                                text: "Nomes de bucket precisam ter mais de 63 caracteres.",
                                isCorrect: false,
                            },
                            {
                                text: "É preciso habilitar o versionamento antes de criar qualquer bucket.",
                                isCorrect: false,
                            },
                            {
                                text: "O bucket só pode ser criado na região us-east-1.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação grava (PUT) um objeto no S3 e, logo em seguida, faz um GET da mesma chave. O que o modelo de consistência do S3 garante desde 2020?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pode retornar uma versão antiga por alguns segundos (consistência eventual).",
                                isCorrect: false,
                            },
                            {
                                text: "Retorna sempre a versão recém-gravada, pois o S3 tem consistência forte de leitura-após-escrita.",
                                isCorrect: true,
                            },
                            {
                                text: "Retorna erro 404 até a replicação interna terminar.",
                                isCorrect: false,
                            },
                            {
                                text: "Só é consistente se o versionamento estiver desabilitado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No S3, um objeto tem a chave `relatorios/2026/vendas.csv`. O que essa estrutura com barras representa?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Uma hierarquia real de pastas criadas dentro do bucket.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o nome (key) do objeto em um namespace plano; as barras fazem parte do nome e servem como prefixo para listagem.",
                                isCorrect: true,
                            },
                            {
                                text: "Três buckets aninhados um dentro do outro.",
                                isCorrect: false,
                            },
                            {
                                text: "Metadados obrigatórios que o S3 exige em toda chave.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Classes de armazenamento e ciclo de vida",
                blocks: [
                    {
                        type: "text",
                        value: "# Classes de armazenamento e ciclo de vida",
                    },
                    {
                        type: "quote",
                        value: "O S3 oferece várias **classes de armazenamento** com a mesma durabilidade de **11 noves**, mas com custo, disponibilidade e tempo de recuperação diferentes. As **regras de ciclo de vida (lifecycle)** movem os objetos para classes mais baratas ao longo do tempo e os expiram quando deixam de ser úteis. Somadas ao **versionamento**, elas controlam o custo sem intervenção manual.",
                    },
                    {
                        type: "text",
                        value: "## 1. Por que existem várias classes\n\nDados têm padrões de acesso diferentes: uns são **quentes** (acessados o tempo todo), outros **frios** (quase nunca lidos). Pagar preço de dado quente por um backup de dois anos é desperdício. Todas as classes compartilham os **11 noves de durabilidade**; o que muda é a **disponibilidade**, o **custo de armazenamento**, a **taxa de recuperação** e a **duração mínima de armazenamento**.",
                    },
                    {
                        type: "text",
                        value: "## 2. S3 Standard\n\nÉ a classe **padrão**: acesso frequente, baixa latência e alto throughput. Os dados ficam replicados em **três ou mais AZs**, com **99,99%** de disponibilidade projetada. Não há taxa de recuperação nem duração mínima. Use para dados quentes: sites, distribuição de conteúdo, análises e qualquer coisa acessada com frequência.",
                    },
                    {
                        type: "text",
                        value: "## 3. Standard-IA e One Zone-IA (acesso infrequente)\n\n**IA** quer dizer **Infrequent Access** (acesso infrequente). O armazenamento é mais barato que o Standard, mas você paga uma **taxa por GB recuperado**, há **duração mínima de 30 dias** e um **tamanho mínimo cobrado de 128 KB** por objeto.\n\n- **S3 Standard-IA**: guardado em **três ou mais AZs** (99,9% de disponibilidade). Bom para dados acessados poucas vezes, mas que precisam de resiliência.\n- **S3 One Zone-IA**: guardado em **uma única AZ** (99,5% de disponibilidade), cerca de 20% mais barato. Se aquela AZ for destruída, **o dado é perdido**. Use para dados **recriáveis** ou cópias secundárias.",
                    },
                    {
                        type: "text",
                        value: "## 4. S3 Intelligent-Tiering\n\nO **Intelligent-Tiering** move os objetos **automaticamente** entre camadas de acesso conforme o uso, cobrando uma pequena **taxa mensal de monitoramento** por objeto e **sem taxa de recuperação**. Ele é a escolha quando o padrão de acesso é **desconhecido ou muda com o tempo**: você não precisa escrever regras. Internamente ele tem camadas de acesso frequente, infrequente (após 30 dias sem acesso), arquivo instantâneo (após 90 dias) e camadas de arquivamento assíncrono opcionais.",
                    },
                    {
                        type: "text",
                        value: '## 5. As classes Glacier (arquivamento)\n\nAs classes **Glacier** são para **arquivamento**: o menor custo de armazenamento, em troca de tempo de recuperação. São três:\n\n- **Glacier Instant Retrieval**: arquivo com acesso em **milissegundos**, para dados raramente lidos mas que precisam vir na hora. Duração mínima de **90 dias**.\n- **Glacier Flexible Retrieval** (o antigo "Glacier"): recuperação de **minutos a horas**. Duração mínima de **90 dias**.\n- **Glacier Deep Archive**: o **mais barato**, recuperação em **horas**. Duração mínima de **180 dias**. Ideal para retenção longa (7 a 10 anos) e conformidade.',
                    },
                    {
                        type: "table",
                        value: '[["Classe Glacier","Tempo de recuperação","Duração mínima"],["**Glacier Instant Retrieval**","Milissegundos (instantâneo)","90 dias"],["**Glacier Flexible Retrieval**","Expedited 1–5 min · Standard 3–5 h · Bulk 5–12 h","90 dias"],["**Glacier Deep Archive**","Standard 12 h · Bulk 48 h","180 dias"]]',
                    },
                    {
                        type: "table",
                        value: '[["Classe","AZs","Disponibilidade projetada","Duração mínima","Caso de uso"],["S3 Standard","≥ 3","99,99%","—","Dados quentes, acesso frequente"],["S3 Standard-IA","≥ 3","99,9%","30 dias","Acesso infrequente, precisa de resiliência"],["S3 One Zone-IA","**1**","99,5%","30 dias","Acesso infrequente, dado recriável"],["S3 Intelligent-Tiering","≥ 3","99,9%","—","Padrão de acesso desconhecido/variável"],["Glacier Instant Retrieval","≥ 3","99,9%","90 dias","Arquivo com acesso imediato raro"],["Glacier Flexible Retrieval","≥ 3","99,99%","90 dias","Arquivo, recuperação em min/horas"],["Glacier Deep Archive","≥ 3","99,99%","180 dias","Retenção longa (7–10 anos)"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: decore as **durações mínimas de armazenamento** — **Standard-IA e One Zone-IA: 30 dias**; **Glacier Instant e Flexible: 90 dias**; **Deep Archive: 180 dias**. Apagar antes disso ainda gera cobrança pelo período mínimo. E lembre: **One Zone-IA vive em uma única AZ** (mais barata, mas perde tudo se a AZ cair).",
                    },
                    {
                        type: "text",
                        value: '## 6. Regras de ciclo de vida (lifecycle)\n\nUma **regra de lifecycle** automatiza duas ações sobre os objetos de um bucket, filtrando por **prefixo** ou **tag**:\n\n- **Transição (Transition)**: move o objeto para uma classe mais barata depois de N dias (a "cachoeira" típica: Standard → Standard-IA → Glacier → Deep Archive).\n- **Expiração (Expiration)**: **apaga** o objeto depois de N dias.\n\nA mesma regra ainda pode **abortar uploads multipart incompletos** (`AbortIncompleteMultipartUpload`), evitando pagar por partes órfãs.',
                    },
                    {
                        type: "code",
                        value: '{\n  "Rules": [\n    {\n      "ID": "arquiva-logs",\n      "Filter": { "Prefix": "logs/" },\n      "Status": "Enabled",\n      "Transitions": [\n        { "Days": 30,  "StorageClass": "STANDARD_IA" },\n        { "Days": 90,  "StorageClass": "GLACIER" },\n        { "Days": 365, "StorageClass": "DEEP_ARCHIVE" }\n      ],\n      "Expiration": { "Days": 2555 },\n      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 }\n    }\n  ]\n}',
                    },
                    {
                        type: "code",
                        value: "aws s3api put-bucket-lifecycle-configuration \\\n  --bucket meu-bucket \\\n  --lifecycle-configuration file://lifecycle.json",
                    },
                    {
                        type: "text",
                        value: '## 7. Versionamento\n\nO **versionamento** mantém **várias versões** de um objeto sob a mesma chave, protegendo contra sobrescrita e exclusão acidentais. Ele tem três estados: **unversioned** (padrão), **enabled** (ligado) e **suspended** (suspenso). Um detalhe cobrado: uma vez **ligado**, ele **não pode voltar** para unversioned, só ser **suspenso**.\n\nSobrescrever um objeto cria uma **nova versão**; um `DELETE` simples não apaga nada de verdade, apenas insere um **delete marker** (o objeto "some" da listagem, mas as versões continuam lá). Você restaura removendo o marcador; apagar um **version ID específico** é que remove aquela versão de forma permanente.',
                    },
                    {
                        type: "code",
                        value: '# Liga o versionamento no bucket\naws s3api put-bucket-versioning \\\n  --bucket meu-bucket \\\n  --versioning-configuration Status=Enabled\n\n# Consulta o estado (Enabled, Suspended ou vazio = nunca ativado)\naws s3api get-bucket-versioning --bucket meu-bucket\n\n# Um DELETE simples só cria um "delete marker"; as versões antigas continuam\naws s3api list-object-versions --bucket meu-bucket --prefix contrato.pdf',
                    },
                    {
                        type: "text",
                        value: "## 8. Como o lifecycle interage com o versionamento\n\nQuando o versionamento está ligado, o lifecycle passa a distinguir a **versão atual** das **versões não atuais** (noncurrent). Para controlar o custo dessas versões antigas você usa parâmetros específicos:\n\n- **`NoncurrentVersionTransition`**: move versões antigas para uma classe mais barata depois de N dias.\n- **`NoncurrentVersionExpiration`**: **apaga** versões antigas depois de N dias.\n- **`ExpiredObjectDeleteMarker`**: remove os **delete markers órfãos** (sem nenhuma versão por trás).\n\nSem essas regras, um bucket versionado acumula versões para sempre e a conta cresce sem parar.",
                    },
                    {
                        type: "code",
                        value: '{\n  "Rules": [\n    {\n      "ID": "limpa-versoes-antigas",\n      "Filter": {},\n      "Status": "Enabled",\n      "NoncurrentVersionTransitions": [\n        { "NoncurrentDays": 30, "StorageClass": "GLACIER" }\n      ],\n      "NoncurrentVersionExpiration": { "NoncurrentDays": 90 },\n      "Expiration": { "ExpiredObjectDeleteMarker": true }\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 9. MFA Delete\n\nO **MFA Delete** é uma camada extra de proteção. Com ele ligado, é exigido um **código MFA** para duas operações sensíveis: **apagar permanentemente uma versão** de objeto e **suspender o versionamento** do bucket. Regras que caem na prova:\n\n- Exige o **versionamento ligado**.\n- Só pode ser **habilitado ou desabilitado pela conta-raiz (root)** do bucket, via **CLI/API** (não pelo console), sempre passando o **token MFA**.",
                    },
                    {
                        type: "code",
                        value: '# Só a conta-raiz (root) do bucket habilita, sempre passando o token MFA.\n# Exige versionamento ligado.\naws s3api put-bucket-versioning \\\n  --bucket meu-bucket \\\n  --versioning-configuration Status=Enabled,MFADelete=Enabled \\\n  --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device 123456"',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **Standard** (quente) → **Standard-IA / One Zone-IA** (mín. 30 dias) → **Glacier Instant/Flexible** (90 dias) → **Deep Archive** (180 dias). O **lifecycle** faz **transição** e **expiração** automáticas, inclusive de versões **não atuais**. O **versionamento** protege contra sobrescrita/exclusão; o **MFA Delete** exige MFA para apagar versão ou suspender o versionamento, e só a **root** o habilita.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma empresa guarda miniaturas (thumbnails) que podem ser recriadas a partir das imagens originais e quer o menor custo possível, aceitando o risco de perder o dado se uma zona de disponibilidade for destruída. Qual classe é a mais indicada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "S3 Standard.",
                                isCorrect: false,
                            },
                            {
                                text: "S3 One Zone-IA.",
                                isCorrect: true,
                            },
                            {
                                text: "S3 Glacier Deep Archive.",
                                isCorrect: false,
                            },
                            {
                                text: "S3 Standard-IA.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a duração mínima de armazenamento cobrada pela classe S3 Glacier Deep Archive?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "30 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "90 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "180 dias.",
                                isCorrect: true,
                            },
                            {
                                text: "365 dias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os objetos de uma aplicação têm padrão de acesso imprevisível: alguns viram 'quentes' e depois 'frios' sem hora certa. A equipe quer economizar sem pagar taxa de recuperação e sem manter regras manuais. Qual classe atende melhor?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "S3 Standard.",
                                isCorrect: false,
                            },
                            {
                                text: "S3 Intelligent-Tiering.",
                                isCorrect: true,
                            },
                            {
                                text: "S3 Glacier Flexible Retrieval.",
                                isCorrect: false,
                            },
                            {
                                text: "S3 One Zone-IA.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um bucket com versionamento ligado acumulou muitas versões antigas (não atuais), aumentando o custo. Qual configuração de lifecycle remove automaticamente essas versões antigas depois de um período?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`Expiration` com `Days`, que atua sobre a versão atual do objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "`NoncurrentVersionExpiration` com `NoncurrentDays`.",
                                isCorrect: true,
                            },
                            {
                                text: "`AbortIncompleteMultipartUpload`.",
                                isCorrect: false,
                            },
                            {
                                text: "Desligar o versionamento do bucket.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre o MFA Delete no S3, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Qualquer usuário IAM com a permissão `s3:DeleteObject` pode habilitá-lo pelo console.",
                                isCorrect: false,
                            },
                            {
                                text: "Só a conta-raiz (root) do bucket pode habilitá-lo, via CLI/API e com token MFA, e ele exige o versionamento ligado.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele funciona mesmo sem versionamento no bucket.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele criptografa os objetos usando uma chave derivada do dispositivo MFA.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "S3 para desenvolvedores",
                blocks: [
                    {
                        type: "text",
                        value: "# S3 para desenvolvedores",
                    },
                    {
                        type: "quote",
                        value: "As **presigned URLs** deixam você conceder acesso **temporário** a um objeto **sem expor credenciais**: quem recebe a URL age com as permissões de **quem a assinou**, só para aquela operação e por um prazo. Somado a **multipart upload**, **S3 Select**, **byte-range fetches**, **Transfer Acceleration** e **notificações de evento**, esse é o kit de ferramentas que a DVA-C02 cobra do desenvolvedor.",
                    },
                    {
                        type: "text",
                        value: "## 1. Presigned URLs: acesso temporário sem expor credenciais\n\nUma **presigned URL** (URL pré-assinada) é uma URL normal do S3 com a **assinatura embutida** na query string. Quem tiver a URL pode executar **aquela operação específica** (`GET` ou `PUT`) até ela **expirar**. O ponto central: a URL **carrega as permissões de quem a gerou** (o signatário). Usos clássicos: deixar um usuário **baixar** um objeto privado por tempo limitado, ou permitir que ele **envie** um arquivo direto para o S3 sem passar pelo seu servidor.\n\nSobre o prazo: pela CLI (`aws s3 presign`) o padrão é **1 hora**; com a assinatura SigV4, o **máximo é 7 dias**.",
                    },
                    {
                        type: "code",
                        value: '// Presigned URL de DOWNLOAD (GET): acesso temporário a um objeto privado\nimport { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";\nimport { getSignedUrl } from "@aws-sdk/s3-request-presigner";\n\nconst s3 = new S3Client({ region: "sa-east-1" });\n\nconst url = await getSignedUrl(\n  s3,\n  new GetObjectCommand({ Bucket: "meu-bucket", Key: "notas/2026-01.pdf" }),\n  { expiresIn: 900 } // válido por 900 s; máximo de 7 dias (SigV4)\n);\n// Entregue \'url\' ao usuário: ele baixa direto do S3, sem ver suas credenciais.',
                    },
                    {
                        type: "text",
                        value: "## 2. Presigned URL para upload (PUT)\n\nA mesma ideia serve para **upload**: você gera uma URL assinada que permite ao cliente enviar **um objeto** direto para o S3 (do navegador para o bucket), sem credenciais e sem sobrecarregar seu backend com o tráfego do arquivo. As permissões de quem assinou precisam incluir `s3:PutObject`; você pode fixar o `Content-Type` esperado.",
                    },
                    {
                        type: "code",
                        value: '// Presigned URL de UPLOAD (PUT): o cliente envia o arquivo direto para o S3\nimport { PutObjectCommand } from "@aws-sdk/client-s3";\n\nconst urlUpload = await getSignedUrl(\n  s3,\n  new PutObjectCommand({\n    Bucket: "meu-bucket",\n    Key: "uploads/avatar.png",\n    ContentType: "image/png",\n  }),\n  { expiresIn: 300 } // 5 minutos para concluir o envio\n);\n\n// Com essa URL, o front-end faz o PUT direto no S3 (sem passar pelo seu servidor):\n//   curl -X PUT --upload-file avatar.png -H "Content-Type: image/png" "<urlUpload>"',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Presigned GET (download)","Presigned PUT (upload)"],["Operação","Baixar um objeto privado","Enviar um objeto"],["Permissão exigida de quem assina","`s3:GetObject`","`s3:PutObject`"],["Uso típico","Link temporário para arquivo privado","Upload direto do navegador para o S3"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: a presigned URL **herda as permissões de quem a assinou** e vale só para **aquela operação** até **expirar**. Pela CLI (`aws s3 presign`) o padrão é **1 hora**; o **máximo** com assinatura SigV4 é **7 dias**. É a forma correta de dar acesso temporário **sem** distribuir credenciais e **sem** tornar o objeto público.",
                    },
                    {
                        type: "text",
                        value: "## 3. Multipart upload\n\nO **multipart upload** quebra um objeto grande em **partes**, envia as partes **em paralelo** e o S3 as reassembla no final. A AWS **recomenda** multipart para objetos acima de **100 MB** e o **exige** acima de **5 GB**, já que um único `PUT` sobe no máximo **5 GB**. O fluxo é: `CreateMultipartUpload` → vários `UploadPart` → `CompleteMultipartUpload` (ou `Abort`). Ganhos: throughput, retomada e a chance de **repetir só a parte que falhou**.",
                    },
                    {
                        type: "table",
                        value: '[["Limite","Valor"],["Tamanho máximo de um objeto","**5 TB**"],["Upload em uma única operação PUT","Máximo **5 GB**"],["Recomendação para usar multipart","Objetos acima de **100 MB**"],["Tamanho de cada parte","**5 MB** a 5 GB (a última parte pode ser menor)"],["Número máximo de partes","**10.000**"]]',
                    },
                    {
                        type: "code",
                        value: '// A biblioteca @aws-sdk/lib-storage cuida do multipart automaticamente:\n// divide em partes, envia em paralelo e reassembla no S3.\nimport { Upload } from "@aws-sdk/lib-storage";\nimport { S3Client } from "@aws-sdk/client-s3";\nimport { createReadStream } from "node:fs";\n\nconst upload = new Upload({\n  client: new S3Client({ region: "sa-east-1" }),\n  params: {\n    Bucket: "meu-bucket",\n    Key: "videos/aula-completa.mp4",\n    Body: createReadStream("aula-completa.mp4"),\n  },\n  partSize: 10 * 1024 * 1024, // 10 MB por parte\n  queueSize: 4,               // 4 partes em paralelo\n});\n\nupload.on("httpUploadProgress", (p) => console.log(p.loaded, "/", p.total));\nawait upload.done();',
                    },
                    {
                        type: "text",
                        value: "## 4. S3 Select\n\nO **S3 Select** recupera **apenas um subconjunto** dos dados de um objeto usando **expressões SQL**, direto no S3, sem baixar o arquivo inteiro. Ele funciona sobre **CSV, JSON e Parquet** (inclusive comprimidos) e faz a **filtragem no servidor**, reduzindo os bytes trafegados, o tempo e o custo. É ideal para puxar poucas linhas ou colunas de um arquivo grande.",
                    },
                    {
                        type: "code",
                        value: '# Traz só as linhas que interessam de um CSV grande, sem baixar o arquivo todo\naws s3api select-object-content \\\n  --bucket meu-bucket \\\n  --key dados/vendas.csv \\\n  --expression "SELECT s.produto, s.total FROM s3object s WHERE s.regiao = \'Sudeste\'" \\\n  --expression-type SQL \\\n  --input-serialization \'{"CSV": {"FileHeaderInfo": "USE"}, "CompressionType": "NONE"}\' \\\n  --output-serialization \'{"CSV": {}}\' \\\n  resultado.csv',
                    },
                    {
                        type: "text",
                        value: "## 5. Byte-range fetches\n\nUm **byte-range fetch** baixa apenas um **intervalo de bytes** do objeto, usando o header HTTP `Range`. Isso serve para três coisas: **paralelizar** o download (buscar intervalos ao mesmo tempo), **ler só o começo** de um arquivo (por exemplo, um cabeçalho) e **repetir só o pedaço** que falhou, deixando downloads grandes mais rápidos e resilientes.",
                    },
                    {
                        type: "code",
                        value: "# Baixa só os primeiros 100 bytes (ex.: cabeçalho de um arquivo)\naws s3api get-object \\\n  --bucket meu-bucket \\\n  --key videos/aula.mp4 \\\n  --range bytes=0-99 \\\n  inicio.bin",
                    },
                    {
                        type: "code",
                        value: '// SDK: buscar um intervalo específico com o parâmetro Range\nimport { GetObjectCommand } from "@aws-sdk/client-s3";\n\nawait s3.send(new GetObjectCommand({\n  Bucket: "meu-bucket",\n  Key: "videos/aula.mp4",\n  Range: "bytes=0-1048575", // primeiro 1 MB do objeto\n}));',
                    },
                    {
                        type: "text",
                        value: "## 6. Transfer Acceleration\n\nO **Transfer Acceleration** acelera envios e downloads de longa distância roteando o tráfego pela **edge location** mais próxima da **CloudFront** e, dali, pela **rede privada da AWS** até o bucket. Você **habilita por bucket** e passa a usar o **endpoint acelerado** (`s3-accelerate.amazonaws.com`). É compatível com multipart e útil quando os usuários estão longe da região do bucket. Há um custo extra por essa aceleração.",
                    },
                    {
                        type: "code",
                        value: "# Habilita o Transfer Acceleration no bucket\naws s3api put-bucket-accelerate-configuration \\\n  --bucket meu-bucket \\\n  --accelerate-configuration Status=Enabled\n\n# Depois, use o endpoint acelerado (passa pela edge location mais próxima):\n#   https://meu-bucket.s3-accelerate.amazonaws.com/uploads/arquivo.zip\naws s3 cp arquivo.zip s3://meu-bucket/uploads/ \\\n  --endpoint-url https://s3-accelerate.amazonaws.com",
                    },
                    {
                        type: "text",
                        value: "## 7. Notificações de evento (Lambda, SQS, SNS)\n\nO S3 pode **emitir eventos** quando objetos são criados, removidos, restaurados, etc. Esses eventos disparam diretamente três destinos clássicos — **AWS Lambda**, **Amazon SQS** e **Amazon SNS** — além de **Amazon EventBridge** para cenários mais avançados. O caso mais comum: um objeto criado dispara uma **Lambda** que processa o arquivo (gera thumbnail, indexa, valida). Você filtra por **prefixo** e **sufixo**, e o S3 precisa de **permissão** para acionar o destino (lembre do Módulo 2: o S3 invoca a Lambda de forma **assíncrona**).",
                    },
                    {
                        type: "table",
                        value: '[["Destino do evento","Uso típico","Como o S3 é autorizado"],["**AWS Lambda**","Processar o objeto (thumbnail, indexação)","Resource-based policy na função"],["**Amazon SQS**","Enfileirar para processamento desacoplado","Policy da fila permitindo `s3.amazonaws.com`"],["**Amazon SNS**","Notificar vários assinantes (fan-out)","Policy do tópico permitindo `s3.amazonaws.com`"],["**Amazon EventBridge**","Regras avançadas e muitos alvos","Habilitar o EventBridge no bucket"]]',
                    },
                    {
                        type: "code",
                        value: '{\n  "LambdaFunctionConfigurations": [\n    {\n      "LambdaFunctionArn": "arn:aws:lambda:sa-east-1:123456789012:function:gera-thumbnail",\n      "Events": ["s3:ObjectCreated:*"],\n      "Filter": {\n        "Key": { "FilterRules": [{ "Name": "suffix", "Value": ".jpg" }] }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "code",
                        value: "# Aplica o arquivo de configuração de notificação acima ao bucket\naws s3api put-bucket-notification-configuration \\\n  --bucket meu-bucket \\\n  --notification-configuration file://notification.json",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **presigned URL** = acesso temporário com as permissões de quem assina (máx. **7 dias**). **Multipart** para objetos grandes (obrigatório acima de **5 GB**; objeto até **5 TB**, partes de **5 MB**, até **10.000**). **S3 Select** = SQL para trazer só um subconjunto. **Byte-range** = baixar um intervalo. **Transfer Acceleration** = sobe pela **edge** da CloudFront. **Eventos** disparam **Lambda, SQS e SNS** (e EventBridge).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um desenvolvedor precisa dar a um usuário acesso temporário para baixar um objeto privado do S3, sem tornar o objeto público e sem compartilhar credenciais da AWS. Qual recurso ele deve usar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma presigned URL (URL pré-assinada).",
                                isCorrect: true,
                            },
                            {
                                text: "Uma bucket policy que libere acesso público.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma ACL pública no objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "O Transfer Acceleration.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa enviar ao S3 um arquivo de vídeo de 20 GB de forma confiável e com bom desempenho. Qual é a abordagem correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um único PUT com `put-object`.",
                                isCorrect: false,
                            },
                            {
                                text: "Multipart upload, dividindo o arquivo em partes.",
                                isCorrect: true,
                            },
                            {
                                text: "S3 Select para fatiar o arquivo.",
                                isCorrect: false,
                            },
                            {
                                text: "Um byte-range fetch.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa extrair apenas algumas colunas e linhas de arquivos CSV grandes no S3, sem baixar o arquivo inteiro, usando expressões SQL. Qual recurso faz isso do lado do servidor?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "S3 Select.",
                                isCorrect: true,
                            },
                            {
                                text: "Transfer Acceleration.",
                                isCorrect: false,
                            },
                            {
                                text: "Multipart upload.",
                                isCorrect: false,
                            },
                            {
                                text: "Presigned URL.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao gerar uma presigned URL para upload, o que limita o que essa URL pode fazer?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "As permissões da identidade que assinou a URL; ela não pode fazer mais do que quem a gerou.",
                                isCorrect: true,
                            },
                            {
                                text: "Nada: a URL concede acesso total ao bucket.",
                                isCorrect: false,
                            },
                            {
                                text: "As permissões do usuário anônimo do S3.",
                                isCorrect: false,
                            },
                            {
                                text: "As permissões definidas na ACL do objeto no momento do upload.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As notificações de evento do S3 podem disparar diretamente quais destinos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon EC2, Amazon RDS e Amazon EBS.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Lambda, Amazon SQS e Amazon SNS.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas AWS Lambda.",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon DynamoDB e Amazon Redshift.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Segurança e criptografia no S3",
                blocks: [
                    {
                        type: "text",
                        value: "# Segurança e criptografia no S3",
                    },
                    {
                        type: "quote",
                        value: "A segurança do S3 tem duas frentes: **quem pode acessar** (IAM, **bucket policies**, **Block Public Access**) e **como o dado é protegido em repouso** (**criptografia**). Na prova, o coração é escolher a opção de criptografia certa — **SSE-S3**, **SSE-KMS**, **SSE-C** ou **client-side** — e saber quando usar **bucket policy** em vez de **ACL**.",
                    },
                    {
                        type: "text",
                        value: "## 1. As camadas de segurança do S3\n\nO acesso ao S3 é controlado em camadas que se somam:\n\n- **Políticas de identidade (IAM)**: o que cada usuário/role pode fazer.\n- **Bucket policies**: política baseada em recurso, no nível do bucket, com condições e acesso cross-account.\n- **ACLs**: mecanismo **legado** de concessões por objeto/bucket (hoje a AWS recomenda desabilitar).\n- **Block Public Access**: uma trava contra exposição pública acidental.\n- **Criptografia em trânsito** (HTTPS/TLS) e **em repouso** (SSE ou client-side).\n\nPor padrão, **todo objeto é privado**, e desde 2023 objetos novos já são criptografados com **SSE-S3** automaticamente.",
                    },
                    {
                        type: "text",
                        value: "## 2. Criptografia server-side: SSE-S3\n\nNo **SSE-S3** (Server-Side Encryption com chaves gerenciadas pelo S3), o **próprio S3** gera e gerencia as chaves e cifra o objeto com **AES-256**. Você não administra nada: é a opção mais simples e é a **criptografia padrão** aplicada a objetos novos. O header que a identifica é `x-amz-server-side-encryption: AES256`. A limitação: você **não tem trilha de auditoria** por chave nem controle sobre ela.",
                    },
                    {
                        type: "code",
                        value: "# SSE-S3: chaves gerenciadas pelo próprio S3 (AES-256).\n# É a criptografia padrão aplicada automaticamente a objetos novos.\naws s3api put-object \\\n  --bucket meu-bucket \\\n  --key contrato.pdf \\\n  --body contrato.pdf \\\n  --server-side-encryption AES256\n# Header enviado: x-amz-server-side-encryption: AES256",
                    },
                    {
                        type: "text",
                        value: "## 3. SSE-KMS\n\nNo **SSE-KMS** as chaves ficam no **AWS KMS**. Você ganha **controle** sobre a chave (uma chave gerenciada pela AWS `aws/s3` ou uma **chave gerenciada pelo cliente / CMK**), define política de acesso e rotação e, o mais importante para a prova, obtém uma **trilha de auditoria** no **CloudTrail** de cada uso da chave. O header é `x-amz-server-side-encryption: aws:kms`.\n\nO trade-off: cada operação chama o KMS (`GenerateDataKey`, `Decrypt`), o que consome a **cota de requisições do KMS** e pode causar throttling em alto volume. Para reduzir chamadas e custo, habilite os **S3 Bucket Keys**.",
                    },
                    {
                        type: "code",
                        value: "# SSE-KMS: chave no AWS KMS, com trilha de auditoria no CloudTrail\naws s3api put-object \\\n  --bucket meu-bucket \\\n  --key contrato.pdf \\\n  --body contrato.pdf \\\n  --server-side-encryption aws:kms \\\n  --ssekms-key-id arn:aws:kms:sa-east-1:123456789012:key/abcd-1234",
                    },
                    {
                        type: "code",
                        value: '{\n  "Rules": [\n    {\n      "ApplyServerSideEncryptionByDefault": {\n        "SSEAlgorithm": "aws:kms",\n        "KMSMasterKeyID": "arn:aws:kms:sa-east-1:123456789012:key/abcd-1234"\n      },\n      "BucketKeyEnabled": true\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 4. SSE-C\n\nNo **SSE-C** (Server-Side Encryption com chave fornecida pelo cliente), **você fornece a chave** em cada requisição. O S3 usa essa chave para cifrar e decifrar o objeto, mas **não armazena a chave** em lugar nenhum: terminada a operação, ele a descarta. Como a chave viaja no header, o **HTTPS é obrigatório**. Para **ler** o objeto depois, você precisa reenviar exatamente a **mesma chave**. Use quando o requisito é você **manter a posse das chaves** por conta própria.",
                    },
                    {
                        type: "code",
                        value: "# SSE-C: VOCÊ fornece a chave a cada requisição; o S3 usa mas NÃO a guarda.\n# HTTPS é obrigatório (a chave viaja no header).\naws s3api put-object \\\n  --bucket meu-bucket \\\n  --key contrato.pdf \\\n  --body contrato.pdf \\\n  --sse-customer-algorithm AES256 \\\n  --sse-customer-key <chave-base64> \\\n  --sse-customer-key-md5 <md5-da-chave>\n\n# Para LER o objeto, é preciso reenviar a MESMA chave:\naws s3api get-object \\\n  --bucket meu-bucket --key contrato.pdf \\\n  --sse-customer-algorithm AES256 \\\n  --sse-customer-key <chave-base64> \\\n  saida.pdf",
                    },
                    {
                        type: "text",
                        value: "## 5. Criptografia client-side\n\nNa **criptografia client-side**, você **cifra o dado antes** de enviá-lo ao S3 e o **decifra depois** de baixá-lo. O S3 só vê **texto cifrado** e **nunca toca nas suas chaves**. Você usa uma biblioteca (por exemplo, o **Amazon S3 Encryption Client**), com uma chave do KMS ou uma chave própria. É a escolha quando o dado **não pode chegar em texto puro** ao servidor, exigindo controle ponta a ponta.",
                    },
                    {
                        type: "table",
                        value: '[["Opção","Quem gerencia a chave","Onde ocorre a criptografia","Auditoria / observações"],["**SSE-S3**","O próprio S3 (AES-256)","No servidor (S3)","Simples; header `AES256`; é o padrão"],["**SSE-KMS**","AWS KMS (chave sua ou `aws/s3`)","No servidor (S3 + KMS)","**Trilha de auditoria** no CloudTrail; header `aws:kms`"],["**SSE-C**","**Você** (envia a cada request)","No servidor (S3 usa sua chave)","S3 **não guarda** a chave; exige HTTPS"],["**Client-side**","Você","**No cliente**, antes do upload","O S3 só vê o texto cifrado"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: pelo **header** você identifica a opção — `x-amz-server-side-encryption: AES256` é **SSE-S3**; `aws:kms` é **SSE-KMS** (exige permissão no KMS e gera **auditoria**); os headers `x-amz-server-side-encryption-customer-*` são **SSE-C** (você envia a chave, o S3 não a guarda). Se o dado **não pode** chegar em texto puro ao S3, a resposta é **client-side**.",
                    },
                    {
                        type: "text",
                        value: "## 6. Forçar criptografia com bucket policy\n\nMesmo com criptografia padrão ligada, você pode **exigir** um tipo específico de criptografia **negando** os `PUT` que não o atendam. Uma **bucket policy** com `Deny` e uma condição sobre o header de criptografia resolve isso. É comum, na mesma política, **forçar HTTPS** negando requisições com `aws:SecureTransport` falso.",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "ExigeSSEKMS",\n      "Effect": "Deny",\n      "Principal": "*",\n      "Action": "s3:PutObject",\n      "Resource": "arn:aws:s3:::meu-bucket/*",\n      "Condition": {\n        "StringNotEquals": { "s3:x-amz-server-side-encryption": "aws:kms" }\n      }\n    },\n    {\n      "Sid": "ExigeHTTPS",\n      "Effect": "Deny",\n      "Principal": "*",\n      "Action": "s3:*",\n      "Resource": "arn:aws:s3:::meu-bucket/*",\n      "Condition": { "Bool": { "aws:SecureTransport": "false" } }\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 7. Bucket policies vs ACLs\n\n**Bucket policy** e **ACL** concedem acesso, mas em ligas diferentes. A **bucket policy** é uma política **JSON baseada em recurso**, no nível do bucket, com **condições**, **prefixos** e **acesso cross-account** — tudo num só lugar. As **ACLs** são um mecanismo **legado**, de concessões grosseiras por objeto/bucket, difíceis de auditar. Hoje a AWS recomenda **desabilitar ACLs** (com **Object Ownership = Bucket owner enforced**), que é o padrão de buckets novos desde 2023. Prefira **bucket policies + IAM**.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Bucket policy","ACL (legado)"],["Formato","JSON, baseada em recurso","Lista de concessões (grants)"],["Granularidade","Fina (condições, prefixos, principals)","Grossa (leitura/escrita por grantee)"],["Cross-account","Sim","Limitada"],["Recomendação da AWS","**Preferir**","**Desabilitar** (Object Ownership)"]]',
                    },
                    {
                        type: "text",
                        value: "## 8. Block Public Access\n\nO **Block Public Access** é uma **trava de segurança** com **quatro chaves** que bloqueiam e ignoram ACLs públicas e políticas públicas: `BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy` e `RestrictPublicBuckets`. Ele vem **ligado por padrão**, no nível da conta e do bucket, desde 2023, e **prevalece** mesmo que alguém, por engano, escreva uma política pública. Só desligue conscientemente quando o conteúdo for **realmente público** (por exemplo, um site estático).",
                    },
                    {
                        type: "code",
                        value: "# As 4 chaves do Block Public Access (ligadas por padrão)\naws s3api put-public-access-block \\\n  --bucket meu-bucket \\\n  --public-access-block-configuration \\\n    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true",
                    },
                    {
                        type: "text",
                        value: "## 9. CORS\n\n**CORS** (Cross-Origin Resource Sharing) entra em cena quando uma página web servida em uma **origem** (ex.: `https://app.ensina.dev`) faz, **pelo navegador**, requisições a um bucket S3 em **outra origem** (a URL do S3). O navegador aplica a *same-origin policy* e **bloqueia** essas chamadas, a menos que o bucket declare uma **configuração de CORS** permitindo aquela origem, métodos e headers. É indispensável para uploads diretos do navegador (presigned PUT) e para fetches cross-origin.",
                    },
                    {
                        type: "code",
                        value: '{\n  "CORSRules": [\n    {\n      "AllowedOrigins": ["https://app.ensina.dev"],\n      "AllowedMethods": ["GET", "PUT"],\n      "AllowedHeaders": ["*"],\n      "ExposeHeaders": ["ETag"],\n      "MaxAgeSeconds": 3000\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 10. Presigned URL vs bucket policy\n\nAs duas coisas concedem acesso, mas resolvem problemas diferentes. A **presigned URL** é **temporária**, vale para **um objeto e uma operação**, quem usa **não precisa de identidade AWS** e ela **expira** — perfeita para acesso **pontual** (baixar um arquivo privado, permitir um upload direto). A **bucket policy** é uma **regra permanente**, ligada a **principals** e **condições**, sem prazo por requisição — ideal para **acesso contínuo** (liberar uma role, forçar criptografia, permitir outra conta). Nunca torne um bucket público só para compartilhar um arquivo: use uma **presigned URL**.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Presigned URL","Bucket policy"],["Duração","Temporária (expira)","Permanente até você alterar"],["Escopo","Um objeto + uma operação","Bucket/prefixos, vários principals"],["Quem usa precisa de identidade AWS?","Não","Sim (principal IAM/conta)"],["Melhor para","Acesso pontual e temporário","Regra de acesso contínua"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **SSE-S3** (`AES256`, chaves do S3, é o padrão) · **SSE-KMS** (`aws:kms`, chave no KMS, **auditoria**) · **SSE-C** (você envia a chave, o S3 não guarda) · **client-side** (cifra antes de subir). **Bucket policy** (fina, cross-account) é preferível à **ACL** (legado). **Block Public Access** é a trava contra exposição acidental. Para acesso pontual, **presigned URL**; para regra contínua, **bucket policy**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na criptografia SSE-S3, quem gera e gerencia as chaves de criptografia?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O próprio Amazon S3, de forma transparente (AES-256).",
                                isCorrect: true,
                            },
                            {
                                text: "O cliente, que envia a chave em cada requisição.",
                                isCorrect: false,
                            },
                            {
                                text: "O AWS KMS, com uma chave gerenciada pelo cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "A aplicação, antes de enviar o objeto ao S3.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa de uma trilha de auditoria de cada operação de criptografia/descriptografia dos objetos e de controle fino sobre a chave. Qual opção de criptografia server-side atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "SSE-S3.",
                                isCorrect: false,
                            },
                            {
                                text: "SSE-KMS.",
                                isCorrect: true,
                            },
                            {
                                text: "SSE-C.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma criptografia é necessária para auditoria.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em qual opção o cliente fornece a própria chave a cada requisição, sendo que o S3 usa a chave para criptografar mas não a armazena?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "SSE-S3.",
                                isCorrect: false,
                            },
                            {
                                text: "SSE-KMS.",
                                isCorrect: false,
                            },
                            {
                                text: "SSE-C.",
                                isCorrect: true,
                            },
                            {
                                text: "Criptografia client-side (o S3 nunca chega a criptografar).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time quer uma trava que impeça a exposição acidental de dados, ignorando ACLs públicas e políticas públicas mesmo que alguém as configure por engano. Qual recurso do S3 faz isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Block Public Access.",
                                isCorrect: true,
                            },
                            {
                                text: "Versionamento.",
                                isCorrect: false,
                            },
                            {
                                text: "SSE-KMS.",
                                isCorrect: false,
                            },
                            {
                                text: "Transfer Acceleration.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação web hospedada em `https://app.ensina.dev` faz, pelo navegador, requisições para baixar objetos de um bucket S3, mas o navegador bloqueia as chamadas. O que precisa ser configurado no bucket?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma regra de CORS permitindo a origem `https://app.ensina.dev`.",
                                isCorrect: true,
                            },
                            {
                                text: "O Transfer Acceleration.",
                                isCorrect: false,
                            },
                            {
                                text: "O MFA Delete.",
                                isCorrect: false,
                            },
                            {
                                text: "A classe de armazenamento Glacier.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Segurança",
        aulas: [
            {
                titulo: "IAM - identidades e políticas",
                blocks: [
                    {
                        type: "text",
                        value: "# IAM - identidades e políticas",
                    },
                    {
                        type: "quote",
                        value: "O **AWS IAM** (Identity and Access Management) controla **quem** (autenticação) pode fazer **o quê** (autorização) em **quais recursos**. É um serviço **global** e **gratuito**, e a regra que rege tudo é simples: nada é permitido por padrão, um **allow** explícito libera, e um **deny** explícito **sempre vence** qualquer allow. Este é o serviço mais cobrado do Domínio 2 da DVA-C02.",
                    },
                    {
                        type: "text",
                        value: "## 1. As identidades do IAM: users, groups e roles\n\nO IAM tem três tipos de identidade, e a prova adora testar quando usar cada uma:\n\n- **IAM user**: identidade **permanente** de uma pessoa ou de uma aplicação. Tem **credenciais de longo prazo** (senha para o Console, ou um par de **access keys** para a CLI/SDK). Cada pessoa deve ter o seu.\n- **IAM group**: uma **coleção de users** para aplicar políticas em bloco (por exemplo, o grupo `Desenvolvedores`). Um grupo **não tem credenciais** e **não pode** ser um `Principal` numa policy; ele é só um contêiner de usuários.\n- **IAM role**: uma identidade **assumível**, **sem** credenciais permanentes. Quando alguém (um serviço, um usuário de outra conta, um usuário federado) **assume** a role, o STS entrega **credenciais temporárias**. É o mecanismo preferido para dar permissão a serviços da AWS e para acesso cross-account.\n\nAcima de tudo está o **root user** (o dono da conta), com poder irrestrito. A recomendação da AWS: **ative MFA no root, guarde-o e não o use** no dia a dia.",
                    },
                    {
                        type: "table",
                        value: '[["Identidade","Credenciais","Pode ser Principal?","Quando usar"],["IAM user","Longo prazo (senha, access keys)","Sim","Pessoa ou app fixo com acesso permanente"],["IAM group","Nenhuma","Não (só agrupa users)","Aplicar políticas a vários users de uma vez"],["IAM role","Temporárias (via STS)","Sim (ao ser assumida)","Serviços AWS, cross-account, federação"],["Root user","Dono da conta (poder total)","Sim","Quase nunca; ative MFA e guarde"]]',
                    },
                    {
                        type: "text",
                        value: '## 2. Anatomia de uma policy - o documento JSON\n\nUma **policy** (política) é um documento **JSON** que descreve permissões. Você não escreve código: você **declara** o que é permitido ou negado. Os campos principais de cada `Statement` (declaração) são:\n\n- **`Version`**: sempre `"2012-10-17"` (a versão da linguagem de políticas; não é a data de hoje).\n- **`Statement`**: uma lista de uma ou mais declarações.\n- **`Sid`**: um identificador opcional da declaração, só para você se organizar.\n- **`Effect`**: `Allow` ou `Deny`.\n- **`Action`**: as operações da API, no formato `servico:Operacao` (ex.: `s3:GetObject`). Aceita curingas (`s3:*`).\n- **`Resource`**: o **ARN** dos recursos afetados.\n- **`Condition`** (opcional): condições que precisam ser verdadeiras para a declaração valer.\n- **`Principal`**: **quem** a declaração afeta. **Só aparece em políticas baseadas em recurso** (veja a seção 4).\n\nO exemplo abaixo é uma **identity-based policy** que permite ler um bucket específico:',
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "LeituraBucketRelatorios",\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetObject",\n        "s3:ListBucket"\n      ],\n      "Resource": [\n        "arn:aws:s3:::relatorios-financeiro",\n        "arn:aws:s3:::relatorios-financeiro/*"\n      ]\n    }\n  ]\n}',
                    },
                    {
                        type: "table",
                        value: '[["Elemento","Obrigatório?","Para que serve"],["`Effect`","Sim","`Allow` ou `Deny`"],["`Action`","Sim","Operações da API (`servico:Operacao`)"],["`Resource`","Sim (identity-based)","ARNs afetados"],["`Principal`","Só em resource-based","Quem recebe a permissão"],["`Condition`","Não","Restrições extras (IP, MFA, tags...)"],["`Sid`","Não","Rótulo da declaração"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Condition - deixando a policy mais fina\n\nO bloco **`Condition`** só concede a permissão quando certas condições são verdadeiras. Ele combina um **operador** (`Bool`, `StringEquals`, `IpAddress`, `DateGreaterThan`, `ArnLike`...) com uma **chave de condição** e um valor. Chaves muito cobradas:\n\n- **`aws:MultiFactorAuthPresent`**: exige que o usuário tenha feito login com **MFA**.\n- **`aws:SourceIp`**: restringe a faixa de **IP** de origem.\n- **`aws:PrincipalTag`** / **`aws:RequestedRegion`**: controle por tag ou por região.\n\nA policy abaixo só libera o DynamoDB se a requisição vier **com MFA** **e** da **rede corporativa**:",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "SomenteComMFAeDaRedeCorporativa",\n      "Effect": "Allow",\n      "Action": "dynamodb:*",\n      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Pedidos",\n      "Condition": {\n        "Bool": { "aws:MultiFactorAuthPresent": "true" },\n        "IpAddress": { "aws:SourceIp": "203.0.113.0/24" }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 4. Identity-based vs resource-based policies\n\nEsse contraste cai direto na prova. A diferença está em **onde a policy é anexada** e se ela tem **`Principal`**:\n\n- **Identity-based policy** (baseada em identidade): anexada a um **user, group ou role**. Diz **o que aquela identidade pode fazer**. **Não tem `Principal`** (o principal é a própria identidade em que ela está anexada).\n- **Resource-based policy** (baseada em recurso): anexada **ao próprio recurso** (bucket S3, fila SQS, tópico SNS, função Lambda, chave KMS). Diz **quem** (`Principal`) pode fazer o quê **naquele recurso**. **Sempre tem `Principal`**.\n\nO ponto prático: uma **resource-based policy permite acesso cross-account diretamente** (o `Principal` pode ser outra conta), sem o outro lado precisar assumir uma role. Nem todo serviço suporta resource-based policy - os principais que suportam são **S3, SQS, SNS, Lambda e KMS**.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Identity-based policy","Resource-based policy"],["Anexada a","User, group ou role","O recurso (S3, SQS, SNS, Lambda, KMS)"],["Tem `Principal`?","**Não**","**Sim** (define quem pode agir)"],["Responde à pergunta","O que **esta identidade** pode fazer?","Quem pode agir **neste recurso**?"],["Cross-account direto?","Não (precisa assumir role)","**Sim** (Principal de outra conta)"]]',
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "AcessoCrossAccountSomenteLeitura",\n      "Effect": "Allow",\n      "Principal": {\n        "AWS": "arn:aws:iam::222222222222:root"\n      },\n      "Action": "s3:GetObject",\n      "Resource": "arn:aws:s3:::dados-compartilhados/*"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 5. Managed vs inline policies\n\nUma policy pode ser **gerenciada** (managed, um objeto reutilizável e com ARN próprio) ou **inline** (embutida numa única identidade):\n\n- **AWS managed policy**: criada e mantida **pela AWS** (ex.: `AmazonS3ReadOnlyAccess`, `AWSLambdaBasicExecutionRole`). Prática para começar, mas costuma ser mais ampla do que o necessário.\n- **Customer managed policy**: **você** cria e mantém. É **reutilizável** (anexa em vários users/groups/roles), tem **versionamento** e rollback. É a recomendação para permissões próprias.\n- **Inline policy**: escrita **dentro de uma única** identidade, numa relação **1:1**. Some junto com a identidade e **não pode ser reutilizada**. Útil quando você quer garantir que a policy nunca seja anexada a outra identidade.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Quem mantém","Reutilizável?","Versionada?"],["AWS managed","AWS","Sim (em várias identidades)","AWS controla"],["Customer managed","Você","**Sim** (recomendado)","Sim (rollback)"],["Inline","Você","**Não** (relação 1:1)","Não"]]',
                    },
                    {
                        type: "code",
                        value: "# Anexa uma policy gerenciada pela AWS a um grupo\naws iam attach-group-policy \\\n  --group-name Desenvolvedores \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess\n\n# Cria uma policy gerenciada pelo cliente (reutilizável e versionada)\naws iam create-policy \\\n  --policy-name LeituraPedidos \\\n  --policy-document file://leitura-pedidos.json\n\n# Embute uma policy inline em um único usuário (relação 1:1, sem reuso)\naws iam put-user-policy \\\n  --user-name joana \\\n  --policy-name AcessoTemporarioLogs \\\n  --policy-document file://logs.json",
                    },
                    {
                        type: "text",
                        value: "## 6. Como o IAM avalia uma requisição\n\nQuando um principal faz uma chamada, o IAM decide **allow** ou **deny** somando **todas** as políticas aplicáveis (identity-based, resource-based, SCPs de organização, boundaries). A lógica de decisão, na ordem:\n\n1. **Deny por padrão** (implicit deny): se nada permitir, a resposta é **negar**.\n2. Existe um **Deny explícito** que casa com a requisição? Então **NEGA** - fim de papo, não importa quantos allows existam.\n3. Existe um **Allow explícito**? Então **PERMITE**.\n4. Caso contrário, permanece o **deny implícito**.\n\nEm uma frase: **deny explícito > allow explícito > deny implícito**. Um único `Deny` derruba qualquer `Allow`.",
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: na avaliação de políticas do IAM, um **deny explícito sempre vence qualquer allow**. Se uma questão colocar um `Allow` amplo e um `Deny` específico sobre o mesmo recurso, o resultado é **negar** naquele recurso. E lembre: sem nenhum allow, o padrão já é **negar** (implicit deny).",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "PermiteTudoNoS3",\n      "Effect": "Allow",\n      "Action": "s3:*",\n      "Resource": "*"\n    },\n    {\n      "Sid": "MasNuncaApagarNoBucketCritico",\n      "Effect": "Deny",\n      "Action": "s3:DeleteObject",\n      "Resource": "arn:aws:s3:::contratos-assinados/*"\n    }\n  ]\n}\n\n# Resultado: o principal pode fazer QUALQUER coisa no S3,\n# EXCETO s3:DeleteObject no bucket contratos-assinados -\n# o Deny explícito vence o Allow amplo.',
                    },
                    {
                        type: "text",
                        value: '## 7. Princípio do menor privilégio\n\nO **princípio do menor privilégio** (least privilege) manda conceder **apenas** as permissões necessárias para a tarefa, e nada além. Na prática:\n\n- **Comece do zero** e vá adicionando permissões conforme a necessidade, em vez de liberar tudo e ir cortando.\n- **Evite curingas** amplos como `"Action": "*"` e `"Resource": "*"`.\n- Prefira **roles com credenciais temporárias** a access keys de longo prazo.\n- Use o **IAM Access Analyzer** para achar acessos amplos demais e o **Access Advisor** (last accessed) para remover permissões que ninguém usa.\n\nCompare a policy larga com a enxuta - a segunda ainda restringe cada usuário à **sua própria pasta** com a variável de política `${aws:username}`:',
                    },
                    {
                        type: "code",
                        value: '// EVITE: amplo demais, viola o menor privilégio\n{\n  "Effect": "Allow",\n  "Action": "*",\n  "Resource": "*"\n}\n\n// PREFIRA: ações específicas e cada usuário restrito à sua "pasta"\n{\n  "Effect": "Allow",\n  "Action": ["s3:GetObject", "s3:PutObject"],\n  "Resource": "arn:aws:s3:::area-usuarios/${aws:username}/*"\n}',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **user** = identidade fixa com credenciais de longo prazo; **group** = coleção de users (não é Principal); **role** = assumível, credenciais temporárias. **Identity-based** (sem Principal) vs **resource-based** (com Principal, permite cross-account). **Managed** (reutilizável) vs **inline** (1:1). Avaliação: **deny explícito > allow > deny implícito**. Sempre mire no **menor privilégio**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma identidade tem uma policy que permite `s3:*` em `*` e, ao mesmo tempo, outra policy com um `Deny` explícito para `s3:DeleteObject` no bucket `contratos-assinados`. O que acontece quando ela tenta apagar um objeto nesse bucket?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A ação é permitida, porque o `Allow` de `s3:*` é mais amplo e prevalece.",
                                isCorrect: false,
                            },
                            {
                                text: "A ação é negada, porque um deny explícito sempre vence qualquer allow.",
                                isCorrect: true,
                            },
                            {
                                text: "O IAM retorna um erro de conflito e pede que o administrador resolva manualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende da ordem em que as políticas foram anexadas à identidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual elemento de uma política do IAM aparece apenas em políticas baseadas em recurso (resource-based), e não em políticas baseadas em identidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`Action`",
                                isCorrect: false,
                            },
                            {
                                text: "`Effect`",
                                isCorrect: false,
                            },
                            {
                                text: "`Principal`",
                                isCorrect: true,
                            },
                            {
                                text: "`Resource`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação em uma conta AWS precisa que uma aplicação de outra conta leia objetos de um bucket S3, sem que ninguém assuma uma role. Qual abordagem resolve isso diretamente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma resource-based policy (bucket policy) com o `Principal` apontando para a outra conta.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma inline policy anexada ao usuário root da conta de origem.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma policy de grupo do IAM com `Resource: *`.",
                                isCorrect: false,
                            },
                            {
                                text: "Adicionar a outra conta a um grupo do IAM da conta de origem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre os tipos de identidade do IAM, qual afirmação está correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Um IAM group tem credenciais próprias e pode ser usado como `Principal` em uma policy.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma IAM role entrega credenciais temporárias quando é assumida, sem credenciais permanentes.",
                                isCorrect: true,
                            },
                            {
                                text: "Um IAM user só pode acessar a AWS pelo Console, nunca pela CLI.",
                                isCorrect: false,
                            },
                            {
                                text: "O root user deve ser usado no dia a dia por ter o menor privilégio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer uma política de permissões que seja reutilizável em várias roles e que suporte versionamento e rollback. Qual tipo de política atende melhor a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma inline policy embutida em cada role.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma customer managed policy.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma policy do root user compartilhada entre as roles.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma condition adicionada a cada statement.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "STS e assume role",
                blocks: [
                    {
                        type: "text",
                        value: "# STS e assume role",
                    },
                    {
                        type: "quote",
                        value: "O **AWS STS** (Security Token Service) emite **credenciais temporárias**. O coração de tudo é a operação **`sts:AssumeRole`**: uma identidade **troca** as próprias permissões pelas de uma **role**, recebendo credenciais de curta duração. Toda role tem **duas políticas**: a **trust policy** diz **quem pode assumir**, e a **permissions policy** diz **o que a role pode fazer**.",
                    },
                    {
                        type: "text",
                        value: "## 1. Credenciais temporárias\n\nDiferente das access keys de longo prazo de um IAM user, o STS entrega credenciais **que expiram**. Uma credencial temporária tem **três** partes (a terceira é o diferencial):\n\n- **`AccessKeyId`**\n- **`SecretAccessKey`**\n- **`SessionToken`** - o token de sessão, que **não existe** nas credenciais de longo prazo e precisa acompanhar toda chamada.\n\nEssas credenciais duram de **15 minutos a 12 horas** (você escolhe com `DurationSeconds`, respeitando o teto da role) e **não ficam armazenadas** na AWS - são geradas na hora e descartadas ao expirar. Isso reduz muito o risco de vazamento.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Credenciais de longo prazo (IAM user)","Credenciais temporárias (STS)"],["Componentes","AccessKeyId + SecretAccessKey","AccessKeyId + SecretAccessKey + **SessionToken**"],["Validade","Até serem rotacionadas manualmente","15 min a 12 h, depois expiram"],["Onde ficam","Armazenadas (arquivo, secret, etc.)","Geradas sob demanda, não armazenadas"],["Risco de vazamento","Maior (valem até revogar)","Menor (expiram sozinhas)"]]',
                    },
                    {
                        type: "text",
                        value: '## 2. As duas políticas de uma role\n\nToda IAM role carrega **duas** políticas com papéis bem distintos - confundi-las é armadilha clássica de prova:\n\n- **Trust policy** (política de confiança): é uma **resource-based policy** anexada à role, com um **`Principal`**, que responde **"quem pode assumir esta role?"**. É aqui que a ação `sts:AssumeRole` é autorizada.\n- **Permissions policy** (política de permissões): é **identity-based**, e responde **"o que esta role pode fazer depois de assumida?"**.\n\nO principal que quer assumir a role também precisa, do **seu lado**, ter permissão `sts:AssumeRole` sobre o ARN da role. Ou seja, **os dois lados** têm que concordar.',
                    },
                    {
                        type: "code",
                        value: '// TRUST POLICY da role - "quem pode assumir" (tem Principal)\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": {\n        "AWS": "arn:aws:iam::111111111111:role/ci-deploy"\n      },\n      "Action": "sts:AssumeRole"\n    }\n  ]\n}',
                    },
                    {
                        type: "code",
                        value: '// PERMISSIONS POLICY da role - "o que ela pode fazer" (sem Principal)\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": ["s3:PutObject", "s3:GetObject"],\n      "Resource": "arn:aws:s3:::artefatos-deploy/*"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. AssumeRole na prática - o fluxo\n\nO fluxo de assumir uma role tem quatro passos:\n\n1. O principal chama **`sts:AssumeRole`** informando o **`RoleArn`** e um **`RoleSessionName`** (um rótulo que aparece no CloudTrail).\n2. O STS confere a **trust policy** da role e a permissão `sts:AssumeRole` do chamador.\n3. O STS devolve um bloco **`Credentials`** com `AccessKeyId`, `SecretAccessKey`, `SessionToken` e `Expiration`.\n4. O chamador usa essas credenciais nas próximas chamadas, agora com as permissões **da role**.",
                    },
                    {
                        type: "code",
                        value: 'aws sts assume-role \\\n  --role-arn arn:aws:iam::222222222222:role/acesso-prod \\\n  --role-session-name deploy-2026-07\n\n# Resposta (trecho):\n# "Credentials": {\n#     "AccessKeyId": "ASIA...",\n#     "SecretAccessKey": "wJalr...",\n#     "SessionToken": "IQoJb3JpZ2luX2Vj...",   <- obrigatório em toda chamada\n#     "Expiration": "2026-07-04T18:00:00Z"      <- expira sozinho\n# }',
                    },
                    {
                        type: "text",
                        value: '## 4. Acesso cross-account com AssumeRole\n\nO padrão para acesso **entre contas** sem duplicar usuários: a **conta B** (produção) cria uma role cuja **trust policy confia na conta A** (desenvolvimento); os usuários da conta A chamam `AssumeRole` nessa role e recebem credenciais temporárias na conta B.\n\nQuando a role é oferecida a um **terceiro** (uma empresa parceira), some a condição **`sts:ExternalId`**. Ela protege contra o problema do **"confused deputy"** (delegado confuso): o parceiro só consegue assumir a role se informar o **ExternalId** combinado, impedindo que um cliente do parceiro engane-o a acessar a sua conta.',
                    },
                    {
                        type: "code",
                        value: '// TRUST POLICY cross-account para um parceiro, com ExternalId\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": {\n        "AWS": "arn:aws:iam::333333333333:root"\n      },\n      "Action": "sts:AssumeRole",\n      "Condition": {\n        "StringEquals": {\n          "sts:ExternalId": "id-secreto-combinado-a1b2c3"\n        }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "table",
                        value: '[["Passo","Onde","O que configurar"],["1. Criar a role de destino","Conta B (prod)","Trust policy confiando na conta A"],["2. Definir o que a role faz","Conta B (prod)","Permissions policy (menor privilégio)"],["3. Permitir o AssumeRole","Conta A (dev)","Policy com `sts:AssumeRole` no ARN da role"],["4. Assumir e usar","Conta A (dev)","`aws sts assume-role` + credenciais temporárias"]]',
                    },
                    {
                        type: "text",
                        value: '## 5. Roles para serviços AWS - a execution role do Lambda\n\nServiços da AWS também assumem roles para agir **em seu nome**. O caso mais cobrado é a **execution role do Lambda**: é a role que a função assume para acessar outros serviços (DynamoDB, S3, CloudWatch Logs). O que faz dela uma "role de serviço" é a **trust policy** com `Principal` do tipo **`Service`** apontando para `lambda.amazonaws.com`.\n\nUm caso especial são as **service-linked roles**: roles pré-definidas, cujas permissões e trust policy são controladas pelo próprio serviço, para ele executar tarefas de bastidores.',
                    },
                    {
                        type: "code",
                        value: '// TRUST POLICY de uma execution role do Lambda\n// (o Principal é um SERVIÇO, não uma conta ou usuário)\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": {\n        "Service": "lambda.amazonaws.com"\n      },\n      "Action": "sts:AssumeRole"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 6. Federation - identidades externas\n\n**Federation** (federação) é dar acesso à AWS a usuários que **não** são IAM users - eles vivem num diretório externo. Em vez de criar um IAM user por pessoa, eles se autenticam no provedor de identidade e **assumem uma role**:\n\n- **`AssumeRoleWithSAML`**: para diretórios corporativos que falam **SAML 2.0** (Active Directory via ADFS, por exemplo). Ideal para SSO de funcionários.\n- **`AssumeRoleWithWebIdentity`**: para **web/social identity** (Login com Google, Facebook, Apple, ou qualquer provedor **OIDC**). Ideal para apps web e mobile. O **Amazon Cognito Identity Pools** usa esse mecanismo por baixo dos panos.\n\nEm todos os casos, o resultado é o mesmo: o STS devolve **credenciais temporárias** de uma role, sem senha de IAM.",
                    },
                    {
                        type: "table",
                        value: '[["Operação","Origem da identidade","Caso típico"],["`AssumeRole`","Um principal IAM (user ou role)","Cross-account, roles de serviço"],["`AssumeRoleWithSAML`","Provedor SAML 2.0 (AD/ADFS)","SSO de funcionários"],["`AssumeRoleWithWebIdentity`","Web/OIDC (Google, Facebook, Cognito)","Apps web e mobile"]]',
                    },
                    {
                        type: "quote",
                        value: 'Dica de prova: viu **"credenciais temporárias"**, **"cross-account"** ou **"dar permissão a um serviço"**? Pense **STS AssumeRole**. A **trust policy** (com `Principal`) diz quem assume; a **permissions policy** diz o que a role faz. **`ExternalId`** protege contra o **confused deputy** com terceiros. Login **social/web** = `AssumeRoleWithWebIdentity`; **SAML corporativo** = `AssumeRoleWithSAML`.',
                    },
                    {
                        type: "code",
                        value: 'import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";\nconst sts = new STSClient({});\n\nconst { Credentials } = await sts.send(new AssumeRoleCommand({\n  RoleArn: "arn:aws:iam::222222222222:role/acesso-prod",\n  RoleSessionName: "app-sessao",\n  DurationSeconds: 3600,\n}));\n\n// Use Credentials.AccessKeyId / SecretAccessKey / SessionToken\n// para criar clientes de outros serviços com as permissões da role.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que caracteriza uma credencial temporária emitida pelo AWS STS, em comparação com as access keys de longo prazo de um IAM user?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ela inclui um `SessionToken` além do AccessKeyId e do SecretAccessKey, e expira após um período.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela nunca expira, mas só funciona no Console da AWS.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela dispensa qualquer permissão, pois o STS libera acesso total.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela é composta apenas por um SessionToken, sem AccessKeyId.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma IAM role, qual política define QUEM tem permissão para assumi-la?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A permissions policy da role.",
                                isCorrect: false,
                            },
                            {
                                text: "A trust policy da role, que contém um `Principal` e autoriza `sts:AssumeRole`.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma inline policy no bucket S3 de destino.",
                                isCorrect: false,
                            },
                            {
                                text: "A policy gerenciada `AdministratorAccess`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função Lambda precisa gravar itens em uma tabela do DynamoDB. Qual é a forma recomendada de conceder essa permissão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Incluir as access keys de um IAM user nas variáveis de ambiente da função.",
                                isCorrect: false,
                            },
                            {
                                text: "Configurar uma execution role cuja trust policy confia em `lambda.amazonaws.com` e cuja permissions policy libera o DynamoDB.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar as credenciais do root user na função.",
                                isCorrect: false,
                            },
                            {
                                text: "Anexar uma bucket policy do S3 à tabela do DynamoDB.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sua empresa oferece a um fornecedor terceirizado uma role cross-account para acessar recursos na sua conta. Qual mecanismo mitiga o problema do 'confused deputy' nesse cenário?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Definir `DurationSeconds` como 12 horas na role.",
                                isCorrect: false,
                            },
                            {
                                text: "Exigir uma condição `sts:ExternalId` na trust policy da role.",
                                isCorrect: true,
                            },
                            {
                                text: "Trocar a trust policy por uma bucket policy do S3.",
                                isCorrect: false,
                            },
                            {
                                text: "Conceder ao fornecedor as access keys de um IAM user dedicado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo mobile permite login com Google e Facebook e precisa obter credenciais AWS temporárias para os usuários autenticados. Qual operação do STS é usada nesse fluxo de web identity?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`AssumeRoleWithSAML`",
                                isCorrect: false,
                            },
                            {
                                text: "`AssumeRoleWithWebIdentity`",
                                isCorrect: true,
                            },
                            {
                                text: "`GetSessionToken` com MFA",
                                isCorrect: false,
                            },
                            {
                                text: "`CreateLoginProfile`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Amazon Cognito",
                blocks: [
                    {
                        type: "text",
                        value: "# Amazon Cognito",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon Cognito** tem **dois** componentes com nomes parecidos e papéis **diferentes**. O **User Pool** é **autenticação**: um diretório de usuários que valida o login e **emite tokens JWT**. O **Identity Pool** (Federated Identities) é **autorização na AWS**: **troca** uma identidade autenticada por **credenciais AWS temporárias** via STS. Saber quem faz o quê é o que a prova cobra.",
                    },
                    {
                        type: "text",
                        value: "## 1. O problema que o Cognito resolve\n\nQuase todo app web ou mobile precisa de **cadastro, login, recuperação de senha, MFA e login social** - e ninguém quer construir isso do zero, de forma segura. O Cognito entrega esse pacote gerenciado, escalando para milhões de usuários. Ele responde a duas perguntas separadas:\n\n- **Quem é este usuário?** (autenticação) - resolvido pelo **User Pool**.\n- **A quais recursos AWS este usuário pode chegar diretamente?** (credenciais) - resolvido pelo **Identity Pool**.",
                    },
                    {
                        type: "text",
                        value: '## 2. User Pools - autenticação e diretório\n\nUm **User Pool** é um **diretório de usuários** próprio da sua aplicação. Ele:\n\n- Faz **sign-up** e **sign-in**, com verificação de e-mail/telefone, **MFA** e políticas de senha.\n- Aceita **login federado** com provedores sociais (Google, Facebook, Apple) e corporativos (**SAML/OIDC**), aparecendo para o app como um único diretório.\n- Ao autenticar, **emite três tokens JWT**:\n  - **ID token**: contém as **claims** de identidade (quem é o usuário: `sub`, `email`, etc.). É o "documento de identidade".\n  - **Access token**: autoriza o acesso a recursos/APIs protegidas (por exemplo, um authorizer do API Gateway).\n  - **Refresh token**: de vida longa, usado para **renovar** os outros dois sem novo login.',
                    },
                    {
                        type: "table",
                        value: '[["Token","Para que serve","Vida útil típica"],["ID token (JWT)","Identidade do usuário (claims: quem é ele)","Curta (ex.: 1 h)"],["Access token (JWT)","Autorizar chamadas a APIs/recursos","Curta (ex.: 1 h)"],["Refresh token","Renovar ID e Access token sem novo login","Longa (dias/meses)"]]',
                    },
                    {
                        type: "code",
                        value: '// ID token: um JWT (header.payload.signature). Payload decodificado:\n{\n  "sub": "a1b2c3d4-1111-2222-3333-abcdef123456",\n  "cognito:username": "joana",\n  "email": "joana@exemplo.com",\n  "email_verified": true,\n  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ABC123",\n  "token_use": "id",\n  "exp": 1751650800,\n  "iat": 1751647200\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. Hosted UI e fluxos OAuth\n\nO Cognito oferece uma **Hosted UI**: uma tela de login/cadastro **pronta e hospedada pela AWS**, num domínio do Cognito. Você configura um **app client**, as **callback URLs** e os **scopes**, e o Cognito cuida da tela, do social login e do fluxo **OAuth 2.0**. O fluxo recomendado é o **Authorization Code Grant** (o app recebe um `code` e o troca por tokens no backend, sem expor tokens na URL).",
                    },
                    {
                        type: "code",
                        value: "# Endpoint de autorização da Hosted UI (Authorization Code Grant)\nhttps://meu-dominio.auth.us-east-1.amazoncognito.com/oauth2/authorize\n  ?response_type=code\n  &client_id=1example23456789\n  &redirect_uri=https://app.exemplo.com/callback\n  &scope=openid+email+profile\n\n# O Cognito redireciona de volta para redirect_uri com ?code=...\n# O backend troca esse code por tokens no endpoint /oauth2/token.",
                    },
                    {
                        type: "text",
                        value: "## 4. Fluxos de autenticação (InitiateAuth)\n\nAlém da Hosted UI, o app pode autenticar direto pela API com **`InitiateAuth`**, escolhendo o **auth flow**:\n\n- **`USER_SRP_AUTH`**: usa o protocolo **SRP** (Secure Remote Password) - a senha **nunca trafega** pela rede. É o recomendado para clientes.\n- **`USER_PASSWORD_AUTH`**: a senha vai no request (por TLS). Mais simples, útil para **migração** ou servidores confiáveis.\n- **`REFRESH_TOKEN_AUTH`**: usa o refresh token para obter novos tokens.\n- **`CUSTOM_AUTH`**: fluxo customizado com Lambda triggers (ex.: OTP, passwordless).",
                    },
                    {
                        type: "table",
                        value: '[["Auth flow","A senha trafega?","Quando usar"],["`USER_SRP_AUTH`","**Não** (protocolo SRP)","Padrão recomendado para apps"],["`USER_PASSWORD_AUTH`","Sim (sobre TLS)","Migração ou servidor confiável"],["`REFRESH_TOKEN_AUTH`","Não (usa refresh token)","Renovar tokens expirados"],["`CUSTOM_AUTH`","Depende do desafio","Fluxos customizados (OTP, passwordless)"]]',
                    },
                    {
                        type: "code",
                        value: 'aws cognito-idp initiate-auth \\\n  --auth-flow USER_PASSWORD_AUTH \\\n  --client-id 1example23456789 \\\n  --auth-parameters USERNAME=joana,PASSWORD=SenhaForte1!\n\n# Resposta (trecho) - o User Pool devolve os tokens JWT:\n# "AuthenticationResult": {\n#     "IdToken": "eyJraWQiO...",\n#     "AccessToken": "eyJraWQiO...",\n#     "RefreshToken": "eyJjdHkiO...",\n#     "ExpiresIn": 3600\n# }',
                    },
                    {
                        type: "text",
                        value: "## 5. Identity Pools - credenciais AWS temporárias\n\nUm **Identity Pool** (Cognito Federated Identities) faz uma coisa que o User Pool **não** faz: **troca** um token de um provedor de identidade (o seu User Pool, o Google, o Facebook...) por **credenciais AWS temporárias**, chamando o **STS** por baixo dos panos. Com isso o app acessa **S3, DynamoDB e outros serviços diretamente**, com permissões definidas por **IAM roles**.\n\nO Identity Pool define **duas roles**: uma para usuários **autenticados** e outra para **guests** (não autenticados), permitindo, por exemplo, um acesso limitado antes do login.",
                    },
                    {
                        type: "code",
                        value: '// IAM role atribuída aos usuários AUTENTICADOS do Identity Pool.\n// O Principal é federado (cognito-identity), e a Condition prende\n// a role a este pool específico e só a usuários autenticados.\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": { "Federated": "cognito-identity.amazonaws.com" },\n      "Action": "sts:AssumeRoleWithWebIdentity",\n      "Condition": {\n        "StringEquals": {\n          "cognito-identity.amazonaws.com:aud": "us-east-1:pool-id-1234"\n        },\n        "ForAnyValue:StringLike": {\n          "cognito-identity.amazonaws.com:amr": "authenticated"\n        }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 6. User Pool + Identity Pool combinados\n\nO padrão completo usa os **dois juntos**, cada um no seu papel:\n\n1. O usuário faz **login no User Pool** (ou via social/SAML) e recebe os **tokens JWT**.\n2. O app entrega o **ID token** ao **Identity Pool**.\n3. O Identity Pool **valida** o token e chama o **STS**.\n4. O app recebe **credenciais AWS temporárias** e acessa **S3/DynamoDB** diretamente, dentro dos limites da IAM role.\n\nRegra mnemônica: **User Pool autentica** (quem é você, emite JWT); **Identity Pool autoriza na AWS** (troca o JWT por credenciais).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","User Pool","Identity Pool (Federated Identities)"],["Função principal","Autenticar usuários (diretório)","Fornecer credenciais AWS temporárias"],["O que emite","Tokens **JWT** (ID, Access, Refresh)","Credenciais do **STS** (via IAM role)"],["Dá acesso direto a S3/DynamoDB?","Não","**Sim** (por IAM role)"],["Suporta guests (não autenticados)?","Não","Sim (role de unauthenticated)"]]',
                    },
                    {
                        type: "quote",
                        value: 'Dica de prova: **"autenticar usuários / diretório / emitir tokens JWT"** = **User Pool**. **"credenciais AWS temporárias / acessar S3 ou DynamoDB direto do app / usuário guest"** = **Identity Pool**. Eles se **combinam**: o User Pool autentica e emite o JWT; o Identity Pool troca esse JWT por credenciais da AWS via STS.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o papel principal de um Amazon Cognito User Pool?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Autenticar usuários em um diretório próprio e emitir tokens JWT (ID, Access e Refresh).",
                                isCorrect: true,
                            },
                            {
                                text: "Trocar identidades por credenciais AWS temporárias via STS.",
                                isCorrect: false,
                            },
                            {
                                text: "Criptografar objetos no S3 com chaves gerenciadas pelo cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Rotacionar automaticamente segredos de banco de dados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo mobile já autenticou o usuário e agora precisa que ele acesse um bucket S3 diretamente, com credenciais AWS temporárias limitadas por uma IAM role. Qual componente do Cognito fornece essas credenciais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O User Pool, por meio do ID token.",
                                isCorrect: false,
                            },
                            {
                                text: "O Identity Pool (Federated Identities), que troca a identidade por credenciais do STS.",
                                isCorrect: true,
                            },
                            {
                                text: "A Hosted UI, ao redirecionar para a callback URL.",
                                isCorrect: false,
                            },
                            {
                                text: "O refresh token, usado diretamente como credencial da AWS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No fluxo em que User Pool e Identity Pool são usados juntos, qual é a sequência correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O usuário autentica no User Pool e recebe um JWT; o app entrega esse JWT ao Identity Pool, que chama o STS e retorna credenciais AWS temporárias.",
                                isCorrect: true,
                            },
                            {
                                text: "O usuário autentica no Identity Pool e recebe um JWT; o User Pool troca o JWT por credenciais AWS.",
                                isCorrect: false,
                            },
                            {
                                text: "O usuário obtém credenciais AWS do User Pool e depois um JWT do Identity Pool.",
                                isCorrect: false,
                            },
                            {
                                text: "O usuário assume uma role diretamente, sem passar por nenhum dos dois pools.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer oferecer uma tela de login pronta e hospedada pela AWS, com suporte a login social e OAuth 2.0, sem construir a interface. Qual recurso do Cognito atende a isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A Hosted UI do User Pool.",
                                isCorrect: true,
                            },
                            {
                                text: "A role de unauthenticated do Identity Pool.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma bucket policy do S3.",
                                isCorrect: false,
                            },
                            {
                                text: "O fluxo `REFRESH_TOKEN_AUTH`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual fluxo de autenticação do Cognito usa o protocolo SRP, de forma que a senha do usuário nunca trafega pela rede?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`USER_PASSWORD_AUTH`",
                                isCorrect: false,
                            },
                            {
                                text: "`USER_SRP_AUTH`",
                                isCorrect: true,
                            },
                            {
                                text: "`ADMIN_NO_SRP_AUTH`",
                                isCorrect: false,
                            },
                            {
                                text: "`REFRESH_TOKEN_AUTH`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "KMS e criptografia",
                blocks: [
                    {
                        type: "text",
                        value: "# KMS e criptografia",
                    },
                    {
                        type: "quote",
                        value: "O **AWS KMS** (Key Management Service) gerencia **chaves criptográficas**, não os dados. As chaves-mestras **nunca saem do KMS em texto claro**. O truque que faz isso escalar é a **envelope encryption**: uma **data key** criptografa os dados e é ela mesma criptografada por uma **CMK** do KMS. Domine tipos de chave, key policy, grants e rotação - tudo cai na prova.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é o KMS\n\nO **KMS** cria e controla **chaves criptográficas** e integra com quase todos os serviços da AWS (S3, EBS, RDS, DynamoDB, Secrets Manager, Lambda...). Pontos essenciais:\n\n- As **KMS keys** (antes chamadas CMKs) **nunca saem do serviço** em texto claro - as operações criptográficas acontecem **dentro** do KMS, validadas em módulos **FIPS 140**.\n- Você pode mandar até **4 KB** de dados direto para o KMS cifrar/decifrar (`Encrypt`/`Decrypt`). Acima disso, usa-se **envelope encryption** (seção 4).\n- Toda operação é registrada no **CloudTrail**, o que dá auditoria de quem usou qual chave e quando.",
                    },
                    {
                        type: "text",
                        value: '## 2. Tipos de KMS key\n\nExistem três "donos" possíveis para uma chave, e a diferença de controle é cobrada na prova:\n\n- **AWS owned key**: pertence e é gerenciada **pela AWS**, compartilhada entre contas, **invisível** para você. Sem custo e sem controle.\n- **AWS managed key** (`aws/servico`, ex.: `aws/s3`): criada **pela AWS** na **sua** conta, uma por serviço. Você a **vê** no console, mas **não gerencia** a key policy nem a rotação (que é automática a cada ano). Sem custo mensal.\n- **Customer managed key (CMK)**: **você cria e controla** tudo - key policy, grants, habilitar/desabilitar, agendar exclusão e rotação. Tem **custo mensal** por chave + custo por uso. É a escolha quando você precisa de controle e auditoria fina.',
                    },
                    {
                        type: "table",
                        value: '[["Tipo de chave","Quem gerencia","Você controla a key policy?","Custo mensal"],["AWS owned","AWS (invisível)","Não","Nenhum"],["AWS managed (`aws/s3`...)","AWS, na sua conta","Não (rotação automática)","Nenhum"],["Customer managed (CMK)","**Você**","**Sim** (policy, grants, rotação)","Sim (por chave + uso)"]]',
                    },
                    {
                        type: "code",
                        value: '# Cria uma CMK simétrica e dá um alias amigável\naws kms create-key --description "chave da app de pagamentos"\naws kms create-alias \\\n  --alias-name alias/pagamentos \\\n  --target-key-id 1234abcd-12ab-34cd-56ef-1234567890ab\n\n# Criptografa um dado pequeno (<= 4 KB) direto no KMS\naws kms encrypt \\\n  --key-id alias/pagamentos \\\n  --plaintext fileb://segredo.txt \\\n  --output text --query CiphertextBlob\n\n# Descriptografa (o KMS descobre a chave pelo próprio ciphertext)\naws kms decrypt \\\n  --ciphertext-blob fileb://cifrado.bin \\\n  --output text --query Plaintext | base64 --decode',
                    },
                    {
                        type: "text",
                        value: "## 3. Simétrica vs assimétrica\n\nUma KMS key pode ser **simétrica** ou **assimétrica**:\n\n- **Simétrica** (padrão): uma **única** chave (AES-256) cifra e decifra. Ela **nunca sai** do KMS. Cobre a **grande maioria** dos casos e é o que os serviços da AWS usam para criptografia em repouso.\n- **Assimétrica**: um **par** de chaves (RSA ou ECC). A **chave pública pode sair** do KMS; a **privada fica** no KMS. Útil quando **quem cifra não tem acesso ao KMS** (usa a chave pública offline) ou para **assinatura digital** (`Sign`/`Verify`).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Chave simétrica","Chave assimétrica"],["Estrutura","Uma única chave (AES-256)","Par pública/privada (RSA, ECC)"],["A chave sai do KMS?","Nunca","A **pública** sim; a privada não"],["Casos de uso","Criptografia em repouso, data keys","Cifrar fora da AWS, assinar/verificar"],["Operações","`Encrypt`, `Decrypt`, `GenerateDataKey`","`Encrypt`/`Decrypt` ou `Sign`/`Verify`"]]',
                    },
                    {
                        type: "text",
                        value: "## 4. Envelope encryption e data keys\n\nComo o KMS só cifra **4 KB** diretamente, como criptografar um arquivo de 5 GB? Com **envelope encryption** (criptografia em envelope):\n\n1. Você chama **`GenerateDataKey`**, e o KMS devolve a **data key** em **duas formas**: em **texto claro** (`Plaintext`) e **cifrada** pela CMK (`CiphertextBlob`).\n2. Você cifra os seus dados **localmente** com a data key em texto claro.\n3. Você **descarta** a data key em texto claro da memória e **guarda a data key cifrada junto** dos dados cifrados.\n4. Para decifrar, você manda a **data key cifrada** ao KMS (`Decrypt`), recebe a data key em texto claro de volta e decifra os dados localmente.\n\nOu seja: **a data key criptografa os dados; a CMK criptografa a data key**. Isso escala (o KMS só lida com a chave pequena) e mantém a CMK sempre protegida.",
                    },
                    {
                        type: "code",
                        value: '# Gera uma data key de 256 bits sob a CMK\naws kms generate-data-key \\\n  --key-id alias/pagamentos \\\n  --key-spec AES_256\n\n# Resposta (trecho):\n# {\n#   "Plaintext": "3q2+7w==...",       <- use para cifrar os dados, depois DESCARTE\n#   "CiphertextBlob": "AQIDAHi...",   <- guarde junto dos dados cifrados\n#   "KeyId": "arn:aws:kms:us-east-1:123456789012:key/1234abcd..."\n# }',
                    },
                    {
                        type: "code",
                        value: 'import { KMSClient, GenerateDataKeyCommand, DecryptCommand }\n  from "@aws-sdk/client-kms";\nconst kms = new KMSClient({});\n\n// --- Cifrar (envelope encryption) ---\nconst dk = await kms.send(new GenerateDataKeyCommand({\n  KeyId: "alias/pagamentos", KeySpec: "AES_256",\n}));\n// 1) cifre os dados localmente com dk.Plaintext (AES-256-GCM)\n// 2) guarde dk.CiphertextBlob (a data key cifrada) junto dos dados\n// 3) apague dk.Plaintext da memória\n\n// --- Decifrar ---\nconst { Plaintext } = await kms.send(new DecryptCommand({\n  CiphertextBlob: dataKeyCifradaGuardada, // a mesma do passo 2\n}));\n// use Plaintext (a data key em claro) para decifrar os dados localmente',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: na **envelope encryption**, a **data key criptografa os dados** e é ela mesma **criptografada por uma CMK do KMS**. Guarda-se apenas a **data key cifrada** junto dos dados; a data key em texto claro é usada e **descartada**. Isso permite cifrar objetos muito maiores que o limite de 4 KB do `Encrypt` direto.",
                    },
                    {
                        type: "text",
                        value: "## 5. Key policy e grants\n\nToda KMS key tem uma **key policy** (política de chave), que é **resource-based** e **obrigatória**. Detalhe cobrado na prova: **diferente de outros serviços, no KMS a key policy é a raiz da autorização** - uma policy de IAM sozinha **não basta** se a key policy não delegar acesso ao IAM. Além dela existem os **grants**:\n\n- **Key policy**: define os administradores da chave e quem pode usá-la. Anexada à própria chave.\n- **Grant** (concessão): dá a um principal (muitas vezes **um serviço**) permissão **granular e temporária** para operações específicas (ex.: só `Decrypt` e `GenerateDataKey`), sem editar a key policy. Pode ser **revogado**. A condição **`kms:ViaService`** restringe o uso da chave a chamadas feitas **através de um serviço** (ex.: só via `s3`).",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Id": "key-policy-pagamentos",\n  "Statement": [\n    {\n      "Sid": "PermiteAdministracaoDaConta",\n      "Effect": "Allow",\n      "Principal": { "AWS": "arn:aws:iam::123456789012:root" },\n      "Action": "kms:*",\n      "Resource": "*"\n    },\n    {\n      "Sid": "PermiteUsoDaChavePelaAppRole",\n      "Effect": "Allow",\n      "Principal": {\n        "AWS": "arn:aws:iam::123456789012:role/app-pagamentos"\n      },\n      "Action": [\n        "kms:Encrypt",\n        "kms:Decrypt",\n        "kms:GenerateDataKey"\n      ],\n      "Resource": "*"\n    }\n  ]\n}',
                    },
                    {
                        type: "code",
                        value: "# Grant: dá a uma role apenas Decrypt + GenerateDataKey, de forma\n# granular e revogável, sem alterar a key policy\naws kms create-grant \\\n  --key-id alias/pagamentos \\\n  --grantee-principal arn:aws:iam::123456789012:role/relatorios \\\n  --operations Decrypt GenerateDataKey",
                    },
                    {
                        type: "text",
                        value: "## 6. Rotação de chave\n\n**Rotacionar** uma chave troca o material criptográfico para limitar o impacto de um eventual vazamento:\n\n- **Rotação automática** (CMK simétrica): você **habilita** e o KMS gera **novo material** periodicamente (por padrão a cada **1 ano**; hoje o período é configurável). O **key ID e o alias continuam os mesmos**, e o KMS **retém o material antigo** para ainda decifrar dados cifrados antes da rotação. Transparente para as aplicações.\n- **AWS managed keys** rotacionam **automaticamente** (você não controla).\n- **Rotação manual**: você cria uma **nova chave** e reaponta o **alias** - necessária para chaves **assimétricas** ou importadas, que não suportam rotação automática.",
                    },
                    {
                        type: "code",
                        value: '# Habilita a rotação automática anual do material da CMK\naws kms enable-key-rotation --key-id alias/pagamentos\n\n# Confere se está habilitada\naws kms get-key-rotation-status --key-id alias/pagamentos\n# { "KeyRotationEnabled": true }',
                    },
                    {
                        type: "text",
                        value: '## 7. Em trânsito vs em repouso\n\nDois momentos distintos para proteger o dado, e a prova gosta de separar:\n\n- **Em repouso** (at rest): o dado **parado** no disco/armazenamento, cifrado. É aqui que o KMS atua: **SSE-S3**, **SSE-KMS**, criptografia de volumes **EBS**, de bancos **RDS**, etc.\n- **Em trânsito** (in transit): o dado **viajando** pela rede, protegido por **TLS/HTTPS**. É o "cadeado" da conexão.\n\nA boa prática é aplicar **os dois ao mesmo tempo**: TLS na comunicação e criptografia em repouso no armazenamento.',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Em repouso (at rest)","Em trânsito (in transit)"],["Onde o dado está","Parado no armazenamento/disco","Viajando pela rede"],["Como se protege","Criptografia (SSE-KMS, EBS, RDS)","TLS / HTTPS"],["Papel do KMS","Central (gerencia as chaves)","Indireto (certificados via ACM)"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **AWS managed** (rotação automática, sem controle) vs **customer managed / CMK** (você controla policy, grants e rotação). **Envelope encryption**: data key cifra os dados, CMK cifra a data key. **Key policy** é resource-based e obrigatória (raiz da autorização); **grants** dão acesso granular e revogável. Rotação automática mantém o **mesmo key ID**. Proteja o dado **em repouso** (KMS) **e em trânsito** (TLS).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No modelo de envelope encryption do KMS, qual é a relação entre a data key e a CMK?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A data key criptografa os dados e é ela mesma criptografada pela CMK do KMS.",
                                isCorrect: true,
                            },
                            {
                                text: "A CMK criptografa os dados diretamente e a data key apenas assina o resultado.",
                                isCorrect: false,
                            },
                            {
                                text: "A data key e a CMK são a mesma chave, apenas com nomes diferentes.",
                                isCorrect: false,
                            },
                            {
                                text: "A CMK sai do KMS em texto claro para que a aplicação cifre os dados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa precisa controlar totalmente a política de acesso de uma chave, habilitar rotação e poder desabilitá-la. Qual tipo de chave do KMS ela deve usar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma AWS owned key.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma AWS managed key (`aws/servico`).",
                                isCorrect: false,
                            },
                            {
                                text: "Uma customer managed key (CMK).",
                                isCorrect: true,
                            },
                            {
                                text: "Uma chave do Secrets Manager.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a key policy de uma KMS key, qual afirmação está correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ela é uma resource-based policy obrigatória e é a raiz da autorização; uma policy de IAM sozinha não concede acesso se a key policy não delegar ao IAM.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela é opcional, pois o controle de acesso do KMS é feito apenas por políticas de IAM.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela só pode conceder acesso a usuários da mesma região da chave.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela substitui a necessidade de TLS para dados em trânsito.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação externa à AWS precisa criptografar dados sem ter acesso ao KMS no momento da cifragem, e o KMS deve decifrar depois. Qual tipo de chave suporta esse cenário?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Uma chave simétrica, distribuindo a própria chave AES para o cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma chave assimétrica, cuja chave pública é distribuída para cifrar fora da AWS enquanto a privada permanece no KMS.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma AWS owned key exportada para o cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma data key em texto claro enviada por e-mail ao cliente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao habilitar a rotação automática de uma CMK simétrica, o que acontece com o key ID e com os dados já criptografados antes da rotação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O key ID muda e os dados antigos precisam ser recriptografados manualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "O key ID e o alias permanecem os mesmos, e o KMS retém o material antigo para decifrar dados anteriores.",
                                isCorrect: true,
                            },
                            {
                                text: "A chave é excluída e substituída por uma AWS managed key.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dados antigos ficam permanentemente inacessíveis.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Gestão de segredos: Secrets Manager vs Parameter Store",
                blocks: [
                    {
                        type: "text",
                        value: "# Gestão de segredos: Secrets Manager vs Parameter Store",
                    },
                    {
                        type: "quote",
                        value: "Nunca deixe senha, token ou connection string **hardcoded** no código ou em texto claro. Dois serviços guardam configuração e segredos cifrados por **KMS**. O **grande discriminador** da prova: só o **Secrets Manager** tem **rotação automática** de segredo com integração embutida para **Amazon RDS, Amazon Redshift e Amazon DocumentDB**. O **Parameter Store** não tem rotação automática nativa.",
                    },
                    {
                        type: "text",
                        value: "## 1. Nunca faça hardcode de segredos\n\nUm segredo escrito no código acaba **no Git, nos logs e na imagem** do contêiner - qualquer um com acesso ao repositório o enxerga, e rotacioná-lo vira um pesadelo. A regra: **externalize** o segredo para um cofre e **leia em runtime**.\n\nVariáveis de ambiente são **melhores que hardcode**, mas ainda ficam **visíveis** na configuração da função/tarefa e **não rotacionam** sozinhas. A prática recomendada é buscar o segredo no **Secrets Manager** ou no **Parameter Store (SecureString)** quando a aplicação inicia.",
                    },
                    {
                        type: "code",
                        value: '// EVITE: segredo hardcoded (vai para o Git, logs, imagem)\nconst db = connect({ user: "admin", password: "SenhaEmTextoPlano123" });\n\n// PREFIRA: buscar o segredo em runtime, cifrado no cofre\nimport { SecretsManagerClient, GetSecretValueCommand }\n  from "@aws-sdk/client-secrets-manager";\nconst sm = new SecretsManagerClient({});\n\nconst { SecretString } = await sm.send(new GetSecretValueCommand({\n  SecretId: "prod/app/db",\n}));\nconst cred = JSON.parse(SecretString); // { username, password, host, ... }\nconst db = connect({ user: cred.username, password: cred.password });',
                    },
                    {
                        type: "text",
                        value: "## 2. AWS Secrets Manager\n\nO **Secrets Manager** guarda segredos **cifrados por KMS** e foi feito para o ciclo de vida de segredos. O grande diferencial:\n\n- **Rotação automática nativa**: para **Amazon RDS, Amazon Redshift e Amazon DocumentDB**, a rotação é **integrada** - a AWS fornece a Lambda de rotação pronta e o Secrets Manager troca a senha no banco e no segredo, sem downtime. Para outros segredos, você fornece uma **Lambda de rotação** customizada.\n- **Resource policy**: permite acesso **cross-account** ao segredo.\n- **Custo**: cobra **por segredo/mês** + por 10 mil chamadas de API. É mais caro que o Parameter Store, e você paga por esse conjunto de recursos (rotação, replicação, integração).",
                    },
                    {
                        type: "code",
                        value: '# Cria um segredo (valor em JSON com as credenciais)\naws secretsmanager create-secret \\\n  --name prod/app/db \\\n  --secret-string \'{"username":"admin","password":"S3nh@Forte"}\'\n\n# Lê o valor do segredo em runtime\naws secretsmanager get-secret-value \\\n  --secret-id prod/app/db \\\n  --query SecretString --output text',
                    },
                    {
                        type: "code",
                        value: "# Rotação automática a cada 30 dias, com a Lambda de rotação\n# (para RDS/Redshift/DocumentDB a AWS já fornece essa Lambda pronta)\naws secretsmanager rotate-secret \\\n  --secret-id prod/app/db \\\n  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRDSRotation \\\n  --rotation-rules AutomaticallyAfterDays=30",
                    },
                    {
                        type: "text",
                        value: "## 3. SSM Parameter Store\n\nO **AWS Systems Manager Parameter Store** é um **armazém hierárquico** de parâmetros de configuração e segredos. Características:\n\n- **Hierarquia por caminho**: organize por path, como `/app/prod/db/url`, e leia um ramo inteiro de uma vez.\n- **Tipos**: `String`, `StringList` e **`SecureString`** (o valor é **cifrado por KMS**).\n- **Tiers**: **Standard** (**gratuito**, até 10.000 parâmetros, valor de 4 KB) e **Advanced** (pago, valor de 8 KB, políticas de parâmetro).\n- **Sem rotação automática nativa**: se precisar rotacionar, você mesmo automatiza (ex.: EventBridge + Lambda). Essa é a principal diferença para o Secrets Manager.",
                    },
                    {
                        type: "code",
                        value: '# Cria um parâmetro cifrado (SecureString) com uma CMK\naws ssm put-parameter \\\n  --name /app/prod/db/senha \\\n  --type SecureString \\\n  --key-id alias/pagamentos \\\n  --value "S3nh@Forte"\n\n# Lê e descriptografa (exige permissão kms:Decrypt)\naws ssm get-parameter \\\n  --name /app/prod/db/senha \\\n  --with-decryption \\\n  --query Parameter.Value --output text\n\n# Lê um ramo inteiro da hierarquia de uma vez\naws ssm get-parameters-by-path \\\n  --path /app/prod/db/ \\\n  --recursive --with-decryption',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Secrets Manager","Parameter Store (SSM)"],["Rotação automática nativa","**Sim** (RDS, Redshift, DocumentDB integrados)","**Não** (você automatiza)"],["Custo","Por segredo/mês + chamadas","**Standard gratuito**; Advanced pago"],["Cifragem do valor","Sempre por KMS","Só no tipo `SecureString` (KMS)"],["Organização hierárquica","Não (por nome)","**Sim** (por path `/a/b/c`)"],["Acesso cross-account","Sim (resource policy)","Limitado"],["Tamanho do valor","Até 64 KB","4 KB (Standard) / 8 KB (Advanced)"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: a questão citou **rotação automática de senha integrada com RDS, Redshift ou DocumentDB**? A resposta é **Secrets Manager**, sempre. Se pedir **configuração hierárquica, de graça, sem necessidade de rotação nativa**, é o **Parameter Store (SecureString)**. Esse é o discriminador nº 1 entre os dois serviços.",
                    },
                    {
                        type: "text",
                        value: "## 4. SecureString e KMS\n\nO tipo **`SecureString`** do Parameter Store cifra o valor com uma **KMS key** (a `aws/ssm` por padrão, ou uma **CMK** sua para dados sensíveis). A leitura exige o parâmetro **`--with-decryption`** **e** a permissão **`kms:Decrypt`** na chave. Em repouso, o valor fica tão protegido quanto no Secrets Manager - a diferença permanece a **rotação**, que o Parameter Store não faz nativamente.\n\nAplique o **menor privilégio** para o leitor: só `ssm:GetParameter` naquele path e `kms:Decrypt` naquela chave.",
                    },
                    {
                        type: "code",
                        value: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "LerParametroDaApp",\n      "Effect": "Allow",\n      "Action": "ssm:GetParameter",\n      "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/app/prod/db/*"\n    },\n    {\n      "Sid": "DecifrarComACMK",\n      "Effect": "Allow",\n      "Action": "kms:Decrypt",\n      "Resource": "arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab"\n    }\n  ]\n}',
                    },
                    {
                        type: "text",
                        value: "## 5. Um atalho: ler o Secrets Manager pelo Parameter Store\n\nHá uma integração prática: o **Parameter Store consegue ler um segredo do Secrets Manager** usando o prefixo de caminho **`/aws/reference/secretsmanager/`**. Assim, uma aplicação que já fala com a API do SSM pode ler **ambos** - config no Parameter Store e segredos no Secrets Manager - com **uma única API**, aproveitando a rotação do Secrets Manager.",
                    },
                    {
                        type: "code",
                        value: "# Lê um segredo do Secrets Manager PELA API do Parameter Store\naws ssm get-parameter \\\n  --name /aws/reference/secretsmanager/prod/app/db \\\n  --with-decryption \\\n  --query Parameter.Value --output text",
                    },
                    {
                        type: "text",
                        value: "## 6. Boas práticas\n\n- **Menor privilégio na leitura**: só o path/segredo necessário e o `kms:Decrypt` da chave certa.\n- **CMK própria** para segredos sensíveis, em vez da chave gerenciada padrão.\n- **Cache no cliente**: guarde o segredo em memória por um tempo para evitar throttling e custo de API a cada requisição.\n- **Nunca logue** o segredo nem o coloque em variável de ambiente em texto claro.\n- Prefira **IAM roles** (credenciais temporárias) a credenciais estáticas para acessar o cofre.",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **nunca hardcode** - leia o segredo em runtime. **Secrets Manager** = rotação automática integrada (**RDS, Redshift, DocumentDB**), resource policy cross-account, pago. **Parameter Store** = hierárquico, **Standard gratuito**, `SecureString` cifrado por KMS, **sem** rotação nativa. Leitura de `SecureString` exige **`--with-decryption`** + **`kms:Decrypt`**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um desenvolvedor colocou a senha do banco de dados diretamente no código-fonte da aplicação. Qual é a recomendação da AWS para tratar esse segredo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Externalizar o segredo para um cofre (Secrets Manager ou Parameter Store SecureString) e lê-lo em runtime.",
                                isCorrect: true,
                            },
                            {
                                text: "Manter no código, mas ofuscar a string com base64.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover para um comentário no final do arquivo.",
                                isCorrect: false,
                            },
                            {
                                text: "Publicar em um bucket S3 público para facilitar o acesso da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe precisa de rotação automática de senha com integração embutida para um banco Amazon RDS, sem escrever a lógica de rotação do zero. Qual serviço atende diretamente a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS Secrets Manager",
                                isCorrect: true,
                            },
                            {
                                text: "SSM Parameter Store (tier Standard)",
                                isCorrect: false,
                            },
                            {
                                text: "Variáveis de ambiente da função Lambda",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon Cognito User Pool",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação diferencia corretamente o Secrets Manager do Parameter Store?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O Secrets Manager oferece rotação automática integrada para RDS, Redshift e DocumentDB, enquanto o Parameter Store não tem rotação automática nativa.",
                                isCorrect: true,
                            },
                            {
                                text: "O Parameter Store cifra segredos por KMS, mas o Secrets Manager guarda tudo em texto claro.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o Parameter Store permite rotação automática integrada com o RDS.",
                                isCorrect: false,
                            },
                            {
                                text: "O Secrets Manager é sempre gratuito, e o Parameter Store cobra por segredo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa armazenar dezenas de parâmetros de configuração organizados por caminho (como `/app/prod/...`), sem custo e sem necessidade de rotação automática. Qual opção é a mais adequada?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O Parameter Store no tier Standard, usando `SecureString` para os valores sensíveis.",
                                isCorrect: true,
                            },
                            {
                                text: "O Secrets Manager, criando um segredo por parâmetro.",
                                isCorrect: false,
                            },
                            {
                                text: "Hardcode dos valores em variáveis de ambiente da função.",
                                isCorrect: false,
                            },
                            {
                                text: "Um Cognito Identity Pool para armazenar a configuração.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação lê um parâmetro do tipo `SecureString` do Parameter Store, cifrado com uma CMK. O que é necessário, além de `ssm:GetParameter`, para que a leitura funcione?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar `--with-decryption` na leitura e ter permissão `kms:Decrypt` na chave que cifrou o valor.",
                                isCorrect: true,
                            },
                            {
                                text: "Ativar a rotação automática do parâmetro.",
                                isCorrect: false,
                            },
                            {
                                text: "Converter o parâmetro para o tipo `StringList`.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover o parâmetro para o tier Advanced obrigatoriamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Implantação e Infraestrutura como Código",
        aulas: [
            {
                titulo: "CloudFormation",
                blocks: [
                    {
                        type: "text",
                        value: "# CloudFormation",
                    },
                    {
                        type: "quote",
                        value: "O **AWS CloudFormation** é o serviço de **infraestrutura como código (IaC)** da AWS: você descreve toda a sua infraestrutura em um **template** declarativo (YAML ou JSON) e o CloudFormation provisiona e configura os recursos por você, na ordem certa, de forma **repetível** e **versionável**. Cada execução desse template vira uma **stack**.",
                    },
                    {
                        type: "text",
                        value: "## 1. Infraestrutura como código\n\nInfraestrutura como código (**IaC**) significa **descrever** os recursos (uma tabela DynamoDB, uma função Lambda, um bucket S3, um papel IAM) em um **arquivo de texto**, em vez de criá-los na mão pelo console. Vantagens que a prova adora cobrar:\n\n- **Repetível e consistente**: o mesmo template gera a mesma infraestrutura em dev, homologação e produção.\n- **Versionável**: o template mora no Git, com histórico e code review.\n- **Declarativo**: você diz **o que** quer (o estado final), não **como** chegar lá. O CloudFormation calcula a ordem de criação e as dependências.\n- **Sem custo pelo serviço**: você paga só pelos **recursos** que a stack cria, não pelo CloudFormation em si.",
                    },
                    {
                        type: "text",
                        value: "## 2. Anatomia de um template\n\nUm template é um documento **YAML** ou **JSON** dividido em seções. Só **uma** delas é obrigatória: `Resources`. As demais são opcionais:\n\n- **`AWSTemplateFormatVersion`**: a versão do formato do template.\n- **`Description`**: um texto livre descrevendo a stack.\n- **`Metadata`**: dados extras sobre o template.\n- **`Parameters`**: entradas que você fornece no deploy (deixa o template reutilizável).\n- **`Mappings`**: tabelas de lookup de valores fixos (ex.: AMI por região).\n- **`Conditions`**: expressões que ligam/desligam recursos conforme o ambiente.\n- **`Transform`**: macros a aplicar (é o que o **SAM** usa).\n- **`Resources`** (a única **obrigatória**): os recursos AWS a criar.\n- **`Outputs`**: valores retornados pela stack (ex.: a URL de um endpoint).",
                    },
                    {
                        type: "table",
                        value: '[["Seção","Obrigatória?","Para que serve"],["`Resources`","**Sim**","Declara os recursos AWS a provisionar"],["`Parameters`","Não","Entradas fornecidas no deploy"],["`Mappings`","Não","Tabelas de lookup de valores fixos"],["`Conditions`","Não","Cria recursos condicionalmente"],["`Outputs`","Não","Valores exportados pela stack"],["`Transform`","Não","Macros (ex.: `AWS::Serverless` do SAM)"]]',
                    },
                    {
                        type: "code",
                        value: 'AWSTemplateFormatVersion: "2010-09-09"\nDescription: Stack de exemplo com as seções principais\n\nParameters:\n  NomeBucket:\n    Type: String\n    Description: Nome do bucket a criar\n\nResources:\n  MeuBucket:\n    Type: AWS::S3::Bucket\n    Properties:\n      BucketName: !Ref NomeBucket\n\nOutputs:\n  BucketArn:\n    Description: ARN do bucket criado\n    Value: !GetAtt MeuBucket.Arn',
                    },
                    {
                        type: "text",
                        value: "## 3. Resources - a seção obrigatória\n\nCada recurso tem um **nome lógico** (a chave que você escolhe, ex.: `MeuBucket`), um **`Type`** no formato `AWS::Servico::Recurso` e um bloco **`Properties`**. O CloudFormation resolve as **dependências automaticamente**: se um recurso referencia outro (via `Ref`/`Fn::GetAtt`), ele cria o dependido primeiro. Quando não há referência, mas a ordem importa, use **`DependsOn`**.",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Tabela:\n    Type: AWS::DynamoDB::Table\n    Properties:\n      TableName: pedidos\n      BillingMode: PAY_PER_REQUEST\n      AttributeDefinitions:\n        - AttributeName: id\n          AttributeType: S\n      KeySchema:\n        - AttributeName: id\n          KeyType: HASH\n\n  Funcao:\n    Type: AWS::Lambda::Function\n    DependsOn: Tabela            # força a tabela a existir antes da função\n    Properties:\n      FunctionName: processa-pedidos\n      Runtime: nodejs20.x\n      Handler: index.handler\n      Role: !GetAtt PapelExec.Arn\n      Environment:\n        Variables:\n          TABELA: !Ref Tabela     # Ref à tabela retorna o nome dela",
                    },
                    {
                        type: "text",
                        value: "## 4. Parameters\n\n**Parameters** deixam o template reutilizável: você passa valores no deploy sem editar o arquivo. Cada parâmetro tem um **`Type`** (`String`, `Number`, `List<Number>`, `CommaDelimitedList` ou tipos específicos da AWS, como `AWS::EC2::KeyPair::KeyName`). Propriedades úteis: `Default`, `AllowedValues`, `AllowedPattern`, `MinLength`/`MaxLength` e `NoEcho` (esconde o valor, para senhas).",
                    },
                    {
                        type: "code",
                        value: "Parameters:\n  Ambiente:\n    Type: String\n    Default: dev\n    AllowedValues: [dev, homolog, prod]\n    Description: Ambiente de destino\n\n  TipoInstancia:\n    Type: String\n    Default: t3.micro\n    AllowedValues: [t3.micro, t3.small, t3.medium]\n\n  SenhaBanco:\n    Type: String\n    NoEcho: true                # não exibe o valor no console nem nos eventos\n    MinLength: 8",
                    },
                    {
                        type: "text",
                        value: "## 5. Mappings\n\n**Mappings** são tabelas de **lookup** de valores fixos, organizadas em dois níveis de chave. O caso clássico: escolher a **AMI** certa conforme a **região** (o ID da AMI muda de região para região). Você lê um valor do mapa com a função **`Fn::FindInMap`**.",
                    },
                    {
                        type: "code",
                        value: 'Mappings:\n  AmiPorRegiao:\n    us-east-1:\n      AMI: ami-0abcd1234\n    sa-east-1:\n      AMI: ami-0efgh5678\n\nResources:\n  Servidor:\n    Type: AWS::EC2::Instance\n    Properties:\n      # busca a AMI da região atual no mapa\n      ImageId: !FindInMap [AmiPorRegiao, !Ref "AWS::Region", AMI]\n      InstanceType: t3.micro',
                    },
                    {
                        type: "text",
                        value: "## 6. Conditions\n\n**Conditions** criam recursos (ou definem propriedades) **condicionalmente**. Você define a condição com funções lógicas (`Fn::Equals`, `Fn::And`, `Fn::Or`, `Fn::Not`) e a aplica a um recurso com a chave `Condition`, ou dentro de uma propriedade com `Fn::If`. Padrão comum: criar certos recursos **só em produção**.",
                    },
                    {
                        type: "code",
                        value: "Parameters:\n  Ambiente:\n    Type: String\n    AllowedValues: [dev, prod]\n\nConditions:\n  EhProd: !Equals [!Ref Ambiente, prod]\n\nResources:\n  ReplicaLeitura:\n    Type: AWS::RDS::DBInstance\n    Condition: EhProd            # só é criada quando Ambiente = prod\n    Properties:\n      Engine: postgres\n      DBInstanceClass: db.t3.medium",
                    },
                    {
                        type: "text",
                        value: "## 7. Outputs e referências entre stacks\n\n**Outputs** retornam valores da stack (a URL de um site, o ARN de uma fila). Além de exibir no console/CLI, um output pode ser **exportado** com `Export`, virando um valor **compartilhável entre stacks**. Outra stack o consome com **`Fn::ImportValue`**. Ótimo para separar uma stack de rede (VPC) das stacks de aplicação.",
                    },
                    {
                        type: "code",
                        value: "# Stack de rede exporta o ID da VPC\nOutputs:\n  VpcId:\n    Value: !Ref MinhaVpc\n    Export:\n      Name: rede-vpc-id\n\n# Outra stack importa esse valor\nResources:\n  SG:\n    Type: AWS::EC2::SecurityGroup\n    Properties:\n      VpcId: !ImportValue rede-vpc-id\n      GroupDescription: SG da aplicação",
                    },
                    {
                        type: "text",
                        value: "## 8. Funções intrínsecas\n\nAs **funções intrínsecas** injetam valores dinâmicos no template (você não sabe o ARN de um recurso antes de ele existir). As três mais cobradas:\n\n- **`Ref`**: retorna o valor de um **parâmetro** ou o **identificador físico** de um recurso (para muitos recursos, o nome/ID).\n- **`Fn::GetAtt`**: retorna um **atributo específico** de um recurso (ex.: `Arn`, `DomainName`, `Endpoint.Address`).\n- **`Fn::Sub`**: **substitui variáveis** dentro de uma string, incluindo **pseudo-parâmetros** como `${AWS::Region}` e `${AWS::AccountId}`.\n\nNa forma curta do YAML, viram `!Ref`, `!GetAtt` e `!Sub`.",
                    },
                    {
                        type: "table",
                        value: '[["Função","Forma curta","O que retorna","Exemplo"],["`Ref`","`!Ref`","ID/nome físico de um recurso ou valor de parâmetro","`!Ref MeuBucket`"],["`Fn::GetAtt`","`!GetAtt`","Um atributo específico do recurso","`!GetAtt MeuBucket.Arn`"],["`Fn::Sub`","`!Sub`","String com variáveis substituídas","`!Sub \\"arn:aws:s3:::${MeuBucket}/*\\"`"],["`Fn::FindInMap`","`!FindInMap`","Valor de um Mapping","`!FindInMap [M, K1, K2]`"],["`Fn::ImportValue`","`!ImportValue`","Valor exportado por outra stack","`!ImportValue rede-vpc-id`"]]',
                    },
                    {
                        type: "code",
                        value: 'Resources:\n  Bucket:\n    Type: AWS::S3::Bucket\n\n  Politica:\n    Type: AWS::S3::BucketPolicy\n    Properties:\n      Bucket: !Ref Bucket                         # ID/nome do bucket\n      PolicyDocument:\n        Statement:\n          - Effect: Allow\n            Principal: "*"\n            Action: s3:GetObject\n            # Sub monta o ARN usando o atributo do recurso\n            Resource: !Sub "${Bucket.Arn}/*"\n\nOutputs:\n  DominioBucket:\n    Value: !GetAtt Bucket.DomainName              # atributo específico\n  Conta:\n    Value: !Sub "Conta ${AWS::AccountId} na região ${AWS::Region}"',
                    },
                    {
                        type: "text",
                        value: "## 9. Stacks e o ciclo de vida\n\nUma **stack** é o conjunto de recursos criados a partir de um template; você os gerencia juntos (cria, atualiza e **apaga a stack inteira** de uma vez). Pela CLI: `create-stack`, `update-stack` e `delete-stack`; ou `deploy`, que cria ou atualiza conforme o caso. O parâmetro `--capabilities CAPABILITY_IAM` é **obrigatório** quando a stack cria recursos IAM.",
                    },
                    {
                        type: "code",
                        value: "# Cria a stack\naws cloudformation create-stack \\\n  --stack-name minha-app \\\n  --template-body file://template.yaml \\\n  --parameters ParameterKey=Ambiente,ParameterValue=prod \\\n  --capabilities CAPABILITY_IAM\n\n# Atualiza (ou cria, se não existir) a partir do template\naws cloudformation deploy \\\n  --stack-name minha-app \\\n  --template-file template.yaml \\\n  --parameter-overrides Ambiente=prod\n\n# Apaga a stack inteira (remove todos os recursos)\naws cloudformation delete-stack --stack-name minha-app",
                    },
                    {
                        type: "text",
                        value: "## 10. Change sets - prevendo mudanças\n\nAntes de aplicar um `update-stack`, você quer saber **o que vai mudar** e, principalmente, se algum recurso será **substituído** (o que pode causar downtime ou perda de dados). Um **change set** é exatamente isso: uma **prévia** das mudanças. O CloudFormation compara o template novo com o estado atual e lista o que será **adicionado, modificado ou removido** — sem aplicar nada. Você revisa e só então **executa** o change set.",
                    },
                    {
                        type: "code",
                        value: "# 1) Cria o change set (a prévia) sem alterar a stack\naws cloudformation create-change-set \\\n  --stack-name minha-app \\\n  --change-set-name revisao-1 \\\n  --template-body file://template.yaml\n\n# 2) Mostra o que vai mudar (Add / Modify / Remove e se haverá Replacement)\naws cloudformation describe-change-set \\\n  --stack-name minha-app \\\n  --change-set-name revisao-1\n\n# 3) Se estiver tudo certo, aplica as mudanças\naws cloudformation execute-change-set \\\n  --stack-name minha-app \\\n  --change-set-name revisao-1",
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: sempre que a questão falar em **ver/prever as alterações antes de aplicá-las** numa stack, a resposta é **change set**. Ele mostra as mudanças (inclusive substituições de recurso) sem tocar na infraestrutura; nada muda até você **executar** o change set.",
                    },
                    {
                        type: "text",
                        value: "## 11. Drift detection\n\n**Drift** (desvio) acontece quando alguém altera um recurso **por fora** do CloudFormation (na mão, pelo console ou CLI). Aí o estado real diverge do template. O **drift detection** compara o estado atual dos recursos com o que a stack espera e aponta o que está **MODIFIED**, **DELETED** ou **IN_SYNC**. Serve para descobrir mudanças manuais que quebram a reprodutibilidade.",
                    },
                    {
                        type: "code",
                        value: "# Dispara a detecção de drift na stack\naws cloudformation detect-stack-drift --stack-name minha-app\n\n# Consulta o resultado por recurso (MODIFIED / DELETED / IN_SYNC)\naws cloudformation describe-stack-resource-drifts \\\n  --stack-name minha-app \\\n  --stack-resource-drift-status-filters MODIFIED DELETED",
                    },
                    {
                        type: "text",
                        value: "## 12. Rollback automático\n\nSe a **criação** de uma stack falha, o CloudFormation faz **rollback automático**: desfaz tudo e apaga os recursos já criados, deixando a conta limpa (comportamento padrão; dá para desativar com `--disable-rollback` para depurar). Se uma **atualização** falha, ele volta a stack para o **estado anterior** que funcionava. Você pode ainda configurar **rollback triggers** com alarmes do CloudWatch: se um alarme dispara durante o deploy, o CloudFormation reverte a mudança.",
                    },
                    {
                        type: "text",
                        value: "## 13. DeletionPolicy e UpdateReplacePolicy\n\nPor padrão, apagar a stack apaga **todos** os recursos. Para proteger dados, use **`DeletionPolicy`** no recurso:\n\n- **`Delete`** (padrão): apaga o recurso junto com a stack.\n- **`Retain`**: **mantém** o recurso mesmo que a stack seja apagada.\n- **`Snapshot`**: tira um **snapshot** antes de apagar (suportado por RDS, EBS, ElastiCache, Redshift, etc.).\n\nA irmã **`UpdateReplacePolicy`** faz o mesmo quando uma atualização **substitui** o recurso. Use as duas juntas em bancos de dados de produção.",
                    },
                    {
                        type: "code",
                        value: 'Resources:\n  BancoProd:\n    Type: AWS::RDS::DBInstance\n    DeletionPolicy: Snapshot            # snapshot antes de apagar\n    UpdateReplacePolicy: Snapshot       # snapshot se for substituído num update\n    Properties:\n      Engine: postgres\n      DBInstanceClass: db.t3.medium\n      AllocatedStorage: "20"\n\n  BucketLogs:\n    Type: AWS::S3::Bucket\n    DeletionPolicy: Retain              # mantém os logs mesmo apagando a stack',
                    },
                    {
                        type: "text",
                        value: "## 14. Nested stacks\n\nTemplates grandes ficam difíceis de manter. Com **nested stacks** (stacks aninhadas), você quebra a infraestrutura em templates menores e reutilizáveis (uma stack de VPC, uma de banco, uma de app) e os referencia como **recursos** do tipo `AWS::CloudFormation::Stack`, apontando o `TemplateURL` para o template no S3. A stack-mãe orquestra as filhas. É a forma recomendada de **reutilizar** componentes — diferente do export/import entre stacks, que serve para **compartilhar valores** entre stacks independentes.",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Rede:\n    Type: AWS::CloudFormation::Stack\n    Properties:\n      TemplateURL: https://s3.amazonaws.com/meus-templates/vpc.yaml\n\n  App:\n    Type: AWS::CloudFormation::Stack\n    Properties:\n      TemplateURL: https://s3.amazonaws.com/meus-templates/app.yaml\n      Parameters:\n        # passa um output da stack aninhada de rede para a de app\n        VpcId: !GetAtt Rede.Outputs.VpcId",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: template = YAML/JSON com seções (**só `Resources` é obrigatória**). `Ref` = ID/nome; `Fn::GetAtt` = atributo (ARN); `Fn::Sub` = string com `${variáveis}`. **Change set** = prévia das mudanças antes de aplicar. **Drift detection** = achar mudanças manuais. Falhou = **rollback automático**. **DeletionPolicy: Retain/Snapshot** protege dados. **Nested stacks** = reutilizar; **Export/ImportValue** = compartilhar entre stacks.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em um template do CloudFormation, qual é a única seção obrigatória?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Parameters",
                                isCorrect: false,
                            },
                            {
                                text: "Resources",
                                isCorrect: true,
                            },
                            {
                                text: "Outputs",
                                isCorrect: false,
                            },
                            {
                                text: "Mappings",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Antes de aplicar uma atualização em uma stack, uma equipe quer visualizar exatamente o que será adicionado, modificado ou substituído, sem alterar nenhum recurso. Qual recurso do CloudFormation faz isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Drift detection",
                                isCorrect: false,
                            },
                            {
                                text: "Change set",
                                isCorrect: true,
                            },
                            {
                                text: "Rollback automático",
                                isCorrect: false,
                            },
                            {
                                text: "Nested stack",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual função intrínseca retorna um atributo específico de um recurso, como o ARN de um bucket S3?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ref",
                                isCorrect: false,
                            },
                            {
                                text: "Fn::GetAtt",
                                isCorrect: true,
                            },
                            {
                                text: "Fn::Sub",
                                isCorrect: false,
                            },
                            {
                                text: "Fn::FindInMap",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma instância RDS de produção é gerenciada por uma stack. A equipe quer garantir que, se a stack for apagada, um backup do banco seja preservado automaticamente. O que configurar no recurso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "DeletionPolicy: Retain",
                                isCorrect: false,
                            },
                            {
                                text: "DeletionPolicy: Snapshot",
                                isCorrect: true,
                            },
                            {
                                text: "UpdateReplacePolicy: Delete",
                                isCorrect: false,
                            },
                            {
                                text: "DependsOn no recurso do banco",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um administrador alterou manualmente um security group pelo console, por fora do CloudFormation. Qual recurso identifica que o estado real dos recursos divergiu do que está no template?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Change set",
                                isCorrect: false,
                            },
                            {
                                text: "Drift detection",
                                isCorrect: true,
                            },
                            {
                                text: "Rollback trigger",
                                isCorrect: false,
                            },
                            {
                                text: "Fn::ImportValue",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS SAM",
                blocks: [
                    {
                        type: "text",
                        value: "# AWS SAM",
                    },
                    {
                        type: "quote",
                        value: "O **AWS SAM (Serverless Application Model)** é uma **extensão do CloudFormation** feita para aplicações **serverless**. Você declara funções Lambda, APIs e tabelas em **poucas linhas**, e o SAM **expande** isso para os recursos completos do CloudFormation no deploy. Tudo começa com uma única linha: `Transform: AWS::Serverless-2016-10-31`.",
                    },
                    {
                        type: "text",
                        value: "## 1. O que é o SAM\n\nEscrever uma API serverless em CloudFormation puro é verboso: uma função Lambda exige o recurso da função, o papel IAM, as permissões, a integração com o API Gateway, os métodos, o stage... O **SAM** resolve isso com **tipos de recurso enxutos** que, no deploy, são **transformados** (expandidos) no CloudFormation completo. Pontos-chave:\n\n- O SAM é um **superset do CloudFormation**: qualquer recurso CloudFormation normal também funciona num template SAM.\n- A transformação acontece por uma **macro** declarada em `Transform`.\n- Vem com uma **CLI própria** (`sam`) para **build**, **deploy** e **testes locais**.",
                    },
                    {
                        type: "text",
                        value: "## 2. Transform e os recursos serverless\n\nA linha **`Transform: AWS::Serverless-2016-10-31`** no topo do template é o que **habilita** a sintaxe SAM (sem ela, é um template CloudFormation comum). A partir daí você usa os tipos `AWS::Serverless::*`, e cada um expande para vários recursos:",
                    },
                    {
                        type: "table",
                        value: '[["Recurso SAM","Expande para","Para que serve"],["`AWS::Serverless::Function`","`AWS::Lambda::Function` + IAM Role + permissões + event sources","Uma função Lambda com seus gatilhos"],["`AWS::Serverless::Api`","`AWS::ApiGateway::RestApi` + Deployment + Stage","Uma API REST no API Gateway"],["`AWS::Serverless::HttpApi`","`AWS::ApiGatewayV2::*`","Uma HTTP API (mais simples/barata)"],["`AWS::Serverless::SimpleTable`","`AWS::DynamoDB::Table`","Tabela DynamoDB com chave primária"],["`AWS::Serverless::LayerVersion`","`AWS::Lambda::LayerVersion`","Um layer do Lambda"],["`AWS::Serverless::StateMachine`","`AWS::StepFunctions::StateMachine`","Um fluxo do Step Functions"]]',
                    },
                    {
                        type: "code",
                        value: 'AWSTemplateFormatVersion: "2010-09-09"\nTransform: AWS::Serverless-2016-10-31         # habilita a sintaxe SAM\nDescription: API serverless de exemplo\n\nResources:\n  ApiProdutos:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      CodeUri: ./src\n      Events:\n        ListarProdutos:\n          Type: Api                 # cria API Gateway + rota + permissão\n          Properties:\n            Path: /produtos\n            Method: get',
                    },
                    {
                        type: "text",
                        value: "## 3. AWS::Serverless::Function e os eventos\n\nO coração do SAM é o **`AWS::Serverless::Function`**. Além do código (`CodeUri`, `Handler`, `Runtime`), a propriedade **`Events`** declara **o que dispara a função**. Cada tipo de evento cria automaticamente o gatilho **e a permissão** necessária. Tipos comuns: `Api`, `HttpApi`, `S3`, `SNS`, `SQS`, `Schedule` (EventBridge/cron), `DynamoDB`, `Kinesis`.",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Processador:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: app.handler\n      Runtime: python3.13\n      CodeUri: ./src\n      MemorySize: 512\n      Timeout: 30\n      Environment:\n        Variables:\n          TABELA: !Ref Pedidos\n      Events:\n        HttpPost:\n          Type: Api\n          Properties:\n            Path: /pedidos\n            Method: post\n        Agendado:\n          Type: Schedule            # dispara por cron (EventBridge)\n          Properties:\n            Schedule: rate(1 hour)\n        Upload:\n          Type: S3                  # dispara em uploads no bucket\n          Properties:\n            Bucket: !Ref BucketEntrada\n            Events: s3:ObjectCreated:*",
                    },
                    {
                        type: "text",
                        value: "## 4. AWS::Serverless::Api e SimpleTable\n\nO **`AWS::Serverless::SimpleTable`** cria uma tabela DynamoDB simples (chave primária, cobrança on-demand) em poucas linhas — ótima para casos sem índices secundários complexos. Já o **`AWS::Serverless::Api`** é útil quando você precisa de configurações que os eventos `Api` implícitos não cobrem (um estágio nomeado, autorizadores, CORS, um arquivo OpenAPI).",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  MinhaApi:\n    Type: AWS::Serverless::Api\n    Properties:\n      StageName: prod\n      Cors: \"'*'\"\n\n  Pedidos:\n    Type: AWS::Serverless::SimpleTable\n    Properties:\n      PrimaryKey:\n        Name: id\n        Type: String\n\n  Funcao:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      CodeUri: ./src\n      Events:\n        Rota:\n          Type: Api\n          Properties:\n            RestApiId: !Ref MinhaApi   # usa a API explícita acima\n            Path: /pedidos\n            Method: get",
                    },
                    {
                        type: "text",
                        value: "## 5. Globals - propriedades comuns\n\nQuase toda função repete `Runtime`, `Timeout`, `MemorySize`, variáveis... A seção **`Globals`** define esses valores **uma vez** para todas as funções (ou APIs) do template, evitando repetição. Uma função pode **sobrescrever** um valor global no seu próprio bloco.",
                    },
                    {
                        type: "code",
                        value: "Globals:\n  Function:\n    Runtime: nodejs20.x\n    Timeout: 15\n    MemorySize: 256\n    Environment:\n      Variables:\n        LOG_LEVEL: info\n\nResources:\n  FuncaoA:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: a.handler            # herda runtime/timeout/memória dos Globals\n      CodeUri: ./a\n  FuncaoB:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: b.handler\n      MemorySize: 1024              # sobrescreve só a memória\n      CodeUri: ./b",
                    },
                    {
                        type: "text",
                        value: "## 6. Policy templates\n\nDar permissão a uma função sem escrever IAM na mão é o papel dos **policy templates**: atalhos prontos e com escopo mínimo para cenários comuns. Você passa em **`Policies`** o nome do template e o recurso-alvo, e o SAM gera a política IAM correta. Exemplos: `DynamoDBCrudPolicy`, `S3ReadPolicy`, `SQSPollerPolicy`, `SNSPublishMessagePolicy`.",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Funcao:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      CodeUri: ./src\n      Policies:\n        - DynamoDBCrudPolicy:         # CRUD só nesta tabela\n            TableName: !Ref Pedidos\n        - S3ReadPolicy:               # leitura só neste bucket\n            BucketName: !Ref BucketEntrada\n        - SQSPollerPolicy:\n            QueueName: !GetAtt Fila.QueueName",
                    },
                    {
                        type: "text",
                        value: "## 7. A CLI do SAM: build e deploy\n\nO fluxo de trabalho local usa a **`sam` CLI**:\n\n- **`sam init`**: cria um projeto a partir de um template de exemplo.\n- **`sam build`**: resolve dependências e monta os artefatos em `.aws-sam/build`.\n- **`sam deploy --guided`**: empacota o código no S3 (ou ECR), **cria um change set** e faz o deploy via CloudFormation, salvando as respostas em `samconfig.toml`.\n\nRepare: **por baixo, o SAM usa CloudFormation e change sets** — o mesmo motor da aula anterior.",
                    },
                    {
                        type: "code",
                        value: "# Cria um novo projeto interativo\nsam init\n\n# Instala dependências e monta os artefatos de build\nsam build\n\n# Empacota, cria o change set e faz o deploy (salva respostas em samconfig.toml)\nsam deploy --guided\n\n# Deploys seguintes reutilizam o samconfig.toml\nsam deploy",
                    },
                    {
                        type: "text",
                        value: "## 8. Testes locais com sam local\n\nUm diferencial do SAM é **rodar o Lambda e a API localmente** dentro de contêineres Docker, para testar antes de subir:\n\n- **`sam local invoke`**: invoca uma função uma vez com um evento de teste.\n- **`sam local start-api`**: sobe um API Gateway local em `http://127.0.0.1:3000`.\n- **`sam local generate-event`**: gera um payload de evento de exemplo (S3, SQS, API...).",
                    },
                    {
                        type: "code",
                        value: "# Invoca a função localmente com um evento de exemplo\nsam local invoke Processador --event evento.json\n\n# Gera um evento S3 de exemplo e salva em arquivo\nsam local generate-event s3 put > evento.json\n\n# Sobe a API inteira localmente na porta 3000\nsam local start-api",
                    },
                    {
                        type: "table",
                        value: '[["Comando","O que faz"],["`sam init`","Cria um projeto a partir de um template"],["`sam build`","Resolve dependências e monta os artefatos"],["`sam deploy --guided`","Empacota, cria change set e faz deploy via CloudFormation"],["`sam local invoke`","Invoca a função localmente (Docker)"],["`sam local start-api`","Sobe um API Gateway local"],["`sam validate`","Valida a sintaxe do template"]]',
                    },
                    {
                        type: "text",
                        value: "## 9. Deploy gradual com DeploymentPreference\n\nO SAM se integra ao **CodeDeploy** para o **deploy gradual** de funções Lambda. Com `AutoPublishAlias` (publica uma versão e move um alias a cada deploy) e `DeploymentPreference` (tipo `Canary` ou `Linear`), o tráfego migra aos poucos para a versão nova — assunto detalhado na aula de estratégias de deploy.",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Checkout:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      CodeUri: ./src\n      AutoPublishAlias: prod\n      DeploymentPreference:\n        Type: Canary10Percent5Minutes   # 10% por 5 min, depois 100%\n        Alarms:\n          - !Ref AlarmeErros",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: SAM = extensão serverless do CloudFormation, ligada por `Transform: AWS::Serverless-2016-10-31`. `Function`/`Api`/`SimpleTable` expandem para recursos completos. `Events` cria gatilho + permissão. `Globals` = propriedades comuns; **policy templates** = IAM pronto. CLI: `sam build`, `sam deploy --guided` (usa change sets), `sam local` testa em Docker. **Dica de prova**: template curto com Lambda + API e `Transform` no topo = SAM.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual linha no topo de um template habilita a sintaxe do AWS SAM?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Transform: AWS::Serverless-2016-10-31",
                                isCorrect: true,
                            },
                            {
                                text: "AWSTemplateFormatVersion: 2010-09-09",
                                isCorrect: false,
                            },
                            {
                                text: "Type: AWS::Serverless::Function",
                                isCorrect: false,
                            },
                            {
                                text: "Runtime: nodejs20.x",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Durante o deploy, no que o recurso AWS::Serverless::Function é expandido pelo SAM?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Apenas em uma função Lambda, sem mais nada",
                                isCorrect: false,
                            },
                            {
                                text: "Em uma função Lambda mais o papel IAM, as permissões e os event sources",
                                isCorrect: true,
                            },
                            {
                                text: "Em uma tabela DynamoDB",
                                isCorrect: false,
                            },
                            {
                                text: "Em uma instância EC2 com Docker",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual comando da SAM CLI executa uma função Lambda localmente, dentro de um contêiner, para testes?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "sam build",
                                isCorrect: false,
                            },
                            {
                                text: "sam deploy",
                                isCorrect: false,
                            },
                            {
                                text: "sam local invoke",
                                isCorrect: true,
                            },
                            {
                                text: "sam init",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor quer conceder a uma função permissões de CRUD em uma tabela DynamoDB específica, sem escrever uma política IAM na mão. Qual é a forma idiomática no SAM?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar um policy template, como DynamoDBCrudPolicy, apontando a tabela",
                                isCorrect: true,
                            },
                            {
                                text: "Declarar a permissão dentro de um bloco Globals",
                                isCorrect: false,
                            },
                            {
                                text: "Criar um AWS::Serverless::SimpleTable",
                                isCorrect: false,
                            },
                            {
                                text: "Adicionar um evento do tipo Api à função",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por baixo dos panos, como o comando sam deploy efetivamente provisiona a infraestrutura na AWS?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Chamando a API do EC2 diretamente para cada recurso",
                                isCorrect: false,
                            },
                            {
                                text: "Usando o CloudFormation, criando um change set e aplicando a stack",
                                isCorrect: true,
                            },
                            {
                                text: "Executando o Terraform internamente",
                                isCorrect: false,
                            },
                            {
                                text: "Enviando os arquivos por SFTP para um servidor",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "CI/CD com os serviços Code",
                blocks: [
                    {
                        type: "text",
                        value: "# CI/CD com os serviços Code",
                    },
                    {
                        type: "quote",
                        value: "**CI/CD** automatiza o caminho do commit até produção. Na AWS, quatro serviços cobrem esse fluxo: **CodeBuild** compila e testa (guiado pelo `buildspec.yml`), **CodeDeploy** implanta (guiado pelo `appspec`), **CodePipeline** orquestra tudo em **estágios**, e **CodeArtifact** guarda suas dependências. Saber qual serviço faz o quê — e qual arquivo o guia — é o que a prova cobra.",
                    },
                    {
                        type: "text",
                        value: "## 1. CI e CD\n\n- **CI (Continuous Integration)**: a cada push, o código é **compilado e testado** automaticamente, pegando erros cedo. É o papel do **CodeBuild**.\n- **CD (Continuous Delivery/Deployment)**: as mudanças que passaram nos testes são **implantadas** automaticamente (em *delivery*, com uma aprovação manual antes de produção; em *deployment*, direto). É o papel do **CodeDeploy** + **CodePipeline**.\n\nO **CodePipeline** é o maestro: encadeia os estágios (fonte → build → testes → deploy) e passa **artefatos** de um para o outro.",
                    },
                    {
                        type: "text",
                        value: "## 2. CodeBuild e o buildspec.yml\n\nO **CodeBuild** é um serviço de build **totalmente gerenciado**: sem servidor de CI para manter, você paga por **minuto de build**. Ele lê um arquivo **`buildspec.yml`** (na raiz do repositório, por padrão) que define **fases** de comandos:\n\n- **`install`**: instala runtimes e ferramentas.\n- **`pre_build`**: preparação (login em registries, `npm ci`, testes).\n- **`build`**: o build de fato.\n- **`post_build`**: empacotar, publicar imagem, notificar.\n\nA seção **`artifacts`** define o que sai do build; **`cache`** acelera builds futuros; **`env`** injeta variáveis (inclusive do Parameter Store e do Secrets Manager).",
                    },
                    {
                        type: "code",
                        value: 'version: 0.2\n\nenv:\n  variables:\n    NODE_ENV: production\n  parameter-store:\n    API_URL: /minha-app/api-url         # lê do SSM Parameter Store\n  secrets-manager:\n    DB_SENHA: prod/db:senha             # lê do Secrets Manager\n\nphases:\n  install:\n    runtime-versions:\n      nodejs: 20\n    commands:\n      - npm ci\n  pre_build:\n    commands:\n      - npm test                        # testes de CI\n  build:\n    commands:\n      - npm run build\n  post_build:\n    commands:\n      - echo "Build concluído em $(date)"\n\nartifacts:\n  files:\n    - "**/*"\n  base-directory: dist                  # o que segue para o próximo estágio\n\ncache:\n  paths:\n    - node_modules/**/*                 # acelera o próximo build',
                    },
                    {
                        type: "table",
                        value: '[["Fase","Momento","Uso típico"],["`install`","Início","Instalar runtimes e ferramentas"],["`pre_build`","Antes do build","Login em registry, `npm ci`, testes"],["`build`","Build","Compilar, empacotar"],["`post_build`","Após o build","Publicar imagem, enviar artefatos"],["`artifacts`","Saída","Arquivos que seguem para o próximo estágio"],["`cache`","Otimização","Diretórios reaproveitados entre builds"]]',
                    },
                    {
                        type: "quote",
                        value: "Dica de prova: se a questão mostrar fases `install`/`pre_build`/`build`/`post_build`, é um **`buildspec.yml`** do **CodeBuild**. Se mostrar hooks como `BeforeInstall`/`AfterAllowTraffic`, é um **`appspec`** do **CodeDeploy**. Não confunda os dois arquivos.",
                    },
                    {
                        type: "text",
                        value: "## 3. CodeDeploy e o appspec\n\nO **CodeDeploy** automatiza a **implantação** do artefato em três tipos de destino: **EC2/on-premises**, **Lambda** e **ECS**. Ele é guiado pelo arquivo **`appspec`** (`appspec.yml` para EC2/on-premises; `appspec.yaml`/JSON para Lambda e ECS), que define os **hooks** — scripts executados em cada fase do deploy — e, para Lambda/ECS, os recursos-alvo.\n\nDois **tipos de deploy**:\n\n- **In-place**: atualiza as instâncias existentes (só **EC2/on-premises**).\n- **Blue/green**: sobe um ambiente novo e troca o tráfego (EC2, **Lambda** e **ECS**).",
                    },
                    {
                        type: "table",
                        value: '[["Destino","Arquivo","Hooks principais"],["EC2 / on-premises","`appspec.yml`","`ApplicationStop`, `BeforeInstall`, `AfterInstall`, `ApplicationStart`, `ValidateService`"],["Lambda","`appspec.yaml`","`BeforeAllowTraffic`, `AfterAllowTraffic`"],["ECS","`appspec.yaml`","`BeforeInstall`, `AfterInstall`, `AfterAllowTestTraffic`, `BeforeAllowTraffic`, `AfterAllowTraffic`"]]',
                    },
                    {
                        type: "code",
                        value: "version: 0.0\nos: linux\nfiles:\n  - source: /\n    destination: /var/www/app         # onde o código é copiado na instância\nhooks:\n  ApplicationStop:\n    - location: scripts/parar.sh\n      timeout: 60\n  BeforeInstall:\n    - location: scripts/preparar.sh\n  AfterInstall:\n    - location: scripts/dependencias.sh\n  ApplicationStart:\n    - location: scripts/iniciar.sh\n  ValidateService:\n    - location: scripts/healthcheck.sh\n      timeout: 120",
                    },
                    {
                        type: "code",
                        value: "version: 0.0\nResources:\n  - MinhaFuncao:\n      Type: AWS::Lambda::Function\n      Properties:\n        Name: checkout\n        Alias: prod\n        CurrentVersion: 3\n        TargetVersion: 4              # muda o tráfego da versão 3 para a 4\nHooks:\n  - BeforeAllowTraffic: validacao-pre-trafego    # Lambda de validação\n  - AfterAllowTraffic: validacao-pos-trafego",
                    },
                    {
                        type: "text",
                        value: "## 4. CodePipeline\n\nO **CodePipeline** orquestra o fluxo em **estágios (stages)**, e cada estágio tem uma ou mais **ações (actions)**. As ações se agrupam em **categorias**: `Source`, `Build`, `Test`, `Deploy`, `Approval` e `Invoke`. Entre os estágios, os **artefatos** (código, build) são passados por um **bucket S3** que o pipeline gerencia. Fontes suportadas incluem **S3**, **Amazon ECR** e o **GitHub** (via conexão).",
                    },
                    {
                        type: "table",
                        value: '[["Categoria","Exemplo de provedor","O que faz"],["`Source`","S3, ECR, GitHub","Detecta e busca o código-fonte"],["`Build`","CodeBuild","Compila e testa"],["`Test`","CodeBuild, terceiros","Roda testes"],["`Deploy`","CodeDeploy, CloudFormation, ECS, Elastic Beanstalk","Implanta o artefato"],["`Approval`","Manual","Pausa esperando aprovação humana"],["`Invoke`","Lambda","Chama uma função para um passo customizado"]]',
                    },
                    {
                        type: "code",
                        value: 'Resources:\n  Pipeline:\n    Type: AWS::CodePipeline::Pipeline\n    Properties:\n      RoleArn: !GetAtt PapelPipeline.Arn\n      ArtifactStore:\n        Type: S3\n        Location: !Ref BucketArtefatos      # onde os artefatos trafegam\n      Stages:\n        - Name: Source\n          Actions:\n            - Name: Fonte\n              ActionTypeId: { Category: Source, Owner: AWS, Provider: S3, Version: "1" }\n              OutputArtifacts: [{ Name: Codigo }]\n              Configuration:\n                S3Bucket: !Ref BucketFonte\n                S3ObjectKey: app.zip\n        - Name: Build\n          Actions:\n            - Name: Compilar\n              ActionTypeId: { Category: Build, Owner: AWS, Provider: CodeBuild, Version: "1" }\n              InputArtifacts: [{ Name: Codigo }]\n              OutputArtifacts: [{ Name: Artefato }]\n              Configuration: { ProjectName: !Ref ProjetoBuild }\n        - Name: Deploy\n          Actions:\n            - Name: Implantar\n              ActionTypeId: { Category: Deploy, Owner: AWS, Provider: CodeDeploy, Version: "1" }\n              InputArtifacts: [{ Name: Artefato }]\n              Configuration: { ApplicationName: !Ref App, DeploymentGroupName: !Ref Grupo }',
                    },
                    {
                        type: "text",
                        value: "## 5. CodeArtifact\n\nO **CodeArtifact** é um **repositório de artefatos gerenciado**: hospeda suas dependências (**npm**, **PyPI**, **Maven**, **NuGet**...) e faz proxy/cache de repositórios públicos como o npmjs. Você organiza em **domínios** (que agrupam repositórios) e **repositórios**, e pode encadear **upstreams** (um repo interno que busca no público quando não tem o pacote). Benefícios: controle de quais versões entram, cache das públicas e integração com o CodeBuild.",
                    },
                    {
                        type: "code",
                        value: "# Autentica o npm no repositório do CodeArtifact (token temporário)\naws codeartifact login \\\n  --tool npm \\\n  --domain minha-empresa \\\n  --repository libs-internas\n\n# A partir daqui, o npm instala do CodeArtifact\nnpm install minha-lib-interna",
                    },
                    {
                        type: "text",
                        value: "## 6. E o CodeCommit?\n\nO **CodeCommit** é o serviço de repositório **Git** gerenciado da AWS. Atenção: na **versão 2.1** do guia oficial do exame DVA-C02, o **CodeCommit saiu de escopo** — a AWS deixou de aceitar novos clientes no serviço. Se você o vir citado em material antigo, saiba que **não é mais cobrado**. Nos fluxos atuais, a fonte do CodePipeline costuma ser **S3**, **ECR** ou **GitHub** (via conexão). Foque em **CodeBuild, CodeDeploy, CodePipeline e CodeArtifact**.",
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **CodeBuild** compila/testa via **`buildspec.yml`** (fases `install`→`pre_build`→`build`→`post_build`). **CodeDeploy** implanta via **`appspec`** (hooks; destinos EC2/Lambda/ECS; in-place ou blue/green). **CodePipeline** orquestra **estágios** com ações (Source/Build/Test/Deploy/Approval/Invoke) e passa artefatos por S3. **CodeArtifact** guarda dependências (npm/PyPI/Maven). **CodeCommit saiu de escopo na v2.1.**",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual arquivo guia um build do CodeBuild, com as fases install, pre_build, build e post_build?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "appspec.yml",
                                isCorrect: false,
                            },
                            {
                                text: "buildspec.yml",
                                isCorrect: true,
                            },
                            {
                                text: "template.yaml",
                                isCorrect: false,
                            },
                            {
                                text: "samconfig.toml",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um deploy do CodeDeploy para Lambda, quais hooks são executados em torno do deslocamento de tráfego para a nova versão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "BeforeInstall e AfterInstall",
                                isCorrect: false,
                            },
                            {
                                text: "ApplicationStart e ApplicationStop",
                                isCorrect: false,
                            },
                            {
                                text: "BeforeAllowTraffic e AfterAllowTraffic",
                                isCorrect: true,
                            },
                            {
                                text: "install e post_build",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que o CodePipeline usa para transferir a saída de um estágio (por exemplo, o resultado do build) para o estágio seguinte?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um volume EBS compartilhado entre os estágios",
                                isCorrect: false,
                            },
                            {
                                text: "Artefatos armazenados em um bucket S3",
                                isCorrect: true,
                            },
                            {
                                text: "Variáveis de ambiente do sistema operacional",
                                isCorrect: false,
                            },
                            {
                                text: "Uma tabela do DynamoDB",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual serviço AWS é um repositório de artefatos gerenciado para dependências como npm, PyPI e Maven?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "CodeBuild",
                                isCorrect: false,
                            },
                            {
                                text: "CodeArtifact",
                                isCorrect: true,
                            },
                            {
                                text: "CodeDeploy",
                                isCorrect: false,
                            },
                            {
                                text: "CodePipeline",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao montar um novo CodePipeline sob o escopo atual (v2.1) do exame DVA-C02, qual destes serviços de origem NÃO faz mais parte do escopo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Amazon S3",
                                isCorrect: false,
                            },
                            {
                                text: "GitHub",
                                isCorrect: false,
                            },
                            {
                                text: "Amazon ECR",
                                isCorrect: false,
                            },
                            {
                                text: "AWS CodeCommit",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Estratégias de deploy",
                blocks: [
                    {
                        type: "text",
                        value: "# Estratégias de deploy",
                    },
                    {
                        type: "quote",
                        value: "Toda mudança em produção é um risco. As **estratégias de deploy** existem para equilibrar três coisas: **downtime**, **custo** e **risco**. O guia da DVA-C02 destaca três nomes que você precisa dominar: **canary** (uma fração do tráfego primeiro), **blue/green** (dois ambientes e uma troca) e **rolling** (em lotes). Cada serviço (Elastic Beanstalk, CodeDeploy, ECS) implementa variações desses conceitos.",
                    },
                    {
                        type: "text",
                        value: "## 1. In-place vs blue/green\n\nHá duas filosofias de base:\n\n- **In-place** (no lugar): você atualiza as **instâncias existentes**. É mais barato (não duplica infra), mas há uma janela em que a app fica **indisponível ou com capacidade reduzida**, e o **rollback é mais lento** (reinstalar a versão antiga).\n- **Blue/green**: você sobe um ambiente **novo e paralelo** (o *green*) com a versão nova, testa e **redireciona o tráfego** do antigo (*blue*) para ele. Vantagens: **sem downtime** e **rollback instantâneo** (basta reapontar o tráfego para o *blue*). Custo maior: os dois ambientes coexistem durante a transição.",
                    },
                    {
                        type: "code",
                        value: "          +--------------+   100% do trafego\nUsuarios ------------->|  BLUE (v1)   |   <- ambiente atual\n          +--------------+\n          +--------------+   0% (em teste)\n          |  GREEN (v2)  |   <- ambiente novo\n          +--------------+\n   Cutover: reaponta o trafego BLUE -> GREEN\n   Rollback: reaponta de volta GREEN -> BLUE (instantaneo)",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","In-place","Blue/green"],["Infraestrutura","Reaproveita as instâncias atuais","Sobe um ambiente novo em paralelo"],["Downtime","Possível (capacidade reduzida)","Praticamente zero"],["Rollback","Mais lento (reinstalar versão antiga)","Instantâneo (reaponta o tráfego)"],["Custo no deploy","Menor","Maior (dois ambientes ativos)"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Traffic shifting: canary, linear e all-at-once\n\nQuando o deploy **desloca tráfego** para a versão nova (típico em Lambda e ECS via CodeDeploy), há três formas:\n\n- **Canary**: envia uma **fração** do tráfego (ex.: 10%) para a versão nova, **espera** um intervalo observando métricas e, se estiver tudo bem, manda os **100% restantes** de uma vez.\n- **Linear**: aumenta o tráfego em **incrementos iguais** a cada intervalo (ex.: +10% a cada minuto) até 100%.\n- **All-at-once**: joga **todo** o tráfego de uma vez (sem gradualismo).",
                    },
                    {
                        type: "table",
                        value: '[["Estratégia","Como desloca o tráfego","Risco","Tempo até 100%"],["Canary","Uma fração, espera, depois o resto","Baixo","Médio"],["Linear","Incrementos iguais em intervalos","Baixo","Maior"],["All-at-once","Tudo de uma vez","Alto","Imediato"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Deployment policies do Elastic Beanstalk\n\nO **Elastic Beanstalk** oferece cinco **políticas de deploy**, do mais arriscado/barato ao mais seguro/caro:\n\n- **All at once**: atualiza **todas** as instâncias ao mesmo tempo. Rápido e sem custo extra, mas com **downtime**.\n- **Rolling**: atualiza em **lotes**. Sem custo extra, mas a **capacidade cai** durante o processo.\n- **Rolling with additional batch**: sobe um **lote extra** de instâncias antes, mantendo a **capacidade total** durante o deploy.\n- **Immutable**: cria instâncias **novas** num novo Auto Scaling group e só troca depois que todas passam. **Mais seguro**, rollback fácil, porém mais **lento e caro**.\n- **Traffic splitting**: um **canary** do Beanstalk — envia uma fração do tráfego para as instâncias novas antes de promover.",
                    },
                    {
                        type: "table",
                        value: '[["Política","Mantém capacidade total?","Downtime","Custo extra"],["All at once","Não","**Sim**","Nenhum"],["Rolling","Não (cai durante o deploy)","Não","Nenhum"],["Rolling with additional batch","**Sim**","Não","Um lote extra temporário"],["Immutable","**Sim**","Não","Instâncias novas em paralelo"],["Traffic splitting","**Sim**","Não","Instâncias novas + split (canary)"]]',
                    },
                    {
                        type: "code",
                        value: "# .ebextensions/deploy.config\noption_settings:\n  aws:elasticbeanstalk:command:\n    # all-at-once | Rolling | RollingWithAdditionalBatch | Immutable | TrafficSplitting\n    DeploymentPolicy: Immutable\n    BatchSizeType: Percentage\n    BatchSize: 25              # tamanho do lote nas políticas rolling",
                    },
                    {
                        type: "text",
                        value: "## 4. CodeDeploy para Lambda: canary e linear\n\nPara **Lambda**, o CodeDeploy desloca o tráfego entre a versão atual e a nova por **pesos de alias**, usando configurações pré-definidas de **canary** ou **linear**. No SAM, isso é uma linha em `DeploymentPreference`. Os nomes seguem o padrão `Lambda<Canary|Linear><percentual><intervalo>`, e você pode ligar um **alarme** do CloudWatch para **rollback automático**.",
                    },
                    {
                        type: "code",
                        value: "Resources:\n  Checkout:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: index.handler\n      Runtime: nodejs20.x\n      CodeUri: ./src\n      AutoPublishAlias: prod\n      DeploymentPreference:\n        # 10% do tráfego por 5 min, depois o restante (canary)\n        Type: Canary10Percent5Minutes\n        # alternativa linear: +10% a cada 10 min\n        # Type: Linear10PercentEvery10Minutes\n        Alarms:\n          - !Ref AlarmeErros5xx      # rollback automático se disparar\n        Hooks:\n          PreTraffic: !Ref ValidaPreTrafego\n          PostTraffic: !Ref ValidaPosTrafego",
                    },
                    {
                        type: "table",
                        value: '[["Configuração (CodeDeploy Lambda)","Comportamento"],["`LambdaAllAtOnce`","Todo o tráfego de uma vez"],["`LambdaCanary10Percent5Minutes`","10% por 5 min, depois 100%"],["`LambdaCanary10Percent30Minutes`","10% por 30 min, depois 100%"],["`LambdaLinear10PercentEvery1Minute`","+10% a cada 1 min"],["`LambdaLinear10PercentEvery10Minutes`","+10% a cada 10 min"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. CodeDeploy para EC2 e deploys de ECS\n\nEm **EC2/on-premises**, o CodeDeploy usa configurações por **quantidade de instâncias**: `CodeDeployDefault.AllAtOnce`, `HalfAtATime` e `OneAtATime`, além de suportar **blue/green** trocando o Auto Scaling group por trás de um load balancer. Em **ECS**, o padrão nativo é o **rolling update** do próprio serviço; com o **CodeDeploy** você ganha o **blue/green**, subindo uma nova revisão da task e trocando o *target group* do ALB (com um hook de tráfego de teste antes do cutover).",
                    },
                    {
                        type: "code",
                        value: "aws deploy create-deployment \\\n  --application-name minha-app \\\n  --deployment-group-name prod \\\n  --deployment-config-name CodeDeployDefault.OneAtATime \\\n  --revision revisionType=S3,s3Location={bucket=artefatos,key=app.zip,bundleType=zip}",
                    },
                    {
                        type: "code",
                        value: "version: 0.0\nResources:\n  - TargetService:\n      Type: AWS::ECS::Service\n      Properties:\n        TaskDefinition: arn:aws:ecs:us-east-1:123456789012:task-definition/app:8\n        LoadBalancerInfo:\n          ContainerName: app\n          ContainerPort: 8080\nHooks:\n  - AfterAllowTestTraffic: valida-antes-do-cutover   # testa no target group verde",
                    },
                    {
                        type: "text",
                        value: "## 6. Escolhendo pelo trade-off\n\nNão existe estratégia melhor em absoluto — existe a certa para o seu requisito. O eixo é sempre **downtime × custo × risco × velocidade de rollback**:\n\n- Precisa de **zero downtime e rollback instantâneo**, e custo não é problema → **blue/green** (ou **immutable** no Beanstalk).\n- Quer **testar com tráfego real** e reduzir o raio de impacto → **canary**.\n- Quer **economizar** e tolera capacidade reduzida por um tempo → **rolling**.\n- Ambiente simples, downtime aceitável (dev/teste) → **all-at-once**.",
                    },
                    {
                        type: "table",
                        value: '[["Estratégia","Downtime","Custo","Rollback","Quando escolher"],["All-at-once","Alto","Baixo","Lento","Dev/teste, downtime tolerável"],["Rolling","Baixo","Baixo","Médio","Economizar, capacidade reduzida OK"],["Canary","Baixo","Médio","Rápido","Validar com tráfego real, reduzir risco"],["Blue/green / Immutable","Zero","Alto","Instantâneo","Produção crítica, sem downtime"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **in-place** = barato, com downtime, rollback lento; **blue/green** = dois ambientes, zero downtime, rollback instantâneo, mais caro. **Canary** = fração, espera, resto; **linear** = incrementos iguais; **all-at-once** = tudo junto. **Beanstalk**: all-at-once, rolling, rolling with additional batch (mantém capacidade), immutable (mais seguro), traffic splitting (canary). **CodeDeploy Lambda**: canary/linear por peso de alias, com rollback por alarme do CloudWatch.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual abordagem de deploy sobe um ambiente novo e paralelo com a versão nova e depois redireciona o tráfego para ele, permitindo rollback instantâneo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "In-place",
                                isCorrect: false,
                            },
                            {
                                text: "Blue/green",
                                isCorrect: true,
                            },
                            {
                                text: "Rolling",
                                isCorrect: false,
                            },
                            {
                                text: "All-at-once",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um deploy do tipo canary (deslocamento de tráfego), como o tráfego é movido para a nova versão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Todo o tráfego de uma só vez",
                                isCorrect: false,
                            },
                            {
                                text: "Uma fração primeiro, aguarda e observa, depois os 100% restantes",
                                isCorrect: true,
                            },
                            {
                                text: "Em incrementos iguais a cada intervalo fixo",
                                isCorrect: false,
                            },
                            {
                                text: "Nunca muda: permanece dividido para sempre",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual política de deploy do Elastic Beanstalk cria um conjunto totalmente novo de instâncias em um novo Auto Scaling group e é considerada a mais segura (embora mais lenta e cara)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Rolling",
                                isCorrect: false,
                            },
                            {
                                text: "All at once",
                                isCorrect: false,
                            },
                            {
                                text: "Immutable",
                                isCorrect: true,
                            },
                            {
                                text: "Rolling with additional batch",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual política do Elastic Beanstalk mantém a capacidade total durante o deploy adicionando um lote extra de instâncias temporariamente, sem custo permanente adicional?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "All at once",
                                isCorrect: false,
                            },
                            {
                                text: "Rolling",
                                isCorrect: false,
                            },
                            {
                                text: "Rolling with additional batch",
                                isCorrect: true,
                            },
                            {
                                text: "Immutable",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um deploy de Lambda via CodeDeploy deve enviar 10% do tráfego para a nova versão a cada minuto, até chegar a 100%. Qual configuração de deployment atende a isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "LambdaCanary10Percent5Minutes",
                                isCorrect: false,
                            },
                            {
                                text: "LambdaLinear10PercentEvery1Minute",
                                isCorrect: true,
                            },
                            {
                                text: "LambdaAllAtOnce",
                                isCorrect: false,
                            },
                            {
                                text: "CodeDeployDefault.OneAtATime",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Containers e Elastic Beanstalk",
                blocks: [
                    {
                        type: "text",
                        value: "# Containers e Elastic Beanstalk",
                    },
                    {
                        type: "quote",
                        value: "Quando a aplicação é um **contêiner**, três serviços entram em cena: o **ECR** guarda a imagem, o **ECS** roda os contêineres (com **Fargate**, sem servidor, ou com **EC2**, usando instâncias suas) e o **Elastic Beanstalk** é o atalho PaaS que provisiona tudo por você a partir do código. Saber quando usar cada um — e o que é do dev, não do infra — é o foco desta aula.",
                    },
                    {
                        type: "text",
                        value: "## 1. Amazon ECR\n\nO **Amazon ECR (Elastic Container Registry)** é o **registro de imagens Docker** gerenciado da AWS — o equivalente privado ao Docker Hub. Você **empurra (push)** imagens para ele, e o ECS/EKS/Lambda **puxa (pull)** na hora de rodar. Como todo serviço AWS, o acesso é por **IAM**: antes de `docker push`/`pull`, você autentica o Docker com um **token temporário** obtido via `aws ecr get-login-password`.",
                    },
                    {
                        type: "code",
                        value: "# 1) Autentica o Docker no seu registry ECR (token válido por 12h)\naws ecr get-login-password --region us-east-1 \\\n  | docker login --username AWS \\\n      --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com\n\n# 2) Marca a imagem local com o endereço do repositório ECR\ndocker tag minha-app:latest \\\n  123456789012.dkr.ecr.us-east-1.amazonaws.com/minha-app:latest\n\n# 3) Envia a imagem para o ECR\ndocker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/minha-app:latest",
                    },
                    {
                        type: "text",
                        value: "Recursos do ECR que aparecem na prova:\n\n- **Image scanning**: varredura de **vulnerabilidades** nas imagens (básico, ou avançado via Amazon Inspector).\n- **Lifecycle policies**: regras para **expirar imagens antigas** automaticamente e economizar armazenamento.\n- **Criptografia**: imagens criptografadas em repouso; repositórios podem ser **privados** ou **públicos**.\n- **Replicação** entre regiões e integração direta com **ECS**, **EKS** e **Lambda** (imagem de contêiner).",
                    },
                    {
                        type: "text",
                        value: "## 2. Amazon ECS\n\nO **Amazon ECS (Elastic Container Service)** é o orquestrador de contêineres da AWS. Quatro conceitos formam a base:\n\n- **Task definition**: o **projeto** (blueprint) da aplicação, em JSON. Define **quais contêineres** rodam juntos, a **imagem** (do ECR), CPU/memória, portas, variáveis, logs e os papéis IAM.\n- **Task**: uma **instância em execução** de uma task definition (um ou mais contêineres rodando juntos).\n- **Service**: mantém um número desejado de tasks **sempre no ar**, recria as que morrem e integra com um **load balancer**.\n- **Cluster**: o agrupamento lógico onde as tasks rodam.",
                    },
                    {
                        type: "code",
                        value: '{\n  "family": "minha-app",\n  "networkMode": "awsvpc",\n  "requiresCompatibilities": ["FARGATE"],\n  "cpu": "256",\n  "memory": "512",\n  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",\n  "taskRoleArn": "arn:aws:iam::123456789012:role/appTaskRole",\n  "containerDefinitions": [\n    {\n      "name": "app",\n      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/minha-app:latest",\n      "portMappings": [{ "containerPort": 8080 }],\n      "environment": [{ "name": "LOG_LEVEL", "value": "info" }],\n      "logConfiguration": {\n        "logDriver": "awslogs",\n        "options": {\n          "awslogs-group": "/ecs/minha-app",\n          "awslogs-region": "us-east-1",\n          "awslogs-stream-prefix": "app"\n        }\n      }\n    }\n  ]\n}',
                    },
                    {
                        type: "code",
                        value: '# Registra uma nova revisão da task definition\naws ecs register-task-definition --cli-input-json file://task-def.json\n\n# Cria um service que mantém 3 tasks rodando atrás de um ALB (Fargate)\naws ecs create-service \\\n  --cluster meu-cluster \\\n  --service-name minha-app \\\n  --task-definition minha-app \\\n  --desired-count 3 \\\n  --launch-type FARGATE \\\n  --network-configuration "awsvpcConfiguration={subnets=[subnet-0a1b2c],securityGroups=[sg-0a1b2c],assignPublicIp=ENABLED}"',
                    },
                    {
                        type: "text",
                        value: "## 3. Task role vs execution role\n\nDois papéis IAM na task definition — **muito cobrado**:\n\n- **Task execution role** (`executionRoleArn`): usada pelo **agente do ECS/Fargate** para **puxar a imagem do ECR** e **enviar logs** ao CloudWatch. É a permissão da **plataforma**, não do seu código.\n- **Task role** (`taskRoleArn`): as permissões do **seu aplicativo** dentro do contêiner (ler um bucket S3, gravar no DynamoDB). É o equivalente à **execution role** do Lambda.",
                    },
                    {
                        type: "table",
                        value: '[["Papel","Quem usa","Para quê"],["Task **execution** role","O agente ECS/Fargate","Puxar imagem do ECR, enviar logs ao CloudWatch"],["Task role","Seu código no contêiner","Acessar serviços AWS (S3, DynamoDB, etc.)"]]',
                    },
                    {
                        type: "text",
                        value: "## 4. Fargate vs EC2 launch type\n\nO ECS roda de dois jeitos (**launch types**):\n\n- **EC2**: você **provisiona e gerencia** as instâncias EC2 que formam o cluster (patch, escala, capacidade). Mais controle e, em uso constante, pode sair mais barato.\n- **Fargate**: **serverless** — você **não gerencia servidores**. Diz a CPU/memória da task e a AWS roda por você, cobrando por task. Menos controle, muito menos operação.\n\nPara o **dev**, o ponto é: com **Fargate você não pensa em instâncias**; com **EC2** o time é responsável pela frota.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Fargate","EC2 launch type"],["Gerência de servidores","**Nenhuma** (serverless)","Você administra as instâncias"],["Cobrança","Por vCPU/memória da task","Pelas instâncias EC2 (rodando ou não)"],["Patch do SO","AWS","Você"],["Controle/customização","Menor","Maior (GPU, tipos específicos)"],["Melhor para","Cargas variáveis, menos operação","Uso constante, controle fino de custo"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. AWS Elastic Beanstalk\n\nO **Elastic Beanstalk** é o **PaaS** da AWS: você **envia o código** (um `.zip`, um `.jar`, uma imagem Docker) e ele **provisiona e gerencia** a infraestrutura — EC2, Auto Scaling, Elastic Load Balancer, security groups, CloudWatch — seguindo boas práticas. Conceitos:\n\n- **Application**: o container lógico do seu projeto.\n- **Environment**: uma versão implantada e rodando (ex.: `prod`, `dev`). Tem dois **tiers**: **web server** (atende HTTP) e **worker** (processa uma fila SQS).\n- **Platform**: a stack gerenciada (Node.js, Python, Java, .NET, Go, PHP, Ruby, **Docker**).\n\nVocê **não paga pelo Beanstalk** em si, só pelos recursos que ele cria.",
                    },
                    {
                        type: "text",
                        value: "## 6. .ebextensions - configurando o ambiente\n\nPara customizar o ambiente (variáveis, pacotes, comandos, recursos extras), você adiciona arquivos **`.config`** (YAML/JSON) numa pasta **`.ebextensions/`** na raiz do código. Eles definem `option_settings` (opções do ambiente) e podem até criar recursos AWS adicionais. É a forma de ajustar o Beanstalk sem sair do modelo PaaS.",
                    },
                    {
                        type: "code",
                        value: "# .ebextensions/ambiente.config\noption_settings:\n  aws:elasticbeanstalk:application:environment:\n    LOG_LEVEL: info\n    TABELA: produtos\n  aws:autoscaling:asg:\n    MinSize: 2\n    MaxSize: 6\n  aws:elasticbeanstalk:environment:\n    EnvironmentType: LoadBalanced\n\npackages:\n  yum:\n    git: []                # instala pacotes do SO na instância",
                    },
                    {
                        type: "text",
                        value: "## 7. Beanstalk com Docker e a eb CLI\n\nO Beanstalk também roda **contêineres**: na plataforma Docker, ele lê um `Dockerfile` ou um `Dockerrun.aws.json` (que aponta a imagem, inclusive do **ECR**). O ciclo de trabalho usa a **`eb` CLI**:",
                    },
                    {
                        type: "code",
                        value: "# Inicializa a aplicação Beanstalk (escolhe região e plataforma)\neb init -p docker minha-app\n\n# Cria um ambiente e faz o primeiro deploy\neb create prod-env\n\n# Deploys seguintes enviam a nova versão do código\neb deploy\n\n# Abre a URL do ambiente no navegador\neb open",
                    },
                    {
                        type: "text",
                        value: "## 8. Beanstalk vs CloudFormation\n\nOs dois provisionam infraestrutura, mas com filosofias diferentes:\n\n- **Elastic Beanstalk** é **opinativo** e focado em **aplicações web**: você entrega código e ele decide a arquitetura (EC2 + ELB + Auto Scaling). Rápido, ideal para quem quer subir uma app **sem virar especialista em infra**. Por baixo, o próprio Beanstalk **usa CloudFormation**.\n- **CloudFormation** é **genérico** e de **baixo nível**: você descreve **qualquer** recurso AWS, com controle total. Mais poderoso e verboso, ideal quando a arquitetura foge do padrão web.\n\nRegra prática: **precisa de agilidade para uma app web padrão → Beanstalk**; **precisa de controle total sobre recursos variados → CloudFormation** (ou **SAM**, para serverless).",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Elastic Beanstalk","CloudFormation"],["Nível","Alto (PaaS opinativo)","Baixo (IaC genérico)"],["Você fornece","O código da aplicação","Um template de todos os recursos"],["Controle","Menor (arquitetura pronta)","Total (qualquer recurso AWS)"],["Curva de uso","Rápida","Mais íngreme"],["Por baixo dos panos","Usa CloudFormation","É o próprio motor de IaC"]]',
                    },
                    {
                        type: "quote",
                        value: "Cheat sheet: **ECR** = registro de imagens (autentica com `get-login-password` antes do `docker push`). **ECS**: task definition (blueprint) → task (execução) → service (mantém no ar). **Execution role** puxa imagem/logs; **task role** dá permissão ao seu código. **Fargate** = sem servidores; **EC2 launch type** = você gerencia a frota. **Beanstalk** = PaaS (código → infra, usa CloudFormation por baixo, customiza com `.ebextensions`). Beanstalk para agilidade; CloudFormation para controle total.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Antes de executar docker push para o Amazon ECR, o que o desenvolvedor precisa fazer?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Nada, pois o ECR é público por padrão",
                                isCorrect: false,
                            },
                            {
                                text: "Autenticar o Docker usando um token obtido com aws ecr get-login-password",
                                isCorrect: true,
                            },
                            {
                                text: "Criar uma instância EC2 para hospedar o registry",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar um NAT gateway na VPC",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma task definition do ECS, qual papel o agente do ECS/Fargate usa para puxar a imagem do ECR e enviar logs ao CloudWatch?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A task role",
                                isCorrect: false,
                            },
                            {
                                text: "A task execution role",
                                isCorrect: true,
                            },
                            {
                                text: "O instance profile do desenvolvedor",
                                isCorrect: false,
                            },
                            {
                                text: "Uma resource-based policy no contêiner",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer rodar contêineres no ECS sem provisionar nem gerenciar nenhuma instância EC2. Qual launch type atende a esse requisito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "EC2 launch type",
                                isCorrect: false,
                            },
                            {
                                text: "Fargate",
                                isCorrect: true,
                            },
                            {
                                text: "Worker tier do Elastic Beanstalk",
                                isCorrect: false,
                            },
                            {
                                text: "On-premises",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Onde você coloca os arquivos de configuração para customizar um ambiente do Elastic Beanstalk (variáveis de ambiente, pacotes, opções)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Em um buildspec.yml",
                                isCorrect: false,
                            },
                            {
                                text: "Em uma pasta .ebextensions/ com arquivos .config",
                                isCorrect: true,
                            },
                            {
                                text: "Em um appspec.yml",
                                isCorrect: false,
                            },
                            {
                                text: "Em um samconfig.toml",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor precisa de controle total e de baixo nível para provisionar como código um conjunto incomum de recursos AWS. Entre Elastic Beanstalk e CloudFormation, qual se encaixa, e por quê?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Elastic Beanstalk, porque dá controle sobre cada recurso individualmente",
                                isCorrect: false,
                            },
                            {
                                text: "CloudFormation, porque é um serviço de IaC genérico capaz de descrever qualquer recurso AWS",
                                isCorrect: true,
                            },
                            {
                                text: "Elastic Beanstalk, porque o CloudFormation só faz serverless",
                                isCorrect: false,
                            },
                            {
                                text: "CloudFormation, porque não pode ser usado para aplicações web",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 8 - Observabilidade e otimização",
        aulas: [
            {
                titulo: "Amazon CloudWatch",
                blocks: [
                    {
                        type: "text",
                        value: "# Amazon CloudWatch",
                    },
                    {
                        type: "quote",
                        value: "O **Amazon CloudWatch** é a plataforma de **observabilidade** da AWS: ele guarda os **logs** das suas aplicações, coleta **métricas** (suas e dos serviços AWS), dispara **alarmes** quando um valor passa de um limite e deixa você investigar tudo com o **Logs Insights**. No Domínio 4 da DVA-C02 ele é a ferramenta central para **monitorar e diagnosticar** o que a sua aplicação está fazendo.",
                    },
                    {
                        type: "text",
                        value: "## 1. Os três blocos que a prova cobra\n\nO CloudWatch é grande, mas para a DVA você precisa dominar três peças e como elas se ligam:\n\n- **Logs**: o texto que sua aplicação emite (organizado em *log groups* e *log streams*).\n- **Métricas**: séries numéricas ao longo do tempo (latência, erros, invocações), organizadas em *namespaces* e identificadas por *dimensions*.\n- **Alarmes**: observam uma métrica e disparam uma **ação** (tipicamente um SNS) quando ela cruza um *threshold*.\n\nPor cima disso, o **Logs Insights** consulta os logs com uma linguagem própria, e a **resolução** define de quanto em quanto tempo um ponto de métrica é registrado.",
                    },
                    {
                        type: "text",
                        value: "## 2. CloudWatch Logs: log groups e log streams\n\nOs logs têm três níveis, um dentro do outro:\n\n- **Log event** (evento de log): um único registro, com **timestamp** e a **mensagem**.\n- **Log stream** (fluxo): uma sequência de eventos vinda da **mesma origem** (uma instância do Lambda, um host EC2, um contêiner).\n- **Log group** (grupo): um conjunto de streams que **compartilham** a mesma configuração de **retenção**, permissões e métricas de filtro. É no grupo que você configura tudo.\n\nO Lambda, por exemplo, cria automaticamente o log group `/aws/lambda/<nome-da-funcao>` e, dentro dele, um log stream por ambiente de execução.",
                    },
                    {
                        type: "table",
                        value: '[["Nível","O que é","Exemplo"],["Log group","Container de streams; guarda retenção e permissões","`/aws/lambda/checkout`"],["Log stream","Sequência de eventos da mesma origem","`2026/07/04/[$LATEST]a1b2c3`"],["Log event","Um registro com timestamp e mensagem","`2026-07-04T12:00:00Z INFO pedido ok`"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. Retenção: o detalhe de custo que cai na prova\n\nPor **padrão**, um log group **nunca expira** (retenção *indefinida*). Ou seja: se você não configurar nada, os logs se acumulam para sempre e a **conta de armazenamento cresce sem parar**. A recomendação é sempre definir uma **política de retenção**, que aceita valores de **1 dia a 10 anos** (1, 3, 5, 7, 14, 30, 60, 90, 365, 3653 dias, etc.).",
                    },
                    {
                        type: "code",
                        value: 'aws logs create-log-group --log-group-name /minha-app/prod\n\n# Sem esta política, a retenção fica em "nunca expira" (custo cresce para sempre)\naws logs put-retention-policy \\\n  --log-group-name /minha-app/prod \\\n  --retention-in-days 30\n\n# Acompanha os eventos em tempo real (util no troubleshooting)\naws logs tail /minha-app/prod --follow',
                    },
                    {
                        type: "text",
                        value: '## 4. Métricas: namespaces e dimensions\n\nUma **métrica** é uma série de pontos numéricos no tempo (por exemplo, a latência a cada minuto). Duas ideias definem *qual* métrica é qual:\n\n- **Namespace**: um \\"container\\" que agrupa métricas. Os serviços AWS usam o prefixo `AWS/` (`AWS/Lambda`, `AWS/EC2`, `AWS/ApiGateway`). Nas suas métricas customizadas, você escolhe o nome (`MinhaApp/Pedidos`).\n- **Dimension**: um par **chave-valor** que qualifica a métrica (por exemplo, `Servico=checkout`). Uma métrica pode ter até **30 dimensions**.\n\nO ponto-chave: uma métrica é **identificada de forma única** pela combinação de **namespace + nome + conjunto de dimensions**. Trocar uma dimension cria, na prática, uma métrica diferente.',
                    },
                    {
                        type: "table",
                        value: '[["Conceito","Papel","Exemplo"],["Namespace","Agrupa métricas relacionadas","`AWS/Lambda`, `MinhaApp/Pedidos`"],["Nome da métrica","O que está sendo medido","`Invocations`, `LatenciaMs`"],["Dimension","Par chave-valor que qualifica a métrica","`FunctionName=checkout`, `Ambiente=prod`"],["Identidade da métrica","Namespace + nome + dimensions","Trocar a dimension = outra métrica"]]',
                    },
                    {
                        type: "text",
                        value: "## 5. Métricas padrão vs customizadas\n\n- **Métricas padrão** (predefinidas): a AWS **publica sozinha**, sem você configurar nada. Cada serviço tem as suas (o Lambda publica `Invocations`, `Errors`, `Duration`, `Throttles`; o API Gateway publica `4XXError`, `5XXError`, `Latency`).\n- **Métricas customizadas**: as que **você** publica com a API **`PutMetricData`**, para medir o que o serviço não mede (KPIs de negócio, contadores da sua lógica).\n\nUma pegadinha clássica: a **EC2 não publica memória nem uso de disco** por dentro do sistema operacional. De fora, a AWS não enxerga isso. Para ter essas métricas você instala o **CloudWatch Agent**, que as envia como **métricas customizadas**.",
                    },
                    {
                        type: "code",
                        value: '# Publicando uma metrica customizada pela CLI (com dimensions)\naws cloudwatch put-metric-data \\\n  --namespace "MinhaApp/Pedidos" \\\n  --metric-name PedidosProcessados \\\n  --unit Count \\\n  --value 1 \\\n  --dimensions Servico=checkout,Ambiente=prod',
                    },
                    {
                        type: "text",
                        value: "## 6. PutMetricData pelo SDK\n\nNo código, você usa o comando **`PutMetricData`** do SDK. Repare que `MetricData` é uma **lista**: você pode enviar várias métricas (e vários pontos) numa só chamada, o que economiza requisições.",
                    },
                    {
                        type: "code",
                        value: 'const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");\nconst cw = new CloudWatchClient({});\n\nawait cw.send(new PutMetricDataCommand({\n  Namespace: "MinhaApp/Pedidos",\n  MetricData: [\n    {\n      MetricName: "PedidosProcessados",\n      Unit: "Count",\n      Value: 1,\n      Dimensions: [\n        { Name: "Servico", Value: "checkout" },\n        { Name: "Ambiente", Value: "prod" },\n      ],\n    },\n  ],\n}));',
                    },
                    {
                        type: "text",
                        value: '## 7. Resolução padrão vs alta resolução\n\nA **resolução** é de quanto em quanto tempo um ponto é armazenado:\n\n- **Resolução padrão**: um ponto por **60 segundos** (1 minuto). É o default de `PutMetricData`.\n- **Alta resolução** (*high-resolution*): um ponto a cada **1 segundo**. Você ativa passando **`StorageResolution=1`**. Serve para cargas que mudam rápido e onde 1 minuto \\"esconde\\" o pico.\n\nQuem publica em alta resolução também pode criar **alarmes de alta resolução**, com período de **10 ou 30 segundos** (os alarmes padrão usam múltiplos de 60 s).',
                    },
                    {
                        type: "code",
                        value: '// Metrica de ALTA RESOLUCAO: um ponto por segundo\nawait cw.send(new PutMetricDataCommand({\n  Namespace: "MinhaApp/Pedidos",\n  MetricData: [\n    {\n      MetricName: "LatenciaMs",\n      Value: 42.5,\n      Unit: "Milliseconds",\n      StorageResolution: 1, // 1 = alta resolucao; o padrao e 60\n    },\n  ],\n}));',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Resolução padrão","Alta resolução"],["Intervalo do ponto","60 segundos","1 segundo"],["Como ativar","Default","`StorageResolution=1`"],["Período mínimo do alarme","60 segundos","10 ou 30 segundos"],["Quando usar","A maioria dos casos","Picos rápidos, tráfego que muda em segundos"]]',
                    },
                    {
                        type: "text",
                        value: "## 8. Alarmes e ações\n\nUm **alarme** observa uma métrica e tem **três estados**: **OK**, **ALARM** e **INSUFFICIENT_DATA** (dados insuficientes). Você define:\n\n- **Threshold** e **comparison operator** (ex.: `> 10`);\n- **Period** (o intervalo de cada avaliação) e **evaluation periods** (quantos intervalos considerar);\n- **Datapoints to alarm** (`M de N`): quantos pontos precisam violar para disparar, reduzindo falso positivo.\n\nAo entrar em ALARM, o alarme executa uma **ação**. As mais cobradas: notificar um tópico **SNS** (que avisa a equipe por e-mail/SMS ou aciona um Lambda), disparar um **Auto Scaling**, ou uma **ação de EC2/Systems Manager**.",
                    },
                    {
                        type: "code",
                        value: 'aws cloudwatch put-metric-alarm \\\n  --alarm-name erros-checkout-altos \\\n  --namespace "MinhaApp/Pedidos" \\\n  --metric-name Erros \\\n  --statistic Sum \\\n  --period 60 \\\n  --evaluation-periods 3 \\\n  --datapoints-to-alarm 2 \\\n  --threshold 10 \\\n  --comparison-operator GreaterThanThreshold \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:alertas-oncall',
                    },
                    {
                        type: "text",
                        value: "## 9. CloudWatch Logs Insights\n\nO **Logs Insights** consulta os seus logs com uma linguagem própria (parecida com um *pipeline*): você encadeia comandos com `|`. Os principais são **`fields`** (escolhe colunas), **`filter`** (filtra linhas), **`stats`** (agrega, com `count`, `avg`, `sum`), **`sort`** e **`limit`**. É a ferramenta para **investigar um incidente**: contar erros, agregar latência, achar a linha exata.",
                    },
                    {
                        type: "code",
                        value: "fields @timestamp, @message, @logStream\n| filter @message like /ERROR/\n| stats count(*) as erros by bin(5m)\n| sort erros desc\n| limit 20",
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova.** Retenção padrão de log group = **nunca expira** (configure!). Métrica é única por **namespace + nome + dimensions**. Métrica sua = **`PutMetricData`**. **Alta resolução** = `StorageResolution=1` (1 s). Memória/disco da EC2 = **CloudWatch Agent** (métrica customizada). Alarme dispara **ação** (geralmente **SNS**). Consulta em log = **Logs Insights**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a política de retenção padrão de um log group recém-criado no CloudWatch Logs?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Os logs nunca expiram (retenção indefinida) até você configurar uma política.",
                                isCorrect: true,
                            },
                            {
                                text: "Os logs são apagados automaticamente após 30 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "Os logs são apagados após 90 dias, igual ao histórico do CloudTrail.",
                                isCorrect: false,
                            },
                            {
                                text: "Os logs expiram em 24 horas por padrão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No CloudWatch, o que identifica uma métrica de forma única?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Apenas o nome da métrica.",
                                isCorrect: false,
                            },
                            {
                                text: "A combinação de namespace, nome da métrica e o conjunto de dimensions.",
                                isCorrect: true,
                            },
                            {
                                text: "O ARN da conta que a publicou.",
                                isCorrect: false,
                            },
                            {
                                text: "O log group ao qual a métrica pertence.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação precisa publicar uma métrica customizada com granularidade de 1 segundo, em vez do 1 minuto padrão. O que deve ser feito na chamada de PutMetricData?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Definir StorageResolution=1 no ponto da métrica.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o valor de evaluation-periods do alarme.",
                                isCorrect: false,
                            },
                            {
                                text: "Habilitar Detailed Monitoring na conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir o Period do namespace como 1.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe percebe que as métricas de uso de memória RAM das instâncias EC2 não aparecem no CloudWatch. Por quê, e como resolver?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A EC2 não publica memória por dentro do SO; é preciso instalar o CloudWatch Agent, que envia a memória como métrica customizada.",
                                isCorrect: true,
                            },
                            {
                                text: "A métrica de memória existe, mas só aparece com o Logs Insights habilitado.",
                                isCorrect: false,
                            },
                            {
                                text: "É preciso aumentar a retenção do log group para 30 dias.",
                                isCorrect: false,
                            },
                            {
                                text: "A memória só é publicada se a instância estiver em uma VPC com NAT Gateway.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Durante um incidente, um desenvolvedor precisa contar quantos erros por intervalo de 5 minutos apareceram nos logs de uma função e ordenar do maior para o menor. Qual recurso do CloudWatch é o indicado?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "CloudWatch Logs Insights, com filter, stats count(*) by bin(5m) e sort.",
                                isCorrect: true,
                            },
                            {
                                text: "Um alarme composto com lógica AND sobre a métrica Errors.",
                                isCorrect: false,
                            },
                            {
                                text: "PutMetricData enviando o total de erros a cada 5 minutos.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar a resolução das métricas para 1 segundo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Métricas customizadas e o Embedded Metric Format (EMF)",
                blocks: [
                    {
                        type: "text",
                        value: "# Métricas customizadas e o Embedded Metric Format (EMF)",
                    },
                    {
                        type: "quote",
                        value: "O **Embedded Metric Format (EMF)** permite **embutir métricas dentro de logs estruturados** que o **CloudWatch extrai automaticamente** como métricas, **sem** você fazer uma chamada síncrona a `PutMetricData`. Em ambientes serverless como o **Lambda**, é a forma recomendada de emitir métricas customizadas: você só escreve um log, e o CloudWatch faz o resto.",
                    },
                    {
                        type: "text",
                        value: "## 1. O problema do PutMetricData síncrono\n\nChamar `PutMetricData` direto funciona, mas em uma função Lambda ele tem custos escondidos:\n\n- É uma **chamada de rede síncrona**: sua função **espera** a resposta da API do CloudWatch, somando **latência** a cada invocação.\n- É uma **dependência a mais**: se a API estiver lenta ou fizer **throttling**, isso afeta a sua função (pode até estourar o timeout).\n- **Custa uma requisição de API** por chamada e mistura a lógica de métricas com a lógica de negócio.\n\nEm alta escala, esse padrão síncrono vira um gargalo. O EMF resolve tornando a emissão **assíncrona e local**.",
                    },
                    {
                        type: "text",
                        value: "## 2. O que é o Embedded Metric Format\n\nO **EMF** é um **formato de log em JSON**. Em vez de chamar uma API, sua aplicação **escreve uma linha de log** estruturada, contendo tanto os **valores** quanto **instruções** de como transformá-los em métricas. O **CloudWatch Logs** reconhece esse formato, **extrai as métricas automaticamente** (de forma assíncrona) e, ao mesmo tempo, mantém a linha de log completa para você pesquisar.\n\nOu seja: **um único log** vira, ao mesmo tempo, uma **métrica** no CloudWatch Metrics e um **registro pesquisável** no CloudWatch Logs.",
                    },
                    {
                        type: "quote",
                        value: "A ideia-chave do EMF: **você só escreve um log estruturado**. Quem o transforma em métrica é o **CloudWatch**, do lado dele, **sem chamada de API síncrona** da sua função.",
                    },
                    {
                        type: "text",
                        value: '## 3. Anatomia de um documento EMF\n\nUm log EMF é um JSON com uma chave especial **`_aws`** e os dados no **nível raiz**:\n\n- **`_aws.Timestamp`**: o horário em **milissegundos** (epoch).\n- **`_aws.CloudWatchMetrics`**: uma lista de \\"diretivas\\", cada uma com:\n  - **`Namespace`**: o namespace da métrica.\n  - **`Dimensions`**: uma lista de **conjuntos de dimensions** (cada conjunto é uma lista de **chaves** que precisam existir na raiz).\n  - **`Metrics`**: a lista de métricas, cada uma com `Name` e `Unit`.\n- **Na raiz** ficam os **valores**: as chaves citadas em `Dimensions` e em `Metrics`, mais qualquer **propriedade extra** de contexto.',
                    },
                    {
                        type: "code",
                        value: '{\n  "_aws": {\n    "Timestamp": 1751630400000,\n    "CloudWatchMetrics": [\n      {\n        "Namespace": "MinhaApp/Pedidos",\n        "Dimensions": [ ["Servico"], ["Servico", "TipoPagamento"] ],\n        "Metrics": [\n          { "Name": "PedidosProcessados", "Unit": "Count" },\n          { "Name": "LatenciaMs", "Unit": "Milliseconds" }\n        ]\n      }\n    ]\n  },\n  "Servico": "checkout",\n  "TipoPagamento": "cartao",\n  "PedidosProcessados": 1,\n  "LatenciaMs": 42.5,\n  "requestId": "b3a1c9e2-9f4a-4c1e-8b2d-1a2b3c4d5e6f"\n}',
                    },
                    {
                        type: "text",
                        value: "Repare como as peças se conectam no exemplo acima:\n\n- `Dimensions` cita `Servico` e `TipoPagamento`, que **existem na raiz** com seus valores (`checkout`, `cartao`). Cada **conjunto** vira uma combinação de dimensions da métrica.\n- `Metrics` cita `PedidosProcessados` e `LatenciaMs`, que **existem na raiz** com valores **numéricos** (1 e 42.5).\n- `requestId` **não** está em `Dimensions` nem em `Metrics`: é uma **propriedade de contexto**, pesquisável nos logs, mas que **não vira dimension** (mais sobre isso na seção 6).",
                    },
                    {
                        type: "text",
                        value: "## 4. Emitindo EMF no Lambda com um simples log\n\nO detalhe que torna o EMF perfeito para Lambda: tudo o que a função escreve no **stdout** vai **automaticamente** para o **CloudWatch Logs**. Então **imprimir uma linha EMF já emite a métrica** — sem SDK do CloudWatch, sem permissão extra além da de logar (que a função já tem).",
                    },
                    {
                        type: "code",
                        value: 'exports.handler = async (event) => {\n  const emf = {\n    _aws: {\n      Timestamp: Date.now(),\n      CloudWatchMetrics: [\n        {\n          Namespace: "MinhaApp/Pedidos",\n          Dimensions: [["Servico"]],\n          Metrics: [{ Name: "PedidosProcessados", Unit: "Count" }],\n        },\n      ],\n    },\n    Servico: "checkout",\n    PedidosProcessados: 1,\n    requestId: event.requestContext?.requestId, // contexto pesquisavel\n  };\n\n  // So escrever no stdout: o CloudWatch Logs extrai a metrica sozinho.\n  // Nao ha chamada sincrona a PutMetricData.\n  console.log(JSON.stringify(emf));\n\n  return { statusCode: 200 };\n};',
                    },
                    {
                        type: "text",
                        value: "## 5. A biblioteca aws-embedded-metrics\n\nEscrever o JSON na mão funciona, mas a AWS mantém a biblioteca oficial **`aws-embedded-metrics`** (Node, Python, Java, .NET) que monta o documento e cuida do *flush* para você. Você chama `putMetric`, `setDimensions`, `setNamespace` e `setProperty`, e ela emite o EMF no fim do escopo.",
                    },
                    {
                        type: "code",
                        value: 'const { metricScope, Unit } = require("aws-embedded-metrics");\n\n// metricScope injeta o \'metrics\' e faz o flush do EMF ao terminar\nexports.handler = metricScope((metrics) => async (event) => {\n  metrics.setNamespace("MinhaApp/Pedidos");\n  metrics.setDimensions({ Servico: "checkout" });\n\n  metrics.putMetric("PedidosProcessados", 1, Unit.Count);\n  metrics.putMetric("LatenciaMs", 42.5, Unit.Milliseconds);\n\n  // Propriedade de contexto: pesquisavel, mas NAO vira dimension\n  metrics.setProperty("requestId", event.requestContext?.requestId);\n\n  return { statusCode: 200 };\n});',
                    },
                    {
                        type: "code",
                        value: 'from aws_embedded_metrics import metric_scope\n\n@metric_scope\ndef handler(event, context, metrics):\n    metrics.set_namespace("MinhaApp/Pedidos")\n    metrics.set_dimensions({"Servico": "checkout"})\n\n    metrics.put_metric("PedidosProcessados", 1, "Count")\n    metrics.put_metric("LatenciaMs", 42.5, "Milliseconds")\n\n    metrics.set_property("requestId", context.aws_request_id)\n    return {"statusCode": 200}',
                    },
                    {
                        type: "text",
                        value: "## 6. Propriedades de alta cardinalidade\n\nEsse é um trunfo do EMF que a prova adora. Toda **dimension** de uma métrica cria uma **série separada** no CloudWatch Metrics — e cada série tem **custo**. Se você usasse `requestId` ou `customerId` como dimension, teria **milhões de séries** (alta cardinalidade) e uma conta explosiva.\n\nCom o EMF, você anexa esses valores como **propriedades** (fora de `Dimensions`). Eles ficam **pesquisáveis no Logs Insights** e permitem **correlacionar** um pico de métrica com a **linha de log exata** — sem virarem dimensions caras.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","PutMetricData (síncrono)","EMF (log estruturado)"],["Como emite","Chamada de API síncrona","Escreve um log; CloudWatch extrai depois"],["Latência na função","Sim, espera a resposta da API","Não, é local e assíncrono"],["Custo por chamada","Uma requisição de API","Só o custo de log/ingestão"],["Log + métrica juntos","Não (métrica e log separados)","Sim, a mesma linha vira os dois"],["Alta cardinalidade","Vira dimension cara","Propriedade pesquisável, sem virar dimension"]]',
                    },
                    {
                        type: "text",
                        value: "## 7. Casos de uso em Lambda\n\n- **KPIs de negócio por requisição** (pedidos, itens, valor) sem somar latência à função.\n- **Métricas de alto volume** onde chamar `PutMetricData` em toda invocação seria caro e lento.\n- **Correlação**: do pico da métrica no CloudWatch, você pula para o **log estruturado** e acha o `requestId` que causou o problema. A consulta usa as propriedades do próprio EMF:",
                    },
                    {
                        type: "code",
                        value: 'fields @timestamp, requestId, LatenciaMs\n| filter Servico = "checkout" and LatenciaMs > 500\n| sort LatenciaMs desc\n| limit 20',
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova.** Precisa de **métricas customizadas em Lambda sem a latência e o custo de uma chamada síncrona** a `PutMetricData`? A resposta é **EMF**: um **log estruturado** do qual o **CloudWatch extrai a métrica automaticamente**. A chave é **`_aws`**; `Dimensions` e `Metrics` apontam para valores na **raiz**; propriedades extras ficam **pesquisáveis** sem virar dimension.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o Embedded Metric Format (EMF) permite fazer?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Embutir métricas em logs estruturados dos quais o CloudWatch extrai as métricas automaticamente.",
                                isCorrect: true,
                            },
                            {
                                text: "Comprimir os logs do CloudWatch para reduzir custo de armazenamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Criptografar as métricas customizadas em repouso com KMS.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir o CloudWatch Agent na coleta de métricas de EC2.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a principal vantagem do EMF em relação a chamar PutMetricData diretamente dentro de uma função Lambda?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O EMF evita a chamada de API síncrona, não somando latência nem criando dependência de rede na função.",
                                isCorrect: true,
                            },
                            {
                                text: "O EMF publica métricas com resolução de 1 milissegundo.",
                                isCorrect: false,
                            },
                            {
                                text: "O EMF dispensa a necessidade de um namespace para a métrica.",
                                isCorrect: false,
                            },
                            {
                                text: "O EMF só funciona com métricas padrão dos serviços AWS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma função Lambda, qual é a forma mais simples de emitir uma métrica no formato EMF?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Escrever o documento EMF em JSON no stdout (ex.: console.log), pois o stdout vai para o CloudWatch Logs, que extrai a métrica.",
                                isCorrect: true,
                            },
                            {
                                text: "Gravar o JSON em um arquivo em /tmp e enviá-lo ao S3.",
                                isCorrect: false,
                            },
                            {
                                text: "Chamar PutMetricData passando o documento EMF como payload.",
                                isCorrect: false,
                            },
                            {
                                text: "Configurar um event source mapping apontando para o CloudWatch.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um desenvolvedor quer registrar o requestId de cada requisição junto da métrica, para depois correlacionar um pico com a linha exata, mas sem estourar o custo com cardinalidade. Como o EMF resolve isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O requestId é adicionado como propriedade (fora de Dimensions): fica pesquisável nos logs sem virar uma dimension de métrica.",
                                isCorrect: true,
                            },
                            {
                                text: "O requestId deve ser incluído em Dimensions para poder ser pesquisado.",
                                isCorrect: false,
                            },
                            {
                                text: "O EMF ignora automaticamente qualquer campo de alta cardinalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "É preciso publicar o requestId em um namespace separado com PutMetricData.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No documento EMF, qual chave contém a estrutura que instrui o CloudWatch sobre namespace, dimensions e métricas a extrair?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A chave _aws, contendo Timestamp e a lista CloudWatchMetrics.",
                                isCorrect: true,
                            },
                            {
                                text: "A chave metadata, no nível raiz do JSON.",
                                isCorrect: false,
                            },
                            {
                                text: "A chave StorageResolution.",
                                isCorrect: false,
                            },
                            {
                                text: "A chave Dimensions, sozinha na raiz do documento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "AWS X-Ray - tracing distribuído",
                blocks: [
                    {
                        type: "text",
                        value: "# AWS X-Ray - tracing distribuído",
                    },
                    {
                        type: "quote",
                        value: 'O **AWS X-Ray** faz **tracing distribuído**: ele acompanha **uma requisição** enquanto ela atravessa vários serviços (por exemplo, **API Gateway → Lambda → DynamoDB**), monta um **mapa** dessa jornada e mostra **onde está a latência** e **onde está o erro**. É a ferramenta da AWS para responder \\"por que essa requisição demorou/falhou?\\" em uma arquitetura de microsserviços.',
                    },
                    {
                        type: "text",
                        value: "## 1. Traces, segments e subsegments\n\nTrês níveis estruturam os dados do X-Ray:\n\n- **Trace** (rastro): o caminho **ponta a ponta** de **uma** requisição por todos os serviços, correlacionado por um **trace ID**.\n- **Segment** (segmento): os dados de **um único serviço/recurso** que a requisição tocou (por exemplo, o segmento da função Lambda). Traz tempo, status e erros daquele serviço.\n- **Subsegment** (subsegmento): uma **unidade mais granular dentro** de um segment (por exemplo, a **chamada ao DynamoDB**, uma requisição HTTP externa ou um trecho da sua lógica). É onde você vê o tempo gasto em cada dependência.",
                    },
                    {
                        type: "table",
                        value: '[["Nível","O que representa","Exemplo"],["Trace","A requisição inteira, ponta a ponta","1 pedido: API GW + Lambda + DynamoDB"],["Segment","Um serviço/recurso da jornada","O segment da função `checkout`"],["Subsegment","Uma unidade dentro do segment","A chamada `GetItem` ao DynamoDB"]]',
                    },
                    {
                        type: "text",
                        value: "## 2. Annotations vs metadata (cai muito)\n\nDentro de um segment/subsegment você anexa dados de duas formas, e a diferença é **muito cobrada**:\n\n- **Annotations**: pares **chave-valor INDEXADOS** pelo X-Ray. Por serem indexados, você pode **filtrar e pesquisar traces** por eles usando *filter expressions*. Aceitam string, número ou booleano; há um limite de **50 annotations** por trace.\n- **Metadata**: pares chave-valor **NÃO indexados**. Servem para anexar **contexto extra** (até objetos grandes), mas você **não consegue filtrar** traces por metadata.\n\nRegra prática: se você vai **buscar** traces por aquele valor (ex.: todos os traces de um `clienteId`), use **annotation**. Se é só **contexto** para ler depois de achar o trace, use **metadata**.",
                    },
                    {
                        type: "quote",
                        value: "A ideia-chave: **annotation = indexada e filtrável** (dá para pesquisar traces por ela). **Metadata = não indexada** (contexto extra, não filtrável).",
                    },
                    {
                        type: "code",
                        value: 'const AWSXRay = require("aws-xray-sdk-core");\n\nexports.handler = async (event) => {\n  const segment = AWSXRay.getSegment();               // segment da invocacao\n  const sub = segment.addNewSubsegment("regra-de-negocio");\n\n  // ANNOTATION: indexada -> da pra filtrar traces por clienteId\n  sub.addAnnotation("clienteId", event.clienteId);\n\n  // METADATA: nao indexada -> so contexto extra para leitura\n  sub.addMetadata("payloadRecebido", event);\n\n  try {\n    // ... logica de negocio ...\n  } catch (erro) {\n    sub.addError(erro); // registra a falha no trace\n    throw erro;\n  } finally {\n    sub.close();\n  }\n};',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Annotations","Metadata"],["Indexado pelo X-Ray?","Sim","Não"],["Dá para filtrar/pesquisar traces?","Sim (filter expressions)","Não"],["Tipos aceitos","String, número, booleano","Qualquer objeto (inclusive grande)"],["Limite","Até 50 por trace","Sem indexação (limite de tamanho)"],["Quando usar","Buscar traces por um valor","Anexar contexto para leitura"]]',
                    },
                    {
                        type: "text",
                        value: "## 3. O service map\n\nO **service map** é o **grafo** que o X-Ray monta a partir dos traces: cada **nó** é um serviço (cliente, API Gateway, Lambda, DynamoDB) e cada **aresta** é uma chamada entre eles. Em cada nó o X-Ray mostra **latência média**, **taxa de requisições** e a saúde: **faults** (erros 5xx, do servidor), **errors** (4xx, do cliente) e **throttles** (429). É o jeito mais rápido de **enxergar visualmente** onde está o gargalo ou a falha em uma arquitetura distribuída.",
                    },
                    {
                        type: "text",
                        value: "## 4. Sampling\n\nRastrear **100%** das requisições seria caro e ruidoso. Por isso o X-Ray usa **sampling** (amostragem): ele coleta traces de uma **fração** das requisições. A regra **padrão** é **1 requisição por segundo** (o *reservoir*, um mínimo garantido) **mais 5%** das requisições adicionais. Você pode criar **sampling rules** para amostrar mais (ou menos) certos caminhos.",
                    },
                    {
                        type: "code",
                        value: '{\n  "version": 2,\n  "rules": [\n    {\n      "description": "Amostra 10% do checkout",\n      "host": "*",\n      "http_method": "*",\n      "url_path": "/checkout/*",\n      "fixed_target": 1,\n      "rate": 0.1\n    }\n  ],\n  "default": {\n    "fixed_target": 1,\n    "rate": 0.05\n  }\n}',
                    },
                    {
                        type: "text",
                        value: "## 5. SDK e daemon\n\nDois componentes trabalham juntos:\n\n- **X-Ray SDK**: você adiciona ao seu código para **instrumentar** chamadas (ao SDK da AWS, a HTTP, a bancos) e criar segments/subsegments.\n- **X-Ray daemon**: um processo que **escuta em UDP na porta 2000**, recebe os segments do SDK, **agrupa em lotes** e os envia para o serviço X-Ray (via `PutTraceSegments`).\n\nEm **EC2/ECS** você roda o daemon você mesmo; em **Lambda**, a AWS já **provê o daemon** por trás da integração (você não instala nada).",
                    },
                    {
                        type: "code",
                        value: 'const AWSXRay = require("aws-xray-sdk-core");\nconst { DynamoDBClient } = require("@aws-sdk/client-dynamodb");\n\n// Instrumenta o cliente do SDK: cada chamada AWS vira um SUBSEGMENT\nconst ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));\n\n// Instrumenta tambem chamadas HTTP externas\nconst https = AWSXRay.captureHTTPs(require("https"));\n\nexports.handler = async (event) => {\n  // As chamadas com \'ddb\' e \'https\' aparecem como subsegments no trace\n  // ...\n  return { statusCode: 200 };\n};',
                    },
                    {
                        type: "code",
                        value: 'from aws_xray_sdk.core import xray_recorder, patch_all\n\n# patch_all instrumenta boto3, requests, etc. automaticamente\npatch_all()\n\ndef handler(event, context):\n    sub = xray_recorder.begin_subsegment("regra-de-negocio")\n    sub.put_annotation("clienteId", event["clienteId"])  # indexada\n    sub.put_metadata("payload", event)                    # nao indexada\n    # ... logica ...\n    xray_recorder.end_subsegment()\n    return {"statusCode": 200}',
                    },
                    {
                        type: "text",
                        value: "## 6. Instrumentando Lambda\n\nNo Lambda você liga o **active tracing** (rastreamento ativo). Aí a AWS já cria o segment da invocação e envia ao X-Ray. Dois requisitos:\n\n- Configurar a função com **`Mode=Active`**.\n- A **execution role** precisa de permissão para escrever no X-Ray. A policy gerenciada **`AWSXRayDaemonWriteAccess`** concede exatamente isso (`xray:PutTraceSegments` e `xray:PutTelemetryRecords`).",
                    },
                    {
                        type: "code",
                        value: 'aws lambda update-function-configuration \\\n  --function-name checkout \\\n  --tracing-config Mode=Active\n\n# Permissao necessaria na execution role (o que AWSXRayDaemonWriteAccess concede):\n# {\n#   "Effect": "Allow",\n#   "Action": ["xray:PutTraceSegments", "xray:PutTelemetryRecords"],\n#   "Resource": "*"\n# }',
                    },
                    {
                        type: "text",
                        value: "## 7. Instrumentando API Gateway e correlação de trace\n\nNo **API Gateway** você habilita o **active tracing no stage**, e ele passa a iniciar/propagar o trace. A **correlação** entre serviços acontece pelo cabeçalho **`X-Amzn-Trace-Id`**: o primeiro serviço gera um **trace ID** e o coloca no header; cada serviço seguinte **lê e repassa** esse header, de modo que **todos os segments compartilham o mesmo trace ID** e o X-Ray consegue costurar a jornada inteira em um único trace.",
                    },
                    {
                        type: "code",
                        value: "# Cabecalho propagado entre os servicos (correlaciona os segments):\nX-Amzn-Trace-Id: Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1\n\n# Habilitar tracing ativo no stage do API Gateway:\naws apigateway update-stage \\\n  --rest-api-id abc123 \\\n  --stage-name prod \\\n  --patch-operations op=replace,path=/tracingEnabled,value=true",
                    },
                    {
                        type: "quote",
                        value: "**Dica de prova.** **Annotation = indexada e filtrável**; **metadata = não indexada** (contexto). **Segment** = um serviço; **subsegment** = uma chamada dentro dele (ex.: DynamoDB). Daemon escuta em **UDP 2000**. Lambda: **`Mode=Active`** + policy **`AWSXRayDaemonWriteAccess`**. Correlação via cabeçalho **`X-Amzn-Trace-Id`**. Sampling padrão = **1/s + 5%**.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre annotations e metadata no AWS X-Ray?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Annotations são pares chave-valor indexados e usados para filtrar/pesquisar traces; metadata não é indexada e serve só como contexto.",
                                isCorrect: true,
                            },
                            {
                                text: "Metadata é indexada e filtrável; annotations são apenas contexto não pesquisável.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambas são indexadas, mas annotations só aceitam números.",
                                isCorrect: false,
                            },
                            {
                                text: "Annotations são criptografadas e metadata não.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que serve, principalmente, o AWS X-Ray?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Fazer tracing distribuído, acompanhando uma requisição por vários serviços para achar latência e erros.",
                                isCorrect: true,
                            },
                            {
                                text: "Armazenar logs de aplicação com política de retenção.",
                                isCorrect: false,
                            },
                            {
                                text: "Auditar quem chamou cada API da conta AWS.",
                                isCorrect: false,
                            },
                            {
                                text: "Servir de cache de borda para conteúdo estático.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em um trace do X-Ray, o que representa um subsegment?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma unidade granular dentro de um segment, como a chamada a uma dependência (ex.: um GetItem no DynamoDB).",
                                isCorrect: true,
                            },
                            {
                                text: "O caminho ponta a ponta de todas as requisições do dia.",
                                isCorrect: false,
                            },
                            {
                                text: "O grafo completo de serviços da aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "A política de amostragem aplicada à requisição.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função Lambda foi configurada com active tracing, mas os traces não aparecem no X-Ray. Qual é a causa mais provável?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A execution role não tem permissão para escrever no X-Ray (falta a policy AWSXRayDaemonWriteAccess / ações xray:PutTraceSegments).",
                                isCorrect: true,
                            },
                            {
                                text: "A função precisa estar dentro de uma VPC para enviar traces.",
                                isCorrect: false,
                            },
                            {
                                text: "É necessário publicar uma versão e criar um alias antes de rastrear.",
                                isCorrect: false,
                            },
                            {
                                text: "O X-Ray só rastreia funções escritas em Java.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe quer conseguir pesquisar, no X-Ray, todos os traces referentes a um determinado clienteId. Como isso deve ser registrado no código?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Adicionando o clienteId como uma annotation, que é indexada e permite filtrar os traces.",
                                isCorrect: true,
                            },
                            {
                                text: "Adicionando o clienteId como metadata, pois metadata é indexada.",
                                isCorrect: false,
                            },
                            {
                                text: "Gravando o clienteId apenas nos logs do CloudWatch.",
                                isCorrect: false,
                            },
                            {
                                text: "Criando um subsegment com o nome igual ao clienteId.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Troubleshooting e otimização",
                blocks: [
                    {
                        type: "text",
                        value: "# Troubleshooting e otimização",
                    },
                    {
                        type: "quote",
                        value: "Diagnosticar é achar a **causa raiz**: ler o **status HTTP** (um **4xx** é erro do **cliente**, um **5xx** é erro do **servidor**), reconhecer **throttling**, e auditar **quem chamou qual API** com o **CloudTrail**. Para otimizar, você coloca **cache** na **camada certa**: **ElastiCache**, **DAX**, **CloudFront** ou o **cache do API Gateway**.",
                    },
                    {
                        type: "text",
                        value: "## 1. Root cause analysis\n\nUm método que funciona bem na AWS é ir das camadas de fora para dentro, correlacionando pelo **request ID / trace ID**:\n\n1. **Métrica (CloudWatch)** mostra o **sintoma**: subiu a taxa de `5XXError`, a latência ou o throttle.\n2. **Logs / Logs Insights** mostram **qual** erro e a linha exata.\n3. **X-Ray** mostra **onde** na jornada (qual serviço/subsegment) está lento ou falhando.\n4. **CloudTrail** mostra **quem/o quê** chamou a API (útil quando o problema é uma mudança de configuração).\n\nCorrelacionar tudo pelo mesmo identificador é o que transforma dados soltos em causa raiz.",
                    },
                    {
                        type: "text",
                        value: "## 2. 4xx (cliente) vs 5xx (servidor)\n\nO **primeiro corte** de qualquer troubleshooting HTTP é a **classe do status**:\n\n- **4xx = erro do CLIENTE**: a requisição chegou **malformada** ou **não autorizada**. Repetir a mesma requisição **não adianta** (a exceção é **429**, throttling, onde vale re-tentar depois). Corrija a *request*.\n- **5xx = erro do SERVIDOR**: algo falhou **do lado do serviço** ao processar uma requisição válida. Costuma ser **transitório**, então **re-tentar com backoff** faz sentido.\n\nSaber essa diferença direciona a investigação: 4xx te manda olhar o **cliente/entrada**; 5xx te manda olhar o **servidor/dependências**.",
                    },
                    {
                        type: "table",
                        value: '[["Código","Classe","Significado","Re-tentar?"],["400 Bad Request","4xx (cliente)","Requisição malformada","Não, corrija a request"],["401 / 403","4xx (cliente)","Sem autenticação / sem permissão","Não, ajuste credenciais/IAM"],["404 Not Found","4xx (cliente)","Recurso não existe","Não"],["429 Too Many Requests","4xx (cliente)","Throttling","Sim, com backoff"],["500 Internal Server Error","5xx (servidor)","Falha interna do serviço","Sim, transitório"],["502 / 503 / 504","5xx (servidor)","Gateway ruim / indisponível / timeout","Sim, com backoff"]]',
                    },
                    {
                        type: "code",
                        value: 'try {\n  const resp = await fetch(url);\n  if (resp.status >= 400 && resp.status < 500) {\n    // Erro do CLIENTE: request malformada, sem auth, nao encontrado.\n    if (resp.status === 429) return await esperarEReTentar(); // throttle -> backoff\n    throw new Error("Erro do cliente (nao adianta re-tentar): " + resp.status);\n  }\n  if (resp.status >= 500) {\n    // Erro do SERVIDOR: costuma ser transitorio -> retry com backoff.\n    return await esperarEReTentar();\n  }\n  return await resp.json();\n} catch (erro) {\n  console.error("Falha na chamada HTTP", erro); // nunca engula o erro\n  throw erro;\n}',
                    },
                    {
                        type: "text",
                        value: "## 3. Erros comuns na AWS e throttling\n\nMuitos erros de produção na AWS são **limites/quotas** sendo atingidos. Os nomes que aparecem na prova:\n\n- **`ThrottlingException`** / **`Rate exceeded`**: você passou do limite de requisições de uma API.\n- **`ProvisionedThroughputExceededException`**: **DynamoDB** estrangulando por falta de capacidade de leitura/escrita (HTTP **400**).\n- **`TooManyRequestsException`** (HTTP **429**): **Lambda** sem concorrência disponível.\n- **API Gateway** devolvendo **429** quando o *throttling* do stage/usage plan é atingido.",
                    },
                    {
                        type: "text",
                        value: "## 4. Throttling e backoff exponencial\n\nA resposta certa para throttling **não** é martelar a API de novo na hora: isso piora. É **re-tentar com backoff exponencial + jitter** (esperas crescentes com um componente aleatório, para não sincronizar todos os clientes). Os **SDKs da AWS já fazem isso** automaticamente (modo de retry `standard`/`adaptive`), mas você pode ajustar o número de tentativas.",
                    },
                    {
                        type: "code",
                        value: 'const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");\n\n// O SDK v3 ja re-tenta erros de throttling com backoff exponencial.\nconst client = new DynamoDBClient({\n  maxAttempts: 5,        // total de tentativas\n  retryMode: "adaptive", // ajusta o ritmo conforme o throttling observado\n});\n\n// Backoff manual, se voce precisar controlar o retry na mao:\nasync function comBackoff(fn, tentativas = 5) {\n  for (let i = 0; i < tentativas; i++) {\n    try {\n      return await fn();\n    } catch (erro) {\n      const throttled =\n        erro.name === "ThrottlingException" ||\n        erro.name === "ProvisionedThroughputExceededException" ||\n        erro.$metadata?.httpStatusCode === 429;\n      if (!throttled || i === tentativas - 1) throw erro;\n      const espera = Math.min(2 ** i * 100, 2000) + Math.random() * 100; // + jitter\n      await new Promise((r) => setTimeout(r, espera));\n    }\n  }\n}',
                    },
                    {
                        type: "text",
                        value: '## 5. CloudTrail para auditoria de chamadas de API\n\nO **AWS CloudTrail** registra **quem chamou qual API, quando, de onde e com qual resultado** na sua conta. É a ferramenta de **auditoria** (\\"quem apagou esse bucket ontem às 14h?\\", \\"quem mudou essa policy?\\"). Pontos que caem na prova:\n\n- **Management events** são gravados por padrão e ficam **90 dias** no *Event history*, de graça.\n- Para **retenção longa**, você cria um **trail** que entrega os eventos a um bucket **S3** (e opcionalmente ao CloudWatch Logs).\n- **Data events** (ex.: cada `GetObject` no S3) **não** são gravados por padrão e têm **custo**.\n\nNão confunda com o CloudWatch: **CloudWatch** = saúde/performance (\\"quantos erros?\\"); **CloudTrail** = auditoria de API (\\"quem fez o quê?\\").',
                    },
                    {
                        type: "code",
                        value: "# Quem chamou uma API especifica no periodo (auditoria/forense)\naws cloudtrail lookup-events \\\n  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteBucket \\\n  --start-time 2026-07-01T00:00:00Z \\\n  --end-time 2026-07-04T23:59:59Z",
                    },
                    {
                        type: "text",
                        value: "## 6. Otimização por caching: as quatro camadas\n\nCache reduz **latência** e **carga** guardando respostas prontas. A DVA cobra **em qual camada** cada serviço atua — e escolher o certo é o que vale ponto:\n\n- **ElastiCache**: cache **em memória** na frente de um **banco de dados** (RDS).\n- **DAX**: cache em memória **específico do DynamoDB**.\n- **CloudFront**: cache de **borda** (CDN), perto do usuário, global.\n- **Cache do API Gateway**: cache das **respostas** dos endpoints da sua API.",
                    },
                    {
                        type: "table",
                        value: '[["Cache","Camada onde atua","O que guarda","Caso típico"],["ElastiCache","Frente de um banco (RDS)","Resultado de queries, sessões","Query cara e repetida no RDS"],["DAX","Frente do DynamoDB","Itens e resultados de query do DynamoDB","Leitura intensa no DynamoDB"],["CloudFront","Borda (edge), global","Conteúdo estático e dinâmico","Servir usuários no mundo todo"],["API Gateway cache","Na própria API (por stage)","Respostas dos endpoints","Repetir a mesma resposta HTTP"]]',
                    },
                    {
                        type: "text",
                        value: "## 7. ElastiCache (Redis/Memcached)\n\nO **Amazon ElastiCache** é um cache **em memória** gerenciado (**Redis** ou **Memcached**) que você coloca **na frente de um banco** (tipicamente o RDS) para **aliviar queries caras e repetidas** ou guardar **sessões**. A lógica de cache é **da aplicação**: o padrão mais comum é o **lazy loading** (*cache-aside*) — busca no cache; se não achar (*miss*), lê o banco e **grava no cache**. O **Redis** ainda oferece persistência, réplicas e estruturas ricas; o **Memcached** é mais simples e multi-thread.",
                    },
                    {
                        type: "text",
                        value: "## 8. DAX (DynamoDB Accelerator)\n\nO **DAX** é um cache **em memória específico para o DynamoDB**. Ele entrega leituras em **microssegundos** e é **compatível com a API do DynamoDB** — você troca o cliente e o resto do código continua igual (*drop-in*). Vale para cargas **read-heavy** com **leitura eventualmente consistente**. Atenção: leituras **fortemente consistentes** **não** usam o cache do DAX (vão direto ao DynamoDB), e ele **não** é indicado para cargas dominadas por **escrita**.",
                    },
                    {
                        type: "code",
                        value: 'const AmazonDaxClient = require("amazon-dax-client");\nconst AWS = require("aws-sdk");\n\n// Aponta para o cluster DAX; a API e a MESMA do DynamoDB (drop-in)\nconst dax = new AmazonDaxClient({\n  endpoints: ["meu-cluster.dax.amazonaws.com:8111"],\n  region: "us-east-1",\n});\nconst docClient = new AWS.DynamoDB.DocumentClient({ service: dax });\n\n// A leitura passa pelo cache do DAX (microssegundos em caso de hit)\nconst r = await docClient.get({ TableName: "Produtos", Key: { id: "p-1" } }).promise();',
                    },
                    {
                        type: "text",
                        value: "## 9. CloudFront (cache de borda)\n\nO **Amazon CloudFront** é a **CDN** da AWS: ele guarda cópias do conteúdo em **edge locations** espalhadas pelo mundo, **perto do usuário**. Serve **conteúdo estático** (imagens, JS, CSS) e também **dinâmico**, com o TTL controlado por **cache behaviors** e pelo cabeçalho **`Cache-Control`** da origem. Ganhos: **menor latência** para o usuário final e **menos carga na origem** (S3, ALB, API Gateway).",
                    },
                    {
                        type: "text",
                        value: "## 10. Cache do API Gateway\n\nO **API Gateway** tem um **cache próprio**, habilitado **por stage**, que guarda as **respostas** dos endpoints. Na segunda chamada idêntica, ele responde do cache **sem tocar no backend** (Lambda, integração HTTP). O **TTL** vai de **0 a 3600 segundos** (padrão **300**), e a **cache key** é montada a partir de parâmetros da requisição. É o jeito mais direto de aliviar um backend quando as **respostas se repetem**.",
                    },
                    {
                        type: "code",
                        value: "# Habilita o cache do stage e define TTL de 300s\naws apigateway update-stage \\\n  --rest-api-id abc123 \\\n  --stage-name prod \\\n  --patch-operations \\\n    op=replace,path=/cacheClusterEnabled,value=true \\\n    op=replace,path=/cacheClusterSize,value=0.5 \\\n    op=replace,path=/*/*/caching/ttlInSeconds,value=300",
                    },
                    {
                        type: "table",
                        value: '[["Se o cenário é...","Use","Por quê"],["Cache de query cara no RDS ou sessão de usuário","ElastiCache","Cache em memória na frente do banco"],["Acelerar leitura intensa no DynamoDB","DAX","Cache em memória específico do DynamoDB (microssegundos)"],["Servir usuários globais com baixa latência","CloudFront","Cache de borda perto do usuário (CDN)"],["Repetir a mesma resposta HTTP sem chamar o backend","Cache do API Gateway","Cacheia respostas por stage, sem tocar no Lambda"]]',
                    },
                    {
                        type: "quote",
                        value: '**Dica de prova.** **4xx = cliente** (corrija a request; 429 = throttle, re-tente com backoff), **5xx = servidor** (transitório, re-tente). \\"**Quem chamou a API?**\\" → **CloudTrail**. Cache do **DynamoDB** → **DAX**. Cache de **query de banco/RDS ou sessão** → **ElastiCache**. Cache de **borda global** → **CloudFront**. Cache de **resposta HTTP na API** → **cache do API Gateway**.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Ao investigar erros HTTP em uma API, qual afirmação está correta sobre as classes de status?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Códigos 4xx indicam erro do cliente e 5xx indicam erro do servidor.",
                                isCorrect: true,
                            },
                            {
                                text: "Códigos 4xx indicam erro do servidor e 5xx indicam erro do cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Tanto 4xx quanto 5xx indicam erro do servidor.",
                                isCorrect: false,
                            },
                            {
                                text: "Códigos 4xx são sempre transitórios e devem ser re-tentados imediatamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação com leitura muito intensa sobre uma tabela DynamoDB precisa de um cache que reduza a latência para microssegundos e seja compatível com a API do DynamoDB, sem reescrever a lógica. Qual serviço é o indicado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "DAX (DynamoDB Accelerator), um cache em memória específico para o DynamoDB.",
                                isCorrect: true,
                            },
                            {
                                text: "CloudFront, para cachear as leituras na borda.",
                                isCorrect: false,
                            },
                            {
                                text: "O cache do API Gateway.",
                                isCorrect: false,
                            },
                            {
                                text: "ElastiCache Memcached na frente de um RDS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um bucket de produção foi apagado e a equipe precisa descobrir qual usuário ou role executou a chamada de API e quando. Qual serviço fornece essa informação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "AWS CloudTrail, que registra quem chamou qual API, quando e de onde.",
                                isCorrect: true,
                            },
                            {
                                text: "CloudWatch Metrics, olhando a métrica de erros do S3.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS X-Ray, pelo service map.",
                                isCorrect: false,
                            },
                            {
                                text: "ElastiCache, consultando o histórico de chaves.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função recebe repetidamente ProvisionedThroughputExceededException ao gravar no DynamoDB durante picos. Qual é a estratégia recomendada para lidar com esse throttling?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Re-tentar as chamadas com backoff exponencial e jitter, deixando o SDK ou uma lógica própria espaçar as tentativas.",
                                isCorrect: true,
                            },
                            {
                                text: "Re-tentar imediatamente em loop até obter sucesso.",
                                isCorrect: false,
                            },
                            {
                                text: "Tratar como erro 5xx e ignorar, pois é sempre transitório.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduzir o timeout da função para forçar novas invocações.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma aplicação global serve muitos usuários distantes da origem e precisa reduzir a latência entregando o conteúdo a partir de pontos próximos ao usuário. Qual camada de cache é a mais adequada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "CloudFront, que faz cache de borda (edge) próximo aos usuários no mundo todo.",
                                isCorrect: true,
                            },
                            {
                                text: "DAX, que faz cache do DynamoDB.",
                                isCorrect: false,
                            },
                            {
                                text: "ElastiCache, que faz cache em memória de queries de banco.",
                                isCorrect: false,
                            },
                            {
                                text: "O cache do API Gateway, ligado no stage.",
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
                description:
                    "Trilha aprofundada para a certificação AWS Certified Developer Associate (DVA-C02): desenvolvimento com Lambda, DynamoDB, API Gateway, S3 e mensageria; segurança com IAM, Cognito e KMS; implantação e IaC com CloudFormation, SAM e os serviços Code; e observabilidade com CloudWatch e X-Ray. Alinhada aos 4 domínios da prova, com muito código.",
            })
            .returning();
    }

    const jaTem = await db
        .select({ id: modules.id })
        .from(modules)
        .where(and(eq(modules.trailId, trilha.id), eq(modules.title, MARCADOR)));
    if (jaTem.length) {
        console.log("Trilha DVA-C02 já está semeada, nada a fazer.");
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
    console.log("Trilha DVA-C02 construída: " + DADOS.length + " módulos.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
