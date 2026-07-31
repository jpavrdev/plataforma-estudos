// Banco de questões do simulado Microsoft Azure AI Fundamentals (AI-901).
// Compartilhado pelo seed (instalação nova) e pelo script de atualização
// (instalação que já tem o simulado). Regras do banco: distratores da mesma
// categoria da resposta e a correta não pode ser a única opção mais longa,
// nem a única mais curta por folga visível. Questões de múltipla escolha
// terminam com "(Selecione DUAS opções.)" e têm cinco opções com duas
// corretas.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
    {
        statement:
            "Um modelo que aprova pedidos de crédito começou a recusar bem mais solicitações de um grupo específico por causa de um viés presente nos dados de treinamento. Qual princípio de IA responsável foi violado?",
        explanation:
            "A imparcialidade exige tratar todas as pessoas de forma justa, sem favorecer nem prejudicar grupos; um viés que recusa mais pedidos de um grupo fere exatamente esse princípio. Transparência é explicar como o sistema funciona; confiabilidade e segurança, operar de forma segura e consistente; e inclusão, alcançar e empoderar todas as pessoas, inclusive as com deficiência. Nenhum descreve o problema de viés discriminatório.",
        topic: "IA responsável e modelos",
        options: [
            ["Imparcialidade (fairness)", true],
            ["Transparência (transparency)", false],
            ["Confiabilidade e segurança (reliability & safety)", false],
            ["Inclusão (inclusiveness)", false],
        ],
    },
    {
        statement:
            "Ao lançar um chatbot, a empresa publica uma explicação de como ele funciona, para que serve e quais são suas limitações, e deixa claro ao usuário que ele conversa com uma IA. Qual princípio de IA responsável isso representa?",
        explanation:
            "Transparência é tornar o sistema compreensível: explicar como funciona, sua finalidade e limitações, e avisar que se trata de uma IA. Privacidade e segurança tratam da proteção dos dados; responsabilização, de quem responde pelo sistema; imparcialidade, de evitar viés. Nada disso é o foco de comunicar funcionamento e limites.",
        topic: "IA responsável e modelos",
        options: [
            ["Privacidade e segurança (privacy & security)", false],
            ["Responsabilização (accountability)", false],
            ["Transparência (transparency)", true],
            ["Imparcialidade (fairness)", false],
        ],
    },
    {
        statement:
            "Uma equipe adiciona legendas automáticas, compatibilidade com leitor de tela e controle por voz para que pessoas com deficiência também consigam usar a solução de IA. Qual princípio está sendo aplicado?",
        explanation:
            "Inclusão é empoderar e alcançar todas as pessoas, especialmente quem tem deficiência ou costuma ser deixado de fora; recursos de acessibilidade são o exemplo clássico. Imparcialidade cuida de não discriminar grupos nas decisões; transparência, de explicar o sistema; confiabilidade e segurança, de operar com segurança. A acessibilidade se encaixa em inclusão.",
        topic: "IA responsável e modelos",
        options: [
            ["Imparcialidade (fairness)", false],
            ["Inclusão (inclusiveness)", true],
            ["Transparência (transparency)", false],
            ["Confiabilidade e segurança (reliability & safety)", false],
        ],
    },
    {
        statement:
            "Uma organização designa uma equipe de governança que mantém supervisão humana sobre o sistema de IA e responde oficialmente por seus resultados. Qual princípio de IA responsável isso reflete?",
        explanation:
            "Responsabilização significa que pessoas e organizações respondem pelos sistemas de IA que criam e operam, com governança e supervisão humana; a IA não assume a culpa sozinha. Inclusão trata de acessibilidade; transparência, de explicar o sistema; privacidade e segurança, de proteger dados. O foco em governança e em responder pelos resultados é responsabilização.",
        topic: "IA responsável e modelos",
        options: [
            ["Inclusão (inclusiveness)", false],
            ["Transparência (transparency)", false],
            ["Privacidade e segurança (privacy & security)", false],
            ["Responsabilização (accountability)", true],
        ],
    },
    {
        statement:
            "O piloto automático de um veículo precisa reagir de forma segura e consistente a uma condição de estrada que nunca apareceu no treinamento, o que exige testes rigorosos e monitoramento contínuo. Qual princípio orienta esse cuidado?",
        explanation:
            "Confiabilidade e segurança exigem que o sistema funcione de forma confiável, consistente e segura mesmo diante de situações inesperadas, o que pede testes e monitoramento contínuos. Imparcialidade trata de viés; inclusão, de acessibilidade; transparência, de explicar o sistema. Reagir com segurança a um cenário novo é confiabilidade e segurança.",
        topic: "IA responsável e modelos",
        options: [
            ["Confiabilidade e segurança (reliability & safety)", true],
            ["Imparcialidade (fairness) nas decisões", false],
            ["Inclusão (inclusiveness) dos usuários", false],
            ["Transparência (transparency) do funcionamento do sistema", false],
        ],
    },
    {
        statement:
            "Antes de treinar um modelo com dados de pacientes, a equipe anonimiza as informações e restringe quem pode acessá-las, garantindo que sejam usadas apenas para o fim previsto. Qual princípio de IA responsável está em foco?",
        explanation:
            "Privacidade e segurança tratam de proteger os dados das pessoas e respeitar a privacidade, com anonimização e controle de acesso, usando os dados só para o fim previsto. Cuidado com a pegadinha: confiabilidade e segurança referem-se à operação segura e consistente do sistema, não à proteção dos dados. Responsabilização é governança; transparência é explicar o sistema.",
        topic: "IA responsável e modelos",
        options: [
            ["Confiabilidade e segurança (reliability & safety)", false],
            ["Privacidade e segurança (privacy & security)", true],
            ["Responsabilização (accountability)", false],
            ["Transparência (transparency)", false],
        ],
    },
    {
        statement:
            "Qual é a diferença central entre os princípios de imparcialidade e de inclusão na IA responsável?",
        explanation:
            "Imparcialidade (fairness) é não favorecer nem prejudicar grupos, evitando viés nas decisões; inclusão (inclusiveness) é garantir que a solução alcance e empodere todas as pessoas, com destaque para a acessibilidade. Não são o mesmo princípio; proteção de dados é privacidade e segurança; e a última opção inverte os dois conceitos.",
        topic: "IA responsável e modelos",
        options: [
            [
                "Imparcialidade é decidir sem viés; inclusão é alcançar e empoderar todas as pessoas, inclusive as com deficiência",
                true,
            ],
            [
                "Imparcialidade só se aplica a modelos generativos, e inclusão só a modelos de classificação",
                false,
            ],
            [
                "Imparcialidade cuida da proteção dos dados pessoais e inclusão cuida da precisão do modelo",
                false,
            ],
            [
                "Imparcialidade trata da acessibilidade das interfaces, enquanto inclusão trata de evitar viés nas decisões do modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco precisa que seus analistas entendam quais fatores o modelo considerou ao negar um empréstimo e conheçam suas limitações, para conseguir explicar a decisão ao cliente. Qual princípio de IA responsável atende a essa necessidade?",
        explanation:
            "Transparência é tornar o sistema compreensível: entender como ele decide e conhecer suas limitações (interpretabilidade). Responsabilização é sobre quem responde pelo sistema, não sobre entender a decisão; imparcialidade é evitar viés; confiabilidade e segurança é operar com segurança. Compreender e explicar como o modelo decidiu é transparência.",
        topic: "IA responsável e modelos",
        options: [
            ["Responsabilização (accountability)", false],
            ["Imparcialidade (fairness)", false],
            ["Transparência (transparency)", true],
            ["Confiabilidade e segurança (reliability & safety)", false],
        ],
    },
    {
        statement:
            "Após um incidente, a diretoria de uma empresa é chamada a responder oficialmente pelas decisões do sistema de IA e define quem tem autoridade para desativá-lo. Mesmo havendo testes e monitoramento, qual princípio descreve melhor essa responsabilização humana e de governança?",
        explanation:
            "Responsabilização é o princípio de que pessoas e organizações respondem pelos sistemas de IA, com governança e autoridade para supervisionar e desativar. Confiabilidade e segurança aparecem nos testes e no monitoramento, mas descrevem a operação segura do sistema, não quem responde por ele. Transparência é explicar o funcionamento; imparcialidade é evitar viés. O foco em responder oficialmente e governar é responsabilização.",
        topic: "IA responsável e modelos",
        options: [
            ["Confiabilidade e segurança (reliability & safety)", false],
            ["Responsabilização (accountability)", true],
            ["Transparência (transparency)", false],
            ["Imparcialidade (fairness)", false],
        ],
    },
    {
        statement:
            "Antes de um modelo de linguagem processar uma frase, o texto é quebrado em unidades menores, que podem ser palavras inteiras ou pedaços de palavras. Como essas unidades são chamadas?",
        explanation:
            "O modelo trabalha com tokens: palavras inteiras ou fragmentos de palavras em que o texto é dividido antes do processamento. Embeddings são vetores numéricos que representam significado; pixels são unidades de imagem; épocas são passagens completas pelos dados durante o treino. A unidade de texto do modelo é o token.",
        topic: "IA responsável e modelos",
        options: [
            ["Tokens", true],
            ["Embeddings", false],
            ["Pixels", false],
            ["Épocas", false],
        ],
    },
    {
        statement:
            "Em termos simples, como um modelo de linguagem grande (LLM) gera uma resposta em texto?",
        explanation:
            "Um LLM gera texto prevendo, passo a passo, qual é o próximo token mais provável dado o contexto anterior. Ele não consulta um banco de FAQs, não copia trechos literais do treino nem segue regras gramaticais escritas à mão: é um modelo estatístico que aprende padrões e prevê a continuação mais provável.",
        topic: "IA responsável e modelos",
        options: [
            ["Consultando um banco de dados de perguntas e respostas prontas", false],
            ["Prevendo repetidamente o próximo token mais provável a partir do contexto", true],
            ["Copiando trechos exatos dos documentos usados no treino", false],
            [
                "Aplicando um conjunto de regras gramaticais programadas manualmente por linguistas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa comparar o significado de milhares de textos para montar uma busca por similaridade semântica. Que tipo de representação, produzida por um modelo, é a base dessa comparação?",
        explanation:
            "Embeddings são vetores numéricos que capturam o significado de um texto, permitindo medir semelhança semântica pela proximidade entre os vetores. Tokens são as unidades em que o texto é dividido; prompts de sistema definem o comportamento do modelo; caixas delimitadoras pertencem à visão computacional. A busca semântica se baseia em embeddings.",
        topic: "IA responsável e modelos",
        options: [
            ["Embeddings (vetores numéricos que capturam o significado)", true],
            ["Tokens, as unidades mínimas de texto do modelo", false],
            ["Prompts de sistema com instruções de comparação", false],
            ["Caixas delimitadoras (bounding boxes) de cada palavra do texto", false],
        ],
    },
    {
        statement:
            "Qual arquitetura está por trás dos modelos generativos de texto modernos, com um mecanismo de atenção que pesa a importância de cada parte do texto para entender o contexto?",
        explanation:
            "A arquitetura transformer, com seu mecanismo de atenção, é a base dos modelos generativos de texto atuais; a atenção permite ao modelo pesar quais partes do texto são mais relevantes para o contexto. CNNs são típicas de visão computacional; árvores de decisão e k-means são técnicas clássicas de ML sem esse mecanismo de atenção.",
        topic: "IA responsável e modelos",
        options: [
            ["Transformer, baseado em atenção", true],
            ["Rede neural convolucional (CNN)", false],
            ["Árvore de decisão", false],
            ["Agrupamento k-means", false],
        ],
    },
    {
        statement:
            "Uma empresa quer executar um modelo de linguagem em dispositivos com recursos limitados, com baixo custo e boa velocidade, aceitando um escopo de tarefas mais focado. Que escolha de modelo é a mais adequada?",
        explanation:
            "Modelos de linguagem pequenos (SLMs), como a família Phi, são mais leves, rápidos e baratos e rodam com menos recursos (inclusive em dispositivos), com bom desempenho em tarefas focadas, exatamente o cenário descrito. Um LLM de maior porte seria mais pesado e caro; um modelo de embeddings serve para similaridade, não para gerar respostas; e um modelo de imagem não gera texto.",
        topic: "IA responsável e modelos",
        options: [
            ["Um modelo de linguagem grande (LLM) do maior porte disponível", false],
            ["Um modelo de embeddings para busca semântica", false],
            ["Um modelo de linguagem pequeno (SLM), como a família Phi", true],
            ["Um modelo de geração de imagem quantizado", false],
        ],
    },
    {
        statement:
            "Um aplicativo precisa criar imagens originais a partir de descrições em texto escritas pelos usuários. Que tipo de modelo do catálogo do Microsoft Foundry atende a esse objetivo?",
        explanation:
            "Criar imagens novas a partir de texto é tarefa de um modelo de geração de imagem. Análise de sentimento classifica emoção em texto; embeddings gera vetores para similaridade; transcrição de fala converte áudio em texto. Só o modelo de geração de imagem produz a saída visual pedida.",
        topic: "IA responsável e modelos",
        options: [
            ["Um modelo de análise de sentimento", false],
            ["Um modelo de geração de imagem", true],
            ["Um modelo de embeddings", false],
            ["Um modelo de transcrição de fala", false],
        ],
    },
    {
        statement:
            "Um assistente precisa receber a foto de um equipamento e responder, em texto, perguntas sobre o que aparece na imagem. Que tipo de modelo é o mais indicado?",
        explanation:
            "Um modelo multimodal aceita mais de um tipo de entrada (neste caso, imagem e texto) e por isso consegue interpretar a foto e responder por escrito. Um modelo só de texto não enxerga a imagem; embeddings apenas gera vetores de similaridade; um modelo de geração de imagem cria imagens, mas não interpreta a que recebeu. O caso pede um modelo multimodal.",
        topic: "IA responsável e modelos",
        options: [
            ["Um modelo multimodal, capaz de receber imagem e texto", true],
            ["Um modelo somente de texto com um prompt bem detalhado", false],
            ["Um modelo de embeddings para busca semântica", false],
            ["Um modelo de geração de imagem fotorrealista", false],
        ],
    },
    {
        statement:
            "No Microsoft Foundry, antes de construir a solução, uma equipe quer navegar e comparar modelos de vários provedores (OpenAI, Meta, Microsoft) por capacidade, desempenho e custo, para escolher o melhor para a tarefa. Qual recurso do Foundry serve a isso?",
        explanation:
            "O catálogo de modelos do Microsoft Foundry é onde se navega, compara e seleciona modelos de diferentes provedores por capacidade, desempenho e custo. O playground serve para testar prompts depois que o modelo já foi implantado; um endpoint é o resultado da implantação, não a etapa de escolha; e o Content Understanding é para extrair informação de documentos, não para escolher modelos.",
        topic: "IA responsável e modelos",
        options: [
            ["O catálogo de modelos (model catalog)", true],
            ["O playground de chat do portal", false],
            ["Um endpoint de implantação existente", false],
            ["O Azure Content Understanding", false],
        ],
    },
    {
        statement:
            "No Microsoft Foundry (antigo Azure AI Foundry), o que precisa acontecer antes que um aplicativo cliente consiga enviar prompts a um modelo do catálogo?",
        explanation:
            "Para um app consumir um modelo, ele precisa primeiro ser implantado no Foundry, o que expõe um endpoint que o aplicativo chama (por exemplo, via Foundry SDK). Os modelos do catálogo já vêm pré-treinados, então não é preciso treinar do zero; o app não baixa nem executa o modelo localmente; e não há necessidade de conversão manual para ONNX para usá-lo.",
        topic: "IA responsável e modelos",
        options: [
            ["O modelo precisa ser treinado do zero pela equipe com dados do domínio", false],
            [
                "O modelo precisa ser implantado (deploy), o que gera um endpoint para o app chamar",
                true,
            ],
            ["O aplicativo precisa baixar os pesos do modelo e executá-lo localmente", false],
            [
                "O modelo precisa ser convertido manualmente para o formato ONNX antes da primeira chamada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer disponibilizar um modelo do catálogo do Microsoft Foundry sem provisionar nem gerenciar máquinas de computação. Quais DUAS características descrevem a implantação como API serverless? (Selecione DUAS opções.)",
        explanation:
            "A implantação como API serverless cobra por uso (por token) e mantém a infraestrutura gerenciada pela plataforma, sem provisionar computação. O managed compute reserva computação dedicada administrada por você; executar o modelo dentro do app não é uma opção de implantação; e treinar antes de publicar não é exigido.",
        topic: "IA responsável e modelos",
        options: [
            ["A cobrança é feita por uso, com base nos tokens processados", true],
            ["A infraestrutura fica gerenciada pela plataforma, sem provisionar computação", true],
            ["Exige reservar computação dedicada e administrar a capacidade dela", false],
            ["Obriga a treinar o modelo com dados próprios antes de publicar o endpoint", false],
            ["Executa o modelo dentro do próprio aplicativo cliente, sem endpoint", false],
        ],
    },
    {
        statement:
            "Um redator quer que o modelo generativo produza respostas mais variadas e criativas, aceitando mais imprevisibilidade. Qual ajuste de parâmetro atende a isso?",
        explanation:
            "A temperature controla a aleatoriedade da saída: aumentá-la torna as respostas mais variadas e criativas, enquanto reduzi-la (perto de zero) as torna mais determinísticas e previsíveis. Uma stop sequence apenas interrompe a geração num ponto; reduzir o max tokens só encurta a resposta. Para mais criatividade, aumenta-se a temperature.",
        topic: "IA responsável e modelos",
        options: [
            ["Definir uma stop sequence", false],
            ["Reduzir o número máximo de tokens (max tokens)", false],
            ["Aumentar a temperature", true],
            ["Reduzir a temperature para perto de zero", false],
        ],
    },
    {
        statement:
            "As respostas de um modelo estão sendo cortadas no meio, e o desenvolvedor quer permitir saídas mais longas. Qual parâmetro ele deve ajustar?",
        explanation:
            "O parâmetro de máximo de tokens define o tamanho limite da resposta gerada; se as respostas estão sendo cortadas, é ele que precisa ser aumentado. A temperature controla a aleatoriedade, não o tamanho; o top-p controla a diversidade da amostragem; e a presence penalty reduz repetição de temas. Vale notar que aumentar o max tokens não deixa a resposta mais 'precisa', apenas permite que ela seja mais longa.",
        topic: "IA responsável e modelos",
        options: [
            ["A temperature, que controla a aleatoriedade", false],
            ["O número máximo de tokens da resposta (max tokens)", true],
            ["O top-p, que limita os tokens candidatos", false],
            ["A presence penalty, que desestimula tokens repetidos", false],
        ],
    },
    {
        statement:
            "Uma equipe já está ajustando a temperature de um modelo e a documentação recomenda não mexer nos dois parâmetros ao mesmo tempo. O que o parâmetro top-p (amostragem por núcleo) controla?",
        explanation:
            "O top-p (nucleus sampling) controla a diversidade limitando a amostragem ao menor conjunto de tokens mais prováveis cuja soma de probabilidades chega a p; valores menores tornam a saída mais focada. Por isso a recomendação é ajustar a temperature ou o top-p, não os dois juntos. O tamanho da resposta é o max tokens; o número de respostas é outro parâmetro; e penalizar repetição é a frequency/presence penalty.",
        topic: "IA responsável e modelos",
        options: [
            [
                "A diversidade da saída, limitando a escolha aos tokens mais prováveis cuja soma de probabilidades atinge p",
                true,
            ],
            ["O tamanho máximo da resposta gerada, contado em tokens de saída", false],
            ["Quantas respostas alternativas o modelo retorna em uma única chamada", false],
            [
                "A penalização aplicada aos tokens que já apareceram na resposta, reduzindo repetições literais no texto gerado",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer processar milhares de avaliações de clientes já escritas para identificar o tom (positivo, negativo ou neutro) de cada uma. Qual carga de trabalho de IA melhor descreve esse cenário?",
        explanation:
            "A análise de texto extrai informação de textos já escritos, e a análise de sentimento (positivo, negativo ou neutro) é uma de suas técnicas. No Azure, essas técnicas ficam no Azure AI Language. Visão, fala e geração de imagem tratam de outros tipos de conteúdo.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Análise de texto", true],
            ["Visão computacional", false],
            ["Reconhecimento de fala", false],
            ["Geração de imagem", false],
        ],
    },
    {
        statement:
            "Um aplicativo recebe uma breve descrição em linguagem natural e produz, a partir dela, um texto de marketing inédito. Que carga de trabalho de IA representa isso?",
        explanation:
            "Criar conteúdo novo (texto, imagem, código) a partir de um prompt é o papel da IA generativa. A análise de texto e a extração de informação apenas retiram dados de conteúdos que já existem, sem criar algo novo.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["IA generativa", true],
            ["Análise de texto", false],
            ["Extração de informação", false],
            ["Visão computacional", false],
        ],
    },
    {
        statement:
            "Uma solução recebe um objetivo em alto nível ('reorganize minha agenda evitando conflitos'), decide sozinha os passos, aciona ferramentas e executa as ações necessárias até concluir a tarefa. Qual carga de trabalho descreve esse comportamento?",
        explanation:
            "A IA agêntica planeja e executa uma sequência de ações de forma autônoma para atingir um objetivo, acionando ferramentas. Ela costuma se apoiar em modelos generativos, mas vai além de apenas gerar conteúdo: ela age.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["IA agêntica", true],
            ["IA generativa", false],
            ["Análise de texto", false],
            ["Extração de informação", false],
        ],
    },
    {
        statement:
            "Um time precisa transformar faturas em PDF em campos estruturados (fornecedor, valor total, vencimento) para lançar em um sistema financeiro. Qual carga de trabalho de IA é a indicada?",
        explanation:
            "A extração de informação converte documentos e mídia não estruturados em dados organizados (campos como fornecedor, valor e data). No Azure, o serviço é o Azure Content Understanding. A análise de texto trabalharia sobre texto solto, não sobre a estrutura do documento.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Extração de informação", true],
            ["Análise de texto", false],
            ["IA generativa", false],
            ["Reconhecimento de fala", false],
        ],
    },
    {
        statement:
            "Uma plataforma de reuniões precisa gerar automaticamente a transcrição em texto de tudo o que os participantes falam em áudio. Qual carga de trabalho atende a essa necessidade?",
        explanation:
            "O reconhecimento de fala (speech-to-text) converte áudio falado em texto, o que gera transcrições e legendas. A síntese de fala faz o caminho inverso (texto em voz). O serviço no Azure é o Azure AI Speech.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Reconhecimento de fala (speech-to-text)", true],
            ["Síntese de fala (text-to-speech)", false],
            ["Análise de texto das atas", false],
            ["Extração de informação de documentos", false],
        ],
    },
    {
        statement:
            "Qual afirmação distingue corretamente uma carga de IA generativa de uma carga de IA agêntica?",
        explanation:
            "A IA generativa produz conteúdo novo (texto, imagem, código). A IA agêntica usa esses modelos, mas seu diferencial é planejar e executar ações de forma autônoma, acionando ferramentas até cumprir um objetivo.",
        topic: "Cargas e capacidades de IA",
        options: [
            [
                "A generativa cria conteúdo novo a partir de um prompt; a agêntica planeja e executa ações de forma autônoma até atingir um objetivo",
                true,
            ],
            [
                "A IA generativa executa ações no mundo real de forma autônoma, enquanto a agêntica apenas escreve textos e respostas em linguagem natural",
                false,
            ],
            [
                "A diferença é só o tamanho do modelo: agêntica é qualquer generativa com mais parâmetros",
                false,
            ],
            [
                "A IA agêntica só classifica textos existentes, enquanto a generativa também lê e interpreta imagens",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de suporte quer descobrir rapidamente os assuntos principais de milhares de tíquetes, sem ler cada um. Qual técnica de análise de texto entrega os termos e assuntos centrais de um texto?",
        explanation:
            "A extração de frases-chave identifica os principais termos e assuntos de um texto, resumindo sobre o que ele fala. É ideal para descobrir os temas recorrentes em muitos textos sem lê-los por completo.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Extração de frases-chave (key phrase extraction)", true],
            ["Análise de sentimento dos tíquetes", false],
            ["Reconhecimento de entidades nomeadas", false],
            ["Sumarização automática de cada tíquete individual", false],
        ],
    },
    {
        statement:
            "Um sistema jurídico precisa localizar e classificar nomes de pessoas, organizações e datas mencionados em contratos. Qual técnica de análise de texto faz isso?",
        explanation:
            "O reconhecimento de entidades encontra e classifica itens citados no texto, como pessoas, organizações, lugares, datas e valores. As frases-chave trariam apenas assuntos gerais, sem classificar cada item por tipo.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Reconhecimento de entidades (entity detection)", true],
            ["Extração de frases-chave do texto dos contratos", false],
            ["Sumarização automática dos documentos", false],
            ["Análise de sentimento das cláusulas", false],
        ],
    },
    {
        statement:
            "Uma marca quer classificar comentários de redes sociais como positivos, negativos ou neutros para acompanhar sua reputação. Qual técnica de análise de texto é a correta?",
        explanation:
            "A análise de sentimento classifica o tom do texto como positivo, negativo ou neutro, servindo para medir satisfação e reputação. As demais técnicas extraem entidades, resumos ou assuntos, não o tom.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Análise de sentimento", true],
            ["Reconhecimento de entidades", false],
            ["Sumarização", false],
            ["Extração de frases-chave", false],
        ],
    },
    {
        statement:
            "Um gerente recebe relatórios longos e quer, para cada um, um parágrafo curto e coeso com os pontos essenciais, preservando o sentido do documento. Qual técnica é a mais indicada?",
        explanation:
            "A sumarização gera um resumo curto e coeso com os pontos essenciais de um texto longo. A extração de frases-chave apenas lista termos soltos, sem formar um resumo que preserve o sentido do documento.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Sumarização abstrativa", true],
            ["Extração de frases-chave", false],
            ["Reconhecimento de entidades", false],
            ["Análise de sentimento", false],
        ],
    },
    {
        statement:
            "Análise de sentimento, reconhecimento de entidades, extração de frases-chave e sumarização de texto são recursos de qual serviço do Azure?",
        explanation:
            "As técnicas de análise de texto ficam no Azure AI Language. O AI Vision trata de imagens, o AI Speech de fala e o Content Understanding da extração de informação de documentos e mídia.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Azure AI Language", true],
            ["Azure AI Vision", false],
            ["Azure AI Speech", false],
            ["Azure Content Understanding", false],
        ],
    },
    {
        statement:
            "Uma pesquisa quer extrair de artigos apenas as menções a locais geográficos e datas específicas citadas no texto, cada uma classificada por tipo. Considerando as técnicas de análise de texto, qual atende melhor?",
        explanation:
            "Reconhecer e classificar itens por tipo (local, data, pessoa, valor) é o papel do reconhecimento de entidades. A extração de frases-chave devolveria os assuntos gerais do texto, sem separar cada menção por categoria.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Reconhecimento de entidades", true],
            ["Extração de frases-chave", false],
            ["Sumarização", false],
            ["Análise de sentimento", false],
        ],
    },
    {
        statement:
            "Um app de acessibilidade precisa ler em voz alta, com voz natural, o texto que aparece na tela. Qual capacidade de fala é essa?",
        explanation:
            "A síntese de fala (text-to-speech) transforma texto em voz natural, dando voz a assistentes e leitores de tela. O reconhecimento de fala faz o inverso (áudio em texto). Ambas ficam no Azure AI Speech.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Síntese de fala (text-to-speech)", true],
            ["Reconhecimento de fala (speech-to-text)", false],
            ["Tradução de fala", false],
            ["Análise de texto", false],
        ],
    },
    {
        statement:
            "Reconhecimento de fala (transcrição), síntese de fala e tradução de fala entre idiomas são capacidades de qual serviço clássico do Azure?",
        explanation:
            "O Azure AI Speech reúne o reconhecimento de fala, a síntese de fala e a tradução de fala. O Azure AI Language trata de texto escrito, não de áudio falado.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Azure AI Speech", true],
            ["Azure AI Language", false],
            ["Azure AI Vision", false],
            ["Azure Content Understanding", false],
        ],
    },
    {
        statement:
            "Uma central de atendimento grava as ligações e quer, primeiro, converter o áudio das chamadas em texto para, depois, analisar o sentimento das conversas. Qual carga trata a PRIMEIRA etapa (áudio falado convertido em texto)?",
        explanation:
            "A primeira etapa é o reconhecimento de fala (speech-to-text), no Azure AI Speech, que gera a transcrição. Só depois a análise de sentimento (Azure AI Language) atua sobre o texto transcrito. São duas cargas encadeadas.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Reconhecimento de fala", true],
            ["Análise de texto", false],
            ["Síntese de fala neural", false],
            ["Geração de imagem", false],
        ],
    },
    {
        statement:
            "Um designer digita 'um gato astronauta em aquarela' e o sistema cria uma imagem inédita a partir dessa descrição. Que tipo de carga de IA é essa?",
        explanation:
            "Criar uma imagem nova a partir de um texto é geração de imagem, uma aplicação de IA generativa. Interpretar, ler texto (OCR) ou detectar objetos são análises de uma imagem que já existe, não criação.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Geração de imagem (IA generativa)", true],
            ["Interpretação de imagem (visão computacional)", false],
            ["OCR", false],
            ["Detecção de objetos", false],
        ],
    },
    {
        statement:
            "Um app precisa ler o texto impresso em fotos de placas e documentos para digitalizá-lo. Qual capacidade de visão computacional é usada?",
        explanation:
            "O OCR (reconhecimento óptico de caracteres) extrai o texto presente em uma imagem. A detecção de objetos localiza itens, a classificação rotula a cena e a geração cria imagens novas.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["OCR (reconhecimento óptico de caracteres)", true],
            ["Detecção de objetos na imagem", false],
            ["Classificação da imagem em categorias amplas", false],
            ["Geração de imagem a partir de texto", false],
        ],
    },
    {
        statement:
            "Qual cenário é de VISÃO COMPUTACIONAL de interpretação, e não de geração de imagem?",
        explanation:
            "A visão computacional de interpretação analisa uma imagem que já existe (descrever, classificar, detectar objetos, ler texto). As outras opções criam imagens novas a partir de texto, o que é geração de imagem (IA generativa).",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Descrever o conteúdo de uma foto e detectar os objetos presentes nela", true],
            ["Criar uma ilustração nova a partir de uma frase de descrição", false],
            ["Produzir um logotipo a partir de uma descrição em texto", false],
            ["Gerar variações artísticas de um logotipo existente a partir de um prompt", false],
        ],
    },
    {
        statement:
            "Um sistema precisa analisar imagens já existentes para classificar a cena, detectar objetos e ler texto (OCR). Qual serviço clássico do Azure é o indicado?",
        explanation:
            "O Azure AI Vision é o serviço para interpretar imagens: classificação, detecção de objetos, OCR e descrição de conteúdo. Os demais serviços tratam de texto, fala e extração de informação de documentos e mídia.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Azure AI Vision", true],
            ["Azure AI Language", false],
            ["Azure AI Speech", false],
            ["Azure Content Understanding", false],
        ],
    },
    {
        statement:
            "Um assistente recebe uma foto junto da pergunta 'quantas pessoas há nesta imagem e o que elas estão fazendo?' e responde em texto. Que tipo de modelo torna isso possível?",
        explanation:
            "Modelos multimodais aceitam mais de um tipo de entrada (como imagem e texto) e conseguem interpretar a imagem para responder em linguagem natural. Um modelo somente de texto não enxergaria a foto.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Um modelo multimodal, que aceita imagem como entrada e responde em texto", true],
            [
                "Um modelo somente de texto, enviando no prompt uma descrição resumida da foto",
                false,
            ],
            ["Um modelo de síntese de fala com voz neural", false],
            ["Um modelo de extração de frases-chave do texto da pergunta", false],
        ],
    },
    {
        statement:
            "Uma emissora quer extrair, de vídeos gravados, informações estruturadas como as falas transcritas, as pessoas que aparecem e os temas abordados. Qual serviço do Azure é feito para extrair informação de documentos, imagens, áudio e vídeo?",
        explanation:
            "O Azure Content Understanding faz a extração de informação multimodal, retirando dados estruturados de documentos, imagens, áudio e vídeo. Os outros serviços cobrem apenas uma modalidade cada.",
        topic: "Cargas e capacidades de IA",
        options: [
            ["Azure Content Understanding", true],
            ["Azure AI Language", false],
            ["Azure AI Vision, para imagens estáticas", false],
            ["Azure AI Speech, para transcrever o áudio", false],
        ],
    },
    {
        statement:
            "Qual afirmação distingue corretamente extração de informação de análise de texto?",
        explanation:
            "A extração de informação (Azure Content Understanding) transforma documentos e mídia não estruturados em campos organizados, inclusive de imagem, áudio e vídeo. A análise de texto (Azure AI Language) atua sobre texto que já está escrito.",
        topic: "Cargas e capacidades de IA",
        options: [
            [
                "A extração de informação tira dados estruturados de documentos e mídia (imagem, áudio, vídeo); a análise de texto atua sobre texto já escrito",
                true,
            ],
            [
                "A análise de texto interpreta apenas imagens digitalizadas de páginas, enquanto a extração de informação trabalha somente com tabelas já estruturadas",
                false,
            ],
            [
                "As duas fazem o mesmo trabalho, mudando apenas o serviço do Azure em que cada uma é executada",
                false,
            ],
            [
                "A extração de informação gera imagens novas a partir do texto estruturado dos documentos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma desenvolvedora quer que o modelo generativo se comporte sempre como um atendente de suporte cordial, responda em português e nunca revele informações internas da empresa, valendo para todas as conversas do app. Onde ela deve definir esse comportamento?",
        explanation:
            "O prompt de sistema define papel, tom e regras que o modelo segue durante toda a conversa, sendo o lugar certo para instruções persistentes de comportamento. O prompt de usuário carrega a pergunta de cada turno, e temperatura ou nome do deployment não controlam o comportamento.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["No prompt de sistema (mensagem de sistema)", true],
            ["No prompt de usuário, repetindo as regras a cada pergunta", false],
            ["No nome do deployment do modelo", false],
            ["No parâmetro de temperatura", false],
        ],
    },
    {
        statement:
            "Em um chat com um modelo generativo, a pergunta específica que a pessoa digita a cada interação, como 'Qual o horário de funcionamento da loja?', é enviada em qual tipo de mensagem?",
        explanation:
            "O prompt de usuário representa a entrada da pessoa em cada turno da conversa. O prompt de sistema fica reservado às instruções gerais de comportamento, definidas uma vez para toda a sessão.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Prompt de usuário (mensagem de usuário)", true],
            ["Prompt de sistema (mensagem de sistema)", false],
            ["Mensagem de ferramenta (tool)", false],
            ["Nome do deployment", false],
        ],
    },
    {
        statement:
            "Depois de escolher um modelo generativo no catálogo de modelos do Microsoft Foundry, o que a equipe precisa fazer antes de conseguir chamá-lo a partir de um aplicativo?",
        explanation:
            "No Foundry, escolher o modelo no catálogo não basta: é preciso implantá-lo (deploy) em um projeto. O deploy cria um endpoint e um nome de deployment que o app usa para enviar prompts. Modelos generativos pré-treinados não exigem treinar do zero nem rotular dados.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Fazer o deploy (implantar) do modelo para obter um endpoint e um nome de deployment",
                true,
            ],
            ["Treinar o modelo do zero com os dados históricos da própria equipe", false],
            [
                "Rotular manualmente um conjunto de dados de exemplo para calibrar as respostas do modelo",
                false,
            ],
            ["Nada, o modelo do catálogo já fica acessível por código imediatamente", false],
        ],
    },
    {
        statement:
            "Antes de escrever qualquer linha de código, um analista quer testar prompts e ver como o modelo implantado responde, tudo pela interface do portal. Qual recurso do Microsoft Foundry atende a isso?",
        explanation:
            "O playground do portal permite conversar com o modelo implantado e experimentar prompts de sistema e de usuário sem escrever código. É o caminho para validar prompts antes de partir para o SDK.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["O playground de chat do portal do Foundry", true],
            ["O Foundry SDK em um script Python", false],
            ["Uma máquina virtual com o modelo instalado", false],
            ["Um cluster de treinamento do Azure Machine Learning", false],
        ],
    },
    {
        statement:
            "Uma equipe quer navegar por vários modelos generativos disponíveis, comparar suas capacidades e escolher o mais adequado ao cenário. O que o Microsoft Foundry oferece para isso?",
        explanation:
            "O catálogo de modelos reúne os modelos disponíveis no Foundry, permitindo comparar e escolher pela capacidade antes de implantar. Thread, filtro de conteúdo e nome de deployment cumprem outras funções.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["O catálogo de modelos (model catalog)", true],
            ["O thread de conversa criado pelo agente", false],
            ["O filtro de conteúdo do projeto", false],
            ["O nome do deployment do modelo", false],
        ],
    },
    {
        statement:
            "Ao criar uma solução single-agent no portal do Microsoft Foundry, onde você descreve o papel do agente e as regras que ele deve seguir ao responder?",
        explanation:
            "As instruções do agente funcionam como sua orientação de comportamento, equivalentes a um prompt de sistema: definem papel, tom e regras. O thread guarda a conversa e o run executa o agente; nenhum dos dois define comportamento.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Nas instruções (instructions) do agente", true],
            ["No identificador do thread da conversa", false],
            ["No objeto de run criado na execução", false],
            ["No número da versão da API do serviço", false],
        ],
    },
    {
        statement:
            "Para que serve o Foundry SDK (por exemplo, a biblioteca azure-ai-projects) em um aplicativo?",
        explanation:
            "O Foundry SDK permite que o código se conecte ao projeto do Foundry e envie prompts aos modelos ou orquestre agentes implantados. Ele não cria VMs, não desenha telas nem treina modelos de visão do zero.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Conectar o app a um projeto do Foundry e usar por código os modelos e agentes implantados",
                true,
            ],
            ["Criar e gerenciar as máquinas virtuais que hospedam os modelos no Azure", false],
            ["Desenhar a interface visual do aplicativo com componentes prontos", false],
            [
                "Treinar modelos de visão computacional do zero a partir de um conjunto de imagens anotado manualmente",
                false,
            ],
        ],
    },
    {
        statement:
            "Um modelo generativo está dando respostas muito variadas e imprevisíveis para a mesma pergunta, e a equipe quer saídas mais consistentes e diretas. Qual ajuste faz sentido?",
        explanation:
            "A temperatura controla a aleatoriedade da geração. Valores mais baixos deixam as respostas mais determinísticas e consistentes; valores altos aumentam a criatividade e a variação. Trocar o deployment ou o tipo de mensagem não resolve o problema.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Reduzir a temperatura (temperature)", true],
            ["Aumentar a temperatura (temperature)", false],
            ["Trocar o nome do deployment", false],
            ["Enviar a pergunta como prompt de sistema", false],
        ],
    },
    {
        statement:
            "Um aplicativo precisa receber, na mesma solicitação, uma foto de um produto e uma pergunta em texto sobre ela. Que tipo de modelo a equipe deve escolher no catálogo do Foundry?",
        explanation:
            "Modelos multimodais aceitam mais de um tipo de entrada, como texto e imagem juntos, e conseguem raciocinar sobre ambos. Um modelo só de texto não interpreta a foto, e embeddings ou síntese de fala servem a outros propósitos.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Um modelo multimodal", true],
            ["Um modelo somente de texto", false],
            ["Um modelo de embeddings", false],
            ["Um modelo apenas de síntese de fala", false],
        ],
    },
    {
        statement:
            'Observe o trecho:\n\nmessages=[\n    {"role": "system", "content": "Você é um assistente que responde de forma curta e formal."},\n    {"role": "user", "content": "Resuma as vantagens da computação em nuvem."}\n]\n\nQual mensagem define o comportamento geral do assistente?',
        explanation:
            "A mensagem de role 'system' carrega as instruções de comportamento (tom curto e formal). A mensagem de role 'user' traz a solicitação específica daquele turno. Separar as duas é o padrão de prompts de sistema e de usuário.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["A mensagem com role 'system'", true],
            ["A mensagem com role 'user'", false],
            ["As duas definem o comportamento por igual", false],
            ["Nenhuma; o comportamento vem do nome do modelo", false],
        ],
    },
    {
        statement:
            "Em um app com o Foundry SDK aparece:\n\nproject = AIProjectClient(\n    endpoint=project_endpoint,\n    credential=DefaultAzureCredential()\n)\n\nO que o valor de endpoint identifica?",
        explanation:
            "O endpoint aponta para o projeto do Foundry, dando ao SDK o ponto de entrada para acessar modelos e agentes implantados naquele projeto. Não é conta de armazenamento nem arquivo local de pesos.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["O projeto do Foundry ao qual o aplicativo se conecta", true],
            ["A conta de armazenamento onde os logs do app ficam", false],
            ["O arquivo local com os pesos do modelo implantado", false],
            ["O navegador usado para abrir o portal do Foundry", false],
        ],
    },
    {
        statement:
            "Considere:\n\nresponse = chat.complete(\n    model=model_deployment,\n    messages=messages\n)\n\nO que o argumento model=model_deployment referencia?",
        explanation:
            "Ao chamar o modelo pelo SDK, model recebe o nome do deployment criado quando o modelo foi implantado no projeto. Não é um arquivo local, nem a versão do SDK, nem um thread.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["O nome do deployment do modelo implantado no Foundry", true],
            ["O caminho de um arquivo de modelo salvo no disco local", false],
            ["A versão instalada do Foundry SDK no ambiente", false],
            ["O identificador do thread da conversa atual", false],
        ],
    },
    {
        statement:
            "No código de um agente aparece:\n\nthread = project.agents.threads.create()\n\nPara que serve esse thread?",
        explanation:
            "O thread representa a conversa: ele mantém as mensagens trocadas, permitindo que o agente acompanhe o contexto entre turnos. O deploy, as instruções e o filtro de conteúdo são responsabilidades separadas.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Guardar o histórico e o estado da conversa entre o usuário e o agente", true],
            ["Implantar o modelo escolhido no projeto", false],
            ["Definir as instruções de comportamento do agente durante a conversa", false],
            ["Aplicar o filtro de conteúdo às respostas geradas pelo agente", false],
        ],
    },
    {
        statement:
            "Em um app de agente aparece:\n\nrun = project.agents.runs.create_and_process(\n    thread_id=thread.id,\n    agent_id=agent.id\n)\n\nO que essa chamada faz?",
        explanation:
            "O run coloca o agente para processar as mensagens do thread e produzir a resposta. Ele não cria o agente (isso é feito antes), não exclui o thread nem implanta modelos.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Executa o agente sobre o thread para gerar a resposta", true],
            ["Cria um novo agente idêntico no projeto", false],
            ["Exclui o thread da conversa ao terminar", false],
            ["Implanta um novo modelo de chat no projeto do Foundry", false],
        ],
    },
    {
        statement:
            'Qual é o efeito da chamada abaixo em um app de agente?\n\nproject.agents.messages.create(\n    thread_id=thread.id,\n    role="user",\n    content="Meu pedido ainda não chegou."\n)',
        explanation:
            "messages.create insere uma nova mensagem (aqui, do usuário) no thread indicado, alimentando a conversa que o agente vai processar no próximo run. Não cria agente nem troca o modelo.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Adiciona a mensagem do usuário ao thread da conversa", true],
            ["Cria um novo agente no projeto com essas instruções", false],
            ["Troca o modelo implantado usado pelo agente", false],
            ["Abre o playground de chat do portal", false],
        ],
    },
    {
        statement:
            "As respostas de um assistente estão saindo longas e informais, mas a equipe quer respostas curtas e formais em todo o app, sem alterar o código de cada pergunta. Qual é a melhor abordagem?",
        explanation:
            "Tom e formato de resposta se controlam pelo prompt de sistema, que vale para toda a conversa sem precisar mexer em cada prompt de usuário. Temperatura mexe na aleatoriedade, não no tom; credencial e projeto não têm relação com o estilo da resposta.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Escrever no prompt de sistema instruções para responder de forma curta e formal",
                true,
            ],
            [
                "Aumentar a temperatura do modelo para que as respostas fiquem mais previsíveis e curtas",
                false,
            ],
            ["Trocar a credencial de autenticação usada pelo aplicativo", false],
            ["Criar um novo projeto no Foundry para cada pergunta enviada", false],
        ],
    },
    {
        statement:
            "As respostas de um modelo generativo estão sendo cortadas no meio da frase, e a equipe quer permitir textos mais longos. Qual parâmetro de configuração deve ser ajustado?",
        explanation:
            "O limite de tokens de saída define quantos tokens o modelo pode gerar na resposta. Se as respostas estão sendo truncadas, aumentar esse limite resolve. Temperatura afeta a variação, não o comprimento máximo.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["O máximo de tokens de saída (max tokens)", true],
            ["A temperatura (temperature) da chamada", false],
            ["O nome do deployment implantado", false],
            ["O prompt de sistema da conversa", false],
        ],
    },
    {
        statement:
            "Uma equipe implantou um modelo do catálogo e deu ao deployment o nome 'chat-prod'. No aplicativo, qual valor deve ser passado no argumento model= da chamada de chat?",
        explanation:
            "O SDK identifica o modelo pelo nome do deployment definido na implantação, aqui 'chat-prod'. O endpoint conecta ao projeto e a versão da API é outro parâmetro; nenhum deles vai no argumento model.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["'chat-prod', o nome do deployment criado", true],
            ["O nome de família do modelo, sempre em letras maiúsculas", false],
            ["O endpoint completo do projeto", false],
            ["A versão da API usada pelo SDK", false],
        ],
    },
    {
        statement:
            "No trecho abaixo, qual é o papel de DefaultAzureCredential()?\n\nproject = AIProjectClient(\n    endpoint=project_endpoint,\n    credential=DefaultAzureCredential()\n)",
        explanation:
            "A credencial cuida da autenticação, provando ao Foundry quem é o aplicativo, sem embutir segredos no código. Ela não escolhe modelo, não define temperatura nem cria threads.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Autenticar o aplicativo no projeto do Foundry usando a identidade do Azure", true],
            [
                "Escolher automaticamente qual modelo do catálogo será usado em cada conversa do aplicativo",
                false,
            ],
            ["Definir a temperatura padrão das respostas do projeto", false],
            ["Criar o thread da conversa no serviço de agentes", false],
        ],
    },
    {
        statement:
            "Ao montar uma solução single-agent simples no portal do Foundry, quais DUAS etapas NÃO são necessárias? (Selecione DUAS opções.)",
        explanation:
            "Um agente simples reutiliza um modelo generativo pronto do catálogo: basta implantá-lo, nomear o agente e escrever suas instruções. Treinar um modelo do zero e converter o modelo para ONNX não fazem parte do fluxo de criação de um single-agent.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Escrever um pipeline para treinar o modelo do zero", true],
            ["Converter o modelo escolhido para o formato ONNX", true],
            ["Selecionar e implantar um modelo para o agente usar", false],
            ["Dar um nome ao agente", false],
            ["Escrever as instruções (instructions) do agente", false],
        ],
    },
    {
        statement:
            "Um app usa um modelo multimodal implantado no Foundry e precisa enviar, na mesma pergunta, uma imagem e um texto. Como isso normalmente é feito?",
        explanation:
            "Modelos multimodais recebem imagem e texto no conteúdo da mensagem de usuário e raciocinam sobre os dois juntos. Não é preciso treinar um modelo de visão à parte, e a imagem não vai no prompt de sistema nem precisa virar áudio.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Incluindo a imagem junto com o texto no conteúdo da mensagem de usuário", true],
            ["Enviando a imagem apenas no prompt de sistema da conversa", false],
            ["Treinando um modelo de visão computacional separado antes de cada chamada", false],
            ["Convertendo a imagem em áudio descritivo antes de enviar", false],
        ],
    },
    {
        statement:
            "Em uma conversa de vários turnos enviada a um modelo de chat, com que role as respostas anteriores geradas pelo próprio modelo devem ser incluídas para preservar o contexto?",
        explanation:
            "As mensagens têm roles: 'system' para instruções gerais, 'user' para a entrada da pessoa e 'assistant' para as respostas do modelo. Incluir os turnos anteriores do assistente com esse role preserva o histórico da conversa. Não existe role 'deployment'.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Com o role 'assistant'", true],
            ["Com o role 'system'", false],
            ["Com o role 'user'", false],
            ["Com o role 'deployment'", false],
        ],
    },
    {
        statement:
            "Um modelo foi implantado no Foundry com o nome de deployment 'assistente-loja'. Mesmo assim, a chamada abaixo retorna erro de modelo não encontrado:\n\nresponse = chat.complete(\n    model=\"gpt-4o-mini\",\n    messages=messages\n)\n\nQual é a causa mais provável?",
        explanation:
            "O SDK localiza o modelo pelo nome do deployment definido na implantação. Passar o nome base do catálogo ('gpt-4o-mini') em vez de 'assistente-loja' provoca erro de modelo não encontrado. O formato das mensagens e a temperatura não causam esse erro.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O argumento model deveria receber o nome do deployment 'assistente-loja', não o nome base do modelo",
                true,
            ],
            [
                "A lista messages está em um formato que o endpoint de chat do Foundry não reconhece como conversa válida",
                false,
            ],
            ["O parâmetro temperature é obrigatório e não foi informado na chamada", false],
            ["O DefaultAzureCredential não aceita chamadas a modelos generativos", false],
        ],
    },
    {
        statement:
            'Um desenvolvedor criou o agente, criou o thread e adicionou a mensagem do usuário, mas o app nunca recebe uma resposta do agente:\n\nagent = project.agents.create_agent(model=deployment, name="suporte", instructions="...")\nthread = project.agents.threads.create()\nproject.agents.messages.create(thread_id=thread.id, role="user", content="Preciso de ajuda.")\n\nO que está faltando?',
        explanation:
            "Adicionar a mensagem ao thread não faz o agente responder: é preciso iniciar um run (por exemplo, runs.create_and_process) para que o agente processe o thread e gere a resposta. Uma segunda mensagem de sistema ou trocar o modelo não resolveriam a ausência de resposta.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["Criar e processar um run para o agente executar sobre o thread", true],
            ["Adicionar uma segunda mensagem de sistema ao mesmo thread da conversa", false],
            ["Implantar um modelo multimodal no lugar do modelo atual", false],
            ["Baixar os pesos do modelo para a máquina local do app", false],
        ],
    },
    {
        statement:
            "Uma solução precisa manter automaticamente o histórico de conversas de longa duração de cada usuário e, no futuro, executar ferramentas para cumprir tarefas em várias etapas. Qual abordagem do Foundry é mais adequada?",
        explanation:
            "O agente do Foundry mantém o estado da conversa em threads e pode ser estendido com ferramentas para tarefas de várias etapas, exatamente o cenário descrito. Uma chamada isolada de chat não guarda histórico, e temperatura ou novos deployments não resolvem a gestão de estado.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Construir um agente do Foundry, que gerencia o estado da conversa em threads e pode usar ferramentas",
                true,
            ],
            [
                "Fazer uma única chamada de chat.complete por mensagem, sem manter nenhum estado entre as conversas dos usuários",
                false,
            ],
            ["Aumentar a temperatura do modelo a cada turno para ele lembrar do contexto", false],
            ["Criar um deployment novo para cada mensagem enviada pelo usuário", false],
        ],
    },
    {
        statement:
            "Um app envia uma imagem no conteúdo da mensagem de usuário, mas o modelo implantado retorna erro ao processar a imagem. As mensagens estão bem formadas. Qual é a explicação mais provável?",
        explanation:
            "Só modelos multimodais interpretam imagens. Se o modelo implantado é somente de texto, enviar uma imagem gera erro, independentemente do formato das mensagens. Temperatura, prompt de sistema e thread não têm relação com a capacidade de processar imagens.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O modelo implantado é somente de texto; é preciso implantar um modelo multimodal",
                true,
            ],
            [
                "A temperatura da chamada está configurada baixa demais para o modelo interpretar imagens",
                false,
            ],
            ["Faltou definir um prompt de sistema com permissão para conteúdo visual", false],
            ["O thread do agente não foi criado antes do envio da mensagem", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor compara duas configurações do mesmo modelo:\n\n# Chamada A\nchat.complete(model=dep, messages=msgs, temperature=0.1)\n# Chamada B\nchat.complete(model=dep, messages=msgs, temperature=0.9)\n\nQual afirmação está correta?",
        explanation:
            "Temperatura mais alta (0.9) aumenta a aleatoriedade, gerando respostas mais variadas e criativas; temperatura mais baixa (0.1) deixa a saída mais focada e previsível. Ela influencia o conteúdo gerado, não a velocidade.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "A chamada B tende a produzir respostas mais variadas e criativas; a A, mais previsíveis",
                true,
            ],
            ["A chamada A tende a produzir respostas mais criativas e variadas que a B", false],
            ["As duas produzem exatamente a mesma resposta para qualquer prompt", false],
            [
                "A temperatura afeta somente a velocidade de geração dos tokens, não o conteúdo das respostas",
                false,
            ],
        ],
    },
    {
        statement:
            "Após a chamada abaixo, como o desenvolvedor obtém o texto gerado pelo assistente?\n\nresponse = chat.complete(model=deployment, messages=messages)",
        explanation:
            "A resposta de uma chamada de chat traz uma lista de choices; o texto do assistente fica em choices[0].message.content. As demais formas não correspondem à estrutura devolvida pelo cliente de chat.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            ["response.choices[0].message.content", true],
            ["response.content diretamente na raiz do objeto", false],
            ["response.thread.messages", false],
            ["response.deployment.text", false],
        ],
    },
    {
        statement:
            "Em um agente, um desenvolvedor cria um novo thread com threads.create() a cada mensagem que o usuário envia, dentro da mesma conversa. Qual é a consequência mais provável?",
        explanation:
            "O thread é o que guarda o histórico da conversa. Criar um thread novo a cada mensagem faz o agente começar do zero toda vez, perdendo o contexto anterior. Para manter a conversa, reutiliza-se o mesmo thread. As instruções continuam valendo e o modelo não é reimplantado.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O agente perde o contexto dos turnos anteriores, pois cada thread começa uma conversa vazia",
                true,
            ],
            [
                "O agente responde mais rápido, porque cada thread novo reaproveita o cache de contexto do anterior",
                false,
            ],
            [
                "As instruções do agente deixam de ser aplicadas a partir do segundo thread criado",
                false,
            ],
            ["O modelo é reimplantado a cada mensagem, gerando custo extra de implantação", false],
        ],
    },
    {
        statement:
            "Um aplicativo autentica com sucesso, mas toda chamada de chat falha porque o modelo indicado 'não existe' no projeto. O nome do deployment usado no código está escrito corretamente. Qual é a causa mais provável?",
        explanation:
            "Se a autenticação funciona mas o modelo 'não existe', o deployment provavelmente não foi feito naquele projeto, ou o endpoint aponta para outro projeto sem esse deployment. Versão do SDK, temperatura ou tamanho do prompt não causam a mensagem de modelo inexistente.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O modelo ainda não foi implantado nesse projeto do Foundry, ou o app aponta para o projeto errado",
                true,
            ],
            [
                "A biblioteca do Foundry SDK instalada no aplicativo está desatualizada em relação à API do serviço",
                false,
            ],
            ["A temperatura da chamada está configurada acima de 1", false],
            ["O prompt de usuário ultrapassou o limite de tokens do modelo", false],
        ],
    },
    {
        statement:
            "Uma equipe cria no Microsoft Foundry um app que precisa classificar cada avaliação de cliente como positiva, negativa ou neutra. Qual técnica de análise de texto atende a esse pedido?",
        explanation:
            "Rotular um texto como positivo, negativo ou neutro é o próprio trabalho da análise de sentimento. Frases-chave extraem os termos principais, entidades identificam pessoas, lugares e organizações, e a detecção de idioma só descobre em que língua o texto está.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Análise de sentimento", true],
            ["Extração de frases-chave", false],
            ["Reconhecimento de entidades nomeadas", false],
            ["Detecção de idioma", false],
        ],
    },
    {
        statement:
            "Você quer adicionar ao seu app do Foundry recursos prontos de análise de texto, como sentimento, frases-chave e entidades, sem treinar nada do zero. Qual serviço do Azure fornece essas capacidades?",
        explanation:
            "O Azure AI Language reúne as capacidades pré-treinadas de processamento de linguagem sobre texto (sentimento, frases-chave, entidades, idioma, resumo). Vision trata imagens, Speech trata áudio e o Content Understanding extrai dados estruturados de documentos e mídia.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Azure AI Language", true],
            ["Azure AI Vision", false],
            ["Azure AI Speech", false],
            ["Azure Content Understanding", false],
        ],
    },
    {
        statement:
            "Um app precisa marcar automaticamente cada chamado de suporte com os termos e tópicos mais relevantes do texto, para facilitar a busca. Qual técnica de análise de texto é a indicada?",
        explanation:
            "Identificar os termos e tópicos mais relevantes de um texto é o papel da extração de frases-chave. A sumarização produziria um resumo em texto corrido, e não uma lista de termos para usar como tags.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Extração de frases-chave", true],
            ["Sumarização", false],
            ["Análise de sentimento", false],
            ["Detecção de idioma", false],
        ],
    },
    {
        statement:
            "Seu app recebe mensagens de clientes de vários países e precisa, como primeiro passo, descobrir em que idioma cada mensagem foi escrita para depois encaminhá-la. Qual capacidade do Azure AI Language faz isso?",
        explanation:
            "A detecção de idioma informa qual língua predomina em um texto, exatamente o passo necessário antes de rotear ou traduzir a mensagem. As demais opções analisam o conteúdo, mas não identificam o idioma.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Detecção de idioma", true],
            ["Reconhecimento de entidades nomeadas", false],
            ["Análise de sentimento", false],
            ["Sumarização abstrativa", false],
        ],
    },
    {
        statement:
            "Antes de armazenar mensagens em texto livre, um app precisa localizar e ocultar dados pessoais como nomes, CPF e telefone. Qual capacidade do Azure AI Language é a mais adequada?",
        explanation:
            "A detecção de PII (informações de identificação pessoal) localiza e permite mascarar dados sensíveis no texto. O reconhecimento de entidades comum encontra entidades genéricas, mas a função específica para achar e ocultar dados pessoais é a detecção de PII.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Detecção de informações pessoais (PII)", true],
            ["Análise de sentimento das mensagens", false],
            ["Extração de frases-chave do texto", false],
            ["Sumarização extrativa das conversas", false],
        ],
    },
    {
        statement:
            "No contexto do catálogo de modelos do Microsoft Foundry, o que caracteriza um modelo multimodal?",
        explanation:
            "Multimodal significa lidar com mais de uma modalidade de entrada (texto, imagem, áudio) de forma integrada. É justamente isso que permite, por exemplo, responder a um prompt falado ou interpretar uma imagem enviada pelo usuário.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "É um modelo que processa mais de um tipo de entrada (texto, imagem, áudio) na mesma solicitação",
                true,
            ],
            [
                "É um modelo que só processa entradas de texto, mesmo quando a solicitação inclui imagens anexadas ao prompt",
                false,
            ],
            ["É um modelo usado exclusivamente para gerar imagens em alta resolução", false],
            ["É um modelo que funciona apenas offline, sem depender de um endpoint", false],
        ],
    },
    {
        statement:
            "Você quer um assistente em que o usuário faz uma pergunta falada e recebe uma resposta relevante. Quais DUAS vantagens um modelo multimodal do catálogo do Foundry traz nesse cenário, em comparação com um modelo só de texto? (Selecione DUAS opções.)",
        explanation:
            "Um modelo multimodal aceita o áudio da fala diretamente como entrada, o que elimina a etapa separada de transcrição para texto antes da chamada. As demais opções fazem afirmações falsas sobre custo, implantação e conectividade.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Pode receber o áudio do prompt falado diretamente como entrada", true],
            ["Dispensa uma etapa separada de transcrição antes da chamada ao modelo", true],
            ["É sempre mais barato que a dupla Azure AI Speech mais modelo de texto", false],
            ["Dispensa qualquer implantação (deploy) antes do primeiro uso", false],
            ["Funciona offline, sem conexão com a internet", false],
        ],
    },
    {
        statement:
            "No Foundry, o que você precisa fazer com um modelo multimodal do catálogo antes que o seu app consiga enviar prompts a ele?",
        explanation:
            "Modelos do catálogo já vêm pré-treinados; o passo necessário é implantar (deploy) o modelo para expor um endpoint que o app consome pelo SDK. Não é preciso treiná-lo do zero para usá-lo.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Implantá-lo (deploy) para obter um endpoint e chamá-lo pelo SDK do Foundry", true],
            [
                "Treiná-lo do zero com um conjunto de imagens e textos anotados pela própria equipe",
                false,
            ],
            ["Convertê-lo em um modelo clássico de visão computacional", false],
            ["Publicá-lo como um site estático com o endpoint embutido", false],
        ],
    },
    {
        statement:
            "Um modelo multimodal recebe, na mesma solicitação, um prompt falado e uma foto anexada, e responde considerando os dois. Como se descreve melhor essa capacidade de raciocinar sobre fala e imagem juntas?",
        explanation:
            "Combinar diferentes modalidades (áudio e imagem) numa mesma resposta é a essência do processamento multimodal. Sentimento, OCR e síntese de fala são tarefas específicas e de modalidade única.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Processamento multimodal (modalidades combinadas)", true],
            ["Análise de sentimento aplicada ao texto transcrito da fala", false],
            ["OCR (leitura de texto impresso em imagem)", false],
            ["Síntese de fala com voz neural", false],
        ],
    },
    {
        statement:
            "Uma equipe discute dois desenhos para um assistente de voz: (A) o Azure AI Speech transcreve o áudio em texto e um modelo de texto responde; (B) um modelo multimodal recebe o prompt falado diretamente. Qual afirmação sobre a abordagem (B) está correta?",
        explanation:
            "As duas abordagens são válidas, mas o diferencial da (B) é que o modelo multimodal aceita o áudio diretamente, dispensando a etapa separada de fala-para-texto. Não há conversão para imagem nem necessidade de treinar o modelo do zero.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Um modelo multimodal pode receber o áudio do prompt como entrada, sem uma etapa separada de transcrição para texto",
                true,
            ],
            [
                "O modelo multimodal exige que o áudio seja convertido primeiro em uma imagem de espectrograma antes de ser processado pelo endpoint",
                false,
            ],
            [
                "A abordagem B obriga a implantar dois modelos separados, um para áudio e outro para texto",
                false,
            ],
            [
                "A abordagem B só funciona se o modelo for treinado do zero com as vozes da própria equipe",
                false,
            ],
        ],
    },
    {
        statement:
            "Seu app precisa transformar um recado de voz gravado em texto escrito. Qual capacidade do Azure AI Speech faz isso?",
        explanation:
            "Converter áudio falado em texto é o reconhecimento de fala (speech to text). A síntese faz o caminho inverso, transformando texto em áudio.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Reconhecimento de fala (conversão de fala em texto)", true],
            ["Síntese de fala (conversão de texto em fala com voz neural)", false],
            ["Tradução de texto entre idiomas", false],
            ["Análise de sentimento do recado", false],
        ],
    },
    {
        statement:
            "Depois de gerar uma resposta em texto, seu app precisa lê-la em voz alta com uma voz natural para o usuário. Qual capacidade do Azure AI Speech é usada?",
        explanation:
            "Transformar texto em áudio falado é a síntese de fala (text to speech). O reconhecimento de fala faz o oposto, e frases-chave e OCR nem tratam de áudio.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Síntese de fala (conversão de texto em fala)", true],
            ["Reconhecimento de fala (conversão de fala em texto)", false],
            ["Extração de frases-chave", false],
            ["OCR", false],
        ],
    },
    {
        statement:
            "Um app recebe fala em português e precisa produzir o conteúdo em inglês quase em tempo real. Qual capacidade do Azure AI Speech atende diretamente a esse cenário?",
        explanation:
            "A tradução de fala do Azure AI Speech faz o reconhecimento e a tradução em conjunto, entregando o conteúdo falado em outro idioma. Só reconhecer ou só sintetizar não resolveria a mudança de língua.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Tradução de fala (speech translation)", true],
            ["Apenas reconhecimento de fala, sem tradução", false],
            ["Apenas síntese de fala", false],
            ["Detecção de idioma do Azure AI Language", false],
        ],
    },
    {
        statement:
            "O Azure AI Speech aparece disponível no Foundry Tools. Na prática, o que isso significa para quem constrói uma solução no Microsoft Foundry?",
        explanation:
            "O Foundry Tools reúne capacidades como a de fala de forma integrada, para você adicionar reconhecimento e síntese de fala à solução sem sair da plataforma. Não há substituição por outro modelo nem exigência de sair do Foundry.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Que a capacidade de fala está integrada como ferramenta do Foundry, pronta para entrar na solução",
                true,
            ],
            [
                "Que o Foundry substitui o Azure AI Speech por um modelo generativo próprio de áudio",
                false,
            ],
            [
                "Que o reconhecimento de fala só funciona fora do Foundry, em um recurso do Azure criado separadamente",
                false,
            ],
            [
                "Que a fala exige uma plataforma totalmente separada, sem integração com o Foundry",
                false,
            ],
        ],
    },
    {
        statement:
            "Você precisa apenas de uma transcrição literal e fiel de centenas de gravações de chamadas, sem extrair nenhuma outra informação estruturada. Qual é o serviço mais direto para essa tarefa?",
        explanation:
            "Para obter a transcrição literal do áudio, o caminho direto é o speech to text do Azure AI Speech. O Content Understanding seria excessivo aqui, pois seu foco é extrair campos e insights estruturados, não apenas transcrever.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Azure AI Speech (conversão de fala em texto)", true],
            ["Um modelo multimodal generativo do catálogo do Foundry", false],
            ["Azure Content Understanding com um esquema de campos", false],
            ["Azure AI Language", false],
        ],
    },
    {
        statement:
            "Um modelo multimodal recebe uma imagem e responde, em linguagem natural, a perguntas do usuário sobre o que aparece nela. Esse cenário é um exemplo de que capacidade?",
        explanation:
            "Receber uma imagem e responder perguntas sobre ela é interpretar entrada visual com um modelo multimodal. A geração de imagem criaria uma imagem nova, e as outras opções tratam de áudio e texto.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Interpretar entrada visual com um modelo multimodal", true],
            ["Geração de imagem nova a partir de um prompt de texto", false],
            ["Síntese de fala com voz neural", false],
            ["Extração de frases-chave do texto", false],
        ],
    },
    {
        statement:
            "Você envia a foto de um quadro branco com um diagrama e pede: 'explique o que este esboço representa'. Por que um modelo multimodal consegue atender a esse pedido?",
        explanation:
            "O modelo multimodal combina a imagem enviada com a pergunta em texto e raciocina sobre ambas para explicar o esboço. Isso vai além de um classificador, que apenas aplica rótulos fixos.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Porque aceita imagem e texto juntos e raciocina sobre os dois para gerar a resposta",
                true,
            ],
            ["Porque converte a imagem em uma narração de áudio antes de responder", false],
            ["Porque só aceita fotos de imagens que ele mesmo gerou anteriormente", false],
            [
                "Porque apenas classifica a imagem em um conjunto de categorias fixas definidas no pré-treino",
                false,
            ],
        ],
    },
    {
        statement:
            "Comparando o Azure AI Vision clássico com um modelo multimodal para descrever uma imagem, qual afirmação é verdadeira?",
        explanation:
            "O modelo multimodal permite diálogo aberto sobre a imagem (perguntas e respostas em linguagem natural), enquanto o Vision clássico entrega rótulos, categorias e OCR. O Vision não gera imagens novas, e o multimodal aceita imagens sim.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "O modelo multimodal responde perguntas abertas em linguagem natural sobre a imagem, além de rótulos e categorias fixas",
                true,
            ],
            [
                "O Azure AI Vision clássico gera imagens novas a partir de um texto descritivo",
                false,
            ],
            [
                "O modelo multimodal não consegue receber imagens como entrada, aceitando apenas descrições da cena escritas em texto",
                false,
            ],
            [
                "Os dois retornam exatamente os mesmos rótulos fixos, mudando apenas o preço por chamada",
                false,
            ],
        ],
    },
    {
        statement:
            "Um app deixa o usuário enviar a foto de um eletrodoméstico quebrado e perguntar, com as próprias palavras, qual peça pode estar com defeito e como descrever o problema. Qual é a opção mais adequada?",
        explanation:
            "Responder perguntas abertas e em linguagem natural sobre uma imagem pede um modelo multimodal. Vision e Custom Vision entregam rótulos ou categorias, e o Content Understanding foca em extrair campos estruturados, não em dialogar sobre a foto.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Um modelo multimodal, que interpreta a imagem e responde perguntas abertas", true],
            ["Azure AI Vision pré-treinado, que devolve rótulos e categorias gerais", false],
            [
                "Custom Vision, para classificar o eletrodoméstico com as suas próprias classes",
                false,
            ],
            ["Azure Content Understanding, para extrair campos estruturados da foto", false],
        ],
    },
    {
        statement:
            "Um app mostra a imagem de um gráfico a um modelo multimodal e pede um resumo, em palavras, da tendência exibida. Quais são, respectivamente, a entrada usada e a saída produzida pelo modelo?",
        explanation:
            "Interpretar entrada visual significa receber a imagem e produzir uma resposta em texto (aqui, o resumo da tendência). Gerar imagem a partir de texto ou transcrever áudio são tarefas diferentes.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Entrada: imagem (visual); saída: texto em linguagem natural descrevendo a tendência",
                true,
            ],
            ["Entrada: texto; saída: uma imagem nova do gráfico em maior resolução", false],
            ["Entrada: áudio; saída: uma transcrição do áudio explicando o gráfico", false],
            [
                "Entrada: imagem; saída: outra imagem editada, com a linha de tendência destacada em cores",
                false,
            ],
        ],
    },
    {
        statement: "Qual descrição corresponde à tarefa de geração de imagem?",
        explanation:
            "Geração de imagem é produzir conteúdo visual novo a partir de um prompt de texto. OCR, classificação e transcrição interpretam conteúdo que já existe, em vez de criar imagem.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Criar uma imagem nova a partir de uma descrição em texto (prompt)", true],
            ["Ler o texto impresso em uma foto e devolvê-lo digitado (OCR)", false],
            [
                "Classificar uma imagem já existente em um conjunto de categorias pré-definidas",
                false,
            ],
            ["Transcrever um áudio gravado em texto corrido", false],
        ],
    },
    {
        statement:
            "Um designer quer produzir variações originais de ilustração a partir de uma descrição escrita, dentro de um app do Foundry. Que tipo de modelo ele deve usar?",
        explanation:
            "Criar ilustrações novas a partir de texto pede um modelo generativo de geração de imagem (text-to-image) do catálogo do Foundry. Vision analisa imagens existentes, Speech trata áudio e Language trata texto.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Um modelo de geração de imagem (texto para imagem) do catálogo do Foundry", true],
            [
                "Azure AI Vision pré-treinado, com detecção e marcação de objetos em fotos existentes",
                false,
            ],
            ["Azure AI Speech, com vozes neurais personalizadas", false],
            ["Azure AI Language, com resumo abstrativo de textos", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve corretamente a diferença entre geração de imagem e visão computacional?",
        explanation:
            "Geração de imagem produz conteúdo visual novo (saída), enquanto a visão computacional analisa imagens que já existem (entrada). São cargas de trabalho opostas em termos de criar versus interpretar.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Geração de imagem cria conteúdo visual novo a partir de um prompt; visão computacional interpreta imagens existentes",
                true,
            ],
            [
                "As duas criam imagens novas a partir de texto, mudando apenas a resolução final",
                false,
            ],
            ["Geração de imagem serve para ler o texto impresso em fotos e digitalizações", false],
            [
                "Visão computacional gera as imagens novas a partir de texto, enquanto geração de imagem apenas classifica as já existentes",
                false,
            ],
        ],
    },
    {
        statement:
            "No Microsoft Foundry, qual é o fluxo para gerar imagens a partir de prompts dentro do seu app?",
        explanation:
            "O caminho é selecionar um modelo generativo de imagem no catálogo do Foundry, implantá-lo e enviar o prompt ao endpoint. O Custom Vision classifica imagens, e Speech e OCR não geram imagens.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Escolher um modelo de geração de imagem no catálogo, implantá-lo e chamar o endpoint com o prompt",
                true,
            ],
            [
                "Treinar um modelo de classificação de imagens no Custom Vision com exemplos rotulados de cada estilo",
                false,
            ],
            ["Usar o Azure AI Speech para sintetizar a imagem a partir da descrição falada", false],
            ["Habilitar o recurso de OCR do Azure AI Vision no projeto", false],
        ],
    },
    {
        statement:
            "Ao disponibilizar em seu app um recurso que gera imagens a partir de prompts dos usuários, quais DUAS práticas estão alinhadas aos princípios de IA responsável da Microsoft? (Selecione DUAS opções.)",
        explanation:
            "Confiabilidade e segurança pedem filtros de conteúdo contra saídas nocivas, e responsabilização pede supervisão humana sobre os casos sinalizados. Desligar os filtros ou proibir qualquer prompt não são práticas coerentes com os princípios.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Aplicar filtros de conteúdo e segurança para evitar imagens nocivas ou impróprias",
                true,
            ],
            ["Manter revisão humana para os casos sinalizados pelos filtros automáticos", true],
            [
                "Desativar todos os filtros de conteúdo para dar máxima liberdade criativa ao usuário",
                false,
            ],
            ["Garantir que as imagens geradas sejam sempre idênticas para o mesmo prompt", false],
            [
                "Impedir que o usuário escreva qualquer prompt livre, aceitando só opções prontas",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual serviço do Azure, disponível no Foundry Tools, é voltado a extrair informações estruturadas de documentos, imagens, áudio e vídeo?",
        explanation:
            "O Azure Content Understanding extrai informação estruturada de múltiplos tipos de conteúdo (documentos, imagens, áudio e vídeo). Language trata texto já digitado, Speech trata áudio e Vision trata imagens, cada um de forma mais específica.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Azure Content Understanding", true],
            ["Azure AI Language", false],
            ["Azure AI Speech, para o áudio das reuniões", false],
            ["Azure AI Vision, para rotular fotos", false],
        ],
    },
    {
        statement:
            "Uma empresa processa milhares de faturas e recibos e precisa obter fornecedor, data e valor total como campos estruturados. Por que o Azure Content Understanding é o serviço indicado do Foundry Tools? (Selecione DUAS opções.)",
        explanation:
            "Extrair campos estruturados (fornecedor, data, total) de documentos, inclusive digitalizados como imagem, é a especialidade do Azure Content Understanding. Sentimento, síntese de fala e geração de imagem não têm relação com o cenário.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Extrai campos estruturados de documentos e formulários", true],
            ["Aceita arquivos digitalizados como imagem, sem exigir texto digital", true],
            ["Classifica o sentimento do texto de cada fatura recebida", false],
            ["Sintetiza em voz alta o conteúdo dos recibos processados", false],
            ["Gera imagens novas das faturas em melhor resolução", false],
        ],
    },
    {
        statement:
            "Quais DUAS características distinguem o Azure Content Understanding de serviços de propósito único? (Selecione DUAS opções.)",
        explanation:
            "O diferencial do Content Understanding é ser multimodal: extrai informação estruturada de documentos, imagens, áudio e vídeo com uma mesma abordagem unificada. As demais opções descrevem serviços de modalidade única.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Extrai informação de vários tipos de conteúdo, como documentos, imagens, áudio e vídeo",
                true,
            ],
            ["Trata modalidades diferentes em uma mesma abordagem unificada", true],
            [
                "Só trabalha com texto que já foi digitado, recusando documentos digitalizados",
                false,
            ],
            ["Só gera imagens novas a partir de prompts de texto do usuário", false],
            ["Só converte texto escrito em fala com vozes neurais", false],
        ],
    },
    {
        statement:
            "A partir de gravações de chamadas de vendas (áudio e vídeo), a equipe precisa de insights estruturados, como tópicos discutidos, produtos citados e itens de ação, e não apenas a transcrição literal. Qual serviço é o mais adequado?",
        explanation:
            "Quando o objetivo vai além da transcrição e busca campos e insights estruturados de áudio ou vídeo, o serviço é o Content Understanding. O Azure AI Speech entregaria só o texto transcrito, sem estruturar tópicos, produtos e ações.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Azure Content Understanding, que extrai informações estruturadas de áudio e vídeo",
                true,
            ],
            [
                "Azure AI Speech, que devolve apenas a transcrição literal do áudio das chamadas",
                false,
            ],
            ["Azure AI Vision, que analisa os quadros do vídeo", false],
            ["Um modelo de geração de imagem para recriar as cenas", false],
        ],
    },
    {
        statement:
            "Você tem uma pasta de contratos em PDF digitalizados (imagens das páginas) e precisa levar cláusulas e campos específicos para um banco de dados. Qual serviço se encaixa, e por que o outro não?",
        explanation:
            "O Content Understanding lê e estrutura documentos e imagens, incluindo PDFs digitalizados, extraindo os campos desejados. O Azure AI Language analisa texto já em formato digital e não faz a leitura nem a estruturação do documento; Speech trata áudio e a geração de imagem cria imagens.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Azure Content Understanding: extrai campos estruturados de documentos e imagens; a análise do Language pressupõe texto digital",
                true,
            ],
            [
                "Azure AI Language, porque o recurso de análise de texto já executa o OCR das páginas digitalizadas antes de fazer a análise das cláusulas",
                false,
            ],
            [
                "Azure AI Speech, porque converte os documentos digitalizados em áudio antes da extração",
                false,
            ],
            [
                "Um modelo de geração de imagem, porque recria os campos do contrato em formato editável",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe cria um assistente de reservas que precisa entender frases como 'quero uma mesa para quatro na sexta' e transformá-las em uma ação, identificando a data e o número de pessoas. Qual capacidade de linguagem faz esse reconhecimento de intenção e de entidades?",
        explanation:
            "O Conversational Language Understanding interpreta enunciados, classifica a intenção e extrai entidades como data e quantidade. Detecção de idioma, TTS e OCR resolvem outros problemas.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "O reconhecimento de intenções e entidades, oferecido pelo Conversational Language Understanding",
                true,
            ],
            [
                "A detecção de idioma, que apenas identifica em que língua a frase foi escrita",
                false,
            ],
            ["O text to speech, que converte em áudio falado a frase que o usuário digitou", false],
            [
                "O OCR, que lê o texto impresso apenas quando a frase chega ao sistema como uma imagem digitalizada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa já tem um manual e uma lista de perguntas frequentes em texto e quer um bot que responda às dúvidas dos clientes com base nesse conteúdo, sem treinar um modelo generativo do zero. Quais DUAS afirmações explicam por que a resposta a perguntas personalizada (custom question answering) do Azure AI Language atende? (Selecione DUAS opções.)",
        explanation:
            "A resposta a perguntas personalizada transforma FAQs e documentos em uma base de conhecimento e devolve a resposta mais adequada mesmo quando a pergunta chega com fraseado diferente do original. As demais opções descrevem análise de sentimento, extração de frases-chave e tradução.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            ["Cria uma base de conhecimento consultável a partir das FAQs e do manual", true],
            ["Retorna a melhor resposta mesmo quando a pergunta vem com outro fraseado", true],
            ["Classifica cada mensagem recebida como positiva, negativa ou neutra", false],
            ["Lista apenas os termos mais relevantes encontrados em cada pergunta", false],
            ["Converte as perguntas dos clientes para outro idioma antes de responder", false],
        ],
    },
    {
        statement:
            "Um sistema de controle de acesso precisa localizar e contar rostos em fotos da portaria e, por privacidade, borrar cada rosto encontrado antes de arquivar a imagem. Qual capacidade de visão computacional atende a esse requisito?",
        explanation:
            "A detecção de rostos do Azure AI Vision encontra e delimita as faces presentes na imagem, permitindo contar e ocultar cada uma. Geração de imagem, frases-chave e fala tratam de outras tarefas.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "A geração de imagem, que cria rostos sintéticos a partir de uma descrição em texto",
                false,
            ],
            [
                "A extração de frases-chave, que resume em palavras os termos centrais de um texto",
                false,
            ],
            [
                "O reconhecimento de fala, que transcreve em texto o áudio que seria captado pelos microfones das câmeras da portaria",
                false,
            ],
            [
                "A detecção de rostos, que localiza as faces na imagem e retorna a posição de cada uma",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma equipe transcreve reuniões e, além do texto, precisa saber quem falou cada trecho, separando e rotulando os diferentes participantes ao longo da gravação. Qual recurso do Azure AI Speech resolve isso?",
        explanation:
            "A diarização identifica e rotula os diferentes locutores, indicando quem falou cada parte da transcrição. Síntese, tradução de fala e detecção de idioma cobrem outras necessidades.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "A síntese de fala, que gera uma voz natural para ler a ata da reunião em voz alta",
                false,
            ],
            [
                "A separação de locutores (diarização), que atribui cada trecho transcrito ao participante que o falou",
                true,
            ],
            [
                "A tradução de fala, que converte o áudio falado da reunião para outro idioma quase em tempo real durante a chamada",
                false,
            ],
            [
                "A detecção de idioma, que identifica em qual língua cada participante está falando na sala",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora recebe todo mês o mesmo formulário próprio de sinistro, com um layout que os modelos prontos não reconhecem bem, e quer treinar um extrator usando alguns exemplos rotulados desse formulário. Qual abordagem do Document Intelligence é indicada?",
        explanation:
            "Quando os modelos prontos não cobrem um layout específico, o Document Intelligence permite treinar um modelo personalizado com poucos exemplos rotulados. Os demais recursos não extraem campos de formulários próprios.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "Usar o modelo pronto de fatura, que já vem preparado para notas fiscais e recibos comerciais",
                false,
            ],
            [
                "Aplicar a detecção de idioma para descobrir em que língua o formulário foi preenchido",
                false,
            ],
            [
                "Treinar um modelo personalizado do Document Intelligence com exemplos rotulados do próprio formulário",
                true,
            ],
            [
                "Enviar o formulário para a síntese de fala, que lê em voz alta cada um dos campos preenchidos pelo segurado no documento",
                false,
            ],
        ],
    },
    {
        statement:
            "Um cartório digitaliza fichas antigas que misturam texto datilografado e anotações feitas à mão e precisa converter tudo em texto editável. Qual capacidade de visão computacional lê tanto o texto impresso quanto o manuscrito nessas imagens?",
        explanation:
            "O OCR (recurso Read do Azure AI Vision) reconhece texto impresso e manuscrito em imagens e documentos digitalizados, gerando texto editável. Sentimento, geração de imagem e tradução resolvem outros problemas.",
        topic: "Texto, fala, visão e extração no Foundry",
        options: [
            [
                "A análise de sentimento, que avalia se o conteúdo das fichas é positivo ou negativo",
                false,
            ],
            [
                "A geração de imagem, que produz novas fichas ilustradas a partir de uma descrição textual",
                false,
            ],
            [
                "A tradução de texto, que converte para outro idioma o conteúdo textual que já estava presente nas fichas escaneadas",
                false,
            ],
            [
                "O reconhecimento óptico de caracteres (OCR), que extrai texto impresso e manuscrito das imagens",
                true,
            ],
        ],
    },
    {
        statement:
            "Um banco quer que seu assistente generativo responda perguntas de clientes usando os documentos internos de políticas, em vez de depender só do conhecimento geral do modelo. Qual abordagem no Foundry atende a isso?",
        explanation:
            "O RAG (geração aumentada por recuperação) busca trechos relevantes dos seus documentos em um índice e os fornece ao modelo, que responde com base neles. Ajustar temperature, max_tokens ou a voz não traz o conteúdo interno.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Aumentar a temperature do modelo para que ele invente respostas mais variadas sobre as políticas",
                false,
            ],
            [
                "Usar RAG, conectando o modelo a um índice com os documentos internos para fundamentar as respostas",
                true,
            ],
            [
                "Reduzir o max_tokens para que as respostas do assistente fiquem sempre bem curtas",
                false,
            ],
            [
                "Trocar a voz de saída no text to speech para que o assistente soe mais natural ao ler as políticas",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de fundamentar (grounding) o modelo com trechos recuperados dos documentos da empresa, a equipe observa menos respostas inventadas. Quais DUAS afirmações explicam o efeito do grounding? (Selecione DUAS opções.)",
        explanation:
            "Fundamentar o modelo com trechos recuperados confiáveis faz a resposta se apoiar em fatos concretos, inclusive dados internos que não estavam no treinamento, reduzindo alucinações. O grounding não altera limite de tokens, tamanho do modelo nem a mensagem de sistema.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O modelo se apoia nos trechos reais recebidos junto com a pergunta e tende a alucinar menos",
                true,
            ],
            [
                "As respostas passam a refletir informações da empresa que o modelo não viu no treinamento",
                true,
            ],
            [
                "O grounding aumenta o limite de tokens da resposta, permitindo textos consideravelmente maiores",
                false,
            ],
            [
                "O grounding substitui o modelo por um de menor tamanho, reduzindo o custo por token processado",
                false,
            ],
            [
                "O grounding desativa a mensagem de sistema, deixando o modelo responder sem instrução prévia",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer montar visualmente um fluxo que encadeia a busca de dados, a montagem do prompt e a chamada ao modelo, e ainda avaliar a qualidade das respostas antes de publicar. Qual recurso do Foundry é indicado?",
        explanation:
            "O prompt flow permite construir, testar e avaliar fluxos que encadeiam recuperação de dados, prompts e chamadas ao modelo antes de implantar. TTS, detecção de idioma e OCR não orquestram esse fluxo.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O text to speech, que transforma cada resposta gerada em áudio com uma voz natural para ser ouvida pelo usuário",
                false,
            ],
            [
                "A detecção de idioma, que descobre em que língua a pergunta do usuário foi escrita",
                false,
            ],
            [
                "O prompt flow, que orquestra as etapas do fluxo generativo e permite avaliá-lo antes da implantação",
                true,
            ],
            [
                "O OCR, que extrai o texto presente em imagens e documentos digitalizados enviados ao fluxo",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao criar um agente no Azure AI Agent Service, a equipe quer que ele consulte um conjunto de arquivos internos para responder com base neles, além de seguir as instruções de comportamento. O que precisa ser adicionado ao agente?",
        explanation:
            "Agentes ganham acesso a dados e ações por meio de ferramentas; uma ferramenta de busca em arquivos deixa o agente recuperar conteúdo interno para fundamentar respostas. Temperature, voz e threads extras não cumprem esse papel.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Um valor de temperature igual a zero, o que por si só faz o agente ler os arquivos internos",
                false,
            ],
            [
                "Uma voz de text to speech, para que o agente leia os arquivos internos em áudio ao usuário",
                false,
            ],
            [
                "Um segundo thread de conversa, criado a cada nova mensagem do usuário, para que o agente acesse os arquivos automaticamente",
                false,
            ],
            [
                "Uma ferramenta de conhecimento, como busca em arquivos, para o agente recuperar e citar o conteúdo interno",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa que o modelo adote de forma consistente um estilo de redação muito específico e um formato fixo de saída, e tem milhares de exemplos rotulados desse padrão. Qual abordagem de personalização ajusta o próprio modelo a partir desses exemplos?",
        explanation:
            "O ajuste fino re-treina o modelo com exemplos rotulados, fazendo-o incorporar um estilo e formato específicos de forma consistente. Geração de imagem, detecção de idioma e reconhecimento de fala não personalizam o texto gerado.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "O ajuste fino (fine-tuning), que treina o modelo com os exemplos rotulados para incorporar o padrão desejado",
                true,
            ],
            [
                "A geração de imagem, que cria ilustrações originais e inéditas a partir das descrições textuais enviadas pela equipe da empresa",
                false,
            ],
            [
                "A detecção de idioma, que identifica em que língua cada exemplo rotulado foi escrito",
                false,
            ],
            [
                "O reconhecimento de fala, que transcreve em texto os áudios gravados pela equipe de redação",
                false,
            ],
        ],
    },
    {
        statement:
            "Sem treinar nada, um desenvolvedor quer orientar o formato da resposta incluindo no próprio prompt dois ou três exemplos de pergunta e resposta antes da pergunta real. Como se chama essa técnica?",
        explanation:
            "No few-shot, exemplos são incluídos no próprio prompt para mostrar ao modelo o padrão esperado, sem re-treinar nada. Ajuste fino, implantação e Content Safety são conceitos diferentes.",
        topic: "IA generativa e agentes no Foundry",
        options: [
            [
                "Ajuste fino, que re-treina os pesos do modelo usando um grande conjunto de dados rotulados",
                false,
            ],
            [
                "Fornecer exemplos no prompt (few-shot), guiando o modelo pelo padrão dos exemplos incluídos",
                true,
            ],
            [
                "Implantação (deployment), que disponibiliza o modelo escolhido em um endpoint para ser chamado",
                false,
            ],
            [
                "Content Safety, que analisa o prompt em busca de conteúdo nocivo antes de enviá-lo ao modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma rede social precisa analisar automaticamente textos e imagens enviados pelos usuários para detectar conteúdo de ódio, violência, sexual ou de automutilação e bloqueá-lo. Qual serviço do Azure é voltado a isso?",
        explanation:
            "O Azure AI Content Safety identifica e classifica conteúdo nocivo (ódio, violência, sexual e automutilação) em texto e imagens, com níveis de severidade. Speech, Document Intelligence e detecção de idioma têm outras finalidades.",
        topic: "IA responsável e modelos",
        options: [
            [
                "O Azure AI Speech, que converte em texto o áudio das publicações enviadas pelos usuários da rede",
                false,
            ],
            [
                "O Document Intelligence, que extrai campos estruturados como fornecedor, data e valor total de documentos e formulários digitalizados",
                false,
            ],
            [
                "O Azure AI Content Safety, que detecta conteúdo nocivo em texto e imagem por categoria e severidade",
                true,
            ],
            [
                "A detecção de idioma, que apenas informa em que língua cada publicação foi escrita pelo usuário",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao implantar um modelo generativo no Foundry, a equipe percebe que já existe, por padrão, um sistema que examina os prompts e as respostas e pode bloquear conteúdo nocivo por categoria e nível de severidade. Como se chama esse mecanismo?",
        explanation:
            "Cada implantação no Foundry aplica filtros de conteúdo que analisam entradas e saídas e bloqueiam conteúdo nocivo conforme a severidade. Temperature, prompt flow e tokenizador não fazem essa moderação.",
        topic: "IA responsável e modelos",
        options: [
            [
                "O parâmetro temperature, que controla o quanto as respostas do modelo ficam aleatórias, variadas e criativas a cada chamada",
                false,
            ],
            [
                "O prompt flow, que encadeia visualmente as etapas de recuperação, prompt e chamada ao modelo",
                false,
            ],
            [
                "O tokenizador, que quebra o texto de entrada em unidades menores antes de o modelo processá-lo",
                false,
            ],
            [
                "Os filtros de conteúdo do deployment, que avaliam prompts e respostas e bloqueiam conteúdo nocivo pela severidade",
                true,
            ],
        ],
    },
    {
        statement:
            "Antes de colocar um assistente em produção, a equipe quer medir de forma sistemática se as respostas do modelo são fundamentadas, relevantes e coerentes, comparando configurações. Quais DUAS práticas do Foundry apoiam essa decisão? (Selecione DUAS opções.)",
        explanation:
            "A avaliação de modelos no Foundry aplica métricas como fundamentação, relevância e coerência, inclusive contra respostas de referência montadas pela equipe, para comparar e validar configurações antes da produção. Síntese de fala, detecção de idioma e temperature não medem qualidade.",
        topic: "IA responsável e modelos",
        options: [
            [
                "Usar a avaliação de modelos, que mede as respostas por métricas como fundamentação e coerência",
                true,
            ],
            [
                "Comparar as respostas com um conjunto de referência preparado pela própria equipe",
                true,
            ],
            [
                "Ativar a síntese de fala, que lê as respostas em voz alta com entonação natural",
                false,
            ],
            [
                "Usar a detecção de idioma, que informa em que língua cada resposta foi redigida",
                false,
            ],
            [
                "Aumentar a temperature, para que as respostas fiquem sempre diferentes entre si",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe navega pelo catálogo de modelos do Foundry para escolher um modelo generativo. Qual conjunto de critérios é mais adequado para orientar essa escolha?",
        explanation:
            "A escolha de um modelo deve considerar a tarefa e a modalidade, os benchmarks de desempenho, o custo e o tamanho de contexto necessários. Critérios como cor do ícone ou ordem na lista são irrelevantes.",
        topic: "IA responsável e modelos",
        options: [
            [
                "O tipo de tarefa, a modalidade suportada, os benchmarks de desempenho, o custo e o tamanho do contexto",
                true,
            ],
            [
                "A cor do ícone do modelo no catálogo e a ordem alfabética em que ele aparece na lista de resultados",
                false,
            ],
            [
                "Apenas o nome do fornecedor, escolhendo sempre o primeiro modelo que aparecer logo na página inicial do catálogo de modelos",
                false,
            ],
            [
                "Somente a data de publicação, adotando invariavelmente o modelo mais recente sem avaliar mais nada",
                false,
            ],
        ],
    },
    {
        statement:
            "A Microsoft organiza sua abordagem de IA responsável em torno de um conjunto de princípios. Qual das opções a seguir NÃO é um desses princípios?",
        explanation:
            "Os princípios de IA responsável da Microsoft incluem imparcialidade, confiabilidade e segurança, privacidade e segurança, inclusão, transparência e responsabilização. Priorizar o lucro acima de tudo não é um deles.",
        topic: "IA responsável e modelos",
        options: [
            [
                "Tratar as pessoas de forma justa, sem discriminar grupos por características como gênero ou etnia",
                false,
            ],
            [
                "Priorizar o retorno financeiro do sistema acima de qualquer outra consideração de projeto",
                true,
            ],
            [
                "Operar de maneira confiável e segura, inclusive diante de situações inesperadas",
                false,
            ],
            ["Proteger a privacidade e a segurança dos dados usados pelo sistema de IA", false],
        ],
    },
    {
        statement:
            "Uma rede de lojas quer prever, em reais, o faturamento do próximo mês de cada filial a partir de dados históricos de vendas. Que tipo de tarefa de machine learning corresponde a prever um valor numérico contínuo?",
        explanation:
            "A regressão prevê um valor numérico contínuo, como faturamento ou temperatura, a partir de variáveis de entrada. Classificação atribui categorias, e os demais tratam de imagem e fala.",
        topic: "Cargas e capacidades de IA",
        options: [
            [
                "Classificação, que atribui a cada exemplo um rótulo entre categorias previamente definidas",
                false,
            ],
            [
                "Geração de imagem, que cria figuras originais a partir de uma descrição escrita em texto",
                false,
            ],
            [
                "Regressão, que estima um valor numérico contínuo a partir dos dados históricos de entrada",
                true,
            ],
            [
                "Reconhecimento de fala, que transcreve em texto o áudio das ligações de vendas das filiais",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de marketing tem uma base de clientes sem rótulos e quer descobrir automaticamente grupos de perfis parecidos, sem definir as categorias de antemão. Que tipo de tarefa de machine learning faz esse agrupamento?",
        explanation:
            "O agrupamento (clustering) é uma tarefa não supervisionada que forma grupos de itens semelhantes sem rótulos predefinidos. Regressão, TTS e OCR resolvem outros tipos de problema.",
        topic: "Cargas e capacidades de IA",
        options: [
            [
                "Agrupamento (clustering), que reúne exemplos semelhantes sem depender de rótulos definidos antes",
                true,
            ],
            [
                "Regressão, que prevê um valor numérico contínuo a partir das variáveis de entrada disponíveis",
                false,
            ],
            [
                "Text to speech, que converte em áudio falado o texto dos perfis cadastrados dos clientes",
                false,
            ],
            [
                "OCR, que lê o texto impresso presente em imagens e documentos digitalizados enviados pela equipe",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema financeiro monitora transações em tempo real e precisa apontar automaticamente as que fogem muito do padrão normal, para sinalizar possível fraude. Que tipo de capacidade de IA se aplica a identificar esses pontos fora do padrão?",
        explanation:
            "A detecção de anomalias identifica pontos que destoam do comportamento normal dos dados, útil para fraude e falhas. Geração de texto, síntese de fala e tradução têm outros objetivos.",
        topic: "Cargas e capacidades de IA",
        options: [
            [
                "A geração de texto, que redige descrições originais para cada transação processada pelo sistema",
                false,
            ],
            [
                "A síntese de fala, que anuncia em voz alta o valor de cada transação aprovada pelo sistema",
                false,
            ],
            [
                "A tradução automática, que converte a descrição de cada transação para o idioma do analista responsável",
                false,
            ],
            [
                "A detecção de anomalias, que sinaliza registros que se desviam de forma incomum do padrão esperado",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa tem milhões de documentos, e-mails e PDFs dispersos e quer torná-los pesquisáveis, extraindo e indexando informações para que as pessoas encontrem respostas rapidamente. Que tipo de carga de IA descreve isso?",
        explanation:
            "A mineração de conhecimento (knowledge mining) extrai, enriquece e indexa informações de grandes volumes de conteúdo, tornando-o pesquisável. Geração de imagem, reconhecimento e síntese de fala não cumprem esse papel.",
        topic: "Cargas e capacidades de IA",
        options: [
            [
                "Mineração de conhecimento, que enriquece e indexa grandes volumes de conteúdo para torná-lo pesquisável",
                true,
            ],
            [
                "Geração de imagem, que produz ilustrações originais a partir de descrições escritas pelos usuários",
                false,
            ],
            [
                "Reconhecimento de fala, que transcreve em texto o áudio de reuniões e de ligações telefônicas gravadas pela empresa",
                false,
            ],
            [
                "Síntese de fala, que lê em voz alta, com voz natural, o conteúdo dos documentos armazenados",
                false,
            ],
        ],
    },
];
