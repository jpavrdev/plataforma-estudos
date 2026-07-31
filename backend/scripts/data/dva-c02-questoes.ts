// Banco de questões do simulado AWS Certified Developer Associate (DVA-C02).
// Compartilhado pelo seed (instalação nova) e pelo script de atualização
// (instalação que já tem o simulado). Regras do banco: distratores da mesma
// categoria da resposta e a correta não pode ser a única opção mais longa,
// nem a única mais curta por folga visível. Múltipla resposta usa o sufixo
// "(Selecione DUAS opções.)" com cinco opções e duas corretas; há também uma
// questão "Selecione TRÊS" (cinco opções, três corretas), formato que a prova
// real usa.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
    {
        statement:
            "Uma API de checkout roda em uma função Lambda com runtime Java. Todos os dias, no horário de pico, os primeiros usuários enfrentam alta latência por causa de cold starts. A equipe quer eliminar o cold start justamente nesse período previsível. Qual é a melhor abordagem?",
        explanation:
            "A concorrência provisionada mantém ambientes já inicializados (fase Init concluída), eliminando o cold start, e o Application Auto Scaling agendado sobe o pool pouco antes do pico previsível. A concorrência reservada apenas isola uma fatia do pool da conta: não pré-aquece ambientes, então o cold start continua. Mais memória acelera a execução e dá mais CPU, mas não elimina a partida a frio. O timeout limita a duração da invocação e nada tem a ver com cold start.",
        topic: "Lambda",
        options: [
            [
                "Configurar concorrência provisionada em um alias e elevá-la antes do pico com Auto Scaling agendado.",
                true,
            ],
            [
                "Configurar concorrência reservada na função, garantindo capacidade exclusiva para ela durante todo o horário de pico.",
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
                "Publicar uma versão (ou usar um alias) e aplicar a concorrência provisionada nela, que exige um alvo imutável.",
                true,
            ],
            ["Habilitar antes a concorrência reservada no $LATEST.", false],
            ["Remover as variáveis de ambiente, que são incompatíveis com o $LATEST.", false],
            [
                "Aguardar, pois o $LATEST só passa a aceitar concorrência provisionada 24 horas depois da primeira publicação da função.",
                false,
            ],
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
                "Definir concorrência reservada na função de lote, criando um teto e preservando o restante do pool para a API.",
                true,
            ],
            [
                "Configurar concorrência provisionada na função de lote para que ela pare de escalar além do valor aquecido configurado.",
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
            [
                "Concorrência provisionada apontando ao mesmo tempo para as duas versões publicadas da função.",
                false,
            ],
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
            ["Apontar o alias prod de volta para a versão publicada anterior.", true],
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
            [
                "Migrar para imagem de contêiner de 10 GB apenas para acomodar as bibliotecas compartilhadas.",
                false,
            ],
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
            ["Na execution role (IAM role) da função.", true],
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
                "Habilitar ReportBatchItemFailures no mapping e retornar os itemIdentifier das mensagens que falharam.",
                true,
            ],
            ["Reduzir o batch size para 1, isolando cada mensagem.", false],
            ["Capturar a exceção e retornar sucesso mesmo quando há falha.", false],
            [
                "Definir a batching window em 0 segundo para desativar o agrupamento e processar uma mensagem por vez.",
                false,
            ],
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
            [
                "Criar um Local Secondary Index (LSI) sobre o novo atributo na tabela existente.",
                false,
            ],
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
                "Um LSI, que compartilha a partition key, suporta leitura fortemente consistente e é criado junto com a tabela.",
                true,
            ],
            [
                "Um GSI, criado junto com a tabela para permitir leitura fortemente consistente em todas as consultas do novo padrão.",
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
            ["Suporta leitura fortemente consistente em qualquer configuração de chaves.", false],
            ["Deve ser criado obrigatoriamente junto com a tabela, como o LSI.", false],
        ],
    },
    {
        statement:
            "Sempre que um item da tabela Pedidos é criado, alterado ou removido, é preciso reagir à mudança para replicar o dado em outra tabela e atualizar um contador agregado. Qual recurso captura essas alterações para acionar uma função Lambda?",
        explanation:
            "O DynamoDB Streams é um log ordenado de alterações em nível de item (retido por 24h) que serve como event source poll para uma Lambda, ideal para replicar, notificar e atualizar agregados. Um Scan periódico é caro e não é orientado a evento. O TTL apenas expira itens; não é um mecanismo de notificação de todas as mudanças. A tabela não publica sozinha no SNS: seria necessário processar o Stream com uma Lambda.",
        topic: "DynamoDB",
        options: [
            ["DynamoDB Streams.", true],
            ["Um Scan periódico da tabela para detectar o que mudou.", false],
            ["O TTL da tabela.", false],
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
                "Amazon ElastiCache, reescrevendo a camada de acesso para gerenciar o cache manualmente.",
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
            ["Integração Lambda proxy (AWS_PROXY).", true],
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
            ["Integração MOCK.", true],
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
            [
                "Concorrência reservada com um valor diferente para a função em cada um dos stages da API.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma API precisa autorizar usuários que fazem login e recebem um JWT, validando o token a cada requisição sem que a equipe escreva qualquer código de autorização. Qual mecanismo de autorização atende a esse requisito?",
        explanation:
            "Com o autorizador Cognito user pools, o API Gateway valida o JWT (assinatura e expiração) contra o pool sem nenhum código seu, exatamente o que o cenário pede. O Lambda authorizer também valida tokens, mas exige que você escreva a função de autorização. A autorização IAM é para chamadas assinadas entre serviços/contas AWS. E uma API key apenas identifica o chamador num usage plan: ela não autentica.",
        topic: "API Gateway",
        options: [
            ["Um autorizador do tipo Amazon Cognito user pools.", true],
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
                "Uma presigned URL de PUT, que herda as permissões da identidade que a assinou.",
                true,
            ],
            ["Tornar o bucket público para aceitar uploads de qualquer origem.", false],
            ["Uma ACL pública de escrita no objeto.", false],
            [
                "Uma bucket policy concedendo s3:* a qualquer principal (Principal *) durante o upload.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa de uma trilha de auditoria no CloudTrail de cada operação de criptografia e descriptografia dos objetos, além de controle e rotação sobre a chave. Qual opção de criptografia server-side atende a esse requisito?",
        explanation:
            "O SSE-KMS mantém a chave no AWS KMS, o que dá controle, política e rotação da chave e, principalmente, uma trilha de auditoria no CloudTrail de cada uso. O SSE-S3 é gerenciado inteiramente pelo S3 e não oferece auditoria por chave. O SSE-C exige que você envie a chave a cada requisição e não fornece o mesmo registro gerenciado. Auditoria não acontece por acaso sem a escolha certa de criptografia.",
        topic: "S3",
        options: [
            ["SSE-KMS, com a chave da conta gerenciada no AWS KMS.", true],
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
                "Criptografia client-side: cifrar antes do upload, de modo que o S3 só veja texto cifrado.",
                true,
            ],
            ["SSE-S3, deixando o S3 cifrar com AES-256.", false],
            [
                "SSE-KMS, cifrando no servidor com uma chave gerenciada do KMS e acesso auditado pelo CloudTrail.",
                false,
            ],
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
            ["Amazon EC2, Amazon RDS e Amazon EBS, pela integração de eventos nativa.", false],
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
                "Dimensionar o visibility timeout ao tempo típico e estendê-lo com ChangeMessageVisibility se preciso.",
                true,
            ],
            [
                "Ativar long polling definindo WaitTimeSeconds entre 1 e 20 nas chamadas ReceiveMessage do consumidor.",
                false,
            ],
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
            [
                "Long polling com WaitTimeSeconds igual a 5 em todas as chamadas de recebimento.",
                false,
            ],
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
                "Amazon EventBridge, que roteia por event pattern e integra muitas fontes e destinos.",
                true,
            ],
            ["Amazon SQS, enfileirando os eventos para um worker.", false],
            [
                "Amazon SNS, usando filter policy aplicada aos atributos e ao corpo bruto de cada mensagem.",
                false,
            ],
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
            ["AWS Step Functions, uma máquina de estados com retry, catch e ramificações.", true],
            ["Encadear funções Lambda que chamam umas às outras diretamente.", false],
            [
                "Colocar uma fila SQS entre cada etapa e controlar o fluxo e os retries manualmente.",
                false,
            ],
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
                "Não, porque o deny explícito prevalece sobre qualquer allow, mesmo de policy gerenciada.",
                true,
            ],
            [
                "Sim, porque uma policy gerenciada pela AWS tem precedência sobre as políticas inline anexadas.",
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
            ["Uma resource-based policy (queue policy) na fila.", true],
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
                "Anexar uma IAM role à instância, para a aplicação usar credenciais temporárias.",
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
            ["A ação é negada pelo deny implícito.", true],
            ["A ação é permitida.", false],
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
            ["Customer managed policy, criada e versionada na conta.", true],
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
            [
                "Na permissions policy da role, listando todas as ações que os usuários da conta A executam.",
                false,
            ],
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
                "Ela tem um Principal do tipo Service com lambda.amazonaws.com, autorizando o serviço a assumir a role.",
                true,
            ],
            [
                "Ela tem um Principal do tipo AWS que aponta para o usuário root da conta em que a função foi criada.",
                false,
            ],
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
            [
                "O refresh token, usado diretamente para assinar as chamadas da aplicação ao S3.",
                false,
            ],
        ],
    },
    {
        statement:
            "No Cognito User Pool, qual dos tokens emitidos carrega as claims de identidade do usuário, como sub e email, funcionando como seu documento de identidade?",
        explanation:
            "O ID token contém as claims de identidade (quem é o usuário). O Access token autoriza chamadas a APIs e recursos protegidos; o Refresh token serve para renovar os outros dois sem novo login; e o SessionToken pertence ao STS, não ao User Pool.",
        topic: "Cognito",
        options: [
            ["O ID token do usuário.", true],
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
                "Entrega o token ao Identity Pool, que o valida e chama o STS para obter credenciais temporárias.",
                true,
            ],
            [
                "Envia o token diretamente ao S3 como credencial de acesso em cada requisição de gravação de arquivos.",
                false,
            ],
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
                "Envelope encryption: gerar uma data key, cifrar o arquivo localmente e guardar a key cifrada com os dados.",
                true,
            ],
            [
                "Enviar o arquivo inteiro ao KMS em várias chamadas Encrypt de 4 KB e concatenar os resultados cifrados na ordem.",
                false,
            ],
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
                "A versão em texto claro cifra os dados e é descartada; a cifrada fica guardada para decifrar depois.",
                true,
            ],
            ["Ambas são guardadas em texto claro para acelerar a leitura futura.", false],
            [
                "A versão cifrada cifra os dados e a versão em texto claro é enviada de volta ao KMS para guarda segura.",
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
            ["AWS managed key (aws/serviço).", false],
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
                "Buscar o segredo em runtime no Secrets Manager ou no Parameter Store (SecureString).",
                true,
            ],
            [
                "Manter na variável de ambiente, mas codificar o valor em base64 antes de fazer o deploy.",
                false,
            ],
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
            ["AWS Secrets Manager, rotação nativa.", true],
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
            [
                "Secrets Manager, criando um segredo individual pago para cada parâmetro da aplicação.",
                false,
            ],
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
            [
                "Migrar o parâmetro obrigatoriamente para o tier Advanced do Parameter Store antes da leitura.",
                false,
            ],
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
                "Copiando manualmente o segredo para um parâmetro do tipo String a cada leitura da aplicação.",
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
            [
                "Exportar a VPC com Export e consumi-la em cada projeto de aplicação com Fn::ImportValue.",
                false,
            ],
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
                "Habilita a macro do SAM, que expande a sintaxe serverless em recursos completos.",
                true,
            ],
            [
                "Define apenas a versão do formato do template, sem nenhum outro efeito na implantação.",
                false,
            ],
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
            [
                "Passar --capabilities CAPABILITY_IAM no comando de deploy para gerar a permissão de leitura.",
                false,
            ],
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
            ["sam build e sam validate, na ordem.", false],
            ["sam deploy --guided, com confirmação.", false],
            ["sam init e sam package, no diretório.", false],
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
            ["No Dockerrun.aws.json, na seção containerDefinitions do ambiente.", false],
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
            [
                "A seção artifacts do buildspec, listando o arquivo do segredo na lista files.",
                false,
            ],
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
            ["Ao appspec.yml do CodeDeploy.", true],
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
            ["BeforeInstall e AfterInstall do appspec.", false],
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
            ["Por variáveis de ambiente do sistema operacional das máquinas de build.", false],
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
            ["Rolling, em lotes simples.", false],
            ["All at once, de uma vez.", false],
            ["Traffic splitting, por percentual.", false],
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
            [
                "Nada, pois o ECR é público e dispensa autenticação por padrão em qualquer conta.",
                false,
            ],
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
            ["Em um buildspec.yml colocado na raiz do repositório principal da aplicação.", false],
            ["Em um appspec.yml com hooks de ciclo de vida.", false],
            ["Em um change set do CloudFormation.", false],
        ],
    },
    {
        statement:
            "Uma função Lambda em produção grava logs em /aws/lambda/checkout. A equipe observa que cada ambiente de execução cria uma sequência separada de eventos, todos vindos da mesma origem. Como se chama essa sequência de eventos dentro do grupo?",
        explanation:
            "Um log stream é a sequência de eventos vinda de uma mesma origem (uma instância do Lambda, um host, um container). O log group é o container de streams que guarda retenção e permissões, e o log event é um único registro com timestamp e mensagem.",
        topic: "CloudWatch Logs",
        options: [
            ["Log stream (fluxo de logs)", true],
            ["Log group (grupo de logs)", false],
            ["Log event (evento de log)", false],
            ["Namespace de métricas", false],
        ],
    },
    {
        statement:
            "A fatura de armazenamento do CloudWatch Logs de uma empresa cresce sem parar. Ao investigar, a equipe descobre que nenhum log group tem expiracao configurada. Qual acao resolve o problema de forma nativa?",
        explanation:
            "Por padrão, um log group nunca expira (retenção indefinida), então os logs se acumulam para sempre. A correcao e definir uma política de retenção (put-retention-policy), que aceita valores de 1 dia a 10 anos.",
        topic: "Retencao de logs",
        options: [
            ["Aumentar o tamanho da conta de armazenamento vinculada ao log group", false],
            ["Definir uma política de retenção no log group (put-retention-policy)", true],
            ["Migrar os logs para o X-Ray, que expira sozinho", false],
            ["Reduzir a resolução das métricas para 1 minuto", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor precisa publicar no CloudWatch um KPI de negócio (o número de pedidos aprovados por minuto) que nenhum serviço da AWS mede automaticamente. Qual API do CloudWatch ele deve usar?",
        explanation:
            "Metricas customizadas são publicadas com a API PutMetricData. GetMetricData le métricas, PutLogEvents grava logs e DescribeAlarms consulta alarmes, nenhum deles pública uma métrica nova.",
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
            "Uma equipe quer que um alarme do CloudWatch só dispare quando 3 de 5 períodos de avaliacao violarem o threshold, evitando falsos positivos causados por picos isolados. Qual configuração do alarme controla esse comportamento?",
        explanation:
            "O parâmetro datapoints to alarm (M de N) define quantos pontos dentro dos períodos de avaliacao precisam violar o limite para o alarme disparar, reduzindo falsos positivos. O comparison operator define apenas a comparacao (maior que, menor que).",
        topic: "Alarmes",
        options: [
            ["Comparison operator (operador de comparacao)", false],
            ["Datapoints to alarm (M de N)", true],
            ["StorageResolution da métrica", false],
            ["Politica de retenção do log group", false],
        ],
    },
    {
        statement:
            "Uma aplicação publica uma métrica de alta resolução, com um ponto por segundo, e a equipe quer um alarme capaz de reagir em 10 segundos. Isso é possível no CloudWatch?",
        explanation:
            "Metricas de alta resolução permitem criar alarmes de alta resolução com período de 10 ou 30 segundos. Os alarmes padrão usam períodos múltiplos de 60 segundos.",
        topic: "Alarmes de alta resolução",
        options: [
            [
                "Sim, métricas de alta resolução permitem alarmes com período de 10 ou 30 segundos",
                true,
            ],
            [
                "Não, todo alarme do CloudWatch usa período mínimo de 60 segundos por limitação da API",
                false,
            ],
            ["Sim, mas apenas para métricas padrão de serviços da AWS", false],
            ["Não, alarmes de alta resolução exigem o CloudWatch Agent", false],
        ],
    },
    {
        statement:
            "Quais métricas o AWS Lambda pública automaticamente no CloudWatch, sem que você precise instrumentar o código? (Selecione DUAS opções.)",
        explanation:
            "O Lambda pública sozinho métricas como Invocations e Errors (além de Duration e Throttles). Um KPI de negócio precisa ser publicado como métrica customizada, o uso de memória RAM por dentro do SO exige o CloudWatch Agent e a contagem de itens de uma tabela não é uma métrica de invocação do Lambda.",
        topic: "Metricas do Lambda",
        options: [
            ["Invocations (número de invocações)", true],
            ["Errors (número de erros)", true],
            ["Um KPI de negócio como pedidos aprovados", false],
            ["Uso de memória RAM do sistema operacional coletado por dentro da função", false],
            ["Numero de itens armazenados na sua tabela do DynamoDB", false],
        ],
    },
    {
        statement:
            "Uma função Lambda de altíssimo volume precisa emitir métricas customizadas de negócio, mas a equipe quer evitar somar latência a cada invocação e não quer depender da disponibilidade síncrona de uma API externa. Qual abordagem atende melhor?",
        explanation:
            "O Embedded Metric Format (EMF) faz a função apenas escrever um log estruturado, do qual o CloudWatch extrai a métrica de forma assíncrona, sem chamada síncrona a PutMetricData. Chamar PutMetricData a cada invocação soma latência e dependencia de rede, o CloudWatch Agent não se aplica ao Lambda e alarmes não emitem métricas.",
        topic: "EMF",
        options: [
            [
                "Chamar PutMetricData de forma síncrona a cada invocação, aguardando a resposta da API antes de retornar",
                false,
            ],
            [
                "Emitir via Embedded Metric Format (EMF): um log estruturado que vira métrica de forma assíncrona",
                true,
            ],
            ["Instalar o CloudWatch Agent dentro da função Lambda", false],
            ["Criar um alarme de alta resolução para cada métrica", false],
        ],
    },
    {
        statement:
            "Em um documento EMF, o bloco _aws.CloudWatchMetrics referência por nome as dimensions e as métricas a extrair. Onde precisam estar os valores correspondentes a esses nomes para que o CloudWatch consiga montar a métrica?",
        explanation:
            "No EMF, o bloco _aws apenas descreve namespace, dimensions e métricas; os valores em si ficam no nível raiz do próprio documento JSON, com as mesmas chaves citadas em Dimensions e Metrics. Sem esses valores na raiz, o CloudWatch não tem o que extrair.",
        topic: "EMF",
        options: [
            ["No nível raiz do próprio documento JSON, junto do bloco _aws", true],
            ["Aninhados dentro de cada métrica em _aws.CloudWatchMetrics", false],
            ["Em um segundo documento enviado por PutMetricData", false],
            ["Em um arquivo separado no S3 referenciado pelo log", false],
        ],
    },
    {
        statement:
            "Quais afirmacoes sobre o Embedded Metric Format (EMF) estao corretas? (Selecione DUAS opções.)",
        explanation:
            "No EMF, uma única linha de log estruturado vira ao mesmo tempo uma métrica no CloudWatch Metrics e um registro pesquisável no CloudWatch Logs, e o CloudWatch extrai essa métrica de forma assíncrona, sem PutMetricData síncrono. Valores de alta cardinalidade como requestId devem ir como propriedades, não como dimensions, e o EMF serve justamente para métricas customizadas.",
        topic: "EMF",
        options: [
            [
                "Uma única linha de log estruturado vira, ao mesmo tempo, uma métrica e um registro pesquisável nos logs",
                true,
            ],
            [
                "O CloudWatch extrai a métrica de forma assíncrona, sem uma chamada síncrona a PutMetricData",
                true,
            ],
            ["O EMF exige que a função chame PutMetricData logo apos escrever o log", false],
            [
                "Valores de alta cardinalidade como requestId devem ser usados como dimensions",
                false,
            ],
            ["O EMF só funciona com métricas padrão dos serviços AWS, não com customizadas", false],
        ],
    },
    {
        statement:
            "Ao analisar um trace lento no X-Ray, um desenvolvedor quer isolar quanto tempo a função gastou especificamente na chamada GetItem ao DynamoDB, separada do restante da lógica. Qual elemento do X-Ray representa essa chamada individual dentro do segment da função?",
        explanation:
            "Um subsegment é uma unidade mais granular dentro de um segment, como a chamada a uma dependencia (por exemplo, o GetItem no DynamoDB). O trace é a requisição ponta a ponta, o service map é o grafo de serviços e a annotation é apenas um dado indexado anexado ao trace.",
        topic: "X-Ray subsegments",
        options: [
            ["Subsegment (subsegmento)", true],
            ["Trace (rastro)", false],
            ["Service map (mapa de serviços)", false],
            ["Annotation", false],
        ],
    },
    {
        statement:
            "Em uma arquitetura API Gateway para Lambda para outro serviço, o X-Ray consegue costurar todos os segments em um único trace. Qual mecanismo garante que os serviços compartilhem o mesmo trace ID?",
        explanation:
            "A correlacao acontece pelo cabeçalho X-Amzn-Trace-Id: o primeiro serviço gera o trace ID e o coloca no header, e cada serviço seguinte le e repassa esse cabeçalho, de modo que todos os segments compartilham o mesmo trace ID.",
        topic: "X-Ray correlacao",
        options: [
            [
                "O cabeçalho X-Amzn-Trace-Id, gerado no primeiro serviço e propagado pelos seguintes",
                true,
            ],
            [
                "Um campo traceId gravado em uma tabela do DynamoDB compartilhada entre todos os serviços da cadeia",
                false,
            ],
            ["O ARN da função Lambda usado como identificador comum", false],
            ["O request ID gerado pelo CloudTrail", false],
        ],
    },
    {
        statement:
            "No service map do X-Ray, um nó de serviço aparece com uma fatia vermelha indicando faults. O que isso representa?",
        explanation:
            "No service map, faults são os erros do lado do servidor (5xx) naquele serviço. Erros do lado do cliente (4xx) aparecem como errors e as requisições estranguladas (429) aparecem como throttles.",
        topic: "X-Ray service map",
        options: [
            ["Erros do lado do servidor (5xx) naquele serviço", true],
            ["Erros do lado do cliente (4xx) naquele serviço", false],
            ["Requisições que sofreram throttling (429)", false],
            ["Requisições descartadas pela sampling rule", false],
        ],
    },
    {
        statement:
            "Sem configurar nenhuma sampling rule personalizada, qual é a taxa de amostragem padrão do AWS X-Ray?",
        explanation:
            "A regra padrão do X-Ray amostra 1 requisição por segundo (o reservoir, um mínimo garantido) mais 5% das requisições adicionais. Rastrear 100% seria caro e ruidoso, por isso o sampling existe.",
        topic: "X-Ray sampling",
        options: [
            ["1 requisição por segundo (reservoir) mais 5% das requisições adicionais", true],
            ["100% de todas as requisições, por padrão", false],
            ["5 requisições por segundo fixas, sem nenhum percentual adicional aplicado", false],
            ["1% de todas as requisições, sem mínimo garantido", false],
        ],
    },
    {
        statement: "Quais afirmacoes sobre o AWS X-Ray estao corretas? (Selecione DUAS opções.)",
        explanation:
            "O X-Ray daemon escuta em UDP na porta 2000, agrupa os segments em lote e os envia ao serviço. Annotations são indexadas e permitem filtrar traces, enquanto metadata não e indexada. Metadata não entra em filter expressions, o sampling padrão não rastreia 100% das requisições e o X-Ray faz tracing, não armazenamento de logs.",
        topic: "X-Ray",
        options: [
            [
                "O X-Ray daemon escuta em UDP na porta 2000 e envia os segments em lote ao serviço",
                true,
            ],
            ["Annotations são indexadas e permitem filtrar traces; metadata não e indexada", true],
            ["Metadata e indexada e pode ser usada em filter expressions", false],
            ["O sampling padrão rastreia 100% das requisições", false],
            ["O X-Ray substitui o CloudWatch Logs para armazenar logs de aplicação", false],
        ],
    },
    {
        statement:
            "Uma aplicação executa repetidamente a mesma query cara em um banco Amazon RDS e a equipe quer aliviar o banco guardando o resultado em um cache em memória gerenciado na frente dele. Qual serviço é o indicado?",
        explanation:
            "O Amazon ElastiCache (Redis ou Memcached) é o cache em memória gerenciado colocado na frente de um banco como o RDS, ideal para aliviar queries caras e repetidas. O DAX e específico do DynamoDB, o CloudFront é cache de borda e o CloudTrail é auditoria de API.",
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
            "Sim: leituras fortemente consistentes não usam o cache do DAX e vao direto ao DynamoDB. O DAX acelera leituras eventualmente consistentes em cargas read-heavy e não é indicado para cargas dominadas por escrita.",
        topic: "DAX",
        options: [
            [
                "Sim, leituras fortemente consistentes não usam o cache; o DAX acelera as eventualmente consistentes",
                true,
            ],
            [
                "Não, o DAX acelera qualquer leitura, inclusive as fortemente consistentes, quando o cluster está saudável",
                false,
            ],
            ["Não, isso indica que o cluster DAX está mal configurado", false],
            ["Sim, porque o DAX só funciona para operações de escrita", false],
        ],
    },
    {
        statement:
            "Um cliente HTTP recebe respostas 403 de uma API e re-tenta automaticamente a mesma requisição várias vezes, sempre sem sucesso. Qual é a explicacao correta?",
        explanation:
            "O 403 é um erro do cliente (classe 4xx): a requisição chegou sem a devida autorização. Re-tentar a mesma requisição não resolve; é preciso corrigir credenciais ou permissões. A exceção entre os 4xx é o 429 (throttling), que vale re-tentar com backoff.",
        topic: "Erros 4xx vs 5xx",
        options: [
            [
                "403 é erro do cliente (4xx); repetir não resolve, é preciso corrigir a autorização ou as credenciais",
                true,
            ],
            [
                "403 é erro do servidor (5xx) e deve ser re-tentado com backoff exponencial até a chamada funcionar",
                false,
            ],
            ["403 significa throttling e o cliente deve re-tentar o mais rápido possível", false],
            ["403 é um erro transitório que desaparece sozinho se o cliente insistir", false],
        ],
    },
    {
        statement:
            "Uma auditoria de segurança exige guardar o histórico de chamadas de API da conta por vários anos. A equipe sabe que o Event history do CloudTrail cobre apenas os ultimos 90 dias. Qual é a forma recomendada de reter os eventos por mais tempo?",
        explanation:
            "O Event history do CloudTrail mantém os management events por 90 dias. Para retenção longa, cria-se um trail que entrega os eventos a um bucket do S3 (e, opcionalmente, ao CloudWatch Logs). Não ha como esticar o próprio Event history, e métricas ou cache não tem a ver com auditoria.",
        topic: "CloudTrail",
        options: [
            ["Criar um trail que entrega os eventos a um bucket do S3", true],
            ["Aumentar a retenção do Event history para 10 anos nas configurações", false],
            ["Publicar os eventos como métricas customizadas via PutMetricData", false],
            ["Ativar o cache do API Gateway para armazenar as chamadas", false],
        ],
    },
    {
        statement:
            "Sobre as camadas de cache da AWS, quais afirmacoes estao corretas? (Selecione DUAS opções.)",
        explanation:
            "O CloudFront faz cache de borda (edge), servindo conteúdo estático e dinâmico a partir de pontos proximos ao usuário. O cache do API Gateway e habilitado por stage e guarda as respostas dos endpoints, com TTL de 0 a 3600 segundos. O DAX não é uma CDN de borda, o cache específico do DynamoDB é o DAX (não o ElastiCache) e o CloudFront também serve conteúdo dinâmico.",
        topic: "Camadas de cache",
        options: [
            [
                "O CloudFront faz cache de borda (edge), servindo conteúdo a partir de pontos proximos ao usuário no mundo todo",
                true,
            ],
            [
                "O cache do API Gateway e habilitado por stage e guarda as respostas dos endpoints, com TTL de 0 a 3600 segundos",
                true,
            ],
            ["O DAX é um cache de borda global, equivalente a uma CDN", false],
            ["O ElastiCache é o cache específico e exclusivo do DynamoDB", false],
            ["O CloudFront só serve conteúdo estático e nunca conteúdo dinâmico", false],
        ],
    },
    {
        statement:
            "Uma função Lambda guarda uma chave de API de terceiros em uma variável de ambiente. A equipe de segurança exige que o valor fique cifrado em repouso e que apenas a função consiga decifra-lo em tempo de execução. Qual abordagem atende a esse requisito?",
        explanation:
            "As variáveis de ambiente já ficam cifradas em repouso, mas para segredos usa-se uma CMK do KMS com os encryption helpers, que decifram o valor no código em tempo de execução. Base64 não e criptografia e enviar a chave em todo payload aumenta a exposicao.",
        topic: "Lambda",
        options: [
            [
                "Habilitar a criptografia com uma chave do KMS gerenciada pelo cliente e usar os helpers de criptografia para decifrar o valor no código durante a inicializacao.",
                true,
            ],
            [
                "Confiar apenas na criptografia padrão em repouso, que já usa uma chave gerenciada pela AWS, pois isso impede que qualquer pessoa com acesso ao console leia o valor em texto claro.",
                false,
            ],
            [
                "Ofuscar o valor em Base64 antes de salva-lo na variável de ambiente, já que o Lambda decodifica automaticamente as variáveis marcadas como sensiveis na inicializacao.",
                false,
            ],
            [
                "Passar a chave de API no payload de cada invocação, evitando armazena-la na configuração da função e eliminando a necessidade de criptografia.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma função Lambda e invocada de forma assíncrona pelo S3. A equipe quer que, quando o processamento falhar apos todas as retentativas, o evento seja enviado com o contexto do erro para uma fila SQS de análise. Qual recurso é o mais indicado?",
        explanation:
            "Os Lambda destinations para invocação assíncrona enviam ao destino on-failure o evento junto com o contexto da resposta, incluindo detalhes do erro, mais informação do que a DLQ, que só entrega o payload. Event source mapping não se aplica a invocação assíncrona pelo S3.",
        topic: "Lambda",
        options: [
            [
                "Configurar uma dead-letter queue (DLQ) na função, que encaminha o evento para o SQS, mas entrega apenas o payload original sem os detalhes da resposta nem o contexto da execução que falhou.",
                false,
            ],
            [
                "Aumentar o número de retentativas assincronas para o máximo e ativar o X-Ray, de modo que o evento com erro fique registrado no trace e possa ser reprocessado manualmente a partir dele.",
                false,
            ],
            [
                "Usar um event source mapping entre a função e a fila SQS, garantindo que qualquer invocação com falha seja reenviada automaticamente para a mesma fila.",
                false,
            ],
            [
                "Configurar um destino de invocação para o caso de falha (on failure) apontando para a fila SQS, capturando o evento junto com o contexto da resposta.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma função Lambda baixa arquivos temporários grandes durante o processamento e precisa de espaco em disco local. O que é correto sobre o armazenamento efemero disponível para a função?",
        explanation:
            "O Lambda oferece o diretório /tmp como armazenamento efemero, com tamanho configuravel, reaproveitado enquanto o mesmo ambiente de execução quente atende novas invocações. Para dados persistentes e compartilhados usa-se EFS ou S3.",
        topic: "Lambda",
        options: [
            [
                "A função dispoe do diretório /tmp, configuravel e reaproveitado enquanto o ambiente de execução permanecer quente entre invocações.",
                true,
            ],
            [
                "O único armazenamento gravável é a memória RAM alocada a função, portanto arquivos temporários precisam ser mantidos inteiramente em variáveis na memória durante a execução.",
                false,
            ],
            ["A função deve montar um sistema de arquivos externo obrigatoriamente.", false],
            [
                "O diretório /tmp existe, porem e apagado e recriado a cada invocação, mesmo quando o mesmo ambiente de execução e reutilizado para requisições seguintes.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma tabela DynamoDB guarda sessões de usuário que devem ser removidas automaticamente algum tempo apos expirarem, sem custo extra de escrita e sem que a aplicação precise varrer e apagar itens. Qual recurso resolve isso?",
        explanation:
            "O TTL do DynamoDB remove itens automaticamente apos o timestamp definido em um atributo, sem consumir capacidade de escrita. Varrer a tabela com Lambda gera custo e o modo on-demand não apaga itens por conta própria.",
        topic: "DynamoDB",
        options: [
            [
                "Criar uma regra do EventBridge que, a cada minuto, dispara uma função Lambda para escanear a tabela e executar DeleteItem em cada sessão cujo timestamp de expiracao já tenha passado.",
                false,
            ],
            [
                "Habilitar o DynamoDB Streams e processar cada item com uma Lambda que verifica a data de expiracao e remove os itens vencidos assim que eles são gravados na tabela.",
                false,
            ],
            [
                "Habilitar o TTL na tabela, indicando o atributo que contem o timestamp de expiracao para que o serviço apague os itens vencidos automaticamente.",
                true,
            ],
            ["Definir a capacidade da tabela como on-demand.", false],
        ],
    },
    {
        statement:
            "Dois processos podem atualizar o mesmo item de estoque ao mesmo tempo, e a equipe quer evitar que uma escrita sobrescreva a outra sem perceber (lost update). Qual tecnica do DynamoDB previne isso?",
        explanation:
            "O bloqueio otimista usa um atributo de versão com uma condition expression: a escrita só ocorre se a versão não mudou, caso contrario falha com erro condicional. Leitura consistente e GSI não previnem lost updates.",
        topic: "DynamoDB",
        options: [
            ["Ativar leituras fortemente consistentes em todas as operações.", false],
            [
                "Configurar um GSI sobre o atributo de versão, pois assim o DynamoDB rejeita qualquer PutItem cujo número de versão seja menor do que o já indexado no índice secundario.",
                false,
            ],
            [
                "Aumentar o visibility timeout no DynamoDB Streams para que a segunda escrita aguarde a primeira ser propagada antes de ser aplicada sobre o mesmo item.",
                false,
            ],
            [
                "Manter um atributo de versão no item e usar uma condition expression que só aplica a escrita se a versão atual for a esperada.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma nova aplicação tera tráfego imprevisível, com picos súbitos e períodos de quase nenhuma atividade, e a equipe não quer gerenciar capacidade nem arriscar throttling durante os picos. Qual modo de capacidade do DynamoDB é o mais adequado?",
        explanation:
            "O modo on-demand escala instantaneamente com o tráfego e cobra por requisição, ideal para cargas imprevisiveis sem planejamento de capacidade. Auto scaling provisionado reage mais devagar e capacidade fixa ou reservada desperdica recurso nos períodos de baixa.",
        topic: "DynamoDB",
        options: [
            [
                "Provisionado com auto scaling configurado com um alvo de utilizacao baixo e limites máximos altos.",
                false,
            ],
            [
                "On-demand, que escala automaticamente conforme o tráfego e cobra por requisição, sem exigir estimativa previa de capacidade.",
                true,
            ],
            [
                "Provisionado com capacidade fixa dimensionada para o maior pico já observado, garantindo margem de sobra e evitando qualquer throttling mesmo nos momentos de baixa atividade.",
                false,
            ],
            [
                "Provisionado com capacidade reservada comprada por um ano, aproveitando o desconto e cobrindo os picos com a capacidade de burst acumulada nos períodos ociosos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor executa uma operação Query com uma FilterExpression e se surpreende porque o consumo de capacidade de leitura e alto mesmo retornando poucos itens. Qual explicacao está correta?",
        explanation:
            "A FilterExpression é aplicada depois que o DynamoDB le os itens que casam com a KeyConditionExpression, então a capacidade e cobrada sobre os itens avaliados, não sobre os poucos retornados. Reduzir o custo exige melhor modelagem de chaves ou um índice.",
        topic: "DynamoDB",
        options: [
            [
                "A FilterExpression foi aplicada sobre a partition key, e filtrar pela partition key forca um Scan completo da tabela antes de qualquer filtragem dos resultados.",
                false,
            ],
            [
                "O consumo e alto porque a FilterExpression exige leituras fortemente consistentes obrigatoriamente.",
                false,
            ],
            [
                "O filtro é aplicado depois que os itens são lidos, então a capacidade e consumida com base nos itens avaliados, não nos itens retornados.",
                true,
            ],
            [
                "So é possível filtrar itens no DynamoDB usando um Scan, que percorre a tabela inteira, e por isso qualquer filtragem sempre custa a leitura de todos os itens existentes.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma tabela DynamoDB precisa disparar uma Lambda a cada alteração, e a função precisa comparar o estado anterior e o novo do item para auditar o que mudou. Como configurar o DynamoDB Streams?",
        explanation:
            "O StreamViewType NEW_AND_OLD_IMAGES coloca no registro do stream a imagem do item antes e depois da alteração, ideal para auditar diferencas. KEYS_ONLY e NEW_IMAGE não trazem o estado anterior completo.",
        topic: "DynamoDB Streams",
        options: [
            [
                "Habilitar o stream com a visão KEYS_ONLY e fazer um GetItem na Lambda para buscar o estado anterior do item.",
                false,
            ],
            [
                "Habilitar o stream com a visão NEW_AND_OLD_IMAGES, que entrega o item antes e depois de cada alteração.",
                true,
            ],
            [
                "Habilitar o stream com a visão NEW_IMAGE e reconstruir o estado anterior com os registros das últimas 24 horas.",
                false,
            ],
            [
                "Não é possível obter o estado anterior pelo stream; a auditoria precisa do TTL e dos itens arquivados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai expor uma API simples de proxy para funções Lambda e quer o menor custo e a menor latência, abrindo mão de recursos como cache integrado, validacao de request e API keys com usage plans. Qual tipo de API do API Gateway escolher?",
        explanation:
            "As HTTP APIs foram feitas para casos simples de proxy, com menor custo e latência, abrindo mão de recursos das REST APIs, como cache e usage plans. WebSocket serve para comunicacao bidirecional, não para request/response de baixa latência.",
        topic: "API Gateway",
        options: [
            [
                "REST API, porque é a única que suporta integração de proxy com Lambda e oferece a menor latência entre todos os tipos disponíveis no API Gateway.",
                false,
            ],
            ["WebSocket API, indicada para qualquer integração com Lambda de baixo custo.", false],
            [
                "REST API com cache habilitado no stage, o que reduz o custo por chamada ao evitar que a maioria das requisições chegue de fato até a função Lambda de backend.",
                false,
            ],
            [
                "HTTP API, que tem custo menor e menor latência, com um conjunto de recursos mais enxuto.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um endpoint GET do API Gateway serve dados que mudam pouco e recebe muitas requisições repetidas, sobrecarregando o backend. A equipe quer reduzir as chamadas ao backend sem alterar o código. O que fazer?",
        explanation:
            "O cache de stage do API Gateway guarda as respostas por um TTL configuravel e serve as requisições repetidas sem acionar o backend. Throttling apenas limita a taxa e usage plans com API keys controlam acesso, não fazem cache.",
        topic: "API Gateway",
        options: [
            ["Ativar o throttling no stage com um limite baixo de requisições por segundo.", false],
            [
                "Configurar um usage plan com API keys para cada cliente, distribuindo as requisições entre várias chaves e assim diminuindo a quantidade total de chamadas que alcancam o backend.",
                false,
            ],
            [
                "Habilitar o cache no stage e definir um TTL, para que respostas repetidas sejam servidas pelo cache sem chegar ao backend.",
                true,
            ],
            [
                "Trocar a integração para WebSocket, mantendo uma conexão aberta por cliente para que respostas anteriores sejam reaproveitadas sem novas chamadas ao backend.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma API pública e consumida por vários parceiros e a equipe precisa limitar quantas requisições cada parceiro pode fazer por mês e a que taxa, cobrando de forma diferente por nível de serviço. Qual recurso do API Gateway atende a isso?",
        explanation:
            "Usage plans associados a API keys definem quota, por exemplo mensal, e throttling por cliente, ideais para diferentes níveis de parceiros. O throttling de conta e global e stage variables não impoem limites de uso.",
        topic: "API Gateway",
        options: [
            [
                "Associar API keys a usage plans, que definem quota e limites de throttling por cliente.",
                true,
            ],
            ["Configurar o throttling no nível da conta e da região.", false],
            [
                "Criar um Lambda authorizer que conta as requisições de cada parceiro em uma tabela e rejeita as chamadas quando o parceiro ultrapassa a cota mensal contratada.",
                false,
            ],
            [
                "Usar stage variables para armazenar o limite de cada parceiro e deixar o API Gateway bloquear automaticamente as chamadas que excederem o valor configurado na variável.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um app de chat precisa que o servidor envie mensagens aos clientes conectados no momento em que elas chegam, sem que o cliente fique fazendo polling. Qual tipo de API do API Gateway suporta esse padrão bidirecional?",
        explanation:
            "A WebSocket API mantém uma conexão persistente e roteia mensagens por rotas como $connect, $disconnect e customizadas, permitindo ao servidor enviar dados ao cliente a qualquer momento. REST e HTTP APIs seguem o modelo request/response.",
        topic: "API Gateway",
        options: [
            ["REST API com long polling habilitado no stage.", false],
            [
                "HTTP API com CORS configurado, que permite ao backend abrir conexões de saída para o navegador do cliente e empurrar mensagens assim que elas ficam disponíveis.",
                false,
            ],
            [
                "WebSocket API, que mantém uma conexão persistente e usa rotas como $connect, $disconnect e rotas customizadas para troca bidirecional.",
                true,
            ],
            [
                "REST API integrada ao SNS, publicando cada mensagem em um topico ao qual os navegadores dos clientes se inscrevem diretamente para recebe-las em tempo real.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai orquestrar um fluxo de curtíssima duracao invocado dezenas de milhares de vezes por segundo, priorizando alto volume e menor custo por execução, e não precisa do histórico visual de cada execução guardado por muito tempo. Qual tipo de workflow do Step Functions escolher?",
        explanation:
            "Os workflows Express são feitos para alto volume e curta duracao, com cobrança por quantidade e tempo de execução, ao custo de menos histórico. O modo Standard privilegia durabilidade e histórico longo, com semantica exactly-once.",
        topic: "Step Functions",
        options: [
            [
                "Standard, porque é o único que garante a execução exatamente uma vez e mantém o custo baixo mesmo em cenários de altíssimo volume de invocações por segundo.",
                false,
            ],
            [
                "Express, otimizado para alto volume e curta duracao, com cobrança por número e duracao das execuções.",
                true,
            ],
            [
                "Standard, pois workflows Express não conseguem invocar funções Lambda nem integrar com outros serviços da AWS dentro dos estados do fluxo.",
                false,
            ],
            ["Express com o histórico completo de execução habilitado no console.", false],
        ],
    },
    {
        statement:
            "Em uma máquina de estados do Step Functions, um estado Task que chama uma Lambda as vezes falha por erros transitorios. A equipe quer repetir automaticamente algumas vezes com backoff e, se ainda assim falhar, desviar para um estado de tratamento. Como configurar isso?",
        explanation:
            "Estados como Task suportam os campos Retry, com intervalo, backoff e número máximo de tentativas, e Catch, que desvia para outro estado quando o erro persiste. Parallel e DLQ não são o mecanismo de tratamento de erro entre estados.",
        topic: "Step Functions",
        options: [
            [
                "Envolver a chamada em um estado Parallel com dois ramos identicos, de modo que, se um ramo falhar, o outro assuma o resultado e a máquina de estados continue normalmente.",
                false,
            ],
            ["Configurar uma DLQ diretamente no estado Task.", false],
            [
                "Tratar todos os erros dentro do código da Lambda com try/catch e retornar sempre sucesso, já que o Step Functions não oferece mecanismo próprio de retentativa entre estados.",
                false,
            ],
            [
                "Adicionar campos Retry, com backoff, e Catch no estado Task para repetir e depois desviar para um estado de tratamento de erro.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um consumidor faz ReceiveMessage em uma fila SQS em loop e a equipe percebe muitas respostas vazias, elevando o custo de requisições quando a fila esta quase sempre sem mensagens. Qual ajuste reduz as respostas vazias?",
        explanation:
            "O long polling, com WaitTimeSeconds maior que zero, faz o ReceiveMessage esperar por mensagens antes de retornar, reduzindo respostas vazias e o custo de requisições. Visibility timeout, FIFO e maxReceiveCount não tem esse efeito.",
        topic: "SQS",
        options: [
            [
                "Diminuir o visibility timeout da fila para zero, de modo que as mensagens fiquem imediatamente disponíveis e o consumidor nunca receba uma resposta vazia em suas chamadas.",
                false,
            ],
            [
                "Habilitar o long polling definindo WaitTimeSeconds maior que zero, para a chamada aguardar mensagens chegarem antes de retornar.",
                true,
            ],
            [
                "Trocar a fila Standard por uma fila FIFO, pois o modo FIFO agrupa as mensagens e responde somente quando ha um lote completo pronto para entrega ao consumidor.",
                false,
            ],
            ["Aumentar o maxReceiveCount na redrive policy.", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa executar uma função Lambda todos os dias as 2h da manha para gerar um relatório, sem manter servidores ligados nem código de agendamento próprio. Qual recurso é o mais indicado?",
        explanation:
            "Uma regra agendada do EventBridge, com cron ou rate, dispara alvos como uma Lambda em horários definidos, sem infraestrutura de agendamento própria. Padroes de evento reagem a eventos, e SQS ou TTL não são agendadores confiaveis.",
        topic: "EventBridge",
        options: [
            [
                "Uma regra do EventBridge baseada em padrão de evento que casa com um evento de relogio publicado pela AWS no barramento padrão a cada hora cheia do dia.",
                false,
            ],
            [
                "Um DynamoDB Streams com TTL configurado para expirar um item exatamente as 2h, acionando a Lambda associada ao stream no momento em que o item e removido da tabela.",
                false,
            ],
            ["Uma fila SQS com delay de 24 horas por mensagem.", false],
            [
                "Uma regra agendada do EventBridge com expressao cron, que dispara a Lambda no horário definido.",
                true,
            ],
        ],
    },
    {
        statement:
            "Varios serviços se inscrevem em um único topico SNS, mas cada assinante só quer receber um subconjunto das mensagens conforme atributos como tipo de pedido, evitando processar o que não lhe interessa. Como fazer isso sem criar um topico por assinante?",
        explanation:
            "A filter policy definida na assinatura faz o SNS avaliar os atributos da mensagem e entregar apenas as que casam, sem lógica extra nem um topico por assinante. Descartar no código ou usar um roteador intermediario desperdica processamento.",
        topic: "SNS",
        options: [
            [
                "Publicar cada mensagem para todos os assinantes e deixar cada um descartar no próprio código as mensagens cujos atributos não correspondem ao que ele deveria processar.",
                false,
            ],
            [
                "Definir uma filter policy em cada assinatura, para o SNS entregar apenas as mensagens cujos atributos casam com o filtro.",
                true,
            ],
            [
                "Criar um assinante intermediario do tipo Lambda que le todas as mensagens do topico e as reencaminha para o assinante certo conforme o valor dos atributos de cada mensagem.",
                false,
            ],
            ["Usar um topico SNS FIFO com message group ID por tipo de pedido.", false],
        ],
    },
    {
        statement:
            "Uma aplicação envia arquivos de vários gigabytes ao S3 em redes instáveis e a equipe quer paralelizar o envio e reenviar apenas a parte que falhar, sem recomecar o upload inteiro. Qual recurso do S3 atende a isso?",
        explanation:
            "O multipart upload divide o objeto em partes que podem ser enviadas em paralelo e reenviadas individualmente quando falham, ideal para arquivos grandes em redes instáveis. Presigned URL, versionamento e Transfer Acceleration não reenviam por parte.",
        topic: "S3",
        options: [
            ["O upload com presigned URL única.", false],
            [
                "O versionamento do bucket, que mantém cada tentativa de envio como uma versão e recompoe o objeto final juntando as partes bem-sucedidas de todas as versões gravadas.",
                false,
            ],
            [
                "O multipart upload, que divide o objeto em partes enviadas em paralelo e permite reenviar apenas as que falharem.",
                true,
            ],
            [
                "A S3 Transfer Acceleration, que roteia o tráfego por edge locations e, por isso, reinicia automaticamente do zero qualquer upload interrompido usando o caminho mais rápido.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa de um cache que também ofereça réplicas para leitura, persistência opcional e estruturas de dados como sorted sets para montar um placar de lideres. Qual motor do ElastiCache atende a esses requisitos?",
        explanation:
            "O Redis oferece réplicas, persistência e estruturas como sorted sets, uteis para placares, recursos que o Memcached, focado em cache simples e multithread, não possui. Os dois motores não são equivalentes em recursos.",
        topic: "ElastiCache",
        options: [
            [
                "Redis, que suporta réplicas, persistência e estruturas de dados avançadas como sorted sets.",
                true,
            ],
            [
                "Memcached, que oferece réplicas de leitura, persistência e sorted sets nativos.",
                false,
            ],
            [
                "Memcached, o único motor do ElastiCache com estruturas de dados ricas e replicação.",
                false,
            ],
            [
                "Qualquer um dos dois, já que Redis e Memcached expõem os mesmos recursos no ElastiCache.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um app mobile precisa buscar, em uma única requisição, dados que vem de uma tabela DynamoDB e de uma função Lambda, deixando o cliente escolher exatamente quais campos quer, além de receber atualizações em tempo real. Qual serviço atende melhor a esse caso?",
        explanation:
            "O AWS AppSync é um serviço gerenciado de GraphQL que resolve múltiplos data sources, como DynamoDB e Lambda, em uma requisição, deixa o cliente escolher os campos e oferece subscriptions em tempo real. API Gateway e SNS não fornecem GraphQL nativo.",
        topic: "AppSync",
        options: [
            [
                "API Gateway com REST API, expondo um endpoint por recurso e deixando o app fazer várias chamadas e juntar no cliente os campos vindos do DynamoDB e da Lambda.",
                false,
            ],
            [
                "Amazon SNS com fanout, entregando ao app as atualizações em tempo real e agregando na própria mensagem os campos do DynamoDB e o resultado da Lambda a cada evento.",
                false,
            ],
            ["API Gateway com WebSocket API.", false],
            [
                "AWS AppSync, um serviço de GraphQL gerenciado que resolve vários data sources em uma requisição e suporta subscriptions em tempo real.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer que a permissão para excluir objetos de um bucket S3 só seja concedida quando o usuário tiver se autenticado com MFA na sessão atual. Como expressar isso em uma policy do IAM?",
        explanation:
            "A chave de condicao aws:MultiFactorAuthPresent avalia se a sessão foi autenticada com MFA; combinada com Effect Allow, ela só libera a acao quando o valor e true. MFA Delete do S3 é um recurso a parte, ligado ao versionamento, e não substitui essa condicao na policy do IAM.",
        topic: "IAM",
        options: [
            [
                "Anexar uma permissions boundary que remova a acao s3:DeleteObject de todos os usuários que não pertencem ao grupo de administradores da conta.",
                false,
            ],
            [
                "Definir a exclusão em uma policy separada e habilitar o versionamento do bucket.",
                false,
            ],
            [
                "Incluir um bloco Condition com a chave aws:MultiFactorAuthPresent igual a true na declaracao que permite s3:DeleteObject.",
                true,
            ],
            [
                "Usar o elemento Principal apontando para o ARN do usuário e ativar a federacao, garantindo que só sessões temporárias do STS consigam apagar objetos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa deixa que os desenvolvedores criem IAM roles para suas aplicações, mas quer garantir que nenhuma role criada por eles ultrapasse um conjunto máximo de permissões, mesmo que a policy anexada conceda mais. Qual recurso atende a isso?",
        explanation:
            "A permissions boundary é uma policy gerenciada que define o máximo de permissões de uma identidade; as permissões efetivas são a interseção entre a boundary e a policy de permissões. SCPs atuam no nível de contas de uma organização, não em uma role individual.",
        topic: "IAM",
        options: [
            [
                "Uma Service Control Policy (SCP) aplicada diretamente a role, que passa a limitar as permissões efetivas daquela role específica dentro da conta.",
                false,
            ],
            [
                "Uma permissions boundary anexada as roles, que define o teto de permissões efetivas independentemente do que a policy de permissões conceda.",
                true,
            ],
            [
                "Uma policy inline com muitas declaracoes Deny cobrindo cada serviço que os desenvolvedores não devem acessar em nenhuma hipotese.",
                false,
            ],
            [
                "Uma role de sessão do STS com DurationSeconds reduzido, forcando a renovacao frequente das credenciais temporárias das aplicações.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma política de conformidade exige que todo upload para um bucket S3 seja recusado caso o objeto não venha com criptografia server-side. Como configurar isso no próprio bucket?",
        explanation:
            "Uma bucket policy é uma policy baseada em recurso; com Effect Deny e uma Condition sobre o header de criptografia, ela recusa qualquer PutObject sem criptografia. A criptografia padrão apenas aplica a cifra automaticamente e não bloqueia uploads.",
        topic: "S3",
        options: [
            ["Habilitar a criptografia padrão do bucket.", false],
            [
                "Anexar uma policy de identidade a cada usuário com um Deny para s3:PutObject, listando manualmente todas as contas que enviam arquivos ao bucket.",
                false,
            ],
            [
                "Criar uma regra de ciclo de vida que criptografa os objetos já existentes e move para outra classe os que estiverem sem criptografia apos 30 dias.",
                false,
            ],
            [
                "Adicionar uma bucket policy que nega s3:PutObject com uma Condition quando o header s3:x-amz-server-side-encryption esta ausente.",
                true,
            ],
        ],
    },
    {
        statement:
            "Ao revisar os tipos de policy do IAM, uma desenvolvedora quer usar policies mantidas e atualizadas pela própria AWS conforme novos recursos surgem, sem ter que edita-las. Qual caracteristica descreve essas policies?",
        explanation:
            "AWS managed policies são criadas e administradas pela AWS, que cuida das atualizações quando novos serviços ou acoes surgem; você as anexa mas não altera seu conteúdo. Customer managed e inline policies são de sua responsabilidade editar.",
        topic: "IAM",
        options: [
            [
                "São AWS managed policies, criadas e mantidas pela AWS, que você anexa a várias identidades mas não pode editar.",
                true,
            ],
            [
                "São customer managed policies, que você escreve e versiona, e que a AWS atualiza automaticamente sempre que um serviço novo e lancado na região.",
                false,
            ],
            [
                "São inline policies, embutidas diretamente em um único usuário, grupo ou role.",
                false,
            ],
            [
                "São permissions boundaries, que a AWS aplica por padrão a toda identidade nova para garantir que ninguem exceda o conjunto de permissões recomendado.",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um Cognito User Pool, uma equipe quer que o app faca login sem enviar a senha do usuário pela rede, provando o conhecimento da senha por um desafio criptografico. Qual fluxo de autenticação usar?",
        explanation:
            "O fluxo USER_SRP_AUTH usa o protocolo Secure Remote Password para autenticar sem enviar a senha pela rede. Fluxos como ADMIN_USER_PASSWORD_AUTH transmitem a senha e exigem proteção adicional do canal.",
        topic: "Cognito",
        options: [
            [
                "O fluxo ADMIN_USER_PASSWORD_AUTH, em que o backend envia usuário e senha para a API admin e o User Pool valida as credenciais diretamente.",
                false,
            ],
            [
                "O fluxo de client credentials do OAuth, próprio para comunicacao máquina a máquina.",
                false,
            ],
            [
                "O fluxo SRP (Secure Remote Password), em que o cliente prova conhecer a senha sem transmiti-la.",
                true,
            ],
            [
                "O fluxo de refresh token, em que o app troca o refresh token guardado por novos tokens de ID e de acesso quando os atuais expiram.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um app protege uma API com Cognito e precisa decidir qual token o cliente deve enviar para autorizar o acesso a endpoints associados a escopos OAuth, e não para identificar quem é o usuário. Qual token cumpre esse papel?",
        explanation:
            "O access token do Cognito carrega os escopos OAuth 2.0 e serve para autorizar o acesso a recursos protegidos. O ID token traz claims de identidade e não é o token indicado para decisões de autorização por escopo.",
        topic: "Cognito",
        options: [
            [
                "O ID token, que carrega as claims de identidade do usuário e é o indicado para autorizar chamadas com base nos escopos configurados no resource server.",
                false,
            ],
            [
                "O access token, que carrega os escopos OAuth 2.0 e é usado para autorizar o acesso aos recursos protegidos.",
                true,
            ],
            ["O refresh token.", false],
            [
                "A chave de API do usuário, gerada pelo User Pool no cadastro e apresentada no header Authorization em vez dos tokens JWT emitidos no login.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um app de noticias quer que visitantes não logados também obtenham credenciais AWS temporárias e limitadas para ler um bucket S3 de manchetes, antes mesmo de qualquer login. Qual recurso do Cognito permite isso?",
        explanation:
            "O Identity Pool pode conceder acesso não autenticado (guest), entregando credenciais temporárias associadas a uma unauthenticated role com permissões restritas. User Pools autenticam usuários e emitem tokens, mas não fornecem credenciais AWS por si sos.",
        topic: "Cognito",
        options: [
            [
                "Um Cognito User Pool com auto-registro habilitado, que cria um usuário anonimo temporário e emite um ID token de convidado a cada visita.",
                false,
            ],
            [
                "Um grupo de convidados dentro do User Pool, mapeado para uma IAM role de leitura, cujos tokens são trocados diretamente nas APIs da AWS.",
                false,
            ],
            [
                "Um fluxo de federacao SAML que autentica o visitante em um provedor externo e devolve credenciais de curta duracao com escopo restrito ao bucket.",
                false,
            ],
            [
                "Um Cognito Identity Pool com acesso não autenticado (guest) habilitado, que entrega credenciais temporárias vinculadas a uma role de convidado.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um administrador com a policy AdministratorAccess no IAM tenta usar uma CMK simetrica para criptografar dados e recebe AccessDenied, mesmo tendo permissões amplas na conta. Qual é a causa mais provavel?",
        explanation:
            "No KMS, a key policy é o controle de acesso primário de cada CMK; sem uma concessao nela (ou sem delegar ao IAM), nem um administrador consegue usar a chave. Permissoes amplas no IAM não bastam se a key policy não as reconhecer.",
        topic: "KMS",
        options: [
            [
                "A key policy da CMK não concede acesso a esse administrador, e toda CMK depende da sua key policy para autorizar o uso.",
                true,
            ],
            ["A CMK esta com a rotação automática de material criptografico desabilitada.", false],
            [
                "A policy AdministratorAccess não inclui a acao kms:Encrypt por padrão, sendo necessário anexar a policy gerenciada específica de KMS ao usuário administrador.",
                false,
            ],
            [
                "O administrador precisa primeiro exportar a chave simetrica em texto claro do KMS para a aplicação e assinar a requisição de Encrypt com esse material.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança precisa definir a própria key policy, controlar o agendamento da rotação e conceder grants sobre a chave usada para criptografar dados de um serviço. Que tipo de chave do KMS atende a esses requisitos?",
        explanation:
            "A customer managed key e criada e administrada por você, permitindo definir a key policy, criar grants e controlar a rotação. AWS managed e AWS owned keys são administradas pela AWS, sem esse nível de controle.",
        topic: "KMS",
        options: [
            [
                "Uma AWS managed key (aws/serviço), pois ela permite editar a key policy e ajustar o intervalo de rotação conforme a necessidade de cada aplicação.",
                false,
            ],
            ["Uma AWS owned key, compartilhada entre contas pela AWS.", false],
            [
                "Uma customer managed key, que permite definir a key policy, criar grants e controlar a rotação.",
                true,
            ],
            [
                "Uma data key gerada por GenerateDataKey, armazenada no KMS com uma key policy dedicada que a equipe usa para controlar o acesso e a rotação da chave.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema guarda dados criptografados por uma CMK antiga e precisa passar a protege-los com uma nova CMK, sem que o texto puro apareca na aplicação durante a troca. Qual operação do KMS faz isso?",
        explanation:
            "A operação ReEncrypt descriptografa o dado com a chave de origem e o recriptografa com a chave de destino inteiramente dentro do KMS, sem expor o texto puro. A rotação automática não recriptografa dados já existentes; ela só passa a usar o novo material em novas operações.",
        topic: "KMS",
        options: [
            [
                "Chamar Decrypt com a chave antiga na aplicação e, em seguida, Encrypt com a nova chave.",
                false,
            ],
            [
                "Chamar ReEncrypt, que descriptografa e recriptografa o dado inteiramente dentro do KMS, sem expor o texto puro.",
                true,
            ],
            [
                "Habilitar a rotação automática da CMK antiga, que recriptografa em segundo plano todos os dados existentes com o novo material criptografico da chave.",
                false,
            ],
            [
                "Criar um grant da chave nova para a chave antiga, o que autoriza o KMS a migrar automaticamente os dados de uma CMK para a outra sem intervencao.",
                false,
            ],
        ],
    },
    {
        statement:
            "Durante a rotação automática de um segredo no Secrets Manager, a função de rotação cria o novo valor e precisa marca-lo antes de promove-lo, para que as aplicações continuem lendo o valor atual até a troca ser concluida. Qual staging label identifica a versão em vigor?",
        explanation:
            "O staging label AWSCURRENT aponta para a versão atual, que o GetSecretValue devolve quando nenhum VersionStage e informado. Durante a rotação, o novo valor recebe AWSPENDING e só vira AWSCURRENT no passo final.",
        topic: "Secrets Manager",
        options: [
            [
                "O label AWSPENDING marca a versão lida por padrão quando GetSecretValue vem sem VersionStage.",
                false,
            ],
            [
                "O label AWSPREVIOUS é aplicado à nova versão durante createSecret e promovido no finishSecret.",
                false,
            ],
            [
                "A rotação não usa labels; ela sobrescreve o valor e mantém só um histórico por VersionId.",
                false,
            ],
            [
                "O label AWSCURRENT identifica a versão atual, retornada por padrão pelo GetSecretValue.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação precisa guardar uma chave de API de terceiro de forma criptografada, sem necessidade de rotação automática, e o time quer a opção de menor custo. Qual serviço atende melhor?",
        explanation:
            "O Parameter Store oferece o tipo SecureString, cifrado por KMS, sem cobrança por parâmetro no standard tier, sendo a opção de menor custo quando a rotação automática não é necessária. O Secrets Manager cobra por segredo e se justifica quando a rotação gerenciada e desejada.",
        topic: "Parameter Store",
        options: [
            [
                "O SSM Parameter Store, com um parâmetro SecureString cifrado por KMS, que armazena o valor sem custo por segredo.",
                true,
            ],
            [
                "O Secrets Manager, que também criptografa com KMS e é a escolha de menor custo por oferecer rotação automática nativa mesmo quando ela não é usada.",
                false,
            ],
            [
                "Uma variável de ambiente criptografada da função Lambda, protegida por uma CMK.",
                false,
            ],
            [
                "O Parameter Store no advanced tier, necessário porque o standard tier não oferece o tipo SecureString nem integração com o KMS para criptografia.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa contrata um SaaS de terceiros que assume uma role na conta dela para coletar métricas. Para evitar o problema do confused deputy, que mecanismo deve ser exigido na hora do AssumeRole?",
        explanation:
            "O ExternalId é um valor combinado entre você e o terceiro e verificado por uma Condition (sts:ExternalId) na trust policy, mitigando o confused deputy. Ele garante que o SaaS só assuma a role em nome do cliente correto.",
        topic: "STS",
        options: [
            [
                "Reduzir o DurationSeconds da sessão ao mínimo, de modo que as credenciais temporárias do terceiro expirem antes que possam ser reutilizadas por outro cliente.",
                false,
            ],
            [
                "Exigir MFA do terceiro em cada AssumeRole, adicionando a condicao aws:MultiFactorAuthPresent na trust policy da role assumida pelo SaaS.",
                false,
            ],
            [
                "Exigir um ExternalId acordado entre as partes, validado por uma Condition na trust policy da role.",
                true,
            ],
            ["Trocar a role por um IAM user dedicado ao terceiro.", false],
        ],
    },
    {
        statement:
            "Uma aplicação assume uma role e recebe credenciais temporárias do STS. O que a equipe precisa considerar sobre a validade dessas credenciais?",
        explanation:
            "As credenciais temporárias do STS tem duracao definida (DurationSeconds, dentro do máximo da role) e param de funcionar ao expirar; a aplicação deve chamar AssumeRole de novo para renova-las. O STS não faz a renovacao automaticamente.",
        topic: "STS",
        options: [
            [
                "As credenciais temporárias valem indefinidamente enquanto a role existir, e só deixam de funcionar se a trust policy for removida ou a role for excluida.",
                false,
            ],
            [
                "As credenciais expiram ao fim da duracao da sessão e, depois disso, a aplicação precisa assumir a role de novo para obter credenciais válidas.",
                true,
            ],
            [
                "O STS renova as credenciais automaticamente em segundo plano antes de expirarem.",
                false,
            ],
            [
                "As credenciais só expiram quando a chave de acesso de longa duracao do IAM user que originou a chamada de AssumeRole for rotacionada manualmente pelo time.",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao enviar uma requisição para uma API da AWS, o SDK anexa uma assinatura calculada com as credenciais do chamador. Qual é o proposito dessa assinatura SigV4?",
        explanation:
            "O SigV4 usa as credenciais para autenticar quem faz a chamada e garante a integridade da requisição, detectando qualquer alteração em transito. A assinatura não substitui o TLS nem expõe a chave secreta na requisição.",
        topic: "SigV4",
        options: [
            [
                "Criptografar o corpo da requisição de ponta a ponta, de modo que nem o serviço da AWS consiga ler o conteúdo sem a chave privada do chamador.",
                false,
            ],
            [
                "Comprimir e assinar o payload para reduzir a latência, substituindo o TLS no transporte entre o SDK e o endpoint regional do serviço.",
                false,
            ],
            [
                "Anexar as credenciais de longa duracao em texto claro no header Authorization.",
                false,
            ],
            [
                "Autenticar o chamador e proteger a integridade da requisição contra alterações em transito.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um serviço precisa chamar um domínio do Amazon OpenSearch protegido por IAM usando um cliente HTTP próprio, sem SDK da AWS. O que a aplicação tem que fazer para as chamadas serem aceitas?",
        explanation:
            "Sem o SDK, que assina automaticamente, a aplicação precisa calcular e anexar a assinatura SigV4 em cada requisição usando suas credenciais. Endpoints protegidos por IAM, como o OpenSearch, recusam chamadas sem assinatura válida.",
        topic: "SigV4",
        options: [
            [
                "Assinar manualmente cada requisição com SigV4, usando as credenciais da aplicação.",
                true,
            ],
            [
                "Enviar as chaves de acesso em headers customizados para o domínio validar contra o IAM.",
                false,
            ],
            [
                "Anexar um API key do console do OpenSearch ao header Authorization, sem assinatura.",
                false,
            ],
            [
                "Abrir o domínio por policy de IP e chamar por HTTP simples, sem assinar as requisições.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação gera uma presigned URL para que um cliente baixe um objeto privado do S3 por tempo limitado. O que determina as permissões e a validade dessa URL?",
        explanation:
            "A presigned URL carrega a assinatura das credenciais de quem a criou, então herda as permissões desse principal, e vale até o tempo de expiracao definido na geracao. Enquanto válida, qualquer um que tenha a URL consegue acessar o objeto, sem precisar de credenciais proprias.",
        topic: "S3",
        options: [
            [
                "A URL usa sempre as permissões da role de execução do S3 e vale por 7 dias fixos, independentemente de quem a gerou ou das credenciais utilizadas.",
                false,
            ],
            [
                "Qualquer pessoa que receba a URL precisa autenticar-se no S3 com as proprias credenciais IAM.",
                false,
            ],
            [
                "A URL herda as permissões de quem a gerou e expira no prazo definido na criação, funcionando até la para quem a tiver.",
                true,
            ],
            [
                "A URL só funciona se o objeto tiver ACL public-read, porque o S3 exige acesso público para servir downloads sem passar pelas credenciais do gerador.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer uma trava que impeca buckets de ficarem públicos por engano, mesmo que alguem aplique uma ACL ou uma bucket policy que conceda acesso público. Qual recurso oferece essa proteção?",
        explanation:
            "O S3 Block Public Access atua como uma trava que se sobrepoe a ACLs e bucket policies, bloqueando o acesso público mesmo que essas configurações o concedam. E aplicavel no nível da conta ou de cada bucket.",
        topic: "S3",
        options: [
            [
                "O IAM Access Analyzer, que reverte automaticamente qualquer bucket policy que conceda acesso público assim que detecta a alteração na conta.",
                false,
            ],
            [
                "O S3 Block Public Access, que sobrepoe ACLs e bucket policies e bloqueia o acesso público mesmo quando elas o concedem.",
                true,
            ],
            ["A criptografia padrão do bucket.", false],
            [
                "Uma SCP na organização que remove a acao s3:PutBucketPolicy de todas as contas, impedindo que qualquer policy pública chegue a ser aplicada a um bucket.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um requisito de segurança determina que objetos de um bucket S3 só podem ser acessados por conexões criptografadas (HTTPS), recusando qualquer chamada por HTTP. Como impor isso no bucket?",
        explanation:
            "Uma bucket policy com Effect Deny condicionado a aws:SecureTransport igual a false recusa qualquer requisição que não use HTTPS. A criptografia padrão protege os dados em repouso e não controla o protocolo de transporte.",
        topic: "S3",
        options: [
            ["Habilitar a criptografia server-side padrão do bucket.", false],
            [
                "Configurar um endpoint de acesso somente-HTTPS no CloudFront e apontar o bucket como origem, o que faz o S3 recusar o tráfego HTTP direto na origem.",
                false,
            ],
            [
                "Ativar o S3 Block Public Access, que além de bloquear acesso público forca todas as requisições restantes a usarem o protocolo HTTPS por padrão.",
                false,
            ],
            [
                "Adicionar uma bucket policy com Deny quando a condicao aws:SecureTransport for false.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma função Lambda só precisa ler itens de uma tabela DynamoDB específica e gravar seus logs. Seguindo o menor privilegio, como deve ser a execution role?",
        explanation:
            "O menor privilegio concede só as acoes necessarias (leitura na tabela específica e escrita de logs), reduzindo o impacto de credenciais comprometidas. Policies amplas como AmazonDynamoDBFullAccess ou dynamodb:* violam esse principio.",
        topic: "Lambda",
        options: [
            [
                "Conceder apenas dynamodb:GetItem e dynamodb:Query na tabela específica, além das permissões de escrita em logs do CloudWatch.",
                true,
            ],
            [
                "Anexar a policy gerenciada AmazonDynamoDBFullAccess, que já cobre a leitura necessária e evita ajustes de permissão caso a função passe a escrever na tabela depois.",
                false,
            ],
            [
                "Reaproveitar uma role administrativa existente, pois a função roda em ambiente isolado e as permissões amplas não representam risco dentro da própria conta.",
                false,
            ],
            ["Conceder dynamodb:* na conta inteira e a policy AWSLambdaBasicExecutionRole.", false],
        ],
    },
    {
        statement:
            "Um template do CloudFormation precisa selecionar o ID da AMI correto conforme a região onde a stack e criada, já que cada região tem um ID de AMI diferente. A equipe quer resolver isso dentro do próprio template, sem passar o ID como parâmetro. Qual recurso do template atende a essa necessidade?",
        explanation:
            "A secao Mappings guarda pares chave-valor fixos, como região para ID de AMI, e Fn::FindInMap resolve o valor certo em tempo de criação usando a pseudo-variável AWS::Region.",
        topic: "CloudFormation",
        options: [
            [
                "Uma secao Mappings com os IDs por região, consultada em runtime por Fn::FindInMap usando AWS::Region como chave.",
                true,
            ],
            [
                "Uma secao Parameters do tipo AWS::EC2::Image::Id que obriga quem cria a stack a digitar manualmente o ID da AMI de cada região antes de cada deploy.",
                false,
            ],
            [
                "Uma secao Outputs que exporta o ID da AMI para que outras stacks importem o valor correto por Fn::ImportValue.",
                false,
            ],
            [
                "Uma Condition que compara a região atual e, para cada uma, cria um recurso EC2 separado com o ID de AMI fixo embutido.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma stack de rede cria uma VPC e exporta o ID de uma subnet. Uma segunda stack, gerenciada por outra equipe e implantada separadamente, precisa criar instâncias nessa subnet referenciando o valor da primeira stack. As stacks não tem relacao de aninhamento. Como a segunda stack obtem o ID da subnet?",
        explanation:
            "Referencias entre stacks independentes usam Output com Export na stack de origem e Fn::ImportValue na stack consumidora; o aninhamento seria uma abordagem diferente, com stacks pai e filhas.",
        topic: "CloudFormation",
        options: [
            [
                "Declarando a primeira stack como um recurso AWS::CloudFormation::Stack aninhado dentro da segunda e lendo a saída pela referência ao recurso aninhado.",
                false,
            ],
            [
                "Usando Fn::GetAtt diretamente sobre o nome lógico do recurso de subnet, já que o CloudFormation resolve referencias entre quaisquer stacks da conta automaticamente.",
                false,
            ],
            [
                "Declarando um Output com Export na primeira stack e consumindo esse nome exportado com Fn::ImportValue na segunda.",
                true,
            ],
            ["Copiando o ID da subnet para um parâmetro da segunda stack a cada deploy.", false],
        ],
    },
    {
        statement:
            "Um template recebe a senha de um banco de dados como parâmetro. O time de segurança exige que esse valor não apareca em texto claro no console, nos eventos nem na descricao da stack. Qual configuração do parâmetro atende a esse requisito?",
        explanation:
            "NoEcho true faz o CloudFormation mascarar o valor do parâmetro como asteriscos no console, nos eventos e nas respostas de API. AllowedPattern e Metadata não ocultam valores, e SecureString é um tipo do Parameter Store.",
        topic: "CloudFormation",
        options: [
            ["Definir o parâmetro com AllowedPattern e MinLength.", false],
            [
                "Definir a propriedade NoEcho como true no parâmetro, mascarando o valor exibido como asteriscos.",
                true,
            ],
            [
                "Colocar o parâmetro na secao Metadata, que o CloudFormation trata como conteúdo interno e nunca exibe.",
                false,
            ],
            [
                "Marcar o parâmetro com o tipo SecureString, fazendo o CloudFormation cifrar e ocultar o valor automaticamente com uma chave do KMS gerenciada pela stack.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma instância EC2 criada por uma stack roda um script de bootstrap demorado que instala e configura a aplicação. A equipe quer que o CloudFormation só considere o recurso como criado com sucesso depois que o script confirmar que a aplicação esta pronta, evitando que a stack conclua antes da hora. Qual abordagem atende a isso?",
        explanation:
            "Um CreationPolicy faz o CloudFormation aguardar um número de sinais de sucesso enviados por cfn-signal antes de marcar o recurso como CREATE_COMPLETE, garantindo que a aplicação esteja realmente pronta.",
        topic: "CloudFormation",
        options: [
            [
                "Adicionar um DependsOn na instância apontando para ela mesma, forcando o CloudFormation a esperar o termino do bootstrap.",
                false,
            ],
            [
                "Aumentar o timeout global da stack nas configurações do console, o que faz o CloudFormation reavaliar o estado da aplicação periodicamente.",
                false,
            ],
            [
                "Definir uma DeletionPolicy de Retain na instância para que, em caso de falha do bootstrap, o CloudFormation preserve o recurso e continue tentando executar o script até obter sucesso.",
                false,
            ],
            [
                "Adicionar um CreationPolicy a instância e chamar cfn-signal ao final do script, sinalizando sucesso; o recurso só fica CREATE_COMPLETE apos o sinal.",
                true,
            ],
        ],
    },
    {
        statement:
            "Em um template do AWS SAM, a equipe quer que cada atualização de uma função Lambda desloque o tráfego gradualmente, enviando 10% para a nova versão por 5 minutos e revertendo automaticamente se um alarme do CloudWatch disparar. Que combinacao de propriedades no AWS::Serverless::Function habilita isso?",
        explanation:
            "No SAM, AutoPublishAlias cria e aponta um alias para cada nova versão, e DeploymentPreference define a estratégia de shift (Canary/Linear), integrando com CodeDeploy e alarmes para rollback automático.",
        topic: "SAM",
        options: [
            [
                "AutoPublishAlias e um DeploymentPreference com o Type Canary10Percent5Minutes e Alarms.",
                true,
            ],
            [
                "ProvisionedConcurrencyConfig com RollbackConfiguration monitorando alarmes para desfazer a publicação.",
                false,
            ],
            [
                "Um evento Schedule que reavalia as métricas a cada 5 minutos e ajusta os pesos do alias manualmente.",
                false,
            ],
            [
                "VersionDescription e AutoPublishCodeSha256, deixando o SAM aplicar o canary padrão.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um template do SAM declara várias funções Lambda que compartilham o mesmo Runtime, Timeout e um conjunto de variáveis de ambiente. Para não repetir essas configurações em cada função, onde a equipe pode declara-las uma única vez e deixa-las valerem para todas as funções?",
        explanation:
            "A secao Globals do SAM define propriedades padrão herdadas por todos os recursos de um tipo suportado (Function, Api, HttpApi, SimpleTable), evitando repeticao; cada recurso ainda pode sobrescrever um valor.",
        topic: "SAM",
        options: [
            [
                "Na secao Mappings, criando uma chave por função e aplicando os valores com Fn::FindInMap em cada recurso.",
                false,
            ],
            [
                "Na secao Outputs, exportando os valores para que cada AWS::Serverless::Function os importe automaticamente durante o build.",
                false,
            ],
            [
                "Na secao Globals, que aplica propriedades padrão a todos os recursos de um tipo suportado, como funções.",
                true,
            ],
            [
                "Em um arquivo samconfig.toml separado, que o SAM CLI le durante o sam deploy e injeta as mesmas propriedades em cada função antes de gerar o template do CloudFormation equivalente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação em conteiner roda em um serviço do Amazon ECS e a equipe faz deploy blue/green pelo CodeDeploy. Ela quer subir a nova versão da task em paralelo, validá-la por um listener de teste e só então direcionar o tráfego de produção. Como o CodeDeploy conduz esse deploy no ECS?",
        explanation:
            "No blue/green do CodeDeploy com ECS, um novo conjunto de tasks sobe em um segundo target group; o tráfego de produção e deslocado no listener do balanceador do target group original para o novo, permitindo validacao via listener de teste e rollback rápido.",
        topic: "CodeDeploy",
        options: [
            [
                "Ele atualiza a task definition no mesmo target group e reinicia as tasks uma a uma, mantendo um único listener durante toda a troca.",
                false,
            ],
            [
                "Ele provisiona um novo replacement set de tasks em um segundo target group e desloca o tráfego do listener de produção do target group antigo para o novo.",
                true,
            ],
            [
                "Ele cria um cluster ECS totalmente separado com a nova versão, aguarda a drenagem completa das conexões do cluster antigo e depois atualiza o registro DNS no Route 53 para apontar os usuários ao novo cluster.",
                false,
            ],
            [
                "Ele pública a nova task como uma revisao e usa pesos de roteamento no próprio serviço ECS, sem envolver listeners nem target groups do balanceador.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um CodePipeline implanta automaticamente em homologacao, mas a equipe exige que uma pessoa autorize explicitamente a promocao para produção antes que o estagio de deploy em prod execute. Como adicionar essa pausa para autorização humana no pipeline?",
        explanation:
            "Uma acao de aprovacao manual (Manual approval) pausa o pipeline e aguarda um usuário com permissão aprovar ou rejeitar, opcionalmente notificando via SNS; só apos a aprovacao o pipeline avanca.",
        topic: "CodePipeline",
        options: [
            [
                "Configurar um webhook no estagio de produção que bloqueia a transicao até receber uma chamada externa de aprovacao de um sistema de terceiros.",
                false,
            ],
            [
                "Habilitar o modo de execução SUPERSEDED no pipeline, que retem cada execução até um administrador confirmar pelo console.",
                false,
            ],
            [
                "Inserir um estagio de build adicional que roda testes de aceitacao e, se todos passarem, marca o artefato como aprovado e libera automaticamente o estagio seguinte sem intervencao de ninguem.",
                false,
            ],
            [
                "Adicionar uma acao do tipo Manual approval antes do estagio de produção; o pipeline pausa até alguem aprovar ou rejeitar.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma task do ECS no Fargate falha ao iniciar porque não consegue baixar a imagem do Amazon ECR nem ler um segredo do Secrets Manager referenciado na task definition. Ja o código da aplicação, quando roda, precisa gravar objetos em um bucket S3. Como distribuir corretamente essas permissões?",
        explanation:
            "O task execution role é usado pelo agente do ECS para puxar a imagem do ECR, buscar segredos e enviar logs; o task role concede permissões ao código da aplicação em runtime, como gravar no S3. No Fargate não ha instance role do host.",
        topic: "ECS",
        options: [
            [
                "Dar ao task execution role o acesso ao ECR e ao Secrets Manager, e ao task role a permissão de escrita no S3.",
                true,
            ],
            [
                "Dar ao task role o acesso ao ECR e ao Secrets Manager, e ao task execution role a permissão de escrita no S3.",
                false,
            ],
            [
                "Colocar todas as permissões (ECR, Secrets Manager e S3) na instance role da EC2 do cluster, já que no Fargate as tasks herdam as permissões do host onde são agendadas.",
                false,
            ],
            [
                "Anexar ECR e Secrets Manager ao execution role e também mover a escrita no S3 para ele, deixando o task role sem nenhuma permissão.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um repositório do Amazon ECR acumula muitas imagens antigas e sem tag a cada build, e o custo de armazenamento cresce. A equipe quer remover automaticamente as imagens obsoletas segundo regras de idade ou quantidade, sem rodar scripts manuais. Qual recurso do ECR faz isso?",
        explanation:
            "A lifecycle policy do ECR remove imagens automaticamente conforme regras baseadas em idade ou em contagem (e em tag ou sem tag), reduzindo o armazenamento sem automacao externa. Image scanning e imutabilidade de tags servem a outros propositos.",
        topic: "ECR",
        options: [
            [
                "Habilitar image scanning on push, que identifica imagens vulneraveis e as expira do repositório apos o relatório de findings.",
                false,
            ],
            ["Ativar a imutabilidade de tags no repositório.", false],
            [
                "Configurar uma lifecycle policy no repositório com regras que expiram imagens por idade ou por contagem.",
                true,
            ],
            [
                "Criar uma regra no EventBridge que dispara diariamente uma função Lambda encarregada de listar todas as imagens do repositório, ordena-las e chamar a API de exclusão para as que excederem o limite definido.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe roda a aplicação no Elastic Beanstalk e quer fazer blue/green: subir a nova versão em um ambiente separado, testa-la com sua própria URL e, quando aprovada, direcionar o tráfego de produção para ela quase sem downtime, podendo reverter rápido. Qual recurso do Beanstalk faz essa troca?",
        explanation:
            "O Swap Environment URLs troca os CNAMEs de dois ambientes do Beanstalk, movendo o tráfego de produção para o ambiente novo quase sem downtime e permitindo reverter ao trocar de novo. As políticas Immutable e Rolling atuam dentro de um único ambiente.",
        topic: "Elastic Beanstalk",
        options: [
            [
                "A política de deploy Immutable, que substitui as instâncias do ambiente de produção por novas já com a versão nova validada.",
                false,
            ],
            [
                "O Swap Environment URLs, que troca os CNAMEs dos dois ambientes, redirecionando o tráfego para o novo.",
                true,
            ],
            [
                "A política de deploy Rolling with additional batch, que adiciona um lote extra de instâncias com a nova versão antes de remover as antigas.",
                false,
            ],
            ["O recurso de Saved Configurations.", false],
        ],
    },
    {
        statement:
            "Ao instrumentar uma aplicação com o X-Ray, um desenvolvedor adiciona o customerId em cada segmento e depois quer filtrar e agrupar traces por esse valor diretamente na console do X-Ray. Como ele deve registrar o customerId para conseguir filtrar por ele?",
        explanation:
            "Annotations são pares chave-valor indexados pelo X-Ray e podem ser usados em filter expressions para buscar e agrupar traces; metadata guarda dados não indexados, apenas para contexto adicional, sem suporte a filtro.",
        topic: "X-Ray",
        options: [
            [
                "Como metadata, pois campos de metadata são indexados pelo X-Ray e ficam disponíveis para filtro por expressao de busca.",
                false,
            ],
            [
                "Como um subsegmento nomeado com o valor do customerId, já que o X-Ray cria automaticamente um índice a partir dos nomes de subsegmentos para permitir consultas por qualquer um deles no service map.",
                false,
            ],
            ["Em qualquer um dos dois, annotation ou metadata.", false],
            [
                "Como annotation, pois annotations são indexadas e podem ser usadas em filter expressions.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer ver traces de uma função Lambda no X-Ray, incluindo o tempo gasto nas chamadas que ela faz ao DynamoDB. O que é necessário para que a função apareca no service map e as chamadas downstream sejam detalhadas?",
        explanation:
            "Ativar o Active tracing na configuração da função faz o Lambda emitir segmentos e gerenciar o daemon do X-Ray; instrumentar o SDK adiciona subsegmentos para chamadas downstream como o DynamoDB. Memoria e sampling isoladamente não habilitam o tracing.",
        topic: "X-Ray",
        options: [
            [
                "Habilitar o Active tracing na função e instrumentar o cliente AWS com o X-Ray SDK para gerar os subsegmentos downstream.",
                true,
            ],
            [
                "Apenas aumentar a memória da função, pois o X-Ray só captura traces de funções acima de um limite mínimo de memória alocada.",
                false,
            ],
            [
                "Instalar e rodar o daemon do X-Ray como um processo dentro do pacote de implantacao da função, já que no Lambda e responsabilidade do desenvolvedor manter o daemon ativo para receber e encaminhar os segmentos.",
                false,
            ],
            ["Configurar uma sampling rule com taxa de 100% no console do X-Ray.", false],
        ],
    },
    {
        statement:
            "Depois de um incidente, a equipe precisa vasculhar interativamente os logs de um grupo do CloudWatch Logs para contar quantas requisições tiveram latência acima de 1 segundo e agrupa-las por endpoint, sem exportar os dados para outro serviço. Qual recurso faz essa análise ad hoc sobre os logs?",
        explanation:
            "O CloudWatch Logs Insights consulta interativamente grupos de logs com uma linguagem própria (filter, stats, sort), ideal para agregacoes ad hoc como contar e agrupar por campo. Metric filters geram métricas continuas, não consultas exploratorias.",
        topic: "CloudWatch Logs",
        options: [
            [
                "Um metric filter aplicado ao grupo de logs, que retorna a lista de eventos correspondentes já agrupados por endpoint em uma tabela interativa.",
                false,
            ],
            [
                "Uma subscription filter que envia continuamente os eventos para uma função Lambda.",
                false,
            ],
            [
                "O CloudWatch Logs Insights, com uma query que filtra por latência e usa stats count por endpoint.",
                true,
            ],
            [
                "O Log group export para o S3, seguido de uma consulta com o Amazon Athena sobre os arquivos exportados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação já grava linhas contendo a palavra ERROR no CloudWatch Logs quando algo falha. A equipe quer disparar um alarme quando o número dessas linhas ultrapassar um limite em 5 minutos, sem alterar o código da aplicação para publicar métricas. Como transformar essas ocorrencias de log em algo alarmavel?",
        explanation:
            "Um metric filter varre os eventos do grupo de logs, conta os que casam com o padrão (ERROR) e pública o resultado como uma métrica do CloudWatch, sobre a qual se cria o alarme, tudo sem tocar no código. O EMF exigiria instrumentar a aplicação.",
        topic: "CloudWatch",
        options: [
            [
                "Ativar o Contributor Insights no grupo de logs para que ele gere automaticamente uma métrica de contagem de erros e vincule um alarme a essa métrica assim que o padrão ERROR for detectado pela primeira vez.",
                false,
            ],
            [
                "Criar um metric filter no grupo de logs que conta as linhas com ERROR e pública uma métrica, e então criar um alarme sobre ela.",
                true,
            ],
            [
                "Instrumentar a aplicação com o Embedded Metric Format para emitir a contagem de erros como métrica estruturada a cada linha de log.",
                false,
            ],
            ["Habilitar a alta resolução no grupo de logs.", false],
        ],
    },
    {
        statement:
            "Uma função Lambda que faz processamento intensivo de CPU está lenta e a equipe cogita reduzir custo, mas as execuções demoram muito. Sabe-se que a função está limitada por CPU, não por I/O. Qual ajuste tende a reduzir a duracao e pode até diminuir o custo total?",
        explanation:
            "No Lambda, a CPU (e a rede) e alocada proporcionalmente a memória configurada; para cargas limitadas por CPU, aumentar a memória reduz a duracao e, como a cobrança e por GB-segundo, uma execução bem mais rápida pode sair mais barata. Provisioned concurrency reduz cold start, não a duracao do processamento.",
        topic: "Lambda - otimizacao",
        options: [
            [
                "Reduzir a memória alocada ao mínimo, já que menos memória libera mais ciclos de CPU para o processamento na Lambda.",
                false,
            ],
            ["Manter a memória baixa e habilitar concorrencia provisionada.", false],
            [
                "Aumentar a memória alocada, porque a Lambda escala a CPU proporcionalmente a memória, reduzindo a duracao.",
                true,
            ],
            [
                "Dividir a função em duas e encadea-las de forma assíncrona, o que soma a capacidade de CPU das duas alocacoes durante o processamento.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma função Lambda abre uma nova conexão com o banco de dados no início do handler a cada invocação, e o tempo de execução aumenta sob carga. A equipe quer aproveitar a reutilizacao do ambiente de execução para reduzir esse custo por invocação. Qual mudanca no código consegue isso?",
        explanation:
            "Codigo no escopo de inicializacao (fora do handler) roda uma vez por ambiente de execução e e reaproveitado enquanto o ambiente permanece quente; declarar a conexão ali evita recria-la a cada invocação. Variaveis de ambiente guardam strings, não conexões abertas.",
        topic: "Lambda - otimizacao",
        options: [
            ["Mover a abertura da conexão para dentro de um bloco try no final do handler.", false],
            [
                "Aumentar o timeout da função e envolver a criação da conexão em um laco de retry, de modo que cada invocação tente reaproveitar a conexão da invocação anterior consultando uma variável salva no serviço de configuração.",
                false,
            ],
            [
                "Configurar a conexão como uma variável de ambiente da função, pois variáveis de ambiente persistem entre invocações e mantém o socket aberto.",
                false,
            ],
            [
                "Criar a conexão fora do handler, no escopo de inicializacao, para reaproveita-la enquanto o ambiente de execução estiver quente.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma tabela DynamoDB sofre throttling concentrado em poucas particoes, enquanto a capacidade total provisionada parece suficiente. A investigação mostra que a partition key é um campo de baixa cardinalidade, com poucos valores muito acessados. Qual mudanca de modelagem melhor distribui a carga?",
        explanation:
            "O throttling por hot partition vem de uma partition key com poucos valores muito acessados; escolher uma chave de alta cardinalidade (ou adicionar sufixo com write sharding) distribui as requisições por mais particoes. Aumentar a capacidade total não resolve a concentracao em uma particao.",
        topic: "DynamoDB - performance",
        options: [
            [
                "Escolher uma partition key de alta cardinalidade, que espalhe as requisições por muitas particoes.",
                true,
            ],
            [
                "Manter a mesma partition key, mas aumentar bastante a capacidade provisionada de leitura e escrita da tabela inteira, já que o throttling desaparece quando a soma das RCUs e WCUs supera o pico agregado de todas as particoes juntas.",
                false,
            ],
            [
                "Trocar a partition key pela sort key atual e promover o campo de baixa cardinalidade a sort key, invertendo os papeis das duas chaves.",
                false,
            ],
            ["Adicionar um Local Secondary Index sobre o campo de baixa cardinalidade.", false],
        ],
    },
    {
        statement:
            "Sob picos de tráfego, uma aplicação recebe ocasionalmente ProvisionedThroughputExceededException do DynamoDB. A equipe quer tratar esses picos transitorios sem sobrecarregar ainda mais a tabela com novas tentativas. Qual é a abordagem recomendada?",
        explanation:
            "Requisições limitadas (throttled) devem ser reenviadas com exponential backoff e jitter para espacar as tentativas; os SDKs da AWS já fazem retries automáticos com backoff. Reenviar em laco apertado piora a sobrecarga.",
        topic: "DynamoDB - performance",
        options: [
            ["Repetir a operação imediatamente em um laco apertado até obter sucesso.", false],
            [
                "Capturar a exceção e ignora-la silenciosamente, seguindo o fluxo como se a operação tivesse tido sucesso, já que o DynamoDB persiste a escrita internamente e apenas atrasa a confirmação para o cliente sob carga.",
                false,
            ],
            [
                "Reexecutar com exponential backoff e jitter; o SDK já aplica retries automáticos assim por padrão.",
                true,
            ],
            [
                "Trocar todas as leituras para fortemente consistentes, o que faz o DynamoDB priorizar essas requisições e deixar de recusa-las por throttling.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe usa o ElastiCache na frente de um banco e quer que o cache seja populado somente quando um dado e solicitado e não esta presente, buscando no banco e gravando no cache nesse momento. Que estratégia descreve esse comportamento, e qual e sua principal desvantagem?",
        explanation:
            "No lazy loading (cache-aside), o cache só e preenchido quando ocorre um miss, carregando o dado do banco naquele momento; a desvantagem e que dados alterados no banco podem ficar defasados no cache até expirarem. O write-through atualiza o cache a cada escrita.",
        topic: "Estrategias de cache",
        options: [
            ["Write-through: o cache e atualizado a cada escrita no banco.", false],
            [
                "Lazy loading: o cache e preenchido no cache miss; a desvantagem e servir dado potencialmente desatualizado até expirar.",
                true,
            ],
            [
                "Write-behind: as escritas vao primeiro ao cache e são persistidas no banco depois; a desvantagem é a perda de dados se o nó do cache falhar antes da gravacao.",
                false,
            ],
            [
                "TTL absoluto: cada item nasce com um tempo de vida fixo; a desvantagem e que itens muito acessados são descartados no vencimento mesmo ainda sendo uteis.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um serviço que a aplicação chama retorna, de forma intermitente, respostas HTTP 500 e 503, e em outras ocasioes um 400 consistente para a mesma requisição malformada. Como a aplicação deve tratar cada classe de resposta?",
        explanation:
            "Respostas 5xx apontam problemas no servidor, normalmente transitorios, e são candidatas a retry com exponential backoff; já um 4xx como 400 indica erro do cliente (requisição malformada) que se repetira igual até a requisição ser corrigida.",
        topic: "Erros 4xx vs 5xx",
        options: [
            [
                "Os 5xx indicam falha do lado do servidor, em geral transitória, e devem ser repetidos com exponential backoff; o 400 é erro do cliente e não deve ser repetido sem corrigir a requisição.",
                true,
            ],
            [
                "Tanto os 5xx quanto o 400 devem ser repetidos imediatamente o mesmo número de vezes, pois qualquer erro HTTP tende a se resolver sozinho em uma nova tentativa.",
                false,
            ],
            [
                "Os 5xx são erros do cliente e não devem ser repetidos, enquanto o 400 vem do servidor e deve ser reenviado várias vezes com backoff crescente até que a infraestrutura do serviço se recupere e passe a aceitar a requisição.",
                false,
            ],
            [
                "Nenhuma das duas classes deve ser repetida pela aplicação; convem apenas registrar o erro e devolver a falha ao usuário, deixando o balanceador de carga refazer a chamada.",
                false,
            ],
        ],
    },
];
