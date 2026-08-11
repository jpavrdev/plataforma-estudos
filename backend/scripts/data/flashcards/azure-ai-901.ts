import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AZURE AI-901, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário e a
 * construção no Foundry; as cartas guardam as definições fechadas, os
 * parâmetros e as separações entre serviços parecidos.
 */
export const azureAi901: CartasDaTrilha = {
    trilha: "AZURE AI-901",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que carga de trabalho gera conteúdo a partir de um prompt?",
                        verso: "A IA generativa.",
                    },
                    {
                        frente: "O que caracteriza a IA agêntica?",
                        verso: "Perseguir um objetivo planejando passos e usando ferramentas.",
                    },
                    {
                        frente: "Que autonomia a IA agêntica tem?",
                        verso: "Age sozinha até alcançar o objetivo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta escolhe a carga de trabalho certa?",
                        verso: "O que o cenário precisa produzir ou entender.",
                    },
                    {
                        frente: "Que carga o cenário de criar texto novo pede?",
                        verso: "A generativa.",
                    },
                    {
                        frente: "Que carga o cenário de classificar o que já existe pede?",
                        verso: "A de machine learning.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a imparcialidade combate?",
                        verso: "O viés contra grupos.",
                    },
                    {
                        frente: "O que a confiabilidade e segurança garante?",
                        verso: "Comportamento seguro mesmo diante do inesperado.",
                    },
                    {
                        frente: "O que a privacidade e segurança protege?",
                        verso: "Os dados das pessoas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a transparência explica?",
                        verso: "Como a IA funciona.",
                    },
                    {
                        frente: "O que a responsabilização define?",
                        verso: "Quem responde pela IA.",
                    },
                    {
                        frente: "O que a inclusão garante?",
                        verso: "Que todos consigam usar o sistema.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a IA responsável não é?",
                        verso: "Uma etapa extra no fim do projeto.",
                    },
                    {
                        frente: "O que ela é, então?",
                        verso: "Projetar os seis princípios dentro da própria solução.",
                    },
                    {
                        frente: "Onde ela entra na IA agêntica?",
                        verso: "Nos limites do que o agente pode fazer sozinho.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que um modelo generativo prevê?",
                        verso: "O próximo token, a partir do contexto.",
                    },
                    {
                        frente: "Em que ele quebra o texto?",
                        verso: "Em tokens.",
                    },
                    {
                        frente: "Como ele representa significado?",
                        verso: "Com embeddings.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como são os modelos grandes?",
                        verso: "Generalistas, mais capazes e mais caros.",
                    },
                    {
                        frente: "Como são os modelos pequenos?",
                        verso: "Menores, mais baratos e rápidos, rodam até no dispositivo.",
                    },
                    {
                        frente: "Que equilíbrio guia a escolha entre eles?",
                        verso: "Entre a capacidade necessária e o custo aceito.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que critério escolher o modelo?",
                        verso: "Pela capacidade de que você precisa.",
                    },
                    {
                        frente: "Que capacidades a aula lista?",
                        verso: "Texto, embeddings, multimodal, imagem e fala.",
                    },
                    {
                        frente: "Onde encontrar o modelo no Azure?",
                        verso: "No catálogo de modelos do Microsoft Foundry.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que temperature e top-p controlam?",
                        verso: "O quanto a resposta é criativa ou previsível.",
                    },
                    {
                        frente: "O que o limite de tokens controla?",
                        verso: "O tamanho da saída.",
                    },
                    {
                        frente: "O que as penalidades de frequência e presença reduzem?",
                        verso: "A repetição na resposta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Microsoft Foundry reúne?",
                        verso: "Catálogo, playground, ferramentas, deploy e SDK.",
                    },
                    {
                        frente: "Qual é o caminho típico na plataforma?",
                        verso: "Escolher o modelo, publicar, testar e ligar ao código.",
                    },
                    {
                        frente: "O que o deploy cria?",
                        verso: "Um endpoint pronto para uso.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que a classificação de imagem rotula?",
                        verso: "A foto inteira.",
                    },
                    {
                        frente: "O que a detecção de objetos entrega?",
                        verso: "Cada item localizado com uma caixa.",
                    },
                    {
                        frente: "O que o reconhecimento de texto em imagem faz?",
                        verso: "Lê o texto que está na foto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o reconhecimento de fala faz?",
                        verso: "Transforma voz em texto, no mesmo idioma.",
                    },
                    {
                        frente: "O que a síntese de fala faz?",
                        verso: "Transforma texto em voz.",
                    },
                    {
                        frente: "Que pista aponta para tradução de fala?",
                        verso: "A língua mudar entre a entrada e a saída.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tarefa identifica opinião boa ou ruim?",
                        verso: "A análise de sentimento.",
                    },
                    {
                        frente: "Que tarefa devolve os tópicos principais?",
                        verso: "A extração de frases-chave.",
                    },
                    {
                        frente: "Que tarefa acha pessoas, locais e datas?",
                        verso: "A detecção de entidades.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "No que a extração de informação transforma o conteúdo?",
                        verso: "Em dados estruturados.",
                    },
                    {
                        frente: "Que formatos de entrada ela aceita?",
                        verso: "Texto, imagem, áudio e vídeo.",
                    },
                    {
                        frente: "Que capacidades ela reaproveita?",
                        verso: "Leitura de texto, reconhecimento de fala e detecção de entidades.",
                    },
                ],
            },
        },
    },
};
