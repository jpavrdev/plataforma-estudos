import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AZURE AI-900, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam a ligação entre a tarefa e o serviço, além das separações
 * entre conceitos parecidos que a prova cobra.
 */
export const azureAi900: CartasDaTrilha = {
    trilha: "AZURE AI-900",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que carga de trabalho prevê números ou categorias?",
                        verso: "Machine learning.",
                    },
                    {
                        frente: "Que carga de trabalho interpreta imagens?",
                        verso: "Visão computacional.",
                    },
                    {
                        frente: "Que carga de trabalho entende fala e texto?",
                        verso: "Processamento de linguagem natural.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o princípio da transparência trata?",
                        verso: "Entender como a IA funciona.",
                    },
                    {
                        frente: "O que o princípio da responsabilidade trata?",
                        verso: "Ter pessoas que respondem pela IA.",
                    },
                    {
                        frente: "O que a imparcialidade combate?",
                        verso: "O viés contra grupos.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que a regressão prevê?",
                        verso: "Um valor numérico.",
                    },
                    {
                        frente: "O que a classificação prevê?",
                        verso: "Uma categoria.",
                    },
                    {
                        frente: "O que o clustering faz?",
                        verso: "Agrupa os dados sem rótulo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que caracteriza overfitting?",
                        verso: "Vai bem no treino e mal em dados novos.",
                    },
                    {
                        frente: "O que caracteriza underfitting?",
                        verso: "Vai mal até no treino.",
                    },
                    {
                        frente: "O que a precisão penaliza?",
                        verso: "Os falsos positivos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o AutoML faz?",
                        verso: "Acha o melhor modelo sozinho.",
                    },
                    {
                        frente: "O que o Designer permite?",
                        verso: "Montar o fluxo sem escrever código.",
                    },
                    {
                        frente: "O que a computação fornece no Azure Machine Learning?",
                        verso: "O poder de processamento para treinar.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que a classificação de imagem rotula?",
                        verso: "A imagem inteira.",
                    },
                    {
                        frente: "O que a detecção de objetos faz?",
                        verso: "Localiza cada item com uma caixa delimitadora.",
                    },
                    {
                        frente: "O que a segmentação semântica classifica?",
                        verso: "Pixel a pixel.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que recurso do Azure AI Vision faz o reconhecimento de texto?",
                        verso: "O Read.",
                    },
                    {
                        frente: "Que tipos de texto o Read extrai?",
                        verso: "Impresso e manuscrito.",
                    },
                    {
                        frente: "De onde ele extrai esse texto?",
                        verso: "De imagens e documentos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando usar o Azure AI Vision pré-treinado?",
                        verso: "Para categorias gerais.",
                    },
                    {
                        frente: "Quando usar o Custom Vision?",
                        verso: "Para classes específicas, com imagens próprias.",
                    },
                    {
                        frente: "O que o Custom Vision exige de você?",
                        verso: "Um conjunto de imagens rotuladas para treinar.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que tarefa diz se a opinião é boa ou ruim?",
                        verso: "A análise de sentimento.",
                    },
                    {
                        frente: "Que tarefa devolve os tópicos principais?",
                        verso: "A extração de frases-chave.",
                    },
                    {
                        frente: "Que tarefa acha pessoas, locais e organizações?",
                        verso: "O reconhecimento de entidades nomeadas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a transcrição faz com o idioma?",
                        verso: "Mantém: só troca a fala por texto.",
                    },
                    {
                        frente: "O que a tradução faz?",
                        verso: "Troca o idioma.",
                    },
                    {
                        frente: "Que pista aponta para tradução no cenário?",
                        verso: "A língua mudar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde o texto se analisa no Azure?",
                        verso: "No Azure AI Language.",
                    },
                    {
                        frente: "Onde o áudio de voz se resolve?",
                        verso: "No Azure AI Speech.",
                    },
                    {
                        frente: "Que serviço traduz texto entre idiomas?",
                        verso: "O Azure AI Translator.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que só a IA generativa faz?",
                        verso: "Cria conteúdo novo em resposta a um prompt.",
                    },
                    {
                        frente: "O que as outras cargas de trabalho fazem?",
                        verso: "Analisam o que já existe.",
                    },
                    {
                        frente: "Em que língua o prompt é escrito?",
                        verso: "Em linguagem natural.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Azure OpenAI Service fornece?",
                        verso: "Os modelos generativos.",
                    },
                    {
                        frente: "O que o Azure AI Foundry é?",
                        verso: "A plataforma para construir, avaliar e implantar.",
                    },
                    {
                        frente: "Que famílias de modelo o Azure OpenAI traz?",
                        verso: "Geração de texto, embeddings e geração de imagem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que grounding e RAG combatem?",
                        verso: "A alucinação.",
                    },
                    {
                        frente: "Como eles fazem isso?",
                        verso: "Dando ao modelo dados confiáveis como contexto.",
                    },
                    {
                        frente: "O que os filtros de conteúdo bloqueiam?",
                        verso: "Conteúdo prejudicial, na entrada e na saída.",
                    },
                ],
            },
        },
    },
};
