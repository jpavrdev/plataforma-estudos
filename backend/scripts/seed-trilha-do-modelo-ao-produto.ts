// Seed da trilha Do Modelo ao Produto (avancado), estagio 9 (final) do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-do-modelo-ao-produto.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Do Modelo ao Produto";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "O último passo do cientista de dados: colocar um modelo em produção. Do notebook ao produto, servir previsões com uma API, empacotar com Docker, monitorar o modelo e o drift, retreinar, e a ética e a IA responsável. O fechamento do roadmap de Ciência de Dados.";

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
        "titulo": "Módulo 1 - Do notebook ao produto: o que muda",
        "aulas": [
            {
                "titulo": "Notebook x produção: o abismo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 1 - Do notebook ao produto: o que muda\n\nA última aula de Machine Learning na Prática fechou com uma prévia: o próximo estágio ia falar de colocar o modelo em produção, servir previsões, MLOps e monitorar com ética. Chegou a hora de cumprir essa promessa.\n\nVocê já sabe treinar, avaliar e ajustar um modelo. Sabe montar um `Pipeline` pra não vazar dado de validação, sabe salvar o resultado com `joblib`. Isso é a parte que a maioria dos cursos de ciência de dados chama de \"o trabalho\". Só que, no mundo real, treinar o modelo é menos da metade do caminho: esta trilha é sobre a outra metade, o que acontece depois que o modelo funciona bem no seu notebook. Esta primeira aula abre o módulo mostrando a distância real entre um modelo que roda numa célula do Jupyter e um modelo que está no ar, servindo gente."
                    },
                    {
                        "type": "text",
                        "value": "## Um notebook é um ambiente de laboratório\n\nPense no que acontece quando você treina um modelo num notebook. Você carrega um CSV que já conhece, mais ou menos limpo. Roda a célula, olha o resultado, ajusta um hiperparâmetro, roda de novo. Se der erro, você vê o traceback na hora e conserta ali mesmo. Quando o modelo fica bom, você anota a métrica e segue pro próximo passo.\n\nEssa dinâmica só funciona porque você está lá, no controle de cada execução. Um notebook não roda sozinho às três da manhã. Ele não precisa responder em duzentos milissegundos. Ele não recebe um dado maluco que ninguém previu. E se ele quebrar, o único prejudicado é o seu tempo."
                    },
                    {
                        "type": "code",
                        "value": "# No notebook, o fluxo inteiro cabe numa sessão, com você por perto\nimport pandas as pd\nfrom sklearn.linear_model import LogisticRegression\n\ndf = pd.read_csv(\"clientes.csv\")\nX = df[[\"idade\", \"renda_mensal\", \"tempo_de_casa_meses\"]]\ny = df[\"cancelou\"]\n\nmodelo = LogisticRegression()\nmodelo.fit(X, y)\n\n# você roda essa linha, olha o número na tela e segue o dia\nprint(modelo.predict(X.iloc[[0]]))\n\n# em produção ninguém vai abrir este notebook pra rodar de novo.\n# o modelo precisa existir fora dele, pronto pra responder quando\n# alguém, ou algum outro sistema, perguntar. essa distância é o\n# assunto do restante desta trilha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"No notebook\",\"Em produção\"],[\"Quem aciona a execução\",\"Você, clicando em rodar\",\"Um sistema, sozinho, sem ninguém olhando\"],[\"Frequência\",\"Uma vez, ou algumas, enquanto você ajusta\",\"Milhares de vezes por dia, sem parar\"],[\"Dados de entrada\",\"Um CSV que você já conhece\",\"Dados novos chegando ao vivo, nem sempre limpos\"],[\"Quando algo dá errado\",\"Você vê o erro na hora e conserta\",\"Ninguém percebe até alguém reclamar\"],[\"Ambiente de execução\",\"Sua máquina, do jeito que você configurou\",\"Um servidor diferente, que precisa ter tudo igual\"],[\"Validade do resultado\",\"Vale pra aquele momento, aquele dado\",\"Precisa continuar valendo semana após semana\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O abismo tem nome\n\nA distância entre esses dois mundos tem nome: é o abismo entre pesquisa e produção. Um modelo que só existe num notebook não gera valor nenhum pra ninguém, por melhor que seja a métrica. O valor aparece quando alguém (uma pessoa usando um site, outro sistema fazendo uma chamada, um processo automático) consegue usar aquela previsão sem precisar de você presente.\n\nAtravessar esse abismo é o assunto do resto desta trilha: persistir o modelo com `joblib` (retomando o que você já viu em Machine Learning na Prática), expor ele numa API como as que existem no mundo de back-end, empacotar tudo num container Docker, monitorar se ele continua bom, e recolocar ele em produção quando os dados mudarem. Cada peça desse caminho resolve um problema que simplesmente não existe dentro de um notebook."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo que só roda no seu notebook não vale nada pra quem precisa da previsão dele. Produção é o momento em que o modelo para de ser seu experimento e passa a ser responsabilidade de alguém."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza principalmente a diferença entre rodar um modelo num notebook e rodar esse mesmo modelo em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em produção o modelo responde sozinho, sem alguém supervisionando cada execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em produção o modelo usa uma linguagem de programação diferente da usada no notebook.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em produção o modelo precisa necessariamente trocar de algoritmo pra ficar mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em produção o modelo deixa de calcular métricas como acurácia ou erro médio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo bateu 92% de acurácia num teste feito dentro do notebook. Por que isso não garante que ele vai se sair bem em produção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque aquele número vale pra um dado específico, e não pros dados novos que vão chegar ao vivo, dia após dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a métrica de acurácia só é válida pra problemas de regressão, nunca pra classificação de cancelamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o notebook arredonda o valor da métrica pra cima antes de mostrar o resultado final na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda métrica calculada dentro de uma célula perde a validade assim que o notebook é fechado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de previsão criada a partir de um modelo recebe, de vez em quando, uma requisição com um valor fora do padrão visto no treino (por exemplo, idade negativa). No notebook, isso nunca tinha acontecido. Isso ilustra qual diferença central entre notebook e produção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em produção o modelo recebe dados do mundo real, que podem vir sujos ou inesperados, sem ninguém filtrando antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em produção o modelo precisa ser reescrito numa linguagem de tipagem mais rígida, como Java ou C++, por segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em produção o modelo para de aceitar números negativos automaticamente, por uma regra padrão dos frameworks de ML.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em produção o modelo troca sozinho de algoritmo quando encontra um valor que não apareceu durante o treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de recomendação foi treinado, validado e colocado no ar. Três meses depois, ele passa a recomendar produtos ruins, mas ninguém mudou uma linha de código. O que esse cenário sugere sobre a diferença entre notebook e produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que em produção o modelo roda sem supervisão constante, e a qualidade pode cair mesmo sem mudar o código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o time esqueceu de salvar o modelo certo com `joblib`, e por engano está servindo uma versão antiga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o servidor onde o modelo está hospedado perdeu desempenho, o que reduz a qualidade das previsões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o notebook original foi apagado, então o modelo em produção perdeu acesso aos dados de treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de aprovação de crédito passa a recusar clientes bons por causa de um bug sutil no jeito de montar as features, mas isso só aparece depois que o modelo vai pra produção. Por que um bug assim costuma escapar da fase de notebook?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque no notebook você confere cada resultado à mão, e em produção ninguém acompanha previsão por previsão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque no notebook o Python calcula as features numa ordem diferente da usada depois em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque no notebook esse tipo de bug de código é sempre corrigido antes de qualquer resultado aparecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque no notebook o modelo de aprovação de crédito roda com uma lista menor de features do que em produção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é MLOps",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um nome que você já viu\n\nA última aula de Machine Learning na Prática já citou esse nome de passagem: MLOps. Chegou a hora de abrir o que ele significa de verdade.\n\nMLOps é a junção de duas palavras: *machine learning* e *operations*, a mesma palavra que aparece em DevOps, a aproximação entre quem escreve código e quem mantém esse código rodando em produção. MLOps faz esse mesmo trabalho de aproximação, só que pra sistemas de machine learning: é o conjunto de práticas, ferramentas e hábitos que leva um modelo do notebook até um sistema confiável, que continua funcionando bem depois que o cientista de dados que o treinou foi cuidar de outra coisa."
                    },
                    {
                        "type": "text",
                        "value": "## Por que ML não é só \"mais um software\"\n\nDá pra pensar que colocar um modelo em produção é igual a colocar qualquer API no ar: escreve o código, sobe um servidor, pronto. Boa parte é mesmo igual, um sistema de machine learning usa API, Docker e servidor do mesmo jeito que qualquer outra aplicação. A diferença é que ele carrega uma dependência que o software tradicional não tem: ele depende dos dados.\n\nUm sistema comum, um cadastro de usuários ou um carrinho de compras, tem comportamento definido pelo código: se a regra é \"desconto de 10% acima de R$ 200\", ela vale hoje e vai valer daqui a um ano, a não ser que alguém mude o código. Um modelo de machine learning não funciona assim. O comportamento dele foi aprendido a partir de um retrato dos dados feito num certo momento. Se o mundo que gerou aqueles dados muda (os clientes mudam de hábito, o mercado se mexe), o modelo continua com o código idêntico, e a qualidade cai mesmo assim."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Software tradicional\",\"Sistema com machine learning\"],[\"O que define o comportamento\",\"As regras escritas no código\",\"O código mais o que o modelo aprendeu dos dados\"],[\"Como envelhece\",\"Só muda se alguém mexer no código\",\"Pode piorar sozinho, com o código parado\"],[\"O que testar\",\"Se a lógica faz o que deveria\",\"Se a lógica funciona e se a previsão continua boa\"],[\"Depende de\",\"Especificação e código\",\"Especificação, código e os dados usados no treino\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## MLOps junta três frentes\n\nDar conta desse tipo de sistema pede prática de três áreas ao mesmo tempo: ciência de dados (quem sabe treinar e avaliar modelos, o que você vem praticando desde a trilha de Machine Learning), engenharia de software (quem sabe construir sistemas confiáveis e que escalam) e operações (quem sabe manter serviços no ar, com monitoramento e infraestrutura). MLOps não substitui nenhuma dessas frentes, é a cola entre elas.\n\nÉ por isso que, na prática, MLOps costuma envolver coisas como versionar dados e modelos (não só código), automatizar o retreino, monitorar previsões (não só erros de sistema) e ter um jeito de voltar atrás quando um modelo novo sai pior que o antigo. Você vai ver cada uma dessas peças nos próximos módulos desta trilha."
                    },
                    {
                        "type": "text",
                        "value": "## Sendo honesto sobre a complexidade\n\nVale dizer isso já de cara: MLOps não é uma fórmula simples, nem um pacote que se instala e resolve tudo. É uma disciplina relativamente nova, cada empresa monta o próprio jeito de aplicar, e as ferramentas mudam rápido. O objetivo desta trilha não é entregar uma receita fechada, e sim os conceitos que continuam valendo independente da ferramenta da vez: o que precisa ser verdade pra um modelo funcionar bem em produção, e por quê."
                    },
                    {
                        "type": "quote",
                        "value": "MLOps é DevOps mais uma pergunta que o software tradicional não precisa se fazer: os dados que alimentam esse sistema ainda representam o mundo real?"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a sigla MLOps representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A junção entre machine learning e operações, unindo prática de ciência de dados com a de manter sistemas no ar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um framework específico de Python usado exclusivamente pra treinar modelos de machine learning em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "A junção entre machine learning e otimização, focada em deixar os algoritmos de treino mais rápidos e leves.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço de nuvem que hospeda notebooks Jupyter pra várias pessoas do time trabalharem ao mesmo tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal razão pela qual um sistema de machine learning em produção pode se comportar diferente do esperado, mesmo sem nenhuma mudança de código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o comportamento do modelo depende também dos dados, e o mundo que gera esses dados pode mudar com o tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque toda biblioteca de machine learning se atualiza automaticamente sozinha, alterando os cálculos internos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o servidor de produção recalcula os pesos do modelo periodicamente, sem que ninguém precise pedir isso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Python reinterpreta o código de um jeito levemente diferente a cada nova execução do mesmo programa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide tratar o deploy de um modelo exatamente como tratam o deploy de qualquer API comum, sem adicionar mais nada ao processo. Qual prática, específica de MLOps, provavelmente vai faltar nessa abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Acompanhar se a qualidade das previsões continua boa com o tempo, já que isso não aparece como erro de sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever testes automatizados antes de qualquer mudança de código ser enviada pro ambiente de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um endereço de servidor fixo pra que outras aplicações consigam chamar essa API sempre no mesmo lugar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registrar em log cada chamada recebida pela API, junto com o tempo que ela levou pra responder.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe trata um modelo de recomendação como se fosse uma função pura: mesma entrada, mesma saída, e testes de unidade bastam pra garantir qualidade pra sempre. Qual risco central essa visão ignora?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a relação aprendida pelo modelo pode deixar de valer conforme o comportamento dos usuários muda com o tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que funções puras em Python rodam mais devagar que funções com efeito colateral, atrasando a resposta ao usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que testes de unidade não conseguem, tecnicamente, ser escritos pra nenhum tipo de sistema de recomendação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que modelos de recomendação não podem ser chamados a partir de uma API REST construída com Flask ou FastAPI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando um time que só domina engenharia de software com um time de MLOps maduro, qual prática o segundo time tem que o primeiro dificilmente pensaria em fazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Versionar não só o código, mas também os dados e o modelo treinado, pra saber exatamente o que está no ar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever testes automatizados pro código antes de qualquer alteração ser enviada pro ambiente de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um controle de versão como o Git pra acompanhar o histórico de mudanças nos arquivos do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar o ambiente de desenvolvimento do ambiente de produção, usando configurações diferentes pra cada um.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os desafios novos de ML em produção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quatro problemas que o notebook não tinha\n\nA aula passada mostrou que colocar um modelo em produção traz uma dependência extra: os dados. Esta aula cataloga, de forma direta, os quatro desafios novos que nascem dessa dependência e que vão ocupar o restante desta trilha: servir, reproduzir, monitorar e retreinar. Nenhum deles existe dentro de um notebook, porque dentro de um notebook é você quem faz esse papel, sem nem perceber."
                    },
                    {
                        "type": "text",
                        "value": "## Servir: entregar a previsão pra quem precisa\n\nServir é o nome do problema de fazer a previsão chegar em quem, ou o que, precisa dela. No notebook, servir é rodar `modelo.predict(X)` e olhar o valor na tela. Em produção, servir significa ter o modelo carregado numa aplicação que fica de prontidão, esperando pedidos o tempo todo, devolvendo a previsão certa pro pedido certo, rápido o suficiente pra quem está esperando do outro lado. É o assunto inteiro do Módulo 2 desta trilha."
                    },
                    {
                        "type": "text",
                        "value": "## Reproduzir: o mesmo resultado sempre\n\nReproduzir é conseguir treinar ou rodar o mesmo modelo e chegar no mesmo resultado, não importa em qual máquina ou quando. Parece óbvio, mas não é: uma versão diferente do scikit-learn, uma semente aleatória não fixada, uma biblioteca numa versão diferente entre a sua máquina e o servidor, qualquer uma dessas coisas pode fazer o mesmo código produzir um resultado levemente diferente. Sem reprodutibilidade, fica difícil até saber se um bug é do modelo ou do ambiente. O Módulo 3 desta trilha trata desse problema de frente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Desafio\",\"Pergunta que ele responde\",\"Onde esta trilha resolve\"],[\"Servir\",\"Como a previsão chega em quem precisa dela?\",\"Módulo 2\"],[\"Reproduzir\",\"O mesmo código gera o mesmo resultado em qualquer lugar?\",\"Módulo 3\"],[\"Monitorar\",\"O modelo continua bom depois de meses no ar?\",\"Módulo 4\"],[\"Retreinar\",\"Como atualizar o modelo quando os dados mudam?\",\"Módulo 5\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Monitorar: o modelo ainda está bom?\n\nMonitorar é acompanhar, com números, se o modelo continua fazendo previsões boas depois de ir pro ar. No notebook essa pergunta nem existe: você treina, mede a métrica uma vez, e segue. Em produção, o mesmo modelo pode piorar aos poucos, silenciosamente, sem lançar nenhum erro de sistema, porque o problema não está no código, está na distância crescente entre o que o modelo aprendeu e o que está acontecendo agora. Monitorar é o jeito de perceber essa distância antes que ela vire prejuízo. Tema do Módulo 4."
                    },
                    {
                        "type": "text",
                        "value": "## Retreinar: atualizar o modelo com dados novos\n\nRetreinar é treinar o modelo de novo, com dados mais recentes, pra ele voltar a representar o presente em vez de um passado que já não existe mais. Parece simples (\"treina de novo e pronto\"), mas envolve decidir quando retreinar, como validar que o modelo novo é realmente melhor que o antigo antes de trocar, e como fazer essa troca sem derrubar o serviço no meio do caminho. É o assunto do Módulo 5."
                    },
                    {
                        "type": "quote",
                        "value": "Servir, reproduzir, monitorar e retreinar: nenhum desses quatro verbos faz parte do vocabulário de quem só treina modelo no notebook. Em produção, os quatro viram rotina."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são os quatro desafios novos que aparecem quando um modelo de machine learning vai pra produção, segundo o que esta aula apresentou?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Servir, reproduzir, monitorar e retreinar o modelo ao longo do tempo em que ele fica no ar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compilar, empacotar, distribuir e vender o modelo pra outras empresas do mesmo mercado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Documentar, testar, revisar e aprovar o código do modelo antes de qualquer treino inicial.",
                                "isCorrect": false
                            },
                            {
                                "text": "Programar, depurar, comentar e formatar o código-fonte do modelo dentro do notebook original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe treina um modelo numa máquina com o scikit-learn na versão 1.2, mas sobe o modelo pra um servidor que tem instalada a versão 1.5. O resultado das previsões muda sutilmente. Qual desafio essa situação ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reproduzir, porque o mesmo modelo deveria se comportar igual, não importa onde está rodando.",
                                "isCorrect": true
                            },
                            {
                                "text": "Servir, porque o modelo não está conseguindo entregar a previsão pra quem fez o pedido a tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Monitorar, porque a equipe não está acompanhando a métrica de qualidade das previsões no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retreinar, porque os dados usados no servidor de produção já não são os mesmos usados no treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que, três meses depois do deploy, a taxa de acerto do modelo caiu, mesmo sem nenhuma mudança de código ou de ambiente. Qual dos quatro desafios trata diretamente de perceber esse tipo de queda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Monitorar, que existe justamente pra acompanhar se a qualidade das previsões segue boa com o tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Servir, que garante que a previsão chega até o sistema que fez o pedido dentro do tempo esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reproduzir, que garante que o mesmo código gera sempre o mesmo resultado, em qualquer servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Empacotar, que junta o modelo e as dependências dele num container pra rodar em qualquer lugar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de previsão de preços de imóveis está rápida e no ar, respondendo em poucos milissegundos, mas passou a errar mais depois de uma alta nos juros que mudou o mercado. Qual desafio essa API ainda não resolveu?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Retreinar, porque o modelo precisa aprender de novo com dados que reflitam o mercado atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Servir, porque uma resposta em poucos milissegundos ainda é tempo demais pra esse tipo de sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reproduzir, porque o mesmo pedido de previsão está gerando valores diferentes a cada nova chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Monitorar, porque a equipe nunca colocou nenhum tipo de log de previsão dentro dessa API específica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido tratar servir, reproduzir, monitorar e retreinar como desafios interligados, e não como quatro problemas isolados que se resolvem um de cada vez, pra sempre?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque resolver um retreino, por exemplo, exige servir o modelo novo, e volta a exigir monitoramento dele depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as quatro palavras são, na prática, sinônimos usados por empresas diferentes pra uma mesma tarefa única.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a ordem certa é sempre monitorar primeiro, e só depois pensar nos outros três desafios seguintes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada um desses desafios só existe em empresas de tecnologia muito grandes, com times separados enormes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ciclo de vida de um modelo: o loop",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um ciclo, não uma linha reta\n\nAté aqui, o caminho que você seguiu no roadmap pareceu uma linha reta: lógica, Python, estatística, pandas, SQL, visualização, machine learning, ML na prática. Faz sentido, é assim que se aprende um assunto novo. Só que o trabalho de um cientista de dados de verdade não termina quando o modelo fica pronto. Ele volta pro início, de novo e de novo. Esta aula descreve esse ciclo completo, do primeiro problema até o retreino que reabre tudo outra vez."
                    },
                    {
                        "type": "text",
                        "value": "## As etapas, uma a uma\n\n- **Problema**: definir o que precisa ser resolvido, e como isso vira uma pergunta de machine learning (prever, classificar, agrupar). Sem essa etapa não existe projeto, só um modelo sem propósito.\n- **Dados**: coletar, entender e limpar os dados que vão alimentar o modelo. Aqui entram Análise de Dados e Banco de Dados, o trabalho que costuma tomar a maior parte do tempo real de um projeto.\n- **Treino**: ajustar o modelo aos dados, com tudo que você viu em Machine Learning e ML na Prática (`Pipeline`, validação, ajuste de hiperparâmetro).\n- **Avaliação**: medir se o modelo é bom o suficiente, com as métricas certas pro problema, antes de confiar nele.\n- **Deploy**: colocar o modelo pra servir gente de verdade. Assunto dos Módulos 2 e 3 desta trilha.\n- **Monitoramento**: acompanhar se o modelo continua bom depois de no ar. Assunto do Módulo 4.\n- **Retreino**: treinar de novo com dados atualizados quando o monitoramento apontar necessidade, o que leva de volta ao início do ciclo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\",\"Pergunta central\",\"Onde você praticou (ou vai praticar)\"],[\"Problema\",\"O que precisamos prever ou decidir?\",\"Entendimento do problema, lógica de programação\"],[\"Dados\",\"Que dados existem, e em que estado?\",\"Análise de Dados, Banco de Dados\"],[\"Treino\",\"Que modelo aprende esse padrão melhor?\",\"Machine Learning, ML na Prática\"],[\"Avaliação\",\"Esse modelo é bom o bastante?\",\"Estatística e Probabilidade, métricas de ML\"],[\"Deploy\",\"Como a previsão chega em quem precisa?\",\"Módulos 2 e 3 desta trilha\"],[\"Monitoramento\",\"O modelo continua bom com o tempo?\",\"Módulo 4 desta trilha\"],[\"Retreino\",\"O que mudou, e como incorporar isso?\",\"Módulo 5 desta trilha\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que é um loop, e não uma linha\n\nA etapa de retreino não é o fim do caminho, é uma porta que abre de volta pro começo. Dados novos viram o novo \"Dados\" do ciclo, o modelo é treinado de novo (\"Treino\"), avaliado de novo (\"Avaliação\") e, se estiver melhor, substitui o modelo antigo em produção (\"Deploy\") outra vez. Esse loop pode girar de novo em semanas, em dias, ou quase em tempo real, dependendo de quão rápido os dados daquele problema mudam.\n\nTratar isso como linha reta (\"terminei o deploy, terminei o projeto\") é o erro mais comum de quem está saindo do notebook pela primeira vez. Na prática, o deploy é só a primeira volta do loop, não a chegada."
                    },
                    {
                        "type": "code",
                        "value": "# o ciclo de vida de um modelo em produção, resumido em pseudocódigo.\n# as funções abaixo representam etapas do ciclo, não uma biblioteca real.\n\nwhile modelo_esta_em_producao:\n    dados_novos = coletar_dados_recentes()\n    metricas = monitorar(modelo_atual, dados_novos)\n\n    if metricas.indicam_degradacao():\n        candidato = treinar(dados_novos)\n\n        if avaliar(candidato) > avaliar(modelo_atual):\n            modelo_atual = publicar(candidato)  # um novo deploy\n        # se o candidato não for melhor, modelo_atual continua o mesmo\n\n    # e o loop volta a monitorar"
                    },
                    {
                        "type": "quote",
                        "value": "Deploy não é a linha de chegada, é a primeira volta do loop. Um modelo em produção está sempre a um monitoramento de distância de precisar treinar de novo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo o ciclo de vida de um modelo apresentado nesta aula, o que acontece depois da etapa de retreino?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O ciclo recomeça: o modelo retreinado passa de novo por avaliação e, se for melhor, um novo deploy.",
                                "isCorrect": true
                            },
                            {
                                "text": "O projeto é encerrado definitivamente, já que retreinar é sempre a última etapa de qualquer ciclo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo antigo é apagado permanentemente, sem qualquer tipo de comparação com o modelo novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe de dados é dissolvida, porque o trabalho de ciência de dados termina depois do retreino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual etapa do ciclo de vida costuma consumir mais tempo real num projeto de ciência de dados, segundo o que esta aula (e o restante do roadmap) sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A etapa de dados, que envolve coletar, entender e limpar antes que qualquer treino faça sentido.",
                                "isCorrect": true
                            },
                            {
                                "text": "A etapa de treino, porque ajustar hiperparâmetros manualmente exige testar dezenas de combinações.",
                                "isCorrect": false
                            },
                            {
                                "text": "A etapa de deploy, porque escrever uma API e configurar um container sempre leva semanas inteiras.",
                                "isCorrect": false
                            },
                            {
                                "text": "A etapa de avaliação, porque calcular métricas estatísticas corretas é um processo lento e complexo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe considera o projeto de machine learning \"concluído\" assim que o modelo é colocado em produção pela primeira vez, e desativa o monitoramento pra economizar esforço. Que risco essa visão de linha reta cria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo pode se degradar aos poucos, sem ninguém perceber ou saber a hora certa de retreinar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo vai gerar erro de sistema em toda chamada já na primeira semana, derrubando a API por completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API para de responder qualquer chamada externa até que alguém reative o serviço manualmente no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe perde acesso ao código-fonte do modelo, sendo obrigada a treinar tudo de novo do zero.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Avaliação e monitoramento parecem tarefas parecidas, já que as duas envolvem medir a qualidade do modelo com métricas. Qual é a diferença central entre essas duas etapas do ciclo de vida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Avaliação mede a qualidade antes do deploy, com dados de teste conhecidos; monitoramento mede depois, com dados reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Avaliação usa métricas de estatística; monitoramento usa métricas de machine learning, tecnicamente bem diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Avaliação é feita pelo cientista de dados; monitoramento é feito só por um engenheiro de dados, nunca a mesma pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Avaliação acontece uma única vez na vida do projeto; monitoramento é a etapa final, que substitui a avaliação de vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O ciclo de retreino de um modelo de detecção de fraude em cartão de crédito tende a rodar bem mais rápido do que o de um modelo que prevê a nota de um aluno a partir de horas estudadas por semestre. O que explica essa diferença de ritmo no loop?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fraudadores mudam de tática rápido, então esses dados envelhecem bem mais rápido que os do outro problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Modelos de fraude são tecnicamente mais simples de treinar, então o ciclo inteiro leva bem menos tempo sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos têm mais servidores disponíveis, o que permite treinar e avaliar modelos de fraude em bem menos tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A etapa de avaliação de modelos de fraude é dispensada por lei, o que encurta o ciclo de vida do projeto inteiro.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os papéis: cientista de dados, engenheiro de ML e engenheiro de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fechar o abismo é trabalho de equipe\n\nAs aulas anteriores mostraram o tamanho da distância entre notebook e produção, e os desafios novos que aparecem no caminho. Uma pergunta natural é: uma pessoa só dá conta de tudo isso? Às vezes sim, principalmente em times pequenos ou startups. Mas, à medida que a empresa cresce, esse trabalho tende a se dividir entre papéis com focos diferentes. Esta aula apresenta os três mais comuns: cientista de dados, engenheiro de machine learning e engenheiro de dados."
                    },
                    {
                        "type": "text",
                        "value": "## Cientista de dados\n\nÉ o papel que você vem treinando ao longo de todo o roadmap: entender o problema de negócio, explorar e entender os dados, treinar modelos, avaliar métricas, e traduzir tudo isso em decisões pra quem não é técnico. O foco central é a pergunta \"qual modelo resolve esse problema, e resolve bem?\". Em times menores, o cientista de dados também acaba sendo quem persiste o modelo, sobe uma API simples e faz o primeiro monitoramento, que é exatamente o assunto desta trilha."
                    },
                    {
                        "type": "text",
                        "value": "## Engenheiro de machine learning\n\nÉ o papel mais próximo da engenharia de software, especializado em colocar e manter modelos em produção. Enquanto o cientista de dados foca em qual modelo é melhor, o engenheiro de ML foca em como servir esse modelo com confiabilidade: APIs rápidas, containers bem construídos, pipelines de retreino automatizados, monitoramento de verdade, um jeito de voltar atrás quando algo dá errado. Em empresas grandes, esse papel existe justamente pra tirar essa responsabilidade das mãos de quem só quer pensar em modelo."
                    },
                    {
                        "type": "text",
                        "value": "## Engenheiro de dados\n\nÉ o papel responsável pelo que vem antes de tudo isso: garantir que os dados existem, estão acessíveis, atualizados e num formato utilizável. É quem constrói os pipelines que movem dados de um sistema pro outro, mantém os bancos e data warehouses, e garante que, quando o cientista de dados senta pra explorar uma tabela, ela está lá, íntegra e em dia. Sem esse trabalho, nem o resto do ciclo de vida começa: não existe \"Dados\" nem \"Treino\" sem alguém cuidando desse cano."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Papel\",\"Pergunta central\",\"Ferramentas do dia a dia\"],[\"Cientista de dados\",\"Qual modelo resolve esse problema?\",\"pandas, scikit-learn, notebooks, estatística\"],[\"Engenheiro de machine learning\",\"Como servir e manter esse modelo com confiança?\",\"APIs, Docker, monitoramento, pipelines de ML\"],[\"Engenheiro de dados\",\"Os dados certos estão disponíveis e confiáveis?\",\"SQL, pipelines de dados, bancos, data warehouses\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os limites entre os papéis são fluidos\n\nNa prática, essas fronteiras variam muito de empresa pra empresa. Numa startup, uma única pessoa pode acumular os três papéis. Numa empresa grande, cada um vira um time inteiro. Não existe uma divisão oficial e universal, e os nomes dos cargos variam (às vezes \"engenheiro de ML\" aparece como \"MLOps engineer\", por exemplo). O que importa não é decorar o nome do cargo, e sim entender as três perguntas centrais: qual modelo, como servir com confiança, e se os dados estão prontos. Sabendo isso, você se localiza em qualquer time, não importa como os cargos estejam nomeados ali."
                    },
                    {
                        "type": "quote",
                        "value": "Cientista de dados, engenheiro de machine learning e engenheiro de dados fazem perguntas diferentes sobre o mesmo sistema. O modelo em produção só existe porque as três respostas se encontram."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual desses papéis tem como foco principal decidir qual modelo resolve melhor um determinado problema de negócio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cientista de dados, que explora os dados, treina modelos e avalia qual deles resolve o problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Engenheiro de machine learning, que decide qual modelo resolve o problema antes de qualquer treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenheiro de dados, que escolhe o modelo certo assim que os pipelines de dados terminam de rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenheiro de infraestrutura, que seleciona o modelo com base na capacidade do servidor disponível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa passa o dia construindo pipelines que movem dados de um sistema de vendas pra um data warehouse, garantindo que as tabelas estejam atualizadas e íntegras todo dia. Qual papel essa descrição representa melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Engenheiro de dados, focado em garantir que os dados estejam disponíveis e confiáveis pros demais times.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cientista de dados, focado em treinar modelos a partir das tabelas que chegam prontas no data warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenheiro de machine learning, focado em servir modelos treinados através de uma API em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenheiro de software, focado em construir a interface que os usuários finais usam todos os dias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa startup pequena, a mesma pessoa treina o modelo, sobe a API e acompanha o monitoramento básico. Isso mostra que, nesse caso, os três papéis desta aula...",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "estão sendo acumulados por uma única pessoa, o que é comum em times pequenos ou startups.",
                                "isCorrect": true
                            },
                            {
                                "text": "deixaram de existir por completo, já que uma pessoa sozinha substitui o conceito dos três juntos.",
                                "isCorrect": false
                            },
                            {
                                "text": "foram divididos igualmente entre três contratações futuras que a startup ainda precisa fazer.",
                                "isCorrect": false
                            },
                            {
                                "text": "não se aplicam a esse projeto, porque MLOps exige por definição pelo menos três pessoas num time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro de machine learning percebe que a API do modelo está lenta e otimiza como ela carrega o modelo na memória. Um cientista de dados, olhando pro mesmo sistema, percebe que a métrica de acerto caiu e investiga se é hora de retreinar. O que essas duas reações diferentes mostram sobre os dois papéis?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que cada papel olha pro sistema com uma pergunta central diferente: confiabilidade ou qualidade do modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que um dos dois profissionais está errado, já que só um problema real pode estar acontecendo nesse sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que engenheiros de machine learning nunca se importam com a métrica de acerto, só com a velocidade da API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que cientistas de dados não têm conhecimento técnico suficiente pra entender por que uma API está lenta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de perceber que os limites entre cientista de dados, engenheiro de ML e engenheiro de dados são fluidos e variam de empresa pra empresa, qual conclusão mais correta se pode tirar daí?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que o mais importante é entender a pergunta central de cada papel, não decorar o nome exato de um cargo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que essas três funções, na prática, são sempre exercidas pela mesma pessoa, não importa a empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que só empresas pequenas usam esses três nomes de cargo, enquanto as grandes usam nomes diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que esses papéis foram definidos por uma única norma internacional que toda empresa segue à risca.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Servir o modelo",
        "aulas": [
            {
                "titulo": "Persistir o modelo com joblib",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Persistir o modelo com joblib\n\nNo módulo anterior desta trilha você viu o ciclo de vida de um modelo: problema, dados, treino, avaliação, deploy, monitoramento, retreino, um loop que não para. Este módulo entra no primeiro passo prático desse loop depois do treino: como uma previsão sai do notebook e chega em quem precisa dela.\n\nLá na trilha de Machine Learning na Prática você treinou um `Pipeline` do scikit-learn (um pré-processamento encadeado com um modelo, pra evitar vazamento de dados) e avaliou os resultados dentro do notebook. Esse `Pipeline` treinado é um objeto Python, vivo na memória do processo que está rodando. Feche o notebook, reinicie o kernel, desligue o computador, e ele desaparece. Pra usar de novo, o jeito mais óbvio parece ser rodar todas as células de treino outra vez.\n\nSó que isso não escala: uma aplicação em produção pode receber centenas ou milhares de pedidos de previsão por dia, e treinar o modelo do zero a cada previsão é lento, caro e, em muitos casos, nem é possível (a base de treino inteira pode não estar disponível ali, na hora)."
                    },
                    {
                        "type": "text",
                        "value": "## O que significa persistir um modelo\n\nPersistir é salvar o estado de um objeto já treinado num arquivo, de um jeito que permita recarregar exatamente aquele objeto depois, em outro processo, em outra máquina, sem repetir o treino. O arquivo guarda os parâmetros que o treino calculou: as médias e desvios que um `StandardScaler` aprendeu, os coeficientes de uma regressão, os splits de uma árvore, as categorias que um `OneHotEncoder` viu. Ele não guarda o dataset de treino nem o código que construiu o pipeline, só o resultado já pronto de ter passado por eles.\n\nEm Python, a forma mais comum de persistir objetos do scikit-learn é a biblioteca `joblib`. Ela existe pro mesmo propósito do módulo `pickle`, da biblioteca padrão, mas é mais eficiente pra objetos com muitos arrays numpy dentro, como é o caso da maioria dos modelos de machine learning."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\n# pipeline treinado como já visto na trilha de Machine Learning na Prática\npipeline = Pipeline([\n    (\"scaler\", StandardScaler()),\n    (\"modelo\", LogisticRegression()),\n])\npipeline.fit(X_train, y_train)\n\n# persiste o pipeline inteiro (preparo + modelo) num arquivo\njoblib.dump(pipeline, \"modelo_v1.joblib\")"
                    },
                    {
                        "type": "text",
                        "value": "## Carregar sem retreinar\n\nDo outro lado, `joblib.load` faz o caminho inverso: lê o arquivo e devolve o objeto pronto, exatamente como estava no momento do `dump`, com o método `predict` já disponível. Não existe um `fit` escondido acontecendo de novo, o carregamento é rápido porque só está reconstruindo um objeto a partir dos parâmetros salvos.\n\nUm detalhe que vale grudar: o nome do arquivo importa. `modelo_v1.joblib` é melhor do que `modelo.joblib`, porque, quando esse modelo for retreinado (e ele vai ser, isso é assunto pro módulo 5), vai existir uma versão nova pra comparar com a antiga, e um nome sem número nenhum é uma armadilha na hora de saber qual arquivo está de fato servindo previsões."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\nimport pandas as pd\n\n# em outro processo, outro dia, sem repetir o treino\nmodelo = joblib.load(\"modelo_v1.joblib\")\n\nnovo_cliente = pd.DataFrame([{\n    \"idade\": 35,\n    \"renda\": 4200.0,\n    \"tempo_de_casa\": 2,\n}])\n\nprevisao = modelo.predict(novo_cliente)\nprint(previsao)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Pipeline na memória do notebook\", \"Arquivo .joblib salvo em disco\"], [\"Sobrevive a fechar o notebook\", \"Não\", \"Sim\"], [\"Pode ser usado por outro processo ou servidor\", \"Não\", \"Sim\"], [\"Precisa repetir o treino pra usar de novo\", \"Sim, sempre\", \"Não, só carregar\"], [\"É o que uma API em produção carrega\", \"Não diretamente\", \"Sim\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Persistir o modelo é o primeiro passo pra tirar a previsão do notebook: o `Pipeline` treinado vira um arquivo, e esse arquivo é a peça que qualquer aplicação vai carregar dali pra frente, sem depender do notebook nunca mais."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a função `joblib.load` faz com um pipeline salvo anteriormente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Carrega o objeto treinado do arquivo, pronto pra prever sem retreinar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treina um pipeline novo a partir dos dados guardados no arquivo joblib.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte o arquivo joblib num script Python equivalente ao treino original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicia o kernel do notebook e reexecuta as células de treino do modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que salvar só o modelo final (por exemplo, a `LogisticRegression`) e não o `Pipeline` inteiro (com o `StandardScaler`, o `OneHotEncoder` etc.) é arriscado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque em produção os dados chegam crus, sem o mesmo preparo aplicado no treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o joblib não consegue salvar objetos do tipo Pipeline, só estimadores isolados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o joblib.load exige que o Pipeline tenha sido criado com o parâmetro memory ativado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um Pipeline sem o modelo final ocupa mais espaço em disco do que um estimador sozinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação vai precisar prever centenas de vezes por dia. Qual é o problema de simplesmente rodar o notebook de treino toda vez que uma previsão é pedida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retreinar a cada previsão é lento e caro, além de exigir a base de treino completa sempre à mão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O notebook não é capaz de gerar previsões novas, só treinar modelos do zero repetidamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O joblib impede a reexecução de um notebook depois que o modelo já foi salvo em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reexecutar o treino sempre resulta em coeficientes levemente diferentes, o que confunde quem usa a previsão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time treinou um `Pipeline` com um `OneHotEncoder` ajustado nas categorias vistas no treino, salvou com `joblib.dump` e, meses depois, carregou o arquivo pra prever um registro com uma categoria nova, nunca vista antes. O que tende a acontecer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Depende do encoder, mas por padrão uma categoria nunca vista no treino tende a gerar erro ou exigir tratamento à parte.",
                                "isCorrect": true
                            },
                            {
                                "text": "O joblib atualiza sozinho as categorias do encoder pra incluir qualquer valor novo encontrado após o carregamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Python identifica a categoria nova e retreina só a etapa do encoder antes de aplicar o resto do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo joblib passa a ficar corrompido ao encontrar um valor fora do que foi visto no treino original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de treinado, o pipeline foi salvo com `joblib.dump`. O que exatamente o arquivo `.joblib` guarda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os parâmetros aprendidos em cada etapa, como médias e coeficientes, não o dataset de treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dataset de treino completo junto com o código-fonte usado pra construir o pipeline original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente os hiperparâmetros escolhidos à mão, sem os valores que o treino calculou a partir dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma referência ao notebook original, que precisa estar aberto pro joblib.load funcionar direito.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Servir via API: a ideia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Com o modelo persistido num arquivo `.joblib`, falta resolver outro problema: como uma aplicação (um site, um app, outro serviço) pede uma previsão e recebe a resposta de volta. Na trilha de back-end você já viu o que é uma API: um programa que fica no ar esperando pedidos HTTP, recebe dados e devolve uma resposta, normalmente em JSON. Servir um modelo é aplicar essa mesma ideia: a lógica por trás do endpoint passa a ser chamar `model.predict()`.\n\nEm vez de alguém abrir um notebook, carregar o arquivo e rodar a previsão manualmente toda vez que é preciso, existe um servidor sempre ligado, pronto pra atender pedidos a qualquer momento."
                    },
                    {
                        "type": "text",
                        "value": "## O que é servir um modelo via API\n\nNa prática, servir um modelo via API significa montar uma aplicação pequena que faz três coisas: carrega o modelo treinado (o arquivo `.joblib`) quando o processo sobe, expõe um endpoint (por exemplo, `POST /predict`) que recebe as features em JSON no corpo do pedido, e devolve a previsão, também em JSON, na resposta.\n\nO detalhe que faz essa ideia funcionar bem é a ordem das coisas: carregar o modelo é caro (lê um arquivo, reconstrói um objeto), então isso acontece **uma vez**, quando o servidor inicia. Depois disso, o mesmo objeto já carregado responde a quantas previsões forem pedidas, sem recarregar o arquivo a cada chamada."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\n\n# roda uma única vez, quando o servidor sobe\nmodelo = joblib.load(\"modelo_v1.joblib\")\n\n\ndef atender_pedido(dados_da_requisicao):\n    # roda a cada pedido recebido, reaproveitando o modelo já carregado\n    return modelo.predict(dados_da_requisicao)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Carregar o modelo a cada pedido\", \"Carregar uma vez, servir muitos pedidos\"], [\"Tempo de resposta\", \"Alto (recarrega o arquivo toda hora)\", \"Baixo (modelo já está pronto em memória)\"], [\"Uso de disco e CPU\", \"Repetido em cada chamada\", \"Concentrado só no início, ao subir o servidor\"], [\"Onde o load aparece no código\", \"Dentro da função que atende o pedido\", \"Fora da função, antes dela existir\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O contrato da chamada\n\nQuem chama o endpoint envia um JSON com os valores das features que o modelo espera (as mesmas colunas usadas no treino, assunto que fecha este módulo, na aula 5). O servidor devolve outro JSON, normalmente com a previsão e, dependendo do modelo, também a probabilidade de cada classe. Como em qualquer API, um pedido malformado deve gerar um erro claro (um código de status HTTP como 400), não uma previsão qualquer devolvida às cegas."
                    },
                    {
                        "type": "text",
                        "value": "## Flask, FastAPI, e o padrão por trás dos dois\n\nEm Python, os dois frameworks mais comuns pra montar esse tipo de endpoint são o Flask e o FastAPI, e a próxima aula mostra um exemplo de cada. Mas vale reter o padrão antes do código: modelo carregado uma vez, endpoint que recebe features e devolve previsão. Essa estrutura se repete independente do framework escolhido, e é basicamente a mesma ideia por trás de qualquer API de modelo em produção, em qualquer linguagem."
                    },
                    {
                        "type": "quote",
                        "value": "Servir um modelo via API não é um conceito novo: é o mesmo padrão de qualquer API de back-end (recebe dado, devolve resposta), só que a resposta agora vem de um `model.predict()` carregado uma vez e reaproveitado em cada pedido."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa API que serve um modelo de machine learning, o que idealmente acontece só uma vez, quando o servidor sobe, e não a cada pedido recebido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O carregamento do modelo treinado a partir do arquivo salvo em disco.",
                                "isCorrect": true
                            },
                            {
                                "text": "A leitura do corpo JSON enviado em cada requisição recebida pelo endpoint.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chamada ao método predict do modelo pra gerar a resposta ao cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A validação dos dados enviados na requisição antes de gerar a previsão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint /predict recarrega o modelo do disco (joblib.load) toda vez que recebe uma requisição, em vez de carregar uma única vez ao iniciar o servidor. Qual é a consequência mais provável sob alto volume de pedidos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada previsão fica mais lenta, porque o carregamento do arquivo se repete sem necessidade a cada chamada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo passa a gerar previsões diferentes a cada chamada, mesmo recebendo os mesmos dados de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor recusa pedidos simultâneos, já que o joblib só permite uma chamada de load por processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API perde a capacidade de devolver respostas em formato JSON depois de algumas chamadas seguidas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido comparar servir um modelo via API com o que já foi visto em APIs de back-end comuns (endpoint recebe JSON, devolve JSON)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o padrão é o mesmo: o endpoint recebe dados e devolve resposta, só que a lógica é model.predict.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque servir um modelo exige um protocolo de rede diferente do HTTP usado nas APIs comuns de back-end.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda API de modelo precisa ser escrita na mesma linguagem do back-end da aplicação já existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um endpoint de modelo só aceita formatos binários específicos, como o próprio arquivo joblib.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se o modelo carregado ocupa bastante memória (por exemplo, um ensemble grande), qual é a razão prática pra carregá-lo uma única vez, num objeto global, em vez de recriá-lo a cada requisição?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Recriar o modelo a cada pedido multiplica memória e tempo à toa, já que o resultado carregado seria sempre o mesmo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um modelo carregado mais de uma vez perde precisão, porque o joblib introduz arredondamentos a cada novo load.",
                                "isCorrect": false
                            },
                            {
                                "text": "A biblioteca joblib bloqueia o processo inteiro caso load seja chamado mais de uma vez na mesma aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelos grandes só conseguem ser carregados uma vez porque o Python limita o total de objetos em memória.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de previsão vai ficar exposta na internet, recebendo pedidos de vários clientes ao mesmo tempo. Do ponto de vista do modelo carregado em memória, isso significa que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O mesmo modelo, carregado uma vez, deve responder a chamadas de predict vindas de pedidos diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada cliente precisa disparar seu próprio joblib.load antes de poder receber uma previsão da API.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor precisa treinar um modelo separado pra cada cliente que se conecta simultaneamente à API.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API só consegue atender um cliente por vez, então pedidos simultâneos ficam sempre numa fila.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um endpoint /predict com Flask ou FastAPI",
                "blocks": [
                    {
                        "type": "text",
                        "value": "A aula anterior descreveu a ideia por trás de servir um modelo: carregar uma vez, expor um endpoint, receber features, devolver previsão. Chegou a hora do código de verdade, com duas ferramentas comuns em Python pra construir APIs: o Flask, mais simples e direto, e o FastAPI, mais recente e com validação de entrada já embutida."
                    },
                    {
                        "type": "code",
                        "value": "from flask import Flask, request, jsonify\nimport joblib\nimport pandas as pd\n\napp = Flask(__name__)\n\n# carregado uma vez, quando o processo do servidor sobe\nmodelo = joblib.load(\"modelo_v1.joblib\")\n\n\n@app.route(\"/predict\", methods=[\"POST\"])\ndef predict():\n    dados = request.get_json()\n    entrada = pd.DataFrame([dados])\n    previsao = modelo.predict(entrada)\n    return jsonify({\"previsao\": float(previsao[0])})\n\n\nif __name__ == \"__main__\":\n    app.run(port=5000)"
                    },
                    {
                        "type": "text",
                        "value": "## Entendendo o endpoint\n\nCada peça do exemplo tem um papel: `app = Flask(__name__)` cria a aplicação; `modelo = joblib.load(...)` roda fora da função `predict`, então acontece uma vez só (a ideia da aula passada); o decorador `@app.route(\"/predict\", methods=[\"POST\"])` diz que essa função responde a pedidos `POST` no caminho `/predict`; `request.get_json()` lê o corpo da requisição e devolve um dicionário Python.\n\nEsse dicionário vira um `pd.DataFrame` de uma linha só antes de chegar em `modelo.predict`, porque o `Pipeline` foi treinado esperando um formato tabular, com nomes de coluna, e não um dicionário solto. É o mesmo tipo de entrada que ele viu durante o treino, isso volta com mais detalhe na aula 5."
                    },
                    {
                        "type": "text",
                        "value": "## A mesma ideia com FastAPI\n\nO FastAPI resolve o mesmo problema com uma diferença importante: em vez de ler um dicionário genérico e confiar que os campos estão certos, você declara o formato esperado numa classe, e o framework valida a requisição automaticamente antes dela chegar na sua função. Se faltar um campo ou o tipo estiver errado, o FastAPI recusa o pedido sozinho, com uma mensagem de erro clara, sem precisar de código extra pra checar isso na mão. Ele também gera documentação interativa da API sozinho, a partir dessa mesma declaração."
                    },
                    {
                        "type": "code",
                        "value": "from fastapi import FastAPI\nfrom pydantic import BaseModel\nimport joblib\nimport pandas as pd\n\napp = FastAPI()\n\nmodelo = joblib.load(\"modelo_v1.joblib\")\n\n\nclass Cliente(BaseModel):\n    idade: int\n    renda: float\n    tempo_de_casa: int\n\n\n@app.post(\"/predict\")\ndef predict(cliente: Cliente):\n    entrada = pd.DataFrame([cliente.model_dump()])\n    previsao = modelo.predict(entrada)\n    return {\"previsao\": float(previsao[0])}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Flask\", \"FastAPI\"], [\"Validação da entrada\", \"Manual, escrita à mão no código\", \"Automática, via classe Pydantic\"], [\"Documentação da API\", \"Não vem pronta\", \"Gerada automaticamente\"], [\"Como declarar o formato esperado\", \"Não é obrigatório declarar\", \"Uma classe BaseModel com os campos\"], [\"Maturidade\", \"Mais antigo, presente em muitos projetos\", \"Mais recente, comum em APIs de dados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Os dois frameworks resolvem o mesmo problema (receber features, devolver previsão), a diferença é o quanto cada um valida a entrada antes de deixar ela chegar no `model.predict`."
                    }
                ],
                "questions": [
                    {
                        "statement": "No endpoint Flask do exemplo, em que ponto do código o modelo é carregado a partir do arquivo joblib?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fora da função predict, uma única vez, logo depois de criar o app Flask.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dentro da função predict, a cada nova requisição recebida pelo endpoint.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro do bloco if __name__ == \"__main__\", só quando o servidor é encerrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "No momento em que o cliente envia o JSON com os dados da previsão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a FastAPI faz de diferente do Flask no exemplo, graças à classe Cliente(BaseModel)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Valida automaticamente os tipos e campos da requisição antes de chamar a função predict.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treina automaticamente um novo modelo sempre que os campos da classe Cliente mudam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o joblib como forma de salvar e carregar o modelo treinado em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte o modelo scikit-learn num serviço escrito em outra linguagem de programação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No endpoint Flask, dados = request.get_json() devolve um dicionário Python, que depois vira pd.DataFrame([dados]) antes do predict. Por que não passar o dicionário direto pro modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modelo, treinado como Pipeline, espera dado tabular, com colunas, igual ao treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o método predict do scikit-learn só aceita arquivos joblib como argumento de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Flask exige que todo dado recebido em JSON vire DataFrame antes de sair da função.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um dicionário Python não pode ser convertido em JSON na resposta final do endpoint.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe está decidindo entre Flask e FastAPI pra um endpoint que vai receber previsões de várias equipes diferentes, com formatos de entrada que mudam com frequência e erros de digitação nos campos. Qual argumento pesa a favor do FastAPI nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A validação automática via Pydantic barra entradas malformadas antes de chegarem ao modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O FastAPI retreina o modelo automaticamente sempre que percebe um campo de entrada diferente do esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Flask não é capaz de expor rotas do tipo POST, então não serve pra receber dados via JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "O FastAPI elimina totalmente a necessidade de definir quais campos o endpoint espera receber.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint recebe um JSON com um campo faltando (sem 'renda', por exemplo) e o código do exemplo Flask, sem validação extra, tenta montar o DataFrame e chamar predict. O que provavelmente acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Pipeline provavelmente lança um erro, porque falta uma coluna que o modelo espera encontrar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Flask preenche sozinho o campo faltando com o valor médio visto durante o treino do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn ignora a coluna ausente e gera a previsão normalmente, sem efeito no resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O joblib percebe o campo faltando e recarrega uma versão anterior do modelo salva em disco.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Batch x online: duas formas de prever",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Até aqui, a previsão sempre aconteceu do mesmo jeito: um pedido chega, o modelo responde na hora. Essa não é a única forma de servir previsões, e em muitos sistemas de verdade nem é a mais comum. Existe uma segunda maneira, chamada de previsão em lote, ou batch."
                    },
                    {
                        "type": "text",
                        "value": "## Previsão em lote (batch)\n\nEm vez de esperar um pedido por vez, a ideia do batch é processar um monte de registros de uma vez só, geralmente num horário programado, sem ninguém esperando a resposta na hora. Um exemplo clássico: todo dia de madrugada, um job roda o modelo pra base inteira de clientes, calcula uma recomendação pra cada um, e grava o resultado numa tabela. Quando a pessoa abre o app de manhã, a recomendação já está pronta, o app só precisa consultar o que já foi calculado."
                    },
                    {
                        "type": "text",
                        "value": "## Previsão em tempo real (online)\n\nÉ o que os endpoints `/predict` das aulas anteriores fazem: um pedido chega, o modelo responde imediatamente, dentro da mesma chamada. Faz sentido quando existe uma decisão acontecendo naquele instante e ela depende de informação que só existe ali, na hora do pedido, como checar se uma transação parece fraude no momento em que o pagamento é confirmado."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\nimport pandas as pd\n\nmodelo = joblib.load(\"modelo_v1.joblib\")\n\n# lote inteiro de uma vez, não um registro por chamada\nclientes = pd.read_csv(\"clientes_ativos.csv\")\n\nprevisoes = modelo.predict(clientes)\nclientes[\"previsao\"] = previsoes\n\n# resultado fica pronto numa tabela, pra a aplicação só consultar depois\nclientes.to_csv(\"previsoes_do_dia.csv\", index=False)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Batch (lote)\", \"Online (tempo real)\"], [\"Quando roda\", \"Em horário programado (ex.: de madrugada)\", \"A cada pedido, na hora\"], [\"Volume por execução\", \"Muitos registros de uma vez\", \"Um registro (ou poucos) por chamada\"], [\"Latência aceitável\", \"Minutos ou horas\", \"Milissegundos a poucos segundos\"], [\"Exemplo típico\", \"Recomendações calculadas à noite pra todo mundo\", \"Checar fraude no instante da compra\"], [\"Onde o resultado fica\", \"Salvo numa tabela, pronto pra consulta\", \"Devolvido na resposta da própria chamada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada uma\n\nA pergunta que decide é: existe alguém (ou algum sistema) esperando a resposta naquele instante? Se a previsão pode esperar e vale pra um monte de registros de uma vez, batch costuma ser mais simples e mais barato de operar, não precisa de um servidor sempre no ar. Se existe uma decisão em andamento que depende de dado fresco, do próprio pedido que está chegando, só o online resolve. Muitos sistemas reais misturam as duas: a maior parte das previsões roda em lote, e uma API online cobre só os casos que realmente precisam de resposta imediata."
                    },
                    {
                        "type": "quote",
                        "value": "Batch processa muito de uma vez, sem pressa; online responde um pedido por vez, sem demora. A escolha não é sobre qual é melhor, é sobre se existe alguém esperando a resposta na hora."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é um exemplo típico de previsão em lote (batch)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Calcular recomendações de produtos pra todos os clientes de madrugada e salvar numa tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Checar se uma transação é fraude no exato momento em que o pagamento é confirmado pelo cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Responder a uma chamada de API assim que um app externo envia os dados de um único pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar a previsão de um usuário específico enquanto ele preenche um formulário na tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de detecção de fraude precisa decidir, no instante em que o pagamento é confirmado, se bloqueia a transação. Qual abordagem faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Online, porque a decisão exige resposta imediata pra cada transação, não pode esperar um lote.",
                                "isCorrect": true
                            },
                            {
                                "text": "Batch, porque processar transações em conjunto durante a madrugada garante mais precisão na detecção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch, porque fraude é um evento raro, então não compensa manter uma API de previsão no ar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Online, mas só se o volume diário de transações for menor do que o de um sistema em lote.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa gera recomendações de filmes pra todos os usuários uma vez por dia e mostra o resultado pronto quando a pessoa abre o app. Por que batch é uma escolha razoável aqui, em vez de calcular a recomendação online a cada acesso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque não há necessidade de resposta na hora, dá pra calcular pra todo mundo com folga de tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o modelo de recomendação não é capaz de gerar uma previsão só pra um usuário por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque previsões em lote sempre têm mais qualidade do que previsões calculadas em tempo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque calcular em tempo real exigiria treinar o modelo de novo a cada vez que o app abre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa previsão em lote: todo dia de madrugada, roda o modelo pra base inteira de clientes e grava os resultados numa tabela. Isso quer dizer que o modelo está sendo retreinado todo dia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente, batch é sobre quando e em que volume o modelo prevê; retreino é outra decisão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, previsão em lote e retreino do modelo são sempre a mesma rotina, rodando juntos de madrugada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque previsão em lote nunca pode ser combinada com um modelo que já foi treinado antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque model.predict() dispara um novo ciclo de treino sempre que processa muitos registros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um marketplace quer prever, pra cada busca feita por um usuário, quais produtos mostrar primeiro, considerando o que a pessoa já viu nos últimos segundos daquela sessão. Batch ou online é mais adequado, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Online, porque a previsão depende do comportamento da sessão em andamento, que só existe no momento da busca.",
                                "isCorrect": true
                            },
                            {
                                "text": "Batch, porque prever a ordem dos produtos pra cada busca é mais barato feito uma vez por dia pra todos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Online, mas apenas porque marketplaces nunca conseguem programar tarefas em horários fixos de madrugada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch, porque o comportamento recente de uma sessão pode ser resumido no lote da noite seguinte.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O contrato de features: treino x servindo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "O `Pipeline` treinado garante que o preparo dos dados (escala, codificação, tratamento de nulos) aconteça de novo, de forma idêntica, antes de cada previsão. Mas isso só funciona se o dado bruto que chega na hora de prever tiver a mesma cara do dado bruto usado no treino: mesmas colunas, mesmo significado por trás de cada valor, mesma forma de lidar com o que falta. Essa aula fecha o módulo tratando desse combinado, que raramente está escrito em algum lugar, mas que o modelo espera que seja respeitado."
                    },
                    {
                        "type": "text",
                        "value": "## O contrato da previsão\n\nDá pra pensar nisso como um contrato implícito entre quem treinou o modelo e quem chama a API depois: quem chama precisa enviar exatamente os campos que o modelo espera, com o mesmo significado usado no treino. Se `renda` foi renda mensal em reais durante o treino, `renda` precisa continuar sendo renda mensal em reais na hora de prever, não renda anual, não em outra moeda, não um valor já arredondado de um jeito diferente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que precisa bater\", \"No treino\", \"No servindo (produção)\"], [\"Nome e conjunto de colunas\", \"idade, renda, tempo_de_casa\", \"idade, renda, tempo_de_casa\"], [\"Unidade e escala dos valores\", \"renda mensal, em reais\", \"precisa continuar sendo renda mensal, em reais\"], [\"Tratamento de valores ausentes\", \"preenchidos com a mediana do treino\", \"mesma regra aplicada, não pode chegar vazio\"], [\"Codificação de categorias\", \"categorias vistas viram colunas fixas\", \"categoria nova quebra ou precisa de regra própria\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Training-serving skew\n\nO nome pro que acontece quando a entrada em produção diverge do que o modelo viu no treino é training-serving skew. Ele aparece de formas sutis: alguém recalcula uma feature de um jeito manual dentro da API, com uma lógica levemente diferente da usada no treino; um sistema de origem muda a unidade ou o significado de um campo sem avisar ninguém; ou uma feature que existia no treino (calculada com dados que só ficam prontos depois) simplesmente não está disponível no momento real da previsão. O modelo continua rodando sem erro nenhum, e a qualidade da previsão piora de um jeito difícil de perceber de cara."
                    },
                    {
                        "type": "code",
                        "value": "# arriscado: recalcular o preparo na mão, torcendo pra bater com o que o treino fez\nentrada = pd.DataFrame([dados])\nentrada[\"renda_normalizada\"] = (entrada[\"renda\"] - 5000) / 1500  # de onde vieram esses números?\nprevisao = modelo_treinado_sem_pipeline.predict(entrada)\n\n# mais seguro: reusar o mesmo Pipeline (preparo + modelo) salvo com joblib\npipeline = joblib.load(\"modelo_v1.joblib\")\nprevisao = pipeline.predict(pd.DataFrame([dados]))  # o preparo já está embutido no objeto"
                    },
                    {
                        "type": "text",
                        "value": "## Como reduzir o risco\n\nTrês hábitos ajudam bastante. Primeiro, persistir e carregar o `Pipeline` inteiro (aula 1 deste módulo), não só o modelo final, pra o preparo dos dados viajar junto, embutido no mesmo objeto. Segundo, declarar e validar o formato de entrada esperado (o FastAPI, da aula 3, já ajuda aqui: uma classe `BaseModel` documenta e recusa entrada fora do formato). Terceiro, tratar qualquer mudança nas colunas de entrada como uma mudança que quebra contrato, e não como um ajuste pequeno: quem mexe no preparo dos dados do treino precisa avisar quem mantém a API, e vice-versa."
                    },
                    {
                        "type": "quote",
                        "value": "O modelo não erra sozinho: ele erra quando o que chega pra prever para de se parecer com o que ele viu no treino. Persistir o Pipeline inteiro e manter o formato de entrada estável é o que segura esse contrato de pé."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que as features enviadas pra previsão em produção precisam seguir o mesmo contrato do treino?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As colunas, unidades e formato dos dados de entrada devem ser iguais aos usados no treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "O código da API precisa ser escrito na mesma linguagem de programação usada durante o treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor que hospeda a API precisa rodar o mesmo sistema operacional da máquina de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo joblib precisa ter o mesmo tamanho em disco do notebook onde o modelo foi treinado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Meses depois do deploy, alguém percebeu que o campo renda que a API recebe passou a vir em dólares, porque o time que integrou o app mudou a fonte de dados sem avisar. O modelo continua prevendo, só que pior. O que é isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um caso de training-serving skew: a entrada em produção não bate mais com o formato do treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um caso de concept drift: a relação entre renda e o alvo mudou de verdade ao longo do tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um bug de infraestrutura no Docker, sem relação com o formato dos dados recebidos pela API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema no arquivo joblib, que corrompeu os coeficientes do modelo depois de meses no ar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que salvar e carregar o Pipeline inteiro (não só o modelo final) ajuda a cumprir o contrato de features entre treino e servindo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o preparo dos dados fica embutido no mesmo objeto, sem precisar ser reescrito à mão na API.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um Pipeline salvo ocupa menos espaço em disco do que salvar cada etapa de preparo separada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o joblib só consegue salvar objetos do tipo Pipeline, nunca um estimador sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um Pipeline inteiro elimina a necessidade de validar os dados recebidos na requisição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma feature usada no treino (valor total gasto nos últimos 30 dias, por exemplo) foi calculada a partir de um relatório fechado no fim do mês. Na API de produção, esse número não está disponível no momento da previsão, só uma estimativa parcial do dia. Qual é o risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo aprendeu com uma informação mais completa do que a disponível ao prever, um contrato quebrado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco real, porque toda feature numérica pode ser trocada por outra sem afetar o resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é puramente de desempenho da API, sem relação com a qualidade da previsão devolvida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse é um caso de concept drift, porque a relação entre a feature e o alvo mudou com o tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe de dados retreina o modelo usando um novo pipeline de preparo, mas esquece de avisar a equipe que mantém a API em produção sobre uma coluna que mudou de nome. Qual é a consequência mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A API provavelmente falha ou erra a previsão, porque o Pipeline não encontra a coluna no formato esperado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma, porque o joblib ajusta sozinho nomes de colunas antigos pros nomes da nova versão do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "O FastAPI corrige automaticamente qualquer divergência de nome de coluna antes de chamar o predict.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo passa a ignorar a coluna renomeada e usa só as demais colunas restantes pra prever.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Empacotar e implantar",
        "aulas": [
            {
                "titulo": "Reprodutibilidade do ambiente",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Empacotar e implantar\n\nLembra daquele modelo que você salvou com `joblib` e serviu numa API simples com Flask ou FastAPI, no módulo anterior? Ele funciona perfeitamente na sua máquina. O problema é que \"funciona na minha máquina\" é uma das frases mais perigosas em produção, e ela não poupa modelos de machine learning.\n\nNeste módulo você fecha essa distância: fixa o ambiente pra ele ser reproduzível, empacota o modelo e a API num container, e decide onde esse container roda em produção. No fim, o modelo deixa de ser um arquivo que você roda na hora e passa a ser um serviço no ar."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso também acontece com modelos\n\nCom código comum, \"na minha máquina funciona\" já é um problema conhecido: uma biblioteca numa versão diferente, um sistema operacional diferente, uma variável de ambiente que só existe no seu notebook. Com modelos de machine learning o problema fica pior, porque o modelo treinado carrega uma dependência extra e invisível: a versão exata das bibliotecas usadas no treino.\n\nUm objeto salvo com `joblib.dump()` não guarda só os coeficientes ou os pesos. Ele guarda a estrutura interna dos objetos do scikit-learn (ou de outra biblioteca) daquela versão específica. Carregar esse arquivo com uma versão diferente do scikit-learn pode gerar um aviso, mudar sutilmente o resultado de `predict()`, ou simplesmente quebrar com um erro de desserialização. E o pior cenário é o silencioso: o modelo carrega, prevê, e entrega um número levemente diferente do que entregava no treino, sem avisar nada."
                    },
                    {
                        "type": "text",
                        "value": "## Fixar as versões das bibliotecas\n\nA solução é declarar exatamente quais bibliotecas o projeto usa, e em qual versão, num arquivo `requirements.txt`. Em vez de \"eu tenho scikit-learn instalado\", o projeto passa a dizer \"este projeto precisa do scikit-learn 1.3.2, nem uma versão a mais nem a menos\". Qualquer máquina, seja um servidor, um container ou o notebook de outro colega, instala exatamente o que foi usado no treino."
                    },
                    {
                        "type": "code",
                        "value": "# requirements.txt\n# gerado a partir do ambiente que treinou o modelo, com:\n#   pip freeze > requirements.txt\n# e depois limpo pra manter só o que o projeto realmente usa\n\nscikit-learn==1.3.2\npandas==2.1.1\nnumpy==1.26.0\njoblib==1.3.2\nflask==3.0.0\n\n# instalar exatamente essas versoes em outra maquina:\n# pip install -r requirements.txt"
                    },
                    {
                        "type": "text",
                        "value": "## E a versão do Python também\n\nFixar as bibliotecas não basta se o interpretador Python for outro. Uma mesma biblioteca pode se comportar de um jeito no Python 3.9 e de outro no Python 3.11, e algumas versões de biblioteca nem instalam em versões antigas do Python. Retome o ambiente virtual (`venv`) que você já usa: ele isola as bibliotecas do projeto, mas por padrão usa o Python que já está instalado na máquina. Vale documentar, junto do `requirements.txt`, qual versão do Python o projeto espera. Na aula 3 você vai ver essa versão fixada de vez, dentro da própria imagem Docker."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sintoma\",\"Causa mais provável\"],[\"ImportError ao carregar o modelo salvo\",\"A biblioteca usada no treino não está instalada no ambiente novo\"],[\"Aviso de versão incompatível do scikit-learn ao dar load\",\"O ambiente novo tem uma versão diferente da que treinou o modelo\"],[\"Mesmo input, previsão ligeiramente diferente\",\"Versão diferente de numpy ou scipy, que muda o arredondamento interno\"],[\"Roda liso local, quebra assim que sobe pro servidor\",\"O ambiente do servidor nunca foi de fato igual ao da máquina de treino\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Reprodutibilidade não é sobre o código rodar bonito no seu notebook. É sobre o mesmo código, com as mesmas versões, entregar o mesmo resultado em qualquer máquina, hoje ou daqui a seis meses."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o arquivo requirements.txt declara num projeto Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As bibliotecas do projeto e a versão exata que cada uma deve ter, pra reproduzir o ambiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os hiperparâmetros do modelo e o valor escolhido pra cada um deles depois do ajuste fino.",
                                "isCorrect": false
                            },
                            {
                                "text": "As rotas da API e o método HTTP que cada endpoint de previsão aceita receber.",
                                "isCorrect": false
                            },
                            {
                                "text": "As colunas do conjunto de dados e o tipo que cada uma deve assumir no treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que carregar um modelo salvo com joblib numa versão diferente do scikit-learn é arriscado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o objeto guarda a estrutura interna daquela versão, e a diferença pode mudar o resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o joblib apaga o arquivo automaticamente quando detecta qualquer versão diferente instalada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda versão nova do scikit-learn exige treinar o modelo de novo antes de qualquer uso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Python bloqueia o carregamento de arquivos criados por uma versão anterior da biblioteca.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API prevê valores diferentes pro mesmo input, dependendo de qual servidor a atende, mesmo usando o mesmo modelo.joblib e o mesmo código. O que mais provavelmente explica isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os servidores têm versões diferentes de bibliotecas como numpy, que mudam o arredondamento interno.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo foi salvo errado, e o joblib está gerando um arquivo corrompido a cada novo treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API está sem cache, e por isso recalcula os coeficientes do modelo a cada pedido recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O balanceador de carga está enviando pedidos duplicados, o que altera o resultado apresentado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto fixa as bibliotecas no requirements.txt, mas não documenta a versão do Python usada no treino. Por que isso ainda é um risco pra reprodutibilidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque uma biblioteca pode se comportar de forma diferente, ou nem instalar, entre versões do Python.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o requirements.txt só funciona quando gerado na mesma hora em que o modelo termina de treinar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o pip apaga bibliotecas já instaladas sempre que encontra uma versão do Python não declarada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o joblib grava a versão do Python dentro do arquivo e recusa versões diferentes ao carregar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo representa melhor uma reprodutibilidade de ambiente bem feita, indo além de só instalar as bibliotecas certas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fixar biblioteca, versão e interpretador Python juntos, documentando tudo o que o treino realmente usou.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fixar só a versão das bibliotecas mais pesadas, já que bibliotecas menores raramente causam incompatibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fixar a versão do sistema operacional do notebook, já que o Python se comporta igual em qualquer biblioteca.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fixar o hardware usado no treino, já que CPUs diferentes impedem o carregamento de um modelo salvo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Docker pro modelo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que só fixar versões não basta\n\nO `requirements.txt` resolve as bibliotecas Python, mas o ambiente de produção tem mais camadas do que isso: a versão do sistema operacional, bibliotecas de sistema que o scikit-learn ou o numpy usam por baixo dos panos (bibliotecas de álgebra linear compiladas, por exemplo), e até a arquitetura do processador. Duas máquinas com o mesmo `requirements.txt` ainda podem se comportar de um jeito diferente se o resto do sistema for diferente."
                    },
                    {
                        "type": "text",
                        "value": "## Retomando containers\n\nSe você já passou pelo mundo de back-end, container não é novidade: é uma forma de empacotar uma aplicação junto com tudo que ela precisa pra rodar (bibliotecas, dependências de sistema, configuração), isolada do resto da máquina. O container roda igual num notebook, num servidor de teste ou numa VPS de produção, porque ele carrega o próprio ambiente dentro dele, em vez de depender do que já está instalado na máquina hospedeira.\n\nPra um modelo de machine learning isso resolve exatamente o problema da aula anterior: em vez de esperar que o servidor tenha a versão certa de tudo, você empacota a versão certa de tudo dentro do container."
                    },
                    {
                        "type": "text",
                        "value": "## Uma imagem com o modelo dentro\n\nO container nasce de uma imagem: um molde com tudo já preparado (sistema, bibliotecas, código). Pra servir um modelo, a imagem carrega três coisas juntas: o código da API construída no módulo anterior (o endpoint que recebe as features e chama `model.predict()`), as bibliotecas do `requirements.txt`, e o arquivo do modelo treinado que o `joblib` salvou. Tudo isso vira uma unidade só, versionada e portátil.\n\nIsso muda a pergunta de \"essa máquina tem tudo que o modelo precisa?\" pra \"essa máquina tem o Docker instalado?\". A segunda pergunta é bem mais fácil de responder sim."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada do ambiente\",\"Resolvida pelo venv\",\"Resolvida pelo Docker\"],[\"Versão das bibliotecas Python\",\"Sim\",\"Sim\"],[\"Versão do Python\",\"Parcialmente (depende da máquina)\",\"Sim\"],[\"Bibliotecas e configuração do sistema operacional\",\"Não\",\"Sim\"],[\"Portar pra outro servidor sem reinstalar nada\",\"Não\",\"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Imagem e container não são a mesma coisa\n\nVale reforçar a diferença, porque ela aparece o tempo todo: a imagem é o molde parado, construído uma vez (com o `docker build`, que você vê na próxima aula); o container é a imagem em execução. Da mesma imagem do modelo dá pra subir vários containers rodando ao mesmo tempo, cada um servindo previsões de forma independente, o que ajuda inclusive a escalar quando o volume de pedidos cresce."
                    },
                    {
                        "type": "quote",
                        "value": "Docker não elimina a complexidade do ambiente, só a empacota de um jeito que você move inteira, de uma vez, pra qualquer lugar que rode um container."
                    }
                ],
                "questions": [
                    {
                        "statement": "No contexto de Docker, qual a diferença entre imagem e container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A imagem é o molde construído uma vez; o container é essa imagem em execução, podendo haver vários.",
                                "isCorrect": true
                            },
                            {
                                "text": "A imagem roda o modelo em produção; o container guarda só as bibliotecas usadas durante o treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem existe apenas em produção; o container é usado somente durante o desenvolvimento local.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem contém o código da API; o container contém apenas o arquivo salvo pelo joblib.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que empacotar o modelo num container Docker resolve um problema que o requirements.txt sozinho não resolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o container também isola bibliotecas e configurações do sistema operacional, não só as Python.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o container treina o modelo automaticamente, sem precisar rodar o script de treino de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o container substitui por completo a necessidade de validar o modelo antes de publicá-lo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o container converte o modelo pra um formato mais rápido de carregar do que o do joblib.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe treinou um modelo numa máquina com uma versão específica de biblioteca de álgebra linear do sistema. O requirements.txt está correto, mas o modelo se comporta diferente no servidor de produção. O que provavelmente falta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Empacotar também as dependências de sistema operacional, não só as bibliotecas Python, num container.",
                                "isCorrect": true
                            },
                            {
                                "text": "Retreinar o modelo direto no servidor de produção, com os dados que ele vai receber após o deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o algoritmo de machine learning por um que não dependa de bibliotecas de álgebra linear.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de instâncias do servidor pra distribuir melhor as previsões entre elas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A mesma imagem Docker de um modelo é usada pra subir três containers ao mesmo tempo, todos atendendo pedidos de previsão. O que essa situação representa corretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Três execuções independentes da mesma imagem, cada uma servindo previsões sem depender das outras.",
                                "isCorrect": true
                            },
                            {
                                "text": "Três versões diferentes do modelo, cada uma treinada com um recorte diferente dos dados originais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de configuração, já que uma imagem só pode gerar um container em execução por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Três ambientes de teste separados, nenhum deles pronto ainda pra receber tráfego real de produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que idealmente vai dentro da imagem Docker de um modelo em produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O código da API, as bibliotecas do requirements.txt e o arquivo do modelo salvo pelo joblib.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só o arquivo do modelo salvo pelo joblib, já que o resto do ambiente vem do servidor de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O notebook de treino original, pra permitir retreinar o modelo direto de dentro do container.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados usados no treino, pra revalidar as previsões do modelo a cada novo pedido recebido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um Dockerfile de modelo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A receita que gera a imagem\n\nO Dockerfile é o arquivo de texto que descreve, passo a passo, como construir a imagem: qual sistema usar de base, o que copiar pra dentro, o que instalar, e o que rodar quando o container subir. Ele é a receita; a imagem é o prato pronto. Pra um modelo, essa receita é curta: partir de uma imagem com Python já instalado, copiar o código e o modelo, instalar o `requirements.txt`, e apontar qual comando sobe a API."
                    },
                    {
                        "type": "code",
                        "value": "# Dockerfile\n\nFROM python:3.11-slim\n\nWORKDIR /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY app.py .\nCOPY modelo.joblib .\n\nEXPOSE 8000\n\nCMD [\"python\", \"app.py\"]"
                    },
                    {
                        "type": "text",
                        "value": "## Linha por linha\n\n`FROM python:3.11-slim` parte de uma imagem oficial já com o Python 3.11 instalado (a variante slim é mais enxuta, com só o essencial do sistema). `WORKDIR /app` define a pasta de trabalho dentro do container. As linhas de `COPY` e o `RUN pip install` trazem o `requirements.txt` pra dentro da imagem e instalam as bibliotecas antes de copiar o código, pra aproveitar cache do Docker em builds futuros. Depois, `COPY app.py .` e `COPY modelo.joblib .` trazem o código da API e o modelo salvo com `joblib` no módulo anterior. `EXPOSE 8000` documenta a porta que a API usa, e `CMD` é o comando executado quando o container inicia."
                    },
                    {
                        "type": "text",
                        "value": "## Construir e rodar\n\nCom o Dockerfile pronto, dois comandos bastam. O primeiro constrói a imagem a partir da receita; o segundo sobe um container a partir dela, publicando a porta pra fora."
                    },
                    {
                        "type": "code",
                        "value": "# construir a imagem, com uma tag pra identificar a versao\ndocker build -t modelo-previsao:1.0 .\n\n# rodar um container a partir da imagem, publicando a porta 8000\ndocker run -p 8000:8000 modelo-previsao:1.0\n\n# testar o endpoint de previsao do container rodando\ncurl -X POST http://localhost:8000/prever -H \"Content-Type: application/json\" -d '{\"features\": [5.1, 3.5, 1.4, 0.2]}'"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado com o tamanho da imagem\n\nImagens de modelo tendem a crescer: bibliotecas como scikit-learn, pandas e numpy já pesam sozinhas, e é fácil copiar arquivo demais pra dentro do container (o notebook de treino, os dados brutos e o histórico de experimentos não precisam ir junto). Usar uma imagem base enxuta como a slim, copiar só o que a API precisa pra rodar, e manter um arquivo `.dockerignore` (o equivalente do `.gitignore` pro build) ajuda a manter a imagem menor e o build mais rápido."
                    },
                    {
                        "type": "quote",
                        "value": "Um Dockerfile de modelo não precisa ser sofisticado. Precisa ser correto: a mesma imagem que roda no seu notebook tem que ser a mesma que sobe em produção."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Dockerfile, qual instrução é responsável por trazer um arquivo do projeto pra dentro da imagem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "COPY, que traz um arquivo do computador local pra dentro da imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "RUN, que executa um comando durante a construção da imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "FROM, que define a imagem base usada como ponto de partida.",
                                "isCorrect": false
                            },
                            {
                                "text": "CMD, que define o comando executado quando o container inicia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido copiar o requirements.txt e instalar as bibliotecas antes de copiar o código da API, no Dockerfile?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Docker reaproveita camadas já construídas, e o código costuma mudar mais que as bibliotecas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker exige que todo arquivo de texto seja copiado antes de qualquer arquivo binário do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque instalar as bibliotecas depois do código faz o container ocupar mais espaço em disco no fim.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o pip só encontra o requirements.txt se ele for o primeiro arquivo copiado pra imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um docker build sem erros, o comando docker run -p 8000:8000 minha-imagem sobe, mas o endpoint não responde em localhost:8000. O Dockerfile tem EXPOSE 8000 e a API sobe na porta 8000 dentro do container. O que mais provavelmente está errado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A porta não foi publicada corretamente no comando, ou a API não subiu de fato dentro do container.",
                                "isCorrect": true
                            },
                            {
                                "text": "O EXPOSE 8000 do Dockerfile está sobrescrevendo a porta real usada pela API dentro do container.",
                                "isCorrect": false
                            },
                            {
                                "text": "Imagens Docker não conseguem expor portas pra fora, só permitem acesso de dentro do container.",
                                "isCorrect": false
                            },
                            {
                                "text": "O docker build precisa ser executado de novo depois do docker run pra liberar a porta escolhida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a função de usar python:3.11-slim como imagem base num Dockerfile de modelo, em vez de instalar o Python do zero?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fornece um sistema já com o Python 3.11 pronto, numa variante mais enxuta que a imagem completa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fornece o scikit-learn e o pandas já instalados, dispensando a instalação via requirements.txt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fornece uma versão do Python otimizada especificamente pra rodar modelos de machine learning.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fornece o próprio Docker instalado dentro da imagem, permitindo containers dentro de containers.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num Dockerfile de modelo, o que idealmente não deveria ser copiado pra dentro da imagem final?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O notebook de treino e os dados brutos do experimento, que a API não usa em produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo do modelo salvo pelo joblib, já que ele pode ser montado depois via volume externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O requirements.txt, porque instalar bibliotecas direto no Dockerfile substitui esse arquivo por completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código da API, porque o ideal é montá-lo como volume externo em qualquer ambiente de produção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Onde o serviço roda: VPS, nuvem ou serverless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A imagem pronta, e agora\n\nCom a imagem do modelo construída, falta decidir onde ela roda de verdade, o lugar que vai receber pedidos de previsão o tempo todo. Não existe uma resposta única: a escolha depende do volume de pedidos, do quanto a equipe quer (ou consegue) administrar servidor, e do orçamento disponível. Três caminhos comuns: uma VPS, um serviço gerenciado de nuvem, ou uma função serverless."
                    },
                    {
                        "type": "text",
                        "value": "## Uma VPS com o container\n\nA VPS (servidor virtual privado) é o caminho mais parecido com o que você já viu no mundo de back-end: uma máquina alugada, sempre ligada, onde você instala o Docker e roda o container do modelo, do mesmo jeito que rodaria a API de qualquer outra aplicação. Você controla tudo (o sistema, a versão do Docker, a configuração de rede), e também é responsável por tudo isso: atualizar o sistema, reiniciar o serviço se cair, e redimensionar a máquina se o tráfego crescer."
                    },
                    {
                        "type": "text",
                        "value": "## Um serviço gerenciado de nuvem\n\nProvedores de nuvem oferecem serviços pensados pra rodar modelos sem administrar servidor diretamente: o SageMaker (AWS), o Vertex AI (Google Cloud) e o Azure Machine Learning são exemplos, cada um com seu jeito de receber a imagem do modelo, subir o serviço e cuidar de escalar conforme o tráfego. A plataforma cuida de boa parte da infraestrutura; em troca, o time abre mão de parte do controle e costuma pagar mais por pedido do que numa VPS pura."
                    },
                    {
                        "type": "text",
                        "value": "## Serverless: uma função sob demanda\n\nNo modelo serverless (o AWS Lambda, o Google Cloud Functions e o Azure Functions são exemplos), o código sobe como uma função que só roda quando chega um pedido, e o provedor liga e desliga os recursos automaticamente. Pra um modelo, isso significa pagar só pelas previsões realmente feitas, sem manter nada ligado o tempo todo esperando tráfego. A troca vem no tempo de resposta do primeiro pedido depois de um período parado (o chamado \"cold start\"), e em limites de tamanho que podem esbarrar em modelos grandes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Onde rodar\",\"Controle da equipe\",\"Esforço de administrar\",\"Custo típico\"],[\"VPS com o container\",\"Alto\",\"Alto: a equipe cuida do servidor\",\"Previsível, fixo por mês\"],[\"Serviço gerenciado de nuvem\",\"Médio\",\"Médio: a nuvem cuida da infraestrutura\",\"Variável, por uso e recurso\"],[\"Serverless (função sob demanda)\",\"Baixo\",\"Baixo: a nuvem cuida de tudo\",\"Variável, por chamada feita\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Não existe escolha errada, só descuidada\n\nA VPS custa mais atenção operacional, mas dá previsibilidade de custo e controle total sobre a imagem que está rodando. O serviço gerenciado tira parte do trabalho operacional, ao custo de aprender a ferramenta específica do provedor escolhido. O serverless é econômico pra tráfego baixo ou irregular, mas cobra caro em latência quando o modelo precisa responder rápido o tempo todo. Escolher onde rodar é decisão de arquitetura, não só de infraestrutura, e vale revisitar conforme o produto cresce."
                    },
                    {
                        "type": "quote",
                        "value": "Não existe lugar certo pra rodar um modelo em produção, existe o lugar certo pro seu volume de tráfego, seu orçamento e o tamanho do time que vai cuidar disso."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma opção serverless pra rodar um modelo em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O código roda como função sob demanda, e o provedor liga e desliga os recursos conforme o tráfego.",
                                "isCorrect": true
                            },
                            {
                                "text": "O código roda numa máquina virtual alugada, sempre ligada, administrada inteiramente pela equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código roda dentro de um serviço de nuvem que retreina o modelo a cada pedido recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código roda só localmente, na máquina do cientista de dados, sem nunca subir pra produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença de responsabilidade entre rodar o modelo numa VPS e rodar num serviço gerenciado de nuvem, como o SageMaker ou o Vertex AI?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na VPS a equipe administra o servidor inteiro; no serviço gerenciado, a nuvem cuida da infraestrutura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na VPS o modelo sempre roda mais rápido; no serviço gerenciado a previsão sempre demora mais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na VPS não é possível usar Docker; o serviço gerenciado exige que o modelo esteja containerizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na VPS o custo é sempre por chamada feita; no serviço gerenciado o custo é sempre fixo por mês.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo recebe poucos pedidos de previsão por dia, de forma irregular, e o time não quer manter um servidor ligado o tempo todo só esperando tráfego. Qual opção tende a se encaixar melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Serverless, já que o custo acompanha as chamadas realmente feitas, sem recurso ocioso o tempo todo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma VPS robusta, porque tráfego irregular exige capacidade sempre disponível pra qualquer pico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço gerenciado de nuvem, porque ele elimina por completo o tempo de resposta da primeira chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o modelo direto no notebook de treino, já que produção só compensa com tráfego alto e constante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo em produção precisa responder toda chamada em poucos milissegundos, o tempo todo, com tráfego alto e constante. Por que serverless tende a ser uma escolha arriscada nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o cold start após períodos ociosos pode somar latência justo quando a resposta rápida mais importa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque funções serverless não conseguem, sob nenhuma configuração, carregar um modelo salvo com joblib.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque provedores de nuvem não permitem publicar modelos de machine learning em ambiente serverless.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque tráfego alto e constante torna o custo de uma VPS sempre mais caro que o de um serverless.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem histórico de administrar servidor, quer rodar um modelo em produção com o menor esforço operacional possível, mesmo pagando um pouco mais por isso. Qual caminho tende a fazer mais sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um serviço gerenciado de nuvem, trocando parte do controle por menos trabalho de infraestrutura diário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma VPS configurada manualmente, já que o controle total compensa o esforço extra de administração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o container localmente na máquina de um integrante do time, publicando a porta pra internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiar a decisão de infraestrutura até o time crescer o suficiente pra assumir a administração completa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O deploy: o modelo como serviço",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do notebook a um serviço no ar\n\nEntregar um notebook é entregar uma análise: alguém abre o arquivo, roda as células, olha o resultado. Entregar um serviço é diferente: o modelo fica no ar, respondendo pedidos de quem (ou do que) precisar de uma previsão, sem que ninguém precise abrir nada. É essa transformação que o deploy faz."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda quando o modelo vira um serviço\n\nDepois do deploy, o modelo deixa de ser um artefato que alguém roda manualmente e passa a ser um serviço que outras aplicações chamam sozinhas: o sistema de checkout de um site chamando o modelo de risco de fraude a cada compra, o aplicativo de recomendação chamando o modelo a cada usuário que abre a tela inicial. Ninguém do outro lado sabe (nem precisa saber) que ali dentro tem scikit-learn, joblib e um Dockerfile. Só importa que o endpoint responde, rápido e correto, sempre que é chamado."
                    },
                    {
                        "type": "text",
                        "value": "## Juntando as peças do módulo\n\nO caminho até aqui uniu tudo que passou pelas aulas anteriores: o modelo salvo com `joblib` e servido por uma API (retomado do módulo anterior), o ambiente fixado num `requirements.txt`, tudo empacotado numa imagem Docker com um Dockerfile simples, e essa imagem rodando nalgum lugar decidido com critério (VPS, nuvem gerenciada ou serverless). O deploy é a soma dessas peças em produção, não uma etapa isolada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Notebook entregue\",\"Serviço no ar\"],[\"Quem aciona\",\"Uma pessoa, manualmente\",\"Outra aplicação, automaticamente\"],[\"Frequência\",\"Sob demanda de quem abre o arquivo\",\"Contínua, a qualquer hora do dia\"],[\"Ambiente\",\"A máquina de quem abriu o notebook\",\"Fixado e reproduzível, em container\"],[\"Se falhar\",\"Só quem rodou o notebook percebe\",\"Usuários reais sentem o impacto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Deploy não é um botão\n\nVale ser honesto: nada disso é tão simples quanto parece no resumo. Fixar versão, escrever Dockerfile, escolher onde rodar e efetivamente subir o serviço envolve escolhas, testes e ajustes reais, e problemas aparecem (imagem que não builda, porta que não abre, variável de ambiente que falta) com uma frequência normal pra quem está aprendendo. MLOps existe justamente porque colocar um modelo em produção é trabalho de engenharia, não um passo a mais depois do treino."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem depois do ar\n\nColocar o serviço no ar não é o fim da história, é o começo de uma nova fase: um modelo em produção começa a envelhecer desde o primeiro dia, porque o mundo ao redor dele continua mudando. O próximo módulo entra exatamente nesse ponto: como perceber que o modelo está piorando, mesmo sem ninguém ter mudado uma linha de código."
                    },
                    {
                        "type": "quote",
                        "value": "Um notebook mostra que o modelo funciona. Um serviço no ar é o modelo funcionando, de verdade, pra alguém que precisa da resposta agora."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a principal diferença entre entregar um notebook e entregar um modelo como serviço em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O serviço responde outras aplicações sozinho; o notebook depende de alguém rodar manualmente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O notebook usa Python; o serviço em produção precisa ser reescrito inteiro em outra linguagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O serviço em produção não guarda o modelo treinado; o notebook é o único lugar onde ele existe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O notebook não pode usar joblib; o serviço em produção exige outro formato de salvar o modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois do deploy, o que passa a chamar o endpoint de previsão do modelo, no dia a dia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Outras aplicações, como o sistema de compras ou o app de recomendação, de forma automática.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só a equipe de ciência de dados, validando manualmente cada previsão antes de qualquer uso real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o próprio Dockerfile, que reexecuta a previsão em intervalos fixos definidos durante o build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o serviço de monitoramento, que testa o modelo periodicamente sem repassar o resultado a mais ninguém.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time terminou de treinar um modelo com boa métrica no notebook e considera o trabalho encerrado, sem colocar nada no ar. O que ainda falta pra esse modelo gerar valor real em produção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Empacotar, decidir onde rodar e efetivamente publicar o modelo como serviço que outras aplicações chamem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada além disso: uma boa métrica no notebook já garante que o modelo está pronto pra qualquer uso real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas treinar o modelo de novo com mais dados, já que métrica boa no notebook implica deploy automático.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de features usadas, porque modelos com muitas variáveis não podem virar serviço.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que afirmar que \"MLOps é simples, basta empacotar e subir\" seria enganoso, mesmo depois de dominar Docker e a escolha de onde rodar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque fixar ambiente, empacotar corretamente e operar o serviço no ar envolvem escolhas e problemas reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque nenhum modelo de machine learning consegue, de fato, ser servido por uma API em produção real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Docker foi descontinuado pra cargas de machine learning e substituído inteiramente por serverless.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque empacotar um modelo sempre exige reescrever o treino inteiro numa linguagem diferente do Python.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Juntando as peças deste módulo, qual sequência descreve melhor o caminho do modelo treinado até virar um serviço no ar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fixar o ambiente, empacotar modelo e API numa imagem, escolher onde rodar, e publicar o container.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar o modelo de novo dentro do container, publicar a imagem, e só depois escrever a API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher onde rodar antes de treinar o modelo, pra já ajustar os hiperparâmetros ao ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar o notebook direto num serviço de nuvem, que converte as células automaticamente numa API.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Monitorar o modelo em produção",
        "aulas": [
            {
                "titulo": "Por que o modelo se degrada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que o modelo se degrada\n\nVocê treinou o modelo, validou as métricas, empacotou tudo com Docker (como vimos no módulo anterior) e colocou no ar atrás de uma API. No primeiro mês ele funciona bem. Seis meses depois, sem que ninguém tenha tocado numa linha de código, a acurácia despencou. O que aconteceu?\n\nIsso é o que chamamos de **degradação do modelo**, e é um dos fatos mais importantes que um cientista de dados precisa aceitar: nenhum modelo em produção fica bom para sempre."
                    },
                    {
                        "type": "text",
                        "value": "## Um modelo é um retrato do passado\n\nQuando você treina um modelo, ele aprende padrões a partir de um conjunto de dados coletado num período específico. O modelo não entende o mundo, ele memoriza relações estatísticas que existiam naqueles dados, naquele momento.\n\nO problema é que o mundo real não é estático. Clientes mudam de comportamento, o mercado muda, categorias novas de produto aparecem, hábitos de consumo mudam depois de um evento inesperado. O modelo, porém, continua com o retrato antigo. Ele aplica as regras aprendidas no passado a um presente que já é outro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Momento do treino\", \"Meses depois, em produção\"], [\"Perfil dos clientes refletia a base daquela época\", \"A base de clientes cresceu ou mudou de perfil\"], [\"Preços e catálogo eram os daquele momento\", \"Preços reajustados, produtos novos, produtos descontinuados\"], [\"Padrão de fraude conhecido até a data do treino\", \"Fraudadores adaptaram a estratégia\"], [\"Cenário econômico e sazonalidade daquele recorte\", \"Novo cenário econômico, nova sazonalidade\"], [\"Código do modelo: versão 1.0\", \"Código do modelo: a mesma versão 1.0, sem nenhuma mudança\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Exemplos concretos\n\n- Um modelo de recomendação treinado antes de uma mudança no catálogo passa a sugerir itens que saíram de linha e ignora lançamentos que nunca viu no treino.\n- Um modelo de crédito treinado num cenário de juros baixos avalia mal o risco quando a taxa de juros sobe e o comportamento de pagamento dos clientes muda junto.\n- Um modelo de detecção de fraude aprende os padrões dos golpes conhecidos até a data do treino. Fraudadores testam abordagens novas o tempo todo, então o padrão que o modelo decorou fica desatualizado.\n\nEm nenhum desses casos alguém mexeu no `model.pkl` ou na API. O modelo continua exatamente igual. O que mudou foi o mundo ao redor dele."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nfrom sklearn.metrics import accuracy_score\n\n# logs_producao.csv guarda a previsao, o rotulo real (quando chega) e a data\nlogs = pd.read_csv(\"logs_producao.csv\", parse_dates=[\"data\"])\n\n# agrupa por mes e calcula a acuracia em cada janela de tempo\nlogs[\"mes\"] = logs[\"data\"].dt.to_period(\"M\")\n\nfor mes, grupo in logs.groupby(\"mes\"):\n    acc = accuracy_score(grupo[\"rotulo_real\"], grupo[\"previsao\"])\n    print(f\"{mes}: acuracia = {acc:.3f}\")\n\n# uma acuracia caindo mes a mes, sem nenhum deploy novo no meio,\n# e o sinal mais direto de que o modelo esta degradando"
                    },
                    {
                        "type": "text",
                        "value": "## Duas causas, dois nomes\n\nA degradação não acontece por um motivo só, e vale separar as causas porque elas pedem diagnósticos diferentes:\n\n- Quando a **distribuição dos dados de entrada** muda, isso se chama **data drift**.\n- Quando a **relação entre entrada e alvo** muda, isso se chama **concept drift**.\n\nNas próximas duas aulas a gente destrincha cada um, com exemplos e formas de detectar."
                    },
                    {
                        "type": "quote",
                        "value": "O código do modelo não envelhece. Os dados que ele vê todo dia, sim. Monitorar é aceitar que o trabalho não termina no deploy."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um modelo de machine learning foi colocado em produção e, seis meses depois, sem nenhuma alteração de código, a acurácia caiu bastante. O que isso mostra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O modelo se degrada com o tempo porque os dados do mundo real mudam",
                                "isCorrect": true
                            },
                            {
                                "text": "A equipe esqueceu de atualizar a versão do Python usada no treino",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor onde a API roda perdeu capacidade de processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo do modelo salvo com joblib corrompeu com o tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dizemos que um modelo treinado é 'um retrato do passado'. O que essa ideia quer dizer, na prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele aprendeu padrões estatísticos de um recorte de dados de um período",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele guarda uma cópia integral dos dados de treino dentro do arquivo salvo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele perde precisão porque o hardware do servidor se desgasta com o tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele tira uma fotografia dos dados assim que a API recebe cada requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fintech treinou um modelo de aprovação de crédito em 2023, num cenário de juros baixos. Em 2026, sem nenhuma mudança no código do modelo, a taxa de inadimplência entre os aprovados subiu bastante. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O comportamento de pagamento dos clientes mudou junto com o cenário econômico",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo sofreu um bug interno depois que o Python foi atualizado no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe esqueceu de validar as métricas de acurácia antes do primeiro deploy",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de treino de 2023 tinha registros duplicados nunca identificados pela equipe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo resume corretamente por que um modelo perde desempenho mesmo sem nenhuma mudança de código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os dados de entrada mudam com o tempo, mas o modelo aplica regras antigas",
                                "isCorrect": true
                            },
                            {
                                "text": "A infraestrutura de nuvem perde desempenho gradualmente conforme o tempo de uso passa",
                                "isCorrect": false
                            },
                            {
                                "text": "O framework de machine learning fica desatualizado e passa a gerar previsões erradas",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de requisições por segundo cresce além do que a API suporta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No dia seguinte a um novo deploy do modelo, a taxa de erro da API disparou de imediato. Isso é um caso típico de degradação por drift?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, drift costuma ser gradual, um erro logo após o deploy aponta pra um bug",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, qualquer queda de desempenho após um deploy é sempre um caso de drift",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, drift acontece sempre que o modelo é atualizado com uma nova versão",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, isso significa que o modelo nunca teve desempenho bom em nenhum momento",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data drift",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Vamos começar pelo tipo de degradação mais fácil de enxergar: o **data drift** (deriva de dados). Ele acontece quando a distribuição das features de entrada, os dados que o modelo recebe para prever, muda em relação ao que foi visto no treino."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda\n\nPense num modelo de aprovação de crédito treinado com uma base de clientes cuja idade média era 35 anos, a maioria com renda entre R$ 2 mil e R$ 5 mil, concentrados em grandes capitais. Um ano depois, a empresa expandiu pro interior e passou a atrair um público mais jovem, com renda mais variada. As **regras que o modelo aprendeu** continuam as mesmas, mas o **perfil de quem ele está avaliando hoje** é diferente do perfil que ele viu no treino. Isso é data drift.\n\nRepare: ninguém mudou o que significa 'bom pagador'. A relação entre as features e o risco de crédito (o que o modelo tenta prever) continua igual. O que mudou foi só a distribuição de quem está entrando pela porta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de feature\", \"Exemplo de data drift\"], [\"Numérica (idade, renda, ticket médio)\", \"A média ou o desvio padrão da feature muda entre treino e produção\"], [\"Categórica (categoria de produto, estado, canal)\", \"Surgem categorias novas, ou a proporção entre categorias muda bastante\"], [\"Temporal (dia da semana, horário de acesso)\", \"O padrão de uso muda, por exemplo mais tráfego mobile do que no treino\"], [\"Geográfica (cidade, região)\", \"A empresa passa a atender regiões que não existiam na base de treino\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como detectar\n\nA ideia central é simples: comparar a distribuição das features que chegam em produção hoje com a distribuição que existia nos dados de treino. Algumas formas de fazer essa comparação, da mais simples pra mais rigorosa:\n\n- Comparar estatísticas descritivas (média, desvio padrão, mínimo, máximo) de cada feature, treino x produção.\n- Comparar as contagens por faixa de valor das duas distribuições, mesmo sem gráfico na tela.\n- Usar um teste estatístico, como o teste de Kolmogorov-Smirnov (KS), que indica se duas amostras vêm de distribuições diferentes.\n- Calcular um índice resumido, como o PSI (Population Stability Index), bastante usado no mercado financeiro pra medir o quanto uma variável 'andou' desde o treino."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nfrom scipy.stats import ks_2samp\n\ntreino = pd.read_csv(\"dados_treino.csv\")\nproducao = pd.read_csv(\"dados_producao_ultima_semana.csv\")\n\n# compara a distribuicao da feature \"renda\" entre treino e producao\nestatistica, p_valor = ks_2samp(treino[\"renda\"], producao[\"renda\"])\n\nprint(f\"estatistica KS: {estatistica:.3f}\")\nprint(f\"p-valor: {p_valor:.4f}\")\n\n# p-valor baixo (menor que 0.05, por exemplo) sugere que as duas\n# distribuicoes sao diferentes, um indicio de data drift em \"renda\"\nif p_valor < 0.05:\n    print(\"possivel data drift em 'renda', vale investigar\")"
                    },
                    {
                        "type": "text",
                        "value": "## Um alerta, não uma sentença\n\nDetectar data drift não significa necessariamente que o modelo piorou. Às vezes a distribuição muda um pouco e o modelo continua robusto o suficiente pra lidar com isso. Data drift é um sinal de atenção: motivo pra investigar de perto, olhar as métricas de desempenho (quando o rótulo estiver disponível) e decidir se vale a pena agir.\n\nMas existe um segundo tipo de mudança, mais sutil e mais perigosa, que a gente vê na próxima aula: quando não é a entrada que muda, e sim o que ela *significa*."
                    },
                    {
                        "type": "quote",
                        "value": "Data drift é quando o modelo continua vendo o mundo do jeito que sempre viu, só que o mundo que chega até ele já é outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é data drift?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É a mudança na distribuição das features que o modelo recebe em produção",
                                "isCorrect": true
                            },
                            {
                                "text": "É a queda de desempenho da API causada por falhas de rede constantes",
                                "isCorrect": false
                            },
                            {
                                "text": "É a atualização manual dos hiperparâmetros do modelo depois de um retreino",
                                "isCorrect": false
                            },
                            {
                                "text": "É o aumento do tempo de resposta do modelo conforme mais usuários acessam",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja online passa a vender bastante pra um público bem mais jovem que o público histórico usado no treino do modelo de recomendação. As regras de 'o que combina com o que' continuam válidas. Isso é um exemplo de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Data drift, porque mudou o perfil de quem usa o modelo, não a lógica",
                                "isCorrect": true
                            },
                            {
                                "text": "Concept drift, porque a relação entre produtos comprados juntos deixou de existir",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de código introduzido no último deploy da API de recomendação",
                                "isCorrect": false
                            },
                            {
                                "text": "Overfitting do modelo, porque ele decorou demais os dados de treino antigos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma cientista de dados quer verificar se a distribuição da feature 'idade' mudou entre o treino e a produção do último mês. Qual abordagem é adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Comparar as duas distribuições com um teste estatístico como o Kolmogorov-Smirnov",
                                "isCorrect": true
                            },
                            {
                                "text": "Reavaliar manualmente cada previsão errada feita pelo modelo no mês anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de árvores do modelo para melhorar a acurácia geral",
                                "isCorrect": false
                            },
                            {
                                "text": "Retreinar o modelo imediatamente antes de confirmar se existe algum problema real",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time percebeu que o desempenho do modelo caiu, mas a distribuição de todas as features de entrada continua praticamente igual à do treino. Isso torna menos provável a hipótese de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Data drift, já que a distribuição das entradas não mudou muito",
                                "isCorrect": true
                            },
                            {
                                "text": "Concept drift, já que a relação entre entrada e alvo pode ter mudado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um bug recente no pipeline que calcula as features antes da previsão",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma mudança na forma como o rótulo é definido pelo time de negócio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O PSI (Population Stability Index) calculado pra uma feature deu um valor bem alto entre o treino e a produção do mês passado. Isso quer dizer, de forma direta, que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A distribuição da feature mudou bastante, algo que pede mais investigação",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo certamente piorou e precisa ser substituído pela versão anterior agora",
                                "isCorrect": false
                            },
                            {
                                "text": "A API está retornando erro para uma parte relevante das requisições recebidas",
                                "isCorrect": false
                            },
                            {
                                "text": "O rótulo real das previsões recentes está sistematicamente diferente da previsão feita",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Concept drift",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Na aula passada vimos o data drift: a distribuição das entradas muda, mas a relação entre elas e o que o modelo tenta prever continua a mesma. Agora vamos falar do outro tipo de degradação, mais sutil e, na prática, mais perigoso: o **concept drift** (deriva de conceito)."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o que era verdade deixa de ser\n\nConcept drift acontece quando a **relação entre as features de entrada e o alvo que o modelo prevê** muda, mesmo que a distribuição das features em si continue parecida.\n\nO exemplo clássico é fraude. Um modelo aprende que certas combinações de comportamento (horário da compra, valor, número de tentativas) indicam fraude. Só que fraudadores mudam de tática o tempo todo, exatamente pra escapar dos sistemas de detecção. Em algum momento, o padrão que antes gritava 'fraude' passa a ser comportamento normal, e um padrão novo, que o modelo nunca viu como suspeito, vira o golpe da vez. As pessoas que compram (a distribuição de clientes) podem nem ter mudado. O que mudou foi o que aquele comportamento *significa*."
                    },
                    {
                        "type": "text",
                        "value": "## Outro exemplo: a preferência do cliente\n\nUm modelo prevê se um cliente vai cancelar a assinatura de um serviço de streaming, usando como feature o número de dias sem assistir nada. No treino, 10 dias sem assistir era um forte indício de cancelamento. Depois de uma mudança no catálogo, passar 10 dias sem assistir virou normal pra boa parte da base. A feature continua existindo do mesmo jeito, o valor que ela assume na base de clientes pode nem ter mudado muito, mas o que aquele valor **prevê** sobre cancelamento não é mais o mesmo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Data drift\", \"Concept drift\"], [\"O que muda\", \"A distribuição das features de entrada\", \"A relação entre as features e o alvo\"], [\"As features continuam parecidas?\", \"Não, é isso que muda\", \"Sim, podem continuar praticamente iguais\"], [\"Como perceber\", \"Comparando estatísticas e distribuições das features\", \"Comparando o desempenho do modelo quando o rótulo chega\"], [\"Facilidade de detectar\", \"Mais fácil, dá pra medir sem esperar o rótulo\", \"Mais difícil, costuma aparecer só quando o erro já subiu\"], [\"Exemplo típico\", \"Novo público, com idade e renda diferentes\", \"Fraudadores mudam de tática, o mesmo perfil já não indica o mesmo risco\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nlogs = pd.read_csv(\"logs_producao_com_rotulo.csv\", parse_dates=[\"data\"])\nlogs[\"mes\"] = logs[\"data\"].dt.to_period(\"M\")\n\n# a distribuicao da feature pode estar estavel...\nprint(logs.groupby(\"mes\")[\"valor_da_compra\"].mean())\n\n# ...mas o que ela indica sobre fraude pode ter mudado.\n# compara a taxa de fraude real entre compras de valor alto, mes a mes\nalto_valor = logs[logs[\"valor_da_compra\"] > 1000]\nprint(alto_valor.groupby(\"mes\")[\"e_fraude\"].mean())\n\n# se a taxa de fraude entre compras de valor alto sobe ou desce\n# de forma consistente, e um indicio de que a relacao entre\n# \"valor alto\" e \"fraude\" (o conceito que o modelo aprendeu) mudou"
                    },
                    {
                        "type": "text",
                        "value": "## Por que é mais difícil de pegar\n\nData drift dá pra monitorar olhando só pras features de entrada, sem precisar esperar o rótulo verdadeiro. Concept drift, na maioria dos casos, só fica evidente quando o rótulo chega e o time percebe que o modelo está errando de um jeito novo e sistemático. Em domínios onde o rótulo demora (fraude que só é confirmada semanas depois, inadimplência que só se confirma meses depois), o concept drift pode ficar mascarado por um bom tempo, corroendo o desempenho do modelo em silêncio antes de alguém perceber."
                    },
                    {
                        "type": "quote",
                        "value": "Data drift muda quem chega até a porta. Concept drift muda o que significa a pessoa que chegou."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o concept drift?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A relação entre as features de entrada e o alvo muda",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de requisições que a API recebe por segundo aumenta muito",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo é substituído por uma versão mais recente durante o retreino",
                                "isCorrect": false
                            },
                            {
                                "text": "A infraestrutura de nuvem onde o modelo roda muda de provedor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Fraudadores mudam de estratégia pra escapar da detecção. O padrão que antes indicava fraude passa a ser comportamento comum, e surge um padrão novo. O perfil geral de quem compra no site não mudou. Esse é um exemplo clássico de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Concept drift, porque mudou o que aquele padrão de comportamento significa",
                                "isCorrect": true
                            },
                            {
                                "text": "Data drift, porque mudou o perfil das pessoas que compram no site",
                                "isCorrect": false
                            },
                            {
                                "text": "Overfitting, porque o modelo memorizou demais os padrões de fraude do treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema de latência na API que atrasa a resposta das previsões",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe monitora só a distribuição das features de entrada, sem acompanhar o desempenho do modelo quando o rótulo chega. Que tipo de degradação essa equipe corre o risco de não perceber a tempo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Concept drift, que costuma exigir o rótulo real pra ficar evidente",
                                "isCorrect": true
                            },
                            {
                                "text": "Data drift, que já é visível olhando só pra distribuição das features",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma, já que monitorar as features é suficiente pra cobrir os dois casos",
                                "isCorrect": false
                            },
                            {
                                "text": "Erros de infraestrutura, que só aparecem nos logs de latência da API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o concept drift costuma ser mais difícil de detectar do que o data drift?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque só fica claro quando o rótulo verdadeiro chega e revela erros novos",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque exige processamento computacional muito mais pesado do que comparar distribuições",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as ferramentas de monitoramento de concept drift ainda não existem no mercado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a mudança sempre acontece de forma repentina, sem nenhum sinal prévio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de aprovação de crédito passa a aprovar mais gente de uma faixa etária que antes era rara na base, mas essas pessoas pagam tão bem quanto o modelo esperava. Isso é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Data drift sem concept drift, já que o risco continua o esperado",
                                "isCorrect": true
                            },
                            {
                                "text": "Concept drift sem data drift, já que o perfil de clientes não mudou",
                                "isCorrect": false
                            },
                            {
                                "text": "Concept drift e data drift ao mesmo tempo, o pior cenário possível",
                                "isCorrect": false
                            },
                            {
                                "text": "Nem data drift nem concept drift, apenas uma flutuação normal sem causa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que monitorar (com e sem rótulo)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Monitorar um modelo em produção não é só olhar a acurácia de vez em quando. E, na prática, o rótulo verdadeiro (aquilo que realmente aconteceu, e que permitiria calcular a acurácia de verdade) quase nunca chega no mesmo instante da previsão. Às vezes demora dias, semanas, ou nunca chega de forma estruturada. Isso divide o monitoramento em duas situações bem diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o rótulo chega\n\nEm alguns casos, o resultado real aparece depois de um tempo: uma fatura foi paga ou não, uma transação foi confirmada como fraude ou não, um cliente cancelou ou não. Assim que o rótulo chega, dá pra calcular as métricas de verdade e comparar com o desempenho visto no treino e na validação:\n\n- Para classificação: acurácia, precisão, recall, F1, a matriz de confusão.\n- Para regressão: erro médio absoluto (MAE), erro quadrático médio (RMSE).\n\nO importante é comparar essas métricas ao longo do tempo (por semana, por mês), não só olhar um número isolado. Uma queda consistente é o sinal mais confiável de que existe drift acontecendo."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o rótulo não chega (ainda, ou nunca)\n\nNa maior parte do tempo, o modelo está prevendo e a resposta certa não está disponível de imediato. Nesses casos, o time recorre a **sinais indiretos**, que não provam que o modelo errou, mas indicam que algo pode estar fora do esperado:\n\n- A distribuição das próprias previsões: se o modelo de repente passa a prever muito mais (ou muito menos) da classe positiva do que era comum, vale investigar.\n- Sinais de negócio: taxa de cliques em recomendações, taxa de conversão, número de reclamações, quantidade de decisões que um analista humano precisou reverter manualmente.\n- Feedback implícito do usuário: alguém que recebe uma recomendação e nunca clica em nada relacionado está dando um sinal, mesmo sem preencher formulário nenhum."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que monitorar\", \"Como\"], [\"Métricas do modelo (com rótulo)\", \"Acurácia, precisão, recall, F1 ou RMSE, comparadas por período\"], [\"Distribuição das previsões\", \"Proporção de cada classe prevista, comparada semana a semana\"], [\"Sinais de negócio (sem rótulo)\", \"Taxa de cliques, conversão, reclamações, taxa de override manual\"], [\"Data drift nas features\", \"Comparação de distribuições e testes estatísticos, como na aula 2\"], [\"Saúde da API\", \"Latência, taxa de erro (códigos 5xx), volume de requisições por minuto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A saúde da API também é monitoramento\n\nLembra das APIs e do Docker do módulo anterior? Um modelo em produção é, na prática, um serviço. E como qualquer serviço, ele pode ficar lento ou parar de responder mesmo com o modelo funcionando perfeitamente bem do ponto de vista estatístico. Por isso, monitorar a **infraestrutura** faz parte do trabalho, junto com a qualidade das previsões:\n\n- **Latência**: quanto tempo a API demora pra responder cada requisição.\n- **Taxa de erro**: quantas requisições terminam em erro (os códigos HTTP 5xx), por exemplo por uma feature faltando ou um tipo de dado inesperado.\n- **Throughput**: quantas requisições o serviço processa por minuto, e se isso está dentro da capacidade combinada."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nlogs = pd.read_csv(\"logs_producao.csv\", parse_dates=[\"data\"])\nlogs[\"semana\"] = logs[\"data\"].dt.to_period(\"W\")\n\n# sem rotulo, da pra acompanhar a proporcao de previsoes positivas\n# (ex.: \"fraude\") como um sinal indireto de que algo mudou\n# (aqui \"previsao\" e 0 ou 1, entao a media vira a proporcao)\nproporcao_positiva = logs.groupby(\"semana\")[\"previsao\"].mean()\nprint(proporcao_positiva)\n\n# se o modelo preve fraude em 2% das transacoes historicamente\n# e de repente passa a prever 8%, vale investigar\n# mesmo sem o rotulo real de cada transacao ainda\nlimite_historico = 0.02\nsemana_atual = proporcao_positiva.iloc[-1]\n\nif semana_atual > limite_historico * 2:\n    print(\"proporcao de previsoes positivas dobrou, investigar\")"
                    },
                    {
                        "type": "quote",
                        "value": "Quando o rótulo não chega, o modelo não fica isento de monitoramento, ele só passa a ser observado por outros sinais."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quando o rótulo verdadeiro demora a chegar ou nunca chega de forma estruturada, o que o time pode monitorar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sinais indiretos e de negócio, como cliques, conversão e reclamações",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente a acurácia calculada durante a validação do modelo no notebook",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o código-fonte do modelo, procurando erros de sintaxe no script",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de linhas do arquivo requirements.txt usado no ambiente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de sinal indireto de negócio, útil quando o rótulo verdadeiro ainda não chegou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A taxa de cliques dos usuários nas recomendações feitas pelo modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "A precisão calculada a partir da matriz de confusão do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "O recall do modelo medido no conjunto de teste durante a validação",
                                "isCorrect": false
                            },
                            {
                                "text": "O RMSE calculado sobre as previsões de regressão do último mês",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe percebe que a taxa de erro HTTP 5xx da API de previsão subiu bastante, mas as métricas de qualidade do modelo (quando o rótulo chega) continuam normais. O que isso sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um problema na infraestrutura ou no serviço, não necessariamente no modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Um caso claro de concept drift que ainda não afetou as métricas calculadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um caso de data drift, já que a distribuição das entradas mudou bastante",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sinal de que o modelo precisa ser retreinado com dados mais recentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual par abaixo relaciona corretamente o tipo de sinal com uma forma adequada de monitorá-lo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Saúde da API: acompanhar latência, taxa de erro e volume de requisições",
                                "isCorrect": true
                            },
                            {
                                "text": "Saúde da API: acompanhar a acurácia do modelo calculada mês a mês",
                                "isCorrect": false
                            },
                            {
                                "text": "Métrica do modelo: acompanhar o tempo de resposta de cada requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Sinal de negócio: acompanhar quantas requisições terminam em erro HTTP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo prevê fraude em cerca de 2% das transações historicamente. Numa semana, sem que o rótulo real de nenhuma transação tenha chegado ainda, essa proporção sobe pra 8%. O que é razoável fazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tratar como um alerta e investigar, mesmo sem o rótulo confirmado ainda",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignorar, porque sem o rótulo real não existe nenhum sinal aproveitável",
                                "isCorrect": false
                            },
                            {
                                "text": "Retreinar o modelo imediatamente, já que a proporção mudou de forma clara",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o limite de decisão do modelo até a proporção voltar ao normal",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Alertas e quando agir",
                "blocks": [
                    {
                        "type": "text",
                        "value": "De nada adianta calcular métricas, comparar distribuições e acompanhar sinais de negócio se ninguém olha pra esses números todo dia. As duas últimas peças do monitoramento fecham essa aula, e o módulo: os **dashboards**, que dão visibilidade contínua, e os **alertas**, que avisam a equipe quando algo sai do esperado, sem depender de alguém checando manualmente toda hora."
                    },
                    {
                        "type": "text",
                        "value": "## Dashboards\n\nUm dashboard de monitoramento reúne, num só lugar, os indicadores das aulas anteriores: as métricas do modelo (quando há rótulo), a distribuição das previsões, os sinais de negócio, os indícios de data drift por feature, e a saúde da API (latência, erros, volume de requisições). A ideia é permitir que qualquer pessoa do time bata o olho e entenda rapidamente se está tudo dentro do esperado.\n\nExistem várias ferramentas de observabilidade e dashboards no mercado, como Grafana e Prometheus (soluções open source) ou serviços de nuvem como o CloudWatch da AWS. A ferramenta importa menos do que garantir que os números certos estejam visíveis e atualizados."
                    },
                    {
                        "type": "text",
                        "value": "## Alertas\n\nUm dashboard exige que alguém olhe pra ele. Um alerta avisa sozinho. A prática comum é definir, pra cada métrica importante, uma faixa considerada normal (baseada no histórico) e dois tipos de aviso: um **limite de atenção**, quando o valor já saiu do normal mas ainda não é grave, e um **limite crítico**, quando alguém precisa investigar sem demora.\n\nCalibrar esses limites é mais arte do que ciência, e vale ser honesto: um limite apertado demais dispara alerta toda hora, a equipe aprende a ignorar, e um limite frouxo demais deixa passar problema real. Nenhuma ferramenta resolve isso sozinha, é ajuste contínuo."
                    },
                    {
                        "type": "code",
                        "value": "def verificar_alerta(metrica_atual, media_historica, desvio_historico):\n    limite_atencao = media_historica - 1.5 * desvio_historico\n    limite_critico = media_historica - 3 * desvio_historico\n\n    if metrica_atual < limite_critico:\n        return \"CRITICO: investigar agora\"\n    elif metrica_atual < limite_atencao:\n        return \"ATENCAO: acompanhar de perto\"\n    else:\n        return \"NORMAL\"\n\n# exemplo: acuracia semanal do modelo em producao\nstatus = verificar_alerta(\n    metrica_atual=0.81,\n    media_historica=0.90,\n    desvio_historico=0.02,\n)\nprint(status)  # CRITICO: investigar agora"
                    },
                    {
                        "type": "text",
                        "value": "## Investigar antes de agir\n\nUm alerta não é, por si só, uma ordem pra retreinar o modelo. O primeiro passo é sempre investigar a causa:\n\n- Pode ser um problema de dados: uma feature chegando nula ou fora do padrão por um bug no pipeline, sem relação nenhuma com drift.\n- Pode ser um evento pontual (uma data comemorativa, uma promoção fora do padrão) que distorce as métricas por um tempo e depois volta ao normal sozinho.\n- Pode ser data drift ou concept drift de verdade, sinal de que o modelo está mesmo desatualizado.\n\nSó depois de entender a causa é que faz sentido decidir: esperar, corrigir um bug, ajustar um limite de decisão, ou partir pra um retreino, o assunto do próximo módulo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal observado\", \"Ação mais provável\"], [\"Erro HTTP 5xx disparou de repente\", \"Investigar a infraestrutura e o código da API, não o modelo\"], [\"Uma feature específica chegando nula com frequência\", \"Checar o pipeline de dados antes de suspeitar do modelo\"], [\"Métricas caem de forma consistente por semanas\", \"Investigar drift e considerar um retreino\"], [\"Pico isolado num único dia\", \"Acompanhar de perto, pode ser um evento pontual que passa sozinho\"], [\"Distribuição de uma feature muda aos poucos, sem afetar métricas\", \"Registrar e acompanhar, sem ação imediata\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Monitorar não é desconfiar do modelo, é aceitar que o mundo não combinou de ficar parado esperando ele acertar pra sempre."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença principal entre um dashboard e um alerta no monitoramento de um modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O dashboard exige que alguém olhe pra ele, o alerta avisa a equipe sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "O dashboard só funciona com rótulo, o alerta funciona sem rótulo nenhum",
                                "isCorrect": false
                            },
                            {
                                "text": "O dashboard mede a API, o alerta mede exclusivamente a qualidade do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "O dashboard é pago, o alerta é sempre uma ferramenta gratuita e open source",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe define limites de alerta apertados demais pras métricas do modelo. Qual é a consequência mais provável, no médio prazo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Alertas disparam com frequência demais, e a equipe passa a ignorá-los",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo passa a errar mais previsões por causa dos limites apertados",
                                "isCorrect": false
                            },
                            {
                                "text": "A API fica mais lenta porque processa os alertas em tempo real",
                                "isCorrect": false
                            },
                            {
                                "text": "Problemas reais de drift deixam de ser detectados pelo sistema de alertas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No meio de uma black friday, as métricas de negócio do modelo de recomendação saem bastante do padrão histórico por dois dias, e depois voltam ao normal sozinhas. Qual foi provavelmente a causa, e qual seria a ação mais sensata?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um evento pontual e sazonal, acompanhar de perto sem partir direto pra um retreino",
                                "isCorrect": true
                            },
                            {
                                "text": "Concept drift real, retreinar o modelo imediatamente assim que os dados voltam ao normal",
                                "isCorrect": false
                            },
                            {
                                "text": "Data drift real, recolher novos dados de treino antes de qualquer outra ação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um bug crítico na API, reiniciar o serviço e revisar o código do endpoint",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma feature específica do modelo passa a chegar nula com muita frequência nas requisições. Qual é o primeiro lugar sensato pra investigar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pipeline que calcula e envia essa feature, antes de suspeitar do modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Os hiperparâmetros do modelo, ajustando-os até a feature parar de vir nula",
                                "isCorrect": false
                            },
                            {
                                "text": "O histórico de acurácia do modelo, comparando mês a mês desde o treino",
                                "isCorrect": false
                            },
                            {
                                "text": "A distribuição geográfica dos clientes que estão usando o serviço agora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de meses rodando o sistema de alertas, o time percebe que passou a ignorar boa parte dos avisos recebidos. O que essa situação sugere sobre o processo de monitoramento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que os limites dos alertas precisam ser recalibrados, não abandonados",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo está sofrendo concept drift grave e precisa ser substituído logo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que dashboards e alertas são redundantes e um dos dois pode ser descartado",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o monitoramento já cumpriu seu papel e pode ser desligado com segurança",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Retreinar e o ciclo de vida",
        "aulas": [
            {
                "titulo": "Quando e por que retreinar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Retreinar e o ciclo de vida\n\nNo módulo anterior você aprendeu a monitorar um modelo em produção: acompanhar métricas, detectar data drift e concept drift, e perceber quando alguma coisa começa a degradar mesmo sem nenhuma mudança de código. Agora vem a pergunta natural: detectado o problema, o que fazer?\n\nA resposta, na maioria dos casos, é retreinar. Não existe um modelo definitivo, treinado uma vez e bom pra sempre: existe um modelo que precisa ser cuidado ao longo do tempo, como parte de um ciclo que se repete."
                    },
                    {
                        "type": "text",
                        "value": "## O modelo é uma foto do mundo, não o mundo\n\nQuando você treina um modelo, ele aprende os padrões presentes num conjunto de dados coletado até aquele momento. Esse conjunto é como uma fotografia: representa bem a realidade do instante em que foi tirada, mas o mundo real continua andando depois disso. Clientes mudam de comportamento, o mercado muda, novos produtos entram no catálogo, hábitos mudam.\n\nÉ exatamente esse descompasso que o módulo anterior chamou de drift. O retreino é a forma de tirar uma foto nova e atualizar o modelo pra ela."
                    },
                    {
                        "type": "text",
                        "value": "## Retreino periódico\n\nA estratégia mais simples é definir um intervalo fixo: retreinar toda semana, todo mês, todo trimestre, dependendo de quão rápido os dados do seu problema costumam mudar. Um modelo de recomendação de e-commerce talvez precise de um ciclo curto; um modelo de risco de crédito, que lida com padrões mais estáveis, pode viver bem com um ciclo mais longo.\n\nA vantagem do retreino periódico é a previsibilidade: todo mundo sabe quando ele vai rodar, e o custo computacional entra na conta com antecedência. A desvantagem é a rigidez: o calendário não sabe se o modelo está indo bem ou mal, então o retreino pode acontecer cedo demais (gastando recursos à toa) ou tarde demais (deixando o modelo errar por semanas até a próxima janela)."
                    },
                    {
                        "type": "text",
                        "value": "## Retreino disparado por métrica\n\nA outra estratégia usa o próprio monitoramento como gatilho: quando uma métrica acompanhada (a acurácia, o F1, uma métrica de negócio) cai abaixo de um limiar definido, um retreino é disparado automaticamente, sem esperar o calendário. É uma resposta mais reativa e, em teoria, mais eficiente: só se retreina quando há evidência de que vale a pena.\n\nO retreino por gatilho depende de duas coisas que nem sempre estão prontas: um monitoramento maduro (o módulo anterior) e um rótulo disponível rápido o suficiente pra calcular a métrica. Num problema de fraude, o rótulo chega em horas; num problema de cancelamento de assinatura anual, pode levar meses, e nesse caso o gatilho reage tarde demais pra ser útil sozinho.\n\nUm detalhe que vale o cuidado: nem toda queda de métrica é drift. Antes de disparar um retreino, é saudável descartar um bug no pipeline de dados ou uma falha na captura de alguma feature. Retreinar com dado igualmente quebrado não resolve nada, só disfarça o problema por um tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Retreino periódico\", \"Retreino por gatilho\"], [\"Quando dispara\", \"Num intervalo fixo (semana, mês, trimestre)\", \"Quando uma métrica cruza um limiar definido\"], [\"Vantagem principal\", \"Previsível, fácil de planejar o custo\", \"Reage rápido a uma queda real de desempenho\"], [\"Risco principal\", \"Retreinar cedo demais ou tarde demais\", \"Depende de monitoramento maduro e rótulo rápido\"], [\"Papel mais comum\", \"Rede de segurança de base, sempre rodando\", \"Reação pontual a um problema específico\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Na prática, os dois convivem\n\nA maioria dos times maduros não escolhe um ou outro: usa o retreino periódico como uma rede de segurança de base (garante que o modelo nunca fica velho demais) e o retreino por gatilho pra reagir rápido quando algo foge do esperado entre uma janela e outra. Nenhuma das duas estratégias é gratuita: cada retreino consome dado, tempo de computação e, principalmente, exige alguém revisando se o resultado faz sentido antes de seguir adiante."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo treinado é uma fotografia do mundo num certo momento; quando o mundo muda, a fotografia envelhece, e retreinar é a forma de tirar uma nova."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de meses em produção sem nenhuma mudança de código, um modelo de previsão de demanda começa a errar mais. Qual é a explicação mais provável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os padrões nos dados de entrada mudaram desde o treino original do modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados de produção está com um índice desatualizado nas tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API que serve o modelo perdeu desempenho por falta de otimização no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time de operação esqueceu de reiniciar o servidor após uma atualização.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de crédito definiu que o modelo será retreinado toda primeira segunda-feira do mês, independente do desempenho observado. Que estratégia de retreino é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retreino periódico, baseado num calendário fixo, não numa queda de métrica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Retreino por gatilho, baseado em alertas do monitoramento sobre a métrica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Shadow deployment, rodando um modelo novo em paralelo antes de decidir algo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rollback automático, revertendo pro modelo anterior sempre que o mês começa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de detecção de fraude recebe o rótulo real (fraude ou não) poucas horas depois de cada transação, e o padrão de fraude muda rápido, semana a semana. Qual estratégia de retreino faz mais sentido como principal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retreino disparado por métrica, já que o rótulo chega rápido e o padrão muda rápido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Retreino periódico anual, já que fraude é um problema raro e não compensa revisitar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum retreino, bastando ajustar manualmente o limiar de decisão todo mês.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retreino periódico a cada dois anos, alinhado ao ciclo orçamentário da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer usar retreino disparado por métrica, mas o rótulo real (se o cliente cancelou o serviço) só fica disponível quase dois meses depois da previsão. Qual é o problema prático dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O sinal que dispararia o retreino demora tanto quanto o problema, atrasando a reação.",
                                "isCorrect": true
                            },
                            {
                                "text": "O gatilho vai disparar retreinos com frequência excessiva, consumindo recursos à toa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Métricas de negócio nunca podem servir de gatilho, só métricas técnicas do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo de cancelamento não pode ser retreinado de forma automática, só manual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A métrica de um modelo caiu bruscamente de um dia pro outro. Antes de disparar um retreino, o que faz mais sentido investigar primeiro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Se não houve falha no pipeline de dados ou nas features, já que retreinar não corrige um bug.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se o servidor da API está usando a versão mais recente do framework de machine learning.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o modelo concorrente da empresa também teve queda de métrica no mesmo período.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a equipe comercial mudou as metas do trimestre para os times de vendas da empresa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Automatizar o retreino com uma pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fazer na mão não escala\n\nImagine que, toda vez que a métrica cai, alguém precisa abrir um notebook, carregar os dados novos manualmente, rodar célula por célula o mesmo pré-processamento, treinar de novo, comparar com o modelo anterior e, se estiver tudo certo, salvar um novo arquivo com joblib. Funciona a primeira vez. Na quinta vez, alguém esquece um passo, usa uma versão diferente de uma biblioteca, ou aplica uma transformação levemente diferente sem perceber.\n\nÉ o mesmo abismo do módulo 1, só que reaparecendo em outro lugar: o problema não é treinar um modelo uma vez, é repetir esse processo de forma confiável, indefinidamente."
                    },
                    {
                        "type": "text",
                        "value": "## O que uma pipeline de retreino faz\n\nAutomatizar o retreino significa escrever, uma vez, um script que executa toda a sequência sozinho: buscar os dados mais recentes numa fonte definida (um banco, um data warehouse, um arquivo), aplicar exatamente o mesmo preparo usado no treino original, treinar o modelo, avaliar num conjunto separado e, só então, salvar um novo artefato.\n\nAqui é onde aquele Pipeline do scikit-learn, usado lá atrás pra empacotar pré-processamento e modelo num objeto só e evitar vazar dado de teste no treino, paga o investimento de novo: como o preparo já está encapsulado junto do modelo, o script de retreino não precisa reescrever nenhuma etapa de transformação. Ele só chama `fit` de novo, com dado novo."
                    },
                    {
                        "type": "text",
                        "value": "## Reexecutar o mesmo fluxo, não inventar um novo\n\nO valor da automação não está em ser mais sofisticada, está em ser previsível: o script de retreino de fevereiro faz exatamente a mesma coisa que o de janeiro, mudando só o dado de entrada. Isso elimina boa parte do erro humano (esquecer um passo, aplicar uma transformação fora de ordem) e torna o processo auditável: sempre dá pra olhar o mesmo código e entender o que aconteceu em qualquer retreino passado."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\nimport pandas as pd\nfrom datetime import date\nfrom sklearn.metrics import f1_score\n\n# Carrega o Pipeline atual (preparo + modelo, salvo no ciclo anterior)\npipeline_atual = joblib.load(\"modelo_atual.joblib\")\n\n# Busca os dados novos e separa treino/validação\ndados_novos = pd.read_parquet(\"dados_recentes.parquet\")\nX = dados_novos.drop(columns=[\"cancelou\"])\ny = dados_novos[\"cancelou\"]\ncorte = int(len(dados_novos) * 0.8)\nX_treino, X_val = X[:corte], X[corte:]\ny_treino, y_val = y[:corte], y[corte:]\n\n# Reexecuta o MESMO fluxo: o Pipeline cuida do preparo e do treino juntos\ncandidato = pipeline_atual.fit(X_treino, y_treino)\n\n# Avalia o candidato antes de cogitar substituir o modelo em produção\nscore = f1_score(y_val, candidato.predict(X_val))\nversao = date.today().isoformat()\njoblib.dump(candidato, f\"modelo_candidato_{versao}.joblib\")\nprint(f\"Candidato {versao} treinado, f1 = {score:.3f}\")"
                    },
                    {
                        "type": "text",
                        "value": "## Quando esse script roda\n\nO disparo pode vir de qualquer uma das duas estratégias da aula anterior: uma tarefa agendada (rodando toda semana, todo mês) ou um alerta do monitoramento avisando que uma métrica caiu. De um jeito ou de outro, o resultado é o mesmo: um modelo candidato, salvo com sua própria versão, ainda sem estar em produção. Ele só chega lá depois de passar pela validação que a aula 4 deste módulo detalha."
                    },
                    {
                        "type": "text",
                        "value": "## Automatizar não elimina a complexidade\n\nVale um alerta honesto: uma pipeline de retreino automatizada não é algo que se configura uma vez e se esquece depois. Ela também pode falhar silenciosamente, receber dado corrompido sem avisar, ou treinar durante semanas com uma coluna zerada por engano em algum lugar da origem. Automatizar tira o trabalho manual repetitivo, mas essa pipeline também precisa dos próprios logs e alertas, do mesmo jeito que o modelo que ela produz precisa ser monitorado."
                    },
                    {
                        "type": "quote",
                        "value": "Automatizar o retreino não é sofisticação por si só: é a diferença entre repetir um processo confiável toda vez e torcer pra lembrar de todos os passos na próxima."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal vantagem de automatizar o retreino de um modelo em vez de repetir o processo manualmente a cada vez?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O mesmo fluxo de preparo e treino se repete de forma consistente, com menos erro humano.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo automaticamente fica mais preciso do que qualquer versão treinada na mão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A automação elimina de vez a necessidade de validar o modelo antes de ir pra produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline automatizado escolhe sozinho qual algoritmo de machine learning usar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o pipeline de retreino deve aplicar exatamente as mesmas etapas de preparo do treino original, em vez de uma versão reescrita na hora?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pra evitar que o modelo novo treine com preparo diferente do que vai receber ao servir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pra garantir que o modelo novo sempre tenha uma métrica maior que o modelo anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra reduzir o tempo de treino, já que reescrever o preparo do zero seria mais lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra permitir que o retreino rode sem precisar de nenhum dado novo de produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pipeline de retreino automatizada foi criada, mas ninguém definiu quando ela deve rodar. O que ainda falta pra ela ser útil?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um gatilho, seja uma agenda fixa ou um alerta de monitoramento sobre queda de métrica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um algoritmo novo de machine learning, já que o atual está provavelmente obsoleto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um servidor com mais memória, já que pipelines de retreino sempre pedem hardware forte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma equipe inteira dedicada, porque pipelines automatizadas exigem supervisão constante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pipeline de retreino roda toda semana sem falhar, mas ninguém percebeu que, há um mês, uma tabela de origem passou a mandar valores nulos numa coluna importante. Qual é a lição desse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Automatizar o retreino não substitui monitorar a própria pipeline e a qualidade do dado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pipelines automatizadas nunca deveriam ser usadas, pois escondem problema de qualidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ideal é voltar a retreinar manualmente, já que isso evitaria valores nulos na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse tipo de falha só acontece em retreino por gatilho, nunca em agenda fixa periódica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Assim que a pipeline de retreino termina e salva um modelo com métrica de validação melhor que a versão anterior, o que deve acontecer em seguida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo vira um candidato, sujeito a validação completa antes de substituir o atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo já deve substituir a versão em produção de forma automática e imediata.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo deve ser descartado, já que só a métrica de treino importa nessa decisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo deve passar por um novo retreino, dessa vez com outro algoritmo diferente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Versionar dados e modelos: o model registry",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Qual modelo está no ar, treinado com qual dado\n\nDepois de alguns meses seguindo o que as aulas anteriores descreveram (retreinos periódicos, retreinos por gatilho, cada um gerando um novo arquivo de modelo), uma pergunta simples fica surpreendentemente difícil de responder: qual versão exata está servindo previsões agora, e com quais dados ela foi treinada?\n\nSe a resposta for algo como um arquivo joblib qualquer numa pasta, provavelmente o mais recente, há um problema: produção exige uma resposta precisa."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa de verdade\n\nTrês motivos práticos. Reprodutibilidade: se alguém precisar entender por que o modelo previu algo específico numa certa data, é preciso conseguir recriar exatamente aquele modelo, não uma versão parecida. Depuração: quando algo dá errado em produção, comparar a versão atual com versões anteriores ajuda a isolar se o problema é do modelo ou de outra coisa. Auditoria: se uma decisão automatizada for questionada (um crédito negado, uma cobrança sinalizada como suspeita), é preciso reconstituir qual modelo, treinado com quais dados, gerou aquela previsão."
                    },
                    {
                        "type": "text",
                        "value": "## O mínimo: nomear e guardar metadados\n\nA forma mais simples de versionar é uma convenção: cada modelo salvo ganha um identificador único (um número de versão, um timestamp) no nome do arquivo, e um registro à parte guarda o que interessa saber sobre aquela versão, como a data de treino, o conjunto de dados usado, as métricas de validação e quem disparou o processo. Não precisa de nenhuma ferramenta sofisticada pra começar: um arquivo de metadados ao lado do modelo já resolve boa parte do problema."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\nimport json\nfrom datetime import datetime\n\nversao = datetime.now().strftime(\"%Y%m%d-%H%M\")\ncaminho_modelo = f\"modelos/churn_{versao}.joblib\"\njoblib.dump(candidato, caminho_modelo)\n\nmetadados = {\n    \"versao\": versao,\n    \"dados_treino\": \"dados_recentes.parquet\",\n    \"linhas_treino\": len(X_treino),\n    \"f1_validacao\": round(score, 3),\n    \"treinado_em\": datetime.now().isoformat(),\n}\nwith open(f\"modelos/churn_{versao}.json\", \"w\") as f:\n    json.dump(metadados, f, indent=2)\n\n# Com um model registry (o MLflow é um exemplo comum), esse cadastro\n# fica centralizado em vez de espalhado em arquivos e pastas:\n# mlflow.sklearn.log_model(candidato, \"modelo\")\n# mlflow.log_metric(\"f1_validacao\", score)"
                    },
                    {
                        "type": "text",
                        "value": "## Model registry: centralizar em vez de espalhar\n\nQuando o número de modelos, versões e projetos cresce, manter tudo em arquivos e planilhas de metadados fica difícil de sustentar. Um model registry é uma ferramenta feita pra isso: um catálogo central de versões de modelo, com suas métricas, seus parâmetros, os artefatos gerados e um estágio explícito (em teste, em produção, arquivado). O MLflow é um exemplo bastante usado: além de registrar experimentos de treino, ele mantém esse catálogo de versões e permite mover um modelo de um estágio pro outro sem precisar caçar arquivo em pasta nenhuma."
                    },
                    {
                        "type": "text",
                        "value": "## Versionar o dado também, não só o modelo\n\nUm ponto que passa batido com facilidade: o mesmo código de treino, rodado sobre dados diferentes, produz modelos diferentes. Então versionar só o arquivo do modelo e ignorar de onde vieram os dados deixa a reprodutibilidade pela metade. Manter um identificador do snapshot de dados usado em cada treino (um recorte por data, um hash do arquivo, uma tabela versionada) é uma disciplina extra que exige esforço real de organização: nem toda equipe consegue manter isso rigorosamente, mas é a diferença entre saber exatamente o que está em produção e ter apenas uma ideia aproximada."
                    },
                    {
                        "type": "quote",
                        "value": "Sem saber qual modelo, treinado com quais dados, está respondendo agora, não existe reprodutibilidade nem auditoria: só um comportamento que ninguém consegue explicar direito."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal motivo pra dar um identificador de versão a cada modelo treinado, em vez de sempre sobrescrever o mesmo arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Permite saber qual modelo está em produção e voltar a uma versão anterior se precisar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduz o tamanho do arquivo salvo, já que versões antigas ocupam menos espaço em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumenta automaticamente a métrica do modelo mais recente frente às versões anteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evita que o modelo precise ser retreinado de novo no futuro, mesmo com dados novos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe versiona cada arquivo de modelo com cuidado, mas não guarda qual snapshot dos dados foi usado em cada treino. Qual limitação isso traz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica difícil reproduzir ou investigar um modelo sem saber com que dado ele treinou.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo perde métrica com o tempo mais rápido do que perderia com os dados versionados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API de previsão para de responder até que os dados voltem a ser versionados junto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho do arquivo do modelo cresce sem controle quando o dado não é versionado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pasta cheia de arquivos como modelo_v1.joblib e modelo_final_v2_novo.joblib é comparada a um model registry de verdade. Qual é a diferença central?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O registry organiza versão, métricas e estágio (teste, produção) de forma estruturada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O registry treina os modelos automaticamente, enquanto a pasta exige treino manual.",
                                "isCorrect": false
                            },
                            {
                                "text": "A pasta de arquivos é mais segura, por ficar fora do alcance de qualquer API de previsão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registry só funciona para modelos de deep learning, nunca pra árvores ou regressão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente questiona por que teve o crédito negado por um modelo, seis meses atrás. A equipe não consegue afirmar qual versão do modelo e quais dados de treino estavam em uso naquela data. Qual prática teria evitado isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Registrar cada versão do modelo com metadados de data, dados de treino e métricas no deploy.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar um modelo novo assim que a reclamação chegasse, respondendo com dado atualizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o algoritmo usado, já que árvores de decisão costumam ser mais fáceis de auditar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência de retreino, já que retreinar mais vezes deixa o modelo mais confiável.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um model registry, uma versão de modelo pode estar marcada como staging, produção ou arquivada. O que esse rótulo de estágio representa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O papel que aquela versão ocupa agora no ciclo de vida, não uma propriedade fixa do modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O algoritmo de machine learning usado pra treinar aquela versão específica salva.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de dados de treino utilizada pra gerar aquela versão específica do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo estimado de resposta da API que serve aquela versão específica em produção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Validar o modelo novo: A/B e shadow deployment",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Retreinar não é garantia de melhora\n\nUm modelo candidato acabou de sair da pipeline de retreino, com métricas de validação calculadas. Antes de comemorar: um modelo novo pode, sim, ser pior que o atual. O dado novo pode ter chegado com algum problema de qualidade, o período usado no treino pode ter capturado um comportamento atípico (uma promoção, uma sazonalidade), ou um ajuste que parecia bom pode ter tido efeito colateral em algum grupo específico de casos. Confiar sem checar é o tipo de atalho que sai caro."
                    },
                    {
                        "type": "text",
                        "value": "## Primeiro, compare offline\n\nO primeiro filtro é o mais simples: rodar o modelo candidato no mesmo conjunto de validação usado pra avaliar o modelo atual, calculando exatamente as mesmas métricas, lado a lado. Se o candidato perde do modelo em produção nesse comparativo direto, a decisão é fácil: ele não sobe, ponto final. Esse é o filtro de menor custo, e por isso deve vir antes de qualquer outro."
                    },
                    {
                        "type": "text",
                        "value": "## Um resultado melhor no papel pode não se confirmar\n\nMétrica de validação melhor não fecha a questão sozinha. O ambiente de produção tem coisas que um conjunto de validação estático não captura: a distribuição real do tráfego no momento, casos de borda raros, a latência de servir aquele modelo especificamente, integrações com outros sistemas. Por isso, depois de passar no filtro offline, um modelo candidato ainda costuma passar por uma validação em condições reais antes de assumir de vez o lugar do modelo atual."
                    },
                    {
                        "type": "text",
                        "value": "## Teste A/B\n\nNo teste A/B, uma fração do tráfego real de produção é direcionada ao modelo candidato, enquanto o restante continua no modelo atual, e o resultado de cada grupo é comparado por um período, geralmente numa métrica de negócio (conversão, receita, cancelamento) além das métricas técnicas do modelo. É uma validação com peso real: mede o efeito de verdade do modelo novo no comportamento de quem usa o produto, não só a métrica calculada num conjunto estático."
                    },
                    {
                        "type": "text",
                        "value": "## Shadow deployment\n\nNo shadow deployment, o modelo candidato roda em paralelo, recebendo as mesmas entradas que chegam em produção, mas a previsão dele não é entregue a ninguém nem usada em nenhuma decisão: só é registrada, pra comparação posterior com o modelo atual. Como nenhum usuário é exposto ao candidato, o risco é praticamente zero, o que faz do shadow deployment uma boa etapa antes de arriscar qualquer fração de tráfego real num teste A/B, especialmente pra pegar problema técnico (erro, latência alta, previsão fora do esperado) que a validação offline não revela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Teste A/B\", \"Shadow deployment\"], [\"O que o usuário recebe\", \"Uma fração recebe a previsão do candidato\", \"Ninguém: a previsão do candidato só é registrada\"], [\"Risco envolvido\", \"Real, tráfego de verdade sendo decidido\", \"Praticamente nenhum, é só observação\"], [\"O que mede\", \"Impacto de verdade numa métrica de negócio\", \"Comportamento técnico e previsões, sem impacto\"], [\"Quando faz mais sentido\", \"Com alguma confiança de que não vai piorar\", \"Antes de qualquer confiança, pra validar sem risco\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo novo só merece confiança depois de provar que é melhor, não porque foi treinado com dados mais recentes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de um retreino, por que não faz sentido colocar o modelo candidato direto em produção sem nenhuma validação antes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o candidato pode ser pior que o atual, mesmo treinado com dados mais recentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque todo modelo candidato é, por definição, sempre pior que o modelo em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque colocar um modelo sem validar é tecnicamente impossível de configurar numa API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validar é a única etapa do ciclo de vida que pode ser automatizada numa pipeline.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de cogitar um teste A/B ou um shadow deployment, qual validação mais simples já deveria ter sido feita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Comparar as métricas do candidato com as do modelo atual num conjunto de validação reservado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Colocar metade dos usuários reais no modelo novo e a outra metade no modelo antigo, direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o modelo novo em paralelo ao tráfego real, sem que a previsão dele afete ninguém.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perguntar à equipe de produto se o modelo novo parece, de forma subjetiva, mais confiável.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time treinou um modelo com arquitetura bem diferente da anterior, sem nenhuma garantia de como ele vai se comportar com tráfego real. Qual estratégia valida isso com o menor risco pro usuário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Shadow deployment, já que a previsão do candidato é só registrada, sem afetar ninguém.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste A/B, colocando uma fração pequena dos usuários reais em contato com o candidato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rollback preventivo, revertendo o modelo atual antes mesmo de terminar o treino do novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retreino periódico, trocando o modelo automaticamente assim que a versão nova fica pronta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo candidato passou pelo shadow deployment sem erro técnico e com previsões parecidas com o modelo atual. Isso já garante que ele vai melhorar o resultado de negócio depois de promovido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque o shadow deployment não mede o efeito real das previsões no comportamento do usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque o shadow deployment testa exatamente o mesmo impacto de negócio que um teste A/B.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o shadow deployment só pode validar modelos de classificação, nunca de regressão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque um modelo sem erro técnico durante o shadow terá o mesmo desempenho em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois dias depois de iniciar um teste A/B, o modelo candidato já está com uma métrica de negócio levemente melhor numa fração pequena do tráfego, e a equipe quer promovê-lo pra todos os usuários já. Qual é o risco dessa pressa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A diferença pode não ser estatisticamente confiável, com pouco tempo e tráfego acumulado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Testes A/B nunca podem durar menos de um mês inteiro, independente do volume de tráfego.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelos testados por A/B não podem ser promovidos, servindo só pra descartar candidatos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A métrica de negócio usada num teste A/B nunca reflete o comportamento real do candidato.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Rollback: voltar atrás rápido",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o modelo aprovado decepciona mesmo assim\n\nO modelo candidato passou pela comparação offline, foi bem num shadow deployment ou num teste A/B, e finalmente assumiu o lugar do modelo anterior em produção plena. Mesmo assim, semanas depois, uma métrica de negócio começa a piorar de um jeito que nenhuma etapa de validação capturou. O mundo real é maior do que qualquer teste, e às vezes o problema só aparece com volume total de tráfego, ao longo de mais tempo, ou numa combinação de casos rara demais pra aparecer numa amostra."
                    },
                    {
                        "type": "text",
                        "value": "## Rollback: voltar pra versão anterior, rápido\n\nRollback é reverter pro modelo anterior assim que fica claro que o novo piorou as coisas em produção, sem tentar consertar às pressas o modelo que está no ar nem insistir nele só porque deu trabalho treinar. A ideia é a mesma de um rollback de deploy de qualquer aplicação (voltar pra imagem anterior quando uma versão nova quebra algo em produção), só que aplicada a um modelo em vez de a um código."
                    },
                    {
                        "type": "text",
                        "value": "## É por isso que versionar importa\n\nRollback rápido só é possível porque a aula 3 deste módulo já resolveu o problema antes dele aparecer: a versão anterior do modelo, seus metadados e o ambiente fixado (aquele requirements.txt e a imagem Docker do módulo 3) continuam guardados e prontos pra voltar ao ar. Sem esse cuidado prévio, voltar atrás na prática vira retreinar do zero sob pressão, exatamente o pior momento pra fazer isso com calma."
                    },
                    {
                        "type": "text",
                        "value": "## Definir o critério antes do incidente, não durante\n\nDecidir, no meio de uma queda de métrica real, se a situação já é grave o suficiente pra justificar um rollback é uma decisão tomada sob pressão, e decisão sob pressão tende a ser pior. O caminho mais seguro é definir com antecedência, junto com o que foi montado no monitoramento do módulo anterior, qual queda de métrica ou qual aumento de erro já é motivo automático pra reverter, sem depender de uma reunião de emergência pra decidir isso na hora."
                    },
                    {
                        "type": "code",
                        "value": "def decidir_promocao(metrica_atual, metrica_candidato, limiar_minimo=0.02):\n    # Só promove se a melhora for maior que um limiar mínimo definido\n    melhora = metrica_candidato - metrica_atual\n    if melhora >= limiar_minimo:\n        return \"promover\"\n    return \"manter_atual\"\n\n\ndef checar_rollback(metrica_pos_deploy, metrica_baseline, queda_maxima=0.03):\n    # Critério definido ANTES do incidente, não decidido durante ele\n    queda = metrica_baseline - metrica_pos_deploy\n    if queda >= queda_maxima:\n        return \"rollback\"\n    return \"seguir_monitorando\""
                    },
                    {
                        "type": "text",
                        "value": "## O ciclo fecha, e recomeça\n\nEste módulo percorreu um loop completo: o monitoramento (módulo anterior) detecta degradação, a pipeline de retreino automatizada gera um candidato com dados novos, esse candidato é versionado e registrado, passa por validação offline e, dependendo do risco, por shadow deployment ou teste A/B, e só então é promovido ou descartado. Se algo passar despercebido por todas essas etapas, o rollback é a rede de segurança final. E assim que um modelo, novo ou revertido, está no ar, o monitoramento volta a acompanhá-lo, fechando o loop de novo. É esse loop, não uma linha reta do treino até o deploy, que o módulo 1 chamou de ciclo de vida do modelo, e é esse loop que sustenta um modelo em produção por anos, não por semanas."
                    },
                    {
                        "type": "quote",
                        "value": "Rollback rápido não é admitir derrota: é a peça que permite arriscar um modelo novo sabendo que dá pra voltar atrás sem drama."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa fazer rollback de um modelo em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Voltar a usar a versão anterior do modelo depois de perceber que a nova piorou o resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Retreinar o modelo do zero usando um conjunto de dados totalmente diferente do original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajustar manualmente os parâmetros do modelo atual sem trocar nenhum arquivo salvo antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excluir de forma permanente todas as versões antigas depois de validar a mais nova.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a prática de rollback depende diretamente de ter versionado modelos, dados e o ambiente de execução?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque só dá pra voltar rápido a uma versão anterior se ela ainda existir, pronta pra usar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque rollback é uma etapa opcional que só faz sentido em empresas com model registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem versionamento o modelo novo nunca chega a ser promovido pra produção de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o rollback recalcula as métricas do modelo antigo usando os dados mais recentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo recém-promovido começa a piorar métricas de negócio poucas horas depois do deploy. Qual costuma ser a resposta mais rápida e segura, antes de investigar a causa raiz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fazer rollback pra versão anterior, já conhecida como estável, e investigar com calma depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Iniciar um retreino imediatamente, na esperança de a próxima versão corrigir sozinha o problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a fração de tráfego enviada ao modelo novo, pra coletar mais dado sobre o problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar a API de previsão por completo até identificar a causa exata do problema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe só decide, no meio de um incidente em produção, qual queda de métrica seria grave o bastante pra justificar um rollback. Qual problema essa forma de decidir traz?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A decisão fica sujeita à pressão do momento, quando o ideal é ter esse critério definido antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rollback não pode ser feito de jeito nenhum sem aprovação prévia de toda a engenharia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse tipo de decisão só vale se o modelo tiver sido treinado com um model registry ativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A métrica de negócio usada na decisão deixa de ser confiável assim que o incidente começa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Colocando em ordem o que este módulo descreveu, depois que o monitoramento aponta degradação, qual sequência reflete melhor o caminho até a decisão final sobre o modelo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Retreinar com dados novos, versionar o candidato, validar contra o atual e então decidir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Versionar o modelo atual, aplicar rollback preventivo e só depois considerar um retreino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Promover o candidato direto pra produção, validar com tráfego real e só depois versionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar o modelo atual isoladamente, aplicar shadow deployment nele e descartar o histórico.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Ética e IA responsável",
        "aulas": [
            {
                "titulo": "Viés nos dados e no modelo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Viés nos dados e no modelo\n\nNos últimos módulos você levou um modelo do notebook até virar um serviço de verdade: salvou o treino com `joblib`, expôs uma previsão numa API, empacotou tudo num container Docker, monitorou o drift e aprendeu quando retreinar. Falta uma pergunta que atravessa cada uma dessas etapas e que nenhuma linha de código resolve sozinha: o que esse modelo faz com a vida de quem ele decide sobre?\n\nUm modelo de crédito que nega um empréstimo, um modelo de contratação que descarta um currículo, um modelo de reincidência que pesa numa sentença judicial: nesses casos, uma previsão automatizada tem consequência real pra uma pessoa real. Este módulo é sobre isso, começando pelo ponto de partida de boa parte das decisões injustas de um modelo: o viés que ele aprendeu do próprio dado."
                    },
                    {
                        "type": "text",
                        "value": "## O modelo aprende o que está no dado, inclusive o preconceito\n\nNa trilha de Machine Learning na Prática você já viu a diferença entre ruído e viés nos dados: ruído é variação aleatória, que o modelo aprende a ignorar com dado suficiente; viés é sistemático, um padrão consistente que o modelo aprende como se fosse regra. Um modelo treinado em dado enviesado não fica neutro por acaso, ele reproduz exatamente o padrão que recebeu, só que agora automatizado, aplicado em escala e com a aparência de objetividade de um número.\n\nEsse é o ponto central deste módulo: a maior parte do viés de um modelo de machine learning não vem de o algoritmo ser malicioso. Vem de dado histórico que já carregava uma desigualdade antes de qualquer linha de código existir. O modelo só aprendeu o que estava lá."
                    },
                    {
                        "type": "text",
                        "value": "## Três portas de entrada do viés\n\nO viés não entra num modelo de um jeito só. Vale separar em três origens, porque cada uma pede um tipo diferente de atenção:\n\n- **Pelos dados de treino**: o histórico usado pra treinar já reflete uma desigualdade social ou institucional anterior ao modelo. Décadas de concessão de crédito que favoreceram certos bairros, por exemplo, viram dado de treino \"normal\" pro próximo modelo de crédito.\n- **Pelas features**: uma variável aparentemente neutra funciona como *proxy* de um atributo protegido, carregando essa informação de forma indireta. CEP, nome ou escola de origem podem estar fortemente correlacionados com raça, gênero ou classe social, mesmo sem usar nenhuma dessas colunas diretamente.\n- **Pelo rótulo**: o alvo que o modelo tenta prever é, na origem, um julgamento humano subjetivo. Uma nota de desempenho dada por um gestor, uma decisão de aprovação tomada por um analista: se esse julgamento já era enviesado, o modelo aprende a replicar o viés como se fosse a própria definição de \"certo\"."
                    },
                    {
                        "type": "text",
                        "value": "## Casos reais\n\nDois casos amplamente documentados ajudam a tirar isso do abstrato.\n\nEm contratação, ficou conhecido o caso de uma ferramenta interna de triagem de currículos que uma grande empresa de tecnologia (a Amazon) chegou a testar e depois abandonou. O modelo foi treinado com cerca de dez anos de currículos recebidos pela empresa, majoritariamente de homens, reflexo do próprio setor de tecnologia. O sistema aprendeu a rebaixar currículos que continham a palavra \"mulheres\" (como em \"capitã do time de xadrez feminino\") e penalizava graduadas de faculdades exclusivamente femininas. Ninguém programou essa regra de propósito: o modelo aprendeu, do próprio histórico, que o perfil \"bom candidato\" parecia mais com quem já tinha sido contratado antes.\n\nEm reincidência criminal, o caso do **COMPAS**, uma ferramenta usada em tribunais dos Estados Unidos pra estimar o risco de um réu voltar a cometer crime, foi investigado pela organização de jornalismo ProPublica em 2016. A investigação encontrou uma assimetria clara: réus de um grupo racial eram marcados como alto risco desproporcionalmente mais vezes do que réus de outro grupo, entre os que de fato não voltaram a cometer crime depois. O modelo não recebia raça como variável de entrada, mas aprendeu, por outras variáveis correlacionadas, um padrão que reproduzia uma desigualdade já presente no sistema de justiça."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fonte do viés\", \"O que acontece\", \"Exemplo\"], [\"Dados de treino\", \"O histórico usado pra treinar já carrega uma desigualdade social ou institucional anterior\", \"Décadas de concessão de crédito que favoreceram certos bairros viram a base de um novo modelo de crédito\"], [\"Features (proxies)\", \"Uma variável aparentemente neutra carrega, na prática, informação sobre um atributo protegido\", \"CEP correlacionado com raça ou renda, mesmo sem usar raça como coluna do modelo\"], [\"Rótulo (o alvo)\", \"O valor usado como verdade é, na origem, um julgamento humano subjetivo\", \"Avaliação de desempenho de gestores usada como alvo pra prever quem é um bom candidato\"], [\"Amostragem\", \"Um grupo aparece pouco, ou de forma não representativa, nos dados coletados\", \"Um sistema de reconhecimento facial treinado majoritariamente com um tipo de rosto erra mais nos demais\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# recorte de um dataset ficticio de concessao de credito\ndf = pd.DataFrame({\n    'grupo': ['A', 'A', 'A', 'B', 'B', 'B', 'A', 'B'],\n    'renda_declarada': [4000, 3500, 6000, 4200, 3800, 5000, 3000, 4500],\n    'credito_aprovado': [1, 1, 1, 0, 1, 1, 0, 0]\n})\n\n# taxa de aprovacao por grupo, com renda em faixa semelhante entre os dois\ntaxa_por_grupo = df.groupby('grupo')['credito_aprovado'].mean()\nprint(taxa_por_grupo)\n# A    0.75\n# B    0.50\n\n# mesma faixa de renda, taxas de aprovacao bem diferentes: isso e um sinal\n# de disparidade que merece investigacao, nao uma prova isolada de causa"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo não inventa preconceito. Ele aprende, com precisão, o padrão que já estava no dado, e devolve isso com a aparência de ser um cálculo neutro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas descreve corretamente por que um modelo de machine learning pode reproduzir um viés social já existente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o modelo aprende os padrões presentes nos dados de treino, incluindo desigualdades históricas registradas neles.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque todo algoritmo de machine learning já vem configurado por padrão pra favorecer um grupo específico da população.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o modelo interpreta as instruções do cientista de dados de forma diferente conforme o grupo analisado no projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a linguagem Python tem funções internas que tratam grupos demográficos de maneira distinta durante o treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco percebe que seu modelo de crédito nega mais pedidos de moradores de um certo CEP, mesmo sem usar raça ou bairro como variável direta no treino. Investigando, a equipe descobre que o CEP está fortemente correlacionado com uma das variáveis usadas. Que tipo de viés melhor descreve esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Viés que entra por uma feature que funciona como proxy de um atributo protegido, mesmo sem usar esse atributo diretamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Viés que entra pelo rótulo, porque o valor de inadimplência foi registrado de forma equivocada pros clientes desse CEP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Viés de amostragem, porque o banco simplesmente coletou poucos dados de clientes que moram nesse CEP específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Viés de ruído, porque o CEP é uma variável de baixa qualidade que atrapalha o treino do modelo de crédito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que se diz que o viés nos dados é sistemático, ao contrário do ruído, que é aleatório?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o viés segue um padrão consistente ligado a um grupo ou contexto, enquanto o ruído varia sem direção fixa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o viés só aparece em variáveis numéricas, enquanto o ruído aparece somente em variáveis categóricas do dataset.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o viés é causado por erro de digitação nos dados, enquanto o ruído vem de falhas nos sensores de coleta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o viés diminui conforme a base de dados cresce, enquanto o ruído aumenta proporcionalmente ao volume coletado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa treina um modelo pra prever bons contratados usando como rótulo a nota de desempenho dada pelos gestores nos últimos dez anos. Historicamente, gestores homens deram notas sistematicamente mais baixas pra subordinadas mulheres em cargos técnicos, mesmo com desempenho equivalente. Qual é o principal risco desse desenho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O rótulo usado como alvo já carrega o viés dos avaliadores, então o modelo aprende a reproduzir esse viés como se fosse mérito real.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo vai ignorar automaticamente o gênero como variável, então esse histórico de notas não deve causar nenhum problema real.",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo escolhido provavelmente não vai convergir direito, porque as notas de desempenho têm uma escala muito subjetiva.",
                                "isCorrect": false
                            },
                            {
                                "text": "O principal risco é o modelo ficar com baixa acurácia geral, já que notas de gestores tendem a ter muito ruído aleatório.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O caso do COMPAS, ferramenta usada em tribunais dos Estados Unidos pra estimar risco de reincidência, mostrou que réus de um grupo racial eram sinalizados como alto risco desproporcionalmente mais vezes do que réus de outro grupo, entre os que não voltaram a cometer crime. Isso é melhor descrito como um problema de:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Viés que se origina no histórico de dados usados pra treinar o modelo, refletindo desigualdades existentes no sistema de justiça.",
                                "isCorrect": true
                            },
                            {
                                "text": "Overfitting do modelo aos dados de treino, o que também explicaria por que a acurácia cai quando ele é usado em produção real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vazamento de dados (data leakage), já que uma variável relacionada ao desfecho futuro teria entrado por engano no treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de amostragem aleatória, corrigível apenas aumentando o tamanho do conjunto de dados usado no treinamento do modelo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fairness: justiça entre grupos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que significa um modelo ser justo?\n\nNa aula anterior você viu como o viés entra num modelo: pelo dado, pelas features ou pelo rótulo. A pergunta natural agora é: como saber se um modelo é justo, ou pelo menos justo o suficiente pra ser usado com responsabilidade? A resposta incomoda quem espera uma fórmula única: **justiça (fairness) não é um conceito técnico só, são vários**, e boa parte deles entra em conflito entre si. Escolher qual definição usar é, em grande parte, uma decisão de valor, não só uma conta."
                    },
                    {
                        "type": "text",
                        "value": "## Paridade demográfica\n\nA definição mais intuitiva é a **paridade demográfica**: a proporção de resultados positivos (aprovações de crédito, currículos selecionados) deve ser parecida entre os grupos comparados, independente do grupo de cada pessoa. Se 60% das candidaturas de um grupo são aprovadas, o outro grupo deveria ficar perto disso também.\n\nO problema é que paridade demográfica ignora o mérito individual: ela pode ser satisfeita mesmo aprovando, num dos grupos, gente com um perfil pior do que reprova no outro grupo, só pra igualar a proporção final. Cumprir essa definição sozinha não garante que o modelo está avaliando as pessoas do mesmo jeito."
                    },
                    {
                        "type": "text",
                        "value": "## Igualdade de oportunidade e paridade preditiva\n\nDuas outras definições tentam corrigir esse ponto:\n\n- **Igualdade de oportunidade**: entre quem realmente merece o resultado positivo (quem pagaria o crédito, quem tem o perfil pro cargo), a taxa de acerto do modelo deve ser parecida entre os grupos. Ela não olha o resultado final, olha o acerto entre quem merecia.\n- **Paridade preditiva**: quando o modelo diz \"alto risco\" ou \"aprovado\", isso deveria significar a mesma coisa, a mesma probabilidade real de acerto, não importa o grupo da pessoa. Uma pontuação de risco de 80% precisa representar o mesmo risco real pra todo mundo.\n\nRepare que as três definições (demográfica, oportunidade, preditiva) respondem perguntas diferentes. Um modelo pode satisfazer uma e violar outra ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Por que as definições entram em conflito\n\nExiste um resultado bem estabelecido na literatura de fairness em machine learning: quando a taxa real do evento (a proporção de quem realmente reincide, realmente paga o crédito) é diferente entre dois grupos, em geral **não dá pra satisfazer paridade preditiva e igualdade nas taxas de erro (falso positivo e falso negativo) ao mesmo tempo**. Não é uma limitação de engenharia que um modelo melhor resolve, é uma restrição matemática.\n\nO próprio caso do COMPAS, da aula anterior, ilustra isso: pesquisadores mostraram que o mesmo modelo podia ser considerado justo por um critério (a pontuação de risco tinha, em média, o mesmo significado preditivo pra cada grupo racial) e injusto por outro (a taxa de erro, sobretudo de falso positivo, era bem diferente entre os grupos). As duas leituras estavam corretas ao mesmo tempo, porque partiam de definições diferentes de justiça."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Definição de justiça\", \"O que exige\", \"Pergunta que responde\"], [\"Paridade demográfica\", \"A proporção de resultados positivos é parecida entre os grupos\", \"Os grupos recebem taxas de aprovação parecidas, independente do mérito individual?\"], [\"Igualdade de oportunidade\", \"Entre quem realmente merece o resultado positivo, a taxa de acerto é parecida entre grupos\", \"Quem merece o crédito tem a mesma chance de ser aprovado, seja qual for o grupo?\"], [\"Paridade preditiva\", \"Uma mesma pontuação de risco significa a mesma coisa, não importa o grupo\", \"Quando o modelo diz alto risco, isso é igualmente confiável pra todo grupo?\"], [\"Cegueira ao atributo\", \"O atributo protegido (raça, gênero) não entra como variável de entrada do modelo\", \"O modelo usa a informação sensível diretamente na conta?\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nfrom sklearn.metrics import confusion_matrix\n\nresultados = pd.DataFrame({\n    'grupo': ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B'],\n    'reincidiu_de_verdade': [0, 0, 1, 1, 0, 0, 1, 1],\n    'previsto_alto_risco':  [0, 1, 1, 1, 1, 1, 1, 0]\n})\n\nfor grupo, dados in resultados.groupby('grupo'):\n    tn, fp, fn, tp = confusion_matrix(\n        dados['reincidiu_de_verdade'], dados['previsto_alto_risco']\n    ).ravel()\n    taxa_falso_positivo = fp / (fp + tn)\n    print(f'grupo {grupo}: taxa de falso positivo = {taxa_falso_positivo:.2f}')\n# grupo A: taxa de falso positivo = 0.50\n# grupo B: taxa de falso positivo = 1.00\n\n# metade dos inocentes do grupo A foi marcada como alto risco;\n# no grupo B, todos os inocentes foram marcados. um sinal de\n# desigualdade no erro, nao so no resultado final"
                    },
                    {
                        "type": "quote",
                        "value": "Não existe uma única fórmula de justiça. Existem definições diferentes, às vezes incompatíveis entre si, e escolher qual pesa mais numa decisão específica é trabalho de gente, não só de matemática."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a definição de paridade demográfica exige de um modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que a proporção de resultados positivos, como aprovações, seja parecida entre os diferentes grupos avaliados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo utilize exatamente as mesmas variáveis de entrada pra todos os grupos presentes na base de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a acurácia geral do modelo, somando todos os grupos juntos, ultrapasse noventa por cento nos testes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o modelo seja treinado com o mesmo número de exemplos de cada grupo presente no conjunto de dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa afirma que seu modelo de seleção de currículos é justo porque a taxa de aprovação final é igual entre homens e mulheres. Um pesquisador argumenta que isso não basta, porque entre quem realmente tinha o perfil desejado, mulheres foram aprovadas numa taxa bem menor que homens. A que definição de justiça o pesquisador está recorrendo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Igualdade de oportunidade, que olha a taxa de acerto entre quem merece o resultado positivo em cada grupo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Paridade demográfica, que exige que a proporção final de aprovados seja idêntica entre os grupos comparados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cegueira ao atributo, que exige que o gênero nunca apareça como variável de entrada usada pelo modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Paridade preditiva, que exige que a pontuação de risco tenha o mesmo significado estatístico pra cada grupo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que medir apenas a acurácia geral de um modelo pode esconder um problema de fairness entre grupos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a acurácia mistura os grupos e pode ficar alta mesmo com taxas de erro bem diferentes entre eles.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a acurácia é uma métrica que só existe pra problemas de regressão, não pra classificação binária comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a acurácia sempre aumenta de forma artificial quando o conjunto de teste tem grupos demográficos distintos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a acurácia não pode ser calculada quando a base de dados contém mais de um grupo protegido junto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "É bem estabelecido que, quando a taxa real do evento (a base rate) é diferente entre dois grupos, um modelo em geral não consegue satisfazer ao mesmo tempo paridade preditiva e igualdade nas taxas de falso positivo e falso negativo entre esses grupos. O que essa conclusão implica na prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que é preciso escolher qual definição priorizar, já que atender todas elas ao mesmo tempo costuma ser impossível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que nenhuma métrica de justiça deveria ser usada, já que todas elas sempre entram em conflito matemático entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o problema se resolve sempre aumentando bastante o tamanho da base de treino usada no treinamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a paridade preditiva é a única definição válida, já que as outras dependem de suposições estatísticas frágeis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de concessão de crédito tem taxa de aprovação parecida entre dois grupos, satisfazendo paridade demográfica, mas a taxa de falso positivo (aprovar quem depois fica inadimplente) é bem maior num dos grupos. Qual conclusão é mais correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo pode parecer justo por um critério e injusto por outro, já que paridade demográfica não garante taxas de erro iguais.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo certamente tem um bug de implementação, já que satisfazer paridade demográfica deveria igualar as demais métricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença na taxa de falso positivo não tem relação nenhuma com fairness, é apenas uma variação normal do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta reduzir o threshold de decisão pra zero que as taxas de falso positivo dos dois grupos vão se igualar automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Transparência e explicabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que uma caixa-preta é arriscada\n\nLá na trilha de Machine Learning na Prática você comparou modelos interpretáveis por natureza (regressão, árvore rasa) com modelos do tipo caixa-preta (random forest, boosting, redes neurais), e usou `feature_importances_`, permutation importance e SHAP pra abrir o que um ensemble complexo estava fazendo. Naquele contexto, o motivo era sobretudo técnico: entender o modelo pra melhorá-lo ou confiar nele.\n\nEm decisões que afetam gente, esse motivo ganha um peso ético e, muitas vezes, legal. Um modelo que nega crédito, recusa um currículo ou sinaliza um réu como alto risco, e que ninguém consegue explicar, tem um problema sério: não dá pra verificar se aquela decisão está correta, e não dá pra flagrar o viés da Aula 1 escondido numa feature-proxy se ninguém consegue olhar o que pesou na conta."
                    },
                    {
                        "type": "text",
                        "value": "## O direito à explicação\n\nNo Brasil, a LGPD (que você vê em detalhe na próxima aula) garante ao titular dos dados o direito de solicitar revisão de decisões tomadas unicamente com base em tratamento automatizado, incluindo perfis pessoais, profissionais, de consumo e de crédito. Na prática, isso significa que uma pessoa recusada por um modelo pode pedir informações claras sobre os critérios usados naquela decisão.\n\nEsse tipo de exigência não é exclusividade brasileira, aparece em diferentes formas em várias legislações de proteção de dados mundo afora. O ponto em comum é sempre o mesmo: quanto mais uma decisão automatizada afeta a vida de alguém, menos aceitável é que ela venha de uma caixa-preta que nem quem construiu consegue explicar direito."
                    },
                    {
                        "type": "text",
                        "value": "## Interpretabilidade a serviço da confiança\n\nO caso do COMPAS, citado na Aula 1, também tinha um componente de transparência: o método exato usado pra calcular o escore de risco era proprietário, e réus e advogados não conseguiam examinar como aquele número específico tinha sido calculado pra um caso concreto. Isso virou parte central da crítica ao sistema, além da disparidade de erro entre grupos vista na Aula 2.\n\nÉ exatamente aí que a interpretabilidade entra a serviço da confiança, não só da curiosidade técnica: `feature_importances_` e permutation importance mostram o que o modelo usa mais, em média, considerando todos os exemplos; SHAP mostra por que uma pessoa específica recebeu aquela previsão específica. As duas perguntas são diferentes, e decisões sensíveis costumam exigir a segunda: não \"o que o modelo valoriza no geral\", mas \"por que esse caso, especificamente, saiu assim\"."
                    },
                    {
                        "type": "code",
                        "value": "from fastapi import FastAPI\nfrom pydantic import BaseModel\nimport joblib\nimport pandas as pd\nimport shap\n\napp = FastAPI()\nmodelo = joblib.load('modelo_credito.pkl')\nexplicador = shap.TreeExplainer(modelo)\n\nclass PedidoCredito(BaseModel):\n    renda_mensal: float\n    idade: int\n    tempo_de_emprego_anos: float\n\n@app.post('/prever')\ndef prever(pedido: PedidoCredito):\n    entrada = pd.DataFrame([pedido.dict()])\n    probabilidade = modelo.predict_proba(entrada)[0][1]\n\n    valores_shap = explicador.shap_values(entrada)\n    contribuicoes = pd.Series(valores_shap[0], index=entrada.columns)\n    principais_motivos = contribuicoes.reindex(\n        contribuicoes.abs().sort_values(ascending=False).index\n    ).head(3)\n\n    return {\n        'probabilidade_inadimplencia': float(probabilidade),\n        'principais_fatores': principais_motivos.to_dict()\n    }\n# a API do Modulo 2 devolve a previsao; aqui ela devolve\n# tambem o motivo, pronta pra sustentar o direito a explicacao"
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que você quer explicar\", \"Técnica\", \"Pergunta que responde\"], [\"O modelo inteiro, em média\", \"Importância de features ou permutation importance\", \"Quais variáveis o modelo mais usa, no geral?\"], [\"Uma previsão específica\", \"SHAP (ou LIME)\", \"Por que essa pessoa, especificamente, recebeu essa previsão?\"], [\"A estrutura do modelo direto\", \"Modelo interpretável por natureza (regressão, árvore rasa)\", \"Dá pra ler a conta ou o caminho de decisão sem ferramenta extra?\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Explicação não é desculpa\n\nVale uma honestidade: ter uma explicação não torna a decisão automaticamente certa. Um SHAP bem calculado pode mostrar, com clareza, que uma feature-proxy enviesada foi o principal motivo de uma previsão, e isso não conserta nada sozinho. Explicabilidade é uma ferramenta de auditoria, não um selo de qualidade: ela te dá a chance de encontrar o problema. Corrigir o problema (revisar a feature, reponderar o treino, às vezes descartar o modelo) continua sendo trabalho de gente."
                    },
                    {
                        "type": "quote",
                        "value": "Uma explicação não torna a decisão certa, mas sem explicação nenhuma nem dá pra descobrir que ela estava errada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que um modelo do tipo caixa-preta é considerado mais arriscado em decisões sensíveis, como negar um crédito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque fica mais difícil verificar se a decisão automatizada é justa quando ninguém consegue explicar o motivo dela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque modelos caixa-preta sempre têm acurácia pior do que modelos simples, como regressão linear ou logística comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque modelos caixa-preta são bem mais lentos pra treinar, o que atrasa o processo inteiro de decisão de crédito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque modelos caixa-preta exigem uma infraestrutura de servidor bem mais cara pra rodar direito em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença central entre usar feature_importances_ e usar SHAP pra explicar um modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "feature_importances_ resume o modelo inteiro em média, enquanto SHAP explica o motivo de uma previsão específica.",
                                "isCorrect": true
                            },
                            {
                                "text": "feature_importances_ funciona só em redes neurais, enquanto SHAP funciona apenas em árvores de decisão simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "feature_importances_ precisa do conjunto de teste, enquanto SHAP é calculado inteiramente nos dados de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "feature_importances_ mede correlação entre variáveis, enquanto SHAP mede exclusivamente variáveis numéricas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No contexto da LGPD, o que significa, na prática, o direito à explicação sobre uma decisão automatizada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A pessoa pode pedir informações claras sobre os critérios usados numa decisão automatizada que afetou ela.",
                                "isCorrect": true
                            },
                            {
                                "text": "A empresa é obrigada a publicar o código-fonte completo do modelo em um repositório público de acesso livre.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo precisa ser trocado por um sistema totalmente manual sempre que uma decisão automatizada é questionada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A pessoa afetada ganha automaticamente o direito de treinar seu próprio modelo com os dados usados pela empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide expor, junto com cada previsão da API, os três fatores que mais pesaram naquela previsão específica, calculados com SHAP. Isso resolve completamente um eventual viés aprendido pelo modelo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: a explicação ajuda a investigar e flagrar um viés, mas não corrige sozinha um padrão injusto aprendido dos dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque SHAP recalcula a previsão sem o viés presente nos dados originais usados no treinamento do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque qualquer modelo explicado por SHAP deixa automaticamente de usar variáveis que funcionam como proxy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque SHAP só funciona em modelos de regressão linear, tornando a explicação inválida pra outros algoritmos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma árvore de decisão rasa e um ensemble de boosting com centenas de árvores atingem desempenho parecido num problema de crédito. Sob o critério de transparência, qual argumento a favor da árvore rasa é mais correto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A árvore rasa permite ler o caminho de decisão direto, sem depender de uma ferramenta extra de explicação como SHAP.",
                                "isCorrect": true
                            },
                            {
                                "text": "A árvore rasa é sempre mais precisa que um ensemble de boosting quando o conjunto de dados é grande o bastante.",
                                "isCorrect": false
                            },
                            {
                                "text": "A árvore rasa elimina completamente a necessidade de monitorar o modelo depois que ele entra em produção real.",
                                "isCorrect": false
                            },
                            {
                                "text": "A árvore rasa nunca aprende um viés presente nos dados, ao contrário dos modelos do tipo ensemble mais complexos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Privacidade e LGPD",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dado de treino é, muitas vezes, dado de gente\n\nTodo o percurso deste módulo até aqui girou em torno da decisão que o modelo toma. Esta aula olha um passo antes: o dado que ensinou o modelo a decidir. Boa parte dos modelos usados na prática (crédito, saúde, comportamento de usuário, recrutamento) é treinada em cima de dado pessoal, informação que identifica ou pode identificar uma pessoa específica. Isso vale desde a coleta e o treino até os logs de previsão que você aprendeu a guardar no Módulo 4, pra monitorar o modelo em produção."
                    },
                    {
                        "type": "text",
                        "value": "## A LGPD, em resumo\n\nNo Brasil, quem regula o tratamento de dados pessoais é a **LGPD** (Lei Geral de Proteção de Dados, Lei 13.709/2018). Ela parte de alguns princípios que valem tanto pra um sistema comum quanto pra um pipeline de machine learning: **finalidade** (usar o dado só pro propósito informado), **necessidade** (coletar o mínimo possível pra cumprir esse propósito, o princípio da minimização), **consentimento** (a pessoa autorizou aquele uso) e **transparência** (a pessoa sabe o que está sendo feito com o dado dela). Quem fornece o dado é o **titular**, que tem direitos como acessar, corrigir e até apagar o que foi coletado sobre ele; a **ANPD** (Autoridade Nacional de Proteção de Dados) fiscaliza o cumprimento da lei.\n\nA lei também define uma categoria mais delicada, o **dado pessoal sensível** (origem racial ou étnica, convicção religiosa, opinião política, filiação sindical, dado de saúde, dado genético ou biométrico, orientação sexual). Não por acaso, é quase a mesma lista de atributos protegidos que aparece na conversa sobre viés e fairness deste módulo: usar esse tipo de dado, direta ou indiretamente, num modelo pede cuidado redobrado, tanto ético quanto legal."
                    },
                    {
                        "type": "text",
                        "value": "## Minimização, anonimização e pseudonimização\n\nTrês práticas ajudam a reduzir o risco de lidar com dado pessoal num projeto de machine learning:\n\n- **Minimização**: coletar e manter só o dado necessário pro propósito declarado. Se o modelo não precisa do nome completo pra treinar, o nome completo não precisa estar no dataset de treino.\n- **Pseudonimização**: trocar um identificador direto (nome, CPF) por um código, mantendo a possibilidade de reverter essa troca com uma chave guardada à parte. O dado continua sendo, tecnicamente, dado pessoal pra LGPD, porque a ligação com a pessoa ainda existe, só que indireta.\n- **Anonimização**: remover a ligação com a pessoa de um jeito que não dá pra reverter. Um dado verdadeiramente anônimo deixa, em tese, de ser regulado como dado pessoal, porque não identifica mais ninguém."
                    },
                    {
                        "type": "text",
                        "value": "## O risco da reidentificação\n\nAnonimizar de verdade é mais difícil do que parece. Remover nome e CPF de uma base não é suficiente se sobrarem outras colunas específicas o bastante: pesquisas acadêmicas mostraram, repetidas vezes, que cruzar poucos atributos aparentemente inofensivos, como data de nascimento, gênero e CEP, já é o bastante pra identificar uma fração enorme da população de forma praticamente única. Cruzar um dataset \"anonimizado\" com outra base pública disponível é outro caminho clássico de reidentificação.\n\nPra um cientista de dados, a lição prática é: anonimização não é um checkbox de \"removi nome e CPF\", é uma pergunta que precisa ser feita de novo a cada combinação de colunas que sobra no dataset."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport hashlib\n\nclientes = pd.DataFrame({\n    'cpf': ['111.222.333-44', '555.666.777-88'],\n    'nome': ['Maria Silva', 'Joao Souza'],\n    'data_nascimento': ['1990-04-12', '1985-11-30'],\n    'renda_mensal': [4200, 6800]\n})\n\ndef pseudonimizar(valor):\n    # hash irreversivel sem a entrada original, mas o mesmo cpf\n    # sempre gera o mesmo codigo, permitindo rastreio interno\n    return hashlib.sha256(valor.encode()).hexdigest()[:12]\n\nclientes['id_pseudonimo'] = clientes['cpf'].apply(pseudonimizar)\n\n# minimizacao: faixa etaria em vez de data de nascimento exata,\n# sem nome e sem cpf no dataset que vai treinar o modelo\nclientes['ano_nascimento'] = pd.to_datetime(clientes['data_nascimento']).dt.year\nclientes['faixa_etaria'] = pd.cut(\n    2026 - clientes['ano_nascimento'],\n    bins=[0, 25, 40, 60, 120],\n    labels=['ate_25', '26_a_40', '41_a_60', '60_mais']\n)\n\ndataset_treino = clientes[['id_pseudonimo', 'faixa_etaria', 'renda_mensal']]\nprint(dataset_treino)\n#   id_pseudonimo faixa_etaria  renda_mensal\n# 0  a1b2c3d4e5f6      26_a_40          4200\n# 1  9f8e7d6c5b4a      41_a_60          6800"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Pseudonimização\", \"Anonimização\"], [\"Reversível?\", \"Sim, com uma chave ou tabela separada guardada por alguém\", \"Não, a ligação com a pessoa é destruída de propósito\"], [\"Ainda é dado pessoal pra LGPD?\", \"Sim, continua sujeito à lei enquanto a reversão for possível\", \"Só deixa de ser, se a reidentificação for realmente inviável\"], [\"Risco principal\", \"A chave vazar ou ser cruzada com outra base de dados\", \"Reidentificação por cruzamento com outras bases públicas\"], [\"Uso típico em ciência de dados\", \"Manter rastreabilidade interna sem expor identidade direta\", \"Publicar ou compartilhar um dataset de forma mais ampla\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Tirar o nome de uma planilha não é a mesma coisa que tirar a pessoa dela. Quantas colunas sobram, e o quanto elas se cruzam com outras bases, importa tanto quanto qual coluna foi removida."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a LGPD regula?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tratamento de dados pessoais por empresas e órgãos públicos no Brasil, incluindo coleta, uso e armazenamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Exclusivamente o uso de inteligência artificial em processos de contratação e concessão de crédito no Brasil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o armazenamento de senhas e credenciais de acesso usadas em sistemas de informação no Brasil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente o compartilhamento internacional de dados entre empresas brasileiras e empresas de outros países.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença central entre pseudonimização e anonimização de um dado pessoal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pseudonimização pode ser revertida por quem guarda a chave, enquanto anonimização de verdade destrói essa ligação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pseudonimização remove o dado da base por completo, enquanto anonimização apenas criptografa o valor original dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pseudonimização é usada só em dados numéricos, enquanto anonimização é usada apenas em dados de texto livre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pseudonimização é proibida pela LGPD, enquanto anonimização é a única forma legal de tratar dado pessoal sensível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que se diz que anonimizar dados de verdade é mais difícil do que parece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cruzar um dado supostamente anônimo com outras bases disponíveis pode reidentificar a pessoa por trás dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a legislação brasileira exige uma certificação internacional cara pra qualquer processo de anonimização de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nenhuma técnica de anonimização consegue remover nomes e CPFs de um conjunto de dados estruturado como planilha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque anonimizar sempre exige treinar um segundo modelo de machine learning só pra validar o processo aplicado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados remove nome e CPF de uma base antes de compartilhar com outra equipe, mas mantém data de nascimento exata, CEP completo e gênero. Por que essa base ainda pode representar risco de reidentificação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque combinar poucos atributos aparentemente inofensivos já costuma bastar pra identificar uma pessoa quase sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque data de nascimento, CEP e gênero são, por definição legal, sempre classificados como dado pessoal sensível pela LGPD.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque remover nome e CPF não é, sozinho, uma técnica reconhecida de anonimização, apenas de pseudonimização reversível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque qualquer dataset compartilhado entre equipes da mesma empresa já é considerado vazamento pela legislação vigente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto quer treinar um modelo de risco de saúde usando, entre outras variáveis, o histórico de diagnósticos dos pacientes. Sob a ótica da LGPD, o que caracteriza esse uso como especialmente delicado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dado de saúde é classificado como dado pessoal sensível, o que exige uma base legal e cuidados bem mais rígidos pra tratá-lo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dados de saúde não podem, em nenhuma hipótese, ser usados pra treinar modelos de machine learning no território brasileiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A LGPD não se aplica a dados de saúde, que são regulados exclusivamente por normas específicas do setor médico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelos de risco de saúde são proibidos por lei, independentemente de qual dado pessoal seja usado no treinamento deles.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A responsabilidade do cientista de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Construir é uma escolha, não um destino\n\nAs últimas quatro aulas trataram de viés, justiça, transparência e privacidade como problemas técnicos, com técnica pra medir, mitigar e documentar cada um. Esta última aula do módulo trata de uma camada anterior a todas as técnicas: a decisão de construir ou não construir. Ter a capacidade de treinar um modelo pra alguma coisa não é o mesmo que ter a obrigação de treinar. Parte do trabalho de cientista de dados é reconhecer essa diferença, antes do primeiro `fit()`."
                    },
                    {
                        "type": "text",
                        "value": "## Pensar no impacto antes de construir\n\nAntes de começar um projeto, vale perguntar: quem é afetado por essa decisão automatizada, e o que acontece quando o modelo erra? As aulas anteriores já mostraram que o custo de um erro não é igual pra todo mundo: negar um crédito bom (falso negativo) tem um custo diferente de aprovar um crédito ruim (falso positivo), e esse custo recai sobre pessoas diferentes. Pensar nisso antes de treinar o primeiro modelo, não depois que ele já está em produção, é o que separa um projeto responsável de um projeto que só descobre o problema quando alguém reclama."
                    },
                    {
                        "type": "text",
                        "value": "## Envolver quem é afetado\n\nTimes que constroem um modelo sozinhos, sem ouvir quem vai ser avaliado por ele, tendem a ter pontos cegos. Envolver quem é afetado, ou pelo menos ouvir quem representa esse grupo, antes do modelo ir pro ar ajuda a enxergar riscos que não aparecem numa métrica de validação. O mesmo vale dentro do próprio time: um grupo de pessoas com vivências parecidas tem mais chance de deixar passar um viés que pareceria óbvio pra alguém de fora daquele grupo."
                    },
                    {
                        "type": "text",
                        "value": "## Documentar limites e riscos\n\nTodo modelo tem um contexto em que foi treinado e validado, e fora desse contexto ele pode simplesmente não funcionar direito. Documentar isso (em que população o modelo foi validado, que grupos estão sub-representados no dado, que tipo de erro ele comete mais) não é burocracia: é o que impede alguém, meses depois, de aplicar o modelo num cenário pra que ele nunca foi pensado. Um modelo sem essa documentação vira uma caixa-preta mesmo quando é tecnicamente simples de explicar."
                    },
                    {
                        "type": "text",
                        "value": "## Saber dizer não\n\nÀs vezes o pedido mais responsável que um cientista de dados faz é recusar. Um uso que discrimina de propósito, que vigia gente sem necessidade real, que usa dado sensível sem base legal, ou que aplica um modelo fora do contexto documentado em que ele foi validado: nesses casos, o trabalho certo é questionar, registrar a objeção e, se for o caso, dizer não, do mesmo jeito que qualquer outra profissão com responsabilidade técnica sobre o que constrói."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"O que significa na prática\"], [\"Justiça (fairness)\", \"Medir e reduzir a disparidade de erro e de resultado entre os grupos afetados pelo modelo\"], [\"Transparência\", \"Ser capaz de explicar os critérios e os motivos por trás de uma decisão automatizada\"], [\"Privacidade\", \"Coletar e usar só o dado pessoal necessário, com consentimento e proteção adequada\"], [\"Responsabilização\", \"Existir alguém, ou uma equipe, que responde pelas decisões do modelo em produção\"], [\"Segurança e robustez\", \"O modelo se comportar de forma previsível, inclusive diante de dado inesperado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Ter a capacidade técnica de construir alguma coisa não é a mesma coisa que ter a obrigação de construir. Saber a diferença é, tanto quanto qualquer técnica deste módulo, parte do trabalho de cientista de dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas melhor descreve por que documentar os limites de um modelo é uma prática importante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque ajuda quem for usar o modelo depois a não aplicá-lo fora do contexto em que ele foi treinado e validado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque é uma exigência técnica do scikit-learn pra permitir que o modelo seja salvo com joblib corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aumenta automaticamente a acurácia do modelo quando ele é usado em produção no dia a dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque substitui a necessidade de monitorar o modelo depois que ele entra em produção de verdade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados é solicitado a construir um modelo pra prever, com base em dados comportamentais, um atributo sensível de usuários de um aplicativo, sem relação com nenhuma funcionalidade declarada a eles. Qual atitude está mais alinhada com a responsabilidade profissional deste módulo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Questionar e recusar o pedido, já que o uso proposto é invasivo e não tem uma finalidade legítima declarada ao usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Construir o modelo normalmente, já que a decisão sobre o uso ético do resultado cabe sempre à liderança da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Construir o modelo, mas treinar com menos dados do que o disponível, pra reduzir parcialmente a precisão da previsão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Construir o modelo e sugerir que ele só seja usado internamente pela equipe técnica, sem informar o restante da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que envolver pessoas afetadas pelo modelo, ou perspectivas diferentes dentro do time, ajuda a reduzir risco ético num projeto de machine learning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque aumenta a chance de perceber, cedo, um impacto negativo que a equipe não teria enxergado sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque é uma exigência formal da LGPD pra qualquer empresa que treine modelos de machine learning no Brasil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque reduz o tempo de treinamento do modelo, já que mais pessoas revisando aceleram o processo do fit().",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque garante, de forma automática, que o modelo final vai ter uma acurácia mais alta no conjunto de teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe percebe, já em produção, que seu modelo de triagem de currículos aprendeu a penalizar candidatos de uma certa faculdade, que coincide em ser majoritariamente frequentada por um grupo específico. O prazo está apertado e a liderança pede pra manter o modelo no ar enquanto se investiga com calma. Qual ação está mais alinhada com a responsabilidade tratada neste módulo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Argumentar pela pausa ou ajuste do modelo, já que manter uma decisão automatizada com viés conhecido tem custo real.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o modelo no ar sem alteração, já que interromper um sistema em produção é sempre a decisão de maior risco técnico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a variável de faculdade do modelo já em produção sem revalidar, já que isso resolve o problema de forma imediata.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aguardar o ciclo normal de retreino programado, já que o processo de monitoramento vai capturar o problema com o tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das afirmações abaixo melhor resume a ideia de que ter a capacidade técnica de construir não é o mesmo que ter a obrigação de construir?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Saber implementar um modelo não substitui avaliar se aquele uso específico é justificável e responsável do ponto de vista ético.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todo modelo tecnicamente viável deve ser implementado, já que a decisão ética cabe exclusivamente a quem contrata o serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelos com alta acurácia têm, por definição, uso ético garantido, independente da finalidade que motivou sua construção.",
                                "isCorrect": false
                            },
                            {
                                "text": "A responsabilidade ética de um projeto de machine learning termina assim que o contrato entre as partes é formalmente assinado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Fechando o roadmap: você é cientista de dados",
        "aulas": [
            {
                "titulo": "O mapa completo (recap dos 9 estágios)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O mapa completo: revendo o roadmap inteiro\n\nVocê chegou ao último módulo da última trilha do roadmap de Ciência de Dados. Nos seis módulos anteriores desta trilha, aprendeu a tirar um modelo do notebook: salvar com `joblib`, servir previsão numa API, empacotar tudo num container Docker, monitorar o modelo em produção, retreinar quando ele envelhece e pensar na responsabilidade de cada decisão automatizada. Isso fecha a última peça de um caminho bem mais longo.\n\nAntes de fechar de vez, vale abrir o mapa inteiro e olhar pra trás. São nove estágios, começando lá na lógica de programação e terminando aqui, num modelo em produção de verdade. Cada um ensinou uma habilidade diferente, e nenhum deles sozinho faz um cientista de dados. É a soma das nove peças que faz."
                    },
                    {
                        "type": "text",
                        "value": "## Programar: a base que sustenta tudo\n\nOs dois primeiros estágios, lógica de programação e Python, não pareciam ter muito a ver com \"ciência de dados\" quando você começou. Eram só variável, condicional, laço, função, lista, dicionário. Mas sem essa base, não tem como escrever a query que busca os dados, o script que limpa uma tabela ou a função que serve uma previsão. Toda linha de código escrita nas trilhas seguintes, de um `df.groupby()` a um endpoint de API, se apoia nesses dois primeiros estágios. Programar não é uma habilidade separada da ciência de dados: é o alicerce dela."
                    },
                    {
                        "type": "text",
                        "value": "## Pensar em dados: estatística como base quantitativa\n\nO terceiro estágio, estatística e probabilidade, trocou o \"eu acho que esse padrão é real\" por um jeito de checar isso com rigor: distribuição, correlação, intervalo de confiança, teste de hipótese. Essa forma de pensar reapareceu depois, de decidir se uma queda de métrica é ruído ou sinal real até avaliar se um modelo novo é de fato melhor que o atual antes de trocar um pelo outro em produção, como você viu no Módulo 5 desta trilha. Estatística não ficou pra trás quando o roadmap ficou mais técnico: ela é a régua que mede se qualquer resultado é confiável."
                    },
                    {
                        "type": "text",
                        "value": "## Domar e comunicar: pandas, SQL e visualização\n\nOs três estágios seguintes, análise de dados com pandas, SQL e bancos de dados, e visualização e análise exploratória, resolvem o que ocupa boa parte do tempo de um cientista de dados de verdade (a próxima aula entra nesse detalhe): trazer o dado de onde ele mora, limpar o que chega sujo, e transformar tabela em entendimento, seja pra você mesmo ou pra alguém que nunca escreveu uma linha de código. Um modelo não nasce de imaginação: nasce de um `SELECT` bem escrito, um `merge` sem duplicar linha à toa, e um gráfico que mostra o padrão certo pra pessoa certa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estágio do roadmap\",\"Peça do trabalho real\"],[\"Lógica de programação\",\"Programar: pensar no algoritmo antes de qualquer linha de código\"],[\"Python\",\"Programar: a linguagem que executa a lógica e manipula dado\"],[\"Estatística e probabilidade\",\"Pensar em dados: raciocínio quantitativo e rigor sobre o que é real\"],[\"Análise de dados com pandas\",\"Domar dados: limpar, organizar e preparar as tabelas\"],[\"SQL e bancos de dados\",\"Domar dados: buscar e combinar dado onde ele realmente mora\"],[\"Visualização e análise exploratória\",\"Ver e comunicar: enxergar padrão e explicar pra quem não é técnico\"],[\"Machine learning\",\"Modelar: treinar e avaliar os primeiros algoritmos que aprendem dos dados\"],[\"Machine learning na prática\",\"Modelar: ir além do básico, com ensemble, tuning e pipeline robusto\"],[\"Do Modelo ao Produto\",\"Entregar: servir, empacotar, monitorar e manter o modelo vivo em produção\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# um jeito (bem resumido) de ver o roadmap inteiro numa função só\nimport pandas as pd\nfrom sklearn.linear_model import LogisticRegression\nimport joblib\n\n# SQL e bancos de dados: os dados moram num banco relacional, não numa planilha pronta\nconsulta = \"\"\"\n    SELECT c.idade, c.renda_mensal, p.categoria, p.comprou\n    FROM clientes c\n    JOIN pedidos p ON p.cliente_id = c.id\n\"\"\"\ndados = pd.read_sql(consulta, conexao)  # conexao: a conexão com o banco, já aberta\n\n# pandas: domar o que a consulta trouxe\ndados = dados.dropna()\ndados = pd.get_dummies(dados, columns=[\"categoria\"])\n\n# machine learning e ML na prática: modelar\nX = dados.drop(columns=\"comprou\")\ny = dados[\"comprou\"]\nmodelo = LogisticRegression()\nmodelo.fit(X, y)\n\n# Do Modelo ao Produto: entregar\njoblib.dump(modelo, \"modelo_treinado.pkl\")\n# a partir daqui, uma API carrega esse arquivo e serve previsão pra quem precisar\nprint(\"pipeline completo: do SELECT ao modelo salvo\")"
                    },
                    {
                        "type": "quote",
                        "value": "Nove estágios, uma jornada só: cada um ensinou uma peça, e é a soma delas que forma um cientista de dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "No mapa do roadmap de Ciência de Dados, a estatística e probabilidade corresponde a qual peça do trabalho real?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pensar em dados, o raciocínio quantitativo por trás de qualquer análise",
                                "isCorrect": true
                            },
                            {
                                "text": "Domar dados, a limpeza e organização das tabelas antes da análise",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelar, o treino e a avaliação dos algoritmos de machine learning",
                                "isCorrect": false
                            },
                            {
                                "text": "Entregar, colocar um modelo já treinado pra funcionar em produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das atividades abaixo é um exemplo direto da etapa \"domar dados\" do roadmap?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Juntar duas tabelas com um JOIN e tratar valores nulos antes da análise",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher entre acurácia e F1 pra avaliar um classificador desbalanceado",
                                "isCorrect": false
                            },
                            {
                                "text": "Desenhar um gráfico de dispersão pra comunicar a relação entre variáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Empacotar a API do modelo treinado dentro de um container Docker",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual estágio do roadmap vem imediatamente antes de \"Do Modelo ao Produto\"?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Machine learning na prática, aprofundando ensembles e ajuste de modelos",
                                "isCorrect": true
                            },
                            {
                                "text": "Visualização e análise exploratória, focada em gráficos e storytelling",
                                "isCorrect": false
                            },
                            {
                                "text": "SQL e bancos de dados, cobrindo consultas, joins e agregações relacionais",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística e probabilidade, cobrindo inferência e teste de hipótese",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma diretoria pede um modelo pra prever demanda de estoque, mas os dados estão em três tabelas de um banco relacional e ninguém sabe por que a demanda caiu no último trimestre. Qual caminho pelo roadmap leva a um modelo confiável em produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Juntar as tabelas com SQL, limpar com pandas, e entender a queda antes de modelar",
                                "isCorrect": true
                            },
                            {
                                "text": "Pular direto pro machine learning, sem juntar as tabelas nem entender a causa",
                                "isCorrect": false
                            },
                            {
                                "text": "Visualizar os dados brutos sem nunca juntar as tabelas, e modelar o que sobrar",
                                "isCorrect": false
                            },
                            {
                                "text": "Empacotar com Docker um modelo antes mesmo de reunir os dados das três tabelas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um profissional domina profundamente scikit-learn e treina modelos excelentes, mas não escreve uma consulta SQL nem explica um resultado pra alguém de negócio. Segundo o mapa do roadmap, o que falta pra esse profissional ser um cientista de dados completo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falta boa parte do caminho: buscar e organizar dados, e comunicar o resultado",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada falta: treinar bons modelos já é suficiente pra cobrir o trabalho sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta apenas aprender mais um algoritmo de machine learning além dos conhecidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta apenas trocar o scikit-learn por uma biblioteca de deep learning avançada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O dia a dia de um cientista de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O trabalho de verdade, sem o filtro do hype\n\nFilme, reportagem e post de rede social costumam pintar o cientista de dados testando modelo chique o dia inteiro, brincando com deep learning, decidindo o futuro da empresa só de olhar pra um dashboard bonito. Quem já treinou um modelo de verdade sabe que essa cena existe, só que ocupa uma fatia pequena da semana. O resto do tempo, bem maior, é entender o problema, brigar com dado sujo e explicar o que foi encontrado pra gente que não vai ler uma linha de código."
                    },
                    {
                        "type": "text",
                        "value": "## Antes de qualquer modelo: entender o problema\n\nA pergunta que abre um projeto raramente é \"qual algoritmo eu uso?\". É \"o que exatamente a empresa precisa saber, e por quê?\". Um pedido como \"quero prever quem vai cancelar a assinatura\" esconde perguntas bem mais específicas: cancelar em quanto tempo? A partir de quais dados disponíveis hoje? O que a empresa vai fazer de diferente com essa previsão em mãos? Sem essas respostas, é fácil treinar um modelo tecnicamente correto que não ajuda ninguém a decidir nada, porque prevê a coisa errada, ou prevê a certa tarde demais pra alguém agir."
                    },
                    {
                        "type": "text",
                        "value": "## Coletar e limpar: a fatia que ninguém vê de fora\n\nPesquisas e relatos da área concordam num ponto: boa parte do tempo de um projeto de dados vai pra buscar dado espalhado em sistemas diferentes, decidir o que fazer com valor faltante, remover duplicata e entender por que uma coluna tem três formatos de data diferentes. Isso não é trabalho \"menor\" que treinar um modelo: é o que decide se ele vai ter algo de bom pra aprender. Como a trilha de Machine Learning já mostrou, um algoritmo sofisticado treinado em cima de dado ruim continua entregando resultado ruim."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Atividade\",\"Fatia comum do tempo\",\"Observação\"],[\"Entender o problema e o negócio\",\"Pequena em tempo, grande em impacto\",\"Sem isso, o projeto resolve bem a pergunta errada\"],[\"Coletar e limpar dado\",\"A maior fatia, com frequência mais da metade\",\"Dado real chega sujo, espalhado e inconsistente\"],[\"Análise exploratória e comunicação\",\"Uma fatia relevante, quase sempre subestimada\",\"Entender e explicar o achado pesa tanto quanto achá-lo\"],[\"Treinar e ajustar o modelo\",\"Costuma ser a menor fatia do projeto inteiro\",\"Com dado bem preparado, o treino em si é rápido\"],[\"Colocar em produção e manter\",\"Cresce bastante depois que o modelo já funciona\",\"Servir, monitorar e retreinar viram trabalho contínuo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Comunicar: o passo que decide se o trabalho vira ação\n\nUm modelo excelente, guardado num notebook que só você entende, não muda decisão nenhuma. Fazer a ponte entre a análise e quem vai agir com ela (a gerente, o time de produto, a diretoria) é parte do trabalho, não um extra opcional. Isso significa traduzir métrica técnica pra linguagem de negócio, escolher o gráfico certo pra cada plateia (retomando a trilha de Visualização de Dados) e, muitas vezes, aceitar que \"o modelo ainda não está pronto\" é uma resposta tão válida quanto entregar um número."
                    },
                    {
                        "type": "text",
                        "value": "## A pergunta certa vale mais que o algoritmo chique\n\nEscolher entre random forest e gradient boosting, ajustar hiperparâmetro fino, tudo isso importa. Mas nenhuma dessas escolhas compensa uma pergunta de negócio mal entendida desde o início. Um cientista de dados experiente costuma gastar mais energia garantindo que está resolvendo o problema certo do que testando mais um algoritmo, porque sabe que o retorno desse cuidado é bem maior."
                    },
                    {
                        "type": "quote",
                        "value": "Boa parte do trabalho de um cientista de dados acontece antes de treinar o modelo, e muito depois de publicar a primeira previsão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a realidade descrita nesta aula, qual atividade costuma ocupar a maior fatia do tempo de um cientista de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Coletar e limpar dado, porque o dado real chega sujo e espalhado",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar o modelo, ajustando hiperparâmetro até achar o melhor valor",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever a documentação técnica do algoritmo escolhido pro projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar arquitetura de deep learning até achar a que generaliza melhor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma diretoria pede \"um modelo pra prever quem vai cancelar a assinatura\", sem mais nenhum detalhe. Qual é o passo mais importante antes de tocar em qualquer dado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Esclarecer o prazo do cancelamento e o que a empresa fará com a previsão",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher entre regressão logística e árvore de decisão pra esse problema",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual métrica de avaliação será usada pra validar o modelo final",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar os dados disponíveis em conjunto de treino e conjunto de teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um modelo tecnicamente correto pode ainda assim não ajudar a empresa a decidir nada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque pode prever a coisa errada, ou prever a certa tarde demais pra agir",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque todo modelo correto tecnicamente já garante uma acurácia perfeita",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque modelo correto nunca pode ser explicado pra um time de negócio",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um modelo correto sempre exige mais dado do que a empresa possui",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados entrega um modelo com ótima métrica, mas guarda tudo num notebook pessoal, sem relatório nem apresentação pro time de negócio. O que essa situação ilustra sobre o trabalho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que o trabalho fica incompleto sem comunicar o achado pra quem decide",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a métrica escolhida certamente estava errada desde o início do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o modelo precisa ser retreinado antes de qualquer nova apresentação",
                                "isCorrect": false
                            },
                            {
                                "text": "Que faltou apenas empacotar esse modelo dentro de um container Docker",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas pessoas disputam uma vaga de cientista de dados. Uma domina profundamente ajuste de hiperparâmetro e ensembles avançados. A outra é mediana nisso, mas é ótima entendendo o negócio, limpando dado bagunçado e explicando resultado pra quem não é técnico. Qual leitura é mais consistente com esta aula?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segunda tende a entregar mais valor real, mesmo usando modelos mais simples",
                                "isCorrect": true
                            },
                            {
                                "text": "A primeira sempre entrega mais valor, por dominar a parte tecnicamente difícil",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas entregam exatamente o mesmo valor, já que só o modelo final importa",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas entrega valor, porque falta a ambas o domínio de deep learning",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Especializações: por onde seguir depois",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Ninguém sabe tudo, e está tudo bem\n\nDepois de nove estágios, dá pra sentir que \"aprendeu ciência de dados\". Aprendeu, sim, o suficiente pra trabalhar de verdade com dado: coletar, limpar, analisar, modelar e entregar. Mas a área continua crescendo mais rápido do que qualquer pessoa consegue acompanhar sozinha. Ninguém, nem quem trabalha há quinze anos com isso, domina profundamente processamento de linguagem natural, visão computacional, engenharia de dados em larga escala e infraestrutura de nuvem ao mesmo tempo. O passo depois do roadmap não é aprender tudo: é escolher, com calma, uma direção pra aprofundar."
                    },
                    {
                        "type": "text",
                        "value": "## Processamento de linguagem natural (NLP) e LLMs\n\nSe o que te empolga é texto (analisar sentimento de avaliação, resumir documento, montar um chatbot, ou entender como funcionam por dentro os grandes modelos de linguagem que ficaram populares nos últimos anos), o caminho é NLP. Além do machine learning clássico já visto nesta jornada, essa trilha costuma passar por representações de texto (embeddings), pela arquitetura transformer por trás dos LLMs atuais, e por bibliotecas como as do ecossistema Hugging Face, pra usar e ajustar modelos já treinados, em vez de treinar um do zero."
                    },
                    {
                        "type": "text",
                        "value": "## Visão computacional\n\nSe o que te chama atenção é imagem e vídeo (reconhecer objeto numa foto, ler um documento escaneado, inspecionar peça de fábrica por câmera), o caminho é visão computacional. Ela se apoia pesado em deep learning, o mesmo assunto que a trilha de Machine Learning na Prática só começou a apresentar. Redes convolucionais, aumento de dados (data augmentation) e modelos pré-treinados que você adapta pro seu problema, em vez de treinar do zero, são o dia a dia dessa especialização."
                    },
                    {
                        "type": "text",
                        "value": "## Engenharia de dados e dados em nuvem\n\nSe o que te empolgou mais nesta trilha foi a parte de infraestrutura (o SQL da trilha de Banco de Dados, o Docker do Módulo 3 desta trilha), engenharia de dados é o caminho que foca nisso: construir os pipelines que movem dado bruto de um sistema pra outro, em escala, com ferramentas como o Apache Airflow pra orquestrar e o Apache Spark pra processar volume grande. Andando junto, dados em nuvem aprofunda os serviços de um provedor como AWS, Google Cloud ou Azure (armazenamento, processamento distribuído, e serviços gerenciados de machine learning como o SageMaker, o Vertex AI ou o Azure Machine Learning), o que muda a escala do que dá pra construir sozinho."
                    },
                    {
                        "type": "text",
                        "value": "## Engenharia de machine learning e MLOps\n\nE se o que fisgou você foi justamente esta trilha (servir modelo, empacotar, monitorar, versionar com uma ferramenta como o MLflow), engenharia de ML e MLOps aprofunda exatamente esse caminho: pipeline de treino e deploy totalmente automatizado, time inteiro dedicado só a manter modelo em produção, orquestração de container em escala com Kubernetes. É pegar tudo que os módulos anteriores desta trilha abriram, e ir fundo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Caminho\",\"Foco principal\",\"Por onde começar\"],[\"NLP e LLMs\",\"Entender e gerar linguagem: texto, chatbot, resumo, tradução\",\"Embeddings, a arquitetura transformer, e o ecossistema Hugging Face\"],[\"Visão computacional\",\"Entender imagem e vídeo: classificar, detectar, segmentar\",\"Deep learning, redes convolucionais, modelos pré-treinados\"],[\"Engenharia de dados\",\"Mover e transformar dado bruto em larga escala\",\"SQL avançado, orquestração com Airflow, processamento com Spark\"],[\"Engenharia de ML e MLOps\",\"Automatizar e escalar o que esta trilha começou\",\"Pipeline de deploy, Kubernetes, um model registry como o MLflow\"],[\"Dados em nuvem\",\"Rodar tudo isso em escala, num provedor gerenciado\",\"Os serviços de dado e ML de AWS, Google Cloud ou Azure\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Escolher uma especialização não é desistir do resto: é decidir onde cavar fundo primeiro, sabendo que o mapa inteiro continua ali, disponível quando precisar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo esta aula, qual é a atitude mais realista em relação a dominar toda a ciência de dados depois do roadmap?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aceitar que ninguém domina tudo, e escolher uma direção pra aprofundar",
                                "isCorrect": true
                            },
                            {
                                "text": "Tentar aprender profundamente todas as especializações ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Considerar o aprendizado encerrado, já que o roadmap cobriu tudo",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperar dominar deep learning por completo antes de aplicar pra vagas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa quer construir um sistema que resuma automaticamente contratos jurídicos longos em poucos parágrafos. Qual especialização se encaixa melhor nesse objetivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "NLP e LLMs, pelo foco em entender e gerar texto em linguagem natural",
                                "isCorrect": true
                            },
                            {
                                "text": "Visão computacional, pelo foco em reconhecer padrão visual complexo",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenharia de dados, pelo foco em mover grande volume de documento",
                                "isCorrect": false
                            },
                            {
                                "text": "Dados em nuvem, pelo foco nos serviços gerenciados de um provedor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dupla de ferramentas esta aula associa à especialização de engenharia de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apache Airflow pra orquestrar, e Spark pra processar grande volume",
                                "isCorrect": true
                            },
                            {
                                "text": "Hugging Face pra ajustar modelo, e embeddings pra representar texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Kubernetes pra orquestrar container, e MLflow pra registrar modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Redes convolucionais e modelo pré-treinado pra reconhecer imagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa se identificou mais com os módulos desta trilha sobre servir o modelo, empacotar com Docker e monitorar em produção do que com o treino do modelo em si. Qual especialização conversa mais direto com esse interesse?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Engenharia de machine learning e MLOps, aprofundando deploy e automação",
                                "isCorrect": true
                            },
                            {
                                "text": "NLP e LLMs, aprofundando embeddings e a arquitetura transformer atual",
                                "isCorrect": false
                            },
                            {
                                "text": "Visão computacional, aprofundando rede convolucional aplicada a imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística avançada, aprofundando teste de hipótese e inferência causal",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que esta aula defende que \"ninguém sabe tudo\", em vez de recomendar aprender todas as especializações citadas de uma vez?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque cada especialização já é profunda o bastante pra ocupar anos de estudo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as especializações citadas, na prática, não têm relação nenhuma entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o mercado de trabalho não valoriza profissional com foco definido",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aprender mais de uma área sempre atrapalha o desempenho na primeira",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Construir um portfólio",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que prova que você sabe fazer o trabalho\n\nTerminar um roadmap, uma trilha ou um curso mostra que você estudou. Não mostra, sozinho, que você consegue pegar um problema real, sem gabarito nem exercício pronto, e levar do zero até um resultado que funciona. É isso que um portfólio prova, e é por isso que ele pesa tanto quanto, às vezes mais que, qualquer certificado na hora de mostrar do que você é capaz."
                    },
                    {
                        "type": "text",
                        "value": "## A anatomia de um projeto de ponta a ponta\n\nUm bom projeto de portfólio segue o mesmo fluxo que esta trilha inteira defendeu: nasce de uma pergunta real, não de um dataset escolhido só por estar bonito. Usa dado público, de fontes como o Kaggle, o portal dados.gov.br ou o IBGE. Passa por uma análise exploratória honesta, com gráfico e texto explicando o que foi encontrado. Chega a um modelo, mesmo que simples. Ganha um deploy mínimo (uma API rodando local já conta, subir num serviço gratuito conta ainda mais). E termina com o código publicado no GitHub, um README explicando o que é, e um texto contando a pergunta, o caminho, as decisões e os limites do resultado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Projeto fraco\",\"Projeto forte\"],[\"Reproduz um tutorial de dataset famoso, sem pergunta própria\",\"Parte de uma pergunta específica, escolhida por curiosidade real\"],[\"Termina no notebook, só com a métrica final e nada além disso\",\"Chega a algum tipo de entrega: uma API, um relatório, um painel\"],[\"Mostra só código, sem explicar nenhuma decisão tomada no caminho\",\"Vem com um texto explicando escolha, erro e limite do resultado\"],[\"Ignora dado sujo ou outlier, como se o dataset já chegasse perfeito\",\"Mostra o processo de limpeza e as decisões tomadas nele\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o portfólio pesa mais que o certificado\n\nUm certificado prova que você se sentou numa cadeira, mesmo que virtual, até o fim de um curso. Não prova como você se comporta diante de um dado real, sujo, sem instrução clara do que fazer. Quem contrata sabe disso, e cada vez mais olha primeiro pro projeto (o código, o raciocínio, o texto explicando) do que pra lista de certificado no currículo. Isso não quer dizer que certificado não tenha valor nenhum: quer dizer que ele sozinho não substitui a prova de que você sabe aplicar o que aprendeu."
                    },
                    {
                        "type": "text",
                        "value": "## Comunidade, leitura e prática constante\n\nPortfólio não se constrói de uma vez só, num fim de semana. Cresce com prática regular: participar de uma competição do Kaggle, ler artigo e postagem de quem trabalha com dado no dia a dia, contribuir com um projeto aberto, comentar o projeto de outra pessoa. A comunidade de ciência de dados é grande e, na maior parte, aberta a quem está começando. Aparecer nela, mesmo aos poucos, ensina tanto quanto qualquer módulo desta trilha."
                    },
                    {
                        "type": "quote",
                        "value": "Um certificado diz que você estudou. Um projeto de ponta a ponta mostra o que você faz sozinho, diante de um problema real."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo esta aula, o que um portfólio prova que um certificado, sozinho, não prova?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que a pessoa consegue levar um problema real do início até um resultado",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a pessoa estudou todo o conteúdo teórico do curso até o final dele",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a pessoa domina a matemática avançada por trás de cada algoritmo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a pessoa participou de todas as aulas de uma trilha sem faltar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual opção melhor descreve um projeto de portfólio de ponta a ponta, segundo esta aula?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pergunta real, dado público, análise, modelo, deploy simples e texto explicando",
                                "isCorrect": true
                            },
                            {
                                "text": "Notebook reproduzindo um tutorial de dataset famoso, sem pergunta nem texto próprio",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelo com a maior acurácia possível, sem nenhum deploy nem explicação do processo",
                                "isCorrect": false
                            },
                            {
                                "text": "Coleção de certificado de curso, organizada em ordem cronológica de emissão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde esta aula recomenda buscar dado público pra um projeto de portfólio?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fontes como o Kaggle, o portal dados.gov.br ou o IBGE",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas banco de dado interno de empresas privadas conhecidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas dado sintético gerado artificialmente por um modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas planilha fornecida por uma instituição de ensino paga",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas pessoas concorrem à mesma vaga. Uma tem três certificados e nenhum projeto público. A outra tem um certificado e um projeto de ponta a ponta, com código, texto e um deploy simples. Segundo esta aula, qual tende a se destacar mais no processo seletivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segunda, porque o projeto evidencia a capacidade de aplicar o conhecimento",
                                "isCorrect": true
                            },
                            {
                                "text": "A primeira, porque mais certificado sempre supera qualquer projeto pessoal",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas empatam, já que certificado e projeto pesam exatamente igual",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas, porque só experiência profissional prévia conta de fato",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto de portfólio treina um modelo com ótima métrica, mas o notebook não explica nenhuma decisão tomada e termina sem nenhum tipo de entrega além do arquivo do modelo. Que ajuste tornaria esse projeto mais forte, segundo esta aula?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adicionar um texto explicando as decisões e uma forma simples de entrega",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o modelo atual por uma rede neural profunda mais sofisticada",
                                "isCorrect": false
                            },
                            {
                                "text": "Repetir o treino várias vezes até a métrica ficar ainda mais alta",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a análise exploratória, já que o modelo final é o que importa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fechamento do roadmap e os próximos passos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fim de um caminho, começo de outro\n\nVocê talvez tenha começado este roadmap sem saber o que era uma variável. Nove estágios depois, sabe escrever uma consulta SQL com join, limpar uma base bagunçada com pandas, testar se um padrão é real ou coincidência, montar um gráfico que conta uma história, treinar e ajustar um modelo de machine learning e, agora, sabe colocar esse modelo pra funcionar de verdade: servindo previsão, monitorado, com plano pra quando ele começar a errar mais. Isso não é pouco. É o suficiente pra trabalhar com dado de verdade, num problema de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda quando você olha pra trás\n\nLembra de quando variável, condicional e laço eram novidade, lá no começo deste roadmap? Parece distante de um Dockerfile empacotando uma API de previsão, mas os dois são a mesma pessoa aprendendo, um passo de cada vez. O que mudou entre o começo e agora não foi só a quantidade de ferramenta conhecida: foi o jeito de encarar um problema com dado. Hoje você sabe perguntar \"esse resultado é real ou é ruído\", \"esse dado representa a situação de verdade\", \"esse modelo vai continuar funcionando daqui a três meses\". Ninguém nasce fazendo essas perguntas. Elas vêm do caminho que você acabou de percorrer."
                    },
                    {
                        "type": "text",
                        "value": "## Honestidade: o mapa não é o fim do aprendizado\n\nVale fechar sem prometer algo que não é verdade: terminar este roadmap não te torna alguém que sabe tudo sobre ciência de dados, e ninguém deveria prometer isso. As ferramentas vão mudar (algumas das citadas aqui provavelmente vão ganhar versão nova, ou perder espaço pra outras, nos próximos anos). Vai continuar existindo projeto em que você vai se sentir perdido, dado que não se comporta como o dataset de exemplo, resultado que não bate com o esperado. Isso não é sinal de que você aprendeu errado: é a cara normal do trabalho com dado, que segue incerto mesmo pra quem tem anos de estrada."
                    },
                    {
                        "type": "text",
                        "value": "## Os próximos passos, na prática\n\nO caminho daqui pra frente já apareceu nas últimas aulas: construir projeto de ponta a ponta pro portfólio, escolher com calma uma especialização pra aprofundar (ou seguir generalista por um tempo, que também é uma escolha válida), participar da comunidade, se candidatar a vaga ou freelance mesmo sem se sentir cem por cento pronto (ninguém se sente), e continuar praticando com dado real, que ensina coisa que nenhum módulo teórico ensina sozinho."
                    },
                    {
                        "type": "text",
                        "value": "## Parabéns, com toda sinceridade\n\nFechar um roadmap de nove estágios é raro. Muita gente começa uma trilha de dados e para no meio, seja por falta de tempo, seja porque o caminho fica difícil em algum ponto (e ele fica, em vários pontos). Você chegou até aqui. Isso não te transforma num cientista de dados pronto e acabado, porque essa versão não existe: transforma você em alguém com o mapa completo, capaz de aprender o resto do caminho por conta própria, com base sólida embaixo do pé. Ciência de dados não é um destino que se alcança: é uma jornada que se mantém, um dado, um modelo, um aprendizado de cada vez. Parabéns por chegar até aqui, e bom caminho daqui pra frente."
                    },
                    {
                        "type": "quote",
                        "value": "Você não terminou de aprender ciência de dados. Terminou de aprender o suficiente pra continuar aprendendo sozinho, e essa é a parte mais importante do caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo o fechamento desta trilha, o que significa terminar o roadmap de Ciência de Dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ter o mapa completo e a base pra continuar aprendendo sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "Saber, de forma definitiva, tudo que existe sobre ciência de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Não precisar mais estudar nenhuma ferramenta ou conceito novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Dominar profundamente todas as especializações citadas na trilha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que esta aula evita prometer que o roadmap deixa alguém \"pronto e acabado\" como cientista de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque as ferramentas mudam e sempre vai existir situação nova e incerta",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o roadmap, na prática, não chegou a cobrir nenhum conceito útil",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cientista de dados é um título que não existe no mercado real",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nenhuma empresa contrata quem terminou apenas um roadmap",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença defendida nesta aula entre \"terminar o roadmap\" e \"terminar de aprender ciência de dados\"?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Terminar o roadmap dá a base; aprender ciência de dados continua depois",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas expressões significam exatamente a mesma coisa, sem diferença real",
                                "isCorrect": false
                            },
                            {
                                "text": "Terminar o roadmap já esgota tudo o que existe pra aprender na área",
                                "isCorrect": false
                            },
                            {
                                "text": "Aprender ciência de dados termina antes mesmo de o roadmap acabar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa termina o roadmap e, no primeiro projeto real do novo emprego, se sente perdida diante de um dado que não se parece com nenhum exercício da trilha. Segundo a mensagem desta aula, como interpretar essa sensação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Como algo normal do trabalho com dado, não como sinal de aprendizado errado",
                                "isCorrect": true
                            },
                            {
                                "text": "Como prova de que o roadmap inteiro foi mal aproveitado por essa pessoa",
                                "isCorrect": false
                            },
                            {
                                "text": "Como sinal de que faltou revisar os módulos de estatística mais uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Como indício de que essa pessoa escolheu a especialização errada pra seguir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao longo das cinco aulas deste módulo final, qual conclusão amarra melhor o recap do roadmap, o dia a dia real, as especializações e o portfólio, todos ao mesmo tempo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O roadmap deu a base ampla; agora cabe aplicar, aprofundar um foco e praticar",
                                "isCorrect": true
                            },
                            {
                                "text": "O roadmap já substitui qualquer necessidade de prática ou projeto posterior",
                                "isCorrect": false
                            },
                            {
                                "text": "As especializações citadas tornam o conteúdo do roadmap inteiro dispensável",
                                "isCorrect": false
                            },
                            {
                                "text": "O portfólio importa apenas pra quem ainda não terminou o roadmap completo",
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
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
