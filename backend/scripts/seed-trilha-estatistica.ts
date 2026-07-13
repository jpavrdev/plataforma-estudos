// Seed da trilha Estatistica e Probabilidade (iniciante), estagio 3 do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-estatistica.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Estatística e Probabilidade";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A base quantitativa da ciência de dados: estatística descritiva (média, desvio, distribuições), probabilidade, amostragem e o Teorema Central do Limite, inferência com intervalos de confiança e teste de hipótese, e correlação (que não é causalidade). Com Python nos exemplos, a ponte pra análise de dados e machine learning.";

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
        "titulo": "Módulo 1 - O que é estatística (e por que importa em dados)",
        "aulas": [
            {
                "titulo": "O que é estatística (descritiva x inferencial)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é estatística (e por que importa em dados)\n\nTodo mundo já ouviu falar em estatística: a taxa de desemprego caiu, a média de idade dos usuários é 27 anos, 70% dos entrevistados preferem determinado produto. Mas o que é estatística, de fato?\n\nEstatística é a área que estuda como coletar, organizar, resumir e interpretar dados para entender melhor uma situação e tomar decisões, principalmente quando existe incerteza. Não é só tirar médias: é um conjunto de ferramentas para transformar números soltos em informação útil.\n\nEm ciência de dados, estatística é a base. Antes de qualquer modelo de machine learning, é estatística que ajuda a entender os dados, encontrar padrões e decidir se uma conclusão é confiável ou só coincidência."
                    },
                    {
                        "type": "text",
                        "value": "## Os dois grandes ramos da estatística\n\nA estatística se divide em duas grandes frentes, que respondem perguntas diferentes:\n\n- **Estatística descritiva**: organiza e resume os dados que você já tem. Ela responde como são esses dados: qual a média, qual o valor mais comum, o quanto eles variam.\n- **Estatística inferencial**: usa uma amostra (uma parte dos dados) para concluir algo sobre um grupo maior, que você não conseguiu (ou não quis) observar por completo. Ela responde o que dá para concluir sobre o todo, com base no que foi visto.\n\nA diferença central: a descritiva fala só sobre os dados que estão na sua frente. A inferencial arrisca uma conclusão que vai além deles, e por isso carrega incerteza."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Estatística descritiva\",\"Estatística inferencial\"],[\"O que faz\",\"Resume e organiza os dados observados\",\"Generaliza uma conclusão para além dos dados observados\"],[\"Pergunta típica\",\"Qual a média de vendas deste mês?\",\"Com base numa amostra, qual será a média de vendas do ano?\"],[\"Trabalha com\",\"Todos os dados que você coletou\",\"Uma amostra, buscando falar sobre a população inteira\"],[\"Carrega incerteza?\",\"Não, é só descrição do que existe\",\"Sim, é uma estimativa sujeita a erro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo para fixar\n\nImagine uma rede de streaming com 5 milhões de usuários. Dois times fazem perguntas diferentes:\n\n- O time de produto olha o histórico de todos os usuários do último mês e calcula quantas horas, em média, cada um assistiu. Isso é **descritivo**: um resumo do que já aconteceu, com dados completos.\n- O time de pesquisa não tem como perguntar a 5 milhões de pessoas se elas gostariam de uma nova funcionalidade. Em vez disso, pergunta a 800 usuários escolhidos aleatoriamente e usa a resposta deles para estimar a opinião de todos. Isso é **inferencial**: uma conclusão sobre o todo, a partir de uma parte.\n\nOs dois usam estatística. A diferença é o alcance da conclusão: descrever o que se tem, ou estimar o que não se viu."
                    },
                    {
                        "type": "code",
                        "value": "horas_assistidas = [2.5, 1.0, 3.5, 0.5, 4.0, 2.0, 1.5]\n\nmedia = sum(horas_assistidas) / len(horas_assistidas)\nprint(media)\n# 2.142857142857143\n# isso é estatística descritiva: resume os dados observados em um único número"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa distinção importa\n\nSaber se você está descrevendo ou inferindo evita um erro comum: tratar uma conclusão sobre uma amostra como se fosse um fato sobre todo mundo. Os módulos 2 e 3 desta trilha aprofundam a estatística descritiva (média, mediana, dispersão, distribuições), e os módulos 5 e 6 constroem a inferencial (amostragem, intervalos de confiança, testes de hipótese). Por enquanto, o importante é reconhecer: toda vez que alguém apresenta um número, vale perguntar se ele descreve os dados que temos, ou se é uma estimativa sobre algo maior."
                    },
                    {
                        "type": "quote",
                        "value": "Descritiva resume o que você tem. Inferencial arrisca uma conclusão sobre o que você não viu."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas descreve melhor a estatística descritiva?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Organiza e resume os dados que já foram coletados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estima uma conclusão sobre dados que não foram coletados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Prevê eventos futuros com base em modelos matemáticos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testa se uma hipótese sobre a população é verdadeira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa entrevista 500 pessoas para estimar a opinião de uma cidade inteira sobre um tema. Esse é um exemplo de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Estatística inferencial, porque usa uma amostra para concluir sobre todos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estatística descritiva, porque resume as respostas obtidas na pesquisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística inferencial, porque calcula a média exata da cidade toda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística descritiva, porque entrevista toda a população da cidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um professor calcula a média de notas da sua turma de 30 alunos, usando as notas de todos eles. Essa média é um exemplo de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Estatística descritiva, porque resume dados já coletados de todos os alunos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estatística inferencial, porque toda média serve para estimar a população inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística inferencial, porque 30 alunos formam apenas uma amostra da escola.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística descritiva, porque estima a nota média de outras turmas da escola.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um projeto de ciência de dados, qual situação melhor representa o uso da estatística inferencial?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar uma amostra de clientes para estimar a satisfação de toda a empresa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somar todos os pedidos do mês passado para calcular o total de vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Organizar os pedidos do mês em uma tabela, separados por categoria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a média de idade de todos os funcionários cadastrados na empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se uma empresa consegue registrar as compras de TODOS os seus clientes (não apenas uma parte), calcular a média de gasto mensal desses clientes é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Estatística descritiva, mesmo com muitos clientes, pois não há amostragem envolvida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estatística inferencial, pois qualquer média é uma estimativa sujeita a erro amostral.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística inferencial, pois o número de clientes é grande demais para ser exato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística descritiva apenas se a empresa tiver menos de cem clientes cadastrados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "População, amostra, parâmetro e estatística",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## População e amostra\n\nToda pesquisa estatística começa decidindo quem ou o que você quer estudar. Esse grupo completo se chama **população**: todos os elementos que interessam à pergunta. Pode ser todos os clientes de uma empresa, todos os pixels de uma imagem, todos os pedidos feitos em um site desde que ele existe.\n\nNa prática, é raro conseguir observar a população inteira. Por isso trabalhamos com uma **amostra**: um subconjunto da população, escolhido para representá-la. A ideia é simples: se a amostra for bem escolhida, o que aprendemos com ela vale, aproximadamente, para a população toda."
                    },
                    {
                        "type": "text",
                        "value": "## Por que quase sempre usamos amostras\n\nMedir a população inteira nem sempre é possível, e às vezes nem é uma boa ideia:\n\n- **Tamanho**: perguntar a todos os habitantes de um país é caro e demorado.\n- **Tempo**: uma pesquisa eleitoral precisa de um resultado antes da eleição, não depois.\n- **Praticidade**: para testar a duração de lâmpadas, seria preciso queimar todas elas, o que não deixaria nenhuma para vender.\n- **População em movimento**: usuários de um site entram e saem o tempo todo; o total de usuários muda a cada segundo.\n\nPor isso a amostra não é um atalho ruim: é, na maioria dos casos, a única forma viável de estudar algo grande."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"População\",\"Amostra\"],[\"Definição\",\"Todos os elementos que interessam à pergunta\",\"Uma parte da população, selecionada para estudo\"],[\"Tamanho típico\",\"Grande, às vezes inviável de medir por completo\",\"Menor, limitado pelo tempo e recursos disponíveis\"],[\"Exemplo\",\"Todos os clientes de um banco\",\"2.000 clientes escolhidos para responder a uma pesquisa\"],[\"Medida calculada nela\",\"Parâmetro\",\"Estatística\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Parâmetro x estatística\n\nAqui aparece uma confusão comum de nome: a palavra estatística também nomeia um número específico, calculado a partir dos dados.\n\n- **Parâmetro**: uma medida calculada sobre a população inteira. Por exemplo, a média de idade de todos os clientes de um banco. Na prática, quase nunca conhecemos o parâmetro exato, porque não medimos a população inteira.\n- **Estatística** (no singular, um número): uma medida calculada sobre a amostra. Por exemplo, a média de idade dos 2.000 clientes que responderam à pesquisa.\n\nUsamos a estatística da amostra para estimar o parâmetro da população, que normalmente permanece desconhecido. Essa é a ponte entre a estatística descritiva (calcular a estatística da amostra) e a inferencial (usar essa estatística para estimar o parâmetro)."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\npopulacao = [23, 45, 31, 29, 52, 38, 41, 26, 33, 47]\namostra = [23, 31, 52, 33]\n\nparametro = statistics.mean(populacao)\nestatistica = statistics.mean(amostra)\n\nprint(parametro, estatistica)\n# 36.5 34.75"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa distinção importa\n\nAo longo da trilha, quase toda vez que você calcular uma média, um desvio padrão ou uma proporção a partir de dados reais, vale perguntar: isso veio da população inteira ou de uma amostra? Essa resposta muda o que você pode afirmar. Um parâmetro é um fato sobre a população; uma estatística é uma estimativa, que pode estar mais perto ou mais longe do valor real. Os módulos 5 e 6 desta trilha mostram como medir e comunicar essa margem de erro."
                    },
                    {
                        "type": "quote",
                        "value": "Parâmetro é o número verdadeiro da população, quase sempre desconhecido. Estatística é a nossa melhor estimativa dele, calculada a partir de uma amostra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções descreve corretamente o que é uma amostra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um subconjunto da população, selecionado para representar o todo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto completo de todos os elementos que interessam à pesquisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de medição que aparece ao coletar poucos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor médio calculado a partir de todos os dados disponíveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A média de idade calculada a partir de TODOS os funcionários de uma empresa é chamada de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Parâmetro, porque é uma medida da população inteira.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estatística, porque é uma medida calculada a partir de uma amostra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amostra, porque representa um grupo selecionado de funcionários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Variável, porque descreve uma característica que muda entre eles.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fabricante de pilhas quer saber quanto tempo, em média, suas pilhas duram. Por que ela testa apenas uma amostra, e não todas as pilhas produzidas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque testar uma pilha até descarregar destruiria todo o estoque produzido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a amostra sempre dá um resultado mais exato do que a população.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque medir a população inteira é proibido pelas normas de qualidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o parâmetro da população só existe após uma amostra ser testada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pesquisador mediu a altura de 50 alunos escolhidos aleatoriamente entre os 2.000 alunos de uma escola, e encontrou uma média de 1,65 m. Esse valor de 1,65 m é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma estatística, pois foi calculada a partir de uma amostra de 50 alunos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um parâmetro, pois foi calculada a partir de uma amostra de 50 alunos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma estatística, pois representa a altura exata dos 2.000 alunos da escola.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um parâmetro, pois representa a altura exata dos 2.000 alunos da escola.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma pesquisa sobre hábitos de leitura, entrevistaram-se 300 pessoas de uma cidade com 80.000 habitantes. Nesse estudo, os 80.000 habitantes representam:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A população, o grupo completo que interessa à pesquisa.",
                                "isCorrect": true
                            },
                            {
                                "text": "A amostra, o grupo que foi efetivamente entrevistado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O parâmetro, o número que resume a opinião da cidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "A estatística, o valor calculado a partir das 300 entrevistas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de variáveis (numérica x categórica)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é uma variável\n\nQuando falamos de dados, cada característica que medimos ou registramos é chamada de **variável**: idade, nota, cor dos olhos, cidade, satisfação com um produto. O tipo de variável determina que perguntas fazem sentido e quais contas podem ser feitas com ela. Não dá para calcular a cor média dos olhos de uma turma, por exemplo, mas dá para calcular a idade média.\n\nExistem duas grandes famílias de variáveis: **numéricas** e **categóricas**."
                    },
                    {
                        "type": "text",
                        "value": "## Variáveis numéricas: discretas x contínuas\n\nVariáveis numéricas representam quantidades, coisas que dá para contar ou medir. Elas se dividem em dois tipos:\n\n- **Discretas**: só assumem valores inteiros, contáveis, geralmente resultado de uma contagem. Número de filhos, número de pedidos em um dia, quantidade de erros em um programa. Não existe um valor como 2,5 filhos.\n- **Contínuas**: podem assumir qualquer valor dentro de um intervalo, geralmente resultado de uma medição. Altura, peso, tempo de resposta de um servidor, temperatura. Entre 1,70 m e 1,71 m sempre cabe outro valor possível, como 1,705 m."
                    },
                    {
                        "type": "text",
                        "value": "## Variáveis categóricas: nominais x ordinais\n\nVariáveis categóricas representam grupos ou rótulos, não quantidades. Elas também se dividem em dois tipos:\n\n- **Nominais**: categorias sem nenhuma ordem natural entre elas. Cor favorita, cidade natal, time de futebol, sistema operacional do celular. Não faz sentido dizer que uma categoria é maior ou vem depois da outra.\n- **Ordinais**: categorias com uma ordem clara, mas sem uma distância numérica definida entre elas. Nível de satisfação (ruim, regular, bom, ótimo), estágio escolar (fundamental, médio, superior), classificação de risco (baixo, médio, alto). Dá para ordenar, mas não dá para dizer quanto uma categoria é maior que a outra."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Subtipo\",\"Exemplo\",\"Dá para calcular média?\"],[\"Numérica\",\"Discreta\",\"Número de pedidos por cliente\",\"Sim\"],[\"Numérica\",\"Contínua\",\"Altura em metros\",\"Sim\"],[\"Categórica\",\"Nominal\",\"Cor favorita\",\"Não\"],[\"Categórica\",\"Ordinal\",\"Nível de satisfação (ruim a ótimo)\",\"Não, mas dá para ordenar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o tipo determina o que dá pra calcular\n\nEssa classificação não é só teoria: ela decide quais operações fazem sentido.\n\n- Em variáveis **numéricas**, média, soma e desvio padrão fazem sentido, porque os valores têm distância matemática real entre si (a diferença entre 2 e 4 pedidos é igual à diferença entre 4 e 6).\n- Em variáveis **categóricas nominais**, só faz sentido contar quantas vezes cada categoria aparece (a frequência) e identificar a mais comum (a moda). Calcular a média das cores favoritas não tem significado.\n- Em variáveis **categóricas ordinais**, dá para ordenar e até identificar um valor do meio (a mediana, que o módulo 2 explica), mas a média tradicional continua sem sentido, porque a distância entre bom e ótimo não é um número definido."
                    },
                    {
                        "type": "code",
                        "value": "satisfacao = [\"bom\", \"ótimo\", \"regular\", \"bom\", \"ótimo\", \"ótimo\", \"ruim\"]\n\ncontagem = {}\nfor resposta in satisfacao:\n    contagem[resposta] = contagem.get(resposta, 0) + 1\n\nprint(contagem)\n# {'bom': 2, 'ótimo': 3, 'regular': 1, 'ruim': 1}"
                    },
                    {
                        "type": "quote",
                        "value": "O tipo da variável não é detalhe técnico: é ele que diz se uma média faz sentido, ou se só resta contar e comparar categorias."
                    }
                ],
                "questions": [
                    {
                        "statement": "O número de filhos que uma pessoa tem é um exemplo de variável:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Numérica discreta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Numérica contínua.",
                                "isCorrect": false
                            },
                            {
                                "text": "Categórica nominal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Categórica ordinal.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A cor dos olhos de uma pessoa é um exemplo de variável:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Categórica nominal, porque são categorias sem ordem entre si.",
                                "isCorrect": true
                            },
                            {
                                "text": "Categórica ordinal, porque as cores seguem uma ordem natural.",
                                "isCorrect": false
                            },
                            {
                                "text": "Numérica discreta, porque existe um número limitado de cores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Numérica contínua, porque a cor pode variar em tons infinitos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das variáveis abaixo é um exemplo de variável categórica ordinal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nível de escolaridade, com categorias fundamental, médio e superior.",
                                "isCorrect": true
                            },
                            {
                                "text": "Número de irmãos de uma pessoa, contado em valores inteiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cidade de nascimento, sem nenhuma ordem entre as opções possíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tempo de resposta de um servidor, medido em milissegundos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa registrou o time de futebol favorito de 200 pessoas. Por que não faz sentido calcular a média dos times favoritos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque time favorito é uma variável categórica nominal, sem valor ou ordem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque só é possível calcular médias em amostras com mais de 100 pessoas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque times de futebol formam uma variável ordinal, e a ordem impede a média.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a pesquisa deveria ter perguntado a idade das pessoas, não o time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual medida faz sentido calcular para a variável tempo de entrega de um pedido, em minutos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Média, porque é uma variável numérica contínua.",
                                "isCorrect": true
                            },
                            {
                                "text": "Moda, porque é a única medida válida para variáveis contínuas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Média, porque é uma variável categórica ordinal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Frequência de cada categoria, porque é uma variável nominal.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados como tabela (observações e variáveis)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dados no mundo real: a tabela\n\nQuase todo dado que você vai analisar em ciência de dados aparece organizado como uma tabela: linhas e colunas, parecido com uma planilha. Essa organização não é acidental, ela segue uma regra simples e universal:\n\n- Cada **linha** é uma **observação** (também chamada de registro ou instância): um cliente, um pedido, um aluno, um dia.\n- Cada **coluna** é uma **variável**: uma característica medida para cada observação, como idade, valor do pedido, nota, temperatura.\n\nEntender essa estrutura é o primeiro passo antes de calcular qualquer estatística: toda média, toda contagem, toda comparação parte de uma coluna dessa tabela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"aluno\",\"idade\",\"nota\",\"aprovado\"],[\"Marina\",\"17\",\"8.5\",\"sim\"],[\"Lucas\",\"16\",\"6.0\",\"não\"],[\"Beatriz\",\"18\",\"9.0\",\"sim\"],[\"Pedro\",\"17\",\"5.5\",\"não\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ligando com o que você já viu em Python\n\nSe você já manipulou uma lista de dicionários em Python, essa estrutura já é familiar. Cada dicionário da lista é uma observação (uma linha), e cada chave do dicionário é uma variável (uma coluna). A tabela acima, em Python, vira isto:"
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\nalunos = [\n    {\"aluno\": \"Marina\", \"idade\": 17, \"nota\": 8.5, \"aprovado\": True},\n    {\"aluno\": \"Lucas\", \"idade\": 16, \"nota\": 6.0, \"aprovado\": False},\n    {\"aluno\": \"Beatriz\", \"idade\": 18, \"nota\": 9.0, \"aprovado\": True},\n    {\"aluno\": \"Pedro\", \"idade\": 17, \"nota\": 5.5, \"aprovado\": False},\n]\n\nnotas = [aluno[\"nota\"] for aluno in alunos]\nprint(notas)\n# [8.5, 6.0, 9.0, 5.5]\n\nprint(statistics.mean(notas))\n# 7.25"
                    },
                    {
                        "type": "text",
                        "value": "## Por que pensar linha e coluna ajuda\n\nEsse jeito de pensar evita um erro comum: confundir o que está sendo medido com quem está sendo medido. Quando alguém quer saber a nota média da turma, a resposta vem de olhar a coluna inteira `nota`, uma variável, percorrendo todas as linhas (todas as observações). Quando alguém quer saber a idade de uma pessoa específica, a resposta vem de uma única linha, olhando a coluna `idade` só para aquela observação.\n\nNos próximos módulos, quase toda conta (média, mediana, desvio padrão) vai ser feita ao longo de uma coluna, resumindo os valores de uma variável para todas as observações da tabela."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nNesta trilha ainda vamos calcular tudo isso na mão e com o módulo `statistics`, olhando para listas simples. Mas essa mesma ideia de tabela, linhas e colunas, é exatamente o que a biblioteca **pandas** representa com o `DataFrame`, que você vai conhecer na trilha de Análise de Dados. Entender bem observação e variável agora torna o pandas muito mais intuitivo depois."
                    },
                    {
                        "type": "quote",
                        "value": "Linha é quem foi observado. Coluna é o que foi medido. Toda estatística resume os valores de uma coluna, ao longo de todas as linhas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma tabela de dados, cada LINHA representa:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma observação, um registro individual, como um cliente ou pedido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma variável, uma característica medida em cada observação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de uma coluna, indicando o tipo de dado armazenado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A média de todos os valores registrados na tabela inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma tabela de dados, cada COLUNA representa:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma variável, uma característica medida em cada linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma observação, um registro específico dentro da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor específico de apenas uma única linha da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O total de linhas presentes dentro daquela tabela inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela tem as colunas aluno, idade, nota e aprovado, com uma linha para cada um dos 40 alunos de uma turma. Quantas observações essa tabela tem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "40, porque cada linha da tabela representa um aluno diferente.",
                                "isCorrect": true
                            },
                            {
                                "text": "4, porque cada coluna da tabela representa uma observação diferente.",
                                "isCorrect": false
                            },
                            {
                                "text": "160, porque esse é o total de células preenchidas na tabela inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "1, porque a turma inteira é tratada como uma única observação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na lista alunos, onde cada item é um dicionário com as chaves aluno, idade, nota e aprovado, o que representa cada dicionário dentro dessa lista?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma observação da tabela, equivalente a uma linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma variável da tabela, equivalente a uma coluna.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de uma chave usada para acessar os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de dado armazenado em cada coluna da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela tem colunas pais, pib_per_capita e continente, com uma linha para cada país do mundo. Para calcular o PIB per capita médio dos países da América do Sul, qual é o primeiro passo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Filtrar as linhas do continente América do Sul, e calcular a média só delas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Calcular a média da coluna inteira, sem separar os países por continente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somar os valores da coluna continente e dividir pelo total de países.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contar quantas linhas a tabela tem e usar isso como resultado final.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estatística na ciência de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da coleta à decisão: o papel da estatística\n\nDado bruto, sozinho, não decide nada. Uma planilha com um milhão de linhas de pedidos não diz, por si só, se as vendas estão indo bem ou mal. É a estatística que transforma esse amontoado de números em **informação**: um resumo, uma comparação, uma tendência que faz sentido para uma pessoa (ou uma máquina) decidir o próximo passo.\n\nEsse caminho, de dado bruto até decisão, é basicamente o que um cientista de dados faz todos os dias, e a estatística aparece em quase toda etapa dele."
                    },
                    {
                        "type": "text",
                        "value": "## Onde a estatística aparece no fluxo de ciência de dados\n\nUm projeto típico de ciência de dados passa por etapas parecidas com estas:\n\n- **Coleta dos dados**: já aqui, decidir como amostrar (módulo 5) evita começar com dados enviesados.\n- **Análise exploratória**: usar estatística descritiva (média, mediana, desvio padrão, tabelas de frequência, dos módulos 2 e 3) para entender o que os dados mostram e encontrar valores estranhos (outliers).\n- **Formulação de hipóteses**: usar probabilidade e inferência (módulos 4 e 6) para avaliar se uma diferença observada é real ou apenas acaso.\n- **Modelagem**: muitos modelos de machine learning são, na base, estatística aplicada (regressão, o módulo 7, é um exemplo direto).\n- **Comunicação da decisão**: resumir a conclusão de forma honesta, sem exagerar o que os dados realmente sustentam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa do projeto\",\"O que a estatística responde\",\"Onde aparece na trilha\"],[\"Explorar os dados\",\"Como os dados estão distribuídos? Existe algo estranho?\",\"Módulos 2 e 3\"],[\"Formular hipóteses\",\"Essa diferença é real ou pode ser acaso?\",\"Módulos 4 e 6\"],[\"Construir modelos\",\"Qual a relação entre as variáveis?\",\"Módulo 7\"],[\"Comunicar resultados\",\"O que dá para afirmar com confiança, e o que não dá?\",\"Módulos 6 e 7\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Dado, informação e decisão\n\nVale reforçar essa cadeia, porque ela resume por que estatística importa tanto em ciência de dados:\n\n- **Dado**: o valor bruto, sem contexto. Uma lista de notas como `7.5`, `8.0`, `6.5`.\n- **Informação**: o dado resumido de um jeito que faz sentido, como a média da turma é 7,3, com pouca variação entre os alunos.\n- **Decisão**: a ação tomada com base na informação, como manter o plano atual, porque o desempenho já está consistente.\n\nA estatística é a ponte entre o primeiro passo e o último. Sem ela, dado bruto continua sendo só dado bruto."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\nnotas_turma_a = [7.5, 8.0, 6.5, 9.0, 7.0, 8.5, 6.0]\nnotas_turma_b = [4.0, 9.5, 3.0, 8.5, 9.0, 2.5, 8.0]\n\nprint(statistics.mean(notas_turma_a))\n# 7.5\nprint(statistics.mean(notas_turma_b))\n# 6.357142857142857"
                    },
                    {
                        "type": "text",
                        "value": "## Um resumo não conta a história toda\n\nAs médias das duas turmas já mostram uma diferença (7,5 contra 6,36), mas escondem outra coisa importante: o quanto os valores variam. A turma A vai de 6,0 a 9,0, uma faixa mais estreita; a turma B vai de 2,5 a 9,5, uma faixa bem mais larga. Duas turmas com médias parecidas podem ter realidades bem diferentes: uma mais uniforme, outra com alunos muito acima e muito abaixo da média. Medir esse espalhamento direito é o assunto do Módulo 2."
                    },
                    {
                        "type": "quote",
                        "value": "Estatística é o que fica entre uma tabela cheia de números e uma decisão que faz sentido."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções melhor representa o papel da estatística em ciência de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transformar dados brutos em informação que ajuda a tomar decisões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir a necessidade de coletar dados reais para uma análise.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantir que todo modelo de machine learning terá 100% de acerto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a necessidade de qualquer conhecimento de programação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na cadeia dado, informação e decisão, o que é informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O dado resumido de um jeito que faz sentido, como uma média.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor bruto, sem nenhum tipo de resumo ou contexto aplicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ação final tomada depois de toda a análise ser concluída.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código usado para coletar os dados antes da análise.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados percebe uma diferença nas vendas entre duas campanhas de marketing e quer saber se ela é real ou apenas acaso. Essa etapa usa principalmente:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Inferência e teste de hipótese, para saber se a diferença é real.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só estatística descritiva, porque basta comparar a média de cada campanha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a classificação das variáveis envolvidas na campanha de marketing.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a organização dos dados de vendas em uma tabela organizada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No fluxo de um projeto de ciência de dados, em qual etapa a estatística descritiva costuma ser usada primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na análise exploratória, para entender como os dados se distribuem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na coleta dos dados, antes mesmo de qualquer valor ser registrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na comunicação final, depois que as decisões já foram tomadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na escrita do relatório, como última etapa de todo o projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa calcula a média de conversão de uma campanha (descritiva) e, com uma amostra de clientes, estima se o aumento vale para todos os clientes futuros (inferencial). Isso mostra que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Descritiva e inferencial costumam se complementar, em etapas diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só a estatística inferencial é realmente necessária para decisões de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "A estatística descritiva substitui a inferencial quando os dados são muitos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descritiva e inferencial nunca podem ser aplicadas ao mesmo conjunto de dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Tendência central e dispersão",
        "aulas": [
            {
                "titulo": "Média",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 2: tendência central e dispersão\n\nNo módulo 1 você viu que a estatística descritiva existe pra resumir o que a gente tem: em vez de encarar uma lista com centenas ou milhares de números, calculamos umas poucas medidas que já contam boa parte da história. Este módulo apresenta as medidas mais usadas no dia a dia de quem trabalha com dado.\n\nElas se dividem em dois grupos. As medidas de **tendência central** (média, mediana e moda) tentam responder \"qual é o valor típico, o centro desses dados?\". As medidas de **dispersão** (amplitude, variância e desvio padrão) respondem outra pergunta, igualmente importante: \"o quanto esses dados se espalham ao redor desse centro?\". Vamos começar pela medida mais conhecida de todas: a média."
                    },
                    {
                        "type": "text",
                        "value": "## Como a média é calculada\n\nA média aritmética é simples: soma todos os valores do conjunto e divide pelo total de valores. Você já faz essa conta desde a escola, seja pra tirar a nota final de um boletim, seja pra dividir uma conta entre amigos.\n\nPegue as notas de 6 provas de um aluno ao longo do semestre: 7, 8, 6, 9, 10 e 5. A soma é 45, e são 6 valores, então a média é 45 dividido por 6, ou seja, 7,5. É esse número que a gente costuma usar quando quer resumir \"como esse aluno foi, de modo geral\", no lugar de olhar as 6 notas uma por uma.\n\nAqui a gente calcula com listas simples, do jeito que você já manipula desde a trilha de Python. Mais pra frente, com a biblioteca pandas, essa mesma conta sai chamando `.mean()` direto numa coluna inteira de uma tabela, sem escrever soma e divisão na mão."
                    },
                    {
                        "type": "code",
                        "value": "notas = [7, 8, 6, 9, 10, 5]\n\n# na mao: soma de tudo, dividido pela quantidade de valores\nsoma = sum(notas)\nquantidade = len(notas)\nmedia = soma / quantidade\nprint(media)  # 7.5\n\n# com o modulo statistics\nimport statistics\nprint(statistics.mean(notas))  # 7.5"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aluno\", \"Nota\"], [\"Ana\", \"6\"], [\"Bruno\", \"7\"], [\"Carla\", \"5\"], [\"Diego\", \"8\"], [\"Elisa\", \"9\"], [\"Fábio\", \"7\"], [\"Gabriel\", \"6\"], [\"Helena\", \"8\"], [\"Média da turma\", \"7\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A média é sensível a valores fora da curva\n\nTem uma característica da média que vale a pena conhecer cedo: como ela usa o valor de **cada** número do conjunto na conta, um único valor bem diferente dos outros consegue puxar a média inteira pra perto dele. Esse tipo de valor destoante tem nome: outlier.\n\nImagine 4 pessoas terminando uma tarefa em 10, 12, 11 e 13 minutos. Uma quinta pessoa se distrai no meio do caminho e leva 60 minutos pra terminar a mesma tarefa. Essa quinta pessoa sozinha muda bastante o retrato do grupo, mesmo sendo só 1 entre 5."
                    },
                    {
                        "type": "code",
                        "value": "sem_outlier = [10, 12, 11, 13]\ncom_outlier = [10, 12, 11, 13, 60]\n\nimport statistics\nprint(statistics.mean(sem_outlier))  # 11.5\nprint(statistics.mean(com_outlier))  # 21.2\n\n# uma unica pessoa levou a media de 11,5 para 21,2 minutos,\n# bem mais alta do que o tempo da maioria do grupo"
                    },
                    {
                        "type": "quote",
                        "value": "A média usa todo mundo na conta, o que é uma força (nenhum valor fica de fora) e também uma fraqueza (um valor muito fora da curva pesa tanto quanto deveria pesar um valor comum)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a média dos valores 4, 8 e 9?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "21",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a média aritmética de um conjunto de números representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A soma de todos os valores dividida pela quantidade de valores.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor que aparece com mais frequência entre os números.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor exatamente no meio quando os números estão ordenados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença entre o maior e o menor valor do conjunto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um grupo de 4 pessoas leva 10, 12, 11 e 13 minutos pra terminar uma tarefa. Uma quinta pessoa se distrai e leva 60 minutos. O que acontece com a média do grupo ao incluir essa quinta pessoa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sobe bastante, porque a média usa o valor de cada pessoa, até o mais distante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fica igual, porque a média sempre deixa de fora o maior valor do grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cai bastante, porque somar mais uma pessoa sempre reduz a média do grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sobe pouco, porque a média dá menos peso a valores bem distantes dos outros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As notas de 8 alunos numa prova foram 6, 7, 5, 8, 9, 7, 6 e 8. Qual é a média da turma?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "6,5",
                                "isCorrect": false
                            },
                            {
                                "text": "7,5",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um grupo de 4 números tem média 10. Um quinto número é adicionado ao grupo, e a nova média passa a ser 12. Qual é esse quinto número?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "20",
                                "isCorrect": true
                            },
                            {
                                "text": "12",
                                "isCorrect": false
                            },
                            {
                                "text": "16",
                                "isCorrect": false
                            },
                            {
                                "text": "24",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mediana e moda (e quando a média engana)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Mediana: o valor do meio\n\nA mediana é outro jeito de encontrar o \"centro\" de um conjunto de números, só que em vez de somar e dividir, ela olha pra posição. Pra calcular a mediana, ordena os valores do menor pro maior e pega o valor que fica exatamente no meio da lista.\n\nQuando a quantidade de valores é ímpar, existe um valor exatamente no meio. Quando é par, não existe um único valor central, então a mediana é a média dos dois valores do meio.\n\nPegue de novo as notas 7, 8, 6, 9, 10 e 5 do início do módulo. Ordenadas, ficam 5, 6, 7, 8, 9 e 10. Como são 6 valores (par), a mediana é a média dos dois valores centrais, 7 e 8, que dá 7,5. Repare que, nesse caso, deu o mesmo valor da média (também 7,5). Isso não é regra: acontece porque esse conjunto de notas é bem comportado, sem nenhum valor destoante."
                    },
                    {
                        "type": "code",
                        "value": "notas = [7, 8, 6, 9, 10, 5]\n\n# na mao: ordena e pega o(s) valor(es) do meio\nordenados = sorted(notas)\nprint(ordenados)  # [5, 6, 7, 8, 9, 10]\n\nn = len(ordenados)\nmeio = n // 2\nmediana_manual = (ordenados[meio - 1] + ordenados[meio]) / 2\nprint(mediana_manual)  # 7.5\n\n# com o modulo statistics\nimport statistics\nprint(statistics.median(notas))  # 7.5"
                    },
                    {
                        "type": "text",
                        "value": "## Moda: o valor mais frequente\n\nA moda é a medida de tendência central mais simples de todas: é o valor que mais se repete no conjunto. Ela é especialmente útil com dados categóricos (tipo \"qual sabor de sorvete vendeu mais\"), mas também funciona com números.\n\nUm conjunto pode ter mais de uma moda (quando dois ou mais valores empatam em frequência) ou nenhuma moda clara (quando nenhum valor se repete). Nada impede também que a moda coincida com a média ou a mediana, ou fique bem longe das duas."
                    },
                    {
                        "type": "code",
                        "value": "calcados = [38, 39, 37, 39, 40, 39, 38]\n\n# na mao: conta quantas vezes cada valor aparece\ncontagem = {}\nfor tamanho in calcados:\n    contagem[tamanho] = contagem.get(tamanho, 0) + 1\nprint(contagem)  # {38: 2, 39: 3, 37: 1, 40: 1}\n\nmoda_manual = max(contagem, key=contagem.get)\nprint(moda_manual)  # 39\n\n# com o modulo statistics\nimport statistics\nprint(statistics.mode(calcados))  # 39"
                    },
                    {
                        "type": "text",
                        "value": "## Quando a mediana representa melhor do que a média\n\nAgora o ponto central da aula. Uma empresa pequena tem 7 funcionários, com salários mensais de 2000, 2200, 2300, 2400, 2500 e 2600 reais, mais o salário do dono, de 20000 reais. Calculando a média dos 7 salários, o resultado é 4857,14 reais. Só que nenhum funcionário ganha perto disso: 6 das 7 pessoas ganham entre 2000 e 2600 reais. O salário do dono, um valor bem fora do padrão dos demais, puxou a média inteira pra cima.\n\nA mediana desse mesmo grupo é 2400 reais, bem mais próxima do que a maioria das pessoas realmente recebe. Isso acontece porque a mediana só olha pra posição central: não importa o quão alto ou baixo seja um valor extremo, ele conta como só mais um valor na fila, sem pesar mais que os outros.\n\nComo regra prática: quando os dados são simétricos e sem valores destoantes, média e mediana ficam próximas (como no exemplo das notas). Quando existe um outlier ou a distribuição é bem assimétrica (como no exemplo dos salários), a mediana costuma representar melhor o valor \"típico\"."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Média\", \"Mediana\"], [\"7 salários (com o dono, 20000)\", \"4857,14\", \"2400\"], [\"6 salários (sem o dono)\", \"2333,33\", \"2350\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Média é sensível a cada valor do conjunto. Mediana só liga pra quem está no meio da fila. Quando houver um valor bem fora do padrão, vale perguntar: o que eu quero descrever, a média das contas ou o que é típico pra maioria?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Como se calcula a mediana de um conjunto de números?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ordena os valores e pega o valor que fica bem no meio da lista.",
                                "isCorrect": true
                            },
                            {
                                "text": "Soma todos os valores do conjunto e divide pela quantidade deles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Conta qual valor aparece mais vezes dentro do conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Subtrai o menor valor do conjunto pelo maior valor do conjunto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a mediana dos valores 5, 6, 7 e 8?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "6,5",
                                "isCorrect": true
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            },
                            {
                                "text": "13",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja vendeu calçados nos tamanhos 38, 39, 37, 39, 40, 39 e 38 num dia. Qual é a moda desses tamanhos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "39",
                                "isCorrect": true
                            },
                            {
                                "text": "38",
                                "isCorrect": false
                            },
                            {
                                "text": "37",
                                "isCorrect": false
                            },
                            {
                                "text": "40",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os salários de uma empresa de 7 pessoas são 2000, 2200, 2300, 2400, 2500, 2600 e 20000 reais (o último é o salário do dono). Qual medida representa melhor o salário típico dessa equipe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A mediana, porque ela não é puxada pelo salário bem mais alto do dono.",
                                "isCorrect": true
                            },
                            {
                                "text": "A média, porque ela usa o valor de todos os salários igualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A moda, porque nenhum salário se repete nessa lista de valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "A amplitude, porque ela mostra a diferença entre o maior e o menor salário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto de dados é simétrico e não tem nenhum valor muito fora do padrão. O que se pode esperar da relação entre a média e a mediana nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ficam próximas ou iguais, sem outlier puxando a média pra um lado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A mediana fica sempre bem maior que a média, mesmo sem outliers.",
                                "isCorrect": false
                            },
                            {
                                "text": "A média fica sempre bem maior que a mediana, mesmo sem outliers.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elas não guardam nenhuma relação, mesmo com dados bem comportados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amplitude e a ideia de dispersão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas turmas, a mesma média\n\nAté aqui, média, mediana e moda respondem uma pergunta: qual é o centro dos dados? Mas o centro sozinho não conta a história inteira. Duas turmas podem ter exatamente a mesma média de notas e ainda assim serem bem diferentes uma da outra.\n\nImagine a turma A, com notas 7, 7, 7, 7 e 7. E a turma B, com notas 4, 6, 7, 8 e 10. As duas têm média 7. Mas enquanto todo mundo na turma A tirou a mesma nota, a turma B tem gente de 4 a 10. São situações bem diferentes escondidas atrás do mesmo número."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Turma\", \"Notas dos 5 alunos\", \"Média\"], [\"Turma A\", \"7, 7, 7, 7, 7\", \"7\"], [\"Turma B\", \"4, 6, 7, 8, 10\", \"7\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Amplitude: a medida de dispersão mais simples\n\nA forma mais direta de medir o quanto um conjunto de dados se espalha é a amplitude: a diferença entre o maior e o menor valor. Na turma A, o maior e o menor valor são iguais (7), então a amplitude é 0: não existe dispersão nenhuma. Na turma B, o maior valor é 10 e o menor é 4, então a amplitude é 6.\n\nEsse número de 6 pontos já entrega uma informação que a média sozinha não mostra: entre o aluno que foi pior e o que foi melhor na turma B, existe uma distância considerável."
                    },
                    {
                        "type": "code",
                        "value": "turma_a = [7, 7, 7, 7, 7]\nturma_b = [4, 6, 7, 8, 10]\n\nprint(max(turma_a) - min(turma_a))  # 0\nprint(max(turma_b) - min(turma_b))  # 6\n\n# o modulo statistics nao tem uma funcao pronta pra amplitude:\n# max() e min(), que ja sao do proprio Python, resolvem sozinhos\n\nvendas_a = [100, 102, 98, 101, 99]\nvendas_b = [50, 150, 90, 110, 100]\nprint(max(vendas_a) - min(vendas_a))  # 4\nprint(max(vendas_b) - min(vendas_b))  # 100\n\n# vendas_a e vendas_b tem a mesma media (100), mas amplitudes bem diferentes"
                    },
                    {
                        "type": "text",
                        "value": "## Os limites da amplitude\n\nA amplitude é fácil de calcular, mas tem uma limitação importante: ela só olha pra 2 valores, o maior e o menor, e ignora completamente todos os outros. Se um único valor no extremo mudar, a amplitude muda inteira, mesmo que o resto do conjunto continue exatamente igual.\n\nPor isso a amplitude funciona bem como um primeiro sinal de dispersão, mas não como a medida final. O que a gente realmente quer é uma medida que leve em conta a distância de **todos** os valores até o centro, não só dos dois extremos. É exatamente isso que a variância e o desvio padrão, da próxima aula, vão resolver."
                    },
                    {
                        "type": "quote",
                        "value": "A amplitude conta a distância entre o topo e o fundo, mas não diz nada sobre quem está no meio do caminho. É um primeiro sinal de dispersão, não a palavra final."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a amplitude de um conjunto de dados mede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A diferença entre o maior e o menor valor do conjunto.",
                                "isCorrect": true
                            },
                            {
                                "text": "A soma de todos os valores dividida pela quantidade deles.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor que mais se repete dentro do conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A posição do valor central quando os dados estão ordenados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a amplitude do conjunto 4, 6, 7, 8 e 10?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "6",
                                "isCorrect": true
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As notas da turma A foram 7, 7, 7, 7 e 7. As notas da turma B foram 4, 6, 7, 8 e 10. As duas turmas têm média 7, mas o que a amplitude revela de diferente entre elas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A turma B tem notas bem mais espalhadas; a turma A não tem variação alguma.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas turmas têm exatamente a mesma dispersão, já que a média é igual.",
                                "isCorrect": false
                            },
                            {
                                "text": "A turma A tem notas mais espalhadas, porque todo mundo tirou a mesma nota.",
                                "isCorrect": false
                            },
                            {
                                "text": "A amplitude não pode ser calculada quando duas turmas têm a mesma média.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a amplitude é considerada uma medida de dispersão limitada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela olha só pros dois valores extremos e ignora todos os valores do meio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela exige calcular uma raiz quadrada, o que torna a conta mais difícil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela só funciona em conjuntos de dados com mais de cem valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela sempre resulta em um número negativo quando os dados variam muito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto de vendas diárias tem amplitude 20. O dia de maior venda é substituído por um valor ainda mais alto, e nada mais muda. O que acontece com a amplitude?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumenta, porque o novo valor máximo fica ainda mais distante do mínimo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Diminui, porque um valor mais alto reduz a diferença entre máximo e mínimo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não muda, porque a amplitude ignora qualquer alteração no maior valor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não dá pra saber, porque a amplitude depende da média do conjunto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Variância e desvio padrão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Medindo a distância de cada valor até a média\n\nA amplitude olha só pros extremos. Pra medir dispersão de um jeito que leve em conta **todos** os valores, a ideia é outra: calcular o quanto cada valor se afasta da média, e depois resumir essas distâncias numa única medida.\n\nEsse afastamento de cada valor até a média tem nome: desvio. Pegue de novo a turma B, com notas 4, 6, 7, 8 e 10 (média 7). O desvio de cada nota é o valor menos a média: 4 menos 7 dá menos 3; 6 menos 7 dá menos 1; 7 menos 7 dá 0; 8 menos 7 dá 1; 10 menos 7 dá 3. Cinco desvios: menos 3, menos 1, 0, 1 e 3."
                    },
                    {
                        "type": "text",
                        "value": "## Por que elevar ao quadrado, e por que depois tirar a raiz\n\nRepare em algo nos desvios da turma B: menos 3, menos 1, 0, 1 e 3. Se você somar todos eles, o resultado é 0. Isso não é coincidência: a soma dos desvios em torno da média sempre dá 0, porque os valores acima da média compensam exatamente os valores abaixo dela. Por causa disso, não dá pra usar a soma direta dos desvios como medida de dispersão, ela sempre vai zerar.\n\nA saída é elevar cada desvio ao quadrado antes de somar. Isso resolve dois problemas de uma vez: como todo número ao quadrado fica positivo, os desvios param de se cancelar, e desvios maiores acabam pesando proporcionalmente mais que desvios pequenos. A média desses quadrados tem nome: **variância**.\n\nSó que a variância fica numa unidade estranha (nota ao quadrado, real ao quadrado), difícil de interpretar. Pra voltar pra unidade original dos dados, basta tirar a raiz quadrada da variância. Esse valor final é o **desvio padrão**, e é ele que normalmente usamos pra descrever \"o quanto os dados se espalham\", porque fala a mesma unidade dos dados originais.\n\nVale calcular esse passo a passo pelo menos uma vez na mão, pra entender de onde o número vem. Na prática do dia a dia, o NumPy e o pandas (as próximas ferramentas da sua trilha) já trazem `.std()` e `.var()` prontos, aplicados numa coluna inteira de uma vez."
                    },
                    {
                        "type": "code",
                        "value": "turma_b = [4, 6, 7, 8, 10]\n\n# passo a passo, na mao\nmedia = sum(turma_b) / len(turma_b)\nprint(media)  # 7.0\n\ndesvios = [x - media for x in turma_b]\nprint(desvios)  # [-3.0, -1.0, 0.0, 1.0, 3.0]\nprint(sum(desvios))  # 0.0 (os desvios sempre se cancelam)\n\nquadrados = [d ** 2 for d in desvios]\nprint(quadrados)  # [9.0, 1.0, 0.0, 1.0, 9.0]\n\nvariancia = sum(quadrados) / len(turma_b)\nprint(variancia)  # 4.0\n\ndesvio_padrao = variancia ** 0.5\nprint(desvio_padrao)  # 2.0"
                    },
                    {
                        "type": "code",
                        "value": "import statistics\nturma_b = [4, 6, 7, 8, 10]\nturma_a = [7, 7, 7, 7, 7]\n\n# confirmando a conta na mao com o modulo statistics\nprint(statistics.pvariance(turma_b))  # 4\nprint(statistics.pstdev(turma_b))  # 2.0\n\n# turma a: todo mundo tirou a mesma nota, entao nao ha dispersao\nprint(statistics.pvariance(turma_a))  # 0\nprint(statistics.pstdev(turma_a))  # 0.0\n\n# o Python tambem tem variance() e stdev(), sem o \"p\" na frente:\n# eles dividem por (n - 1) em vez de n, o ajuste usado quando os\n# dados sao uma AMOSTRA que representa uma populacao maior.\n# aqui estamos descrevendo o conjunto inteiro que temos (a turma toda),\n# entao pvariance()/pstdev() sao as contas certas. o modulo 5\n# (amostragem) explica com calma por que existe esse ajuste.\nprint(statistics.variance(turma_b))  # 5\nprint(statistics.stdev(turma_b))  # 2.23606797749979"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Turma\", \"Média\", \"Amplitude\", \"Variância\", \"Desvio padrão\"], [\"Turma A\", \"7\", \"0\", \"0\", \"0\"], [\"Turma B\", \"7\", \"6\", \"4\", \"2\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Variância mede a dispersão em unidades ao quadrado, meio abstratas. Desvio padrão volta pra unidade original dos dados: é a régua que diz, em média, a que distância cada valor fica do centro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a variância e o desvio padrão medem em um conjunto de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O quanto os valores, em média, se afastam da média do conjunto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor mais frequente dentro do conjunto de dados analisado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A posição do valor central quando os dados estão ordenados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença simples entre o maior e o menor valor do conjunto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o desvio padrão costuma ser preferido à variância na hora de interpretar a dispersão dos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque ele volta pra unidade original dos dados, e a variância fica ao quadrado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ele ignora os valores mais próximos da média durante todo o cálculo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele é sempre mais fácil de calcular na prática do que a variância.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele não depende da quantidade de valores que existem no conjunto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As notas da turma B foram 4, 6, 7, 8 e 10 (média 7). Qual é a variância populacional desse conjunto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "4",
                                "isCorrect": true
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "20",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o desvio padrão populacional do conjunto 7, 7, 7, 7 e 7?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "0",
                                "isCorrect": true
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "35",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os tempos de resposta de um servidor, em milissegundos, foram 7, 7, 13 e 13 (média 10). Qual é o desvio padrão populacional desse conjunto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "9",
                                "isCorrect": false
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "1,5",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quartis, IQR e os cinco números",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De dois pedaços pra quatro\n\nA mediana divide um conjunto ordenado em duas metades iguais: 50% dos valores ficam abaixo dela, 50% ficam acima. Os quartis levam essa ideia adiante, dividindo o conjunto em quatro pedaços iguais.\n\nSão 3 pontos de corte. O primeiro quartil, Q1, é o valor abaixo do qual ficam cerca de 25% dos dados. O segundo quartil, Q2, é a própria mediana: 50% dos dados abaixo dele. O terceiro quartil, Q3, é o valor abaixo do qual ficam cerca de 75% dos dados."
                    },
                    {
                        "type": "text",
                        "value": "## Calculando Q1 e Q3 na mão\n\nUm jeito simples de calcular Q1 e Q3 é este: ordena os dados, encontra a mediana (que já é Q2), depois separa os dados em metade inferior e metade superior (sem contar a mediana nessa separação) e calcula a mediana de cada metade.\n\nPegue as notas 4, 5, 5, 6, 7, 7, 8, 9 e 10 de uma turma de 9 alunos, já ordenadas. Com 9 valores, a mediana é o valor bem do meio: 7. A metade inferior é 4, 5, 5 e 6, e a mediana dela (a média entre 5 e 5) é 5: esse é o Q1. A metade superior é 7, 8, 9 e 10, e a mediana dela (a média entre 8 e 9) é 8,5: esse é o Q3."
                    },
                    {
                        "type": "code",
                        "value": "notas = [4, 5, 5, 6, 7, 7, 8, 9, 10]\nordenados = sorted(notas)\n\nimport statistics\nmediana = statistics.median(ordenados)\nprint(mediana)  # 7\n\nmetade_inferior = ordenados[:4]\nmetade_superior = ordenados[5:]\nprint(metade_inferior)  # [4, 5, 5, 6]\nprint(metade_superior)  # [7, 8, 9, 10]\n\nq1 = statistics.median(metade_inferior)\nq3 = statistics.median(metade_superior)\nprint(q1)  # 5.0\nprint(q3)  # 8.5"
                    },
                    {
                        "type": "code",
                        "value": "notas = [4, 5, 5, 6, 7, 7, 8, 9, 10]\n\nimport statistics\nprint(statistics.quantiles(notas, n=4))  # [5.0, 7.0, 8.5]\n\n# a lista devolvida traz, nessa ordem, Q1, a mediana (Q2) e Q3:\n# bate exatamente com o que calculamos na mao"
                    },
                    {
                        "type": "text",
                        "value": "## IQR, os cinco números e a ideia do boxplot\n\nO IQR (intervalo interquartil) é a distância entre Q3 e Q1: no exemplo da turma, 8,5 menos 5, ou seja, 3,5. Esse número mostra a faixa onde está a metade central dos dados, os 50% do meio, ignorando o quarto mais baixo e o quarto mais alto do conjunto. Por olhar só pro miolo dos dados, o IQR é uma medida de dispersão mais resistente a outliers do que a amplitude.\n\nJuntando tudo, chegamos nos cinco números que resumem um conjunto de dados por completo: o mínimo, Q1, a mediana, Q3 e o máximo. Na turma do exemplo: 4, 5, 7, 8,5 e 10.\n\nEsses cinco números são exatamente o que um boxplot desenha. Uma caixa vai de Q1 até Q3 (cobrindo os 50% centrais dos dados), com uma linha marcando a mediana dentro da caixa. Duas linhas finas, chamadas de whiskers, saem da caixa em direção ao mínimo e ao máximo. Na versão mais comum do boxplot, esses whiskers param em 1,5 vez o IQR além de Q1 e Q3, e qualquer valor além disso vira um ponto isolado no gráfico, candidato a outlier, assunto do próximo módulo.\n\nVocê não vai precisar montar esses cinco números na mão toda vez: mais pra frente, com pandas, um único comando `.describe()` devolve o mínimo, os quartis, o máximo, a média e o desvio padrão de uma coluna inteira, tudo de uma vez."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estatística\", \"Valor\"], [\"Mínimo\", \"4\"], [\"Q1 (25%)\", \"5\"], [\"Mediana (Q2, 50%)\", \"7\"], [\"Q3 (75%)\", \"8,5\"], [\"Máximo\", \"10\"], [\"IQR (Q3 - Q1)\", \"3,5\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Os cinco números (mínimo, Q1, mediana, Q3 e máximo) contam, numa linha só, onde os dados começam, onde se concentram e onde terminam: o resumo mais completo que cabe numa tabela pequena."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o primeiro quartil (Q1) de um conjunto de dados representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O valor abaixo do qual ficam cerca de 25% dos dados ordenados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor abaixo do qual ficam cerca de 75% dos dados ordenados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor exatamente no meio de todos os dados ordenados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença entre o maior e o menor valor do conjunto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o IQR (intervalo interquartil) mede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A faixa onde está a metade central dos dados, entre Q1 e Q3.",
                                "isCorrect": true
                            },
                            {
                                "text": "A diferença entre o maior e o menor valor de todo o conjunto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A distância média de cada valor até a média do conjunto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor que aparece com mais frequência dentro do conjunto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os valores 4, 5, 5, 6, 7, 7, 8, 9 e 10 já estão ordenados, com mediana 7. Qual é o primeiro quartil (Q1) desse conjunto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "5,5",
                                "isCorrect": false
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Nesse mesmo conjunto, com Q1 igual a 5 e Q3 igual a 8,5, qual é o valor do IQR?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3,5",
                                "isCorrect": true
                            },
                            {
                                "text": "13,5",
                                "isCorrect": false
                            },
                            {
                                "text": "4,25",
                                "isCorrect": false
                            },
                            {
                                "text": "8,5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto de dados tem mínimo 10, Q1 igual a 20, mediana 30, Q3 igual a 45 e máximo 50. Qual intervalo concentra os 50% centrais dos dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Entre 20 e 45, o intervalo entre o primeiro e o terceiro quartil.",
                                "isCorrect": true
                            },
                            {
                                "text": "Entre 10 e 50, o intervalo entre o valor mínimo e o valor máximo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Entre 10 e 30, o intervalo entre o valor mínimo e a mediana dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Entre 30 e 50, o intervalo entre a mediana e o valor máximo dos dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Distribuições e a curva normal",
        "aulas": [
            {
                "titulo": "Distribuição de frequência e histograma",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Distribuições e a curva normal\n\nNos módulos anteriores você aprendeu a resumir um conjunto de dados em alguns números: média, mediana, moda, desvio padrão, quartis. Esses números são ótimos, mas escondem uma informação importante: **o formato** dos dados. Dois conjuntos podem ter média e desvio padrão parecidos e, mesmo assim, se comportar de um jeito bem diferente quando você olha pra eles de verdade.\n\nEsse módulo é sobre enxergar esse formato: organizar dados numa tabela de frequência, reconhecer quando uma distribuição é simétrica ou puxada pra um lado, entender a curva normal (o \"sino\") e a regra 68-95-99.7, saber o que um outlier faz com suas contas, e usar o z-score pra comparar valores de escalas diferentes.\n\n## Contando quantas vezes cada valor aparece\n\nUma **distribuição de frequência** é a contagem de quantas vezes cada valor (ou faixa de valores) aparece nos seus dados. Se você já usou um dicionário Python pra contar quantas vezes cada palavra se repete numa lista, a lógica é exatamente essa, só que aplicada a números."
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo: as notas de uma turma\n\nImagine as notas (de 0 a 10) de 20 alunos numa prova:\n\n`[5, 6, 7, 8, 6, 7, 9, 7, 8, 6, 7, 5, 9, 7, 8, 6, 7, 10, 8, 7]`\n\nOlhando essa lista corrida é difícil enxergar qualquer padrão. Mas se você contar quantas vezes cada nota aparece, o quadro fica bem mais claro: é basicamente percorrer a lista e, pra cada nota, somar 1 numa contagem, do mesmo jeito que você faria pra contar a frequência de palavras num texto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nota\", \"Frequência\", \"Frequência relativa\"], [\"5\", \"2\", \"10%\"], [\"6\", \"4\", \"20%\"], [\"7\", \"7\", \"35%\"], [\"8\", \"4\", \"20%\"], [\"9\", \"2\", \"10%\"], [\"10\", \"1\", \"5%\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando os valores exatos se repetem pouco: as faixas\n\nNo exemplo das notas, os valores possíveis são poucos (de 0 a 10) e cada um se repete várias vezes. Só que com dados contínuos, como altura ou salário, isso quase não acontece: é raro duas pessoas terem exatamente 1,74 m, embora seja comum várias pessoas ficarem \"perto de 1,70 m a 1,80 m\". Nesses casos, em vez de contar valor por valor, a distribuição de frequência agrupa os dados em **faixas** (também chamadas de intervalos, ou *bins*), como \"1,50 a 1,59 m\", \"1,60 a 1,69 m\" e assim por diante. Cada faixa vira uma linha na tabela, com a contagem de quantos dados caem ali dentro."
                    },
                    {
                        "type": "text",
                        "value": "## A ideia do histograma\n\nUm **histograma** é a versão visual de uma tabela de frequência: um gráfico de barras em que cada barra representa um valor (ou faixa), e a **altura da barra é a frequência**, ou seja, quantos dados caem ali. Diferente de um gráfico de barras categórico, as barras do histograma ficam coladas umas nas outras, porque representam um intervalo contínuo de valores, sem espaço entre uma faixa e a seguinte.\n\nSe você desenhasse o histograma da tabela de notas, veria uma barra baixa em 5, subindo até uma barra bem mais alta em 7 (a nota mais comum), e descendo de novo até uma barra baixinha em 10. Esse sobe e desce das barras é o que chamamos de **formato** da distribuição, e é o assunto da próxima aula."
                    },
                    {
                        "type": "code",
                        "value": "notas = [5, 6, 7, 8, 6, 7, 9, 7, 8, 6, 7, 5, 9, 7, 8, 6, 7, 10, 8, 7]\n\n# contando na mão, com um dicionário\nfrequencia = {}\nfor nota in notas:\n    frequencia[nota] = frequencia.get(nota, 0) + 1\n\nprint(sorted(frequencia.items()))\n# [(5, 2), (6, 4), (7, 7), (8, 4), (9, 2), (10, 1)]\n\n# o mesmo resultado, com a ferramenta pronta da biblioteca padrão\nfrom collections import Counter\n\ncontagem = Counter(notas)\nprint(contagem.most_common())\n# [(7, 7), (6, 4), (8, 4), (5, 2), (9, 2), (10, 1)]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma distribuição de frequência não é nada além de uma contagem organizada: quantas vezes cada valor, ou cada faixa de valores, aparece nos seus dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa tabela de frequência, o número ao lado de cada valor (ou faixa) representa o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quantas vezes aquele valor aparece nos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "A posição do valor quando os dados são ordenados",
                                "isCorrect": false
                            },
                            {
                                "text": "A distância daquele valor até a média dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "O maior valor possível dentro daquela faixa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "De acordo com a tabela de frequência das notas apresentada nesta aula (20 alunos), quantos tiraram nota 7?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num histograma, o que a altura de cada barra representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A frequência dos dados daquele valor ou faixa",
                                "isCorrect": true
                            },
                            {
                                "text": "A média dos valores que caem dentro da faixa",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem da faixa dentro dos dados originais",
                                "isCorrect": false
                            },
                            {
                                "text": "O desvio padrão de todos os dados daquela faixa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que dados contínuos, como altura ou salário, costumam ser agrupados em faixas antes de montar uma tabela de frequência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cada valor exato se repete pouco, e juntar em faixas revela o padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque valores com casas decimais não podem entrar numa tabela de frequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um histograma tradicional nunca pode ter mais de seis faixas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a média só pode ser calculada depois que os dados viram faixas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tabela de frequência com 40 dados no total, uma faixa tem frequência 8. Qual é a frequência relativa dessa faixa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "20%",
                                "isCorrect": true
                            },
                            {
                                "text": "40%",
                                "isCorrect": false
                            },
                            {
                                "text": "8%",
                                "isCorrect": false
                            },
                            {
                                "text": "80%",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Formato: simétrica x assimétrica",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O formato por trás dos números\n\nNa aula passada você viu como organizar dados numa tabela de frequência e como imaginar o histograma que sai dela. Agora é hora de dar nome ao formato que esse histograma desenha. De um jeito geral, uma distribuição pode ser **simétrica** (os dois lados se equilibram) ou **assimétrica** (um lado tem uma cauda mais longa que o outro).\n\nUma distribuição **simétrica** é aquela em que, se você dobrasse o histograma ao meio, um lado seria praticamente um espelho do outro. O pico fica bem no centro, e as barras vão diminuindo de um jeito parecido pros dois lados. Olha esse exemplo: notas de satisfação (de 1 a 7) dadas por 28 clientes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nota de satisfação (1 a 7)\", \"Frequência\"], [\"1\", \"1\"], [\"2\", \"3\"], [\"3\", \"6\"], [\"4\", \"8\"], [\"5\", \"6\"], [\"6\", \"3\"], [\"7\", \"1\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Repare que a sequência de frequências (1, 3, 6, 8, 6, 3, 1) é um espelho: as notas 1 e 7 têm a mesma frequência, 2 e 6 também, e assim por diante. O pico está bem no meio, na nota 4. Se você calcular a média, a mediana e a moda desses dados, as três dão exatamente **4**: numa distribuição simétrica com um único pico, média, mediana e moda tendem a coincidir.\n\nNem toda distribuição é assim tão arrumada. Quando um dos lados tem uma cauda bem mais longa que o outro, ela é **assimétrica** (em inglês, *skewed*). E o nome da assimetria segue a direção da cauda, não a altura do pico: se a cauda longa aponta pra direita (valores bem mais altos, mas raros), a distribuição é **assimétrica à direita** (skew positivo); se a cauda aponta pra esquerda (valores bem mais baixos, mas raros), é **assimétrica à esquerda** (skew negativo)."
                    },
                    {
                        "type": "text",
                        "value": "## Duas histórias, duas caudas\n\nPensa numa pequena empresa com 10 funcionários. Nove deles ganham entre R$ 3 mil e R$ 5 mil, mas o dono tira R$ 20 mil por mês. Esse único salário bem mais alto puxa a **cauda pra direita**: a média sobe bastante, mas a mediana quase não se mexe, porque continua representando o que a maioria da empresa realmente ganha. É o formato clássico de dados de renda: a média engana pra cima porque poucos valores muito altos puxam ela pro seu lado.\n\nAgora pensa numa prova de 10 alunos em que quase todo mundo foi bem (notas 8 e 9), menos um aluno que faltou boa parte da matéria e tirou 1. Esse único valor bem mais baixo puxa a **cauda pra esquerda**: a média cai bastante, mas a mediana continua alta, porque representa o que a maioria da turma fez.\n\nRepare no padrão: a cauda longa **puxa a média** na sua direção, enquanto a mediana, por olhar só pra posição central, resiste bem mais a esse puxão."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\nsalarios = [3, 3, 3, 3, 4, 4, 4, 5, 5, 20]  # em milhares de reais, o último é o dono\n\nmedia = statistics.mean(salarios)\nmediana = statistics.median(salarios)\nprint(media, mediana)\n# 5.4 4.0"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato\", \"Cauda\", \"Média x mediana\", \"Exemplo\"], [\"Simétrica\", \"sem cauda longa de nenhum lado\", \"média = mediana\", \"nota de satisfação bem distribuída\"], [\"Assimétrica à direita (skew positivo)\", \"longa à direita\", \"média > mediana\", \"salário, com poucos ganhando muito mais\"], [\"Assimétrica à esquerda (skew negativo)\", \"longa à esquerda\", \"média < mediana\", \"prova com poucos alunos indo muito mal\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O nome da assimetria segue a cauda, não o pico: cauda longa à direita é assimetria à direita, com a média puxada pra cima; cauda longa à esquerda é assimetria à esquerda, com a média puxada pra baixo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma distribuição simétrica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dois lados do formato se espelham em torno do centro",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os valores do conjunto de dados são iguais entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "A distribuição não tem valor mínimo nem valor máximo definido",
                                "isCorrect": false
                            },
                            {
                                "text": "A média dos dados é sempre exatamente igual a zero",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa distribuição com cauda longa à direita, como ela costuma ser chamada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Assimétrica à direita, ou skew positivo",
                                "isCorrect": true
                            },
                            {
                                "text": "Assimétrica à esquerda, ou skew negativo",
                                "isCorrect": false
                            },
                            {
                                "text": "Simétrica, com dois picos parecidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uniforme, sem nenhuma cauda definida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa distribuição assimétrica à direita (skew positivo), o que costuma acontecer entre média e mediana?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A média fica maior, puxada pelos valores altos da cauda",
                                "isCorrect": true
                            },
                            {
                                "text": "A média fica menor, puxada pelos valores baixos da cauda",
                                "isCorrect": false
                            },
                            {
                                "text": "A média e a mediana ficam sempre exatamente iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "A mediana deixa de poder ser calculada nesse caso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa empresa, nove funcionários ganham entre R$ 3 mil e R$ 5 mil, mas o dono ganha R$ 20 mil. Isso faz com que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "a média fique puxada pra cima e passe a mediana dos salários",
                                "isCorrect": true
                            },
                            {
                                "text": "a mediana fique puxada pra cima e passe a média dos salários",
                                "isCorrect": false
                            },
                            {
                                "text": "a média e a mediana fiquem iguais, pois as duas ignoram outliers",
                                "isCorrect": false
                            },
                            {
                                "text": "o desvio padrão diminua, porque agora há mais um valor no grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um posto registra 5 abastecimentos, em litros: 20, 22, 21, 23 e 90 (o último de um caminhão). Comparando média e mediana desse grupo, é correto dizer que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "a média (35,2) é maior que a mediana (22), puxada pelo valor 90",
                                "isCorrect": true
                            },
                            {
                                "text": "a média (35,2) é menor que a mediana (22), por causa do valor 90",
                                "isCorrect": false
                            },
                            {
                                "text": "a média e a mediana são iguais a 22, pois o valor 90 não afeta nenhuma",
                                "isCorrect": false
                            },
                            {
                                "text": "a mediana (35,2) é maior que a média (22), já que ela considera o maior valor",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A distribuição normal e a regra 68-95-99.7",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A curva mais famosa da estatística\n\nNa aula passada você viu que uma distribuição pode ser simétrica ou puxada pra um lado. Existe uma distribuição simétrica em especial que aparece com tanta frequência, na natureza e em dados do dia a dia, que ganhou um nome só dela: a **distribuição normal**, também chamada de curva do sino (*bell curve*) por causa do seu formato.\n\nA normal fica totalmente definida por só dois números: a **média** (onde fica o centro e o pico da curva) e o **desvio padrão** (o quanto os dados se espalham em torno desse centro). Com só esses dois valores, a curva inteira fica determinada. Erros de medição e a altura de um grupo grande e homogêneo de pessoas são exemplos de coisas que costumam se aproximar bastante desse formato."
                    },
                    {
                        "type": "text",
                        "value": "## O formato da curva, em palavras\n\nComo não dá pra desenhar aqui, vale descrever: a curva normal sobe suavemente de valores baixos até um pico único bem no meio (na média), e desce de novo do outro lado, de um jeito **simétrico**: o lado esquerdo é um espelho do lado direito. Ela nunca é achatada de repente, nem tem mais de um pico. E como é simétrica com um único pico, média, mediana e moda coincidem: ficam todas no mesmo ponto, o centro da curva."
                    },
                    {
                        "type": "text",
                        "value": "## A regra 68-95-99.7\n\nUma das propriedades mais úteis da distribuição normal é que a porcentagem de dados dentro de uma certa distância da média já é conhecida, e ela é sempre a mesma, não importa qual seja a média ou o desvio padrão daquele conjunto específico. É a chamada **regra empírica**, ou regra 68-95-99.7:\n\n- cerca de 68% dos dados ficam a até 1 desvio padrão da média\n- cerca de 95% ficam a até 2 desvios padrão\n- cerca de 99,7% ficam a até 3 desvios padrão\n\nVamos ver isso com números. Imagine uma população hipotética com altura média de 170 cm e desvio padrão de 10 cm."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Intervalo\", \"% dos dados (aprox.)\", \"Exemplo (média 170, desvio 10)\"], [\"média ± 1 desvio\", \"68%\", \"160 cm a 180 cm\"], [\"média ± 2 desvios\", \"95%\", \"150 cm a 190 cm\"], [\"média ± 3 desvios\", \"99,7%\", \"140 cm a 200 cm\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from statistics import NormalDist\n\nalturas = NormalDist(170, 10)  # média 170, desvio padrão 10\n\n# probabilidade de um valor cair dentro de 1 desvio padrão da média\ndentro_de_1_desvio = alturas.cdf(180) - alturas.cdf(160)\nprint(round(dentro_de_1_desvio, 4))\n# 0.6827"
                    },
                    {
                        "type": "text",
                        "value": "## Nem tudo é normal (literalmente)\n\nÉ tentador achar que todo conjunto de dados segue essa curva, mas não é bem assim: dados de renda, por exemplo, costumam ser assimétricos à direita, como você viu na aula passada, e não seguem a normal. A regra 68-95-99.7 só vale quando a distribuição realmente se aproxima do formato de sino.\n\nDuas coisas ainda vão fechar esse módulo: como identificar um valor bem fora da curva (a próxima aula, sobre outliers) e como medir exatamente a que distância da média um valor está (a última aula, sobre z-score), que é justamente a ideia de \"quantos desvios padrão\" que a regra 68-95-99.7 usa."
                    },
                    {
                        "type": "quote",
                        "value": "A curva normal é simétrica, tem um único pico na média, e guarda uma promessa útil: cerca de 68% dos dados a 1 desvio padrão, 95% a 2 desvios, 99,7% a 3 desvios."
                    }
                ],
                "questions": [
                    {
                        "statement": "A distribuição normal (curva do sino) fica totalmente definida por quais dois valores?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A média e o desvio padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "A mediana e a moda",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor mínimo e o máximo",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro e o terceiro quartil",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pela regra 68-95-99.7, aproximadamente que porcentagem dos dados fica dentro de 1 desvio padrão da média?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cerca de 68%",
                                "isCorrect": true
                            },
                            {
                                "text": "Cerca de 95%",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 99,7%",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 50%",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa distribuição normal com média 170 e desvio padrão 10, qual intervalo contém aproximadamente 95% dos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "De 150 a 190",
                                "isCorrect": true
                            },
                            {
                                "text": "De 160 a 180",
                                "isCorrect": false
                            },
                            {
                                "text": "De 140 a 200",
                                "isCorrect": false
                            },
                            {
                                "text": "De 170 a 190",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa curva normal, onde fica o ponto mais alto (o pico) da curva?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na média, que coincide com a mediana e a moda",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre no valor zero, não importa a média dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Numa das duas extremidades da curva, perto da cauda",
                                "isCorrect": false
                            },
                            {
                                "text": "Na mediana, mas nunca coincide com a média",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa distribuição normal, 95% dos dados ficam a até 2 desvios padrão da média. O que se pode dizer sobre os 5% restantes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ficam nas duas caudas, cerca de 2,5% em cada lado",
                                "isCorrect": true
                            },
                            {
                                "text": "Ficam todos concentrados numa única cauda, à direita",
                                "isCorrect": false
                            },
                            {
                                "text": "Representam valores idênticos à média da distribuição",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existem, pois a regra cobre 100% dos dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Outliers e seu efeito",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando um valor foge do padrão\n\nUm **outlier** é um valor que se destaca bastante do resto dos dados, muito mais alto ou muito mais baixo que a maioria deles. Você já esbarrou num, sem que a gente usasse esse nome: lá na aula sobre formato da distribuição, vimos os 10 salários (em milhares de reais) `[3, 3, 3, 3, 4, 4, 4, 5, 5, 20]`, em que o dono da empresa ganha R$ 20 mil enquanto o resto do time fica entre R$ 3 mil e R$ 5 mil. O 20 é o outlier desse conjunto.\n\nVale uma ressalva: nem todo outlier é erro de digitação. Às vezes é um dado real e importante (o salário do dono é mesmo R$ 20 mil), e às vezes é mesmo um erro (alguém digitou a idade 200 em vez de 20). A estatística ajuda a **encontrar** o valor fora do padrão; decidir se ele é legítimo depende de conhecer os dados."
                    },
                    {
                        "type": "text",
                        "value": "## O estrago que ele faz na média e no desvio\n\nCompare o que acontece com média, mediana e desvio padrão desse grupo de salários, com e sem o outlier de R$ 20 mil:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Medida\", \"Com o outlier (mil R$)\", \"Sem o outlier (mil R$)\"], [\"Média\", \"5,4\", \"3,78\"], [\"Mediana\", \"4,0\", \"4,0\"], [\"Desvio padrão\", \"5,19\", \"0,83\"]]"
                    },
                    {
                        "type": "text",
                        "value": "A mediana praticamente não se mexe (4,0 nos dois casos), porque ela olha só pra posição central e não se importa com o quão extremo é o valor mais alto. Já a média salta de 3,78 para 5,4, um aumento de mais de 40%. E o desvio padrão é ainda mais sensível: salta de 0,83 para 5,19, mais de 6 vezes maior. Basta um único valor extremo pra fazer o desvio padrão parecer que os dados são muito mais espalhados do que realmente são, tirando aquele valor."
                    },
                    {
                        "type": "text",
                        "value": "## Encontrando outliers com o IQR\n\nNo módulo passado você calculou quartis e o IQR (a diferença entre o terceiro e o primeiro quartil, `Q3 - Q1`). Uma forma bem usada de detectar outliers é a **regra de 1,5 vezes o IQR**: qualquer valor abaixo de `Q1 - 1,5 * IQR` ou acima de `Q3 + 1,5 * IQR` é tratado como outlier.\n\nVamos aplicar isso nos salários. Separando a metade de baixo `[3, 3, 3, 3, 4]` e a metade de cima `[4, 4, 5, 5, 20]`, a mediana de cada uma dá Q1 = 3 e Q3 = 5, então o IQR é 2.\n\nOutra forma comum de detectar outlier é pelo **z-score** (a quantos desvios padrão da média um valor está): valores com z-score maior que 3 ou menor que -3 costumam ser tratados como fora da curva. A próxima aula é inteira sobre como calcular isso."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\nsalarios = sorted([3, 3, 3, 3, 4, 4, 4, 5, 5, 20])\n\nmetade_baixa = salarios[:5]   # [3, 3, 3, 3, 4]\nmetade_alta = salarios[5:]    # [4, 4, 5, 5, 20]\n\nq1 = statistics.median(metade_baixa)\nq3 = statistics.median(metade_alta)\niqr = q3 - q1\nprint(q1, q3, iqr)\n# 3 5 2\n\nlimite_inferior = q1 - 1.5 * iqr\nlimite_superior = q3 + 1.5 * iqr\nprint(limite_inferior, limite_superior)\n# 0.0 8.0\n\noutliers = [x for x in salarios if x < limite_inferior or x > limite_superior]\nprint(outliers)\n# [20]"
                    },
                    {
                        "type": "quote",
                        "value": "Outlier não é xingamento nem sempre é erro: é só um valor que foge muito do padrão. Ele distorce a média e o desvio padrão com força, e mal encosta na mediana."
                    }
                ],
                "questions": [
                    {
                        "statement": "De forma geral, o que é um outlier?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um valor que se destaca bastante dos demais dados do conjunto",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor que aparece com mais frequência no conjunto de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor exatamente igual à média do conjunto de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer valor que fique entre o primeiro e o terceiro quartil",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Entre média, mediana, desvio padrão e variância, qual costuma ser a mais resistente à presença de um outlier?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A mediana",
                                "isCorrect": true
                            },
                            {
                                "text": "A média",
                                "isCorrect": false
                            },
                            {
                                "text": "O desvio padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "A variância",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num conjunto de dados em que um valor é bem maior que os demais (um outlier alto), o que costuma acontecer com a média?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela aumenta, puxada na direção daquele valor extremo",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela diminui, porque o outlier reduz a soma dividida pelos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela permanece igual, porque a média ignora valores fora do padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela fica igual à mediana, já que as duas se ajustam ao outlier",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se o primeiro quartil (Q1) de um conjunto é 10 e o terceiro quartil (Q3) é 18, qual é o limite superior pela regra do IQR (Q3 + 1,5 vezes o IQR)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "30",
                                "isCorrect": true
                            },
                            {
                                "text": "26",
                                "isCorrect": false
                            },
                            {
                                "text": "12",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto tem Q1 = 40 e Q3 = 60 (IQR = 20). Pela regra de 1,5 vezes o IQR, qual destes valores seria classificado como outlier?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "95, porque está acima do limite superior de 90",
                                "isCorrect": true
                            },
                            {
                                "text": "85, porque está acima do terceiro quartil de 60",
                                "isCorrect": false
                            },
                            {
                                "text": "15, porque está abaixo do primeiro quartil de 40",
                                "isCorrect": false
                            },
                            {
                                "text": "55, porque está entre o primeiro e o terceiro quartil",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "z-score e padronização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A quantos desvios você está da média\n\nAo longo desse módulo você viu a média, o desvio padrão, a curva normal e os outliers. O **z-score** junta tudo isso numa única pergunta: a quantos desvios padrão da média esse valor está?\n\nA fórmula é simples:\n\n`z = (x - média) / desvio padrão`\n\nSe `z` for positivo, o valor está acima da média; se for negativo, está abaixo; se for zero, o valor é exatamente a média. E o tamanho do número diz o quão longe: um z-score de 2 significa \"2 desvios padrão acima da média\", não importa qual seja a escala original dos dados."
                    },
                    {
                        "type": "text",
                        "value": "## Por que padronizar: comparando coisas diferentes\n\nEsse \"não importa a escala original\" é o pulo do gato. Imagine um aluno que tirou 85 numa prova de matemática (média da turma 70, desvio padrão 10) e 700 num exame padronizado de outra disciplina (média 650, desvio padrão 50). Em qual prova ele foi relativamente melhor?\n\nComparar 85 com 700 direto não faz sentido, são escalas completamente diferentes. Mas dá pra transformar as duas notas em z-score e comparar numa escala comum: quantos desvios padrão cada uma ficou acima da média da sua própria prova."
                    },
                    {
                        "type": "code",
                        "value": "def z_score(valor, media, desvio):\n    return (valor - media) / desvio\n\nz_matematica = z_score(85, 70, 10)\nz_outra_prova = z_score(700, 650, 50)\n\nprint(z_matematica, z_outra_prova)\n# 1.5 1.0"
                    },
                    {
                        "type": "text",
                        "value": "Mesmo com uma nota absoluta menor (85 contra 700), o z-score de matemática (1,5) é maior que o da outra prova (1,0). Isso quer dizer que, **relativamente** ao resto de cada turma, o desempenho em matemática foi melhor: o aluno ficou mais desvios padrão acima da média da sua prova do que na outra. Padronizar com z-score é assim que se compara maçã com laranja: nota de prova, altura, salário, qualquer variável numérica vira a mesma escala, a de \"desvios padrão de distância da média\".\n\nUm exemplo mais direto, com a altura hipotética de média 170 cm e desvio padrão 10 cm que você viu lá na aula da curva normal:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Altura (cm)\", \"z-score\", \"Interpretação\"], [\"150\", \"-2,0\", \"2 desvios abaixo da média\"], [\"160\", \"-1,0\", \"1 desvio abaixo da média\"], [\"170\", \"0,0\", \"é a própria média\"], [\"180\", \"1,0\", \"1 desvio acima da média\"], [\"190\", \"2,0\", \"2 desvios acima da média\"], [\"200\", \"3,0\", \"3 desvios acima da média (raro)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo: tudo se conecta\n\nO z-score é o elo que faltava entre os assuntos desse módulo. A regra 68-95-99.7 pode ser reescrita em termos de z-score: cerca de 68% dos dados têm z-score entre -1 e 1, cerca de 95% entre -2 e 2, e cerca de 99,7% entre -3 e 3. E a detecção de outlier por z-score que a aula passada citou é exatamente isso: valores com z-score acima de 3 ou abaixo de -3 são raros o suficiente pra chamar atenção.\n\nFazer isso na mão, item por item, funciona bem pra entender a lógica. Na prática, com um `DataFrame` do pandas (que você vai conhecer numa trilha futura), dá pra padronizar uma coluna inteira numa linha só. Por enquanto, o que importa é a intuição: z-score é distância da média, medida em desvios padrão."
                    },
                    {
                        "type": "quote",
                        "value": "Z-score é a régua universal da estatística: transforma qualquer valor, de qualquer escala, numa única pergunta em comum, a quantos desvios padrão da média ele está."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o z-score de um valor indica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A quantos desvios padrão esse valor está de distância da média",
                                "isCorrect": true
                            },
                            {
                                "text": "A porcentagem exata de dados que são menores que esse valor",
                                "isCorrect": false
                            },
                            {
                                "text": "A posição exata desse valor quando os dados são ordenados",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença entre esse valor e o maior valor do conjunto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a fórmula do z-score de um valor, dado a média e o desvio padrão da distribuição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "z = (valor menos a média) dividido pelo desvio padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "z = (valor mais a média) dividido pelo desvio padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "z = (valor menos a média) multiplicado pelo desvio padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "z = a média dividida por (valor menos o desvio padrão)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa distribuição com média 50 e desvio padrão 5, qual é o z-score do valor 60?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2,0",
                                "isCorrect": true
                            },
                            {
                                "text": "1,0",
                                "isCorrect": false
                            },
                            {
                                "text": "10,0",
                                "isCorrect": false
                            },
                            {
                                "text": "0,5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aluno tirou 80 numa prova (média 70, desvio padrão 5) e 78 em outra (média 60, desvio padrão 6). Em qual prova ele teve desempenho relativamente melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na segunda: o z-score dela (3,0) é maior que o da primeira (2,0)",
                                "isCorrect": true
                            },
                            {
                                "text": "Na primeira, já que a nota 80 é maior que 78 em valor absoluto",
                                "isCorrect": false
                            },
                            {
                                "text": "Nas duas por igual, pois as notas absolutas ficaram próximas",
                                "isCorrect": false
                            },
                            {
                                "text": "Na primeira, porque seu desvio padrão (5) é menor que o da segunda (6)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um valor tem z-score igual a 2,5. Usando a regra 68-95-99.7 como referência, esse valor está:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fora da faixa de 95% (2 desvios), mas dentro da de 99,7% (3 desvios)",
                                "isCorrect": true
                            },
                            {
                                "text": "Dentro da faixa de 68% (1 desvio), que cobre a maior parte dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Fora da faixa de 99,7% (3 desvios), um valor praticamente impossível",
                                "isCorrect": false
                            },
                            {
                                "text": "Exatamente no limite entre a faixa de 95% e a de 99,7%",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Probabilidade",
        "aulas": [
            {
                "titulo": "O que é probabilidade: espaço amostral e eventos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 4 - Probabilidade\n\nVocê já ouviu frases como \"tem 70% de chance de chover\" ou \"as chances são de 1 em 6\". Isso é probabilidade: uma forma de medir o quão provável é que algo aconteça, usando um número.\n\n## Um número entre 0 e 1\n\nProbabilidade é sempre um número entre 0 e 1 (ou, se preferir, entre 0% e 100%).\n\n- **0** significa que o evento é impossível.\n- **1** significa que o evento é certo.\n- **0,5** significa que o evento tem metade de chance de acontecer, como cara ou coroa numa moeda honesta.\n\nQuanto mais perto de 1, mais provável o evento. Quanto mais perto de 0, mais improvável."
                    },
                    {
                        "type": "text",
                        "value": "## Frequentista x teórica\n\nExistem duas formas comuns de pensar em probabilidade.\n\nA visão **frequentista** olha pra frequência a longo prazo: se você jogar uma moeda 1000 vezes, e ela der cara perto de 500 vezes, você diz que a probabilidade de cara é próxima de 0,5. É uma probabilidade que você observa repetindo o experimento muitas vezes.\n\nA visão **teórica** (ou clássica) calcula a probabilidade sem precisar experimentar, contando os resultados possíveis: se a moeda tem dois lados igualmente prováveis, a probabilidade de cara é 1 dividido por 2, ou seja, 0,5.\n\nNa prática, as duas costumam concordar quando o experimento é repetido muitas vezes, e é isso que a simulação em Python mais adiante nesta aula vai mostrar."
                    },
                    {
                        "type": "text",
                        "value": "## Espaço amostral e evento\n\nPra falar de probabilidade com precisão, dois termos aparecem o tempo todo:\n\n- **Espaço amostral**: o conjunto de todos os resultados possíveis de um experimento. No lançamento de um dado de 6 faces, o espaço amostral é {1, 2, 3, 4, 5, 6}.\n- **Evento**: um subconjunto do espaço amostral, ou seja, um ou mais resultados que você quer observar. \"Sair um número par\" é um evento: corresponde aos resultados {2, 4, 6}.\n\nQuando todos os resultados são igualmente prováveis, a probabilidade teórica de um evento é:\n\n`P(evento) = número de resultados favoráveis / número total de resultados`\n\nPro evento \"sair par\" no dado: 3 resultados favoráveis (2, 4 e 6) entre 6 possíveis, ou seja, P = 3/6 = 0,5."
                    },
                    {
                        "type": "code",
                        "value": "import random\n\nlancamentos = 10000\npares = 0\n\nfor _ in range(lancamentos):\n    dado = random.randint(1, 6)\n    if dado % 2 == 0:\n        pares += 1\n\nprobabilidade_simulada = pares / lancamentos\nprint(probabilidade_simulada)\n# resultado próximo de 0.5 (3 dos 6 lados do dado são pares: 2, 4 e 6)"
                    },
                    {
                        "type": "text",
                        "value": "Repare que o resultado da simulação não é exatamente 0,5: é próximo de 0,5. Com 10 mil repetições, a frequência observada se aproxima bastante do valor teórico, mas raramente bate exatamente. Se você rodasse o código de novo, o resultado mudaria um pouco, sempre girando em torno de 0,5.\n\nEssa é a essência da visão frequentista: o valor teórico é o que a frequência observada tende a se aproximar quando o número de repetições cresce."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Evento\", \"Resultados favoráveis\", \"Probabilidade\"], [\"Sair um número par\", \"2, 4, 6\", \"3/6 = 0,5\"], [\"Sair um número maior que 4\", \"5, 6\", \"2/6 ≈ 0,33\"], [\"Sair o número 1\", \"1\", \"1/6 ≈ 0,17\"], [\"Sair um número menor que 7\", \"1, 2, 3, 4, 5, 6\", \"6/6 = 1\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Probabilidade não tenta acertar o resultado de uma única tentativa: ela descreve o padrão que emerge quando o mesmo experimento se repete muitas e muitas vezes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa escala de probabilidade, o que significa um valor igual a 0?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O evento é impossível, não pode acontecer",
                                "isCorrect": true
                            },
                            {
                                "text": "O evento é certo, vai acontecer sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento acontece em metade das tentativas",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento ainda não foi observado nenhuma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve o espaço amostral de um lançamento de moeda comum?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conjunto com os dois resultados possíveis: cara e coroa",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto com três resultados possíveis: cara, coroa e borda",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o resultado cara, o mais citado nos exemplos",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de todas as moedas já lançadas na história",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma caixa tem 10 bolas numeradas de 1 a 10. Ao sortear uma bola ao acaso, qual é a probabilidade de sair um número maior que 7?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "0,3, pois 8, 9 e 10 são os três números maiores que 7",
                                "isCorrect": true
                            },
                            {
                                "text": "0,7, pois sete números da caixa são menores ou iguais a 7",
                                "isCorrect": false
                            },
                            {
                                "text": "0,5, pois metade dos números é considerada maior",
                                "isCorrect": false
                            },
                            {
                                "text": "0,8, pois o oitavo número já é maior que 7",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um baralho tem 52 cartas, divididas em 4 naipes de 13 cartas cada (paus, copas, espadas e ouros). Qual é a probabilidade de tirar uma carta de copas ao acaso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "0,25, pois 13 das 52 cartas pertencem ao naipe copas",
                                "isCorrect": true
                            },
                            {
                                "text": "0,13, pois esse é o total de cartas de copas no baralho",
                                "isCorrect": false
                            },
                            {
                                "text": "0,50, pois copas é uma de duas cores possíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "0,04, pois apenas uma carta de copas sai por vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A fórmula \"número de resultados favoráveis dividido pelo total de resultados\" calcula a probabilidade corretamente quando:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Todos os resultados possíveis são igualmente prováveis",
                                "isCorrect": true
                            },
                            {
                                "text": "O experimento é repetido pelo menos mil vezes seguidas",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento estudado tem exatamente dois resultados possíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "A probabilidade teórica e a frequentista já são conhecidas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Complemento e regra da adição",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O complemento: a probabilidade do \"não acontecer\"\n\nToda vez que você sabe a probabilidade de um evento acontecer, também sabe a probabilidade dele não acontecer, sem nenhum cálculo complicado. É a regra do complemento:\n\n`P(não A) = 1 - P(A)`\n\nSe a probabilidade de tirar um 6 num dado é 1/6, a probabilidade de não tirar um 6 é 1 - 1/6 = 5/6. Faz sentido: dos 6 resultados possíveis, 5 não são o número 6.\n\nEssa regra parece óbvia, mas é útil demais na prática: às vezes calcular \"não acontecer\" é bem mais fácil do que calcular \"acontecer\" diretamente."
                    },
                    {
                        "type": "text",
                        "value": "## Regra da adição: a probabilidade do \"ou\"\n\nQuando você quer saber a chance de o evento A ou o evento B acontecer, soma as probabilidades, mas com cuidado com quem aparece nos dois ao mesmo tempo.\n\nPense num baralho de 52 cartas. Qual é a probabilidade de tirar uma carta de copas ou um rei?\n\n- P(copas) = 13/52\n- P(rei) = 4/52\n- O rei de copas está nos dois grupos: somar 13/52 + 4/52 direto conta o rei de copas duas vezes.\n\nPor isso a regra da adição desconta a sobreposição:\n\n`P(A ou B) = P(A) + P(B) - P(A e B)`\n\nNo exemplo: P(copas ou rei) = 13/52 + 4/52 - 1/52 = 16/52 ≈ 0,31."
                    },
                    {
                        "type": "text",
                        "value": "## Eventos mutuamente exclusivos\n\nAlguns eventos nunca acontecem ao mesmo tempo: são os mutuamente exclusivos. Se você lança um dado uma vez, não tem como sair 2 e 5 juntos. Não existe sobreposição, então P(A e B) = 0, e a regra da adição fica mais simples:\n\n`P(A ou B) = P(A) + P(B)`\n\nP(sair 2 ou sair 5) = 1/6 + 1/6 = 2/6 ≈ 0,33.\n\nA pergunta que vale sempre fazer antes de somar duas probabilidades é: esses dois eventos podem acontecer juntos? Se a resposta for não, pode somar direto. Se for sim, precisa descontar a sobreposição."
                    },
                    {
                        "type": "code",
                        "value": "import random\n\nlancamentos = 10000\ncontagem = 0\n\nfor _ in range(lancamentos):\n    dado = random.randint(1, 6)\n    par = dado % 2 == 0\n    maior_que_4 = dado > 4\n    if par or maior_que_4:\n        contagem += 1\n\nprobabilidade_simulada = contagem / lancamentos\nprint(probabilidade_simulada)\n# resultado próximo de 0.667 (2, 4, 5 e 6 satisfazem par ou maior que 4)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Os eventos podem ocorrer juntos?\", \"Fórmula\"], [\"Sair 2 ou sair 5 num dado\", \"Não\", \"P(A) + P(B)\"], [\"Tirar copas ou tirar rei num baralho\", \"Sim (rei de copas)\", \"P(A) + P(B) - P(A e B)\"], [\"Sair cara ou sair coroa numa moeda\", \"Não\", \"P(A) + P(B)\"], [\"Ser par ou maior que 4 num dado\", \"Sim (o número 6)\", \"P(A) + P(B) - P(A e B)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de somar duas probabilidades, pergunte: os dois eventos podem acontecer ao mesmo tempo? A resposta muda a conta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Se a probabilidade de chover amanhã é 0,3, qual é a probabilidade de NÃO chover?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "0,7, pois 1 menos 0,3 resulta em 0,7",
                                "isCorrect": true
                            },
                            {
                                "text": "0,3, pois a chance de não chover se repete",
                                "isCorrect": false
                            },
                            {
                                "text": "0,6, pois a metade de 0,3 não conta como chuva",
                                "isCorrect": false
                            },
                            {
                                "text": "1,3, pois soma a certeza à chance de chuva",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois eventos são chamados de mutuamente exclusivos quando:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não podem acontecer juntos, no mesmo experimento",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre acontecem juntos, um depende do outro",
                                "isCorrect": false
                            },
                            {
                                "text": "Têm exatamente a mesma probabilidade de ocorrer",
                                "isCorrect": false
                            },
                            {
                                "text": "Pertencem a espaços amostrais diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num lançamento de um dado de 6 faces, qual é a probabilidade de sair o número 2 ou o número 5?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2/6, aproximadamente 0,33, somando as duas probabilidades",
                                "isCorrect": true
                            },
                            {
                                "text": "1/6, aproximadamente 0,17, considerando um resultado só",
                                "isCorrect": false
                            },
                            {
                                "text": "4/6, aproximadamente 0,67, somando todos os pares possíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "1/2, exatamente 0,50, contando dois entre quatro relevantes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num baralho de 52 cartas (13 de cada naipe), qual é a probabilidade de tirar uma carta de ouros ou uma carta de valor 10?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "16/52, aproximadamente 0,31, descontando o 10 de ouros",
                                "isCorrect": true
                            },
                            {
                                "text": "17/52, aproximadamente 0,33, somando ouros e cartas de valor 10",
                                "isCorrect": false
                            },
                            {
                                "text": "13/52, aproximadamente 0,25, considerando só o naipe ouros",
                                "isCorrect": false
                            },
                            {
                                "text": "4/52, aproximadamente 0,08, considerando só as cartas de valor 10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a fórmula P(A ou B) = P(A) + P(B) funciona sem descontar sobreposição quando A e B são mutuamente exclusivos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque, sendo mutuamente exclusivos, P(A e B) é igual a zero",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque, nesse caso, P(A) e P(B) já vêm somadas de fábrica",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque eventos mutuamente exclusivos têm sempre a mesma probabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a sobreposição só existe em espaços amostrais grandes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Regra da multiplicação e independência",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Regra da multiplicação: a probabilidade do \"e\"\n\nEnquanto a regra da adição responde \"qual a chance de A ou B\", a regra da multiplicação responde \"qual a chance de A e B acontecerem juntos\".\n\nQuando dois eventos são independentes (o resultado de um não influencia o outro), a probabilidade dos dois acontecerem juntos é o produto das probabilidades individuais:\n\n`P(A e B) = P(A) x P(B)`\n\nExemplo: jogar uma moeda duas vezes. A probabilidade de dar cara no primeiro lançamento é 1/2, e a probabilidade de dar cara no segundo também é 1/2, sem nenhuma relação com o primeiro. Então:\n\nP(cara e cara) = 1/2 x 1/2 = 1/4 = 0,25"
                    },
                    {
                        "type": "text",
                        "value": "## O que significa independência\n\nDois eventos são independentes quando o resultado de um não muda nada sobre a probabilidade do outro. O segundo lançamento da moeda não \"lembra\" o que saiu no primeiro: a moeda não tem memória.\n\nOutro exemplo: lançar dois dados. A probabilidade de tirar 6 no primeiro dado é 1/6, e no segundo também é 1/6, independente do que saiu no primeiro. A chance de tirar 6 nos dois é:\n\nP(6 e 6) = 1/6 x 1/6 = 1/36 ≈ 0,028\n\nMenos de 3%: sair o mesmo número duas vezes seguidas é raro, mesmo cada resultado individual não sendo raro."
                    },
                    {
                        "type": "text",
                        "value": "## Eventos dependentes: quando um influencia o outro\n\nNem todo par de eventos é independente. Quando o resultado de um evento muda a probabilidade do outro, eles são dependentes.\n\nExemplo clássico: tirar duas cartas de um baralho de 52, sem devolver a primeira. Na primeira tirada, a chance de sair um rei é 4/52. Mas, se a primeira carta tirada já foi um rei, sobram só 3 reis entre 51 cartas: a probabilidade do segundo rei mudou para 3/51.\n\n`P(rei e rei, sem reposição) = 4/52 x 3/51 ≈ 0,0045`\n\nO erro mais comum aqui é tratar esse caso como se fosse independente e calcular 4/52 x 4/52. Parece uma diferença pequena, mas é conceitualmente errada: a segunda probabilidade não é mais 4/52, porque o baralho mudou depois da primeira tirada. Sempre que \"tirar sem devolver\" aparecer no problema, é sinal de evento dependente."
                    },
                    {
                        "type": "code",
                        "value": "import random\n\ntentativas = 10000\nduas_caras = 0\n\nfor _ in range(tentativas):\n    primeiro_lancamento = random.choice([\"cara\", \"coroa\"])\n    segundo_lancamento = random.choice([\"cara\", \"coroa\"])\n    if primeiro_lancamento == \"cara\" and segundo_lancamento == \"cara\":\n        duas_caras += 1\n\nprobabilidade_simulada = duas_caras / tentativas\nprint(probabilidade_simulada)\n# resultado próximo de 0.25, igual a 1/2 x 1/2 calculado à mão"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Independente ou dependente?\", \"Cálculo\"], [\"Duas moedas lançadas separadamente\", \"Independente\", \"1/2 x 1/2 = 1/4\"], [\"Dois dados lançados juntos\", \"Independente\", \"1/6 x 1/6 = 1/36\"], [\"Duas cartas tiradas sem devolver a primeira\", \"Dependente\", \"4/52 x 3/51 ≈ 0,0045\"], [\"Uma carta tirada, devolvida, e tirada de novo\", \"Independente\", \"4/52 x 4/52 ≈ 0,0059\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de multiplicar duas probabilidades, pergunte: o que aconteceu no primeiro evento muda alguma coisa no segundo? Se mudar, o evento é dependente, e a segunda probabilidade precisa ser recalculada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dois eventos são independentes quando:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O resultado de um não muda a probabilidade do outro",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois sempre acontecem exatamente ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dos dois tem probabilidade igual a zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois pertencem ao mesmo espaço amostral",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a probabilidade de lançar uma moeda duas vezes e obter cara nas duas vezes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "0,25, resultado de multiplicar 1/2 por 1/2",
                                "isCorrect": true
                            },
                            {
                                "text": "0,5, a mesma chance de um único lançamento",
                                "isCorrect": false
                            },
                            {
                                "text": "1,0, a certeza de que cara aparece em algum lançamento",
                                "isCorrect": false
                            },
                            {
                                "text": "0,75, a soma das chances dos dois lançamentos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tira uma carta de um baralho, anota o resultado, devolve a carta, embaralha e tira outra carta. Esses dois eventos são:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Independentes, a carta devolvida refaz o baralho original",
                                "isCorrect": true
                            },
                            {
                                "text": "Dependentes, a segunda tirada sempre repete a primeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Independentes, cartas nunca influenciam probabilidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Dependentes, tirar duas cartas sempre reduz o baralho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois dados são lançados juntos. Qual é a probabilidade de sair 6 no primeiro dado e 6 no segundo dado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1/36, aproximadamente 0,028, multiplicando 1/6 por 1/6",
                                "isCorrect": true
                            },
                            {
                                "text": "1/6, aproximadamente 0,17, a chance de cada dado isoladamente",
                                "isCorrect": false
                            },
                            {
                                "text": "2/6, aproximadamente 0,33, somando as duas probabilidades",
                                "isCorrect": false
                            },
                            {
                                "text": "1/12, aproximadamente 0,083, dividindo 1/6 por 1/6 vezes dois",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um baralho tem 4 reis entre as 52 cartas. Ao tirar duas cartas seguidas, sem devolver a primeira, qual é a probabilidade de as duas serem reis?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aproximadamente 0,0045, pois a segunda chance vira 3/51",
                                "isCorrect": true
                            },
                            {
                                "text": "Aproximadamente 0,0059, pois a segunda chance segue 4/52",
                                "isCorrect": false
                            },
                            {
                                "text": "Aproximadamente 0,15, pois a chance cresce a cada tirada",
                                "isCorrect": false
                            },
                            {
                                "text": "Aproximadamente 0,077, pois considera só a primeira carta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Probabilidade condicional e a intuição de Bayes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Probabilidade condicional: quando uma informação muda o jogo\n\nAté agora, calculamos probabilidades sem levar em conta nenhuma informação extra. Mas, no mundo real, você quase sempre sabe alguma coisa antes de calcular uma probabilidade, e isso muda a conta.\n\nA probabilidade condicional é a probabilidade de um evento A acontecer, sabendo que um evento B já aconteceu. Se escreve P(A|B), lido como \"probabilidade de A dado B\". A fórmula é:\n\n`P(A|B) = P(A e B) / P(B)`\n\nExemplo simples com um dado: qual é a probabilidade de sair um número par, sabendo que o resultado foi maior que 3? Os resultados maiores que 3 são {4, 5, 6}, três possibilidades. Entre eles, os pares são {4, 6}, dois resultados. Então P(par | maior que 3) = 2/3 ≈ 0,67, bem diferente dos 3/6 = 0,5 que seria a probabilidade de par sem nenhuma informação extra."
                    },
                    {
                        "type": "text",
                        "value": "## Um caso com dados: estudar e passar na prova\n\nProbabilidade condicional aparece o tempo todo em dados reais. Imagine 100 alunos de uma turma: alguns estudaram pra prova, outros não, e o resultado (passou ou não passou) foi registrado assim:\n\nSem nenhuma informação extra, a probabilidade de um aluno qualquer ter passado é 55/100 = 0,55.\n\nMas, se você souber que um aluno específico estudou, a pergunta muda: entre os 60 alunos que estudaram, 45 passaram. A probabilidade condicional é:\n\nP(passou | estudou) = 45/60 = 0,75\n\nSaber que o aluno estudou aumentou a chance estimada de aprovação de 55% para 75%. É exatamente isso que a probabilidade condicional faz: incorpora uma informação nova pra refinar a estimativa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Passou\", \"Não passou\", \"Total\"], [\"Estudou\", \"45\", \"15\", \"60\"], [\"Não estudou\", \"10\", \"30\", \"40\"], [\"Total\", \"55\", \"45\", \"100\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado: P(A|B) não é igual a P(B|A)\n\nCom a mesma tabela dá pra calcular o caminho inverso: entre os alunos que não estudaram, quantos passaram? Foram 10 em 40, então P(passou | não estudou) = 10/40 = 0,25. Estudar quase triplicou a chance de aprovação nesse grupo (25% contra 75%).\n\nAgora repare numa confusão muito comum: P(passou | estudou) não é a mesma coisa que P(estudou | passou). A primeira já calculamos: 45/60 = 0,75. A segunda pergunta outra coisa, \"entre quem passou, quantos estudaram\": 45 dos 55 que passaram, ou seja, P(estudou | passou) = 45/55 ≈ 0,818.\n\nOs dois números partem da mesma tabela, mas respondem perguntas diferentes, e trocar um pelo outro é um erro clássico ao interpretar dados."
                    },
                    {
                        "type": "text",
                        "value": "## A intuição por trás do Teorema de Bayes\n\nO Teorema de Bayes é, no fundo, uma forma organizada de fazer o que você acabou de fazer: usar uma evidência nova pra atualizar uma crença.\n\nPensa assim: você parte de uma crença inicial (a probabilidade a priori), por exemplo, \"55% dos alunos passam\". Aí chega uma evidência nova, \"esse aluno estudou\", e você atualiza a crença pra uma probabilidade a posteriori, \"75% de chance de passar\". O Teorema de Bayes formaliza essa atualização, relacionando P(A|B) com P(B|A):\n\n`P(A|B) = P(B|A) x P(A) / P(B)`\n\nVocê não precisa decorar a fórmula pra entender a ideia central: toda vez que uma evidência nova aparece, ela pode e deve mudar a sua estimativa de probabilidade. Isso vale pra alunos e provas, pra exames médicos (um teste positivo muda a chance de doença) e pra filtros de spam (uma palavra suspeita muda a chance de um email ser spam)."
                    },
                    {
                        "type": "code",
                        "value": "turma = (\n    [{\"estudou\": True, \"passou\": True}] * 45\n    + [{\"estudou\": True, \"passou\": False}] * 15\n    + [{\"estudou\": False, \"passou\": True}] * 10\n    + [{\"estudou\": False, \"passou\": False}] * 30\n)\n\nestudou = [aluno for aluno in turma if aluno[\"estudou\"]]\nestudou_e_passou = [aluno for aluno in estudou if aluno[\"passou\"]]\n\nprobabilidade_condicional = len(estudou_e_passou) / len(estudou)\nprint(probabilidade_condicional)\n# 0.75, o mesmo valor calculado com a tabela: 45 dos 60 que estudaram passaram"
                    },
                    {
                        "type": "quote",
                        "value": "Toda probabilidade condicional responde a uma pergunta específica: dado o que você já sabe, o que muda? P(A|B) e P(B|A) partem dos mesmos dados, mas raramente têm o mesmo valor."
                    }
                ],
                "questions": [
                    {
                        "statement": "A notação P(A|B) representa:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A probabilidade de A acontecer, sabendo que B já aconteceu",
                                "isCorrect": true
                            },
                            {
                                "text": "A probabilidade de A e B acontecerem ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "A probabilidade de A ou B acontecerem, não importa a ordem",
                                "isCorrect": false
                            },
                            {
                                "text": "A probabilidade de B acontecer depois de A ter ocorrido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa turma de 100 alunos, 45 estudaram e passaram, 15 estudaram e não passaram, 10 não estudaram e passaram, e 30 não estudaram e não passaram. Quantos alunos estudaram ao todo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "60, a soma de 45 que passaram com 15 que não passaram",
                                "isCorrect": true
                            },
                            {
                                "text": "55, a soma de todos os alunos que passaram na prova",
                                "isCorrect": false
                            },
                            {
                                "text": "45, considerando só quem estudou e passou",
                                "isCorrect": false
                            },
                            {
                                "text": "100, a soma de todos os alunos da turma inteira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Com os dados da turma (45 estudaram e passaram, 15 estudaram e não passaram, 10 não estudaram e passaram, 30 não estudaram e não passaram), qual é a probabilidade de um aluno ter passado, dado que ele NÃO estudou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "0,25, pois 10 dos 40 que não estudaram passaram",
                                "isCorrect": true
                            },
                            {
                                "text": "0,75, pois é o mesmo valor de quem estudou",
                                "isCorrect": false
                            },
                            {
                                "text": "0,10, pois apenas 10 alunos não estudaram",
                                "isCorrect": false
                            },
                            {
                                "text": "0,40, pois 40 é o total de quem não estudou",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ainda com os dados da turma, qual é a probabilidade de um aluno ter estudado, dado que ele passou na prova?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aproximadamente 0,818, pois 45 dos 55 que passaram estudaram",
                                "isCorrect": true
                            },
                            {
                                "text": "Exatamente 0,75, pois é o mesmo valor de P(passou dado estudou)",
                                "isCorrect": false
                            },
                            {
                                "text": "Aproximadamente 0,45, pois só considera quem estudou e passou",
                                "isCorrect": false
                            },
                            {
                                "text": "Exatamente 0,55, pois é a proporção geral de aprovação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a intuição do Teorema de Bayes, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma evidência nova atualiza a crença inicial sobre a chance do evento",
                                "isCorrect": true
                            },
                            {
                                "text": "A probabilidade de um evento nunca muda, mesmo com evidências novas",
                                "isCorrect": false
                            },
                            {
                                "text": "P(A|B) e P(B|A) são sempre iguais, então evidências não mudam nada",
                                "isCorrect": false
                            },
                            {
                                "text": "O teorema só serve pra calcular probabilidades em exames médicos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Variáveis aleatórias e valor esperado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Variáveis aleatórias: números que dependem do acaso\n\nUma variável aleatória é uma variável que recebe um valor numérico dependendo do resultado de um experimento aleatório. O nome é técnico, mas a ideia é simples: é uma forma de transformar o resultado de um experimento (cara, coroa, um número de dado) num número que dá pra somar, multiplicar e tirar médias.\n\nExemplo: seja X o número que aparece no lançamento de um dado. X pode valer 1, 2, 3, 4, 5 ou 6, cada um com probabilidade 1/6. Isso é uma variável aleatória discreta: ela só assume um conjunto contável de valores possíveis, nesse caso, os 6 números do dado."
                    },
                    {
                        "type": "text",
                        "value": "## Valor esperado: a média ponderada pelas probabilidades\n\nO valor esperado (ou esperança) de uma variável aleatória é a média dos valores possíveis, ponderada pela probabilidade de cada um. A fórmula, pra uma variável discreta, é:\n\n`E(X) = soma de (cada valor x sua probabilidade)`\n\nPro dado, cada um dos 6 valores tem a mesma probabilidade (1/6), então:\n\nE(X) = 1x(1/6) + 2x(1/6) + 3x(1/6) + 4x(1/6) + 5x(1/6) + 6x(1/6) = 21/6 = 3,5\n\nRepare que 3,5 não é um valor que o dado pode assumir: nenhuma face tem esse número. O valor esperado não é \"o resultado mais provável\", é o valor médio que você esperaria ver se repetisse o lançamento muitíssimas vezes e tirasse a média de todos os resultados."
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo prático: vale a pena jogar?\n\nO valor esperado ajuda a responder uma pergunta bem concreta: será que um jogo, aposta ou decisão compensa, em média?\n\nImagine um jogo simples: você paga 5 reais pra jogar um dado. Se sair 6, você ganha 20 reais (lucro de 15 reais, descontando o que pagou). Se sair qualquer outro número, você não ganha nada (prejuízo de 5 reais, o que você pagou pra jogar).\n\n- P(sair 6) = 1/6, resultado: +15 reais\n- P(não sair 6) = 5/6, resultado: -5 reais\n\nE(lucro) = 15 x (1/6) + (-5) x (5/6) = 15/6 - 25/6 = -10/6 ≈ -1,67\n\nEm média, cada rodada desse jogo custa cerca de 1,67 reais pra quem joga. Mesmo que às vezes você ganhe os 15 reais de lucro, no longo prazo, jogar repetidamente tende a deixar o jogador no negativo. É esse tipo de conta que cassinos, seguradoras e jogos de aposta usam a favor deles."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Resultado\", \"Probabilidade\", \"Lucro (R$)\", \"Contribuição pro valor esperado\"], [\"Sair o número 6\", \"1/6\", \"+15\", \"2,5\"], [\"Sair qualquer outro número\", \"5/6\", \"-5\", \"-4,17\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import random\n\nrodadas = 100000\nlucro_total = 0\n\nfor _ in range(rodadas):\n    dado = random.randint(1, 6)\n    if dado == 6:\n        lucro_total += 15\n    else:\n        lucro_total += -5\n\nlucro_medio = lucro_total / rodadas\nprint(lucro_medio)\n# resultado próximo de -1.67: 15 x (1/6) + (-5) x (5/6) calculado à mão"
                    },
                    {
                        "type": "text",
                        "value": "## Da variável aleatória às distribuições e à inferência\n\nCada variável aleatória tem uma distribuição de probabilidade: a lista de todos os valores possíveis junto com suas probabilidades. No dado, a distribuição é simples, os 6 valores com 1/6 de chance cada um (uma distribuição uniforme). Mas variáveis aleatórias também seguem formatos mais complexos, como a curva normal do módulo anterior.\n\nÉ esse conceito, variável aleatória com uma distribuição de probabilidades associada, que sustenta os próximos passos da trilha: amostragem (tirar uma amostra é, no fundo, observar valores de uma variável aleatória) e inferência (usar o que se sabe sobre a distribuição pra tirar conclusões sobre uma população inteira)."
                    },
                    {
                        "type": "quote",
                        "value": "Valor esperado não precisa ser um resultado possível: ele resume a média de longuíssimo prazo, o mesmo padrão que a simulação em Python acabou de confirmar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma variável aleatória é:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um número que depende do resultado de um experimento aleatório",
                                "isCorrect": true
                            },
                            {
                                "text": "Um valor imprevisível, sem nenhum padrão em qualquer situação",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome técnico para qualquer variável usada em estatística",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de medição que aparece em experimentos aleatórios",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o valor esperado do resultado de um lançamento de um dado de 6 faces, não viciado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3,5, média dos valores ponderada por 1/6",
                                "isCorrect": true
                            },
                            {
                                "text": "3, o valor central entre 1 e 6",
                                "isCorrect": false
                            },
                            {
                                "text": "6, o maior valor que pode sair no dado",
                                "isCorrect": false
                            },
                            {
                                "text": "1, o menor valor que pode sair no dado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rifa custa 10 reais o bilhete. São vendidos 100 bilhetes, e o prêmio de 500 reais vai pra um único ganhador sorteado entre eles. Qual é o valor esperado do lucro de quem compra 1 bilhete?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "-5 reais, ganho esperado de 4,90 menos perda esperada de 9,90",
                                "isCorrect": true
                            },
                            {
                                "text": "+490 reais, o prêmio menos o valor pago pelo bilhete",
                                "isCorrect": false
                            },
                            {
                                "text": "-10 reais, o valor pago por quem não ganha o prêmio",
                                "isCorrect": false
                            },
                            {
                                "text": "0 reais, uma rifa é sempre um jogo justo pros participantes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No jogo do dado descrito no texto (paga 5 reais pra jogar, ganha 20 reais se sair 6), o valor esperado de -1,67 reais por rodada significa que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A perda média por rodada tende a esse valor, no longo prazo",
                                "isCorrect": true
                            },
                            {
                                "text": "Você perde exatamente 1,67 reais em toda rodada jogada",
                                "isCorrect": false
                            },
                            {
                                "text": "A probabilidade de perder dinheiro numa rodada é 1,67%",
                                "isCorrect": false
                            },
                            {
                                "text": "O jogo é justo, com o prêmio compensando o valor pago",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O valor esperado do lançamento de um dado é 3,5, mas nenhuma face do dado mostra esse número. Isso acontece porque:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O valor esperado é uma média ponderada, não um resultado possível",
                                "isCorrect": true
                            },
                            {
                                "text": "O cálculo da probabilidade teórica desse dado está incorreto",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado usado no exemplo tem uma face extra, numerada 3,5",
                                "isCorrect": false
                            },
                            {
                                "text": "Só dados viciados produzem um valor esperado não inteiro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Amostragem e o Teorema Central do Limite",
        "aulas": [
            {
                "titulo": "Por que amostrar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que amostrar\n\nImagine que você quer saber a nota média de todos os alunos que fizeram uma prova nacional, a satisfação de todos os clientes de um aplicativo ou a vida útil das lâmpadas que saem de uma fábrica. Em quase todos os casos do mundo real, medir a **população inteira** é caro demais, demorado demais ou simplesmente impossível. É aí que entra a amostragem: escolher uma parte da população para representar o todo."
                    },
                    {
                        "type": "text",
                        "value": "## Quando medir tudo não é uma opção\n\nAlguns motivos fazem a população inteira ficar fora de alcance na prática:\n\n- **Custo e tempo**: entrevistar 200 milhões de pessoas para conhecer uma opinião nacional levaria anos e custaria uma fortuna.\n- **População grande demais ou mudando o tempo todo**: o número de clientes de um aplicativo muda a cada minuto, não dá para \"parar o tempo\" e contar todo mundo de uma vez.\n- **Teste destrutivo**: para saber a vida útil média de um lote de lâmpadas, é preciso usá-las até queimarem. Testar todas as lâmpadas fabricadas significaria não sobrar nenhuma para vender.\n\nPor isso, quase toda conclusão estatística do dia a dia vem de uma amostra, não da população completa."
                    },
                    {
                        "type": "text",
                        "value": "## Amostra representando o todo\n\nRelembrando o Módulo 1: **população** é o grupo inteiro que você quer entender, e **amostra** é a parte que você de fato observa. O valor real da população, quase sempre desconhecido, é o **parâmetro**; o valor calculado a partir da amostra é a **estatística**, uma estimativa do parâmetro.\n\nO objetivo de uma boa amostragem é simples de enunciar e difícil de garantir: a amostra precisa **representar** a população. Uma amostra de 40 pessoas pode estimar bem a opinião de 200 milhões, desde que seja escolhida do jeito certo. Uma amostra de 40 mil pode estimar mal, se for escolhida do jeito errado. Tamanho não é a única coisa que importa, e a próxima aula mostra por quê."
                    },
                    {
                        "type": "code",
                        "value": "import random\nimport statistics\n\nrandom.seed(1)\n# \"população\": altura em cm de 5000 pessoas de uma cidade\npopulacao = [random.gauss(170, 8) for _ in range(5000)]\nmedia_populacao = statistics.mean(populacao)\nprint(f\"{media_populacao:.2f}\")\n# Saída: 170.00\n\n# na prática não dá pra medir todo mundo: tiramos uma amostra de 40 pessoas\namostra = random.sample(populacao, 40)\nmedia_amostra = statistics.mean(amostra)\nprint(f\"{media_amostra:.2f}\")\n# Saída: 171.69 (perto do parâmetro real, mas não idêntico: é uma estimativa)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"População (o todo)\", \"Por que não medir tudo\"], [\"Pesquisa eleitoral\", \"Todos os eleitores aptos a votar no país\", \"Perguntar a cada eleitor levaria meses e custaria muito mais que o valor da informação\"], [\"Controle de qualidade\", \"Todas as peças fabricadas em um lote\", \"Testar a resistência de uma peça pode destruí-la\"], [\"Pesquisa de satisfação\", \"Todos os clientes de um serviço\", \"A base de clientes muda todos os dias, parar para contar todo mundo não é viável\"], [\"Estudo de saúde pública\", \"Todos os habitantes de uma cidade\", \"Examinar cada pessoa individualmente exigiria recursos que o sistema de saúde não tem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Amostrar não é uma segunda opção porque faltou tempo de medir tudo: é o jeito realista de conhecer uma população que, na prática, quase nunca dá para medir por inteiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Módulo 1 você viu os termos população, amostra, parâmetro e estatística. O que é, especificamente, uma população?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O grupo inteiro que se quer estudar ou entender",
                                "isCorrect": true
                            },
                            {
                                "text": "A parte da população que é de fato observada",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor real, geralmente desconhecido, da população",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor calculado a partir dos dados de uma amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um motivo real para usar uma amostra em vez de medir a população inteira?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Testar a vida útil de lâmpadas até queimarem destrói o produto testado",
                                "isCorrect": true
                            },
                            {
                                "text": "Amostras sempre trazem resultados mais exatos que a população inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "A população de um estudo nunca pode ser definida com clareza real",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatísticos preferem trabalhar com números menores para facilitar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa quer saber a renda média de todos os moradores de uma cidade. Entrevistam-se 500 moradores escolhidos ao acaso e calcula-se a média das respostas: R$ 3.200. Esse valor de R$ 3.200 é...",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma estatística, calculada a partir da amostra dos 500 moradores",
                                "isCorrect": true
                            },
                            {
                                "text": "Um parâmetro, porque representa o valor real de toda a cidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma população, porque veio de moradores reais da cidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma amostra, um número obtido a partir das entrevistas feitas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fábrica de baterias quer saber a duração média de uso das baterias que produz. Testar a duração significa usar a bateria até ela descarregar por completo. Qual estratégia faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Testar uma amostra aleatória de baterias do lote e estimar a duração média",
                                "isCorrect": true
                            },
                            {
                                "text": "Testar todas as baterias fabricadas, pois só assim o resultado é confiável",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar apenas as baterias devolvidas por clientes que reclamaram do produto",
                                "isCorrect": false
                            },
                            {
                                "text": "Estimar a duração das baterias a partir do manual, sem testar nada de fato",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa entrevistou 5 milhões de pessoas, mas usou apenas uma lista de assinantes de um serviço caro para escolher quem entrevistar. Por que o tamanho enorme da amostra não garante um resultado confiável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o jeito de escolher a amostra pode enviesá-la, não importa o tamanho",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque amostras acima de um milhão de pessoas são estatisticamente inválidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque quanto maior a amostra, mais ela se afasta da média real da população",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só a população inteira, sem exceção, pode ser considerada confiável",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Amostragem aleatória e vieses",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escolher ao acaso, de verdade\n\nNa aula passada você viu que quase sempre é preciso amostrar. Mas amostrar não é simplesmente pegar um punhado qualquer de dados: o jeito como você escolhe quem entra na amostra decide se ela representa a população ou se ela engana completamente.\n\nO método mais básico e mais importante é a **amostragem aleatória simples**: cada elemento da população tem exatamente a mesma chance de ser sorteado para a amostra, como numa rifa em que todo mundo tem uma papeleta e o sorteio é justo."
                    },
                    {
                        "type": "text",
                        "value": "## Quando a amostra mente\n\nSe o método de escolha favorece sistematicamente um tipo de pessoa ou item, a amostra fica **enviesada**: ela puxa o resultado sistematicamente para um lado, e nenhuma fórmula estatística conserta isso depois de coletados os dados. O problema não é falta de sorte numa amostra específica, é o próprio processo de escolha que está torto.\n\nUm detalhe que confunde muita gente: uma amostra enviesada **grande** não é melhor que uma amostra aleatória **pequena**. Ela só transmite mais confiança para uma conclusão errada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de viés\", \"O que acontece\", \"Exemplo\"], [\"Viés de seleção\", \"O método de escolha favorece certos perfis da população\", \"Pesquisa de opinião feita só com quem tem linha telefônica fixa cadastrada\"], [\"Viés de autosseleção\", \"Só quem decide participar entra na amostra, e quem decide não é representativo\", \"Avaliação de um aplicativo feita só por quem se deu ao trabalho de deixar uma nota\"], [\"Viés de sobrevivência\", \"A amostra só inclui quem chegou ao fim de um processo, ignorando quem não chegou\", \"Estudar hábitos de empresas bem-sucedidas e ignorar as que faliram no caminho\"], [\"Amostra de conveniência\", \"A escolha recai sobre quem está mais fácil de alcançar, não sobre quem representa o todo\", \"Entrevistar só quem passa na porta de uma academia sobre hábitos de exercício\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um clássico: o viés de sobrevivência\n\nDurante a Segunda Guerra Mundial, engenheiros estudaram os aviões que voltavam de missões de combate para decidir onde reforçar a blindagem, observando onde estavam as marcas de tiro. A ideia óbvia seria reforçar exatamente esses pontos.\n\nUm estatístico chamado Abraham Wald discordou: aqueles aviões voltaram, então os tiros que levaram, por mais numerosos que fossem, não foram fatais. Os aviões atingidos nos pontos realmente vitais provavelmente caíram em combate e nunca chegaram a ser contados. A amostra observada (os aviões que voltaram) excluía justamente os casos mais importantes para a pergunta. A recomendação de Wald foi reforçar onde os aviões que voltaram **não** tinham furos, não onde tinham."
                    },
                    {
                        "type": "code",
                        "value": "import random\nimport statistics\n\nrandom.seed(7)\n# população: tempo de espera em minutos de 1000 atendimentos de um call center\ntempos = [random.gauss(8, 2) for _ in range(1000)]\nprint(f\"{statistics.mean(tempos):.2f}\")\n# Saída: 8.05 (parâmetro real da população)\n\n# amostragem aleatória simples: sorteia 50 atendimentos ao acaso\namostra_aleatoria = random.sample(tempos, 50)\nprint(f\"{statistics.mean(amostra_aleatoria):.2f}\")\n# Saída: 8.29 (perto do parâmetro real)\n\n# amostra enviesada: só quem ligou de volta pra reclamar (os que mais esperaram)\ntempos_ordenados = sorted(tempos, reverse=True)\nmais_demorados = tempos_ordenados[:150]\namostra_enviesada = random.sample(mais_demorados, 50)\nprint(f\"{statistics.mean(amostra_enviesada):.2f}\")\n# Saída: 11.10 (bem acima do parâmetro real: a amostra não representa a população)"
                    },
                    {
                        "type": "quote",
                        "value": "Uma amostra enviesada não melhora com o tamanho: ela só erra com mais confiança."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma amostragem aleatória simples?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada elemento da população tem a mesma chance de ser escolhido",
                                "isCorrect": true
                            },
                            {
                                "text": "A amostra é escolhida pelos pesquisadores com base na experiência",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas quem se voluntaria a participar é incluído na amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente os elementos mais fáceis de alcançar entram na amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual situação é um exemplo de viés de autosseleção (voluntário)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma pesquisa em que só respondem os clientes mais insatisfeitos",
                                "isCorrect": true
                            },
                            {
                                "text": "Um sorteio em que todo cliente tem a mesma chance de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma pesquisa que entrevista clientes sorteados de uma lista completa",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma pesquisa que divide os clientes em grupos e sorteia em cada grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site de avaliações mostra nota média 4,8 de 5 para um restaurante, calculada só com base em quem decidiu deixar uma avaliação. Qual é o problema mais provável dessa média?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela pode não representar a população, já que só quem quis avaliar entrou na conta",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela é sempre menor que a real, pois quem avalia online tende a ser mais crítico",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não pode ser chamada de estatística, pois não veio de um sorteio aleatório",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela representa bem a população, já que o número de avaliações é bem grande",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa quer saber a altura média dos alunos de uma escola com 900 alunos. Qual das estratégias abaixo é, de fato, uma amostragem aleatória simples?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sortear 60 números da lista de matrícula dos 900 alunos e medir esses alunos",
                                "isCorrect": true
                            },
                            {
                                "text": "Medir os 60 alunos do time de basquete da escola, que estão sempre disponíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir os 60 primeiros alunos que chegarem à secretaria durante a semana",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir os alunos de uma turma inteira, escolhida por ser fácil de reunir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa nacional com 2 milhões de respostas, coletadas apenas entre assinantes de um serviço premium, chega a um resultado. Uma segunda pesquisa, com 1.000 respostas de uma amostra aleatória de toda a população, chega a outro resultado bem diferente. Qual tende a ser mais confiável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segunda, porque a amostra aleatória evita o viés que o tamanho não corrige",
                                "isCorrect": true
                            },
                            {
                                "text": "A primeira, porque quanto mais respostas, menor é sempre a margem de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas são igualmente confiáveis, já que ambas usaram métodos válidos",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira, porque uma amostra maior sempre representa melhor a população",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Variabilidade amostral",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A mesma pergunta, respostas diferentes\n\nAs duas aulas anteriores trataram de amostragem: por que ela é necessária e como evitar que ela saia enviesada. Mas mesmo uma amostra aleatória perfeita, sem nenhum viés, ainda tem uma característica importante para entender antes de avançar.\n\nImagine repetir o mesmo processo de amostragem aleatória várias vezes na mesma população: sortear, por exemplo, 30 pessoas, calcular a média de alguma coisa, guardar o resultado, e recomeçar do zero com outras 30 pessoas sorteadas. Você esperaria obter exatamente a mesma média todas as vezes?\n\nA resposta é não, e isso não é um erro de ninguém, nem sinal de viés. Cada amostra é um subconjunto diferente da população, então é natural que a estatística calculada em cada uma varie de amostra para amostra. Esse fenômeno tem nome: **variabilidade amostral**."
                    },
                    {
                        "type": "text",
                        "value": "## Um laboratório simples: o dado\n\nPara enxergar a variabilidade amostral sem depender de uma base de dados gigante, um dado de seis faces ajuda bastante. Em um dado honesto, os números de 1 a 6 têm a mesma chance de sair, e a média teórica de infinitas rolagens é 3,5 (a média de 1, 2, 3, 4, 5 e 6).\n\nCada vez que você rola o dado 30 vezes e calcula a média dessas 30 rolagens, está construindo uma amostra de tamanho 30 tirada da população de \"todas as rolagens possíveis de um dado\". Repetir esse processo várias vezes mostra a variabilidade amostral na prática."
                    },
                    {
                        "type": "code",
                        "value": "import random\nimport statistics\n\nrandom.seed(10)\n\n# cada \"amostra\" é o resultado de 30 rolagens de um dado de 6 faces\nfor i in range(5):\n    amostra = [random.randint(1, 6) for _ in range(30)]\n    media = statistics.mean(amostra)\n    print(f\"amostra {i + 1}: media = {media:.2f}\")\n# Saída:\n# amostra 1: media = 3.37\n# amostra 2: media = 3.47\n# amostra 3: media = 3.07\n# amostra 4: media = 3.20\n# amostra 5: media = 3.97"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Amostra\", \"Média calculada\", \"Distância da média real (3,5)\"], [\"Amostra 1\", \"3,37\", \"0,13\"], [\"Amostra 2\", \"3,47\", \"0,03\"], [\"Amostra 3\", \"3,07\", \"0,43\"], [\"Amostra 4\", \"3,20\", \"0,30\"], [\"Amostra 5\", \"3,97\", \"0,47\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Nenhuma das médias está errada\n\nRepare que nenhuma das cinco médias é \"a errada\": todas foram calculadas corretamente a partir de amostras válidas, sorteadas ao acaso da mesma população. A diferença entre elas não é falha de cálculo, é a variabilidade natural que existe sempre que você troca a amostra.\n\nUma pista para as próximas aulas: essa variabilidade não é constante. Amostras pequenas tendem a variar mais de uma para a outra; amostras maiores tendem a produzir médias mais parecidas entre si. O tamanho da amostra afeta o quanto ela oscila, e isso vai ficar mais preciso quando o erro padrão entrar na história."
                    },
                    {
                        "type": "quote",
                        "value": "A média de uma amostra não é um número fixo: é ela mesma uma variável, que muda a cada nova amostra sorteada."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é \"variabilidade amostral\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O fato de a mesma estatística dar valores diferentes em amostras diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "O erro que um pesquisador comete ao calcular a média de uma amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença entre o tamanho de duas amostras coletadas em momentos diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "A variação dos dados dentro de uma única amostra, sem relação com outras",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo do dado usado nesta aula, qual é a média teórica de uma rolagem, considerando infinitas rolagens?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3,5",
                                "isCorrect": true
                            },
                            {
                                "text": "3,0",
                                "isCorrect": false
                            },
                            {
                                "text": "4,0",
                                "isCorrect": false
                            },
                            {
                                "text": "3,3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Cinco estatísticos tiram, cada um, uma amostra aleatória de 30 pessoas da mesma população e calculam a média da altura em cada amostra. Os cinco obtêm médias diferentes: 169,8, 170,4, 168,9, 171,2 e 170,0. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a variabilidade amostral é normal, mesmo vindo da mesma população",
                                "isCorrect": true
                            },
                            {
                                "text": "Que pelo menos quatro dos cinco cometeram erro de cálculo na média",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a população da qual as amostras vieram não é a mesma para todos",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o método de amostragem aleatória usado por eles não é confiável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma amostra de tamanho 5 tem os valores 12, 15, 11, 14 e 13. A média dessa amostra é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "13",
                                "isCorrect": true
                            },
                            {
                                "text": "12",
                                "isCorrect": false
                            },
                            {
                                "text": "14",
                                "isCorrect": false
                            },
                            {
                                "text": "13,5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pesquisador tira uma única amostra de 30 pessoas e calcula a média de idade: 34,2 anos. Ele conclui que a idade média da população é exatamente 34,2 anos. Qual é o problema dessa conclusão, à luz da variabilidade amostral?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A média de uma amostra é uma estimativa, sujeita a variar em outra amostra",
                                "isCorrect": true
                            },
                            {
                                "text": "A amostra de 30 pessoas é pequena demais para qualquer média válida",
                                "isCorrect": false
                            },
                            {
                                "text": "A média só seria válida se usasse números inteiros de idade, não decimais",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda amostra aleatória simples produz sempre a mesma média da população",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A distribuição amostral da média",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## E se você repetir isso mil vezes?\n\nNa aula passada, cinco amostras de 30 rolagens do dado já foram suficientes para ver que a média varia de amostra para amostra. Agora vem a pergunta que constrói o restante do módulo: e se, em vez de cinco amostras, você tirasse **mil** amostras de 30 rolagens cada, e guardasse a média de cada uma?\n\nAo final, você não teria mais uma lista de rolagens de dado: teria uma lista de mil médias. Essa lista de médias também é um conjunto de dados, com sua própria média, seu próprio desvio padrão e sua própria forma. Esse conjunto tem um nome: **distribuição amostral da média**."
                    },
                    {
                        "type": "code",
                        "value": "import random\nimport statistics\n\nrandom.seed(2024)\n\n# rolagens individuais, pra comparar o espalhamento dos dados \"crus\"\nrolagens = [random.randint(1, 6) for _ in range(10000)]\nprint(f\"{statistics.mean(rolagens):.2f}\", f\"{statistics.stdev(rolagens):.2f}\")\n# Saída: 3.51 1.72 (média e desvio padrão das rolagens individuais)\n\n# 1000 amostras de 30 rolagens cada, guardando só a média de cada uma\nmedias_amostrais = []\nfor _ in range(1000):\n    amostra = [random.randint(1, 6) for _ in range(30)]\n    medias_amostrais.append(statistics.mean(amostra))\n\nprint(f\"{statistics.mean(medias_amostrais):.2f}\", f\"{statistics.stdev(medias_amostrais):.2f}\")\n# Saída: 3.49 0.31 (média e desvio padrão das 1000 médias amostrais)\n\nprint(f\"{min(medias_amostrais):.2f}\", f\"{max(medias_amostrais):.2f}\")\n# Saída: 2.63 4.53 (menor e maior média observada entre as 1000 amostras)"
                    },
                    {
                        "type": "text",
                        "value": "## Mais concentrada que os dados originais\n\nRepare no resultado: as rolagens individuais vão de 1 a 6, um intervalo inteiro de 5 pontos, com desvio padrão de 1,72. Já as mil médias amostrais ficaram entre 2,63 e 4,53, um intervalo bem mais estreito, com desvio padrão de apenas 0,31.\n\nEsse é o efeito central da distribuição amostral da média: ela é sempre **mais concentrada** em torno do valor real da população do que os dados originais. Faz sentido pensar no porquê: para a média de 30 rolagens sair muito longe de 3,5, seria preciso que a maioria das 30 rolagens desse jeito também saísse longe da média, o que é raro. A maioria das amostras mistura números altos e baixos, e a média acaba puxada para o meio."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conjunto\", \"Média\", \"Desvio padrão\", \"Mínimo\", \"Máximo\"], [\"Rolagens individuais (10000)\", \"3,51\", \"1,72\", \"1\", \"6\"], [\"Médias de 1000 amostras (n=30)\", \"3,49\", \"0,31\", \"2,63\", \"4,53\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa concentração importa\n\nÉ essa concentração que torna a média de uma amostra útil para estimar a média de uma população. Se as médias amostrais estivessem espalhadas do mesmo jeito que os dados originais, uma única amostra diria muito pouco sobre a população. Como elas se aglomeram perto do valor real, uma média calculada a partir de uma amostra tende a estar razoavelmente perto do parâmetro que você quer conhecer.\n\nFalta ainda uma peça para fechar essa ideia: qual é o **formato** dessa distribuição amostral? A próxima aula responde, e a resposta funciona para praticamente qualquer variável, não só para o exemplo do dado de seis faces."
                    },
                    {
                        "type": "quote",
                        "value": "As médias amostrais não se espalham como os dados originais: elas se aglomeram perto do valor real da população, e é essa concentração que as torna úteis para estimar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a \"distribuição amostral da média\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conjunto formado pelas médias de muitas amostras diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de todos os valores individuais de uma única amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de todas as pessoas que poderiam ser escolhidas para a amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "O intervalo entre o menor e o maior valor observado numa amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparada com os dados originais (rolagens individuais de um dado), o que acontece com a distribuição amostral da média?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela fica mais concentrada em torno do valor real da população",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela fica igualmente espalhada, sem nenhuma mudança perceptível",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela fica mais espalhada, cobrindo um intervalo bem maior de valores",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela deixa de ter qualquer relação com o valor real da população",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na simulação desta aula, as rolagens individuais do dado tiveram desvio padrão de 1,72, enquanto as 1000 médias de amostras de tamanho 30 tiveram desvio padrão de 0,31. O que explica essa diferença?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A média de uma amostra compensa valores altos e baixos, reduzindo o espalhamento",
                                "isCorrect": true
                            },
                            {
                                "text": "O desvio padrão das médias foi calculado com uma fórmula diferente da usual",
                                "isCorrect": false
                            },
                            {
                                "text": "O gerador de números aleatórios do Python favorece valores próximos de 3,5",
                                "isCorrect": false
                            },
                            {
                                "text": "Rolagens individuais têm mais casas decimais, o que aumenta o desvio padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "De acordo com a simulação desta aula, qual foi o intervalo (mínimo e máximo) das 1000 médias amostrais calculadas, com amostras de tamanho 30?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Entre 2,63 e 4,53",
                                "isCorrect": true
                            },
                            {
                                "text": "Entre 1,00 e 6,00",
                                "isCorrect": false
                            },
                            {
                                "text": "Entre 3,00 e 4,00",
                                "isCorrect": false
                            },
                            {
                                "text": "Entre 3,40 e 3,60",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se a mesma simulação fosse repetida, mas cada amostra tivesse tamanho 5 em vez de 30, o que aconteceria com o desvio padrão das médias amostrais, em comparação aos 0,31 observados com amostras de tamanho 30?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ficaria maior, porque amostras menores produzem médias mais variáveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Ficaria menor, porque amostras menores são mais fáceis de repetir igual",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficaria igual, já que o desvio padrão das médias não depende do tamanho",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficaria impossível de calcular, pois amostras de 5 são pequenas demais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O Teorema Central do Limite e o erro padrão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O Teorema Central do Limite\n\nAs aulas anteriores mostraram que a distribuição amostral da média se concentra perto do valor real da população. O Teorema Central do Limite (TCL) completa essa ideia com uma afirmação sobre o **formato** dela: à medida que o tamanho da amostra cresce, a distribuição amostral da média se aproxima de uma **distribuição normal** (a curva em forma de sino do Módulo 3), mesmo que os dados originais não sejam normais.\n\nO exemplo do dado deixa isso concreto: uma rolagem individual segue uma distribuição uniforme, 1, 2, 3, 4, 5 e 6 têm exatamente a mesma chance, sem nenhum formato de sino. Ainda assim, como a tabela a seguir mostra, as médias das 1000 amostras de 30 rolagens simuladas na aula passada já se comportam de um jeito parecido com o sino da normal. Uma referência comum na prática é considerar amostras de pelo menos 30 elementos como grandes o suficiente para essa aproximação funcionar bem, embora dados muito assimétricos possam exigir amostras maiores."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Faixa da média amostral\", \"Quantidade de amostras (de 1000)\"], [\"2,4 a 2,8\", \"10\"], [\"2,8 a 3,1\", \"93\"], [\"3,1 a 3,4\", \"275\"], [\"3,4 a 3,7\", \"367\"], [\"3,7 a 4,0\", \"200\"], [\"4,0 a 4,3\", \"53\"], [\"4,3 a 4,7\", \"2\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O sino aparece nos números\n\nA tabela mostra o clássico formato de sino: poucas amostras com média bem abaixo ou bem acima de 3,5, e a maioria concentrada perto do centro. Repare a simetria aproximada: as duas faixas mais extremas (2,4 a 2,8 e 4,3 a 4,7) têm contagens pequenas e parecidas, enquanto a faixa central (3,4 a 3,7) concentra sozinha 367 das 1000 amostras, mais de um terço do total.\n\nEsse resultado é a base de tudo que vem no Módulo 6. Intervalos de confiança e testes de hipótese partem do princípio de que a distribuição amostral da média segue, ao menos aproximadamente, uma normal. Sem o TCL garantindo esse formato mesmo para dados originais não normais, boa parte da inferência estatística não teria fundamento."
                    },
                    {
                        "type": "text",
                        "value": "## O erro padrão\n\nA distribuição amostral da média tem seu próprio desvio padrão, que mede o quanto as médias amostrais variam de amostra para amostra. Esse desvio padrão específico ganha um nome só dele: **erro padrão**. A fórmula conecta duas coisas que você já conhece, o desvio padrão da população (σ) e o tamanho da amostra (n):\n\nerro padrão = σ / √n\n\nRepare no denominador: conforme n cresce, o erro padrão cai, mas na razão da **raiz quadrada** de n, não de n direto. Na prática isso quer dizer que, para reduzir o erro padrão à metade, não basta dobrar a amostra: é preciso multiplicá-la por 4. Para deixá-lo dez vezes menor, a amostra precisa ficar 100 vezes maior."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\nimport math\n\n# desvio padrão teórico da população (rolagem de um dado honesto de 6 faces)\npopulacao_dado = [1, 2, 3, 4, 5, 6]\nsigma = statistics.pstdev(populacao_dado)\nprint(f\"{sigma:.2f}\")\n# Saída: 1.71\n\nfor n in [10, 30, 100, 1000]:\n    erro_padrao = sigma / math.sqrt(n)\n    print(n, f\"{erro_padrao:.2f}\")\n# Saída:\n# 10 0.54\n# 30 0.31\n# 100 0.17\n# 1000 0.05\n\n# repare: 0.31 é exatamente o desvio padrão das 1000 médias simuladas na aula passada"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tamanho da amostra (n)\", \"Erro padrão aproximado\"], [\"10\", \"0,54\"], [\"30\", \"0,31\"], [\"100\", \"0,17\"], [\"1000\", \"0,05\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Teorema Central do Limite e o erro padrão fecham a ponte entre descrever uma amostra e confiar nela para falar sobre a população inteira: essa ponte é o que o próximo módulo atravessa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o Teorema Central do Limite afirma sobre a distribuição amostral da média?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que ela se aproxima de uma normal conforme a amostra cresce",
                                "isCorrect": true
                            },
                            {
                                "text": "Que ela só existe se os dados originais já forem normais",
                                "isCorrect": false
                            },
                            {
                                "text": "Que ela fica idêntica à distribuição dos dados originais",
                                "isCorrect": false
                            },
                            {
                                "text": "Que ela para de variar assim que a amostra passa de 30",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é o erro padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O desvio padrão que mede a variação da média amostral",
                                "isCorrect": true
                            },
                            {
                                "text": "A diferença entre a maior e a menor observação da amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "A porcentagem de erros de digitação cometidos na coleta",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor da diferença entre a média da amostra e a população",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma população tem desvio padrão σ = 20. Para uma amostra de tamanho n = 100, o erro padrão da média é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2",
                                "isCorrect": true
                            },
                            {
                                "text": "20",
                                "isCorrect": false
                            },
                            {
                                "text": "0,2",
                                "isCorrect": false
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa tem erro padrão de 4 pontos com uma amostra de 25 pessoas. Mantendo o mesmo desvio padrão populacional, para reduzir o erro padrão à metade (2 pontos), o tamanho da amostra precisaria ir para:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "100",
                                "isCorrect": true
                            },
                            {
                                "text": "50",
                                "isCorrect": false
                            },
                            {
                                "text": "12,5",
                                "isCorrect": false
                            },
                            {
                                "text": "625",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados tem uma variável fortemente assimétrica, bem diferente do formato de sino, e precisa usar um método de inferência que pressupõe normalidade. Por que ele ainda pode confiar nesse método, desde que use uma amostra grande?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Teorema Central do Limite aproxima a média amostral de uma normal",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque, a partir de certo tamanho, a amostra deixa de ser assimétrica",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque qualquer variável se torna normal ao ultrapassar 100 elementos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a inferência estatística não depende do formato de distribuição alguma",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Inferência: intervalos de confiança e teste de hipótese",
        "aulas": [
            {
                "titulo": "Estimação: pontual e intervalar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estimação: usando a amostra para estimar a população\n\nNos módulos anteriores você viu a diferença entre população e amostra, e acompanhou o Teorema Central do Limite mostrar que a média de amostras se comporta de um jeito previsível. Agora vem a pergunta prática: como usar uma amostra pra dizer algo sobre a população inteira, que você não pode medir de verdade?\n\nEsse processo se chama **estimação**: usar uma estatística calculada na amostra (como a média amostral) pra estimar um parâmetro da população (como a média populacional) que você não conhece diretamente."
                    },
                    {
                        "type": "text",
                        "value": "## Estimativa pontual\n\nA forma mais simples de estimação é a **estimativa pontual**: um único número, calculado a partir da amostra, que serve como seu melhor palpite para o parâmetro da população. Se você quer estimar a média de horas de sono dos alunos de uma faculdade inteira, a média da sua amostra (`statistics.mean()`) é a estimativa pontual mais natural para a média da população.\n\nÉ simples e direta, mas tem uma limitação: um único número não conta a história toda. Ele não diz o quanto esse palpite poderia mudar se você tivesse coletado uma amostra diferente."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\namostra = [6, 7, 7, 8, 6, 8]\nmedia_amostral = statistics.mean(amostra)\n\nprint(media_amostral)  # 7.0"
                    },
                    {
                        "type": "text",
                        "value": "## Amostras diferentes, estimativas diferentes\n\nSe você coletasse outra amostra de alunos, a média dificilmente seria exatamente igual a essa. Veja o que acontece quando três amostras diferentes são tiradas da mesma população de alunos:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Amostra\", \"Valores (horas de sono)\", \"Média da amostra\"], [\"Amostra 1\", \"6, 7, 7, 8, 6, 8\", \"7,0\"], [\"Amostra 2\", \"7, 8, 9, 6, 7, 8\", \"7,5\"], [\"Amostra 3\", \"5, 6, 7, 6, 8, 7\", \"6,5\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Estimativa intervalar\n\nTrês amostras, três médias diferentes (7,0; 7,5; 6,5), todas vindas da mesma população. Nenhuma está errada: é assim que a amostragem funciona, existe uma variabilidade natural de amostra pra amostra (o mesmo fenômeno que aparece no Teorema Central do Limite).\n\nPor isso, na prática, uma estimativa pontual sozinha costuma vir acompanhada de uma **estimativa intervalar**: em vez de um único número, uma faixa de valores plausíveis para o parâmetro, que já embute essa incerteza. Essa faixa é o **intervalo de confiança**, assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Uma estimativa pontual é o melhor palpite único. Uma estimativa intervalar admite, de forma honesta, que esse palpite tem incerteza, e mostra uma faixa de valores plausíveis em vez de fingir uma precisão que a amostra não garante."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma estimativa pontual?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um único valor da amostra usado como melhor palpite para o parâmetro da população",
                                "isCorrect": true
                            },
                            {
                                "text": "Um intervalo que contém o parâmetro da população com 100% de certeza absoluta",
                                "isCorrect": false
                            },
                            {
                                "text": "A média exata da população inteira, calculada sem nenhuma margem de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico que mostra a distribuição completa dos dados coletados na amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual estatística é normalmente usada como estimativa pontual da média populacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A média calculada a partir dos dados da amostra coletada",
                                "isCorrect": true
                            },
                            {
                                "text": "A moda dos valores observados dentro da amostra coletada",
                                "isCorrect": false
                            },
                            {
                                "text": "O maior valor individual encontrado dentro da amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "O número total de elementos presentes na amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma amostra de 5 provas teve as notas 6, 7, 8, 7, 7. Qual é a estimativa pontual da média da população, com base nessa amostra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7,0",
                                "isCorrect": true
                            },
                            {
                                "text": "7,5",
                                "isCorrect": false
                            },
                            {
                                "text": "6,5",
                                "isCorrect": false
                            },
                            {
                                "text": "8,0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que só uma estimativa pontual costuma ser insuficiente para descrever um parâmetro da população?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque não mostra o quanto a estimativa poderia variar em outra amostra",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o valor calculado na amostra está sempre errado e nunca serve",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque calcular uma média exige uma fórmula bem mais complexa que a moda",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque estimativas pontuais só valem para amostras com mais de mil itens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Três amostras diferentes, tiradas da mesma população de alunos, geraram médias de 7,0, 7,5 e 6,5 horas de sono. O que esse resultado ilustra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A variabilidade amostral: cada amostra muda, e a estimativa pontual muda junto",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de coleta, já que amostras da mesma população deveriam gerar a mesma média",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a população estudada tem, na realidade, três médias diferentes que coexistem",
                                "isCorrect": false
                            },
                            {
                                "text": "Que uma das três amostras não é válida e deveria ser descartada da análise",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Intervalo de confiança: o que 95% significa (e o que não significa)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Uma faixa de valores plausíveis\n\nNa aula passada você viu que uma estimativa pontual sozinha esconde a incerteza da amostragem. O **intervalo de confiança (IC)** resolve isso: em vez de um único número, ele entrega uma faixa de valores plausíveis para o parâmetro da população, construída a partir da amostra."
                    },
                    {
                        "type": "text",
                        "value": "## Construindo o intervalo\n\nA ideia mais comum de intervalo de confiança segue este formato:\n\n**estimativa pontual ± margem de erro**\n\nA margem de erro depende de duas coisas: o erro padrão da estimativa (o quanto a média amostral varia de amostra pra amostra, visto no módulo sobre o Teorema Central do Limite) e um valor crítico ligado ao nível de confiança escolhido. Para 95% de confiança, esse valor crítico é, aproximadamente, **1,96** (um resultado conhecido da distribuição normal padrão).\n\nOu seja: **IC 95% = média amostral ± (1,96 × erro padrão)**"
                    },
                    {
                        "type": "code",
                        "value": "import math\n\nmedia_amostral = 7.0\ndesvio_padrao_amostral = 1.2\nn = 36\n\nerro_padrao = desvio_padrao_amostral / math.sqrt(n)\nmargem_erro = 1.96 * erro_padrao\n\nlimite_inferior = round(media_amostral - margem_erro, 2)\nlimite_superior = round(media_amostral + margem_erro, 2)\n\nprint(round(erro_padrao, 2))              # 0.2\nprint(round(margem_erro, 2))              # 0.39\nprint(limite_inferior, limite_superior)   # 6.61 7.39"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tamanho da amostra (n)\", \"Erro padrão\", \"Margem de erro (95%)\", \"Intervalo de confiança\"], [\"36\", \"0,20\", \"0,39\", \"6,61 a 7,39\"], [\"144\", \"0,10\", \"0,20\", \"6,80 a 7,20\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que \"95% de confiança\" realmente significa\n\nImagine repetir esse processo muitas vezes: coletar uma amostra nova, calcular a média e montar um novo IC de 95%, de novo e de novo, centenas de vezes. Em aproximadamente 95% dessas repetições, o intervalo construído vai conter a verdadeira média da população. Nos outros 5%, por causa da variação natural da amostragem, o intervalo vai ficar fora do alvo.\n\nA confiança de 95% é uma propriedade do **procedimento**, verificada ao longo de muitas repetições, não uma propriedade de um intervalo específico que você calculou uma única vez."
                    },
                    {
                        "type": "quote",
                        "value": "Um IC de 95% não quer dizer que existe 95% de chance de a média da população estar dentro deste intervalo específico, tipo 6,61 a 7,39. Depois de calculado, esse intervalo já contém a média populacional ou não contém: não sobra mais aleatoriedade nele. O que é 95% é a taxa de acerto do método ao longo de muitas amostras, não a chance associada a este resultado já pronto."
                    },
                    {
                        "type": "quote",
                        "value": "Amostra maior deixa o erro padrão menor, e o intervalo mais estreito. Pedir mais confiança (99% em vez de 95%) deixa o intervalo mais largo. Confiança é sobre o método acertar 95% das vezes, não sobre este intervalo ter 95% de chance de estar certo."
                    }
                ],
                "questions": [
                    {
                        "statement": "De forma geral, o que é um intervalo de confiança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma faixa de valores plausíveis, construída a partir da amostra, para o parâmetro",
                                "isCorrect": true
                            },
                            {
                                "text": "Um intervalo que abrange, com certeza absoluta, todos os valores da população",
                                "isCorrect": false
                            },
                            {
                                "text": "A distância entre o menor e o maior valor observado dentro da amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste estatístico que decide, de forma definitiva, se a hipótese é falsa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na fórmula estimativa ± margem de erro, qual é o papel da margem de erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Definir o quanto o intervalo se estende para cima e para baixo da estimativa",
                                "isCorrect": true
                            },
                            {
                                "text": "Corrigir erros de digitação que aconteceram na coleta dos dados da amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar artificialmente o tamanho da amostra usada para calcular a média",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir por completo a necessidade de calcular o desvio padrão amostral",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Repetindo a coleta de amostras e calculando um IC de 95% em cada uma, o que se espera no longo prazo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que aproximadamente 95% desses intervalos contenham o verdadeiro parâmetro",
                                "isCorrect": true
                            },
                            {
                                "text": "Que 100% desses intervalos contenham exatamente o mesmo valor médio calculado",
                                "isCorrect": false
                            },
                            {
                                "text": "Que aproximadamente 95% das amostras coletadas sejam idênticas entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o parâmetro da população mude de valor a cada nova amostra coletada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma amostra tem média 50 e erro padrão 3. Usando 1,96 como valor crítico de 95% de confiança, qual é o intervalo de confiança aproximado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "44,1 a 55,9",
                                "isCorrect": true
                            },
                            {
                                "text": "47,0 a 53,0",
                                "isCorrect": false
                            },
                            {
                                "text": "48,0 a 52,0",
                                "isCorrect": false
                            },
                            {
                                "text": "42,3 a 57,7",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um IC de 95% para a altura média de uma população resultou em 1,68 m a 1,74 m. Qual afirmação sobre esse intervalo específico está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O método acerta 95% das vezes; não dá pra dizer que há 95% de chance de a média estar aqui",
                                "isCorrect": true
                            },
                            {
                                "text": "Existe exatamente 95% de chance de a média real da população estar entre 1,68 m e 1,74 m",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 95% de todas as pessoas da população têm altura entre 1,68 m e 1,74 m",
                                "isCorrect": false
                            },
                            {
                                "text": "O intervalo está errado, pois um IC nunca deveria depender do tamanho da amostra",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Teste de hipótese: hipótese nula e alternativa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Testando uma afirmação sobre a população\n\nAté agora você estimou parâmetros. Agora entra outro tipo de pergunta, tão comum em ciência de dados quanto estimar: será que uma afirmação sobre a população é sustentada pelos dados? \"Uma nova técnica de estudo aumenta a nota média dos alunos?\" \"Um novo remédio funciona melhor que o antigo?\" \"Essa moeda é honesta?\"\n\nPra responder isso de um jeito rigoroso, e não só no olhômetro, existe um procedimento formal: o **teste de hipótese**."
                    },
                    {
                        "type": "text",
                        "value": "## Hipótese nula (H0) e hipótese alternativa (H1)\n\nTodo teste de hipótese começa com duas afirmações que se opõem:\n\n- **Hipótese nula (H0):** o status quo, a afirmação de que não há efeito, não há diferença, nada de novo aconteceu. É o que se assume verdadeiro até que os dados mostrem o contrário.\n- **Hipótese alternativa (H1):** a afirmação que contraria H0, geralmente o que o pesquisador quer investigar.\n\nNo exemplo da técnica de estudo, com a média histórica de notas em 7,0: H0 diz que a técnica nova não muda a média (continua 7,0); H1 diz que a técnica muda a média (é diferente de 7,0)."
                    },
                    {
                        "type": "text",
                        "value": "## A lógica do teste\n\nO teste de hipótese funciona de um jeito parecido com a presunção de inocência: assume-se H0 verdadeira desde o início. Depois, coleta-se uma amostra e verifica-se se os dados são incompatíveis o bastante com H0 pra justificar rejeitá-la.\n\nUm detalhe importante: o teste nunca prova que H0 é verdadeira. Ou os dados dão evidência forte o bastante contra H0 (e ela é rejeitada), ou não dão (e H0 simplesmente não é rejeitada, por falta de provas contrárias, não porque foi confirmada)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Hipótese nula (H0)\", \"Hipótese alternativa (H1)\"], [\"Nova técnica de estudo\", \"A técnica não muda a nota média dos alunos\", \"A técnica muda a nota média dos alunos\"], [\"Novo remédio\", \"O remédio não tem efeito além do placebo\", \"O remédio tem efeito além do placebo\"], [\"Moeda suspeita\", \"A moeda é honesta (50% cara, 50% coroa)\", \"A moeda é viciada (não é 50/50)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\nmedia_h0 = 7.0\namostra_nova_tecnica = [7.5, 8.0, 7.2, 7.8, 7.6, 8.1]\n\nmedia_amostra = statistics.mean(amostra_nova_tecnica)\ndiferenca = round(media_amostra - media_h0, 2)\n\nprint(media_amostra)   # 7.7\nprint(diferenca)       # 0.7"
                    },
                    {
                        "type": "text",
                        "value": "## Teste bicaudal ou unicaudal\n\nH1 pode ser **bicaudal**, testando se a média é diferente pra mais ou pra menos (H1: a média é diferente de 7,0), ou **unicaudal**, testando uma direção específica (H1: a média é maior que 7,0). A pergunta de pesquisa é que define qual usar: se você só quer saber se a técnica aumenta a nota, faz sentido um teste unicaudal; se qualquer mudança importa, o bicaudal é mais apropriado.\n\nO jeito de calcular o resultado muda um pouco entre os dois casos, e isso fica pra um estudo mais avançado, mas a lógica de H0 e H1 é sempre a mesma."
                    },
                    {
                        "type": "quote",
                        "value": "Um teste de hipótese nunca prova que H0 é verdadeira. Os dados ou dão evidência forte o bastante pra rejeitar H0, ou não dão, e H0 continua de pé por falta de provas contrárias, não porque foi comprovada."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a hipótese nula (H0) em um teste de hipótese?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A hipótese do status quo, que afirma não haver efeito ou diferença",
                                "isCorrect": true
                            },
                            {
                                "text": "A hipótese que o pesquisador está tentando comprovar no estudo",
                                "isCorrect": false
                            },
                            {
                                "text": "A média exata da amostra, calculada antes do teste começar",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado final do teste, obtido após toda a análise estatística",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a lógica geral de um teste de hipótese?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Assume-se H0 verdadeira e vê-se se os dados a contradizem o bastante",
                                "isCorrect": true
                            },
                            {
                                "text": "Assume-se H1 verdadeira e busca-se qualquer dado que confirme isso",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcula-se a média da população inteira e compara-se com a amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "Testam-se H0 e H1 juntas até uma das duas ser provada verdadeira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa testa se um novo layout de site aumenta a taxa de conversão, hoje em 3%. Quais são H0 e H1?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "H0: a conversão continua 3%; H1: a conversão é diferente de 3%",
                                "isCorrect": true
                            },
                            {
                                "text": "H0: a conversão é diferente de 3%; H1: a conversão continua 3%",
                                "isCorrect": false
                            },
                            {
                                "text": "H0: o novo layout é melhor; H1: o novo layout é pior que o antigo",
                                "isCorrect": false
                            },
                            {
                                "text": "H0: a amostra é representativa; H1: a amostra não é representativa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de analisar os dados, um teste não rejeita H0. O que isso significa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não há evidência suficiente pra descartar H0, mas isso não prova H0 verdadeira",
                                "isCorrect": true
                            },
                            {
                                "text": "H0 foi comprovada como verdadeira de forma definitiva pelos dados da amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste foi malfeito e precisa ser refeito com uma amostra maior",
                                "isCorrect": false
                            },
                            {
                                "text": "H1 é automaticamente aceita como verdadeira, já que H0 não foi confirmada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisadora quer testar apenas se uma nova vacina aumenta a proteção em relação à antiga, e não simplesmente se ela muda. Qual par de hipóteses representa isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "H0: a proteção não aumenta; H1: a proteção aumenta (teste unicaudal)",
                                "isCorrect": true
                            },
                            {
                                "text": "H0: a proteção aumenta; H1: a proteção não aumenta (teste unicaudal)",
                                "isCorrect": false
                            },
                            {
                                "text": "H0: a proteção muda; H1: a proteção não muda em nenhuma direção",
                                "isCorrect": false
                            },
                            {
                                "text": "H0: a proteção não muda; H1: a proteção muda, pra mais ou pra menos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "p-valor e nível de significância: a intuição e as armadilhas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do teste à decisão: como medir a evidência\n\nVocê já sabe montar H0 e H1, e sabe que o teste verifica se os dados contradizem H0. Falta a peça que transforma isso em número: o **p-valor**, a ferramenta mais usada (e mais mal interpretada) da estatística inferencial."
                    },
                    {
                        "type": "text",
                        "value": "## O que é o p-valor\n\nO p-valor é a probabilidade de observar um resultado tão extremo quanto o que apareceu na amostra (ou mais extremo ainda), **supondo que H0 seja verdadeira**.\n\nNo exemplo da técnica de estudo: se o teste retornar p-valor = 0,03, isso significa que, se a técnica realmente não tivesse efeito nenhum (H0 verdadeira), a chance de ver uma diferença de notas tão grande quanto a observada, só por acaso da amostragem, seria de 3%.\n\nRepare no detalhe: é uma probabilidade calculada assumindo H0 verdadeira. O p-valor não diz nada sobre a chance de H0 ser verdadeira ou falsa."
                    },
                    {
                        "type": "text",
                        "value": "## Nível de significância e a regra de decisão\n\nAntes de rodar o teste, escolhe-se um **nível de significância (alfa)**, o limite que separa \"raro demais pra ser coincidência\" de \"dentro do esperado por acaso\". A convenção mais comum é **alfa = 0,05** (5%).\n\nA regra de decisão é direta: se o p-valor for menor que alfa, rejeita-se H0 (o resultado é chamado de \"estatisticamente significativo\"); se o p-valor for maior ou igual a alfa, não se rejeita H0."
                    },
                    {
                        "type": "code",
                        "value": "alfa = 0.05\np_valor = 0.03\n\nif p_valor < alfa:\n    decisao = \"rejeita H0 (resultado estatisticamente significativo)\"\nelse:\n    decisao = \"não rejeita H0 (sem evidência suficiente)\"\n\nprint(decisao)  # rejeita H0 (resultado estatisticamente significativo)"
                    },
                    {
                        "type": "quote",
                        "value": "Um p-valor pequeno não prova que H1 é verdadeira, não mede o tamanho ou a importância prática do efeito, e não é a probabilidade de H0 ser verdadeira. Ele só diz: se H0 fosse verdadeira, um resultado como esse (ou mais extremo) seria raro. Nada além disso."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O p-valor É\", \"O p-valor NÃO É\"], [\"A chance de ver um resultado tão extremo quanto o observado, se H0 for verdadeira\", \"A chance de H0 ser verdadeira\"], [\"Uma ferramenta pra decidir, junto com o alfa, se H0 é rejeitada\", \"Uma medida do tamanho ou da importância prática do efeito\"], [\"Sensível ao tamanho da amostra (amostra grande pode gerar p pequeno pra efeito trivial)\", \"Uma prova definitiva de que a hipótese alternativa é verdadeira\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "p-valor pequeno quer dizer \"improvável se H0 for verdadeira\", não \"H1 é verdade\" e não \"o efeito é grande\". Olhe sempre o tamanho do efeito junto com o p-valor antes de comemorar um resultado significativo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o p-valor, de forma geral?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A chance de um resultado tão extremo quanto o observado, se H0 for verdadeira",
                                "isCorrect": true
                            },
                            {
                                "text": "A probabilidade de a hipótese nula H0 ser verdadeira, dado os dados coletados",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho do efeito encontrado, medido na mesma unidade da variável original",
                                "isCorrect": false
                            },
                            {
                                "text": "A margem de erro do intervalo de confiança, calculada com o mesmo nível de alfa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a regra de decisão padrão ao comparar p-valor e alfa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se o p-valor for menor que alfa, rejeita-se H0; caso contrário, não se rejeita",
                                "isCorrect": true
                            },
                            {
                                "text": "Se o p-valor for maior que alfa, rejeita-se H0; caso contrário, aceita-se H0",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o p-valor for igual a alfa, rejeita-se H1 e aceita-se H0 de vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o p-valor for menor que zero, rejeita-se H0; se maior, rejeita-se H1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste usa alfa = 0,05 e obtém p-valor = 0,08. Qual é a decisão correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não rejeitar H0, pois o p-valor ficou acima do nível de significância",
                                "isCorrect": true
                            },
                            {
                                "text": "Rejeitar H0, pois o p-valor ficou próximo o bastante do nível escolhido",
                                "isCorrect": false
                            },
                            {
                                "text": "Rejeitar H1, pois o p-valor comprova que H0 é verdadeira nesse caso",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o alfa até 0,08 para poder rejeitar H0 com os dados já coletados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estudo encontra p-valor = 0,001 ao testar se uma nova técnica de estudo melhora as notas. O que se pode concluir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o resultado seria raro se H0 fosse verdadeira, o que é evidência contra H0",
                                "isCorrect": true
                            },
                            {
                                "text": "Que existe 0,1% de chance de H0 ser verdadeira, dado o resultado do estudo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a técnica nova melhora as notas em uma quantidade grande e relevante",
                                "isCorrect": false
                            },
                            {
                                "text": "Que 99,9% dos alunos que usarem a técnica vão melhorar sua nota na prova",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estudo com uma amostra enorme (1 milhão de pessoas) encontra p-valor = 0,001 para uma diferença de apenas 0,01 ponto entre dois grupos. Qual leitura é mais honesta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É estatisticamente significativo, mas o efeito é pequeno demais pra importar",
                                "isCorrect": true
                            },
                            {
                                "text": "Como o p-valor é bem menor que 0,05, o efeito encontrado é grande e relevante",
                                "isCorrect": false
                            },
                            {
                                "text": "Um p-valor tão baixo prova que a diferença de 0,01 ponto não existe de verdade",
                                "isCorrect": false
                            },
                            {
                                "text": "Amostras grandes tornam o p-valor inválido, então o resultado deve ser ignorado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Erro tipo I e II, e tamanho de efeito",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Todo teste pode errar\n\nUm teste de hipótese trabalha com amostra, não com a população inteira, então sempre existe o risco de a decisão (rejeitar ou não rejeitar H0) estar errada. Existem exatamente dois jeitos de errar, e vale a pena conhecer os dois."
                    },
                    {
                        "type": "text",
                        "value": "## Erro tipo I: o falso positivo\n\n**Erro tipo I** é rejeitar H0 quando ela era, na verdade, verdadeira: enxergar um efeito que não existe. Pense num filtro de spam, em que H0 é \"este e-mail não é spam\". Se o filtro rejeita H0 e marca como spam um e-mail legítimo que você precisava ler, isso é um erro tipo I.\n\nA probabilidade de cometer esse erro é exatamente o **alfa** escolhido pro teste: com alfa = 0,05, você aceita correr 5% de risco de um falso positivo."
                    },
                    {
                        "type": "text",
                        "value": "## Erro tipo II: o falso negativo\n\n**Erro tipo II** é não rejeitar H0 quando ela era, na verdade, falsa: deixar passar um efeito que existe de verdade. No filtro de spam: um e-mail que é spam passa despercebido e cai na caixa de entrada como se fosse legítimo.\n\nA probabilidade desse erro é chamada de **beta**. A chance de o teste detectar corretamente um efeito real, quando ele existe, é conhecida como poder do teste (1 menos beta)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"H0 verdadeira, na realidade\", \"H0 falsa, na realidade\"], [\"Teste rejeita H0\", \"Erro tipo I (falso positivo)\", \"Decisão correta\"], [\"Teste não rejeita H0\", \"Decisão correta\", \"Erro tipo II (falso negativo)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off entre os dois erros\n\nDiminuir alfa (exigir um p-valor menor pra rejeitar H0) reduz o risco de erro tipo I, mas tende a aumentar o risco de erro tipo II: um filtro de spam mais rigoroso comete menos falsos positivos, porém deixa passar mais spam de verdade. Não dá pra reduzir os dois riscos ao mesmo tempo sem coletar mais dados; a escolha de alfa reflete qual erro é mais caro no seu contexto."
                    },
                    {
                        "type": "text",
                        "value": "## Significância estatística não é importância prática\n\nRetomando o exemplo da aula anterior: um resultado pode ser estatisticamente significativo (p-valor baixo) e, mesmo assim, ter um efeito pequeno demais pra importar na prática. Amostras grandes detectam até diferenças triviais.\n\nPor isso, além do p-valor, vale sempre perguntar pelo **tamanho de efeito**: qual é o tamanho real da diferença, e ela é grande o bastante pra importar na decisão que você vai tomar? Significância estatística responde se o efeito provavelmente é real; tamanho de efeito responde se esse efeito é relevante."
                    },
                    {
                        "type": "quote",
                        "value": "Significância estatística e importância prática são perguntas diferentes. Uma técnica de estudo pode ser estatisticamente significativa e melhorar a nota em 0,01 ponto, o que não justifica mudar nada. Pergunte sempre as duas coisas: isso é real? E isso importa?"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é erro tipo I em um teste de hipótese?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rejeitar H0 quando ela era, na verdade, verdadeira (falso positivo)",
                                "isCorrect": true
                            },
                            {
                                "text": "Não rejeitar H0 quando ela era, na verdade, falsa (falso negativo)",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular o p-valor de forma errada durante a análise dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher um tamanho de amostra menor do que o recomendado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é erro tipo II em um teste de hipótese?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não rejeitar H0 quando ela era, na verdade, falsa (falso negativo)",
                                "isCorrect": true
                            },
                            {
                                "text": "Rejeitar H0 quando ela era, na verdade, verdadeira (falso positivo)",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher um nível de significância alfa maior do que o usual",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a média da amostra usando uma fórmula que não é a correta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um filtro de spam marca como spam um e-mail importante que não era spam. Que tipo de erro é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Erro tipo I, porque rejeitou H0 (\"não é spam\") sendo que H0 era verdadeira",
                                "isCorrect": true
                            },
                            {
                                "text": "Erro tipo II, porque deixou passar um e-mail que precisava ser bloqueado",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é um erro estatístico, é apenas uma falha de programação do filtro",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro tipo I, porque não rejeitou H0 mesmo com evidências fortes contra ela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se um pesquisador diminui o alfa de 0,05 para 0,01, o que tende a acontecer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O risco de erro tipo I cai, mas o risco de erro tipo II tende a aumentar",
                                "isCorrect": true
                            },
                            {
                                "text": "O risco de erro tipo I aumenta, e o risco de erro tipo II aumenta junto",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois riscos, tipo I e tipo II, caem juntos e na mesma proporção",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho do efeito do estudo aumenta automaticamente com o alfa menor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estudo com 500 mil participantes encontra p-valor = 0,002 para uma diferença de 0,5 segundo no carregamento de duas versões de um site. O que isso melhor ilustra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um resultado pode ser estatisticamente significativo com efeito pequeno demais pra importar",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste está errado, já que um p-valor tão baixo exige um efeito necessariamente grande",
                                "isCorrect": false
                            },
                            {
                                "text": "Amostras grandes tornam qualquer hipótese nula automaticamente verdadeira no teste",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença de 0,5 segundo é, sem dúvida, importante para a experiência do usuário",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Correlação, causalidade e o próximo passo",
        "aulas": [
            {
                "titulo": "Relação entre variáveis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Correlação, causalidade e o próximo passo\n\nNos módulos anteriores você aprendeu a resumir uma variável sozinha (média, desvio padrão, distribuição), a lidar com incerteza (probabilidade) e a tirar conclusões sobre uma população a partir de uma amostra (inferência). Falta uma pergunta que aparece o tempo todo no trabalho com dados: como duas variáveis se comportam juntas?\n\nAlunos que estudam mais tiram notas mais altas? Um produto mais caro vende menos unidades? Esse é o assunto deste módulo, o último da trilha: medir a relação entre duas variáveis, entender por que essa relação não prova causa, e dar o primeiro passo em direção a machine learning."
                    },
                    {
                        "type": "text",
                        "value": "## Duas colunas, uma pergunta\n\nAté aqui você trabalhou com uma lista de valores por vez: só as notas, só as alturas. Agora pense em duas listas emparelhadas, lado a lado, onde a posição `i` de cada lista se refere à mesma observação (o mesmo aluno, a mesma cidade, o mesmo dia).\n\nVeja um exemplo pequeno: horas de estudo e nota de cinco alunos numa prova. Cada linha da tabela abaixo é um aluno, com seu par de valores."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aluno\", \"Horas de estudo\", \"Nota (0 a 10)\"], [\"A\", \"2\", \"4\"], [\"B\", \"3\", \"5\"], [\"C\", \"5\", \"6\"], [\"D\", \"6\", \"7\"], [\"E\", \"8\", \"9\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O diagrama de dispersão\n\nA ferramenta clássica pra enxergar essa relação de olho é o **diagrama de dispersão** (scatter plot): cada aluno vira um ponto num gráfico, com as horas de estudo no eixo horizontal e a nota no eixo vertical. Não dá pra desenhar esse gráfico aqui, mas dá pra descrever o padrão: olhando a tabela acima, conforme as horas de estudo sobem, a nota também sobe. Se você imaginar os pontos, eles formam uma nuvem subindo da esquerda pra direita.\n\nMais pra frente, com pandas e uma biblioteca de gráficos, você desenha esse diagrama numa linha de código só. Por enquanto, o olho (e a tabela) já bastam pra notar o padrão."
                    },
                    {
                        "type": "text",
                        "value": "## Direção da relação: positiva, negativa ou nenhuma\n\nQuando duas variáveis se movem juntas, existem três padrões possíveis:\n\n- **Relação positiva**: quando uma sobe, a outra tende a subir também. Horas de estudo e nota, altura e peso, tamanho de uma casa e seu preço.\n- **Relação negativa**: quando uma sobe, a outra tende a descer. Preço de um produto e quantidade vendida, número de faltas e nota final, idade de um carro e seu valor de revenda.\n- **Sem relação aparente**: as variáveis não parecem andar juntas. O tamanho do sapato de um aluno e sua nota em matemática, por exemplo, não têm motivo pra se relacionar.\n\nSó olhar a direção já ajuda, mas é vago: \"sobem juntas\" não diz o quanto. O próximo passo é colocar um número nisso, e é aí que entra a correlação de Pearson, assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Antes de qualquer conta, olhar a direção da relação entre duas variáveis já é o primeiro diagnóstico: elas sobem juntas, uma sobe enquanto a outra desce, ou não parecem ter nada a ver uma com a outra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num diagrama de dispersão que cruza horas de estudo e nota de uma prova, o que cada ponto do gráfico representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O par de valores da mesma observação: horas estudadas e nota",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente a nota do aluno, sem nenhuma relação com as horas",
                                "isCorrect": false
                            },
                            {
                                "text": "A média das notas de toda a turma naquele diagrama",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de alunos que tiraram aquela nota exata",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Conforme o preço de um produto sobe, a quantidade vendida dele tende a cair. Que tipo de relação isso é?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Negativa: as duas variáveis se movem em direções opostas",
                                "isCorrect": true
                            },
                            {
                                "text": "Positiva: as duas variáveis sobem e descem juntas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nula: preço e quantidade vendida não se relacionam",
                                "isCorrect": false
                            },
                            {
                                "text": "Indefinida: só dá pra saber com o valor exato da correlação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa turma, quanto mais aulas um aluno falta, menor tende a ser sua nota final. Se você desenhasse um diagrama de dispersão com faltas no eixo x e nota no eixo y, qual seria o padrão esperado da nuvem de pontos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pontos descendo da esquerda para a direita, indicando relação negativa",
                                "isCorrect": true
                            },
                            {
                                "text": "Pontos subindo da esquerda para a direita, indicando relação positiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Pontos espalhados sem nenhum padrão visível de subida ou descida",
                                "isCorrect": false
                            },
                            {
                                "text": "Pontos formando uma linha reta horizontal, sem variação na nota",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções a seguir é um exemplo de duas variáveis sem relação aparente entre si?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O número do sapato de uma pessoa e sua nota em matemática",
                                "isCorrect": true
                            },
                            {
                                "text": "As horas de estudo de um aluno e sua nota numa prova",
                                "isCorrect": false
                            },
                            {
                                "text": "O preço de um produto e a quantidade que é vendida dele",
                                "isCorrect": false
                            },
                            {
                                "text": "A altura de uma pessoa e o peso aproximado que ela tem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observando um diagrama de dispersão, você percebe que os pontos sobem da esquerda pra direita, mas estão bem espalhados, longe de formar uma reta. O que isso sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tendência positiva, mas fraca, com bastante dispersão dos pontos",
                                "isCorrect": true
                            },
                            {
                                "text": "Tendência negativa, mas fraca, com bastante dispersão dos pontos",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe relação, pois os pontos não formam uma reta perfeita",
                                "isCorrect": false
                            },
                            {
                                "text": "A relação é perfeita, pois os pontos sobem juntos com clareza total",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Correlação de Pearson",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Colocando um número na relação\n\nNa aula passada você olhou a direção de uma relação de olho: sobe junto, desce junto, ou nada aparente. Agora vem a ferramenta que resume força e direção num único número: o **coeficiente de correlação de Pearson**, quase sempre chamado de `r`.\n\n`r` varia sempre entre -1 e 1. O sinal conta a direção (positiva ou negativa) e a distância até 0 conta a força da relação. É um dos números mais usados (e mais mal interpretados) em ciência de dados, então vale entender direito de onde ele vem."
                    },
                    {
                        "type": "text",
                        "value": "## Covariância: a matéria-prima\n\nAntes da correlação existe a **covariância**, que já mede se duas variáveis se movem juntas. A ideia: para cada observação, veja o quanto x está acima ou abaixo da própria média, e o quanto y está acima ou abaixo da própria média. Multiplique as duas distâncias.\n\nSe x e y estão acima da média ao mesmo tempo (ou abaixo ao mesmo tempo), o produto é positivo. Se um está acima enquanto o outro está abaixo, o produto é negativo. A covariância é a média desses produtos.\n\nO problema da covariância pura: sua escala depende da unidade das variáveis. Medir altura em metros ou em centímetros muda o valor da covariância, mesmo que a relação com o peso seja exatamente a mesma. Isso torna difícil comparar a covariância de um par de variáveis com a de outro par. A correlação resolve isso dividindo a covariância pelo produto dos dois desvios padrão, o que \"cancela\" a escala e deixa o resultado sempre entre -1 e 1."
                    },
                    {
                        "type": "code",
                        "value": "horas = [2, 3, 5, 6, 8]\nnota = [4, 5, 6, 7, 9]\n\nimport statistics\n\nmedia_horas = statistics.mean(horas)\nmedia_nota = statistics.mean(nota)\n\n# covariância na mão: média dos produtos dos desvios em torno da média\nn = len(horas)\nsoma_produtos = sum((horas[i] - media_horas) * (nota[i] - media_nota) for i in range(n))\ncovariancia = soma_produtos / (n - 1)\nprint(round(covariancia, 2))\n# Saída: 4.55\n\ndesvio_horas = statistics.stdev(horas)\ndesvio_nota = statistics.stdev(nota)\nr = covariancia / (desvio_horas * desvio_nota)\nprint(round(r, 2))\n# Saída: 0.99\n\n# o mesmo resultado, pronto, com o statistics (Python 3.10 ou mais recente)\nprint(round(statistics.correlation(horas, nota), 2))\n# Saída: 0.99"
                    },
                    {
                        "type": "text",
                        "value": "## O que o sinal e a magnitude dizem\n\nCom `r` calculado, a leitura é direta:\n\n- **Sinal positivo**: as variáveis tendem a subir e descer juntas.\n- **Sinal negativo**: quando uma sobe, a outra tende a descer.\n- **Magnitude perto de 1 ou -1**: relação forte, os pontos ficam próximos de uma reta.\n- **Magnitude perto de 0**: relação linear fraca ou inexistente, os pontos ficam espalhados.\n\nNo exemplo do código acima, `r` deu 0.99: uma correlação positiva muito forte entre horas de estudo e nota, quase uma reta perfeita. Em bases de dados maiores, com milhares de linhas, ferramentas como NumPy e pandas fazem essa mesma conta numa linha só, mas a lógica por trás continua sendo exatamente essa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Valor absoluto de r\", \"Força da relação (referência comum)\"], [\"0.9 a 1.0\", \"Muito forte\"], [\"0.7 a 0.89\", \"Forte\"], [\"0.4 a 0.69\", \"Moderada\"], [\"0.1 a 0.39\", \"Fraca\"], [\"0 a 0.09\", \"Nenhuma ou desprezível\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Correlação só enxerga relação linear\n\nPonto essencial: `r` mede apenas o quanto os pontos se aproximam de uma **reta**. Duas variáveis podem ter uma relação clara e forte, só que em forma de curva, e a correlação de Pearson não captura isso.\n\nExemplo: pense na relação entre a idade de uma pessoa e seu desempenho físico ao longo da vida inteira. O desempenho sobe na juventude e cai na velhice, um formato de arco. Existe relação óbvia, mas como ela não é uma reta, a correlação de Pearson pode dar um valor perto de zero. Por isso vale sempre olhar a distribuição dos dados (ou o diagrama de dispersão), não confiar só no número de `r`."
                    },
                    {
                        "type": "quote",
                        "value": "Correlação é um número entre -1 e 1 que resume o quanto duas variáveis se movem juntas, numa linha reta. Fora disso, o número não enxerga nada."
                    }
                ],
                "questions": [
                    {
                        "statement": "O coeficiente de correlação de Pearson varia em que intervalo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "De -1 a 1",
                                "isCorrect": true
                            },
                            {
                                "text": "De 0 a 1",
                                "isCorrect": false
                            },
                            {
                                "text": "De -100 a 100",
                                "isCorrect": false
                            },
                            {
                                "text": "De -10 a 10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um coeficiente de correlação r = -0.85 indica que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As variáveis têm uma relação linear negativa forte",
                                "isCorrect": true
                            },
                            {
                                "text": "As variáveis têm uma relação linear positiva forte",
                                "isCorrect": false
                            },
                            {
                                "text": "As variáveis têm uma relação linear negativa fraca",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe relação linear entre as variáveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo da aula (horas de estudo e nota), o código calculou a correlação de Pearson entre as duas variáveis. Qual foi, aproximadamente, o valor encontrado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "0.99, uma correlação positiva muito forte",
                                "isCorrect": true
                            },
                            {
                                "text": "0.45, uma correlação positiva moderada",
                                "isCorrect": false
                            },
                            {
                                "text": "-0.99, uma correlação negativa muito forte",
                                "isCorrect": false
                            },
                            {
                                "text": "0.15, uma correlação positiva fraca",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a correlação costuma ser preferida à covariância pura para comparar a força de relações entre pares de variáveis diferentes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A correlação é normalizada e independe da escala das variáveis",
                                "isCorrect": true
                            },
                            {
                                "text": "A covariância nunca consegue assumir valores negativos, só positivos",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação é sempre mais simples de calcular do que a covariância",
                                "isCorrect": false
                            },
                            {
                                "text": "A covariância só pode ser calculada quando a amostra é grande",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pesquisador calcula a correlação de Pearson entre duas variáveis e encontra r próximo de 0. Ele conclui que não existe nenhuma relação entre elas. Esse raciocínio está:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Errado, pois pode existir uma relação forte, só que não linear",
                                "isCorrect": true
                            },
                            {
                                "text": "Certo, pois r próximo de 0 descarta qualquer tipo de relação",
                                "isCorrect": false
                            },
                            {
                                "text": "Errado, pois r próximo de 0 na verdade indica relação perfeita",
                                "isCorrect": false
                            },
                            {
                                "text": "Certo, desde que a amostra usada seja grande o suficiente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Correlação não é causalidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O mantra da estatística\n\nSe você guardar uma frase só desta trilha, que seja essa: **correlação não implica causalidade**. Duas variáveis podem ter uma correlação altíssima sem que uma cause a outra. Isso acontece por pelo menos três motivos diferentes: coincidência estatística, um terceiro fator escondido influenciando as duas, ou a seta de causa e efeito estar apontando pro lado contrário do que se imagina. Vamos ver os três."
                    },
                    {
                        "type": "text",
                        "value": "## Correlação espúria: quando é só coincidência\n\nCom dados suficientes, é possível encontrar pares de variáveis com correlação numérica alta que não têm absolutamente nenhuma relação real entre si, pura coincidência estatística. Esse tipo de achado é chamado de **correlação espúria**.\n\nUm exemplo famoso, catalogado num projeto conhecido justamente por reunir coincidências assim: o número de filmes lançados por um determinado ator em um ano e o número de pessoas que morreram afogadas caindo numa piscina naquele mesmo ano andam juntos, com uma correlação estatisticamente alta, sem que um tenha absolutamente nada a ver com o outro. Achar uma correlação forte é fácil quando se testam muitos pares de variáveis ao acaso; achar uma relação real é outra história."
                    },
                    {
                        "type": "text",
                        "value": "## Variável de confusão: o terceiro fator escondido\n\nUm caso mais traiçoeiro é o da **variável de confusão** (ou fator de confusão): duas variáveis têm correlação real, mas nenhuma causa a outra diretamente. Um terceiro fator, não medido, influencia as duas ao mesmo tempo.\n\nExemplo clássico: venda de sorvete e número de afogamentos sobem juntos ao longo do ano. Comer sorvete não causa afogamento. O que acontece é que o calor do verão aumenta as duas coisas: mais gente compra sorvete e mais gente nada (e corre risco de se afogar). O calor é a variável de confusão escondida atrás da correlação."
                    },
                    {
                        "type": "text",
                        "value": "## Causalidade reversa: qual é a causa e qual é o efeito?\n\nÀs vezes a correlação é real, e até existe causa entre as variáveis, só que a seta aponta pro lado errado do que parece óbvio. Isso é **causalidade reversa**.\n\nExemplo: pesquisas mostram que pessoas fisicamente mais ativas relatam menos sintomas de depressão. É tentador concluir que o exercício reduz a depressão, e pode ser verdade. Mas também pode ser o contrário: sentir-se melhor emocionalmente deixa a pessoa com mais disposição para se exercitar. A correlação sozinha não diz qual seta é a certa, nem se as duas coisas se retroalimentam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"O que acontece\", \"Exemplo\"], [\"Correlação espúria\", \"Duas variáveis relacionadas por pura coincidência estatística, sem nenhum vínculo real\", \"Filmes de um ator e afogamentos em piscinas no mesmo ano\"], [\"Variável de confusão\", \"Um terceiro fator, não medido, influencia as duas variáveis ao mesmo tempo\", \"Venda de sorvete e afogamentos, ambos puxados pelo calor do verão\"], [\"Causalidade reversa\", \"A relação é real, mas a seta de causa e efeito está invertida (ou nos dois sentidos)\", \"Exercício físico e menos sintomas de depressão: quem causa quem?\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que só o experimento controlado prova causa\n\nPra afirmar causa com segurança, a ciência recorre ao **experimento controlado**: divide-se um grupo de pessoas (ou objetos) aleatoriamente em dois grupos, um recebe o tratamento e o outro não (o grupo de controle). A palavra chave é aleatoriamente: sorteando quem vai pra cada grupo, as duas turmas tendem a ficar parecidas em tudo, idade, renda, hábitos, até nos fatores que nem passaram pela cabeça de ninguém medir. A única diferença deliberada entre os grupos é o tratamento.\n\nSe o resultado final for diferente entre os dois grupos, sobra uma explicação plausível: o tratamento. Dados observacionais (aqueles que só registram o que já aconteceu, sem nenhum sorteio de grupos) não têm essa garantia: qualquer fator de confusão pode estar escondido nos dados, sem ser detectado só de olhar a correlação."
                    },
                    {
                        "type": "quote",
                        "value": "Correlação não é causalidade. Repita isso toda vez que um gráfico bonito tentar te convencer do contrário."
                    }
                ],
                "questions": [
                    {
                        "statement": "A frase \"correlação não implica causalidade\" quer dizer que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Duas variáveis correlacionadas nem sempre têm uma causando a outra",
                                "isCorrect": true
                            },
                            {
                                "text": "Duas variáveis nunca podem ter uma relação de causa e efeito",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação sempre é calculada de forma errada quando existe causa",
                                "isCorrect": false
                            },
                            {
                                "text": "Só é possível calcular correlação quando não existe causalidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Vendas de sorvete e casos de afogamento sobem juntos durante o verão. A explicação mais provável é:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um terceiro fator, o calor, aumenta os dois ao mesmo tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Comer sorvete faz a pessoa correr mais risco de se afogar",
                                "isCorrect": false
                            },
                            {
                                "text": "Se afogar faz a pessoa querer comer mais sorvete depois",
                                "isCorrect": false
                            },
                            {
                                "text": "É impossível calcular a correlação nesse tipo de caso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estudo observa que cidades com mais parques têm, em média, população mais saudável. Alguém sugere que isso pode ser porque cidades mais ricas conseguem investir tanto em parques quanto em saúde pública. Esse é um exemplo do quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Variável de confusão: a renda da cidade influencia as duas coisas",
                                "isCorrect": true
                            },
                            {
                                "text": "Causalidade reversa: a saúde da população cria mais parques",
                                "isCorrect": false
                            },
                            {
                                "text": "Correlação espúria: parques e saúde não têm nenhuma relação real",
                                "isCorrect": false
                            },
                            {
                                "text": "Experimento controlado: a renda foi testada de forma aleatória",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pesquisas mostram que pessoas que se exercitam mais relatam menos sintomas de depressão. Por que não dá pra concluir de cara que o exercício é a causa da melhora?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque pode ser o contrário: sentir-se bem leva a se exercitar mais",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o exercício físico nunca influencia o humor de ninguém",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque essa correlação foi calculada de forma matematicamente errada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a depressão não é uma variável possível de ser medida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal motivo pelo qual um experimento controlado (com grupo de controle e atribuição aleatória) consegue estabelecer causa, enquanto dados observacionais não conseguem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A aleatoriedade tende a equilibrar os grupos em tudo, exceto o tratamento",
                                "isCorrect": true
                            },
                            {
                                "text": "O experimento sempre usa uma amostra maior do que qualquer estudo observacional",
                                "isCorrect": false
                            },
                            {
                                "text": "O experimento controlado nunca calcula correlação, apenas médias simples",
                                "isCorrect": false
                            },
                            {
                                "text": "Dados observacionais não podem ser organizados em uma tabela de valores",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Uma noção de regressão linear",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A reta que resume a relação\n\nQuando duas variáveis têm uma relação linear clara, é útil resumir essa relação com uma única reta que passa pelo meio da nuvem de pontos. Essa reta é descrita por dois números: o **intercepto** (`a`), o valor de y quando x é zero, e a **inclinação** (`b`), o quanto y muda para cada unidade que x aumenta. A equação fica `y = a + b * x`.\n\nEncontrar essa reta a partir de um conjunto de dados é o que se chama **regressão linear simples**."
                    },
                    {
                        "type": "text",
                        "value": "## Mínimos quadrados, por cima\n\nExistem infinitas retas possíveis pra desenhar sobre uma nuvem de pontos. A regressão linear escolhe uma só, através de um critério bem definido: para cada ponto, mede a distância vertical entre o valor real de y e o valor que a reta previa (essa distância é chamada de **resíduo**). Depois eleva cada resíduo ao quadrado e soma tudo.\n\nA reta escolhida é a que deixa essa soma dos quadrados dos resíduos a menor possível. Esse método se chama **mínimos quadrados**. Elevar ao quadrado tem dois efeitos: garante que erros positivos e negativos não se cancelem, e pune mais os erros grandes do que os pequenos. Você não vai precisar resolver essa conta na mão, o Python faz isso por você, mas vale entender o critério por trás da reta."
                    },
                    {
                        "type": "code",
                        "value": "import statistics\n\nhoras = [2, 3, 5, 6, 8]\nnota = [4, 5, 6, 7, 9]\n\ninclinacao, intercepto = statistics.linear_regression(horas, nota)\nprint(round(inclinacao, 2), round(intercepto, 2))\n# Saída: 0.8 2.37\n\n# prevendo a nota de quem estudou 7 horas (dentro da faixa observada, de 2 a 8)\nprint(round(inclinacao * 7 + intercepto, 2))\n# Saída: 7.96\n\n# e quem estudasse 10 horas? fora da faixa observada...\nprint(round(inclinacao * 10 + intercepto, 2))\n# Saída: 10.35 (nota acima de 10, impossível numa prova de 0 a 10)"
                    },
                    {
                        "type": "text",
                        "value": "## Prever y a partir de x\n\nCom a inclinação e o intercepto em mãos, a reta serve pra prever a nota de qualquer quantidade de horas estudadas, mesmo uma que não estava na amostra original. Prever dentro da faixa que os dados cobrem (aqui, entre 2 e 8 horas) se chama **interpolar**, e costuma ser razoável.\n\nO código acima também mostra o perigo de **extrapolar**: prever fora da faixa observada. Para 10 horas de estudo, a reta previu nota 10.35, um valor que nem existe numa prova de 0 a 10. A reta descreve bem o comportamento dentro do intervalo observado, mas nada garante que a mesma relação linear continue valendo fora dele."
                    },
                    {
                        "type": "text",
                        "value": "## A ponte pra machine learning\n\nA regressão linear é, literalmente, o primeiro modelo de **machine learning supervisionado** que a maioria das pessoas aprende. O padrão é sempre o mesmo: existem exemplos com entrada conhecida (aqui, as horas de estudo) e saída conhecida (a nota), o modelo ajusta parâmetros (inclinação e intercepto) a partir desses exemplos, e depois usa esses parâmetros pra prever a saída de um caso novo, nunca visto.\n\nModelos mais complexos (árvores de decisão, redes neurais e outros que você vai encontrar numa trilha de Machine Learning) fazem, no fundo, a mesma coisa: ajustam parâmetros a partir de dados pra prever algo. A regressão linear é só a versão mais simples e mais fácil de entender desse processo."
                    },
                    {
                        "type": "quote",
                        "value": "Uma reta ajustada a dados é a forma mais simples de prever o futuro com o passado: dois números, inclinação e intercepto, e um palpite educado sobre um y que você ainda não viu."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa regressão linear simples y = a + b * x, o que o coeficiente b (inclinação) representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O quanto y muda, em média, a cada unidade de aumento em x",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor esperado de y quando x é exatamente igual a zero",
                                "isCorrect": false
                            },
                            {
                                "text": "A força da relação linear entre x e y, medida de -1 a 1",
                                "isCorrect": false
                            },
                            {
                                "text": "O maior valor que a variável y assume na amostra observada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O método dos mínimos quadrados escolhe a reta que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Minimiza a soma dos quadrados das distâncias até a reta",
                                "isCorrect": true
                            },
                            {
                                "text": "Passa exatamente por todos os pontos da amostra, sem exceção",
                                "isCorrect": false
                            },
                            {
                                "text": "Maximiza a soma das distâncias entre os pontos e a reta",
                                "isCorrect": false
                            },
                            {
                                "text": "Divide os pontos em duas metades exatamente iguais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo da aula, a reta ajustada para horas de estudo e nota tinha inclinação aproximada de 0.8 e intercepto de 2.37. Qual a nota prevista para quem estudou 7 horas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aproximadamente 7.96",
                                "isCorrect": true
                            },
                            {
                                "text": "Aproximadamente 5.60",
                                "isCorrect": false
                            },
                            {
                                "text": "Aproximadamente 10.35",
                                "isCorrect": false
                            },
                            {
                                "text": "Aproximadamente 2.37",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo da aula, a reta prevista para quem estudasse 10 horas dava uma nota de 10.35, impossível numa prova de 0 a 10. Isso ilustra o risco de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extrapolar: usar a reta pra prever fora da faixa observada",
                                "isCorrect": true
                            },
                            {
                                "text": "Interpolar: prever um valor de y dentro da faixa observada",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a inclinação da reta de forma matematicamente incorreta",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar mínimos quadrados em uma amostra com menos de dez valores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a regressão linear costuma ser apresentada como o primeiro modelo de machine learning supervisionado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ajusta parâmetros a partir de exemplos pra prever algo novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Calcular a moda de dados categóricos sem nenhum exemplo prévio",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir por completo qualquer cálculo de probabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Provar causalidade sempre que a correlação for razoavelmente forte",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recap e o próximo passo: pandas e machine learning",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Chegou no fim da trilha\n\nVocê começou esta trilha sabendo programar, mas sem nenhuma base de estatística. Ao longo do caminho, aprendeu a resumir dados, entender distribuições, lidar com probabilidade, amostrar direito, inferir com honestidade e, nesta última aula, medir a relação entre duas variáveis sem cair na armadilha de confundir correlação com causa.\n\nAntes de seguir pro próximo passo do roadmap, vale a pena olhar pra trás e ver o caminho inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Módulo\", \"O que você levou dele\"], [\"1\", \"Descritiva x inferencial, população x amostra, tipos de variável\"], [\"2\", \"Média, mediana, moda, variância e desvio padrão\"], [\"3\", \"Distribuições, curva normal, outliers e z-score\"], [\"4\", \"Probabilidade, eventos, condicional e valor esperado\"], [\"5\", \"Amostragem, Teorema Central do Limite e erro padrão\"], [\"6\", \"Intervalo de confiança, teste de hipótese e p-valor\"], [\"7\", \"Correlação, causalidade e uma noção de regressão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O fio condutor\n\nReparou no caminho que essa sequência percorre? A estatística descritiva resume o que você já tem. Probabilidade e distribuições modelam o que ainda não aconteceu. Amostragem e o Teorema Central do Limite justificam generalizar de uma amostra pequena pra um todo maior. Inferência quantifica essa generalização com honestidade, com intervalo e margem, não com certeza absoluta. E correlação e regressão conectam duas variáveis, abrindo espaço pra prever uma a partir da outra.\n\nJunte tudo isso e o caminho é claro: você saiu de \"descrever uma pilha de números\" para \"prever um número que ainda não viu\". Esse é, no fundo, o arco inteiro da ciência de dados."
                    },
                    {
                        "type": "text",
                        "value": "## Próximo passo 1: Análise de Dados com pandas\n\nTudo o que você calculou aqui na mão ou com o módulo `statistics` (média, desvio, correlação) vira uma linha de código sobre uma tabela de verdade com **pandas**. Em vez de duas listas separadas, você vai ter colunas dentro de uma mesma tabela (`DataFrame`), com milhares de linhas, dados reais, sujeira de dado faltando, tipo errado, texto solto no meio.\n\nA trilha de Análise de Dados com pandas, o próximo passo do roadmap, ensina a carregar, limpar, explorar e resumir esses dados no dia a dia real de quem trabalha com dados. Todo o vocabulário desta trilha (média, desvio, distribuição, correlação) reaparece lá, só que aplicado, em código enxuto, sobre dados de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## Próximo passo 2: Machine Learning\n\nA trilha de Machine Learning pega exatamente de onde a aula de regressão parou. Em vez de uma reta simples com uma única variável de entrada, você vai treinar modelos com várias variáveis ao mesmo tempo, capazes de prever tanto números quanto categorias (esse cliente vai cancelar o plano? esse e-mail é spam?).\n\nO vocabulário de amostragem, distribuição e erro que você aprendeu aqui volta lá pra explicar por que um modelo funciona bem numa amostra e mal numa amostra diferente, e por que avaliar um modelo direito é, no fundo, um problema de inferência estatística."
                    },
                    {
                        "type": "text",
                        "value": "## Você agora sabe algo raro: desconfiar dos números\n\nO maior ganho desta trilha não é uma lista de fórmulas decoradas, é a desconfiança treinada: ver uma média e perguntar se não tem outlier puxando ela; ver uma correlação forte e perguntar se a causa já foi provada de verdade; ver \"95% de confiança\" e não confundir com \"95% de chance de estar certo desta vez\"; ver um gráfico chamativo e procurar o eixo antes de acreditar nele.\n\nEssa é a base quantitativa que separa quem usa dado bem de quem usa dado mal, e ela vale tanto pra pandas quanto pra machine learning quanto pra ler uma notícia no jornal."
                    },
                    {
                        "type": "quote",
                        "value": "Você não saiu daqui sabendo todas as fórmulas de cor. Saiu sabendo a pergunta certa pra fazer antes de confiar num número: de onde ele veio, quão grande é a amostra, e o que ele não está dizendo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções resume corretamente a diferença entre estatística descritiva e inferencial, vista lá no Módulo 1 da trilha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Descritiva resume o que você tem; inferencial conclui sobre o todo",
                                "isCorrect": true
                            },
                            {
                                "text": "Descritiva usa Python; inferencial só é possível calcular à mão",
                                "isCorrect": false
                            },
                            {
                                "text": "Descritiva serve só pra números; inferencial só pra categorias",
                                "isCorrect": false
                            },
                            {
                                "text": "Descritiva conclui sobre a população; inferencial resume a amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois desta trilha de Estatística e Probabilidade, qual é o próximo passo sugerido no roadmap de Ciência de Dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A trilha de Análise de Dados com pandas, sobre tabelas reais",
                                "isCorrect": true
                            },
                            {
                                "text": "Voltar do zero pra trilha de Lógica de Programação",
                                "isCorrect": false
                            },
                            {
                                "text": "A trilha de Machine Learning, sem nenhum trabalho com dados antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma: a jornada de Ciência de Dados termina por aqui",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel do Teorema Central do Limite (Módulo 5) na base da inferência estatística (Módulo 6)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz a média de amostras tender ao normal, a base do intervalo de confiança",
                                "isCorrect": true
                            },
                            {
                                "text": "Garante que toda amostra pequena representa a população sem nenhum erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Prova que a média e a mediana de qualquer amostra são sempre exatamente iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina de vez a necessidade de calcular erro padrão num teste de hipótese",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo a aula, no que a trilha de Machine Learning vai além do que você viu na regressão linear simples desta trilha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usa várias variáveis de entrada ao mesmo tempo, e também prevê categorias",
                                "isCorrect": true
                            },
                            {
                                "text": "Abandona por completo o uso de exemplos conhecidos pra treinar o modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca todos os cálculos numéricos por regras escritas manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina a necessidade de qualquer dado de entrada antes de prever",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma reportagem mostra um gráfico e afirma: \"nova droga está associada a 95% de melhora dos pacientes, com forte correlação (r = 0.9) entre uso e cura, prova de que o remédio funciona\". Combinando o que você aprendeu na trilha, qual é o problema mais direto nessa conclusão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Correlação forte, mesmo alta, não prova causa sem experimento controlado",
                                "isCorrect": true
                            },
                            {
                                "text": "Um valor de r = 0.9 é matematicamente impossível de acontecer",
                                "isCorrect": false
                            },
                            {
                                "text": "Correlação só pode ser calculada pra variáveis numéricas, nunca cura",
                                "isCorrect": false
                            },
                            {
                                "text": "95% de melhora significa, por definição, que o remédio é seguro",
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
