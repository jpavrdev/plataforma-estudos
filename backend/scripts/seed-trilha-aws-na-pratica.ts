// Seed da trilha AWS na Prática. Conteúdo autoral, quiz-only, com exemplos de código em
// C#. As resoluções comentadas ficam em scripts/solucoes/aws-na-pratica.json e entram
// por mesclarSolucoes. Idempotente: se a trilha já tiver aulas, só atualiza as
// explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-aws-na-pratica.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "AWS na Prática";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const HORAS = 20;
const DESCRICAO =
    "AWS para colocar um sistema .NET no ar e mantê-lo lá, sem decorar catálogo de serviço: IAM e custo desde o primeiro dia, CDK em C#, rede com VPC e load balancer, contêineres no ECS com Fargate e Express Mode, RDS e S3, mensageria com Amazon MQ, SQS e EventBridge, observabilidade com CloudWatch e OpenTelemetry, Lambda com .NET 10 e entrega contínua com GitHub Actions e OIDC.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    explanation?: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS = [
    {
        titulo: "Módulo 1 - Fundamentos para colocar algo no ar",
        aulas: [
            {
                titulo: "Conta, região e zona de disponibilidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Conta, região e zona de disponibilidade\n\nSexta-feira, fim de tarde. Uma equipe de São Paulo coloca a API de pedidos no ar numa única máquina, na região que estava selecionada no console: Norte da Virgínia, nos Estados Unidos. Funciona. Na segunda-feira chegam três problemas de uma vez. Os clientes reclamam que o aplicativo ficou lento. O jurídico pergunta em que país estão os dados pessoais dos clientes, porque um contrato exige a resposta por escrito. E na terça uma falha de energia numa única zona de disponibilidade derruba o sistema por duas horas. Nenhum dos três é bug de código: são escolhas de lugar, feitas sem pensar, no primeiro dia.\n\nEsta aula é sobre essas escolhas: em que conta, em que região e em quantas zonas o sistema vai morar, e o que continua por sua conta depois que ele está lá.\n\n## A conta é a fronteira\n\nA conta AWS é a unidade de isolamento. Ela separa cobrança, permissões e cotas de serviço, e define o raio do estrago: nada numa conta enxerga o que está em outra sem uma permissão dada de propósito. Por isso a prática de mercado é ter, no mínimo, produção numa conta e o resto (desenvolvimento, homologação, testes) em outra, agrupadas numa **AWS Organizations**, que junta a fatura e aplica regras de guarda a todas. Um script de limpeza rodado no terminal errado não alcança produção se produção mora em outra conta. Um detalhe que vale em outubro de 2026: uma conta no plano gratuito que entra numa organização passa automaticamente para o plano pago.\n\nToda conta nasce com o **usuário root**, o e-mail e a senha usados no cadastro. Ele pode tudo na conta, e as políticas do IAM não se aplicam a ele. O certo é ligar MFA (o segundo fator de autenticação), nunca criar chave de acesso para ele e guardá-lo para as poucas tarefas que só ele faz, como fechar a conta ou trocar o e-mail dela. O trabalho do dia a dia usa outras identidades, assunto da aula sobre IAM.",
                    },
                    {
                        type: "text",
                        value: "## A região decide latência, preço e lei\n\nUma **região** é uma área geográfica com várias zonas de disponibilidade, isolada das outras regiões. Em outubro de 2026, a documentação lista 34 regiões disponíveis para uma conta comum, todas com pelo menos três zonas. Quase todo recurso é criado numa região específica: a máquina, o banco, a fila, a rede. Alguns serviços são globais, como o IAM. O susto mais comum de quem começa é procurar um recurso no console e não achar: ele está lá, só que em outra região, e o seletor no canto da tela mostra uma de cada vez. Regiões lançadas depois de 20 de março de 2019 vêm desligadas e precisam ser habilitadas antes do uso; São Paulo (`sa-east-1`) e Norte da Virgínia (`us-east-1`) já vêm ligadas.\n\nA região é a decisão mais difícil de desfazer, porque dado pesa: mover um banco de terabytes para outra região é um projeto, não um comando. A escolha se apoia em quatro critérios:",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\",\"Pergunta\",\"Exemplo\"],[\"Latência\",\"Onde estão os usuários e os sistemas com que a API conversa?\",\"A ida e volta entre São Paulo e o Norte da Virgínia costuma passar de 100 ms; dentro de uma região, poucos milissegundos\"],[\"Dados e contrato\",\"Algum contrato ou norma do setor exige os dados no Brasil?\",\"A LGPD não proíbe guardar dados fora do país, mas regula a transferência internacional; contratos podem exigir mais\"],[\"Preço\",\"Quanto custa a mesma coisa nessa região?\",\"São Paulo costuma custar mais que o Norte da Virgínia, como mostra a tabela abaixo\"],[\"Serviço disponível\",\"O serviço, o recurso e o tipo de máquina existem nessa região?\",\"Serviço ou recurso novo pode demorar a chegar a uma região; confira a lista de serviços por região antes de decidir\"]]",
                    },
                    {
                        type: "table",
                        value: "[[\"Item (lista de preços da AWS, outubro de 2026)\",\"us-east-1\",\"sa-east-1\"],[\"NAT Gateway, por hora\",\"0,045 dólar\",\"0,093 dólar\"],[\"Dado processado pelo NAT Gateway, por GB\",\"0,045 dólar\",\"0,093 dólar\"],[\"Saída para a internet, por GB, até 10 TB no mês\",\"0,09 dólar\",\"0,15 dólar\"],[\"Log ingerido no CloudWatch Logs, por GB\",\"0,50 dólar\",\"0,90 dólar\"],[\"IPv4 público, por hora\",\"0,005 dólar\",\"0,005 dólar\"]]",
                    },
                    {
                        type: "text",
                        value: "A tabela serve para ensinar o critério, não para decorar: em vários itens São Paulo custa de 1,5 a pouco mais de 2 vezes o Norte da Virgínia, em outros custa igual. (O NAT Gateway, que dá saída para a internet a recursos numa rede privada, volta na aula de custo.) Mesmo assim, para um sistema com usuários no Brasil, a latência quase sempre decide a favor de São Paulo. O erro que custa caro é separar a API e o banco em regiões diferentes \"para economizar\": se cada requisição faz 20 consultas em sequência e cada ida e volta entre as regiões leva 120 ms, são 2,4 segundos só de rede, em toda requisição. Regra prática: o que conversa muito fica na mesma região.\n\n## A zona de disponibilidade é o que cai junto\n\nUma **zona de disponibilidade** (AZ, de *availability zone*) é um ou mais data centers com energia, rede e conectividade redundantes. As zonas de uma região ficam a quilômetros umas das outras, todas a menos de 100 km, ligadas por uma rede rápida o bastante para replicar dados de forma síncrona. A zona é a unidade de falha: queda de energia, enchente ou erro de rede costumam ficar contidos numa zona só.\n\nDaí a regra de alta disponibilidade: o que é zonal precisa existir em pelo menos duas zonas. Uma máquina vive numa zona, uma sub-rede vive numa zona, uma instância de banco vive numa zona. Serviços regionais como S3, SQS, DynamoDB e Lambda já se espalham pelas zonas sozinhos; os zonais, você espalha. E a capacidade precisa sobrar: se a API precisa de 6 réplicas no pico e roda com 3 em cada uma de duas zonas, perder uma zona deixa metade da capacidade justamente na hora do pico. Para aguentar a queda de uma zona, ou cada zona sozinha dá conta do pico, ou você usa três zonas com folga.\n\nEspalhar tem custo: o tráfego entre zonas da mesma região sai por 0,01 dólar por GB em cada sentido. É pouco por GB, mas dois serviços que trocam terabytes por mês, cada um numa zona, aparecem na fatura.\n\n## Nome de zona não é zona\n\n`sa-east-1a` é um **nome**; o lugar físico é o **ID da zona**, como `sae1-az1`. Em nove regiões antigas, entre elas o Norte da Virgínia e São Paulo, a AWS sorteou a correspondência entre nome e zona física para cada conta criada antes de novembro de 2025: o `us-east-1a` da sua conta pode ser outro prédio que o `us-east-1a` da conta do parceiro. Contas criadas a partir de novembro de 2025 recebem a mesma correspondência. Para combinar zona entre contas, use sempre o ID:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: as zonas de disponibilidade de uma região, com nome e ID\n// dotnet add package AWSSDK.EC2\nusing Amazon;\nusing Amazon.EC2;\nusing Amazon.EC2.Model;\n\nusing var ec2 = new AmazonEC2Client(RegionEndpoint.SAEast1);\n\nvar resposta = await ec2.DescribeAvailabilityZonesAsync(new DescribeAvailabilityZonesRequest\n{\n    Filters = [new Filter(\"zone-type\", [\"availability-zone\"])]\n});\n\n// no SDK v4 a coleção da resposta pode vir null em vez de vazia\nforeach (var zona in resposta.AvailabilityZones ?? [])\n{\n    // ZoneName (\"sa-east-1a\") é apelido; ZoneId (\"sae1-az1\") é o lugar físico\n    Console.WriteLine($\"{zona.ZoneName,-12} {zona.ZoneId,-10} {zona.State}\");\n}",
                    },
                    {
                        type: "text",
                        value: "Dois detalhes do código valem para todo o SDK atual. A versão 4 do SDK para .NET, a única com suporte desde 1º de junho de 2026, devolve `null` em coleções da resposta que antes vinham vazias, por isso o `?? []`. E o cliente recebe a região de forma explícita: sem região no código, no perfil ou no ambiente, ele lança exceção.\n\n## Responsabilidade compartilhada, aplicada\n\nA AWS chama de **modelo de responsabilidade compartilhada**: ela cuida da segurança *da* nuvem (prédios, hardware, hipervisor, rede física, o software dos serviços gerenciados) e você cuida da segurança *na* nuvem. O tamanho da sua parte depende do serviço que você escolhe:",
                    },
                    {
                        type: "table",
                        value: "[[\"Serviço\",\"A AWS cuida\",\"Fica com você\"],[\"EC2 (máquina virtual)\",\"Hardware, hipervisor, rede física\",\"Sistema operacional e seus patches, runtime do .NET, aplicação, regras de rede da máquina\"],[\"ECS com Fargate (contêiner)\",\"Servidor e sistema operacional por baixo do contêiner\",\"Imagem do contêiner (imagem base e runtime do .NET dentro dela), permissões da tarefa, rede, segredos\"],[\"RDS (banco gerenciado)\",\"Hardware, sistema operacional, backups automáticos, patches na janela de manutenção\",\"Usuários do banco, quem alcança o banco pela rede, criptografia ligada, testar a restauração\"],[\"S3 (arquivos)\",\"Infraestrutura e durabilidade dos objetos\",\"Política do bucket, bloqueio de acesso público, quem tem permissão, o que é guardado ali\"],[\"Lambda (função)\",\"Servidores, sistema operacional, patches do runtime gerenciado\",\"Código, dependências, permissões da função, configuração\"]]",
                    },
                    {
                        type: "text",
                        value: "O erro comum é pensar \"está na AWS, então está seguro\". O S3 guarda seus arquivos com durabilidade de onze noves, inclusive os que ficaram públicos por uma política mal escrita. E o .NET dentro da sua imagem de contêiner é seu: quando sai uma correção de segurança do runtime, quem reconstrói a imagem e publica de novo é você, mesmo no Fargate. Uma coisa nunca muda de lado, seja qual for o serviço: as permissões, no IAM, são sempre suas.",
                    },
                    {
                        type: "quote",
                        value: "Conta é fronteira de cobrança e de estrago, região decide latência, preço e onde os dados moram, e zona de disponibilidade é a unidade que cai junto. A AWS cuida do prédio e do que fica por baixo do serviço escolhido; o que você configura continua sendo seu.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma API atende quase só clientes no Brasil, e o banco fica na mesma região que ela. Qual é o motivo principal para colocar o sistema em `sa-east-1` e não em `us-east-1`?",
                        difficulty: "facil",
                        options: [
                            { text: "O número de zonas, já que `us-east-1` tem menos zonas que São Paulo", isCorrect: false },
                            { text: "O preço menor, já que São Paulo é a região mais barata da AWS", isCorrect: false },
                            { text: "A LGPD, que proíbe guardar dados de clientes fora do país", isCorrect: false },
                            { text: "A latência menor para os usuários, que estão perto da região", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que é uma zona de disponibilidade na AWS?",
                        difficulty: "facil",
                        options: [
                            { text: "Uma região inteira de reserva, que só entra em uso quando a principal cai", isCorrect: false },
                            { text: "Um grupo de contas da mesma empresa, com uma fatura consolidada", isCorrect: false },
                            { text: "Um ou mais data centers com energia e rede próprias, dentro de uma região", isCorrect: true },
                            { text: "Um ponto de presença perto do usuário, usado para entregar conteúdo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API roda no ECS com Fargate. Sai uma correção de segurança crítica para o runtime do .NET 10. De quem é o trabalho de levar a correção até a API?",
                        difficulty: "medio",
                        options: [
                            { text: "Seu: reconstruir a imagem com o runtime corrigido e publicar de novo", isCorrect: true },
                            { text: "Da AWS: a correção entra na próxima janela de manutenção da tarefa", isCorrect: false },
                            { text: "De ninguém: o isolamento do contêiner já neutraliza a falha do runtime", isCorrect: false },
                            { text: "Da AWS: o Fargate atualiza o runtime do .NET junto com o servidor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Duas contas de uma empresa, ambas criadas em 2019, precisam colocar recursos na mesma zona física de `us-east-1` para não pagar tráfego entre zonas. Como garantir isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Usando o ID da zona, como `use1-az2`, nas duas contas", isCorrect: true },
                            { text: "Criando tudo na mesma região, o que já garante a zona", isCorrect: false },
                            { text: "Usando o nome da zona, como `us-east-1b`, nas duas contas", isCorrect: false },
                            { text: "Colocando as duas contas na mesma AWS Organizations", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API precisa de 6 réplicas para aguentar o pico e roda com 3 réplicas em cada uma de duas zonas, atrás de um load balancer. Uma das zonas cai no horário de pico. O que acontece, e que desenho aguentaria a perda de uma zona?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nada muda, porque a AWS migra sozinha as réplicas da zona que caiu sem perder capacidade", isCorrect: false },
                            { text: "Sobra metade da capacidade; aguentaria com 6 réplicas por zona ou 3 zonas com 3 cada", isCorrect: true },
                            { text: "Nada muda, porque o load balancer leva as 6 réplicas para a zona que ficou de pé na hora", isCorrect: false },
                            { text: "Cai tudo, porque as zonas de uma região dividem a mesma energia e falham juntas", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "IAM no dia a dia",
                blocks: [
                    {
                        type: "text",
                        value: "# IAM no dia a dia\n\nUma desenvolvedora precisa testar o upload de comprovantes no S3. Cria um usuário no IAM com a política `AdministratorAccess`, gera uma chave de acesso e cola no `appsettings.json` \"só para testar\". O arquivo entra num commit, e o commit vai para um repositório público. Robôs varrem repositórios públicos o tempo todo atrás de chaves, e o caso é tão comum que a própria AWS mantém uma política gerenciada só para ele, a `AWSCompromisedKeyQuarantineV3`, que ela anexa ao usuário quando encontra a chave exposta. Se o atacante chegar antes, a conta amanhece com máquinas de mineração em regiões que ninguém da empresa usa.\n\nO IAM (Identity and Access Management) é onde se decide quem pode fazer o quê na conta. No dia a dia, ele se resume a três perguntas: quem é a identidade, que credencial ela usa e o que a política permite.\n\n## Quem é quem",
                    },
                    {
                        type: "table",
                        value: "[[\"Identidade\",\"Para quem\",\"Credencial\",\"Validade\"],[\"Usuário root\",\"A conta inteira, só para tarefas raras\",\"E-mail, senha e MFA\",\"Permanente\"],[\"Usuário IAM\",\"Exceção: ferramenta que não aceita nada melhor\",\"Senha e chave de acesso de longo prazo (o ID começa com `AKIA`)\",\"Até alguém desativar\"],[\"Usuário do IAM Identity Center\",\"Pessoas do time\",\"Login no portal, que vira credencial temporária de uma role\",\"Temporária, renovada enquanto a sessão valer\"],[\"Role\",\"Aplicações, serviços da AWS e pessoas de outras contas\",\"Credencial temporária do STS (o ID começa com `ASIA`)\",\"De 15 minutos a 12 horas no `AssumeRole`; renovada sozinha em EC2, ECS e Lambda\"]]",
                    },
                    {
                        type: "text",
                        value: "A diferença que importa é **usuário** contra **role**. O usuário IAM tem credencial de longo prazo: a chave de acesso vale até alguém desativá-la, e quem a copiar usa a conta em nome dele pelo tempo que quiser. A **role** não tem senha nem chave: ela é assumida, e quem assume recebe do STS (Security Token Service) uma credencial temporária, com prazo de validade. As boas práticas do IAM dizem isso com todas as letras: pessoas entram por federação, de preferência pelo **IAM Identity Center**, e cargas de trabalho usam roles. Chave de longo prazo fica para o caso sem saída, como uma ferramenta de terceiro que só aceita chave.\n\n## A política decide\n\nUma **política** é um documento JSON com instruções (`Statement`). Cada instrução diz o efeito (`Effect`, que é `Allow` ou `Deny`), as ações (`Action`, como `s3:GetObject`), os recursos (`Resource`, pelo ARN, o identificador único de cada recurso na AWS) e, se precisar, as condições (`Condition`). Ela pode estar presa à identidade (política de identidade) ou ao próprio recurso (como a política de um bucket). Dentro de uma conta, a avaliação segue três regras: tudo começa negado; um `Allow` aplicável libera; um `Deny` explícito vence qualquer `Allow`. Esta é a política de que a API de pedidos precisa para guardar e ler comprovantes:",
                    },
                    {
                        type: "code",
                        value: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"LerEGravarComprovantes\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\"s3:GetObject\", \"s3:PutObject\"],\n      \"Resource\": \"arn:aws:s3:::pedidos-comprovantes-prod/comprovantes/*\"\n    },\n    {\n      \"Sid\": \"ListarSoOsComprovantes\",\n      \"Effect\": \"Allow\",\n      \"Action\": \"s3:ListBucket\",\n      \"Resource\": \"arn:aws:s3:::pedidos-comprovantes-prod\",\n      \"Condition\": {\n        \"StringLike\": { \"s3:prefix\": \"comprovantes/*\" }\n      }\n    }\n  ]\n}",
                    },
                    {
                        type: "text",
                        value: "Repare em duas coisas. Primeiro, `s3:ListBucket` é uma ação sobre o **bucket**, então o recurso é o ARN do bucket sem `/*`, enquanto ler e gravar são ações sobre **objetos**, com `/*`. Trocar um pelo outro é a causa mais comum de `AccessDenied` numa política que \"parece certa\". Segundo, o `Version` é a versão da linguagem de políticas, e a atual é `2012-10-17`: não é a data em que você escreveu o arquivo.\n\n## Privilégio mínimo sem paralisia\n\n**Privilégio mínimo** é dar só as ações, nos recursos e nas condições de que a tarefa precisa. A alternativa preguiçosa, `\"Action\": \"s3:*\"` com `\"Resource\": \"*\"`, dá à API o poder de apagar qualquer bucket da conta, inclusive o dos logs de auditoria. O caminho prático: comece pelas chamadas que o código faz (`GetObjectAsync` vira `s3:GetObject`), use uma política gerenciada da AWS só como ponto de partida e reduza com uma política sua. Duas ferramentas ajudam: o **IAM Access Analyzer** gera uma política a partir do que a role realmente chamou, registrado no CloudTrail (o registro de auditoria das chamadas à AWS), e as informações de **último acesso** mostram permissões que ninguém usa há meses. Mais adiante, no CDK, os métodos `Grant` escrevem essa política por você.\n\nToda role tem um segundo documento, a **política de confiança** (*trust policy*), que diz quem pode assumi-la. Esta deixa as tarefas do ECS assumirem a role da API:",
                    },
                    {
                        type: "code",
                        value: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Principal\": { \"Service\": \"ecs-tasks.amazonaws.com\" },\n      \"Action\": \"sts:AssumeRole\"\n    }\n  ]\n}",
                    },
                    {
                        type: "text",
                        value: "## Chave de acesso no código, nunca\n\nA política de permissão diz o que a role pode fazer; a de confiança diz quem pode virar a role. No código, a regra é uma só: credencial não aparece. Nem no `.cs`, nem no `appsettings.json`, nem num `ENV` do `Dockerfile`, nem no `user-secrets` com uma chave de longo prazo \"só na minha máquina\". O SDK sabe procurar a credencial no ambiente, e esse é o único jeito que funciona igual na máquina do dev e em produção:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: o jeito errado e o jeito certo de dar credencial ao SDK\n// dotnet add package AWSSDK.S3\nusing Amazon;\nusing Amazon.Runtime;\nusing Amazon.S3;\n\n// ERRADO: chave de longo prazo no código. Ela vai para o git, para o log do build,\n// para a imagem do contêiner e para quem tiver acesso a qualquer um deles.\nvar chaveFixa = new BasicAWSCredentials(\"AKIA-CHAVE-DE-EXEMPLO\", \"segredo-que-nunca-deveria-estar-aqui\");\nusing var s3Errado = new AmazonS3Client(chaveFixa, RegionEndpoint.SAEast1);\n\n// CERTO: nenhuma credencial no código. O SDK percorre a cadeia de credenciais:\n// o perfil do Identity Center na máquina do dev, a role no servidor ou no contêiner.\nusing var s3 = new AmazonS3Client(RegionEndpoint.SAEast1);\n\nvar buckets = await s3.ListBucketsAsync();\nforeach (var bucket in buckets.Buckets ?? [])\n    Console.WriteLine(bucket.BucketName);",
                    },
                    {
                        type: "text",
                        value: "## Se a chave vazou\n\nApagar o arquivo num commit novo não resolve: o histórico do git guarda a chave, e o que ficou público por um minuto deve ser tratado como comprometido. A ordem é esta: desativar e apagar a chave no IAM, primeiro; depois procurar no CloudTrail, em todas as regiões, o que foi feito com aquele access key ID; por fim, caçar o que o atacante criou (máquinas, usuários, roles, chaves novas). A quarentena da AWS ajuda, mas não substitui nenhum desses passos: a `AWSCompromisedKeyQuarantineV3` nega uma lista de ações caras ou perigosas, como subir instâncias, criar usuários, ler objetos do S3 e invocar modelos no Bedrock, e deixa todo o resto funcionando. Uma chave em quarentena ainda pode, por exemplo, ler segredos do Secrets Manager ou tabelas do DynamoDB, se a política do usuário permitir.",
                    },
                    {
                        type: "quote",
                        value: "Pessoas entram pelo Identity Center e aplicações usam roles, e as duas recebem credencial temporária. A política dá só o que a tarefa precisa, um Deny explícito vence qualquer Allow, e chave de acesso não entra no código nem no repositório.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma desenvolvedora vai usar a CLI e o SDK todo dia na conta de desenvolvimento. Qual identidade as boas práticas do IAM indicam para ela?",
                        difficulty: "facil",
                        options: [
                            { text: "Um usuário IAM, com a chave de acesso guardada no arquivo de credenciais", isCorrect: false },
                            { text: "O usuário root da conta, desde que protegido com MFA de hardware", isCorrect: false },
                            { text: "Uma role com chave de acesso fixa, gerada no console do IAM", isCorrect: false },
                            { text: "Um usuário do IAM Identity Center, que gera credenciais temporárias", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma role tem duas políticas: uma permite `s3:*` em todos os recursos e outra nega `s3:DeleteObject` no bucket de auditoria. A aplicação tenta apagar um objeto desse bucket. O que acontece?",
                        difficulty: "facil",
                        options: [
                            { text: "É negado, porque um Deny explícito vence qualquer Allow", isCorrect: true },
                            { text: "É permitido, porque a política mais ampla prevalece", isCorrect: false },
                            { text: "É permitido, porque vale a política que foi anexada por último", isCorrect: false },
                            { text: "Depende da ordem das instruções dentro de cada JSON", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A role da API tem esta instrução, e o `ListObjectsV2Async` no bucket `pedidos-comprovantes-prod` devolve `AccessDenied`. Por quê?\n```json\n{\n  \"Effect\": \"Allow\",\n  \"Action\": [\"s3:GetObject\", \"s3:PutObject\", \"s3:ListBucket\"],\n  \"Resource\": \"arn:aws:s3:::pedidos-comprovantes-prod/*\"\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Falta a ação `s3:ListAllMyBuckets`, exigida para listar objetos", isCorrect: false },
                            { text: "Falta a ação `s3:ListObjectsV2`, que é o nome da chamada no SDK", isCorrect: false },
                            { text: "O bucket precisa ter o acesso público liberado para a listagem", isCorrect: false },
                            { text: "`s3:ListBucket` vale para o ARN do bucket, sem o `/*` no final", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A chave de acesso de um usuário IAM foi commitada num repositório público. Dez minutos depois, o dev fez um novo commit removendo o arquivo. Qual deve ser o primeiro passo?",
                        difficulty: "medio",
                        options: [
                            { text: "Esperar a quarentena da AWS, que bloqueia a chave assim que ela é detectada", isCorrect: false },
                            { text: "Tornar o repositório privado, o que invalida na hora a chave que ficou exposta", isCorrect: false },
                            { text: "Reescrever o histórico do git para sumir com o commit que contém a chave", isCorrect: false },
                            { text: "Desativar e apagar a chave no IAM, e então investigar o uso dela no CloudTrail", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A AWS anexou a política `AWSCompromisedKeyQuarantineV3` ao usuário IAM cuja chave vazou, e ninguém mexeu na chave depois disso. O que continua verdade?",
                        difficulty: "dificil",
                        options: [
                            { text: "A chave ainda autentica e funciona para ações fora da lista que a política nega", isCorrect: true },
                            { text: "A política nega todas as ações de escrita e deixa liberadas só as de leitura", isCorrect: false },
                            { text: "A chave foi desativada pela AWS e não autentica mais nenhuma chamada à conta toda", isCorrect: false },
                            { text: "A conta inteira fica bloqueada até o caso de suporte ser encerrado pela AWS", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Custo desde o primeiro dia",
                blocks: [
                    {
                        type: "text",
                        value: "# Custo desde o primeiro dia\n\nUma equipe montou um ambiente de homologação \"igual ao de produção\" e esqueceu dele. A API em contêiner quase não recebeu acesso, mas a fatura do mês passou de 100 dólares. A conta fecha assim: dois NAT Gateways, um em cada zona, cerca de 66 dólares só por existirem; quatro IPv4 públicos, quase 15 dólares; e 50 GB de log em nível Debug no CloudWatch Logs, 25 dólares de ingestão, guardados para sempre. Ninguém \"usou\" nada disso. O que mais pesa na fatura raramente é o que você acha que está usando.\n\n## O Free Tier de hoje\n\nContas criadas desde 15 de julho de 2025 não têm mais o antigo modelo de um ano de uso gratuito por serviço. No cadastro, você recebe 100 dólares em créditos e pode ganhar até mais 100 dólares completando cinco atividades guiadas: subir uma instância EC2, testar um modelo no playground do Bedrock, criar um orçamento no AWS Budgets, montar um app web com uma função Lambda e criar um banco no RDS. E escolhe entre dois planos:",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\",\"Plano gratuito\",\"Plano pago\"],[\"Cobrança\",\"Nenhuma, em momento algum\",\"O que passar do crédito, ou o que o crédito não cobre\"],[\"Serviços\",\"Um subconjunto: fica de fora o que torraria o crédito rápido, como Savings Plans e Reserved Instances\",\"Todos\"],[\"Ofertas\",\"Sempre gratuitas (mais de 30 serviços com cota mensal)\",\"Sempre gratuitas e testes de curto prazo\"],[\"Fim\",\"Em 6 meses ou quando o crédito acaba, o que vier primeiro; a conta fecha, e dá para passar ao plano pago em até 90 dias sem perder os dados\",\"Não fecha quando o crédito acaba\"],[\"Para quê\",\"Estudar e fazer prova de conceito\",\"Sistema de verdade, que não pode sumir\"]]",
                    },
                    {
                        type: "text",
                        value: "O plano gratuito é ótimo para estudar justamente porque não cobra: o pior que acontece é a conta fechar. O risco mora no plano pago, que é onde roda sistema de verdade. Ali o crédito cobre o começo, a fatura chega zerada por alguns meses e a equipe se acostuma. Quando o crédito acaba, a cobrança começa no mesmo dia, e o aviso que importa é o que você mesmo configurou. Custo se acompanha desde o primeiro dia, com crédito ou sem.\n\n## O critério: o que cobra por hora cobra parado\n\nToda linha da fatura cai em um de dois tipos. **Por tempo**: recurso ligado paga por hora, com ou sem tráfego (NAT Gateway, load balancer, IPv4 público, máquina, banco). **Por volume**: paga por GB processado, transferido ou ingerido, ou por requisição. O piso mensal de um recurso cobrado por tempo é o preço da hora vezes 730, a média de horas de um mês. É essa conta, feita antes de criar o recurso, que evita a surpresa. Os itens que mais assustam quem está começando, com preços de `us-east-1` em outubro de 2026:",
                    },
                    {
                        type: "table",
                        value: "[[\"Item\",\"Como cobra\",\"Ordem de grandeza\",\"Armadilha\"],[\"NAT Gateway\",\"0,045 dólar por hora e 0,045 dólar por GB processado\",\"Cerca de 33 dólares por mês parado, por NAT\",\"Um por zona multiplica o piso; todo tráfego da sub-rede privada para fora passa por ele e paga por GB\"],[\"IPv4 público\",\"0,005 dólar por hora por endereço, em uso ou parado\",\"Cerca de 3,65 dólares por mês por endereço\",\"Load balancer público e NAT Gateway também ocupam IPv4 públicos\"],[\"CloudWatch Logs\",\"0,50 dólar por GB ingerido e 0,03 dólar por GB guardado por mês\",\"10 GB por dia viram cerca de 150 dólares por mês de ingestão\",\"A retenção padrão de um grupo de logs é nunca expirar\"],[\"Saída para a internet\",\"100 GB por mês grátis, somando todos os serviços; depois, 0,09 dólar por GB\",\"1.000 GB num mês saem por cerca de 81 dólares\",\"Arquivo grande servido direto pela API ou pelo bucket\"],[\"Tráfego entre zonas\",\"0,01 dólar por GB em cada sentido\",\"10 TB por mês entre zonas custam cerca de 200 dólares\",\"Serviços que conversam muito, cada um numa zona\"]]",
                    },
                    {
                        type: "text",
                        value: "Três erros aparecem em quase toda conta nova. O primeiro é o NAT Gateway em ambiente que não precisa dele: em desenvolvimento, um NAT só, ou nenhum, costuma bastar, e o desenho certo da rede vem mais adiante. O segundo é log sem retenção e em nível Debug: o grupo criado sem retenção guarda tudo para sempre, e o custo de ingestão vem do volume, então nível de log em produção é decisão de custo. O terceiro é o recurso esquecido em outra região, que não aparece no console enquanto você olha a sua.\n\nO IPv4 público merece atenção à parte. Desde fevereiro de 2024, todo IPv4 público custa 0,005 dólar por hora, em uso ou parado, inclusive os que serviços gerenciados alocam. Antes, só o Elastic IP parado era cobrado, e muito material antigo ainda ensina assim.\n\n## AWS Budgets: alarme, não teto\n\nO **AWS Budgets** acompanha o gasto contra um valor e avisa por e-mail ou por um tópico do SNS (o serviço de notificações da AWS) quando o gasto real ou a previsão passam de um limite. Acompanhar e notificar é gratuito; só os orçamentos com ação automática custam, e mesmo assim os dois primeiros são grátis (depois, 0,10 dólar por dia cada). Dois avisos bastam para começar, 80% do gasto real e 100% da previsão do mês. Pela CLI:",
                    },
                    {
                        type: "code",
                        value: "# terminal: orçamento mensal de 50 dólares para a conta de desenvolvimento\naws budgets create-budget \\\n    --account-id 111122223333 \\\n    --budget file://orcamento.json \\\n    --notifications-with-subscribers file://alertas.json\n\n# orcamento.json\n{\n    \"BudgetName\": \"conta-dev-mensal\",\n    \"BudgetType\": \"COST\",\n    \"TimeUnit\": \"MONTHLY\",\n    \"BudgetLimit\": { \"Amount\": \"50\", \"Unit\": \"USD\" }\n}\n\n# alertas.json: 80% do gasto real e 100% da previsão\n[\n    {\n        \"Notification\": {\n            \"NotificationType\": \"ACTUAL\",\n            \"ComparisonOperator\": \"GREATER_THAN\",\n            \"Threshold\": 80,\n            \"ThresholdType\": \"PERCENTAGE\"\n        },\n        \"Subscribers\": [{ \"SubscriptionType\": \"EMAIL\", \"Address\": \"time-pedidos@exemplo.com.br\" }]\n    },\n    {\n        \"Notification\": {\n            \"NotificationType\": \"FORECASTED\",\n            \"ComparisonOperator\": \"GREATER_THAN\",\n            \"Threshold\": 100,\n            \"ThresholdType\": \"PERCENTAGE\"\n        },\n        \"Subscribers\": [{ \"SubscriptionType\": \"EMAIL\", \"Address\": \"time-pedidos@exemplo.com.br\" }]\n    }\n]",
                    },
                    {
                        type: "text",
                        value: "O título da seção diz o principal: orçamento é **alarme, não teto**. O Budgets atualiza os números até três vezes por dia, e a própria documentação avisa que o gasto pode passar do limite antes de a notificação chegar. Ele não desliga nada sozinho. Existem as ações de orçamento, que aplicam uma política do IAM, uma política da organização ou param instâncias EC2 e RDS quando o limite é atingido, mas elas chegam com o mesmo atraso. Para o susto que vem de um padrão estranho, e não de um valor, existe o **Cost Anomaly Detection**, que aprende o gasto normal da conta e avisa quando algo foge dele.\n\n## Quem gastou: tags e Cost Explorer\n\nPara saber quem gastou, marque os recursos com **tags** de alocação de custo, como `Projeto` e `Ambiente`, e ative essas chaves no console de Billing: só tags ativadas aparecem agrupadas nos relatórios. O **Cost Explorer** mostra o gasto por serviço, região, tag e dia, e tem API. Este programa responde à pergunta que mais se faz numa conta nova, \"o que está custando\":",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: quanto cada serviço custou nos últimos 30 dias\n// dotnet add package AWSSDK.CostExplorer\nusing System.Globalization;\nusing Amazon;\nusing Amazon.CostExplorer;\nusing Amazon.CostExplorer.Model;\n\n// a API do Cost Explorer só atende em us-east-1, seja qual for a região do sistema,\n// e cada chamada custa 0,01 dólar: nada de rodar isso num loop\nusing var ce = new AmazonCostExplorerClient(RegionEndpoint.USEast1);\n\nvar hoje = DateOnly.FromDateTime(DateTime.UtcNow);\n\nvar resposta = await ce.GetCostAndUsageAsync(new GetCostAndUsageRequest\n{\n    // o fim do intervalo é exclusivo: o dia de hoje fica de fora\n    TimePeriod = new DateInterval\n    {\n        Start = hoje.AddDays(-30).ToString(\"yyyy-MM-dd\"),\n        End = hoje.ToString(\"yyyy-MM-dd\")\n    },\n    Granularity = Granularity.MONTHLY,\n    Metrics = [\"UnblendedCost\"],\n    GroupBy = [new GroupDefinition { Type = GroupDefinitionType.DIMENSION, Key = \"SERVICE\" }]\n});\n\n// 30 dias podem cruzar dois meses: soma os períodos por serviço\nvar porServico = (resposta.ResultsByTime ?? [])\n    .SelectMany(periodo => periodo.Groups ?? [])\n    .GroupBy(grupo => grupo.Keys[0])\n    .Select(g => (Servico: g.Key, Valor: g.Sum(x =>\n        decimal.Parse(x.Metrics[\"UnblendedCost\"].Amount, CultureInfo.InvariantCulture))))\n    .OrderByDescending(x => x.Valor);\n\nforeach (var (servico, valor) in porServico)\n    Console.WriteLine($\"{valor,10:F2} USD  {servico}\");",
                    },
                    {
                        type: "quote",
                        value: "Recurso que cobra por hora cobra parado: multiplique por 730 antes de criar. NAT Gateway, IPv4 público, log sem retenção e tráfego de saída são as surpresas clássicas, e o AWS Budgets avisa com atraso, mas não segura o gasto.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma conta nova, criada em outubro de 2026, escolheu o plano gratuito. Quando esse plano termina?",
                        difficulty: "facil",
                        options: [
                            { text: "Só quando o crédito acabar, sem nenhum prazo de calendário", isCorrect: false },
                            { text: "No primeiro mês em que o uso passar da cota gratuita mensal", isCorrect: false },
                            { text: "Em doze meses, que é o prazo do nível gratuito de cada serviço", isCorrect: false },
                            { text: "Em seis meses ou quando o crédito acabar, o que vier primeiro", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Desde fevereiro de 2024, como a AWS cobra os endereços IPv4 públicos?",
                        difficulty: "facil",
                        options: [
                            { text: "Sem cobrança, enquanto o endereço estiver ligado a uma máquina", isCorrect: false },
                            { text: "Por GB, só o tráfego que passa pelo endereço rumo à internet", isCorrect: false },
                            { text: "Por hora, só o Elastic IP parado, sem nada associado a ele", isCorrect: false },
                            { text: "Por hora, cada endereço, em uso ou parado, em qualquer serviço", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma equipe criou um orçamento de 50 dólares no AWS Budgets, com aviso em 100% do gasto real. Num fim de semana, um script em loop gera 300 dólares de custo. O que o orçamento fez?",
                        difficulty: "medio",
                        options: [
                            { text: "Passou a conta para o plano gratuito até o começo do mês seguinte", isCorrect: false },
                            { text: "Bloqueou novas cobranças na conta assim que o gasto chegou a 50 dólares", isCorrect: false },
                            { text: "Desligou os recursos responsáveis pelo gasto acima do valor do orçamento", isCorrect: false },
                            { text: "Avisou por e-mail, com horas de atraso, e o gasto seguiu até alguém agir", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma API em `us-east-1` passou a gravar 10 GB de log por dia em nível Debug no CloudWatch Logs, que cobra 0,50 dólar por GB ingerido. O grupo de logs foi criado sem retenção. Qual é o problema de custo?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 150 dólares por mês, mas a AWS apaga os registros depois de 30 dias", isCorrect: false },
                            { text: "Cerca de 150 dólares por mês de ingestão, e o volume guardado cresce sem parar", isCorrect: true },
                            { text: "Nenhum, porque o CloudWatch Logs só cobra quando alguém faz uma consulta nos registros", isCorrect: false },
                            { text: "Cerca de 5 dólares por mês, porque só o armazenamento do log entra na conta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um ambiente de homologação em `us-east-1` tem 2 NAT Gateways, a 0,045 dólar por hora cada e 0,045 dólar por GB processado. Juntos, eles processam 200 GB no mês. Quanto custam os NATs no mês, aproximadamente?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cerca de 42 dólares: 33 das horas de um NAT e 9 do volume", isCorrect: false },
                            { text: "Cerca de 66 dólares: as horas dos dois NATs, sem cobrar volume", isCorrect: false },
                            { text: "Cerca de 75 dólares: 66 das horas dos dois NATs e 9 do volume", isCorrect: true },
                            { text: "Cerca de 9 dólares: só os 200 GB processados entram na conta", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "CLI e SDK para .NET",
                blocks: [
                    {
                        type: "text",
                        value: "# CLI e SDK para .NET\n\nNa máquina da Ana, a API lista os comprovantes do bucket. No servidor de homologação, o mesmo código, do mesmo commit, responde `AccessDenied`. No contêiner que o Bruno sobe no notebook, a API nem inicia: `Failed to resolve AWS credentials`. Ninguém mexeu no código. O que muda de um lugar para o outro é **de onde vem a credencial**, e quem não sabe como o SDK a procura passa a tarde trocando variável de ambiente no escuro.\n\n## A CLI com perfis do Identity Center\n\nA AWS CLI v2 guarda a configuração em `~/.aws/config`, organizada em **perfis**: cada perfil diz qual conta, qual role e qual região usar. Com o IAM Identity Center, o comando `aws configure sso` monta o perfil por você, e o arquivo fica assim, sem nenhuma chave de acesso:",
                    },
                    {
                        type: "code",
                        value: "# ~/.aws/config\n[sso-session empresa]\nsso_start_url = https://empresa-exemplo.awsapps.com/start\nsso_region = us-east-1\nsso_registration_scopes = sso:account:access\n\n[profile dev]\nsso_session = empresa\nsso_account_id = 111111111111\nsso_role_name = DesenvolvedorPedidos\nregion = sa-east-1\n\n[profile prod-leitura]\nsso_session = empresa\nsso_account_id = 222222222222\nsso_role_name = LeituraProducao\nregion = sa-east-1\n\n# terminal\naws sso login --sso-session empresa       # abre o navegador uma vez por sessão\naws sts get-caller-identity --profile dev  # quem sou eu, e em qual conta\nexport AWS_PROFILE=dev                     # perfil padrão deste terminal\naws s3 ls",
                    },
                    {
                        type: "text",
                        value: "O `sso_region` é a região onde o Identity Center foi ativado, não a dos seus recursos; essa é o `region` de cada perfil. O `aws sso login` guarda um token da sessão em `~/.aws/sso/cache`, e a partir dele a CLI e o SDK pedem credenciais temporárias da role e as renovam sozinhos enquanto a sessão valer. Quando ela expira, é só entrar de novo. E o `aws sts get-caller-identity` é o primeiro comando de qualquer investigação de `AccessDenied`: antes de discutir a política, confirme qual identidade está fazendo a chamada.\n\n## A cadeia de credenciais do SDK\n\nO SDK para .NET está na versão 4, a única com suporte desde que a versão 3 chegou ao fim, em 1º de junho de 2026. Ele procura credenciais numa ordem fixa e usa **a primeira que encontrar**:",
                    },
                    {
                        type: "table",
                        value: "[[\"Ordem\",\"Onde o SDK v4 procura\",\"Quando aparece\"],[\"1\",\"Credencial passada ao cliente no código\",\"Quase nunca deveria: é o caminho da chave fixa\"],[\"2\",\"Variáveis `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` (e `AWS_SESSION_TOKEN`)\",\"Credencial temporária exportada para um terminal ou um contêiner\"],[\"3\",\"Web identity: `AWS_WEB_IDENTITY_TOKEN_FILE` e `AWS_ROLE_ARN`\",\"Federação por OIDC, como pods do EKS com role por service account\"],[\"4\",\"Perfil: `AWSConfigs.AWSProfileName`, depois `AWS_PROFILE`, depois `[default]`\",\"Máquina do desenvolvedor\"],[\"5\",\"Provedor de contêiner, no endpoint de `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` ou `AWS_CONTAINER_CREDENTIALS_FULL_URI`\",\"Task role do ECS e EKS Pod Identity\"],[\"6\",\"Metadata da instância EC2 (na versão 4, só IMDSv2)\",\"Role da instância EC2\"]]",
                    },
                    {
                        type: "text",
                        value: "A ordem tem duas consequências práticas. A primeira: **na versão 4, variável de chave vence perfil**. Na versão 3 era o contrário, os perfis vinham antes das variáveis, então quem migrou com um `AWS_ACCESS_KEY_ID` esquecido no ambiente viu as chamadas mudarem de conta sem mudar uma linha de código. A segunda: no contêiner, uma chave posta em variável de ambiente \"porque a role não funcionava\" passa na frente da task role e a anula, e a API passa a rodar com a chave de um usuário, com todos os riscos de credencial de longo prazo. Quando nada é encontrado, o SDK diz o que tentou: `Failed to resolve AWS credentials`, seguido do erro de cada provedor da cadeia.\n\n## No ASP.NET Core\n\nO pacote `AWSSDK.Extensions.NETCore.Setup` liga o SDK à configuração e à injeção de dependência. O `AddAWSService` registra cada cliente como singleton, que é o recomendado: os clientes são thread-safe e caros de criar.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da API de pedidos\n// dotnet add package AWSSDK.Extensions.NETCore.Setup\n// dotnet add package AWSSDK.S3\n// dotnet add package AWSSDK.SecurityToken\nusing Amazon.S3;\nusing Amazon.S3.Model;\nusing Amazon.SecurityToken;\nusing Amazon.SecurityToken.Model;\n\nvar builder = WebApplication.CreateBuilder(args);\n\n// lê a seção \"AWS\" da configuração; sem \"Profile\", vale a cadeia de credenciais\nbuilder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());\nbuilder.Services.AddAWSService<IAmazonS3>();                    // singleton por padrão\nbuilder.Services.AddAWSService<IAmazonSecurityTokenService>();\n\nvar app = builder.Build();\n\n// na subida, registra qual identidade o SDK encontrou: é a primeira pista num AccessDenied\nvar sts = app.Services.GetRequiredService<IAmazonSecurityTokenService>();\nvar identidade = await sts.GetCallerIdentityAsync(new GetCallerIdentityRequest());\napp.Logger.LogInformation(\"AWS: conta {Conta}, identidade {Arn}\", identidade.Account, identidade.Arn);\n\napp.MapGet(\"/comprovantes\", async (IAmazonS3 s3, IConfiguration config, CancellationToken ct) =>\n{\n    var resposta = await s3.ListObjectsV2Async(new ListObjectsV2Request\n    {\n        BucketName = config[\"Comprovantes:Bucket\"],\n        Prefix = \"comprovantes/\",\n        MaxKeys = 50\n    }, ct);\n\n    return TypedResults.Ok((resposta.S3Objects ?? []).Select(o => new { o.Key, o.Size }));\n});\n\napp.Run();",
                    },
                    {
                        type: "text",
                        value: "No `appsettings.Development.json`, a seção `\"AWS\": { \"Profile\": \"dev\", \"Region\": \"sa-east-1\" }` faz a API usar o perfil do Identity Center na sua máquina. No `appsettings.json` que vai para produção não entra `Profile`: sem ele, o SDK percorre a cadeia e encontra a role do ambiente. O log de subida com a conta e o ARN da identidade custa uma chamada ao STS e economiza horas: o `AccessDenied` de homologação da Ana aparece na hora como \"a API está rodando com a identidade errada\".\n\n## Role na máquina e no contêiner\n\nEm produção a credencial nunca é configurada à mão: ela vem do lugar onde a API roda. Na EC2, a role da instância chega pelo serviço de metadata da instância (IMDS; o SDK v4 só usa a versão 2, que exige token). No ECS, a **task role** chega por um endpoint de credenciais que o ECS informa ao contêiner numa variável de ambiente; a diferença entre ela e a outra role da tarefa, a de execução, fica para o estudo de contêineres. Na sua máquina, o contêiner não tem nada disso, e a saída segura é passar a ele a credencial temporária do seu perfil:",
                    },
                    {
                        type: "table",
                        value: "[[\"Onde a API roda\",\"De onde vem a credencial\",\"O que configurar\"],[\"Máquina do desenvolvedor\",\"Perfil do Identity Center\",\"`aws sso login` e `AWS_PROFILE`, ou `Profile` no appsettings de desenvolvimento\"],[\"EC2\",\"Role da instância, pelo metadata (IMDSv2)\",\"Um instance profile com a role, associado à instância\"],[\"ECS, com Fargate ou EC2\",\"Task role, pelo endpoint de credenciais do contêiner\",\"A task role na task definition; o ECS injeta a variável que o SDK lê\"],[\"EKS\",\"EKS Pod Identity, pelo mesmo provedor de contêiner\",\"A associação entre a service account e a role\"],[\"Docker na máquina do dev\",\"Credencial temporária exportada do perfil\",\"`aws configure export-credentials` e as variáveis repassadas ao contêiner\"]]",
                    },
                    {
                        type: "code",
                        value: "# terminal: a API em Docker local, com credencial temporária do perfil dev\naws sso login --profile dev\neval \"$(aws configure export-credentials --profile dev --format env)\"\n\n# -e sem valor repassa ao contêiner a variável que está no terminal\ndocker run --rm -p 8080:8080 \\\n    -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_SESSION_TOKEN \\\n    -e AWS_REGION=sa-east-1 \\\n    -e Comprovantes__Bucket=pedidos-comprovantes-dev \\\n    pedidos-api:dev\n\n# atenção: neste terminal as variáveis agora vencem o AWS_PROFILE (ordem da cadeia),\n# e a credencial é temporária: quando expirar, exporte de novo",
                    },
                    {
                        type: "quote",
                        value: "A CLI e o SDK encontram a credencial sozinhos: o perfil do Identity Center na sua máquina, a role da instância ou da tarefa em produção. Na versão 4 do SDK a primeira fonte da cadeia vence e variável de chave passa na frente do perfil, então quem controla o ambiente controla a identidade.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma chamada da API devolve `AccessDenied`, e a primeira dúvida é com qual identidade ela está rodando. Qual comando da CLI responde isso para o perfil `dev`?",
                        difficulty: "facil",
                        options: [
                            { text: "`aws sts get-caller-identity --profile dev`", isCorrect: true },
                            { text: "`aws configure get region --profile dev`", isCorrect: false },
                            { text: "`aws configure list-profiles --output table`", isCorrect: false },
                            { text: "`aws iam get-user --profile dev --output json`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de rodar `aws sso login --profile dev`, o que fica guardado na máquina?",
                        difficulty: "facil",
                        options: [
                            { text: "A senha do portal de acesso, criptografada dentro do arquivo `~/.aws/config`", isCorrect: false },
                            { text: "Um certificado de cliente, instalado no repositório de certificados do sistema", isCorrect: false },
                            { text: "Um token da sessão do Identity Center, usado para obter credenciais temporárias", isCorrect: true },
                            { text: "Uma chave de acesso de longo prazo, gravada no arquivo `~/.aws/credentials` do usuário", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa tarefa do ECS com Fargate e task role configurada, como o SDK para .NET obtém as credenciais da role?",
                        difficulty: "medio",
                        options: [
                            { text: "Pelo endpoint de credenciais do contêiner, indicado numa variável que o ECS injeta", isCorrect: true },
                            { text: "Por um arquivo de credenciais que o ECS monta no `~/.aws` de dentro do contêiner", isCorrect: false },
                            { text: "Pelo serviço de metadata da instância EC2 que hospeda a tarefa, em 169.254.169.254", isCorrect: false },
                            { text: "Pelas variáveis `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` que o ECS preenche", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para rodar a API em Docker na própria máquina, com acesso à conta de desenvolvimento, qual é o caminho mais seguro?",
                        difficulty: "medio",
                        options: [
                            { text: "Criar um usuário IAM restrito ao bucket de dev e passar a chave no `docker run`", isCorrect: false },
                            { text: "Copiar o diretório `~/.aws` para a imagem num estágio de build descartado", isCorrect: false },
                            { text: "Exportar a credencial temporária do perfil e repassar as variáveis ao contêiner", isCorrect: true },
                            { text: "Usar a role da instância pelo metadata, que o Docker expõe na máquina local", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma aplicação migrou do SDK para .NET v3 para o v4. No servidor de build existem `AWS_PROFILE=build` e também `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` de outra conta, esquecidas ali. Antes da migração, as chamadas iam para a conta do perfil; depois, foram para a outra conta. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "Na v4, o `AWS_PROFILE` deixou de ser lido e só vale o perfil `[default]`", isCorrect: false },
                            { text: "Na v4, as variáveis de chave vêm antes dos perfis na cadeia de credenciais", isCorrect: true },
                            { text: "Na v4, a credencial de perfil passou a exigir login no Identity Center", isCorrect: false },
                            { text: "Na v4, a cadeia escolhe a credencial mais recente entre todas as que encontra", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Infraestrutura como código com CDK em C#",
                blocks: [
                    {
                        type: "text",
                        value: "# Infraestrutura como código com CDK em C#\n\nSeis meses depois do primeiro deploy feito no console, a conta tem três buckets com nomes parecidos, uma role chamada `teste-api-2` que ninguém sabe se pode apagar, e montar uma homologação igual à produção levou dois dias de capturas de tela. Ninguém errou de propósito: o console não guarda o porquê, não passa por revisão e não sabe recriar o que fez. **Infraestrutura como código** resolve isso pondo a infraestrutura no repositório, revisada em pull request, comparada antes de ser aplicada e recriável com um comando.\n\n## O que é o CDK\n\nO **AWS CDK** (Cloud Development Kit) é um framework em que você descreve a infraestrutura em C# e ele **sintetiza** um template do **CloudFormation**, o serviço da AWS que cria, altera e apaga os recursos e guarda o estado de cada **stack**. O código vira template; o CloudFormation aplica o template. Três peças aparecem em todo projeto: o **App**, raiz do programa; a **Stack**, unidade de deploy, que vira uma stack do CloudFormation numa conta e numa região (o par que o CDK chama de *environment*); e o **construct**, o bloco de montar, que vem em três níveis:",
                    },
                    {
                        type: "table",
                        value: "[[\"Nível\",\"O que é\",\"Exemplo em C#\"],[\"L1\",\"Espelho de um recurso do CloudFormation, propriedade por propriedade, sem padrões\",\"`new CfnBucket(...)`\"],[\"L2\",\"Recurso com padrões sensatos e métodos que geram o que falta, como políticas\",\"`new Bucket(...)` e `bucket.GrantReadWrite(role)`\"],[\"L3\",\"Padrão que monta vários recursos de uma vez para um caso comum\",\"Um serviço de contêiner já com load balancer, em poucas linhas\"]]",
                    },
                    {
                        type: "text",
                        value: "## Uma stack pequena\n\nO CDK tem duas partes: a CLI, uma ferramenta de Node.js (`npm install -g aws-cdk`, ou `npx aws-cdk` sem instalar), e a biblioteca, o pacote NuGet `Amazon.CDK.Lib`. O `cdk init app --language csharp` cria o projeto com um `cdk.json`, cujo campo `app` diz como rodar o programa (`dotnet run --project src/...`), e uma solução em `src/`. Em outubro de 2026 o template ainda gera o projeto em `net8.0`, versão que sai de suporte em 10 de novembro de 2026: troque para `net10.0`. A stack abaixo cria o bucket dos comprovantes e a role que a API vai usar:",
                    },
                    {
                        type: "code",
                        value: "// src/Infra/ArquivosStack.cs\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.IAM;\nusing Amazon.CDK.AWS.S3;\nusing Constructs;\n\nnamespace Infra;\n\npublic class ArquivosStack : Stack\n{\n    public ArquivosStack(Construct scope, string id, IStackProps? props = null)\n        : base(scope, id, props)\n    {\n        var comprovantes = new Bucket(this, \"Comprovantes\", new BucketProps\n        {\n            BlockPublicAccess = BlockPublicAccess.BLOCK_ALL,\n            Encryption = BucketEncryption.S3_MANAGED,\n            EnforceSSL = true,                     // nega qualquer acesso sem TLS\n            Versioned = true,\n            RemovalPolicy = RemovalPolicy.RETAIN   // apagar a stack não apaga os comprovantes\n        });\n\n        // a identidade que a API vai assumir quando rodar em contêiner\n        var apiRole = new Role(this, \"ApiRole\", new RoleProps\n        {\n            AssumedBy = new ServicePrincipal(\"ecs-tasks.amazonaws.com\")\n        });\n\n        // o construct L2 escreve a política: leitura e escrita só neste bucket\n        comprovantes.GrantReadWrite(apiRole);\n\n        // dentro da Stack, \"Tags\" sozinho é a propriedade da própria stack: qualifique\n        Amazon.CDK.Tags.Of(this).Add(\"Projeto\", \"pedidos\");\n\n        new CfnOutput(this, \"NomeDoBucket\", new CfnOutputProps { Value = comprovantes.BucketName });\n    }\n}",
                    },
                    {
                        type: "code",
                        value: "// src/Infra/Program.cs\nusing Amazon.CDK;\nusing Infra;\n\nvar app = new App();\n\nnew ArquivosStack(app, \"PedidosArquivosDev\", new StackProps\n{\n    // a CLI do CDK preenche estas variáveis com a conta e a região do perfil em uso\n    Env = new Amazon.CDK.Environment\n    {\n        Account = System.Environment.GetEnvironmentVariable(\"CDK_DEFAULT_ACCOUNT\"),\n        Region = System.Environment.GetEnvironmentVariable(\"CDK_DEFAULT_REGION\")\n    }\n});\n\napp.Synth();",
                    },
                    {
                        type: "text",
                        value: "## O fluxo: synth, diff, deploy\n\nAntes do primeiro deploy, cada par de conta e região passa uma vez pelo `cdk bootstrap`, que cria a stack `CDKToolkit` com um bucket S3, um repositório no ECR (o registro de imagens de contêiner) e as roles que o CDK usa para publicar e implantar. Depois disso, o ciclo é sempre o mesmo:",
                    },
                    {
                        type: "table",
                        value: "[[\"Comando\",\"O que faz\",\"Fala com a conta?\"],[\"`cdk synth`\",\"Roda o programa C# e grava o template do CloudFormation em `cdk.out`\",\"Não, se a stack não consultar nada na conta\"],[\"`cdk diff`\",\"Compara o template novo com a stack implantada e mostra o que entra, sai e muda\",\"Sim\"],[\"`cdk deploy`\",\"Cria um change set (a lista de mudanças que o CloudFormation calcula) e o executa; pede confirmação se as permissões forem ampliadas\",\"Sim\"],[\"`cdk destroy`\",\"Apaga a stack; recursos com `RemovalPolicy.RETAIN` ficam na conta\",\"Sim\"],[\"`cdk bootstrap`\",\"Prepara um par de conta e região para receber deploys do CDK\",\"Sim\"]]",
                    },
                    {
                        type: "code",
                        value: "# cdk synth (trecho): o bucket com os padrões que a stack pediu\nResources:\n  ComprovantesE96EE5E6:\n    Type: AWS::S3::Bucket\n    Properties:\n      BucketEncryption:\n        ServerSideEncryptionConfiguration:\n          - ServerSideEncryptionByDefault:\n              SSEAlgorithm: AES256\n      PublicAccessBlockConfiguration:\n        BlockPublicAcls: true\n        BlockPublicPolicy: true\n        IgnorePublicAcls: true\n        RestrictPublicBuckets: true\n      Tags:\n        - Key: Projeto\n          Value: pedidos\n      VersioningConfiguration:\n        Status: Enabled\n    UpdateReplacePolicy: Retain\n    DeletionPolicy: Retain\n\n# cdk synth (trecho): a política que o GrantReadWrite escreveu para a role\n  ApiRoleDefaultPolicyCFEBAD31:\n    Type: AWS::IAM::Policy\n    Properties:\n      PolicyDocument:\n        Statement:\n          - Action:\n              - s3:GetObject*\n              - s3:GetBucket*\n              - s3:List*\n              - s3:DeleteObject*\n              - s3:PutObject\n              - s3:PutObjectLegalHold\n              - s3:PutObjectRetention\n              - s3:PutObjectTagging\n              - s3:PutObjectVersionTagging\n              - s3:Abort*\n            Effect: Allow\n            Resource:\n              - Fn::GetAtt:\n                  - ComprovantesE96EE5E6\n                  - Arn\n              - Fn::Join:\n                  - \"\"\n                  - - Fn::GetAtt:\n                        - ComprovantesE96EE5E6\n                        - Arn\n                    - /*\n\n# cdk diff (trecho), depois de trocar o ID \"Comprovantes\" por \"ArquivosComprovantes\"\nResources\n[-] AWS::S3::Bucket Comprovantes ComprovantesE96EE5E6 orphan\n[-] AWS::S3::BucketPolicy Comprovantes/Policy ComprovantesPolicyA3069E53 destroy\n[+] AWS::S3::Bucket ArquivosComprovantes ArquivosComprovantesDA268613\n[+] AWS::S3::BucketPolicy ArquivosComprovantes/Policy ArquivosComprovantesPolicy34E25B73\n[~] AWS::IAM::Policy ApiRole/DefaultPolicy ApiRoleDefaultPolicyCFEBAD31",
                    },
                    {
                        type: "text",
                        value: "O synth acima rodou sem credencial nenhuma, e o diff foi feito contra o template anterior salvo em arquivo (`cdk diff --template`); contra a stack implantada, a saída tem a mesma forma. Repare que o `EnforceSSL` também gerou uma política no bucket que nega qualquer acesso sem TLS, e que o `GrantReadWrite` limitou tudo ao ARN deste bucket e dos objetos dele.\n\n## Armadilhas que custam caro\n\nO CloudFormation reconhece cada recurso pelo **ID lógico**, que o CDK deriva do caminho do construct (`ComprovantesE96EE5E6` vem de `\"Comprovantes\"`). Trocar o ID num refactor inocente não renomeia nada: o diff mostra um bucket novo a criar e o antigo saindo da stack. Com `RETAIN`, o antigo fica órfão na conta, com os dados e o custo; com `RemovalPolicy.DESTROY` e `AutoDeleteObjects`, os comprovantes seriam apagados. Por isso o `cdk diff` é leitura obrigatória antes de todo deploy: procure `[-]` em recurso que guarda dados e qualquer mudança de IAM. Sem `RemovalPolicy`, o `Bucket` já retém por padrão, e `DESTROY` só faz sentido em ambiente descartável.\n\nDuas pegadinhas do C#: dentro de uma `Stack`, `Tags` sozinho é a propriedade da própria stack, então a chamada estática precisa de `Amazon.CDK.Tags.Of(this)`; e `Environment` existe em `System` e em `Amazon.CDK`, daí os nomes completos no `Program.cs`.\n\n## Por que não clicar no console\n\nO console continua ótimo para ler, investigar e aprender. Criar e mudar recurso por ele é o que sai caro: não há revisão, não há histórico do porquê, a homologação nunca fica igual à produção e ninguém sabe o que pode ser apagado. E quem altera no console um recurso que pertence a uma stack cria **drift**, a diferença entre o template e a realidade, que o próximo deploy pode desfazer sem aviso ou fazer falhar. A regra do time: o que existe na conta está no repositório, e muda por pull request, com o `cdk diff` no meio.",
                    },
                    {
                        type: "quote",
                        value: "O CDK transforma C# em template do CloudFormation, e o CloudFormation aplica: `cdk synth` gera, `cdk diff` mostra e `cdk deploy` executa. Construct L2 traz padrões seguros e escreve a política de privilégio mínimo, e o que existe na conta muda por código revisado, não por clique.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o `cdk synth` faz?",
                        difficulty: "facil",
                        options: [
                            { text: "Compara o código com a stack implantada e lista o que vai mudar nela", isCorrect: false },
                            { text: "Cria os recursos na conta e mostra no terminal tudo o que acabou de mudar", isCorrect: false },
                            { text: "Prepara a conta com o bucket e as roles que o CDK usa nos deploys", isCorrect: false },
                            { text: "Roda o app e gera o template do CloudFormation, sem criar nada na conta", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é a principal vantagem de criar a infraestrutura com o CDK em vez de clicar no console?",
                        difficulty: "facil",
                        options: [
                            { text: "A infraestrutura fica versionada, revisada em pull request e recriável com um comando", isCorrect: true },
                            { text: "Os recursos criados pelo CDK custam menos que os mesmos recursos criados direto no console", isCorrect: false },
                            { text: "Recursos criados pelo CDK ficam travados e ninguém consegue alterá-los no console", isCorrect: false },
                            { text: "O CDK dispensa permissões do IAM para criar recursos, porque usa o CloudFormation", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma stack tem um `Bucket` sem `RemovalPolicy` definido. Alguém roda `cdk destroy` nessa stack. O que acontece com o bucket?",
                        difficulty: "medio",
                        options: [
                            { text: "Vai para uma lixeira da conta e é apagado sozinho depois de 30 dias", isCorrect: false },
                            { text: "É apagado com a stack, e leva junto todos os objetos que estavam guardados nele", isCorrect: false },
                            { text: "O destroy falha e só termina depois que alguém esvaziar o bucket à mão", isCorrect: false },
                            { text: "Fica na conta, fora da stack, com os objetos e o custo de armazenamento", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que a linha `comprovantes.GrantReadWrite(apiRole);` faz na stack?",
                        difficulty: "medio",
                        options: [
                            { text: "Cria uma chave de acesso para a role usar o bucket a partir do contêiner", isCorrect: false },
                            { text: "Torna o bucket público para leitura e escrita a partir da role da API", isCorrect: false },
                            { text: "Escreve na política da role as ações de leitura e escrita só nesse bucket", isCorrect: true },
                            { text: "Anexa à role a política gerenciada `AmazonS3FullAccess`, de todos os buckets", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num refactor, o ID do construct do bucket mudou de `\"Comprovantes\"` para `\"ArquivosComprovantes\"`, e mais nada mudou. O bucket não define `BucketName` e o `RemovalPolicy` é `RETAIN`. O que o `cdk diff` mostra e o que o deploy faria?",
                        difficulty: "dificil",
                        options: [
                            { text: "Um erro de síntese, porque o ID precisa ser igual ao nome do bucket", isCorrect: false },
                            { text: "Um bucket novo a criar e o antigo saindo da stack, órfão com os dados", isCorrect: true },
                            { text: "Nada, porque o nome físico do bucket e as propriedades não mudaram", isCorrect: false },
                            { text: "Uma renomeação do mesmo bucket, com todos os objetos preservados no lugar", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Rede sem mistério",
        aulas: [
            {
                titulo: "VPC e sub-redes",
                blocks: [
                    {
                        type: "text",
                        value: "# VPC e sub-redes\n\nA API de pedidos precisa receber requisições da internet. O banco não pode ser alcançado de fora de jeito nenhum. O worker precisa chamar o gateway de pagamento, mas ninguém de fora pode chamar o worker. As três peças rodam na mesma conta e na mesma região, e quem decide o que cada uma enxerga é a rede. Na AWS, essa rede é a **VPC** (*Virtual Private Cloud*): uma rede privada sua, isolada das outras contas, que vive numa região e se espalha pelas zonas de disponibilidade dela.\n\nAo criar a VPC, você escolhe uma faixa de endereços IPv4 em notação CIDR. Em `10.0.0.0/16`, os primeiros 16 bits são fixos (`10.0`) e os outros 16 variam: 2 elevado a 16, ou 65.536 endereços. A AWS aceita blocos de `/16` (o maior) a `/28` (o menor, com 16 endereços). Use uma das faixas privadas da RFC 1918: `10.0.0.0/8`, `172.16.0.0/12` ou `192.168.0.0/16`.\n\n## A faixa que não pode colidir\n\nA escolha da faixa parece detalhe até o dia em que duas redes precisam conversar. Um peering entre VPCs não pode ser criado se as faixas se sobrepõem, e uma VPN com um escritório que usa a mesma faixa vira um problema de roteamento sem solução bonita. Muita gente cria toda VPC com `10.0.0.0/16`, porque é o padrão do CDK e de quase todo exemplo; um ano depois, a VPC de produção precisa falar com a de dados, as duas são `10.0.0.0/16`, e o caminho é recriar uma delas com tudo que mora dentro. Combine as faixas antes, numa tabela simples: `10.10.0.0/16` para produção, `10.20.0.0/16` para homologação, e assim por diante.",
                    },
                    {
                        type: "text",
                        value: "## Sub-rede: um pedaço da VPC numa zona\n\nA VPC é dividida em **sub-redes** (*subnets*). Cada sub-rede tem um bloco CIDR contido no da VPC, sem sobrepor as outras, e vive em **uma única zona de disponibilidade**: não existe sub-rede que atravesse zonas. Alta disponibilidade em rede se faz repetindo o desenho, com uma sub-rede de cada tipo em cada zona.\n\nEm toda sub-rede, a AWS reserva cinco endereços: os quatro primeiros e o último. Em `10.0.0.0/24`, ficam fora de uso o `10.0.0.0` (endereço de rede), o `10.0.0.1` (roteador da VPC), o `10.0.0.2` (DNS da AWS), o `10.0.0.3` (reservado para uso futuro) e o `10.0.0.255` (broadcast, que a VPC não suporta). A conta certa é sempre o total menos cinco:",
                    },
                    {
                        type: "table",
                        value: "[[\"Bloco\",\"Endereços\",\"Utilizáveis\",\"Onde aparece\"],[\"/16\",\"65.536\",\"65.531\",\"A VPC inteira\"],[\"/20\",\"4.096\",\"4.091\",\"Sub-rede de aplicação com contêineres, em que cada task ocupa um IP\"],[\"/24\",\"256\",\"251\",\"Sub-rede pública ou de banco\"],[\"/27\",\"32\",\"27\",\"Mínimo que a AWS pede em cada sub-rede do Application Load Balancer\"],[\"/28\",\"16\",\"11\",\"Menor sub-rede que a AWS aceita\"]]",
                    },
                    {
                        type: "text",
                        value: "## O que faz uma sub-rede ser pública\n\nNão existe uma opção \"pública\" guardada na sub-rede. Quem decide é a **tabela de rotas** associada a ela. Cada sub-rede tem exatamente uma tabela (a mesma tabela pode servir várias sub-redes), e toda tabela traz a rota `local`, com o CIDR da VPC, que não pode ser removida e liga qualquer sub-rede a qualquer outra dentro da VPC. O resto é o que você acrescenta, e vale a rota mais específica que casar com o destino:\n\n- **Pública**: `0.0.0.0/0` aponta para o **internet gateway** da VPC. Um recurso com IP público nela fala com a internet nos dois sentidos.\n- **Privada com saída**: `0.0.0.0/0` aponta para um **NAT gateway**. O recurso abre conexões para fora, mas ninguém de fora abre conexão com ele.\n- **Isolada**: só a rota `local`. Nada sai da VPC por ela, e nada entra.",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\",\"Rota padrão\",\"O que mora nela\",\"O que não deve morar nela\"],[\"Pública\",\"0.0.0.0/0 para o internet gateway\",\"Load balancer público, NAT gateway\",\"Task da API, worker, banco\"],[\"Privada com saída\",\"0.0.0.0/0 para o NAT gateway\",\"Tasks da API e do worker, que chamam serviços externos\",\"Quem precisa receber conexão direta da internet\"],[\"Isolada\",\"Só a local\",\"Banco de dados (RDS), cache\",\"Quem precisa baixar pacote ou chamar API externa\"]]",
                    },
                    {
                        type: "text",
                        value: "## A VPC no CDK\n\nO construct `Vpc` monta tudo isso de uma vez: VPC, sub-redes, tabelas de rota, internet gateway e NAT. Esta é a rede da loja, com três camadas em duas zonas:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing Amazon.CDK;\nusing Loja.Infra;\n\nvar app = new App();\nnew RedeStack(app, \"LojaRede\");\napp.Synth();\n\n// RedeStack.cs\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.EC2;\nusing Constructs;\n\nnamespace Loja.Infra;\n\npublic class RedeStack : Stack\n{\n    public RedeStack(Construct scope, string id, IStackProps? props = null)\n        : base(scope, id, props)\n    {\n        var vpc = new Vpc(this, \"Rede\", new VpcProps\n        {\n            IpAddresses = IpAddresses.Cidr(\"10.0.0.0/16\"),\n            MaxAzs = 2,\n            NatGateways = 1, // um NAT só: decisão de custo, vista na aula de saída\n            SubnetConfiguration =\n            [\n                new SubnetConfiguration\n                {\n                    Name = \"publica\",\n                    SubnetType = SubnetType.PUBLIC,\n                    CidrMask = 24,\n                },\n                new SubnetConfiguration\n                {\n                    Name = \"app\",\n                    SubnetType = SubnetType.PRIVATE_WITH_EGRESS,\n                    CidrMask = 20,\n                },\n                new SubnetConfiguration\n                {\n                    Name = \"dados\",\n                    SubnetType = SubnetType.PRIVATE_ISOLATED,\n                    CidrMask = 24,\n                },\n            ],\n        });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "Rode `cdk synth` e confira em `cdk.out` o que saiu. Com `MaxAzs = 2`, o template tem seis sub-redes: `10.0.0.0/24` e `10.0.1.0/24` (públicas), `10.0.16.0/20` e `10.0.32.0/20` (app), `10.0.48.0/24` e `10.0.49.0/24` (dados). As sub-redes `app` não começam em `10.0.2.0` porque um bloco `/20` precisa começar num múltiplo de 4.096 endereços; o primeiro livre depois das públicas é `10.0.16.0`, e sobra um vão de 3.584 endereços para outra camada no futuro. O CDK aloca os grupos em sequência, então tamanho de sub-rede é decisão do primeiro dia: trocar o grupo `app` para `/19` empurra as sub-redes de dados de `10.0.48.0/24` para `10.0.96.0/24`, e o CloudFormation vai querer substituir justamente as sub-redes do banco.\n\nAgora, o perigo de usar o construct sem propriedades. `new Vpc(this, \"Rede\")`, sozinho, cria `10.0.0.0/16` com uma sub-rede pública e uma privada por zona e **um NAT gateway por zona**. Numa stack sem conta e região definidas, o CDK só enxerga duas zonas: saem dois NAT gateways e sub-redes `/18`. Com conta e região definidas, vale o `MaxAzs` padrão, que é 3: em `sa-east-1`, que tem três zonas, saem **três** NAT gateways, cada um cobrando por hora desde o deploy. Diga sempre `MaxAzs` e `NatGateways`; a conta do NAT está na aula sobre saída para a internet.",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns\n\n- **Pôr a task da API na sub-rede pública \"para funcionar\".** Funciona, e expõe o contêiner direto na internet, com um IPv4 público em cada task: 0,005 dólar por hora cada um em outubro de 2026 (cerca de 3,65 dólares por mês), em uso ou parado. E as sub-redes públicas do CDK já vêm com IP público automático para as instâncias lançadas nelas (`MapPublicIpOnLaunch` no template). Na pública fica o load balancer; a API fica atrás dele.\n- **Achar que privada quer dizer protegida.** Sem rota para o internet gateway, ninguém de fora chega; mas, dentro da VPC, a rota `local` liga tudo com tudo. Quem filtra o tráfego interno é o security group.\n- **Sub-rede pequena demais.** Um `/24` tem 251 endereços, não 256, e tasks, interfaces de endpoint e os nós do load balancer disputam esses endereços.",
                    },
                    {
                        type: "quote",
                        value: "Uma VPC é uma faixa de endereços que não colide com as outras, dividida em sub-redes de uma zona cada; a tabela de rotas é quem diz se a sub-rede é pública, privada com saída ou isolada. No CDK, diga sempre quantas zonas e quantos NAT gateways você quer, porque o padrão escolhe por você e cobra por hora.",
                    },
                ],
                questions: [
                    {
                        statement: "Quantos endereços de uma sub-rede `10.0.5.0/24` podem ser atribuídos a recursos na VPC?",
                        difficulty: "facil",
                        options: [
                            { text: "254", isCorrect: false },
                            { text: "251", isCorrect: true },
                            { text: "256", isCorrect: false },
                            { text: "250", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que torna uma sub-rede pública na AWS?",
                        difficulty: "facil",
                        options: [
                            { text: "A atribuição automática de IP público ligada nas configurações da sub-rede", isCorrect: false },
                            { text: "Uma rota `0.0.0.0/0` para o internet gateway na tabela de rotas dela", isCorrect: true },
                            { text: "Um security group que libera a porta 443 para `0.0.0.0/0` dentro dela", isCorrect: false },
                            { text: "Uma rota `0.0.0.0/0` para o NAT gateway na tabela de rotas dela", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma stack do CDK define conta e região (`sa-east-1`, que tem três zonas) e cria a rede só com `new Vpc(this, \"Rede\")`. Quantos NAT gateways aparecem no template do `cdk synth`?",
                        difficulty: "medio",
                        options: [
                            { text: "Um, compartilhado pelas sub-redes privadas", isCorrect: false },
                            { text: "Três, um na sub-rede pública de cada zona", isCorrect: true },
                            { text: "Nenhum, porque o NAT precisa ser pedido à parte", isCorrect: false },
                            { text: "Dois, porque o construct usa duas zonas por padrão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A VPC de produção usa `10.0.0.0/16`. Qual faixa a nova VPC de dados pode usar para que as duas sejam ligadas por peering?",
                        difficulty: "medio",
                        options: [
                            { text: "`10.0.255.0/24`", isCorrect: false },
                            { text: "`10.1.0.0/16`", isCorrect: true },
                            { text: "`10.0.64.0/18`", isCorrect: false },
                            { text: "`10.0.128.0/17`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na rede da aula, as sub-redes públicas são `10.0.0.0/24` e `10.0.1.0/24`, e o grupo `app` vem logo depois, com `CidrMask = 20`. Por que o synth pôs as sub-redes `app` em `10.0.16.0/20` e `10.0.32.0/20`, e não a partir de `10.0.2.0`?",
                        difficulty: "dificil",
                        options: [
                            { text: "O DNS da VPC ocupa os 4.096 endereços iniciais, e nenhuma sub-rede privada pode usar esse trecho", isCorrect: false },
                            { text: "A AWS exige um intervalo de pelo menos 14 blocos `/24` entre sub-redes de tipos diferentes", isCorrect: false },
                            { text: "O CDK reserva os 16 primeiros blocos `/24` da VPC para sub-redes públicas criadas mais tarde", isCorrect: false },
                            { text: "Um bloco `/20` precisa começar num múltiplo de 4.096 endereços, e o primeiro livre é `10.0.16.0`", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Security group e network ACL",
                blocks: [
                    {
                        type: "text",
                        value: "# Security group e network ACL\n\nA rota `local` da VPC liga todas as sub-redes entre si: pela rota, uma task da API e uma máquina esquecida na sub-rede pública chegam do mesmo jeito à porta 5432 do banco. O que separa as duas é o firewall, e a AWS tem dois: o **security group**, preso à interface de rede de cada recurso, e a **network ACL**, presa à sub-rede. No console eles se parecem; no comportamento, são opostos. Confundir os dois está por trás de boa parte dos \"conecta, mas fica pendurado\" de produção.\n\n## Security group: stateful e só de liberação\n\nUm security group é um conjunto de regras de entrada e de saída aplicado à interface de rede (ENI) de um recurso: load balancer, task, instância, banco. Três propriedades explicam como ele age:\n\n- **É stateful.** Se a entrada foi liberada, a resposta sai sem regra de saída; se a saída foi liberada, a resposta volta. Ele acompanha a conexão.\n- **Só libera.** Não existe regra de bloqueio: o que nenhuma regra libera não passa. As regras valem todas juntas, sem ordem.\n- **Nasce fechado na entrada e aberto na saída.** Um grupo novo não tem regra de entrada e tem uma regra de saída que libera tudo.\n\n## Liberar por referência, não por IP\n\nA origem de uma regra pode ser uma faixa CIDR, uma prefix list ou **outro security group**. Com a referência, você não diz \"libere a 8080 para o IP 10.0.16.37\"; diz \"libere a 8080 para quem estiver no grupo do load balancer\". A regra vale para os IPs privados das interfaces associadas ao grupo de origem, e continua certa quando o load balancer troca de nó ou quando cada deploy sobe tasks com IPs novos. A loja vira uma corrente de três grupos:",
                    },
                    {
                        type: "code",
                        value: "// Na RedeStack, depois da VPC: um security group por camada.\nvar sgAlb = new SecurityGroup(this, \"SgAlb\", new SecurityGroupProps\n{\n    Vpc = vpc,\n    Description = \"Load balancer publico da loja\",\n});\nsgAlb.AddIngressRule(Peer.AnyIpv4(), Port.Tcp(443), \"HTTPS da internet\");\nsgAlb.AddIngressRule(Peer.AnyIpv4(), Port.Tcp(80), \"HTTP, so para redirecionar\");\n\nvar sgApi = new SecurityGroup(this, \"SgApi\", new SecurityGroupProps\n{\n    Vpc = vpc,\n    Description = \"Tasks da API de pedidos\",\n});\nsgApi.AddIngressRule(sgAlb, Port.Tcp(8080), \"Somente o load balancer\");\n\nvar sgBanco = new SecurityGroup(this, \"SgBanco\", new SecurityGroupProps\n{\n    Vpc = vpc,\n    Description = \"PostgreSQL da loja\",\n    AllowAllOutbound = false,\n});\nsgBanco.AddIngressRule(sgApi, Port.Tcp(5432), \"Somente a API\");",
                    },
                    {
                        type: "text",
                        value: "Repare nas descrições sem acento. A API do EC2 só aceita letras sem acento, números, espaço e alguns símbolos na descrição do grupo e da regra. No CDK atual (conferido em outubro de 2026, com a biblioteca 2.273 e o CLI 2.1146), uma descrição de grupo como \"Banco da loja, só a API\" já reprova no `cdk synth`, com a regra de validação F3031.\n\nO banco ganhou `AllowAllOutbound = false`: ele não inicia conexão com ninguém, e sem saída um banco comprometido tem menos para onde ir. Como o CloudFormation daria a regra de saída liberada a um grupo criado sem nenhuma, o CDK escreve no lugar uma regra-tampão para `255.255.255.255/32`, que não casa com tráfego nenhum. E a regra da API vira, no template, um recurso que aponta para o grupo do load balancer, e não para um IP:",
                    },
                    {
                        type: "code",
                        value: "// trecho do template que o cdk synth gerou em cdk.out\n{\n  \"Type\": \"AWS::EC2::SecurityGroupIngress\",\n  \"Properties\": {\n    \"Description\": \"Somente o load balancer\",\n    \"FromPort\": 8080,\n    \"GroupId\": { \"Fn::GetAtt\": [\"SgApi5091B3B2\", \"GroupId\"] },\n    \"IpProtocol\": \"tcp\",\n    \"SourceSecurityGroupId\": { \"Fn::GetAtt\": [\"SgAlbEA3AC417\", \"GroupId\"] },\n    \"ToPort\": 8080\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## Network ACL: stateless, na sub-rede, com ordem\n\nA network ACL filtra o que entra e sai de uma **sub-rede**, não de um recurso. Toda sub-rede tem exatamente uma, e a VPC já nasce com a ACL padrão, que libera tudo nos dois sentidos. Quase tudo nela é o contrário do security group:\n\n- **É stateless.** Cada pacote é avaliado sozinho, inclusive a resposta. Liberar a entrada na 443 não libera a resposta, que sai para a porta efêmera escolhida pelo cliente.\n- **Tem bloqueio e tem ordem.** As regras têm número, de 1 a 32766, e são avaliadas do menor para o maior; a primeira que casar decide. No fim fica a regra `*`, que nega o resto e não pode ser apagada.\n- **ACL nova nega tudo.** Uma ACL criada por você e associada a uma sub-rede não deixa passar nada até ganhar regras, inclusive as das respostas.",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\",\"Security group\",\"Network ACL\"],[\"Onde age\",\"Na interface de rede de cada recurso\",\"Na borda da sub-rede\"],[\"Estado\",\"Stateful: a resposta volta sozinha\",\"Stateless: a resposta precisa de regra própria\"],[\"Regras\",\"Só de liberação\",\"De liberação e de bloqueio\"],[\"Avaliação\",\"Todas juntas, sem ordem\",\"Por número, e a primeira que casa decide\"],[\"Origem e destino\",\"CIDR, prefix list ou outro security group\",\"Só CIDR\"],[\"Limite padrão\",\"60 regras de entrada e 60 de saída por grupo\",\"20 regras de entrada e 20 de saída por ACL\"],[\"No dia a dia\",\"O controle principal, recurso a recurso\",\"Camada extra, como bloquear uma faixa de IPs\"]]",
                    },
                    {
                        type: "text",
                        value: "O erro clássico de ACL nasce do \"stateless\". Alguém cria uma ACL para a sub-rede pública com entrada na 443 e saída na 443, testa, e o navegador gira até o tempo esgotar. A requisição entrou; a resposta do load balancer sai para a porta efêmera do cliente, em algum ponto entre 1024 e 65535, e a saída só libera a 443. A documentação da AWS sugere abrir `1024-65535` para as respostas, faixa que o próprio load balancer e o NAT gateway usam inteira. E o NAT mora na sub-rede pública: uma ACL ali filtra também todo o tráfego de saída das sub-redes privadas. Por isso a maioria dos sistemas deixa a ACL padrão como está e faz o controle fino no security group.\n\nOnde a ACL é insubstituível é no bloqueio, que o security group não faz. Uma faixa de IPs martelando o load balancer sai com uma regra de negação de número baixo na ACL padrão, avaliada antes da regra 100 que libera tudo:",
                    },
                    {
                        type: "code",
                        value: "// Regra 50 na ACL padrão: avaliada antes da regra 100, que libera tudo.\nvar aclPadrao = NetworkAcl.FromNetworkAclId(this, \"AclPadrao\", vpc.VpcDefaultNetworkAcl);\nnew NetworkAclEntry(this, \"BloqueiaFaixa\", new NetworkAclEntryProps\n{\n    NetworkAcl = aclPadrao,\n    RuleNumber = 50,\n    Cidr = AclCidr.Ipv4(\"203.0.113.0/24\"),\n    Traffic = AclTraffic.AllTraffic(),\n    Direction = TrafficDirection.INGRESS,\n    RuleAction = Action.DENY,\n});",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns\n\n- **Liberar o banco para a faixa da VPC** (`10.0.0.0/16` na 5432). Qualquer recurso da VPC chega ao banco, inclusive os que ainda nem existem. Referencie o grupo da API.\n- **Tentar bloquear um IP no security group.** Não existe regra de negação nele; o bloqueio de rede é na ACL.\n- **Usar o security group padrão da VPC.** Ele libera todo o tráfego entre os próprios membros. Projetos novos do CDK tiram essas regras sozinhos: o synth da VPC traz o recurso `Custom::VpcRestrictDefaultSG`, com uma Lambda só para isso.\n- **Abrir a 22 para `0.0.0.0/0` para entrar na máquina.** Shell em instância privada se faz pelo Session Manager do Systems Manager, sem porta de entrada aberta.",
                    },
                    {
                        type: "quote",
                        value: "Security group é o filtro principal: stateful, só de liberação, e estável quando a regra referencia outro grupo em vez de IP. Network ACL é stateless, tem ordem e bloqueio, e cobra caro de quem esquece que a resposta também é tráfego.",
                    },
                ],
                questions: [
                    {
                        statement: "Um security group libera a entrada na porta 443 vinda de `0.0.0.0/0` e não tem nenhuma regra de saída. A sub-rede usa a network ACL padrão. A resposta HTTPS consegue voltar ao cliente?",
                        difficulty: "facil",
                        options: [
                            { text: "Sim, porque o security group é stateful e deixa sair a resposta da conexão aceita", isCorrect: true },
                            { text: "Só se a regra de entrada usar outro security group como origem, e não um CIDR", isCorrect: false },
                            { text: "Só se uma regra de saída liberar as portas efêmeras de 1024 a 65535 no grupo", isCorrect: false },
                            { text: "Não, porque sem nenhuma regra de saída o security group também bloqueia as respostas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o jeito recomendado de deixar só as tasks da API chegarem ao PostgreSQL na porta 5432?",
                        difficulty: "facil",
                        options: [
                            { text: "Uma regra de entrada no grupo do banco liberando a 5432 para a faixa `10.0.0.0/16`", isCorrect: false },
                            { text: "Uma regra de entrada no grupo do banco com os IPs privados atuais das tasks da API", isCorrect: false },
                            { text: "Uma regra de saída no grupo da API para a 5432, sem regra nenhuma no grupo do banco", isCorrect: false },
                            { text: "Uma regra de entrada no grupo do banco tendo o security group da API como origem", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma network ACL nova foi associada à sub-rede pública do load balancer com duas regras: entrada TCP 443 de `0.0.0.0/0` e saída TCP 443 para `0.0.0.0/0`. Qual regra falta para a resposta do load balancer chegar ao cliente?",
                        difficulty: "medio",
                        options: [
                            { text: "Saída TCP para as portas efêmeras (1024-65535), destino `0.0.0.0/0`", isCorrect: true },
                            { text: "Uma negação de número 100, exigida antes de qualquer regra que libera", isCorrect: false },
                            { text: "Saída TCP 443 tendo o security group do load balancer como destino", isCorrect: false },
                            { text: "Entrada TCP para as portas efêmeras (1024-65535), origem `0.0.0.0/0`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma faixa de IPs está martelando o load balancer, e você quer bloqueá-la já, na camada de rede. Onde essa regra de bloqueio pode ser escrita?",
                        difficulty: "medio",
                        options: [
                            { text: "No security group do load balancer, numa regra de negação acima da regra que libera a porta 443", isCorrect: false },
                            { text: "Na tabela de rotas da sub-rede pública, com uma rota dessa faixa apontando para o internet gateway", isCorrect: false },
                            { text: "Nas network ACLs das sub-redes do load balancer, numa regra de número menor que a que libera", isCorrect: true },
                            { text: "No security group do load balancer, como exceção dentro da regra que libera `0.0.0.0/0`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O worker, numa sub-rede privada com NAT, chama a API pelo nome público do load balancer internet-facing da mesma VPC. O grupo do load balancer libera a 443 só para o security group do worker. A conexão não completa. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "O tráfego sai pelo NAT e chega ao load balancer com o IP público do NAT, que a referência ao grupo do worker não cobre", isCorrect: true },
                            { text: "Load balancer internet-facing ignora regras com security group de origem e só avalia regras com faixas públicas", isCorrect: false },
                            { text: "O NAT gateway descarta conexões para IPs públicos da própria VPC, e o pacote nunca chega ao load balancer", isCorrect: false },
                            { text: "Referência a outro security group só vale em regra de saída; numa regra de entrada a origem precisa ser sempre um bloco CIDR", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Saída para a internet: NAT gateway e VPC endpoints",
                blocks: [
                    {
                        type: "text",
                        value: "# Saída para a internet: NAT gateway e VPC endpoints\n\nA task da API está na sub-rede privada, como deve. Aí ela precisa chamar o gateway de pagamento, baixar a imagem do contêiner, mandar log para o CloudWatch e ler a senha do banco no Secrets Manager. Todos esses destinos estão fora da VPC, e uma sub-rede sem rota para fora dá o mesmo sintoma para todos: a conexão fica pendurada até o tempo esgotar. Esta aula resolve a saída e faz a conta dela, que costuma ser a maior surpresa da primeira fatura.\n\n## NAT gateway: sai, mas não entra\n\nO **NAT gateway** troca o endereço privado de quem está na sub-rede privada por um endereço público na saída, e desfaz a troca na volta. A conexão sempre começa de dentro da VPC: ninguém na internet abre conexão com a task através dele. O NAT zonal, o tipo clássico, mora numa sub-rede pública, recebe um Elastic IP e atende uma zona; a tabela de rotas da sub-rede privada aponta `0.0.0.0/0` para ele. NAT gateway não aceita security group: quem controla a saída é o security group de cada recurso.\n\n## A conta do NAT\n\nO NAT cobra três coisas: cada hora em que existe, cada GB que passa por ele e o IPv4 público do Elastic IP. Pela lista de preços da AWS publicada em outubro de 2026, em `us-east-1` são cerca de 0,045 dólar por hora e 0,045 dólar por GB processado; em São Paulo (`sa-east-1`), 0,093 dólar por hora e 0,093 dólar por GB. O IPv4 público custa 0,005 dólar por hora. Num mês de 730 horas, com a rede parada:",
                    },
                    {
                        type: "table",
                        value: "[[\"Cenário\",\"us-east-1\",\"sa-east-1\"],[\"1 NAT gateway, com o IPv4 dele\",\"36,50 dólares por mês\",\"71,54 dólares por mês\"],[\"2 NAT gateways (Vpc padrão em stack sem conta e região)\",\"73,00 dólares por mês\",\"143,08 dólares por mês\"],[\"3 NAT gateways (Vpc padrão com conta e região)\",\"109,50 dólares por mês\",\"214,62 dólares por mês\"],[\"1.000 GB processados no mês, por cima\",\"45,00 dólares\",\"93,00 dólares\"]]",
                    },
                    {
                        type: "text",
                        value: "## Um por zona, um só ou regional\n\nO `NatGateways = 1` da aula sobre VPC é uma decisão, e ela tem três caminhos:\n\n- **Um NAT por zona**, o padrão do construct. Cada sub-rede privada sai pelo NAT da própria zona: se uma zona cair, a outra continua com saída, e o tráfego não atravessa zonas. É o desenho de produção, e custa um NAT inteiro por zona.\n- **Um NAT só.** No synth da aula, com `NatGateways = 1`, as duas sub-redes `app` apontam `0.0.0.0/0` para o mesmo NAT, criado na sub-rede pública da primeira zona. Corta o custo fixo, mas a documentação da AWS é direta: se a zona do NAT cair, as outras zonas perdem a saída para a internet. E cada byte que a outra zona manda ao NAT paga também transferência entre zonas. Serve para homologação e para o começo de um projeto.\n- **NAT regional**, lançado em novembro de 2025. É um NAT só, com um ID só, que se expande sozinho para as zonas onde há recursos e não precisa de sub-rede pública. Não é desconto: ele cobra a hora em cada zona em que está ativo, pelo mesmo preço por hora do zonal, mais o processamento por GB. O ganho é operacional, alta disponibilidade sem montar NAT e rota zona a zona. Quando surge recurso numa zona nova, a expansão pode levar até 60 minutos, e até lá o tráfego daquela zona sai por outra. No CDK atual, é trocar o provedor de NAT:",
                    },
                    {
                        type: "code",
                        value: "// Um NAT só para a VPC, que se expande sozinho pelas zonas com recursos.\nvar vpc = new Vpc(this, \"Rede\", new VpcProps\n{\n    IpAddresses = IpAddresses.Cidr(\"10.0.0.0/16\"),\n    MaxAzs = 2,\n    NatGatewayProvider = NatProvider.RegionalGateway(),\n    SubnetConfiguration =\n    [\n        new SubnetConfiguration { Name = \"publica\", SubnetType = SubnetType.PUBLIC, CidrMask = 24 },\n        new SubnetConfiguration { Name = \"app\", SubnetType = SubnetType.PRIVATE_WITH_EGRESS, CidrMask = 20 },\n        new SubnetConfiguration { Name = \"dados\", SubnetType = SubnetType.PRIVATE_ISOLATED, CidrMask = 24 },\n    ],\n});",
                    },
                    {
                        type: "text",
                        value: "## VPC endpoints: o caminho que não passa pelo NAT\n\nBoa parte do que sai pelo NAT não vai para a internet: vai para a própria AWS. A imagem do contêiner vem do ECR, e as camadas dela ficam no S3; o log vai para o CloudWatch Logs; o segredo vem do Secrets Manager. Cada GB disso paga o processamento do NAT. Um **VPC endpoint** leva esse tráfego ao serviço pela rede da AWS, sem passar pelo NAT. Existem dois tipos:\n\n- **Gateway endpoint**: só para **S3 e DynamoDB**, sem custo nenhum, e funciona por rota. A AWS põe na tabela de rotas uma entrada com a prefix list do serviço; como vale a rota mais específica, o tráfego para o S3 da mesma região passa pelo endpoint mesmo com `0.0.0.0/0` apontando para o NAT.\n- **Interface endpoint** (PrivateLink): uma interface de rede do serviço dentro das suas sub-redes, disponível para dezenas de serviços (ECR, CloudWatch Logs, Secrets Manager, SQS, STS). Com o DNS privado ligado, o nome padrão do serviço passa a resolver para os IPs privados dessa interface, e o SDK da aplicação usa o endpoint sem mudar uma linha. Cobra por hora em cada zona (em outubro de 2026, 0,01 dólar em `us-east-1` e 0,021 em São Paulo) e mais 0,01 dólar por GB.",
                    },
                    {
                        type: "code",
                        value: "// S3: gateway endpoint, sem custo, entra nas tabelas de rota.\nvpc.AddGatewayEndpoint(\"S3\", new GatewayVpcEndpointOptions\n{\n    Service = GatewayVpcEndpointAwsService.S3,\n});\n\n// Secrets Manager: interface endpoint, cobra por hora em cada zona.\nvpc.AddInterfaceEndpoint(\"SecretsManager\", new InterfaceVpcEndpointOptions\n{\n    Service = InterfaceVpcEndpointAwsService.SECRETS_MANAGER,\n    Subnets = new SubnetSelection { SubnetGroupName = \"app\" },\n});",
                    },
                    {
                        type: "text",
                        value: "No synth, o endpoint do S3 entra nas seis tabelas de rota da VPC, e o do Secrets Manager cria uma interface em cada sub-rede `app`, com DNS privado ligado e um security group que libera a 443 para a faixa da VPC. A conta diz quando cada um vale a pena. O gateway endpoint do S3 é de graça: crie sempre. O de interface tem custo fixo: em São Paulo, em duas zonas, são 30,66 dólares por mês. Numa VPC que já tem NAT, ele só se paga em economia de tráfego a partir de uns 370 GB por mês, já que cada GB custa 0,093 dólar no NAT e 0,01 no endpoint. Para o Secrets Manager, que trafega quase nada, o motivo de criar é outro: uma sub-rede isolada, sem NAT, que mesmo assim precisa falar com o serviço.\n\n## Erros comuns\n\n- **Deixar o padrão do construct em homologação.** Três NAT gateways em São Paulo passam de 200 dólares por mês antes do primeiro byte.\n- **Esquecer o endpoint do S3 com contêineres na sub-rede privada.** Cada deploy baixa a imagem de novo, as camadas vêm do S3, e tudo passa pelo NAT cobrando por GB.\n- **Chamar a própria API pelo nome público de dentro da VPC.** A chamada sai pelo NAT e volta pela internet, e cada GB paga o processamento do NAT; tráfego interno pede caminho interno.\n- **Desligar o DNS privado do interface endpoint.** O SDK continua resolvendo o nome público do serviço e saindo pelo NAT, e o endpoint fica lá, cobrando por hora sem uso.",
                    },
                    {
                        type: "quote",
                        value: "NAT gateway dá saída sem dar entrada, e cobra por hora, por GB e pelo IPv4, multiplicado pelo número de zonas: escolha entre um por zona, um só ou o regional sabendo quanto cada um custa. Tráfego para a AWS vai por endpoint: o gateway do S3 é de graça, e o de interface vale quando a conta fecha ou quando não existe NAT.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma task está numa sub-rede privada cuja rota `0.0.0.0/0` aponta para um NAT gateway. Um cliente na internet consegue abrir uma conexão com ela através do NAT?",
                        difficulty: "facil",
                        options: [
                            { text: "Sim, pelo Elastic IP do NAT, que repassa a porta pedida para a task", isCorrect: false },
                            { text: "Sim, se o security group da task liberar a porta para a internet", isCorrect: false },
                            { text: "Não, porque o NAT só aceita conexões iniciadas de dentro da VPC", isCorrect: true },
                            { text: "Só se a network ACL da sub-rede privada liberar a entrada na porta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quais serviços têm gateway endpoint, o tipo de VPC endpoint que não cobra hora nem GB?",
                        difficulty: "facil",
                        options: [
                            { text: "DynamoDB e SQS", isCorrect: false },
                            { text: "S3 e ECR", isCorrect: false },
                            { text: "S3 e DynamoDB", isCorrect: true },
                            { text: "Secrets Manager e S3", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A sub-rede privada tem `0.0.0.0/0` apontando para o NAT, e a tabela de rotas dela foi associada a um gateway endpoint do S3. Por onde sai a chamada da task para um bucket na mesma região?",
                        difficulty: "medio",
                        options: [
                            { text: "Pelo NAT gateway, porque a rota `0.0.0.0/0` foi criada antes e tem prioridade sobre a outra", isCorrect: false },
                            { text: "Pelo gateway endpoint, porque a rota da prefix list do S3 é mais específica que `0.0.0.0/0`", isCorrect: true },
                            { text: "Pelo NAT gateway, porque gateway endpoint só atende sub-redes isoladas, sem rota para fora", isCorrect: false },
                            { text: "Pelo gateway endpoint só se a aplicação trocar o nome padrão do S3 pelo nome do endpoint", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A VPC tem duas zonas e `NatGateways = 1`, com o NAT na zona A. A zona A fica indisponível. O que acontece com as tasks da zona B que chamam o gateway de pagamento?",
                        difficulty: "medio",
                        options: [
                            { text: "Continuam saindo, porque o NAT zonal é replicado pela AWS nas outras zonas da região", isCorrect: false },
                            { text: "Continuam saindo, porque o CDK cria nas privadas uma rota reserva para o internet gateway", isCorrect: false },
                            { text: "Passam a sair por um NAT regional, que a AWS ativa quando o zonal fica indisponível", isCorrect: false },
                            { text: "Perdem a saída para a internet, porque a rota das privadas aponta para o NAT da zona A", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma VPC em São Paulo já tem NAT. A equipe avalia um interface endpoint do Secrets Manager em duas zonas, a 0,021 dólar por hora em cada zona mais 0,01 dólar por GB, contra 0,093 dólar por GB no NAT. Num mês de 730 horas, a partir de que volume mensal o endpoint se paga só com a economia de tráfego?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cerca de 185 GB", isCorrect: false },
                            { text: "Cerca de 330 GB", isCorrect: false },
                            { text: "Cerca de 370 GB", isCorrect: true },
                            { text: "Cerca de 3.066 GB", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Application Load Balancer",
                blocks: [
                    {
                        type: "text",
                        value: "# Application Load Balancer\n\nA API roda em várias tasks, espalhadas por duas zonas, e cada deploy troca todas por tasks novas, com IPs novos. O cliente não pode depender de nenhum desses IPs. Ele precisa de um endereço que não muda, que entregue requisição só para quem está saudável e que saiba mandar `/pedidos` para um serviço e `/relatorios` para outro. Esse é o papel do **Application Load Balancer** (ALB), o balanceador de camada 7 da AWS: ele entende HTTP, lê caminho e cabeçalho e termina TLS.",
                    },
                    {
                        type: "table",
                        value: "[[\"Peça\",\"O que é\",\"Na loja\"],[\"Load balancer\",\"Os nós que recebem as conexões, um por zona habilitada, atrás de um nome DNS fixo\",\"Voltado para a internet, nas sub-redes `publica` das duas zonas\"],[\"Listener\",\"Protocolo e porta em que o load balancer escuta, com uma ação padrão\",\"HTTP na 80 nesta aula; HTTPS na 443 na aula de certificado\"],[\"Regra\",\"Condição (caminho, host, cabeçalho, método, query string, IP de origem) e ação (encaminhar, redirecionar, responder fixo), com prioridade\",\"`/pedidos/*` para a API de pedidos\"],[\"Target group\",\"Os alvos que recebem o tráfego, com protocolo, porta e health check\",\"As tasks da API na porta 8080\"]]",
                    },
                    {
                        type: "text",
                        value: "O ALB exige sub-redes em pelo menos duas zonas, e a documentação pede, em cada uma, bloco de no mínimo `/27` com pelo menos oito IPs livres, que ele usa para escalar. Os IPs dos nós mudam com o tempo; o acesso é sempre pelo nome DNS que a AWS dá a ele, nunca por IP. O preço é por hora mais LCU: em `us-east-1`, 0,0225 dólar por hora e 0,008 dólar por LCU-hora; em São Paulo, 0,034 e 0,011 (lista de preços de outubro de 2026). Uma LCU cobre, numa hora, 25 conexões novas por segundo, 3.000 conexões ativas por minuto, 1 GB processado ou 1.000 avaliações de regra por segundo, e a cobrança segue a dimensão mais usada. Os IPv4 públicos de um ALB voltado para a internet também entram na cobrança de IPv4.\n\nO target group define o tipo de alvo: `instance` (uma instância EC2), `ip` (um IP privado e uma porta) ou `lambda` (uma função). Contêiner no Fargate é registrado por IP; por isso os target groups da loja são do tipo `ip` e nascem vazios. Quem registra e retira as tasks deles é o serviço do ECS, no módulo de contêineres.",
                    },
                    {
                        type: "code",
                        value: "// Na RedeStack, depois dos endpoints: o load balancer na sub-rede pública.\nvar alb = new ApplicationLoadBalancer(this, \"Alb\", new ApplicationLoadBalancerProps\n{\n    Vpc = vpc,\n    InternetFacing = true,\n    SecurityGroup = sgAlb,\n    VpcSubnets = new SubnetSelection { SubnetGroupName = \"publica\" },\n});\n\n// Alvos do tipo ip: o serviço do ECS registra as tasks aqui.\nvar tgPedidos = new ApplicationTargetGroup(this, \"TgPedidos\", new ApplicationTargetGroupProps\n{\n    Vpc = vpc,\n    TargetType = TargetType.IP,\n    Protocol = ApplicationProtocol.HTTP,\n    Port = 8080,\n    HealthCheck = new HealthCheck\n    {\n        Path = \"/health\",\n        Interval = Duration.Seconds(15),\n        Timeout = Duration.Seconds(5),\n        HealthyThresholdCount = 2,\n        UnhealthyThresholdCount = 3,\n        HealthyHttpCodes = \"200\",\n    },\n});\n\nvar tgRelatorios = new ApplicationTargetGroup(this, \"TgRelatorios\", new ApplicationTargetGroupProps\n{\n    Vpc = vpc,\n    TargetType = TargetType.IP,\n    Protocol = ApplicationProtocol.HTTP,\n    Port = 8080,\n    HealthCheck = new HealthCheck { Path = \"/health\" },\n});",
                    },
                    {
                        type: "text",
                        value: "## Health check: o contrato entre o ALB e a API\n\nCada nó do ALB chama o health check de cada alvo, no intervalo configurado. Um alvo recém-registrado entra em circulação depois de passar em um health check. O padrão é `GET /` a cada 30 segundos, com 5 segundos de timeout, esperando 200; duas falhas seguidas tiram o alvo de circulação, e só cinco sucessos seguidos o trazem de volta. Com o padrão, uma task travada leva perto de um minuto para sair, e uma recuperada, dois minutos e meio para voltar. O target group de pedidos usa 15 segundos, três falhas para sair (cerca de 45 segundos) e dois sucessos para voltar (30 segundos).\n\nDois comportamentos pegam quem não leu a documentação:\n\n- **Fail open.** Se todos os alvos de um target group falham ao mesmo tempo, o ALB manda tráfego para todos, saudáveis ou não. Health check que derruba tudo junto não protege nada.\n- **A raiz não é health check.** `/` pode exigir autenticação, redirecionar ou nem existir na API; aí todos os alvos ficam `unhealthy`, com o código `Target.ResponseCodeMismatch`. Crie um caminho só para isso, barato e sem dependência externa:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da API de pedidos\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddHealthChecks();\n\nvar app = builder.Build();\n\n// Responde 200 enquanto o processo consegue atender.\n// Nada de banco aqui: o ALB chama este caminho a cada 15 segundos.\napp.MapHealthChecks(\"/health\");\napp.MapGet(\"/pedidos/{id:int}\", (int id) => TypedResults.Ok(new { id }));\n\napp.Run();",
                    },
                    {
                        type: "text",
                        value: "## Regra por caminho\n\nO listener avalia as regras pela prioridade, do menor número para o maior, e a primeira cuja condição casar decide; se nenhuma casar, vale a ação padrão. Diferente da tabela de rotas, aqui não ganha o padrão mais específico, e sim a menor prioridade. Na stack, a ação padrão responde 404 fixo, e duas regras encaminham por caminho:",
                    },
                    {
                        type: "code",
                        value: "// Porta 80 por enquanto; a aula de certificado troca por HTTPS.\nvar http = alb.AddListener(\"Http\", new BaseApplicationListenerProps\n{\n    Port = 80,\n    Open = false,\n    DefaultAction = ListenerAction.FixedResponse(404, new FixedResponseOptions\n    {\n        ContentType = \"text/plain\",\n        MessageBody = \"rota inexistente\",\n    }),\n});\n\nhttp.AddAction(\"Pedidos\", new AddApplicationActionProps\n{\n    Priority = 10,\n    Conditions = [ListenerCondition.PathPatterns([\"/pedidos\", \"/pedidos/*\"])],\n    Action = ListenerAction.Forward([tgPedidos]),\n});\n\nhttp.AddAction(\"Relatorios\", new AddApplicationActionProps\n{\n    Priority = 20,\n    Conditions = [ListenerCondition.PathPatterns([\"/relatorios\", \"/relatorios/*\"])],\n    Action = ListenerAction.Forward([tgRelatorios]),\n});",
                    },
                    {
                        type: "text",
                        value: "O padrão de caminho diferencia maiúsculas de minúsculas, aceita `*` (zero ou mais caracteres) e `?` (exatamente um), tem até 128 caracteres e olha só o caminho, sem a query string. `/pedidos/*` não casa com `/pedidos` sem a barra, por isso a regra lista os dois valores. E a regra **não altera** a requisição: `/relatorios/mensal` chega ao serviço de relatórios como `/relatorios/mensal`, com o prefixo. Ou o serviço mapeia as rotas com o prefixo, ou a regra ganha um transform de reescrita de URL, recurso que o ALB oferece em 2026. O `Open = false` no listener impede o CDK de acrescentar sozinho uma regra `0.0.0.0/0` no security group do load balancer: as regras de entrada dele já estão escritas.\n\n## Erros comuns\n\n- **Liberar a porta da API para `0.0.0.0/0` porque o health check falhava.** O health check sai dos nós do ALB, que estão no grupo do load balancer; a regra que libera a 8080 a partir desse grupo já cobre.\n- **Regra larga com número de prioridade baixo.** `/*` com prioridade 1 engole todas as outras regras.\n- **Health check pesado.** Consultar banco e serviços externos a cada 15 segundos, em cada alvo, a partir de cada nó do ALB, vira carga de verdade; e, se o banco piscar, todos os alvos falham juntos.",
                    },
                    {
                        type: "quote",
                        value: "O ALB dá um endereço fixo na frente de alvos que mudam o tempo todo: o listener escuta, a regra decide pela prioridade e o target group entrega só a quem passa no health check. Faça um health check barato, conte com o fail open e lembre que a regra por caminho encaminha a URL do jeito que ela chegou.",
                    },
                ],
                questions: [
                    {
                        statement: "Com as configurações padrão de health check de um target group do tipo `ip`, que requisição o ALB faz a cada alvo?",
                        difficulty: "facil",
                        options: [
                            { text: "`GET /health` a cada 10 segundos, esperando o código 200", isCorrect: false },
                            { text: "`GET /` a cada 30 segundos, esperando o código 200", isCorrect: true },
                            { text: "`GET /` a cada 5 segundos, aceitando qualquer código 2xx", isCorrect: false },
                            { text: "`HEAD /` a cada 30 segundos, aceitando de 200 a 399", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ao criar um Application Load Balancer, qual é a exigência sobre as sub-redes dele?",
                        difficulty: "facil",
                        options: [
                            { text: "Pelo menos três, uma em cada zona da região", isCorrect: false },
                            { text: "Pelo menos duas, cada uma numa zona diferente", isCorrect: true },
                            { text: "Duas, sendo uma pública e uma privada isolada", isCorrect: false },
                            { text: "Uma só, desde que seja uma sub-rede pública", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma regra com a condição de caminho `/relatorios/*` encaminha para o target group do serviço de relatórios. Chega `GET /relatorios/mensal?ano=2026`. Que URL o serviço recebe?",
                        difficulty: "medio",
                        options: [
                            { text: "`/relatorios/mensal`, porque o ALB descarta toda a query string", isCorrect: false },
                            { text: "`/relatorios/mensal?ano=2026`, igual à URL que chegou ao ALB", isCorrect: true },
                            { text: "Nenhuma, porque o padrão não casa quando há query string", isCorrect: false },
                            { text: "`/mensal?ano=2026`, porque o ALB tira o prefixo da regra", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma mudança faz o `/health` de todas as tasks da API devolver 500 ao mesmo tempo, em todas as zonas. O que o ALB faz com as requisições dos clientes?",
                        difficulty: "medio",
                        options: [
                            { text: "Encaminha só para o alvo que falhou por último, até ele completar o limite de falhas seguidas", isCorrect: false },
                            { text: "Continua encaminhando para todos os alvos, porque o target group sem alvo saudável entra em fail open", isCorrect: true },
                            { text: "Passa a usar a ação padrão do listener, que responde no lugar do target group que ficou sem alvo saudável", isCorrect: false },
                            { text: "Devolve 503 a todas as requisições até algum alvo voltar a passar no health check configurado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um listener tem duas regras: prioridade 5, caminho `/*`, encaminhando para o frontend; prioridade 10, caminho `/pedidos/*`, encaminhando para a API. Para onde vai a requisição `GET /pedidos/42`?",
                        difficulty: "dificil",
                        options: [
                            { text: "Para a ação padrão, porque duas regras casando ao mesmo tempo dão conflito", isCorrect: false },
                            { text: "Para a API, porque o ALB escolhe a regra de caminho mais específico", isCorrect: false },
                            { text: "Para a API, porque as regras de número maior são avaliadas primeiro", isCorrect: false },
                            { text: "Para o frontend, porque a regra de prioridade 5 é avaliada antes e já casa", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "DNS e certificado: Route 53 e ACM",
                blocks: [
                    {
                        type: "text",
                        value: "# DNS e certificado: Route 53 e ACM\n\nO load balancer está no ar, mas o endereço dele é um nome gerado pela AWS, terminado em `amazonaws.com`, e responde em HTTP puro. O cliente precisa de `https://api.exemplo.com.br`, com cadeado, e o certificado não pode vencer num domingo de madrugada. Duas peças resolvem isso: o **Route 53**, o DNS da AWS, e o **ACM** (*AWS Certificate Manager*), que emite e renova o certificado.\n\n## Zona hospedada e delegação\n\nNo Route 53, o domínio vira uma **zona hospedada** (*hosted zone*) pública, onde ficam os registros DNS dele. Ao criar a zona, a AWS sorteia quatro servidores de nome (*name servers*) para ela, listados no registro NS. Criar a zona não basta: o mundo só pergunta ao Route 53 depois que o domínio é **delegado**, isto é, depois que, onde o domínio foi registrado (um `.com.br` normalmente no Registro.br), os servidores DNS dele passam a ser esses quatro. Apagou e recriou a zona? A zona nova recebe outro sorteio de servidores, e a delegação precisa ser refeita. Em outubro de 2026, cada zona custa 0,50 dólar por mês (nas primeiras 25), e as consultas, 0,40 dólar por milhão.\n\nPara apontar `api.exemplo.com.br` para o load balancer, o Route 53 tem o registro **alias**, uma extensão própria: um registro A (ou AAAA) que aponta para um recurso da AWS e responde com os IPs atuais dele, acompanhando sozinho as mudanças dos nós do ALB.",
                    },
                    {
                        type: "table",
                        value: "[[\"Característica\",\"Alias (A ou AAAA)\",\"CNAME\"],[\"No topo do domínio (`exemplo.com.br`)\",\"Pode\",\"Não pode\"],[\"Consulta que aponta para recurso da AWS\",\"Grátis\",\"Cobrada\"],[\"TTL\",\"O do recurso; você não define\",\"Você define\"],[\"Pode apontar para\",\"Recursos da AWS e outros registros da mesma zona\",\"Qualquer nome DNS\"]]",
                    },
                    {
                        type: "text",
                        value: "## Certificado do ACM, validado por DNS\n\nO certificado público do ACM não tem custo quando usado com o load balancer; o que tem preço é o certificado exportável, que você leva para fora da AWS. Duas regras valem para ele: o certificado é regional e precisa estar **na mesma região do load balancer**; e você precisa provar que controla o domínio. Na validação por e-mail, alguém clica num link a cada renovação. Na validação por DNS, o ACM pede um registro CNAME na zona, e, enquanto esse registro existir e o certificado estiver em uso, a renovação é automática.\n\nEm 2026, isso deixou de ser questão de gosto. Desde fevereiro, para cumprir a regra do CA/Browser Forum que limita certificados públicos a 200 dias a partir de 15/03/2026, o ACM emite certificados públicos com 198 dias de validade (antes eram 395) e começa a renovação 45 dias antes do vencimento. Renovação manual duas vezes por ano é incidente com data marcada.\n\nNo CDK, a validação por DNS com uma zona da mesma conta faz o CloudFormation criar o CNAME sozinho, e o deploy espera o certificado ser emitido. Atenção ao padrão do construct `Certificate`: sem `Validation`, ele usa **e-mail**, e a stack fica parada em `CREATE_IN_PROGRESS` até alguém clicar.",
                    },
                    {
                        type: "code",
                        value: "// Zona que já existe na conta: referência por ID e nome, sem lookup.\nvar zona = HostedZone.FromHostedZoneAttributes(this, \"Zona\", new HostedZoneAttributes\n{\n    HostedZoneId = \"Z0123456789ABCDEFGHIJ\",\n    ZoneName = \"exemplo.com.br\",\n});\n\nvar certificado = new Certificate(this, \"Certificado\", new CertificateProps\n{\n    DomainName = \"api.exemplo.com.br\",\n    Validation = CertificateValidation.FromDns(zona),\n});",
                    },
                    {
                        type: "text",
                        value: "## HTTPS no load balancer\n\nO listener da porta 80 da aula anterior sai, e entram dois: o HTTPS na 443, com o certificado e as mesmas regras, e um na 80 que só redireciona para a 443 com 301. Por fim, o registro alias liga o nome ao load balancer:",
                    },
                    {
                        type: "code",
                        value: "// Política de TLS explícita: o resultado não depende de feature flag.\nvar listener = alb.AddListener(\"Https\", new BaseApplicationListenerProps\n{\n    Port = 443,\n    Open = false,\n    Certificates = [ListenerCertificate.FromCertificateManager(certificado)],\n    SslPolicy = SslPolicy.TLS13_12_RES_PQ,\n    DefaultAction = ListenerAction.FixedResponse(404, new FixedResponseOptions\n    {\n        ContentType = \"text/plain\",\n        MessageBody = \"rota inexistente\",\n    }),\n});\n\nlistener.AddAction(\"Pedidos\", new AddApplicationActionProps\n{\n    Priority = 10,\n    Conditions = [ListenerCondition.PathPatterns([\"/pedidos\", \"/pedidos/*\"])],\n    Action = ListenerAction.Forward([tgPedidos]),\n});\n\nlistener.AddAction(\"Relatorios\", new AddApplicationActionProps\n{\n    Priority = 20,\n    Conditions = [ListenerCondition.PathPatterns([\"/relatorios\", \"/relatorios/*\"])],\n    Action = ListenerAction.Forward([tgRelatorios]),\n});\n\n// Porta 80: só redireciona para a 443, com 301.\nalb.AddRedirect(new ApplicationLoadBalancerRedirectConfig\n{\n    SourcePort = 80,\n    TargetPort = 443,\n    Open = false,\n});\n\n// api.exemplo.com.br aponta para o load balancer, por alias.\nnew ARecord(this, \"RegistroApi\", new ARecordProps\n{\n    Zone = zona,\n    RecordName = \"api\",\n    Target = RecordTarget.FromAlias(new LoadBalancerTarget(alb)),\n});",
                    },
                    {
                        type: "text",
                        value: "O `SslPolicy` está ali de propósito. A política de segurança decide quais versões de TLS o load balancer aceita, e o padrão depende de quem cria o listener. Pelo console, em 2026, é a `ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09`, com TLS 1.3 e 1.2 e troca de chaves pós-quântica, a que a AWS recomenda. Pela API, pelo CloudFormation e pelo CDK sem política explícita, a documentação dá a `ELBSecurityPolicy-2016-08`, que ainda aceita TLS 1.0 e 1.1. Projetos novos do CDK escapam disso pelo feature flag `usePostQuantumTlsPolicy` do `cdk.json`, que grava a `ELBSecurityPolicy-TLS13-1-2-PQ-2025-09` (TLS 1.3 e 1.2, com pós-quântico); num projeto antigo, sem o flag, o synth não grava política nenhuma. Com a política escrita no código, o resultado não depende do flag.\n\nUm tropeço de compilação: ao acrescentar `using Amazon.CDK.AWS.Route53;`, o `new HealthCheck` do target group para de compilar, com o erro CS0104, porque o Route 53 também tem uma classe `HealthCheck`. Resolva com um alias no topo do arquivo: `using HealthCheck = Amazon.CDK.AWS.ElasticLoadBalancingV2.HealthCheck;`.\n\n## A API atrás do TLS do load balancer\n\nO TLS termina no ALB, e o tráfego até a task segue em HTTP pela rede privada. Para a API, toda requisição chega como `http`, vinda do IP de um nó do ALB. O ALB conta o que aconteceu antes em cabeçalhos: `X-Forwarded-For` (o IP do cliente), `X-Forwarded-Proto` (`https`) e `X-Forwarded-Port`. Sem ler esses cabeçalhos, a API gera links e URIs de retorno de OAuth com `http`, registra o IP do load balancer no lugar do cliente e, se usar `UseHttpsRedirection` com a porta HTTPS configurada, entra em laço de redirecionamento. O redirecionamento para HTTPS já é do listener da porta 80; a API só precisa do middleware de forwarded headers. No .NET 10, a lista de redes confiáveis é a `KnownIPNetworks` (a antiga `KnownNetworks` dá o aviso de obsoleto ASPDEPR005):",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da API de pedidos\nusing Microsoft.AspNetCore.HttpOverrides;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddHealthChecks();\nbuilder.Services.Configure<ForwardedHeadersOptions>(opcoes =>\n{\n    opcoes.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;\n    // Só o load balancer alcança a API (o security group garante),\n    // então os cabeçalhos vindos da faixa da VPC são confiáveis.\n    opcoes.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(\"10.0.0.0/16\"));\n});\n\nvar app = builder.Build();\n\napp.UseForwardedHeaders();\n\napp.MapHealthChecks(\"/health\");\napp.MapGet(\"/pedidos/{id:int}\", (int id, HttpContext http) => TypedResults.Ok(new\n{\n    id,\n    esquema = http.Request.Scheme,\n    cliente = http.Connection.RemoteIpAddress?.ToString(),\n}));\n\napp.Run();",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns\n\n- **Certificado na região errada.** Pedir o certificado em `us-east-1`, a região que o CloudFront exige, para um ALB em `sa-east-1`: o listener não enxerga o certificado. Para o ALB, o certificado fica na região dele.\n- **Zona criada e domínio não delegado.** O ACM não encontra o CNAME de validação, o deploy fica esperando e, depois de 72 horas, o certificado vai para `Validation timed out`.\n- **CNAME no topo do domínio.** `exemplo.com.br` apontando para o ALB precisa ser alias; CNAME no topo da zona não é permitido.\n- **Confiar em qualquer origem nos forwarded headers.** Limpar a lista de redes confiáveis, que é o que a variável `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` faz, leva a API a aceitar `X-Forwarded-For` de qualquer um. A faixa da VPC só é segura porque o security group garante que apenas o load balancer chega à porta 8080.",
                    },
                    {
                        type: "quote",
                        value: "O Route 53 dá nome ao load balancer com um alias que acompanha os IPs dele, e o ACM dá o certificado, de graça e renovado sozinho quando a validação é por DNS. No listener HTTPS, escreva a política de TLS no código, redirecione a 80 para a 443 e ensine a API a ler os forwarded headers.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que o registro de `exemplo.com.br`, o topo do domínio, apontando para o ALB precisa ser um alias, e não um CNAME?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque o CNAME não aceita como destino um nome terminado em `amazonaws.com`", isCorrect: false },
                            { text: "Porque o Route 53 só aceita registros do tipo alias em domínios terminados em `.com.br`", isCorrect: false },
                            { text: "Porque o CNAME só aponta para IP fixo, e os nós do ALB mudam de IP com o tempo", isCorrect: false },
                            { text: "Porque o DNS não permite CNAME no topo da zona, e o alias do Route 53 pode ficar ali", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em que região precisa estar o certificado do ACM usado no listener HTTPS de um ALB em `sa-east-1`?",
                        difficulty: "facil",
                        options: [
                            { text: "Em qualquer uma, porque certificado do ACM é global", isCorrect: false },
                            { text: "Na região em que a zona hospedada foi criada", isCorrect: false },
                            { text: "Em `us-east-1`, onde ficam os certificados globais", isCorrect: false },
                            { text: "Em `sa-east-1`, a mesma região do load balancer", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Desde fevereiro de 2026, o ACM emite certificados públicos com 198 dias de validade. Por que isso torna a validação por DNS praticamente obrigatória para o certificado do ALB?",
                        difficulty: "medio",
                        options: [
                            { text: "Com DNS, o ACM renova sozinho enquanto o CNAME existir; por e-mail, alguém aprova cada renovação", isCorrect: true },
                            { text: "Com e-mail, o certificado só funciona no CloudFront, e o ALB passou a exigir validação por DNS", isCorrect: false },
                            { text: "Com DNS, o certificado ganha validade estendida de 395 dias, que a validação por e-mail não tem", isCorrect: false },
                            { text: "A validação por e-mail foi descontinuada pelo ACM junto com a redução da validade para os 198 dias", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um projeto antigo de CDK, sem o feature flag `usePostQuantumTlsPolicy` no `cdk.json`, cria um listener HTTPS sem `SslPolicy`. Que política de segurança o load balancer passa a usar?",
                        difficulty: "medio",
                        options: [
                            { text: "A `ELBSecurityPolicy-2016-08`, padrão da API, que ainda aceita TLS 1.0 e 1.1", isCorrect: true },
                            { text: "A `ELBSecurityPolicy-TLS13-1-2-2021-06`, que o CDK grava em todo listener", isCorrect: false },
                            { text: "Nenhuma, porque o deploy falha quando o listener HTTPS não declara uma política", isCorrect: false },
                            { text: "A `ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09`, a mesma que o console usa", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API ASP.NET Core roda atrás do ALB, que termina o TLS e encaminha em HTTP. Ela chama `app.UseHttpsRedirection()` e recebe `ASPNETCORE_HTTPS_PORT=443`, mas não usa o middleware de forwarded headers. O que acontece ao abrir `https://api.exemplo.com.br/pedidos/1`?",
                        difficulty: "dificil",
                        options: [
                            { text: "Laço de redirecionamento: a API vê toda requisição como http e manda de novo para https", isCorrect: true },
                            { text: "Resposta normal, porque o ALB troca o esquema da requisição para https antes da task", isCorrect: false },
                            { text: "Resposta normal, porque o UseHttpsRedirection ignora requisições vindas de IP privado", isCorrect: false },
                            { text: "Erro de certificado, porque a API tenta negociar o TLS direto com o navegador na porta da task", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Contêineres na AWS",
        aulas: [
            {
                titulo: "ECR: a imagem da API num registro privado",
                blocks: [
                    {
                        type: "text",
                        value: "# ECR: a imagem da API num registro privado\n\nSexta à tarde, alguém publica um build de teste da API como `loja-api:latest` para mostrar a um colega. Na segunda, o time força um deploy novo do serviço só para as tasks pegarem um segredo atualizado, e a produção sobe com o código de teste. Ninguém aprovou aquela versão: a tag `latest` passou a apontar para outra imagem, e o deploy foi buscar o que ela apontava naquele momento.\n\nO **Amazon ECR** (Elastic Container Registry) é o registro privado de imagens da sua conta, um por região. Cada imagem mora num **repositório** (`loja-api`), quem pode publicar e baixar é decidido por IAM, e as tasks do ECS baixam a imagem de lá. Em outubro de 2026, o armazenamento custa **0,10 dólar por GB por mês**, e a transferência do ECR para as tasks **na mesma região não é cobrada** (se o download passa por um NAT Gateway, o NAT cobra o processamento, como visto no módulo 2). Esta aula cobre o caminho da imagem até o repositório: o Dockerfile, o push, a tag que não muda mais e a varredura de vulnerabilidade.",
                    },
                    {
                        type: "code",
                        value: "# Dockerfile (na pasta da solução, com um .dockerignore que exclui bin/ e obj/)\nFROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY Loja.Api/Loja.Api.csproj Loja.Api/\nRUN dotnet restore Loja.Api/Loja.Api.csproj\nCOPY Loja.Api/ Loja.Api/\nRUN dotnet publish Loja.Api/Loja.Api.csproj -c Release -o /app\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app .\n# a base já escuta na 8080 (ASPNETCORE_HTTP_PORTS), mas roda como root se você deixar\nUSER $APP_UID\nENTRYPOINT [\"dotnet\", \"Loja.Api.dll\"]",
                    },
                    {
                        type: "text",
                        value: "## Login, build, tag e push\n\nO Docker não entende IAM, então o primeiro passo troca a sua credencial da AWS por uma senha temporária: `aws ecr get-login-password` gera um token **válido por 12 horas**, que o `docker login` usa com o usuário `AWS`. Depois é o fluxo de sempre: build, tag com o endereço do repositório e push. Dois cuidados evitam a maior parte dos incidentes:\n\n- **A tag diz qual código está rodando.** Use a versão mais o commit (`1.4.0-3f9c2ab`) e nunca `latest` em produção. Quando der problema, você precisa saber o que está no ar e ter uma tag anterior para onde voltar.\n- **A arquitetura tem que bater com a task.** Num Mac com Apple Silicon, o `docker build` gera imagem ARM64 por padrão. Numa task Fargate declarada como X86_64, o contêiner morre na partida com `exec format error`. Ou você constrói com `--platform linux/amd64`, ou declara ARM64 na task definition (o Fargate ARM sai cerca de 20% mais barato, como mostra a aula 2).\n\nO comando final pede o **digest** (`sha256:...`), o identificador do conteúdo da imagem: duas tags podem apontar para o mesmo digest, mas um digest nunca muda de conteúdo.",
                    },
                    {
                        type: "code",
                        value: "# terminal: publicar a imagem no ECR (conta 111122223333, região us-east-1)\nREGISTRO=111122223333.dkr.ecr.us-east-1.amazonaws.com\nVERSAO=1.4.0-$(git rev-parse --short HEAD)\n\naws ecr get-login-password --region us-east-1 \\\n  | docker login --username AWS --password-stdin $REGISTRO\n\ndocker build --platform linux/amd64 -t $REGISTRO/loja-api:$VERSAO .\ndocker push $REGISTRO/loja-api:$VERSAO\n\naws ecr describe-images --repository-name loja-api \\\n  --image-ids imageTag=$VERSAO --query 'imageDetails[0].imageDigest'",
                    },
                    {
                        type: "text",
                        value: "## Tag imutável\n\nCom o repositório em modo imutável, um push com uma tag que já existe é recusado com `ImageTagAlreadyExistsException`. A tag vira uma promessa: `1.4.0-3f9c2ab` aponta para o mesmo conteúdo hoje e no rollback do mês que vem. Desde julho de 2025 o ECR aceita exceções: `IMMUTABLE_WITH_EXCLUSION` deixa tudo imutável, menos as tags que casam com um filtro (por exemplo `dev-*`), e `MUTABLE_WITH_EXCLUSION` faz o contrário.\n\nO ECS ajuda do lado dele. Desde julho de 2024 ele resolve a tag para o digest no começo de cada deploy, e todas as tasks daquele deploy, inclusive as que o auto scaling sobe depois, usam o mesmo digest. Só que um deploy novo resolve a tag de novo. Foi isso que levou o código de teste para a produção na história do começo: a tag era mutável, e o deploy forçado de segunda pegou o que ela apontava naquela hora.\n\nNo CDK, o repositório fica numa stack própria, com `RemovalPolicy.RETAIN` para que apagar a stack não apague as imagens. A lifecycle policy limita quantas imagens guardar, mas **o ECR não sabe qual imagem uma task definition ainda usa**. Muita gente configura \"guardar só as 5 últimas\" para economizar centavos e descobre no pior dia que a imagem do rollback foi expirada: a task antiga falha com `CannotPullContainerError`. Guarde folga para a sua janela de rollback.",
                    },
                    {
                        type: "code",
                        value: "// RegistroStack.cs: o repositório da imagem e a varredura do registro\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.ECR;\nusing Constructs;\n\npublic sealed class RegistroStack : Stack\n{\n    public RegistroStack(Construct scope, string id, IStackProps? props = null)\n        : base(scope, id, props)\n    {\n        new Repository(this, \"LojaApi\", new RepositoryProps\n        {\n            RepositoryName = \"loja-api\",\n            ImageTagMutability = TagMutability.IMMUTABLE, // tag publicada não muda mais\n            RemovalPolicy = RemovalPolicy.RETAIN,         // apagar a stack não apaga imagens\n            LifecycleRules =\n            [\n                // o ECR não sabe que imagem a task definition usa: guarde folga para rollback\n                new LifecycleRule { Description = \"guarda as 50 mais recentes\", MaxImageCount = 50 }\n            ]\n        });\n\n        // vale para o registro inteiro (conta e região): varredura básica em todo push\n        new CfnRegistryScanningConfiguration(this, \"Varredura\", new CfnRegistryScanningConfigurationProps\n        {\n            ScanType = \"BASIC\",\n            Rules = new[]\n            {\n                new CfnRegistryScanningConfiguration.ScanningRuleProperty\n                {\n                    ScanFrequency = \"SCAN_ON_PUSH\",\n                    RepositoryFilters = new[]\n                    {\n                        new CfnRegistryScanningConfiguration.RepositoryFilterProperty\n                        {\n                            Filter = \"*\",\n                            FilterType = \"WILDCARD\"\n                        }\n                    }\n                }\n            }\n        });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Varredura de vulnerabilidade\n\nA **varredura básica** já vem ligada no registro privado e não tem custo adicional. Ela procura CVEs nos **pacotes do sistema operacional** da imagem: no caso da `aspnet:10.0`, os pacotes do Ubuntu 24.04. Desde 2 de fevereiro de 2026 ela usa só a tecnologia nativa da AWS (o motor antigo, baseado no projeto Clair, foi desligado). Cada imagem pode ser varrida uma vez a cada 24 horas, no push ou manualmente, e o resultado é uma foto daquele momento: uma CVE publicada amanhã só aparece se a imagem for varrida de novo.\n\nA **varredura aprimorada** usa o Amazon Inspector: olha também os **pacotes de linguagem**, inclusive os NuGet da API, e, no modo contínuo, varre de novo sozinha quando sai CVE nova. O erro comum é ler \"zero vulnerabilidades\" na varredura básica e concluir que a API está limpa: um pacote NuGet vulnerável passa batido por ela. Para os pacotes da aplicação, ou você liga a aprimorada, ou roda `dotnet package list --vulnerable` antes de construir a imagem.\n\nA AWS recomenda configurar a varredura no nível do **registro**, com filtros por repositório, como faz o `CfnRegistryScanningConfiguration` do código acima, em vez de ligar repositório por repositório (é o que faz a propriedade `ImageScanOnPush` do construct `Repository`).",
                    },
                    {
                        type: "table",
                        value: "[[\"\", \"Varredura básica\", \"Varredura aprimorada (Inspector)\"], [\"O que analisa\", \"Pacotes do sistema operacional da imagem\", \"Sistema operacional e pacotes de linguagem, inclusive NuGet\"], [\"Quando varre\", \"No push ou manualmente, uma vez por imagem a cada 24 horas\", \"No push ou de forma contínua, varrendo de novo quando sai CVE nova\"], [\"Custo (us-east-1, outubro de 2026)\", \"Sem custo adicional\", \"0,09 dólar por imagem na primeira varredura e 0,01 dólar por nova varredura\"]]",
                    },
                    {
                        type: "code",
                        value: "# terminal: resumo por severidade da imagem publicada\naws ecr describe-image-scan-findings --repository-name loja-api \\\n  --image-id imageTag=1.4.0-3f9c2ab \\\n  --query 'imageScanFindings.findingSeverityCounts'\n\n# varredura manual de uma imagem antiga (no máximo uma por imagem a cada 24 horas)\naws ecr start-image-scan --repository-name loja-api --image-id imageTag=1.3.2-91be04d",
                    },
                    {
                        type: "quote",
                        value: "Imagem de produção vai para o ECR com tag de versão imutável, nunca `latest`; o repositório sobrevive à stack, a lifecycle policy deixa folga para o rollback e a varredura básica olha só o sistema operacional, então os pacotes NuGet pedem a aprimorada ou a checagem no build.",
                    },
                ],
                questions: [
                    {
                        statement: "O repositório `loja-api` do ECR está com tags imutáveis. Um desenvolvedor tenta publicar de novo `loja-api:1.4.0-3f9c2ab`, agora com outro conteúdo. O que acontece?",
                        difficulty: "facil",
                        options: [
                            { text: "O push é aceito e as tasks que usam essa tag reiniciam sozinhas para baixar o conteúdo novo", isCorrect: false },
                            { text: "O push é aceito e o ECR grava o conteúdo novo com o sufixo `-1` para não sobrescrever", isCorrect: false },
                            { text: "O push é aceito, a tag passa para o conteúdo novo e o conteúdo antigo fica guardado sem tag", isCorrect: false },
                            { text: "O push é recusado com `ImageTagAlreadyExistsException` e a tag segue no conteúdo antigo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A varredura básica do ECR não encontrou nenhuma vulnerabilidade na imagem da Loja.Api. O que esse resultado diz sobre os pacotes NuGet publicados junto com a aplicação?",
                        difficulty: "facil",
                        options: [
                            { text: "Que estão limpos, porque a varredura básica lê o `.deps.json` publicado com a API", isCorrect: false },
                            { text: "Que estão limpos até o próximo push, quando a varredura básica recomeça do zero", isCorrect: false },
                            { text: "Nada, porque a varredura básica só analisa os pacotes do sistema operacional", isCorrect: true },
                            { text: "Que foram conferidos pelo Inspector, que a varredura básica aciona por padrão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A imagem da API foi construída num Mac com Apple Silicon com `docker build -t loja-api:1.5.0 .` e publicada no ECR. Na task Fargate, declarada como `X86_64`, o contêiner morre na partida com `exec format error`. Qual é a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "Adicionar `USER $APP_UID` no Dockerfile, porque o erro vem de rodar como root", isCorrect: false },
                            { text: "Construir com `--platform linux/amd64` ou declarar ARM64 na task definition", isCorrect: true },
                            { text: "Aumentar a memória da task, porque o runtime do .NET não coube na partida", isCorrect: false },
                            { text: "Trocar a imagem base para `aspnet:10.0-alpine`, que traz binários estáticos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A lifecycle policy do repositório guarda só as 5 imagens mais recentes. Depois de seis deploys numa semana, o time tenta voltar o serviço para a task definition de oito dias atrás. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "As tasks falham com `CannotPullContainerError`, porque a imagem já foi expirada", isCorrect: true },
                            { text: "O ECS sobe a imagem da revisão atual, já que a tag antiga sumiu do repositório", isCorrect: false },
                            { text: "O rollback funciona, porque a lifecycle policy nunca expira imagem que já foi baixada", isCorrect: false },
                            { text: "O ECR mantém a imagem, porque uma task definition ativa ainda faz referência a ela", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O serviço usa `loja-api:latest` num repositório mutável. Às 10h termina um deploy com 4 tasks. Às 11h alguém publica outra imagem como `latest`. Às 12h o auto scaling sobe uma quinta task e, às 13h, alguém roda `aws ecs update-service --force-new-deployment`. Que imagem rodam a quinta task e as tasks do deploy das 13h?",
                        difficulty: "dificil",
                        options: [
                            { text: "As duas usam o digest das 10h, porque o ECS fixa o digest da tag para sempre no serviço", isCorrect: false },
                            { text: "A quinta usa o digest resolvido às 10h; o deploy das 13h resolve a tag e pega a das 11h", isCorrect: true },
                            { text: "A quinta pega a imagem das 11h, e o deploy das 13h volta ao digest das 10h por segurança", isCorrect: false },
                            { text: "As duas pegam a imagem das 11h, porque toda task nova baixa o que a tag aponta na hora", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "ECS com Fargate: cluster, task definition e service",
                blocks: [
                    {
                        type: "text",
                        value: "# ECS com Fargate: cluster, task definition e service\n\nA primeira versão da Loja.Api em produção rodava num EC2 com Docker: um `docker run` num script, um cron que subia o contêiner de novo se ele caísse e patch do sistema operacional quando alguém lembrava. Num sábado o disco encheu de log, o contêiner morreu e só voltou na segunda. Faltava um **orquestrador**: algo que saiba quantas cópias da API devem estar no ar, perceba quando uma cai e suba outra sem ninguém acordar.\n\nO **Amazon ECS** é esse orquestrador. O **Fargate** é o jeito de rodar as tasks sem servidor para administrar: você declara CPU e memória por task, e a AWS fornece a máquina, cuida do sistema operacional dela e cobra por segundo. Não há EC2 seu para atualizar nem agente para instalar. Com as tasks no Fargate, o ECS não cobra nada à parte: a conta vem do Fargate e do que fica em volta (ALB, NAT Gateway, logs). Quatro conceitos organizam tudo:",
                    },
                    {
                        type: "table",
                        value: "[[\"Conceito\", \"O que é\", \"No dia a dia\"], [\"Cluster\", \"Agrupamento lógico de services e tasks\", \"Não custa nada; um por ambiente costuma bastar\"], [\"Task definition\", \"Receita versionada: imagem, CPU, memória, porta, variáveis e roles\", \"Cada mudança gera uma revisão nova (`loja-api:42`)\"], [\"Task\", \"Uma execução da task definition, com IP próprio na VPC\", \"É o que roda e o que o Fargate cobra\"], [\"Service\", \"Mantém o desired count, troca task que morre e registra as tasks no ALB\", \"É onde mora a estratégia de deploy\"]]",
                    },
                    {
                        type: "text",
                        value: "## A API em CDK\n\nA stack abaixo coloca a Loja.Api no ar: VPC em duas zonas de disponibilidade com um NAT Gateway (como no módulo 2), cluster, task definition de 0,5 vCPU e 1 GB, o contêiner vindo do ECR pela tag de versão, o service com duas tasks em sub-redes privadas, sem IP público, e um ALB público mandando tráfego para a porta 8080. As duas últimas linhas ligam o auto scaling por CPU: o desired count passa a variar entre 2 e 6 tasks para manter a média em 60% (escalar pela fila fica para o módulo 5). O listener HTTPS com certificado do ACM, visto no módulo 2, ficou de fora para o exemplo caber na tela.",
                    },
                    {
                        type: "code",
                        value: "// ApiFargateStack.cs: a API em Fargate atrás de um ALB\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.ApplicationAutoScaling;\nusing Amazon.CDK.AWS.EC2;\nusing Amazon.CDK.AWS.ECR;\nusing Amazon.CDK.AWS.ECS;\nusing Amazon.CDK.AWS.ElasticLoadBalancingV2;\nusing Constructs;\nusing HealthCheck = Amazon.CDK.AWS.ElasticLoadBalancingV2.HealthCheck;\n\npublic sealed class ApiFargateStack : Stack\n{\n    public ApiFargateStack(Construct scope, string id, string tagDaImagem, IStackProps? props = null)\n        : base(scope, id, props)\n    {\n        var vpc = new Vpc(this, \"Vpc\", new VpcProps { MaxAzs = 2, NatGateways = 1 });\n        var cluster = new Cluster(this, \"Cluster\", new ClusterProps { Vpc = vpc });\n\n        var taskDef = new FargateTaskDefinition(this, \"ApiTask\", new FargateTaskDefinitionProps\n        {\n            Cpu = 512,             // 0,5 vCPU\n            MemoryLimitMiB = 1024, // 1 GB\n            RuntimePlatform = new RuntimePlatform\n            {\n                CpuArchitecture = CpuArchitecture.X86_64, // tem que bater com a imagem\n                OperatingSystemFamily = OperatingSystemFamily.LINUX\n            }\n        });\n\n        var repo = Repository.FromRepositoryName(this, \"Repo\", \"loja-api\");\n        taskDef.AddContainer(\"api\", new ContainerDefinitionOptions\n        {\n            Image = ContainerImage.FromEcrRepository(repo, tagDaImagem),\n            PortMappings = [new PortMapping { ContainerPort = 8080 }],\n            Logging = LogDriver.AwsLogs(new AwsLogDriverProps { StreamPrefix = \"api\" })\n        });\n\n        var servico = new FargateService(this, \"ApiService\", new FargateServiceProps\n        {\n            Cluster = cluster,\n            TaskDefinition = taskDef,\n            DesiredCount = 2, // uma task em cada zona de disponibilidade\n            VpcSubnets = new SubnetSelection { SubnetType = SubnetType.PRIVATE_WITH_EGRESS },\n            AssignPublicIp = false,\n            MinHealthyPercent = 100,\n            MaxHealthyPercent = 200\n        });\n\n        var alb = new ApplicationLoadBalancer(this, \"Alb\", new ApplicationLoadBalancerProps\n        {\n            Vpc = vpc,\n            InternetFacing = true\n        });\n        var listener = alb.AddListener(\"Http\", new BaseApplicationListenerProps { Port = 80 });\n        listener.AddTargets(\"Api\", new AddApplicationTargetsProps\n        {\n            Port = 8080,\n            Protocol = ApplicationProtocol.HTTP,\n            Targets = [servico],\n            HealthCheck = new HealthCheck { Path = \"/health\" }\n        });\n\n        var escala = servico.AutoScaleTaskCount(new EnableScalingProps { MinCapacity = 2, MaxCapacity = 6 });\n        escala.ScaleOnCpuUtilization(\"Cpu\", new CpuUtilizationScalingProps { TargetUtilizationPercent = 60 });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que o ECS faz com isso\n\nNo Fargate a rede é sempre `awsvpc`: cada task ganha uma interface de rede com IP privado na sub-rede e o security group do service. O ALB registra esse IP no target group (por isso o tipo de alvo é `ip`). O service compara o número de tasks rodando com o desired count: se uma task para, porque o processo caiu ou porque falhou no health check, ele sobe outra, espalhando as tasks entre as zonas. O auto scaling só mexe nesse número; quem cumpre é o service.\n\nDois erros aparecem em quase todo primeiro deploy:\n\n- **Task em sub-rede privada sem saída.** Sem NAT Gateway e sem VPC endpoints, a task não alcança o ECR e para com `CannotPullContainerError`. Quem dispensa o NAT precisa dos endpoints `ecr.api` e `ecr.dkr`, do gateway do S3 (as camadas da imagem vêm de lá) e do endpoint de logs.\n- **Porta errada.** Desde o .NET 8, as imagens oficiais do ASP.NET Core escutam na **8080**, não na 80. Uma task definition copiada de um projeto .NET 6 com `ContainerPort = 80` faz o health check bater numa porta vazia, e o ECS fica trocando tasks sem parar.\n\nO synth mostra o que o CDK escreveu por você: as duas roles da task (assunto da aula 4) e um aviso de que o service está sem circuit breaker (assunto da aula 5).",
                    },
                    {
                        type: "code",
                        value: "# terminal: npx aws-cdk synth LojaApiFargate (trecho da saída)\nWARNING Enable the 'circuitBreaker' property to trigger a quicker deployment failure if tasks are failing to start up (without this setting deployments may take up to 3 hours to fail). (Annotation)\n   LojaApiFargate/ApiService aws-cdk-lib.aws_ecs.FargateService\n\n# cdk.out/LojaApiFargate.template.json (trecho da task definition gerada)\n\"Cpu\": \"512\",\n\"Memory\": \"1024\",\n\"NetworkMode\": \"awsvpc\",\n\"RequiresCompatibilities\": [\"FARGATE\"],\n\"RuntimePlatform\": {\"CpuArchitecture\": \"X86_64\", \"OperatingSystemFamily\": \"LINUX\"},\n\"ExecutionRoleArn\": {\"Fn::GetAtt\": [\"ApiTaskExecutionRoleC2344606\", \"Arn\"]},\n\"TaskRoleArn\": {\"Fn::GetAtt\": [\"ApiTaskTaskRoleD15A20E9\", \"Arn\"]},",
                    },
                    {
                        type: "text",
                        value: "## Quanto custa\n\nO Fargate cobra vCPU e memória por segundo, com mínimo de 1 minuto, do início do download da imagem até a task terminar; 20 GB de armazenamento temporário por task já estão incluídos. A tabela usa os preços de Linux publicados em outubro de 2026 e 730 horas no mês. O ARM (Graviton) sai cerca de 20% mais barato, desde que a imagem seja ARM64. O **Fargate Spot** dá até 70% de desconto, mas a AWS pode interromper a task: serve para cópias extras e trabalho que tolera interrupção, não para a única cópia da API.",
                    },
                    {
                        type: "table",
                        value: "[[\"Região e arquitetura\", \"vCPU por hora\", \"GB de memória por hora\", \"2 tasks de 0,5 vCPU e 1 GB no mês\"], [\"us-east-1, x86\", \"0,04048 dólar\", \"0,004445 dólar\", \"36,04 dólares\"], [\"us-east-1, ARM\", \"0,03238 dólar\", \"0,00356 dólar\", \"28,84 dólares\"], [\"sa-east-1 (São Paulo), x86\", \"0,0696 dólar\", \"0,0076 dólar\", \"61,90 dólares\"], [\"sa-east-1 (São Paulo), ARM\", \"0,0557 dólar\", \"0,00612 dólar\", \"49,60 dólares\"]]",
                    },
                    {
                        type: "quote",
                        value: "No ECS, a task definition é a receita versionada, a task é a execução e o service mantém o desired count; com Fargate não há máquina para cuidar, mas rede, porta e arquitetura continuam sendo decisão sua.",
                    },
                ],
                questions: [
                    {
                        statement: "Um service do ECS tem desired count 2. O processo de uma das tasks cai por falta de memória e a task para. O que o service faz?",
                        difficulty: "facil",
                        options: [
                            { text: "Sobe outra task só se o auto scaling estiver ligado no service", isCorrect: false },
                            { text: "Mantém uma task só até alguém rodar um deploy novo do service", isCorrect: false },
                            { text: "Sobe outra task da mesma task definition para voltar a ter duas", isCorrect: true },
                            { text: "Dobra a memória da task definition e sobe a task com o valor novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ao trocar a API de um EC2 com Docker para tasks no Fargate, qual destas tarefas deixa de ser do time?",
                        difficulty: "facil",
                        options: [
                            { text: "Atualizar a imagem base `aspnet:10.0` quando sai correção de segurança", isCorrect: false },
                            { text: "Definir os security groups e as sub-redes em que as tasks vão rodar", isCorrect: false },
                            { text: "Aplicar patch no sistema operacional da máquina que roda os contêineres", isCorrect: true },
                            { text: "Escolher a CPU e a memória de cada task na task definition de cada service", isCorrect: false },
                        ],
                    },
                    {
                        statement: "As tasks da API ficam em sub-redes privadas, sem NAT Gateway e sem VPC endpoints, e param antes de rodar com `CannotPullContainerError` e timeout de conexão. Qual é a causa?",
                        difficulty: "medio",
                        options: [
                            { text: "O security group da task não libera a porta 8080 para o ALB", isCorrect: false },
                            { text: "O ECS exige repositório com tag mutável para conseguir baixar", isCorrect: false },
                            { text: "A execution role não tem permissão de gravar os logs no CloudWatch", isCorrect: false },
                            { text: "A task não tem rota até o ECR e o S3 para baixar a imagem", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A Loja.Api foi migrada do .NET 6 para o .NET 10, com a imagem base `aspnet:10.0`. A task definition continua com `ContainerPort = 80`, e o target group faz o health check na porta 80. O que acontece no próximo deploy?",
                        difficulty: "medio",
                        options: [
                            { text: "O health check falha, porque a API passou a escutar na 8080, e o ECS troca as tasks", isCorrect: true },
                            { text: "Nada muda, porque o Fargate redireciona a porta 80 do target group para a 8080 da API", isCorrect: false },
                            { text: "A task nem sobe, porque o ECS valida a porta declarada contra o `EXPOSE` da imagem", isCorrect: false },
                            { text: "O ALB passa a usar a 8080 sozinho, porque lê o `ASPNETCORE_HTTP_PORTS` da task", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Duas tasks de 1 vCPU e 2 GB, Linux x86, rodam o mês inteiro (730 horas) em us-east-1. Com os preços de outubro de 2026 (0,04048 dólar por vCPU-hora e 0,004445 dólar por GB-hora), quanto custa o Fargate dessas tasks no mês?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cerca de 72,08 dólares", isCorrect: true },
                            { text: "Cerca de 59,10 dólares", isCorrect: false },
                            { text: "Cerca de 36,04 dólares", isCorrect: false },
                            { text: "Cerca de 65,59 dólares", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "ECS Express Mode: do contêiner à URL com um comando",
                blocks: [
                    {
                        type: "text",
                        value: "# ECS Express Mode: do contêiner à URL com um comando\n\nA aula anterior precisou de VPC, cluster, task definition, service, ALB, listener, target group, security groups e auto scaling para publicar uma API que só responde HTTP. Para muito time isso é infraestrutura demais para um serviço simples, e por anos a resposta da AWS foi o App Runner. Isso mudou: **o App Runner fechou para clientes novos em 30/04/2026** (quem já usava segue em modo de manutenção), e o **AWS Copilot CLI**, que montava o ECS por você, **perdeu o suporte em 12/06/2026**. O caminho que a AWS indica é o **Amazon ECS Express Mode**, lançado em novembro de 2025.\n\nExpress Mode não é um runtime novo: é o próprio ECS com Fargate, montado com padrões de produção. Você entrega três coisas: a **imagem**, a **task execution role** e a **infrastructure role**, a role que o ECS assume para criar e manter os recursos em seu nome. Em troca, ele cria na sua conta, à vista no console:\n\n- o cluster `default` (se ainda não existir), a task definition e o service, com **deploy canary** e um alarme de erros 5XX que dispara o rollback;\n- um **ALB com HTTPS** (listener na 443 e certificado do ACM) e uma URL própria no formato `https://<nome>.ecs.<região>.on.aws`;\n- security groups com o mínimo de entrada, um log group no CloudWatch e auto scaling por CPU com alvo de 60%.",
                    },
                    {
                        type: "code",
                        value: "# terminal: as duas roles (uma vez por conta)\naws iam create-role --role-name ecsTaskExecutionRole \\\n  --assume-role-policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"ecs-tasks.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}'\naws iam attach-role-policy --role-name ecsTaskExecutionRole \\\n  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy\n\naws iam create-role --role-name ecsInfrastructureRoleForExpressServices \\\n  --assume-role-policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"ecs.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}'\naws iam attach-role-policy --role-name ecsInfrastructureRoleForExpressServices \\\n  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSInfrastructureRoleforExpressGatewayServices\n\n# terminal: o serviço, com o que importa declarado\naws ecs create-express-gateway-service \\\n  --service-name loja-api \\\n  --execution-role-arn arn:aws:iam::111122223333:role/ecsTaskExecutionRole \\\n  --infrastructure-role-arn arn:aws:iam::111122223333:role/ecsInfrastructureRoleForExpressServices \\\n  --primary-container '{\"image\":\"111122223333.dkr.ecr.us-east-1.amazonaws.com/loja-api:1.4.0-3f9c2ab\",\"containerPort\":8080}' \\\n  --cpu 512 --memory 1024 \\\n  --health-check-path /health \\\n  --scaling-target '{\"minTaskCount\":2,\"maxTaskCount\":6,\"autoScalingMetric\":\"AVERAGE_CPU\",\"autoScalingTargetValue\":60}' \\\n  --monitor-resources",
                    },
                    {
                        type: "text",
                        value: "## Os padrões que você deve sobrescrever\n\nO comando acima declara CPU (em unidades: 512 é 0,5 vCPU), memória (em MiB), porta e caminho do health check, mesmo que tudo tenha padrão. O motivo é concreto: a própria documentação da AWS traz padrões diferentes em páginas diferentes (o guia fala em 1 vCPU, 2 GB e caminho `/`; a referência da API, em 0,25 vCPU, 512 MiB e `/ping`). A Loja.Api só devolve 200 em `/health`, e na raiz responde 404: deixar o caminho padrão faz o health check falhar e o deploy não sai do lugar.\n\nOutras escolhas que pesam depois:\n\n- **Sub-redes.** Sem `--network-configuration`, o Express Mode usa as sub-redes públicas da VPC padrão: ALB público e **IP público em cada task** (cada IPv4 público custa 0,005 dólar por hora, uns 3,65 dólares por mês, em outubro de 2026). Com sub-redes privadas, ele cria um ALB **interno**. A primeira API Express de uma VPC define as sub-redes do ALB daquela VPC, então passe sub-redes de todas as zonas desde o começo.\n- **O que não muda.** A estratégia de deploy (canary) e a configuração do load balancer não podem ser alteradas; nome e cluster só na criação. O contêiner principal se chama `Main`, e renomeá-lo pode impedir as atualizações seguintes feitas pelo Express Mode.\n- **Task definition própria.** Desde julho de 2026, `--task-definition-arn` aceita uma task definition sua, com sidecars e health check de contêiner. Ela precisa ter o contêiner `Main` com uma porta TCP nomeada e compatibilidade com Fargate.",
                    },
                    {
                        type: "code",
                        value: "// ApiExpressStack.cs: Express Mode só tem construct L1 (CfnExpressGatewayService)\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.ECS;\nusing Amazon.CDK.AWS.IAM;\nusing Constructs;\n\npublic sealed class ApiExpressStack : Stack\n{\n    public ApiExpressStack(Construct scope, string id, string imagem, IStackProps? props = null)\n        : base(scope, id, props)\n    {\n        var execucao = new Role(this, \"ExecucaoRole\", new RoleProps\n        {\n            AssumedBy = new ServicePrincipal(\"ecs-tasks.amazonaws.com\"),\n            ManagedPolicies = [ManagedPolicy.FromAwsManagedPolicyName(\n                \"service-role/AmazonECSTaskExecutionRolePolicy\")]\n        });\n        var infraestrutura = new Role(this, \"InfraRole\", new RoleProps\n        {\n            AssumedBy = new ServicePrincipal(\"ecs.amazonaws.com\"),\n            ManagedPolicies = [ManagedPolicy.FromAwsManagedPolicyName(\n                \"service-role/AmazonECSInfrastructureRoleforExpressGatewayServices\")]\n        });\n\n        // sem NetworkConfiguration: sub-redes públicas da VPC padrão\n        var api = new CfnExpressGatewayService(this, \"Api\", new CfnExpressGatewayServiceProps\n        {\n            ServiceName = \"loja-api\",\n            ExecutionRoleArn = execucao.RoleArn,\n            InfrastructureRoleArn = infraestrutura.RoleArn,\n            Cpu = \"512\",      // declare: a documentação diverge sobre o padrão\n            Memory = \"1024\",\n            HealthCheckPath = \"/health\",\n            PrimaryContainer = new CfnExpressGatewayService.ExpressGatewayContainerProperty\n            {\n                Image = imagem,\n                ContainerPort = 8080\n            },\n            ScalingTarget = new CfnExpressGatewayService.ExpressGatewayScalingTargetProperty\n            {\n                MinTaskCount = 2,\n                MaxTaskCount = 6,\n                AutoScalingMetric = \"AVERAGE_CPU\",\n                AutoScalingTargetValue = 60\n            }\n        });\n\n        new CfnOutput(this, \"Url\", new CfnOutputProps { Value = api.AttrEndpoint });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## No CDK, só o L1\n\nEm outubro de 2026, o `aws-cdk-lib` (versão 2.273.0) só tem o construct L1 do Express Mode: `CfnExpressGatewayService`, que é o recurso `AWS::ECS::ExpressGatewayService` do CloudFormation sem nenhuma ajuda. Você cria as duas roles, passa ARNs e textos (`Cpu = \"512\"`) e lê a URL pelo atributo `AttrEndpoint`. Não há L2 nem pattern L3 para ele; os patterns de alto nível do ECS, como `ApplicationLoadBalancedFargateService`, montam o ECS comum da aula 2. Infrastructure role, nome e cluster ficam definidos na criação: no CloudFormation, mudar qualquer um deles exige **substituir** o recurso, ou seja, criar um serviço novo.\n\nEscolha um dono para o serviço. Se ele nasceu pela CLI, não o declare também no CDK; se nasceu no CDK, mude pelo CDK. Os recursos que o Express Mode cria ficam editáveis no console, e é tentador ajustar o ALB na mão, mas a próxima atualização não sabe dessas mudanças.\n\n**Custo.** O Express Mode não tem cobrança própria: você paga o Fargate (os preços da aula 2), o ALB, logs e métricas e a transferência de dados. A diferença está no ALB: até 25 serviços Express na mesma VPC dividem um ALB, com regras por host. Em us-east-1, um ALB custa 0,0225 dólar por hora, uns 16,43 dólares por mês antes do tráfego; dividido por 25 APIs, a parte fixa fica em uns 0,66 dólar por API. Com uma API só, o custo é praticamente o do service montado à mão.",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"ECS Express Mode\", \"ECS montado à mão (aula 2)\"], [\"API HTTP sem estado, time sem especialista em AWS\", \"Um comando ou um L1 no CDK\", \"Atende, com bem mais código\"], [\"Worker sem endpoint HTTP, consumindo fila\", \"Fora do alvo: o modelo é aplicação HTTP atrás de ALB\", \"É o caminho\"], [\"Estratégia de deploy\", \"Canary, sem possibilidade de troca\", \"Rolling, blue/green, linear ou canary\"], [\"Regras próprias no ALB (por caminho, por cabeçalho)\", \"O ECS gerencia as regras; o load balancer não muda depois de criado\", \"Controle total\"], [\"Tasks privadas atrás de ALB público\", \"Sub-rede pública dá ALB público e IP público na task\", \"O desenho padrão da aula 2\"]]",
                    },
                    {
                        type: "quote",
                        value: "O ECS Express Mode é o ECS com Fargate montado para você: declare CPU, memória, porta e caminho do health check, escolha as sub-redes com cuidado e lembre que, no CDK, ele só existe como L1.",
                    },
                ],
                questions: [
                    {
                        statement: "Para criar um serviço no ECS Express Mode, o que você precisa fornecer, no mínimo?",
                        difficulty: "facil",
                        options: [
                            { text: "A imagem, o cluster, a task definition e o target group", isCorrect: false },
                            { text: "A imagem, a task execution role e a infrastructure role", isCorrect: true },
                            { text: "A imagem, o domínio no Route 53 e o security group do ALB", isCorrect: false },
                            { text: "A imagem, a VPC, o ALB e o certificado do ACM já criados", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe que acabou de criar a conta na AWS quer publicar a Loja.Api em outubro de 2026 do jeito mais simples e pensa em usar o App Runner. O que é preciso saber antes?",
                        difficulty: "facil",
                        options: [
                            { text: "Ele é o caminho indicado, e o Express Mode só serve para quem já tem um cluster", isCorrect: false },
                            { text: "Ele virou o Express Mode, e as contas novas são migradas automaticamente para lá", isCorrect: false },
                            { text: "Ele fechou para clientes novos em abril de 2026, e a AWS indica o ECS Express Mode", isCorrect: true },
                            { text: "Ele ainda aceita clientes novos, desde que o deploy seja feito pelo AWS Copilot CLI", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A Loja.Api responde 200 só em `/health`; na raiz e em `/ping`, devolve 404. O serviço Express foi criado com `containerPort` 8080, a porta em que a API escuta, e sem `--health-check-path`. O que acontece no primeiro deploy?",
                        difficulty: "medio",
                        options: [
                            { text: "O Express Mode descobre o `/health` pelas rotas do ASP.NET Core e passa a usá-lo", isCorrect: false },
                            { text: "Nada de errado, porque o Express Mode usa só o health check do contêiner, sem ALB", isCorrect: false },
                            { text: "O deploy sai normalmente, porque o ALB aceita qualquer resposta HTTP como saudável", isCorrect: false },
                            { text: "O health check bate num caminho que devolve 404, e as tasks nunca ficam saudáveis", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Além da API, o sistema tem um worker .NET que só consome mensagens de uma fila e não expõe nenhuma porta HTTP. Onde ele deve rodar?",
                        difficulty: "medio",
                        options: [
                            { text: "No Express Mode com `containerPort` zerado, que desliga o ALB e o health check HTTP", isCorrect: false },
                            { text: "No Express Mode mesmo, porque o ALB compartilhado ignora os serviços sem rota HTTP", isCorrect: false },
                            { text: "Num service comum do ECS com Fargate, já que o Express Mode é para aplicação HTTP", isCorrect: true },
                            { text: "No App Runner, que é o serviço da AWS feito para worker sem nenhuma porta exposta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API interna, que só outros serviços da VPC chamam, foi criada no Express Mode sem `--network-configuration`, numa conta que tem a VPC padrão. O que o Express Mode montou, e o que deveria ter sido passado?",
                        difficulty: "dificil",
                        options: [
                            { text: "ALB público com as tasks em sub-redes privadas, que é o desenho padrão de todo serviço Express", isCorrect: false },
                            { text: "ALB interno nas sub-redes privadas da VPC padrão, porque não foi informado nenhum domínio próprio", isCorrect: false },
                            { text: "Nenhum ALB, porque sem sub-redes a API fica só na URL `on.aws`, servida direto pelas próprias tasks", isCorrect: false },
                            { text: "ALB público e IP público nas tasks; para API interna, passe sub-redes privadas e o ALB sai interno", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Configuração e segredos: Secrets Manager, Parameter Store e as duas roles",
                blocks: [
                    {
                        type: "text",
                        value: "# Configuração e segredos: Secrets Manager, Parameter Store e as duas roles\n\nA chave do gateway de pagamentos foi parar na task definition como variável de ambiente comum, porque era o jeito mais rápido de a Loja.Api subir. Meses depois, um estagiário com a política `ReadOnlyAccess` abre o console do ECS para entender o serviço, clica na revisão da task definition e lê a chave em texto puro. Ela também está no template do CloudFormation, no `cdk.out` de quem rodou o synth e no histórico do Git, porque estava escrita no código do CDK.\n\nO campo `environment` da task definition é configuração, não cofre: a documentação do ECS diz com todas as letras que não recomenda variável de ambiente em texto puro para dado sensível. O synth abaixo mostra o problema antes de ele chegar à conta.",
                    },
                    {
                        type: "code",
                        value: "// SegredosStack.cs\n// ERRADO: chave em texto puro na task definition\ntaskDef.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, tagDaImagem),\n    Environment = new Dictionary<string, string>\n    {\n        [\"Pagamentos__ApiKey\"] = \"gp_live_9f2c41d7e0b84a6c\"\n    }\n});\n\n// cdk.out/LojaVazamento.template.json (trecho gerado pelo synth)\n\"Environment\": [{\"Name\": \"Pagamentos__ApiKey\", \"Value\": \"gp_live_9f2c41d7e0b84a6c\"}]",
                    },
                    {
                        type: "text",
                        value: "## O caminho certo: o campo secrets\n\nNo campo `secrets`, a task definition guarda só a **referência**: o ARN do segredo no Secrets Manager (com a chave JSON, se for o caso) ou do parâmetro no Parameter Store. Na subida da task, o agente do ECS busca o valor usando a **task execution role** e o entrega ao contêiner como variável de ambiente. Quem abre o console vê o ARN, não a chave. Os valores são criados fora do CDK, pela CLI ou pelo console (o CloudFormation nem cria parâmetro `SecureString`), e assim nunca passam pelo template.\n\nNo CDK, `Secret.FromSecretsManager` e `Secret.FromSsmParameter` montam a referência e já dão à execution role a permissão de leitura, como o template gerado confirma. Para o ASP.NET Core nada muda: a variável `Pagamentos__ApiKey` vira a chave `Pagamentos:ApiKey` da configuração (o `__` faz o papel do `:`), e o options pattern a lê como qualquer outra. Com `ValidateOnStart`, uma chave faltando derruba a task na subida, com `OptionsValidationException` no log, em vez de estourar no primeiro pagamento; num teste com a imagem `aspnet:10.0`, o contêiner sem as variáveis saiu na hora com esse erro.",
                    },
                    {
                        type: "code",
                        value: "// SegredosStack.cs (trecho): configuração em Environment, segredo em Secrets\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.ECR;\nusing Amazon.CDK.AWS.ECS;\nusing Amazon.CDK.AWS.SSM;\nusing Constructs;\nusing SecretsManager = Amazon.CDK.AWS.SecretsManager;\n\n// criados fora do CDK (CLI ou console): o valor nunca passa pelo template\nvar pagamentos = SecretsManager.Secret.FromSecretNameV2(this, \"Pagamentos\", \"loja/prod/pagamentos\");\nvar webhook = StringParameter.FromSecureStringParameterAttributes(this, \"Webhook\",\n    new SecureStringParameterAttributes { ParameterName = \"/loja/prod/webhook-secret\" });\n\ntaskDef.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, tagDaImagem),\n    PortMappings = [new PortMapping { ContainerPort = 8080 }],\n    Environment = new Dictionary<string, string>\n    {\n        [\"Pagamentos__BaseUrl\"] = \"https://api.gateway-exemplo.com\" // não é segredo\n    },\n    Secrets = new Dictionary<string, Secret>\n    {\n        // a task definition guarda só a referência; o valor é buscado na subida\n        [\"Pagamentos__ApiKey\"] = Secret.FromSecretsManager(pagamentos, \"apiKey\"),\n        [\"Pagamentos__WebhookSecret\"] = Secret.FromSsmParameter(webhook)\n    }\n});\n\n// a execution role já ganhou leitura por causa dos Secrets acima;\n// a leitura pelo SDK em tempo de execução (ChavePagamentos) usa a task role\npagamentos.GrantRead(taskDef.TaskRole);",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da Loja.Api (trecho)\nusing System.ComponentModel.DataAnnotations;\n\n// Pagamentos__BaseUrl chega por \"environment\"; Pagamentos__ApiKey e\n// Pagamentos__WebhookSecret chegam por \"secrets\". Para o ASP.NET Core, \"__\" no\n// nome da variável vira \":\" na configuração.\nbuilder.Services.AddOptions<PagamentosOptions>()\n    .Bind(builder.Configuration.GetSection(\"Pagamentos\"))\n    .ValidateDataAnnotations()\n    .ValidateOnStart(); // sem a chave, a task cai na subida, e não no primeiro pedido\n\npublic sealed class PagamentosOptions\n{\n    [Required, Url] public string BaseUrl { get; set; } = \"\";\n    [Required, MinLength(20)] public string ApiKey { get; set; } = \"\";\n    [Required] public string WebhookSecret { get; set; } = \"\";\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"\", \"Secrets Manager\", \"Parameter Store Standard\", \"Parameter Store Advanced\"], [\"Preço (outubro de 2026)\", \"0,40 dólar por segredo por mês e 0,05 dólar a cada 10 mil chamadas\", \"Sem custo de armazenamento nem de chamadas na vazão padrão\", \"0,05 dólar por parâmetro por mês\"], [\"Tamanho máximo do valor\", \"64 KB\", \"4 KB\", \"8 KB\"], [\"Rotação automática\", \"Sim, nativa\", \"Não\", \"Não\"], [\"Compartilhar com outra conta\", \"Sim\", \"Não\", \"Sim\"], [\"Uso típico\", \"Senha de banco, chave de API externa, credencial que gira\", \"Configuração e segredo simples em `SecureString`\", \"Valor grande ou com política de expiração\"]]",
                    },
                    {
                        type: "table",
                        value: "[[\"\", \"Task execution role\", \"Task role\"], [\"Quem usa\", \"O agente do ECS e do Fargate, fora do seu código\", \"O seu código, pelo SDK da AWS dentro do contêiner\"], [\"Quando\", \"Na subida da task e no envio de logs\", \"Enquanto a aplicação roda\"], [\"Para quê\", \"Baixar a imagem do ECR, mandar logs, buscar os `secrets`\", \"Ler segredo em tempo de execução, gravar no S3, publicar em fila\"], [\"Se faltar permissão\", \"A task nem sobe (`ResourceInitializationError`)\", \"A chamada falha com `AccessDeniedException`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Onde o segredo ainda escapa\n\n- **Dentro do contêiner, ele é variável de ambiente.** O processo, as ferramentas de diagnóstico e qualquer endpoint que despeje a configuração enxergam o valor. Nunca registre o `IConfiguration` inteiro no log nem deixe página de diagnóstico ligada em produção.\n- **`ENV` e `ARG` no Dockerfile gravam o valor nas camadas da imagem.** Quem tem permissão de baixar a imagem do ECR lê com `docker history`.\n- **`SecretValue.UnsafePlainText` no CDK** põe o valor no template; o nome do método já avisa.\n- **Rotação não chega sozinha.** O valor do campo `secrets` é lido uma vez, na subida. Depois de girar o segredo, as tasks em execução seguem com o antigo até subirem tasks novas (`aws ecs update-service --force-new-deployment`). Quem precisa da versão nova sem deploy lê pelo SDK em tempo de execução, com cache curto, como a classe abaixo. Essa leitura usa a **task role**, por isso o `GrantRead(taskDef.TaskRole)` no CDK: a permissão da execution role não chega ao seu código.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da Loja.Api (registro dos serviços)\nbuilder.Services.AddSingleton(TimeProvider.System);\nbuilder.Services.AddAWSService<IAmazonSecretsManager>(); // pacote AWSSDK.Extensions.NETCore.Setup\nbuilder.Services.AddSingleton<ChavePagamentos>();\n\n// ChavePagamentos.cs\nusing Amazon.SecretsManager;\nusing Amazon.SecretsManager.Model;\n\n// Leitura em tempo de execução: depois de uma rotação, o valor novo chega em até\n// 5 minutos, sem novo deploy. Quem assina esta chamada é a task role.\npublic sealed class ChavePagamentos(IAmazonSecretsManager secrets, TimeProvider relogio)\n{\n    private string? _valor;\n    private DateTimeOffset _lidoEm;\n\n    public async Task<string> ObterAsync(CancellationToken ct)\n    {\n        if (_valor is null || relogio.GetUtcNow() - _lidoEm > TimeSpan.FromMinutes(5))\n        {\n            var resposta = await secrets.GetSecretValueAsync(\n                new GetSecretValueRequest { SecretId = \"loja/prod/pagamentos\" }, ct);\n            _valor = resposta.SecretString;\n            _lidoEm = relogio.GetUtcNow();\n        }\n        return _valor;\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "Configuração comum vai em `environment`; segredo vai em `secrets`, com o valor no Secrets Manager ou no Parameter Store e só a referência na task definition. A execution role busca o segredo na subida; a task role é a identidade do seu código depois que ele está rodando.",
                    },
                ],
                questions: [
                    {
                        statement: "A task definition da Loja.Api usa o campo `secrets` para receber a chave do gateway de pagamentos, que está guardada no Secrets Manager. Qual role precisa de `secretsmanager:GetSecretValue` para a task subir?",
                        difficulty: "facil",
                        options: [
                            { text: "A infrastructure role, que o ECS usa para criar os recursos em seu nome", isCorrect: false },
                            { text: "A task role, porque é ela a identidade que a aplicação usa dentro do contêiner", isCorrect: false },
                            { text: "A task execution role, que o agente do ECS usa para buscar o valor na subida", isCorrect: true },
                            { text: "A role de quem rodou o `cdk deploy`, que assina a criação das tasks", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma chave de API foi declarada no campo `environment` da task definition. Quem consegue ler o valor sem entrar no contêiner?",
                        difficulty: "facil",
                        options: [
                            { text: "Só o usuário root da conta, porque o ECS mascara o valor para os demais usuários", isCorrect: false },
                            { text: "Quem tem permissão de descrever a task definition, pelo console ou pela CLI", isCorrect: true },
                            { text: "Ninguém, porque o ECS criptografa as variáveis de ambiente com uma chave KMS", isCorrect: false },
                            { text: "Só quem tem acesso ao Secrets Manager, onde o ECS guarda a variável declarada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A equipe precisa guardar duas coisas: a senha de um serviço externo, que o fornecedor exige trocar a cada 30 dias com rotação automática, e o nome do bucket de relatórios, que não é segredo. Qual combinação faz sentido?",
                        difficulty: "medio",
                        options: [
                            { text: "Senha em `SecureString` e nome do bucket no Secrets Manager, que é mais barato", isCorrect: false },
                            { text: "Os dois no Secrets Manager, o único que o campo `secrets` consegue ler", isCorrect: false },
                            { text: "Os dois em `SecureString`, que tem rotação automática nativa no Parameter Store", isCorrect: false },
                            { text: "Senha no Secrets Manager com rotação; nome do bucket em parâmetro `String`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A senha no Secrets Manager foi girada às 14h. A Loja.Api recebe o valor pelo campo `secrets` da task definition, e as tasks estão de pé desde as 9h. O que acontece com elas?",
                        difficulty: "medio",
                        options: [
                            { text: "Seguem com o valor antigo até subirem tasks novas, por exemplo num deploy forçado", isCorrect: true },
                            { text: "São reiniciadas pelo ECS na hora, porque a rotação dispara um deploy do serviço", isCorrect: false },
                            { text: "Passam a falhar na hora, porque o ECS apaga a variável quando a versão muda", isCorrect: false },
                            { text: "Recebem o valor novo em alguns minutos, porque o agente consulta o segredo de novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A classe `ChavePagamentos` lê o segredo pelo SDK da AWS em tempo de execução. A execution role tem `secretsmanager:GetSecretValue` nesse segredo, e o campo `secrets` da mesma task funciona. Mesmo assim, a chamada do SDK falha com `AccessDeniedException`. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "O SDK usa as credenciais da task role, e ela não tem a permissão", isCorrect: true },
                            { text: "O segredo precisa de uma política de recurso liberando a execution role", isCorrect: false },
                            { text: "O SDK só lê segredos que já foram injetados pelo campo `secrets`", isCorrect: false },
                            { text: "O SDK usa a execution role, mas falta `kms:Decrypt` na chave padrão", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Deploy sem downtime: rolling update, circuit breaker e blue/green",
                blocks: [
                    {
                        type: "text",
                        value: "# Deploy sem downtime: rolling update, circuit breaker e blue/green\n\nSexta, 18h, deploy da versão 1.5.0. A versão nova passou a exigir `Frete:ApiKey`, a chave de um serviço de frete que ninguém cadastrou na task definition, e o `ValidateOnStart` derruba a aplicação na subida, como deveria. O que vem depois depende de configuração. Sem circuit breaker, o ECS insiste em subir tasks novas sem prazo, e o `cdk deploy` fica preso esperando (o próprio CDK avisa no synth que a falha pode levar até 3 horas para aparecer). Com `MinHealthyPercent` em 50 e `MaxHealthyPercent` em 100, metade das tasks antigas já foi desligada para abrir espaço, e a API atravessa o fim de semana com metade da capacidade.\n\nO **rolling update** é a estratégia padrão do ECS: troca as tasks aos poucos, e dois números controlam o ritmo. O `minimumHealthyPercent` é o piso de tasks saudáveis durante a troca, arredondado para cima; o `maximumPercent` é o teto de tasks rodando, somando antigas e novas, arredondado para baixo. Para serviço réplica, a API do ECS usa 100 e 200 quando você não informa, mas o CDK não deixa o campo vazio: sem `MinHealthyPercent` declarado, ele grava 50 no template e avisa no synth (`minHealthyPercent has not been configured so the default value of 50% is used`). Declare os dois. Com desired count 4:",
                    },
                    {
                        type: "table",
                        value: "[[\"minimumHealthyPercent e maximumPercent\", \"O que o ECS faz\", \"Custo e risco\"], [\"100 e 200\", \"Sobe 4 tasks novas e só para as antigas quando as novas ficam saudáveis\", \"A capacidade nunca cai; paga até 8 tasks durante a troca\"], [\"100 e 150\", \"Sobe 2 novas por vez (teto de 6) e troca em duas levas\", \"Meio-termo entre custo e velocidade\"], [\"75 e 100\", \"Para 1 antiga por vez (o piso é 3) e sobe 1 nova no lugar\", \"Não gasta a mais, mas o deploy é lento e perde 25% da capacidade\"], [\"50 e 100\", \"Para 2 antigas, sobe 2 novas e repete\", \"Não gasta a mais, mas roda com metade da capacidade\"]]",
                    },
                    {
                        type: "text",
                        value: "## Entrar saudável e sair sem derrubar requisição\n\nCom ALB, a task nova só conta para o piso quando passa no health check do target group (e no do contêiner, se houver). Três ajustes evitam deploy lento e task morta sem motivo:\n\n- **Health check raso.** O ALB deve consultar um endpoint que diga se o processo responde, sem testar banco ou serviço externo. Se o `/health` checar o banco e o banco oscilar, todas as tasks ficam não saudáveis ao mesmo tempo: o ALB entra em *fail open* e manda tráfego para todas assim mesmo, e o ECS começa a trocar tasks que estavam perfeitas. Dependências vão num endpoint separado, para diagnóstico.\n- **Grace period.** O `HealthCheckGracePeriod` diz por quanto tempo o ECS ignora o health check do ALB depois que a task sobe (o CDK põe 60 segundos quando há load balancer; a API do ECS usa 0). Aplicação que roda migração ou aquece cache na subida precisa de mais.\n- **Health check de contêiner precisa de ferramenta na imagem.** O comando roda dentro do contêiner, e a `aspnet:10.0` não traz `curl` nem `wget`. Para API atrás de ALB, o health check do target group basta.\n\nDo lado de quem sai, a task antiga passa por DEACTIVATING: sai do target group e o ALB espera as requisições em andamento pelo **deregistration delay** (300 segundos por padrão). Depois vem STOPPING: o contêiner recebe SIGTERM e, se não terminar em `stopTimeout` (30 segundos por padrão, no máximo 120 no Fargate), recebe SIGKILL. O host do .NET trata o SIGTERM, para de aceitar conexões e espera as requisições em andamento por até `HostOptions.ShutdownTimeout`, que no .NET 10 também é de 30 segundos. Deixe o do .NET menor que o `stopTimeout` (25 contra 30 no código abaixo). E se as requisições da API duram segundos, 300 segundos de drenagem só deixam o deploy lento: 30 bastam.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da Loja.Api (trecho)\nusing Microsoft.AspNetCore.Diagnostics.HealthChecks;\nusing Microsoft.Extensions.Diagnostics.HealthChecks;\n\nbuilder.Services.AddHealthChecks()\n    .AddCheck(\"gateway-pagamentos\", () => HealthCheckResult.Healthy(), tags: [\"dependencia\"]);\n\n// O ECS manda SIGTERM e espera o stopTimeout (30 s por padrão) antes do SIGKILL:\n// o host precisa terminar as requisições em andamento antes disso.\nbuilder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(25));\n\n// Raso: só responde se o processo está de pé. É este caminho que o ALB consulta.\napp.MapHealthChecks(\"/health\", new HealthCheckOptions { Predicate = _ => false });\n\n// Profundo: testa as dependências. Serve para diagnóstico, não para o ALB.\napp.MapHealthChecks(\"/health/dependencias\", new HealthCheckOptions\n{\n    Predicate = check => check.Tags.Contains(\"dependencia\")\n});\n\n// DeployRollingStack.cs (trecho, com os mesmos usings da ApiFargateStack)\ntaskDef.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, tagDaImagem),\n    PortMappings = [new PortMapping { ContainerPort = 8080 }],\n    StopTimeout = Duration.Seconds(30) // do SIGTERM ao SIGKILL (máximo de 120 s)\n});\n\nvar servico = new FargateService(this, \"ApiService\", new FargateServiceProps\n{\n    Cluster = cluster,\n    TaskDefinition = taskDef,\n    DesiredCount = 4,\n    MinHealthyPercent = 100, // nunca menos de 4 tasks saudáveis\n    MaxHealthyPercent = 200, // até 8 tasks durante a troca\n    CircuitBreaker = new DeploymentCircuitBreaker { Enable = true, Rollback = true },\n    HealthCheckGracePeriod = Duration.Seconds(60)\n});\n\nlistener.AddTargets(\"Api\", new AddApplicationTargetsProps\n{\n    Port = 8080,\n    Protocol = ApplicationProtocol.HTTP,\n    Targets = [servico],\n    DeregistrationDelay = Duration.Seconds(30), // o padrão do ALB é 300 s\n    HealthCheck = new HealthCheck\n    {\n        Path = \"/health\",\n        Interval = Duration.Seconds(10),\n        HealthyThresholdCount = 2,\n        UnhealthyThresholdCount = 3\n    }\n});",
                    },
                    {
                        type: "text",
                        value: "## Circuit breaker e rollback\n\nO **circuit breaker** de deploy acompanha a troca em duas etapas: primeiro, se as tasks novas chegam a RUNNING; depois, se passam nos health checks (ALB, Cloud Map e health check do contêiner). Cada task que falha soma um; quando a conta chega ao limite, o deploy vira FAILED e, com `Rollback = true`, o ECS volta para o último deploy em estado COMPLETED. O limite padrão é 50% do desired count, com mínimo de 3 e máximo de 200: com 4 tasks são 3 falhas, com 10 são 5. Por padrão, uma task saudável no meio zera a contagem, então valem as falhas seguidas.\n\nO circuit breaker pega task que não sobe ou não fica saudável. Erro de negócio com a task saudável (500 em metade das requisições) pede alarme do CloudWatch acompanhando o deploy, assunto do módulo 6. E rollback manual também existe: durante um deploy, `stop-service-deployment` com `ROLLBACK` volta para a revisão anterior, mesmo sem rollback automático configurado. Depois de concluído, voltar é fazer um deploy novo com a revisão (ou a tag) anterior, e é aqui que a tag imutável da aula 1 paga a conta.",
                    },
                    {
                        type: "code",
                        value: "# terminal: histórico de deploys do service\naws ecs list-service-deployments --cluster loja --service loja-api\n\n# parar o deploy em andamento e voltar para a revisão anterior\naws ecs stop-service-deployment --stop-type ROLLBACK \\\n  --service-deployment-arn arn:aws:ecs:us-east-1:111122223333:service-deployment/loja/loja-api/ejGvqq2ilnbKT9qj0vLJe\n\n# deploy já concluído com problema: volte para a revisão anterior da task definition\n# (service criado pelo CDK? volte a tag no CDK e rode cdk deploy, ou o próximo deploy desfaz isto)\naws ecs update-service --cluster loja --service loja-api --task-definition loja-api:41",
                    },
                    {
                        type: "text",
                        value: "## Blue/green nativo no ECS\n\nNo rolling update, as duas versões atendem tráfego juntas durante a troca, e voltar atrás significa subir as tasks antigas de novo. O **blue/green** mantém a versão atual (azul) inteira no ar, sobe a nova (verde) em outro target group, troca o tráfego de uma vez na regra do listener e segura a azul de prontidão durante o **bake time**: se um alarme dispara ou um lifecycle hook reprova, o tráfego volta para a azul sem esperar task nenhuma subir.\n\nAté meados de 2025, isso exigia o CodeDeploy (deployment controller `CODE_DEPLOY`). Desde julho de 2025, o próprio ECS faz blue/green com o deployment controller padrão, e em outubro de 2025 ganhou também as estratégias linear e canary. Em 2026 a AWS recomenda o caminho nativo para serviço novo; o CodeDeploy continua válido para quem já usa. O nativo pede dois target groups, uma regra de listener de produção que o ECS reescreve na troca e uma role com a política `AmazonECSInfrastructureRolePolicyForLoadBalancers` (o CDK cria). Opcionalmente, uma regra de teste (por cabeçalho, por exemplo) leva tráfego de teste à verde antes da troca, e lifecycle hooks (uma Lambda ou uma pausa até alguém aprovar) validam cada etapa. O preço: durante o deploy e o bake time, as duas versões rodam inteiras.",
                    },
                    {
                        type: "code",
                        value: "// BlueGreenStack.cs (trecho): blue/green nativo do ECS, sem CodeDeploy\n// usings como na ApiFargateStack, inclusive o alias HealthCheck do ELBv2\nApplicationTargetGroup Grupo(string nome) => new(this, nome, new ApplicationTargetGroupProps\n{\n    Vpc = vpc,\n    Port = 8080,\n    Protocol = ApplicationProtocol.HTTP,\n    TargetType = TargetType.IP,\n    HealthCheck = new HealthCheck { Path = \"/health\" }\n});\nvar azul = Grupo(\"Azul\");\nvar verde = Grupo(\"Verde\");\n\nvar listener = alb.AddListener(\"Http\", new BaseApplicationListenerProps\n{\n    Port = 80,\n    DefaultAction = ListenerAction.FixedResponse(404)\n});\nvar producao = new ApplicationListenerRule(this, \"Producao\", new ApplicationListenerRuleProps\n{\n    Listener = listener,\n    Priority = 10,\n    Conditions = [ListenerCondition.PathPatterns([\"/*\"])],\n    Action = ListenerAction.Forward([azul])\n});\n\nvar servico = new FargateService(this, \"ApiService\", new FargateServiceProps\n{\n    Cluster = cluster,\n    TaskDefinition = taskDef,\n    DesiredCount = 4,\n    DeploymentStrategy = DeploymentStrategy.BLUE_GREEN,\n    BakeTime = Duration.Minutes(15), // a versão antiga fica de prontidão\n    CircuitBreaker = new DeploymentCircuitBreaker { Enable = true, Rollback = true },\n    MinHealthyPercent = 100,\n    MaxHealthyPercent = 200\n});\n\nservico.LoadBalancerTarget(new LoadBalancerTargetOptions\n{\n    ContainerName = \"api\",\n    ContainerPort = 8080,\n    AlternateTarget = new AlternateTarget(\"Verde\", new AlternateTargetProps\n    {\n        AlternateTargetGroup = verde,\n        ProductionListener = ListenerRuleConfiguration.ApplicationListenerRule(producao)\n    })\n}).AttachToApplicationTargetGroup(azul);",
                    },
                    {
                        type: "table",
                        value: "[[\"Estratégia\", \"Como o tráfego muda\", \"Voltar atrás\", \"Capacidade durante o deploy\"], [\"Rolling update\", \"Tasks novas entram no mesmo target group, aos poucos\", \"Circuit breaker ou deploy da revisão anterior; as tasks antigas sobem de novo\", \"Até o maximumPercent\"], [\"Blue/green\", \"Tudo de uma vez, da azul para a verde\", \"Imediato durante o bake time: a regra volta para a azul\", \"Duas versões inteiras\"], [\"Canary\", \"Uma fatia pequena primeiro, o resto depois de um tempo\", \"Imediato enquanto a azul estiver de pé\", \"Duas versões inteiras\"], [\"Linear\", \"Passos iguais, como 10% a cada 5 minutos\", \"Imediato enquanto a azul estiver de pé\", \"Duas versões inteiras\"]]",
                    },
                    {
                        type: "quote",
                        value: "Deploy sem downtime é configuração, não sorte: health check raso, grace period e drenagem ajustados, piso de 100% e circuit breaker com rollback. Quando voltar em segundos vale pagar capacidade em dobro, o blue/green nativo do ECS faz isso sem CodeDeploy.",
                    },
                ],
                questions: [
                    {
                        statement: "Um service com desired count 4 usa `minimumHealthyPercent` 100 e `maximumPercent` 200 no rolling update. Como o ECS conduz o deploy?",
                        difficulty: "facil",
                        options: [
                            { text: "Sobe até 4 tasks novas e só para as antigas depois que elas ficam saudáveis", isCorrect: true },
                            { text: "Para 2 tasks antigas para abrir espaço e depois sobe 2 tasks novas no lugar", isCorrect: false },
                            { text: "Sobe 1 task nova por vez e para 1 antiga a cada nova que fica saudável", isCorrect: false },
                            { text: "Para as 4 tasks antigas de uma vez e sobe as 4 novas logo em seguida", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O circuit breaker de deploy está ligado com rollback, e as tasks da versão nova não conseguem ficar saudáveis. O que o ECS faz quando a contagem de falhas chega ao limite?",
                        difficulty: "facil",
                        options: [
                            { text: "Marca o deploy como FAILED e deixa as tasks novas no ar até alguém decidir o que fazer", isCorrect: false },
                            { text: "Pausa o deploy e espera um `ContinueServiceDeployment` para tentar de novo", isCorrect: false },
                            { text: "Marca o deploy como FAILED e volta para o último deploy concluído com sucesso", isCorrect: true },
                            { text: "Volta para a primeira revisão da task definition, a que criou o service", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os deploys da Loja.Api levam uns 5 minutos a mais do que o esperado, e o tempo some com as tasks antigas paradas em DEACTIVATING. As requisições da API duram menos de 2 segundos. Qual ajuste resolve?",
                        difficulty: "medio",
                        options: [
                            { text: "Baixar o deregistration delay do target group, que é de 300 segundos por padrão", isCorrect: true },
                            { text: "Desligar o circuit breaker, que segura as tasks antigas até o fim da avaliação", isCorrect: false },
                            { text: "Baixar o `stopTimeout` do contêiner, que é de 300 segundos por padrão no Fargate", isCorrect: false },
                            { text: "Aumentar o `maximumPercent` para o ECS parar mais tasks antigas de uma só vez", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O `/health` da API consulta o banco. Às 3h o banco fica lento por dois minutos, e todos os alvos do target group são marcados como não saudáveis ao mesmo tempo. O que o ALB faz com as requisições nesse intervalo?",
                        difficulty: "medio",
                        options: [
                            { text: "Devolve 503 para todas, porque o ALB nunca manda tráfego para um alvo não saudável", isCorrect: false },
                            { text: "Segura as requisições numa fila interna até algum alvo voltar a passar no health check", isCorrect: false },
                            { text: "Manda para todos os alvos mesmo assim, porque com todos não saudáveis ele entra em fail open", isCorrect: true },
                            { text: "Manda para o target group de outra região, que o ALB usa como reserva automática nessas horas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um service com desired count 4 tem o circuit breaker com o limite padrão (`BOUNDED_PERCENT`, valor 50). O deploy aponta o campo `secrets` para um segredo que a execution role não consegue ler, e nenhuma task nova chega a RUNNING. Quantas falhas seguidas o ECS conta antes de marcar o deploy como FAILED?",
                        difficulty: "dificil",
                        options: [
                            { text: "3, porque 50% de 4 dá 2, e o limite no modo padrão tem mínimo de 3", isCorrect: true },
                            { text: "10, porque o limite padrão é fixo, seja qual for o desired count", isCorrect: false },
                            { text: "4, porque o ECS espera falhar uma vez cada task do desired count", isCorrect: false },
                            { text: "2, porque o limite é metade do desired count, arredondada para cima", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Dados",
        aulas: [
            {
                titulo: "RDS for PostgreSQL: criar, conectar e Multi-AZ",
                blocks: [
                    {
                        type: "text",
                        value: "# RDS for PostgreSQL: criar, conectar e Multi-AZ\n\nA API da loja já roda no ECS com Fargate, mas o banco ainda é aquele contêiner de PostgreSQL que alguém subiu \"só para testar\". O disco de uma task do Fargate é efêmero: quando a task é substituída, os dados vão junto. E PostgreSQL numa EC2 cuidada por você significa aplicar patch, montar backup, vigiar disco e torcer para a máquina não morrer de madrugada. O **Amazon RDS for PostgreSQL** é o PostgreSQL gerenciado: você escolhe versão, classe de instância e armazenamento, e a AWS cuida da instalação, do patch de versão menor na janela de manutenção, do backup automático e da troca para a instância em espera quando a máquina falha. Continuam com você a modelagem, os índices, as consultas lentas, os usuários dentro do banco, a hora de subir de versão major e a conta do fim do mês.\n\n**Versões em outubro de 2026.** O RDS oferece do PostgreSQL 14 ao 18 em suporte padrão. O 18 chegou ao RDS em novembro de 2025, e a versão menor mais recente é a 18.6, de agosto de 2026. O 13 saiu do suporte padrão em 28/02/2026, e instância que ficou nele passou para o RDS Extended Support, cobrado à parte desde 01/03/2026; o 14 segue o mesmo caminho em 28/02/2027. O critério que não envelhece: projeto novo começa na major mais nova que o RDS oferece, e o upgrade de major entra no planejamento do ano, porque major velha vira cobrança extra.\n\n## Onde o banco mora\nO banco vai nas sub-redes **privadas isoladas** da VPC do módulo 2, as que não têm rota para a internet: ninguém de fora precisa falar com ele, e ele não precisa sair para lugar nenhum. A entrada é controlada pelo **security group**: o do banco aceita a porta 5432 só a partir do security group da API, por referência, sem faixa de IP. O RDS exige um *DB subnet group* com sub-redes em pelo menos duas zonas de disponibilidade, mesmo numa instância Single-AZ, e o CDK monta esse grupo a partir do `VpcSubnets`.\n\nMuita gente liga o acesso público \"só para conectar do notebook\" e esquece ligado: o banco ganha IP na internet e fica protegido apenas pela senha. Para mexer no banco a partir do seu computador, use um túnel por uma máquina dentro da VPC (o Session Manager faz isso sem abrir porta de entrada), nunca `PubliclyAccessible`.",
                    },
                    {
                        type: "code",
                        value: "// DadosStack.cs\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.EC2;\nusing Amazon.CDK.AWS.RDS;\nusing Constructs;\nusing InstanceType = Amazon.CDK.AWS.EC2.InstanceType;\n\npublic class DadosStackProps : StackProps\n{\n    public required IVpc Vpc { get; init; }\n    public required ISecurityGroup ApiSecurityGroup { get; init; }\n}\n\npublic class DadosStack : Stack\n{\n    public DatabaseInstance Banco { get; }\n\n    public DadosStack(Construct scope, string id, DadosStackProps props) : base(scope, id, props)\n    {\n        Banco = new DatabaseInstance(this, \"Banco\", new DatabaseInstanceProps\n        {\n            InstanceIdentifier = \"loja-prod\",\n            Engine = DatabaseInstanceEngine.Postgres(new PostgresInstanceEngineProps\n            {\n                Version = PostgresEngineVersion.VER_18,\n            }),\n            InstanceType = InstanceType.Of(InstanceClass.BURSTABLE4_GRAVITON, InstanceSize.MEDIUM),\n            Vpc = props.Vpc,\n            VpcSubnets = new SubnetSelection { SubnetType = SubnetType.PRIVATE_ISOLATED },\n            PubliclyAccessible = false,\n            MultiAz = true,\n            StorageType = StorageType.GP3,\n            AllocatedStorage = 50,\n            MaxAllocatedStorage = 200,\n            StorageEncrypted = true,\n            DatabaseName = \"loja\",\n            Credentials = Credentials.FromGeneratedSecret(\"loja_admin\"),\n            DeletionProtection = true,\n        });\n\n        Banco.Connections.AllowDefaultPortFrom(props.ApiSecurityGroup, \"API da loja no ECS\");\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que o código decide, e os padrões que pegam\nCada propriedade do `DatabaseInstanceProps` responde a uma pergunta de produção, e três padrões do CDK merecem desconfiança. `StorageEncrypted` é **falso** quando você não passa chave KMS, e criptografia não se liga depois numa instância existente (o caminho é snapshot, cópia criptografada e restauração). `StorageType` tem como padrão o **gp2**, que a própria AWS chama de geração anterior: no RDS for PostgreSQL ele entrega 3 IOPS por GiB (150 num disco de 50 GiB, com crédito para picos), enquanto o **gp3**, pelo mesmo preço por GB em us-east-1, dá 3.000 IOPS e 125 MiB/s de base em qualquer tamanho até 399 GiB. E sem `MaxAllocatedStorage` não há crescimento automático: disco cheio para de aceitar escrita.\n\n`PostgresEngineVersion.VER_18` fixa só a major: o RDS escolhe a versão menor padrão na criação e aplica as seguintes na janela de manutenção (`AutoMinorVersionUpgrade`, ligado por padrão). Isso também livra você do atraso do CDK: no `Amazon.CDK.Lib` 2.273.0 a constante mais nova é `VER_18_3`, e o RDS já está na 18.6. `DeletionProtection` impede que um `cdk destroy` ou um clique apague o banco, e `InstanceIdentifier` fixa o nome `loja-prod`, que aparece no endpoint e nos comandos de backup. O alias de `InstanceType` existe porque `Amazon.CDK.AWS.RDS` também tem um tipo com esse nome, e o compilador recusa a ambiguidade.\n\n## Usuário, senha e TLS\n`Credentials.FromGeneratedSecret(\"loja_admin\")` cria no Secrets Manager um segredo JSON com `username` e uma `password` de 30 caracteres, gerada sem os caracteres que costumam quebrar connection string e URL (`;`, `@`, `/`, aspas). A task definition recebe usuário e senha pela seção `secrets`, como no módulo 3: o ECS lê só a chave pedida do JSON, usando a execution role, e o CDK já concede a ela a leitura desse segredo. Host e nome do banco não são segredo e vão como variável comum. Muita gente monta a connection string inteira, com senha, numa variável `environment`: qualquer pessoa com leitura no ECS vê a senha no console. Na API, a connection string sai do `NpgsqlConnectionStringBuilder`, que cuida de aspas e escape (a senha `a;b=c` vira `Password=\"a;b=c\"`), coisa que concatenar texto não faz. Esse usuário mestre é para administração e migrations; em produção madura, a aplicação usa um usuário próprio, só com as permissões de que precisa.\n\nDesde o PostgreSQL 15, o RDS vem com `rds.force_ssl` ligado e recusa conexão sem TLS. O Npgsql usa `SslMode=Prefer` por padrão, que cifra mas não confere quem está do outro lado. Com `VerifyFull` e o pacote de autoridades certificadoras do RDS (`global-bundle.pem`, de `truststore.pki.rds.amazonaws.com`, copiado para a imagem no Dockerfile), o cliente confere a cadeia e o nome do host.",
                    },
                    {
                        type: "code",
                        value: "// ApiStack.cs (trecho): o contêiner recebe o endereço por variável comum\n// e o usuário e a senha pelo segredo, lidos pela execution role\n// (EcsSecret é o alias using EcsSecret = Amazon.CDK.AWS.ECS.Secret;\n// o SecretsManager também tem uma classe Secret)\ntaskDefinition.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repositorio, \"1.4.0\"),\n    Environment = new Dictionary<string, string>\n    {\n        [\"Banco__Host\"] = banco.DbInstanceEndpointAddress,\n        [\"Banco__Nome\"] = \"loja\",\n    },\n    Secrets = new Dictionary<string, EcsSecret>\n    {\n        [\"Banco__Usuario\"] = EcsSecret.FromSecretsManager(banco.Secret!, \"username\"),\n        [\"Banco__Senha\"] = EcsSecret.FromSecretsManager(banco.Secret!, \"password\"),\n    },\n});\n\n// Program.cs da API: monta a connection string a partir das variáveis do contêiner\nusing Microsoft.EntityFrameworkCore;\nusing Npgsql;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nvar banco = builder.Configuration.GetSection(\"Banco\");\nvar conexao = new NpgsqlConnectionStringBuilder\n{\n    Host = banco[\"Host\"],\n    Database = banco[\"Nome\"],\n    Username = banco[\"Usuario\"],\n    Password = banco[\"Senha\"],\n    SslMode = SslMode.VerifyFull,                       // confere o certificado e o nome do host\n    RootCertificate = \"/app/certs/global-bundle.pem\",   // pacote de CAs do RDS, copiado na imagem\n};\n\nbuilder.Services.AddDbContext<LojaDbContext>(options =>\n    options.UseNpgsql(conexao.ConnectionString, npgsql =>\n        npgsql.EnableRetryOnFailure(\n            maxRetryCount: 5,\n            maxRetryDelay: TimeSpan.FromSeconds(10),\n            errorCodesToAdd: null)));\n\nvar app = builder.Build();\napp.MapPedidos();\napp.Run();",
                    },
                    {
                        type: "text",
                        value: "## Multi-AZ: duas formas, dois preços\n`MultiAz = true` cria uma **instância em espera** (standby) em outra zona de disponibilidade, com replicação **síncrona**. Ela **não atende leitura**: existe para assumir. Quando o primário falha, ou numa manutenção do sistema operacional, o RDS promove a espera e aponta o mesmo nome DNS para ela, num failover que a documentação diz levar tipicamente de **60 a 120 segundos**. O preço praticamente dobra: em São Paulo (sa-east-1), em outubro de 2026, a db.t4g.medium custa 0,137 dólar por hora em Single-AZ e 0,275 em Multi-AZ, e o GB de gp3 vai de 0,219 para 0,438 dólar por mês. Com 50 GB, são cerca de 111 dólares por mês contra 223 (na Virgínia do Norte, us-east-1, a mesma conta dá menos da metade).\n\nA outra forma é o **cluster Multi-AZ** (Multi-AZ DB cluster): uma instância de escrita e **duas leitoras** em três zonas, com replicação **semissíncrona**, em que o commit espera a confirmação de pelo menos uma leitora. As leitoras atendem consultas por um endpoint de leitura, e o failover típico fica **abaixo de 35 segundos**. Em troca, só aceita classes com disco local NVMe (como `db.m6gd`, `db.r6gd`, `db.c6gd`, `db.m8gd` e `db.r8gd`), cobra três instâncias e não tem construção L2 no CDK: sai com `CfnDBCluster`. Não confunda nenhuma das duas com réplica de leitura (assíncrona, promovida à mão) nem com o Aurora, que tem outra arquitetura.",
                    },
                    {
                        type: "table",
                        value: "[[\"Opção\", \"Instâncias\", \"A espera atende leitura?\", \"Replicação\", \"Failover típico\", \"Uso comum\"], [\"Single-AZ\", \"1\", \"Não há espera\", \"Nenhuma\", \"Não há: espera o RDS recuperar a instância; se a zona cair, só restaurando backup\", \"Desenvolvimento e homologação\"], [\"Multi-AZ com instância em espera\", \"2\", \"Não\", \"Síncrona\", \"60 a 120 segundos\", \"Produção na maioria dos sistemas\"], [\"Cluster Multi-AZ\", \"3 (uma de escrita e duas leitoras)\", \"Sim, pelo endpoint de leitura\", \"Semissíncrona\", \"Abaixo de 35 segundos\", \"Produção que precisa de failover curto e leitura extra\"]]",
                    },
                    {
                        type: "text",
                        value: "## O failover visto pela aplicação\nO endpoint continua o mesmo, mas passa a apontar para outra máquina: as conexões abertas morrem, e quem estava no meio de uma consulta recebe erro. O pool do Npgsql descarta a conexão quebrada e abre outra, que resolve o nome de novo e chega ao novo primário. Falta repetir a operação que falhou, e é isso que o `EnableRetryOnFailure` faz: cada consulta e cada `SaveChangesAsync` passa a ser repetido em erro transitório, com espera crescente entre as tentativas. O efeito colateral: com retry ligado, o EF Core bufferiza o resultado inteiro de cada consulta antes de entregar, o que pesa em consulta que devolve muitas linhas.\n\nA pegadinha é a transação explícita. Com retry ligado, um `BeginTransactionAsync` solto faz o EF Core lançar `InvalidOperationException`, avisando que a `NpgsqlRetryingExecutionStrategy` não aceita transação iniciada pelo usuário. A saída é rodar o bloco inteiro dentro de `CreateExecutionStrategy().ExecuteAsync`, para que a nova tentativa refaça tudo desde o começo. E limpe o rastreador no início do bloco: sem isso, a segunda tentativa ainda encontra o `Pagamento` da primeira marcado para inserir, adiciona outro e grava dois. Teste antes de precisar: em homologação Multi-AZ, um reboot com failover mostra se a API aguenta.",
                    },
                    {
                        type: "code",
                        value: "// PedidosEndpoints.cs (trecho): transação explícita dentro da estratégia de retry\napp.MapPost(\"/pedidos/{id:int}/pagar\", async (int id, LojaDbContext db, CancellationToken ct) =>\n{\n    var estrategia = db.Database.CreateExecutionStrategy();\n    return await estrategia.ExecuteAsync(async () =>\n    {\n        db.ChangeTracker.Clear();   // numa nova tentativa, nada da anterior fica rastreado\n        await using var tx = await db.Database.BeginTransactionAsync(ct);\n\n        var pedido = await db.Pedidos.FindAsync([id], ct);\n        if (pedido is null) return Results.NotFound();\n\n        pedido.Status = StatusPedido.Pago;\n        db.Pagamentos.Add(new Pagamento { PedidoId = id, PagoEm = DateTime.UtcNow });\n        await db.SaveChangesAsync(ct);\n        await tx.CommitAsync(ct);\n        return Results.NoContent();\n    });\n});\n\n# terminal, em homologação Multi-AZ: força um failover e observe a API\naws rds reboot-db-instance --db-instance-identifier loja-hml --force-failover",
                    },
                    {
                        type: "quote",
                        value: "O RDS for PostgreSQL mora na sub-rede isolada, aceita conexão só do security group da API e entrega a senha pelo Secrets Manager. O Multi-AZ com espera dobra o custo para trocar de máquina em um ou dois minutos, o cluster Multi-AZ encurta isso e ainda serve leitura, e em qualquer caso a aplicação só atravessa o failover se repetir o que falhou.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa instância RDS for PostgreSQL criada com `MultiAz = true`, qual é o papel da instância em espera?",
                        difficulty: "facil",
                        options: [
                            { text: "Atender as leituras enquanto o primário cuida das escritas", isCorrect: false },
                            { text: "Dividir as escritas com o primário e dobrar a vazão do banco", isCorrect: false },
                            { text: "Receber cópia assíncrona para os relatórios pesados do mês", isCorrect: false },
                            { text: "Assumir no failover; ela não atende leitura nem escrita", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Ao criar o RDS for PostgreSQL da API da loja, onde colocar a instância e como liberar o acesso da aplicação?",
                        difficulty: "facil",
                        options: [
                            { text: "Em sub-rede privada isolada, com o security group aceitando a 5432 de 0.0.0.0/0, já que lá não há rota", isCorrect: false },
                            { text: "Em sub-rede pública com acesso público ligado, aceitando a 5432 só do IP fixo do escritório e da VPN", isCorrect: false },
                            { text: "Em sub-rede privada isolada, com o security group do banco aceitando a 5432 do security group da API", isCorrect: true },
                            { text: "Em sub-rede privada isolada, liberando a 5432 numa network ACL da sub-rede, sem regra no security group", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API registra o contexto com `UseNpgsql(conexao, o => o.EnableRetryOnFailure())`. Um endpoint chama `BeginTransactionAsync`, altera duas tabelas, chama `SaveChangesAsync` e `CommitAsync`, e passou a lançar `InvalidOperationException` dizendo que a estratégia de execução não aceita transação iniciada pelo usuário. Qual é a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "Remover o `EnableRetryOnFailure()` e envolver só o `CommitAsync` num `try/catch` que tenta de novo", isCorrect: false },
                            { text: "Chamar `SaveChangesAsync` uma vez por tabela, para cada gravação virar uma unidade de retry separada", isCorrect: false },
                            { text: "Rodar tudo, da abertura da transação ao commit, dentro de `CreateExecutionStrategy().ExecuteAsync`", isCorrect: true },
                            { text: "Trocar o `BeginTransactionAsync` por um `TransactionScope`, que a estratégia de retry aceita sem mudança", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O banco foi criado com `Credentials.FromGeneratedSecret(\"loja_admin\")`. Como a task definition do ECS deve entregar usuário e senha à API?",
                        difficulty: "medio",
                        options: [
                            { text: "Por um `appsettings.Production.json` com a senha, gerado no pipeline e copiado para a imagem", isCorrect: false },
                            { text: "Pela task role, que copia o JSON do segredo para o `appsettings.json` da imagem quando a task sobe", isCorrect: false },
                            { text: "Pela seção `environment`, com a connection string completa montada no CDK a partir do segredo", isCorrect: false },
                            { text: "Pela seção `secrets`, com as chaves `username` e `password` do segredo, que a execution role lê", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O sistema precisa voltar a gravar em menos de um minuto quando o primário cai e quer tirar relatórios de uma réplica sem montar outro banco. Ele usa RDS for PostgreSQL 18 e CDK. Qual opção atende, e com qual consequência?",
                        difficulty: "dificil",
                        options: [
                            { text: "Multi-AZ com instância em espera: a espera assume em poucos segundos e atende os relatórios pelo endpoint de leitura do RDS", isCorrect: false },
                            { text: "Single-AZ com réplica de leitura: a réplica atende os relatórios e é promovida sozinha pelo RDS quando o primário cai", isCorrect: false },
                            { text: "Cluster Multi-AZ com `MultiAz = true` no `DatabaseInstance`, aceitando qualquer classe, inclusive a `db.t4g.medium` atual", isCorrect: false },
                            { text: "Cluster Multi-AZ: failover abaixo de 35 s e leitoras com endpoint próprio, mas exige classe com NVMe local e `CfnDBCluster`", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Backup e restauração no RDS",
                blocks: [
                    {
                        type: "text",
                        value: "# Backup e restauração no RDS\n\nTerça-feira, 14h07: uma migration com defeito apaga a coluna de endereço de entrega, ou alguém roda um `DELETE` sem `WHERE` no console. O Multi-AZ da aula anterior não ajuda em nada, porque a instância em espera recebeu o mesmo `DELETE` em sincronia. **Alta disponibilidade protege contra máquina que cai; backup protege contra dado que some.** São problemas diferentes, e o segundo só se resolve voltando no tempo.\n\nO RDS tem dois mecanismos. O **backup automático** tira um snapshot do volume uma vez por dia, na janela de backup, e envia os logs de transação para o S3 a cada cinco minutos; juntos, eles permitem o **point-in-time restore** (PITR), que recria o banco como ele estava em qualquer momento dentro do período de retenção. O **snapshot manual** é uma foto tirada quando você quer, e fica até você apagar. O primeiro snapshot de uma instância é completo; os seguintes guardam só o que mudou.",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\", \"Quem cria\", \"Quanto tempo fica\", \"Restaura para\", \"Quando a instância é apagada\"], [\"Backup automático\", \"O RDS: snapshot diário na janela de backup e logs a cada 5 minutos\", \"A retenção, de 1 a 35 dias\", \"Qualquer momento dentro da retenção (PITR)\", \"Some junto, a menos que você mande reter; aí fica até o fim da retenção\"], [\"Snapshot manual\", \"Você, pelo console, pela CLI ou pelo SDK\", \"Até você apagar (limite de 100 por região)\", \"O momento do snapshot\", \"Continua existindo\"], [\"Snapshot final\", \"O RDS, ao apagar a instância, se pedido\", \"Até você apagar\", \"O momento da exclusão\", \"É o que sobra\"]]",
                    },
                    {
                        type: "text",
                        value: "## Retenção, janela e custo\nA retenção vai de **0 a 35 dias**, e 0 desliga o backup automático e, com ele, o PITR. Mudar de 0 para outro valor, ou o contrário, causa indisponibilidade da instância, então decida na criação. O padrão depende de quem cria: 7 dias pelo console, **1 dia** pela API, pela CLI e pelo CDK. Muita gente cria o banco pelo CDK sem declarar a retenção e descobre, no dia do incidente, que só dá para voltar 24 horas: o erro aconteceu na sexta, foi percebido na segunda, e não há o que restaurar.\n\nA janela de backup tem 30 minutos e é em UTC. Sem declarar, o RDS sorteia uma janela num bloco de oito horas da região, e ela não pode encostar na janela de manutenção. No Multi-AZ com PostgreSQL, o backup sai da instância em espera e não suspende o I/O do primário; numa Single-AZ, o I/O pode parar por alguns segundos no começo. O armazenamento de backup não é cobrado até o total provisionado dos seus bancos na região, somando backups automáticos e snapshots manuais; o excedente custa 0,095 dólar por GB ao mês em us-east-1, em outubro de 2026. Retenção longa e snapshot manual esquecido são o que estoura essa franquia.",
                    },
                    {
                        type: "code",
                        value: "// DadosStack.cs (trecho): backup declarado, não herdado do padrão\nBackupRetention = Duration.Days(14),          // padrão do CDK: 1 dia\nPreferredBackupWindow = \"05:00-05:30\",        // UTC: 2h da manhã em Brasília\nPreferredMaintenanceWindow = \"Sun:06:00-Sun:06:30\",\nDeleteAutomatedBackups = false,               // padrão: true, some tudo junto com a instância\nCopyTagsToSnapshot = true,\nRemovalPolicy = RemovalPolicy.SNAPSHOT,       // instância removida da stack deixa um snapshot final",
                    },
                    {
                        type: "text",
                        value: "## Point-in-time restore: sempre numa instância nova\nO PITR **nunca sobrescreve** a instância original: ele cria outra, com outro identificador e outro endpoint, e a original segue no ar. O momento mais recente que dá para restaurar (`LatestRestorableTime`) costuma ficar uns cinco minutos atrás do presente, por causa do envio dos logs. A hora vai em UTC: para voltar a um instante antes do `DELETE` das 14h07 de Brasília, peça 17h06 UTC.\n\nO erro clássico vem depois. Se você não disser nada, a instância restaurada nasce com o **security group padrão da VPC**, o subnet group padrão e o **grupo de parâmetros padrão**: a API não conecta, e qualquer ajuste que você tinha feito no grupo de parâmetros some. Passe tudo na restauração, como no comando abaixo (os nomes do subnet group e do grupo de parâmetros são os da sua instância, visíveis em `aws rds describe-db-instances`). Conte também com lentidão no começo: o volume restaurado carrega os blocos do S3 sob demanda, e as primeiras consultas em tabelas grandes demoram mais.\n\nNa maioria dos incidentes, o caminho menos arriscado não é trocar a produção pela instância restaurada: é restaurar ao lado, copiar de volta só as linhas perdidas (um `pg_dump` da tabela afetada resolve) e apagar a instância temporária.",
                    },
                    {
                        type: "code",
                        value: "# terminal: o loja-prod como estava às 14h06 de Brasília, numa instância nova e na rede certa\naws rds restore-db-instance-to-point-in-time \\\n    --source-db-instance-identifier loja-prod \\\n    --target-db-instance-identifier loja-restaurada-1706 \\\n    --restore-time 2026-10-20T17:06:00Z \\\n    --db-instance-class db.t4g.medium \\\n    --db-subnet-group-name loja-dados \\\n    --vpc-security-group-ids sg-0a1b2c3d4e5f60789 \\\n    --db-parameter-group-name loja-pg18 \\\n    --no-multi-az \\\n    --no-publicly-accessible",
                    },
                    {
                        type: "text",
                        value: "## Teste de restauração: backup que nunca voltou é aposta\nBackup só existe de verdade depois que você restaurou e conferiu. Do teste saem dois números: o **RPO**, quanto dado se perde no pior caso (com PITR, os minutos de log ainda não enviados), e o **RTO**, quanto tempo leva para voltar, que só se conhece medindo, porque depende do tamanho do banco e do log a reaplicar. Automatize: uma vez por mês, um job restaura o momento mais recente numa instância temporária, confere que o banco abre e que os dados são recentes, registra quanto tempo levou e apaga a instância. A role desse job deve poder restaurar, descrever e apagar só as instâncias com o prefixo de teste, nunca a de produção.",
                    },
                    {
                        type: "code",
                        value: "// TesteRestauracao/Program.cs: roda agendado, com uma role que só restaura e apaga instâncias de teste\nusing Amazon.RDS;\nusing Amazon.RDS.Model;\nusing Npgsql;\n\nvar rds = new AmazonRDSClient();\nvar alvo = $\"loja-teste-restauracao-{DateTime.UtcNow:yyyyMMdd}\";\nvar inicio = DateTime.UtcNow;\n\nawait rds.RestoreDBInstanceToPointInTimeAsync(new RestoreDBInstanceToPointInTimeRequest\n{\n    SourceDBInstanceIdentifier = \"loja-prod\",\n    TargetDBInstanceIdentifier = alvo,\n    UseLatestRestorableTime = true,\n    DBSubnetGroupName = \"loja-dados\",\n    VpcSecurityGroupIds = [\"sg-0a1b2c3d4e5f60789\"],\n    DBParameterGroupName = \"loja-pg18\",\n    MultiAZ = false,\n    PubliclyAccessible = false,\n});\n\nDBInstance instancia;\ndo\n{\n    await Task.Delay(TimeSpan.FromMinutes(1));\n    var resposta = await rds.DescribeDBInstancesAsync(new DescribeDBInstancesRequest { DBInstanceIdentifier = alvo });\n    instancia = resposta.DBInstances[0];\n} while (instancia.DBInstanceStatus != \"available\");\n\nvar minutos = (DateTime.UtcNow - inicio).TotalMinutes;\n\ntry\n{\n    var conexao = new NpgsqlConnectionStringBuilder\n    {\n        Host = instancia.Endpoint.Address,\n        Database = \"loja\",\n        Username = Environment.GetEnvironmentVariable(\"BANCO_USUARIO\"),\n        Password = Environment.GetEnvironmentVariable(\"BANCO_SENHA\"),\n        SslMode = SslMode.VerifyFull,\n        RootCertificate = \"global-bundle.pem\",\n    };\n    await using var db = new NpgsqlConnection(conexao.ConnectionString);\n    await db.OpenAsync();\n    await using var cmd = new NpgsqlCommand(\"SELECT count(*), max(\\\"CriadoEm\\\") FROM \\\"Pedidos\\\"\", db);\n    await using var leitor = await cmd.ExecuteReaderAsync();\n    await leitor.ReadAsync();\n    Console.WriteLine($\"Restaurou em {minutos:F0} min: {leitor.GetInt64(0)} pedidos, o último em {leitor.GetDateTime(1):u}\");\n}\nfinally\n{\n    await rds.DeleteDBInstanceAsync(new DeleteDBInstanceRequest\n    {\n        DBInstanceIdentifier = alvo,\n        SkipFinalSnapshot = true,\n        DeleteAutomatedBackups = true,\n    });\n}",
                    },
                    {
                        type: "text",
                        value: "## Snapshot antes do que dá medo, e cópia fora da conta\nAntes de uma migration arriscada ou de um upgrade de versão major, tire um snapshot manual (`aws rds create-db-snapshot`): ele fica até você apagar e não depende da retenção. Pense também no pior caso, alguém com acesso à conta apagando a instância e os snapshots: para isso existem a cópia de snapshot para outra região ou conta e o **AWS Backup**, com cofre em outra conta e bloqueio contra exclusão. No dia a dia, `DeletionProtection` e `RemovalPolicy.SNAPSHOT` no CDK fecham a porta do acidente mais comum, um `cdk destroy` ou uma troca de instância apagando o banco sem deixar nada.",
                    },
                    {
                        type: "quote",
                        value: "Multi-AZ protege contra máquina que cai; backup automático com retenção declarada e PITR protege contra dado que some. A restauração sempre cria instância nova, que precisa nascer na rede e com os parâmetros certos, e só vale o backup que você já restaurou de verdade.",
                    },
                ],
                questions: [
                    {
                        statement: "O que acontece com a instância `loja-prod` quando você faz um point-in-time restore a partir dela?",
                        difficulty: "facil",
                        options: [
                            { text: "Nada: o RDS cria outra instância, com outro endpoint, e a original fica no ar", isCorrect: true },
                            { text: "Ela fica só leitura até o fim da restauração e depois recebe os dados antigos", isCorrect: false },
                            { text: "Ela é apagada, e a restaurada assume o mesmo identificador e o mesmo endpoint", isCorrect: false },
                            { text: "Ela para e volta no mesmo endpoint, já com os dados do momento escolhido", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um `DELETE` sem `WHERE` apagou os pedidos de ontem numa instância Multi-AZ com instância em espera. A espera ajuda a recuperar os dados?",
                        difficulty: "facil",
                        options: [
                            { text: "Sim: a espera aplica as mudanças com cinco minutos de atraso e ainda tem os dados", isCorrect: false },
                            { text: "Sim: um failover manual promove a espera, que ainda guarda os pedidos apagados", isCorrect: false },
                            { text: "Não: ela recebeu o mesmo `DELETE` em sincronia; o caminho é restaurar com PITR", isCorrect: true },
                            { text: "Não: a espera guarda só os logs de transação, e log não serve para restaurar dados", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A instância foi criada pelo CDK sem `BackupRetention`. Na quarta-feira, a equipe descobre que uma migration de segunda-feira corrompeu uma tabela. O que o PITR consegue fazer?",
                        difficulty: "medio",
                        options: [
                            { text: "Nada útil: a retenção padrão no CDK é de 1 dia, e segunda-feira já saiu da janela", isCorrect: true },
                            { text: "Voltar a segunda-feira pelo snapshot que o `RemovalPolicy.SNAPSHOT` tira todo dia", isCorrect: false },
                            { text: "Voltar a qualquer momento dos últimos 35 dias, a retenção padrão do RDS", isCorrect: false },
                            { text: "Voltar a segunda-feira, porque o padrão do CDK é igual ao do console: 7 dias", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de um point-in-time restore pelo console, sem mexer nas opções de rede, a API não consegue conectar na instância restaurada: a conexão termina em timeout. Qual é a causa mais provável?",
                        difficulty: "medio",
                        options: [
                            { text: "A restaurada só aceita conexão depois que termina o primeiro backup automático dela", isCorrect: false },
                            { text: "O PITR troca a senha do usuário mestre, e a API continua usando a credencial antiga", isCorrect: false },
                            { text: "A instância nasceu com o security group padrão, que não libera a 5432 para a API", isCorrect: true },
                            { text: "O endpoint restaurado exige TLS 1.3, e o Npgsql da API só negocia TLS 1.2 por padrão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma instância de homologação foi criada com `BackupRetention = Duration.Days(0)` para economizar. Ela vai virar produção, e o time quer ligar 7 dias de retenção num deploy às 15h, com usuários no sistema. O que considerar antes?",
                        difficulty: "dificil",
                        options: [
                            { text: "A retenção não muda numa instância existente; o CDK precisa substituir a instância", isCorrect: false },
                            { text: "Nada: a retenção muda na hora, e o PITR passa a cobrir os 7 dias anteriores à mudança", isCorrect: false },
                            { text: "Retenção positiva exige Multi-AZ, então o deploy cria também a instância em espera", isCorrect: false },
                            { text: "Mudar a retenção de 0 para 7 dias causa indisponibilidade; faça numa janela combinada", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Aurora x RDS: quando o Aurora compensa",
                blocks: [
                    {
                        type: "text",
                        value: "# Aurora x RDS: quando o Aurora compensa\n\nCedo ou tarde alguém do time diz: \"vamos de Aurora, é o PostgreSQL da AWS e é mais rápido\". Às vezes compensa; às vezes só deixa a conta mais alta e mais difícil de prever. O **Amazon Aurora PostgreSQL** fala o protocolo e o SQL do PostgreSQL, e o Npgsql e o EF Core conectam do mesmo jeito, mas por baixo é outro banco. As instâncias não têm disco próprio: todas usam um **volume de cluster** compartilhado, que mantém **seis cópias dos dados em três zonas de disponibilidade**, tenha o cluster leitoras ou não. O volume cresce sozinho conforme os dados (até 256 TiB nas versões que suportam), encolhe quando você apaga tabelas e é cobrado pelo espaço usado, não por um tamanho provisionado.\n\nDesse desenho saem as vantagens. Uma leitora (Aurora Replica) entra no cluster sem copiar dados, porque lê o mesmo volume, e o cluster aceita até 15. No failover, uma leitora é promovida e o serviço volta, segundo a documentação, normalmente em menos de 60 segundos e muitas vezes em menos de 30, sempre pelo mesmo **endpoint de cluster**. Sem leitora, o Aurora recria a instância de escrita, o que costuma levar menos de 10 minutos: Aurora sem leitora tem os dados protegidos, mas não a computação.",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\", \"RDS for PostgreSQL\", \"Aurora PostgreSQL\"], [\"Armazenamento\", \"Volume que você provisiona (gp3 ou io2), com crescimento automático até o limite que você der\", \"Volume do cluster, que cresce e encolhe sozinho e é cobrado pelo uso\"], [\"Cópias dos dados\", \"Um volume por instância: a espera e cada réplica têm o seu\", \"Seis cópias em três zonas, sempre, compartilhadas por todas as instâncias\"], [\"Leitura extra\", \"Réplica de leitura com cópia completa dos dados, ou as leitoras do cluster Multi-AZ\", \"Até 15 leitoras no mesmo volume, com endpoint de leitura\"], [\"Failover típico\", \"60 a 120 s com espera; abaixo de 35 s no cluster Multi-AZ\", \"Abaixo de 60 s com leitora, muitas vezes abaixo de 30 s\"], [\"PostgreSQL 18\", \"Desde novembro de 2025\", \"Desde junho de 2026\"], [\"I/O\", \"Incluído no gp3 até o desempenho de base\", \"Aurora Standard cobra por milhão de operações; I/O-Optimized não cobra\"], [\"db.r7g.large em us-east-1, outubro de 2026\", \"0,239 dólar por hora\", \"0,276 (Standard) ou 0,359 (I/O-Optimized) dólar por hora\"]]",
                    },
                    {
                        type: "text",
                        value: "## Quando o Aurora compensa\n- **Leitura pesada e crescente:** várias leitoras sem cópia de dados, endpoint de leitura distribuindo as conexões, leitora nova pronta em minutos.\n- **Failover curto como requisito**, junto com leitura extra, sem prender a escolha a uma família de instância.\n- **Banco grande ou de crescimento difícil de prever:** ninguém dimensiona disco, e o espaço volta quando os dados saem.\n- **Recursos próprios:** clone rápido do banco (cópia sob demanda, sem duplicar o volume) para testar migration com dados reais, e Global Database para recuperação em outra região.\n\nO RDS basta quando o banco tem dezenas de GB e carga estável, quando o orçamento é apertado e precisa ser previsível, ou quando você quer a major nova logo que sai: o Aurora PostgreSQL 18 chegou sete meses depois do RDS. Começar no RDS não prende ninguém: a AWS documenta a migração para o Aurora por snapshot ou por uma réplica Aurora da instância RDS, promovida quando alcança a origem.\n\n**Standard ou I/O-Optimized.** No Aurora Standard você paga instância, armazenamento (0,10 dólar por GB ao mês em us-east-1, outubro de 2026) e 0,20 dólar por milhão de operações de I/O. No I/O-Optimized, instância e armazenamento custam mais (0,225 dólar por GB ao mês) e o I/O não é cobrado. O critério da AWS: o I/O-Optimized compensa quando o I/O passa de 25% do gasto total com o Aurora. Dá para ir do Standard para o I/O-Optimized uma vez a cada 30 dias e voltar a qualquer momento. Muita gente leva uma carga de escrita pesada para o Aurora Standard e só descobre a linha de I/O na fatura seguinte.",
                    },
                    {
                        type: "code",
                        value: "// AuroraStack.cs\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.EC2;\nusing Amazon.CDK.AWS.RDS;\nusing Constructs;\n\npublic class AuroraStack : Stack\n{\n    public AuroraStack(Construct scope, string id, DadosStackProps props) : base(scope, id, props)\n    {\n        var cluster = new DatabaseCluster(this, \"Aurora\", new DatabaseClusterProps\n        {\n            Engine = DatabaseClusterEngine.AuroraPostgres(new AuroraPostgresClusterEngineProps\n            {\n                Version = AuroraPostgresEngineVersion.VER_18_4,\n            }),\n            Writer = ClusterInstance.ServerlessV2(\"escrita\"),\n            Readers =\n            [\n                // nível de promoção 1: acompanha a capacidade da escrita e assume no failover\n                ClusterInstance.ServerlessV2(\"leitura\", new ServerlessV2ClusterInstanceProps { ScaleWithWriter = true }),\n            ],\n            ServerlessV2MinCapacity = 2,\n            ServerlessV2MaxCapacity = 16,\n            StorageType = DBClusterStorageType.AURORA,\n            Vpc = props.Vpc,\n            VpcSubnets = new SubnetSelection { SubnetType = SubnetType.PRIVATE_ISOLATED },\n            StorageEncrypted = true,\n            DefaultDatabaseName = \"loja\",\n            Credentials = Credentials.FromGeneratedSecret(\"loja_admin\"),\n            Backup = new BackupProps { Retention = Duration.Days(14) },\n            DeletionProtection = true,\n        });\n\n        cluster.Connections.AllowDefaultPortFrom(props.ApiSecurityGroup, \"API da loja no ECS\");\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Aurora Serverless v2, de passagem\nNo lugar da classe de instância, você dá uma faixa de capacidade em **ACU** (Aurora Capacity Unit: cerca de 2 GiB de memória com a CPU e a rede correspondentes), e cada instância `db.serverless` sobe e desce dentro dela, em incrementos a partir de 0,5 ACU, sem derrubar conexão nem esperar a transação acabar. A faixa vai de **0 a 256 ACUs** nas versões atuais, e a cobrança é por ACU-hora: 0,12 dólar no Aurora Standard e 0,16 no I/O-Optimized, em us-east-1, outubro de 2026. Desde abril de 2026 a AWS chama o produto só de **Aurora serverless**, sem o \"v2\"; APIs e CDK seguem com `ServerlessV2` no nome. O Serverless v1, de arquitetura diferente, foi encerrado em 31/03/2025: material que fale dele está vencido.\n\nNo código acima, `ScaleWithWriter = true` põe a leitora no nível de promoção 1, e ela acompanha a capacidade da escrita: no failover, assume já do tamanho certo. Leitora nos níveis de 2 a 15 escala pela própria carga e serve para relatório.\n\n**Escalar até zero.** Com mínimo de **0 ACU**, a instância pausa depois de um período sem conexão de usuário (de 5 minutos, o padrão, até 24 horas) e a computação deixa de ser cobrada; o armazenamento continua. A primeira conexão acorda o banco em cerca de **15 segundos**, ou 30 ou mais se ele dormiu por mais de 24 horas. Qualquer conexão aberta impede a pausa, e RDS Proxy ou replicação lógica no cluster também. Serve para homologação e ferramenta interna, não para a API de produção.",
                    },
                    {
                        type: "code",
                        value: "// AuroraStack.cs (trecho) da homologação: sem leitora e com pausa\nServerlessV2MinCapacity = 0,                              // 0 liga a pausa automática\nServerlessV2MaxCapacity = 4,\nServerlessV2AutoPauseDuration = Duration.Minutes(30),     // padrão: 5 minutos\n\n// Program.cs da API em homologação: a primeira conexão espera o banco acordar\nvar conexao = new NpgsqlConnectionStringBuilder(builder.Configuration.GetConnectionString(\"Loja\"))\n{\n    Timeout = 30,   // padrão do Npgsql: 15 segundos, o mesmo tempo típico da retomada\n};",
                    },
                    {
                        type: "text",
                        value: "## A conta que decide\nServerless cobra caro por capacidade constante. Uma db.r7g.large tem 16 GiB de memória e custa 0,276 dólar por hora no Aurora Standard; os mesmos 16 GiB em Serverless v2 são 8 ACUs, ou 0,96 dólar por hora, quase três vezes e meia mais. A conta vira quando a carga é irregular: um sistema que precisa de 8 ACUs em duas horas de pico por dia e de 1 ACU no resto consome 8 × 2 + 1 × 22 = 38 ACU-horas, cerca de 4,56 dólares por dia na instância de escrita, contra 6,62 da db.r7g.large ligada 24 horas.\n\nAntes de escolher, olhe por algumas semanas a métrica de uso do banco atual. Carga plana pede instância provisionada (e, se for estável por anos, instância reservada); picos e vales longos pedem Serverless v2; e dá para misturar, com escrita provisionada e leitoras serverless no mesmo cluster.",
                    },
                    {
                        type: "table",
                        value: "[[\"Cenário\", \"Escolha\", \"Por quê\"], [\"API com carga estável e banco de 50 GB\", \"RDS for PostgreSQL Multi-AZ\", \"Custo menor e previsível, operação simples\"], [\"Muitas leituras, relatórios pesados e failover curto\", \"Aurora provisionado com leitoras\", \"Leitoras no mesmo volume, endpoint de leitura, failover abaixo de 60 s\"], [\"Picos fortes e longos períodos de pouca carga\", \"Aurora Serverless v2\", \"Paga ACU-hora pelo uso e sobe sem trocar instância\"], [\"Homologação usada em horário comercial\", \"Aurora Serverless v2 com mínimo 0\", \"Pausa à noite e no fim de semana; o primeiro acesso espera uns 15 s\"], [\"Precisa da major nova logo que sai\", \"RDS for PostgreSQL\", \"O Aurora recebe a major meses depois\"]]",
                    },
                    {
                        type: "quote",
                        value: "O Aurora troca o disco da instância por um volume compartilhado de seis cópias: leitoras sem cópia de dados, failover curto e armazenamento que se ajusta sozinho, com instância e I/O mais caros. O Serverless v2 compensa em carga irregular e na homologação que pausa; carga plana sai mais barata em instância provisionada.",
                    },
                ],
                questions: [
                    {
                        statement: "No Aurora PostgreSQL, o que acontece com os dados quando você adiciona uma leitora ao cluster?",
                        difficulty: "facil",
                        options: [
                            { text: "O Aurora copia o banco inteiro para o disco da leitora antes de liberá-la para as consultas", isCorrect: false },
                            { text: "O volume é dividido entre as instâncias, e cada uma passa a guardar uma parte das tabelas", isCorrect: false },
                            { text: "Nada é copiado: a leitora usa o mesmo volume de cluster, com seis cópias em três zonas", isCorrect: true },
                            { text: "A leitora recebe só os dados novos, e o histórico continua apenas na instância de escrita", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Como o Aurora Serverless v2 cobra a capacidade de computação?",
                        difficulty: "facil",
                        options: [
                            { text: "Por GB armazenado, porque a computação vem incluída no preço do volume de cluster do Aurora", isCorrect: false },
                            { text: "Por consulta SQL executada, do mesmo jeito que o DynamoDB on-demand cobra as requisições", isCorrect: false },
                            { text: "Por ACU-hora, sendo cada ACU cerca de 2 GiB de memória com a CPU e a rede correspondentes", isCorrect: true },
                            { text: "Pela maior capacidade que o cluster atingiu no mês, ainda que só por alguns minutos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API de escrita pesada foi para o Aurora Standard, e a fatura mostra que o I/O já responde por 40% do gasto com o Aurora. O que a AWS recomenda avaliar?",
                        difficulty: "medio",
                        options: [
                            { text: "Trocar o volume do cluster por gp3 provisionado, que inclui 3.000 IOPS de base no preço do GB", isCorrect: false },
                            { text: "O I/O-Optimized: instância e armazenamento mais caros, sem cobrar I/O, indicado acima de 25%", isCorrect: true },
                            { text: "Ligar o Serverless v2 com mínimo 0, que deixa de cobrar I/O enquanto a instância fica pausada", isCorrect: false },
                            { text: "Voltar para o RDS, porque o Aurora cobra I/O em qualquer configuração de armazenamento que tiver", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um cluster de homologação usa Serverless v2 com mínimo de 0 ACU, mas a métrica `ServerlessDatabaseCapacity` nunca chega a zero, nem de madrugada. Qual destas configurações impede a pausa?",
                        difficulty: "medio",
                        options: [
                            { text: "O mínimo de 0 ACU, que só permite pausar depois de 24 horas seguidas sem conexão", isCorrect: false },
                            { text: "O backup automático com retenção de 7 dias, que acorda a instância a cada snapshot", isCorrect: false },
                            { text: "Um RDS Proxy associado ao cluster, que mantém uma conexão aberta com cada instância", isCorrect: true },
                            { text: "A criptografia do armazenamento, que é incompatível com a pausa automática do Aurora", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na homologação com Serverless v2 e mínimo de 0 ACU, a primeira requisição da manhã falha com timeout ao abrir a conexão, e as seguintes funcionam. A API usa o Npgsql 10 com os padrões da connection string. O que explica, e o que corrigir?",
                        difficulty: "dificil",
                        options: [
                            { text: "A pausa troca o endpoint do cluster, e a API precisa resolver o DNS de novo antes de abrir a primeira conexão", isCorrect: false },
                            { text: "O `CommandTimeout` padrão de 30 s é curto para a retomada; subir só ele para 120 s resolve a primeira conexão", isCorrect: false },
                            { text: "A retomada exige nova autenticação pelo Secrets Manager, e a primeira conexão ainda usa a senha anterior", isCorrect: false },
                            { text: "A retomada leva uns 15 s, igual ao `Timeout` padrão do Npgsql; subir o `Timeout` para 30 e repetir a conexão", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "DynamoDB para o caso certo",
                blocks: [
                    {
                        type: "text",
                        value: "# DynamoDB para o caso certo\n\nO rastreamento de entregas chegou: cada entregador manda um evento a cada mudança de status e a cada poucos minutos de rota, e no pico são milhares de escritas por segundo. As leituras são sempre as mesmas perguntas: o que aconteceu com o pedido 1042, qual o último status dele, quais pedidos o entregador 88 levou hoje. Jogar isso na tabela de pedidos do PostgreSQL faz o rastreamento disputar conexão, índice e I/O com o resto da loja.\n\nO **Amazon DynamoDB** é um banco chave-valor e de documentos, sem servidor: não há instância nem sub-rede para cuidar (o acesso é por API HTTPS, assinada com a task role; a partir da sub-rede privada, sai por um VPC endpoint de gateway, como o do S3), a latência fica em um dígito de milissegundo em qualquer escala, e no modo **on-demand** você paga por requisição. O preço disso é rigidez: o DynamoDB responde rápido apenas às perguntas para as quais você desenhou as chaves.\n\n## Chave de partição, chave de ordenação e o limite por partição\nCada item tem uma chave primária: só a **chave de partição** (partition key) ou ela mais uma **chave de ordenação** (sort key). O DynamoDB aplica um hash na chave de partição para escolher a partição física onde o item mora; itens com a mesma chave de partição ficam juntos, ordenados pela chave de ordenação, e uma única operação `Query` lê o grupo inteiro ou um intervalo dele.\n\nCada partição entrega no máximo **3.000 unidades de leitura e 1.000 de escrita por segundo**, e uma unidade de escrita grava até 1 KB. O teto é por partição, não por tabela, e por isso a chave de partição precisa de **muitos valores diferentes, acessados de forma parecida**: id do pedido, id do cliente. Muita gente usa a data do dia como chave de partição para achar fácil os eventos de hoje: todas as escritas do dia caem na mesma partição, e a tabela começa a recusar escrita (throttling) perto de 1.000 por segundo, por mais capacidade que a conta tenha.",
                    },
                    {
                        type: "text",
                        value: "## Padrão de acesso primeiro\nNo PostgreSQL você modela as entidades e escreve as consultas depois. No DynamoDB a ordem se inverte: **liste as perguntas primeiro** e desenhe as chaves para respondê-las. A tabela abaixo é o desenho do rastreamento: uma tabela só, chave de partição `PK` com o pedido, chave de ordenação `SK` com o instante do evento em ISO 8601 (que ordena como texto) e um índice secundário global (GSI) com outra chave para a pergunta do entregador.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pergunta\", \"Operação\", \"Chave usada\"], [\"Registrar um evento de entrega\", \"`PutItem` com condição\", \"`PK = PEDIDO#1042`, `SK = EVT#2026-10-20T14:07:12.3450000Z`\"], [\"Histórico do pedido, do mais novo ao mais velho\", \"`Query` com `ScanIndexForward = false`\", \"`PK = PEDIDO#1042`\"], [\"Último status do pedido\", \"O mesmo `Query` com `Limit = 1`\", \"`PK = PEDIDO#1042`\"], [\"Pedidos do entregador 88 no dia\", \"`Query` no GSI `PorEntregador`\", \"`GSI1PK = ENTREGADOR#88#2026-10-20`\"], [\"Pedidos atrasados de todos os entregadores no mês\", \"Nenhuma: só um `Scan` lendo a tabela inteira\", \"Essa pergunta é do PostgreSQL ou de uma base de análise\"]]",
                    },
                    {
                        type: "code",
                        value: "// RastreioStack.cs\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.DynamoDB;\nusing Amazon.CDK.AWS.IAM;\nusing Constructs;\nusing Attribute = Amazon.CDK.AWS.DynamoDB.Attribute;\n\npublic class RastreioStackProps : StackProps\n{\n    public required IRole TaskRole { get; init; }\n}\n\npublic class RastreioStack : Stack\n{\n    public RastreioStack(Construct scope, string id, RastreioStackProps props) : base(scope, id, props)\n    {\n        var tabela = new TableV2(this, \"Rastreio\", new TablePropsV2\n        {\n            TableName = \"Rastreio\",\n            PartitionKey = new Attribute { Name = \"PK\", Type = AttributeType.STRING },\n            SortKey = new Attribute { Name = \"SK\", Type = AttributeType.STRING },\n            Billing = Billing.OnDemand(),\n            TimeToLiveAttribute = \"ExpiraEm\",\n            PointInTimeRecoverySpecification = new PointInTimeRecoverySpecification\n            {\n                PointInTimeRecoveryEnabled = true,\n            },\n            DeletionProtection = true,\n            GlobalSecondaryIndexes =\n            [\n                new GlobalSecondaryIndexPropsV2\n                {\n                    IndexName = \"PorEntregador\",\n                    PartitionKey = new Attribute { Name = \"GSI1PK\", Type = AttributeType.STRING },\n                    SortKey = new Attribute { Name = \"GSI1SK\", Type = AttributeType.STRING },\n                },\n            ],\n        });\n\n        tabela.GrantReadWriteData(props.TaskRole);\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que a stack decide\nO `TableV2` gera um `AWS::DynamoDB::GlobalTable`, mesmo com uma região só, e já vem no modo on-demand, que a AWS indica como padrão para a maioria das cargas. Tabela nova em on-demand aguenta de cara 4.000 escritas e 12.000 leituras por segundo e absorve na hora até o dobro do pico anterior; passar do dobro em menos de 30 minutos gera throttling, então, antes de uma Black Friday, aqueça a tabela (warm throughput). Dois padrões do CDK pedem atenção: o PITR do DynamoDB vem **desligado**, e a proteção contra exclusão também. O `TimeToLiveAttribute` faz o DynamoDB apagar sozinho, sem consumir escrita, os itens cujo `ExpiraEm` (segundos desde 1970) já passou; a exclusão não é imediata, então filtre na leitura se item vencido atrapalhar.\n\n## Escrever e ler com o AWS SDK para .NET\nO cliente é o `IAmazonDynamoDB`, do pacote `AWSSDK.DynamoDBv2` (linha 4.x do SDK), registrado com `builder.Services.AddAWSService<IAmazonDynamoDB>()` do `AWSSDK.Extensions.NETCore.Setup`: ele pega as credenciais da task role e a região do ambiente, sem chave no código, e fica registrado como singleton. Na escrita, a `ConditionExpression` `attribute_not_exists(SK)` impede que o mesmo evento, reenviado pelo app do entregador, sobrescreva o anterior: o DynamoDB recusa com `ConditionalCheckFailedException`, e o código registra no log e segue. Na leitura, `Query` pela chave de partição com `ScanIndexForward = false` traz os eventos do mais novo para o mais velho.",
                    },
                    {
                        type: "code",
                        value: "// RastreioRepositorio.cs\nusing System.Globalization;\nusing Amazon.DynamoDBv2;\nusing Amazon.DynamoDBv2.Model;\n\npublic record EventoEntrega(string PedidoId, DateTimeOffset Quando, string Status, string EntregadorId);\n\npublic class RastreioRepositorio(IAmazonDynamoDB dynamo, ILogger<RastreioRepositorio> log)\n{\n    private const string Tabela = \"Rastreio\";\n\n    public async Task RegistrarAsync(EventoEntrega e, CancellationToken ct)\n    {\n        var quando = e.Quando.UtcDateTime.ToString(\"O\");   // 2026-10-20T14:07:12.3450000Z ordena como texto\n        try\n        {\n            await dynamo.PutItemAsync(new PutItemRequest\n            {\n                TableName = Tabela,\n                Item = new Dictionary<string, AttributeValue>\n                {\n                    [\"PK\"] = new() { S = $\"PEDIDO#{e.PedidoId}\" },\n                    [\"SK\"] = new() { S = $\"EVT#{quando}\" },\n                    [\"Status\"] = new() { S = e.Status },\n                    [\"EntregadorId\"] = new() { S = e.EntregadorId },\n                    [\"GSI1PK\"] = new() { S = $\"ENTREGADOR#{e.EntregadorId}#{e.Quando.UtcDateTime:yyyy-MM-dd}\" },\n                    [\"GSI1SK\"] = new() { S = quando },\n                    [\"ExpiraEm\"] = new() { N = e.Quando.AddDays(180).ToUnixTimeSeconds().ToString() },\n                },\n                ConditionExpression = \"attribute_not_exists(SK)\",   // o mesmo evento repetido não sobrescreve\n            }, ct);\n        }\n        catch (ConditionalCheckFailedException)\n        {\n            log.LogInformation(\"Evento repetido ignorado: pedido {PedidoId} em {Quando}\", e.PedidoId, quando);\n        }\n    }\n\n    public async Task<List<EventoEntrega>> HistoricoAsync(string pedidoId, int quantos, CancellationToken ct)\n    {\n        var resposta = await dynamo.QueryAsync(new QueryRequest\n        {\n            TableName = Tabela,\n            KeyConditionExpression = \"PK = :pk AND begins_with(SK, :evt)\",\n            ExpressionAttributeValues = new Dictionary<string, AttributeValue>\n            {\n                [\":pk\"] = new() { S = $\"PEDIDO#{pedidoId}\" },\n                [\":evt\"] = new() { S = \"EVT#\" },\n            },\n            ScanIndexForward = false,   // do mais recente para o mais antigo\n            Limit = quantos,\n        }, ct);\n\n        return [.. (resposta.Items ?? []).Select(i => new EventoEntrega(\n            pedidoId,\n            DateTimeOffset.Parse(i[\"SK\"].S[\"EVT#\".Length..], CultureInfo.InvariantCulture),\n            i[\"Status\"].S,\n            i[\"EntregadorId\"].S))];\n    }\n\n    // PedidosDoEntregadorAsync vem no trecho seguinte\n}",
                    },
                    {
                        type: "text",
                        value: "## Índice secundário e paginação\nO GSI `PorEntregador` é uma cópia que o DynamoDB mantém com outra chave primária (`GSI1PK` e `GSI1SK`). A tabela atualiza o índice de forma assíncrona, então leitura em GSI é sempre eventualmente consistente: um evento recém-gravado pode demorar um instante para aparecer ali. Cada `Query` devolve no máximo 1 MB; o resto vem nas páginas seguintes, pedidas com o `LastEvaluatedKey` da resposta anterior.\n\nAqui mora um erro de quem atualiza código antigo. Na v4 do SDK, coleções que o serviço não devolve ficam `null`: na última página, `LastEvaluatedKey` vem `null`, não um dicionário vazio como na v3 (conferido com o `AWSSDK.DynamoDBv2` 4.0.108). Código de exemplo antigo com `while (resposta.LastEvaluatedKey.Count > 0)` quebra com `NullReferenceException` justamente na última página. O laço abaixo funciona nas duas versões.",
                    },
                    {
                        type: "code",
                        value: "// RastreioRepositorio.cs (continuação): a pergunta do entregador, no GSI e com paginação\npublic async Task<List<string>> PedidosDoEntregadorAsync(string entregadorId, DateOnly dia, CancellationToken ct)\n{\n    var pedidos = new List<string>();\n    Dictionary<string, AttributeValue>? inicio = null;\n    do\n    {\n        var resposta = await dynamo.QueryAsync(new QueryRequest\n        {\n            TableName = Tabela,\n            IndexName = \"PorEntregador\",\n            KeyConditionExpression = \"GSI1PK = :pk\",\n            ExpressionAttributeValues = new Dictionary<string, AttributeValue>\n            {\n                [\":pk\"] = new() { S = $\"ENTREGADOR#{entregadorId}#{dia:yyyy-MM-dd}\" },\n            },\n            ExclusiveStartKey = inicio,\n        }, ct);\n        pedidos.AddRange((resposta.Items ?? []).Select(i => i[\"PK\"].S[\"PEDIDO#\".Length..]));\n        inicio = resposta.LastEvaluatedKey;   // v4 do SDK: null na última página (na v3 vinha vazio)\n    } while (inicio is { Count: > 0 });\n\n    return [.. pedidos.Distinct()];\n}",
                    },
                    {
                        type: "text",
                        value: "## Quando não usar DynamoDB\n- **Pergunta que você ainda não conhece.** Relatório, filtro novo, \"pedidos de São Paulo acima de 500 reais no trimestre\": sem chave para isso, sobra o `Scan`, que lê a tabela inteira e cobra por tudo que leu, porque o `FilterExpression` só descarta itens depois da leitura.\n- **Relações e integridade.** Join não existe; transação existe, com até 100 itens, 4 MB e o dobro do custo por item.\n- **Item grande.** O limite é de 400 KB por item, contando os nomes dos atributos; arquivo vai para o S3, e o item guarda a chave.\n- **Modelo que ainda vai mudar muito.** Novo padrão de acesso significa novo GSI ou migração de dados.\n\nO núcleo da loja (pedido, cliente, pagamento) fica no PostgreSQL; o DynamoDB entra nas partes de volume alto e acesso por chave, como rastreamento, sessão e carrinho. Para ter noção de custo, na tabela de preços de us-east-1 publicada em setembro de 2026: 0,625 dólar por milhão de unidades de escrita, 0,125 por milhão de unidades de leitura e 0,25 dólar por GB ao mês depois dos primeiros 25 GB. Cinquenta milhões de eventos de até 1 KB por mês custam 31,25 dólares de escrita.",
                    },
                    {
                        type: "quote",
                        value: "DynamoDB começa pela lista de perguntas: a chave de partição espalha a carga, a de ordenação organiza o grupo, e um GSI responde à pergunta que a chave principal não cobre. Pergunta nova, relação entre entidades e relatório continuam no PostgreSQL.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o primeiro passo ao modelar uma tabela no DynamoDB?",
                        difficulty: "facil",
                        options: [
                            { text: "Listar as perguntas que a aplicação vai fazer e desenhar as chaves para respondê-las", isCorrect: true },
                            { text: "Escolher primeiro a chave de ordenação, que é a que define a partição física do item", isCorrect: false },
                            { text: "Criar a tabela só com a chave de partição e acrescentar a de ordenação quando precisar", isCorrect: false },
                            { text: "Normalizar as entidades em tabelas separadas, como no PostgreSQL, e criar índices depois", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na tabela de eventos de entrega, qual destas é a melhor chave de partição?",
                        difficulty: "facil",
                        options: [
                            { text: "A data do dia, para ler os eventos de hoje numa consulta só", isCorrect: false },
                            { text: "A cidade da entrega, para juntar os pedidos de um mesmo lugar", isCorrect: false },
                            { text: "O id do pedido: muitos valores diferentes, com acesso espalhado", isCorrect: true },
                            { text: "O status do evento, para separar entregues, em rota e devolvidos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para listar eventos com status `DEVOLVIDO`, alguém usou `Scan` com `FilterExpression = \"#s = :devolvido\"` numa tabela de 200 GB. Pelo que o DynamoDB cobra de leitura?",
                        difficulty: "medio",
                        options: [
                            { text: "Por uma unidade por página de resultado, porque o `Scan` cobra por chamada e não por dado", isCorrect: false },
                            { text: "Por todos os itens que o `Scan` percorreu, porque o filtro só descarta depois da leitura", isCorrect: true },
                            { text: "Só pelos itens devolvidos, desde que exista um GSI sobre o atributo de status na tabela", isCorrect: false },
                            { text: "Só pelos itens devolvidos, porque o filtro é aplicado antes da leitura, como um `WHERE`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O app do entregador reenvia o mesmo evento quando a rede oscila. Com `ConditionExpression = \"attribute_not_exists(SK)\"` no `PutItem`, o que acontece no reenvio?",
                        difficulty: "medio",
                        options: [
                            { text: "O DynamoDB recusa com `ConditionalCheckFailedException`, e o item original fica intacto", isCorrect: true },
                            { text: "A requisição espera o primeiro item expirar pelo TTL e então grava o evento novo", isCorrect: false },
                            { text: "O DynamoDB responde sucesso sem gravar nada, e o código não fica sabendo que era um reenvio", isCorrect: false },
                            { text: "O item é sobrescrito, porque condição em `PutItem` só vale dentro de uma transação", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de atualizar o `AWSSDK.DynamoDBv2` da linha 3.x para a 4.x, este laço passou a lançar `NullReferenceException`, sempre ao terminar a última página. Por quê?\n\n```csharp\nDictionary<string, AttributeValue>? inicio = null;\ndo\n{\n    var resposta = await dynamo.QueryAsync(new QueryRequest\n    {\n        TableName = \"Rastreio\",\n        KeyConditionExpression = \"PK = :pk\",\n        ExpressionAttributeValues = valores,\n        ExclusiveStartKey = inicio,\n    });\n    Processar(resposta.Items);\n    inicio = resposta.LastEvaluatedKey;\n} while (inicio.Count > 0);\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Na v4, coleção ausente na resposta fica `null`: na última página, `LastEvaluatedKey` é `null`", isCorrect: true },
                            { text: "Na v4, o `QueryAsync` devolve `null` quando a página vem vazia, e `resposta` estoura na leitura", isCorrect: false },
                            { text: "Na v4, `ExclusiveStartKey` não aceita `null`, e o SDK falha ao montar a última requisição", isCorrect: false },
                            { text: "Na v4, a paginação usa `NextToken`, e `LastEvaluatedKey` deixou de ser preenchido pelo SDK", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "S3 para arquivos: bucket privado e URL pré-assinada",
                blocks: [
                    {
                        type: "text",
                        value: "# S3 para arquivos: bucket privado e URL pré-assinada\n\nO cliente anexa o comprovante de pagamento em PDF, e a API grava em `/app/uploads`. Funciona até o primeiro deploy: o disco de uma task do Fargate é efêmero, os arquivos somem quando a task é trocada, e com duas tasks cada uma guarda só os que recebeu. Gravar o PDF numa coluna `bytea` do PostgreSQL resolve o sumiço, mas incha o banco, o backup e cada restauração. Arquivo mora no **Amazon S3**: objetos num bucket, identificados por uma chave (`comprovantes/1042/9f2c7d.pdf`), com durabilidade projetada de onze noves (99,999999999%) e cobrança por GB guardado, por requisição e por transferência para fora da AWS. O PostgreSQL guarda só a chave.\n\n## Bucket privado de verdade\nDesde abril de 2023, bucket novo nasce com **Block Public Access** ligado e ACLs desligadas (Object Ownership em *bucket owner enforced*), e desde 5 de janeiro de 2023 todo objeto novo é criptografado com SSE-S3. Mesmo assim, declare tudo no CDK: o código documenta a intenção, e o `cdk diff` acusa quem mudar. O acesso da aplicação vem da **task role**, com permissão só no prefixo que ela usa, e o `EnforceSSL` cria a política que nega qualquer requisição sem TLS.\n\nMuita gente torna o bucket público \"para as imagens aparecerem no site\" e, junto com as fotos de produto, publica os comprovantes de todos os clientes. Conteúdo público em escala vai por CloudFront, com o bucket continuando privado; arquivo de cliente vai por URL pré-assinada.",
                    },
                    {
                        type: "code",
                        value: "// ArquivosStack.cs\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.IAM;\nusing Amazon.CDK.AWS.S3;\nusing Constructs;\n\npublic class ArquivosStackProps : StackProps\n{\n    public required IRole TaskRole { get; init; }\n}\n\npublic class ArquivosStack : Stack\n{\n    public ArquivosStack(Construct scope, string id, ArquivosStackProps props) : base(scope, id, props)\n    {\n        var bucket = new Bucket(this, \"Arquivos\", new BucketProps\n        {\n            BlockPublicAccess = BlockPublicAccess.BLOCK_ALL,\n            ObjectOwnership = ObjectOwnership.BUCKET_OWNER_ENFORCED,\n            Encryption = BucketEncryption.S3_MANAGED,\n            EnforceSSL = true,\n            Versioned = true,\n            RemovalPolicy = RemovalPolicy.RETAIN,\n            Cors =\n            [\n                new CorsRule\n                {\n                    AllowedOrigins = [\"https://loja.exemplo.com.br\"],\n                    AllowedMethods = [HttpMethods.PUT],\n                    AllowedHeaders = [\"content-type\"],\n                    MaxAge = 3600,\n                },\n            ],\n            LifecycleRules =\n            [\n                new LifecycleRule\n                {\n                    Id = \"comprovantes\",\n                    Prefix = \"comprovantes/\",\n                    Transitions =\n                    [\n                        new Transition { StorageClass = StorageClass.INFREQUENT_ACCESS, TransitionAfter = Duration.Days(30) },\n                        new Transition { StorageClass = StorageClass.GLACIER_INSTANT_RETRIEVAL, TransitionAfter = Duration.Days(120) },\n                    ],\n                    Expiration = Duration.Days(1825),\n                },\n                new LifecycleRule { Id = \"temporarios\", Prefix = \"tmp/\", Expiration = Duration.Days(1) },\n                new LifecycleRule\n                {\n                    Id = \"limpeza\",\n                    NoncurrentVersionExpiration = Duration.Days(30),\n                    AbortIncompleteMultipartUploadAfter = Duration.Days(7),\n                },\n            ],\n        });\n\n        bucket.GrantRead(props.TaskRole, \"comprovantes/*\");\n        bucket.GrantPut(props.TaskRole, \"comprovantes/*\");\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## URL pré-assinada: o navegador fala direto com o S3\nFazer o arquivo passar pela API gasta memória, banda e tempo de requisição à toa. Com **URL pré-assinada**, a API confere se o usuário pode mexer naquele pedido e devolve uma URL assinada com as credenciais dela, válida por poucos minutos; o navegador faz o `PUT` (envio) ou o `GET` (download) direto no S3. A URL funciona como um token ao portador: quem tiver a URL faz a operação, quantas vezes quiser, até ela vencer. No `PUT`, o `Content-Type` entra na assinatura: se o cliente mandar outro, o S3 responde 403 com `SignatureDoesNotMatch`.\n\n**A validade tem dois limites.** O primeiro é o que você pede: pelo SDK ou pela CLI, até 7 dias (604.800 segundos), o máximo da assinatura versão 4. O segundo é a credencial que assina, e a URL **nunca vive mais do que ela**. Assinada com chave de usuário IAM, chega aos 7 dias; assinada com credencial temporária, morre quando a sessão expira, mesmo que você tenha pedido mais. E é credencial temporária que a API tem no ECS: as da task role giram a cada uma a seis horas, segundo a AWS. Muita gente gera na API um link de 7 dias para mandar por e-mail, e o cliente recebe erro de token expirado poucas horas depois. Link duradouro aponta para um endpoint da sua API, que confere a permissão e redireciona para uma URL nova, como o `GET` abaixo. Um detalhe conferido no `AWSSDK.S3` 4.0.104.5: pedir mais de 7 dias não dá erro; o SDK gera, em silêncio, uma URL no formato antigo de assinatura (versão 2), que a AWS considera descontinuado.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (trecho): a API entrega URLs, os bytes vão direto entre o navegador e o S3\nusing Amazon.S3;\nusing Amazon.S3.Model;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddAWSService<IAmazonS3>();\nvar app = builder.Build();\n\nvar bucket = app.Configuration[\"Arquivos:Bucket\"]!;\n\napp.MapPost(\"/pedidos/{id:int}/comprovante\", async (int id, IAmazonS3 s3) =>\n{\n    // antes: confira se o usuário logado pode mexer nesse pedido\n    var chave = $\"comprovantes/{id}/{Guid.NewGuid():N}.pdf\";\n    var url = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest\n    {\n        BucketName = bucket,\n        Key = chave,\n        Verb = HttpVerb.PUT,\n        ContentType = \"application/pdf\",          // o cliente tem de mandar o mesmo Content-Type\n        Expires = DateTime.UtcNow.AddMinutes(10),\n    });\n    return TypedResults.Ok(new { chave, url });\n});\n\napp.MapGet(\"/pedidos/{id:int}/comprovante/{arquivo}\", async (int id, string arquivo, IAmazonS3 s3) =>\n{\n    var url = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest\n    {\n        BucketName = bucket,\n        Key = $\"comprovantes/{id}/{arquivo}\",\n        Verb = HttpVerb.GET,\n        Expires = DateTime.UtcNow.AddMinutes(5),\n    });\n    return TypedResults.Redirect(url);\n});\n\napp.Run();",
                    },
                    {
                        type: "code",
                        value: "// GeraUrl/Program.cs: assina sem rede, com uma credencial temporária falsa\nusing Amazon;\nusing Amazon.Runtime;\nusing Amazon.S3;\nusing Amazon.S3.Model;\n\nvar credencial = new SessionAWSCredentials(\"ASIAEXEMPLO7EXEMPLO7\", \"segredo-falso\", \"token-da-sessao-falso\");\nusing var s3 = new AmazonS3Client(credencial, RegionEndpoint.SAEast1);\n\nvar url = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest\n{\n    BucketName = \"loja-arquivos\",\n    Key = \"comprovantes/1042/9f2c7d.pdf\",\n    Verb = HttpVerb.PUT,\n    ContentType = \"application/pdf\",\n    Expires = DateTime.UtcNow.AddMinutes(10),\n});\nConsole.WriteLine(url);\n\n# saída (quebrada nos & para caber na tela)\nhttps://loja-arquivos.s3.sa-east-1.amazonaws.com/comprovantes/1042/9f2c7d.pdf\n  ?X-Amz-Expires=600\n  &X-Amz-Security-Token=token-da-sessao-falso\n  &X-Amz-Algorithm=AWS4-HMAC-SHA256\n  &X-Amz-Credential=ASIAEXEMPLO7EXEMPLO7%2F20261020%2Fsa-east-1%2Fs3%2Faws4_request\n  &X-Amz-Date=20261020T135116Z\n  &X-Amz-SignedHeaders=content-type%3Bhost\n  &X-Amz-Signature=f46874fca95c5c07c2a895d576ba97b4f227d6550a27863cdfc1aafb5dc51dfd",
                    },
                    {
                        type: "text",
                        value: "Três parâmetros dizem muito. `X-Amz-Expires=600` são os 10 minutos pedidos. `X-Amz-SignedHeaders=content-type;host` mostra que o `Content-Type` entrou na assinatura. E `X-Amz-Security-Token` carrega o token da sessão temporária: quando a sessão acaba, a URL acaba junto, seja qual for o `X-Amz-Expires`.\n\n## Classes de armazenamento\nTodas as classes têm a mesma durabilidade projetada; o que muda é preço por GB, disponibilidade, tempo de leitura, taxa por GB lido e **duração mínima cobrada** (apagar ou mover antes cobra o restante do período). Valores de us-east-1, vigentes em outubro de 2026:",
                    },
                    {
                        type: "table",
                        value: "[[\"Classe\", \"Para quê\", \"GB por mês\", \"Mínimo cobrado\", \"Leitura\"], [\"S3 Standard\", \"Acesso frequente; é o padrão\", \"0,023 dólar\", \"Nenhum\", \"Milissegundos\"], [\"S3 Intelligent-Tiering\", \"Acesso desconhecido ou que muda\", \"De 0,023 a 0,004 dólar, conforme o nível, mais 0,0025 dólar por mil objetos monitorados\", \"Nenhum; objeto abaixo de 128 KB fica sempre no nível frequente\", \"Milissegundos nos três níveis automáticos\"], [\"S3 Standard-IA\", \"Acesso raro que precisa ser imediato\", \"0,0125 dólar\", \"30 dias e 128 KB por objeto\", \"Milissegundos, com 0,01 dólar por GB lido\"], [\"S3 One Zone-IA\", \"Cópia que dá para recriar\", \"0,01 dólar\", \"30 dias e 128 KB por objeto\", \"Milissegundos, numa zona só\"], [\"S3 Glacier Instant Retrieval\", \"Arquivo consultado algumas vezes por ano\", \"0,004 dólar\", \"90 dias e 128 KB por objeto\", \"Milissegundos, com 0,03 dólar por GB lido\"], [\"S3 Glacier Flexible Retrieval\", \"Arquivo morto, lido raramente\", \"0,0036 dólar\", \"90 dias\", \"Minutos a horas, depois de restaurar\"], [\"S3 Glacier Deep Archive\", \"Guarda por obrigação\", \"0,00099 dólar\", \"180 dias\", \"Horas, depois de restaurar\"], [\"S3 Express One Zone\", \"Latência de um dígito de milissegundo\", \"0,11 dólar\", \"Nenhum\", \"Bucket de diretório, numa zona só\"]]",
                    },
                    {
                        type: "text",
                        value: "## Ciclo de vida\nA regra de ciclo de vida move e apaga objetos sozinha, por prefixo e idade. No bucket da aula, os comprovantes vão para o Standard-IA com 30 dias, para o Glacier Instant Retrieval com 120 (continuam abrindo na hora quando o cliente pede) e são apagados com 5 anos; `tmp/` some em um dia; versões antigas somem 30 dias depois de substituídas; e upload multipart abandonado é limpo em 7 dias, porque as partes de um upload que não terminou continuam cobradas e não aparecem na listagem comum.\n\nTrês detalhes evitam surpresa. Desde setembro de 2024, por padrão, objeto menor que 128 KB **não transita** para nenhuma classe, porque a taxa de transição cobrada por objeto superaria a economia. Com versionamento ligado, apagar um objeto sem informar a versão só cria um marcador de exclusão, e a versão anterior continua guardada e cobrada até uma regra de versões antigas removê-la. E Glacier Flexible Retrieval e Deep Archive não servem para o que o usuário abre na tela: o objeto precisa ser restaurado antes, em minutos ou horas. Muita gente manda tudo com mais de 90 dias para o Flexible Retrieval para economizar e descobre o problema quando o cliente clica no comprovante antigo.",
                    },
                    {
                        type: "quote",
                        value: "Arquivo mora no S3, em bucket privado, e o PostgreSQL guarda só a chave; o navegador envia e baixa por URL pré-assinada curta, que nunca vive mais que a credencial que a assinou. Classe de armazenamento e ciclo de vida decidem a conta, desde que a classe combine com o jeito que o arquivo é lido.",
                    },
                ],
                questions: [
                    {
                        statement: "A API, no ECS com Fargate, grava em `/app/uploads` os comprovantes que os clientes enviam. Qual é o problema que aparece primeiro?",
                        difficulty: "facil",
                        options: [
                            { text: "O disco da task é compartilhado, e duas tasks gravando juntas corrompem os arquivos", isCorrect: false },
                            { text: "Os arquivos ficam públicos, porque o disco da task é servido pelo load balancer", isCorrect: false },
                            { text: "Os arquivos somem quando a task é trocada, e cada task só enxerga os que recebeu", isCorrect: true },
                            { text: "O Fargate bloqueia escrita em disco, e a gravação já falha no primeiro upload feito", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API, rodando no ECS, gera uma URL pré-assinada de `GET` com validade de 7 dias e manda por e-mail. Poucas horas depois, o link para de funcionar. Por quê?",
                        difficulty: "facil",
                        options: [
                            { text: "O S3 limita URL pré-assinada de `GET` a 12 horas, qualquer que seja a credencial que assina", isCorrect: false },
                            { text: "O Block Public Access do bucket invalida as URLs pré-assinadas uma hora depois de geradas", isCorrect: false },
                            { text: "A URL foi assinada com a credencial temporária da task role, que expirou antes dos 7 dias", isCorrect: true },
                            { text: "O link vence quando o objeto muda de classe no ciclo de vida, o que acontece toda noite", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API gera a URL de `PUT` com `ContentType = \"application/pdf\"`, mas o front-end envia o arquivo com o cabeçalho `Content-Type: application/octet-stream`. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O S3 responde 403 `SignatureDoesNotMatch`: o `Content-Type` entrou na assinatura", isCorrect: true },
                            { text: "O upload funciona, e o S3 grava o objeto com o tipo enviado pelo navegador no `PUT`", isCorrect: false },
                            { text: "O S3 responde 415, porque o bucket só aceita os tipos listados na regra de CORS", isCorrect: false },
                            { text: "O upload funciona, e o S3 grava o objeto com o tipo que foi informado na assinatura", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma regra de ciclo de vida criada em 2026 manda o prefixo `miniaturas/` para o Standard-IA com 30 dias, sem filtro de tamanho. As miniaturas têm cerca de 40 KB. O que acontece com elas?",
                        difficulty: "medio",
                        options: [
                            { text: "Vão para o Standard-IA e passam a custar menos, porque pagam pelos 40 KB reais", isCorrect: false },
                            { text: "Ficam no Standard: por padrão, objeto com menos de 128 KB não transita de classe", isCorrect: true },
                            { text: "São apagadas, porque objeto menor que o mínimo da classe expira em vez de transitar", isCorrect: false },
                            { text: "Vão para o Standard-IA e passam a ser cobradas como objetos de 128 KB cada uma", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um bucket tem versionamento ligado e nenhuma regra para versões antigas. Um job apaga todo dia os arquivos de `tmp/` com `DeleteObject`, sem informar versão, mas o armazenamento do bucket não para de crescer. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "O S3 cobra 30 dias mínimos de todo objeto apagado, inclusive dos que estão no Standard", isCorrect: false },
                            { text: "Cada exclusão só cria um marcador, e a versão anterior continua guardada e cobrada", isCorrect: true },
                            { text: "O Block Public Access bloqueia a exclusão, e o job recebe uma resposta de sucesso falsa", isCorrect: false },
                            { text: "O `DeleteObject` entra numa fila, e o S3 só apaga de fato o objeto depois de 30 dias", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Mensageria na AWS",
        aulas: [
            {
                titulo: "Amazon MQ for RabbitMQ: o broker que a AWS opera",
                blocks: [
                    {
                        type: "text",
                        value: "# Amazon MQ for RabbitMQ: o broker que a AWS opera\n\nO sistema já fala RabbitMQ: a API publica `pedido.criado` com o `RabbitMQ.Client` 7.x, o worker consome com ack manual e as filas são quorum queues. Na hora de levar isso para a AWS, aparece a pergunta de sempre: subir o RabbitMQ por conta própria (em EC2 ou em contêiner, cuidando de disco, cluster, atualização do RabbitMQ e do Erlang, certificado) ou usar o **Amazon MQ**, o serviço em que a AWS opera o broker para você.\n\nO argumento a favor do gerenciado é que o protocolo e o cliente são os mesmos. O código que publica e consome não muda; muda quem troca o nó que morreu e quem aplica o patch. Esta aula trata da outra metade da conversa: o que muda na operação, o que você deixa de poder configurar e o que continua sendo problema seu.\n\n## Versões e o que a AWS decide\n\nEm outubro de 2026, o Amazon MQ for RabbitMQ oferece a série 4 nas versões **4.2** (desde novembro de 2025) e **4.3** (desde setembro de 2026), e a série 4 só roda nas instâncias **`mq.m7g`**. Você escolhe a versão major.minor (`4.3`); os patches (`4.3.x`) a AWS aplica na janela de manutenção, e por isso `AutoMinorVersionUpgrade` precisa ficar ligado a partir do 3.13. A atualização no lugar anda em degraus: do 3.13 para o 4.2 e do 4.2 para o 4.3, sem pular.",
                    },
                    {
                        type: "text",
                        value: "## Instância única ou cluster\n\nNa criação você escolhe o modo de implantação, e ele define quase todo o resto:\n\n- **Instância única** (`SINGLE_INSTANCE`): um nó, numa zona de disponibilidade, atrás de um Network Load Balancer. Simples e mais barato, mas manutenção ou falha de hardware significam broker fora do ar.\n- **Cluster** (`CLUSTER_MULTI_AZ`): três nós em zonas diferentes, atrás de um Network Load Balancer. Na manutenção, a AWS reinicia um nó por vez e mantém pelo menos dois de pé; quem estava conectado no nó reiniciado cai e precisa reconectar sozinho.\n\nO erro comum é começar com instância única \"para economizar\" e planejar virar cluster depois. **Não existe conversão**: o modo de implantação é escolha de criação, a API de atualização do broker não tem esse campo e, no CloudFormation, trocá-lo exige substituir o recurso. Como o nome do broker é único na conta, o deploy só passa se o nome mudar junto; aí o CloudFormation cria um broker novo, com endpoint novo, e apaga o antigo no fim do deploy, com o que estiver nele. Migração de verdade é outra coisa: o cluster sobe ao lado, os clientes mudam de endpoint e o antigo é esvaziado antes de sair. Decida no primeiro dia: produção vai de cluster.\n\nA tabela compara os dois com o `mq.m7g.large`, o menor tamanho que a AWS indica para produção (o `mq.m7g.medium` é para avaliação, e o antigo `mq.t3.micro` não aceita broker novo e saiu de suporte em 1º de outubro de 2026).",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\", \"Instância única\", \"Cluster\"], [\"Nós e zonas\", \"1 nó, 1 zona\", \"3 nós, 3 zonas\"], [\"Manutenção semanal (até 2 horas)\", \"Broker fora do ar\", \"Um nó por vez; as conexões daquele nó caem\"], [\"Disco por nó (mq.m7g.large)\", \"200 GB\", \"15 GB por padrão; na série 4, configurável até 75 GB\"], [\"Política padrão no vhost /\", \"Sem limite de tamanho de fila\", \"max-length de 8 milhões, com overflow reject-publish\"], [\"Instância (us-east-1, outubro de 2026)\", \"Cerca de 0,27 dólar por hora, uns 200 dólares por mês, mais o disco\", \"O triplo, uns 600 dólares por mês, mais o disco\"], [\"Uso indicado\", \"Desenvolvimento, homologação, carga que tolera parada\", \"Produção\"]]",
                    },
                    {
                        type: "text",
                        value: "## O que a AWS cuida e o que fica com você\n\nA AWS cuida do que é máquina: hardware, sistema operacional, troca de nó com defeito, o Network Load Balancer, o disco e os patches do RabbitMQ e do Erlang, aplicados na janela de manutenção semanal (de até duas horas, no dia e na hora que você marca). Ela também fixa os limites de memória e de disco que bloqueiam publicadores (`vm_memory_high_watermark` e `disk_free_limit` não são editáveis) e cria, no vhost padrão `/`, políticas e limites de partida.\n\nCom você fica o que é sistema: a topologia (exchanges, filas, bindings), o tipo de fila, as policies de dead letter e de `delivery-limit`, os usuários de cada aplicação e o comportamento do cliente (reconexão, publisher confirms, idempotência). Dois detalhes surpreendem quem chega do RabbitMQ próprio:\n\n- **Usuários.** Pela API da AWS (e portanto pelo CDK) entra **um** usuário só, o administrador, na criação do broker. Os usuários das aplicações você cria depois pela API de gerenciamento do RabbitMQ ou pelo console web, e `guest` é proibido como nome. A senha precisa de 12 caracteres ou mais, com pelo menos 4 diferentes, e não pode ter vírgula, dois pontos nem sinal de igual.\n- **Métricas de fila.** Nos brokers da série 4, a AWS manda para o CloudWatch métricas do broker e dos nós, **não por fila**. Profundidade de fila você consulta pela API de gerenciamento ou pelo endpoint do Prometheus, que vem sempre ligado. Isso pesa quando você quiser escalar consumidores pelo tamanho da fila.",
                    },
                    {
                        type: "text",
                        value: "## O que você não configura\n\nNo broker próprio, o `rabbitmq.conf` é seu. No Amazon MQ, a configuração do broker é um recurso da AWS, com revisões, que aceita só uma lista curta de chaves, entre elas `consumer_timeout`, `heartbeat` (de 60 a 3.600 segundos), algumas de segurança, as dos backends de autenticação (OAuth 2.0, LDAP, HTTP, certificado com mTLS) e, na série 4, as de limites de recursos. Mudou a configuração, associe a nova revisão ao broker e reinicie.\n\nOs limites de recursos merecem atenção porque nascem apertados. Num cluster `mq.m7g.large`, os padrões documentados para o 4.2 são 500 conexões e 1.500 canais por nó, 10 consumidores por canal, 1.000 filas e **mensagem de até 512 KiB** (`max_message_size` de 524.288 bytes). Um sistema que abre conexão por requisição, ou que manda anexo dentro da mensagem, esbarra nisso no primeiro dia.\n\nPlugins, só os da lista da AWS: management, shovel (só o dinâmico), federation, consistent hash, os de autenticação e o Prometheus, entre outros; plugin seu não entra. E três recursos do RabbitMQ não existem lá: **streams** (a documentação avisa que criar um stream leva a perda de dados), interceptadores de mensagem e a exchange local random.\n\nVale também o que o 4.3 mudou no RabbitMQ: fila declarada com `durable: false` e `exclusive: false` é recusada, e o broker fecha a conexão inteira. Código de tutorial antigo quebra na migração; troque por fila exclusiva ou por fila durável com TTL.",
                    },
                    {
                        type: "code",
                        value: "// MensageriaMqStack.cs: RabbitMQ 4.3 em cluster, só na rede privada\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.AmazonMQ;\nusing Amazon.CDK.AWS.EC2;\nusing Amazon.CDK.AWS.SecretsManager;\nusing Constructs;\n\npublic sealed class MensageriaMqStack : Stack\n{\n    public MensageriaMqStack(Construct scope, string id, IVpc vpc, ISecurityGroup sgWorker,\n        IStackProps? props = null) : base(scope, id, props)\n    {\n        // senha gerada no Secrets Manager; o Amazon MQ recusa vírgula, dois pontos e igual\n        var admin = new Secret(this, \"MqAdmin\", new SecretProps\n        {\n            GenerateSecretString = new SecretStringGenerator\n            {\n                SecretStringTemplate = \"{\\\"username\\\":\\\"loja-admin\\\"}\",\n                GenerateStringKey = \"password\",\n                ExcludeCharacters = \",:=\",\n                PasswordLength = 32\n            }\n        });\n\n        var sgBroker = new SecurityGroup(this, \"SgBroker\", new SecurityGroupProps\n        {\n            Vpc = vpc,\n            AllowAllOutbound = false\n        });\n        sgBroker.AddIngressRule(sgWorker, Port.Tcp(5671), \"AMQPS vindo do worker\");\n\n        new CfnBroker(this, \"Broker\", new CfnBrokerProps\n        {\n            BrokerName = \"loja-rabbit\",\n            EngineType = \"RABBITMQ\",\n            EngineVersion = \"4.3\",               // major.minor; o patch fica com a AWS\n            AutoMinorVersionUpgrade = true,      // obrigatório a partir do 3.13\n            HostInstanceType = \"mq.m7g.large\",   // a série 4 só roda em mq.m7g\n            DeploymentMode = \"CLUSTER_MULTI_AZ\", // escolha de criação: trocar depois é broker novo\n            PubliclyAccessible = false,\n            SubnetIds = vpc.SelectSubnets(new SubnetSelection\n            {\n                SubnetType = SubnetType.PRIVATE_WITH_EGRESS\n            }).SubnetIds,\n            SecurityGroups = [sgBroker.SecurityGroupId],\n            Users = new[]\n            {\n                // o único usuário que a API aceita aqui: o administrador, criado com o broker\n                new CfnBroker.UserProperty\n                {\n                    Username = \"loja-admin\",\n                    Password = admin.SecretValueFromJson(\"password\").UnsafeUnwrap()\n                }\n            },\n            MaintenanceWindowStartTime = new CfnBroker.MaintenanceWindowProperty\n            {\n                DayOfWeek = \"SUNDAY\", TimeOfDay = \"06:00\", TimeZone = \"UTC\" // 3h em Brasília\n            },\n            Logs = new CfnBroker.LogListProperty { General = true }\n        });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Conectando o cliente .NET\n\nO console mostra um endpoint na forma `amqps://b-...mq.us-east-1.on.aws:5671`. Três diferenças em relação ao RabbitMQ que roda na sua máquina:\n\n- **TLS sempre.** O AMQP entra pela 5671, com TLS; a 5672 não existe ali. O console web e a API de gerenciamento respondem na 443 (e na 15671). Libere no security group do broker a 5671 vinda do security group do worker, como no código acima, e a 443 só para quem administra.\n- **Nome do servidor validado.** Configure o `SslOption` com `ServerName` igual ao host, em vez de confiar no atalho da URI `amqps://`: no cliente 7.2, o atalho aceitou certificado emitido para outro nome.\n- **Reconexão obrigatória.** A janela de manutenção derruba conexões nó a nó. A recuperação automática do cliente 7.x (ligada por padrão) refaz a conexão; publicação em voo e mensagem sem ack continuam pedindo confirms e consumidor idempotente.",
                    },
                    {
                        type: "code",
                        value: "// ConexaoAmazonMq.cs: o mesmo RabbitMQ.Client 7.x, agora com TLS obrigatório\nusing RabbitMQ.Client;\n\npublic static class ConexaoAmazonMq\n{\n    public static ConnectionFactory Criar(string host, string usuario, string senha) => new()\n    {\n        HostName = host,      // o endpoint do broker, sem o \"amqps://\" na frente\n        Port = 5671,          // AMQPS: o Amazon MQ não abre porta sem TLS\n        UserName = usuario,   // usuário da aplicação, criado pela API de gerenciamento\n        Password = senha,     // lido do Secrets Manager, nunca do appsettings\n        Ssl = new SslOption\n        {\n            Enabled = true,\n            ServerName = host // o certificado é conferido contra o nome do broker\n        },\n        AutomaticRecoveryEnabled = true, // a manutenção derruba conexões, nó a nó\n        ClientProvidedName = \"loja-worker\"\n    };\n}\n\n// uso: await using IConnection conn =\n//          await ConexaoAmazonMq.Criar(host, usuario, senha).CreateConnectionAsync();",
                    },
                    {
                        type: "quote",
                        value: "O Amazon MQ troca a operação do broker, não a responsabilidade pelo sistema: a AWS aplica patch, troca nó e mantém o cluster de pé, enquanto a topologia, os usuários de cada aplicação, os limites e um cliente que reconecta, confirma e tolera duplicata continuam com você. Escolha o modo de implantação no primeiro dia, porque ele não muda depois.",
                    },
                ],
                questions: [
                    {
                        statement: "Um sistema em produção precisa continuar publicando e consumindo durante a manutenção semanal do Amazon MQ for RabbitMQ. Qual modo de implantação atende?",
                        difficulty: "facil",
                        options: [
                            { text: "Instância única, com um tipo de instância maior para aguentar", isCorrect: false },
                            { text: "Instância única com a opção Multi-AZ ligada nas configurações", isCorrect: false },
                            { text: "Ativo e standby, com failover automático para o nó reserva", isCorrect: false },
                            { text: "Cluster, com três nós em zonas de disponibilidade diferentes", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num broker 4.3 do Amazon MQ, a aplicação declara a fila `faturamento` sem o argumento `x-queue-type`. Que tipo de fila é criado?",
                        difficulty: "facil",
                        options: [
                            { text: "Fila clássica, que é o padrão do RabbitMQ em qualquer versão", isCorrect: false },
                            { text: "Stream, porque a AWS converte as filas duráveis em streams", isCorrect: false },
                            { text: "Quorum queue, que é o tipo padrão nos brokers da série 4", isCorrect: true },
                            { text: "Fila clássica, replicada nos três nós pelo próprio cluster", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O broker de homologação nasceu como instância única. Para a produção, alguém quer trocar no CDK `DeploymentMode = \"SINGLE_INSTANCE\"` por `DeploymentMode = \"CLUSTER_MULTI_AZ\"` e rodar o deploy. Qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker vira cluster na hora, com uma reinicialização de minutos", isCorrect: false },
                            { text: "O cluster sobe ao lado e a AWS migra as filas para ele com shovel", isCorrect: false },
                            { text: "A AWS acrescenta dois nós na próxima janela de manutenção e mantém o endpoint", isCorrect: false },
                            { text: "Não há conversão: só sai como broker novo, com outro nome e outro endpoint", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num cluster `mq.m7g.large` da série 4, a fila `faturamento` está no vhost padrão e o publicador não usa publisher confirms. Os consumidores ficam parados por um dia e a fila bate no limite padrão de 8 milhões de mensagens. O que acontece com as publicações seguintes?",
                        difficulty: "medio",
                        options: [
                            { text: "Ficam presas na conexão até a fila baixar, sem nenhuma perda de mensagem", isCorrect: false },
                            { text: "São recusadas pela política padrão da AWS, e o publicador nem fica sabendo", isCorrect: true },
                            { text: "Entram, e as mensagens mais antigas da fila são descartadas para dar espaço", isCorrect: false },
                            { text: "Entram normalmente, porque a AWS amplia o disco do cluster conforme precisa", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe vai migrar o sistema para um broker 4.3 do Amazon MQ, em cluster. Qual item do plano de migração está correto?",
                        difficulty: "dificil",
                        options: [
                            { text: "A fila de resposta `durable: false, exclusive: false` passa a ser declarada exclusiva: o 4.3 recusa a combinação", isCorrect: true },
                            { text: "Os usuários de cada aplicação entram no CDK, na lista `Users` do broker, com um item por serviço", isCorrect: false },
                            { text: "O stream de auditoria vai junto, declarado com `x-queue-type: stream`, já que o cluster replica os streams entre os nós", isCorrect: false },
                            { text: "O alarme de fila parada usa a métrica por fila que o Amazon MQ publica no CloudWatch para cada broker", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "SQS: fila padrão, FIFO e o ciclo de vida da mensagem",
                blocks: [
                    {
                        type: "text",
                        value: "# SQS: fila padrão, FIFO e o ciclo de vida da mensagem\n\nPara o worker que emite a nota fiscal depois do pagamento, um broker inteiro pode ser exagero. O **Amazon SQS** é fila como serviço: não tem instância para dimensionar, nem janela de manutenção, nem disco que enche. Você cria a fila, publica e consome por uma API HTTPS e paga por requisição.\n\nO modelo, porém, é diferente do RabbitMQ, e quem chega de lá tropeça em três pontos:\n\n- **Não há exchange nem binding.** O produtor manda direto para a fila (`SendMessage`); espalhar e rotear ficam com SNS e EventBridge.\n- **O consumidor busca.** Não existe push: o worker chama `ReceiveMessage` em laço.\n- **O ack é apagar.** Processou, chama `DeleteMessage` com o *receipt handle* daquela entrega. Não há nack: a mensagem não apagada volta sozinha quando o *visibility timeout* vence (o mais perto de um nack é `ChangeMessageVisibility` com 0, que a devolve na hora).",
                    },
                    {
                        type: "text",
                        value: "## Fila padrão ou FIFO\n\nA **fila padrão** entrega pelo menos uma vez, com ordem aproximada, e aguenta vazão praticamente ilimitada. A **FIFO** (o nome termina em `.fifo`) mantém a ordem dentro de cada `MessageGroupId` e descarta o envio repetido com o mesmo `MessageDeduplicationId` dentro de 5 minutos. Ordem tem preço em vazão: sem o modo de alta vazão, a FIFO faz 300 transações por segundo por ação (3.000 mensagens por segundo em lotes de 10). Com o modo de alta vazão, o teto depende da região: em outubro de 2026, até 70.000 transações por segundo em us-east-1 e 4.500 em São Paulo.\n\nDois enganos comuns. O primeiro é achar que FIFO dispensa idempotência: a deduplicação vale para o **envio** repetido; se o worker processa e morre antes do `DeleteMessage`, a mensagem volta e é processada de novo. O segundo é usar um `MessageGroupId` fixo para tudo: enquanto há mensagem de um grupo em processamento, as seguintes daquele grupo esperam, e com grupo único a fila inteira vira uma fila indiana. Use como grupo a entidade cuja ordem importa (o cliente, a conta, o pedido).\n\nDesde julho de 2025, a fila padrão também aceita `MessageGroupId`, com outro sentido: ali ele identifica o *tenant* para as **fair queues**, que impedem um cliente barulhento de atrasar os outros. Não há ordem nesse caso.",
                    },
                    {
                        type: "table",
                        value: "[[\"Característica\", \"Fila padrão\", \"FIFO\"], [\"Entrega\", \"Pelo menos uma vez\", \"Pelo menos uma vez, sem repetir o envio em 5 minutos\"], [\"Ordem\", \"Aproximada\", \"Garantida dentro de cada MessageGroupId\"], [\"Vazão\", \"Praticamente ilimitada\", \"300 transações por segundo por ação; com alta vazão, até 70.000 em us-east-1\"], [\"Preço por milhão de requisições (us-east-1, outubro de 2026)\", \"Cerca de 0,40 dólar\", \"Cerca de 0,50 dólar\"], [\"Quando usar\", \"Tarefas independentes: e-mail, nota, miniatura de imagem\", \"Sequência que não pode inverter: saldo, estado do pedido\"]]",
                    },
                    {
                        type: "code",
                        value: "// enviar para a FIFO: o grupo define a ordem, o id de deduplicação barra a repetição\nawait sqs.SendMessageAsync(new SendMessageRequest\n{\n    QueueUrl = filaFifoUrl,             // termina em .fifo\n    MessageBody = json,\n    MessageGroupId = pedido.ClienteId.ToString(),  // ordem por cliente\n    MessageDeduplicationId = pedido.Id.ToString()  // repetida em 5 minutos, descartada\n});",
                    },
                    {
                        type: "text",
                        value: "## O ciclo de vida de uma mensagem\n\nUma mensagem enviada fica **visível**. Quando um consumidor a recebe, ela fica **em voo**: continua na fila, invisível para os outros, durante o visibility timeout (padrão de 30 segundos, máximo de 12 horas contadas do primeiro recebimento). Se o consumidor apaga, acabou. Se não apaga (exceção, processo morto, demora), ela volta a ficar visível e o `ApproximateReceiveCount` sobe. Quando passa do `maxReceiveCount` da fila, ela vai para a DLQ.\n\nO erro clássico: o processamento leva 2 minutos e o visibility timeout ficou no padrão de 30 segundos. A mensagem volta no meio do trabalho, outro worker a pega, e o pedido é faturado duas vezes. Ajuste o timeout acima do pior caso e, para trabalho longo e variável, estenda o prazo durante o processamento com `ChangeMessageVisibility` (o limite de 12 horas não reinicia).\n\nOs limites do dia a dia, em outubro de 2026: mensagem de até **1 MiB** (eram 256 KiB até agosto de 2025), retenção de 60 segundos a 14 dias (padrão de 4 dias), atraso de entrega de até 15 minutos e até 10 mensagens por chamada. A cobrança conta cada 64 KB do corpo como uma requisição: uma mensagem de 1 MiB vale 16.",
                    },
                    {
                        type: "text",
                        value: "## Long polling\n\nPor padrão, o `ReceiveMessage` faz *short polling*: consulta só uma amostra dos servidores e responde na hora, mesmo vazio. Num laço, isso gera milhões de respostas vazias por mês, cobradas como requisição, e às vezes uma resposta vazia com mensagem na fila. Com **long polling** (`WaitTimeSeconds` de 1 a 20), a chamada consulta todos os servidores e só volta quando chega mensagem ou quando o tempo acaba. Ligue nos dois lugares: no atributo da fila (`ReceiveMessageWaitTimeSeconds`) e na chamada.\n\nO consumidor abaixo usa o AWSSDK.SQS 4.x. Repare no `resp.Messages ?? []`: no SDK 4.x, as coleções das classes de requisição e resposta nascem `null`, e resposta sem mensagem deixa `Messages` em `null`. O `foreach` direto, que funcionava no SDK 3.x, lança `NullReferenceException` na primeira volta vazia.",
                    },
                    {
                        type: "code",
                        value: "// ConsumidorFaturamento.cs: worker que lê a fila com long polling (AWSSDK.SQS 4.x)\nusing Amazon.SQS;\nusing Amazon.SQS.Model;\n\npublic sealed class ConsumidorFaturamento(IAmazonSQS sqs, IConfiguration config,\n    ILogger<ConsumidorFaturamento> logger) : BackgroundService\n{\n    private readonly string _filaUrl = config[\"Filas:Faturamento\"]\n        ?? throw new InvalidOperationException(\"Filas:Faturamento não configurada\");\n\n    protected override async Task ExecuteAsync(CancellationToken ct)\n    {\n        while (!ct.IsCancellationRequested)\n        {\n            var resp = await sqs.ReceiveMessageAsync(new ReceiveMessageRequest\n            {\n                QueueUrl = _filaUrl,\n                MaxNumberOfMessages = 10, // até 10 por chamada (o padrão é 1)\n                WaitTimeSeconds = 20,     // long polling: espera chegar mensagem\n                MessageSystemAttributeNames = [\"ApproximateReceiveCount\"]\n            }, ct);\n\n            // no SDK 4.x, resposta sem mensagens deixa a lista em null\n            foreach (var msg in resp.Messages ?? [])\n            {\n                try\n                {\n                    await ProcessarAsync(msg.Body, ct);\n                    await sqs.DeleteMessageAsync(_filaUrl, msg.ReceiptHandle, ct); // o \"ack\"\n                }\n                catch (Exception ex) when (ex is not OperationCanceledException)\n                {\n                    // sem delete: a mensagem volta quando o visibility timeout vencer\n                    logger.LogError(ex, \"Falha na mensagem {MessageId}, recebida {Vezes} vez(es)\",\n                        msg.MessageId, msg.Attributes?.GetValueOrDefault(\"ApproximateReceiveCount\"));\n                }\n            }\n        }\n    }\n\n    private static Task ProcessarAsync(string corpo, CancellationToken ct) => Task.Delay(100, ct);\n}\n\n// Program.cs do worker: o cliente do SQS vem pela injeção de dependência\nvar builder = Host.CreateApplicationBuilder(args);\n\n// sem chave no código: dentro do ECS, a credencial vem da task role\nbuilder.Services.AddAWSService<IAmazonSQS>();\nbuilder.Services.AddHostedService<ConsumidorFaturamento>();\n\nbuilder.Build().Run();",
                    },
                    {
                        type: "text",
                        value: "## DLQ e redrive\n\nA DLQ é uma fila comum, apontada pela *redrive policy* da fila de origem junto com o `maxReceiveCount`. Ela precisa ser do mesmo tipo (FIFO com FIFO), da mesma conta e da mesma região. Dois cuidados:\n\n- **Nada de `maxReceiveCount` 1.** Uma falha passageira (um timeout de rede, um deploy) já manda a mensagem para a DLQ. De 3 a 5 tentativas é o comum.\n- **Retenção da DLQ maior que a da origem.** Na fila padrão, a mensagem leva para a DLQ o carimbo de quando entrou na origem: se as duas retêm por 4 dias e a mensagem falhou por 3, ela some da DLQ um dia depois. Na FIFO, o carimbo é zerado na mudança. Use 14 dias na DLQ.\n\nCorrigido o bug, o **redrive** devolve as mensagens: pelo console ou pela API `StartMessageMoveTask`, para a fila de origem ou para outra do mesmo tipo, com velocidade controlada (até 500 mensagens por segundo no modo personalizado). As mensagens devolvidas entram como novas, com outro `MessageId` e prazo de retenção zerado.",
                    },
                    {
                        type: "code",
                        value: "// FilasStack.cs (trecho): fila padrão com DLQ, e uma FIFO para o que exige ordem\nvar dlq = new Queue(this, \"FaturamentoDlq\", new QueueProps\n{\n    RetentionPeriod = Duration.Days(14) // maior que a da origem: o relógio não zera na DLQ\n});\n\nvar faturamento = new Queue(this, \"Faturamento\", new QueueProps\n{\n    VisibilityTimeout = Duration.Minutes(2),       // folga sobre o pior processamento\n    ReceiveMessageWaitTime = Duration.Seconds(20), // long polling como padrão da fila\n    RetentionPeriod = Duration.Days(4),\n    EnforceSSL = true,\n    DeadLetterQueue = new DeadLetterQueue { Queue = dlq, MaxReceiveCount = 5 }\n});\n\nvar pedidosFifo = new Queue(this, \"PedidosFifo\", new QueueProps\n{\n    QueueName = \"loja-pedidos.fifo\",\n    Fifo = true,\n    DeduplicationScope = DeduplicationScope.MESSAGE_GROUP,         // os dois juntos\n    FifoThroughputLimit = FifoThroughputLimit.PER_MESSAGE_GROUP_ID // ligam a alta vazão\n});",
                    },
                    {
                        type: "quote",
                        value: "Na SQS, o ack é apagar e o nack é deixar o prazo vencer: acerte o visibility timeout, use long polling, mande o que falha demais para uma DLQ com retenção maior e escreva o consumidor para aguentar a mesma mensagem duas vezes. A FIFO compra ordem por grupo, não dispensa idempotência.",
                    },
                ],
                questions: [
                    {
                        statement: "O worker leva cerca de 2 minutos para processar cada mensagem, e a fila ficou com o visibility timeout padrão. O que tende a acontecer?",
                        difficulty: "facil",
                        options: [
                            { text: "Os outros workers ficam bloqueados no ReceiveMessage até o primeiro terminar", isCorrect: false },
                            { text: "A mensagem volta a ficar visível no meio do trabalho e outro worker a processa", isCorrect: true },
                            { text: "O DeleteMessage feito no fim falha e a mensagem segue direto para a DLQ", isCorrect: false },
                            { text: "O SQS estende o prazo sozinho enquanto a conexão HTTP do worker continuar aberta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o efeito de chamar `ReceiveMessage` com `WaitTimeSeconds = 20`?",
                        difficulty: "facil",
                        options: [
                            { text: "A chamada espera até 20 segundos por mensagem e volta assim que alguma chega", isCorrect: true },
                            { text: "A mensagem recebida fica invisível por 20 segundos para os outros consumidores", isCorrect: false },
                            { text: "Cada mensagem nova só fica disponível para leitura 20 segundos depois do envio", isCorrect: false },
                            { text: "A fila passa a entregar na ordem de envio as mensagens dos últimos 20 segundos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma fila padrão e a DLQ dela retêm mensagens por 4 dias. Uma mensagem passou 3 dias falhando na origem antes de ir para a DLQ. Se ninguém fizer nada, quando ela some da DLQ?",
                        difficulty: "medio",
                        options: [
                            { text: "Na hora: ela chega à DLQ com a retenção da fila de origem já estourada", isCorrect: false },
                            { text: "Nunca: a DLQ guarda as mensagens até que alguém faça o redrive delas", isCorrect: false },
                            { text: "4 dias depois de chegar, porque cada fila conta a retenção a partir do zero", isCorrect: false },
                            { text: "Cerca de 1 dia depois de chegar, porque o prazo conta da entrada na origem", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Os eventos de cada cliente precisam ser processados na ordem em que aconteceram, mas clientes diferentes podem andar em paralelo. Qual é o jeito certo de enviar para a fila FIFO?",
                        difficulty: "medio",
                        options: [
                            { text: "Fila padrão com `MessageGroupId` do cliente, que também ordena por grupo", isCorrect: false },
                            { text: "`MessageDeduplicationId` com o id do cliente, para agrupar os eventos dele", isCorrect: false },
                            { text: "`MessageGroupId` com o id do cliente, e uma chave de deduplicação por evento", isCorrect: true },
                            { text: "`MessageGroupId` fixo para todos, para a fila manter uma única ordem global de envio", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um worker migrado do AWSSDK.SQS 3.x para o 4.x tem este laço, que nunca deu problema na versão antiga:\n\n```csharp\nvar resp = await sqs.ReceiveMessageAsync(new ReceiveMessageRequest\n{\n    QueueUrl = filaUrl, WaitTimeSeconds = 20, MaxNumberOfMessages = 10\n}, ct);\nforeach (var msg in resp.Messages)\n    await ProcessarAsync(msg, ct);\n```\n\nO que acontece no 4.x quando a fila passa 20 segundos vazia?",
                        difficulty: "dificil",
                        options: [
                            { text: "`TimeoutException`, porque a espera de 20 segundos estoura o prazo do HTTP", isCorrect: false },
                            { text: "O SDK repete o `ReceiveMessage` por conta própria até chegar uma mensagem", isCorrect: false },
                            { text: "O laço não roda nenhuma vez, porque `Messages` volta como uma lista vazia de mensagens", isCorrect: false },
                            { text: "`NullReferenceException`, porque a resposta sem mensagens deixa `Messages` null", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "SNS e EventBridge: um evento, vários consumidores",
                blocks: [
                    {
                        type: "text",
                        value: "# SNS e EventBridge: um evento, vários consumidores\n\nO pagamento do pedido interessa a três partes do sistema: o faturamento emite a nota, o e-mail avisa o cliente e o antifraude examina os pedidos altos. Com uma fila só, cada mensagem vai para um consumidor; mandar o mesmo evento para três filas a partir da API amarra a API a todos os consumidores, e a cada novo interessado alguém mexe no publicador.\n\nNo RabbitMQ, isso é uma exchange com três bindings. Na AWS, há dois serviços para o papel, com perfis diferentes: o **SNS**, que espalha (*fan-out*) cada mensagem para todos os assinantes de um tópico, e o **EventBridge**, um barramento de eventos que roteia pelo conteúdo do evento.\n\n## Fan-out com SNS para SQS\n\nO padrão mais usado na AWS é **SNS na frente e uma fila SQS por consumidor**. O tópico entrega uma cópia para cada fila assinante, e cada fila dá ao seu consumidor o que o SNS sozinho não dá: buffer, retentativa no ritmo do worker e DLQ própria. Se o serviço de e-mail cair por uma hora, as mensagens dele esperam na fila dele, e o faturamento segue.",
                    },
                    {
                        type: "text",
                        value: "Três configurações fazem diferença:\n\n- **Raw message delivery.** Sem ela, o corpo que chega na fila é um envelope JSON do SNS (`Type`, `MessageId`, `TopicArn`, `Message`, `Timestamp`, assinatura), com o seu evento como texto dentro de `Message`. O consumidor que desserializa o corpo direto como `PedidoPago` recebe um objeto com todos os campos vazios. Com raw delivery, chega o corpo publicado, como está (com no máximo 10 atributos de mensagem).\n- **Filter policy.** Cada assinatura pode filtrar pelos atributos da mensagem (ou pelo corpo JSON, se a assinatura usar o escopo de corpo). A fila de e-mails só quer `pedido.pago`; sem filtro, ela recebe tudo e o código descarta, pagando por isso. Mensagem sem o atributo que o filtro pede não chega.\n- **Permissão na fila.** O SNS precisa de permissão para escrever em cada fila. O CDK cria essa policy quando você assina a fila com `SqsSubscription`; quem cria a assinatura por outro caminho e esquece a policy da fila vê a mensagem não chegar, sem erro nenhum no publicador.\n\nNa fatura (us-east-1, outubro de 2026), publicar no SNS sai na casa de meio dólar por milhão, e a entrega para filas SQS não é cobrada por mensagem.",
                    },
                    {
                        type: "code",
                        value: "// FanoutStack.cs (trecho): um tópico espalhando para filas\nvar topico = new Topic(this, \"Pedidos\", new TopicProps { TopicName = \"loja-pedidos\" });\nvar faturamento = new Queue(this, \"Faturamento\");\nvar emails = new Queue(this, \"Emails\");\n\n// cada fila assina o tópico; o CDK escreve a policy que deixa o SNS enviar para ela\ntopico.AddSubscription(new SqsSubscription(faturamento, new SqsSubscriptionProps\n{\n    RawMessageDelivery = true // chega o corpo publicado, sem o envelope JSON do SNS\n}));\ntopico.AddSubscription(new SqsSubscription(emails, new SqsSubscriptionProps\n{\n    RawMessageDelivery = true,\n    FilterPolicy = new Dictionary<string, SubscriptionFilter>\n    {\n        [\"tipo\"] = SubscriptionFilter.StringFilter(new StringConditions\n        {\n            Allowlist = [\"pedido.pago\"] // só este tipo chega na fila de e-mails\n        })\n    }\n}));",
                    },
                    {
                        type: "text",
                        value: "## EventBridge: barramento e regras\n\nNo EventBridge, o publicador manda eventos para um **barramento** (*event bus*) com `PutEvents`, e **regras** decidem quem recebe. Todo evento tem envelope fixo: `source` (quem publicou), `detail-type` (o tipo), `detail` (o seu JSON) e metadados. A regra é um padrão sobre esse JSON: igualdade, prefixo, `anything-but`, faixa numérica, existência de campo. Cada regra entrega para até 5 alvos: fila SQS, Lambda, Step Functions, outro barramento, API HTTP, entre outros.\n\nO que o EventBridge tem e o SNS não: filtro pelo **conteúdo** do evento, com operadores, e os eventos da própria AWS. No barramento `default` de cada conta chegam, sem custo, eventos de mudança de estado dos serviços (uma task do ECS que parou, por exemplo). O preço: ingerir evento próprio sai na casa de 1 dólar por milhão (us-east-1, outubro de 2026), o dobro do SNS.\n\nQuando o alvo falha, o EventBridge tenta de novo por até 24 horas e até 185 vezes, com backoff. Esgotadas as tentativas, **o evento é descartado**, a não ser que o alvo tenha uma DLQ. Configure a DLQ em cada alvo, como no código.",
                    },
                    {
                        type: "code",
                        value: "// FanoutStack.cs (trecho): barramento próprio e uma regra que lê o conteúdo\n// (Events.Targets também tem um EventBus: no topo, um alias para o de Events)\nvar barramento = new EventBus(this, \"Barramento\", new EventBusProps { EventBusName = \"loja\" });\nvar antifraude = new Queue(this, \"Antifraude\");\nvar naoEntregues = new Queue(this, \"EventosNaoEntregues\", new QueueProps\n{\n    RetentionPeriod = Duration.Days(14)\n});\n\nvar regra = new Rule(this, \"PedidoPagoAlto\", new RuleProps\n{\n    EventBus = barramento,\n    EventPattern = new EventPattern\n    {\n        Source = [\"loja.pedidos\"],\n        DetailType = [\"PedidoPago\"],\n        Detail = new Dictionary<string, object>\n        {\n            [\"valor\"] = Match.GreaterThanOrEqual(1000) // campo do JSON, em camelCase\n        }\n    }\n});\nregra.AddTarget(new SqsQueue(antifraude, new SqsQueueProps\n{\n    DeadLetterQueue = naoEntregues, // esgotadas as tentativas, o evento vem para cá\n    MaxEventAge = Duration.Hours(2),\n    RetryAttempts = 20\n}));",
                    },
                    {
                        type: "text",
                        value: "## Publicando do .NET\n\nPublicar nos dois é uma chamada de SDK, mas três detalhes derrubam gente experiente:\n\n- **`PutEvents` não lança exceção por evento recusado.** A resposta HTTP 200 traz `FailedEntryCount` e, em cada entrada, `ErrorCode` e `ErrorMessage` (throttling e falha interna estão entre os erros que valem nova tentativa). Quem só faz `await` e segue perde eventos em silêncio. Confira `FailedEntryCount` e reenvie as entradas que falharam.\n- **Coleção nasce `null` no SDK 4.x.** O inicializador de coleção `MessageAttributes = { [\"tipo\"] = ... }` compila, mas adiciona num dicionário que não existe: `NullReferenceException` em tempo de execução. Crie o dicionário inteiro, como no código.\n- **Nome de campo diferencia maiúscula.** O padrão `detail.valor` não casa com `Valor`, e o `JsonSerializer` padrão do .NET grava os nomes como estão na classe. Por isso o código usa `JsonSerializerOptions.Web`, que grava em camelCase.",
                    },
                    {
                        type: "code",
                        value: "// PublicadorEventos.cs: o mesmo fato publicado no SNS e no EventBridge (AWSSDK 4.x)\nusing System.Text.Json;\nusing Amazon.EventBridge;\nusing Amazon.EventBridge.Model;\nusing Amazon.SimpleNotificationService;\nusing Amazon.SimpleNotificationService.Model;\n\npublic sealed record PedidoPago(Guid PedidoId, Guid ClienteId, decimal Valor);\n\npublic sealed class PublicadorEventos(IAmazonSimpleNotificationService sns, IAmazonEventBridge eventBridge)\n{\n    // camelCase: o padrão de evento compara nomes de campo com maiúscula e minúscula\n    private static readonly JsonSerializerOptions Json = JsonSerializerOptions.Web;\n\n    public Task PublicarNoTopicoAsync(string topicoArn, PedidoPago evento, CancellationToken ct) =>\n        sns.PublishAsync(new PublishRequest\n        {\n            TopicArn = topicoArn,\n            Message = JsonSerializer.Serialize(evento, Json),\n            // no SDK 4.x as coleções nascem null: crie o dicionário inteiro\n            MessageAttributes = new Dictionary<string, MessageAttributeValue>\n            {\n                [\"tipo\"] = new() { DataType = \"String\", StringValue = \"pedido.pago\" }\n            }\n        }, ct);\n\n    public async Task PublicarNoBarramentoAsync(PedidoPago evento, CancellationToken ct)\n    {\n        var resp = await eventBridge.PutEventsAsync(new PutEventsRequest\n        {\n            Entries =\n            [\n                new PutEventsRequestEntry\n                {\n                    EventBusName = \"loja\",\n                    Source = \"loja.pedidos\",\n                    DetailType = \"PedidoPago\",\n                    Detail = JsonSerializer.Serialize(evento, Json)\n                }\n            ]\n        }, ct);\n\n        // HTTP 200 não garante que o evento entrou: a falha vem por entrada\n        if (resp.FailedEntryCount > 0)\n            throw new InvalidOperationException(\n                $\"Evento recusado: {resp.Entries[0].ErrorCode} {resp.Entries[0].ErrorMessage}\");\n    }\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\", \"SNS\", \"EventBridge (barramento classic)\"], [\"Modelo\", \"Tópico: cada assinante recebe uma cópia\", \"Barramento: regras escolhem os alvos\"], [\"Filtro\", \"Por atributo ou pelo corpo JSON\", \"Padrão sobre o evento inteiro, com operadores\"], [\"Destinos\", \"SQS, Lambda, HTTP, e-mail, SMS, Firehose, entre outros\", \"SQS, Lambda, Step Functions, API HTTP, outro barramento e outros; até 5 por regra\"], [\"Eventos da própria AWS\", \"Só de serviços que publicam num tópico seu, como alarmes do CloudWatch\", \"Mudanças de estado dos serviços chegam de graça no barramento default\"], [\"Publicação (us-east-1, outubro de 2026)\", \"Cerca de 0,50 dólar por milhão\", \"Cerca de 1 dólar por milhão\"]]",
                    },
                    {
                        type: "text",
                        value: "Regra prática: **SNS** para espalhar o mesmo fato para filas conhecidas, rápido e barato, com filtro simples; **EventBridge** quando o roteamento depende do conteúdo, quando eventos da AWS entram na conversa ou quando outros times assinam o que você publica sem que o publicador precise saber deles. Nos dois casos, o consumidor fica atrás de uma fila SQS, pelo buffer e pela DLQ.\n\nPara o radar: em setembro de 2026, a AWS lançou um novo tipo de barramento personalizado no EventBridge, com assinantes no lugar de regras, ordem, deduplicação, retenção para replay e cobrança por volume em GB. O barramento desta aula passou a se chamar *Custom event bus - classic* e continua funcionando como antes. No lançamento, o novo tipo estava em 14 regiões, e São Paulo não era uma delas.",
                    },
                    {
                        type: "quote",
                        value: "Um fato, vários interessados: publique uma vez e deixe o espalhamento com o SNS ou o roteamento por conteúdo com o EventBridge, com uma fila SQS e uma DLQ na frente de cada consumidor. Confira `FailedEntryCount`, ligue o raw delivery e grave o JSON com os nomes que o filtro espera.",
                    },
                ],
                questions: [
                    {
                        statement: "No fan-out com SNS, por que colocar uma fila SQS na frente de cada consumidor, em vez de cada worker assinar o tópico direto por HTTP?",
                        difficulty: "facil",
                        options: [
                            { text: "A fila guarda as mensagens enquanto o consumidor está fora e tem DLQ própria", isCorrect: true },
                            { text: "A fila garante que cada consumidor receba as mensagens na ordem em que foram publicadas", isCorrect: false },
                            { text: "Sem a fila, o SNS entrega cada mensagem a um único assinante do tópico", isCorrect: false },
                            { text: "O SNS só consegue entregar mensagens para filas SQS e para funções Lambda", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O worker de e-mails lê da fila que assina o tópico e desserializa o corpo de cada mensagem como `PedidoPago`, mas todos os campos chegam vazios. A assinatura foi criada sem raw message delivery. Qual é a causa?",
                        difficulty: "facil",
                        options: [
                            { text: "A filter policy remove do corpo os campos que não estão nos atributos", isCorrect: false },
                            { text: "O SNS comprime o corpo das mensagens, e o worker precisa descompactar antes", isCorrect: false },
                            { text: "O corpo é o envelope JSON do SNS, com o evento como texto em `Message`", isCorrect: true },
                            { text: "A fila SQS converte o JSON publicado em XML quando recebe do tópico", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em pico de tráfego, eventos somem entre a API e o barramento do EventBridge, e não aparece nenhuma exceção no log. O código de publicação só faz `await eventBridge.PutEventsAsync(req, ct);`. O que explica?",
                        difficulty: "medio",
                        options: [
                            { text: "O EventBridge aceita um evento por chamada e ignora o restante da lista enviada", isCorrect: false },
                            { text: "`PutEvents` responde 200 com entradas recusadas, e a falha vem em `FailedEntryCount`", isCorrect: true },
                            { text: "O SDK 4.x guarda as exceções de throttling só no log de depuração e segue em frente sem avisar", isCorrect: false },
                            { text: "O barramento corta os eventos maiores que 10 KB quando o volume passa da cota", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A regra do EventBridge filtra `detail.valor` com `numeric >= 1000`, e o publicador grava o `detail` com `JsonSerializer.Serialize(evento)`, sem opções, a partir de `record PedidoPago(Guid PedidoId, Guid ClienteId, decimal Valor)`. Nenhum evento chega ao alvo. Qual é a causa mais provável?",
                        difficulty: "medio",
                        options: [
                            { text: "O JSON sai com `Valor`, e o padrão compara nomes diferenciando maiúsculas", isCorrect: true },
                            { text: "O filtro `numeric` só funciona com valores enviados como texto no `detail`", isCorrect: false },
                            { text: "Regras de barramento personalizado não aceitam filtro dentro de `detail`", isCorrect: false },
                            { text: "O EventBridge exige que o `detail` seja enviado codificado em base64", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A fila de e-mails assina o tópico com raw message delivery e a filter policy `{\"tipo\": [\"pedido.pago\"]}`, no escopo padrão de atributos. Um publicador novo passou a mandar o tipo apenas dentro do corpo JSON, como `{\"tipo\":\"pedido.pago\", ...}`, sem atributo de mensagem. O que a fila de e-mails recebe?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nada desse publicador: o filtro olha os atributos, e o tipo só está no corpo", isCorrect: true },
                            { text: "Só os pagamentos, porque o SNS copia o campo `tipo` do corpo para os atributos", isCorrect: false },
                            { text: "Tudo, porque mensagem sem o atributo filtrado passa pelo filtro sem checagem", isCorrect: false },
                            { text: "Tudo, porque com raw delivery a filter policy passa a avaliar o corpo JSON", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Escolhendo entre Amazon MQ, SQS, SNS, EventBridge e MSK",
                blocks: [
                    {
                        type: "text",
                        value: "# Escolhendo entre Amazon MQ, SQS, SNS, EventBridge e MSK\n\nA pergunta \"qual serviço de mensageria usar\" costuma ser respondida pelo que a equipe já conhece, e é assim que nasce um cluster de Kafka para uma fila de e-mails, ou um broker de centenas de dólares por mês para 50 mil mensagens por dia. A escolha fica mais simples quando você separa quatro critérios: **protocolo**, **roteamento**, **escala e retenção**, e **custo e operação**. A tabela resume; o resto da aula explica cada linha.",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\", \"Amazon MQ (RabbitMQ)\", \"SQS\", \"SNS\", \"EventBridge\", \"MSK (Kafka)\"], [\"Protocolo\", \"AMQP 0-9-1 e AMQP 1.0, cliente do RabbitMQ\", \"API da AWS, pelo SDK\", \"API da AWS, pelo SDK\", \"API da AWS, pelo SDK\", \"Protocolo do Kafka\"], [\"Modelo\", \"Broker com exchanges e filas\", \"Fila: o consumidor busca\", \"Tópico: espalha para assinantes\", \"Barramento: regras roteiam\", \"Log particionado: o consumidor lê do offset\"], [\"Roteamento\", \"Rico: direct, topic, fanout, headers\", \"Nenhum\", \"Filtro por atributo ou corpo\", \"Padrão sobre o conteúdo do evento\", \"Tópico e partição, escolhidos pelo produtor\"], [\"Ordem\", \"Por fila, com um consumidor ativo\", \"Na FIFO, por grupo\", \"No tópico FIFO, por grupo\", \"Sem garantia no barramento classic\", \"Por partição\"], [\"Reler o passado\", \"Não: streams não existem no Amazon MQ\", \"Não\", \"Só tópico FIFO, com arquivamento\", \"Arquivo e replay\", \"Sim, dentro da retenção\"], [\"Escala\", \"Até o tamanho da instância\", \"Praticamente ilimitada na fila padrão\", \"Alta, com cota de publicação por região\", \"Alta, com cota de PutEvents por região\", \"Por partições e brokers\"], [\"Custo parado (us-east-1, outubro de 2026)\", \"Uns 200 dólares por mês (1 nó) a 600 (cluster)\", \"Quase zero\", \"Quase zero\", \"Quase zero\", \"Centenas de dólares por mês\"], [\"Operação sua\", \"Versão, janela, limites, usuários\", \"Quase nenhuma\", \"Quase nenhuma\", \"Quase nenhuma\", \"Partições, versão, capacidade\"]]",
                    },
                    {
                        type: "text",
                        value: "## Protocolo: o que o código já fala\n\nO primeiro filtro é o cliente. Um sistema que usa `RabbitMQ.Client` migra para o Amazon MQ for RabbitMQ sem reescrever a mensageria: muda o endpoint, liga o TLS, ajusta a reconexão (e um legado Java com JMS tem a variante ActiveMQ do mesmo serviço). O mesmo sistema migrado para SQS reescreve publicador e consumidor, porque lá não há exchange, binding, ack por canal nem prefetch; há `SendMessage`, `ReceiveMessage` e `DeleteMessage`.\n\nIsso não quer dizer que todo legado deve ficar no Amazon MQ. Se o uso real é só \"fila de trabalho com retentativa\", a reescrita para SQS costuma ser pequena e elimina instância, janela de manutenção e limite de conexões. O Amazon MQ se paga quando você usa o que o RabbitMQ tem de diferente: roteamento por exchange, prioridade, o delayed retry do 4.3, prefetch fino, ou muitos sistemas que já falam AMQP.\n\n## Roteamento: quem precisa saber de quem\n\nFila sozinha não roteia: cada mensagem vai para um consumidor. Para o mesmo fato chegar a vários interessados, alguém precisa espalhar: **SNS com SQS** (filtro simples, barato, vazão alta), **EventBridge com SQS** (filtro pelo conteúdo, eventos da AWS, times que assinam sem combinar com o publicador) ou uma **exchange do RabbitMQ** (tudo isso dentro do broker, com o custo e os limites do broker).\n\nUm engano comum é usar o EventBridge como fila de trabalho. Ele não guarda evento para um worker buscar depois: entrega para um alvo e, se o alvo falha, tenta por até 24 horas. O alvo de um worker deve ser uma fila SQS, que é quem segura o backlog.",
                    },
                    {
                        type: "text",
                        value: "## Escala, retenção e reler o passado\n\nA SQS padrão escala sem você pensar nisso. SNS e EventBridge escalam bem, mas têm **cotas de publicação por conta e região**, e as de São Paulo são bem menores que as de us-east-1. Em outubro de 2026, o padrão era de 30.000 mensagens por segundo no SNS (tópico padrão) em us-east-1 contra 300 em São Paulo, e de 10.000 requisições `PutEvents` por segundo contra 600. Essas cotas são ajustáveis: peça o aumento antes da campanha, não durante. O Amazon MQ escala até o tamanho da instância escolhida, e trocar de tamanho exige reiniciar o broker.\n\nA pergunta que separa o Kafka dos outros é **reler**. Em fila (SQS, RabbitMQ), mensagem consumida é mensagem apagada. No Kafka, o consumidor lê um log retido por tempo ou por tamanho, cada grupo de consumidores guarda o próprio offset, e um consumidor novo pode começar do início: é o caso de alimentar um data lake, reconstruir uma projeção ou ter vários sistemas lendo o mesmo fluxo no próprio ritmo. O **MSK** é o Kafka gerenciado da AWS, em três formas (outubro de 2026): provisionado com brokers Standard, provisionado com brokers Express e serverless.\n\nSe o problema é \"processar cada pedido uma vez\", Kafka é ferramenta demais; se é \"manter um histórico de eventos para vários leitores\", fila é ferramenta de menos. Os streams do RabbitMQ cobririam parte disso, mas não existem no Amazon MQ.",
                    },
                    {
                        type: "text",
                        value: "## Custo: por requisição ou por hora\n\nÉ o critério que mais mexe na conta. SQS, SNS e EventBridge cobram **por uso**: sem tráfego, a fatura fica perto de zero. Amazon MQ e MSK cobram **por hora de capacidade**, com ou sem mensagem. Uma conta de ordem de grandeza (us-east-1, outubro de 2026), para 10 milhões de mensagens por mês, de até 64 KB, numa fila de trabalho:\n\n- **SQS**: cada mensagem custa umas três requisições (enviar, receber, apagar), uns 30 milhões no mês; a 0,40 dólar por milhão, perto de 12 dólares. Recebendo e apagando em lotes de 10, cai para perto de 5.\n- **Amazon MQ**: um cluster `mq.m7g.large` custa uns 600 dólares por mês, passem 10 milhões ou 10 mensagens.\n- **MSK**: três brokers `kafka.m7g.large` ficam perto de 450 dólares por mês antes do disco; o serverless cobra uns 0,75 dólar por hora de cluster, perto de 550 por mês, antes de partições e tráfego.\n\nO empate existe, mas fica longe: só lá pelas centenas de milhões de mensagens por mês (algo como 200 por segundo, o mês inteiro) a SQS sem lote chega ao preço de um cluster do Amazon MQ. Abaixo disso, a decisão por broker se justifica por protocolo e roteamento, não por preço.",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"Escolha\", \"Por quê\"], [\"Sistema .NET que já usa RabbitMQ.Client, com exchanges topic e prioridade\", \"Amazon MQ for RabbitMQ, em cluster\", \"Mesmo cliente e mesmo modelo; reescrever custaria mais que o broker\"], [\"Worker de nota fiscal, tarefas independentes, pico no fim do mês\", \"SQS padrão com DLQ\", \"Paga por uso, escala sozinho, sem instância\"], [\"Saldo que não pode inverter a ordem dentro da mesma conta\", \"SQS FIFO com MessageGroupId da conta\", \"Ordem por grupo e paralelismo entre contas\"], [\"Pedido pago interessa a faturamento, e-mail e antifraude\", \"SNS com uma fila SQS por consumidor\", \"Fan-out barato, cada consumidor com buffer e DLQ\"], [\"Reagir a task do ECS que parou e a eventos de outros times\", \"EventBridge com alvo SQS\", \"Eventos da AWS no barramento default e filtro por conteúdo\"], [\"Vários sistemas lendo o mesmo fluxo e reprocessando o histórico\", \"MSK\", \"Log retido e releitura por offset\"]]",
                    },
                    {
                        type: "quote",
                        value: "Escolha pelo que o problema pede, não pelo que a equipe já conhece: protocolo e roteamento ricos pedem Amazon MQ, trabalho independente pede SQS, espalhar pede SNS ou EventBridge com uma fila por consumidor, e reler o passado pede Kafka. Na dúvida, compare o custo parado: pagar por hora por um broker ocioso é a escolha mais cara de desfazer.",
                    },
                ],
                questions: [
                    {
                        statement: "Um sistema .NET usa `RabbitMQ.Client` com exchanges topic, prioridade de mensagem e publisher confirms, e precisa ir para a AWS agora, sem reescrever a mensageria. Qual serviço atende?",
                        difficulty: "facil",
                        options: [
                            { text: "MSK Serverless, que entende AMQP por meio de um conector gerenciado", isCorrect: false },
                            { text: "Amazon MQ for RabbitMQ, que mantém o protocolo e o cliente atuais", isCorrect: true },
                            { text: "EventBridge, que aceita o protocolo AMQP no barramento personalizado", isCorrect: false },
                            { text: "SQS FIFO, que oferece ordem e prioridade por grupo de mensagem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destes serviços continua cobrando por hora mesmo quando nenhuma mensagem trafega?",
                        difficulty: "facil",
                        options: [
                            { text: "SNS, por tópico criado, mesmo que ainda sem assinantes", isCorrect: false },
                            { text: "Amazon MQ, pelas horas de cada instância do broker", isCorrect: true },
                            { text: "SQS, por fila padrão criada e mantida na conta", isCorrect: false },
                            { text: "EventBridge, por barramento personalizado ativo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para \"economizar um serviço\", um time quer que o worker de antifraude, que roda no ECS, busque os eventos direto do barramento do EventBridge, sem fila no meio. Qual é o problema?",
                        difficulty: "medio",
                        options: [
                            { text: "O worker precisaria de long polling, e o EventBridge limita a espera da busca a 5 segundos", isCorrect: false },
                            { text: "Sem fila, o EventBridge entrega cada evento duas vezes ao worker para garantir a entrega", isCorrect: false },
                            { text: "O EventBridge só entrega eventos para funções Lambda, e o worker de antifraude roda como tarefa no ECS", isCorrect: false },
                            { text: "O EventBridge não guarda evento para ser buscado: entrega a um alvo, e o backlog fica sem lugar", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num teste de carga em sa-east-1 (São Paulo), o publicador recebe throttling de um tópico padrão do SNS ao tentar 1.000 mensagens por segundo, vazão que o mesmo código sustentava sem erro em us-east-1. O que explica, e o que fazer?",
                        difficulty: "medio",
                        options: [
                            { text: "O SDK limita as chamadas por região; basta abrir mais conexões HTTP no cliente", isCorrect: false },
                            { text: "A cota padrão de publicação de São Paulo é bem menor; peça aumento antes do pico", isCorrect: true },
                            { text: "O SNS limita a publicação pelo número de assinaturas, e o tópico tem assinantes demais", isCorrect: false },
                            { text: "O raw message delivery reduz a vazão do tópico; desligá-lo libera a publicação", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Três sistemas precisam ler o mesmo fluxo de eventos de pedido, cada um no próprio ritmo, e um sistema novo, que entra daqui a seis meses, deve reconstruir o estado lendo o histórico desde o primeiro evento. Qual opção atende sem gambiarra?",
                        difficulty: "dificil",
                        options: [
                            { text: "MSK, com retenção longa no tópico e um consumer group próprio em cada sistema", isCorrect: true },
                            { text: "Amazon MQ for RabbitMQ 4.3, com um stream de retenção longa no lugar da fila", isCorrect: false },
                            { text: "SNS com uma fila SQS por sistema, todas com a maior retenção que a SQS permite", isCorrect: false },
                            { text: "SQS FIFO com um MessageGroupId por sistema e retenção ajustada para seis meses", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Worker escalando pela fila",
                blocks: [
                    {
                        type: "text",
                        value: "# Worker escalando pela fila\n\nO worker de faturamento roda no ECS com `DesiredCount = 2`, fixo. De madrugada, as duas tarefas passam horas esperando mensagem que não vem; no fechamento do mês, a fila acumula 80 mil notas e o cliente espera horas. Escala fixa erra nos dois sentidos: paga capacidade parada e falta capacidade no pico.\n\n## O custo do consumidor ocioso\n\nParado, o worker quase não gasta SQS: com long polling de 20 segundos, cada tarefa faz no máximo 3 chamadas por minuto, umas 130 mil por mês, alguns centavos de dólar. (Já um laço com short polling e sem espera passa fácil de 25 milhões de chamadas vazias por mês por tarefa, uns 10 dólares jogados fora.) O que custa é a tarefa ligada: em us-east-1, outubro de 2026, uma tarefa Fargate de 0,25 vCPU e 0,5 GB fica perto de 9 dólares por mês; uma de 1 vCPU e 2 GB, perto de 36. Dez tarefas de 1 vCPU dimensionadas para o pico e ligadas o mês todo passam de 350 dólares por mês para trabalhar algumas horas por dia.\n\nA API do sistema escala por CPU, como na parte de contêineres. Para worker de fila, CPU é o sinal errado: uma tarefa em long polling fica perto de 0% de CPU esperando mensagem, e uma tarefa que passa o tempo esperando um serviço externo fica em 15% de CPU com 50 mil mensagens na fila. O sinal certo é a própria fila.",
                    },
                    {
                        type: "text",
                        value: "## Qual métrica da fila\n\nO SQS publica no CloudWatch, a cada minuto e sem custo, métricas como `ApproximateNumberOfMessagesVisible` (esperando), `ApproximateNumberOfMessagesNotVisible` (em processamento) e `ApproximateAgeOfOldestMessage` (idade da mais antiga). Escalar direto pela profundidade parece natural, mas engana: 10 mil mensagens podem ser muito para 2 tarefas e pouco para 40, e uma política de target tracking que mira a profundidade reage a um número que não cai na proporção das tarefas, subindo tarefa demais enquanto a fila esvazia.\n\nA recomendação da AWS para ECS é o **backlog por tarefa**: mensagens visíveis divididas pelas tarefas em execução. Esse número cai na proporção em que entram tarefas, que é o que o target tracking precisa. E a meta não é palpite, vem do SLA:\n\n**meta = latência aceitável ÷ tempo médio por mensagem**\n\nSe a nota pode esperar até 5 minutos (300 s) e cada mensagem leva 0,5 s, cada tarefa pode ter até 600 mensagens na frente. Com 12 mil na fila e 4 tarefas (3 mil por tarefa), a política sobe o serviço para perto de 20 tarefas.",
                    },
                    {
                        type: "table",
                        value: "[[\"Métrica\", \"O que mede\", \"Serve para\"], [\"ApproximateNumberOfMessagesVisible\", \"Mensagens esperando\", \"Acordar o serviço do zero; alarmes simples\"], [\"ApproximateNumberOfMessagesNotVisible\", \"Mensagens em processamento\", \"Saber se ainda há trabalho em andamento\"], [\"ApproximateAgeOfOldestMessage\", \"Espera da mensagem mais antiga\", \"Alarme de atraso contra o SLA\"], [\"Backlog por tarefa (visíveis ÷ tarefas)\", \"Fila na frente de cada tarefa\", \"Target tracking proporcional\"], [\"CPUUtilization do serviço\", \"Uso de CPU das tarefas\", \"API; quase nunca worker de fila\"]]",
                    },
                    {
                        type: "text",
                        value: "## Backlog por tarefa no CDK\n\nDuas peças viram pré-requisito. A primeira: o número de tarefas em execução (`RunningTaskCount`) vem do namespace `ECS/ContainerInsights`, então o cluster precisa do **Container Insights** ligado (`ContainerInsightsV2 = ContainerInsights.ENHANCED`), que tem custo próprio de métricas; sem ele, a expressão fica sem divisor e a política nunca age. A segunda: o construct L2 de target tracking do CDK (`ScaleToTrackCustomMetric`) só aceita métrica direta. Passe uma `MathExpression` e o `cdk synth` para com o erro `Only direct metrics are supported for Target Tracking`. O Application Auto Scaling aceita a expressão; o limite é do construct. A saída é o L1 `CfnScalingPolicy`, com as métricas e a expressão no mesmo formato do exemplo da documentação da AWS.",
                    },
                    {
                        type: "code",
                        value: "// WorkerStack.cs (trecho): backlog por tarefa com metric math, pelo L1\nvar alvo = new ScalableTarget(this, \"EscalaWorker\", new ScalableTargetProps\n{\n    ServiceNamespace = ServiceNamespace.ECS,\n    ResourceId = $\"service/{cluster.ClusterName}/{servico.ServiceName}\",\n    ScalableDimension = \"ecs:service:DesiredCount\",\n    MinCapacity = 1,\n    MaxCapacity = 20\n});\n\n// o L2 de target tracking só aceita métrica direta; a expressão vai pelo CfnScalingPolicy\nnew CfnScalingPolicy(this, \"BacklogPorTarefa\", new CfnScalingPolicyProps\n{\n    PolicyName = \"backlog-por-tarefa\",\n    PolicyType = \"TargetTrackingScaling\",\n    ScalingTargetId = alvo.ScalableTargetId,\n    TargetTrackingScalingPolicyConfiguration =\n        new CfnScalingPolicy.TargetTrackingScalingPolicyConfigurationProperty\n    {\n        TargetValue = 600, // latência aceitável / tempo por mensagem = 300 s / 0,5 s\n        ScaleOutCooldown = 60,\n        ScaleInCooldown = 300,\n        CustomizedMetricSpecification = new CfnScalingPolicy.CustomizedMetricSpecificationProperty\n        {\n            Metrics = new[]\n            {\n                Consulta(\"visiveis\", \"AWS/SQS\", \"ApproximateNumberOfMessagesVisible\", \"Sum\",\n                    (\"QueueName\", fila.QueueName)),\n                Consulta(\"tarefas\", \"ECS/ContainerInsights\", \"RunningTaskCount\", \"Average\",\n                    (\"ClusterName\", cluster.ClusterName), (\"ServiceName\", servico.ServiceName)),\n                new CfnScalingPolicy.TargetTrackingMetricDataQueryProperty\n                {\n                    Id = \"backlog\", Expression = \"visiveis / tarefas\", ReturnData = true\n                }\n            }\n        }\n    }\n});\n\n// uma métrica de entrada da expressão (ReturnData = false: só o resultado conta)\nprivate static CfnScalingPolicy.TargetTrackingMetricDataQueryProperty Consulta(string id,\n    string ns, string nome, string estatistica, params (string Nome, string Valor)[] dimensoes) => new()\n{\n    Id = id,\n    ReturnData = false,\n    MetricStat = new CfnScalingPolicy.TargetTrackingMetricStatProperty\n    {\n        Stat = estatistica,\n        Metric = new CfnScalingPolicy.TargetTrackingMetricProperty\n        {\n            Namespace = ns,\n            MetricName = nome,\n            Dimensions = dimensoes\n                .Select(d => new CfnScalingPolicy.TargetTrackingMetricDimensionProperty\n                {\n                    Name = d.Nome, Value = d.Valor\n                })\n                .ToArray()\n        }\n    }\n};",
                    },
                    {
                        type: "text",
                        value: "## Escalar para zero\n\nCom `MinCapacity = 0`, o serviço some quando não há trabalho, e o custo do worker parado vai a zero. A armadilha está no despertar: com zero tarefas, o backlog por tarefa é uma divisão por zero, e o CloudWatch descarta esse ponto. A política fica sem dado (`INSUFFICIENT_DATA`), e o Application Auto Scaling não escala sem dado. O serviço dorme para sempre, com a fila enchendo.\n\nPara acordar do zero, use uma métrica que existe sem tarefa nenhuma: a profundidade da fila, com step scaling e o primeiro degrau em **1 mensagem**. O L3 `QueueProcessingFargateService` do CDK monta fila, DLQ, serviço e escala por degraus (mais uma política de CPU), mas o primeiro degrau padrão é de **100 mensagens visíveis**: com `MinScalingCapacity = 0`, até 99 mensagens ficam paradas esperando companhia. Ajuste os degraus, como no código.\n\nEscalar para zero também cobra em latência. As métricas do SQS chegam de minuto em minuto, o alarme precisa ver o dado e a tarefa precisa subir; e, se a fila ficou mais de 6 horas sem atividade, o SQS para de publicar métricas, que na volta podem atrasar até 15 minutos. Serve para relatório da madrugada e ambiente de homologação; para nota fiscal com SLA de 5 minutos, mantenha o mínimo em 1.",
                    },
                    {
                        type: "code",
                        value: "// WorkerNoturnoStack.cs (trecho): sem mensagem, sem tarefa\nvar escala = servico.AutoScaleTaskCount(new EnableScalingProps\n{\n    MinCapacity = 0,\n    MaxCapacity = 5\n});\n\n// a profundidade da fila existe com zero tarefas; o backlog por tarefa, não\nescala.ScaleOnMetric(\"AcordaPelaFila\", new BasicStepScalingPolicyProps\n{\n    Metric = fila.MetricApproximateNumberOfMessagesVisible(new MetricOptions\n    {\n        Statistic = \"Maximum\",\n        Period = Duration.Minutes(1)\n    }),\n    ScalingSteps =\n    [\n        new ScalingInterval { Upper = 0, Change = -1 }, // fila vazia: tira uma tarefa\n        new ScalingInterval { Lower = 1, Change = +1 }, // uma mensagem já acorda\n        new ScalingInterval { Lower = 200, Change = +3 }\n    ],\n    AdjustmentType = AdjustmentType.CHANGE_IN_CAPACITY,\n    Cooldown = Duration.Minutes(3)\n});",
                    },
                    {
                        type: "text",
                        value: "## Scale-in sem perder trabalho\n\nAo reduzir tarefas, o ECS manda `SIGTERM` para o contêiner e, passado o `stopTimeout` (30 segundos por padrão, no máximo 120 no Fargate), `SIGKILL`. O host do .NET, por sua vez, espera os `BackgroundService` terminarem por até `HostOptions.ShutdownTimeout`, também de 30 segundos por padrão. A mensagem que estava em processamento e não foi apagada volta para a fila quando o visibility timeout vence: não se perde, mas atrasa e é processada de novo.\n\nTrês ajustes resolvem: o worker para de buscar no `SIGTERM` e termina só o que já tem em mãos, devolvendo o resto com `ChangeMessageVisibility` em 0; o `stopTimeout` do contêiner cobre o pior caso de uma mensagem; e o `ShutdownTimeout` do host fica um pouco abaixo dele (100 segundos para um `stopTimeout` de 120). Para trabalho mais longo que isso, a própria tarefa pode pedir proteção contra scale-in ao agente do ECS (`ECS_AGENT_URI/task-protection/v1/state`, com `ProtectionEnabled`), o que exige `ecs:UpdateTaskProtection` (e `ecs:GetTaskProtection`, para consultar o estado) na task role.",
                    },
                    {
                        type: "code",
                        value: "// ConsumidorFaturamento.cs, versão que aguenta scale-in: o SIGTERM para a busca, não o trabalho\nprotected override async Task ExecuteAsync(CancellationToken parar)\n{\n    while (!parar.IsCancellationRequested)\n    {\n        ReceiveMessageResponse resp;\n        try\n        {\n            resp = await sqs.ReceiveMessageAsync(new ReceiveMessageRequest\n            {\n                QueueUrl = _filaUrl,\n                MaxNumberOfMessages = 5,\n                WaitTimeSeconds = 20\n            }, parar);\n        }\n        catch (OperationCanceledException)\n        {\n            break; // o SIGTERM chegou durante o long polling: nada em mãos\n        }\n\n        foreach (var msg in resp.Messages ?? [])\n        {\n            if (parar.IsCancellationRequested)\n            {\n                // sem tempo para esta: devolve já, em vez de esperar o visibility timeout\n                await sqs.ChangeMessageVisibilityAsync(_filaUrl, msg.ReceiptHandle, 0);\n                continue;\n            }\n\n            await ProcessarAsync(msg.Body, CancellationToken.None); // a que está em mãos termina\n            await sqs.DeleteMessageAsync(_filaUrl, msg.ReceiptHandle);\n        }\n    }\n}\n\n// no Program.cs, o host espera os BackgroundService por até 100 s (abaixo do stopTimeout de 120 s)\n// builder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(100));",
                    },
                    {
                        type: "quote",
                        value: "Worker de fila escala pela fila: backlog por tarefa com meta tirada do SLA, profundidade da fila para acordar do zero e um desligamento que termina o que tem em mãos. O consumidor ocioso custa a tarefa ligada, não o long polling, e escalar para zero troca essa conta por minutos de espera na primeira mensagem.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que a escala por CPU, que funciona bem para a API, costuma falhar num worker de fila?",
                        difficulty: "facil",
                        options: [
                            { text: "O worker pode ficar com pouca CPU e muita fila, esperando I/O ou mensagem", isCorrect: true },
                            { text: "O .NET reserva a CPU inteira da tarefa, e a métrica fica sempre lá no alto", isCorrect: false },
                            { text: "A escala por CPU só funciona com tarefas em EC2, e não com tarefas no Fargate", isCorrect: false },
                            { text: "O ECS não publica métrica de CPU para serviço sem load balancer na frente", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O e-mail de confirmação pode esperar até 2 minutos na fila, e cada mensagem leva em média 0,2 segundo para ser processada. Qual meta de backlog por tarefa segue a recomendação da AWS?",
                        difficulty: "facil",
                        options: [
                            { text: "600 mensagens por tarefa", isCorrect: true },
                            { text: "24 mensagens por tarefa", isCorrect: false },
                            { text: "10 mensagens por tarefa", isCorrect: false },
                            { text: "120 mensagens por tarefa", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço usa só a política de target tracking pelo backlog por tarefa (visíveis divididas por `RunningTaskCount`), com `MinCapacity = 0`. Numa madrugada sem tráfego, ele vai a zero tarefas. De manhã chegam 5 mil mensagens. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O serviço sobe uma tarefa por minuto até o backlog por tarefa ficar abaixo da meta", isCorrect: false },
                            { text: "Nada: com zero tarefas, a divisão por zero descarta o ponto, e sem dado a política não age", isCorrect: true },
                            { text: "O serviço sobe direto para o máximo de tarefas, porque o backlog por tarefa vira um valor infinito", isCorrect: false },
                            { text: "O ECS ignora o mínimo zero e mantém sempre uma tarefa de reserva ligada no serviço", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Cada mensagem do worker leva até 90 segundos. No scale-in, tarefas são encerradas no meio do processamento, e as mensagens só voltam depois do visibility timeout. O `stopTimeout` do contêiner e o `ShutdownTimeout` do host estão nos valores padrão. Qual ajuste resolve?",
                        difficulty: "medio",
                        options: [
                            { text: "Chamar ChangeMessageVisibility com 0 assim que a mensagem chega, para liberar logo a tarefa", isCorrect: false },
                            { text: "Subir o visibility timeout da fila para 12 horas, para a mensagem não voltar no meio do trabalho dela", isCorrect: false },
                            { text: "Desligar o long polling, para o worker perceber o SIGTERM sem ficar 20 segundos esperando", isCorrect: false },
                            { text: "Parar de buscar no SIGTERM, subir o stopTimeout para 120 s e deixar o ShutdownTimeout pouco abaixo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um worker de relatórios usa o L3 `QueueProcessingFargateService` do CDK com os degraus de escala padrão e `MinScalingCapacity = 0`. O serviço está em zero quando chegam 40 mensagens, e nenhuma outra durante o dia. O que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "Uma tarefa sobe em poucos minutos, porque qualquer mensagem dispara o primeiro degrau", isCorrect: false },
                            { text: "A política de CPU do L3 sobe uma tarefa, porque a CPU do serviço parado conta como zero", isCorrect: false },
                            { text: "As 40 ficam paradas: o primeiro degrau padrão só sobe tarefa a partir de 100 visíveis", isCorrect: true },
                            { text: "O synth recusa `MinScalingCapacity = 0`, porque o padrão exige pelo menos uma tarefa", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Observabilidade na AWS",
        aulas: [
            {
                titulo: "CloudWatch Logs: retenção e Logs Insights",
                blocks: [
                    {
                        type: "text",
                        value: "# CloudWatch Logs: retenção e Logs Insights\n\nSegunda-feira, nove da manhã: o suporte avisa que vários pedidos falharam no sábado à noite. As tasks que rodavam no sábado já foram substituídas pelo último deploy, e não existe servidor para entrar e abrir arquivo. Tudo o que a API escreveu no stdout está agora no **CloudWatch Logs**, e o trabalho é responder três perguntas: os logs ainda estão lá, quanto eles custam e como achar a linha certa em poucos minutos.\n\n## O caminho de uma linha de log no ECS\n\nA aplicação escreve no stdout; o driver **awslogs**, declarado na task definition, envia cada linha como um **evento** para um **grupo de logs** (log group). Dentro do grupo, cada contêiner de cada task ganha o seu **log stream**, com o nome `prefixo/contêiner/id-da-task`. O stream só separa a origem. O que importa para operar é o grupo: é nele que se definem a **retenção**, a **classe** (Standard ou Infrequent Access), a chave de criptografia e quem pode ler.",
                    },
                    {
                        type: "code",
                        value: "// LogsStack.cs: o grupo nasce no CDK, com retenção e classe decididas\nvar grupo = new LogGroup(this, \"ApiLogs\", new LogGroupProps\n{\n    LogGroupName = \"/loja/producao/api\",\n    Retention = RetentionDays.ONE_MONTH,\n    LogGroupClass = LogGroupClass.STANDARD,   // não dá para trocar depois\n    RemovalPolicy = RemovalPolicy.RETAIN\n});\n\nvar task = new FargateTaskDefinition(this, \"ApiTask\", new FargateTaskDefinitionProps\n{\n    Cpu = 512,\n    MemoryLimitMiB = 1024\n});\ntask.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, \"1.4.0\"),\n    PortMappings = [new PortMapping { ContainerPort = 8080 }],\n    Logging = LogDriver.AwsLogs(new AwsLogDriverProps\n    {\n        LogGroup = grupo,\n        StreamPrefix = \"api\",                  // stream: api/api/<id da task>\n        Mode = AwsLogDriverMode.NON_BLOCKING,  // a API não trava se o envio atrasar\n        MaxBufferSize = Size.Mebibytes(25)     // buffer cheio: a linha é descartada\n    })\n});",
                    },
                    {
                        type: "text",
                        value: "Três decisões desse trecho valem para qualquer serviço:\n\n- **O grupo nasce no CDK**, e não pela opção `awslogs-create-group` do ECS. Assim a retenção e a classe ficam escritas no código, passam pela revisão do pull request e saem iguais em todos os ambientes.\n- **A classe não muda depois.** Grupo criado como Infrequent Access continua assim até ser apagado; voltar para a Standard significa criar outro grupo.\n- **Modo non-blocking com buffer explícito.** Desde 25/06/2025 o ECS usa `non-blocking` quando a task definition não diz nada: se o envio ao CloudWatch atrasar, a escrita no stdout não trava a API e as linhas esperam num buffer em memória. Quando o buffer enche, as linhas novas são **descartadas**. Sem a propriedade `Mode`, o template sai sem modo e vale o padrão do ECS (ou o da conta, se alguém definiu `defaultLogDriverMode`); escrever o modo e o tamanho no código tira essa dúvida, e o tamanho deve aguentar o pico de log da aplicação. No Fargate, o prefixo do stream (`StreamPrefix`) é obrigatório.",
                    },
                    {
                        type: "text",
                        value: "## O padrão que custa caro: retenção nenhuma\n\nGrupo de logs criado sem retenção guarda os eventos **para sempre** (o console mostra Never expire). É o padrão da API do CloudWatch Logs, do console e do `awslogs-create-group`. No CDK há duas armadilhas diferentes, conferidas com `cdk synth`: `new LogGroup(...)` sem `Retention` sai com 731 dias (dois anos), e o `LogDriver.AwsLogs` sem `LogGroup` nem `LogRetention` cria um grupo **sem retenção**, com `DeletionPolicy: Retain`, que continua existindo depois do `cdk destroy`.\n\nMuita gente deixa sem retenção porque armazenar é barato. A conta não fecha:\n\n- O armazenamento só cresce. Ele é cobrado sobre o dado comprimido (a AWS estima 0,15 byte guardado para cada byte recebido), por isso parece barato no primeiro mês; mas cada mês de log entra na fatura de todos os meses seguintes, inclusive o grupo do serviço que foi desligado no ano passado.\n- Log carrega dado pessoal (e-mail, CPF, IP). Guardar para sempre o que a LGPD manda guardar só pelo tempo necessário é risco jurídico, não só custo.\n\nQuando a retenção vence, o CloudWatch marca os eventos para exclusão: a remoção costuma levar até 72 horas, mas eles deixam de contar no armazenamento. Desde julho de 2026 existe também o **intelligent tiering** de armazenamento, ligado na conta: dado sem acesso há 30 dias passa para um nível mais barato, e sem acesso há 90 dias para outro mais barato ainda. Ele baixa o preço do que fica guardado; não decide o que já deveria ter sido apagado.",
                    },
                    {
                        type: "table",
                        value: "[[\"Classe do grupo (outubro de 2026)\", \"Standard\", \"Infrequent Access\"], [\"Ingestão em us-east-1\", \"0,50 dólar por GB\", \"0,25 dólar por GB\"], [\"Ingestão em sa-east-1 (São Paulo)\", \"0,90 dólar por GB\", \"0,45 dólar por GB\"], [\"Armazenamento e consulta\", \"mesmo preço nas duas\", \"mesmo preço nas duas\"], [\"Logs Insights\", \"todos os comandos\", \"quase todos (sem pattern, diff e unmask)\"], [\"Metric filter e métricas EMF\", \"sim\", \"não\"], [\"Live Tail, subscription filter e índice de campo\", \"sim\", \"não\"]]",
                    },
                    {
                        type: "text",
                        value: "## Log que o Logs Insights entende\n\nO Logs Insights descobre sozinho os campos de qualquer evento que seja um objeto JSON, até 200 campos por evento, com ponto para entrar em objeto aninhado (`State.ClienteId`). O formato do log da API decide, então, se a investigação leva dois minutos ou uma tarde. O formatador padrão do console do ASP.NET Core escreve cada entrada em **duas linhas** quando o stdout não é um terminal (nível e categoria numa, mensagem na outra), e a stack trace de uma exceção em outras tantas; o awslogs transforma cada linha num evento separado. Num teste com duas entradas, uma delas com exceção, o formatador padrão gerou seis linhas (seis eventos) e nenhum campo; o JSON gerou duas linhas, com `LogLevel`, `Category`, `Message`, os valores do message template dentro de `State` e a stack trace inteira em `Exception`.\n\nO erro que estraga o JSON é interpolar a mensagem (`logger.LogInformation($\"Pedido {id} criado\")`): o texto chega, mas `State.PedidoId` não existe, e a busca vira expressão regular sobre a mensagem inteira.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\n// um objeto JSON por linha: o awslogs transforma cada linha em um evento\nbuilder.Logging.ClearProviders();\nbuilder.Logging.AddJsonConsole(o =>\n{\n    o.UseUtcTimestamp = true;\n    o.TimestampFormat = \"yyyy-MM-ddTHH:mm:ss.fffZ\";\n});\n\n// uma linha real no stdout, que vira um evento no CloudWatch:\n// {\"Timestamp\":\"2026-10-20T13:56:26.669Z\",\"EventId\":0,\"LogLevel\":\"Information\",\"Category\":\"Program\",\"Message\":\"Pedido 01a15999-619d-7832-87cb-734f3bbe4abf criado para o cliente c-8812\",\"State\":{\"PedidoId\":\"01a15999-619d-7832-87cb-734f3bbe4abf\",\"ClienteId\":\"c-8812\",\"{OriginalFormat}\":\"Pedido {PedidoId} criado para o cliente {ClienteId}\"}}",
                    },
                    {
                        type: "code",
                        value: "# Logs Insights QL no grupo /loja/producao/api (cada bloco é uma consulta)\n\n# os erros mais recentes, com a exceção inteira\nfields @timestamp, Category, Message, Exception\n| filter LogLevel = \"Error\"\n| sort @timestamp desc\n| limit 50\n\n# a história de um cliente (campo aninhado, com ponto)\nfields @timestamp, Message\n| filter State.ClienteId = \"c-8812\"\n| sort @timestamp asc\n\n# quando o problema começou: erros por minuto\nfilter LogLevel = \"Error\"\n| stats count(*) as erros by bin(1m)",
                    },
                    {
                        type: "text",
                        value: "## Quanto custa perguntar\n\nO Logs Insights cobra pelo volume **descomprimido** que a consulta lê, em qualquer linguagem: em outubro de 2026, 0,005 dólar por GB em us-east-1 e 0,009 em São Paulo. Uma consulta de 30 dias sobre um grupo que recebe 10 GB por dia lê 300 GB e custa 1,50 dólar em us-east-1, a cada execução, inclusive quando um painel a repete a cada atualização. O que reduz a conta é ler menos: intervalo de tempo curto, só os grupos necessários e, em grupos Standard, **índices de campo** (field indexes), que deixam a consulta pular eventos que não têm o valor procurado.\n\nAlém da linguagem própria (Logs Insights QL), o serviço aceita **OpenSearch PPL** e **OpenSearch SQL**, que permite JOIN entre grupos. Em junho de 2026 o console passou a reunir Logs Insights, Live Tail e Contributor Insights numa tela chamada **Log Analytics**, com o mesmo preço; em julho, a linguagem própria ganhou 25 comandos e funções, como `outlier` e `sessionize`.",
                    },
                    {
                        type: "quote",
                        value: "Log no ECS é decisão de infraestrutura: grupo criado no CDK com retenção e classe escolhidas, uma linha JSON por evento e consultas que leem só o intervalo de que você precisa.",
                    },
                ],
                questions: [
                    {
                        statement: "A task definition usa `awslogs-create-group` e nenhuma outra configuração de retenção. Por quanto tempo o grupo de logs criado guarda os eventos?",
                        difficulty: "facil",
                        options: [
                            { text: "Por dois anos, o mesmo padrão do LogGroup criado pelo CDK", isCorrect: false },
                            { text: "Até a task parar, quando o log stream dela é apagado junto", isCorrect: false },
                            { text: "Por 30 dias, a retenção padrão dos grupos criados pelo ECS", isCorrect: false },
                            { text: "Para sempre, até alguém definir uma retenção para o grupo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No Fargate com o driver awslogs, a que corresponde um log stream dentro do grupo de logs da API?",
                        difficulty: "facil",
                        options: [
                            { text: "A um dia inteiro de logs do serviço, rotacionado sempre à meia-noite UTC", isCorrect: false },
                            { text: "A uma cópia do grupo em cada zona de disponibilidade do serviço", isCorrect: false },
                            { text: "A um nível de log, com Error e Information em streams separados", isCorrect: false },
                            { text: "A um contêiner de uma task, no formato prefixo/contêiner/id-da-task", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A equipe criou o grupo da API na classe Infrequent Access para pagar metade na ingestão. Uma semana depois, o alarme baseado em metric filter nunca recebeu dados e as métricas EMF da aplicação não aparecem. O que explica e como resolver?",
                        difficulty: "medio",
                        options: [
                            { text: "Essa classe não roda metric filter nem extrai EMF, e não muda depois: é preciso um grupo Standard novo", isCorrect: true },
                            { text: "O metric filter leva sete dias para começar a publicar nessa classe, e o EMF exige alarme de resolução alta", isCorrect: false },
                            { text: "Falta permissão de metric filter na task role, e o EMF exige também uma chamada a PutMetricData", isCorrect: false },
                            { text: "Essa classe só aceita consulta em PPL, e o filtro e o EMF precisam ser reescritos nessa linguagem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um grupo em us-east-1 recebe 10 GB de log por dia. Pelo preço de outubro de 2026 (0,005 dólar por GB lido), quanto custa, aproximadamente, uma consulta do Logs Insights sobre os últimos 30 dias desse grupo?",
                        difficulty: "medio",
                        options: [
                            { text: "0,23 dólar, porque a consulta lê o dado comprimido guardado", isCorrect: false },
                            { text: "Nada, porque consulta feita no console do CloudWatch é grátis", isCorrect: false },
                            { text: "1,50 dólar, porque a consulta lê os 300 GB descomprimidos", isCorrect: true },
                            { text: "0,05 dólar, porque só o resultado devolvido entra na conta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API em ASP.NET Core usa o logging padrão, sem configurar formatador, e roda no Fargate com awslogs. No Logs Insights, `filter LogLevel = \"Error\"` não devolve nada, e cada exceção aparece quebrada em vários eventos. Qual mudança resolve os dois problemas de uma vez?",
                        difficulty: "dificil",
                        options: [
                            { text: "Mudar o driver para o modo `blocking`: o envio fica síncrono e o awslogs para de quebrar cada entrada", isCorrect: false },
                            { text: "Criar um índice de campo para `LogLevel`: a consulta passa a achar o campo e junta os eventos quebrados", isCorrect: false },
                            { text: "Usar `awslogs-multiline-pattern`: as linhas da exceção se juntam num evento e o campo `LogLevel` passa a ser descoberto", isCorrect: false },
                            { text: "Usar `AddJsonConsole()`: cada entrada vira uma linha JSON, com `LogLevel` como campo e a stack trace em `Exception`", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Métricas e alarmes no CloudWatch",
                blocks: [
                    {
                        type: "text",
                        value: "# Métricas e alarmes no CloudWatch\n\nNuma sexta à noite a API passou vinte minutos devolvendo erro 500, e a equipe soube pelo cliente, no sábado. O dado para perceber isso existia: o load balancer publica a contagem de respostas 5xx a cada minuto, de graça. Faltava alguém olhando, e esse alguém é um **alarme**.\n\n## O que já chega pronto\n\nOs serviços da AWS publicam métricas no CloudWatch sem nenhuma linha de código sua. Cada métrica é identificada por **namespace** (`AWS/ApplicationELB`, `AWS/ECS`, `AWS/RDS`, `AWS/SQS`), **nome** e **dimensões**, que são pares de nome e valor como `ServiceName=loja-api`. Uma regra pega muita gente: o CloudWatch trata **cada combinação de dimensões como uma métrica diferente**. Pedir a métrica com menos dimensões do que ela foi publicada não soma o resto, devolve outra métrica, que não existe. Para ter a visão agregada é preciso publicar também o conjunto menor ou usar uma consulta do Metrics Insights.",
                    },
                    {
                        type: "table",
                        value: "[[\"Componente\", \"Métrica (namespace)\", \"Estatística\", \"Pergunta que responde\"], [\"Load balancer\", \"HTTPCode_Target_5XX_Count (AWS/ApplicationELB)\", \"Sum\", \"A API está devolvendo erro?\"], [\"Load balancer\", \"TargetResponseTime (AWS/ApplicationELB)\", \"p99\", \"Quanto esperam os usuários mais lentos, em segundos?\"], [\"Load balancer\", \"UnHealthyHostCount (AWS/ApplicationELB)\", \"Minimum\", \"Alguma task está falhando no health check?\"], [\"Serviço ECS\", \"CPUUtilization e MemoryUtilization (AWS/ECS)\", \"Average e Maximum\", \"As tasks estão perto do que foi reservado?\"], [\"Banco RDS\", \"FreeStorageSpace e DatabaseConnections (AWS/RDS)\", \"Minimum e Maximum\", \"O disco vai acabar? As conexões estão no teto?\"], [\"Fila SQS\", \"ApproximateAgeOfOldestMessage (AWS/SQS)\", \"Maximum\", \"O worker está consumindo ou parou?\"]]",
                    },
                    {
                        type: "text",
                        value: "## Anatomia de um alarme\n\nUm alarme olha uma métrica a cada **período** (1 minuto, 5 minutos) com uma **estatística**, compara com um **limite** e fica em um de três estados: `OK`, `ALARM` ou `INSUFFICIENT_DATA`. Três decisões separam o alarme útil do que vira ruído:\n\n- **M de N**: `EvaluationPeriods = 5` com `DatapointsToAlarm = 3` dispara quando 3 dos últimos 5 períodos passam do limite, seguidos ou não. Um pico isolado de um minuto não acorda ninguém.\n- **Dado ausente**: o load balancer não publica ponto quando não há tráfego, o que é comum de madrugada. O tratamento padrão (`missing`) leva o alarme a `INSUFFICIENT_DATA` quando todos os pontos da janela faltam; para contagem de erro, `NOT_BREACHING` diz que ausência de dado não é problema. Para algo que deveria publicar sempre, como um heartbeat, `BREACHING`.\n- **Estatística certa**: latência com Average esconde a cauda, então use percentil (p99). Nas contagens de resposta do load balancer, Average, Minimum e Maximum dão sempre 1; o número que interessa é a Sum.\n\nA ação mais comum é publicar num tópico **SNS**, que entrega por e-mail, para um canal de chat ou para a ferramenta de plantão. Em outubro de 2026, alarme de resolução padrão custa 0,10 dólar por métrica por mês em us-east-1 (0,135 em São Paulo), e os 10 primeiros estão no nível gratuito.",
                    },
                    {
                        type: "code",
                        value: "// AlarmesStack.cs: quem é avisado e de quê\nvar plantao = new Topic(this, \"Plantao\");\nplantao.AddSubscription(new EmailSubscription(\"plantao@loja.example\"));\nvar avisar = new SnsAction(plantao);\n\n// 5xx devolvido pela API (o alvo), não pelo load balancer\nvar erros = new Alarm(this, \"Api5xx\", new AlarmProps\n{\n    Metric = alvo.Metrics.HttpCodeTarget(HttpCodeTarget.TARGET_5XX_COUNT,\n        new MetricOptions { Period = Duration.Minutes(1), Statistic = Stats.SUM }),\n    Threshold = 10,\n    EvaluationPeriods = 5,\n    DatapointsToAlarm = 3,                             // 3 de 5 minutos\n    ComparisonOperator = ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,\n    TreatMissingData = TreatMissingData.NOT_BREACHING  // minuto sem tráfego não tem ponto\n});\nerros.AddAlarmAction(avisar);\nerros.AddOkAction(avisar);\n\nvar lenta = new Alarm(this, \"ApiP99\", new AlarmProps\n{\n    Metric = alvo.Metrics.TargetResponseTime(\n        new MetricOptions { Period = Duration.Minutes(5), Statistic = Stats.Percentile(99) }),\n    Threshold = 1.5,                                   // segundos\n    EvaluationPeriods = 3,\n    ComparisonOperator = ComparisonOperator.GREATER_THAN_THRESHOLD\n});\nlenta.AddAlarmAction(avisar);\n\nvar parada = fila.MetricApproximateAgeOfOldestMessage(\n        new MetricOptions { Period = Duration.Minutes(1), Statistic = Stats.MAXIMUM })\n    .CreateAlarm(this, \"FilaParada\", new CreateAlarmOptions\n    {\n        Threshold = 300,                               // 5 minutos sem consumir\n        EvaluationPeriods = 5\n    });\nparada.AddAlarmAction(avisar);",
                    },
                    {
                        type: "text",
                        value: "## Métrica personalizada: três caminhos\n\nO load balancer não sabe quantos pedidos foram criados nem quanto a gravação demorou. Isso é métrica de negócio, e quem publica é a aplicação. Em outubro de 2026 há três caminhos:\n\n- **PutMetricData**: chamada de API pelo SDK (`PutMetricDataAsync` no AWS SDK for .NET). Cada combinação de dimensões vira uma métrica cobrada por mês (0,30 dólar nas primeiras 10 mil, rateado por hora) e cada chamada entra na conta de requisições de API do CloudWatch (o primeiro milhão do mês é gratuito). Chamar dentro de cada requisição HTTP põe latência e risco de throttling no caminho do usuário; quem usa esse caminho agrega e manda em lote, até 1.000 métricas por chamada.\n- **Embedded Metric Format (EMF)**: a aplicação escreve no stdout uma linha JSON com o bloco `_aws`, o awslogs leva a linha ao CloudWatch Logs e o CloudWatch extrai a métrica sozinho, sem nenhuma chamada de rede no caminho da requisição. Paga a ingestão da linha como log e cada métrica extraída como métrica personalizada; o que não é dimensão fica só no log, consultável no Logs Insights.\n- **Métricas OpenTelemetry**: disponíveis de forma geral desde 16/06/2026. O `Meter` do .NET exporta por OTLP para o agente na task, que entrega ao endpoint OTLP do CloudWatch. Cobra por GB ingerido, sem preço por métrica, guarda 15 meses e consulta em PromQL. A AWS indica esse caminho para carga nova; alarmes e painéis do caminho clássico precisam ser refeitos em PromQL na migração.",
                    },
                    {
                        type: "code",
                        value: "// MetricaEmf.cs: uma linha JSON no stdout que o CloudWatch transforma em métrica\nusing System.Text.Json;\n\npublic static class MetricaEmf\n{\n    public static string PedidoCriado(string operacao, double ms, Guid pedidoId, string clienteId)\n    {\n        var evento = new Dictionary<string, object>\n        {\n            [\"_aws\"] = new\n            {\n                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),\n                CloudWatchMetrics = new[]\n                {\n                    new\n                    {\n                        Namespace = \"Loja/Pedidos\",\n                        Dimensions = new[] { new[] { \"Servico\", \"Operacao\" } },\n                        Metrics = new[]\n                        {\n                            new { Name = \"PedidosCriados\", Unit = \"Count\" },\n                            new { Name = \"TempoDeGravacao\", Unit = \"Milliseconds\" }\n                        }\n                    }\n                }\n            },\n            [\"Servico\"] = \"loja-api\",      // dimensão: poucos valores\n            [\"Operacao\"] = operacao,        // dimensão: poucos valores\n            [\"PedidosCriados\"] = 1,\n            [\"TempoDeGravacao\"] = Math.Round(ms, 1),\n            [\"PedidoId\"] = pedidoId,        // propriedade: fica só no log\n            [\"ClienteId\"] = clienteId       // propriedade: buscável no Logs Insights\n        };\n        return JsonSerializer.Serialize(evento);\n    }\n}\n\n// a linha que sai no stdout (real, de uma execução local):\n// {\"_aws\":{\"Timestamp\":1792504586670,\"CloudWatchMetrics\":[{\"Namespace\":\"Loja/Pedidos\",\"Dimensions\":[[\"Servico\",\"Operacao\"]],\"Metrics\":[{\"Name\":\"PedidosCriados\",\"Unit\":\"Count\"},{\"Name\":\"TempoDeGravacao\",\"Unit\":\"Milliseconds\"}]}]},\"Servico\":\"loja-api\",\"Operacao\":\"CriarPedido\",\"PedidosCriados\":1,\"TempoDeGravacao\":15.5,\"PedidoId\":\"01a15999-619d-7832-87cb-734f3bbe4abf\",\"ClienteId\":\"c-8812\"}",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\", \"PutMetricData\", \"EMF\", \"Métricas OpenTelemetry\"], [\"Como sai da aplicação\", \"chamada de API pelo SDK\", \"linha JSON no stdout\", \"exportador OTLP, via agente\"], [\"Cobrança principal\", \"por métrica por mês e por requisição\", \"ingestão do log e por métrica por mês\", \"por GB ingerido\"], [\"Dimensão de alta cardinalidade\", \"cada combinação vira métrica cobrada\", \"cada combinação vira métrica cobrada\", \"custo cresce com o volume de pontos\"], [\"Impacto na requisição\", \"chamada de rede (por isso, lote)\", \"escrita local no stdout\", \"exportação em segundo plano\"], [\"Consulta e alarme\", \"console clássico e alarme comum\", \"console clássico e alarme comum\", \"PromQL e alarme com PromQL\"], [\"Onde se encaixa\", \"job, script, volume baixo\", \"serviço em contêiner com awslogs\", \"carga nova com OpenTelemetry\"]]",
                    },
                    {
                        type: "text",
                        value: "## O alarme que nunca sai de INSUFFICIENT_DATA\n\nA linha EMF acima publica `TempoDeGravacao` com o conjunto `[Servico, Operacao]`. Um alarme criado na mesma métrica só com `Servico=loja-api` olha uma combinação que nunca foi publicada e fica em `INSUFFICIENT_DATA` para sempre, sem erro nenhum no deploy. Quem quer as duas visões declara os dois conjuntos na linha (`[[\"Servico\"], [\"Servico\", \"Operacao\"]]`), sabendo que cada conjunto gera métricas cobradas.\n\nO outro erro clássico é o contrário: pôr `ClienteId` ou `PedidoId` como dimensão. Na linha do exemplo eles são **propriedades**: ficam no log, aparecem no Logs Insights (`filter ClienteId = \"c-8812\"`) e não viram métrica. O alarme sobre a métrica EMF repete o conjunto inteiro de dimensões:",
                    },
                    {
                        type: "code",
                        value: "var gravacao = new Metric(new MetricProps\n{\n    Namespace = \"Loja/Pedidos\",\n    MetricName = \"TempoDeGravacao\",\n    DimensionsMap = new Dictionary<string, string>\n    {\n        [\"Servico\"] = \"loja-api\",\n        [\"Operacao\"] = \"CriarPedido\"   // o conjunto inteiro, igual ao da linha EMF\n    },\n    Statistic = Stats.Percentile(99),\n    Period = Duration.Minutes(5)\n});\nnew Alarm(this, \"GravacaoLenta\", new AlarmProps\n{\n    Metric = gravacao,\n    Threshold = 800,                   // milissegundos\n    EvaluationPeriods = 3\n}).AddAlarmAction(avisar);",
                    },
                    {
                        type: "quote",
                        value: "Alarme útil olha o sintoma certo com a estatística certa e sabe o que fazer com dado ausente; métrica personalizada barata tem poucas dimensões, e o que identifica um cliente ou um pedido fica no log.",
                    },
                ],
                questions: [
                    {
                        statement: "Para alarmar quando a própria API devolve erro 500, qual métrica do load balancer e qual estatística fazem sentido?",
                        difficulty: "facil",
                        options: [
                            { text: "`HTTPCode_ELB_5XX_Count` com a estatística Average", isCorrect: false },
                            { text: "`HTTPCode_Target_5XX_Count` com a estatística Sum", isCorrect: true },
                            { text: "`RequestCount` com a estatística SampleCount", isCorrect: false },
                            { text: "`TargetResponseTime` com a estatística Maximum", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um alarme de contagem de erros tem `EvaluationPeriods = 5`, `DatapointsToAlarm = 3` e período de 1 minuto. Quando ele entra em ALARM?",
                        difficulty: "facil",
                        options: [
                            { text: "Quando 5 minutos seguidos passam do limite, e então avisa 3 vezes", isCorrect: false },
                            { text: "Quando o limite é ultrapassado 3 vezes dentro de um mesmo minuto", isCorrect: false },
                            { text: "Quando a soma dos 5 minutos passa de 3 vezes o limite configurado", isCorrect: false },
                            { text: "Quando 3 dos últimos 5 minutos passam do limite, seguidos ou não", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A API publica `TempoDeGravacao` por EMF com o conjunto de dimensões `[[\"Servico\", \"Operacao\"]]`. Um alarme foi criado na mesma métrica e no mesmo namespace, mas só com `Servico=loja-api`, e está em INSUFFICIENT_DATA desde o deploy. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "Métrica EMF não aceita alarme direto, e é preciso criar antes um metric filter no grupo", isCorrect: false },
                            { text: "O CloudWatch soma as operações, mas só 24 horas depois da primeira linha EMF publicada", isCorrect: false },
                            { text: "Para o CloudWatch, a combinação só com Servico é outra métrica, que nunca foi publicada", isCorrect: true },
                            { text: "O alarme precisa de resolução alta, porque o EMF publica um ponto a cada segundo no CloudWatch", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API no Fargate, com awslogs ligado, recebe 300 requisições por segundo. O time quer medir o tempo de gravação de cada pedido sem pôr nenhuma chamada de rede no caminho da requisição. Qual caminho clássico atende?",
                        difficulty: "medio",
                        options: [
                            { text: "Metric filter contando a palavra Pedido no log, que mede o tempo de cada gravação", isCorrect: false },
                            { text: "PutMetricData a cada requisição, porque cada chamada já agrega os valores no servidor", isCorrect: false },
                            { text: "EMF: uma linha JSON no stdout por pedido, e o CloudWatch extrai a métrica dos logs", isCorrect: true },
                            { text: "Alarme direto no grupo de logs, que calcula o tempo pelo horário de cada linha", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um alarme sobre `HTTPCode_Target_5XX_Count` (Sum, 1 minuto, 3 de 5) foi criado sem definir o tratamento de dado ausente. De madrugada, sem tráfego, o load balancer não publica pontos. O que acontece e qual é o ajuste adequado?",
                        difficulty: "dificil",
                        options: [
                            { text: "Vai para INSUFFICIENT_DATA; a correção é trocar Sum por Average, que publica zero quando não há tráfego", isCorrect: false },
                            { text: "Vai para INSUFFICIENT_DATA com a janela sem pontos; com NOT_BREACHING, a ausência conta como normal e fica em OK", isCorrect: true },
                            { text: "Fica em OK, porque o padrão já trata ausência como zero; não há ajuste a fazer para esse tipo de métrica", isCorrect: false },
                            { text: "Vai para ALARM, porque ponto ausente conta como acima do limite; com IGNORE, ele passa a manter sempre o último estado", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Traces com OpenTelemetry e X-Ray",
                blocks: [
                    {
                        type: "text",
                        value: "# Traces com OpenTelemetry e X-Ray\n\nO alarme de latência disparou: o p99 da criação de pedido foi de 300 milissegundos para 4 segundos. A requisição passa pela API, pelo PostgreSQL no RDS e publica numa fila. A métrica diz **que** está lento; o trace diz **onde**. Na AWS, o destino dos traces é o **X-Ray**, que aparece no console do CloudWatch nas telas de traces e no mapa de traces (Trace Map).\n\n## O que mudou em 2026\n\nEm **25/02/2026** os SDKs do X-Ray e o daemon do X-Ray entraram em **manutenção**: só correção de segurança, nenhuma instrumentação nova. Não há data de fim publicada: um anúncio de 2025 chegou a falar em 25/02/2027, e a AWS retirou essa data. Aplicação que já usa continua funcionando e o X-Ray continua recebendo esses dados, mas código novo não deve nascer com o SDK do X-Ray. A recomendação da AWS é instrumentar com **OpenTelemetry** (o SDK da comunidade ou o **ADOT**, a distribuição da AWS) e coletar com um agente compatível com OpenTelemetry. O console continua mostrando os traces do mesmo jeito.",
                    },
                    {
                        type: "table",
                        value: "[[\"Antes (SDK do X-Ray, em manutenção)\", \"Agora (OpenTelemetry)\"], [\"`AWSXRayRecorder` e `app.UseXRay(...)`\", \"`AddOpenTelemetry().WithTracing(...)` com a instrumentação do ASP.NET Core\"], [\"segmento e subsegmento\", \"span de servidor vira segmento; os demais spans viram subsegmentos\"], [\"annotation (indexada) e metadata\", \"atributo; os listados em `aws.xray.annotations` viram annotation\"], [\"daemon do X-Ray, UDP na porta 2000\", \"agente do CloudWatch ou Collector, OTLP nas portas 4317 e 4318\"], [\"cabeçalho `X-Amzn-Trace-Id`\", \"W3C `traceparent`; propagador do X-Ray quando um serviço da AWS exige o cabeçalho\"], [\"regras de amostragem do X-Ray\", \"sampler do OpenTelemetry; as regras do X-Ray pelo ADOT .NET ou pelo pacote `OpenTelemetry.Sampler.AWS`, ainda alfa\"]]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r\n        .AddService(\"loja-api\", serviceVersion: \"1.4.0\")\n        .AddAWSECSDetector())              // cluster, task e log group como atributos\n    .WithTracing(t => t\n        .AddSource(Telemetria.Fonte.Name)\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation()\n        .AddAWSInstrumentation()            // chamadas do AWS SDK (SQS, S3...)\n        .AddOtlpExporter())                 // destino vem de OTEL_EXPORTER_OTLP_*\n    .WithMetrics(m => m\n        .AddMeter(Telemetria.Medidor.Name)\n        .AddAspNetCoreInstrumentation()\n        .AddRuntimeInstrumentation()\n        .AddOtlpExporter());",
                    },
                    {
                        type: "text",
                        value: "O que cada pacote faz, nas versões que compilaram este exemplo (OpenTelemetry 1.20, outubro de 2026):\n\n- `OpenTelemetry.Extensions.Hosting` e `OpenTelemetry.Exporter.OpenTelemetryProtocol`: o SDK e o exportador OTLP. Sem endpoint no código, o exportador lê `OTEL_EXPORTER_OTLP_ENDPOINT` e `OTEL_EXPORTER_OTLP_PROTOCOL`, e a mesma imagem serve em qualquer ambiente.\n- `OpenTelemetry.Resources.AWS`: `AddAWSECSDetector()` acrescenta ao recurso o ARN da task e do cluster e o nome do grupo de logs (`aws.log.group.names`), que o CloudWatch usa para ligar trace e log.\n- `OpenTelemetry.Instrumentation.AWS`: spans para as chamadas do AWS SDK (SQS, S3, Secrets Manager), já compatível com o AWS SDK for .NET v4.\n- `OpenTelemetry.Extensions.AWS`: o propagador do X-Ray (`AWSXRayPropagator`), para quando a chamada atravessa um serviço da AWS que só entende `X-Amzn-Trace-Id`.\n\nCuidado com tutorial antigo. O pacote `OpenTelemetry.Contrib.Extensions.AWSXRay` está marcado como legado no NuGet (a última versão é de 2022) e foi substituído pelo `OpenTelemetry.Extensions.AWS`. E a chamada `AddXRayTraceId()` existia porque o X-Ray só aceitava ID de trace no formato dele; desde outubro de 2023 ele aceita o ID W3C quando o dado chega pelo agente do CloudWatch (1.300030.0 ou mais novo) ou pelo ADOT Collector (0.34.0 ou mais novo).",
                    },
                    {
                        type: "code",
                        value: "// Telemetria.cs: uma fonte de spans e um medidor para o serviço inteiro\nusing System.Diagnostics;\nusing System.Diagnostics.Metrics;\n\npublic static class Telemetria\n{\n    public static readonly ActivitySource Fonte = new(\"Loja.Pedidos\");\n    public static readonly Meter Medidor = new(\"Loja.Pedidos\");\n\n    public static readonly Counter<long> PedidosCriados =\n        Medidor.CreateCounter<long>(\"loja.pedidos.criados\", unit: \"{pedido}\");\n}\n\n// Program.cs: o endpoint com um span manual\napp.MapPost(\"/pedidos\", async (NovoPedido pedido, ILogger<Program> logger) =>\n{\n    using var atividade = Telemetria.Fonte.StartActivity(\"GravarPedido\");\n    atividade?.SetTag(\"pedido.canal\", pedido.Canal);\n    atividade?.SetTag(\"cliente.id\", pedido.ClienteId);\n    // no X-Ray, atributo vira metadata; os listados aqui viram annotation (filtráveis)\n    atividade?.SetTag(\"aws.xray.annotations\", new[] { \"pedido.canal\" });\n\n    var inicio = Stopwatch.GetTimestamp();\n    var id = Guid.CreateVersion7();\n    await Task.Delay(15); // gravação no banco\n    var ms = Stopwatch.GetElapsedTime(inicio).TotalMilliseconds;\n\n    Telemetria.PedidosCriados.Add(1, new KeyValuePair<string, object?>(\"canal\", pedido.Canal));\n    logger.LogInformation(\"Pedido {PedidoId} criado para o cliente {ClienteId}\", id, pedido.ClienteId);\n    Console.Out.WriteLine(MetricaEmf.PedidoCriado(\"CriarPedido\", ms, id, pedido.ClienteId));\n\n    return TypedResults.Created($\"/pedidos/{id}\", new { id });\n});",
                    },
                    {
                        type: "text",
                        value: "## Para onde o trace vai\n\nNo Fargate, os contêineres de uma task compartilham a rede (modo awsvpc), então a API exporta para `localhost` e um **sidecar** na mesma task recebe e envia para a AWS. Em outubro de 2026 há três desenhos:\n\n- **Agente do CloudWatch como sidecar**, o caminho que a AWS recomenda para a maioria dos casos. Ele é um OpenTelemetry Collector mantido pela AWS: desde a versão 1.300070.0 (agosto de 2026), a seção `opentelemetry` da configuração recebe OTLP e encaminha traces, métricas e logs aos endpoints OTLP do CloudWatch, assinando cada envio com a credencial da task. O mesmo agente também é a base do Application Signals.\n- **ADOT Collector ou OpenTelemetry Collector** como sidecar: quando a empresa já padronizou um Collector próprio, manda para mais de um destino ou precisa de um componente que o agente não traz. Exporta com o `awsxray` ou com o `otlphttp` mais a extensão `sigv4auth`.\n- **Sem coletor**, com o ADOT .NET falando direto com `https://xray.<região>.amazonaws.com/v1/traces` (`OTEL_AWS_SIG_V4_ENABLED=true`): no .NET, só traces, sem compressão e, se ninguém mexer, com amostragem de 100%.\n\nO endpoint OTLP de traces exige o **Transaction Search** ligado na conta antes do primeiro envio.",
                    },
                    {
                        type: "code",
                        value: "// TracesStack.cs: agente do CloudWatch como sidecar, recebendo OTLP em localhost\nvar task = new FargateTaskDefinition(this, \"ApiTask\", new FargateTaskDefinitionProps\n{\n    Cpu = 512,\n    MemoryLimitMiB = 1024\n});\n\nvar agente = task.AddContainer(\"cwagent\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromRegistry(\n        \"public.ecr.aws/cloudwatch-agent/cloudwatch-agent:1.300073.0b1828\"),\n    Essential = false,                    // se o agente cair, a API continua no ar\n    MemoryReservationMiB = 64,\n    Environment = new Dictionary<string, string>\n    {\n        [\"CW_CONFIG_CONTENT\"] = \"\"\"\n            {\"opentelemetry\":{\"collect\":{\"otlp\":{\n              \"grpc_endpoint\":\"0.0.0.0:4317\",\"http_endpoint\":\"0.0.0.0:4318\"}}}}\n            \"\"\"\n    },\n    Logging = LogDriver.AwsLogs(new AwsLogDriverProps\n    {\n        StreamPrefix = \"cwagent\",\n        LogRetention = RetentionDays.ONE_WEEK\n    })\n});\n\nvar api = task.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, \"1.4.0\"),\n    PortMappings = [new PortMapping { ContainerPort = 8080 }],\n    Environment = new Dictionary<string, string>\n    {\n        [\"OTEL_EXPORTER_OTLP_ENDPOINT\"] = \"http://localhost:4318\", // base: o SDK põe /v1/traces\n        [\"OTEL_EXPORTER_OTLP_PROTOCOL\"] = \"http/protobuf\",\n        [\"OTEL_TRACES_SAMPLER\"] = \"parentbased_traceidratio\",\n        [\"OTEL_TRACES_SAMPLER_ARG\"] = \"0.10\"                       // 10% das requisições\n    }\n});\napi.AddContainerDependencies(new ContainerDependency\n{\n    Container = agente,\n    Condition = ContainerDependencyCondition.START\n});\n\n// quem assina e envia é o agente, com a task role\ntask.TaskRole.AddManagedPolicy(\n    ManagedPolicy.FromAwsManagedPolicyName(\"CloudWatchAgentServerPolicy\"));",
                    },
                    {
                        type: "text",
                        value: "## Transaction Search e os erros que somem com o trace\n\nO **Transaction Search** é configuração da conta inteira, feita uma vez por região: cada span que chega passa a ser gravado como log estruturado no grupo `aws/spans`, e 1% deles vira resumo de trace indexado sem custo extra. O modelo de cobrança muda: em vez de pagar por trace gravado no X-Ray (5 dólares por milhão, com 100 mil grátis por mês, guardados por 30 dias), paga-se por GB de span ingerido (0,35 dólar por GB nos primeiros 10 TB em outubro de 2026) e 0,75 dólar por milhão de spans indexados além do 1%. Liga-se no console do CloudWatch ou com `aws xray update-trace-segment-destination --destination CloudWatchLogs`, depois de uma resource policy que deixe o X-Ray escrever no grupo.\n\nOs erros que mais fazem o trace sumir sem nenhum aviso na API:\n\n- **Permissão no lugar errado**: quem assina e envia é o agente, com a **task role** (`CloudWatchAgentServerPolicy`). Na execution role não adianta, porque ela serve ao ECS para baixar imagem e entregar log, não aos contêineres.\n- **Protocolo e porta trocados**: o exportador do .NET usa gRPC na 4317 por padrão. Com `http/protobuf`, a porta é a 4318, e a variável `OTEL_EXPORTER_OTLP_ENDPOINT` é a **base**: o SDK acrescenta `/v1/traces`. Endpoint escrito no código vai com o caminho completo.\n- **Sampler no código**: `SetSampler(...)` faz o SDK ignorar `OTEL_TRACES_SAMPLER`. Se a amostragem deve mudar por ambiente, deixe para a variável, como no trecho acima.",
                    },
                    {
                        type: "quote",
                        value: "Trace na AWS em 2026 é OpenTelemetry na aplicação, um agente na mesma task para assinar e entregar, e o X-Ray como destino; o SDK do X-Ray só fica onde ainda não deu tempo de migrar.",
                    },
                ],
                questions: [
                    {
                        statement: "Desde 25/02/2026, qual é a situação dos SDKs e do daemon do X-Ray?",
                        difficulty: "facil",
                        options: [
                            { text: "Estáveis, e o OpenTelemetry só é indicado para as linguagens sem SDK do X-Ray", isCorrect: false },
                            { text: "Descontinuados, e o X-Ray deixou de aceitar os dados enviados por eles", isCorrect: false },
                            { text: "Substituídos pelo ADOT Collector, que virou obrigatório em toda conta", isCorrect: false },
                            { text: "Em manutenção, só com correção de segurança e sem data de fim publicada", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Na tradução que a AWS faz de spans do OpenTelemetry para o X-Ray, o que vira segmento?",
                        difficulty: "facil",
                        options: [
                            { text: "O span de maior duração no trace, qualquer que seja o tipo", isCorrect: false },
                            { text: "Cada span criado à mão com `ActivitySource.StartActivity`", isCorrect: false },
                            { text: "O span do tipo servidor, como o da requisição HTTP recebida", isCorrect: true },
                            { text: "Cada atributo listado em `aws.xray.annotations` no span atual", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A task tem a API e o agente do CloudWatch como sidecar, configurado para receber OTLP nas portas padrão. A API usa `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` e `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`. Nenhum trace chega. Qual é o erro mais provável?",
                        difficulty: "medio",
                        options: [
                            { text: "No Fargate a API deve usar o IP da task, e localhost não chega ao agente", isCorrect: false },
                            { text: "A porta 4317 é a do gRPC; com http/protobuf o agente escuta na 4318", isCorrect: true },
                            { text: "Faltou o `/v1/traces` na variável, que precisa do caminho completo", isCorrect: false },
                            { text: "O agente só recebe traces na porta 2000, a antiga porta do daemon", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O agente do CloudWatch roda como sidecar e recebe os spans da API, mas o log dele mostra AccessDenied ao enviar. A política `CloudWatchAgentServerPolicy` foi anexada à execution role da task. O que corrigir?",
                        difficulty: "medio",
                        options: [
                            { text: "Anexar a política ao usuário do deploy, que assina os envios do agente", isCorrect: false },
                            { text: "Anexar a política à task role, que é a credencial dos contêineres", isCorrect: true },
                            { text: "Liberar a porta 443 de entrada no security group para o endpoint", isCorrect: false },
                            { text: "Trocar o agente pelo daemon do X-Ray, que envia sem pedir permissão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de ligar o Transaction Search, uma API .NET passou a mandar traces direto ao endpoint OTLP do X-Ray com o ADOT .NET (`OTEL_AWS_SIG_V4_ENABLED=true`), sem coletor e sem configurar amostragem. Na fatura seguinte, a ingestão de spans disparou. Qual é a explicação e o ajuste?",
                        difficulty: "dificil",
                        options: [
                            { text: "O Transaction Search indexa 100% dos spans que chegam, por padrão; reduzir a indexação para 1% no console", isCorrect: false },
                            { text: "O endpoint OTLP cobra por requisição recebida; juntar mais spans em cada lote no exportador do .NET", isCorrect: false },
                            { text: "Sem coletor os spans vão sem compressão; ligar o gzip no exportador do ADOT .NET resolve tudo", isCorrect: false },
                            { text: "Sem coletor o padrão é `parentbased_always_on` (100%); usar `parentbased_traceidratio` com uma fração", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Container Insights e Application Signals",
                blocks: [
                    {
                        type: "text",
                        value: "# Container Insights e Application Signals\n\nDuas perguntas chegam ao plantão, e as métricas das aulas anteriores não respondem nenhuma: \"por que tasks da API morreram por falta de memória de madrugada, se a memória média do serviço ficou em 60%?\" e \"qual operação da API piorou, e por causa de qual dependência?\". A primeira é sobre **contêiner**; a segunda, sobre **serviço**. A AWS tem uma visão pronta para cada uma, sem você montar painel: o **Container Insights** e o **Application Signals**.\n\n## Container Insights no ECS\n\nA `MemoryUtilization` do `AWS/ECS` é a média do serviço: uma task a 95% e outra a 25% aparecem como 60%. O Container Insights publica no namespace `ECS/ContainerInsights` métricas por cluster, serviço e família de task e, na versão com **observabilidade aprimorada** (enhanced observability, de dezembro de 2024), também por **task individual** (dimensão `TaskId`) e por **contêiner**: `TaskMemoryUtilization`, `ContainerCpuUtilization`, `ContainerMemoryUtilization`, `RestartCount` (para contêiner com política de reinício), `UnHealthyContainerHealthStatus`, `EphemeralStorageUtilized`. No Fargate não há agente para instalar: liga-se no cluster, e a própria AWS recomenda a versão aprimorada.",
                    },
                    {
                        type: "code",
                        value: "// InsightsStack.cs: o cluster nasce com Container Insights aprimorado\nvar cluster = new Cluster(this, \"Cluster\", new ClusterProps\n{\n    Vpc = vpc,\n    ContainerInsightsV2 = ContainerInsights.ENHANCED   // métricas por task e por contêiner\n});\n\n// cluster que já existe, pelo terminal:\n// aws ecs update-cluster-settings --cluster loja --settings name=containerInsights,value=enhanced\n// padrão para clusters novos da conta (sem --principal-arn, vale só para quem rodou):\n// aws ecs put-account-setting --name containerInsights --value enhanced --principal-arn arn:aws:iam::111122223333:root",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\", \"Container Insights\", \"Com observabilidade aprimorada\"], [\"Granularidade\", \"cluster, serviço e família de task\", \"também cada task e cada contêiner\"], [\"Métricas a mais\", \"nenhuma\", \"CPU e memória por contêiner, RestartCount, saúde do contêiner\"], [\"Cobrança (outubro de 2026)\", \"métrica personalizada (0,30 dólar) mais ingestão de log\", \"0,07 dólar por métrica por mês, rateado por hora, mais o armazenamento do log\"], [\"Exemplo da AWS: 1 cluster, 5 serviços, 20 tasks, 50 contêineres\", \"183 métricas, cerca de 56 dólares por mês\", \"2.259 métricas, cerca de 158 dólares por mês\"], [\"Onde faz sentido\", \"ambiente de teste, orçamento apertado\", \"produção, quando o problema mora numa task ou num contêiner\"]]",
                    },
                    {
                        type: "text",
                        value: "No CDK, a propriedade antiga `ContainerInsights = true` está obsoleta e só liga a versão padrão; a atual é `ContainerInsightsV2`, com `ENABLED`, `ENHANCED` ou `DISABLED`. Pela conta, o `put-account-setting` muda o padrão só para clusters **novos**, e sem `--principal-arn` vale apenas para a identidade que rodou o comando: é comum alguém ligar, criar o cluster com outra role e não entender por que nada apareceu.\n\n## Application Signals: a visão de serviço\n\nO Application Signals é o APM pronto do CloudWatch. Ele descobre os serviços sozinho e mostra, por serviço e por **operação** (`POST /pedidos`), volume, latência, falhas (5xx) e erros (4xx); mostra as **dependências** (o RDS, o SQS, outra API) com as mesmas medidas, um mapa da aplicação e **SLOs** com orçamento de erro, tudo ligado aos traces e aos logs. O que ele exige:\n\n1. **Ligar o serviço** uma vez por conta e região, no console ou com o recurso `AWS::ApplicationSignals::Discovery`, o que cria a role vinculada ao serviço `AWSServiceRoleForCloudWatchApplicationSignals`.\n2. O **agente do CloudWatch** com a seção `application_signals`, como sidecar no Fargate, recebendo na porta 4316 (traces e métricas) e na 2000 (regras de amostragem).\n3. A aplicação instrumentada com o **ADOT**. No .NET, a instrumentação automática entra por um contêiner `init`, que copia os arquivos para um volume, e a API sobe com o profiler do CLR apontando para eles.\n4. A task role com `CloudWatchAgentServerPolicy`.",
                    },
                    {
                        type: "code",
                        value: "// using Volume = Amazon.CDK.AWS.ECS.Volume;  (o namespace do EC2 também tem um Volume)\n// InsightsStack.cs: Application Signals numa API .NET no Fargate\nnew CfnDiscovery(this, \"AppSignals\");   // liga o serviço na conta e região\n\nvar task = new FargateTaskDefinition(this, \"ApiTask\", new FargateTaskDefinitionProps\n{\n    Cpu = 512,\n    MemoryLimitMiB = 1024\n});\nconst string auto = \"/otel-auto-instrumentation\";\ntask.AddVolume(new Volume { Name = \"otel-auto\" });\n\n// 1. copia o ADOT .NET para o volume e termina\nvar init = task.AddContainer(\"init\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromRegistry(\n        \"public.ecr.aws/aws-observability/adot-autoinstrumentation-dotnet:v1.15.0\"),\n    Essential = false,\n    MemoryReservationMiB = 32,\n    Command = [\"cp\", \"-a\", \"autoinstrumentation/.\", auto]\n});\ninit.AddMountPoints(new MountPoint { SourceVolume = \"otel-auto\", ContainerPath = auto, ReadOnly = false });\n\n// 2. o agente com a seção application_signals (portas 4316 e 2000)\ntask.AddContainer(\"ecs-cwagent\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromRegistry(\n        \"public.ecr.aws/cloudwatch-agent/cloudwatch-agent:1.300073.0b1828\"),\n    Essential = false,\n    MemoryReservationMiB = 64,\n    Environment = new Dictionary<string, string>\n    {\n        [\"CW_CONFIG_CONTENT\"] = \"\"\"\n            {\"traces\":{\"traces_collected\":{\"application_signals\":{}}},\n             \"logs\":{\"metrics_collected\":{\"application_signals\":{}}}}\n            \"\"\"\n    }\n});\n\n// 3. a API sobe com o profiler do CLR carregando a instrumentação\nvar api = task.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, \"1.4.0\"),\n    PortMappings = [new PortMapping { ContainerPort = 8080 }],\n    Environment = new Dictionary<string, string>\n    {\n        [\"OTEL_RESOURCE_ATTRIBUTES\"] = \"service.name=loja-api,deployment.environment=producao\",\n        [\"OTEL_AWS_APPLICATION_SIGNALS_ENABLED\"] = \"true\",\n        [\"OTEL_AWS_APPLICATION_SIGNALS_EXPORTER_ENDPOINT\"] = \"http://localhost:4316/v1/metrics\",\n        [\"OTEL_EXPORTER_OTLP_PROTOCOL\"] = \"http/protobuf\",\n        [\"OTEL_EXPORTER_OTLP_TRACES_ENDPOINT\"] = \"http://localhost:4316/v1/traces\",\n        [\"OTEL_TRACES_SAMPLER\"] = \"xray\",\n        [\"OTEL_TRACES_SAMPLER_ARG\"] = \"endpoint=http://localhost:2000\",\n        [\"OTEL_PROPAGATORS\"] = \"tracecontext,baggage,b3,xray\",\n        [\"OTEL_METRICS_EXPORTER\"] = \"none\",\n        [\"OTEL_LOGS_EXPORTER\"] = \"none\",\n        [\"OTEL_DOTNET_AUTO_HOME\"] = auto,\n        [\"OTEL_DOTNET_AUTO_PLUGINS\"] =\n            \"AWS.Distro.OpenTelemetry.AutoInstrumentation.Plugin, AWS.Distro.OpenTelemetry.AutoInstrumentation\",\n        [\"CORECLR_ENABLE_PROFILING\"] = \"1\",\n        [\"CORECLR_PROFILER\"] = \"{918728DD-259F-4A6A-AC2B-B85E1B658318}\",\n        [\"CORECLR_PROFILER_PATH\"] = $\"{auto}/linux-x64/OpenTelemetry.AutoInstrumentation.Native.so\",\n        [\"DOTNET_ADDITIONAL_DEPS\"] = $\"{auto}/AdditionalDeps\",\n        [\"DOTNET_SHARED_STORE\"] = $\"{auto}/store\",\n        [\"DOTNET_STARTUP_HOOKS\"] = $\"{auto}/net/OpenTelemetry.AutoInstrumentation.StartupHook.dll\"\n    }\n});\napi.AddMountPoints(new MountPoint { SourceVolume = \"otel-auto\", ContainerPath = auto, ReadOnly = false });\napi.AddContainerDependencies(new ContainerDependency\n{\n    Container = init,\n    Condition = ContainerDependencyCondition.SUCCESS\n});\ntask.TaskRole.AddManagedPolicy(\n    ManagedPolicy.FromAwsManagedPolicyName(\"CloudWatchAgentServerPolicy\"));",
                    },
                    {
                        type: "text",
                        value: "Três detalhes derrubam essa configuração:\n\n- **Versão do ADOT .NET e do AWS SDK.** A 1.15.0, de agosto de 2026, passou a usar o AWS SDK for .NET v4 e deixou de suportar o v3; as anteriores exigiam o v3. Se a API usa o v4, que é o atual, a imagem do `init` precisa ser a 1.15.0 ou mais nova. Se você encontrar na documentação o aviso de que o ADOT .NET só funciona com o v3, confira a versão: o aviso vale para as anteriores à 1.15.0. O suporte a .NET 10 chegou na 1.12.0.\n- **Instrumentação em dobro.** Fique com um TracerProvider só: o .NET não impede um segundo, mas os dois escutam as mesmas fontes e cada span sai duas vezes, com amostragem misturada. Com a instrumentação automática ligada, o `AddOpenTelemetry().WithTracing(...)` da aula anterior sai do Program.cs; os spans manuais de `ActivitySource` continuam e entram pela variável `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`.\n- **Plataforma da imagem.** O caminho `linux-x64` do profiler é o do Linux x64 com glibc, como as imagens oficiais do ASP.NET baseadas em Debian; em imagem Alpine o diretório é `linux-musl-x64`, e em ARM64 o caminho também muda.\n\nExiste também uma construção em alfa, `ApplicationSignalsIntegration` (pacote `Amazon.CDK.AWS.ApplicationSignals.Alpha`), que monta o `init`, o volume e as variáveis. Por ser alfa, a API pode mudar entre versões do CDK, e a versão explícita acima mostra o que ela faz por baixo.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pergunta no plantão\", \"Onde olhar primeiro\"], [\"Qual task está sem memória ou reiniciando contêiner?\", \"Container Insights aprimorado, por task e por contêiner\"], [\"Qual operação da API piorou, e desde quando?\", \"Application Signals, latência e falhas por operação\"], [\"A lentidão vem da API ou do banco?\", \"Application Signals (dependências) e o trace de uma requisição lenta\"], [\"Qual foi a mensagem de erro exata?\", \"Logs Insights no grupo de logs da API\"], [\"Estamos cumprindo o combinado com o negócio?\", \"SLO no Application Signals\"]]",
                    },
                    {
                        type: "text",
                        value: "## Visão pronta não sai de graça\n\nEm outubro de 2026, o Application Signals cobra por **sinal**: cada requisição recebida por um serviço conta um sinal, cada chamada que ele faz a uma dependência conta outro, e cada SLO gera dois sinais por período avaliado. São 1,50 dólar por milhão nos primeiros 100 milhões e 0,75 nos 900 milhões seguintes, tanto em us-east-1 quanto em São Paulo. Uma API com 50 requisições por segundo e duas chamadas a dependências em cada uma gera cerca de 390 milhões de sinais por mês: 150 dólares pelos primeiros 100 milhões e cerca de 217 pelo resto. Ligue onde a pergunta de serviço é feita de verdade e acompanhe o custo do primeiro mês antes de estender para todos os serviços.",
                    },
                    {
                        type: "quote",
                        value: "Container Insights aprimorado responde o que acontece com cada task e contêiner; Application Signals responde como cada serviço e operação está para quem usa. As duas visões são prontas, mas cobram por métrica ou por sinal.",
                    },
                ],
                questions: [
                    {
                        statement: "A `MemoryUtilization` do serviço no `AWS/ECS` mostra média de 60%, mas tasks estão morrendo por falta de memória. O que mostra qual task está estourando?",
                        difficulty: "facil",
                        options: [
                            { text: "Um alarme de MemoryUtilization com Sum, que soma a memória das tasks do serviço", isCorrect: false },
                            { text: "O log do agente do CloudWatch, que registra a memória de cada processo da task", isCorrect: false },
                            { text: "O Container Insights aprimorado, que publica memória por task e por contêiner", isCorrect: true },
                            { text: "O TargetResponseTime do load balancer, separado por zona de disponibilidade", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No Fargate, o que é preciso para ligar o Container Insights com observabilidade aprimorada num cluster novo criado pelo CDK?",
                        difficulty: "facil",
                        options: [
                            { text: "Definir `ContainerInsightsV2 = ContainerInsights.ENHANCED` no cluster", isCorrect: true },
                            { text: "Criar um grupo Infrequent Access para receber os dados de desempenho", isCorrect: false },
                            { text: "Pôr o agente do CloudWatch como sidecar em todas as tasks do cluster", isCorrect: false },
                            { text: "Ligar `ContainerInsights = true`, a propriedade atual do cluster no CDK", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API .NET recebeu o contêiner `init` do ADOT, as variáveis do profiler e o agente com `application_signals`, e a task role tem a política certa. Mesmo após horas de tráfego, o console do Application Signals não mostra nenhum serviço. A conta nunca usou o recurso. O que costuma faltar?",
                        difficulty: "medio",
                        options: [
                            { text: "Criar um SLO para cada operação, porque o serviço só aparece após o primeiro", isCorrect: false },
                            { text: "Trocar a imagem da API pela base da AWS, a única que aceita o profiler do ADOT", isCorrect: false },
                            { text: "Ligar o Application Signals na conta e região, o que cria a role vinculada", isCorrect: true },
                            { text: "Ligar o Container Insights aprimorado, de que a descoberta de serviços depende", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API já tem `AddOpenTelemetry().WithTracing(...)` no Program.cs, exportando para um Collector. O time liga o Application Signals com a instrumentação automática do ADOT .NET na mesma API. Qual é o cuidado principal?",
                        difficulty: "medio",
                        options: [
                            { text: "Nenhum, porque os dois pipelines se somam e o X-Ray descarta os spans repetidos", isCorrect: false },
                            { text: "Desligar a amostragem no código, porque o Application Signals exige 100% dos traces", isCorrect: false },
                            { text: "Ter um TracerProvider só: a configuração manual sai, ou cada span sai em dobro", isCorrect: true },
                            { text: "Trocar o exportador do código para gRPC, porque a automática só usa HTTP na 4316", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API recebe em média 20 requisições por segundo e faz uma chamada ao banco em cada uma. Com o Application Signals ligado, sem SLO e fora de qualquer gratuidade, quantos sinais ela gera em 30 dias e quanto custam pela tabela de outubro de 2026 (1,50 dólar por milhão nos primeiros 100 milhões, 0,75 nos 900 milhões seguintes)?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cerca de 207 milhões de sinais, por volta de 230 dólares", isCorrect: false },
                            { text: "Cerca de 104 milhões de sinais, por volta de 156 dólares", isCorrect: false },
                            { text: "Cerca de 52 milhões de sinais, por volta de 78 dólares", isCorrect: false },
                            { text: "Cerca de 104 milhões de sinais, por volta de 153 dólares", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "O custo da observabilidade na AWS",
                blocks: [
                    {
                        type: "text",
                        value: "# O custo da observabilidade na AWS\n\nO primeiro mês com tudo ligado fecha, e a linha do CloudWatch na fatura é maior que a do Fargate. Não é raro: observabilidade cobra por volume (GB de log, métrica por mês, span por GB), e volume cresce sozinho quando o tráfego cresce, quando alguém sobe o nível de log para Debug numa sexta-feira ou quando um rótulo novo multiplica as métricas. A boa notícia é que quase todo o custo vem de quatro alavancas que você controla no código e no CDK: **volume de log**, **cardinalidade de métrica**, **amostragem de trace** e **retenção por ambiente**.\n\nPara achar a alavanca certa, abra o Cost Explorer filtrando o serviço CloudWatch e agrupando por tipo de uso. Os nomes trazem prefixos de região e de serviço (`USE1-`, `SAE1-`, `CW:`), mas o miolo diz tudo: `DataProcessing-Bytes` é ingestão de log, `TimedStorage-ByteHrs` é armazenamento, `DataScanned-Bytes` é consulta do Logs Insights e `MetricMonitorUsage` é métrica personalizada.",
                    },
                    {
                        type: "table",
                        value: "[[\"Item (preço de lista de outubro de 2026)\", \"us-east-1\", \"sa-east-1 (São Paulo)\"], [\"Ingestão de log, classe Standard\", \"0,50 dólar por GB\", \"0,90 dólar por GB\"], [\"Ingestão de log, classe Infrequent Access\", \"0,25 dólar por GB\", \"0,45 dólar por GB\"], [\"Armazenamento de log (medido comprimido)\", \"0,03 dólar por GB por mês\", \"0,0408 dólar por GB por mês\"], [\"Consulta no Logs Insights\", \"0,005 dólar por GB lido\", \"0,009 dólar por GB lido\"], [\"Métrica personalizada clássica (primeiras 10 mil)\", \"0,30 dólar por métrica por mês\", \"0,30 dólar por métrica por mês\"], [\"Métricas OpenTelemetry\", \"0,50 dólar por GB\", \"0,50 dólar por GB\"], [\"Alarme de resolução padrão\", \"0,10 dólar por mês\", \"0,135 dólar por mês\"], [\"Spans com Transaction Search (primeiros 10 TB)\", \"0,35 dólar por GB\", \"0,35 dólar por GB\"], [\"Application Signals (primeiros 100 milhões)\", \"1,50 dólar por milhão de sinais\", \"1,50 dólar por milhão de sinais\"]]",
                    },
                    {
                        type: "text",
                        value: "## Volume de log: a conta que ninguém faz antes\n\nFaça a conta com o tráfego real. Uma API com 50 requisições por segundo, que escreve 3 linhas de 400 bytes por requisição, gera 60 KB por segundo: cerca de 5,2 GB por dia e 155 GB por mês, ou 78 dólares de ingestão em us-east-1 e 140 em São Paulo, todo mês, antes de qualquer consulta. Ligar Debug em produção acende a escrita de bibliotecas inteiras (ASP.NET Core, HttpClient, EF Core) e pode multiplicar esse volume várias vezes. O que mais funciona:\n\n- **Nível por ambiente, fora do código**: `Logging__LogLevel__Default` na task definition muda o nível sem gerar imagem nova. Em produção, Information; Debug só durante a investigação, e de volta depois.\n- **Não logar o que não ajuda**: corpo inteiro de requisição, a mesma exceção registrada em três camadas, sucesso de rotina que nenhuma consulta procura.\n- **Classe Infrequent Access** para log volumoso que quase ninguém consulta e que não alimenta alarme, como auditoria: metade do preço na ingestão, sem metric filter, EMF nem Live Tail.\n- **Linha EMF conta como log**: a métrica de negócio também paga a ingestão da linha.",
                    },
                    {
                        type: "text",
                        value: "## Cardinalidade: onde a métrica vira fatura\n\nNo modelo clássico (PutMetricData e EMF), **cada combinação de dimensões é uma métrica cobrada**: 0,30 dólar por mês nas primeiras 10 mil, 0,10 nas 240 mil seguintes e 0,05 nas 750 mil depois delas, rateado pelas horas em que a métrica recebeu dado. Uma métrica com as dimensões Servico e Operacao, em 2 serviços e 15 operações, são 30 métricas: 9 dólares por mês. Agora alguém acrescenta `ClienteId` às dimensões, com 20 mil clientes: são até 600 mil combinações e, no pior caso, com todas recebendo dado o mês inteiro, cerca de 44 mil dólares por mês. O valor de alta cardinalidade vai como **propriedade** na linha EMF: fica no log, aparece no Logs Insights e não vira métrica.\n\nNas **métricas OpenTelemetry** (disponíveis desde 16/06/2026) não há cobrança por série, só por GB ingerido. Isso não torna a cardinalidade grátis, porque cada série manda um ponto a cada exportação. No exemplo da própria AWS, 100 instâncias com 50 métricas, 500 bytes por ponto a cada 60 segundos, dão 108 GB por mês: 54 dólares. O volume cresce na proporção do número de séries; dez vezes mais séries, dez vezes mais GB.",
                    },
                    {
                        type: "code",
                        value: "// PerfilDeObservabilidade.cs, no projeto do CDK\n// o quanto cada ambiente guarda, amostra e mede\npublic sealed record PerfilDeObservabilidade(\n    RetentionDays RetencaoDaApi,\n    RetentionDays RetencaoDaAuditoria,\n    ContainerInsights Insights,\n    string NivelDeLog,\n    string FracaoDeTraces)\n{\n    public static PerfilDeObservabilidade Para(string ambiente) => ambiente switch\n    {\n        \"dev\"      => new(RetentionDays.THREE_DAYS, RetentionDays.ONE_WEEK,\n                          ContainerInsights.DISABLED, \"Debug\", \"1.0\"),\n        \"homolog\"  => new(RetentionDays.ONE_WEEK, RetentionDays.ONE_MONTH,\n                          ContainerInsights.ENABLED, \"Information\", \"0.5\"),\n        \"producao\" => new(RetentionDays.ONE_MONTH, RetentionDays.ONE_YEAR,\n                          ContainerInsights.ENHANCED, \"Information\", \"0.10\"),\n        _ => throw new ArgumentException($\"ambiente desconhecido: {ambiente}\")\n    };\n}\n\n// AmbienteStack.cs: o mesmo código, com o custo decidido por ambiente\nvar perfil = PerfilDeObservabilidade.Para(ambiente);   // cdk deploy -c ambiente=producao\n\nvar cluster = new Cluster(this, \"Cluster\", new ClusterProps\n{\n    Vpc = vpc,\n    ContainerInsightsV2 = perfil.Insights\n});\nvar logsDaApi = new LogGroup(this, \"ApiLogs\", new LogGroupProps\n{\n    LogGroupName = $\"/loja/{ambiente}/api\",\n    Retention = perfil.RetencaoDaApi\n});\n// auditoria: muito volume, consulta rara, nenhum alarme em cima\nvar auditoria = new LogGroup(this, \"Auditoria\", new LogGroupProps\n{\n    LogGroupName = $\"/loja/{ambiente}/auditoria\",\n    Retention = perfil.RetencaoDaAuditoria,\n    LogGroupClass = LogGroupClass.INFREQUENT_ACCESS\n});\n\nvar task = new FargateTaskDefinition(this, \"ApiTask\");\ntask.AddContainer(\"api\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, \"1.4.0\"),\n    Environment = new Dictionary<string, string>\n    {\n        [\"Logging__LogLevel__Default\"] = perfil.NivelDeLog,\n        [\"OTEL_TRACES_SAMPLER\"] = \"parentbased_traceidratio\",\n        [\"OTEL_TRACES_SAMPLER_ARG\"] = perfil.FracaoDeTraces\n    },\n    Logging = LogDriver.AwsLogs(new AwsLogDriverProps { LogGroup = logsDaApi, StreamPrefix = \"api\" })\n});",
                    },
                    {
                        type: "text",
                        value: "## Amostragem: quantos traces guardar\n\nTrace é o sinal mais caro por requisição, e quase nenhuma investigação precisa de 100% deles. As referências da AWS em outubro de 2026:\n\n- A regra padrão de amostragem do X-Ray guarda a primeira requisição de cada segundo e 5% das demais.\n- No envio direto ao endpoint OTLP, sem coletor, o SDK do ADOT usa `parentbased_always_on` (100%), e a própria AWS avisa que isso pode dar até 20 vezes o volume de uma amostragem de 5%.\n- `parentbased_traceidratio` com 0,10 guarda 10% dos traces que começam no serviço e respeita a decisão de quem chamou: o trace não fica pela metade entre a API e o worker.\n- Erro e requisição lenta são os traces que mais interessam, e são poucos. Guardar todos eles exige decidir depois de ver o trace inteiro (tail sampling), o que pede um Collector entre a API e a AWS; o ADOT Collector traz esse processador.\n\nCom o Transaction Search ligado, cada span que chega é gravado e cobrado por GB. A amostragem é a válvula, e ela fica na aplicação ou no coletor.",
                    },
                    {
                        type: "text",
                        value: "## Retenção por ambiente\n\nLog de desenvolvimento serve a quem está programando hoje: três dias bastam. Homologação precisa cobrir o ciclo de testes, uma semana. Produção precisa cobrir o tempo entre o incidente e a investigação, incluindo o postmortem: 30 dias é um ponto de partida comum. Exigência legal de guardar por anos não pede a classe Standard: exporte para o S3 com ciclo de vida, ou use um grupo Infrequent Access com retenção longa, como a auditoria do exemplo. O intelligent tiering de armazenamento (julho de 2026) barateia o que ninguém acessa há 30 ou 90 dias (0,018 e 0,006 dólar por GB por mês em us-east-1, contra 0,03), mas é desconto no armazenamento, não substituto da retenção nem da ingestão, que costuma ser a maior parte da conta.\n\nAntes de fechar cada mês, confira três coisas: grupos sem retenção (o console mostra Never expire), métricas personalizadas com dimensão de alta cardinalidade e o Debug esquecido ligado em produção.",
                    },
                    {
                        type: "quote",
                        value: "O custo da observabilidade é decidido no código e no CDK: quanto log cada ambiente escreve e guarda, quais dimensões viram métrica e qual fração dos traces vale a pena manter.",
                    },
                ],
                questions: [
                    {
                        statement: "Na fatura do CloudWatch, a que se refere o tipo de uso `DataProcessing-Bytes`, que aparece com o prefixo da região?",
                        difficulty: "facil",
                        options: [
                            { text: "À consulta do Logs Insights, cobrada por GB lido na busca", isCorrect: false },
                            { text: "À ingestão de log, cobrada por GB que chega aos grupos", isCorrect: true },
                            { text: "Ao armazenamento de log, cobrado por GB guardado por mês", isCorrect: false },
                            { text: "Às métricas personalizadas, cobradas por métrica por mês", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa métrica publicada por EMF, qual é o lugar certo para um identificador de alta cardinalidade, como `ClienteId`?",
                        difficulty: "facil",
                        options: [
                            { text: "Namespace, porque namespaces novos não contam como métricas novas", isCorrect: false },
                            { text: "Dimensão, porque o CloudWatch junta sozinho os valores raros numa métrica só", isCorrect: false },
                            { text: "Nome da métrica, uma por cliente, para ter um alarme por cliente", isCorrect: false },
                            { text: "Propriedade da linha, fora das dimensões: fica no log e no Logs Insights", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma API recebe 100 requisições por segundo e escreve 2 linhas de 500 bytes por requisição. Aproximadamente, quanto ela ingere por mês e quanto isso custa em us-east-1 na classe Standard, a 0,50 dólar por GB?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 260 GB, perto de 7,80 dólares por mês", isCorrect: false },
                            { text: "Cerca de 260 GB, perto de 130 dólares por mês", isCorrect: true },
                            { text: "Cerca de 26 GB, perto de 13 dólares por mês", isCorrect: false },
                            { text: "Cerca de 8,6 GB, perto de 4,30 dólares por mês", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A task definition de produção define `OTEL_TRACES_SAMPLER=parentbased_traceidratio` e `OTEL_TRACES_SAMPLER_ARG=0.10`, mas a ingestão de spans continua igual à de 100%. O Program.cs chama `.SetSampler(new AlwaysOnSampler())` dentro do `WithTracing`. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "`SetSampler` no código vale sempre e faz o SDK ignorar a variável de ambiente", isCorrect: true },
                            { text: "A variável só vale para o agente do CloudWatch, que amostra depois de receber", isCorrect: false },
                            { text: "A fração 0,10 vale por task; com dez tasks, a soma volta a dar os 100%", isCorrect: false },
                            { text: "O SDK do .NET não lê `OTEL_TRACES_SAMPLER`; amostragem só existe no código", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma métrica EMF tem as dimensões Servico e Operacao, com 2 serviços e 15 operações em cada serviço. Alguém acrescenta `ClienteId` ao mesmo conjunto de dimensões, com 20 mil clientes ativos em todas as operações, e cada combinação recebe dado em todas as horas do mês (o pior caso). Pela tabela de outubro de 2026 (0,30 dólar por métrica nas primeiras 10 mil, 0,10 nas 240 mil seguintes, 0,05 nas 750 mil seguintes), qual é a ordem de grandeza do custo?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cerca de 180 mil dólares por mês, com 600 mil métricas a 0,30 dólar cada", isCorrect: false },
                            { text: "Cerca de 4 mil dólares por mês, porque só os 20 mil clientes viram métricas", isCorrect: false },
                            { text: "Cerca de 44 mil dólares por mês, com 600 mil combinações virando métricas", isCorrect: true },
                            { text: "Cerca de 9 dólares por mês, porque dimensão nova não muda a contagem", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Serverless e entrega contínua",
        aulas: [
            {
                titulo: "Lambda com .NET 10: quando faz sentido, cold start e Native AOT",
                blocks: [
                    {
                        type: "text",
                        value: "# Lambda com .NET 10: quando faz sentido, cold start e Native AOT\n\nA API e o worker da loja rodam em contêiner no ECS, observados e com deploy seguro. Mas há trabalho que não combina com uma tarefa ligada o dia inteiro: o time comercial sobe uma planilha de preços no S3 duas vezes por semana, o provedor de pagamentos dispara webhooks em rajadas, um relatório roda uma vez por noite. Manter contêiner ocioso à espera desse tipo de evento é pagar por hora para não fazer nada.\n\nA **AWS Lambda** roda o seu código em resposta a um evento e cobra por invocação e por duração. Em outubro de 2026, na us-east-1, são 0,20 dólar por milhão de requisições e 0,0000166667 dólar por GB-segundo em x86 (0,0000133334 em arm64, 20% a menos), com 1 milhão de requisições e 400 mil GB-segundos por mês na camada gratuita. Desde 1º de agosto de 2025 a AWS cobra também a fase de inicialização das funções .zip em runtime gerenciado, que antes saía de graça: cold start agora custa latência e dinheiro.\n\n## O modelo de execução\n\n- Cada invocação roda num **ambiente de execução** isolado. O primeiro uso de um ambiente passa pela fase **INIT** (baixar o pacote, subir o runtime, rodar o seu código de inicialização); as invocações seguintes reaproveitam o ambiente pronto.\n- No modelo padrão, um ambiente atende **uma invocação por vez**: cem requisições simultâneas pedem cem ambientes. O limite padrão é de 1.000 execuções simultâneas por região, somando todas as funções da conta.\n- Cada invocação dura no máximo 15 minutos. A memória vai de 128 MB a 10.240 MB, e a CPU cresce junto: com 1.769 MB a função tem o equivalente a uma vCPU.\n- O runtime gerenciado do .NET 10 é o `dotnet10`, lançado em janeiro de 2026, com descontinuação prevista para 14/11/2028. O `dotnet8` é descontinuado na Lambda em 10/11/2026: função nova já nasce no `dotnet10`.\n\nPara carga constante e alta, existe desde o re:Invent de 2025 o Lambda Managed Instances: a função roda em instâncias EC2 da sua conta, geridas pela Lambda, com várias invocações por ambiente, pelo preço da EC2 mais 15% de taxa de gerenciamento. No sistema da loja, a carga constante já tem casa: o ECS.",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\", \"Lambda\", \"Contêiner no ECS (Fargate)\"], [\"Perfil de tráfego\", \"Rajadas e ociosidade: sem evento, sem custo de computação\", \"Carga constante: a tarefa custa por hora, com ou sem requisição\"], [\"Duração do trabalho\", \"Até 15 minutos por invocação\", \"Sem limite: processo longo e job demorado\"], [\"Conexão longa\", \"Não serve: o ambiente congela entre uma invocação e outra\", \"Natural: o worker segura a conexão com o broker o dia todo\"], [\"Concorrência\", \"Um evento por ambiente; escala sozinha até o limite da conta\", \"Várias requisições por tarefa; escala por métrica (CPU, fila)\"], [\"Partida\", \"Cold start no primeiro uso de cada ambiente\", \"Tarefa já aquecida, latência estável\"], [\"Banco relacional\", \"Cada ambiente abre o próprio pool; precisa de teto de concorrência\", \"Pool por tarefa, com número de tarefas conhecido\"]]",
                    },
                    {
                        type: "text",
                        value: "## A forma da função em .NET\n\nHá dois modelos de handler, e a escolha muda o deploy:\n\n- **Biblioteca de classes**: você escreve uma classe e um método, e o runtime `dotnet10` carrega o assembly e chama o método. O handler configurado na função é a string `Assembly::Namespace.Classe::Metodo`. É o modelo do template `lambda.EmptyFunction` (pacote `Amazon.Lambda.Templates`), que já liga `PublishReadyToRun` para reduzir o JIT na partida.\n- **Assembly executável**: o seu `Program.cs` tem o `Main` e sobe o cliente do runtime com `LambdaBootstrapBuilder` (pacote `Amazon.Lambda.RuntimeSupport`). O handler é só o nome do assembly. É o modelo obrigatório para Native AOT e para as funções de arquivo único do .NET 10 (`dotnet new lambda.FileBased`), e é o que o ASP.NET Core hospedado da próxima aula usa.\n\nOs pacotes de base são `Amazon.Lambda.Core` (o `ILambdaContext` e o logger), `Amazon.Lambda.Serialization.SystemTextJson` (o serializador) e um pacote de evento por origem, como `Amazon.Lambda.S3Events` ou `Amazon.Lambda.SQSEvents`. Em maio de 2026 todos ganharam versão maior nova (o Core foi para a 3.x) para atualizar os frameworks-alvo: entrou o .NET 10, saíram alvos antigos como .NET Core 3.1 e .NET 6. A forma de escrever o handler não mudou.\n\nO exemplo é o importador da planilha de preços, disparado quando o arquivo chega ao bucket. Repare no que fica fora do handler: o cliente do S3 nasce uma vez, na fase INIT, e é reaproveitado. Muita gente cria `AmazonS3Client` ou `HttpClient` dentro do método, e aqui está por que isso pesa sob carga: cada invocação paga a criação de novo, a duração sobe e as conexões se acumulam. O exemplo já usa o Powertools para log e métrica, explicado no fim da aula.",
                    },
                    {
                        type: "code",
                        value: "// Funcao.cs (handler: Loja.Precos::Loja.Precos.Funcao::Handler)\nusing System.Net;\nusing Amazon.Lambda.Core;\nusing Amazon.Lambda.S3Events;\nusing Amazon.S3;\nusing AWS.Lambda.Powertools.Logging;\nusing AWS.Lambda.Powertools.Metrics;\n\n[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]\n\nnamespace Loja.Precos;\n\npublic class Funcao\n{\n    // fora do handler: roda uma vez por ambiente, na fase INIT, e as invocações seguintes reaproveitam\n    private static readonly IAmazonS3 S3 = new AmazonS3Client();\n\n    [Logging(Service = \"importador-precos\")]\n    [Metrics(Namespace = \"Loja\", Service = \"importador-precos\", CaptureColdStart = true)]\n    public async Task Handler(S3Event evento, ILambdaContext contexto)\n    {\n        foreach (var registro in evento.Records)\n        {\n            var bucket = registro.S3.Bucket.Name;\n            // a chave chega codificada como URL: \"tabela de precos.csv\" vira \"tabela+de+precos.csv\"\n            var chave = WebUtility.UrlDecode(registro.S3.Object.Key);\n\n            using var objeto = await S3.GetObjectAsync(bucket, chave);\n            using var leitor = new StreamReader(objeto.ResponseStream);\n\n            var linhas = 0;\n            while (await leitor.ReadLineAsync() is { } linha)\n            {\n                // validar SKU e preço e gravar fica numa classe própria, testável sem Lambda\n                linhas++;\n            }\n\n            Logger.LogInformation(\"Arquivo {Chave} importado com {Linhas} linhas\", chave, linhas);\n            Metrics.AddMetric(\"LinhasImportadas\", linhas, MetricUnit.Count);\n        }\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Cold start: de onde vem e o que fazer\n\nO cold start é a fase INIT somada à primeira invocação do ambiente: abrir o pacote, iniciar o runtime do .NET, carregar assemblies, compilar com JIT o caminho quente e rodar construtores e campos estáticos. Ele aparece depois de cada deploy, quando o tráfego sobe e a Lambda cria ambientes novos, e quando um ambiente ocioso é reciclado. A linha `REPORT` do log mostra `Init Duration` só nas invocações que pagaram a partida: meça antes de otimizar.\n\nMuita gente configura a menor memória possível para economizar, e aqui está por que isso costuma sair mais caro: com 128 MB a função recebe uma fração de vCPU, o JIT do .NET se arrasta, a duração sobe e você paga mais GB-segundos do que pagaria com 1 GB rodando rápido. Teste algumas faixas (512 MB, 1.024 MB, 1.769 MB) e compare duração e custo: o AWS Lambda Power Tuning, ferramenta de código aberto citada na documentação, roda a função em várias memórias e mostra o ponto ótimo. O Compute Optimizer também recomenda memória, mas só para funções x86_64. A tabela resume as outras alavancas, com preços de outubro de 2026 na us-east-1 quando elas cobram à parte.",
                    },
                    {
                        type: "table",
                        value: "[[\"Alavanca\", \"O que faz\", \"Custo\", \"Cuidado\"], [\"Mais memória\", \"Mais CPU para o JIT e para o INIT\", \"Cada milissegundo custa mais, mas a duração cai\", \"Acima do ponto ótimo, só encarece\"], [\"ReadyToRun\", \"Pré-compila boa parte do IL no publish\", \"Pacote maior, nada em execução\", \"Já vem ligado no template de biblioteca de classes\"], [\"Native AOT\", \"Binário nativo, sem JIT e sem carregar o runtime do .NET\", \"Nada em execução; build mais trabalhoso\", \"Só código e bibliotecas compatíveis com trimming\"], [\"SnapStart (.NET 8 em diante)\", \"Restaura um snapshot do ambiente já inicializado\", \"Cache a 0,0000015046 dólar por GB-segundo (mínimo de 3 horas) e restauração a 0,0001397998 dólar por GB\", \"Só em versão publicada ou alias; o que o INIT gera (ID, semente aleatória, conexão) sai clonado\"], [\"Concorrência provisionada\", \"Mantém ambientes inicializados à espera\", \"Paga pelo tempo em que fica ligada\", \"Não combina com SnapStart; dimensionar pelo pico\"]]",
                    },
                    {
                        type: "text",
                        value: "## Native AOT na Lambda\n\nCom Native AOT, o `dotnet publish` compila o seu código e as dependências num executável nativo de Linux. O que isso exige, segundo a documentação e o template `lambda.NativeAOT` em outubro de 2026:\n\n- **Assembly executável** com `LambdaBootstrapBuilder` e serialização **gerada em tempo de compilação**: `SourceGeneratorLambdaJsonSerializer<T>` com um `JsonSerializerContext` que lista os tipos de entrada e de saída. Serialização por reflexão não funciona: desde o .NET 8, o publish com AOT desliga a reflexão do `System.Text.Json`, e a chamada sem contexto gerado lança `InvalidOperationException`.\n- **Compilar no mesmo sistema e na mesma arquitetura** da função: Amazon Linux 2023, em x86_64 ou arm64. Fora de um Amazon Linux 2023, o `Amazon.Lambda.Tools` (`dotnet lambda package` ou `deploy-function`) faz o build num contêiner sozinho, se o Docker estiver instalado.\n- **Runtime**: o template publica no gerenciado `dotnet10`, com `--self-contained true`, e o handler é o nome do executável. O runtime só de sistema operacional `provided.al2023` também roda o binário (lá ele precisa se chamar `bootstrap`), mas runtime só de sistema operacional não tem SnapStart.\n- **O patch do .NET passa a ser seu**: o runtime do .NET vai compilado dentro do binário, então correção de segurança do .NET só chega quando você recompila e publica de novo, mesmo no runtime gerenciado.\n- **Aviso de trimming é erro adiado**: o build acusa IL2026 e IL3050 quando algo depende de reflexão. Ignorar o aviso é descobrir a exceção em produção; teste sempre a função publicada.\n\nAs funções de arquivo único do .NET 10 (`dotnet new lambda.FileBased`) publicam com AOT por padrão; para desligar, ponha `#:property PublishAot=false` no topo do arquivo. O exemplo abaixo é a cotação de frete no formato executável, pronta para AOT.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (função executável, pronta para Native AOT; handler: Loja.Frete)\nusing System.Text.Json.Serialization;\nusing Amazon.Lambda.Core;\nusing Amazon.Lambda.RuntimeSupport;\nusing Amazon.Lambda.Serialization.SystemTextJson;\n\nvar handler = (CotacaoFrete cotacao, ILambdaContext contexto) =>\n{\n    var valor = 12.90m + cotacao.PesoKg * 2.10m;\n    var prazo = cotacao.Cep.StartsWith('0') ? 2 : 5;\n    return new Frete(valor, prazo);\n};\n\n// o Main é seu: ele sobe o cliente do runtime da Lambda e entrega cada evento ao handler\nawait LambdaBootstrapBuilder.Create(handler, new SourceGeneratorLambdaJsonSerializer<FreteJson>())\n    .Build()\n    .RunAsync();\n\npublic record CotacaoFrete(string Cep, decimal PesoKg);\npublic record Frete(decimal Valor, int PrazoDias);\n\n// o gerador escreve a serialização em tempo de compilação: sem reflexão, o AOT não quebra\n[JsonSerializable(typeof(CotacaoFrete))]\n[JsonSerializable(typeof(Frete))]\npublic partial class FreteJson : JsonSerializerContext\n{\n}",
                    },
                    {
                        type: "text",
                        value: "## Powertools for AWS Lambda (.NET)\n\nO Powertools é a biblioteca de utilitários que a AWS mantém para funções Lambda. Em outubro de 2026 a linha atual é a 3.x (pacotes `AWS.Lambda.Powertools.*`, com alvos .NET 8 e .NET 10). No importador de preços:\n\n- **Logging** (`[Logging]`): log em JSON com `cold_start`, nome da função e request ID em cada linha. O placeholder do template (`{Chave}`) vira campo próprio, que você filtra no Logs Insights. O evento inteiro não é logado por padrão (`LogEvent` desligado), porque costuma carregar dado sensível.\n- **Metrics** (`[Metrics]`): métricas no Embedded Metric Format, gravadas como linha de log e extraídas pelo CloudWatch, sem chamada de API no caminho da invocação; `CaptureColdStart` publica a métrica de cold start.\n- **Batch Processing**, **Idempotency** e **Parameters**: falha parcial em lote do SQS (próxima aula), deduplicação com DynamoDB e leitura de Parameter Store e Secrets Manager com cache.\n\nUm cuidado datado: o **Tracing** do Powertools para .NET é um invólucro do SDK do X-Ray, que está em manutenção desde 25/02/2026, só com correções de segurança. Para trace novo, siga o caminho do módulo 6: OpenTelemetry com ADOT, com o X-Ray como destino.",
                    },
                    {
                        type: "quote",
                        value: "Lambda brilha no trabalho que chega em rajadas e termina em minutos; carga constante e conexão longa continuam no contêiner. Em .NET 10, meça o cold start antes de otimizar: memória, ReadyToRun, SnapStart e Native AOT resolvem problemas diferentes e cobram preços diferentes.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destes trabalhos do sistema da loja combina melhor com uma função Lambda do que com mais uma tarefa no ECS?",
                        difficulty: "facil",
                        options: [
                            { text: "Atender a API principal, que recebe tráfego constante e alto ao longo do dia todo", isCorrect: false },
                            { text: "Importar a planilha de preços que o time comercial sobe no S3 duas vezes por semana", isCorrect: true },
                            { text: "Rodar a migração de dados do catálogo antigo, que leva perto de duas horas e meia", isCorrect: false },
                            { text: "Manter o consumidor AMQP ligado ao broker RabbitMQ durante o dia inteiro, sem pausa", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No importador de preços, por que o `AmazonS3Client` é um campo `static readonly` da classe, e não uma variável criada dentro do handler?",
                        difficulty: "facil",
                        options: [
                            { text: "Campo estático é zerado a cada invocação, o que evita vazar dados entre requisições", isCorrect: false },
                            { text: "Campo estático é compartilhado entre ambientes, então todas as cópias usam o mesmo cliente", isCorrect: false },
                            { text: "A Lambda exige cliente do SDK estático para liberar a permissão de leitura no S3", isCorrect: false },
                            { text: "Ele nasce uma vez na fase INIT e serve às invocações seguintes do mesmo ambiente", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma função `dotnet10` configurada com 128 MB leva vários segundos por invocação, e a conta mensal subiu. Qual é o primeiro teste que faz sentido?",
                        difficulty: "medio",
                        options: [
                            { text: "Baixar o timeout para 3 segundos, porque a Lambda cobra pelo timeout configurado na função", isCorrect: false },
                            { text: "Subir a memória, porque a CPU cresce junto e a duração pode cair mais do que o preço sobe", isCorrect: true },
                            { text: "Trocar arm64 por x86_64, porque o .NET roda mais lento em arm64 pelo mesmo preço por GB", isCorrect: false },
                            { text: "Desligar o ReadyToRun, porque a pré-compilação deixa cada invocação mais demorada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você ligou o SnapStart numa função `dotnet10` e publicou uma versão, mas o teste de carga não mostrou ganho na partida. O teste chama a função pelo ARN sem qualificador. Qual é a causa mais provável?",
                        difficulty: "medio",
                        options: [
                            { text: "O SnapStart só atua em funções configuradas com 1.769 MB de memória ou mais", isCorrect: false },
                            { text: "Sem qualificador, a chamada vai para a `$LATEST`, que não restaura do snapshot da versão", isCorrect: true },
                            { text: "O SnapStart exige concorrência provisionada ligada na mesma versão publicada da função", isCorrect: false },
                            { text: "O SnapStart para .NET só funciona quando a função é compilada e publicada com Native AOT", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma função publicada com Native AOT desserializa a entrada assim:\n\n```csharp\nvar pedido = JsonSerializer.Deserialize<Pedido>(corpo);\n```\n\nO build mostrou IL2026 e IL3050, mas terminou. O que esperar quando a função rodar na Lambda?",
                        difficulty: "dificil",
                        options: [
                            { text: "A chamada lança exceção, porque o publish com AOT desliga a serialização por reflexão", isCorrect: true },
                            { text: "Nada muda, porque esses avisos valem só para Debug e somem no publish em Release", isCorrect: false },
                            { text: "O deploy é recusado pela Lambda, que confere os avisos de trimming de todo pacote enviado", isCorrect: false },
                            { text: "A Lambda detecta a reflexão e volta para o JIT, com um cold start um pouco maior", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Lambda na prática: API Gateway, SQS e o tratamento de erro",
                blocks: [
                    {
                        type: "text",
                        value: "# Lambda na prática: API Gateway, SQS e o tratamento de erro\n\nO provedor de pagamentos avisa cada confirmação por webhook. Em dia de promoção chegam centenas por minuto; numa madrugada comum, nenhuma. Ele espera resposta em poucos segundos e reenvia quando recebe erro ou timeout. O desenho desta aula: um endpoint HTTP que só confere e enfileira, uma fila SQS com DLQ e uma função que consome a fila em lotes. O que decide se o desenho aguenta produção é o tratamento de erro, porque ele muda conforme quem chama a função.\n\nMuita gente processa o pagamento dentro do próprio webhook, e aqui está por que isso quebra: se o banco fica lento, o webhook estoura o tempo, o provedor reenvia e o pedido é processado duas vezes. Conferir, enfileirar e responder 200 desacopla o ritmo do provedor do ritmo do banco.\n\n## Três portas HTTP para uma função",
                    },
                    {
                        type: "table",
                        value: "[[\"Porta\", \"Serve bem para\", \"Preço e limites (us-east-1, outubro de 2026)\"], [\"HTTP API (API Gateway)\", \"Webhook e API enxuta, com autorizador JWT e CORS\", \"1 dólar por milhão de requisições (até 300 milhões); integração com no máximo 30 segundos; sem WAF, sem cache e sem chave de API\"], [\"REST API (API Gateway)\", \"Quando é preciso WAF, chave de API com plano de uso, validação de requisição ou cache\", \"3,50 dólares por milhão de requisições (até 333 milhões)\"], [\"Function URL\", \"Protótipo e endpoint simples\", \"Sem cobrança além da Lambda; autenticação só por IAM ou nenhuma; endereço gerado pela AWS, sem domínio próprio direto\"]]",
                    },
                    {
                        type: "text",
                        value: "## ASP.NET Core dentro da Lambda\n\nVocê já escreve API em ASP.NET Core. Para um endpoint pequeno como o webhook, o pacote `Amazon.Lambda.AspNetCoreServer.Hosting` deixa usar o mesmo modelo: ele traduz o evento do API Gateway em `HttpContext`, e o resto é Minimal API normal. Fora da Lambda, a mesma linha não faz nada e o Kestrel atende, então `dotnet run` e os testes de integração continuam funcionando. O handler da função é o nome do assembly.\n\nO preço é a partida: o pipeline inteiro do ASP.NET Core sobe no INIT. Para a API principal, com tráfego constante, o contêiner continua melhor; para um webhook em rajadas, compensa. Se você prefere uma função por rota sem ASP.NET Core, há dois caminhos: os tipos de evento crus (`APIGatewayHttpApiV2ProxyRequest` e a resposta correspondente) ou o **Lambda Annotations** (`Amazon.Lambda.Annotations`, linha 2.x), que gera o handler a partir de atributos como `[LambdaFunction]` e `[HttpApi]` e mantém sincronizado o template do CloudFormation usado pelo SAM. A injeção de dependência dele usa uma classe marcada com `[LambdaStartup]`; na versão atual, o caminho recomendado é um método `ConfigureHostBuilder()` que devolve `HostApplicationBuilder`, e o `ConfigureServices` antigo segue aceito como legado.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs do webhook (ASP.NET Core dentro da Lambda; handler: Loja.Webhook)\nusing Amazon.SQS;\nusing Amazon.SQS.Model;\n\nvar builder = WebApplication.CreateBuilder(args);\n\n// na Lambda, traduz o evento do HTTP API em HttpContext; fora dela (dotnet run), não faz nada\nbuilder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);\nbuilder.Services.AddAWSService<IAmazonSQS>();\n\nvar app = builder.Build();\nvar urlFila = app.Configuration[\"FILA_PAGAMENTOS_URL\"]\n    ?? throw new InvalidOperationException(\"FILA_PAGAMENTOS_URL não configurada\");\n\napp.MapPost(\"/webhooks/pagamentos\", async (HttpRequest requisicao, IAmazonSQS sqs) =>\n{\n    using var leitor = new StreamReader(requisicao.Body);\n    var corpo = await leitor.ReadToEndAsync();\n\n    // conferir a assinatura do provedor (cabeçalho HMAC) antes de aceitar\n    // e só enfileirar: o trabalho pesado fica para o consumidor da fila\n    await sqs.SendMessageAsync(new SendMessageRequest { QueueUrl = urlFila, MessageBody = corpo });\n    return TypedResults.Ok();\n});\n\napp.Run();",
                    },
                    {
                        type: "text",
                        value: "## Consumindo a fila com Lambda\n\nA fila, a DLQ e o redrive são os do módulo 5; muda quem consome. Em vez de um worker chamando `ReceiveMessage`, você cria um **event source mapping**: a própria Lambda faz o polling, entrega lotes à função (10 mensagens por padrão; até 10.000 em fila padrão com janela de lote de pelo menos 1 segundo; no máximo 10 em FIFO) e apaga as mensagens quando a invocação termina sem erro. A entrega é \"pelo menos uma vez\": a mesma mensagem pode chegar duas vezes mesmo sem falha, então o consumidor tem de ser idempotente.\n\nTrês ajustes que a documentação pede e que costumam ficar de fora:\n\n- **Visibility timeout da fila de pelo menos seis vezes o timeout da função**, mais a janela de lote. A Lambda recusa criar o mapeamento se o timeout da função passar o da fila.\n- **DLQ na fila de origem**, pela redrive policy, com `maxReceiveCount` de pelo menos 5: com SQS, quem conta as entregas e desvia a mensagem é a fila.\n- **Teto de concorrência** (`MaxConcurrency`, de 2 a 1.000). Sem ele, uma fila acumulada escala a função depressa (até 1.250 invocações simultâneas no modo padrão), e cada ambiente abre o próprio pool de conexões no PostgreSQL. É assim que um backlog derruba o banco.\n\nE o padrão perigoso: se a função lança exceção, **o lote inteiro volta para a fila**, inclusive as mensagens já processadas. Com `ReportBatchItemFailures` ligado no mapeamento, a função devolve um `SQSBatchResponse` só com os IDs que falharam, e as outras são apagadas.",
                    },
                    {
                        type: "code",
                        value: "// Funcao.cs (handler: Loja.Pagamentos::Loja.Pagamentos.Funcao::Handler)\nusing System.Text.Json;\nusing Amazon.Lambda.Core;\nusing Amazon.Lambda.SQSEvents;\n\n[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]\n\nnamespace Loja.Pagamentos;\n\npublic sealed record PagamentoConfirmado(Guid PedidoId, string IdTransacao, decimal Valor);\n\npublic class Funcao\n{\n    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);\n\n    public async Task<SQSBatchResponse> Handler(SQSEvent evento, ILambdaContext contexto)\n    {\n        var falhas = new List<SQSBatchResponse.BatchItemFailure>();\n\n        foreach (var mensagem in evento.Records)\n        {\n            try\n            {\n                var pagamento = JsonSerializer.Deserialize<PagamentoConfirmado>(mensagem.Body, Json)\n                    ?? throw new InvalidDataException(\"corpo vazio\");\n                await ConfirmarAsync(pagamento);\n            }\n            catch (Exception ex)\n            {\n                // só esta mensagem volta para a fila; as outras do lote foram concluídas\n                contexto.Logger.LogError(ex, \"Falha na mensagem {MessageId}\", mensagem.MessageId);\n                falhas.Add(new SQSBatchResponse.BatchItemFailure { ItemIdentifier = mensagem.MessageId });\n            }\n        }\n\n        return new SQSBatchResponse(falhas);\n    }\n\n    // idempotente: IdTransacao tem índice único no banco, então a mesma\n    // confirmação entregue duas vezes não marca o pedido como pago duas vezes\n    private static Task ConfirmarAsync(PagamentoConfirmado pagamento) => Task.CompletedTask;\n}",
                    },
                    {
                        type: "code",
                        value: "// PagamentosStack.cs: webhook no HTTP API, fila com DLQ e consumidor com falha parcial\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.Apigatewayv2;\nusing Amazon.CDK.AwsApigatewayv2Integrations;\nusing Amazon.CDK.AWS.Lambda;\nusing Amazon.CDK.AWS.Lambda.EventSources;\nusing Amazon.CDK.AWS.SQS;\nusing Constructs;\n\nnamespace Infra;\n\npublic sealed class PagamentosStack : Stack\n{\n    public PagamentosStack(Construct scope, string id, IStackProps? props = null) : base(scope, id, props)\n    {\n        var dlq = new Queue(this, \"PagamentosDlq\", new QueueProps { RetentionPeriod = Duration.Days(14) });\n        var fila = new Queue(this, \"Pagamentos\", new QueueProps\n        {\n            VisibilityTimeout = Duration.Seconds(6 * 30 + 5), // 6 x timeout da função + janela do lote\n            DeadLetterQueue = new DeadLetterQueue { Queue = dlq, MaxReceiveCount = 5 },\n        });\n\n        var consumidor = new Function(this, \"ConfirmarPagamento\", new FunctionProps\n        {\n            Runtime = Runtime.DOTNET_10,\n            Architecture = Architecture.ARM_64,\n            MemorySize = 1024,\n            Timeout = Duration.Seconds(30),\n            Handler = \"Loja.Pagamentos::Loja.Pagamentos.Funcao::Handler\",\n            Code = Code.FromAsset(\"../Loja.Pagamentos/publicado\"),\n        });\n        consumidor.AddEventSource(new SqsEventSource(fila, new SqsEventSourceProps\n        {\n            BatchSize = 10,\n            MaxBatchingWindow = Duration.Seconds(5),\n            ReportBatchItemFailures = true, // sem isso, a lista de falhas devolvida é ignorada\n            MaxConcurrency = 5,             // teto de execuções simultâneas: protege o banco\n        }));\n\n        var webhook = new Function(this, \"WebhookPagamentos\", new FunctionProps\n        {\n            Runtime = Runtime.DOTNET_10,\n            Architecture = Architecture.ARM_64,\n            MemorySize = 1024,\n            Timeout = Duration.Seconds(10),\n            Handler = \"Loja.Webhook\", // ASP.NET Core na Lambda: o handler é o nome do assembly\n            Code = Code.FromAsset(\"../Loja.Webhook/publicado\"),\n            Environment = new Dictionary<string, string> { [\"FILA_PAGAMENTOS_URL\"] = fila.QueueUrl },\n        });\n        fila.GrantSendMessages(webhook);\n\n        new HttpApi(this, \"ApiWebhooks\", new HttpApiProps\n        {\n            DefaultIntegration = new HttpLambdaIntegration(\"Webhook\", webhook),\n        });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O contrato da resposta parcial\n\nO que a Lambda faz com a resposta, segundo a documentação:\n\n- Lista vazia ou nula: o lote inteiro deu certo.\n- `itemIdentifier` nulo, vazio, com nome de chave errado ou com um ID que não está no lote: **o lote inteiro falhou**.\n- Exceção não tratada: o lote inteiro falhou, mesmo com o recurso ligado. Por isso o `try/catch` envolve cada mensagem, e não o laço.\n- Fila FIFO: pare na primeira falha e devolva ela e todas as seguintes, senão a ordem do grupo se perde.\n\nO erro que apaga dados em silêncio é devolver `SQSBatchResponse` sem ligar `ReportBatchItemFailures` no mapeamento. A Lambda não lê a lista; a invocação terminou sem exceção, então o lote inteiro é apagado, inclusive o que você marcou como falha. O sintoma é falha no log com fila e DLQ vazias. O erro oposto, resposta malformada, faz o lote inteiro voltar sempre: a métrica `NumberOfMessagesDeleted` da fila cai a zero e a `ApproximateAgeOfOldestMessage` dispara. O utilitário de Batch Processing do Powertools implementa esse contrato (inclusive a regra da FIFO) para quem não quer escrever o laço à mão.\n\nOs outros jeitos de invocar uma função tratam erro de outro modo:",
                    },
                    {
                        type: "table",
                        value: "[[\"Quem chama\", \"Quem tenta de novo\", \"O que acontece com o erro\", \"Onde a falha fica\"], [\"Síncrona (API Gateway, function URL)\", \"Ninguém: o cliente decide\", \"No HTTP API, exceção não tratada vira 500 com a mensagem Internal Server Error; trate e devolva ProblemDetails\", \"Log da função e log de acesso do API Gateway\"], [\"Assíncrona (S3, EventBridge, SNS)\", \"A Lambda: mais duas tentativas, depois de 1 e de 2 minutos\", \"Quem enviou o evento já recebeu o aceite e não fica sabendo\", \"Destino on-failure ou DLQ da função; evento com mais de 6 horas é descartado\"], [\"Event source mapping (SQS)\", \"A fila: a mensagem reaparece depois do visibility timeout\", \"Sem resposta parcial, volta o lote inteiro; com ela, só as que falharam\", \"DLQ da fila depois de maxReceiveCount entregas\"]]",
                    },
                    {
                        type: "quote",
                        value: "Na Lambda, o tratamento de erro depende de quem chama: na chamada síncrona o cliente decide, na assíncrona a Lambda tenta de novo e, com SQS, é a fila que reentrega. No consumidor de fila, ligue `ReportBatchItemFailures`, ponha teto de concorrência e escreva o processamento idempotente.",
                    },
                ],
                questions: [
                    {
                        statement: "Um consumidor SQS sem resposta parcial lança exceção na sétima mensagem de um lote de dez. O que acontece com as mensagens desse lote?",
                        difficulty: "facil",
                        options: [
                            { text: "O lote inteiro vai direto para a DLQ da fila, sem nenhuma nova tentativa de entrega", isCorrect: false },
                            { text: "As dez voltam a ficar visíveis depois do visibility timeout, inclusive as seis já processadas", isCorrect: true },
                            { text: "As seis primeiras são apagadas, e a sétima e as três seguintes voltam juntas para a fila", isCorrect: false },
                            { text: "Só a sétima volta para a fila, e as outras nove são apagadas pela Lambda assim que a função termina", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Pela recomendação da AWS, qual deve ser o visibility timeout de uma fila consumida por uma função com timeout de 30 segundos e sem janela de lote?",
                        difficulty: "facil",
                        options: [
                            { text: "Menos de 30 segundos, para a mensagem voltar logo se a função falhar", isCorrect: false },
                            { text: "O padrão da fila, porque a Lambda ajusta essa visibilidade sozinha", isCorrect: false },
                            { text: "Pelo menos 180 segundos, seis vezes o timeout da função", isCorrect: true },
                            { text: "Exatamente 30 segundos, o mesmo valor do timeout da função", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `ReportBatchItemFailures` ligado, o consumidor abaixo recebe um lote de três mensagens, e a segunda tem JSON inválido. O que acontece?\n\n```csharp\npublic async Task<SQSBatchResponse> Handler(SQSEvent evento, ILambdaContext contexto)\n{\n    var falhas = new List<SQSBatchResponse.BatchItemFailure>();\n    foreach (var mensagem in evento.Records)\n    {\n        var pagamento = JsonSerializer.Deserialize<PagamentoConfirmado>(mensagem.Body, Json)!;\n        await ConfirmarAsync(pagamento);\n    }\n    return new SQSBatchResponse(falhas);\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "A segunda vai direto para a DLQ, e a Lambda apaga a primeira e a terceira assim que termina", isCorrect: false },
                            { text: "A exceção escapa do handler, e as três voltam para a fila, inclusive a que já foi processada", isCorrect: true },
                            { text: "A Lambda descarta a segunda, que não tem como dar certo, e apaga o lote com sucesso", isCorrect: false },
                            { text: "Só a segunda volta para a fila, porque o recurso de resposta parcial está ligado no mapeamento", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que o webhook de pagamentos da aula só confere a assinatura, enfileira no SQS e responde 200, em vez de confirmar o pedido no banco na mesma requisição?",
                        difficulty: "medio",
                        options: [
                            { text: "Para gastar menos, já que a mensagem no SQS custa menos que a invocação da Lambda", isCorrect: false },
                            { text: "Porque a função atrás do HTTP API não consegue abrir conexão com o PostgreSQL que está na VPC", isCorrect: false },
                            { text: "Para responder rápido ao provedor, que reenvia em erro ou timeout, e absorver o pico na fila", isCorrect: true },
                            { text: "Porque o HTTP API só aceita resposta 200 sem corpo vinda de uma integração com Lambda", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O consumidor devolve `SQSBatchResponse` com o ID das mensagens que falharam e o log mostra as falhas, mas nada reaparece na fila e a DLQ continua vazia. Qual é a causa mais provável?",
                        difficulty: "dificil",
                        options: [
                            { text: "O `maxReceiveCount` está alto, e as mensagens ainda esperam a vez de entrar na DLQ da fila", isCorrect: false },
                            { text: "O mapeamento não tem `ReportBatchItemFailures`; a lista é ignorada e o lote todo é apagado", isCorrect: true },
                            { text: "O visibility timeout é curto, e a Lambda apaga cada mensagem antes de ela voltar para a fila", isCorrect: false },
                            { text: "A função devolveu o `ReceiptHandle` no lugar do `MessageId`, e a fila aceitou assim", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "CI/CD: GitHub Actions com OIDC, imagem no ECR e deploy no ECS",
                blocks: [
                    {
                        type: "text",
                        value: "# CI/CD: GitHub Actions com OIDC, imagem no ECR e deploy no ECS\n\nAté aqui o deploy saiu da sua máquina: `docker push`, `cdk deploy`, credencial do seu perfil. Funciona até o dia em que alguém publica de um branch errado, ou em que a imagem de produção foi construída com uma alteração que nunca foi commitada. O pipeline resolve isso: todo deploy sai do mesmo lugar, do mesmo commit, com o mesmo roteiro.\n\nO erro mais comum ao montar esse pipeline é criar um usuário IAM, gerar uma chave de acesso e guardar nos secrets do GitHub. A chave não expira, funciona de qualquer lugar do mundo e vaza junto com log mal configurado, action comprometida ou backup de repositório. A alternativa, hoje padrão, é **OIDC**: o GitHub prova quem é o job, e a AWS entrega uma credencial temporária.\n\n## Como o fluxo funciona\n\n1. O job declara `id-token: write` nas permissões e pede ao GitHub um token JWT assinado. O token diz de qual repositório, branch, environment e workflow ele vem, em claims como `sub`, `aud` e `repository_id`.\n2. A action `aws-actions/configure-aws-credentials` chama `AssumeRoleWithWebIdentity` no STS com esse token e o ARN da role.\n3. O STS confere a assinatura contra o provedor OIDC cadastrado no IAM (`token.actions.githubusercontent.com`) e avalia as condições da trust policy da role.\n4. Se tudo bate, o job recebe credenciais temporárias (a sessão padrão da action dura uma hora). Não existe segredo guardado em lugar nenhum.\n\nO provedor é criado uma vez por conta. O thumbprint do certificado, que tutoriais antigos mandam calcular, não é mais necessário: a AWS ignora o valor. A stack abaixo cria o provedor e a role de deploy.",
                    },
                    {
                        type: "code",
                        value: "// GitHubDeployStack.cs: o GitHub Actions entra na AWS por OIDC, sem chave guardada\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.ECR;\nusing Amazon.CDK.AWS.IAM;\nusing Constructs;\n\nnamespace Infra;\n\npublic sealed class GitHubDeployStack : Stack\n{\n    public GitHubDeployStack(Construct scope, string id, IStackProps? props = null) : base(scope, id, props)\n    {\n        // um por conta: a AWS passa a aceitar tokens assinados pelo GitHub Actions\n        var github = new OidcProviderNative(this, \"GitHub\", new OidcProviderNativeProps\n        {\n            Url = \"https://token.actions.githubusercontent.com\",\n            ClientIds = [\"sts.amazonaws.com\"],\n        });\n\n        var papel = new Role(this, \"DeployLoja\", new RoleProps\n        {\n            RoleName = \"loja-deploy-github\",\n            MaxSessionDuration = Duration.Hours(1),\n            AssumedBy = new WebIdentityPrincipal(github.OidcProviderArn, new Dictionary<string, object>\n            {\n                [\"StringEquals\"] = new Dictionary<string, object>\n                {\n                    [\"token.actions.githubusercontent.com:aud\"] = \"sts.amazonaws.com\",\n                    // só o job que roda no environment \"producao\" deste repositório\n                    [\"token.actions.githubusercontent.com:sub\"] = \"repo:minha-org/loja:environment:producao\",\n                },\n            }),\n        });\n\n        // imagem: publicar só no repositório da API\n        var repo = Repository.FromRepositoryName(this, \"RepoApi\", \"loja-api\");\n        repo.GrantPullPush(papel);\n        repo.Grant(papel, \"ecr:DescribeImages\"); // o pipeline confere se a tag já existe\n\n        // cdk deploy: o papel só assume os papéis que o cdk bootstrap criou\n        papel.AddToPolicy(new PolicyStatement(new PolicyStatementProps\n        {\n            Actions = [\"sts:AssumeRole\"],\n            Resources = [$\"arn:aws:iam::{Account}:role/cdk-hnb659fds-*\"],\n        }));\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## A condição que segura a porta\n\nUma trust policy sem condição no `sub` aceita token de **qualquer repositório do GitHub**; a documentação do GitHub diz que é obrigatório definir ao menos uma condição. As duas do exemplo:\n\n- `aud` igual a `sts.amazonaws.com`: o token foi emitido para a AWS.\n- `sub` igual a `repo:minha-org/loja:environment:producao`: só o job que roda no environment `producao` deste repositório.\n\nAmarrar a role ao environment é o desenho mais forte, porque o environment tem regras próprias no GitHub: revisores obrigatórios (até seis pessoas ou times, com a opção de impedir que quem disparou o deploy aprove) e a lista de branches e tags que podem publicar nele. Em repositório privado, environment exige plano pago do GitHub; no plano Free, só em repositório público.\n\nNo formato antigo do `sub`, o erro clássico é o curinga: `StringLike` com `repo:minha-org/loja:*` aceita qualquer branch e qualquer pull request do repositório, e um PR de teste passa a assumir a role de produção.\n\n**Mudança de 2026, confira antes de copiar exemplo antigo**: repositórios criados a partir de 15/07/2026 (e os antigos que optarem, ou forem renomeados ou transferidos depois dessa data) emitem o `sub` **imutável**, com o ID numérico da organização e do repositório, como `repo:minha-org@123456/loja@789012:environment:producao`. Assim, um nome de organização ou de repositório reaproveitado por outra pessoa não casa com a sua trust policy. Se a condição estiver no formato antigo e o repositório emitir o novo, o deploy falha com `Not authorized to perform sts:AssumeRoleWithWebIdentity`. O formato que vale para o seu repositório aparece nas configurações de OIDC dele. A tabela usa o formato antigo, mais curto; no novo, só o trecho do repositório muda.",
                    },
                    {
                        type: "table",
                        value: "[[\"Gatilho do job\", \"Valor do sub\", \"Uso na trust policy\"], [\"Job com environment\", \"repo:minha-org/loja:environment:producao\", \"Deploy de produção, amarrado ao environment com aprovação\"], [\"Push num branch, job sem environment\", \"repo:minha-org/loja:ref:refs/heads/main\", \"Ambiente sem aprovação manual, como homologação\"], [\"Pull request\", \"repo:minha-org/loja:pull_request\", \"Só role de leitura, nunca a de deploy\"], [\"Tag\", \"repo:minha-org/loja:ref:refs/tags/v1.4.0\", \"Release por tag, casando o padrão exato das tags\"]]",
                    },
                    {
                        type: "text",
                        value: "## O pipeline\n\nO workflow tem dois jobs. `testar` roda em todo push na `main` e não recebe permissão nenhuma na AWS. `publicar` só começa se os testes passarem, roda no environment `producao` e é o único com `id-token: write`. Os passos:\n\n1. **Credencial**: `configure-aws-credentials` com `allowed-account-ids`, que faz o job falhar se a role pertencer a outra conta (ARN copiado errado acontece).\n2. **Imagem**: build e push no ECR com a tag igual ao SHA do commit. O repositório tem tag imutável (módulo 3), então reexecutar o job depois de um push bem-sucedido falharia: o build novo gera outro digest para uma tag que não pode ser sobrescrita. Por isso o passo confere antes se a imagem já existe.\n3. **Deploy**: `cdk deploy` da stack da API, que recebe a tag da imagem por contexto (aqui, `tagDaImagem`). O CloudFormation espera o serviço do ECS estabilizar, e o circuit breaker com rollback do módulo 3 desfaz o deploy que não sobe.\n\nO `concurrency` no topo enfileira os deploys: dois pushes seguidos não disputam a mesma stack, e um deploy no meio não é cancelado. A role tem só o necessário: push no repositório `loja-api`, `ecr:DescribeImages` para a conferência da tag e `sts:AssumeRole` nos papéis do `cdk bootstrap` (prefixo `cdk-hnb659fds-`). Quem cria os recursos de fato é o papel de execução do CloudFormation criado pelo bootstrap, que por padrão tem `AdministratorAccess`; numa conta com exigência maior, faça o bootstrap com `--cloudformation-execution-policies` apontando para políticas mais restritas.",
                    },
                    {
                        type: "code",
                        value: "# .github/workflows/deploy.yml\nname: deploy\n\non:\n  push:\n    branches: [main]\n\n# um deploy por vez: o próximo espera na fila em vez de cancelar o que está no meio\nconcurrency:\n  group: deploy-producao\n  cancel-in-progress: false\n\npermissions:\n  contents: read\n\njobs:\n  testar:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/setup-dotnet@v6\n        with:\n          dotnet-version: '10.0.x'\n      - run: dotnet test --configuration Release\n\n  publicar:\n    needs: testar\n    runs-on: ubuntu-latest\n    environment: producao        # aprovação manual e o \"environment:producao\" no sub do token\n    permissions:\n      id-token: write            # pedir o token OIDC ao GitHub\n      contents: read             # o checkout continua precisando ler o repositório\n    env:\n      TAG: ${{ github.sha }}\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/setup-dotnet@v6\n        with:\n          dotnet-version: '10.0.x'\n      - uses: actions/setup-node@v7\n        with:\n          node-version: '24'\n      - uses: aws-actions/configure-aws-credentials@v6.3.0\n        with:\n          role-to-assume: arn:aws:iam::111122223333:role/loja-deploy-github\n          aws-region: sa-east-1\n          allowed-account-ids: '111122223333'\n      - id: ecr\n        uses: aws-actions/amazon-ecr-login@v2\n      - name: Imagem com a tag do commit\n        run: |\n          if aws ecr describe-images --repository-name loja-api --image-ids imageTag=\"$TAG\" > /dev/null 2>&1; then\n            echo \"Imagem $TAG já publicada (re-execução do job), segue para o deploy\"\n          else\n            IMAGEM=\"${{ steps.ecr.outputs.registry }}/loja-api:$TAG\"\n            docker build -t \"$IMAGEM\" -f src/Loja.Api/Dockerfile .\n            docker push \"$IMAGEM\"\n          fi\n      - name: Deploy da stack da API\n        working-directory: infra\n        run: npx --yes aws-cdk@2 deploy LojaApi --require-approval never -c tagDaImagem=\"$TAG\"",
                    },
                    {
                        type: "text",
                        value: "## Alternativa e cuidados com as actions\n\nQuando a task definition mora no repositório da aplicação (um `task-definition.json`), o caminho oficial são as actions `aws-actions/amazon-ecs-render-task-definition@v1`, que troca a imagem no JSON, e `aws-actions/amazon-ecs-deploy-task-definition@v2`, que registra a revisão e atualiza o serviço (com `wait-for-service-stability: true`). Não misture os dois mundos: se o serviço é do CDK e o pipeline atualiza a task definition por fora, a próxima mudança da stack que tocar na tarefa volta a imagem para a que está no código.\n\nFixe versão de action como fixa versão de pacote. Em outubro de 2026, as versões maiores atuais são `actions/checkout@v7`, `actions/setup-dotnet@v6`, `actions/setup-node@v7` e `aws-actions/configure-aws-credentials@v6` (a 6.3.0 é de setembro de 2026). Desde a v5, a action da AWS publica releases imutáveis, então `@v6.3.0` não muda debaixo de você, enquanto `@v6` acompanha a versão mais nova da série. Para action de terceiros sem essa garantia, fixe pelo SHA do commit: em março de 2025, as tags da `tj-actions/changed-files` foram apontadas para um commit malicioso que imprimia os secrets dos pipelines no log.",
                    },
                    {
                        type: "quote",
                        value: "Pipeline bom é aquele em que nenhuma credencial de longa duração existe: o GitHub prova quem é o job, a trust policy confere repositório e environment, e a role só alcança o que o deploy precisa. A imagem leva a tag do commit, e o deploy só termina quando o serviço estabiliza.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual permissão o job do GitHub Actions precisa declarar para pedir o token OIDC que a `configure-aws-credentials` troca por credenciais na AWS?",
                        difficulty: "facil",
                        options: [
                            { text: "`id-token: write`", isCorrect: true },
                            { text: "`contents: write`", isCorrect: false },
                            { text: "`deployments: write`", isCorrect: false },
                            { text: "`actions: write`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a principal vantagem de trocar a chave de acesso guardada nos secrets do GitHub por OIDC no pipeline de deploy?",
                        difficulty: "facil",
                        options: [
                            { text: "O OIDC dispensa a role no IAM, e o GitHub passa a acessar a conta da AWS diretamente", isCorrect: false },
                            { text: "O OIDC guarda a chave de acesso cifrada, e só o job de produção consegue ler o valor dela", isCorrect: false },
                            { text: "O job recebe credenciais temporárias, e não existe chave de longa duração para vazar", isCorrect: true },
                            { text: "A chave de acesso deixou de funcionar com o `cdk deploy` a partir de 2026", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O repositório `minha-org/estoque` existe desde 2025 e emite o `sub` no formato antigo. A trust policy da role de deploy usa `StringLike` com `token.actions.githubusercontent.com:sub` igual a `repo:minha-org/estoque:*`. Qual é o risco?",
                        difficulty: "medio",
                        options: [
                            { text: "Nenhum, porque o curinga só casa com jobs em environment com aprovação manual", isCorrect: false },
                            { text: "A role para de funcionar, porque o STS rejeita curinga em condição de token OIDC", isCorrect: false },
                            { text: "Repositórios de outras organizações do GitHub passam a assumir a role sem nenhuma restrição", isCorrect: false },
                            { text: "Qualquer branch ou pull request desse repositório consegue assumir a role de produção", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O repositório da loja foi criado em agosto de 2026. A trust policy usa `sub` igual a `repo:minha-org/loja:environment:producao`, e o job falha com `Not authorized to perform sts:AssumeRoleWithWebIdentity`. O que explica?",
                        difficulty: "medio",
                        options: [
                            { text: "Falta `sts:TagSession` na trust policy, que a action exige em todo fluxo com OIDC", isCorrect: false },
                            { text: "O provedor OIDC foi criado sem o thumbprint do certificado do GitHub, que o STS exige na validação", isCorrect: false },
                            { text: "Repositório criado após 15/07/2026 emite o `sub` imutável, com IDs da organização e do repositório", isCorrect: true },
                            { text: "O environment `producao` precisa ter exatamente o mesmo nome da role no IAM", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O serviço `loja-api` pertence à stack do CDK, que define a imagem `loja-api:1.4.0`. Um pipeline passou a publicar a 1.5.0 com `amazon-ecs-deploy-task-definition`. Semanas depois, alguém muda só a memória da tarefa no código do CDK e roda `cdk deploy`. Qual imagem o serviço passa a rodar?",
                        difficulty: "dificil",
                        options: [
                            { text: "A 1.5.0, porque o CDK consulta o ECR no deploy e usa sempre a imagem mais nova", isCorrect: false },
                            { text: "Nenhuma, porque o deploy falha por drift até alguém importar a mudança feita fora da stack", isCorrect: false },
                            { text: "A 1.4.0, porque o CloudFormation registra a task definition do código, com a imagem dele", isCorrect: true },
                            { text: "A 1.5.0, porque o CloudFormation lê a task definition em uso e só altera a memória", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Segurança em produção: rotação de segredo, privilégio revisado, WAF e CloudTrail",
                blocks: [
                    {
                        type: "text",
                        value: "# Segurança em produção: rotação de segredo, privilégio revisado, WAF e CloudTrail\n\nSegurança de sistema no ar não é item que se marca uma vez. A senha do banco que nunca muda, a role que ganhou `*` numa madrugada de incidente e ninguém tirou, o endpoint público sem filtro na frente e a pergunta \"quem apagou esse security group?\" sem resposta são o estado natural de um sistema com meses de vida. Esta aula trata os quatro.\n\n## Segredo com rotação\n\nNo módulo 3 o segredo foi para o Secrets Manager, e você viu que a rotação não chega sozinha às tarefas em execução. Aqui o assunto é ligar a rotação de verdade na senha do banco, onde esse detalhe vira incidente. Há dois mecanismos:\n\n- **Rotação gerida pelo RDS**, para o usuário mestre (`ManageMasterUserPassword`): o RDS gera, guarda e gira a senha, por padrão a cada sete dias. Não é compatível com o Blue/Green Deployments do RDS nem com a criação de réplica de leitura na maioria dos engines.\n- **Rotação por função Lambda**, para os outros usuários, como o `loja_app` da aplicação, com duas estratégias. A tabela compara.\n\nPreço em outubro de 2026, na us-east-1: 0,40 dólar por segredo por mês e 0,05 dólar a cada 10 mil chamadas de API.",
                    },
                    {
                        type: "table",
                        value: "[[\"Estratégia\", \"Como gira\", \"O que acontece com a credencial antiga\", \"Quando usar\"], [\"Usuário único\", \"Troca a senha do próprio usuário\", \"Conexões abertas continuam; conexão nova com a senha velha falha desde a troca\", \"Padrão da AWS para a maioria dos casos, com a aplicação relendo o segredo\"], [\"Usuários alternados\", \"Clona o usuário (loja_app_clone) e alterna qual dos dois recebe senha nova\", \"A credencial anterior segue válida até a rotação seguinte\", \"Alta disponibilidade, quando a aplicação demora a reler o segredo; exige um segredo de superusuário\"], [\"Gerida pelo RDS\", \"O RDS troca a senha do usuário mestre\", \"Igual ao usuário único\", \"Só o usuário mestre, que a aplicação não deveria usar\"]]",
                    },
                    {
                        type: "code",
                        value: "// RotacaoStack.cs (trecho): o usuário da aplicação ganha segredo próprio, girado a cada 30 dias\n// banco, vpc e papelDaTarefa vêm das stacks de dados e de contêiner\n\nvar segredo = new DatabaseSecret(this, \"SegredoApp\", new DatabaseSecretProps { Username = \"loja_app\" })\n    .Attach(banco); // grava host, porta e engine no JSON do segredo\n\nvar sgRotacao = new SecurityGroup(this, \"Rotacao\", new SecurityGroupProps { Vpc = vpc });\nbanco.Connections.AllowDefaultPortFrom(sgRotacao);\n\nsegredo.AddRotationSchedule(\"RotacaoApp\", new RotationScheduleOptions\n{\n    AutomaticallyAfter = Duration.Days(30),\n    HostedRotation = HostedRotation.PostgreSqlSingleUser(new SingleUserHostedRotationOptions\n    {\n        Vpc = vpc,\n        VpcSubnets = new SubnetSelection { SubnetType = SubnetType.PRIVATE_WITH_EGRESS },\n        SecurityGroups = [sgRotacao],\n    }),\n});\n\nsegredo.GrantRead(papelDaTarefa); // a API lê o segredo em tempo de execução",
                    },
                    {
                        type: "text",
                        value: "## O segredo girou e a tarefa não viu\n\nO módulo 3 mostrou que o campo `secrets` da task definition é lido **só quando o contêiner sobe**. Com a senha do banco, isso derruba produção de um jeito traiçoeiro: com usuário único, as conexões já abertas continuam vivas depois da troca e escondem o problema por dias. Quando o pool precisa de uma conexão nova (pico, reinício do banco, failover do Multi-AZ), a autenticação falha, longe da hora da rotação e difícil de ligar a ela.\n\nHá dois desenhos que funcionam:\n\n- **Ler o segredo em tempo de execução**, a versão para banco da leitura com cache do módulo 3. No .NET, o Npgsql tem `UsePeriodicPasswordProvider`: a senha é relida a cada intervalo e vale para toda conexão física aberta depois disso. Entre a troca no banco e a leitura seguinte (até 1 minuto no exemplo), uma conexão nova pode falhar; o pool aquecido raramente abre conexão nessa janela, e um retry com espera cobre o resto. Como no módulo 3, quem lê é a task role, por isso o `GrantRead` no trecho anterior. O custo é uma chamada por minuto, perto de 43 mil chamadas por mês, ou 0,22 dólar por tarefa.\n- **Manter a variável de ambiente com usuários alternados** e garantir que toda tarefa seja trocada antes da rotação seguinte, com um deploy forçado depois de cada rotação.\n\nAntes da primeira rotação, o usuário `loja_app` precisa existir no PostgreSQL com a senha do segredo e só com as permissões das tabelas da aplicação. A função de rotação roda na sub-rede privada: ela precisa alcançar o banco (daí a regra no security group) e a API do Secrets Manager, pelo NAT Gateway ou por um endpoint de interface. Sem essa rota, a rotação falha por timeout e a senha não troca.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da API (trecho): senha lida do Secrets Manager e renovada sem reiniciar a tarefa\nusing System.Text.Json;\nusing Amazon.SecretsManager;\nusing Amazon.SecretsManager.Model;\n\nvar builder = WebApplication.CreateBuilder(args);\n\n// a configuração traz host, banco e usuário, e o ARN do segredo; nunca a senha\nvar arnSegredo = builder.Configuration[\"Banco:SegredoArn\"]\n    ?? throw new InvalidOperationException(\"Banco:SegredoArn não configurado\");\nvar secrets = new AmazonSecretsManagerClient();\n\nbuilder.Services.AddNpgsqlDataSource(builder.Configuration.GetConnectionString(\"Loja\")!, fonte =>\n    fonte.UsePeriodicPasswordProvider(async (_, ct) =>\n    {\n        var resposta = await secrets.GetSecretValueAsync(new GetSecretValueRequest { SecretId = arnSegredo }, ct);\n        using var json = JsonDocument.Parse(resposta.SecretString);\n        return json.RootElement.GetProperty(\"password\").GetString()!;\n    },\n    successRefreshInterval: TimeSpan.FromMinutes(1),\n    failureRefreshInterval: TimeSpan.FromSeconds(10)));\n\nvar app = builder.Build();\napp.Run();",
                    },
                    {
                        type: "text",
                        value: "## Menor privilégio, revisado\n\nPermissão cresce por acúmulo: alguém acrescenta `s3:*` para destravar um incidente e ninguém volta para tirar. Revisar é comparar o que foi concedido com o que foi usado:\n\n- **Último acesso** (aba \"Last accessed\" de cada role no IAM, sem custo): quais serviços e, para muitos deles, quais ações a role usou, e quando.\n- **Geração de política** do IAM Access Analyzer: lê até 90 dias de CloudTrail e propõe uma política com o que a role usou, sem custo além das leituras no S3. Exige uma trilha do CloudTrail ativa (adiante nesta aula) e não enxerga `iam:PassRole` nem ações de eventos de dados, então revise antes de aplicar.\n- **Analisador de acesso não usado**: aponta, de forma contínua, roles, chaves e senhas paradas e permissões nunca usadas. É pago: 0,20 dólar por role ou usuário analisado por mês (us-east-1, outubro de 2026).\n\nNo CDK, prefira os métodos `Grant...` (`fila.GrantConsumeMessages(papel)`, `segredo.GrantRead(papel)`), que geram ação e recurso exatos, sem curinga. Revise também a role de deploy da aula anterior.\n\n## WAF no load balancer\n\nO ALB do módulo 2 recebe qualquer requisição da internet. O AWS WAF fica na frente dele e avalia regras antes de a requisição chegar à API. O que vale saber antes de ligar, com preços de outubro de 2026 na us-east-1:\n\n- Custa 5 dólares por mês por web ACL (no console novo, \"protection pack\"), 1 dólar por mês por regra ou grupo gerenciado e 0,60 dólar por milhão de requisições, com até 1.500 WCU (unidades de capacidade) incluídas. O grupo básico da AWS, `AWSManagedRulesCommonRuleSet`, consome 700 WCU, e o de entradas maliciosas, 200.\n- **No ALB, o WAF só inspeciona os primeiros 8 KB do corpo**, e a regra `SizeRestrictions_BODY` do grupo básico **bloqueia** corpo maior que 8 KB. Ligue o grupo sem pensar e o upload de foto de produto e o JSON grande de pedido passam a receber 403. Por isso o exemplo deixa essa regra só contando: observe métricas e amostras antes de bloquear.\n- A regra de taxa conta requisições por IP: limite mínimo de 10, janela de 1, 2, 5 ou 10 minutos (5 por padrão). Ela barra robô insistente, não ataque distribuído.",
                    },
                    {
                        type: "code",
                        value: "// WafStack.cs: web ACL regional no ALB com regras gerenciadas e limite por IP\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.WAFv2;\nusing Constructs;\n\nnamespace Infra;\n\npublic sealed class WafStack : Stack\n{\n    public WafStack(Construct scope, string id, string arnDoAlb, IStackProps? props = null) : base(scope, id, props)\n    {\n        var acl = new CfnWebACL(this, \"AclApi\", new CfnWebACLProps\n        {\n            Scope = \"REGIONAL\", // ALB e API Gateway; CloudFront usa CLOUDFRONT\n            DefaultAction = new CfnWebACL.DefaultActionProperty { Allow = new CfnWebACL.AllowActionProperty() },\n            VisibilityConfig = Visibilidade(\"acl-api\"),\n            Rules = new object[]\n            {\n                new CfnWebACL.RuleProperty\n                {\n                    Name = \"regras-basicas\",\n                    Priority = 1,\n                    OverrideAction = new CfnWebACL.OverrideActionProperty { None = new Dictionary<string, object>() },\n                    Statement = new CfnWebACL.StatementProperty\n                    {\n                        ManagedRuleGroupStatement = new CfnWebACL.ManagedRuleGroupStatementProperty\n                        {\n                            VendorName = \"AWS\",\n                            Name = \"AWSManagedRulesCommonRuleSet\",\n                            // no ALB o WAF só enxerga 8 KB do corpo; esta regra bloquearia\n                            // upload e JSON grande, então ela só conta enquanto você observa\n                            RuleActionOverrides = new object[]\n                            {\n                                new CfnWebACL.RuleActionOverrideProperty\n                                {\n                                    Name = \"SizeRestrictions_BODY\",\n                                    ActionToUse = new CfnWebACL.RuleActionProperty { Count = new CfnWebACL.CountActionProperty() },\n                                },\n                            },\n                        },\n                    },\n                    VisibilityConfig = Visibilidade(\"regras-basicas\"),\n                },\n                new CfnWebACL.RuleProperty\n                {\n                    Name = \"entradas-maliciosas\",\n                    Priority = 2,\n                    OverrideAction = new CfnWebACL.OverrideActionProperty { None = new Dictionary<string, object>() },\n                    Statement = new CfnWebACL.StatementProperty\n                    {\n                        ManagedRuleGroupStatement = new CfnWebACL.ManagedRuleGroupStatementProperty\n                        {\n                            VendorName = \"AWS\",\n                            Name = \"AWSManagedRulesKnownBadInputsRuleSet\",\n                        },\n                    },\n                    VisibilityConfig = Visibilidade(\"entradas-maliciosas\"),\n                },\n                new CfnWebACL.RuleProperty\n                {\n                    Name = \"limite-por-ip\",\n                    Priority = 3,\n                    Action = new CfnWebACL.RuleActionProperty { Block = new CfnWebACL.BlockActionProperty() },\n                    Statement = new CfnWebACL.StatementProperty\n                    {\n                        RateBasedStatement = new CfnWebACL.RateBasedStatementProperty\n                        {\n                            Limit = 2000,             // requisições por IP dentro da janela\n                            EvaluationWindowSec = 300,\n                            AggregateKeyType = \"IP\",\n                        },\n                    },\n                    VisibilityConfig = Visibilidade(\"limite-por-ip\"),\n                },\n            },\n        });\n\n        new CfnWebACLAssociation(this, \"AclNoAlb\", new CfnWebACLAssociationProps\n        {\n            ResourceArn = arnDoAlb,\n            WebAclArn = acl.AttrArn,\n        });\n    }\n\n    private static CfnWebACL.VisibilityConfigProperty Visibilidade(string metrica) => new()\n    {\n        CloudWatchMetricsEnabled = true,\n        MetricName = metrica,\n        SampledRequestsEnabled = true,\n    };\n}",
                    },
                    {
                        type: "text",
                        value: "## Auditoria com CloudTrail\n\n\"Quem apagou o security group da API ontem às 23h?\" O CloudTrail registra as chamadas de API da conta, venham do console, da CLI, do SDK ou do CDK.\n\n- **Histórico de eventos**: vem ligado, sem custo, com 90 dias de eventos de gerenciamento, consultados por região. Não guarda eventos de dados (como leitura de objeto no S3) e não passa dos 90 dias.\n- **Trilha (trail)**: entrega os eventos num bucket S3, pelo tempo que você quiser. A primeira cópia dos eventos de gerenciamento não paga CloudTrail, só o armazenamento no S3; eventos de dados custam 0,10 dólar por 100 mil (us-east-1, outubro de 2026). Crie a trilha multirregião: a criada no console já é; pela CLI ou pela API, o padrão é uma região só. O construct `Trail` do CDK já vem multirregião, com eventos de serviços globais (IAM, STS) e validação de integridade dos arquivos.\n\nA trilha não é arquivo morto: regras do EventBridge sobre chamadas de API (\"AWS API Call via CloudTrail\") **só disparam com uma trilha ativa**, e a geração de política do Access Analyzer também depende dela. O exemplo avisa no SNS quando alguém desliga ou altera a trilha, o primeiro passo de quem quer apagar rastro.\n\nUm fato datado: o **CloudTrail Lake** (consulta SQL sobre os eventos) não aceita clientes novos desde 31/05/2026, e a AWS indica o CloudWatch para esse tipo de análise. Trilhas, Insights e o histórico de eventos seguem normais.",
                    },
                    {
                        type: "code",
                        value: "// AuditoriaStack.cs: trilha em todas as regiões e alerta se alguém mexer nela\nusing Amazon.CDK;\nusing Amazon.CDK.AWS.CloudTrail;\nusing Amazon.CDK.AWS.Events;\nusing Amazon.CDK.AWS.Events.Targets;\nusing Amazon.CDK.AWS.S3;\nusing Amazon.CDK.AWS.SNS;\nusing Constructs;\n\nnamespace Infra;\n\npublic sealed class AuditoriaStack : Stack\n{\n    public AuditoriaStack(Construct scope, string id, IStackProps? props = null) : base(scope, id, props)\n    {\n        var bucket = new Bucket(this, \"LogsAuditoria\", new BucketProps\n        {\n            BlockPublicAccess = BlockPublicAccess.BLOCK_ALL,\n            EnforceSSL = true,\n            RemovalPolicy = RemovalPolicy.RETAIN,\n            LifecycleRules = [new LifecycleRule { Expiration = Duration.Days(730) }],\n        });\n\n        // multi-região, eventos de serviços globais e validação de integridade vêm ligados por padrão\n        new Trail(this, \"Trilha\", new TrailProps { Bucket = bucket });\n\n        var alertas = new Topic(this, \"AlertasSeguranca\");\n        new Rule(this, \"TrilhaAlterada\", new RuleProps\n        {\n            EventPattern = new EventPattern\n            {\n                Source = [\"aws.cloudtrail\"],\n                DetailType = [\"AWS API Call via CloudTrail\"],\n                Detail = new Dictionary<string, object>\n                {\n                    [\"eventName\"] = new[] { \"StopLogging\", \"DeleteTrail\", \"UpdateTrail\" },\n                },\n            },\n            Targets = [new SnsTopic(alertas)],\n        });\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "Segurança em produção é rotina: segredo que gira sem derrubar a aplicação, permissão cortada pelo que foi usado de verdade, WAF observando antes de bloquear e uma trilha que responde quem fez o quê. Cada um desses itens tem um jeito silencioso de falhar, e conhecê-lo é metade da proteção.",
                    },
                ],
                questions: [
                    {
                        statement: "O histórico de eventos do CloudTrail vem ligado em toda conta, sem custo. O que ele guarda?",
                        difficulty: "facil",
                        options: [
                            { text: "Os eventos de gerenciamento do último ano, mas apenas da região us-east-1", isCorrect: false },
                            { text: "Os eventos de gerenciamento e de dados dos últimos 7 dias, na região principal", isCorrect: false },
                            { text: "Os eventos de gerenciamento dos últimos 90 dias, consultados região por região", isCorrect: true },
                            { text: "Todos os eventos, inclusive os de dados do S3, por 90 dias e em todas as regiões", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na rotação de senha de banco por função Lambda, qual é a vantagem da estratégia de usuários alternados sobre a de usuário único?",
                        difficulty: "facil",
                        options: [
                            { text: "Ela dispensa a função de rotação, porque o próprio PostgreSQL troca sozinho a senha dos dois usuários", isCorrect: false },
                            { text: "Ela não precisa de segredo de superusuário, porque cada usuário troca só a própria senha", isCorrect: false },
                            { text: "A credencial anterior segue válida até a rotação seguinte, e quem não releu o segredo não falha", isCorrect: true },
                            { text: "Ela derruba as conexões abertas na troca, o que força a aplicação a reler o segredo na hora", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de associar ao ALB uma web ACL com o `AWSManagedRulesCommonRuleSet` bloqueando, o upload de foto de produto (cerca de 2 MB) passou a receber 403. Qual é a causa mais provável?",
                        difficulty: "medio",
                        options: [
                            { text: "A regra `SizeRestrictions_BODY` do grupo bloqueia todo corpo acima de 8 KB", isCorrect: true },
                            { text: "O ALB passou a exigir HTTP/2 para corpo grande depois de ganhar o WAF", isCorrect: false },
                            { text: "O grupo de regras básico bloqueia por padrão toda requisição com POST", isCorrect: false },
                            { text: "A regra de taxa por IP contou cada parte do upload como requisição separada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você quer reduzir a política da role da API ao que ela realmente usa, com a geração de política do IAM Access Analyzer. O que essa geração exige?",
                        difficulty: "medio",
                        options: [
                            { text: "O analisador de acesso não usado ligado, que guarda o histórico da role no IAM", isCorrect: false },
                            { text: "O AWS Config gravando em todas as regiões, de onde vêm os dados da role", isCorrect: false },
                            { text: "Uma trilha do CloudTrail ativa, de onde ela lê as ações usadas no período", isCorrect: true },
                            { text: "Nada, porque ela lê o histórico de 90 dias que já vem ligado na conta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A senha do `loja_app` gira com a estratégia de usuário único, e a API no ECS recebe o segredo por variável de ambiente. Dois dias depois da rotação, um failover do RDS Multi-AZ derruba as conexões, e a API passa a falhar ao reconectar. Por que só agora?",
                        difficulty: "dificil",
                        options: [
                            { text: "A rotação derruba as conexões abertas, e o pool levou dois dias para perceber a queda", isCorrect: false },
                            { text: "O failover troca o endereço do banco, e o segredo ainda aponta para a instância antiga", isCorrect: false },
                            { text: "O Multi-AZ replica a senha com atraso, e a instância promovida ainda não conhece a senha nova", isCorrect: false },
                            { text: "As tarefas guardam a senha velha, e o pool vivia de conexões abertas antes da rotação", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Checklist de produção e fechamento",
                blocks: [
                    {
                        type: "text",
                        value: "# Checklist de produção e fechamento\n\n\"Está no ar\" e \"está pronto para produção\" são frases diferentes. A primeira diz que a API responde; a segunda diz que ela continua respondendo quando uma zona cai, quando um deploy sai errado, quando a fatura dobra no fim do mês e quando alguém pergunta quem mudou o quê. A AWS organiza essa conferência no **Well-Architected Framework**, com seis pilares: excelência operacional, segurança, confiabilidade, eficiência de performance, otimização de custos e sustentabilidade.\n\nO framework vem com uma ferramenta no console, a AWS Well-Architected Tool, sem custo: você registra a carga de trabalho, responde às perguntas de cada pilar e sai com uma lista de riscos priorizada. Há lentes para cargas específicas, como a de aplicações serverless e a de build de contêineres. Use como ritual de revisão a cada mudança grande, não como prova: a resposta honesta \"ainda não fazemos\" vale mais que a bonita. A tabela aplica os pilares ao sistema que a trilha construiu.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pilar\", \"O que o sistema já tem\", \"O que conferir agora\"], [\"Excelência operacional\", \"Infraestrutura em CDK, pipeline com OIDC, logs, métricas e traces\", \"Runbook para cada alarme; deploy pequeno e frequente; revisão de incidente sem caça a culpado\"], [\"Segurança\", \"Roles por serviço, sub-redes privadas, segredos no Secrets Manager, WAF e CloudTrail\", \"Rotação testada; revisão periódica de permissões; MFA no usuário root e nenhum uso dele\"], [\"Confiabilidade\", \"RDS Multi-AZ, health check e circuit breaker no ECS, DLQ nas filas\", \"Restauração de backup ensaiada; queda de tarefa e failover simulados; cotas de serviço com folga\"], [\"Eficiência de performance\", \"Fargate dimensionado, worker escalando pela fila, Lambda com memória medida\", \"Teste de carga antes de campanha; recomendações do Compute Optimizer para tarefas e funções\"], [\"Otimização de custos\", \"Budgets e alertas, retenção de logs definida, NAT revisado\", \"Tags de custo ativas; Savings Plans na base estável; Spot no worker\"], [\"Sustentabilidade\", \"Escala até zero onde dá, arm64 na Lambda\", \"Graviton no Fargate; apagar o que ninguém usa; ambiente de teste desligado fora do horário\"]]",
                    },
                    {
                        type: "text",
                        value: "## Custo: a revisão do mês\n\nO módulo 1 ligou Budgets e alertas; agora é cortar onde dói, com números de outubro de 2026 na us-east-1:\n\n- **Tags de custo**: o `Tags.Of(app).Add(\"projeto\", \"loja\")` no app CDK etiqueta tudo o que aceita tag, mas a tag só vira dimensão no Cost Explorer depois de ativada como tag de alocação de custo no console de Billing.\n- **Graviton**: no Fargate, ARM64 sai 20% mais barato que x86, por vCPU e por GB (0,03238 contra 0,04048 dólar por vCPU-hora); na Lambda, o GB-segundo em arm64 também custa 20% menos. Exige imagem arm64 (build em runner ARM ou multiplataforma) e `CpuArchitecture.ARM64` na task definition.\n- **Fargate Spot no worker**: até 70% de desconto sobre o Fargate, em troca de interrupção com aviso de dois minutos (SIGTERM na tarefa e evento no EventBridge). Serve para o worker idempotente que relê a fila; não serve para a única tarefa de um serviço. Quando falta capacidade Spot, o ECS espera, não troca por sob demanda: por isso o exemplo mantém uma tarefa de base em `FARGATE`.\n- **Savings Plans**: os Compute Savings Plans dão até 66% de desconto e cobrem Fargate e Lambda, além de EC2; os Database Savings Plans dão até 35% em RDS, Aurora e outros bancos. O compromisso é de gasto por hora, por 1 ou 3 anos: compre só para a base que roda sempre, nunca para o pico.\n\nA interrupção do Spot chega como o mesmo SIGTERM do scale-in do módulo 5, então o ajuste de desligamento de lá vale igual: `StopTimeout` de 120 segundos no contêiner, `HostOptions.ShutdownTimeout` um pouco abaixo e o worker parando a busca sem cancelar a mensagem em mãos. Muita gente liga o Spot sem esse ajuste, e aqui está por que isso dói: com os padrões de 30 segundos, cada interrupção corta a mensagem longa no meio, e ela volta para a fila só quando o visibility timeout vence.",
                    },
                    {
                        type: "code",
                        value: "// WorkerStack.cs (trecho): worker em Fargate Spot com uma tarefa sob demanda de base\n// vpc, repo e tag vêm do restante da stack\n\nvar cluster = new Cluster(this, \"Cluster\", new ClusterProps\n{\n    Vpc = vpc,\n    EnableFargateCapacityProviders = true, // registra FARGATE e FARGATE_SPOT no cluster\n});\n\nvar tarefa = new FargateTaskDefinition(this, \"WorkerTask\", new FargateTaskDefinitionProps\n{\n    Cpu = 512,\n    MemoryLimitMiB = 1024,\n});\ntarefa.AddContainer(\"worker\", new ContainerDefinitionOptions\n{\n    Image = ContainerImage.FromEcrRepository(repo, tag),\n    StopTimeout = Duration.Seconds(120), // o aviso do Spot dá dois minutos; o padrão do ECS é 30 s\n    Logging = LogDrivers.AwsLogs(new AwsLogDriverProps { StreamPrefix = \"worker\" }),\n});\n\nnew FargateService(this, \"Worker\", new FargateServiceProps\n{\n    Cluster = cluster,\n    TaskDefinition = tarefa,\n    DesiredCount = 4,\n    MinHealthyPercent = 100,\n    CircuitBreaker = new DeploymentCircuitBreaker { Enable = true, Rollback = true },\n    CapacityProviderStrategies =\n    [\n        new CapacityProviderStrategy { CapacityProvider = \"FARGATE\", Base = 1, Weight = 1 },\n        new CapacityProviderStrategy { CapacityProvider = \"FARGATE_SPOT\", Weight = 3 },\n    ],\n});",
                    },
                    {
                        type: "text",
                        value: "## Operação: o que mantém o sistema de pé\n\n- **Runtime e dependência têm data de validade.** O `dotnet8` da Lambda é descontinuado em 10/11/2026, o mesmo dia em que o .NET 8 sai de suporte. A AWS avisa com 180 dias de antecedência (e-mail, Health Dashboard e Trusted Advisor) e depois bloqueia a criação e a atualização de funções nesse runtime. Ponha atualização de runtime e de pacote no calendário, como se põe renovação de certificado.\n- **Serviço também fecha.** Só em 2026, o App Runner deixou de aceitar clientes novos, o Copilot CLI chegou ao fim do suporte, o CloudTrail Lake fechou para clientes novos e os SDKs do X-Ray entraram em manutenção. Infraestrutura como código e peças padrão (ECS, Lambda, RDS, SQS, OpenTelemetry) fazem da troca um projeto, não uma emergência.\n- **Ensaiar falha faz parte da operação.** Derrube uma tarefa, force o failover do RDS, restaure um backup num banco novo, rode o pipeline com um deploy que não sobe. O que não foi ensaiado é descoberto no pior horário.\n- **Incidente vira melhoria.** Todo alerta que acordou alguém precisa de runbook; toda falha que chegou ao cliente gera uma revisão escrita, focada em processo, sem caça ao culpado.\n\nA tabela final junta o que a trilha construiu, módulo a módulo, num checklist para revisar antes de cada mudança grande:",
                    },
                    {
                        type: "table",
                        value: "[[\"Área\", \"O que conferir\", \"Onde foi tratado\"], [\"Conta e acesso\", \"MFA no root e nenhum uso dele; acesso humano pelo IAM Identity Center; nenhuma chave de acesso de longa duração\", \"Módulo 1 e a aula de CI/CD\"], [\"Rede\", \"Banco e tarefas em sub-rede privada; security group por referência; endpoint de VPC onde o NAT pesa\", \"Módulo 2\"], [\"Deploy\", \"Imagem com tag imutável do commit; circuit breaker com rollback; pipeline com OIDC e aprovação\", \"Módulo 3 e a aula de CI/CD\"], [\"Dados\", \"Multi-AZ; backup com restauração testada; segredo com rotação\", \"Módulo 4 e a aula de segurança\"], [\"Mensageria\", \"DLQ em toda fila; consumidor idempotente; teto de concorrência no consumo\", \"Módulo 5 e a aula de Lambda na prática\"], [\"Observação\", \"Retenção de log definida; alarme com runbook; traces em OpenTelemetry\", \"Módulo 6\"], [\"Borda e auditoria\", \"WAF observado antes de bloquear; trilha multirregião com alerta\", \"Aula de segurança\"], [\"Custo\", \"Budgets, tags de custo ativas, Savings Plans na base e Spot no worker\", \"Módulo 1 e esta aula\"]]",
                    },
                    {
                        type: "quote",
                        value: "Colocar um sistema .NET no ar na AWS foi a parte visível da trilha; mantê-lo no ar é trabalho de todo dia: código e infraestrutura versionados, credenciais que expiram, falhas ensaiadas e uma conta revisada todo mês. Com essas peças no lugar, cada mudança nova vira um deploy pequeno e comum, e não um evento.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destes é um dos seis pilares do AWS Well-Architected Framework?",
                        difficulty: "facil",
                        options: [
                            { text: "Escalabilidade", isCorrect: false },
                            { text: "Sustentabilidade", isCorrect: true },
                            { text: "Interoperabilidade", isCorrect: false },
                            { text: "Observabilidade", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que acontece com uma tarefa em Fargate Spot quando a AWS precisa da capacidade de volta?",
                        difficulty: "facil",
                        options: [
                            { text: "Recebe SIGTERM e um evento no EventBridge, num aviso de dois minutos antes da parada", isCorrect: true },
                            { text: "É migrada para o Fargate sob demanda sem interromper o processo que está em execução", isCorrect: false },
                            { text: "Para na hora, sem aviso nenhum, e o ECS cria outra na mesma zona em seguida", isCorrect: false },
                            { text: "É pausada e retomada do mesmo ponto assim que a capacidade Spot voltar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você adicionou `Tags.Of(app).Add(\"projeto\", \"loja\")` no app CDK e fez o deploy, mas não consegue agrupar o custo por essa tag no Cost Explorer. O que falta?",
                        difficulty: "medio",
                        options: [
                            { text: "Usar a chave `aws:projeto`, prefixo que o Cost Explorer exige nas tags", isCorrect: false },
                            { text: "Esperar a fatura fechar, porque o Cost Explorer só lê tag no fim do mês", isCorrect: false },
                            { text: "Repetir a tag em cada construct, porque o `Tags.Of` vale só para a stack", isCorrect: false },
                            { text: "Ativar `projeto` como tag de alocação de custo no console de Billing", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A loja roda sempre 4 tarefas Fargate e chega a 12 na Black Friday. Como usar Compute Savings Plans sem desperdício?",
                        difficulty: "medio",
                        options: [
                            { text: "Comprar Database Savings Plans, que também cobrem o Fargate e a Lambda", isCorrect: false },
                            { text: "Comprometer o equivalente às 12 tarefas, porque o desconto só vale nas horas de pico do ano", isCorrect: false },
                            { text: "Não usar, porque Savings Plans valem apenas para instância EC2 reservada", isCorrect: false },
                            { text: "Comprometer o equivalente à base de 4 tarefas e deixar o pico no preço sob demanda", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O worker usa a estratégia do exemplo: `FARGATE` com `Base = 1` e peso 1, `FARGATE_SPOT` com peso 3, e 4 tarefas desejadas. Num dia em que falta capacidade Spot na região, o que acontece com o serviço?",
                        difficulty: "dificil",
                        options: [
                            { text: "As tarefas destinadas ao Spot esperam capacidade, e a tarefa de base em FARGATE segue rodando", isCorrect: true },
                            { text: "O ECS troca as tarefas Spot por FARGATE sob demanda e as devolve ao Spot quando ele voltar", isCorrect: false },
                            { text: "O ECS sobe as 4 tarefas em FARGATE, porque a base passa a valer como mínimo sob demanda", isCorrect: false },
                            { text: "O serviço inteiro para, porque a estratégia exige as duas capacidades disponíveis ao mesmo tempo", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "aws-na-pratica");
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO, workloadHours: HORAS })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        const n = await backfillExplicacoes(trilha.id, MODULOS);
        console.log("Trilha " + NOME + " já existe; " + n + " explicações atualizadas.");
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
                        explanation: q.explanation ?? null,
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
