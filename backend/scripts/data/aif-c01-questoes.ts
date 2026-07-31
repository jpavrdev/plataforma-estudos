// Banco de questões do simulado AWS Certified AI Practitioner (AIF-C01).
// Compartilhado pelo seed (instalação nova) e pelo script de atualização
// (instalação que já tem o simulado). Regras do banco: enunciado de cenário,
// distratores da mesma categoria da resposta e a correta não pode ser a única
// opção mais longa, nem a única mais curta por folga visível. Questões de
// múltipla escolha terminam com "(Selecione DUAS opções.)" e têm cinco opções
// com duas corretas.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
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
            "Histórico já rotulado como fraude ou legítima é a definição de treino supervisionado. Não supervisionado agrupa sem rótulo, reforço aprende por recompensa em interação e auto-supervisionado deriva os rótulos dos próprios dados, o que não é o caso.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aprendizado supervisionado, porque o modelo treina com exemplos que já possuem o rótulo correto",
                true,
            ],
            [
                "Aprendizado não supervisionado, porque o modelo agruparia as transações sem usar rótulo",
                false,
            ],
            [
                "Aprendizado por reforço, porque o modelo aprenderia com recompensas e punições a cada decisão tomada",
                false,
            ],
            [
                "Aprendizado auto-supervisionado, porque o modelo criaria os próprios rótulos a partir dos dados brutos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma varejista tem milhões de clientes sem categoria definida e quer descobrir grupos de perfis de compra semelhantes para campanhas. Qual abordagem de ML se encaixa melhor?",
        explanation:
            "Descobrir grupos por semelhança sem categorias prévias é clustering, técnica não supervisionada. Regressão prevê um número, classificação exige classes definidas de antemão e detecção de anomalias busca exceções, não segmentos.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Clustering, uma técnica não supervisionada que agrupa dados por semelhança sem rótulos prévios",
                true,
            ],
            [
                "Regressão linear, que preveria um valor numérico contínuo a partir das variáveis de entrada",
                false,
            ],
            [
                "Classificação binária, que atribuiria cada cliente a uma de duas classes previamente conhecidas",
                false,
            ],
            [
                "Detecção de anomalias, que sinalizaria apenas os poucos registros muito fora do padrão de compra esperado",
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
            "Regra fixa e documentada em lei pede código determinístico, que é auditável e exato; ML introduziria erro onde não existe incerteza. Previsão de demanda, recomendação personalizada e filtragem de spam vivem de padrões aprendidos nos dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Um cálculo de imposto que segue regras fixas, determinísticas e bem documentadas em lei",
                true,
            ],
            [
                "Prever a demanda futura de produtos com base em padrões históricos e na sazonalidade das vendas",
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
            [
                "Falta de dados de treino, já que o modelo não aprendeu nada no conjunto original",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma cientista de dados quer treinar e implantar um modelo customizado de ML com controle sobre o algoritmo e a infraestrutura. Quais recursos do Amazon SageMaker apoiam DIRETAMENTE esse fluxo? (Selecione DUAS opções.)",
        explanation:
            "Treinar e implantar modelos customizados são funções de SageMaker Training e SageMaker Endpoints. Polly (voz), Connect (contact center) e Shield (proteção DDoS) não fazem parte desse fluxo de ML.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "SageMaker Training, para treinar modelos em infraestrutura gerenciada e escalável",
                true,
            ],
            [
                "SageMaker Endpoints, para hospedar o modelo e servir inferências em tempo real",
                true,
            ],
            ["Amazon Polly, para converter os resultados do modelo em áudio de voz natural", false],
            [
                "Amazon Connect, para distribuir chamadas telefônicas em uma central de atendimento",
                false,
            ],
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
            [
                "Amazon SageMaker Studio, um ambiente de desenvolvimento voltado a cientistas de dados",
                false,
            ],
            ["AWS Lambda, um serviço para executar funções de código sob demanda", false],
            [
                "Amazon EMR, uma plataforma de big data baseada em frameworks como Apache Spark",
                false,
            ],
        ],
    },
    {
        statement:
            "No contexto de um conjunto de dados de treino supervisionado, o que é um 'rótulo' (label)?",
        explanation:
            "Rótulo é a resposta certa de cada exemplo, o alvo que o modelo aprende a prever. As colunas de entrada são as features, os parâmetros são ajustados pelo algoritmo durante o treino e as métricas medem o resultado depois.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["A resposta correta que se deseja prever, associada a cada exemplo de treino", true],
            [
                "Cada uma das colunas de entrada, as features, que o modelo usa para fazer as previsões",
                false,
            ],
            ["O parâmetro interno ajustado pelo algoritmo durante o processo de treino", false],
            ["A métrica que mede o quão bem o modelo se saiu no conjunto de teste", false],
        ],
    },
    {
        statement:
            "Depois de treinado, um modelo é usado para gerar previsões sobre dados novos em produção. Como esse processo é chamado?",
        explanation:
            "Gerar previsões com o modelo pronto é a inferência. Treinamento é a fase anterior de ajuste dos parâmetros, rotulagem é atribuir respostas corretas aos exemplos e engenharia de atributos prepara as variáveis de entrada.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Inferência, quando o modelo já treinado produz previsões para novas entradas", true],
            [
                "Treinamento, a fase em que o modelo ajusta os parâmetros internos a partir dos dados históricos",
                false,
            ],
            ["Rotulagem, quando pessoas atribuem as respostas corretas aos exemplos", false],
            ["Engenharia de atributos, quando novas variáveis de entrada são criadas", false],
        ],
    },
    {
        statement:
            "Um modelo de triagem médica deve evitar ao máximo classificar um paciente doente como saudável (falso negativo). Qual métrica a equipe deve priorizar para reduzir esse erro?",
        explanation:
            "Para reduzir falso negativo a métrica é o recall, a fração dos doentes que o modelo captura. Precisão olha os alertas emitidos, especificidade olha os saudáveis e acurácia geral esconde o erro na classe rara.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Recall (sensibilidade), que mede a fração de casos positivos que o modelo captura",
                true,
            ],
            [
                "Precisão, que mede a fração de alertas positivos que estavam realmente corretos",
                false,
            ],
            [
                "Especificidade, que mede a fração dos casos negativos que o modelo identifica corretamente",
                false,
            ],
            [
                "Acurácia geral, que mede a fração de acertos somando as duas classes do problema",
                false,
            ],
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
            [
                "Amazon SageMaker, no qual seria preciso treinar e implantar um modelo próprio",
                false,
            ],
            ["Amazon Polly, que faz o caminho inverso, gerando voz a partir de texto", false],
            ["Amazon Comprehend, que extrai entidades e sentimentos de textos já escritos", false],
        ],
    },
    {
        statement:
            "Uma equipe obteve resultados ruins com um modelo e descobriu que os dados de treino continham muitos valores errados e faltantes. Quais DUAS ações atacam a causa do problema? (Selecione DUAS opções.)",
        explanation:
            "Qualidade de dados se resolve nos dados: limpar o que está errado e validar a qualidade continuamente evita repetir o problema. Mais épocas reforçam o aprendizado do erro, trocar a métrica esconde o sintoma e duplicar dados mantém os mesmos defeitos em dobro.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Tratar os valores inválidos e ausentes com limpeza e correção antes de treinar de novo",
                true,
            ],
            [
                "Adotar validação e perfilamento de qualidade dos dados como etapa fixa do pipeline",
                true,
            ],
            [
                "Aumentar o número de épocas para o modelo aprender a ignorar os registros com erro",
                false,
            ],
            [
                "Trocar a métrica de avaliação por uma mais tolerante às previsões incorretas do modelo",
                false,
            ],
            [
                "Duplicar o conjunto inteiro de dados para diluir o peso dos registros problemáticos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa de resumo de documentos, geração de respostas de suporte e classificação de e-mails. A equipe debate treinar um modelo para cada tarefa ou adotar um único foundation model. O que caracteriza a abordagem com foundation model?",
        explanation:
            "Foundation model é um modelo grande, pré-treinado em dados amplos, que serve de base para muitas tarefas e se adapta por prompt, RAG ou fine-tuning. Treinar um modelo por tarefa é o ML tradicional, regras fixas não aprendem com dados e um modelo descartável por tarefa é o oposto da proposta de reuso.",
        topic: "IA generativa",
        options: [
            [
                "Um modelo pré-treinado em dados amplos atende às várias tarefas, adaptado por prompt ou ajuste leve",
                true,
            ],
            [
                "Cada tarefa recebe um modelo próprio, treinado do zero com os dados rotulados daquele caso de uso",
                false,
            ],
            [
                "As tarefas são resolvidas por regras fixas escritas por especialistas, sem aprendizado a partir de dados",
                false,
            ],
            [
                "Um modelo pequeno é treinado só com os dados da empresa e substituído a cada nova tarefa que surgir",
                false,
            ],
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
            [
                "Amazon S3, um serviço de armazenamento de objetos sem capacidade de inferência",
                false,
            ],
            ["AWS Glue, um serviço de ETL para preparar e integrar dados entre fontes", false],
        ],
    },
    {
        statement:
            "A fatura do Amazon Bedrock de uma equipe é cobrada por tokens de entrada e de saída, e um desenvolvedor pergunta o que exatamente é contado. O que é um token para um LLM?",
        explanation:
            "Token é a unidade produzida pelo tokenizador: pode ser uma palavra inteira, um pedaço de palavra ou pontuação. A contagem não é por palavra completa, por caractere nem por frase, e é isso que torna o custo proporcional ao texto processado e gerado.",
        topic: "IA generativa",
        options: [
            [
                "Uma unidade de texto, como uma palavra ou um pedaço de palavra, processada e gerada pelo modelo",
                true,
            ],
            [
                "Cada palavra inteira separada por espaços, sem contar pontuação nem fragmentos de palavra",
                false,
            ],
            [
                "Cada caractere individual do texto, contado um a um, incluindo letras, números, espaços e pontuação",
                false,
            ],
            [
                "Cada frase completa do texto, delimitada pela pontuação final de cada período enviado ao modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Um portal de suporte quer que a busca encontre artigos relevantes mesmo quando o cliente usa palavras diferentes das do texto, como 'devolver produto' para achar a política de reembolso. Qual abordagem viabiliza essa busca por significado?",
        explanation:
            "Embeddings representam o significado do texto como vetores, e textos semanticamente próximos ficam próximos no espaço vetorial, casando 'devolver produto' com 'reembolso'. Palavra-chave e expressão regular dependem dos termos exatos, e ordenar por data não mede relevância.",
        topic: "IA generativa",
        options: [
            [
                "Gerar embeddings dos textos e comparar a proximidade dos vetores no espaço semântico",
                true,
            ],
            [
                "Indexar as palavras-chave dos artigos e casar somente os termos exatos digitados na consulta",
                false,
            ],
            [
                "Aplicar expressões regulares que reconheçam as variações de escrita previstas pela equipe",
                false,
            ],
            [
                "Ordenar os artigos pela data de publicação, mostrando primeiro os mais recentes",
                false,
            ],
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
        statement:
            "Um comitê revisa quatro iniciativas de IA e quer aprovar primeiro a que é caso claro de IA generativa, e não de ML tradicional ou de regras. Qual iniciativa é essa?",
        explanation:
            "Gerar texto novo e contextualizado é o caso típico de IA generativa. Previsão numérica é regressão, agrupamento por semelhança é clustering e validação de formato é regra determinística, que nem precisa de aprendizado.",
        topic: "IA generativa",
        options: [
            [
                "Redigir rascunhos personalizados de resposta para os tickets de suporte a partir do histórico do cliente",
                true,
            ],
            [
                "Prever a quantidade de pedidos que a loja receberá na próxima semana a partir do histórico e da sazonalidade",
                false,
            ],
            [
                "Agrupar os clientes por semelhança de comportamento de compra para orientar as campanhas",
                false,
            ],
            [
                "Validar o formato dos campos de cadastro, como CPF e data, antes de gravar no banco",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe avalia adotar um foundation model em vez de treinar um modelo do zero para cada caso de uso. Quais são DUAS vantagens dessa escolha? (Selecione DUAS opções.)",
        explanation:
            "O pré-treinamento pesado já foi feito, o que encurta o caminho até o primeiro resultado, e o mesmo modelo se adapta a várias tarefas com prompt, RAG ou ajuste leve. A avaliação de qualidade continua necessária, a geração permanece variável e os cuidados de privacidade não desaparecem.",
        topic: "IA generativa",
        options: [
            [
                "Reduzir o tempo até o primeiro resultado, aproveitando o pré-treinamento já realizado",
                true,
            ],
            ["Adaptar o mesmo modelo a tarefas diferentes com pouco dado adicional", true],
            [
                "Dispensar a avaliação de qualidade das respostas antes de colocar em produção",
                false,
            ],
            [
                "Garantir respostas idênticas para o mesmo prompt em qualquer execução, sem variação de redação",
                false,
            ],
            [
                "Eliminar os cuidados de privacidade sobre os dados enviados nas chamadas ao modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de aprovar o primeiro assistente generativo da empresa, a diretoria pede os principais riscos operacionais dessa tecnologia. Quais DOIS desafios são esperados? (Selecione DUAS opções.)",
        explanation:
            "Alucinação e variabilidade são os riscos operacionais clássicos de IA generativa e pedem verificação, guardrails e monitoramento. O custo cresce com o uso por token, não é fixo, responder não exige retreino e os principais foundation models são multilíngues.",
        topic: "IA generativa",
        options: [
            [
                "Respostas incorretas apresentadas com confiança, as alucinações, exigindo verificação",
                true,
            ],
            [
                "Variação nas saídas entre execuções, dificultando garantir formato e comportamento",
                true,
            ],
            [
                "Custo de inferência fixo e independente do volume de uso, o que impede o planejamento por consumo",
                false,
            ],
            [
                "Necessidade de retreinar o modelo base a cada pergunta nova feita pelos usuários",
                false,
            ],
            [
                "Limite de um único idioma por modelo, exigindo um modelo separado para cada língua",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer um assistente de IA generativa que responda perguntas dos funcionários com base nos documentos internos, respeitando as permissões de acesso. Qual serviço da AWS é voltado a isso?",
        explanation:
            "Q Business é o assistente generativo para dados corporativos que respeita as permissões de acesso dos documentos. Q Developer foca em código, Lex constrói bots de fluxo definido e Kendra é busca corporativa, não assistente de respostas.",
        topic: "IA generativa",
        options: [
            [
                "Amazon Q Business, um assistente generativo conectado aos dados e às permissões da empresa",
                true,
            ],
            [
                "Amazon Q Developer, um assistente voltado a tarefas de programação e ao ciclo de desenvolvimento",
                false,
            ],
            [
                "Amazon Lex, um serviço para construir chatbots com intenções e fluxos definidos manualmente",
                false,
            ],
            [
                "Amazon Kendra, um serviço de busca corporativa que localiza documentos, sem gerar respostas",
                false,
            ],
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
            [
                "Modelos de detecção de objetos, que apenas localizam itens em fotos existentes",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa que o modelo analise contratos longos inteiros em uma única chamada e compara foundation models antes de escolher. Qual especificação do modelo determina quanto texto cabe em cada interação?",
        explanation:
            "A janela de contexto define quantos tokens de entrada e saída o modelo processa por interação, o que limita o tamanho do contrato analisável de uma vez. Número de parâmetros mede capacidade, dimensão de embedding é representação interna e limite de requisições é cota da API.",
        topic: "IA generativa",
        options: [
            [
                "A janela de contexto, o total de tokens de entrada e saída aceitos por interação",
                true,
            ],
            [
                "O número de parâmetros do modelo, que indica a capacidade geral de raciocínio",
                false,
            ],
            [
                "A dimensão do vetor de embedding que o modelo utiliza para representar cada trecho",
                false,
            ],
            ["O limite de requisições por segundo definido para a API do serviço na conta", false],
        ],
    },
    {
        statement:
            "Uma equipe pequena quer experimentar vários foundation models sem provisionar servidores nem gerenciar GPUs. Qual característica do Amazon Bedrock ajuda nisso?",
        explanation:
            "O Bedrock é serverless: a AWS opera a infraestrutura e a equipe consome os modelos por API. Não há cluster de GPU para gerenciar, não é preciso hospedar pesos e os modelos base já vêm treinados.",
        topic: "IA generativa",
        options: [
            ["É um serviço serverless, no qual a AWS gerencia a infraestrutura dos modelos", true],
            [
                "Exige criar e administrar um cluster dedicado de GPUs para cada modelo avaliado pela equipe",
                false,
            ],
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
        statement:
            "Um aplicativo precisa que o modelo encerre a geração assim que produzir o marcador '###FIM###', sem esperar o limite máximo de tokens. Qual parâmetro de inferência atende a isso?",
        explanation:
            "Sequências de parada encerram a geração no ponto exato em que o texto configurado aparece. Temperatura, top-k e penalidade de repetição moldam a escolha dos tokens, mas nenhum deles interrompe a resposta em um marcador específico.",
        topic: "IA generativa",
        options: [
            [
                "Sequência de parada (stop sequence), que interrompe a geração ao encontrar o texto configurado",
                true,
            ],
            [
                "Temperatura, que ajusta o grau de aleatoriedade na escolha de cada token da resposta gerada pelo modelo",
                false,
            ],
            [
                "Top-k, que restringe a amostragem aos k tokens mais prováveis em cada passo da geração",
                false,
            ],
            [
                "Penalidade de repetição, que desestimula o modelo a repetir trechos já gerados na resposta",
                false,
            ],
        ],
    },
    {
        statement:
            "Um assistente baseado em LLM erra cálculos de juros compostos com frequência, embora explique bem os conceitos. Qual abordagem torna os resultados numéricos confiáveis?",
        explanation:
            "LLMs geram texto por probabilidade e não executam aritmética confiável; delegar a conta a uma ferramenta chamada por um agente resolve na origem. Mais tokens, temperatura zero ou mais casas decimais não mudam a natureza probabilística da geração.",
        topic: "IA generativa",
        options: [
            [
                "Dar ao modelo uma ferramenta de cálculo, via agente, e usar o resultado dela na resposta",
                true,
            ],
            [
                "Aumentar o máximo de tokens para o modelo ter espaço de desenvolver a conta por completo",
                false,
            ],
            [
                "Reduzir a temperatura a zero para que a aritmética saia sempre determinística e correta",
                false,
            ],
            [
                "Acrescentar mais casas decimais aos números do prompt para elevar a precisão do cálculo",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de melhorar instruções, exemplos e formato, as respostas do assistente continuam desatualizadas em relação aos produtos lançados neste mês. O que esse limite indica?",
        explanation:
            "Prompt engineering melhora como o modelo usa o que já sabe, mas não adiciona fatos posteriores ao treinamento. Exemplos few-shot orientam formato e estilo, não inserem conhecimento novo, e temperatura e limite de tokens não trazem informação que o modelo não tem. RAG injeta os dados atuais no contexto.",
        topic: "Prompt engineering",
        options: [
            [
                "O conhecimento do modelo está congelado no treinamento; é preciso injetar dados externos, por exemplo com RAG",
                true,
            ],
            [
                "Faltam exemplos few-shot no prompt, porque é com exemplos que o modelo aprende fatos novos sobre os lançamentos",
                false,
            ],
            [
                "A temperatura está alta demais, e reduzi-la fará o modelo citar corretamente os lançamentos",
                false,
            ],
            [
                "O limite de tokens de saída está baixo, e ampliá-lo dará espaço para as informações novas",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor inclui no prompt três exemplos de perguntas com as respostas desejadas antes de fazer a pergunta real, para orientar o formato da saída. Que técnica é essa?",
        explanation:
            "Fornecer alguns exemplos dentro do prompt é few-shot (aprendizado em contexto). Fine-tuning e pré-treinamento alteram os pesos do modelo; destilação cria um modelo menor a partir de outro.",
        topic: "Prompt engineering",
        options: [
            ["Prompt few-shot, que fornece alguns exemplos resolvidos no próprio prompt", true],
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
        statement:
            "Um assistente com RAG responde bem sobre as políticas internas, mas segue errando cálculos e conclusões que exigem várias etapas de raciocínio. Por que o RAG não corrige esse tipo de erro?",
        explanation:
            "RAG melhora o acesso a fatos, trazendo trechos relevantes para o contexto; o raciocínio em várias etapas continua por conta do modelo. Reindexação, quantidade de trechos e citações afetam a recuperação e a rastreabilidade, não a lógica.",
        topic: "RAG e customização",
        options: [
            [
                "RAG fornece contexto factual ao prompt, mas não aumenta a capacidade de raciocínio do modelo",
                true,
            ],
            [
                "Os embeddings da base de conhecimento estão desatualizados, e reindexar os documentos corrigiria os cálculos",
                false,
            ],
            [
                "O retriever devolve trechos demais, e reduzir os resultados eliminaria os erros de lógica",
                false,
            ],
            [
                "As citações de fonte estão desligadas, e ativá-las obrigaria o modelo a conferir as contas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que um assistente responda com base nos manuais internos e reduza respostas inventadas, sem treinar um modelo próprio. Quais DUAS ações atendem ao objetivo? (Selecione DUAS opções.)",
        explanation:
            "RAG resolve sem treino: a base indexada fornece os trechos relevantes e a instrução de responder só com o conteúdo recuperado, citando fontes, reduz invenção. Continued pretraining é treino, contrariando o requisito, e máximo de tokens e temperatura não ancoram a resposta nos manuais.",
        topic: "RAG e customização",
        options: [
            [
                "Indexar os manuais em uma base de conhecimento e recuperar trechos relevantes a cada pergunta",
                true,
            ],
            [
                "Instruir o modelo a responder apenas com base nos trechos recuperados, citando as fontes",
                true,
            ],
            [
                "Fazer continued pretraining do foundation model com o texto completo dos manuais internos da empresa",
                false,
            ],
            [
                "Aumentar o máximo de tokens para que cada resposta comporte o conteúdo integral do manual",
                false,
            ],
            [
                "Elevar a temperatura para o modelo explorar os manuais com mais liberdade nas respostas",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual recurso do Amazon Bedrock facilita implementar RAG conectando foundation models às fontes de dados da empresa?",
        explanation:
            "Knowledge Bases cuida do RAG gerenciado: ingestão, indexação vetorial e recuperação dos dados da empresa. Guardrails filtra conteúdo, CloudWatch monitora aplicações e CloudFormation provisiona infraestrutura.",
        topic: "RAG e customização",
        options: [
            [
                "Knowledge Bases for Amazon Bedrock, que gerencia a recuperação de dados para RAG",
                true,
            ],
            [
                "Amazon Bedrock Guardrails, o recurso voltado a filtrar conteúdo indesejado nas respostas geradas",
                false,
            ],
            ["Amazon CloudWatch, voltado ao monitoramento de métricas e logs de aplicações", false],
            ["AWS CloudFormation, voltado a provisionar infraestrutura como código", false],
        ],
    },
    {
        statement:
            "Ao comparar RAG e fine-tuning para melhorar um assistente, o que cada abordagem exige da equipe?",
        explanation:
            "Fine-tuning pede dados de exemplo preparados e um job de treino que gera um modelo ajustado; RAG pede ingestão, indexação e manutenção da base consultada a cada resposta. É o fine-tuning que usa pares rotulados, só ele altera pesos, e nenhuma das duas depende da licença do modelo.",
        topic: "RAG e customização",
        options: [
            [
                "Fine-tuning exige exemplos preparados e um job de treino; RAG exige manter uma base de conhecimento indexada",
                true,
            ],
            [
                "RAG exige pares rotulados de pergunta e resposta para o treino; fine-tuning funciona sem preparação prévia de dados",
                false,
            ],
            [
                "As duas abordagens ajustam os pesos do modelo, mudando apenas a duração do job de treinamento",
                false,
            ],
            [
                "Fine-tuning está disponível apenas para modelos proprietários; RAG, apenas para modelos de código aberto",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa que o assistente use informações que mudam toda semana. Por que RAG costuma ser preferível a fine-tuning nesse caso?",
        explanation:
            "Com RAG, dado novo entra atualizando a base consultada, sem retreinar o modelo. Fine-tuning congela o conhecimento no momento do treino, não altera pesos mais rápido nem dispensa fontes de dados.",
        topic: "RAG e customização",
        options: [
            [
                "Com RAG basta atualizar a base de dados, sem retreinar o modelo a cada mudança",
                true,
            ],
            [
                "Fine-tuning atualizaria o modelo automaticamente sempre que os documentos de origem mudassem",
                false,
            ],
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
            "O tradeoff real é capacidade contra custo e latência: modelos menores tendem a ser mais baratos e rápidos, com menos capacidade. O tamanho influencia os três fatores e nenhum dos lados vence em todas as tarefas.",
        topic: "RAG e customização",
        options: [
            [
                "Modelos menores tendem a custar menos e responder mais rápido, com menos capacidade",
                true,
            ],
            [
                "Modelos maiores são sempre mais baratos e mais rápidos por serem otimizados pelos provedores",
                false,
            ],
            ["O tamanho do modelo não influencia custo, latência nem capacidade", false],
            ["Modelos menores sempre superam os maiores em qualquer tarefa de linguagem", false],
        ],
    },
    {
        statement:
            "Qual é o efeito de definir um limite de 'máximo de tokens' (max tokens) na chamada de um LLM?",
        explanation:
            "Max tokens é um teto para o tamanho da saída: ao atingir o limite, a resposta é cortada. Criatividade é papel da temperatura, correção factual não é garantida por parâmetro e cota de chamadas é limite da API, não da resposta.",
        topic: "Prompt engineering",
        options: [
            ["Limita o tamanho da resposta gerada, cortando-a ao atingir o teto de tokens", true],
            [
                "Aumenta a criatividade da resposta ao permitir mais variação na escolha de cada palavra gerada",
                false,
            ],
            ["Garante que a resposta esteja sempre factualmente correta e sem erros", false],
            ["Define quantas vezes o modelo pode ser chamado por minuto na conta", false],
        ],
    },
    {
        statement: "Em uma solução de RAG, qual é o papel de um banco de dados vetorial?",
        explanation:
            "O banco vetorial guarda os embeddings e devolve os trechos mais próximos da consulta na etapa de recuperação. O treino não acontece nele, gerar imagens é papel do modelo e permissões são atribuição do IAM.",
        topic: "RAG e customização",
        options: [
            ["Armazenar embeddings e recuperar os trechos mais semelhantes à consulta", true],
            [
                "Executar o treinamento do foundation model a partir dos dados rotulados armazenados nele",
                false,
            ],
            ["Gerar as imagens de saída solicitadas pelo usuário no prompt", false],
            ["Aplicar as políticas de IAM que autorizam o acesso ao modelo", false],
        ],
    },
    {
        statement:
            "Antes de escolher um foundation model, uma equipe quer comparar a qualidade das respostas de vários candidatos na sua tarefa. Quais DOIS métodos a avaliação de modelos do Amazon Bedrock oferece? (Selecione DUAS opções.)",
        explanation:
            "A avaliação de modelos do Bedrock tem os dois modos: automático, com métricas calculadas sobre conjuntos de teste, e humano, com fluxo de revisores comparando respostas. Não existe ranking oficial único por tarefa, os pesos dos modelos não ficam abertos para análise e latência de rede não mede qualidade.",
        topic: "RAG e customização",
        options: [
            ["Avaliação automática com métricas calculadas sobre um conjunto de teste", true],
            ["Avaliação humana, com revisores comparando as respostas dos modelos", true],
            [
                "Ranking único oficial publicado pela AWS, que já define o melhor modelo para cada tarefa",
                false,
            ],
            [
                "Análise estática do código-fonte e dos pesos abertos de cada modelo candidato",
                false,
            ],
            [
                "Medição de latência da rede entre as regiões que hospedam cada um dos modelos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma forma de melhorar respostas de um LLM em problemas de raciocínio é pedir que ele explique o passo a passo antes de dar a resposta final. Essa técnica de prompt é conhecida como:",
        explanation:
            "Pedir o passo a passo antes da resposta final é o chain-of-thought. Few-shot dá exemplos resolvidos, RAG traz documentos externos para o contexto e autoconsistência gera várias respostas para escolher a mais frequente, técnicas diferentes da descrita.",
        topic: "Prompt engineering",
        options: [
            [
                "Cadeia de raciocínio (chain-of-thought), pedindo o passo a passo antes da resposta",
                true,
            ],
            [
                "Few-shot prompting, fornecendo exemplos resolvidos da tarefa antes da pergunta final",
                false,
            ],
            [
                "Geração aumentada por recuperação (RAG), trazendo documentos externos para o contexto",
                false,
            ],
            [
                "Autoconsistência, gerando várias respostas independentes e escolhendo a mais frequente",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual é um risco de segurança específico ao expor um LLM a entradas de usuários?",
        explanation:
            "Entrada de usuário pode carregar instruções que tentam subverter o sistema, a injeção de prompt. Mensagens não retreinam o modelo em tempo real, os pesos não vazam em respostas detalhadas e texto colado no chat não é executado como código pelo serviço.",
        topic: "Prompt engineering",
        options: [
            ["Injeção de prompt, na qual a entrada tenta subverter as instruções do sistema", true],
            [
                "Envenenamento do treinamento, pois cada mensagem enviada retreinaria o modelo na hora",
                false,
            ],
            [
                "Exposição dos pesos do modelo ao usuário final a cada resposta muito detalhada",
                false,
            ],
            [
                "Execução automática no servidor de qualquer código que o usuário colar no chat",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que seu assistente generativo evite temas proibidos e linguagem tóxica nas conversas. O que o Amazon Bedrock Guardrails permite configurar? (Selecione DUAS opções.)",
        explanation:
            "Guardrails atua como camada de política: tópicos negados barram assuntos que o assistente não deve tratar e filtros de conteúdo tratam toxicidade na entrada e na saída. O recurso não acelera inferência, não treina o modelo e não comprime prompts.",
        topic: "RAG e customização",
        options: [
            ["Tópicos negados, bloqueando assuntos que o assistente não deve tratar", true],
            ["Filtros de conteúdo nocivo aplicados às entradas e às saídas do modelo", true],
            ["Aceleração da inferência, reduzindo a latência das respostas do modelo", false],
            ["Treinamento adicional automático do modelo com os dados das conversas", false],
            ["Compressão dos prompts longos para reduzir o custo cobrado por token", false],
        ],
    },
    {
        statement:
            "Além de reduzir alucinações, quais DOIS benefícios uma equipe obtém ao incluir no prompt trechos recuperados de documentos confiáveis? (Selecione DUAS opções.)",
        explanation:
            "Com os trechos no contexto, a resposta pode citar as fontes e acompanhar dados que mudam, sem retreino. Os trechos recuperados contam como tokens de entrada e aumentam o custo da chamada, o banco vetorial continua necessário para as buscas e o raciocínio matemático não melhora por causa do contexto.",
        topic: "RAG e customização",
        options: [
            ["Permitir respostas com citação das fontes usadas, dando rastreabilidade", true],
            ["Refletir informações atualizadas sem precisar retreinar o modelo", true],
            [
                "Reduzir o custo por resposta, já que trechos recuperados não contam como tokens",
                false,
            ],
            ["Dispensar o banco vetorial da arquitetura depois que o índice é construído", false],
            ["Garantir exatidão matemática nos cálculos presentes na resposta gerada", false],
        ],
    },
    {
        statement: "No contexto de IA responsável, o que é 'viés' (bias) em um modelo de ML?",
        explanation:
            "Viés, em IA responsável, é o erro sistemático que favorece ou prejudica grupos de forma injusta. Diferença entre treino e teste indica overfitting, tempo de resposta é latência e contagem de parâmetros é tamanho do modelo.",
        topic: "IA responsável",
        options: [
            ["Erros sistemáticos que favorecem ou prejudicam certos grupos de forma injusta", true],
            [
                "A diferença entre a acurácia medida no treino e a acurácia medida no conjunto de teste",
                false,
            ],
            ["O tempo que o modelo leva para produzir cada resposta em produção", false],
            ["A quantidade de parâmetros ajustados durante o treino do modelo", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS ajuda a detectar viés nos dados e no modelo e a explicar as previsões?",
        explanation:
            "Clarify examina dados e modelo em busca de viés e explica as previsões. Model Monitor observa desvios em produção, Ground Truth rotula dados e Feature Store organiza e serve features, sem análise de viés.",
        topic: "IA responsável",
        options: [
            ["Amazon SageMaker Clarify, voltado à detecção de viés e à explicabilidade", true],
            [
                "Amazon SageMaker Model Monitor, voltado a acompanhar desvios do modelo em produção",
                false,
            ],
            ["Amazon SageMaker Ground Truth, voltado à rotulagem de dados de treino", false],
            [
                "Amazon SageMaker Feature Store, voltado a armazenar e servir features aos modelos",
                false,
            ],
        ],
    },
    {
        statement:
            "Por que a 'explicabilidade' (explainability) de um modelo é importante em aplicações sensíveis, como concessão de crédito?",
        explanation:
            "Explicabilidade permite justificar cada decisão a quem é afetado e atender exigências regulatórias. Ela não prova que os dados estavam sem viés, não substitui a revisão humana em decisões críticas e é diferente de relatar a acurácia agregada do modelo.",
        topic: "IA responsável",
        options: [
            [
                "Permite entender por que o modelo decidiu e justificar isso a quem for afetado",
                true,
            ],
            [
                "Comprova que os dados usados no treino do modelo estavam completos e sem nenhum tipo de viés",
                false,
            ],
            ["Substitui a necessidade de revisão humana nas decisões de maior impacto", false],
            ["Demonstra a acurácia média que o modelo alcançou no conjunto de validação", false],
        ],
    },
    {
        statement:
            "Ao definir as diretrizes de IA responsável da empresa, quais DUAS dimensões o comitê deve incluir? (Selecione DUAS opções.)",
        explanation:
            "Justiça e transparência são dimensões centrais de IA responsável, ao lado de privacidade, segurança, explicabilidade, robustez e governança. Prazo de lançamento, padronização de linguagem e centralização de decisões são escolhas de gestão, não princípios de IA responsável.",
        topic: "IA responsável",
        options: [
            ["Justiça, tratando grupos diferentes de forma equânime nas decisões do sistema", true],
            ["Transparência, comunicando capacidades, limitações e uso de IA aos afetados", true],
            [
                "Velocidade de lançamento, priorizando entregar novos recursos antes dos concorrentes",
                false,
            ],
            ["Padronização de linguagem de programação única para todos os times de dados", false],
            ["Centralização das decisões de negócio exclusivamente no time de engenharia", false],
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
            "AI Service Cards são os documentos da AWS sobre os próprios serviços de IA: casos pretendidos, limites e escolhas de design. Model cards documentam modelos criados por você, o Artifact entrega relatórios de conformidade e o Well-Architected traz boas práticas de arquitetura.",
        topic: "IA responsável",
        options: [
            [
                "AI Service Cards, que documentam o uso pretendido e as limitações dos serviços de IA",
                true,
            ],
            [
                "Model Cards do SageMaker, que descrevem modelos individuais criados pela própria empresa",
                false,
            ],
            [
                "AWS Artifact, o portal que reúne relatórios de conformidade e certificações da AWS",
                false,
            ],
            [
                "Whitepapers do Well-Architected Framework, com boas práticas gerais de arquitetura",
                false,
            ],
        ],
    },
    {
        statement:
            "Um modelo apoia decisões de alto impacto, como concessão de crédito e triagem de currículos. Quais DUAS práticas de IA responsável reduzem o risco de erros graves? (Selecione DUAS opções.)",
        explanation:
            "Decisão de alto impacto pede human in the loop e trilha de auditoria para detectar erros sistemáticos cedo. Automatizar tudo remove a salvaguarda, tamanho de modelo não garante acerto e esconder explicações vai contra transparência e explicabilidade.",
        topic: "IA responsável",
        options: [
            [
                "Manter revisão humana nas decisões, com pessoas confirmando os casos importantes",
                true,
            ],
            [
                "Registrar e auditar as decisões apoiadas pelo modelo para detectar erros sistemáticos",
                true,
            ],
            [
                "Automatizar o fluxo de ponta a ponta, retirando a interferência humana para acelerar as decisões",
                false,
            ],
            [
                "Adotar o maior modelo disponível no mercado como garantia de decisões corretas",
                false,
            ],
            [
                "Restringir as explicações das decisões para não expor o funcionamento do sistema",
                false,
            ],
        ],
    },
    {
        statement:
            "Aplicar filtros que impedem um assistente de gerar conteúdo tóxico ou perigoso está mais associado a qual princípio de IA responsável?",
        explanation:
            "Filtrar conteúdo tóxico ou perigoso é mitigação de dano, o núcleo do princípio de segurança. Transparência trata da comunicação sobre o sistema, equidade compara o tratamento entre grupos e sustentabilidade cuida do impacto ambiental.",
        topic: "IA responsável",
        options: [
            ["Segurança, prevenindo danos ao usuário e à sociedade nas interações", true],
            ["Transparência, deixando claro para o usuário como o sistema funciona", false],
            ["Equidade, garantindo tratamento parecido entre grupos de usuários", false],
            ["Sustentabilidade, reduzindo o consumo de energia da infraestrutura", false],
        ],
    },
    {
        statement:
            "Uma equipe quer documentar, para cada modelo, a finalidade, os dados usados, as métricas e as limitações conhecidas, apoiando a governança. Que artefato atende a isso?",
        explanation:
            "Model cards documentam cada modelo: finalidade, dados, métricas e limitações. AI Service Cards falam dos serviços da própria AWS, o registry versiona artefatos para implantação e o dicionário de dados descreve tabelas, não modelos.",
        topic: "IA responsável",
        options: [
            [
                "Cartões de modelo (model cards), que documentam finalidade, dados e limitações",
                true,
            ],
            [
                "AI Service Cards, os documentos da AWS sobre os próprios serviços de inteligência artificial",
                false,
            ],
            [
                "Registro de modelos (model registry), que versiona e aprova os artefatos de implantação",
                false,
            ],
            ["Dicionário de dados, que descreve tabelas e colunas das bases da empresa", false],
        ],
    },
    {
        statement:
            "Ao conceder acesso dos times aos serviços de IA da AWS, quais DUAS práticas seguem o princípio do menor privilégio? (Selecione DUAS opções.)",
        explanation:
            "Menor privilégio significa permissões mínimas por papel e credenciais temporárias, reduzindo o dano possível de um vazamento. Usuário administrador compartilhado, acesso amplo provisório e política de acesso total reutilizada são exatamente o oposto do princípio.",
        topic: "Segurança e governança",
        options: [
            [
                "Conceder por papéis (roles) do IAM somente as permissões exigidas por cada função",
                true,
            ],
            [
                "Usar credenciais temporárias em vez de chaves de longa duração embutidas no código",
                true,
            ],
            [
                "Adotar um usuário administrador compartilhado para simplificar o dia a dia dos times",
                false,
            ],
            [
                "Liberar acesso amplo no início do projeto e restringir depois que tudo estabilizar",
                false,
            ],
            [
                "Padronizar uma única política de acesso total reutilizada por todas as aplicações",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa descobrir e proteger dados pessoais (PII) presentes em grandes volumes de documentos armazenados no Amazon S3. Qual serviço é voltado a isso?",
        explanation:
            "Macie usa ML para descobrir e proteger dados sensíveis, como PII, em escala no S3. GuardDuty detecta ameaças na conta, Inspector procura vulnerabilidades e Shield mitiga ataques de negação de serviço.",
        topic: "Segurança e governança",
        options: [
            ["Amazon Macie, que descobre e protege dados sensíveis armazenados no S3", true],
            ["Amazon GuardDuty, que detecta atividades maliciosas e anômalas nas contas", false],
            [
                "Amazon Inspector, que avalia vulnerabilidades em cargas de trabalho e instâncias",
                false,
            ],
            [
                "AWS Shield, que protege aplicações contra ataques de negação de serviço distribuídos",
                false,
            ],
        ],
    },
    {
        statement:
            "Para proteger os dados usados por uma solução de IA na AWS, quais DUAS medidas de segurança são recomendadas? (Selecione DUAS opções.)",
        explanation:
            "Criptografia em repouso e em trânsito e controle de acesso com auditoria são a base da proteção de dados. Cópias em máquinas locais fogem da governança, cortar logs remove a trilha de auditoria e anonimizar só depois do treino expõe os dados na fase mais sensível.",
        topic: "Segurança e governança",
        options: [
            [
                "Criptografar os dados em repouso e em trânsito, por exemplo com chaves do AWS KMS",
                true,
            ],
            [
                "Restringir o acesso aos dados com políticas de menor privilégio e registrar o uso",
                true,
            ],
            [
                "Guardar uma cópia dos dados fora da nuvem, em máquinas locais dos analistas do time",
                false,
            ],
            [
                "Reduzir os registros de log para diminuir a superfície de exposição das informações",
                false,
            ],
            [
                "Anonimizar os dados somente depois que o treinamento do modelo estiver concluído",
                false,
            ],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS aplicado a um serviço gerenciado de IA, qual item normalmente é responsabilidade do CLIENTE?",
        explanation:
            "No serviço gerenciado, o cliente responde pelo uso: quem acessa, com quais permissões e que dados entram. Hardware, correções da infraestrutura gerenciada e instalações físicas ficam com a AWS.",
        topic: "Segurança e governança",
        options: [
            ["Definir quem pode acessar o serviço e como os dados de entrada são usados", true],
            ["Manter o hardware físico dos data centers que hospedam o serviço", false],
            [
                "Aplicar as correções de segurança no sistema operacional da infraestrutura gerenciada do serviço",
                false,
            ],
            ["Operar a rede física e a energia elétrica das instalações da AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa teme que os prompts e as respostas trafegados no Amazon Bedrock alimentem os modelos de terceiros. Quais DUAS afirmações descrevem corretamente a privacidade do serviço? (Selecione DUAS opções.)",
        explanation:
            "O Bedrock não usa conteúdo dos clientes para treinar os modelos base, e a arquitetura permite tráfego privado com VPC endpoints e criptografia com KMS. O modo de cobrança não muda a política de privacidade, prompts não são repassados a provedores e não existe termo por chamada.",
        topic: "Segurança e governança",
        options: [
            [
                "Prompts e saídas dos clientes não são usados para treinar os foundation models base",
                true,
            ],
            [
                "O tráfego pode ficar fora da internet pública com VPC endpoints, e os dados, cifrados com KMS",
                true,
            ],
            [
                "A privacidade completa do serviço exige contratar o modo de throughput provisionado, exclusivo por cliente",
                false,
            ],
            [
                "A AWS anonimiza os prompts e os repassa aos provedores para melhorar os modelos",
                false,
            ],
            ["Cada chamada exige um termo de consentimento assinado pelo titular dos dados", false],
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
            "PrivateLink cria o endpoint privado que mantém as chamadas dentro da rede da AWS. Internet Gateway é justamente a rota pública, peering liga VPCs entre si e Direct Connect conecta o data center do cliente à AWS, outro escopo.",
        topic: "Segurança e governança",
        options: [
            ["AWS PrivateLink, que conecta a VPC ao serviço sem expor o tráfego à internet", true],
            [
                "Internet Gateway, que dá às sub-redes públicas da VPC uma rota de saída para a internet",
                false,
            ],
            [
                "Peering de VPC, que conecta duas VPCs para trocarem tráfego privado entre elas",
                false,
            ],
            ["AWS Direct Connect, o link dedicado entre o data center da empresa e a AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa regulada precisa obter relatórios de conformidade e certificações da AWS (como ISO e SOC) para uma auditoria. Onde esses documentos ficam disponíveis?",
        explanation:
            "Os relatórios e certificações da própria AWS, como ISO e SOC, ficam no AWS Artifact. Audit Manager coleta evidências do seu ambiente, Config avalia configurações de recursos e Organizations administra as contas.",
        topic: "Segurança e governança",
        options: [
            ["AWS Artifact, o portal de relatórios de conformidade e certificações da AWS", true],
            ["AWS Audit Manager, que coleta evidências das auditorias internas", false],
            [
                "AWS Config, que avalia continuamente a conformidade das configurações dos recursos",
                false,
            ],
            [
                "AWS Organizations, que centraliza a administração e as políticas das várias contas",
                false,
            ],
        ],
    },
    {
        statement:
            "No contexto de governança de dados para IA, por que rastrear a origem e as transformações dos dados (linhagem) é importante?",
        explanation:
            "Linhagem dá a trilha auditável da origem e das transformações dos dados, essencial para reprodutibilidade e conformidade. Ela não acelera o treino, complementa em vez de dispensar o versionamento e não garante ausência de viés.",
        topic: "Segurança e governança",
        options: [
            ["Permite auditar de onde vieram os dados e como foram tratados antes do treino", true],
            [
                "Acelera o treinamento do modelo ao reduzir o volume de dados processados no pipeline",
                false,
            ],
            ["Dispensa o versionamento dos conjuntos de dados usados em cada experimento", false],
            ["Comprova por si só que o modelo final está livre de viés nas previsões", false],
        ],
    },
    {
        statement:
            "Um time de logística quer que um sistema aprenda sozinho a melhor sequência de movimentos de um robô em um armazém, recebendo recompensa quando entrega rápido e penalidade quando colide com uma prateleira. Que tipo de aprendizado de máquina descreve melhor essa abordagem?",
        explanation:
            "O aprendizado por reforço é aquele em que um agente aprende por tentativa e erro, guiado por recompensas e penalidades, exatamente como o robô do cenário. O supervisionado depende de exemplos já rotulados com a resposta certa, o não supervisionado busca padrões sem rótulos e o semissupervisionado mistura poucos dados rotulados com muitos não rotulados.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aprendizado supervisionado, treinando com exemplos rotulados com a ação correta",
                false,
            ],
            ["Aprendizado não supervisionado", false],
            ["Aprendizado por reforço, guiado por recompensas e punições", true],
            ["Aprendizado semissupervisionado", false],
        ],
    },
    {
        statement:
            "Em uma apresentação técnica, alguém pergunta o que caracteriza o aprendizado profundo (deep learning) dentro do campo de machine learning. Qual resposta está correta?",
        explanation:
            "Deep learning é um subcampo do ML baseado em redes neurais com muitas camadas, capazes de aprender representações complexas dos dados. Não é sinônimo de IA, que é um conceito muito mais amplo, nem se define pelo hardware usado ou por uma etapa de limpeza de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "É um sinônimo de inteligência artificial, abrangendo qualquer sistema que tente imitar o raciocínio e o comportamento humano",
                false,
            ],
            [
                "O uso de redes neurais com várias camadas para aprender padrões complexos a partir dos dados",
                true,
            ],
            ["Qualquer modelo de ML executado em hardware com GPUs de alto desempenho", false],
            ["A etapa de limpeza profunda dos dados antes do treino do modelo", false],
        ],
    },
    {
        statement:
            "Uma central de atendimento recebe milhares de e-mails por dia e quer que um modelo direcione cada mensagem automaticamente para um entre quatro departamentos (financeiro, técnico, vendas e outros). Que tipo de tarefa de ML é essa?",
        explanation:
            "Direcionar cada e-mail para uma entre categorias predefinidas (os departamentos) é classificação. Regressão prevê valores numéricos contínuos, clustering agrupa sem categorias definidas e a redução de dimensionalidade apenas comprime as variáveis, sem rotular as mensagens.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Regressão, já que a saída desejada seria um número contínuo", false],
            [
                "Clustering, agrupando os e-mails por similaridade sem categorias predefinidas",
                false,
            ],
            ["Redução de dimensionalidade dos textos recebidos", false],
            ["Classificação, atribuindo cada e-mail a uma das categorias predefinidas", true],
        ],
    },
    {
        statement:
            "Qual é a diferença fundamental entre um problema de regressão e um de classificação no aprendizado supervisionado?",
        explanation:
            "Na regressão a saída é um número contínuo; na classificação, uma categoria discreta. Ambas usam dados rotulados no aprendizado supervisionado, funcionam com diferentes tipos de dados e são usadas tanto no treino quanto na inferência, o que elimina as demais opções.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "A regressão prevê um valor numérico contínuo, enquanto a classificação atribui uma categoria discreta",
                true,
            ],
            [
                "A regressão usa dados rotulados e a classificação sempre usa dados sem rótulo algum",
                false,
            ],
            [
                "A regressão só aceita dados estruturados em tabelas, ao passo que a classificação só serve para imagens e vídeos",
                false,
            ],
            [
                "A regressão ocorre apenas no treino e a classificação apenas na inferência em produção",
                false,
            ],
        ],
    },
    {
        statement:
            "Um modelo apresenta desempenho ruim tanto nos dados de treino quanto nos de teste, indicando que é simples demais para capturar os padrões presentes nos dados. Como esse problema é chamado?",
        explanation:
            "Desempenho ruim tanto no treino quanto no teste indica underfitting: o modelo é simples demais para os padrões dos dados. Overfitting seria bom no treino e ruim em dados novos, enquanto vazamento de dados e desbalanceamento de classes descrevem outros problemas.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Overfitting, quando o modelo decora os dados de treino e vai mal em dados novos",
                false,
            ],
            ["Vazamento de dados entre os conjuntos de treino e teste", false],
            ["Underfitting (subajuste), modelo simples demais para o padrão dos dados", true],
            ["Desbalanceamento entre as classes do problema", false],
        ],
    },
    {
        statement:
            "Uma equipe percebeu que seu modelo está com overfitting, indo muito bem no treino e mal em dados novos. Quais DUAS medidas ajudam a reduzir o problema? (Selecione DUAS opções.)",
        explanation:
            "Regularizar ou simplificar o modelo e ampliar os dados atacam a memorização, que é a essência do overfitting. Treinar mais sobre os mesmos dados e aumentar a capacidade agravam o quadro, e avaliar só no treino esconde o problema em vez de resolver.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aplicar técnicas de regularização ou simplificar a arquitetura do modelo", true],
            ["Aumentar o volume e a diversidade dos dados usados no treinamento", true],
            ["Prolongar o treino por mais épocas com exatamente o mesmo conjunto de dados", false],
            ["Acrescentar parâmetros e camadas para elevar a capacidade de memorização", false],
            ["Avaliar o desempenho do modelo apenas nos próprios dados de treinamento", false],
        ],
    },
    {
        statement:
            "No equilíbrio entre viés (bias) e variância (variance) de um modelo, o que costuma acontecer quando o modelo é complexo demais para o problema?",
        explanation:
            "Modelo complexo demais memoriza o treino: variância alta e overfitting. Viés alto é o quadro oposto, o de underfitting; complexidade não reduz os dois ao mesmo tempo, e o padrão típico é erro de treino baixo com erro de teste alto, não o contrário.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Alto viés (bias), levando o modelo ao underfitting", false],
            ["Alta variância, levando o modelo ao overfitting", true],
            ["Viés e variância caem juntos, melhorando treino e teste ao mesmo tempo", false],
            ["O erro de treino sobe enquanto o erro de teste cai na mesma proporção", false],
        ],
    },
    {
        statement:
            "No treino de um modelo supervisionado para prever inadimplência, informações como renda, idade e histórico de pagamento do cliente são usadas como entradas do modelo. Como esses atributos de entrada são chamados?",
        explanation:
            "Os atributos de entrada usados pelo modelo (renda, idade, histórico) são as features. Rótulos são a resposta que o modelo deve prever, hiperparâmetros configuram o algoritmo e épocas contam as passagens completas pelos dados de treino.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Rótulos (labels), que representam a resposta que o modelo deve prever", false],
            ["Hiperparâmetros de configuração do algoritmo de treino", false],
            ["Épocas, o número de passagens completas do algoritmo pelos dados de treino", false],
            ["Features, os atributos de entrada usados pelo modelo", true],
        ],
    },
    {
        statement:
            "Ao dividir os dados em treino, validação e teste, para que serve especificamente o conjunto de validação?",
        explanation:
            "O conjunto de validação serve para ajustar hiperparâmetros e comparar versões do modelo durante o desenvolvimento. O treino ajusta os pesos, o teste fornece a estimativa final e imparcial reservada para o fim do projeto, e nenhum deles guarda dados descartados por qualidade.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Ajustar hiperparâmetros e comparar versões do modelo durante o desenvolvimento",
                true,
            ],
            ["Treinar e ajustar os pesos internos finais do modelo", false],
            [
                "Servir como estimativa final e imparcial do desempenho, reservada para o fim do projeto",
                false,
            ],
            ["Guardar os registros descartados por problemas de qualidade", false],
        ],
    },
    {
        statement:
            "Um filtro de spam corporativo está enviando muitos e-mails legítimos para a lixeira (falsos positivos), o que irrita os usuários. Para reduzir esse tipo específico de erro, qual métrica a equipe deve priorizar melhorar?",
        explanation:
            "Falsos positivos, ou seja, e-mails legítimos marcados como spam, atacam a precisão, então melhorar a precisão reduz esse erro. Recall foca nos falsos negativos, MAE é métrica de regressão e o tempo de inferência não mede acerto de classificação.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Recall (sensibilidade) do classificador", false],
            ["MAE, o erro absoluto médio das previsões", false],
            ["Precisão (precision), a fração dos alertas que eram spam de fato", true],
            ["O tempo médio de inferência para processar cada mensagem recebida", false],
        ],
    },
    {
        statement:
            "Uma equipe quer uma única métrica que equilibre precisão e recall ao avaliar um classificador com classes bastante desbalanceadas. Qual métrica atende a esse objetivo?",
        explanation:
            "O F1-score é a média harmônica entre precisão e recall, útil justamente quando há desbalanceamento entre as classes. A acurácia pode enganar nesses casos, e RMSE e R2 são métricas de regressão, não de classificação.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Acurácia, a proporção total de acertos do modelo", false],
            ["F1-score, a média harmônica entre a precisão e o recall", true],
            ["RMSE, a raiz do erro quadrático médio", false],
            ["Coeficiente de determinação (R2) das previsões do modelo", false],
        ],
    },
    {
        statement:
            "Ao avaliar um classificador, uma tabela mostra as contagens de verdadeiros positivos, falsos positivos, verdadeiros negativos e falsos negativos. Que ferramenta de avaliação é essa?",
        explanation:
            "A tabela que cruza verdadeiros e falsos positivos e negativos é a matriz de confusão. A curva ROC relaciona taxas em vários limiares, enquanto o histograma de resíduos e a matriz de correlação entre features servem a outros propósitos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Curva ROC do classificador", false],
            ["Histograma dos resíduos das previsões", false],
            ["Matriz de correlação entre as variáveis de entrada", false],
            ["Matriz de confusão do classificador avaliado", true],
        ],
    },
    {
        statement:
            "Um cientista de dados avalia um classificador binário observando a curva que relaciona a taxa de verdadeiros positivos e a de falsos positivos em diferentes limiares. Um valor de AUC próximo de 1 indica o quê?",
        explanation:
            "Uma AUC próxima de 1 indica que o modelo separa bem as classes; próxima de 0,5 equivaleria a um palpite aleatório. A curva ROC por si só não confirma overfitting nem desbalanceamento do conjunto de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Que o modelo tem boa capacidade de distinguir as classes", true],
            ["Que o modelo certamente está sofrendo de overfitting", false],
            ["Que o desempenho é pior do que o de um simples palpite aleatório", false],
            ["Que o conjunto de dados de treino está fortemente desbalanceado", false],
        ],
    },
    {
        statement:
            "Um modelo que detecta uma doença rara, presente em apenas 1% dos casos, alcançou 99% de acurácia simplesmente prevendo 'saudável' para todo mundo. Por que a acurácia é uma métrica enganosa nesse cenário?",
        explanation:
            "Com 1% de casos positivos, prever sempre 'saudável' acerta 99% e erra todos os doentes; a acurácia esconde a classe rara. O caminho é olhar recall e precisão da classe minoritária, e não misturar métricas de regressão nem culpar o limiar padrão.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Porque a acurácia deve ser lida junto do erro quadrático médio para ter validade estatística",
                false,
            ],
            [
                "Porque recall e precisão da classe majoritária seriam as únicas métricas confiáveis",
                false,
            ],
            [
                "Porque, com classes muito desbalanceadas, ela esconde o mau desempenho na classe rara",
                true,
            ],
            [
                "Porque o limiar de decisão padrão de 0,5 invalida a acurácia em qualquer classificador binário",
                false,
            ],
        ],
    },
    {
        statement:
            "Para avaliar um modelo de regressão que prevê a demanda diária de um produto em unidades, quais DUAS métricas são apropriadas? (Selecione DUAS opções.)",
        explanation:
            "Regressão prevê valores contínuos, e MAE e RMSE medem a distância entre o previsto e o real, com o RMSE pesando mais os erros grandes. F1, acurácia e AUC avaliam classificação, que trabalha com classes, não com quantidades.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Erro absoluto médio (MAE), a média do desvio das previsões em unidades", true],
            ["Raiz do erro quadrático médio (RMSE), que penaliza mais os erros grandes", true],
            ["F1-score, o equilíbrio entre a precisão e o recall do classificador", false],
            ["Acurácia, a fração de previsões exatamente corretas sobre o total avaliado", false],
            ["Área sob a curva ROC (AUC), típica da avaliação de classificadores binários", false],
        ],
    },
    {
        statement:
            "Uma empresa armazena dados de vendas em tabelas com colunas bem definidas (data, produto, valor) e também guarda vídeos e áudios das gravações de atendimento. Como classificar esses dois tipos de dados, respectivamente?",
        explanation:
            "Tabelas com colunas bem definidas são dados estruturados; vídeos e áudios são dados não estruturados. As demais opções invertem os conceitos ou classificam ambos os tipos de forma incorreta.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Não estruturados e estruturados, respectivamente", false],
            ["Os dois tipos são considerados estruturados", false],
            ["Os dois são semiestruturados, por pertencerem à mesma base corporativa", false],
            ["Estruturados e não estruturados, respectivamente", true],
        ],
    },
    {
        statement:
            "No ciclo de vida de um projeto de machine learning, qual sequência representa melhor a ordem geral das principais etapas?",
        explanation:
            "O fluxo geral vai de coletar e preparar os dados a treinar, avaliar, implantar e monitorar o modelo. As outras sequências colocam etapas fora de ordem, como implantar ou avaliar antes mesmo de ter os dados coletados e o modelo treinado.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Coletar e preparar os dados, treinar, avaliar, implantar e monitorar", true],
            [
                "Implantar o modelo em produção, depois treiná-lo, em seguida coletar os dados e por último avaliar os resultados",
                false,
            ],
            [
                "Treinar primeiro, coletar os dados depois, monitorar e só então avaliar o desempenho",
                false,
            ],
            ["Avaliar, implantar, coletar os dados e por fim treinar o modelo do zero", false],
        ],
    },
    {
        statement:
            "Uma equipe quer começar rapidamente a partir de modelos pré-treinados e soluções prontas dentro do Amazon SageMaker, com a possibilidade de ajustá-los às suas necessidades. Qual recurso atende a isso?",
        explanation:
            "O SageMaker JumpStart oferece modelos pré-treinados e soluções prontas para acelerar o início de um projeto e permitir ajustes. O Canvas é voltado a modelos no-code, o Macie protege dados sensíveis e o Ground Truth cuida da rotulagem de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon SageMaker Canvas, para criar modelos em interface no-code", false],
            ["Amazon Macie, para descoberta de dados sensíveis", false],
            ["Amazon SageMaker JumpStart, hub de modelos e soluções prontas", true],
            ["Amazon SageMaker Ground Truth, para rotulagem de dados de treino", false],
        ],
    },
    {
        statement:
            "O que caracteriza uma abordagem de AutoML (aprendizado de máquina automatizado)?",
        explanation:
            "AutoML automatiza as escolhas técnicas do treino: algoritmo, hiperparâmetros e seleção de features. Ele não escolhe os dados de produção sozinho, não cria rótulos do nada e não elimina a etapa de avaliação antes da produção.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Selecionar automaticamente os dados de produção mais recentes para alimentar cada novo ciclo de treino",
                false,
            ],
            [
                "Automatizar a escolha do algoritmo, o ajuste de hiperparâmetros e a seleção de features",
                true,
            ],
            ["Gerar o rótulo de cada exemplo sem depender de dados históricos anotados", false],
            ["Publicar o modelo aprovado em produção sem etapa de avaliação de qualidade", false],
        ],
    },
    {
        statement:
            "Durante a fase de treino de um modelo de machine learning supervisionado, o que essencialmente acontece?",
        explanation:
            "No treino, o algoritmo ajusta seus parâmetros internos a partir dos exemplos para reduzir o erro das previsões. Guardar dados apenas para consulta, gerar previsões em produção (que é a inferência) e rotular manualmente as saídas descrevem outras coisas.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "O modelo apenas guarda os dados brutos para depois consultá-los um a um quando for necessário",
                false,
            ],
            [
                "O modelo gera as previsões finais sobre os dados novos que chegam em produção",
                false,
            ],
            [
                "Os usuários finais rotulam manualmente cada previsão à medida que ela é gerada",
                false,
            ],
            [
                "O algoritmo ajusta seus parâmetros internos com base nos exemplos para reduzir o erro",
                true,
            ],
        ],
    },
    {
        statement:
            "A arquitetura transformer, base da maioria dos LLMs modernos, pondera a importância de diferentes partes da sequência de entrada ao processar cada token. Como esse mecanismo é conhecido?",
        explanation:
            "O diferencial do transformer é o mecanismo de atenção, que pondera a relevância de cada token em relação aos demais. Convolução e pooling são típicos de redes convolucionais, e a recorrência caracteriza as RNNs anteriores ao transformer.",
        topic: "IA generativa",
        options: [
            [
                "Convolução, que desliza filtros sobre a entrada para extrair características locais como em imagens",
                false,
            ],
            [
                "Recorrência, que processa a sequência token a token mantendo um estado oculto repassado adiante",
                false,
            ],
            [
                "Mecanismo de atenção (attention), que pondera a relevância de cada token em relação aos demais",
                true,
            ],
            [
                "Agrupamento (pooling), que reduz a dimensionalidade combinando valores vizinhos em um resumo",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual afirmação distingue corretamente um modelo generativo de um modelo discriminativo?",
        explanation:
            "Modelos generativos aprendem a distribuição dos dados para criar novos exemplos, enquanto os discriminativos aprendem fronteiras para classificar. A distinção não depende do tipo de dado nem exclusivamente do uso de rótulos.",
        topic: "IA generativa",
        options: [
            [
                "O generativo cria novos conteúdos, e o discriminativo separa classes de dados existentes",
                true,
            ],
            [
                "O generativo só funciona com imagens, enquanto o discriminativo trabalha exclusivamente com texto e dados tabulares",
                false,
            ],
            [
                "Ambos apenas classificam dados, diferindo só na quantidade de camadas da rede neural",
                false,
            ],
            [
                "O generativo exige dados rotulados manualmente, ao passo que o discriminativo aprende sempre sem qualquer rótulo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer um foundation model capaz de receber uma imagem junto com uma pergunta em texto e responder sobre o conteúdo da imagem. Que característica do modelo é essencial para isso?",
        explanation:
            "Modelos multimodais aceitam mais de um tipo de entrada, como texto e imagem, sendo necessários para interpretar uma imagem junto de uma pergunta. RLHF melhora o alinhamento e a difusão gera imagens, mas nenhum dos dois dá essa capacidade.",
        topic: "IA generativa",
        options: [
            [
                "Ser treinado com aprendizado por reforço a partir de feedback humano para alinhar as respostas ao usuário",
                false,
            ],
            [
                "Ter uma janela de contexto pequena para reduzir o custo de cada chamada de inferência ao modelo",
                false,
            ],
            [
                "Usar exclusivamente modelos de difusão, a única categoria capaz de interpretar imagens de entrada",
                false,
            ],
            [
                "Ser multimodal, processando na mesma chamada mais de um tipo de entrada, como o par imagem e texto",
                true,
            ],
        ],
    },
    {
        statement: "No Amazon Bedrock, o que é a família de modelos Amazon Titan?",
        explanation:
            "O Amazon Titan é a família de foundation models desenvolvida pela AWS, disponível no Bedrock para geração de texto, embeddings e imagens. Não são instâncias de GPU, ferramenta de rotulagem nem serviço exclusivo de terceiros.",
        topic: "IA generativa",
        options: [
            [
                "Um conjunto de instâncias de GPU otimizadas que o cliente aluga para treinar seus próprios modelos do zero",
                false,
            ],
            [
                "Foundation models criados pela própria AWS, oferecidos para tarefas como geração de texto e de embeddings",
                true,
            ],
            [
                "Uma ferramenta de rotulagem de dados que prepara datasets antes do treinamento supervisionado de modelos",
                false,
            ],
            [
                "Um serviço separado do Bedrock que hospeda apenas modelos de imagem de provedores terceiros",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento quer um assistente de IA integrado ao ambiente de codificação que sugira trechos de código, explique funções e ajude a depurar. Qual serviço da AWS é o mais indicado?",
        explanation:
            "O Amazon Q Developer é o assistente de IA generativa voltado a desenvolvedores, com sugestão e explicação de código e apoio à depuração. Q Business foca em dados corporativos, Comprehend em NLP e Polly em síntese de voz.",
        topic: "IA generativa",
        options: [
            [
                "Amazon Q Developer, o assistente para tarefas de código no ciclo de desenvolvimento",
                true,
            ],
            [
                "Amazon Q Business, voltado a responder perguntas sobre documentos e dados corporativos internos",
                false,
            ],
            [
                "Amazon Comprehend, que extrai entidades e sentimentos de textos em linguagem natural",
                false,
            ],
            [
                "Amazon Polly, que converte texto em fala com vozes naturais em vários idiomas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa iniciante quer experimentar e prototipar aplicativos de IA generativa em um ambiente pronto, sem escrever código nem provisionar infraestrutura. O que é o PartyRock, da AWS, nesse contexto?",
        explanation:
            "O PartyRock é um playground do Amazon Bedrock para construir e explorar apps de IA generativa sem código. Não é banco vetorial, serviço de treino distribuído nem ferramenta de linha de comando para deploy.",
        topic: "IA generativa",
        options: [
            [
                "Um banco de dados vetorial totalmente gerenciado usado para armazenar embeddings em aplicações de busca semântica de larga escala",
                false,
            ],
            [
                "Um serviço de treinamento distribuído que particiona grandes modelos entre várias GPUs automaticamente",
                false,
            ],
            [
                "Um playground no Amazon Bedrock para criar e experimentar apps de IA generativa sem código",
                true,
            ],
            [
                "Uma ferramenta de linha de comando para implantar modelos treinados em endpoints do SageMaker",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma cientista de dados quer acessar foundation models e soluções pré-construídas dentro do Amazon SageMaker para implantar e ajustar modelos rapidamente. Qual recurso oferece esse catálogo?",
        explanation:
            "O SageMaker JumpStart oferece um hub de foundation models e soluções pré-construídas para acelerar o deploy e o ajuste. Ground Truth faz rotulagem, Feature Store gerencia atributos e Clarify trata viés e explicabilidade.",
        topic: "IA generativa",
        options: [
            [
                "SageMaker Ground Truth, que gerencia fluxos de rotulagem de dados feita por revisores humanos ou de forma automatizada",
                false,
            ],
            [
                "SageMaker Feature Store, que armazena e serve atributos de ML de forma centralizada",
                false,
            ],
            ["SageMaker Clarify, que analisa viés e explica as previsões dos modelos", false],
            [
                "SageMaker JumpStart, o hub de foundation models e soluções prontas para implantar",
                true,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor envia exatamente o mesmo prompt a um LLM duas vezes e recebe respostas com redações diferentes. Como se explica esse comportamento?",
        explanation:
            "LLMs costumam amostrar o próximo token de forma probabilística, então a mesma entrada pode gerar respostas diferentes (não-determinismo). Não é erro nem estouro de contexto, e reduzir a temperatura torna a saída mais estável.",
        topic: "IA generativa",
        options: [
            [
                "O modelo travou e retornou um erro interno, pois o mesmo prompt deveria gerar sempre a resposta idêntica palavra por palavra",
                false,
            ],
            [
                "LLMs geralmente têm saída não-determinística, com amostragem probabilística que pode variar entre chamadas",
                true,
            ],
            [
                "A janela de contexto foi excedida, o que obriga o modelo a inventar tokens aleatórios no lugar da resposta correta",
                false,
            ],
            [
                "Os embeddings do prompt mudam a cada requisição porque são recalculados com valores aleatórios diferentes",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao ajustar os parâmetros de inferência de um LLM, o que o parâmetro top-p (nucleus sampling) controla?",
        explanation:
            "O top-p limita a amostragem ao menor conjunto de tokens cuja soma de probabilidades alcança p, controlando a diversidade. Limitar o tamanho é papel do máximo de tokens, exemplos no prompt são few-shot e as camadas são fixas na arquitetura.",
        topic: "IA generativa",
        options: [
            [
                "Restringe a escolha do próximo token ao menor conjunto cuja probabilidade acumulada atinge o valor p",
                true,
            ],
            [
                "Define o número máximo de tokens que a resposta pode conter antes de o modelo ser interrompido automaticamente",
                false,
            ],
            [
                "Determina quantos exemplos devem ser incluídos no prompt para orientar o formato da resposta desejada",
                false,
            ],
            [
                "Fixa a quantidade de camadas de atenção que o modelo ativa durante o processamento de cada requisição",
                false,
            ],
        ],
    },
    {
        statement: "Qual é o efeito de reduzir o parâmetro top-k na geração de texto de um LLM?",
        explanation:
            "Reduzir o top-k deixa menos candidatos a próximo token, tornando a saída mais focada e previsível. Isso não altera a janela de contexto, não libera todos os tokens nem afeta o treinamento.",
        topic: "IA generativa",
        options: [
            [
                "O modelo passa a aceitar prompts mais longos, aumentando proporcionalmente o tamanho da janela de contexto disponível",
                false,
            ],
            [
                "O modelo aumenta a criatividade ao sortear livremente entre todos os tokens do vocabulário sem qualquer corte",
                false,
            ],
            ["O modelo reduz o tempo de treinamento necessário para aprender novos idiomas", false],
            [
                "O modelo considera menos candidatos a próximo token, tornando a saída mais restrita e previsível",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma equipe compara dois foundation models para um chatbot: um modelo grande e um modelo menor. Que tradeoff geral costuma valer nessa escolha?",
        explanation:
            "Modelos maiores costumam ser mais capazes, mas custam mais e respondem com mais latência; menores são mais baratos e rápidos, com possível perda de qualidade. As demais opções invertem ou negam esse tradeoff.",
        topic: "IA generativa",
        options: [
            [
                "O modelo menor sempre entrega respostas de qualidade superior porque foi treinado com muito mais dados e parâmetros",
                false,
            ],
            [
                "O modelo maior tende a ser mais capaz, porém com maior custo e latência por requisição",
                true,
            ],
            [
                "Ambos têm exatamente o mesmo custo e a mesma latência, já que rodam na mesma infraestrutura gerenciada",
                false,
            ],
            [
                "O modelo maior reduz a latência porque precisa de menos cálculos para cada token",
                false,
            ],
        ],
    },
    {
        statement:
            "Em qual cenário a IA generativa é MENOS apropriada, sendo o ML tradicional a melhor escolha?",
        explanation:
            "Prever um valor numérico a partir de dados históricos é regressão, bem resolvida por ML tradicional. Redigir e-mails, gerar imagens e resumir textos são casos típicos de IA generativa.",
        topic: "IA generativa",
        options: [
            [
                "Redigir automaticamente rascunhos de e-mails de marketing personalizados a partir de instruções em texto livre",
                false,
            ],
            [
                "Gerar variações de imagens de produtos para campanhas a partir de descrições textuais fornecidas",
                false,
            ],
            [
                "Prever numericamente a demanda de estoque do próximo mês a partir de dados históricos de vendas",
                true,
            ],
            [
                "Resumir longos relatórios em poucos parágrafos preservando os pontos principais para os executivos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma chamada envia um prompt de 3.900 tokens a um modelo com janela de contexto de 4.096 e as respostas voltam truncadas. Qual é a causa provável?",
        explanation:
            "A janela de contexto é compartilhada entre prompt e resposta: com 3.900 tokens de entrada em 4.096, restam cerca de 196 para a saída. Modo de cobrança, temperatura e limite de requisições não determinam o espaço disponível para a resposta.",
        topic: "IA generativa",
        options: [
            [
                "Entrada e saída dividem a janela de contexto, e sobraram poucos tokens para a resposta",
                true,
            ],
            [
                "O plano sob demanda limita o tamanho das respostas, e o caso exige throughput provisionado",
                false,
            ],
            [
                "A temperatura configurada baixa encurta as respostas, e valores maiores as destravariam",
                false,
            ],
            [
                "O modelo atingiu o limite de requisições por minuto e cortou o texto para poupar a cota",
                false,
            ],
        ],
    },
    {
        statement:
            "No Amazon Bedrock, o modo de precificação sob demanda (on-demand) para foundation models cobra com base em quê?",
        explanation:
            "No modo sob demanda paga-se pelo uso, tipicamente por tokens de entrada e de saída, sem compromisso de longo prazo. Não é taxa fixa ilimitada, não exige provisionar GPUs nem cobra por usuário cadastrado.",
        topic: "IA generativa",
        options: [
            [
                "Em uma taxa mensal fixa que dá direito a chamadas ilimitadas a qualquer modelo disponível no serviço",
                false,
            ],
            ["No número de servidores de GPU que o cliente provisiona e mantém ligados", false],
            [
                "Na quantidade de usuários cadastrados na conta, independentemente de quantas requisições cada um faz",
                false,
            ],
            ["No volume processado, como a quantidade de tokens de entrada e de saída", true],
        ],
    },
    {
        statement:
            "Um desenvolvedor descreve em linguagem natural a função que precisa e recebe do assistente uma implementação em Python pronta para revisar. Que capacidade de IA generativa está sendo usada?",
        explanation:
            "Transformar uma descrição em linguagem natural em código pronto é um caso clássico de geração de código. As demais opções descrevem classificação, detecção de anomalias e OCR.",
        topic: "IA generativa",
        options: [
            [
                "Classificação de sentimentos do texto para medir a satisfação do desenvolvedor com a linguagem escolhida",
                false,
            ],
            [
                "Geração de código a partir de linguagem natural, com implementação pronta para revisar e testar",
                true,
            ],
            [
                "Detecção de anomalias em métricas de infraestrutura para prever falhas antes que elas aconteçam",
                false,
            ],
            [
                "Reconhecimento óptico de caracteres para extrair texto de imagens de documentos escaneados",
                false,
            ],
        ],
    },
    {
        statement:
            "Um departamento jurídico recebe contratos de dezenas de páginas e quer versões curtas com os pontos principais para leitura rápida. Qual capacidade de IA generativa atende diretamente a essa necessidade?",
        explanation:
            "Reduzir documentos longos a resumos com os pontos-chave é sumarização, um uso central da IA generativa. Tradução, síntese de voz e criptografia resolvem outras necessidades.",
        topic: "IA generativa",
        options: [
            [
                "Tradução simultânea dos contratos para diversos idiomas estrangeiros exigidos por filiais no exterior",
                false,
            ],
            [
                "Conversão dos contratos em áudio narrado para que a equipe possa ouvir durante os deslocamentos",
                false,
            ],
            [
                "Sumarização de textos longos, que condensa os contratos em versões curtas com os pontos principais",
                true,
            ],
            [
                "Criptografia do conteúdo dos contratos para impedir acesso não autorizado aos dados sensíveis",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer um chatbot de atendimento que entenda perguntas escritas de forma livre pelos clientes e responda em linguagem natural. Por que um LLM é adequado nesse caso?",
        explanation:
            "LLMs entendem linguagem livre e geram respostas contextualizadas, sem depender de roteiro. Árvores com todas as combinações e roteiros de intenção são o desenho dos bots tradicionais, e pergunta aberta não vira consulta SQL exata por si só.",
        topic: "IA generativa",
        options: [
            [
                "Ele interpreta e gera linguagem natural, mantendo diálogo com respostas contextualizadas",
                true,
            ],
            [
                "Ele consulta uma árvore de decisão com todas as combinações possíveis de perguntas dos clientes",
                false,
            ],
            [
                "Ele converte cada pergunta em uma consulta SQL exata sobre o banco de perguntas frequentes",
                false,
            ],
            [
                "Ele responde a partir de um roteiro fixo de intenções cadastradas previamente pela equipe",
                false,
            ],
        ],
    },
    {
        statement: "Como, em linhas gerais, os modelos de difusão geram uma imagem?",
        explanation:
            "Modelos de difusão partem de ruído e o removem gradualmente, condicionados pelo prompt, até formar uma imagem nova. Não colam trechos de fotos, não buscam uma imagem pronta nem mapeiam palavras diretamente para pixels.",
        topic: "IA generativa",
        options: [
            [
                "Recortam e colam pedaços de fotos reais de um banco de imagens até montar a composição final solicitada",
                false,
            ],
            [
                "Selecionam a imagem mais parecida já armazenada e apenas ajustam o brilho e o contraste conforme o pedido",
                false,
            ],
            [
                "Traduzem cada palavra do prompt em um pixel fixo segundo uma tabela pré-definida de cores",
                false,
            ],
            [
                "Partem de ruído aleatório e o refinam em passos sucessivos, guiados pelo prompt, até formar a imagem",
                true,
            ],
        ],
    },
    {
        statement:
            "Em uma busca semântica, dois textos com significados parecidos tendem a ter embeddings que se comportam como?",
        explanation:
            "Embeddings mapeiam textos para vetores em que a proximidade indica semelhança de significado, base da busca semântica. Eles não exigem palavras idênticas, não são aleatórios nem imagens.",
        topic: "IA generativa",
        options: [
            [
                "Sequências de caracteres idênticas, já que textos parecidos precisam usar exatamente as mesmas palavras",
                false,
            ],
            [
                "Vetores próximos no espaço vetorial, refletindo a semelhança de significado entre os textos",
                true,
            ],
            [
                "Valores numéricos totalmente aleatórios, sem qualquer relação com o conteúdo original dos textos",
                false,
            ],
            [
                "Arquivos de imagem que representam visualmente cada frase para comparação pixel a pixel",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação envia um documento muito extenso a um LLM e parte do conteúdo parece ser ignorada. Qual limite do modelo provavelmente foi atingido?",
        explanation:
            "A janela de contexto define o total de tokens que o modelo considera de uma vez; conteúdo que a excede é ignorado ou truncado. Temperatura, embeddings e número de parâmetros não causam esse corte.",
        topic: "IA generativa",
        options: [
            [
                "A temperatura, parâmetro que ao chegar ao máximo faz o modelo descartar o início do texto enviado",
                false,
            ],
            [
                "O número de embeddings gratuitos, que se esgota e passa a truncar automaticamente qualquer entrada adicional",
                false,
            ],
            [
                "A quantidade de parâmetros do modelo, que diminui conforme mais texto é enviado em uma única chamada",
                false,
            ],
            [
                "A janela de contexto, o limite de tokens de entrada e saída que o modelo processa em uma única chamada",
                true,
            ],
        ],
    },
    {
        statement:
            "No catálogo do Amazon Bedrock, uma equipe vê modelos de texto e também um gerador de imagens listado como foundation model, e pergunta se todo foundation model é um LLM. Qual afirmação está correta?",
        explanation:
            "Foundation models são modelos pré-treinados de base, de várias modalidades: texto, imagem, embeddings. LLMs são o subconjunto voltado a linguagem. Por isso um gerador de imagens pode ser foundation model sem ser LLM, e os termos não são sinônimos.",
        topic: "IA generativa",
        options: [
            [
                "Foundation model é a categoria ampla; LLMs são os especializados em linguagem, e há foundation models de imagem",
                true,
            ],
            [
                "Todo foundation model é um LLM, e os geradores de imagem são apenas LLMs adaptados para produzir pixels em vez de palavras",
                false,
            ],
            [
                "LLM é a categoria ampla, e foundation model designa somente os LLMs hospedados em serviços de nuvem",
                false,
            ],
            [
                "Os dois termos descrevem o mesmo conjunto de modelos, e a diferença entre eles é apenas de marketing",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa gerar embeddings de texto na AWS para uma busca semântica e prefere um modelo da própria Amazon no Bedrock. Qual opção atende?",
        explanation:
            "O Amazon Titan Embeddings é o modelo da AWS no Bedrock para gerar embeddings de texto usados em busca semântica. Lex cria chatbots, Textract extrai dados de documentos e Rekognition analisa imagens.",
        topic: "IA generativa",
        options: [
            [
                "Amazon Lex, serviço para construir interfaces de conversação e chatbots com reconhecimento de intenções e slots",
                false,
            ],
            [
                "Amazon Textract, que extrai texto, formulários e tabelas de documentos digitalizados",
                false,
            ],
            [
                "Amazon Titan Embeddings, o modelo da própria Amazon que converte texto em vetores",
                true,
            ],
            [
                "Amazon Rekognition, que analisa imagens e vídeos para identificar objetos e rostos",
                false,
            ],
        ],
    },
    {
        statement:
            "A mesma plataforma atende um chatbot jurídico, que precisa de respostas sóbrias e repetíveis, e um gerador de ideias de campanha, que precisa de variedade. Qual configuração de inferência diferencia os dois casos?",
        explanation:
            "Temperatura controla a aleatoriedade: baixa aproxima as respostas do mais provável e repetível, alta abre espaço para variação criativa. A opção do top-k inverte a lógica, porque top-k menor reduz a diversidade, e janela de contexto e máximo de tokens tratam de tamanho, não de variabilidade.",
        topic: "IA generativa",
        options: [
            [
                "Temperatura baixa no assistente jurídico e mais alta no gerador de ideias de campanha",
                true,
            ],
            [
                "Janela de contexto ampliada no jurídico e reduzida no gerador, controlando a memória",
                false,
            ],
            [
                "Top-k menor no gerador de ideias e maior no jurídico, regulando a diversidade do texto",
                false,
            ],
            [
                "Máximo de tokens alto no jurídico e baixo no gerador, definindo o nível de detalhe",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de atendimento em tempo real precisa reduzir o tempo de resposta percebido pelo usuário. Quais DUAS abordagens ajudam? (Selecione DUAS opções.)",
        explanation:
            "Modelo menor gera tokens mais rápido e o streaming reduz o tempo até o primeiro texto na tela, que é o que o usuário percebe. Mais tokens de saída e prompts maiores aumentam o processamento, e top-p regula diversidade, não velocidade.",
        topic: "IA generativa",
        options: [
            ["Usar um modelo menor e mais rápido, adequado à complexidade da tarefa", true],
            ["Transmitir a resposta em streaming, exibindo os tokens conforme são gerados", true],
            [
                "Ampliar o máximo de tokens de saída para as respostas virem completas de uma vez",
                false,
            ],
            ["Elevar top-p ao máximo para o modelo escolher os tokens com menos cálculo", false],
            [
                "Repetir o histórico completo da conversa no prompt para dar contexto suficiente",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de indexar documentos longos em uma base de conhecimento para RAG, uma equipe divide cada documento em trechos menores. Por que essa etapa de 'chunking' costuma ser feita?",
        explanation:
            "Dividir em trechos permite gerar um embedding por trecho e recuperar apenas os pedaços mais relevantes, que cabem na janela de contexto do modelo.",
        topic: "RAG e customização",
        options: [
            [
                "Para que cada trecho vire um embedding e a busca retorne apenas as partes relevantes ao contexto do modelo",
                true,
            ],
            [
                "Para converter os documentos em um único vetor que representa a base inteira e dispensa a busca",
                false,
            ],
            [
                "Para criptografar o conteúdo dos documentos antes de enviá-los ao foundation model durante a geração da resposta",
                false,
            ],
            [
                "Para treinar novamente o foundation model com os documentos, ajustando seus pesos a cada novo arquivo adicionado",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa jurídica quer que um foundation model conheça melhor a terminologia e o estilo de textos da sua área, usando um grande volume de documentos internos sem rótulos. Qual abordagem de customização se encaixa nesse objetivo?",
        explanation:
            "O pré-treino continuado usa um corpus grande e sem rótulos para adaptar o modelo ao vocabulário e ao estilo de um domínio, diferente do fine-tuning, que usa exemplos rotulados.",
        topic: "RAG e customização",
        options: [
            [
                "Retrieval-augmented generation, que injeta trechos recuperados no prompt sem alterar o modelo",
                false,
            ],
            [
                "Continued pre-training (pré-treino continuado), que adapta o modelo a um domínio usando um corpus amplo e não rotulado",
                true,
            ],
            [
                "Prompt engineering com exemplos few-shot cuidadosamente selecionados e um prompt de sistema detalhado que descreve todas as regras do domínio jurídico",
                false,
            ],
            [
                "Guardrails configurados para bloquear qualquer termo que não pertença ao vocabulário jurídico da empresa",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco quer que seu assistente responda sempre no mesmo tom de marca e em um formato fixo de resposta, comportamento que prompts e RAG não vêm mantendo de forma consistente. Qual abordagem tende a resolver melhor?",
        explanation:
            "Quando o objetivo é internalizar um tom e um formato de saída consistentes, o fine-tuning com exemplos rotulados costuma superar RAG e ajustes de prompt.",
        topic: "RAG e customização",
        options: [
            ["Aumentar a temperatura para o modelo variar mais o estilo das respostas", false],
            [
                "Adicionar mais documentos à base de conhecimento de RAG, já que recuperar mais trechos faz o modelo aprender o tom de marca ao longo do tempo",
                false,
            ],
            [
                "Reduzir a janela de contexto para forçar respostas mais curtas e padronizadas em qualquer situação",
                false,
            ],
            [
                "Fazer fine-tuning do modelo com exemplos rotulados no tom e no formato desejados",
                true,
            ],
        ],
    },
    {
        statement:
            "Ao configurar uma Amazon Bedrock Knowledge Base, a equipe precisa escolher onde armazenar os vetores gerados a partir dos documentos. Qual opção lista serviços que podem servir como banco vetorial nesse cenário?",
        explanation:
            "Bases de conhecimento do Bedrock podem usar bancos vetoriais como o OpenSearch Serverless e o Aurora PostgreSQL com a extensão pgvector para armazenar e buscar embeddings.",
        topic: "RAG e customização",
        options: [
            ["Amazon Polly e Amazon Transcribe", false],
            ["Amazon CloudFront e Amazon Route 53", false],
            ["Amazon OpenSearch Serverless e Aurora PostgreSQL com pgvector", true],
            [
                "Amazon QuickSight conectado a um data warehouse Redshift, que indexa os vetores automaticamente para busca por similaridade",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai fazer fine-tuning de um foundation model no Amazon Bedrock para uma tarefa específica. Como os dados de treino normalmente precisam ser preparados?",
        explanation:
            "O fine-tuning supervisionado usa exemplos rotulados com a entrada e a saída esperada, normalmente em arquivos no Amazon S3.",
        topic: "RAG e customização",
        options: [
            [
                "Como exemplos rotulados de entrada e saída desejada, em arquivos armazenados no Amazon S3",
                true,
            ],
            [
                "Como uma coleção de imagens sem rótulos que o serviço converte sozinho em pares de pergunta e resposta durante o treinamento",
                false,
            ],
            [
                "Como consultas SQL que extraem os dados diretamente de um banco relacional em tempo de inferência",
                false,
            ],
            [
                "Como embeddings pré-calculados que substituem a necessidade de qualquer exemplo de treino",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de investir em RAG ou fine-tuning, uma equipe quer testar a abordagem de menor custo e esforço para melhorar as respostas de um foundation model. Por onde começar?",
        explanation:
            "Prompt engineering é a abordagem mais barata e rápida de experimentar, pois não exige treino nem infraestrutura extra antes de partir para RAG ou fine-tuning.",
        topic: "RAG e customização",
        options: [
            [
                "Por continued pre-training com todo o histórico de documentos da empresa, pois isso garante o melhor resultado logo na primeira tentativa",
                false,
            ],
            ["Por treinar um modelo próprio do zero para a tarefa", false],
            ["Por prompt engineering, ajustando as instruções e os exemplos no prompt", true],
            ["Por provisionar um cluster de GPUs dedicado antes de qualquer teste", false],
        ],
    },
    {
        statement: "Em uma solução de RAG, qual é o papel do modelo de embeddings?",
        explanation:
            "O modelo de embeddings transforma textos em vetores que representam o significado; o mesmo modelo embute documentos e consultas para a busca por similaridade.",
        topic: "RAG e customização",
        options: [
            ["Gerar a resposta final em linguagem natural a partir dos trechos recuperados", false],
            [
                "Converter textos em vetores numéricos que capturam o significado, para permitir a busca por similaridade",
                true,
            ],
            [
                "Armazenar permanentemente os documentos originais e controlar as permissões de acesso de cada usuário à base",
                false,
            ],
            ["Traduzir os documentos para o idioma do usuário antes de exibir a resposta", false],
        ],
    },
    {
        statement:
            "Quando um usuário faz uma pergunta a um sistema de RAG, o que acontece na etapa de recuperação (retrieval)?",
        explanation:
            "Na recuperação, a pergunta é convertida em embedding e comparada com os vetores da base para achar os trechos mais próximos, que vão ao prompt. Reescrever a pergunta é técnica auxiliar opcional, enviar a base inteira não escala e a base participa antes da resposta, não depois.",
        topic: "RAG e customização",
        options: [
            [
                "O modelo reescreve a pergunta do usuário em linguagem formal antes de qualquer busca",
                false,
            ],
            [
                "O sistema envia todos os documentos da base no prompt para o modelo escolher os úteis",
                false,
            ],
            [
                "A pergunta vira um vetor e o sistema busca os trechos mais similares na base vetorial",
                true,
            ],
            [
                "O modelo responde de memória e a base entra apenas para conferir a resposta no final",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao comparar abordagens de customização, qual afirmação está correta sobre os pesos do modelo?",
        explanation:
            "Fine-tuning e pré-treino continuado modificam os pesos do modelo; RAG e prompt engineering influenciam a resposta sem retreinar o modelo.",
        topic: "RAG e customização",
        options: [
            ["RAG e prompt engineering reajustam os pesos do modelo a cada consulta", false],
            [
                "Continued pre-training não altera os pesos e apenas adiciona documentos a uma base vetorial consultada em tempo de execução",
                false,
            ],
            [
                "Fine-tuning e continued pre-training alteram os pesos; RAG e prompt engineering não",
                true,
            ],
            [
                "Foundation models são imutáveis, portanto nenhuma dessas abordagens muda seu comportamento",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de fazer fine-tuning de um modelo para uma tarefa recorrente, qual benefício a equipe pode esperar em relação ao uso de prompts longos com muitos exemplos?",
        explanation:
            "Com o comportamento internalizado pelo fine-tuning, dá para usar prompts mais curtos e menos exemplos, o que pode reduzir custo e latência.",
        topic: "RAG e customização",
        options: [
            [
                "O modelo passa a atualizar sozinho seu conhecimento sobre fatos novos do mundo sem qualquer necessidade de retreinar ou de recuperar dados externos",
                false,
            ],
            [
                "O comportamento desejado fica embutido no modelo, reduzindo a necessidade de muitos exemplos no prompt",
                true,
            ],
            ["A janela de contexto do modelo passa a ser ilimitada", false],
            ["O modelo deixa de cobrar por tokens de entrada e de saída", false],
        ],
    },
    {
        statement:
            "Uma equipe sem experiência em construir pipelines de dados quer implementar RAG. Que trabalho o Amazon Bedrock Knowledge Bases automatiza para ela?",
        explanation:
            "A base de conhecimento gerencia a ingestão: faz o chunking, gera os embeddings e grava os vetores no banco vetorial, sem a equipe construir esse pipeline.",
        topic: "RAG e customização",
        options: [
            [
                "A criação de exemplos rotulados e o treino supervisionado de um modelo customizado",
                false,
            ],
            [
                "A definição das políticas de IAM, o provisionamento da VPC e a configuração de todo o monitoramento de custos da conta AWS",
                false,
            ],
            [
                "A escrita manual dos prompts de sistema e a curadoria humana de cada resposta gerada",
                false,
            ],
            [
                "A divisão dos documentos em trechos, a geração dos embeddings e o armazenamento no banco vetorial",
                true,
            ],
        ],
    },
    {
        statement:
            "Em uma arquitetura de RAG, o que fica armazenado no banco de dados vetorial após a ingestão dos documentos?",
        explanation:
            "O banco vetorial guarda os embeddings dos trechos junto a metadados que referenciam o texto original, o que permite recuperar a fonte e citar a resposta.",
        topic: "RAG e customização",
        options: [
            ["Os embeddings dos trechos, com metadados que apontam para o texto de origem", true],
            ["Os pesos ajustados do foundation model após o treinamento", false],
            [
                "Uma cópia integral do modelo de linguagem, incluindo o vocabulário de tokens e os parâmetros de inferência padrão de cada consulta",
                false,
            ],
            [
                "Apenas as perguntas históricas dos usuários, usadas para reordenar respostas futuras",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor inclui no prompt exatamente um exemplo de pergunta com a resposta desejada antes de apresentar a tarefa real ao modelo. Como essa técnica é chamada?",
        explanation:
            "Fornecer um único exemplo no prompt caracteriza o one-shot; nenhum exemplo seria zero-shot e vários exemplos, few-shot.",
        topic: "Prompt engineering",
        options: [
            ["Zero-shot prompting", false],
            ["One-shot prompting", true],
            [
                "Chain-of-thought prompting, em que o modelo detalha cada passo do raciocínio antes de concluir a resposta final",
                false,
            ],
            ["Continued pre-training", false],
        ],
    },
    {
        statement:
            "Ao construir um assistente, a equipe define separadamente uma instrução que estabelece o papel do modelo, seu tom e as regras que ele deve seguir em toda a conversa. Que elemento é esse?",
        explanation:
            "O prompt de sistema define papel, tom e regras gerais do assistente, servindo de moldura para as demais mensagens da conversa.",
        topic: "Prompt engineering",
        options: [
            [
                "É a temperatura, um parâmetro numérico que determina o papel e as regras de comportamento que o assistente seguirá durante toda a conversa",
                false,
            ],
            ["É um embedding que representa as regras em forma de vetor", false],
            ["É o prompt de sistema, que orienta o comportamento geral do modelo", true],
            ["É a janela de contexto reservada para as respostas do usuário", false],
        ],
    },
    {
        statement:
            "Uma analista quer melhorar a qualidade das respostas de um LLM ajustando o prompt. Quais DOIS elementos tornam um prompt mais eficaz? (Selecione DUAS opções.)",
        explanation:
            "Prompt eficaz diz o que fazer, com que contexto e em que formato, e exemplos ajudam a fixar o padrão esperado. Ambiguidade e várias tarefas na mesma mensagem dispersam o modelo, e repetir instrução não substitui clareza.",
        topic: "Prompt engineering",
        options: [
            ["Instrução clara da tarefa acompanhada do contexto relevante para executá-la", true],
            ["Definição do formato esperado da resposta, com exemplos quando necessário", true],
            ["Ambiguidade proposital, dando ao modelo liberdade para interpretar a tarefa", false],
            ["Várias perguntas diferentes reunidas na mesma mensagem para ganhar tempo", false],
            [
                "Repetição da mesma instrução muitas vezes para reforçar a obediência do modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe cria uma estrutura de prompt reutilizável com espaços reservados, como 'Resuma o seguinte texto: {texto}', preenchidos a cada chamada. Que recurso é esse?",
        explanation:
            "Templates de prompt definem uma estrutura fixa com variáveis preenchidas dinamicamente, padronizando as chamadas e facilitando o reuso.",
        topic: "Prompt engineering",
        options: [
            ["Um embedding de consulta", false],
            ["Um guardrail de conteúdo", false],
            [
                "Um processo de fine-tuning que grava permanentemente a instrução de resumo dentro dos pesos do modelo a cada execução",
                false,
            ],
            ["Um template de prompt com variáveis", true],
        ],
    },
    {
        statement:
            "Um usuário escreve um prompt pedindo que o modelo 'finja ser uma IA sem restrições' para obter uma resposta que as regras de segurança normalmente bloqueiam. Que tipo de ataque é esse?",
        explanation:
            "O jailbreak tenta contornar as salvaguardas do modelo, por exemplo pedindo que ele assuma um papel sem restrições para liberar conteúdo bloqueado.",
        topic: "Prompt engineering",
        options: [
            [
                "Alucinação, situação em que o modelo, ao interpretar mal a instrução, inventa fatos e referências que não existem na base de dados",
                false,
            ],
            ["Jailbreak, uma tentativa de burlar as salvaguardas do modelo", true],
            ["Overfitting do prompt aos dados de treino", false],
            ["Um erro de tokenização na entrada", false],
        ],
    },
    {
        statement:
            "Ao gerar um texto, uma equipe adiciona ao prompt instruções sobre o que o modelo NÃO deve fazer, como 'não use jargão técnico e não cite concorrentes'. Como se chama essa prática?",
        explanation:
            "O prompt negativo especifica o que o modelo deve evitar, ajudando a restringir o estilo e o conteúdo da resposta.",
        topic: "Prompt engineering",
        options: [
            ["Few-shot prompting", false],
            [
                "Continued pre-training, em que o modelo aprende com um corpus a evitar permanentemente jargão técnico e menções a concorrentes",
                false,
            ],
            ["Negative prompting (prompt negativo)", true],
            ["Prompt injection", false],
        ],
    },
    {
        statement:
            "Um aplicativo insere o texto enviado pelo usuário dentro de um prompt maior. A equipe teme que alguém escreva instruções para o modelo ignorar as regras do sistema. Qual medida ajuda a mitigar esse risco?",
        explanation:
            "Mitigar prompt injection envolve validar e isolar a entrada do usuário, aplicar guardrails e não misturar dados do usuário com as instruções de sistema.",
        topic: "Prompt engineering",
        options: [
            [
                "Aumentar a temperatura e o limite de tokens de saída, para que o modelo tenha liberdade de responder qualquer instrução que o usuário venha a inserir no texto",
                false,
            ],
            ["Publicar o prompt de sistema completo na interface para o usuário conferir", false],
            ["Desativar qualquer registro de log das chamadas ao modelo", false],
            [
                "Validar a entrada e usar guardrails, separando as instruções do sistema do conteúdo do usuário",
                true,
            ],
        ],
    },
    {
        statement:
            "Um modelo retorna respostas em formatos variados quando recebe apenas a instrução da tarefa. A equipe então acrescenta ao prompt dois ou três exemplos com o formato exato desejado. Por que isso ajuda?",
        explanation:
            "Poucos exemplos no prompt (few-shot) orientam o modelo a reproduzir o formato desejado em tempo de inferência, sem necessidade de retreino.",
        topic: "Prompt engineering",
        options: [
            [
                "Os exemplos guiam o modelo a seguir o padrão de saída, sem precisar treinar o modelo",
                true,
            ],
            [
                "Os exemplos reajustam os pesos do modelo permanentemente durante a inferência",
                false,
            ],
            [
                "Os exemplos aumentam a janela de contexto do modelo, o que por si só garante que qualquer formato de resposta seja sempre respeitado",
                false,
            ],
            ["Os exemplos substituem a necessidade de um banco vetorial em soluções de RAG", false],
        ],
    },
    {
        statement:
            "Uma empresa quer um assistente que receba fotos de produtos e gere descrições em texto a partir das imagens. Que critério deve guiar a escolha do foundation model?",
        explanation:
            "A tarefa exige interpretar imagens, então o modelo precisa ser multimodal; janela de contexto e preço não substituem o suporte a essa modalidade.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Escolher o modelo com a maior janela de contexto, pois seria isso que determina a capacidade de interpretar imagens",
                false,
            ],
            ["Escolher qualquer modelo de texto, pois todos aceitariam imagens", false],
            ["Escolher um modelo multimodal, capaz de receber imagens como entrada", true],
            [
                "Escolher o modelo mais barato por token, independentemente das modalidades que ele suporta",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa classificar milhões de mensagens curtas por sentimento com baixo custo e, separadamente, redigir relatórios complexos que exigem raciocínio elaborado. Que estratégia de escolha de modelo faz sentido?",
        explanation:
            "Casar a capacidade do modelo com a complexidade da tarefa equilibra custo e qualidade: modelos menores atendem tarefas simples de alto volume e modelos maiores, tarefas que exigem mais raciocínio.",
        topic: "Aplicações de foundation models",
        options: [
            ["Usar o maior modelo disponível para as duas tarefas, sem considerar custo", false],
            ["Usar um modelo menor e barato na classificação e um modelo maior no relatório", true],
            [
                "Usar o mesmo modelo minúsculo para tudo, pois o tamanho do modelo não influencia a qualidade em tarefas de raciocínio mais elaborado",
                false,
            ],
            [
                "Escolher o modelo apenas pela popularidade, ignorando a complexidade de cada tarefa",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer avaliar se as respostas de um assistente soam úteis, educadas e alinhadas ao tom da marca, aspectos difíceis de medir por métricas numéricas. Que método de avaliação é mais adequado?",
        explanation:
            "Aspectos subjetivos como utilidade e tom são melhor avaliados por julgamento humano, já que métricas automáticas nem sempre capturam essas qualidades.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Medir exclusivamente a latência e o número de tokens por resposta, pois esses valores refletem diretamente o quão educada e útil a resposta é",
                false,
            ],
            ["Contar quantas vezes cada palavra aparece no conjunto de treino", false],
            ["Verificar o tamanho do arquivo do modelo em disco", false],
            ["Avaliação humana, com pessoas julgando a qualidade das respostas", true],
        ],
    },
    {
        statement:
            "Para avaliar automaticamente a qualidade de resumos gerados por um modelo, comparando-os a resumos de referência, qual tipo de recurso é apropriado?",
        explanation:
            "Métricas automáticas como ROUGE comparam a saída gerada com textos de referência e são comuns para avaliar resumos e outras tarefas de geração de texto.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Uma métrica automática como ROUGE, que compara a saída com textos de referência",
                true,
            ],
            [
                "Uma pesquisa de satisfação enviada aos usuários finais semanas depois, cujo resultado serve como métrica automática objetiva de qualidade do resumo",
                false,
            ],
            ["O parâmetro de temperatura usado durante a geração dos resumos", false],
            ["O número de documentos presentes no banco vetorial", false],
        ],
    },
    {
        statement:
            "Ao desenhar uma solução de RAG de ponta a ponta, qual sequência representa corretamente o fluxo em tempo de consulta?",
        explanation:
            "No RAG, a pergunta é transformada em embedding, os trechos mais relevantes são recuperados e enviados ao modelo, que gera a resposta fundamentada neles.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Converter a pergunta em embedding, recuperar trechos relevantes e enviá-los ao modelo para gerar a resposta",
                true,
            ],
            [
                "Fazer fine-tuning do modelo com a pergunta, publicar um novo endpoint e só então permitir que o usuário receba qualquer resposta do sistema",
                false,
            ],
            [
                "Gerar a resposta primeiro e depois procurar documentos que a confirmem no banco vetorial",
                false,
            ],
            [
                "Enviar a base inteira de documentos ao modelo a cada pergunta, sem nenhuma etapa de busca",
                false,
            ],
        ],
    },
    {
        statement:
            "Um assistente de suporte deve dar respostas factuais e consistentes, com pouca variação entre execuções da mesma pergunta. Quais DUAS configurações favorecem esse comportamento? (Selecione DUAS opções.)",
        explanation:
            "Temperatura baixa reduz a aleatoriedade e o contexto factual ancora o conteúdo; juntos, dão consistência. Top-p alto aumenta a variação, janela de contexto define capacidade e não estilo, e streaming muda a entrega da resposta, não o conteúdo.",
        topic: "Aplicações de foundation models",
        options: [
            ["Temperatura baixa, aproximando a geração da escolha mais provável", true],
            ["Fatos fornecidos ao modelo via contexto recuperado de fontes confiáveis", true],
            [
                "Top-p elevado ao máximo, ampliando o leque de tokens considerados em cada passo da geração",
                false,
            ],
            ["Janela de contexto maior, para o modelo ter mais espaço de criação", false],
            ["Streaming de resposta ativado, estabilizando o texto token a token", false],
        ],
    },
    {
        statement:
            "Ao configurar um Agent for Amazon Bedrock para automatizar um processo, como a equipe define quais ações o agente pode executar, por exemplo chamar uma função que registra um pedido?",
        explanation:
            "Nos Agents for Amazon Bedrock, os action groups conectam o agente a funções (por exemplo, via Lambda), definindo as ações que ele pode executar.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Aumentando a temperatura do modelo até que ele descubra sozinho quais APIs chamar",
                false,
            ],
            [
                "Definindo action groups que associam o agente a funções, tipicamente via AWS Lambda",
                true,
            ],
            [
                "Adicionando os documentos das APIs a um banco vetorial, o que faz o agente executar automaticamente qualquer função encontrada durante a busca",
                false,
            ],
            ["Escrevendo um prompt negativo que lista tudo o que o agente não deve fazer", false],
        ],
    },
    {
        statement:
            "Em que situação um agente (Agents for Amazon Bedrock) é mais adequado do que uma solução de RAG simples que apenas responde perguntas?",
        explanation:
            "Agentes se justificam quando a solução precisa agir e orquestrar várias etapas, como chamar APIs e sistemas; para apenas responder com base em documentos, o RAG basta.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Quando o objetivo é apenas resumir um único documento curto que já cabe inteiro na janela de contexto do modelo, sem chamar nenhum sistema externo",
                false,
            ],
            ["Quando não há necessidade de chamar nenhuma API nem realizar ações", false],
            [
                "Quando a tarefa exige executar ações e coordenar várias etapas, não só recuperar informação",
                true,
            ],
            ["Quando se deseja apenas converter documentos em embeddings para busca", false],
        ],
    },
    {
        statement:
            "Uma empresa implanta um assistente de IA e exige um mecanismo para pausar, ajustar ou substituir o comportamento do sistema caso ele passe a agir de forma indesejada em produção. Essa capacidade corresponde a qual dimensão da IA responsável?",
        explanation:
            "Controlabilidade é a dimensão que trata da capacidade de supervisionar, guiar e intervir no comportamento de um sistema de IA, incluindo pausar ou ajustar sua operação.",
        topic: "IA responsável",
        options: [
            [
                "Explicabilidade, pois descreve em detalhes como o modelo processou as variáveis de entrada e chegou a cada previsão individual",
                false,
            ],
            [
                "Controlabilidade, a capacidade de monitorar e orientar o comportamento do sistema de IA",
                true,
            ],
            [
                "Veracidade, que garante que as respostas geradas sejam sempre factualmente corretas",
                false,
            ],
            [
                "Sustentabilidade, relacionada a reduzir o consumo de energia da infraestrutura de treino",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao lançar um chatbot de atendimento, a equipe jurídica recomenda deixar claro ao usuário que ele conversa com um assistente de IA e informar suas limitações. Qual dimensão da IA responsável essa recomendação reforça?",
        explanation:
            "Transparência significa comunicar de forma clara quando a IA está sendo usada, além de suas capacidades e limitações, para que as pessoas saibam que interagem com um sistema automatizado.",
        topic: "IA responsável",
        options: [
            [
                "Robustez, que mede se o modelo mantém desempenho estável diante de entradas ruidosas ou inesperadas",
                false,
            ],
            [
                "Justiça (fairness), que busca evitar tratamento desigual entre diferentes grupos de pessoas",
                false,
            ],
            ["Privacidade, que trata da proteção de dados pessoais usados pelo sistema", false],
            [
                "Transparência, que envolve comunicar de forma aberta como e quando a IA é usada",
                true,
            ],
        ],
    },
    {
        statement:
            "Um banco usa um modelo para recomendar aprovação de crédito e precisa mostrar, para cada decisão, quais variáveis mais pesaram no resultado. Qual recurso ajuda a produzir essa atribuição de importância por previsão?",
        explanation:
            "O SageMaker Clarify fornece explicações de atributos baseadas em valores SHAP, indicando quanto cada variável contribuiu para uma previsão, o que apoia a explicabilidade.",
        topic: "IA responsável",
        options: [
            [
                "Amazon SageMaker Clarify, que calcula a contribuição de cada atributo para as previsões do modelo",
                true,
            ],
            [
                "Amazon SageMaker Model Monitor, voltado a detectar desvio de dados no ambiente de produção ao longo do tempo",
                false,
            ],
            [
                "Amazon Macie, que descobre e classifica dados sensíveis armazenados em buckets do Amazon S3",
                false,
            ],
            [
                "AWS CloudTrail, que registra as chamadas de API feitas na conta para fins de auditoria",
                false,
            ],
        ],
    },
    {
        statement:
            "Após avaliar um modelo de triagem de currículos, uma equipe percebe que a taxa de aprovação é muito menor para candidatas mulheres do que para homens com qualificações equivalentes. O que essa diferença indica?",
        explanation:
            "Resultados sistematicamente desiguais entre grupos comparáveis caracterizam um problema de justiça (fairness), uma dimensão central da IA responsável.",
        topic: "IA responsável",
        options: [
            [
                "Indica desvio de conceito (concept drift) e deve ser corrigido apenas com mais poder de computação no treino",
                false,
            ],
            [
                "Indica um problema de justiça (fairness), pois o modelo produz resultados sistematicamente desiguais entre grupos",
                true,
            ],
            [
                "Indica falta de explicabilidade, um problema que se resolve somente publicando o código-fonte completo do modelo para todos os usuários finais",
                false,
            ],
            [
                "Indica sobreajuste (overfitting), situação em que o modelo memoriza os dados de treino e falha em dados novos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora quer que seu assistente generativo no Amazon Bedrock remova automaticamente números de documentos e outros dados pessoais que apareçam nas respostas ao usuário. Qual recurso atende a essa necessidade?",
        explanation:
            "Os Guardrails do Amazon Bedrock incluem filtros de informações sensíveis capazes de detectar e mascarar ou bloquear dados pessoais (PII) em prompts e respostas.",
        topic: "IA responsável",
        options: [
            [
                "Ativar os filtros de informações sensíveis do Amazon Bedrock Guardrails para detectar e mascarar dados pessoais",
                true,
            ],
            [
                "Aumentar o valor do parâmetro de temperatura nas chamadas ao modelo para reduzir a repetição de dados sensíveis",
                false,
            ],
            [
                "Trocar o foundation model por um modelo de embeddings especializado em busca vetorial de documentos internos",
                false,
            ],
            [
                "Habilitar o AWS CloudTrail para registrar todas as chamadas de API feitas na conta e assim, por si só, impedir o vazamento de dados pessoais nas respostas",
                false,
            ],
        ],
    },
    {
        statement:
            "Durante os testes, um modelo de visão computacional funciona bem com fotos limpas, mas erra muito quando as imagens têm ruído, baixa iluminação ou pequenas distorções. Qual dimensão da IA responsável está em falha?",
        explanation:
            "Robustez é a dimensão que descreve a capacidade de um sistema manter desempenho confiável mesmo diante de entradas ruidosas, adversas ou fora do padrão de treino.",
        topic: "IA responsável",
        options: [
            [
                "Justiça (fairness), que se concentra em evitar disparidades de tratamento entre diferentes grupos de usuários",
                false,
            ],
            [
                "Sustentabilidade, que busca reduzir o consumo de recursos computacionais e o impacto ambiental do modelo",
                false,
            ],
            [
                "Robustez, a capacidade de manter desempenho confiável diante de entradas imperfeitas ou inesperadas",
                true,
            ],
            [
                "Transparência, que trata de comunicar de forma clara quando e como a IA é utilizada",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de liberar um modelo de linguagem para clientes, uma equipe quer medir com que frequência ele gera respostas ofensivas ou tóxicas. Quais DUAS abordagens são adequadas? (Selecione DUAS opções.)",
        explanation:
            "Métricas de toxicidade sobre conjuntos de teste dão a medida sistemática, e o red teaming expõe os casos difíceis que os testes padrão não cobrem. Acurácia de pré-treino não mede toxicidade, exemplos de documentação não representam uso real e custo não indica conteúdo nocivo.",
        topic: "IA responsável",
        options: [
            ["Avaliação automatizada com conjuntos de teste e métricas de toxicidade", true],
            ["Red teaming, com avaliadores tentando provocar respostas nocivas do modelo", true],
            ["Aprovação com base na acurácia que o modelo base obteve no pré-treinamento", false],
            ["Verificação manual apenas dos exemplos publicados na documentação oficial", false],
            ["Monitoramento do custo médio por resposta como indicador indireto de risco", false],
        ],
    },
    {
        statement:
            "Uma organização quer reduzir o custo ambiental de suas cargas de IA sem abandonar os projetos. Qual prática está alinhada à sustentabilidade como dimensão da IA responsável?",
        explanation:
            "Dimensionar corretamente os modelos e otimizar a inferência reduz o uso de computação e energia, contribuindo para a sustentabilidade e para um menor custo ambiental.",
        topic: "IA responsável",
        options: [
            [
                "Escolher sempre o maior modelo disponível, garantindo a melhor qualidade em qualquer caso",
                false,
            ],
            [
                "Manter todos os endpoints de inferência ativos permanentemente, mesmo sem tráfego, para evitar qualquer atraso de resposta",
                false,
            ],
            [
                "Selecionar modelos do tamanho adequado e otimizar a inferência para consumir menos recursos computacionais e energia",
                true,
            ],
            [
                "Duplicar os ambientes de treino em várias regiões ao mesmo tempo para acelerar cada experimento de ajuste de hiperparâmetros",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao preparar dados de pacientes para treinar um modelo de saúde, quais DUAS práticas protegem a privacidade dos titulares? (Selecione DUAS opções.)",
        explanation:
            "Minimização de coleta e anonimização reduzem a exposição de dados pessoais desde a origem. Retenção indefinida, cópias em ambientes de teste e coleta indiscriminada ampliam a superfície de risco e vão contra princípios de privacidade.",
        topic: "IA responsável",
        options: [
            ["Coletar somente os campos estritamente necessários para o objetivo do modelo", true],
            ["Anonimizar ou pseudonimizar os identificadores antes do uso no treinamento", true],
            [
                "Reter os dados por tempo indeterminado para possibilitar reusos futuros do time",
                false,
            ],
            [
                "Copiar a base completa para os ambientes de teste, agilizando os experimentos",
                false,
            ],
            [
                "Coletar todos os campos disponíveis agora e decidir mais tarde o que aproveitar",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema de reconhecimento de voz funciona bem para alguns sotaques, mas falha para falantes de regiões sub-representadas no treino. Quais DUAS medidas alinham a solução à inclusão? (Selecione DUAS opções.)",
        explanation:
            "Inclusão pede dados representativos e avaliação por subgrupo, para enxergar e fechar a disparidade. Restringir o serviço exclui os afetados, avaliar todo mundo junto esconde a diferença e temperatura não corrige falta de representatividade no treino.",
        topic: "IA responsável",
        options: [
            [
                "Ampliar a coleta de dados com amostras representativas dos grupos prejudicados",
                true,
            ],
            ["Avaliar as métricas por subgrupo de falantes, acompanhando as disparidades", true],
            ["Restringir o serviço aos grupos em que o modelo já apresenta bom desempenho", false],
            ["Tratar todos os falantes como um único grupo nas avaliações para simplificar", false],
            [
                "Aumentar a temperatura da inferência para gerar transcrições mais variadas para todos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa processa documentos com um modelo, mas quer que os casos em que o modelo tem baixa confiança sejam revisados por uma pessoa antes da decisão final. Qual serviço facilita esse fluxo de revisão humana?",
        explanation:
            "O Amazon A2I (Augmented AI) permite encaminhar previsões, por exemplo as de baixa confiança, para revisão humana antes da decisão final, implementando human-in-the-loop.",
        topic: "IA responsável",
        options: [
            [
                "Amazon Augmented AI (A2I), que integra revisão humana às previsões de modelos de machine learning",
                true,
            ],
            [
                "Amazon SageMaker Model Monitor, que acompanha a qualidade das previsões e detecta desvios ao longo do tempo",
                false,
            ],
            [
                "AWS Artifact, que fornece sob demanda relatórios de conformidade e certificações de segurança da AWS",
                false,
            ],
            [
                "Amazon Macie, que identifica e classifica automaticamente dados sensíveis armazenados no Amazon S3",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa de um modelo cujas decisões possam ser entendidas diretamente pela sua própria estrutura, sem depender de ferramentas externas de explicação. Qual opção descreve um modelo intrinsecamente interpretável?",
        explanation:
            "Modelos como árvores de decisão simples e regressões lineares são intrinsecamente interpretáveis, pois sua estrutura revela como as entradas levam à saída, sem métodos de explicação posteriores.",
        topic: "IA responsável",
        options: [
            [
                "Uma rede neural profunda com muitas camadas ocultas, tratada como caixa-preta e explicada só depois com métodos auxiliares",
                false,
            ],
            [
                "Uma árvore de decisão simples, cujas regras de decisão podem ser lidas e compreendidas diretamente",
                true,
            ],
            [
                "Um grande modelo de linguagem generativo com bilhões de parâmetros ajustados sobre enormes volumes de texto da internet",
                false,
            ],
            [
                "Um conjunto (ensemble) de centenas de modelos, com lógica final difícil de acompanhar",
                false,
            ],
        ],
    },
    {
        statement:
            "Em uma solução de RAG no Amazon Bedrock, a equipe quer bloquear respostas que não estejam apoiadas nos documentos recuperados, reduzindo alucinações. Qual recurso ajuda a impor essa checagem?",
        explanation:
            "A verificação de embasamento contextual dos Guardrails do Bedrock avalia se a resposta está fundamentada na fonte fornecida, ajudando a bloquear conteúdo não sustentado e a reduzir alucinações.",
        topic: "IA responsável",
        options: [
            [
                "A configuração de uma chave do AWS KMS para criptografar os documentos de origem em repouso",
                false,
            ],
            [
                "A criação de um endpoint de interface com AWS PrivateLink para manter o tráfego dentro da rede privada da AWS",
                false,
            ],
            [
                "A verificação de embasamento contextual (contextual grounding) do Amazon Bedrock Guardrails",
                true,
            ],
            [
                "O aumento do limite de tokens de saída para permitir que o modelo detalhe melhor a origem de cada afirmação gerada",
                false,
            ],
        ],
    },
    {
        statement:
            "O SageMaker Clarify revelou que um modelo de concessão de crédito favorece um grupo específico por causa de desequilíbrios no conjunto de treino. Qual é uma ação de mitigação apropriada?",
        explanation:
            "Quando o viés vem de desequilíbrios nos dados, uma mitigação apropriada é rebalancear ou aumentar o conjunto de treino e reavaliar as métricas de viés, em vez de ignorar o achado.",
        topic: "IA responsável",
        options: [
            [
                "Remover o relatório de viés para que a auditoria não registre o problema encontrado",
                false,
            ],
            [
                "Colocar o modelo em produção sem alterações, já que a acurácia geral média ficou dentro da meta definida pela equipe",
                false,
            ],
            [
                "Aumentar o número máximo de tokens das respostas do modelo para que ele justifique melhor cada decisão de crédito",
                false,
            ],
            [
                "Rebalancear ou aumentar os dados de treino para representar melhor os grupos e reavaliar o viés depois",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer garantir que apenas a equipe de dados possa invocar os modelos do Amazon Bedrock e que os demais times não tenham esse acesso. Qual é a forma recomendada de aplicar esse controle?",
        explanation:
            "O AWS IAM permite definir políticas que concedem a invocação de modelos apenas aos perfis autorizados, aplicando controle de acesso a serviços de IA com privilégio mínimo.",
        topic: "Segurança e governança",
        options: [
            [
                "Criar políticas do AWS IAM que concedam as permissões de invocação apenas aos perfis autorizados",
                true,
            ],
            [
                "Compartilhar uma única chave de acesso raiz com todos os times para simplificar o uso",
                false,
            ],
            [
                "Publicar o endpoint do modelo na internet e confiar em um segredo em texto no código dos aplicativos internos",
                false,
            ],
            [
                "Desativar o registro de chamadas de API para que ninguém consiga descobrir quais equipes usam quais modelos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa garantir que os dados de treino no Amazon S3 e os artefatos de modelo fiquem criptografados em repouso, com controle sobre as chaves. Qual serviço atende a esse requisito?",
        explanation:
            "O AWS KMS gerencia as chaves de criptografia usadas para proteger dados em repouso, como os conjuntos de treino no S3 e os artefatos de modelo.",
        topic: "Segurança e governança",
        options: [
            [
                "Amazon CloudWatch, para coletar métricas operacionais e disparar alarmes sobre o uso dos recursos de treino",
                false,
            ],
            [
                "AWS Artifact, para baixar relatórios de conformidade e certificações de segurança dos data centers da AWS",
                false,
            ],
            [
                "AWS Key Management Service (KMS), para criptografar os dados e artefatos em repouso e gerenciar as chaves",
                true,
            ],
            [
                "Amazon Augmented AI, para incluir uma etapa de revisão humana nas previsões geradas pelos modelos já treinados",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao enviar dados de um aplicativo para um endpoint de inferência, a equipe de segurança exige proteção contra interceptação durante o trânsito na rede. Qual medida atende a esse objetivo?",
        explanation:
            "A criptografia em trânsito com TLS (HTTPS) protege os dados enquanto trafegam pela rede entre o cliente e o endpoint, evitando interceptação.",
        topic: "Segurança e governança",
        options: [
            [
                "Armazenar os dados de entrada em um bucket público para que o endpoint consiga lê-los sem autenticação adicional",
                false,
            ],
            [
                "Usar conexões criptografadas com TLS (HTTPS) para proteger os dados em trânsito entre o aplicativo e o endpoint",
                true,
            ],
            [
                "Registrar o conteúdo completo de cada requisição em texto simples em logs compartilhados para facilitar a depuração",
                false,
            ],
            [
                "Aumentar o número de instâncias do endpoint para que o tráfego seja distribuído e fique mais difícil de interceptar",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma instituição financeira treina modelos com dados sigilosos e precisa que os jobs do SageMaker rodem sem acesso à internet pública. Quais DUAS configurações atendem ao requisito? (Selecione DUAS opções.)",
        explanation:
            "VPC com sub-redes privadas isola os jobs, e VPC endpoints dão o caminho privado até o S3 e os demais serviços. Proxy público continua sendo exposição, tags não bloqueiam tráfego e criptografia em trânsito protege o conteúdo, mas não elimina o acesso à internet.",
        topic: "Segurança e governança",
        options: [
            [
                "Executar os jobs dentro de uma VPC com sub-redes privadas e isolamento de rede",
                true,
            ],
            ["Acessar o S3 e os demais serviços por VPC endpoints, sem rota para a internet", true],
            ["Expor os jobs atrás de um proxy público protegido por senha forte e MFA", false],
            ["Aplicar tags de confidencialidade aos jobs para bloquear o tráfego externo", false],
            [
                "Manter somente a criptografia em trânsito, preservando a saída padrão para a internet",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa deve manter os dados de clientes armazenados e processados dentro do país por exigência regulatória. No contexto dos serviços de IA da AWS, qual decisão apoia esse requisito de residência de dados?",
        explanation:
            "A residência de dados é atendida escolhendo a região da AWS no local exigido, já que os dados de um serviço em geral permanecem na região selecionada pelo cliente.",
        topic: "Segurança e governança",
        options: [
            [
                "Confiar que a AWS move os dados automaticamente para a região mais barata a cada momento",
                false,
            ],
            [
                "Distribuir cópias dos dados por todas as regiões globais para aumentar a disponibilidade e o desempenho de leitura",
                false,
            ],
            [
                "Selecionar uma região da AWS localizada no país exigido para armazenar e processar os dados",
                true,
            ],
            [
                "Ignorar a escolha de região, pois serviços gerenciados de IA replicam os dados livremente entre continentes por padrão",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de governança precisa saber exatamente qual versão do conjunto de dados gerou cada modelo implantado, para reproduzir resultados e responder a auditorias. Qual recurso apoia esse rastreamento?",
        explanation:
            "O rastreamento de linhagem (ML Lineage Tracking) do SageMaker registra as relações entre dados, código e versões de modelo, apoiando reprodutibilidade e auditoria.",
        topic: "Segurança e governança",
        options: [
            [
                "O Amazon Bedrock Guardrails, que aplica filtros de conteúdo e bloqueia temas indesejados nas respostas do modelo",
                false,
            ],
            [
                "O rastreamento de linhagem do SageMaker, que registra a relação entre dados, código e versões de modelo",
                true,
            ],
            [
                "O aumento da temperatura, que torna as previsões mais variadas e fáceis de reproduzir",
                false,
            ],
            [
                "O Amazon Macie, que descobre e classifica dados sensíveis, mas não relaciona conjuntos de dados a modelos treinados",
                false,
            ],
        ],
    },
    {
        statement:
            "Meses após implantar um modelo, uma equipe percebe queda de desempenho porque a distribuição dos dados de entrada mudou em relação ao treino. Qual recurso ajuda a detectar automaticamente esse desvio (drift)?",
        explanation:
            "O SageMaker Model Monitor compara continuamente os dados e as previsões em produção com uma linha de base e emite alertas quando detecta desvio, indicando necessidade de retreino.",
        topic: "Segurança e governança",
        options: [
            [
                "AWS CloudTrail, que registra chamadas de API na conta, mas não avalia a distribuição estatística dos dados de entrada",
                false,
            ],
            [
                "AWS KMS, que gerencia chaves de criptografia, mas não acompanha mudanças na qualidade das previsões do modelo",
                false,
            ],
            [
                "AWS PrivateLink, que mantém o tráfego na rede privada, mas não mede o desempenho preditivo do modelo em produção",
                false,
            ],
            [
                "Amazon SageMaker Model Monitor, que compara os dados de produção com uma linha de base e alerta sobre desvios",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa um serviço gerenciado de IA da AWS. Segundo o modelo de responsabilidade compartilhada, qual tarefa é responsabilidade do cliente, e não da AWS?",
        explanation:
            "No modelo de responsabilidade compartilhada, a AWS cuida da segurança da nuvem (a infraestrutura física), enquanto o cliente é responsável pela segurança na nuvem, como IAM e a classificação e proteção dos seus dados.",
        topic: "Segurança e governança",
        options: [
            [
                "Manter a segurança física e a manutenção do hardware nos data centers do serviço",
                false,
            ],
            [
                "Aplicar patches no sistema operacional e no hardware subjacente que hospeda o serviço gerenciado de IA",
                false,
            ],
            [
                "Configurar as permissões de IAM e classificar os dados que serão enviados ao serviço",
                true,
            ],
            [
                "Garantir a disponibilidade global da infraestrutura de rede que interliga as regiões e zonas de disponibilidade",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa vai personalizar (fine-tuning) um foundation model no Amazon Bedrock com dados proprietários e teme beneficiar o modelo de terceiros. Quais DUAS garantias o serviço oferece? (Selecione DUAS opções.)",
        explanation:
            "O fine-tuning no Bedrock cria uma cópia privada do modelo dentro da conta, e os dados de personalização não alimentam os modelos base. Nada vai para catálogo público, os dados não se incorporam ao modelo base e os provedores não têm acesso ao material de treino.",
        topic: "Segurança e governança",
        options: [
            ["O ajuste gera uma cópia privada do modelo na conta, sem alterar o modelo base", true],
            [
                "Os dados de treino não são usados pela AWS nem pelos provedores para treinar os modelos base",
                true,
            ],
            [
                "O modelo ajustado entra automaticamente no catálogo público do Bedrock depois de validado pela AWS",
                false,
            ],
            ["Os dados enviados passam a integrar o modelo base após o término do job", false],
            ["O provedor do modelo revisa os dados de treino para aprovar o ajuste", false],
        ],
    },
    {
        statement:
            "A liderança quer acompanhar os gastos com inferência de IA generativa por equipe e por projeto, com alertas ao passar do orçado. Quais DOIS recursos atendem a isso? (Selecione DUAS opções.)",
        explanation:
            "Tags de alocação separam o custo por equipe e projeto no Cost Explorer, e o Budgets dispara alertas quando o gasto passa do definido. CloudTrail audita chamadas, CloudWatch mede operação e o Config avalia conformidade; nenhum deles orça nem alerta custo por área.",
        topic: "Segurança e governança",
        options: [
            [
                "Tags de alocação de custos nos recursos, analisadas por equipe no Cost Explorer",
                true,
            ],
            [
                "AWS Budgets com limites definidos e alertas automáticos de estouro do orçamento",
                true,
            ],
            [
                "AWS CloudTrail, que registra as chamadas de API realizadas em cada um dos serviços da conta",
                false,
            ],
            ["Amazon CloudWatch, contando invocações como aproximação dos valores gastos", false],
            [
                "AWS Config, que avalia continuamente a conformidade das configurações da conta",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de publicar um endpoint de inferência, a equipe de operações quer acompanhar quase em tempo real o número de invocações, a latência e a taxa de erros, com alarmes automáticos. Qual serviço é o mais indicado?",
        explanation:
            "O Amazon CloudWatch coleta métricas operacionais como invocações, latência e erros de um endpoint e permite configurar alarmes automáticos sobre esses indicadores.",
        topic: "Segurança e governança",
        options: [
            [
                "AWS Artifact, que disponibiliza relatórios de conformidade e certificações, mas não coleta métricas de operação em tempo real",
                false,
            ],
            [
                "AWS KMS, que gerencia chaves de criptografia dos dados, mas não acompanha latência nem taxa de erros do endpoint",
                false,
            ],
            [
                "Amazon CloudWatch, que coleta métricas operacionais do endpoint e dispara alarmes com base em limites definidos",
                true,
            ],
            [
                "Amazon A2I, que adiciona revisão humana às previsões, mas não monitora indicadores operacionais da infraestrutura",
                false,
            ],
        ],
    },
    {
        statement:
            "Um job de treinamento do SageMaker precisa ler dados de um bucket do Amazon S3. Qual é a prática recomendada para conceder esse acesso com segurança?",
        explanation:
            "Atribuir uma função (execution role) do IAM ao job concede credenciais temporárias com permissões mínimas, evitando o uso de chaves permanentes embutidas no código.",
        topic: "Segurança e governança",
        options: [
            [
                "Incorporar uma chave de acesso permanente do usuário raiz no script de treinamento",
                false,
            ],
            [
                "Atribuir ao job uma função (role) do IAM com permissões restritas, usando credenciais temporárias",
                true,
            ],
            [
                "Tornar o bucket do S3 público para leitura, evitando a necessidade de configurar qualquer permissão de acesso",
                false,
            ],
            [
                "Compartilhar a mesma senha de console entre todos os cientistas de dados que executam jobs de treinamento na conta",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma organização quer garantir que somente modelos revisados e aprovados cheguem à produção, mantendo um histórico de versões e status de aprovação. Qual recurso apoia essa governança?",
        explanation:
            "O SageMaker Model Registry versiona os modelos e registra o status de aprovação, permitindo que apenas versões aprovadas sejam implantadas em produção.",
        topic: "Segurança e governança",
        options: [
            [
                "O aumento da temperatura na inferência, que introduz variação e assim sinalizaria modelos aprovados",
                false,
            ],
            [
                "O AWS PrivateLink, que mantém o tráfego na rede privada, mas não controla quais versões de modelo vão a produção",
                false,
            ],
            [
                "O Amazon Macie, que classifica dados sensíveis em buckets, mas não gerencia aprovação de versões de modelos de ML",
                false,
            ],
            [
                "O SageMaker Model Registry, que versiona modelos e controla o status de aprovação antes da implantação",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa monta uma base de conhecimento para RAG no Amazon Bedrock com documentos internos confidenciais. Quais DUAS medidas protegem esses dados? (Selecione DUAS opções.)",
        explanation:
            "Criptografia com KMS cobre a fonte e o índice vetorial, e o IAM limita quem consulta e administra a base. Bucket aberto expõe tudo na origem, o modelo não é mecanismo de controle de acesso e apagar logs destrói a trilha de auditoria.",
        topic: "Segurança e governança",
        options: [
            [
                "Criptografar a fonte e o armazenamento vetorial com chaves gerenciadas no AWS KMS",
                true,
            ],
            ["Restringir com políticas do IAM quem pode consultar e administrar a base", true],
            [
                "Publicar os documentos em um bucket interno aberto da empresa para facilitar a ingestão diária",
                false,
            ],
            ["Confiar que o modelo evita repetir conteúdo sensível presente nos documentos", false],
            ["Suprimir os logs de acesso da base para não registrar trechos confidenciais", false],
        ],
    },
];
