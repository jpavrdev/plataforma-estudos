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
    },
};
