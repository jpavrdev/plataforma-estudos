import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AWS AI Practitioner, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário e a
 * escolha do serviço; as cartas guardam as definições fechadas, os nomes
 * dos serviços e as separações entre conceitos parecidos que a prova cobra.
 */
export const awsAiPractitioner: CartasDaTrilha = {
    trilha: "AWS AI Practitioner",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que hierarquia a prova cobra entre os três termos?",
                        verso: "IA contém machine learning, que contém deep learning.",
                    },
                    {
                        frente: "O que caracteriza o deep learning dentro do machine learning?",
                        verso: "O uso de redes neurais com muitas camadas.",
                    },
                    {
                        frente: "O que a IA abrange além do machine learning?",
                        verso: "Também os sistemas de regras escritas à mão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o aprendizado supervisionado exige nos dados?",
                        verso: "Rótulos, com a resposta certa em cada exemplo.",
                    },
                    {
                        frente: "O que o aprendizado não supervisionado busca?",
                        verso: "Estrutura nos dados, sem rótulo nenhum.",
                    },
                    {
                        frente: "Como o aprendizado por reforço aprende?",
                        verso: "Por tentativa e erro, guiado por recompensa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tarefa devolve uma categoria conhecida?",
                        verso: "Classificação.",
                    },
                    {
                        frente: "Que tarefa devolve um número contínuo?",
                        verso: "Regressão.",
                    },
                    {
                        frente: "Que tarefa acha grupos sem rótulo?",
                        verso: "Clustering.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que dados ruins geram?",
                        verso: "Modelos ruins.",
                    },
                    {
                        frente: "O que não compensa informação errada ou enviesada?",
                        verso: "Nem um modelo maior, nem mais dados.",
                    },
                    {
                        frente: "Que etapa costuma consumir mais tempo no ciclo de ML?",
                        verso: "A preparação dos dados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que indica ir bem no treino e mal no teste?",
                        verso: "Overfitting.",
                    },
                    {
                        frente: "O que indica ir mal nos dois?",
                        verso: "Underfitting.",
                    },
                    {
                        frente: "O que o recall mede?",
                        verso: "Quanto dos casos positivos reais o modelo encontrou.",
                    },
                ],
            },
            6: {
                neutra: [
                    {
                        frente: "Que serviço gerenciado cobre o ciclo de ML na AWS?",
                        verso: "O Amazon SageMaker.",
                    },
                    {
                        frente: "Que serviço da AWS analisa imagem e vídeo?",
                        verso: "O Amazon Rekognition.",
                    },
                    {
                        frente: "Que serviço da AWS transcreve fala em texto?",
                        verso: "O Amazon Transcribe.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que três marcas definem um foundation model?",
                        verso: "Grande, pré-treinado em vastos dados e adaptável a muitas tarefas.",
                    },
                    {
                        frente: "O que um foundation model não é?",
                        verso: "Um modelo de tarefa única nem um banco de dados.",
                    },
                    {
                        frente: "O que a IA generativa produz?",
                        verso: "Conteúdo novo, e não apenas uma classificação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é um token?",
                        verso: "A unidade de texto que o modelo processa.",
                    },
                    {
                        frente: "O que é um embedding?",
                        verso: "O significado transformado em vetor.",
                    },
                    {
                        frente: "O que a janela de contexto limita?",
                        verso: "Quantos tokens cabem numa interação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Amazon Bedrock entrega?",
                        verso: "Foundation models de vários fornecedores, por API.",
                    },
                    {
                        frente: "Que tipo de serviço o Bedrock é?",
                        verso: "Gerenciado, sem infraestrutura para administrar.",
                    },
                    {
                        frente: "O que o Bedrock dispensa o cliente de fazer?",
                        verso: "Hospedar e operar a infraestrutura do modelo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que tipo de tarefa combina com IA generativa?",
                        verso: "Conteúdo aberto: texto, código, imagem e resumo.",
                    },
                    {
                        frente: "Que tipo de tarefa combina com lógica tradicional?",
                        verso: "Cálculo exato e regra fixa.",
                    },
                    {
                        frente: "Que desafios a IA generativa traz junto?",
                        verso: "Custo, latência e resposta não determinística.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Amazon Q é?",
                        verso: "Um assistente generativo gerenciado da AWS.",
                    },
                    {
                        frente: "Que trabalho o Amazon Q dispensa?",
                        verso: "Montar o assistente peça por peça.",
                    },
                    {
                        frente: "Com o que o Amazon Q se conecta na empresa?",
                        verso: "Com fontes de dados corporativas, por conectores.",
                    },
                ],
            },
            6: {
                neutra: [
                    {
                        frente: "O que é uma alucinação?",
                        verso: "Conteúdo plausível, porém falso.",
                    },
                    {
                        frente: "O que a IA generativa ainda exige, mesmo poderosa?",
                        verso: "Verificação, guardrails e supervisão humana.",
                    },
                    {
                        frente: "Que reflexo a alucinação impõe a quem usa?",
                        verso: "Conferir o que importa antes de confiar.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que é um prompt zero-shot?",
                        verso: "Pedido feito sem nenhum exemplo junto.",
                    },
                    {
                        frente: "O que o few-shot acrescenta ao prompt?",
                        verso: "Alguns exemplos do formato esperado.",
                    },
                    {
                        frente: "O que a cadeia de raciocínio pede ao modelo?",
                        verso: "Mostrar os passos antes da resposta final.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que temperatura e top-p controlam?",
                        verso: "A diversidade da resposta.",
                    },
                    {
                        frente: "O que o máximo de tokens controla?",
                        verso: "O tamanho da resposta.",
                    },
                    {
                        frente: "O que nenhum desses parâmetros garante?",
                        verso: "Que a resposta é verdadeira.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o RAG faz com dados externos?",
                        verso: "Recupera e injeta no prompt.",
                    },
                    {
                        frente: "Que três ganhos o RAG traz?",
                        verso: "Menos alucinação, dado atual sem retreino e citação de fonte.",
                    },
                    {
                        frente: "O que o RAG dispensa quando o dado muda?",
                        verso: "Retreinar o modelo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma Knowledge Base do Bedrock resolve?",
                        verso: "A montagem do RAG, já gerenciada.",
                    },
                    {
                        frente: "O que um Agent do Bedrock acrescenta?",
                        verso: "A capacidade de chamar ações e APIs.",
                    },
                    {
                        frente: "O que o Agent decide sozinho?",
                        verso: "Que passos executar para atender ao pedido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que dados que mudam sempre pedem?",
                        verso: "RAG: atualiza a base, sem retreinar.",
                    },
                    {
                        frente: "O que especializar o comportamento pede?",
                        verso: "Fine-tuning.",
                    },
                    {
                        frente: "Que abordagem tentar primeiro, por ser mais barata?",
                        verso: "A engenharia de prompt.",
                    },
                ],
            },
            6: {
                neutra: [
                    {
                        frente: "O que um modelo menor entrega?",
                        verso: "Mais barato e rápido, porém menos capaz.",
                    },
                    {
                        frente: "O que é injeção de prompt?",
                        verso: "Entrada que tenta subverter as instruções do sistema.",
                    },
                    {
                        frente: "Que defesa a injeção de prompt exige?",
                        verso: "Guardrails e desconfiança da entrada do usuário.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a IA responsável trata?",
                        verso: "Justiça, transparência, segurança e privacidade no uso da IA.",
                    },
                    {
                        frente: "Que exigência ela faz sobre a decisão do modelo?",
                        verso: "Que possa ser explicada a quem é afetado por ela.",
                    },
                    {
                        frente: "Quando a IA responsável entra no projeto?",
                        verso: "Desde o desenho, e não no fim.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é viés num modelo?",
                        verso: "Erro sistemático que trata grupos de forma injusta.",
                    },
                    {
                        frente: "De onde o viés costuma ser herdado?",
                        verso: "De dados desequilibrados.",
                    },
                    {
                        frente: "Que serviço da AWS ajuda a detectar viés?",
                        verso: "O SageMaker Clarify.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a explicabilidade responde?",
                        verso: "Por que o modelo chegou àquela saída.",
                    },
                    {
                        frente: "Que documentação a AWS publica sobre seus serviços de IA?",
                        verso: "Os AWS AI Service Cards.",
                    },
                    {
                        frente: "Que troca a explicabilidade costuma enfrentar?",
                        verso: "Modelo mais complexo costuma ser mais difícil de explicar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que os guardrails limitam?",
                        verso: "O conteúdo que pode ser gerado.",
                    },
                    {
                        frente: "O que a supervisão humana revisa?",
                        verso: "As decisões de alto impacto.",
                    },
                    {
                        frente: "Que papel os dois cumprem juntos?",
                        verso: "São pilares da IA responsável.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Do que a AWS cuida no modelo compartilhado?",
                        verso: "Da segurança da nuvem.",
                    },
                    {
                        frente: "Do que o cliente cuida?",
                        verso: "Da segurança na nuvem, incluindo acesso e dados.",
                    },
                    {
                        frente: "Que princípio aplicar no IAM?",
                        verso: "O do menor privilégio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde criptografar os dados?",
                        verso: "Em repouso e em trânsito.",
                    },
                    {
                        frente: "Que serviço gerencia as chaves na AWS?",
                        verso: "O AWS KMS.",
                    },
                    {
                        frente: "Que serviço descobre e protege dado pessoal no S3?",
                        verso: "O Amazon Macie.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Os dados do cliente treinam os modelos base no Bedrock?",
                        verso: "Não treinam.",
                    },
                    {
                        frente: "Que serviço dá conectividade privada à rede da AWS?",
                        verso: "O AWS PrivateLink.",
                    },
                    {
                        frente: "O que o PrivateLink evita no tráfego?",
                        verso: "Sair para a internet pública.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que serviço registra as chamadas de API na conta?",
                        verso: "O AWS CloudTrail.",
                    },
                    {
                        frente: "Que serviço coleta métricas e logs?",
                        verso: "O Amazon CloudWatch.",
                    },
                    {
                        frente: "Que pergunta o CloudTrail responde numa auditoria?",
                        verso: "Quem chamou o quê, e quando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que dois reflexos a prova cobra?",
                        verso: "Ligar cenário a serviço e separar conceitos parecidos.",
                    },
                    {
                        frente: "Que prática a aula recomenda para fechar?",
                        verso: "Fazer o simulado e revisar as explicações.",
                    },
                    {
                        frente: "Que armadilha os conceitos parecidos criam?",
                        verso: "Opções quase certas na mesma questão.",
                    },
                ],
            },
        },
    },
};
