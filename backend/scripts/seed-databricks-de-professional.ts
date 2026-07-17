// Seed do simulado Databricks Certified Data Engineer Professional (databricks-de-professional). Idempotente: se ja tiver questoes, nao faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-databricks-de-professional.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-databricks-de-professional.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "databricks-de-professional";

type Questao = { statement: string; explanation: string; topic: string; options: [string, boolean][] };

const QUESTOES: Questao[] = [
    {
        statement:
            "A equipe avalia duas tabelas Delta com colunas de altíssima cardinalidade entre os filtros mais frequentes. A tabela A é particionada por device_id, o que gerou um número enorme de diretórios, muitos com poucos arquivos pequenos cada. A tabela B não é particionada, mas roda OPTIMIZE com ZORDER BY (customer_id) periodicamente, e a eficiência dessa reorganização cai visivelmente entre uma execução e a próxima, à medida que novos dados são anexados. Quais DUAS afirmações justificam migrar ambas as tabelas para Liquid Clustering, usando CLUSTER BY na respectiva coluna de alta cardinalidade? (Selecione DUAS opções.)",
        explanation:
            "Liquid Clustering reorganiza os dados por afinidade de chave de forma incremental: a cada escrita, para volumes menores, ou a cada OPTIMIZE, para acúmulos maiores, apenas os dados novos ou fora de lugar precisam ser reclusterizados, o que evita o custo crescente do ZORDER, que reescreve arquivos existentes a cada execução para manter a colocação das chaves. Além disso, por não depender de um diretório físico por valor de partição, Liquid Clustering suporta colunas de alta cardinalidade como chave de organização sem o efeito colateral clássico do particionamento tradicional: excesso de partições pequenas e sobrecarga de metadados no log de transações. As chaves de clustering continuam exigindo estatísticas de data skipping para a poda de arquivos, não as dispensam, uma tabela não pode combinar CLUSTER BY com ZORDER BY ou com particionamento (são estratégias mutuamente exclusivas), e VACUUM continua necessário para remover fisicamente, após o período de retenção, os arquivos que a reclusterização deixou de referenciar.",
        topic: "Liquid Clustering",
        options: [
            ["Liquid Clustering reclusteriza os dados de forma incremental a cada escrita ou OPTIMIZE, sem precisar reescrever o histórico inteiro a cada execução, ao contrário do ZORDER.", true],
            ["Liquid Clustering dispensa a coleta de estatísticas de data skipping, usando apenas metadados internos de clustering para podar arquivos nas consultas.", false],
            ["Liquid Clustering organiza os dados por afinidade de chave sem exigir um diretório físico por valor distinto, evitando o excesso de partições pequenas típico de colunas de alta cardinalidade.", true],
            ["Liquid Clustering pode ser combinado livremente com ZORDER BY na mesma tabela, aplicando as duas estratégias de organização física a cada execução de OPTIMIZE.", false],
            ["Liquid Clustering elimina a necessidade de VACUUM na tabela, pois os arquivos antigos substituídos durante a reclusterização são removidos automaticamente do armazenamento.", false],
        ],
    },
    {
        statement:
            "Uma tabela Delta grande recebe operações frequentes de MERGE que alteram menos de 1% das linhas por execução, e a equipe precisa, periodicamente, comprovar a remoção física e definitiva de registros associados a solicitações de exclusão de dados pessoais. A tabela tem deletion vectors habilitados. Quais DUAS afirmações sobre deletion vectors estão corretas nesse contexto? (Selecione DUAS opções.)",
        explanation:
            "Deletion vectors implementam merge-on-read: DELETE, UPDATE e MERGE passam a marcar linhas como inválidas em um arquivo auxiliar leve em vez de reescrever o arquivo Parquet inteiro, o que acelera muito operações que tocam uma fração pequena das linhas. Essa marcação, porém, é lógica: as linhas continuam fisicamente presentes no arquivo original até que REORG TABLE ... APPLY (PURGE) reescreva os arquivos afetados sem os registros invalidados, e só depois disso o VACUUM remove do armazenamento os arquivos antigos que deixaram de ser referenciados. Rodar apenas VACUUM, sem o REORG PURGE antes, não elimina fisicamente os dados marcados, o que é crítico para atender uma exigência de exclusão definitiva. Deletion vectors e Change Data Feed são propriedades independentes da tabela, e a compactação de arquivos pequenos continua sendo responsabilidade do OPTIMIZE, manual, agendado ou via predictive optimization, não dos deletion vectors.",
        topic: "Deletion Vectors",
        options: [
            ["Deletion vectors substituem o OPTIMIZE como estratégia de compactação, unindo automaticamente arquivos pequenos a cada escrita realizada na tabela.", false],
            ["O MERGE marca as linhas afetadas como inválidas em um arquivo auxiliar associado ao arquivo Parquet original, evitando reescrever integralmente arquivos grandes para alterar poucas linhas.", true],
            ["Deletion vectors dispensam a execução de VACUUM, pois os arquivos Parquet substituídos são removidos automaticamente do armazenamento assim que o MERGE é confirmado.", false],
            ["Para remover fisicamente as linhas marcadas pelos deletion vectors, é preciso rodar REORG TABLE ... APPLY (PURGE) antes de um VACUUM, que só então elimina os arquivos antigos do armazenamento.", true],
            ["Deletion vectors são ativados automaticamente em qualquer tabela no momento em que o Change Data Feed é habilitado, pois ambos compartilham a mesma propriedade da tabela.", false],
        ],
    },
    {
        statement:
            "Um time de dados mantém dezenas de jobs agendados só para rodar OPTIMIZE, VACUUM e coleta de estatísticas em centenas de tabelas gerenciadas do Unity Catalog, com uma frequência fixa definida manualmente para cada tabela. Além do esforço operacional, tabelas pouco alteradas são otimizadas sem necessidade, e tabelas muito alteradas ficam com arquivos pequenos entre uma execução e outra. Qual mudança resolve diretamente esses dois problemas?",
        explanation:
            "Predictive optimization é um recurso do Unity Catalog que assume a decisão de quando rodar OPTIMIZE, incluindo a manutenção de Liquid Clustering, VACUUM e ANALYZE em tabelas gerenciadas, executando essas operações em compute serverless administrado pela própria Databricks. A frequência não é fixa: o serviço avalia o padrão de leitura e escrita de cada tabela para equilibrar o benefício esperado contra o custo de compute, evitando tanto otimizar tabelas paradas quanto deixar tabelas muito alteradas com excesso de arquivos pequenos entre execuções. Optimized writes e auto compaction reduzem o problema de arquivos pequenos no momento da escrita, mas não cobrem VACUUM nem a coleta de estatísticas do ANALYZE, e Liquid Clustering troca a estratégia de organização física dos dados, mas não elimina a necessidade de VACUUM nem de ANALYZE.",
        topic: "Predictive Optimization",
        options: [
            ["Habilitar predictive optimization nas tabelas, deixando o Databricks decidir quando rodar OPTIMIZE, VACUUM e ANALYZE em compute serverless, conforme o uso real.", true],
            ["Consolidar todos os jobs em um único pipeline com Lakeflow Jobs, mantendo a mesma frequência fixa, mas centralizando o agendamento e o monitoramento em um só lugar.", false],
            ["Habilitar optimized writes e auto compaction em todas as tabelas, eliminando por completo a necessidade de qualquer execução agendada de OPTIMIZE.", false],
            ["Migrar as tabelas para Liquid Clustering, que dispensa VACUUM e ANALYZE por manter as estatísticas de partição sempre atualizadas automaticamente.", false],
        ],
    },
    {
        statement:
            "Um pipeline de Structured Streaming grava micro-lotes a cada poucos segundos em uma tabela Delta, e cada micro-lote produz vários arquivos pequenos por executor. Depois de algumas semanas, a tabela acumula um número muito grande de arquivos pequenos, o que aumenta o tempo de listagem e de planejamento das consultas downstream. A equipe quer reduzir esse acúmulo continuamente, sem depender apenas de uma execução manual de OPTIMIZE uma vez por dia. Qual configuração ataca o problema no próprio momento da escrita?",
        explanation:
            "As propriedades delta.autoOptimize.optimizeWrite e delta.autoOptimize.autoCompact atacam o problema de arquivos pequenos no momento da escrita: optimized writes usa um shuffle adicional para produzir arquivos de tamanho mais adequado antes de gravá-los, e auto compaction roda uma compactação rápida e seletiva logo após cada commit, unindo arquivos pequenos dentro das partições afetadas sem exigir um OPTIMIZE completo. Reduzir o trigger interval só aumenta a frequência de escrita, e o número de arquivos pequenos junto com ela, aumentar spark.sql.shuffle.partitions eleva o paralelismo mas não junta arquivos pequenos já existentes, e deletion vectors resolvem reescrita em DELETE, UPDATE e MERGE, não a fragmentação gerada por escritas incrementais de streaming.",
        topic: "OPTIMIZE e Compactação",
        options: [
            ["Reduzir o intervalo do trigger do Structured Streaming para gravar micro-lotes ainda mais frequentes, diluindo o volume de dados por arquivo gerado.", false],
            ["Habilitar optimized writes e auto compaction na tabela, para a escrita gerar arquivos maiores e uma compactação leve rodar logo após cada commit de escrita.", true],
            ["Aumentar o valor de spark.sql.shuffle.partitions no job de streaming, elevando o paralelismo de gravação em cada micro-lote.", false],
            ["Ativar deletion vectors na tabela, para que os micro-lotes gravados passem a ser mesclados automaticamente aos arquivos existentes em vez de criar arquivos novos.", false],
        ],
    },
    {
        statement:
            "Uma tabela Delta muito larga, com mais de 300 colunas, sofre lentidão perceptível em cada escrita. A equipe descobre que boa parte do tempo é gasto coletando estatísticas de min/max para dezenas de colunas que nunca aparecem em cláusulas WHERE das consultas, enquanto as poucas colunas realmente usadas como filtro estão entre as dez primeiras do schema. Qual ajuste reduz o custo de escrita sem comprometer a poda de arquivos (data skipping) nas consultas existentes?",
        explanation:
            "O Delta Lake coleta estatísticas de min/max, contagem de nulos e contagem de linhas para as primeiras colunas do schema, até o limite definido por delta.dataSkippingNumIndexedCols (32 por padrão), e usa esses valores para pular arquivos inteiros no planejamento de uma consulta sem precisar lê-los. Em uma tabela muito larga, coletar estatísticas para colunas que nunca são filtradas só adiciona custo de escrita sem benefício de poda, então reduzir esse limite para cobrir apenas as colunas de schema realmente usadas em filtros, que já estão entre as primeiras no cenário descrito, preserva o data skipping onde importa e corta o custo nas demais. Remover as estatísticas por completo eliminaria a poda também para as colunas de filtro, aumentar o limite só pioraria a lentidão na escrita, e Liquid Clustering organiza fisicamente os arquivos por afinidade de chave, mas continua dependendo de estatísticas de data skipping para a poda, não a substitui.",
        topic: "Data Skipping",
        options: [
            ["Remover completamente as estatísticas de data skipping da tabela, deixando toda a poda de arquivos a cargo do particionamento físico.", false],
            ["Aumentar o delta.dataSkippingNumIndexedCols para o máximo permitido, garantindo que todas as 300 colunas recebam estatísticas atualizadas a cada escrita.", false],
            ["Reduzir o delta.dataSkippingNumIndexedCols para cobrir apenas as colunas usadas em filtros, coletadas a partir das primeiras colunas do schema.", true],
            ["Habilitar Liquid Clustering em todas as colunas usadas como filtro, o que substitui automaticamente a necessidade de estatísticas de data skipping.", false],
        ],
    },
    {
        statement:
            "Um time de BI roda, repetidamente, as mesmas consultas ad hoc sobre a mesma fatia recente de uma tabela Delta, em um cluster interativo com tipos de instância com SSD local elegíveis para cache. Sem qualquer alteração no código das consultas, as execuções seguintes ficam sensivelmente mais rápidas que a primeira, mesmo em consultas escritas por analistas diferentes. Qual mecanismo explica essa aceleração automática?",
        explanation:
            "O disk cache, antigo Delta cache, copia automaticamente para o SSD local dos workers os blocos de arquivos remotos, Parquet ou Delta, lidos durante uma consulta, em tipos de instância com armazenamento local elegíveis para cache. Leituras seguintes dos mesmos dados, mesmo vindas de consultas ou usuários diferentes, são atendidas a partir dessa cópia local, sem passar de novo pelo armazenamento remoto, e isso acontece de forma transparente, sem exigir .cache() explícito. O cache de resultados do warehouse só reaproveita o resultado final de uma consulta idêntica, o Spark não aplica .cache() automaticamente aos DataFrames lidos de uma tabela, e o Photon acelera a execução vetorizada das operações, mas não é responsável por manter cópias locais dos arquivos lidos.",
        topic: "Disk Cache",
        options: [
            ["O resultado de cada consulta é armazenado no cache de resultados do warehouse e reaproveitado sempre que o texto SQL enviado for idêntico.", false],
            ["O Spark aplica .cache() automaticamente a qualquer DataFrame lido de uma tabela Delta, persistindo os dados deserializados na memória do cluster.", false],
            ["O Photon reescreve o plano de execução das consultas seguintes para eliminar estágios de shuffle repetidos entre analistas diferentes.", false],
            ["O disk cache copia para o SSD local dos workers os arquivos remotos lidos na primeira consulta, e as leituras seguintes usam essa cópia local.", true],
        ],
    },
    {
        statement:
            "Um engenheiro desabilitou explicitamente o Adaptive Query Execution, definindo spark.sql.adaptive.enabled como false em um job, por um motivo que não tem relação com joins. Depois dessa mudança, um join entre duas tabelas grandes, que antes terminava em poucos minutos, passou a ter uma única tarefa do estágio de shuffle demorando muito mais que as demais, porque uma chave de join concentra uma fração desproporcional das linhas de ambos os lados. Qual ação resolve esse problema de forma mais direta?",
        explanation:
            "A divisão automática de partições enviesadas é um sub-recurso da Adaptive Query Execution, controlado por spark.sql.adaptive.skewJoin.enabled e ligado por padrão, mas ele só atua quando a AQE como um todo está habilitada, em spark.sql.adaptive.enabled. Ao desativar a AQE inteira, o engenheiro perdeu também essa subdivisão automática da partição dominada pela chave enviesada, então reabilitar a AQE restaura o comportamento sem exigir mudança no código do job. Aumentar spark.sql.shuffle.partitions redistribui o hash das chaves entre mais partições, mas todas as linhas de uma mesma chave continuam caindo na mesma partição, então não resolve o desbalanceamento causado por uma única chave dominante. Broadcast é pensado para o lado pequeno do join, então aplicá-lo na tabela maior tende a esgotar a memória dos executores, e um repartition() aleatório, sem as colunas de join, ainda exige um shuffle adicional por chave no momento do join em si.",
        topic: "Shuffle e Join",
        options: [
            ["Reabilitar o Adaptive Query Execution, que volta a dividir em tempo de execução a partição dominada pela chave desproporcional entre tarefas.", true],
            ["Aumentar o valor de spark.sql.shuffle.partitions, elevando o número total de partições usadas no shuffle gerado pelo join entre as duas tabelas.", false],
            ["Aplicar um hint de broadcast na tabela maior do join, forçando o Spark a enviá-la inteira para a memória de cada executor do cluster.", false],
            ["Aplicar repartition() no DataFrame de entrada usando 200 partições aleatórias antes do join, sem informar as colunas usadas na condição de join.", false],
        ],
    },
    {
        statement:
            "Uma consulta faz join entre uma tabela de fatos grande e uma tabela de dimensão que, após um filtro bastante seletivo aplicado antes do join, resulta em poucas linhas. O plano estático exibido por EXPLAIN mostra um sort-merge join, pois o otimizador não conhece o tamanho pós-filtro em tempo de compilação. Na prática, porém, o Spark UI mostra que a consulta executou como um broadcast join, bem mais rápido que o plano estático sugeria. O que explica essa diferença entre o plano estático e a execução real?",
        explanation:
            "A Adaptive Query Execution reotimiza o plano físico entre estágios de uma consulta, usando estatísticas reais em vez das estimativas do otimizador baseado em custo calculadas antes da execução. Nesse caso, o filtro seletivo só revela seu efeito real depois de executado, então a AQE reavalia o tamanho do lado filtrado após esse estágio e, encontrando-o abaixo do limite de spark.sql.autoBroadcastJoinThreshold, substitui o sort-merge join planejado por um broadcast join na execução. O Photon acelera a execução vetorizada das operações, mas não decide a estratégia de join, o otimizador baseado em custo usa estatísticas do ANALYZE para o plano inicial, não para reotimizar durante a execução, e o cache de resultados do warehouse reaproveita resultados finais de consultas idênticas, não planos de execução de consultas diferentes.",
        topic: "Shuffle e Join",
        options: [
            ["O Photon substitui automaticamente qualquer sort-merge join por um broadcast join sempre que ambas as tabelas de origem são arquivos Delta.", false],
            ["A Adaptive Query Execution reavalia o plano após o filtro e troca o sort-merge join por um broadcast join, pois o lado filtrado ficou menor que o limite de broadcast.", true],
            ["O otimizador baseado em custo reexecuta o planejamento do zero antes de cada consulta, usando estatísticas de ANALYZE coletadas na execução anterior da mesma consulta.", false],
            ["O cache de resultados do warehouse reconheceu uma consulta equivalente executada anteriormente e reaproveitou o plano de execução mais eficiente daquela vez.", false],
        ],
    },
    {
        statement:
            "Um time de analistas roda consultas SQL ad hoc em horários imprevisíveis ao longo do dia, com longos intervalos de ociosidade entre elas. Hoje, o warehouse clássico fica ligado o dia inteiro para evitar o tempo de provisionamento de um novo cluster a cada consulta, gerando custo elevado de capacidade ociosa. Qual mudança reduz esse desperdício sem piorar o tempo de resposta percebido pelos analistas?",
        explanation:
            "Compute serverless, aqui um SQL warehouse serverless, é gerenciado pela própria Databricks, inicia em segundos, escala automaticamente e cobra por uso efetivo, o que elimina a necessidade de manter um cluster clássico ligado o dia inteiro só para evitar o tempo de provisionamento. Um cluster clássico com mínimo de workers zero ainda enfrenta o tempo de subida de nós na nuvem a cada nova consulta após um período ocioso, o que piora o tempo de resposta percebido, e desligar o auto termination só mantém o custo de capacidade ociosa. Aumentar o mínimo de workers do autoscaling clássico reduz a latência de provisionamento em picos, mas mantém capacidade paga ociosa durante os intervalos sem consultas, e pools de instâncias reduzem o tempo de subida de nós, mas ainda exigem manter instâncias pré-inicializadas reservadas, gerando custo contínuo.",
        topic: "Serverless vs Classic Compute",
        options: [
            ["Reduzir o número mínimo de workers do cluster clássico para zero, mantendo o auto termination desligado para garantir disponibilidade imediata.", false],
            ["Configurar autoscaling clássico com um número mínimo maior de workers, reduzindo o tempo de provisionamento de novos nós a cada pico de consultas.", false],
            ["Migrar as consultas para um SQL warehouse serverless, que inicia em segundos e cobra por uso, sem custo de capacidade ligada nos intervalos ociosos.", true],
            ["Trocar o warehouse clássico por um cluster de job dedicado, reaproveitado entre execuções por meio de pools de instâncias pré-inicializadas.", false],
        ],
    },
    {
        statement:
            "Um pipeline de Lakeflow Spark Declarative Pipelines processa um fluxo de streaming cuja vazão varia bastante ao longo do dia, com picos curtos seguidos de longos períodos de baixa atividade. Configurado com o modo clássico de autoscaling do cluster, o pipeline mantém mais workers ativos do que o necessário durante boa parte do dia, elevando o custo sem reduzir a latência de forma perceptível. Qual mudança de configuração reduz o custo nos períodos de baixa atividade, mantendo a latência de processamento sob controle?",
        explanation:
            "Enhanced Autoscaling é o modo de autoscaling dos Lakeflow Spark Declarative Pipelines, ativado por padrão para pipelines novos, construído para as cargas de streaming e batch do próprio pipeline: ele reage a métricas de carga do pipeline e reduz a capacidade de forma mais agressiva durante quedas de vazão, sem sacrificar a latência de processamento nos picos. O autoscaling clássico de cluster reage principalmente ao volume de tarefas pendentes e costuma manter workers por mais tempo antes de reduzir, o que explica o excesso de capacidade observado. Fixar um número de workers para o pico histórico garante desempenho no pior caso, mas paga por essa capacidade o tempo todo, mesmo nos períodos ociosos. Reduzir o máximo do autoscaling clássico limita o custo no pico, mas não resolve o desperdício nos períodos de baixa atividade, e o intervalo de checkpoint do Structured Streaming não tem relação com a decisão de quantos workers o autoscaling mantém ativos.",
        topic: "Autoscaling",
        options: [
            ["Fixar um número único de workers, dimensionado para o pico máximo de vazão observado historicamente, eliminando a variabilidade do autoscaling.", false],
            ["Reduzir o valor máximo de workers do autoscaling clássico, forçando o cluster a operar sempre próximo do limite inferior configurado.", false],
            ["Aumentar o intervalo de checkpoint do Structured Streaming subjacente ao pipeline, reduzindo a frequência de avaliação da carga pelo autoscaling.", false],
            ["Usar o modo Enhanced Autoscaling no pipeline, que reage à carga real e reduz workers de forma mais agressiva nos períodos ociosos.", true],
        ],
    },
    {
        statement:
            "Um job de ETL em SQL faz grandes leituras, joins e agregações sobre tabelas Delta em um cluster clássico. Ao habilitar Photon nesse cluster, o custo por hora de compute em DBUs aumenta, mas o tempo total de execução do job cai de forma significativa. Depois da mudança, o time discute se o job ficou mais caro ou mais barato. Qual afirmação avalia corretamente o efeito de Photon no custo total desse job?",
        explanation:
            "Photon é um mecanismo de execução vetorizado, compatível com as APIs do Spark, que acelera operações de scan, join e agregação, entre outras. O compute com Photon tem uma taxa de DBU por hora mais alta do que o compute equivalente sem Photon, mas o custo total de um job é a taxa horária multiplicada pela duração da execução, então uma redução proporcionalmente maior no tempo de execução pode compensar, e até superar, o aumento da taxa, resultando em um custo total menor apesar da taxa mais alta. Não há garantia automática em nenhuma das duas direções: o resultado depende do quanto aquele workload específico se beneficia da execução vetorizada, então nem sempre mais caro nem sempre mais barato na mesma proporção descrevem o comportamento real, e o Databricks não ajusta a cobrança de DBUs para compensar a mudança de taxa.",
        topic: "Photon",
        options: [
            ["O custo total depende da taxa horária multiplicada pela duração; se o tempo cair mais, proporcionalmente, do que a taxa subiu, o custo total do job diminui.", true],
            ["O job ficou necessariamente mais caro, porque o custo por hora em DBUs de compute com Photon é sempre maior do que o de compute equivalente sem Photon.", false],
            ["O custo total não muda, pois o Databricks compensa automaticamente o aumento da taxa horária do Photon reduzindo o número de DBUs cobrados por operação executada.", false],
            ["O job ficou necessariamente mais barato, porque o Photon sempre reduz o tempo de execução na mesma proporção em que aumenta a taxa horária de DBUs.", false],
        ],
    },
    {
        statement:
            "Um job noturno de ETL em lote é totalmente reprocessável: cada tarefa perdida pode ser recalculada a partir das fontes sem afetar o resultado final, e um atraso ocasional de alguns minutos é aceitável. A equipe quer reduzir o custo de compute desse job aproveitando instâncias spot, mas sem arriscar a perda do estado do cluster inteiro caso a nuvem reivindique capacidade spot no meio da execução. Qual configuração atende a esse objetivo?",
        explanation:
            "Perder o driver encerra o cluster inteiro, e o job junto com ele, então o driver deve rodar em uma instância on-demand, nunca spot. Os workers, por outro lado, são substituíveis: se um worker spot for reivindicado pela nuvem, o Spark apenas recalcula as tarefas perdidas a partir da linhagem, o que é aceitável para um job tolerante a falhas e reprocessável como esse. Configurar também o driver como spot arrisca perder o cluster inteiro no meio da execução, manter todas as instâncias on-demand abre mão da economia de custo que o spot ofereceria aos workers, e inverter as instâncias, com o driver em spot e apenas o primeiro worker on-demand, é exatamente o oposto da prática recomendada, pois expõe o componente mais crítico do cluster ao risco de reivindicação.",
        topic: "Spot Instances",
        options: [
            ["Configurar o driver e todos os workers como instâncias spot, com fallback para on-demand caso a capacidade spot não esteja disponível no momento da criação do cluster.", false],
            ["Configurar o driver como on-demand e os workers como spot com fallback para on-demand, para que a perda de um worker só dispare o reprocessamento das tarefas afetadas.", true],
            ["Configurar o driver e todos os workers como instâncias on-demand, e reduzir o número máximo de workers do autoscaling para diminuir o custo total do job.", false],
            ["Configurar apenas o primeiro worker como instância on-demand e o driver como spot, garantindo que ao menos uma parte fixa do cluster não seja reivindicada pela nuvem.", false],
        ],
    },
    {
        statement:
            "Uma consulta Structured Streaming com agregação por janela grava seu diretório de checkpoint em um volume do Unity Catalog. O cluster que executava a consulta falha de forma inesperada e um novo cluster reinicia a mesma consulta apontando para o mesmo checkpoint. Quais DUAS informações o checkpoint permite que a consulta recupere corretamente ao reiniciar? (Selecione DUAS opções.)",
        explanation:
            "O checkpoint de uma consulta Structured Streaming guarda o progresso de leitura da fonte, como os offsets já processados, e o estado necessário para operações stateful, como agregações por janela e joins com watermark, permitindo retomar a consulta do ponto correto após uma falha. Ele não armazena os dados brutos lidos, que continuam apenas na fonte, nem credenciais de acesso, que vêm da configuração do cluster, nem o histórico de versões da tabela Delta de destino, que fica no próprio transaction log da tabela Delta, não no checkpoint da consulta.",
        topic: "Structured Streaming - checkpoint",
        options: [
            ["Os offsets de leitura da fonte, indicando até onde os dados já foram processados", true],
            ["O estado intermediário das operações stateful, como os agregados parciais de cada janela", true],
            ["Os arquivos de dados brutos lidos da fonte, copiados para dentro do checkpoint", false],
            ["As credenciais de acesso ao Unity Catalog usadas pelo cluster anterior", false],
            ["O histórico completo de versões da tabela Delta de destino, equivalente ao transaction log", false],
        ],
    },
    {
        statement:
            "Uma equipe processa arquivos que chegam em um volume ao longo do dia usando Auto Loader com Structured Streaming. Para reduzir custo, a consulta deve rodar em um job agendado que liga o cluster, processa TODOS os arquivos pendentes, dividindo-os em vários micro-batches de tamanho adequado quando o volume acumulado for grande, e encerra a consulta sozinha ao terminar. Qual trigger atende esse requisito?",
        explanation:
            "Trigger.AvailableNow() processa todo o backlog de dados disponível no momento em que a consulta inicia, dividindo-o automaticamente em múltiplos micro-batches de tamanho gerenciável, e encerra a consulta sozinha ao concluir, ideal para jobs agendados que ligam e desligam o cluster. Trigger.Once() também processa todo o backlog e encerra a consulta, mas força tudo em um único micro-batch, o que pode ser ineficiente ou arriscado com um volume grande de dados acumulados. Trigger.ProcessingTime com um intervalo fixo e o trigger padrão mantêm a consulta rodando continuamente entre disparos, sem encerrar sozinhos, exigindo que o cluster permaneça ativo.",
        topic: "Structured Streaming - triggers",
        options: [
            ["Trigger.AvailableNow(), que processa todo o backlog disponível em múltiplos micro-batches e encerra a consulta ao final", true],
            ["Trigger.Once(), que processa todo o backlog disponível em um único micro-batch e encerra a consulta ao final", false],
            ["Trigger.ProcessingTime('1 hour'), que dispara um novo micro-batch a cada hora e mantém a consulta em execução contínua", false],
            ["O trigger padrão, sem argumento, que dispara um novo micro-batch assim que o anterior termina e mantém a consulta em execução contínua", false],
        ],
    },
    {
        statement:
            "Uma consulta Structured Streaming calcula a contagem de eventos por janela de 10 minutos sobre uma coluna de tempo de evento, com watermark de 15 minutos definido nessa mesma coluna. Um evento chega com timestamp de evento 40 minutos mais antigo que o watermark atual da consulta. O que acontece com esse evento?",
        explanation:
            "Quando o watermark avança além do fim de uma janela mais o limite de atraso configurado, o Spark considera essa janela finalizada e libera o estado associado da memória. Eventos que chegam depois disso, com tempo de evento anterior ao watermark, são descartados silenciosamente, sem erro e sem reabrir o estado já liberado. O Structured Streaming não cria nenhuma tabela de quarentena automática para esses dados; se for necessário capturá-los, isso precisa ser implementado explicitamente pela aplicação.",
        topic: "Structured Streaming - watermark",
        options: [
            ["O evento é descartado silenciosamente, pois sua janela já teve o estado finalizado e removido da memória", true],
            ["O evento é processado normalmente e reabre o estado da janela correspondente, corrigindo o resultado já emitido", false],
            ["A consulta falha com erro, pois eventos atrasados além do watermark não são permitidos pelo Structured Streaming", false],
            ["O evento é gravado em uma tabela de quarentena criada automaticamente pelo Spark para dados fora do watermark", false],
        ],
    },
    {
        statement:
            "Uma consulta Structured Streaming agrega o total de vendas por janela de 5 minutos e precisa gravar o resultado em um tópico Kafka, que só aceita gravações em modo append. A consulta já define uma coluna de tempo de evento e um watermark. Como o engenheiro deve configurar a saída para que a agregação seja compatível com o sink Kafka?",
        explanation:
            "Quando a agregação tem um watermark definido, o modo de saída append passa a ser permitido: o Spark só emite a linha final de cada janela depois que o watermark garante que ela não vai mais receber atualizações, produzindo um fluxo de inserções puras compatível com sinks que só aceitam append, como o Kafka. O modo update emite atualizações incrementais da linha antes dela ser definitiva, e o modo complete reescreve a tabela inteira de resultados a cada micro-batch; nenhum dos dois é aceito por um sink que só suporta append. Remover o watermark não habilita o modo append para agregações, além de impedir o Spark de limitar o estado mantido em memória.",
        topic: "Structured Streaming - output modes",
        options: [
            ["Usar modo de saída append; com watermark definido, o Spark só emite o total de cada janela depois que ela é finalizada", true],
            ["Usar modo de saída update, pois agregações com watermark só podem ser emitidas de forma incremental nesse modo", false],
            ["Usar modo de saída complete, pois agregações exigem que a tabela de resultado inteira seja reescrita a cada micro-batch", false],
            ["Remover o watermark e usar modo append, já que o watermark só é necessário para agregações em modo complete", false],
        ],
    },
    {
        statement:
            "Um pipeline usa foreachBatch para aplicar um MERGE INTO customizado em uma tabela Delta a cada micro-batch de uma consulta Structured Streaming. Após uma falha de task, o Spark reexecuta o micro-batch, e a função passada ao foreachBatch é chamada novamente com o mesmo lote de dados. Qual característica do design do MERGE dentro do foreachBatch evita que essa nova execução duplique ou corrompa os dados na tabela de destino?",
        explanation:
            "foreachBatch oferece garantia de pelo menos uma vez para a chamada da função: em caso de falha, o mesmo micro-batch pode ser reprocessado. Por isso, a operação dentro da função precisa ser idempotente por design, tipicamente usando MERGE com uma chave de negócio, de forma que reaplicar o mesmo lote produza o mesmo resultado final, sem duplicar linhas. O foreachBatch não garante exatamente uma vez sozinho, o checkpoint da consulta não bloqueia reexecuções de micro-batches em foreachBatch da forma descrita, e o Delta Lake não possui deduplicação automática de lotes reprocessados por identificador de micro-batch.",
        topic: "foreachBatch - idempotência",
        options: [
            ["O MERGE usa uma chave de negócio para casar as linhas do lote com a tabela de destino, tornando a operação idempotente", true],
            ["O foreachBatch garante processamento exatamente uma vez por padrão, então nenhum cuidado extra é necessário na lógica do MERGE", false],
            ["O checkpoint da consulta bloqueia automaticamente a reexecução de um micro-batch que já foi processado por foreachBatch", false],
            ["O Delta Lake detecta lotes duplicados automaticamente pelo identificador interno do micro-batch e ignora reexecuções", false],
        ],
    },
    {
        statement:
            "Uma tabela silver precisa receber, no mesmo micro-batch, upserts de uma tabela de dimensão usando SCD tipo 2 e, adicionalmente, gravar uma cópia filtrada de linhas rejeitadas em uma tabela separada de erros, com uma lógica condicional específica do negócio. A equipe avalia implementar isso em um Lakeflow Spark Declarative Pipeline. Qual abordagem atende esse requisito?",
        explanation:
            "AUTO CDC automatiza bem o padrão declarativo de upsert e SCD tipo 1 ou 2, mas não oferece um mecanismo declarativo para, na mesma operação, desviar linhas para uma tabela de erros com lógica condicional arbitrária de negócio. Quando a necessidade é esse tipo de controle imperativo combinando múltiplas escritas customizadas no mesmo micro-batch, foreachBatch em Structured Streaming é a abordagem indicada, pois permite escrever código Python livre dentro da função. AUTO CDC não tem uma opção nativa para gravar rejeitados em outra tabela, e materialized view não se aplica a esse padrão de ingestão incremental com upsert.",
        topic: "foreachBatch x AUTO CDC",
        options: [
            ["Usar foreachBatch em uma consulta Structured Streaming, aplicando o MERGE e a gravação condicional de erros na mesma função", true],
            ["Usar AUTO CDC com STORED AS SCD TYPE 2, que já permite gravar linhas rejeitadas em uma tabela separada como parte da mesma declaração", false],
            ["Declarar duas streaming tables independentes com AUTO CDC, uma para o SCD tipo 2 e outra para os erros, sem nenhum código customizado", false],
            ["Usar uma materialized view com AUTO CDC embutido para calcular o SCD tipo 2 e o desvio de linhas de erro na mesma consulta declarativa", false],
        ],
    },
    {
        statement:
            "Uma equipe está decidindo entre implementar um novo fluxo de ingestão como Lakeflow Spark Declarative Pipelines ou como uma consulta Structured Streaming standalone orquestrada por um Lakeflow Job. O fluxo precisa, a cada micro-batch, chamar uma API REST externa para validar um subconjunto de registros antes de decidir, de forma imperativa, se grava, descarta ou reencaminha cada registro para filas diferentes. Qual opção é mais adequada?",
        explanation:
            "Lakeflow Spark Declarative Pipelines foi projetado para declarar datasets, como streaming tables e materialized views, e suas transformações de forma declarativa; ele suporta Python, mas o modelo continua centrado em definir o que cada dataset é, não em controle imperativo fino como chamar uma API externa e decidir o roteamento registro a registro. Para esse padrão, uma consulta Structured Streaming com foreachBatch dá o controle imperativo necessário. A opção que descarta Python do pipeline está incorreta, pois pipelines suportam PySpark, e o event log serve para observabilidade do pipeline, não substitui uma chamada de validação a uma API de negócio.",
        topic: "Structured Streaming x Declarative Pipelines",
        options: [
            ["Structured Streaming standalone, porque a chamada a uma API externa e o roteamento imperativo de registros vão além do modelo declarativo de datasets do pipeline", true],
            ["Lakeflow Spark Declarative Pipelines, porque toda lógica Python arbitrária, incluindo chamadas de rede a APIs externas, roda nativamente dentro de uma streaming table", false],
            ["Lakeflow Spark Declarative Pipelines, porque o event log do pipeline substitui a necessidade de qualquer chamada de validação externa durante o processamento", false],
            ["Structured Streaming standalone, porque Lakeflow Spark Declarative Pipelines não suporta nenhuma transformação com Python, apenas SQL declarativo", false],
        ],
    },
    {
        statement:
            "Uma tabela Delta de clientes deve refletir exatamente o estado atual de um sistema de origem: quando um cliente é excluído na origem, o registro correspondente deve ser removido da tabela Delta durante a próxima sincronização via MERGE INTO. Qual cláusula do MERGE implementa essa exclusão?",
        explanation:
            "WHEN NOT MATCHED BY SOURCE se aplica a linhas que existem na tabela de destino mas não têm correspondência no lote de origem, e permite DELETE ou UPDATE nelas, o que cobre exatamente o caso de um registro excluído na origem. WHEN NOT MATCHED, sem BY SOURCE, se aplica ao caso oposto, linhas presentes na origem sem correspondência no destino, e só permite INSERT, não DELETE. A cláusula com WHEN MATCHED AND só cobre exclusões explícitas enviadas pela origem com uma flag, não o caso em que o registro simplesmente deixa de aparecer no lote. Inserir uma flag e filtrar na leitura não remove fisicamente a linha nem usa a cláusula do MERGE prevista para esse cenário.",
        topic: "MERGE INTO - WHEN NOT MATCHED BY SOURCE",
        options: [
            ["WHEN NOT MATCHED BY SOURCE THEN DELETE, que remove da tabela de destino as linhas sem correspondência no lote de origem", true],
            ["WHEN NOT MATCHED THEN DELETE, que remove da tabela de destino as linhas sem correspondência no lote de origem", false],
            ["WHEN MATCHED AND source.deleted = true THEN DELETE, aplicada mesmo quando a origem não envia mais o registro excluído", false],
            ["WHEN NOT MATCHED THEN INSERT com uma coluna de flag de exclusão, seguida de um filtro na leitura da tabela", false],
        ],
    },
    {
        statement:
            "Um MERGE INTO em uma tabela Delta tem duas cláusulas WHEN MATCHED em sequência: a primeira, com uma condição específica, faz DELETE; a segunda, sem condição adicional, faz UPDATE. Para uma linha do lote de origem que casa com uma linha de destino e satisfaz a condição da primeira cláusula, o que o Delta Lake faz?",
        explanation:
            "Quando um MERGE INTO tem múltiplas cláusulas WHEN MATCHED, o Delta Lake avalia na ordem em que foram escritas e aplica apenas a primeira cuja condição seja satisfeita para aquela linha; as demais cláusulas WHEN MATCHED são ignoradas para essa mesma linha. Por isso, a linha é excluída pela primeira cláusula e a segunda, de UPDATE, nunca chega a ser aplicada a ela. Múltiplas cláusulas WHEN MATCHED são permitidas, desde que todas exceto a última tenham uma condição, então a operação não é rejeitada, e não é a última cláusula que casa que prevalece, e sim a primeira.",
        topic: "MERGE INTO - múltiplas cláusulas WHEN MATCHED",
        options: [
            ["Aplica apenas a primeira cláusula que casar, a de DELETE, e ignora a segunda cláusula WHEN MATCHED para essa linha", true],
            ["Aplica as duas cláusulas em sequência na mesma linha, primeiro fazendo DELETE e depois um UPDATE na linha já excluída", false],
            ["Rejeita a operação inteira com erro, pois duas cláusulas WHEN MATCHED nunca podem coexistir em um mesmo MERGE INTO", false],
            ["Aplica a última cláusula que casar, ou seja, a de UPDATE, ignorando a cláusula de DELETE definida antes dela", false],
        ],
    },
    {
        statement:
            "Um MERGE INTO passa a falhar com erro de schema depois que a origem ganhou uma nova coluna que ainda não existe na tabela Delta de destino. A equipe quer que o MERGE evolua o schema da tabela automaticamente, adicionando a nova coluna, sem reescrever o pipeline manualmente a cada mudança. Qual configuração habilita esse comportamento para operações de MERGE?",
        explanation:
            "A evolução automática de schema em operações de MERGE é controlada pela configuração spark.databricks.delta.schema.autoMerge.enabled, definida como true na sessão Spark ou no cluster; com ela ativa, colunas novas presentes na origem são adicionadas automaticamente à tabela de destino durante o MERGE. A opção mergeSchema no DataFrameWriter se aplica a escritas de dataframe comuns, como append e overwrite, mas não é o mecanismo usado para operações de MERGE. Adicionar colunas manualmente com ALTER TABLE funciona, mas não automatiza nada, contrariando o requisito. Column Mapping permite renomear e remover colunas com mais flexibilidade, mas não é o que habilita a evolução automática de schema durante o MERGE.",
        topic: "MERGE INTO - evolução de schema",
        options: [
            ["Definir spark.databricks.delta.schema.autoMerge.enabled como true na sessão ou no cluster antes de executar o MERGE", true],
            ["Definir a opção mergeSchema como true no DataFrameWriter usado para o MERGE, do mesmo jeito que em uma escrita append comum", false],
            ["Executar ALTER TABLE ... ADD COLUMNS manualmente antes de cada MERGE, já que nenhuma configuração automatiza esse passo", false],
            ["Ativar Column Mapping na tabela de destino, que por si só permite que o MERGE aceite colunas novas vindas da origem", false],
        ],
    },
    {
        statement:
            "Uma tabela Delta silver precisa propagar para uma tabela gold, de forma incremental, tanto o valor anterior quanto o valor novo de cada linha que sofrer UPDATE, além de identificar linhas inseridas e excluídas. A equipe habilita Change Data Feed na tabela silver. Quais DUAS afirmações sobre esse cenário estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Com Change Data Feed habilitado, cada UPDATE gera duas linhas de saída, uma representando o valor antes da mudança, com _change_type update_preimage, e outra o valor depois, com update_postimage, além de linhas insert e delete para os demais casos; essas mudanças podem ser lidas com a função table_changes em SQL ou com a opção readChangeFeed em leituras batch e streaming. O time travel entrega apenas fotografias completas da tabela em versões específicas, sem separar o que mudou linha a linha nem os valores antes e depois de um UPDATE. O CDF pode sim ser consumido em streaming, não apenas em batch. E habilitar o CDF não reescreve nem recalcula versões anteriores da tabela; ele passa a capturar mudanças a partir do momento em que é habilitado.",
        topic: "Change Data Feed - fundamentos",
        options: [
            ["Cada UPDATE capturado pelo CDF gera duas linhas na saída, uma com _change_type update_preimage e outra com update_postimage", true],
            ["Para consultar as mudanças, é possível usar a função table_changes ou ler a tabela com a opção readChangeFeed como true", true],
            ["O time travel por versão já entrega o mesmo nível de detalhe do CDF, incluindo o valor anterior e o novo de cada linha alterada", false],
            ["O CDF só pode ser lido em modo batch; consultas Structured Streaming não podem usar table_changes nem readChangeFeed", false],
            ["Habilitar o CDF recalcula e reescreve todo o histórico de versões anteriores da tabela para gerar os registros de mudança retroativamente", false],
        ],
    },
    {
        statement:
            "Uma consulta Structured Streaming lê uma tabela Delta bronze como fonte, usando spark.readStream.table, para alimentar uma tabela silver. A tabela bronze passa a receber operações de UPDATE e DELETE feitas por um processo de deduplicação. A consulta silver, que antes rodava sem problemas, passa a falhar com um erro informando que foi detectada uma atualização de dados na fonte, não suportada por padrão. Qual abordagem resolve o problema mantendo a propagação correta dos updates e deletes para a silver?",
        explanation:
            "Por padrão, uma consulta Structured Streaming trata a fonte Delta como somente inserção; quando detecta um UPDATE ou DELETE nos arquivos de origem, ela falha para evitar processar dados de forma incorreta. Habilitar o Change Data Feed na tabela bronze e ler com readChangeFeed permite que a consulta receba explicitamente cada tipo de mudança, insert, update_preimage, update_postimage e delete, e trate cada um corretamente na silver. ignoreChanges permite que a consulta continue, mas não identifica o que mudou de forma granular, podendo reprocessar linhas de arquivos reescritos e gerar duplicatas rio abaixo. ignoreDeletes só evita erro quando há remoção de partições inteiras, sem resolver updates. Trocar para leitura batch em loop abandona o modelo de streaming incremental e não é a forma recomendada de resolver o problema.",
        topic: "CDF em streaming - updates e deletes na origem",
        options: [
            ["Habilitar Change Data Feed na tabela bronze e ler com a opção readChangeFeed como true, processando os tipos de mudança na silver", true],
            ["Adicionar a opção ignoreChanges como true na leitura streaming, que propaga updates e deletes da bronze para a silver automaticamente", false],
            ["Adicionar a opção ignoreDeletes como true na leitura streaming, que permite que updates e deletes sejam propagados sem gerar erro", false],
            ["Trocar spark.readStream.table por spark.read.table dentro de um loop agendado, que suporta updates e deletes na fonte nativamente", false],
        ],
    },
    {
        statement:
            "Um pipeline consome o Change Data Feed de uma tabela Delta a partir da versão 120, usando startingVersion. A tabela recebe VACUUM regularmente com o período de retenção padrão. Alguns meses depois, o pipeline é reiniciado do zero e tenta reler o CDF novamente a partir da versão 120. O que provavelmente acontece?",
        explanation:
            "Os dados necessários para servir o Change Data Feed de versões antigas dependem dos mesmos arquivos que o time travel usa, sujeitos ao período de retenção do log e removidos por VACUUM. Se o VACUUM já limpou os arquivos referentes à versão 120, uma tentativa de reler o CDF a partir dela falha, porque os arquivos correspondentes já não existem. O CDF não tem retenção indefinida própria e independente do VACUUM. O Spark não ajusta silenciosamente a versão pedida para uma disponível; ele retorna erro. E o Delta Lake não bloqueia VACUUM automaticamente só por uma tabela ter CDF habilitado; cabe à equipe configurar a retenção de forma compatível com a janela de consumo do CDF.",
        topic: "Change Data Feed x VACUUM",
        options: [
            ["A leitura falha, pois o VACUUM já removeu os arquivos de dados de versões antigas necessários para reconstruir o CDF a partir da versão 120", true],
            ["A leitura funciona normalmente, pois os arquivos de change data do CDF são mantidos indefinidamente, independente do período de retenção do VACUUM", false],
            ["A leitura funciona, mas o Spark ignora silenciosamente a versão inicial pedida e começa a partir da versão mais antiga ainda disponível", false],
            ["O VACUUM é bloqueado automaticamente pelo Delta Lake em tabelas com CDF habilitado, então os dados da versão 120 sempre continuam disponíveis", false],
        ],
    },
    {
        statement:
            "Uma tabela bronze acumula múltiplas versões do mesmo registro, identificado por id, cada uma com um updated_at diferente, incluindo casos em que duas versões do mesmo id têm exatamente o mesmo updated_at. Um job PySpark precisa manter exatamente uma linha por id, a mais recente, mesmo nesses casos de empate. Qual função de janela, usada com particionamento por id e ordenação por updated_at descendente, seguida de um filtro, garante exatamente uma linha por id mesmo com empates?",
        explanation:
            "row_number() atribui um número sequencial estritamente único a cada linha dentro da partição, mesmo quando várias linhas empatam nos critérios de ordenação, então filtrar por row_number igual a 1 sempre deixa exatamente uma linha por id. rank() e dense_rank() atribuem a mesma posição a todas as linhas empatadas; se duas linhas do mesmo id empatarem no updated_at mais recente, ambas receberiam a posição 1, e o filtro deixaria as duas linhas, quebrando o requisito de exatamente uma linha por id. percent_rank() calcula uma posição relativa contínua e não serve para selecionar uma única linha por chave dessa forma.",
        topic: "PySpark - funções de janela para deduplicação",
        options: [
            ["row_number(), pois atribui números sequenciais únicos dentro de cada partição, sem repetir valor mesmo quando há empate na ordenação", true],
            ["rank(), pois atribui a mesma posição a valores empatados, garantindo no máximo uma linha com o valor 1 mesmo com empate no updated_at", false],
            ["dense_rank(), pois atribui a mesma posição a valores empatados, mas sem pular números para as posições seguintes dentro da partição", false],
            ["percent_rank(), pois calcula a posição relativa de cada linha dentro da partição, sempre normalizada entre 0 e 1", false],
        ],
    },
    {
        statement:
            "Uma tabela tem uma coluna do tipo ARRAY<STRUCT<produto STRING, valor DOUBLE>> por linha. Um job precisa, para cada linha, manter apenas os itens do array com valor acima de um limite, sem alterar a granularidade da tabela, ou seja, cada linha de entrada deve continuar sendo uma única linha de saída, ainda com um array, agora filtrado. Qual abordagem evita o custo de um explode seguido de groupBy e collect_list para voltar à granularidade original?",
        explanation:
            "A função de ordem superior filter opera diretamente sobre a coluna do tipo array dentro de cada linha, aplicando a condição elemento a elemento sem precisar explodir a coluna em várias linhas nem reagrupar depois, o que evita o shuffle e o custo do padrão explode mais groupBy mais collect_list. Explodir e reagrupar produz o mesmo resultado lógico, mas com custo adicional de embaralhamento de dados e passos extras. Manipular o array como texto com expressões regulares é frágil e propenso a erro de parsing. Um UDF Python resolve o problema funcionalmente, mas processa item a item fora do motor otimizado do Spark, com serialização mais custosa do que a função de ordem superior nativa.",
        topic: "PySpark - funções de ordem superior em arrays",
        options: [
            ["Usar a função de ordem superior filter do PySpark diretamente sobre a coluna array, aplicando a condição a cada elemento sem sair da linha", true],
            ["Usar explode para transformar cada item do array em uma linha, aplicar o filtro com WHERE e reagrupar com groupBy e collect_list ao final", false],
            ["Converter a coluna array para string com concat_ws, aplicar uma expressão regular para remover os itens indesejados e converter de volta para array", false],
            ["Usar um UDF Python que recebe a lista inteira como parâmetro, itera item a item em código Python puro e retorna a lista já filtrada", false],
        ],
    },
    {
        statement:
            "Um job PySpark aplica uma UDF Python tradicional, chamada linha a linha, para calcular um indicador numérico complexo sobre bilhões de linhas, usando apenas operações vetorizáveis com numpy. Essa UDF é o gargalo do job. Um engenheiro propõe reescrevê-la como uma pandas UDF do tipo Series to Series. Quais DUAS afirmações explicam corretamente por que essa mudança tende a melhorar o desempenho? (Selecione DUAS opções.)",
        explanation:
            "Pandas UDFs usam Apache Arrow para trocar dados em lotes entre a JVM e o processo Python, evitando a serialização linha a linha das UDFs tradicionais, e recebem os dados como Series do pandas, permitindo aplicar operações vetorizadas de numpy e pandas sobre o lote inteiro de uma vez, bem mais eficientes que um laço por valor. A pandas UDF não adiciona paralelismo com múltiplas threads dentro da mesma task por conta própria; o ganho vem da vetorização e da redução de overhead de serialização. Ela também não elimina a movimentação de dados entre JVM e Python, apenas a torna mais eficiente via Arrow, pois o processo Python continua existindo. E funções nativas do Spark SQL, quando existem para o mesmo cálculo, geralmente ainda superam uma pandas UDF, que só vale a pena quando não há equivalente nativo.",
        topic: "Pandas UDF x UDF Python",
        options: [
            ["A pandas UDF usa Apache Arrow para transferir dados em lote entre a JVM e o processo Python, reduzindo a serialização por linha", true],
            ["Dentro da pandas UDF, o cálculo pode usar operações vetorizadas do numpy e pandas sobre um lote inteiro, em vez de um valor por chamada", true],
            ["A pandas UDF executa automaticamente em paralelo dentro de uma única task, usando múltiplas threads Python por partition", false],
            ["A pandas UDF elimina totalmente a necessidade de mover dados entre a JVM e o processo Python, pois roda inteiramente dentro da JVM", false],
            ["A pandas UDF sempre supera qualquer função nativa do Spark SQL equivalente, independente do tipo de cálculo realizado", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados precisa aplicar, para cada cliente, um modelo estatístico que exige todas as linhas daquele cliente juntas em um único pandas DataFrame para calcular parâmetros específicos do grupo, retornando um pandas DataFrame de saída com um schema diferente do de entrada. Isso deve rodar distribuído sobre um DataFrame Spark com milhões de clientes. Qual API do PySpark atende esse requisito?",
        explanation:
            "groupBy(...).applyInPandas permite definir uma função que recebe todas as linhas de cada grupo, chave por chave, como um único pandas DataFrame, calcula o que for necessário usando todo o contexto do grupo e retorna outro pandas DataFrame, possivelmente com schema diferente do de entrada; o Spark distribui essa execução grupo a grupo entre as tasks. Uma pandas UDF escalar processa lotes de linhas sem garantir que todas as linhas de um mesmo cliente estejam juntas na mesma chamada. mapInPandas entrega uma partition inteira por vez, mas sem a garantia de agrupamento por chave que o cenário exige. Uma UDF tradicional com GROUP BY em SQL não entrega ao código Python o grupo inteiro como uma estrutura tabular de uma vez, apenas valores agregados ou linha a linha conforme a função de agregação usada.",
        topic: "PySpark - applyInPandas",
        options: [
            ["df.groupBy('cliente_id').applyInPandas(func, schema), que entrega todas as linhas de cada grupo como um único pandas DataFrame", true],
            ["Uma pandas UDF escalar do tipo Series to Series, que recebe lotes de linhas na ordem original, sem garantir agrupamento por cliente", false],
            ["df.mapInPandas(func, schema), que entrega a cada chamada um pandas DataFrame de uma partition inteira, sem agrupar por cliente", false],
            ["Uma UDF Python tradicional registrada com spark.udf.register, aplicada em conjunto com uma cláusula GROUP BY em SQL", false],
        ],
    },
    {
        statement:
            "Uma consulta SQL usa ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY data_pedido DESC) AS rn na lista de SELECT e precisa manter apenas as linhas em que rn é igual a 1, sem envolver a consulta em uma subconsulta ou CTE apenas para poder filtrar por rn. Qual cláusula do Databricks SQL permite esse filtro diretamente, aplicado ao resultado das funções de janela do próprio SELECT?",
        explanation:
            "QUALIFY filtra as linhas resultantes com base no valor de funções de janela calculadas na própria consulta, dispensando a necessidade de uma subconsulta ou CTE só para poder aplicar o filtro, de forma parecida com o papel do HAVING sobre funções de agregação. HAVING existe para filtrar depois de um GROUP BY, com base em agregações, não em funções de janela. WHERE é avaliado antes do cálculo das funções de janela na ordem lógica de execução do SQL, então não pode referenciar o alias de uma função de janela da mesma consulta. Não existe uma cláusula FILTER que se aplique dessa forma após OVER no Databricks SQL.",
        topic: "SQL avançado - QUALIFY",
        options: [
            ["QUALIFY, que filtra linhas pelo resultado de funções de janela calculadas na mesma consulta, de forma análoga ao HAVING", true],
            ["HAVING, que filtra diretamente o resultado de qualquer função de janela definida na lista de SELECT, sem exigir agrupamento", false],
            ["WHERE, que já é avaliado depois do cálculo das funções de janela na ordem lógica de execução de uma consulta SQL", false],
            ["FILTER, aplicada após a cláusula OVER de uma função de janela, restringindo quais linhas de saída são mantidas", false],
        ],
    },
    {
        statement:
            "Uma tabela Delta representa uma hierarquia organizacional, em que cada funcionário referencia o id do seu gestor direto. Um engenheiro precisa calcular o nível hierárquico de cada funcionário a partir do CEO, sem um limite de profundidade conhecido de antemão. Diferente de alguns bancos relacionais tradicionais, o Databricks SQL não oferece o mesmo suporte consolidado a consultas com CTE recursiva autorreferenciada e profundidade variável em uma única instrução declarativa. Qual abordagem é o padrão recomendado no Spark para esse tipo de travessia hierárquica?",
        explanation:
            "Como o mecanismo declarativo padrão do Spark SQL não cobre bem travessias recursivas de profundidade desconhecida da mesma forma que alguns bancos relacionais tradicionais, o padrão usado no Spark é implementar a recursão de forma imperativa: um loop em PySpark que junta a tabela ao resultado acumulado, incrementa o nível a cada iteração e para quando nenhuma linha nova é adicionada, ou seja, quando atinge um ponto fixo. Tratar a sintaxe de CTE recursiva como equivalente total à de bancos relacionais tradicionais não reflete o suporte real da plataforma. Repetir um CROSS JOIN um número fixo de vezes é uma abordagem cara e artificial, que não se adapta corretamente à profundidade real dos dados. E a hierarquia não chega pronta pré-achatada em uma única coluna array para se resolver com uma única função de ordem superior; a própria construção dessa coluna é que exige a travessia recursiva.",
        topic: "SQL avançado - recursão hierárquica",
        options: [
            ["Um loop iterativo em PySpark que faz joins sucessivos entre a tabela e o resultado acumulado, parando quando nenhuma linha nova é adicionada", true],
            ["Uma única consulta com WITH RECURSIVE, com sintaxe e comportamento idênticos aos de bancos relacionais tradicionais como PostgreSQL", false],
            ["Um CROSS JOIN da tabela com ela mesma, repetido um número fixo de vezes igual ao número total de linhas, para cobrir qualquer profundidade possível", false],
            ["Uma única função de ordem superior aggregate aplicada a uma coluna do tipo ARRAY contendo toda a hierarquia pré-achatada em uma linha", false],
        ],
    },
    {
        statement:
            "Uma consulta Structured Streaming faz join entre duas streams, pedidos e pagamentos, cada uma com sua própria coluna de tempo de evento e um watermark definido. Após rodar por vários dias em produção, o tamanho do estado mantido pela consulta cresce continuamente, até o cluster ficar sem memória. Pedidos sem pagamento correspondente dentro de uma janela razoável de tempo deveriam ser descartados do estado, mas isso não está acontecendo. Qual ajuste no join resolve o crescimento ilimitado do estado?",
        explanation:
            "Em um join stream-stream, além de cada lado ter seu próprio watermark, a condição do join precisa incluir restrições de tempo, como intervalos entre as colunas de tempo de evento das duas streams, para que o Spark saiba quando uma linha em buffer de um dos lados não pode mais encontrar correspondência e possa ser descartada do estado. Sem essas restrições de intervalo na condição do join, o Spark não consegue limitar o estado, mesmo com watermark definido nas duas streams, e o estado cresce indefinidamente. Ter watermark em apenas um dos lados não é suficiente para um join stream-stream, que exige limite de atraso definido dos dois lados. Trocar para stream-static muda a semântica do caso de uso, que envolve duas fontes genuinamente streaming. E apenas aumentar o valor do watermark adia o problema, mas não resolve o crescimento do estado, que precisa de um limite real imposto pela condição de tempo do join.",
        topic: "Structured Streaming - join stream-stream",
        options: [
            ["Adicionar, na condição do join, restrições de intervalo de tempo entre as colunas de tempo de evento das duas streams", true],
            ["Remover o watermark de uma das duas streams, deixando apenas uma delas com limite de atraso definido, o que já é suficiente para joins stream-stream", false],
            ["Trocar o join stream-stream por um join stream-static, convertendo pagamentos em uma tabela Delta estática lida a cada micro-batch", false],
            ["Aumentar o valor do watermark das duas streams para um valor bem alto, garantindo que nenhum pedido tardio seja perdido pelo join", false],
        ],
    },
    {
        statement:
            "Uma streaming table bronze usa Auto Loader com cloudFiles.schemaEvolutionMode definido como rescue desde a primeira execução, há vários meses. Novos campos passaram a aparecer nos arquivos JSON de origem ao longo do tempo, mas a equipe percebe que o schema da tabela de destino nunca ganha essas colunas novas: elas continuam caindo em _rescued_data mesmo após vários reinícios do stream. Por que isso acontece?",
        explanation:
            "O modo rescue mantém o schema fixo por definição: ele nunca evolui automaticamente para incorporar colunas novas, e qualquer dado que não bate com o schema atual, incluindo colunas nunca vistas antes, é capturado em _rescued_data indefinidamente, sem promoção espontânea ao longo do tempo. Apagar o checkpoint reinicia o progresso da leitura e pode causar reprocessamento, mas não muda o comportamento do modo rescue nem promove colunas automaticamente. Não existe um ciclo automático de reavaliação de schema a cada 24 horas nesse modo. E rodar o pipeline com Full Refresh reprocessa o histórico sob a configuração atual, mas continua respeitando o modo rescue, então as colunas novas seguem indo para _rescued_data.",
        topic: "Auto Loader - modo rescue nao evolui schema",
        options: [
            ["Porque o modo rescue nunca evolui o schema por definição: dados fora do schema fixado ficam em _rescued_data", true],
            ["Porque o modo rescue só promove colunas novas depois que o checkpoint da leitura é apagado manualmente", false],
            ["Porque o modo rescue reavalia e evolui o schema automaticamente uma vez por dia, em um ciclo fixo de 24 horas", false],
            ["Porque a promoção de colunas do _rescued_data só ocorre quando o pipeline roda com Full Refresh ativado", false],
        ],
    },
    {
        statement:
            "Uma equipe liga pela primeira vez um stream de Auto Loader sobre um diretório bronze que já acumulou dois anos de arquivos históricos. A primeira execução tenta processar todo o histórico em um único microbatch enorme, gerando forte pressão de memória no cluster. A equipe quer dividir esse backfill inicial em vários microbatches menores e limitados, sem mudar a lógica de processamento do regime permanente depois que o backlog for absorvido. Qual configuração atende isso diretamente?",
        explanation:
            "cloudFiles.maxFilesPerTrigger e cloudFiles.maxBytesPerTrigger limitam quantos arquivos ou bytes entram em cada microbatch do Auto Loader, permitindo que um backlog grande seja absorvido aos poucos, em vários microbatches menores, sem alterar a lógica de processamento normal depois disso. O modo de evolução de schema não tem relação com o tamanho do microbatch, apenas com o tratamento de colunas divergentes. O file notification melhora a descoberta de arquivos novos que chegam depois que o stream já está ativo, mas não acelera nem substitui a necessidade de conter o volume de um backlog histórico já acumulado. E reduzir o processingTime aumenta a frequência dos gatilhos, mas não limita, por si só, quantos arquivos pendentes entram em cada execução.",
        topic: "Auto Loader - maxFilesPerTrigger no backfill",
        options: [
            ["Definir cloudFiles.maxFilesPerTrigger, ou maxBytesPerTrigger, para limitar o que entra em cada microbatch", true],
            ["Definir cloudFiles.schemaEvolutionMode como rescue, o que reduz o tamanho de cada microbatch ao descartar dados", false],
            ["Migrar para o modo file notification, que descobre e processa arquivos históricos mais rápido que directory listing", false],
            ["Reduzir o intervalo de processingTime do trigger para poucos segundos, limitando automaticamente o microbatch", false],
        ],
    },
    {
        statement:
            "Uma pipeline usa Auto Loader em modo file notification há anos. A equipe decide desativar essa ingestão definitivamente, migrando a carga para outro sistema, e apaga apenas o diretório de checkpoint para limpar o ambiente. Semanas depois, a fatura da nuvem mostra que a fila e o tópico de notificação continuam ativos e gerando custo, mesmo sem nenhum stream em execução. Qual é a explicação correta?",
        explanation:
            "Os recursos de notificação criados para o modo file notification, como fila e tópico de eventos, existem de forma independente do checkpoint e do ciclo de vida do stream: eles continuam ativos e gerando custo até serem removidos explicitamente, o que a equipe precisa fazer ao aposentar de vez uma ingestão nesse modo. A Databricks não exclui esses recursos automaticamente por inatividade do stream. Eles também não são cobrados apenas durante a execução do cluster, pois são recursos gerenciados diretamente pelo provedor de nuvem, independentes do cluster. E a ordem entre apagar o checkpoint e parar o stream não influencia essa limpeza, já que nenhuma das duas ações remove a fila ou o tópico automaticamente.",
        topic: "Auto Loader - custo de recursos do file notification",
        options: [
            ["Apagar o checkpoint não remove os recursos de notificação da nuvem; eles precisam ser removidos à parte", true],
            ["Esses recursos são removidos automaticamente pela Databricks após 30 dias seguidos de inatividade do stream", false],
            ["Recursos de notificação só são cobrados pelo provedor de nuvem enquanto o cluster do stream está em execução", false],
            ["Isso ocorre porque o checkpoint foi apagado antes do stream ser parado de forma graciosa, o que impediria a limpeza", false],
        ],
    },
    {
        statement:
            "Um arquivo carregado anteriormente por COPY INTO continha dados incorretos. A equipe corrige o conteúdo e sobrescreve o arquivo de origem exatamente no mesmo caminho e com o mesmo nome. Ao rodar novamente o mesmo comando COPY INTO, a tabela de destino não muda: continua com as linhas antigas erradas, sem nenhuma linha nova. Por que isso acontece e como resolver?",
        explanation:
            "Por padrão, o COPY INTO rastreia quais arquivos já foram carregados na tabela de destino e ignora esses arquivos em execuções seguintes, mesmo que o conteúdo tenha mudado no mesmo caminho. A cláusula COPY_OPTIONS ('force' = 'true') força o comando a reprocessar arquivos já carregados, que é exatamente o que resolve esse cenário. O COPY INTO não recalcula hash de conteúdo para decidir reprocessamento sozinho. Trocar para MERGE INTO não resolve a causa raiz, que é o rastreamento de arquivos já carregados, e ignora a opção mais direta disponível. E recriar a tabela é uma medida desproporcional, que descartaria todo o histórico já carregado sem necessidade.",
        topic: "COPY INTO - reprocessamento forcado",
        options: [
            ["O COPY INTO ignora arquivos já carregados por padrão; COPY_OPTIONS ('force' = 'true') força reprocessá-los", true],
            ["O COPY INTO detecta mudanças de conteúdo pelo hash do arquivo e reprocessa sozinho, sem exigir opção extra", false],
            ["A correção exige trocar para MERGE INTO, já que o COPY INTO jamais reprocessa um arquivo já visto, em nenhuma hipótese", false],
            ["É necessário apagar e recriar a tabela de destino antes que o COPY INTO aceite o arquivo corrigido de novo", false],
        ],
    },
    {
        statement:
            "Um engenheiro compara como o Auto Loader e o COPY INTO garantem que arquivos já carregados não sejam processados de novo. Qual afirmação descreve corretamente onde cada um mantém esse estado de rastreamento?",
        explanation:
            "O Auto Loader é uma leitura de Structured Streaming e, como tal, depende de um checkpointLocation externo para saber o que já foi processado; perder ou apagar esse checkpoint compromete a garantia de não reprocessamento. Já o COPY INTO não usa um checkpoint de streaming: o histórico de arquivos já carregados fica registrado junto à própria tabela de destino, sem exigir um local de checkpoint separado. A primeira opção descreve corretamente os dois mecanismos, a segunda inventa uma exigência que o COPY INTO não tem, a terceira inverte os papéis dos dois comandos, e a quarta descreve um comportamento que o Unity Catalog não oferece: o rastreamento de idempotência é responsabilidade de cada comando, não um serviço central do catálogo.",
        topic: "Auto Loader x COPY INTO - onde vive o estado de idempotencia",
        options: [
            ["O Auto Loader depende de um checkpoint externo; o COPY INTO mantém o histórico de cargas junto à própria tabela", true],
            ["Os dois comandos exigem um checkpointLocation explícito, e perder esse checkpoint tem a mesma consequência nos dois", false],
            ["O COPY INTO depende de um checkpoint externo, enquanto o Auto Loader guarda o estado no log de transações da tabela", false],
            ["Nenhum dos dois precisa manter estado de rastreamento, pois o Unity Catalog rastreia centralmente todo arquivo ingerido", false],
        ],
    },
    {
        statement:
            "Sobre a arquitetura do Lakeflow Connect para diferentes tipos de fonte, quais DUAS afirmações a seguir estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Para determinados conectores de banco de dados, sobretudo origens on premises ou em redes restritas, o Lakeflow Connect usa um gateway de ingestão implantado próximo à origem, responsável por capturar o snapshot inicial e as mudanças subsequentes antes de aplicá-las no Unity Catalog. Já os conectores gerenciados para aplicações SaaS, como Salesforce, acessam a API do provedor diretamente a partir do plano gerenciado do Lakeflow Connect, sem exigir nenhum componente implantado na rede do cliente. Por isso não é verdade que todo conector exija gateway, nem que os conectores SaaS precisem de um. O gateway também não substitui o Auto Loader: são mecanismos para propósitos diferentes, um para conectores de banco de dados, outro para ingestão incremental de arquivos em object storage.",
        topic: "Lakeflow Connect - gateway x conectores SaaS",
        options: [
            ["Para alguns conectores de banco de dados, um gateway implantado próximo à origem captura o snapshot inicial e as mudanças seguintes", true],
            ["Conectores gerenciados para aplicações SaaS, como Salesforce, também exigem um gateway implantado na rede do cliente", false],
            ["Conectores gerenciados para SaaS acessam a API do provedor diretamente a partir do plano gerenciado, sem gateway do lado do cliente", true],
            ["Todo conector do Lakeflow Connect, seja de banco de dados ou de SaaS, exige a implantação de um gateway próximo à origem", false],
            ["O gateway de ingestão substitui o Auto Loader como mecanismo padrão para qualquer ingestão de arquivos em object storage", false],
        ],
    },
    {
        statement:
            "Uma tabela silver de pedidos é mantida por AUTO CDC INTO com SEQUENCE BY event_time. Por instabilidade no produtor de eventos, um evento de atualização com event_time mais antigo chega depois de outro evento com event_time mais recente para o mesmo pedido, que já foi aplicado ao destino. O que o AUTO CDC faz com esse evento atrasado?",
        explanation:
            "O AUTO CDC usa a coluna definida em SEQUENCE BY para conhecer a ordem lógica dos eventos e trata dados fora de ordem automaticamente: um evento com valor de sequência menor do que o já aplicado para a mesma chave é descartado, porque o destino já reflete um estado mais recente. Ele não sobrescreve o valor atual com um evento mais antigo só porque esse evento chegou depois, essa é justamente a confusão que SEQUENCE BY evita. O pipeline também não falha por causa de eventos fora de ordem, esse é um cenário esperado e tratado nativamente. E o evento atrasado não gera uma linha adicional: ele é simplesmente descartado.",
        topic: "AUTO CDC - descarte automatico de eventos atrasados",
        options: [
            ["É automaticamente descartado, pois o AUTO CDC sabe que o valor de SEQUENCE BY já aplicado é mais recente", true],
            ["Sobrescreve o valor já aplicado, pois o AUTO CDC sempre aplica o último evento recebido, independente da sequência", false],
            ["Faz o pipeline falhar, pois o AUTO CDC não aceita eventos que cheguem fora da ordem cronológica de chegada", false],
            ["É gravado como uma nova linha adicional, preservando os dois valores lado a lado na tabela de destino", false],
        ],
    },
    {
        statement:
            "Uma tabela silver de assinaturas usa AUTO CDC INTO com STORED AS SCD TYPE 2 e APPLY AS DELETE WHEN operation = 'DELETE'. Um evento de delete chega para um cliente cuja versão atual tem __END_AT nulo. O que o AUTO CDC faz com essa versão vigente ao aplicar o delete?",
        explanation:
            "Em uma tabela com STORED AS SCD TYPE 2, um evento tratado por APPLY AS DELETE WHEN não apaga fisicamente o histórico: ele fecha a versão vigente, preenchendo __END_AT com o valor de sequência do evento de delete, preservando intactas todas as versões anteriores. Nenhuma versão histórica anterior é removida fisicamente por esse evento. O delete também não é ignorado, já que APPLY AS DELETE WHEN foi definido explicitamente para tratar essa condição. E o AUTO CDC não cria uma versão adicional com colunas nulas para representar a exclusão, ele apenas encerra a vigência da versão atual.",
        topic: "AUTO CDC - delete em SCD Type 2",
        options: [
            ["Preenche o __END_AT da versão com o valor de sequência do delete, fechando a vigência sem apagar o histórico", true],
            ["Remove fisicamente todas as versões históricas desse cliente da tabela, inclusive as anteriores ao delete", false],
            ["Ignora o evento de delete, pois tabelas com SCD Type 2 não processam exclusões vindas do feed de CDC", false],
            ["Cria uma nova versão com todas as colunas nulas para representar a exclusão, mantendo __END_AT nulo", false],
        ],
    },
    {
        statement:
            "Uma equipe quer implementar um padrão de quarentena no Lakeflow Spark Declarative Pipelines: linhas que violam uma regra de qualidade devem ser gravadas em uma tabela separada para investigação, em vez de simplesmente descartadas ou de derrubar o pipeline. Como esse padrão deve ser implementado?",
        explanation:
            "As cláusulas ON VIOLATION do Lakeflow Spark Declarative Pipelines não incluem nenhuma opção que roteie automaticamente a linha para outra tabela: só existem DROP ROW, que descarta a linha, e FAIL UPDATE, que interrompe a atualização. Por isso, um padrão de quarentena precisa ser construído manualmente, com duas queries a partir da mesma origem, uma mantendo apenas as linhas válidas para a tabela principal e outra filtrando exatamente as linhas inválidas para uma tabela separada. Não existe uma cláusula ON VIOLATION QUARANTINE ROW. DROP ROW apenas descarta a linha, sem gravá-la em outro lugar. E repetir a mesma constraint com ações diferentes não redireciona nenhuma linha para uma tabela separada, apenas aplica duas verificações redundantes.",
        topic: "Expectations - padrao de quarentena manual",
        options: [
            ["Definindo duas queries a partir da mesma origem: uma para as linhas válidas e outra para as inválidas", true],
            ["Usando uma única CONSTRAINT EXPECT com a cláusula ON VIOLATION QUARANTINE ROW apontando para a outra tabela", false],
            ["Usando ON VIOLATION DROP ROW, que já move automaticamente a linha descartada para uma tabela de quarentena", false],
            ["Definindo a mesma CONSTRAINT EXPECT duas vezes, uma com DROP ROW e outra com FAIL UPDATE, cobrindo os dois destinos", false],
        ],
    },
    {
        statement:
            "Uma streaming table silver define duas constraints: CONSTRAINT valid_email EXPECT (email RLIKE '@') ON VIOLATION DROP ROW e CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION FAIL UPDATE. Um microbatch chega com algumas linhas de email inválido e, separadamente, uma única linha com customer_id nulo. O que acontece com essa atualização do pipeline?",
        explanation:
            "Cada CONSTRAINT EXPECT é avaliada de forma independente, mas sua ação de ON VIOLATION vale para o resultado da atualização como um todo: as linhas de email inválido seriam descartadas isoladamente pela constraint com DROP ROW, mas a presença de qualquer linha que viole a constraint com FAIL UPDATE faz a atualização inteira falhar, independente do que aconteceria às outras linhas. A linha de customer_id nulo não é simplesmente gravada, pois FAIL UPDATE interrompe a atualização ao encontrar a violação. O pipeline também não apenas descarta tudo sem falhar, já que FAIL UPDATE provoca uma falha explícita. E as duas constraints são avaliadas dentro do mesmo microbatch, não em execuções separadas.",
        topic: "Expectations - multiplas constraints independentes",
        options: [
            ["A atualização inteira falha por causa da linha com customer_id nulo, mesmo o email inválido sendo só descartável", true],
            ["Somente as linhas de email inválido são descartadas, e a linha de customer_id nulo é gravada com a violação registrada", false],
            ["O pipeline descarta todas as linhas do microbatch, tanto as de email inválido quanto a de customer_id nulo, sem falhar", false],
            ["Cada constraint é avaliada em um microbatch separado, então as duas violações nunca são processadas juntas", false],
        ],
    },
    {
        statement:
            "Uma materialized view gold calcula, para cada dia, a quantidade de clientes distintos que compraram, usando COUNT(DISTINCT customer_id) sobre a camada silver. A equipe percebe que essa atualização recalcula o resultado inteiro a cada execução do pipeline, mesmo quando chegam poucas linhas novas na silver, ao contrário de outras materialized views mais simples do mesmo pipeline, que atualizam de forma incremental. Qual é a explicação mais provável?",
        explanation:
            "Certos padrões de consulta, entre eles agregações que dependem de contar valores distintos, podem impedir que o motor do pipeline mantenha o resultado de forma incremental, levando a um recálculo completo a cada atualização, mesmo com poucas linhas novas na origem. Isso não é verdade para toda materialized view: consultas mais simples, como somas ou contagens diretas, costumam ser mantidas incrementalmente, o que explica a diferença observada no mesmo pipeline. COUNT(DISTINCT ...) funciona normalmente dentro de materialized views, o problema não é de suporte, é de custo de manutenção incremental. E watermark é um conceito de Structured Streaming ligado ao descarte de estado tardio, não o fator que determina se uma materialized view atualiza de forma incremental.",
        topic: "Materialized view - agregacao nao incrementalizavel",
        options: [
            ["Certos padrões de consulta, como agregações com DISTINCT, podem impedir a manutenção incremental e forçar recálculo completo", true],
            ["Toda materialized view definida sobre a silver sempre recalcula por completo, independente da consulta usada para defini-la", false],
            ["COUNT(DISTINCT ...) só funciona corretamente dentro de streaming tables, nunca dentro de materialized views", false],
            ["O recálculo completo só ocorre porque a materialized view não foi configurada com um watermark sobre a data", false],
        ],
    },
    {
        statement:
            "Um bug na lógica de uma materialized view gold fez uma coluna calculada trazer valores errados por vários meses. A equipe já corrigiu a consulta que define a materialized view. Rodar o pipeline normalmente, de forma incremental, processa somente os dados novos a partir de agora. O que a equipe precisa fazer para corrigir também as linhas antigas já materializadas com o valor errado?",
        explanation:
            "Uma atualização incremental normal processa apenas dados novos ou alterados na origem, então não corrige, por si só, linhas antigas que já foram materializadas com uma lógica anterior incorreta. Para reprocessar o histórico inteiro sob a consulta corrigida, é preciso disparar um full refresh dessa tabela, recalculando tudo do zero. A correção da consulta não aciona um recálculo automático do histórico já materializado. Apagar linhas manualmente foge do fluxo gerenciado pelo pipeline e não garante que elas sejam recriadas corretamente na próxima atualização incremental. E não é necessário recriar o pipeline inteiro, nem recalcular tabelas que não foram afetadas pelo bug, o full refresh pode ser aplicado somente à tabela específica.",
        topic: "Materialized view - full refresh para correcao retroativa",
        options: [
            ["Disparar um full refresh dessa tabela, reprocessando todo o histórico sob a lógica já corrigida", true],
            ["Nada além de aguardar: a materialized view detecta sozinha a mudança e recalcula automaticamente o histórico", false],
            ["Excluir manualmente as linhas antigas com DELETE e deixar a próxima atualização incremental recriá-las", false],
            ["Recriar o pipeline inteiro do zero, incluindo todas as outras tabelas do mesmo pipeline, não somente essa", false],
        ],
    },
    {
        statement:
            "Um stream de eventos usa entrega pelo menos uma vez (at least once) na origem, então o mesmo event_id pode chegar mais de uma vez, cada cópia com um event_time ligeiramente diferente, na casa de milissegundos. Deduplicar com dropDuplicates(['event_id', 'event_time']) falha em juntar essas cópias, pois o event_time não é idêntico entre elas. A equipe quer deduplicar somente pelo event_id, mantendo o estado limitado por um watermark sobre o tempo. Qual abordagem atende isso?",
        explanation:
            "dropDuplicatesWithinWatermark permite deduplicar usando apenas as colunas de chave informadas, como event_id, sem exigir que uma coluna de tempo também seja idêntica entre as cópias, ao mesmo tempo em que usa o watermark definido no stream para limitar até quando o estado de deduplicação é mantido. dropDuplicates(['event_id']) sem watermark configurado mantém o estado crescendo indefinidamente, sem limite automático baseado no relógio do sistema. Mudar o particionamento do sink não afeta a lógica de deduplicação, que acontece antes da escrita. E aumentar o watermark controla até quando um evento tardio ainda é aceito, não faz duas colunas de tempo diferentes serem tratadas como iguais na comparação.",
        topic: "Deduplicacao em streaming - dropDuplicatesWithinWatermark",
        options: [
            ["Usar dropDuplicatesWithinWatermark(['event_id']), que deduplica só pela chave informada, sem exigir tempo idêntico", true],
            ["Usar dropDuplicates(['event_id']) sem watermark configurado, o que já limita o estado pelo relógio do sistema", false],
            ["Adicionar event_time à chave de particionamento do sink, o que remove as duplicatas na escrita final", false],
            ["Aumentar bastante o watermark, o que faz dropDuplicates(['event_id', 'event_time']) ignorar pequenas diferenças de tempo", false],
        ],
    },
    {
        statement:
            "Uma ingestão lê arquivos CSV nos quais algumas linhas têm um número de colunas diferente do esperado, um problema estrutural, não apenas um campo com tipo divergente. A equipe quer que a leitura falhe imediatamente ao encontrar a primeira linha malformada, para impedir que qualquer dado corrompido chegue à camada bronze. Qual configuração do leitor atende exatamente essa exigência?",
        explanation:
            "A opção mode do leitor, definida como FAILFAST, faz a leitura falhar imediatamente ao encontrar a primeira linha que não pode ser interpretada corretamente, o que impede que qualquer dado malformado chegue à camada bronze, exatamente o que a equipe quer. DROPMALFORMED descarta as linhas problemáticas silenciosamente e segue processando o restante, sem falhar a leitura. PERMISSIVE é o modo padrão e faz o oposto de falhar: ele mantém a linha problemática, geralmente com os campos não interpretáveis marcados como nulos. E o rescued data column do Auto Loader existe justamente para capturar dados divergentes sem interromper o stream, o oposto do comportamento de falha imediata pedido no cenário.",
        topic: "Tratamento de dados corrompidos - modo FAILFAST",
        options: [
            ["Definir a opção mode como FAILFAST, que interrompe a leitura assim que uma linha malformada é encontrada", true],
            ["Definir a opção mode como DROPMALFORMED, que impede linhas corrompidas de chegar à bronze e falha a leitura", false],
            ["Deixar a opção mode no padrão PERMISSIVE, que já interrompe a leitura ao encontrar uma linha malformada", false],
            ["Habilitar cloudFiles.rescuedDataColumn, que interrompe a leitura ao capturar uma linha estruturalmente malformada", false],
        ],
    },
    {
        statement:
            "Sobre o comportamento fino do AUTO CDC e das expectations no Lakeflow Spark Declarative Pipelines, quais DUAS afirmações a seguir estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Expectations não são avaliadas apenas uma vez: elas rodam a cada microbatch processado pela streaming table, continuamente, enquanto o pipeline está ativo. A coluna ou colunas informadas em KEYS no AUTO CDC precisam identificar unicamente cada registro de origem, pois é essa chave que decide qual linha do destino deve ser inserida, atualizada ou removida. Sem uma cláusula ON VIOLATION explícita, o comportamento padrão é manter a linha e apenas registrar a violação nas métricas, não interromper a atualização. Mesmo quando a origem parece chegar ordenada, o AUTO CDC continua exigindo SEQUENCE BY para tratar corretamente eventos fora de ordem, já que a ordem de chegada não garante a ordem lógica dos eventos. E cada CONSTRAINT EXPECT aceita apenas uma cláusula ON VIOLATION; para aplicar duas ações diferentes é preciso declarar duas constraints separadas.",
        topic: "AUTO CDC e expectations - comportamentos finos",
        options: [
            ["Expectations definidas em uma streaming table são avaliadas a cada microbatch processado, não só no início do pipeline", true],
            ["Uma CONSTRAINT EXPECT sem nenhuma cláusula ON VIOLATION interrompe a atualização na primeira linha que viola a condição", false],
            ["A coluna informada em KEYS no AUTO CDC precisa identificar unicamente cada registro para aplicar as mudanças de forma correta", true],
            ["Quando a origem já chega ordenada pela chave primária, o AUTO CDC dispensa a necessidade de declarar SEQUENCE BY", false],
            ["É possível combinar ON VIOLATION DROP ROW e ON VIOLATION FAIL UPDATE na mesma CONSTRAINT, aplicando as duas ações juntas", false],
        ],
    },
    {
        statement:
            "Uma equipe de FinOps quer descobrir quantos DBUs (Databricks Units) um job específico de Lakeflow Jobs consumiu nos últimos 30 dias, para ratear o custo entre centros de custo diferentes. Qual system table deve ser consultada como fonte primária dessa informação?",
        explanation:
            "A system table system.billing.usage registra, em granularidade de evento de uso, o consumo de DBUs por workspace, SKU e recurso, incluindo metadados de uso com o identificador do job, permitindo somar o consumo de um job específico ao longo do período desejado. system.access.audit registra ações administrativas e de acesso, não consumo de DBUs. system.query.history registra execuções de consultas SQL, sem agregação de custo por job. system.compute.clusters é um inventário da configuração dos clusters, não do consumo faturado.",
        topic: "System Tables - billing",
        options: [
            ["system.billing.usage", true],
            ["system.access.audit", false],
            ["system.query.history", false],
            ["system.compute.clusters", false],
        ],
    },
    {
        statement:
            "O time de conformidade precisa descobrir qual usuário excluiu uma tabela crítica do Unity Catalog e em que horário exato isso ocorreu, para um relatório de auditoria. Qual system table oferece esse histórico de ações administrativas?",
        explanation:
            "system.access.audit registra eventos auditáveis do workspace e do Unity Catalog, incluindo quem executou cada ação administrativa, como excluir uma tabela, e em que momento, sendo a fonte correta para investigações de conformidade. system.billing.usage traz apenas consumo de DBUs. system.access.table_lineage mostra relações de leitura e escrita entre tabelas, não quem excluiu um objeto. system.query.history registra consultas SQL, sem cobrir todas as ações administrativas realizadas fora de uma consulta.",
        topic: "System Tables - audit",
        options: [
            ["system.access.audit", true],
            ["system.billing.usage", false],
            ["system.access.table_lineage", false],
            ["system.query.history", false],
        ],
    },
    {
        statement:
            "Um time de plataforma quer identificar, entre todos os SQL warehouses do workspace, as 10 consultas com maior tempo de execução nos últimos 7 dias, junto com o usuário que executou cada uma, para priorizar otimizações. Qual system table fornece esse detalhe por consulta?",
        explanation:
            "system.query.history traz uma linha por consulta SQL executada, com duração, usuário, warehouse e texto da consulta, permitindo ordenar pelo tempo de execução e identificar as mais lentas. system.billing.usage agrega consumo de DBUs, sem o detalhe de duração por consulta. system.access.audit registra ações administrativas e de acesso, não métricas de desempenho de consulta. system.compute.warehouses é um inventário da configuração dos warehouses, não das consultas executadas neles.",
        topic: "System Tables - query history",
        options: [
            ["system.query.history", true],
            ["system.billing.usage", false],
            ["system.access.audit", false],
            ["system.compute.warehouses", false],
        ],
    },
    {
        statement:
            "Sobre as system tables de lineage do Unity Catalog, system.access.table_lineage e system.access.column_lineage, quais afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O lineage do Unity Catalog é capturado automaticamente para leituras e escritas feitas por meio de compute governado pelo Unity Catalog, sem exigir instrumentação manual, e fica registrado em duas granularidades separadas, uma no nível de tabela e outra no nível de coluna. Ele não é retroativo: consultas executadas antes da ativação do rastreamento não aparecem nessas tabelas. Gravações feitas diretamente no armazenamento em nuvem, sem passar por compute governado pelo Unity Catalog, não são capturadas. O lineage cobre notebooks, jobs, pipelines de Lakeflow Spark Declarative Pipelines e dashboards, não apenas notebooks.",
        topic: "System Tables - lineage",
        options: [
            ["O lineage é capturado automaticamente para leituras e escritas via compute governado pelo Unity Catalog, sem instrumentação manual", true],
            ["A granularidade de coluna é registrada em uma system table separada da granularidade de tabela", true],
            ["As tabelas de lineage trazem retroativamente o histórico de consultas anteriores à ativação do rastreamento", false],
            ["O lineage também cobre gravações feitas direto no armazenamento em nuvem, sem passar pelo Unity Catalog", false],
            ["O lineage registra apenas relações originadas de notebooks, sem cobrir jobs, pipelines ou dashboards", false],
        ],
    },
    {
        statement:
            "Uma equipe de plataforma quer consultar diretamente com SQL os eventos do event log de uma pipeline Lakeflow Spark Declarative Pipelines, filtrando por tipo de evento e por período, sem configurar entrega externa de logs nem acessar arquivos brutos. Qual é a forma suportada de fazer isso?",
        explanation:
            "O event log de uma pipeline Lakeflow Spark Declarative Pipelines pode ser consultado diretamente com SQL por meio de uma table-valued function dedicada, que recebe o identificador da pipeline e retorna os eventos como uma tabela comum, permitindo filtros por tipo de evento e por data. Ativar log verboso do cluster e fazer parsing manual de arquivos é desnecessário e não é a via suportada. system.access.audit não traz as métricas de execução por flow da pipeline. Exportar manualmente a aba SQL da Spark UI não produz um registro estruturado e consultável dos eventos da pipeline.",
        topic: "Event log - consulta como tabela",
        options: [
            ["Usar a table-valued function de event log, passando o id da pipeline, e consultar como tabela", true],
            ["Ativar o log verboso do cluster da pipeline e fazer parsing manual dos arquivos no driver", false],
            ["Consultar a system table system.access.audit filtrando pelo nome da pipeline", false],
            ["Exportar manualmente o conteúdo da aba SQL da Spark UI do cluster da pipeline", false],
        ],
    },
    {
        statement:
            "Dentro de uma pipeline Lakeflow Spark Declarative Pipelines, uma streaming table específica está acumulando atraso. O engenheiro quer, pelo event log, saber quantos registros esse flow processou na última atualização e se alguma expectation de qualidade de dados reprovou registros. Qual tipo de evento do event log traz essa informação no nível do flow?",
        explanation:
            "Eventos do tipo flow_progress trazem, no campo de detalhes, as métricas de execução de cada flow, incluindo linhas processadas e o resultado das expectations de qualidade de dados aplicadas a esse flow. Eventos do tipo user_action apenas registram interações manuais, como iniciar ou interromper uma atualização pelo console. Eventos do tipo planning_information trazem o plano de execução gerado antes da atualização começar, sem métricas de linhas processadas. Eventos do tipo create_update apenas marcam o início de uma nova atualização da pipeline, identificada por um update id.",
        topic: "Event log - métricas por flow",
        options: [
            ["flow_progress, cujo campo de detalhes traz as métricas do flow, como linhas processadas", true],
            ["user_action, que registra apenas interações manuais feitas pelo console", false],
            ["planning_information, que traz o plano de execução gerado antes da atualização começar", false],
            ["create_update, que apenas marca o início de uma nova atualização da pipeline", false],
        ],
    },
    {
        statement:
            "No Query Profiler de uma consulta SQL que ficou muito mais lenta que o esperado, o engenheiro observa grande tempo gasto em shuffle e sinais claros de spill para disco em vários estágios, causados por chaves de join fortemente enviesadas. Quais ações são formas válidas de mitigar esse gargalo? (Selecione DUAS opções.)",
        explanation:
            "Aumentar o número de partições de shuffle, ou repartitionar os dados de entrada, reduz o volume de dados processado por partição e tende a diminuir o spill para disco. Aplicar salting nas chaves fortemente enviesadas distribui melhor o trabalho entre as tasks, atacando diretamente o skew que gera o gargalo. Trocar Photon por execução Spark padrão não ajuda, pois o Photon acelera justamente operações de shuffle, join e agregação. Aumentar apenas o tipo de instância do driver não resolve, porque o gargalo de shuffle e spill ocorre nos executores, não no driver. Desativar o Adaptive Query Execution tende a piorar o cenário, já que a AQE inclui otimização específica para join enviesado.",
        topic: "Spark UI e Query Profiler - gargalo",
        options: [
            ["Aumentar o número de partições de shuffle ou repartitionar os dados de entrada, reduzindo o volume por partição", true],
            ["Aplicar salting nas chaves de join fortemente enviesadas, distribuindo melhor o trabalho entre as tasks", true],
            ["Trocar Photon por execução Spark padrão, já que o Photon não acelera operações de shuffle", false],
            ["Aumentar apenas o tipo de instância do driver, mantendo os workers inalterados", false],
            ["Desativar o Adaptive Query Execution para evitar replanejamento durante a consulta", false],
        ],
    },
    {
        statement:
            "Além do que a Spark UI mostra, um engenheiro quer enviar automaticamente, a cada micro-batch concluído, as métricas de uma consulta Structured Streaming, como linhas de entrada, taxa de entrada e taxa de processamento, para um sistema externo de observabilidade, sem inspeção manual. Qual abordagem programática atende esse requisito?",
        explanation:
            "Implementar um StreamingQueryListener e registrá-lo com spark.streams.addListener permite tratar o evento onQueryProgress, que traz as métricas de cada micro-batch concluído, incluindo taxa de entrada e de processamento, possibilitando encaminhá-las a um sistema externo automaticamente. Chamar explain() na consulta mostra apenas o plano de execução, sem métricas de runtime. system.billing.usage traz consumo de DBUs, não throughput de micro-batch. Ler os checkpoints da consulta expõe offsets e estado para tolerância a falhas, não uma API amigável de métricas.",
        topic: "Monitoramento de streaming - StreamingQueryListener",
        options: [
            ["Implementar um StreamingQueryListener e tratar onQueryProgress via spark.streams.addListener", true],
            ["Chamar periodicamente o método explain() da consulta para extrair as métricas de runtime", false],
            ["Consultar system.billing.usage filtrando pelo cluster que executa a consulta em streaming", false],
            ["Ler os checkpoints da consulta em um notebook separado para calcular as taxas manualmente", false],
        ],
    },
    {
        statement:
            "Uma tarefa de um Lakeflow Job normalmente termina em cerca de 15 minutos. A equipe quer ser notificada por e-mail automaticamente apenas quando essa tarefa específica ultrapassar 45 minutos em execução, sem que isso interrompa a tarefa nem exija monitoramento manual. Qual configuração do job atende isso diretamente?",
        explanation:
            "Configurar um limite de duração esperada (duration threshold) para a tarefa, com os destinatários do alerta, dispara uma notificação automática quando esse limite é ultrapassado, sem interromper a execução em andamento. A matrix view é uma visualização para comparar manualmente a duração entre execuções, não um mecanismo automático de alerta. A política de retry só age depois que a tarefa falha, não quando ela apenas demora mais que o esperado. Reduzir o timeout da tarefa para 45 minutos faria o job matar a execução ao atingir o limite, em vez de apenas alertar.",
        topic: "Lakeflow Jobs - limite de duração",
        options: [
            ["Configurar um limite de duração esperada (duration threshold) para a tarefa, com os destinatários do alerta", true],
            ["Abrir a matrix view do job após cada execução para comparar visualmente a duração entre execuções", false],
            ["Configurar a política de retry da tarefa para atuar após 45 minutos de execução", false],
            ["Reduzir o timeout da tarefa para 45 minutos, fazendo o job falhar e disparar a notificação padrão de falha", false],
        ],
    },
    {
        statement:
            "Uma organização exige que todo Lakeflow Job em produção rode exatamente o código aprovado em um processo de release, sem risco de um push posterior alterar silenciosamente o que será executado na próxima agenda. Hoje a tarefa do job usa como fonte um repositório Git remoto apontando para a branch main. Qual ajuste elimina esse risco?",
        explanation:
            "Apontar a tarefa para uma tag ou um commit específico do release, em vez de uma branch, elimina o risco de alteração silenciosa, já que uma branch como main pode receber novos commits a qualquer momento, enquanto uma tag ou commit é uma referência imutável. Trocar para um Git Folder sincronizado manualmente ainda referenciando main mantém a mesma mutabilidade e adiciona um passo manual. Clonar o repositório a cada execução mantendo main como referência não muda a natureza mutável da branch. Remover a integração Git e mover o código para dentro do job sacrifica o versionamento e a rastreabilidade do release.",
        topic: "Databricks Git Folders - referência imutável",
        options: [
            ["Apontar a tarefa para uma tag ou um commit específico do release, em vez da branch main", true],
            ["Trocar a fonte da tarefa para um Git Folder sincronizado manualmente, mantendo main como referência", false],
            ["Configurar o job para clonar o repositório a cada execução, mantendo main como referência", false],
            ["Mover o código da tarefa para dentro do próprio job, removendo a integração Git", false],
        ],
    },
    {
        statement:
            "O databricks.yml de um Automation Bundle declara uma variável catalog sem valor padrão na raiz, usada em resources.pipelines.vendas.catalog. O target prod do mesmo arquivo declara um default para essa variável dentro do bloco variables do target. Ao rodar databricks bundle deploy --target prod sem passar --var, qual catálogo a pipeline implantada usa?",
        explanation:
            "Quando uma variável não tem default na declaração raiz, um target pode fornecer o próprio default dentro do seu bloco variables, e esse valor é o que resolve a interpolação ao implantar aquele target, sem exigir --var na linha de comando. A implantação não falha nesse caso, porque o target supre o valor. Não existe a regra de sempre usar o primeiro default do arquivo: o default aplicado é o do target selecionado. A pipeline também não fica sem catálogo definido, já que a interpolação só é resolvida quando há um valor disponível.",
        topic: "Automation Bundles - variables por target",
        options: [
            ["O catálogo definido no default declarado dentro do bloco variables do target prod", true],
            ["Nenhum, porque uma variável sem default na raiz nunca pode ser resolvida por um target", false],
            ["O catálogo do primeiro default de variável encontrado no arquivo, na ordem em que aparece", false],
            ["Nenhum catálogo definido, assumindo o catálogo padrão do metastore", false],
        ],
    },
    {
        statement:
            "Antes de compartilhar um Automation Bundle com o restante do time, um engenheiro quer confirmar que o databricks.yml está sintaticamente correto e que as referências a variables e recursos resolvem, sem criar nem atualizar nenhum recurso no workspace. Qual comando do Databricks CLI atende exatamente essa necessidade?",
        explanation:
            "databricks bundle validate verifica a sintaxe do databricks.yml e resolve as referências de variables e recursos localmente, sem criar nem atualizar nada no workspace. databricks bundle deploy efetivamente cria ou atualiza os recursos no workspace de destino. databricks bundle run dispara a execução de um job ou pipeline já implantado, exigindo deploy prévio. databricks bundle summary exibe informações sobre os recursos já implantados de um bundle, não substitui a validação prévia da configuração.",
        topic: "Databricks CLI - bundle validate",
        options: [
            ["databricks bundle validate", true],
            ["databricks bundle deploy", false],
            ["databricks bundle run", false],
            ["databricks bundle summary", false],
        ],
    },
    {
        statement:
            "Dois engenheiros, cada um com seu próprio usuário, implantam o mesmo Automation Bundle no mesmo workspace usando um target com mode: development, cada um a partir do próprio checkout local, rodando databricks bundle deploy. O que evita que a implantação de um sobrescreva os recursos implantados pelo outro?",
        explanation:
            "No modo development, o Databricks prefixa automaticamente o nome dos recursos implantados com um identificador do usuário que fez o deploy, isolando as implantações de desenvolvedores diferentes no mesmo workspace. O Databricks CLI não bloqueia deploys simultâneos de usuários diferentes. O modo development não exige um service principal compartilhado via run_as para unificar recursos de usuários diferentes. Também não existe a restrição de um target só poder ser implantado por um único usuário pré configurado no databricks.yml.",
        topic: "Automation Bundles - modo development",
        options: [
            ["O modo development prefixa o nome dos recursos com um identificador do usuário que fez o deploy", true],
            ["O Databricks CLI bloqueia o segundo deploy, exigindo que o primeiro engenheiro libere o bundle antes", false],
            ["O modo development exige que os dois compartilhem o mesmo service principal via run_as", false],
            ["Cada target só pode ser implantado por um único usuário configurado previamente no databricks.yml", false],
        ],
    },
    {
        statement:
            "Uma pipeline Lakeflow Spark Declarative Pipelines foi validada no target dev de um Automation Bundle, gravando na streaming table dev_catalog.vendas.pedidos. Para promovê-la a produção gravando em prod_catalog.vendas.pedidos, sem duplicar a definição da pipeline em dois lugares, qual prática o bundle deve seguir?",
        explanation:
            "Definir a pipeline uma única vez em resources, referenciando o catálogo por meio de uma variável que cada target sobrescreve, evita duplicar a definição entre dev e prod. Copiar o bloco da pipeline para dentro do target prod duplica a definição e dificulta a manutenção. Trocar o catálogo direto no notebook da pipeline, com um widget preenchido a mão, introduz um passo manual fora do controle do bundle. Manter dois arquivos databricks.yml completos, um por ambiente, também duplica a definição que a variável evitaria.",
        topic: "Automation Bundles - promover dev para prod",
        options: [
            ["Definir a pipeline uma vez, referenciando o catálogo por uma variável que cada target sobrescreve", true],
            ["Copiar o bloco da pipeline para dentro do target prod, trocando manualmente o catálogo", false],
            ["Trocar o catálogo direto no notebook da pipeline, com um widget preenchido a mão antes do deploy", false],
            ["Manter dois arquivos databricks.yml completos, um para dev e outro para prod", false],
        ],
    },
    {
        statement:
            "Um Lakeflow Job com 8 tarefas encadeadas falhou na tarefa 6 por uma instabilidade momentânea em uma API externa. As tarefas 1 a 5 terminaram com sucesso e geraram task values consumidos pelas tarefas 7 e 8. Corrigido o problema externo, o engenheiro quer concluir a execução aproveitando o que já foi processado, sem recomputar as tarefas 1 a 5. Qual ação atende isso diretamente?",
        explanation:
            "Repair run, disparado a partir da execução que falhou, reexecuta apenas as tarefas que falharam ou foram puladas, preservando as saídas e os task values das tarefas já concluídas com sucesso. Clonar o job e disparar uma execução completa nova recomputa tudo, desperdiçando o processamento já feito. Marcar a tarefa 6 como opcional deixaria as tarefas 7 e 8 rodarem sem os task values esperados dela, o que é semanticamente incorreto. Esperar a próxima execução agendada também recomputa as 8 tarefas do zero.",
        topic: "Debugging de job - repair run",
        options: [
            ["Usar repair run na execução com falha, reexecutando apenas as tarefas que falharam ou puladas", true],
            ["Clonar o job e disparar uma nova execução completa, comparando os resultados manualmente", false],
            ["Editar a tarefa 6 para marcá-la como opcional, permitindo que as tarefas 7 e 8 rodem sem ela", false],
            ["Aguardar a próxima execução agendada, mantendo a execução com falha registrada no histórico", false],
        ],
    },
    {
        statement:
            "Uma tarefa Spark falha com um executor perdido por falta de memória (OutOfMemoryError) em apenas um dos workers. O engenheiro já confirmou, pelo event log do cluster, que não houve remoção de instância spot nem perda de nó por parte do provedor de nuvem. Onde ele deve procurar o stack trace exato e os detalhes de alocação de memória que causaram a falha?",
        explanation:
            "Os detalhes finos da falha, como o stack trace exato e a alocação de memória que levou ao OutOfMemoryError, ficam nos logs stderr do executor específico, acessíveis pela aba Executors da Spark UI daquele cluster. O log do driver concentra a orquestração do job e as exceções resumidas propagadas dos executores, sem o mesmo nível de detalhe por executor. A aba Output da execução do job mostra apenas a saída do lado do driver, como prints e resultados de células. system.access.audit registra ações administrativas e de acesso, não stack traces de tarefas Spark.",
        topic: "Debugging - logs de driver e executor",
        options: [
            ["Nos logs stderr do executor específico, pela aba Executors da Spark UI daquele cluster", true],
            ["No log do driver, que concentra o stack trace completo de qualquer exceção de qualquer executor", false],
            ["Na aba Output da execução do job, que combina o conteúdo dos logs de driver e executor", false],
            ["Em system.access.audit, que registra os erros de execução de cada tarefa Spark", false],
        ],
    },
    {
        statement:
            "Depois de implantar um Automation Bundle no target prod com databricks bundle deploy --target prod, um engenheiro quer disparar agora mesmo uma execução avulsa do job ingestao_diaria definido nesse bundle, sem esperar a próxima agenda e sem abrir a interface web. Qual comando do Databricks CLI faz isso?",
        explanation:
            "databricks bundle run ingestao_diaria --target prod dispara uma execução avulsa do job já implantado naquele target, direto pela linha de comando. databricks bundle deploy apenas publica ou atualiza a definição dos recursos, sem disparar uma execução. databricks bundle validate somente confere a configuração localmente. databricks bundle summary apenas exibe informações sobre os recursos já implantados, sem disparar nada.",
        topic: "Databricks CLI - bundle run",
        options: [
            ["databricks bundle run ingestao_diaria --target prod", true],
            ["databricks bundle deploy ingestao_diaria --target prod", false],
            ["databricks bundle validate ingestao_diaria --target prod", false],
            ["databricks bundle summary ingestao_diaria --target prod", false],
        ],
    },
    {
        statement:
            "Uma equipe quer testar automaticamente, em um pipeline de CI a cada pull request, as funções de transformação PySpark de um projeto de dados, com feedback rápido e sem subir um cluster de job a cada execução dos testes. Quais práticas atendem esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "Extrair a lógica de transformação para funções Python puras, que recebem e retornam DataFrames desacopladas do notebook, torna essa lógica testável isoladamente. Usar nos testes uma SparkSession local, criada por um framework como pytest, permite comparar o DataFrame resultante com o esperado sem depender de um cluster de job. Testar apenas manualmente no notebook do workspace não é automatizável em um pipeline de CI. A política de retry da tarefa só ajuda com falhas transitórias, não revela erros de lógica de transformação. Observar métricas de linhas processadas no event log de produção é verificação posterior ao deploy, não um teste unitário anterior ao merge.",
        topic: "Teste unitário de transformações",
        options: [
            ["Extrair a lógica de transformação para funções Python puras, que recebem e retornam DataFrames", true],
            ["Usar nos testes uma SparkSession local, via um framework como pytest, comparando o DataFrame obtido com o esperado", true],
            ["Testar apenas manualmente, rodando a tarefa inteira no notebook do workspace antes de cada merge", false],
            ["Confiar na política de retry automático da tarefa para revelar erros de lógica de transformação", false],
            ["Validar a transformação apenas observando as métricas de linhas processadas no event log em produção", false],
        ],
    },
    {
        statement:
            "A tabela rh.folha.salarios tem as colunas salario e departamento, e cada departamento corresponde a um grupo de mesmo nome no Unity Catalog (financeiro, rh, comercial etc.). A regra deve liberar o salário real apenas para quem pertence ao grupo do MESMO departamento daquela linha, retornando NULL nas demais linhas, mas mantendo a linha sempre visível. Como a function de column mask deve ser escrita e aplicada para atender essa regra, que depende dinamicamente do valor de outra coluna da própria linha?",
        explanation:
            "O Unity Catalog permite que uma function de column mask receba, além do valor da coluna mascarada, colunas adicionais da mesma linha como parâmetros, declaradas na cláusula USING COLUMNS do ALTER TABLE ... ALTER COLUMN ... SET MASK. Isso possibilita lógica dinâmica, como chamar is_account_group_member(departamento) usando o próprio valor da linha como nome do grupo a verificar, em vez de um grupo fixo no código da function. Uma function sem esse parâmetro adicional não tem acesso ao departamento da linha e só consegue checar um grupo fixo, o que não atende departamentos diferentes com a mesma lógica. Row filter é um mecanismo distinto, que oculta linhas inteiras em vez de substituir o valor de uma coluna, por isso não atende um requisito que exige a linha sempre visível com o dado apenas mascarado.",
        topic: "Column masking com parâmetros adicionais",
        options: [
            ["A function deve receber apenas o salário como parâmetro, comparando internamente com is_account_group_member('rh'), sem precisar da coluna departamento.", false],
            ["A function deve ser aplicada com ALTER TABLE ... SET ROW FILTER, verificando is_account_group_member(departamento) para ocultar linhas de outros departamentos.", false],
            ["A function deve receber departamento como parâmetro adicional e chamar is_account_group_member(departamento) dentro dela, aplicada com SET MASK mascara_salario USING COLUMNS (departamento).", true],
            ["A function deve ser criada sem parâmetros e aplicada com SET MASK, pois is_account_group_member() já enxerga automaticamente todas as colunas da linha atual sem recebê-las explicitamente.", false],
        ],
    },
    {
        statement:
            "A tabela comercial.clientes_globais precisa, ao mesmo tempo, ocultar linhas de clientes de países diferentes do país do usuário logado E mascarar o CPF para qualquer usuário fora da equipe de compliance, sem duplicar a tabela em views. É possível aplicar simultaneamente um row filter e um column mask na mesma tabela do Unity Catalog para atender as duas regras?",
        explanation:
            "Row filter e column mask são mecanismos independentes do Unity Catalog e podem ser combinados livremente na mesma tabela: o row filter controla quais linhas cada usuário enxerga, enquanto o column mask controla o valor exibido de uma coluna nas linhas que permanecerem visíveis. Não há limite de um mecanismo por tabela, nem exigência de que a coluna mascarada seja a mesma usada no filtro de linhas. Criar uma view intermediária seria um esforço desnecessário, já que os dois recursos se aplicam diretamente com ALTER TABLE na própria tabela, sem duplicar dados.",
        topic: "Row filter e column mask combinados",
        options: [
            ["Sim, os dois mecanismos são independentes e podem ser combinados na mesma tabela, um controlando linhas e o outro, o valor da coluna.", true],
            ["Não, o Unity Catalog aceita apenas um dos dois mecanismos por tabela, sendo necessário escolher entre ocultar linhas ou mascarar uma coluna.", false],
            ["Sim, mas somente se a coluna mascarada pelo column mask for a mesma usada como critério do row filter, caso contrário a combinação é rejeitada.", false],
            ["Não, é preciso criar uma view sobre a tabela com o row filter aplicado e, só então, um column mask separado sobre essa view.", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados mantém centenas de tabelas com uma coluna regiao, e precisa que cada usuário veja apenas linhas da sua própria região em TODAS elas, atuais e futuras, sem criar uma function de row filter e um ALTER TABLE para cada tabela individualmente. Qual abordagem do Unity Catalog atende essa exigência com o menor esforço operacional contínuo?",
        explanation:
            "ABAC (attribute-based access control) permite definir uma policy baseada em um atributo comum, como uma tag aplicada às colunas de regiao, e essa policy passa a ser aplicada automaticamente como row filter em qualquer tabela marcada com a tag, inclusive tabelas criadas depois da policy existir, sem precisar de uma function e um ALTER TABLE por tabela. Repetir manualmente a criação e aplicação de uma function de row filter em cada tabela existente não cobre tabelas futuras e exige manutenção contínua. Não existe um DENY global no metastore condicionado a filtros de consulta, e consolidar tabelas em uma view com UNION ALL não aplica a regra às tabelas originais nem inclui automaticamente tabelas novas.",
        topic: "ABAC aplicado a row filters em escala",
        options: [
            ["Criar uma única function de row filter e aplicá-la manualmente com ALTER TABLE em cada tabela existente, repetindo o processo sempre que uma tabela nova surgir.", false],
            ["Definir uma policy de ABAC baseada em uma tag comum às colunas de regiao, aplicada automaticamente como row filter em qualquer tabela marcada, presente ou futura.", true],
            ["Marcar as colunas de regiao com uma tag e configurar um DENY global no metastore para consultas que não filtrem por região explicitamente.", false],
            ["Criar uma view consolidada com UNION ALL de todas as tabelas e aplicar um único row filter apenas nessa view.", false],
        ],
    },
    {
        statement:
            "Uma tabela com deletion vectors habilitados recebe uma solicitação de exclusão definitiva de um titular de dados. O engenheiro já rodou DELETE FROM tabela WHERE id = X e confirma que a linha não aparece mais em nenhum SELECT. A área jurídica exige, porém, remoção FÍSICA dos dados nos arquivos, não apenas ocultação lógica. Quais DUAS ações são necessárias para atender essa exigência? (Selecione DUAS opções.)",
        explanation:
            "Com deletion vectors habilitados, um DELETE marca as linhas como removidas em um arquivo auxiliar, sem reescrever imediatamente os arquivos de dados Parquet, então o valor original ainda existe fisicamente nesses arquivos. REORG TABLE ... APPLY (PURGE) reescreve os arquivos afetados removendo de fato as linhas marcadas pelos deletion vectors. Como o REORG gera novas versões de arquivo e as antigas continuam disponíveis para time travel, um VACUUM após o período de retenção é necessário para remover essas versões antigas, que ainda contêm os dados originais. TRUNCATE TABLE apaga a tabela inteira, não só as linhas do titular. Desabilitar a propriedade de deletion vectors não reescreve nem apaga retroativamente dados já marcados como removidos.",
        topic: "Retenção e purga com deletion vectors",
        options: [
            ["Executar REORG TABLE tabela APPLY (PURGE), reescrevendo os arquivos de dados para remover as linhas marcadas pelos deletion vectors.", true],
            ["Considerar o processo concluído após o DELETE, já que a linha some das consultas correntes assim que o comando termina.", false],
            ["Executar VACUUM na tabela após o período de retenção, removendo as versões de arquivo antigas que ainda contêm as linhas apagadas.", true],
            ["Executar TRUNCATE TABLE tabela, que remove apenas as linhas apagadas recentemente, preservando o restante dos dados.", false],
            ["Desabilitar deletion vectors com ALTER TABLE ... SET TBLPROPERTIES, apagando retroativamente as linhas já marcadas como removidas.", false],
        ],
    },
    {
        statement:
            "A tabela comercial.clientes tem Change Data Feed habilitado há meses, alimentando um pipeline downstream. Uma solicitação de exclusão remove um cliente com DELETE FROM comercial.clientes WHERE id = X, e o engenheiro confirma que o cliente some de um SELECT * FROM comercial.clientes. Ele pode considerar o dado desse cliente totalmente eliminado da tabela apenas com esse DELETE?",
        explanation:
            "Enquanto o Change Data Feed estiver habilitado, o valor anterior de uma linha apagada ou atualizada fica registrado em arquivos de change data próprios, consultados por table_changes() e por consumidores downstream, e esses arquivos seguem sujeitos à mesma janela de retenção e ao VACUUM que os demais arquivos da tabela. Um DELETE remove a linha da versão corrente da tabela, mas o valor anterior pode continuar acessível via CDF até que esses arquivos de change data envelheçam e sejam removidos por um VACUUM. O Change Data Feed não bloqueia fisicamente operações de escrita, e a presença ou ausência de deletion vectors não é a causa dessa persistência nem faz o CDF reter dados indefinidamente.",
        topic: "Change Data Feed e retenção de PII",
        options: [
            ["Sim, o DELETE remove a linha de todos os arquivos internos da tabela, incluindo os arquivos de change data do Change Data Feed, de forma imediata.", false],
            ["Não, o Change Data Feed impede fisicamente a execução do DELETE, sendo necessário desabilitar delta.enableChangeDataFeed antes.", false],
            ["Sim, desde que a tabela não tenha deletion vectors habilitados, caso contrário o Change Data Feed retém a linha indefinidamente.", false],
            ["Não, o valor anterior da linha pode continuar nos arquivos de change data do CDF até que a janela de retenção expire e um VACUUM os remova.", true],
        ],
    },
    {
        statement:
            "Uma empresa multi-tenant isola os dados de cada cliente corporativo em um storage account próprio, registrado como um External Location distinto no Unity Catalog. Ao encerrar o contrato de um desses clientes, a área de segurança precisa garantir que os dados dele se tornem irrecuperáveis de forma imediata, sem depender da janela de retenção do Delta Lake nem de rodar VACUUM tabela por tabela. Qual abordagem atende essa exigência?",
        explanation:
            "Configurar uma customer-managed key exclusiva para o storage desse cliente permite que, ao revogar ou destruir essa chave no momento do encerramento do contrato, todo o conteúdo criptografado nesse local se torne irrecuperável de imediato, técnica conhecida como crypto-shredding, sem depender de retenção do Delta Lake nem de VACUUM tabela por tabela. Rodar VACUUM com retenção zero ainda depende de processar cada tabela individualmente e não afeta nenhum arquivo fora do controle do Delta Lake. DROP TABLE remove o registro no metastore, mas em tabelas external não apaga os arquivos, e mesmo em tabelas managed não envolve nenhuma criptografia. Desabilitar a governança do Unity Catalog sobre o external location não altera a criptografia dos arquivos armazenados.",
        topic: "Criptografia com customer-managed keys",
        options: [
            ["Rodar VACUUM RETAIN 0 HOURS em todas as tabelas do cliente, o que remove imediatamente qualquer vestígio dos dados nesse storage.", false],
            ["Configurar uma customer-managed key exclusiva para o storage do cliente e revogar a chave ao fim do contrato, tornando os dados ilegíveis.", true],
            ["Aplicar DROP TABLE em cada tabela do cliente, apagando de forma imediata e irreversível os arquivos correspondentes no storage account.", false],
            ["Desabilitar o Unity Catalog nesse External Location, o que revoga automaticamente a criptografia de todos os arquivos armazenados nele.", false],
        ],
    },
    {
        statement:
            "A área de segurança quer que as credenciais usadas por um pipeline no Databricks sejam geridas e rotacionadas centralmente no Azure Key Vault da empresa, sem manter uma cópia separada do valor do segredo dentro do Databricks. Qual configuração de secret scope atende essa exigência?",
        explanation:
            "Um secret scope do tipo Azure Key Vault-backed referencia os segredos diretamente no Key Vault configurado pela empresa, então a rotação e a gestão continuam centralizadas lá, sem duplicar o valor dentro do Databricks. Um secret scope Databricks-backed, ao contrário, armazena os segredos no próprio armazenamento criptografado do Databricks e não sincroniza automaticamente com um Key Vault externo. Não existe um tipo de secret scope nativo com backing em AWS Secrets Manager. Uma variável de ambiente de cluster não é um secret scope governado, e colocar um valor de segredo diretamente nela expõe o valor em texto na configuração do cluster.",
        topic: "Secret scopes: tipos e integração",
        options: [
            ["Um Azure Key Vault-backed secret scope, que referencia os segredos diretamente no Key Vault, sem duplicar o valor dentro do Databricks.", true],
            ["Um Databricks-backed secret scope, que sincroniza automaticamente com o Azure Key Vault a cada rotação de credencial feita na nuvem.", false],
            ["Um secret scope do tipo AWS Secrets Manager-backed, disponível em qualquer workspace Databricks independentemente da nuvem usada.", false],
            ["Uma variável de ambiente definida em Environment Variables do cluster, apontando diretamente para o segredo dentro do Key Vault.", false],
        ],
    },
    {
        statement:
            "Um engenheiro de segurança avalia se a redação automática de segredos do Databricks, que exibe [REDACTED] na saída de células, é suficiente para impedir que um notebook exponha um valor obtido via dbutils.secrets.get. Ele testa um notebook que aplica base64 no valor do segredo antes de exibi-lo com display(). Considerando como essa redação funciona, o que deve acontecer?",
        explanation:
            "A redação automática do Databricks compara a saída da célula com o valor exato do segredo recuperado na sessão e substitui apenas correspondências literais dessa string por [REDACTED]. Assim que o valor passa por uma transformação como base64, a string exibida deixa de coincidir byte a byte com o segredo original, então a saída transformada não é reconhecida nem redigida. Isso significa que a redação de saída não é um controle de segurança suficiente por si só, o controle real continua sendo a ACL do secret scope, que decide quem pode chamar dbutils.secrets.get para aquele segredo. Não existe detecção de encoding reversível nem bloqueio automático de chamadas de encoding após a leitura de um segredo, e dbutils.secrets.get sempre retorna o valor real em texto puro para o código, a máscara se aplica somente à exibição.",
        topic: "Secrets: limite da redação automática",
        options: [
            ["O Databricks decodifica automaticamente transformações reversíveis como base64 antes de comparar, então o resultado também aparece como [REDACTED].", false],
            ["A célula falha com erro de segurança, pois o Databricks bloqueia qualquer chamada de encoding logo após um dbutils.secrets.get na mesma célula.", false],
            ["O valor em base64 aparece sem redação, pois a comparação cobre só correspondência exata da string, e a ACL do secret scope é o controle real.", true],
            ["O valor em base64 aparece sem redação, mas isso é irrelevante, pois dbutils.secrets.get só devolve valores já mascarados ao código, nunca o segredo real.", false],
        ],
    },
    {
        statement:
            "Para anonimizar CPFs antes de liberar uma tabela ao time de analytics, um engenheiro aplica sha2(cpf, 256) na coluna e passa a tratar o resultado como dado anonimizado, sem nenhuma restrição de acesso adicional sobre essa coluna. Do ponto de vista de proteção de dados, esse raciocínio está correto?",
        explanation:
            "CPF tem um formato conhecido e um espaço de valores enumerável, então qualquer pessoa pode pré-calcular o hash sha2 de todos os CPFs possíveis, ou de uma lista de candidatos plausíveis, e comparar com os valores da coluna, reidentificando os titulares por uma tabela de correspondência, mesmo sem acesso à coluna original de CPF. Isso caracteriza pseudonimização, não anonimização, e o hash sozinho não remove esse risco de reidentificação. O fato de sha2 ser irreversível no sentido criptográfico não implica que a saída seja impossível de associar de volta ao valor original quando o espaço de entradas é pequeno o bastante para ser varrido por força bruta. A função sha2 do Databricks SQL não exige nenhuma chave de secret scope para ser executada, e apagar a coluna original de CPF na tabela fonte não impede alguém de gerar novamente os hashes de CPFs candidatos de forma independente.",
        topic: "Anonimização de PII versus pseudonimização",
        options: [
            ["Sim, porque qualquer saída de uma função de hash criptográfico como sha2 é, por definição, irreversível e por isso totalmente anônima.", false],
            ["Não, porque o espaço de valores de CPF é enumerável, permitindo recriar os hashes possíveis e reidentificar a coluna por comparação direta.", true],
            ["Não, porque a função sha2 do Databricks SQL exige uma chave de assinatura cadastrada em um secret scope para poder ser executada.", false],
            ["Sim, desde que a coluna original de CPF seja apagada da tabela fonte logo em seguida, eliminando qualquer vínculo com o valor original.", false],
        ],
    },
    {
        statement:
            "Um engenheiro tem USE CATALOG em vendas, USE SCHEMA em vendas.comercial e CREATE TABLE em vendas.comercial. Ao rodar CREATE TABLE vendas.comercial.pedidos_raw (...) LOCATION 's3://dados-brutos/pedidos/', o comando falha por falta de permissão, mesmo com os privilégios acima já concedidos. O que falta conceder a ele para criar essa tabela external?",
        explanation:
            "Criar uma tabela external, isto é, uma tabela com cláusula LOCATION apontando para um caminho fora do armazenamento gerenciado, exige, além de USE CATALOG, USE SCHEMA e CREATE TABLE no schema, o privilégio CREATE EXTERNAL TABLE concedido no external location ou no storage credential que cobre aquele caminho específico. Sem esse privilégio adicional ligado à cadeia de governança do caminho externo, a criação falha mesmo com os privilégios do schema corretos. Não existe exigência de papel de account admin para essa operação, repetir CREATE TABLE no catálogo não supre a falta do privilégio ligado ao external location, e MODIFY controla operações de escrita como INSERT, UPDATE e DELETE em tabelas já existentes, sem relação com a criação de tabelas novas.",
        topic: "Privilégios para tabelas external",
        options: [
            ["Um papel de account admin atribuído a ele, exigido para qualquer CREATE TABLE que use a cláusula LOCATION.", false],
            ["CREATE TABLE no catálogo vendas, já que o privilégio concedido apenas no schema comercial não é suficiente para nenhum tipo de tabela.", false],
            ["MODIFY no schema comercial, privilégio que libera a criação de tabelas apontando para um caminho de armazenamento externo.", false],
            ["CREATE EXTERNAL TABLE no external location, ou no storage credential, que cobre o caminho informado na cláusula LOCATION.", true],
        ],
    },
    {
        statement:
            "Uma engenheira de dados, owner individual de dezenas de tabelas no catálogo vendas, vai sair da empresa em breve. A área de governança quer evitar que outros usuários e automações percam acesso a essas tabelas quando a conta dela for desativada. Qual prática evita esse problema, aplicada antes da saída dela?",
        explanation:
            "A prática recomendada no Unity Catalog é atribuir a propriedade (ownership) de catálogos, schemas e tabelas a um grupo, em vez de a um usuário individual, assim a saída ou desativação de qualquer integrante do grupo não afeta o ownership dos objetos nem quebra grants e automações associadas. Cada objeto do Unity Catalog tem um único owner por vez, então não existe a possibilidade de dois principals serem owners simultâneos do mesmo objeto. Conceder ALL PRIVILEGES a todos os usuários do catálogo não elimina a necessidade de um owner, que é um papel distinto dos privilégios concedidos via GRANT. Reatribuir o ownership tabela por tabela somente depois do desligamento é reativo, e não evita a janela de risco que a área de governança quer eliminar.",
        topic: "Ownership: boas práticas",
        options: [
            ["Definir um grupo como owner das tabelas, em vez de um usuário individual, para que a saída de um integrante não afete o ownership.", true],
            ["Reatribuir o ownership de cada tabela individualmente com ALTER TABLE ... OWNER TO somente depois que o desligamento dela for efetivado.", false],
            ["Conceder ALL PRIVILEGES a todos os usuários do catálogo vendas, o que elimina a necessidade de um owner específico por tabela.", false],
            ["Adicionar um segundo usuário administrador como owner adicional das tabelas, mantendo os dois como owners simultâneos a partir de agora.", false],
        ],
    },
    {
        statement:
            "A área de segurança precisa descobrir quem executou um DROP TABLE em uma tabela crítica do catálogo financas e em qual workspace da conta isso aconteceu, cobrindo todos os workspaces vinculados ao metastore em uma única consulta SQL, sem exportar logs manualmente de cada workspace. Qual recurso do Unity Catalog atende essa necessidade?",
        explanation:
            "As System Tables de auditoria, no schema system.access, consolidam eventos de todos os workspaces vinculados ao metastore em tabelas Delta comuns, consultáveis com SQL padrão, incluindo colunas que identificam o usuário responsável e o workspace de origem de cada evento. O histórico de uma tabela Delta (DESCRIBE HISTORY) fica no escopo de uma única tabela e não carrega informação de qual workspace originou cada operação. O event log do Lakeflow Spark Declarative Pipelines cobre apenas as operações de um pipeline específico, não operações DDL de todos os workspaces da conta. A aba Lineage do Catalog Explorer mostra dependências de dados entre objetos, não um registro de quem executou uma ação administrativa como DROP TABLE.",
        topic: "System Tables de auditoria",
        options: [
            ["O DESCRIBE HISTORY da tabela financas, que registra o workspace de origem de cada operação DDL executada nela.", false],
            ["As System Tables de auditoria (system.access.audit), que consolidam eventos de todos os workspaces do metastore em uma tabela consultável por SQL.", true],
            ["O event log do Lakeflow Spark Declarative Pipelines associado ao catálogo financas, cobrindo as operações DDL de todos os workspaces da conta.", false],
            ["A aba Lineage do Catalog Explorer para a tabela financas, mostrando o histórico de exclusão e o workspace responsável.", false],
        ],
    },
    {
        statement:
            "Uma empresa tem um metastore do Unity Catalog compartilhado entre o workspace de produção e o workspace de desenvolvimento. A governança quer que o catálogo financas_prod, com dados sensíveis, só possa ser acessado a partir do workspace de produção, mesmo que um usuário com SELECT concedido tente consultá-lo a partir do workspace de desenvolvimento. Qual recurso do Unity Catalog atende essa exigência sem duplicar o catálogo?",
        explanation:
            "Workspace-catalog binding restringe um catálogo a um conjunto específico de workspaces, e essa restrição é avaliada no nível do workspace, antes mesmo dos privilégios do usuário, então mesmo alguém com SELECT válido na tabela não consegue acessá-la a partir de um workspace não vinculado ao catálogo. External location controla o acesso a um caminho de armazenamento por credencial, sem relação com a partir de qual workspace um catálogo pode ser consultado. Revogar USE CATALOG apenas dos grupos hoje associados ao workspace de desenvolvimento depende de manter essa lista de grupos sempre atualizada, e não bloqueia um usuário que futuramente ganhe acesso ao catálogo por outro caminho. Row filter avalia valores de linha ou a identidade do usuário, não existe uma function padrão de row filter que identifique o workspace de origem da consulta.",
        topic: "Catalog-workspace binding",
        options: [
            ["Criar um External Location exclusivo para o workspace de produção e associá-lo ao catálogo financas_prod.", false],
            ["Revogar USE CATALOG do catálogo financas_prod para todos os grupos hoje associados ao workspace de desenvolvimento.", false],
            ["Workspace-catalog binding, restringindo o catálogo financas_prod ao workspace de produção, e a nenhum outro.", true],
            ["Definir um row filter na tabela que verifica o nome do workspace atual antes de liberar qualquer linha.", false],
        ],
    },
    {
        statement:
            "Uma equipe de plataforma quer um painel mostrando, para todas as tabelas do metastore, quais colunas alimentam quais colunas downstream, atualizado automaticamente e sem abrir o Catalog Explorer tabela por tabela. Qual fonte do Unity Catalog permite consultar essa linhagem em escala, via SQL comum?",
        explanation:
            "As System Tables system.access.table_lineage e system.access.column_lineage expõem a linhagem capturada automaticamente pelo Unity Catalog como tabelas Delta comuns, consultáveis com SQL padrão e fáceis de agregar em um painel para o metastore inteiro. O information_schema.columns lista metadados de colunas, como nome e tipo, mas não registra relações de origem e destino entre colunas de tabelas diferentes. Agregar o DESCRIBE HISTORY de cada tabela mostra operações de versionamento do Delta Lake, como inserts e merges, não dependências de coluna entre tabelas, além de não escalar tabela por tabela. Não existe um log de auditoria do DBFS que registre leituras de arquivo Parquet como mecanismo de linhagem lógica entre colunas do Unity Catalog.",
        topic: "Linhagem via System Tables",
        options: [
            ["O information_schema.columns, que lista todas as colunas do metastore junto com a tabela de origem calculada em tempo real.", false],
            ["O DESCRIBE HISTORY de cada tabela, agregado manualmente em uma consulta que percorre todas as tabelas do metastore.", false],
            ["Os logs de auditoria do DBFS, que registram cada leitura de arquivo Parquet subjacente às tabelas Delta do metastore.", false],
            ["As System Tables system.access.table_lineage e system.access.column_lineage, que expõem a linhagem capturada automaticamente.", true],
        ],
    },
    {
        statement:
            "Quais DUAS afirmações sobre tags de objetos no Unity Catalog estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Tags podem ser aplicadas a catálogos, schemas, tabelas, colunas e volumes, e ficam visíveis para consulta via views do information_schema, como table_tags e column_tags, o que viabiliza relatórios de governança por SQL. Tags também podem servir de atributo-base para policies de ABAC, que aplicam automaticamente row filters ou column masks a qualquer objeto marcado com a tag configurada, presente ou futuro. Diferente de privilégios concedidos por GRANT, uma tag aplicada em um catálogo não é herdada automaticamente pelos schemas e tabelas dentro dele, cada objeto carrega suas próprias tags. Tags são metadados de classificação e não substituem o GRANT como mecanismo de controle de acesso, e podem ser aplicadas tanto a uma tabela inteira quanto a uma coluna individual dela.",
        topic: "Tags e information_schema",
        options: [
            ["Uma tag aplicada em um catálogo é herdada automaticamente por todos os schemas e tabelas dentro dele, do mesmo jeito que um GRANT.", false],
            ["Tags podem ser aplicadas em catálogos, schemas, tabelas e colunas, e ficam consultáveis via views do information_schema, como table_tags e column_tags.", true],
            ["Tags substituem o GRANT tradicional, controlando diretamente quem tem SELECT concedido em uma tabela.", false],
            ["Tags podem servir de base para policies de ABAC, aplicando automaticamente row filters ou column masks a qualquer objeto marcado com a tag.", true],
            ["Tags só podem ser aplicadas no nível de tabela inteira, nunca em uma coluna individual dela.", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados quer disponibilizar uma tabela gold para analistas de um parceiro que não possui workspace Databricks nem Unity Catalog, e que pretendem consumir os dados via pandas e Power BI. Qual abordagem de Delta Sharing atende esse cenário sem exigir que o parceiro adote a plataforma Databricks?",
        explanation:
            "O recipient aberto (open, também chamado D2O) é o tipo de Delta Sharing pensado para quem não tem Databricks nem Unity Catalog: o provedor gera um link de ativação que o parceiro usa uma única vez para baixar um arquivo de credencial e consultar o share com qualquer cliente compatível com o protocolo Delta Sharing, como pandas ou o conector do Power BI. Já o recipient Databricks-to-Databricks exige que o parceiro tenha seu próprio metastore do Unity Catalog para montar o share como catálogo, o que não se aplica aqui. Lakehouse Federation resolve o problema inverso, consultar uma fonte externa a partir do Databricks, e conceder acesso direto ao armazenamento em nuvem contorna a governança do Unity Catalog.",
        topic: "Delta Sharing Open (D2O)",
        options: [
            ["Criar um share e adicionar o parceiro como recipient Databricks-to-Databricks, identificado pelo metastore do Unity Catalog dele, para montar o share como catálogo.", false],
            ["Criar um share e adicionar o parceiro como recipient aberto (open), que recebe um link de ativação para gerar a credencial e conectar via cliente Delta Sharing.", true],
            ["Configurar uma connection de Lakehouse Federation apontando para o ambiente do parceiro e expor a tabela gold como catálogo externo.", false],
            ["Conceder acesso direto ao parceiro na conta de armazenamento em nuvem que hospeda os arquivos Delta da tabela gold.", false],
        ],
    },
    {
        statement:
            "Uma unidade de negócio irmã, que também usa Databricks com seu próprio metastore do Unity Catalog, precisa de acesso contínuo e governado a uma tabela gold do provedor, incluindo auditoria via Unity Catalog, sem que os dados sejam copiados para o armazenamento da unidade que recebe. Qual configuração de Delta Sharing atende esse requisito?",
        explanation:
            "O recipient Databricks-to-Databricks (D2D) é identificado pelo metastore do Unity Catalog do destinatário, que monta o share como um catálogo somente leitura em seu próprio ambiente. As consultas rodam com o compute da unidade que recebe, lendo diretamente do armazenamento do provedor sem copiar os dados, e ficam sujeitas à governança e à auditoria do Unity Catalog dos dois lados. O recipient aberto é para quem não tem Unity Catalog, o que não é o caso aqui. Lakehouse Federation serve para consultar fontes externas ao Databricks, não para consumir um share. E descrever o D2D como replicação contínua para o armazenamento de quem recebe está errado: essa cópia física não acontece nesse modelo.",
        topic: "Delta Sharing D2D",
        options: [
            ["Adicionar a unidade irmã como recipient aberto (open), gerando um link de ativação para baixar a credencial e consultar via cliente Delta Sharing.", false],
            ["Configurar uma connection de Lakehouse Federation no workspace da unidade irmã apontando para o catálogo Unity Catalog do provedor como fonte externa.", false],
            ["Adicionar a unidade irmã como recipient Databricks-to-Databricks, montando o share como catálogo somente leitura e consultando com o próprio compute.", true],
            ["Adicionar a unidade irmã como recipient Databricks-to-Databricks e habilitar replicação contínua da tabela para o armazenamento da unidade irmã.", false],
        ],
    },
    {
        statement:
            "Um provedor de dados publica em um share a tabela fato de vendas, um volume com anexos de nota fiscal e um notebook de onboarding para o parceiro. Agora o time de governança quer que o parceiro veja apenas as linhas da região Sul da tabela de vendas, sem duplicar fisicamente os dados nem manter um pipeline paralelo. Qual abordagem resolve isso dentro do próprio Delta Sharing?",
        explanation:
            "Delta Sharing permite adicionar views ao share no lugar de tabelas, e uma view pode usar a função current_recipient() para filtrar linhas de acordo com quem está consultando, aplicando a regra uma única vez, de forma centralizada, sem duplicar dados nem manter pipeline paralelo algum. O deep clone resolveria o filtro, mas exige manter uma cópia física sincronizada, o que o enunciado descarta. Confiar que o parceiro filtre no lado do cliente não restringe nada de fato, já que a tabela inteira continua acessível. E o Change Data Feed serve para propagar mudanças incrementais, não para restringir linhas por conteúdo.",
        topic: "Ativos Compartilháveis no Delta Sharing",
        options: [
            ["Substituir a tabela por uma view que filtra as linhas pela região com current_recipient() e adicionar essa view ao share no lugar da tabela.", true],
            ["Criar um deep clone da tabela somente com as linhas da região Sul e adicionar o clone ao share, mantendo-o sincronizado por um job agendado.", false],
            ["Adicionar a tabela original ao share e orientar o parceiro a aplicar o filtro de região nas consultas feitas pelo cliente Delta Sharing.", false],
            ["Ativar o Change Data Feed na tabela e instruir o parceiro a descartar as linhas de outras regiões ao processar o feed incremental.", false],
        ],
    },
    {
        statement:
            "Um analista de dados precisa investigar, de forma pontual, inconsistências entre pedidos registrados no Databricks e o status de pagamento armazenado em um banco PostgreSQL operacional, sem construir um pipeline de ingestão só para essa investigação pontual. Qual recurso permite consultar as tabelas do PostgreSQL diretamente a partir de um catálogo do Unity Catalog, sem copiar os dados para o Delta Lake?",
        explanation:
            "Lakehouse Federation permite registrar uma connection apontando para um sistema externo, como PostgreSQL, e criar um foreign catalog que expõe as tabelas remotas como objetos consultáveis dentro do Unity Catalog, sem mover ou copiar os dados. Delta Sharing não se aplica aqui porque o PostgreSQL não é um provedor do protocolo Delta Sharing. Auto Loader lê arquivos incrementalmente a partir de armazenamento em nuvem e não tem suporte a conexões JDBC com bancos operacionais. E o Lakeflow Connect é voltado a ingestão, replicando os dados para uma tabela Delta, o que contraria a necessidade de não copiar os dados para uma investigação pontual.",
        topic: "Lakehouse Federation",
        options: [
            ["Delta Sharing D2D, criando um share diretamente no PostgreSQL e adicionando o Databricks como recipient para ler as tabelas remotamente.", false],
            ["Auto Loader configurado com o formato JDBC para ler incrementalmente as tabelas do PostgreSQL a cada novo arquivo detectado no banco.", false],
            ["Lakeflow Connect com um conector gerenciado que replica continuamente as tabelas do PostgreSQL para uma tabela Delta dentro do catálogo.", false],
            ["Lakehouse Federation, com uma connection para o PostgreSQL e um foreign catalog que expõe as tabelas do banco como objetos consultáveis.", true],
        ],
    },
    {
        statement:
            "Uma equipe de plataforma está definindo diretrizes internas sobre quando usar Lakehouse Federation e quando construir um pipeline de ingestão para trazer dados de sistemas externos ao Delta Lake. Quais DUAS afirmações devem constar nessa diretriz? (Selecione DUAS opções.)",
        explanation:
            "Lakehouse Federation é indicada para acesso exploratório, ad hoc ou de baixo volume a uma fonte externa, evitando o custo de manter um pipeline dedicado só para isso. Quando o volume de consultas é alto ou os mesmos dados são reutilizados com frequência, ingerir para o Delta Lake costuma compensar mais, já que passa a se beneficiar de cache, Liquid Clustering e das demais otimizações do Delta Lake. As consultas federadas continuam dependendo de conectividade com o sistema de origem a cada execução, as tabelas de um foreign catalog permanecem como referências externas, não viram tabelas gerenciadas Delta, e o caminho até a fonte remota costuma deixar a consulta federada mais lenta, não mais rápida, do que consultar dados já ingeridos.",
        topic: "Federation vs Ingestão",
        options: [
            ["A Lakehouse Federation elimina a necessidade de conectividade contínua com o sistema de origem, pois os metadados bastam para responder às consultas.", false],
            ["Lakehouse Federation é adequada para consultas exploratórias ou de baixo volume, quando não compensa manter um pipeline só para acessar a fonte externa.", true],
            ["Depois que um foreign catalog é criado, as tabelas que ele expõe passam a ser tabelas gerenciadas Delta dentro do Unity Catalog automaticamente.", false],
            ["Cargas com alto volume de consultas ou reuso frequente do mesmo dado se beneficiam mais da ingestão para o Delta Lake, com cache e Liquid Clustering.", true],
            ["Consultas federadas sempre executam mais rápido que consultas em tabelas Delta já ingeridas, pois eliminam a etapa de escrita no Delta Lake.", false],
        ],
    },
    {
        statement:
            "Uma pipeline usa Auto Loader para ingerir eventos JSON brutos de um bucket, gravando-os em uma tabela que preserva a estrutura original do payload e adiciona apenas colunas técnicas de auditoria, como o momento da ingestão e a coluna _rescued_data, sem aplicar deduplicação ou regras de negócio. Em qual camada da arquitetura medallion essa tabela se encaixa e por quê?",
        explanation:
            "A camada bronze existe justamente para reter os dados brutos com a maior fidelidade possível ao formato de origem, servindo como fonte reprocessável caso as regras de transformação mudem no futuro. Colunas puramente técnicas, como o timestamp de ingestão e a _rescued_data, não configuram limpeza nem padronização de negócio, então a tabela não avança para silver. Ela também não está pronta para consumo direto em BI, o que é papel da gold. E manter tabelas brutas versionadas em Delta Lake é justamente a prática recomendada na camada bronze, não o oposto.",
        topic: "Arquitetura Medallion",
        options: [
            ["Silver, porque a adição de colunas de auditoria já caracteriza uma etapa de padronização aplicada aos dados brutos.", false],
            ["Bronze, porque preserva a fidelidade dos dados brutos como fonte reprocessável para as camadas seguintes.", true],
            ["Gold, porque a tabela está pronta para ser consumida diretamente por ferramentas de BI sem processamento adicional.", false],
            ["Nenhuma camada específica, pois tabelas de ingestão bruta não devem ser persistidas como tabelas Delta no lakehouse.", false],
        ],
    },
    {
        statement:
            "Uma pipeline recebe eventos de alteração cadastral de clientes via Kafka, que podem chegar fora de ordem devido a reprocessamentos no producer. A tabela dimensão é mantida com AUTO CDC configurado com stored_as_scd_type igual a 2. Qual coluna deve alimentar o parâmetro sequence_by para garantir que o histórico da SCD tipo 2 reflita a ordem real dos eventos de negócio?",
        explanation:
            "O sequence_by do AUTO CDC precisa refletir a ordem real dos eventos de negócio, tipicamente um event time vindo da origem, para que as mudanças sejam aplicadas na sequência correta mesmo quando chegam fora de ordem por causa de reprocessamentos. Usar o timestamp de ingestão captura apenas a ordem de chegada no pipeline, que pode divergir da ordem real quando há reprocessamento. O parâmetro keys identifica a entidade, o cliente, não a ordem das mudanças, e a ordem de execução das tasks de um Lakeflow Job não tem relação com a ordenação de eventos dentro do AUTO CDC.",
        topic: "SCD Tipo 2 com AUTO CDC",
        options: [
            ["O timestamp de ingestão atribuído pelo Auto Loader no momento em que o registro chega ao pipeline.", false],
            ["A chave primária da dimensão definida no parâmetro keys do AUTO CDC, que já identifica cada cliente de forma única.", false],
            ["A ordem de execução das tasks configurada no Lakeflow Job que orquestra a pipeline de dimensão.", false],
            ["Uma coluna com o momento do evento na origem (event time), e não o horário de chegada no pipeline.", true],
        ],
    },
    {
        statement:
            "Um objeto na camada gold calcula o valor total histórico por cliente (customer lifetime value), unindo uma tabela fato que cresce continuamente com duas dimensões que mudam ao longo do tempo. O padrão de agregação usado na consulta não pode ser mantido de forma incremental pelo motor do Lakeflow Spark Declarative Pipelines. Que tipo de objeto está sendo usado e qual a implicação operacional disso?",
        explanation:
            "Materialized views no Lakeflow Spark Declarative Pipelines são atualizadas de forma incremental sempre que o motor consegue calcular a diferença a partir das mudanças de origem, mas quando o padrão da consulta, como esse cálculo de valor histórico por cliente cruzando fato e dimensões variáveis, não permite manutenção incremental, a atualização pode recomputar a saída inteira. Uma streaming table não serviria bem aqui: joins em streaming table não recalculam quando as dimensões mudam, o que comprometeria a correção do valor histórico por cliente ao longo do tempo. Não existe uma variação de streaming table baseada em foreachBatch que elimine recomputação por definição, e materialized views não garantem atualização incremental para qualquer formato de consulta.",
        topic: "Streaming Table vs Materialized View",
        options: [
            ["É uma materialized view com consulta não incrementalizável, então a atualização pode recomputar integralmente a saída em vez de só as linhas novas.", true],
            ["É uma streaming table, então apenas as linhas novas da tabela fato são processadas a cada atualização, independente do padrão de agregação usado.", false],
            ["É uma streaming table baseada em foreachBatch, cujos checkpoints eliminam a necessidade de qualquer recomputação futura.", false],
            ["É uma materialized view, e o Lakeflow Spark Declarative Pipelines sempre garante atualização incremental independente do formato da consulta.", false],
        ],
    },
    {
        statement:
            "Uma tabela de histórico de clientes é mantida por AUTO CDC como SCD tipo 2, com as colunas de controle de vigência geradas automaticamente pelo próprio AUTO CDC. Como identity columns não são suportadas na tabela alvo do AUTO CDC, o time cria uma streaming table separada, que lê essa tabela de histórico e adiciona uma IDENTITY COLUMN só para gerar a chave substituta (surrogate key) usada nos joins com a tabela fato. Qual comportamento das identity columns do Delta Lake a lógica downstream precisa considerar?",
        explanation:
            "Identity columns no Delta Lake geram valores únicos e crescentes, mas não garantem uma sequência sem lacunas, já que a geração pode pular valores dependendo do estado da tabela, então nenhuma lógica de negócio deve depender de IDs contíguos. Identity columns não são suportadas em tabelas que são alvo de processamento AUTO CDC, por isso a chave substituta precisa ser gerada numa streaming table separada, como no cenário descrito, e a Databricks recomenda usá-las só em streaming tables dentro de pipelines. Elas funcionam normalmente em tabelas gerenciadas dentro do namespace de três níveis do Unity Catalog, e os valores já atribuídos a uma linha não são recalculados nas atualizações incrementais seguintes.",
        topic: "Surrogate Keys com Identity Column",
        options: [
            ["Os valores gerados garantem sequência sem lacunas, mesmo com gravações concorrentes na streaming table, o que permite tratá-los como um contador denso.", false],
            ["Identity columns só podem ser definidas em tabelas gerenciadas fora do Unity Catalog, sem namespace de três níveis.", false],
            ["Os valores gerados são crescentes, mas sem garantia de sequência contínua, e nenhuma lógica deve presumir IDs contíguos.", true],
            ["Os valores já atribuídos a uma linha são recalculados a cada atualização incremental da streaming table, para manter a sequência compacta.", false],
        ],
    },
    {
        statement:
            "O time de modelagem está revisando as diretrizes de design para tabelas fato e dimensão na camada gold de um lakehouse consumido por ferramentas de BI. Quais DUAS afirmações são práticas recomendadas nesse contexto? (Selecione DUAS opções.)",
        explanation:
            "Definir a granularidade da tabela fato antes de tudo evita agregações incorretas, já que toda medida e toda chave estrangeira precisam ser consistentes com o que uma linha representa. Na camada gold, um esquema estrela com dimensões mais desnormalizadas reduz o número de joins que as ferramentas de BI precisam executar, o que tende a ajudar o desempenho em Spark e Photon, ao contrário do que a opção sobre snowflake afirma. Substituir chaves estrangeiras por atributos descritivos soltos na fato quebra a reutilização das dimensões conformadas, e mudar a granularidade da fato entre versões invalida as agregações que já existem downstream, então nenhuma das duas é uma prática recomendada.",
        topic: "Modelagem Dimensional e Desnormalização",
        options: [
            ["Preferir dimensões totalmente normalizadas (snowflake) na camada gold, pois Spark e Photon têm melhor desempenho em muitos joins pequenos do que em tabelas largas.", false],
            ["Armazenar atributos descritivos diretamente na tabela fato no lugar de chaves estrangeiras para as dimensões, eliminando joins por completo na consulta.", false],
            ["Definir explicitamente a granularidade da tabela fato (o que representa uma linha) antes de adicionar medidas e chaves estrangeiras, evitando agregações incorretas.", true],
            ["Tratar a granularidade da tabela fato como algo alterável livremente entre versões, sem impacto nas agregações já existentes downstream.", false],
            ["Favorecer um esquema estrela, com dimensões mais desnormalizadas, reduzindo o número de joins exigidos pelas consultas de BI frente a um esquema normalizado.", true],
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
                name: "Databricks Certified Data Engineer Professional",
                provider: "databricks",
                code: "Databricks DE Professional",
                level: "Professional",
                description: "Simulado no formato do exame Databricks Certified Data Engineer Professional: 120 minutos, 59 questoes por tentativa, corte de 70%. Nivel avancado, cobrindo desenvolvimento de codigo (Python/SQL), ingestao, transformacao e qualidade, compartilhamento e federacao, monitoramento e alertas, otimizacao de custo e desempenho, seguranca e conformidade, governanca, debugging e deploy, e modelagem de dados. Delta Lake avancado (CDF, deletion vectors), Structured Streaming e Lakeflow Spark Declarative Pipelines. Nomenclatura Lakeflow atual.",
                durationMinutes: 120,
                questionCount: 59,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    await db
        .update(simulados)
        .set({ provider: "databricks", code: "Databricks DE Professional", level: "Professional" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) { console.log(`Simulado ja tem ${n} questoes, nada a fazer.`); return; }

    for (let i = 0; i < QUESTOES.length; i++) {
        const q = QUESTOES[i];
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({ simuladoId: simulado.id, statement: q.statement, explanation: q.explanation, topic: q.topic })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], idx) => ({ questionId: questao.id, text, isCorrect, position: idx + 1 })),
        );
    }
    console.log(`Seed concluido: ${QUESTOES.length} questoes inseridas.`);
}

seed().then(() => process.exit(0)).catch((e) => { console.error("Falha no seed:", e); process.exit(1); });
