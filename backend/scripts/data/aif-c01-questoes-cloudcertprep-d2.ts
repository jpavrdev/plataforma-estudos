// Questões do simulado AWS Certified AI Practitioner (AIF-C01), domínio 2 da prova
// (Fundamentals of Generative AI), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aif-c01-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D2: Questao[] = [
    {
        statement:
            "Uma fabricante de eletrodomésticos inteligentes quer que os aparelhos executem a inferência do modelo de linguagem no próprio dispositivo, com a menor latência possível. Qual solução atende a esse requisito?",
        explanation:
            "Rodar um SLM otimizado no próprio aparelho elimina a ida e volta pela rede, e o modelo pequeno cabe no hardware limitado da borda, o que garante a menor latência. Um LLM excede a memória e o processamento típicos desses dispositivos, e chamar uma API central, seja de SLM ou de LLM, acrescenta a latência da rede.",
        topic: "IA generativa",
        options: [
            [
                "Implantar small language models (SLMs) otimizados nos próprios dispositivos de borda",
                true,
            ],
            [
                "Implantar large language models (LLMs) otimizados nos próprios dispositivos de borda",
                false,
            ],
            [
                "Chamar de forma assíncrona uma API central de SLM a partir dos dispositivos de borda",
                false,
            ],
            [
                "Chamar de forma assíncrona uma API central de LLM a partir dos dispositivos de borda",
                false,
            ],
        ],
    },
    {
        statement:
            "A equipe de engenharia de uma fintech planeja adotar o Kiro para entregar funcionalidades mais rápido. O que o Kiro pode fazer para ajudar a equipe?",
        explanation:
            "O Kiro é um ambiente de desenvolvimento com IA que gera código a partir de conversas e especificações e, com o rastreador de referências ativado, registra quando a sugestão se parece com código público. Rodar sem gerenciar servidores é o AWS Lambda, áudio para texto é o Amazon Transcribe e analisar imagens é o Amazon Rekognition.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Gerar código a partir de prompts e especificações e rastrear referências a código público",
                true,
            ],
            [
                "Executar a aplicação sem provisionar nem gerenciar servidores, cobrando apenas por execução",
                false,
            ],
            [
                "Converter arquivos de áudio em documentos de texto com modelos de reconhecimento de fala",
                false,
            ],
            [
                "Identificar objetos e rostos em imagens e vídeos com modelos de visão computacional",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma loja virtual está criando uma busca visual em que o cliente pode consultar tanto com uma frase digitada quanto com a foto de um produto. Que tipo de foundation model (FM) deve sustentar essa busca?",
        explanation:
            "Um modelo de embeddings multimodal coloca texto e imagem no mesmo espaço vetorial, então uma frase ou uma foto podem ser comparadas com o catálogo por similaridade. O de texto não lê imagens, e os modelos de geração criam conteúdo novo em vez de produzir os vetores de que a busca precisa.",
        topic: "IA generativa",
        options: [
            [
                "Um modelo de embeddings multimodal, que representa texto e imagem no mesmo espaço vetorial",
                true,
            ],
            [
                "Um modelo de embeddings de texto, que representa frases e descrições de produtos como vetores",
                false,
            ],
            [
                "Um modelo de geração de imagens, que cria imagens novas de produtos a partir de uma descrição",
                false,
            ],
            [
                "Um modelo de geração multimodal, que recebe texto e imagem e produz conteúdo novo nos dois formatos",
                false,
            ],
        ],
    },
    {
        statement:
            "A equipe de marketing de uma rede de artigos esportivos está mapeando onde aplicar IA generativa. Qual destas tarefas é um caso de uso de IA generativa?",
        explanation:
            "IA generativa cria conteúdo novo, e gerar imagens fotorrealistas a partir de texto é um caso clássico. Detectar intrusões é classificação de segurança, prever vendas é análise preditiva e criar índices é ajuste de desempenho do banco; nenhuma dessas tarefas gera conteúdo.",
        topic: "IA generativa",
        options: [
            [
                "Gerar imagens fotorrealistas de produtos a partir de descrições em texto para uma campanha",
                true,
            ],
            [
                "Detectar intrusões na rede corporativa com um sistema que classifica o tráfego suspeito",
                false,
            ],
            [
                "Prever a tendência de vendas do próximo trimestre a partir do histórico de pedidos da rede",
                false,
            ],
            [
                "Acelerar as consultas ao banco de dados de clientes com a criação de índices otimizados",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao escolher um foundation model (FM) no Amazon Bedrock, uma equipe de pesquisa precisa saber quanto texto consegue enviar em um único prompt. Qual propriedade do modelo informa isso?",
        explanation:
            "A janela de contexto define quantos tokens o modelo consegue considerar de uma vez e, por isso, limita quanto texto cabe em uma chamada. Temperatura regula a aleatoriedade da saída, o tamanho do modelo se refere à quantidade de parâmetros e o tamanho do lote trata de quantas entradas são processadas juntas.",
        topic: "IA generativa",
        options: [
            [
                "Janela de contexto, o limite de tokens que o modelo processa em uma única chamada",
                true,
            ],
            [
                "Temperatura, o parâmetro que controla a aleatoriedade do texto que o modelo gera",
                false,
            ],
            [
                "Tamanho do modelo, a quantidade de parâmetros que o modelo aprendeu no treinamento",
                false,
            ],
            [
                "Tamanho do lote (batch size), o número de entradas processadas juntas em cada etapa",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de ciência de dados quer escolher um foundation model (FM) pré-treinado em um catálogo e colocá-lo em uso rapidamente dentro da própria VPC. Qual serviço ou recurso da AWS permite isso?",
        explanation:
            "O SageMaker JumpStart oferece um catálogo de FMs pré-treinados que a equipe implanta em poucos cliques, em endpoints dentro da própria VPC. O Personalize treina modelos de recomendação, o PartyRock é um playground público sem implantação em VPC e o Model Registry versiona modelos que a equipe já treinou, sem oferecer FMs prontos.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Amazon SageMaker JumpStart, com FMs pré-treinados já prontos para implantar em poucos cliques",
                true,
            ],
            [
                "Amazon Personalize, com modelos de recomendação treinados a partir das interações dos usuários",
                false,
            ],
            [
                "PartyRock, um playground público do Amazon Bedrock para criar apps de IA generativa sem código",
                false,
            ],
            [
                "Amazon SageMaker Model Registry, com o catálogo das versões de modelos que a equipe já treinou",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma varejista guarda grandes volumes de dados de vendas em um banco de dados e quer um aplicativo em que funcionários sem conhecimento técnico digitem uma pergunta em linguagem natural e recebam a consulta SQL gerada automaticamente. Que tipo de modelo é o mais indicado para esse aplicativo?",
        explanation:
            "Um GPT é um LLM treinado para gerar texto, o que inclui traduzir um pedido em linguagem natural para uma consulta SQL estruturada. A ResNet é voltada à visão computacional, a SVM classifica ou faz regressão sem gerar texto e a WaveNet gera áudio, uma modalidade diferente da necessária.",
        topic: "IA generativa",
        options: [
            [
                "Generative pre-trained transformer (GPT), um modelo de linguagem que gera textos e código",
                true,
            ],
            [
                "Rede neural residual (ResNet), uma arquitetura profunda voltada ao reconhecimento de imagens",
                false,
            ],
            [
                "Máquina de vetores de suporte (SVM), um algoritmo supervisionado de classificação e regressão",
                false,
            ],
            [
                "WaveNet, um modelo generativo que sintetiza áudio e fala com som natural a partir de exemplos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa resume contratos com um modelo base do Amazon Bedrock e, para melhorar a qualidade, criou um modelo customizado a partir dele. Qual ação permite usar o modelo customizado para inferência no próprio Amazon Bedrock?",
        explanation:
            "No Bedrock, um modelo customizado é servido com Provisioned Throughput, que reserva capacidade dedicada, ou, em modelos compatíveis, com uma implantação sob demanda. Endpoint e Model Registry são fluxos do SageMaker AI, e o acesso a modelos, hoje habilitado por padrão, vale para os modelos base.",
        topic: "RAG e customização",
        options: [
            [
                "Comprar Provisioned Throughput para o modelo customizado, com capacidade dedicada no Bedrock",
                true,
            ],
            [
                "Implantar o modelo customizado em um endpoint do Amazon SageMaker AI para inferência em tempo real",
                false,
            ],
            [
                "Registrar o modelo customizado no Amazon SageMaker Model Registry com o status de aprovado",
                false,
            ],
            [
                "Solicitar acesso ao modelo customizado na página de acesso a modelos do console do Bedrock",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está criando uma aplicação que precisa gerar dados sintéticos parecidos com os dados que ela já possui. Que tipo de modelo a empresa pode usar para atender a esse requisito?",
        explanation:
            "Uma GAN treina duas redes em competição: o gerador cria amostras e o discriminador tenta separá-las das reais, até o gerador produzir dados sintéticos convincentes. O XGBoost prevê rótulos e valores, a ResNet classifica imagens e a WaveNet, embora generativa, é especializada em áudio.",
        topic: "IA generativa",
        options: [
            [
                "Rede adversária generativa (GAN), que aprende a gerar amostras parecidas com os dados reais",
                true,
            ],
            [
                "XGBoost, um algoritmo de gradient boosting para classificação e regressão supervisionadas",
                false,
            ],
            [
                "WaveNet, um modelo generativo especializado em sintetizar áudio e fala a partir de exemplos",
                false,
            ],
            [
                "Rede neural residual (ResNet), uma arquitetura convolucional voltada a classificar imagens",
                false,
            ],
        ],
    },
    {
        statement:
            "Durante um treinamento interno sobre IA generativa, a equipe pergunta como se chamam as representações numéricas de palavras, objetos e conceitos que ajudam os modelos a entender o significado do texto. Qual é o termo correto?",
        explanation:
            "Embeddings são vetores numéricos que representam palavras, objetos e conceitos, colocando itens de significado parecido perto uns dos outros no espaço vetorial. Tokens são os pedaços em que o texto é dividido, parâmetros são os pesos aprendidos no treino e o modelo é o sistema que faz as previsões.",
        topic: "IA generativa",
        options: [
            ["Embeddings, vetores que aproximam os conceitos de significado parecido", true],
            [
                "Tokens, as unidades de texto em que a entrada é dividida antes do processamento",
                false,
            ],
            ["Parâmetros, os pesos internos que o modelo ajusta durante o treinamento", false],
            [
                "Modelos, os sistemas treinados que recebem as entradas e produzem as previsões",
                false,
            ],
        ],
    },
    {
        statement:
            "Um analista de uma varejista quer gerar automaticamente gráficos com as vendas dos produtos líderes de cada loja no último ano, descrevendo o que precisa em linguagem natural. Qual solução da AWS atende a essa necessidade?",
        explanation:
            "O Amazon Quick Sight, recurso do Amazon Quick que sucedeu o Amazon Q in QuickSight, gera visuais a partir de perguntas em linguagem natural, como as vendas dos produtos líderes por loja. O Athena executa SQL e devolve tabelas, o Personalize recomenda produtos e o Comprehend analisa textos; nenhum deles monta gráficos.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Amazon Quick Sight, que cria visuais e dashboards a partir de pedidos em linguagem natural",
                true,
            ],
            [
                "Amazon Athena, que executa consultas SQL interativas sobre os dados de vendas no Amazon S3",
                false,
            ],
            [
                "Amazon Personalize, que gera recomendações de produtos a partir do histórico de interações",
                false,
            ],
            [
                "Amazon Comprehend, que extrai entidades, frases-chave e sentimento de textos dos clientes",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma agência de viagens recebe um grande volume de pedidos de reserva todos os dias e planeja usar agentes de IA criados com o Amazon Bedrock AgentCore para dar conta da demanda. Qual é um benefício central desses agentes?",
        explanation:
            "Agentes criados no AgentCore interpretam o pedido, dividem o trabalho em etapas e chamam APIs e sistemas para concluí-lo, automatizando tarefas repetitivas em grande volume. Agentes não treinam FMs, escolher modelo por métricas é tarefa de avaliação de modelos e reservar capacidade é papel do Provisioned Throughput.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Automatizar tarefas repetitivas e orquestrar fluxos de várias etapas com APIs e sistemas",
                true,
            ],
            [
                "Treinar foundation models customizados que preveem as necessidades futuras de cada cliente",
                false,
            ],
            [
                "Escolher o foundation model mais adequado com base em critérios e métricas predefinidos",
                false,
            ],
            [
                "Reservar capacidade dedicada de inferência para reduzir o custo por token das chamadas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa customizou um foundation model (FM) no Amazon Bedrock e agora precisa enviar um conjunto de dados de validação para que o Bedrock avalie as respostas do modelo. Em qual serviço da AWS esse conjunto de dados deve ficar?",
        explanation:
            "O Amazon Bedrock lê os conjuntos de treino e de validação da customização a partir de buckets do Amazon S3, então é lá que o arquivo deve ficar. O EBS oferece volumes de bloco para instâncias do EC2, e o EFS e o FSx for Lustre são sistemas de arquivos montados em servidores, que o Bedrock não usa como origem.",
        topic: "RAG e customização",
        options: [
            [
                "Amazon S3, um armazenamento de objetos escalável para arquivos e conjuntos de dados",
                true,
            ],
            [
                "Amazon Elastic Block Store (Amazon EBS), com volumes de bloco anexados a instâncias",
                false,
            ],
            [
                "Amazon Elastic File System (Amazon EFS), um sistema de arquivos compartilhado",
                false,
            ],
            [
                "Amazon FSx for Lustre, um sistema de arquivos de alto desempenho para cargas de ML",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma rede de farmácias quer um resumo curto de cada novo medicamento com base nas avaliações escritas pelos clientes. Qual solução atende a esse requisito?",
        explanation:
            "LLMs do Amazon Bedrock são adequados para sumarização e condensam várias avaliações em um texto curto sobre cada medicamento. Previsão de séries temporais estima valores futuros, a classificação do Comprehend só separa itens em categorias e o Rekognition analisa imagens e vídeos, não textos.",
        topic: "Aplicações de foundation models",
        options: [
            ["Gerar resumos das avaliações de cada medicamento com LLMs do Amazon Bedrock", true],
            [
                "Criar um modelo de previsão de séries temporais no Amazon Personalize para analisar as avaliações",
                false,
            ],
            [
                "Criar um modelo de classificação no Amazon Comprehend que separa os medicamentos em grupos",
                false,
            ],
            ["Gerar resumos das avaliações de cada medicamento com o Amazon Rekognition", false],
        ],
    },
    {
        statement:
            "Uma empresa de assinaturas de produtos usa um chatbot de atendimento com IA generativa e quer acompanhar uma métrica que expresse em dinheiro o efeito do chatbot na operação diária. Qual métrica a empresa deve acompanhar?",
        explanation:
            "O custo por conversa traduz em dinheiro quanto a operação gasta com cada atendimento do chatbot e permite comparar com alternativas, como atendentes humanos. O volume de solicitações mede quantidade, o AHT mede agilidade e o custo de treinamento é um gasto de construção, não da operação diária.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Custo por conversa com cliente, somando o que cada atendimento do chatbot consome",
                true,
            ],
            [
                "Número de solicitações atendidas, contando quantas conversas o chatbot concluiu no mês",
                false,
            ],
            [
                "Tempo médio de atendimento (AHT), medindo quanto dura cada conversa até a resolução",
                false,
            ],
            [
                "Custo de treinamento dos modelos de IA usados pelo chatbot antes do lançamento",
                false,
            ],
        ],
    },
    {
        statement:
            "O chatbot de atendimento de uma seguradora, construído no Amazon Bedrock, precisa de várias trocas de mensagens para resolver um sinistro. Como o LLM pode usar o conteúdo das mensagens anteriores do cliente?",
        explanation:
            "LLMs não guardam memória entre chamadas, então a aplicação envia o histórico da conversa no prompt e o modelo mantém o contexto entre as trocas. O registro de invocações só grava as requisições para auditoria, o Personalize é um serviço de recomendação e o Provisioned Throughput define capacidade, não contexto.",
        topic: "Prompt engineering",
        options: [
            ["Incluir as mensagens anteriores da conversa no prompt de cada nova chamada", true],
            ["Ativar o registro de invocações do modelo para coletar as mensagens trocadas", false],
            [
                "Guardar o histórico da conversa no Amazon Personalize para o modelo consultar",
                false,
            ],
            [
                "Comprar Provisioned Throughput para o LLM manter o contexto entre as chamadas",
                false,
            ],
        ],
    },
    {
        statement:
            "A central de atendimento de uma varejista passa manualmente aos clientes dicas de produtos de acordo com a localização de cada um e quer automatizar isso com foundation models (FMs). Qual serviço da AWS atende a essa necessidade?",
        explanation:
            "O Amazon Bedrock oferece foundation models gerenciados que geram dicas e descrições de produtos adaptadas à localização do cliente, sem infraestrutura para administrar. O Macie protege dados sensíveis, o Textract extrai texto de documentos e o Transcribe converte fala em texto; nenhum deles oferece FMs.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Amazon Bedrock, que dá acesso a FMs para gerar descrições e recomendações de produtos",
                true,
            ],
            [
                "Amazon Macie, que descobre e protege dados sensíveis armazenados no Amazon S3",
                false,
            ],
            [
                "Amazon Textract, que extrai texto, formulários e tabelas de documentos digitalizados",
                false,
            ],
            [
                "Amazon Transcribe, que converte em texto o áudio das ligações da central de atendimento",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma gestora de investimentos já usa machine learning em várias áreas e quer identificar qual iniciativa é de IA generativa. Qual destas tarefas é um caso de uso de IA generativa?",
        explanation:
            "Resumir reclamações gera um texto novo e condensado a partir de entradas longas, tarefa típica de IA generativa feita por LLMs. Classificar clientes e prever receita são tarefas preditivas, e segmentar por tipo de investimento é clustering; todas são de ML tradicional e não criam conteúdo.",
        topic: "IA generativa",
        options: [
            ["Resumir as reclamações dos clientes em textos curtos com os pontos principais", true],
            ["Classificar os clientes de acordo com os produtos que eles mais utilizam", false],
            [
                "Prever a receita dos próximos meses para determinados produtos de investimento",
                false,
            ],
            ["Segmentar os clientes em grupos conforme o tipo de investimento que preferem", false],
        ],
    },
    {
        statement:
            "Em uma aula sobre a arquitetura dos LLMs atuais, a instrutora pede à turma a característica que define os modelos de linguagem baseados em transformer. Qual afirmação descreve essa característica?",
        explanation:
            "O transformer usa autoatenção, que pondera a relevância de cada token em relação aos demais e captura o contexto da sequência inteira em paralelo. Filtros convolucionais caracterizam as CNNs, o processamento em ciclos com estado oculto é típico das RNNs e transformers também trabalham com imagem e áudio.",
        topic: "IA generativa",
        options: [
            [
                "Usam mecanismos de autoatenção para capturar as relações de contexto entre todos os tokens",
                true,
            ],
            [
                "Usam camadas convolucionais que aplicam filtros sobre a entrada para captar padrões locais",
                false,
            ],
            [
                "Processam a sequência um elemento por vez, em ciclos repetidos que carregam um estado oculto",
                false,
            ],
            [
                "Processam apenas dados de texto, sem conseguir lidar com imagens, áudio ou outras modalidades",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma redação está testando um assistente de escrita com IA generativa. O tráfego do piloto é baixo, o desempenho não é prioridade, o uso futuro é imprevisível e a meta é o menor custo. Qual solução atende a esses requisitos?",
        explanation:
            "No Bedrock sob demanda, a cobrança acompanha as chamadas feitas, sem capacidade reservada, o que mantém o custo baixo no piloto e se ajusta à demanda incerta. Instâncias EC2 com GPU e endpoints do JumpStart geram custo mesmo ociosos, e o Provisioned Throughput cobra por capacidade que o uso baixo desperdiçaria.",
        topic: "IA generativa",
        options: [
            [
                "Usar o Amazon Bedrock com precificação sob demanda, pagando só pelas chamadas feitas",
                true,
            ],
            [
                "Usar instâncias do Amazon EC2 com GPU para hospedar o modelo de linguagem da redação",
                false,
            ],
            [
                "Usar o Amazon Bedrock com Provisioned Throughput, reservando capacidade para o piloto",
                false,
            ],
            [
                "Usar o Amazon SageMaker JumpStart para implantar o modelo em um endpoint dedicado",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa fez fine-tuning de um LLM no Amazon Bedrock e vai colocá-lo em produção com volume de requisições alto, constante e previsível o dia todo, aceitando um compromisso de seis meses. Qual opção é a MAIS econômica?",
        explanation:
            "Para carga alta, constante e previsível, o Provisioned Throughput com compromisso reduz o preço por hora da capacidade dedicada e sai mais barato que pagar por uso. A inferência sob demanda compensa em tráfego variável, e EC2 e Lambda não são a forma de o Bedrock servir modelos customizados, além de exigirem administrar a infraestrutura.",
        topic: "RAG e customização",
        options: [
            ["Comprar Provisioned Throughput para o modelo customizado no Amazon Bedrock", true],
            ["Usar o modelo customizado com inferência sob demanda no Amazon Bedrock", false],
            ["Implantar o modelo em uma instância do Amazon EC2 otimizada para computação", false],
            ["Guardar o modelo no Amazon S3 e servi-lo com funções do AWS Lambda", false],
        ],
    },
    {
        statement:
            "Uma clínica médica quer uma ferramenta de IA generativa com reconhecimento de fala que ajude os médicos a registrar as consultas e criar notas clínicas. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O AWS HealthScribe combina reconhecimento de fala e IA generativa para transcrever conversas entre médico e paciente e gerar notas clínicas preliminares. O Polly faz o caminho inverso, de texto para fala, o Rekognition analisa imagens e o Lex cria bots de conversa, sem produzir documentação clínica.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "AWS HealthScribe, que transcreve a consulta e gera notas clínicas preliminares",
                true,
            ],
            [
                "Amazon Polly, que converte texto em fala com vozes naturais em vários idiomas",
                false,
            ],
            [
                "Amazon Rekognition, que analisa imagens e vídeos para identificar objetos e rostos",
                false,
            ],
            ["Amazon Lex, que cria interfaces de conversa por voz e texto para atendimento", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor está aprendendo como os LLMs representam o texto internamente. O que os embeddings vetoriais tornam possível?",
        explanation:
            "Embeddings transformam texto em vetores que capturam significado, então dois textos podem ser comparados matematicamente pela distância ou pela similaridade entre eles, base de busca e agrupamento. Dividir textos em partes é chunking, agrupar caracteres em unidades é tokenização e contar palavras é apenas contagem de frequência.",
        topic: "IA generativa",
        options: [
            ["Comparar textos matematicamente, medindo a distância entre os vetores", true],
            ["Dividir textos longos em partes menores e mais fáceis de processar", false],
            ["Agrupar um conjunto de caracteres para ser tratado como uma única unidade", false],
            ["Contar quantas vezes cada palavra aparece no texto de entrada", false],
        ],
    },
    {
        statement:
            "Ao revisar a documentação de um projeto de busca semântica, uma analista encontra várias definições para embeddings. Qual afirmação descreve corretamente os embeddings em IA generativa?",
        explanation:
            "Embeddings mapeiam palavras ou documentos para vetores de muitas dimensões, em que significados parecidos ficam próximos, o que permite ao modelo trabalhar com semelhança. Pesquisar dados para responder é a etapa de recuperação do RAG, usar tipos menos precisos é quantização e armazenar dados é papel do banco de dados vetorial.",
        topic: "IA generativa",
        options: [
            [
                "Representam dados como vetores de muitas dimensões que capturam relações de significado",
                true,
            ],
            [
                "Pesquisam os dados para encontrar a informação mais útil para responder a uma pergunta",
                false,
            ],
            [
                "Reduzem a exigência de hardware usando um tipo de dado menos preciso para os pesos do modelo",
                false,
            ],
            [
                "Armazenam e recuperam os dados usados pelas aplicações de IA generativa em produção",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa escolher um modelo de IA generativa para um aplicativo que deve responder aos usuários em tempo real. Qual característica do modelo é a mais importante nesse caso?",
        explanation:
            "A velocidade de inferência define quanto o modelo demora para gerar a resposta, o fator decisivo quando o usuário espera retorno em tempo real. A complexidade influencia capacidade e custo, o tempo de treinamento é uma etapa de construção e o ritmo de inovação trata da evolução da família de modelos, não da latência.",
        topic: "IA generativa",
        options: [
            ["Velocidade de inferência, o tempo que o modelo leva para gerar cada resposta", true],
            ["Complexidade do modelo, a quantidade de camadas e parâmetros da arquitetura", false],
            ["Tempo de treinamento, o período necessário para treinar o modelo do zero", false],
            [
                "Ritmo de inovação, a frequência com que a família do modelo ganha versões novas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de suporte está aprendendo a usar um foundation model (FM) e quer saber como se chamam as instruções que ela escreve para orientar o modelo a dar uma resposta mais precisa. Qual é esse termo?",
        explanation:
            "Prompt é a entrada que traz a instrução, o contexto e os exemplos que orientam o que o modelo deve fazer, e um prompt bem escrito aumenta a precisão da resposta. Direção e diálogo não são os nomes técnicos dessa entrada, e tradução é um tipo de tarefa, não a instrução em si.",
        topic: "Prompt engineering",
        options: [
            ["Prompt, a entrada com as instruções e o contexto enviados ao modelo", true],
            ["Direção, a configuração que define o rumo que o modelo deve seguir", false],
            ["Diálogo, o registro das conversas anteriores guardado pelo modelo", false],
            ["Tradução, a conversão das instruções para a linguagem interna do modelo", false],
        ],
    },
    {
        statement:
            "Uma produtora de conteúdo em vídeo quer usar IA generativa para criar clipes novos e reduzir o tempo de produção, com o mínimo de etapas manuais. Qual abordagem atende a esses requisitos com a MAIOR eficiência operacional?",
        explanation:
            "Um modelo de geração de vídeo produz os clipes direto do prompt, sem etapas intermediárias, o que dá a maior eficiência operacional. Gerar imagens ou quadros e montar o vídeo em um editor acrescenta trabalho manual, e um LLM multimodal de uso geral entende imagens e documentos, mas responde em texto, sem gerar vídeo.",
        topic: "IA generativa",
        options: [
            [
                "Usar um modelo de geração de vídeo que cria os clipes direto a partir de um prompt de texto",
                true,
            ],
            [
                "Gerar imagens intermediárias com um modelo de texto para imagem e montar os vídeos em um editor",
                false,
            ],
            [
                "Criar quadros com um modelo de edição de imagem e animá-los manualmente em um software de vídeo",
                false,
            ],
            [
                "Pedir os clipes a um LLM multimodal de uso geral, como os que analisam imagens e documentos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma loja online usa um assistente de IA generativa no Amazon Bedrock para recomendar produtos e quer medir o impacto direto dele nas vendas. Qual métrica atende a esse requisito?",
        explanation:
            "A taxa de conversão mostra quantos clientes compram depois de usar o assistente e liga o uso diretamente ao resultado de vendas. O número de interações mede uso, a pontuação de sentimento mede satisfação e a acurácia do entendimento mede qualidade técnica; nenhuma delas mede vendas.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Taxa de conversão dos clientes que compram depois de interagir com o assistente",
                true,
            ],
            [
                "Número de interações que os clientes fazem com o assistente de IA ao longo do mês",
                false,
            ],
            [
                "Pontuação de sentimento das avaliações que os clientes deixam após cada interação",
                false,
            ],
            [
                "Acurácia do entendimento de linguagem natural nas perguntas feitas ao assistente",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer oferecer aos funcionários um assistente de IA para o trabalho que responda perguntas com base em documentos, e-mails e aplicativos internos, sem desenvolver uma aplicação própria. Qual serviço da AWS atende a esse objetivo?",
        explanation:
            "O Amazon Quick é o assistente de IA para o trabalho da AWS: conecta documentos, e-mails e aplicativos da empresa e fundamenta as respostas nesses dados, sem exigir desenvolvimento. SageMaker AI serve para treinar modelos próprios, Comprehend analisa textos e Transcribe converte fala em texto, e nenhum deles é um assistente pronto.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Amazon Quick, assistente de IA que responde com base nos dados conectados da empresa",
                true,
            ],
            [
                "Amazon SageMaker AI, plataforma para treinar e implantar modelos de ML próprios",
                false,
            ],
            [
                "Amazon Comprehend, que extrai entidades, frases-chave e sentimentos de textos internos",
                false,
            ],
            [
                "Amazon Transcribe, que converte em texto o áudio de reuniões e de chamadas da equipe",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer analisar fotos e vídeos curtos enviados por clientes de vários países e responder em texto no idioma de cada um. Entre os modelos Amazon Nova no Amazon Bedrock, qual atende a esses requisitos com o MENOR custo?",
        explanation:
            "O Amazon Nova Lite é o modelo multimodal de baixo custo da família: entende texto, imagem e vídeo e responde em texto em mais de 200 idiomas. O Nova Pro também é multimodal, mas custa mais; o Nova Micro aceita só texto; e o Nova Multimodal Embeddings gera vetores para busca, não respostas em texto.",
        topic: "Aplicações de foundation models",
        options: [
            ["Amazon Nova Lite", true],
            ["Amazon Nova Pro", false],
            ["Amazon Nova Micro", false],
            ["Amazon Nova Multimodal Embeddings", false],
        ],
    },
    {
        statement:
            "Uma edtech desenvolve um aplicativo de leitura em que cada aluno desenha um esboço simples e descreve a cena em uma frase. O aplicativo precisa transformar esse esboço e essa frase em uma ilustração para a história. Qual solução atende a esse requisito?",
        explanation:
            "O Stable Image Control Sketch, da Stability AI no Amazon Bedrock, gera imagens guiadas por um esboço e por um prompt de texto, o que produz a ilustração da história. O Polly converte texto em fala, o Rekognition apenas analisa imagens existentes e o Translate traduz textos, e nenhum deles cria ilustrações.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Usar o Stable Image Control Sketch no Amazon Bedrock para gerar a ilustração do esboço",
                true,
            ],
            [
                "Usar o Amazon Polly para transformar o texto de cada história em um audiolivro narrado",
                false,
            ],
            [
                "Usar o Amazon Rekognition para detectar e rotular os objetos desenhados em cada esboço",
                false,
            ],
            [
                "Usar o Amazon Translate para traduzir cada história e publicá-la em outros idiomas",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor quer gerar rapidamente casos de teste e documentação para o código de um projeto, com o MENOR esforço. Qual solução atende a esse requisito?",
        explanation:
            "O Kiro é o ambiente de desenvolvimento agêntico da AWS: gera testes e documentação direto no projeto, inclusive com hooks que criam esses arquivos automaticamente. Colar o código em um chat na web exige cópia manual e expõe o código, criar uma aplicação própria no Bedrock dá muito mais trabalho e escrever tudo à mão é o maior esforço.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Usar o Kiro, ambiente de desenvolvimento agêntico da AWS, para criar testes e documentos",
                true,
            ],
            [
                "Colar o código em um assistente de chat genérico na web e copiar de volta cada resposta",
                false,
            ],
            [
                "Criar uma aplicação própria que chama foundation models no Amazon Bedrock para gerar tudo",
                false,
            ],
            [
                "Pesquisar exemplos, escrever os casos de teste à mão e depois redigir toda a documentação",
                false,
            ],
        ],
    },
    {
        statement:
            "Um e-commerce precisa gerar milhares de descrições de produto originais por dia, com estilo e tom consistentes. Que tipo de modelo generativo atende a esses requisitos?",
        explanation:
            "Modelos baseados em transformer, como os LLMs, geram texto fluente e coerente e mantêm o estilo e o tom pedidos no prompt, em grande escala. Modelos de difusão, GANs e VAEs são usados principalmente para gerar imagens e outros dados, e não parágrafos de texto com tom consistente.",
        topic: "IA generativa",
        options: [
            ["Um modelo transformer, que usa autoatenção sobre os tokens da sequência", true],
            ["Um modelo de difusão, que remove ruído aos poucos até formar a saída", false],
            ["Uma GAN, em que um gerador e um discriminador competem entre si", false],
            ["Um VAE, que codifica os dados em um espaço latente e decodifica amostras", false],
        ],
    },
    {
        statement:
            "Uma equipe quer criar uma aplicação de IA generativa usando foundation models de vários provedores por meio de uma API, sem gerenciar servidores nem treinar modelos do zero. Qual serviço da AWS foi criado para esse fim?",
        explanation:
            "O Amazon Bedrock é o serviço totalmente gerenciado para criar aplicações de IA generativa: dá acesso por API a foundation models de vários provedores, com recursos como Knowledge Bases e Guardrails. O EC2 exige gerenciar a infraestrutura, o Comprehend analisa textos sem gerar conteúdo e o S3 apenas armazena dados.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Amazon Bedrock, com acesso gerenciado a foundation models de vários provedores",
                true,
            ],
            [
                "Amazon EC2, com instâncias de GPU para hospedar e treinar modelos por conta própria",
                false,
            ],
            [
                "Amazon Comprehend, com modelos prontos para análise de sentimento e de entidades",
                false,
            ],
            [
                "Amazon S3, com armazenamento durável para os conjuntos de dados de treinamento",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um treinamento interno, uma equipe discute o conceito de espaço latente de um modelo de IA generativa. Quais DUAS afirmações sobre esse espaço estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O espaço latente é a representação interna em que o modelo organiza o que aprendeu: conceitos relacionados ficam próximos, o que permite calcular a similaridade semântica entre entradas. Ele não depende de um banco de dados específico, não se limita a imagens e suas dimensões não formam uma tabela legível por pessoas.",
        topic: "IA generativa",
        options: [
            ["Representa as relações entre conceitos que o modelo aprendeu", true],
            ["Permite calcular a similaridade semântica entre entradas diferentes", true],
            ["Precisa ser guardado em um tipo específico de banco de dados", false],
            ["Existe apenas em modelos de imagem, sem uso em modelos de texto", false],
            ["É uma tabela de consulta legível, com um significado claro por dimensão", false],
        ],
    },
    {
        statement:
            "No ciclo de vida de um foundation model, uma equipe roda testes com dados que o modelo não viu no treinamento para medir a qualidade das respostas antes de liberá-lo em produção. Em qual etapa essa atividade acontece?",
        explanation:
            "Na avaliação, o modelo é testado com dados de validação ou de teste e com métricas de qualidade antes de ir para produção. O pré-treinamento cria o modelo base, o fine-tuning o adapta a uma tarefa e a implantação disponibiliza o modelo pronto para uso, e nenhuma delas é a etapa de teste.",
        topic: "IA generativa",
        options: [
            ["Avaliação", true],
            ["Pré-treinamento", false],
            ["Fine-tuning", false],
            ["Implantação", false],
        ],
    },
    {
        statement:
            "Uma equipe de ciência de dados avalia o Amazon SageMaker JumpStart para acelerar o início de um novo projeto de IA generativa. Qual é o principal benefício desse recurso?",
        explanation:
            "O SageMaker JumpStart oferece modelos pré-treinados, incluindo foundation models, além de modelos de solução e notebooks de exemplo que a equipe implanta, ajusta e avalia com poucos passos. Otimizar o custo de inferência, ajustar hiperparâmetros automaticamente e rotular dados com pessoas são funções de outros recursos do SageMaker AI.",
        topic: "Aplicações de foundation models",
        options: [
            ["Oferecer modelos pré-treinados e soluções prontas para implantar e ajustar", true],
            ["Reduzir automaticamente o custo de inferência dos endpoints já implantados", false],
            ["Ajustar sozinho os hiperparâmetros de modelos treinados pela própria equipe", false],
            [
                "Gerenciar a rotulagem de dados com uma força de trabalho humana especializada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe melhora as respostas de um assistente reescrevendo as instruções, incluindo exemplos do resultado esperado e definindo o formato da saída, sem alterar o modelo. Como se chama essa prática?",
        explanation:
            "Prompt engineering é a prática de criar e refinar o prompt, com contexto, restrições e exemplos, para guiar o modelo a respostas melhores sem mudar seus pesos. Fine-tuning altera os pesos com novos dados, quantização comprime o modelo e rotulagem de dados prepara exemplos para o treinamento supervisionado.",
        topic: "Prompt engineering",
        options: [
            ["Prompt engineering, que ajusta a entrada para guiar a saída do modelo", true],
            ["Fine-tuning, que atualiza os pesos do modelo com novos dados rotulados", false],
            ["Quantização, que comprime o modelo para executar a inferência mais rápido", false],
            ["Rotulagem de dados, que marca exemplos para o treinamento supervisionado", false],
        ],
    },
    {
        statement:
            "Um profissional de IA usa um LLM para escrever textos de marketing. O resultado soa plausível e factual, mas traz afirmações incorretas sobre o produto. Qual problema o modelo está apresentando?",
        explanation:
            "Alucinação é quando um LLM produz conteúdo que parece plausível e factual, mas é incorreto ou inventado, como no texto de marketing descrito. Vazamento de dados é a exposição indevida de informação, overfitting é decorar o treino e generalizar mal e underfitting é não captar os padrões dos dados.",
        topic: "IA generativa",
        options: [
            ["Alucinação", true],
            ["Vazamento de dados", false],
            ["Overfitting", false],
            ["Underfitting", false],
        ],
    },
    {
        statement:
            "Uma empresa tem uma aplicação que coleta reclamações de consumidores em fontes públicas e as processa com regras complexas codificadas à mão. Ela quer levar essa lógica a novos mercados e linhas de produto. Qual vantagem dos modelos de IA generativa se aplica a esse cenário?",
        explanation:
            "A adaptabilidade permite que o modelo generalize o que aprendeu para novos mercados e produtos com pouca reconfiguração, sem reescrever regras complexas. Saídas previsíveis e baixa sensibilidade a mudanças na entrada não são pontos fortes da IA generativa, que é não determinística, e a explicabilidade não resolve a expansão da lógica.",
        topic: "IA generativa",
        options: [
            ["Adaptabilidade", true],
            ["Saídas previsíveis", false],
            ["Menor sensibilidade a mudanças na entrada", false],
            ["Explicabilidade", false],
        ],
    },
    {
        statement:
            "Um profissional de IA percebe que um LLM retorna respostas diferentes cada vez que recebe exatamente a mesma entrada. Que risco da IA generativa esse comportamento descreve?",
        explanation:
            "Não determinismo é a característica de um LLM gerar respostas diferentes para a mesma entrada, por causa da amostragem aleatória na escolha dos tokens. Alucinação é produzir conteúdo falso com aparência plausível, viés algorítmico é tratar grupos de forma injusta e multimodalidade é trabalhar com vários tipos de dado.",
        topic: "IA generativa",
        options: [
            ["Não determinismo", true],
            ["Alucinação", false],
            ["Viés algorítmico", false],
            ["Multimodalidade", false],
        ],
    },
    {
        statement:
            "Uma equipe de qualidade classifica as falhas registradas em um assistente de IA generativa. Qual das situações a seguir caracteriza uma alucinação do modelo?",
        explanation:
            "Alucinação é uma saída incorreta ou inventada apresentada como fato, como citar uma norma que não existe. Mudar a redação entre chamadas é não determinismo, a resposta cortada decorre do limite máximo de tokens de saída e a recusa de um tema barrado é o funcionamento esperado dos filtros de conteúdo.",
        topic: "IA generativa",
        options: [
            ["O assistente cita uma norma com número e data que nunca existiu", true],
            ["O assistente muda a redação ao responder duas vezes à mesma pergunta", false],
            ["A resposta termina cortada ao atingir o limite de tokens de saída", false],
            ["O assistente se recusa a tratar um tema barrado pelos filtros de conteúdo", false],
        ],
    },
    {
        statement:
            "Uma diretoria avalia os riscos antes de adotar uma solução de IA generativa no atendimento ao cliente. Qual das características a seguir é uma possível desvantagem desse tipo de solução?",
        explanation:
            "A imprecisão é uma desvantagem conhecida da IA generativa: o modelo pode gerar informações incorretas, enviesadas ou inventadas, o que exige validação e supervisão humana. Adaptabilidade, rapidez nas respostas e capacidade conversacional são vantagens desse tipo de solução, e não desvantagens.",
        topic: "IA generativa",
        options: [
            ["Imprecisão das respostas", true],
            ["Adaptabilidade a novas tarefas", false],
            ["Rapidez nas respostas", false],
            ["Capacidade conversacional", false],
        ],
    },
    {
        statement:
            "Uma empresa de mídia quer usar foundation models desenvolvidos pela própria Amazon para gerar textos de marketing e resumir vídeos de campanhas. Qual opção da AWS reúne esses modelos próprios da Amazon?",
        explanation:
            "O Amazon Nova é a família de foundation models desenvolvida pela Amazon e oferecida no Amazon Bedrock, capaz de gerar texto e de entender imagens e vídeos. Rekognition analisa imagens e vídeos, Comprehend extrai informações de textos e Polly converte texto em fala, e nenhum deles é um foundation model generativo da Amazon.",
        topic: "Aplicações de foundation models",
        options: [
            ["Amazon Nova, família de foundation models criados pela Amazon", true],
            ["Amazon Rekognition, que detecta objetos e rostos em imagens e vídeos", false],
            ["Amazon Comprehend, que extrai sentimentos e entidades de textos", false],
            ["Amazon Polly, que converte textos em fala com vozes naturais", false],
        ],
    },
    {
        statement:
            "Uma equipe cria no Amazon Bedrock um assistente de suporte que precisa lembrar dados da conta citados antes na conversa, consultar artigos de ajuda relevantes e seguir as diretrizes da empresa. Que conceito descreve a gestão de todas essas informações enviadas ao foundation model a cada chamada?",
        explanation:
            "Context engineering é a prática de montar dinamicamente tudo o que o modelo recebe na inferência: instruções de sistema, histórico da conversa, documentos recuperados e resultados de ferramentas. Prompt engineering foca no texto da instrução, a destilação cria um modelo menor a partir de um maior e o pré-treinamento contínuo atualiza os pesos com novos dados.",
        topic: "Prompt engineering",
        options: [
            ["Context engineering", true],
            ["Prompt engineering", false],
            ["Destilação de modelo", false],
            ["Pré-treinamento contínuo", false],
        ],
    },
    {
        statement:
            "Uma equipe constrói agentes de IA que precisam acessar ferramentas, APIs e fontes de dados de diferentes sistemas sem criar uma integração sob medida para cada um. Qual é o papel do Model Context Protocol (MCP) nesse cenário?",
        explanation:
            "O Model Context Protocol (MCP) é um padrão aberto que define como aplicações e agentes de IA se comunicam com ferramentas, APIs e fontes de dados externas, evitando integrações sob medida. Comprimir modelos é papel de técnicas como a quantização, criptografar pesos é prática de segurança e medir acurácia em benchmarks é avaliação de modelos.",
        topic: "IA generativa",
        options: [
            ["Padronizar a conexão dos agentes com ferramentas e fontes de dados externas", true],
            [
                "Comprimir o modelo para reduzir a latência das respostas geradas pelos agentes",
                false,
            ],
            ["Criptografar os pesos do modelo durante o treinamento e o armazenamento", false],
            ["Medir a acurácia dos agentes em conjuntos de dados de benchmark públicos", false],
        ],
    },
    {
        statement:
            "Uma empresa de serviços financeiros quer que vários agentes de IA especializados colaborem em solicitações complexas de clientes: um cuida das consultas de conta, outro processa transações e um terceiro verifica a conformidade. Que conceito de IA agêntica essa arquitetura representa?",
        explanation:
            "Um sistema multiagente usa agentes especializados que se comunicam e colaboram, cada um responsável por uma capacidade, como contas, transações e conformidade. Aprendizado por reforço com agente único treina um só agente por recompensas, a classificação supervisionada atribui rótulos e a inferência em lote processa dados em massa, sem colaboração entre agentes.",
        topic: "IA generativa",
        options: [
            ["Padrão de sistema multiagente", true],
            ["Aprendizado por reforço com agente único", false],
            ["Pipeline de classificação supervisionada", false],
            ["Fluxo de inferência em lote", false],
        ],
    },
    {
        statement:
            "Um agente de IA apoia uma pesquisadora da área da saúde em várias sessões ao longo de dias e precisa recuperar as descobertas das sessões anteriores para não repetir trabalho. Qual capacidade de IA agêntica permite isso?",
        explanation:
            "O gerenciamento de memória permite que o agente guarde e recupere informações entre sessões, como as descobertas anteriores, e continue de onde parou. O uso de ferramentas chama APIs externas, a orquestração coordena a sequência de passos do agente e o pré-treinamento forma o conhecimento geral do modelo, sem lembrar as sessões de um usuário.",
        topic: "IA generativa",
        options: [
            ["Gerenciamento de memória", true],
            ["Uso de ferramentas", false],
            ["Orquestração de fluxos de trabalho", false],
            ["Pré-treinamento do modelo", false],
        ],
    },
    {
        statement:
            "Uma startup quer construir agentes de IA próprios com um SDK de código aberto que ofereça uso de ferramentas, orquestração multiagente e integração com modelos de vários provedores. Qual opção da AWS atende a esse requisito?",
        explanation:
            "O Strands Agents é um SDK de código aberto lançado pela AWS, para Python e TypeScript, que cria agentes com uso de ferramentas, padrões multiagente, suporte a MCP e modelos de vários provedores. O Lex cria bots de conversa, o AWS Transform é um serviço agêntico que moderniza aplicações e o Personalize gera recomendações, e nenhum deles é um SDK de agentes.",
        topic: "Aplicações de foundation models",
        options: [
            ["Strands Agents", true],
            ["AWS Transform", false],
            ["Amazon Lex", false],
            ["Amazon Personalize", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma infraestrutura gerenciada para implantar, escalar e monitorar seus agentes de IA em produção, sem cuidar da computação e da rede subjacentes. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Bedrock AgentCore oferece infraestrutura gerenciada para executar agentes em produção, com runtime serverless, memória, identidade, gateway de ferramentas e observabilidade, com qualquer framework e modelo. O SageMaker Canvas cria modelos de ML sem código, o Bedrock Knowledge Bases implementa RAG e o Comprehend analisa textos.",
        topic: "Aplicações de foundation models",
        options: [
            ["Amazon Bedrock AgentCore", true],
            ["Amazon SageMaker Canvas", false],
            ["Amazon Bedrock Knowledge Bases", false],
            ["Amazon Comprehend", false],
        ],
    },
    {
        statement:
            "Uma agência de viagens cria um agente de IA que pesquisa voos disponíveis, reserva passagens e processa pagamentos chamando as APIs da companhia aérea. Qual capacidade de IA agêntica permite que o agente interaja com esses sistemas externos?",
        explanation:
            "O uso de ferramentas permite que o agente chame APIs, serviços e sistemas externos para buscar informações e executar ações, como consultar voos, reservar e pagar. O gerenciamento de memória guarda informações entre interações, o fine-tuning altera os pesos no treinamento e o cache de prompts reaproveita trechos repetidos para reduzir custo e latência.",
        topic: "IA generativa",
        options: [
            ["Uso de ferramentas", true],
            ["Gerenciamento de memória", false],
            ["Fine-tuning do modelo", false],
            ["Cache de prompts", false],
        ],
    },
    {
        statement:
            "Uma empresa usa o Amazon Bedrock em um chatbot de suporte e percebe que os custos estão subindo. A equipe descobre que o histórico completo da conversa é incluído em todo prompt. Qual aspecto do modelo de preços por token explica esse aumento?",
        explanation:
            "No preço por token, cada requisição é cobrada pelos tokens de entrada e de saída. Enviar o histórico completo em todo prompt aumenta os tokens de entrada a cada chamada e eleva o custo. O Bedrock sob demanda não cobra valor fixo por chamada, nem por tempo de processamento ou pelo número de usuários simultâneos.",
        topic: "IA generativa",
        options: [
            [
                "O custo cresce com os tokens de entrada e de saída processados em cada chamada",
                true,
            ],
            [
                "O custo é fixo por chamada de API, sem relação com o tamanho do conteúdo enviado",
                false,
            ],
            [
                "O custo depende do tempo que o modelo leva para processar cada uma das chamadas",
                false,
            ],
            [
                "O custo varia conforme o número de usuários conectados ao chatbot ao mesmo tempo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer reduzir o custo de um aplicativo que gera resumos com um foundation model. Hoje muitas respostas chegam ao limite máximo de tokens de saída, e a equipe decide diminuir esse limite em cada chamada. Qual é o efeito esperado dessa mudança sobre o custo e o desempenho?",
        explanation:
            "Com preço por token, as respostas que chegavam ao limite antigo passam a gerar menos tokens de saída, o que reduz o custo e costuma encurtar o tempo de resposta; se o limite ficar baixo demais, o resumo sai cortado. Menos tokens não aumenta o custo, a mudança tem efeito e gerar menos texto não deixa a resposta mais lenta.",
        topic: "IA generativa",
        options: [
            ["Reduz o custo e pode encurtar o tempo de resposta", true],
            ["Aumenta o custo por token e não muda o tempo de resposta", false],
            ["Não muda o custo cobrado nem o tempo de resposta", false],
            ["Reduz o custo, mas deixa as respostas mais lentas", false],
        ],
    },
    {
        statement:
            "Uma startup sem infraestrutura de ML quer lançar rapidamente um recurso de IA generativa. Qual vantagem de usar serviços de IA generativa da AWS, como o Amazon Bedrock, é a mais relevante nesse caso?",
        explanation:
            "Serviços como o Amazon Bedrock dão acesso por API a foundation models pré-treinados, com a infraestrutura gerenciada pela AWS, o que reduz a barreira de entrada e acelera o lançamento. Eles não garantem respostas sempre corretas, ainda exigem código para integrar a aplicação e são cobrados conforme o uso, sem gratuidade ilimitada.",
        topic: "Aplicações de foundation models",
        options: [
            ["Reduzir a barreira de entrada com acesso gerenciado a modelos pré-treinados", true],
            [
                "Garantir respostas sempre corretas, sem necessidade de validar as saídas do modelo",
                false,
            ],
            ["Dispensar qualquer código, já que o serviço cria a aplicação inteira sozinho", false],
            [
                "Oferecer uso gratuito e ilimitado dos modelos durante o lançamento do produto",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de saúde avalia construir sua aplicação de IA generativa na AWS. Para esse setor regulado, qual benefício da infraestrutura da AWS é o mais importante?",
        explanation:
            "Setores regulados, como saúde, precisam dos controles de segurança, das certificações e programas de conformidade (como a elegibilidade HIPAA) e dos recursos de proteção de dados da AWS. Nenhum provedor garante a menor latência em todo lugar, nenhum modelo está livre de erros e a empresa continua responsável pela própria governança de dados.",
        topic: "Segurança e governança",
        options: [
            ["Controles de segurança, certificações de conformidade e proteção de dados", true],
            ["A menor latência de inferência possível em todas as regiões do mundo", false],
            ["A garantia de que os modelos de IA nunca produzem saídas incorretas", false],
            [
                "O fim da necessidade de a empresa manter políticas próprias de governança de dados",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma varejista implantou um chatbot de IA generativa há seis meses e quer medir o valor de negócio dele. Qual métrica indica melhor o impacto do chatbot na receita?",
        explanation:
            "A receita média por usuário (ARPU) mede quanto cada cliente gera de receita; acompanhar sua evolução depois do chatbot mostra o impacto dele no faturamento. O número de parâmetros descreve o tamanho do modelo, as épocas são configuração de treinamento e a latência mede a velocidade das respostas, sem relação direta com a receita.",
        topic: "Aplicações de foundation models",
        options: [
            ["Receita média por usuário (ARPU)", true],
            ["Número de parâmetros do modelo", false],
            ["Quantidade de épocas de treinamento", false],
            ["Latência de inferência", false],
        ],
    },
    {
        statement:
            "Uma empresa usa um assistente de IA generativa para apoiar a equipe de suporte e quer medir os ganhos de eficiência operacional. Qual métrica ela deve acompanhar?",
        explanation:
            "A redução do tempo médio de atendimento por chamado mostra quanto mais rápido a equipe resolve os casos com o apoio do assistente, um ganho direto de eficiência operacional. ROUGE e BERTScore medem a qualidade do texto gerado em relação a referências e a perplexidade mede o ajuste do modelo à linguagem, e nenhuma delas mede eficiência.",
        topic: "Aplicações de foundation models",
        options: [
            ["Redução do tempo médio de atendimento por chamado", true],
            ["Pontuação ROUGE dos resumos gerados pelo assistente", false],
            ["BERTScore das respostas em relação a textos de referência", false],
            ["Perplexidade do modelo de linguagem usado no assistente", false],
        ],
    },
    {
        statement:
            "Uma equipe vai criar um foundation model e, antes de qualquer treinamento, precisa escolher as fontes de dados adequadas e prepará-las. Qual etapa do ciclo de vida do modelo envolve essa atividade?",
        explanation:
            "A seleção de dados é a primeira etapa do ciclo de vida de um foundation model: identificar e curar as fontes de dados antes do pré-treinamento, já que a qualidade e a amplitude desses dados moldam o que o modelo aprende. A implantação, a avaliação e a coleta de feedback acontecem depois que o modelo já foi treinado.",
        topic: "IA generativa",
        options: [
            ["Seleção de dados", true],
            ["Implantação do modelo", false],
            ["Avaliação do modelo", false],
            ["Coleta de feedback", false],
        ],
    },
    {
        statement:
            "Uma empresa investiu em uma solução de IA generativa para automatizar a redação de relatórios. Qual métrica mede melhor se esse investimento gerou valor financeiro?",
        explanation:
            "O retorno sobre o investimento (ROI) compara os benefícios financeiros da solução, como horas economizadas e mais produtividade, com o custo de construí-la e operá-la, mostrando se o investimento valeu a pena. A acurácia mede a qualidade das previsões, e o número de parâmetros e o volume de dados são detalhes técnicos sem relação com retorno.",
        topic: "Aplicações de foundation models",
        options: [
            ["Retorno sobre o investimento (ROI)", true],
            ["Acurácia do modelo", false],
            ["Número de parâmetros do modelo", false],
            ["Volume de dados usados no treinamento", false],
        ],
    },
];
