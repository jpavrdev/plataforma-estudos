// Seed do simulado AWS Certified AI Practitioner (AIF-C01). Questões autorais,
// escritas para ensinar os conceitos dos 5 domínios do exame (não reproduzem a prova real).
// Idempotente: se o simulado já tiver questões, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-aif-c01.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node --env-file=.env.prod scripts/seed-aif-c01.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "aws-ai-practitioner";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    // ===================== Domínio 1: Fundamentos de IA e ML =====================
    {
        statement:
            "Uma equipe apresenta machine learning para a liderança. Qual afirmação define corretamente a relação entre inteligência artificial (IA), machine learning (ML) e deep learning?",
        explanation:
            "IA é o campo mais amplo; ML é um subconjunto da IA que aprende padrões a partir de dados; deep learning é um subconjunto do ML baseado em redes neurais profundas. A hierarquia é IA contém ML, que contém deep learning.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Machine learning é um subcampo da IA, e deep learning é um subcampo do machine learning que usa redes neurais",
                true,
            ],
            [
                "Deep learning e machine learning são sinônimos, e ambos englobam a inteligência artificial como caso particular",
                false,
            ],
            [
                "Inteligência artificial é um subcampo do machine learning voltado apenas a redes neurais profundas",
                false,
            ],
            [
                "Machine learning e inteligência artificial são áreas independentes, sem qualquer sobreposição de técnicas",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco quer treinar um modelo para prever se uma transação é fraudulenta usando um histórico já rotulado como 'fraude' ou 'legítima'. Que tipo de aprendizado esse cenário representa?",
        explanation:
            "Rótulos conhecidos ('fraude'/'legítima') caracterizam aprendizado supervisionado. Sem rótulos seria não supervisionado; recompensas por tentativa e erro seriam aprendizado por reforço.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aprendizado supervisionado, porque o modelo treina com exemplos que já possuem o rótulo correto",
                true,
            ],
            [
                "Aprendizado não supervisionado, porque o modelo agrupa as transações sem usar nenhum rótulo",
                false,
            ],
            [
                "Aprendizado por reforço, porque o modelo recebe recompensas a cada acerto durante a produção",
                false,
            ],
            [
                "Aprendizado auto-supervisionado, porque o modelo cria os próprios rótulos a partir do texto",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma varejista tem milhões de clientes sem categoria definida e quer descobrir grupos de perfis de compra semelhantes para campanhas. Qual abordagem de ML se encaixa melhor?",
        explanation:
            "Descobrir grupos sem categorias pré-definidas é clustering (não supervisionado). Regressão prevê números; classificação exige classes conhecidas; detecção de anomalias foca em outliers, não em segmentar toda a base.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Clustering, uma técnica não supervisionada que agrupa dados por semelhança sem rótulos prévios",
                true,
            ],
            [
                "Regressão linear, que prevê um valor numérico contínuo a partir das variáveis de entrada",
                false,
            ],
            [
                "Classificação binária, que atribui cada cliente a uma de duas classes já conhecidas",
                false,
            ],
            [
                "Detecção de anomalias, que sinaliza apenas os registros muito fora do padrão esperado",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma imobiliária quer estimar o preço de venda de um imóvel (um valor em reais) a partir de área, localização e número de quartos. Que tipo de problema de ML é esse?",
        explanation:
            "Prever um valor contínuo (preço) é regressão. Classificação produz categorias; clustering agrupa; redução de dimensionalidade comprime variáveis, não gera a previsão de preço.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Regressão, pois a saída desejada é um valor numérico contínuo", true],
            ["Classificação, pois o modelo escolhe entre categorias discretas de preço", false],
            ["Clustering, pois agrupa imóveis parecidos sem prever um valor", false],
            ["Redução de dimensionalidade, pois resume as variáveis em menos colunas", false],
        ],
    },
    {
        statement: "Em qual situação usar machine learning é a opção MENOS apropriada?",
        explanation:
            "Regras fixas e determinísticas (cálculo de imposto) devem ser resolvidas com lógica programada, não ML. Machine learning brilha quando os padrões são complexos, mudam com os dados ou são difíceis de descrever em regras.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Um cálculo de imposto que segue regras fixas, determinísticas e bem documentadas em lei",
                true,
            ],
            [
                "Prever a demanda de produtos com base em padrões históricos de vendas sazonais",
                false,
            ],
            [
                "Recomendar conteúdos personalizados a partir do comportamento de cada usuário",
                false,
            ],
            [
                "Classificar automaticamente e-mails recebidos entre spam e não spam em grande volume",
                false,
            ],
        ],
    },
    {
        statement:
            "Durante o treino, um modelo atinge 99% de acurácia nos dados de treino, mas apenas 62% em dados novos de teste. Qual é o diagnóstico mais provável?",
        explanation:
            "Alta acurácia no treino e baixa no teste é a assinatura clássica de overfitting: o modelo memorizou o treino e não generaliza. Underfitting daria desempenho ruim nos dois conjuntos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Overfitting: o modelo memorizou o treino e não generaliza para dados novos", true],
            ["Underfitting: o modelo é simples demais para capturar os padrões dos dados", false],
            ["Vazamento de rótulos, que aumentou a acurácia de teste acima da de treino", false],
            ["Falta de dados de treino, já que o modelo não aprendeu nada no conjunto original", false],
        ],
    },
    {
        statement:
            "Uma cientista de dados quer treinar e implantar um modelo customizado de ML com controle sobre o algoritmo e a infraestrutura. Quais recursos do Amazon SageMaker apoiam DIRETAMENTE esse fluxo? (Selecione DUAS opções.)",
        explanation:
            "Treinar e implantar modelos customizados são funções de SageMaker Training e SageMaker Endpoints. Polly (voz), Connect (contact center) e Shield (proteção DDoS) não fazem parte desse fluxo de ML.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["SageMaker Training, para treinar modelos em infraestrutura gerenciada e escalável", true],
            ["SageMaker Endpoints, para hospedar o modelo e servir inferências em tempo real", true],
            ["Amazon Polly, para converter os resultados do modelo em áudio de voz natural", false],
            ["Amazon Connect, para distribuir chamadas telefônicas em uma central de atendimento", false],
            ["AWS Shield, para proteger a aplicação contra ataques de negação de serviço", false],
        ],
    },
    {
        statement:
            "Um analista de negócios sem experiência em programação quer construir modelos de ML por uma interface visual, sem escrever código. Qual serviço atende melhor?",
        explanation:
            "SageMaker Canvas é a ferramenta no-code para usuários de negócio criarem previsões visualmente. Studio é para quem programa; Lambda executa funções; EMR é big data com Spark.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon SageMaker Canvas, que oferece ML visual sem necessidade de código", true],
            ["Amazon SageMaker Studio, um ambiente de desenvolvimento voltado a cientistas de dados", false],
            ["AWS Lambda, um serviço para executar funções de código sob demanda", false],
            ["Amazon EMR, uma plataforma de big data baseada em frameworks como Apache Spark", false],
        ],
    },
    {
        statement:
            "No contexto de um conjunto de dados de treino supervisionado, o que é um 'rótulo' (label)?",
        explanation:
            "O rótulo é o alvo/resposta que o modelo aprende a prever. As colunas de entrada são features; parâmetros são ajustados no treino; métricas avaliam o desempenho.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["A resposta correta que se deseja prever, associada a cada exemplo de treino", true],
            ["Cada uma das colunas de entrada usadas pelo modelo para fazer as previsões", false],
            ["O parâmetro interno ajustado pelo algoritmo durante o processo de treino", false],
            ["A métrica que mede o quão bem o modelo se saiu no conjunto de teste", false],
        ],
    },
    {
        statement:
            "Depois de treinado, um modelo é usado para gerar previsões sobre dados novos em produção. Como esse processo é chamado?",
        explanation:
            "Usar o modelo treinado para prever sobre dados novos é inferência. Treino ajusta parâmetros; rotulagem prepara os dados; engenharia de atributos cria features.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Inferência, quando o modelo já treinado produz previsões para novas entradas", true],
            ["Treinamento, quando o modelo ajusta seus parâmetros a partir dos dados", false],
            ["Rotulagem, quando pessoas atribuem as respostas corretas aos exemplos", false],
            ["Engenharia de atributos, quando novas variáveis de entrada são criadas", false],
        ],
    },
    {
        statement:
            "Um modelo de triagem médica deve evitar ao máximo classificar um paciente doente como saudável (falso negativo). Qual métrica a equipe deve priorizar para reduzir esse erro?",
        explanation:
            "Reduzir falsos negativos (doente classificado como saudável) significa aumentar o recall. Precisão foca em falsos positivos; taxa de aprendizado é um hiperparâmetro de treino, não uma métrica de erro.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Recall (sensibilidade), que mede a fração de casos positivos que o modelo captura", true],
            ["Precisão, que mede a fração de alertas positivos que estavam realmente corretos", false],
            ["Especificidade, que mede a fração de casos negativos identificados corretamente", false],
            ["Taxa de aprendizado, que controla o tamanho do passo durante o treino do modelo", false],
        ],
    },
    {
        statement:
            "Uma startup precisa transcrever áudios de reuniões para texto rapidamente, sem treinar nenhum modelo. Qual serviço da AWS resolve isso com um modelo pré-treinado?",
        explanation:
            "Amazon Transcribe faz speech-to-text pronto para uso. Polly é o inverso (text-to-speech); Comprehend analisa texto escrito; SageMaker exigiria treinar um modelo próprio.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Transcribe, que converte fala em texto com um modelo já pronto", true],
            ["Amazon SageMaker, no qual seria preciso treinar e implantar um modelo próprio", false],
            ["Amazon Polly, que faz o caminho inverso, gerando voz a partir de texto", false],
            ["Amazon Comprehend, que extrai entidades e sentimentos de textos já escritos", false],
        ],
    },
    {
        statement:
            "Uma equipe obteve resultados ruins com um modelo e descobriu que os dados de treino continham muitos valores errados e faltantes. Qual princípio isso reforça?",
        explanation:
            "Dados ruins levam a modelos ruins ('garbage in, garbage out'). Nem modelos grandes nem grande volume compensam dados de baixa qualidade; a limpeza e a curadoria dos dados são essenciais.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["A qualidade dos dados de treino determina fortemente a qualidade do modelo", true],
            ["Modelos maiores compensam automaticamente quaisquer problemas nos dados", false],
            ["A escolha do algoritmo é irrelevante quando há um grande volume de dados", false],
            ["Os dados de teste têm mais impacto no desempenho do que os dados de treino", false],
        ],
    },

    // ===================== Domínio 2: Fundamentos de IA generativa =====================
    {
        statement:
            "O que caracteriza um 'foundation model' (modelo de fundação) no contexto de IA generativa?",
        explanation:
            "Foundation models são grandes, pré-treinados em dados massivos e adaptáveis a muitas tarefas (texto, imagem e outros). Não são modelos de tarefa única nem bancos de dados vetoriais.",
        topic: "IA generativa",
        options: [
            ["Um modelo grande, pré-treinado em vastos dados, que serve de base para muitas tarefas", true],
            ["Um modelo pequeno treinado do zero para uma única tarefa muito específica", false],
            ["Um banco de dados vetorial usado apenas para armazenar embeddings de texto", false],
            ["Uma regra de negócio determinística que não depende de dados para funcionar", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS permite acessar foundation models de diversos provedores por uma única API gerenciada, sem administrar infraestrutura?",
        explanation:
            "Amazon Bedrock dá acesso serverless a foundation models de vários provedores por uma API única. EC2 exigiria operar tudo; S3 apenas armazena; Glue faz ETL de dados.",
        topic: "IA generativa",
        options: [
            ["Amazon Bedrock, que oferece foundation models por API totalmente gerenciada", true],
            ["Amazon EC2, no qual seria preciso instalar e operar os modelos manualmente", false],
            ["Amazon S3, um serviço de armazenamento de objetos sem capacidade de inferência", false],
            ["AWS Glue, um serviço de ETL para preparar e integrar dados entre fontes", false],
        ],
    },
    {
        statement: "Ao trabalhar com um grande modelo de linguagem (LLM), o que é um 'token'?",
        explanation:
            "Em LLMs, token é a unidade de texto (palavra ou subpalavra) processada por vez. Não confundir com token de autenticação, parâmetro interno do modelo ou registro de log.",
        topic: "IA generativa",
        options: [
            ["Uma unidade de texto (palavra ou parte dela) que o modelo processa por vez", true],
            ["Uma credencial de segurança que autoriza o acesso à API do modelo", false],
            ["O parâmetro interno que o modelo ajusta durante o pré-treinamento", false],
            ["Um registro de log gerado a cada requisição feita ao modelo", false],
        ],
    },
    {
        statement: "O que é um 'embedding' no contexto de IA generativa e busca semântica?",
        explanation:
            "Embeddings são vetores numéricos que capturam o significado semântico do texto, permitindo comparar conteúdos por proximidade. Não são resumos, cópias criptografadas nem índices de palavra-chave.",
        topic: "IA generativa",
        options: [
            ["Uma representação numérica em vetores que captura o significado de um texto", true],
            ["Um resumo em linguagem natural gerado automaticamente a partir do texto", false],
            ["Uma cópia criptografada do documento original armazenada em disco", false],
            ["Um índice tradicional de palavras-chave usado em bancos relacionais", false],
        ],
    },
    {
        statement:
            "Um LLM respondeu a uma pergunta citando um artigo científico que não existe, com autores e datas inventados. Como esse comportamento é chamado?",
        explanation:
            "Gerar conteúdo plausível mas falso (referências inventadas) é alucinação. Overfitting é sobre generalização; viés é sobre desequilíbrio dos dados; latência é o tempo de resposta.",
        topic: "IA generativa",
        options: [
            ["Alucinação, quando o modelo gera informação plausível, porém falsa", true],
            ["Overfitting, quando o modelo memoriza os dados de treino em excesso", false],
            ["Viés de dados, quando o modelo reflete desequilíbrios do conjunto de treino", false],
            ["Latência, quando o modelo demora demais para produzir a resposta", false],
        ],
    },
    {
        statement: "Qual é um caso de uso típico de IA generativa?",
        explanation:
            "IA generativa cria conteúdo novo (texto, código, resumos) a partir de prompts. Somar planilhas, rotear rede e aplicar políticas de permissão são tarefas determinísticas, não de geração.",
        topic: "IA generativa",
        options: [
            ["Gerar rascunhos de texto, resumos e código a partir de instruções em linguagem natural", true],
            ["Somar valores de uma planilha seguindo uma fórmula fixa e determinística", false],
            ["Rotear pacotes de rede entre sub-redes com base em tabelas de roteamento", false],
            ["Controlar o acesso a recursos por meio de políticas de permissão explícitas", false],
        ],
    },
    {
        statement:
            "Qual é uma vantagem central de usar foundation models em vez de treinar um modelo do zero para cada tarefa?",
        explanation:
            "A grande vantagem é reaproveitar um modelo pré-treinado e adaptá-lo a muitas tarefas, poupando tempo e dados. Eles não eliminam erros, não dispensam dados nem têm custo de inferência zero.",
        topic: "IA generativa",
        options: [
            ["Eles já vêm pré-treinados e podem ser adaptados a várias tarefas com pouco esforço", true],
            ["Eles eliminam por completo qualquer risco de gerar respostas incorretas", false],
            ["Eles dispensam totalmente o uso de dados ao serem aplicados a novos casos", false],
            ["Eles garantem custo zero de inferência independentemente do volume de uso", false],
        ],
    },
    {
        statement: "Qual é um desafio conhecido ao adotar IA generativa em produção?",
        explanation:
            "IA generativa pode gerar saídas variáveis e imprecisas (inclusive alucinações), exigindo verificação e guardrails. Ela é acessível por API, permite restrições de tema e é multilíngue.",
        topic: "IA generativa",
        options: [
            ["As respostas podem variar e conter imprecisões, exigindo verificação e controles", true],
            ["Os modelos só funcionam offline, sem qualquer possibilidade de uso via API", false],
            ["É impossível restringir os temas sobre os quais o modelo pode responder", false],
            ["Eles não conseguem processar texto em mais de um idioma simultaneamente", false],
        ],
    },
    {
        statement:
            "Uma empresa quer um assistente de IA generativa que responda perguntas dos funcionários com base nos documentos internos, respeitando as permissões de acesso. Qual serviço da AWS é voltado a isso?",
        explanation:
            "Amazon Q Business é o assistente generativo que responde com base nos dados corporativos e respeita as permissões. Rekognition é visão; Athena é consulta SQL; Polly gera voz.",
        topic: "IA generativa",
        options: [
            ["Amazon Q Business, um assistente generativo conectado aos dados corporativos", true],
            ["Amazon Rekognition, um serviço de análise de imagens e vídeos", false],
            ["Amazon Athena, um serviço de consultas SQL sobre dados no Amazon S3", false],
            ["Amazon Polly, um serviço que converte texto em voz de forma natural", false],
        ],
    },
    {
        statement:
            "Uma agência quer gerar imagens originais a partir de descrições em texto. Que categoria de modelo generativo é a mais indicada?",
        explanation:
            "Gerar imagens a partir de texto usa modelos generativos de imagem (por exemplo, de difusão). Regressão e clustering não geram imagens; detecção de objetos analisa imagens existentes, não cria novas.",
        topic: "IA generativa",
        options: [
            ["Modelos de geração de imagem a partir de texto, como os de difusão", true],
            ["Modelos de regressão linear, voltados a prever valores numéricos contínuos", false],
            ["Modelos de clustering, voltados a agrupar dados sem rótulos prévios", false],
            ["Modelos de detecção de objetos, que apenas localizam itens em fotos existentes", false],
        ],
    },
    {
        statement: "O que representa a 'janela de contexto' (context window) de um LLM?",
        explanation:
            "A janela de contexto é o limite de tokens (entrada mais saída) que o modelo processa em uma interação. Não tem relação com concorrência de usuários, cache de resposta ou região de nuvem.",
        topic: "IA generativa",
        options: [
            ["A quantidade máxima de tokens que o modelo considera em uma única interação", true],
            ["O número de usuários que podem chamar o modelo ao mesmo tempo", false],
            ["O período em que a resposta do modelo fica em cache antes de expirar", false],
            ["A região de nuvem onde o modelo está fisicamente hospedado", false],
        ],
    },
    {
        statement:
            "Uma equipe pequena quer experimentar vários foundation models sem provisionar servidores nem gerenciar GPUs. Qual característica do Amazon Bedrock ajuda nisso?",
        explanation:
            "Bedrock é serverless: a AWS opera a infraestrutura e você consome os modelos por API. Não é preciso criar cluster de GPU, baixar os pesos nem treinar os modelos do zero.",
        topic: "IA generativa",
        options: [
            ["É um serviço serverless, no qual a AWS gerencia a infraestrutura dos modelos", true],
            ["Exige a criação de um cluster dedicado de GPUs para cada modelo testado", false],
            ["Requer baixar os pesos dos modelos e hospedá-los em instâncias próprias", false],
            ["Só funciona se os modelos forem treinados do zero pela própria equipe", false],
        ],
    },
    {
        statement:
            "Quais são casos de uso apropriados para IA generativa? (Selecione DUAS opções.)",
        explanation:
            "Resumir textos e gerar respostas em linguagem natural são fortes da IA generativa. Somas exatas, regras fiscais fixas e ordenação determinística devem usar lógica tradicional, não geração.",
        topic: "IA generativa",
        options: [
            ["Resumir automaticamente longos relatórios em poucos parágrafos", true],
            ["Gerar respostas de atendimento a partir de perguntas em linguagem natural", true],
            ["Garantir a soma exata de uma coluna financeira com precisão contábil", false],
            ["Aplicar regras fiscais fixas para calcular impostos de forma determinística", false],
            ["Ordenar uma lista de números de forma perfeitamente reproduzível", false],
        ],
    },
    {
        statement: "No uso de LLMs, o que é um 'prompt'?",
        explanation:
            "O prompt é a instrução ou entrada em linguagem natural que orienta a resposta do modelo. Pesos são internos do treino; o banco vetorial guarda embeddings; métricas avaliam a saída.",
        topic: "IA generativa",
        options: [
            ["A instrução ou entrada em linguagem natural que orienta a resposta do modelo", true],
            ["O conjunto de pesos internos que o modelo ajusta durante o treinamento", false],
            ["O banco de dados vetorial que armazena os embeddings dos documentos", false],
            ["A métrica que mede a qualidade final da resposta gerada pelo modelo", false],
        ],
    },
    {
        statement:
            "Por que LLMs são especialmente úteis para tarefas com linguagem natural, como responder perguntas e redigir textos?",
        explanation:
            "LLMs foram pré-treinados em enormes volumes de texto e capturam padrões da linguagem, o que os torna bons em tarefas de linguagem natural. Não são calculadoras, não usam regras manuais nem exigem dados tabulares.",
        topic: "IA generativa",
        options: [
            ["Foram pré-treinados em grandes volumes de texto e capturam padrões da linguagem", true],
            ["Executam apenas operações aritméticas exatas sobre números estruturados", false],
            ["Dependem de regras gramaticais escritas manualmente para cada idioma", false],
            ["Funcionam somente com dados tabulares organizados em linhas e colunas", false],
        ],
    },

    // ============ Domínio 3: Aplicações de foundation models ============
    {
        statement: "O que é 'engenharia de prompt' (prompt engineering)?",
        explanation:
            "Engenharia de prompt é elaborar instruções eficazes para guiar o LLM a respostas melhores. Não envolve treinar o modelo do zero, comprimir pesos nem configurar a rede da VPC.",
        topic: "Prompt engineering",
        options: [
            ["A prática de estruturar instruções para obter respostas melhores de um LLM", true],
            ["O processo de treinar um foundation model do zero com dados próprios", false],
            ["A técnica de comprimir os pesos do modelo para reduzir o custo de memória", false],
            ["O ajuste dos parâmetros de rede da VPC onde o modelo está hospedado", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor inclui no prompt três exemplos de perguntas com as respostas desejadas antes de fazer a pergunta real, para orientar o formato da saída. Que técnica é essa?",
        explanation:
            "Fornecer alguns exemplos dentro do prompt é few-shot (aprendizado em contexto). Fine-tuning e pré-treinamento alteram os pesos do modelo; destilação cria um modelo menor a partir de outro.",
        topic: "Prompt engineering",
        options: [
            ["Prompt few-shot, que fornece alguns exemplos no próprio prompt", true],
            ["Fine-tuning, que reajusta os pesos do modelo com um novo conjunto de dados", false],
            ["Pré-treinamento, que ensina o modelo do zero em grandes volumes de dados", false],
            ["Destilação, que transfere conhecimento de um modelo grande para um menor", false],
        ],
    },
    {
        statement:
            "Pedir a um LLM para classificar o sentimento de uma frase sem fornecer nenhum exemplo no prompt é um caso de:",
        explanation:
            "Pedir a tarefa sem exemplos é zero-shot. Few-shot inclui exemplos no prompt; fine-tuning treina com dados rotulados; RAG recupera documentos externos antes de responder.",
        topic: "Prompt engineering",
        options: [
            ["Prompt zero-shot, no qual a tarefa é pedida sem exemplos", true],
            ["Prompt few-shot, no qual vários exemplos guiam a resposta", false],
            ["Fine-tuning supervisionado, que usa milhares de exemplos rotulados", false],
            ["RAG, que recupera documentos externos antes de responder", false],
        ],
    },
    {
        statement:
            "Ao chamar um LLM, aumentar o parâmetro de 'temperatura' tende a produzir respostas:",
        explanation:
            "Temperatura alta aumenta a aleatoriedade e a criatividade; baixa deixa as respostas mais determinísticas. Ela não controla diretamente o tamanho, a velocidade nem o custo da resposta.",
        topic: "Prompt engineering",
        options: [
            ["Mais aleatórias e criativas, com maior variação entre as execuções", true],
            ["Mais curtas, limitando automaticamente o número de tokens de saída", false],
            ["Mais rápidas, reduzindo o tempo de processamento de cada requisição", false],
            ["Mais baratas, diminuindo o custo cobrado por token processado", false],
        ],
    },
    {
        statement: "O que é Retrieval Augmented Generation (RAG)?",
        explanation:
            "RAG busca dados relevantes em uma fonte externa (por exemplo, uma base vetorial) e os inclui no prompt, embasando a resposta em informação atual e específica, sem alterar os pesos do modelo.",
        topic: "RAG e customização",
        options: [
            ["Buscar dados em uma fonte externa e incluí-los no contexto do prompt", true],
            ["Reajustar os pesos do modelo com um novo conjunto de dados rotulados", false],
            ["Treinar um foundation model do zero usando apenas os dados da empresa", false],
            ["Comprimir o modelo para que ele caiba em dispositivos com pouca memória", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que um assistente responda com base nos seus manuais internos e reduza respostas inventadas, sem treinar um modelo próprio. Qual abordagem é a mais indicada?",
        explanation:
            "RAG embasa as respostas nos documentos internos, reduzindo alucinações sem custo de treino. Aumentar a temperatura piora; treinar do zero é caro e desnecessário; remover guardrails aumenta o risco.",
        topic: "RAG e customização",
        options: [
            ["RAG, recuperando trechos dos manuais e incluindo-os no contexto do prompt", true],
            ["Aumentar a temperatura do modelo para torná-lo mais criativo nas respostas", false],
            ["Treinar um foundation model do zero somente com os manuais da empresa", false],
            ["Remover todos os guardrails para o modelo responder a qualquer pergunta", false],
        ],
    },
    {
        statement:
            "Qual recurso do Amazon Bedrock facilita implementar RAG conectando foundation models às fontes de dados da empresa?",
        explanation:
            "Knowledge Bases for Amazon Bedrock cuida da ingestão, dos embeddings e da recuperação para RAG. Guardrails filtra conteúdo; CloudWatch monitora; CloudFormation provisiona infraestrutura.",
        topic: "RAG e customização",
        options: [
            ["Knowledge Bases for Amazon Bedrock, que gerencia a recuperação de dados para RAG", true],
            ["Amazon Bedrock Guardrails, voltado a filtrar conteúdo indesejado nas respostas", false],
            ["Amazon CloudWatch, voltado ao monitoramento de métricas e logs de aplicações", false],
            ["AWS CloudFormation, voltado a provisionar infraestrutura como código", false],
        ],
    },
    {
        statement: "O que é 'fine-tuning' de um foundation model?",
        explanation:
            "Fine-tuning continua o treino do modelo com dados específicos, ajustando os pesos e especializando-o em uma tarefa. Melhorar o prompt é engenharia de prompt; recuperar documentos é RAG.",
        topic: "RAG e customização",
        options: [
            ["Continuar o treino do modelo com dados específicos, ajustando seus pesos", true],
            ["Escrever instruções mais detalhadas no prompt sem alterar o modelo", false],
            ["Recuperar documentos externos e incluí-los no contexto da pergunta", false],
            ["Reduzir o número de tokens da resposta apenas para diminuir o custo", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa que o assistente use informações que mudam toda semana. Por que RAG costuma ser preferível a fine-tuning nesse caso?",
        explanation:
            "Com RAG basta atualizar a base de dados recuperada, ideal para informações que mudam sempre. Fine-tuning fixa o conhecimento nos pesos e exigiria retreinar o modelo a cada mudança.",
        topic: "RAG e customização",
        options: [
            ["Com RAG basta atualizar a base de dados, sem retreinar o modelo a cada mudança", true],
            ["Fine-tuning atualiza o modelo automaticamente sempre que os dados mudam", false],
            ["RAG altera os pesos do modelo mais rápido do que o fine-tuning consegue", false],
            ["Fine-tuning dispensa qualquer fonte de dados para responder perguntas novas", false],
        ],
    },
    {
        statement:
            "Qual recurso do Amazon Bedrock permite que um foundation model execute tarefas em várias etapas, chamando APIs e sistemas para concluir uma solicitação do usuário?",
        explanation:
            "Agents for Amazon Bedrock orquestram tarefas de múltiplas etapas, invocando APIs e fontes de dados. Guardrails filtra conteúdo; Textract extrai de documentos; Macie protege dados sensíveis.",
        topic: "RAG e customização",
        options: [
            ["Agents for Amazon Bedrock, que orquestram ações e chamadas a sistemas", true],
            ["Amazon Bedrock Guardrails, que restringem os temas e conteúdos das respostas", false],
            ["Amazon Textract, que extrai texto e dados de documentos digitalizados", false],
            ["Amazon Macie, que descobre e protege dados sensíveis armazenados no S3", false],
        ],
    },
    {
        statement:
            "Ao escolher um foundation model para um chatbot de alto volume e baixo custo, qual tradeoff a equipe deve considerar?",
        explanation:
            "Modelos menores tendem a custar menos e responder mais rápido, com menos capacidade; os maiores custam e demoram mais, mas resolvem tarefas complexas. A escolha equilibra custo, latência e qualidade.",
        topic: "RAG e customização",
        options: [
            ["Modelos menores tendem a custar menos e responder mais rápido, com menos capacidade", true],
            ["Modelos maiores são sempre mais baratos e mais rápidos que os menores", false],
            ["O tamanho do modelo não influencia custo, latência nem capacidade", false],
            ["Modelos menores sempre superam os maiores em qualquer tarefa de linguagem", false],
        ],
    },
    {
        statement:
            "Qual é o efeito de definir um limite de 'máximo de tokens' (max tokens) na chamada de um LLM?",
        explanation:
            "Max tokens limita o comprimento da resposta, cortando-a ao atingir o teto. A criatividade é governada pela temperatura e top-p; a correção não é garantida por esse limite; cotas de chamada são outra coisa.",
        topic: "Prompt engineering",
        options: [
            ["Limita o tamanho da resposta gerada, cortando-a ao atingir o teto de tokens", true],
            ["Aumenta a criatividade da resposta ao permitir mais variação de palavras", false],
            ["Garante que a resposta esteja sempre factualmente correta e sem erros", false],
            ["Define quantas vezes o modelo pode ser chamado por minuto na conta", false],
        ],
    },
    {
        statement: "Em uma solução de RAG, qual é o papel de um banco de dados vetorial?",
        explanation:
            "O banco vetorial guarda embeddings e faz busca por similaridade para recuperar os trechos mais relevantes ao prompt. Ele não treina modelos, não gera imagens nem cuida da autorização de acesso.",
        topic: "RAG e customização",
        options: [
            ["Armazenar embeddings e recuperar os trechos mais semelhantes à consulta", true],
            ["Executar o treino do foundation model a partir de dados rotulados", false],
            ["Gerar as imagens de saída solicitadas pelo usuário no prompt", false],
            ["Aplicar as políticas de IAM que autorizam o acesso ao modelo", false],
        ],
    },
    {
        statement:
            "Uma equipe quer comparar a qualidade de diferentes foundation models para a sua tarefa antes de escolher um. Qual recurso do Amazon Bedrock apoia isso?",
        explanation:
            "A avaliação de modelos (model evaluation) do Bedrock compara modelos por métricas automáticas ou por avaliação humana. Guardrails filtra; Trusted Advisor e Inspector são de conta e segurança.",
        topic: "RAG e customização",
        options: [
            ["A avaliação de modelos (model evaluation) do Amazon Bedrock", true],
            ["O Amazon Bedrock Guardrails, focado em bloquear conteúdo indesejado", false],
            ["O AWS Trusted Advisor, focado em recomendações de custo e segurança da conta", false],
            ["O Amazon Inspector, focado em avaliar vulnerabilidades de segurança", false],
        ],
    },
    {
        statement:
            "Uma forma de melhorar respostas de um LLM em problemas de raciocínio é pedir que ele explique o passo a passo antes de dar a resposta final. Essa técnica de prompt é conhecida como:",
        explanation:
            "Pedir o raciocínio passo a passo é a cadeia de raciocínio (chain-of-thought), que costuma melhorar tarefas de lógica. As demais opções são conceitos de ML ou de infraestrutura, não técnicas de prompt.",
        topic: "Prompt engineering",
        options: [
            ["Cadeia de raciocínio (chain-of-thought), pedindo o passo a passo antes da resposta", true],
            ["Redução de dimensionalidade, que resume as variáveis de entrada em menos colunas", false],
            ["Quantização, que reduz a precisão numérica dos pesos do modelo", false],
            ["Balanceamento de carga, que distribui as requisições entre vários servidores", false],
        ],
    },
    {
        statement: "Qual é um risco de segurança específico ao expor um LLM a entradas de usuários?",
        explanation:
            "Injeção de prompt tenta fazer o modelo ignorar as instruções originais e seguir as do atacante. Os outros itens são problemas genéricos de infraestrutura, não específicos de LLMs.",
        topic: "Prompt engineering",
        options: [
            ["Injeção de prompt, na qual a entrada tenta subverter as instruções do sistema", true],
            ["Estouro de buffer causado por excesso de memória alocada pelo modelo", false],
            ["Perda de pacotes na rede entre o cliente e o endpoint do modelo", false],
            ["Fragmentação de disco no armazenamento onde o modelo está hospedado", false],
        ],
    },
    {
        statement:
            "Uma empresa quer impedir que seu assistente generativo responda sobre temas proibidos e evite linguagem tóxica. Qual recurso do Amazon Bedrock atende a isso?",
        explanation:
            "Guardrails aplica filtros de conteúdo, tópicos negados e proteção de PII nas respostas. Knowledge Bases é para RAG; Ground Truth rotula dados; DataBrew prepara dados de forma visual.",
        topic: "RAG e customização",
        options: [
            ["Amazon Bedrock Guardrails, que aplica filtros de conteúdo e tópicos negados", true],
            ["Amazon Bedrock Knowledge Bases, que conecta o modelo a fontes de dados", false],
            ["Amazon SageMaker Ground Truth, que rotula dados para treino supervisionado", false],
            ["AWS Glue DataBrew, que limpa e prepara dados de forma visual", false],
        ],
    },
    {
        statement:
            "Além de reduzir alucinações, incluir no prompt trechos recuperados de documentos confiáveis permite que a resposta:",
        explanation:
            "Ao embasar a resposta em trechos recuperados, é possível citar as fontes e aumentar a confiança. Isso não garante correção absoluta, não zera o custo de inferência nem fixa a latência.",
        topic: "RAG e customização",
        options: [
            ["Cite as fontes usadas, aumentando a rastreabilidade e a confiança na resposta", true],
            ["Dispense qualquer revisão humana, por estar sempre 100% correta", false],
            ["Elimine o custo de inferência cobrado por token processado", false],
            ["Garanta tempo de resposta constante independentemente do modelo escolhido", false],
        ],
    },

    // ===================== Domínio 4: IA responsável =====================
    {
        statement:
            "No contexto de IA responsável, o que é 'viés' (bias) em um modelo de ML?",
        explanation:
            "Viés é o erro sistemático que favorece ou prejudica certos grupos de forma injusta, muitas vezes refletindo desequilíbrios nos dados. Não é a diferença treino/teste, a latência nem o tamanho do modelo.",
        topic: "IA responsável",
        options: [
            ["Erros sistemáticos que favorecem ou prejudicam certos grupos de forma injusta", true],
            ["A diferença entre a acurácia de treino e a acurácia de teste do modelo", false],
            ["O tempo que o modelo leva para produzir cada resposta em produção", false],
            ["A quantidade de parâmetros ajustados durante o treino do modelo", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS ajuda a detectar viés nos dados e no modelo e a explicar as previsões?",
        explanation:
            "Amazon SageMaker Clarify detecta viés e fornece explicabilidade das previsões. Ground Truth rotula dados; CloudFront é uma CDN; AWS Backup cria e gerencia cópias de segurança.",
        topic: "IA responsável",
        options: [
            ["Amazon SageMaker Clarify, voltado à detecção de viés e à explicabilidade", true],
            ["Amazon SageMaker Ground Truth, voltado à rotulagem de dados de treino", false],
            ["Amazon CloudFront, voltado à entrega de conteúdo com baixa latência", false],
            ["AWS Backup, voltado à criação e à gestão de cópias de segurança", false],
        ],
    },
    {
        statement:
            "Por que a 'explicabilidade' (explainability) de um modelo é importante em aplicações sensíveis, como concessão de crédito?",
        explanation:
            "Explicabilidade ajuda a entender e justificar as decisões, essencial em contextos regulados e sensíveis. Ela não garante ausência de erros, não reduz o custo de inferência nem acelera o treino.",
        topic: "IA responsável",
        options: [
            ["Permite entender por que o modelo decidiu e justificar isso a quem for afetado", true],
            ["Garante que o modelo nunca cometa erros em nenhuma previsão futura", false],
            ["Reduz automaticamente o custo de inferência do modelo em produção", false],
            ["Aumenta a velocidade de treino ao simplificar o algoritmo utilizado", false],
        ],
    },
    {
        statement: "Qual das opções é uma dimensão central da IA responsável?",
        explanation:
            "Justiça (fairness) é um pilar da IA responsável, ao lado de transparência, explicabilidade, robustez e privacidade. Aumentar parâmetros, limitar idiomas ou ocultar o funcionamento não são princípios de IA responsável.",
        topic: "IA responsável",
        options: [
            ["Justiça (fairness), buscando tratar diferentes grupos de forma equânime", true],
            ["Maximizar o número de parâmetros do modelo a qualquer custo", false],
            ["Reduzir o número de idiomas suportados para simplificar o sistema", false],
            ["Ocultar totalmente de todos os envolvidos como o sistema funciona", false],
        ],
    },
    {
        statement:
            "Um modelo de recrutamento passou a favorecer um perfil específico de candidato. A investigação apontou que os dados históricos de contratação já eram desequilibrados. Que problema isso ilustra?",
        explanation:
            "Dados históricos desequilibrados geram viés que o modelo aprende e reproduz (ou amplifica). Overfitting é sobre generalização; alucinação é de modelos generativos; latência é desempenho, não justiça.",
        topic: "IA responsável",
        options: [
            ["Viés herdado dos dados de treino, que o modelo aprendeu e reproduziu", true],
            ["Overfitting causado por um modelo grande demais para os dados disponíveis", false],
            ["Alucinação, típica de modelos generativos que inventam informações", false],
            ["Latência alta provocada por um endpoint mal dimensionado", false],
        ],
    },
    {
        statement:
            "A AWS publica documentos que descrevem casos de uso pretendidos, limitações e escolhas de design de seus serviços de IA, apoiando o uso responsável. Como esses documentos são chamados?",
        explanation:
            "As AWS AI Service Cards trazem transparência sobre uso pretendido, limitações e design responsável dos serviços de IA. As demais opções são recursos de rede, IAM e computação.",
        topic: "IA responsável",
        options: [
            ["AI Service Cards, que documentam o uso pretendido e as limitações dos serviços de IA", true],
            ["Security Groups, que controlam o tráfego de rede de instâncias EC2", false],
            ["Trust Policies, que definem quem pode assumir uma função do IAM", false],
            ["Launch Templates, que padronizam a criação de instâncias de computação", false],
        ],
    },
    {
        statement:
            "Em decisões de alto impacto apoiadas por IA, qual prática de IA responsável ajuda a evitar erros graves do modelo?",
        explanation:
            "Manter revisão humana (human in the loop) sobre decisões críticas é uma salvaguarda central da IA responsável. Remover supervisão, elevar a temperatura ou ocultar decisões aumentam o risco.",
        topic: "IA responsável",
        options: [
            ["Manter revisão humana (human in the loop) sobre as decisões do modelo", true],
            ["Remover qualquer supervisão para acelerar as decisões automatizadas", false],
            ["Aumentar a temperatura do modelo para gerar respostas mais variadas", false],
            ["Ocultar as decisões do modelo dos usuários afetados por elas", false],
        ],
    },
    {
        statement:
            "Aplicar filtros que impedem um assistente de gerar conteúdo tóxico ou perigoso está mais associado a qual princípio de IA responsável?",
        explanation:
            "Filtrar conteúdo tóxico ou perigoso é uma medida de segurança e mitigação de danos, um pilar da IA responsável. As outras opções tratam de custo, desempenho e dados, não da segurança do conteúdo.",
        topic: "IA responsável",
        options: [
            ["Segurança e mitigação de danos ao usuário e à sociedade", true],
            ["Redução do custo de armazenamento dos dados de treino", false],
            ["Aumento da taxa de tokens processados por segundo", false],
            ["Simplificação do pipeline de ETL que alimenta o modelo", false],
        ],
    },
    {
        statement:
            "Uma equipe quer documentar, para cada modelo, a finalidade, os dados usados, as métricas e as limitações conhecidas, apoiando a governança. Que artefato atende a isso?",
        explanation:
            "Os cartões de modelo (model cards) documentam finalidade, dados, métricas e limitações de um modelo, apoiando governança e transparência. As demais opções são recursos de rede, armazenamento e mensageria.",
        topic: "IA responsável",
        options: [
            ["Cartões de modelo (model cards), que documentam finalidade, dados e limitações", true],
            ["Grupos de segurança, que controlam o tráfego de rede das instâncias", false],
            ["Buckets do S3, que apenas armazenam objetos sem descrever modelos", false],
            ["Filas SQS, que desacoplam componentes por meio de mensagens", false],
        ],
    },

    // ============ Domínio 5: Segurança, conformidade e governança ============
    {
        statement:
            "Ao dar acesso a um serviço de IA na AWS, qual prática de segurança concede apenas as permissões estritamente necessárias?",
        explanation:
            "O princípio do menor privilégio, aplicado via AWS IAM, concede só o necessário e reduz a superfície de ataque. Dar admin a todos, compartilhar a chave raiz ou desativar a autenticação são práticas inseguras.",
        topic: "Segurança e governança",
        options: [
            ["Aplicar o princípio do menor privilégio com políticas do AWS IAM", true],
            ["Conceder permissões de administrador a todos para agilizar o trabalho", false],
            ["Compartilhar uma única chave de acesso raiz entre toda a equipe", false],
            ["Desativar a autenticação para simplificar o acesso aos serviços", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa descobrir e proteger dados pessoais (PII) presentes em grandes volumes de documentos armazenados no Amazon S3. Qual serviço é voltado a isso?",
        explanation:
            "Amazon Macie usa ML para descobrir e proteger PII e outros dados sensíveis no S3. Polly gera voz, Lex constrói chatbots e AWS Batch executa cargas de processamento em lote.",
        topic: "Segurança e governança",
        options: [
            ["Amazon Macie, que descobre e protege dados sensíveis armazenados no S3", true],
            ["Amazon Polly, que converte texto em voz de forma natural", false],
            ["Amazon Lex, que constrói interfaces conversacionais e chatbots", false],
            ["AWS Batch, que executa cargas de processamento em lote", false],
        ],
    },
    {
        statement:
            "Para proteger os dados usados por uma solução de IA na AWS, qual medida de segurança é recomendada?",
        explanation:
            "Criptografar os dados em repouso e em trânsito (por exemplo, com o AWS KMS) é uma prática básica de proteção. Texto puro, buckets públicos e desativar logs enfraquecem a segurança.",
        topic: "Segurança e governança",
        options: [
            ["Criptografar os dados em repouso e em trânsito, por exemplo com o AWS KMS", true],
            ["Manter os dados sempre em texto puro para facilitar a depuração", false],
            ["Publicar os dados em um bucket S3 aberto para acesso público", false],
            ["Desabilitar o registro de logs para reduzir o volume de dados guardado", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS aplicado a um serviço gerenciado de IA, qual item normalmente é responsabilidade do CLIENTE?",
        explanation:
            "O cliente é responsável pelo controle de acesso (IAM) e pela governança dos próprios dados. A AWS cuida da infraestrutura física, dos patches da plataforma gerenciada e da operação dos data centers.",
        topic: "Segurança e governança",
        options: [
            ["Definir quem pode acessar o serviço e como os dados de entrada são usados", true],
            ["Manter o hardware físico dos data centers que hospedam o serviço", false],
            ["Aplicar patches no sistema operacional da infraestrutura gerenciada", false],
            ["Operar a rede física e a energia elétrica das instalações da AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa teme que seus prompts e dados enviados ao Amazon Bedrock sejam usados para treinar os modelos base de terceiros. Qual afirmação reflete a postura de privacidade do Bedrock?",
        explanation:
            "No Bedrock, os dados do cliente não são usados para treinar os foundation models base nem compartilhados com os provedores dos modelos. As demais afirmações contrariam a privacidade do serviço.",
        topic: "Segurança e governança",
        options: [
            ["Os dados do cliente não são usados para treinar os foundation models base", true],
            ["Todos os prompts enviados passam a treinar publicamente os modelos base", false],
            ["Os dados ficam visíveis para todos os outros clientes do serviço", false],
            ["Os dados são compartilhados automaticamente com os provedores dos modelos", false],
        ],
    },
    {
        statement:
            "Uma equipe de governança precisa auditar quem chamou as APIs dos serviços de IA e quando, para fins de conformidade. Qual serviço registra essas chamadas de API na conta?",
        explanation:
            "AWS CloudTrail registra as chamadas de API feitas na conta, apoiando auditoria e conformidade. Rekognition analisa imagens, Translate traduz textos e Amplify acelera o desenvolvimento de apps.",
        topic: "Segurança e governança",
        options: [
            ["AWS CloudTrail, que registra as chamadas de API feitas na conta", true],
            ["Amazon Rekognition, que analisa imagens e vídeos com visão computacional", false],
            ["Amazon Translate, que traduz textos entre diferentes idiomas", false],
            ["AWS Amplify, que acelera o desenvolvimento de aplicações web e mobile", false],
        ],
    },
    {
        statement:
            "Depois de implantar um modelo em produção, quais recursos ajudam a monitorar a operação e a qualidade ao longo do tempo? (Selecione DUAS opções.)",
        explanation:
            "Amazon CloudWatch acompanha métricas e logs operacionais, e o SageMaker Model Monitor detecta desvios (drift) na qualidade do modelo. Polly gera voz, AWS Budgets controla gastos e Lex faz chatbots.",
        topic: "Segurança e governança",
        options: [
            ["Amazon CloudWatch, para acompanhar métricas e logs operacionais", true],
            ["Amazon SageMaker Model Monitor, para detectar desvios na qualidade do modelo", true],
            ["Amazon Polly, para converter as previsões do modelo em áudio", false],
            ["AWS Budgets, para definir alertas de gasto financeiro na conta", false],
            ["Amazon Lex, para criar fluxos de conversa em chatbots", false],
        ],
    },
    {
        statement:
            "Para que as chamadas a um serviço de IA não trafeguem pela internet pública, mantendo o tráfego dentro da rede da AWS, qual recurso pode ser usado?",
        explanation:
            "AWS PrivateLink conecta a VPC ao serviço sem expor o tráfego à internet pública. Route 53 é DNS, SNS é mensageria por publicação e assinatura e Cost Explorer analisa custos da conta.",
        topic: "Segurança e governança",
        options: [
            ["AWS PrivateLink, que conecta a VPC ao serviço sem expor o tráfego à internet", true],
            ["Amazon Route 53, um serviço de DNS para resolução de nomes de domínio", false],
            ["Amazon SNS, um serviço de notificações por publicação e assinatura", false],
            ["AWS Cost Explorer, uma ferramenta de análise de custos da conta", false],
        ],
    },
    {
        statement:
            "Uma empresa regulada precisa obter relatórios de conformidade e certificações da AWS (como ISO e SOC) para uma auditoria. Onde esses documentos ficam disponíveis?",
        explanation:
            "AWS Artifact é o portal de relatórios de conformidade e certificações (ISO, SOC e outros). QuickSight é BI, Kinesis é ingestão em streaming e Step Functions orquestra fluxos de trabalho.",
        topic: "Segurança e governança",
        options: [
            ["AWS Artifact, o portal de relatórios de conformidade e certificações da AWS", true],
            ["Amazon QuickSight, uma ferramenta de business intelligence e dashboards", false],
            ["Amazon Kinesis, um serviço de ingestão de dados em streaming", false],
            ["AWS Step Functions, um orquestrador de fluxos de trabalho serverless", false],
        ],
    },
    {
        statement:
            "No contexto de governança de dados para IA, por que rastrear a origem e as transformações dos dados (linhagem) é importante?",
        explanation:
            "A linhagem de dados apoia auditoria, conformidade e reprodutibilidade, mostrando de onde os dados vieram e como foram tratados. Ela não substitui controle de acesso, não elimina viés por si só nem substitui a criptografia.",
        topic: "Segurança e governança",
        options: [
            ["Permite auditar de onde vieram os dados e como foram tratados antes do treino", true],
            ["Elimina a necessidade de qualquer controle de acesso aos conjuntos de dados", false],
            ["Garante que o modelo nunca apresentará viés em suas previsões", false],
            ["Substitui a criptografia dos dados em repouso e em trânsito", false],
        ],
    },
    // ===== Questões adicionais (banco ampliado para variar as tentativas) =====
    {
        statement: "Um time de logística quer que um sistema aprenda sozinho a melhor sequência de movimentos de um robô em um armazém, recebendo recompensa quando entrega rápido e penalidade quando colide com uma prateleira. Que tipo de aprendizado de máquina descreve melhor essa abordagem?",
        explanation: "O aprendizado por reforço é aquele em que um agente aprende por tentativa e erro, guiado por recompensas e penalidades, exatamente como o robô do cenário. O supervisionado depende de exemplos já rotulados com a resposta certa, o não supervisionado busca padrões sem rótulos e o semissupervisionado mistura poucos dados rotulados com muitos não rotulados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aprendizado supervisionado, treinando o modelo com um grande conjunto de exemplos previamente rotulados com a ação correta", false],
            ["Aprendizado não supervisionado", false],
            ["Aprendizado por reforço", true],
            ["Aprendizado semissupervisionado", false],
        ],
    },
    {
        statement: "Em uma apresentação técnica, alguém pergunta o que caracteriza o aprendizado profundo (deep learning) dentro do campo de machine learning. Qual resposta está correta?",
        explanation: "Deep learning é um subcampo do ML baseado em redes neurais com muitas camadas, capazes de aprender representações complexas dos dados. Não é sinônimo de IA, que é um conceito muito mais amplo, nem se define pelo hardware usado ou por uma etapa de limpeza de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["É um sinônimo de inteligência artificial, abrangendo qualquer sistema que tente imitar o raciocínio e o comportamento humano", false],
            ["O uso de redes neurais com várias camadas para aprender padrões complexos a partir dos dados", true],
            ["Qualquer modelo de ML executado em hardware com GPUs de alto desempenho", false],
            ["A etapa de limpeza profunda dos dados antes do treino do modelo", false],
        ],
    },
    {
        statement: "Uma central de atendimento recebe milhares de e-mails por dia e quer que um modelo direcione cada mensagem automaticamente para um entre quatro departamentos (financeiro, técnico, vendas e outros). Que tipo de tarefa de ML é essa?",
        explanation: "Direcionar cada e-mail para uma entre categorias predefinidas (os departamentos) é classificação. Regressão prevê valores numéricos contínuos, clustering agrupa sem categorias definidas e a redução de dimensionalidade apenas comprime as variáveis, sem rotular as mensagens.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Regressão, já que a saída desejada seria um número contínuo", false],
            ["Clustering, agrupando os e-mails por similaridade sem categorias predefinidas", false],
            ["Redução de dimensionalidade dos textos recebidos", false],
            ["Classificação em categorias predefinidas", true],
        ],
    },
    {
        statement: "Qual é a diferença fundamental entre um problema de regressão e um de classificação no aprendizado supervisionado?",
        explanation: "Na regressão a saída é um número contínuo; na classificação, uma categoria discreta. Ambas usam dados rotulados no aprendizado supervisionado, funcionam com diferentes tipos de dados e são usadas tanto no treino quanto na inferência, o que elimina as demais opções.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["A regressão prevê um valor numérico contínuo, enquanto a classificação atribui uma categoria discreta", true],
            ["A regressão usa dados rotulados e a classificação sempre usa dados sem rótulo algum", false],
            ["A regressão só aceita dados estruturados em tabelas, ao passo que a classificação só serve para imagens e vídeos", false],
            ["A regressão ocorre apenas no treino e a classificação apenas na inferência em produção", false],
        ],
    },
    {
        statement: "Um modelo apresenta desempenho ruim tanto nos dados de treino quanto nos de teste, indicando que é simples demais para capturar os padrões presentes nos dados. Como esse problema é chamado?",
        explanation: "Desempenho ruim tanto no treino quanto no teste indica underfitting: o modelo é simples demais para os padrões dos dados. Overfitting seria bom no treino e ruim em dados novos, enquanto vazamento de dados e desbalanceamento de classes descrevem outros problemas.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Overfitting, quando o modelo decora os dados de treino e vai mal em dados novos", false],
            ["Vazamento de dados entre os conjuntos de treino e teste", false],
            ["Underfitting (subajuste)", true],
            ["Desbalanceamento entre as classes do problema", false],
        ],
    },
    {
        statement: "Uma equipe percebeu que seu modelo está com overfitting, indo muito bem no treino e mal em dados novos. Qual medida ajuda a REDUZIR o overfitting?",
        explanation: "Mais dados de treino e regularização reduzem o overfitting ao limitar a memorização dos exemplos. Treinar por mais épocas, aumentar a complexidade do modelo ou descartar os dados de validação tendem a agravar o overfitting, não a resolvê-lo.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aumentar o volume e a diversidade dos dados de treino e aplicar regularização", true],
            ["Continuar o treino por muito mais épocas para reduzir ainda mais o erro nos dados de treino", false],
            ["Acrescentar mais parâmetros e camadas para deixar o modelo mais complexo", false],
            ["Descartar o conjunto de validação e usar todos os registros no treino", false],
        ],
    },
    {
        statement: "No equilíbrio entre viés (bias) e variância (variance) de um modelo, o que costuma acontecer quando o modelo é complexo demais para o problema?",
        explanation: "Modelos complexos demais costumam ter alta variância e tendem ao overfitting; modelos simples demais têm alto viés e underfitting. Viés e variância não caem juntos a zero, e um modelo treinado não passa a prever de forma totalmente aleatória.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Alto viés (bias), levando o modelo ao underfitting", false],
            ["Alta variância, levando o modelo ao overfitting", true],
            ["Tanto o viés quanto a variância desaparecem por completo", false],
            ["O modelo deixa de considerar as features e passa a prever de forma aleatória", false],
        ],
    },
    {
        statement: "No treino de um modelo supervisionado para prever inadimplência, informações como renda, idade e histórico de pagamento do cliente são usadas como entradas do modelo. Como esses atributos de entrada são chamados?",
        explanation: "Os atributos de entrada usados pelo modelo (renda, idade, histórico) são as features. Rótulos são a resposta que o modelo deve prever, hiperparâmetros configuram o algoritmo e épocas contam as passagens completas pelos dados de treino.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Rótulos (labels), que representam a resposta que o modelo deve prever", false],
            ["Hiperparâmetros de configuração do algoritmo de treino", false],
            ["Épocas, o número de passagens completas do algoritmo pelos dados de treino", false],
            ["Features, os atributos de entrada usados pelo modelo", true],
        ],
    },
    {
        statement: "Ao dividir os dados em treino, validação e teste, para que serve especificamente o conjunto de validação?",
        explanation: "O conjunto de validação serve para ajustar hiperparâmetros e comparar versões do modelo durante o desenvolvimento. O treino ajusta os pesos, o teste fornece a estimativa final e imparcial reservada para o fim do projeto, e nenhum deles guarda dados descartados por qualidade.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Ajustar hiperparâmetros e comparar versões do modelo durante o desenvolvimento", true],
            ["Treinar e ajustar os pesos internos finais do modelo", false],
            ["Servir como estimativa final e imparcial do desempenho, reservada para o fim do projeto", false],
            ["Guardar os registros descartados por problemas de qualidade", false],
        ],
    },
    {
        statement: "Um filtro de spam corporativo está enviando muitos e-mails legítimos para a lixeira (falsos positivos), o que irrita os usuários. Para reduzir esse tipo específico de erro, qual métrica a equipe deve priorizar melhorar?",
        explanation: "Falsos positivos, ou seja, e-mails legítimos marcados como spam, atacam a precisão, então melhorar a precisão reduz esse erro. Recall foca nos falsos negativos, MAE é métrica de regressão e o tempo de inferência não mede acerto de classificação.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Recall (sensibilidade) do classificador", false],
            ["MAE, o erro absoluto médio das previsões", false],
            ["Precisão (precision)", true],
            ["O tempo médio de inferência para processar cada mensagem recebida", false],
        ],
    },
    {
        statement: "Uma equipe quer uma única métrica que equilibre precisão e recall ao avaliar um classificador com classes bastante desbalanceadas. Qual métrica atende a esse objetivo?",
        explanation: "O F1-score é a média harmônica entre precisão e recall, útil justamente quando há desbalanceamento entre as classes. A acurácia pode enganar nesses casos, e RMSE e R2 são métricas de regressão, não de classificação.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Acurácia, a proporção total de acertos do modelo", false],
            ["F1-score", true],
            ["RMSE, a raiz do erro quadrático médio", false],
            ["Coeficiente de determinação (R2) das previsões do modelo", false],
        ],
    },
    {
        statement: "Ao avaliar um classificador, uma tabela mostra as contagens de verdadeiros positivos, falsos positivos, verdadeiros negativos e falsos negativos. Que ferramenta de avaliação é essa?",
        explanation: "A tabela que cruza verdadeiros e falsos positivos e negativos é a matriz de confusão. A curva ROC relaciona taxas em vários limiares, enquanto o histograma de resíduos e a matriz de correlação entre features servem a outros propósitos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Curva ROC do classificador", false],
            ["Histograma dos resíduos das previsões", false],
            ["Matriz de correlação entre as variáveis de entrada", false],
            ["Matriz de confusão", true],
        ],
    },
    {
        statement: "Um cientista de dados avalia um classificador binário observando a curva que relaciona a taxa de verdadeiros positivos e a de falsos positivos em diferentes limiares. Um valor de AUC próximo de 1 indica o quê?",
        explanation: "Uma AUC próxima de 1 indica que o modelo separa bem as classes; próxima de 0,5 equivaleria a um palpite aleatório. A curva ROC por si só não confirma overfitting nem desbalanceamento do conjunto de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Que o modelo tem boa capacidade de distinguir as classes", true],
            ["Que o modelo certamente está sofrendo de overfitting", false],
            ["Que o desempenho é pior do que o de um simples palpite aleatório", false],
            ["Que o conjunto de dados de treino está fortemente desbalanceado", false],
        ],
    },
    {
        statement: "Um modelo que detecta uma doença rara, presente em apenas 1% dos casos, alcançou 99% de acurácia simplesmente prevendo 'saudável' para todo mundo. Por que a acurácia é uma métrica enganosa nesse cenário?",
        explanation: "Com uma classe presente em apenas 1% dos casos, prever sempre 'saudável' gera 99% de acurácia sem detectar nenhum doente, ou seja, a métrica mascara o mau desempenho na classe rara. Acurácia se aplica a classificação, 99% não é ruim por si só e ela não mede latência.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Porque a acurácia só se aplica a problemas de regressão contínua, nunca a classificação", false],
            ["Porque um valor de 99% é sempre sinal de erro de medição no experimento", false],
            ["Porque, com classes muito desbalanceadas, ela esconde o mau desempenho na classe rara", true],
            ["Porque a acurácia mede a latência de resposta do modelo, e não a qualidade das previsões geradas", false],
        ],
    },
    {
        statement: "Para avaliar um modelo de regressão que prevê a demanda diária de um produto em unidades, quais métricas são apropriadas?",
        explanation: "MAE e RMSE medem a diferença entre os valores previstos e os reais, adequadas a regressão. Precisão, recall, matriz de confusão, F1 e AUC/ROC são métricas de classificação, inapropriadas para avaliar a previsão de uma quantidade numérica.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Precisão e recall", false],
            ["MAE e RMSE", true],
            ["Matriz de confusão e F1-score", false],
            ["Área sob a curva ROC (AUC), típica de classificadores binários", false],
        ],
    },
    {
        statement: "Uma empresa armazena dados de vendas em tabelas com colunas bem definidas (data, produto, valor) e também guarda vídeos e áudios das gravações de atendimento. Como classificar esses dois tipos de dados, respectivamente?",
        explanation: "Tabelas com colunas bem definidas são dados estruturados; vídeos e áudios são dados não estruturados. As demais opções invertem os conceitos ou classificam ambos os tipos de forma incorreta.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Não estruturados e estruturados, respectivamente", false],
            ["Os dois tipos são considerados estruturados", false],
            ["Os dois são semiestruturados, por pertencerem à mesma base corporativa", false],
            ["Estruturados e não estruturados, respectivamente", true],
        ],
    },
    {
        statement: "No ciclo de vida de um projeto de machine learning, qual sequência representa melhor a ordem geral das principais etapas?",
        explanation: "O fluxo geral vai de coletar e preparar os dados a treinar, avaliar, implantar e monitorar o modelo. As outras sequências colocam etapas fora de ordem, como implantar ou avaliar antes mesmo de ter os dados coletados e o modelo treinado.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Coletar e preparar os dados, treinar, avaliar, implantar e monitorar", true],
            ["Implantar o modelo em produção, depois treiná-lo, em seguida coletar os dados e por último avaliar os resultados", false],
            ["Treinar primeiro, coletar os dados depois, monitorar e só então avaliar o desempenho", false],
            ["Avaliar, implantar, coletar os dados e por fim treinar o modelo do zero", false],
        ],
    },
    {
        statement: "Uma equipe quer começar rapidamente a partir de modelos pré-treinados e soluções prontas dentro do Amazon SageMaker, com a possibilidade de ajustá-los às suas necessidades. Qual recurso atende a isso?",
        explanation: "O SageMaker JumpStart oferece modelos pré-treinados e soluções prontas para acelerar o início de um projeto e permitir ajustes. O Canvas é voltado a modelos no-code, o Macie protege dados sensíveis e o Ground Truth cuida da rotulagem de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon SageMaker Canvas, para criar modelos em interface no-code", false],
            ["Amazon Macie, para descoberta de dados sensíveis", false],
            ["Amazon SageMaker JumpStart", true],
            ["Amazon SageMaker Ground Truth, para rotulagem de dados de treino", false],
        ],
    },
    {
        statement: "O que caracteriza uma abordagem de AutoML (aprendizado de máquina automatizado)?",
        explanation: "AutoML automatiza etapas como a seleção do algoritmo, o ajuste de hiperparâmetros e a escolha de features. Ele não dispensa a necessidade de dados, não garante ausência de viés ou erros nem elimina a etapa de treino do modelo.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Eliminar por completo a necessidade de dados históricos para treinar o modelo", false],
            ["Automatizar a escolha do algoritmo, o ajuste de hiperparâmetros e a seleção de features", true],
            ["Assegurar que o modelo resultante jamais apresentará viés ou erros de previsão", false],
            ["Permitir que o modelo faça inferência em produção sem exigir nenhuma etapa de treino ou preparação anterior", false],
        ],
    },
    {
        statement: "Durante a fase de treino de um modelo de machine learning supervisionado, o que essencialmente acontece?",
        explanation: "No treino, o algoritmo ajusta seus parâmetros internos a partir dos exemplos para reduzir o erro das previsões. Guardar dados apenas para consulta, gerar previsões em produção (que é a inferência) e rotular manualmente as saídas descrevem outras coisas.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["O modelo apenas guarda os dados brutos para depois consultá-los um a um quando for necessário", false],
            ["O modelo gera as previsões finais sobre os dados novos que chegam em produção", false],
            ["Os usuários finais rotulam manualmente cada previsão à medida que ela é gerada", false],
            ["O algoritmo ajusta seus parâmetros internos com base nos exemplos para reduzir o erro", true],
        ],
    },
    {
        statement: "A arquitetura transformer, base da maioria dos LLMs modernos, pondera a importância de diferentes partes da sequência de entrada ao processar cada token. Como esse mecanismo é conhecido?",
        explanation: "O diferencial do transformer é o mecanismo de atenção, que pondera a relevância de cada token em relação aos demais. Convolução e pooling são típicos de redes convolucionais, e a recorrência caracteriza as RNNs anteriores ao transformer.",
        topic: "IA generativa",
        options: [
            ["Convolução, que desliza filtros sobre a entrada para extrair características locais como em imagens", false],
            ["Recorrência, que processa a sequência token a token mantendo um estado oculto repassado adiante", false],
            ["Mecanismo de atenção (attention)", true],
            ["Agrupamento (pooling), que reduz a dimensionalidade combinando valores vizinhos em um resumo", false],
        ],
    },
    {
        statement: "Qual afirmação distingue corretamente um modelo generativo de um modelo discriminativo?",
        explanation: "Modelos generativos aprendem a distribuição dos dados para criar novos exemplos, enquanto os discriminativos aprendem fronteiras para classificar. A distinção não depende do tipo de dado nem exclusivamente do uso de rótulos.",
        topic: "IA generativa",
        options: [
            ["O generativo cria novos conteúdos, e o discriminativo separa classes de dados existentes", true],
            ["O generativo só funciona com imagens, enquanto o discriminativo trabalha exclusivamente com texto e dados tabulares", false],
            ["Ambos apenas classificam dados, diferindo somente na quantidade de camadas da rede neural que utilizam", false],
            ["O generativo exige dados rotulados manualmente, ao passo que o discriminativo aprende sempre sem qualquer rótulo", false],
        ],
    },
    {
        statement: "Uma empresa quer um foundation model capaz de receber uma imagem junto com uma pergunta em texto e responder sobre o conteúdo da imagem. Que característica do modelo é essencial para isso?",
        explanation: "Modelos multimodais aceitam mais de um tipo de entrada, como texto e imagem, sendo necessários para interpretar uma imagem junto de uma pergunta. RLHF melhora o alinhamento e a difusão gera imagens, mas nenhum dos dois dá essa capacidade.",
        topic: "IA generativa",
        options: [
            ["Ser treinado com aprendizado por reforço a partir de feedback humano para alinhar as respostas ao usuário", false],
            ["Ter uma janela de contexto pequena para reduzir o custo de cada chamada de inferência ao modelo", false],
            ["Usar exclusivamente modelos de difusão, a única categoria capaz de interpretar imagens de entrada", false],
            ["Ser multimodal, processando mais de um tipo de entrada como texto e imagem", true],
        ],
    },
    {
        statement: "No Amazon Bedrock, o que é a família de modelos Amazon Titan?",
        explanation: "O Amazon Titan é a família de foundation models desenvolvida pela AWS, disponível no Bedrock para geração de texto, embeddings e imagens. Não são instâncias de GPU, ferramenta de rotulagem nem serviço exclusivo de terceiros.",
        topic: "IA generativa",
        options: [
            ["Um conjunto de instâncias de GPU otimizadas que o cliente aluga para treinar seus próprios modelos do zero", false],
            ["Foundation models criados pela própria AWS, oferecidos para tarefas como geração de texto e de embeddings", true],
            ["Uma ferramenta de rotulagem de dados que prepara datasets antes do treinamento supervisionado de modelos", false],
            ["Um serviço separado do Bedrock que hospeda apenas modelos de imagem de provedores terceiros", false],
        ],
    },
    {
        statement: "Uma equipe de desenvolvimento quer um assistente de IA integrado ao ambiente de codificação que sugira trechos de código, explique funções e ajude a depurar. Qual serviço da AWS é o mais indicado?",
        explanation: "O Amazon Q Developer é o assistente de IA generativa voltado a desenvolvedores, com sugestão e explicação de código e apoio à depuração. Q Business foca em dados corporativos, Comprehend em NLP e Polly em síntese de voz.",
        topic: "IA generativa",
        options: [
            ["Amazon Q Developer", true],
            ["Amazon Q Business, voltado a responder perguntas sobre documentos e dados corporativos internos", false],
            ["Amazon Comprehend, que extrai entidades e sentimentos de textos em linguagem natural", false],
            ["Amazon Polly, que converte texto em fala com vozes naturais em vários idiomas", false],
        ],
    },
    {
        statement: "Uma pessoa iniciante quer experimentar e prototipar aplicativos de IA generativa em um ambiente pronto, sem escrever código nem provisionar infraestrutura. O que é o PartyRock, da AWS, nesse contexto?",
        explanation: "O PartyRock é um playground do Amazon Bedrock para construir e explorar apps de IA generativa sem código. Não é banco vetorial, serviço de treino distribuído nem ferramenta de linha de comando para deploy.",
        topic: "IA generativa",
        options: [
            ["Um banco de dados vetorial totalmente gerenciado usado para armazenar embeddings em aplicações de busca semântica de larga escala", false],
            ["Um serviço de treinamento distribuído que particiona grandes modelos entre várias GPUs automaticamente", false],
            ["Um playground no Amazon Bedrock para criar e experimentar apps de IA generativa sem código", true],
            ["Uma ferramenta de linha de comando para implantar modelos treinados em endpoints do SageMaker", false],
        ],
    },
    {
        statement: "Uma cientista de dados quer acessar foundation models e soluções pré-construídas dentro do Amazon SageMaker para implantar e ajustar modelos rapidamente. Qual recurso oferece esse catálogo?",
        explanation: "O SageMaker JumpStart oferece um hub de foundation models e soluções pré-construídas para acelerar o deploy e o ajuste. Ground Truth faz rotulagem, Feature Store gerencia atributos e Clarify trata viés e explicabilidade.",
        topic: "IA generativa",
        options: [
            ["SageMaker Ground Truth, que gerencia fluxos de rotulagem de dados feita por revisores humanos ou de forma automatizada", false],
            ["SageMaker Feature Store, que armazena e serve atributos de ML de forma centralizada", false],
            ["SageMaker Clarify, que analisa viés e explica as previsões dos modelos", false],
            ["SageMaker JumpStart", true],
        ],
    },
    {
        statement: "Um desenvolvedor envia exatamente o mesmo prompt a um LLM duas vezes e recebe respostas com redações diferentes. Como se explica esse comportamento?",
        explanation: "LLMs costumam amostrar o próximo token de forma probabilística, então a mesma entrada pode gerar respostas diferentes (não-determinismo). Não é erro nem estouro de contexto, e reduzir a temperatura torna a saída mais estável.",
        topic: "IA generativa",
        options: [
            ["O modelo travou e retornou um erro interno, pois o mesmo prompt deveria gerar sempre a resposta idêntica palavra por palavra", false],
            ["LLMs geralmente têm saída não-determinística, com amostragem probabilística que pode variar entre chamadas", true],
            ["A janela de contexto foi excedida, o que obriga o modelo a inventar tokens aleatórios no lugar da resposta correta", false],
            ["Os embeddings do prompt mudam a cada requisição porque são recalculados com valores aleatórios diferentes", false],
        ],
    },
    {
        statement: "Ao ajustar os parâmetros de inferência de um LLM, o que o parâmetro top-p (nucleus sampling) controla?",
        explanation: "O top-p limita a amostragem ao menor conjunto de tokens cuja soma de probabilidades alcança p, controlando a diversidade. Limitar o tamanho é papel do máximo de tokens, exemplos no prompt são few-shot e as camadas são fixas na arquitetura.",
        topic: "IA generativa",
        options: [
            ["Restringe a escolha do próximo token ao menor conjunto cuja probabilidade acumulada atinge o valor p", true],
            ["Define o número máximo de tokens que a resposta pode conter antes de o modelo ser interrompido automaticamente", false],
            ["Determina quantos exemplos devem ser incluídos no prompt para orientar o formato da resposta desejada", false],
            ["Fixa a quantidade de camadas de atenção que o modelo ativa durante o processamento de cada requisição", false],
        ],
    },
    {
        statement: "Qual é o efeito de reduzir o parâmetro top-k na geração de texto de um LLM?",
        explanation: "Reduzir o top-k deixa menos candidatos a próximo token, tornando a saída mais focada e previsível. Isso não altera a janela de contexto, não libera todos os tokens nem afeta o treinamento.",
        topic: "IA generativa",
        options: [
            ["O modelo passa a aceitar prompts mais longos, aumentando proporcionalmente o tamanho da janela de contexto disponível", false],
            ["O modelo aumenta a criatividade ao sortear livremente entre todos os tokens do vocabulário sem qualquer corte", false],
            ["O modelo reduz o tempo de treinamento necessário para aprender novos idiomas a partir de dados adicionais", false],
            ["O modelo considera menos candidatos a próximo token, tornando a saída mais restrita e previsível", true],
        ],
    },
    {
        statement: "Uma equipe compara dois foundation models para um chatbot: um modelo grande e um modelo menor. Que tradeoff geral costuma valer nessa escolha?",
        explanation: "Modelos maiores costumam ser mais capazes, mas custam mais e respondem com mais latência; menores são mais baratos e rápidos, com possível perda de qualidade. As demais opções invertem ou negam esse tradeoff.",
        topic: "IA generativa",
        options: [
            ["O modelo menor sempre entrega respostas de qualidade superior porque foi treinado com muito mais dados e parâmetros", false],
            ["O modelo maior tende a ser mais capaz, porém com maior custo e latência por requisição", true],
            ["Ambos têm exatamente o mesmo custo e a mesma latência, já que rodam na mesma infraestrutura gerenciada", false],
            ["O modelo maior reduz a latência porque precisa de menos cálculos para gerar cada token da resposta", false],
        ],
    },
    {
        statement: "Em qual cenário a IA generativa é MENOS apropriada, sendo o ML tradicional a melhor escolha?",
        explanation: "Prever um valor numérico a partir de dados históricos é regressão, bem resolvida por ML tradicional. Redigir e-mails, gerar imagens e resumir textos são casos típicos de IA generativa.",
        topic: "IA generativa",
        options: [
            ["Redigir automaticamente rascunhos de e-mails de marketing personalizados a partir de instruções em texto livre", false],
            ["Gerar variações de imagens de produtos para campanhas a partir de descrições textuais fornecidas", false],
            ["Prever numericamente a demanda de estoque do próximo mês a partir de dados históricos de vendas", true],
            ["Resumir longos relatórios em poucos parágrafos preservando os pontos principais para os executivos", false],
        ],
    },
    {
        statement: "Antes de um LLM processar um texto, ele passa pela tokenização. O que ocorre nessa etapa?",
        explanation: "A tokenização quebra o texto em tokens (palavras ou subpalavras) mapeados para IDs numéricos que o modelo processa. Não há tradução obrigatória, criptografia nem busca por respostas prontas.",
        topic: "IA generativa",
        options: [
            ["O texto é dividido em unidades menores (tokens) que o modelo converte em números", true],
            ["O texto é traduzido automaticamente para o inglês, único idioma que os grandes modelos conseguem processar internamente", false],
            ["O texto é comprimido em um arquivo binário criptografado para trafegar com segurança até o servidor de inferência", false],
            ["O texto é comparado com um banco de dados de respostas prontas para localizar a saída mais parecida", false],
        ],
    },
    {
        statement: "No Amazon Bedrock, o modo de precificação sob demanda (on-demand) para foundation models cobra com base em quê?",
        explanation: "No modo sob demanda paga-se pelo uso, tipicamente por tokens de entrada e de saída, sem compromisso de longo prazo. Não é taxa fixa ilimitada, não exige provisionar GPUs nem cobra por usuário cadastrado.",
        topic: "IA generativa",
        options: [
            ["Em uma taxa mensal fixa que dá direito a chamadas ilimitadas a qualquer modelo disponível no serviço", false],
            ["No número de servidores de GPU que o cliente precisa provisionar e manter ligados o tempo todo", false],
            ["Na quantidade de usuários cadastrados na conta, independentemente de quantas requisições cada um faz", false],
            ["No volume processado, como a quantidade de tokens de entrada e de saída", true],
        ],
    },
    {
        statement: "Um desenvolvedor descreve em linguagem natural a função que precisa e recebe do assistente uma implementação em Python pronta para revisar. Que capacidade de IA generativa está sendo usada?",
        explanation: "Transformar uma descrição em linguagem natural em código pronto é um caso clássico de geração de código. As demais opções descrevem classificação, detecção de anomalias e OCR.",
        topic: "IA generativa",
        options: [
            ["Classificação de sentimentos do texto para medir a satisfação do desenvolvedor com a linguagem escolhida", false],
            ["Geração de código a partir de linguagem natural", true],
            ["Detecção de anomalias em métricas de infraestrutura para prever falhas antes que elas aconteçam", false],
            ["Reconhecimento óptico de caracteres para extrair texto de imagens de documentos escaneados", false],
        ],
    },
    {
        statement: "Um departamento jurídico recebe contratos de dezenas de páginas e quer versões curtas com os pontos principais para leitura rápida. Qual capacidade de IA generativa atende diretamente a essa necessidade?",
        explanation: "Reduzir documentos longos a resumos com os pontos-chave é sumarização, um uso central da IA generativa. Tradução, síntese de voz e criptografia resolvem outras necessidades.",
        topic: "IA generativa",
        options: [
            ["Tradução simultânea dos contratos para diversos idiomas estrangeiros exigidos por filiais no exterior", false],
            ["Conversão dos contratos em áudio narrado para que a equipe possa ouvir durante os deslocamentos", false],
            ["Sumarização de textos longos", true],
            ["Criptografia do conteúdo dos contratos para impedir acesso não autorizado aos dados sensíveis", false],
        ],
    },
    {
        statement: "Uma empresa quer um chatbot de atendimento que entenda perguntas escritas de forma livre pelos clientes e responda em linguagem natural. Por que um LLM é adequado nesse caso?",
        explanation: "LLMs entendem e produzem linguagem natural, sustentando diálogos com respostas contextualizadas, ideais para chatbots. Eles não garantem correção total, não conhecem dados internos sem integração nem se limitam a roteiros fixos.",
        topic: "IA generativa",
        options: [
            ["Ele interpreta e gera linguagem natural, mantendo diálogo com respostas contextualizadas", true],
            ["Ele garante respostas sempre 100% corretas e verificadas, eliminando por completo qualquer supervisão humana", false],
            ["Ele dispensa qualquer conexão com dados ou sistemas da empresa, pois já sabe de fábrica todas as políticas internas", false],
            ["Ele funciona apenas com perguntas de múltipla escolha previamente cadastradas em um roteiro fixo", false],
        ],
    },
    {
        statement: "Como, em linhas gerais, os modelos de difusão geram uma imagem?",
        explanation: "Modelos de difusão partem de ruído e o removem gradualmente, condicionados pelo prompt, até formar uma imagem nova. Não colam trechos de fotos, não buscam uma imagem pronta nem mapeiam palavras diretamente para pixels.",
        topic: "IA generativa",
        options: [
            ["Recortam e colam pedaços de fotos reais de um banco de imagens até montar a composição final solicitada", false],
            ["Selecionam a imagem mais parecida já armazenada e apenas ajustam o brilho e o contraste conforme o pedido", false],
            ["Traduzem cada palavra do prompt em um pixel fixo segundo uma tabela pré-definida de cores", false],
            ["Partem de ruído aleatório e o refinam passo a passo até formar a imagem", true],
        ],
    },
    {
        statement: "Em uma busca semântica, dois textos com significados parecidos tendem a ter embeddings que se comportam como?",
        explanation: "Embeddings mapeiam textos para vetores em que a proximidade indica semelhança de significado, base da busca semântica. Eles não exigem palavras idênticas, não são aleatórios nem imagens.",
        topic: "IA generativa",
        options: [
            ["Sequências de caracteres idênticas, já que textos parecidos precisam usar exatamente as mesmas palavras", false],
            ["Vetores próximos no espaço, refletindo a semelhança de significado", true],
            ["Valores numéricos totalmente aleatórios, sem qualquer relação com o conteúdo original dos textos", false],
            ["Arquivos de imagem que representam visualmente cada frase para comparação pixel a pixel", false],
        ],
    },
    {
        statement: "Uma aplicação envia um documento muito extenso a um LLM e parte do conteúdo parece ser ignorada. Qual limite do modelo provavelmente foi atingido?",
        explanation: "A janela de contexto define o total de tokens que o modelo considera de uma vez; conteúdo que a excede é ignorado ou truncado. Temperatura, embeddings e número de parâmetros não causam esse corte.",
        topic: "IA generativa",
        options: [
            ["A temperatura, parâmetro que ao chegar ao máximo faz o modelo descartar o início do texto enviado", false],
            ["O número de embeddings gratuitos, que se esgota e passa a truncar automaticamente qualquer entrada adicional", false],
            ["A quantidade de parâmetros do modelo, que diminui conforme mais texto é enviado em uma única chamada", false],
            ["A janela de contexto, que limita quantos tokens o modelo processa de uma vez", true],
        ],
    },
    {
        statement: "Qual afirmação descreve corretamente a relação entre foundation models e LLMs?",
        explanation: "LLMs são foundation models focados em texto, mas há também FMs de imagem, áudio e multimodais, então nem todo FM é um LLM. As demais alternativas confundem ou invertem essa relação.",
        topic: "IA generativa",
        options: [
            ["LLMs são foundation models especializados em linguagem, e nem todo foundation model é um LLM", true],
            ["São termos idênticos e intercambiáveis, pois todo foundation model processa exclusivamente texto em linguagem natural", false],
            ["Foundation models são um subtipo de LLM voltado apenas para a geração de imagens a partir de descrições", false],
            ["Não há relação entre eles, pois LLMs não são treinados com grandes volumes de dados", false],
        ],
    },
    {
        statement: "Uma equipe precisa gerar embeddings de texto na AWS para uma busca semântica e prefere um modelo da própria Amazon no Bedrock. Qual opção atende?",
        explanation: "O Amazon Titan Embeddings é o modelo da AWS no Bedrock para gerar embeddings de texto usados em busca semântica. Lex cria chatbots, Textract extrai dados de documentos e Rekognition analisa imagens.",
        topic: "IA generativa",
        options: [
            ["Amazon Lex, serviço para construir interfaces de conversação e chatbots com reconhecimento de intenções e slots", false],
            ["Amazon Textract, que extrai texto, formulários e tabelas de documentos digitalizados", false],
            ["Amazon Titan Embeddings", true],
            ["Amazon Rekognition, que analisa imagens e vídeos para identificar objetos e rostos", false],
        ],
    },
    {
        statement: "Os parâmetros de inferência de um LLM, como temperature, top-p e top-k, servem principalmente para?",
        explanation: "Os parâmetros de inferência ajustam como o modelo amostra os tokens, controlando aleatoriedade e diversidade sem alterar seus pesos. Eles não retreinam o modelo, não definem fontes externas nem escolhem provedor.",
        topic: "IA generativa",
        options: [
            ["Retreinar os pesos internos do modelo a cada requisição para que ele aprenda com o novo prompt recebido", false],
            ["Influenciar a aleatoriedade e a diversidade do texto gerado na resposta", true],
            ["Definir quais fontes de dados externas o modelo deve consultar obrigatoriamente antes de responder", false],
            ["Selecionar automaticamente o provedor de nuvem mais barato para hospedar o modelo em cada chamada", false],
        ],
    },
    {
        statement: "Uma aplicação de atendimento em tempo real precisa de respostas com baixa latência. Qual abordagem ajuda a reduzir o tempo de resposta percebido pelo usuário?",
        explanation: "Modelos menores respondem mais rápido e o streaming mostra os tokens à medida que saem, reduzindo a latência percebida. Modelos maiores e respostas longas aumentam a latência, e a temperatura não afeta a velocidade.",
        topic: "IA generativa",
        options: [
            ["Escolher sempre o maior modelo disponível e pedir a maior quantidade possível de tokens em cada resposta", false],
            ["Aumentar a temperatura ao máximo para que o modelo produza cada token com mais rapidez e menos cálculo", false],
            ["Enviar todo o histórico da conversa repetido várias vezes no prompt para garantir contexto suficiente", false],
            ["Usar um modelo menor e transmitir a resposta em streaming conforme os tokens são gerados", true],
        ],
    },
    {
        statement: "Antes de indexar documentos longos em uma base de conhecimento para RAG, uma equipe divide cada documento em trechos menores. Por que essa etapa de 'chunking' costuma ser feita?",
        explanation: "Dividir em trechos permite gerar um embedding por trecho e recuperar apenas os pedaços mais relevantes, que cabem na janela de contexto do modelo.",
        topic: "RAG e customização",
        options: [
            ["Para que cada trecho vire um embedding e a busca retorne apenas as partes relevantes ao contexto do modelo", true],
            ["Para converter automaticamente todos os documentos em um único vetor de alta dimensão que representa a base inteira e dispensa a busca por similaridade", false],
            ["Para criptografar o conteúdo dos documentos antes de enviá-los ao foundation model durante a geração da resposta", false],
            ["Para treinar novamente o foundation model com os documentos, ajustando seus pesos a cada novo arquivo adicionado", false],
        ],
    },
    {
        statement: "Uma empresa jurídica quer que um foundation model conheça melhor a terminologia e o estilo de textos da sua área, usando um grande volume de documentos internos sem rótulos. Qual abordagem de customização se encaixa nesse objetivo?",
        explanation: "O pré-treino continuado usa um corpus grande e sem rótulos para adaptar o modelo ao vocabulário e ao estilo de um domínio, diferente do fine-tuning, que usa exemplos rotulados.",
        topic: "RAG e customização",
        options: [
            ["Retrieval-augmented generation, que injeta trechos recuperados no prompt sem alterar o modelo", false],
            ["Continued pre-training (pré-treino continuado), que adapta o modelo a um domínio usando um corpus amplo e não rotulado", true],
            ["Prompt engineering com exemplos few-shot cuidadosamente selecionados e um prompt de sistema detalhado que descreve todas as regras do domínio jurídico", false],
            ["Guardrails configurados para bloquear qualquer termo que não pertença ao vocabulário jurídico da empresa", false],
        ],
    },
    {
        statement: "Um banco quer que seu assistente responda sempre no mesmo tom de marca e em um formato fixo de resposta, comportamento que prompts e RAG não vêm mantendo de forma consistente. Qual abordagem tende a resolver melhor?",
        explanation: "Quando o objetivo é internalizar um tom e um formato de saída consistentes, o fine-tuning com exemplos rotulados costuma superar RAG e ajustes de prompt.",
        topic: "RAG e customização",
        options: [
            ["Aumentar a temperatura para o modelo variar mais o estilo das respostas", false],
            ["Adicionar mais documentos à base de conhecimento de RAG, já que recuperar mais trechos faz o modelo aprender o tom de marca ao longo do tempo", false],
            ["Reduzir a janela de contexto para forçar respostas mais curtas e padronizadas em qualquer situação", false],
            ["Fazer fine-tuning do modelo com exemplos rotulados no tom e no formato desejados", true],
        ],
    },
    {
        statement: "Ao configurar uma Amazon Bedrock Knowledge Base, a equipe precisa escolher onde armazenar os vetores gerados a partir dos documentos. Qual opção lista serviços que podem servir como banco vetorial nesse cenário?",
        explanation: "Bases de conhecimento do Bedrock podem usar bancos vetoriais como o OpenSearch Serverless e o Aurora PostgreSQL com a extensão pgvector para armazenar e buscar embeddings.",
        topic: "RAG e customização",
        options: [
            ["Amazon Polly e Amazon Transcribe", false],
            ["Amazon CloudFront e Amazon Route 53", false],
            ["Amazon OpenSearch Serverless e Aurora PostgreSQL com pgvector", true],
            ["Amazon QuickSight conectado a um data warehouse Redshift, que indexa os vetores automaticamente para busca por similaridade", false],
        ],
    },
    {
        statement: "Uma equipe vai fazer fine-tuning de um foundation model no Amazon Bedrock para uma tarefa específica. Como os dados de treino normalmente precisam ser preparados?",
        explanation: "O fine-tuning supervisionado usa exemplos rotulados com a entrada e a saída esperada, normalmente em arquivos no Amazon S3.",
        topic: "RAG e customização",
        options: [
            ["Como exemplos rotulados de entrada e saída desejada, em arquivos armazenados no Amazon S3", true],
            ["Como uma coleção de imagens sem rótulos que o serviço converte sozinho em pares de pergunta e resposta durante o treinamento", false],
            ["Como consultas SQL que extraem os dados diretamente de um banco relacional em tempo de inferência", false],
            ["Como embeddings pré-calculados que substituem a necessidade de qualquer exemplo de treino", false],
        ],
    },
    {
        statement: "Antes de investir em RAG ou fine-tuning, uma equipe quer testar a abordagem de menor custo e esforço para melhorar as respostas de um foundation model. Por onde começar?",
        explanation: "Prompt engineering é a abordagem mais barata e rápida de experimentar, pois não exige treino nem infraestrutura extra antes de partir para RAG ou fine-tuning.",
        topic: "RAG e customização",
        options: [
            ["Por continued pre-training com todo o histórico de documentos da empresa, pois isso garante o melhor resultado logo na primeira tentativa", false],
            ["Por treinar um modelo próprio do zero para a tarefa", false],
            ["Por prompt engineering, ajustando as instruções e os exemplos no prompt", true],
            ["Por provisionar um cluster de GPUs dedicado antes de qualquer teste", false],
        ],
    },
    {
        statement: "Em uma solução de RAG, qual é o papel do modelo de embeddings?",
        explanation: "O modelo de embeddings transforma textos em vetores que representam o significado; o mesmo modelo embute documentos e consultas para a busca por similaridade.",
        topic: "RAG e customização",
        options: [
            ["Gerar a resposta final em linguagem natural a partir dos trechos recuperados", false],
            ["Converter textos em vetores numéricos que capturam o significado, para permitir a busca por similaridade", true],
            ["Armazenar permanentemente os documentos originais e controlar as permissões de acesso de cada usuário à base", false],
            ["Traduzir os documentos para o idioma do usuário antes de exibir a resposta", false],
        ],
    },
    {
        statement: "Quando um usuário faz uma pergunta a um sistema de RAG, o que acontece na etapa de recuperação (retrieval)?",
        explanation: "Na recuperação, a pergunta é convertida em embedding e o sistema retorna os trechos mais próximos por similaridade, usados depois para compor a resposta.",
        topic: "RAG e customização",
        options: [
            ["O foundation model tem seus pesos reajustados com base na pergunta do usuário", false],
            ["Todos os documentos da base são enviados por completo dentro do prompt para que o modelo leia tudo antes de responder", false],
            ["A pergunta é encaminhada para um humano que seleciona manualmente os documentos relevantes", false],
            ["A pergunta vira um vetor e o sistema busca os trechos mais similares na base vetorial", true],
        ],
    },
    {
        statement: "Ao comparar abordagens de customização, qual afirmação está correta sobre os pesos do modelo?",
        explanation: "Fine-tuning e pré-treino continuado modificam os pesos do modelo; RAG e prompt engineering influenciam a resposta sem retreinar o modelo.",
        topic: "RAG e customização",
        options: [
            ["RAG e prompt engineering reajustam os pesos do modelo a cada consulta", false],
            ["Continued pre-training não altera os pesos e apenas adiciona documentos a uma base vetorial consultada em tempo de execução", false],
            ["Fine-tuning e continued pre-training alteram os pesos; RAG e prompt engineering não", true],
            ["Foundation models são imutáveis, portanto nenhuma dessas abordagens muda seu comportamento", false],
        ],
    },
    {
        statement: "Depois de fazer fine-tuning de um modelo para uma tarefa recorrente, qual benefício a equipe pode esperar em relação ao uso de prompts longos com muitos exemplos?",
        explanation: "Com o comportamento internalizado pelo fine-tuning, dá para usar prompts mais curtos e menos exemplos, o que pode reduzir custo e latência.",
        topic: "RAG e customização",
        options: [
            ["O modelo passa a atualizar sozinho seu conhecimento sobre fatos novos do mundo sem qualquer necessidade de retreinar ou de recuperar dados externos", false],
            ["O comportamento desejado fica embutido no modelo, reduzindo a necessidade de muitos exemplos no prompt", true],
            ["A janela de contexto do modelo passa a ser ilimitada", false],
            ["O modelo deixa de cobrar por tokens de entrada e de saída", false],
        ],
    },
    {
        statement: "Uma equipe sem experiência em construir pipelines de dados quer implementar RAG. Que trabalho o Amazon Bedrock Knowledge Bases automatiza para ela?",
        explanation: "A base de conhecimento gerencia a ingestão: faz o chunking, gera os embeddings e grava os vetores no banco vetorial, sem a equipe construir esse pipeline.",
        topic: "RAG e customização",
        options: [
            ["A criação de exemplos rotulados e o treino supervisionado de um modelo customizado", false],
            ["A definição das políticas de IAM, o provisionamento da VPC e a configuração de todo o monitoramento de custos da conta AWS", false],
            ["A escrita manual dos prompts de sistema e a curadoria humana de cada resposta gerada", false],
            ["A divisão dos documentos em trechos, a geração dos embeddings e o armazenamento no banco vetorial", true],
        ],
    },
    {
        statement: "Em uma arquitetura de RAG, o que fica armazenado no banco de dados vetorial após a ingestão dos documentos?",
        explanation: "O banco vetorial guarda os embeddings dos trechos junto a metadados que referenciam o texto original, o que permite recuperar a fonte e citar a resposta.",
        topic: "RAG e customização",
        options: [
            ["Os embeddings dos trechos, com metadados que apontam para o texto de origem", true],
            ["Os pesos ajustados do foundation model após o treinamento", false],
            ["Uma cópia integral do modelo de linguagem, incluindo o vocabulário de tokens e os parâmetros de inferência padrão de cada consulta", false],
            ["Apenas as perguntas históricas dos usuários, usadas para reordenar respostas futuras", false],
        ],
    },
    {
        statement: "Um desenvolvedor inclui no prompt exatamente um exemplo de pergunta com a resposta desejada antes de apresentar a tarefa real ao modelo. Como essa técnica é chamada?",
        explanation: "Fornecer um único exemplo no prompt caracteriza o one-shot; nenhum exemplo seria zero-shot e vários exemplos, few-shot.",
        topic: "Prompt engineering",
        options: [
            ["Zero-shot prompting", false],
            ["One-shot prompting", true],
            ["Chain-of-thought prompting, em que o modelo detalha cada passo do raciocínio antes de concluir a resposta final", false],
            ["Continued pre-training", false],
        ],
    },
    {
        statement: "Ao construir um assistente, a equipe define separadamente uma instrução que estabelece o papel do modelo, seu tom e as regras que ele deve seguir em toda a conversa. Que elemento é esse?",
        explanation: "O prompt de sistema define papel, tom e regras gerais do assistente, servindo de moldura para as demais mensagens da conversa.",
        topic: "Prompt engineering",
        options: [
            ["É a temperatura, um parâmetro numérico que determina o papel e as regras de comportamento que o assistente seguirá durante toda a conversa", false],
            ["É um embedding que representa as regras em forma de vetor", false],
            ["É o prompt de sistema, que orienta o comportamento geral do modelo", true],
            ["É a janela de contexto reservada para as respostas do usuário", false],
        ],
    },
    {
        statement: "Uma analista quer melhorar a qualidade das respostas de um LLM ajustando o prompt. Qual conjunto de elementos torna um prompt mais eficaz?",
        explanation: "Prompts eficazes costumam trazer uma instrução clara, o contexto necessário e o formato de saída desejado, o que reduz ambiguidade e melhora a resposta.",
        topic: "Prompt engineering",
        options: [
            ["Instrução clara, contexto relevante e o formato de saída esperado", true],
            ["Um texto propositalmente ambíguo e sem contexto, para que o modelo tenha total liberdade de interpretar a tarefa como preferir", false],
            ["Apenas uma palavra-chave isolada, sem qualquer instrução ou contexto", false],
            ["O maior número possível de perguntas diferentes em uma única mensagem", false],
        ],
    },
    {
        statement: "Uma equipe cria uma estrutura de prompt reutilizável com espaços reservados, como 'Resuma o seguinte texto: {texto}', preenchidos a cada chamada. Que recurso é esse?",
        explanation: "Templates de prompt definem uma estrutura fixa com variáveis preenchidas dinamicamente, padronizando as chamadas e facilitando o reuso.",
        topic: "Prompt engineering",
        options: [
            ["Um embedding de consulta", false],
            ["Um guardrail de conteúdo", false],
            ["Um processo de fine-tuning que grava permanentemente a instrução de resumo dentro dos pesos do modelo a cada execução", false],
            ["Um template de prompt com variáveis", true],
        ],
    },
    {
        statement: "Um usuário escreve um prompt pedindo que o modelo 'finja ser uma IA sem restrições' para obter uma resposta que as regras de segurança normalmente bloqueiam. Que tipo de ataque é esse?",
        explanation: "O jailbreak tenta contornar as salvaguardas do modelo, por exemplo pedindo que ele assuma um papel sem restrições para liberar conteúdo bloqueado.",
        topic: "Prompt engineering",
        options: [
            ["Alucinação, situação em que o modelo, ao interpretar mal a instrução, inventa fatos e referências que não existem na base de dados", false],
            ["Jailbreak, uma tentativa de burlar as salvaguardas do modelo", true],
            ["Overfitting do prompt aos dados de treino", false],
            ["Um erro de tokenização na entrada", false],
        ],
    },
    {
        statement: "Ao gerar um texto, uma equipe adiciona ao prompt instruções sobre o que o modelo NÃO deve fazer, como 'não use jargão técnico e não cite concorrentes'. Como se chama essa prática?",
        explanation: "O prompt negativo especifica o que o modelo deve evitar, ajudando a restringir o estilo e o conteúdo da resposta.",
        topic: "Prompt engineering",
        options: [
            ["Few-shot prompting", false],
            ["Continued pre-training, em que o modelo aprende com um corpus a evitar permanentemente jargão técnico e menções a concorrentes", false],
            ["Negative prompting (prompt negativo)", true],
            ["Prompt injection", false],
        ],
    },
    {
        statement: "Um aplicativo insere o texto enviado pelo usuário dentro de um prompt maior. A equipe teme que alguém escreva instruções para o modelo ignorar as regras do sistema. Qual medida ajuda a mitigar esse risco?",
        explanation: "Mitigar prompt injection envolve validar e isolar a entrada do usuário, aplicar guardrails e não misturar dados do usuário com as instruções de sistema.",
        topic: "Prompt engineering",
        options: [
            ["Aumentar a temperatura e o limite de tokens de saída, para que o modelo tenha liberdade de responder qualquer instrução que o usuário venha a inserir no texto", false],
            ["Publicar o prompt de sistema completo na interface para o usuário conferir", false],
            ["Desativar qualquer registro de log das chamadas ao modelo", false],
            ["Validar a entrada e usar guardrails, separando as instruções do sistema do conteúdo do usuário", true],
        ],
    },
    {
        statement: "Um modelo retorna respostas em formatos variados quando recebe apenas a instrução da tarefa. A equipe então acrescenta ao prompt dois ou três exemplos com o formato exato desejado. Por que isso ajuda?",
        explanation: "Poucos exemplos no prompt (few-shot) orientam o modelo a reproduzir o formato desejado em tempo de inferência, sem necessidade de retreino.",
        topic: "Prompt engineering",
        options: [
            ["Os exemplos guiam o modelo a seguir o padrão de saída, sem precisar treinar o modelo", true],
            ["Os exemplos reajustam os pesos do modelo permanentemente durante a inferência", false],
            ["Os exemplos aumentam a janela de contexto do modelo, o que por si só garante que qualquer formato de resposta seja sempre respeitado", false],
            ["Os exemplos substituem a necessidade de um banco vetorial em soluções de RAG", false],
        ],
    },
    {
        statement: "Uma empresa quer um assistente que receba fotos de produtos e gere descrições em texto a partir das imagens. Que critério deve guiar a escolha do foundation model?",
        explanation: "A tarefa exige interpretar imagens, então o modelo precisa ser multimodal; janela de contexto e preço não substituem o suporte a essa modalidade.",
        topic: "Aplicações de foundation models",
        options: [
            ["Escolher o modelo com a maior janela de contexto disponível, pois isso é o que determina a capacidade de interpretar imagens enviadas pelo usuário", false],
            ["Escolher qualquer modelo de texto, já que todos aceitam imagens como entrada", false],
            ["Escolher um modelo multimodal, capaz de receber imagens como entrada", true],
            ["Escolher o modelo mais barato por token, independentemente das modalidades que ele suporta", false],
        ],
    },
    {
        statement: "Uma equipe precisa classificar milhões de mensagens curtas por sentimento com baixo custo e, separadamente, redigir relatórios complexos que exigem raciocínio elaborado. Que estratégia de escolha de modelo faz sentido?",
        explanation: "Casar a capacidade do modelo com a complexidade da tarefa equilibra custo e qualidade: modelos menores atendem tarefas simples de alto volume e modelos maiores, tarefas que exigem mais raciocínio.",
        topic: "Aplicações de foundation models",
        options: [
            ["Usar o maior modelo disponível para as duas tarefas, sem considerar custo", false],
            ["Usar um modelo menor e barato na classificação e um modelo maior no relatório", true],
            ["Usar o mesmo modelo minúsculo para tudo, pois o tamanho do modelo não influencia a qualidade em tarefas de raciocínio mais elaborado", false],
            ["Escolher o modelo apenas pela popularidade, ignorando a complexidade de cada tarefa", false],
        ],
    },
    {
        statement: "Uma equipe quer avaliar se as respostas de um assistente soam úteis, educadas e alinhadas ao tom da marca, aspectos difíceis de medir por métricas numéricas. Que método de avaliação é mais adequado?",
        explanation: "Aspectos subjetivos como utilidade e tom são melhor avaliados por julgamento humano, já que métricas automáticas nem sempre capturam essas qualidades.",
        topic: "Aplicações de foundation models",
        options: [
            ["Medir exclusivamente a latência e o número de tokens por resposta, pois esses valores refletem diretamente o quão educada e útil a resposta é", false],
            ["Contar quantas vezes cada palavra aparece no conjunto de treino", false],
            ["Verificar o tamanho do arquivo do modelo em disco", false],
            ["Avaliação humana, com pessoas julgando a qualidade das respostas", true],
        ],
    },
    {
        statement: "Para avaliar automaticamente a qualidade de resumos gerados por um modelo, comparando-os a resumos de referência, qual tipo de recurso é apropriado?",
        explanation: "Métricas automáticas como ROUGE comparam a saída gerada com textos de referência e são comuns para avaliar resumos e outras tarefas de geração de texto.",
        topic: "Aplicações de foundation models",
        options: [
            ["Uma métrica automática como ROUGE, que compara a saída com textos de referência", true],
            ["Uma pesquisa de satisfação enviada aos usuários finais semanas depois, cujo resultado serve como métrica automática objetiva de qualidade do resumo", false],
            ["O parâmetro de temperatura usado durante a geração dos resumos", false],
            ["O número de documentos presentes no banco vetorial", false],
        ],
    },
    {
        statement: "Ao desenhar uma solução de RAG de ponta a ponta, qual sequência representa corretamente o fluxo em tempo de consulta?",
        explanation: "No RAG, a pergunta é transformada em embedding, os trechos mais relevantes são recuperados e enviados ao modelo, que gera a resposta fundamentada neles.",
        topic: "Aplicações de foundation models",
        options: [
            ["Converter a pergunta em embedding, recuperar trechos relevantes e enviá-los ao modelo para gerar a resposta", true],
            ["Fazer fine-tuning do modelo com a pergunta, publicar um novo endpoint e só então permitir que o usuário receba qualquer resposta do sistema", false],
            ["Gerar a resposta primeiro e depois procurar documentos que a confirmem no banco vetorial", false],
            ["Enviar a base inteira de documentos ao modelo a cada pergunta, sem nenhuma etapa de busca", false],
        ],
    },
    {
        statement: "Um assistente de suporte deve dar respostas factuais e consistentes, evitando variações a cada nova execução da mesma pergunta. Que ajuste de parâmetro de inferência favorece esse comportamento?",
        explanation: "Temperaturas baixas reduzem a aleatoriedade e tornam as respostas mais determinísticas e consistentes, o que é desejável em suporte factual.",
        topic: "Aplicações de foundation models",
        options: [
            ["Aumentar bastante a temperatura e o top_p, pois valores altos tornam as respostas mais previsíveis e idênticas entre execuções repetidas", false],
            ["Reduzir o limite de tokens de saída até que a resposta caiba em uma única palavra", false],
            ["Desligar o modelo de embeddings usado na etapa de recuperação", false],
            ["Usar uma temperatura baixa, para respostas mais determinísticas", true],
        ],
    },
    {
        statement: "Ao configurar um Agent for Amazon Bedrock para automatizar um processo, como a equipe define quais ações o agente pode executar, por exemplo chamar uma função que registra um pedido?",
        explanation: "Nos Agents for Amazon Bedrock, os action groups conectam o agente a funções (por exemplo, via Lambda), definindo as ações que ele pode executar.",
        topic: "Aplicações de foundation models",
        options: [
            ["Aumentando a temperatura do modelo até que ele descubra sozinho quais APIs chamar", false],
            ["Definindo action groups que associam o agente a funções, tipicamente via AWS Lambda", true],
            ["Adicionando os documentos das APIs a um banco vetorial, o que faz o agente executar automaticamente qualquer função encontrada durante a busca", false],
            ["Escrevendo um prompt negativo que lista tudo o que o agente não deve fazer", false],
        ],
    },
    {
        statement: "Em que situação um agente (Agents for Amazon Bedrock) é mais adequado do que uma solução de RAG simples que apenas responde perguntas?",
        explanation: "Agentes se justificam quando a solução precisa agir e orquestrar várias etapas, como chamar APIs e sistemas; para apenas responder com base em documentos, o RAG basta.",
        topic: "Aplicações de foundation models",
        options: [
            ["Quando o objetivo é apenas resumir um único documento curto que já cabe inteiro na janela de contexto do modelo, sem chamar nenhum sistema externo", false],
            ["Quando não há necessidade de chamar nenhuma API nem realizar ações", false],
            ["Quando a tarefa exige executar ações e coordenar várias etapas, não só recuperar informação", true],
            ["Quando se deseja apenas converter documentos em embeddings para busca", false],
        ],
    },
    {
        statement: "Uma empresa implanta um assistente de IA e exige um mecanismo para pausar, ajustar ou substituir o comportamento do sistema caso ele passe a agir de forma indesejada em produção. Essa capacidade corresponde a qual dimensão da IA responsável?",
        explanation: "Controlabilidade é a dimensão que trata da capacidade de supervisionar, guiar e intervir no comportamento de um sistema de IA, incluindo pausar ou ajustar sua operação.",
        topic: "IA responsável",
        options: [
            ["Explicabilidade, pois descreve em detalhes como o modelo processou as variáveis de entrada e chegou a cada previsão individual", false],
            ["Controlabilidade, a capacidade de monitorar e orientar o comportamento do sistema de IA", true],
            ["Veracidade, que garante que as respostas geradas sejam sempre factualmente corretas", false],
            ["Sustentabilidade, relacionada a reduzir o consumo de energia da infraestrutura de treino", false],
        ],
    },
    {
        statement: "Ao lançar um chatbot de atendimento, a equipe jurídica recomenda deixar claro ao usuário que ele conversa com um assistente de IA e informar suas limitações. Qual dimensão da IA responsável essa recomendação reforça?",
        explanation: "Transparência significa comunicar de forma clara quando a IA está sendo usada, além de suas capacidades e limitações, para que as pessoas saibam que interagem com um sistema automatizado.",
        topic: "IA responsável",
        options: [
            ["Robustez, que mede se o modelo mantém desempenho estável diante de entradas ruidosas ou inesperadas", false],
            ["Justiça (fairness), que busca evitar tratamento desigual entre diferentes grupos de pessoas", false],
            ["Privacidade, que trata da proteção de dados pessoais usados pelo sistema", false],
            ["Transparência, que envolve comunicar de forma aberta como e quando a IA é usada", true],
        ],
    },
    {
        statement: "Um banco usa um modelo para recomendar aprovação de crédito e precisa mostrar, para cada decisão, quais variáveis mais pesaram no resultado. Qual recurso ajuda a produzir essa atribuição de importância por previsão?",
        explanation: "O SageMaker Clarify fornece explicações de atributos baseadas em valores SHAP, indicando quanto cada variável contribuiu para uma previsão, o que apoia a explicabilidade.",
        topic: "IA responsável",
        options: [
            ["Amazon SageMaker Clarify, que calcula a contribuição de cada atributo para as previsões do modelo", true],
            ["Amazon SageMaker Model Monitor, voltado a detectar desvio de dados no ambiente de produção ao longo do tempo", false],
            ["Amazon Macie, que descobre e classifica dados sensíveis armazenados em buckets do Amazon S3", false],
            ["AWS CloudTrail, que registra as chamadas de API feitas na conta para fins de auditoria", false],
        ],
    },
    {
        statement: "Após avaliar um modelo de triagem de currículos, uma equipe percebe que a taxa de aprovação é muito menor para candidatas mulheres do que para homens com qualificações equivalentes. O que essa diferença indica?",
        explanation: "Resultados sistematicamente desiguais entre grupos comparáveis caracterizam um problema de justiça (fairness), uma dimensão central da IA responsável.",
        topic: "IA responsável",
        options: [
            ["Indica desvio de conceito (concept drift) e deve ser corrigido apenas com mais poder de computação no treino", false],
            ["Indica um problema de justiça (fairness), pois o modelo produz resultados sistematicamente desiguais entre grupos", true],
            ["Indica falta de explicabilidade, um problema que se resolve somente publicando o código-fonte completo do modelo para todos os usuários finais", false],
            ["Indica sobreajuste (overfitting), situação em que o modelo memoriza os dados de treino e falha em dados novos", false],
        ],
    },
    {
        statement: "Uma seguradora quer que seu assistente generativo no Amazon Bedrock remova automaticamente números de documentos e outros dados pessoais que apareçam nas respostas ao usuário. Qual recurso atende a essa necessidade?",
        explanation: "Os Guardrails do Amazon Bedrock incluem filtros de informações sensíveis capazes de detectar e mascarar ou bloquear dados pessoais (PII) em prompts e respostas.",
        topic: "IA responsável",
        options: [
            ["Ativar os filtros de informações sensíveis do Amazon Bedrock Guardrails para detectar e mascarar dados pessoais", true],
            ["Aumentar o valor do parâmetro de temperatura nas chamadas ao modelo para reduzir a repetição de dados sensíveis", false],
            ["Trocar o foundation model por um modelo de embeddings especializado em busca vetorial de documentos internos", false],
            ["Habilitar o AWS CloudTrail para registrar todas as chamadas de API feitas na conta e assim, por si só, impedir o vazamento de dados pessoais nas respostas", false],
        ],
    },
    {
        statement: "Durante os testes, um modelo de visão computacional funciona bem com fotos limpas, mas erra muito quando as imagens têm ruído, baixa iluminação ou pequenas distorções. Qual dimensão da IA responsável está em falha?",
        explanation: "Robustez é a dimensão que descreve a capacidade de um sistema manter desempenho confiável mesmo diante de entradas ruidosas, adversas ou fora do padrão de treino.",
        topic: "IA responsável",
        options: [
            ["Justiça (fairness), que se concentra em evitar disparidades de tratamento entre diferentes grupos de usuários", false],
            ["Sustentabilidade, que busca reduzir o consumo de recursos computacionais e o impacto ambiental do modelo", false],
            ["Robustez, a capacidade de manter desempenho confiável diante de entradas imperfeitas ou inesperadas", true],
            ["Transparência, que trata de comunicar de forma clara quando e como a IA é utilizada", false],
        ],
    },
    {
        statement: "Antes de liberar um modelo de linguagem para clientes, uma equipe quer medir com que frequência ele gera respostas ofensivas ou tóxicas. Qual abordagem é a mais adequada?",
        explanation: "Medir a frequência de saídas tóxicas exige avaliar as respostas do modelo com testes e métricas de toxicidade, prática apoiada por ferramentas de avaliação de modelos antes do lançamento.",
        topic: "IA responsável",
        options: [
            ["Confiar que modelos de fundação recentes nunca produzem conteúdo tóxico e liberar o modelo diretamente para produção", false],
            ["Reduzir o número máximo de tokens das respostas para que o modelo tenha menos espaço para gerar qualquer conteúdo ofensivo", false],
            ["Treinar o modelo do zero com uma quantidade muito maior de dados para eliminar por completo a possibilidade de toxicidade", false],
            ["Executar uma avaliação automatizada de toxicidade nas saídas do modelo usando conjuntos de teste e métricas apropriadas", true],
        ],
    },
    {
        statement: "Uma organização quer reduzir o custo ambiental de suas cargas de IA sem abandonar os projetos. Qual prática está alinhada à sustentabilidade como dimensão da IA responsável?",
        explanation: "Dimensionar corretamente os modelos e otimizar a inferência reduz o uso de computação e energia, contribuindo para a sustentabilidade e para um menor custo ambiental.",
        topic: "IA responsável",
        options: [
            ["Escolher sempre o maior modelo disponível, independentemente da tarefa, para garantir a melhor qualidade em qualquer caso", false],
            ["Manter todos os endpoints de inferência ativos permanentemente, mesmo sem tráfego, para evitar qualquer atraso de resposta", false],
            ["Selecionar modelos do tamanho adequado e otimizar a inferência para consumir menos recursos computacionais e energia", true],
            ["Duplicar os ambientes de treino em várias regiões ao mesmo tempo para acelerar cada experimento de ajuste de hiperparâmetros", false],
        ],
    },
    {
        statement: "Ao preparar dados para treinar um modelo de saúde, uma equipe decide coletar apenas os campos estritamente necessários e anonimizar identificadores dos pacientes. Que princípio de IA responsável essa decisão apoia?",
        explanation: "Coletar o mínimo de dados necessários e anonimizar identificadores reduz a exposição de informações pessoais, apoiando a dimensão de privacidade e segurança.",
        topic: "IA responsável",
        options: [
            ["Justiça, garantindo que todos os grupos demográficos estejam igualmente representados nas previsões do modelo final", false],
            ["Privacidade e segurança, minimizando a exposição de dados pessoais durante o ciclo de vida do modelo", true],
            ["Controlabilidade, permitindo pausar ou ajustar o comportamento do modelo sempre que ele agir de forma inesperada", false],
            ["Explicabilidade, permitindo descrever em detalhe quais atributos influenciaram cada previsão individual gerada", false],
        ],
    },
    {
        statement: "Um sistema de reconhecimento de voz funciona bem para alguns sotaques, mas falha para falantes de regiões sub-representadas nos dados de treino. Qual medida está mais alinhada à inclusão na IA responsável?",
        explanation: "Inclusão exige que os dados representem de forma diversa os grupos atendidos, para que o sistema funcione bem também para populações antes sub-representadas.",
        topic: "IA responsável",
        options: [
            ["Restringir o serviço apenas aos grupos de usuários para os quais o modelo já apresenta bom desempenho atualmente", false],
            ["Aumentar o parâmetro de temperatura durante a inferência para que o modelo produza transcrições mais variadas", false],
            ["Reduzir o tamanho do conjunto de dados de treino para acelerar os ciclos de experimentação e reduzir os custos", false],
            ["Ampliar o conjunto de treino para representar de forma diversa os diferentes grupos e sotaques de usuários", true],
        ],
    },
    {
        statement: "Uma empresa processa documentos com um modelo, mas quer que os casos em que o modelo tem baixa confiança sejam revisados por uma pessoa antes da decisão final. Qual serviço facilita esse fluxo de revisão humana?",
        explanation: "O Amazon A2I (Augmented AI) permite encaminhar previsões, por exemplo as de baixa confiança, para revisão humana antes da decisão final, implementando human-in-the-loop.",
        topic: "IA responsável",
        options: [
            ["Amazon Augmented AI (A2I), que integra revisão humana às previsões de modelos de machine learning", true],
            ["Amazon SageMaker Model Monitor, que acompanha a qualidade das previsões e detecta desvios ao longo do tempo", false],
            ["AWS Artifact, que fornece sob demanda relatórios de conformidade e certificações de segurança da AWS", false],
            ["Amazon Macie, que identifica e classifica automaticamente dados sensíveis armazenados no Amazon S3", false],
        ],
    },
    {
        statement: "Uma equipe precisa de um modelo cujas decisões possam ser entendidas diretamente pela sua própria estrutura, sem depender de ferramentas externas de explicação. Qual opção descreve um modelo intrinsecamente interpretável?",
        explanation: "Modelos como árvores de decisão simples e regressões lineares são intrinsecamente interpretáveis, pois sua estrutura revela como as entradas levam à saída, sem métodos de explicação posteriores.",
        topic: "IA responsável",
        options: [
            ["Uma rede neural profunda com muitas camadas ocultas, tratada como caixa-preta e explicada só depois com métodos auxiliares", false],
            ["Uma árvore de decisão simples, cujas regras de decisão podem ser lidas e compreendidas diretamente", true],
            ["Um grande modelo de linguagem generativo com bilhões de parâmetros ajustados sobre enormes volumes de texto da internet", false],
            ["Um conjunto (ensemble) de centenas de modelos combinados, cuja lógica final é difícil de acompanhar manualmente", false],
        ],
    },
    {
        statement: "Em uma solução de RAG no Amazon Bedrock, a equipe quer bloquear respostas que não estejam apoiadas nos documentos recuperados, reduzindo alucinações. Qual recurso ajuda a impor essa checagem?",
        explanation: "A verificação de embasamento contextual dos Guardrails do Bedrock avalia se a resposta está fundamentada na fonte fornecida, ajudando a bloquear conteúdo não sustentado e a reduzir alucinações.",
        topic: "IA responsável",
        options: [
            ["A configuração de uma chave gerenciada pelo cliente no AWS KMS para criptografar os documentos de origem em repouso", false],
            ["A criação de um endpoint de interface com AWS PrivateLink para manter o tráfego dentro da rede privada da AWS", false],
            ["A verificação de embasamento contextual (contextual grounding) do Amazon Bedrock Guardrails", true],
            ["O aumento do limite de tokens de saída para permitir que o modelo detalhe melhor a origem de cada afirmação gerada", false],
        ],
    },
    {
        statement: "O SageMaker Clarify revelou que um modelo de concessão de crédito favorece um grupo específico por causa de desequilíbrios no conjunto de treino. Qual é uma ação de mitigação apropriada?",
        explanation: "Quando o viés vem de desequilíbrios nos dados, uma mitigação apropriada é rebalancear ou aumentar o conjunto de treino e reavaliar as métricas de viés, em vez de ignorar o achado.",
        topic: "IA responsável",
        options: [
            ["Remover completamente o relatório de viés para que a auditoria não registre o problema encontrado no modelo", false],
            ["Colocar o modelo em produção sem alterações, já que a acurácia geral média ficou dentro da meta definida pela equipe", false],
            ["Aumentar o número máximo de tokens das respostas do modelo para que ele justifique melhor cada decisão de crédito", false],
            ["Rebalancear ou aumentar os dados de treino para representar melhor os grupos e reavaliar o viés depois", true],
        ],
    },
    {
        statement: "Uma empresa quer garantir que apenas a equipe de dados possa invocar os modelos do Amazon Bedrock e que os demais times não tenham esse acesso. Qual é a forma recomendada de aplicar esse controle?",
        explanation: "O AWS IAM permite definir políticas que concedem a invocação de modelos apenas aos perfis autorizados, aplicando controle de acesso a serviços de IA com privilégio mínimo.",
        topic: "Segurança e governança",
        options: [
            ["Criar políticas do AWS IAM que concedam as permissões de invocação apenas aos perfis autorizados", true],
            ["Compartilhar uma única chave de acesso raiz da conta com todos os times para simplificar o uso dos modelos", false],
            ["Publicar o endpoint do modelo na internet e confiar em um segredo em texto no código dos aplicativos internos", false],
            ["Desativar o registro de chamadas de API para que ninguém consiga descobrir quais equipes usam quais modelos", false],
        ],
    },
    {
        statement: "Uma empresa precisa garantir que os dados de treino no Amazon S3 e os artefatos de modelo fiquem criptografados em repouso, com controle sobre as chaves. Qual serviço atende a esse requisito?",
        explanation: "O AWS KMS gerencia as chaves de criptografia usadas para proteger dados em repouso, como os conjuntos de treino no S3 e os artefatos de modelo.",
        topic: "Segurança e governança",
        options: [
            ["Amazon CloudWatch, para coletar métricas operacionais e disparar alarmes sobre o uso dos recursos de treino", false],
            ["AWS Artifact, para baixar relatórios de conformidade e certificações de segurança dos data centers da AWS", false],
            ["AWS Key Management Service (KMS), para criptografar os dados e artefatos em repouso e gerenciar as chaves", true],
            ["Amazon Augmented AI, para incluir uma etapa de revisão humana nas previsões geradas pelos modelos já treinados", false],
        ],
    },
    {
        statement: "Ao enviar dados de um aplicativo para um endpoint de inferência, a equipe de segurança exige proteção contra interceptação durante o trânsito na rede. Qual medida atende a esse objetivo?",
        explanation: "A criptografia em trânsito com TLS (HTTPS) protege os dados enquanto trafegam pela rede entre o cliente e o endpoint, evitando interceptação.",
        topic: "Segurança e governança",
        options: [
            ["Armazenar os dados de entrada em um bucket público para que o endpoint consiga lê-los sem autenticação adicional", false],
            ["Usar conexões criptografadas com TLS (HTTPS) para proteger os dados em trânsito entre o aplicativo e o endpoint", true],
            ["Registrar o conteúdo completo de cada requisição em texto simples em logs compartilhados para facilitar a depuração", false],
            ["Aumentar o número de instâncias do endpoint para que o tráfego seja distribuído e fique mais difícil de interceptar", false],
        ],
    },
    {
        statement: "Uma instituição financeira treina modelos com dados sigilosos e precisa que os jobs do SageMaker não tenham acesso à internet pública, acessando o Amazon S3 por rotas privadas. Qual abordagem atende a esse requisito?",
        explanation: "Executar o SageMaker dentro de uma VPC com isolamento de rede e acessar o S3 por endpoints de VPC mantém o tráfego fora da internet pública, adequado a dados sensíveis.",
        topic: "Segurança e governança",
        options: [
            ["Publicar os dados de treino em um repositório público para que qualquer serviço da conta possa baixá-los rapidamente", false],
            ["Conceder a todos os usuários da conta permissão de administrador para que possam configurar a rede quando precisarem", false],
            ["Desabilitar a criptografia dos volumes de treino para reduzir a latência de leitura durante o processamento dos dados", false],
            ["Executar os jobs em uma VPC com isolamento de rede e acesso ao S3 por endpoint de VPC, sem gateway de internet", true],
        ],
    },
    {
        statement: "Uma empresa deve manter os dados de clientes armazenados e processados dentro do país por exigência regulatória. No contexto dos serviços de IA da AWS, qual decisão apoia esse requisito de residência de dados?",
        explanation: "A residência de dados é atendida escolhendo a região da AWS no local exigido, já que os dados de um serviço em geral permanecem na região selecionada pelo cliente.",
        topic: "Segurança e governança",
        options: [
            ["Confiar que a AWS move automaticamente os dados para a região mais barata disponível em cada momento do dia", false],
            ["Distribuir cópias dos dados por todas as regiões globais para aumentar a disponibilidade e o desempenho de leitura", false],
            ["Selecionar uma região da AWS localizada no país exigido para armazenar e processar os dados", true],
            ["Ignorar a escolha de região, pois serviços gerenciados de IA replicam os dados livremente entre continentes por padrão", false],
        ],
    },
    {
        statement: "Uma equipe de governança precisa saber exatamente qual versão do conjunto de dados gerou cada modelo implantado, para reproduzir resultados e responder a auditorias. Qual recurso apoia esse rastreamento?",
        explanation: "O rastreamento de linhagem (ML Lineage Tracking) do SageMaker registra as relações entre dados, código e versões de modelo, apoiando reprodutibilidade e auditoria.",
        topic: "Segurança e governança",
        options: [
            ["O Amazon Bedrock Guardrails, que aplica filtros de conteúdo e bloqueia temas indesejados nas respostas do modelo", false],
            ["O rastreamento de linhagem do SageMaker, que registra a relação entre dados, código e versões de modelo", true],
            ["O aumento do parâmetro de temperatura, que torna as previsões mais variadas e portanto mais fáceis de reproduzir", false],
            ["O Amazon Macie, que descobre e classifica dados sensíveis, mas não relaciona conjuntos de dados a modelos treinados", false],
        ],
    },
    {
        statement: "Meses após implantar um modelo, uma equipe percebe queda de desempenho porque a distribuição dos dados de entrada mudou em relação ao treino. Qual recurso ajuda a detectar automaticamente esse desvio (drift)?",
        explanation: "O SageMaker Model Monitor compara continuamente os dados e as previsões em produção com uma linha de base e emite alertas quando detecta desvio, indicando necessidade de retreino.",
        topic: "Segurança e governança",
        options: [
            ["AWS CloudTrail, que registra chamadas de API na conta, mas não avalia a distribuição estatística dos dados de entrada", false],
            ["AWS KMS, que gerencia chaves de criptografia, mas não acompanha mudanças na qualidade das previsões do modelo", false],
            ["AWS PrivateLink, que mantém o tráfego na rede privada, mas não mede o desempenho preditivo do modelo em produção", false],
            ["Amazon SageMaker Model Monitor, que compara os dados de produção com uma linha de base e alerta sobre desvios", true],
        ],
    },
    {
        statement: "Uma empresa usa um serviço gerenciado de IA da AWS. Segundo o modelo de responsabilidade compartilhada, qual tarefa é responsabilidade do cliente, e não da AWS?",
        explanation: "No modelo de responsabilidade compartilhada, a AWS cuida da segurança da nuvem (a infraestrutura física), enquanto o cliente é responsável pela segurança na nuvem, como IAM e a classificação e proteção dos seus dados.",
        topic: "Segurança e governança",
        options: [
            ["Manter a segurança física e a manutenção do hardware nos data centers onde o serviço é executado", false],
            ["Aplicar patches no sistema operacional e no hardware subjacente que hospeda o serviço gerenciado de IA", false],
            ["Configurar as permissões de IAM e classificar os dados que serão enviados ao serviço", true],
            ["Garantir a disponibilidade global da infraestrutura de rede que interliga as regiões e zonas de disponibilidade", false],
        ],
    },
    {
        statement: "Uma empresa quer personalizar (fine-tuning) um foundation model no Amazon Bedrock com dados proprietários, mas teme que esses dados melhorem o modelo base de terceiros. O que é correto sobre esse cenário?",
        explanation: "No Bedrock, os dados usados para personalização e o modelo customizado resultante ficam privados na conta do cliente e não são usados para treinar os modelos base.",
        topic: "Segurança e governança",
        options: [
            ["Os dados enviados para o ajuste passam a ser incorporados ao modelo base e ficam disponíveis para outros clientes da AWS", false],
            ["Os dados de personalização e o modelo ajustado permanecem privados na conta e não são usados para treinar o modelo base", true],
            ["É obrigatório publicar o modelo ajustado em um repositório público para que a AWS valide a qualidade do resultado obtido", false],
            ["O ajuste só é permitido se a empresa autorizar o provedor do modelo a reutilizar os dados em treinos futuros do modelo base", false],
        ],
    },
    {
        statement: "A liderança quer acompanhar e receber alertas sobre os gastos com inferência de IA generativa por equipe e por projeto. Qual combinação de recursos atende melhor a essa necessidade?",
        explanation: "O AWS Budgets define limites e alertas de gasto, o Cost Explorer analisa os custos e as tags de alocação de custos permitem separar os valores por equipe e projeto.",
        topic: "Segurança e governança",
        options: [
            ["Apenas o AWS CloudTrail, que registra chamadas de API, mas não consolida nem projeta os valores gastos por equipe", false],
            ["Apenas o Amazon Macie, cuja função é descobrir dados sensíveis e não tem relação com o acompanhamento de custos", false],
            ["Apenas os Guardrails do Bedrock, que filtram conteúdo das respostas, mas não fornecem relatórios financeiros de uso", false],
            ["AWS Budgets e o Cost Explorer com tags de alocação de custos para monitorar e alertar sobre os gastos", true],
        ],
    },
    {
        statement: "Depois de publicar um endpoint de inferência, a equipe de operações quer acompanhar quase em tempo real o número de invocações, a latência e a taxa de erros, com alarmes automáticos. Qual serviço é o mais indicado?",
        explanation: "O Amazon CloudWatch coleta métricas operacionais como invocações, latência e erros de um endpoint e permite configurar alarmes automáticos sobre esses indicadores.",
        topic: "Segurança e governança",
        options: [
            ["AWS Artifact, que disponibiliza relatórios de conformidade e certificações, mas não coleta métricas de operação em tempo real", false],
            ["AWS KMS, que gerencia chaves de criptografia dos dados, mas não acompanha latência nem taxa de erros do endpoint", false],
            ["Amazon CloudWatch, que coleta métricas operacionais do endpoint e dispara alarmes com base em limites definidos", true],
            ["Amazon A2I, que adiciona revisão humana às previsões, mas não monitora indicadores operacionais da infraestrutura", false],
        ],
    },
    {
        statement: "Um job de treinamento do SageMaker precisa ler dados de um bucket do Amazon S3. Qual é a prática recomendada para conceder esse acesso com segurança?",
        explanation: "Atribuir uma função (execution role) do IAM ao job concede credenciais temporárias com permissões mínimas, evitando o uso de chaves permanentes embutidas no código.",
        topic: "Segurança e governança",
        options: [
            ["Incorporar uma chave de acesso permanente do usuário raiz diretamente no script de treinamento do modelo", false],
            ["Atribuir ao job uma função (role) do IAM com permissões restritas, usando credenciais temporárias", true],
            ["Tornar o bucket do S3 público para leitura, evitando a necessidade de configurar qualquer permissão de acesso", false],
            ["Compartilhar a mesma senha de console entre todos os cientistas de dados que executam jobs de treinamento na conta", false],
        ],
    },
    {
        statement: "Uma organização quer garantir que somente modelos revisados e aprovados cheguem à produção, mantendo um histórico de versões e status de aprovação. Qual recurso apoia essa governança?",
        explanation: "O SageMaker Model Registry versiona os modelos e registra o status de aprovação, permitindo que apenas versões aprovadas sejam implantadas em produção.",
        topic: "Segurança e governança",
        options: [
            ["O aumento do parâmetro de temperatura na inferência, que introduz variação e assim sinaliza modelos aprovados", false],
            ["O AWS PrivateLink, que mantém o tráfego na rede privada, mas não controla quais versões de modelo vão a produção", false],
            ["O Amazon Macie, que classifica dados sensíveis em buckets, mas não gerencia aprovação de versões de modelos de ML", false],
            ["O SageMaker Model Registry, que versiona modelos e controla o status de aprovação antes da implantação", true],
        ],
    },
    {
        statement: "Uma empresa monta uma base de conhecimento para RAG no Amazon Bedrock com documentos internos confidenciais. Qual conjunto de medidas protege melhor esses dados?",
        explanation: "Proteger os dados de uma base de conhecimento envolve criptografar as fontes e o armazenamento vetorial com o AWS KMS e limitar o acesso por políticas do IAM, combinando criptografia e controle de acesso.",
        topic: "Segurança e governança",
        options: [
            ["Criptografar os dados de origem e o armazenamento vetorial com o AWS KMS e restringir o acesso por políticas do IAM", true],
            ["Deixar o armazenamento vetorial sem criptografia para acelerar as buscas e liberar leitura pública dos documentos internos", false],
            ["Confiar apenas na obscuridade do endpoint, sem aplicar criptografia nem políticas de acesso aos documentos confidenciais", false],
            ["Enviar os documentos por e-mail para todos os funcionários, de modo que qualquer pessoa possa validar a qualidade das buscas", false],
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
                name: "AWS Certified AI Practitioner (AIF-C01)",
                provider: "aws",
                code: "AIF-C01",
                level: "Fundamental",
                description:
                    "Simulado no formato da prova AIF-C01: 90 minutos, corte de 70%. Cobre os 5 domínios: fundamentos de IA e ML, IA generativa, aplicações de foundation models, IA responsável e segurança e governança.",
                durationMinutes: 90,
                questionCount: 65,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    await db
        .update(simulados)
        .set({ provider: "aws", code: "AIF-C01", level: "Fundamental" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    const jaExistem = new Set(
        (
            await db
                .select({ statement: simuladoQuestions.statement })
                .from(simuladoQuestions)
                .where(eq(simuladoQuestions.simuladoId, simulado.id))
        ).map((r) => r.statement),
    );
    const inseridas = QUESTOES.filter((q) => !jaExistem.has(q.statement)).length;
    if (inseridas === 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
        return;
    }

    for (const q of QUESTOES) {
        if (jaExistem.has(q.statement)) continue;
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
    console.log(`Seed: ${inseridas} questões novas inseridas (${QUESTOES.length} no banco).`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
