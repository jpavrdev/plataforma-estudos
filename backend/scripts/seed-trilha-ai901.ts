// Seed da trilha AI-901 (Microsoft Azure AI Fundamentals, exame novo que substituiu o
// AI-900). Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-ai901.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AZURE AI-901";
const DESCRICAO =
    "Trilha de fundamentos de inteligência artificial no Microsoft Azure para a certificação AI-901: conceitos e IA responsável, modelos de IA, visão, fala e análise de texto, e a implementação de apps generativos, agentes e extração de informação com o Microsoft Foundry.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        "titulo": "Módulo 1 - Fundamentos de IA e IA responsável",
        "aulas": [
            {
                "titulo": "O que é IA e as cargas de trabalho de IA",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é inteligência artificial\nInteligência artificial é software que imita capacidades associadas à inteligência humana: aprender com dados, reconhecer padrões, entender linguagem, interpretar imagens, tomar decisões e, mais recentemente, criar conteúdo novo. Em vez de seguir apenas regras escritas à mão, um sistema de IA aprende a partir de exemplos e melhora conforme recebe mais dados.\n\nO exame AI-901 organiza a IA em cargas de trabalho (workloads): grupos de capacidades que resolvem um tipo de problema. Boa parte da prova é reconhecer qual carga resolve um cenário descrito, então vale entender bem o que cada uma faz."
                    },
                    {
                        "type": "text",
                        "value": "## As seis cargas de trabalho comuns\n**IA generativa** cria conteúdo novo e original, como texto, imagem, código ou áudio, em resposta a uma instrução em linguagem natural (um prompt). Exemplo: redigir o rascunho de um e-mail a partir de alguns tópicos.\n\n**IA agêntica (agentes)** vai além de gerar conteúdo: um agente recebe um objetivo, planeja passos, usa ferramentas e toma ações para alcançá-lo, com algum grau de autonomia. Exemplo: um assistente que consulta o calendário, verifica a disponibilidade e agenda uma reunião sozinho.\n\n**Análise de texto** extrai informação de textos que já existem: sentimento, entidades, frases-chave e resumos. Exemplo: descobrir se avaliações de clientes são positivas ou negativas.\n\n**Fala** converte fala em texto e texto em fala, além de traduzir idioma falado. Exemplo: gerar a legenda automática de um vídeo.\n\n**Visão computacional** interpreta imagens e vídeos e também gera imagens novas. Exemplo: identificar produtos numa foto de prateleira.\n\n**Extração de informação** transforma documentos, formulários, imagens, áudio e vídeo em dados estruturados. Exemplo: ler o valor e o vencimento de milhares de faturas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Carga de trabalho\", \"O que faz\", \"Exemplo\", \"Serviço ou plataforma\"], [\"IA generativa\", \"Cria conteúdo novo a partir de um prompt\", \"Redigir um texto de marketing\", \"Modelos generativos no Microsoft Foundry\"], [\"IA agêntica\", \"Planeja e age para cumprir um objetivo\", \"Agendar uma reunião sozinho\", \"Agentes no Microsoft Foundry\"], [\"Análise de texto\", \"Extrai sentimento, entidades e frases-chave\", \"Classificar avaliações de clientes\", \"Azure AI Language\"], [\"Fala\", \"Converte fala em texto e texto em fala\", \"Legenda automática de vídeo\", \"Azure AI Speech\"], [\"Visão computacional\", \"Interpreta e gera imagens\", \"Detectar objetos numa foto\", \"Azure AI Vision\"], [\"Extração de informação\", \"Estrutura dados de documentos e mídia\", \"Ler campos de faturas\", \"Azure Content Understanding\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Generativa x agêntica: qual a diferença\nEssas duas cargas costumam confundir, e o AI-901 gosta de testar a distinção. A IA generativa responde a um pedido produzindo conteúdo: você dá um prompt e ela devolve um texto, uma imagem ou um código. Ela não age no mundo por conta própria; a cada pedido, gera uma resposta e para.\n\nA IA agêntica usa um modelo generativo como \"cérebro\", mas recebe um objetivo e trabalha para cumpri-lo: decide os passos, chama ferramentas (como buscar um dado ou disparar uma ação), avalia o resultado e segue até concluir, com autonomia. Se o cenário fala apenas em gerar um conteúdo, é generativa; se fala em perseguir uma meta, usar ferramentas e agir em vários passos, é agêntica."
                    },
                    {
                        "type": "quote",
                        "value": "Gerar conteúdo a partir de um prompt é IA generativa; perseguir um objetivo planejando passos, usando ferramentas e agindo com autonomia é IA agêntica."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe de marketing quer um sistema que escreva descrições de produtos originais a partir de poucas palavras-chave. Qual carga de trabalho atende a esse pedido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "IA generativa",
                                "isCorrect": true
                            },
                            {
                                "text": "Análise de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Visão computacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração de informação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um SAC quer descobrir automaticamente se cada comentário de cliente é positivo, negativo ou neutro. Qual carga de trabalho resolve isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Análise de texto",
                                "isCorrect": true
                            },
                            {
                                "text": "IA generativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração de informação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer um assistente que, ao receber o objetivo \"organize minha viagem\", consulte voos, escolha horários e faça a reserva sozinho, em vários passos. Qual carga de trabalho descreve melhor essa solução?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "IA agêntica",
                                "isCorrect": true
                            },
                            {
                                "text": "IA generativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Visão computacional",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O setor financeiro recebe milhares de faturas em PDF e quer transformar cada uma em campos estruturados (fornecedor, valor, vencimento) sem digitação manual. Qual carga de trabalho é a indicada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extração de informação",
                                "isCorrect": true
                            },
                            {
                                "text": "Análise de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "IA generativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Visão computacional",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas soluções usam o mesmo modelo generativo. A solução A recebe um prompt e devolve um resumo do texto colado. A solução B recebe a meta \"reduza os chamados em aberto\", consulta o sistema de tickets, prioriza e responde os mais simples sozinha. Qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A solução A é IA generativa e a solução B é IA agêntica",
                                "isCorrect": true
                            },
                            {
                                "text": "Ambas as soluções são IA agêntica",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambas as soluções são IA generativa",
                                "isCorrect": false
                            },
                            {
                                "text": "A solução A é IA agêntica e a solução B é IA generativa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cenários das cargas: quando usar cada uma",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Análise de texto e suas técnicas\nA análise de texto reúne técnicas que extraem informação de um texto já escrito. As quatro mais cobradas são:\n\n- **Análise de sentimento**: classifica o tom do texto como positivo, negativo ou neutro. Serve para medir a satisfação em avaliações e redes sociais.\n- **Reconhecimento de entidades (entity detection)**: encontra e classifica itens citados no texto, como nomes de pessoas, lugares, organizações, datas e quantias.\n- **Extração de frases-chave (key phrase extraction)**: identifica os termos e assuntos principais de um texto, resumindo sobre o que ele fala.\n- **Sumarização**: gera um resumo curto com os pontos essenciais de um texto longo.\n\nNo Azure, essas técnicas ficam no serviço Azure AI Language."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica de análise de texto\", \"O que entrega\", \"Cenário típico\"], [\"Análise de sentimento\", \"Tom positivo, negativo ou neutro\", \"Medir satisfação em avaliações\"], [\"Reconhecimento de entidades\", \"Pessoas, lugares, datas e valores citados\", \"Marcar nomes e datas em contratos\"], [\"Extração de frases-chave\", \"Principais termos e assuntos do texto\", \"Descobrir os assuntos de muitos tíquetes\"], [\"Sumarização\", \"Resumo curto de um texto longo\", \"Condensar um relatório em poucos pontos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fala: reconhecimento e síntese\nA carga de fala trabalha a linguagem falada em dois sentidos:\n\n- **Reconhecimento de fala (speech-to-text)**: transcreve áudio em texto. É o que gera legendas e transcrições de reuniões, ou permite ditar um comando.\n- **Síntese de fala (text-to-speech)**: faz o caminho inverso, transformando texto em voz natural. É o que dá voz a um assistente ou lê um conteúdo em áudio.\n\nA carga de fala ainda cobre a tradução de fala entre idiomas. No Azure, o serviço é o Azure AI Speech. Vale lembrar que modelos multimodais também conseguem receber um prompt falado e responder, unindo fala e IA generativa."
                    },
                    {
                        "type": "text",
                        "value": "## Visão computacional e geração de imagem\nA visão computacional cobre dois lados que o AI-901 diferencia:\n\n- **Interpretar imagens**: analisar o que já existe numa imagem ou vídeo, como classificar a cena, detectar e localizar objetos, ler texto (OCR) e descrever o conteúdo. Modelos multimodais conseguem receber uma imagem como entrada e responder perguntas sobre ela. Serviço clássico: Azure AI Vision.\n- **Gerar imagens**: criar imagens novas a partir de uma descrição em texto, usando modelos generativos. Aqui a saída é uma imagem inédita, não uma análise.\n\nA dica: se o cenário analisa uma imagem que já existe, é visão computacional de interpretação; se cria uma imagem nova a partir de texto, é geração de imagem (IA generativa aplicada à visão)."
                    },
                    {
                        "type": "text",
                        "value": "## Extração de informação\nA extração de informação transforma conteúdo não estruturado em dados organizados, prontos para um sistema usar. A fonte pode ser um documento ou formulário (uma fatura, um recibo, um contrato), uma imagem, um áudio ou um vídeo. A saída são campos estruturados: fornecedor, valor, data, número do documento e assim por diante.\n\nNo Azure, o serviço que faz essa extração multimodal é o Azure Content Understanding. Não confunda com análise de texto: a análise de texto trabalha sobre texto que já está escrito, enquanto a extração de informação tira os dados de dentro de documentos e mídia, inclusive imagem, áudio e vídeo."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"tipoDocumento\": \"fatura\",\n  \"fornecedor\": \"Café Bom Ltda\",\n  \"numeroDocumento\": \"1042\",\n  \"valorTotal\": 289.90,\n  \"vencimento\": \"2026-08-15\"\n}"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma marca quer saber se as menções a ela nas redes sociais são positivas, negativas ou neutras. Qual técnica de análise de texto usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": true
                            },
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento de entidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Sumarização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo precisa gerar automaticamente as legendas de vídeos, transcrevendo a fala em texto. Qual capacidade da carga de fala resolve isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reconhecimento de fala",
                                "isCorrect": true
                            },
                            {
                                "text": "Síntese de fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Geração de imagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe recebe milhares de tíquetes e quer descobrir, sem ler tudo, quais são os principais assuntos tratados em cada texto. Qual técnica de análise de texto é a mais indicada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": true
                            },
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estúdio quer criar ilustrações inéditas a partir de descrições em texto, como \"um gato astronauta em aquarela\". Qual carga de trabalho atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Geração de imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Análise de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento de entidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma seguradora precisa extrair dados estruturados (número da apólice, datas e valores) de uma mistura de PDFs, imagens de documentos e gravações de áudio de atendimento. Qual serviço do Azure é o mais indicado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Azure Content Understanding, multimodal",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Language, só analisa texto já escrito",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Speech, só converte fala e texto falado",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Vision, só interpreta imagem e vídeo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IA responsável I: imparcialidade, confiabilidade e privacidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é IA responsável\nIA responsável é o conjunto de princípios e práticas para desenvolver e usar IA de forma ética, segura e confiável. A Microsoft resume isso em seis princípios. No AI-901, o formato mais comum é receber um cenário e apontar qual princípio ele representa (ou qual foi violado), então vale entender o foco de cada um.\n\nEsta aula cobre os três primeiros: imparcialidade, confiabilidade e segurança, e privacidade e segurança. A próxima aula cobre os outros três."
                    },
                    {
                        "type": "text",
                        "value": "## Imparcialidade (fairness)\nSistemas de IA devem tratar todas as pessoas de forma justa, sem favorecer nem prejudicar grupos por gênero, etnia, idade ou qualquer outra característica. O risco a combater é o viés (bias), que costuma vir dos dados de treinamento. Consideração prática: avaliar o modelo por grupo para checar se ele erra mais para uns do que para outros e curar os dados para reduzir vieses. Exemplo: um modelo de aprovação de crédito não pode recusar mais pedidos de um grupo só por causa do gênero.\n\n## Confiabilidade e segurança (reliability & safety)\nSistemas de IA devem funcionar de forma confiável, consistente e segura, inclusive diante de situações raras ou inesperadas. Consideração prática: testar de forma rigorosa, monitorar em produção e definir como o sistema se comporta quando tem baixa confiança na resposta. Exemplo: o piloto automático de um carro precisa reagir com segurança a uma condição de estrada que nunca viu no treino.\n\n## Privacidade e segurança (privacy & security)\nSistemas de IA devem proteger os dados das pessoas e respeitar a privacidade, garantindo que as informações sejam usadas de forma segura e apenas para o fim previsto. Consideração prática: anonimizar dados, controlar quem acessa e proteger as informações em trânsito e em repouso. Exemplo: anonimizar os dados de pacientes usados para treinar um modelo e restringir o acesso."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"Foco central\", \"Consideração prática\"], [\"Imparcialidade (fairness)\", \"Tratar todos de forma justa, sem viés\", \"Avaliar o modelo por grupo e curar os dados\"], [\"Confiabilidade e segurança (reliability & safety)\", \"Funcionar com segurança mesmo em situações raras\", \"Testar, monitorar e tratar respostas de baixa confiança\"], [\"Privacidade e segurança (privacy & security)\", \"Proteger dados e a privacidade das pessoas\", \"Anonimizar, controlar acesso e proteger os dados\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como não confundir esses três\nImparcialidade é sobre não discriminar grupos por causa de viés. Confiabilidade e segurança é sobre o sistema se comportar bem e com segurança, inclusive em situações que nunca viu. Privacidade e segurança é sobre proteger os dados pessoais e a privacidade. Uma pista: se o cenário fala em discriminação ou tratamento desigual entre grupos, é imparcialidade; se fala em comportamento seguro e consistente diante do inesperado, é confiabilidade e segurança; se fala em proteger dados pessoais, é privacidade e segurança."
                    },
                    {
                        "type": "quote",
                        "value": "Imparcialidade combate o viés contra grupos; confiabilidade e segurança garante comportamento seguro mesmo no inesperado; privacidade e segurança protege os dados das pessoas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um modelo de aprovação de empréstimos passou a recusar mais pedidos de mulheres por causa de um viés presente nos dados de treino. Qual princípio de IA responsável foi violado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Imparcialidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Transparência",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de treinar um modelo, um hospital anonimiza os dados dos pacientes e restringe quem pode acessá-los. Qual princípio está sendo aplicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": true
                            },
                            {
                                "text": "Imparcialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O fabricante de um carro autônomo roda milhares de testes para garantir que o veículo reaja com segurança a situações de trânsito imprevistas. Qual princípio orienta essa preocupação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": true
                            },
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Imparcialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Transparência",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe avalia o modelo de triagem de currículos separadamente para cada grupo, para verificar se ele aprova candidatos de forma parecida entre os grupos. Que princípio essa prática apoia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Imparcialidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Responsabilização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de diagnóstico por imagem foi projetado para, quando tiver baixa confiança no resultado, encaminhar o caso a um médico em vez de decidir sozinho. Qual princípio de IA responsável essa decisão de projeto reforça principalmente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": true
                            },
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Imparcialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IA responsável II: inclusão, transparência e responsabilização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Inclusão (inclusiveness)\nSistemas de IA devem empoderar todas as pessoas e alcançar quem tem alguma deficiência ou faz parte de grupos frequentemente deixados de fora. Consideração prática: projetar para acessibilidade desde o início, com recursos como legendas automáticas, leitor de tela, alto contraste e controle por voz. Exemplo: garantir que uma pessoa cega consiga usar o produto por meio de um leitor de tela.\n\n## Transparência (transparency)\nSistemas de IA devem ser compreensíveis: as pessoas precisam saber como o sistema funciona, para que serve, quais dados usa e quais são suas limitações. Consideração prática: documentar as capacidades e os limites do sistema e avisar o usuário quando ele está interagindo com uma IA. Exemplo: informar que um chat é atendido por uma IA e em que situações ela pode errar.\n\n## Responsabilização (accountability)\nPessoas e organizações devem se responsabilizar pelos sistemas de IA que criam e operam, com governança e supervisão humana. A IA não responde sozinha: quem responde são as pessoas. Consideração prática: definir donos, políticas de governança e manter um humano no controle das decisões críticas (human oversight). Exemplo: uma equipe designada audita o modelo e responde oficialmente por seus resultados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"Foco central\", \"Consideração prática\"], [\"Inclusão (inclusiveness)\", \"Alcançar e empoderar todas as pessoas\", \"Acessibilidade: legendas, leitor de tela, voz\"], [\"Transparência (transparency)\", \"Ser compreensível e explicar limitações\", \"Documentar limites e avisar que é uma IA\"], [\"Responsabilização (accountability)\", \"Pessoas respondem pelo sistema\", \"Governança, donos e supervisão humana\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como não confundir\nAlguns princípios se parecem e a prova explora isso. Transparência é sobre entender como o sistema funciona; responsabilização é sobre quem responde por ele. Inclusão é garantir que todos, inclusive pessoas com deficiência, consigam usar o sistema; não confunda com imparcialidade, que é não discriminar grupos por causa de viés. Uma pista: transparência explica, responsabilização responsabiliza, inclusão dá acesso a todos e imparcialidade evita favorecer ou prejudicar grupos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"Pista no cenário\"], [\"Imparcialidade\", \"Discriminação ou viés contra um grupo\"], [\"Confiabilidade e segurança\", \"Comportamento seguro e consistente, inclusive no inesperado\"], [\"Privacidade e segurança\", \"Proteção de dados pessoais e acesso controlado\"], [\"Inclusão\", \"Acessibilidade para pessoas com deficiência\"], [\"Transparência\", \"Explicar como funciona e avisar que é uma IA\"], [\"Responsabilização\", \"Governança, donos e supervisão humana\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Transparência explica como a IA funciona; responsabilização define quem responde por ela; inclusão garante que todos consigam usar o sistema."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe adiciona legendas automáticas e navegação por voz para que pessoas com deficiência consigam usar o aplicativo. Qual princípio isso representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Inclusão",
                                "isCorrect": true
                            },
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Responsabilização",
                                "isCorrect": false
                            },
                            {
                                "text": "Imparcialidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco publica um documento explicando quais dados o modelo usa, como ele chega às decisões e em que situações pode errar, para que os usuários entendam seu funcionamento. Qual princípio isso representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transparência",
                                "isCorrect": true
                            },
                            {
                                "text": "Responsabilização",
                                "isCorrect": false
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa define uma equipe dona do sistema de IA, com políticas de governança e um humano que aprova as decisões críticas. Qual princípio orienta essa estrutura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Responsabilização",
                                "isCorrect": true
                            },
                            {
                                "text": "Transparência",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiabilidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo de reuniões passa a oferecer transcrição em tempo real para que pessoas surdas acompanhem a conversa. Qual princípio de IA responsável está por trás dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Inclusão",
                                "isCorrect": true
                            },
                            {
                                "text": "Imparcialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Transparência",
                                "isCorrect": false
                            },
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um chatbot de atendimento passa a avisar, no início da conversa, que o usuário está falando com uma IA e não com um humano. Qual princípio essa medida atende diretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Transparência",
                                "isCorrect": true
                            },
                            {
                                "text": "Responsabilização",
                                "isCorrect": false
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Imparcialidade",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IA responsável na prática: generativa e agêntica",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Riscos próprios da IA generativa e agêntica\nPor criar conteúdo novo e, no caso dos agentes, agir para cumprir objetivos, essas cargas trazem riscos que as outras não têm na mesma intensidade:\n\n- **Alucinação**: o modelo produz uma resposta que parece correta e confiante, mas é falsa ou inventada. Como soa convincente, o erro passa despercebido.\n- **Conteúdo nocivo**: geração de material ofensivo, violento, de ódio ou impróprio.\n- **Viés**: o modelo reproduz preconceitos presentes nos dados de treinamento.\n- **Ações indevidas do agente**: como um agente pode tomar ações, uma decisão errada tem efeito no mundo real, não só no texto.\n\nTratar esses riscos é o objetivo da IA responsável aplicada."
                    },
                    {
                        "type": "text",
                        "value": "## Como mitigar cada risco\n- **Grounding (fundamentar)**: conectar o modelo a fontes de dados confiáveis para que as respostas se apoiem em informação real, reduzindo alucinações.\n- **Filtros de conteúdo**: recursos integrados ao Microsoft Foundry (antes chamado Azure AI Foundry) que detectam e bloqueiam conteúdo nocivo, tanto no prompt de entrada quanto na resposta gerada.\n- **Curadoria e avaliação**: revisar os dados e avaliar o modelo pela imparcialidade para reduzir viés.\n- **Supervisão humana (human oversight)**: manter uma pessoa no controle das decisões críticas, especialmente quando um agente pode agir. É a aplicação direta da responsabilização.\n\nNenhuma mitigação sozinha resolve tudo; a IA responsável combina várias."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Risco\", \"Mitigação principal\", \"Princípio mais ligado\"], [\"Alucinação\", \"Grounding em dados confiáveis e revisão humana\", \"Confiabilidade e segurança\"], [\"Conteúdo nocivo\", \"Filtros de conteúdo\", \"Confiabilidade e segurança\"], [\"Viés nos resultados\", \"Curadoria de dados e avaliação por grupo\", \"Imparcialidade\"], [\"Ações indevidas de um agente\", \"Supervisão humana e governança\", \"Responsabilização\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os seis princípios continuam valendo\nOs seis princípios de IA responsável não mudam com a carga de trabalho; eles ganham um foco específico na IA generativa e agêntica. Imparcialidade é reduzir viés nas respostas. Confiabilidade e segurança é usar filtros e testar contra alucinações. Privacidade e segurança é proteger os dados enviados no prompt e no grounding. Inclusão é atender pessoas com necessidades diversas. Transparência é deixar claro que o usuário fala com uma IA e citar as fontes. Responsabilização é manter supervisão humana e governança, sobretudo quando o agente pode agir sozinho."
                    },
                    {
                        "type": "quote",
                        "value": "A IA responsável não é uma etapa extra: é projetar imparcialidade, segurança, privacidade, inclusão, transparência e responsabilização dentro da solução desde o começo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em IA generativa, o que é uma \"alucinação\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma resposta inventada que soa confiante e correta",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de digitação que o usuário comete sem perceber no prompt",
                                "isCorrect": false
                            },
                            {
                                "text": "Um recurso do Foundry que bloqueia conteúdo nocivo na resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "A recusa do modelo em responder por falta de confiança na resposta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual recurso ajuda a impedir que um modelo generativo produza conteúdo ofensivo ou de ódio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Filtros de conteúdo",
                                "isCorrect": true
                            },
                            {
                                "text": "Grounding em dados confiáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer reduzir as respostas inventadas do seu assistente, fazendo com que ele se apoie nos documentos internos confiáveis. Qual abordagem atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apoiar as respostas em documentos internos confiáveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Desativar os filtros de conteúdo do assistente generativo",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a supervisão humana sobre as respostas do assistente",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o assistente de texto por um serviço de síntese de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa vai colocar um agente que pode executar ações (como emitir reembolsos) e decide manter um humano para aprovar cada ação crítica. Qual princípio de IA responsável essa decisão reforça?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Responsabilização",
                                "isCorrect": true
                            },
                            {
                                "text": "Inclusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Transparência",
                                "isCorrect": false
                            },
                            {
                                "text": "Privacidade e segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma seguradora vai lançar um assistente generativo. Ela quer (1) evitar que ele invente coberturas que não existem e (2) garantir que alguém da empresa responda oficialmente pelas decisões do sistema. Quais princípios de IA responsável essas duas metas atendem, na ordem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Confiabilidade e segurança; e responsabilização",
                                "isCorrect": true
                            },
                            {
                                "text": "Responsabilização; e confiabilidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Imparcialidade; e privacidade e segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Privacidade e segurança; e imparcialidade",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Modelos de IA e o Microsoft Foundry",
        "aulas": [
            {
                "titulo": "Como um modelo generativo funciona por dentro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do prompt à resposta, um token de cada vez\nUm modelo generativo de texto, no fundo, faz uma coisa só: prever qual é o próximo pedaço de texto mais provável, dado tudo o que veio antes. Ele recebe o seu prompt, calcula o pedaço mais provável para continuar, acrescenta esse pedaço e repete o processo, agora considerando o que acabou de escrever. É por isso que a resposta vai surgindo aos poucos, palavra após palavra.\n\nNão existe uma \"consulta a um banco de respostas\". O modelo aprendeu, durante o treinamento, padrões estatísticos de como a linguagem se encadeia, e usa esses padrões para gerar uma continuação coerente. Entender essa ideia de previsão do próximo pedaço explica tanto os acertos quanto os erros (como as alucinações) desses modelos."
                    },
                    {
                        "type": "text",
                        "value": "## Tokens: como o modelo enxerga o texto\nO modelo não trabalha com letras nem exatamente com palavras: ele trabalha com tokens. Um token é um pedaço de texto, que pode ser uma palavra inteira, um pedaço de palavra ou até um sinal de pontuação. Antes de processar, o texto do prompt é quebrado em tokens; ao responder, o modelo também gera token por token.\n\nEsse detalhe é prático, não só teórico. O tamanho do que entra e do que sai é medido em tokens, e é em tokens que se conta o uso do modelo e o limite de quanto texto ele consegue considerar de uma vez. Guardar que \"o modelo pensa em tokens\" ajuda a entender os limites e os parâmetros que veremos adiante."
                    },
                    {
                        "type": "text",
                        "value": "## Embeddings: transformar significado em números\nPara lidar com linguagem, o modelo precisa representar texto como números. Um embedding é justamente isso: um vetor (uma lista de números) que captura o significado de um trecho de texto. O ponto-chave é que trechos com sentido parecido geram vetores próximos nesse espaço numérico, enquanto sentidos diferentes ficam distantes.\n\nÉ essa propriedade que torna os embeddings a base da busca semântica e da comparação por similaridade: em vez de casar palavras exatas, você compara vetores e encontra o que é próximo em significado, mesmo escrito de outro jeito. Modelos de embeddings são um tipo de modelo à parte, feitos para produzir esses vetores."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\", \"O que é\"], [\"Token\", \"Pedaço de texto (palavra, parte de palavra ou pontuação) que o modelo processa\"], [\"Embedding\", \"Vetor de números que captura o significado de um trecho de texto\"], [\"Parâmetros (pesos)\", \"Os valores internos que o modelo ajustou no treino e usam para prever\"], [\"Prompt\", \"A instrução ou entrada que você envia ao modelo\"], [\"Completion\", \"O texto que o modelo gera em resposta ao prompt\"], [\"Janela de contexto\", \"O máximo de tokens (prompt mais resposta) que o modelo considera de uma vez\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Transformers, atenção e treinamento\nA maioria dos modelos generativos de texto usa a arquitetura transformer. A inovação dela é o mecanismo de atenção: ao processar cada token, o modelo pesa a importância dos outros tokens da sequência para entender o contexto e as relações entre as palavras. É a atenção que permite \"ligar\" um pronome ao nome certo lá atrás na frase e manter a resposta coerente e no tema.\n\nEsses modelos aprendem por treinamento. No pré-treino, o modelo é exposto a volumes enormes de texto e vai ajustando seus parâmetros para prever cada vez melhor o próximo token. Terminado o treino, os parâmetros ficam fixos: o conhecimento do modelo é o que ele capturou até ali. Por isso ele não sabe, sozinho, de fatos posteriores ao treino nem dos seus dados privados, a menos que você forneça esse contexto no prompt."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo generativo prevê o próximo token a partir do contexto; ele processa o texto em tokens, representa significado com embeddings e usa a atenção do transformer para manter tudo coerente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em alto nível, qual é a tarefa básica que um modelo generativo de texto executa repetidamente para produzir uma resposta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Prever o próximo token mais provável a partir do contexto",
                                "isCorrect": true
                            },
                            {
                                "text": "Consultar a resposta pronta em um banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir automaticamente o prompt para outro idioma",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar todas as palavras do prompt em ordem alfabética",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O texto que entra e sai de um modelo de linguagem é dividido em pequenas unidades que o modelo processa. Como se chamam essas unidades?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Tokens",
                                "isCorrect": true
                            },
                            {
                                "text": "Pixels",
                                "isCorrect": false
                            },
                            {
                                "text": "Endpoints",
                                "isCorrect": false
                            },
                            {
                                "text": "Clusters",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor quer montar uma busca que encontre textos parecidos em significado, mesmo escritos com outras palavras. Qual recurso é a base dessa comparação por similaridade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Embeddings",
                                "isCorrect": true
                            },
                            {
                                "text": "A temperatura da geração",
                                "isCorrect": false
                            },
                            {
                                "text": "A janela de contexto",
                                "isCorrect": false
                            },
                            {
                                "text": "Os filtros de conteúdo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe percebe que, em conversas muito longas, o modelo parece \"esquecer\" o que foi dito no começo. Qual característica do modelo explica esse limite de quanto texto ele considera de uma vez?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A janela de contexto",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de opções de resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de idiomas suportados",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de imagem de saída",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na arquitetura transformer, o que o mecanismo de atenção faz ao processar um token?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pesa a importância dos outros tokens para captar o contexto",
                                "isCorrect": true
                            },
                            {
                                "text": "Converte cada token diretamente em um pixel da imagem de resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumenta automaticamente o tamanho máximo da resposta gerada",
                                "isCorrect": false
                            },
                            {
                                "text": "Consulta a internet em tempo real para validar cada fato citado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Modelos grandes e pequenos: LLM e SLM",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um LLM\nLLM quer dizer large language model, ou modelo de linguagem grande. São modelos com um número enorme de parâmetros, de bilhões a centenas de bilhões, treinados sobre volumes gigantescos de texto. Esse porte todo dá a eles um comportamento generalista: lidam bem com uma variedade ampla de tarefas de linguagem, raciocínio mais elaborado, escrita, código e conversas complexas, sem terem sido feitos para um único assunto.\n\nA família GPT, da OpenAI, e o Llama, da Meta, são exemplos conhecidos de LLMs. O preço dessa capacidade é o custo: modelos maiores tendem a ser mais caros de executar e a responder com um pouco mais de latência, e costumam exigir a infraestrutura da nuvem para rodar."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um SLM\nSLM quer dizer small language model, ou modelo de linguagem pequeno. São modelos com bem menos parâmetros, de alguns milhões a poucos bilhões. Por serem menores, são mais baratos e rápidos de executar e conseguem rodar em ambientes com menos recursos, inclusive mais perto do dispositivo (edge) e em cenários com restrição de conectividade ou de privacidade.\n\nA família Phi, da Microsoft, é um exemplo de SLM. Um SLM bem escolhido dá conta muito bem de tarefas mais focadas e delimitadas, com uma fração do custo de um LLM. O que ele tende a perder é fôlego nas tarefas mais amplas, abertas e de raciocínio profundo, onde o porte do LLM faz diferença."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"LLM (modelo grande)\", \"SLM (modelo pequeno)\"], [\"Parâmetros\", \"De bilhões a centenas de bilhões\", \"De milhões a poucos bilhões\"], [\"Custo e latência\", \"Maiores\", \"Menores\"], [\"Tarefas amplas e complexas\", \"Muito forte\", \"Mais limitado\"], [\"Onde costuma rodar\", \"Na nuvem\", \"Na nuvem ou perto do dispositivo (edge)\"], [\"Melhor quando\", \"A tarefa é ampla, aberta ou exige raciocínio\", \"A tarefa é focada e o custo, a latência ou a privacidade importam\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como escolher o tamanho\nA escolha é um equilíbrio, não uma corrida pelo maior. Se a tarefa é ampla, variada ou exige raciocínio mais sofisticado, e você tem orçamento e infraestrutura de nuvem, o LLM tende a entregar a melhor qualidade. Se a tarefa é específica e bem delimitada, ou se pesam requisitos de custo baixo, resposta rápida, execução local ou privacidade, um SLM costuma ser a escolha mais inteligente.\n\nNa prática, muitas soluções combinam os dois: um SLM cuida do caminho comum e barato, e um LLM entra quando aparece um caso mais difícil. O importante para a prova é reconhecer, pelo cenário, quando o porte maior compensa e quando o menor é suficiente."
                    },
                    {
                        "type": "quote",
                        "value": "LLMs são grandes, generalistas e mais caros; SLMs são menores, mais baratos e rápidos, e rodam até no dispositivo. Escolha pelo equilíbrio entre a complexidade da tarefa e os limites de custo, latência e privacidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "A sigla LLM, usada para os grandes modelos generativos de texto, significa o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Large language model (modelo de linguagem grande)",
                                "isCorrect": true
                            },
                            {
                                "text": "Local logic machine (máquina de lógica local)",
                                "isCorrect": false
                            },
                            {
                                "text": "Long latency model (modelo de longa latência)",
                                "isCorrect": false
                            },
                            {
                                "text": "Limited learning model (modelo de aprendizado limitado)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é uma característica típica de um SLM (small language model) em comparação com um LLM?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Menor, mais barato e rápido, e roda com poucos recursos",
                                "isCorrect": true
                            },
                            {
                                "text": "Tem mais parâmetros e mais capacidade geral que um LLM",
                                "isCorrect": false
                            },
                            {
                                "text": "Só serve para gerar imagens, nunca para texto ou chat",
                                "isCorrect": false
                            },
                            {
                                "text": "Não passa por nenhum tipo de treinamento prévio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa embarcar um assistente de linguagem em um dispositivo com pouca memória, que às vezes fica sem conexão, para uma tarefa bem específica. Qual opção é a mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um SLM, mais leve e adequado para rodar perto do dispositivo",
                                "isCorrect": true
                            },
                            {
                                "text": "O maior LLM disponível, sempre dependente da nuvem",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de geração de imagem, que não conversa em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de embeddings, feito só para busca semântica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produto precisa de raciocínio sofisticado sobre assuntos muito variados e abertos, e a empresa tem orçamento e infraestrutura de nuvem. Que tipo de modelo tende a entregar a melhor qualidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um LLM grande e generalista",
                                "isCorrect": true
                            },
                            {
                                "text": "O menor SLM possível",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de embeddings",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo só de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente o trade-off entre LLMs e SLMs?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O LLM é mais capaz em tarefas complexas, mas custa mais; o SLM é mais barato e leve, mas rende menos nelas",
                                "isCorrect": true
                            },
                            {
                                "text": "O SLM é sempre mais capaz que o LLM em qualquer tarefa, pois os modelos mais novos são sempre melhores",
                                "isCorrect": false
                            },
                            {
                                "text": "LLM e SLM têm exatamente o mesmo custo, a mesma velocidade e a mesma capacidade; muda só o nome comercial",
                                "isCorrect": false
                            },
                            {
                                "text": "O LLM só serve para gerar imagens e o SLM só serve para gerar texto e conversar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolher o modelo pela capacidade e o model catalog",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A capacidade define o modelo\nNão existe um único modelo que faça tudo bem. Cada modelo é feito (ou é melhor) para um tipo de capacidade, e o primeiro passo de qualquer solução é saber de que capacidade você precisa. As mais cobradas no AI-901 são:\n\n- **Geração de texto e chat**: entender e produzir linguagem, conversar, resumir, redigir e gerar código.\n- **Embeddings**: transformar texto em vetores de significado para busca semântica e comparação por similaridade.\n- **Multimodal**: aceitar mais de um tipo de entrada, tipicamente texto e imagem juntos, e responder em texto.\n- **Geração de imagem**: criar imagens novas a partir de uma descrição em texto.\n- **Fala**: converter fala em texto e texto em fala; no Azure, o serviço clássico é o Azure AI Speech."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade\", \"O que o modelo faz\", \"Exemplo de uso\"], [\"Geração de texto / chat\", \"Entende e gera linguagem natural\", \"Um assistente que responde e resume\"], [\"Embeddings\", \"Transforma texto em vetores de significado\", \"Busca semântica em documentos\"], [\"Multimodal (texto + imagem)\", \"Recebe texto e imagem e responde em texto\", \"Descrever ou responder sobre uma foto\"], [\"Geração de imagem\", \"Cria uma imagem nova a partir de texto\", \"Ilustração a partir de uma descrição\"], [\"Fala\", \"Converte fala em texto e texto em fala\", \"Legenda automática e voz de assistente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Modelos multimodais\nUm modelo multimodal é aquele que entende mais de um tipo de conteúdo ao mesmo tempo. O caso mais comum é receber texto e imagem juntos: você envia uma foto e uma pergunta, e o modelo responde em texto sobre aquela imagem, por exemplo descrevendo a cena, lendo um rótulo ou explicando um gráfico. Alguns também lidam com áudio, permitindo responder a um prompt falado.\n\nCuidado para não confundir com geração de imagem. O modelo multimodal recebe a imagem como entrada e produz texto; o modelo de geração de imagem faz o contrário, recebe texto e produz uma imagem nova. Se o cenário analisa uma imagem que já existe, pense em multimodal; se cria uma imagem inédita, pense em geração de imagem."
                    },
                    {
                        "type": "text",
                        "value": "## O model catalog do Microsoft Foundry\nOnde você encontra e escolhe todos esses modelos? No model catalog (catálogo de modelos) do Microsoft Foundry. É uma biblioteca central que reúne modelos de vários provedores, como a OpenAI (família GPT), a Microsoft (família Phi), a Meta (família Llama) e a comunidade Hugging Face, entre outros.\n\nNo catálogo você pesquisa e filtra os modelos por capacidade, tarefa ou modalidade, compara opções e lê as informações de cada um antes de decidir. Escolhido o modelo certo para a sua necessidade, o próximo passo é fazer o deploy dele, tema da próxima aula. O catálogo é o ponto de partida: é ali que a capacidade que você precisa vira um modelo concreto para usar."
                    },
                    {
                        "type": "quote",
                        "value": "Escolha o modelo pela capacidade de que você precisa (texto/chat, embeddings, multimodal, imagem ou fala) e encontre-o no model catalog do Microsoft Foundry, que reúne modelos de vários provedores."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma solução precisa transformar milhares de documentos em vetores numéricos para permitir uma busca por significado. Qual capacidade de modelo atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Embeddings",
                                "isCorrect": true
                            },
                            {
                                "text": "Geração de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Geração de texto/chat",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estúdio quer criar imagens inéditas a partir de descrições como \"um farol ao pôr do sol em aquarela\". Qual capacidade de modelo é a indicada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Geração de imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Embeddings",
                                "isCorrect": false
                            },
                            {
                                "text": "Multimodal de entrada (texto + imagem)",
                                "isCorrect": false
                            },
                            {
                                "text": "Fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo precisa receber a foto de um prato enviada pelo usuário e responder, em texto, quais ingredientes provavelmente aparecem na imagem. Que tipo de modelo é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um modelo multimodal",
                                "isCorrect": true
                            },
                            {
                                "text": "Um modelo de geração de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de embeddings",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo apenas de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é o model catalog do Microsoft Foundry?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma biblioteca para pesquisar e escolher modelos de vários provedores",
                                "isCorrect": true
                            },
                            {
                                "text": "Um parâmetro que controla a criatividade das respostas do modelo geral",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço que traduz automaticamente texto entre idiomas",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma métrica que avalia a acurácia de um modelo treinado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma solução precisa, ao mesmo tempo, indexar documentos por significado para uma busca semântica e conversar com o usuário respondendo perguntas em linguagem natural. Que combinação de capacidades ela requer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um modelo de embeddings para buscar e um modelo de chat para conversar",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único modelo de geração de imagem para as duas coisas",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas um modelo de fala, convertendo áudio em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas um modelo de embeddings, que já responde em linguagem natural",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Deploy de um modelo e os parâmetros de geração",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é fazer deploy de um modelo\nEscolher um modelo no catálogo não basta para usá-lo: antes é preciso fazer o deploy (a implantação) dele. Fazer deploy é criar uma instância pronta para uso daquele modelo, com um nome de implantação (deployment) e um endpoint, o endereço para o qual você envia as requisições.\n\nA diferença é simples: o catálogo é a prateleira com todos os modelos disponíveis; o deployment é o modelo que você já colocou para funcionar e pode chamar. Depois do deploy, você interage com ele de três formas: pelo playground no portal, pela API ou pelo SDK, sempre apontando para o nome da sua implantação."
                    },
                    {
                        "type": "text",
                        "value": "## Temperature e top-p: controlando a aleatoriedade\nNa hora de chamar o modelo, alguns parâmetros ajustam como a resposta é gerada. Os dois mais famosos controlam o quanto a saída é criativa ou previsível.\n\nA temperature regula a aleatoriedade. Valores baixos, próximos de 0, deixam a resposta mais determinística e focada: o modelo quase sempre escolhe as opções mais prováveis. Valores mais altos aumentam a variedade e a criatividade, ao custo de respostas menos previsíveis.\n\nO top-p (também chamado nucleus sampling) age por outro caminho: em vez de mexer na aleatoriedade em geral, ele restringe a escolha ao menor conjunto de tokens cuja probabilidade somada atinge o valor p (entre 0 e 1). Um top-p baixo mantém só as opções mais prováveis; próximo de 1, abre o leque. A recomendação prática é ajustar temperature ou top-p, não os dois ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"O que controla\", \"Efeito de aumentar o valor\"], [\"Temperature\", \"A aleatoriedade da resposta\", \"Respostas mais variadas e criativas\"], [\"Top-p\", \"O tamanho do conjunto de tokens candidatos\", \"Mais opções consideradas, resposta mais diversa\"], [\"Max tokens\", \"O tamanho máximo da resposta (em tokens)\", \"Permite respostas mais longas\"], [\"Frequency penalty\", \"A repetição de tokens conforme eles se repetem\", \"Menos repetição das mesmas palavras\"], [\"Presence penalty\", \"A reutilização de tokens que já apareceram\", \"Incentiva trazer assuntos e termos novos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "response = client.complete(\n    model=\"meu-deploy-chat\",  # nome da implantação, não do catálogo\n    messages=[\n        {\"role\": \"system\", \"content\": \"Você é um assistente conciso.\"},\n        {\"role\": \"user\", \"content\": \"Resuma o texto em uma frase.\"},\n    ],\n    temperature=0.2,        # baixa: resposta mais focada e previsível\n    top_p=1.0,              # sem restringir o conjunto de candidatos\n    max_tokens=200,         # limita o tamanho da resposta\n    frequency_penalty=0.0,  # sem penalizar repetição por frequência\n    presence_penalty=0.0,   # sem forçar assuntos novos\n)"
                    },
                    {
                        "type": "text",
                        "value": "## Max tokens e as penalidades\nO max tokens limita o tamanho da resposta, contado em tokens. Ele não deixa o modelo mais inteligente nem mais criativo: só corta o comprimento da saída. Lembre que prompt e resposta somados precisam caber na janela de contexto do modelo.\n\nAs penalidades combatem a repetição. A frequency penalty reduz a chance de um token voltar quanto mais ele já apareceu, útil quando o texto fica repetitivo. A presence penalty desestimula reusar qualquer token que já tenha aparecido, empurrando o modelo a introduzir novos assuntos e termos. São ajustes finos: na maioria dos casos você mexe primeiro na temperature ou no top-p e recorre às penalidades quando percebe repetição."
                    },
                    {
                        "type": "quote",
                        "value": "Temperature e top-p controlam o quanto a resposta é criativa ou previsível; max tokens limita o tamanho da saída; frequency e presence penalty reduzem a repetição. Deploy é transformar um modelo do catálogo em um endpoint pronto para chamar."
                    }
                ],
                "questions": [
                    {
                        "statement": "No momento de chamar um modelo generativo, o que o parâmetro max tokens controla?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tamanho máximo da resposta em tokens",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de idiomas que o modelo entende",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de imagens geradas por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "O preço fixo de cada chamada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ajustando a temperature para um valor próximo de 0, como tendem a ficar as respostas do modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mais determinísticas e previsíveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Mais aleatórias e criativas",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais longas e sempre no limite máximo",
                                "isCorrect": false
                            },
                            {
                                "text": "Escritas em outro idioma",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer que o modelo produza respostas mais variadas e criativas para um gerador de ideias. Qual ajuste atende diretamente a esse objetivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar a temperature",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o max tokens",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a temperature em 0",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a janela de contexto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Microsoft Foundry, o que significa fazer o deploy de um modelo escolhido no catálogo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma instância do modelo com nome e endpoint prontos para uso",
                                "isCorrect": true
                            },
                            {
                                "text": "Traduzir automaticamente o modelo inteiro para outro idioma",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar de vez o modelo escolhido do catálogo de modelos",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar o modelo do zero usando apenas os seus próprios dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um assistente está repetindo demais as mesmas palavras nas respostas. Qual parâmetro é o mais indicado para reduzir especificamente essa repetição?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar a frequency penalty",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o max tokens",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a temperature",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a janela de contexto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O Microsoft Foundry como plataforma",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Microsoft Foundry\nO Microsoft Foundry (antes chamado Azure AI Foundry, e originalmente Azure AI Studio) é a plataforma unificada da Microsoft para construir, testar e implantar soluções de IA generativa e agêntica. Em vez de juntar várias ferramentas soltas, ele reúne em um só lugar tudo o que uma solução de IA precisa: o catálogo de modelos, um espaço para experimentar, ferramentas complementares, o mecanismo de deploy e os SDKs para integrar com o seu código.\n\nÉ por isso que este módulo desemboca no Foundry: os conceitos de modelo, capacidade, deploy e parâmetros que vimos são exatamente as peças que você manipula dentro dele. Os próximos módulos vão colocar a mão na massa nessa plataforma."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\", \"Para que serve\"], [\"Portal do Foundry\", \"A interface web onde você faz quase tudo pelo navegador\"], [\"Model catalog\", \"Pesquisar, comparar e escolher modelos de vários provedores\"], [\"Playground\", \"Testar prompts e parâmetros no navegador, sem escrever código\"], [\"Foundry Tools\", \"Serviços complementares que a solução usa, como Azure AI Speech e Azure Content Understanding\"], [\"SDK\", \"Bibliotecas (Python e outras) para chamar o modelo a partir do seu aplicativo\"], [\"Projeto\", \"O espaço que organiza modelos, deployments e recursos de uma solução\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Portal, playground e tools\nO trabalho no Foundry gira em torno do portal, a interface web onde você navega pelo catálogo, faz deploys e acompanha a solução. Dentro dele, o playground é o lugar para experimentar: você conversa com o modelo implantado e ajusta parâmetros como temperature e max tokens ali mesmo, vendo o efeito na hora, sem programar nada.\n\nAs Foundry Tools são os serviços que a sua solução pode incorporar além do modelo generativo. É por ali, por exemplo, que entram o Azure AI Speech, para fala, e o Azure Content Understanding, para extração de informação de documentos e mídia, temas dos módulos de implementação mais adiante."
                    },
                    {
                        "type": "text",
                        "value": "## SDK e o fluxo típico\nQuando a solução sai do experimento e vira aplicativo, entra o SDK do Foundry: bibliotecas que o seu código usa para se autenticar no projeto, apontar para o deployment e trocar mensagens com o modelo. É com o SDK que se constrói o chat client de um app ou o cliente de um agente.\n\nO fluxo de trabalho costuma seguir sempre a mesma ordem: escolher o modelo no catálogo, fazer o deploy, testar no playground e, por fim, integrar ao aplicativo pelo SDK, avaliando e ajustando ao longo do caminho. Guardar essa sequência ajuda tanto na prova quanto nos módulos práticos que vêm a seguir."
                    },
                    {
                        "type": "quote",
                        "value": "O Microsoft Foundry é a plataforma que reúne catálogo, playground, tools, deploy e SDK. O caminho típico é escolher o modelo, fazer o deploy, testar no playground e integrar pelo SDK."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o Microsoft Foundry?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma plataforma unificada para construir e implantar soluções de IA",
                                "isCorrect": true
                            },
                            {
                                "text": "Um parâmetro que controla a criatividade das respostas do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único modelo de linguagem grande, sem outras ferramentas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um formato de arquivo usado para salvar imagens geradas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do Microsoft Foundry, onde é possível testar prompts e ajustar parâmetros de um modelo implantado sem escrever código?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No playground",
                                "isCorrect": true
                            },
                            {
                                "text": "No SDK",
                                "isCorrect": false
                            },
                            {
                                "text": "Na janela de contexto",
                                "isCorrect": false
                            },
                            {
                                "text": "Na frequency penalty",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma desenvolvedora precisa fazer o aplicativo em produção conversar com o modelo já implantado, a partir do código. Qual recurso do Microsoft Foundry ela usa nessa etapa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O SDK do Foundry",
                                "isCorrect": true
                            },
                            {
                                "text": "O playground",
                                "isCorrect": false
                            },
                            {
                                "text": "O model catalog",
                                "isCorrect": false
                            },
                            {
                                "text": "Os filtros de conteúdo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer navegar, comparar e escolher entre modelos de diferentes provedores antes de implantar. Qual parte do Microsoft Foundry serve a esse propósito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O model catalog",
                                "isCorrect": true
                            },
                            {
                                "text": "O playground",
                                "isCorrect": false
                            },
                            {
                                "text": "O max tokens",
                                "isCorrect": false
                            },
                            {
                                "text": "O endpoint de um deployment já criado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao construir um chat em produção no Microsoft Foundry, partindo do zero, qual é a ordem correta das etapas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Escolher o modelo no catálogo, fazer o deploy, testar no playground e integrar pelo SDK",
                                "isCorrect": true
                            },
                            {
                                "text": "Integrar pelo SDK, escolher o modelo no catálogo, fazer o deploy e testar no playground",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o deploy, escolher o modelo no catálogo, integrar pelo SDK e testar no playground",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar no playground, integrar pelo SDK, escolher o modelo no catálogo e fazer o deploy",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Visão, fala e análise de texto",
        "aulas": [
            {
                "titulo": "Visão computacional: enxergar imagens",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que a visão computacional faz\nVisão computacional é a área da IA que extrai significado de imagens e vídeos. Em vez de apenas guardar uma foto, o computador passa a entender o que há nela: que objetos aparecem, que texto está escrito, se há rostos. No AI-901 o que mais cai é reconhecer, a partir de um cenário, qual capacidade de visão resolve o problema.\n\nSão quatro capacidades de análise principais: classificação de imagem, detecção de objetos, leitura de texto (OCR) e análise facial. Há ainda uma capacidade à parte, de natureza generativa: a geração de imagem. As capacidades de análise são entregues no Azure pelo serviço Azure AI Vision, com modelos já treinados que você consome direto pela API."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade\", \"O que faz\", \"Saída típica\"], [\"Classificação de imagem\", \"Rotula a imagem inteira\", \"Uma classe para a foto\"], [\"Detecção de objetos\", \"Localiza cada item na imagem\", \"Classe mais caixa delimitadora\"], [\"Leitura de texto (OCR)\", \"Lê o texto presente na imagem\", \"Texto extraído\"], [\"Análise facial\", \"Detecta rostos e seus atributos\", \"Rostos e atributos\"], [\"Geração de imagem\", \"Cria uma imagem nova a partir de texto\", \"Imagem inédita\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Reconhecer cada capacidade de análise\nA dúvida clássica é entre classificação e detecção. A **classificação de imagem** responde \"o que é esta imagem?\" e devolve um único rótulo para a foto inteira. A **detecção de objetos** responde \"o que existe e onde?\", devolvendo cada item com uma caixa delimitadora (bounding box). Se o cenário fala em localizar, contar ou marcar a posição de algo, é detecção de objetos.\n\nA **leitura de texto**, ou OCR (optical character recognition), extrai o texto impresso ou manuscrito que aparece dentro da imagem, como a placa de um carro ou o texto de um documento fotografado. A **análise facial** detecta rostos na imagem e pode descrever atributos, como a posição da cabeça ou o uso de óculos. Guarde: ler texto é OCR; encontrar rostos é análise facial, não classificação."
                    },
                    {
                        "type": "text",
                        "value": "## Geração de imagem é diferente\nAté aqui, todas as capacidades **analisam** uma imagem que já existe. A **geração de imagem** faz o contrário: cria uma imagem nova e original a partir de uma descrição em texto (um prompt), como \"um gato astronauta em aquarela\". Ela não pertence ao Azure AI Vision, e sim aos **modelos generativos** (e multimodais) disponíveis no catálogo de modelos do Microsoft Foundry.\n\nEssa distinção cai na prova: analisar uma imagem que já existe é visão computacional clássica; criar uma imagem nova a partir de texto é geração de imagem, uma capacidade generativa. A saída de uma é informação sobre a foto; a saída da outra é uma foto inédita."
                    },
                    {
                        "type": "text",
                        "value": "## O serviço Azure AI Vision\nO **Azure AI Vision** entrega as capacidades de análise sem que você precise treinar nada: envia a imagem e recebe o resultado pela API. Ele cobre a análise de imagem (marcações, descrição e detecção de objetos), a leitura de texto com OCR e a detecção e análise de rostos. É a escolha quando você precisa de resultados rápidos para categorias gerais e não tem imagens rotuladas nem equipe de ciência de dados.\n\nModelos multimodais também conseguem receber uma imagem como entrada e responder perguntas sobre ela, unindo visão e IA generativa. Ainda assim, para as tarefas clássicas de análise, o serviço dedicado é o Azure AI Vision."
                    },
                    {
                        "type": "quote",
                        "value": "Classificação rotula a foto inteira; detecção de objetos localiza cada item com uma caixa; OCR lê o texto da imagem; análise facial encontra rostos. Criar uma imagem nova a partir de texto é geração de imagem, capacidade dos modelos generativos, não do Azure AI Vision."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um aplicativo precisa marcar cada foto enviada como \"cachorro\" ou \"gato\", sem indicar onde o animal está na imagem. Qual capacidade de visão resolve isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Classificação de imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Detecção de objetos",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura de texto (OCR)",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise facial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema precisa extrair o texto impresso de fotos de notas fiscais para lançar os valores. Qual capacidade de visão é indicada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Leitura de texto",
                                "isCorrect": true
                            },
                            {
                                "text": "Classificação de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção de objetos",
                                "isCorrect": false
                            },
                            {
                                "text": "Geração de imagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja quer localizar e contar cada produto na prateleira, desenhando um retângulo em volta de cada um. Qual capacidade de visão é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Detecção de objetos",
                                "isCorrect": true
                            },
                            {
                                "text": "Classificação de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura de texto (OCR)",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise facial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo de portaria precisa encontrar os rostos presentes em uma foto de grupo e descrever atributos como o uso de óculos. Qual capacidade de visão atende?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Análise facial",
                                "isCorrect": true
                            },
                            {
                                "text": "Classificação de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura de texto (OCR)",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção de objetos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe tem quatro necessidades. Qual delas NÃO é resolvida pelo Azure AI Vision, e sim por um modelo generativo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Criar uma ilustração inédita a partir de uma descrição",
                                "isCorrect": true
                            },
                            {
                                "text": "Ler e extrair o texto impresso em uma placa fotografada",
                                "isCorrect": false
                            },
                            {
                                "text": "Detectar, localizar e contar os carros em uma foto de rua",
                                "isCorrect": false
                            },
                            {
                                "text": "Classificar automaticamente uma foto como praia ou cidade",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fala: reconhecer e sintetizar voz",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que a IA faz com a fala\nA IA de fala converte entre voz e texto e ajuda a cruzar idiomas. São três capacidades principais, todas entregues no Azure pelo **Azure AI Speech**.\n\nO **reconhecimento de fala** (speech-to-text) recebe áudio de voz e devolve o texto correspondente, no mesmo idioma. É o que gera a legenda automática, o ditado por voz e a transcrição de reuniões e chamadas. A **síntese de fala** (text-to-speech) faz o caminho inverso: recebe texto e gera áudio de voz sintetizada, dando voz a assistentes virtuais e leitores de tela; as vozes neurais soam naturais. A **tradução de fala** recebe áudio falado em um idioma e devolve o conteúdo em outro, como texto ou como áudio, permitindo conversas entre pessoas de línguas diferentes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade\", \"Entrada\", \"Saída\", \"Muda de idioma?\"], [\"Reconhecimento de fala (speech-to-text)\", \"Áudio de voz\", \"Texto no mesmo idioma\", \"Não\"], [\"Síntese de fala (text-to-speech)\", \"Texto\", \"Áudio de voz\", \"Não\"], [\"Tradução de fala\", \"Áudio em um idioma\", \"Texto ou áudio em outro idioma\", \"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Transcrever não é traduzir\nEsse é o ponto que mais confunde. **Transcrever** é passar fala para texto mantendo o mesmo idioma: um áudio em português vira texto em português. **Traduzir** é trocar de idioma: um conteúdo em português vira conteúdo em inglês. O reconhecimento de fala transcreve; a tradução de fala traduz.\n\nQuando o cenário mistura os dois, como um áudio em espanhol que precisa virar texto em português, existe tradução envolvida, porque o idioma muda. A pergunta-chave é sempre: a língua da saída é a mesma da entrada? Se sim, é transcrição ou síntese; se muda, é tradução."
                    },
                    {
                        "type": "text",
                        "value": "## O serviço Azure AI Speech\nO **Azure AI Speech** reúne o reconhecimento de fala, a síntese de fala, a tradução de fala e ainda o reconhecimento de locutor (identificar quem está falando). É ele que gera legendas, dá voz a assistentes e transcreve áudio, tanto em tempo real quanto em lote sobre arquivos gravados.\n\nOs modelos multimodais mais recentes também conseguem ouvir e responder a comandos falados diretamente, sem uma etapa separada de transcrição, unindo fala e IA generativa. Ainda assim, quando o cenário é puramente converter entre voz e texto ou traduzir fala, o serviço dedicado é o Azure AI Speech."
                    },
                    {
                        "type": "quote",
                        "value": "Reconhecimento de fala transforma voz em texto no mesmo idioma; síntese de fala transforma texto em voz; tradução de fala muda o idioma. Se a língua muda, é tradução; se só a forma muda, é transcrição. O serviço é o Azure AI Speech."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um aplicativo de reuniões precisa gerar legendas em tempo real do que os participantes falam, mantendo o mesmo idioma. Qual capacidade de fala usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reconhecimento de fala (speech-to-text)",
                                "isCorrect": true
                            },
                            {
                                "text": "Síntese de fala (text-to-speech)",
                                "isCorrect": false
                            },
                            {
                                "text": "Tradução de fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de sentimento da conversa gravada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um assistente virtual precisa ler em voz alta, com voz natural, respostas que estão escritas em texto. Qual capacidade é essa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Síntese de fala (text-to-speech)",
                                "isCorrect": true
                            },
                            {
                                "text": "Reconhecimento de fala (speech-to-text)",
                                "isCorrect": false
                            },
                            {
                                "text": "Tradução de fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura de texto (OCR)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um áudio de uma entrevista gravada em português precisa virar um documento de texto também em português. Esse caso é de...?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Transcrição, porque o áudio e o texto ficam no mesmo idioma",
                                "isCorrect": true
                            },
                            {
                                "text": "Tradução de fala, porque o conteúdo muda de idioma",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala, porque o texto vira áudio",
                                "isCorrect": false
                            },
                            {
                                "text": "Tradução de texto, porque o resultado final fica escrito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma central de atendimento quer transcrever para texto milhares de ligações telefônicas gravadas. Qual serviço do Azure oferece essa capacidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure AI Speech",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Language",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Vision",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Content Understanding",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma videochamada, uma pessoa fala em japonês e a outra precisa receber o conteúdo em português falado, em tempo real. Qual capacidade de fala atende?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tradução de fala",
                                "isCorrect": true
                            },
                            {
                                "text": "Reconhecimento de fala (speech-to-text)",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala (text-to-speech)",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento de locutor",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Análise de texto: extrair sentido de texto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é análise de texto\nAnálise de texto é o conjunto de capacidades de IA que extraem sentido de texto já escrito. No AI-901, quatro delas são explicitamente cobradas, todas entregues pelo **Azure AI Language**.\n\nA **análise de sentimento** classifica a opinião de um texto como positiva, negativa, neutra ou mista, com uma pontuação de confiança; serve para medir a reação do público em avaliações e comentários. A **extração de frases-chave** (key phrase extraction) devolve os principais termos e tópicos de um texto, sem julgar opinião, ajudando a descobrir do que trata um documento grande. A **detecção de entidades** (entity detection) localiza e classifica itens do mundo real citados no texto, como pessoas, locais, organizações, datas e valores. A **sumarização** gera um resumo curto de um texto longo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade\", \"O que faz\", \"Cenário típico\"], [\"Análise de sentimento\", \"Diz se a opinião é positiva, negativa, neutra ou mista\", \"Medir se as avaliações de um produto são boas ou ruins\"], [\"Extração de frases-chave\", \"Lista os principais termos e tópicos do texto\", \"Descobrir os assuntos centrais de documentos longos\"], [\"Detecção de entidades\", \"Identifica pessoas, locais, datas, organizações e valores\", \"Extrair nomes e datas de um contrato\"], [\"Sumarização\", \"Resume um texto longo em poucas frases\", \"Gerar um resumo executivo de um relatório\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Não confunda frases-chave com entidades\nAs duas capacidades puxam pedaços do texto, mas com objetivos diferentes. A **extração de frases-chave** devolve os tópicos e assuntos gerais, sem dizer o que cada um representa. A **detecção de entidades** classifica cada item em um tipo conhecido: pessoa, local, organização, data, valor. Se o cenário só quer os temas, é frases-chave; se quer identificar e rotular pessoas, lugares ou datas, é detecção de entidades.\n\n## Sumarização extrativa e abstrativa\nA sumarização pode funcionar de dois jeitos. A **extrativa** seleciona as frases mais importantes do texto original e as junta; a **abstrativa** escreve frases novas que condensam a ideia. Nas duas, o objetivo é encurtar preservando o essencial."
                    },
                    {
                        "type": "text",
                        "value": "## O serviço Azure AI Language\nO **Azure AI Language** é o serviço para tarefas sobre texto. Além das quatro capacidades desta aula, ele traz detecção de idioma, detecção de informações pessoais (PII), resposta a perguntas e a compreensão de linguagem conversacional usada em bots.\n\nA regra prática para a prova: se o insumo é texto e o objetivo é extrair sentido dele (opinião, tópicos, entidades ou resumo), o serviço é o Azure AI Language. Repare que ele analisa texto que já existe; criar texto novo a partir de um prompt é outra carga, a de IA generativa."
                    },
                    {
                        "type": "quote",
                        "value": "Opinião boa ou ruim é análise de sentimento; tópicos principais é extração de frases-chave; pessoas, locais e datas é detecção de entidades; encurtar mantendo o essencial é sumarização. Tudo isso vive no Azure AI Language."
                    }
                ],
                "questions": [
                    {
                        "statement": "A equipe de marketing quer saber se os comentários sobre um novo produto expressam opinião positiva ou negativa. Qual capacidade de análise de texto atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": true
                            },
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção de entidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Sumarização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer transformar relatórios de dez páginas em um parágrafo curto que preserve o essencial. Qual capacidade de análise de texto é indicada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sumarização",
                                "isCorrect": true
                            },
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção de entidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um escritório de advocacia precisa extrair automaticamente nomes de pessoas, datas e locais citados em contratos. Qual capacidade de análise de texto faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Detecção de entidades",
                                "isCorrect": true
                            },
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Sumarização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer analisar o sentimento e extrair as entidades de milhares de avaliações em texto. Qual serviço do Azure usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure AI Language",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Speech",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Vision",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Content Understanding",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista quer apenas uma lista dos temas gerais discutidos em milhares de avaliações, sem identificar nem rotular pessoas, locais ou datas específicas. Qual capacidade é a mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Extração de frases-chave",
                                "isCorrect": true
                            },
                            {
                                "text": "Detecção de entidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Sumarização",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Extração de informação: de texto, imagens, áudio e vídeo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é extração de informação\nExtração de informação é a capacidade de transformar conteúdo não estruturado (texto corrido, imagens, áudio, vídeo) em **dados estruturados** que um sistema consegue usar: campos, valores, tabelas, registros. Em vez de uma pessoa ler uma nota fiscal e digitar os valores, a IA identifica o fornecedor, o total e o vencimento e devolve isso pronto para o software processar.\n\nEla é menos uma capacidade única e mais a combinação das anteriores aplicada a cada tipo de mídia. O segredo, para a prova, é perceber que cada modalidade reaproveita capacidades que você já conhece de visão, fala e análise de texto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modalidade\", \"Capacidade que a extração usa\", \"Exemplo\"], [\"Texto\", \"Detecção de entidades e frases-chave\", \"Puxar CNPJ, datas e valores de um contrato\"], [\"Imagem\", \"Leitura de texto (OCR)\", \"Ler os campos de uma nota fiscal fotografada\"], [\"Áudio\", \"Reconhecimento de fala\", \"Extrair o pedido dito numa ligação\"], [\"Vídeo\", \"Fala e visão combinadas\", \"Identificar cenas, falas e objetos de um vídeo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Uma capacidade que junta as outras\nRepare no padrão. Extrair informação de uma **imagem** de documento começa por OCR, para ler o texto, e segue por detecção de entidades, para dar sentido a cada campo. De um **áudio**, o reconhecimento de fala transcreve e a detecção de entidades identifica nomes e datas ditos. De um **vídeo**, entram visão (para reconhecer objetos e cenas) e fala (para transcrever a narração) ao mesmo tempo.\n\nPor isso a extração de informação é vista como uma carga própria: ela orquestra visão, fala e linguagem para produzir dados estruturados, em vez de resolver uma única tarefa isolada."
                    },
                    {
                        "type": "text",
                        "value": "## Extração multimodal com Azure Content Understanding\nNo AI-901, o serviço que faz extração de informação de forma **multimodal** (documentos, formulários, imagens, áudio e vídeo) é o **Azure Content Understanding**, disponível nas ferramentas do Microsoft Foundry. Você define os campos que quer extrair e o serviço devolve os valores estruturados, mesmo quando a fonte mistura texto, imagem e som.\n\nNeste módulo o objetivo é apenas reconhecer a capacidade e saber a qual serviço ela pertence; a implementação prática, com código e configuração, vem mais adiante na trilha."
                    },
                    {
                        "type": "quote",
                        "value": "Extração de informação transforma texto, imagens, áudio e vídeo em dados estruturados, reaproveitando OCR, reconhecimento de fala e detecção de entidades. No Microsoft Foundry, o serviço multimodal para isso é o Azure Content Understanding."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o objetivo principal da carga de extração de informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transformar conteúdo não estruturado em dados estruturados",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar imagens totalmente novas a partir de uma descrição em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir automaticamente um texto de um idioma para outro",
                                "isCorrect": false
                            },
                            {
                                "text": "Dar voz natural e sintetizada a um assistente virtual",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para extrair os valores de uma nota fiscal fotografada, qual capacidade a extração de informação usa primeiro para ler o texto da imagem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Leitura de texto (OCR)",
                                "isCorrect": true
                            },
                            {
                                "text": "Síntese de fala (text-to-speech)",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de sentimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Geração de imagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa extrair o pedido que o cliente diz em ligações telefônicas gravadas. Qual capacidade a extração usa como base para partir do áudio?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reconhecimento de fala",
                                "isCorrect": true
                            },
                            {
                                "text": "Leitura de texto (OCR)",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção de objetos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer um único serviço do Microsoft Foundry capaz de extrair dados de documentos, imagens, áudio e vídeo de forma multimodal. Qual serviço é o indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Content Understanding, multimodal",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Vision, só processa imagem e vídeo",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Speech, só processa áudio e voz",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Language, só processa texto escrito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa extrair, de vídeos de treinamento, tanto o que é falado quanto os objetos que aparecem em cena. Que combinação de capacidades a extração de informação usa nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reconhecimento de fala e visão computacional juntos",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas leitura de texto (OCR) das cenas do vídeo",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas análise de sentimento da narração falada",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala e geração de imagem combinadas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - IA generativa e agentes no Microsoft Foundry",
        "aulas": [
            {
                "titulo": "Prompts de sistema e de usuário",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Como o modelo enxerga uma conversa\nQuando você conversa com um modelo generativo no Microsoft Foundry, não envia só uma frase solta: envia uma lista de mensagens, e cada mensagem tem um papel (role). São três papéis:\n\n- **system (sistema)**: define quem o modelo é e como ele deve se comportar. É a orientação geral da conversa.\n- **user (usuário)**: é o que a pessoa pergunta ou pede a cada rodada.\n- **assistant (assistente)**: são as respostas que o próprio modelo já deu; entram no histórico para ele lembrar do contexto.\n\nEntender esses papéis é a base para escrever bons prompts e, mais adiante, para montar o código do chat client."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Papel (role)\", \"Quem escreve\", \"Para que serve\"], [\"system\", \"O desenvolvedor\", \"Definir persona, regras, tom e formato das respostas\"], [\"user\", \"O usuário final\", \"Fazer a pergunta ou o pedido concreto\"], [\"assistant\", \"O próprio modelo\", \"Guardar as respostas anteriores como histórico\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A mensagem de sistema (system)\nA mensagem de sistema é como a descrição de cargo do modelo. Ela é definida uma vez e vale para a conversa inteira. É nela que você diz:\n\n- **quem o modelo é**: 'Você é um assistente de suporte técnico'.\n- **o tom e o idioma**: 'Responda sempre em português, de forma curta e educada'.\n- **as regras e limites**: 'Não dê conselhos médicos' ou 'Se não souber, diga que vai encaminhar a um humano'.\n- **o formato da saída**: 'Responda em tópicos' ou 'Devolva a resposta em JSON'.\n\nComo ela orienta todo o comportamento, uma boa mensagem de sistema é o que mais muda a qualidade e a consistência das respostas."
                    },
                    {
                        "type": "text",
                        "value": "## A mensagem de usuário (user)\nA mensagem de usuário carrega o pedido específico de cada rodada: 'Meu aplicativo não abre depois da atualização' ou 'Resuma este relatório em três frases'. Enquanto a mensagem de sistema fica fixa, a de usuário muda a cada interação.\n\nBoas práticas para escrever prompts eficazes, valendo para os dois papéis:\n\n- **Seja claro e específico**: diga exatamente o que quer, sem ambiguidade.\n- **Dê contexto**: forneça no prompt os dados necessários para a tarefa.\n- **Peça um formato**: se quer uma lista, uma tabela ou JSON, diga isso.\n- **Dê exemplos (few-shot)**: mostrar um ou dois exemplos de entrada e saída ajuda o modelo a acertar o padrão.\n- **Oriente o que fazer na dúvida**: pedir para o modelo avisar quando não sabe reduz respostas inventadas."
                    },
                    {
                        "type": "code",
                        "value": "messages = [\n    {\n        \"role\": \"system\",\n        \"content\": \"Você é um assistente de suporte técnico. Responda em português, \"\n                   \"de forma curta e educada. Se não souber a resposta, diga que vai \"\n                   \"encaminhar a um atendente humano.\"\n    },\n    {\n        \"role\": \"user\",\n        \"content\": \"Meu aplicativo não abre depois da última atualização.\"\n    }\n]"
                    },
                    {
                        "type": "quote",
                        "value": "A mensagem de sistema define, uma vez, quem o modelo é e como deve agir; a mensagem de usuário traz o pedido concreto de cada rodada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve a mensagem de sistema (system) em uma conversa com um modelo generativo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Definir quem o modelo é e como ele deve se comportar",
                                "isCorrect": true
                            },
                            {
                                "text": "Fazer a pergunta específica que o usuário faz a cada rodada",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar com segurança a chave de API usada na autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter automaticamente o texto do usuário em tokens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual papel (role) fica a pergunta concreta que o usuário faz ao modelo a cada interação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "user",
                                "isCorrect": true
                            },
                            {
                                "text": "system",
                                "isCorrect": false
                            },
                            {
                                "text": "assistant",
                                "isCorrect": false
                            },
                            {
                                "text": "token",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que um chatbot sempre responda em JSON, para o aplicativo conseguir ler a saída. Qual é a melhor forma de garantir isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Especificar o formato desejado na mensagem de sistema",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar bastante o valor do parâmetro temperature",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir bastante o número de tokens de entrada",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a mensagem de sistema logo no início da conversa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é a técnica de few-shot na escrita de prompts?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Incluir no prompt alguns exemplos de entrada e saída esperada",
                                "isCorrect": true
                            },
                            {
                                "text": "Enviar o mesmo prompt várias vezes até sair uma resposta boa",
                                "isCorrect": false
                            },
                            {
                                "text": "Limitar a resposta do modelo a poucas palavras apenas",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar o modelo do zero com dados novos rotulados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer que, em todas as perguntas de um assistente, as respostas sejam sempre formais e nunca incluam conselhos jurídicos. Onde essa orientação deve ficar para valer na conversa inteira, sem precisar repetir?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Na mensagem de sistema, definida uma vez para toda a conversa",
                                "isCorrect": true
                            },
                            {
                                "text": "Em cada mensagem de usuário, repetindo a regra a cada pergunta",
                                "isCorrect": false
                            },
                            {
                                "text": "Na mensagem de assistant devolvida pelo modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "No nome do deployment do modelo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fazer deploy de um modelo e interagir no portal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do catálogo de modelos ao deploy\nAntes de escrever qualquer código, você precisa de um modelo disponível para uso. No portal do Microsoft Foundry (antigo Azure AI Foundry), isso começa no catálogo de modelos, onde ficam modelos de vários provedores. Você filtra por capacidade (chat, embeddings, geração de imagem, multimodal), compara e escolhe o que atende ao seu caso.\n\nEscolhido o modelo, você faz o deploy dele. O deploy cria uma instância pronta para receber chamadas e gera duas informações que você vai usar no código:\n\n- o **endpoint** do projeto, para onde as chamadas são enviadas;\n- o **nome do deployment**, o apelido que identifica o seu modelo implantado.\n\nÉ o nome do deployment, e não o nome comercial do modelo, que o seu código referencia nas chamadas."
                    },
                    {
                        "type": "text",
                        "value": "## Testar no playground\nCom o modelo implantado, o portal oferece um playground de chat para testar sem escrever código. Ali você digita a mensagem de sistema, envia prompts de usuário e vê a resposta na hora. É o lugar ideal para ajustar a mensagem de sistema e experimentar os parâmetros antes de levar para o código.\n\nO playground também deixa comparar o efeito das configurações: você muda um parâmetro, reenvia o mesmo prompt e observa como a resposta muda."
                    },
                    {
                        "type": "text",
                        "value": "## Parâmetros de configuração\nAo chamar o modelo, alguns parâmetros controlam a geração:\n\n- **temperature**: controla a aleatoriedade. Valores baixos (perto de 0) deixam a resposta mais factual e previsível; valores altos deixam mais criativa e variada.\n- **top_p**: uma forma alternativa de controlar a variedade, limitando o conjunto de tokens candidatos. Costuma-se ajustar temperature ou top_p, não os dois ao mesmo tempo.\n- **max_tokens**: limita o tamanho máximo da resposta, em tokens.\n\nPara respostas objetivas e consistentes, use temperature baixa. Para brainstorming e texto criativo, aumente a temperature."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"O que controla\", \"Efeito de um valor baixo\"], [\"temperature\", \"Aleatoriedade da resposta\", \"Respostas mais factuais e previsíveis\"], [\"top_p\", \"Variedade dos tokens candidatos\", \"Menos variação nas palavras escolhidas\"], [\"max_tokens\", \"Tamanho máximo da resposta\", \"Respostas mais curtas\"]]"
                    },
                    {
                        "type": "code",
                        "value": "response = chat.complete(\n    model=\"gpt-4o\",          # nome do deployment criado no portal\n    messages=messages,\n    temperature=0.2,          # baixo: respostas mais factuais e previsíveis\n    max_tokens=500,           # limite de tokens da resposta\n)\n\nprint(response.choices[0].message.content)"
                    },
                    {
                        "type": "quote",
                        "value": "O deploy transforma um modelo do catálogo em um endpoint pronto para uso; é o nome do deployment que o seu código referencia, e parâmetros como temperature e max_tokens ajustam o comportamento da resposta."
                    }
                ],
                "questions": [
                    {
                        "statement": "No portal do Microsoft Foundry, onde você navega e escolhe um modelo para usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No catálogo de modelos",
                                "isCorrect": true
                            },
                            {
                                "text": "No painel de faturamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Na lista de máquinas virtuais",
                                "isCorrect": false
                            },
                            {
                                "text": "No editor de imagens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer testar prompts e ajustar a mensagem de sistema rapidamente, sem escrever código. Qual recurso do portal do Foundry usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O playground de chat",
                                "isCorrect": true
                            },
                            {
                                "text": "O catálogo de modelos",
                                "isCorrect": false
                            },
                            {
                                "text": "O painel de custos da assinatura",
                                "isCorrect": false
                            },
                            {
                                "text": "O portal de máquinas virtuais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que um assistente dê respostas o mais factuais e previsíveis possível. Como ajustar o parâmetro temperature?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar um valor baixo, próximo de 0",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar um valor alto, próximo de 1",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o parâmetro para desativar o modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Igualar a temperature ao número de tokens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual parâmetro limita o tamanho máximo da resposta gerada pelo modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "max_tokens",
                                "isCorrect": true
                            },
                            {
                                "text": "temperature",
                                "isCorrect": false
                            },
                            {
                                "text": "top_p",
                                "isCorrect": false
                            },
                            {
                                "text": "endpoint",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa analisar imagens enviadas pelos usuários e também responder perguntas em texto sobre elas. Ao escolher no catálogo de modelos, qual capacidade o modelo deve ter?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ser um modelo multimodal que processa texto e imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Ser um modelo apenas de embeddings sem gerar texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser um modelo somente de geração de áudio sem imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser um modelo exclusivo de tradução de texto escrito",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um chat client com o Foundry SDK",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O SDK do Foundry\nPara conversar com o modelo por código em Python, você usa o SDK do Foundry. Três pacotes trabalham juntos:\n\n- **azure-ai-projects**: conecta o código ao seu projeto do Foundry e dá acesso aos recursos dele.\n- **azure-ai-inference**: envia mensagens ao modelo e recebe a resposta (as chamadas de chat).\n- **azure-identity**: cuida da autenticação sem chaves, usando a identidade do Microsoft Entra ID.\n\nUsar a identidade do Entra (com a classe DefaultAzureCredential) em vez de colar uma chave de API no código é a prática recomendada: nenhum segredo fica escrito no código-fonte."
                    },
                    {
                        "type": "code",
                        "value": "from azure.identity import DefaultAzureCredential\nfrom azure.ai.projects import AIProjectClient\nfrom azure.ai.inference.models import SystemMessage, UserMessage\n\n# 1. Conecta ao projeto do Foundry usando a identidade do Entra ID\nproject = AIProjectClient(\n    endpoint=\"https://meu-recurso.services.ai.azure.com/api/projects/meu-projeto\",\n    credential=DefaultAzureCredential(),\n)\n\n# 2. Obtém o client de chat a partir do projeto\nchat = project.inference.get_chat_completions_client()\n\n# 3. Envia a mensagem de sistema e a de usuário\nresponse = chat.complete(\n    model=\"gpt-4o\",  # nome do deployment\n    messages=[\n        SystemMessage(\"Você é um assistente que responde em português, de forma breve.\"),\n        UserMessage(\"Explique o que é machine learning em uma frase.\"),\n    ],\n)\n\n# 4. Lê a resposta do modelo\nprint(response.choices[0].message.content)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pacote\", \"Função\"], [\"azure-ai-projects\", \"Conecta ao projeto do Foundry e acessa seus recursos\"], [\"azure-ai-inference\", \"Envia mensagens ao modelo e recebe a resposta\"], [\"azure-identity\", \"Autentica sem chaves, com a identidade do Entra ID\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Passo a passo do código\n1. **Criar o client do projeto**: o AIProjectClient recebe o endpoint do projeto e a credencial. A DefaultAzureCredential descobre automaticamente a identidade disponível (a sua conta ao desenvolver, ou a identidade gerenciada em produção).\n2. **Obter o client de chat**: project.inference.get_chat_completions_client() devolve o objeto que fala com o modelo.\n3. **Enviar as mensagens**: o método complete recebe o nome do deployment em model e a lista de mensagens (system e user).\n4. **Ler a resposta**: o texto gerado fica em response.choices[0].message.content.\n\nCada chamada ao complete é independente: o modelo só conhece o que está na lista de mensagens enviada. Para dar memória à conversa, acumule o histórico, adicionando a resposta como uma mensagem de assistant e a nova pergunta como mensagem de user antes de chamar de novo."
                    },
                    {
                        "type": "code",
                        "value": "# historico já contém a mensagem de sistema e as trocas anteriores\nhistorico.append(AssistantMessage(response.choices[0].message.content))\nhistorico.append(UserMessage(\"E qual a diferença para deep learning?\"))\n\n# Chama de novo com o histórico completo, mantendo o contexto\nresponse = chat.complete(model=\"gpt-4o\", messages=historico)\nprint(response.choices[0].message.content)"
                    },
                    {
                        "type": "quote",
                        "value": "No SDK do Foundry, o AIProjectClient conecta ao projeto, o client de inferência envia as mensagens e a resposta fica em response.choices[0].message.content; a DefaultAzureCredential autentica sem chaves no código."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual classe do SDK permite autenticar sem colocar uma chave de API no código, usando a identidade do Microsoft Entra ID?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DefaultAzureCredential, para autenticar sem usar chave",
                                "isCorrect": true
                            },
                            {
                                "text": "SystemMessage, para dar a instrução do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "AIProjectClient, para conectar ao projeto do Foundry",
                                "isCorrect": false
                            },
                            {
                                "text": "AssistantMessage, para guardar as respostas já dadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de chamar o método complete, onde fica o texto gerado pelo modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em response.choices[0].message.content",
                                "isCorrect": true
                            },
                            {
                                "text": "No nome do deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "Na variável DefaultAzureCredential",
                                "isCorrect": false
                            },
                            {
                                "text": "No endpoint do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No chat client do Foundry, qual objeto é usado para enviar as mensagens e obter a resposta do modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O client obtido com get_chat_completions_client()",
                                "isCorrect": true
                            },
                            {
                                "text": "A classe DefaultAzureCredential usada só para autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo de modelos disponíveis no Foundry",
                                "isCorrect": false
                            },
                            {
                                "text": "O pacote azure-identity sozinho sem o de inference",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que o assistente lembre o que já foi dito ao longo de várias perguntas. Como manter o contexto entre as chamadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Acumular o histórico de mensagens a cada nova chamada",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar bastante o valor de max_tokens em cada nova chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um novo AIProjectClient antes de cada pergunta enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "Enviar apenas a última pergunta e ignorar as anteriores da conversa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é recomendável usar a DefaultAzureCredential com a identidade do Entra ID em vez de escrever a chave de API direto no código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Para não deixar nenhum segredo escrito no código-fonte",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a chave de API deixa o modelo mais criativo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem ela não é possível escolher o nome do deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a identidade do Entra ID aumenta o número de tokens da resposta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criar e testar um agente no portal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um agente\nUm chat client simples faz uma coisa só: manda mensagens e recebe respostas. Um agente vai além. Ele é um assistente com um objetivo, montado a partir de quatro peças:\n\n- **modelo**: o modelo generativo implantado que gera as respostas.\n- **instruções**: o comportamento e as regras do agente, num papel parecido com o da mensagem de sistema.\n- **ferramentas (tools)**: capacidades extras que o agente pode acionar, como executar código, buscar em arquivos ou chamar uma função sua.\n- **conhecimento (knowledge)**: fontes de dados que o agente pode consultar para responder com base nelas.\n\nAlém disso, o agente mantém o estado da conversa por conta própria, então você não precisa reenviar todo o histórico a cada chamada, como faria no chat client."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\", \"O que é\"], [\"Modelo\", \"O modelo generativo implantado que gera as respostas\"], [\"Instruções\", \"As regras e o comportamento do agente\"], [\"Ferramentas (tools)\", \"Capacidades extras que o agente pode acionar\"], [\"Conhecimento (knowledge)\", \"Fontes de dados que o agente pode consultar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Criar o agente no portal\nNo portal do Foundry, os agentes são criados e testados no playground de agentes. O fluxo é direto:\n\n1. dar um **nome** ao agente;\n2. escolher o **modelo** implantado que ele vai usar;\n3. escrever as **instruções** que definem o comportamento;\n4. opcionalmente, adicionar **ferramentas** e **conhecimento**;\n5. testar conversando com o agente ali mesmo.\n\nAlgumas ferramentas comuns que um agente pode receber:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\", \"Para que serve\"], [\"Interpretador de código\", \"Executar código para cálculos e análise de dados\"], [\"Busca em arquivos\", \"Responder com base em documentos enviados\"], [\"Chamada de função\", \"Acionar uma função ou API sua para obter dados ou executar ações\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Threads e execuções (runs)\nDois conceitos aparecem quando o agente entra em ação, tanto no portal quanto no código:\n\n- **thread**: é a conversa. Ela guarda as mensagens trocadas entre o usuário e o agente, mantendo o estado ao longo do tempo.\n- **run (execução)**: é o agente processando a thread para gerar a próxima resposta. A cada pedido do usuário, uma execução roda o agente sobre a thread.\n\nComo estamos montando uma solução de agente único (single-agent), um só agente cuida da thread do começo ao fim. Testar no playground é o passo para validar as instruções antes de partir para o código."
                    },
                    {
                        "type": "quote",
                        "value": "Um agente é modelo mais instruções, e pode ganhar ferramentas e conhecimento; a conversa vive em uma thread e cada resposta é gerada por uma execução (run) do agente sobre essa thread."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um agente do Foundry acrescenta em relação a uma simples chamada de chat a um modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Instruções e ferramentas próprias com memória da conversa",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas uma cor e um ícone diferentes no portal",
                                "isCorrect": false
                            },
                            {
                                "text": "A dispensa completa de qualquer modelo generativo",
                                "isCorrect": false
                            },
                            {
                                "text": "A tradução automática de todas as respostas geradas pelo modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde, no portal do Foundry, você cria e testa um agente sem escrever código?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No playground de agentes",
                                "isCorrect": true
                            },
                            {
                                "text": "No painel de faturamento",
                                "isCorrect": false
                            },
                            {
                                "text": "No catálogo de máquinas virtuais",
                                "isCorrect": false
                            },
                            {
                                "text": "No editor de imagens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No contexto de agentes, o que é uma thread?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A conversa que guarda as mensagens entre usuário e agente",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome comercial do modelo que está implantado",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave de API usada para autenticar o projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "O parâmetro que controla a criatividade das respostas geradas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que representa uma execução (run) de um agente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O agente processando a thread para gerar a próxima resposta",
                                "isCorrect": true
                            },
                            {
                                "text": "A criação de um novo projeto do zero no Foundry",
                                "isCorrect": false
                            },
                            {
                                "text": "O deploy de um novo modelo escolhido no catálogo",
                                "isCorrect": false
                            },
                            {
                                "text": "A exclusão definitiva de todas as mensagens da conversa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe montou um agente e quer verificar se as instruções produzem boas respostas antes de escrever qualquer client app. Qual é o caminho mais rápido no Foundry?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Testar o agente no playground de agentes do portal",
                                "isCorrect": true
                            },
                            {
                                "text": "Publicar o app em produção e observar os usuários reais",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar um novo modelo do zero com os dados da equipe",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o parâmetro max_tokens do deployment",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um client app para o agente",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Falando com o agente por código\nDepois de validar o agente no portal, você o coloca dentro de um app. O SDK do Foundry (azure-ai-projects, com as operações de agentes) faz isso em poucos passos:\n\n1. conectar ao projeto;\n2. criar o agente (ou reaproveitar um já criado no portal);\n3. criar uma thread para a conversa;\n4. adicionar a mensagem do usuário à thread;\n5. executar o agente sobre a thread e aguardar o processamento;\n6. ler as mensagens da thread para pegar a resposta."
                    },
                    {
                        "type": "code",
                        "value": "from azure.identity import DefaultAzureCredential\nfrom azure.ai.projects import AIProjectClient\n\n# 1. Conecta ao projeto\nproject = AIProjectClient(\n    endpoint=\"https://meu-recurso.services.ai.azure.com/api/projects/meu-projeto\",\n    credential=DefaultAzureCredential(),\n)\n\n# 2. Cria o agente com modelo e instruções\nagente = project.agents.create_agent(\n    model=\"gpt-4o\",\n    name=\"assistente-viagens\",\n    instructions=\"Você sugere roteiros de viagem curtos e objetivos, em português.\",\n)\n\n# 3. Cria a thread da conversa\nthread = project.agents.threads.create()\n\n# 4. Adiciona a mensagem do usuário\nproject.agents.messages.create(\n    thread_id=thread.id,\n    role=\"user\",\n    content=\"Quero um roteiro de 3 dias em Lisboa.\",\n)\n\n# 5. Executa o agente sobre a thread e aguarda terminar\nrun = project.agents.runs.create_and_process(\n    thread_id=thread.id,\n    agent_id=agente.id,\n)\n\n# 6. Lê as mensagens da thread\nif run.status == \"failed\":\n    print(\"A execução falhou:\", run.last_error)\nelse:\n    mensagens = project.agents.messages.list(thread_id=thread.id)\n    for m in mensagens:\n        print(m.role, \":\", m.content)\n\n# Opcional: remover o agente ao terminar o teste\nproject.agents.delete_agent(agente.id)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\", \"Método do SDK\"], [\"Criar o agente\", \"project.agents.create_agent(...)\"], [\"Criar a thread\", \"project.agents.threads.create()\"], [\"Adicionar mensagem do usuário\", \"project.agents.messages.create(...)\"], [\"Executar o agente\", \"project.agents.runs.create_and_process(...)\"], [\"Ler as respostas\", \"project.agents.messages.list(...)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Entendendo o fluxo\nRepare na diferença para o chat client da aula anterior. Lá, você mesmo montava e reenviava a lista de mensagens a cada chamada. Aqui, a thread guarda a conversa: você só adiciona a nova mensagem do usuário e manda executar.\n\nO método create_and_process é prático porque dispara a execução e já aguarda o agente terminar de processar, incluindo o uso de ferramentas, se houver. No fim, messages.list traz as mensagens da thread, e a resposta do agente é a última mensagem com o papel de assistant.\n\nSempre confira run.status: se vier failed, o detalhe do erro está em run.last_error."
                    },
                    {
                        "type": "text",
                        "value": "## Reaproveitar um agente do portal\nNão é obrigatório criar o agente por código toda vez. Se você já criou e testou um agente no portal, ele tem um identificador (agent id). No app, basta buscá-lo por esse id com project.agents.get_agent(agent_id), em vez de chamar create_agent de novo. Assim você mantém um único agente, gerenciado no portal, e o app apenas o consome.\n\nQuando um agente foi criado só para um teste rápido, vale removê-lo ao final com delete_agent para não acumular recursos."
                    },
                    {
                        "type": "quote",
                        "value": "No client do agente, a thread guarda a conversa, create_and_process executa o agente e aguarda, e messages.list traz a resposta; um agente já criado no portal pode ser reaproveitado pelo seu agent id."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método do SDK cria um agente por código, informando modelo, nome e instruções?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "project.agents.create_agent(...)",
                                "isCorrect": true
                            },
                            {
                                "text": "project.agents.messages.list(...)",
                                "isCorrect": false
                            },
                            {
                                "text": "DefaultAzureCredential(...)",
                                "isCorrect": false
                            },
                            {
                                "text": "project.inference.get_chat_completions_client()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No SDK de agentes do Foundry, o que guarda as mensagens trocadas na conversa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A thread criada com project.agents.threads.create()",
                                "isCorrect": true
                            },
                            {
                                "text": "O parâmetro temperature usado na chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo de modelos disponíveis no projeto do Foundry",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável max_tokens definida na chamada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual chamada executa o agente sobre a thread e já aguarda o processamento terminar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "project.agents.runs.create_and_process(...)",
                                "isCorrect": true
                            },
                            {
                                "text": "project.agents.messages.create(...)",
                                "isCorrect": false
                            },
                            {
                                "text": "project.agents.delete_agent(...)",
                                "isCorrect": false
                            },
                            {
                                "text": "project.agents.threads.create()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que a execução termina, como o código obtém a resposta do agente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Listando as mensagens com project.agents.messages.list(...)",
                                "isCorrect": true
                            },
                            {
                                "text": "Lendo o valor atual do parâmetro temperature configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultando de novo o catálogo de modelos do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriando o agente do zero com create_agent(...)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você já criou e testou um agente no portal e não quer recriá-lo a cada execução do app. Qual é a melhor abordagem no código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Buscar o agente existente com project.agents.get_agent(...)",
                                "isCorrect": true
                            },
                            {
                                "text": "Chamar create_agent(...) de novo a cada nova requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Copiar as instruções inteiras para dentro da mensagem de usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar bastante o max_tokens para tentar reaproveitar o agente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Texto, fala e visão no Microsoft Foundry",
        "aulas": [
            {
                "titulo": "Um app leve de análise de texto no Foundry",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Análise de texto dentro do Foundry\nUm app leve de análise de texto recebe um texto e devolve informação estruturada sobre ele: o sentimento, as entidades citadas, as frases-chave, o idioma e, se preciso, um resumo. No Microsoft Foundry (antes chamado Azure AI Foundry) você organiza a solução em um projeto e conecta a ele o recurso do Azure AI Language, que é quem de fato analisa o texto.\n\nO fluxo é sempre o mesmo: você provisiona o recurso, pega o endpoint e a chave, instala o SDK e chama o método da técnica que precisa. O app fica \"leve\" porque a inteligência está no serviço; o seu código só envia o texto e lê o resultado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\", \"Método do SDK\", \"O que devolve\"], [\"Detecção de idioma\", \"detect_language\", \"Idioma, código ISO e confiança\"], [\"Análise de sentimento\", \"analyze_sentiment\", \"Rótulo (positivo, negativo, neutro ou misto) e pontuações\"], [\"Extração de frases-chave\", \"extract_key_phrases\", \"Lista dos principais termos e assuntos\"], [\"Reconhecimento de entidades\", \"recognize_entities\", \"Pessoas, locais, organizações, datas e valores\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Conectar o Azure AI Language ao projeto\nNo portal do Foundry você cria (ou reaproveita) um projeto e adiciona uma conexão com o recurso do Azure AI Language. Dessa conexão saem duas informações que o app precisa: o endpoint (o endereço do serviço) e a chave de acesso. Guarde-as em variáveis de ambiente, nunca no código.\n\nCom isso, o cliente do SDK autentica de forma simples: você cria uma AzureKeyCredential com a chave e passa o endpoint. A partir daí, cada método envia o texto ao serviço e devolve o resultado já estruturado."
                    },
                    {
                        "type": "code",
                        "value": "import os\nfrom azure.core.credentials import AzureKeyCredential\nfrom azure.ai.textanalytics import TextAnalyticsClient\n\nendpoint = os.environ[\"LANGUAGE_ENDPOINT\"]\nchave = os.environ[\"LANGUAGE_KEY\"]\n\ncliente = TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(chave))\n\ntexto = [\"Adorei o atendimento, mas a entrega atrasou dois dias.\"]\n\nidioma = cliente.detect_language(documents=texto)[0]\nsentimento = cliente.analyze_sentiment(documents=texto)[0]\nfrases = cliente.extract_key_phrases(documents=texto)[0]\nentidades = cliente.recognize_entities(documents=texto)[0]\n\nprint(\"Idioma:\", idioma.primary_language.name)\nprint(\"Sentimento:\", sentimento.sentiment)\nprint(\"Frases-chave:\", frases.key_phrases)\nprint(\"Entidades:\", [e.text for e in entidades.entities])"
                    },
                    {
                        "type": "text",
                        "value": "## Ler o resultado com confiança\nCada resposta traz uma pontuação de confiança entre 0 e 1. Na análise de sentimento, além do rótulo geral (positivo, negativo, neutro ou misto) vêm as pontuações de cada classe e o sentimento frase a frase, o que ajuda em textos que misturam elogio e reclamação, como o do exemplo. Sempre trate a possibilidade de o serviço devolver um documento com erro (texto vazio ou idioma não suportado) antes de usar o resultado."
                    },
                    {
                        "type": "quote",
                        "value": "Em um app de análise de texto no Foundry, o Azure AI Language faz o trabalho: você conecta o recurso ao projeto, autentica com endpoint e chave e chama o método da técnica (sentimento, entidades, frases-chave ou idioma)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um app leve de análise de texto no Foundry precisa descobrir se cada avaliação de cliente é positiva, negativa ou neutra. Qual serviço do Azure faz essa análise?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure AI Language",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Vision",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Speech",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Content Understanding",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No SDK do Azure AI Language, qual método retorna as principais frases e assuntos de um texto, sem julgar a opinião?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "extract_key_phrases",
                                "isCorrect": true
                            },
                            {
                                "text": "analyze_sentiment",
                                "isCorrect": false
                            },
                            {
                                "text": "detect_language",
                                "isCorrect": false
                            },
                            {
                                "text": "recognize_entities",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao conectar o recurso de Azure AI Language a um projeto do Foundry, quais duas informações o app usa para autenticar as chamadas do SDK?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O endpoint e a chave de acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do modelo e o número de tokens",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho da imagem e a voz neural",
                                "isCorrect": false
                            },
                            {
                                "text": "O prompt de sistema e a temperatura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma avaliação diz: \"o produto é ótimo, mas o suporte foi péssimo\". Qual recurso da análise de sentimento ajuda a capturar as duas opiniões opostas no mesmo texto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As pontuações e o sentimento frase a frase",
                                "isCorrect": true
                            },
                            {
                                "text": "A detecção de idioma do texto enviado",
                                "isCorrect": false
                            },
                            {
                                "text": "A extração de frases-chave do texto",
                                "isCorrect": false
                            },
                            {
                                "text": "O reconhecimento de entidades no texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma desenvolvedora precisa que o app, além de classificar o sentimento, também identifique nomes de pessoas e datas citados nas reclamações. Usando o SDK do Azure AI Language, qual combinação de métodos resolve as duas necessidades?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "analyze_sentiment e recognize_entities",
                                "isCorrect": true
                            },
                            {
                                "text": "detect_language e extract_key_phrases",
                                "isCorrect": false
                            },
                            {
                                "text": "analyze_sentiment e detect_language",
                                "isCorrect": false
                            },
                            {
                                "text": "extract_key_phrases e recognize_entities",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Azure Speech no Foundry Tools",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fala no Foundry com o Azure AI Speech\nO Azure AI Speech é o serviço que trata voz no Azure e aparece entre as ferramentas (Foundry Tools) que você conecta a um projeto. Ele resolve dois caminhos opostos: transformar fala em texto (speech-to-text) e transformar texto em fala (text-to-speech). Com esses dois blocos você monta legendas, ditado, leitura em voz alta e a parte de voz de um assistente.\n\nA conversão pode ser em tempo real, enquanto a pessoa fala (streaming do microfone), ou em lote (batch), sobre arquivos de áudio já gravados. As vozes de saída são vozes neurais, que soam naturais e permitem ajustar entonação e ritmo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade\", \"Direção\", \"Exemplo de uso\"], [\"Fala em texto (speech-to-text)\", \"Áudio para texto\", \"Legendar uma reunião em tempo real\"], [\"Texto em fala (text-to-speech)\", \"Texto para áudio\", \"Dar voz a um assistente\"], [\"Tradução de fala\", \"Áudio para outro idioma\", \"Traduzir uma conversa entre idiomas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O SDK de fala\nO Azure AI Speech tem um SDK próprio (o pacote azure-cognitiveservices-speech). O ponto de partida é o SpeechConfig, que carrega a chave e a região do recurso conectado ao projeto. Depois você escolhe de onde vem ou para onde vai o áudio com o AudioConfig (microfone, alto-falante ou arquivo).\n\nPara transcrever, use um SpeechRecognizer; para sintetizar, um SpeechSynthesizer. No text-to-speech você ainda define a voz neural em speech_synthesis_voice_name, escolhendo idioma e locutor."
                    },
                    {
                        "type": "code",
                        "value": "import os\nimport azure.cognitiveservices.speech as speechsdk\n\nfala_config = speechsdk.SpeechConfig(\n    subscription=os.environ[\"SPEECH_KEY\"],\n    region=os.environ[\"SPEECH_REGION\"],\n)\nfala_config.speech_recognition_language = \"pt-BR\"\n\naudio_config = speechsdk.AudioConfig(use_default_microphone=True)\nreconhecedor = speechsdk.SpeechRecognizer(speech_config=fala_config, audio_config=audio_config)\n\nprint(\"Pode falar...\")\nresultado = reconhecedor.recognize_once()\n\nif resultado.reason == speechsdk.ResultReason.RecognizedSpeech:\n    print(\"Você disse:\", resultado.text)\nelse:\n    print(\"Não entendi o áudio:\", resultado.reason)"
                    },
                    {
                        "type": "code",
                        "value": "import os\nimport azure.cognitiveservices.speech as speechsdk\n\nfala_config = speechsdk.SpeechConfig(\n    subscription=os.environ[\"SPEECH_KEY\"],\n    region=os.environ[\"SPEECH_REGION\"],\n)\nfala_config.speech_synthesis_voice_name = \"pt-BR-FranciscaNeural\"\n\naudio_config = speechsdk.AudioConfig(use_default_speaker=True)\nsintetizador = speechsdk.SpeechSynthesizer(speech_config=fala_config, audio_config=audio_config)\n\nsintetizador.speak_text_async(\"Olá! Sua reserva foi confirmada.\").get()"
                    },
                    {
                        "type": "quote",
                        "value": "No Foundry, o Azure AI Speech faz os dois sentidos da voz: um SpeechRecognizer transforma fala em texto e um SpeechSynthesizer transforma texto em fala com voz neural, ambos partindo de um SpeechConfig com chave e região."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual serviço do Azure, disponível entre as ferramentas do Foundry, converte fala em texto e texto em fala?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure AI Speech",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Language",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Vision",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Content Understanding",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No SDK de fala, qual objeto é usado para transformar texto em áudio de voz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SpeechSynthesizer",
                                "isCorrect": true
                            },
                            {
                                "text": "SpeechRecognizer",
                                "isCorrect": false
                            },
                            {
                                "text": "TextAnalyticsClient",
                                "isCorrect": false
                            },
                            {
                                "text": "AzureKeyCredential",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No text-to-speech, qual propriedade define qual voz neural (idioma e locutor) será usada na síntese?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "speech_synthesis_voice_name",
                                "isCorrect": true
                            },
                            {
                                "text": "speech_recognition_language",
                                "isCorrect": false
                            },
                            {
                                "text": "use_default_microphone",
                                "isCorrect": false
                            },
                            {
                                "text": "image_url",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app precisa legendar, em tempo real, o que os participantes de uma reunião falam. Qual objeto do SDK de fala e qual fonte de áudio combinam para isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SpeechRecognizer com o microfone",
                                "isCorrect": true
                            },
                            {
                                "text": "SpeechSynthesizer com o alto-falante",
                                "isCorrect": false
                            },
                            {
                                "text": "TextAnalyticsClient com um arquivo de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "ChatCompletionsClient com uma imagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer transcrever de uma vez só milhares de gravações de chamadas já salvas em arquivos, em vez de transcrever ao vivo. Qual modo do Azure AI Speech é o indicado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Transcrição em lote sobre arquivos já gravados",
                                "isCorrect": true
                            },
                            {
                                "text": "Transcrição em tempo real vinda do microfone",
                                "isCorrect": false
                            },
                            {
                                "text": "Síntese de fala a partir de um texto pronto",
                                "isCorrect": false
                            },
                            {
                                "text": "Tradução de um documento de texto para outro idioma",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Respondendo a prompts falados com um modelo multimodal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é responder a um prompt falado\nResponder a um prompt falado é deixar o usuário falar com a solução e receber a resposta também em voz. A forma mais comum de montar isso no Foundry junta três peças: o Azure AI Speech transcreve a fala em texto, um modelo generativo multimodal implantado no projeto recebe esse texto e gera a resposta, e o Azure AI Speech sintetiza a resposta de volta em áudio.\n\nO modelo é multimodal porque lida com mais de um tipo de entrada. Alguns modelos multimodais do catálogo do Foundry aceitam o áudio diretamente; ainda assim, o padrão mais claro é transcrever primeiro e enviar texto ao modelo, reaproveitando o Azure AI Speech que você já conhece."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\", \"Componente\", \"Entrada para saída\"], [\"1. Ouvir\", \"Azure AI Speech (speech-to-text)\", \"Áudio para texto\"], [\"2. Pensar\", \"Modelo multimodal implantado no Foundry\", \"Texto para resposta em texto\"], [\"3. Falar\", \"Azure AI Speech (text-to-speech)\", \"Texto para áudio\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Implantar o modelo e conversar por código\nNo portal do Foundry você escolhe um modelo no catálogo e faz o deploy dentro do projeto; a implantação recebe um nome (o nome do deployment) que o código usa para endereçar o modelo. Com o SDK do Foundry você obtém um cliente de chat a partir do projeto e envia as mensagens.\n\nA conversa segue papéis: a mensagem de sistema (system) define o comportamento e o tom do assistente, e a mensagem de usuário (user) carrega o que a pessoa pediu, aqui o texto vindo da transcrição. A resposta gerada é a completion."
                    },
                    {
                        "type": "code",
                        "value": "import os\nfrom azure.ai.projects import AIProjectClient\nfrom azure.ai.inference.models import SystemMessage, UserMessage\nfrom azure.identity import DefaultAzureCredential\nimport azure.cognitiveservices.speech as speechsdk\n\n# 1. Ouvir: transcrever a fala do usuário\nfala_config = speechsdk.SpeechConfig(\n    subscription=os.environ[\"SPEECH_KEY\"],\n    region=os.environ[\"SPEECH_REGION\"],\n)\nfala_config.speech_recognition_language = \"pt-BR\"\nreconhecedor = speechsdk.SpeechRecognizer(speech_config=fala_config)\npergunta = reconhecedor.recognize_once().text\n\n# 2. Pensar: enviar o texto ao modelo multimodal implantado\nprojeto = AIProjectClient.from_connection_string(\n    conn_str=os.environ[\"PROJECT_CONNECTION_STRING\"],\n    credential=DefaultAzureCredential(),\n)\nchat = projeto.inference.get_chat_completions_client()\nresposta = chat.complete(\n    model=\"assistente-multimodal\",\n    messages=[\n        SystemMessage(\"Você é um atendente simpático e responde em português, de forma curta.\"),\n        UserMessage(pergunta),\n    ],\n)\ntexto_resposta = resposta.choices[0].message.content\nprint(\"Assistente:\", texto_resposta)"
                    },
                    {
                        "type": "code",
                        "value": "# 3. Falar: sintetizar a resposta de volta em voz\nfala_config.speech_synthesis_voice_name = \"pt-BR-AntonioNeural\"\nsintetizador = speechsdk.SpeechSynthesizer(speech_config=fala_config)\nsintetizador.speak_text_async(texto_resposta).get()"
                    },
                    {
                        "type": "quote",
                        "value": "Para responder a um prompt falado, encadeie três peças: o Azure AI Speech transcreve a fala, o modelo multimodal implantado no Foundry gera a resposta em texto e o Azure AI Speech a devolve em voz."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa solução que responde a prompts falados, qual componente transforma a voz do usuário em texto antes de enviá-la ao modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure AI Speech",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo de geração de imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Translator",
                                "isCorrect": false
                            },
                            {
                                "text": "O SpeechSynthesizer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao implantar um modelo do catálogo do Foundry, o que o código usa para endereçar (chamar) esse modelo específico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O nome da implantação",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho da imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "A voz neural",
                                "isCorrect": false
                            },
                            {
                                "text": "A pontuação de confiança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na conversa com o modelo, qual é o papel da mensagem de sistema (system)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir o comportamento e o tom do assistente",
                                "isCorrect": true
                            },
                            {
                                "text": "Carregar o áudio bruto vindo do microfone",
                                "isCorrect": false
                            },
                            {
                                "text": "Transcrever a fala do usuário em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar a imagem de saída do modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o modelo usado nessa solução é chamado de multimodal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque aceita mais de um tipo de entrada, como texto e imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque é implantado em várias regiões do Azure ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só aceita texto puro, sem nenhum outro formato",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque devolve apenas números em vez de texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura de assistente de voz com Azure AI Speech e um modelo multimodal, qual é a ordem correta do fluxo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Speech-to-text, o modelo gera a resposta em texto e depois text-to-speech",
                                "isCorrect": true
                            },
                            {
                                "text": "Text-to-speech, o modelo gera a resposta e depois speech-to-text",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo gera a resposta, depois speech-to-text e depois text-to-speech",
                                "isCorrect": false
                            },
                            {
                                "text": "Speech-to-text, text-to-speech e por último o modelo gera a resposta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Interpretando imagens com um modelo multimodal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Interpretar imagens com um modelo multimodal\nUm modelo multimodal com visão aceita, no mesmo prompt, texto e imagem. Você envia a imagem junto de uma pergunta em linguagem natural (\"o que há nesta foto?\", \"quantos itens estão na mesa?\", \"leia o valor total deste recibo\") e o modelo responde em texto. É a IA generativa interpretando entrada visual.\n\nIsso é diferente da visão computacional clássica do Azure AI Vision, que devolve uma saída fixa (tags, objetos com caixas, texto de OCR). Com o modelo multimodal a saída é aberta: depende do que você perguntou. Um serviço entrega categorias predefinidas; o outro raciocina sobre a imagem a partir do seu prompt."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Azure AI Vision (clássico)\", \"Modelo multimodal no Foundry\"], [\"Saída\", \"Fixa: tags, objetos, OCR\", \"Aberta: responde ao seu prompt\"], [\"Como se pede\", \"Chamando a operação pronta\", \"Escrevendo um prompt com a imagem\"], [\"Melhor para\", \"Categorias e detecções padronizadas\", \"Perguntas livres e raciocínio sobre a cena\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como enviar a imagem no prompt\nA imagem entra na mensagem de usuário como um item de conteúdo do tipo imagem, ao lado do item de texto. Há duas formas de fornecê-la: por uma URL pública da imagem ou embutindo o arquivo local como dados (data URL em base64), útil quando a imagem não está na web.\n\nNo SDK do Foundry, a mensagem de usuário passa a ser uma lista de itens: um TextContentItem com a pergunta e um ImageContentItem com a imagem. O modelo lê os dois juntos e responde."
                    },
                    {
                        "type": "code",
                        "value": "import os\nfrom azure.ai.projects import AIProjectClient\nfrom azure.ai.inference.models import (\n    SystemMessage, UserMessage, TextContentItem, ImageContentItem, ImageUrl,\n)\nfrom azure.identity import DefaultAzureCredential\n\nprojeto = AIProjectClient.from_connection_string(\n    conn_str=os.environ[\"PROJECT_CONNECTION_STRING\"],\n    credential=DefaultAzureCredential(),\n)\nchat = projeto.inference.get_chat_completions_client()\n\nresposta = chat.complete(\n    model=\"assistente-multimodal\",\n    messages=[\n        SystemMessage(\"Você descreve imagens de forma objetiva, em português.\"),\n        UserMessage(content=[\n            TextContentItem(text=\"O que aparece nesta imagem? Liste os itens principais.\"),\n            ImageContentItem(image_url=ImageUrl.load(\n                image_file=\"prateleira.jpg\",\n                image_format=\"jpg\",\n            )),\n        ]),\n    ],\n)\nprint(resposta.choices[0].message.content)"
                    },
                    {
                        "type": "text",
                        "value": "## O que dá para pedir e os cuidados\nCom uma imagem no prompt, o modelo pode descrever a cena, listar objetos, ler e interpretar texto que aparece na foto, comparar duas imagens ou responder perguntas específicas sobre o conteúdo. É flexível justamente porque a instrução é livre.\n\nOs cuidados de IA responsável continuam valendo: o modelo pode errar ou \"alucinar\" detalhes que não estão na imagem, então valide saídas críticas; e evite enviar imagens com dados pessoais sem tratar a privacidade. Para tarefas padronizadas e de grande volume (só OCR, só detecção de objetos), o Azure AI Vision clássico costuma ser mais simples e barato."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo multimodal recebe imagem e texto no mesmo prompt e responde de forma aberta ao que você perguntou; o Azure AI Vision clássico devolve saídas fixas como tags, objetos e OCR."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um modelo multimodal com visão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele aceita imagem e texto no mesmo prompt",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele só transcreve áudio em texto, nunca imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele só gera números a partir de tabelas de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele apenas traduz texto entre idiomas diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer perguntar livremente \"quantas pessoas de capacete aparecem nesta foto e o que elas fazem?\" e receber a resposta em texto. Qual opção atende melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um modelo multimodal com a imagem no prompt",
                                "isCorrect": true
                            },
                            {
                                "text": "A tradução automática de texto para outro idioma",
                                "isCorrect": false
                            },
                            {
                                "text": "A síntese de fala a partir de um texto",
                                "isCorrect": false
                            },
                            {
                                "text": "A detecção de idioma do texto enviado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quais são as duas formas de fornecer a imagem para o modelo no prompt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Por uma URL pública da imagem ou como dados em base64",
                                "isCorrect": true
                            },
                            {
                                "text": "Só por captura direta da webcam do usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Só digitando a descrição completa da imagem em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Por um número de telefone e uma chave de API do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No SDK do Foundry, como a mensagem de usuário carrega a pergunta e a imagem juntas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como uma lista com um item de texto e um item de imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Como dois modelos diferentes implantados separadamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Como duas regiões diferentes do Azure conectadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um único número inteiro sem nenhum texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa apenas extrair, em grande volume e a baixo custo, o texto impresso de milhares de notas fiscais digitalizadas, sempre no mesmo formato. Entre um modelo multimodal e o Azure AI Vision clássico, o que é mais indicado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Azure AI Vision, mais simples e barato numa tarefa padronizada",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo multimodal, por ser sempre mais barato que qualquer serviço clássico",
                                "isCorrect": false
                            },
                            {
                                "text": "A síntese de fala, porque lê o texto em voz alta",
                                "isCorrect": false
                            },
                            {
                                "text": "A tradução de fala, porque muda o idioma do documento",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Gerar imagens e montar um app leve de visão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Gerar novas imagens com modelos generativos\nAlém de interpretar imagens, os modelos generativos criam imagens novas a partir de uma descrição em texto: é a geração de imagem (text-to-image). Você implanta um modelo de geração de imagem do catálogo do Foundry, escreve um prompt visual (\"uma xícara de café sobre uma mesa de madeira, luz da manhã, estilo aquarela\") e recebe uma imagem inédita.\n\nA saída é um resultado novo, não uma análise. Quanto mais claro e específico o prompt (assunto, estilo, iluminação, enquadramento), mais fiel tende a ser a imagem. Você também escolhe o tamanho da imagem e quantas variações quer gerar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"O que controla\"], [\"prompt\", \"A descrição em texto do que gerar\"], [\"size\", \"As dimensões da imagem de saída\"], [\"n\", \"Quantas imagens gerar de uma vez\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import os\nfrom azure.ai.projects import AIProjectClient\nfrom azure.identity import DefaultAzureCredential\n\nprojeto = AIProjectClient.from_connection_string(\n    conn_str=os.environ[\"PROJECT_CONNECTION_STRING\"],\n    credential=DefaultAzureCredential(),\n)\ncliente = projeto.get_openai_client(api_version=\"2024-10-21\")\n\nresultado = cliente.images.generate(\n    model=\"gerador-de-imagem\",\n    prompt=\"Uma xícara de café sobre uma mesa de madeira, luz da manhã, estilo aquarela\",\n    size=\"1024x1024\",\n    n=1,\n)\n\nurl_imagem = resultado.data[0].url\nprint(\"Imagem gerada em:\", url_imagem)"
                    },
                    {
                        "type": "text",
                        "value": "## Um app leve de visão, ponta a ponta\nUm app leve de visão junta as duas capacidades numa experiência só. Um exemplo: o usuário envia a foto de um ambiente; o modelo multimodal interpreta a imagem e a descreve; a partir dessa descrição, o app monta um prompt e pede ao modelo de geração de imagem uma nova versão da cena em outro estilo. Interpretação e geração, encadeadas.\n\nComo na análise de texto, o app fica leve porque a inteligência está nos modelos implantados no Foundry; o seu código apenas orquestra as chamadas, cuida da entrada e da saída e trata os erros."
                    },
                    {
                        "type": "code",
                        "value": "import os\nfrom azure.ai.projects import AIProjectClient\nfrom azure.ai.inference.models import UserMessage, TextContentItem, ImageContentItem, ImageUrl\nfrom azure.identity import DefaultAzureCredential\n\nprojeto = AIProjectClient.from_connection_string(\n    conn_str=os.environ[\"PROJECT_CONNECTION_STRING\"],\n    credential=DefaultAzureCredential(),\n)\nchat = projeto.inference.get_chat_completions_client()\nimagens = projeto.get_openai_client(api_version=\"2024-10-21\")\n\n# 1. Interpretar a foto enviada pelo usuário\ndescricao = chat.complete(\n    model=\"assistente-multimodal\",\n    messages=[UserMessage(content=[\n        TextContentItem(text=\"Descreva esta cena em uma frase.\"),\n        ImageContentItem(image_url=ImageUrl.load(image_file=\"sala.jpg\", image_format=\"jpg\")),\n    ])],\n).choices[0].message.content\n\n# 2. Gerar uma nova versão a partir da descrição\nnova = imagens.images.generate(\n    model=\"gerador-de-imagem\",\n    prompt=f\"{descricao}, em estilo aquarela\",\n    size=\"1024x1024\",\n    n=1,\n)\nprint(\"Nova imagem:\", nova.data[0].url)"
                    },
                    {
                        "type": "quote",
                        "value": "Gerar imagem é criar um resultado visual novo a partir de um prompt de texto; um app leve de visão encadeia interpretação (modelo multimodal) e geração (modelo de imagem), deixando a inteligência nos modelos do Foundry."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que faz um modelo de geração de imagem (text-to-image)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cria uma imagem nova a partir de uma descrição em texto",
                                "isCorrect": true
                            },
                            {
                                "text": "Extrai o texto impresso dentro de uma imagem existente",
                                "isCorrect": false
                            },
                            {
                                "text": "Classifica uma imagem existente em categorias fixas",
                                "isCorrect": false
                            },
                            {
                                "text": "Transcreve um áudio de voz em texto escrito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual parâmetro da geração de imagem descreve, em texto, o que você quer que seja criado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "prompt",
                                "isCorrect": true
                            },
                            {
                                "text": "size",
                                "isCorrect": false
                            },
                            {
                                "text": "region",
                                "isCorrect": false
                            },
                            {
                                "text": "voice",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre interpretar uma imagem e gerar uma imagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Interpretar analisa uma imagem existente; gerar cria uma nova",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas criam sempre imagens novas a partir de um texto",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas apenas leem o texto impresso dentro da imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Interpretar cria a imagem nova e gerar apenas a descreve",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num app leve de visão que interpreta uma foto e depois gera uma nova versão dela, o que o seu código faz essencialmente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Orquestra as chamadas aos modelos implantados no Foundry",
                                "isCorrect": true
                            },
                            {
                                "text": "Treina do zero um novo modelo de visão para cada foto enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui os modelos fazendo a geração localmente sem a nuvem",
                                "isCorrect": false
                            },
                            {
                                "text": "Analisa apenas o sentimento de um texto qualquer enviado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma agência quer, a partir da foto de um produto real, produzir três variações de arte publicitária em estilos diferentes. Qual combinação de capacidades resolve isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um modelo multimodal para interpretar e um de geração para variar",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas OCR do Azure AI Vision, só ajustando o tamanho da fonte usada",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas síntese de fala, só mudando a voz neural do áudio gerado",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas detecção de idioma, só trocando o idioma do texto de saída",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Extração de informação com o Content Understanding",
        "aulas": [
            {
                "titulo": "Extração de documentos e formulários com o Content Understanding",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Azure Content Understanding\nO Azure Content Understanding é o serviço de extração de informação do Microsoft Foundry (antes chamado Azure AI Foundry). Ele recebe conteúdo não estruturado — documentos, formulários, imagens, áudio e vídeo — e devolve dados estruturados em JSON, prontos para um sistema consumir. É uma das ferramentas disponíveis no Foundry (Foundry Tools) e por isso você não precisa treinar um modelo do zero: define o que quer extrair e chama o serviço.\n\nNão confunda com análise de texto. O Azure AI Language trabalha sobre um texto que já está escrito; o Content Understanding tira os dados de dentro do documento ou da mídia, inclusive de um PDF digitalizado, de uma foto, de um áudio ou de um vídeo. Nesta aula começamos pelo caso mais comum: documentos e formulários, como faturas, recibos e contratos."
                    },
                    {
                        "type": "text",
                        "value": "## O analisador (analyzer) e o schema de campos\nA peça central do Content Understanding é o analisador (analyzer): a definição do que deve ser extraído de cada arquivo. Existem dois tipos:\n\n- **Analisador pronto (prebuilt)**: já vem treinado para cenários comuns, como faturas e recibos. É a escolha para entregar valor rápido, sem configurar nada.\n- **Analisador customizado**: você define o schema de campos (fieldSchema) para o seu caso, como um formulário interno que nenhum modelo pronto conhece.\n\nCada campo do schema tem um nome, um tipo (string, number, date, boolean, array ou object), um método e uma descrição que orienta o modelo. O método diz como o campo é preenchido: **extract** copia o valor que está no documento (por exemplo, o número da nota), e **generate** deixa o modelo produzir o valor a partir do conteúdo (por exemplo, um resumo em uma frase)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de campo\", \"Para que serve\", \"Exemplo\"], [\"string\", \"Texto\", \"Nome do fornecedor\"], [\"number\", \"Valor numérico\", \"Total da fatura\"], [\"date\", \"Data\", \"Vencimento\"], [\"boolean\", \"Verdadeiro ou falso\", \"Fatura já paga\"], [\"array\", \"Lista de itens\", \"Itens da nota fiscal\"], [\"object\", \"Grupo de subcampos\", \"Endereço com rua, cidade e CEP\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import os\nfrom azure.ai.contentunderstanding import ContentUnderstandingClient\nfrom azure.core.credentials import AzureKeyCredential\n\n# O endpoint e a chave vêm do recurso do Foundry, nunca fixos no código\nendpoint = os.environ[\"FOUNDRY_ENDPOINT\"]   # https://<seu-recurso>.services.ai.azure.com\ncredential = AzureKeyCredential(os.environ[\"FOUNDRY_KEY\"])\nclient = ContentUnderstandingClient(endpoint, credential)\n\n# Analisador pronto para faturas; para casos próprios, use um customizado\npoller = client.begin_analyze(\n    analyzer_id=\"prebuilt-invoice\",\n    url=\"https://exemplo.com/faturas/1042.pdf\",\n)\nresultado = poller.result()   # o resultado volta como JSON (veja abaixo)\n\ncampos = resultado[\"contents\"][0][\"fields\"]\nprint(campos[\"VendorName\"][\"valueString\"])\nprint(campos[\"InvoiceTotal\"][\"valueNumber\"], \"confianca:\", campos[\"InvoiceTotal\"][\"confidence\"])"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"status\": \"Succeeded\",\n  \"result\": {\n    \"analyzerId\": \"prebuilt-invoice\",\n    \"contents\": [\n      {\n        \"fields\": {\n          \"VendorName\": { \"type\": \"string\", \"valueString\": \"Cafe Bom Ltda\", \"confidence\": 0.981 },\n          \"InvoiceId\":  { \"type\": \"string\", \"valueString\": \"1042\", \"confidence\": 0.973 },\n          \"InvoiceTotal\": { \"type\": \"number\", \"valueNumber\": 289.90, \"confidence\": 0.965 },\n          \"DueDate\": { \"type\": \"date\", \"valueDate\": \"2026-08-15\", \"confidence\": 0.942 }\n        },\n        \"markdown\": \"# Fatura 1042\\n\\nFornecedor: Cafe Bom Ltda\\nTotal: R$ 289,90\"\n      }\n    ]\n  }\n}"
                    },
                    {
                        "type": "quote",
                        "value": "O Content Understanding transforma documentos e formulários em JSON estruturado: você define um analisador com os campos desejados e recebe cada campo com o seu valor e uma pontuação de confiança."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o Azure Content Understanding faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Extrai informação de documentos e mídia em dados estruturados",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas traduz textos automaticamente de um idioma para outro",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas gera imagens novas a partir de descrições em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas treina modelos de regressão a partir de planilhas antigas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Content Understanding, o que você define para dizer quais campos devem ser extraídos de uma fatura?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um analisador",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma matriz de confusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Um token de acesso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua empresa tem um formulário interno próprio que nenhum modelo pronto conhece e precisa extrair campos específicos dele. Qual opção do Content Understanding usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um analisador customizado, com fieldSchema definido por você",
                                "isCorrect": true
                            },
                            {
                                "text": "O analisador pronto prebuilt-invoice",
                                "isCorrect": false
                            },
                            {
                                "text": "O analisador pronto prebuilt-receipt",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível: só dá para extrair de faturas e recibos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A saída do Content Understanding traz, em cada campo, uma pontuação de confiança (confidence). Para que ela serve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Indicar o quanto o serviço confia naquele valor",
                                "isCorrect": true
                            },
                            {
                                "text": "Medir a velocidade da chamada feita à API",
                                "isCorrect": false
                            },
                            {
                                "text": "Informar o preço cobrado por cada página processada",
                                "isCorrect": false
                            },
                            {
                                "text": "Contar o número total de páginas do documento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No schema de um analisador de faturas você quer um campo com o número da nota copiado exatamente do documento e outro com um resumo em uma frase produzido pelo modelo. Que método cada campo deve usar, respectivamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "extract para o número da nota e generate para o resumo",
                                "isCorrect": true
                            },
                            {
                                "text": "generate para o número da nota e extract para o resumo",
                                "isCorrect": false
                            },
                            {
                                "text": "extract para os dois campos",
                                "isCorrect": false
                            },
                            {
                                "text": "generate para os dois campos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Extração de informação de imagens",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Content Understanding em imagens\nFotos tiradas no celular e capturas de tela também são conteúdo não estruturado. O Content Understanding analisa imagens usando o mesmo conceito de analisador, agora no cenário de imagem, e devolve dados estruturados em JSON.\n\nO ponto importante para a prova é que ele vai além de um OCR simples. Além de ler o texto presente na imagem, ele entende o layout, devolve campos nomeados que você definiu, pode gerar uma descrição do que aparece e classificar a imagem em categorias. Um modelo multimodal também consegue interpretar uma imagem e responder sobre ela, mas quando o objetivo é extrair campos estruturados e com pontuação de confiança, o analisador do Content Understanding é o caminho direto."
                    },
                    {
                        "type": "text",
                        "value": "## O que dá para extrair de uma imagem\nAs capacidades mais cobradas são:\n\n- **OCR**: ler o texto e os números impressos ou manuscritos na imagem, como o valor de um comprovante fotografado.\n- **Campos nomeados**: dados estruturados que você define, como nome, empresa e cargo em um crachá de evento.\n- **Descrição (campo generate)**: uma frase que descreve o conteúdo da imagem.\n- **Classificação**: a categoria da imagem, por exemplo se a foto é de um documento, de um recibo ou de um produto.\n\nCasos típicos: um recibo fotografado, um crachá de evento, a foto de um medidor de energia ou o print de um comprovante de pagamento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade em imagem\", \"O que entrega\", \"Exemplo\"], [\"OCR\", \"Texto e números lidos da imagem\", \"Ler o valor num comprovante fotografado\"], [\"Campos nomeados\", \"Dados estruturados definidos por você\", \"Nome e cargo de um crachá\"], [\"Descrição (generate)\", \"Uma frase que descreve a imagem\", \"Recibo de restaurante com tres itens\"], [\"Classificação\", \"A categoria da imagem\", \"Documento, recibo ou produto\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from azure.ai.contentunderstanding import ContentUnderstandingClient\nfrom azure.core.credentials import AzureKeyCredential\n\nclient = ContentUnderstandingClient(endpoint, AzureKeyCredential(key))\n\n# Analisador customizado de imagem para cracha de evento\nwith open(\"cracha.jpg\", \"rb\") as arquivo:\n    poller = client.begin_analyze(\n        analyzer_id=\"cracha-evento\",\n        content=arquivo.read(),\n        content_type=\"image/jpeg\",\n    )\n\ncampos = poller.result()[\"contents\"][0][\"fields\"]\nprint(campos[\"Nome\"][\"valueString\"], \"-\", campos[\"Empresa\"][\"valueString\"])\nprint(\"Descricao:\", campos[\"Descricao\"][\"valueString\"])"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"status\": \"Succeeded\",\n  \"result\": {\n    \"analyzerId\": \"cracha-evento\",\n    \"contents\": [\n      {\n        \"fields\": {\n          \"Nome\":    { \"type\": \"string\", \"valueString\": \"Ana Martins\", \"confidence\": 0.95 },\n          \"Empresa\": { \"type\": \"string\", \"valueString\": \"Contoso\", \"confidence\": 0.92 },\n          \"Cargo\":   { \"type\": \"string\", \"valueString\": \"Engenheira de Dados\", \"confidence\": 0.88 },\n          \"Categoria\": { \"type\": \"string\", \"valueString\": \"cracha\", \"confidence\": 0.97 },\n          \"Descricao\": { \"type\": \"string\", \"valueString\": \"Cracha de evento com nome, empresa e QR code\", \"confidence\": 0.90 }\n        }\n      }\n    ]\n  }\n}"
                    },
                    {
                        "type": "quote",
                        "value": "Em imagens, o Content Understanding vai além do OCR: ele lê o texto e ainda devolve campos nomeados, uma descrição e a classificação da imagem, tudo em JSON e com pontuação de confiança."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um app precisa ler os números e o texto de comprovantes de pagamento fotografados. Qual capacidade do Content Understanding atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Leitura de texto por OCR",
                                "isCorrect": true
                            },
                            {
                                "text": "Síntese de fala a partir de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Geração de imagem a partir de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Tradução de texto para outro idioma",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer transformar fotos de crachás em registros com os campos nome, empresa e cargo definidos por ela. Qual serviço é o mais indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Content Understanding",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Speech para voz e áudio",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de regressão para prever números",
                                "isCorrect": false
                            },
                            {
                                "text": "Clustering para agrupar dados parecidos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de ler o texto, você quer que o serviço devolva uma frase descrevendo o que aparece em cada imagem. Que tipo de campo do Content Understanding entrega isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um campo generate",
                                "isCorrect": true
                            },
                            {
                                "text": "Um campo boolean",
                                "isCorrect": false
                            },
                            {
                                "text": "Um endpoint de inferência",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cluster de imagens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema recebe imagens variadas e precisa apenas rotular cada uma como documento, recibo ou produto. Qual capacidade do Content Understanding em imagem resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A classificação da imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "A síntese de fala",
                                "isCorrect": false
                            },
                            {
                                "text": "A tradução de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "A segmentação de vídeo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app recebe fotos que podem ser recibos, documentos ou produtos. Para cada recibo é preciso extrair valor e data; as demais imagens só precisam ser rotuladas pela categoria. Como um único analisador de imagem do Content Understanding atende aos dois objetivos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Combinando classificação da imagem com campos nomeados no analisador",
                                "isCorrect": true
                            },
                            {
                                "text": "Usando apenas OCR para tentar obter os dois resultados",
                                "isCorrect": false
                            },
                            {
                                "text": "Usando síntese de fala para tentar descrever cada imagem em áudio",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinando do zero um modelo de regressão para prever a categoria",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Extração de informação de áudio e vídeo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Content Understanding em áudio\nLigações, reuniões e mensagens de voz guardam muita informação. O Content Understanding transcreve a fala (converte áudio em texto) e, sobre essa transcrição, extrai campos no mesmo passo: um resumo da conversa, o sentimento, os tópicos, nomes citados e qualquer campo que você definir, como o motivo do contato ou o número do pedido mencionado.\n\nEle também separa quem falou o quê (diarização de falantes) e marca o tempo de cada trecho. A vantagem para o exame é entender que transcrição e extração acontecem juntas: em vez de transcrever com um serviço e analisar o texto em outro, o Content Understanding entrega a transcrição e os campos estruturados de uma vez."
                    },
                    {
                        "type": "text",
                        "value": "## Content Understanding em vídeo\nVídeo junta imagem em movimento e áudio, então é a mídia mais rica. O Content Understanding segmenta o vídeo em trechos ou cenas, transcreve o áudio, descreve o que aparece na tela (campo generate) e extrai campos por trecho, sempre com marcas de tempo (timestamps).\n\nIsso permite, por exemplo, gerar os capítulos de uma aula gravada, resumir uma reunião, achar o momento exato em que um produto é mencionado ou extrair as menções a uma marca ao longo do vídeo. As marcas de tempo são o que deixa você pular direto para o trecho relevante."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fonte\", \"O que o Content Understanding entrega\", \"Exemplo\"], [\"Áudio\", \"Transcrição, falantes, resumo, sentimento e campos definidos\", \"Resumir uma ligação e achar o motivo do contato\"], [\"Vídeo\", \"Segmentação em trechos, transcrição, descrição e campos com marca de tempo\", \"Gerar capítulos e um resumo de uma aula gravada\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# Analisador de atendimento no cenario de audio\npoller = client.begin_analyze(\n    analyzer_id=\"atendimento-call\",\n    url=\"https://exemplo.com/ligacoes/8842.wav\",\n)\nconteudo = poller.result()[\"contents\"][0]\n\nprint(\"Resumo:\", conteudo[\"fields\"][\"Resumo\"][\"valueString\"])\nprint(\"Motivo:\", conteudo[\"fields\"][\"MotivoContato\"][\"valueString\"])\n\n# A transcricao vem com falante e marca de tempo\nfor fala in conteudo[\"transcript\"]:\n    print(f'[{fala[\"startTime\"]}] {fala[\"speaker\"]}: {fala[\"text\"]}')"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"status\": \"Succeeded\",\n  \"result\": {\n    \"analyzerId\": \"atendimento-call\",\n    \"contents\": [\n      {\n        \"fields\": {\n          \"Resumo\": { \"type\": \"string\", \"valueString\": \"Cliente pede a segunda via da fatura de julho.\", \"confidence\": 0.90 },\n          \"MotivoContato\": { \"type\": \"string\", \"valueString\": \"Segunda via de fatura\", \"confidence\": 0.87 },\n          \"Sentimento\": { \"type\": \"string\", \"valueString\": \"neutro\", \"confidence\": 0.82 }\n        },\n        \"transcript\": [\n          { \"startTime\": \"00:00:02\", \"speaker\": \"Agente\",  \"text\": \"Bom dia, em que posso ajudar?\" },\n          { \"startTime\": \"00:00:05\", \"speaker\": \"Cliente\", \"text\": \"Preciso da segunda via da fatura.\" }\n        ]\n      }\n    ]\n  }\n}"
                    },
                    {
                        "type": "quote",
                        "value": "Em áudio e vídeo, o Content Understanding faz a transcrição e, no mesmo passo, extrai campos como resumo, sentimento e dados definidos por você; no vídeo, ainda segmenta o conteúdo e marca o tempo de cada trecho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma central quer transcrever ligações gravadas e obter um resumo de cada uma. Qual serviço faz a transcrição e a extração de campos num só passo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Content Understanding no cenário de áudio",
                                "isCorrect": true
                            },
                            {
                                "text": "Geração de imagem a partir de um prompt de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "OCR de documentos digitalizados em PDF",
                                "isCorrect": false
                            },
                            {
                                "text": "Clustering de dados numéricos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A partir de uma reunião gravada em vídeo, uma equipe quer gerar capítulos e trechos com marca de tempo. Qual capacidade do Content Understanding atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A segmentação de vídeo em trechos com marcas de tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "A análise de sentimento de um texto já escrito",
                                "isCorrect": false
                            },
                            {
                                "text": "A geração de imagem a partir de uma descrição em texto",
                                "isCorrect": false
                            },
                            {
                                "text": "A regressão para prever a duração da reunião",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre uma ligação de suporte, além da transcrição você quer um campo com o motivo do contato e um resumo da conversa. Como o Content Understanding entrega isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com campos definidos no analisador e um generate para o resumo",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas devolvendo o áudio original convertido em outro formato",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerando apenas uma imagem estática que ilustra a ligação",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzindo automaticamente a ligação inteira para outro idioma",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa localizar o momento exato de um vídeo em que um produto é citado. Qual recurso do Content Understanding torna isso possível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As marcas de tempo da transcrição e dos trechos",
                                "isCorrect": true
                            },
                            {
                                "text": "A síntese de fala do texto encontrado",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura de código de barras de cada produto",
                                "isCorrect": false
                            },
                            {
                                "text": "A classificação de imagem em categorias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer um único serviço que transcreva as ligações e já devolva, como campos estruturados, o resumo, o motivo do contato e o sentimento, sem precisar juntar dois serviços diferentes. Qual é a melhor escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Azure Content Understanding, que une transcrição e extração",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure AI Speech usado sozinho, que só devolve a transcrição",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure AI Vision, que trabalha apenas com imagens",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de geração de imagem, que não lida com áudio",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Construindo um app leve de extração de informação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A arquitetura de um app de extração\nUm app de extração é uma camada fina sobre o Content Understanding. O fluxo ponta a ponta é sempre parecido:\n\n1. Provisionar um recurso do Microsoft Foundry com o Content Understanding.\n2. Definir o analisador uma vez, com o schema dos campos que você quer.\n3. O app recebe o arquivo do usuário (upload de PDF, foto, áudio ou vídeo).\n4. O app chama o analisador e recebe o JSON estruturado.\n5. Aplica uma regra de confiança e grava os dados no sistema, enviando o que ficou incerto para revisão humana.\n\nO app quase não tem lógica de IA: o trabalho pesado fica no serviço. Você só precisa do endpoint e de uma credencial (a chave do recurso ou, de preferência, o Microsoft Entra ID) e do id do analisador."
                    },
                    {
                        "type": "text",
                        "value": "## Definindo o analisador (schema)\nO analisador customizado é descrito em um pequeno JSON. Nele você declara o cenário (document, image, audio ou video) e a lista de campos, cada um com tipo, método (extract ou generate) e uma descrição. Escrever boas descrições importa: elas guiam o modelo, quase como um prompt, e melhoram a qualidade da extração. O mesmo conceito de schema vale para as quatro mídias, o que deixa o app uniforme."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"description\": \"Extrai campos de faturas de fornecedores\",\n  \"scenario\": \"document\",\n  \"fieldSchema\": {\n    \"fields\": {\n      \"Fornecedor\": { \"type\": \"string\", \"method\": \"extract\", \"description\": \"Razao social do fornecedor\" },\n      \"NumeroNota\": { \"type\": \"string\", \"method\": \"extract\", \"description\": \"Numero da nota fiscal\" },\n      \"ValorTotal\": { \"type\": \"number\", \"method\": \"extract\", \"description\": \"Valor total a pagar\" },\n      \"Vencimento\": { \"type\": \"date\",   \"method\": \"extract\", \"description\": \"Data de vencimento\" },\n      \"Resumo\":     { \"type\": \"string\", \"method\": \"generate\", \"description\": \"Resumo da fatura em uma frase\" }\n    }\n  }\n}"
                    },
                    {
                        "type": "code",
                        "value": "import json\nfrom azure.ai.contentunderstanding import ContentUnderstandingClient\nfrom azure.core.credentials import AzureKeyCredential\n\nclient = ContentUnderstandingClient(endpoint, AzureKeyCredential(key))\n\n# 1. Cria o analisador a partir do schema (uma unica vez)\nwith open(\"analisador-fatura.json\", \"r\", encoding=\"utf-8\") as f:\n    definicao = json.load(f)\nclient.create_analyzer(analyzer_id=\"fatura-fornecedor\", definition=definicao)\n\nLIMITE = 0.80   # abaixo disso, o campo vai para revisao humana\n\ndef extrair(caminho):\n    with open(caminho, \"rb\") as arq:\n        poller = client.begin_analyze(\n            analyzer_id=\"fatura-fornecedor\",\n            content=arq.read(),\n            content_type=\"application/pdf\",\n        )\n    campos = poller.result()[\"contents\"][0][\"fields\"]\n    dados, revisar = {}, []\n    for nome, campo in campos.items():\n        dados[nome] = campo.get(\"valueString\") or campo.get(\"valueNumber\") or campo.get(\"valueDate\")\n        if campo.get(\"confidence\", 1) < LIMITE:\n            revisar.append(nome)\n    return dados, revisar\n\ndados, revisar = extrair(\"fatura-1042.pdf\")\nprint(\"Extraido:\", dados)\nif revisar:\n    print(\"Enviar para revisao humana:\", revisar)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Boa prática\", \"Por quê\"], [\"Começar com um analisador pronto\", \"Entrega valor rápido antes de customizar\"], [\"Escrever boas descrições nos campos\", \"Guiam o modelo e melhoram a extração\"], [\"Definir um limite de confiança\", \"Envia os campos incertos para revisão humana\"], [\"Autenticar com o Microsoft Entra ID\", \"Evita chaves fixas no código\"], [\"Guardar o JSON bruto retornado\", \"Permite auditar e reprocessar depois\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um app de extração é uma camada fina sobre o Content Understanding: defina o analisador uma vez, envie cada arquivo, receba o JSON e use a confiança de cada campo para decidir o que segue automático e o que vai para revisão humana."
                    }
                ],
                "questions": [
                    {
                        "statement": "Antes de extrair dados com o Content Understanding, o que o app precisa definir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O analisador com o schema dos campos a extrair",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cluster de imagens semelhantes",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma matriz de confusão do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto de teste rotulado manualmente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para colocar um app de extração no ar rapidamente, sem precisar definir um schema próprio de imediato, o que usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um analisador pronto",
                                "isCorrect": true
                            },
                            {
                                "text": "Um modelo de regressão treinado do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Um algoritmo de clustering",
                                "isCorrect": false
                            },
                            {
                                "text": "Um endpoint de síntese de fala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No app, cada campo volta com uma pontuação de confiança. Qual é uma boa prática para os campos com confiança baixa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Encaminhá-los para revisão humana antes de usar o valor",
                                "isCorrect": true
                            },
                            {
                                "text": "Descartar automaticamente o documento inteiro sem revisão",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover completamente a pontuação de confiança da saída",
                                "isCorrect": false
                            },
                            {
                                "text": "Aceitar sempre o valor sem qualquer tipo de verificação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No schema do analisador, você quer um campo Resumo que o modelo escreve a partir da fatura, e não copiado de um trecho específico. Que método definir para esse campo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "generate",
                                "isCorrect": true
                            },
                            {
                                "text": "extract",
                                "isCorrect": false
                            },
                            {
                                "text": "ocr",
                                "isCorrect": false
                            },
                            {
                                "text": "classify",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app de extração processa faturas, comprovantes fotografados e ligações e lança tudo automaticamente no financeiro. A equipe quer garantir que valores com baixa confiança não sigam sem conferência, mantendo a extração automática na maioria dos casos. Qual desenho atende a isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Definir um limite e mandar para revisão só o que for incerto",
                                "isCorrect": true
                            },
                            {
                                "text": "Revisar manualmente todos os documentos processados um a um",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar sempre no campo de maior confiança e ignorar os demais",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a pontuação de confiança da saída para simplificar o app",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: "iniciante", description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log("Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
