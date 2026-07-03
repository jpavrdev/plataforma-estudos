// Seed da trilha AI-900 (Microsoft Azure AI Fundamentals). Cria a trilha se não
// existir, com módulos e aulas em blocos + 5 questões por aula. Idempotente e não
// destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-ai900.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AZURE AI-900";
const DESCRICAO =
    "Trilha de fundamentos de inteligência artificial no Microsoft Azure para a certificação AI-900: cargas de trabalho de IA e IA responsável, machine learning, visão computacional, processamento de linguagem natural e IA generativa com o Azure OpenAI.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO3: Aula[] = [
    {
        titulo: "Cargas de trabalho de visão computacional",
        blocks: [
            {
                type: "text",
                value: "## O que é visão computacional\n Visão computacional é a área da IA que extrai informação de imagens e vídeos. As cargas de trabalho mais cobradas no AI-900 são classificação de imagem, detecção de objetos, segmentação semântica, OCR e análise facial. O que a prova mais pede é saber associar um cenário à tarefa certa, então preste atenção nas palavras-chave de cada uma.",
            },
            {
                type: "table",
                value: '[["Tarefa","O que faz","Saída típica"],["Classificação de imagem","Rotula a imagem inteira","Uma classe para a foto"],["Detecção de objetos","Localiza vários itens","Classe mais caixa delimitadora"],["Segmentação semântica","Classifica cada pixel","Máscara por região"],["OCR","Lê texto presente na imagem","Texto extraído"],["Análise facial","Detecta e analisa rostos","Rostos e atributos"]]',
            },
            {
                type: "text",
                value: "## Classificação x detecção de objetos\n A dúvida clássica da prova é entre essas duas. A classificação responde 'o que é esta imagem?' e devolve um único rótulo para a foto toda. A detecção de objetos responde 'o que existe e onde?', devolvendo cada item com uma caixa delimitadora (bounding box). Se o cenário fala em localizar, contar ou marcar a posição de algo, é detecção de objetos. A segmentação semântica vai além e classifica pixel a pixel, útil quando você precisa do contorno exato de cada região.",
            },
            {
                type: "quote",
                value: "Classificação rotula a imagem inteira; detecção de objetos localiza cada item com uma caixa delimitadora; segmentação semântica classifica pixel a pixel.",
            },
            {
                type: "table",
                value: '[["Cenário","Tarefa correta"],["Marcar a foto como praia ou cidade","Classificação de imagem"],["Contar e localizar carros numa rua","Detecção de objetos"],["Separar estrada, céu e pedestres pixel a pixel","Segmentação semântica"],["Ler a placa de um veículo na foto","OCR"],["Encontrar rostos numa foto de grupo","Análise facial"]]',
            },
        ],
        questions: [
            {
                statement:
                    "Um aplicativo precisa marcar cada foto enviada como 'cachorro' ou 'gato', sem indicar onde o animal está na imagem. Qual carga de trabalho resolve isso?",
                difficulty: "facil",
                options: [
                    { text: "Classificação de imagem", isCorrect: true },
                    { text: "Detecção de objetos", isCorrect: false },
                    { text: "Segmentação semântica", isCorrect: false },
                    { text: "OCR", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma loja quer localizar e contar cada produto na prateleira, desenhando um retângulo em volta de cada um. Qual tarefa de visão é essa?",
                difficulty: "facil",
                options: [
                    { text: "Detecção de objetos", isCorrect: true },
                    { text: "Classificação de imagem", isCorrect: false },
                    { text: "OCR", isCorrect: false },
                    { text: "Análise facial", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um sistema precisa extrair o texto impresso de fotos de notas fiscais para lançar os valores. Qual carga de trabalho de visão é indicada?",
                difficulty: "facil",
                options: [
                    { text: "OCR", isCorrect: true },
                    { text: "Classificação de imagem", isCorrect: false },
                    { text: "Detecção de objetos", isCorrect: false },
                    { text: "Segmentação semântica", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um carro autônomo precisa classificar cada pixel da câmera como via, calçada, pedestre ou veículo, com o contorno exato de cada região. Qual tarefa atende a isso?",
                difficulty: "medio",
                options: [
                    { text: "Segmentação semântica", isCorrect: true },
                    { text: "Detecção de objetos", isCorrect: false },
                    { text: "Classificação de imagem", isCorrect: false },
                    { text: "OCR", isCorrect: false },
                ],
            },
            {
                statement:
                    "Qual é a principal diferença entre classificação de imagem e detecção de objetos?",
                difficulty: "medio",
                options: [
                    {
                        text: "A detecção de objetos localiza itens com caixas delimitadoras, enquanto a classificação atribui um único rótulo à imagem inteira",
                        isCorrect: true,
                    },
                    {
                        text: "A classificação lê texto na imagem e a detecção de objetos não",
                        isCorrect: false,
                    },
                    {
                        text: "A classificação trabalha pixel a pixel e a detecção de objetos não",
                        isCorrect: false,
                    },
                    {
                        text: "Não há diferença, são nomes diferentes para a mesma tarefa",
                        isCorrect: false,
                    },
                ],
            },
        ],
    },
    {
        titulo: "O serviço Azure AI Vision",
        blocks: [
            {
                type: "text",
                value: "## O serviço Azure AI Vision\n O Azure AI Vision reúne modelos pré-treinados que já entendem imagens sem que você precise treinar nada. Você envia a imagem e consome o resultado direto pela API. Ele cobre análise de imagem (tags, descrição, detecção de objetos e detecção de conteúdo) e leitura de texto com o recurso Read.",
            },
            {
                type: "table",
                value: '[["Recurso","O que entrega"],["Marcações (tags)","Palavras-chave sobre o conteúdo da imagem"],["Descrição e legenda","Frase que descreve a cena"],["Detecção de objetos","Itens comuns com caixas delimitadoras"],["Detecção de conteúdo","Sinaliza conteúdo adulto ou impróprio"],["Read","Extrai texto impresso e manuscrito (OCR)"]]',
            },
            {
                type: "text",
                value: "## Leitura de texto com o Read\n O recurso Read é o OCR do Azure AI Vision. Ele extrai texto impresso e manuscrito de fotos, documentos digitalizados e capturas de tela, devolvendo o texto e a posição de cada linha. É a escolha para transformar imagem de documento em texto pesquisável.",
            },
            {
                type: "quote",
                value: "O recurso Read do Azure AI Vision é o OCR: extrai texto impresso e manuscrito de imagens e documentos.",
            },
            {
                type: "text",
                value: "## Pronto para usar\n Como os modelos já vêm treinados, o Azure AI Vision é ideal quando você precisa de resultados rápidos para categorias gerais e não tem imagens rotuladas nem equipe de ciência de dados. Se o seu caso exige reconhecer classes específicas do seu domínio, aí entra o Custom Vision, tema da próxima aula.",
            },
        ],
        questions: [
            {
                statement:
                    "Você quer, sem treinar nenhum modelo, obter tags e uma legenda que descreva o conteúdo das fotos de um catálogo. Qual serviço usar?",
                difficulty: "facil",
                options: [
                    { text: "Azure AI Vision (análise de imagem)", isCorrect: true },
                    { text: "Azure Machine Learning", isCorrect: false },
                    { text: "Custom Vision", isCorrect: false },
                    { text: "Azure AI Language", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma equipe precisa extrair texto manuscrito de formulários digitalizados. Qual recurso do Azure AI Vision atende a isso?",
                difficulty: "facil",
                options: [
                    { text: "Read", isCorrect: true },
                    { text: "Marcações (tags)", isCorrect: false },
                    { text: "Detecção de objetos", isCorrect: false },
                    { text: "Descrição", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um fórum quer sinalizar automaticamente imagens com conteúdo adulto ou impróprio enviadas pelos usuários. Qual recurso do Azure AI Vision ajuda?",
                difficulty: "medio",
                options: [
                    { text: "Detecção de conteúdo", isCorrect: true },
                    { text: "Read", isCorrect: false },
                    { text: "Marcações (tags)", isCorrect: false },
                    { text: "Descrição e legenda", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa sem cientistas de dados e sem imagens rotuladas precisa reconhecer objetos comuns em fotos o mais rápido possível. Qual é a melhor opção?",
                difficulty: "medio",
                options: [
                    { text: "Usar os modelos pré-treinados do Azure AI Vision", isCorrect: true },
                    { text: "Treinar um modelo do zero no Custom Vision", isCorrect: false },
                    { text: "Treinar um modelo no Azure Machine Learning", isCorrect: false },
                    { text: "Não é possível sem treinar antes", isCorrect: false },
                ],
            },
            {
                statement: "O que o recurso Read do Azure AI Vision faz?",
                difficulty: "medio",
                options: [
                    {
                        text: "Lê texto impresso e manuscrito em imagens e documentos",
                        isCorrect: true,
                    },
                    { text: "Gera uma legenda descrevendo a imagem", isCorrect: false },
                    { text: "Detecta rostos e seus atributos", isCorrect: false },
                    {
                        text: "Classifica a imagem inteira com rótulos personalizados",
                        isCorrect: false,
                    },
                ],
            },
        ],
    },
    {
        titulo: "Custom Vision e reconhecimento facial",
        blocks: [
            {
                type: "text",
                value: "## Quando o pré-treinado não basta\n O Custom Vision deixa você treinar um modelo de visão com as suas próprias imagens rotuladas. É a saída quando o modelo genérico do Azure AI Vision não reconhece as classes específicas do seu negócio, como os produtos da sua loja ou os defeitos da sua linha de produção. Você envia as imagens, marca as classes e o serviço treina o modelo.",
            },
            {
                type: "table",
                value: '[["Tipo de projeto","O que resolve"],["Classificação","Aplica seus próprios rótulos à imagem inteira"],["Detecção de objetos","Localiza suas classes com caixas delimitadoras"]]',
            },
            {
                type: "text",
                value: "## O serviço Face\n O Face é especializado em rostos. Ele faz detecção (encontra os rostos e devolve a caixa delimitadora), análise de atributos (como posição da cabeça, uso de óculos, desfoque e oclusão) e reconhecimento facial. O reconhecimento tem duas operações principais: verificação, que compara dois rostos (1 para 1), e identificação, que procura a pessoa dentro de um grupo já cadastrado (1 para muitos).",
            },
            {
                type: "table",
                value: '[["Situação","Serviço indicado"],["Categorias gerais já reconhecidas","Azure AI Vision (pré-treinado)"],["Classes específicas do seu negócio","Custom Vision (treinado por você)"],["Detectar e reconhecer rostos","Face"]]',
            },
            {
                type: "quote",
                value: "Use o Azure AI Vision pré-treinado para categorias gerais; use o Custom Vision quando precisar reconhecer classes específicas com suas próprias imagens.",
            },
            {
                type: "text",
                value: "## Escolhendo o serviço\n Regra prática para a prova: rostos vão para o Face; classes específicas suas vão para o Custom Vision (projeto de classificação ou de detecção de objetos); categorias gerais e leitura de texto vão para o Azure AI Vision pré-treinado. Vale lembrar que os recursos de reconhecimento facial exigem aprovação de acesso limitado por questões de IA responsável.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma fábrica quer reconhecer seus próprios modelos de peça, que não aparecem em nenhum modelo genérico. Qual serviço permite treinar isso com as imagens dela?",
                difficulty: "facil",
                options: [
                    { text: "Custom Vision", isCorrect: true },
                    { text: "Azure AI Vision pré-treinado", isCorrect: false },
                    { text: "Read", isCorrect: false },
                    { text: "Azure AI Language", isCorrect: false },
                ],
            },
            {
                statement:
                    "Você tem fotos rotuladas e quer um modelo que localize defeitos na peça com caixas delimitadoras. Qual tipo de projeto do Custom Vision usar?",
                difficulty: "medio",
                options: [
                    { text: "Detecção de objetos", isCorrect: true },
                    { text: "Classificação", isCorrect: false },
                    { text: "Read (OCR)", isCorrect: false },
                    { text: "Segmentação semântica", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um aplicativo de banco quer confirmar se a selfie do cliente e a foto do documento são da mesma pessoa. Qual serviço é o indicado?",
                difficulty: "facil",
                options: [
                    { text: "Face", isCorrect: true },
                    { text: "Custom Vision", isCorrect: false },
                    { text: "Read", isCorrect: false },
                    { text: "Azure AI Vision tags", isCorrect: false },
                ],
            },
            {
                statement:
                    "Sua empresa precisa reconhecer categorias gerais em fotos (carro, praia, comida) sem treinar nada e sem imagens próprias. Qual é a melhor escolha?",
                difficulty: "medio",
                options: [
                    { text: "Azure AI Vision pré-treinado", isCorrect: true },
                    { text: "Custom Vision de classificação", isCorrect: false },
                    { text: "Custom Vision de detecção de objetos", isCorrect: false },
                    { text: "Treinar um modelo do zero", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma catraca captura o rosto de quem chega e compara com um conjunto de funcionários cadastrados para descobrir quem é a pessoa. Que operação do Face é essa?",
                difficulty: "dificil",
                options: [
                    { text: "Identificação (1 para muitos)", isCorrect: true },
                    { text: "Verificação (1 para 1)", isCorrect: false },
                    { text: "Apenas detecção de rosto", isCorrect: false },
                    { text: "Classificação de imagem", isCorrect: false },
                ],
            },
        ],
    },
];

const MODULO4: Aula[] = [
    {
        titulo: "Cargas de trabalho de PLN",
        blocks: [
            {
                type: "text",
                value: "## O que é processamento de linguagem natural\nProcessamento de linguagem natural (PLN) é a área da IA que faz o computador entender, interpretar e gerar texto e fala em linguagem humana. Na prova, o mais cobrado é ler um cenário e apontar qual tarefa de linguagem resolve o problema. Vamos passar por cada uma.\n\n## Análise de sentimento\nClassifica a opinião expressa em um texto como positiva, negativa, neutra ou mista, junto de uma pontuação de confiança entre 0 e 1. Serve para medir a reação do público em avaliações de produto, comentários de redes sociais e respostas de pesquisa. Se o cenário quer saber se a opinião do cliente é boa ou ruim, é análise de sentimento.\n\n## Extração de frases-chave\nIdentifica os principais pontos e termos de um texto e devolve uma lista de frases-chave, sem julgar a opinião. Serve para descobrir rapidamente do que trata um documento grande sem lê-lo inteiro. Se o cenário pede os assuntos ou tópicos centrais, é extração de frases-chave.\n\n## Reconhecimento de entidades nomeadas\nTambém chamado de NER (Named Entity Recognition), localiza e classifica itens do mundo real citados no texto, como pessoas, locais, organizações, datas, quantidades e valores. Serve para extrair dados de um texto livre, por exemplo puxar nomes e datas de um contrato. Se o cenário quer identificar pessoas, lugares ou datas dentro do texto, é NER.\n\n## Detecção de idioma\nIdentifica em qual idioma um texto foi escrito e devolve o nome do idioma, o código e uma pontuação de confiança. Quando não consegue decidir, retorna (Unknown). Serve para encaminhar cada mensagem ao time certo ou ao tradutor certo. Se o cenário pergunta em que língua está o texto, é detecção de idioma.\n\n## Sumarização\nGera um resumo curto de um texto longo. A sumarização extrativa seleciona as frases mais importantes do original, e a abstrativa escreve frases novas que condensam a ideia. Serve para dar um resumo executivo de documentos, e-mails e transcrições. Se o cenário pede encurtar um texto preservando o essencial, é sumarização.",
            },
            {
                type: "table",
                value: '[["Tarefa","O que faz","Cenário típico"],["Análise de sentimento","Diz se a opinião é positiva, negativa, neutra ou mista","Medir se as avaliações de um produto são boas ou ruins"],["Extração de frases-chave","Lista os principais termos e tópicos do texto","Descobrir os assuntos centrais de documentos longos"],["Reconhecimento de entidades (NER)","Identifica pessoas, locais, datas, organizações e valores","Extrair nomes e datas de um contrato"],["Detecção de idioma","Diz em qual idioma o texto está, com código e confiança","Rotear mensagens de clientes para o time certo"],["Sumarização","Resume um texto longo em poucas frases","Gerar um resumo executivo de um relatório"]]',
            },
            {
                type: "text",
                value: "## Não confunda frases-chave com entidades\nAs duas tarefas puxam pedaços do texto, mas com objetivos diferentes. A extração de frases-chave devolve os tópicos e assuntos gerais, sem dizer o que cada um representa. O NER classifica cada item em um tipo conhecido, como pessoa, local ou data. Se o cenário só quer os temas, é frases-chave. Se quer identificar e rotular pessoas, lugares ou datas, é NER.",
            },
            {
                type: "quote",
                value: "Ligue o verbo do cenário à tarefa: opinião boa ou ruim é análise de sentimento; tópicos principais é extração de frases-chave; pessoas, locais e datas é reconhecimento de entidades; qual idioma é detecção de idioma; encurtar mantendo o essencial é sumarização.",
            },
        ],
        questions: [
            {
                statement:
                    "A equipe de marketing quer saber se os comentários sobre um novo produto nas redes sociais expressam opinião positiva ou negativa. Qual tarefa de PLN atende?",
                difficulty: "facil",
                options: [
                    { text: "Análise de sentimento", isCorrect: true },
                    { text: "Extração de frases-chave", isCorrect: false },
                    { text: "Detecção de idioma", isCorrect: false },
                    { text: "Sumarização", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um sistema recebe mensagens de clientes de vários países e precisa descobrir em qual idioma cada mensagem foi escrita antes de encaminhá-la. Qual tarefa usar?",
                difficulty: "facil",
                options: [
                    { text: "Detecção de idioma", isCorrect: true },
                    { text: "Análise de sentimento", isCorrect: false },
                    { text: "Reconhecimento de entidades nomeadas", isCorrect: false },
                    { text: "Sumarização", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um escritório de advocacia precisa extrair automaticamente nomes de pessoas, datas e locais citados em contratos digitalizados. Qual tarefa de PLN faz isso?",
                difficulty: "medio",
                options: [
                    { text: "Reconhecimento de entidades nomeadas (NER)", isCorrect: true },
                    { text: "Extração de frases-chave", isCorrect: false },
                    { text: "Análise de sentimento", isCorrect: false },
                    { text: "Detecção de idioma", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa quer transformar relatórios de dez páginas em um parágrafo curto que preserve o essencial. Qual tarefa de PLN é indicada?",
                difficulty: "medio",
                options: [
                    { text: "Sumarização", isCorrect: true },
                    { text: "Extração de frases-chave", isCorrect: false },
                    { text: "Reconhecimento de entidades nomeadas", isCorrect: false },
                    { text: "Análise de sentimento", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um analista quer apenas uma lista dos temas gerais discutidos em milhares de avaliações, sem identificar ou rotular pessoas, locais ou datas específicas. Qual tarefa de PLN é a mais adequada?",
                difficulty: "dificil",
                options: [
                    { text: "Extração de frases-chave", isCorrect: true },
                    { text: "Reconhecimento de entidades nomeadas (NER)", isCorrect: false },
                    { text: "Análise de sentimento", isCorrect: false },
                    { text: "Detecção de idioma", isCorrect: false },
                ],
            },
        ],
    },
    {
        titulo: "Fala e tradução",
        blocks: [
            {
                type: "text",
                value: "## Fala e tradução na IA\nDuas famílias de tarefas andam juntas aqui: converter entre fala e texto, e converter conteúdo de um idioma para outro. A prova cobra saber qual tarefa é qual e a diferença entre transcrever e traduzir.\n\n## Conversão de fala em texto\nA fala em texto (speech-to-text) recebe áudio de voz e devolve o texto correspondente, no mesmo idioma. É o que faz a legenda automática, o ditado por voz e a transcrição de reuniões e chamadas. Pode rodar em tempo real, enquanto a pessoa fala, ou em lote, sobre arquivos gravados.\n\n## Conversão de texto em fala\nO texto em fala (text-to-speech) faz o caminho inverso: recebe texto e gera áudio de voz sintetizada. É o que dá voz a assistentes virtuais, leitores de tela e centrais de atendimento. As vozes neurais soam naturais e permitem ajustar entonação e ritmo.\n\n## Tradução de texto e de fala\nTraduzir é converter conteúdo de um idioma de origem para um idioma de destino. A tradução de texto recebe texto em uma língua e devolve texto em outra. A tradução de fala recebe áudio falado em uma língua e devolve o conteúdo em outra, como texto ou como áudio, o que permite conversas entre pessoas de idiomas diferentes.",
            },
            {
                type: "text",
                value: "## Transcrever não é traduzir\nEsse é o ponto que mais confunde na prova. Transcrever é passar fala para texto mantendo o mesmo idioma: um áudio em português vira texto em português. Traduzir é trocar de idioma: um conteúdo em português vira conteúdo em inglês, seja em texto ou em fala. A conversão de fala em texto transcreve, o tradutor traduz. Quando o cenário mistura os dois, como um áudio em espanhol que precisa virar texto em português, existe tradução envolvida, porque o idioma muda.",
            },
            {
                type: "table",
                value: '[["Tarefa","Entrada","Saída","Muda de idioma?"],["Fala em texto (speech-to-text)","Áudio de voz","Texto no mesmo idioma","Não"],["Texto em fala (text-to-speech)","Texto","Áudio de voz","Não"],["Tradução de texto","Texto em um idioma","Texto em outro idioma","Sim"],["Tradução de fala","Áudio em um idioma","Texto ou áudio em outro idioma","Sim"]]',
            },
            {
                type: "quote",
                value: "Transcrição mantém o idioma e só troca a forma, de fala para texto. Tradução troca o idioma. Se o cenário muda a língua, é tradução, não transcrição.",
            },
        ],
        questions: [
            {
                statement:
                    "Um aplicativo de reuniões precisa gerar legendas em tempo real do que os participantes falam, mantendo o mesmo idioma. Qual recurso usar?",
                difficulty: "facil",
                options: [
                    { text: "Conversão de fala em texto", isCorrect: true },
                    { text: "Conversão de texto em fala", isCorrect: false },
                    { text: "Tradução de texto", isCorrect: false },
                    { text: "Tradução de fala", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um assistente virtual precisa ler em voz alta, com voz natural, respostas que estão escritas em texto. Qual recurso é esse?",
                difficulty: "facil",
                options: [
                    { text: "Conversão de texto em fala", isCorrect: true },
                    { text: "Conversão de fala em texto", isCorrect: false },
                    { text: "Tradução de fala", isCorrect: false },
                    { text: "Detecção de idioma", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma loja online quer exibir as descrições de produtos escritas em inglês também em português e espanhol. Qual recurso é indicado?",
                difficulty: "medio",
                options: [
                    { text: "Tradução de texto", isCorrect: true },
                    { text: "Conversão de texto em fala", isCorrect: false },
                    { text: "Conversão de fala em texto", isCorrect: false },
                    { text: "Análise de sentimento", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um áudio de uma entrevista em português precisa virar um documento de texto também em português. Esse caso é de...?",
                difficulty: "medio",
                options: [
                    { text: "Transcrição, feita pela conversão de fala em texto", isCorrect: true },
                    { text: "Tradução de fala", isCorrect: false },
                    { text: "Tradução de texto", isCorrect: false },
                    { text: "Conversão de texto em fala", isCorrect: false },
                ],
            },
            {
                statement:
                    "Durante uma videochamada, uma pessoa fala em japonês e a outra precisa receber o conteúdo em português falado, em tempo real. Qual recurso atende?",
                difficulty: "dificil",
                options: [
                    { text: "Tradução de fala", isCorrect: true },
                    { text: "Conversão de fala em texto", isCorrect: false },
                    { text: "Tradução de texto", isCorrect: false },
                    { text: "Conversão de texto em fala", isCorrect: false },
                ],
            },
        ],
    },
    {
        titulo: "Serviços de linguagem no Azure",
        blocks: [
            {
                type: "text",
                value: "## Os serviços de linguagem do Azure\nAs tarefas de PLN e de fala que vimos são entregues no Azure por três serviços dentro do Azure AI Services. Saber qual serviço faz o quê é o foco desta aula.\n\n## Azure AI Language\nÉ o serviço para tarefas sobre texto. Reúne análise de sentimento, reconhecimento de entidades nomeadas, extração de frases-chave, detecção de idioma, sumarização, detecção de informações pessoais (PII) e resposta a perguntas. Também traz a compreensão de linguagem conversacional (CLU), usada para dar inteligência a bots e assistentes.\n\n## Compreensão de linguagem conversacional (CLU)\nA CLU interpreta o que o usuário diz e descobre o que ele quer. Trabalha com dois conceitos que caem muito na prova. A intenção (intent) é o objetivo por trás da frase, como ligar uma luz ou consultar o saldo. A entidade (entity) é o dado específico citado na frase, como o cômodo cozinha ou a cidade Recife. O texto enviado pelo usuário é o enunciado (utterance). Em 'ligue a luz da cozinha', a intenção é ligar a luz e a entidade é a cozinha.\n\n## Azure AI Speech\nÉ o serviço para tarefas de fala: conversão de fala em texto, conversão de texto em fala, tradução de fala e reconhecimento de locutor. É ele que gera legendas, dá voz a assistentes e transcreve áudio.\n\n## Azure AI Translator\nÉ o serviço dedicado à tradução de texto entre mais de cem idiomas, com tradução automática neural. Serve para traduzir documentos, sites e mensagens de um idioma para outro.",
            },
            {
                type: "table",
                value: '[["Serviço","Para que serve","Exemplos de tarefa"],["Azure AI Language","Entender e analisar texto","Sentimento, entidades, frases-chave, idioma, sumarização, CLU"],["Azure AI Speech","Trabalhar com áudio de voz","Fala em texto, texto em fala, tradução de fala"],["Azure AI Translator","Traduzir texto entre idiomas","Traduzir documentos, sites e mensagens"]]',
            },
            {
                type: "table",
                value: '[["Conceito da CLU","O que é","Exemplo em \'ligue a luz da cozinha\'"],["Enunciado (utterance)","O que o usuário diz ou escreve","ligue a luz da cozinha"],["Intenção (intent)","O objetivo por trás da frase","ligar a luz"],["Entidade (entity)","O dado específico citado na frase","cozinha"]]',
            },
            {
                type: "text",
                value: "## Como escolher o serviço no cenário\nA pergunta chave é sobre o que a solução atua. Se o insumo é texto e o objetivo é extrair sentido dele, como opinião, entidades, tópicos, idioma ou resumo, ou ainda entender comandos de um bot, o serviço é o Azure AI Language. Se entra ou sai áudio de voz, é o Azure AI Speech. Se a meta é apenas passar texto de um idioma para outro, é o Azure AI Translator. Um assistente de voz completo costuma juntar os três: o Speech transcreve a fala, o Language entende a intenção e o Speech responde por voz.",
            },
            {
                type: "quote",
                value: "Texto se analisa no Azure AI Language, áudio de voz se resolve no Azure AI Speech e traduzir texto entre idiomas é o Azure AI Translator. Na CLU, a intenção é o que o usuário quer e a entidade é o detalhe da frase.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma empresa quer analisar o sentimento e extrair as entidades de milhares de avaliações em texto. Qual serviço do Azure usar?",
                difficulty: "facil",
                options: [
                    { text: "Azure AI Language", isCorrect: true },
                    { text: "Azure AI Speech", isCorrect: false },
                    { text: "Azure AI Translator", isCorrect: false },
                    { text: "Azure AI Vision", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um portal de notícias precisa traduzir seus artigos de texto do português para o inglês e o espanhol. Qual serviço é o indicado?",
                difficulty: "facil",
                options: [
                    { text: "Azure AI Translator", isCorrect: true },
                    { text: "Azure AI Language", isCorrect: false },
                    { text: "Azure AI Speech", isCorrect: false },
                    { text: "Azure AI Document Intelligence", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um sistema de atendimento precisa transcrever para texto milhares de ligações telefônicas gravadas. Qual serviço do Azure atende?",
                difficulty: "medio",
                options: [
                    { text: "Azure AI Speech", isCorrect: true },
                    { text: "Azure AI Language", isCorrect: false },
                    { text: "Azure AI Translator", isCorrect: false },
                    { text: "Azure AI Vision", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma equipe vai construir um chatbot que entende comandos como 'quero cancelar meu pedido' e identifica o que o usuário deseja. Qual serviço do Azure oferece a compreensão de linguagem conversacional para isso?",
                difficulty: "medio",
                options: [
                    { text: "Azure AI Language", isCorrect: true },
                    { text: "Azure AI Speech", isCorrect: false },
                    { text: "Azure AI Translator", isCorrect: false },
                    { text: "Azure AI Bot Service", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um assistente doméstico recebe o comando 'aumente a temperatura da sala para 22 graus'. O modelo de linguagem conversacional precisa reconhecer 'aumentar a temperatura', 'sala' e '22 graus'. Respectivamente, esses elementos são classificados como...?",
                difficulty: "dificil",
                options: [
                    { text: "Intenção, entidade e entidade", isCorrect: true },
                    { text: "Intenção, intenção e entidade", isCorrect: false },
                    { text: "Entidade, intenção e enunciado", isCorrect: false },
                    { text: "Enunciado, entidade e intenção", isCorrect: false },
                ],
            },
        ],
    },
];

const MODULO5: Aula[] = [
    {
        titulo: "O que é IA generativa",
        blocks: [
            {
                type: "text",
                value: "## O que caracteriza a IA generativa\n\nA IA generativa é a categoria de inteligência artificial capaz de criar conteúdo novo e original: texto, imagens, código, áudio e vídeo. Em vez de apenas classificar ou prever sobre dados que já existem, ela produz artefatos inéditos a partir de padrões aprendidos em enormes volumes de dados de treinamento.\n\nEssa é a diferença central para as outras cargas de trabalho de IA. A visão computacional analisa imagens, o processamento de linguagem natural clássico extrai sentimento ou entidades de um texto, e a detecção de anomalias sinaliza valores fora do padrão. Todas interpretam algo que já está lá. A carga generativa é a única que gera um resultado novo em resposta a uma instrução em linguagem natural.",
            },
            {
                type: "table",
                value: '[["Carga de trabalho","O que faz","Exemplo"],["Visão computacional","Analisa e interpreta imagens","Detectar objetos numa foto"],["PLN clássico","Extrai informação de um texto","Analisar o sentimento de uma avaliação"],["Detecção de anomalias","Identifica valores fora do padrão","Sinalizar uma transação suspeita"],["IA generativa","Cria conteúdo novo e original","Escrever um email a partir de um pedido"]]',
            },
            {
                type: "text",
                value: "## Modelos de linguagem grandes e transformers\n\nO motor da IA generativa de texto é o modelo de linguagem grande (LLM, de large language model), treinado em quantidades gigantescas de texto para prever qual é o próximo pedaço de conteúdo mais provável. A família GPT (Generative Pre-trained Transformer) é o exemplo mais conhecido.\n\nEsses modelos usam a arquitetura transformer, cuja inovação é o mecanismo de atenção: ao processar cada parte do texto, o modelo pesa a importância das outras partes para entender o contexto e as relações entre as palavras. É isso que permite gerar respostas coerentes e no tema.\n\nAntes de processar, o texto é quebrado em tokens, que são palavras inteiras ou pedaços de palavras. O modelo sempre trabalha com tokens, não com letras soltas.",
            },
            {
                type: "table",
                value: '[["Conceito","O que é"],["Token","Pedaço de texto (palavra ou parte dela) que o modelo processa"],["Embedding","Representação numérica em vetor que captura o significado de um texto"],["Prompt","A instrução ou entrada que você fornece ao modelo"],["Completion","A resposta gerada pelo modelo a partir do prompt"],["Copilot","Assistente de IA integrado a um aplicativo para ajudar o usuário"]]',
            },
            {
                type: "text",
                value: "## Embeddings, prompts e copilots\n\nOs embeddings traduzem texto em vetores de números que capturam o significado. Palavras ou frases com sentido parecido ficam próximas nesse espaço vetorial, o que torna os embeddings a base de buscas semânticas e de comparações por similaridade.\n\nA conversa com o modelo acontece por prompt e completion: você envia um prompt (a instrução) e recebe uma completion (o texto gerado). Escrever bons prompts é o que mais influencia a qualidade da resposta.\n\nQuando esses modelos são embutidos em um aplicativo para atuar como assistente, temos um copilot. O Microsoft Copilot e o GitHub Copilot são exemplos: eles não substituem a pessoa, e sim ajudam a redigir, resumir e programar mais rápido.",
            },
            {
                type: "quote",
                value: "A IA generativa é a única carga de trabalho que cria conteúdo novo e original em resposta a um prompt em linguagem natural, em vez de apenas analisar dados que já existem.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma equipe de marketing quer um sistema que escreva descrições de produtos originais a partir de algumas palavras-chave. Qual carga de trabalho de IA atende a esse pedido?",
                difficulty: "facil",
                options: [
                    { text: "IA generativa", isCorrect: true },
                    { text: "Detecção de anomalias", isCorrect: false },
                    { text: "Visão computacional", isCorrect: false },
                    { text: "Análise de sentimento", isCorrect: false },
                ],
            },
            {
                statement: "No contexto de um modelo de linguagem, o que é um token?",
                difficulty: "facil",
                options: [
                    {
                        text: "Um pedaço de texto, como uma palavra ou parte dela, que o modelo processa",
                        isCorrect: true,
                    },
                    {
                        text: "Uma chave de segurança usada para autenticar chamadas à API",
                        isCorrect: false,
                    },
                    { text: "O vetor numérico final gerado pelo modelo", isCorrect: false },
                    { text: "Um pixel de uma imagem gerada", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um desenvolvedor precisa medir o quanto dois textos são parecidos em significado para montar uma busca semântica. Qual recurso da IA generativa é a base dessa comparação?",
                difficulty: "medio",
                options: [
                    { text: "Embeddings", isCorrect: true },
                    { text: "Tokens", isCorrect: false },
                    { text: "Filtros de conteúdo", isCorrect: false },
                    { text: "Mensagens de sistema", isCorrect: false },
                ],
            },
            {
                statement:
                    "Você digita uma instrução em um modelo de linguagem e recebe um texto de volta. Como se chamam, respectivamente, a instrução enviada e o texto recebido?",
                difficulty: "medio",
                options: [
                    { text: "Prompt e completion", isCorrect: true },
                    { text: "Token e embedding", isCorrect: false },
                    { text: "Completion e prompt", isCorrect: false },
                    { text: "Encoder e decoder", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa integra um assistente de IA ao seu editor de textos para sugerir redações e resumir documentos enquanto o funcionário trabalha. Como esse tipo de assistente embutido no aplicativo é chamado?",
                difficulty: "medio",
                options: [
                    { text: "Copilot", isCorrect: true },
                    { text: "Embedding", isCorrect: false },
                    { text: "Anomalia", isCorrect: false },
                    { text: "Encoder", isCorrect: false },
                ],
            },
        ],
    },
    {
        titulo: "IA generativa no Azure",
        blocks: [
            {
                type: "text",
                value: "## Onde a IA generativa vive no Azure\n\nPara usar IA generativa no Azure de forma corporativa, o serviço central é o Azure OpenAI Service. Ele dá acesso, por API, aos modelos da OpenAI (as famílias GPT, de embeddings e o DALL-E) rodando dentro da nuvem da Microsoft, com a segurança, a governança e a conformidade regional que uma empresa precisa.\n\nA capacidade é a mesma dos modelos da OpenAI, mas com o controle de acesso do Azure, disponibilidade por região e filtros de conteúdo integrados.",
            },
            {
                type: "table",
                value: '[["Família de modelo","Para que serve","Exemplo de uso"],["GPT","Gera e entende texto e conversa","Chat, resumo e geração de código"],["Embeddings","Transforma texto em vetores de significado","Busca semântica e comparação por similaridade"],["DALL-E","Gera imagens a partir de texto","Criar uma ilustração a partir de uma descrição"]]',
            },
            {
                type: "text",
                value: "## Azure AI Foundry, a plataforma de construção\n\nO Azure AI Foundry é a plataforma unificada para construir, testar e implantar soluções de IA generativa e copilots. Ele reúne em um só lugar o catálogo de modelos (com modelos da OpenAI e também de parceiros como Meta e Hugging Face), um playground para experimentar prompts, ferramentas de avaliação e o fluxo de implantação.\n\nUma forma simples de separar os dois: o Azure OpenAI Service fornece os modelos, enquanto o Azure AI Foundry é o ambiente onde você escolhe, ajusta, avalia e publica a solução que usa esses modelos. O Foundry era conhecido antes como Azure AI Studio.",
            },
            {
                type: "table",
                value: '[["Caso de uso","Como a IA generativa ajuda"],["Assistente ou copilot","Responde perguntas e apoia tarefas dentro de um aplicativo"],["Resumo","Condensa documentos ou reuniões longas em pontos principais"],["Geração de conteúdo","Cria rascunhos de texto, imagens ou código"],["Busca semântica","Encontra informação por significado usando embeddings"]]',
            },
            {
                type: "quote",
                value: "O Azure OpenAI Service fornece os modelos generativos (GPT, embeddings e DALL-E); o Azure AI Foundry é a plataforma para construir, avaliar e implantar a solução.",
            },
        ],
        questions: [
            {
                statement:
                    "Uma empresa quer usar os modelos GPT da OpenAI, mas precisa de controle de acesso corporativo, conformidade e disponibilidade por região do Azure. Qual serviço ela deve usar?",
                difficulty: "facil",
                options: [
                    { text: "Azure OpenAI Service", isCorrect: true },
                    { text: "Azure Machine Learning designer", isCorrect: false },
                    { text: "Azure AI Search", isCorrect: false },
                    { text: "Azure Bot Service", isCorrect: false },
                ],
            },
            {
                statement:
                    "Qual família de modelos do Azure OpenAI é usada para gerar imagens a partir de uma descrição em texto?",
                difficulty: "facil",
                options: [
                    { text: "DALL-E", isCorrect: true },
                    { text: "GPT", isCorrect: false },
                    { text: "Embeddings", isCorrect: false },
                    { text: "Detecção de anomalias", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um time precisa transformar milhares de documentos em vetores numéricos para montar uma busca por significado. Qual família de modelos do Azure OpenAI atende a isso?",
                difficulty: "medio",
                options: [
                    { text: "Modelos de embeddings", isCorrect: true },
                    { text: "Modelos GPT", isCorrect: false },
                    { text: "Modelos DALL-E", isCorrect: false },
                    { text: "Modelos de detecção de anomalias", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma equipe quer um ambiente único para navegar por um catálogo de modelos, testar prompts em um playground e implantar um copilot. Qual plataforma do Azure oferece isso?",
                difficulty: "medio",
                options: [
                    { text: "Azure AI Foundry", isCorrect: true },
                    { text: "Azure OpenAI Service usado sozinho", isCorrect: false },
                    { text: "Azure Blob Storage", isCorrect: false },
                    { text: "Power BI", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um gerente pede um recurso que resuma automaticamente relatórios longos em poucos pontos principais. Esse é um caso de uso típico de qual tecnologia?",
                difficulty: "medio",
                options: [
                    { text: "IA generativa com modelos GPT", isCorrect: true },
                    { text: "Detecção de anomalias", isCorrect: false },
                    { text: "Reconhecimento óptico de caracteres (OCR)", isCorrect: false },
                    {
                        text: "Modelos de embeddings para escrever o texto do resumo",
                        isCorrect: false,
                    },
                ],
            },
        ],
    },
    {
        titulo: "IA generativa responsável",
        blocks: [
            {
                type: "text",
                value: "## Os riscos próprios da IA generativa\n\nPor criar conteúdo novo, a IA generativa traz riscos que as outras cargas não têm na mesma intensidade. O mais citado é a alucinação: o modelo produz uma resposta que parece correta e confiante, mas é falsa ou inventada. Como o texto soa convincente, o erro pode passar despercebido.\n\nOutros dois riscos importantes são o viés, quando o modelo reproduz preconceitos presentes nos dados de treinamento, e a geração de conteúdo nocivo, como material ofensivo, violento ou de ódio. Tratar esses riscos é o objetivo da IA generativa responsável.",
            },
            {
                type: "text",
                value: "## Prompt, grounding e RAG\n\nTrês técnicas ajudam a obter respostas melhores e mais confiáveis. A engenharia de prompt é a prática de escrever instruções claras, dar exemplos e usar uma mensagem de sistema para orientar o comportamento do modelo.\n\nO grounding consiste em fornecer ao modelo um contexto factual e relevante junto com o prompt, para que a resposta se baseie nesses dados e não apenas no que ele memorizou no treinamento. Isso reduz muito as alucinações.\n\nA forma mais comum de fazer grounding é o RAG (Retrieval Augmented Generation, ou geração aumentada por recuperação): antes de responder, o sistema busca documentos relevantes em uma fonte confiável, como um índice do Azure AI Search, e injeta esse conteúdo no prompt. Assim o modelo responde com base nos seus dados.",
            },
            {
                type: "table",
                value: '[["Risco","Mitigação principal"],["Alucinação (informação incorreta)","Grounding e RAG com dados confiáveis"],["Conteúdo nocivo","Filtros de conteúdo do Azure OpenAI"],["Viés nos resultados","Curadoria de dados e avaliação pela imparcialidade"],["Uso indevido","Supervisão humana e governança"]]',
            },
            {
                type: "text",
                value: "## Filtros de conteúdo e os seis princípios\n\nO Azure OpenAI inclui filtros de conteúdo integrados que detectam e bloqueiam material nocivo em categorias como ódio, sexual, violência e automutilação, com níveis de severidade configuráveis. Eles agem tanto no prompt de entrada quanto na resposta gerada.\n\nOs seis princípios de IA responsável da Microsoft continuam valendo para a IA generativa, cada um com um foco específico nesse cenário.",
            },
            {
                type: "table",
                value: '[["Princípio","Aplicação na IA generativa"],["Imparcialidade","Reduzir viés para não favorecer nem prejudicar grupos"],["Confiabilidade e segurança","Usar filtros de conteúdo e testar contra alucinações"],["Privacidade e segurança","Proteger os dados enviados no prompt e no grounding"],["Inclusão","Garantir que a solução atenda pessoas com necessidades diversas"],["Transparência","Deixar claro que o usuário fala com uma IA e citar as fontes"],["Responsabilidade","Manter supervisão humana e governança sobre o sistema"]]',
            },
            {
                type: "quote",
                value: "Grounding e RAG combatem a alucinação ao dar ao modelo dados confiáveis como contexto, enquanto os filtros de conteúdo do Azure OpenAI bloqueiam conteúdo nocivo na entrada e na saída.",
            },
        ],
        questions: [
            {
                statement:
                    "Um chatbot generativo respondeu a um cliente com um dado de produto que parecia correto, mas era totalmente inventado. Como esse tipo de erro é chamado?",
                difficulty: "facil",
                options: [
                    { text: "Alucinação", isCorrect: true },
                    { text: "Anomalia", isCorrect: false },
                    { text: "Sobreajuste de imagem", isCorrect: false },
                    { text: "Filtro de conteúdo", isCorrect: false },
                ],
            },
            {
                statement:
                    "Uma empresa quer que o assistente responda perguntas com base nos manuais internos dela, e não apenas no conhecimento geral do modelo. Qual abordagem atende melhor a isso?",
                difficulty: "medio",
                options: [
                    {
                        text: "RAG, buscando os manuais e injetando o conteúdo no prompt",
                        isCorrect: true,
                    },
                    { text: "Aumentar o número de tokens da resposta", isCorrect: false },
                    { text: "Desativar os filtros de conteúdo", isCorrect: false },
                    {
                        text: "Trocar o modelo GPT por um modelo apenas de embeddings",
                        isCorrect: false,
                    },
                ],
            },
            {
                statement:
                    "Que recurso do Azure OpenAI detecta e bloqueia material de ódio, sexual, violento ou de automutilação tanto no prompt quanto na resposta?",
                difficulty: "medio",
                options: [
                    { text: "Os filtros de conteúdo", isCorrect: true },
                    { text: "Os embeddings", isCorrect: false },
                    { text: "O playground do Azure AI Foundry", isCorrect: false },
                    { text: "A tokenização", isCorrect: false },
                ],
            },
            {
                statement:
                    "Ao avaliar um modelo, uma empresa percebe que ele reproduz preconceitos dos dados de treinamento e trata grupos de forma desigual. Qual princípio de IA responsável orienta a correção desse problema?",
                difficulty: "medio",
                options: [
                    { text: "Imparcialidade", isCorrect: true },
                    { text: "Transparência", isCorrect: false },
                    { text: "Inclusão", isCorrect: false },
                    { text: "Responsabilidade", isCorrect: false },
                ],
            },
            {
                statement:
                    "Um desenvolvedor melhora as respostas do modelo escrevendo instruções mais claras, dando exemplos e definindo uma mensagem de sistema. Como se chama essa prática?",
                difficulty: "medio",
                options: [
                    { text: "Engenharia de prompt", isCorrect: true },
                    { text: "Detecção de anomalias", isCorrect: false },
                    { text: "Filtragem de conteúdo", isCorrect: false },
                    { text: "Tokenização", isCorrect: false },
                ],
            },
        ],
    },
];

const MODULOS: Modulo[] = [
    {
        titulo: "Módulo 1 - Introdução à IA e IA responsável",
        aulas: [
            {
                titulo: "O que é IA e as cargas de trabalho de IA",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é inteligência artificial\nInteligência artificial é software que imita capacidades associadas à inteligência humana, como aprender com dados, reconhecer padrões, entender linguagem, interpretar imagens e tomar decisões. Em vez de seguir apenas regras escritas à mão, um sistema de IA aprende a partir de exemplos e melhora conforme recebe mais dados.\n\nNo AI-900, a IA é organizada em cargas de trabalho (workloads): grupos de capacidades que resolvem um tipo de problema. Identificar qual carga resolve um cenário é uma das coisas que mais caem na prova.\n\n## Machine learning é a base de tudo\nMachine learning (aprendizado de máquina) treina um modelo a partir de dados históricos para fazer previsões sobre dados novos. Quase toda carga de IA moderna usa machine learning por baixo. Exemplo: prever o preço de um imóvel a partir de área, bairro e número de quartos, ou estimar a demanda de vendas do próximo mês. No Azure, o serviço é o Azure Machine Learning.",
                    },
                    {
                        type: "text",
                        value: "## As demais cargas de trabalho\n**Visão computacional** interpreta imagens e vídeos: classifica fotos, detecta e localiza objetos, lê texto impresso com OCR e reconhece rostos. Serviço: Azure AI Vision. Exemplo: uma câmera que lê placas de veículos na entrada de um estacionamento.\n\n**Processamento de linguagem natural (PLN)** entende e gera linguagem escrita e falada: análise de sentimento, extração de frases-chave, tradução, transcrição de fala e chatbots. Serviços: Azure AI Language e Azure AI Speech. Exemplo: classificar avaliações de clientes como positivas ou negativas.\n\n**Document intelligence** extrai dados de formulários e documentos, devolvendo campos estruturados como valores, datas e totais a partir de faturas, recibos e identidades. Serviço: Azure AI Document Intelligence. Exemplo: ler automaticamente o valor e o vencimento de milhares de notas fiscais.\n\n**Knowledge mining (mineração de conhecimento)** varre grandes volumes de conteúdo e cria um índice pesquisável, conectando informação espalhada em documentos, PDFs e imagens. Serviço: Azure AI Search. Exemplo: um buscador interno que localiza cláusulas em milhares de contratos.\n\n**IA generativa** cria conteúdo novo, como texto, imagem, código ou resumo, a partir de um prompt, usando modelos de linguagem de grande porte. Serviço: Azure OpenAI Service. Exemplo: um assistente que redige e-mails ou gera imagens a partir de uma descrição.",
                    },
                    {
                        type: "table",
                        value: '[["Carga de trabalho","O que faz","Exemplo de uso","Serviço Azure"],["Machine learning","Treina modelos que preveem valores ou categorias","Prever o preço de um imóvel","Azure Machine Learning"],["Visão computacional","Interpreta imagens e vídeos","Ler placas com OCR","Azure AI Vision"],["Processamento de linguagem natural","Entende e gera fala e texto","Análise de sentimento de avaliações","Azure AI Language e Azure AI Speech"],["Document intelligence","Extrai campos de formulários e documentos","Ler dados de notas fiscais","Azure AI Document Intelligence"],["Knowledge mining","Cria índice pesquisável de muitos documentos","Busca interna em contratos","Azure AI Search"],["IA generativa","Cria conteúdo novo a partir de um prompt","Redigir texto ou gerar imagem","Azure OpenAI Service"]]',
                    },
                    {
                        type: "code",
                        value: '{\n  "fornecedor": "Café Bom Ltda",\n  "numeroNota": "1042",\n  "valorTotal": 289.90,\n  "vencimento": "2026-08-15"\n}',
                    },
                    {
                        type: "quote",
                        value: "Prever números ou categorias é machine learning; interpretar imagens é visão computacional; entender fala e texto é PLN; extrair campos de documentos é document intelligence; indexar muitos documentos para busca é knowledge mining; e criar conteúdo novo é IA generativa.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma loja quer prever o total de vendas do próximo mês com base no histórico de vendas dos últimos anos. Qual carga de trabalho de IA é a mais adequada?",
                        difficulty: "facil",
                        options: [
                            { text: "Machine learning", isCorrect: true },
                            { text: "Visão computacional", isCorrect: false },
                            { text: "Knowledge mining", isCorrect: false },
                            { text: "Document intelligence", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma rede de estacionamentos quer usar câmeras para ler automaticamente as placas dos veículos na entrada. Qual carga de trabalho resolve isso?",
                        difficulty: "facil",
                        options: [
                            { text: "Visão computacional", isCorrect: true },
                            { text: "Processamento de linguagem natural", isCorrect: false },
                            { text: "Machine learning de previsão de vendas", isCorrect: false },
                            { text: "IA generativa", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um SAC precisa classificar automaticamente os comentários dos clientes como positivos, negativos ou neutros. Qual carga de trabalho e serviço atendem esse caso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Processamento de linguagem natural com Azure AI Language",
                                isCorrect: true,
                            },
                            { text: "Visão computacional com Azure AI Vision", isCorrect: false },
                            {
                                text: "Document intelligence com Azure AI Document Intelligence",
                                isCorrect: false,
                            },
                            { text: "Knowledge mining com Azure AI Search", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O setor financeiro recebe milhares de faturas em PDF e quer extrair de cada uma o fornecedor, o valor e o vencimento, sem digitação manual. Qual serviço do Azure é indicado?",
                        difficulty: "medio",
                        options: [
                            { text: "Azure AI Document Intelligence", isCorrect: true },
                            { text: "Azure AI Search", isCorrect: false },
                            { text: "Azure Machine Learning", isCorrect: false },
                            { text: "Azure AI Vision", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um banco planeja duas soluções: a solução A é um assistente que redige respostas novas para clientes a partir de instruções em texto, e a solução B é um buscador que indexa todo o acervo de manuais internos para consulta. Qual carga de trabalho corresponde à solução A?",
                        difficulty: "dificil",
                        options: [
                            { text: "IA generativa", isCorrect: true },
                            { text: "Knowledge mining", isCorrect: false },
                            { text: "Document intelligence", isCorrect: false },
                            { text: "Visão computacional", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Os princípios de IA responsável da Microsoft",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é IA responsável\nA Microsoft definiu seis princípios para guiar o desenvolvimento e o uso de IA de forma ética e confiável. Na prova, o formato mais comum é receber um cenário e apontar qual princípio ele representa, então vale decorar os seis e o foco de cada um.\n\n## Imparcialidade (fairness)\nSistemas de IA devem tratar todas as pessoas de forma justa, sem favorecer nem prejudicar grupos por gênero, etnia, idade ou outra característica. O risco a evitar é o viés (bias) nos dados ou no modelo. Exemplo: um modelo que aprova crédito não pode negar mais pedidos de um grupo apenas por causa do gênero.\n\n## Confiabilidade e segurança (reliability e safety)\nSistemas de IA devem funcionar de forma confiável, consistente e segura, inclusive diante de situações inesperadas. Isso exige testes rigorosos e monitoramento contínuo. Exemplo: o piloto automático de um carro precisa reagir com segurança a uma condição de estrada que nunca viu no treino.\n\n## Privacidade e segurança (privacy e security)\nSistemas de IA devem proteger os dados das pessoas e respeitar a privacidade, garantindo que as informações sejam usadas de forma segura e apenas para o fim previsto. Exemplo: anonimizar dados de pacientes usados para treinar um modelo e controlar quem pode acessá-los.",
                    },
                    {
                        type: "text",
                        value: "## Inclusão (inclusiveness)\nSistemas de IA devem empoderar todas as pessoas e alcançar quem tem alguma deficiência ou faz parte de grupos frequentemente deixados de fora. Exemplo: oferecer legendas automáticas, leitor de tela e controle por voz para que pessoas com deficiência consigam usar o produto.\n\n## Transparência (transparency)\nSistemas de IA devem ser compreensíveis: as pessoas precisam entender como o sistema funciona, para que ele serve e quais são suas limitações. Exemplo: informar ao usuário quais dados o modelo usa para decidir e avisar em que situações ele pode errar.\n\n## Responsabilidade (accountability)\nPessoas e organizações devem se responsabilizar pelos sistemas de IA que criam e operam, com governança e supervisão humana. A IA não assume a culpa sozinha: quem responde são as pessoas. Exemplo: a empresa designa uma equipe responsável por auditar o modelo e responder oficialmente por seus resultados.",
                    },
                    {
                        type: "table",
                        value: '[["Princípio","Foco central","Exemplo prático"],["Imparcialidade (fairness)","Tratar todos de forma justa, sem viés","Crédito não pode discriminar por gênero"],["Confiabilidade e segurança (reliability e safety)","Funcionar de forma segura e consistente","Carro autônomo reage bem a uma situação nova"],["Privacidade e segurança (privacy e security)","Proteger dados e a privacidade","Anonimizar dados de pacientes no treino"],["Inclusão (inclusiveness)","Alcançar e empoderar todas as pessoas","Legendas e leitor de tela para acessibilidade"],["Transparência (transparency)","Ser compreensível e explicar limitações","Informar como o modelo toma decisões"],["Responsabilidade (accountability)","Pessoas respondem pelo sistema","Equipe de governança audita o modelo"]]',
                    },
                    {
                        type: "text",
                        value: "## Como não confundir na prova\nAlguns princípios se parecem. Transparência é sobre entender como o sistema funciona; responsabilidade é sobre quem responde por ele. Imparcialidade é não discriminar grupos por causa de viés; inclusão é garantir que todos, inclusive pessoas com deficiência, consigam usar o sistema. Se o cenário fala em comportamento seguro mesmo em situações raras, é confiabilidade e segurança; se fala em proteger dados pessoais, é privacidade e segurança.",
                    },
                    {
                        type: "quote",
                        value: "Transparência é entender como a IA funciona; responsabilidade é ter pessoas que respondem por ela. Imparcialidade combate o viés contra grupos; inclusão garante que todos, inclusive pessoas com deficiência, consigam usar o sistema.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um modelo de aprovação de empréstimos passou a recusar mais pedidos de mulheres por causa de um viés presente nos dados de treino. Qual princípio de IA responsável foi violado?",
                        difficulty: "facil",
                        options: [
                            { text: "Imparcialidade", isCorrect: true },
                            { text: "Transparência", isCorrect: false },
                            { text: "Confiabilidade e segurança", isCorrect: false },
                            { text: "Inclusão", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe adiciona legendas automáticas e navegação por voz para que pessoas com deficiência consigam usar o aplicativo. Qual princípio isso representa?",
                        difficulty: "facil",
                        options: [
                            { text: "Inclusão", isCorrect: true },
                            { text: "Privacidade e segurança", isCorrect: false },
                            { text: "Responsabilidade", isCorrect: false },
                            { text: "Imparcialidade", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Antes de treinar um modelo, um hospital anonimiza os dados dos pacientes e restringe quem pode acessá-los. Qual princípio está sendo aplicado?",
                        difficulty: "medio",
                        options: [
                            { text: "Privacidade e segurança", isCorrect: true },
                            { text: "Transparência", isCorrect: false },
                            { text: "Inclusão", isCorrect: false },
                            { text: "Confiabilidade e segurança", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O fabricante de um carro autônomo executa milhares de testes para garantir que o veículo reaja com segurança a situações de trânsito imprevistas. Qual princípio orienta essa preocupação?",
                        difficulty: "medio",
                        options: [
                            { text: "Confiabilidade e segurança", isCorrect: true },
                            { text: "Privacidade e segurança", isCorrect: false },
                            { text: "Imparcialidade", isCorrect: false },
                            { text: "Transparência", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma empresa publica um documento explicando quais dados o modelo usa, como ele chega às decisões e em que situações pode errar, para que os usuários entendam seu funcionamento. Qual princípio isso representa?",
                        difficulty: "dificil",
                        options: [
                            { text: "Transparência", isCorrect: true },
                            { text: "Responsabilidade", isCorrect: false },
                            { text: "Inclusão", isCorrect: false },
                            { text: "Confiabilidade e segurança", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Fundamentos de machine learning",
        aulas: [
            {
                titulo: "Tipos de machine learning",
                blocks: [
                    {
                        type: "text",
                        value: "## Aprender a partir de dados\nMachine learning treina um modelo para achar padrões em dados históricos e usar esses padrões para prever resultados sobre dados novos. Em vez de você escrever a regra na mão, os dados ensinam a regra ao modelo.\n\nCada exemplo dos dados tem características, as features, que são as colunas de entrada, e muitas vezes um rótulo, o label, que é a resposta que você quer prever. Para estimar o preço de um imóvel, as features podem ser área, número de quartos e bairro; o label é o preço. O modelo aprende como as features se relacionam com o label e passa a prever o label de imóveis que ainda não viu.",
                    },
                    {
                        type: "text",
                        value: "## Supervisionado e não supervisionado\nA grande divisão do machine learning é se os dados de treino têm ou não o label conhecido.\n\nNo aprendizado supervisionado os exemplos já vêm rotulados. O modelo estuda pares de features e label e aprende a prever o label. Ele se divide em dois casos: regressão, quando o label é um número, e classificação, quando o label é uma categoria.\n\nNo aprendizado não supervisionado não existe label. O modelo recebe só as features e precisa achar estrutura sozinho. O caso mais comum é o clustering, ou agrupamento, que junta exemplos parecidos em grupos sem que ninguém diga de antemão quais são esses grupos.",
                    },
                    {
                        type: "text",
                        value: "## Binária ou multiclasse\nA classificação prevê a qual categoria um exemplo pertence. Quando existem só duas categorias possíveis, é classificação binária: spam ou não spam, aprovado ou reprovado, fraude ou não fraude. Quando existem três ou mais categorias, é classificação multiclasse: prever a espécie de uma flor entre várias, ou o gênero de um filme. A lógica é a mesma; muda só a quantidade de classes na saída.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo","Aprendizado","Prevê","Exemplo"],["Regressão","Supervisionado","Um valor numérico contínuo","Preço de um imóvel"],["Classificação binária","Supervisionado","Uma entre duas categorias","E-mail é spam ou não"],["Classificação multiclasse","Supervisionado","Uma entre três ou mais categorias","Espécie de uma flor"],["Clustering (agrupamento)","Não supervisionado","Grupos de itens parecidos, sem rótulo","Segmentar clientes por comportamento"]]',
                    },
                    {
                        type: "text",
                        value: "## Como escolher o tipo\nDeixe a pergunta guiar. Você quer prever um número, como valor, temperatura ou quantidade? É regressão. Quer prever uma categoria e tem exemplos já rotulados para treinar? É classificação, binária para duas classes e multiclasse para três ou mais. Não tem rótulo nenhum e quer descobrir agrupamentos naturais nos dados? É clustering. A primeira pergunta a fazer é sobre o label: com label é supervisionado, sem label é não supervisionado.",
                    },
                    {
                        type: "quote",
                        value: "Regressão prevê um valor numérico; classificação prevê uma categoria (binária para duas classes, multiclasse para três ou mais); clustering agrupa dados que não têm rótulo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma imobiliária quer estimar o valor de venda de apartamentos a partir da área, do número de quartos e do bairro. Qual tipo de machine learning resolve esse problema?",
                        difficulty: "facil",
                        options: [
                            { text: "Regressão", isCorrect: true },
                            { text: "Classificação binária", isCorrect: false },
                            { text: "Classificação multiclasse", isCorrect: false },
                            { text: "Clustering", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um serviço de e-mail precisa marcar cada mensagem que chega como spam ou não spam, usando exemplos já rotulados. Que tipo de problema é esse?",
                        difficulty: "facil",
                        options: [
                            { text: "Classificação binária", isCorrect: true },
                            { text: "Classificação multiclasse", isCorrect: false },
                            { text: "Regressão", isCorrect: false },
                            { text: "Clustering", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe de marketing tem dados de compra de milhares de clientes, mas nenhum rótulo, e quer descobrir grupos de clientes com comportamento parecido. Qual abordagem usar?",
                        difficulty: "medio",
                        options: [
                            { text: "Clustering", isCorrect: true },
                            { text: "Classificação binária", isCorrect: false },
                            { text: "Classificação multiclasse", isCorrect: false },
                            { text: "Regressão", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Numa tabela usada para prever a nota final de alunos, cada linha tem horas de estudo, frequência e a nota final já registrada. Nesse conjunto de treino, a coluna nota final é o que?",
                        difficulty: "medio",
                        options: [
                            { text: "O label, o rótulo que se quer prever", isCorrect: true },
                            { text: "Uma feature de entrada", isCorrect: false },
                            { text: "Um cluster", isCorrect: false },
                            { text: "Um hiperparâmetro do modelo", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo de identificação de plantas recebe uma foto e precisa dizer a qual das doze espécies do catálogo ela pertence. Que tipo de tarefa de machine learning é essa?",
                        difficulty: "medio",
                        options: [
                            { text: "Classificação multiclasse", isCorrect: true },
                            { text: "Classificação binária", isCorrect: false },
                            { text: "Regressão", isCorrect: false },
                            { text: "Clustering", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Treinar e avaliar um modelo",
                blocks: [
                    {
                        type: "text",
                        value: "## Dividir os dados em treino e teste\nTreinar um modelo e avaliá-lo nos mesmos dados engana: ele já viu as respostas e parece perfeito. Por isso os dados são separados em pelo menos dois conjuntos. O conjunto de treino é usado para o modelo aprender. O conjunto de validação ou teste fica reservado e serve para medir o desempenho em exemplos que o modelo nunca viu.\n\nUma divisão comum guarda a maior parte para treino, por volta de 70% a 80%, e o restante para teste. O que importa é o desempenho no teste, porque ele estima como o modelo vai se sair no mundo real, diante de dados novos.",
                    },
                    {
                        type: "text",
                        value: "## Overfitting e underfitting\nDois problemas atrapalham essa generalização.\n\nO overfitting, ou sobreajuste, é quando o modelo decora o treino em vez de aprender o padrão geral. O sinal clássico é ir muito bem no treino e mal no teste. Ele memorizou até o ruído dos dados e não sabe lidar com exemplos novos.\n\nO underfitting, ou subajuste, é o oposto: o modelo é simples demais para o problema e vai mal até no treino. Não captou o padrão nem nos dados que estudou.\n\nO alvo fica no meio: um modelo que vai bem no treino e continua bem no teste.",
                    },
                    {
                        type: "table",
                        value: '[["Métrica","Usada em","O que mede"],["Acurácia","Classificação","A fração total de previsões corretas"],["Precisão","Classificação","Dos exemplos previstos como positivos, quantos eram mesmo positivos"],["Recall (revocação)","Classificação","Dos positivos reais, quantos o modelo conseguiu encontrar"],["R² (coeficiente de determinação)","Regressão","Quanto da variação dos dados o modelo consegue explicar"],["Erro (MAE, RMSE)","Regressão","O tamanho médio da diferença entre o previsto e o real"]]',
                    },
                    {
                        type: "text",
                        value: "## A matriz de confusão\nNuma classificação, a matriz de confusão organiza os acertos e os erros comparando o valor real com o valor previsto. Ela tem quatro caselas. Verdadeiro positivo (VP) e verdadeiro negativo (VN) são os acertos. Falso positivo (FP) é quando o modelo previu positivo mas era negativo, o alarme falso. Falso negativo (FN) é quando previu negativo mas era positivo, o caso que passou batido.\n\nDessas quatro caselas saem as métricas. A acurácia é a soma dos acertos sobre o total. A precisão olha os falsos positivos: VP dividido por VP mais FP. O recall olha os falsos negativos: VP dividido por VP mais FN. Por isso precisão e recall contam uma história que a acurácia sozinha esconde, principalmente quando uma classe é bem mais rara que a outra.",
                    },
                    {
                        type: "table",
                        value: '[["","Previsto positivo","Previsto negativo"],["Real positivo","Verdadeiro positivo (VP)","Falso negativo (FN)"],["Real negativo","Falso positivo (FP)","Verdadeiro negativo (VN)"]]',
                    },
                    {
                        type: "quote",
                        value: "Overfitting vai bem no treino e mal em dados novos; underfitting vai mal até no treino. Precisão penaliza os falsos positivos; recall penaliza os falsos negativos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um modelo acerta 98% no conjunto de treino, mas só 62% no conjunto de teste. Como se chama esse problema?",
                        difficulty: "facil",
                        options: [
                            { text: "Overfitting (sobreajuste)", isCorrect: true },
                            { text: "Underfitting (subajuste)", isCorrect: false },
                            { text: "Generalização equilibrada", isCorrect: false },
                            { text: "Divisão de treino e teste", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Por que reservar um conjunto de teste em vez de avaliar o modelo nos próprios dados de treino?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Para medir o desempenho em dados que o modelo não viu no treino",
                                isCorrect: true,
                            },
                            { text: "Para o treino terminar mais rápido", isCorrect: false },
                            { text: "Para aumentar o número de features", isCorrect: false },
                            { text: "Para rotular os dados automaticamente", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Você treinou um modelo para prever o consumo mensal de energia de uma casa, que é um valor numérico. Qual métrica é adequada para avaliar esse modelo?",
                        difficulty: "medio",
                        options: [
                            { text: "R²", isCorrect: true },
                            { text: "Recall", isCorrect: false },
                            { text: "Precisão", isCorrect: false },
                            { text: "Acurácia", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um modelo de triagem médica não pode deixar passar quem realmente está doente, ou seja, precisa minimizar os falsos negativos. Qual métrica deve ser priorizada?",
                        difficulty: "medio",
                        options: [
                            { text: "Recall (revocação)", isCorrect: true },
                            { text: "Precisão", isCorrect: false },
                            { text: "R²", isCorrect: false },
                            { text: "Erro médio absoluto", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Num detector de fraude, uma transação legítima foi classificada como fraude. Na matriz de confusão, esse resultado é um:",
                        difficulty: "medio",
                        options: [
                            { text: "Falso positivo", isCorrect: true },
                            { text: "Falso negativo", isCorrect: false },
                            { text: "Verdadeiro positivo", isCorrect: false },
                            { text: "Verdadeiro negativo", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Machine learning no Azure",
                blocks: [
                    {
                        type: "text",
                        value: "## O Azure Machine Learning e o workspace\nO Azure Machine Learning é o serviço da Azure para o ciclo completo de machine learning: preparar dados, treinar, avaliar, registrar e implantar modelos. Ele atende tanto quem programa quanto quem prefere ferramentas visuais.\n\nTudo vive dentro de um workspace, o recurso central que reúne os experimentos, os conjuntos de dados, os modelos treinados, a computação e os endpoints. Você acessa esse conteúdo pelo Azure Machine Learning studio, o portal web do serviço. Sem um workspace não há onde os outros recursos existirem, então ele é sempre o ponto de partida.",
                    },
                    {
                        type: "text",
                        value: "## Automated machine learning e Designer\nDentro do workspace existem dois caminhos para treinar sem escrever muito código.\n\nO Automated machine learning, o AutoML, testa vários algoritmos e combinações de configuração de forma automática, compara os resultados por uma métrica que você escolhe e aponta o melhor modelo para os seus dados. É a escolha de quem quer um bom modelo sem dominar os detalhes de cada algoritmo.\n\nO Designer é um editor visual de arrastar e soltar. Você monta o fluxo de treino conectando blocos numa tela, do carregamento dos dados até o modelo, sem programar. Serve para desenhar e enxergar o pipeline passo a passo.",
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Para que serve","Quando usar"],["Workspace","Recurso central que reúne dados, modelos e computação","Sempre, é o ponto de partida do serviço"],["Automated ML (AutoML)","Testa algoritmos e aponta o melhor modelo sozinho","Quer o melhor modelo sem escolher o algoritmo na mão"],["Designer","Monta o fluxo de treino de forma visual, sem código","Desenhar o pipeline arrastando e conectando blocos"],["Compute","Máquinas gerenciadas que rodam treino e inferência","Precisa de poder de processamento para treinar ou servir"],["Endpoint","Publica o modelo como serviço web para receber previsões","Colocar um modelo treinado em produção"]]',
                    },
                    {
                        type: "text",
                        value: "## Computação e implantação como endpoint\nTreinar e servir modelos exige poder de processamento, e no Azure Machine Learning isso vem da computação, o compute: máquinas gerenciadas que a plataforma liga para trabalhar e desliga quando não precisa. Você define o tamanho conforme a carga.\n\nDepois de treinado e registrado, o modelo é implantado como um endpoint, um serviço web que recebe dados de entrada e devolve a previsão. Uma aplicação chama esse endpoint, envia um exemplo novo e recebe o resultado. Esse ato de usar o modelo pronto para prever dados novos é a inferência. Treino é aprender com os dados; inferência é aplicar o que foi aprendido.",
                    },
                    {
                        type: "quote",
                        value: "O AutoML acha o melhor modelo sozinho; o Designer monta o fluxo sem código; a computação (compute) fornece o poder de processamento; e o modelo é publicado como um endpoint para a inferência.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma analista quer o modelo de maior desempenho para os seus dados, mas não domina os algoritmos de machine learning nem quer escrevê-los. Qual recurso do Azure Machine Learning atende melhor?",
                        difficulty: "facil",
                        options: [
                            { text: "Automated machine learning (AutoML)", isCorrect: true },
                            { text: "Designer", isCorrect: false },
                            { text: "Endpoint", isCorrect: false },
                            { text: "Compute", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual é o recurso central do Azure Machine Learning, que reúne experimentos, dados, modelos e computação em um só lugar?",
                        difficulty: "facil",
                        options: [
                            { text: "O workspace", isCorrect: true },
                            { text: "O endpoint", isCorrect: false },
                            { text: "O Designer", isCorrect: false },
                            { text: "O grupo de recursos", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um time quer construir o fluxo de treinamento arrastando e conectando blocos numa tela, sem escrever código. Qual recurso usar?",
                        difficulty: "medio",
                        options: [
                            { text: "O Designer", isCorrect: true },
                            { text: "O Automated machine learning", isCorrect: false },
                            { text: "O compute", isCorrect: false },
                            { text: "O endpoint", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um modelo já foi treinado e validado. Agora um aplicativo precisa enviar novos dados e receber a previsão em tempo real. O que fazer com o modelo?",
                        difficulty: "medio",
                        options: [
                            { text: "Implantá-lo como um endpoint", isCorrect: true },
                            { text: "Rodar um novo experimento de AutoML", isCorrect: false },
                            { text: "Criar outro workspace", isCorrect: false },
                            { text: "Aumentar o tamanho do compute de treino", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No Azure Machine Learning, o que é inferência?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar um modelo já treinado para gerar previsões sobre dados novos",
                                isCorrect: true,
                            },
                            { text: "Dividir os dados em treino e teste", isCorrect: false },
                            { text: "Rotular os dados antes do treino", isCorrect: false },
                            { text: "Escolher quais features entram no modelo", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    { titulo: "Módulo 3 - Visão computacional", aulas: MODULO3 },
    { titulo: "Módulo 4 - Processamento de linguagem natural (PLN)", aulas: MODULO4 },
    { titulo: "Módulo 5 - IA generativa", aulas: MODULO5 },
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: "iniciante", description: DESCRICAO })
            .returning();
        console.log(`Trilha criada: ${trilha.name}`);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log(`Trilha ${NOME} já tem ${existentes.length} aulas. Nada a fazer.`);
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
        `Seed concluído: ${MODULOS.length} módulos, ${totalAulas} aulas, ${totalQuestoes} questões.`,
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
