// Questões do simulado AWS Certified AI Practitioner (AIF-C01), domínio 3 da prova
// (Applications of Foundation Models), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aif-c01-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D3: Questao[] = [
    {
        statement:
            "Uma agência de viagens usa um LLM pré-treinado em um assistente de reservas e precisa que as respostas sejam curtas e escritas em um idioma específico. Qual abordagem alinha melhor a saída do modelo a essas exigências?",
        explanation:
            "Refinar o prompt permite declarar de forma direta o tamanho esperado e o idioma da resposta, e o modelo passa a seguir essas instruções. Trocar o tamanho do modelo muda capacidade e custo, não o formato, e aumentar a temperatura ou o top-k só deixa a escolha dos tokens mais variada.",
        topic: "Prompt engineering",
        options: [
            ["Refinar o prompt, indicando o tamanho da resposta e o idioma desejado", true],
            ["Trocar o LLM por outro modelo de tamanho diferente do usado hoje", false],
            ["Aumentar a temperatura para o modelo variar mais nas respostas geradas", false],
            ["Aumentar o valor de top-k para ampliar os tokens candidatos a cada passo", false],
        ],
    },
    {
        statement:
            "Um fabricante precisa de um conjunto de imagens rotuladas com alta precisão para treinar um modelo de detecção de defeitos e quer reduzir ao mínimo os rótulos errados. Qual abordagem atende melhor a esses requisitos?",
        explanation:
            "Com revisão humana (human-in-the-loop), especialistas conferem e corrigem os rótulos, o que gera a maior precisão com menos erros. A rotulagem automática sem revisão propaga erros, imagens sintéticas não validam rótulos e o aprendizado ativo reduz esforço, mas deixa passar mais rótulos errados.",
        topic: "Fundamentos de IA e ML",
        options: [
            [
                "Rotulagem com revisão humana, em que especialistas conferem e corrigem cada rótulo",
                true,
            ],
            [
                "Rotulagem automática por um modelo de visão pré-treinado, sem nenhuma revisão humana",
                false,
            ],
            [
                "Geração de imagens sintéticas por um foundation model, com rótulos já atribuídos",
                false,
            ],
            [
                "Rotulagem automática com aprendizado ativo, em que o modelo rotula a maior parte das imagens",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de engenharia quer usar o Amazon OpenSearch Service como base de uma aplicação de busca vetorial. Qual recurso do serviço torna isso possível?",
        explanation:
            "A busca k-NN (k vizinhos mais próximos) indexa embeddings e devolve os vetores mais parecidos com a consulta, que é a base de uma aplicação de busca vetorial. O BM25 casa palavras-chave, a indexação geoespacial trata localização e a replicação entre clusters cuida da recuperação de desastres.",
        topic: "RAG e customização",
        options: [
            [
                "Busca k-NN, que encontra os vizinhos mais próximos entre vetores de alta dimensão",
                true,
            ],
            [
                "Busca textual por palavras-chave, com ranqueamento BM25 dos documentos indexados",
                false,
            ],
            [
                "Indexação geoespacial, que responde a consultas por localização e por distância",
                false,
            ],
            [
                "Replicação entre clusters, que mantém cópias do índice para recuperação de desastres",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa um LLM no Amazon Bedrock para classificar trechos de texto como positivos ou negativos, mas, enviando só a instrução e o trecho, as classificações saem inconsistentes. Qual estratégia de prompt engineering melhora a precisão?",
        explanation:
            "Exemplos rotulados no prompt (few-shot) mostram ao modelo o padrão entre trecho e rótulo e deixam a classificação mais consistente. Explicar a teoria não dá exemplos a seguir, reforçar a instrução continua sendo zero-shot e exemplos de outras tarefas desviam o modelo da classificação.",
        topic: "Prompt engineering",
        options: [
            [
                "Incluir no prompt alguns trechos de exemplo, cada um já rotulado como positivo ou negativo",
                true,
            ],
            [
                "Incluir no prompt uma explicação detalhada sobre análise de sentimento e sobre como os LLMs funcionam",
                false,
            ],
            [
                "Reescrever a instrução com mais ênfase e repetir o pedido, ainda sem exemplos no prompt",
                false,
            ],
            [
                "Incluir no prompt exemplos resolvidos de outras tarefas, como resumos e traduções",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma startup vai lançar um agente virtual baseado em LLM e quer impedir que usuários o convençam a executar ações inseguras ou a revelar suas instruções internas. Qual ação reduz esse risco de forma mais direta?",
        explanation:
            "Um modelo de prompt (template) com instruções de sistema que ensinam o LLM a identificar e recusar padrões de manipulação é uma defesa direta contra injeção de prompt e vazamento de instruções. Temperatura e top-p só mudam a aleatoriedade da amostragem, e limitar os tokens de saída apenas encurta as respostas.",
        topic: "Prompt engineering",
        options: [
            [
                "Usar um modelo de prompt com instruções de sistema para reconhecer e recusar manipulações",
                true,
            ],
            [
                "Aumentar a temperatura do modelo para que as respostas variem mais entre as chamadas",
                false,
            ],
            [
                "Aumentar o valor de top-p para ampliar o conjunto de tokens considerados na amostragem",
                false,
            ],
            [
                "Reduzir o número máximo de tokens de saída permitido em cada uma das requisições ao modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma fabricante de eletrodomésticos quer oferecer um chat que responda perguntas sobre os manuais dos produtos, em PDF, usando LLMs no Amazon Bedrock com o menor custo possível. Qual abordagem atende melhor?",
        explanation:
            "A base de conhecimento recupera só os trechos relevantes para cada pergunta, então o modelo recebe o contexto certo sem pagar pelos manuais inteiros a cada chamada nem por treino. Colar todos os manuais no prompt infla o custo em tokens, o fine-tuning soma custo de treino e o pré-treinamento contínuo é o mais caro.",
        topic: "RAG e customização",
        options: [
            [
                "Usar o Amazon Bedrock Knowledge Bases e recuperar só os trechos relevantes dos manuais",
                true,
            ],
            [
                "Incluir o texto completo de todos os manuais no prompt de cada pergunta enviada ao modelo",
                false,
            ],
            [
                "Fazer fine-tuning de um modelo com os manuais e servir esse modelo customizado no Bedrock",
                false,
            ],
            [
                "Fazer pré-treinamento contínuo do modelo base com todo o conteúdo dos manuais",
                false,
            ],
        ],
    },
    {
        statement:
            "O chatbot de uma empresa de biotecnologia já recupera os trechos certos de artigos de pesquisa clínica, mas, mesmo após vários ajustes no prompt, o modelo continua interpretando mal a terminologia especializada. O que melhora mais esse resultado?",
        explanation:
            "O fine-tuning de adaptação ao domínio treina o modelo com o corpus especializado, e ele passa a entender a terminologia clínica, que é a origem do problema. Few-shot e temperatura menor só moldam a resposta, e recuperar mais trechos não ensina o vocabulário que o modelo ainda não domina.",
        topic: "RAG e customização",
        options: [
            ["Fazer fine-tuning de adaptação ao domínio com os artigos especializados", true],
            ["Usar few-shot prompting com exemplos de perguntas e respostas no prompt", false],
            ["Aumentar o número de trechos que a etapa de RAG recupera por pergunta", false],
            ["Reduzir a temperatura para deixar as respostas do modelo mais focadas", false],
        ],
    },
    {
        statement:
            "Uma empresa de ensino on-line mantém um assistente de perguntas e respostas e quer que o estilo das respostas combine com a faixa etária de cada aluno, informação que o aplicativo já envia ao modelo. Qual abordagem exige MENOS esforço?",
        explanation:
            "Incluir no prompt uma instrução de papel e de público com a faixa etária é uma mudança simples de prompt engineering que ajusta o estilo quase sem trabalho extra. Fine-tuning por faixa etária, um pipeline de RAG com conteúdo por idade e um segundo modelo para reescrever o tom exigem dados, infraestrutura ou processamento a mais.",
        topic: "Prompt engineering",
        options: [
            [
                "Incluir no prompt uma instrução de papel e público com a faixa etária do aluno",
                true,
            ],
            ["Fazer fine-tuning de um modelo separado para cada uma das faixas etárias", false],
            ["Montar um pipeline de RAG com conteúdos específicos de cada faixa etária", false],
            [
                "Pós-processar cada resposta com um segundo modelo que reescreva o tom para o aluno",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe envia uma vez por dia a um modelo base do Amazon Bedrock um prompt few-shot com 10 exemplos. O desempenho é bom, mas a equipe quer reduzir o custo mensal. Qual mudança ajuda?",
        explanation:
            "O custo sob demanda acompanha os tokens processados, então enxugar exemplos e tokens do prompt reduz a conta mantendo o bom desempenho. Provisioned Throughput cobra por hora e compensa com volume alto e constante, o fine-tuning soma custo de treino e de armazenamento do modelo customizado, e um modelo maior encarece cada chamada.",
        topic: "Aplicações de foundation models",
        options: [
            ["Reduzir a quantidade de exemplos e de tokens enviados em cada prompt", true],
            ["Comprar Provisioned Throughput para o modelo usado na chamada diária", false],
            ["Fazer fine-tuning do modelo para dispensar os exemplos no prompt", false],
            ["Migrar a carga para um modelo maior e com mais capacidade de raciocínio", false],
        ],
    },
    {
        statement:
            "Uma empresa de turismo traduz seus artigos de ajuda para vários idiomas com um LLM e compara cada tradução automática com uma tradução de referência feita por pessoas. Qual métrica foi criada especificamente para tradução automática?",
        explanation:
            "O BLEU foi criado para tradução automática: mede a sobreposição de n-gramas entre a tradução gerada e uma ou mais traduções de referência. O ROUGE é voltado a resumos, o BERTScore mede similaridade semântica de forma geral e a taxa de erro de palavras avalia transcrição de fala.",
        topic: "Aplicações de foundation models",
        options: [
            ["BLEU (Bilingual Evaluation Understudy)", true],
            ["ROUGE (Recall-Oriented Understudy for Gisting Evaluation)", false],
            ["BERTScore", false],
            ["Taxa de erro de palavras (WER)", false],
        ],
    },
    {
        statement:
            "Uma equipe avalia fazer pré-treinamento contínuo de um foundation model. Qual é um benefício dessa abordagem?",
        explanation:
            "O pré-treinamento contínuo segue treinando o foundation model com dados novos, em geral sem rótulos, e mantém o conhecimento dele atualizado ao longo do tempo. Adaptar a uma tarefa com dados rotulados é fine-tuning, comprimir o modelo é destilação ou quantização, e nenhuma técnica de treino dispensa a avaliação.",
        topic: "RAG e customização",
        options: [
            [
                "Atualizar o conhecimento do modelo, treinando-o com dados novos ao longo do tempo",
                true,
            ],
            [
                "Adaptar o modelo a uma tarefa específica usando um conjunto de dados rotulados",
                false,
            ],
            [
                "Comprimir o modelo para reduzir seu tamanho em memória e acelerar a inferência",
                false,
            ],
            [
                "Dispensar a etapa de avaliação do modelo antes de cada nova versão ir para produção",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança revisa ataques baseados em prompt contra o assistente da empresa. Qual ataque tem como objetivo específico fazer o modelo revelar as instruções de sistema ocultas?",
        explanation:
            "Na extração do modelo de prompt, o atacante pede que o modelo imprima as instruções do template, expondo o prompt de sistema que configura o comportamento. O jailbreak contorna as proteções, mandar ignorar o template tenta desviar o comportamento e a troca de persona impõe um novo papel, sem mirar as instruções em si.",
        topic: "Prompt engineering",
        options: [
            ["Extração do modelo de prompt (template)", true],
            ["Jailbreak das proteções do modelo", false],
            ["Instrução para ignorar o modelo de prompt", false],
            ["Troca de persona induzida pelo prompt", false],
        ],
    },
    {
        statement:
            "Uma rede social quer comparar a toxicidade das respostas de vários LLMs candidatos disponíveis no Amazon Bedrock com o MENOR esforço operacional. Qual abordagem de avaliação atende?",
        explanation:
            "A avaliação automática do Amazon Bedrock pontua as respostas com métricas prontas de toxicidade e não exige recrutar nem coordenar pessoas, o que dá o menor esforço operacional. Revisores próprios e crowdsourcing exigem gerenciar avaliadores, e o teste A/B com usuários reais expõe o público a respostas tóxicas.",
        topic: "Aplicações de foundation models",
        options: [
            ["Avaliação automática no Amazon Bedrock, com as métricas prontas de toxicidade", true],
            ["Avaliação de modelos com uma equipe própria de revisores humanos da empresa", false],
            [
                "Classificação das respostas por avaliadores humanos recrutados em crowdsourcing",
                false,
            ],
            [
                "Teste A/B dos modelos candidatos com usuários reais da plataforma em produção",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer fortalecer um modelo contra ataques de injeção de prompt antes de publicá-lo. Qual abordagem de prompting é usada para isso?",
        explanation:
            "O prompting adversarial cria e testa entradas hostis de propósito, para detectar e neutralizar tentativas de injeção antes que cheguem aos usuários. Chain-of-thought, few-shot e zero-shot só mudam como o modelo raciocina ou recebe exemplos e não oferecem defesa contra prompts maliciosos.",
        topic: "Prompt engineering",
        options: [
            [
                "Prompting adversarial, testando o modelo com entradas maliciosas criadas de propósito",
                true,
            ],
            [
                "Chain-of-thought, pedindo que o modelo explique cada etapa do raciocínio antes de responder",
                false,
            ],
            [
                "Few-shot prompting, incluindo alguns exemplos resolvidos da tarefa no próprio prompt",
                false,
            ],
            [
                "Zero-shot prompting, enviando apenas a instrução da tarefa sem nenhum exemplo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de suporte de TI fez fine-tuning de um LLM para responder dúvidas do help desk e quer confirmar se o ajuste deixou as respostas mais corretas, comparando-as com respostas de referência. Qual métrica deve usar?",
        explanation:
            "O F1 score equilibra precisão e recall em um único valor e mostra se as respostas ficaram corretas e completas em relação às de referência, medindo o ganho do fine-tuning. A precisão sozinha ignora respostas certas que faltaram, o tempo até o primeiro token mede latência e a perplexidade mede ajuste ao texto, não acerto na tarefa.",
        topic: "Aplicações de foundation models",
        options: [
            ["F1 score, que equilibra precisão e recall em um único valor", true],
            ["Precisão, que mede a fração de acertos entre as respostas dadas", false],
            ["Tempo até o primeiro token, que indica a latência da resposta", false],
            ["Perplexidade, que mede o quanto o modelo prevê bem um texto", false],
        ],
    },
    {
        statement:
            "Uma empresa gera imagens de produtos com um modelo de difusão, mas os resultados saem aleatórios e ignoram detalhes pedidos no prompt. A equipe quer que as imagens sigam o prompt mais de perto. Qual ajuste ajuda?",
        explanation:
            "A escala CFG controla o quanto o modelo segue o texto do prompt, então aumentá-la faz a imagem respeitar mais os detalhes pedidos. Mais etapas refinam a remoção de ruído, fixar a semente só torna o resultado reproduzível e pesar mais o prompt negativo reforça o que evitar, não a aderência ao prompt principal.",
        topic: "Aplicações de foundation models",
        options: [
            ["Aumentar a escala de orientação sem classificador (CFG scale)", true],
            ["Aumentar o número de etapas de geração (steps) de remoção de ruído", false],
            ["Fixar a semente aleatória (seed) usada nas gerações de imagem", false],
            ["Aumentar o peso do prompt negativo que descreve o que evitar", false],
        ],
    },
    {
        statement:
            "Uma empresa criou uma solução de resumo de textos no Amazon Bedrock e vai avaliá-la com um job de avaliação automática do Amazon Bedrock Evaluations. Qual métrica essa avaliação usa para medir a qualidade dos resumos?",
        explanation:
            "Na avaliação automática do Amazon Bedrock, a exatidão de resumos é medida com o BERTScore, que compara o resumo gerado com o texto de referência por embeddings contextuais e capta similaridade semântica. AUC avalia classificação binária, MSE mede erro de regressão e perplexidade mede o ajuste do modelo à linguagem.",
        topic: "Aplicações de foundation models",
        options: [
            ["BERTScore", true],
            ["Área sob a curva ROC (AUC)", false],
            ["Erro quadrático médio (MSE)", false],
            ["Perplexidade", false],
        ],
    },
    {
        statement:
            "Um aplicativo de idiomas usa um LLM para reescrever textos com mais clareza e tem exemplos de referência das versões melhoradas. A equipe quer que a saída do modelo se pareça com esses exemplos. Qual métrica deve usar?",
        explanation:
            "O ROUGE mede a sobreposição de n-gramas e de sequências entre a saída do modelo e os textos de referência, então mostra o quanto a reescrita se aproxima das versões melhoradas. A perplexidade reflete o ajuste do modelo à linguagem, a robustez semântica mede estabilidade diante de variações na entrada e a latência mede velocidade.",
        topic: "Aplicações de foundation models",
        options: [
            ["Pontuação ROUGE dos textos reescritos", true],
            ["Perplexidade dos textos reescritos", false],
            ["Pontuação de robustez semântica do modelo", false],
            ["Latência média de cada resposta gerada", false],
        ],
    },
    {
        statement:
            "Uma varejista de eletrônicos quer que um LLM escreva descrições curtas de produtos, focadas nos principais recursos de cada item. Qual abordagem de prompt engineering funciona melhor?",
        explanation:
            "Prompts por categoria que apontam os recursos principais e fixam formato e tamanho levam o modelo a descrições consistentes, curtas e focadas, com pouco retrabalho. Um prompt genérico exige muita edição manual, listar todos os atributos gera texto longo e sem foco, e pedir o máximo de criatividade para depois cortar desperdiça esforço.",
        topic: "Prompt engineering",
        options: [
            [
                "Criar prompts por categoria com os recursos principais, o formato e o tamanho da saída",
                true,
            ],
            [
                "Escrever um único prompt genérico para todos os produtos e editar manualmente cada resultado",
                false,
            ],
            [
                "Listar todos os atributos do produto em um único prompt e pedir uma descrição completa",
                false,
            ],
            [
                "Pedir ao modelo a descrição mais criativa possível e depois cortar o texto no tamanho certo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora quer uma aplicação de IA que permita aos funcionários consultar os sinistros em aberto, obter os detalhes de um sinistro específico e buscar os documentos dele. Qual solução atende melhor?",
        explanation:
            "Um agente no Amazon Bedrock AgentCore chama as APIs de sinistros por meio de ferramentas para listar os abertos e obter os detalhes, e usa a base de conhecimento para buscar os documentos. Guardrails só filtram conteúdo, a base de conhecimento sozinha não executa ações e treinar um modelo do zero é esforço demais.",
        topic: "Aplicações de foundation models",
        options: [
            ["Amazon Bedrock AgentCore com ferramentas de API e uma base do Knowledge Bases", true],
            [
                "Amazon Bedrock AgentCore com políticas de conteúdo do Amazon Bedrock Guardrails",
                false,
            ],
            ["Uma base do Amazon Bedrock Knowledge Bases sozinha, sem nenhum agente", false],
            ["Um modelo de ML novo, treinado do zero com os dados no Amazon SageMaker AI", false],
        ],
    },
    {
        statement:
            "Uma companhia aérea quer um chatbot de texto que responda dúvidas sobre horários de voos, regras de bagagem e formas de pagamento, usando LLMs e uma base com os documentos da empresa, com o MENOR esforço de desenvolvimento. Qual solução atende?",
        explanation:
            "O Amazon Bedrock já oferece LLMs gerenciados e, com o Amazon Bedrock Knowledge Bases, a equipe monta um RAG sobre os documentos sem treinar nem hospedar modelos. O Autopilot treina modelos de ML tradicionais com dados tabulares, o fine-tuning no JumpStart exige preparar dados e treinar, e um orquestrador próprio com modelo hospedado é o que dá mais trabalho.",
        topic: "RAG e customização",
        options: [
            [
                "Usar um LLM do Amazon Bedrock com o Amazon Bedrock Knowledge Bases, em um fluxo de RAG",
                true,
            ],
            [
                "Treinar modelos de ML a partir de dados tabulares com o Amazon SageMaker Autopilot",
                false,
            ],
            [
                "Fazer fine-tuning de modelos no Amazon SageMaker JumpStart com os documentos da empresa",
                false,
            ],
            [
                "Criar um orquestrador próprio com AWS Lambda sobre um modelo hospedado pela equipe",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma editora tem uma aplicação de RAG que precisa responder quase em tempo real, e novos artigos são publicados todos os dias. Quais DUAS etapas do pipeline podem rodar como jobs em lote, fora do fluxo de cada consulta? (Selecione DUAS opções.)",
        explanation:
            "Gerar os embeddings dos artigos e criar ou atualizar o índice dependem só dos documentos, então rodam em lotes periódicos conforme chegam artigos novos, fora do caminho de tempo real. Gerar o embedding da pergunta, ranquear os resultados e detectar o idioma da consulta acontecem a cada requisição e precisam rodar em tempo real.",
        topic: "RAG e customização",
        options: [
            ["Gerar os embeddings dos novos artigos publicados no acervo", true],
            ["Criar ou atualizar o índice de busca vetorial com os artigos", true],
            ["Gerar o embedding de cada pergunta que chega do usuário", false],
            ["Ranquear e devolver os resultados de cada consulta do usuário", false],
            ["Detectar o idioma de cada pergunta enviada pelo usuário", false],
        ],
    },
    {
        statement:
            "Uma equipe quer dividir uma tarefa complexa em subtarefas menores enviadas a um LLM em sequência, em que cada etapa usa o resultado da anterior. Qual técnica descreve essa abordagem?",
        explanation:
            "No prompt chaining, a tarefa complexa vira subtarefas enviadas ao LLM uma após a outra, e cada etapa usa a saída da anterior. O chain-of-thought raciocina passo a passo dentro de uma única resposta, o tree of thoughts explora vários ramos de raciocínio e o few-shot fornece exemplos, sem sequenciar subtarefas.",
        topic: "Prompt engineering",
        options: [
            ["Prompt chaining (encadeamento de prompts)", true],
            ["Chain-of-thought (cadeia de raciocínio)", false],
            ["Tree of thoughts (árvore de pensamentos)", false],
            ["Few-shot prompting (prompt com poucos exemplos)", false],
        ],
    },
    {
        statement:
            "Um profissional de IA precisa melhorar a exatidão das respostas de um modelo de geração de texto que depende de dados de estoque que mudam rapidamente. Qual técnica ajuda mais?",
        explanation:
            "Com RAG, os dados atuais de estoque são buscados no momento da inferência e entram no contexto, então a resposta reflete a informação mais recente sem retreino. Fine-tuning com histórico, transfer learning e pré-treinamento contínuo fixam os dados no treino e ficam desatualizados à medida que o estoque muda.",
        topic: "RAG e customização",
        options: [
            ["RAG, recuperando os dados atuais de estoque no momento da inferência", true],
            ["Fine-tuning do modelo com o histórico de dados de estoque da empresa", false],
            ["Transfer learning a partir de um modelo já treinado em outra tarefa", false],
            ["Pré-treinamento contínuo com snapshots periódicos dos dados de estoque", false],
        ],
    },
    {
        statement:
            "Uma equipe apresenta à diretoria as vantagens de usar RAG em tarefas de processamento de linguagem natural (PLN). Qual afirmação descreve corretamente uma vantagem dessa abordagem?",
        explanation:
            "O RAG recupera documentos externos relevantes no momento da inferência e condiciona a geração a eles, enriquecendo as respostas com conhecimento atual e do domínio sem retreinar o modelo. Ele não acelera o treinamento, não reduz os parâmetros do modelo e não torna determinística a saída de um modelo generativo.",
        topic: "RAG e customização",
        options: [
            ["Usa fontes externas de conhecimento para dar respostas mais precisas e úteis", true],
            ["Acelera o treinamento do modelo de linguagem que está por trás da aplicação", false],
            ["Reduz o número de parâmetros do modelo para economizar memória na inferência", false],
            ["Garante saídas determinísticas, que se repetem igualmente a cada execução", false],
        ],
    },
    {
        statement:
            "Uma empresa quer adaptar um modelo de IA à terminologia e aos requisitos específicos do seu setor, treinando-o com um conjunto de dados rotulados. Qual técnica descreve essa abordagem?",
        explanation:
            "O fine-tuning continua o treino de um modelo pré-treinado com um conjunto rotulado do domínio, e ele aprende a terminologia e os requisitos do setor com esses exemplos. O pré-treinamento contínuo usa grandes volumes sem rótulos, o aprendizado em contexto põe exemplos no prompt sem treinar e a destilação transfere conhecimento para um modelo menor.",
        topic: "RAG e customização",
        options: [
            ["Fine-tuning (ajuste fino)", true],
            ["Pré-treinamento contínuo", false],
            ["Aprendizado em contexto", false],
            ["Destilação do modelo base", false],
        ],
    },
    {
        statement:
            "Uma equipe criou um agente com o Amazon Bedrock AgentCore e quer melhorar a precisão das decisões dele fornecendo alguns exemplos específicos de entrada e saída. Qual abordagem atende?",
        explanation:
            "Colocar os exemplos de entrada e saída no prompt de sistema do agente é few-shot prompting, que orienta o comportamento sem retreino nem serviço extra. Fine-tuning é pesado demais para poucos exemplos, a base de conhecimento fornece contexto recuperado e não exemplos de comportamento, e o guardrail aplica políticas de segurança.",
        topic: "Prompt engineering",
        options: [
            ["Incluir os exemplos no prompt de sistema do agente, no estilo few-shot", true],
            ["Fazer fine-tuning do modelo usado pelo agente com esses poucos exemplos", false],
            ["Adicionar os exemplos a uma base do Amazon Bedrock Knowledge Bases", false],
            ["Criar um guardrail no Amazon Bedrock Guardrails contendo os exemplos", false],
        ],
    },
    {
        statement:
            "Uma equipe discute adotar fine-tuning em um foundation model que a empresa já usa. Qual é um benefício dessa abordagem?",
        explanation:
            "O fine-tuning atualiza os pesos do modelo com dados relevantes para a tarefa e melhora a exatidão e a relevância das respostas nela. Buscar dados externos na inferência é RAG, comprimir o modelo é destilação ou quantização, e renovar o conhecimento geral com dados novos é pré-treinamento contínuo.",
        topic: "RAG e customização",
        options: [
            ["Melhorar o desempenho em uma tarefa específica, treinando com dados da tarefa", true],
            [
                "Permitir que o modelo busque dados externos atualizados no momento da inferência",
                false,
            ],
            ["Comprimir o modelo, reduzindo o tamanho em disco e acelerando as respostas", false],
            [
                "Renovar o conhecimento geral do modelo com pré-treinamento em dados mais novos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa vai armazenar embeddings em um banco de dados vetorial, como o Amazon OpenSearch Service. Quais são DOIS casos de uso principais para isso? (Selecione DUAS opções.)",
        explanation:
            "Busca semântica e recomendações por similaridade dependem de comparar embeddings pelos vizinhos mais próximos, que é justamente o que um banco de dados vetorial oferece. A correspondência exata de palavras-chave é léxica, não semântica, e consultas por chave primária e jobs de ETL em lote são operações comuns de banco que não usam similaridade vetorial.",
        topic: "RAG e customização",
        options: [
            ["Busca semântica em documentos, encontrando textos de significado parecido", true],
            ["Recomendações baseadas em similaridade entre itens e perfis de usuários", true],
            ["Correspondência exata das palavras-chave digitadas pelo usuário na busca", false],
            ["Execução de jobs de ETL em lote agendados para rodar todas as noites", false],
            ["Consultas transacionais por chave primária em tabelas de pedidos de clientes", false],
        ],
    },
    {
        statement:
            "Uma equipe vai usar o Amazon Aurora PostgreSQL com a extensão pgvector em uma aplicação de IA generativa. Quais DUAS capacidades dessa combinação são as mais importantes para a aplicação? (Selecione DUAS opções.)",
        explanation:
            "A busca por similaridade vetorial encontra o conteúdo semanticamente mais próximo, etapa central de recuperação em RAG, e combinar vetores com dados relacionais permite fazer essa busca junto dos registros que já estão no banco. O Aurora não treina foundation models, não hospeda o endpoint do modelo e não filtra conteúdo tóxico, papel de serviços como o Amazon Bedrock Guardrails.",
        topic: "RAG e customização",
        options: [
            ["Busca por similaridade entre os vetores de embeddings guardados no banco", true],
            ["Combinar vetores com dados relacionais estruturados em uma mesma consulta", true],
            ["Treinar foundation models diretamente dentro do cluster do banco de dados", false],
            ["Hospedar o endpoint de inferência que serve o foundation model da aplicação", false],
            ["Filtrar conteúdo tóxico das respostas geradas pelo modelo antes de exibi-las", false],
        ],
    },
    {
        statement:
            "Uma rede de supermercados quer um chatbot que consulte o estoque em tempo real e diga ao cliente em que corredor da loja o produto está. Qual técnica de prompt engineering deve usar?",
        explanation:
            "O ReAct intercala o raciocínio do modelo com ações explícitas, como chamar a API de estoque, e usa os dados devolvidos para responder, o que permite checar o estoque e informar a localização em tempo real. Few-shot, chain-of-thought e zero-shot orientam o raciocínio ou dão exemplos, mas não oferecem mecanismo para consultar sistemas externos.",
        topic: "Prompt engineering",
        options: [
            ["Prompting ReAct (raciocínio e ação)", true],
            ["Few-shot prompting (poucos exemplos)", false],
            ["Chain-of-thought (cadeia de raciocínio)", false],
            ["Zero-shot prompting (sem exemplos)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer comparar a qualidade da sua ferramenta de tradução automática com a de tradutores humanos, usando traduções de referência dos mesmos documentos. Qual estratégia de avaliação deve usar?",
        explanation:
            "O BLEU mede a sobreposição de n-gramas com traduções de referência, então aplicá-lo às saídas da ferramenta e dos tradutores nos mesmos documentos gera pontuações comparáveis para dizer qual método é melhor. O BLEU serve para comparação relativa, não como medida absoluta de qualidade, e o ROUGE foi feito para resumos, não para tradução.",
        topic: "Aplicações de foundation models",
        options: [
            ["Usar o BLEU para estimar a qualidade relativa dos dois métodos de tradução", true],
            ["Usar o BLEU para estimar a qualidade absoluta dos dois métodos de tradução", false],
            ["Usar o ROUGE para estimar a qualidade relativa dos dois métodos de tradução", false],
            ["Usar o ROUGE para estimar a qualidade absoluta dos dois métodos de tradução", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando um chatbot sobre políticas de RH com base em um LLM e em um grande acervo de documentos digitais, volumoso demais para caber na janela de contexto. A equipe quer otimizar a qualidade das respostas. Qual técnica atende melhor?",
        explanation:
            "O RAG busca a cada pergunta os trechos certos e atuais das políticas e fundamenta as respostas neles, melhorando a exatidão sem estourar a janela de contexto. Temperatura 1 só aumenta a aleatoriedade, o fine-tuning é caro, não garante fidelidade ao texto e fica desatualizado, e cortar tokens de entrada tira contexto de que o modelo precisa.",
        topic: "RAG e customização",
        options: [
            [
                "Usar RAG para recuperar os trechos de política mais relevantes a cada pergunta",
                true,
            ],
            ["Definir a temperatura em 1 para o modelo variar mais nas respostas geradas", false],
            [
                "Fazer fine-tuning do modelo com os documentos para ele memorizar as políticas",
                false,
            ],
            [
                "Reduzir o número máximo de tokens de entrada enviados ao modelo em cada chamada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer um chatbot que responda às dúvidas dos funcionários sobre as políticas internas. As políticas mudam com frequência e as respostas precisam refletir cada atualização quase em tempo real. Qual solução atende a esse requisito?",
        explanation:
            "Com RAG, o Amazon Bedrock Knowledge Bases recupera os trechos das políticas no momento da pergunta, então basta atualizar os documentos para a resposta mudar. Fine-tuning e pré-treinamento contínuo exigem novo treino a cada mudança, e um prompt fixo congela o texto do dia do lançamento.",
        topic: "RAG e customização",
        options: [
            [
                "Criar um fluxo de RAG com o Amazon Bedrock Knowledge Bases, que consulta as políticas a cada pergunta",
                true,
            ],
            [
                "Fazer fine-tuning de um LLM no Amazon SageMaker AI com o texto das políticas vigentes a cada nova versão",
                false,
            ],
            [
                "Fazer pré-treinamento contínuo de um LLM com os documentos de políticas sempre que houver mudança",
                false,
            ],
            [
                "Criar um modelo de prompt fixo com o texto das políticas em vigor no dia do lançamento do chatbot",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa aprendizado supervisionado para continuar o treino de um foundation model já pré-treinado, com um conjunto pequeno de dados rotulados voltado a uma tarefa específica. A qual etapa do ciclo de vida do FM isso corresponde?",
        explanation:
            "Fine-tuning continua o treino de um modelo já pré-treinado com um conjunto pequeno de exemplos rotulados para uma tarefa específica. Pré-treinamento e pré-treinamento contínuo usam grandes volumes de dados em geral não rotulados, e a implantação coloca o modelo pronto em produção.",
        topic: "RAG e customização",
        options: [
            ["Pré-treinamento", false],
            ["Pré-treinamento contínuo", false],
            ["Fine-tuning", true],
            ["Implantação", false],
        ],
    },
    {
        statement:
            "Uma empresa de streaming quer que os usuários encontrem imagens do catálogo descrevendo em linguagem natural o que procuram. A solução precisa guardar embeddings em um banco de dados vetorial e fazer buscas por similaridade de vizinhos mais próximos. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon OpenSearch Service funciona como banco de dados vetorial e faz busca k-NN por similaridade sobre embeddings, base da busca em linguagem natural. O Rekognition detecta rótulos em imagens, o Personalize gera recomendações e o Redshift é um data warehouse para análises.",
        topic: "RAG e customização",
        options: [
            ["Amazon OpenSearch Service, com índices k-NN sobre os embeddings", true],
            ["Amazon Rekognition, com detecção de rótulos nas imagens do catálogo", false],
            ["Amazon Personalize, com recomendações baseadas no histórico de uso", false],
            ["Amazon Redshift, com consultas SQL sobre as tabelas do catálogo", false],
        ],
    },
    {
        statement:
            "Uma empresa quer gerar, para o catálogo de produtos, imagens e também descrições em texto, e está comparando foundation models pelos tipos de saída que cada um suporta. Qual característica dos modelos ela está avaliando?",
        explanation:
            "Modalidade indica os tipos de entrada e saída que o modelo aceita, como texto, imagem ou áudio, então comparar quem gera imagens e texto é avaliar modalidade. Latência é o tempo de resposta, a janela de contexto limita quantos tokens cabem e o suporte a idiomas trata das línguas atendidas.",
        topic: "Aplicações de foundation models",
        options: [
            ["Latência", false],
            ["Tamanho da janela de contexto", false],
            ["Modalidade", true],
            ["Suporte a vários idiomas", false],
        ],
    },
    {
        statement:
            "Uma loja online quer avaliar um modelo que marca cada comentário de cliente como positivo, negativo ou neutro. Que tipo de tarefa de avaliação de modelo corresponde a esse caso?",
        explanation:
            "Classificação atribui cada entrada a uma categoria de um conjunto fixo, como os três sentimentos, e é avaliada com métricas de classificação. Geração aberta produz texto livre, resumo condensa um texto longo e perguntas e respostas devolve uma resposta a uma pergunta, sem rótulos predefinidos.",
        topic: "Aplicações de foundation models",
        options: [
            ["Geração de texto aberta", false],
            ["Resumo de texto", false],
            ["Classificação de texto", true],
            ["Perguntas e respostas", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando uma solução de IA generativa no Amazon Bedrock e precisa de um serviço que armazene embeddings como banco de dados vetorial e execute buscas vetoriais sobre eles. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon OpenSearch Service oferece armazenamento vetorial e busca k-NN por similaridade sobre embeddings, e é um dos bancos vetoriais aceitos pelo Amazon Bedrock Knowledge Bases. O Redshift é um data warehouse, o Glue faz ETL e catálogo de dados e o EMR processa big data, e nenhum deles funciona como banco de dados vetorial.",
        topic: "RAG e customização",
        options: [
            ["Amazon OpenSearch Service, que indexa vetores para busca por similaridade", true],
            [
                "Amazon Redshift, que armazena dados tabulares para consultas analíticas em SQL",
                false,
            ],
            ["AWS Glue, que cataloga e transforma dados em pipelines de ETL", false],
            ["Amazon EMR, que processa grandes volumes de dados com Apache Spark", false],
        ],
    },
    {
        statement:
            "Uma equipe está escrevendo os prompts de um assistente de IA generativa e quer respostas mais precisas e no formato esperado. Quais DUAS práticas ela deve adotar? (Selecione DUAS opções.)",
        explanation:
            "Contexto e instruções claras dizem ao modelo o que se espera, e exemplos relevantes (few-shot) mostram o formato e o estilo da saída. Encher o prompt de texto irrelevante, usar termos ambíguos ou omitir instruções só acrescenta ruído e ambiguidade e piora as respostas.",
        topic: "Prompt engineering",
        options: [
            ["Dar contexto e instruções claras sobre a tarefa e o resultado esperado", true],
            ["Incluir exemplos relevantes da saída desejada quando eles ajudarem", true],
            [
                "Deixar o prompt o mais longo possível, mesmo com trechos sem relação com a tarefa",
                false,
            ],
            ["Usar termos ambíguos de propósito para estimular a criatividade do modelo", false],
            ["Omitir as instruções e confiar no comportamento padrão do modelo", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa medir a qualidade dos textos gerados por um modelo de IA generativa, comparando as saídas com textos de referência escritos por pessoas. Quais DUAS métricas são comuns nessa avaliação? (Selecione DUAS opções.)",
        explanation:
            "BLEU avalia traduções e ROUGE avalia resumos comparando o texto gerado com textos de referência, por isso medem a qualidade da saída. Uso de memória da GPU, vazão de requisições e número de parâmetros são métricas de infraestrutura ou de tamanho do modelo e não dizem nada sobre a qualidade do texto.",
        topic: "Aplicações de foundation models",
        options: [
            ["BLEU, usada para medir a qualidade de traduções", true],
            ["ROUGE, usada para medir a qualidade de resumos", true],
            ["Uso de memória da GPU durante cada chamada de inferência", false],
            ["Vazão de requisições atendidas por segundo no endpoint", false],
            ["Número de parâmetros do modelo, usado para comparar tamanho", false],
        ],
    },
    {
        statement:
            "Uma equipe vai usar o Amazon OpenSearch Service como base da busca semântica de uma aplicação de RAG. Quais DUAS capacidades do serviço são as mais relevantes para esse uso? (Selecione DUAS opções.)",
        explanation:
            "Na busca semântica, o OpenSearch guarda os embeddings em índices vetoriais e encontra os mais parecidos com a busca k-NN. BM25 é busca lexical por palavras, não por significado, consultas geoespaciais tratam de localização e o serviço não treina nem faz fine-tuning de foundation models.",
        topic: "RAG e customização",
        options: [
            ["Busca k-NN por vizinhos mais próximos sobre vetores", true],
            ["Indexação de embeddings como banco de dados vetorial", true],
            ["Busca textual por palavras-chave com ranqueamento BM25", false],
            ["Consultas geoespaciais por distância entre coordenadas", false],
            ["Treinamento e fine-tuning de foundation models dentro do cluster", false],
        ],
    },
    {
        statement:
            "Uma empresa quer um assistente de IA que consulte fontes de dados específicas, chame APIs externas e depois gere, compare e priorize opções de resposta em várias etapas. Qual recurso da AWS atende a esses requisitos?",
        explanation:
            "O Amazon Bedrock AgentCore executa agentes que raciocinam em várias etapas, chamam APIs como ferramentas pelo Gateway e consultam dados antes de responder. O Knowledge Bases só recupera contexto, o Prompt Management guarda e versiona prompts e as avaliações medem modelos, sem orquestrar ações.",
        topic: "Aplicações de foundation models",
        options: [
            ["Amazon Bedrock AgentCore, para executar agentes que usam ferramentas", true],
            ["Amazon Bedrock Knowledge Bases, para recuperar trechos dos documentos", false],
            ["Prompt Management do Amazon Bedrock, para versionar os prompts", false],
            ["Avaliações do Amazon Bedrock, para comparar o desempenho de modelos", false],
        ],
    },
    {
        statement:
            "Ao estudar técnicas de prompt, uma equipe encontra os termos zero-shot, one-shot e few-shot. O que diferencia essas três abordagens?",
        explanation:
            "Zero-shot não traz exemplos no prompt, one-shot traz um e few-shot traz alguns, sempre sem treinar o modelo de novo. Os termos não se referem à arquitetura, ao número de etapas de raciocínio (ideia ligada ao chain-of-thought) nem ao volume de dados de fine-tuning.",
        topic: "Prompt engineering",
        options: [
            ["A quantidade de exemplos incluídos no próprio prompt", true],
            ["A arquitetura de rede neural usada pelo modelo", false],
            ["O número de etapas de raciocínio que o modelo executa", false],
            ["O volume de dados usado no fine-tuning do modelo", false],
        ],
    },
    {
        statement:
            "Uma equipe de ML está treinando um foundation model e a acurácia ainda está abaixo do patamar exigido, sem sinais de overfitting. O que a equipe deve fazer para aumentar a acurácia?",
        explanation:
            "Mais épocas fazem o modelo passar mais vezes pelos dados de treino, o que tende a elevar a acurácia enquanto não houver overfitting. Menos épocas dão menos treino, reduzir o batch size mexe na dinâmica e na memória do treino sem garantir ganho, e temperatura é parâmetro de inferência, sem efeito no treino.",
        topic: "RAG e customização",
        options: [
            ["Aumentar o número de épocas de treinamento", true],
            ["Reduzir o número de épocas de treinamento", false],
            ["Reduzir o tamanho do lote (batch size)", false],
            ["Aumentar o parâmetro de temperatura do modelo", false],
        ],
    },
    {
        statement:
            "Uma marca de cosméticos quer usar um modelo de IA generativa já pré-treinado para escrever textos de campanha no tom de voz e com as mensagens da marca. Qual abordagem atende a esse objetivo com menor esforço?",
        explanation:
            "Prompts claros, com instruções e contexto sobre o tom e as mensagens da marca, orientam o modelo pré-treinado sem mexer nele. Adicionar camadas ou ajustar arquitetura e hiperparâmetros exige reengenharia e novo treino, e pré-treinar um modelo do zero é ainda mais caro e desnecessário aqui.",
        topic: "Prompt engineering",
        options: [
            ["Escrever prompts claros, com instruções e contexto sobre o tom da marca", true],
            ["Adicionar mais camadas à arquitetura do modelo para aumentar sua capacidade", false],
            ["Ajustar a arquitetura e os hiperparâmetros para melhorar o desempenho geral", false],
            ["Coletar um grande conjunto de dados e pré-treinar um novo modelo do zero", false],
        ],
    },
    {
        statement:
            "Uma consultoria vai escolher um modelo do Amazon Bedrock para uso interno, e seus analistas dão muito peso ao estilo de escrita das respostas. Como a empresa deve escolher o modelo?",
        explanation:
            "Estilo de escrita é preferência subjetiva, então o melhor caminho é uma avaliação humana, com os próprios analistas comparando as respostas dos modelos a prompts da empresa. Conjuntos integrados e rankings públicos medem desempenho geral, não o estilo que os analistas preferem, e o InvocationLatency mede tempo de resposta.",
        topic: "Aplicações de foundation models",
        options: [
            ["Avaliar os modelos com uma equipe humana e prompts próprios da empresa", true],
            ["Avaliar os modelos automaticamente com os conjuntos de prompts integrados", false],
            ["Escolher o modelo mais bem colocado nos rankings públicos de modelos", false],
            ["Comparar os modelos pela métrica InvocationLatency no Amazon CloudWatch", false],
        ],
    },
    {
        statement:
            "Uma equipe quer medir a acurácia de um foundation model que classifica imagens antes de colocá-lo em produção. Qual estratégia ela deve usar?",
        explanation:
            "Medir a acurácia em um conjunto de benchmark com rótulos conhecidos compara as previsões com as respostas certas, que é o jeito padrão de avaliar um classificador. Contar camadas descreve a arquitetura, o custo dos recursos mede gasto e a fidelidade das cores não tem relação com acertar a classe.",
        topic: "Aplicações de foundation models",
        options: [
            ["Medir a acurácia em um conjunto de benchmark com rótulos conhecidos", true],
            ["Contar o número de camadas da rede neural que compõe a arquitetura do modelo", false],
            ["Calcular o custo total dos recursos consumidos pelo modelo", false],
            ["Verificar a fidelidade das cores das imagens que o modelo processa", false],
        ],
    },
    {
        statement:
            "O chatbot de uma operadora de telecomunicações usa um LLM no Amazon Bedrock para identificar a intenção de cada mensagem do usuário, e a equipe quer melhorar a precisão com few-shot. Que dados de exemplo a equipe precisa incluir no prompt?",
        explanation:
            "No few-shot, o prompt traz exemplos de entrada e saída da própria tarefa, e detectar intenção é ligar uma mensagem a uma intenção, então os pares são mensagem e intenção correta. Pares que envolvem respostas do chatbot ensinam outra relação e não mostram como reconhecer a intenção.",
        topic: "Prompt engineering",
        options: [
            ["Pares de mensagens de usuários e as intenções corretas de cada uma", true],
            ["Pares de mensagens de usuários e as respostas corretas do chatbot", false],
            ["Pares de respostas do chatbot e as intenções corretas dos usuários", false],
            ["Pares de intenções dos usuários e as respostas corretas do chatbot", false],
        ],
    },
    {
        statement:
            "Durante um teste de red team de um foundation model, um engenheiro tenta contornar os filtros de segurança do modelo para fazê-lo gerar conteúdo nocivo. Como se chama essa técnica?",
        explanation:
            "Jailbreak é a tentativa de driblar as proteções de segurança de um modelo com prompts elaborados para obter conteúdo restrito ou nocivo. Fuzzing envia entradas malformadas para achar falhas de software, o pentest autorizado avalia a segurança de sistemas e a negação de serviço ataca a disponibilidade.",
        topic: "Prompt engineering",
        options: [
            ["Jailbreak do modelo por meio de prompts", true],
            ["Fuzzing dos dados de treinamento do modelo", false],
            ["Teste de invasão (pentest) autorizado", false],
            ["Ataque de negação de serviço (DoS)", false],
        ],
    },
    {
        statement:
            "Para um recurso de busca conversacional, uma equipe precisa guardar os embeddings gerados pelo modelo em um banco de dados e consultar os vetores mais parecidos com cada pergunta. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon Aurora PostgreSQL com a extensão pgvector armazena embeddings, cria índices vetoriais e executa consultas de similaridade, e também serve de banco vetorial para o Amazon Bedrock Knowledge Bases. O Redshift é um data warehouse analítico, o EMR processa big data e o Glue faz ETL, sem papel de banco vetorial.",
        topic: "RAG e customização",
        options: [
            ["Amazon Aurora PostgreSQL, com a extensão pgvector", true],
            ["Amazon Redshift, com tabelas colunares para análise", false],
            ["Amazon EMR, com clusters de processamento Spark", false],
            ["AWS Glue, com jobs de ETL e catálogo de dados", false],
        ],
    },
    {
        statement:
            "Uma empresa adotou um foundation model e agora quer saber se ele realmente atende aos objetivos de negócio que motivaram o projeto. Como a equipe deve fazer essa verificação?",
        explanation:
            "Verificar se o modelo resolve os casos de uso específicos que ele precisa atender mostra se as saídas trazem valor para o negócio. Benchmarks medem desempenho geral, não aderência ao caso da empresa, arquitetura e hiperparâmetros são detalhes técnicos e recursos computacionais tratam de custo e viabilidade.",
        topic: "Aplicações de foundation models",
        options: [
            ["Avaliar se o modelo atende aos casos de uso que ele precisa suportar", true],
            ["Avaliar o desempenho do modelo em conjuntos de dados de benchmark públicos", false],
            ["Analisar a arquitetura e os hiperparâmetros usados na construção do modelo", false],
            ["Medir os recursos computacionais que o modelo exige na implantação", false],
        ],
    },
    {
        statement:
            "Uma empresa quer manter seu foundation model atualizado, treinando-o periodicamente com os dados mais recentes em vez de treinar um modelo do zero a cada vez. Qual estratégia de treinamento atende a esse requisito?",
        explanation:
            "O pré-treinamento contínuo retoma o treino do modelo com os dados novos de tempos em tempos e atualiza os pesos sem recomeçar do zero. Aprendizado em lote só descreve como os dados são processados, treinamento estático gera um modelo que não muda e a destilação transfere conhecimento para um modelo menor.",
        topic: "RAG e customização",
        options: [
            ["Pré-treinamento contínuo", true],
            ["Aprendizado em lote (batch learning)", false],
            ["Treinamento estático", false],
            ["Destilação de modelo", false],
        ],
    },
    {
        statement:
            "O LLM usado por uma empresa gera alucinações com frequência. Qual mudança pode reduzir esse problema?",
        explanation:
            "Reduzir a temperatura diminui a aleatoriedade na escolha dos tokens, e o modelo fica com as saídas mais prováveis, o que tende a reduzir alucinações. O AgentCore executa agentes e não supervisiona treino, não dá para isolar os dados que causam alucinação e nenhum modelo garante que nunca vai alucinar.",
        topic: "Aplicações de foundation models",
        options: [
            ["Diminuir o valor da temperatura nos parâmetros de inferência do modelo", true],
            ["Usar o Amazon Bedrock AgentCore para supervisionar o treinamento do modelo", false],
            ["Pré-processar os dados para remover os trechos que causam alucinações", false],
            ["Trocar para um foundation model treinado para nunca alucinar", false],
        ],
    },
    {
        statement:
            "Uma varejista tem 100 conversas de alta qualidade entre atendentes e clientes e quer que as respostas do seu chatbot sigam o mesmo tom da empresa. Qual solução atende a esse requisito?",
        explanation:
            "Um job de fine-tuning no Amazon Bedrock ajusta um foundation model com exemplos rotulados, e as conversas ensinam o tom da empresa. O Personalize é um serviço de recomendações, pré-treinar no HyperPod é treino em larga escala, exagerado para 100 exemplos, e o TensorRT acelera a inferência sem mudar o tom.",
        topic: "RAG e customização",
        options: [
            ["Criar um job de fine-tuning no Amazon Bedrock com as conversas de exemplo", true],
            ["Usar o Amazon Personalize para gerar as respostas do chatbot", false],
            ["Criar um job de pré-treinamento no Amazon SageMaker HyperPod", false],
            [
                "Hospedar o modelo no Amazon SageMaker AI e otimizar a inferência com TensorRT",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao configurar a inferência de um LLM, uma equipe compara a amostragem top-p (nucleus sampling) com o ajuste de temperatura. O que distingue o top-p?",
        explanation:
            "O top-p mantém só o menor grupo de tokens mais prováveis cuja probabilidade acumulada chega a p e sorteia entre eles, enquanto a temperatura reescala a distribuição sem cortar candidatos. O top-p não depende de arquitetura, continua sorteando, então a saída pode variar, e não se limita a um único token.",
        topic: "Aplicações de foundation models",
        options: [
            [
                "Corta os candidatos ao menor grupo cuja probabilidade somada chega a p, enquanto a temperatura reescala a distribuição",
                true,
            ],
            [
                "Só funciona com algumas arquiteturas de modelo, enquanto a temperatura pode ser usada em qualquer LLM do mercado",
                false,
            ],
            [
                "Sempre devolve a mesma saída para o mesmo prompt, enquanto a temperatura faz as respostas variarem entre as execuções",
                false,
            ],
            [
                "Limita a escolha a exatamente um token em cada passo, enquanto a temperatura permite sortear entre todos os tokens candidatos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está integrando um LLM ao seu aplicativo e precisa que as respostas para a mesma entrada sejam tão determinísticas e estáveis quanto possível. Qual solução atende a esse requisito?",
        explanation:
            "Com temperatura 0, o modelo escolhe sempre o token mais provável, então a mesma entrada tende a gerar a mesma resposta. Temperatura 1 mantém a aleatoriedade, pedir determinismo no texto do prompt não controla a amostragem e reduzir o número máximo de tokens só encurta a resposta.",
        topic: "Aplicações de foundation models",
        options: [
            ["Definir o parâmetro temperatura como 0 ao enviar o prompt", true],
            ["Definir o parâmetro temperatura como 1 ao enviar o prompt", false],
            ["Acrescentar ao fim do prompt a instrução 'responda de forma determinística'", false],
            ["Reduzir o número máximo de tokens de saída de cada resposta", false],
        ],
    },
    {
        statement:
            "Uma equipe quer limitar, a cada passo da geração, quantos tokens candidatos o LLM pode considerar para escolher o próximo token. Qual parâmetro de inferência controla isso?",
        explanation:
            "O top-k restringe a amostragem, a cada passo, aos k tokens mais prováveis, então define quantos candidatos o modelo considera. O número máximo de tokens limita o tamanho total da resposta, a temperatura muda a aleatoriedade da distribuição e o tamanho do lote trata de quantas entradas são processadas juntas.",
        topic: "Aplicações de foundation models",
        options: [
            ["Número máximo de tokens", false],
            ["Parâmetro temperatura", false],
            ["Parâmetro top-k", true],
            ["Tamanho do lote", false],
        ],
    },
    {
        statement:
            "Uma agência usa um LLM para sugerir slogans e acha as respostas repetitivas demais. Como ajustar os parâmetros para obter saídas mais diversas e criativas?",
        explanation:
            "Temperatura mais alta achata a distribuição de probabilidades e dá mais chance a tokens menos prováveis, o que gera respostas mais variadas e criativas. Diminuir o top-k reduz os candidatos e deixa a saída mais focada, aumentar o tamanho da resposta só a alonga e encurtar o prompt tira contexto sem trazer criatividade.",
        topic: "Aplicações de foundation models",
        options: [
            ["Aumentar o valor da temperatura", true],
            ["Diminuir o valor de top-k", false],
            ["Aumentar o tamanho máximo da resposta", false],
            ["Diminuir o tamanho do prompt", false],
        ],
    },
    {
        statement:
            "Uma empresa vai fazer fine-tuning de um LLM no Amazon Bedrock para refinar o estilo das mensagens que seu aplicativo gera. De que tipo de dado a empresa precisa?",
        explanation:
            "Para ajustar o estilo, o fine-tuning precisa de exemplos rotulados que liguem cada entrada à saída desejada, e é com esses pares que o modelo aprende o padrão. Só entradas ou só saídas não mostram essa relação, e conjuntos separados sem pareamento não indicam qual saída corresponde a cada entrada.",
        topic: "RAG e customização",
        options: [
            ["Exemplos pareados de mensagens de entrada e das saídas correspondentes", true],
            ["Amostras apenas das mensagens de entrada, sem as saídas correspondentes", false],
            ["Amostras apenas das mensagens de saída, sem as entradas que as geraram", false],
            ["Mensagens de entrada e de saída em conjuntos separados, sem pareamento", false],
        ],
    },
    {
        statement:
            "Uma equipe quer ajustar, no momento da inferência, o quanto as respostas de um modelo de IA generativa variam entre si. Quais DOIS parâmetros de amostragem servem para controlar essa diversidade? (Selecione DUAS opções.)",
        explanation:
            "Top-k restringe o sorteio aos k tokens mais prováveis e top-p ao menor grupo cuja probabilidade acumulada chega a p, e os dois equilibram diversidade e qualidade da saída. Tamanho do modelo, volume de dados de treino e hardware afetam capacidade, custo ou velocidade, mas não são parâmetros de inferência.",
        topic: "Aplicações de foundation models",
        options: [
            ["Top-k, que limita a escolha aos k tokens mais prováveis", true],
            ["Tamanho do modelo, medido pelo número total de parâmetros", false],
            ["Top-p, que limita a escolha pela probabilidade acumulada", true],
            ["Tamanho do conjunto de dados usado no treinamento", false],
            ["Configuração do hardware usado para servir o modelo em produção", false],
        ],
    },
    {
        statement:
            "Uma equipe de design usa um modelo de difusão para gerar imagens e quer controlar o nível de refinamento de cada imagem, de mais detalhada a mais esboçada. Qual parâmetro de inferência ela deve ajustar?",
        explanation:
            "Em modelos de difusão, o número de etapas define quantas vezes a imagem é refinada a partir do ruído: mais etapas trazem mais detalhe, menos etapas deixam a imagem mais crua. O checkpoint escolhe a versão do modelo, o tamanho do lote define quantas imagens saem por vez e o limite de tokens vale para texto.",
        topic: "Aplicações de foundation models",
        options: [
            ["Número de etapas de geração (steps)", true],
            ["Checkpoint do modelo carregado na memória", false],
            ["Tamanho do lote de imagens", false],
            ["Comprimento máximo em tokens", false],
        ],
    },
    {
        statement:
            "Uma equipe gera imagens com um modelo de difusão e precisa impedir que certos elementos apareçam nos resultados. Qual solução atende a esse requisito?",
        explanation:
            "O prompt negativo (negative_prompt) lista os elementos que o modelo deve deixar de fora, então é o jeito direto de excluí-los. Mais aleatoriedade não remove nada, um prompt mais detalhado descreve o que incluir mas não garante a exclusão, e trocar de modelo não cria um mecanismo para isso.",
        topic: "Prompt engineering",
        options: [
            ["Usar um prompt negativo com os elementos a evitar", true],
            ["Usar um valor de temperatura mais alto na geração", false],
            ["Escrever um prompt mais detalhado sobre a cena", false],
            ["Trocar por outro foundation model de imagens", false],
        ],
    },
    {
        statement:
            "Uma central de atendimento adotou um chatbot com LLM para reduzir as etapas que os atendentes percorrem ao responder dúvidas de clientes. Qual métrica de negócio mostra melhor se o chatbot está fazendo diferença?",
        explanation:
            "Se o chatbot corta etapas do atendente, cada atendimento termina mais rápido, e o tempo médio de atendimento mostra esse efeito diretamente. Responsabilidade social e conformidade regulatória são temas da organização sem relação com a agilidade, e o engajamento no site mede visitantes, não a central.",
        topic: "Aplicações de foundation models",
        options: [
            ["Tempo médio de atendimento", true],
            ["Responsabilidade social corporativa", false],
            ["Conformidade regulatória", false],
            ["Taxa de engajamento no site", false],
        ],
    },
    {
        statement:
            "Uma empresa já guarda os dados de seus produtos no Amazon Aurora PostgreSQL e pensa em habilitar a extensão pgvector para uma aplicação de IA. Qual é o principal benefício dessa combinação?",
        explanation:
            "Com o pgvector, o Aurora PostgreSQL armazena embeddings ao lado dos dados relacionais e faz busca por similaridade com SQL, sem um banco vetorial separado. O Aurora não gera nem treina modelos, não fornece modelos de linguagem, e a opção serverless é forma de implantação, não o benefício do pgvector.",
        topic: "RAG e customização",
        options: [
            ["Fazer busca por similaridade vetorial no próprio banco relacional", true],
            ["Gerar e treinar modelos de IA automaticamente a partir das tabelas", false],
            ["Oferecer modelos de linguagem pré-treinados prontos para consulta", false],
            ["Ganhar capacidade de computação serverless para rodar a aplicação", false],
        ],
    },
    {
        statement:
            "Uma empresa mantém vários aplicativos de IA generativa no Amazon Bedrock e quer versionar seus prompts, comparar variantes e voltar a uma versão anterior se a qualidade cair. Qual recurso do Amazon Bedrock atende a esses requisitos?",
        explanation:
            "O Prompt Management do Amazon Bedrock cria e guarda prompts, permite testar e comparar variantes e salvar versões, e a aplicação pode apontar de novo para uma versão anterior. Knowledge Bases serve ao RAG, Guardrails filtra conteúdo e as avaliações medem modelos, e nenhum deles controla versões de prompts.",
        topic: "Prompt engineering",
        options: [
            ["Prompt Management, que guarda versões e variantes de prompts", true],
            ["Knowledge Bases, que indexa documentos para consultas de RAG", false],
            ["Guardrails, que filtra conteúdo nocivo nas entradas e saídas", false],
            ["Avaliações, que medem e comparam o desempenho de modelos", false],
        ],
    },
    {
        statement:
            "Uma empresa colocou no ar um assistente de IA no Amazon Bedrock para atender solicitações de clientes e quer medir o quanto ele resolve os problemas sem precisar escalar para um atendente humano. Qual métrica captura melhor isso?",
        explanation:
            "A taxa de conclusão de tarefas mostra a porcentagem de solicitações que o assistente resolve por completo sem escalar para uma pessoa, o que se liga direto ao objetivo de negócio. BLEU mede qualidade de tradução, perplexidade mede o quanto o modelo prevê bem o texto e o número de parâmetros só indica tamanho.",
        topic: "Aplicações de foundation models",
        options: [
            ["Taxa de conclusão de tarefas", true],
            ["Pontuação BLEU", false],
            ["Perplexidade", false],
            ["Número de parâmetros do modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa quer saber se sua aplicação de IA generativa está trazendo resultado para o negócio, e não só se o texto gerado é bom. Quais DUAS métricas atendem a esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "Satisfação dos usuários mostra se a aplicação atende quem a usa e custo por interação mostra quanto cada atendimento custa, e as duas se ligam a resultados de negócio. BERTScore e ROUGE medem a qualidade técnica do texto contra referências, e o tempo de treinamento é métrica operacional, sem dizer se a meta foi atingida.",
        topic: "Aplicações de foundation models",
        options: [
            ["Satisfação dos usuários com as respostas recebidas", true],
            ["BERTScore das respostas em relação a textos de referência", false],
            ["Custo médio de cada interação atendida", true],
            ["Pontuação ROUGE dos resumos gerados pelo modelo", false],
            ["Tempo gasto no treinamento do modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa está montando um grafo de conhecimento e precisa guardar embeddings e fazer buscas por similaridade junto com as travessias do grafo, no mesmo banco. Qual serviço de banco de dados da AWS oferece consultas de grafo e busca vetorial?",
        explanation:
            "O Amazon Neptune Analytics guarda o grafo e um índice vetorial no mesmo lugar, então dá para combinar travessias com busca por vizinhos mais próximos. DynamoDB e ElastiCache até oferecem busca vetorial, mas não consultas de grafo, e o Redshift é um data warehouse analítico.",
        topic: "RAG e customização",
        options: [
            ["Amazon Neptune Analytics, grafos com índice vetorial", true],
            ["Amazon DynamoDB, banco chave-valor com índices vetoriais", false],
            ["Amazon Redshift, data warehouse com tabelas colunares", false],
            ["Amazon ElastiCache, cache em memória com busca vetorial", false],
        ],
    },
    {
        statement:
            "Uma empresa gera textos longos de marketing com um foundation model e quer avaliar a qualidade em grande escala sem depender de revisores humanos. Qual abordagem usa um segundo LLM para dar nota às respostas?",
        explanation:
            "Na abordagem de LLM como juiz, um segundo modelo avalia e pontua as respostas segundo critérios definidos, o que escala sem revisores humanos, e as avaliações do Amazon Bedrock oferecem esse tipo de job. BLEU depende de textos de referência, o benchmark usa respostas conhecidas e o teste A/B precisa de usuários reais.",
        topic: "Aplicações de foundation models",
        options: [
            ["LLM como juiz (LLM-as-a-judge)", true],
            ["Pontuação BLEU contra textos de referência", false],
            ["Comparação com um conjunto de dados de benchmark", false],
            ["Teste A/B com usuários reais", false],
        ],
    },
    {
        statement:
            "Uma empresa colocou em produção um assistente de suporte baseado em RAG e quer verificar se a etapa de recuperação traz documentos relevantes para as perguntas dos usuários. Qual abordagem a equipe deve usar?",
        explanation:
            "Avaliar a recuperação é conferir se os trechos trazidos para perguntas de teste batem com os documentos que deveriam vir, medindo precisão e recall, como faz a avaliação de RAG do Amazon Bedrock com dados de referência. Perplexidade mede o modelo de linguagem, contar chamadas mede uso e BLEU avalia texto gerado.",
        topic: "RAG e customização",
        options: [
            [
                "Comparar trechos recuperados com os documentos esperados em perguntas de teste",
                true,
            ],
            [
                "Medir a perplexidade do modelo de linguagem em um conjunto de dados separado para teste",
                false,
            ],
            ["Contar o total de chamadas de API feitas ao Amazon Bedrock no período", false],
            ["Calcular a pontuação BLEU das respostas finais geradas pelo modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa envia milhares de vezes por dia o mesmo prompt de sistema longo, e só a pergunta do usuário muda entre as chamadas. Ao escolher o foundation model, qual critério mais ajuda a reduzir latência e custo nesse cenário?",
        explanation:
            "Com cache de prompt, o prefixo repetido fica guardado e não é reprocessado a cada chamada, o que reduz latência e custo de tokens de entrada, e o suporte varia por modelo no Amazon Bedrock. Suporte a idiomas trata de cobertura linguística, complexidade da arquitetura liga-se à capacidade e difusão serve para imagens.",
        topic: "Aplicações de foundation models",
        options: [
            ["Suporte a cache de prompt", true],
            ["Suporte a vários idiomas", false],
            ["Complexidade da arquitetura do modelo", false],
            ["Capacidade de difusão", false],
        ],
    },
    {
        statement:
            "Uma empresa usa um foundation model grande no Amazon Bedrock, mas o custo de inferência ficou alto demais. Ela quer um modelo menor e mais barato que mantenha a maior parte da qualidade do modelo grande. Qual abordagem de customização atende a esse requisito?",
        explanation:
            "Na destilação, um modelo menor (student) aprende a imitar as respostas de um modelo maior (teacher) e fica mais rápido e barato, mantendo boa parte da qualidade, recurso do Amazon Bedrock Model Distillation. RAG traz documentos sem encolher o modelo, o pré-treinamento contínuo atualiza conhecimento e o aprendizado em contexto aumenta os tokens do prompt.",
        topic: "RAG e customização",
        options: [
            ["Destilação de modelo", true],
            ["Geração aumentada por recuperação (RAG)", false],
            ["Pré-treinamento contínuo", false],
            ["Aprendizado em contexto", false],
        ],
    },
    {
        statement:
            "Uma agência de viagens quer que, a partir de um único pedido do cliente, um sistema de IA consulte a disponibilidade de voos, compare preços entre companhias aéreas, emita as passagens e envie o e-mail de confirmação. Qual solução atende a esse requisito?",
        explanation:
            "Um agente de IA divide o pedido em etapas (buscar voos, comparar preços, emitir passagens e enviar a confirmação) e executa cada uma chamando as ferramentas e APIs certas. Um modelo de sumarização só condensa texto, a classificação só encaminha pedidos e a recomendação só sugere itens, sem executar ações.",
        topic: "Aplicações de foundation models",
        options: [
            ["Um agente de IA que orquestra as etapas chamando ferramentas e APIs", true],
            ["Um modelo de sumarização que resume as ofertas de voos disponíveis", false],
            ["Um modelo de classificação que encaminha o pedido ao setor responsável", false],
            ["Um mecanismo de recomendação que sugere os voos mais procurados", false],
        ],
    },
    {
        statement:
            "Um analista percebe que as respostas de um foundation model mudam muito de qualidade conforme a forma como ele redige o pedido. Quais DUAS práticas de prompt engineering tendem a melhorar esses resultados? (Selecione DUAS opções.)",
        explanation:
            "Instruções específicas e concisas deixam claro o que se espera, e testar estruturas diferentes e iterar mostra o que funciona melhor em cada tarefa. Linguagem vaga cria ambiguidade, encher o prompt até o limite de tokens gasta tokens com conteúdo irrelevante e tirar todo o contexto priva o modelo de informação necessária.",
        topic: "Prompt engineering",
        options: [
            ["Ser específico e conciso nas instruções da tarefa", true],
            ["Usar linguagem vaga para dar mais liberdade criativa ao modelo", false],
            ["Testar estruturas diferentes de prompt e iterar sobre elas", true],
            ["Preencher sempre o prompt até o limite máximo de tokens", false],
            ["Evitar qualquer contexto para manter o prompt curto", false],
        ],
    },
];
