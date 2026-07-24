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
    if (Number(n) > 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
        return;
    }

    for (const q of QUESTOES) {
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
