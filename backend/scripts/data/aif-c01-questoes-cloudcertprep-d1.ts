// Questões do simulado AWS Certified AI Practitioner (AIF-C01), domínio 1 da prova
// (Fundamentals of AI and ML), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aif-c01-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D1: Questao[] = [
    {
        statement:
            "Uma empresa roda em produção um pipeline de ML no Amazon SageMaker AI. As requisições trazem payloads de até 1 GB, podem levar até uma hora para serem processadas, e a empresa quer latência próxima do tempo real. Qual opção de inferência do SageMaker AI atende a esses requisitos?",
        explanation:
            "A inferência assíncrona foi feita para payloads de até 1 GB e processamento de até uma hora com latência próxima do tempo real: enfileira as requisições e grava o resultado no Amazon S3. Tempo real e serverless têm limites bem menores de payload e de tempo, e o batch transform roda jobs offline, sem latência baixa.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Inferência assíncrona, que enfileira as requisições e as processa em segundo plano",
                true,
            ],
            [
                "Inferência em tempo real, com endpoint sempre ativo que responde a cada chamada na hora",
                false,
            ],
            [
                "Batch transform, que processa o conjunto de dados inteiro em um job offline agendado",
                false,
            ],
            [
                "Inferência serverless, que provisiona capacidade sob demanda e reduz a escala a zero",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa construir modelos para várias tarefas novas, mas relacionadas entre si. Em vez de treinar cada modelo do zero, quer adaptar modelos que já foram pré-treinados. Qual estratégia de ML atende a esse requisito?",
        explanation:
            "O aprendizado por transferência (transfer learning) parte de um modelo já treinado em uma tarefa e o adapta a tarefas relacionadas, poupando dados e tempo de treino. Mudar o número de épocas só altera quantas passagens o treino faz nos dados, e o aprendizado não supervisionado busca padrões sem rótulos, sem reaproveitar modelos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aprendizado por transferência, reaproveitando modelos já treinados", true],
            ["Aumentar o número de épocas, treinando cada modelo por mais tempo", false],
            ["Aprendizado não supervisionado, agrupando os dados das novas tarefas", false],
            ["Reduzir o número de épocas, encurtando o treino de cada modelo novo", false],
        ],
    },
    {
        statement:
            "Uma startup cria um app de quiz educativo com perguntas como: 'Um saco tem seis bolinhas vermelhas, quatro verdes e três amarelas. Qual é a probabilidade de tirar uma verde?' O app precisa calcular a resposta de cada pergunta. Qual abordagem faz isso com o MENOR esforço operacional?",
        explanation:
            "A probabilidade é um cálculo determinístico (casos favoráveis divididos pelo total, aqui 4 de 13), então poucas linhas de código dão a resposta exata, sem coletar dados, treinar nem hospedar modelo. Regressão, modelo não supervisionado e aprendizado por reforço criariam um pipeline de ML desnecessário para aproximar um valor que dá para calcular.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Escrever um código simples que calcula a probabilidade com regras básicas de aritmética",
                true,
            ],
            [
                "Treinar um modelo de regressão supervisionada para prever a probabilidade de cada pergunta",
                false,
            ],
            [
                "Criar um modelo não supervisionado que estima a densidade de probabilidade das respostas",
                false,
            ],
            [
                "Aplicar aprendizado por reforço para treinar um modelo que devolve a probabilidade certa",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa colocou um modelo em produção e quer uma métrica que mostre a eficiência do modelo durante a execução, ao atender as requisições. Qual métrica ela deve usar?",
        explanation:
            "A latência média de inferência mede quanto o modelo leva para devolver uma previsão quando já está rodando, então reflete diretamente a eficiência em produção. O CSAT é um resultado de negócio, e o número de exemplos e o tempo por época dizem respeito à fase de treinamento, não à execução.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Latência média de inferência, o tempo para devolver cada previsão", true],
            ["Pontuação de satisfação do cliente (CSAT) com o produto que usa o modelo", false],
            ["Número de exemplos de treinamento usados para construir o modelo", false],
            ["Tempo de treinamento por época, medido durante o ajuste do modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa quer usar IA para proteger sua aplicação contra ameaças, verificando se cada endereço IP que chega vem de uma origem suspeita. Qual solução atende a esse requisito?",
        explanation:
            "A detecção de anomalias aprende como é o tráfego normal e sinaliza o que foge desse padrão, como um IP com comportamento suspeito. O reconhecimento de fala transcreve áudio, o reconhecimento de entidades nomeadas extrai nomes de textos e a previsão de fraudes estima tendências futuras, sem avaliar cada acesso que chega.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Um sistema de detecção de anomalias que sinaliza acessos fora do padrão normal",
                true,
            ],
            [
                "Um sistema de reconhecimento de fala que converte o áudio das chamadas em texto",
                false,
            ],
            [
                "Um sistema de previsão de fraudes que estima o volume de golpes nos próximos meses",
                false,
            ],
            [
                "Um sistema de reconhecimento de entidades nomeadas que extrai nomes de textos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa criou um modelo de classificação de imagens e quer que um aplicativo web o chame para obter previsões em tempo real. Ela precisa de uma forma totalmente gerenciada de hospedar o modelo e servir as previsões, com escala automática conforme a demanda. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon SageMaker Serverless Inference hospeda o modelo e provisiona e escala a computação automaticamente conforme o tráfego, sem gerenciar servidores. O CloudFront é uma rede de entrega de conteúdo, o API Gateway só expõe APIs e precisaria de computação por trás, e o AWS Batch roda jobs em lote, não previsões sob demanda.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Implantar o modelo com o Amazon SageMaker Serverless Inference", true],
            ["Implantar o modelo com o Amazon CloudFront, perto dos usuários", false],
            ["Hospedar o modelo e servir as previsões pelo Amazon API Gateway", false],
            ["Hospedar o modelo e servir as previsões com jobs do AWS Batch", false],
        ],
    },
    {
        statement:
            "Um pesquisador de vida selvagem tem um grande acervo de fotos de animais e quer localizar e categorizar automaticamente os animais presentes em cada imagem, sem trabalho manual. Qual técnica atende a esse requisito?",
        explanation:
            "A detecção de objetos é uma técnica de visão computacional que encontra e classifica os objetos de uma imagem, então localiza cada animal e atribui uma categoria. O reconhecimento de entidades nomeadas trabalha com texto, o inpainting gera conteúdo para preencher partes da imagem e a detecção de anomalias só aponta desvios de padrão.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Detecção de objetos, que localiza e classifica os elementos de uma imagem", true],
            ["Reconhecimento de entidades nomeadas, que extrai nomes e lugares de textos", false],
            ["Inpainting, técnica generativa que preenche regiões ausentes de uma imagem", false],
            ["Detecção de anomalias, que sinaliza dados que fogem do padrão esperado", false],
        ],
    },
    {
        statement:
            "Uma rede de hotéis quer identificar o sentimento das avaliações escritas pelos hóspedes. Quais serviços da AWS atendem a esse requisito? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Comprehend tem análise de sentimento pronta (positivo, negativo, neutro ou misto), e os foundation models do Amazon Bedrock também classificam sentimento a partir de um prompt. O Polly transforma texto em fala, o Lex cria interfaces de conversa e o Rekognition analisa imagens e vídeos, sem avaliar textos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Comprehend, que já traz análise de sentimento pronta para textos", true],
            ["Amazon Polly, que converte os textos das avaliações em fala natural", false],
            ["Amazon Bedrock, com foundation models que classificam o sentimento via prompt", true],
            [
                "Amazon Lex, que cria chatbots de voz e de texto para conversar com os hóspedes",
                false,
            ],
            ["Amazon Rekognition, que analisa imagens e vídeos enviados pelos hóspedes", false],
        ],
    },
    {
        statement:
            "Uma fabricante de eletrônicos quer prever a demanda dos clientes por seus produtos de memória. A equipe não sabe programar nem conhece algoritmos de ML, mas precisa criar um modelo preditivo que use dados internos e externos. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon SageMaker Canvas importa dados de várias fontes, internas e externas, e cria modelos de previsão de séries temporais por interface visual, sem código. Usar algoritmos integrados do SageMaker AI exige escolher e configurar o algoritmo, em geral com código, e escrever código de treinamento próprio também foge da capacidade da equipe.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Importar os dados no Amazon SageMaker Canvas e criar os modelos de previsão no próprio Canvas",
                true,
            ],
            [
                "Preparar os dados no Amazon SageMaker Data Wrangler e treinar os modelos com algoritmos integrados do SageMaker AI",
                false,
            ],
            [
                "Armazenar os dados no Amazon S3 e treinar os modelos com algoritmos integrados do SageMaker AI",
                false,
            ],
            [
                "Preparar os dados no Amazon SageMaker Data Wrangler e treinar os modelos com código de treinamento próprio",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está criando um chatbot de atendimento que deve melhorar continuamente suas respostas aprendendo com as conversas anteriores. Qual estratégia de aprendizado oferece essa capacidade de se aperfeiçoar sozinho?",
        explanation:
            "O aprendizado por reforço melhora o comportamento com base em recompensas, como a avaliação positiva do cliente, então o chatbot se aperfeiçoa com as próprias interações. As opções supervisionadas dependem de pessoas rotulando exemplos ou mantendo a base, e o agrupamento não supervisionado organiza perguntas sem melhorar as respostas.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aprendizado por reforço, recompensando as respostas com avaliação positiva dos clientes",
                true,
            ],
            [
                "Aprendizado supervisionado, com um conjunto de respostas boas e ruins rotuladas manualmente",
                false,
            ],
            [
                "Aprendizado não supervisionado, agrupando as perguntas parecidas dos clientes em clusters",
                false,
            ],
            [
                "Aprendizado supervisionado, treinado com uma base de FAQ atualizada com frequência",
                false,
            ],
        ],
    },
    {
        statement:
            "Um profissional de IA treinou um modelo de deep learning que classifica imagens de cães por raça e agora quer avaliar o desempenho desse modelo. Qual recurso ajuda nessa avaliação?",
        explanation:
            "A matriz de confusão mostra, para cada classe, quantas previsões acertaram e em quais classes o modelo confundiu as raças, por isso serve para avaliar classificadores. A matriz de correlação é uma ferramenta de análise exploratória dos dados, e R² e erro quadrático médio são métricas de regressão, feitas para valores contínuos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Matriz de confusão, que cruza as raças previstas com as raças reais", true],
            ["Matriz de correlação, que mede a relação entre as variáveis dos dados", false],
            ["Coeficiente de determinação (R²), que mede a variância explicada", false],
            ["Erro quadrático médio (MSE), que mede o desvio entre valores numéricos", false],
        ],
    },
    {
        statement:
            "Uma seguradora precisa rodar seu modelo de ML sobre vários anos de registros de sinistros arquivados para gerar previsões, com conjuntos de dados de vários gigabytes. Os resultados não são necessários de imediato. Qual opção de inferência do Amazon SageMaker AI é a mais adequada?",
        explanation:
            "O batch transform, a inferência em lote do SageMaker AI, processa o conjunto de dados inteiro em um job, sem manter endpoint ativo, o que serve para grandes volumes quando as previsões não são urgentes. Tempo real e serverless atendem chamadas individuais com baixa latência, e a inferência assíncrona trata requisições grandes uma a uma, não um arquivo histórico inteiro.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Batch transform, que roda a inferência como job offline sobre todo o conjunto de dados",
                true,
            ],
            [
                "Inferência serverless, que escala sob demanda e atende chamadas intermitentes na hora",
                false,
            ],
            [
                "Inferência em tempo real, com endpoint persistente que responde com baixa latência",
                false,
            ],
            [
                "Inferência assíncrona, que enfileira requisições grandes e responde quase em tempo real",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma agência de recrutamento recebe cada vez mais currículos em PDF e não consegue mais analisá-los manualmente. Ela precisa de uma forma automatizada de converter esses currículos em texto simples para processamento posterior. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Textract extrai automaticamente texto e dados de documentos digitalizados e arquivos PDF, então transforma os currículos em texto para as etapas seguintes. O Lex cria interfaces de conversa, o Transcribe converte fala em texto e o Personalize gera recomendações, e nenhum deles lê o conteúdo de PDFs.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Textract, que extrai texto e dados de documentos e arquivos PDF", true],
            [
                "Amazon Lex, que cria chatbots e interfaces de voz para conversar com usuários",
                false,
            ],
            ["Amazon Transcribe, que converte a fala de arquivos de áudio em texto escrito", false],
            ["Amazon Personalize, que gera recomendações personalizadas em tempo real", false],
        ],
    },
    {
        statement:
            "Uma equipe de ciência de dados acabou de reunir um novo conjunto de dados e agora o examina calculando estatísticas descritivas, montando gráficos e construindo uma matriz de correlação. Qual etapa do pipeline de ML essa atividade descreve?",
        explanation:
            "Estatísticas descritivas, gráficos e matriz de correlação são as ferramentas da análise exploratória de dados, feita para entender distribuição e relações antes de modelar. A coleta vem antes e só reúne os dados, a engenharia de atributos cria variáveis depois dessa análise, e o treinamento é a etapa em que o algoritmo aprende.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Análise exploratória de dados, para entender a estrutura do conjunto", true],
            ["Treinamento do modelo, para ajustar os parâmetros a partir dos dados", false],
            ["Coleta de dados, para reunir os registros brutos das fontes de origem", false],
            ["Engenharia de atributos, para criar variáveis que melhoram o modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa recuperou um conjunto de documentos de texto depois de uma falha no banco de dados, mas algumas palavras se perderam. Ela quer um modelo de ML que preveja a palavra mais provável para cada lacuna. Que tipo de modelo é adequado?",
        explanation:
            "Modelos baseados em BERT são transformers treinados com modelagem de linguagem mascarada: aprendem a prever um token oculto usando o contexto dos dois lados, exatamente o que preencher lacunas exige. A modelagem de tópicos encontra temas, o clustering agrupa documentos e a análise prescritiva recomenda ações, sem prever palavras.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Modelos baseados em BERT, que preveem palavras mascaradas pelo contexto", true],
            [
                "Modelagem de tópicos, que descobre os temas presentes em uma coleção de textos",
                false,
            ],
            ["Modelos de clustering, que agrupam documentos parecidos sem usar rótulos", false],
            ["Modelos de análise prescritiva, que recomendam a melhor ação a tomar", false],
        ],
    },
    {
        statement:
            "Uma empresa de software quer usar IA para aumentar a produtividade dos seus desenvolvedores na escrita de código. Qual solução atende a esse requisito?",
        explanation:
            "Ferramentas de processamento de linguagem natural, base dos assistentes de código com IA generativa, transformam descrições em código e completam trechos, acelerando o trabalho. A classificação binária só separa entradas em duas classes, o clustering agrupa itens sem criar código e a previsão estima valores futuros, sem ajudar a escrever.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Usar uma ferramenta de processamento de linguagem natural (PLN) que gera código",
                true,
            ],
            [
                "Usar um modelo de classificação binária para gerar revisões do código escrito",
                false,
            ],
            ["Usar um algoritmo de clustering para agrupar trechos de código semelhantes", false],
            [
                "Usar um modelo de previsão para estimar quantos defeitos o código terá no futuro",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma loja de varejo planeja prever a demanda de um produto nas próximas semanas usando o algoritmo DeepAR do Amazon SageMaker AI. Que tipo de dado é necessário para atender a esse requisito?",
        explanation:
            "O DeepAR é um algoritmo supervisionado de previsão que usa redes neurais recorrentes para projetar séries temporais, então precisa do histórico de demanda registrado em sequência, com data. Texto serve a tarefas de linguagem, imagem à visão computacional e áudio ao processamento de fala, e nenhum traz a ordem temporal de que a previsão depende.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Dados de séries temporais, com valores registrados em ordem ao longo do tempo", true],
            [
                "Dados de texto, como descrições de produtos e avaliações escritas por clientes",
                false,
            ],
            ["Dados de áudio, como gravações de ligações feitas para a central de vendas", false],
            ["Dados de imagem, como fotos das prateleiras e das vitrines de cada loja", false],
        ],
    },
    {
        statement:
            "Um profissional de IA tem um conjunto de flores já identificadas por espécie, com o comprimento e a largura das pétalas e das sépalas. Ele precisa prever a espécie de novas flores a partir dessas quatro medidas. Qual algoritmo atende a esse requisito?",
        explanation:
            "O k-NN é um algoritmo supervisionado de classificação: atribui a uma flor nova a espécie mais comum entre os vizinhos mais próximos no espaço das medidas. O K-means agrupa dados sem rótulos, sem prever espécies conhecidas, a regressão linear prevê valores numéricos e o ARIMA faz previsão de séries temporais.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "K-nearest neighbors (k-NN), que classifica pelo rótulo dos vizinhos mais próximos",
                true,
            ],
            [
                "Regressão linear, que prevê um valor numérico contínuo a partir das quatro medidas",
                false,
            ],
            ["K-means, que agrupa as flores em clusters sem usar as espécies já conhecidas", false],
            ["ARIMA, que projeta valores futuros de uma série de dados ordenada no tempo", false],
        ],
    },
    {
        statement:
            "Uma equipe de pesquisa de fauna quer treinar um modelo que identifique a espécie mostrada nas fotos de armadilhas fotográficas. Ela já tem um grande conjunto de imagens marcadas com a espécie correta e não vai rotular mais nenhuma. Que tipo de aprendizado deve usar?",
        explanation:
            "Como cada imagem já vem com a espécie correta, o modelo aprende a mapear entrada e rótulo, o que define o aprendizado supervisionado. O aprendizado ativo pede novos rótulos a pessoas, e a equipe não vai rotular mais; o não supervisionado serve quando não há rótulos, e o por reforço aprende com recompensas em um ambiente.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aprendizado supervisionado, treinando com as imagens já rotuladas", true],
            ["Aprendizado por reforço, com recompensas a cada espécie reconhecida", false],
            ["Aprendizado ativo, pedindo rótulos humanos para os casos mais incertos", false],
            ["Aprendizado não supervisionado, agrupando as fotos por semelhança visual", false],
        ],
    },
    {
        statement:
            "Uma rede de restaurantes quer criar um modelo de ML para reduzir o desperdício diário de alimentos e aumentar a receita, e precisa que a acurácia do modelo continue melhorando com o tempo. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon SageMaker AI cobre o ciclo de vida do modelo, e retreiná-lo com dados recentes faz ele acompanhar as mudanças de demanda e melhorar a acurácia. O Personalize gera recomendações e, só com dados históricos, não se adaptaria; o CloudWatch monitora recursos e o Rekognition analisa imagens, e nenhum dos dois treina esse tipo de modelo.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Usar o Amazon SageMaker AI e retreinar o modelo periodicamente com dados mais recentes",
                true,
            ],
            [
                "Usar o Amazon Personalize e refinar o modelo apenas com os dados históricos de pedidos",
                false,
            ],
            [
                "Usar o Amazon Rekognition para analisar fotos dos pratos e aprimorar o modelo",
                false,
            ],
            [
                "Usar o Amazon CloudWatch para examinar os pedidos dos clientes e ajustar o modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa do setor imobiliário criou um modelo de ML que prevê preços de venda de imóveis e quer hospedá-lo para gerar previsões sem precisar gerenciar servidores ou infraestrutura. Qual solução atende a esse requisito?",
        explanation:
            "Um endpoint do Amazon SageMaker AI é uma opção gerenciada: a AWS cuida dos servidores, da escala e da manutenção, e a empresa só chama o modelo para obter previsões. No EC2 ou no EKS a própria empresa provisiona, escala e atualiza servidores ou contêineres, e CloudFront com S3 distribui conteúdo, sem executar inferência.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Implantar o modelo em um endpoint de inferência do Amazon SageMaker AI", true],
            ["Implantar o modelo em uma instância do Amazon EC2 com o framework de ML", false],
            [
                "Implantar o modelo com o Amazon CloudFront integrado a um bucket do Amazon S3",
                false,
            ],
            ["Implantar o modelo em contêineres em um cluster do Amazon EKS", false],
        ],
    },
    {
        statement:
            "Uma fábrica usa IA para inspecionar seus produtos e encontrar danos ou defeitos. Que tipo de aplicação de IA a empresa está usando?",
        explanation:
            "A visão computacional é a área da IA que interpreta imagens e vídeos, base dos sistemas que detectam danos e defeitos em linhas de produção. Sistemas de recomendação sugerem itens a partir do comportamento dos usuários, o processamento de linguagem natural lida com texto e fala, e a previsão de séries temporais projeta valores futuros.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Visão computacional, que interpreta o conteúdo de imagens e vídeos capturados", true],
            [
                "Sistema de recomendação, que sugere itens com base no comportamento dos usuários",
                false,
            ],
            [
                "Processamento de linguagem natural, que interpreta e gera textos e fala humana",
                false,
            ],
            [
                "Previsão de séries temporais, que projeta valores futuros a partir do histórico",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer construir um modelo de ML que preveja a satisfação dos clientes a partir de dados como tempo de entrega, valor do pedido e contatos com o suporte, e precisa que o ajuste do modelo seja totalmente automatizado. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon SageMaker AI treina modelos personalizados e, com o ajuste automático de modelos, roda vários treinos testando hiperparâmetros até achar a melhor combinação, sem ajuste manual. O Athena consulta dados com SQL, o Personalize gera recomendações e o Comprehend analisa textos, e nenhum deles ajusta um modelo próprio de previsão.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Amazon SageMaker AI, com o ajuste automático de modelos (automatic model tuning)",
                true,
            ],
            [
                "Amazon Athena, com consultas SQL interativas sobre os dados armazenados no Amazon S3",
                false,
            ],
            [
                "Amazon Personalize, com recomendações personalizadas geradas a partir do comportamento",
                false,
            ],
            [
                "Amazon Comprehend, com extração de entidades, frases-chave e sentimento de textos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma organização sem fins lucrativos está criando um app de celular para pessoas com baixa visão. O primeiro requisito é o app entender as perguntas que os usuários fazem falando. Qual solução atende a esse requisito?",
        explanation:
            "Uma rede neural de deep learning para reconhecimento de fala converte a pergunta falada em texto que o app consegue processar. Padrões em dados numéricos servem a dados tabulares, a sumarização só condensa texto e a classificação de imagens analisa fotos, não fala.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Usar uma rede neural de deep learning para fazer reconhecimento de fala", true],
            ["Criar modelos de ML para encontrar padrões em dados numéricos tabulares", false],
            ["Usar sumarização com IA generativa para produzir textos com tom humano", false],
            ["Criar modelos personalizados de classificação e reconhecimento de imagens", false],
        ],
    },
    {
        statement:
            "Uma revendedora de carros usados quer estimar o preço de venda de cada veículo a partir de atributos como quilometragem, ano de fabricação e marca. Qual algoritmo ela deve usar para atender a esse requisito?",
        explanation:
            "A regressão linear modela a relação entre os atributos de entrada e um alvo numérico contínuo, como o preço de um veículo. A regressão logística, apesar do nome, prevê a probabilidade de uma categoria, o K-means agrupa registros sem prever valores e o PCA só reduz a quantidade de atributos, sem gerar previsões.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Regressão linear, que relaciona os atributos a um valor numérico contínuo", true],
            ["Regressão logística, que estima a probabilidade de uma classe categórica", false],
            ["K-means, que agrupa veículos parecidos em clusters sem prever valores", false],
            [
                "Análise de componentes principais (PCA), que reduz o número de atributos usados",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao comparar classificadores de fraude, uma equipe descarta um modelo com precisão de 0,95 e recall de 0,20, porque a pontuação F1 dele ficou baixa. Como a pontuação F1 é calculada para chegar a esse resultado?",
        explanation:
            "A F1 é a média harmônica entre precisão e recall, que fica perto do menor dos dois: com 0,95 e 0,20 ela dá cerca de 0,33, enquanto a média aritmética passaria de 0,57. Pegar o maior valor esconderia o recall ruim, e a proporção de acertos sobre todas as previsões é a acurácia.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Pela média harmônica entre precisão e recall, que fica perto do menor dos dois",
                true,
            ],
            [
                "Pela média aritmética entre precisão e recall, somando os dois e dividindo por dois",
                false,
            ],
            [
                "Pelo maior valor entre precisão e recall, que representa o melhor cenário do modelo",
                false,
            ],
            ["Pela proporção de acertos sobre todas as previsões, positivas e negativas", false],
        ],
    },
    {
        statement:
            "Uma loja online criou um sistema que marca pedidos como possíveis fraudes, e uma equipe revisa manualmente cada pedido marcado. A empresa quer reduzir o tempo que a equipe perde revisando pedidos marcados que se revelam legítimos. Qual métrica de avaliação ela deve otimizar?",
        explanation:
            "Pedidos legítimos marcados como fraude são falsos positivos, e a precisão (fraudes confirmadas entre todos os pedidos marcados) cai quando eles aumentam; otimizá-la reduz as revisões desperdiçadas. O recall mede quanto da fraude real é pego e pode elevar os falsos positivos, a F1 equilibra as duas e a acurácia engana com poucas fraudes.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Precisão, a fração dos pedidos marcados que eram fraude de verdade", true],
            ["Recall, a fração das fraudes reais que o sistema consegue marcar", false],
            ["Pontuação F1, a média harmônica entre a precisão e o recall do sistema", false],
            ["Acurácia, a fração de todas as previsões que o sistema acertou", false],
        ],
    },
    {
        statement:
            "Uma equipe de MLOps está avaliando adotar infraestrutura como código (IaC) para os ambientes de ML da empresa. Qual é um benefício do uso de IaC em MLOps?",
        explanation:
            "Com IaC a infraestrutura é definida, versionada e automatizada em código, o que torna repetível e consistente o provisionamento dos ambientes de ML entre desenvolvimento, teste e produção. O ajuste de hiperparâmetros continua necessário, e o tipo e o custo das instâncias dependem do que o código de IaC define, não da IaC em si.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Agiliza a implantação de cargas de ML escaláveis e consistentes em ambientes na nuvem",
                true,
            ],
            [
                "Elimina a necessidade de ajuste de hiperparâmetros durante o treinamento dos modelos",
                false,
            ],
            [
                "Provisiona instâncias mais potentes, o que leva ao treino de modelos mais precisos",
                false,
            ],
            [
                "Reduz os gastos totais ao escolher automaticamente instâncias de baixo custo para o treino",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora quer marcar cada pedido de indenização como fraudulento ou legítimo com base nos dados do sinistro. Que tipo de modelo de ML atende a esse requisito?",
        explanation:
            "Marcar cada pedido como fraudulento ou legítimo é escolher entre exatamente duas categorias, o que define a classificação binária. A classificação multiclasse serve para três ou mais categorias, a regressão prevê valores numéricos contínuos e os modelos de difusão geram conteúdo, como imagens, sem classificar registros.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Classificação binária, que atribui cada entrada a uma entre duas categorias", true],
            [
                "Classificação multiclasse, que atribui cada entrada a uma entre três ou mais categorias",
                false,
            ],
            ["Regressão, que prevê um valor numérico contínuo para cada entrada analisada", false],
            ["Modelo de difusão, que gera conteúdo novo, como imagens, a partir de ruído", false],
        ],
    },
    {
        statement:
            "Um serviço de streaming por assinatura está criando um modelo de ML para prever quais clientes tendem a cancelar o plano. Qual métrica é adequada para avaliar esse modelo de classificação binária?",
        explanation:
            "A pontuação F1 junta precisão e recall em um único valor, o que serve a uma classificação binária como a de cancelamento, em que importa acertar quem vai sair sem gerar alarmes demais. R² e erro quadrático médio são métricas de regressão para valores contínuos, e o tempo de treinamento é um dado operacional, não de qualidade.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Pontuação F1, que combina a precisão e o recall das previsões de cancelamento", true],
            [
                "Coeficiente de determinação (R²), a parcela da variância explicada pelo modelo",
                false,
            ],
            [
                "Erro quadrático médio (MSE), a média dos erros ao quadrado em valores numéricos",
                false,
            ],
            [
                "Tempo de treinamento do modelo, medido do início ao fim de cada job de treino",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao avaliar um modelo que classifica fotos de peças como defeituosas ou não, uma equipe precisa de uma métrica que mostre a razão entre os itens classificados corretamente e o total de itens classificados, certos ou errados. Qual métrica atende a esse requisito?",
        explanation:
            "A acurácia divide as previsões corretas (verdadeiros positivos e verdadeiros negativos) pelo total de previsões, exatamente a razão pedida. A precisão olha só as previsões positivas, o recall olha só os casos realmente positivos, e a F1 combina essas duas métricas em vez de medir o acerto geral.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Acurácia, a proporção de previsões corretas sobre o total de previsões", true],
            ["Precisão, a proporção de acertos entre as peças apontadas como defeituosas", false],
            ["Recall, a proporção das peças realmente defeituosas que o modelo identificou", false],
            ["Pontuação F1, a média harmônica entre a precisão e o recall do modelo", false],
        ],
    },
    {
        statement:
            "Um estúdio de animação quer gerar automaticamente legendas para os diálogos dos seus filmes. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Transcribe usa reconhecimento automático de fala para transformar o áudio em texto com marcação de tempo e gera legendas nos formatos WebVTT e SRT. O Translate só traduz texto que já existe, o Polly faz o caminho inverso, de texto para fala, e o Comprehend analisa textos prontos, sem transcrever áudio.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Transcribe, que converte a fala em texto com marcação de tempo", true],
            ["Amazon Translate, que traduz textos de um idioma para outro com qualidade", false],
            ["Amazon Polly, que sintetiza fala natural a partir de textos escritos", false],
            ["Amazon Comprehend, que extrai sentimentos e entidades de textos existentes", false],
        ],
    },
    {
        statement:
            "Uma empresa quer ler automaticamente as mensagens que os clientes escrevem no chat de suporte e encaminhar cada uma para um tema, como cobrança, problemas técnicos ou alterações de conta. Qual conceito de IA esse cenário representa?",
        explanation:
            "Ler mensagens escritas e encaminhar cada uma para um tema é uma tarefa de processamento de linguagem natural, mais especificamente classificação de texto, pois exige interpretar a linguagem humana. O reconhecimento de fala trata áudio, a visão computacional trata imagens e vídeos, e a previsão estima valores futuros a partir de histórico.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Processamento de linguagem natural, que interpreta e categoriza textos", true],
            ["Reconhecimento de fala, que transforma o áudio de conversas faladas em texto", false],
            ["Visão computacional, que interpreta o conteúdo visual de imagens e vídeos", false],
            ["Previsão, que estima valores numéricos futuros a partir de dados históricos", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando uma aplicação que deve organizar automaticamente clientes e produtos em grupos de itens semelhantes, com base nos atributos de cada um, sem categorias definidas previamente. Qual estratégia de ML a empresa deve usar?",
        explanation:
            "O aprendizado não supervisionado encontra padrões e grupos naturais em dados sem rótulos, então serve para agrupar clientes e produtos parecidos quando não há categorias prévias. O supervisionado exige rótulos conhecidos, o semissupervisionado precisa de ao menos alguns dados rotulados e o por reforço aprende com recompensas em um ambiente.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aprendizado não supervisionado, que descobre agrupamentos naturais nos dados sem rótulos",
                true,
            ],
            [
                "Aprendizado supervisionado, que aprende a partir de exemplos com rótulos conhecidos",
                false,
            ],
            [
                "Aprendizado por reforço, que ajusta as ações de um agente com base em recompensas",
                false,
            ],
            [
                "Aprendizado semissupervisionado, que combina poucos dados rotulados com muitos sem rótulo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma plataforma de ensino online publica seus materiais de curso em inglês e quer oferecer o mesmo conteúdo a alunos que falam vários outros idiomas. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon Translate faz tradução automática de texto com alta qualidade, sob demanda ou em lote, então converte os materiais do inglês para vários idiomas. O Transcribe transforma fala em texto sem traduzir, o Personalize gera recomendações a partir do comportamento dos usuários e o Textract extrai texto e dados de documentos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Usar a tradução em tempo real do Amazon Translate nos materiais dos cursos", true],
            ["Adicionar o Amazon Transcribe para converter as aulas faladas em texto", false],
            ["Adicionar o Amazon Personalize para recomendar cursos a cada aluno", false],
            [
                "Usar o processamento de documentos em tempo real do Amazon Textract nos materiais",
                false,
            ],
        ],
    },
    {
        statement:
            "Um documentarista quer alcançar um público maior adicionando automaticamente legendas e dublagens em vários idiomas aos seus filmes. Quais DUAS etapas, juntas, atendem a esse requisito? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Transcribe converte os diálogos em texto e o Amazon Translate traduz esse texto, gerando legendas em vários idiomas; o Amazon Polly transforma o texto traduzido em fala, criando as dublagens. Translate e Transcribe entregam texto, não áudio, e o Textract extrai texto de documentos e imagens, não da fala dos vídeos.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Usar o Amazon Polly para gerar as dublagens em vários idiomas a partir de texto",
                true,
            ],
            [
                "Usar o Amazon Transcribe e o Amazon Translate para gerar legendas em vários idiomas",
                true,
            ],
            [
                "Usar o Amazon Translate para gerar as dublagens em vários idiomas a partir de texto",
                false,
            ],
            [
                "Usar o Amazon Textract e o Amazon Translate para gerar legendas em vários idiomas",
                false,
            ],
            [
                "Usar o Amazon Transcribe para gerar as dublagens em vários idiomas a partir do áudio",
                false,
            ],
        ],
    },
    {
        statement:
            "Um hospital treinou um modelo com o histórico de pacientes (histórico médico, dados demográficos e tratamentos) para prever, em tempo real, se um paciente será readmitido em até 30 dias após a alta. Qual tarefa desse cenário representa a inferência do modelo?",
        explanation:
            "Inferência é usar um modelo já treinado para gerar previsões sobre dados novos, como prever a readmissão de um paciente que acabou de receber alta. Coletar registros é a etapa de coleta de dados, medir métricas é avaliação e buscar padrões é análise exploratória, todas anteriores às previsões.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aplicar o modelo treinado para prever se um paciente recém-liberado será readmitido",
                true,
            ],
            [
                "Coletar os registros históricos de readmissão de pacientes dos últimos anos para o treino",
                false,
            ],
            ["Medir o desempenho do modelo com métricas de avaliação adequadas ao problema", false],
            [
                "Analisar os dados para descobrir padrões e correlações entre as características dos pacientes",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma rede varejista quer criar e implantar modelos de ML a partir das próprias planilhas de vendas e de cadastro de clientes, sem que seus analistas precisem escrever código. Qual serviço ou recurso da AWS atende a esse requisito?",
        explanation:
            "O SageMaker Canvas oferece uma interface visual no-code para preparar dados tabulares, treinar, avaliar e implantar modelos próprios. Rekognition e Comprehend são serviços de IA voltados a imagens e a textos, e o Textract extrai dados de documentos, sem criar modelos de previsão sobre tabelas.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Amazon SageMaker Canvas, que cria, treina e implanta modelos em uma interface visual",
                true,
            ],
            [
                "Amazon Rekognition, que analisa imagens e vídeos com modelos já treinados pela AWS",
                false,
            ],
            [
                "Amazon Comprehend, que extrai sentimento e entidades de textos com modelos prontos",
                false,
            ],
            [
                "Amazon Textract, que extrai texto e dados de formulários de documentos digitalizados",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa reunir um grande conjunto de dados para treinar um assistente de IA especializado em uma área de conteúdo específica. Qual conjunto de dados atende a esse objetivo?",
        explanation:
            "Um assistente conversacional aprende a entender e responder bem numa área quando treina com diálogos variados que usam o vocabulário dela. Séries de vendas servem a previsões, rótulos de sentimento de notícias não ensinam a conversar e pares de IDs de produto e usuário alimentam recomendações.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Conversas variadas que usam a terminologia própria da área de atuação do assistente",
                true,
            ],
            [
                "Séries temporais do histórico de vendas gerais da empresa nos últimos cinco anos",
                false,
            ],
            [
                "Resultados de análise de sentimento de notícias publicadas sobre o setor da empresa",
                false,
            ],
            [
                "Identificadores únicos de produtos associados aos identificadores de cada usuário",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma loja on-line quer dividir seus clientes em grupos com base em dados demográficos e no comportamento de compra. Qual algoritmo ela deve usar para atender a esse requisito?",
        explanation:
            "K-means é um algoritmo não supervisionado de agrupamento que separa os registros em k grupos por similaridade, o que serve para segmentar clientes sem rótulos. k-NN, árvore de decisão e SVM são algoritmos supervisionados, que precisam de exemplos rotulados para classificar ou prever um alvo conhecido.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Árvore de decisão", false],
            ["Máquina de vetores de suporte (SVM)", false],
            ["K-vizinhos mais próximos (k-NN)", false],
            ["K-means (k-médias)", true],
        ],
    },
    {
        statement:
            "Uma equipe de dados está catalogando os projetos de ML da empresa pelo tipo de aprendizado usado. Qual destes cenários é um exemplo de aprendizado não supervisionado?",
        explanation:
            "Organizar notícias em temas sem categorias predefinidas é agrupamento, típico do aprendizado não supervisionado, que encontra padrões em dados sem rótulos. Classificar o risco de um empréstimo e prever a demanda de energia são supervisionados (classificação e regressão), e o robô recompensado é aprendizado por reforço.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Um modelo que organiza milhares de notícias em temas relacionados sem categorias predefinidas",
                true,
            ],
            [
                "Um modelo que marca cada pedido de empréstimo como de alto ou de baixo risco de inadimplência",
                false,
            ],
            [
                "Um modelo que prevê a demanda de energia elétrica de uma cidade para o dia seguinte",
                false,
            ],
            [
                "Um modelo que ensina um robô a andar recompensando os movimentos que dão certo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de suporte usa análise de sentimento para identificar o humor expresso nos comentários dos clientes. A análise de sentimento faz parte de qual área mais ampla da IA?",
        explanation:
            "Análise de sentimento é uma tarefa de processamento de linguagem natural (PLN), a área da IA que permite às máquinas entender e extrair significado da linguagem humana. Visão computacional interpreta imagens, reconhecimento de fala converte áudio em texto e séries temporais preveem valores numéricos ao longo do tempo.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Processamento de linguagem natural (PLN)", true],
            ["Visão computacional (computer vision)", false],
            ["Previsão de séries temporais (forecasting)", false],
            ["Reconhecimento automático de fala (ASR)", false],
        ],
    },
    {
        statement:
            "Uma empresa de SaaS coleta um grande volume de comentários de clientes em texto livre e quer analisar o sentimento expresso neles. Qual solução atende a esse requisito?",
        explanation:
            "Um LLM aplica processamento de linguagem natural para ler texto não estruturado e dizer se o sentimento é positivo, negativo ou neutro, o que se encaixa em grandes volumes de comentários livres. Regressão prevê valores numéricos, recomendação sugere itens e séries temporais projetam valores no tempo.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Usar um large language model (LLM) para fazer a análise de sentimento dos textos",
                true,
            ],
            [
                "Usar um algoritmo de regressão para separar os comentários em categorias predefinidas",
                false,
            ],
            ["Usar um mecanismo de recomendação para detectar o sentimento de cada usuário", false],
            [
                "Usar um algoritmo de séries temporais para prever o sentimento a partir do histórico",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco revisa os registros de transações financeiras e atribui a cada um a categoria 'pessoal' ou 'empresarial', gravando essa categoria no próprio registro. Qual etapa de preparação de dados isso descreve?",
        explanation:
            "Rotulagem é anexar a cada registro a categoria correta, que depois serve de alvo no aprendizado supervisionado, exatamente o que o banco faz. Codificação converte categorias já existentes em números, normalização coloca atributos numéricos na mesma escala e balanceamento ajusta a proporção entre as classes.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Normalização de dados (normalization)", false],
            ["Codificação de dados (encoding)", false],
            ["Balanceamento de classes (balancing)", false],
            ["Rotulagem de dados (data labeling)", true],
        ],
    },
    {
        statement:
            "Uma distribuidora de energia quer monitorar os níveis de tensão da rede elétrica em regiões rurais. Ela vai registrar leituras de tensão continuamente no Amazon RDS e analisar como elas variam ao longo de cada dia para criar um modelo que preveja possíveis quedas de energia. Que tipo de dado a distribuidora deve coletar?",
        explanation:
            "Séries temporais são valores registrados em sequência ao longo do tempo, como leituras de tensão em intervalos regulares, e permitem modelar a variação diária para prever quedas. Atributos fixos das subestações não mostram essa evolução, e textos de manutenção ou áudio dos transformadores não medem a tensão.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Dados tabulares estáticos, com atributos fixos de cada subestação", false],
            ["Dados de texto, com relatórios escritos pelas equipes de manutenção", false],
            ["Dados de séries temporais, com leituras ordenadas por data e hora", true],
            ["Dados de áudio, com gravações do ruído emitido pelos transformadores", false],
        ],
    },
    {
        statement:
            "Uma fabricante quer treinar um modelo de ML que sinalize leituras incomuns nos dados dos sensores de seus equipamentos, mas não tem nenhum exemplo rotulado para o treinamento. Qual método de ML atende a esse requisito?",
        explanation:
            "Autoencoders são um método não supervisionado que aprende a reconstruir o padrão normal dos dados; leituras com erro de reconstrução alto aparecem como anomalias, sem precisar de rótulos. Árvore de decisão, regressão linear e regressão logística são supervisionadas e exigem exemplos rotulados para o treino.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Árvore de decisão (decision tree)", false],
            ["Autoencoders (autocodificadores)", true],
            ["Regressão linear (linear regression)", false],
            ["Regressão logística (logistic regression)", false],
        ],
    },
    {
        statement:
            "Um aplicativo de streaming de música quer sugerir músicas a cada ouvinte com base no histórico do que ele já escutou. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Personalize é um serviço gerenciado que gera recomendações personalizadas em tempo real com base no histórico e nas interações de cada usuário. Rekognition analisa imagens e vídeos, Transcribe converte fala em texto e Comprehend extrai insights de textos, e nenhum deles gera recomendações.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Personalize", true],
            ["Amazon Rekognition", false],
            ["Amazon Transcribe", false],
            ["Amazon Comprehend", false],
        ],
    },
    {
        statement:
            "Uma equipe está adotando MLOps para gerenciar seus fluxos de machine learning com mais confiabilidade. Quais práticas a equipe deve priorizar? (Selecione DUAS opções.)",
        explanation:
            "Versionar modelos permite rastrear mudanças, reproduzir resultados e voltar a uma versão anterior, e testes e validação automatizados garantem a qualidade antes da implantação. Implantação manual contraria a automação do MLOps, documentação mínima prejudica a auditoria e, sem monitoramento, o drift passa despercebido.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Versionar os modelos para garantir a reprodutibilidade dos resultados", true],
            ["Automatizar os testes e a validação dos modelos antes da implantação", true],
            [
                "Implantar os modelos manualmente, conferindo cada etapa em produção a cada nova versão",
                false,
            ],
            ["Manter a documentação mínima para acelerar as entregas da equipe", false],
            ["Dispensar o monitoramento em produção depois que o modelo é validado", false],
        ],
    },
    {
        statement:
            "Uma agência de saúde pública reuniu um ano de registros de pacientes e quer gerar um relatório mensal de tendências para os gestores. Todo mês, ela precisa rodar um modelo sobre um grande conjunto de registros históricos em um horário agendado, sem necessidade de resultado imediato. Qual método de inferência atende a isso com o menor custo?",
        explanation:
            "Batch transform roda a inferência sobre um grande conjunto de dados em um job agendado, sem endpoint ligado o tempo todo, o que barateia o relatório mensal. Tempo real mantém um endpoint permanente para respostas imediatas, serverless atende tráfego intermitente com resposta por requisição e a assíncrona enfileira requisições individuais grandes.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Inferência em tempo real (real-time)", false],
            ["Inferência assíncrona (asynchronous)", false],
            ["Batch transform (inferência em lote)", true],
            ["Inferência serverless (sem servidor)", false],
        ],
    },
    {
        statement:
            "Um banco está criando um modelo de ML para prever a probabilidade de um solicitante de empréstimo ficar inadimplente, usando renda, score de crédito, tempo de emprego e dívidas atuais. O histórico traz, para cada solicitante anterior, um rótulo indicando se ele ficou inadimplente. Qual técnica de ML atende a esses requisitos?",
        explanation:
            "Com atributos de entrada e um rótulo conhecido para cada registro histórico, o modelo aprende a prever esse alvo: é aprendizado supervisionado. O não supervisionado busca padrões sem rótulos, o por reforço aprende com recompensas ao interagir com um ambiente e o semissupervisionado serve quando só parte dos dados tem rótulo.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aprendizado não supervisionado", false],
            ["Aprendizado supervisionado", true],
            ["Aprendizado por reforço", false],
            ["Aprendizado semissupervisionado", false],
        ],
    },
    {
        statement:
            "Um serviço de compartilhamento de fotos precisa espelhar e girar grandes lotes de imagens usando transformações numéricas simples e determinísticas. Qual solução é a MAIS eficiente operacionalmente?",
        explanation:
            "Girar e espelhar imagens são operações determinísticas que uma função AWS Lambda executa em escala, sem treinar nem hospedar modelo, então ML não é necessário. Uma rede neural profunda seria esforço desnecessário, um LLM do Bedrock gera conteúdo em vez de aplicar essas transformações exatas e o Glue Data Quality valida a qualidade de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Construir uma rede neural profunda que receba as imagens como entrada", false],
            ["Usar um LLM do Amazon Bedrock com temperatura alta para processar as imagens", false],
            ["Criar uma função AWS Lambda que aplique as transformações às imagens", true],
            ["Usar o AWS Glue Data Quality para corrigir cada uma das imagens do lote", false],
        ],
    },
    {
        statement:
            "Em um treinamento interno, um instrutor apresenta os principais tipos de machine learning. Qual das opções NÃO é um tipo de machine learning?",
        explanation:
            "Aprendizado diagnóstico não é um tipo reconhecido de machine learning. Os três tipos principais são o supervisionado, que treina com dados rotulados, o não supervisionado, que descobre padrões em dados sem rótulos, e o aprendizado por reforço, em que um agente aprende com recompensas e penalidades.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aprendizado supervisionado", false],
            ["Aprendizado não supervisionado", false],
            ["Aprendizado por reforço", false],
            ["Aprendizado diagnóstico", true],
        ],
    },
    {
        statement:
            "Uma equipe está desenvolvendo um modelo de visão computacional para inspecionar peças em uma linha de produção. Que tipo de dado é o mais adequado para treinar esse modelo?",
        explanation:
            "Modelos de visão computacional aprendem com os padrões visuais e de pixels de imagens e quadros de vídeo, por isso dados de imagem são os adequados. Dados tabulares servem a problemas clássicos como regressão, séries temporais registram valores ao longo do tempo e texto é a entrada de tarefas de PLN.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Dados de texto", false],
            ["Dados de imagem", true],
            ["Dados tabulares", false],
            ["Dados de séries temporais", false],
        ],
    },
    {
        statement:
            "Uma empresa quer analisar automaticamente os comentários escritos por seus clientes, sem precisar treinar um modelo próprio. Qual serviço da AWS é o mais indicado para essa tarefa de processamento de linguagem natural (PLN)?",
        explanation:
            "O Amazon Comprehend é um serviço gerenciado de PLN que extrai sentimento, frases-chave, entidades e idioma de textos sem exigir treinamento, ideal para comentários de clientes. O SageMaker AI permitiria criar um modelo próprio com muito mais esforço, o Polly converte texto em fala e o Transcribe converte fala em texto.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon SageMaker AI", false],
            ["Amazon Comprehend", true],
            ["Amazon Polly", false],
            ["Amazon Transcribe", false],
        ],
    },
    {
        statement:
            "Durante o ciclo de vida de ML, um cientista de dados faz uma análise exploratória de dados (EDA) antes de construir o modelo. Qual é o objetivo dessa etapa?",
        explanation:
            "A análise exploratória acontece cedo no ciclo de vida para entender a estrutura, a distribuição, a qualidade e as relações dos dados, orientando a limpeza, a engenharia de atributos e a escolha do algoritmo. Treinar, implantar e monitorar são etapas posteriores, que dependem desse entendimento dos dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Treinar o modelo ajustando seus parâmetros com os dados já preparados", false],
            ["Entender a estrutura, a qualidade e as relações presentes nos dados", true],
            ["Implantar o modelo em um endpoint para atender às requisições de previsão", false],
            ["Monitorar o desempenho do modelo em produção e detectar drift nos dados", false],
        ],
    },
    {
        statement:
            "Uma equipe desenha o pipeline de ML de um modelo que prevê o cancelamento de clientes. Qual destas atividades normalmente NÃO é uma etapa desse pipeline?",
        explanation:
            "Campanha publicitária da marca é uma atividade de marketing, não uma etapa técnica do pipeline de ML. Coleta e preparação reúnem os dados brutos, engenharia de atributos transforma esses dados em variáveis úteis para o modelo, e treinamento e avaliação ajustam o modelo e medem seu desempenho.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Treinamento e avaliação do modelo", false],
            ["Campanha publicitária da marca", true],
            ["Coleta e preparação dos dados", false],
            ["Engenharia de atributos (features)", false],
        ],
    },
    {
        statement:
            "Ao revisar o relatório de avaliação de um classificador, um analista encontra a métrica AUC-ROC. O que significa a sigla AUC nessa métrica?",
        explanation:
            "AUC significa Area Under the Curve, a área sob a curva ROC. Ela mede o quanto o classificador separa as classes e vai de 0 a 1: 1 indica separação perfeita e 0,5 equivale a um palpite aleatório. As outras expansões são inventadas e não correspondem a nenhuma métrica reconhecida.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Area Under the Curve (área sob a curva ROC)", true],
            ["Adjusted Unit Cost (custo unitário ajustado)", false],
            ["Average Usage Count (contagem média de uso)", false],
            ["Accuracy Under Constraints (acurácia com restrições)", false],
        ],
    },
    {
        statement:
            "Uma startup avalia usar um modelo pré-treinado em vez de treinar um modelo do zero. Qual é uma vantagem importante dessa escolha?",
        explanation:
            "Um modelo pré-treinado já aprendeu com um grande volume de dados, então pode ser usado para inferência sem que a empresa forneça dados de treino, poupando tempo e esforço. Ele não supera necessariamente modelos feitos para a tarefa, costuma precisar de ajuste fino em domínios específicos e ainda deve ser avaliado.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Ele supera em acurácia os modelos customizados nas tarefas específicas do domínio da empresa",
                false,
            ],
            [
                "Ele pode ser usado para inferência logo de início, sem dados próprios de treinamento",
                true,
            ],
            ["Ele dispensa o ajuste fino mesmo em tarefas muito especializadas do negócio", false],
            ["Ele elimina a necessidade de avaliar o modelo antes de colocá-lo em produção", false],
        ],
    },
    {
        statement:
            "Um cientista de dados quer que a AWS teste automaticamente algoritmos e combinações de hiperparâmetros sobre um conjunto de dados tabular, em vez de ajustá-los manualmente, e indique o melhor modelo candidato. Qual recurso da AWS é o mais indicado?",
        explanation:
            "O SageMaker Autopilot automatiza o AutoML: analisa os dados, testa algoritmos e hiperparâmetros e ranqueia os candidatos, e hoje sua interface fica dentro do SageMaker Canvas. Data Wrangler prepara e transforma dados, Feature Store armazena e serve atributos e Model Cards documentam os modelos, sem essa busca automática.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon SageMaker Autopilot", true],
            ["Amazon SageMaker Data Wrangler", false],
            ["Amazon SageMaker Model Cards", false],
            ["Amazon SageMaker Feature Store", false],
        ],
    },
    {
        statement:
            "Em uma reunião de planejamento, a equipe de dados propõe adotar MLOps para os projetos de machine learning. Do que o termo MLOps é uma abreviação?",
        explanation:
            "MLOps significa Machine Learning Operations, o conjunto de práticas que une machine learning e princípios de DevOps para automatizar e gerenciar a implantação, o monitoramento e a manutenção de modelos em produção. As outras expansões combinam termos plausíveis, mas não são o significado da sigla.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Machine Learning Optimization", false],
            ["Managed Learning Outputs", false],
            ["Machine Learning Operations", true],
            ["Model Lifecycle Operations", false],
        ],
    },
    {
        statement:
            "Uma equipe prepara um relatório para a diretoria sobre o impacto de um modelo de ML no negócio. Qual destes indicadores NÃO é uma métrica de negócio?",
        explanation:
            "A pontuação F1 é uma métrica técnica de desempenho, a média harmônica entre precisão e recall, e mede a qualidade das previsões, não o valor gerado. ROI, satisfação do cliente e tempo de lançamento no mercado são métricas de negócio, que capturam o impacto real e os resultados da solução.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Retorno sobre o investimento (ROI)", false],
            ["Pontuação F1 do modelo", true],
            ["Satisfação do cliente", false],
            ["Tempo de lançamento no mercado", false],
        ],
    },
    {
        statement:
            "Uma empresa quer avaliar uma solução de IA pelo valor que ela entrega ao negócio. Quais indicadores são métricas de negócio? (Selecione DUAS opções.)",
        explanation:
            "Satisfação do cliente mostra se a solução atende quem a usa, e time-to-value mede em quanto tempo ela começa a gerar resultado para o negócio. Precisão, mAP e RMSE são métricas técnicas de desempenho do modelo, que medem acerto de classificação, qualidade de ranking e erro de regressão.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Precisão (precision) do modelo", false],
            ["Índice de satisfação do cliente (CSAT)", true],
            ["Mean Average Precision (mAP)", false],
            ["Tempo até gerar valor (time-to-value)", true],
            ["Raiz do erro quadrático médio (RMSE) das previsões", false],
        ],
    },
    {
        statement:
            "Uma empresa colocou uma solução de IA em produção e a diretoria quer saber se o investimento trouxe resultado para o negócio. Que medidas devem entrar nessa avaliação? (Selecione DUAS opções.)",
        explanation:
            "Para saber se a solução gerou resultado, a empresa mede o valor para o negócio: ganhos de eficiência operacional e retorno sobre o investimento. Número de parâmetros, taxa de aprendizado e épocas de treinamento são detalhes técnicos de configuração do modelo e não mostram se ele cumpriu os objetivos do negócio.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Ganhos de eficiência nas operações do negócio", true],
            ["Número de parâmetros do modelo implantado", false],
            ["Retorno sobre o investimento (ROI) da solução", true],
            ["Taxa de aprendizado usada no treinamento", false],
            ["Quantidade de épocas de treinamento executadas", false],
        ],
    },
    {
        statement:
            "Uma empresa de logística quer treinar um agente que aprenda a tomar decisões de roteamento interagindo com um ambiente simulado de armazém. Qual tipo de machine learning é o mais adequado para isso?",
        explanation:
            "No aprendizado por reforço, um agente aprende uma estratégia interagindo com o ambiente e recebendo recompensas ou penalidades pelas ações. O supervisionado treina com exemplos rotulados, o não supervisionado encontra padrões sem rótulos e o aprendizado por transferência reaproveita o conhecimento de um modelo em outra tarefa.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aprendizado supervisionado", false],
            ["Aprendizado não supervisionado", false],
            ["Aprendizado por reforço", true],
            ["Aprendizado por transferência", false],
        ],
    },
    {
        statement:
            "Um portal de notícias quer gerar narrações em áudio a partir dos artigos escritos que publica. Qual serviço da AWS é o mais adequado para isso?",
        explanation:
            "O Amazon Polly converte texto em fala natural, o que atende à geração de narração a partir dos artigos. O Transcribe faz o caminho inverso, convertendo áudio em texto, o Translate traduz textos entre idiomas e o Lex cria interfaces conversacionais de voz e texto, sem gerar a narração de um artigo.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Transcribe", false],
            ["Amazon Polly", true],
            ["Amazon Translate", false],
            ["Amazon Lex", false],
        ],
    },
    {
        statement:
            "Uma equipe reservou uma etapa do projeto para engenharia de atributos (feature engineering). Qual é o principal objetivo dessa etapa no ciclo de vida de ML?",
        explanation:
            "Engenharia de atributos transforma dados brutos em entradas úteis, criando novas variáveis ou transformando as existentes para melhorar o desempenho do modelo. Reunir mais dados é a coleta, medir métricas é a avaliação e publicar em produção é a implantação, etapas distintas do ciclo de vida.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Criar ou transformar variáveis de entrada para melhorar o desempenho do modelo",
                true,
            ],
            [
                "Reunir mais dados brutos de novas fontes para ampliar a base de treinamento do projeto",
                false,
            ],
            ["Medir o desempenho do modelo treinado com métricas de avaliação adequadas", false],
            ["Publicar o modelo em um ambiente de produção para uso pelas aplicações", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa escolher entre inferência em lote e inferência em tempo real para dois sistemas diferentes. Qual é a principal diferença entre esses dois tipos de inferência?",
        explanation:
            "A inferência em lote reúne muitas entradas e as processa juntas em um job, priorizando a vazão em cargas sem urgência, enquanto a em tempo real responde a cada entrada assim que ela chega. A precisão depende do modelo e não do modo de inferência, o tempo real não se limita a poucos dados e o lote costuma ter maior vazão em grandes volumes.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "O lote processa várias entradas juntas, e o tempo real responde a cada entrada ao chegar",
                true,
            ],
            [
                "O lote gera previsões mais precisas, porque o modelo analisa todas as entradas em conjunto",
                false,
            ],
            [
                "O tempo real só funciona com poucos dados, porque cada requisição precisa caber na memória",
                false,
            ],
            [
                "O tempo real conclui grandes volumes mais rápido, porque dispensa agendar jobs de lote",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer usar um único serviço da AWS para construir, treinar e implantar modelos de machine learning de ponta a ponta. Qual serviço é o mais adequado?",
        explanation:
            "O Amazon SageMaker AI é uma plataforma gerenciada que cobre o ciclo de vida de ML: preparação de dados, treinamento, ajuste e implantação de modelos. Comprehend Medical extrai informações de textos clínicos, Polly converte texto em fala e Translate traduz idiomas, cada um resolvendo uma tarefa específica.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Comprehend Medical", false],
            ["Amazon SageMaker AI", true],
            ["Amazon Polly", false],
            ["Amazon Translate", false],
        ],
    },
    {
        statement:
            "Uma consultoria lista possíveis aplicações de IA e ML para um cliente. Qual destas atividades NÃO é um caso de uso típico de IA ou ML?",
        explanation:
            "Registrar fichas manualmente em papel é uma tarefa administrativa rotineira e determinística, que não envolve aprender com dados nem fazer previsões. Detecção de fraudes, reconhecimento de fala e sistemas de recomendação são aplicações consolidadas de IA e ML, que identificam padrões e fazem previsões a partir de dados.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Detecção de fraudes em transações", false],
            ["Registro manual de fichas em papel", true],
            ["Reconhecimento de fala em chamadas", false],
            ["Sistemas de recomendação de produtos", false],
        ],
    },
    {
        statement:
            "Uma seguradora recebe milhares de formulários digitalizados e quer extrair o texto e as tabelas desses documentos e, em seguida, identificar entidades e frases-chave no conteúdo. Quais serviços da AWS atendem a essas necessidades? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Textract extrai texto, formulários e tabelas de documentos digitalizados, e o Amazon Comprehend aplica PLN ao texto extraído para identificar entidades, frases-chave e sentimento. Polly converte texto em fala, Translate traduz entre idiomas e Transcribe converte áudio em texto, sem analisar documentos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Textract", true],
            ["Amazon Comprehend", true],
            ["Amazon Polly", false],
            ["Amazon Translate", false],
            ["Amazon Transcribe", false],
        ],
    },
    {
        statement:
            "A equipe de suporte de uma operadora de telecomunicações quer estudar o que os clientes falam nas ligações gravadas e extrair os pontos importantes. As gravações existem apenas como arquivos de áudio. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon Transcribe converte a fala das gravações em texto, que a equipe pode então analisar para extrair os pontos principais. O Comprehend analisa texto, mas não aceita áudio como entrada, o Lex cria chatbots em vez de transcrever gravações e o Polly sintetiza fala a partir de texto, o caminho inverso.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Converter as gravações em texto com o Amazon Transcribe para então analisar o conteúdo",
                true,
            ],
            [
                "Aplicar o Amazon Comprehend diretamente aos arquivos de áudio para classificar os assuntos",
                false,
            ],
            [
                "Criar um chatbot conversacional com o Amazon Lex para atender às próximas ligações",
                false,
            ],
            [
                "Usar o Amazon Polly para gerar áudio sintetizado com os pontos principais das ligações",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma fintech vai iniciar um projeto de ML que usará dados financeiros de clientes. Em qual etapa do ciclo de vida de ML a equipe deve identificar as obrigações regulatórias e de conformidade que o projeto precisa cumprir?",
        explanation:
            "As obrigações regulatórias são identificadas na definição do objetivo de negócio, pois o que se pretende construir determina quais leis se aplicam antes de qualquer dado ser coletado. Na coleta essas obrigações são aplicadas na prática, e treinamento e engenharia de atributos são etapas técnicas posteriores.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Treinamento e ajuste do modelo", false],
            ["Coleta e preparação dos dados", false],
            ["Definição do objetivo de negócio", true],
            ["Engenharia de atributos (features)", false],
        ],
    },
    {
        statement:
            "Uma equipe de ciência de dados já treinou dezenas de modelos e não sabe mais qual versão de cada um está em produção. Ela precisa de um lugar central para registrar os próprios modelos, controlar as versões e saber qual delas foi implantada. Qual solução atende a essa necessidade?",
        explanation:
            "O SageMaker Model Registry é o catálogo dos modelos da própria equipe: agrupa as versões, guarda os metadados e registra o status de aprovação e de implantação. Feature Store centraliza atributos, não modelos; Pipelines orquestra as etapas do fluxo; CloudWatch acompanha métricas e alarmes operacionais.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Registrar os modelos e as versões no SageMaker Model Registry", true],
            ["Armazenar os modelos e as versões no SageMaker Feature Store", false],
            ["Orquestrar os modelos e as versões com o SageMaker Pipelines", false],
            ["Acompanhar os modelos e as versões com alarmes do Amazon CloudWatch", false],
        ],
    },
    {
        statement:
            "Uma equipe monitora um modelo preditivo em produção e percebe que o desvio nos dados de entrada (data drift) ultrapassou o limite que ela mesma definiu. A equipe quer limitar o impacto negativo desse desvio nas previsões. Qual ação atende a esse objetivo?",
        explanation:
            "Drift acima do limite indica que os dados de produção já não se parecem com os do treino, então retreinar com dados recentes recupera a qualidade das previsões. Mudar a sensibilidade só altera quando o alerta dispara, reiniciar o endpoint mantém o mesmo modelo e rastrear experimentos registra execuções sem corrigir o desvio.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Retreinar o modelo com dados recentes que reflitam o novo padrão de entrada", true],
            [
                "Ajustar a sensibilidade do monitoramento para que o alerta dispare menos vezes",
                false,
            ],
            [
                "Reiniciar o endpoint de inferência para recarregar o modelo que está implantado",
                false,
            ],
            [
                "Ativar o rastreamento de experimentos para registrar os próximos treinamentos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa implantou um modelo de previsão de demanda que teve ótimo desempenho na validação. A liderança pergunta por que ainda seria preciso monitorar esse modelo depois que ele já está em produção. Qual é o principal motivo?",
        explanation:
            "Mesmo um modelo bem validado perde qualidade quando os dados ou a relação entre entradas e resultado mudam, e o monitoramento existe para detectar esse drift a tempo de agir. Coletar dados, fazer engenharia de atributos e treinar modelos são outras etapas do ciclo de vida, não a finalidade do monitoramento.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Detectar desvios nos dados e no modelo (drift), que degradam as previsões com o tempo",
                true,
            ],
            [
                "Coletar mais dados brutos de produção para ampliar o próximo conjunto de treinamento",
                false,
            ],
            [
                "Executar a engenharia de atributos, criando novas variáveis a partir das entradas recebidas",
                false,
            ],
            [
                "Treinar novos modelos do zero sempre que chegarem dados novos ao ambiente de produção",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma loja virtual quer exibir recomendações de produtos adaptadas ao histórico de navegação e de compras de cada cliente, sem desenvolver os próprios algoritmos de recomendação. Qual serviço da AWS atende a essa necessidade?",
        explanation:
            "O Amazon Personalize cria recomendações individuais a partir das interações de cada usuário, com modelos gerenciados que dispensam desenvolver algoritmos próprios. Comprehend analisa textos, Rekognition analisa imagens e vídeos e Lex constrói interfaces de conversa; nenhum deles personaliza recomendações.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Personalize", true],
            ["Amazon Comprehend", false],
            ["Amazon Rekognition", false],
            ["Amazon Lex", false],
        ],
    },
    {
        statement:
            "Uma empresa de comércio eletrônico vai começar a vender em outros países e precisa gerar automaticamente as descrições dos seus produtos em vários idiomas a partir do texto original. Qual serviço da AWS atende a essa necessidade?",
        explanation:
            "O Amazon Translate usa tradução automática neural para converter textos entre idiomas, o que permite publicar as descrições dos produtos em vários mercados. Polly converte texto em fala, Comprehend extrai informações de textos e Transcribe converte fala em texto; nenhum deles traduz.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Polly", false],
            ["Amazon Translate", true],
            ["Amazon Comprehend", false],
            ["Amazon Transcribe", false],
        ],
    },
    {
        statement:
            "Um hospital nos Estados Unidos quer uma aplicação que leia as anotações clínicas em texto livre dos prontuários, extraia os detalhes clínicos relevantes e produza resumos curtos para a equipe médica. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon Comprehend Medical extrai de textos clínicos entidades como condições, medicamentos e dosagens, com as relações entre elas, e um LLM no Amazon Bedrock transforma essa saída em resumos curtos. Personalize gera recomendações, Textract extrai texto de documentos sem interpretar o conteúdo clínico e a análise de sentimento não identifica entidades médicas.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Usar o Amazon Comprehend Medical para extrair entidades médicas e um LLM no Amazon Bedrock para resumir",
                true,
            ],
            [
                "Usar o Amazon Personalize para modelar o engajamento dos pacientes e repassar o resultado a um modelo genérico",
                false,
            ],
            [
                "Usar o Amazon Textract para digitalizar os documentos e aplicar uma extração simples de palavras-chave",
                false,
            ],
            [
                "Usar a análise de sentimento do Amazon Comprehend para classificar as anotações e preencher um modelo fixo",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco implantou um modelo que prevê se cada cliente vai encerrar a conta (churn). A equipe quer medir o quanto as previsões do modelo batem com o comportamento real dos clientes. Qual métrica é adequada para essa avaliação?",
        explanation:
            "Prever se o cliente sai ou fica é classificação binária, e a pontuação F1 combina precisão e recall para medir o acerto contra o comportamento real, mesmo com classes desbalanceadas. RMSE avalia regressão, ROI é métrica de negócio e perplexidade avalia modelos de linguagem.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Pontuação F1", true],
            ["Raiz do erro quadrático médio (RMSE)", false],
            ["Retorno sobre o investimento (ROI)", false],
            ["Perplexidade", false],
        ],
    },
    {
        statement:
            "Uma empresa desenvolve modelos de ML no Amazon SageMaker AI com várias equipes, e cada uma recria por conta própria as mesmas variáveis de entrada, como média de gastos e tempo de relacionamento do cliente. A empresa quer compartilhar e gerenciar essas variáveis entre as equipes. Qual recurso do SageMaker atende a esse requisito?",
        explanation:
            "O SageMaker Feature Store é o repositório central de atributos (features): as equipes guardam, descobrem e reutilizam as mesmas variáveis no treino e na inferência. Data Wrangler prepara e transforma dados, Model Registry versiona modelos e Model Cards documenta os modelos; nenhum deles compartilha atributos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["SageMaker Feature Store", true],
            ["SageMaker Data Wrangler", false],
            ["SageMaker Model Registry", false],
            ["SageMaker Model Cards", false],
        ],
    },
    {
        statement:
            "Uma rede social quer identificar linguagem ofensiva nos comentários, escritos em inglês, que os usuários publicam nas postagens. A empresa não pretende rotular dados nem treinar um modelo próprio. Qual abordagem ela deve adotar?",
        explanation:
            "A detecção de toxicidade do Amazon Comprehend é pré-treinada e classifica textos em categorias como insulto, discurso de ódio e ameaça, sem rotular dados nem treinar modelo. Rekognition modera imagens e vídeos, algoritmos do SageMaker exigem dados rotulados e o filtro do Transcribe atua sobre transcrições de áudio.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Usar a detecção de toxicidade do Amazon Comprehend", true],
            ["Usar a moderação de conteúdo do Amazon Rekognition", false],
            ["Treinar um classificador com algoritmos integrados do Amazon SageMaker AI", false],
            ["Aplicar o filtro de vocabulário do Amazon Transcribe", false],
        ],
    },
    {
        statement:
            "Um banco precisa apresentar aos órgãos reguladores uma explicação clara de todos os fatores que influenciaram cada decisão de crédito. A equipe está escolhendo entre um modelo de gradient boosting e um large language model (LLM). Qual fator pesa mais a favor do modelo de ML tradicional?",
        explanation:
            "Modelos tradicionais como gradient boosting permitem relacionar cada previsão aos atributos de entrada que mais pesaram, o que atende reguladores que exigem justificar cada decisão. Vários idiomas, geração de conteúdo e interface de conversa são pontos fortes de foundation models, não motivos para escolher ML tradicional.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["A exigência de explicabilidade de cada decisão", true],
            ["A necessidade de atender clientes em vários idiomas", false],
            ["A capacidade de gerar textos e conteúdos novos", false],
            ["A demanda por uma interface de conversa com o cliente", false],
        ],
    },
    {
        statement:
            "Uma startup de saúde vai implantar uma ferramenta de apoio ao diagnóstico que precisa rodar em dispositivos com pouca memória e sem conexão com a internet. Qual fator pesa mais a favor de um modelo de ML tradicional em vez de um foundation model?",
        explanation:
            "Modelos de ML tradicionais costumam ser bem menores e rodam em dispositivos de borda com pouca memória, sem depender da nuvem, o que atende ao uso offline. Geração de imagens, chat multilíngue e resumo de textos livres são capacidades que favorecem foundation models, não restrições que levem ao ML tradicional.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["As limitações de memória e de conexão dos dispositivos", true],
            ["A necessidade de gerar imagens novas em tempo real", false],
            ["A exigência de um chat com suporte a vários idiomas", false],
            ["A vontade de resumir textos livres de qualquer tamanho", false],
        ],
    },
    {
        statement:
            "Uma empresa de logística processa milhares de pedidos de rota de entrega por dia e hoje usa um sistema baseado em regras escritas à mão. Qual benefício uma solução de IA/ML oferece que esse sistema de regras não alcança com facilidade?",
        explanation:
            "Sistemas de IA/ML aprendem padrões com os dados e podem ser retreinados quando esses padrões mudam, atendendo grandes volumes sem codificar uma regra para cada caso. Saída determinística é justamente característica dos sistemas de regras, nenhum sistema dispensa validação e ML não elimina custos de computação.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Escalar e se adaptar quando os padrões nos dados mudam", true],
            ["Gerar a mesma saída determinística para cada entrada", false],
            ["Garantir respostas sempre corretas sem nenhuma validação", false],
            ["Eliminar todos os custos computacionais da operação", false],
        ],
    },
    {
        statement:
            "Uma varejista quer personalizar as recomendações de produtos para milhões de clientes e hoje depende de uma equipe que monta as sugestões manualmente. Por que IA/ML é mais adequada que a abordagem manual para essa tarefa?",
        explanation:
            "IA/ML processa o histórico de milhões de clientes e identifica preferências sutis em uma escala impraticável para uma equipe manual. Ela precisa de dados para aprender, não garante 100% de acerto e exige infraestrutura de computação para treino e inferência.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Analisa muitos dados e acha padrões que pessoas dificilmente veem", true],
            ["Dispensa qualquer dado histórico para começar a gerar as recomendações", false],
            ["Garante 100% de acerto em todas as recomendações feitas aos clientes", false],
            ["Elimina a necessidade de infraestrutura de computação para operar", false],
        ],
    },
    {
        statement:
            "Uma startup quer usar um foundation model na sua aplicação, mas não tem dados nem recursos computacionais para treinar um do zero. Qual abordagem permite obter um foundation model sem fazer o pré-treinamento?",
        explanation:
            "Hubs de modelos oferecem foundation models de código aberto já pré-treinados, que podem ser usados direto ou ajustados, sem o volume de dados e de computação do pré-treino. Sistema de regras, árvore de decisão e rede neural pequena treinada do zero não entregam um foundation model.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Usar um modelo pré-treinado de código aberto de um hub de modelos", true],
            ["Construir um sistema especialista baseado em regras escritas pela equipe", false],
            ["Coletar mais dados rotulados e treinar uma árvore de decisão com eles", false],
            ["Treinar uma rede neural pequena do zero com os dados da empresa", false],
        ],
    },
    {
        statement:
            "Uma grande empresa está modernizando aplicações legadas, como sistemas de mainframe e aplicações .NET antigas, e quer um serviço da AWS que use agentes de IA para acelerar a transformação e a migração dessas cargas de trabalho. Qual serviço atende a esse requisito?",
        explanation:
            "O AWS Transform usa agentes de IA especializados para descobrir, planejar e executar a modernização e a migração de cargas como mainframe, VMware e .NET. O Database Migration Service migra bancos de dados, o Application Migration Service replica servidores sem modernizar o código e o Textract extrai texto de documentos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["AWS Transform", true],
            ["AWS Database Migration Service", false],
            ["AWS Application Migration Service", false],
            ["Amazon Textract", false],
        ],
    },
    {
        statement:
            "Em um workshop interno, uma equipe de produto precisa explicar o que diferencia a IA agêntica (agentic AI) de outras aplicações de IA. Qual descrição define melhor a IA agêntica?",
        explanation:
            "IA agêntica descreve sistemas que recebem um objetivo e, com autonomia, planejam as etapas, usam ferramentas e memória e executam ações até concluí-lo. Gerar imagens a partir de texto é típico de modelos de difusão, converter fala em texto é reconhecimento de fala e agrupar dados sem rótulo é clustering.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["IA que planeja, decide e executa ações sozinha para atingir um objetivo", true],
            ["IA que gera imagens novas a partir de descrições escritas em texto", false],
            ["IA que converte a fala gravada em texto escrito de forma automática", false],
            ["IA que agrupa pontos de dados semelhantes em clusters sem usar nenhum rótulo", false],
        ],
    },
    {
        statement:
            "Uma consultoria compara um sistema de IA agêntica com o sistema de IA tradicional que a empresa já usa para classificar chamados de suporte. Qual afirmação descreve corretamente a diferença entre os dois?",
        explanation:
            "Um sistema agêntico divide o objetivo em etapas, usa ferramentas e executa um fluxo de várias etapas com autonomia, enquanto a IA tradicional costuma processar cada solicitação e devolver uma resposta. Ser agêntico não implica precisar de mais dados, não limita o sistema a texto e não garante mais precisão.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "O agêntico executa sozinho tarefas de várias etapas, e o tradicional responde a um pedido por vez",
                true,
            ],
            [
                "O agêntico exige muito mais dados de treinamento, e o tradicional funciona bem com poucos exemplos",
                false,
            ],
            [
                "O agêntico processa apenas texto, e o tradicional consegue lidar com qualquer tipo de dado de entrada",
                false,
            ],
            [
                "O agêntico é sempre mais preciso, e o tradicional erra mais em qualquer tarefa que os dois executem",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de software quer usar IA para transformar uma ideia em requisitos, gerar o documento de design e implementar as funcionalidades a partir dessas especificações, em um fluxo de desenvolvimento orientado a especificações (spec-driven development). Qual ferramenta da AWS oferece esse fluxo?",
        explanation:
            "O Kiro é o ambiente de desenvolvimento agêntico da AWS criado para o desenvolvimento orientado a especificações: a partir da ideia, gera requisitos, design e lista de tarefas e implementa o código. Strands Agents é um SDK para construir agentes, AgentCore opera agentes em produção e CodePipeline automatiza a entrega contínua.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Kiro, ambiente de desenvolvimento agêntico com IDE e CLI", true],
            ["Strands Agents, SDK de código aberto para construir agentes", false],
            ["Amazon Bedrock AgentCore, serviço para implantar e operar agentes", false],
            ["AWS CodePipeline, serviço de integração e entrega contínua", false],
        ],
    },
    {
        statement:
            "Uma analista de negócios quer criar painéis interativos com insights gerados por IA e fazer perguntas sobre os dados em linguagem natural. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Quick, que evoluiu do QuickSight, reúne painéis de BI (o recurso Quick Sight) e IA generativa: a pessoa pergunta em linguagem natural e recebe visualizações e insights. Athena consulta dados no S3 com SQL, Redshift é o data warehouse e Glue integra e transforma dados (ETL).",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Quick", true],
            ["Amazon Athena", false],
            ["Amazon Redshift", false],
            ["AWS Glue", false],
        ],
    },
    {
        statement:
            "Uma central de atendimento quer criar um agente virtual por voz que entenda o que o cliente pede e encaminhe a ligação para o departamento certo. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Lex constrói interfaces de conversa por voz e texto, reconhece a intenção do cliente e permite encaminhar a ligação conforme o pedido. Polly converte texto em fala, mas não interpreta o que o cliente diz; Translate traduz textos e Comprehend extrai informações de textos sem conduzir diálogos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Polly", false],
            ["Amazon Lex", true],
            ["Amazon Translate", false],
            ["Amazon Comprehend", false],
        ],
    },
    {
        statement:
            "Um escritório de advocacia tem milhares de documentos jurídicos e quer que os funcionários encontrem jurisprudência e cláusulas contratuais relevantes fazendo perguntas em linguagem natural. Que tipo de aplicação de IA atende melhor a essa necessidade?",
        explanation:
            "Uma aplicação de base de conhecimento indexa grandes coleções de documentos e recupera o conteúdo relevante para perguntas feitas em linguagem natural, o que atende à busca jurídica. Detecção de fraude aponta transações suspeitas, previsão de séries temporais estima valores futuros e detecção de anomalias sinaliza padrões fora do comum.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Base de conhecimento", true],
            ["Detecção de fraude", false],
            ["Previsão de séries temporais", false],
            ["Detecção de anomalias", false],
        ],
    },
    {
        statement:
            "Em um treinamento para gestores, o instrutor pede a definição de large language model (LLM). Qual resposta está correta?",
        explanation:
            "Um LLM é um modelo de deep learning, geralmente baseado em transformers, treinado com enormes volumes de texto para entender contexto, gerar texto, responder perguntas e executar outras tarefas de linguagem. Banco de dados só armazena, tradutor de código converte sintaxe e transcrição de fala converte áudio em texto.",
        topic: "IA generativa",
        options: [
            [
                "Um modelo de deep learning treinado com enormes volumes de texto para entender e gerar linguagem",
                true,
            ],
            [
                "Um banco de dados que guarda grandes volumes de texto e devolve os trechos buscados por palavra-chave",
                false,
            ],
            [
                "Uma ferramenta que traduz automaticamente o código entre diferentes linguagens de programação",
                false,
            ],
            [
                "Um sistema que converte a fala gravada em texto escrito para gerar legendas e transcrições",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma diretora pede que a equipe explique, em uma frase, o que é IA generativa antes de aprovar um projeto piloto. Qual afirmação descreve melhor a IA generativa?",
        explanation:
            "IA generativa aprende padrões dos dados de treino e cria conteúdo novo e parecido com eles, como texto, imagens, áudio, vídeo e código. Classificar em categorias predefinidas é tarefa de modelos de classificação, detectar anomalias é outra técnica de ML e recuperar informações existentes é busca, sem criar nada novo.",
        topic: "IA generativa",
        options: [
            [
                "IA que cria conteúdo novo, como texto e imagens, a partir de padrões aprendidos",
                true,
            ],
            ["IA que classifica os dados em categorias definidas previamente pela equipe", false],
            ["IA que detecta anomalias e desvios em grandes conjuntos de dados históricos", false],
            [
                "IA que recupera informações já existentes nos bancos de dados internos da empresa",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer um sistema de IA que pesquise concorrentes por conta própria, compile as descobertas em um relatório e envie o resumo por e-mail às partes interessadas, sem intervenção humana a cada etapa. Que tipo de aplicação de IA atende melhor a esse requisito?",
        explanation:
            "IA agêntica planeja e executa fluxos de várias etapas com autonomia, como pesquisar, compilar um relatório e enviar e-mails, usando ferramentas e sistemas diferentes. Reconhecimento de fala transcreve áudio, classificação de imagens rotula imagens e análise de sentimento avalia o tom de textos; nenhuma orquestra tarefas sozinha.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Reconhecimento de fala", false],
            ["Classificação de imagens", false],
            ["IA agêntica (agentic AI)", true],
            ["Análise de sentimento", false],
        ],
    },
    {
        statement:
            "Uma equipe acostumada a criar manualmente os atributos de entrada de modelos de ML tradicionais vai testar deep learning em um projeto de visão computacional. Qual afirmação descreve melhor como o deep learning se diferencia do ML tradicional?",
        explanation:
            "Deep learning usa redes neurais profundas que descobrem sozinhas, a partir de dados brutos como pixels, as representações úteis que no ML tradicional costumam vir da engenharia de atributos manual. Ele se aplica a imagens, áudio e texto e, por ter muitos parâmetros, em geral precisa de mais dados, não de menos.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Aprende as representações dos dados brutos sozinho, sem depender de engenharia de atributos manual",
                true,
            ],
            [
                "Exige atributos criados manualmente, enquanto o ML tradicional aprende sem essa etapa de preparação",
                false,
            ],
            [
                "É indicado principalmente para texto, enquanto o ML tradicional é o preferido para imagens e áudio",
                false,
            ],
            [
                "Costuma precisar de menos dados de treinamento que o ML tradicional para atingir o mesmo desempenho",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma rede de varejo quer detectar automaticamente os rostos dos clientes nas gravações das câmeras de segurança para desfocá-los antes de arquivar os vídeos. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Rekognition é o serviço de visão computacional que detecta rostos em imagens e vídeos e retorna a posição de cada um, o que permite desfocá-los antes de arquivar. Textract extrai texto de documentos, Comprehend analisa textos e o Elemental MediaConvert converte formatos de vídeo sem identificar rostos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Amazon Textract", false],
            ["Amazon Rekognition", true],
            ["Amazon Comprehend", false],
            ["AWS Elemental MediaConvert", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados está levantando as fontes que poderão alimentar um projeto de ML. Qual das fontes a seguir é um exemplo de dado não estruturado?",
        explanation:
            "E-mails escritos livremente não seguem um esquema fixo: variam em tamanho, estilo e formato e não cabem direto em linhas e colunas, por isso são dados não estruturados. Tabela de pedidos, planilha com campos nomeados e CSV com colunas fixas são dados estruturados, em que cada campo tem tipo e posição conhecidos.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Uma coleção de e-mails de suporte escritos livremente pelos clientes", true],
            ["Uma tabela de pedidos com colunas de data, quantidade e preço unitário", false],
            ["Uma planilha com matrícula, nome, cargo e salário dos funcionários", false],
            ["Um arquivo CSV com leituras de sensores indexadas por horário", false],
        ],
    },
    {
        statement:
            "Em uma revisão de MLOps, a liderança pede que a equipe passe a gerenciar a dívida técnica dos seus sistemas de ML. A que essa prática se refere?",
        explanation:
            "Dívida técnica em MLOps é o custo acumulado de atalhos, pipelines sem documentação, dependências obsoletas e componentes acoplados, que tornam o sistema de ML difícil de manter; gerenciá-la é refatorar, documentar e modernizar. Cortar gastos de nuvem é otimização de custos, mais parâmetros é decisão de modelagem e excluir dados antigos é governança.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Tratar atalhos, dependências obsoletas e processos sem documentação que dificultam a manutenção",
                true,
            ],
            [
                "Reduzir o valor gasto com instâncias de computação na nuvem usadas no treinamento dos modelos de ML",
                false,
            ],
            [
                "Aumentar a quantidade de parâmetros dos modelos para melhorar a acurácia das previsões em produção",
                false,
            ],
            [
                "Excluir os conjuntos de dados antigos que não são mais usados por nenhum dos modelos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de ciência de dados executa dezenas de jobs de treinamento com configurações diferentes toda semana. Ela precisa comparar os resultados e reproduzir qualquer execução anterior. Qual prática de MLOps atende a essa necessidade?",
        explanation:
            "O rastreamento de experimentos registra parâmetros, métricas, versão do código e artefatos de cada execução, o que permite comparar resultados e reproduzir qualquer treino anterior. Implantação publica o modelo para inferência, rotulagem atribui respostas corretas aos exemplos e a entrega de atributos serve features ao modelo em produção.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Implantação de modelos", false],
            ["Rastreamento de experimentos", true],
            ["Rotulagem de dados", false],
            ["Entrega de atributos para inferência", false],
        ],
    },
    {
        statement:
            "Durante o desenvolvimento de um modelo, a equipe reserva tempo para o ajuste de hiperparâmetros antes de fechar a versão final. Qual é o objetivo dessa etapa no ciclo de vida de ML?",
        explanation:
            "O ajuste de hiperparâmetros busca a melhor combinação de configurações definidas antes do treino, como taxa de aprendizado, tamanho do lote e número de camadas, para maximizar a métrica-alvo. Coletar e limpar dados é preparação, publicar em endpoint é implantação e acompanhar drift é monitoramento, etapas separadas do ciclo.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Encontrar as configurações do modelo que produzem o melhor desempenho", true],
            ["Coletar e limpar os dados brutos usados no treinamento do modelo", false],
            ["Implantar o modelo treinado em um endpoint de produção para inferência", false],
            ["Monitorar o modelo em busca de desvios nos dados após a implantação", false],
        ],
    },
    {
        statement:
            "Uma equipe treinou um modelo para prever o cancelamento de clientes. O modelo acerta muito nos dados de treinamento, mas erra bastante com clientes novos, que ele nunca viu. Qual mudança resolve esse problema?",
        explanation:
            "Acertar no treino e errar com clientes novos é overfitting: o modelo decorou os dados em vez de generalizar. Aumentar a regularização penaliza pesos grandes e simplifica o modelo. Reduzir a regularização e acrescentar atributos elevam a complexidade, e treinar por mais épocas ajusta o modelo ainda mais ao treino.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Aumentar a força da regularização para que o modelo fique menos complexo", true],
            [
                "Reduzir a força da regularização para que o modelo capture padrões mais complexos",
                false,
            ],
            [
                "Acrescentar novos atributos ao conjunto de dados usado como entrada do modelo",
                false,
            ],
            ["Continuar o treinamento do modelo por mais épocas com os mesmos dados", false],
        ],
    },
    {
        statement:
            "Uma varejista criou um modelo para prever o preço de produtos. Ele teve resultados excelentes no conjunto de treinamento, mas foi mal no conjunto de teste e continua mal em produção desde o primeiro dia. O que a empresa deve fazer para resolver esse problema?",
        explanation:
            "Ir muito bem no treino e mal no teste e em produção desde o início é o sinal clássico de overfitting: o modelo decorou os exemplos. Treinar com mais dados e mais variados ajuda a generalizar. Menos dados piora o problema, treinar por mais tempo ajusta ainda mais o modelo ao treino e mais hiperparâmetros só aumentam a complexidade.",
        topic: "Fundamentos de IA e ML",
        options: [
            ["Treinar o modelo com um volume maior e mais variado de dados", true],
            ["Treinar o modelo com um volume menor e mais filtrado de dados", false],
            ["Treinar o modelo por mais tempo com o mesmo conjunto de dados", false],
            ["Acrescentar mais hiperparâmetros à configuração atual do modelo", false],
        ],
    },
];
