// Questões do simulado AWS Certified AI Practitioner (AIF-C01), domínio 4 da prova
// (Guidelines for Responsible AI), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aif-c01-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D4: Questao[] = [
    {
        statement:
            "Uma empresa de logística usa modelos de ML para prever a demanda a cada trimestre. Um analista prepara um relatório para que as partes interessadas entendam como os modelos treinados chegam às previsões. O que o analista deve incluir para atender às necessidades de transparência e explicabilidade?",
        explanation:
            "Gráficos de dependência parcial (PDPs) mostram como uma ou mais variáveis de entrada influenciam a previsão, o que explica às partes interessadas como os modelos chegam aos resultados. Código-fonte e amostras de treino mostram implementação e insumos, não a influência das variáveis, e tabelas de convergência descrevem o treino, não o comportamento do modelo.",
        topic: "IA responsável",
        options: [
            ["Gráficos de dependência parcial (PDPs) das variáveis de entrada", true],
            ["Amostras dos dados usados no treinamento dos modelos de demanda", false],
            ["Tabelas de convergência registradas durante o treinamento dos modelos", false],
            ["Código-fonte usado para treinar os modelos de previsão da demanda", false],
        ],
    },
    {
        statement:
            "Um laboratório de pesquisa precisa classificar amostras genéticas em 20 categorias de acordo com suas características. A equipe exige um algoritmo cuja lógica interna possa ser documentada como uma sequência de regras legíveis que leva a cada resultado. Qual algoritmo atende a essa necessidade?",
        explanation:
            "Árvores de decisão expõem a lógica interna como uma sequência de divisões legíveis, então a equipe documenta o caminho de cada amostra até uma das 20 categorias. Redes neurais são opacas, a regressão linear prevê valores contínuos e a regressão logística se explica por coeficientes, não por regras de decisão encadeadas.",
        topic: "IA responsável",
        options: [
            ["Árvores de decisão", true],
            ["Regressão logística", false],
            ["Redes neurais", false],
            ["Regressão linear", false],
        ],
    },
    {
        statement:
            "Uma plataforma de mídia vai usar um large language model (LLM) na moderação de conteúdo e quer verificar se as saídas do modelo têm viés ou tratam grupos específicos de forma injusta. Qual fonte de dados permite essa avaliação com o menor esforço administrativo?",
        explanation:
            "Conjuntos de dados de benchmark são padronizados e curados justamente para medir viés e justiça, então permitem avaliar as saídas do LLM de forma consistente e com pouco esforço. Registros de moderação e conteúdo de usuários exigiriam rotulagem e revisão manuais, e diretrizes internas são documentos de política, não dados para medir viés.",
        topic: "IA responsável",
        options: [
            ["Conjuntos de dados de benchmark, padronizados e já curados", true],
            ["Registros de moderação, com as decisões tomadas pela equipe", false],
            ["Conteúdo gerado pelos usuários, coletado direto da plataforma", false],
            ["Diretrizes internas de moderação, com as regras da empresa", false],
        ],
    },
    {
        statement:
            "Uma financeira está criando uma solução de IA generativa que oferece descontos a novos clientes com base em regras de negócio. Para usar o modelo de forma responsável e limitar vieses que possam prejudicar parte dos clientes, quais duas ações a empresa deve tomar? (Selecione DUAS opções.)",
        explanation:
            "Verificar desequilíbrios nos dados revela e reduz vieses que prejudicariam alguns clientes, e avaliar o comportamento do modelo permite explicar as decisões com transparência. Frequência de execução e tempo de inferência são questões operacionais, e a ROUGE mede a sobreposição do texto gerado com uma referência, sem detectar viés.",
        topic: "IA responsável",
        options: [
            ["Verificar nos dados desequilíbrios ou disparidades entre grupos de clientes", true],
            [
                "Avaliar o comportamento do modelo para dar transparência às partes interessadas",
                true,
            ],
            ["Executar o modelo com a maior frequência possível ao longo do dia", false],
            [
                "Usar a métrica ROUGE para medir a qualidade dos textos gerados pelo modelo nas ofertas",
                false,
            ],
            ["Manter o tempo de inferência do modelo dentro dos limites aceitos", false],
        ],
    },
    {
        statement:
            "Um estudante entrega redações copiando textos produzidos por uma ferramenta de IA generativa, sem indicar a origem. Qual desafio de IA responsável essa situação ilustra?",
        explanation:
            "Reaproveitar texto gerado por IA como trabalho próprio, sem indicar a origem, é plágio, um risco de IA responsável ligado à propriedade intelectual. Toxicidade é conteúdo ofensivo ou nocivo, alucinação é informação inventada com aparência plausível e violação de privacidade envolve expor dados pessoais.",
        topic: "IA responsável",
        options: [
            ["Plágio de conteúdo", true],
            ["Toxicidade do conteúdo", false],
            ["Alucinação do modelo", false],
            ["Violação de privacidade", false],
        ],
    },
    {
        statement:
            "Uma loja usa um modelo de ML, treinado com imagens gravadas em poucas unidades de bairros com público pouco diverso, para analisar as câmeras em busca de possíveis furtos. O modelo sinaliza pessoas de um grupo étnico com frequência muito maior do que as de outros grupos. Que tipo de viés está influenciando o resultado do modelo?",
        explanation:
            "Viés de amostragem surge quando os dados de treinamento não representam bem toda a população, o que leva o modelo a sinalizar um grupo étnico muito mais que os outros. Viés de medição vem de erros sistemáticos no registro dos dados, e os vieses de confirmação e do observador tratam de como pessoas interpretam ou rotulam resultados.",
        topic: "IA responsável",
        options: [
            ["Viés de medição", false],
            ["Viés de amostragem", true],
            ["Viés de confirmação", false],
            ["Viés do observador", false],
        ],
    },
    {
        statement:
            "Um hospital colocou em produção no Amazon Bedrock um modelo de detecção de doenças. Para cumprir as regras de privacidade, o modelo nunca pode expor dados pessoais de pacientes nas respostas, e a equipe deve ser avisada sempre que houver uma tentativa de exposição. Qual solução atende a esses requisitos?",
        explanation:
            "O Amazon Bedrock Guardrails, com filtros de informações sensíveis, bloqueia ou mascara dados pessoais nas respostas, e alarmes do CloudWatch sobre a métrica InvocationsIntervened avisam a equipe. O Macie descobre dados sensíveis no Amazon S3, o CloudTrail registra chamadas de API e o Inspector procura vulnerabilidades em cargas de trabalho, e nenhum deles filtra respostas.",
        topic: "Segurança e governança",
        options: [
            [
                "Aplicar o Amazon Bedrock Guardrails às respostas e criar alarmes no Amazon CloudWatch",
                true,
            ],
            [
                "Usar o Amazon Macie para verificar as respostas do modelo e gerar alertas de exposição",
                false,
            ],
            [
                "Configurar o AWS CloudTrail para inspecionar as respostas e alertar sobre dados pessoais",
                false,
            ],
            [
                "Usar o Amazon Inspector para verificar vulnerabilidades no modelo e alertar a equipe",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora vai implantar um large language model (LLM) para automatizar o processamento de documentos e quer fazer isso de forma responsável, evitando danos causados por decisões enviesadas. Quais duas ações a empresa deve tomar? (Selecione DUAS opções.)",
        explanation:
            "Métricas de justiça (fairness) na avaliação mostram se o modelo trata os casos de forma equitativa, e ajustar os dados de treinamento ataca o viés na origem. Temperatura e prompt engineering mudam o estilo e a qualidade das respostas, e evitar overfitting melhora a generalização, mas nenhum desses limita resultados enviesados.",
        topic: "IA responsável",
        options: [
            ["Incluir métricas de justiça (fairness) na avaliação do modelo", true],
            ["Ajustar os dados de treinamento para reduzir o viés", true],
            ["Ajustar o parâmetro de temperatura para respostas mais previsíveis", false],
            ["Evitar overfitting nos dados de treinamento do modelo", false],
            ["Aplicar técnicas de prompt engineering nas instruções", false],
        ],
    },
    {
        statement:
            "Uma equipe de pesquisa cria modelos de ML próprios e compartilha os artefatos dos modelos com outras equipes, mas mantém consigo o código e os dados de treinamento. A equipe quer uma forma padronizada de documentar cada modelo publicado e auditá-lo depois. Qual solução a equipe deve usar?",
        explanation:
            "Os Amazon SageMaker Model Cards padronizam a documentação do modelo, com usos pretendidos, detalhes de treinamento e avaliação, e guardam versões para auditoria. Documentos soltos no S3 não seguem um padrão, o Git versiona código e não metadados do modelo, e os AWS AI Service Cards descrevem os serviços de IA da própria AWS.",
        topic: "IA responsável",
        options: [
            [
                "Criar Amazon SageMaker Model Cards com usos pretendidos e detalhes de treinamento",
                true,
            ],
            [
                "Descrever os modelos em documentos de texto e armazená-los em um bucket do Amazon S3",
                false,
            ],
            [
                "Versionar os scripts de treinamento dos modelos em um repositório Git compartilhado",
                false,
            ],
            [
                "Usar os AWS AI Service Cards para descrever os modelos criados e publicados pela equipe",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco quer criar um sistema de ML para ajudar a equipe de risco a decidir a concessão de empréstimos para diferentes grupos demográficos. O que o banco deve fazer para desenvolver um modelo sem viés?",
        explanation:
            "Medir o desequilíbrio de classes e adaptar o treinamento, por exemplo com reamostragem ou pesos por classe, faz o modelo tratar com equidade os grupos sub-representados. Reduzir os dados tira informação e pode piorar o viés, reproduzir resultados históricos carrega discriminação passada e modelos separados por grupo aprofundam disparidades.",
        topic: "IA responsável",
        options: [
            ["Medir o desequilíbrio de classes nos dados de treino e ajustar o treinamento", true],
            ["Reduzir o tamanho do conjunto de dados de treino para acelerar o processo", false],
            [
                "Garantir que as previsões do modelo reproduzam os resultados históricos do banco",
                false,
            ],
            ["Criar um modelo separado para cada grupo demográfico atendido pelo banco", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando um aplicativo que usa a câmera do celular para avaliar picadas de insetos. Para treinar o modelo de classificação de imagens, a empresa reúne fotos de picadas em pessoas de diferentes gêneros, etnias e regiões. Qual princípio de IA responsável essa prática reflete?",
        explanation:
            "Reunir fotos de pessoas de diferentes gêneros, etnias e regiões evita que o modelo funcione melhor para alguns grupos do que para outros, o que reflete o princípio de justiça (fairness). Explicabilidade e transparência tratam de revelar como o modelo chega às saídas, e governança trata de políticas e supervisão.",
        topic: "IA responsável",
        options: [
            ["Explicabilidade", false],
            ["Transparência", false],
            ["Justiça", true],
            ["Governança", false],
        ],
    },
    {
        statement:
            "Um banco está criando uma solução de decisão de empréstimos com base em um foundation model. Para fins de auditoria e supervisão, as decisões do modelo precisam ser explicáveis. Qual fator mais afeta a explicabilidade dessas decisões?",
        explanation:
            "A complexidade do modelo é o que mais pesa na explicabilidade: modelos simples, como regressão linear e árvores de decisão, são fáceis de interpretar, enquanto redes neurais profundas funcionam como caixas-pretas. Tempo de treinamento, número de hiperparâmetros e tempo de implantação dizem respeito a construir e operar o modelo, não a interpretá-lo.",
        topic: "IA responsável",
        options: [
            ["Complexidade do modelo", true],
            ["Tempo de treinamento", false],
            ["Número de hiperparâmetros", false],
            ["Tempo de implantação", false],
        ],
    },
    {
        statement:
            "Uma empresa quer um aplicativo de pontuação de leads em que os funcionários possam ver e ajustar o peso dado a cada variável de entrada, com base no conhecimento que têm do negócio. Que tipo de modelo de ML atende a esse requisito?",
        explanation:
            "A regressão logística atribui um peso explícito (coeficiente) a cada variável de entrada, então os funcionários veem a contribuição de cada uma e podem ajustá-la. O k-NN prevê a partir de vizinhos próximos, sem pesos por variável, e redes neurais e deep learning sobre componentes principais não expõem pesos simples e ajustáveis.",
        topic: "IA responsável",
        options: [
            ["Modelo de regressão logística", true],
            ["Modelo k-nearest neighbors (k-NN)", false],
            ["Modelo de rede neural", false],
            ["Modelo de deep learning sobre componentes principais", false],
        ],
    },
    {
        statement:
            "Uma empresa quer reduzir o viés e a toxicidade das respostas de sua aplicação de IA generativa. Qual técnica ela pode aplicar na etapa de pós-processamento do ciclo de vida de ML?",
        explanation:
            "No pós-processamento, a revisão humana (human-in-the-loop) avalia as saídas antes que cheguem aos usuários e corrige respostas enviesadas ou tóxicas. Aumento de dados e engenharia de features atuam nos dados antes ou durante o treino, e o treinamento adversarial fortalece o modelo durante o treino, não depois da geração.",
        topic: "IA responsável",
        options: [
            ["Revisão humana das saídas (human-in-the-loop)", true],
            ["Aumento de dados (data augmentation)", false],
            ["Engenharia de features (feature engineering)", false],
            ["Treinamento adversarial (adversarial training)", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados vai documentar seus modelos de IA com o Amazon SageMaker Model Cards. Qual é um benefício dessa prática?",
        explanation:
            "Os Amazon SageMaker Model Cards padronizam o registro da finalidade, do desempenho e das limitações de cada modelo, o que apoia transparência, governança e acompanhamento ao longo do tempo. Eles não reduzem requisitos computacionais nem armazenam modelos para arquivamento, e um resumo visual atraente é detalhe de apresentação, não o benefício central.",
        topic: "IA responsável",
        options: [
            ["Padronizar as informações sobre finalidade, desempenho e limitações do modelo", true],
            ["Reduzir os requisitos computacionais gerais do modelo em produção", false],
            [
                "Gerar um resumo visualmente atraente das capacidades do modelo para o público",
                false,
            ],
            ["Armazenar fisicamente os artefatos dos modelos para fins de arquivamento", false],
        ],
    },
    {
        statement:
            "Uma empresa desenvolve um modelo de IA em parceria com vários institutos de pesquisa e precisa de uma documentação padronizada que acompanhe as versões do modelo e registre como ele foi desenvolvido. Qual solução atende a esses requisitos?",
        explanation:
            "Os Amazon SageMaker Model Cards oferecem um formato padronizado para documentar o modelo, e cada edição gera uma nova versão do card, com registro imutável das mudanças. O Git versiona código, não documentação padronizada do modelo, o Comprehend faz processamento de linguagem natural e o S3 só armazena objetos, sem estrutura de documentação.",
        topic: "IA responsável",
        options: [
            ["Acompanhar as mudanças do modelo com o Amazon SageMaker Model Cards", true],
            ["Acompanhar as mudanças do modelo em um repositório Git compartilhado", false],
            ["Acompanhar as mudanças do modelo com análises do Amazon Comprehend", false],
            ["Acompanhar as mudanças do modelo em planilhas guardadas no Amazon S3", false],
        ],
    },
    {
        statement:
            "Um hospital criou um sistema de IA que faz recomendações de tratamento personalizadas para pacientes. O sistema precisa explicar o raciocínio por trás de cada recomendação e tornar essas informações acessíveis a médicos e pacientes. Qual princípio de design centrado no ser humano isso reflete?",
        explanation:
            "Explicar o raciocínio de cada recomendação e torná-lo acessível a médicos e pacientes é explicabilidade, princípio de design centrado no ser humano que torna as decisões da IA compreensíveis. Privacidade e segurança protegem os dados, justiça busca resultados equitativos entre grupos e governança de dados define políticas de gestão dos dados.",
        topic: "IA responsável",
        options: [
            ["Governança de dados", false],
            ["Privacidade e segurança", false],
            ["Explicabilidade", true],
            ["Justiça", false],
        ],
    },
    {
        statement:
            "Uma empresa de varejo quer criar um modelo de recomendação de produtos seguindo práticas responsáveis. Qual prática ela deve adotar na coleta de dados para reduzir o viés do modelo?",
        explanation:
            "Coletar dados que representem toda a base de clientes evita que o modelo favoreça um grupo e ajuda a tratar todos com equidade, o que reduz o viés. Usar só os clientes mais ativos ou um único segmento de alto valor gera dados distorcidos, e o menor conjunto que treina rápido tende a sub-representar grupos.",
        topic: "IA responsável",
        options: [
            ["Garantir que os dados representem toda a base de clientes da empresa", true],
            ["Usar apenas os dados dos clientes mais ativos e frequentes da empresa", false],
            ["Coletar dados de um único segmento de clientes de alto valor", false],
            ["Usar o menor conjunto de dados que permita treinar o modelo rápido", false],
        ],
    },
    {
        statement:
            "Uma empresa de alimentos está montando um conjunto de dados para prever as preferências alimentares dos clientes e quer que as preferências de todos os grupos demográficos estejam representadas nos dados. Que característica do conjunto de dados isso descreve?",
        explanation:
            "Garantir que todos os grupos demográficos estejam representados é cuidar da diversidade do conjunto de dados, para que o modelo aprenda com uma ampla variedade de preferências. Acurácia e confiabilidade tratam da correção e da consistência dos dados, e viés de recência é a falha de dar peso demais a dados recentes.",
        topic: "IA responsável",
        options: [
            ["Acurácia", false],
            ["Diversidade", true],
            ["Viés de recência", false],
            ["Confiabilidade", false],
        ],
    },
    {
        statement:
            "Um profissional de IA está criando um modelo de ML e quer dar às partes interessadas transparência e explicabilidade sobre as previsões do modelo. Qual solução atende a esse requisito?",
        explanation:
            "Os valores de Shapley (SHAP) quantificam quanto cada variável contribuiu para uma previsão específica, o que mostra às partes interessadas por que o modelo chegou àquele resultado. Acurácia e matriz de confusão medem o desempenho geral sem explicar previsões, e um endpoint de inferência seguro trata de implantação e acesso.",
        topic: "IA responsável",
        options: [
            ["Apresentar os valores de Shapley (SHAP) das previsões do modelo", true],
            ["Informar a medida de acurácia obtida pelo modelo nos testes", false],
            ["Apresentar a matriz de confusão calculada na avaliação do modelo", false],
            ["Disponibilizar um endpoint de inferência seguro para o modelo", false],
        ],
    },
    {
        statement:
            "Um banco está criando uma aplicação de IA generativa para decisões de aprovação de empréstimos e precisa que as saídas sejam responsáveis e justas. Qual solução atende a esses requisitos?",
        explanation:
            "Revisar os dados de treino quanto a viés e incluir todos os grupos demográficos reduz resultados enviesados na origem, base de uma aplicação de crédito responsável e justa. Muitas camadas ocultas reduzem a explicabilidade sem tratar a justiça, manter o processo em segredo fere a transparência e um teste estático único não detecta nem corrige viés nos dados.",
        topic: "IA responsável",
        options: [
            [
                "Revisar os dados de treino quanto a viés e incluir todos os grupos demográficos",
                true,
            ],
            [
                "Usar um modelo de deep learning com muitas camadas ocultas para ganhar precisão",
                false,
            ],
            [
                "Manter em segredo o processo de decisão do modelo para proteger algoritmos proprietários",
                false,
            ],
            [
                "Monitorar o modelo continuamente com um único conjunto de dados de teste estático",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa tem um modelo de ML e quer entender como ele chega às suas previsões. Qual termo descreve essa compreensão das previsões de um modelo?",
        explanation:
            "Interpretabilidade do modelo é a capacidade de entender como o modelo chega às previsões, exatamente o que a empresa busca. Treinamento é o processo de ajustar o modelo aos dados, desempenho preditivo mede o quanto ele acerta e interoperabilidade trata de funcionar com outros sistemas, e nenhum descreve compreender o raciocínio.",
        topic: "IA responsável",
        options: [
            ["Interpretabilidade do modelo", true],
            ["Treinamento do modelo", false],
            ["Desempenho preditivo do modelo", false],
            ["Interoperabilidade do modelo", false],
        ],
    },
    {
        statement:
            "Um banco usa um modelo de IA generativa para definir limites de crédito de novos clientes e quer tornar o processo de decisão do modelo mais transparente para esses clientes. Qual solução atende a esse requisito?",
        explanation:
            "Técnicas de IA explicável revelam os fatores que pesaram em cada limite de crédito, tornando o raciocínio do modelo transparente para os clientes. Trocar o modelo por regras muda a abordagem em vez de explicá-la, explicações técnicas detalhadas não mostram quais fatores definiram a decisão e mais acurácia não torna o processo transparente.",
        topic: "IA responsável",
        options: [
            ["Aplicar técnicas de IA explicável que mostrem os fatores de cada decisão", true],
            ["Substituir o modelo de ML por um sistema baseado em regras fixas de crédito", false],
            [
                "Criar uma interface interativa com explicações técnicas detalhadas sobre o sistema",
                false,
            ],
            ["Aumentar a acurácia do modelo para reduzir a necessidade de transparência", false],
        ],
    },
    {
        statement:
            "Uma empresa vai lançar um assistente de IA generativa no Amazon Bedrock e quer reduzir o risco de conteúdo nocivo: medir a toxicidade dos modelos candidatos antes do lançamento e filtrar entradas e respostas em produção. Quais dois recursos do Amazon Bedrock atendem a esses requisitos? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Bedrock Evaluations mede toxicidade e robustez dos modelos antes do lançamento, e o Amazon Bedrock Guardrails filtra conteúdo nocivo nas entradas e respostas em produção. Fine-tuning, Prompt Management e Knowledge Bases melhoram a capacidade, o reúso de prompts e o contexto das respostas, mas nenhum mede toxicidade nem filtra conteúdo.",
        topic: "IA responsável",
        options: [
            ["Amazon Bedrock Guardrails, com filtros de conteúdo nas entradas e respostas", true],
            ["Amazon Bedrock Evaluations, com métricas de toxicidade e robustez", true],
            ["Personalização de modelos com fine-tuning em dados da empresa", false],
            ["Amazon Bedrock Prompt Management, para versionar e reutilizar prompts", false],
            ["Amazon Bedrock Knowledge Bases, para buscar contexto em documentos internos", false],
        ],
    },
    {
        statement:
            "Uma empresa farmacêutica vai treinar o próprio large language model (LLM) com dados privados e quer limitar a pegada de carbono do treinamento. Qual família de instâncias do Amazon EC2 tem o menor impacto ambiental para treinar LLMs?",
        explanation:
            "As instâncias Trn usam o AWS Trainium, chip criado para treinar modelos grandes com eficiência energética, e a AWS as indica para reduzir o impacto ambiental do treino. As famílias P e G usam GPUs otimizadas para desempenho, não para eficiência energética, e a família C usa CPUs de computação geral, sem aceleração para LLMs.",
        topic: "IA responsável",
        options: [
            ["Instâncias Amazon EC2 Trn, com chips AWS Trainium", true],
            ["Instâncias Amazon EC2 P, com GPUs de alto desempenho", false],
            ["Instâncias Amazon EC2 G, com GPUs para gráficos e ML", false],
            ["Instâncias Amazon EC2 C, otimizadas para computação", false],
        ],
    },
    {
        statement:
            "Uma comunidade de jogos online usa o Amazon Bedrock Guardrails para barrar entradas de usuários e respostas do modelo com conteúdo nocivo. Quais duas opções são categorias predefinidas dos filtros de conteúdo do Guardrails? (Selecione DUAS opções.)",
        explanation:
            "Os filtros de conteúdo do Amazon Bedrock Guardrails têm categorias predefinidas, como ódio, insultos, sexual, violência, má conduta e ataque de prompt, aplicadas a entradas e respostas. Política, apostas e criptomoedas não são categorias predefinidas; assuntos assim só seriam barrados com tópicos negados criados pela empresa.",
        topic: "IA responsável",
        options: [
            ["Ódio", true],
            ["Violência", true],
            ["Política", false],
            ["Apostas", false],
            ["Criptomoedas", false],
        ],
    },
    {
        statement:
            "O responsável por um fórum online quer impedir que usuários publiquem conteúdo discriminatório e planeja usar o Amazon Bedrock. Como ele pode usar o Amazon Bedrock para atender a esse requisito?",
        explanation:
            "Com o Amazon Bedrock Guardrails, o fórum define tópicos negados e usa filtros de conteúdo, como a categoria de ódio, para bloquear entradas e saídas discriminatórias. Restringir as conversas a tópicos permitidos limitaria o uso normal sem mirar o conteúdo nocivo, e interagir por preferência ou escolher entre respostas não filtra nada.",
        topic: "IA responsável",
        options: [
            ["Bloquear interações ligadas a tópicos ou categorias proibidos de antemão", true],
            [
                "Restringir as conversas a uma lista de tópicos permitidos definida previamente",
                false,
            ],
            ["Permitir que os usuários interajam conforme suas preferências pessoais", false],
            [
                "Oferecer várias respostas possíveis para que os usuários escolham a mais adequada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe treina um modelo que gera imagens de pessoas em diversas profissões, mas dados desbalanceados distorcem certos atributos e introduzem viés. Qual técnica resolve esse problema?",
        explanation:
            "Aumentar os dados para equilibrar as classes sub-representadas reduz a distorção que causa o viés, atacando o problema na origem. Monitorar a distribuição só detecta o desequilíbrio, treinar mais épocas nos mesmos dados reforça o viés e filtros de saída barram resultados sem corrigir o conjunto de dados.",
        topic: "IA responsável",
        options: [
            ["Aumentar os dados para equilibrar as classes sub-representadas", true],
            ["Monitorar a distribuição das classes depois da implantação", false],
            ["Treinar por mais épocas com os mesmos dados desbalanceados", false],
            ["Aplicar filtros de saída mais rígidos às imagens geradas pelo modelo", false],
        ],
    },
    {
        statement:
            "Uma auditoria descobriu que o modelo de aprovação de empréstimos de um banco, ajustado com fine-tuning, favorece um grupo demográfico. Qual é a correção de melhor custo-benefício?",
        explanation:
            "Adicionar dados diversos e representativos e refazer o fine-tuning do modelo existente ensina o modelo a tratar os grupos de forma justa, com custo bem menor. RAG traz contexto externo sem corrigir o viés aprendido, pré-treinar um modelo novo é muito mais caro e o Guardrails filtra conteúdo nocivo, não o viés demográfico das decisões.",
        topic: "IA responsável",
        options: [
            ["Adicionar dados diversos e representativos e refazer o fine-tuning", true],
            ["Usar Retrieval Augmented Generation (RAG) com o modelo já ajustado", false],
            ["Pré-treinar um modelo totalmente novo com dados mais diversos", false],
            ["Aplicar o Amazon Bedrock Guardrails para bloquear as saídas enviesadas", false],
        ],
    },
    {
        statement:
            "Um aplicativo de newsletter com Retrieval Augmented Generation (RAG) no Amazon Bedrock está trazendo conteúdo com viés político. Qual recurso do Amazon Bedrock Guardrails pode filtrar esse conteúdo?",
        explanation:
            "Tópicos negados permitem definir assuntos que o modelo deve evitar, como política, e o Guardrails bloqueia entradas e respostas sobre eles. Filtros de palavras barram só termos exatos, filtros de conteúdo cobrem categorias como ódio e violência, e filtros de informações sensíveis bloqueiam ou mascaram dados como PII.",
        topic: "IA responsável",
        options: [
            ["Filtros de palavras (word filters)", false],
            ["Filtros de conteúdo (content filters)", false],
            ["Tópicos negados (denied topics)", true],
            ["Filtros de informações sensíveis (sensitive information filters)", false],
        ],
    },
    {
        statement:
            "O chatbot de uma loja online precisa filtrar conteúdo nocivo tanto nos prompts dos usuários quanto nas próprias respostas. Qual recurso do Amazon Bedrock atende a esse requisito?",
        explanation:
            "O Amazon Bedrock Guardrails aplica filtros de conteúdo nocivo tanto aos prompts de entrada quanto às respostas do modelo, as salvaguardas de que o chatbot precisa. O AgentCore executa e orquestra agentes, as Knowledge Bases recuperam contexto para RAG e os modelos personalizados ajustam o comportamento, e nenhum deles filtra conteúdo.",
        topic: "IA responsável",
        options: [
            ["Amazon Bedrock Guardrails", true],
            ["Amazon Bedrock AgentCore", false],
            ["Amazon Bedrock Knowledge Bases", false],
            ["Modelos personalizados no Amazon Bedrock", false],
        ],
    },
    {
        statement:
            "Uma empresa usa large language models (LLMs) em aplicativos de tutoria e precisa de salvaguardas configuráveis que imponham regras de segurança padronizadas com o menor esforço. Qual solução atende a esse requisito?",
        explanation:
            "O Amazon Bedrock Guardrails oferece salvaguardas configuráveis que aplicam regras de segurança às entradas e saídas dos LLMs com pouca configuração. Os SageMaker Model Cards documentam os modelos, o Amazon Bedrock Evaluations mede a qualidade e a toxicidade dos modelos sem bloquear nada e o SageMaker JumpStart oferece modelos pré-treinados.",
        topic: "IA responsável",
        options: [
            ["Amazon Bedrock Guardrails", true],
            ["Amazon SageMaker Model Cards", false],
            ["Amazon Bedrock Evaluations", false],
            ["Amazon SageMaker JumpStart", false],
        ],
    },
    {
        statement:
            "Uma empresa criou um chatbot que responde a perguntas em linguagem natural com imagens. Ela quer garantir que o chatbot nunca retorne imagens inadequadas ou indesejadas. Qual solução atende a esse requisito?",
        explanation:
            "APIs de moderação de conteúdo analisam cada imagem antes de chegar ao usuário e bloqueiam material inadequado ou indesejado, o que garante o requisito em tempo de execução. Retreinar com dados públicos não filtra nada e pode trazer mais conteúdo indesejado, a validação só confere o modelo no desenvolvimento e o feedback dos usuários chega depois do problema.",
        topic: "IA responsável",
        options: [
            ["Integrar APIs de moderação de conteúdo às imagens retornadas", true],
            ["Retreinar o modelo com um grande conjunto de dados público", false],
            ["Automatizar a coleta de feedback dos usuários sobre as respostas", false],
            ["Realizar a validação do modelo antes de colocá-lo em produção", false],
        ],
    },
    {
        statement:
            "Uma varejista de eletrônicos criou um assistente de IA que responde a dúvidas de clientes com base nos manuais dos produtos. Qual abordagem tem mais chance de aumentar a confiança dos clientes nas respostas do assistente?",
        explanation:
            "Links para os trechos do manual que embasam cada resposta permitem que o cliente confira a informação na fonte, o que gera confiança por transparência. A pontuação de confiança é difícil de interpretar e engana quando está alta numa resposta errada, o avatar é só apresentação e o tom de voz da marca não mostra se a informação está correta.",
        topic: "IA responsável",
        options: [
            ["Incluir links para os trechos do manual que embasam cada resposta", true],
            ["Exibir a pontuação de confiança do modelo junto de cada resposta", false],
            ["Dar ao assistente um avatar robótico exibido na tela do atendimento", false],
            ["Ajustar o assistente para usar o tom de voz da marca nas respostas", false],
        ],
    },
    {
        statement:
            "Uma editora usa um modelo de IA generativa para criar ilustrações para seus livros e descobre que algumas imagens geradas se parecem muito com obras de outras editoras protegidas por direitos autorais. Que preocupação de IA responsável isso representa?",
        explanation:
            "Gerar imagens muito parecidas com obras protegidas cria risco de violação de propriedade intelectual, um risco legal da IA generativa que exige curadoria dos dados e revisão das saídas. Alucinação é inventar conteúdo plausível e incorreto, data drift é a mudança dos dados de entrada com o tempo e overfitting é memorizar o treino e generalizar mal.",
        topic: "IA responsável",
        options: [
            ["Alucinação do modelo", false],
            ["Violação de propriedade intelectual", true],
            ["Desvio de dados (data drift)", false],
            ["Overfitting aos dados de treinamento", false],
        ],
    },
    {
        statement:
            "Um banco implanta um chatbot de IA generativa que dá orientações financeiras incorretas a vários clientes, o que gera reclamações e cobertura negativa na imprensa. Qual risco legal da IA generativa o banco está enfrentando?",
        explanation:
            "A perda da confiança dos clientes é um dos riscos legais da IA generativa: respostas incorretas ou nocivas abalam a confiança na empresa e trazem reclamações, dano à reputação e escrutínio regulatório. Viés de amostragem é problema de qualidade dos dados, underfitting é um modelo simples demais e latência é questão de desempenho.",
        topic: "IA responsável",
        options: [
            ["Viés de amostragem nos dados de treinamento", false],
            ["Perda da confiança dos clientes", true],
            ["Underfitting do modelo", false],
            ["Aumento da latência de inferência", false],
        ],
    },
    {
        statement:
            "Uma empresa vai disponibilizar aos clientes uma aplicação de IA generativa. Qual destes é um risco legal que ela deve considerar antes do lançamento?",
        explanation:
            "Saídas incorretas ou enviesadas podem causar danos reais aos usuários finais, como orientações erradas ou decisões injustas, e isso gera responsabilização, multas regulatórias e processos, um risco legal a considerar. Tempo de treinamento, uso de hardware e custos de nuvem são questões operacionais e financeiras, não riscos legais para os usuários.",
        topic: "IA responsável",
        options: [
            ["Danos aos usuários finais por saídas incorretas ou enviesadas", true],
            ["Aumento do tempo de treinamento dos modelos usados na aplicação", false],
            ["Uso mais intenso de hardware durante a inferência do modelo", false],
            ["Custos maiores de computação em nuvem para rodar a aplicação", false],
        ],
    },
    {
        statement:
            "Uma empresa está decidindo entre uma rede neural profunda e uma árvore de decisão para uma aplicação voltada a clientes. A rede neural é mais precisa, mas a empresa precisa explicar cada decisão aos órgãos reguladores. Que trade-off essa escolha representa?",
        explanation:
            "No trade-off entre interpretabilidade e desempenho, modelos complexos como redes neurais profundas costumam acertar mais, mas são difíceis de explicar, enquanto árvores de decisão são fáceis de interpretar e podem perder precisão. Custo e latência, tempo de treino e acurácia, e volume de dados e tamanho do modelo são outros trade-offs.",
        topic: "IA responsável",
        options: [
            ["Interpretabilidade versus desempenho", true],
            ["Custo versus latência", false],
            ["Tempo de treinamento versus acurácia", false],
            ["Volume de dados versus tamanho do modelo", false],
        ],
    },
];
