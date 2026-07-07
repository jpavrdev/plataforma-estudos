// Seed do simulado Microsoft Azure AI Fundamentals (AI-901). Idempotente: se o
// simulado já tiver questões, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-ai-901.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "ai-901";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    {
        "statement": "Um modelo que aprova pedidos de crédito começou a recusar bem mais solicitações de um grupo específico por causa de um viés presente nos dados de treinamento. Qual princípio de IA responsável foi violado?",
        "explanation": "A imparcialidade exige tratar todas as pessoas de forma justa, sem favorecer nem prejudicar grupos; um viés que recusa mais pedidos de um grupo fere exatamente esse princípio. Transparência é explicar como o sistema funciona; confiabilidade e segurança, operar de forma segura e consistente; e inclusão, alcançar e empoderar todas as pessoas, inclusive as com deficiência. Nenhum descreve o problema de viés discriminatório.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Imparcialidade (fairness)",
                true
            ],
            [
                "Transparência (transparency)",
                false
            ],
            [
                "Confiabilidade e segurança (reliability & safety)",
                false
            ],
            [
                "Inclusão (inclusiveness)",
                false
            ]
        ]
    },
    {
        "statement": "Ao lançar um chatbot, a empresa publica uma explicação de como ele funciona, para que serve e quais são suas limitações, e deixa claro ao usuário que ele conversa com uma IA. Qual princípio de IA responsável isso representa?",
        "explanation": "Transparência é tornar o sistema compreensível: explicar como funciona, sua finalidade e limitações, e avisar que se trata de uma IA. Privacidade e segurança tratam da proteção dos dados; responsabilização, de quem responde pelo sistema; imparcialidade, de evitar viés. Nada disso é o foco de comunicar funcionamento e limites.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Privacidade e segurança (privacy & security)",
                false
            ],
            [
                "Responsabilização (accountability)",
                false
            ],
            [
                "Transparência (transparency)",
                true
            ],
            [
                "Imparcialidade (fairness)",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe adiciona legendas automáticas, compatibilidade com leitor de tela e controle por voz para que pessoas com deficiência também consigam usar a solução de IA. Qual princípio está sendo aplicado?",
        "explanation": "Inclusão é empoderar e alcançar todas as pessoas, especialmente quem tem deficiência ou costuma ser deixado de fora; recursos de acessibilidade são o exemplo clássico. Imparcialidade cuida de não discriminar grupos nas decisões; transparência, de explicar o sistema; confiabilidade e segurança, de operar com segurança. A acessibilidade se encaixa em inclusão.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Imparcialidade (fairness)",
                false
            ],
            [
                "Inclusão (inclusiveness)",
                true
            ],
            [
                "Transparência (transparency)",
                false
            ],
            [
                "Confiabilidade e segurança (reliability & safety)",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização designa uma equipe de governança que mantém supervisão humana sobre o sistema de IA e responde oficialmente por seus resultados. Qual princípio de IA responsável isso reflete?",
        "explanation": "Responsabilização significa que pessoas e organizações respondem pelos sistemas de IA que criam e operam, com governança e supervisão humana — a IA não assume a culpa sozinha. Inclusão trata de acessibilidade; transparência, de explicar o sistema; privacidade e segurança, de proteger dados. O foco em governança e em responder pelos resultados é responsabilização.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Inclusão (inclusiveness)",
                false
            ],
            [
                "Transparência (transparency)",
                false
            ],
            [
                "Privacidade e segurança (privacy & security)",
                false
            ],
            [
                "Responsabilização (accountability)",
                true
            ]
        ]
    },
    {
        "statement": "O piloto automático de um veículo precisa reagir de forma segura e consistente a uma condição de estrada que nunca apareceu no treinamento, o que exige testes rigorosos e monitoramento contínuo. Qual princípio orienta esse cuidado?",
        "explanation": "Confiabilidade e segurança exigem que o sistema funcione de forma confiável, consistente e segura mesmo diante de situações inesperadas, o que pede testes e monitoramento contínuos. Imparcialidade trata de viés; inclusão, de acessibilidade; transparência, de explicar o sistema. Reagir com segurança a um cenário novo é confiabilidade e segurança.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Confiabilidade e segurança (reliability & safety)",
                true
            ],
            [
                "Imparcialidade (fairness)",
                false
            ],
            [
                "Inclusão (inclusiveness)",
                false
            ],
            [
                "Transparência (transparency)",
                false
            ]
        ]
    },
    {
        "statement": "Antes de treinar um modelo com dados de pacientes, a equipe anonimiza as informações e restringe quem pode acessá-las, garantindo que sejam usadas apenas para o fim previsto. Qual princípio de IA responsável está em foco?",
        "explanation": "Privacidade e segurança tratam de proteger os dados das pessoas e respeitar a privacidade, com anonimização e controle de acesso, usando os dados só para o fim previsto. Cuidado com a pegadinha: confiabilidade e segurança referem-se à operação segura e consistente do sistema, não à proteção dos dados. Responsabilização é governança; transparência é explicar o sistema.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Confiabilidade e segurança (reliability & safety)",
                false
            ],
            [
                "Privacidade e segurança (privacy & security)",
                true
            ],
            [
                "Responsabilização (accountability)",
                false
            ],
            [
                "Transparência (transparency)",
                false
            ]
        ]
    },
    {
        "statement": "Qual é a diferença central entre os princípios de imparcialidade e de inclusão na IA responsável?",
        "explanation": "Imparcialidade (fairness) é não favorecer nem prejudicar grupos, evitando viés nas decisões; inclusão (inclusiveness) é garantir que a solução alcance e empodere todas as pessoas, com destaque para a acessibilidade. Não são o mesmo princípio; proteção de dados é privacidade e segurança; e a última opção inverte os dois conceitos.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Imparcialidade é tratar todos sem viés nas decisões; inclusão é empoderar e alcançar todas as pessoas, inclusive as com deficiência",
                true
            ],
            [
                "São o mesmo princípio, apenas com nomes diferentes",
                false
            ],
            [
                "Imparcialidade cuida da proteção dos dados e inclusão cuida da precisão do modelo",
                false
            ],
            [
                "Imparcialidade trata de acessibilidade e inclusão trata de evitar viés",
                false
            ]
        ]
    },
    {
        "statement": "Um banco precisa que seus analistas entendam quais fatores o modelo considerou ao negar um empréstimo e conheçam suas limitações, para conseguir explicar a decisão ao cliente. Qual princípio de IA responsável atende a essa necessidade?",
        "explanation": "Transparência é tornar o sistema compreensível — entender como ele decide e conhecer suas limitações (interpretabilidade). Responsabilização é sobre quem responde pelo sistema, não sobre entender a decisão; imparcialidade é evitar viés; confiabilidade e segurança é operar com segurança. Compreender e explicar como o modelo decidiu é transparência.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Responsabilização (accountability)",
                false
            ],
            [
                "Imparcialidade (fairness)",
                false
            ],
            [
                "Transparência (transparency)",
                true
            ],
            [
                "Confiabilidade e segurança (reliability & safety)",
                false
            ]
        ]
    },
    {
        "statement": "Após um incidente, a diretoria de uma empresa é chamada a responder oficialmente pelas decisões do sistema de IA e define quem tem autoridade para desativá-lo. Mesmo havendo testes e monitoramento, qual princípio descreve melhor essa responsabilização humana e de governança?",
        "explanation": "Responsabilização é o princípio de que pessoas e organizações respondem pelos sistemas de IA, com governança e autoridade para supervisionar e desativar. Confiabilidade e segurança aparecem nos testes e no monitoramento, mas descrevem a operação segura do sistema, não quem responde por ele. Transparência é explicar o funcionamento; imparcialidade é evitar viés. O foco em responder oficialmente e governar é responsabilização.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Confiabilidade e segurança (reliability & safety)",
                false
            ],
            [
                "Responsabilização (accountability)",
                true
            ],
            [
                "Transparência (transparency)",
                false
            ],
            [
                "Imparcialidade (fairness)",
                false
            ]
        ]
    },
    {
        "statement": "Antes de um modelo de linguagem processar uma frase, o texto é quebrado em unidades menores, que podem ser palavras inteiras ou pedaços de palavras. Como essas unidades são chamadas?",
        "explanation": "O modelo trabalha com tokens: palavras inteiras ou fragmentos de palavras em que o texto é dividido antes do processamento. Embeddings são vetores numéricos que representam significado; pixels são unidades de imagem; épocas são passagens completas pelos dados durante o treino. A unidade de texto do modelo é o token.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Tokens",
                true
            ],
            [
                "Embeddings",
                false
            ],
            [
                "Pixels",
                false
            ],
            [
                "Épocas",
                false
            ]
        ]
    },
    {
        "statement": "Em termos simples, como um modelo de linguagem grande (LLM) gera uma resposta em texto?",
        "explanation": "Um LLM gera texto prevendo, passo a passo, qual é o próximo token mais provável dado o contexto anterior. Ele não consulta um banco de FAQs, não copia trechos literais do treino nem segue regras gramaticais escritas à mão — é um modelo estatístico que aprende padrões e prevê a continuação mais provável.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Consultando um banco de dados de perguntas e respostas prontas",
                false
            ],
            [
                "Prevendo repetidamente o próximo token mais provável a partir do contexto",
                true
            ],
            [
                "Copiando trechos exatos dos documentos usados no treino",
                false
            ],
            [
                "Aplicando um conjunto de regras gramaticais programadas manualmente",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe precisa comparar o significado de milhares de textos para montar uma busca por similaridade semântica. Que tipo de representação, produzida por um modelo, é a base dessa comparação?",
        "explanation": "Embeddings são vetores numéricos que capturam o significado de um texto, permitindo medir semelhança semântica pela proximidade entre os vetores. Tokens são as unidades em que o texto é dividido; prompts de sistema definem o comportamento do modelo; caixas delimitadoras pertencem à visão computacional. A busca semântica se baseia em embeddings.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Embeddings (vetores numéricos que capturam o significado)",
                true
            ],
            [
                "Tokens",
                false
            ],
            [
                "Prompts de sistema",
                false
            ],
            [
                "Caixas delimitadoras (bounding boxes)",
                false
            ]
        ]
    },
    {
        "statement": "Qual arquitetura está por trás dos modelos generativos de texto modernos, com um mecanismo de atenção que pesa a importância de cada parte do texto para entender o contexto?",
        "explanation": "A arquitetura transformer, com seu mecanismo de atenção, é a base dos modelos generativos de texto atuais; a atenção permite ao modelo pesar quais partes do texto são mais relevantes para o contexto. CNNs são típicas de visão computacional; árvores de decisão e k-means são técnicas clássicas de ML sem esse mecanismo de atenção.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Transformer",
                true
            ],
            [
                "Rede neural convolucional (CNN)",
                false
            ],
            [
                "Árvore de decisão",
                false
            ],
            [
                "Agrupamento k-means",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer executar um modelo de linguagem em dispositivos com recursos limitados, com baixo custo e boa velocidade, aceitando um escopo de tarefas mais focado. Que escolha de modelo é a mais adequada?",
        "explanation": "Modelos de linguagem pequenos (SLMs), como a família Phi, são mais leves, rápidos e baratos e rodam com menos recursos (inclusive em dispositivos), com bom desempenho em tarefas focadas — exatamente o cenário descrito. Um LLM de maior porte seria mais pesado e caro; um modelo de embeddings serve para similaridade, não para gerar respostas; e um modelo de imagem não gera texto.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Um modelo de linguagem grande (LLM) de maior porte",
                false
            ],
            [
                "Um modelo de embeddings",
                false
            ],
            [
                "Um modelo de linguagem pequeno (SLM), como a família Phi",
                true
            ],
            [
                "Um modelo de geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "Um aplicativo precisa criar imagens originais a partir de descrições em texto escritas pelos usuários. Que tipo de modelo do catálogo do Microsoft Foundry atende a esse objetivo?",
        "explanation": "Criar imagens novas a partir de texto é tarefa de um modelo de geração de imagem. Análise de sentimento classifica emoção em texto; embeddings gera vetores para similaridade; transcrição de fala converte áudio em texto. Só o modelo de geração de imagem produz a saída visual pedida.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Um modelo de análise de sentimento",
                false
            ],
            [
                "Um modelo de geração de imagem",
                true
            ],
            [
                "Um modelo de embeddings",
                false
            ],
            [
                "Um modelo de transcrição de fala",
                false
            ]
        ]
    },
    {
        "statement": "Um assistente precisa receber a foto de um equipamento e responder, em texto, perguntas sobre o que aparece na imagem. Que tipo de modelo é o mais indicado?",
        "explanation": "Um modelo multimodal aceita mais de um tipo de entrada — neste caso, imagem e texto — e por isso consegue interpretar a foto e responder por escrito. Um modelo só de texto não enxerga a imagem; embeddings apenas gera vetores de similaridade; um modelo de geração de imagem cria imagens, mas não interpreta a que recebeu. O caso pede um modelo multimodal.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Um modelo multimodal, capaz de receber imagem e texto",
                true
            ],
            [
                "Um modelo somente de texto",
                false
            ],
            [
                "Um modelo de embeddings",
                false
            ],
            [
                "Um modelo de geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "No Microsoft Foundry, antes de construir a solução, uma equipe quer navegar e comparar modelos de vários provedores (OpenAI, Meta, Microsoft) por capacidade, desempenho e custo, para escolher o melhor para a tarefa. Qual recurso do Foundry serve a isso?",
        "explanation": "O catálogo de modelos do Microsoft Foundry é onde se navega, compara e seleciona modelos de diferentes provedores por capacidade, desempenho e custo. O playground serve para testar prompts depois que o modelo já foi implantado; um endpoint é o resultado da implantação, não a etapa de escolha; e o Content Understanding é para extrair informação de documentos, não para escolher modelos.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "O catálogo de modelos (model catalog)",
                true
            ],
            [
                "O playground de chat",
                false
            ],
            [
                "Um endpoint de implantação",
                false
            ],
            [
                "O Azure Content Understanding",
                false
            ]
        ]
    },
    {
        "statement": "No Microsoft Foundry (antigo Azure AI Foundry), o que precisa acontecer antes que um aplicativo cliente consiga enviar prompts a um modelo do catálogo?",
        "explanation": "Para um app consumir um modelo, ele precisa primeiro ser implantado no Foundry, o que expõe um endpoint que o aplicativo chama (por exemplo, via Foundry SDK). Os modelos do catálogo já vêm pré-treinados, então não é preciso treinar do zero; o app não baixa nem executa o modelo localmente; e não há necessidade de conversão manual para ONNX para usá-lo.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "O modelo precisa ser treinado do zero pela equipe",
                false
            ],
            [
                "O modelo precisa ser implantado (deploy), o que gera um endpoint para o app chamar",
                true
            ],
            [
                "O aplicativo precisa baixar o modelo e executá-lo localmente",
                false
            ],
            [
                "O modelo precisa ser convertido manualmente para o formato ONNX",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe quer disponibilizar um modelo do catálogo pagando por uso (por token) e sem provisionar nem gerenciar máquinas de computação. Qual opção de implantação do Microsoft Foundry se encaixa melhor?",
        "explanation": "A implantação como API serverless cobra por uso (por token) e mantém a infraestrutura gerenciada pela plataforma, sem você provisionar computação. O managed compute provisiona computação dedicada, dando mais controle, mas exigindo que você gerencie a capacidade; executar o modelo dentro do app não é uma opção de implantação do Foundry; e treinar um modelo personalizado é outra tarefa, não o que o cenário pede.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Implantação como API serverless (pague pelo uso)",
                true
            ],
            [
                "Managed compute (computação dedicada gerenciada por você)",
                false
            ],
            [
                "Executar o modelo dentro do próprio aplicativo cliente",
                false
            ],
            [
                "Treinar um modelo personalizado antes de publicar",
                false
            ]
        ]
    },
    {
        "statement": "Um redator quer que o modelo generativo produza respostas mais variadas e criativas, aceitando mais imprevisibilidade. Qual ajuste de parâmetro atende a isso?",
        "explanation": "A temperature controla a aleatoriedade da saída: aumentá-la torna as respostas mais variadas e criativas, enquanto reduzi-la (perto de zero) as torna mais determinísticas e previsíveis. Uma stop sequence apenas interrompe a geração num ponto; reduzir o max tokens só encurta a resposta. Para mais criatividade, aumenta-se a temperature.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "Definir uma stop sequence",
                false
            ],
            [
                "Reduzir o número máximo de tokens (max tokens)",
                false
            ],
            [
                "Aumentar a temperature",
                true
            ],
            [
                "Reduzir a temperature para perto de zero",
                false
            ]
        ]
    },
    {
        "statement": "As respostas de um modelo estão sendo cortadas no meio, e o desenvolvedor quer permitir saídas mais longas. Qual parâmetro ele deve ajustar?",
        "explanation": "O parâmetro de máximo de tokens define o tamanho limite da resposta gerada; se as respostas estão sendo cortadas, é ele que precisa ser aumentado. A temperature controla a aleatoriedade, não o tamanho; o top-p controla a diversidade da amostragem; e a presence penalty reduz repetição de temas. Vale notar que aumentar o max tokens não deixa a resposta mais 'precisa', apenas permite que ela seja mais longa.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "A temperature",
                false
            ],
            [
                "O número máximo de tokens da resposta (max tokens)",
                true
            ],
            [
                "O top-p",
                false
            ],
            [
                "A presence penalty",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe já está ajustando a temperature de um modelo e a documentação recomenda não mexer nos dois parâmetros ao mesmo tempo. O que o parâmetro top-p (amostragem por núcleo) controla?",
        "explanation": "O top-p (nucleus sampling) controla a diversidade limitando a amostragem ao menor conjunto de tokens mais prováveis cuja soma de probabilidades chega a p; valores menores tornam a saída mais focada. Por isso a recomendação é ajustar a temperature ou o top-p, não os dois juntos. O tamanho da resposta é o max tokens; o número de respostas é outro parâmetro; e penalizar repetição é a frequency/presence penalty.",
        "topic": "IA responsável e modelos",
        "options": [
            [
                "A diversidade da saída, limitando a escolha ao menor conjunto de tokens mais prováveis cuja soma de probabilidades atinge p",
                true
            ],
            [
                "O tamanho máximo da resposta gerada",
                false
            ],
            [
                "Quantas respostas alternativas o modelo retorna por chamada",
                false
            ],
            [
                "A penalização de tokens que se repetem na resposta",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer processar milhares de avaliações de clientes já escritas para identificar o tom (positivo, negativo ou neutro) de cada uma. Qual carga de trabalho de IA melhor descreve esse cenário?",
        "explanation": "A análise de texto extrai informação de textos já escritos, e a análise de sentimento (positivo, negativo ou neutro) é uma de suas técnicas. No Azure, essas técnicas ficam no Azure AI Language. Visão, fala e geração de imagem tratam de outros tipos de conteúdo.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Análise de texto",
                true
            ],
            [
                "Visão computacional",
                false
            ],
            [
                "Reconhecimento de fala",
                false
            ],
            [
                "Geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "Um aplicativo recebe uma breve descrição em linguagem natural e produz, a partir dela, um texto de marketing inédito. Que carga de trabalho de IA representa isso?",
        "explanation": "Criar conteúdo novo (texto, imagem, código) a partir de um prompt é o papel da IA generativa. A análise de texto e a extração de informação apenas retiram dados de conteúdos que já existem, sem criar algo novo.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "IA generativa",
                true
            ],
            [
                "Análise de texto",
                false
            ],
            [
                "Extração de informação",
                false
            ],
            [
                "Visão computacional",
                false
            ]
        ]
    },
    {
        "statement": "Uma solução recebe um objetivo em alto nível ('reorganize minha agenda evitando conflitos'), decide sozinha os passos, aciona ferramentas e executa as ações necessárias até concluir a tarefa. Qual carga de trabalho descreve esse comportamento?",
        "explanation": "A IA agêntica planeja e executa uma sequência de ações de forma autônoma para atingir um objetivo, acionando ferramentas. Ela costuma se apoiar em modelos generativos, mas vai além de apenas gerar conteúdo: ela age.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "IA agêntica",
                true
            ],
            [
                "IA generativa",
                false
            ],
            [
                "Análise de texto",
                false
            ],
            [
                "Extração de informação",
                false
            ]
        ]
    },
    {
        "statement": "Um time precisa transformar faturas em PDF em campos estruturados (fornecedor, valor total, vencimento) para lançar em um sistema financeiro. Qual carga de trabalho de IA é a indicada?",
        "explanation": "A extração de informação converte documentos e mídia não estruturados em dados organizados (campos como fornecedor, valor e data). No Azure, o serviço é o Azure Content Understanding. A análise de texto trabalharia sobre texto solto, não sobre a estrutura do documento.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Extração de informação",
                true
            ],
            [
                "Análise de texto",
                false
            ],
            [
                "IA generativa",
                false
            ],
            [
                "Reconhecimento de fala",
                false
            ]
        ]
    },
    {
        "statement": "Uma plataforma de reuniões precisa gerar automaticamente a transcrição em texto de tudo o que os participantes falam em áudio. Qual carga de trabalho atende a essa necessidade?",
        "explanation": "O reconhecimento de fala (speech-to-text) converte áudio falado em texto, o que gera transcrições e legendas. A síntese de fala faz o caminho inverso (texto em voz). O serviço no Azure é o Azure AI Speech.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Reconhecimento de fala (speech-to-text)",
                true
            ],
            [
                "Síntese de fala (text-to-speech)",
                false
            ],
            [
                "Análise de texto",
                false
            ],
            [
                "Extração de informação",
                false
            ]
        ]
    },
    {
        "statement": "Qual afirmação distingue corretamente uma carga de IA generativa de uma carga de IA agêntica?",
        "explanation": "A IA generativa produz conteúdo novo (texto, imagem, código). A IA agêntica usa esses modelos, mas seu diferencial é planejar e executar ações de forma autônoma, acionando ferramentas até cumprir um objetivo.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "A IA generativa cria conteúdo novo a partir de um prompt; a IA agêntica vai além e planeja e executa uma sequência de ações de forma autônoma para atingir um objetivo",
                true
            ],
            [
                "A IA generativa executa ações no mundo real, enquanto a agêntica apenas escreve texto",
                false
            ],
            [
                "São o mesmo conceito, apenas com nomes diferentes",
                false
            ],
            [
                "A IA agêntica só classifica texto, enquanto a generativa lê imagens",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe de suporte quer descobrir rapidamente os assuntos principais de milhares de tíquetes, sem ler cada um. Qual técnica de análise de texto entrega os termos e assuntos centrais de um texto?",
        "explanation": "A extração de frases-chave identifica os principais termos e assuntos de um texto, resumindo sobre o que ele fala. É ideal para descobrir os temas recorrentes em muitos textos sem lê-los por completo.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Extração de frases-chave (key phrase extraction)",
                true
            ],
            [
                "Análise de sentimento",
                false
            ],
            [
                "Reconhecimento de entidades",
                false
            ],
            [
                "Sumarização",
                false
            ]
        ]
    },
    {
        "statement": "Um sistema jurídico precisa localizar e classificar nomes de pessoas, organizações e datas mencionados em contratos. Qual técnica de análise de texto faz isso?",
        "explanation": "O reconhecimento de entidades encontra e classifica itens citados no texto, como pessoas, organizações, lugares, datas e valores. As frases-chave trariam apenas assuntos gerais, sem classificar cada item por tipo.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Reconhecimento de entidades (entity detection)",
                true
            ],
            [
                "Extração de frases-chave",
                false
            ],
            [
                "Sumarização",
                false
            ],
            [
                "Análise de sentimento",
                false
            ]
        ]
    },
    {
        "statement": "Uma marca quer classificar comentários de redes sociais como positivos, negativos ou neutros para acompanhar sua reputação. Qual técnica de análise de texto é a correta?",
        "explanation": "A análise de sentimento classifica o tom do texto como positivo, negativo ou neutro, servindo para medir satisfação e reputação. As demais técnicas extraem entidades, resumos ou assuntos, não o tom.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Análise de sentimento",
                true
            ],
            [
                "Reconhecimento de entidades",
                false
            ],
            [
                "Sumarização",
                false
            ],
            [
                "Extração de frases-chave",
                false
            ]
        ]
    },
    {
        "statement": "Um gerente recebe relatórios longos e quer, para cada um, um parágrafo curto e coeso com os pontos essenciais, preservando o sentido do documento. Qual técnica é a mais indicada?",
        "explanation": "A sumarização gera um resumo curto e coeso com os pontos essenciais de um texto longo. A extração de frases-chave apenas lista termos soltos, sem formar um resumo que preserve o sentido do documento.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Sumarização",
                true
            ],
            [
                "Extração de frases-chave",
                false
            ],
            [
                "Reconhecimento de entidades",
                false
            ],
            [
                "Análise de sentimento",
                false
            ]
        ]
    },
    {
        "statement": "Análise de sentimento, reconhecimento de entidades, extração de frases-chave e sumarização de texto são recursos de qual serviço do Azure?",
        "explanation": "As técnicas de análise de texto ficam no Azure AI Language. O AI Vision trata de imagens, o AI Speech de fala e o Content Understanding da extração de informação de documentos e mídia.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Azure AI Language",
                true
            ],
            [
                "Azure AI Vision",
                false
            ],
            [
                "Azure AI Speech",
                false
            ],
            [
                "Azure Content Understanding",
                false
            ]
        ]
    },
    {
        "statement": "Uma pesquisa quer extrair de artigos apenas as menções a locais geográficos e datas específicas citadas no texto, cada uma classificada por tipo. Considerando as técnicas de análise de texto, qual atende melhor?",
        "explanation": "Reconhecer e classificar itens por tipo (local, data, pessoa, valor) é o papel do reconhecimento de entidades. A extração de frases-chave devolveria os assuntos gerais do texto, sem separar cada menção por categoria.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Reconhecimento de entidades",
                true
            ],
            [
                "Extração de frases-chave",
                false
            ],
            [
                "Sumarização",
                false
            ],
            [
                "Análise de sentimento",
                false
            ]
        ]
    },
    {
        "statement": "Um app de acessibilidade precisa ler em voz alta, com voz natural, o texto que aparece na tela. Qual capacidade de fala é essa?",
        "explanation": "A síntese de fala (text-to-speech) transforma texto em voz natural, dando voz a assistentes e leitores de tela. O reconhecimento de fala faz o inverso (áudio em texto). Ambas ficam no Azure AI Speech.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Síntese de fala (text-to-speech)",
                true
            ],
            [
                "Reconhecimento de fala (speech-to-text)",
                false
            ],
            [
                "Tradução de fala",
                false
            ],
            [
                "Análise de texto",
                false
            ]
        ]
    },
    {
        "statement": "Reconhecimento de fala (transcrição), síntese de fala e tradução de fala entre idiomas são capacidades de qual serviço clássico do Azure?",
        "explanation": "O Azure AI Speech reúne o reconhecimento de fala, a síntese de fala e a tradução de fala. O Azure AI Language trata de texto escrito, não de áudio falado.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Azure AI Speech",
                true
            ],
            [
                "Azure AI Language",
                false
            ],
            [
                "Azure AI Vision",
                false
            ],
            [
                "Azure Content Understanding",
                false
            ]
        ]
    },
    {
        "statement": "Uma central de atendimento grava as ligações e quer, primeiro, converter o áudio das chamadas em texto para, depois, analisar o sentimento das conversas. Qual carga trata a PRIMEIRA etapa (áudio falado convertido em texto)?",
        "explanation": "A primeira etapa é o reconhecimento de fala (speech-to-text), no Azure AI Speech, que gera a transcrição. Só depois a análise de sentimento (Azure AI Language) atua sobre o texto transcrito. São duas cargas encadeadas.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Reconhecimento de fala",
                true
            ],
            [
                "Análise de texto",
                false
            ],
            [
                "Síntese de fala",
                false
            ],
            [
                "Geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "Um designer digita 'um gato astronauta em aquarela' e o sistema cria uma imagem inédita a partir dessa descrição. Que tipo de carga de IA é essa?",
        "explanation": "Criar uma imagem nova a partir de um texto é geração de imagem, uma aplicação de IA generativa. Interpretar, ler texto (OCR) ou detectar objetos são análises de uma imagem que já existe, não criação.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Geração de imagem (IA generativa)",
                true
            ],
            [
                "Interpretação de imagem (visão computacional)",
                false
            ],
            [
                "OCR",
                false
            ],
            [
                "Detecção de objetos",
                false
            ]
        ]
    },
    {
        "statement": "Um app precisa ler o texto impresso em fotos de placas e documentos para digitalizá-lo. Qual capacidade de visão computacional é usada?",
        "explanation": "O OCR (reconhecimento óptico de caracteres) extrai o texto presente em uma imagem. A detecção de objetos localiza itens, a classificação rotula a cena e a geração cria imagens novas.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "OCR (reconhecimento óptico de caracteres)",
                true
            ],
            [
                "Detecção de objetos",
                false
            ],
            [
                "Classificação de imagem",
                false
            ],
            [
                "Geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "Qual cenário é de VISÃO COMPUTACIONAL de interpretação, e não de geração de imagem?",
        "explanation": "A visão computacional de interpretação analisa uma imagem que já existe (descrever, classificar, detectar objetos, ler texto). As outras opções criam imagens novas a partir de texto, o que é geração de imagem (IA generativa).",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Descrever o conteúdo de uma foto e detectar os objetos presentes nela",
                true
            ],
            [
                "Criar uma ilustração nova a partir de uma frase",
                false
            ],
            [
                "Produzir um logotipo a partir de uma descrição em texto",
                false
            ],
            [
                "Gerar variações artísticas a partir de um prompt",
                false
            ]
        ]
    },
    {
        "statement": "Um sistema precisa analisar imagens já existentes para classificar a cena, detectar objetos e ler texto (OCR). Qual serviço clássico do Azure é o indicado?",
        "explanation": "O Azure AI Vision é o serviço para interpretar imagens: classificação, detecção de objetos, OCR e descrição de conteúdo. Os demais serviços tratam de texto, fala e extração de informação de documentos e mídia.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Azure AI Vision",
                true
            ],
            [
                "Azure AI Language",
                false
            ],
            [
                "Azure AI Speech",
                false
            ],
            [
                "Azure Content Understanding",
                false
            ]
        ]
    },
    {
        "statement": "Um assistente recebe uma foto junto da pergunta 'quantas pessoas há nesta imagem e o que elas estão fazendo?' e responde em texto. Que tipo de modelo torna isso possível?",
        "explanation": "Modelos multimodais aceitam mais de um tipo de entrada (como imagem e texto) e conseguem interpretar a imagem para responder em linguagem natural. Um modelo somente de texto não enxergaria a foto.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Um modelo multimodal, que aceita imagem como entrada e responde em texto",
                true
            ],
            [
                "Um modelo somente de texto",
                false
            ],
            [
                "Um modelo de síntese de fala",
                false
            ],
            [
                "Um modelo de extração de frases-chave",
                false
            ]
        ]
    },
    {
        "statement": "Uma emissora quer extrair, de vídeos gravados, informações estruturadas como as falas transcritas, as pessoas que aparecem e os temas abordados. Qual serviço do Azure é feito para extrair informação de documentos, imagens, áudio e vídeo?",
        "explanation": "O Azure Content Understanding faz a extração de informação multimodal, retirando dados estruturados de documentos, imagens, áudio e vídeo. Os outros serviços cobrem apenas uma modalidade cada.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "Azure Content Understanding",
                true
            ],
            [
                "Azure AI Language",
                false
            ],
            [
                "Azure AI Vision",
                false
            ],
            [
                "Azure AI Speech",
                false
            ]
        ]
    },
    {
        "statement": "Qual afirmação distingue corretamente extração de informação de análise de texto?",
        "explanation": "A extração de informação (Azure Content Understanding) transforma documentos e mídia não estruturados em campos organizados, inclusive de imagem, áudio e vídeo. A análise de texto (Azure AI Language) atua sobre texto que já está escrito.",
        "topic": "Cargas e capacidades de IA",
        "options": [
            [
                "A extração de informação tira dados estruturados de dentro de documentos e mídia (inclusive imagem, áudio e vídeo); a análise de texto trabalha sobre um texto que já está escrito",
                true
            ],
            [
                "A análise de texto só funciona com imagens e a extração de informação só com texto",
                false
            ],
            [
                "As duas são sinônimos e usam exatamente o mesmo serviço",
                false
            ],
            [
                "A extração de informação gera imagens novas a partir de texto",
                false
            ]
        ]
    },
    {
        "statement": "Uma desenvolvedora quer que o modelo generativo se comporte sempre como um atendente de suporte cordial, responda em português e nunca revele informações internas da empresa, valendo para todas as conversas do app. Onde ela deve definir esse comportamento?",
        "explanation": "O prompt de sistema define papel, tom e regras que o modelo segue durante toda a conversa, sendo o lugar certo para instruções persistentes de comportamento. O prompt de usuário carrega a pergunta de cada turno, e temperatura ou nome do deployment não controlam o comportamento.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "No prompt de sistema (mensagem de sistema)",
                true
            ],
            [
                "No prompt de usuário, repetindo as regras a cada pergunta",
                false
            ],
            [
                "No nome do deployment do modelo",
                false
            ],
            [
                "No parâmetro de temperatura",
                false
            ]
        ]
    },
    {
        "statement": "Em um chat com um modelo generativo, a pergunta específica que a pessoa digita a cada interação, como 'Qual o horário de funcionamento da loja?', é enviada em qual tipo de mensagem?",
        "explanation": "O prompt de usuário representa a entrada da pessoa em cada turno da conversa. O prompt de sistema fica reservado às instruções gerais de comportamento, definidas uma vez para toda a sessão.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Prompt de usuário (mensagem de usuário)",
                true
            ],
            [
                "Prompt de sistema (mensagem de sistema)",
                false
            ],
            [
                "Mensagem de ferramenta (tool)",
                false
            ],
            [
                "Nome do deployment",
                false
            ]
        ]
    },
    {
        "statement": "Depois de escolher um modelo generativo no catálogo de modelos do Microsoft Foundry, o que a equipe precisa fazer antes de conseguir chamá-lo a partir de um aplicativo?",
        "explanation": "No Foundry, escolher o modelo no catálogo não basta: é preciso implantá-lo (deploy) em um projeto. O deploy cria um endpoint e um nome de deployment que o app usa para enviar prompts. Modelos generativos pré-treinados não exigem treinar do zero nem rotular dados.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Fazer o deploy (implantar) do modelo para obter um endpoint e um nome de deployment",
                true
            ],
            [
                "Treinar o modelo do zero com dados próprios",
                false
            ],
            [
                "Rotular manualmente um conjunto de dados de exemplo",
                false
            ],
            [
                "Nada, o modelo do catálogo já fica acessível por código",
                false
            ]
        ]
    },
    {
        "statement": "Antes de escrever qualquer linha de código, um analista quer testar prompts e ver como o modelo implantado responde, tudo pela interface do portal. Qual recurso do Microsoft Foundry atende a isso?",
        "explanation": "O playground do portal permite conversar com o modelo implantado e experimentar prompts de sistema e de usuário sem escrever código. É o caminho para validar prompts antes de partir para o SDK.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O playground de chat do portal do Foundry",
                true
            ],
            [
                "O Foundry SDK em um script Python",
                false
            ],
            [
                "Uma máquina virtual com o modelo instalado",
                false
            ],
            [
                "Um cluster de treinamento do Azure Machine Learning",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe quer navegar por vários modelos generativos disponíveis, comparar suas capacidades e escolher o mais adequado ao cenário. O que o Microsoft Foundry oferece para isso?",
        "explanation": "O catálogo de modelos reúne os modelos disponíveis no Foundry, permitindo comparar e escolher pela capacidade antes de implantar. Thread, filtro de conteúdo e nome de deployment cumprem outras funções.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O catálogo de modelos (model catalog)",
                true
            ],
            [
                "O thread de conversa do agente",
                false
            ],
            [
                "O filtro de conteúdo",
                false
            ],
            [
                "O nome do deployment",
                false
            ]
        ]
    },
    {
        "statement": "Ao criar uma solução single-agent no portal do Microsoft Foundry, onde você descreve o papel do agente e as regras que ele deve seguir ao responder?",
        "explanation": "As instruções do agente funcionam como sua orientação de comportamento, equivalentes a um prompt de sistema: definem papel, tom e regras. O thread guarda a conversa e o run executa o agente; nenhum dos dois define comportamento.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Nas instruções (instructions) do agente",
                true
            ],
            [
                "No identificador do thread",
                false
            ],
            [
                "No objeto de run da execução",
                false
            ],
            [
                "No número da versão da API",
                false
            ]
        ]
    },
    {
        "statement": "Para que serve o Foundry SDK (por exemplo, a biblioteca azure-ai-projects) em um aplicativo?",
        "explanation": "O Foundry SDK permite que o código se conecte ao projeto do Foundry e envie prompts aos modelos ou orquestre agentes implantados. Ele não cria VMs, não desenha telas nem treina modelos de visão do zero.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Conectar o app a um projeto do Foundry e interagir por código com os modelos e agentes implantados",
                true
            ],
            [
                "Criar e gerenciar máquinas virtuais no Azure",
                false
            ],
            [
                "Desenhar a interface visual do aplicativo",
                false
            ],
            [
                "Treinar modelos de visão computacional do zero",
                false
            ]
        ]
    },
    {
        "statement": "Um modelo generativo está dando respostas muito variadas e imprevisíveis para a mesma pergunta, e a equipe quer saídas mais consistentes e diretas. Qual ajuste faz sentido?",
        "explanation": "A temperatura controla a aleatoriedade da geração. Valores mais baixos deixam as respostas mais determinísticas e consistentes; valores altos aumentam a criatividade e a variação. Trocar o deployment ou o tipo de mensagem não resolve o problema.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Reduzir a temperatura (temperature)",
                true
            ],
            [
                "Aumentar a temperatura (temperature)",
                false
            ],
            [
                "Trocar o nome do deployment",
                false
            ],
            [
                "Enviar a pergunta como prompt de sistema",
                false
            ]
        ]
    },
    {
        "statement": "Um aplicativo precisa receber, na mesma solicitação, uma foto de um produto e uma pergunta em texto sobre ela. Que tipo de modelo a equipe deve escolher no catálogo do Foundry?",
        "explanation": "Modelos multimodais aceitam mais de um tipo de entrada, como texto e imagem juntos, e conseguem raciocinar sobre ambos. Um modelo só de texto não interpreta a foto, e embeddings ou síntese de fala servem a outros propósitos.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Um modelo multimodal",
                true
            ],
            [
                "Um modelo somente de texto",
                false
            ],
            [
                "Um modelo de embeddings",
                false
            ],
            [
                "Um modelo apenas de síntese de fala",
                false
            ]
        ]
    },
    {
        "statement": "Observe o trecho:\n\nmessages=[\n    {\"role\": \"system\", \"content\": \"Você é um assistente que responde de forma curta e formal.\"},\n    {\"role\": \"user\", \"content\": \"Resuma as vantagens da computação em nuvem.\"}\n]\n\nQual mensagem define o comportamento geral do assistente?",
        "explanation": "A mensagem de role 'system' carrega as instruções de comportamento (tom curto e formal). A mensagem de role 'user' traz a solicitação específica daquele turno. Separar as duas é o padrão de prompts de sistema e de usuário.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "A mensagem com role 'system'",
                true
            ],
            [
                "A mensagem com role 'user'",
                false
            ],
            [
                "As duas definem o comportamento por igual",
                false
            ],
            [
                "Nenhuma; o comportamento vem do nome do modelo",
                false
            ]
        ]
    },
    {
        "statement": "Em um app com o Foundry SDK aparece:\n\nproject = AIProjectClient(\n    endpoint=project_endpoint,\n    credential=DefaultAzureCredential()\n)\n\nO que o valor de endpoint identifica?",
        "explanation": "O endpoint aponta para o projeto do Foundry, dando ao SDK o ponto de entrada para acessar modelos e agentes implantados naquele projeto. Não é conta de armazenamento nem arquivo local de pesos.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O projeto do Foundry ao qual o aplicativo se conecta",
                true
            ],
            [
                "A conta de armazenamento onde ficam os logs",
                false
            ],
            [
                "O arquivo local com os pesos do modelo",
                false
            ],
            [
                "O navegador usado para abrir o portal",
                false
            ]
        ]
    },
    {
        "statement": "Considere:\n\nresponse = chat.complete(\n    model=model_deployment,\n    messages=messages\n)\n\nO que o argumento model=model_deployment referencia?",
        "explanation": "Ao chamar o modelo pelo SDK, model recebe o nome do deployment criado quando o modelo foi implantado no projeto. Não é um arquivo local, nem a versão do SDK, nem um thread.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O nome do deployment do modelo implantado no Foundry",
                true
            ],
            [
                "O caminho de um arquivo de modelo no disco",
                false
            ],
            [
                "A versão instalada do Foundry SDK",
                false
            ],
            [
                "O identificador do thread da conversa",
                false
            ]
        ]
    },
    {
        "statement": "No código de um agente aparece:\n\nthread = project.agents.threads.create()\n\nPara que serve esse thread?",
        "explanation": "O thread representa a conversa: ele mantém as mensagens trocadas, permitindo que o agente acompanhe o contexto entre turnos. O deploy, as instruções e o filtro de conteúdo são responsabilidades separadas.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Guardar o histórico e o estado da conversa entre o usuário e o agente",
                true
            ],
            [
                "Implantar o modelo no projeto",
                false
            ],
            [
                "Definir as instruções de comportamento do agente",
                false
            ],
            [
                "Aplicar o filtro de conteúdo às respostas",
                false
            ]
        ]
    },
    {
        "statement": "Em um app de agente aparece:\n\nrun = project.agents.runs.create_and_process(\n    thread_id=thread.id,\n    agent_id=agent.id\n)\n\nO que essa chamada faz?",
        "explanation": "O run coloca o agente para processar as mensagens do thread e produzir a resposta. Ele não cria o agente (isso é feito antes), não exclui o thread nem implanta modelos.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Executa o agente sobre o thread para gerar a resposta",
                true
            ],
            [
                "Cria um novo agente no projeto",
                false
            ],
            [
                "Exclui o thread da conversa",
                false
            ],
            [
                "Implanta um novo modelo no Foundry",
                false
            ]
        ]
    },
    {
        "statement": "Qual é o efeito da chamada abaixo em um app de agente?\n\nproject.agents.messages.create(\n    thread_id=thread.id,\n    role=\"user\",\n    content=\"Meu pedido ainda não chegou.\"\n)",
        "explanation": "messages.create insere uma nova mensagem (aqui, do usuário) no thread indicado, alimentando a conversa que o agente vai processar no próximo run. Não cria agente nem troca o modelo.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Adiciona a mensagem do usuário ao thread da conversa",
                true
            ],
            [
                "Cria o agente com essas instruções",
                false
            ],
            [
                "Troca o modelo implantado do agente",
                false
            ],
            [
                "Abre o playground do portal",
                false
            ]
        ]
    },
    {
        "statement": "As respostas de um assistente estão saindo longas e informais, mas a equipe quer respostas curtas e formais em todo o app, sem alterar o código de cada pergunta. Qual é a melhor abordagem?",
        "explanation": "Tom e formato de resposta se controlam pelo prompt de sistema, que vale para toda a conversa sem precisar mexer em cada prompt de usuário. Temperatura mexe na aleatoriedade, não no tom; credencial e projeto não têm relação com o estilo da resposta.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Escrever no prompt de sistema instruções para responder de forma curta e formal",
                true
            ],
            [
                "Aumentar a temperatura do modelo",
                false
            ],
            [
                "Trocar a credencial de autenticação",
                false
            ],
            [
                "Criar um novo projeto no Foundry para cada pergunta",
                false
            ]
        ]
    },
    {
        "statement": "As respostas de um modelo generativo estão sendo cortadas no meio da frase, e a equipe quer permitir textos mais longos. Qual parâmetro de configuração deve ser ajustado?",
        "explanation": "O limite de tokens de saída define quantos tokens o modelo pode gerar na resposta. Se as respostas estão sendo truncadas, aumentar esse limite resolve. Temperatura afeta a variação, não o comprimento máximo.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O máximo de tokens de saída (max tokens)",
                true
            ],
            [
                "A temperatura (temperature)",
                false
            ],
            [
                "O nome do deployment",
                false
            ],
            [
                "O prompt de sistema",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe implantou um modelo do catálogo e deu ao deployment o nome 'chat-prod'. No aplicativo, qual valor deve ser passado no argumento model= da chamada de chat?",
        "explanation": "O SDK identifica o modelo pelo nome do deployment definido na implantação, aqui 'chat-prod'. O endpoint conecta ao projeto e a versão da API é outro parâmetro; nenhum deles vai no argumento model.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "'chat-prod', o nome do deployment criado",
                true
            ],
            [
                "O nome de família do modelo, sempre em letras maiúsculas",
                false
            ],
            [
                "O endpoint completo do projeto",
                false
            ],
            [
                "A versão da API usada pelo SDK",
                false
            ]
        ]
    },
    {
        "statement": "No trecho abaixo, qual é o papel de DefaultAzureCredential()?\n\nproject = AIProjectClient(\n    endpoint=project_endpoint,\n    credential=DefaultAzureCredential()\n)",
        "explanation": "A credencial cuida da autenticação, provando ao Foundry quem é o aplicativo, sem embutir segredos no código. Ela não escolhe modelo, não define temperatura nem cria threads.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Autenticar o aplicativo no projeto do Foundry usando a identidade do Azure",
                true
            ],
            [
                "Escolher qual modelo do catálogo será usado",
                false
            ],
            [
                "Definir a temperatura das respostas",
                false
            ],
            [
                "Criar o thread da conversa",
                false
            ]
        ]
    },
    {
        "statement": "Ao montar uma solução single-agent simples no portal do Foundry, o que NÃO é necessário?",
        "explanation": "Um agente simples reutiliza um modelo generativo já pronto do catálogo: basta implantá-lo, nomear o agente e escrever suas instruções. Treinar um modelo do zero não faz parte do fluxo de criação de um single-agent.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Escrever um pipeline para treinar o modelo do zero",
                true
            ],
            [
                "Selecionar e implantar um modelo para o agente usar",
                false
            ],
            [
                "Dar um nome ao agente",
                false
            ],
            [
                "Escrever as instruções do agente",
                false
            ]
        ]
    },
    {
        "statement": "Um app usa um modelo multimodal implantado no Foundry e precisa enviar, na mesma pergunta, uma imagem e um texto. Como isso normalmente é feito?",
        "explanation": "Modelos multimodais recebem imagem e texto no conteúdo da mensagem de usuário e raciocinam sobre os dois juntos. Não é preciso treinar um modelo de visão à parte, e a imagem não vai no prompt de sistema nem precisa virar áudio.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Incluindo a imagem junto com o texto no conteúdo da mensagem de usuário",
                true
            ],
            [
                "Enviando a imagem apenas no prompt de sistema",
                false
            ],
            [
                "Treinando um modelo de visão separado antes de cada chamada",
                false
            ],
            [
                "Convertendo a imagem em áudio antes de enviar",
                false
            ]
        ]
    },
    {
        "statement": "Em uma conversa de vários turnos enviada a um modelo de chat, com que role as respostas anteriores geradas pelo próprio modelo devem ser incluídas para preservar o contexto?",
        "explanation": "As mensagens têm roles: 'system' para instruções gerais, 'user' para a entrada da pessoa e 'assistant' para as respostas do modelo. Incluir os turnos anteriores do assistente com esse role preserva o histórico da conversa. Não existe role 'deployment'.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Com o role 'assistant'",
                true
            ],
            [
                "Com o role 'system'",
                false
            ],
            [
                "Com o role 'user'",
                false
            ],
            [
                "Com o role 'deployment'",
                false
            ]
        ]
    },
    {
        "statement": "Um modelo foi implantado no Foundry com o nome de deployment 'assistente-loja'. Mesmo assim, a chamada abaixo retorna erro de modelo não encontrado:\n\nresponse = chat.complete(\n    model=\"gpt-4o-mini\",\n    messages=messages\n)\n\nQual é a causa mais provável?",
        "explanation": "O SDK localiza o modelo pelo nome do deployment definido na implantação. Passar o nome base do catálogo ('gpt-4o-mini') em vez de 'assistente-loja' provoca erro de modelo não encontrado. O formato das mensagens e a temperatura não causam esse erro.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O argumento model deveria receber o nome do deployment, 'assistente-loja', e não o nome base do modelo",
                true
            ],
            [
                "A lista messages está no formato errado",
                false
            ],
            [
                "Faltou aumentar a temperatura na chamada",
                false
            ],
            [
                "O DefaultAzureCredential não aceita modelos generativos",
                false
            ]
        ]
    },
    {
        "statement": "Um desenvolvedor criou o agente, criou o thread e adicionou a mensagem do usuário, mas o app nunca recebe uma resposta do agente:\n\nagent = project.agents.create_agent(model=deployment, name=\"suporte\", instructions=\"...\")\nthread = project.agents.threads.create()\nproject.agents.messages.create(thread_id=thread.id, role=\"user\", content=\"Preciso de ajuda.\")\n\nO que está faltando?",
        "explanation": "Adicionar a mensagem ao thread não faz o agente responder: é preciso iniciar um run (por exemplo, runs.create_and_process) para que o agente processe o thread e gere a resposta. Uma segunda mensagem de sistema ou trocar o modelo não resolveriam a ausência de resposta.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Criar e processar um run para o agente executar sobre o thread",
                true
            ],
            [
                "Adicionar uma segunda mensagem de sistema ao thread",
                false
            ],
            [
                "Implantar um modelo multimodal no lugar do atual",
                false
            ],
            [
                "Baixar os pesos do modelo para a máquina local",
                false
            ]
        ]
    },
    {
        "statement": "Uma solução precisa manter automaticamente o histórico de conversas de longa duração de cada usuário e, no futuro, executar ferramentas para cumprir tarefas em várias etapas. Qual abordagem do Foundry é mais adequada?",
        "explanation": "O agente do Foundry mantém o estado da conversa em threads e pode ser estendido com ferramentas para tarefas de várias etapas, exatamente o cenário descrito. Uma chamada isolada de chat não guarda histórico, e temperatura ou novos deployments não resolvem a gestão de estado.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "Construir um agente do Foundry, que gerencia o estado da conversa em threads e pode usar ferramentas",
                true
            ],
            [
                "Fazer uma única chamada de chat.complete sem manter estado entre as mensagens",
                false
            ],
            [
                "Aumentar a temperatura do modelo a cada turno",
                false
            ],
            [
                "Criar um deployment novo para cada mensagem do usuário",
                false
            ]
        ]
    },
    {
        "statement": "Um app envia uma imagem no conteúdo da mensagem de usuário, mas o modelo implantado retorna erro ao processar a imagem. As mensagens estão bem formadas. Qual é a explicação mais provável?",
        "explanation": "Só modelos multimodais interpretam imagens. Se o modelo implantado é somente de texto, enviar uma imagem gera erro, independentemente do formato das mensagens. Temperatura, prompt de sistema e thread não têm relação com a capacidade de processar imagens.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O modelo implantado é somente de texto; é preciso implantar um modelo multimodal",
                true
            ],
            [
                "A temperatura está baixa demais para interpretar imagens",
                false
            ],
            [
                "Faltou definir um prompt de sistema na conversa",
                false
            ],
            [
                "O thread do agente não foi criado",
                false
            ]
        ]
    },
    {
        "statement": "Um desenvolvedor compara duas configurações do mesmo modelo:\n\n# Chamada A\nchat.complete(model=dep, messages=msgs, temperature=0.1)\n# Chamada B\nchat.complete(model=dep, messages=msgs, temperature=0.9)\n\nQual afirmação está correta?",
        "explanation": "Temperatura mais alta (0.9) aumenta a aleatoriedade, gerando respostas mais variadas e criativas; temperatura mais baixa (0.1) deixa a saída mais focada e previsível. Ela influencia o conteúdo gerado, não a velocidade.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "A chamada B tende a produzir respostas mais variadas e criativas; a A, mais previsíveis",
                true
            ],
            [
                "A chamada A tende a produzir respostas mais criativas que a B",
                false
            ],
            [
                "As duas produzem exatamente a mesma resposta sempre",
                false
            ],
            [
                "A temperatura só afeta a velocidade, não o conteúdo das respostas",
                false
            ]
        ]
    },
    {
        "statement": "Após a chamada abaixo, como o desenvolvedor obtém o texto gerado pelo assistente?\n\nresponse = chat.complete(model=deployment, messages=messages)",
        "explanation": "A resposta de uma chamada de chat traz uma lista de choices; o texto do assistente fica em choices[0].message.content. As demais formas não correspondem à estrutura devolvida pelo cliente de chat.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "response.choices[0].message.content",
                true
            ],
            [
                "response.content diretamente na raiz do objeto",
                false
            ],
            [
                "response.thread.messages",
                false
            ],
            [
                "response.deployment.text",
                false
            ]
        ]
    },
    {
        "statement": "Em um agente, um desenvolvedor cria um novo thread com threads.create() a cada mensagem que o usuário envia, dentro da mesma conversa. Qual é a consequência mais provável?",
        "explanation": "O thread é o que guarda o histórico da conversa. Criar um thread novo a cada mensagem faz o agente começar do zero toda vez, perdendo o contexto anterior. Para manter a conversa, reutiliza-se o mesmo thread. As instruções continuam valendo e o modelo não é reimplantado.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O agente perde o contexto dos turnos anteriores, pois cada thread começa uma conversa vazia",
                true
            ],
            [
                "O agente responde mais rápido por causa do cache do thread",
                false
            ],
            [
                "As instruções do agente deixam de ser aplicadas",
                false
            ],
            [
                "O modelo passa a ser reimplantado a cada mensagem",
                false
            ]
        ]
    },
    {
        "statement": "Um aplicativo autentica com sucesso, mas toda chamada de chat falha porque o modelo indicado 'não existe' no projeto. O nome do deployment usado no código está escrito corretamente. Qual é a causa mais provável?",
        "explanation": "Se a autenticação funciona mas o modelo 'não existe', o deployment provavelmente não foi feito naquele projeto, ou o endpoint aponta para outro projeto sem esse deployment. Versão do SDK, temperatura ou tamanho do prompt não causam a mensagem de modelo inexistente.",
        "topic": "IA generativa e agentes no Foundry",
        "options": [
            [
                "O modelo ainda não foi implantado nesse projeto do Foundry (ou o app aponta para o projeto errado)",
                true
            ],
            [
                "A biblioteca do Foundry SDK está desatualizada",
                false
            ],
            [
                "A temperatura da chamada está acima de 1",
                false
            ],
            [
                "O prompt de usuário está muito longo",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe cria no Microsoft Foundry um app que precisa classificar cada avaliação de cliente como positiva, negativa ou neutra. Qual técnica de análise de texto atende a esse pedido?",
        "explanation": "Rotular um texto como positivo, negativo ou neutro é o próprio trabalho da análise de sentimento. Frases-chave extraem os termos principais, entidades identificam pessoas, lugares e organizações, e a detecção de idioma só descobre em que língua o texto está.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Análise de sentimento",
                true
            ],
            [
                "Extração de frases-chave",
                false
            ],
            [
                "Reconhecimento de entidades nomeadas",
                false
            ],
            [
                "Detecção de idioma",
                false
            ]
        ]
    },
    {
        "statement": "Você quer adicionar ao seu app do Foundry recursos prontos de análise de texto, como sentimento, frases-chave e entidades, sem treinar nada do zero. Qual serviço do Azure fornece essas capacidades?",
        "explanation": "O Azure AI Language reúne as capacidades pré-treinadas de processamento de linguagem sobre texto (sentimento, frases-chave, entidades, idioma, resumo). Vision trata imagens, Speech trata áudio e o Content Understanding extrai dados estruturados de documentos e mídia.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Azure AI Language",
                true
            ],
            [
                "Azure AI Vision",
                false
            ],
            [
                "Azure AI Speech",
                false
            ],
            [
                "Azure Content Understanding",
                false
            ]
        ]
    },
    {
        "statement": "Um app precisa marcar automaticamente cada chamado de suporte com os termos e tópicos mais relevantes do texto, para facilitar a busca. Qual técnica de análise de texto é a indicada?",
        "explanation": "Identificar os termos e tópicos mais relevantes de um texto é o papel da extração de frases-chave. A sumarização produziria um resumo em texto corrido, e não uma lista de termos para usar como tags.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Extração de frases-chave",
                true
            ],
            [
                "Sumarização",
                false
            ],
            [
                "Análise de sentimento",
                false
            ],
            [
                "Detecção de idioma",
                false
            ]
        ]
    },
    {
        "statement": "Seu app recebe mensagens de clientes de vários países e precisa, como primeiro passo, descobrir em que idioma cada mensagem foi escrita para depois encaminhá-la. Qual capacidade do Azure AI Language faz isso?",
        "explanation": "A detecção de idioma informa qual língua predomina em um texto, exatamente o passo necessário antes de rotear ou traduzir a mensagem. As demais opções analisam o conteúdo, mas não identificam o idioma.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Detecção de idioma",
                true
            ],
            [
                "Reconhecimento de entidades nomeadas",
                false
            ],
            [
                "Análise de sentimento",
                false
            ],
            [
                "Sumarização abstrativa",
                false
            ]
        ]
    },
    {
        "statement": "Antes de armazenar mensagens em texto livre, um app precisa localizar e ocultar dados pessoais como nomes, CPF e telefone. Qual capacidade do Azure AI Language é a mais adequada?",
        "explanation": "A detecção de PII (informações de identificação pessoal) localiza e permite mascarar dados sensíveis no texto. O reconhecimento de entidades comum encontra entidades genéricas, mas a função específica para achar e ocultar dados pessoais é a detecção de PII.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Detecção de informações pessoais (PII)",
                true
            ],
            [
                "Análise de sentimento",
                false
            ],
            [
                "Extração de frases-chave",
                false
            ],
            [
                "Sumarização extrativa",
                false
            ]
        ]
    },
    {
        "statement": "No contexto do catálogo de modelos do Microsoft Foundry, o que caracteriza um modelo multimodal?",
        "explanation": "Multimodal significa lidar com mais de uma modalidade de entrada (texto, imagem, áudio) de forma integrada. É justamente isso que permite, por exemplo, responder a um prompt falado ou interpretar uma imagem enviada pelo usuário.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "É um modelo que processa mais de um tipo de entrada, como texto, imagem e áudio, na mesma solicitação",
                true
            ],
            [
                "É um modelo que só processa texto",
                false
            ],
            [
                "É um modelo usado exclusivamente para gerar imagens",
                false
            ],
            [
                "É um modelo que funciona apenas offline, sem endpoint",
                false
            ]
        ]
    },
    {
        "statement": "Você quer um assistente em que o usuário faz uma pergunta falada e recebe uma resposta relevante. Qual é a vantagem de usar um modelo multimodal do catálogo do Foundry em vez de um modelo só de texto?",
        "explanation": "Um modelo multimodal aceita o áudio da fala como entrada, entendendo o prompt falado sem depender apenas de texto. As outras opções fazem afirmações falsas sobre custo, implantação e conectividade.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "O modelo multimodal pode receber o áudio do prompt falado diretamente como entrada",
                true
            ],
            [
                "O modelo multimodal é sempre mais barato que o de texto",
                false
            ],
            [
                "O modelo multimodal dispensa qualquer implantação (deploy)",
                false
            ],
            [
                "O modelo multimodal só funciona sem conexão com a internet",
                false
            ]
        ]
    },
    {
        "statement": "No Foundry, o que você precisa fazer com um modelo multimodal do catálogo antes que o seu app consiga enviar prompts a ele?",
        "explanation": "Modelos do catálogo já vêm pré-treinados; o passo necessário é implantar (deploy) o modelo para expor um endpoint que o app consome pelo SDK. Não é preciso treiná-lo do zero para usá-lo.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Implantá-lo (deploy) para obter um endpoint e chamá-lo pelo SDK do Foundry",
                true
            ],
            [
                "Treiná-lo do zero com os seus próprios dados",
                false
            ],
            [
                "Convertê-lo em um modelo clássico de visão",
                false
            ],
            [
                "Publicá-lo como um site estático",
                false
            ]
        ]
    },
    {
        "statement": "Um modelo multimodal recebe, na mesma solicitação, um prompt falado e uma foto anexada, e responde considerando os dois. Como se descreve melhor essa capacidade de raciocinar sobre fala e imagem juntas?",
        "explanation": "Combinar diferentes modalidades (áudio e imagem) numa mesma resposta é a essência do processamento multimodal. Sentimento, OCR e síntese de fala são tarefas específicas e de modalidade única.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Processamento multimodal (entrada combinada de modalidades)",
                true
            ],
            [
                "Análise de sentimento",
                false
            ],
            [
                "OCR (leitura de texto em imagem)",
                false
            ],
            [
                "Síntese de fala",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe discute dois desenhos para um assistente de voz: (A) o Azure AI Speech transcreve o áudio em texto e um modelo de texto responde; (B) um modelo multimodal recebe o prompt falado diretamente. Qual afirmação sobre a abordagem (B) está correta?",
        "explanation": "As duas abordagens são válidas, mas o diferencial da (B) é que o modelo multimodal aceita o áudio diretamente, dispensando a etapa separada de fala-para-texto. Não há conversão para imagem nem necessidade de treinar o modelo do zero.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Um modelo multimodal pode receber o áudio do prompt como entrada, sem uma etapa separada de transcrição para texto",
                true
            ],
            [
                "O modelo multimodal exige que o áudio seja convertido em imagem antes de ser processado",
                false
            ],
            [
                "A abordagem B é impossível de implementar no Foundry",
                false
            ],
            [
                "A abordagem B só funciona se o modelo for treinado do zero pela equipe",
                false
            ]
        ]
    },
    {
        "statement": "Seu app precisa transformar um recado de voz gravado em texto escrito. Qual capacidade do Azure AI Speech faz isso?",
        "explanation": "Converter áudio falado em texto é o reconhecimento de fala (speech to text). A síntese faz o caminho inverso, transformando texto em áudio.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Reconhecimento de fala (conversão de fala em texto)",
                true
            ],
            [
                "Síntese de fala (conversão de texto em fala)",
                false
            ],
            [
                "Tradução de texto",
                false
            ],
            [
                "Análise de sentimento",
                false
            ]
        ]
    },
    {
        "statement": "Depois de gerar uma resposta em texto, seu app precisa lê-la em voz alta com uma voz natural para o usuário. Qual capacidade do Azure AI Speech é usada?",
        "explanation": "Transformar texto em áudio falado é a síntese de fala (text to speech). O reconhecimento de fala faz o oposto, e frases-chave e OCR nem tratam de áudio.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Síntese de fala (conversão de texto em fala)",
                true
            ],
            [
                "Reconhecimento de fala (conversão de fala em texto)",
                false
            ],
            [
                "Extração de frases-chave",
                false
            ],
            [
                "OCR",
                false
            ]
        ]
    },
    {
        "statement": "Um app recebe fala em português e precisa produzir o conteúdo em inglês quase em tempo real. Qual capacidade do Azure AI Speech atende diretamente a esse cenário?",
        "explanation": "A tradução de fala do Azure AI Speech faz o reconhecimento e a tradução em conjunto, entregando o conteúdo falado em outro idioma. Só reconhecer ou só sintetizar não resolveria a mudança de língua.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Tradução de fala (speech translation)",
                true
            ],
            [
                "Apenas reconhecimento de fala, sem tradução",
                false
            ],
            [
                "Apenas síntese de fala",
                false
            ],
            [
                "Detecção de idioma do Azure AI Language",
                false
            ]
        ]
    },
    {
        "statement": "O Azure AI Speech aparece disponível no Foundry Tools. Na prática, o que isso significa para quem constrói uma solução no Microsoft Foundry?",
        "explanation": "O Foundry Tools reúne capacidades como a de fala de forma integrada, para você adicionar reconhecimento e síntese de fala à solução sem sair da plataforma. Não há substituição por outro modelo nem exigência de sair do Foundry.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Que a capacidade de fala está integrada como uma ferramenta do Foundry, pronta para ser adicionada à sua solução",
                true
            ],
            [
                "Que o Foundry substitui o Azure AI Speech por um modelo generativo",
                false
            ],
            [
                "Que o reconhecimento de fala só funciona fora do Foundry",
                false
            ],
            [
                "Que a fala exige uma plataforma totalmente separada, sem integração com o Foundry",
                false
            ]
        ]
    },
    {
        "statement": "Você precisa apenas de uma transcrição literal e fiel de centenas de gravações de chamadas, sem extrair nenhuma outra informação estruturada. Qual é o serviço mais direto para essa tarefa?",
        "explanation": "Para obter a transcrição literal do áudio, o caminho direto é o speech to text do Azure AI Speech. O Content Understanding seria excessivo aqui, pois seu foco é extrair campos e insights estruturados, não apenas transcrever.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Azure AI Speech (conversão de fala em texto)",
                true
            ],
            [
                "Um modelo multimodal generativo do catálogo do Foundry",
                false
            ],
            [
                "Azure Content Understanding com um esquema de campos",
                false
            ],
            [
                "Azure AI Language",
                false
            ]
        ]
    },
    {
        "statement": "Um modelo multimodal recebe uma imagem e responde, em linguagem natural, a perguntas do usuário sobre o que aparece nela. Esse cenário é um exemplo de que capacidade?",
        "explanation": "Receber uma imagem e responder perguntas sobre ela é interpretar entrada visual com um modelo multimodal. A geração de imagem criaria uma imagem nova, e as outras opções tratam de áudio e texto.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Interpretar entrada visual com um modelo multimodal",
                true
            ],
            [
                "Geração de imagem",
                false
            ],
            [
                "Síntese de fala",
                false
            ],
            [
                "Extração de frases-chave",
                false
            ]
        ]
    },
    {
        "statement": "Você envia a foto de um quadro branco com um diagrama e pede: 'explique o que este esboço representa'. Por que um modelo multimodal consegue atender a esse pedido?",
        "explanation": "O modelo multimodal combina a imagem enviada com a pergunta em texto e raciocina sobre ambas para explicar o esboço. Isso vai além de um classificador, que apenas aplica rótulos fixos.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Porque aceita imagem e texto juntos e raciocina sobre os dois para gerar a resposta",
                true
            ],
            [
                "Porque converte a imagem em áudio antes de responder",
                false
            ],
            [
                "Porque só funciona com imagens que ele mesmo gerou",
                false
            ],
            [
                "Porque apenas classifica a imagem em categorias fixas pré-treinadas",
                false
            ]
        ]
    },
    {
        "statement": "Comparando o Azure AI Vision clássico com um modelo multimodal para descrever uma imagem, qual afirmação é verdadeira?",
        "explanation": "O modelo multimodal permite diálogo aberto sobre a imagem (perguntas e respostas em linguagem natural), enquanto o Vision clássico entrega rótulos, categorias e OCR. O Vision não gera imagens novas, e o multimodal aceita imagens sim.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "O modelo multimodal pode responder perguntas abertas em linguagem natural sobre a imagem, indo além de rótulos e categorias fixas",
                true
            ],
            [
                "O Azure AI Vision gera imagens novas a partir de um texto",
                false
            ],
            [
                "O modelo multimodal não consegue receber imagens como entrada",
                false
            ],
            [
                "Os dois fazem exatamente a mesma coisa, sem diferença",
                false
            ]
        ]
    },
    {
        "statement": "Um app deixa o usuário enviar a foto de um eletrodoméstico quebrado e perguntar, com as próprias palavras, qual peça pode estar com defeito e como descrever o problema. Qual é a opção mais adequada?",
        "explanation": "Responder perguntas abertas e em linguagem natural sobre uma imagem pede um modelo multimodal. Vision e Custom Vision entregam rótulos ou categorias, e o Content Understanding foca em extrair campos estruturados, não em dialogar sobre a foto.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Um modelo multimodal, que interpreta a imagem e responde perguntas abertas",
                true
            ],
            [
                "Azure AI Vision pré-treinado, para rótulos e categorias gerais",
                false
            ],
            [
                "Custom Vision, para classificar com as suas próprias classes",
                false
            ],
            [
                "Azure Content Understanding, para extrair campos estruturados",
                false
            ]
        ]
    },
    {
        "statement": "Um app mostra a imagem de um gráfico a um modelo multimodal e pede um resumo, em palavras, da tendência exibida. Quais são, respectivamente, a entrada usada e a saída produzida pelo modelo?",
        "explanation": "Interpretar entrada visual significa receber a imagem e produzir uma resposta em texto (aqui, o resumo da tendência). Gerar imagem a partir de texto ou transcrever áudio são tarefas diferentes.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Entrada: imagem (visual); saída: texto em linguagem natural descrevendo a tendência",
                true
            ],
            [
                "Entrada: texto; saída: uma imagem nova do gráfico",
                false
            ],
            [
                "Entrada: áudio; saída: uma transcrição do áudio",
                false
            ],
            [
                "Entrada: imagem; saída: outra imagem editada",
                false
            ]
        ]
    },
    {
        "statement": "Qual descrição corresponde à tarefa de geração de imagem?",
        "explanation": "Geração de imagem é produzir conteúdo visual novo a partir de um prompt de texto. OCR, classificação e transcrição interpretam conteúdo que já existe, em vez de criar imagem.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Criar uma imagem nova a partir de uma descrição em texto (prompt)",
                true
            ],
            [
                "Ler o texto impresso em uma foto (OCR)",
                false
            ],
            [
                "Classificar uma imagem em categorias",
                false
            ],
            [
                "Transcrever um áudio em texto",
                false
            ]
        ]
    },
    {
        "statement": "Um designer quer produzir variações originais de ilustração a partir de uma descrição escrita, dentro de um app do Foundry. Que tipo de modelo ele deve usar?",
        "explanation": "Criar ilustrações novas a partir de texto pede um modelo generativo de geração de imagem (text-to-image) do catálogo do Foundry. Vision analisa imagens existentes, Speech trata áudio e Language trata texto.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Um modelo generativo de geração de imagem (texto para imagem) do catálogo do Foundry",
                true
            ],
            [
                "Azure AI Vision pré-treinado",
                false
            ],
            [
                "Azure AI Speech",
                false
            ],
            [
                "Azure AI Language",
                false
            ]
        ]
    },
    {
        "statement": "Qual afirmação descreve corretamente a diferença entre geração de imagem e visão computacional?",
        "explanation": "Geração de imagem produz conteúdo visual novo (saída), enquanto a visão computacional analisa imagens que já existem (entrada). São cargas de trabalho opostas em termos de criar versus interpretar.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Geração de imagem cria conteúdo visual novo a partir de um prompt; visão computacional interpreta e analisa imagens existentes",
                true
            ],
            [
                "As duas criam imagens novas a partir de texto",
                false
            ],
            [
                "Geração de imagem serve para ler o texto impresso em fotos",
                false
            ],
            [
                "Visão computacional gera imagens novas a partir de texto",
                false
            ]
        ]
    },
    {
        "statement": "No Microsoft Foundry, qual é o fluxo para gerar imagens a partir de prompts dentro do seu app?",
        "explanation": "O caminho é selecionar um modelo generativo de imagem no catálogo do Foundry, implantá-lo e enviar o prompt ao endpoint. O Custom Vision classifica imagens, e Speech e OCR não geram imagens.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Escolher um modelo de geração de imagem no catálogo, implantá-lo e chamar o endpoint com o prompt",
                true
            ],
            [
                "Treinar um modelo de classificação no Custom Vision",
                false
            ],
            [
                "Usar o Azure AI Speech para sintetizar a imagem",
                false
            ],
            [
                "Habilitar o OCR do Azure AI Vision",
                false
            ]
        ]
    },
    {
        "statement": "Ao disponibilizar em seu app um recurso que gera imagens a partir de prompts dos usuários, qual prática está alinhada aos princípios de IA responsável da Microsoft?",
        "explanation": "A IA responsável, nos pilares de confiabilidade e segurança, envolve aplicar filtros de conteúdo para evitar saídas nocivas ou impróprias. Desligar filtros ou proibir qualquer prompt não são práticas coerentes com esse princípio.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Aplicar filtros de conteúdo e segurança para evitar gerar imagens nocivas ou impróprias",
                true
            ],
            [
                "Desativar todos os filtros para dar máxima liberdade ao usuário",
                false
            ],
            [
                "Garantir que as imagens geradas sejam sempre idênticas entre si",
                false
            ],
            [
                "Impedir que o usuário escreva qualquer prompt",
                false
            ]
        ]
    },
    {
        "statement": "Qual serviço do Azure, disponível no Foundry Tools, é voltado a extrair informações estruturadas de documentos, imagens, áudio e vídeo?",
        "explanation": "O Azure Content Understanding extrai informação estruturada de múltiplos tipos de conteúdo (documentos, imagens, áudio e vídeo). Language trata texto já digitado, Speech trata áudio e Vision trata imagens, cada um de forma mais específica.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Azure Content Understanding",
                true
            ],
            [
                "Azure AI Language",
                false
            ],
            [
                "Azure AI Speech",
                false
            ],
            [
                "Azure AI Vision",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa processa milhares de faturas e recibos e precisa obter fornecedor, data e valor total como campos estruturados. Qual serviço do Foundry Tools é o indicado?",
        "explanation": "Extrair campos estruturados (fornecedor, data, total) de documentos e formulários é a especialidade do Azure Content Understanding. Sentimento, síntese de fala e geração de imagem não têm relação com esse cenário.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Azure Content Understanding",
                true
            ],
            [
                "Análise de sentimento do Azure AI Language",
                false
            ],
            [
                "Síntese de fala do Azure AI Speech",
                false
            ],
            [
                "Um modelo de geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "Qual característica distingue o Azure Content Understanding de serviços de propósito único?",
        "explanation": "O diferencial do Content Understanding é ser multimodal, extraindo informação estruturada de documentos, imagens, áudio e vídeo numa mesma abordagem. As outras opções descrevem serviços de modalidade única.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "É multimodal: extrai informação de vários tipos de conteúdo (documentos, imagens, áudio e vídeo) de forma unificada",
                true
            ],
            [
                "Só trabalha com texto que já foi digitado",
                false
            ],
            [
                "Só gera imagens a partir de prompts",
                false
            ],
            [
                "Só converte texto em fala",
                false
            ]
        ]
    },
    {
        "statement": "A partir de gravações de chamadas de vendas (áudio e vídeo), a equipe precisa de insights estruturados, como tópicos discutidos, produtos citados e itens de ação, e não apenas a transcrição literal. Qual serviço é o mais adequado?",
        "explanation": "Quando o objetivo vai além da transcrição e busca campos e insights estruturados de áudio ou vídeo, o serviço é o Content Understanding. O Azure AI Speech entregaria só o texto transcrito, sem estruturar tópicos, produtos e ações.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Azure Content Understanding, que extrai informações estruturadas de áudio e vídeo",
                true
            ],
            [
                "Azure AI Speech, que devolve apenas a transcrição literal do áudio",
                false
            ],
            [
                "Azure AI Vision",
                false
            ],
            [
                "Um modelo de geração de imagem",
                false
            ]
        ]
    },
    {
        "statement": "Você tem uma pasta de contratos em PDF digitalizados (imagens das páginas) e precisa levar cláusulas e campos específicos para um banco de dados. Qual serviço se encaixa, e por que o outro não?",
        "explanation": "O Content Understanding lê e estrutura documentos e imagens, incluindo PDFs digitalizados, extraindo os campos desejados. O Azure AI Language analisa texto já em formato digital e não faz a leitura nem a estruturação do documento; Speech trata áudio e a geração de imagem cria imagens.",
        "topic": "Texto, fala, visão e extração no Foundry",
        "options": [
            [
                "Azure Content Understanding, porque extrai campos estruturados de documentos e imagens; a análise de texto do Language pressupõe texto já digital",
                true
            ],
            [
                "Azure AI Language, porque faz o OCR dos PDFs digitalizados",
                false
            ],
            [
                "Azure AI Speech, porque lê documentos",
                false
            ],
            [
                "Um modelo de geração de imagem, porque cria os campos do contrato",
                false
            ]
        ]
    }
];

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Azure AI Fundamentals (AI-901)",
                provider: "azure",
                code: "AI-901",
                level: "Fundamental",
                description:
                    "Simulado no formato da prova AI-901: 60 minutos, corte de 70%.",
                durationMinutes: 60,
                questionCount: 50,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "azure", code: "AI-901", level: "Fundamental" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) {
        console.log("Simulado já tem " + n + " questões, nada a fazer.");
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
    console.log("Seed concluído: " + QUESTOES.length + " questões inseridas.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
