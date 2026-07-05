// Seed do simulado AWS Certified Developer Associate (DVA-C02). Idempotente: se o
// simulado já tiver questões, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-dva-c02.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-dva-c02.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "dva-c02";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    {
        statement:
            "Uma API de checkout roda em uma função Lambda com runtime Java. Todos os dias, no horário de pico, os primeiros usuários enfrentam alta latência por causa de cold starts. A equipe quer eliminar o cold start justamente nesse período previsível. Qual é a melhor abordagem?",
        explanation:
            "A concorrência provisionada mantém ambientes já inicializados (fase Init concluída), eliminando o cold start, e o Application Auto Scaling agendado sobe o pool pouco antes do pico previsível. A concorrência reservada apenas isola uma fatia do pool da conta: não pré-aquece ambientes, então o cold start continua. Mais memória acelera a execução e dá mais CPU, mas não elimina a partida a frio. O timeout limita a duração da invocação e nada tem a ver com cold start.",
        topic: "Lambda",
        options: [
            [
                "Configurar concorrência provisionada em um alias da função e usar o Application Auto Scaling agendado para elevá-la pouco antes do pico.",
                true,
            ],
            [
                "Configurar concorrência reservada na função, garantindo capacidade exclusiva a ela.",
                false,
            ],
            ["Aumentar a memória para 10.240 MB, pois isso desliga o cold start.", false],
            ["Aumentar o timeout da função para os 15 minutos máximos.", false],
        ],
    },
    {
        statement:
            "Ao tentar configurar concorrência provisionada, um desenvolvedor recebe um erro porque apontou a configuração para o $LATEST. O que ele precisa fazer para que funcione?",
        explanation:
            "A concorrência provisionada precisa apontar para uma versão publicada ou um alias, nunca para o $LATEST, porque o pool pré-aquecido exige um alvo estável e imutável, e o $LATEST muda a cada atualização de código. Concorrência reservada é um conceito distinto e não é pré-requisito. Variáveis de ambiente e um suposto tempo de espera não têm relação com o erro.",
        topic: "Lambda",
        options: [
            [
                "Publicar uma versão (ou usar um alias) e aplicar a concorrência provisionada sobre essa versão ou alias, pois ela exige um alvo imutável.",
                true,
            ],
            ["Habilitar antes a concorrência reservada no $LATEST.", false],
            ["Remover as variáveis de ambiente, que são incompatíveis com o $LATEST.", false],
            ["Aguardar, pois o $LATEST só aceita concorrência provisionada após 24 horas.", false],
        ],
    },
    {
        statement:
            "Uma função de processamento em lote passou a escalar para milhares de execuções concorrentes e esgotou o pool de concorrência da conta, causando throttling (HTTP 429) na API principal, que está na mesma conta e região. Como limitar a função de lote e proteger a API, sem custo adicional?",
        explanation:
            "A concorrência reservada age como teto e piso e não tem custo adicional: reservar um valor para a função de lote limita quantas execuções concorrentes ela pode ter, devolvendo o restante do pool para a API. A concorrência provisionada tem custo contínuo e serve para pré-aquecer ambientes, não para impor um teto. Aumentar o timeout não reduz a concorrência. Uma DLQ trata mensagens que falham, não o esgotamento de concorrência.",
        topic: "Lambda",
        options: [
            [
                "Definir concorrência reservada na função de lote, criando um teto para ela e preservando o restante do pool para a API.",
                true,
            ],
            [
                "Configurar concorrência provisionada na função de lote para que ela pare de escalar.",
                false,
            ],
            ["Aumentar o timeout da função de lote para que processe mais devagar.", false],
            ["Anexar uma dead-letter queue à API principal.", false],
        ],
    },
    {
        statement:
            "Antes de promover uma nova versão para 100% do tráfego de produção, a equipe quer enviar apenas 10% das requisições para ela e observar as métricas de erro. Que recurso do Lambda permite esse rollout gradual?",
        explanation:
            "Um alias com pesos de roteamento (weighted alias) envia uma fração do tráfego para uma versão adicional, permitindo um deploy canário, e você ajusta o peso até promover 100%. Concorrência provisionada trata de pré-aquecimento, não de divisão de tráfego. Duas funções atrás de um ALB até funcionaria, mas é bem mais complexo e não é o recurso nativo do Lambda para isso. Uma variável de ambiente não distribui tráfego entre versões.",
        topic: "Lambda",
        options: [
            [
                "Um alias com pesos de roteamento (weighted alias), dividindo o tráfego entre duas versões.",
                true,
            ],
            ["Concorrência provisionada apontando para as duas versões ao mesmo tempo.", false],
            ["Duas funções separadas atrás de um Application Load Balancer.", false],
            ["Uma variável de ambiente indicando o percentual de rollout.", false],
        ],
    },
    {
        statement:
            "Um deploy recente moveu o alias prod para uma nova versão publicada que introduziu um bug em produção. A equipe usa aliases apontando para versões publicadas. Qual é a maneira mais rápida e segura de reverter?",
        explanation:
            "Como versões publicadas são snapshots imutáveis, basta mover o alias prod de volta para a versão boa anterior para reverter de forma imediata e confiável. Editar o $LATEST manualmente é lento e propenso a erro, e o alias aponta para uma versão publicada, não para o $LATEST. Publicar a partir do estado com bug não reverte nada, e recriar a função é desnecessário e arriscado.",
        topic: "Lambda",
        options: [
            [
                "Apontar o alias prod de volta para a versão publicada anterior, que permanece imutável e intacta.",
                true,
            ],
            ["Editar o código do $LATEST desfazendo manualmente as alterações.", false],
            ["Publicar uma nova versão a partir do estado atual com bug.", false],
            ["Excluir a função e recriá-la do zero.", false],
        ],
    },
    {
        statement:
            "O pacote de implantação de uma função ultrapassou o limite de tamanho por causa de bibliotecas pesadas que também são usadas por outras funções da equipe. Qual solução reduz o tamanho do pacote e ainda reaproveita essas dependências entre as funções?",
        explanation:
            "Um layer é um pacote separado de dependências (até 5 por função, extraído em /opt) que mantém o pacote da função abaixo da cota e pode ser reaproveitado por várias funções. Aumentar a memória não muda o limite de tamanho do pacote. Migrar para imagem de contêiner resolveria o tamanho, mas é uma mudança pesada e não promove o mesmo reaproveitamento simples de uma dependência comum. Publicar uma versão não altera o tamanho do pacote.",
        topic: "Lambda",
        options: [
            [
                "Mover as dependências para um Lambda layer e anexá-lo às funções que precisam delas.",
                true,
            ],
            ["Aumentar a memória da função para 10.240 MB.", false],
            ["Migrar para imagem de contêiner de 10 GB apenas para caber as bibliotecas.", false],
            ["Publicar uma nova versão da função.", false],
        ],
    },
    {
        statement:
            "Uma função consome mensagens de uma fila SQS por meio de um event source mapping, mas as invocações falham com erros de permissão ao tentar receber e apagar mensagens. Onde a permissão deve ser concedida?",
        explanation:
            "No modelo poll (event source mapping), é o próprio Lambda que lê a origem, então a permissão vai na execution role da função, com as ações de leitura e exclusão da fila. A resource-based policy serve ao modelo push (quando um serviço como S3 ou SNS invoca a função), não para o Lambda ler a fila. A policy do usuário do deploy não afeta a execução, e filas SQS não têm bucket policy.",
        topic: "Lambda",
        options: [
            [
                "Na execution role (IAM role) da função, com ações como sqs:ReceiveMessage, sqs:DeleteMessage e sqs:GetQueueAttributes.",
                true,
            ],
            ["Em uma resource-based policy na função, criada com lambda add-permission.", false],
            ["Em uma policy anexada ao usuário IAM que fez o deploy.", false],
            ["Em uma bucket policy da fila.", false],
        ],
    },
    {
        statement:
            "Uma função processa lotes de mensagens de uma fila SQS. Quando uma única mensagem do lote falha, o lote inteiro é reentregue e mensagens já processadas com sucesso são reprocessadas. Qual é a forma recomendada de reportar somente as mensagens com falha?",
        explanation:
            "Com ReportBatchItemFailures habilitado, a função devolve apenas os identificadores das mensagens que falharam, e só essas voltam para a fila, evitando reprocessar as bem-sucedidas. Reduzir o batch size para 1 elimina os lotes, mas desperdiça a eficiência do batching. Retornar sucesso mesmo com falha esconde o erro e perde a mensagem. A batching window controla o tempo de agrupamento, não o tratamento de falha parcial.",
        topic: "Lambda",
        options: [
            [
                "Habilitar ReportBatchItemFailures no event source mapping e retornar batchItemFailures com os itemIdentifier das mensagens que falharam.",
                true,
            ],
            ["Reduzir o batch size para 1, isolando cada mensagem.", false],
            ["Capturar a exceção e retornar sucesso mesmo quando há falha.", false],
            ["Definir a batching window em 0 segundo para desativar o agrupamento.", false],
        ],
    },
    {
        statement:
            "Selecione DUAS afirmações corretas sobre a invocação assíncrona (InvocationType Event) do AWS Lambda.",
        explanation:
            "Na invocação assíncrona (usada por S3, SNS e EventBridge), o Lambda enfileira o evento, responde 202 na hora e não devolve o resultado ao chamador; em falha, ele re-tenta 2 vezes por padrão e pode encaminhar o evento a uma DLQ ou destino onFailure. Receber o retorno na resposta e o uso pelo API Gateway descrevem a invocação síncrona (RequestResponse). E há, sim, tratamento de falhas via DLQ/destinos, então os eventos não são simplesmente descartados.",
        topic: "Lambda",
        options: [
            [
                "O Lambda coloca o evento em uma fila interna e responde 202 Accepted imediatamente, sem devolver o resultado ao chamador.",
                true,
            ],
            [
                "Em caso de erro, o Lambda re-tenta automaticamente (2 vezes por padrão) e, esgotadas as tentativas, pode enviar o evento a uma dead-letter queue ou a um destino onFailure.",
                true,
            ],
            ["O chamador aguarda a função terminar e recebe o retorno na resposta.", false],
            [
                "É o modo que o API Gateway usa para invocar a função quando um usuário faz uma requisição HTTP.",
                false,
            ],
            [
                "Não existe forma de tratar falhas: os eventos que falham são sempre descartados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação faz 40 leituras fortemente consistentes por segundo, cada uma retornando um item de 10 KB. Quantas RCUs de leitura são necessárias?",
        explanation:
            "Arredonde o tamanho primeiro: teto(10 KB / 4 KB) = 3 unidades por leitura. Como é fortemente consistente, multiplique direto: 3 x 40 = 120 RCUs. 40 ignoraria o arredondamento do tamanho; 60 seria o valor de uma leitura eventualmente consistente (metade); 240 corresponderia a leituras transacionais (o dobro).",
        topic: "DynamoDB",
        options: [
            ["120 RCUs", true],
            ["40 RCUs", false],
            ["60 RCUs", false],
            ["240 RCUs", false],
        ],
    },
    {
        statement:
            "A mesma aplicação passa a fazer 60 leituras por segundo de itens de 6 KB, agora EVENTUALMENTE consistentes. Quantas RCUs são necessárias?",
        explanation:
            "Primeiro o tamanho: teto(6 KB / 4 KB) = 2 unidades por leitura. Multiplique pelas leituras: 2 x 60 = 120. Como é eventualmente consistente, divida por 2: 120 / 2 = 60 RCUs. 120 seria o caso fortemente consistente; 30 dividiria duas vezes; 90 não corresponde a nenhuma regra.",
        topic: "DynamoDB",
        options: [
            ["60 RCUs", true],
            ["120 RCUs", false],
            ["30 RCUs", false],
            ["90 RCUs", false],
        ],
    },
    {
        statement:
            "Uma tabela precisa suportar 10 escritas TRANSACIONAIS por segundo, cada uma gravando um item de 2 KB. Quantas WCUs são necessárias?",
        explanation:
            "Arredonde o tamanho em blocos de 1 KB: teto(2 KB / 1 KB) = 2 unidades por escrita. Multiplique pelas escritas: 2 x 10 = 20. Como é transacional, dobre: 20 x 2 = 40 WCUs. 20 seria uma escrita padrão (não transacional); 10 ignoraria o tamanho; 80 dobraria a mais.",
        topic: "DynamoDB",
        options: [
            ["40 WCUs", true],
            ["20 WCUs", false],
            ["10 WCUs", false],
            ["80 WCUs", false],
        ],
    },
    {
        statement:
            "Uma tabela já está em produção e surgiu um novo padrão de acesso: consultar os itens por um atributo que não faz parte da chave primária, agrupando por ele. A equipe não pode recriar a tabela. Qual recurso resolve isso?",
        explanation:
            "Um GSI pode ser criado a qualquer momento, mesmo com a tabela em produção, e usa chaves próprias, permitindo Query eficiente pelo novo atributo. Um LSI só pode ser criado junto com a tabela, o que exigiria recriá-la. A partition key de uma tabela não pode ser alterada depois de criada. Um Scan com filtro lê a tabela inteira e paga capacidade por tudo, sendo caro e ineficiente.",
        topic: "DynamoDB",
        options: [
            ["Criar um Global Secondary Index (GSI) com esse atributo como partition key.", true],
            ["Criar um Local Secondary Index (LSI) sobre o novo atributo.", false],
            ["Alterar a partition key da tabela existente.", false],
            ["Fazer um Scan com FilterExpression a cada consulta.", false],
        ],
    },
    {
        statement:
            "Ao modelar uma tabela nova, a equipe sabe que precisará: (1) consultar itens da MESMA partition key por uma ordenação alternativa e (2) obter leituras fortemente consistentes nesse índice. Qual índice atende, e quando ele deve ser criado?",
        explanation:
            "O LSI mantém a mesma partition key da tabela, permite uma sort key alternativa e é o único índice secundário que suporta leitura fortemente consistente, mas precisa ser criado no momento da criação da tabela. O GSI só oferece leitura eventualmente consistente e usa chaves próprias. E, ao contrário do que dizem os distratores, o LSI não pode ser adicionado depois que a tabela existe.",
        topic: "DynamoDB",
        options: [
            [
                "Um LSI, que compartilha a partition key da tabela e suporta leitura fortemente consistente, criado obrigatoriamente junto com a tabela.",
                true,
            ],
            [
                "Um GSI, criado junto com a tabela para permitir leitura fortemente consistente.",
                false,
            ],
            [
                "Um GSI, adicionado depois, já que só ele oferece leitura fortemente consistente.",
                false,
            ],
            ["Um LSI, que pode ser adicionado a qualquer momento após a criação da tabela.", false],
        ],
    },
    {
        statement:
            "Selecione TRÊS características corretas de um Global Secondary Index (GSI) no DynamoDB.",
        explanation:
            "O GSI é flexível: usa chaves próprias (partition e sort diferentes), pode ser criado a qualquer momento e, no modo provisionado, tem throughput próprio, como uma tabela sombra. Ele NÃO suporta leitura fortemente consistente (só eventual) e NÃO precisa ser criado junto com a tabela; criar na criação da tabela e permitir leitura forte são características do LSI.",
        topic: "DynamoDB",
        options: [
            ["Pode ter partition key e sort key totalmente diferentes das da tabela base.", true],
            ["Pode ser criado a qualquer momento, mesmo com a tabela já em produção.", true],
            [
                "No modo provisionado, possui throughput (RCU/WCU) próprio, separado da tabela.",
                true,
            ],
            ["Suporta leitura fortemente consistente.", false],
            ["Deve ser criado obrigatoriamente junto com a tabela.", false],
        ],
    },
    {
        statement:
            "Sempre que um item da tabela Pedidos é criado, alterado ou removido, é preciso reagir à mudança para replicar o dado em outra tabela e atualizar um contador agregado. Qual recurso captura essas alterações para acionar uma função Lambda?",
        explanation:
            "O DynamoDB Streams é um log ordenado de alterações em nível de item (retido por 24h) que serve como event source poll para uma Lambda, ideal para replicar, notificar e atualizar agregados. Um Scan periódico é caro e não é orientado a evento. O TTL apenas expira itens; não é um mecanismo de notificação de todas as mudanças. A tabela não publica sozinha no SNS: seria necessário processar o Stream com uma Lambda.",
        topic: "DynamoDB",
        options: [
            ["DynamoDB Streams, que funciona como event source (modelo poll) para a Lambda.", true],
            ["Um Scan periódico da tabela para detectar o que mudou.", false],
            ["O TTL da tabela, que notifica cada alteração.", false],
            ["Publicar diretamente em um tópico SNS a partir da tabela, sem código.", false],
        ],
    },
    {
        statement:
            "Uma aplicação de leitura muito intensa pede repetidamente os mesmos itens de uma tabela DynamoDB e precisa reduzir a latência de milissegundos para microssegundos, sem reescrever a lógica de acesso. Qual solução é a mais indicada?",
        explanation:
            "O DAX é um cache em memória específico do DynamoDB, com latência de microssegundos e a mesma API, então acelera leituras repetidas quase sem mudança de código (é write-through). O ElastiCache é um cache genérico que exigiria integração e lógica próprias. Um GSI cria uma nova forma de consulta, mas não é um cache e não leva a leitura a microssegundos. Aumentar RCUs melhora vazão, não a latência a esse nível.",
        topic: "DynamoDB",
        options: [
            [
                "Amazon DynamoDB Accelerator (DAX), um cache em memória que usa a mesma API do DynamoDB.",
                true,
            ],
            [
                "Amazon ElastiCache, reescrevendo a aplicação para gerenciar o cache manualmente.",
                false,
            ],
            ["Adicionar um GSI para acelerar as leituras repetidas.", false],
            ["Aumentar as RCUs provisionadas da tabela.", false],
        ],
    },
    {
        statement:
            "Selecione DUAS afirmações corretas sobre a leitura fortemente consistente no DynamoDB.",
        explanation:
            "A leitura fortemente consistente consome 1 RCU cheio (o dobro dos 0,5 RCU da eventual) e não está disponível em GSI, que só oferece consistência eventual. O padrão do DynamoDB é a leitura eventualmente consistente, não a forte. E o DAX serve apenas leitura eventualmente consistente, não repassa consistência forte. Nenhuma leitura é gratuita: a eventual custa metade, mas não zero.",
        topic: "DynamoDB",
        options: [
            [
                "Custa o dobro de uma leitura eventualmente consistente (1 RCU contra 0,5 RCU por item de até 4 KB).",
                true,
            ],
            ["Não está disponível ao consultar um Global Secondary Index (GSI).", true],
            ["É o modo de leitura padrão do DynamoDB.", false],
            ["As leituras servidas pelo DAX também são fortemente consistentes.", false],
            ["É gratuita, ao contrário da leitura eventual.", false],
        ],
    },
    {
        statement:
            "Uma função Lambda por trás de uma REST API do API Gateway lê path, query string, headers e body a partir do objeto event e retorna um objeto contendo statusCode, headers e body. Qual tipo de integração está em uso?",
        explanation:
            "No AWS_PROXY, o API Gateway entrega a requisição inteira no event e devolve exatamente o objeto retornado pela função (statusCode, headers, body), sem mapeamento. A integração MOCK não chama backend algum. HTTP_PROXY encaminha para um endpoint HTTP, não para uma Lambda. Na integração custom (AWS), o formato é montado por mapping templates VTL, e não pelo retorno direto da função.",
        topic: "API Gateway",
        options: [
            [
                "Integração Lambda proxy (AWS_PROXY), que passa a requisição inteira e devolve exatamente o que a função retornar.",
                true,
            ],
            ["Integração MOCK.", false],
            ["Integração HTTP_PROXY.", false],
            ["Integração custom/non-proxy (AWS) com mapping template VTL.", false],
        ],
    },
    {
        statement:
            "Para uma API que sofre requisições cross-origin do navegador, é preciso responder ao preflight OPTIONS do CORS devolvendo apenas os headers Access-Control-Allow-*, sem acionar nenhum backend. Qual tipo de integração é o recomendado?",
        explanation:
            "A integração MOCK devolve uma resposta gerada pelo próprio API Gateway, sem backend, o que é perfeito para o OPTIONS do CORS, que só precisa retornar headers. Usar AWS_PROXY ou HTTP acionaria um backend desnecessário só para devolver cabeçalhos. Uma WebSocket API é para comunicação bidirecional em tempo real, nada a ver com o preflight de CORS.",
        topic: "API Gateway",
        options: [
            ["Integração MOCK, que responde a partir de um template sem chamar backend.", true],
            ["Integração AWS_PROXY para uma função Lambda.", false],
            ["Integração HTTP custom apontando para um serviço externo.", false],
            ["Uma WebSocket API.", false],
        ],
    },
    {
        statement:
            "Uma equipe quer atender os ambientes dev e prod usando a MESMA função Lambda, fazendo cada stage do API Gateway apontar para um alias diferente da função (dev e prod). Qual recurso torna isso possível?",
        explanation:
            "As stage variables são pares chave-valor por stage; ao colocá-las na URI de integração (por exemplo, apontando para o alias da função), o mesmo API Gateway roteia cada stage para o alias correto do Lambda. API keys identificam clientes num usage plan, não roteiam para aliases. Cache reduz latência, e concorrência reservada é um controle do Lambda: nenhum dos dois resolve o roteamento por ambiente.",
        topic: "API Gateway",
        options: [
            [
                "Stage variables usadas na URI de integração para apontar ao alias correto do Lambda.",
                true,
            ],
            ["API keys diferentes em cada ambiente.", false],
            ["Cache habilitado por stage.", false],
            ["Concorrência reservada diferente em cada stage.", false],
        ],
    },
    {
        statement:
            "Uma API precisa autorizar usuários que fazem login e recebem um JWT, validando o token a cada requisição sem que a equipe escreva qualquer código de autorização. Qual mecanismo de autorização atende a esse requisito?",
        explanation:
            "Com o autorizador Cognito user pools, o API Gateway valida o JWT (assinatura e expiração) contra o pool sem nenhum código seu, exatamente o que o cenário pede. O Lambda authorizer também valida tokens, mas exige que você escreva a função de autorização. A autorização IAM é para chamadas assinadas entre serviços/contas AWS. E uma API key apenas identifica o chamador num usage plan: ela não autentica.",
        topic: "API Gateway",
        options: [
            [
                "Um autorizador do tipo Amazon Cognito user pools, que valida o JWT contra o pool automaticamente.",
                true,
            ],
            [
                "Um Lambda authorizer, escrevendo uma função que retorna uma policy Allow/Deny.",
                false,
            ],
            ["Autorização IAM (SigV4), assinando a requisição com credenciais AWS.", false],
            ["Uma API key enviada no header x-api-key.", false],
        ],
    },
    {
        statement:
            "Selecione DUAS afirmações corretas sobre o throttling padrão do API Gateway no nível da conta, por região.",
        explanation:
            "O limite padrão por região é de 10.000 req/s em regime permanente, com burst de 5.000 requisições. O excedente recebe HTTP 429 Too Many Requests, não 503. A ordem de avaliação vai do mais específico para o mais geral (usage plan por cliente antes de método antes de conta), então a conta é avaliada por último, não primeiro. E esses limites são soft: podem ser aumentados via Service Quotas.",
        topic: "API Gateway",
        options: [
            ["O limite de regime permanente é de 10.000 requisições por segundo.", true],
            ["O burst é de 5.000 requisições.", true],
            ["As requisições que excedem o limite recebem HTTP 503 Service Unavailable.", false],
            ["O limite da conta é avaliado antes dos limites de usage plan por cliente.", false],
            ["Os limites de conta são rígidos e não podem ser aumentados.", false],
        ],
    },
    {
        statement:
            "Uma aplicação web quer permitir que o navegador do usuário envie um arquivo diretamente para um bucket S3, sem passar pelo backend e sem expor credenciais da AWS. Qual recurso usar, e o que limita o que essa URL pode fazer?",
        explanation:
            "Uma presigned URL de PUT permite o upload direto do navegador para o S3 e carrega as permissões da identidade que a assinou (fica limitada, portanto, ao que o signatário pode fazer, como s3:PutObject) e a uma única operação até expirar. Tornar o bucket público ou usar ACL/bucket policy abertas expõe o bucket muito além do necessário, e é justamente o que a presigned URL evita.",
        topic: "S3",
        options: [
            [
                "Uma presigned URL de PUT; ela herda as permissões da identidade que a assinou (que precisa ter s3:PutObject).",
                true,
            ],
            ["Tornar o bucket público para aceitar uploads de qualquer origem.", false],
            ["Uma ACL pública de escrita no objeto.", false],
            ["Uma bucket policy concedendo s3:* a todos (Principal *).", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de uma trilha de auditoria no CloudTrail de cada operação de criptografia e descriptografia dos objetos, além de controle e rotação sobre a chave. Qual opção de criptografia server-side atende a esse requisito?",
        explanation:
            "O SSE-KMS mantém a chave no AWS KMS, o que dá controle, política e rotação da chave e, principalmente, uma trilha de auditoria no CloudTrail de cada uso. O SSE-S3 é gerenciado inteiramente pelo S3 e não oferece auditoria por chave. O SSE-C exige que você envie a chave a cada requisição e não fornece o mesmo registro gerenciado. Auditoria não acontece por acaso sem a escolha certa de criptografia.",
        topic: "S3",
        options: [
            ["SSE-KMS, com a chave no AWS KMS.", true],
            ["SSE-S3, com chaves gerenciadas pelo próprio S3.", false],
            ["SSE-C, com a chave fornecida pelo cliente a cada requisição.", false],
            ["Nenhuma criptografia é necessária para haver auditoria.", false],
        ],
    },
    {
        statement:
            "Um requisito de conformidade determina que o dado NÃO pode chegar em texto puro ao S3 em momento algum, e a empresa quer manter o controle das chaves ponta a ponta. Qual abordagem atende a isso?",
        explanation:
            "Na criptografia client-side, você cifra antes de enviar e o S3 nunca vê o texto puro nem toca nas suas chaves, o que é exatamente o requisito. Todas as opções SSE (S3, KMS e C) cifram no servidor, ou seja, o S3 recebe o dado em texto puro e cifra ele mesmo; no SSE-C você ainda envia a chave ao S3. Portanto, nenhuma opção SSE satisfaz a exigência de o dado não chegar em claro.",
        topic: "S3",
        options: [
            [
                "Criptografia client-side: cifrar o dado antes do upload, de modo que o S3 só veja texto cifrado.",
                true,
            ],
            ["SSE-S3, deixando o S3 cifrar com AES-256.", false],
            ["SSE-KMS, cifrando no servidor com uma chave do KMS.", false],
            ["SSE-C, enviando a própria chave para o S3 cifrar.", false],
        ],
    },
    {
        statement:
            "Quando um objeto é criado, é preciso disparar automaticamente o processamento do arquivo. Para quais destinos as notificações de evento do S3 podem enviar eventos diretamente?",
        explanation:
            "As notificações de evento do S3 podem acionar diretamente AWS Lambda, Amazon SQS e Amazon SNS, e também o Amazon EventBridge para cenários mais avançados. EC2, RDS, EBS, DynamoDB e Redshift não são destinos diretos dessas notificações, e não é verdade que só a Lambda seja suportada.",
        topic: "S3",
        options: [
            ["AWS Lambda, Amazon SQS e Amazon SNS (além do Amazon EventBridge).", true],
            ["Amazon EC2, Amazon RDS e Amazon EBS.", false],
            ["Somente AWS Lambda.", false],
            ["Amazon DynamoDB e Amazon Redshift.", false],
        ],
    },
    {
        statement:
            "Selecione DUAS afirmações corretas sobre as classes de armazenamento do Amazon S3.",
        explanation:
            "Todas as classes compartilham os 11 noves de durabilidade; o que muda é disponibilidade, custo e recuperação. O One Zone-IA fica em uma única AZ e perde o dado se ela for destruída (por isso é indicado para dados recriáveis). O Deep Archive tem duração mínima de 180 dias, não 30. O Intelligent-Tiering não cobra taxa de recuperação (apenas um pequeno monitoramento por objeto), e o Standard-IA, sim, cobra por GB recuperado.",
        topic: "S3",
        options: [
            [
                "Todas as classes são projetadas para a mesma durabilidade de 11 noves (99,999999999%).",
                true,
            ],
            [
                "O S3 One Zone-IA guarda os dados em uma única zona de disponibilidade e pode perder o dado se essa AZ for destruída.",
                true,
            ],
            ["O S3 Glacier Deep Archive tem duração mínima de armazenamento de 30 dias.", false],
            ["O S3 Intelligent-Tiering cobra uma taxa de recuperação por GB acessado.", false],
            ["O S3 Standard-IA não tem custo de recuperação por GB.", false],
        ],
    },
    {
        statement: "Selecione DUAS afirmações corretas ao comparar as filas SQS Standard e FIFO.",
        explanation:
            "A FIFO garante ordem (por MessageGroupId) e exactly-once por deduplicação; a Standard tem throughput quase ilimitado, mas entrega at-least-once (pode duplicar) e ordem best-effort. Por isso a Standard NÃO garante entrega única, e o consumidor deve ser idempotente. O nome de uma fila FIFO termina obrigatoriamente em .fifo, e seu throughput é MENOR que o da Standard (300, ou 3.000 msg/s com batch).",
        topic: "SQS",
        options: [
            [
                "A fila FIFO preserva a ordem dentro de um MessageGroupId e faz processamento exactly-once com deduplicação.",
                true,
            ],
            [
                "A fila Standard oferece throughput quase ilimitado, com entrega at-least-once e ordenação best-effort.",
                true,
            ],
            ["A fila Standard garante que cada mensagem seja entregue exatamente uma vez.", false],
            ["O nome de uma fila FIFO pode ser qualquer um, sem sufixo especial.", false],
            ["A fila FIFO tem throughput maior que a Standard.", false],
        ],
    },
    {
        statement:
            "Um consumidor às vezes leva mais tempo para processar uma mensagem do que o visibility timeout configurado, então uma segunda cópia é entregue e processada em paralelo, gerando duplicidade. Qual é a melhor forma de evitar isso enquanto o processamento legítimo continua?",
        explanation:
            "O reaparecimento vem de o visibility timeout expirar antes do fim do processamento; a solução é dimensioná-lo ao tempo típico e, para casos que demoram mais, estender com ChangeMessageVisibility. O long polling reduz respostas vazias na leitura, não o reprocessamento. Reduzir a retenção só encurta o prazo de vida da mensagem. Uma delay queue atrasa a primeira entrega, sem relação com o timeout após o recebimento.",
        topic: "SQS",
        options: [
            [
                "Dimensionar o visibility timeout ao tempo típico de processamento e, quando uma mensagem precisar de mais tempo, chamar ChangeMessageVisibility para estendê-lo.",
                true,
            ],
            ["Ativar long polling definindo WaitTimeSeconds entre 1 e 20.", false],
            ["Reduzir o período de retenção da mensagem.", false],
            ["Enviar as mensagens por uma delay queue.", false],
        ],
    },
    {
        statement:
            "Algumas mensagens de uma fila SQS falham repetidamente e precisam ser isoladas após 5 tentativas de recebimento para análise posterior, sem travar a fila. Qual recurso faz isso?",
        explanation:
            "Uma DLQ configurada por redrive policy com maxReceiveCount = 5 move para a fila separada qualquer mensagem recebida mais de 5 vezes sem ser apagada, isolando o que falha para investigação. Delay queue apenas atrasa a entrega inicial, long polling controla a leitura e o visibility timeout controla o tempo de invisibilidade: nenhum deles isola mensagens problemáticas.",
        topic: "SQS",
        options: [
            ["Uma dead-letter queue (DLQ) com redrive policy e maxReceiveCount igual a 5.", true],
            ["Uma delay queue de 5 segundos.", false],
            ["Long polling com WaitTimeSeconds igual a 5.", false],
            ["Um visibility timeout de 5 minutos.", false],
        ],
    },
    {
        statement:
            "Um único evento pedido criado deve ser processado em paralelo por três sistemas independentes (faturamento, estoque e notificação), cada um no seu ritmo e com resiliência própria (retry e DLQ isolados). Qual arquitetura atende melhor?",
        explanation:
            "O padrão fan-out com SNS para várias filas SQS entrega o mesmo evento a cada fila, e a SQS entre o tópico e o consumidor dá resiliência (retry e DLQ próprios por sistema, cada um no seu ritmo). SNS direto para Lambdas funciona, mas sem o buffer das filas perde a resiliência pedida. Uma única fila compartilhada faria os sistemas competirem pela mesma mensagem. Publicar três vezes duplica o trabalho do produtor e o acopla aos consumidores.",
        topic: "SNS",
        options: [
            ["Fan-out: um tópico SNS publicando para três filas SQS, uma por sistema.", true],
            ["Um tópico SNS entregando diretamente a três funções Lambda, sem filas.", false],
            ["Uma única fila SQS compartilhada pelos três sistemas.", false],
            ["Publicar o evento três vezes, uma para cada sistema.", false],
        ],
    },
    {
        statement:
            "Uma arquitetura precisa rotear eventos com base no CONTEÚDO de cada evento (padrões que inspecionam campos do payload), integrando dezenas de serviços AWS e SaaS como origens e destinos. Qual serviço é o mais indicado?",
        explanation:
            "O EventBridge é um event bus cujo roteamento se baseia em event patterns que inspecionam o conteúdo do evento, com integração nativa a cerca de 200 serviços AWS e SaaS: é a escolha para roteamento por conteúdo com muitas fontes e destinos. O SQS é uma fila para um worker, sem roteamento por conteúdo. O SNS filtra por atributos da mensagem (filter policy), não por padrões arbitrários do corpo, e tem menos integrações. O Kinesis é para streaming de dados, não roteamento por regras.",
        topic: "EventBridge",
        options: [
            [
                "Amazon EventBridge, um event bus que roteia por event pattern e integra muitas fontes e destinos.",
                true,
            ],
            ["Amazon SQS, enfileirando os eventos para um worker.", false],
            ["Amazon SNS, usando filter policy sobre os atributos da mensagem.", false],
            ["Amazon Kinesis Data Streams, processando o fluxo em ordem.", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa orquestrar um fluxo de várias etapas (validar pedido, cobrar, reservar estoque e notificar), com ramificações condicionais entre as etapas, novas tentativas e tratamento de erros por etapa, mantendo o estado do fluxo de ponta a ponta. Qual serviço AWS é o mais indicado?",
        explanation:
            "O AWS Step Functions modela o fluxo como uma máquina de estados (Amazon States Language), com ramificações condicionais (Choice), novas tentativas e captura de erros embutidas e estado gerenciado de ponta a ponta, exatamente o pedido. Encadear Lambdas diretamente espalha a lógica de orquestração e o tratamento de erros pelo código, sem visibilidade do fluxo. Filas SQS entre etapas desacoplam, mas não orquestram ramificações e estado. Um SNS fan-out dispara tudo em paralelo, não um fluxo sequencial condicional.",
        topic: "Step Functions",
        options: [
            [
                "AWS Step Functions, que orquestra o fluxo como uma máquina de estados com retry, catch e ramificações.",
                true,
            ],
            ["Encadear funções Lambda que chamam umas às outras diretamente.", false],
            ["Colocar uma fila SQS entre cada etapa e controlar o fluxo manualmente.", false],
            ["Um tópico SNS fazendo fan-out para todas as etapas de uma vez.", false],
        ],
    },
    {
        statement:
            "Uma role de aplicação tem a policy gerenciada AmazonDynamoDBFullAccess e, anexada a ela, uma policy inline com um Deny explícito para dynamodb:DeleteTable. A aplicação consegue excluir uma tabela do DynamoDB?",
        explanation:
            "Na avaliação do IAM, um deny explícito sempre vence qualquer allow, não importando se a permissão veio de uma policy gerenciada ou inline. As demais erram: não há precedência de managed sobre inline, políticas conflitantes não se cancelam (o padrão do IAM é negar), e a ordem de anexação é irrelevante.",
        topic: "IAM",
        options: [
            [
                "Não, porque o deny explícito prevalece sobre qualquer allow, mesmo o de uma policy gerenciada ampla.",
                true,
            ],
            [
                "Sim, porque uma policy gerenciada pela AWS tem precedência sobre políticas inline.",
                false,
            ],
            [
                "Sim, porque as duas políticas se anulam e o acesso volta ao padrão de permitir.",
                false,
            ],
            ["Depende de qual das duas políticas foi anexada por último à role.", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa que uma conta parceira leia mensagens de uma fila SQS, sem criar usuários na sua conta nem exigir que a parceira assuma uma role. Qual recurso do IAM torna isso possível?",
        explanation:
            "A fila SQS suporta resource-based policy: anexar uma policy à própria fila com o Principal da conta parceira concede acesso cross-account direto, sem assumir role. Uma identity-based policy não tem Principal e não cruza contas sozinha; a policy do root da sua conta não afeta a parceira; e uma SCP só restringe contas da sua organização, não concede acesso a terceiros.",
        topic: "IAM",
        options: [
            [
                "Uma resource-based policy (queue policy) na fila, com o Principal apontando para a conta parceira.",
                true,
            ],
            ["Uma identity-based policy anexada a um grupo do IAM da conta parceira.", false],
            ["Uma policy inline anexada ao usuário root da sua conta.", false],
            ["Uma SCP da organização aplicada à conta parceira.", false],
        ],
    },
    {
        statement:
            "Seguindo o princípio do menor privilégio, qual policy é a mais adequada para uma função que só precisa ler objetos de um único bucket chamado relatorios?",
        explanation:
            "O menor privilégio concede apenas a ação necessária (s3:GetObject) sobre o recurso específico. As demais liberam mais do que o preciso: s3:* inclui gravação e exclusão, e a combinação de ação * com Resource * dá acesso total à conta, violando o princípio.",
        topic: "IAM",
        options: [
            ["Allow em s3:GetObject no recurso arn:aws:s3:::relatorios/*.", true],
            ["Allow em s3:* no recurso *.", false],
            ["Allow na ação * no recurso *.", false],
            ["Allow em s3:* no bucket relatorios e em todos os demais buckets da conta.", false],
        ],
    },
    {
        statement:
            "Uma aplicação em uma instância EC2 precisa ler objetos de um bucket S3. Qual é a forma recomendada de conceder esse acesso, seguindo as boas práticas de segurança?",
        explanation:
            "A prática recomendada é anexar uma IAM role à instância (instance profile): a aplicação recebe credenciais temporárias rotacionadas automaticamente, sem chaves de longo prazo no disco. Gravar access keys em arquivo ou usar as chaves do root cria credenciais permanentes de alto risco, e tornar o bucket público expõe os dados a qualquer um.",
        topic: "IAM",
        options: [
            [
                "Anexar uma IAM role à instância EC2, para a aplicação usar credenciais temporárias automaticamente.",
                true,
            ],
            [
                "Gravar as access keys de um IAM user em um arquivo de configuração na instância.",
                false,
            ],
            [
                "Colocar as access keys do usuário root nas variáveis de ambiente da instância.",
                false,
            ],
            ["Tornar o bucket público para dispensar o uso de credenciais.", false],
        ],
    },
    {
        statement:
            "Um IAM user não possui nenhuma policy que mencione o Amazon SNS, nem allow nem deny. O que acontece quando ele tenta publicar em um tópico SNS?",
        explanation:
            "No IAM tudo começa negado (deny implícito): sem um allow explícito, a requisição é negada. As demais invertem a regra (o padrão não é permitir), inventam uma exceção para leitura, ou confundem autorização com MFA, que não decide a permissão por si só.",
        topic: "IAM",
        options: [
            ["A ação é negada pelo deny implícito, pois nada foi explicitamente permitido.", true],
            ["A ação é permitida, pois tudo o que não é negado é liberado por padrão.", false],
            ["A ação é permitida apenas para operações de leitura no SNS.", false],
            ["O IAM exige autenticação MFA e só então libera a publicação.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma política de permissões única, aplicável a várias roles, com histórico de versões para permitir rollback caso uma alteração cause problemas. Qual tipo de política deve usar?",
        explanation:
            "A customer managed policy é reutilizável em várias identidades e mantém versionamento com rollback. A inline vive presa a uma única identidade (relação 1:1) e não é reutilizável; uma AWS managed policy não pode ser editada pelo cliente; e a trust policy define quem assume uma role, não permissões reutilizáveis.",
        topic: "IAM",
        options: [
            ["Customer managed policy.", true],
            ["Inline policy embutida em cada role.", false],
            ["AWS managed policy, editada conforme a necessidade.", false],
            ["Trust policy compartilhada entre as roles.", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre identidades e boas práticas do IAM estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Um group é apenas um contêiner de usuários para aplicar políticas em bloco, sem credenciais próprias; e uma role entrega credenciais temporárias via STS ao ser assumida. As erradas: um group não pode ser Principal de uma policy; o root deve ser guardado e quase nunca usado no dia a dia; e um IAM user tem credenciais de longo prazo, não temporárias que expiram sozinhas.",
        topic: "IAM",
        options: [
            [
                "Um IAM group aplica políticas a vários usuários de uma vez e não possui credenciais próprias.",
                true,
            ],
            [
                "Uma IAM role fornece credenciais temporárias quando é assumida, sem chaves de longo prazo.",
                true,
            ],
            ["Um IAM group pode ser usado como Principal em uma policy baseada em recurso.", false],
            ["O usuário root deve ser usado no dia a dia por ter permissões amplas.", false],
            [
                "Um IAM user recebe credenciais temporárias que expiram automaticamente a cada hora.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação assume uma role com sts:AssumeRole e recebe um bloco Credentials. Ao chamar as APIs da AWS com essas credenciais, qual componente, ausente nas access keys de longo prazo, precisa acompanhar cada requisição?",
        explanation:
            "Credenciais temporárias do STS têm três partes: AccessKeyId, SecretAccessKey e o SessionToken, que não existe em credenciais de longo prazo e deve acompanhar toda chamada. RoleSessionName e RoleArn são parâmetros da chamada AssumeRole, não da credencial resultante; e roles não usam senha de usuário.",
        topic: "STS",
        options: [
            ["O SessionToken.", true],
            ["O RoleSessionName.", false],
            ["O RoleArn.", false],
            ["A senha do IAM user que assumiu a role.", false],
        ],
    },
    {
        statement:
            "A conta de produção (B) quer permitir que usuários da conta de desenvolvimento (A) assumam uma role nela. Onde a conta B declara que confia na conta A para essa operação?",
        explanation:
            "A trust policy é a resource-based policy da role que define quem pode assumi-la, com o Principal da conta confiável e a ação sts:AssumeRole. A permissions policy diz o que a role faz depois de assumida, não quem a assume; uma bucket policy trata de acesso ao S3; e variáveis de ambiente não autorizam AssumeRole. O lado A também precisa de permissão sts:AssumeRole no ARN da role.",
        topic: "STS",
        options: [
            [
                "Na trust policy da role, com o Principal apontando para a conta A e a ação sts:AssumeRole.",
                true,
            ],
            ["Na permissions policy da role, listando as ações que ela pode executar.", false],
            ["Em uma bucket policy do S3 na conta A.", false],
            ["Nas variáveis de ambiente da aplicação da conta A.", false],
        ],
    },
    {
        statement:
            "O que caracteriza a trust policy de uma execution role usada por uma função Lambda?",
        explanation:
            "Uma role de serviço tem trust policy com Principal do tipo Service (aqui lambda.amazonaws.com), permitindo que o serviço a assuma. Um Principal do tipo AWS apontando para o root descreveria outro cenário; a lista de ações fica na permissions policy, não na trust; e toda trust policy é resource-based e tem Principal, ao contrário de uma identity-based.",
        topic: "STS",
        options: [
            [
                "Ela tem um Principal do tipo Service apontando para lambda.amazonaws.com, autorizando o serviço a assumir a role.",
                true,
            ],
            ["Ela tem um Principal do tipo AWS apontando para o usuário root da conta.", false],
            ["Ela lista as ações do DynamoDB e do S3 que a função poderá executar.", false],
            ["Ela é uma identity-based policy, portanto não tem Principal.", false],
        ],
    },
    {
        statement:
            "Uma empresa vai dar acesso à AWS a identidades externas, sem criar um IAM user por pessoa. Quais operações do STS permitem que essas identidades federadas assumam uma role e recebam credenciais temporárias? (Selecione DUAS opções.)",
        explanation:
            "A federação usa AssumeRoleWithSAML (diretórios corporativos SAML 2.0, como AD/ADFS) e AssumeRoleWithWebIdentity (provedores web/OIDC, como Google e Facebook). As erradas: CreateLoginProfile cria uma senha de Console para um IAM user; GetSessionToken apenas emite credenciais temporárias para um IAM user já existente, sem federar; e PutUserPolicy anexa uma policy a um user.",
        topic: "STS",
        options: [
            ["AssumeRoleWithSAML, para diretórios corporativos que falam SAML 2.0.", true],
            ["AssumeRoleWithWebIdentity, para provedores web/OIDC como Google e Facebook.", true],
            ["CreateLoginProfile, para gerar uma senha de Console ao usuário externo.", false],
            ["GetSessionToken, que federa usuários vindos de um provedor SAML.", false],
            ["PutUserPolicy, para anexar permissões ao usuário federado.", false],
        ],
    },
    {
        statement:
            "Uma startup precisa adicionar cadastro, login, recuperação de senha, MFA e login social a um app, sem construir um diretório de usuários do zero. Qual serviço entrega isso e emite tokens JWT após o login?",
        explanation:
            "O Cognito User Pool é o diretório de usuários gerenciado que faz sign-up/sign-in, MFA e login social e emite tokens JWT (ID, Access, Refresh). O Identity Pool não autentica: ele troca uma identidade por credenciais AWS; o STS emite credenciais temporárias, mas não gerencia usuários; e o Secrets Manager guarda segredos.",
        topic: "Cognito",
        options: [
            ["Amazon Cognito User Pool.", true],
            ["Amazon Cognito Identity Pool.", false],
            ["AWS STS.", false],
            ["AWS Secrets Manager.", false],
        ],
    },
    {
        statement:
            "Após o login, um app mobile precisa que o usuário grave arquivos diretamente em um bucket S3 usando credenciais AWS temporárias limitadas por uma IAM role. Qual componente do Cognito fornece essas credenciais?",
        explanation:
            "O Identity Pool (Federated Identities) troca um token de identidade por credenciais AWS temporárias via STS, definidas por uma IAM role. O ID token do User Pool não é uma credencial da AWS; a Hosted UI é apenas a tela de login; e o refresh token serve para renovar os JWT, não para assinar chamadas ao S3.",
        topic: "Cognito",
        options: [
            ["O Identity Pool, que troca a identidade por credenciais temporárias via STS.", true],
            ["O User Pool, usando o próprio ID token como credencial da AWS.", false],
            ["A Hosted UI, ao redirecionar para a callback URL.", false],
            ["O refresh token, usado diretamente para assinar as chamadas ao S3.", false],
        ],
    },
    {
        statement:
            "No Cognito User Pool, qual dos tokens emitidos carrega as claims de identidade do usuário, como sub e email, funcionando como seu documento de identidade?",
        explanation:
            "O ID token contém as claims de identidade (quem é o usuário). O Access token autoriza chamadas a APIs e recursos protegidos; o Refresh token serve para renovar os outros dois sem novo login; e o SessionToken pertence ao STS, não ao User Pool.",
        topic: "Cognito",
        options: [
            ["O ID token.", true],
            ["O Access token.", false],
            ["O Refresh token.", false],
            ["O SessionToken do STS.", false],
        ],
    },
    {
        statement:
            "Em uma arquitetura que usa User Pool e Identity Pool juntos, o que o app faz com o token JWT recebido do User Pool?",
        explanation:
            "No padrão combinado, o User Pool autentica e emite o JWT; o app entrega esse JWT ao Identity Pool, que o valida e chama o STS, devolvendo credenciais AWS temporárias. O JWT não é credencial direta do S3, não vira uma senha de IAM e não é usado como chave de criptografia.",
        topic: "Cognito",
        options: [
            [
                "Entrega o token ao Identity Pool, que o valida e chama o STS para retornar credenciais AWS temporárias.",
                true,
            ],
            ["Envia o token diretamente ao S3 como credencial de acesso.", false],
            ["Troca o token por uma senha de longo prazo de um IAM user.", false],
            ["Usa o token como chave de criptografia dos dados no DynamoDB.", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre o Amazon Cognito estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O User Pool emite os três JWT (ID, Access, Refresh) e o Identity Pool entrega credenciais AWS temporárias, inclusive uma role para usuários guest. As erradas trocam os papéis: quem entrega credenciais AWS é o Identity Pool (não o User Pool), quem é diretório e valida senha é o User Pool (não o Identity Pool), e o refresh token só renova os JWT, não acessa o S3.",
        topic: "Cognito",
        options: [
            ["O User Pool emite três tokens JWT: ID token, Access token e Refresh token.", true],
            [
                "O Identity Pool fornece credenciais AWS temporárias e pode conceder acesso a usuários guest.",
                true,
            ],
            ["O User Pool troca o login por credenciais AWS temporárias via STS.", false],
            ["O Identity Pool é um diretório de usuários que valida senha e aplica MFA.", false],
            ["O Refresh token é uma credencial da AWS aceita diretamente pelo S3.", false],
        ],
    },
    {
        statement:
            "Uma aplicação precisa criptografar arquivos de vários gigabytes, muito acima do limite de 4 KB da operação Encrypt direta do KMS. Qual técnica resolve isso?",
        explanation:
            "Na envelope encryption, gera-se uma data key com GenerateDataKey, cifra-se o arquivo localmente com ela (sem o limite de 4 KB) e guarda-se a data key cifrada pela CMK junto do arquivo. Fatiar o arquivo em chamadas de 4 KB é inviável e não é o modelo; a CMK nunca sai do KMS em texto claro; e desabilitar a criptografia não é solução.",
        topic: "KMS",
        options: [
            [
                "Envelope encryption: gerar uma data key com GenerateDataKey, cifrar o arquivo localmente e guardar a data key cifrada pela CMK junto dos dados.",
                true,
            ],
            ["Enviar o arquivo inteiro ao KMS em várias chamadas Encrypt de 4 KB.", false],
            ["Exportar a CMK do KMS e cifrar o arquivo localmente com ela.", false],
            ["Desabilitar a criptografia, pois arquivos grandes não podem ser cifrados.", false],
        ],
    },
    {
        statement:
            "Ao chamar GenerateDataKey, a aplicação recebe a data key em duas formas. Como cada uma é usada na envelope encryption?",
        explanation:
            "GenerateDataKey devolve a data key em texto claro (usada para cifrar os dados localmente e depois descartada da memória) e cifrada pela CMK (guardada junto dos dados para uma futura chamada Decrypt). Guardar a chave em texto claro anularia a proteção, e as duas formas não são idênticas nem intercambiáveis.",
        topic: "KMS",
        options: [
            [
                "A versão em texto claro cifra os dados e é descartada; a versão cifrada é guardada junto dos dados para decifrar depois.",
                true,
            ],
            ["Ambas são guardadas em texto claro para acelerar a leitura futura.", false],
            [
                "A versão cifrada cifra os dados e a versão em texto claro é enviada de volta ao KMS.",
                false,
            ],
            ["As duas versões são idênticas e servem apenas para redundância.", false],
        ],
    },
    {
        statement:
            "Uma equipe de conformidade precisa controlar a key policy, criar grants, habilitar a rotação e agendar a exclusão de uma chave de criptografia. Qual tipo de chave do KMS atende a esse nível de controle?",
        explanation:
            "Somente a customer managed key (CMK) dá controle total sobre key policy, grants, rotação e exclusão. A AWS managed key é vista mas não gerenciada pelo cliente (rotação automática, sem controle da policy); a AWS owned key é invisível para você; e uma data key não é uma chave-mestra gerenciável no KMS.",
        topic: "KMS",
        options: [
            ["Customer managed key (CMK).", true],
            ["AWS managed key (aws/servico).", false],
            ["AWS owned key.", false],
            ["Uma data key em texto claro.", false],
        ],
    },
    {
        statement:
            "Uma equipe quer dar a uma role de relatórios permissão temporária e granular para apenas Decrypt e GenerateDataKey em uma CMK, sem editar a key policy e podendo revogar depois. Qual recurso do KMS deve usar?",
        explanation:
            "O grant (concessão) concede acesso granular e revogável a operações específicas (como Decrypt e GenerateDataKey) sem alterar a key policy. Reescrever a key policy com acesso total viola o menor privilégio; uma bucket policy não controla o KMS; e a rotação troca o material da chave, não concede permissões.",
        topic: "KMS",
        options: [
            ["Um grant (concessão) do KMS.", true],
            ["Uma nova versão da key policy concedendo acesso total à role.", false],
            ["Uma bucket policy do S3.", false],
            ["A rotação automática da chave.", false],
        ],
    },
    {
        statement:
            "Uma CMK simétrica tem a rotação automática habilitada. Quais afirmações sobre essa rotação estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Na rotação automática de uma CMK simétrica o KMS gera novo material, mas o key ID e o alias continuam os mesmos e o material antigo é retido para decifrar dados cifrados antes da rotação, de forma transparente. Por isso nada precisa ser reconfigurado nem recriptografado, e a chave nunca sai do KMS em texto claro.",
        topic: "KMS",
        options: [
            ["O key ID e o alias permanecem os mesmos após a rotação.", true],
            [
                "O KMS retém o material antigo para continuar decifrando dados cifrados antes da rotação.",
                true,
            ],
            ["O key ID muda a cada rotação e a aplicação precisa ser reconfigurada.", false],
            [
                "Os dados cifrados antes da rotação precisam ser recriptografados manualmente.",
                false,
            ],
            ["A rotação exporta a chave em texto claro para a aplicação.", false],
        ],
    },
    {
        statement:
            "Durante uma revisão, um auditor encontra a senha do banco em texto claro em uma variável de ambiente de uma função Lambda. Qual é a recomendação para tratar esse segredo?",
        explanation:
            "A recomendação é externalizar o segredo para um cofre cifrado (Secrets Manager ou Parameter Store SecureString) e lê-lo em runtime. Variáveis de ambiente ficam visíveis na configuração; base64 apenas codifica, não protege; um comentário no código vai para o Git; e um parâmetro do tipo String não é cifrado.",
        topic: "Dados sensíveis",
        options: [
            [
                "Buscar o segredo em runtime no Secrets Manager ou no Parameter Store (SecureString), em vez de deixá-lo em texto claro.",
                true,
            ],
            ["Manter na variável de ambiente, mas codificar o valor em base64.", false],
            ["Mover o segredo para um comentário no final do código.", false],
            ["Guardar o segredo em um parâmetro do tipo String, não cifrado.", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa de rotação automática da senha de um banco Amazon RDS, com a lógica de rotação já fornecida pela AWS, sem escrevê-la do zero. Qual serviço atende diretamente?",
        explanation:
            "O Secrets Manager tem rotação automática nativa integrada para RDS, Redshift e DocumentDB, com a Lambda de rotação pronta. O Parameter Store, em qualquer tier, não tem rotação automática nativa (você teria que automatizá-la com EventBridge e Lambda); e variáveis de ambiente não rotacionam.",
        topic: "Secrets Manager",
        options: [
            ["AWS Secrets Manager.", true],
            ["SSM Parameter Store no tier Standard.", false],
            ["SSM Parameter Store no tier Advanced.", false],
            ["Variáveis de ambiente da aplicação.", false],
        ],
    },
    {
        statement:
            "Uma aplicação tem dezenas de parâmetros de configuração organizados por caminho (como /app/prod/db/url), a maioria sem sensibilidade, sem necessidade de rotação, e a equipe quer minimizar custos. Qual serviço é o mais adequado?",
        explanation:
            "O Parameter Store no tier Standard é gratuito, organiza os parâmetros por caminho hierárquico e cifra os poucos valores sensíveis com SecureString. Criar um segredo por parâmetro no Secrets Manager encareceria sem necessidade (não há rotação exigida); hardcode é inseguro; e o Identity Pool nada tem a ver com armazenar configuração.",
        topic: "Parameter Store",
        options: [
            [
                "SSM Parameter Store no tier Standard, com SecureString para os poucos valores sensíveis.",
                true,
            ],
            ["Secrets Manager, criando um segredo para cada parâmetro.", false],
            ["Hardcode dos valores diretamente no código da aplicação.", false],
            ["Um Cognito Identity Pool para armazenar a configuração.", false],
        ],
    },
    {
        statement:
            "Uma função lê um parâmetro do tipo SecureString do Parameter Store, cifrado por uma CMK. Além de ssm:GetParameter, o que é necessário para obter o valor em texto claro?",
        explanation:
            "Ler um SecureString exige o parâmetro --with-decryption e a permissão kms:Decrypt na chave que cifrou o valor, pois o KMS precisa decifrá-lo. A rotação não é oferecida nativamente e não afeta a leitura; o tier Advanced muda tamanho e políticas de parâmetro, não a necessidade de decifrar; e StringList é para listas não cifradas.",
        topic: "Parameter Store",
        options: [
            [
                "Usar --with-decryption na leitura e ter a permissão kms:Decrypt na CMK que cifrou o valor.",
                true,
            ],
            ["Habilitar a rotação automática do parâmetro.", false],
            ["Migrar o parâmetro obrigatoriamente para o tier Advanced.", false],
            ["Converter o parâmetro para o tipo StringList.", false],
        ],
    },
    {
        statement:
            "Uma aplicação já usa a API do SSM Parameter Store para toda a configuração e agora quer ler um segredo guardado no Secrets Manager sem adicionar outro cliente. Como isso é possível?",
        explanation:
            "O Parameter Store consegue ler um segredo do Secrets Manager pelo prefixo de caminho /aws/reference/secretsmanager/, permitindo usar uma única API para configuração e segredos, aproveitando a rotação do Secrets Manager. Copiar para um String exporia o valor sem cifra; os serviços não são isolados; e não há relação com Identity Pool.",
        topic: "Secrets Manager",
        options: [
            [
                "Lendo o segredo pela API do Parameter Store com o prefixo /aws/reference/secretsmanager/.",
                true,
            ],
            [
                "Copiando manualmente o segredo para um parâmetro do tipo String a cada leitura.",
                false,
            ],
            ["Não é possível: os dois serviços são totalmente isolados.", false],
            ["Convertendo o segredo do Secrets Manager em um Identity Pool.", false],
        ],
    },
    {
        statement:
            "Uma equipe compara o AWS Secrets Manager com o SSM Parameter Store. Quais afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Secrets Manager tem rotação automática integrada (RDS, Redshift, DocumentDB) e o Parameter Store no tier Standard é gratuito e cifra valores com SecureString. As erradas: o Parameter Store não tem rotação nativa; o Secrets Manager sempre cifra por KMS (não guarda em texto claro); e o Parameter Store cifra valores justamente pelo tipo SecureString.",
        topic: "Secrets Manager",
        options: [
            [
                "O Secrets Manager oferece rotação automática integrada para RDS, Redshift e DocumentDB.",
                true,
            ],
            [
                "O Parameter Store no tier Standard é gratuito e cifra valores sensíveis com o tipo SecureString.",
                true,
            ],
            ["O Parameter Store tem rotação automática nativa integrada com o RDS.", false],
            ["O Secrets Manager guarda os segredos em texto claro, sem cifra por KMS.", false],
            ["O Parameter Store não consegue armazenar valores cifrados de forma alguma.", false],
        ],
    },
    {
        statement:
            "Uma equipe vai atualizar uma stack de produção e precisa saber, antes de aplicar, se a mudança em uma propriedade do banco de dados vai forçar a substituição (replacement) do recurso, o que causaria indisponibilidade. Como obter essa informação sem alterar nenhum recurso?",
        explanation:
            "O change set é uma prévia: o CloudFormation compara o template novo com o estado atual e lista o que será adicionado, modificado ou removido, indicando inclusive substituições de recurso, sem tocar na infraestrutura. Nada muda até você executar o change set. O drift detection serve para achar alterações manuais, não para prever um update; e rodar update-stack direto já aplicaria a mudança.",
        topic: "CloudFormation",
        options: [
            ["Criar um change set e inspecionar as mudanças previstas.", true],
            ["Executar detect-stack-drift na stack.", false],
            ["Rodar update-stack diretamente com --disable-rollback.", false],
            ["Configurar rollback triggers com alarmes do CloudWatch.", false],
        ],
    },
    {
        statement:
            "Durante um incidente, um engenheiro alterou manualmente, pelo console, as regras de um security group que é gerenciado por uma stack do CloudFormation. Semanas depois, a equipe quer descobrir quais recursos da stack não correspondem mais ao que está no template. Qual recurso usar?",
        explanation:
            "O drift detection compara o estado real dos recursos com o que a stack espera e aponta o que está MODIFIED, DELETED ou IN_SYNC, revelando mudanças feitas por fora do CloudFormation. O change set prevê as mudanças de um update futuro, não detecta alterações manuais já feitas; e o rollback automático atua quando um deploy falha.",
        topic: "CloudFormation",
        options: [
            ["Drift detection.", true],
            ["Change set.", false],
            ["Rollback automático.", false],
            ["Nested stacks.", false],
        ],
    },
    {
        statement:
            "Em um template, uma AWS::SQS::QueuePolicy precisa referenciar o ARN de uma fila SQS criada na mesma stack. Aplicar Ref à fila retorna a URL dela, e não o ARN. Qual função intrínseca retorna o ARN?",
        explanation:
            "Ref retorna o identificador físico do recurso, que para uma fila SQS é a URL da fila. Para obter um atributo específico, como o Arn, usa-se Fn::GetAtt (por exemplo, !GetAtt Fila.Arn). Fn::ImportValue lê valores exportados por outra stack, e Fn::FindInMap lê valores de um Mapping, nenhum dos dois adequado aqui.",
        topic: "CloudFormation",
        options: [
            ["Fn::GetAtt.", true],
            ["Ref.", false],
            ["Fn::FindInMap.", false],
            ["Fn::ImportValue.", false],
        ],
    },
    {
        statement:
            "Uma organização quer padronizar um template de VPC e reutilizá-lo em vários projetos, referenciando-o como um recurso dentro de um template-mãe que orquestra a rede e a aplicação juntas. Qual abordagem é a recomendada?",
        explanation:
            "Nested stacks quebram a infraestrutura em templates menores e reutilizáveis, referenciados como recursos AWS::CloudFormation::Stack (com o TemplateURL apontando o template no S3), e a stack-mãe orquestra as filhas. Export/ImportValue serve para compartilhar valores entre stacks independentes, não para reutilizar um template como componente; copiar o bloco em cada projeto perde a padronização; e DependsOn não conecta stacks separadas.",
        topic: "CloudFormation",
        options: [
            [
                "Nested stacks, com um recurso AWS::CloudFormation::Stack apontando o TemplateURL.",
                true,
            ],
            ["Exportar a VPC com Export e consumi-la em cada projeto com Fn::ImportValue.", false],
            ["Copiar e colar o bloco de rede em cada template de aplicação.", false],
            ["Declarar DependsOn entre duas stacks totalmente independentes.", false],
        ],
    },
    {
        statement:
            "Uma tabela DynamoDB de produção guarda dados críticos. A equipe quer garantir que, se a stack for excluída por engano, a própria tabela permaneça intacta na conta. O que configurar no recurso?",
        explanation:
            "DeletionPolicy: Retain mantém o recurso mesmo quando a stack é apagada, deixando a tabela intacta. Delete (o padrão) removeria a tabela junto com a stack, e Snapshot tiraria um backup mas apagaria a tabela original, o que não atende ao requisito de preservar a própria tabela. DependsOn apenas ordena a criação de recursos.",
        topic: "CloudFormation",
        options: [
            ["DeletionPolicy: Retain.", true],
            ["DeletionPolicy: Delete.", false],
            ["DeletionPolicy: Snapshot.", false],
            ["DependsOn apontando a tabela.", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre funções intrínsecas do CloudFormation estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Fn::ImportValue consome um valor que outra stack exportou com Export, e Fn::Sub substitui variáveis dentro de uma string, incluindo pseudo-parâmetros como ${AWS::Region} e ${AWS::AccountId}. As erradas: Ref retorna o ID/nome físico do recurso, nem sempre o ARN; Fn::FindInMap lê de um Mapping do próprio template, não de outra conta; e Fn::GetAtt é usada em Resources/Outputs, não dentro de Parameters.",
        topic: "CloudFormation",
        options: [
            ["Fn::ImportValue consome um valor que outra stack exportou com Export.", true],
            [
                "Fn::Sub substitui variáveis dentro de uma string, incluindo pseudo-parâmetros como ${AWS::Region}.",
                true,
            ],
            ["Ref sempre retorna o ARN completo de qualquer recurso.", false],
            ["Fn::FindInMap importa valores de outra conta AWS.", false],
            ["Fn::GetAtt só pode ser usada dentro da seção Parameters.", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor abre um template que declara uma função Lambda e uma API REST em poucas linhas e traz a linha Transform: AWS::Serverless-2016-10-31 no topo. O que essa linha faz?",
        explanation:
            "A linha Transform: AWS::Serverless-2016-10-31 habilita a macro do SAM: no deploy, tipos como AWS::Serverless::Function são transformados (expandidos) nos recursos completos do CloudFormation. Sem essa linha, seria um template CloudFormation comum. A versão do formato do template é definida por AWSTemplateFormatVersion, que é outra coisa.",
        topic: "SAM",
        options: [
            [
                "Habilita a macro do SAM, que expande a sintaxe serverless nos recursos completos do CloudFormation.",
                true,
            ],
            ["Define apenas a versão do formato do template, sem outro efeito.", false],
            ["Converte o template em um arquivo de configuração do Terraform.", false],
            ["Cria uma instância EC2 para hospedar a aplicação serverless.", false],
        ],
    },
    {
        statement:
            "Uma função AWS::Serverless::Function precisa de permissão de leitura em um único bucket S3, e o time não quer escrever JSON de política IAM na mão. Qual é a forma idiomática no SAM?",
        explanation:
            "Os policy templates do SAM (como S3ReadPolicy, DynamoDBCrudPolicy e SQSPollerPolicy) são atalhos de escopo mínimo: você informa o template e o recurso-alvo na propriedade Policies e o SAM gera a política IAM correta. Um AWS::Serverless::SimpleTable cria uma tabela; um evento S3 apenas cria um gatilho, sem conceder a leitura; e --capabilities CAPABILITY_IAM só autoriza a stack a criar recursos IAM, não define a permissão.",
        topic: "SAM",
        options: [
            [
                "Usar um policy template, como S3ReadPolicy, na propriedade Policies, apontando o bucket.",
                true,
            ],
            ["Criar um AWS::Serverless::SimpleTable para o bucket.", false],
            ["Adicionar um evento do tipo S3 na propriedade Events.", false],
            ["Passar --capabilities CAPABILITY_IAM no comando de deploy.", false],
        ],
    },
    {
        statement:
            "Antes de fazer deploy, um desenvolvedor quer invocar a função Lambda com um evento de teste e subir a API REST localmente, dentro de contêineres Docker. Quais comandos da SAM CLI atendem a isso?",
        explanation:
            "sam local invoke executa a função uma vez com um evento de teste, e sam local start-api sobe um API Gateway local (em http://127.0.0.1:3000), ambos rodando em contêineres Docker. sam build monta os artefatos e sam validate checa a sintaxe; sam deploy publica na AWS; e sam init cria um projeto: nenhum deles roda a aplicação localmente.",
        topic: "SAM",
        options: [
            ["sam local invoke e sam local start-api.", true],
            ["sam build e sam validate.", false],
            ["sam deploy --guided.", false],
            ["sam init e sam package.", false],
        ],
    },
    {
        statement: "Quais afirmações sobre o AWS SAM estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O SAM é um superset do CloudFormation, então recursos CloudFormation comuns convivem com os tipos AWS::Serverless::*, e cada AWS::Serverless::Function expande para a função Lambda mais o papel IAM, as permissões e os event sources. As erradas: por baixo o SAM usa o CloudFormation (com change sets) para provisionar; a sintaxe serverless exige a linha Transform; e sam local serve para testes locais, não para publicar em produção.",
        topic: "SAM",
        options: [
            [
                "É um superset do CloudFormation: recursos comuns do CloudFormation também funcionam em um template SAM.",
                true,
            ],
            [
                "O recurso AWS::Serverless::Function expande para a função Lambda mais o papel IAM, as permissões e os event sources.",
                true,
            ],
            [
                "O SAM provisiona os recursos chamando as APIs de cada serviço diretamente, sem usar o CloudFormation.",
                false,
            ],
            [
                "A sintaxe AWS::Serverless::* funciona mesmo sem a linha Transform no template.",
                false,
            ],
            ["O comando sam local publica a aplicação diretamente em produção.", false],
        ],
    },
    {
        statement:
            "Uma equipe adota o CodeBuild para o CI. Em qual arquivo, e em quais seções, ela declara os comandos para instalar dependências, rodar os testes e compilar o projeto?",
        explanation:
            "O CodeBuild é guiado pelo buildspec.yml, cujas fases install, pre_build, build e post_build contêm os comandos do build. O appspec.yml, com seus hooks, guia o CodeDeploy na implantação (não no build); o template.yaml descreve infraestrutura; e o Dockerrun.aws.json aponta imagens para o Beanstalk/ECS.",
        topic: "CodeBuild",
        options: [
            ["No buildspec.yml, nas fases install, pre_build, build e post_build.", true],
            ["No appspec.yml, nos hooks do deploy.", false],
            ["No template.yaml, na seção Resources.", false],
            ["No Dockerrun.aws.json, na seção containerDefinitions.", false],
        ],
    },
    {
        statement:
            "Um buildspec.yml precisa injetar, em tempo de build, uma senha de banco guardada no AWS Secrets Manager, sem deixá-la em texto puro no repositório. Qual recurso do buildspec faz isso?",
        explanation:
            "A seção env do buildspec injeta variáveis; env.secrets-manager lê valores do Secrets Manager e env.parameter-store lê do SSM Parameter Store, sem expor o segredo no código-fonte. A seção artifacts define o que sai do build e cache acelera builds futuros; nenhuma das duas guarda segredos, e AfterInstall é um hook do appspec.",
        topic: "CodeBuild",
        options: [
            ["A seção env com secrets-manager (ou parameter-store) mapeando a variável.", true],
            ["A seção artifacts, listando o segredo em files.", false],
            ["A seção cache, apontando o diretório do segredo.", false],
            ["Um hook AfterInstall no appspec.", false],
        ],
    },
    {
        statement:
            "Ao revisar um repositório, você encontra um arquivo com os hooks ApplicationStop, BeforeInstall, AfterInstall, ApplicationStart e ValidateService. A qual serviço e destino esse arquivo pertence?",
        explanation:
            "Esses hooks de ciclo de vida (ApplicationStop, BeforeInstall, AfterInstall, ApplicationStart, ValidateService) são do appspec.yml do CodeDeploy para destinos EC2/on-premises. Um build do CodeBuild usaria fases (install, build) em um buildspec.yml, e um deploy do CodeDeploy para Lambda usaria apenas BeforeAllowTraffic e AfterAllowTraffic.",
        topic: "CodeDeploy",
        options: [
            ["Ao appspec.yml do CodeDeploy, para um deploy em EC2/on-premises.", true],
            ["Ao buildspec.yml do CodeBuild.", false],
            ["A um template do AWS SAM.", false],
            ["Ao appspec do CodeDeploy para Lambda.", false],
        ],
    },
    {
        statement:
            "Em um deploy do CodeDeploy para uma função Lambda, a equipe quer rodar uma função de validação imediatamente antes e imediatamente depois de o tráfego ser deslocado para a nova versão. Quais hooks do appspec usar?",
        explanation:
            "No CodeDeploy para Lambda, os hooks disponíveis são BeforeAllowTraffic (antes de mover o tráfego) e AfterAllowTraffic (depois de mover), cada um podendo chamar uma Lambda de validação. ApplicationStop/ApplicationStart e BeforeInstall/AfterInstall são hooks de deploys em EC2/on-premises, e install/post_build são fases do buildspec do CodeBuild.",
        topic: "CodeDeploy",
        options: [
            ["BeforeAllowTraffic e AfterAllowTraffic.", true],
            ["ApplicationStop e ApplicationStart.", false],
            ["BeforeInstall e AfterInstall.", false],
            ["install e post_build.", false],
        ],
    },
    {
        statement:
            "Um CodePipeline tem os estágios Source, Build e Deploy. Como o artefato produzido pelo estágio de Build chega ao estágio de Deploy?",
        explanation:
            "O CodePipeline passa os artefatos (código e resultado do build) entre estágios usando um bucket S3 que ele gerencia: cada ação declara seus InputArtifacts e OutputArtifacts. Variáveis de ambiente do SO, volumes EBS ou filas SQS não são o mecanismo de transporte de artefatos do pipeline.",
        topic: "CodePipeline",
        options: [
            ["Por meio de artefatos armazenados em um bucket S3 que o pipeline gerencia.", true],
            ["Por variáveis de ambiente do sistema operacional.", false],
            ["Por um volume EBS compartilhado entre os estágios.", false],
            ["Por mensagens em uma fila do Amazon SQS.", false],
        ],
    },
    {
        statement:
            "Sobre os serviços Code no escopo atual (v2.1) do exame DVA-C02, quais afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O CodeArtifact é um repositório gerenciado de dependências (npm, PyPI, Maven, NuGet) e o CodeDeploy é guiado pelo arquivo AppSpec para implantar o artefato. As erradas: o CodeCommit saiu de escopo na v2.1 e não é o serviço de origem recomendado para novos pipelines; quem implanta a aplicação é o CodeDeploy, não o CodeBuild; e o CodePipeline orquestra os estágios, delegando o build ao CodeBuild.",
        topic: "Serviços Code",
        options: [
            [
                "O CodeArtifact é um repositório gerenciado de dependências, como npm, PyPI, Maven e NuGet.",
                true,
            ],
            ["O CodeDeploy usa o arquivo AppSpec para orquestrar a implantação do artefato.", true],
            ["O CodeCommit é o serviço de origem recomendado para novos pipelines.", false],
            ["O CodeBuild é o serviço que implanta a aplicação em EC2 e Lambda.", false],
            [
                "O CodePipeline compila e testa o código sem depender de nenhum outro serviço.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de pagamentos não pode ter downtime e precisa de rollback praticamente instantâneo caso a nova versão apresente erros em produção. Qual estratégia de deploy atende melhor a esses dois requisitos?",
        explanation:
            "No blue/green você sobe um ambiente novo e paralelo (green) com a versão nova e redireciona o tráfego do antigo (blue) para ele: praticamente zero downtime e rollback instantâneo, bastando reapontar o tráfego de volta para o blue. In-place atualiza as instâncias existentes, com janela de indisponibilidade e rollback mais lento; all-at-once troca tudo de uma vez com downtime; e rolling reduz a capacidade durante o processo.",
        topic: "Estratégias de deploy",
        options: [
            ["Blue/green.", true],
            ["In-place.", false],
            ["All-at-once.", false],
            ["Rolling.", false],
        ],
    },
    {
        statement:
            "Um deploy de Lambda deve enviar 10% do tráfego para a nova versão, aguardar 5 minutos observando as métricas e, se estiver tudo bem, deslocar os 100% restantes de uma vez. Que tipo de deslocamento de tráfego é esse?",
        explanation:
            "No canary, uma fração do tráfego (aqui, 10%) vai primeiro para a versão nova, o deploy espera um intervalo observando métricas e então envia todo o restante de uma só vez. No linear o tráfego cresce em incrementos iguais a cada intervalo (por exemplo, +10% por minuto), e no all-at-once tudo migra de imediato. In-place é uma filosofia de deploy, não um padrão de deslocamento de tráfego.",
        topic: "Estratégias de deploy",
        options: [
            ["Canary.", true],
            ["Linear.", false],
            ["All-at-once.", false],
            ["In-place.", false],
        ],
    },
    {
        statement:
            "Uma equipe busca a política de deploy mais segura do Elastic Beanstalk: provisionar instâncias totalmente novas em um novo Auto Scaling group e só trocar depois que todas passem na verificação de integridade, aceitando um processo mais lento e caro. Qual política escolher?",
        explanation:
            "A política Immutable cria um conjunto totalmente novo de instâncias em um novo Auto Scaling group e só promove a versão nova quando todas passam na verificação, o que a torna a mais segura e com rollback fácil, porém mais lenta e cara. All at once atualiza tudo de uma vez (com downtime), e as políticas rolling atualizam as instâncias existentes em lotes.",
        topic: "Elastic Beanstalk",
        options: [
            ["Immutable.", true],
            ["All at once.", false],
            ["Rolling.", false],
            ["Rolling with additional batch.", false],
        ],
    },
    {
        statement:
            "No Elastic Beanstalk, a equipe quer atualizar as instâncias em lotes sem que a capacidade total do ambiente caia durante o deploy, e sem manter instâncias extras permanentemente. Qual política atende?",
        explanation:
            "Rolling with additional batch sobe um lote extra de instâncias antes de começar, mantendo a capacidade total durante o deploy, e remove esse lote extra ao final. A política Rolling pura atualiza em lotes mas reduz a capacidade temporariamente; All at once troca tudo de uma vez com downtime; e Traffic splitting faz um canary do Beanstalk, sem o foco em manter capacidade em lotes.",
        topic: "Elastic Beanstalk",
        options: [
            ["Rolling with additional batch.", true],
            ["Rolling.", false],
            ["All at once.", false],
            ["Traffic splitting.", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre o deploy blue/green estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O blue/green mantém dois ambientes (o antigo, blue, e o novo, green) em paralelo durante a transição e permite rollback praticamente instantâneo reapontando o tráfego para o blue. As erradas: ele custa mais (dois ambientes ativos, não é o mais barato) e não atualiza in-place, que é a filosofia oposta; além disso, o CodeDeploy faz blue/green também para Lambda e ECS, não apenas para EC2.",
        topic: "Estratégias de deploy",
        options: [
            ["Mantém dois ambientes (o antigo e o novo) em paralelo durante a transição.", true],
            [
                "Permite rollback praticamente instantâneo ao reapontar o tráfego para o ambiente antigo.",
                true,
            ],
            ["É a opção mais barata, pois reaproveita as mesmas instâncias existentes.", false],
            ["Atualiza a versão diretamente nas instâncias em uso, no lugar (in-place).", false],
            ["Não é suportado para funções Lambda em nenhuma hipótese.", false],
        ],
    },
    {
        statement:
            "Antes de executar docker push para um repositório privado do Amazon ECR, o que o desenvolvedor precisa fazer?",
        explanation:
            "O acesso ao ECR é controlado por IAM: antes do docker push/pull você autentica o Docker com um token temporário obtido por aws ecr get-login-password (passado ao docker login). O ECR não é público por padrão, não exige que você provisione uma EC2 para o registry e não depende de um NAT gateway para autenticar.",
        topic: "ECR",
        options: [
            [
                "Autenticar o Docker com um token temporário obtido via aws ecr get-login-password.",
                true,
            ],
            ["Nada, pois o ECR é público e sem autenticação por padrão.", false],
            ["Provisionar uma instância EC2 para hospedar o registry.", false],
            ["Criar um NAT gateway na VPC para liberar o push.", false],
        ],
    },
    {
        statement: "Quais afirmações sobre o Amazon ECS estão corretas? (Selecione DUAS opções.)",
        explanation:
            "A task definition é o blueprint que define os contêineres, a imagem (do ECR), CPU/memória e os papéis IAM, e com o launch type Fargate você não provisiona nem gerencia instâncias EC2. As erradas: quem dá permissões ao código da aplicação é a task role (a task execution role serve para o agente puxar a imagem e enviar logs); manter o número desejado de tasks no ar é papel do service do ECS, não do ECR (que é o registro de imagens); e o service não encerra após uma execução única.",
        topic: "ECS",
        options: [
            [
                "A task definition é o blueprint que define os contêineres, a imagem, CPU/memória e os papéis IAM.",
                true,
            ],
            ["Com o launch type Fargate, você não provisiona nem gerencia instâncias EC2.", true],
            [
                "A task execution role concede ao código da aplicação acesso a serviços como S3 e DynamoDB.",
                false,
            ],
            [
                "O Amazon ECR é o componente que mantém o número desejado de tasks sempre em execução.",
                false,
            ],
            ["Um service executa a task uma única vez e encerra ao terminar.", false],
        ],
    },
    {
        statement:
            "Uma aplicação no Elastic Beanstalk precisa definir variáveis de ambiente e instalar um pacote do sistema operacional nas instâncias, sem abandonar o modelo PaaS. Onde colocar essa configuração?",
        explanation:
            "No Elastic Beanstalk, a customização do ambiente (option_settings, pacotes, comandos e até recursos AWS extras) vai em arquivos .config dentro de uma pasta .ebextensions/ na raiz do código. buildspec.yml é do CodeBuild e appspec.yml é do CodeDeploy, não do Beanstalk; e um change set apenas prevê mudanças de uma stack.",
        topic: "Elastic Beanstalk",
        options: [
            ["Em arquivos .config dentro de uma pasta .ebextensions/ na raiz do código.", true],
            ["Em um buildspec.yml na raiz do repositório.", false],
            ["Em um appspec.yml com hooks de ciclo de vida.", false],
            ["Em um change set do CloudFormation.", false],
        ],
    },
    {
        statement:
            "Uma funcao Lambda em producao grava logs em /aws/lambda/checkout. A equipe observa que cada ambiente de execucao cria uma sequencia separada de eventos, todos vindos da mesma origem. Como se chama essa sequencia de eventos dentro do grupo?",
        explanation:
            "Um log stream e a sequencia de eventos vinda de uma mesma origem (uma instancia do Lambda, um host, um container). O log group e o container de streams que guarda retencao e permissoes, e o log event e um unico registro com timestamp e mensagem.",
        topic: "CloudWatch Logs",
        options: [
            ["Log stream (fluxo de logs)", true],
            ["Log group (grupo de logs)", false],
            ["Log event (evento de log)", false],
            ["Namespace de metricas", false],
        ],
    },
    {
        statement:
            "A fatura de armazenamento do CloudWatch Logs de uma empresa cresce sem parar. Ao investigar, a equipe descobre que nenhum log group tem expiracao configurada. Qual acao resolve o problema de forma nativa?",
        explanation:
            "Por padrao, um log group nunca expira (retencao indefinida), entao os logs se acumulam para sempre. A correcao e definir uma politica de retencao (put-retention-policy), que aceita valores de 1 dia a 10 anos.",
        topic: "Retencao de logs",
        options: [
            ["Aumentar o tamanho da conta de armazenamento", false],
            ["Definir uma politica de retencao no log group (put-retention-policy)", true],
            ["Migrar os logs para o X-Ray, que expira sozinho", false],
            ["Reduzir a resolucao das metricas para 1 minuto", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor precisa publicar no CloudWatch um KPI de negocio (o numero de pedidos aprovados por minuto) que nenhum servico da AWS mede automaticamente. Qual API do CloudWatch ele deve usar?",
        explanation:
            "Metricas customizadas sao publicadas com a API PutMetricData. GetMetricData le metricas, PutLogEvents grava logs e DescribeAlarms consulta alarmes, nenhum deles publica uma metrica nova.",
        topic: "Metricas customizadas",
        options: [
            ["GetMetricData", false],
            ["PutLogEvents", false],
            ["PutMetricData", true],
            ["DescribeAlarms", false],
        ],
    },
    {
        statement:
            "Uma equipe quer que um alarme do CloudWatch so dispare quando 3 de 5 periodos de avaliacao violarem o threshold, evitando falsos positivos causados por picos isolados. Qual configuracao do alarme controla esse comportamento?",
        explanation:
            "O parametro datapoints to alarm (M de N) define quantos pontos dentro dos periodos de avaliacao precisam violar o limite para o alarme disparar, reduzindo falsos positivos. O comparison operator define apenas a comparacao (maior que, menor que).",
        topic: "Alarmes",
        options: [
            ["Comparison operator (operador de comparacao)", false],
            ["Datapoints to alarm (M de N)", true],
            ["StorageResolution da metrica", false],
            ["Politica de retencao do log group", false],
        ],
    },
    {
        statement:
            "Uma aplicacao publica uma metrica de alta resolucao, com um ponto por segundo, e a equipe quer um alarme capaz de reagir em 10 segundos. Isso e possivel no CloudWatch?",
        explanation:
            "Metricas de alta resolucao permitem criar alarmes de alta resolucao com periodo de 10 ou 30 segundos. Os alarmes padrao usam periodos multiplos de 60 segundos.",
        topic: "Alarmes de alta resolucao",
        options: [
            [
                "Sim, metricas de alta resolucao permitem alarmes com periodo de 10 ou 30 segundos",
                true,
            ],
            ["Nao, todo alarme do CloudWatch usa periodo minimo de 60 segundos", false],
            ["Sim, mas apenas para metricas padrao de servicos da AWS", false],
            ["Nao, alarmes de alta resolucao exigem o CloudWatch Agent", false],
        ],
    },
    {
        statement:
            "Quais metricas o AWS Lambda publica automaticamente no CloudWatch, sem que voce precise instrumentar o codigo? (Selecione DUAS opcoes.)",
        explanation:
            "O Lambda publica sozinho metricas como Invocations e Errors (alem de Duration e Throttles). Um KPI de negocio precisa ser publicado como metrica customizada, o uso de memoria RAM por dentro do SO exige o CloudWatch Agent e a contagem de itens de uma tabela nao e uma metrica de invocacao do Lambda.",
        topic: "Metricas do Lambda",
        options: [
            ["Invocations (numero de invocacoes)", true],
            ["Errors (numero de erros)", true],
            ["Um KPI de negocio como pedidos aprovados", false],
            ["Uso de memoria RAM do sistema operacional coletado por dentro da funcao", false],
            ["Numero de itens armazenados na sua tabela do DynamoDB", false],
        ],
    },
    {
        statement:
            "Uma funcao Lambda de altissimo volume precisa emitir metricas customizadas de negocio, mas a equipe quer evitar somar latencia a cada invocacao e nao quer depender da disponibilidade sincrona de uma API externa. Qual abordagem atende melhor?",
        explanation:
            "O Embedded Metric Format (EMF) faz a funcao apenas escrever um log estruturado, do qual o CloudWatch extrai a metrica de forma assincrona, sem chamada sincrona a PutMetricData. Chamar PutMetricData a cada invocacao soma latencia e dependencia de rede, o CloudWatch Agent nao se aplica ao Lambda e alarmes nao emitem metricas.",
        topic: "EMF",
        options: [
            ["Chamar PutMetricData de forma sincrona a cada invocacao", false],
            [
                "Emitir as metricas via Embedded Metric Format (EMF), escrevendo um log estruturado que o CloudWatch converte em metrica de forma assincrona",
                true,
            ],
            ["Instalar o CloudWatch Agent dentro da funcao Lambda", false],
            ["Criar um alarme de alta resolucao para cada metrica", false],
        ],
    },
    {
        statement:
            "Em um documento EMF, o bloco _aws.CloudWatchMetrics referencia por nome as dimensions e as metricas a extrair. Onde precisam estar os valores correspondentes a esses nomes para que o CloudWatch consiga montar a metrica?",
        explanation:
            "No EMF, o bloco _aws apenas descreve namespace, dimensions e metricas; os valores em si ficam no nivel raiz do proprio documento JSON, com as mesmas chaves citadas em Dimensions e Metrics. Sem esses valores na raiz, o CloudWatch nao tem o que extrair.",
        topic: "EMF",
        options: [
            ["No nivel raiz do proprio documento JSON, junto do bloco _aws", true],
            ["Aninhados dentro de cada metrica em _aws.CloudWatchMetrics", false],
            ["Em um segundo documento enviado por PutMetricData", false],
            ["Em um arquivo separado no S3 referenciado pelo log", false],
        ],
    },
    {
        statement:
            "Quais afirmacoes sobre o Embedded Metric Format (EMF) estao corretas? (Selecione DUAS opcoes.)",
        explanation:
            "No EMF, uma unica linha de log estruturado vira ao mesmo tempo uma metrica no CloudWatch Metrics e um registro pesquisavel no CloudWatch Logs, e o CloudWatch extrai essa metrica de forma assincrona, sem PutMetricData sincrono. Valores de alta cardinalidade como requestId devem ir como propriedades, nao como dimensions, e o EMF serve justamente para metricas customizadas.",
        topic: "EMF",
        options: [
            [
                "Uma unica linha de log estruturado vira, ao mesmo tempo, uma metrica e um registro pesquisavel nos logs",
                true,
            ],
            [
                "O CloudWatch extrai a metrica de forma assincrona, sem uma chamada sincrona a PutMetricData",
                true,
            ],
            ["O EMF exige que a funcao chame PutMetricData logo apos escrever o log", false],
            [
                "Valores de alta cardinalidade como requestId devem ser usados como dimensions",
                false,
            ],
            ["O EMF so funciona com metricas padrao dos servicos AWS, nao com customizadas", false],
        ],
    },
    {
        statement:
            "Ao analisar um trace lento no X-Ray, um desenvolvedor quer isolar quanto tempo a funcao gastou especificamente na chamada GetItem ao DynamoDB, separada do restante da logica. Qual elemento do X-Ray representa essa chamada individual dentro do segment da funcao?",
        explanation:
            "Um subsegment e uma unidade mais granular dentro de um segment, como a chamada a uma dependencia (por exemplo, o GetItem no DynamoDB). O trace e a requisicao ponta a ponta, o service map e o grafo de servicos e a annotation e apenas um dado indexado anexado ao trace.",
        topic: "X-Ray subsegments",
        options: [
            ["Subsegment (subsegmento)", true],
            ["Trace (rastro)", false],
            ["Service map (mapa de servicos)", false],
            ["Annotation", false],
        ],
    },
    {
        statement:
            "Em uma arquitetura API Gateway para Lambda para outro servico, o X-Ray consegue costurar todos os segments em um unico trace. Qual mecanismo garante que os servicos compartilhem o mesmo trace ID?",
        explanation:
            "A correlacao acontece pelo cabecalho X-Amzn-Trace-Id: o primeiro servico gera o trace ID e o coloca no header, e cada servico seguinte le e repassa esse cabecalho, de modo que todos os segments compartilham o mesmo trace ID.",
        topic: "X-Ray correlacao",
        options: [
            [
                "O cabecalho X-Amzn-Trace-Id, gerado no primeiro servico e propagado (lido e repassado) pelos seguintes",
                true,
            ],
            ["Um campo traceId gravado em uma tabela do DynamoDB compartilhada", false],
            ["O ARN da funcao Lambda usado como identificador comum", false],
            ["O request ID gerado pelo CloudTrail", false],
        ],
    },
    {
        statement:
            "No service map do X-Ray, um no de servico aparece com uma fatia vermelha indicando faults. O que isso representa?",
        explanation:
            "No service map, faults sao os erros do lado do servidor (5xx) naquele servico. Erros do lado do cliente (4xx) aparecem como errors e as requisicoes estranguladas (429) aparecem como throttles.",
        topic: "X-Ray service map",
        options: [
            ["Erros do lado do servidor (5xx) naquele servico", true],
            ["Erros do lado do cliente (4xx)", false],
            ["Requisicoes que sofreram throttling (429)", false],
            ["Requisicoes descartadas pela sampling rule", false],
        ],
    },
    {
        statement:
            "Sem configurar nenhuma sampling rule personalizada, qual e a taxa de amostragem padrao do AWS X-Ray?",
        explanation:
            "A regra padrao do X-Ray amostra 1 requisicao por segundo (o reservoir, um minimo garantido) mais 5% das requisicoes adicionais. Rastrear 100% seria caro e ruidoso, por isso o sampling existe.",
        topic: "X-Ray sampling",
        options: [
            ["1 requisicao por segundo (reservoir) mais 5% das requisicoes adicionais", true],
            ["100% de todas as requisicoes, por padrao", false],
            ["5 requisicoes por segundo, sem percentual adicional", false],
            ["1% de todas as requisicoes, sem minimo garantido", false],
        ],
    },
    {
        statement: "Quais afirmacoes sobre o AWS X-Ray estao corretas? (Selecione DUAS opcoes.)",
        explanation:
            "O X-Ray daemon escuta em UDP na porta 2000, agrupa os segments em lote e os envia ao servico. Annotations sao indexadas e permitem filtrar traces, enquanto metadata nao e indexada. Metadata nao entra em filter expressions, o sampling padrao nao rastreia 100% das requisicoes e o X-Ray faz tracing, nao armazenamento de logs.",
        topic: "X-Ray",
        options: [
            [
                "O X-Ray daemon escuta em UDP na porta 2000 e envia os segments em lote ao servico",
                true,
            ],
            ["Annotations sao indexadas e permitem filtrar traces; metadata nao e indexada", true],
            ["Metadata e indexada e pode ser usada em filter expressions", false],
            ["O sampling padrao rastreia 100% das requisicoes", false],
            ["O X-Ray substitui o CloudWatch Logs para armazenar logs de aplicacao", false],
        ],
    },
    {
        statement:
            "Uma aplicacao executa repetidamente a mesma query cara em um banco Amazon RDS e a equipe quer aliviar o banco guardando o resultado em um cache em memoria gerenciado na frente dele. Qual servico e o indicado?",
        explanation:
            "O Amazon ElastiCache (Redis ou Memcached) e o cache em memoria gerenciado colocado na frente de um banco como o RDS, ideal para aliviar queries caras e repetidas. O DAX e especifico do DynamoDB, o CloudFront e cache de borda e o CloudTrail e auditoria de API.",
        topic: "ElastiCache",
        options: [
            ["Amazon ElastiCache", true],
            ["Amazon DynamoDB Accelerator (DAX)", false],
            ["Amazon CloudFront", false],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Uma equipe adicionou o DAX na frente de uma tabela DynamoDB, mas percebe que as leituras fortemente consistentes continuam indo direto ao DynamoDB, sem se beneficiar do cache. Esse comportamento e esperado?",
        explanation:
            "Sim: leituras fortemente consistentes nao usam o cache do DAX e vao direto ao DynamoDB. O DAX acelera leituras eventualmente consistentes em cargas read-heavy e nao e indicado para cargas dominadas por escrita.",
        topic: "DAX",
        options: [
            [
                "Sim, leituras fortemente consistentes nao usam o cache do DAX; ele acelera leituras eventualmente consistentes",
                true,
            ],
            ["Nao, o DAX acelera qualquer leitura, inclusive as fortemente consistentes", false],
            ["Nao, isso indica que o cluster DAX esta mal configurado", false],
            ["Sim, porque o DAX so funciona para operacoes de escrita", false],
        ],
    },
    {
        statement:
            "Um cliente HTTP recebe respostas 403 de uma API e re-tenta automaticamente a mesma requisicao varias vezes, sempre sem sucesso. Qual e a explicacao correta?",
        explanation:
            "O 403 e um erro do cliente (classe 4xx): a requisicao chegou sem a devida autorizacao. Re-tentar a mesma requisicao nao resolve; e preciso corrigir credenciais ou permissoes. A excecao entre os 4xx e o 429 (throttling), que vale re-tentar com backoff.",
        topic: "Erros 4xx vs 5xx",
        options: [
            [
                "403 e erro do cliente (4xx); re-tentar a mesma requisicao nao resolve, e preciso corrigir a autorizacao ou as credenciais",
                true,
            ],
            [
                "403 e erro do servidor (5xx) e deveria ser re-tentado com backoff ate funcionar",
                false,
            ],
            ["403 significa throttling e o cliente deve re-tentar o mais rapido possivel", false],
            ["403 e um erro transitorio que desaparece sozinho se o cliente insistir", false],
        ],
    },
    {
        statement:
            "Uma auditoria de seguranca exige guardar o historico de chamadas de API da conta por varios anos. A equipe sabe que o Event history do CloudTrail cobre apenas os ultimos 90 dias. Qual e a forma recomendada de reter os eventos por mais tempo?",
        explanation:
            "O Event history do CloudTrail mantem os management events por 90 dias. Para retencao longa, cria-se um trail que entrega os eventos a um bucket do S3 (e, opcionalmente, ao CloudWatch Logs). Nao ha como esticar o proprio Event history, e metricas ou cache nao tem a ver com auditoria.",
        topic: "CloudTrail",
        options: [
            ["Criar um trail que entrega os eventos a um bucket do S3", true],
            ["Aumentar a retencao do Event history para 10 anos nas configuracoes", false],
            ["Publicar os eventos como metricas customizadas via PutMetricData", false],
            ["Ativar o cache do API Gateway para armazenar as chamadas", false],
        ],
    },
    {
        statement:
            "Sobre as camadas de cache da AWS, quais afirmacoes estao corretas? (Selecione DUAS opcoes.)",
        explanation:
            "O CloudFront faz cache de borda (edge), servindo conteudo estatico e dinamico a partir de pontos proximos ao usuario. O cache do API Gateway e habilitado por stage e guarda as respostas dos endpoints, com TTL de 0 a 3600 segundos. O DAX nao e uma CDN de borda, o cache especifico do DynamoDB e o DAX (nao o ElastiCache) e o CloudFront tambem serve conteudo dinamico.",
        topic: "Camadas de cache",
        options: [
            [
                "O CloudFront faz cache de borda (edge), servindo conteudo a partir de pontos proximos ao usuario no mundo todo",
                true,
            ],
            [
                "O cache do API Gateway e habilitado por stage e guarda as respostas dos endpoints, com TTL de 0 a 3600 segundos",
                true,
            ],
            ["O DAX e um cache de borda global, equivalente a uma CDN", false],
            ["O ElastiCache e o cache especifico e exclusivo do DynamoDB", false],
            ["O CloudFront so serve conteudo estatico e nunca conteudo dinamico", false],
        ],
    },
];

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "AWS Certified Developer Associate (DVA-C02)",
                provider: "aws",
                code: "DVA-C02",
                level: "Associate",
                description:
                    "Simulado no formato da prova DVA-C02: 130 minutos, corte de 72%. Mistura resposta única e múltipla, alinhado aos 4 domínios.",
                durationMinutes: 130,
                questionCount: 65,
                passPercent: 72,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    // Mantém provedor, código e nível em dia mesmo se o simulado já existia.
    await db
        .update(simulados)
        .set({ provider: "aws", code: "DVA-C02", level: "Associate" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
        return;
    }

    for (let i = 0; i < QUESTOES.length; i++) {
        const q = QUESTOES[i];
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({
                simuladoId: simulado.id,
                statement: q.statement,
                explanation: q.explanation,
                topic: q.topic,
            })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], idx) => ({
                questionId: questao.id,
                text,
                isCorrect,
                position: idx + 1,
            })),
        );
    }
    console.log(`Seed concluído: ${QUESTOES.length} questões inseridas.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
