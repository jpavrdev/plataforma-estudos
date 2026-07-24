// Seed da trilha AWS Certified AI Practitioner (AIF-C01). Conteúdo autoral,
// escrito para ensinar os 5 domínios do exame. Idempotente e não destrutivo:
// se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-aif-c01.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AWS AI Practitioner";
const DESCRICAO =
    "Trilha de fundamentos de inteligência artificial na AWS para a certificação AI Practitioner (AIF-C01): conceitos de IA e machine learning, IA generativa e foundation models, engenharia de prompt e RAG, IA responsável e segurança, conformidade e governança de soluções de IA.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Fundamentos de IA e machine learning",
    aulas: [
        {
            titulo: "IA, machine learning e deep learning",
            blocks: [
                {
                    type: "text",
                    value: "## Três termos que se encaixam\nO exame AIF-C01 começa exigindo clareza sobre três palavras que muita gente usa como sinônimo, mas que têm uma relação de encaixe.\n\n**Inteligência artificial (IA)** é o campo mais amplo: qualquer técnica que faça um computador imitar capacidades associadas à inteligência humana, como entender linguagem, reconhecer imagens ou tomar decisões. Um sistema de regras escritas à mão já pode ser considerado IA.\n\n**Machine learning (ML)** é um subconjunto da IA no qual o sistema aprende padrões a partir de dados, em vez de seguir apenas regras fixas. Você não programa a resposta; você mostra exemplos e o algoritmo descobre a regra.\n\n**Deep learning** é um subconjunto do ML baseado em redes neurais com muitas camadas. É o que sustenta avanços recentes em visão, linguagem e IA generativa.",
                },
                {
                    type: "quote",
                    value: "A hierarquia cai direto na prova: IA contém machine learning, que por sua vez contém deep learning.",
                },
                {
                    type: "text",
                    value: "## Por que a distinção importa\nSaber quem contém quem evita as pegadinhas mais comuns do exame, do tipo \"deep learning engloba a IA\" (falso) ou \"IA é um caso particular de ML\" (falso). O caminho é sempre do mais geral para o mais específico: IA, depois ML, depois deep learning.\n\nNa prática, quando um cenário fala em aprender a partir de dados, você está no território do machine learning. Quando fala especificamente em redes neurais profundas para imagem, som ou texto livre, é deep learning.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual afirmação descreve corretamente a relação entre inteligência artificial, machine learning e deep learning?",
                    difficulty: "facil",
                    options: [
                        { text: "ML é um subconjunto da IA, e deep learning é um subconjunto do ML", isCorrect: true },
                        { text: "Deep learning contém o machine learning, que contém a IA", isCorrect: false },
                        { text: "IA e machine learning são áreas separadas, sem sobreposição", isCorrect: false },
                        { text: "Machine learning é mais amplo do que a inteligência artificial", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um sistema aprende a identificar gatos em fotos a partir de milhares de exemplos rotulados, sem regras escritas à mão. Esse sistema é melhor descrito como:",
                    difficulty: "facil",
                    options: [
                        { text: "Machine learning, pois aprende padrões a partir de dados", isCorrect: true },
                        { text: "Um sistema de regras fixas escritas manualmente", isCorrect: false },
                        { text: "Uma planilha com fórmulas determinísticas", isCorrect: false },
                        { text: "Um banco de dados relacional consultado por SQL", isCorrect: false },
                    ],
                },
                {
                    statement: "Deep learning se distingue de outras técnicas de machine learning principalmente por:",
                    difficulty: "medio",
                    options: [
                        { text: "Usar redes neurais com muitas camadas para aprender padrões complexos", isCorrect: true },
                        { text: "Dispensar completamente qualquer tipo de dado de treino", isCorrect: false },
                        { text: "Funcionar apenas com regras lógicas escritas por especialistas", isCorrect: false },
                        { text: "Ser incapaz de lidar com imagens, áudio ou texto livre", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Tipos de aprendizado: supervisionado, não supervisionado e por reforço",
            blocks: [
                {
                    type: "text",
                    value: "## Três formas de aprender\nO machine learning se organiza em famílias, e o AIF-C01 cobra que você reconheça qual se aplica a um cenário.\n\n**Aprendizado supervisionado** treina com dados que já têm a resposta certa (o rótulo). O modelo aprende a mapear entradas para saídas conhecidas. Exemplo: prever se um e-mail é spam usando milhares de e-mails já marcados como spam ou não.\n\n**Aprendizado não supervisionado** trabalha com dados sem rótulos e busca estrutura escondida, como agrupar itens parecidos. Exemplo: segmentar clientes em grupos de comportamento sem categorias pré-definidas.\n\n**Aprendizado por reforço** aprende por tentativa e erro: um agente toma ações, recebe recompensas ou penalidades e ajusta a estratégia para maximizar a recompensa ao longo do tempo. Exemplo: um sistema que aprende a jogar ou a controlar um robô.",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Usa rótulos?\", \"O que busca\", \"Exemplo\"], [\"Supervisionado\", \"Sim\", \"Prever uma saída conhecida\", \"Detectar fraude com transações rotuladas\"], [\"Não supervisionado\", \"Não\", \"Achar grupos ou padrões\", \"Segmentar clientes por comportamento\"], [\"Por reforço\", \"Não (usa recompensas)\", \"Maximizar recompensa por tentativa e erro\", \"Controlar um robô ou jogar\"]]",
                },
                {
                    type: "text",
                    value: "## Como decidir no cenário\nProcure a palavra-chave. Se o enunciado menciona dados já rotulados ou uma resposta certa conhecida, é supervisionado. Se fala em descobrir grupos ou padrões sem categorias prontas, é não supervisionado. Se descreve um agente que age, recebe recompensa e melhora com o tempo, é por reforço.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma operadora quer prever cancelamento de clientes usando um histórico em que cada cliente já está marcado como 'cancelou' ou 'permaneceu'. Que tipo de aprendizado é esse?",
                    difficulty: "facil",
                    options: [
                        { text: "Supervisionado, porque os dados já têm o rótulo a prever", isCorrect: true },
                        { text: "Não supervisionado, porque agrupa clientes sem rótulos", isCorrect: false },
                        { text: "Por reforço, porque recebe recompensas a cada acerto", isCorrect: false },
                        { text: "Nenhum, porque previsão não usa machine learning", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma equipe tem um grande conjunto de artigos sem categorias e quer que o sistema descubra sozinho grupos de temas semelhantes. Que abordagem se aplica?",
                    difficulty: "facil",
                    options: [
                        { text: "Aprendizado não supervisionado, que encontra grupos sem rótulos", isCorrect: true },
                        { text: "Aprendizado supervisionado, que exige rótulos definidos antes", isCorrect: false },
                        { text: "Aprendizado por reforço, que depende de um sistema de recompensas", isCorrect: false },
                        { text: "Programação de regras fixas para cada tema possível", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual cenário caracteriza aprendizado por reforço?",
                    difficulty: "medio",
                    options: [
                        { text: "Um agente que age, recebe recompensas e ajusta a estratégia ao longo do tempo", isCorrect: true },
                        { text: "Um modelo treinado uma única vez com exemplos já rotulados de antemão", isCorrect: false },
                        { text: "Um algoritmo que apenas agrupa dados semelhantes entre si, sem rótulos", isCorrect: false },
                        { text: "Uma consulta que retorna registros já prontos de um banco de dados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Classificação, regressão e clustering",
            blocks: [
                {
                    type: "text",
                    value: "## O tipo de saída define o tipo de problema\nAlém de como o modelo aprende, o exame cobra que tipo de problema ele resolve. A pista é sempre o que se quer na saída.\n\n**Classificação** prevê uma categoria discreta: spam ou não spam, fraude ou legítima, aprovado ou reprovado. As classes são conhecidas de antemão.\n\n**Regressão** prevê um valor numérico contínuo: o preço de um imóvel, a temperatura de amanhã, a demanda da próxima semana.\n\n**Clustering** (agrupamento) não prevê nada dado de antemão: ele descobre grupos naturais nos dados. É a técnica não supervisionada mais cobrada.",
                },
                {
                    type: "quote",
                    value: "Saída é categoria conhecida, é classificação; saída é número contínuo, é regressão; achar grupos sem rótulo, é clustering.",
                },
                {
                    type: "text",
                    value: "## Quando ML não é a resposta\nUm ponto sutil que a prova adora: nem todo problema pede machine learning. Se as regras são fixas, determinísticas e bem definidas (calcular um imposto pela lei, aplicar um desconto de tabela), o certo é programar a lógica, não treinar um modelo. Machine learning vale a pena quando os padrões são complexos, mudam com o tempo ou são difíceis de descrever em regras explícitas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma loja quer prever quantas unidades de um produto venderá na próxima semana (um número). Que tipo de problema de ML é esse?",
                    difficulty: "facil",
                    options: [
                        { text: "Regressão, pois a saída é um valor numérico contínuo", isCorrect: true },
                        { text: "Classificação, pois a saída é uma categoria discreta", isCorrect: false },
                        { text: "Clustering, pois agrupa produtos semelhantes", isCorrect: false },
                        { text: "Reforço, pois aprende por recompensa e punição", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Decidir se um e-mail recebido é 'spam' ou 'não spam' é um exemplo de qual tipo de problema?",
                    difficulty: "facil",
                    options: [
                        { text: "Classificação, pois prevê uma categoria conhecida", isCorrect: true },
                        { text: "Regressão, pois prevê um número contínuo", isCorrect: false },
                        { text: "Clustering, pois descobre grupos sem rótulos", isCorrect: false },
                        { text: "Redução de dimensionalidade, pois resume variáveis", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Em qual situação usar machine learning é a escolha MENOS apropriada?",
                    difficulty: "medio",
                    options: [
                        { text: "Calcular um imposto por regras fixas e determinísticas da lei", isCorrect: true },
                        { text: "Prever a demanda de produtos a partir de padrões históricos", isCorrect: false },
                        { text: "Recomendar conteúdos com base no comportamento do usuário", isCorrect: false },
                        { text: "Classificar avaliações de clientes entre positivas e negativas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O ciclo de vida de ML e a importância dos dados",
            blocks: [
                {
                    type: "text",
                    value: "## Do problema ao modelo em produção\nUm projeto de machine learning segue um ciclo que o AIF-C01 espera que você reconheça em alto nível:\n\n1. **Enquadrar o problema**: definir o que se quer prever e como o sucesso será medido.\n2. **Coletar e preparar os dados**: reunir, limpar e transformar os dados; criar variáveis (features).\n3. **Treinar o modelo**: o algoritmo ajusta seus parâmetros a partir dos dados de treino.\n4. **Avaliar**: medir o desempenho em dados que o modelo não viu no treino.\n5. **Implantar (deploy)**: colocar o modelo para servir previsões (inferência) em produção.\n6. **Monitorar**: acompanhar a qualidade ao longo do tempo e retreinar quando necessário.",
                },
                {
                    type: "text",
                    value: "## Vocabulário essencial\n**Feature (atributo)** é cada variável de entrada usada para prever, como área e localização de um imóvel. **Rótulo (label)** é a resposta que se quer prever, como o preço. **Treino** é o ajuste dos parâmetros com os dados; **inferência** é usar o modelo já treinado para prever sobre dados novos.\n\nGuarde a diferença entre treino e inferência: treinar acontece uma vez (ou periodicamente) e é custoso; inferir acontece o tempo todo em produção, a cada previsão pedida.",
                },
                {
                    type: "quote",
                    value: "Dados ruins geram modelos ruins. Nem um modelo maior nem mais dados compensam informação errada ou enviesada: qualidade de dados é decisiva.",
                },
            ],
            questions: [
                {
                    statement: "No vocabulário de ML supervisionado, o que é um 'rótulo' (label)?",
                    difficulty: "facil",
                    options: [
                        { text: "A resposta que se deseja prever, associada a cada exemplo", isCorrect: true },
                        { text: "Cada variável de entrada usada para fazer a previsão", isCorrect: false },
                        { text: "O parâmetro interno ajustado durante o treino", isCorrect: false },
                        { text: "A métrica que avalia o modelo no conjunto de teste", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Usar um modelo já treinado para gerar previsões sobre dados novos em produção é chamado de:",
                    difficulty: "facil",
                    options: [
                        { text: "Inferência", isCorrect: true },
                        { text: "Treinamento", isCorrect: false },
                        { text: "Rotulagem", isCorrect: false },
                        { text: "Coleta de dados", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma equipe teve um modelo com desempenho fraco e descobriu muitos valores errados e faltantes no conjunto de treino. Que princípio isso reforça?",
                    difficulty: "medio",
                    options: [
                        { text: "A qualidade dos dados influencia fortemente a qualidade do modelo", isCorrect: true },
                        { text: "Um modelo maior compensa automaticamente dados ruins", isCorrect: false },
                        { text: "O algoritmo escolhido não afeta o resultado com muitos dados", isCorrect: false },
                        { text: "Os dados de teste importam mais do que os de treino", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Avaliando modelos: acurácia, precisão, recall e overfitting",
            blocks: [
                {
                    type: "text",
                    value: "## Métricas para saber se o modelo é bom\nAvaliar é comparar as previsões do modelo com as respostas reais em dados que ele não viu no treino. Para classificação, algumas métricas caem no exame:\n\n**Acurácia** é a fração de previsões corretas no total. Simples, mas enganosa quando as classes são desbalanceadas.\n\n**Precisão** responde: dos casos que o modelo marcou como positivos, quantos eram mesmo positivos? Alta precisão significa poucos falsos positivos.\n\n**Recall (sensibilidade)** responde: dos casos que eram realmente positivos, quantos o modelo capturou? Alto recall significa poucos falsos negativos.",
                },
                {
                    type: "text",
                    value: "## Precisão x recall: o trade-off\nQual priorizar depende do custo do erro. Numa triagem médica, deixar passar um doente (falso negativo) é grave, então prioriza-se o recall. Num filtro que bloqueia e-mails, marcar um e-mail legítimo como spam (falso positivo) incomoda o usuário, então a precisão pesa mais. Raramente se maximiza as duas ao mesmo tempo.",
                },
                {
                    type: "text",
                    value: "## Overfitting e underfitting\n**Overfitting** acontece quando o modelo vai muito bem no treino e mal em dados novos: ele memorizou em vez de generalizar. A assinatura é acurácia alta no treino e baixa no teste. **Underfitting** é o oposto: o modelo é simples demais e vai mal nos dois conjuntos. O objetivo é o meio-termo, um modelo que generaliza para dados que nunca viu.",
                },
                {
                    type: "quote",
                    value: "Foi bem no treino e mal no teste? Overfitting. Foi mal nos dois? Underfitting.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um modelo tem 99% de acurácia no treino e 60% no teste. Qual é o diagnóstico mais provável?",
                    difficulty: "facil",
                    options: [
                        { text: "Overfitting: o modelo memorizou o treino e não generaliza", isCorrect: true },
                        { text: "Underfitting: o modelo é simples demais para os dados", isCorrect: false },
                        { text: "O modelo está perfeito e pronto para produção", isCorrect: false },
                        { text: "Falta de dados, pois o modelo não aprendeu no treino", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma triagem médica deve evitar ao máximo classificar um paciente doente como saudável. Qual métrica priorizar?",
                    difficulty: "medio",
                    options: [
                        { text: "Recall, para reduzir os falsos negativos", isCorrect: true },
                        { text: "Precisão, para reduzir os falsos positivos", isCorrect: false },
                        { text: "Tempo de treino, para acelerar o modelo", isCorrect: false },
                        { text: "Tamanho do modelo, para caber em memória", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a acurácia pode enganar em um conjunto de dados muito desbalanceado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Prever sempre a classe majoritária dá acurácia alta sem prever a rara", isCorrect: true },
                        { text: "A acurácia é impossível de calcular quando há desbalanceamento", isCorrect: false },
                        { text: "A acurácia sempre fica igual ao recall nesses casos", isCorrect: false },
                        { text: "Dados desbalanceados aumentam a acurácia de forma proporcional e justa", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Os serviços de IA e ML da AWS",
            blocks: [
                {
                    type: "text",
                    value: "## Três camadas de serviços\nA AWS organiza a IA em camadas, e reconhecer a camada certa para cada cenário é um dos temas mais cobrados no AIF-C01.\n\n**Serviços de IA pré-treinados** entregam capacidades prontas por API, sem treinar nada. Você chama e usa. Exemplos: Amazon Rekognition (imagens e vídeo), Amazon Transcribe (fala para texto), Amazon Polly (texto para voz), Amazon Translate (tradução), Amazon Comprehend (análise de texto e PII), Amazon Textract (extração de documentos) e Amazon Lex (chatbots).\n\n**Amazon SageMaker** é a plataforma para quem quer construir, treinar e implantar modelos próprios, com controle total. Inclui o SageMaker Canvas (ML visual, sem código) para usuários de negócio.\n\n**Serviços de IA generativa**, como o Amazon Bedrock e o Amazon Q, são vistos nos próximos módulos.",
                },
                {
                    type: "table",
                    value: "[[\"Preciso...\", \"Serviço da AWS\"], [\"Transcrever áudio em texto\", \"Amazon Transcribe\"], [\"Converter texto em voz\", \"Amazon Polly\"], [\"Analisar imagens e vídeos\", \"Amazon Rekognition\"], [\"Extrair sentimento e entidades de texto\", \"Amazon Comprehend\"], [\"Ler campos de documentos e formulários\", \"Amazon Textract\"], [\"Traduzir entre idiomas\", \"Amazon Translate\"], [\"Construir um chatbot\", \"Amazon Lex\"], [\"Treinar um modelo próprio\", \"Amazon SageMaker\"], [\"Criar ML sem escrever código\", \"Amazon SageMaker Canvas\"]]",
                },
                {
                    type: "text",
                    value: "## Pré-treinado ou construir do zero?\nA regra prática: se um serviço pronto já resolve (transcrever, traduzir, analisar texto), use-o, é mais rápido e barato. Só parta para o SageMaker quando precisar de um modelo customizado para um problema específico da empresa, com dados próprios e controle sobre o algoritmo.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma startup precisa transcrever áudios de reuniões em texto rapidamente, sem treinar nenhum modelo. Qual serviço usar?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon Transcribe, um serviço pronto de fala para texto", isCorrect: true },
                        { text: "Amazon SageMaker, treinando um modelo próprio", isCorrect: false },
                        { text: "Amazon Polly, que gera voz a partir de texto", isCorrect: false },
                        { text: "Amazon Comprehend, que analisa texto já escrito", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um analista de negócios sem experiência em código quer criar modelos de ML por uma interface visual. Qual ferramenta é a mais indicada?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon SageMaker Canvas, que oferece ML sem código", isCorrect: true },
                        { text: "AWS Lambda, para executar funções sob demanda", isCorrect: false },
                        { text: "Amazon EMR, uma plataforma de big data com Spark", isCorrect: false },
                        { text: "Amazon Athena, para consultas SQL no S3", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer extrair automaticamente o valor e a data de vencimento de milhares de faturas em PDF. Qual serviço é o mais adequado?",
                    difficulty: "medio",
                    options: [
                        { text: "Amazon Textract, que extrai texto e campos de documentos", isCorrect: true },
                        { text: "Amazon Polly, que converte texto em voz", isCorrect: false },
                        { text: "Amazon Translate, que traduz entre idiomas", isCorrect: false },
                        { text: "Amazon Rekognition, voltado a imagens e vídeos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - IA generativa e foundation models",
    aulas: [
        {
            titulo: "O que é IA generativa e o que são foundation models",
            blocks: [
                {
                    type: "text",
                    value: "## Da previsão à criação\nO machine learning tradicional prevê ou classifica: dado um e-mail, é spam ou não? A **IA generativa** faz algo diferente: cria conteúdo novo e original, como texto, imagem, código ou áudio, a partir de uma instrução em linguagem natural.\n\nO motor por trás disso é o **foundation model (modelo de fundação)**: um modelo grande, pré-treinado em volumes enormes de dados, que serve de base para muitas tarefas diferentes. Em vez de treinar um modelo por tarefa, você parte de um foundation model já pronto e o adapta.",
                },
                {
                    type: "text",
                    value: "## O que torna um foundation model especial\nDuas características definem um foundation model:\n\n**Escala e pré-treinamento**: ele aprendeu padrões gerais a partir de uma quantidade massiva de dados, o que lhe dá conhecimento amplo sem ter sido treinado para uma tarefa específica.\n\n**Adaptabilidade**: o mesmo modelo consegue resumir, traduzir, responder perguntas, escrever código e classificar, dependendo de como você o instrui. Um **large language model (LLM)** é um foundation model especializado em linguagem.",
                },
                {
                    type: "quote",
                    value: "Foundation model é grande, pré-treinado em vastos dados e adaptável a muitas tarefas. Não é um modelo de tarefa única nem um banco de dados.",
                },
            ],
            questions: [
                {
                    statement: "O que melhor caracteriza um foundation model?",
                    difficulty: "facil",
                    options: [
                        { text: "Um modelo grande, pré-treinado, que serve de base para muitas tarefas", isCorrect: true },
                        { text: "Um modelo pequeno treinado do zero para uma única tarefa", isCorrect: false },
                        { text: "Um banco de dados vetorial que guarda embeddings", isCorrect: false },
                        { text: "Uma regra determinística que não depende de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tarefa é um caso de uso típico de IA generativa?",
                    difficulty: "facil",
                    options: [
                        { text: "Gerar o rascunho de um texto a partir de uma instrução", isCorrect: true },
                        { text: "Somar uma coluna de uma planilha com precisão exata", isCorrect: false },
                        { text: "Rotear pacotes de rede entre sub-redes", isCorrect: false },
                        { text: "Aplicar políticas de permissão de acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "Um large language model (LLM) é melhor descrito como:",
                    difficulty: "medio",
                    options: [
                        { text: "Um foundation model especializado em linguagem", isCorrect: true },
                        { text: "Um banco de dados relacional otimizado para texto", isCorrect: false },
                        { text: "Um serviço de tradução baseado em regras manuais", isCorrect: false },
                        { text: "Um algoritmo de clustering para agrupar documentos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Como um LLM funciona: tokens, embeddings e janela de contexto",
            blocks: [
                {
                    type: "text",
                    value: "## Tokens: a unidade que o modelo processa\nUm LLM não lê letras nem palavras inteiras diretamente; ele processa **tokens**, unidades de texto que podem ser uma palavra ou parte dela. Uma frase vira uma sequência de tokens, e o modelo prevê o próximo token a cada passo. O custo e os limites de uso costumam ser medidos em tokens, então vale ter o conceito claro.",
                },
                {
                    type: "text",
                    value: "## Embeddings: significado virou número\nPara comparar textos por significado, converte-se cada trecho em um **embedding**: uma representação numérica em forma de vetor que captura o sentido do conteúdo. Textos com significado parecido ficam próximos nesse espaço vetorial. Embeddings são a base da busca semântica e do RAG, que veremos no próximo módulo.",
                },
                {
                    type: "text",
                    value: "## Janela de contexto: o quanto o modelo enxerga\nA **janela de contexto (context window)** é a quantidade máxima de tokens que o modelo considera de uma vez, somando a entrada e a saída. Se a conversa ou o documento excede a janela, o excesso precisa ser resumido ou recuperado sob demanda. Janelas maiores permitem processar mais texto por interação, geralmente a um custo maior.",
                },
                {
                    type: "quote",
                    value: "Token é a unidade de texto processada; embedding é o significado em forma de vetor; janela de contexto é o limite de tokens por interação.",
                },
            ],
            questions: [
                {
                    statement: "No contexto de um LLM, o que é um token?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma unidade de texto (palavra ou parte dela) que o modelo processa", isCorrect: true },
                        { text: "Uma credencial de segurança que autoriza o acesso à API", isCorrect: false },
                        { text: "Um parâmetro interno que o modelo ajusta durante o treino", isCorrect: false },
                        { text: "Um registro de log gerado a cada requisição ao modelo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o papel de um embedding?",
                    difficulty: "medio",
                    options: [
                        { text: "Representar o significado de um texto como um vetor numérico", isCorrect: true },
                        { text: "Gerar um resumo em linguagem natural do texto", isCorrect: false },
                        { text: "Criptografar o documento antes de armazená-lo", isCorrect: false },
                        { text: "Indexar palavras-chave em um banco relacional", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a 'janela de contexto' de um LLM representa?",
                    difficulty: "medio",
                    options: [
                        { text: "O máximo de tokens que o modelo considera em uma interação", isCorrect: true },
                        { text: "O número de usuários simultâneos permitidos", isCorrect: false },
                        { text: "O tempo em que a resposta fica em cache", isCorrect: false },
                        { text: "A região de nuvem onde o modelo roda", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Amazon Bedrock: foundation models por API",
            blocks: [
                {
                    type: "text",
                    value: "## Um só ponto de acesso a vários modelos\nO **Amazon Bedrock** é o serviço da AWS para IA generativa. Ele dá acesso a foundation models de diversos provedores por uma única API totalmente gerenciada. Você escolhe o modelo, envia um prompt e recebe a resposta, sem provisionar servidores nem gerenciar GPUs.\n\nPor ser **serverless**, o Bedrock deixa a AWS cuidar da infraestrutura. Isso permite que uma equipe pequena experimente e compare modelos rapidamente e leve uma aplicação generativa à produção sem operar a parte pesada.",
                },
                {
                    type: "table",
                    value: "[[\"Quero...\", \"Como o Bedrock ajuda\"], [\"Usar vários foundation models\", \"Uma API única para modelos de diferentes provedores\"], [\"Não gerenciar servidores\", \"Serviço serverless, infraestrutura gerenciada pela AWS\"], [\"Embasar respostas em dados meus\", \"Knowledge Bases (RAG gerenciado)\"], [\"Executar tarefas em várias etapas\", \"Agents (orquestração de ações)\"], [\"Filtrar conteúdo indesejado\", \"Guardrails\"], [\"Comparar a qualidade de modelos\", \"Avaliação de modelos (model evaluation)\"]]",
                },
                {
                    type: "text",
                    value: "## O que o Bedrock NÃO exige\nUm ponto que a prova reforça: no Bedrock você não precisa baixar os pesos dos modelos, não precisa manter um cluster de GPUs próprio e não precisa treinar nada do zero para começar. O foco é consumir os modelos por API e, quando necessário, customizá-los com recursos gerenciados.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual serviço permite acessar foundation models de vários provedores por uma única API gerenciada, sem administrar infraestrutura?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon Bedrock", isCorrect: true },
                        { text: "Amazon EC2", isCorrect: false },
                        { text: "Amazon S3", isCorrect: false },
                        { text: "AWS Glue", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma equipe pequena quer testar vários foundation models sem provisionar GPUs. Que característica do Bedrock ajuda?",
                    difficulty: "facil",
                    options: [
                        { text: "É serverless: a AWS gerencia a infraestrutura dos modelos", isCorrect: true },
                        { text: "Exige um cluster de GPUs dedicado por modelo testado", isCorrect: false },
                        { text: "Requer baixar os pesos e hospedá-los por conta própria", isCorrect: false },
                        { text: "Só funciona com modelos treinados do zero pela equipe", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Para usar o Amazon Bedrock em uma aplicação generativa básica, o que NÃO é necessário?",
                    difficulty: "medio",
                    options: [
                        { text: "Manter um cluster de GPUs próprio para hospedar os modelos", isCorrect: true },
                        { text: "Escolher um foundation model disponível no serviço", isCorrect: false },
                        { text: "Enviar um prompt para o modelo pela API", isCorrect: false },
                        { text: "Ter permissões adequadas de acesso ao serviço", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Casos de uso, vantagens e desafios da IA generativa",
            blocks: [
                {
                    type: "text",
                    value: "## Onde a IA generativa brilha\nBons casos de uso envolvem criar ou transformar conteúdo em linguagem natural: gerar rascunhos de texto, resumir documentos longos, responder perguntas, escrever e explicar código, traduzir com nuance e criar imagens a partir de descrições. O ponto comum é lidar com conteúdo aberto e não estruturado.",
                },
                {
                    type: "text",
                    value: "## Vantagens sobre treinar do zero\nUsar foundation models poupa tempo e dados: você aproveita um modelo já pré-treinado e o adapta a muitas tarefas com pouco esforço, em vez de coletar dados e treinar um modelo por problema. Isso acelera protótipos e reduz a barreira de entrada.",
                },
                {
                    type: "text",
                    value: "## Desafios que a prova cobra\nA IA generativa também traz desafios que precisam de controles:\n\n- **Respostas variáveis e imprecisas**: a mesma pergunta pode gerar respostas diferentes, e algumas podem conter erros. Isso exige verificação.\n- **Alucinações**: o modelo pode inventar informação plausível, porém falsa.\n- **Custo e latência**: modelos maiores custam e demoram mais.\n- **Segurança do conteúdo**: sem controles, o modelo pode gerar conteúdo indesejado.\n\nO que a IA generativa NÃO deve fazer: cálculos exatos, regras determinísticas ou operações que exigem reprodutibilidade perfeita. Para isso, use lógica tradicional.",
                },
                {
                    type: "quote",
                    value: "Conteúdo aberto (texto, código, imagem, resumo) combina com IA generativa; cálculo exato e regra fixa combinam com lógica tradicional.",
                },
            ],
            questions: [
                {
                    statement: "Qual é uma vantagem central de usar foundation models em vez de treinar do zero?",
                    difficulty: "facil",
                    options: [
                        { text: "Já vêm pré-treinados e se adaptam a várias tarefas com pouco esforço", isCorrect: true },
                        { text: "Eliminam qualquer risco de gerar respostas incorretas", isCorrect: false },
                        { text: "Dispensam totalmente o uso de dados em novos casos", isCorrect: false },
                        { text: "Garantem custo zero de inferência em qualquer volume", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é um desafio conhecido ao adotar IA generativa em produção?",
                    difficulty: "medio",
                    options: [
                        { text: "As respostas podem variar e conter imprecisões, exigindo verificação", isCorrect: true },
                        { text: "Os modelos só funcionam offline, sem qualquer acesso por API", isCorrect: false },
                        { text: "É impossível restringir os temas sobre os quais o modelo responde", isCorrect: false },
                        { text: "Eles não conseguem processar mais de um idioma de cada vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Para qual tarefa a IA generativa é a MENOS indicada?",
                    difficulty: "medio",
                    options: [
                        { text: "Calcular impostos por regras fiscais fixas e exatas", isCorrect: true },
                        { text: "Resumir um relatório longo em poucos parágrafos", isCorrect: false },
                        { text: "Redigir o rascunho de uma resposta de atendimento", isCorrect: false },
                        { text: "Explicar um trecho de código em linguagem simples", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Amazon Q e assistentes generativos gerenciados",
            blocks: [
                {
                    type: "text",
                    value: "## Assistentes prontos para o trabalho\nAlém do Bedrock (a plataforma para construir), a AWS oferece assistentes generativos prontos sob a marca **Amazon Q**.\n\n**Amazon Q Business** é um assistente que responde perguntas dos funcionários com base nos dados internos da empresa (documentos, wikis, sistemas), respeitando as permissões de cada pessoa. É a opção quando o objetivo é dar respostas fundamentadas no conhecimento corporativo.\n\n**Amazon Q Developer** ajuda times de tecnologia com geração e explicação de código e apoio a tarefas de desenvolvimento na AWS.",
                },
                {
                    type: "text",
                    value: "## Como escolher no cenário\nSe o enunciado pede um assistente que responde com base nos documentos internos e respeita acesso, pense em **Amazon Q Business**. Se pede construir uma aplicação generativa customizada, com escolha de modelo e integração própria, pense em **Amazon Bedrock**. Serviços como Rekognition (imagens), Athena (consulta SQL) e Polly (voz) não são assistentes generativos corporativos.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma empresa quer um assistente que responda perguntas dos funcionários com base nos documentos internos, respeitando permissões. Qual serviço é voltado a isso?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon Q Business", isCorrect: true },
                        { text: "Amazon Rekognition", isCorrect: false },
                        { text: "Amazon Athena", isCorrect: false },
                        { text: "Amazon Polly", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer construir uma aplicação generativa customizada, escolhendo o foundation model e integrando com seus sistemas. Qual serviço é a base?",
                    difficulty: "medio",
                    options: [
                        { text: "Amazon Bedrock, plataforma para construir com foundation models", isCorrect: true },
                        { text: "Amazon Q Business, um assistente pronto para uso interno", isCorrect: false },
                        { text: "Amazon Comprehend, para análise de texto pré-treinada", isCorrect: false },
                        { text: "Amazon Translate, para tradução entre idiomas", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual serviço apoia equipes de desenvolvimento com geração e explicação de código na AWS?",
                    difficulty: "medio",
                    options: [
                        { text: "Amazon Q Developer", isCorrect: true },
                        { text: "Amazon Macie", isCorrect: false },
                        { text: "Amazon Kinesis", isCorrect: false },
                        { text: "AWS Backup", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Alucinações e os limites da IA generativa",
            blocks: [
                {
                    type: "text",
                    value: "## Quando o modelo inventa\nUma **alucinação** ocorre quando o modelo gera informação plausível, mas falsa: uma citação inexistente, um dado inventado, uma referência com autores e datas fabricados. O modelo não mente de propósito; ele prevê o texto mais provável, e às vezes o mais provável não é verdadeiro.\n\nPor isso, saídas de IA generativa em contextos que exigem precisão precisam de verificação. Não confunda alucinação com viés (que vem de desequilíbrio nos dados) nem com overfitting (que é sobre generalização em ML tradicional).",
                },
                {
                    type: "text",
                    value: "## Como reduzir o risco\nAlgumas práticas ajudam a mitigar alucinações e limites:\n\n- **Embasar as respostas em dados confiáveis** (RAG), em vez de confiar só na memória do modelo.\n- **Aplicar guardrails** para bloquear conteúdo indesejado.\n- **Manter revisão humana** em decisões de alto impacto.\n- **Pedir que o modelo cite as fontes** quando possível.\n\nEsses temas aparecem em detalhe nos módulos de aplicações e de IA responsável.",
                },
                {
                    type: "quote",
                    value: "Alucinação é conteúdo plausível, porém falso. IA generativa poderosa ainda exige verificação, guardrails e supervisão humana.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um LLM respondeu citando um artigo que não existe, com autores inventados. Como esse comportamento é chamado?",
                    difficulty: "facil",
                    options: [
                        { text: "Alucinação, quando o modelo gera algo plausível, porém falso", isCorrect: true },
                        { text: "Overfitting, quando o modelo memoriza o treino", isCorrect: false },
                        { text: "Viés, quando o modelo reflete desequilíbrio dos dados", isCorrect: false },
                        { text: "Latência, quando o modelo demora a responder", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual prática ajuda a reduzir alucinações em uma aplicação generativa?",
                    difficulty: "medio",
                    options: [
                        { text: "Embasar as respostas em dados confiáveis recuperados (RAG)", isCorrect: true },
                        { text: "Aumentar a temperatura para respostas mais criativas", isCorrect: false },
                        { text: "Remover toda verificação para acelerar as respostas", isCorrect: false },
                        { text: "Desligar quaisquer guardrails de conteúdo", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que saídas de IA generativa exigem verificação em contextos que pedem precisão?",
                    difficulty: "medio",
                    options: [
                        { text: "O modelo prevê o texto mais provável, que nem sempre é verdadeiro", isCorrect: true },
                        { text: "O modelo sempre se recusa a responder perguntas factuais", isCorrect: false },
                        { text: "As respostas são idênticas a cada execução, sem variação", isCorrect: false },
                        { text: "A verificação elimina o custo de inferência do modelo", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Aplicando foundation models: prompt, RAG e customização",
    aulas: [
        {
            titulo: "Engenharia de prompt: zero-shot, few-shot e chain-of-thought",
            blocks: [
                {
                    type: "text",
                    value: "## A instrução molda a resposta\n**Engenharia de prompt** é a prática de estruturar a instrução para obter respostas melhores de um LLM, sem alterar o modelo. É a forma mais rápida e barata de melhorar resultados: você muda o texto que envia, não os pesos do modelo.\n\nUm bom prompt costuma deixar claros a tarefa, o formato esperado da resposta, o tom e eventuais restrições. Pequenas mudanças de redação podem ter grande efeito na qualidade da saída.",
                },
                {
                    type: "text",
                    value: "## Três técnicas que caem na prova\n**Zero-shot**: você pede a tarefa sem dar exemplos. Ex.: \"Classifique o sentimento desta frase\". Funciona bem em tarefas comuns.\n\n**Few-shot**: você inclui alguns exemplos de entrada e saída desejada dentro do próprio prompt, para orientar o formato e o estilo. Também chamado de aprendizado em contexto, porque o modelo aprende com os exemplos ali, sem treino.\n\n**Chain-of-thought (cadeia de raciocínio)**: você pede que o modelo explique o passo a passo antes de dar a resposta final. Isso costuma melhorar tarefas de lógica e cálculo.",
                },
                {
                    type: "table",
                    value: "[[\"Técnica\", \"Como é\", \"Bom para\"], [\"Zero-shot\", \"Pede a tarefa sem exemplos\", \"Tarefas comuns e diretas\"], [\"Few-shot\", \"Inclui alguns exemplos no prompt\", \"Fixar formato e estilo da saída\"], [\"Chain-of-thought\", \"Pede o raciocínio passo a passo\", \"Problemas de lógica e cálculo\"]]",
                },
            ],
            questions: [
                {
                    statement: "O que é engenharia de prompt?",
                    difficulty: "facil",
                    options: [
                        { text: "Estruturar instruções para obter respostas melhores de um LLM", isCorrect: true },
                        { text: "Treinar um foundation model do zero com dados próprios", isCorrect: false },
                        { text: "Comprimir os pesos do modelo para poupar memória", isCorrect: false },
                        { text: "Configurar a rede da VPC onde o modelo roda", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um desenvolvedor inclui três exemplos de pergunta e resposta no prompt antes da pergunta real. Que técnica é essa?",
                    difficulty: "facil",
                    options: [
                        { text: "Prompt few-shot, que fornece exemplos no próprio prompt", isCorrect: true },
                        { text: "Fine-tuning, que reajusta os pesos do modelo", isCorrect: false },
                        { text: "Pré-treinamento, que ensina o modelo do zero", isCorrect: false },
                        { text: "RAG, que recupera documentos externos", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Pedir que o modelo explique o raciocínio passo a passo antes da resposta final é a técnica de:",
                    difficulty: "medio",
                    options: [
                        { text: "Cadeia de raciocínio (chain-of-thought)", isCorrect: true },
                        { text: "Redução de dimensionalidade", isCorrect: false },
                        { text: "Quantização dos pesos", isCorrect: false },
                        { text: "Balanceamento de carga", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Parâmetros de inferência: temperatura, top-p e máximo de tokens",
            blocks: [
                {
                    type: "text",
                    value: "## Controlando o comportamento da resposta\nAo chamar um LLM, além do prompt você ajusta parâmetros de inferência que mudam o estilo da saída, sem alterar o modelo.\n\n**Temperatura** controla a aleatoriedade. Temperatura baixa deixa as respostas mais previsíveis e focadas; temperatura alta as deixa mais variadas e criativas. Para tarefas factuais, prefira temperatura baixa; para brainstorming, mais alta.\n\n**Top-p (nucleus sampling)** limita a escolha às palavras mais prováveis que somam certa probabilidade. Junto com a temperatura, governa o quanto a resposta é diversa.",
                },
                {
                    type: "text",
                    value: "## Máximo de tokens e o que ele NÃO faz\nO **máximo de tokens (max tokens)** limita o tamanho da resposta: ao atingir o teto, a geração para. É útil para controlar custo e evitar respostas longas demais.\n\nCuidado com pegadinhas: o max tokens não aumenta a criatividade (isso é temperatura/top-p), não garante que a resposta esteja correta e não define quantas vezes você pode chamar a API (isso são cotas do serviço).",
                },
                {
                    type: "quote",
                    value: "Temperatura e top-p controlam a diversidade da resposta; máximo de tokens controla o tamanho. Nenhum deles garante que a resposta é verdadeira.",
                },
            ],
            questions: [
                {
                    statement: "Aumentar a temperatura na chamada de um LLM tende a produzir respostas:",
                    difficulty: "facil",
                    options: [
                        { text: "Mais aleatórias e criativas, com maior variação", isCorrect: true },
                        { text: "Mais curtas, limitando os tokens de saída", isCorrect: false },
                        { text: "Mais rápidas, reduzindo o tempo de processamento", isCorrect: false },
                        { text: "Mais baratas, diminuindo o custo por token", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o efeito de definir o 'máximo de tokens' em uma chamada de LLM?",
                    difficulty: "facil",
                    options: [
                        { text: "Limita o tamanho da resposta, cortando-a ao atingir o teto", isCorrect: true },
                        { text: "Aumenta a criatividade ao permitir mais variação", isCorrect: false },
                        { text: "Garante que a resposta esteja sempre correta", isCorrect: false },
                        { text: "Define quantas chamadas por minuto são permitidas", isCorrect: false },
                    ],
                },
                {
                    statement: "Para uma tarefa que exige respostas factuais e consistentes, qual ajuste é o mais indicado?",
                    difficulty: "medio",
                    options: [
                        { text: "Usar temperatura baixa, para respostas mais previsíveis", isCorrect: true },
                        { text: "Usar temperatura alta, para respostas mais variadas", isCorrect: false },
                        { text: "Remover o limite de tokens para respostas maiores", isCorrect: false },
                        { text: "Aumentar o top-p ao máximo para mais diversidade", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "RAG: embasar respostas em dados confiáveis",
            blocks: [
                {
                    type: "text",
                    value: "## O problema que o RAG resolve\nUm foundation model só sabe o que estava nos dados de pré-treino, e não conhece os documentos internos da sua empresa nem informações que mudaram depois. Pedir a ele que responda sobre isso convida a alucinações.\n\n**Retrieval Augmented Generation (RAG)** resolve isso: antes de responder, o sistema recupera trechos relevantes de uma base de dados externa e os inclui no prompt, embasando a resposta em informação real e específica. O modelo não é alterado; o que muda é o contexto que ele recebe.",
                },
                {
                    type: "text",
                    value: "## O papel do banco de dados vetorial\nPara recuperar por significado, os documentos são convertidos em embeddings e guardados em um **banco de dados vetorial**. Na hora da pergunta, ela também vira embedding, e o banco retorna os trechos mais semelhantes, que entram no prompt. Assim, a busca é semântica, não apenas por palavra-chave.\n\nBenefícios do RAG: reduz alucinações, usa dados atualizados sem retreinar e permite citar as fontes, aumentando a confiança.",
                },
                {
                    type: "quote",
                    value: "RAG recupera dados externos e os injeta no prompt. Reduz alucinações, usa dados atuais sem retreino e permite citar fontes.",
                },
            ],
            questions: [
                {
                    statement: "O que é Retrieval Augmented Generation (RAG)?",
                    difficulty: "facil",
                    options: [
                        { text: "Recuperar dados de uma base externa e incluí-los no prompt", isCorrect: true },
                        { text: "Reajustar os pesos do modelo com novos dados rotulados", isCorrect: false },
                        { text: "Treinar um foundation model do zero com dados da empresa", isCorrect: false },
                        { text: "Comprimir o modelo para caber em pouca memória", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer um assistente que responda com base nos manuais internos e reduza respostas inventadas, sem treinar um modelo. Qual abordagem indicar?",
                    difficulty: "medio",
                    options: [
                        { text: "RAG, recuperando trechos dos manuais para o contexto", isCorrect: true },
                        { text: "Aumentar a temperatura para respostas mais criativas", isCorrect: false },
                        { text: "Treinar um foundation model do zero com os manuais", isCorrect: false },
                        { text: "Remover os guardrails para responder qualquer coisa", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o papel de um banco de dados vetorial em uma solução de RAG?",
                    difficulty: "medio",
                    options: [
                        { text: "Guardar embeddings e recuperar os trechos mais semelhantes", isCorrect: true },
                        { text: "Treinar o foundation model com dados rotulados", isCorrect: false },
                        { text: "Gerar as imagens pedidas pelo usuário", isCorrect: false },
                        { text: "Aplicar as políticas de IAM de acesso ao modelo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Knowledge Bases e Agents for Amazon Bedrock",
            blocks: [
                {
                    type: "text",
                    value: "## RAG gerenciado com Knowledge Bases\nMontar um RAG do zero envolve gerar embeddings, manter um banco vetorial e orquestrar a recuperação. O **Knowledge Bases for Amazon Bedrock** cuida disso de forma gerenciada: você aponta suas fontes de dados e o serviço trata a ingestão, os embeddings e a recuperação, conectando o foundation model aos seus documentos.",
                },
                {
                    type: "text",
                    value: "## Ações em várias etapas com Agents\nÀs vezes responder não basta; é preciso agir. O **Agents for Amazon Bedrock** permite que um foundation model execute tarefas em várias etapas, chamando APIs e sistemas para concluir uma solicitação. Um agente pode, por exemplo, consultar um estoque, criar um pedido e confirmar o prazo, orquestrando as chamadas necessárias.\n\nNão confunda os recursos do Bedrock: Knowledge Bases é para RAG; Agents é para orquestrar ações; Guardrails é para filtrar conteúdo; a avaliação de modelos é para comparar modelos.",
                },
                {
                    type: "table",
                    value: "[[\"Recurso do Bedrock\", \"Para que serve\"], [\"Knowledge Bases\", \"RAG gerenciado: conecta o modelo aos seus dados\"], [\"Agents\", \"Executa tarefas em várias etapas, chamando APIs\"], [\"Guardrails\", \"Filtra conteúdo e bloqueia temas indesejados\"], [\"Model evaluation\", \"Compara a qualidade de modelos para a sua tarefa\"]]",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual recurso do Amazon Bedrock facilita implementar RAG conectando o modelo às fontes de dados da empresa?",
                    difficulty: "facil",
                    options: [
                        { text: "Knowledge Bases for Amazon Bedrock", isCorrect: true },
                        { text: "Amazon Bedrock Guardrails", isCorrect: false },
                        { text: "Amazon CloudWatch", isCorrect: false },
                        { text: "AWS CloudFormation", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual recurso permite que um foundation model execute tarefas em várias etapas, chamando APIs e sistemas?",
                    difficulty: "medio",
                    options: [
                        { text: "Agents for Amazon Bedrock", isCorrect: true },
                        { text: "Amazon Bedrock Guardrails", isCorrect: false },
                        { text: "Amazon Textract", isCorrect: false },
                        { text: "Amazon Macie", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer comparar a qualidade de vários foundation models antes de escolher um. Que recurso do Bedrock usar?",
                    difficulty: "medio",
                    options: [
                        { text: "A avaliação de modelos (model evaluation) do Bedrock", isCorrect: true },
                        { text: "O Guardrails, para filtrar conteúdo indesejado", isCorrect: false },
                        { text: "O AWS Trusted Advisor, para custo e segurança da conta", isCorrect: false },
                        { text: "O Amazon Inspector, para vulnerabilidades de segurança", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Fine-tuning, RAG ou prompt: como escolher",
            blocks: [
                {
                    type: "text",
                    value: "## Três formas de adaptar um modelo\nQuando um foundation model pronto não basta, há três caminhos, do mais leve ao mais pesado:\n\n**Engenharia de prompt**: mudar só a instrução. Rápido, barato, sem alterar o modelo. Comece sempre por aqui.\n\n**RAG**: dar ao modelo acesso a dados externos no momento da resposta. Ideal quando a informação é específica da empresa ou muda com frequência, pois basta atualizar a base, sem retreinar.\n\n**Fine-tuning**: continuar o treino do modelo com dados próprios, ajustando os pesos para especializá-lo em uma tarefa ou estilo. É mais custoso e o conhecimento fica fixado nos pesos.",
                },
                {
                    type: "text",
                    value: "## A pergunta que decide\nSe a informação muda toda semana, RAG costuma vencer o fine-tuning: você atualiza a base de dados e pronto, sem retreinar o modelo a cada mudança. O fine-tuning brilha quando você quer especializar o comportamento ou o estilo do modelo de forma estável, não quando o conteúdo é volátil.\n\nUm bom raciocínio: prompt para ajustar a instrução, RAG para trazer conhecimento atual e específico, fine-tuning para especializar o comportamento.",
                },
                {
                    type: "table",
                    value: "[[\"Abordagem\", \"Altera os pesos?\", \"Melhor quando\"], [\"Engenharia de prompt\", \"Não\", \"Ajustar instrução e formato rapidamente\"], [\"RAG\", \"Não\", \"Usar dados específicos ou que mudam sempre\"], [\"Fine-tuning\", \"Sim\", \"Especializar o comportamento ou estilo de forma estável\"]]",
                },
                {
                    type: "quote",
                    value: "Dados que mudam sempre pedem RAG (atualize a base, sem retreinar). Especializar o comportamento pede fine-tuning.",
                },
            ],
            questions: [
                {
                    statement: "O que é fine-tuning de um foundation model?",
                    difficulty: "facil",
                    options: [
                        { text: "Continuar o treino com dados específicos, ajustando os pesos", isCorrect: true },
                        { text: "Escrever instruções mais detalhadas no prompt", isCorrect: false },
                        { text: "Recuperar documentos externos para o contexto", isCorrect: false },
                        { text: "Reduzir o número de tokens da resposta", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "A informação que o assistente precisa usar muda toda semana. Por que RAG costuma ser preferível a fine-tuning?",
                    difficulty: "medio",
                    options: [
                        { text: "Basta atualizar a base de dados, sem retreinar o modelo", isCorrect: true },
                        { text: "O fine-tuning se atualiza sozinho quando os dados mudam", isCorrect: false },
                        { text: "O RAG altera os pesos mais rápido que o fine-tuning", isCorrect: false },
                        { text: "O fine-tuning dispensa qualquer fonte de dados", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer que o modelo adote um estilo de escrita próprio e estável em todas as respostas. Qual abordagem é a mais adequada?",
                    difficulty: "dificil",
                    options: [
                        { text: "Fine-tuning, para especializar o comportamento nos pesos", isCorrect: true },
                        { text: "RAG, para recuperar exemplos de estilo a cada pergunta", isCorrect: false },
                        { text: "Aumentar a temperatura para variar o estilo", isCorrect: false },
                        { text: "Reduzir o máximo de tokens da resposta", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Escolha de modelos e segurança do prompt",
            blocks: [
                {
                    type: "text",
                    value: "## Nem sempre o maior modelo é o certo\nFoundation models variam em tamanho, custo, latência e capacidade. Modelos menores tendem a custar menos e responder mais rápido, com menos capacidade; os maiores resolvem tarefas mais complexas, porém custam e demoram mais. A escolha equilibra esses fatores para o caso de uso.\n\nPara um chatbot de alto volume e respostas simples, um modelo menor pode ser ideal. Para raciocínio complexo, vale um modelo maior. Testar e comparar (com a avaliação de modelos do Bedrock) ajuda a decidir com dados.",
                },
                {
                    type: "text",
                    value: "## Injeção de prompt: um risco específico de LLMs\nQuando um LLM recebe entradas de usuários, surge a **injeção de prompt**: uma entrada maliciosa que tenta subverter as instruções originais do sistema, fazendo o modelo ignorar as regras e seguir as do atacante. É um risco próprio de aplicações com LLM, diferente de problemas genéricos de infraestrutura.\n\nMitigações incluem guardrails, separar claramente instruções de dados do usuário e validar as saídas. Cuidados de segurança de conteúdo aparecem em detalhe no módulo de IA responsável.",
                },
                {
                    type: "quote",
                    value: "Modelo menor: mais barato e rápido, menos capaz. Injeção de prompt: entrada que tenta subverter as instruções do sistema.",
                },
            ],
            questions: [
                {
                    statement:
                        "Ao escolher um foundation model para um chatbot de alto volume e baixo custo, qual trade-off considerar?",
                    difficulty: "medio",
                    options: [
                        { text: "Modelos menores custam menos e respondem mais rápido, com menos capacidade", isCorrect: true },
                        { text: "Modelos maiores são sempre mais baratos e mais rápidos que os menores", isCorrect: false },
                        { text: "O tamanho do modelo não afeta o custo, a latência nem a capacidade", isCorrect: false },
                        { text: "Modelos menores sempre superam os maiores em qualquer tarefa", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é um risco de segurança específico ao expor um LLM a entradas de usuários?",
                    difficulty: "medio",
                    options: [
                        { text: "Injeção de prompt, que tenta subverter as instruções do sistema", isCorrect: true },
                        { text: "Estouro de buffer por excesso de memória do modelo", isCorrect: false },
                        { text: "Perda de pacotes na rede até o endpoint", isCorrect: false },
                        { text: "Fragmentação de disco onde o modelo está hospedado", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Para decidir entre dois foundation models candidatos com base em métricas para a sua tarefa, a melhor prática é:",
                    difficulty: "facil",
                    options: [
                        { text: "Compará-los com a avaliação de modelos antes de escolher", isCorrect: true },
                        { text: "Escolher sempre o maior, independentemente do custo", isCorrect: false },
                        { text: "Escolher sempre o menor, independentemente da tarefa", isCorrect: false },
                        { text: "Decidir por sorteio, já que todos são equivalentes", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - IA responsável",
    aulas: [
        {
            titulo: "O que é IA responsável e suas dimensões",
            blocks: [
                {
                    type: "text",
                    value: "## Construir IA com responsabilidade\n**IA responsável** é o conjunto de princípios e práticas para desenvolver e usar sistemas de IA de forma justa, segura, transparente e confiável. Não é um recurso opcional: é uma dimensão que atravessa todo o ciclo de vida, dos dados ao monitoramento.\n\nO AIF-C01 espera que você reconheça as dimensões centrais e associe cada uma a práticas e serviços da AWS.",
                },
                {
                    type: "table",
                    value: "[[\"Dimensão\", \"O que significa\"], [\"Justiça (fairness)\", \"Tratar diferentes grupos de forma equânime\"], [\"Explicabilidade\", \"Entender por que o modelo decidiu\"], [\"Transparência\", \"Deixar claro como o sistema funciona e seus limites\"], [\"Robustez e segurança\", \"Funcionar de forma confiável e evitar danos\"], [\"Privacidade\", \"Proteger os dados das pessoas\"], [\"Governança\", \"Definir responsabilidades, controles e supervisão\"]]",
                },
                {
                    type: "text",
                    value: "## Por que isso cai na prova\nSoluções de IA afetam pessoas: crédito, contratação, saúde, moderação de conteúdo. Sem cuidado, podem reproduzir injustiças, tomar decisões inexplicáveis ou gerar conteúdo prejudicial. Reconhecer que justiça, explicabilidade, transparência, segurança e privacidade são pilares (e não \"aumentar parâmetros\" ou \"esconder o funcionamento\") é o que a prova quer.",
                },
            ],
            questions: [
                {
                    statement: "Qual das opções é uma dimensão central da IA responsável?",
                    difficulty: "facil",
                    options: [
                        { text: "Justiça (fairness), tratando os grupos de forma equânime", isCorrect: true },
                        { text: "Maximizar o número de parâmetros a qualquer custo", isCorrect: false },
                        { text: "Reduzir os idiomas suportados para simplificar", isCorrect: false },
                        { text: "Ocultar de todos como o sistema funciona", isCorrect: false },
                    ],
                },
                {
                    statement: "IA responsável é melhor descrita como:",
                    difficulty: "facil",
                    options: [
                        { text: "Princípios e práticas para uma IA justa, segura e transparente", isCorrect: true },
                        { text: "Uma técnica para aumentar a acurácia do modelo", isCorrect: false },
                        { text: "Um serviço específico que substitui o SageMaker", isCorrect: false },
                        { text: "Uma forma de reduzir o custo de inferência", isCorrect: false },
                    ],
                },
                {
                    statement: "Deixar claro como um sistema de IA funciona e quais são seus limites está mais ligado a qual dimensão?",
                    difficulty: "medio",
                    options: [
                        { text: "Transparência", isCorrect: true },
                        { text: "Latência", isCorrect: false },
                        { text: "Escalabilidade", isCorrect: false },
                        { text: "Compressão do modelo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Viés e justiça em modelos de IA",
            blocks: [
                {
                    type: "text",
                    value: "## O que é viés\n**Viés (bias)** em IA é um erro sistemático que favorece ou prejudica certos grupos de forma injusta. Ele costuma vir dos dados: se o histórico usado no treino já é desequilibrado, o modelo aprende e reproduz (ou até amplifica) esse desequilíbrio.\n\nUm exemplo clássico: um modelo de recrutamento treinado com contratações passadas enviesadas passa a favorecer o mesmo perfil, perpetuando a injustiça. O problema não é o algoritmo inventar; é ele aprender o viés que já estava nos dados.",
                },
                {
                    type: "text",
                    value: "## Detectar e reduzir com o SageMaker Clarify\nO **Amazon SageMaker Clarify** ajuda a detectar viés nos dados e no modelo e a explicar as previsões. Ele mede, por exemplo, se um grupo está sub-representado ou se recebe resultados sistematicamente diferentes, ajudando a equipe a identificar e mitigar o problema antes e depois do treino.\n\nReduzir viés envolve dados mais representativos, verificação com métricas de justiça e, muitas vezes, supervisão humana nas decisões sensíveis.",
                },
                {
                    type: "quote",
                    value: "Viés é erro sistemático que trata grupos de forma injusta, muitas vezes herdado de dados desequilibrados. O SageMaker Clarify ajuda a detectá-lo.",
                },
            ],
            questions: [
                {
                    statement: "No contexto de IA responsável, o que é viés (bias) em um modelo?",
                    difficulty: "facil",
                    options: [
                        { text: "Erros sistemáticos que favorecem ou prejudicam grupos injustamente", isCorrect: true },
                        { text: "A diferença entre a acurácia de treino e a de teste", isCorrect: false },
                        { text: "O tempo que o modelo leva para responder", isCorrect: false },
                        { text: "A quantidade de parâmetros ajustados no treino", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um modelo de recrutamento passou a favorecer um perfil específico, pois os dados históricos eram desequilibrados. Que problema é esse?",
                    difficulty: "medio",
                    options: [
                        { text: "Viés herdado dos dados, que o modelo aprendeu e reproduziu", isCorrect: true },
                        { text: "Overfitting por um modelo grande demais", isCorrect: false },
                        { text: "Alucinação típica de modelos generativos", isCorrect: false },
                        { text: "Latência alta por um endpoint mal dimensionado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual serviço da AWS ajuda a detectar viés nos dados e no modelo e a explicar previsões?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon SageMaker Clarify", isCorrect: true },
                        { text: "Amazon SageMaker Ground Truth", isCorrect: false },
                        { text: "Amazon CloudFront", isCorrect: false },
                        { text: "AWS Backup", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Explicabilidade, transparência e documentação",
            blocks: [
                {
                    type: "text",
                    value: "## Explicar decisões\n**Explicabilidade** é a capacidade de entender por que um modelo tomou determinada decisão. Em aplicações sensíveis, como concessão de crédito, isso é essencial: permite justificar a decisão a quem foi afetado e atender a exigências regulatórias. Explicar não elimina erros nem acelera o treino; ela dá visibilidade sobre o raciocínio do modelo.",
                },
                {
                    type: "text",
                    value: "## Documentar para governar\nDuas ferramentas de transparência caem na prova:\n\n**Cartões de modelo (model cards)** documentam, para cada modelo, a finalidade, os dados usados, as métricas e as limitações conhecidas. Servem para governança e para que quem usa o modelo saiba o que esperar.\n\n**AWS AI Service Cards** são documentos publicados pela AWS que descrevem casos de uso pretendidos, limitações e escolhas de design de seus serviços de IA, promovendo uso responsável e transparência.",
                },
                {
                    type: "table",
                    value: "[[\"Artefato\", \"Quem produz\", \"O que documenta\"], [\"Model card\", \"Quem cria o modelo\", \"Finalidade, dados, métricas e limitações do modelo\"], [\"AI Service Card\", \"A AWS\", \"Uso pretendido e limitações de um serviço de IA da AWS\"]]",
                },
            ],
            questions: [
                {
                    statement: "Por que a explicabilidade é importante em aplicações sensíveis, como crédito?",
                    difficulty: "medio",
                    options: [
                        { text: "Permite entender e justificar a decisão a quem foi afetado", isCorrect: true },
                        { text: "Garante que o modelo nunca cometerá erros", isCorrect: false },
                        { text: "Reduz o custo de inferência em produção", isCorrect: false },
                        { text: "Acelera o treino ao simplificar o algoritmo", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer documentar finalidade, dados, métricas e limitações de cada modelo para apoiar a governança. Que artefato usar?",
                    difficulty: "facil",
                    options: [
                        { text: "Cartões de modelo (model cards)", isCorrect: true },
                        { text: "Grupos de segurança de rede", isCorrect: false },
                        { text: "Buckets do Amazon S3", isCorrect: false },
                        { text: "Filas do Amazon SQS", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Os documentos da AWS que descrevem uso pretendido e limitações de seus serviços de IA, promovendo transparência, são chamados de:",
                    difficulty: "medio",
                    options: [
                        { text: "AI Service Cards", isCorrect: true },
                        { text: "Security Groups", isCorrect: false },
                        { text: "Trust Policies", isCorrect: false },
                        { text: "Launch Templates", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Segurança do conteúdo e supervisão humana",
            blocks: [
                {
                    type: "text",
                    value: "## Guardrails: barreiras de conteúdo\nEm aplicações generativas, é preciso impedir respostas tóxicas, perigosas ou fora de escopo. Os **Amazon Bedrock Guardrails** aplicam filtros de conteúdo, bloqueiam tópicos negados e ajudam a proteger dados sensíveis nas respostas. É a forma gerenciada de manter o assistente dentro dos limites definidos pela empresa, uma medida de segurança e mitigação de danos.",
                },
                {
                    type: "text",
                    value: "## Manter o humano no circuito\nEm decisões de alto impacto, manter **revisão humana (human in the loop)** é uma salvaguarda central da IA responsável: uma pessoa revisa ou aprova as decisões do modelo, evitando que erros graves passem direto. Remover a supervisão para \"ganhar velocidade\", ocultar decisões dos afetados ou elevar a criatividade do modelo vão na direção oposta do uso responsável.\n\nJuntos, guardrails (limitam o conteúdo) e supervisão humana (revisam as decisões) reduzem os principais riscos de operar IA em produção.",
                },
                {
                    type: "quote",
                    value: "Guardrails limitam o conteúdo gerado; supervisão humana revisa decisões de alto impacto. Ambos são pilares da IA responsável.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma empresa quer impedir que seu assistente responda sobre temas proibidos e evite linguagem tóxica. Qual recurso do Bedrock atende a isso?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon Bedrock Guardrails", isCorrect: true },
                        { text: "Amazon Bedrock Knowledge Bases", isCorrect: false },
                        { text: "Amazon SageMaker Ground Truth", isCorrect: false },
                        { text: "AWS Glue DataBrew", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Em decisões de alto impacto apoiadas por IA, qual prática ajuda a evitar erros graves do modelo?",
                    difficulty: "medio",
                    options: [
                        { text: "Manter revisão humana (human in the loop) sobre as decisões", isCorrect: true },
                        { text: "Remover a supervisão para acelerar as decisões", isCorrect: false },
                        { text: "Aumentar a temperatura para respostas variadas", isCorrect: false },
                        { text: "Ocultar as decisões dos usuários afetados", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Aplicar filtros que impedem um assistente de gerar conteúdo tóxico está mais associado a qual princípio?",
                    difficulty: "medio",
                    options: [
                        { text: "Segurança e mitigação de danos ao usuário e à sociedade", isCorrect: true },
                        { text: "Redução do custo de armazenamento dos dados", isCorrect: false },
                        { text: "Aumento da taxa de tokens por segundo", isCorrect: false },
                        { text: "Simplificação do pipeline de ETL", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Segurança, conformidade e governança",
    aulas: [
        {
            titulo: "Responsabilidade compartilhada e controle de acesso",
            blocks: [
                {
                    type: "text",
                    value: "## Quem cuida do quê\nNa nuvem, a segurança é uma **responsabilidade compartilhada**. A AWS cuida da segurança **da** nuvem: infraestrutura física, hardware, rede e a operação dos serviços gerenciados. O cliente cuida da segurança **na** nuvem: quem acessa o quê, como os dados são configurados e usados, e as permissões da aplicação.\n\nEm um serviço de IA gerenciado, isso significa que a AWS mantém a plataforma e os patches, enquanto você define o controle de acesso e a governança dos seus dados de entrada e saída.",
                },
                {
                    type: "text",
                    value: "## Menor privilégio com o IAM\nO controle de acesso na AWS é feito com o **AWS IAM (Identity and Access Management)**. A boa prática é o **princípio do menor privilégio**: conceder apenas as permissões estritamente necessárias para cada usuário ou serviço, e nada além disso. Isso reduz a superfície de ataque.\n\nPráticas inseguras que a prova rejeita: dar permissão de administrador a todos, compartilhar a chave da conta raiz ou desativar a autenticação para \"facilitar\".",
                },
                {
                    type: "quote",
                    value: "A AWS cuida da segurança da nuvem; o cliente cuida da segurança na nuvem, incluindo acesso e dados. Use IAM com menor privilégio.",
                },
            ],
            questions: [
                {
                    statement:
                        "No modelo de responsabilidade compartilhada aplicado a um serviço gerenciado de IA, o que normalmente cabe ao CLIENTE?",
                    difficulty: "medio",
                    options: [
                        { text: "Definir quem acessa o serviço e como os dados são usados", isCorrect: true },
                        { text: "Manter o hardware físico dos data centers", isCorrect: false },
                        { text: "Aplicar patches na infraestrutura gerenciada", isCorrect: false },
                        { text: "Operar a rede física e a energia das instalações", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Ao dar acesso a um serviço de IA, qual prática concede apenas as permissões necessárias?",
                    difficulty: "facil",
                    options: [
                        { text: "Aplicar o princípio do menor privilégio com o AWS IAM", isCorrect: true },
                        { text: "Conceder permissão de administrador a todos", isCorrect: false },
                        { text: "Compartilhar a chave da conta raiz com a equipe", isCorrect: false },
                        { text: "Desativar a autenticação para simplificar o acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "O AWS IAM é o serviço usado para:",
                    difficulty: "facil",
                    options: [
                        { text: "Gerenciar identidades e permissões de acesso na conta", isCorrect: true },
                        { text: "Transcrever áudio em texto automaticamente", isCorrect: false },
                        { text: "Armazenar objetos de dados em larga escala", isCorrect: false },
                        { text: "Traduzir textos entre diferentes idiomas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Proteção de dados: criptografia, Macie e PII",
            blocks: [
                {
                    type: "text",
                    value: "## Criptografar em repouso e em trânsito\nProteger os dados de uma solução de IA começa pela **criptografia**: em repouso (dados armazenados) e em trânsito (dados que trafegam pela rede). O **AWS KMS (Key Management Service)** gerencia as chaves de criptografia. Manter dados em texto puro, em buckets abertos ou sem logs enfraquece a segurança e é o oposto do recomendado.",
                },
                {
                    type: "text",
                    value: "## Descobrir e proteger dados sensíveis\nDados pessoais (PII) e outros dados sensíveis precisam ser identificados e protegidos. O **Amazon Macie** usa machine learning para descobrir e proteger dados sensíveis, como PII, armazenados no Amazon S3. É a resposta típica quando o cenário fala em achar e proteger dados pessoais em grandes volumes de arquivos.\n\nOutros serviços têm papéis diferentes: Comprehend também detecta PII em texto, mas o Macie é o especialista em varrer o S3 em escala.",
                },
                {
                    type: "quote",
                    value: "Criptografe em repouso e em trânsito (KMS). Para descobrir e proteger PII no S3 em escala, use o Amazon Macie.",
                },
            ],
            questions: [
                {
                    statement: "Para proteger dados de uma solução de IA na AWS, qual medida é recomendada?",
                    difficulty: "facil",
                    options: [
                        { text: "Criptografar os dados em repouso e em trânsito, por exemplo com o KMS", isCorrect: true },
                        { text: "Manter os dados em texto puro para facilitar a depuração", isCorrect: false },
                        { text: "Publicar os dados em um bucket S3 aberto ao público", isCorrect: false },
                        { text: "Desabilitar os logs para reduzir o volume guardado", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa precisa descobrir e proteger PII em grandes volumes de documentos no Amazon S3. Qual serviço é voltado a isso?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon Macie", isCorrect: true },
                        { text: "Amazon Polly", isCorrect: false },
                        { text: "Amazon Lex", isCorrect: false },
                        { text: "AWS Batch", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual serviço da AWS gerencia as chaves usadas para criptografar dados?",
                    difficulty: "medio",
                    options: [
                        { text: "AWS KMS (Key Management Service)", isCorrect: true },
                        { text: "Amazon Rekognition", isCorrect: false },
                        { text: "Amazon Athena", isCorrect: false },
                        { text: "AWS Amplify", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Privacidade no Bedrock e conectividade privada",
            blocks: [
                {
                    type: "text",
                    value: "## O que acontece com os seus dados no Bedrock\nUma dúvida comum: os prompts e dados que envio ao Amazon Bedrock são usados para treinar os modelos base de terceiros? A postura de privacidade do Bedrock é que os **dados do cliente não são usados para treinar os foundation models base** nem compartilhados com os provedores dos modelos. Isso dá às empresas a confiança de usar o serviço com dados próprios.",
                },
                {
                    type: "text",
                    value: "## Tráfego sem passar pela internet\nPara que as chamadas a um serviço de IA não trafeguem pela internet pública, mantendo o tráfego dentro da rede da AWS, usa-se o **AWS PrivateLink**. Ele conecta a sua VPC ao serviço de forma privada, reduzindo a exposição. Serviços como Route 53 (DNS), SNS (mensageria) e Cost Explorer (custos) não têm essa função de conectividade privada.",
                },
                {
                    type: "quote",
                    value: "No Bedrock, os dados do cliente não treinam os modelos base. Para conectividade privada à rede da AWS, use o AWS PrivateLink.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual afirmação reflete a postura de privacidade do Amazon Bedrock quanto aos dados do cliente?",
                    difficulty: "medio",
                    options: [
                        { text: "Não são usados para treinar os foundation models base", isCorrect: true },
                        { text: "Todos os prompts passam a treinar publicamente os modelos", isCorrect: false },
                        { text: "Ficam visíveis para todos os outros clientes do serviço", isCorrect: false },
                        { text: "São compartilhados automaticamente com os provedores", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Para que as chamadas a um serviço de IA não passem pela internet pública, mantendo o tráfego na rede da AWS, qual recurso usar?",
                    difficulty: "medio",
                    options: [
                        { text: "AWS PrivateLink, que conecta a VPC ao serviço de forma privada", isCorrect: true },
                        { text: "Amazon Route 53, um serviço de DNS para resolver nomes", isCorrect: false },
                        { text: "Amazon SNS, um serviço de notificações por mensagens", isCorrect: false },
                        { text: "AWS Cost Explorer, uma ferramenta de análise de custos", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa hesita em usar IA generativa por medo de expor dados. Como a privacidade do Bedrock ajuda a mitigar isso?",
                    difficulty: "facil",
                    options: [
                        { text: "Garante que os dados não treinam os modelos base nem vão aos provedores", isCorrect: true },
                        { text: "Publica todos os prompts em um repositório aberto", isCorrect: false },
                        { text: "Compartilha os dados com outros clientes para comparação", isCorrect: false },
                        { text: "Exige que os dados fiquem em texto puro e sem controle", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Monitoramento, auditoria e conformidade",
            blocks: [
                {
                    type: "text",
                    value: "## Acompanhar em produção\nDepois de implantar, é preciso monitorar a operação e a qualidade ao longo do tempo. O **Amazon CloudWatch** acompanha métricas e logs operacionais (latência, erros, uso). O **Amazon SageMaker Model Monitor** detecta desvios (drift) na qualidade do modelo, avisando quando o desempenho cai e vale retreinar.",
                },
                {
                    type: "text",
                    value: "## Auditar e comprovar conformidade\nPara governança, dois serviços aparecem:\n\n**AWS CloudTrail** registra as chamadas de API feitas na conta, permitindo auditar quem fez o quê e quando, um requisito comum de conformidade.\n\n**AWS Artifact** é o portal onde ficam os relatórios de conformidade e as certificações da AWS (ISO, SOC e outros), úteis em auditorias.\n\nA **governança de dados** completa o quadro: rastrear a origem e as transformações dos dados (linhagem) apoia auditoria, conformidade e reprodutibilidade, mostrando de onde os dados vieram e como foram tratados.",
                },
                {
                    type: "table",
                    value: "[[\"Preciso...\", \"Serviço\"], [\"Métricas e logs operacionais\", \"Amazon CloudWatch\"], [\"Detectar queda de qualidade do modelo\", \"SageMaker Model Monitor\"], [\"Auditar chamadas de API\", \"AWS CloudTrail\"], [\"Obter relatórios de conformidade\", \"AWS Artifact\"]]",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual serviço registra as chamadas de API na conta, apoiando auditoria e conformidade?",
                    difficulty: "facil",
                    options: [
                        { text: "AWS CloudTrail", isCorrect: true },
                        { text: "Amazon Rekognition", isCorrect: false },
                        { text: "Amazon Translate", isCorrect: false },
                        { text: "AWS Amplify", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Depois de implantar um modelo, qual serviço detecta desvios (drift) na qualidade ao longo do tempo?",
                    difficulty: "medio",
                    options: [
                        { text: "Amazon SageMaker Model Monitor, que detecta desvios", isCorrect: true },
                        { text: "Amazon Polly, que converte texto em voz", isCorrect: false },
                        { text: "AWS Budgets, que acompanha os gastos da conta", isCorrect: false },
                        { text: "Amazon Lex, que cria fluxos de conversa em chatbots", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa regulada precisa obter relatórios de conformidade e certificações da AWS para uma auditoria. Onde encontrá-los?",
                    difficulty: "medio",
                    options: [
                        { text: "AWS Artifact", isCorrect: true },
                        { text: "Amazon QuickSight", isCorrect: false },
                        { text: "Amazon Kinesis", isCorrect: false },
                        { text: "AWS Step Functions", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: revisão e próximos passos",
            blocks: [
                {
                    type: "text",
                    value: "## O que você percorreu\nVocê cobriu os cinco domínios do AIF-C01:\n\n- **Fundamentos de IA e ML**: a hierarquia IA, ML e deep learning; tipos de aprendizado; classificação, regressão e clustering; o ciclo de vida; métricas; e os serviços de IA e ML da AWS.\n- **IA generativa e foundation models**: o que são, tokens, embeddings, janela de contexto, o Amazon Bedrock, o Amazon Q e as alucinações.\n- **Aplicando foundation models**: engenharia de prompt, parâmetros de inferência, RAG, Knowledge Bases e Agents, e a escolha entre prompt, RAG e fine-tuning.\n- **IA responsável**: justiça, viés, explicabilidade, transparência, guardrails e supervisão humana.\n- **Segurança, conformidade e governança**: responsabilidade compartilhada, IAM, criptografia, Macie, privacidade no Bedrock, PrivateLink, monitoramento, auditoria e conformidade.",
                },
                {
                    type: "text",
                    value: "## Como fixar\nAo revisar, treine dois reflexos que o exame cobra: associar um cenário ao serviço certo da AWS (por exemplo, \"achar PII no S3\" leva ao Macie; \"conectar o modelo aos meus dados\" leva ao Knowledge Bases) e distinguir conceitos próximos (generativa x agêntica, RAG x fine-tuning, precisão x recall, viés x alucinação).\n\nO melhor termômetro é praticar com questões no formato da prova, revisando cada explicação. Faça o simulado do AWS AI Practitioner na aba de Simulados para medir onde você está e reforçar os pontos fracos.",
                },
                {
                    type: "quote",
                    value: "Dois reflexos para a prova: ligar o cenário ao serviço certo e separar conceitos parecidos. Pratique com o simulado e revise as explicações.",
                },
            ],
            questions: [
                {
                    statement: "Qual é uma boa estratégia final de preparação para o AIF-C01?",
                    difficulty: "facil",
                    options: [
                        { text: "Praticar questões no formato da prova e revisar cada explicação", isCorrect: true },
                        { text: "Decorar apenas os nomes dos serviços, sem entender o uso", isCorrect: false },
                        { text: "Ignorar a IA responsável, por ser um tema secundário", isCorrect: false },
                        { text: "Focar só em um domínio e pular os demais", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um cenário pede achar e proteger dados pessoais (PII) em arquivos no Amazon S3. Qual serviço você associa?",
                    difficulty: "facil",
                    options: [
                        { text: "Amazon Macie", isCorrect: true },
                        { text: "Amazon Bedrock Knowledge Bases", isCorrect: false },
                        { text: "Amazon SageMaker Model Monitor", isCorrect: false },
                        { text: "AWS PrivateLink", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Distinguir 'RAG' de 'fine-tuning' é importante porque:",
                    difficulty: "medio",
                    options: [
                        { text: "RAG usa dados externos sem mudar o modelo; fine-tuning muda os pesos", isCorrect: true },
                        { text: "São exatamente a mesma técnica, apenas com nomes diferentes", isCorrect: false },
                        { text: "Ambos exigem treinar um foundation model inteiro do zero", isCorrect: false },
                        { text: "Nenhum dos dois tem qualquer relação com foundation models", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULOS: Modulo[] = [MODULO_1, MODULO_2, MODULO_3, MODULO_4, MODULO_5];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: "iniciante", description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
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
        "Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
