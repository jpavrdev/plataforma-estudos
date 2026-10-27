# Monitor externo

Detecta e avisa, sem depender da VPS, quando a plataforma sai do ar para quem
acessa do Brasil: site ou API fora, página em branco, backup que não chegou ao
S3, WhatsApp da recuperação de senha desconectado, banco inacessível e disco
cheio.

## Decisões

- **Roda fora da VPS, na AWS em São Paulo (`sa-east-1`).** Se a VPS ou a rede da
  Hostinger cai, o monitor continua de pé. E ele vê o site como um aluno no
  Brasil: na queda de rede da Hostinger de 23/10/2026 o site respondia para quem
  estava fora do país e não respondia para ninguém aqui.
- **Aviso por email, via SNS.** O WhatsApp da plataforma roda na própria VPS e
  cairia junto com ela. O endereço é definido no deploy, nunca no código.
- **Aviso só na mudança de estado.** Cada verificação tolera algumas falhas
  seguidas antes de avisar (o reinício da VPS dá uns segundos de 502), avisa de
  novo quando volta, e lembra a cada 6 horas enquanto continuar falhando.
- **Nenhum dado pessoal passa pelo monitor.** Ele só vê status, tempos e
  contagens.
- **Nenhum segredo no repositório**, que é público. O token da API fica no SSM
  Parameter Store e no `.env.prod` da VPS.

## Verificações

| Nome | O que confere | Frequência | Avisa após |
|---|---|---|---|
| `site` | `GET https://ensinadev.com.br/` devolve 200 com `<div id="root">` em até 10 s | 1 min | 2 falhas seguidas |
| `api` | `GET https://ensinadev.com.br/api/health` devolve 200 com `{"status":"ok"}` em até 10 s | 1 min | 2 falhas seguidas |
| `banco` | campo `banco` do endpoint de dependências | 1 min | 2 falhas seguidas |
| `whatsapp` | campo `whatsapp` do endpoint de dependências (conexão `open`) | 1 min | 5 falhas seguidas |
| `disco` | campo `disco` do endpoint de dependências abaixo de 85% de uso | 1 min | 1 falha |
| `renderizacao` | um Chromium sem tela abre o site, o `#root` ganha conteúdo e a página não lança erro | 10 min | 2 falhas seguidas |
| `backup` | `postgres/estudos-<data UTC>.dump` existe no bucket com pelo menos 80% do tamanho do dump do dia anterior | 1 vez por dia, 07:00 UTC | 1 falha |

Quando o endpoint de dependências não responde (rede, tempo esgotado, 5xx ou o
429 do limitador da API), `banco`, `whatsapp` e `disco` não mudam de estado:
quem avisa é `api`. Quando ele responde 401 ou 404, a API está de pé e recusou
o monitor, o que é erro de configuração do token; aí as três viram falha, com o
conserto no detalhe do alerta. `whatsapp` como `nao-configurado` também é
falha, porque em produção a Evolution sempre está configurada.

Além disso, um alarme do CloudWatch avisa pelo mesmo tópico se alguma função do
monitor der erro ou parar de rodar: o monitor também é monitorado.

## Arquitetura do código

```
monitor/
  src/
    dominio/       regras puras, sem I/O: tipos, portas, política de alerta, mensagens
    verificacoes/  uma verificação por arquivo; recebe as portas e devolve o Resultado
    adaptadores/   o I/O de verdade: HTTP, S3, SNS, DynamoDB, SSM, Chromium
    handlers/      composição: monta adaptadores e verificações e exporta `handler`
  infra/           app CDK em TypeScript (pacote npm próprio)
```

- O domínio não importa nada de `adaptadores/` nem de SDK. As verificações
  dependem das **portas** declaradas em `dominio/portas.ts`, nunca de um
  adaptador concreto.
- Os handlers são o único lugar que instancia adaptadores.
- Um arquivo, uma responsabilidade. Nada de `any`. Bloco `catch` nunca vazio:
  ao menos um log. Comentário só para o porquê que o código não diz.
- Nomes em português, como no resto do repositório.

### Contrato entre as partes

`dominio/tipos.ts`:

```ts
export type Situacao = "ok" | "falha";

export interface Resultado {
    verificacao: string;      // "site", "api", "banco", "whatsapp", "disco", "renderizacao", "backup"
    situacao: Situacao;
    detalhe: string;          // frase curta para o email, sem dado pessoal
    medidoEm: string;         // ISO 8601
    latenciaMs?: number;
}

export interface Politica {
    falhasParaAlertar: number;
    lembreteACadaHoras: number;
}

export interface EstadoVerificacao {
    verificacao: string;
    situacao: Situacao;
    falhasSeguidas: number;
    desde: string;            // ISO 8601 do início da situação atual
    alertado: boolean;        // já avisou desta falha
    ultimoAlertaEm?: string;
}

export interface Alerta {
    tipo: "falha" | "recuperacao" | "lembrete";
    verificacao: string;
    assunto: string;
    mensagem: string;
}
```

`dominio/politica.ts` exporta a função pura
`avaliar(anterior: EstadoVerificacao | undefined, resultado: Resultado, politica: Politica, agora: Date): { estado: EstadoVerificacao; alerta?: Alerta }`
e o mapa `POLITICAS: Record<string, Politica>` com os números da tabela acima.

`dominio/portas.ts`:

```ts
export interface ClienteHttp {
    obter(url: string, opcoes?: { cabecalhos?: Record<string, string>; timeoutMs?: number }): Promise<{ status: number; corpo: string; latenciaMs: number }>;
}
export interface ArmazenamentoBackup {
    tamanhoDe(chave: string): Promise<number | null>;    // null se o objeto não existe
}
export interface Navegador {
    renderizar(url: string, timeoutMs: number): Promise<{ elementosNoRoot: number; errosDaPagina: string[] }>;
}
export interface RepositorioEstado {
    ler(verificacoes: string[]): Promise<Map<string, EstadoVerificacao>>;
    salvar(estado: EstadoVerificacao): Promise<void>;
}
export interface Notificador {
    enviar(alerta: Alerta): Promise<void>;
}
export interface FonteDeSegredo {
    token(): Promise<string>;
}
```

Handlers (cada um exporta `handler`):

| Arquivo | Verificações | Agenda |
|---|---|---|
| `src/handlers/frequente.ts` | `site`, `api`, `banco`, `whatsapp`, `disco` | a cada 1 min |
| `src/handlers/renderizacao.ts` | `renderizacao` | a cada 10 min |
| `src/handlers/backup.ts` | `backup` | todo dia às 07:00 UTC |

Variáveis de ambiente das funções:

| Variável | Uso |
|---|---|
| `URL_SITE` | `https://ensinadev.com.br/` |
| `URL_API` | `https://ensinadev.com.br/api/health` |
| `URL_DEPENDENCIAS` | `https://ensinadev.com.br/api/health/dependencias` |
| `PARAMETRO_TOKEN` | nome do parâmetro SecureString no SSM com o token da API |
| `TABELA_ESTADO` | tabela DynamoDB, chave de partição `verificacao` (string) |
| `TOPICO_ALERTAS` | ARN do tópico SNS |
| `BUCKET_BACKUP` | `ensinadev-backup-prod` |
| `PREFIXO_BACKUP` | `postgres/` |
| `REGIAO_BACKUP` | `us-east-2`, a região do bucket (o monitor roda em `sa-east-1`) |

O adaptador de `ArmazenamentoBackup` usa `ListObjectsV2` com o nome exato do
arquivo como prefixo e lê o tamanho na listagem. Assim o monitor só precisa de
`s3:ListBucket` restrito ao prefixo `postgres/`, e nunca de `s3:GetObject`: os
dumps têm dado pessoal dos alunos e o monitor não pode conseguir baixá-los.

### Endpoint de dependências na API

`GET /health/dependencias` (pelo Caddy, `/api/health/dependencias`), com
`Authorization: Bearer <MONITOR_TOKEN>`.

- Sem `MONITOR_TOKEN` configurado na API: 404, como se a rota não existisse.
- Token ausente ou errado: 401, comparando em tempo constante.
- Falha de dependência **não** vira 500: a resposta é 200 e o corpo diz o que
  falhou. Quem decide se é alerta é o monitor.
- Cada dependência tem timeout curto (3 s) e roda em paralelo.

```json
{
  "banco": { "situacao": "ok", "latenciaMs": 4 },
  "whatsapp": { "situacao": "ok", "estado": "open" },
  "disco": { "situacao": "ok", "usoPercentual": 34 }
}
```

`whatsapp.situacao` é `"nao-configurado"` quando a API não tem Evolution (dev).
`disco` mede o volume de uploads, que fica no disco da VPS.

## Testes

- Domínio e verificações com testes unitários (`node:test`) e portas falsas, sem
  rede.
- Handlers testados com portas falsas.
- `renderizacao` testada localmente contra um servidor de teste com uma página
  que renderiza e outra que quebra, usando o Chrome da máquina.
- Infra com `cdk synth` e asserções do `aws-cdk-lib/assertions`, inclusive de
  privilégio mínimo no IAM.

## Infraestrutura

App CDK em TypeScript no pacote `infra/`, com uma stack, `MonitorStack`, em
`sa-east-1`:

| Recurso | Para quê |
|---|---|
| Tabela DynamoDB sob demanda, chave `verificacao` | Estado de cada verificação. Fica retida se a stack for apagada. |
| Tópico SNS com assinatura de email | Alertas das verificações e dos alarmes. |
| Três funções Lambda em Node.js 24 | `ensinadev-monitor-frequente`, `-renderizacao` e `-backup`, uma por handler. |
| Três agendas do EventBridge Scheduler | A cada 1 min, a cada 10 min e às 07:00 UTC. |
| Três grupos de log `/aws/lambda/ensinadev-monitor-*` | Retenção de 14 dias. |
| Cinco alarmes do CloudWatch | Erro em cada função, `frequente` 5 min sem rodar e `renderizacao` 30 min sem rodar. |
| Uma role por função e uma por agenda | Privilégio mínimo, detalhado abaixo. |

A stack **não** cria o parâmetro do token: só recebe o nome dele (contexto
`parametroToken`, padrão `/ensinadev/monitor/token`). O email dos alertas vem do
contexto `emailAlertas`, sem valor padrão. Tudo leva a tag `projeto=ensinadev`.

| Função | Arquitetura | Memória | Tempo limite | Agenda |
|---|---|---|---|---|
| `frequente` | arm64 | 256 MB | 50 s | a cada 1 min |
| `renderizacao` | x86_64 | 1600 MB | 90 s | a cada 10 min |
| `backup` | arm64 | 256 MB | 30 s | 07:00 UTC |

Para conferir sem a AWS, em `infra/`: `npm test` e
`npx cdk synth -c emailAlertas=alertas@example.com`.

### Decisões da infraestrutura

- **Runtime `nodejs24.x`.** É o Node mais novo com disponibilidade geral na
  Lambda: o `nodejs26.x` está em prévia pública, sem SLA, com lançamento
  previsto para novembro de 2026
  ([runtimes da Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html),
  consultado em 23/10/2026). Também é o mais novo que o `@sparticuz/chromium`
  153 reconhece: ele só prepara as bibliotecas do Amazon Linux 2023 quando o
  runtime é Node 20, 22 ou 24 (`build/helper.js` do pacote).
- **Chromium instalado pelo `nodeModules` do `NodejsFunction`, em x86_64, com
  1600 MB.** O [README do `@sparticuz/chromium`](https://github.com/Sparticuz/chromium)
  pede o pacote fora do bundle (ele acha os binários por caminho relativo),
  avisa que o pacote npm só traz binário x64 (arm64 exige o
  `@sparticuz/chromium-min` com o binário baixado à parte) e recomenda 1600 MB
  ou mais. O `nodeModules` instala o `@sparticuz/chromium` e o `puppeteer-core`
  no pacote da função a partir do `package-lock.json` do monitor. Camada não
  compensa para uma função só e teria de ser publicada à mão; imagem de
  contêiner pede build com Docker e repositório no ECR; o `-min` baixaria o
  Chromium de uma URL externa a cada partida a frio, e o monitor não pode
  depender disso. Em arm64 a economia seria de uns 18 centavos de dólar por
  mês. O pacote da função fica com uns 103 MB descompactado (o limite é
  250 MB), e o Chromium ocupa uns 210 MB em `/tmp`, dentro dos 512 MB padrão.
- **`puppeteer-core` 25.11.0 e `@sparticuz/chromium` 153.0.0 com versão fixa,
  em par.** O `npm audit` aponta o `zod` 3 que vem pelo `chromium-bidi`
  ([GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)).
  Só que o `puppeteer-core` só importa o `chromium-bidi` no protocolo WebDriver
  BiDi. Com o Chrome o protocolo é CDP, e esse código nunca roda. Subir só o
  `puppeteer-core` para a 25.13, a primeira com `zod` 4, descasaria a versão do
  Chrome. Os dois sobem juntos quando sair o `@sparticuz/chromium`
  correspondente.
- **`frequente` e `backup` em arm64 com 256 MB.** Só fazem HTTP e chamadas à
  AWS, e o GB-s em arm64 custa 20% menos.
- **Tempo limite abaixo do intervalo da agenda**, para duas rodadas nunca
  disputarem o mesmo estado. A Lambda não repete rodada que falhou
  (`retryAttempts: 0`): a nova tentativa é a próxima rodada agendada, e o erro
  vai para o alarme.
- **Falta de execução com `FILL`.** Quando não roda, a Lambda não publica
  `Invocations`; o alarme usa `FILL(invocacoes, 0)` para enxergar o zero em vez
  de seguir avaliando o último ponto real.
- **Agendas no EventBridge Scheduler**, que a AWS recomenda no lugar das regras
  agendadas, hoje marcadas como legado
  ([EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html)).
- **SDK da AWS fora do bundle** (`@aws-sdk/*` e `@smithy/*`): as funções usam o
  SDK v3 que vem no runtime.
- **esbuild nos dois pacotes.** O `NodejsFunction` procura o esbuild a partir
  de `infra/` e o executa a partir de `monitor/` (`npx --no-install esbuild`).
  Sem ele, o CDK tenta empacotar em Docker.

### Privilégio mínimo

Cada função tem a própria role, sem política gerenciada:

- `logs:CreateLogStream` e `logs:PutLogEvents` só no próprio grupo de logs;
- `dynamodb:GetItem` e `dynamodb:PutItem` só nos itens das próprias
  verificações (condição `dynamodb:LeadingKeys`);
- `sns:Publish` só no tópico de alertas;
- `frequente`: `ssm:GetParameter` só no parâmetro do token, sem `kms:Decrypt`,
  porque a chave gerenciada `aws/ssm` já concede Decrypt a todos os principais
  da conta
  ([SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-restrict-decryption.html)).
  A consequência é que qualquer usuário ou role da conta com `ssm:GetParameter`
  nesse parâmetro lê o token; para restringir, troque por uma chave do KMS
  gerenciada pelo cliente (US$ 1 por mês) e dê `kms:Decrypt` só a esta role;
- `backup`: `s3:ListBucket` em `ensinadev-backup-prod` com `s3:prefix` em
  `postgres/*`. Nenhuma role tem `s3:GetObject`.

Cada agenda tem a própria role, que só invoca a própria função. Os testes de
`infra/src/permissoes.test.ts` conferem o conjunto exato de ações de cada role
e a ausência de `s3:GetObject`, `dynamodb:BatchGetItem`, curingas e KMS.

### Custo aproximado

Preços de `sa-east-1` da AWS Price List
(`https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/<serviço>/current/sa-east-1/index.json`),
consultada em 23/10/2026. Por mês: 43.200 execuções de `frequente`, 4.320 de
`renderizacao` e 30 de `backup`.

| Item | Uso por mês | Preço | Sem franquia | Com franquia |
|---|---|---|---|---|
| Lambda, computação | ~54 mil GB-s em x86 e ~16 mil em arm64 | US$ 0,0000166667 e US$ 0,0000133334 por GB-s | US$ 1,12 | US$ 0 (400 mil GB-s) |
| Lambda, requisições | ~47,6 mil | US$ 0,20 por milhão | US$ 0,01 | US$ 0 (1 milhão) |
| EventBridge Scheduler | ~47,6 mil invocações | US$ 1,70 por milhão | US$ 0,08 | US$ 0 (14 milhões) |
| DynamoDB sob demanda | ~220 mil leituras e ~220 mil gravações | US$ 0,1875 e US$ 0,9375 por milhão | US$ 0,25 | US$ 0,25 |
| Alarmes do CloudWatch | 5 | US$ 0,135 por alarme | US$ 0,68 | US$ 0 (10 alarmes) |
| CloudWatch Logs | ~50 MB | US$ 0,90 por GB | US$ 0,05 | US$ 0 (5 GB) |
| KMS, token relido a cada 15 min | até ~5 mil requisições | US$ 0,03 por 10 mil | US$ 0,02 | US$ 0 (20 mil) |
| SNS por email | só nas mudanças de estado | US$ 2 por 100 mil | US$ 0 | US$ 0 (mil emails) |
| **Total** | | | **~US$ 2,20** | **~US$ 0,25** |

As franquias são as mensais permanentes que constam da própria lista de preços.
O parâmetro padrão do SSM não é cobrado, e a listagem diária do S3 e o bucket
de assets do bootstrap do CDK ficam abaixo de um centavo.

## Deploy

Feito uma vez por quem tem as credenciais da conta, numa máquina com AWS CLI v2
e Node.js 24. Os comandos partem da raiz do repositório.

1. Instale as dependências dos dois pacotes:

   ```bash
   (cd monitor && npm ci) && (cd monitor/infra && npm ci)
   ```

2. Prepare a conta para o CDK em `sa-east-1` (só na primeira vez). O
   `-c emailAlertas` é exigido porque o bootstrap também sintetiza o app:

   ```bash
   cd monitor/infra
   CONTA=$(aws sts get-caller-identity --query Account --output text)
   npx cdk bootstrap "aws://$CONTA/sa-east-1" -c emailAlertas=voce@exemplo.com
   ```

3. Gere o token e guarde no SSM como SecureString, com a chave padrão `aws/ssm`:

   ```bash
   TOKEN=$(openssl rand -hex 32)
   aws ssm put-parameter --region sa-east-1 --name /ensinadev/monitor/token \
     --type SecureString --value "$TOKEN"
   ```

4. Ponha o mesmo token na VPS e recrie o backend, que só lê o `.env.prod` ao
   subir o contêiner. O valor pode ser lido de volta do SSM:

   ```bash
   aws ssm get-parameter --region sa-east-1 --name /ensinadev/monitor/token \
     --with-decryption --query Parameter.Value --output text
   ```

   Na VPS, na pasta do deploy (a do segredo `DEPLOY_PATH`), acrescente
   `MONITOR_TOKEN=<token>` em `backend/.env.prod` e rode:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps backend
   curl -s -o /dev/null -w "%{http_code}\n" https://ensinadev.com.br/api/health/dependencias
   ```

   O `curl` sem token deve responder 401. Se responder 404, o backend não leu o
   `MONITOR_TOKEN`.

5. Faça o deploy com o email que recebe os alertas. O CDK lista as permissões
   de IAM novas e pede confirmação; no fim imprime
   `MonitorStack.TopicoDeAlertas`, o ARN do tópico. Se o parâmetro tiver outro
   nome, acrescente `-c parametroToken=/outro/nome`.

   ```bash
   cd monitor/infra
   npx cdk deploy -c emailAlertas=voce@exemplo.com
   ```

6. Confirme a assinatura: chega um email "AWS Notification - Subscription
   Confirmation" no endereço informado, com o link "Confirm subscription". Sem
   essa confirmação nenhum alerta é entregue. Logo depois do primeiro deploy,
   os alarmes de falta de execução podem disparar e voltar ao normal antes de
   as funções rodarem pela primeira vez.

7. Teste um alerta:

   ```bash
   # O email chega? Use o ARN impresso no passo 5.
   aws sns publish --region sa-east-1 --topic-arn <ARN> \
     --subject "Teste do monitor" --message "A assinatura está funcionando."

   # O alarme avisa? Chega um ALARM e, na avaliação seguinte, um OK.
   aws cloudwatch set-alarm-state --region sa-east-1 \
     --alarm-name ensinadev-monitor-frequente-com-erro \
     --state-value ALARM --state-reason "teste manual"

   # As verificações rodam? A resposta resume a rodada, e o log mostra o resto.
   aws lambda invoke --region sa-east-1 --function-name ensinadev-monitor-frequente /dev/stdout
   aws logs tail /aws/lambda/ensinadev-monitor-frequente --region sa-east-1 --since 10m
   ```

Para trocar o token, repita os passos 3 (com `--overwrite`) e 4. O monitor
relê o parâmetro a cada 15 minutos.
