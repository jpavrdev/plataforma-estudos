// Seed do simulado Microsoft Azure AI Fundamentals (AI-900). Idempotente: se o
// simulado já tiver questões, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-ai-900.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-ai-900.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "ai-900";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    // Domínio 1 - Cargas de trabalho de IA e IA responsável
    {
        statement:
            "Uma indústria quer inspecionar automaticamente peças em uma esteira de produção usando imagens de câmeras para identificar defeitos visuais como riscos e trincas. Qual carga de trabalho de IA atende a esse cenário?",
        explanation:
            "A visão computacional interpreta o conteúdo de imagens e vídeos, sendo ideal para detectar defeitos visuais em peças a partir de fotos da esteira. O processamento de linguagem natural lida com texto e fala, não com imagens. A mineração de conhecimento cria índices pesquisáveis sobre grandes volumes de conteúdo. A inteligência de documentos extrai campos de formulários e documentos, e não avalia defeitos físicos em produtos.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Processamento de linguagem natural", false],
            ["Visão computacional", true],
            ["Mineração de conhecimento", false],
            ["Inteligência de documentos", false],
        ],
    },
    {
        statement:
            "Um e-commerce recebe milhares de avaliações escritas por clientes e quer classificar automaticamente cada texto como positivo, negativo ou neutro. Qual carga de trabalho de IA deve ser usada?",
        explanation:
            "A análise de sentimentos sobre textos escritos é uma tarefa de processamento de linguagem natural, que interpreta o significado e o tom da linguagem. A visão computacional trabalha com imagens. A IA generativa cria conteúdo novo em vez de classificar o tom de textos existentes. A inteligência de documentos foca em extrair dados estruturados de formulários e documentos.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Visão computacional", false],
            ["Processamento de linguagem natural", true],
            ["IA generativa", false],
            ["Inteligência de documentos", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa extrair automaticamente número, data, valor total e itens de milhares de notas fiscais e recibos digitalizados, preservando os campos e suas posições. Qual carga de trabalho de IA é mais adequada?",
        explanation:
            "A inteligência de documentos (Document Intelligence) é especializada em extrair pares de chave e valor, tabelas e campos estruturados de formulários e documentos como notas fiscais e recibos. A mineração de conhecimento cria índices de busca sobre grandes acervos, mas não é focada na extração estruturada campo a campo. O processamento de linguagem natural entende texto livre, e o machine learning genérico exigiria construir e treinar o modelo do zero.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Mineração de conhecimento", false],
            ["Processamento de linguagem natural", false],
            ["Inteligência de documentos", true],
            ["Machine learning", false],
        ],
    },
    {
        statement:
            "Um escritório de advocacia possui milhões de contratos em PDF e quer permitir que os advogados pesquisem e encontrem cláusulas e informações relevantes em todo esse acervo de forma rápida. Qual carga de trabalho de IA atende melhor a essa necessidade?",
        explanation:
            "A mineração de conhecimento, apoiada pelo Azure AI Search, extrai informações de grandes volumes de conteúdo não estruturado e cria um índice pesquisável, ideal para localizar cláusulas em milhões de contratos. A inteligência de documentos foca na extração de campos de documentos individuais. A visão computacional trata de imagens, e a IA generativa cria conteúdo novo em vez de indexar e pesquisar o acervo existente.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Inteligência de documentos", false],
            ["Mineração de conhecimento", true],
            ["Visão computacional", false],
            ["IA generativa", false],
        ],
    },
    {
        statement:
            "Uma agência de marketing quer uma solução que produza textos originais de anúncios e imagens inéditas a partir de descrições fornecidas pela equipe. Qual carga de trabalho de IA descreve essa solução?",
        explanation:
            "A IA generativa cria conteúdo original, como textos, imagens e código, a partir de instruções em linguagem natural, exatamente o que o cenário pede. A mineração de conhecimento indexa e pesquisa conteúdo existente. O processamento de linguagem natural interpreta linguagem, mas não tem foco em gerar imagens inéditas. A visão computacional analisa imagens já existentes em vez de criá-las.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Mineração de conhecimento", false],
            ["Processamento de linguagem natural", false],
            ["Visão computacional", false],
            ["IA generativa", true],
        ],
    },
    {
        statement:
            "Uma imobiliária quer estimar o preço de venda de imóveis com base em dados históricos como área, número de quartos e localização. Qual carga de trabalho de IA é a mais indicada?",
        explanation:
            "Prever um valor numérico a partir de dados históricos é uma tarefa clássica de machine learning, mais especificamente de regressão. A IA generativa cria conteúdo novo, não previsões numéricas baseadas em variáveis. A visão computacional lida com imagens e a inteligência de documentos com extração de campos de documentos, nenhuma adequada para estimar preços a partir de atributos tabulares.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["IA generativa", false],
            ["Visão computacional", false],
            ["Machine learning", true],
            ["Inteligência de documentos", false],
        ],
    },
    {
        statement:
            "Um gestor pergunta qual afirmação descreve melhor o conceito de inteligência artificial. Qual opção está correta?",
        explanation:
            "Inteligência artificial é software que imita capacidades humanas, como aprender a partir de dados, reconhecer imagens, entender linguagem e tomar decisões. Não é um banco de dados, nem um simples conjunto de regras fixas, nem um tipo de hardware. A capacidade de aprender com dados é justamente o que diferencia a IA de sistemas puramente determinísticos.",
        topic: "Cargas de trabalho de IA",
        options: [
            [
                "Software capaz de imitar comportamentos e capacidades humanas, como aprender com dados, reconhecer imagens e interpretar linguagem",
                true,
            ],
            [
                "Um banco de dados relacional usado apenas para armazenar grandes volumes de informação",
                false,
            ],
            ["Um conjunto de regras fixas que nunca muda e não depende de dados", false],
            [
                "Um tipo de hardware que substitui completamente os processadores tradicionais",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma rede de lojas quer contar quantas pessoas entram em cada unidade analisando o vídeo das câmeras de segurança em tempo real. Qual carga de trabalho de IA deve ser aplicada?",
        explanation:
            "Detectar e contar pessoas em imagens e vídeos é uma tarefa de visão computacional, que inclui a detecção de objetos. A inteligência de documentos extrai dados de documentos, o processamento de linguagem natural lida com texto e fala, e a mineração de conhecimento cria índices pesquisáveis, nenhuma delas voltada para análise de vídeo em tempo real.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Inteligência de documentos", false],
            ["Visão computacional", true],
            ["Processamento de linguagem natural", false],
            ["Mineração de conhecimento", false],
        ],
    },
    {
        statement:
            "Um aplicativo de atendimento precisa transcrever ligações telefônicas e traduzir o texto para outros idiomas automaticamente. Qual carga de trabalho de IA é a base dessa funcionalidade?",
        explanation:
            "Transcrever fala em texto e traduzir entre idiomas são tarefas de processamento de linguagem natural, que abrange reconhecimento de fala e tradução. A visão computacional trata de imagens. O machine learning genérico e a IA generativa não descrevem especificamente reconhecimento de fala e tradução, que são serviços de linguagem.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Visão computacional", false],
            ["IA generativa", false],
            ["Processamento de linguagem natural", true],
            ["Machine learning", false],
        ],
    },
    {
        statement:
            "Uma equipe está mapeando quais tarefas pertencem à carga de trabalho de visão computacional. Quais das opções a seguir são exemplos de visão computacional? (Selecione DUAS opções.)",
        explanation:
            "Detecção de objetos e classificação de imagens são tarefas de visão computacional, pois interpretam o conteúdo visual de imagens. Análise de sentimentos e tradução de textos pertencem ao processamento de linguagem natural, já que trabalham com linguagem escrita, e não com imagens.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Detecção de objetos em fotos", true],
            ["Análise de sentimentos em avaliações de texto", false],
            ["Classificação de imagens", true],
            ["Tradução de textos entre idiomas", false],
        ],
    },
    {
        statement:
            "Ao planejar uma solução, um arquiteto precisa identificar tarefas de processamento de linguagem natural. Quais das opções a seguir são exemplos dessa carga de trabalho? (Selecione DUAS opções.)",
        explanation:
            "Detecção de idioma e reconhecimento de entidades nomeadas são tarefas de processamento de linguagem natural, focadas em interpretar texto. A detecção de faces é visão computacional, e a geração de imagens a partir de descrições é IA generativa, portanto não pertencem ao processamento de linguagem natural.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Detecção do idioma de um texto", true],
            ["Detecção de faces em imagens", false],
            ["Reconhecimento de entidades nomeadas em documentos de texto", true],
            ["Geração de imagens a partir de descrições", false],
        ],
    },
    {
        statement:
            "Uma operadora quer prever quais clientes têm maior probabilidade de cancelar o serviço no próximo mês, atribuindo a cada cliente a categoria provável cancelar ou permanecer. Qual carga de trabalho de IA descreve essa solução?",
        explanation:
            "Atribuir clientes a categorias como cancelar ou permanecer a partir de dados históricos é uma tarefa de classificação, um tipo de machine learning. A mineração de conhecimento cria índices pesquisáveis, a visão computacional analisa imagens e a IA generativa cria conteúdo novo, nenhuma adequada para prever a probabilidade de cancelamento com base em dados do cliente.",
        topic: "Cargas de trabalho de IA",
        options: [
            ["Mineração de conhecimento", false],
            ["Visão computacional", false],
            ["IA generativa", false],
            ["Machine learning", true],
        ],
    },
    {
        statement:
            "Uma instituição financeira descobre que seu modelo de aprovação de crédito nega empréstimos com mais frequência para pessoas de determinado gênero, mesmo com perfis financeiros equivalentes. Qual princípio de IA responsável está sendo violado?",
        explanation:
            "A imparcialidade determina que os sistemas de IA devem tratar todas as pessoas de forma justa, sem favorecer ou prejudicar grupos com base em características como gênero ou etnia. O cenário descreve um viés discriminatório, que fere justamente a imparcialidade. Transparência trata da compreensão do sistema, confiabilidade e segurança do funcionamento correto, e inclusão de tornar a solução acessível a todos, não do viés nas decisões.",
        topic: "IA responsável",
        options: [
            ["Transparência", false],
            ["Imparcialidade", true],
            ["Confiabilidade e segurança", false],
            ["Inclusão", false],
        ],
    },
    {
        statement:
            "Uma fabricante de veículos autônomos realiza testes rigorosos para garantir que o carro reaja de forma segura a situações inesperadas na estrada, como obstáculos repentinos. Qual princípio de IA responsável orienta essa preocupação?",
        explanation:
            "A confiabilidade e segurança exige que os sistemas de IA funcionem de maneira confiável e segura, inclusive diante de condições inesperadas, minimizando riscos de danos. Privacidade e segurança trata da proteção de dados, responsabilidade da governança e da prestação de contas, e transparência da compreensão do sistema, nenhuma delas focada em reagir com segurança a imprevistos.",
        topic: "IA responsável",
        options: [
            ["Privacidade e segurança", false],
            ["Responsabilidade", false],
            ["Confiabilidade e segurança", true],
            ["Transparência", false],
        ],
    },
    {
        statement:
            "Ao construir um modelo na área da saúde, uma empresa precisa garantir que os dados pessoais dos pacientes sejam protegidos contra acesso indevido e usados apenas com consentimento. Qual princípio de IA responsável está em foco?",
        explanation:
            "O princípio de privacidade e segurança determina que os sistemas de IA respeitem a privacidade e protejam os dados contra acessos não autorizados. Imparcialidade trata de decisões justas, inclusão de acessibilidade para todos, e confiabilidade e segurança do funcionamento correto do sistema, não especificamente da proteção de dados pessoais e do consentimento.",
        topic: "IA responsável",
        options: [
            ["Imparcialidade", false],
            ["Inclusão", false],
            ["Confiabilidade e segurança", false],
            ["Privacidade e segurança", true],
        ],
    },
    {
        statement:
            "Uma equipe desenvolve um aplicativo com comandos de voz, legendas e leitores de tela para que pessoas com diferentes deficiências também consigam utilizá-lo plenamente. Qual princípio de IA responsável está sendo aplicado?",
        explanation:
            "A inclusão determina que os sistemas de IA capacitem e considerem todas as pessoas, incluindo aquelas com deficiências, oferecendo recursos de acessibilidade. Imparcialidade trata de evitar vieses nas decisões, transparência da compreensão do sistema e responsabilidade da governança, enquanto o cenário foca em tornar a solução acessível a todos.",
        topic: "IA responsável",
        options: [
            ["Imparcialidade", false],
            ["Inclusão", true],
            ["Transparência", false],
            ["Responsabilidade", false],
        ],
    },
    {
        statement:
            "Os usuários de um sistema de recomendação devem ser informados de que estão interagindo com uma IA, de como ela funciona em linhas gerais e de quais são suas limitações. Qual princípio de IA responsável trata dessa necessidade?",
        explanation:
            "A transparência estabelece que os sistemas de IA devem ser compreensíveis, informando os usuários sobre seu propósito, funcionamento e limitações. Responsabilidade trata de quem responde pelo sistema, privacidade e segurança da proteção de dados, e imparcialidade de decisões justas, ao passo que o cenário destaca dar clareza aos usuários sobre o sistema.",
        topic: "IA responsável",
        options: [
            ["Responsabilidade", false],
            ["Privacidade e segurança", false],
            ["Transparência", true],
            ["Imparcialidade", false],
        ],
    },
    {
        statement:
            "Uma organização define uma estrutura de governança em que pessoas e equipes são responsáveis pelo funcionamento dos sistemas de IA e devem prestar contas de acordo com normas internas e legais. Qual princípio de IA responsável isso representa?",
        explanation:
            "A responsabilidade (accountability) determina que as pessoas que projetam e operam sistemas de IA devem prestar contas por seu funcionamento, dentro de uma estrutura de governança e conforme normas e leis. Transparência trata de tornar o sistema compreensível, confiabilidade e segurança do funcionamento seguro, e inclusão da acessibilidade, não da prestação de contas e da governança.",
        topic: "IA responsável",
        options: [
            ["Transparência", false],
            ["Responsabilidade", true],
            ["Confiabilidade e segurança", false],
            ["Inclusão", false],
        ],
    },
    {
        statement:
            "Uma empresa vai adotar uma ferramenta de triagem de currículos e quer garantir que candidatos igualmente qualificados tenham as mesmas chances, sem que o modelo favoreça um grupo específico. Qual princípio de IA responsável deve orientar essa avaliação?",
        explanation:
            "Garantir que candidatos igualmente qualificados sejam tratados de forma equivalente, sem favorecer grupos específicos, é o cerne da imparcialidade. Confiabilidade e segurança trata do funcionamento correto do sistema, privacidade e segurança da proteção de dados, e transparência da compreensão do sistema, nenhuma voltada especificamente para evitar vieses na seleção.",
        topic: "IA responsável",
        options: [
            ["Confiabilidade e segurança", false],
            ["Privacidade e segurança", false],
            ["Imparcialidade", true],
            ["Transparência", false],
        ],
    },
    {
        statement:
            "Um médico precisa entender quais fatores levaram um modelo de IA a indicar determinado diagnóstico, para poder confiar na recomendação e explicá-la ao paciente. Qual princípio de IA responsável está diretamente relacionado a essa capacidade de interpretar o modelo?",
        explanation:
            "A transparência inclui a interpretabilidade, ou seja, permitir que as pessoas entendam como e por que o modelo chegou a um resultado. Inclusão trata de acessibilidade, responsabilidade da prestação de contas e imparcialidade de decisões justas, mas é a transparência que garante que o médico compreenda os fatores por trás da recomendação.",
        topic: "IA responsável",
        options: [
            ["Inclusão", false],
            ["Transparência", true],
            ["Responsabilidade", false],
            ["Imparcialidade", false],
        ],
    },
    {
        statement:
            "Durante um treinamento, os participantes devem identificar quais itens são princípios oficiais de IA responsável da Microsoft. Quais das opções a seguir são princípios válidos? (Selecione DUAS opções.)",
        explanation:
            "Inclusão e confiabilidade e segurança fazem parte dos seis princípios de IA responsável da Microsoft, junto de imparcialidade, privacidade e segurança, transparência e responsabilidade. Escalabilidade e lucratividade são características de negócio ou de arquitetura, mas não constam entre os princípios de IA responsável.",
        topic: "IA responsável",
        options: [
            ["Inclusão", true],
            ["Escalabilidade", false],
            ["Confiabilidade e segurança", true],
            ["Lucratividade", false],
        ],
    },
    {
        statement:
            "Um chatbot de suporte médico deve manter comportamento consistente, evitar respostas perigosas e encaminhar o usuário a um atendente humano quando não tiver confiança na resposta. Qual princípio de IA responsável está sendo priorizado?",
        explanation:
            "Manter comportamento consistente, evitar respostas perigosas e adotar um plano de contingência com atendimento humano reflete a confiabilidade e segurança, que busca operação segura mesmo diante de incertezas. Inclusão trata de acessibilidade, transparência da compreensão do sistema e privacidade e segurança da proteção de dados, nenhuma focada no funcionamento seguro e consistente do chatbot.",
        topic: "IA responsável",
        options: [
            ["Inclusão", false],
            ["Transparência", false],
            ["Confiabilidade e segurança", true],
            ["Privacidade e segurança", false],
        ],
    },

    // Domínio 2 - Machine learning
    {
        statement:
            "Uma imobiliária deseja estimar o preço de venda de imóveis, em reais, a partir de características como área construída, número de quartos e bairro. O objetivo é prever um valor numérico contínuo. Qual tipo de aprendizado de máquina é o mais adequado?",
        explanation:
            "A regressão é indicada quando o rótulo a ser previsto é um número contínuo, como um preço em reais. A classificação, seja binária ou multiclasse, prevê categorias, e não valores numéricos. O agrupamento é não supervisionado e apenas junta itens semelhantes, sem estimar um preço específico.",
        topic: "Machine learning",
        options: [
            ["Regressão", true],
            ["Classificação binária", false],
            ["Agrupamento (clustering)", false],
            ["Classificação multiclasse", false],
        ],
    },
    {
        statement:
            "Um banco quer um modelo que avalie cada transação de cartão e a rotule como fraudulenta ou legítima, ou seja, apenas um entre dois resultados possíveis. Que tipo de tarefa de machine learning representa esse cenário?",
        explanation:
            "Rotular cada transação como fraudulenta ou legítima é um problema de classificação binária, pois existem exatamente duas classes possíveis. A regressão prevê valores numéricos contínuos. O agrupamento não usa rótulos conhecidos. A previsão de séries temporais estima valores futuros ao longo do tempo, o que não é o objetivo aqui.",
        topic: "Machine learning",
        options: [
            ["Classificação binária", true],
            ["Regressão", false],
            ["Agrupamento (clustering)", false],
            ["Previsão de séries temporais", false],
        ],
    },
    {
        statement:
            "Uma central de atendimento quer classificar automaticamente cada chamado em uma de cinco categorias: entrega, cobrança, cancelamento, elogio ou reclamação. Cada chamado pertence a exatamente uma categoria. Qual abordagem resolve o problema?",
        explanation:
            "Atribuir cada chamado a uma entre cinco categorias conhecidas é um caso de classificação multiclasse. A classificação binária serve apenas para duas classes. A regressão prevê números contínuos. O agrupamento descobriria grupos por conta própria, sem respeitar as categorias já definidas pelo negócio.",
        topic: "Machine learning",
        options: [
            ["Classificação multiclasse", true],
            ["Classificação binária", false],
            ["Regressão", false],
            ["Agrupamento (clustering)", false],
        ],
    },
    {
        statement:
            "Uma equipe de marketing tem uma base de clientes sem nenhum rótulo e quer descobrir grupos de pessoas com comportamento de compra parecido para personalizar campanhas. Não há categorias definidas de antemão. Qual técnica é a mais indicada?",
        explanation:
            "O agrupamento é uma técnica de aprendizado não supervisionado que reúne observações semelhantes sem precisar de rótulos definidos previamente, perfeita para segmentar clientes. As opções de classificação e regressão são supervisionadas e exigiriam rótulos conhecidos, que não existem nesse cenário.",
        topic: "Machine learning",
        options: [
            ["Agrupamento (clustering)", true],
            ["Classificação multiclasse", false],
            ["Regressão", false],
            ["Classificação binária", false],
        ],
    },
    {
        statement:
            "Um conjunto de dados é usado para prever a nota final de alunos a partir de horas de estudo, percentual de frequência e média das provas anteriores. Nesse conjunto, o que representa o rótulo (label)?",
        explanation:
            "O rótulo (label) é o valor que o modelo aprende a prever, aqui a nota final do aluno. Horas de estudo, frequência e média das provas anteriores são as features, isto é, as variáveis de entrada utilizadas para chegar à previsão.",
        topic: "Machine learning",
        options: [
            ["A nota final do aluno", true],
            ["As horas de estudo", false],
            ["O percentual de frequência", false],
            ["A média das provas anteriores", false],
        ],
    },
    {
        statement:
            "Uma cientista de dados treina um modelo para prever se um cliente vai cancelar o serviço. A tabela tem as colunas tempo de contrato, valor mensal, número de chamados ao suporte e a coluna cancelou, com valores sim ou não. Quais colunas atuam como features?",
        explanation:
            "As features são as variáveis de entrada que descrevem cada cliente: tempo de contrato, valor mensal e número de chamados. A coluna cancelou é o rótulo (label), ou seja, aquilo que o modelo deve prever, e por isso nunca é tratada como feature.",
        topic: "Machine learning",
        options: [
            ["Tempo de contrato, valor mensal e número de chamados ao suporte", true],
            ["Somente a coluna cancelou", false],
            ["Somente o valor mensal", false],
            ["Tempo de contrato e a coluna cancelou", false],
        ],
    },
    {
        statement:
            "No aprendizado supervisionado o modelo é treinado com dados que já possuem rótulos conhecidos. Quais das tarefas a seguir são exemplos de aprendizado supervisionado? (Selecione DUAS opções.)",
        explanation:
            "Regressão e classificação são tarefas supervisionadas, pois o modelo aprende a partir de exemplos já rotulados, seja um valor numérico ou uma categoria. O agrupamento é não supervisionado, já que trabalha sem rótulos. A redução de dimensionalidade transforma as features, mas não é uma tarefa de previsão supervisionada.",
        topic: "Machine learning",
        options: [
            ["Regressão para prever o faturamento do próximo mês", true],
            ["Classificação para identificar se um e-mail é spam", true],
            ["Agrupamento de clientes por comportamento sem rótulos", false],
            ["Redução de dimensionalidade das features de entrada", false],
        ],
    },
    {
        statement:
            "Um serviço de streaming quer prever, para cada usuário, se ele vai dar a um filme uma avaliação de 1, 2, 3, 4 ou 5 estrelas, tratando cada quantidade de estrelas como uma categoria distinta. Qual tipo de tarefa melhor descreve esse objetivo?",
        explanation:
            "Como cada nota de estrelas é tratada como uma categoria distinta e existem cinco delas, o problema é de classificação multiclasse. A classificação binária só funcionaria com duas classes. O agrupamento não usaria as categorias já conhecidas. Se o objetivo fosse prever um número contínuo qualquer, a regressão seria a escolha, mas aqui as estrelas são categorias fixas.",
        topic: "Machine learning",
        options: [
            ["Classificação multiclasse", true],
            ["Regressão linear simples", false],
            ["Agrupamento (clustering)", false],
            ["Classificação binária", false],
        ],
    },
    {
        statement:
            "Uma rede de varejo possui milhões de registros de compras sem qualquer classificação e quer que o próprio algoritmo descubra padrões e agrupe produtos frequentemente comprados juntos. Não existe um rótulo indicando a que grupo cada produto pertence. Que tipo de aprendizado se aplica?",
        explanation:
            "Sem rótulos predefinidos e com o objetivo de descobrir grupos naturais nos dados, o cenário pede aprendizado não supervisionado, tipicamente o agrupamento. Todas as opções supervisionadas dependeriam de rótulos conhecidos para treinar, o que não está disponível nesse caso.",
        topic: "Machine learning",
        options: [
            ["Aprendizado não supervisionado com agrupamento", true],
            ["Aprendizado supervisionado com regressão", false],
            ["Aprendizado supervisionado com classificação binária", false],
            ["Aprendizado supervisionado com classificação multiclasse", false],
        ],
    },
    {
        statement:
            "Ao construir um modelo, uma analista separa parte dos dados e não os utiliza durante o treinamento, reservando-os apenas para medir o desempenho no final. Qual é o principal motivo para manter esse conjunto de teste separado?",
        explanation:
            "O conjunto de teste é mantido separado para estimar de forma honesta o desempenho do modelo em dados novos, que ele não viu durante o treino. Isso ajuda a detectar overfitting. Reservar dados para teste não aumenta o conjunto de treino, não acelera o treinamento e não substitui a escolha de métricas de avaliação.",
        topic: "Machine learning",
        options: [
            ["Avaliar como o modelo se sai com dados que nunca viu durante o treino", true],
            ["Aumentar a quantidade de dados de treinamento disponíveis", false],
            ["Acelerar o processo de treinamento do modelo", false],
            ["Eliminar a necessidade de escolher métricas de avaliação", false],
        ],
    },
    {
        statement:
            "Durante a avaliação, um modelo apresenta acurácia muito alta nos dados de treino, mas desempenho bem pior nos dados de teste. Qual problema esse comportamento indica?",
        explanation:
            "Quando o modelo vai muito bem no treino e mal no teste, ele memorizou padrões específicos dos dados de treinamento e não generaliza, o que caracteriza overfitting. O underfitting apareceria como desempenho ruim tanto no treino quanto no teste. As demais opções descrevem outros problemas que não correspondem a esse padrão de treino alto e teste baixo.",
        topic: "Machine learning",
        options: [
            ["Overfitting (sobreajuste) aos dados de treino", true],
            ["Underfitting por modelo simples demais", false],
            ["Vazamento de rótulos no conjunto de teste", false],
            ["Desbalanceamento das classes de saída", false],
        ],
    },
    {
        statement:
            "Uma equipe percebe que seu modelo está sofrendo overfitting. Qual das ações a seguir tende a reduzir esse problema?",
        explanation:
            "Adicionar mais dados representativos ou reduzir a complexidade do modelo ajuda a melhorar a generalização e combater o overfitting. Treinar por mais épocas nos mesmos dados ou aumentar a complexidade tende a piorar o sobreajuste. Avaliar somente com os dados de treino esconde o problema em vez de resolvê-lo.",
        topic: "Machine learning",
        options: [
            ["Fornecer mais dados de treinamento ou simplificar o modelo", true],
            ["Treinar o modelo por muito mais épocas nos mesmos dados", false],
            ["Aumentar a complexidade do modelo indefinidamente", false],
            ["Avaliar o modelo apenas com os dados de treino", false],
        ],
    },
    {
        statement:
            "Em um problema de classificação com classes equilibradas, uma analista quer uma métrica simples que represente a proporção de previsões corretas em relação ao total de previsões. Qual métrica atende diretamente a essa definição?",
        explanation:
            "A acurácia é a proporção de previsões corretas sobre o total de previsões, adequada quando as classes estão equilibradas. O R² e o RMSE são métricas de regressão, não de classificação. A silhueta avalia a qualidade de agrupamentos no aprendizado não supervisionado.",
        topic: "Machine learning",
        options: [
            ["Acurácia", true],
            ["Coeficiente de determinação (R²)", false],
            ["Erro quadrático médio (RMSE)", false],
            ["Silhueta do agrupamento", false],
        ],
    },
    {
        statement:
            "Uma equipe vai avaliar um modelo de classificação e precisa escolher métricas apropriadas para esse tipo de tarefa. Quais das opções a seguir são métricas de classificação? (Selecione DUAS opções.)",
        explanation:
            "Precisão e revocação são métricas típicas de classificação, calculadas a partir da matriz de confusão. O R² e o erro quadrático médio (RMSE) avaliam modelos de regressão, que preveem valores numéricos, e não categorias, por isso não se aplicam à classificação.",
        topic: "Machine learning",
        options: [
            ["Precisão (precision)", true],
            ["Revocação (recall)", true],
            ["Coeficiente de determinação (R²)", false],
            ["Erro quadrático médio (RMSE)", false],
        ],
    },
    {
        statement:
            "Após treinar um modelo de regressão para prever o consumo de energia, uma analista obtém um valor de R² próximo de 0,95. O que esse resultado indica de forma geral?",
        explanation:
            "O R² (coeficiente de determinação) varia tipicamente de 0 a 1 e indica a proporção da variação dos valores reais que o modelo consegue explicar, então 0,95 sugere um bom ajuste em regressão. Ele não mede acurácia de classificação, nem revocação, nem número de clusters, pois essas são interpretações de outros tipos de tarefa.",
        topic: "Machine learning",
        options: [
            ["O modelo explica boa parte da variação dos valores reais", true],
            ["O modelo classificou 95% das amostras corretamente", false],
            ["O modelo teve 95% de revocação nas classes positivas", false],
            ["O modelo agrupou os dados em 95 clusters distintos", false],
        ],
    },
    {
        statement:
            "Em um modelo de classificação binária que detecta doença, uma célula da matriz de confusão conta os casos em que o modelo previu doente, mas o paciente na verdade estava saudável. Como esses casos são chamados?",
        explanation:
            "Quando o modelo prevê a classe positiva (doente), mas o valor real é negativo (saudável), o caso é um falso positivo. Verdadeiro positivo seria prever doente para quem realmente está doente. Falso negativo seria prever saudável para quem está doente. Verdadeiro negativo seria prever saudável para quem está de fato saudável.",
        topic: "Machine learning",
        options: [
            ["Falsos positivos", true],
            ["Verdadeiros positivos", false],
            ["Falsos negativos", false],
            ["Verdadeiros negativos", false],
        ],
    },
    {
        statement:
            "Uma organização vai começar a usar o Azure Machine Learning e precisa de um recurso central que reúna experimentos, modelos registrados, destinos de computação, endpoints e datastores em um único lugar. Qual recurso deve ser criado primeiro?",
        explanation:
            "O workspace do Azure Machine Learning é o recurso de nível superior que centraliza e organiza todos os artefatos, como experimentos, modelos, computação e endpoints. O Azure AI Search serve para busca, um serviço cognitivo isolado entrega modelos prontos e uma máquina virtual comum não oferece a estrutura de gestão de ativos de machine learning.",
        topic: "Machine learning",
        options: [
            ["Um workspace do Azure Machine Learning", true],
            ["Um recurso de Azure AI Search", false],
            ["Uma conta de serviço cognitivo isolada", false],
            ["Uma máquina virtual comum do Azure", false],
        ],
    },
    {
        statement:
            "Uma pessoa sem experiência em programação quer treinar um modelo no Azure Machine Learning usando o Automated ML (AutoML). Quais afirmações sobre o AutoML estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O AutoML experimenta automaticamente diferentes algoritmos e hiperparâmetros e compara os resultados para indicar o melhor modelo, com suporte a classificação, regressão e previsão de séries temporais. Ele foi criado justamente para reduzir a necessidade de codificar o treinamento manualmente e não se limita a agrupamento, então as duas últimas afirmações estão incorretas.",
        topic: "Machine learning",
        options: [
            [
                "Ele testa automaticamente vários algoritmos e configurações para encontrar um bom modelo",
                true,
            ],
            [
                "Ele oferece suporte a tarefas como classificação, regressão e previsão de séries temporais",
                true,
            ],
            ["Ele exige que o usuário escreva manualmente todo o código de treinamento", false],
            ["Ele funciona apenas para tarefas de agrupamento não supervisionado", false],
        ],
    },
    {
        statement:
            "Uma analista quer montar um fluxo de treinamento e implantação arrastando e conectando componentes visuais, sem escrever código, dentro do Azure Machine Learning. Qual recurso é o mais indicado?",
        explanation:
            "O Designer oferece uma interface visual de arrastar e soltar para construir pipelines de treinamento e implantação sem escrever código, ideal para o cenário descrito. O SDK em Python e a CLI exigem código ou comandos. Os endpoints em lote servem para pontuar grandes volumes de dados, não para montar o fluxo visualmente.",
        topic: "Machine learning",
        options: [
            ["O Designer do Azure Machine Learning", true],
            ["O SDK do Azure Machine Learning em Python", false],
            ["A CLI do Azure Machine Learning", false],
            ["Os endpoints em lote (batch)", false],
        ],
    },
    {
        statement:
            "Depois de treinar um modelo, uma equipe precisa disponibilizá-lo para receber requisições individuais e devolver previsões em tempo real, com baixa latência, para um aplicativo web. Qual recurso do Azure Machine Learning atende a essa necessidade?",
        explanation:
            "Um endpoint online, também chamado de tempo real, expõe o modelo como serviço para responder a requisições individuais com baixa latência, exatamente o que um aplicativo web precisa. O endpoint em lote é assíncrono e voltado a grandes volumes. A instância de computação serve para desenvolvimento e o datastore apenas armazena dados, sem servir previsões.",
        topic: "Machine learning",
        options: [
            ["Um endpoint online (em tempo real)", true],
            ["Um endpoint em lote (batch)", false],
            ["Uma instância de computação para desenvolvimento", false],
            ["Um datastore para armazenamento de dados", false],
        ],
    },

    // Domínio 3 - Visão computacional
    {
        statement:
            "Uma equipe precisa de um modelo que, para cada foto de uma prateleira de supermercado, informe não apenas quais produtos aparecem, mas também a posição de cada um por meio de coordenadas retangulares na imagem. Qual tarefa de visão computacional atende a esse requisito?",
        explanation:
            "A detecção de objetos identifica cada item e retorna sua localização por meio de uma caixa delimitadora (bounding box) com coordenadas. A classificação de imagem apenas atribui um rótulo à imagem inteira, sem indicar posição. A descrição de imagem gera uma legenda em linguagem natural e o OCR lê texto, nenhum deles fornece as coordenadas dos produtos.",
        topic: "Visão computacional",
        options: [
            ["Detecção de objetos", true],
            ["Classificação de imagem", false],
            ["Descrição de imagem", false],
            ["Extração de texto com OCR", false],
        ],
    },
    {
        statement:
            "Um aplicativo de reciclagem recebe uma foto e precisa responder apenas se o objeto fotografado é vidro, papel, plástico ou metal, sem se preocupar com a posição do objeto na imagem. Qual tarefa de visão computacional melhor descreve esse cenário?",
        explanation:
            "Atribuir um único rótulo de categoria à imagem inteira é o papel da classificação de imagem. A detecção de objetos e a segmentação semântica seriam usadas se fosse necessário localizar o objeto, com caixa delimitadora ou por pixel. O reconhecimento facial trata de identificar pessoas, o que não se aplica aqui.",
        topic: "Visão computacional",
        options: [
            ["Classificação de imagem", true],
            ["Detecção de objetos", false],
            ["Segmentação semântica", false],
            ["Reconhecimento facial", false],
        ],
    },
    {
        statement:
            "Em um projeto de análise de imagens de satélite, o objetivo é classificar cada pixel da imagem como floresta, água ou área urbana, de modo a colorir regiões inteiras conforme sua categoria. Qual técnica de visão computacional corresponde a essa abordagem em nível de pixel?",
        explanation:
            "A segmentação semântica classifica individualmente cada pixel de acordo com a categoria a que pertence, permitindo pintar regiões inteiras. A detecção de objetos apenas desenha caixas retangulares ao redor dos itens e a classificação de imagem gera um único rótulo para toda a imagem. O OCR não se aplica, pois trata de texto.",
        topic: "Visão computacional",
        options: [
            ["Segmentação semântica", true],
            ["Detecção de objetos", false],
            ["Classificação de imagem", false],
            ["Leitura de texto com OCR", false],
        ],
    },
    {
        statement:
            "Uma empresa quer digitalizar notas fiscais fotografadas e extrair o texto impresso e também anotações manuscritas contidas nelas. Qual recurso do Azure AI Vision deve ser utilizado?",
        explanation:
            "O recurso Read do Azure AI Vision é o OCR do serviço e extrai tanto texto impresso quanto manuscrito de imagens e documentos. A descrição gera uma legenda da cena, a detecção de objetos localiza itens com caixas delimitadoras e a geração de tags apenas lista elementos visuais, nenhum deles retorna o conteúdo textual.",
        topic: "Visão computacional",
        options: [
            ["O recurso Read (OCR)", true],
            ["A geração de descrição (caption)", false],
            ["A detecção de objetos", false],
            ["A geração de tags", false],
        ],
    },
    {
        statement:
            "Sem treinar nenhum modelo, um desenvolvedor quer enviar fotos genéricas e receber automaticamente uma legenda descritiva e uma lista de marcações (tags) com os elementos presentes, como 'cachorro', 'grama' e 'ao ar livre'. Qual serviço oferece esses recursos prontos?",
        explanation:
            "O Azure AI Vision é um serviço pré-treinado que analisa imagens e retorna descrições e tags de objetos e cenas comuns, sem necessidade de treinamento. O Custom Vision exigiria treinar um modelo com imagens próprias. O Face trata especificamente de rostos e o Azure AI Language é voltado ao processamento de linguagem, não de imagens.",
        topic: "Visão computacional",
        options: [
            ["Azure AI Vision", true],
            ["Custom Vision", false],
            ["Face", false],
            ["Azure AI Language", false],
        ],
    },
    {
        statement:
            "Uma indústria fabrica peças metálicas exclusivas e precisa de um modelo que classifique fotos dessas peças em categorias específicas que não existem em modelos genéricos. A equipe possui milhares de imagens rotuladas dessas peças. Qual serviço é o mais adequado?",
        explanation:
            "O Custom Vision permite treinar um classificador com as imagens rotuladas da própria empresa, ideal para categorias específicas que não constam em modelos prontos. O Azure AI Vision é pré-treinado para objetos comuns e não reconheceria essas peças exclusivas. O Face é para rostos e o recurso Read é para texto.",
        topic: "Visão computacional",
        options: [
            ["Custom Vision", true],
            ["Azure AI Vision", false],
            ["Face", false],
            ["O recurso Read", false],
        ],
    },
    {
        statement:
            "Um sistema de controle de acesso corporativo precisa detectar rostos em fotos e verificar se o rosto capturado pela câmera pertence a um funcionário já cadastrado. Qual serviço do Azure é projetado para isso?",
        explanation:
            "O serviço Face é especializado em detecção de rostos e em recursos como verificação (comparar se dois rostos são da mesma pessoa) e identificação. O Azure AI Vision faz apenas detecção básica de rostos, sem identificação. O Custom Vision trata de classificação e detecção de objetos genéricos e o Azure AI Language não lida com imagens.",
        topic: "Visão computacional",
        options: [
            ["Face", true],
            ["Custom Vision", false],
            ["Azure AI Vision", false],
            ["Azure AI Language", false],
        ],
    },
    {
        statement:
            "Um blog de viagens quer gerar automaticamente legendas em linguagem natural e tags para milhares de fotos de paisagens, cidades e comida comuns, sem investir tempo em treinamento de modelos. Qual é a melhor escolha?",
        explanation:
            "Como as imagens contêm objetos e cenas comuns e não há interesse em treinar modelos, o Azure AI Vision é ideal, pois já oferece descrição e tags prontas. O Custom Vision só faz sentido quando as categorias são específicas e exigem treinamento. O Face é para rostos e o Read é para texto, nenhum gera legendas de cena.",
        topic: "Visão computacional",
        options: [
            ["Usar o Azure AI Vision, que já vem pré-treinado para cenas e objetos comuns", true],
            ["Usar o Custom Vision, treinando um modelo com as fotos do blog", false],
            ["Usar o serviço Face para gerar as legendas", false],
            ["Usar o recurso Read para gerar as tags", false],
        ],
    },
    {
        statement:
            "Sua equipe avalia o serviço Azure AI Vision e quer saber quais capacidades ele oferece de forma pré-treinada, sem necessidade de treinar modelos. Quais das opções a seguir são fornecidas pelo Azure AI Vision? (Selecione DUAS opções.)",
        explanation:
            "O Azure AI Vision oferece, prontos para uso, a geração de tags e descrições e o recurso Read para OCR. Treinar um classificador com imagens próprias é função do Custom Vision e identificar uma pessoa específica é função do serviço Face.",
        topic: "Visão computacional",
        options: [
            ["Geração de tags e descrição para imagens", true],
            ["Leitura de texto impresso e manuscrito com o recurso Read", true],
            ["Treinamento de um classificador com imagens rotuladas próprias", false],
            ["Identificação de qual funcionário específico aparece na foto", false],
        ],
    },
    {
        statement:
            "Um aplicativo de fotografia precisa apenas localizar onde estão os rostos em cada imagem, desenhando um retângulo ao redor de cada face, sem identificar quem são as pessoas. Qual tarefa descreve esse requisito?",
        explanation:
            "A detecção facial localiza rostos e retorna suas coordenadas (caixa delimitadora), sem dizer de quem são. A identificação facial iria além, associando cada rosto a uma pessoa conhecida. A classificação de imagem daria um rótulo único à imagem e a segmentação semântica trabalharia em nível de pixel, o que não é necessário aqui.",
        topic: "Visão computacional",
        options: [
            ["Detecção facial", true],
            ["Identificação facial", false],
            ["Classificação de imagem", false],
            ["Segmentação semântica", false],
        ],
    },
    {
        statement:
            "Uma rede de lojas quer um modelo que localize, com caixas delimitadoras, apenas os seus próprios produtos de marca própria dentro de fotos de prateleiras. Esses produtos não são reconhecidos por modelos genéricos. Qual abordagem é a correta?",
        explanation:
            "Como os produtos são específicos da marca e não constam em modelos prontos, é preciso treinar um modelo de detecção de objetos no Custom Vision, marcando as caixas nas imagens de exemplo. A detecção do Azure AI Vision só reconhece objetos comuns. O Face é para rostos e o Read é para texto.",
        topic: "Visão computacional",
        options: [
            [
                "Criar um projeto de detecção de objetos no Custom Vision com imagens rotuladas dos produtos",
                true,
            ],
            ["Usar a detecção de objetos pré-treinada do Azure AI Vision", false],
            ["Usar o serviço Face para localizar os produtos", false],
            ["Usar o recurso Read para localizar os produtos", false],
        ],
    },
    {
        statement:
            "Ao avaliar o recurso Read do Azure AI Vision, um analista pergunta que tipos de texto ele consegue extrair de imagens. Qual afirmação está correta?",
        explanation:
            "O recurso Read realiza OCR e reconhece texto impresso e manuscrito, retornando o conteúdo textual e sua localização. As demais opções limitam incorretamente as capacidades do recurso.",
        topic: "Visão computacional",
        options: [
            ["Ele extrai tanto texto impresso quanto manuscrito", true],
            ["Ele extrai apenas texto impresso, nunca manuscrito", false],
            ["Ele extrai apenas texto manuscrito, nunca impresso", false],
            ["Ele apenas conta quantas palavras existem, sem extrair o conteúdo", false],
        ],
    },
    {
        statement:
            "Durante uma revisão de conceitos, um estudante pergunta qual a diferença fundamental entre classificação de imagem e segmentação semântica. Qual resposta está correta?",
        explanation:
            "A classificação de imagem gera um rótulo para a imagem como um todo, enquanto a segmentação semântica atribui uma categoria a cada pixel, permitindo delimitar regiões com precisão. As outras opções invertem os conceitos ou descrevem tarefas diferentes, como detecção de objetos, OCR ou detecção facial.",
        topic: "Visão computacional",
        options: [
            [
                "A classificação atribui um rótulo à imagem inteira, enquanto a segmentação semântica classifica cada pixel individualmente",
                true,
            ],
            [
                "A classificação trabalha pixel a pixel, enquanto a segmentação atribui um único rótulo à imagem",
                false,
            ],
            ["Ambas retornam apenas caixas delimitadoras ao redor dos objetos", false],
            ["A classificação lê texto e a segmentação detecta rostos", false],
        ],
    },
    {
        statement:
            "Um leitor de tela para pessoas com deficiência visual precisa gerar automaticamente uma frase que descreva o conteúdo geral de uma foto, como 'uma pessoa andando de bicicleta em um parque'. Qual recurso do Azure AI Vision fornece essa frase?",
        explanation:
            "A descrição, ou caption, do Azure AI Vision gera uma frase em linguagem natural resumindo o conteúdo da imagem, útil para acessibilidade. A detecção de objetos apenas lista itens com coordenadas, o Read extrai texto e a miniatura inteligente recorta a imagem, nenhum produz a frase descritiva.",
        topic: "Visão computacional",
        options: [
            ["A descrição (caption) da imagem", true],
            ["A detecção de objetos", false],
            ["O recurso Read", false],
            ["A geração de miniatura inteligente", false],
        ],
    },
    {
        statement:
            "Ao criar um novo projeto no Custom Vision, você deve escolher o tipo de projeto conforme o objetivo. Quais são os dois tipos de projeto oferecidos pelo Custom Vision? (Selecione DUAS opções.)",
        explanation:
            "O Custom Vision permite criar projetos de classificação de imagem (rótulo para a imagem inteira) e de detecção de objetos (localização com caixas delimitadoras). Segmentação semântica em nível de pixel não é um tipo de projeto do Custom Vision e a identificação facial pertence ao serviço Face.",
        topic: "Visão computacional",
        options: [
            ["Classificação de imagem", true],
            ["Detecção de objetos", true],
            ["Segmentação semântica de pixels", false],
            ["Identificação facial", false],
        ],
    },
    {
        statement:
            "Um banco quer confirmar, no momento do login, se a selfie enviada pelo cliente corresponde à foto de referência que ele cadastrou. Trata-se de comparar dois rostos para dizer se são da mesma pessoa. Que capacidade do serviço Face atende a isso?",
        explanation:
            "A verificação facial compara dois rostos e indica se pertencem à mesma pessoa, exatamente o cenário descrito. A detecção de objetos, a geração de tags e a segmentação semântica não lidam com comparação de identidade facial.",
        topic: "Visão computacional",
        options: [
            ["Verificação facial", true],
            ["Detecção de objetos", false],
            ["Geração de tags", false],
            ["Segmentação semântica", false],
        ],
    },
    {
        statement:
            "Uma vinícola quer um modelo que reconheça os rótulos exclusivos dos seus vinhos a partir de fotos, categorizando cada garrafa por safra e tipo. Esses rótulos não existem em nenhum modelo genérico. Qual serviço deve ser escolhido e por quê?",
        explanation:
            "Como as categorias (safra e tipo dos rótulos exclusivos) são específicas e não constam em modelos prontos, o Custom Vision é o correto, pois permite treinar com as imagens da vinícola. O Azure AI Vision não reconhece rótulos exclusivos automaticamente. O Face é para rostos e o Azure AI Language processa texto, não imagens de rótulos.",
        topic: "Visão computacional",
        options: [
            [
                "Custom Vision, porque as categorias são específicas e exigem treinamento com imagens próprias",
                true,
            ],
            [
                "Azure AI Vision, porque ele reconhece qualquer rótulo de vinho automaticamente",
                false,
            ],
            ["Face, porque é preciso reconhecer padrões visuais", false],
            ["Azure AI Language, porque envolve nomes de vinhos", false],
        ],
    },
    {
        statement:
            "Um sistema de moderação precisa apenas marcar fotos que contenham objetos comuns, como 'carro', 'praia' ou 'comida', usando categorias genéricas amplamente conhecidas. A equipe não quer treinar modelos. Qual serviço atende melhor?",
        explanation:
            "Para objetos e cenas comuns sem treinamento, o Azure AI Vision já oferece tags pré-treinadas, sendo a opção mais rápida e simples. Treinar no Custom Vision seria trabalho desnecessário para categorias genéricas. O Face é para rostos e o Read é para texto, não para marcar objetos comuns.",
        topic: "Visão computacional",
        options: [
            ["Azure AI Vision, com sua geração de tags pré-treinada", true],
            ["Custom Vision, treinando um detector para cada objeto comum", false],
            ["Face, para marcar os objetos comuns", false],
            ["O recurso Read, para marcar os objetos comuns", false],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções quer saber quais tarefas de visão computacional fornecem informação sobre a localização de elementos dentro da imagem, e não apenas um rótulo geral. Quais das tarefas a seguir retornam localização? (Selecione DUAS opções.)",
        explanation:
            "A detecção de objetos indica a posição por meio de caixas delimitadoras e a segmentação semântica localiza elementos em nível de pixel, ambas fornecem localização. A classificação de imagem apenas rotula a imagem toda e a descrição gera uma frase da cena, sem indicar onde os elementos estão.",
        topic: "Visão computacional",
        options: [
            ["Detecção de objetos, que retorna caixas delimitadoras", true],
            ["Segmentação semântica, que classifica cada pixel", true],
            ["Classificação de imagem, que atribui um rótulo à imagem inteira", false],
            ["Geração de descrição, que resume a cena em uma frase", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa apenas contar quantas pessoas aparecem em fotos, detectando a presença de rostos, sem identificar ninguém. Um colega afirma que tanto o Azure AI Vision quanto o serviço Face detectam rostos. Qual afirmação é correta sobre essa escolha?",
        explanation:
            "O Azure AI Vision detecta rostos e retorna suas posições, o que basta para contar pessoas. O serviço Face vai além, com verificação e identificação de pessoas. As demais opções são incorretas: o Custom Vision trata de objetos genéricos, o Azure AI Language processa texto e o serviço Face certamente detecta rostos, além de não ler texto.",
        topic: "Visão computacional",
        options: [
            [
                "O Azure AI Vision consegue detectar rostos e retornar suas posições, enquanto o serviço Face oferece recursos mais avançados, como identificação e verificação",
                true,
            ],
            ["Somente o Custom Vision consegue detectar rostos", false],
            ["Nenhum dos dois consegue detectar rostos, é preciso usar o Azure AI Language", false],
            ["O serviço Face não consegue detectar rostos, apenas ler texto", false],
        ],
    },

    // Domínio 4 - Processamento de linguagem natural
    {
        statement:
            "Uma rede de hotéis quer analisar automaticamente milhares de avaliações de hóspedes para classificar cada comentário como positivo, negativo ou neutro, junto com uma pontuação de confiança. Qual recurso do Azure AI Language atende a essa necessidade?",
        explanation:
            "A análise de sentimento avalia o texto e retorna rótulos (positivo, negativo, neutro ou misto) com pontuações de confiança entre 0 e 1, exatamente o que a rede precisa para classificar as avaliações. A extração de frases-chave apenas lista os principais tópicos, sem julgar o tom. O reconhecimento de entidades nomeadas identifica pessoas, locais e organizações, e a detecção de idioma apenas informa o idioma do texto.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Análise de sentimento", true],
            ["Extração de frases-chave", false],
            ["Reconhecimento de entidades nomeadas", false],
            ["Detecção de idioma", false],
        ],
    },
    {
        statement:
            "Um portal de notícias deseja exibir, ao lado de cada artigo, uma lista curta com os principais assuntos abordados no texto, sem gerar frases novas nem resumos. Qual tarefa de PLN do Azure AI Language é a mais indicada?",
        explanation:
            "A extração de frases-chave identifica e retorna os termos e as expressões mais relevantes de um documento, ideal para destacar os principais assuntos de um artigo. A análise de sentimento mede o tom emocional, a tradução de texto converte o conteúdo para outro idioma e a conversão de fala em texto pertence ao Azure AI Speech e trabalha com áudio, não com texto escrito.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Análise de sentimento", false],
            ["Extração de frases-chave", true],
            ["Tradução de texto", false],
            ["Conversão de fala em texto", false],
        ],
    },
    {
        statement:
            "Um escritório de advocacia precisa varrer contratos e localizar automaticamente nomes de pessoas, empresas, datas e valores monetários mencionados no texto. Qual recurso do Azure AI Language deve ser usado?",
        explanation:
            "O reconhecimento de entidades nomeadas (NER) identifica e categoriza elementos do texto como pessoas, organizações, locais, datas e quantidades, atendendo à necessidade de localizar nomes, empresas, datas e valores. A análise de sentimento mede o tom, a sumarização condensa o documento e a detecção de idioma apenas identifica o idioma predominante.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Reconhecimento de entidades nomeadas (NER)", true],
            ["Análise de sentimento", false],
            ["Sumarização", false],
            ["Detecção de idioma", false],
        ],
    },
    {
        statement:
            "Um serviço de atendimento recebe mensagens de clientes de vários países e precisa identificar automaticamente em qual idioma cada mensagem foi escrita antes de encaminhá-la ao time correto. Qual recurso do Azure AI Language resolve isso?",
        explanation:
            "A detecção de idioma analisa um texto e retorna o idioma identificado, seu código ISO e uma pontuação de confiança, permitindo rotear a mensagem para o time certo. A extração de frases-chave e a análise de sentimento trabalham o conteúdo, não o idioma, e a tradução de fala pertence ao Azure AI Speech e lida com áudio.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Extração de frases-chave", false],
            ["Análise de sentimento", false],
            ["Detecção de idioma", true],
            ["Tradução de fala", false],
        ],
    },
    {
        statement:
            "Uma consultoria quer gerar automaticamente um resumo curto de relatórios longos, selecionando as frases mais importantes do próprio documento para dar aos executivos uma visão rápida. Qual recurso do Azure AI Language é o mais adequado?",
        explanation:
            "A sumarização produz uma versão condensada de um documento longo, na modalidade extrativa selecionando as frases mais relevantes do texto original. A extração de frases-chave retorna apenas termos soltos, e não frases que resumem o documento. O NER identifica entidades e a análise de sentimento mede o tom, e nenhum dos dois gera um resumo.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Sumarização", true],
            ["Extração de frases-chave", false],
            ["Reconhecimento de entidades nomeadas", false],
            ["Análise de sentimento", false],
        ],
    },
    {
        statement:
            "Uma empresa grava reuniões e quer transcrever automaticamente o áudio falado em português para um documento de texto na mesma língua. Qual serviço e recurso do Azure devem ser usados?",
        explanation:
            "A conversão de fala em texto (speech-to-text) do Azure AI Speech transcreve áudio falado em texto no mesmo idioma, atendendo à necessidade de transcrever reuniões em português. A extração de frases-chave trabalha com texto já escrito, a tradução de texto do Translator mudaria o idioma e a conversão de texto em fala faz o caminho inverso, gerando áudio a partir de texto.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Azure AI Speech, conversão de fala em texto", true],
            ["Azure AI Language, extração de frases-chave", false],
            ["Azure AI Translator, tradução de texto", false],
            ["Azure AI Speech, conversão de texto em fala", false],
        ],
    },
    {
        statement:
            "Um aplicativo de acessibilidade precisa ler em voz alta, com uma voz natural, o conteúdo textual exibido na tela para usuários com deficiência visual. Qual recurso do Azure AI Speech deve ser utilizado?",
        explanation:
            "A conversão de texto em fala (text-to-speech) sintetiza áudio com voz natural a partir de um texto, permitindo ler o conteúdo da tela para o usuário. A conversão de fala em texto faz o inverso, transcrevendo áudio. A tradução de fala muda o idioma do áudio e a detecção de idioma é uma tarefa do Azure AI Language.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Conversão de texto em fala (text-to-speech)", true],
            ["Conversão de fala em texto (speech-to-text)", false],
            ["Tradução de fala", false],
            ["Detecção de idioma", false],
        ],
    },
    {
        statement:
            "Uma loja virtual precisa traduzir as descrições dos seus produtos, escritas em português, para inglês, espanhol e francês, mantendo o conteúdo como texto escrito. Qual serviço do Azure é o mais indicado?",
        explanation:
            "O Azure AI Translator faz tradução automática de texto entre mais de uma centena de idiomas, ideal para converter descrições de produtos para vários idiomas de destino. O Azure AI Speech lida com áudio, o Azure AI Language cobre tarefas como sentimento e entidades, mas não tradução, e o Azure AI Vision trata de imagens.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Azure AI Speech", false],
            ["Azure AI Translator", true],
            ["Azure AI Language", false],
            ["Azure AI Vision", false],
        ],
    },
    {
        statement:
            "Durante conferências internacionais, uma organização quer que a fala de um palestrante em inglês seja convertida, em tempo real, em áudio falado em português para a plateia. Qual recurso do Azure AI Speech atende a esse cenário?",
        explanation:
            "A tradução de fala do Azure AI Speech recebe áudio em um idioma e produz a fala traduzida em outro, permitindo levar o palestrante em inglês para a plateia em português. A conversão de fala em texto apenas transcreve no mesmo idioma, a conversão de texto em fala parte de texto escrito e o reconhecimento de locutor identifica quem está falando.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Tradução de fala", true],
            ["Conversão de fala em texto", false],
            ["Conversão de texto em fala", false],
            ["Reconhecimento de locutor", false],
        ],
    },
    {
        statement:
            "Um analista precisa entender a diferença entre transcrever e traduzir. Um áudio gravado em espanhol precisa virar texto também em espanhol, sem mudar de idioma. Qual operação descreve corretamente essa tarefa?",
        explanation:
            "Transcrever significa converter fala em texto mantendo o mesmo idioma, que é o caso de um áudio em espanhol virando texto em espanhol, tarefa da conversão de fala em texto. Traduzir implicaria mudar o idioma, o que não ocorre aqui. A conversão de texto em fala faria o caminho oposto, gerando áudio a partir de texto.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Transcrever, usando conversão de fala em texto", true],
            ["Traduzir, usando o Azure AI Translator", false],
            ["Traduzir, usando tradução de fala", false],
            ["Transcrever, usando conversão de texto em fala", false],
        ],
    },
    {
        statement:
            "Uma equipe está criando um assistente virtual com o Conversational Language Understanding (CLU) do Azure AI Language. Quando um usuário digita 'Quero reservar uma mesa para dois', o assistente precisa identificar que a ação desejada é fazer uma reserva. Qual elemento do CLU representa essa ação desejada?",
        explanation:
            "No CLU, a intenção (intent) representa o objetivo ou a ação que o usuário deseja realizar, como fazer uma reserva. A entidade seria um dado extraído do enunciado, como o número de pessoas. O enunciado (utterance) é a própria frase digitada pelo usuário e frase-chave é uma tarefa distinta, não um elemento do CLU.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Intenção (intent)", true],
            ["Entidade (entity)", false],
            ["Enunciado (utterance)", false],
            ["Frase-chave", false],
        ],
    },
    {
        statement:
            "Ainda no assistente virtual com CLU, no enunciado 'Quero reservar uma mesa para dois', a equipe quer capturar o valor 'dois' como o número de pessoas. Qual elemento do CLU corresponde a esse dado extraído do enunciado?",
        explanation:
            "No CLU, a entidade (entity) é um dado específico extraído do enunciado, como o número de pessoas 'dois', que detalha a intenção. A intenção representa a ação desejada (fazer a reserva), o enunciado é a frase completa do usuário e modelo de linguagem não é um dos elementos que compõem uma definição de CLU.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Intenção (intent)", false],
            ["Entidade (entity)", true],
            ["Enunciado (utterance)", false],
            ["Modelo de linguagem", false],
        ],
    },
    {
        statement:
            "Uma empresa quer detectar informações pessoais identificáveis (PII), como CPF e telefone, dentro de documentos de texto para mascará-las antes de armazenar. Qual serviço do Azure oferece esse recurso de PLN?",
        explanation:
            "O Azure AI Language inclui a detecção de informações pessoais (PII), capaz de localizar e mascarar dados como documentos e telefones em texto. O Azure AI Speech trata de áudio, o Azure AI Translator faz tradução e o Azure AI Bot Service é uma plataforma para construir bots, não um serviço de análise de texto.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Azure AI Language", true],
            ["Azure AI Speech", false],
            ["Azure AI Translator", false],
            ["Azure AI Bot Service", false],
        ],
    },
    {
        statement:
            "Ao enviar um trecho de texto para a detecção de idioma do Azure AI Language, o serviço retorna um único idioma como resultado, mesmo quando o texto mistura palavras de línguas diferentes. Qual afirmação descreve esse comportamento corretamente?",
        explanation:
            "A detecção de idioma avalia o texto como um todo e retorna o idioma predominante, acompanhado do nome, do código ISO e de uma pontuação de confiança. Ela não retorna um idioma por palavra nem traduz o texto. Quando não consegue identificar, retorna '(Unknown)', mas isso não acontece apenas por haver mistura de idiomas.",
        topic: "Processamento de linguagem natural",
        options: [
            [
                "O serviço retorna o idioma predominante, com o nome, o código ISO e uma pontuação de confiança",
                true,
            ],
            ["O serviço retorna todos os idiomas encontrados, um para cada palavra", false],
            ["O serviço traduz automaticamente o texto para o inglês", false],
            ["O serviço retorna apenas 'desconhecido' sempre que há mais de um idioma", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados vai usar o Azure AI Language para enriquecer avaliações de clientes. Quais das tarefas a seguir são recursos de processamento de linguagem natural oferecidos por esse serviço? (Selecione DUAS opções.)",
        explanation:
            "A análise de sentimento e o reconhecimento de entidades nomeadas são tarefas de PLN do Azure AI Language, usadas para medir o tom e extrair pessoas, locais e organizações do texto. A conversão de texto em fala pertence ao Azure AI Speech e a tradução automática entre idiomas é função do Azure AI Translator.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Análise de sentimento", true],
            ["Reconhecimento de entidades nomeadas", true],
            ["Conversão de texto em fala", false],
            ["Tradução automática de texto entre idiomas", false],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está avaliando o Azure AI Speech para um projeto de call center. Quais recursos a seguir fazem parte desse serviço? (Selecione DUAS opções.)",
        explanation:
            "A conversão de fala em texto e a conversão de texto em fala são recursos centrais do Azure AI Speech, que transcreve áudio e sintetiza voz. A extração de frases-chave e a detecção de idioma de um texto são tarefas do Azure AI Language, que trabalha com texto escrito e não com áudio.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Conversão de fala em texto", true],
            ["Conversão de texto em fala", true],
            ["Extração de frases-chave", false],
            ["Detecção de idioma de um texto", false],
        ],
    },
    {
        statement:
            "Uma empresa global vai adotar o Azure AI Translator nos seus fluxos de conteúdo. Quais afirmações sobre esse serviço estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Azure AI Translator traduz texto entre mais de uma centena de idiomas e oferece tradução de documentos preservando o layout e a formatação do original. Transcrever áudio é tarefa do Azure AI Speech e medir sentimento é uma capacidade do Azure AI Language, não do Translator.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Ele traduz texto entre mais de uma centena de idiomas", true],
            ["Ele oferece tradução de documentos preservando a formatação", true],
            ["Ele transcreve o áudio de reuniões em texto", false],
            ["Ele mede o sentimento positivo ou negativo do texto", false],
        ],
    },
    {
        statement:
            "Depois de enviar uma avaliação para a análise de sentimento do Azure AI Language, a aplicação recebe um rótulo geral e três pontuações associadas ao texto. O que essas três pontuações representam?",
        explanation:
            "A análise de sentimento retorna um rótulo geral e pontuações de confiança para positivo, neutro e negativo, cada uma variando de 0 a 1 e com soma próxima de 1. Elas não contam palavras, não representam traduções nem frases-chave, que são resultados de outras tarefas de PLN.",
        topic: "Processamento de linguagem natural",
        options: [
            [
                "A confiança de que o texto é positivo, neutro e negativo, cada uma entre 0 e 1",
                true,
            ],
            ["O número de palavras positivas, neutras e negativas encontradas", false],
            ["As três traduções mais prováveis do texto", false],
            ["As três frases-chave mais relevantes do texto", false],
        ],
    },
    {
        statement:
            "Ao treinar um modelo de Conversational Language Understanding (CLU), uma equipe fornece vários exemplos de frases que os usuários poderiam dizer e, para cada uma, indica a intenção correspondente e rotula os dados relevantes. Como se chamam essas frases de exemplo usadas no treinamento?",
        explanation:
            "No CLU, os enunciados (utterances) são os exemplos de frases que os usuários podem dizer e que alimentam o treinamento do modelo. Cada enunciado é associado a uma intenção (a ação desejada) e pode ter entidades rotuladas (dados extraídos), mas o termo que designa as próprias frases de exemplo é enunciado.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Enunciados (utterances)", true],
            ["Intenções (intents)", false],
            ["Entidades (entities)", false],
            ["Pontuações de confiança", false],
        ],
    },
    {
        statement:
            "Um aplicativo de mensagens de texto precisa permitir que usuários que escrevem em japonês conversem por escrito com usuários que escrevem em português, traduzindo as mensagens digitadas em tempo real. Nenhum áudio está envolvido. Qual serviço do Azure é o mais indicado?",
        explanation:
            "Como o cenário envolve apenas texto escrito sendo convertido de um idioma para outro, o Azure AI Translator é o serviço adequado para traduzir as mensagens em tempo real. O Azure AI Speech só seria necessário se houvesse áudio, o Azure AI Language cobre análise de texto mas não tradução e o Azure Machine Learning é uma plataforma genérica de ML, não um serviço pronto de tradução.",
        topic: "Processamento de linguagem natural",
        options: [
            ["Azure AI Translator", true],
            ["Azure AI Speech", false],
            ["Azure AI Language", false],
            ["Azure Machine Learning", false],
        ],
    },

    // Domínio 5 - IA generativa
    {
        statement:
            "Uma equipe está avaliando diferentes abordagens de IA. Qual característica distingue a IA generativa das abordagens tradicionais de aprendizado de máquina?",
        explanation:
            "A IA generativa cria conteúdo original e inédito, como texto, imagens, áudio e código, a partir dos padrões aprendidos. As abordagens tradicionais costumam classificar dados, prever valores ou detectar anomalias, sem produzir conteúdo novo.",
        topic: "IA generativa",
        options: [
            ["Ela gera conteúdo novo e original, como texto, imagens e código", true],
            ["Ela apenas classifica dados existentes em categorias predefinidas", false],
            ["Ela se limita a prever valores numéricos com base em dados históricos", false],
            ["Ela detecta anomalias em conjuntos de dados sem produzir saídas", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma solução que redija rascunhos de e-mails, resuma documentos e sugira código para os desenvolvedores. Qual carga de trabalho de IA melhor descreve essa necessidade?",
        explanation:
            "Redigir textos, resumir documentos e sugerir código são tarefas de geração de conteúdo novo, características da IA generativa. Visão computacional analisa imagens, a detecção de anomalias identifica desvios e a mineração de conhecimento extrai informações de documentos, mas nenhuma gera conteúdo original.",
        topic: "IA generativa",
        options: [
            ["IA generativa", true],
            ["Visão computacional", false],
            ["Detecção de anomalias", false],
            ["Mineração de conhecimento", false],
        ],
    },
    {
        statement:
            "Um analista lista exemplos de saídas que modelos de IA generativa podem produzir. Quais das opções a seguir são exemplos válidos de conteúdo gerado por IA generativa? (Selecione DUAS opções.)",
        explanation:
            "Modelos de IA generativa produzem conteúdo original, como imagens criadas a partir de uma descrição textual e trechos de código-fonte. Ajustar o brilho de uma foto existente e ordenar uma planilha são operações determinísticas de edição e organização, não geração de conteúdo novo.",
        topic: "IA generativa",
        options: [
            ["Uma imagem inédita criada a partir de uma descrição em linguagem natural", true],
            ["Um trecho de código-fonte gerado a partir de uma instrução do desenvolvedor", true],
            ["O ajuste automático de brilho e contraste de uma foto já existente", false],
            ["A ordenação alfabética das linhas de uma planilha", false],
        ],
    },
    {
        statement:
            "Ao explicar a base dos serviços de IA generativa de texto, um instrutor menciona os LLMs. O que é um modelo de linguagem grande (LLM)?",
        explanation:
            "Um LLM é um modelo treinado com enormes volumes de texto que aprende padrões da linguagem para entender e gerar texto em linguagem natural. Ele não é um banco de dados relacional, nem uma regra fixa de tradução, nem uma planilha de estatísticas de palavras.",
        topic: "IA generativa",
        options: [
            [
                "Um modelo treinado com grandes volumes de texto para entender e gerar linguagem natural",
                true,
            ],
            ["Um banco de dados relacional otimizado para consultas de texto", false],
            ["Um conjunto fixo de regras de tradução entre dois idiomas", false],
            ["Uma planilha que armazena estatísticas de frequência de palavras", false],
        ],
    },
    {
        statement:
            "Um material de estudo afirma que os LLMs modernos, como os da família GPT, são construídos sobre uma arquitetura específica de rede neural. Qual arquitetura é a base desses modelos?",
        explanation:
            "Os LLMs modernos se baseiam na arquitetura transformer, que usa mecanismos de atenção para pesar a importância das palavras no contexto. Redes convolucionais são típicas de imagens, e árvores de decisão e regressão linear são modelos clássicos que não sustentam LLMs.",
        topic: "IA generativa",
        options: [
            ["A arquitetura transformer, baseada em mecanismos de atenção", true],
            ["A rede neural convolucional (CNN)", false],
            ["A árvore de decisão", false],
            ["A regressão linear", false],
        ],
    },
    {
        statement:
            "Ao configurar chamadas ao Azure OpenAI Service, uma desenvolvedora percebe que o custo e os limites são medidos em tokens. No contexto de LLMs, o que é um token?",
        explanation:
            "Um token é uma unidade de texto, como uma palavra ou parte de uma palavra, na qual o texto é dividido para ser processado pelo modelo. Não é a chave de autenticação da API, nem um parâmetro de aleatoriedade, nem um registro de log.",
        topic: "IA generativa",
        options: [
            [
                "Uma unidade de texto, como uma palavra ou parte de uma palavra, processada pelo modelo",
                true,
            ],
            ["A chave secreta usada para autenticar as chamadas à API", false],
            ["Um parâmetro que controla a aleatoriedade das respostas", false],
            ["Um registro de auditoria de cada requisição feita ao modelo", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa comparar a semelhança de significado entre milhares de trechos de texto para uma busca semântica. Qual recurso de IA generativa representa o texto como vetores numéricos que capturam significado?",
        explanation:
            "Embeddings são representações vetoriais numéricas que capturam o significado semântico do texto, de modo que textos com sentido parecido ficam próximos no espaço vetorial. Tokens são unidades de texto, prompts são as instruções de entrada e completions são as respostas geradas.",
        topic: "IA generativa",
        options: [
            ["Embeddings", true],
            ["Tokens", false],
            ["Prompts", false],
            ["Completions", false],
        ],
    },
    {
        statement:
            "Em uma interação com um modelo GPT, o usuário digita uma instrução e o modelo devolve um texto gerado. Como se chamam, respectivamente, a instrução de entrada e a resposta produzida pelo modelo?",
        explanation:
            "O prompt é a instrução ou entrada fornecida ao modelo, e a completion é a resposta gerada por ele. Token e embedding são conceitos de processamento interno, não os nomes da entrada e da saída da interação.",
        topic: "IA generativa",
        options: [
            ["Prompt e completion", true],
            ["Completion e prompt", false],
            ["Token e embedding", false],
            ["Embedding e token", false],
        ],
    },
    {
        statement:
            "A Microsoft descreve várias de suas soluções como copilots. No contexto de IA generativa, o que caracteriza um copilot?",
        explanation:
            "Um copilot é um assistente baseado em IA generativa integrado a um aplicativo para ajudar o usuário a criar conteúdo, obter respostas e realizar tarefas com apoio de linguagem natural. Não é um antivírus, nem um substituto autônomo do usuário sem qualquer supervisão, nem um corretor ortográfico de regras fixas.",
        topic: "IA generativa",
        options: [
            [
                "Um assistente baseado em IA generativa integrado a aplicativos para apoiar o usuário",
                true,
            ],
            ["Um antivírus que monitora ameaças de segurança em tempo real", false],
            ["Um sistema que substitui completamente o usuário sem qualquer supervisão", false],
            ["Um corretor ortográfico baseado apenas em regras fixas", false],
        ],
    },
    {
        statement:
            "Uma pessoa desenvolvedora quer sugestões de código e funções completas geradas diretamente no editor a partir de comentários e do contexto do arquivo. Qual copilot é voltado especificamente para esse cenário?",
        explanation:
            "O GitHub Copilot é o assistente de IA generativa voltado a desenvolvedores, sugerindo código e funções no editor a partir do contexto e de comentários. O Microsoft Copilot é um assistente de produtividade geral, e as demais opções nem sequer são copilots de codificação.",
        topic: "IA generativa",
        options: [
            ["GitHub Copilot", true],
            ["Azure Monitor", false],
            ["Power BI", false],
            ["Azure Backup", false],
        ],
    },
    {
        statement:
            "Uma organização quer usar modelos da OpenAI, como o GPT, com a segurança, a conformidade e o suporte empresarial do Azure. Qual serviço atende diretamente a essa necessidade?",
        explanation:
            "O Azure OpenAI Service disponibiliza modelos da OpenAI, como GPT, embeddings e DALL-E, com a governança, a segurança e a escala do Azure. O Azure AI Search faz busca, o Azure Machine Learning treina modelos personalizados e o Azure AI Vision analisa imagens.",
        topic: "IA generativa",
        options: [
            ["Azure OpenAI Service", true],
            ["Azure AI Search", false],
            ["Azure Machine Learning", false],
            ["Azure AI Vision", false],
        ],
    },
    {
        statement:
            "Ao escolher um modelo no Azure OpenAI Service para alimentar um chatbot de atendimento que conversa em linguagem natural, qual família de modelos é a mais adequada?",
        explanation:
            "Os modelos da família GPT são otimizados para entender e gerar linguagem natural, sendo a base de experiências de chat e geração de texto. Os modelos de embeddings geram vetores, o DALL-E gera imagens e o Whisper transcreve áudio.",
        topic: "IA generativa",
        options: [
            ["Modelos GPT", true],
            ["Modelos de embeddings", false],
            ["Modelo DALL-E", false],
            ["Modelo Whisper", false],
        ],
    },
    {
        statement:
            "Uma agência de marketing quer gerar imagens originais a partir de descrições textuais, como 'um gato astronauta em aquarela'. Qual modelo do Azure OpenAI Service atende a esse objetivo?",
        explanation:
            "O DALL-E é o modelo do Azure OpenAI Service voltado à geração de imagens a partir de descrições em linguagem natural. Os modelos GPT geram texto, os de embeddings geram vetores numéricos e o Whisper faz transcrição de fala.",
        topic: "IA generativa",
        options: [
            ["DALL-E", true],
            ["GPT", false],
            ["Embeddings", false],
            ["Whisper", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa converter documentos em vetores numéricos para viabilizar uma busca por similaridade semântica. Qual família de modelos do Azure OpenAI Service é indicada para gerar esses vetores?",
        explanation:
            "Os modelos de embeddings convertem texto em vetores numéricos que capturam significado, viabilizando busca semântica e comparação de similaridade. GPT gera texto, DALL-E gera imagens e o Whisper transcreve fala, nenhum deles com essa finalidade principal.",
        topic: "IA generativa",
        options: [
            ["Modelos de embeddings", true],
            ["Modelos GPT", false],
            ["Modelo DALL-E", false],
            ["Modelo Whisper para transcrição de fala", false],
        ],
    },
    {
        statement:
            "Uma arquiteta lista as capacidades disponíveis no Azure OpenAI Service. Quais das opções a seguir correspondem a famílias de modelos oferecidas pelo serviço? (Selecione DUAS opções.)",
        explanation:
            "O Azure OpenAI Service oferece, entre outros, os modelos GPT para geração de texto e chat e o DALL-E para geração de imagens. Máquinas virtuais e redes de entrega de conteúdo são serviços de infraestrutura do Azure, não famílias de modelos de IA generativa.",
        topic: "IA generativa",
        options: [
            ["Modelos GPT para geração de texto e chat", true],
            ["Modelo DALL-E para geração de imagens", true],
            ["Máquinas virtuais para hospedar aplicações web", false],
            ["Rede de entrega de conteúdo (CDN) para distribuir arquivos", false],
        ],
    },
    {
        statement:
            "Uma equipe quer uma plataforma unificada para explorar um catálogo de modelos, testar prompts em um playground e avaliar, implantar e gerenciar aplicações de IA generativa e copilots. Qual solução do Azure atende a esse propósito?",
        explanation:
            "O Azure AI Foundry é a plataforma para construir, personalizar, avaliar, implantar e gerenciar aplicações de IA generativa e copilots, incluindo catálogo de modelos e playground. O Azure OpenAI Service fornece os modelos, mas o Foundry é o ambiente de desenvolvimento e gestão dessas soluções.",
        topic: "IA generativa",
        options: [
            ["Azure AI Foundry", true],
            ["Azure DevOps", false],
            ["Azure Logic Apps", false],
            ["Azure Blob Storage", false],
        ],
    },
    {
        statement:
            "As respostas de um modelo GPT estão vagas e fora do formato desejado. Uma desenvolvedora decide melhorar as instruções, adicionando contexto, exemplos e o formato esperado da saída. Como se chama essa prática?",
        explanation:
            "Engenharia de prompt é a prática de elaborar e refinar as instruções enviadas ao modelo, com contexto, exemplos e formato desejado, para obter respostas melhores. O fine-tuning altera os pesos do modelo com dados adicionais, o grounding fornece dados de contexto e a tokenização apenas divide o texto em tokens.",
        topic: "IA generativa",
        options: [
            ["Engenharia de prompt", true],
            ["Fine-tuning (ajuste fino)", false],
            ["Tokenização", false],
            ["Normalização de dados", false],
        ],
    },
    {
        statement:
            "Para orientar o comportamento de um modelo de chat, uma desenvolvedora inclui na conversa alguns exemplos de perguntas e respostas no formato desejado antes da pergunta real do usuário. Qual técnica de engenharia de prompt ela está aplicando?",
        explanation:
            "Fornecer alguns exemplos no próprio prompt para orientar o modelo é a técnica de few-shot (poucos exemplos). Zero-shot não fornece exemplos, o grounding adiciona dados de contexto factual e o fine-tuning reteina o modelo com um conjunto de dados.",
        topic: "IA generativa",
        options: [
            ["Few-shot (fornecer poucos exemplos no prompt)", true],
            ["Zero-shot (não fornecer nenhum exemplo)", false],
            ["Fine-tuning (reteinar o modelo com um conjunto de dados)", false],
            ["Redução de dimensionalidade", false],
        ],
    },
    {
        statement:
            "Para reduzir respostas inventadas, uma equipe passa a incluir no prompt informações confiáveis e específicas do domínio para que o modelo baseie a resposta nesses dados. Como se chama essa técnica?",
        explanation:
            "Grounding é fornecer ao modelo dados de contexto confiáveis para que a resposta se baseie neles, reduzindo alucinações. Não se trata de aumentar a temperatura, de tokenizar o texto nem de comprimir o modelo.",
        topic: "IA generativa",
        options: [
            ["Grounding (fundamentar a resposta com dados de contexto)", true],
            ["Aumentar a temperatura do modelo", false],
            ["Tokenização do prompt", false],
            ["Quantização do modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que o chatbot responda usando os documentos internos atualizados da própria organização, recuperando trechos relevantes de uma base de conhecimento e adicionando-os ao prompt antes da geração. Qual abordagem descreve esse padrão?",
        explanation:
            "A Geração Aumentada por Recuperação (RAG) recupera trechos relevantes de uma fonte de dados, muitas vezes via busca vetorial, e os adiciona ao prompt para fundamentar a resposta em dados atuais e próprios. O fine-tuning reescreve os pesos do modelo, e as demais opções não descrevem esse fluxo.",
        topic: "IA generativa",
        options: [
            ["RAG (Geração Aumentada por Recuperação)", true],
            ["Fine-tuning completo do modelo base", false],
            ["Aumento de dados (data augmentation) de imagens", false],
            ["Balanceamento de carga entre modelos", false],
        ],
    },
    {
        statement:
            "Um modelo de linguagem responde com uma citação de aparência convincente, mas que na verdade não existe e está factualmente incorreta. Como esse comportamento é chamado no contexto da IA generativa?",
        explanation:
            "Alucinação é quando o modelo gera conteúdo plausível, porém falso ou sem base factual. Viés se refere a padrões injustos aprendidos dos dados, overfitting é um problema de treinamento e latência é o tempo de resposta, nenhum descreve uma resposta inventada.",
        topic: "IA generativa",
        options: [
            ["Alucinação", true],
            ["Viés (bias)", false],
            ["Overfitting (sobreajuste)", false],
            ["Latência", false],
        ],
    },
    {
        statement:
            "Um modelo de IA generativa passa a produzir respostas que favorecem sistematicamente um grupo e desfavorecem outro, refletindo desigualdades presentes nos dados de treinamento. Qual risco de IA generativa esse cenário ilustra?",
        explanation:
            "Viés ocorre quando o modelo reproduz e amplifica desigualdades presentes nos dados de treinamento, gerando saídas injustas. Alucinação é a invenção de fatos, e as outras opções não descrevem esse tipo de problema ético.",
        topic: "IA generativa",
        options: [
            ["Viés (bias) nos resultados do modelo", true],
            ["Alucinação de fatos inexistentes", false],
            ["Perda de pacotes na rede", false],
            ["Expiração da chave de API", false],
        ],
    },
    {
        statement:
            "Uma organização precisa detectar e bloquear conteúdo de ódio, sexual, violento e de automutilação tanto nas entradas quanto nas respostas de um modelo. Qual recurso do Azure OpenAI Service atende a esse requisito?",
        explanation:
            "Os filtros de conteúdo do Azure OpenAI Service analisam prompts e respostas em categorias como ódio, sexual, violência e automutilação, com níveis de severidade configuráveis, bloqueando conteúdo nocivo. Nenhum dos outros recursos citados executa essa moderação.",
        topic: "IA generativa",
        options: [
            ["Filtros de conteúdo (content filters)", true],
            ["Regras de firewall de rede", false],
            ["Cache de respostas do modelo", false],
            ["Compactação de tokens", false],
        ],
    },
    {
        statement:
            "Uma equipe quer implantar uma solução de IA generativa seguindo boas práticas de IA responsável. Quais das medidas a seguir estão alinhadas a esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "Aplicar filtros de conteúdo para reduzir saídas nocivas e manter supervisão humana sobre decisões sensíveis são práticas centrais de IA generativa responsável. Publicar as chaves de API no código público e desativar toda a moderação para acelerar respostas contrariam diretamente esses princípios.",
        topic: "IA generativa",
        options: [
            ["Aplicar filtros de conteúdo para reduzir saídas nocivas", true],
            ["Manter supervisão humana sobre decisões sensíveis", true],
            ["Publicar as chaves de API no código-fonte público", false],
            ["Desativar toda a moderação para acelerar as respostas", false],
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
                name: "Microsoft Azure AI Fundamentals (AI-900)",
                provider: "azure",
                code: "AI-900",
                level: "Fundamental",
                description:
                    "Simulado no formato da prova AI-900: 60 minutos, corte de 70%. Mistura resposta única e múltipla.",
                durationMinutes: 60,
                questionCount: 50,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    // Mantém provedor, código e nível em dia mesmo se o simulado já existia.
    await db
        .update(simulados)
        .set({ provider: "azure", code: "AI-900", level: "Fundamental" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
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
    console.log(`Seed concluído: ${QUESTOES.length} questões inseridas.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
