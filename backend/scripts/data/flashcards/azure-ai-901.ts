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
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a mensagem de sistema define?",
                        verso: "Quem o modelo é e como deve agir, uma vez só.",
                    },
                    {
                        frente: "O que a mensagem de usuário traz?",
                        verso: "O pedido concreto de cada rodada.",
                    },
                    {
                        frente: "Qual das duas se repete a cada interação?",
                        verso: "A do usuário.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "No que o deploy transforma um modelo do catálogo?",
                        verso: "Num endpoint pronto para uso.",
                    },
                    {
                        frente: "O que o código referencia depois do deploy?",
                        verso: "O nome do deployment.",
                    },
                    {
                        frente: "Onde os parâmetros de geração podem ser ajustados?",
                        verso: "No portal e também na própria chamada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o cliente de projeto faz no SDK do Foundry?",
                        verso: "Conecta a aplicação ao projeto.",
                    },
                    {
                        frente: "Quem envia as mensagens ao modelo?",
                        verso: "O cliente de inferência.",
                    },
                    {
                        frente: "Onde a resposta do modelo chega?",
                        verso: "Na primeira escolha devolvida, dentro da mensagem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Do que um agente é feito?",
                        verso: "De modelo mais instruções.",
                    },
                    {
                        frente: "O que ele pode ganhar além disso?",
                        verso: "Ferramentas e conhecimento.",
                    },
                    {
                        frente: "Onde a conversa do agente vive?",
                        verso: "Numa thread.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a thread guarda?",
                        verso: "A conversa com o agente.",
                    },
                    {
                        frente: "O que a chamada de execução faz?",
                        verso: "Roda o agente e aguarda a conclusão.",
                    },
                    {
                        frente: "Como a resposta é recuperada?",
                        verso: "Listando as mensagens da thread.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que serviço faz o trabalho num app de análise de texto?",
                        verso: "O Azure AI Language.",
                    },
                    {
                        frente: "O que é preciso para conectar o recurso?",
                        verso: "Endpoint e chave, com o recurso ligado ao projeto.",
                    },
                    {
                        frente: "O que o app entrega, no fim?",
                        verso: "Uma camada fina sobre a chamada do serviço.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o reconhecedor de fala faz?",
                        verso: "Transforma fala em texto.",
                    },
                    {
                        frente: "O que o sintetizador faz?",
                        verso: "Transforma texto em fala.",
                    },
                    {
                        frente: "Que serviço cobre os dois sentidos da voz?",
                        verso: "O Azure AI Speech.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três peças respondem a um prompt falado?",
                        verso: "Transcrição, modelo multimodal e síntese de voz.",
                    },
                    {
                        frente: "Quem transcreve a fala?",
                        verso: "O Azure AI Speech.",
                    },
                    {
                        frente: "Quem gera a resposta?",
                        verso: "O modelo multimodal publicado no Foundry.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um modelo multimodal recebe?",
                        verso: "Imagem e texto no mesmo prompt.",
                    },
                    {
                        frente: "Como ele responde?",
                        verso: "De forma aberta, ao que foi perguntado.",
                    },
                    {
                        frente: "Como o serviço de visão clássico responde?",
                        verso: "Com saídas fixas e previsíveis.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que gerar imagem faz?",
                        verso: "Cria um resultado visual novo a partir de um texto.",
                    },
                    {
                        frente: "Que duas etapas um app leve de visão encadeia?",
                        verso: "Interpretação e geração.",
                    },
                    {
                        frente: "Quem interpreta nessa dupla?",
                        verso: "O modelo multimodal.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "No que o Content Understanding transforma documentos?",
                        verso: "Em JSON estruturado.",
                    },
                    {
                        frente: "O que você define antes de usar?",
                        verso: "Um analisador, com os campos desejados.",
                    },
                    {
                        frente: "O que vem junto de cada campo extraído?",
                        verso: "O valor e a confiança dele.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que ele faz em imagens, além de ler o texto?",
                        verso: "Devolve campos nomeados, descrição e classificação.",
                    },
                    {
                        frente: "Em quantas passadas isso acontece?",
                        verso: "Numa passada só.",
                    },
                    {
                        frente: "O que a leitura de texto sozinha entrega?",
                        verso: "Apenas o texto lido.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que ele faz com áudio e vídeo?",
                        verso: "Transcreve e extrai campos no mesmo passo.",
                    },
                    {
                        frente: "Que campos costumam sair daí?",
                        verso: "Resumo, sentimento e os que você definir.",
                    },
                    {
                        frente: "Que ganho isso traz sobre transcrever e analisar depois?",
                        verso: "Uma chamada só, no lugar de duas etapas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um app de extração de informação?",
                        verso: "Uma camada fina sobre o Content Understanding.",
                    },
                    {
                        frente: "Quantas vezes o analisador é definido?",
                        verso: "Uma vez só.",
                    },
                    {
                        frente: "Para que serve a confiança devolvida?",
                        verso: "Para decidir o que segue automático e o que vai a revisão.",
                    },
                ],
            },
        },
    },
};
