// Preenche os campos da tela de detalhe da trilha:
//  - what_you_learn e prerequisites (autorados por trilha, no mapa DETALHES);
//  - duration_min de cada aula (estimativa de tempo de leitura dos blocos + quiz);
//  - preview = true na primeira aula de cada trilha (deixa espiar sem estar inscrito).
// Idempotente: sempre reescreve os valores. Trilha fora do mapa fica sem what/prereq
// (a tela simplesmente nao mostra essas secoes), mas ainda recebe duracao e preview.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-detalhes-trilhas.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions } from "../schema.ts";
import { eq, asc, inArray, count } from "drizzle-orm";

const DETALHES: Record<string, { whatYouLearn: string[]; prerequisites: string[] }> = {
    "Lógica de Programação": {
        whatYouLearn: [
            "Pensar em algoritmos e resolver problemas passo a passo",
            "Variáveis, tipos de dados e operadores",
            "Condicionais, laços e repetição",
            "Funções, coleções e um mini-projeto do zero",
        ],
        prerequisites: ["Nenhum: é o ponto de partida, só vontade de aprender"],
    },
    Python: {
        whatYouLearn: [
            "Escrever e rodar código Python do zero",
            "Tipos, strings, controle de fluxo e estruturas de dados",
            "Funções, módulos e a biblioteca padrão",
            "Ler arquivos e CSV, tratar erros, e a ponte pra dados",
        ],
        prerequisites: ["Lógica de programação (algoritmos, laços, condicionais)"],
    },
    TypeScript: {
        whatYouLearn: [
            "Por que tipos existem e como o TypeScript checa antes de rodar",
            "União e narrowing, interfaces, generics e restrições",
            "Utility types, conditional e mapped types, e quando parar",
            "Validação na fronteira, configuração do compilador e migração",
        ],
        prerequisites: ["JavaScript (funções, objetos, módulos e assíncrono)"],
    },
    React: {
        whatYouLearn: [
            "JSX, componentes, props e estado com useState e useReducer",
            "Efeitos, e os quatro casos em que não se deve usar efeito",
            "Composição, hooks próprios, context e as Actions do React 19",
            "Desempenho com o React Compiler, testes e Server Components",
        ],
        prerequisites: ["JavaScript moderno (arrow functions, destructuring, módulos)"],
    },
    "Spring Boot": {
        whatYouLearn: [
            "Injeção de dependência, auto-configuração e starters",
            "REST com validação, tratamento de erros e paginação",
            "JPA com relacionamentos, transações, migrations e o N+1",
            "Security com JWT, testes com Testcontainers e observabilidade",
        ],
        prerequisites: ["Java (orientação a objetos, coleções e exceções)", "Noções de HTTP e SQL"],
    },
    PHP: {
        whatYouLearn: [
            "Sintaxe, tipos e strings do PHP 8.5",
            "Arrays, funções, controle de fluxo e o pipe operator",
            "Orientação a objetos com enums, readonly e traits",
            "PHP na web: formulários, sessões, PDO e autoload PSR-4",
        ],
        prerequisites: ["Lógica de programação (algoritmos, laços, condicionais)"],
    },
    Ruby: {
        whatYouLearn: [
            "A sintaxe do Ruby 4.0, onde tudo é objeto",
            "Coleções, Enumerable, blocos e pattern matching",
            "Classes, módulos, mixins e duck typing",
            "Exceções, testes com Minitest e RSpec, e o Ruby moderno",
        ],
        prerequisites: ["Lógica de programação (algoritmos, laços, condicionais)"],
    },
    Laravel: {
        whatYouLearn: [
            "Rotas, controllers, validação e Blade com componentes",
            "Eloquent: migrations, relacionamentos e como evitar o N+1",
            "Autenticação com passkeys, gates, policies e APIs com Sanctum",
            "Filas, cache, testes com Pest e as novidades do Laravel 13",
        ],
        prerequisites: ["PHP (orientação a objetos e composer)", "Noções de HTTP e SQL"],
    },
    "Ruby on Rails": {
        whatYouLearn: [
            "Rotas REST, controllers, views em ERB e o ciclo da requisição",
            "Active Record: migrations, associações, escopos e validações",
            "Hotwire com Turbo e Stimulus, sem virar dois projetos",
            "Jobs e cache com a Solid Trifecta, testes e deploy com Kamal",
        ],
        prerequisites: ["Ruby (classes, blocos e gems)", "Noções de HTTP e SQL"],
    },
    "Estatística e Probabilidade": {
        whatYouLearn: [
            "Estatística descritiva: média, mediana, desvio e distribuições",
            "Probabilidade, amostragem e o Teorema Central do Limite",
            "Inferência: intervalos de confiança e teste de hipótese",
            "Correlação e por que ela não é causalidade",
        ],
        prerequisites: ["Python básico", "Matemática do ensino médio"],
    },
    "Análise de Dados": {
        whatYouLearn: [
            "Manipular dados com NumPy e pandas",
            "Carregar, filtrar, ordenar e agrupar (groupby)",
            "Limpar dados: faltantes, tipos, duplicatas e outliers",
            "Juntar tabelas com merge e um fluxo de análise completo",
        ],
        prerequisites: [
            "Python (estruturas de dados, funções)",
            "Noções de estatística descritiva",
        ],
    },
    "Visualização de Dados": {
        whatYouLearn: [
            "Escolher o gráfico certo para cada tipo de dado",
            "Criar visualizações com matplotlib e seaborn",
            "Análise exploratória visual (EDA)",
            "Storytelling com dados e os gráficos que enganam",
        ],
        prerequisites: ["Python (pandas)", "Noções de estatística descritiva"],
    },
    "Machine Learning": {
        whatYouLearn: [
            "O fluxo de um projeto de machine learning",
            "Regressão e classificação com scikit-learn",
            "Avaliar modelos e evitar o overfitting",
            "Preparar dados e o aprendizado não supervisionado",
        ],
        prerequisites: ["Análise de dados (pandas)", "Estatística e probabilidade"],
    },
    "Machine Learning na Prática": {
        whatYouLearn: [
            "Feature engineering e ajuste de hiperparâmetros",
            "Ensembles: random forest e boosting",
            "Pipelines robustos e dados desbalanceados",
            "Uma introdução a deep learning",
        ],
        prerequisites: ["Machine Learning (scikit-learn, avaliação de modelos)"],
    },
    "Do Modelo ao Produto": {
        whatYouLearn: [
            "Do notebook à produção e o que é MLOps",
            "Servir um modelo com uma API e empacotar com Docker",
            "Monitorar o modelo, o drift e o retreino",
            "Ética e IA responsável",
        ],
        prerequisites: ["Machine Learning na Prática", "Noções de Docker e APIs ajudam"],
    },
    "Protocolos da Web": {
        whatYouLearn: [
            "Como a web funciona: cliente-servidor e o ciclo de uma requisição",
            "HTTP: métodos, cabeçalhos e códigos de status",
            "REST e o design de APIs",
            "URLs, cookies e o básico de HTTPS",
        ],
        prerequisites: ["Lógica de programação"],
    },
    "APIs e Frameworks": {
        whatYouLearn: [
            "Construir uma API REST com Node.js e Express",
            "Rotas, middleware e validação de dados",
            "Tratamento de erros e estrutura de projeto",
            "Um CRUD completo de ponta a ponta",
        ],
        prerequisites: ["Lógica de programação", "Protocolos da web (HTTP, REST)"],
    },
    "Banco de Dados": {
        whatYouLearn: [
            "Modelo relacional e SQL do zero",
            "Modelagem com relacionamentos e chaves",
            "PostgreSQL na prática e conexão segura",
            "O papel dos ORMs",
        ],
        prerequisites: ["Lógica de programação"],
    },
    Autenticação: {
        whatYouLearn: [
            "Hash de senha com bcrypt e por que nunca guardar senha em texto",
            "Sessões, cookies e tokens JWT",
            "Autorização por papéis (RBAC) e falhas comuns como IDOR",
            "OAuth e login social",
        ],
        prerequisites: ["APIs e Frameworks (Express, rotas)", "Banco de dados"],
    },
    "Cache, Filas e Performance": {
        whatYouLearn: [
            "Medir e melhorar a performance do back-end",
            "Cache com Redis e estratégias de invalidação",
            "Filas e processamento assíncrono com workers",
            "Como escalar sob carga",
        ],
        prerequisites: ["APIs e Frameworks", "Banco de dados"],
    },
    "Fundamentos de QA": {
        whatYouLearn: [
            "O papel de QA, os princípios e o processo de teste",
            "Níveis e tipos: funcionais, não funcionais e regressão",
            "Técnicas: partição, valor limite, tabela de decisão e exploratório",
            "Casos, defeitos, critérios de aceitação e QA em times ágeis",
        ],
        prerequisites: ["Nenhum: é a porta de entrada da área"],
    },
    "Testes e Qualidade": {
        whatYouLearn: [
            "Testes unitários e de integração com Vitest",
            "Mocks, TDD e cobertura de código",
            "Testar uma API de ponta a ponta",
            "Qualidade além dos testes: lint, tipos e review",
        ],
        prerequisites: ["APIs e Frameworks (uma app pra testar)"],
    },
    "AZURE AZ-104": {
        whatYouLearn: [
            "A hierarquia do Azure e as ferramentas do administrador",
            "Identidades no Entra ID, RBAC, Azure Policy, bloqueios e custos",
            "Armazenamento, máquinas virtuais, contêineres e App Service",
            "Rede virtual com NSG e peering, monitoramento, backup e Site Recovery",
        ],
        prerequisites: [
            "AZURE AZ-900 ou noções de nuvem",
            "Familiaridade com portal, Azure CLI ou PowerShell",
        ],
    },
    "ISTQB CTFL": {
        whatYouLearn: [
            "O vocabulário exato que a prova cobra e os sete princípios de teste",
            "Níveis, tipos, teste estático e revisões pelo syllabus v4.0",
            "Técnicas de caixa-preta e de caixa-branca com exercícios de aplicação",
            "Gestão do teste: risco, estimativa, métricas e ferramentas",
        ],
        prerequisites: ["Nenhum: a prova é de nível fundamental"],
    },
    "Testes E2E com Cypress e Playwright": {
        whatYouLearn: [
            "Escolher entre Cypress e Playwright e escrever o primeiro teste",
            "Seletores que não quebram e espera por condição, sem pausa fixa",
            "Interceptar e simular rede, autenticar e preparar dados por atalho",
            "Organizar a suíte, rodar no pipeline e combater testes instáveis",
        ],
        prerequisites: [
            "Testes e Qualidade (automação de unidade e integração)",
            "JavaScript básico",
        ],
    },
    "Docker e Containers": {
        whatYouLearn: [
            "O que são containers e por que usá-los",
            "Escrever um Dockerfile e construir imagens",
            "Volumes e Docker Compose pra orquestrar serviços",
            "Imagens enxutas e seguras a caminho do deploy",
        ],
        prerequisites: ["APIs e Frameworks", "Banco de dados"],
    },
    "CI/CD e Cloud": {
        whatYouLearn: [
            "Integração contínua rodando testes a cada push",
            "GitHub Actions na prática",
            "Build e publicação de imagens, e deploy contínuo",
            "Onde a aplicação roda na nuvem, com HTTPS e observabilidade",
        ],
        prerequisites: ["Docker e containers", "Testes e qualidade"],
    },
    "Arquitetura e Escala": {
        whatYouLearn: [
            "Escala vertical e horizontal, e o monólito com réplicas stateless",
            "Banco em escala: réplicas de leitura e cache",
            "Comunicação assíncrona e mensageria",
            "De monólito a serviços e padrões de resiliência",
        ],
        prerequisites: ["O caminho de back-end (APIs, banco, cache, deploy)"],
    },
    JavaScript: {
        whatYouLearn: [
            "A sintaxe e os tipos do JavaScript moderno",
            "Funções, objetos, arrays e seus métodos",
            "Assíncrono: callbacks, promises e async/await",
            "Manipular o DOM e eventos no navegador",
        ],
        prerequisites: ["Lógica de programação"],
    },
    HTML: {
        whatYouLearn: [
            "Estruturar páginas com HTML semântico",
            "Textos, links, imagens, listas e tabelas",
            "Formulários e seus controles",
            "Boas práticas de acessibilidade",
        ],
        prerequisites: ["Nenhum: um ótimo primeiro passo no front-end"],
    },
    CSS: {
        whatYouLearn: [
            "Estilizar páginas: cores, tipografia e o box model",
            "Layout com Flexbox e Grid",
            "Design responsivo com media queries",
            "Transições e um toque de animação",
        ],
        prerequisites: ["HTML"],
    },
    "UI/UX Design": {
        whatYouLearn: [
            "Princípios de usabilidade e design de interface",
            "Hierarquia visual, tipografia, cor e espaçamento",
            "O processo de UX: pesquisa, wireframe e protótipo",
            "Design systems e acessibilidade",
        ],
        prerequisites: ["Nenhum: uma porta de entrada para produto e front-end"],
    },
    "Fundamentos de Cibersegurança": {
        whatYouLearn: [
            "A tríade CIA e os princípios de defesa",
            "O panorama de ameaças e atores",
            "Malware, engenharia social e phishing",
            "Criptografia e higiene de segurança no dia a dia",
        ],
        prerequisites: ["Nenhum: começa do zero em segurança"],
    },
    "Segurança de Aplicações Web": {
        whatYouLearn: [
            "O OWASP Top 10 na prática",
            "Injeção (SQL, XSS) e controle de acesso quebrado",
            "Configuração insegura e componentes vulneráveis",
            "Pensar e testar como um atacante para defender",
        ],
        prerequisites: ["Noções de web (HTTP)", "Fundamentos de cibersegurança ajudam"],
    },
    "ISC2 Certified in Cybersecurity (CC)": {
        whatYouLearn: [
            "Os cinco domínios do exame ISC2 CC",
            "Princípios de segurança e controle de acesso",
            "Resposta a incidentes e continuidade de negócio",
            "Segurança de redes e operações, vendor-neutral",
        ],
        prerequisites: ["Fundamentos de cibersegurança recomendado"],
    },
    "AZURE SC-900": {
        whatYouLearn: [
            "Conceitos de segurança, conformidade e identidade",
            "Identidade e acesso com o Microsoft Entra",
            "As soluções de segurança da Microsoft",
            "Recursos de conformidade do Microsoft 365 e Azure",
        ],
        prerequisites: ["Noções básicas de nuvem ajudam"],
    },
    "AZURE AI-900": {
        whatYouLearn: [
            "Fundamentos de IA e IA responsável",
            "Machine learning: conceitos e fluxo",
            "Visão computacional e processamento de linguagem natural",
            "IA generativa, mapeado para o exame AI-900",
        ],
        prerequisites: ["Nenhum: introdução conceitual à IA na Azure"],
    },
    "AZURE AI-901": {
        whatYouLearn: [
            "IA e IA responsável em profundidade",
            "Modelos e o Microsoft Foundry",
            "Visão, fala e análise de texto aplicadas",
            "IA generativa, agentes e extração de informação",
        ],
        prerequisites: ["AI-900 ou noções de IA recomendado"],
    },
    "AZURE DP-900": {
        whatYouLearn: [
            "Conceitos centrais de dados",
            "Dados relacionais e não relacionais no Azure",
            "Cargas de trabalho analíticas",
            "Os serviços de dados do Azure, para o exame DP-900",
        ],
        prerequisites: ["Nenhum: introdução a dados na nuvem"],
    },
    "AZURE AZ-900": {
        whatYouLearn: [
            "Conceitos de nuvem: modelos e benefícios",
            "Os principais serviços do Azure",
            "Segurança, identidade e governança",
            "Preços e suporte, mapeado para o exame AZ-900",
        ],
        prerequisites: ["Nenhum: porta de entrada para a nuvem Azure"],
    },
    "AWS CLF-C02": {
        whatYouLearn: [
            "Conceitos de nuvem e a proposta da AWS",
            "Segurança e o modelo de responsabilidade compartilhada",
            "Os principais serviços da AWS (computação, storage, rede, banco)",
            "Preços, suporte e faturamento, para o Cloud Practitioner",
        ],
        prerequisites: ["Nenhum: certificação de entrada na AWS"],
    },
    "AWS DVA-C02": {
        whatYouLearn: [
            "Desenvolver e implantar aplicações na AWS",
            "Serviços-chave: Lambda, DynamoDB, S3 e API Gateway",
            "Segurança, IAM e boas práticas para desenvolvedores",
            "CI/CD e observabilidade, para o Developer Associate",
        ],
        prerequisites: ["Cloud Practitioner (CLF-C02) ou equivalente", "Saber programar"],
    },
    "AWS SAA-C03": {
        whatYouLearn: [
            "Projetar arquiteturas seguras, resilientes e de baixo custo",
            "IAM e segurança, VPC e rede, computação e Auto Scaling",
            "Armazenamento, bancos de dados, mensageria e desacoplamento",
            "Alta disponibilidade e DR, para o Solutions Architect Associate",
        ],
        prerequisites: [
            "Cloud Practitioner (CLF-C02) ou equivalente",
            "Noções de redes e sistemas ajudam",
        ],
    },
    "AWS AI Practitioner": {
        whatYouLearn: [
            "Fundamentos de IA, machine learning e deep learning",
            "IA generativa, foundation models e o Amazon Bedrock",
            "Prompt engineering, RAG e customização de modelos",
            "IA responsável, segurança e governança, para o AIF-C01",
        ],
        prerequisites: [
            "Cloud Practitioner (CLF-C02) ou equivalente",
            "Nenhuma experiência com ML é exigida",
        ],
    },
    "Fundamentos de LLMs": {
        whatYouLearn: [
            "Como um LLM funciona: previsão de tokens, atenção e treinamento",
            "Tokens, custos, embeddings e a janela de contexto",
            "Parâmetros de geração e o ecossistema de modelos de 2026",
            "Os limites: alucinação, viés, prompt injection e segurança",
        ],
        prerequisites: ["Lógica de programação e Python básico", "Noções de HTTP e APIs ajudam"],
    },
    "Aplicações com LLMs": {
        whatYouLearn: [
            "Chamar a API de chat em Python, com erros, custos e retentativas",
            "Prompt engineering na prática e system prompts versionados",
            "Saídas estruturadas e function calling: o modelo aciona seu código",
            "Streaming com SSE, memória de conversa e um chatbot completo",
        ],
        prerequisites: [
            "Fundamentos de LLMs (tokens, janela, parâmetros)",
            "Python e noções de HTTP e APIs",
        ],
    },
    "RAG na Prática": {
        whatYouLearn: [
            "Quando usar RAG (e quando contexto longo ou fine-tuning)",
            "Ingestão, chunking por estrutura e embeddings com pgvector",
            "Busca híbrida, reranking, filtros com permissão e reescrita",
            "Prompt aumentado com citações, não sei honesto e avaliação",
        ],
        prerequisites: [
            "Aplicações com LLMs (chamadas, prompts, memória)",
            "SQL básico ajuda (o banco vetorial é o Postgres)",
        ],
    },
    "Agentes de IA": {
        whatYouLearn: [
            "O loop pensar-agir-observar e quando um agente vale a pena",
            "Ferramentas bem projetadas, sandbox e guarda-corpos de ação",
            "LangChain e LangGraph: grafos de estado, checkpoints e retomada",
            "MCP, engenharia de contexto e multiagente com aprovação humana",
        ],
        prerequisites: [
            "Aplicações com LLMs (function calling e streaming)",
            "RAG na Prática ajuda no projeto final",
        ],
    },
    "LLMs em Produção": {
        whatYouLearn: [
            "Avaliar com golden set, métricas objetivas e LLM como juiz",
            "Observabilidade com tracing, dashboards, alertas e feedback",
            "Custo e latência: cache, roteamento de modelos, batch e filas",
            "Guardrails, LGPD, resiliência, canário, fine-tuning e runbook",
        ],
        prerequisites: [
            "RAG na Prática e Agentes de IA (o projeto integra os dois)",
            "Noções de operação de backend ajudam",
        ],
    },
    "Por Dentro da Máquina": {
        whatYouLearn: [
            "Binário, hexadecimal, inteiros, ponto flutuante e ponto fixo",
            "Bits na prática: máscaras, endianness, alinhamento e padding",
            "CPU, pipeline, hierarquia de memória, stack, heap e cache",
            "Do fonte ao binário: seções, chamadas, syscalls e medição",
        ],
        prerequisites: ["Lógica de programação", "Noções de C ou C++ ajudam bastante"],
    },
    "C++ Moderno": {
        whatYouLearn: [
            "Semântica de valor, referências, const-correctness e auto",
            "RAII, ownership e smart pointers (unique, shared, weak)",
            "Move semantics, templates com concepts e a STL com custo real",
            "Erros sem exceção: optional, expected, noexcept e invariantes",
        ],
        prerequisites: [
            "C++ (sintaxe, classes, STL básica)",
            "Por Dentro da Máquina ajuda no capítulo de custo",
        ],
    },
    "Sistemas Operacionais e Concorrência": {
        whatYouLearn: [
            "Processos, threads e o custo real de cada um",
            "Corridas de dados, mutex, semáforos, condvars e atomics",
            "Escalonador, prioridades, memória virtual, TLB e page faults",
            "Arquivos, buffering, E/S e multiplexação (select a epoll)",
        ],
        prerequisites: [
            "Por Dentro da Máquina (memória, stack e heap)",
            "C++ básico para os exemplos com std::thread",
        ],
    },
    "Compiladores e Toolchain": {
        whatYouLearn: [
            "As fases da compilação e o que vive dentro de um objeto",
            "Lexer, parser, AST, otimizações e o papel do UB",
            "Linker, bibliotecas, make e CMake moderno, cross-compilation",
            "Sanitizers, análise estática, gdb e warnings como contrato",
        ],
        prerequisites: [
            "C++ e Por Dentro da Máquina (seções, símbolos, binário)",
            "Linux e linha de comando ajudam muito",
        ],
    },
    "Sistemas de Tempo Real": {
        whatYouLearn: [
            "Hard vs soft real-time e determinismo de verdade",
            "RTOS: tarefas, ISRs, filas e comunicação com FreeRTOS",
            "RMS, EDF, inversão de prioridade e o caso Mars Pathfinder",
            "Memória sem malloc, ring buffers, WCET, watchdog e padrões RT",
        ],
        prerequisites: [
            "Sistemas Operacionais e Concorrência (threads, mutex, escalonador)",
            "C++ Moderno para os padrões de projeto",
        ],
    },
    "Defesa e o SOC": {
        whatYouLearn: [
            "Como um centro de operações funciona por dentro, sem romantismo",
            "Fontes de log, normalização, enriquecimento e retenção com critério",
            "SIEM na prática: consulta, correlação e os limites da ferramenta",
            "Detecção testada, triagem com método, resposta a incidente e caça",
        ],
        prerequisites: [
            "Ameaças e Ataques na Prática",
            "Linux e Linha de Comando, e noções de redes",
        ],
    },
    "Ameaças e Ataques na Prática": {
        whatYouLearn: [
            "A cadeia de um ataque real, do reconhecimento à exfiltração",
            "MITRE ATT&CK: tática, técnica e procedimento sem decoreba",
            "Engenharia social, phishing moderno, BEC e fadiga de MFA",
            "Malware, ransomware como negócio e o rastro que cada etapa deixa",
        ],
        prerequisites: ["Fundamentos de Cibersegurança", "Noções de redes e de linha de comando"],
    },
    "Embarcados na Prática": {
        whatYouLearn: [
            "O microcontrolador por dentro e o blink por registrador",
            "GPIO, timers, interrupções, ADC e os protocolos UART, SPI e I2C",
            "C++ enxuto: volatile, custo zero, constexpr e containers estáticos",
            "Energia, brown-out, flash, OTA, MISRA, testes no host e CI",
        ],
        prerequisites: [
            "Sistemas de Tempo Real (RTOS, ISRs, padrões)",
            "Uma placa barata (ESP32 ou STM32) pra praticar em casa",
        ],
    },
    "Fundamentos de Produto": {
        whatYouLearn: [
            "Produto vs projeto, outcome vs output e o ciclo de vida",
            "Os papéis de PO, PM e Product Analyst como o Brasil usa",
            "O time de produto, o usuário no centro e JTBD introdutório",
            "Modelos de receita, proposta de valor e conversa com stakeholders",
        ],
        prerequisites: ["Nenhum: é a porta de entrada da carreira de produto"],
    },
    "Ágil e Delivery na Prática": {
        whatYouLearn: [
            "Scrum de verdade: papéis, eventos, artefatos e valores",
            "Backlog, histórias bem escritas, critérios de aceite e DoD",
            "Kanban, métricas de fluxo e previsibilidade sem teatro",
            "Anti-padrões (PO proxy, feature factory) e escala com critério",
        ],
        prerequisites: ["Fundamentos de Produto"],
    },
    "Dados para Produto": {
        whatYouLearn: [
            "Métricas acionáveis, north star e o funil AARRR",
            "Retenção, análise de coorte e churn com contas que fecham",
            "Instrumentação de eventos e dashboards que respondem perguntas",
            "Experimentos A/B sem armadilhas (peeking, novelty, significância)",
        ],
        prerequisites: ["Fundamentos de Produto", "Ágil e Delivery ajuda no contexto de time"],
    },
    "Discovery e Pesquisa": {
        whatYouLearn: [
            "Os quatro riscos e por que discovery evita desperdício",
            "Entrevistas sem viés, síntese e mapa de oportunidades",
            "Priorizar suposições e testar na fidelidade certa pro risco",
            "Discovery quantitativo: surveys e dados de uso como pergunta",
        ],
        prerequisites: ["Fundamentos de Produto", "Dados para Produto ajuda no lado quantitativo"],
    },
    "Estratégia e Priorização": {
        whatYouLearn: [
            "Visão e estratégia como escolhas com diagnóstico",
            "Posicionamento, segmentação e diferenciais defensáveis",
            "OKRs sem teatro e roadmap now-next-later",
            "RICE, custo de atraso e o critério acima dos frameworks",
        ],
        prerequisites: ["Discovery e Pesquisa", "Dados para Produto (métricas de outcome)"],
    },
    "Produto na Prática": {
        whatYouLearn: [
            "Go-to-market, lançamento por fases e feature flags",
            "Growth loops, ativação e retenção como fundação",
            "Monetização, produto técnico e IA no trabalho de produto em 2026",
            "Carreira: níveis, transições de dev e QA, e o case de portfólio",
        ],
        prerequisites: ["Estratégia e Priorização (o capstone usa tudo)"],
    },
};

// Tempo estimado de leitura de uma aula: palavras dos blocos de texto a ~180 wpm,
// mais um custo por bloco de codigo e por questao do quiz. Minimo de 3 min.
function estimarMin(blocks: { type: string; value: string }[] | null, numQuestoes: number): number {
    let palavras = 0;
    let codeBlocks = 0;
    for (const b of blocks ?? []) {
        if (b.type === "text" || b.type === "quote") {
            palavras += b.value.trim().split(/\s+/).filter(Boolean).length;
        } else if (b.type === "code") {
            codeBlocks += 1;
        } else if (b.type === "table") {
            palavras += 25;
        }
    }
    const minutos = palavras / 180 + codeBlocks * 0.5 + numQuestoes * 1.2;
    return Math.max(3, Math.round(minutos));
}

async function seed() {
    const todas = await db.select().from(trails);
    let metaAtualizadas = 0;
    let aulasAtualizadas = 0;
    let previews = 0;
    const semDetalhe: string[] = [];

    for (const t of todas) {
        const d = DETALHES[t.name];
        if (d) {
            await db
                .update(trails)
                .set({ whatYouLearn: d.whatYouLearn, prerequisites: d.prerequisites })
                .where(eq(trails.id, t.id));
            metaAtualizadas++;
        } else {
            semDetalhe.push(t.name);
        }

        const mods = await db
            .select()
            .from(modules)
            .where(eq(modules.trailId, t.id))
            .orderBy(asc(modules.position));
        const posDoModulo = new Map(mods.map((m) => [m.id, m.position]));

        const aulas = await db.select().from(lessons).where(eq(lessons.trailId, t.id));
        if (aulas.length === 0) continue;

        const aulaIds = aulas.map((a) => a.id);
        const contagens = await db
            .select({ lessonId: questions.lessonId, n: count() })
            .from(questions)
            .where(inArray(questions.lessonId, aulaIds))
            .groupBy(questions.lessonId);
        const questoesPorAula = new Map(contagens.map((c) => [c.lessonId, Number(c.n)]));

        const ordenadas = [...aulas].sort(
            (a, b) =>
                (posDoModulo.get(a.moduleId) ?? 0) - (posDoModulo.get(b.moduleId) ?? 0) ||
                a.position - b.position,
        );

        for (let i = 0; i < ordenadas.length; i++) {
            const a = ordenadas[i];
            const min = estimarMin(a.contentBlocks, questoesPorAula.get(a.id) ?? 0);
            const preview = i === 0;
            await db.update(lessons).set({ durationMin: min, preview }).where(eq(lessons.id, a.id));
            aulasAtualizadas++;
            if (preview) previews++;
        }
    }

    console.log(
        "Detalhes seed: " +
            metaAtualizadas +
            " trilhas com what/prereq, " +
            aulasAtualizadas +
            " aulas com duracao, " +
            previews +
            " previews.",
    );
    if (semDetalhe.length) {
        console.log("Sem what/prereq (nao estao no mapa DETALHES): " + semDetalhe.join(", "));
    }
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed de detalhes:", e);
        process.exit(1);
    });
